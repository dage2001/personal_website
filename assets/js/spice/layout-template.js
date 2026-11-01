import {nodeName} from './circuit-ir.js';
import {projectHierarchy} from './layout-adapter.js';
import {restoreProjectScene} from './project-file.js';
import {labelId} from './label-model.js';

/** Typed, pin-labelled circuit graphs. Values and names are deliberately not copied. */
function graph(circuit,globals){
  const vertices=new Map(),edge=(a,b,label)=>{if(!vertices.has(a)||!vertices.has(b))throw Error('Layout template has an unresolved control/reference.');vertices.get(a).edges.push([b,'>'+label]);vertices.get(b).edges.push([a,'<'+label]);};
  for(const n of Object.values(circuit.nodes))vertices.set('n:'+n.name,{id:n.name,kind:'net',label:'net:'+ (globals.has(n.name)?n.name:''),edges:[]});
  for(const c of circuit.components){const pins=Object.keys(c.terminals).sort();vertices.set('c:'+c.name,{id:c.name,kind:'cell',component:c,label:JSON.stringify([c.kind,pins,c.synthetic?Number(c.name.split('/').at(-1)):null]),edges:[]});}
  for(const c of circuit.components){const id='c:'+c.name;for(const [pin,node]of Object.entries(c.terminals))edge(id,'n:'+node,'pin:'+pin);
    for(const [i,ref]of (c.controlSources||[]).entries())edge(id,'c:'+ref,'control:'+i);
    for(const [i,ref]of (c.coupledInductors||[]).entries())edge(id,'c:'+ref,'coupled:'+i);
    let occurrence=0;for(const m of (c.value||'').matchAll(/\b(V|I|Ix)\s*\(([^()]+)\)/gi)){const type=m[1].toLowerCase();for(const [i,ref]of m[2].split(',').map(s=>s.trim()).entries())edge(id,(type==='v'?'n:':'c:')+ref,'expression:'+type+':'+occurrence+':'+i);occurrence++;}
  }
  return vertices;
}

/** Exact bijection after colour refinement; the budget bounds symmetric searches. */
function isomorphism(a,b,compatible,budget){
  if(a.size!==b.size)return null;
  const all=[...a.values(),...b.values()];let colours=new Map(all.map(v=>[v,v.label]));
  for(let iteration=0;iteration<all.length;iteration++){
    if(performance.now()>budget.deadline)throw Error('Structure matching exceeded its search budget; no layout was changed.');
    const signatures=new Array(all.length);
    // Resolve each vertex's graph explicitly; names can coincide across the two graphs.
    for(let i=0;i<all.length;i++){const v=all[i],g=i<a.size?a:b;signatures[i]=JSON.stringify([colours.get(v),v.edges.map(([id,l])=>[l,colours.get(g.get(id))]).sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)))]);}
    const table=new Map([...new Set(signatures)].sort().map((s,i)=>[s,i])),next=new Map(all.map((v,i)=>[v,table.get(signatures[i])])),oldCount=new Set(colours.values()).size;colours=next;if(table.size===oldCount)break;
  }
  const classes=g=>{const result=new Map();for(const [id,v]of g){const c=colours.get(v);if(!result.has(c))result.set(c,[]);result.get(c).push(id);}return result;},ca=classes(a),cb=classes(b);
  if([...ca].some(([c,ids])=>ids.length!==cb.get(c)?.length))return null;
  const mapping=new Map(),used=new Set(),edgeLabels=(g,id,to)=>g.get(id).edges.filter(([n])=>n===to).map(([,l])=>l).sort().join('|');
  const valid=(x,y)=>{if(edgeLabels(a,x,x)!==edgeLabels(b,y,y))return false;for(const [p,q]of mapping)if(edgeLabels(a,x,p)!==edgeLabels(b,y,q))return false;return compatible(a.get(x),b.get(y));};
  function search(){if(--budget.states<0||performance.now()>budget.deadline)throw Error('Structure matching exceeded its search budget; no layout was changed.');if(mapping.size===a.size)return true;
    let chosen,candidates;for(const [x,v]of a){if(mapping.has(x))continue;const ys=cb.get(colours.get(v)).filter(y=>!used.has(y)&&valid(x,y));if(!ys.length)return false;if(!candidates||ys.length<candidates.length){chosen=x;candidates=ys;if(ys.length===1)break;}}
    const local=id=>id.split('/').at(-1);candidates.sort((x,y)=>(local(y)===local(chosen))-(local(x)===local(chosen))||x.localeCompare(y));
    for(const y of candidates){mapping.set(chosen,y);used.add(y);if(search())return true;mapping.delete(chosen);used.delete(y);}return false;
  }
  return search()?mapping:null;
}

export function matchLayoutInstances(tree,source,target,{maxStates=50000,timeout=1500}={}){
  if(!source||!target||source===target||!tree.contexts[source]||!tree.contexts[target])throw Error('Choose two different subcircuit blocks.');
  const globals=new Set(tree.ir.globals.map(g=>nodeName([],g))),budget={states:maxStates,deadline:performance.now()+timeout},memo=new Map(),views=new Map();
  const view=id=>{if(!views.has(id))views.set(id,projectHierarchy(tree,{focus:id}));return views.get(id);};
  const match=(left,right)=>{const key=JSON.stringify([left,right]);if(memo.has(key))return memo.get(key);const ac=view(left),bc=view(right),ag=graph(ac,globals),bg=graph(bc,globals);
    const map=isomorphism(ag,bg,(a,b)=>a.kind!=='cell'||!a.component.block||!!match(a.component.instanceId,b.component.instanceId),budget);memo.set(key,map);return map;};
  const map=match(source,target);if(!map)throw Error('Subcircuit structures differ; no layout was changed.');
  const instances=[];
  function collect(left,right){const sourceCircuit=view(left),targetCircuit=view(right),mapping=memo.get(JSON.stringify([left,right])),components=new Map(),bits=new Map();
    for(const [a,b]of mapping)if(a.startsWith('c:'))components.set(a.slice(2),b.slice(2));else bits.set(sourceCircuit.nodes[a.slice(2)].bit,targetCircuit.nodes[b.slice(2)].bit);
    instances.push({source:left,target:right,sourceCircuit,targetCircuit,components,bits});
    for(const c of sourceCircuit.components.filter(c=>c.block))collect(c.instanceId,targetCircuit.components.find(t=>t.name===components.get(c.name)).instanceId);
  }
  collect(source,target);return {...instances[0],instances};
}

export function transferLayoutSnapshot(source,targetBase,match,{targetLabels=new Map(),targetOverrides=[]}={}){
  const ids=new Map(match.components),targetNodes=new Map(targetBase.components.map(n=>[n.id,n])),oldLabels=new Map(targetOverrides.map(l=>[l.id,l.text]));
  for(const n of source.components.filter(n=>n.decoration)){const bit=match.bits.get(n.ports[0]?.bit),target=targetBase.components.find(t=>t.decoration&&t.ports[0]?.bit===bit);if(!target)throw Error('Template and target ground symbols differ.');ids.set(n.id,target.id);}
  const components=source.components.map(n=>{const id=ids.get(n.id),target=targetNodes.get(id);if(!target)throw Error('Template and target symbols differ.');
    const matrices=[n.editorMatrix||[1,0,0,1,0,0],...[1,-1].flatMap(a=>[1,-1].flatMap(d=>[[a,0,0,d,a<0?target.width:0,d<0?target.height:0],[0,a,d,0,d<0?target.height:0,a<0?target.width:0]]))];
    const direction={NORTH:[0,-1],SOUTH:[0,1],WEST:[-1,0],EAST:[1,0]},same=(a,b)=>Math.abs(a-b)<.001;
    const matrix=matrices.find(m=>{const corners=[[0,0],[target.width,0],[0,target.height],[target.width,target.height]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);if(!same(Math.min(...corners.map(p=>p[0])),0)||!same(Math.min(...corners.map(p=>p[1])),0)||!same(Math.max(...corners.map(p=>p[0])),n.width)||!same(Math.max(...corners.map(p=>p[1])),n.height))return false;
      return n.ports.every(p=>{const q=target.ports.find(q=>q.pin===p.pin);if(!q)return false;const [vx,vy]=direction[q.side],[x,y]=direction[p.side];return same(n.x+m[0]*(q.x-target.x)+m[2]*(q.y-target.y)+m[4],p.x)&&same(n.y+m[1]*(q.x-target.x)+m[3]*(q.y-target.y)+m[5],p.y)&&m[0]*vx+m[2]*vy===x&&m[1]*vx+m[3]*vy===y;});});
    if(!matrix)throw Error('Subcircuits are topologically identical, but target symbol geometry cannot fit the template: '+id+'. No layout was changed.');
    return {...target,x:n.x,y:n.y,width:n.width,height:n.height,ports:n.ports.map(p=>({...p,bit:match.bits.get(p.bit)})),...(!matrix.every((v,i)=>v===[1,0,0,1,0,0][i])||n.editorMatrix?{editorMatrix:matrix}:{})};});
  const snapshot={components,segments:source.segments.map(w=>({...w,bit:match.bits.get(w.bit),a:{...w.a},b:{...w.b}}))};
  if(source.manualGroups?.length)snapshot.manualGroups=source.manualGroups.map(g=>({...g,members:g.members.map(id=>ids.get(id))}));
  if(source.labelOverrides?.length)snapshot.labelOverrides=source.labelOverrides.flatMap(l=>{const owner=ids.get(l.owner);if(!owner)return [];const id=labelId(owner,l.index),text=oldLabels.get(id)??targetLabels.get(id);if(text===undefined)throw Error('Template and target label slots differ.');return [{...l,id,owner,text,orientation:[...l.orientation]}];});
  return restoreProjectScene(targetBase,snapshot,4);
}
