import {transistorCurrentRank} from './transistor-flow.js';
import {applyMotifPreferences} from './motif-layout.js';
const option='org.eclipse.elk.';
const known=p=>p?.potential!==null&&p?.potential!==undefined;
const pointOn=(p,a,b)=>Math.abs(a.x-b.x)<.002?Math.abs(p.x-a.x)<.002&&p.y>=Math.min(a.y,b.y)-.002&&p.y<=Math.max(a.y,b.y)+.002:Math.abs(p.y-a.y)<.002&&p.x>=Math.min(a.x,b.x)-.002&&p.x<=Math.max(a.x,b.x)+.002;

/** Keep known supplies out of visual hierarchy routing; one rail per real net. */
export function prepareSharedClassicRails(graph,cells,lookup,description) {
  if(!description?.groups.some(g=>g.direction==='classic')||Object.keys(cells).length>80||Object.values(cells).some(c=>c.spiceBlock))return null;
  const rails=new Map();for(const c of Object.values(cells))for(const [pin,[bit]]of Object.entries(c.connections))if(known(c.spiceLayout?.ports[pin]))rails.set(bit,c.spiceLayout.ports[pin].potential);
  if(rails.size<2||rails.size>5)return null;
  const sources=[],railPorts=[];graph.children=graph.children.filter(n=>{const c=cells[n.id],all=Object.values(c.connections).every(([b])=>rails.has(b));if(all&&c.spiceLayout?.kind==='V'){sources.push(n);return false;}if(all&&c.spiceLayout?.kind==='PORT'){railPorts.push(n);return false;}return true;});
  const railEdges=graph.edges.filter(e=>rails.has(Number(lookup[e.id]?.replaceAll(',',''))));graph.edges=graph.edges.filter(e=>!railEdges.includes(e));
  return {rails,railEdges,sources,railPorts,unusedPorts:[],branches:[]};
}

/** ELK lays out the transistor/signal skeleton; simple rail branches use local templates. */
export function prepareClassicLayout(graph,cells,lookup,description,{maxActive=32,currentFlow=false,motifs=[]}={}) {
  if(description?.groups.some(g=>g.members.length)||description?.relations.length)return null;
  const active=Object.entries(cells).filter(([,c])=>['Q','M','J','Z'].includes(c.spiceLayout?.kind));
  if(!active.length||active.length>maxActive||Object.keys(cells).length>80||Object.values(cells).some(c=>c.spiceBlock||Object.keys(c.connections).length>4||c.spiceLayout&&!['Q','M','J','Z','R','L','C','D','V','I','PORT'].includes(c.spiceLayout.kind)))return null;
  const dense=active.length>8;currentFlow ||= dense;
  const rails=new Map();for(const c of Object.values(cells))for(const [pin,[bit]]of Object.entries(c.connections))if(known(c.spiceLayout?.ports[pin]))rails.set(bit,c.spiceLayout.ports[pin].potential);
  if(rails.size<2||rails.size>5)return null;
  const sourceIds=new Set(Object.entries(cells).filter(([,c])=>c.spiceLayout?.kind==='V'&&Object.values(c.connections).every(([bit])=>rails.has(bit))).map(([id])=>id));
  const sources=graph.children.filter(n=>sourceIds.has(n.id));
  const railPortIds=new Set(Object.entries(cells).filter(([,c])=>c.spiceLayout?.kind==='PORT'&&Object.values(c.connections).every(([bit])=>rails.has(bit))).map(([id])=>id)),railPorts=graph.children.filter(n=>railPortIds.has(n.id));
  const counts=new Map();for(const c of Object.values(cells))for(const [bit]of Object.values(c.connections))counts.set(bit,(counts.get(bit)||0)+1);
  const unusedIds=new Set(Object.entries(cells).filter(([,c])=>c.spiceLayout?.kind==='PORT'&&Object.values(c.connections).every(([bit])=>counts.get(bit)===1)&&!Object.values(c.connections).some(([bit])=>rails.has(bit))).map(([id])=>id)),unusedPorts=graph.children.filter(n=>unusedIds.has(n.id));
  const railEdges=graph.edges.filter(e=>rails.has(Number(lookup[e.id]?.replaceAll(',','')))),signalEdges=graph.edges.filter(e=>!railEdges.includes(e));
  const branches=graph.children.filter(n=>cells[n.id]?.spiceLayout?.passive&&Object.values(cells[n.id].connections).filter(([bit])=>rails.has(bit)).length===1).sort((a,b)=>Number(cells[a.id].spiceLayout.kind==='C')-Number(cells[b.id].spiceLayout.kind==='C')),branchIds=new Set(branches.map(n=>n.id));
  const original=graph.children;graph.children=graph.children.filter(n=>!sourceIds.has(n.id)&&!branchIds.has(n.id)&&!railPortIds.has(n.id)&&!unusedIds.has(n.id));
  const core=new Set(graph.children.map(n=>n.id)),signalNets=new Map();
  for(const e of signalEdges){const net=lookup[e.id];if(!signalNets.has(net))signalNets.set(net,new Set());for(const id of [e.sourcePort,e.targetPort])signalNets.get(net).add(id);}
  graph.edges=[];let serial=0;
  const rank=id=>{const at=id.lastIndexOf('.'),owner=id.slice(0,at),pin=id.slice(at+1),cell=cells[owner],meta=cell.spiceLayout,port=graph.children.find(n=>n.id===owner)?.ports.find(p=>p.id===id),side=port?.layoutOptions?.[option+'port.side'];if(meta?.kind==='PORT'){const feedback=currentFlow&&Object.values(cells).some(c=>c.spiceLayout?.kind==='PORT'&&Object.entries(c.connections).some(([p,[bit]])=>bit===cell.connections[pin][0]&&c.spiceLayout.ports[p]?.role==='out'));return meta.ports[pin]?.role==='in'&&!feedback?-1:3;}if(currentFlow&&meta?.kind==='V')return -1;const current=transistorCurrentRank(cell,pin);if(currentFlow&&current!==null)return current;if(meta?.kind==='Q'&&cell.connections.C[0]===cell.connections.B[0])return meta.polarity==='n'?2:0;if(['Q','M','J','Z'].includes(meta?.kind))return ['B','G'].includes(pin)?2:0;return ['SOUTH','EAST'].includes(side)?0.5:1.5;};
  for(const [net,pins]of signalNets){const kept=[...pins].filter(p=>core.has(p.slice(0,p.lastIndexOf('.')))).sort((a,b)=>rank(a)-rank(b));for(const target of kept.slice(1)){const source=kept[0],id='__classic_'+serial++;lookup[id]=net;graph.edges.push({id,source:source.slice(0,source.lastIndexOf('.')),sourcePort:source,target:target.slice(0,target.lastIndexOf('.')),targetPort:target});}}
  const controls=new Set(active.map(([,c])=>c.connections[c.spiceLayout.kind==='Q'?'B':'G']?.[0])),columns=new Map();
  for(const branch of branches){const bits=Object.values(cells[branch.id].connections).map(b=>b[0]),signal=bits.find(b=>!rails.has(b)),rail=bits.find(b=>rails.has(b));if(controls.has(signal)){const key=signal+':'+(rails.get(rail)>0?'upper':'lower');columns.set(key,(columns.get(key)||0)+branch.width+24);}}
  const appliedMotifs=applyMotifPreferences(graph,motifs);
  return {rails,railEdges,sources,railPorts,unusedPorts,branches,signalNets,core,original,appliedMotifs,options:{[option+'direction']:dense?'DOWN':'RIGHT',[option+'layered.layering.strategy']:'NETWORK_SIMPLEX',...appliedMotifs.length?{[option+'layered.considerModelOrder.strategy']:'NODES_AND_EDGES'}:{},[option+'layered.spacing.nodeNodeBetweenLayers']:dense?32:Math.max(120,...[...columns.values()].map(w=>w+36)),...dense?{[option+'spacing.nodeNode']:Math.max(32,...branches.map(n=>n.width+24))}:{}}};
}

/** Specialized supply-rail geometry; signal placement/routing remains ELK's job. */
export function installClassicRails(layout,classic,cells,lookup) {
  const fail=message=>{classic.failure=message;return null;};
  const graph=structuredClone(layout),positive=[...classic.rails].filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]),low=[...classic.rails].filter(([,v])=>v<=0).sort((a,b)=>b[1]-a[1]);
  const coreNodes=new Map(graph.children.map(n=>[n.id,n])),corePoint=id=>{const split=id.lastIndexOf('.'),n=coreNodes.get(id.slice(0,split)),p=n?.ports.find(p=>p.id===id);return p?{x:n.x+p.x,y:n.y+p.y,owner:n.id,pin:id.slice(split+1),side:p.layoutOptions?.[option+'port.side']}:null;};
  const branchHeight=Math.max(0,...classic.branches.map(n=>n.height)),upperY=-branchHeight-40,lowerY=graph.height+40,occupied={upper:[],lower:[]},branchPaths=[];
  const branchNodes=new Map();
  for(const branch of classic.branches) {
    const cell=cells[branch.id],[signalPin,[signalBit]]=Object.entries(cell.connections).find(([,b])=>!classic.rails.has(b[0])),[railPin,[railBit]]=Object.entries(cell.connections).find(([,b])=>classic.rails.has(b[0]));
    const group=[...classic.signalNets].find(([net])=>Number(net.replaceAll(',',''))===signalBit);if(!group)return fail('No signal anchor for '+branch.id);
    const anchors=[...group[1]].map(id=>({id,p:corePoint(id)})).filter(a=>a.p);
    if(!anchors.length)return fail('No core terminal for '+branch.id);const upper=classic.rails.get(railBit)>0,slot=upper?'upper':'lower',signalPort=branch.ports.find(p=>p.id===branch.id+'.'+signalPin);let chosen;
    const candidates=[];
    for(const anchor of anchors) {
      const control=['Q','M','J','Z'].includes(cells[anchor.p.owner].spiceLayout?.kind)&&['B','G'].includes(anchor.p.pin),detour=upper&&anchor.p.side==='SOUTH'||!upper&&anchor.p.side==='NORTH';
      let preferred=anchor.p.x-signalPort.x;if(control)preferred+=anchor.p.side==='EAST'?branch.width+28:-branch.width-28;
      if(detour){const owner=coreNodes.get(anchor.p.owner);preferred=owner.x+owner.width+28-signalPort.x;}
      const direction=control&&anchor.p.side!=='EAST'?-1:1;
      for(const offset of control?[0,1,2,3]:[0,1,-1,2,-2,3]) {
        const x=preferred+direction*offset*(branch.width+24);
        for(const y of [anchor.p.y+(upper?-24:24)-signalPort.y,anchor.p.y+(upper?-64:64)-signalPort.y,upper?upperY:lowerY]){
        const node={...branch,x,y};
        if(graph.children.some(n=>x<n.x+n.width+8&&x+branch.width+8>n.x&&y<n.y+n.height+8&&y+branch.height+8>n.y))continue;
        const p={x:x+signalPort.x,y:node.y+signalPort.y},escapeY=anchor.p.y+(anchor.p.side==='NORTH'?-18:18),bends=detour?[{x:anchor.p.x,y:escapeY},{x:p.x,y:escapeY}]:[{x:p.x,y:anchor.p.y}],points=[anchor.p,...bends,p];
        if(points.slice(1).some((b,i)=>graph.children.some(n=>Math.max(points[i].x,b.x)>n.x+.02&&Math.min(points[i].x,b.x)<n.x+n.width-.02&&Math.max(points[i].y,b.y)>n.y+.02&&Math.min(points[i].y,b.y)<n.y+n.height-.02)))continue;
        const wires=[...graph.edges,...branchPaths].flatMap(e=>(e.sections||[]).flatMap(s=>{const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];return ps.slice(1).map((b,i)=>({a:ps[i],b,bit:Number(lookup[e.id]?.replaceAll(',',''))}));}));
        if(wires.some(s=>Math.max(s.a.x,s.b.x)>node.x+.02&&Math.min(s.a.x,s.b.x)<node.x+node.width-.02&&Math.max(s.a.y,s.b.y)>node.y+.02&&Math.min(s.a.y,s.b.y)<node.y+node.height-.02))continue;
        const on=(q,a,b)=>Math.abs(a.x-b.x)<.02?Math.abs(q.x-a.x)<.02&&q.y>=Math.min(a.y,b.y)-.02&&q.y<=Math.max(a.y,b.y)+.02:Math.abs(q.y-a.y)<.02&&q.x>=Math.min(a.x,b.x)-.02&&q.x<=Math.max(a.x,b.x)+.02;
        if(wires.filter(s=>s.bit!==signalBit).some(s=>points.slice(1).some((b,i)=>on(points[i],s.a,s.b)||on(b,s.a,s.b)||on(s.a,points[i],b)||on(s.b,points[i],b))))continue;
        const active=['Q','M','J','Z'].includes(cells[anchor.p.owner].spiceLayout?.kind),penalty=!active?1000:['E','S'].includes(anchor.p.pin)?0:control?24:8;
        candidates.push({anchor,node,p,bends,score:Math.abs(p.x-anchor.p.x)+Math.abs(p.y-anchor.p.y)+penalty});
        }
      }
    }
    chosen=candidates.sort((a,b)=>a.score-b.score)[0];
    if(!chosen)return fail('No unobstructed local branch for '+branch.id);
    const {anchor,node,p,bends}=chosen;occupied[slot].push(node);branchNodes.set(node.id,node);graph.children.push(node);
    const id='__branch_'+branchPaths.length;lookup[id]=group[0];branchPaths.push({id,source:anchor.p.owner,sourcePort:anchor.id,target:node.id,targetPort:node.id+'.'+signalPin,sections:[{id:id+'_s',startPoint:{x:anchor.p.x,y:anchor.p.y},bendPoints:bends,endPoint:p}]});
  }
  graph.edges.push(...branchPaths);
  for(const edge of branchPaths)for(const s of edge.sections){const points=[s.startPoint,...s.bendPoints,s.endPoint];for(let i=1;i<points.length;i++){const hit=graph.children.find(n=>n.id!==edge.target&&Math.max(points[i-1].x,points[i].x)>n.x+.02&&Math.min(points[i-1].x,points[i].x)<n.x+n.width-.02&&Math.max(points[i-1].y,points[i].y)>n.y+.02&&Math.min(points[i-1].y,points[i].y)<n.y+n.height-.02);if(hit)return fail('Branch '+edge.id+' crosses symbol '+hit.id);}}
  const minX=Math.min(0,...graph.children.map(n=>n.x)),minY=Math.min(0,...graph.children.map(n=>n.y));
  graph.height=Math.max(...graph.children.map(n=>n.y+n.height))-minY;
  const sourceWidth=classic.sources.reduce((n,s)=>n+s.width+18,0)+24,portWidth=Math.max(0,...classic.railPorts.map(n=>n.width))+24,left=Math.max(sourceWidth+24,portWidth+24)-minX,pitch=Math.max(180,graph.height+100),railBase=classic.railPorts.length?80:30,top=Math.max(0,positive.length-1)*pitch+railBase+35-minY;
  for(const n of graph.children){n.x+=left;n.y+=top;}
  for(const e of graph.edges)for(const s of e.sections||[]){for(const p of [s.startPoint,...s.bendPoints||[],s.endPoint]){p.x+=left;p.y+=top;}for(const p of e.junctionPoints||[]){p.x+=left;p.y+=top;}}
  const railY=new Map([...positive,...low].map(([bit],i)=>[bit,railBase+i*pitch]));
  let sourceX=12;
  classic.sources.forEach(n=>{const cell=cells[n.id],bit=cell.connections['+']?.[0],y=railY.get(bit)??30,plus=n.ports.find(p=>p.id===n.id+'.+'),below=plus?.layoutOptions?.[option+'port.side']==='SOUTH';graph.children.push({...n,x:sourceX,y:below?y-n.height-22:y+22});sourceX+=n.width+18;});
  classic.railPorts.forEach(n=>{const bit=Object.values(cells[n.id].connections)[0][0],y=railY.get(bit),p=n.ports[0],above=p.layoutOptions?.[option+'port.side']==='SOUTH';graph.children.push({...n,x:12,y:above?y-n.height-12:y+12});});
  const unusedX=Math.max(...graph.children.map(n=>n.x+n.width))+24;
  classic.unusedPorts.forEach((n,i)=>graph.children.push({...n,x:unusedX,y:railBase+75+i*(n.height+20)}));
  const nodes=new Map(graph.children.map(n=>[n.id,n]));
  const endpoint=id=>{const split=id.lastIndexOf('.'),n=nodes.get(id.slice(0,split)),p=n?.ports.find(p=>p.id===id);if(!p)throw Error('Missing classic rail terminal.');return {x:n.x+p.x,y:n.y+p.y,owner:n.id,side:p.layoutOptions?.[option+'port.side']};};
  const paths=new Map();
  const obstacle=(a,b)=>graph.children.find(n=>Math.max(a.x,b.x)>n.x+.02&&Math.min(a.x,b.x)<n.x+n.width-.02&&Math.max(a.y,b.y)>n.y+.02&&Math.min(a.y,b.y)<n.y+n.height-.02);
  const foreignPin=(a,b,bit)=>graph.children.some(n=>n.ports.some(p=>{const value=cells[n.id]?.connections[p.id.slice(n.id.length+1)]?.[0];return value!==undefined&&value!==bit&&pointOn({x:n.x+p.x,y:n.y+p.y},a,b);}));
  for(const edge of classic.railEdges) {
    const bit=Number(lookup[edge.id]?.replaceAll(',','')),y=railY.get(bit);
    for(const id of [edge.sourcePort,edge.targetPort])if(!paths.has(id)) {
      const p=endpoint(id),out=p.side==='EAST'?{x:p.x+14,y:p.y}:p.side==='WEST'?{x:p.x-14,y:p.y}:p,join={x:out.x,y};
      let points=[p,...out!==p?[out]:[],join];
      const clear=ps=>ps.slice(1).every((b,i)=>!obstacle(ps[i],b)&&!foreignPin(ps[i],b,bit));
      if(!clear(points)){
        // Keep a clear direct rail tap whenever possible. A buried collector
        // may need a short outward escape before reaching the shared rail.
        const owner=nodes.get(p.owner),xs=[p.x-24,p.x+24,owner.x-24,owner.x+owner.width+24,...graph.children.flatMap(n=>[n.x-16,n.x+n.width+16]),Math.min(...graph.children.map(n=>n.x))-24,Math.max(...graph.children.map(n=>n.x+n.width))+24];
        const length=ps=>ps.slice(1).reduce((sum,b,i)=>sum+Math.abs(b.x-ps[i].x)+Math.abs(b.y-ps[i].y),0);
        const choices=[8,16,24,32,48,64,96].flatMap(distance=>{const exit={x:p.x+(p.side==='WEST'?-distance:p.side==='EAST'?distance:0),y:p.y+(p.side==='NORTH'?-distance:p.side==='SOUTH'?distance:0)};return xs.map(x=>[p,exit,{x,y:exit.y},{x,y}]);}).filter(clear).sort((a,b)=>length(a)-length(b));
        if(!choices.length)return fail('No clear rail escape for '+id);points=choices[0];
      }
      paths.set(id,points);
    }
    const a=paths.get(edge.sourcePort),b=paths.get(edge.targetPort),points=[...a,{x:b.at(-1).x,y},...b.slice(0,-1).reverse()],clean=[];
    for(const p of points)if(!clean.length||Math.abs(p.x-clean.at(-1).x)>.002||Math.abs(p.y-clean.at(-1).y)>.002)clean.push({x:p.x,y:p.y});
    graph.edges.push({...edge,sections:[{id:edge.id+'_rail',startPoint:clean[0],bendPoints:clean.slice(1,-1),endPoint:clean.at(-1)}],junctionPoints:[]});
  }
  const wirePoints=graph.edges.flatMap(e=>(e.sections||[]).flatMap(s=>[s.startPoint,...s.bendPoints||[],s.endPoint])),wireLeft=Math.min(0,...wirePoints.map(p=>p.x));
  if(wireLeft<0){const shift=16-wireLeft;for(const n of graph.children)n.x+=shift;for(const e of graph.edges){for(const s of e.sections||[])for(const p of [s.startPoint,...s.bendPoints||[],s.endPoint])p.x+=shift;for(const p of e.junctionPoints||[])p.x+=shift;}}
  graph.width=Math.max(...graph.children.map(n=>n.x+n.width),...wirePoints.map(p=>p.x))+24;graph.height=Math.max(...graph.children.map(n=>n.y+n.height),...railY.values(),...wirePoints.map(p=>p.y))+40;
  // A terminal's owner is also an obstacle: bypassing it allowed a load tap
  // from a capacitor's B terminal to be drawn back through that capacitor.
  for(const edge of graph.edges)for(const section of edge.sections||[]){const points=[section.startPoint,...section.bendPoints||[],section.endPoint];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],hit=graph.children.find(n=>Math.max(a.x,b.x)>n.x+.02&&Math.min(a.x,b.x)<n.x+n.width-.02&&Math.max(a.y,b.y)>n.y+.02&&Math.min(a.y,b.y)<n.y+n.height-.02);if(hit)return fail('Wire '+edge.id+' crosses symbol '+hit.id);}}
  const wires=graph.edges.flatMap(e=>(e.sections||[]).flatMap(s=>{const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];return ps.slice(1).map((b,i)=>({a:ps[i],b,bit:Number(lookup[e.id]?.replaceAll(',',''))}));}));
  for(const s of wires)if(foreignPin(s.a,s.b,s.bit))return fail('Wire touches a different-net terminal');
  for(let i=0;i<wires.length;i++)for(let j=i+1;j<wires.length;j++){const a=wires[i],b=wires[j];if(a.bit!==b.bit&&(pointOn(a.a,b.a,b.b)||pointOn(a.b,b.a,b.b)||pointOn(b.a,a.a,a.b)||pointOn(b.b,a.a,a.b)))return fail('Different-net wire contact in classic template');}
  return {graph,translation:{x:left+(wireLeft<0?16-wireLeft:0),y:top},railPitch:pitch,railCount:railY.size,railBands:[...railY].map(([bit,y])=>({bit,potential:classic.rails.get(bit),y}))};
}
