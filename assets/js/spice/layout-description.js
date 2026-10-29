/** Small, declarative comment language. It never creates electrical edges. */
export function scopedLayoutDescriptions(source) {
  const root=[],locals=new Map(),stack=[0],diagnostics=[];
  source.split(/\r?\n/).forEach((raw,i)=>{
    const text=raw.trim();
    if(/^\.subckt\b/i.test(text)){stack.push(i+1);locals.set(i+1,[]);}
    if(stack.at(-1))locals.get(stack.at(-1)).push({raw,line:i+1});else root[i]=raw;
    if(/^\.ends\b/i.test(text)&&stack.length>1)stack.pop();
  });
  const top=parseLayoutDescription(Array.from({length:source.split(/\r?\n/).length},(_,i)=>root[i]||'').join('\n'));
  diagnostics.push(...top.diagnostics);const scopes=new Map();
  for(const [line,comments]of locals){const parsed=parseLayoutDescription(comments.map(c=>c.raw).join('\n'));scopes.set(line,parsed.layout);diagnostics.push(...parsed.diagnostics.map(d=>({...d,line:comments[d.line-1]?.line||line})));}
  return {layout:top.layout,scopes,diagnostics};
}

export function parseLayoutDescription(source) {
  const diagnostics=[],body=[];let open=false,found=false,start=0;
  source.split(/\r?\n/).forEach((raw,i)=>{
    const text=raw.trim();
    if(/^\*\s*@layout\s+begin\b/i.test(text)) {
      if(found||open)diagnostics.push({severity:'error',line:i+1,message:'Only one @layout block is allowed.'});
      if(!/^\*\s*@layout\s+begin\s+v1\s*$/i.test(text))diagnostics.push({severity:'error',line:i+1,message:'Expected @layout begin v1.'});
      found=true;open=true;start=i+1;return;
    }
    if(/^\*\s*@layout\s+end\s*$/i.test(text)){if(!open)diagnostics.push({severity:'error',line:i+1,message:'Unexpected @layout end.'});open=false;return;}
    if(open){if(!text.startsWith('*'))diagnostics.push({severity:'error',line:i+1,message:'Every @layout line must be a SPICE * comment.'});else body.push(text.slice(1).trim());}
  });
  if(open)diagnostics.push({severity:'error',line:start,message:'Unclosed @layout block.'});
  if(!found)return {layout:null,diagnostics};
  const text=body.join(' '),tokens=text.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g)||[],groups=[],relations=[],pairs=[],faces=[];let pos=0,anonymous=0,priorityCap=10;
  const take=()=>tokens[pos++],name=()=>{const n=take();if(!n||!/^[A-Za-z_@][\w./%:@-]*$/.test(n))throw Error('Expected layout identifier, got '+n);return n;};
  function group(named) {
    if(groups.length>=256)throw Error('Layout description exceeds 256 groups.');
    const id=named?name():'@row'+anonymous++,direction=take();
    if(!['row','column','classic'].includes(direction))throw Error('Expected row, column or classic.');
    if(take()!=='{')throw Error('Expected { after '+direction);
    const result={id,direction,members:[]};groups.push(result);
    while(pos<tokens.length&&tokens[pos]!=='}') {
      if(tokens[pos]==='group'){take();result.members.push(group(true));}
      else if(['row','column'].includes(tokens[pos]))result.members.push(group(false));
      else result.members.push(name());
    }
    if(take()!=='}')throw Error('Unclosed group '+id);
    if(!result.members.length)throw Error('Empty layout group '+id);
    return id;
  }
  try {
    while(pos<tokens.length) {
      if(tokens[pos]==='group'){take();group(true);}
      else if(['row','column'].includes(tokens[pos]))group(false);
      else if(tokens[pos]==='face'){take();const device=name(),side=take();if(!['left','right'].includes(side))throw Error('Expected face left or right.');if(faces.some(f=>f.device.toLowerCase()===device.toLowerCase()))throw Error('Duplicate face device.');faces.push({device,side});}
      else if(tokens[pos]==='pair'){take();const kind=take();if(!['mirror','differential','vbe'].includes(kind))throw Error('Expected pair mirror, differential or vbe.');if(take()!=='{')throw Error('Expected { after pair kind.');const members=[];while(pos<tokens.length&&tokens[pos]!=='}')members.push(name());if(take()!=='}'||!members.length)throw Error('Empty or unclosed pair.');if(pairs.length>=256)throw Error('Layout description exceeds 256 pairs.');pairs.push({kind,members});}
      else if(tokens[pos]==='priority-cap'){take();priorityCap=Number(take());if(!Number.isInteger(priorityCap)||priorityCap<3||priorityCap>64)throw Error('priority-cap must be an integer from 3 to 64.');}
      else if(take()==='place'){const a=name(),relation=take(),b=name();if(!['left-of','above'].includes(relation))throw Error('Expected left-of or above.');relations.push({a,relation,b});}
      else throw Error('Unknown layout instruction near '+tokens[pos-1]);
    }
    const ids=new Set();for(const g of groups){const id=g.id.toLowerCase();if(ids.has(id))throw Error('Duplicate layout group '+g.id);ids.add(id);}
    const active=new Set(),done=new Set(),map=new Map(groups.map(g=>[g.id.toLowerCase(),g]));
    const visit=id=>{if(active.has(id))throw Error('Circular layout group '+id);if(done.has(id))return;active.add(id);for(const m of map.get(id).members)if(map.has(m.toLowerCase()))visit(m.toLowerCase());active.delete(id);done.add(id);};
    for(const id of map.keys())visit(id);
    const rel=new Map();for(const r of relations){if(r.a.toLowerCase()===r.b.toLowerCase())throw Error('Self-relative layout constraint.');if(!rel.has(r.a.toLowerCase()))rel.set(r.a.toLowerCase(),[]);rel.get(r.a.toLowerCase()).push(r.b.toLowerCase());}
    active.clear();done.clear();const check=id=>{if(active.has(id))throw Error('Circular place constraints.');if(done.has(id))return;active.add(id);for(const b of rel.get(id)||[])check(b);active.delete(id);done.add(id);};for(const id of rel.keys())check(id);
  }catch(error){diagnostics.push({severity:'error',line:start,message:'Layout description: '+error.message});}
  return {layout:{version:1,priorityCap,groups,relations,pairs,faces},diagnostics};
}

/** Resolve physical instances once; expanded leaves keep their visual ownership. */
export function bindLayoutDescription(tree,circuit) {
  // A definition may describe its own sheet; ancestor constraints never leak in.
  const local=circuit.focus?tree.ir.scopes[tree.contexts[circuit.focus].scopeId].layoutDescription:null;
  let description=circuit.focus?local:tree.ir.layoutDescription;if(!description)return null;
  if(local){const groups=new Set(local.groups.map(g=>g.id.toLowerCase())),resolve=name=>{
    if(groups.has(name.toLowerCase()))return name;
    const port=circuit.components.find(c=>c.synthetic&&c.value.toLowerCase()===name.toLowerCase());return port?.name||circuit.focus+'/'+name;
  };description={...local,groups:local.groups.map(g=>({...g,members:g.members.map(resolve)})),relations:local.relations.map(r=>({...r,a:resolve(r.a),b:resolve(r.b)})),faces:(local.faces||[]).map(f=>({...f,device:resolve(f.device)})),pairs:(local.pairs||[]).map(p=>({...p,members:p.members.map(resolve)}))};}
  const groups=new Map(description.groups.map(g=>[g.id.toLowerCase(),g])),allDevices=Object.values(tree.contexts).flatMap(c=>c.devices.map(d=>d.name));
  const known=new Set([...Object.keys(tree.contexts),...allDevices,...circuit.components.map(c=>c.name)].map(n=>n.toLowerCase()));
  for(const g of groups.values())if(known.has((local?circuit.focus+'/'+g.id:g.id).toLowerCase()))throw Error('Layout group name conflicts with a circuit instance/device: '+g.id);
  for(const g of groups.values())for(const member of g.members)if(!groups.has(member.toLowerCase())&&!known.has(member.toLowerCase()))throw Error('Unknown @layout instance/device: '+member);
  for(const r of description.relations)for(const member of [r.a,r.b])if(!groups.has(member.toLowerCase())&&!known.has(member.toLowerCase()))throw Error('Unknown @layout place target: '+member);
  const pairs=(description.pairs||[]).map(p=>({...p,members:p.members.map(member=>{const c=circuit.components.find(c=>c.name.toLowerCase()===member.toLowerCase());if(!c||c.synthetic||c.block)throw Error('Unknown or non-visible @layout pair device: '+member);return c.name;})}));
  const faces=(description.faces||[]).map(f=>{const c=circuit.components.find(c=>c.name.toLowerCase()===f.device.toLowerCase());if(!c||!['Q','M','J','Z'].includes(c.kind))throw Error('Unknown or unsupported @layout face device: '+f.device);return {...f,device:c.name};});
  // The header describes the top-level sheet. Opening an instance starts a new
  // layout scope; ancestor rows, columns, ordering and priority caps stop here.
  const owners=new Map(),output=[],instances=new Set(Object.keys(tree.contexts).map(n=>n.toLowerCase()));
  for(const g of description.groups) {
    const members=[];
    for(const member of g.members) {
      if(groups.has(member.toLowerCase())){members.push({group:member});continue;}
      for(const c of circuit.components)if(c.name.toLowerCase()===member.toLowerCase()||c.name.toLowerCase().startsWith(member.toLowerCase()+'/')) {
        if(owners.has(c.name))throw Error('Overlapping @layout membership: '+c.name);
        owners.set(c.name,g.id);members.push({cell:c.name,...instances.has(member.toLowerCase())?{instance:member}:{}});
      }
    }
    output.push({id:g.id,direction:g.direction,members});
  }
  const parents=new Set();for(const g of output)for(const m of g.members)if(m.group){const k=m.group.toLowerCase();if(parents.has(k))throw Error('Layout group has multiple parents: '+m.group);parents.add(k);}
  return {version:1,priorityCap:description.priorityCap,groups:output,relations:description.relations,pairs,faces};
}
