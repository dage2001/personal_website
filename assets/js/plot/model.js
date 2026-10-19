import { LatexSyntax } from '@cortex-js/compute-engine/latex-syntax';
import Papa from 'papaparse';
const syntax = new LatexSyntax();
export {palette} from '../nature-palette.js';
const ops = {
 Add: (...v)=>v.reduce((a,b)=>a+b,0), Multiply: (...v)=>v.reduce((a,b)=>a*b,1),
 InvisibleOperator: (...v)=>v.reduce((a,b)=>a*b,1),
 Subtract:(a,b)=>a-b, Divide:(a,b)=>a/b, Negate:a=>-a, Power:(a,b)=>Math.pow(a,b),
 Square:a=>a*a, Sqrt:Math.sqrt, Root:(a,b=2)=> b%2 && a<0 ? -Math.pow(-a,1/b):Math.pow(a,1/b),
 Exp:Math.exp, Ln:Math.log, Log:(a,b=10)=>Math.log(a)/Math.log(b), Abs:Math.abs,
 Sin:Math.sin, Cos:Math.cos, Tan:Math.tan, Arcsin:Math.asin, Arccos:Math.acos, Arctan:Math.atan,
 Sinh:Math.sinh, Cosh:Math.cosh, Tanh:Math.tanh, Rational:(a,b)=>a/b
};
function compile(node, bindings=new Set(), allowX=true, variable='x') {
 if (typeof node==='number') return ()=>node;
 if (typeof node==='string') {
  if(bindings.has(node))return (x,scope)=>scope[node];
  if (node===variable) {if(!allowX)throw Error(`Sum/product bounds must be fixed finite integers or depend on an outer index, not ${variable}.`);return x=>x;}
  const constants={Pi:Math.PI,ExponentialE:Math.E,e:Math.E};
  if (node in constants) return ()=>constants[node];
  throw Error(`Unsupported symbol: ${node}. Only ${variable}, π, e and scoped sum/product indices are supported.`);
 }
 if (node && !Array.isArray(node) && 'num' in node) {
  const n=Number(node.num); if (Number.isFinite(n)) return ()=>n;
 }
 if (Array.isArray(node) && node[0]==='Delimiter') return compile(node[1],bindings,allowX,variable);
 if (Array.isArray(node) && ['Sum','Product'].includes(node[0])) {
  const range=node[2];
  if(node.length!==3 || !Array.isArray(range) || range[0]!=='Tuple' || range.length!==4 || typeof range[1]!=='string' || range[1]==='Nothing' || range.slice(2).some(v=>v==='Nothing'||v==='PositiveInfinity'||v==='NegativeInfinity'))throw Error('Sum/product requires an index and finite integer bounds, e.g. \\sum_{k=1}^{5} x^k. Infinite or unbounded series are unsupported.');
  const index=range[1],lo=compile(range[2],bindings,false,variable),hi=compile(range[3],bindings,false,variable);
  const body=compile(node[1],new Set([...bindings,index]),allowX,variable),product=node[0]==='Product';
  function bounds(x,scope,state={steps:0}){const start=lo(x,scope,state),end=hi(x,scope,state);if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end))throw Error('Sum/product bounds must evaluate to finite safe integers.');if(end-start+1>1000)throw Error('Use at most 1,000 terms in each sum/product.');return [start,end];}
  if(!bindings.size)bounds(0,Object.create(null));
  return (x,scope,state)=>{const [start,end]=bounds(x,scope,state);const local=Object.assign(Object.create(null),scope);let result=product?1:0;for(let i=start;i<=end;i++){if(++state.steps>10000)throw Error('Nested sums/products exceed 10,000 total terms per evaluation.');local[index]=i;const value=body(x,local,state);result=product?result*value:result+value;}return result;};
 }
 if (!Array.isArray(node) || !ops[node[0]]) throw Error(`Unsupported expression or function: ${Array.isArray(node)?node[0]:'invalid input'}.`);
 const args=node.slice(1).map(n=>compile(n,bindings,allowX,variable)), op=ops[node[0]];
 return (x,scope,state)=>op(...args.map(f=>f(x,scope,state)));
}
function stripMath(source){return source.trim().replace(/^\$\$?([\s\S]*?)\$\$?$/, '$1').replace(/^\\[([]([\s\S]*?)\\[)\]]$/, '$1');}
export function functionAxis(source,fallback='x'){const lhs=stripMath(source).match(/^([xy])\s*=/)?.[1];return lhs==='x'?'y':lhs==='y'?'x':fallback;}
export function setFunctionAxis(source,axis){return stripMath(source).replace(/^[xy]\s*=/,axis==='y'?'x =':'y =');}
export function hasMarkers(series){return series.type==='csv'||series.mode!=='curve';}
export function expression(source,variable=functionAxis(source)) {
 let latex=stripMath(source).replace(/^[xy]\s*=/,'');
 if (!latex) throw Error('Enter a LaTeX function.');
 const f=compile(syntax.parse(latex),new Set(),true,variable);
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
 let points,markers;const axis=series.type==='function'?functionAxis(series.formula,series.axis||'x'):'x';
 if(series.type==='csv') {
  points=[...series.points].sort((a,b)=>a[0]-b[0]);
  if(series.mode==='spline' && points.some((p,i)=>i && p[0]===points[i-1][0])) throw Error('Spline requires unique X values. Choose scatter or polyline for duplicate X values.');
  if(series.mode==='spline' && points.length<2) throw Error('Spline requires at least two points.');
  markers=points;
 } else {
  const f=expression(series.formula,axis), lo=Number(series.min),hi=Number(series.max);
  if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo>=hi) throw Error(`Function ${axis.toUpperCase()} min must be smaller than ${axis.toUpperCase()} max.`);
  points=Array.from({length:1601},(_,i)=>{const x=lo+(hi-lo)*i/1600;return [x,f(x)];});
  // Detect poles between samples; split paths instead of drawing a vertical bridge.
  for(let i=1;i<points.length;i++) {
   const a=points[i-1], b=points[i],mid=f((a[0]+b[0])/2);
   if(!Number.isFinite(mid) || (a[1]*b[1]<0 && Math.abs(a[1]-b[1])>100 && Math.abs(mid)>Math.max(Math.abs(a[1]),Math.abs(b[1])))) points.splice(i++,0,[(a[0]+b[0])/2,NaN]);
  }
  let xs=[];
  if(series.mode==='positions') {
   xs=numbers(series.positions); if(!xs.length) throw Error(`Enter marker ${axis.toUpperCase()} coordinates.`);
   if(xs.some(x=>x<lo||x>hi)) throw Error(`Marker coordinates must be inside the function ${axis.toUpperCase()} range.`);
  } else if(series.mode==='count') {
   const n=Number(series.count); if(!Number.isInteger(n)||n<1||n>10000) throw Error('Marker count must be an integer from 1 to 10,000.');
   xs=Array.from({length:n},(_,i)=>n===1?(lo+hi)/2:lo+(hi-lo)*i/(n-1));
  }
  markers=xs.map(x=>[x,f(x)]);
  if(markers.some(p=>!Number.isFinite(p[1]))) throw Error('The function is undefined at a requested marker coordinate.');
  if(axis==='y'){points=points.map(([t,v])=>[v,t]);markers=markers.map(([t,v])=>[v,t]);}
  if(!points.some(p=>p.every(Number.isFinite) && p[0]>=settings.xmin && p[0]<=settings.xmax)) throw Error('No real finite values in the displayed X range.');
 }
 return {...series,axis,points,markers};
}
