/** Structural matches, not operating-point or device-performance claims. */
export function recognizeTransistorMotifs(circuit,nodes={}) {
  const devices=new Map(circuit.components.map(c=>[c.name,c])),pins=new Map(),resistors=new Map(),active=[];
  const pair=(a,b)=>JSON.stringify([a,b].sort()),known=n=>nodes[n]?.potential!==null&&nodes[n]?.potential!==undefined;
  for(const c of circuit.components){
    for(const [pin,node]of Object.entries(c.terminals)){if(!pins.has(node))pins.set(node,[]);pins.get(node).push({device:c.name,pin});}
    if(c.kind==='R'){const ns=Object.values(c.terminals);if(ns.length===2&&ns[0]!==ns[1]){const key=pair(...ns);if(!resistors.has(key))resistors.set(key,[]);resistors.get(key).push(c);}}
    const family=c.kind==='Q'?'bjt':['M','J','Z'].includes(c.kind)?'fet':null;
    const polarity=family==='bjt'?/_(npn|pnp)$/.exec(c.type)?.[1]:/_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(c.type)?.[1];
    if(!family||!polarity)continue;
    const t=c.terminals,control=t[family==='bjt'?'B':'G'],drain=t[family==='bjt'?'C':'D'],source=t[family==='bjt'?'E':'S'];
    if([control,drain,source].some(n=>n===undefined)||control===source||drain===source)continue;
    active.push({id:c.name,family,polarity,control,drain,source,body:c.kind==='M'?t.B:undefined});
  }
  const motifs=[],seen=new Set(),emit=(kind,transistors,roles,nets,evidence,variant='basic',extra=[],confidence='high')=>{
    const members=[...new Set([...transistors,...extra])],key=JSON.stringify([kind,variant,[...members].sort()]);if(seen.has(key))return;seen.add(key);
    motifs.push({id:'motif'+motifs.length,kind,variant,transistors,members,roles,nets,evidence,confidence});
  },same=(a,b)=>a.family===b.family&&a.polarity===b.polarity;
  const controls=new Map(),sources=new Map(),drains=new Map(),activeById=new Map(active.map(a=>[a.id,a])),index=(map,key,a)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(a);},key=(a,node)=>JSON.stringify([a.family,a.polarity,node]);
  for(const a of active){index(controls,key(a,a.control),a);index(sources,key(a,a.source),a);if(a.family==='bjt'&&(pins.get(a.source)||[]).some(p=>{const b=activeById.get(p.device);return b&&b.family==='bjt'&&!same(a,b)&&b.source===a.source;}))index(drains,key(a,a.drain),a);}
  const resistiveReturns=a=>[{node:a.source,resistor:null},...(pins.get(a.source)||[]).flatMap(p=>{const r=devices.get(p.device);if(r.kind!=='R')return [];const far=Object.values(r.terminals).find(n=>n!==a.source);return far!==undefined&&far!==a.control&&far!==a.drain?[{node:far,resistor:r.name}]:[];})];
  for(const a of active)if(a.control===a.drain)emit('diode-connected',[a.id],{reference:a.id},{control:a.control,return:a.source},['control-drain-short',a.family]);
  for(const ref of active){
    const peers=controls.get(key(ref,ref.control));if(peers.filter(a=>a.control===a.drain).length>1)continue;
    let helper=null;
    if(ref.control!==ref.drain&&ref.family==='bjt')helper=(controls.get(key(ref,ref.drain))||[]).find(h=>h.id!==ref.id&&same(h,ref)&&h.control===ref.drain&&h.source===ref.control&&known(h.drain));
    if(ref.control!==ref.drain&&!helper)continue;
    const returns=resistiveReturns(ref),outputs=[];let common=null,extra=[];
    for(const out of peers){if(out.id===ref.id||out.id===helper?.id||out.drain===ref.drain||out.drain===out.control)continue;
      const match=returns.flatMap(a=>resistiveReturns(out).filter(b=>a.node===b.node).map(b=>({node:a.node,rs:[a.resistor,b.resistor].filter(Boolean)}))).find(m=>common===null||m.node===common);if(!match)continue;
      common=match.node;outputs.push(out.id);extra.push(...match.rs);
    }
    if(outputs.length){const bodies=outputs.every(id=>activeById.get(id).body===ref.body);emit('current-mirror',[ref.id,...outputs,...helper?[helper.id]:[]],{reference:ref.id,outputs,...helper?{helper:helper.id}:{}},{control:ref.control,return:common},['same-polarity','shared-control',helper?'emitter-follower-reference':'diode-reference',extra.length?'resistive-common-return':'shared-return',bodies?'compatible-bodies':'different-body-connections'],helper?'assisted':extra.length?'degenerated':'basic',[...extra,...helper?[helper.id]:[]],bodies?'high':'medium');}
  }
  const pairs=[],pairIds=new Set(),addPair=(a,b)=>{const k=JSON.stringify([a.id,b.id].sort());if(!pairIds.has(k)){pairIds.add(k);pairs.push([a,b]);}};
  for(const group of sources.values())if(!known(group[0].source)){
    const inputs=group.filter(a=>a.control!==a.drain);
    if(inputs.length===2)addPair(...inputs);
    else if(inputs.length>2&&new Set(inputs.map(a=>a.control)).size>1)emit('differential-pair',inputs.map(a=>a.id),{inputs:inputs.map(a=>a.id)},{tail:inputs[0].source},['shared-tail','multi-input-tail'],'multi-input',[],'medium');
  }
  for(const group of drains.values())for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++)addPair(group[i],group[j]);
  for(const [a,b]of pairs){
    if(a.control===b.control||a.control===a.drain||b.control===b.drain)continue;
    if(a.source===b.source&&a.drain!==b.drain&&!known(a.source)){
      const support=(pins.get(a.source)||[]).some(p=>p.device!==a.id&&p.device!==b.id);
      const two=sources.get(key(a,a.source)).length===2;
      emit('differential-pair',[a.id,b.id],{inputs:[a.id,b.id]},{tail:a.source},['same-polarity','distinct-controls','shared-tail',support?'tail-bias-connection':'unbiased-tail',two?'two-input-tail':'multi-input-tail'],'basic',[],support&&two&&a.body===b.body?'high':'medium');
    }
    if(a.family!=='bjt'||a.drain!==b.drain||a.source===b.source)continue;
    const lowerA=active.filter(q=>q.family==='bjt'&&q.polarity!==a.polarity&&q.source===a.source),lowerB=active.filter(q=>q.family==='bjt'&&q.polarity!==a.polarity&&q.source===b.source);
    for(const c of lowerA)for(const d of lowerB)if(c.id!==d.id&&c.control===d.control&&c.drain!==d.drain&&c.control!==c.drain&&d.control!==d.drain)emit('differential-pair',[a.id,b.id,c.id,d.id],{inputs:[a.id,b.id],commonBase:[c.id,d.id]},{inputCollectors:a.drain,bias:c.control},['same-polarity-inputs','distinct-controls','complementary-emitter-pairs','shared-common-base'],'complementary-common-base');
  }
  for(const a of active)if(a.family==='bjt'&&a.control!==a.drain){
    const upper=resistors.get(pair(a.drain,a.control))||[],lower=resistors.get(pair(a.control,a.source))||[];
    if(upper.length===1&&lower.length===1)emit('vbe-multiplier',[a.id],{transistor:a.id,collectorResistor:upper[0].name,emitterResistor:lower[0].name},{control:a.control,collector:a.drain,emitter:a.source},['collector-base-resistor','base-emitter-resistor'],'basic',[upper[0].name,lower[0].name]);
  }
  return motifs;
}

/** Adapter remaps references explicitly; instance names and node names never leak into cache keys. */
export function mapTransistorMotifs(motifs,mapDevice,mapNode=x=>x) {
  const role=value=>Array.isArray(value)?value.map(mapDevice):mapDevice(value);
  return motifs.map(m=>({...m,members:m.members.map(mapDevice),transistors:m.transistors.map(mapDevice),roles:Object.fromEntries(Object.entries(m.roles).map(([k,v])=>[k,role(v)])),nets:Object.fromEntries(Object.entries(m.nets).map(([k,v])=>[k,mapNode(v)]))}));
}

/** Explicit declarations validate only the named small structures. No whole-sheet
 * differential candidate search runs when a sheet supplies pair declarations. */
export function declaredTransistorMotifs(circuit,nodes,pairs) {
  const output=[],seen=new Set(),devices=new Map(circuit.components.map(c=>[c.name,c]));
  for(const pair of pairs){
    if(new Set(pair.members).size!==pair.members.length)throw Error('Duplicate @layout pair member.');
    const members=pair.members.map(id=>devices.get(id));if(members.some(c=>!c))throw Error('Unknown @layout pair device.');
    const kind={mirror:'current-mirror',differential:'differential-pair',vbe:'vbe-multiplier'}[pair.kind];
    // Preserve tail-bias evidence for a declared basic differential pair.
    const extra=pair.kind==='differential'&&members.length===2?circuit.components.filter(c=>!pair.members.includes(c.name)&&Object.values(c.terminals).includes(members[0].terminals.E??members[0].terminals.S)):[];
    const matches=recognizeTransistorMotifs({...circuit,components:[...members,...extra]},nodes),match=matches.find(m=>m.kind===kind&&m.confidence==='high'&&pair.members.every(id=>m.members.includes(id)));
    if(!match)throw Error('Invalid @layout pair '+pair.kind+' { '+pair.members.join(' ')+' }: electrical structure does not match.');
    for(const m of matches.filter(m=>m===match||m.kind==='diode-connected'&&m.members.every(id=>match.members.includes(id)))){const key=JSON.stringify([m.kind,[...m.members].sort()]);if(seen.has(key))continue;seen.add(key);output.push({...m,id:'motif'+output.length,origin:'annotation'});}
  }
  return output;
}
