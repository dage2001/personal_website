// Version-pinned extension point for netlistsvg 1.0.2. Keep its graph and SVG format.
import onml from 'onml';
import ELK from 'elkjs';
import flatModulePackage from 'netlistsvg/built/FlatModule.js';
import skinPackage from 'netlistsvg/built/Skin.js';
import graphPackage from 'netlistsvg/built/elkGraph.js';
import drawPackage from 'netlistsvg/built/drawModule.js';
import {alignGroundBus,straightenGroundDrops,attachGroundSymbol,refreshGroundJunctions,validateGroundAttachment} from './ground-layout.js';
import {flattenElkGroups} from './compact-groups.js';
import {planLayoutGroups,removeLayoutGuides} from './layout-planner.js';
import {normalizeSvgNets} from './net-geometry.js';
import {prepareClassicLayout,prepareSharedClassicRails,installClassicRails} from './classic-layout.js';
import {splitHierarchyEdges,reuniteHierarchyEdges} from './hierarchy-routing.js';
import {placeOutputShunts} from './output-shunts.js';
import {layoutLocalClassicInstances} from './local-classic.js';
import {controlSideChoices,mirrorTransistorSkin} from './transistor-orientation.js';
import {motifControlChoices,measureMotifs} from './motif-layout.js';
import {rigidTransistorPairs,declaredFaceSkin,pairedTransistorSkin,mirroredSkinDevices,tileTransistorPairs} from './paired-layout.js';
import {shortenLayoutNets} from './net-shortcuts.js';
const {FlatModule}=flatModulePackage, Skin=skinPackage.default||skinPackage;
const drawModule=drawPackage.default||drawPackage;
const option='org.eclipse.elk.';

function portRole(port,cells) {
  const cell=cells[port.parentNode.Key],meta=cell?.spiceLayout?.ports[port.key];
  if(cell?.type&&cell.attributes.name==='0')return 'ret';
  if(['pwr','ret','bias'].includes(meta?.role)||meta?.role==='unknown'&&meta?.potential!==null&&meta?.potential!==undefined)return 'rail';
  if(meta?.role==='io')return 'neutral';
  if(cell?.spiceBlock&&meta?.role==='out')return 'driver';
  if(cell?.spiceBlock&&meta?.role==='in')return 'sink';
  // A sheet input emits into its own sheet; a block input receives from its parent.
  if(cell?.attributes.value&&Object.keys(cell.connections).length===1)return meta?.role==='in'?'driver':meta?.role==='out'?'sink':'neutral';
  if(cell?.connections['+']&&meta?.role==='in'&&port.key==='+')return 'driver';
  if(cell?.spiceLayout?.source&&['+','-'].includes(port.key))return 'driver';
  if(['Q','M','J','Z'].includes(cell?.spiceLayout?.kind)&&['E','S'].includes(port.key))return 'driver';
  if(port.key==='G'&&['M','J','Z'].includes(cell?.spiceLayout?.kind)||port.key==='B'&&cell?.spiceLayout?.kind==='Q'||['C+','C-'].includes(port.key))return 'sink';
  // This is a geometric reading direction, not an electrical pin declaration.
  // Apply it uniformly to blocks and discrete series parts, rather than giving
  // every block output priority over all nearby discrete components.
  if(cell?.spiceBlock||cell?.spiceLayout?.flexible) {
    const template=port.parentNode.getTemplate(),p=Skin.getPortsWithPrefix(template,'').find(p=>p[1]['s:pid']===port.key);
    if(p?.[1]['s:position']==='left')return 'sink';
    if(p?.[1]['s:position']==='right')return 'driver';
  }
  return 'neutral';
}

export async function renderConventional(skin,netlist,{groundDecoration=true,balanced=false,wrapping=false,groupParallel=true,classicLayout=true,localClassics=true,sharedRails=true,chooseControlSides=true,motifLayout=true,pairedDevices=true,compoundPairs=true,onLayout=null,onRawLayout=null}={}) {
  const pairCells=netlist.modules.circuit.cells,pairs=pairedDevices&&motifLayout?rigidTransistorPairs(netlist.modules.circuit.spiceMotifs||[],pairCells,netlist.modules.circuit.spiceLayoutDescription).filter(p=>compoundPairs||p.placement!=='stagger'):[];
  skin=pairedTransistorSkin(skin,pairCells,pairs);skin=declaredFaceSkin(skin,pairCells,netlist.modules.circuit.spiceLayoutDescription?.faces||[],pairs);Skin.skin=onml.parse(skin);
  const flat=new FlatModule(netlist);flat.createWires();
  const cells=netlist.modules.circuit.cells,motifs=netlist.modules.circuit.spiceMotifs||[],activeMotifs=motifLayout?motifs.filter(m=>compoundPairs||['current-mirror','differential-pair','diode-connected','vbe-multiplier'].includes(m.kind)):[];
  const groundIds=new Set(groundDecoration?Object.entries(cells).filter(([,c])=>c.attributes.name==='0').map(([id])=>id):[]);
  // Reorder each real net's star hub. No guide-only edges or electrical aliases.
  for(const wire of flat.wires) {
    const ports=[...wire.drivers,...wire.riders,...wire.laterals].filter(p=>!groundIds.has(p.parentNode.Key));
    const rank=p=>({driver:0,neutral:1,sink:2,rail:3,ret:3})[portRole(p,cells)];
    ports.sort((a,b)=>rank(a)-rank(b));
    wire.drivers=[];wire.riders=[];wire.laterals=ports;
  }
  const graph=graphPackage.buildElkGraph(flat);
  // Parallel two-terminal branches need space side by side, not on top of one
  // another in a single signal layer. Use a same-net spanning chain for those
  // terminals; this changes only the drawing tree, never net membership.
  const parallel=new Map(),pairOf=new Map();
  for(const [id,cell]of Object.entries(cells)) {
    const bits=(cell.spiceLayout?.source&&cell.connections['+']&&cell.connections['-']?[cell.connections['+'],cell.connections['-']]:Object.values(cell.connections)).map(b=>b[0]);
    if(bits.length!==2||bits[0]===bits[1])continue;
    const pair=[...bits].sort((a,b)=>a-b).join(':');pairOf.set(id,pair);
    if(!parallel.has(pair))parallel.set(pair,[]);parallel.get(pair).push(id);
  }
  for(const wire of flat.wires) {
    const ports=wire.laterals;if(ports.length<3||ports.some(p=>['rail','ret'].includes(portRole(p,cells))))continue;
    const edges=graph.edges.filter(e=>graphPackage.ElkModel.wireNameLookup[e.id]===wire.netName),previous=new Map();
    const root=ports[0],group=p=>{const pair=pairOf.get(p.parentNode.Key);return parallel.get(pair)?.length>1?pair:null;};
    if(group(root))previous.set(group(root),root);
    ports.slice(1).forEach((port,i)=>{
      const pair=group(port),parent=pair&&previous.get(pair)||root,e=edges[i];
      e.source=parent.parentNode.Key;e.sourcePort=e.source+'.'+parent.key;e.target=port.parentNode.Key;e.targetPort=e.target+'.'+port.key;
      if(pair)previous.set(pair,port);
    });
  }
  for(const child of graph.children) {
    const template=flat.nodes.find(n=>n.Key===child.id)?.getTemplate();
    const sides=new Map(Skin.getPortsWithPrefix(template,'').map(p=>[p[1]['s:pid'],{top:'NORTH',bottom:'SOUTH',left:'WEST',right:'EAST'}[p[1]['s:position']]]));
    for(const port of child.ports) {
      const side=sides.get(port.id.slice(child.id.length+1));
      // Some generic symbols reserve a label area below the body. Their body
      // ports are internal to the overall bounds; do not project those ports
      // onto the outer rectangle by forcing a side.
      const onBorder=side==='NORTH'?Math.abs(port.y)<.02:side==='SOUTH'?Math.abs(port.y-child.height)<.02:side==='WEST'?Math.abs(port.x)<.02:side==='EAST'?Math.abs(port.x-child.width)<.02:false;
      if(onBorder)port.layoutOptions={...port.layoutOptions,[option+'port.side']:side};
    }
  }
  const fixedPorts=new Map(graph.children.flatMap(n=>n.ports.map(p=>[p.id,{x:p.x,y:p.y}])));
  const groundNodes=graph.children.filter(c=>groundIds.has(c.id));
  graph.children=graph.children.filter(c=>!groundIds.has(c.id));
  const power=[];
  for(const child of graph.children) {
    const cell=cells[child.id],meta=cell?.spiceLayout;
    if(meta?.supply||cell?.attributes.name==='0') {
      power.push({child,voltage:meta?.supply?meta.voltage:0});
    }
  }
  for(const edge of graph.edges) {
    const bit=graphPackage.ElkModel.wireNameLookup[edge.id];
    const wire=flat.wires.find(w=>w.netName===bit);
    const isRail=wire.laterals.some(p=>['rail','ret'].includes(portRole(p,cells)));
    const a=pairOf.get(edge.source),b=pairOf.get(edge.target),paired=a&&a===b&&parallel.get(a)?.length>1;
    edge.layoutOptions={...edge.layoutOptions,[option+'layered.priority.direction']:isRail?0:10,[option+'layered.priority.shortness']:isRail?0:paired?20:1,[option+'layered.priority.straightness']:paired?20:1};
  }
  const classic=classicLayout?prepareClassicLayout(graph,cells,graphPackage.ElkModel.wireNameLookup,netlist.modules.circuit.spiceLayoutDescription,{motifs:activeMotifs}):null;
  const shared=sharedRails&&!classic?prepareSharedClassicRails(graph,cells,graphPackage.ElkModel.wireNameLookup,netlist.modules.circuit.spiceLayoutDescription):null;
  const plan=classic?{explicitGroups:0,inferredGroups:0,parallelGroups:0,guideCount:0}:planLayoutGroups(graph,cells,netlist.modules.circuit.spiceLayoutDescription,groupParallel?parallel:new Map());
  const affinityGroups=plan.parallelGroups+plan.explicitGroups+plan.inferredGroups;
  const split=plan.explicitGroups?splitHierarchyEdges(graph,graphPackage.ElkModel.wireNameLookup,cells):null;
  const elk=new ELK();
  const localPlan=split&&localClassics?await layoutLocalClassicInstances(graph,cells,graphPackage.ElkModel.wireNameLookup,elk,activeMotifs,pairs):null,localClassicInstances=localPlan?.instances||[];
  const options={...Skin.getProperties().layoutEngine,
    [option+'randomSeed']:1,
    // ELK's model-order port sorter is not reliable for cross-container edges.
    // Source order is retained in the graph; let compound crossing reduction
    // choose its own order rather than forcing one type of node ahead of others.
    [option+'layered.considerModelOrder.strategy']:affinityGroups?'NONE':'NODES_AND_EDGES',
    [option+'layered.considerModelOrder.crossingCounterNodeInfluence']:affinityGroups?0:.01,
    [option+'layered.feedbackEdges']:false,
    [option+'aspectRatio']:1.6,
    [option+'hierarchyHandling']:'INCLUDE_CHILDREN',
  };
  if(balanced&&graph.children.length>8) {
    options[option+'layered.layering.strategy']='COFFMAN_GRAHAM';
    options[option+'layered.layering.coffmanGraham.layerBound']=Math.max(3,Math.ceil(Math.sqrt(graph.children.length)));
  }
  if(wrapping)options[option+'layered.wrapping.strategy']='MULTI_EDGE';
  if(classic)Object.assign(options,classic.options);
  if(split)options[option+'hierarchyHandling']='SEPARATE_CHILDREN';
  const tiles=classic?tileTransistorPairs(graph,pairs):null;
  let layout=graph.children.length?await elk.layout(graph,{layoutOptions:options}):{...graph,width:0,height:0};
  if(localPlan?.rowConstraints.length){
    const index=g=>{const map=new Map();const visit=n=>{map.set(n.id,n);for(const c of n.children||[])visit(c);};visit(g);return map;},originals=index(graph);
    for(let attempt=0;attempt<8;attempt++){
      const placed=index(layout),errors=localPlan.rowConstraints.map(r=>({...r,delta:placed.get(r.b).y+r.by-placed.get(r.a).y-r.ay}));
      if(errors.every(r=>Math.abs(r.delta)<.002))break;
      if(attempt===7)throw Error('Cross-region mirror row constraint could not be satisfied.');
      for(const r of errors)originals.get(r.b).y-=r.delta;
      layout=await elk.layout(graph,{layoutOptions:options});
    }
  }
  if(tiles)layout=tiles.restore(layout);if(localPlan)layout=localPlan.restore(layout);
  const visualGroups=[];const recordGroups=(n,x=0,y=0)=>{for(const c of n.children||[]){const cx=x+c.x,cy=y+c.y;if(c.spiceGroup&&!c.spiceGroup.startsWith('@'))visualGroups.push({name:c.spiceGroup,x:cx,y:cy,width:c.width,height:c.height});recordGroups(c,cx,cy);}};recordGroups(layout);
  const rawLayout=onRawLayout?structuredClone(layout):null;removeLayoutGuides(layout);layout=flattenElkGroups(layout);
  if(split)layout=reuniteHierarchyEdges(layout,split);
  if(classic&&tiles?.pairs.some(p=>p.placement==='stagger'))layout=shortenLayoutNets(layout,cells,[],pairs).graph;
  const railLayout=classic||shared?installClassicRails(layout,classic||shared,cells,graphPackage.ElkModel.wireNameLookup):null;
  if(shared&&!railLayout){const fallback=onml.parse(await renderConventional(skin,netlist,{groundDecoration,balanced,wrapping,groupParallel,classicLayout,localClassics,sharedRails:false,chooseControlSides,motifLayout,pairedDevices,compoundPairs,onLayout,onRawLayout})),meta=fallback.find(n=>Array.isArray(n)&&n[1]?.id==='spice-layout-report');meta[2]=JSON.stringify({...JSON.parse(meta[2]),sharedRailFallback:shared.failure});return onml.stringify(fallback);}
  if(classic&&!railLayout&&compoundPairs&&tiles?.pairs.some(p=>p.placement==='stagger')){const fallback=onml.parse(await renderConventional(skin,netlist,{groundDecoration,balanced,wrapping,groupParallel,classicLayout,localClassics,sharedRails,chooseControlSides,motifLayout,pairedDevices,compoundPairs:false,onLayout,onRawLayout})),meta=fallback.find(n=>n[1]?.id==='spice-layout-report');meta[2]=JSON.stringify({...JSON.parse(meta[2]),compoundPairFallback:classic.failure});return onml.stringify(fallback);}
  if(classic&&!railLayout){const fallback=onml.parse(await renderConventional(skin,netlist,{groundDecoration,balanced,wrapping,groupParallel,classicLayout:false,localClassics,sharedRails,chooseControlSides,motifLayout,pairedDevices,compoundPairs,onLayout,onRawLayout})),meta=fallback.find(n=>Array.isArray(n)&&n[1]?.id==='spice-layout-report');meta[2]=JSON.stringify({...JSON.parse(meta[2]),classicTemplateFallback:classic.failure||'Local template unavailable'});return onml.stringify(fallback);}
  if(railLayout){layout=railLayout.graph;for(const group of visualGroups){group.x+=railLayout.translation.x;group.y+=railLayout.translation.y;}}
  const shortcuts=shortenLayoutNets(layout,cells,railLayout?.railBands||[],pairs);layout=shortcuts.graph;
  const powerPass=balanced?'compact balanced':'compact signal flow';
  const lookup=graphPackage.ElkModel.wireNameLookup,attachments=[];
  const outputShunts=railLayout||visualGroups.length?0:placeOutputShunts(layout,cells,lookup);let straightened=0;
  for(const ground of groundNodes) {
    const bit=cells[ground.id].connections.A[0];
    if(!railLayout){straightened+=alignGroundBus(layout,lookup,bit);straightened+=straightenGroundDrops(layout,lookup,bit);}
    const attached=attachGroundSymbol(layout,lookup,ground,netlist);
    if(!attached)return renderConventional(skin,netlist,{groundDecoration:false,balanced,wrapping,groupParallel,classicLayout,localClassics,sharedRails,chooseControlSides,motifLayout,pairedDevices,compoundPairs,onLayout,onRawLayout});
    attachments.push(attached);power.push({child:attached.node,voltage:0});
    refreshGroundJunctions(layout,lookup,bit,attached);
  }
  power.sort((a,b)=>b.voltage-a.voltage);
  validateLayoutEndpoints(layout,netlist,lookup,attachments,fixedPorts);
  const positions=new Map(layout.children.map(n=>[n.id,n]));
  let inversions=0;
  for(let i=0;i<power.length;i++)for(let j=i+1;j<power.length;j++)if(power[i].voltage>power[j].voltage&&positions.get(power[i].child.id).y>=positions.get(power[j].child.id).y)inversions++;
  let wireLength=0,bends=0,detourLength=0;
  for(const edge of layout.edges) {
    let length=0;
    for(const section of edge.sections||[]) {
      const points=[section.startPoint,...section.bendPoints||[],section.endPoint];bends+=points.length-2;
      for(let i=1;i<points.length;i++)length+=Math.abs(points[i].x-points[i-1].x)+Math.abs(points[i].y-points[i-1].y);
    }
    const a=edge.sections?.[0]?.startPoint,b=edge.sections?.at(-1)?.endPoint;
    wireLength+=length;if(a&&b)detourLength+=Math.max(0,length-Math.abs(a.x-b.x)-Math.abs(a.y-b.y));
  }
  const report={version:4,direction:'RIGHT',powerPass,powerSourcesChecked:power.length,powerOrderViolations:inversions,...plan,
    localClassicInstances,
    localClassicStages:localPlan?.stages||[],
    localClassicFallbacks:localPlan?.failures||[],
    visualGroups,motifSource:motifs.some(m=>m.origin==='annotation')?'annotation':'automatic',netShortcuts:shortcuts.cuts,netWireSaved:shortcuts.saved,pairConstraints:[...(tiles?.pairs||[]),...(localPlan?.pairConstraints||[]),...(localPlan?.crossPairs||[]).map(p=>({...p,crossRegion:true}))],recognizedMotifs:motifs,appliedMotifs:[...new Set([...(classic?.appliedMotifs||[]),...(localPlan?.appliedMotifs||[])])],...measureMotifs(layout,cells,motifs,new Set((localPlan?.crossPairs||[]).map(p=>p.motif))),sharedClassicRails:!!shared&&!!railLayout,
    outputShunts,classicRails:!!railLayout,railCount:railLayout?.railCount||0,railPitch:railLayout?.railPitch||null,voltageRails:railLayout?.railBands||[],
    width:layout.width,height:layout.height,wireLength,bends,detourLength,affinityGroups,nodeCount:Object.keys(cells).length,aspectRatio:Math.max(layout.width/layout.height,layout.height/layout.width),
    groundPlacement:attachments.some(a=>a.anchor)?'rail-attached':attachments.length?'isolated':Object.values(cells).some(c=>c.attributes.name==='0')?'ELK fallback (no clear ground attachment)':'not-present',groundAttachments:attachments.length,straightenedGroundDrops:straightened,
    powerPlacement:railLayout?'fixed local voltage rails':'local rail roles; global voltage bands are not guaranteed',verifiedTerminals:true};
  const svg=drawModule(layout,flat);
  const decorations=attachments.filter(a=>a.anchor).flatMap(a=>[
    ['line',{x1:a.anchor.x,y1:a.anchor.y,x2:a.end.x,y2:a.end.y,class:'net_'+a.bit,'data-ground-attachment':'true'}],
  ]);
  const normalized=normalizeSvgNets(svg.replace('</svg>',decorations.map(n=>onml.stringify(n)).join('')+'</svg>'),netlist);
  const baseReport={...report,...normalized.report};
  let orientationCandidates=1,testedDevices=[];
  if(chooseControlSides&&(classic||localPlan?.stages.length||localPlan?.instances.length)){
    const locked=new Set([...pairs.flatMap(p=>p.members),...(netlist.modules.circuit.spiceLayoutDescription?.faces||[]).map(f=>f.device)]),free=Object.keys(cells).filter(id=>!locked.has(id)&&['Q','M','J','Z'].includes(cells[id].spiceLayout?.kind)),choices=controlSideChoices(layout,cells).filter(id=>!locked.has(id));
    const singles=Object.keys(cells).length<=80?free:choices.slice(0,4),structural=motifControlChoices(layout,cells,activeMotifs).filter(id=>!locked.has(id)),variants=[...structural.length?[structural]:[],...choices.length?[choices]:[],...singles.map(id=>[id])],seen=new Set(['[]']);
    testedDevices=singles;let best=null,bestCost=baseReport.uniqueWireLength+(baseReport.uniqueBends??baseReport.bends)*8+3*baseReport.motifPenalty;
    const evaluate=async ids=>{const signature=JSON.stringify([...ids].sort());if(seen.has(signature))return;seen.add(signature);let candidateLayout,candidateRaw;orientationCandidates++;try{
      const alternate=await renderConventional(mirrorTransistorSkin(skin,cells,ids),netlist,{groundDecoration,balanced,wrapping,groupParallel,classicLayout,localClassics,sharedRails,chooseControlSides:false,motifLayout,pairedDevices,compoundPairs,onLayout:g=>candidateLayout=g,onRawLayout:onRawLayout?g=>candidateRaw=g:null}),ast=onml.parse(alternate),meta=ast.find(n=>n[1]?.id==='spice-layout-report'),r=JSON.parse(meta[2]),cost=r.uniqueWireLength+(r.uniqueBends??r.bends)*8+3*r.motifPenalty;
      if(r.pairConstraints.length>=baseReport.pairConstraints.length&&Number(r.sharedClassicRails)>=Number(baseReport.sharedClassicRails)&&r.localClassicStages.length>=baseReport.localClassicStages.length&&Number(r.classicRails)>=Number(baseReport.classicRails)&&cost<bestCost){bestCost=cost;best={ast,meta,r,ids,layout:candidateLayout,raw:candidateRaw};}
    }catch{/* Reject an unsafe alternative; retain a verified candidate. */}};
    for(const ids of variants)await evaluate(ids);
    // A second sweep tests marginal flips around the best complete routed result,
    // rather than assuming the neighbours stay where the original heuristic saw them.
    if(best&&Object.keys(cells).length<=80)for(let sweep=0;sweep<(netlist.modules.circuit.spiceLayoutDescription?.pairs?.length?0:3);sweep++){const before=bestCost;for(const id of singles){const ids=new Set(best.ids);if(ids.has(id))ids.delete(id);else ids.add(id);await evaluate([...ids]);}if(before-bestCost<.001)break;}
    if(best){best.meta[2]=JSON.stringify({...best.r,mirroredTransistors:best.r.mirroredTransistors,orientationDevicesTested:testedDevices,controlOrientationCandidates:orientationCandidates});onRawLayout?.(best.raw);onLayout?.(best.layout);return onml.stringify(best.ast);}
  }
  onRawLayout?.(rawLayout);onLayout?.(layout);
  return normalized.svg.replace('</svg>',onml.stringify(['metadata',{id:'spice-layout-report'},JSON.stringify({...baseReport,mirroredTransistors:mirroredSkinDevices(skin,cells),orientationDevicesTested:testedDevices,controlOrientationCandidates:orientationCandidates})])+'</svg>');
}

/** Reject omitted/misrouted terminal endpoints before rendering or caching. */
export function validateLayoutEndpoints(graph,netlist,lookup,groundAttachments=[],fixedPorts=new Map()) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),nets=new Map(),ends=new Map();
  for(const node of graph.children)for(const port of node.ports||[]) {
    const original=fixedPorts.get(port.id);
    if(original&&(Math.abs(original.x-port.x)>.02||Math.abs(original.y-port.y)>.02))throw Error('Layout moved a fixed symbol terminal.');
  }
  for(const [id,c]of Object.entries(netlist.modules.circuit.cells))for(const [pin,[bit]]of Object.entries(c.connections)) {
    const key=id+'.'+pin;nets.set(key,bit);
    if(!ends.has(bit))ends.set(bit,[]);ends.get(bit).push(key);
  }
  const parent=new Map([...nets.keys()].map(id=>[id,id]));
  const find=id=>{let root=id;while(parent.get(root)!==root)root=parent.get(root);while(id!==root){const next=parent.get(id);parent.set(id,root);id=next;}return root;};
  const join=(a,b)=>parent.set(find(a),find(b));
  const touched=new Set(groundAttachments.flatMap(a=>validateGroundAttachment(graph,lookup,a,netlist)));
  for(const e of graph.edges) {
    const source=e.sourcePort||e.sources?.[0],target=e.targetPort||e.targets?.[0];
    const bit=Number(lookup[e.id]?.replaceAll(',',''));
    for(const endpoint of [source,target])if(nets.get(endpoint)!==bit)throw Error('Layout changed a terminal/net mapping.');
    join(source,target);
    for(const [endpoint,point]of [[source,e.sections?.[0]?.startPoint],[target,e.sections?.at(-1)?.endPoint]]) {
      const split=endpoint.lastIndexOf('.'),node=nodes.get(endpoint.slice(0,split)),port=node?.ports.find(p=>p.id===endpoint);
      if(!point||!port||Math.abs(node.x+port.x-point.x)>.02||Math.abs(node.y+port.y-point.y)>.02)throw Error('Layout wire misses its electrical terminal: '+endpoint+' '+JSON.stringify({wire:point,pin:port?{x:node.x+port.x,y:node.y+port.y}:null,edge:e.id}));
      touched.add(endpoint);
    }
    for(let i=1;i<(e.sections?.length||0);i++) {
      const a=e.sections[i-1].endPoint,b=e.sections[i].startPoint;
      if(Math.abs(a.x-b.x)>.02||Math.abs(a.y-b.y)>.02)throw Error('Layout produced disconnected wire sections.');
    }
    for(const section of e.sections||[]) {
      const pts=[section.startPoint,...section.bendPoints||[],section.endPoint];
      for(let i=1;i<pts.length;i++)if(Math.abs(pts[i].x-pts[i-1].x)>.02&&Math.abs(pts[i].y-pts[i-1].y)>.02)throw Error('Layout produced a non-orthogonal wire.');
    }
  }
  for(const a of groundAttachments)if(a.anchor)join(a.groundPin,a.pin||ends.get(a.bit).find(pin=>pin!==a.groundPin));
  for(const pins of ends.values())if(pins.length>1) {
    for(const pin of pins)if(!touched.has(pin))throw Error('Layout omitted an electrical terminal.');
    if(pins.some(pin=>find(pin)!==find(pins[0])))throw Error('Layout disconnected terminals of the same net.');
  }
}
