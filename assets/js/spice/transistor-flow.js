/** Conventional current direction is useful inside vertical transistor stages. */
export function transistorCurrentRank(cell,pin) {
  const meta=cell?.spiceLayout;if(meta?.kind!=='Q'||!meta.polarity)return null;
  if(meta.currentLimiter||pin==='B')return 2;
  return meta.polarity==='n'?(pin==='E'?0:2):(pin==='C'?0:2);
}

export function currentLimiterTransistors(circuit) {
  const transistors=circuit.components.filter(c=>c.kind==='Q'),emitters=new Map(),pairs=new Set(circuit.components.filter(c=>c.kind==='R').map(c=>Object.values(c.terminals).sort().join('|'))),result=new Set();
  for(const q of transistors){const node=q.terminals.E;if(!emitters.has(node))emitters.set(node,[]);emitters.get(node).push(q);}
  for(const q of transistors){const {B,C,E}=q.terminals;if(B===E||!pairs.has([B,E].sort().join('|')))continue;
    const drivers=emitters.get(B)||[];if(drivers.length>16)continue;
    for(const t of drivers){if(t===q)continue;if(t.terminals.B===C){result.add(q.name);break;}const first=emitters.get(t.terminals.B)||[];if(first.length<=16&&first.some(u=>u!==q&&u!==t&&u.terminals.B===C)){result.add(q.name);break;}}
  }
  return result;
}
