// Version-pinned extension point for netlistsvg 1.0.2. Keep its graph and SVG format.
import onml from 'onml';
import ELK from 'elkjs';
import flatModulePackage from 'netlistsvg/built/FlatModule.js';
import skinPackage from 'netlistsvg/built/Skin.js';
import graphPackage from 'netlistsvg/built/elkGraph.js';
import drawPackage from 'netlistsvg/built/drawModule.js';
import {alignGroundBus,straightenGroundDrops,attachGroundSymbol,refreshGroundJunctions,validateGroundAttachment} from './ground-layout.js';
const {FlatModule}=flatModulePackage, Skin=skinPackage.default||skinPackage;
const drawModule=drawPackage.default||drawPackage;
const option='org.eclipse.elk.';

function portRole(port,cells) {
  const cell=cells[port.parentNode.Key],meta=cell?.spiceLayout?.ports[port.key];
  if(cell?.type&&cell.attributes.name==='0')return 'ret';
  if(['pwr','ret','bias'].includes(meta?.role)||meta?.role==='unknown'&&meta?.potential!==null&&meta?.potential!==undefined)return 'rail';
  if(cell?.spiceBlock)return meta?.role==='out'?'driver':meta?.role==='in'?'sink':'neutral';
  // A sheet input emits into its own sheet; a block input receives from its parent.
  if(cell?.attributes.value&&Object.keys(cell.connections).length===1)return meta?.role==='in'?'driver':meta?.role==='out'?'sink':'neutral';
  if(cell?.connections['+']&&meta?.role==='in'&&port.key==='+')return 'driver';
  if(['G','B','C+','C-'].includes(port.key))return 'sink';
  return 'neutral';
}

export async function renderConventional(skin,netlist,{groundDecoration=true}={}) {
  Skin.skin=onml.parse(skin);
  const flat=new FlatModule(netlist);flat.createWires();
  const cells=netlist.modules.circuit.cells;
  const groundIds=new Set(groundDecoration?Object.entries(cells).filter(([,c])=>c.attributes.name==='0').map(([id])=>id):[]);
  // Reorder each real net's star hub. No guide-only edges or electrical aliases.
  for(const wire of flat.wires) {
    const ports=[...wire.drivers,...wire.riders,...wire.laterals].filter(p=>!groundIds.has(p.parentNode.Key));
    const rank=p=>({driver:0,neutral:1,sink:2,rail:3,ret:3})[portRole(p,cells)];
    ports.sort((a,b)=>rank(a)-rank(b));
    wire.drivers=[];wire.riders=[];wire.laterals=ports;
  }
  const graph=graphPackage.buildElkGraph(flat);
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
  power.sort((a,b)=>b.voltage-a.voltage);
  for(let i=0;i<power.length-1;i++)power[i].child.layoutOptions[option+'layered.crossingMinimization.inLayerPredOf']=power[i+1].child.id;
  const ordered=new Map(power.map((p,i)=>[p.child.id,i]));
  graph.children.sort((a,b)=>(ordered.get(a.id)??power.length)-(ordered.get(b.id)??power.length));
  for(const edge of graph.edges) {
    const bit=graphPackage.ElkModel.wireNameLookup[edge.id];
    const wire=flat.wires.find(w=>w.netName===bit);
    const isRail=wire.laterals.some(p=>['rail','ret'].includes(portRole(p,cells)));
    edge.layoutOptions={...edge.layoutOptions,[option+'layered.priority.direction']:isRail?0:10,[option+'layered.priority.shortness']:isRail?0:1};
  }
  const elk=new ELK();
  const options={...Skin.getProperties().layoutEngine,
    [option+'randomSeed']:1,
    [option+'layered.considerModelOrder.strategy']:'NODES_AND_EDGES',
    [option+'layered.considerModelOrder.crossingCounterNodeInfluence']:.01,
    [option+'layered.feedbackEdges']:true,
  };
  let layout=graph.children.length?await elk.layout(graph,{layoutOptions:options}):{...graph,width:0,height:0};
  let powerPass='single-pass';
  if(power.length>1) {
    // Interactive layering uses a complete first layout as its positional input.
    // It recomputes ALL routes; do not move SVG cells after routing.
    const next=structuredClone(graph),placed=new Map(layout.children.map(n=>[n.id,n]));
    const columnWidth=Math.max(...power.map(p=>p.child.width))+80;
    const bandHeight=Math.max(180,layout.height/Math.max(1,power.length-1));
    // Preserve ELK's existing columns. Feeding unequal-width node centers back
    // verbatim would accidentally split one layer into many interactive layers.
    const columns=[],columnOf=new Map();
    for(const node of [...layout.children].filter(n=>!ordered.has(n.id)).sort((a,b)=>a.x-b.x)) {
      let col=columns.at(-1);
      if(!col||node.x>=col.right+.1){col={right:node.x+node.width,width:node.width,nodes:[]};columns.push(col);}
      col.right=Math.max(col.right,node.x+node.width);col.width=Math.max(col.width,node.width);col.nodes.push(node.id);
    }
    let center=columnWidth;
    for(const col of columns){center+=col.width/2;for(const id of col.nodes)columnOf.set(id,center);center+=col.width/2+80;}
    for(const node of next.children) {
      const old=placed.get(node.id),rank=ordered.get(node.id);
      node.x=(rank===undefined?columnOf.get(node.id):columnWidth/2)-node.width/2;
      node.y=rank===undefined?old.y:rank*bandHeight;
    }
    const candidate=await elk.layout(next,{layoutOptions:{...options,
      [option+'layered.layering.strategy']:'INTERACTIVE',
      [option+'layered.crossingMinimization.strategy']:'INTERACTIVE',
      [option+'layered.nodePlacement.strategy']:'BRANDES_KOEPF',
    }});
    if(candidate.width*candidate.height<=layout.width*layout.height*1.8) {layout=candidate;powerPass='two-pass';}
    else powerPass='single-pass (source ordering enlarged the sheet excessively)';
  }
  const lookup=graphPackage.ElkModel.wireNameLookup,attachments=[];let straightened=0;
  for(const ground of groundNodes) {
    const bit=cells[ground.id].connections.A[0];
    straightened+=alignGroundBus(layout,lookup,bit);
    straightened+=straightenGroundDrops(layout,lookup,bit);
    const attached=attachGroundSymbol(layout,lookup,ground,netlist);
    if(!attached)return renderConventional(skin,netlist,{groundDecoration:false});
    attachments.push(attached);power.push({child:attached.node,voltage:0});
    refreshGroundJunctions(layout,lookup,bit,attached);
  }
  power.sort((a,b)=>b.voltage-a.voltage);
  validateLayoutEndpoints(layout,netlist,lookup,attachments,fixedPorts);
  const positions=new Map(layout.children.map(n=>[n.id,n]));
  let inversions=0;
  for(let i=0;i<power.length;i++)for(let j=i+1;j<power.length;j++)if(power[i].voltage>power[j].voltage&&positions.get(power[i].child.id).y>=positions.get(power[j].child.id).y)inversions++;
  const report={version:2,direction:'RIGHT',powerPass,powerSourcesChecked:power.length,powerOrderViolations:inversions,
    groundPlacement:attachments.some(a=>a.anchor)?'rail-attached':attachments.length?'isolated':Object.values(cells).some(c=>c.attributes.name==='0')?'ELK fallback (no clear ground attachment)':'not-present',groundAttachments:attachments.length,straightenedGroundDrops:straightened,
    powerPlacement:'preferred source column; global voltage bands are not guaranteed',verifiedTerminals:true};
  const svg=drawModule(layout,flat);
  const decorations=attachments.filter(a=>a.anchor).flatMap(a=>[
    ['line',{x1:a.anchor.x,y1:a.anchor.y,x2:a.end.x,y2:a.end.y,class:'net_'+a.bit,'data-ground-attachment':'true'}],
  ]);
  return svg.replace('</svg>',decorations.map(n=>onml.stringify(n)).join('')+onml.stringify(['metadata',{id:'spice-layout-report'},JSON.stringify(report)])+'</svg>');
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
  const touched=new Set(groundAttachments.flatMap(a=>validateGroundAttachment(graph,lookup,a,netlist)));
  for(const e of graph.edges) {
    const source=e.sourcePort||e.sources?.[0],target=e.targetPort||e.targets?.[0];
    const bit=Number(lookup[e.id]?.replaceAll(',',''));
    for(const endpoint of [source,target])if(nets.get(endpoint)!==bit)throw Error('Layout changed a terminal/net mapping.');
    for(const [endpoint,point]of [[source,e.sections?.[0]?.startPoint],[target,e.sections?.at(-1)?.endPoint]]) {
      const split=endpoint.lastIndexOf('.'),node=nodes.get(endpoint.slice(0,split)),port=node?.ports.find(p=>p.id===endpoint);
      if(!point||!port||Math.abs(node.x+port.x-point.x)>.02||Math.abs(node.y+port.y-point.y)>.02)throw Error('Layout wire misses its electrical terminal.');
      touched.add(endpoint);
    }
    for(const section of e.sections||[]) {
      const pts=[section.startPoint,...section.bendPoints||[],section.endPoint];
      for(let i=1;i<pts.length;i++)if(Math.abs(pts[i].x-pts[i-1].x)>.02&&Math.abs(pts[i].y-pts[i-1].y)>.02)throw Error('Layout produced a non-orthogonal wire.');
    }
  }
  for(const pins of ends.values())if(pins.length>1)for(const pin of pins)if(!touched.has(pin))throw Error('Layout omitted an electrical terminal.');
}
