import {palette, csv, csvPoints, prepare, numbers} from './model.js';
import {render} from './render.js';
const $=id=>document.getElementById(`plot-${id}`);
let series=[],colors=[...palette],nextId=0,table=null,csvText='',current=null;
const defaults=['#f6a168','#65a583','#5d8bbf','#c091ab'];
function item(type,name,extra={}){return {id:++nextId,type,name,color:defaults[series.length%defaults.length],shape:'circle',mode:type==='csv'?'scatter':'count',positions:'2, 4, 6',count:13,min:0,max:10,...extra};}
function input(parent,label,value,change,type='text'){
 const l=document.createElement('label');l.textContent=label;const n=document.createElement('input');n.type=type;n.value=value;l.append(n);parent.append(l);n.addEventListener('input',()=>{change(n.value);update();});return n;
}
function select(parent,label,options,value,change){const l=document.createElement('label');l.textContent=label;const n=document.createElement('select');for(const [v,t] of options){const o=new Option(t,v);n.add(o);}n.value=value;l.append(n);parent.append(l);n.addEventListener('change',()=>{change(n.value);update();});return n;}
function seriesUI(){
 $('series').replaceChildren();
 for(const a of series){
  const d=document.createElement('details');d.className='plot-series-item';d.open=true;const title=document.createElement('summary');title.textContent=a.name;d.append(title);
  input(d,'Legend name',a.name,v=>{a.name=v;title.textContent=v;});
  if(a.type==='function'){input(d,'LaTeX expression',a.formula,v=>a.formula=v);const pair=document.createElement('div');pair.className='plot-pair';input(pair,'Function X min',a.min,v=>a.min=v,'number').step='any';input(pair,'Function X max',a.max,v=>a.max=v,'number').step='any';d.append(pair);}
  const modes=a.type==='csv'?[['scatter','Scatter only'],['linear','Scatter + polyline'],['spline','Scatter + spline']]:[['curve','Curve only'],['positions','Curve + specified X points'],['count','Curve + N points']];
  select(d,'Mode',modes,a.mode,v=>{a.mode=v;fields();});
  const positions=input(d,'Marker X coordinates',a.positions,v=>a.positions=v),count=input(d,'Marker count',a.count,v=>a.count=v,'number');count.min=1;count.max=10000;
  function fields(){positions.parentElement.hidden=a.type!=='function'||a.mode!=='positions';count.parentElement.hidden=a.type!=='function'||a.mode!=='count';}fields();
  select(d,'Palette color',[...new Set([a.color,...colors])].map(c=>[c,c]),a.color,v=>{a.color=v;color.value=v;});
  const color=input(d,'Custom color',a.color,v=>a.color=v,'color');
  select(d,'Marker shape',['circle','square','triangle','diamond','hexagon','star'].map(v=>[v,v]),a.shape,v=>a.shape=v);
  const error=document.createElement('p');error.className='plot-error';error.id=`plot-error-${a.id}`;d.append(error);
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove series';remove.onclick=()=>{series=series.filter(s=>s!==a);seriesUI();update();};d.append(remove);$('series').append(d);
 }
}
function settings(){
 const num=id=>{const v=Number($(id).value);if(!$(id).value.trim()||!Number.isFinite(v))throw Error(`Enter a finite ${id} value.`);return v;};
 const s={};for(const id of ['width','height','xmin','xmax','linewidth','markersize','baseline'])s[id]=num(id);
 if(s.width<320||s.width>2400||s.height<260||s.height>1800)throw Error('Figure size: width 320–2400 px, height 260–1800 px.');
 if(s.xmin>=s.xmax)throw Error('X min must be smaller than X max.');
 if(s.linewidth<.5||s.linewidth>10||s.markersize<2||s.markersize>24)throw Error('Line width: 0.5–10; marker size: 2–24.');
 for(const id of ['ymin','ymax'])s[id]=$(id).value.trim()?num(id):null;
 for(const id of ['xticks','yticks'])s[id]=numbers($(id).value,true);
 for(const id of ['title','caption','xlabel','ylabel'])s[id]=$(id).value;
 for(const id of ['shading','legend'])s[id]=$(id).checked;
 return s;
}
function update(){
 current=null;$('download').disabled=true;
 try{
  const s=settings();if(!series.length)throw Error('Add a function or CSV series to begin.');
  let bad=false;const data=series.map(a=>{const e=document.getElementById(`plot-error-${a.id}`);try{const p=prepare(a,s);e.textContent='';return p;}catch(err){e.textContent=err.message;bad=true;}});
  if(bad)throw Error('Correct the highlighted series before exporting.');
  current=render(data,s);$('preview').replaceChildren(current);$('download').disabled=false;$('status').dataset.error='false';$('status').textContent=`${series.length} series · ${s.width} × ${s.height} px`;
 }catch(e){$('status').dataset.error='true';$('status').textContent=e.message;$('preview').replaceChildren();}
}
function paletteUI(){ $('palette').replaceChildren(...colors.map(c=>{const n=document.createElement('span');n.style.background=c;n.title=c;return n;}));}
function demo(){series=[];for(const [name,color,shape,center,width] of [['Series A','#f6a168','circle',3,1.2],['Series B','#65a583','hexagon',5,1.3],['Series C','#5d8bbf','star',7,1.1]])series.push(item('function',name,{formula:`\\exp\\left(-\\frac{(x-${center})^2}{${width}}\\right)`,color,shape}));seriesUI();update();}
function importStatus(message){$('import-status').textContent=message;}
function columns(){
 try{
  table=csv(csvText,$('header').checked);const box=$('columns');box.hidden=false;box.replaceChildren();let x=0;
  select(box,'X column',table.labels.map((v,i)=>[String(i),v]),'0',v=>x=Number(v));
  const checks=table.labels.map((name,i)=>{const l=document.createElement('label');l.className='plot-check';const c=document.createElement('input');c.type='checkbox';c.checked=i===1;l.append(c,document.createTextNode(`Y: ${name}`));box.append(l);return c;});
  const b=document.createElement('button');b.textContent='Add selected columns';b.type='button';box.append(b);b.onclick=()=>{try{const added=[];let skipped=0;checks.forEach((c,i)=>{if(c.checked){if(i===x)throw Error('Choose different X and Y columns.');const result=csvPoints(table,x,i);skipped+=result.skipped;added.push(item('csv',table.labels[i],{points:result.points}));}});if(!added.length)throw Error('Select at least one Y column.');series.push(...added);seriesUI();update();importStatus(`Added ${added.length} series. ${skipped} empty pairs skipped. Lines use ascending X order.`);}catch(e){importStatus(e.message);}};
  importStatus(`Loaded ${table.rows.length} rows. Choose columns below.`);
 }catch(e){table=null;$('columns').hidden=true;importStatus(e.message);}
}
$('csv').onchange=async()=>{try{const file=$('csv').files[0];if(!file)return;if(file.size>5*1024*1024)throw Error('CSV file must be smaller than 5 MB.');csvText=await file.text();columns();}catch(e){importStatus(e.message);}};
$('header').onchange=()=>{if(csvText)columns();};
$('tex').onchange=async()=>{const file=$('tex').files[0];if(!file)return;if(file.size>20000){importStatus('Expression file must be smaller than 20 KB.');return;}$('expression').value=await file.text();importStatus('Expression loaded. Click Add function to plot it.');};
$('add-expression').onclick=()=>{series.push(item('function',`Function ${series.filter(a=>a.type==='function').length+1}`,{formula:$('expression').value,min:$('xmin').value,max:$('xmax').value}));seriesUI();update();};
$('demo').onclick=demo;
for(const id of ['width','height','xmin','xmax','ymin','ymax','xticks','yticks','xlabel','ylabel','title','caption','linewidth','markersize','shading','baseline','legend'])$(id).addEventListener('input',update);
$('apply-palette').onclick=()=>{const next=$('custom-palette').value.split(',').map(s=>s.trim());if(!next.length||next.length>90||next.some(c=>!/^#[\da-f]{6}$/i.test(c))){importStatus('Enter 1–90 colors in #RRGGBB format, separated by commas.');return;}colors=next;paletteUI();seriesUI();update();};
$('default-palette').onclick=()=>{colors=[...palette];paletteUI();seriesUI();update();};
$('download').onclick=()=>{if(!current)return;const source='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(current);const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='arbitrary-plot.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
paletteUI();demo();
