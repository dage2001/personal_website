import {zipSync,strToU8} from 'fflate';
import {simplifyNetGeometry} from './net-geometry.js';
import {compileAscNetlist} from './asc-netlist.js';
import {verifyAsc} from './asc-verify.js';
const key=p=>p.x+','+p.y,round=n=>Math.round(n*1000)/1000;
const cp1252=new Map(Array.from({length:256},(_,i)=>[new TextDecoder('windows-1252').decode(new Uint8Array([i])),i]));
export function ltspiceBytes(text){const result=[];for(const c of text){const byte=cp1252.get(c);if(byte===undefined)throw Error('LTspice export cannot encode '+c+' (U+'+c.codePointAt(0).toString(16)+') in Windows-1252.');result.push(byte);}return new Uint8Array(result);}
const annotation=text=>[...String(text)].map(c=>cp1252.has(c)?c:c==='⏚'?'GND':'[U+'+c.codePointAt(0).toString(16)+']').join('');
const safe=s=>String(s).replace(/[\r\n]/g,' ');

// An order-preserving map, rather than independent rounding, prevents two
// distinct ELK tracks/pins collapsing onto the same LTspice grid coordinate.
function axis(values){const sorted=[...new Set(values.map(round))].sort((a,b)=>a-b),map=new Map();let previous=-Infinity;for(const v of sorted){const n=Math.max(previous+16,Math.round(v*2/16)*16+64);map.set(v,n);previous=n;}return v=>{const n=map.get(round(v));if(n===undefined)throw Error('Missing layout coordinate.');return n;};}

function symbol(node,component,card,xy) {
  const ox=xy.x(node.x),oy=xy.y(node.y),w=xy.x(node.x+node.width)-ox,h=xy.y(node.y+node.height)-oy;
  const pins=node.ports.map(p=>({...p,x:xy.x(p.x)-ox,y:xy.y(p.y)-oy})),lines=['Version 4','SymbolType CELL'];
  const line=(a,b)=>lines.push(`LINE Normal ${Math.round(a.x)} ${Math.round(a.y)} ${Math.round(b.x)} ${Math.round(b.y)}`);
  const two=pins.length===2&&['R','C','L','D','V','I','B'].includes(component.kind);
  if(two){
    const [a,b]=pins,vertical=Math.abs(a.x-b.x)<.1,c={x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance=Math.abs(vertical?b.y-a.y:b.x-a.x),d=Math.min(32,distance/4),t=Math.sign(vertical?b.y-a.y:b.x-a.x);
    const p=(u,v)=>vertical?{x:c.x+v,y:c.y+u*t}:{x:c.x+u*t,y:c.y+v};
    line(a,p(-d,0));line(p(d,0),b);
    if(component.kind==='C'){line(p(-6,-20),p(-6,20));line(p(6,-20),p(6,20));line(p(-d,0),p(-6,0));line(p(6,0),p(d,0));}
    else if(['R','L'].includes(component.kind)){const vs=[[-d,0],[-d+6,0],[-d+12,-12],[-d+22,12],[-d+32,-12],[d-6,0],[d,0]];for(let i=1;i<vs.length;i++)line(p(...vs[i-1]),p(...vs[i]));}
    else if(component.kind==='D'){line(p(-d,0),p(-12,0));line(p(12,0),p(d,0));line(p(-12,-18),p(-12,18));line(p(-12,18),p(12,0));line(p(12,0),p(-12,-18));line(p(12,-18),p(12,18));}
    else {lines.push(`CIRCLE Normal ${Math.round(c.x-24)} ${Math.round(c.y-24)} ${Math.round(c.x+24)} ${Math.round(c.y+24)}`);line(p(-d,0),p(-24,0));line(p(24,0),p(d,0));line(p(-12,-6),p(-12,6));line(p(-18,0),p(-6,0));line(p(12,-6),p(12,6));}
  }else{
    const inset=16;lines.push(`RECTANGLE Normal ${inset} ${inset} ${Math.max(inset+16,w-inset)} ${Math.max(inset+16,h-inset)}`);
    for(const p of pins){const q={x:Math.max(inset,Math.min(w-inset,p.x)),y:Math.max(inset,Math.min(h-inset,p.y))};line(p,q);lines.push(`TEXT ${Math.round(q.x+4)} ${Math.round(q.y+4)} Left 1 ${safe(annotation(component.block?.ports.find(a=>a.pin===p.pin)?.label||component.pinLabels?.[Object.keys(component.terminals).indexOf(p.pin)]||p.pin))}`);}
  }
  if(two&&Math.abs(pins[0].x-pins[1].x)<.1)lines.push(`WINDOW 0 ${Math.round(pins[0].x+40)} 24 Left 2`,`WINDOW 3 ${Math.round(pins[0].x+40)} 56 Left 2`);
  else if(two)lines.push(`WINDOW 0 ${Math.round(w/2)} 16 Center 2`,`WINDOW 3 ${Math.round(w/2)} 40 Center 2`);
  else lines.push('WINDOW 0 24 32 Left 2','WINDOW 3 24 64 Left 2');
  lines.push('SYMATTR Prefix '+(card.prefix||card.kind));
  for(const [i,pin]of card.pins.entries()){const p=pins.find(p=>p.pin===pin);if(!p)throw Error('ASC symbol missing pin '+component.name+'.'+pin);lines.push(`PIN ${p.x} ${p.y} NONE 0`,'PINATTR PinName '+safe(pin),'PINATTR SpiceOrder '+(i+1));}
  return lines.join('\r\n')+'\r\n';
}

/** No parsing, layout or network requests here. Generate only on download. */
export function exportAsc({tree,circuit,drawing,source='',libraries={}}) {
  if(!drawing)throw Error('ASC export requires a conventional layout. Enable Circuit layout rules and generate again.');
  const compiled=compileAscNetlist(tree,circuit),components=new Map(circuit.components.map(c=>[c.name,c]));
  if(drawing.components.length!==components.size||drawing.components.some(n=>!components.has(n.id)||n.ports.some(p=>circuit.nodes[components.get(n.id).terminals[p.pin]]?.bit!==p.bit)))throw Error('ASC: stale layout or mismatched pin/net mapping. Generate again.');
  const xs=[],ys=[],add=p=>{xs.push(p.x);ys.push(p.y);};
  for(const n of drawing.components){add(n);add({x:n.x+n.width,y:n.y+n.height});n.ports.forEach(add);}drawing.segments.forEach(s=>{add(s.a);add(s.b);});
  const xy={x:axis(xs),y:axis(ys)},point=p=>({x:xy.x(p.x),y:xy.y(p.y)}),byNet=new Map(),terminals=new Map();
  for(const n of drawing.components)for(const p of n.ports){if(!terminals.has(p.bit))terminals.set(p.bit,[]);terminals.get(p.bit).push(p);}
  for(const s of drawing.segments){if(!byNet.has(s.bit))byNet.set(s.bit,[]);byNet.get(s.bit).push(s);}
  const wires=[];for(const [bit,ps]of terminals){const result=simplifyNetGeometry(byNet.get(bit)||[],ps);for(const s of result.segments)wires.push({bit,a:point(s.a),b:point(s.b)});}
  const maxX=Math.max(...xs.map(xy.x)),maxY=Math.max(...ys.map(xy.y)),lines=['Version 4',`SHEET 1 ${maxX+256} ${maxY+512}`],flags=new Map(),files={},manifest={version:1,focus:circuit.focus,topology:circuit.topology.signature,components:[],nodes:[],warnings:compiled.warnings};
  const label=(p,name)=>{const k=key(p);if(flags.has(k)&&flags.get(k)!==name)throw Error('ASC grid would short two nets at '+k);flags.set(k,name);};
  // Flags at terminals preserve net identity for POLY control glyphs and sheet
  // ports, and make naming deterministic on an LTspice netlist round trip.
  const named=new Set();for(const n of drawing.components){const c=components.get(n.id);if(!c)throw Error('Layout snapshot no longer matches circuit.');for(const p of n.ports){const name=compiled.node(c.terminals[p.pin]);if(!named.has(name)){label(point(p),name);named.add(name);}}}
  for(const wire of wires)lines.push(`WIRE ${wire.a.x} ${wire.a.y} ${wire.b.x} ${wire.b.y}`);
  for(const [position,name]of flags)lines.push('FLAG '+position.replace(',',' ')+' '+name);
  let index=0;const symbolCache=new Map();
  for(const n of drawing.components){
    const c=components.get(n.id);if(c.synthetic)continue;const card=compiled.cards.get(c.name);
    if(card.directive){lines.push(`TEXT ${xy.x(n.x)} ${xy.y(n.y)} Left 2 !${safe(card.line)}`);manifest.components.push({id:c.name,...card,directive:true});continue;}
    const asy=symbol(n,c,card,xy);let file=symbolCache.get(asy);if(!file){file='cv_symbol_'+index++;symbolCache.set(asy,file);files[file+'.asy']=ltspiceBytes(asy);}
    lines.push(`SYMBOL ${file} ${xy.x(n.x)} ${xy.y(n.y)} R0`,'SYMATTR InstName '+card.ref,'SYMATTR Value '+safe(card.value));
    manifest.components.push({id:c.name,...card,symbol:file,ports:n.ports.map(p=>({pin:p.pin,...point(p),node:compiled.node(c.terminals[p.pin])}))});
  }
  const directives=[...compiled.directives,...compiled.library];
  if(directives.some(s=>s.includes('\\n')))throw Error('ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.');
  // Retain source/model notices in the standalone ASC as SPICE comments too.
  const comments=[source,...Object.values(libraries)].flatMap(text=>text.split(/\r?\n/).filter(l=>/^\s*\*/.test(l))).map(s=>annotation(s).replaceAll('\\','/'));
  if(directives.length||comments.length)lines.push(`TEXT 64 ${maxY+160} Left 2 !`+[...directives,...comments].map(s=>s.replace(/\r?\n/g,'\\n')).join('\\n'));
  const asc=lines.join('\r\n')+'\r\n';
  manifest.nodes=[...compiled.nodeNames].map(([original,exported])=>({original,exported}));
  manifest.leaves=[...compiled.expected,...circuit.components.filter(c=>!c.synthetic&&c.kind!=='X').map(c=>({original:c.name,scope:'',...compiled.cards.get(c.name)}))];
  manifest.blocks=[...compiled.blockRefs].map(([original,ref])=>({original,ref,ltspiceRef:'X§'+ref}));
  const audit=verifyAsc(asc,files,manifest);manifest.audit=audit;
  files['spice-schematic.asc']=ltspiceBytes(asc);files['manifest.json']=strToU8(JSON.stringify(manifest,null,2));
  files['source.cir']=strToU8(source);for(const [name,text]of Object.entries(libraries)){const base=name.replaceAll('\\','/').split('/').filter(p=>p&&p!=='.'&&p!=='..').join('/');if(base)files['source-libraries/'+base]=strToU8(text);}
  files['README.txt']=strToU8('Extract ALL files into one folder, then open spice-schematic.asc in LTspice.\nThe .asy files are locally generated symbols and are required by the ASC.\nPositions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.\nmanifest.json contains original/exported names, values, ports and the connectivity audit.\nCollapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.\nsource.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.\nSimulation behavior depends on LTspice model support; connectivity validation is not a simulation result.\n'+compiled.warnings.join('\n'));
  return {asc,ascBytes:files['spice-schematic.asc'],zip:zipSync(files,{level:6}),files,manifest};
}
