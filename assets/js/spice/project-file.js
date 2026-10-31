import {RoutingScene} from './routing-model.js';
import {layoutRulesVersion} from './layout-semantics.js';

export const projectFormat='spice-viewer-project';
export const projectVersion=1;
export const maxProjectBytes=32*1024*1024;
const fail=message=>{throw Error('Invalid project: '+message);};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const number=v=>Number.isFinite(v)&&Math.abs(v)<=1000000;
const point=p=>object(p)&&number(p.x)&&number(p.y);
const equal=(a,b)=>Math.abs(a-b)<.001;
export const sheetKey=(scope,topology,s)=>JSON.stringify([scope,topology,{font:s.font,fontSize:s.fontSize,color:s.color,gridSize:s.gridSize,detailed:s.detailed,conventional:s.conventional}]);
export function validView(v){return object(v)&&point(v)&&number(v.w)&&number(v.h)&&v.w>0&&v.h>0;}
export function validateSettings(s){
  if(!object(s)||!['Arial','Helvetica','Times New Roman','monospace'].includes(s.font)||!Number.isInteger(s.fontSize)||s.fontSize<8||s.fontSize>24||![0,4].includes(s.gridSize)||typeof s.detailed!=='boolean'||typeof s.conventional!=='boolean'||s.color!=='#292b29')fail('unsupported drawing settings.');
}
export function decodeProject(text){
  if(new TextEncoder().encode(text).length>maxProjectBytes)fail('file exceeds 32 MB.');
  let p;try{p=JSON.parse(text);}catch{fail('expected a JSON project file.');}
  if(!object(p)||p.format!==projectFormat)fail('unrecognized file format.');
  if(p.version!==projectVersion)fail('unsupported project version '+p.version+'.');
  if(p.layoutRulesVersion!==layoutRulesVersion)fail('layout version differs; this project requires layout rules v'+p.layoutRulesVersion+'.');
  if(typeof p.source!=='string'||p.source.length>2000000||typeof p.focus!=='string')fail('missing netlist or sheet.');
  if(!object(p.libraries)||Object.entries(p.libraries).some(([name,text])=>!name||['__proto__','constructor','prototype'].includes(name)||typeof text!=='string'))fail('invalid libraries.');
  validateSettings(p.settings);
  if(![4,8,16].includes(p.displayGridStep)||['showGrid','interactive','flywire'].some(k=>typeof p[k]!=='boolean')||!validView(p.view))fail('invalid display settings.');
  if(!object(p.colors)||typeof p.colors.sourceId!=='string'||typeof p.colors.auto!=='boolean'||['manual','assigned'].some(k=>!Array.isArray(p.colors[k])||p.colors[k].some(a=>!Array.isArray(a)||a.length!==2||typeof a[0]!=='string'||!/^#[\da-f]{6}$/i.test(a[1]))))fail('invalid node colors.');
  if(!Array.isArray(p.sheets)||p.sheets.length>1000)fail('invalid saved sheets.');
  const keys=new Set();
  for(const s of p.sheets){
    if(!object(s)||typeof s.scope!=='string'||typeof s.topology!=='string')fail('invalid sheet identity.');
    validateSettings(s.settings);const key=sheetKey(s.scope,s.topology,s.settings);if(keys.has(key))fail('duplicate sheet.');keys.add(key);
    if(s.settings.gridSize!==4||!s.settings.conventional)fail('saved manual scenes require the fixed 4-unit grid.');
    if(s.view!==undefined&&!validView(s.view))fail('invalid sheet viewport.');
    validateSnapshot(s.snapshot);
  }
  return p;
}
export function encodeProject(data){
  const p={...data,format:projectFormat,version:projectVersion,layoutRulesVersion,createdAt:new Date().toISOString()};
  const text=JSON.stringify(p,null,2);decodeProject(text);return text;
}
export function validateSnapshot(s){
  if(!object(s)||!Array.isArray(s.components)||!Array.isArray(s.segments)||s.components.length>10000||s.segments.length>50000)fail('invalid scene size.');
  const ids=new Set();
  for(const n of s.components){
    if(!object(n)||typeof n.id!=='string'||ids.has(n.id)||!point(n)||!number(n.width)||!number(n.height)||n.width<0||n.height<0||!Array.isArray(n.ports)||n.ports.length>2000)fail('invalid component geometry.');ids.add(n.id);
    const pins=new Set();for(const p of n.ports){if(!point(p)||typeof p.pin!=='string'||pins.has(p.pin)||!Number.isInteger(p.bit)||!['NORTH','SOUTH','EAST','WEST'].includes(p.side))fail('invalid pin.');pins.add(p.pin);}
    if(n.editorMatrix!==undefined&&(!Array.isArray(n.editorMatrix)||n.editorMatrix.length!==6||!n.editorMatrix.every(number)))fail('invalid symbol transform.');
  }
  for(const w of s.segments)if(!object(w)||!Number.isInteger(w.bit)||!point(w.a)||!point(w.b)||!equal(w.a.x,w.b.x)&&!equal(w.a.y,w.b.y))fail('wire must be orthogonal.');
}
/** Accept only placements of the freshly generated symbols, with identical pin/net identity. */
export function restoreProjectScene(base,snapshot,step){
  validateSnapshot(snapshot);
  const previous=new Map(base.components.map(n=>[n.id,n]));
  if(previous.size!==snapshot.components.length)fail('component count changed.');
  const components=snapshot.components.map(n=>{
    const b=previous.get(n.id);if(!b||!!b.decoration!==!!n.decoration||b.ports.length!==n.ports.length)fail('component identity changed: '+n.id);
    const m=n.editorMatrix||[1,0,0,1,0,0], [a,c,d,e]=m;
    if(![a,c,d,e].every(v=>[-1,0,1].includes(v))||a*a+c*c!==1||d*d+e*e!==1||a*d+c*e!==0)fail('symbol transform must be a rotation or mirror.');
    const corners=[[0,0],[b.width,0],[0,b.height],[b.width,b.height]].map(([x,y])=>({x:a*x+d*y+m[4],y:c*x+e*y+m[5]}));
    if(!equal(Math.min(...corners.map(p=>p.x)),0)||!equal(Math.min(...corners.map(p=>p.y)),0)||!equal(Math.max(...corners.map(p=>p.x)),n.width)||!equal(Math.max(...corners.map(p=>p.y)),n.height))fail('symbol dimensions changed: '+n.id);
    const ports=n.ports.map(p=>{const q=b.ports.find(q=>q.pin===p.pin);if(!q||q.bit!==p.bit||!equal(p.x,n.x+a*(q.x-b.x)+d*(q.y-b.y)+m[4])||!equal(p.y,n.y+c*(q.x-b.x)+e*(q.y-b.y)+m[5]))fail('pin connectivity or position changed: '+n.id+'.'+p.pin);
      const v={NORTH:[0,-1],SOUTH:[0,1],EAST:[1,0],WEST:[-1,0]}[q.side],side=Object.entries({NORTH:[0,-1],SOUTH:[0,1],EAST:[1,0],WEST:[-1,0]}).find(([,v2])=>v2[0]===a*v[0]+d*v[1]&&v2[1]===c*v[0]+e*v[1])?.[0];if(p.side!==side)fail('pin direction changed.');
      return {...q,x:p.x,y:p.y,side};});
    return {...b,x:n.x,y:n.y,width:n.width,height:n.height,ports,...(n.editorMatrix?{editorMatrix:[...m]}:{})};
  });
  const scene=new RoutingScene({...base,components,segments:snapshot.segments},{step});
  for(let i=0;i<components.length;i++)for(let j=i+1;j<components.length;j++){const a=components[i],b=components[j];if(a.x<b.x+b.width-.001&&a.x+a.width>b.x+.001&&a.y<b.y+b.height-.001&&a.y+a.height>b.y+.001)fail('component symbols overlap.');}
  const bits=new Set(scene.pins().map(p=>p.bit));
  if(scene.pins().some(p=>!scene.onGrid(p))||scene.segments.some(w=>!bits.has(w.bit)||!scene.validSegment(w,w.bit)))fail('off-grid wire, symbol collision or short circuit.');
  const positions=new Map();for(const p of scene.pins()){const key=p.x+','+p.y;if(positions.has(key)&&positions.get(key)!==p.bit)fail('different nodes share a pin position.');positions.set(key,p.bit);}
  return scene.snapshot();
}
