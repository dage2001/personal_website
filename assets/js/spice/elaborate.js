import {assertValid,record,qualify,nodeName} from './circuit-ir.js';
import {parameterEnvironment,bindValue} from './parameters.js';
import {structuralValue} from './structural-expression.js';

/** Resolve instance contexts without destroying definition/instance hierarchy. */
export function elaborateCircuit(ir,{isolate=''}={}) {
  assertValid(ir);
  const contexts=record(),nodeResolvers=new Map();let count=0,deviceCount=0;
  function build(scopeId,path,bindings,parentParams,overrides,instance,ancestors) {
    if(path.length>64)throw Error('Instance nesting exceeds 64 levels.');
    if(++count>2000)throw Error('Elaboration exceeds 2000 instances.');
    const scope=ir.scopes[scopeId],id=path.length?qualify(path.slice(0,-1),path.at(-1)):'',nodes=record();
    // A local sheet starts at formal ports, before caller actuals are bound.
    // Descendants still bind to this local scope in their original port order.
    if(isolate&&id===isolate)bindings=record();
    if(ancestors.some(c=>c.scopeId===scopeId))throw Error('Circular subcircuit reference at '+id);
    const params=parameterEnvironment(parentParams,scope.defaults,scope.parameters,overrides);
    function resolveNode(name) {
      if(/^\{[\s\S]*\}$/.test(name)){const value=structuralValue(name,params);name=String(typeof value==='boolean'?Number(value):value);}
      if(/^"[\s\S]*"$/.test(name))name=name.slice(1,-1);
      const n=name.toLowerCase();
      if(Object.hasOwn(bindings,n))return bindings[n];
      if(ir.globals.includes(n))return nodeName([],n);
      return nodes[n]||(nodes[n]=nodeName(path,n));
    }
    const context={id,path,scopeId,name:instance?.name||'Top',definition:scope.name,ports:scope.ports.map(p=>({name:p,node:resolveNode(p)})),params,nodes,models:record(),devices:[],children:[],raw:instance?.raw||'',line:instance?.line||0};
    contexts[id]=context;
    nodeResolvers.set(id,resolveNode);
    const chain=[...ancestors,context];
    function modelName(model) {
      if(!model)return '';
      let current=scope;
      while(current) {
        if(current.directives.some(d=>new RegExp('^\\.model\\s+'+model.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\.\\d+)?(?:\\s|$)','i').test(d.text))) {
          const owner=[...chain].reverse().find(c=>c.scopeId===current.id);
          return qualify(owner?.path||[],model.toLowerCase());
        }
        current=ir.scopes[current.parent];
      }
      return model;
    }
    for(const directive of scope.directives.filter(d=>/^\.model\b/i.test(d.text))) {
      const local=/^\.model\s+(\S+)/i.exec(directive.text)?.[1];
      if(!local)continue;
      const name=modelName(local),definition=scope.models[local.toLowerCase()];
      const bound=bindValue(directive.text,params,resolveNode,n=>qualify(path,n));
      context.models[name]={...definition,name,raw:bound.replace(/^(\.model\s+)\S+/i,(_,prefix)=>prefix+name),instanceId:id,parameters:params};
    }
    for(const c of scope.devices) {
      if(++deviceCount>3000)throw Error('Elaboration exceeds 3000 primitive devices.');
      const terminals=record();for(const [pin,node]of Object.entries(c.terminals))terminals[pin]=resolveNode(node);
      const model=modelName(c.model);
      context.devices.push({...c,name:qualify(path,c.name),localName:c.name,instanceId:id,terminals,model,parameters:params});
    }
    for(const call of scope.instances) {
      let definitionId=call.definitionId;
      if(!definitionId){const name=String(structuralValue(call.definitionName,params)).toLowerCase();let lexical=scope;while(lexical&&!definitionId){definitionId=lexical.definitions[name];lexical=ir.scopes[lexical.parent];}if(!definitionId)throw Error('Undefined selected subcircuit: '+name);}
      const def=ir.scopes[definitionId],mapped=record();
      if(def.ports.length!==call.nodes.length)throw Error(call.name+': expected '+def.ports.length+' ports; got '+call.nodes.length);
      def.ports.forEach((port,i)=>{mapped[port.toLowerCase()]=resolveNode(call.nodes[i]);});
      const child=build(definitionId,[...path,call.name],mapped,params,call.parameters,call,chain);
      if(call.pinNames?.length===child.ports.length)child.ports.forEach((p,i)=>{p.label=call.pinNames[i];});
      context.children.push(child);
    }
    return context;
  }
  try {
    const root=build(ir.rootId,[],record(),record(),record(),null,[]);
    const byId=new Map(Object.values(contexts).map(c=>[c.id.toLowerCase(),c]));
    const allModels=Object.assign(record(),...Object.values(contexts).map(c=>c.models));
    const findModel=name=>allModels[name]||Object.entries(allModels).find(([key])=>key.startsWith(name+'.'))?.[1];
    function target(context,reference) {
      const parts=reference.split(':');if(parts.length===1)return {owner:context,name:reference};
      const name=parts.pop();
      for(const path of [[...context.path,...parts],parts]){const owner=byId.get(path.map(encodeURIComponent).join('/').toLowerCase());if(owner)return {owner,name};}
      throw Error('Unknown hierarchical reference: '+reference);
    }
    for(const context of Object.values(contexts))for(const c of context.devices) {
      const original=ir.scopes[context.scopeId].devices.find(d=>d.name===c.localName);
      const signal=name=>{const t=target(context,name);return nodeResolvers.get(t.owner.id)(t.name);};
      const device=(name,type='',required='')=>{
        const t=target(context,name),found=t.owner.devices.find(d=>d.localName.toLowerCase()===t.name.toLowerCase());
        if(type.toLowerCase()==='ix'){const port=t.owner.ports.find((p,i)=>p.name.toLowerCase()===t.name.toLowerCase()||String(i+1)===t.name);if(port)return t.owner.id+':'+port.name;}
        if(!found){if(required)throw Error(c.name+': referenced '+required+' device '+name+' was not found.');return qualify(t.owner.path,t.name);}
        if(required&&found.kind!==required)throw Error(c.name+': '+name+' must be a '+required+' device.');
        return found.name;
      };
      c.value=bindValue(original.value,context.params,signal,device);
      if(original.model)c.value=c.value.replace(original.model,c.model);
      if(c.kind==='M'&&Object.keys(c.terminals).length===3) {
        let model=findModel(c.model),pchan=false;const visited=new Set();
        while(model?.type==='VDMOS'&&!visited.has(model.name)) {
          visited.add(model.name);const flag=/\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(model.raw);
          if(flag){pchan=flag[1]===undefined||Number(structuralValue(flag[1],model.parameters))>=.5;break;}
          const prefix=model.name.includes('/')?model.name.slice(0,model.name.lastIndexOf('/')+1):'';
          model=findModel(prefix+(model.baseModel||'').toLowerCase())||findModel((model.baseModel||'').toLowerCase());
        }
        if(visited.size)c.type='spice_'+(pchan?'pmos3':'nmos3');
      }
      c.controlSources=(original.controlSources||[]).map(n=>device(n,'','V'));c.controlSource=c.controlSources[0]||'';
      c.coupledInductors=(original.coupledInductors||[]).map(n=>device(n,'','L'));
      for(const ref of new Set([...(original.controlSources||[]),...(original.coupledInductors||[])])) {
        const escaped=ref.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        c.value=c.value.replace(new RegExp('(?<![\\w./%])'+escaped+'(?![\\w.$])','g'),()=>device(ref));
      }
    }
    return {kind:'ElaboratedHierarchy',ir,root,contexts};
  }catch(error){error.diagnostics=[...ir.diagnostics,{severity:'error',line:0,message:error.message}];throw error;}
}
