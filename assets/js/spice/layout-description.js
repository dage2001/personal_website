/** Small, declarative comment language. It never creates electrical edges. */
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
  const text=body.join(' '),tokens=text.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g)||[],groups=[],relations=[];let pos=0,anonymous=0,priorityCap=10;
  const take=()=>tokens[pos++],name=()=>{const n=take();if(!n||!/^[A-Za-z_@][\w./%:@-]*$/.test(n))throw Error('Expected layout identifier, got '+n);return n;};
  function group(named) {
    if(groups.length>=256)throw Error('Layout description exceeds 256 groups.');
    const id=named?name():'@row'+anonymous++,direction=take();
    if(!['row','column'].includes(direction))throw Error('Expected row or column.');
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
  return {layout:{version:1,priorityCap,groups,relations},diagnostics};
}

/** Resolve physical instances once; expanded leaves keep their visual ownership. */
export function bindLayoutDescription(tree,circuit) {
  const description=tree.ir.layoutDescription;if(!description)return null;
  const groups=new Map(description.groups.map(g=>[g.id.toLowerCase(),g])),allDevices=Object.values(tree.contexts).flatMap(c=>c.devices.map(d=>d.name));
  const known=new Set([...Object.keys(tree.contexts),...allDevices].map(n=>n.toLowerCase()));
  for(const g of groups.values())if(known.has(g.id.toLowerCase()))throw Error('Layout group name conflicts with a circuit instance/device: '+g.id);
  for(const g of groups.values())for(const member of g.members)if(!groups.has(member.toLowerCase())&&!known.has(member.toLowerCase()))throw Error('Unknown @layout instance/device: '+member);
  for(const r of description.relations)for(const member of [r.a,r.b])if(!groups.has(member.toLowerCase())&&!known.has(member.toLowerCase()))throw Error('Unknown @layout place target: '+member);
  const owners=new Map(),output=[];
  for(const g of description.groups) {
    const members=[];
    for(const member of g.members) {
      if(groups.has(member.toLowerCase())){members.push({group:member});continue;}
      for(const c of circuit.components)if(c.name.toLowerCase()===member.toLowerCase()||c.name.toLowerCase().startsWith(member.toLowerCase()+'/')) {
        if(owners.has(c.name))throw Error('Overlapping @layout membership: '+c.name);
        owners.set(c.name,g.id);members.push({cell:c.name,instance:member});
      }
    }
    output.push({id:g.id,direction:g.direction,members});
  }
  const parents=new Set();for(const g of output)for(const m of g.members)if(m.group){const k=m.group.toLowerCase();if(parents.has(k))throw Error('Layout group has multiple parents: '+m.group);parents.add(k);}
  return {version:1,priorityCap:description.priorityCap,groups:output,relations:description.relations};
}
