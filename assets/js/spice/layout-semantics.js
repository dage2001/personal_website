import {structuralValue} from './structural-expression.js';
import {leafDevices} from './flatten.js';

export const layoutRulesVersion = 1;
/** Names are hints in their own scope, never aliases or electrical directions. */
export function namingRole(name) {
  const local=String(name).split('/').at(-1);
  let label;try{label=decodeURIComponent(local);}catch{label=local;}
  if(label==='0')return 'ret';
  return /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(label)?.[1].toLowerCase()||'unknown';
}
const rail=role=>['pwr','ret','bias'].includes(role);

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

export function analyzeLayout(tree,circuit) {
  const dc=dcPotentials(leafDevices(tree.root)),nodes=Object.create(null),cells=Object.create(null);
  for(const n of Object.values(circuit.nodes))nodes[n.name]={role:namingRole(n.name),potential:dc.nodes[n.name]?.known?dc.nodes[n.name].value:null};
  const roleAt=(c,pin,node)=>{
    if(c.block){const formal=c.block.ports.find(p=>p.pin===pin);return formal?.implicit?(node==='0'?'ret':nodes[node].role):namingRole(formal?.name||formal?.label);}
    return c.synthetic?namingRole(c.value):nodes[node].role;
  };
  for(const c of circuit.components) {
    const ports=Object.fromEntries(Object.entries(c.terminals).map(([pin,node])=>[pin,{...nodes[node],role:roleAt(c,pin,node)}]));
    const values=Object.values(ports);
    const horizontal=['R','L','C','D'].includes(c.kind)&&values.length===2&&values.every(p=>!rail(p.role)&&(p.potential===null||p.role!=='unknown'));
    const plus=c.terminals['+'],minus=c.terminals['-'];
    const nonGround=[plus,minus].filter(n=>n&&n!=='0');
    const supply=c.kind==='V'&&nonGround.some(n=>rail(nodes[n]?.role))&&!nonGround.some(n=>['in','out','io','fb'].includes(nodes[n]?.role))&&[plus,minus].every(n=>dc.nodes[n]?.known);
    const referenceNode=plus==='0'?minus:plus;
    cells[c.name]={version:layoutRulesVersion,ports,horizontal,supply:!!supply,voltage:supply?dc.nodes[referenceNode].value:null};
  }
  return {version:layoutRulesVersion,nodes,cells,diagnostics:dc.diagnostics};
}
