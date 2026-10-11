import { scaleLinear } from 'd3-scale';
import { line, area, curveLinear, curveMonotoneX } from 'd3-shape';
import {label, wrapLabel} from './labels.js';
const NS='http://www.w3.org/2000/svg';
function el(tag, attrs={}, text) {const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function add(parent,tag,attrs,text){const n=el(tag,attrs,text);parent.append(n);return n;}
function polygon(n,r,rotation=-Math.PI/2){return Array.from({length:n},(_,i)=>`${r*Math.cos(rotation+2*Math.PI*i/n)},${r*Math.sin(rotation+2*Math.PI*i/n)}`).join(' ');}
function markerFill(color){return '#'+[1,3,5].map(i=>Math.round(255*.75+parseInt(color.slice(i,i+2),16)*.25).toString(16).padStart(2,'0')).join('');}
function marker(parent,shape,x,y,size,color){
 const g=add(parent,'g',{'data-marker':shape,transform:`translate(${x},${y})`,fill:markerFill(color),'fill-opacity':1,stroke:color,'stroke-width':1.4,'stroke-linejoin':'round'}),r=size/2;
 if(shape==='circle')add(g,'circle',{r});
 else if(shape==='square')add(g,'rect',{x:-r,y:-r,width:size,height:size});
 else if(shape==='diamond')add(g,'polygon',{points:`0,${-r*1.3} ${r},0 0,${r*1.3} ${-r},0`});
 else if(shape==='star')add(g,'polygon',{points:Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,t=i%2?r*.75:r*1.25;return `${Math.cos(a)*t},${Math.sin(a)*t}`;}).join(' ')});
 else add(g,'polygon',{points:polygon(shape==='hexagon'?6:3,r*1.2)});
}
export async function render(series,s){
 const caption=s.caption?wrapLabel(s.caption,Math.floor((s.width-120)/(s.fontsize*.52))):[],lineHeight=s.fontsize*1.45,bottom=40+s.fontsize*1.5+caption.length*lineHeight;
 const left=64+s.fontsize,right=s.width-28,top=s.title?30+s.fontsize*1.5:28,base=s.height-bottom;
 if(base-top<80)throw Error('Increase figure height or shorten the caption.');
 const vals=series.flatMap(a=>a.points.filter(p=>p[0]>=s.xmin && p[0]<=s.xmax && Number.isFinite(p[1])).map(p=>p[1]));
 if(!vals.length)throw Error('No visible data in the displayed X range.');
 let lo=Infinity,hi=-Infinity;for(const v of vals){lo=Math.min(lo,v);hi=Math.max(hi,v);}const shaded=series.some(a=>a.shading&&(a.type==='function'||a.mode!=='scatter'));if(shaded){lo=Math.min(lo,s.baseline);hi=Math.max(hi,s.baseline);}const pad=(hi-lo||Math.abs(hi)||1)*.08;
 lo=s.ymin??(s.yticks.length>1?s.yticks[0]:shaded&&lo===s.baseline?lo:lo-pad);hi=s.ymax??(s.yticks.length>1?s.yticks.at(-1):hi+pad);if(lo>=hi)throw Error('Y min must be smaller than Y max.');
 if(!s.yticks.length){const nice=scaleLinear().domain([lo,hi]).nice(5).domain();if(s.ymin===null)lo=nice[0];if(s.ymax===null)hi=nice[1];}
 const x=scaleLinear().domain([s.xmin,s.xmax]).range([left,right]),y=scaleLinear().domain([lo,hi]).range([base,top]);
 const svg=el('svg',{xmlns:NS,width:s.width,height:s.height,viewBox:`0 0 ${s.width} ${s.height}`,role:'img','aria-label':s.title||s.caption||'Generated plot','font-family':'Arial, Helvetica, sans-serif','font-size':s.ticksize,fill:'#555'});
 add(svg,'title',{},s.title||'Generated plot');if(s.caption)add(svg,'desc',{},s.caption);
 add(svg,'rect',{width:s.width,height:s.height,fill:'#fff'});
 const defs=add(svg,'defs');add(add(defs,'clipPath',{id:'plot-clip'}),'rect',{x:left,y:top,width:right-left,height:base-top});
 const plot=add(svg,'g',{'clip-path':'url(#plot-clip)'});
 series.forEach((a,i)=>{
  const curve=a.mode==='spline'?curveMonotoneX:curveLinear;
  const finite=p=>Number.isFinite(p[1]);
  const drawLine=a.type==='function'||a.mode!=='scatter';
  if(drawLine && a.shading){let peak=s.baseline;for(const p of a.points)if(finite(p)&&p[0]>=s.xmin&&p[0]<=s.xmax&&Math.abs(p[1]-s.baseline)>Math.abs(peak-s.baseline))peak=p[1];const grad=add(defs,'linearGradient',{id:`plot-shade-${i}`,gradientUnits:'userSpaceOnUse',x1:0,y1:y(peak),x2:0,y2:y(s.baseline)});for(const [offset,opacity] of [['0%','.4'],['30%','.18'],['60%','0'],['100%','0']])add(grad,'stop',{offset,'stop-color':a.color,'stop-opacity':opacity});add(plot,'path',{'data-series-shading':a.id,d:area().defined(finite).x(p=>x(p[0])).y0(y(s.baseline)).y1(p=>y(p[1])).curve(curve)(a.points),fill:`url(#plot-shade-${i})`});}
  if(drawLine)add(plot,'path',{d:line().defined(finite).x(p=>x(p[0])).y(p=>y(p[1])).curve(curve)(a.points),fill:'none',stroke:a.color,'stroke-width':s.linewidth,'stroke-linejoin':'round','stroke-linecap':'round'});
 });
 // All markers paint after all curves; opaque pastel interiors mask the lines.
 const markers=add(svg,'g',{'data-layer':'markers','clip-path':'url(#plot-clip)'});
 series.forEach(a=>a.markers.filter(p=>p[0]>=s.xmin&&p[0]<=s.xmax&&p[1]>=lo&&p[1]<=hi).forEach(p=>marker(markers,a.shape,x(p[0]),y(p[1]),a.markersize,a.color)));
 add(svg,'rect',{x:left,y:top,width:right-left,height:base-top,fill:'none',stroke:'#919597','stroke-width':1});
 const format=v=>Math.abs(v)>=1e5 || (v!==0 && Math.abs(v)<.001)?v.toExponential(1):Number(v.toPrecision(6)).toString();
 for(const v of s.xticks.length?s.xticks:x.ticks(6)){if(v<s.xmin||v>s.xmax)continue;const px=x(v);add(svg,'path',{'data-axis':'x-tick',d:`M${px},${base}v6`,stroke:'#919597',fill:'none'});add(svg,'text',{x:px,y:base+10+s.ticksize,'text-anchor':'middle'},format(v));}
 const yticks=[...new Set([lo,...(s.yticks.length?s.yticks:y.ticks(5)),hi])].filter(v=>v>=lo&&v<=hi).sort((a,b)=>a-b);
 for(const v of yticks){const py=y(v);add(svg,'path',{'data-axis':'y-tick',d:`M${left},${py}h-6`,stroke:'#919597',fill:'none'});add(svg,'text',{x:left-11,y:py+s.ticksize*.35,'text-anchor':'end'},format(v));}
 await label(svg,s.xlabel,{x:(left+right)/2,y:base+26+s.fontsize,size:s.fontsize,anchor:'middle'});
 await label(svg,s.ylabel,{x:21,y:(top+base)/2,size:s.fontsize,anchor:'middle',rotate:-90});
 if(s.title)await label(svg,s.title,{x:(left+right)/2,y:20+s.fontsize*.4,size:s.fontsize,anchor:'middle'});
 for(let i=0;i<caption.length;i++)await label(svg,caption[i],{x:left,y:base+38+s.fontsize+i*lineHeight+lineHeight,size:s.fontsize});
 if(s.legend)for(let i=0;i<series.length;i++){const a=series[i],py=top+22+i*Math.max(24,lineHeight);add(svg,'path',{d:`M${left+15},${py}h28`,stroke:a.color,'stroke-width':s.linewidth});marker(svg,a.shape,left+29,py,a.markersize,a.color);await label(svg,a.name,{x:left+54,y:py+s.fontsize*.35,size:s.fontsize,color:a.color});}
 return svg;
}
