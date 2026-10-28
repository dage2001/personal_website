// Version-pinned extension point for netlistsvg 1.0.2. Keep its graph and SVG format.
import onml from 'onml';
import ELK from 'elkjs';
import flatModulePackage from 'netlistsvg/built/FlatModule.js';
import skinPackage from 'netlistsvg/built/Skin.js';
import graphPackage from 'netlistsvg/built/elkGraph.js';
import drawPackage from 'netlistsvg/built/drawModule.js';
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

export async function renderConventional(skin,netlist) {
  Skin.skin=onml.parse(skin);
  const flat=new FlatModule(netlist);flat.createWires();
  const cells=netlist.modules.circuit.cells;
  // Reorder each real net's star hub. No guide-only edges or electrical aliases.
  for(const wire of flat.wires) {
    const ports=[...wire.drivers,...wire.riders,...wire.laterals];
    const rank=p=>({driver:0,neutral:1,sink:2,rail:3,ret:3})[portRole(p,cells)];
    ports.sort((a,b)=>rank(a)-rank(b));
    wire.drivers=[];wire.riders=[];wire.laterals=ports;
  }
  const graph=graphPackage.buildElkGraph(flat);
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
  let layout=await elk.layout(graph,{layoutOptions:options});
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
  validateLayoutEndpoints(layout,netlist,graphPackage.ElkModel.wireNameLookup);
  const positions=new Map(layout.children.map(n=>[n.id,n]));
  let inversions=0;
  for(let i=0;i<power.length;i++)for(let j=i+1;j<power.length;j++)if(power[i].voltage>power[j].voltage&&positions.get(power[i].child.id).y>=positions.get(power[j].child.id).y)inversions++;
  const report={version:1,direction:'RIGHT',powerPass,powerSourcesChecked:power.length,powerOrderViolations:inversions,
    powerPlacement:'preferred source column; global voltage bands are not guaranteed',verifiedTerminals:true};
  const svg=drawModule(layout,flat);
  return svg.replace('</svg>',onml.stringify(['metadata',{id:'spice-layout-report'},JSON.stringify(report)])+'</svg>');
}

/** Reject omitted/misrouted terminal endpoints before rendering or caching. */
export function validateLayoutEndpoints(graph,netlist,lookup) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),nets=new Map(),ends=new Map();
  for(const [id,c]of Object.entries(netlist.modules.circuit.cells))for(const [pin,[bit]]of Object.entries(c.connections)) {
    const key=id+'.'+pin;nets.set(key,bit);
    if(!ends.has(bit))ends.set(bit,[]);ends.get(bit).push(key);
  }
  const touched=new Set();
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
