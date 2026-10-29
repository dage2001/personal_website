import onml from 'onml';
import {mirrorTransistorSkin} from './transistor-orientation.js';
const opt='org.eclipse.elk.';

/** Rigid motifs stay within one explicit/local scope. Differential branches win overlaps.
 * Two-device mirrors share a row; auxiliary bias devices remain free. */
export function rigidTransistorPairs(motifs,cells,description) {
  const owners=new Map();for(const group of description?.groups||[])for(const member of group.members)if(member.cell)owners.set(member.cell,group.id);
  const pairs=[],used=new Set();
  const scope=id=>owners.get(id)||cells[id]?.spiceLayout?.owner||'';
  const supported=id=>{const c=cells[id],kind=c?.spiceLayout?.kind;return kind==='Q'?Object.keys(c.connections).length===3:['M','J','Z'].includes(kind)&&!!c.connections.G;};
  for(const kind of ['differential-pair','current-mirror'])for(const m of motifs)if(m.kind===kind&&m.confidence==='high'){
    const branches=kind==='differential-pair'?[m.roles.inputs,...m.roles.commonBase?[m.roles.commonBase]:[]]:[[m.roles.reference,...m.roles.outputs]];
    for(const ids of branches){
      if(ids.length!==2||new Set(ids).size!==ids.length||ids.some(id=>used.has(id)||!supported(id))||kind!=='current-mirror'&&ids.some(id=>scope(id)!==scope(ids[0])))continue;
      pairs.push({motif:m.id,kind,members:ids,controlSides:ids.map((_,i)=>kind==='current-mirror'?(i?'left':'right'):(i?'right':'left'))});ids.forEach(id=>used.add(id));
    }
  }
  return pairs;
}

export function pairedTransistorSkin(skin,cells,pairs) {
  const ast=onml.parse(skin),flips=[];
  for(const pair of pairs)pair.members.forEach((id,i)=>{const pin=cells[id].spiceLayout.kind==='Q'?'B':'G',g=ast.find(g=>g[1]?.['s:type']===cells[id].type),p=g?.find(p=>p[1]?.['s:pid']===pin);if(p&&p[1]['s:position']!==pair.controlSides[i])flips.push(id);});
  return flips.length?mirrorTransistorSkin(skin,cells,flips):skin;
}

export function mirroredSkinDevices(skin,cells) {
  const ast=onml.parse(skin),types=new Set(ast.filter(g=>g[1]?.['data-control-mirrored']==='true').map(g=>g[1]['s:type']));return Object.keys(cells).filter(id=>types.has(cells[id].type));
}

/** Contract a pair for ELK placement, expose real pin coordinates, then restore it.
 * The tile is invisible and adds no electrical devices or net aliases. */
export function tileTransistorPairs(graph,pairs) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),tiles=new Map(),ports=new Map(),owners=new Map(),leads=new Map(),applied=[];
  for(const pair of pairs){const members=pair.members.map(id=>nodes.get(id));if(members.some(n=>!n)||members.some(n=>Math.abs(n.height-members[0].height)>.002))continue;
    const control=n=>n.ports.find(p=>p.id===n.id+'.B'||p.id===n.id+'.G');
    if(members.some((n,i)=>{const p=control(n);return !p||Math.abs(p.x-(pair.controlSides[i]==='left'?0:n.width))>.002;}))continue;
    const id='__transistor_pair_'+tiles.size,gap=32,height=members[0].height,children=[],pp=[];let width=0;
    for(const member of members){children.push({...member,x:width,y:0});width+=member.width+gap;}width-=gap;
    for(const child of children){owners.set(child.id,id);for(const p of child.ports){const pid=id+'.p'+pp.length;ports.set(p.id,pid);const exposed={...p,id:pid,x:child.x+p.x,y:p.y};
      // ELK snaps side ports to the tile boundary even with FIXED_POS. Inward
      // controls therefore escape vertically along the symbol edge to a real
      // top/bottom tile port; restore those short leads before net cleanup.
      if(exposed.x>.002&&exposed.x<width-.002&&['WEST','EAST'].includes(p.layoutOptions?.[opt+'port.side'])){const drain=child.ports.find(q=>q.id===child.id+'.C'||q.id===child.id+'.D'),top=(drain?.y??0)<height/2;exposed.y=top?0:height;exposed.layoutOptions={...p.layoutOptions,[opt+'port.side']:top?'NORTH':'SOUTH'};leads.set(p.id,{tile:id,point:{x:exposed.x,y:p.y}});}
      pp.push(exposed);}}
    const tile={id,width,height,ports:pp,layoutOptions:{[opt+'portConstraints']:'FIXED_POS'}};tiles.set(id,{tile,children});applied.push(pair);
  }
  if(!tiles.size)return {pairs:[],restore:g=>g};
  const emitted=new Set();graph.children=graph.children.flatMap(n=>{const tile=owners.get(n.id);if(!tile)return [n];if(emitted.has(tile))return [];emitted.add(tile);return [tiles.get(tile).tile];});
  const originals=new Map();for(const e of graph.edges){originals.set(e.id,{source:e.source,target:e.target,sourcePort:e.sourcePort,targetPort:e.targetPort});e.source=owners.get(e.source)||e.source;e.target=owners.get(e.target)||e.target;e.sourcePort=ports.get(e.sourcePort)||e.sourcePort;e.targetPort=ports.get(e.targetPort)||e.targetPort;}
  return {pairs:applied,restore:g=>{const positions=new Map(g.children.map(n=>[n.id,n]));g.children=g.children.flatMap(n=>tiles.has(n.id)?tiles.get(n.id).children.map(c=>({...c,x:n.x+c.x,y:n.y+c.y})): [n]);for(const e of g.edges)if(originals.has(e.id)){Object.assign(e,originals.get(e.id));for(const [port,source]of [[e.sourcePort,true],[e.targetPort,false]])if(leads.has(port)){const lead=leads.get(port),tile=positions.get(lead.tile),point={x:tile.x+lead.point.x,y:tile.y+lead.point.y},section=source?e.sections?.[0]:e.sections?.at(-1);if(section){if(source){section.bendPoints=[section.startPoint,...section.bendPoints||[]];section.startPoint=point;}else{section.bendPoints=[...section.bendPoints||[],section.endPoint];section.endPoint=point;}}}}return g;}};
}

export function declaredFaceSkin(skin,cells,faces,pairs) {
  const desired=new Map(pairs.flatMap(p=>p.members.map((id,i)=>[id,p.controlSides[i]])));
  for(const f of faces){if(desired.has(f.device)&&desired.get(f.device)!==f.side)throw Error('Conflicting pair / face layout declaration for '+f.device);desired.set(f.device,f.side);}
  const ast=onml.parse(skin),flips=[];
  for(const f of faces){const pin=cells[f.device].spiceLayout.kind==='Q'?'B':'G',g=ast.find(g=>g[1]?.['s:type']===cells[f.device].type),p=g?.find(p=>p[1]?.['s:pid']===pin);if(!p)throw Error('Missing declared control pin.');if(p[1]['s:position']!==f.side)flips.push(f.device);}
  return flips.length?mirrorTransistorSkin(skin,cells,flips):skin;
}
