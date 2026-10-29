import {groupParallelCells} from './compact-groups.js';
const opt='org.eclipse.elk.';

/** Seed ELK with a capped port-count skeleton, growing through real signal nets. */
export function skeletonOrder(children,cells,threshold=10) {
  const ids=children.map(n=>n.id),rank=id=>Math.min(threshold,new Set(Object.values(cells[id]?.connections||{}).map(b=>b[0])).size);
  const signals=id=>new Set(Object.entries(cells[id]?.connections||{}).filter(([p])=>{const meta=cells[id]?.spiceLayout?.ports[p];return !['pwr','ret','bias'].includes(meta?.role)&&!(meta?.role==='unknown'&&meta.potential!==null&&meta.potential!==undefined);}).map(([,b])=>b[0]));
  const selected=[],near=new Set(),pending=new Set(ids),byId=new Map(children.map(n=>[n.id,n]));
  while(pending.size){const next=[...pending].sort((a,b)=>rank(b)-rank(a)||[...signals(b)].filter(n=>near.has(n)).length-[...signals(a)].filter(n=>near.has(n)).length||ids.indexOf(a)-ids.indexOf(b))[0];pending.delete(next);selected.push(byId.get(next));for(const bit of signals(next))near.add(bit);}
  return selected;
}

export function planLayoutGroups(graph,cells,description,parallel) {
  const priorityCap=description?.priorityCap||10;
  const leaves=new Map(graph.children.map(n=>[n.id,n])),used=new Set(),groupNodes=new Map(),guides=[];let serial=0,explicitGroups=0,inferredGroups=0,parallelGroups=0;
  const guide=(a,b,direction)=>{if(a===b)return;guides.push({id:'__guide_'+serial++,source:a,target:b,layoutOptions:{[opt+'layered.priority.direction']:1000,[opt+'direction']:direction}});};
  const box=(id,direction,children,ordered=false)=>{
    const node={id:'__visual_'+serial++,spiceGroup:id,spiceClassic:direction==='classic',children,layoutOptions:{[opt+'algorithm']:'layered',[opt+'direction']:direction==='row'?'RIGHT':'DOWN',[opt+'edgeRouting']:'ORTHOGONAL',[opt+'padding']:'[top=12,left=12,bottom=12,right=12]',[opt+'spacing.nodeNode']:24,[opt+'layered.spacing.nodeNodeBetweenLayers']:28,[opt+'layered.considerModelOrder.strategy']:'NONE'}};
    if(ordered){Object.assign(node.layoutOptions,{[opt+'layered.nodePlacement.strategy']:'INTERACTIVE',[opt+'layered.crossingMinimization.strategy']:'INTERACTIVE',[opt+'layered.interactiveReferencePoint']:'TOP_LEFT'});children.forEach((child,i)=>{child.x=direction==='column'?0:i*20000;child.y=direction==='column'?i*20000:0;});for(let i=1;i<children.length;i++)guide(children[i-1].id,children[i].id,node.layoutOptions[opt+'direction']);}
    groupNodes.set(id.toLowerCase(),node);return node;
  };
  const active=new Set();
  if(description) {
    const definitions=new Map(description.groups.map(g=>[g.id.toLowerCase(),g]));
    const build=id=>{
      if(groupNodes.has(id))return groupNodes.get(id);if(active.has(id))throw Error('Circular visual containment.');active.add(id);
      const def=definitions.get(id),children=[],instances=new Map();
      for(const member of def.members) {
        if(member.group){const child=build(member.group.toLowerCase());if(child.children.length)children.push(child);}
        else if(leaves.has(member.cell)){
          if(used.has(member.cell))throw Error('Repeated visual member.');used.add(member.cell);
          if(member.instance){if(!instances.has(member.instance)){const wrapper=box('@instance_'+member.instance,'row',[]);instances.set(member.instance,wrapper);children.push(wrapper);}instances.get(member.instance).children.push(leaves.get(member.cell));}
          else children.push(leaves.get(member.cell));
        }
      }
      for(const wrapper of instances.values())wrapper.children=skeletonOrder(wrapper.children,cells,priorityCap);
      active.delete(id);explicitGroups++;return box(def.id,def.direction,children,def.direction!=='classic');
    };
    const nested=new Set(description.groups.flatMap(g=>g.members.filter(m=>m.group).map(m=>m.group.toLowerCase())));
    const roots=description.groups.filter(g=>!nested.has(g.id.toLowerCase())).map(g=>build(g.id.toLowerCase())).filter(g=>g.children.length);
    graph.children=[...roots,...skeletonOrder(graph.children.filter(n=>!used.has(n.id)),cells)];
    const contains=(n,id)=>n.id===id||n.children?.some(c=>contains(c,id));
    for(const r of description.relations){
      const a=groupNodes.get(r.a.toLowerCase())||groupNodes.get(('@instance_'+r.a).toLowerCase())||leaves.get(r.a),b=groupNodes.get(r.b.toLowerCase())||groupNodes.get(('@instance_'+r.b).toLowerCase())||leaves.get(r.b);
      if(!a||!b||a.children&&!a.children.length||b.children&&!b.children.length)continue;
      const wrap=container=>{const ai=container.children.find(n=>contains(n,a.id)),bi=container.children.find(n=>contains(n,b.id));if(!ai||!bi)return;if(ai===bi){if(ai.id===a.id||ai.id===b.id)throw Error('Cannot place a group relative to its descendant.');return wrap(ai);}const node=box('@relation_'+serial,r.relation==='above'?'column':'row',[ai,bi],true);container.children=container.children.filter(n=>n!==ai&&n!==bi);container.children.unshift(node);};wrap(graph);
    }
  }else {
    // Only unambiguous local transistor branches are grouped. No circuit-name templates.
    const classic=Object.values(cells).some(c=>['Q','M','J','Z'].includes(c.spiceLayout?.kind))&&!Object.values(cells).some(c=>c.spiceBlock||Object.keys(c.connections).length>4);
    const roots=[];
    if(classic)for(const [id,cell]of Object.entries(cells)) {
      if(!['Q','M','J','Z'].includes(cell.spiceLayout?.kind)||used.has(id))continue;
      const ctrl=cell.connections.B&&cell.spiceLayout.kind==='Q'?'B':'G',control=cell.connections[ctrl]?.[0],high=cell.connections.C?.[0]??cell.connections.D?.[0],low=cell.connections.E?.[0]??cell.connections.S?.[0];
      const branches={high:[],low:[],control:[]};
      for(const [pid,p]of Object.entries(cells)) {
        if(used.has(pid)||!p.spiceLayout?.passive||Object.keys(p.connections).length!==2)continue;
        const values=Object.entries(p.connections),rails=values.filter(([pin])=>['pwr','ret','bias'].includes(p.spiceLayout.ports[pin]?.role));if(rails.length!==1)continue;
        const signal=values.find(([pin])=>pin!==rails[0][0])[1][0];
        if(signal===control)branches.control.push(leaves.get(pid));else if(signal===high)branches.high.push(leaves.get(pid));else if(signal===low)branches.low.push(leaves.get(pid));
      }
      for(const a of Object.values(branches))for(const n of a)used.add(n.id);used.add(id);
      if(branches.control.length>1){roots.push(box('bias_'+id,'column',branches.control));inferredGroups++;}
      else if(branches.control.length)roots.push(...branches.control);
      const children=[...branches.high,leaves.get(id),...branches.low];roots.push(box('active_'+id,'column',children));inferredGroups++;
    }
    // Expanded instance ownership survives even without explicit annotations.
    const owners=new Map();for(const n of graph.children)if(!used.has(n.id)&&cells[n.id]?.spiceLayout?.owner){const owner=cells[n.id].spiceLayout.owner;if(!owners.has(owner))owners.set(owner,[]);owners.get(owner).push(n);}
    for(const [owner,nodes]of owners)if(nodes.length>1){nodes.forEach(n=>used.add(n.id));roots.push(box('instance_'+owner,'row',skeletonOrder(nodes,cells)));inferredGroups++;}
    graph.children=[...roots,...skeletonOrder(graph.children.filter(n=>!used.has(n.id)),cells)];
  }
  function parallelInside(container) {
    if(container.spiceClassic)return;
    const localCells=(container.children||[]).filter(n=>!n.children).map(n=>cells[n.id]);
    if(container.spiceGroup?.startsWith('@instance_')&&localCells.length===(container.children||[]).length&&localCells.length<=80&&localCells.filter(c=>['Q','M','J','Z'].includes(c?.spiceLayout?.kind)).length===1&&localCells.every(c=>c&&!c.spiceBlock&&['Q','M','J','Z','R','L','C','D','V','I','PORT'].includes(c.spiceLayout?.kind)))return;
    for(const child of container.children||[])if(child.children)parallelInside(child);
    const ids=new Set((container.children||[]).filter(n=>!n.children).map(n=>n.id)),local=new Map([...parallel].map(([key,members])=>[key,members.filter(id=>ids.has(id))]));
    parallelGroups+=groupParallelCells(container,local);
  }
  parallelInside(graph);graph.edges.push(...guides);
  return {explicitGroups,inferredGroups,parallelGroups,guideCount:guides.length,portPriorityCap:priorityCap};
}

export function removeLayoutGuides(graph) {
  graph.edges=(graph.edges||[]).filter(e=>!e.id.startsWith('__guide_'));
  if(graph.ports)graph.ports=graph.ports.filter(p=>!p.spiceGuide);
  for(const child of graph.children||[])removeLayoutGuides(child);
}
