import {leafDevices} from './flatten.js';
import {bindValue,parameterEnvironment} from './parameters.js';
import {nodeName,qualify} from './circuit-ir.js';
import {elaborateCircuit} from './elaborate.js';

const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const replaceToken=(text,from,to)=>text.replace(new RegExp('(?<![\\w./%:$])'+escape(from)+'(?![\\w./%:$])','gi'),()=>to);

/** Compile the current projection. Each collapsed *instance* gets a bound local
 * definition; expanded instances remain real primitives on this same sheet. */
export function compileAscNetlist(tree,circuit) {
  if(circuit.localScope)tree=elaborateCircuit(tree.ir,{isolate:circuit.focus});
  const visible=circuit.components.filter(c=>!c.synthetic),all=leafDevices(tree.root),refs=new Map(),owners=new Map(),blocks=visible.filter(c=>c.kind==='X');
  const usedRefs=new Set();const uniqueRef=(kind,name)=>{let ref=name.includes('/')?kind+'_'+name.replaceAll('/','_'):name;ref=ref.replace(/[^a-z0-9_.$@&Ö]/gi,'_');if(!ref.toUpperCase().startsWith(kind))ref=kind+'_'+ref;const base=ref;let serial=1;while(usedRefs.has(ref.toLowerCase()))ref=base+'_'+serial++;usedRefs.add(ref.toLowerCase());return ref;};
  all.forEach(c=>refs.set(c.name,uniqueRef(c.kind,c.name)));
  const blockRefs=new Map(blocks.map(c=>[c.name,uniqueRef('X',c.name)])),definitions=new Map(blocks.map((c,i)=>[c.name,'CV_BLOCK_'+i]));
  all.forEach(c=>owners.set(c.name,''));for(const b of blocks)for(const c of leafDevices(tree.contexts[b.instanceId]))owners.set(c.name,b.name);
  const readable=n=>/^(?:[a-z_][\w.$-]*|\d+)$/i.test(n),reserved=new Set([...all.flatMap(c=>Object.values(c.terminals)),...Object.keys(circuit.nodes)].filter(readable).map(n=>n.toLowerCase()));
  const nodeNames=new Map([['0','0']]),usedNodes=new Set(['0']);let nextNode=1;
  const nodeId=n=>{if(!nodeNames.has(n)){let name=n;if(!readable(n)||usedNodes.has(n.toLowerCase())){do{name='N_cv'+nextNode++;}while(reserved.has(name.toLowerCase())||usedNodes.has(name.toLowerCase()));}nodeNames.set(n,name);usedNodes.add(name.toLowerCase());}return nodeNames.get(n);};
  for(const c of all)Object.values(c.terminals).forEach(nodeId);
  Object.keys(circuit.nodes).forEach(nodeId);
  const internalOwners=new Map();for(const b of blocks){const ports=new Set(b.block.ports.map(p=>p.node));for(const c of leafDevices(tree.contexts[b.instanceId]))for(const n of Object.values(c.terminals))if(!ports.has(n)&&n!=='0'&&!tree.ir.globals.some(g=>nodeName([],g)===n))internalOwners.set(n,b.name);}
  const formals=new Map(blocks.map(b=>[b.name,new Map(b.block.ports.map((p,i)=>[p.node,'p'+i]).reverse())]));
  const node=(name,scope='')=>{if(name==='0')return '0';if(formals.get(scope)?.has(name))return formals.get(scope).get(name);const owner=internalOwners.get(name);if(scope&&owner&&owner!==scope)throw Error('ASC export: cross-block internal node probe requires expanding both instances: '+name);return owner&&owner!==scope?blockRefs.get(owner)+':'+nodeId(name):nodeId(name);};
  const device=(name,scope='')=>{
    if(!refs.has(name))throw Error('ASC: unresolved device reference '+name);
    const owner=owners.get(name);if(scope&&owner!==scope)throw Error('ASC export: cross-block current probe requires expanding both instances: '+name);return owner&&owner!==scope?blockRefs.get(owner)+':'+refs.get(name):refs.get(name);
  };
  const exportParams=new Map();
  function parameters(context,parent={}) {
    const scope=tree.ir.scopes[context.scopeId];let params;
    if(!context.id)params=Object.fromEntries(Object.keys(context.params).map(n=>[n,n]));
    else {const parentContext=tree.contexts[context.path.slice(0,-1).map(encodeURIComponent).join('/')],call=tree.ir.scopes[parentContext.scopeId].instances.find(c=>c.name===context.path.at(-1));params=parameterEnvironment(parent,scope.defaults,scope.parameters,call.parameters);}
    exportParams.set(context.id,params);context.children.forEach(c=>parameters(c,params));
  }
  parameters(tree.root);
  const resolve=(context,name)=>{
    const match=context.ports.find(p=>p.name.toLowerCase()===name.toLowerCase());if(match)return match.node;
    const local=context.nodes[name.toLowerCase()];if(local)return local;
    if(tree.ir.globals.includes(name.toLowerCase()))return nodeName([],name);
    const parts=name.split(':');if(parts.length>1){const local=parts.pop(),id=[...context.path,...parts].map(encodeURIComponent).join('/'),target=tree.contexts[id]||tree.contexts[parts.map(encodeURIComponent).join('/')];if(target)return resolve(target,local);}
    return nodeName(context.path,name);
  };
  const qualifyDevice=(context,name)=>{
    const local=context.devices.find(c=>c.localName.toLowerCase()===name.toLowerCase());if(local)return local.name;
    const parts=name.split(':');if(parts.length>1){const ref=parts.pop(),id=[...context.path,...parts].map(encodeURIComponent).join('/'),target=tree.contexts[id]||tree.contexts[parts.map(encodeURIComponent).join('/')];const d=target?.devices.find(c=>c.localName.toLowerCase()===ref.toLowerCase());if(d)return d.name;}
    throw Error('ASC: unsupported device reference '+name);
  };
  const modelNames=new Map(Object.keys(circuit.models).map((name,i)=>[name,'CV_MODEL_'+i]));
  function value(c,scope) {
    const context=tree.contexts[c.instanceId],original=tree.ir.scopes[context.scopeId].devices.find(d=>d.name===c.localName);
    const probes=[],hold=value=>'__CV_PROBE_'+(probes.push(value)-1)+'__';
    let text=bindValue(original.value,exportParams.get(context.id),n=>hold(node(resolve(context,n),scope)),n=>hold(device(qualifyDevice(context,n),scope)));
    if(original.model)text=replaceToken(text,original.model,modelNames.get(c.model)||c.model);
    // Unbraced source expressions are also legal; map their resolved probes.
    text=text.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi,(_,type,args)=>type+'('+args.split(',').map(arg=>{
      const name=arg.trim(),mapped=/^__CV_PROBE_(\d+)__$/.exec(name);if(mapped)return probes[+mapped[1]];
      return type.toLowerCase()==='v'?node(resolve(context,name),scope):device(qualifyDevice(context,name),scope);
    }).join(',')+')');
    (original.controlSources||[]).forEach((name,i)=>{text=replaceToken(text,name,device(c.controlSources[i],scope));});
    if(c.kind==='@')for(const [pin,n]of Object.entries(c.terminals))if(['REFNODE','INTNODE'].includes(pin))text=text.replace(new RegExp('\\b'+pin+'\\s*=\\s*[^\\s]+','i'),pin.toLowerCase()+'='+node(n,scope));
    return text;
  }
  const cards=new Map(),warnings=tree.ir.diagnostics.filter(d=>d.severity==='warning').map(d=>d.message);
  function card(c,scope='') {
    if(c.kind==='X'){const ports=c.block.ports.map(p=>node(p.node,scope));return {ref:blockRefs.get(c.name),kind:'X',pins:c.block.ports.map(p=>p.pin),nodes:ports,value:definitions.get(c.name),line:[blockRefs.get(c.name),...ports,definitions.get(c.name)].join(' ')};}
    const ref=refs.get(c.name),entries=Object.entries(c.terminals);
    if(c.kind==='K'){const coefficient=value(c,scope).split(' · k=').at(-1),line=[ref,...c.coupledInductors.map(n=>device(n,scope)),coefficient].join(' ');return {ref,kind:'K',pins:[],nodes:[],value:coefficient,line,directive:true};}
    let tail=value(c,scope),pins=entries.map(([p])=>p),nodes=entries.map(([,n])=>node(n,scope));
    if(['E','G'].includes(c.kind)&&c.sourceMode==='POLY') {
      const match=/^POLY\(\d+\)\s*/i.exec(tail);if(!match)throw Error('ASC: invalid POLY source '+c.name);
      tail=match[0]+nodes.slice(2).join(' ')+' '+tail.slice(match[0].length);pins=pins.slice(0,2);nodes=nodes.slice(0,2);
      warnings.push(c.name+': POLY control nodes remain explicit in the editable Value expression.');
    }
    if(c.kind==='@'){pins=pins.slice(0,2);nodes=nodes.slice(0,2);}
    return {ref,kind:c.kind,prefix:c.kind==='M'?(c.type.includes('pmos')?'MP':'MN'):c.kind,pins,nodes,electricalNodes:entries.map(([,n])=>node(n,scope)),value:tail,line:[ref,...nodes,tail].filter(Boolean).join(' ')};
  }
  visible.forEach(c=>cards.set(c.name,card(c)));
  const library=[],expected=[];
  for(const b of blocks){library.push('.subckt '+definitions.get(b.name)+' '+b.block.ports.map((_,i)=>'p'+i).join(' '));for(const c of leafDevices(tree.contexts[b.instanceId])){const d=card(c,b.name);library.push(d.line);expected.push({original:c.name,scope:b.name,...d});}library.push('.ends '+definitions.get(b.name));}
  // Models have already been bound per instance, preventing parameter/model collisions.
  for(const [name,model]of Object.entries(circuit.models)){
    const context=tree.contexts[model.instanceId],scope=tree.ir.scopes[context.scopeId],local=decodeURIComponent(name.split('/').at(-1)),original=scope.models[local];
    let raw=original?bindValue(original.raw,exportParams.get(context.id),n=>node(resolve(context,n)),n=>device(qualifyDevice(context,n))):model.raw;
    raw=raw.replace(/^(\.model\s+)\S+/i,(_,prefix)=>prefix+modelNames.get(name));
    for(const [old,next]of modelNames)raw=replaceToken(raw,old,next);
    if(model.baseModel){const prefix=context.path.length?context.path.map(encodeURIComponent).join('/')+'/':'';raw=raw.replace(new RegExp('(AKO:)'+escape(model.baseModel),'i'),(_,a)=>a+(modelNames.get(prefix+model.baseModel.toLowerCase())||modelNames.get(model.baseModel.toLowerCase())||model.baseModel));}
    library.push(raw);
  }
  const directives=[];
  for(const context of Object.values(tree.contexts)){
    if(context.id&&!leafDevices(context).some(c=>owners.has(c.name)&&(visible.some(v=>v.name===c.name)||blocks.some(b=>b.name===owners.get(c.name)))))continue;
    for(const d of tree.ir.scopes[context.scopeId].directives){
      // Parent node/device directives cannot be interpreted as local wiring.
      // Retain parameter/model environment and analysis settings only.
      if(circuit.localScope&&!context.id&&!/^\.(?:model|title|param|func|global|options?|tran|ac|op|step|temp)\b/i.test(d.text))continue;
      if(/^\.(?:model|param|global|title)\b/i.test(d.text)&&context.id)continue;
      if(/^\.(?:model|title)\b/i.test(d.text))continue;
      if(context.id&&!/^\.(?:func|ic|nodeset)\b/i.test(d.text))throw Error('ASC export: local directive requires scope-preserving export ('+context.id+'): '+d.text);
      if(context.id&&/^\.func\b/i.test(d.text))throw Error('ASC export: local .func requires scope-preserving export ('+context.id+').');
      const probes=[],hold=value=>'__CV_PROBE_'+(probes.push(value)-1)+'__';
      let text=context.id?bindValue(d.text,exportParams.get(context.id),n=>hold(node(resolve(context,n))),n=>hold(device(qualifyDevice(context,n)))):d.text;
      text=text.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi,(_,type,args)=>type+'('+args.split(',').map(n=>{
        const name=n.trim(),mapped=/^__CV_PROBE_(\d+)__$/.exec(name);if(mapped)return probes[+mapped[1]];
        if(name==='*')return name;if(/[*?]/.test(name))throw Error('ASC export: wildcard probe cannot be renamed reliably: '+name);
        return type.toLowerCase()==='v'?node(resolve(context,name)):device(qualifyDevice(context,name));
      }).join(',')+')');
      if(/^\.global\b/i.test(text))text='.global '+text.split(/\s+/).slice(1).map(n=>node(resolve(context,n))).join(' ');
      if(/^\.(?:dc|tf|noise|sens)\b/i.test(text))for(const c of context.devices)text=replaceToken(text,c.localName,device(c.name));
      directives.push(text);
    }
  }
  return {cards,library,directives,nodeNames,refs,expected,warnings:[...new Set(warnings)],node,blockRefs,definitions};
}
