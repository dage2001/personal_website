import {prepareClassicLayout,installClassicRails} from './classic-layout.js';
const option='org.eclipse.elk.';

/** Reuse the sheet template inside an expanded instance, before its parent is routed. */
export async function layoutLocalClassicInstances(graph,cells,lookup,elk) {
  const successful=[],hidden=new Map(),failures=[];
  async function visit(node) {
    for(const child of node.children||[])if(child.children)await visit(child);
    if(!node.spiceGroup?.startsWith('@instance_')||!node.children.length||node.children.some(n=>n.children))return;
    if(node.children.some(n=>!cells[n.id]))return;
    const localCells=Object.fromEntries(node.children.map(n=>[n.id,cells[n.id]]));
    if(Object.values(localCells).filter(c=>['Q','M','J','Z'].includes(c?.spiceLayout?.kind)).length!==1)return;
    const originals=structuredClone(node.edges||[]),proxies=new Map(),children=structuredClone(node.children);
    for(const [index,port]of (node.ports||[]).entries()) {
      const edge=originals.find(e=>e.sources?.includes(port.id)||e.targets?.includes(port.id));if(!edge)continue;
      const bit=Number(lookup[edge.id]?.replaceAll(',',''));if(!Number.isFinite(bit))continue;
      const meta=Object.values(localCells).flatMap(c=>Object.entries(c.connections).filter(([,b])=>b[0]===bit).map(([p])=>c.spiceLayout?.ports[p])).find(Boolean)||{role:'unknown',potential:null};
      const id=node.id+'_port_'+index,side=port.layoutOptions?.[option+'port.side'],role=['pwr','ret','bias'].includes(meta.role)?meta.role:side==='WEST'||side==='NORTH'?'in':'out';
      proxies.set(port.id,id+'.A');localCells[id]={connections:{A:[bit]},attributes:{value:''},spiceLayout:{kind:'PORT',ports:{A:{...meta,role}},source:false,passive:false}};
      children.push({id,width:0,height:0,ports:[{id:id+'.A',x:0,y:0,width:0,height:0,layoutOptions:{[option+'port.side']:role==='in'?'EAST':role==='out'?'WEST':meta.potential>0?'SOUTH':'NORTH'}}],layoutOptions:{[option+'portConstraints']:'FIXED_POS'}});
    }
    const endpoint=p=>proxies.get(p)||p;
    const edges=originals.map(e=>{const a=endpoint(e.sources?.[0]||e.sourcePort),b=endpoint(e.targets?.[0]||e.targetPort);return {...e,source:a.slice(0,a.lastIndexOf('.')),sourcePort:a,target:b.slice(0,b.lastIndexOf('.')),targetPort:b,sources:undefined,targets:undefined};});
    const local={id:node.id+'_local',children,edges},classic=prepareClassicLayout(local,localCells,lookup,null);if(!classic)return;
    let installed;try {const placed=await elk.layout(local,{layoutOptions:{[option+'algorithm']:'layered',[option+'edgeRouting']:'ORTHOGONAL',[option+'separateConnectedComponents']:false,[option+'hierarchyHandling']:'SEPARATE_CHILDREN',...classic.options}});installed=installClassicRails(placed,classic,localCells,lookup);}catch{return;}
    if(!installed)return;
    const placed=installed.graph,byId=new Map(placed.children.map(n=>[n.id,n])),point=p=>{const at=p.lastIndexOf('.'),n=byId.get(p.slice(0,at)),port=n?.ports.find(v=>v.id===p);if(!port)throw Error('Missing local template terminal.');return {x:n.x+port.x,y:n.y+port.y};};
    // A port graph traces existing template routes; it does not invent a router.
    const adjacency=new Map();for(const e of placed.edges){for(const [from,to,reverse]of [[e.sourcePort,e.targetPort,false],[e.targetPort,e.sourcePort,true]]){if(!adjacency.has(from))adjacency.set(from,[]);adjacency.get(from).push({to,e,reverse});}}
    function route(from,to) {
      const queue=[from],previous=new Map([[from,null]]);for(let i=0;i<queue.length&&!previous.has(to);i++)for(const step of adjacency.get(queue[i])||[])if(!previous.has(step.to)){previous.set(step.to,{from:queue[i],step});queue.push(step.to);}
      if(!previous.has(to))throw Error('Disconnected local template net.');const steps=[];let cursor=to;while(cursor!==from){const entry=previous.get(cursor);steps.unshift(entry.step);cursor=entry.from;}
      return steps.flatMap(({e,reverse})=>{const sections=e.sections.map(s=>[s.startPoint,...s.bendPoints||[],s.endPoint]);if(reverse)return sections.reverse().flatMap(p=>p.reverse());return sections.flat();});
    }
    const width=placed.width+24,height=placed.height+24,boundaries=new Map(),resolvedPorts=structuredClone(node.ports||[]),physical=placed.children.filter(n=>cells[n.id]);
    for(const port of resolvedPorts)if(proxies.has(port.id)) {
      const p=point(proxies.get(port.id)),meta=localCells[proxies.get(port.id).split('.')[0]]?.spiceLayout?.ports.A;
      const power=meta?.potential!==null&&meta?.potential!==undefined,preferred=power?'WEST':port.layoutOptions?.[option+'port.side'];let boundary,side;
      for(const candidate of [...new Set([preferred,'WEST','EAST','NORTH','SOUTH'])]){const b={x:candidate==='WEST'?0:candidate==='EAST'?width:p.x,y:candidate==='NORTH'?0:candidate==='SOUTH'?height:p.y};if(physical.some(n=>Math.max(p.x,b.x)>n.x+.02&&Math.min(p.x,b.x)<n.x+n.width-.02&&Math.max(p.y,b.y)>n.y+.02&&Math.min(p.y,b.y)<n.y+n.height-.02))continue;boundary=b;side=candidate;break;}
      if(!boundary)return;boundaries.set(port.id,{p,boundary});
      port.x=boundary.x;port.y=boundary.y;port.layoutOptions={...port.layoutOptions,[option+'port.side']:side};
    }
    for(const port of resolvedPorts)if(!proxies.has(port.id)){const side=port.layoutOptions?.[option+'port.side'];port.x=side==='EAST'?width:0;port.y=side==='SOUTH'?height:0;}
    const routed=originals.map(e=>{
      const source=e.sources?.[0]||e.sourcePort,target=e.targets?.[0]||e.targetPort,a=endpoint(source),b=endpoint(target),points=route(a,b);
      if(!points.length)points.push(point(a));if(boundaries.has(source))points.unshift(boundaries.get(source).boundary);if(boundaries.has(target))points.push(boundaries.get(target).boundary);
      const clean=[];for(const p of points)if(!clean.length||Math.abs(p.x-clean.at(-1).x)>.002||Math.abs(p.y-clean.at(-1).y)>.002)clean.push(p);
      if(clean.length===1)clean.push({...clean[0]});return {...e,sections:[{id:e.id+'_classic',incomingShape:source,outgoingShape:target,startPoint:clean[0],bendPoints:clean.slice(1,-1),endPoint:clean.at(-1)}],container:node.id};
    });
    const clean=value=>{if(value&&typeof value==='object'){delete value.$H;for(const v of Object.values(value))clean(v);}return value;};
    for(const e of routed)for(const s of e.sections){const points=[s.startPoint,...s.bendPoints,s.endPoint];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],hit=physical.find(n=>Math.max(a.x,b.x)>n.x+.02&&Math.min(a.x,b.x)<n.x+n.width-.02&&Math.max(a.y,b.y)>n.y+.02&&Math.min(a.y,b.y)<n.y+n.height-.02);if(hit){failures.push({instance:node.spiceGroup,edge:e.id,symbol:cells[hit.id].attributes.displayRef,segment:{a,b},box:{x:hit.x,y:hit.y,width:hit.width,height:hit.height}});return;}}}
    hidden.set(node.id,{children:clean(physical),edges:clean(routed)});node.ports=resolvedPorts;delete node.children;delete node.edges;node.width=width;node.height=height;node.layoutOptions={...node.layoutOptions,[option+'portConstraints']:'FIXED_POS'};
    successful.push(node.spiceGroup.slice('@instance_'.length));
  }
  await visit(graph);return {instances:successful,failures,restore:layout=>{const visit=n=>{if(hidden.has(n.id))Object.assign(n,hidden.get(n.id));for(const child of n.children||[])visit(child);};visit(layout);return layout;}};
}
