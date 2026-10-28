import {record} from './circuit-ir.js';
const unbox=s=>/^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(s)?s.slice(1,-1):s;
const identifiers=/(?<![\w.$])[a-z_][\w.$]*/gi;

/** Substitute symbols, never execute SPICE or JavaScript. Engineering suffixes stay literal. */
export function substituteExpression(text,lookup,node=n=>n,device=n=>n) {
  const references=[];
  text=text.replace(/"(?:\\.|[^"\\])*"/g,value=>{references.push(value);return '@@'+(references.length-1)+'@@';});
  text=text.replace(/\b([vi])\s*\(([^()]*)\)/gi,(all,type,args)=>{
    const parts=args.split(',').map(s=>s.trim());
    if(parts.some(n=>!n||/[\s{}+*()]/.test(n)))throw Error('Unsupported dynamic voltage/current reference: '+all);
    const value=type.toUpperCase()+'('+parts.map(type.toLowerCase()==='v'?node:device).join(',')+')';
    references.push(value);return '@@'+(references.length-1)+'@@';
  });
  let budget=text.length;
  text=text.replace(identifiers,(name,offset,whole)=>{
    if(whole.slice(offset+name.length).trimStart().startsWith('('))return name;
    const value=lookup(name.toLowerCase());
    if(value===undefined)return name;
    budget+=value.length+2;
    if(budget>100000)throw Error('Expanded parameter expression exceeds 100000 characters.');
    return '('+value+')';
  });
  return text.replace(/@@(\d+)@@/g,(_,i)=>references[Number(i)]);
}

export function parameterEnvironment(parent,defaults,locals,overrides) {
  const raw={...defaults,...locals},resolved=record(),active=new Set();
  // Instance actuals are expressions in the caller, not in the callee's shadowed scope.
  const actual=record();
  for(const [name,value]of Object.entries(overrides))actual[name]=substituteExpression(unbox(value),n=>parent[n]);
  function get(name) {
    if(Object.hasOwn(actual,name))return actual[name];
    if(Object.hasOwn(resolved,name))return resolved[name];
    if(!Object.hasOwn(raw,name))return parent[name];
    if(active.has(name)) {
      if(Object.hasOwn(parent,name))return parent[name];
      throw Error('Circular parameter dependency: '+[...active,name].join(' → '));
    }
    active.add(name);
    resolved[name]=substituteExpression(unbox(raw[name]),get);
    active.delete(name);return resolved[name];
  }
  for(const name of Object.keys(raw))get(name);
  return Object.assign(record(),parent,resolved,actual);
}

export function bindValue(text,params,node,device) {
  let result='';
  for(let i=0;i<text.length;) {
    const open=text[i];
    if(open!=='{'&&open!=="'"){result+=open;i++;continue;}
    const start=i++;let depth=1,quote='';
    for(;i<text.length&&depth;i++) {
      if(open==="'"){if(text[i]==="'")depth=0;continue;}
      if(quote){if(text[i]===quote)quote='';continue;}
      if(text[i]==='"'||text[i]==="'"){quote=text[i];continue;}
      if(text[i]==='{')depth++;if(text[i]==='}')depth--;
    }
    if(depth)throw Error('Unclosed parameter expression.');
    result+=open+substituteExpression(text.slice(start+1,i-1),n=>params[n],node,device)+(open==='{'?'}':"'");
  }
  // Behavioral sources can also use unbraced V=/I= expressions.
  if(!text.includes('{')&&!text.includes("'")&&/^(?:[VI]|VALUE|VOL|CUR)\s*=/i.test(text)) {
    const equal=text.indexOf('=');result=text.slice(0,equal+1)+substituteExpression(text.slice(equal+1),n=>params[n],node,device);
  } else if(Object.hasOwn(params,text.toLowerCase()))result='{'+params[text.toLowerCase()]+'}';
  return result;
}
