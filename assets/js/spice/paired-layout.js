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
  for(const kind of ['differential-pair','current-mirror','current-limit-pair','darlington-pair','sziklai-pair','cascode-pair'])for(const m of motifs)if(m.kind===kind&&m.confidence==='high'){
    const branches=kind==='differential-pair'?[m.roles.inputs,...m.roles.commonBase?[m.roles.commonBase]:[]]:kind==='current-mirror'?[[m.roles.reference,...m.roles.outputs]]:kind==='push-pull-pair'?[[m.roles.upper,m.roles.lower]]:[[m.roles.driver,m.roles.output]];
    for(const ids of branches){
      if(ids.length!==2||new Set(ids).size!==ids.length||ids.some(id=>used.has(id)||!supported(id))||kind!=='current-mirror'&&ids.some(id=>scope(id)!==scope(ids[0])))continue;
      const compound=!['differential-pair','current-mirror'].includes(kind);pairs.push({motif:m.id,kind,placement:compound?'stagger':'row',rise:kind==='cascode-pair'?cells[ids[0]].spiceLayout.polarity!=='p':cells[ids[0]].spiceLayout.polarity==='p',members:ids,controlSides:ids.map((id,i)=>compound?(description?.faces||[]).find(f=>f.device===id)?.side||'left':kind==='current-mirror'?(i?'left':'right'):(i?'right':'left'))});ids.forEach(id=>used.add(id));
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
export function tileTransistorPairs(graph,pairs,{inputs=[],cells={}}={}) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),tiles=new Map(),ports=new Map(),owners=new Map(),leads=new Map(),applied=[],inputAttachments=[];
  for(const pair of pairs){const members=pair.members.map(id=>nodes.get(id));if(members.some(n=>!n)||members.some(n=>Math.abs(n.height-members[0].height)>.002))continue;
    const control=n=>n.ports.find(p=>p.id===n.id+'.B'||p.id===n.id+'.G');
    if(members.some((n,i)=>{const p=control(n);return !p||Math.abs(p.x-(pair.controlSides[i]==='left'?0:n.width))>.002;}))continue;
    const id='__transistor_pair_'+tiles.size,gap=32,stagger=pair.placement==='stagger',initialHeight=stagger?members.reduce((sum,n)=>sum+n.height,0)+16:members[0].height,children=[],pp=[];let width=0,height=initialHeight;
    for(const [i,member]of members.entries()){children.push({...member,x:stagger?i*(members[0].width/2+12):width,y:stagger?((pair.rise?1-i:i)*(members[0].height+16)):0});width+=member.width+gap;}width=Math.max(...children.map(n=>n.x+n.width));
    // The sense resistor belongs to the protection subnet. Letting ELK place
    // it independently can stretch both short local feedback connections.
    if(pair.kind==='current-limit-pair'){
      const bits=pair.members.map(id=>cells[id]?.connections.E?.[0]);
      const senses=[...nodes.values()].filter(n=>cells[n.id]?.spiceLayout?.kind==='R'&&!owners.has(n.id)&&Object.values(cells[n.id].connections).length===2&&bits.every(bit=>Object.values(cells[n.id].connections).some(([b])=>b===bit)));
      if(senses.length===1){const resistor=senses[0];children.push({...resistor,x:-resistor.width-20,y:(height-resistor.height)/2});}
    }
    for(const input of inputs){const at=input.target.lastIndexOf('.'),target=children.find(n=>n.id===input.target.slice(0,at)),marker=nodes.get(input.id);if(!target||!marker||owners.has(marker.id))continue;const pin=target.ports.find(p=>p.id===input.target),a=marker.ports[0],right=pin.layoutOptions?.[opt+'port.side']==='EAST';if(a.layoutOptions?.[opt+'port.side']!==(right?'WEST':'EAST'))continue;
      const child={...marker,x:target.x+pin.x+(right?24:-24)-a.x,y:target.y+pin.y-a.y};if(children.some(n=>child.x<n.x+n.width+4&&child.x+child.width+4>n.x&&child.y<n.y+n.height+4&&child.y+child.height+4>n.y))continue;children.push(child);inputAttachments.push(input.id);
    }
    const minX=Math.min(0,...children.map(n=>n.x)),minY=Math.min(0,...children.map(n=>n.y));for(const n of children){n.x-=minX;n.y-=minY;}width=Math.max(...children.map(n=>n.x+n.width));height=Math.max(...children.map(n=>n.y+n.height));
    for(const child of children){owners.set(child.id,id);for(const p of child.ports){const pid=id+'.p'+pp.length;ports.set(p.id,pid);const exposed={...p,id:pid,x:child.x+p.x,y:p.y};
      exposed.y+=child.y;
      const side=p.layoutOptions?.[opt+'port.side'],boundary=side==='WEST'?exposed.x===0:side==='EAST'?exposed.x===width:side==='NORTH'?exposed.y===0:exposed.y===height;
      // Internal pins escape to an outer tile port along a clear symbol edge.
      // The short physical lead is restored before the net-tree simplifier.
      if(!boundary){
        const point={x:exposed.x,y:exposed.y},targets=[{side:'WEST',x:0,y:point.y},{side:'EAST',x:width,y:point.y},{side:'NORTH',x:point.x,y:0},{side:'SOUTH',x:point.x,y:height}],clear=t=>!children.some(n=>Math.max(point.x,t.x)>n.x+.02&&Math.min(point.x,t.x)<n.x+n.width-.02&&Math.max(point.y,t.y)>n.y+.02&&Math.min(point.y,t.y)<n.y+n.height-.02);
        const target=targets.filter(clear).sort((a,b)=>Number(b.side===side)-Number(a.side===side)||Math.abs(a.x-point.x)+Math.abs(a.y-point.y)-Math.abs(b.x-point.x)-Math.abs(b.y-point.y))[0];
        if(!target)throw Error('No safe paired-device pin escape.');exposed.x=target.x;exposed.y=target.y;exposed.layoutOptions={...p.layoutOptions,[opt+'port.side']:target.side};leads.set(p.id,{tile:id,point});
      }
      pp.push(exposed);}}
    const tile={id,width,height,ports:pp,layoutOptions:{[opt+'portConstraints']:'FIXED_POS',[opt+'priority']:100},spiceSubnet:true};tiles.set(id,{tile,children});applied.push(pair);
  }
  if(!tiles.size)return {pairs:[],inputs:[],restore:g=>g};
  const emitted=new Set();graph.children=graph.children.flatMap(n=>{const tile=owners.get(n.id);if(!tile)return [n];if(emitted.has(tile))return [];emitted.add(tile);return [tiles.get(tile).tile];});
  graph.children.sort((a,b)=>Number(!!b.spiceSubnet)-Number(!!a.spiceSubnet));
  const originals=new Map();for(const e of graph.edges){originals.set(e.id,{source:e.source,target:e.target,sourcePort:e.sourcePort,targetPort:e.targetPort});e.source=owners.get(e.source)||e.source;e.target=owners.get(e.target)||e.target;e.sourcePort=ports.get(e.sourcePort)||e.sourcePort;e.targetPort=ports.get(e.targetPort)||e.targetPort;}
  return {pairs:applied,inputs:inputAttachments,restore:g=>{const positions=new Map(g.children.map(n=>[n.id,n]));g.children=g.children.flatMap(n=>tiles.has(n.id)?tiles.get(n.id).children.map(c=>({...c,x:n.x+c.x,y:n.y+c.y})): [n]);for(const e of g.edges)if(originals.has(e.id)){Object.assign(e,originals.get(e.id));for(const [port,source]of [[e.sourcePort,true],[e.targetPort,false]])if(leads.has(port)){const lead=leads.get(port),tile=positions.get(lead.tile),point={x:tile.x+lead.point.x,y:tile.y+lead.point.y},section=source?e.sections?.[0]:e.sections?.at(-1);if(section){if(source){section.bendPoints=[section.startPoint,...section.bendPoints||[]];section.startPoint=point;}else{section.bendPoints=[...section.bendPoints||[],section.endPoint];section.endPoint=point;}}}}return g;}};
}

export function declaredFaceSkin(skin,cells,faces,pairs) {
  const desired=new Map(pairs.flatMap(p=>p.members.map((id,i)=>[id,p.controlSides[i]])));
  for(const f of faces){if(desired.has(f.device)&&desired.get(f.device)!==f.side)throw Error('Conflicting pair / face layout declaration for '+f.device);desired.set(f.device,f.side);}
  const ast=onml.parse(skin),flips=[];
  for(const f of faces){const pin=cells[f.device].spiceLayout.kind==='Q'?'B':'G',g=ast.find(g=>g[1]?.['s:type']===cells[f.device].type),p=g?.find(p=>p[1]?.['s:pid']===pin);if(!p)throw Error('Missing declared control pin.');if(p[1]['s:position']!==f.side)flips.push(f.device);}
  return flips.length?mirrorTransistorSkin(skin,cells,flips):skin;
}
