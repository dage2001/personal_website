const key=p=>p.x+','+p.y;
const on=(p,s)=>s.a.x===s.b.x?p.x===s.a.x&&p.y>=Math.min(s.a.y,s.b.y)&&p.y<=Math.max(s.a.y,s.b.y):p.y===s.a.y&&p.x>=Math.min(s.a.x,s.b.x)&&p.x<=Math.max(s.a.x,s.b.x);
export function decodeAsc(bytes){return new TextDecoder(bytes[0]===255&&bytes[1]===254?'utf-16le':'windows-1252').decode(bytes);}

/** Read emitted ASC/ASY, not the layout IR. LTspice joins pins/endpoints on
 * wires; two uninterrupted wire interiors crossing alone do not make a dot. */
export function readAsc(asc,files) {
  const wires=[],flags=[],symbols=[],directives=[];let current;
  for(const line of asc.split(/\r?\n/)){
    let m;if((m=/^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(line)))wires.push({a:{x:+m[1],y:+m[2]},b:{x:+m[3],y:+m[4]}});
    else if((m=/^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(line)))flags.push({x:+m[1],y:+m[2],name:m[3]});
    else if((m=/^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(line))){current={symbol:m[1],x:+m[2],y:+m[3],pins:[],value:'',ref:''};symbols.push(current);}
    else if((m=/^SYMATTR (InstName|Value) (.*)$/.exec(line))){if(!current)throw Error('ASC attribute without symbol.');current[m[1]==='InstName'?'ref':'value']=m[2];}
    else if((m=/^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(line)))directives.push(...m[1].split('\\n'));
  }
  for(const symbol of symbols){
    const bytes=files[symbol.symbol+'.asy'];if(!bytes)throw Error('Missing ASC companion '+symbol.symbol+'.asy');let pin;
    for(const line of decodeAsc(bytes).split(/\r?\n/)){let m;
      if((m=/^PIN (-?\d+) (-?\d+) /.exec(line))){pin={x:symbol.x+ +m[1],y:symbol.y+ +m[2]};symbol.pins.push(pin);}
      else if((m=/^PINATTR SpiceOrder (\d+)$/.exec(line)))pin.order=+m[1];
      else if((m=/^SYMATTR Prefix (\S+)$/.exec(line)))symbol.prefix=m[1];
    }
    symbol.pins.sort((a,b)=>a.order-b.order);
  }
  const points=new Map();for(const p of [...wires.flatMap(s=>[s.a,s.b]),...flags,...symbols.flatMap(s=>s.pins)])points.set(key(p),p);
  const parent=new Map([...points.keys()].map(k=>[k,k])),find=k=>{if(parent.get(k)!==k)parent.set(k,find(parent.get(k)));return parent.get(k);},join=(a,b)=>{parent.set(find(a),find(b));};
  for(const wire of wires){if(wire.a.x!==wire.b.x&&wire.a.y!==wire.b.y)throw Error('ASC contains a diagonal wire.');for(const [k,p]of points)if(on(p,wire))join(key(wire.a),k);}
  const names=new Map();for(const f of flags){const root=find(key(f));if(names.has(root)&&names.get(root).toLowerCase()!==f.name.toLowerCase())throw Error('ASC has a short between '+names.get(root)+' and '+f.name);names.set(root,f.name);}
  for(const s of symbols)for(const p of s.pins){p.node=names.get(find(key(p)));if(!p.node)throw Error('ASC has an unnamed/disconnected pin on '+s.ref);}
  const cards=symbols.map(s=>[s.ref,...s.pins.map(p=>p.node),s.value].join(' '));
  return {symbols,wires,flags,directives,netlist:['* Viewer ASC round trip',...cards,...directives,'.end'].join('\n')};
}

export function verifyAsc(asc,files,manifest) {
  const parsed=readAsc(asc,files),native=manifest.components.filter(c=>!c.directive);if(parsed.symbols.length!==native.length)throw Error('ASC lost or duplicated symbols.');let pins=0;
  for(const expected of native){const s=parsed.symbols.find(s=>s.ref===expected.ref);if(!s||s.value!==expected.value||s.prefix!==(expected.prefix||expected.kind)||JSON.stringify(s.pins.map(p=>p.node))!==JSON.stringify(expected.nodes))throw Error('ASC component/pin round-trip mismatch: '+expected.id);pins+=s.pins.length;}
  for(const expected of manifest.components.filter(c=>c.directive))if(!parsed.directives.includes(expected.line))throw Error('ASC lost directive device '+expected.id);
  return {verified:true,symbols:native.length,directiveDevices:manifest.components.length-native.length,pins,wires:parsed.wires.length,namedNets:new Set(parsed.flags.map(f=>f.name)).size};
}
