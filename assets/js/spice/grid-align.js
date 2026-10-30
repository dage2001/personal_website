const eps=.002,same=(a,b)=>Math.abs(a-b)<eps;
const on=(p,s)=>same(s.a.x,s.b.x)?same(p.x,s.a.x)&&p.y>=Math.min(s.a.y,s.b.y)-eps&&p.y<=Math.max(s.a.y,s.b.y)+eps:same(p.y,s.a.y)&&p.x>=Math.min(s.a.x,s.b.x)-eps&&p.x<=Math.max(s.a.x,s.b.x)+eps;
const hits=(s,n)=>Math.max(s.a.x,s.b.x)>n.x+eps&&Math.min(s.a.x,s.b.x)<n.x+n.width-eps&&Math.max(s.a.y,s.b.y)>n.y+eps&&Math.min(s.a.y,s.b.y)<n.y+n.height-eps;
const points=s=>[s.startPoint,...s.bendPoints||[],s.endPoint];
function segments(graph,cells){return graph.edges.flatMap(e=>{const source=e.sourcePort||e.sources?.[0],at=source.lastIndexOf('.'),bit=cells[source.slice(0,at)].connections[source.slice(at+1)][0];return (e.sections||[]).flatMap(s=>{const ps=points(s);return ps.slice(1).map((b,i)=>({a:ps[i],b,bit,edge:e.id})).filter(s=>Math.abs(s.a.x-s.b.x)+Math.abs(s.a.y-s.b.y)>eps);});});}
const cost=graph=>graph.edges.reduce((sum,e)=>sum+(e.sections||[]).reduce((sum,s)=>{const p=points(s).filter((v,i,ps)=>!i||!same(v.x,ps[i-1].x)||!same(v.y,ps[i-1].y));return sum+p.slice(1).reduce((sum,b,i)=>sum+Math.abs(b.x-p[i].x)+Math.abs(b.y-p[i].y),0)+8*Math.max(0,p.length-2);},0),0);
/** Slide nearby two-terminal rail branches as a bank onto a horizontal signal.
 * Every moved pin is reconnected; no net aliases or new electrical edges. */
export function alignPassiveBanks(layout,cells,step){
  const nets=new Map();for(const n of layout.children)for(const p of n.ports||[]){const pin=p.id.slice(n.id.length+1),bit=cells[n.id]?.connections[pin]?.[0];if(bit===undefined)continue;if(!nets.has(bit))nets.set(bit,[]);nets.get(bit).push({id:n.id,pin,port:p,x:n.x+p.x,y:n.y+p.y});}
  let graph=layout,aligned=0;const moved=[];
  for(const [bit,pins]of nets){
    if(pins.some(p=>cells[p.id]?.spiceLayout?.ports[p.pin]?.potential!==null&&cells[p.id]?.spiceLayout?.ports[p.pin]?.potential!==undefined))continue;
    const anchors=pins.filter(p=>['EAST','WEST'].includes(p.port.layoutOptions?.['org.eclipse.elk.port.side'])&&(!cells[p.id].spiceLayout?.passive||Object.keys(cells[p.id].connections).length===2));
    if(!anchors.length)continue;const target=anchors[0];if(anchors.some(p=>!same(p.y,target.y)))continue;
    const branches=pins.filter(p=>(cells[p.id].spiceLayout?.passive||['V','I'].includes(cells[p.id].spiceLayout?.kind))&&['NORTH','SOUTH'].includes(p.port.layoutOptions?.['org.eclipse.elk.port.side'])&&Object.entries(cells[p.id].connections).some(([q])=>q!==p.pin&&cells[p.id].spiceLayout.ports[q]?.potential!==null&&cells[p.id].spiceLayout.ports[q]?.potential!==undefined)&&Math.abs(p.y-target.y)>eps&&Math.abs(p.y-target.y)<=Math.max(24,2*step)+eps);
    if(!branches.length)continue;const moving=new Map(branches.map(p=>[p.id,target.y-p.y])),rows=[...new Set(branches.map(p=>p.y))];
    if(pins.some(p=>rows.some(y=>same(y,p.y))&&!moving.has(p.id)))continue;
    const candidate=structuredClone(graph),changed=new Set();
    for(const n of candidate.children)if(moving.has(n.id))n.y+=moving.get(n.id);
    for(const e of candidate.edges){const source=e.sourcePort||e.sources?.[0],targetPort=e.targetPort||e.targets?.[0],at=source.lastIndexOf('.'),b=cells[source.slice(0,at)].connections[source.slice(at+1)][0];
      for(const s of e.sections||[]){let ps=points(s);if(b===bit){for(const p of ps)if(rows.some(y=>same(y,p.y)))p.y=target.y;changed.add(e.id);}else {for(const [endpoint,reverse]of [[source,false],[targetPort,true]]){if(!reverse&&s!==e.sections[0]||reverse&&s!==e.sections.at(-1))continue;const owner=endpoint.slice(0,endpoint.lastIndexOf('.'));if(!moving.has(owner))continue;const ordered=reverse?[...ps].reverse():[...ps],previous={...ordered[0]},next={...previous,y:previous.y+moving.get(owner)};if(ordered[1]&&same(previous.x,ordered[1].x))ordered[0]=next;else ordered.unshift(next);ps=reverse?ordered.reverse():ordered;changed.add(e.id);}}
        ps=ps.filter((p,i,a)=>!i||!same(p.x,a[i-1].x)||!same(p.y,a[i-1].y));if(ps.length===1)ps.push({...ps[0]});s.startPoint=ps[0];s.endPoint=ps.at(-1);s.bendPoints=ps.slice(1,-1);
      }e.junctionPoints=[];
    }
    const signal=g=>({edges:g.edges.filter(e=>{const p=e.sourcePort||e.sources?.[0],at=p.lastIndexOf('.');return cells[p.slice(0,at)].connections[p.slice(at+1)][0]===bit;})});
    if(cost(signal(candidate))>=cost(signal(graph))-eps||cost(candidate)>cost(graph)+32*branches.length)continue;
    const boxes=candidate.children.filter(n=>moving.has(n.id));if(boxes.some(a=>candidate.children.some(b=>a!==b&&a.x<b.x+b.width+2&&a.x+a.width+2>b.x&&a.y<b.y+b.height+2&&a.y+a.height+2>b.y)))continue;
    const wires=segments(candidate,cells),edited=wires.filter(s=>changed.has(s.edge));if(edited.some(s=>!same(s.a.x,s.b.x)&&!same(s.a.y,s.b.y)||candidate.children.some(n=>hits(s,n)))||wires.some(s=>boxes.some(n=>hits(s,n))))continue;
    if(edited.some(a=>wires.some(b=>a.bit!==b.bit&&(on(a.a,b)||on(a.b,b)||on(b.a,a)||on(b.b,a)))))continue;
    graph=candidate;aligned+=branches.length;moved.push(...branches.map(p=>p.id));
  }
  return {graph,aligned,moved};
}
