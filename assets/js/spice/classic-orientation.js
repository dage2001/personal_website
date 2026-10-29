import {recognizeTransistorMotifs} from './transistor-motifs.js';
/** Orient passives from recognized structures plus complementary output branches. */
export function classicPassiveOrientations(circuit,nodes,motifs=recognizeTransistorMotifs(circuit,nodes)) {
  const result=new Map(),resistors=circuit.components.filter(c=>c.kind==='R'),transistors=circuit.components.filter(c=>c.kind==='Q'),devices=new Map(circuit.components.map(c=>[c.name,c])),emitters=new Map(),diodes=new Map();
  const terminals=r=>Object.values(r.terminals);
  const vertical=(r,top,reason)=>{if(r)result.set(r.name,{reverse:terminals(r)[0]!==top,reason});};
  for(const q of transistors){
    const {C,B,E}=q.terminals,pnp=q.type.endsWith('pnp'),npn=q.type.endsWith('npn');if(!pnp&&!npn)continue;
    if(!emitters.has(E))emitters.set(E,[]);emitters.get(E).push(q);
    if(C===B&&nodes[E]?.potential!==null&&nodes[E]?.potential!==undefined)diodes.set(C,{potential:nodes[E].potential});
  }
  for(const m of motifs)if(m.kind==='vbe-multiplier'&&m.confidence==='high'){const q=devices.get(m.roles.transistor),pnp=q.type.endsWith('pnp'),upper=devices.get(pnp?m.roles.emitterResistor:m.roles.collectorResistor),lower=devices.get(pnp?m.roles.collectorResistor:m.roles.emitterResistor);vertical(upper,q.terminals[pnp?'E':'C'],'recognized VBE multiplier');vertical(lower,q.terminals.B,'recognized VBE multiplier');}
  for(const r of resistors){const [a,b]=terminals(r),high=diodes.get(a),low=diodes.get(b);if(high&&low&&high.potential!==low.potential)vertical(r,high.potential>low.potential?a:b,'diode-connected bias reference');}
  const shared=new Map();for(const r of resistors){const ns=terminals(r);if(ns.some(n=>nodes[n]?.potential!==null&&nodes[n]?.potential!==undefined))continue;for(const node of ns){if(!shared.has(node))shared.set(node,[]);shared.get(node).push(r);}}
  for(const [node,rs]of shared){if(rs.length>12)continue;for(const a of rs)for(const b of rs){if(a===b)continue;const farA=terminals(a).find(n=>n!==node),farB=terminals(b).find(n=>n!==node),upper=emitters.get(farA)?.find(q=>q.type.endsWith('npn')),lower=emitters.get(farB)?.find(q=>q.type.endsWith('pnp'));if(upper&&lower){vertical(a,farA,'complementary emitter output');vertical(b,node,'complementary emitter output');}}}
  return result;
}
