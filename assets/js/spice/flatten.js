import {indexNodes,record} from './circuit-ir.js';
export function leafDevices(context) {return [...context.devices,...context.children.flatMap(leafDevices)];}
export function contextNodes(context){return [...Object.values(context.nodes),...context.ports.map(p=>p.node),...context.children.flatMap(contextNodes)];}
export function flattenCircuit(tree,focus='') {
  const context=tree.contexts[focus];if(!context)throw Error('Unknown instance: '+focus);
  const components=leafDevices(context);
  if(components.length>3000)throw Error('Flattened circuit exceeds 3000 devices.');
  const models=Object.assign(record(),...Object.values(tree.contexts).map(c=>c.models));
  return {title:tree.ir.title,components,nodes:indexNodes(components,contextNodes(context)),models,directives:tree.ir.scopes[context.scopeId].directives,diagnostics:tree.ir.diagnostics};
}
export function topologySignature(devices) {
  return JSON.stringify(devices.map(c=>[c.name,c.kind,Object.entries(c.terminals).sort(),c.value,c.model,c.controlSource,c.controlSources||[],c.coupledInductors||[]]).sort((a,b)=>a[0].localeCompare(b[0])));
}
