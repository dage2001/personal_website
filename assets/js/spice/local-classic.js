import {prepareClassicLayout,installClassicRails} from './classic-layout.js';
import {transistorCurrentRank} from './transistor-flow.js';
import {tileTransistorPairs} from './paired-layout.js';
const option='org.eclipse.elk.';
const netOf=(e,lookup)=>Number(lookup[e.id]?.replaceAll(',',''));
const onSegment=(p,a,b)=>Math.abs(a.x-b.x)<.002?Math.abs(p.x-a.x)<.002&&p.y>=Math.min(a.y,b.y)-.002&&p.y<=Math.max(a.y,b.y)+.002:Math.abs(p.y-a.y)<.002&&p.x>=Math.min(a.x,b.x)-.002&&p.x<=Math.max(a.x,b.x)+.002;
function segments(graph,lookup){return graph.edges.flatMap(e=>(e.sections||[]).flatMap(s=>{const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];return ps.slice(1).map((b,i)=>({a:ps[i],b,bit:netOf(e,lookup)}));}));}
function contact(a,b){return onSegment(a.a,b.a,b.b)||onSegment(a.b,b.a,b.b)||onSegment(b.a,a.a,a.b)||onSegment(b.b,a.a,a.b);}

/** Reuse the sheet template inside an expanded instance, before its parent is routed. */
export async function layoutLocalClassicInstances(graph,cells,lookup,elk,motifs=[],pairs=[]) {
  const successful=[],stages=[],appliedMotifs=[],pairConstraints=[],hidden=new Map(),failures=[];
  async function visit(node) {
    for(const child of node.children||[])if(child.children)await visit(child);
    if(!node.spiceClassic&&!node.spiceGroup?.startsWith('@instance_'))return;
    if(!node.children?.length||node.children.some(n=>n.children||!cells[n.id])){if(node.spiceClassic)failures.push({stage:node.spiceGroup,reason:'Classic stage requires discrete devices and sheet ports'});return;}
    const localCells=Object.fromEntries(node.children.map(n=>[n.id,cells[n.id]]));
    const count=Object.values(localCells).filter(c=>['Q','M','J','Z'].includes(c?.spiceLayout?.kind)).length;
    if(node.spiceClassic?count<1||count>12:count!==1){if(node.spiceClassic)failures.push({stage:node.spiceGroup,reason:'Classic stage supports 1–12 active devices'});return;}
    const originals=structuredClone(node.edges||[]),proxies=new Map(),children=structuredClone(node.children);
    for(const [index,port]of (node.ports||[]).entries()) {
      const edge=originals.find(e=>e.sources?.includes(port.id)||e.targets?.includes(port.id));if(!edge)continue;
      const bit=Number(lookup[edge.id]?.replaceAll(',',''));if(!Number.isFinite(bit))continue;
      const meta=Object.values(localCells).flatMap(c=>Object.entries(c.connections).filter(([,b])=>b[0]===bit).map(([p])=>c.spiceLayout?.ports[p])).find(Boolean)||{role:'unknown',potential:null};
      const id=node.id+'_port_'+index,side=port.layoutOptions?.[option+'port.side'];let role=['pwr','ret','bias'].includes(meta.role)?meta.role:side==='WEST'||side==='NORTH'?'in':'out';
      if(node.spiceClassic&&!['pwr','ret','bias'].includes(role)){
        const drives=c=>Object.entries(c.connections).some(([pin,[b]])=>{if(b!==bit)return false;const rank=transistorCurrentRank(c,pin);if(rank!==null)return rank===0;if(c.spiceLayout?.kind!=='R')return false;const keys=Object.keys(c.connections),reverse=c.spiceLayout.orientation?.endsWith('reversed');return pin===keys[reverse?0:1];});
        if(Object.entries(cells).some(([id,c])=>!localCells[id]&&drives(c)))role='in';else if(Object.values(localCells).some(drives))role='out';
      }
      proxies.set(port.id,id+'.A');localCells[id]={connections:{A:[bit]},attributes:{value:''},spiceLayout:{kind:'PORT',ports:{A:{...meta,role}},source:false,passive:false}};
      const size=node.spiceClassic?16:0,portSide=role==='in'?'EAST':role==='out'?'WEST':meta.potential>0?'SOUTH':'NORTH';
      children.push({id,width:size,height:size,ports:[{id:id+'.A',x:portSide==='EAST'?size:portSide==='WEST'?0:size/2,y:portSide==='SOUTH'?size:portSide==='NORTH'?0:size/2,width:0,height:0,layoutOptions:{[option+'port.side']:portSide}}],layoutOptions:{[option+'portConstraints']:'FIXED_POS'}});
    }
    const endpoint=p=>proxies.get(p)||p;
    const edges=originals.map(e=>{const a=endpoint(e.sources?.[0]||e.sourcePort),b=endpoint(e.targets?.[0]||e.targetPort);return {...e,source:a.slice(0,a.lastIndexOf('.')),sourcePort:a,target:b.slice(0,b.lastIndexOf('.')),targetPort:b,sources:undefined,targets:undefined};});
    if(node.spiceClassic){
      const references=new Map();for(const c of Object.values(cells))for(const [pin,[bit]]of Object.entries(c.connections)){const meta=c.spiceLayout?.ports[pin];if(meta?.potential!==null&&meta?.potential!==undefined)references.set(bit,meta);}
      const rails=[...references].sort((a,b)=>b[1].potential-a[1].potential),selected=[rails[0],rails.at(-1)].filter(Boolean);
      for(const [bit,meta]of selected)if(!Object.values(localCells).some(c=>Object.values(c.connections).some(b=>b[0]===bit))){const id=node.id+'_reference_'+bit;localCells[id]={connections:{A:[bit]},attributes:{value:''},spiceLayout:{kind:'PORT',ports:{A:meta}}};children.push({id,width:0,height:0,ports:[{id:id+'.A',x:0,y:0,width:0,height:0,layoutOptions:{[option+'port.side']:meta.potential>0?'SOUTH':'NORTH'}}]});}
    }
    const local={id:node.id+'_local',children,edges},classic=prepareClassicLayout(local,localCells,lookup,null,{maxActive:node.spiceClassic?12:8,currentFlow:!!node.spiceClassic,motifs});if(!classic){if(node.spiceClassic)failures.push({stage:node.spiceGroup,reason:'Ineligible classic stage'});return;}
    const tiled=tileTransistorPairs(local,pairs);
    let installed;try {const placed=tiled.restore(await elk.layout(local,{layoutOptions:{[option+'algorithm']:'layered',[option+'edgeRouting']:'ORTHOGONAL',[option+'separateConnectedComponents']:false,[option+'hierarchyHandling']:'SEPARATE_CHILDREN',...classic.options,...node.spiceClassic?{[option+'direction']:'DOWN',[option+'layered.spacing.nodeNodeBetweenLayers']:32,[option+'spacing.nodeNode']:Math.max(32,...classic.branches.map(n=>n.width+24))}:{}}}));installed=installClassicRails(placed,classic,localCells,lookup);}catch(error){failures.push({stage:node.spiceGroup,reason:error.message});return;}
    if(!installed){if(node.spiceClassic)failures.push({stage:node.spiceGroup,reason:classic.failure});return;}
    if(node.spiceClassic){const wires=segments(installed.graph,lookup);for(let i=0;i<wires.length;i++)for(let j=i+1;j<wires.length;j++)if(wires[i].bit!==wires[j].bit&&contact(wires[i],wires[j])){failures.push({stage:node.spiceGroup,reason:'Internal wire contact',a:wires[i],b:wires[j]});return;}}
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
      const power=meta?.potential!==null&&meta?.potential!==undefined,preferred=power?(node.spiceClassic?(meta.potential>0?'NORTH':'SOUTH'):'WEST'):port.layoutOptions?.[option+'port.side'];let boundary,side,lead;
      const bit=localCells[proxies.get(port.id).slice(0,proxies.get(port.id).lastIndexOf('.'))].connections.A[0];
      const foreign=[...segments(placed,lookup),...[...boundaries.values()].flatMap(v=>v.lead.slice(1).map((b,i)=>({a:v.lead[i],b,bit:v.bit})))].filter(s=>s.bit!==bit),choices=[];
      for(const candidate of [...new Set([preferred,'WEST','EAST','NORTH','SOUTH'])].filter(Boolean))for(const offset of node.spiceClassic?[0,-16,16,-32,32,-64,64,-96,96]:[0]){
        const horizontal=candidate==='WEST'||candidate==='EAST',b={x:candidate==='WEST'?0:candidate==='EAST'?width:p.x+offset,y:candidate==='NORTH'?0:candidate==='SOUTH'?height:p.y+offset};
        if(b.x<0||b.x>width||b.y<0||b.y>height)continue;const ps=offset?[p,horizontal?{x:p.x,y:b.y}:{x:b.x,y:p.y},b]:[p,b];
        if(ps.slice(1).some((b,i)=>physical.some(n=>Math.max(ps[i].x,b.x)>n.x+.02&&Math.min(ps[i].x,b.x)<n.x+n.width-.02&&Math.max(ps[i].y,b.y)>n.y+.02&&Math.min(ps[i].y,b.y)<n.y+n.height-.02)))continue;
        if(node.spiceClassic&&ps.slice(1).some((b,i)=>foreign.some(s=>contact({a:ps[i],b},s))))continue;
        const length=ps.slice(1).reduce((sum,b,i)=>sum+Math.abs(b.x-ps[i].x)+Math.abs(b.y-ps[i].y),0);choices.push({b,side:candidate,lead:ps,cost:length+(candidate===preferred?0:40)});
      }
      const chosen=choices.sort((a,b)=>a.cost-b.cost)[0];if(chosen){boundary=chosen.b;side=chosen.side;lead=chosen.lead;}
      if(!boundary){if(node.spiceClassic)failures.push({stage:node.spiceGroup,reason:'No clear boundary lead'});return;}boundaries.set(port.id,{p,boundary,bit,lead});
      port.x=boundary.x;port.y=boundary.y;port.layoutOptions={...port.layoutOptions,[option+'port.side']:side};
    }
    for(const port of resolvedPorts)if(!proxies.has(port.id)){const side=port.layoutOptions?.[option+'port.side'];port.x=side==='EAST'?width:0;port.y=side==='SOUTH'?height:0;}
    const routed=originals.map(e=>{
      const source=e.sources?.[0]||e.sourcePort,target=e.targets?.[0]||e.targetPort,a=endpoint(source),b=endpoint(target),points=route(a,b);
      if(!points.length)points.push(point(a));if(boundaries.has(source))points.unshift(...boundaries.get(source).lead.slice(1).reverse());if(boundaries.has(target))points.push(...boundaries.get(target).lead.slice(1));
      const clean=[];for(const p of points)if(!clean.length||Math.abs(p.x-clean.at(-1).x)>.002||Math.abs(p.y-clean.at(-1).y)>.002)clean.push(p);
      if(clean.length===1)clean.push({...clean[0]});return {...e,sections:[{id:e.id+'_classic',incomingShape:source,outgoingShape:target,startPoint:clean[0],bendPoints:clean.slice(1,-1),endPoint:clean.at(-1)}],container:node.id};
    });
    const clean=value=>{if(value&&typeof value==='object'){delete value.$H;for(const v of Object.values(value))clean(v);}return value;};
    for(const e of routed)for(const s of e.sections){const points=[s.startPoint,...s.bendPoints,s.endPoint];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],hit=physical.find(n=>Math.max(a.x,b.x)>n.x+.02&&Math.min(a.x,b.x)<n.x+n.width-.02&&Math.max(a.y,b.y)>n.y+.02&&Math.min(a.y,b.y)<n.y+n.height-.02);if(hit){failures.push({instance:node.spiceGroup,edge:e.id,symbol:cells[hit.id].attributes.displayRef,segment:{a,b},box:{x:hit.x,y:hit.y,width:hit.width,height:hit.height}});return;}}}
    hidden.set(node.id,{children:clean(physical),edges:clean(routed)});node.ports=resolvedPorts;delete node.children;delete node.edges;node.width=width;node.height=height;node.layoutOptions={...node.layoutOptions,[option+'portConstraints']:'FIXED_POS'};
    pairConstraints.push(...tiled.pairs);appliedMotifs.push(...classic.appliedMotifs);if(node.spiceClassic)stages.push(node.spiceGroup);else successful.push(node.spiceGroup.slice('@instance_'.length));
  }
  await visit(graph);return {instances:successful,stages,appliedMotifs,pairConstraints,failures,restore:layout=>{const visit=n=>{if(hidden.has(n.id))Object.assign(n,hidden.get(n.id));for(const child of n.children||[])visit(child);};visit(layout);return layout;}};
}
