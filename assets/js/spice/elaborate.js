import {assertValid,record,qualify,nodeName} from './circuit-ir.js';
import {parameterEnvironment,bindValue} from './parameters.js';

/** Resolve instance contexts without destroying definition/instance hierarchy. */
export function elaborateCircuit(ir) {
  assertValid(ir);
  const contexts=record();let count=0,deviceCount=0;
  function build(scopeId,path,bindings,parentParams,overrides,instance,ancestors) {
    if(path.length>64)throw Error('Instance nesting exceeds 64 levels.');
    if(++count>2000)throw Error('Elaboration exceeds 2000 instances.');
    const scope=ir.scopes[scopeId],id=path.length?qualify(path.slice(0,-1),path.at(-1)):'',nodes=record();
    const params=parameterEnvironment(parentParams,scope.defaults,scope.parameters,overrides);
    function resolveNode(name) {
      const n=name.toLowerCase();
      if(Object.hasOwn(bindings,n))return bindings[n];
      if(ir.globals.includes(n))return nodeName([],n);
      return nodes[n]||(nodes[n]=nodeName(path,n));
    }
    const context={id,path,scopeId,name:instance?.name||'Top',definition:scope.name,ports:scope.ports.map(p=>({name:p,node:resolveNode(p)})),params,nodes,models:record(),devices:[],children:[],raw:instance?.raw||'',line:instance?.line||0};
    contexts[id]=context;
    const chain=[...ancestors,context];
    function modelName(model) {
      if(!model)return '';
      let current=scope;
      while(current) {
        if(current.directives.some(d=>new RegExp('^\\.model\\s+'+model.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\s|$)','i').test(d.text))) {
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
      const device=n=>qualify(path,scope.devices.find(c=>c.name.toLowerCase()===n.toLowerCase())?.name||n);
      let value=bindValue(c.value,params,resolveNode,device);
      const model=modelName(c.model);
      if(c.model)value=value.replace(c.model,model);
      if(c.controlSource)value=value.replace(c.controlSource,device(c.controlSource));
      context.devices.push({...c,name:qualify(path,c.name),localName:c.name,instanceId:id,terminals,value,model,controlSource:c.controlSource?device(c.controlSource):'',parameters:params});
    }
    for(const call of scope.instances) {
      const def=ir.scopes[call.definitionId],mapped=record();
      def.ports.forEach((port,i)=>{mapped[port.toLowerCase()]=resolveNode(call.nodes[i]);});
      context.children.push(build(call.definitionId,[...path,call.name],mapped,params,call.parameters,call,chain));
    }
    return context;
  }
  try {
    const root=build(ir.rootId,[],record(),record(),record(),null,[]);
    return {kind:'ElaboratedHierarchy',ir,root,contexts};
  }catch(error){error.diagnostics=[...ir.diagnostics,{severity:'error',line:0,message:error.message}];throw error;}
}
