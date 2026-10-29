/** Recognize local transistor motifs; names and model-specific IDs are irrelevant. */
export function classicPassiveOrientations(circuit,nodes) {
  const result=new Map(),resistors=circuit.components.filter(c=>c.kind==='R'),transistors=circuit.components.filter(c=>c.kind==='Q'),pairs=new Map(),emitters=new Map(),diodes=new Map();
  const pair=(a,b)=>[a,b].sort().join('|'),terminals=r=>Object.values(r.terminals);
  for(const r of resistors){const ns=terminals(r);if(ns.length===2)pairs.set(pair(...ns),r);}
  const vertical=(r,top,reason)=>{if(r)result.set(r.name,{reverse:terminals(r)[0]!==top,reason});};
  for(const q of transistors){
    const {C,B,E}=q.terminals,pnp=q.type.endsWith('pnp'),npn=q.type.endsWith('npn');if(!pnp&&!npn)continue;
    if(!emitters.has(E))emitters.set(E,[]);emitters.get(E).push(q);
    if(C===B&&nodes[E]?.potential!==null&&nodes[E]?.potential!==undefined)diodes.set(C,{potential:nodes[E].potential});
    const high=pnp?E:C,low=pnp?C:E,upper=pairs.get(pair(high,B)),lower=pairs.get(pair(B,low));
    if(upper&&lower){vertical(upper,high,'transistor bias divider');vertical(lower,B,'transistor bias divider');}
  }
  for(const r of resistors){const [a,b]=terminals(r),high=diodes.get(a),low=diodes.get(b);if(high&&low&&high.potential!==low.potential)vertical(r,high.potential>low.potential?a:b,'diode-connected bias reference');}
  const shared=new Map();for(const r of resistors){const ns=terminals(r);if(ns.some(n=>nodes[n]?.potential!==null&&nodes[n]?.potential!==undefined))continue;for(const node of ns){if(!shared.has(node))shared.set(node,[]);shared.get(node).push(r);}}
  for(const [node,rs]of shared){if(rs.length>12)continue;for(const a of rs)for(const b of rs){if(a===b)continue;const farA=terminals(a).find(n=>n!==node),farB=terminals(b).find(n=>n!==node),upper=emitters.get(farA)?.find(q=>q.type.endsWith('npn')),lower=emitters.get(farB)?.find(q=>q.type.endsWith('pnp'));if(upper&&lower){vertical(a,farA,'complementary emitter output');vertical(b,node,'complementary emitter output');}}}
  return result;
}
