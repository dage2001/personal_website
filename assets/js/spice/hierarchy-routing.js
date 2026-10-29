/** Split a real edge at visual boundaries so each ELK level may use its own direction. */
export function splitHierarchyEdges(graph,lookup) {
  const nodes=new Map(),parents=new Map(),original=[...graph.edges],pieces=new Map();let serial=0;
  const index=n=>{nodes.set(n.id,n);for(const c of n.children||[]){parents.set(c.id,n);index(c);}};index(graph);
  const ancestors=id=>{const result=[];let n=parents.get(id);while(n){result.push(n);n=parents.get(n.id);}return result;};
  const owner=(a,b)=>{const aa=ancestors(a),bb=new Set(ancestors(b).map(n=>n.id));return aa.find(n=>bb.has(n.id))||graph;};
  const visit=n=>{if(n.children){n.edges=[];n.ports=n.ports||[];n.layoutOptions={...n.layoutOptions,'org.eclipse.elk.hierarchyHandling':'SEPARATE_CHILDREN','org.eclipse.elk.portConstraints':'FIXED_SIDE'};for(const c of n.children)visit(c);}};visit(graph);
  const boundary=(container,net,source)=>{
    const vertical=container.layoutOptions?.['org.eclipse.elk.direction']==='DOWN',side=vertical?(source?'SOUTH':'NORTH'):(source?'EAST':'WEST'),id=container.id+'.boundary_'+net.replace(/\W/g,'_')+'_'+side;
    if(!container.ports.some(p=>p.id===id))container.ports.push({id,width:0,height:0,layoutOptions:{'org.eclipse.elk.port.side':side}});
    return id;
  };
  const add=(container,source,target,originalId)=>{const id='__piece_'+serial++;container.edges.push({id,sources:[source],targets:[target]});lookup[id]=lookup[originalId];if(!pieces.has(originalId))pieces.set(originalId,[]);pieces.get(originalId).push(id);};
  for(const edge of original) {
    const src=nodes.get(edge.source),dst=nodes.get(edge.target);if(!src||!dst)throw Error('Unknown visual edge endpoint.');const common=owner(src.id,dst.id);
    if(edge.id.startsWith('__guide_')){
      const vertical=common.layoutOptions?.['org.eclipse.elk.direction']==='DOWN';
      const port=(node,source)=>{const id=node.id+'.order_'+(source?'out':'in'),side=vertical?(source?'SOUTH':'NORTH'):(source?'EAST':'WEST');node.ports=node.ports||[];if(!node.ports.some(p=>p.id===id))node.ports.push({id,spiceGuide:true,x:vertical?0:source?(node.width||0):0,y:vertical&&source?(node.height||0):0,width:0,height:0,layoutOptions:{'org.eclipse.elk.port.side':side,'org.eclipse.elk.port.index':-1000}});node.layoutOptions={...node.layoutOptions,'org.eclipse.elk.portAlignment.default':'BEGIN'};return id;};
      common.edges.push({...edge,sourcePort:port(src,true),targetPort:port(dst,false)});continue;
    }
    let from=edge.sourcePort,n=parents.get(src.id);const net=lookup[edge.id];
    while(n!==common){const to=boundary(n,net,true);add(n,from,to,edge.id);from=to;n=parents.get(n.id);}
    const down=[];n=parents.get(dst.id);while(n!==common){down.push(n);n=parents.get(n.id);}down.reverse();
    for(const child of down){const to=boundary(child,net,false);add(n,from,to,edge.id);from=to;n=child;}
    add(n,from,edge.targetPort,edge.id);
  }
  return {original:original.filter(e=>!e.id.startsWith('__guide_')),pieces};
}

export function reuniteHierarchyEdges(flat,split) {
  const pieces=new Map(flat.edges.map(e=>[e.id,e]));
  flat.edges=split.original.map(edge=>{
    const routed=(split.pieces.get(edge.id)||[]).map(id=>{const p=pieces.get(id);if(!p)throw Error('ELK omitted a hierarchy edge section.');return p;});
    return {...edge,container:flat.id,sections:routed.flatMap(e=>e.sections||[]),junctionPoints:routed.flatMap(e=>e.junctionPoints||[])};
  });return flat;
}
