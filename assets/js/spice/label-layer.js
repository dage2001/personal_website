import {labelId,validateLabelOverrides} from './label-model.js';
const ns='http://www.w3.org/2000/svg';
function targets(svg){
  const counts=new Map();return [...svg.querySelectorAll('text')].filter(node=>!node.closest('defs')).map(node=>{const owner=node.closest('g[id^="cell_"]')?.id.slice(5)||'',index=counts.get(owner)||0;counts.set(owner,index+1);return {node,owner,index,id:labelId(owner,index)};});
}
export function validateLabelTargets(svg,labels){
  validateLabelOverrides(labels);const ids=new Set(targets(svg).map(t=>t.id));for(const l of labels||[])if(!ids.has(l.id))throw Error('Invalid project: unknown label '+l.id);
}
export function createLabelLayer(){
  let svg=null,bindings=new Map(),nodes=[],components=new Map(),overrides=new Map(),active=false,selection=new Set(),hitBoxes=new Map();
  const element=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
  function reset(){for(const b of bindings.values())if(b.node.isConnected){for(const a of [...b.node.attributes])b.node.removeAttribute(a.name);for(const [k,v]of b.attributes)b.node.setAttribute(k,v);b.node.textContent=b.text;}svg?.querySelector('[data-label-hit-layer]')?.remove();bindings.clear();nodes=[];}
  function rectangle(node){const b=node.getBBox(),m=svg.getCTM().inverse().multiply(node.getCTM()),ps=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m)),x=Math.min(...ps.map(p=>p.x)),y=Math.min(...ps.map(p=>p.y));return {x,y,width:Math.max(...ps.map(p=>p.x))-x,height:Math.max(...ps.map(p=>p.y))-y};}
  function apply(b,l){
    b.node.textContent=l.text;const box=b.node.getBBox(),[a,c,d,e]=l.orientation,owner=components.get(l.owner)||{x:0,y:0},xs=[0,a*box.width,d*box.height,a*box.width+d*box.height],ys=[0,c*box.width,e*box.height,c*box.width+e*box.height],m=new DOMMatrix([a,c,d,e,owner.x+l.x-Math.min(...xs)-a*box.x-d*box.y,owner.y+l.y-Math.min(...ys)-c*box.x-e*box.y]),p=svg.getCTM().inverse().multiply(b.node.parentElement.getCTM()),parent=new DOMMatrix([p.a,p.b,p.c,p.d,p.e,p.f]),local=parent.inverse().multiply(m);
    b.node.setAttribute('transform','matrix('+[local.a,local.b,local.c,local.d,local.e,local.f].join(' ')+')');
  }
  function hitLayer(){
    svg?.querySelector('[data-label-hit-layer]')?.remove();hitBoxes.clear();if(!active||!svg)return;
    const layer=element('g',{'data-label-hit-layer':'true','data-editor-overlay':'true'});
    for(const n of nodes){const rect=element('rect',{x:n.x-2,y:n.y-2,width:Math.max(8,n.width)+4,height:Math.max(12,n.height)+4,fill:selection.has(n.id)?'#507d9c':'transparent','fill-opacity':selection.has(n.id)?.12:0,stroke:'#507d9c','stroke-opacity':selection.has(n.id)?1:.35,'stroke-width':selection.has(n.id)?1.5:.7,'stroke-dasharray':selection.has(n.id)?'none':'3 3','vector-effect':'non-scaling-stroke','pointer-events':'all','data-editor-label':n.id,...(selection.has(n.id)?{'data-selected-label':n.id}:{})});hitBoxes.set(n.id,rect);layer.append(rect);}
    const air=svg.querySelector('[data-airwires]');if(air)svg.insertBefore(layer,air);else svg.append(layer);
  }
  return {
    reset,
    layout(element,parts,labels,editing,chosen){
      svg=element;components=new Map(parts.map(n=>[n.id,n]));overrides=new Map((labels||[]).map(l=>[l.id,l]));active=editing;selection=chosen;bindings.clear();nodes=[];
      for(const t of targets(svg)){
        const rect=rectangle(t.node),owner=components.get(t.owner)||{x:0,y:0},b={...t,attributes:[...t.node.attributes].map(a=>[a.name,a.value]),text:t.node.textContent,record:{id:t.id,owner:t.owner,index:t.index,text:t.node.textContent,x:rect.x-owner.x,y:rect.y-owner.y,orientation:[1,0,0,1]}};bindings.set(t.id,b);
        const l=overrides.get(t.id);if(l)apply(b,l);t.node.dataset.labelId=t.id;nodes.push({id:t.id,...rectangle(t.node),ports:[]});
      }hitLayer();
      return {x:Math.min(0,...nodes.map(n=>n.x)),y:Math.min(0,...nodes.map(n=>n.y)),right:Math.max(0,...nodes.map(n=>n.x+n.width)),bottom:Math.max(0,...nodes.map(n=>n.y+n.height))};
    },
    nodes:()=>nodes,
    record(id){const b=bindings.get(id);if(!b)throw Error('Label no longer exists.');return structuredClone(overrides.get(id)||b.record);},
    preview(moves){const ids=new Set(moves.map(m=>m.id));for(const m of moves){const b=bindings.get(m.id);if(b){const l=this.record(m.id);apply(b,{...l,x:l.x+m.dx,y:l.y+m.dy});}}nodes=nodes.map(n=>{if(!ids.has(n.id))return n;const next={...n,...rectangle(bindings.get(n.id).node)},rect=hitBoxes.get(n.id);if(rect)for(const [k,v]of Object.entries({x:next.x-2,y:next.y-2,width:Math.max(8,next.width)+4,height:Math.max(12,next.height)+4}))rect.setAttribute(k,v);return next;});}
  };
}
