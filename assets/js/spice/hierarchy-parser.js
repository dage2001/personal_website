import {parsePrimitiveCir, tokenize} from './primitive-parser.js';

const rec = () => Object.create(null);
const lower = s => s.toLowerCase();
export function parseAssignments(tokens) {
  const result = rec();
  for (let i=0;i<tokens.length;i++) {
    const token=tokens[i];
    if (/^params?:$/i.test(token)) continue;
    const match = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(token);
    if (!match) throw Error('Expected named parameter assignment, got: ' + token);
    const name = lower(match[1]);
    let value=match[2];
    if(value===undefined) {
      const equal=/^=([\s\S]*)$/.exec(tokens[++i]||'');
      if(!equal)throw Error('Expected = after parameter '+name);value=equal[1];
    }
    if(!value)value=tokens[++i];
    if(!value||/^params?:$/i.test(value))throw Error('Missing value for parameter '+name);
    if (Object.hasOwn(result, name)) throw Error('Duplicate parameter: ' + name);
    result[name] = value;
  }
  return result;
}
function splitParameters(tokens) {
  const start = tokens.findIndex((t,i) => /^params?:$/i.test(t) || t.includes('=') || tokens[i+1] === '=');
  return start < 0 ? [tokens,rec()] : [tokens.slice(0,start),parseAssignments(tokens.slice(start))];
}

/** Definitions and instances remain separate. Parsing does not instantiate or flatten. */
export function parseHierarchy(source) {
  if (typeof source !== 'string') throw TypeError('Netlist must be a string.');
  if (source.length > 500000) throw Error('Netlist exceeds the limit of 500 kB.');
  const diagnostics=[], scopes=rec(), globals=new Set(['0']);
  const report=(severity,line,message)=>diagnostics.push({severity,line,message});
  const makeScope=(id,name,parent,ports=[],defaults=rec(),line=0)=>{
    const scope={id,name,parent,ports,defaults,parameters:rec(),definitions:rec(),devices:[],instances:[],directives:[],line,statements:[]};
    scopes[id]=scope;return scope;
  };
  const root=makeScope('root','Top',null),stack=[root],lines=[];
  let control=false,ended=false;
  source.replace(/^\uFEFF/,'').split(/\r?\n/).forEach((raw,i)=>{
    const text=raw.trim();if(!text||text.startsWith('*'))return;
    if(text.startsWith('+')) {
      if(!lines.length)report('error',i+1,'Continuation has no preceding statement.');
      else lines.at(-1).text+=' '+text.slice(1).trim();
    } else lines.push({text,line:i+1});
  });
  for(const {text,line}of lines) {
    try {
      const t=tokenize(text);if(!t.length)continue;
      const head=lower(t[0]),scope=stack.at(-1);
      if(ended){report('warning',line,'Statement after .end is not rendered: '+text);continue;}
      if(head==='.control'){control=true;report('warning',line,'.control script retained but not executed or rendered.');continue;}
      if(head==='.endc'){control=false;continue;}if(control)continue;
      if(head==='.subckt') {
        if(t.length<2)throw Error('.SUBCKT requires a name.');
        const [ports,defaults]=splitParameters(t.slice(2)),name=lower(t[1]);
        if(Object.hasOwn(scope.definitions,name))throw Error('Duplicate subcircuit definition: '+t[1]);
        const normalized=ports.map(lower);
        if(new Set(normalized).size!==ports.length || normalized.includes('0'))throw Error('Subcircuit formal ports must be unique and cannot be ground 0.');
        if(ports.some(p=>/[{}()=]/.test(p)))throw Error('Invalid formal port.');
        if(stack.length>64)throw Error('Definition nesting exceeds 64 levels.');
        const id=scope.id+'/'+encodeURIComponent(name);
        scope.definitions[name]=id;stack.push(makeScope(id,t[1],scope.id,ports,defaults,line));continue;
      }
      if(head==='.ends') {
        if(stack.length===1)throw Error('Unmatched .ENDS.');
        if(t[1]&&lower(t[1])!==lower(scope.name))throw Error('.ENDS name does not match '+scope.name);
        stack.pop();continue;
      }
      if(head==='.end') {if(stack.length>1)throw Error('.END inside a subcircuit; expected .ENDS.');ended=true;continue;}
      if(head==='.param') {
        const assignments=parseAssignments(t.slice(1));
        for(const [name,value]of Object.entries(assignments)) {
          if(Object.hasOwn(scope.parameters,name))throw Error('Repeated .param assignment requires simulator ordering semantics: '+name);
          scope.parameters[name]=value;
        }
      }
      if(head==='.global') {if(t.length<2)throw Error('.GLOBAL requires nodes.');for(const n of t.slice(1))globals.add(lower(n));}
      if(head.startsWith('.'))scope.directives.push({line,text});
      if(head.startsWith('x')) {
        const [body,parameters]=splitParameters(t.slice(1));
        if(!body.length)throw Error('X instance requires a subcircuit name.');
        scope.instances.push({name:t[0],nodes:body.slice(0,-1).map(lower),definitionName:body.at(-1),definitionId:null,parameters,line,raw:text});
      } else scope.statements.push({line,text});
    }catch(error){report('error',line,error.message+' Statement: '+text);}
  }
  if(stack.length>1)report('error',stack.at(-1).line,'Unclosed .SUBCKT '+stack.at(-1).name);
  if(control)report('error',0,'Unclosed .control block.');
  function lookup(scope,name) {
    while(scope){if(Object.hasOwn(scope.definitions,lower(name)))return scope.definitions[lower(name)];scope=scopes[scope.parent];}
    return null;
  }
  for(const scope of Object.values(scopes)) {
    // Inherit lexical model definitions, while keeping node and device scopes separate.
    const lineage=[];let current=scope;
    while(current){lineage.unshift(current);current=scopes[current.parent];}
    const modelLines=lineage.flatMap(s=>s.statements.filter(st=>/^\.model\b/i.test(st.text)));
    const statements=[...(scope.statements[0]?.line===1?[]:[{line:0,text:'* Scope'}]),...scope.statements,...modelLines];
    const parsed=parsePrimitiveCir(statements.map(s=>s.text).join('\n'));
    scope.devices=parsed.components.map(c=>({...c,line:statements[c.line-1]?.line||scope.line}));scope.models=parsed.models;
    if(scope===root)root.title=parsed.title;
    diagnostics.push(...parsed.diagnostics.filter(d=>!d.message.includes('No supported components to render.')&&!d.message.includes('300 components')).map(d=>({...d,line:statements[d.line-1]?.line||scope.line})));
    const names=new Set(scope.devices.map(c=>lower(c.name)));
    for(const instance of scope.instances) {
      if(names.has(lower(instance.name)))report('error',instance.line,'Duplicate instance/device name: '+instance.name);
      names.add(lower(instance.name));
      instance.definitionId=lookup(scope,instance.definitionName);
      if(!instance.definitionId)report('error',instance.line,'Undefined subcircuit: '+instance.definitionName+' in '+instance.name);
      else {
        const def=scopes[instance.definitionId];
        if(def.ports.length!==instance.nodes.length)report('error',instance.line,`${instance.name}: ${def.name} expects ${def.ports.length} ports; got ${instance.nodes.length}.`);
        for(const param of Object.keys(instance.parameters))if(!Object.hasOwn(def.defaults,param)&&!Object.hasOwn(def.parameters,param))report('error',instance.line,`${instance.name}: undeclared subcircuit parameter ${param}.`);
      }
    }
  }
  for(const scope of Object.values(scopes))delete scope.statements;
  const active=new Set(),done=new Set();
  function visit(id,path=[]) {
    if(active.has(id)){report('error',scopes[id].line,'Circular subcircuit reference: '+[...path,scopes[id].name].join(' → '));return;}
    if(done.has(id))return;active.add(id);
    if(path.length>=64){report('error',scopes[id].line,'Subcircuit dependency nesting exceeds 64 levels.');active.delete(id);done.add(id);return;}
    for(const instance of scopes[id].instances)if(instance.definitionId)visit(instance.definitionId,[...path,scopes[id].name]);
    active.delete(id);done.add(id);
  }
  for(const id of Object.keys(scopes))visit(id);
  if(!root.devices.length&&!root.instances.length)report('error',0,'No supported components or instances to render.');
  return {kind:'HierarchicalCircuit',version:2,rootId:'root',title:root.title||'',scopes,globals:[...globals],diagnostics};
}
