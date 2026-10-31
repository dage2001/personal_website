import {simplifyNetGeometry} from './net-geometry.js';
const eps=.002,round=n=>Math.round(n*1000)/1000,key=p=>round(p.x)+','+round(p.y),same=(a,b)=>Math.abs(a-b)<eps;
const length=s=>Math.abs(s.a.x-s.b.x)+Math.abs(s.a.y-s.b.y);
const on=(p,s)=>same(s.a.x,s.b.x)?same(p.x,s.a.x)&&p.y>=Math.min(s.a.y,s.b.y)-eps&&p.y<=Math.max(s.a.y,s.b.y)+eps:same(p.y,s.a.y)&&p.x>=Math.min(s.a.x,s.b.x)-eps&&p.x<=Math.max(s.a.x,s.b.x)+eps;
const contact=(a,b)=>on(a.a,b)||on(a.b,b)||on(b.a,a)||on(b.b,a);
function adjacency(segments){const graph=new Map(),points=new Map();for(const s of segments)for(const [a,b]of [[s.a,s.b],[s.b,s.a]]){const k=key(a);points.set(k,a);if(!graph.has(k))graph.set(k,[]);graph.get(k).push({to:key(b),length:length(s)});}return {graph,points};}
function distances(graph,from){const dist=new Map([[from,0]]),queue=[from];for(let i=0;i<queue.length;i++)for(const e of graph.get(queue[i])||[])if(!dist.has(e.to)){dist.set(e.to,dist.get(queue[i])+e.length);queue.push(e.to);}return dist;}
function bends(segments){const {graph,points}=adjacency(segments);return [...graph].filter(([k,ns])=>ns.length===2&&same(points.get(ns[0].to).x,points.get(k).x)!==same(points.get(ns[1].to).x,points.get(k).x)).length;}
function covered(s,segments){const v=same(s.a.x,s.b.x),lo=v?Math.min(s.a.y,s.b.y):Math.min(s.a.x,s.b.x),hi=v?Math.max(s.a.y,s.b.y):Math.max(s.a.x,s.b.x),intervals=segments.filter(t=>v?same(t.a.x,s.a.x)&&same(t.b.x,s.a.x):same(t.a.y,s.a.y)&&same(t.b.y,s.a.y)).map(t=>v?[Math.min(t.a.y,t.b.y),Math.max(t.a.y,t.b.y)]:[Math.min(t.a.x,t.b.x),Math.max(t.a.x,t.b.x)]).sort((a,b)=>a[0]-b[0]);let end=lo;for(const [a,b]of intervals){if(b<end-eps)continue;if(a>end+eps)break;end=Math.max(end,b);if(end>=hi-eps)return true;}return false;}

/** Preserve straight spines carrying multiple real pins, including new split points. */
function spines(segments,terminals){
  const groups=new Map(),out=[];for(const s of segments){const v=same(s.a.x,s.b.x),fixed=v?s.a.x:s.a.y,k=(v?'v':'h')+round(fixed),a=v?Math.min(s.a.y,s.b.y):Math.min(s.a.x,s.b.x),b=v?Math.max(s.a.y,s.b.y):Math.max(s.a.x,s.b.x);if(!groups.has(k))groups.set(k,[]);groups.get(k).push({a,b,v,fixed});}
  for(const group of groups.values()){group.sort((a,b)=>a.a-b.a);const merged=[];for(const s of group){const last=merged.at(-1);if(last&&s.a<=last.b+eps)last.b=Math.max(last.b,s.b);else merged.push({...s});}for(const s of merged){const segment={a:s.v?{x:s.fixed,y:s.a}:{x:s.a,y:s.fixed},b:s.v?{x:s.fixed,y:s.b}:{x:s.b,y:s.fixed}};if(new Set(terminals.filter(p=>on(p,segment)).map(key)).size>=2)out.push(segment);}}
  return out;
}

/** Local straight shortcuts onto an already routed net, never a replacement router. */
export function shortenNetTrees(nets,allTerminals,boxes=[],protectedByNet=new Map(),{maxCuts=48,preferredSegments=new Map(),preferredPaths=new Map()}={}) {
  const current=new Map(),protectedNets=new Map(),changed=new Set();let cuts=0,saved=0;
  for(const [bit,segs]of nets){const terminals=allTerminals.get(bit)||[],protect=[...protectedByNet.get(bit)||[],...spines(segs,terminals)];protectedNets.set(bit,protect);current.set(bit,simplifyNetGeometry(segs,terminals,protect));}
  const differentPins=bit=>[...allTerminals].filter(([b])=>b!==bit).flatMap(([,ps])=>ps);
  for(const bit of [...current.keys()].sort((a,b)=>Number(preferredSegments.has(b)||preferredPaths.has(b))-Number(preferredSegments.has(a)||preferredPaths.has(a)))){const terminals=allTerminals.get(bit)||[],protect=protectedNets.get(bit),foreignPins=differentPins(bit);
    for(let iteration=0;iteration<12&&cuts<maxCuts;iteration++){
      const tree=current.get(bit),{graph,points}=adjacency(tree.segments),candidates=[...(preferredSegments.get(bit)||[]).map(s=>[s]),...preferredPaths.get(bit)||[]].map(segments=>({segments,gain:Infinity,preferred:true}));
      for(const [from,a]of points){const dist=distances(graph,from);for(const s of tree.segments){const v=same(s.a.x,s.b.x),b=v?{x:s.a.x,y:a.y}:{x:a.x,y:s.a.y},shortcut={a,b},d=length(shortcut);if(d<eps||d>240||!on(b,s))continue;const old=Math.min((dist.get(key(s.a))??Infinity)+Math.abs(s.a.x-b.x)+Math.abs(s.a.y-b.y),(dist.get(key(s.b))??Infinity)+Math.abs(s.b.x-b.x)+Math.abs(s.b.y-b.y)),gain=old-d;if(gain>2)candidates.push({segments:[shortcut],gain});}}
      // Two adjacent elbows separated by a short jog can become one elbow.
      // Endpoints and any real terminals on the old path remain pinned.
      for(const s of tree.segments){const ka=key(s.a),kb=key(s.b),aa=graph.get(ka),bb=graph.get(kb);if(length(s)>24||aa?.length!==2||bb?.length!==2)continue;const a=points.get(aa.find(e=>e.to!==kb).to),b=points.get(bb.find(e=>e.to!==ka).to);if(same(a.x,b.x)||same(a.y,b.y))continue;for(const bend of [{x:a.x,y:b.y},{x:b.x,y:a.y}])candidates.push({segments:[{a,b:bend},{a:bend,b}],gain:8});}
      candidates.sort((a,b)=>b.gain-a.gain);let accepted=false;
      const foreign=[...current].filter(([b])=>b!==bit).flatMap(([,t])=>t.segments);
      const oldBends=bends(tree.segments);
      for(const {segments:add,preferred=false}of candidates.slice(0,32)){
        if(add.some(s=>boxes.some(n=>Math.max(s.a.x,s.b.x)>n.x+.02&&Math.min(s.a.x,s.b.x)<n.x+n.width-.02&&Math.max(s.a.y,s.b.y)>n.y+.02&&Math.min(s.a.y,s.b.y)<n.y+n.height-.02)||foreignPins.some(p=>on(p,s))||foreign.some(f=>contact(s,f))))continue;
        const next=simplifyNetGeometry([...tree.segments,...add],terminals,[...protect,...add]);if(next.wireLength>tree.wireLength+eps||next.wireLength+8*bends(next.segments)>=tree.wireLength+8*oldBends-.01||protect.some(s=>!covered(s,next.segments)))continue;
        if(preferred)protect.push(...add);current.set(bit,next);changed.add(bit);saved+=Math.max(0,tree.wireLength-next.wireLength);cuts++;accepted=true;break;
      }
      if(!accepted)break;
    }
  }
  for(const bit of changed)current.set(bit,simplifyNetGeometry(current.get(bit).segments,allTerminals.get(bit)||[],protectedNets.get(bit)));
  return {nets:current,cuts,saved};
}

/** Write optimized net trees back as paths between the original physical pins. */
export function shortenLayoutNets(layout,cells,voltageRails=[],pairs=[]) {
  const terminals=new Map(),pinPoints=new Map(),nets=new Map(),edgeBits=new Map(),protectedNets=new Map();
  for(const n of layout.children)for(const p of n.ports||[]){const bit=cells[n.id]?.connections[p.id.slice(n.id.length+1)]?.[0];if(bit===undefined)continue;const point={x:n.x+p.x,y:n.y+p.y};pinPoints.set(p.id,point);if(!terminals.has(bit))terminals.set(bit,[]);terminals.get(bit).push(point);}
  for(const e of layout.edges){const source=e.sourcePort||e.sources?.[0],at=source.lastIndexOf('.'),bit=cells[source.slice(0,at)]?.connections[source.slice(at+1)]?.[0];if(bit===undefined)throw Error('Shortcut edge has no real net.');edgeBits.set(e.id,bit);if(!nets.has(bit))nets.set(bit,[]);for(const section of e.sections||[]){const ps=[section.startPoint,...section.bendPoints||[],section.endPoint];for(let i=1;i<ps.length;i++)if(length({a:ps[i-1],b:ps[i]})>eps)nets.get(bit).push({a:ps[i-1],b:ps[i]});}}
  for(const rail of voltageRails)if(nets.has(rail.bit)){
    const segments=nets.get(rail.bit),protect=segments.filter(s=>same(s.a.y,rail.y)&&same(s.b.y,rail.y));
    for(const n of layout.children)for(const p of n.ports){if(cells[n.id].connections[p.id.slice(n.id.length+1)]?.[0]!==rail.bit)continue;const point={x:n.x+p.x,y:n.y+p.y},drop={a:point,b:{x:point.x,y:rail.y}};if(length(drop)>eps&&covered(drop,segments))protect.push(drop);}
    protectedNets.set(rail.bit,protect);
  }
  const preferredSegments=new Map(),preferredPaths=new Map();
  const preferElbows=(a,b,bit)=>{
    if(!a||!b)return;if(!preferredPaths.has(bit))preferredPaths.set(bit,[]);
    for(const corner of [{x:a.x,y:b.y},{x:b.x,y:a.y}])preferredPaths.get(bit).push([{a,b:corner},{a:corner,b}]);
  };
  for(const pair of pairs.filter(p=>p.kind==='current-limit-pair')){
    const [driver,protector]=pair.members;
    for(const [a,b]of [['E','B'],['B','C']])if(cells[driver].connections[a][0]===cells[protector].connections[b][0])preferElbows(pinPoints.get(driver+'.'+a),pinPoints.get(protector+'.'+b),cells[driver].connections[a][0]);
  }
  for(const pair of pairs.filter(p=>p.kind==='current-mirror'&&p.members.length===2)){
    const [a,b]=pair.members.map(id=>{const pin=cells[id].spiceLayout.kind==='Q'?'B':'G';return {bit:cells[id].connections[pin][0],point:pinPoints.get(id+'.'+pin)};});
    if(a.bit!==b.bit||!a.point||!b.point||!same(a.point.y,b.point.y))continue;
    if(!preferredSegments.has(a.bit))preferredSegments.set(a.bit,[]);preferredSegments.get(a.bit).push({a:a.point,b:b.point});
  }
  for(const [id,c]of Object.entries(cells))if(c.spiceLayout?.kind==='Q'&&c.connections.B?.[0]===c.connections.C?.[0]){
    const a=pinPoints.get(id+'.B'),b=pinPoints.get(id+'.C'),bit=c.connections.B[0];if(!a||!b)continue;
    preferElbows(a,b,bit);
  }
  const result=shortenNetTrees(nets,terminals,layout.children,protectedNets,{maxCuts:layout.children.length>120?12:48,preferredSegments,preferredPaths}),graphs=new Map([...result.nets].map(([bit,t])=>[bit,adjacency(t.segments)]));
  if(!result.cuts)return {graph:layout,cuts:0,saved:0};
  for(const e of layout.edges){const a=pinPoints.get(e.sourcePort||e.sources?.[0]),b=pinPoints.get(e.targetPort||e.targets?.[0]),{graph,points}=graphs.get(edgeBits.get(e.id)),from=key(a),to=key(b),queue=[from],previous=new Map([[from,null]]);for(let i=0;i<queue.length&&!previous.has(to);i++)for(const step of graph.get(queue[i])||[])if(!previous.has(step.to)){previous.set(step.to,queue[i]);queue.push(step.to);}if(!previous.has(to))throw Error('Shortcut disconnected a physical pin.');let route=[];for(let p=to;p!==null;p=previous.get(p))route.unshift(points.get(p)||a);route=route.filter((p,i,ps)=>i===0||i===ps.length-1||!(same(ps[i-1].x,p.x)&&same(p.x,ps[i+1].x)||same(ps[i-1].y,p.y)&&same(p.y,ps[i+1].y)));if(route.length===1)route.push({...route[0]});e.sections=[{id:e.id+'_net_tree',startPoint:{...route[0]},bendPoints:route.slice(1,-1).map(p=>({...p})),endPoint:{...route.at(-1)}}];e.junctionPoints=[];}
  return {graph:layout,cuts:result.cuts,saved:result.saved};
}
