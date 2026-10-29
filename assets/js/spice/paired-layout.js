import onml from 'onml';
import {mirrorTransistorSkin} from './transistor-orientation.js';
const opt='org.eclipse.elk.';

/** Only co-scoped, high-confidence, three-pin BJT differential branches are rigid. */
export function differentialPairs(motifs,cells,description) {
  const owners=new Map();for(const group of description?.groups||[])for(const member of group.members)if(member.cell)owners.set(member.cell,group.id);
  const pairs=[],used=new Set();
  for(const m of motifs)if(m.kind==='differential-pair'&&m.confidence==='high')for(const ids of [m.roles.inputs,...m.roles.commonBase?[m.roles.commonBase]:[]]){
    if(ids.length!==2||ids.some(id=>used.has(id)||cells[id]?.spiceLayout?.kind!=='Q'||Object.keys(cells[id].connections).length!==3))continue;
    const scope=id=>owners.get(id)||cells[id].spiceLayout.owner||'';if(scope(ids[0])!==scope(ids[1]))continue;
    pairs.push({motif:m.id,members:ids});ids.forEach(id=>used.add(id));
  }
  return pairs;
}

export function outwardPairSkin(skin,cells,pairs) {
  const ast=onml.parse(skin),flips=[];
  for(const pair of pairs)pair.members.forEach((id,i)=>{const g=ast.find(g=>g[1]?.['s:type']===cells[id].type),p=g?.find(p=>p[1]?.['s:pid']==='B');if(p&&p[1]['s:position']!==(i?'right':'left'))flips.push(id);});
  return flips.length?mirrorTransistorSkin(skin,cells,flips):skin;
}

export function mirroredSkinDevices(skin,cells) {
  const ast=onml.parse(skin),types=new Set(ast.filter(g=>g[1]?.['data-control-mirrored']==='true').map(g=>g[1]['s:type']));return Object.keys(cells).filter(id=>types.has(cells[id].type));
}

/** Contract a pair for ELK placement, expose real pin coordinates, then restore it.
 * The tile is invisible and has no boundary/proxy wires or electrical identity. */
export function tileDifferentialPairs(graph,pairs) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),tiles=new Map(),ports=new Map(),owners=new Map(),applied=[];
  for(const pair of pairs){const [a,b]=pair.members.map(id=>nodes.get(id));if(!a||!b||Math.abs(a.height-b.height)>.002)continue;
    const bp=n=>n.ports.find(p=>p.id===n.id+'.B');if(Math.abs(bp(a)?.x||0)>.002||Math.abs((bp(b)?.x??0)-b.width)>.002)continue;
    const id='__differential_pair_'+tiles.size,gap=32,width=a.width+gap+b.width,height=a.height,children=[{...a,x:0,y:0},{...b,x:a.width+gap,y:0}],pp=[];
    for(const child of children){owners.set(child.id,id);for(const p of child.ports){const pid=id+'.p'+pp.length;ports.set(p.id,pid);pp.push({...p,id:pid,x:child.x+p.x,y:p.y});}}
    const tile={id,width,height,ports:pp,layoutOptions:{[opt+'portConstraints']:'FIXED_POS'}};tiles.set(id,{tile,children});applied.push(pair);
  }
  if(!tiles.size)return {pairs:[],restore:g=>g};
  const emitted=new Set();graph.children=graph.children.flatMap(n=>{const tile=owners.get(n.id);if(!tile)return [n];if(emitted.has(tile))return [];emitted.add(tile);return [tiles.get(tile).tile];});
  const originals=new Map();for(const e of graph.edges){originals.set(e.id,{source:e.source,target:e.target,sourcePort:e.sourcePort,targetPort:e.targetPort});e.source=owners.get(e.source)||e.source;e.target=owners.get(e.target)||e.target;e.sourcePort=ports.get(e.sourcePort)||e.sourcePort;e.targetPort=ports.get(e.targetPort)||e.targetPort;}
  return {pairs:applied,restore:g=>{g.children=g.children.flatMap(n=>tiles.has(n.id)?tiles.get(n.id).children.map(c=>({...c,x:n.x+c.x,y:n.y+c.y})): [n]);for(const e of g.edges)if(originals.has(e.id))Object.assign(e,originals.get(e.id));return g;}};
}
