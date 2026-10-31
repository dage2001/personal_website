/** Selection uses physical symbol boxes only. Text and wires are not candidates. */
export function selectInBox(components,start,end){
  const left=Math.min(start.x,end.x),right=Math.max(start.x,end.x),top=Math.min(start.y,end.y),bottom=Math.max(start.y,end.y),crossing=end.x<start.x,eps=.001;
  return components.filter(n=>!n.decoration&&(crossing
    ? n.x<=right+eps&&n.x+n.width>=left-eps&&n.y<=bottom+eps&&n.y+n.height>=top-eps
    : n.x>=left-eps&&n.x+n.width<=right+eps&&n.y>=top-eps&&n.y+n.height<=bottom+eps)).map(n=>n.id);
}
/** Return simultaneous, grid-snapped translations; distribution means equal edge gaps. */
export function arrangeComponents(components,ids,action,step){
  const chosen=new Set(ids),nodes=components.filter(n=>chosen.has(n.id)&&!n.decoration),distribute=action.startsWith('space-');
  if(nodes.length<(distribute?3:2))throw Error(distribute?'Select at least three components.':'Select at least two components.');
  const horizontal=['left','right','center-x','space-x'].includes(action),vertical=['top','bottom','center-y','space-y'].includes(action);
  if(!horizontal&&!vertical)throw Error('Unknown arrangement.');
  const axis=horizontal?'x':'y',size=horizontal?'width':'height',min=Math.min(...nodes.map(n=>n[axis])),max=Math.max(...nodes.map(n=>n[axis]+n[size]));
  const targets=new Map();
  if(distribute){
    const ordered=[...nodes].sort((a,b)=>a[axis]-b[axis]||a.id.localeCompare(b.id)),last=ordered.at(-1),extent=last[axis]+last[size]-ordered[0][axis],gap=(extent-ordered.reduce((s,n)=>s+n[size],0))/(nodes.length-1);
    if(gap<-.001)throw Error('Not enough space for non-overlapping equal gaps. Move the outer components farther apart.');
    let position=ordered[0][axis];for(const n of ordered){targets.set(n.id,position);position+=n[size]+gap;}
  }else for(const n of nodes)targets.set(n.id,['left','top'].includes(action)?min:['right','bottom'].includes(action)?max-n[size]:(min+max-n[size])/2);
  let rounded=false;const moves=nodes.map(n=>{const exact=targets.get(n.id)-n[axis],delta=Math.round(exact/step)*step;if(Math.abs(delta-exact)>.001)rounded=true;return {id:n.id,dx:horizontal?delta:0,dy:vertical?delta:0};});
  return {moves,rounded};
}
