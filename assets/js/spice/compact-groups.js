// Invisible ELK-only affinity groups. These are not SPICE subcircuits and do
// not replace cells or change any terminal/net mapping in the rendered circuit.
export function groupParallelCells(graph,parallel) {
  const nodes=new Map(graph.children.map(n=>[n.id,n])),owner=new Map(),groups=[];
  for(const members of parallel.values()) {
    if(members.length<2)continue;
    const children=members.map(id=>nodes.get(id)).filter(Boolean);if(children.length<2)continue;
    let id='__layout_parallel_'+groups.length;while(nodes.has(id))id+='_';
    const group={id,children,layoutOptions:{'org.eclipse.elk.algorithm':'layered','org.eclipse.elk.direction':'RIGHT','org.eclipse.elk.edgeRouting':'ORTHOGONAL','org.eclipse.elk.padding':'[top=8,left=8,bottom=8,right=8]','org.eclipse.elk.spacing.nodeNode':16,'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers':20}};
    if(children.length>4)Object.assign(group.layoutOptions,{'org.eclipse.elk.layered.layering.strategy':'COFFMAN_GRAHAM','org.eclipse.elk.layered.layering.coffmanGraham.layerBound':Math.ceil(Math.sqrt(children.length))});
    groups.push(group);for(const child of children)owner.set(child.id,group);
  }
  const emitted=new Set();graph.children=graph.children.flatMap(n=>{
    const group=owner.get(n.id);if(!group)return [n];if(emitted.has(group.id))return [];emitted.add(group.id);return [group];
  });
  return groups.length;
}

/** Translate ELK compound coordinates back into netlistsvg's flat drawing API. */
export function flattenElkGroups(graph) {
  const offsets=new Map([[graph.id,{x:0,y:0}]]),children=[],edges=[];
  function visit(container,x,y) {
    offsets.set(container.id,{x,y});for(const edge of container.edges||[])edges.push({edge,container:container.id});
    for(const node of container.children||[]) {
      const nx=x+node.x,ny=y+node.y;
      if(node.children)visit(node,nx,ny);else children.push({...node,x:nx,y:ny});
    }
  }
  visit(graph,0,0);const seen=new Set(),result=[];
  for(const {edge,container}of edges) {
    if(seen.has(edge.id))continue;seen.add(edge.id);
    const offset=offsets.get(edge.container||container);if(!offset)throw Error('Unknown ELK edge coordinate container.');
    const shift=p=>({x:p.x+offset.x,y:p.y+offset.y});
    result.push({...edge,container:graph.id,sections:edge.sections?.map(s=>({...s,startPoint:shift(s.startPoint),endPoint:shift(s.endPoint),bendPoints:s.bendPoints?.map(shift)})),junctionPoints:edge.junctionPoints?.map(shift)});
  }
  return {...graph,children,edges:result};
}
