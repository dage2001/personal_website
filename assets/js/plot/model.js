import { LatexSyntax } from '@cortex-js/compute-engine/latex-syntax';
import Papa from 'papaparse';
const syntax = new LatexSyntax();
export const palette = [
 ['#dae8f1','#c3daec','#b7d2e5','#9abddd','#7ea8d1','#5d8bbf','#3f72aa','#23598f','#073a68'],
 ['#def1ef','#c9eae9','#c2e6e6','#a8dddd','#8bd1d3','#6fc3c6','#57b0b6','#3f9b9e','#157579'],
 ['#e3f0e6','#cde5d5','#c3e0ce','#aed6be','#96c8ad','#7db898','#65a583','#519370','#31714e'],
 ['#fef0d3','#fde7b5','#fce2a5','#fcdc91','#fbd276','#f9c65c','#f4bb49','#eaaa36','#de9419'],
 ['#fde7d7','#fddbc2','#fcd1b0','#fbc39a','#f7b381','#f6a168','#f19055','#e87b42','#ca5625'],
 ['#fce3df','#fdd2cc','#fbc6be','#fbb8ad','#f8a698','#f38f7f','#ed7e72','#df6861','#bc4b4d'],
 ['#f2e6ea','#ebd7e0','#e6ccd9','#dbbbca','#cea7bc','#c091ab','#b07b99','#9f6887','#774566'],
 ['#ebe8f1','#d4d1e4','#cac6df','#bab5d4','#a39ec7','#8d89ba','#7a77af','#5f5f95','#454778'],
 ['#ede4db','#e0d6cc','#d4c8bc','#cbbbae','#b6a496','#a28f80','#8e7b6a','#7d6a5b','#55473c'],
 ['#eaebed','#dedee0','#d4d4d6','#c1c1c1','#a9adb0','#979b9e','#818588','#666a6d','#3a3e3f']
].flat();
const ops = {
 Add: (...v)=>v.reduce((a,b)=>a+b,0), Multiply: (...v)=>v.reduce((a,b)=>a*b,1),
 InvisibleOperator: (...v)=>v.reduce((a,b)=>a*b,1),
 Subtract:(a,b)=>a-b, Divide:(a,b)=>a/b, Negate:a=>-a, Power:(a,b)=>Math.pow(a,b),
 Square:a=>a*a, Sqrt:Math.sqrt, Root:(a,b=2)=> b%2 && a<0 ? -Math.pow(-a,1/b):Math.pow(a,1/b),
 Exp:Math.exp, Ln:Math.log, Log:(a,b=10)=>Math.log(a)/Math.log(b), Abs:Math.abs,
 Sin:Math.sin, Cos:Math.cos, Tan:Math.tan, Arcsin:Math.asin, Arccos:Math.acos, Arctan:Math.atan,
 Sinh:Math.sinh, Cosh:Math.cosh, Tanh:Math.tanh, Rational:(a,b)=>a/b
};
function compile(node, bindings=new Set(), allowX=true) {
 if (typeof node==='number') return ()=>node;
 if (typeof node==='string') {
  if(bindings.has(node))return (x,scope)=>scope[node];
  if (node==='x') {if(!allowX)throw Error('Sum/product bounds must be fixed finite integers or depend on an outer index, not x.');return x=>x;}
  const constants={Pi:Math.PI,ExponentialE:Math.E,e:Math.E};
  if (node in constants) return ()=>constants[node];
  throw Error(`Unsupported symbol: ${node}. Only x, π and e are supported.`);
 }
 if (node && !Array.isArray(node) && 'num' in node) {
  const n=Number(node.num); if (Number.isFinite(n)) return ()=>n;
 }
 if (Array.isArray(node) && node[0]==='Delimiter') return compile(node[1],bindings,allowX);
 if (Array.isArray(node) && ['Sum','Product'].includes(node[0])) {
  const range=node[2];
  if(node.length!==3 || !Array.isArray(range) || range[0]!=='Tuple' || range.length!==4 || typeof range[1]!=='string' || range[1]==='Nothing' || range.slice(2).some(v=>v==='Nothing'||v==='PositiveInfinity'||v==='NegativeInfinity'))throw Error('Sum/product requires an index and finite integer bounds, e.g. \\sum_{k=1}^{5} x^k. Infinite or unbounded series are unsupported.');
  const index=range[1],lo=compile(range[2],bindings,false),hi=compile(range[3],bindings,false);
  const body=compile(node[1],new Set([...bindings,index]),allowX),product=node[0]==='Product';
  function bounds(x,scope,state={steps:0}){const start=lo(x,scope,state),end=hi(x,scope,state);if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end))throw Error('Sum/product bounds must evaluate to finite safe integers.');if(end-start+1>1000)throw Error('Use at most 1,000 terms in each sum/product.');return [start,end];}
  if(!bindings.size)bounds(0,Object.create(null));
  return (x,scope,state)=>{const [start,end]=bounds(x,scope,state);const local=Object.assign(Object.create(null),scope);let result=product?1:0;for(let i=start;i<=end;i++){if(++state.steps>10000)throw Error('Nested sums/products exceed 10,000 total terms per evaluation.');local[index]=i;const value=body(x,local,state);result=product?result*value:result+value;}return result;};
 }
 if (!Array.isArray(node) || !ops[node[0]]) throw Error(`Unsupported expression or function: ${Array.isArray(node)?node[0]:'invalid input'}.`);
 const args=node.slice(1).map(n=>compile(n,bindings,allowX)), op=ops[node[0]];
 return (x,scope,state)=>op(...args.map(f=>f(x,scope,state)));
}
export function expression(source) {
 let latex=source.trim().replace(/^\$\$?([\s\S]*?)\$\$?$/, '$1').replace(/^\\[([]([\s\S]*?)\\[)\]]$/, '$1').replace(/^y\s*=/,'');
 if (!latex) throw Error('Enter a LaTeX function.');
 const f=compile(syntax.parse(latex));
 return x=>f(x,Object.create(null),{steps:0});
}
export function numbers(source, ticks=false) {
 if (!source.trim()) return [];
 let values;
 if(ticks && source.includes(':')) {
  const parts=source.split(':');const [start,step,end]=parts.map(Number);
  if(parts.length!==3 || parts.some(p=>!p.trim()) || ![start,step,end].every(Number.isFinite) || step===0 || (end-start)*step<0) throw Error('Ticks must be start:step:end with a step toward the end.');
  const n=Math.floor((end-start)/step+1e-9)+1;
  if(n>200) throw Error('Use at most 200 ticks.');
  values=Array.from({length:n},(_,i)=>start+i*step);
 } else {
  const parts=source.split(',');
  if(parts.some(s=>!s.trim())) throw Error('Use comma-separated numbers without empty entries.');
  values=parts.map(Number);
 }
 if(!values.every(Number.isFinite)) throw Error('Coordinates and ticks must be finite numbers.');
 if(values.length>(ticks?200:10000)) throw Error('Too many coordinates.');
 return [...new Set(values)].sort((a,b)=>a-b);
}
export function csv(text, header) {
 const result=Papa.parse(text.replace(/^\uFEFF/,''),{skipEmptyLines:'greedy'});
 if(result.errors.length) throw Error(result.errors[0].message);
 if(result.data.length< (header?2:1)) throw Error('CSV contains no data rows.');
 const width=result.data[0].length;
 if(width<2) throw Error('CSV requires at least two columns.');
 if(result.data.length>20001) throw Error('Use at most 20,000 CSV rows.');
 if(result.data.some(r=>r.length!==width)) throw Error('All CSV rows must have the same column count.');
 const labels=header?result.data.shift().map((s,i)=>s.trim()||`Column ${i+1}`):Array.from({length:width},(_,i)=>`Column ${i+1}`);
 return {labels,rows:result.data};
}
export function csvPoints(table, x, y) {
 let skipped=0; const points=[];
 for(let i=0;i<table.rows.length;i++) {
  const row=table.rows[i]; if(!row[x].trim() || !row[y].trim()) {skipped++; continue;}
  const a=Number(row[x]),b=Number(row[y]);
  if(!Number.isFinite(a)||!Number.isFinite(b)) throw Error(`Nonnumeric value at data row ${i+1}, columns ${x+1}/${y+1}.`);
  points.push([a,b]);
 }
 if(!points.length) throw Error('Selected columns have no numeric pairs.');
 return {points,skipped};
}
export function prepare(series, settings) {
 let points,markers;
 if(series.type==='csv') {
  points=[...series.points].sort((a,b)=>a[0]-b[0]);
  if(series.mode==='spline' && points.some((p,i)=>i && p[0]===points[i-1][0])) throw Error('Spline requires unique X values. Choose scatter or polyline for duplicate X values.');
  if(series.mode==='spline' && points.length<2) throw Error('Spline requires at least two points.');
  markers=points;
 } else {
  const f=expression(series.formula), lo=Number(series.min),hi=Number(series.max);
  if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo>=hi) throw Error('Function X min must be smaller than X max.');
  points=Array.from({length:1601},(_,i)=>{const x=lo+(hi-lo)*i/1600;return [x,f(x)];});
  // Detect poles between samples; split paths instead of drawing a vertical bridge.
  for(let i=1;i<points.length;i++) {
   const a=points[i-1], b=points[i],mid=f((a[0]+b[0])/2);
   if(!Number.isFinite(mid) || (a[1]*b[1]<0 && Math.abs(a[1]-b[1])>100 && Math.abs(mid)>Math.max(Math.abs(a[1]),Math.abs(b[1])))) points.splice(i++,0,[(a[0]+b[0])/2,NaN]);
  }
  let xs=[];
  if(series.mode==='positions') {
   xs=numbers(series.positions); if(!xs.length) throw Error('Enter marker X coordinates.');
   if(xs.some(x=>x<lo||x>hi)) throw Error('Marker coordinates must be inside the function X range.');
  } else if(series.mode==='count') {
   const n=Number(series.count); if(!Number.isInteger(n)||n<1||n>10000) throw Error('Marker count must be an integer from 1 to 10,000.');
   xs=Array.from({length:n},(_,i)=>n===1?(lo+hi)/2:lo+(hi-lo)*i/(n-1));
  }
  markers=xs.map(x=>[x,f(x)]);
  if(markers.some(p=>!Number.isFinite(p[1]))) throw Error('The function is undefined at a requested marker coordinate.');
  if(!points.some(p=>Number.isFinite(p[1]) && p[0]>=settings.xmin && p[0]<=settings.xmax)) throw Error('No real finite values in the displayed X range.');
 }
 return {...series,points,markers};
}
