const NS='http://www.w3.org/2000/svg';
const cache=new Map();
let ready;
function mathReady(){
 if(!ready)ready=new Promise((resolve,reject)=>{
  const start=()=>{const mj=window.MathJax;if(!mj?.startup?.promise){reject(Error('MathJax did not load. Reload the page to render math labels.'));return;}mj.startup.promise.then(()=>resolve(mj),reject);};
  if(window.MathJax?.startup?.promise)start();
  else{const script=document.getElementById('MathJax-script');script.addEventListener('load',start,{once:true});script.addEventListener('error',()=>reject(Error('Unable to load MathJax for math labels.')),{once:true});}
 });
 return ready;
}
async function mathSVG(latex){
 if(!cache.has(latex)){
  const promise=(async()=>{const mj=await mathReady();const result=await mj.tex2svgPromise(latex,{display:false});const error=result.querySelector('[data-mml-node="merror"]');if(error)throw Error(`Invalid math label: ${error.getAttribute('data-mjx-error')||error.textContent}`);return result.querySelector('svg').cloneNode(true);})();
  cache.set(latex,promise);promise.catch(()=>cache.delete(latex));if(cache.size>100)cache.delete(cache.keys().next().value);
 }
 return (await cache.get(latex)).cloneNode(true);
}
export function splitLabel(text){
 const pieces=[];let plain='',math='',inside=false;
 for(let i=0;i<text.length;i++){
  if(text[i]==='\\'&&text[i+1]==='$'){if(inside)math+='\\$';else plain+='$';i++;continue;}
  if(text[i]==='$'){
   if(inside){if(!math.trim())throw Error('Math labels require a nonempty expression between $ delimiters.');pieces.push({math});math='';inside=false;}
   else{if(plain)pieces.push({text:plain});plain='';inside=true;}
  }else if(inside)math+=text[i];else plain+=text[i];
 }
 if(inside)throw Error('Math labels need matching $ delimiters. Use \\$ for a literal dollar sign.');
 if(plain)pieces.push({text:plain});return pieces;
}
// Preserve math runs when wrapping a caption; never split LaTeX across lines.
export function wrapLabel(text,max){
 splitLabel(text);
 const rows=[];for(const paragraph of text.split('\n')){
  const tokens=[];let word='',inside=false;
  for(let i=0;i<paragraph.length;i++){const c=paragraph[i];if(c==='\\'&&paragraph[i+1]){word+=c+paragraph[++i];continue;}if(c==='$')inside=!inside;if(/\s/.test(c)&&!inside){if(word)tokens.push(word);word='';}else word+=c;}
  if(word)tokens.push(word);
  let row='';for(const token of tokens){if(row.length+token.length>max&&row){rows.push(row);row='';}row+=(row?' ':'')+token;}rows.push(row);
 }
 return rows;
}
export async function label(parent,text,{x=0,y=0,size=17,anchor='start',color='#555',rotate=0}={}){
 const parts=splitLabel(text), group=document.createElementNS(NS,'g');group.setAttribute('class','plot-label');group.setAttribute('aria-label',text);group.setAttribute('color',color);group.setAttribute('fill',color);
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`${size}px Arial, Helvetica, sans-serif`;
 let width=0;
 for(const part of parts){
  if(part.text!==undefined){const n=document.createElementNS(NS,'text');n.textContent=part.text;n.setAttribute('x',width);n.setAttribute('y',0);n.setAttribute('font-size',size);n.setAttribute('xml:space','preserve');group.append(n);width+=ctx.measureText(part.text).width;}
  else{
   const svg=await mathSVG(part.math),vb=svg.getAttribute('viewBox').split(/\s+/).map(Number),scale=size/1000;
   if(vb.length!==4||!vb.every(Number.isFinite))throw Error('Unable to determine math label dimensions.');
   svg.setAttribute('x',width);svg.setAttribute('y',vb[1]*scale);svg.setAttribute('width',vb[2]*scale);svg.setAttribute('height',vb[3]*scale);svg.removeAttribute('style');svg.removeAttribute('xmlns');svg.setAttribute('overflow','visible');svg.setAttribute('color',color);
   const g=svg.querySelector('g');if(g){g.setAttribute('fill',color);g.setAttribute('stroke',color);}
   // Labels are graphics, so exported formulas do not retain link targets.
   for(const link of svg.querySelectorAll('a'))link.replaceWith(...link.childNodes);
   const style=document.createElementNS(NS,'style');style.textContent='[data-frame],[data-line]{stroke-width:70px;fill:none}.mjx-dashed{stroke-dasharray:140}.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}';svg.prepend(style);
   group.append(svg);width+=vb[2]*scale;
  }
 }
 const offset=anchor==='middle'?-width/2:anchor==='end'?-width:0;
 group.setAttribute('transform',`translate(${x} ${y}) rotate(${rotate}) translate(${offset} 0)`);parent.append(group);
 return group;
}
