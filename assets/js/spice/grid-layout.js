import {gridSkin} from './grid-symbols.js';
const round=n=>Math.round(n*1000)/1000;
/** Strictly ordered integer tracks, with minimum spans for symbols/labels.
 * A shared axis map preserves crossings, branches and separation of all nets. */
function axis(values,spans,step,rails=[]){
  const sorted=[...new Set(values.map(round))].sort((a,b)=>a-b),indices=new Map(sorted.map((v,i)=>[v,i])),incoming=new Map();
  for(const [a,b,d]of spans){const to=indices.get(round(b)),from=indices.get(round(a));if(from===to||d<.002)continue;if(!incoming.has(to))incoming.set(to,[]);incoming.get(to).push({from,min:Math.ceil((d-.002)/step)});}
  const q=[];for(let i=0;i<sorted.length;i++)q.push(Math.max(Math.round(sorted[i]/step),i?q[i-1]+1:0,...(incoming.get(i)||[]).map(e=>q[e.from]+e.min)));
  const rs=[...new Set(rails.map(round))].sort((a,b)=>a-b).map(v=>indices.get(v));if(rs.length>2){const pitch=Math.max(...rs.slice(1).map((i,j)=>q[i]-q[rs[j]]));for(let i=1;i<rs.length;i++){const delta=q[rs[0]]+i*pitch-q[rs[i]];for(let j=rs[i];j<q.length;j++)q[j]+=delta;}}
  return value=>{const i=indices.get(round(value));if(i===undefined)throw Error('Grid coordinate was not registered: '+value);return q[i]*step;};
}
export function snapLayoutGrid(layout,cells,skin,attachments,rails,groups,step){
  if(![4,8,16].includes(step))throw Error('Grid step must be 4, 8 or 16.');
  const xs=[0,layout.width],ys=[0,layout.height],xspans=[],yspans=[],add=p=>{xs.push(p.x);ys.push(p.y);};
  for(const n of layout.children){add(n);add({x:n.x+n.width,y:n.y+n.height});xspans.push([n.x,n.x+n.width,n.width]);yspans.push([n.y,n.y+n.height,n.height]);for(const p of n.ports||[]){add({x:n.x+p.x,y:n.y+p.y});xspans.push([n.x,n.x+p.x,p.x],[n.x+p.x,n.x+n.width,n.width-p.x]);yspans.push([n.y,n.y+p.y,p.y],[n.y+p.y,n.y+n.height,n.height-p.y]);}}
  for(const e of layout.edges){for(const s of e.sections||[])for(const p of [s.startPoint,...s.bendPoints||[],s.endPoint])add(p);for(const p of e.junctionPoints||[])add(p);}
  for(const a of attachments)if(a.anchor){add(a.anchor);add(a.end);}for(const r of rails)ys.push(r.y);for(const g of groups){add(g);add({x:g.x+g.width,y:g.y+g.height});}
  const x=axis(xs,xspans,step),y=axis(ys,yspans,step,rails.map(r=>r.y)),point=p=>({x:x(p.x),y:y(p.y)}),width=x(layout.width),height=y(layout.height);
  for(const n of layout.children){const ox=n.x,oy=n.y,nx=x(ox),ny=y(oy),w=x(ox+n.width)-nx,h=y(oy+n.height)-ny;for(const p of n.ports||[]){p.x=x(ox+p.x)-nx;p.y=y(oy+p.y)-ny;}n.x=nx;n.y=ny;n.width=w;n.height=h;
    const template=skin.find(g=>g[1]?.['s:type']===cells[n.id]?.type);if(!template)throw Error('Grid symbol is missing: '+n.id);gridSkin(template,step,{width:w,height:h,ports:n.ports.map(p=>({pin:p.id.slice(n.id.length+1),x:p.x,y:p.y}))});
  }
  for(const e of layout.edges){for(const s of e.sections||[]){s.startPoint=point(s.startPoint);s.endPoint=point(s.endPoint);s.bendPoints=(s.bendPoints||[]).map(point);}e.junctionPoints=(e.junctionPoints||[]).map(point);}
  for(const a of attachments)if(a.anchor){a.anchor=point(a.anchor);a.end=point(a.end);}for(const r of rails)r.y=y(r.y);for(const g of groups){const end=point({x:g.x+g.width,y:g.y+g.height}),start=point(g);g.x=start.x;g.y=start.y;g.width=end.x-start.x;g.height=end.y-start.y;}
  layout.width=width;layout.height=height;
  return {gridSize:step,gridVerified:true,gridTracks:{x:new Set(xs.map(round)).size,y:new Set(ys.map(round)).size}};
}
