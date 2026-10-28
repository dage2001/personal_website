/** Compatibility facade over the independent Phase 2 hierarchy pipeline. */
import {parseHierarchy} from './hierarchy-parser.js';
import {elaborateCircuit} from './elaborate.js';
import {flattenCircuit} from './flatten.js';
import {toNetlistsvg} from './layout-adapter.js';
export {tokenize,SUPPORTED} from './primitive-parser.js';
export {parseHierarchy,elaborateCircuit,flattenCircuit,toNetlistsvg};
export function parseCir(source,options) {
  const ir=parseHierarchy(source,options);
  if(ir.diagnostics.some(d=>d.severity==='error'))return {title:ir.title,components:ir.scopes.root.devices,nodes:{},models:{},directives:ir.scopes.root.directives,diagnostics:ir.diagnostics};
  try{return flattenCircuit(elaborateCircuit(ir));}
  catch(error){return {title:ir.title,components:[],nodes:{},models:{},directives:[],diagnostics:error.diagnostics||[{severity:'error',line:0,message:error.message}]};}
}
export function cir2json(source,options) {
  const circuit=parseCir(source,options);
  if(circuit.diagnostics.some(d=>d.severity==='error')){const error=Error('SPICE parsing failed. See error.diagnostics for line numbers.');error.diagnostics=circuit.diagnostics;throw error;}
  return {...toNetlistsvg(circuit),spice:{title:circuit.title,directives:circuit.directives,diagnostics:circuit.diagnostics}};
}
export default cir2json;
