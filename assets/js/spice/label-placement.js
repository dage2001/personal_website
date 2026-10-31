import onml from 'onml';
const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
const textWidth=(s,f)=>[...s].reduce((n,c)=>n+(c.charCodeAt(0)>255?1:.64),0)*f;
/** One-way annotation pass: read immutable symbol/wire geometry, move text only. */
export function arrangeLabels(groups,wires,fontSize=12){
  const placed=[],boxes=groups.map(g=>({x:g.x,y:g.y,w:g.w,h:g.h}));
  for(const [i,g]of groups.entries()){
    if(!g.labels.length)continue;const w=Math.max(...g.labels.map(l=>textWidth(l.text,fontSize)))+4,h=g.labels.length*(fontSize+4),candidates=[];
    for(const gap of [5,14,28,48]){
      const top={x:g.x+(g.w-w)/2,y:g.y-gap-h,w,h},bottom={x:g.x+(g.w-w)/2,y:g.y+g.h+gap,w,h},right={x:g.x+g.w+gap,y:g.y+(g.h-h)/2,w,h},left={x:g.x-gap-w,y:g.y+(g.h-h)/2,w,h};
      candidates.push(...(g.w>g.h?[top,bottom,right,left]:[right,left,top,bottom]));
    }
    const wireCost=r=>wires.reduce((n,s)=>{const x=Math.min(s.a.x,s.b.x),y=Math.min(s.a.y,s.b.y),b={x:x-1,y:y-1,w:Math.abs(s.a.x-s.b.x)+2,h:Math.abs(s.a.y-s.b.y)+2};return n+overlap(r,b)*2;},0);
    let best=null,cost=Infinity;for(const [rank,r]of candidates.entries()){const c=boxes.reduce((n,b,j)=>n+(j===i?0:overlap(r,b))*500,0)+placed.reduce((n,b)=>n+overlap(r,b)*100,0)+wireCost(r)+rank*3;if(c<cost){cost=c;best=r;}}
    g.labels.forEach((l,j)=>{l.x=best.x-g.x;l.y=best.y-g.y+fontSize+j*(fontSize+4);});placed.push(best);
  }
  const all=[...boxes,...placed];return {x:Math.min(0,...all.map(b=>b.x)),y:Math.min(0,...all.map(b=>b.y)),right:Math.max(0,...all.map(b=>b.x+b.w)),bottom:Math.max(0,...all.map(b=>b.y+b.h))};
}
const translate=s=>{const m=s?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);return m?{x:+m[1],y:+m[2]}:{x:0,y:0};};
export function placeSvgLabels(source){
  const ast=onml.parse(source),style=ast.find(n=>n[0]==='style')?.[2]||'',font=Number(style.match(/font-size:([\d.]+)px/)?.[1])||12;
  const groups=ast.filter(n=>n[0]==='g'&&n[1].id?.startsWith('cell_')).map(n=>({...translate(n[1].transform),w:+n[1]['s:width'],h:+n[1]['s:height'],labels:n.filter(c=>c[0]==='text'&&c[1]?.['data-layout-label']).map(c=>({node:c,text:c.slice(2).filter(t=>typeof t==='string').join('')}))}));
  const wires=ast.filter(n=>n[0]==='line'&&n[1].class?.startsWith('net_')).map(n=>({a:{x:+n[1].x1,y:+n[1].y1},b:{x:+n[1].x2,y:+n[1].y2}}));
  const bounds=arrangeLabels(groups,wires,font);for(const g of groups)for(const l of g.labels)Object.assign(l.node[1],{x:l.x,y:l.y,'text-anchor':'start','pointer-events':'none'});
  ast[1]['data-label-bounds']=JSON.stringify(bounds);return onml.stringify(ast);
}
export function placeDomLabels(svg,font=12){
  const groups=[...svg.children].filter(g=>g.localName==='g'&&g.id.startsWith('cell_')).map(g=>({...translate(g.getAttribute('transform')),w:+g.getAttribute('s:width'),h:+g.getAttribute('s:height'),labels:[...g.children].filter(t=>t.localName==='text'&&t.hasAttribute('data-layout-label')).map(node=>({node,text:node.textContent}))}));
  const wires=[...svg.children].filter(n=>n.localName==='line'&&n.hasAttribute('data-net')).map(n=>({a:{x:+n.getAttribute('x1'),y:+n.getAttribute('y1')},b:{x:+n.getAttribute('x2'),y:+n.getAttribute('y2')}}));
  const bounds=arrangeLabels(groups,wires,font);for(const g of groups)for(const l of g.labels){l.node.setAttribute('x',l.x);l.node.setAttribute('y',l.y);l.node.setAttribute('text-anchor','start');l.node.setAttribute('pointer-events','none');}svg.dataset.labelBounds=JSON.stringify(bounds);return bounds;
}
