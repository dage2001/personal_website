// Local improvement of ELK's result: a leaf load belongs beside its output,
// not in a common layer with unrelated input-to-ground branches.
import {simplifyNetGeometry} from './net-geometry.js';
const side='org.eclipse.elk.port.side',eps=.02;
const path=e=>[e.sections[0].startPoint,...e.sections[0].bendPoints||[],e.sections[0].endPoint];
const hit=(a,b,n,margin=0)=>Math.max(a.x,b.x)>n.x-margin+eps&&Math.min(a.x,b.x)<n.x+n.width+margin-eps&&Math.max(a.y,b.y)>n.y-margin+eps&&Math.min(a.y,b.y)<n.y+n.height+margin-eps;
const clean=ps=>ps.filter((p,i)=>!i||Math.abs(p.x-ps[i-1].x)>eps||Math.abs(p.y-ps[i-1].y)>eps);
const bit=(e,lookup)=>Number(lookup[e.id]?.replaceAll(',',''));
function section(e,points){const p=clean(points);return {...e.sections[0],startPoint:p[0],bendPoints:p.slice(1,-1),endPoint:p.at(-1)};}

export function placeOutputShunts(graph,cells,lookup) {
  let changed=0;
  for(const node of graph.children) {
    const cell=cells[node.id];if(!cell?.spiceLayout?.passive||Object.keys(cell.connections).length!==2)continue;
    const pins=Object.entries(cell.connections),ground=pins.find(([p,[b]])=>cell.spiceLayout.ports[p]?.potential===0&&cell.spiceLayout.ports[p]?.role==='ret');
    if(!ground)continue;
    const signal=pins.find(p=>p!==ground),top=node.ports.find(p=>p.id===node.id+'.'+signal[0]),bottom=node.ports.find(p=>p.id===node.id+'.'+ground[0]);
    if(top?.layoutOptions?.[side]!=='NORTH'||bottom?.layoutOptions?.[side]!=='SOUTH')continue;
    const incident=graph.edges.filter(e=>e.source===node.id||e.target===node.id);
    if(incident.length!==2||incident.some(e=>e.sections?.length!==1))continue; // Only a true leaf on each drawing tree.
    const se=incident.find(e=>bit(e,lookup)===signal[1][0]),ge=incident.find(e=>bit(e,lookup)===ground[1][0]);if(!se||!ge)continue;
    const anchors=graph.children.filter(n=>cells[n.id]?.spiceBlock&&cells[n.id].spiceLayout?.owner===cell.spiceLayout.owner).flatMap(n=>n.ports.filter(p=>p.layoutOptions?.[side]==='EAST'&&cells[n.id].connections[p.id.slice(n.id.length+1)]?.[0]===signal[1][0]).map(p=>({n,p,x:n.x+p.x,y:n.y+p.y})));
    if(!anchors.length)continue;
    const netCost=(candidate,replacements=new Map())=>[signal[1][0],ground[1][0]].reduce((total,net)=>{
      const segments=graph.edges.filter(e=>bit(e,lookup)===net).flatMap(e=>{const ps=replacements.get(e)||path(e);return ps.slice(1).map((b,i)=>({a:ps[i],b}));});
      const terminals=graph.children.flatMap(n=>n.ports.filter(p=>cells[n.id]?.connections[p.id.slice(n.id.length+1)]?.[0]===net).map(p=>({x:(n===node?candidate:n).x+p.x,y:(n===node?candidate:n).y+p.y})));
      return total+simplifyNetGeometry(segments,terminals).wireLength;
    },0);
    let oldCost;try{oldCost=netCost(node);}catch{continue;}
    let best;
    for(const anchor of anchors)for(const gap of [24,40,64])for(const drop of [24,40]) {
      const candidate={...node,x:anchor.n.x+anchor.n.width+gap,y:anchor.y+drop};
      if(graph.children.some(n=>n!==node&&candidate.x<n.x+n.width+8&&candidate.x+candidate.width+8>n.x&&candidate.y<n.y+n.height+8&&candidate.y+candidate.height+8>n.y))continue;
      if(graph.edges.filter(e=>!incident.includes(e)).some(e=>(e.sections||[]).some(s=>{const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];return ps.slice(1).some((b,i)=>hit(ps[i],b,candidate,3));})))continue;
      const a={x:candidate.x+top.x,y:candidate.y+top.y},b={x:candidate.x+bottom.x,y:candidate.y+bottom.y};
      const signalPath=[{x:anchor.x,y:anchor.y},{x:a.x,y:anchor.y},a],gp=ge.target===node.id?path(ge):path(ge).reverse();
      const clear=ps=>ps.slice(1).every((p,i)=>!graph.children.filter(n=>n!==node).concat(candidate).some(n=>hit(ps[i],p,n)));
      if(!clear(signalPath))continue;
      for(let i=1;i<gp.length;i++) {
        if(Math.abs(gp[i].y-gp[i-1].y)>eps||gp[i].y<b.y+12)continue;
        // Reuse a prefix of the already routed ground edge and extend its
        // horizontal rail; the load then reaches it with one vertical drop.
        const groundPath=[...gp.slice(0,i),{x:b.x,y:gp[i].y},b];if(!clear(groundPath))continue;
        // Compare real shared-wire length, not star-edge lengths: a ground
        // prefix may be counted several times by ELK's per-terminal tree.
        let score;try{score=netCost(candidate,new Map([[se,signalPath],[ge,ge.target===node.id?groundPath:groundPath.slice().reverse()]]));}catch{continue;}
        if(score>=oldCost-1||best&&score>=best.score)continue;
        best={candidate,anchor,signalPath,groundPath,score};
      }
    }
    if(!best)continue;
    node.x=best.candidate.x;node.y=best.candidate.y;
    se.source=best.anchor.n.id;se.sourcePort=best.anchor.p.id;se.target=node.id;se.targetPort=top.id;
    se.sections=[{...section(se,best.signalPath),incomingShape:se.sourcePort,outgoingShape:se.targetPort}];se.junctionPoints=[];
    const gp=ge.target===node.id?best.groundPath:best.groundPath.slice().reverse();ge.sections=[section(ge,gp)];ge.junctionPoints=[];
    graph.width=Math.max(graph.width,node.x+node.width+12);graph.height=Math.max(graph.height,node.y+node.height+12);changed++;
  }
  return changed;
}
