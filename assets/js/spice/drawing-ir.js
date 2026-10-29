/** Format-neutral snapshot of the selected layout, before either file exporter. */
export function captureDrawing(graph,cells) {
  const components=graph.children.filter(n=>cells[n.id]?.attributes.name!=='0').map(n=>({
    id:n.id,x:n.x,y:n.y,width:n.width,height:n.height,
    ports:n.ports.map(p=>({pin:p.id.slice(n.id.length+1),x:n.x+p.x,y:n.y+p.y,side:p.layoutOptions?.['org.eclipse.elk.port.side'],bit:cells[n.id].connections[p.id.slice(n.id.length+1)]?.[0]}))
  }));
  const segments=[];
  for(const edge of graph.edges) {
    const source=edge.sourcePort||edge.sources?.[0],owner=source?.slice(0,source.lastIndexOf('.')),pin=source?.slice(source.lastIndexOf('.')+1),bit=cells[owner]?.connections[pin]?.[0];
    if(bit===undefined)throw Error('Layout edge has no electrical net.');
    for(const s of edge.sections||[]){const ps=[s.startPoint,...s.bendPoints||[],s.endPoint];for(let i=1;i<ps.length;i++)segments.push({bit,a:{...ps[i-1]},b:{...ps[i]}});}
  }
  return {version:1,width:graph.width,height:graph.height,components,segments};
}
