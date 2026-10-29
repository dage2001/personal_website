import onml from 'onml';
const round=n=>Math.round(Number(n)*1000)/1000,key=p=>round(p.x)+','+round(p.y),same=(a,b)=>Math.abs(a-b)<.002;
const between=(v,a,b)=>v>=Math.min(a,b)-.002&&v<=Math.max(a,b)+.002;
const on=(p,s)=>same(s.a.x,s.b.x)?same(p.x,s.a.x)&&between(p.y,s.a.y,s.b.y):same(p.y,s.a.y)&&between(p.x,s.a.x,s.b.x);
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

/** A routed net becomes one geometric tree. Only existing wire segments are kept. */
export function simplifyNetGeometry(segments,terminals=[],protectedSegments=[]) {
  const points=new Map(),protectedPoints=new Set(),protectedKeys=new Set();
  const add=p=>{const q={x:round(p.x),y:round(p.y)};points.set(key(q),q);return key(q);};
  for(const s of segments){add(s.a);add(s.b);}
  const terminalKeys=terminals.map(add);
  for(const s of protectedSegments){protectedPoints.add(add(s.a));protectedPoints.add(add(s.b));protectedKeys.add([key(s.a),key(s.b)].sort().join('|'));}
  for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++) {
    const a=segments[i],b=segments[j],av=same(a.a.x,a.b.x),bv=same(b.a.x,b.b.x);if(av===bv)continue;
    const v=av?a:b,h=av?b:a,p={x:v.a.x,y:h.a.y};if(on(p,v)&&on(p,h))add(p);
  }
  const atomic=new Map();
  for(const s of segments) {
    const ps=[...points.values()].filter(p=>on(p,s)).sort((a,b)=>a.x-b.x||a.y-b.y);
    for(let i=1;i<ps.length;i++){const a=key(ps[i-1]),b=key(ps[i]);if(a!==b)atomic.set([a,b].sort().join('|'),{a,b,length:distance(ps[i-1],ps[i])});}
  }
  const parent=new Map([...points.keys()].map(k=>[k,k])),find=id=>{let root=id;while(parent.get(root)!==root)root=parent.get(root);while(id!==root){const next=parent.get(id);parent.set(id,root);id=next;}return root;};
  const protectedEdge=e=>protectedKeys.has([e.a,e.b].sort().join('|'))||protectedSegments.some(s=>on(points.get(e.a),s)&&on(points.get(e.b),s));
  const edges=[...atomic.entries()].sort(([ak,a],[bk,b])=>Number(protectedEdge(b))-Number(protectedEdge(a))||a.length-b.length||ak.localeCompare(bk)),adj=new Map([...points.keys()].map(k=>[k,new Set()]));let cyclesRemoved=0;
  for(const [,e]of edges){const a=find(e.a),b=find(e.b);if(a===b){cyclesRemoved++;continue;}parent.set(a,b);adj.get(e.a).add(e.b);adj.get(e.b).add(e.a);}
  if(terminalKeys.length>1&&terminalKeys.some(k=>find(k)!==find(terminalKeys[0])))throw Error('Geometric net cleanup found disconnected terminals.');
  const pinned=new Set([...terminalKeys,...protectedPoints]),queue=[...adj].filter(([k,v])=>v.size===1&&!pinned.has(k)).map(([k])=>k);let leavesRemoved=0;
  while(queue.length){const a=queue.pop();if(pinned.has(a)||adj.get(a).size!==1)continue;const b=[...adj.get(a)][0];adj.get(a).clear();adj.get(b).delete(a);leavesRemoved++;if(adj.get(b).size===1&&!pinned.has(b))queue.push(b);}
  // Preserve terminals and the ground attachment boundary when merging straight runs.
  for(const [k,neighbors]of adj)if(neighbors.size===2&&!pinned.has(k)) {
    const [a,b]=[...neighbors],p=points.get(a),q=points.get(k),r=points.get(b);
    if(same(p.x,q.x)&&same(q.x,r.x)||same(p.y,q.y)&&same(q.y,r.y)){adj.get(a).delete(k);adj.get(b).delete(k);adj.get(a).add(b);adj.get(b).add(a);neighbors.clear();}
  }
  const output=[],seen=new Set();for(const [a,neighbors]of adj)for(const b of neighbors){const id=[a,b].sort().join('|');if(seen.has(id))continue;seen.add(id);output.push({a:points.get(a),b:points.get(b)});}
  return {segments:output,junctions:[...adj].filter(([,v])=>v.size>=3).map(([k])=>points.get(k)),cyclesRemoved,leavesRemoved,wireLength:output.reduce((n,s)=>n+distance(s.a,s.b),0)};
}

export function normalizeSvgNets(source,netlist) {
  const ast=onml.parse(source),nets=new Map(),terminalMap=new Map(),cells=netlist.modules.circuit.cells;
  for(const g of ast.filter(n=>Array.isArray(n)&&n[0]==='g')) {
    const id=g[1].id?.slice(5),cell=cells[id],m=g[1].transform?.match(/translate\(([^,]+),([^\)]+)\)/);if(!cell||!m)continue;
    for(const p of g.filter(n=>Array.isArray(n)&&n[1]?.['s:pid']!==undefined)) {
      const bit=cell.connections[p[1]['s:pid']]?.[0];if(bit===undefined)continue;
      if(!terminalMap.has('net_'+bit))terminalMap.set('net_'+bit,[]);terminalMap.get('net_'+bit).push({x:+m[1]+Number(p[1]['s:x']),y:+m[2]+Number(p[1]['s:y'])});
    }
  }
  for(const line of ast.filter(n=>Array.isArray(n)&&n[0]==='line'&&n[1].class?.startsWith('net_'))) {
    const a=line[1],s={a:{x:+a.x1,y:+a.y1},b:{x:+a.x2,y:+a.y2},attachment:!!a['data-ground-attachment']};if(distance(s.a,s.b)<.002)continue;
    if(!nets.has(a.class))nets.set(a.class,[]);nets.get(a.class).push(s);
  }
  const output=[];let cyclesRemoved=0,leavesRemoved=0,wireLength=0,segmentCount=0,bendCount=0;
  for(const [id,segments]of nets) {
    const attachments=segments.filter(s=>s.attachment),result=simplifyNetGeometry(segments,terminalMap.get(id)||[],attachments);
    cyclesRemoved+=result.cyclesRemoved;leavesRemoved+=result.leavesRemoved;wireLength+=result.wireLength;segmentCount+=result.segments.length;
    const directions=new Map();for(const s of result.segments)for(const p of [s.a,s.b]){const k=key(p);if(!directions.has(k))directions.set(k,[]);directions.get(k).push(same(s.a.x,s.b.x)?'v':'h');}bendCount+=[...directions.values()].filter(ds=>ds.length===2&&ds[0]!==ds[1]).length;
    for(const s of result.segments) {
      const attachment=attachments.find(a=>[key(a.a),key(a.b)].sort().join('|')===[key(s.a),key(s.b)].sort().join('|'));
      const a=attachment?.a||s.a,b=attachment?.b||s.b;
      output.push(['line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:id,...attachment?{'data-ground-attachment':'true'}:{}}]);
    }
    for(const p of result.junctions)output.push(['circle',{cx:p.x,cy:p.y,r:2,class:id,style:'fill:#000'}]);
  }
  const clean=ast.filter((n,i)=>i<2||!Array.isArray(n)||!['line','circle'].includes(n[0])||!n[1].class?.startsWith('net_'));
  clean.push(...output);
  return {svg:onml.stringify(clean),report:{normalizedNets:nets.size,cyclesRemoved,leavesRemoved,uniqueSegments:segmentCount,uniqueWireLength:wireLength,uniqueBends:bendCount,geometricConnectivityVerified:true}};
}
