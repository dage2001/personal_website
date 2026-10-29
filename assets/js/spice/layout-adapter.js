import {indexNodes,record,nodeName} from './circuit-ir.js';
import {leafDevices,topologySignature} from './flatten.js';
import {analyzeLayout} from './layout-semantics.js';
import {mapTransistorMotifs} from './transistor-motifs.js';
import {bindLayoutDescription} from './layout-description.js';

export function blockInterface(tree,context) {
  const pins=context.ports.map((p,i)=>({pin:'P'+i,name:p.name,label:p.label||p.name,node:p.node,implicit:false}));
  const used=new Set(leafDevices(context).flatMap(c=>Object.values(c.terminals)));
  for(const global of tree.ir.globals) {
    const node=nodeName([],global);
    if(used.has(node)&&!pins.some(p=>p.node===node))pins.push({pin:'G'+pins.length,label:global==='0'?'⏚ 0':'global: '+global,node,implicit:true});
  }
  return pins;
}
export function projectHierarchy(tree,{mode='hierarchical',expanded=new Set(),focus=''}={}) {
  const context=tree.contexts[focus];if(!context)throw Error('Unknown instance: '+focus);
  const components=[],extraNodes=[];
  function visit(current) {
    extraNodes.push(...Object.values(current.nodes),...current.ports.map(p=>p.node));
    // Keep devices and instances in the same source order. A block must not be
    // given a separate placement phase ahead of its surrounding discrete parts.
    const statements=[...current.devices.map(device=>({line:device.line,device})),...current.children.map(child=>({line:child.line,child}))].sort((a,b)=>a.line-b.line);
    for(const entry of statements) {
      if(entry.device) {const c=entry.device;components.push({...c,layoutLabel:[...current.path.slice(context.path.length),c.localName].join('/')});continue;}
      const child=entry.child;
      if(mode==='flat'||expanded.has(child.id)){visit(child);continue;}
      const pins=blockInterface(tree,child),terminals=record();pins.forEach(p=>{terminals[p.pin]=p.node;});
      components.push({name:child.id,kind:'X',type:'spice_subckt',terminals,value:child.definition,raw:child.raw,line:child.line,instanceId:child.id,layoutLabel:child.path.slice(context.path.length).join('/'),block:{definitionId:child.scopeId,ports:pins,parameters:child.params}});
    }
  }
  visit(context);
  for(const [i,p]of context.ports.entries())components.push({name:'@port/'+focus+'/'+i,kind:'PORT',type:'spice_port',terminals:{A:p.node},layoutLabel:p.name,value:p.name,raw:'Interface port '+p.name,synthetic:true});
  if(components.length>1500)throw Error('This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.');
  const models=Object.assign(record(),...Object.values(tree.contexts).map(c=>c.models));
  const circuit={title:focus||tree.ir.title,components,nodes:indexNodes(components,extraNodes),models,diagnostics:tree.ir.diagnostics,mode,focus};
  circuit.topology=auditProjection(tree,circuit);circuit.layout=analyzeLayout(tree,circuit);circuit.layout.description=bindLayoutDescription(tree,circuit);return circuit;
}
export function auditProjection(tree,view) {
  const represented=[],seen=new Set();
  for(const c of view.components) {
    if(c.synthetic)continue;
    if(c.kind==='X') {
      const context=tree.contexts[c.instanceId];if(!context)throw Error('Projection contains an unknown block.');
      const pins=blockInterface(tree,context);
      if(JSON.stringify(Object.entries(c.terminals))!==JSON.stringify(pins.map(p=>[p.pin,p.node])))throw Error('Block interface topology mismatch: '+c.name);
      represented.push(...leafDevices(context));
    }else represented.push(c);
  }
  for(const c of represented){if(seen.has(c.name))throw Error('Projection duplicates '+c.name);seen.add(c.name);}
  const signature=topologySignature(represented),expected=leafDevices(tree.contexts[view.focus]);
  if(signature!==topologySignature(expected))throw Error('Projection lost or changed electrical devices/connections.');
  return {verified:true,leafCount:represented.length,signature};
}
export function toNetlistsvg(circuit) {
  const cells=record(),netnames=record();
  for(const c of circuit.components) {
    const connections=record(),port_directions=record();
    for(const [pin,node]of Object.entries(c.terminals)){connections[pin]=[circuit.nodes[node].bit];port_directions[pin]='input';}
    cells[c.name]={type:c.type,port_directions,connections,parameters:{},attributes:{ref:c.name,displayRef:c.layoutLabel||c.name,value:c.value,spice:c.raw}};
    cells[c.name].spiceLayout=circuit.layout?.cells[c.name];
    if(c.block)cells[c.name].spiceBlock={ports:c.block.ports.map(p=>({pin:p.pin,label:p.label})),definitionId:c.block.definitionId};
    if(c.type==='spice_device'||c.type==='spice_coupling')cells[c.name].spiceSymbol={label:c.symbol||c.kind,ports:Object.keys(c.terminals).map((pin,i)=>({pin,label:c.pinLabels?.[i]||pin})),references:c.coupledInductors?.length?c.coupledInductors:c.controlSources||[]};
  }
  for(const n of Object.values(circuit.nodes))netnames[n.name]={hide_name:0,bits:[n.bit],attributes:{}};
  if(circuit.nodes['0']) {
    let ground='__ground';while(Object.hasOwn(cells,ground))ground+='_';
    cells[ground]={type:'gnd',connections:{A:[circuit.nodes['0'].bit]},port_directions:{A:'input'},attributes:{name:'0'},parameters:{}};
  }
  return {modules:{circuit:{attributes:{top:1},ports:{},cells,netnames,spiceMotifs:mapTransistorMotifs(circuit.layout?.motifs||[],x=>x,n=>circuit.nodes[n].bit),spiceLayoutDescription:circuit.layout?.description||null}}};
}
