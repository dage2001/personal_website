const option='org.eclipse.elk.';
const known=p=>p?.potential!==null&&p?.potential!==undefined;

/** ELK lays out the transistor/signal skeleton; simple rail branches use local templates. */
export function prepareClassicLayout(graph,cells,lookup,description) {
  if(description?.groups.some(g=>g.members.length)||description?.relations.length)return null;
  const active=Object.entries(cells).filter(([,c])=>['Q','M','J','Z'].includes(c.spiceLayout?.kind));
  if(!active.length||active.length>8||Object.keys(cells).length>80||Object.values(cells).some(c=>c.spiceBlock||Object.keys(c.connections).length>4||c.spiceLayout&&!['Q','M','J','Z','R','L','C','D','V','I','PORT'].includes(c.spiceLayout.kind)))return null;
  const rails=new Map();for(const c of Object.values(cells))for(const [pin,[bit]]of Object.entries(c.connections))if(known(c.spiceLayout?.ports[pin]))rails.set(bit,c.spiceLayout.ports[pin].potential);
  if(rails.size<2||rails.size>5)return null;
  const sourceIds=new Set(Object.entries(cells).filter(([,c])=>c.spiceLayout?.kind==='V'&&Object.values(c.connections).every(([bit])=>rails.has(bit))).map(([id])=>id));
  const sources=graph.children.filter(n=>sourceIds.has(n.id));
  const railEdges=graph.edges.filter(e=>rails.has(Number(lookup[e.id]?.replaceAll(',','')))),signalEdges=graph.edges.filter(e=>!railEdges.includes(e));
  const branches=graph.children.filter(n=>cells[n.id]?.spiceLayout?.passive&&Object.values(cells[n.id].connections).filter(([bit])=>rails.has(bit)).length===1),branchIds=new Set(branches.map(n=>n.id));
  const original=graph.children;graph.children=graph.children.filter(n=>!sourceIds.has(n.id)&&!branchIds.has(n.id));
  const core=new Set(graph.children.map(n=>n.id)),signalNets=new Map();
  for(const e of signalEdges){const net=lookup[e.id];if(!signalNets.has(net))signalNets.set(net,new Set());for(const id of [e.sourcePort,e.targetPort])signalNets.get(net).add(id);}
  graph.edges=[];let serial=0;
  for(const [net,pins]of signalNets){const kept=[...pins].filter(p=>core.has(p.slice(0,p.lastIndexOf('.'))));for(const target of kept.slice(1)){const source=kept[0],id='__classic_'+serial++;lookup[id]=net;graph.edges.push({id,source:source.slice(0,source.lastIndexOf('.')),sourcePort:source,target:target.slice(0,target.lastIndexOf('.')),targetPort:target});}}
  return {rails,railEdges,sources,branches,signalNets,core,original,options:{[option+'direction']:'RIGHT',[option+'layered.layering.strategy']:'NETWORK_SIMPLEX',[option+'layered.spacing.nodeNodeBetweenLayers']:120}};
}

/** Specialized supply-rail geometry; signal placement/routing remains ELK's job. */
export function installClassicRails(layout,classic,cells,lookup) {
  const graph=structuredClone(layout),positive=[...classic.rails].filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]),low=[...classic.rails].filter(([,v])=>v<=0).sort((a,b)=>b[1]-a[1]);
  const coreNodes=new Map(graph.children.map(n=>[n.id,n])),corePoint=id=>{const split=id.lastIndexOf('.'),n=coreNodes.get(id.slice(0,split)),p=n?.ports.find(p=>p.id===id);return p?{x:n.x+p.x,y:n.y+p.y,owner:n.id,pin:id.slice(split+1)}:null;};
  const branchHeight=Math.max(0,...classic.branches.map(n=>n.height)),upperY=-branchHeight-40,lowerY=graph.height+40,occupied={upper:[],lower:[]},branchPaths=[];
  const branchNodes=new Map();
  for(const branch of classic.branches) {
    const cell=cells[branch.id],[signalPin,[signalBit]]=Object.entries(cell.connections).find(([,b])=>!classic.rails.has(b[0])),[railPin,[railBit]]=Object.entries(cell.connections).find(([,b])=>classic.rails.has(b[0]));
    const group=[...classic.signalNets].find(([net])=>Number(net.replaceAll(',',''))===signalBit);if(!group)return null;
    const anchors=[...group[1]].map(id=>({id,p:corePoint(id)})).filter(a=>a.p).sort((a,b)=>Number(['Q','M','J','Z'].includes(cells[b.p.owner].spiceLayout?.kind))-Number(['Q','M','J','Z'].includes(cells[a.p.owner].spiceLayout?.kind)));
    if(!anchors.length)return null;const anchor=anchors[0],upper=classic.rails.get(railBit)>0,slot=upper?'upper':'lower',signalPort=branch.ports.find(p=>p.id===branch.id+'.'+signalPin);
    let x=anchor.p.x-signalPort.x;if(['B','G'].includes(anchor.p.pin))x-=branch.width+28;
    while(occupied[slot].some(n=>x<n.x+n.width+18&&x+branch.width+18>n.x))x+=branch.width+24;
    const node={...branch,x,y:upper?upperY:lowerY};occupied[slot].push(node);branchNodes.set(node.id,node);graph.children.push(node);
    const p={x:x+signalPort.x,y:node.y+signalPort.y},id='__branch_'+branchPaths.length;lookup[id]=group[0];
    branchPaths.push({id,source:anchor.p.owner,sourcePort:anchor.id,target:node.id,targetPort:node.id+'.'+signalPin,sections:[{id:id+'_s',startPoint:{x:anchor.p.x,y:anchor.p.y},bendPoints:[{x:p.x,y:anchor.p.y}],endPoint:p}]});
  }
  graph.edges.push(...branchPaths);
  for(const edge of branchPaths)for(const s of edge.sections){const points=[s.startPoint,...s.bendPoints,s.endPoint];for(let i=1;i<points.length;i++)if(graph.children.some(n=>n.id!==edge.source&&n.id!==edge.target&&Math.max(points[i-1].x,points[i].x)>n.x+.02&&Math.min(points[i-1].x,points[i].x)<n.x+n.width-.02&&Math.max(points[i-1].y,points[i].y)>n.y+.02&&Math.min(points[i-1].y,points[i].y)<n.y+n.height-.02))return null;}
  const minX=Math.min(0,...graph.children.map(n=>n.x)),minY=Math.min(0,...graph.children.map(n=>n.y));
  graph.height=Math.max(...graph.children.map(n=>n.y+n.height))-minY;
  const sourceWidth=classic.sources.reduce((n,s)=>n+s.width+18,0)+24,left=sourceWidth+24-minX,pitch=Math.max(180,graph.height+100),top=Math.max(0,positive.length-1)*pitch+65-minY;
  for(const n of graph.children){n.x+=left;n.y+=top;}
  for(const e of graph.edges)for(const s of e.sections||[]){for(const p of [s.startPoint,...s.bendPoints||[],s.endPoint]){p.x+=left;p.y+=top;}for(const p of e.junctionPoints||[]){p.x+=left;p.y+=top;}}
  const railY=new Map([...positive,...low].map(([bit],i)=>[bit,30+i*pitch]));
  let sourceX=12;
  classic.sources.forEach(n=>{const cell=cells[n.id],bit=cell.connections['+']?.[0],y=railY.get(bit)??30,plus=n.ports.find(p=>p.id===n.id+'.+'),below=plus?.layoutOptions?.[option+'port.side']==='SOUTH';graph.children.push({...n,x:sourceX,y:below?y-n.height-22:y+22});sourceX+=n.width+18;});
  const nodes=new Map(graph.children.map(n=>[n.id,n]));
  const endpoint=id=>{const split=id.lastIndexOf('.'),n=nodes.get(id.slice(0,split)),p=n?.ports.find(p=>p.id===id);if(!p)throw Error('Missing classic rail terminal.');return {x:n.x+p.x,y:n.y+p.y,owner:n.id,side:p.layoutOptions?.[option+'port.side']};};
  const paths=new Map();
  const clear=(a,b,owner)=>!graph.children.some(n=>n.id!==owner&&Math.max(a.x,b.x)>n.x+.02&&Math.min(a.x,b.x)<n.x+n.width-.02&&Math.max(a.y,b.y)>n.y+.02&&Math.min(a.y,b.y)<n.y+n.height-.02);
  for(const edge of classic.railEdges) {
    const bit=Number(lookup[edge.id]?.replaceAll(',','')),y=railY.get(bit);
    for(const id of [edge.sourcePort,edge.targetPort])if(!paths.has(id)) {
      const p=endpoint(id),out=p.side==='EAST'?{x:p.x+14,y:p.y}:p.side==='WEST'?{x:p.x-14,y:p.y}:p,join={x:out.x,y};
      if(!clear(p,out,p.owner)||!clear(out,join,p.owner))return null;
      paths.set(id,[p,...out!==p?[out]:[],join]);
    }
    const a=paths.get(edge.sourcePort),b=paths.get(edge.targetPort),points=[...a,{x:b.at(-1).x,y},...b.slice(0,-1).reverse()],clean=[];
    for(const p of points)if(!clean.length||Math.abs(p.x-clean.at(-1).x)>.002||Math.abs(p.y-clean.at(-1).y)>.002)clean.push({x:p.x,y:p.y});
    graph.edges.push({...edge,sections:[{id:edge.id+'_rail',startPoint:clean[0],bendPoints:clean.slice(1,-1),endPoint:clean.at(-1)}],junctionPoints:[]});
  }
  graph.width=Math.max(...graph.children.map(n=>n.x+n.width))+24;graph.height=Math.max(...graph.children.map(n=>n.y+n.height),...railY.values())+40;
  return {graph,railPitch:pitch,railCount:railY.size};
}
