import {structuralValue} from './structural-expression.js';
import {leafDevices} from './flatten.js';
import {classicPassiveOrientations} from './classic-orientation.js';
import {currentLimiterTransistors} from './transistor-flow.js';
import {declaredTransistorMotifs,recognizeTransistorMotifs} from './transistor-motifs.js';

export const layoutRulesVersion = 13;
/** Names are hints in their own scope, never aliases or electrical directions. */
export function namingRole(name) {
  const local=String(name).split('/').at(-1);
  let label;try{label=decodeURIComponent(local);}catch{label=local;}
  if(label==='0')return 'ret';
  return /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(label)?.[1].toLowerCase()||'unknown';
}
const rail=role=>['pwr','ret','bias'].includes(role);
const localName=name=>String(name).split('/').at(-1).toLowerCase();
const legacyRail=name=>({vdd:'pwr',vcc:'pwr',vee:'ret',vss:'ret'})[localName(name)]||'unknown';
const interfaceRole=name=>{const role=namingRole(name);return role!=='unknown'?role:({in:'in',input:'in',out:'out',output:'out'})[String(name).toLowerCase()]||legacyRail(name);};

/** Only constant ideal voltage-source equations are evidence, not an operating point. */
export function dcPotentials(devices) {
  const edges=new Map(),diagnostics=[];
  const add=(a,b,delta)=>{if(!edges.has(a))edges.set(a,[]);edges.get(a).push({node:b,delta});};
  for(const c of devices) {
    if(c.kind!=='V')continue;
    try {
      let value=c.value.trim();
      const rser=/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(value);
      if(rser&&Number(structuralValue(rser[1],c.parameters))!==0)continue;
      value=value.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i,'').trim();
      // Reject dynamic, stochastic and other source options, even if a DC field exists.
      if(/\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(value))continue;
      const constant=/^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(value);
      if(!constant)continue;
      const volts=structuralValue(constant[1],c.parameters);
      if(typeof volts!=='number'||!Number.isFinite(volts))continue;
      add(c.terminals['-'],c.terminals['+'],volts);add(c.terminals['+'],c.terminals['-'],-volts);
    }catch{/* Unknown expressions remain unknown. */}
  }
  const result=Object.create(null),visited=new Set();
  for(const start of ['0',...edges.keys()]) {
    if(visited.has(start))continue;
    const values=new Map([[start,0]]),queue=[start];visited.add(start);let conflict=false;
    for(let i=0;i<queue.length;i++)for(const edge of edges.get(queue[i])||[]) {
      const v=values.get(queue[i])+edge.delta;
      if(values.has(edge.node)) {if(Math.abs(values.get(edge.node)-v)>1e-8*Math.max(1,Math.abs(v)))conflict=true;}
      else {values.set(edge.node,v);visited.add(edge.node);queue.push(edge.node);}
    }
    if(conflict)diagnostics.push({severity:'warning',message:'Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used.'});
    for(const [node,value]of values)result[node]={value,reference:start,known:start==='0'&&!conflict,consistent:!conflict};
  }
  return {nodes:result,diagnostics};
}

export function analyzeLayout(tree,circuit,description=null) {
  const dc=dcPotentials(leafDevices(tree.root)),nodes=Object.create(null),cells=Object.create(null);
  for(const n of Object.values(circuit.nodes)) {
    const named=namingRole(n.name),legacy=legacyRail(n.name);
    nodes[n.name]={role:named!=='unknown'?named:legacy,roleSource:named!=='unknown'?'node-name':legacy!=='unknown'?'legacy-rail-name':'unknown',potential:dc.nodes[n.name]?.known?dc.nodes[n.name].value:null};
  }
  const motifs=description?.pairs?.length?declaredTransistorMotifs(circuit,nodes,description.pairs):recognizeTransistorMotifs(circuit,nodes),orientations=classicPassiveOrientations(circuit,nodes,motifs),limiters=currentLimiterTransistors(circuit);
  const roleAt=(c,pin,node)=>{
    const base={role:nodes[node].role,roleSource:nodes[node].roleSource};
    const formal=c.block?.ports.find(p=>p.pin===pin);
    if(formal?.implicit||!c.block&&!c.synthetic)return base;
    const name=c.synthetic?c.value:formal?.name||formal?.label,role=interfaceRole(name);
    if(role!=='unknown')return {role,roleSource:namingRole(name)!=='unknown'?'formal-prefix':'legacy-interface-name'};
    return rail(base.role)?{...base,roleSource:'bound-rail'}:{role:'unknown',roleSource:'unknown'};
  };
  for(const c of circuit.components) {
    const ports=Object.fromEntries(Object.entries(c.terminals).map(([pin,node])=>[pin,{...nodes[node],...roleAt(c,pin,node)}]));
    const values=Object.values(ports);
    const passive=['r_v','spice_br','l_v','c_v','d_v'].includes(c.type);
    const horizontal=passive&&!orientations.has(c.name)&&values.length===2&&values.every(p=>!rail(p.role)&&(p.potential===null||p.role!=='unknown'));
    const plus=c.terminals['+'],minus=c.terminals['-'];
    const nonGround=[plus,minus].filter(n=>n&&n!=='0');
    const supply=c.kind==='V'&&nonGround.some(n=>rail(nodes[n]?.role))&&!nonGround.some(n=>['in','out','io','fb'].includes(nodes[n]?.role))&&[plus,minus].every(n=>dc.nodes[n]?.known);
    const referenceNode=plus==='0'?minus:plus;
    const pinNames=Object.keys(c.terminals),side=p=>!rail(p.role)?'signal':p.potential!==null?(p.potential>0?'high':'low'):p.role==='ret'?'low':'high';
    let reverse=false;
    if(pinNames.length===2) {
      if(c.kind==='V'&&values.every(p=>p.potential!==null))reverse=values[0].potential<values[1].potential;
      else if(c.terminals[pinNames[0]]==='0')reverse=true;
      else if(c.terminals[pinNames[1]]==='0')reverse=false;
      else if(values.every(p=>p.potential!==null))reverse=values[0].potential<values[1].potential;
      else reverse=side(values[0])==='low'||side(values[1])==='high'&&side(values[0])==='signal';
    }
    if(orientations.has(c.name))reverse=orientations.get(c.name).reverse;
    const relative=c.synthetic?'':c.name.startsWith(circuit.focus+'/')?c.name.slice(circuit.focus.length+1):c.name;
    cells[c.name]={version:layoutRulesVersion,kind:c.kind,polarity:c.type.endsWith('pnp')?'p':c.type.endsWith('npn')?'n':null,currentLimiter:limiters.has(c.name),orientationReason:orientations.get(c.name)?.reason||null,owner:relative.includes('/')?relative.slice(0,relative.lastIndexOf('/')):'',passive,source:['V','I','E','F','G','H'].includes(c.kind)||c.kind==='B'&&!passive,ports,horizontal,orientation:horizontal?'horizontal':reverse?'vertical-reversed':'vertical',flexible:pinNames.length===2&&(passive||['V','I','B','F','H'].includes(c.kind)),supply:!!supply,voltage:supply?dc.nodes[referenceNode].value:null};
  }
  return {version:layoutRulesVersion,nodes,cells,motifs,diagnostics:dc.diagnostics};
}
