import { scaleLinear } from 'd3-scale';
import { line, area, curveLinear, curveMonotoneX } from 'd3-shape';
const NS='http://www.w3.org/2000/svg';
function el(tag, attrs={}, text) {const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function add(parent,tag,attrs,text){const n=el(tag,attrs,text);parent.append(n);return n;}
function polygon(n,r,rotation=-Math.PI/2){return Array.from({length:n},(_,i)=>`${r*Math.cos(rotation+2*Math.PI*i/n)},${r*Math.sin(rotation+2*Math.PI*i/n)}`).join(' ');}
function marker(parent,shape,x,y,size,color){
 const g=add(parent,'g',{transform:`translate(${x},${y})`,fill:color,'fill-opacity':'.25',stroke:color,'stroke-width':1.4,'stroke-linejoin':'round'}),r=size/2;
 if(shape==='circle')add(g,'circle',{r});
 else if(shape==='square')add(g,'rect',{x:-r,y:-r,width:size,height:size});
 else if(shape==='diamond')add(g,'polygon',{points:`0,${-r*1.3} ${r},0 0,${r*1.3} ${-r},0`});
 else if(shape==='star')add(g,'polygon',{points:Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,t=i%2?r*.45:r*1.25;return `${Math.cos(a)*t},${Math.sin(a)*t}`;}).join(' ')});
 else add(g,'polygon',{points:polygon(shape==='hexagon'?6:3,r*1.2)});
}
function wrap(text,max){const out=[];for(const paragraph of text.split('\n')){let row='';for(let word of paragraph.split(/\s+/)){if(row.length+word.length>max && row){out.push(row);row='';}while(word.length>max){out.push(word.slice(0,max));word=word.slice(max);}row+=(row?' ':'')+word;}out.push(row);}return out;}
export function render(series,s){
 const caption=s.caption?wrap(s.caption,Math.floor((s.width-110)/7)):[],bottom=64+caption.length*19;
 const left=80,right=s.width-28,top=s.title?54:28,base=s.height-bottom;
 if(base-top<80)throw Error('Increase figure height or shorten the caption.');
 const vals=series.flatMap(a=>a.points.filter(p=>p[0]>=s.xmin && p[0]<=s.xmax && Number.isFinite(p[1])).map(p=>p[1]));
 if(!vals.length)throw Error('No visible data in the displayed X range.');
 let lo=Infinity,hi=-Infinity;for(const v of vals){lo=Math.min(lo,v);hi=Math.max(hi,v);}if(s.shading){lo=Math.min(lo,s.baseline);hi=Math.max(hi,s.baseline);}const pad=(hi-lo||Math.abs(hi)||1)*.08;
 lo=s.ymin??lo-pad;hi=s.ymax??hi+pad;if(lo>=hi)throw Error('Y min must be smaller than Y max.');
 const x=scaleLinear().domain([s.xmin,s.xmax]).range([left,right]),y=scaleLinear().domain([lo,hi]).range([base,top]);
 const svg=el('svg',{xmlns:NS,width:s.width,height:s.height,viewBox:`0 0 ${s.width} ${s.height}`,role:'img','aria-label':s.title||s.caption||'Generated plot','font-family':'Arial, Helvetica, sans-serif','font-size':14,fill:'#555'});
 add(svg,'title',{},s.title||'Generated plot');if(s.caption)add(svg,'desc',{},s.caption);
 add(svg,'rect',{width:s.width,height:s.height,fill:'#fff'});
 const defs=add(svg,'defs');add(add(defs,'clipPath',{id:'plot-clip'}),'rect',{x:left,y:top,width:right-left,height:base-top});
 const plot=add(svg,'g',{'clip-path':'url(#plot-clip)'});
 series.forEach((a,i)=>{
  const curve=a.mode==='spline'?curveMonotoneX:curveLinear;
  const finite=p=>Number.isFinite(p[1]);
  const drawLine=a.type==='function'||a.mode!=='scatter';
  if(drawLine && s.shading){const grad=add(defs,'linearGradient',{id:`plot-shade-${i}`,x1:0,y1:0,x2:0,y2:1});add(grad,'stop',{offset:'0%','stop-color':a.color,'stop-opacity':'.3'});add(grad,'stop',{offset:'100%','stop-color':a.color,'stop-opacity':'.015'});add(plot,'path',{d:area().defined(finite).x(p=>x(p[0])).y0(y(s.baseline)).y1(p=>y(p[1])).curve(curve)(a.points),fill:`url(#plot-shade-${i})`});}
  if(drawLine)add(plot,'path',{d:line().defined(finite).x(p=>x(p[0])).y(p=>y(p[1])).curve(curve)(a.points),fill:'none',stroke:a.color,'stroke-width':s.linewidth,'stroke-linejoin':'round','stroke-linecap':'round'});
  a.markers.filter(p=>p[0]>=s.xmin&&p[0]<=s.xmax&&p[1]>=lo&&p[1]<=hi).forEach(p=>marker(plot,a.shape,x(p[0]),y(p[1]),s.markersize,a.color));
 });
 add(svg,'rect',{x:left,y:top,width:right-left,height:base-top,fill:'none',stroke:'#919597','stroke-width':1});
 const format=v=>Math.abs(v)>=1e5 || (v!==0 && Math.abs(v)<.001)?v.toExponential(1):Number(v.toPrecision(6)).toString();
 for(const v of s.xticks.length?s.xticks:x.ticks(6)){if(v<s.xmin||v>s.xmax)continue;const px=x(v);add(svg,'path',{d:`M${px},${base}v6 M${px},${top}v-4`,stroke:'#919597',fill:'none'});add(svg,'text',{x:px,y:base+24,'text-anchor':'middle'},format(v));}
 for(const v of s.yticks.length?s.yticks:y.ticks(5)){if(v<lo||v>hi)continue;const py=y(v);add(svg,'path',{d:`M${left},${py}h-6 M${right},${py}h4`,stroke:'#919597',fill:'none'});add(svg,'text',{x:left-11,y:py+5,'text-anchor':'end'},format(v));}
 add(svg,'text',{x:(left+right)/2,y:base+49,'text-anchor':'middle','font-size':17},s.xlabel);
 add(svg,'text',{transform:`translate(21 ${(top+base)/2}) rotate(-90)`,'text-anchor':'middle','font-size':17},s.ylabel);
 if(s.title)add(svg,'text',{x:(left+right)/2,y:27,'text-anchor':'middle','font-size':19},s.title);
 caption.forEach((t,i)=>add(svg,'text',{x:left,y:base+75+i*19,'font-size':13},t));
 if(s.legend)series.forEach((a,i)=>{const py=top+22+i*24;add(svg,'path',{d:`M${left+15},${py}h28`,stroke:a.color,'stroke-width':s.linewidth});marker(svg,a.shape,left+29,py,s.markersize,a.color);add(svg,'text',{x:left+54,y:py+5,fill:a.color},a.name);});
 return svg;
}
