const opt='org.eclipse.elk.';
export function motifPairs(m) {
  return m.kind==='current-mirror'?[[m.roles.reference,...m.roles.outputs]]:m.kind==='differential-pair'?[m.roles.inputs,...m.roles.commonBase?[m.roles.commonBase]:[]]:['darlington-pair','sziklai-pair','cascode-pair'].includes(m.kind)?[[m.roles.driver,m.roles.output]]:m.kind==='push-pull-pair'?[[m.roles.upper,m.roles.lower]]:[];
}

/** Soft ELK preferences on real nodes/edges, without extra boxes or guide wires. */
export function applyMotifPreferences(graph,motifs) {
  const available=new Set(graph.children.map(n=>n.id)),applied=[];
  for(const m of motifs){if(m.confidence!=='high'||!m.transistors.every(id=>available.has(id)))continue;
    const members=new Set(m.members.filter(id=>available.has(id)));if(members.size<2)continue;
    for(const n of graph.children)if(members.has(n.id))n.layoutOptions={...n.layoutOptions,[opt+'priority']:20};
    for(const e of graph.edges){const a=e.source||e.sources?.[0]?.split('.').slice(0,-1).join('.'),b=e.target||e.targets?.[0]?.split('.').slice(0,-1).join('.');if(members.has(a)&&members.has(b))e.layoutOptions={...e.layoutOptions,[opt+'layered.priority.shortness']:25,[opt+'layered.priority.straightness']:25};}
    for(const pair of motifPairs(m)){const slots=graph.children.map((n,i)=>pair.includes(n.id)?i:-1).filter(i=>i>=0);if(slots.length<2)continue;const nodes=pair.map(id=>graph.children.find(n=>n.id===id));graph.children=graph.children.filter(n=>!pair.includes(n.id));graph.children.splice(Math.min(...slots),0,...nodes);}
    applied.push(m.id);
  }
  return applied;
}

export function motifControlChoices(graph,cells,motifs) {
  const byId=new Map(graph.children.map(n=>[n.id,n])),desired=new Map();
  // Differential inputs take precedence over a less specific shared-control hint.
  for(const m of [...motifs].sort((a,b)=>Number(a.kind==='differential-pair')-Number(b.kind==='differential-pair'))){if(m.confidence!=='high')continue;
    const ids=m.kind==='differential-pair'?m.roles.inputs:m.kind==='current-mirror'?[m.roles.reference,...m.roles.outputs]:[];
    if(ids.length!==2||!ids.every(id=>byId.has(id)))continue;
    const [a,b]=ids.map(id=>byId.get(id)).sort((a,b)=>a.x-b.x),outward=m.kind==='differential-pair';desired.set(a.id,outward?'WEST':'EAST');desired.set(b.id,outward?'EAST':'WEST');
  }
  return [...desired].filter(([id,side])=>{const n=byId.get(id),pin=cells[id].spiceLayout.kind==='Q'?'B':'G',p=n.ports.find(p=>p.id===id+'.'+pin);return p&&p.layoutOptions?.[opt+'port.side']!==side;}).map(([id])=>id);
}

/** Geometric structure score is independent of whether preferences were enabled. */
export function measureMotifs(graph,cells,motifs,rowOnly=new Set()) {
  const byId=new Map(graph.children.map(n=>[n.id,n])),measurements=[];let penalty=0;
  const control=n=>{const pin=cells[n.id].spiceLayout.kind==='Q'?'B':'G',p=n.ports.find(p=>p.id===n.id+'.'+pin);return {x:n.x+p.x,y:n.y+p.y};};
  for(const m of motifs){if(m.confidence!=='high'||!['differential-pair','current-mirror'].includes(m.kind))continue;
    for(const pair of motifPairs(m)){if(pair.length<2||!pair.every(id=>byId.has(id)))continue;
      const nodes=pair.map(id=>byId.get(id)).sort((a,b)=>a.x-b.x),ps=nodes.map(control),spread=Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y)),gap=Math.max(0,nodes.at(-1).x-(nodes[0].x+nodes[0].width)-100*(nodes.length-1)),weight=m.kind==='differential-pair'?2:1;
      const interlopers=graph.children.filter(n=>!pair.includes(n.id)&&n.x>nodes[0].x&&n.x<nodes.at(-1).x&&n.y<Math.min(...nodes.map(n=>n.y+n.height))&&n.y+n.height>Math.max(...nodes.map(n=>n.y))).map(n=>n.id);
      const row=rowOnly.has(m.id);penalty+=weight*spread+(row?0:.4*gap+500*interlopers.length);measurements.push({sameRowOnly:row,motif:m.id,kind:m.kind,members:pair,controlSpread:spread,excessGap:row?0:gap,interlopers:row?[]:interlopers});
    }
  }
  return {motifPenalty:penalty,motifMeasurements:measurements};
}

/** Physical box separation for every recognized high-confidence pair, including
 * soft output pairs and cross-region matches. Orientation is measured separately. */
export function measurePairProximity(graph,motifs) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),pairProximity=[];let pairSeparationPenalty=0;
  for(const m of motifs){if(m.confidence!=='high')continue;for(const group of motifPairs(m))for(const other of group.slice(1)){
    const a=nodes.get(group[0]),b=nodes.get(other);if(!a||!b)continue;
    const gap=Math.max(0,a.x-b.x-b.width,b.x-a.x-a.width)+Math.max(0,a.y-b.y-b.height,b.y-a.y-a.height),preferredGap=m.kind==='push-pull-pair'?180:48,excess=Math.max(0,gap-preferredGap);
    pairSeparationPenalty+=excess;pairProximity.push({motif:m.id,kind:m.kind,members:[a.id,b.id],gap,preferredGap,excess});
  }}
  return {pairSeparationPenalty,pairProximity};
}
