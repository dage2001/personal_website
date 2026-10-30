import onml from 'onml';
import {mirrorTransistorSkin} from './transistor-orientation.js';
const opt='org.eclipse.elk.';
export function controlInputTargets(cells) {
  const result=[];
  for(const [id,c]of Object.entries(cells))if(c.spiceLayout?.kind==='PORT'&&c.attributes?.value&&c.spiceLayout.ports.A?.role==='in'&&c.spiceLayout.ports.A.potential===null){
    const bit=c.connections.A[0],active=[];
    for(const [owner,d]of Object.entries(cells))if(['Q','M','J','Z'].includes(d.spiceLayout?.kind))for(const [pin,[b]]of Object.entries(d.connections))if(b===bit)active.push({owner,pin,control:d.spiceLayout.kind==='Q'?'B':'G'});
    const controls=active.filter(p=>p.pin===p.control);if(controls.length===1)result.push({id,bit,target:controls[0].owner+'.'+controls[0].pin});
  }
  return result;
}
export function alignControlInputSkin(skin,cells,targets,faces=[]) {
  const ast=onml.parse(skin),locked=new Set(faces.map(f=>f.device)),flips=[];
  for(const t of targets){if(locked.has(t.id))continue;const at=t.target.lastIndexOf('.'),owner=t.target.slice(0,at),pin=t.target.slice(at+1),symbol=id=>ast.find(g=>g[1]?.['s:type']===cells[id].type),p=symbol(owner)?.find(p=>p[1]?.['s:pid']===pin),port=symbol(t.id)?.find(p=>p[1]?.['s:pid']==='A');
    if(p&&port&&p[1]['s:position']===port[1]['s:position'])flips.push(t.id);
  }
  return {skin:flips.length?mirrorTransistorSkin(skin,cells,flips):skin,flips};
}
/** Remove eligible one-node input markers from the ELK backbone, retaining nets. */
export function deferControlInputs(graph,cells,lookup,targets,pairedMembers=new Set()) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),eligible=targets.filter(t=>{const at=t.target.lastIndexOf('.');if(pairedMembers.has(t.target.slice(0,at)))return false;const n=nodes.get(t.id),d=nodes.get(t.target.slice(0,at)),a=n?.ports[0],b=d?.ports.find(p=>p.id===t.target);return a&&b&&a.layoutOptions?.[opt+'port.side']!==b.layoutOptions?.[opt+'port.side'];}),ids=new Set(eligible.map(t=>t.id)),bits=new Set(eligible.map(t=>t.bit)),nets=new Map();
  for(const e of graph.edges){const bit=Number(lookup[e.id]?.replaceAll(',',''));if(!bits.has(bit))continue;if(!nets.has(bit))nets.set(bit,{net:lookup[e.id],pins:new Set()});for(const p of [e.sourcePort,e.targetPort])if(!ids.has(p.slice(0,p.lastIndexOf('.'))))nets.get(bit).pins.add(p);}
  graph.edges=graph.edges.filter(e=>!bits.has(Number(lookup[e.id]?.replaceAll(',',''))));let serial=0;
  for(const {net,pins}of nets.values()){const kept=[...pins];for(const target of kept.slice(1)){const source=kept[0],id='__input_core_'+serial++;lookup[id]=net;graph.edges.push({id,source:source.slice(0,source.lastIndexOf('.')),sourcePort:source,target:target.slice(0,target.lastIndexOf('.')),targetPort:target});}}
  graph.children=graph.children.filter(n=>!ids.has(n.id));return eligible.map(t=>({...t,node:nodes.get(t.id)}));
}
export function installControlInputs(graph,plan,cells,lookup) {
  if(!plan.length)return {translation:{x:0,y:0},attached:[]};
  const on=(p,a,b)=>Math.abs(a.x-b.x)<.002?Math.abs(p.x-a.x)<.002&&p.y>=Math.min(a.y,b.y)-.002&&p.y<=Math.max(a.y,b.y)+.002:Math.abs(p.y-a.y)<.002&&p.x>=Math.min(a.x,b.x)-.002&&p.x<=Math.max(a.x,b.x)+.002;
  for(const t of plan){const at=t.target.lastIndexOf('.'),owner=graph.children.find(n=>n.id===t.target.slice(0,at)),port=owner?.ports.find(p=>p.id===t.target);if(!port)throw Error('Missing deferred input control.');const end={x:owner.x+port.x,y:owner.y+port.y},sourcePort=t.node.ports[0],right=port.layoutOptions?.[opt+'port.side']==='EAST';let chosen;
    const wires=graph.edges.flatMap(e=>(e.sections||[]).flatMap(s=>{const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];return ps.slice(1).map((b,i)=>({a:ps[i],b,bit:Number(lookup[e.id]?.replaceAll(',',''))}));}));
    for(const gap of [24,40,64,96,128]){const start={x:end.x+(right?gap:-gap),y:end.y},node={...t.node,x:start.x-sourcePort.x,y:start.y-sourcePort.y};
      if(graph.children.some(n=>node.x<n.x+n.width+8&&node.x+node.width+8>n.x&&node.y<n.y+n.height+8&&node.y+node.height+8>n.y))continue;
      if(wires.some(s=>Math.max(s.a.x,s.b.x)>node.x+.002&&Math.min(s.a.x,s.b.x)<node.x+node.width-.002&&Math.max(s.a.y,s.b.y)>node.y+.002&&Math.min(s.a.y,s.b.y)<node.y+node.height-.002))continue;
      if(wires.filter(s=>s.bit!==t.bit).some(s=>on(start,s.a,s.b)||on(end,s.a,s.b)||on(s.a,start,end)||on(s.b,start,end)))continue;chosen={node,start};break;
    }
    if(!chosen)throw Error('No unobstructed input-marker attachment.');graph.children.push(chosen.node);const id='__control_input_'+graph.edges.length;lookup[id]=String(t.bit)+',';graph.edges.push({id,source:t.id,sourcePort:sourcePort.id,target:owner.id,targetPort:t.target,sections:[{id:id+'_s',startPoint:chosen.start,endPoint:end}]});
  }
  const minX=Math.min(0,...graph.children.map(n=>n.x)),shift=minX<0?16-minX:0;if(shift){for(const n of graph.children)n.x+=shift;for(const e of graph.edges)for(const s of e.sections||[])for(const p of [s.startPoint,...s.bendPoints||[],s.endPoint])p.x+=shift;for(const e of graph.edges)for(const p of e.junctionPoints||[])p.x+=shift;}
  graph.width=Math.max((graph.width||0)+shift,...graph.children.map(n=>n.x+n.width))+24;graph.height=Math.max(graph.height||0,...graph.children.map(n=>n.y+n.height))+24;
  return {translation:{x:shift,y:0},attached:plan.map(t=>t.id)};
}
