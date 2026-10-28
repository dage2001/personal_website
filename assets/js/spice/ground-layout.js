// Local cleanup of an already routed ground net; ELK still places real devices
// and routes the circuit. Never infer ground from a name or a voltage value.
const EPS=.02,sideOption='org.eclipse.elk.port.side';
const same=(a,b)=>Math.abs(a-b)<EPS;
const key=p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`;
const point=(node,port)=>({x:node.x+port.x,y:node.y+port.y});
const bitOf=(edge,lookup)=>Number(lookup[edge.id]?.replaceAll(',',''));
function path(section) {return [section.startPoint,...section.bendPoints||[],section.endPoint];}
function simplify(points) {
  const result=[];
  for(const p of points) {
    if(result.length&&same(p.x,result.at(-1).x)&&same(p.y,result.at(-1).y))continue;
    result.push(p);
    while(result.length>=3) {
      const [a,b,c]=result.slice(-3);
      if((same(a.x,b.x)&&same(b.x,c.x)&&(b.y-a.y)*(c.y-b.y)>=0)||(same(a.y,b.y)&&same(b.y,c.y)&&(b.x-a.x)*(c.x-b.x)>=0))result.splice(-2,1);else break;
    }
  }
  return result;
}
export function wireSegments(graph,lookup) {
  return graph.edges.flatMap(edge=>(edge.sections||[]).flatMap(section=>{
    const pts=path(section);
    return pts.slice(1).map((b,i)=>({a:pts[i],b,bit:bitOf(edge,lookup)})).filter(s=>!same(s.a.x,s.b.x)||!same(s.a.y,s.b.y));
  }));
}
function intersectsBox(segment,box,margin=0) {
  const minX=Math.min(segment.a.x,segment.b.x),maxX=Math.max(segment.a.x,segment.b.x);
  const minY=Math.min(segment.a.y,segment.b.y),maxY=Math.max(segment.a.y,segment.b.y);
  return maxX>box.x-margin+EPS&&minX<box.x+box.width+margin-EPS&&maxY>box.y-margin+EPS&&minY<box.y+box.height+margin-EPS;
}
function overlapsBox(a,b,margin=0) {return a.x+a.width>b.x-margin&&a.x<b.x+b.width+margin&&a.y+a.height>b.y-margin&&a.y<b.y+b.height+margin;}
function freeDrop(a,b,owner,graph,segments,bit) {
  const segment={a,b};
  if(graph.children.some(n=>n.id!==owner&&intersectsBox(segment,n,4)))return false;
  return !segments.some(s=>s.bit!==bit&&intersectsBox(segment,{x:Math.min(s.a.x,s.b.x)-3,y:Math.min(s.a.y,s.b.y)-3,width:Math.abs(s.a.x-s.b.x)+6,height:Math.abs(s.a.y-s.b.y)+6}));
}
function horizontalCoverage(segments,bit,y,from,to) {
  const lo=Math.min(from,to),hi=Math.max(from,to);
  const intervals=segments.filter(s=>s.bit===bit&&same(s.a.y,y)&&same(s.b.y,y)).map(s=>[Math.min(s.a.x,s.b.x),Math.max(s.a.x,s.b.x)]).sort((a,b)=>a[0]-b[0]);
  let covered=lo;
  for(const [a,b]of intervals) {if(a>covered+EPS)continue;if(b>=covered-EPS)covered=Math.max(covered,b);if(covered>=hi-EPS)return true;}
  return false;
}

/** A clear set of south-facing returns can share one horizontal rail below them. */
export function alignGroundBus(graph,lookup,bit) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),edges=graph.edges.filter(e=>bitOf(e,lookup)===bit),pins=new Map();
  if(!edges.length)return 0;
  for(const edge of edges) {
    if(edge.sections?.length!==1)return 0;
    for(const id of [edge.sourcePort||edge.sources?.[0],edge.targetPort||edge.targets?.[0]]) {
      const node=nodes.get(id.slice(0,id.lastIndexOf('.'))),port=node?.ports.find(p=>p.id===id);
      if(port?.layoutOptions?.[sideOption]!=='SOUTH')return 0;
      pins.set(id,{...point(node,port),owner:node.id});
    }
  }
  const points=[...pins.values()],y=Math.max(...points.map(p=>p.y))+20,lo=Math.min(...points.map(p=>p.x)),hi=Math.max(...points.map(p=>p.x));
  const segments=wireSegments(graph,lookup);
  if(!freeDrop({x:lo,y},{x:hi,y},'',graph,segments,bit)||points.some(p=>!freeDrop(p,{x:p.x,y},p.owner,graph,segments,bit)))return 0;
  let changed=0;
  for(const edge of edges) {
    const source=pins.get(edge.sourcePort||edge.sources?.[0]),target=pins.get(edge.targetPort||edge.targets?.[0]);
    const next=simplify([{x:source.x,y:source.y},{x:source.x,y},{x:target.x,y},{x:target.x,y:target.y}]);
    if(JSON.stringify(path(edge.sections[0]))!==JSON.stringify(next))changed++;
    edge.sections[0]={...edge.sections[0],startPoint:next[0],bendPoints:next.slice(1,-1),endPoint:next.at(-1)};
  }
  graph.height=Math.max(graph.height,y+12);return changed;
}

/** Replace a ground branch's staircase by a clear vertical drop to its own bus. */
export function straightenGroundDrops(graph,lookup,bit) {
  const nodes=new Map(graph.children.map(n=>[n.id,n]));let changed=0;
  for(const edge of graph.edges) {
    if(bitOf(edge,lookup)!==bit||edge.sections?.length!==1)continue;
    for(const target of [false,true]) {
      const endpoint=target?(edge.targetPort||edge.targets?.[0]):(edge.sourcePort||edge.sources?.[0]);
      const owner=endpoint.slice(0,endpoint.lastIndexOf('.')),node=nodes.get(owner),port=node?.ports.find(p=>p.id===endpoint);
      if(port?.layoutOptions?.[sideOption]!=='SOUTH')continue;
      const original=path(edge.sections[0]),pts=target?[...original].reverse():original,p=pts[0];
      const segments=wireSegments(graph,lookup),candidates=[];
      for(let i=1;i<pts.length-1;i++) {
        const a=pts[i],b=pts[i+1];
        if(!same(a.y,b.y)||a.y<=p.y+EPS)continue;
        const join={x:p.x,y:a.y};
        if(!horizontalCoverage(segments,bit,a.y,p.x,b.x)||!freeDrop(p,join,owner,graph,segments,bit))continue;
        const proposal=simplify([p,join,...pts.slice(i+1)]);
        if(proposal.length<pts.length)candidates.push({proposal,distance:a.y-p.y});
      }
      candidates.sort((a,b)=>a.distance-b.distance);
      if(!candidates.length)continue;
      const next=target?[...candidates[0].proposal].reverse():candidates[0].proposal;
      edge.sections[0]={...edge.sections[0],startPoint:next[0],bendPoints:next.slice(1,-1),endPoint:next.at(-1)};changed++;
    }
  }
  return changed;
}

/** Put the existing synthetic glyph below a real routed bus, never in a signal layer. */
export function attachGroundSymbol(graph,lookup,ground,netlist) {
  const bit=netlist.modules.circuit.cells[ground.id].connections.A[0];
  const segments=wireSegments(graph,lookup),port=ground.ports.find(p=>p.id===ground.id+'.A');
  const candidates=[];
  for(const s of segments)if(s.bit===bit) {
    if(same(s.a.y,s.b.y)) {
      const lo=Math.min(s.a.x,s.b.x),hi=Math.max(s.a.x,s.b.x),inset=Math.min(8,(hi-lo)/4);
      for(const x of [(lo+hi)/2,lo+inset,hi-inset])candidates.push({anchor:{x,y:s.a.y},owner:'',length:hi-lo});
    }else if(same(s.a.x,s.b.x)) {
      // Side-connected bulk/control returns may have a vertical bus and only
      // short horizontal arms. Its lower end is also a legitimate ground tap.
      candidates.push({anchor:{x:s.a.x,y:Math.max(s.a.y,s.b.y)},owner:'',length:0});
    }
  }
  // A one-terminal ground net has no ELK edge: attach directly below its bottom pin.
  for(const node of graph.children)for(const p of node.ports||[]) {
    const pin=p.id.slice(node.id.length+1);
    if(netlist.modules.circuit.cells[node.id]?.connections[pin]?.[0]===bit&&p.layoutOptions?.[sideOption]==='SOUTH')candidates.push({anchor:point(node,p),owner:node.id,pin:p.id,length:0});
  }
  candidates.sort((a,b)=>b.anchor.y-a.anchor.y||b.length-a.length);
  for(const c of candidates) {
    const end={x:c.anchor.x,y:c.anchor.y+22};
    const node={...ground,x:end.x-port.x,y:end.y-port.y};
    if(node.x<0||!freeDrop(c.anchor,end,c.owner,graph,segments,bit))continue;
    if(graph.children.some(n=>overlapsBox(node,n,5))||segments.some(s=>intersectsBox(s,node,3)))continue;
    graph.children.push(node);graph.width=Math.max(graph.width,node.x+node.width+12);graph.height=Math.max(graph.height,node.y+node.height+12);
    return {node,bit,groundPin:port.id,anchor:c.anchor,end,pin:c.pin||null};
  }
  if(!segments.some(s=>s.bit===bit)&&!candidates.length) {
    const used=Object.entries(netlist.modules.circuit.cells).some(([id,c])=>id!==ground.id&&Object.values(c.connections).some(bits=>bits[0]===bit));
    if(!used) {
      const node={...ground,x:12,y:graph.height+12};graph.children.push(node);
      graph.width=Math.max(graph.width,node.x+node.width+12);graph.height=node.y+node.height+12;
      return {node,bit,groundPin:port.id,anchor:null,end:null,pin:null};
    }
  }
  return null; // Caller reruns the original ELK path if there is no safe attachment.
}

function mergeIntervals(segments,horizontal) {
  const groups=new Map();
  for(const s of segments) {
    if(horizontal?!same(s.a.y,s.b.y):!same(s.a.x,s.b.x))continue;
    const axis=horizontal?s.a.y:s.a.x,k=axis.toFixed(3),a=horizontal?s.a.x:s.a.y,b=horizontal?s.b.x:s.b.y;
    if(!groups.has(k))groups.set(k,{axis,intervals:[]});groups.get(k).intervals.push([Math.min(a,b),Math.max(a,b)]);
  }
  const result=[];
  for(const {axis,intervals}of groups.values()) {
    intervals.sort((a,b)=>a[0]-b[0]);let current;
    for(const [lo,hi]of intervals) {if(current&&lo<=current.hi+EPS)current.hi=Math.max(current.hi,hi);else {current={axis,lo,hi};result.push(current);}}
  }
  return result;
}
/** Remove obsolete dots and reconstruct T junctions after local branch cleanup. */
export function refreshGroundJunctions(graph,lookup,bit,attachment) {
  const edges=graph.edges.filter(e=>bitOf(e,lookup)===bit);if(!edges.length)return;
  const segments=wireSegments(graph,lookup).filter(s=>s.bit===bit);
  if(attachment?.anchor)segments.push({a:attachment.anchor,b:attachment.end,bit});
  const horizontal=mergeIntervals(segments,true),vertical=mergeIntervals(segments,false),dots=new Map();
  for(const h of horizontal)for(const v of vertical) {
    if(v.axis<h.lo-EPS||v.axis>h.hi+EPS||h.axis<v.lo-EPS||h.axis>v.hi+EPS)continue;
    const degree=Number(v.axis>h.lo+EPS)+Number(v.axis<h.hi-EPS)+Number(h.axis>v.lo+EPS)+Number(h.axis<v.hi-EPS);
    const p={x:v.axis,y:h.axis};if(degree>=3)dots.set(key(p),p);
  }
  for(const edge of edges)edge.junctionPoints=[];
  edges[0].junctionPoints=[...dots.values()];
}

/** Validate decorative endpoints against a real same-net segment or electrical pin. */
export function validateGroundAttachment(graph,lookup,attachment,netlist) {
  if(!attachment.anchor)return [];
  const {anchor,end,bit,node,groundPin,pin}=attachment,p=node.ports.find(p=>p.id===groundPin);
  if(netlist.modules.circuit.cells[node.id]?.connections[groundPin.slice(node.id.length+1)]?.[0]!==bit)throw Error('Ground symbol uses the wrong net.');
  if(!same(anchor.x,end.x)||end.y<=anchor.y||!same(node.x+p.x,end.x)||!same(node.y+p.y,end.y))throw Error('Invalid ground symbol attachment.');
  const nodes=new Map(graph.children.map(n=>[n.id,n]));
  if(pin) {
    const owner=nodes.get(pin.slice(0,pin.lastIndexOf('.'))),port=owner?.ports.find(p=>p.id===pin),actual=port&&point(owner,port);
    const pinName=pin.slice(owner.id.length+1);
    if(!actual||!same(anchor.x,actual.x)||!same(anchor.y,actual.y)||netlist.modules.circuit.cells[owner.id].connections[pinName][0]!==bit)throw Error('Ground symbol attached to the wrong pin.');
  }else if(!wireSegments(graph,lookup).some(s=>s.bit===bit&&((same(s.a.y,s.b.y)&&same(anchor.y,s.a.y)&&anchor.x>=Math.min(s.a.x,s.b.x)-EPS&&anchor.x<=Math.max(s.a.x,s.b.x)+EPS)||(same(s.a.x,s.b.x)&&same(anchor.x,s.a.x)&&anchor.y>=Math.min(s.a.y,s.b.y)-EPS&&anchor.y<=Math.max(s.a.y,s.b.y)+EPS))))throw Error('Ground symbol is not on the ground rail.');
  return pin?[groundPin,pin]:[groundPin];
}
