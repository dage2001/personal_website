/** Shared IR helpers. Path segments are escaped before joining, so names cannot collide. */
export const record = () => Object.create(null);
export const qualify = (path,name) => [...path,name].map(s=>encodeURIComponent(s)).join('/');
export const nodeName = (path,name) => qualify(path.map(p=>p.toLowerCase()),name.toLowerCase());
export function indexNodes(components,extraNodes=[]) {
  const nodes=record();
  const add=name=>nodes[name]||(nodes[name]={name,displayName:name,bit:Object.keys(nodes).length+2,terminals:[]});
  for(const c of components)for(const [pin,node]of Object.entries(c.terminals))add(node).terminals.push({component:c.name,pin});
  for(const name of extraNodes)add(name);
  return nodes;
}
export function assertValid(ir) {
  if(ir.diagnostics.some(d=>d.severity==='error')) {
    const error=Error('Fix the parser errors below before generating.');error.diagnostics=ir.diagnostics;throw error;
  }
}
