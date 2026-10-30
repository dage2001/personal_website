import {RoutingScene,pointOnWire} from './routing-model.js';
import {automaticPalette} from './node-colors.js';
const ns='http://www.w3.org/2000/svg',create=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;},equal=(a,b)=>Math.abs(a.x-b.x)<.001&&Math.abs(a.y-b.y)<.001;
export function createInteractiveEditor(preview,$,{changed,inspect,getNetColor}){
  let scene=null,svg=null,enabled=false,working=false,draft=null,ghost=null,selected=-1,revision=0,key='',grid=8,names=new Map(),saved=new Map();
  const point=e=>{const m=svg.getScreenCTM();return scene.snap(new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()));};
  const color=bit=>getNetColor?.(bit)||automaticPalette[Number(bit)%automaticPalette.length];
  const message=text=>{$('editor-status').textContent=text;};
  function stats(){return {unrouted:scene?.airwires().length||0,wires:scene?.segments.length||0,editing:enabled,routing:working};}
  function controls(){const valid=!!scene;for(const id of ['interactive','flywire','auto-route'])$(id).disabled=!svg||working;$('edit-tool').disabled=!valid||working;$('wire-undo').disabled=!valid||working||!scene.undoStack.length;$('wire-redo').disabled=!valid||working||!scene.redoStack.length;preview.classList.toggle('spice-editing',enabled);}
  function notify(){if(!scene)return;const s=stats();message(`${s.unrouted} connection${s.unrouted===1?'':'s'} unrouted · ${s.wires} wire segments${working?' · Auto-routing…':''}`);controls();changed(scene.drawing(),s,scene.bounds());saved.set(key,scene.snapshot());if(saved.size>20)saved.delete(saved.keys().next().value);}
  function drawDraft(cursor=null){svg?.querySelector('[data-route-preview]')?.remove();if(!draft||!svg)return;const points=[...draft.points];if(cursor){const start=points.at(-1);points.push({x:cursor.x,y:start.y},cursor);}const group=create('g',{'data-route-preview':'true','data-editor-overlay':'true','pointer-events':'none'});group.append(create('polyline',{points:points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:color(draft.bit),'stroke-width':1.6,'stroke-dasharray':'4 3','vector-effect':'non-scaling-stroke'}));svg.append(group);const air=svg.querySelector('[data-airwires]');if(air)svg.append(air);}
  function render(){if(!svg||!scene)return;
    for(const n of svg.querySelectorAll('[data-editor-body-hit]'))n.remove();
    for(const n of [...svg.children])if(n.hasAttribute('data-editor-overlay')||n.hasAttribute('data-airwires')||n.hasAttribute('data-manual-state')||n.hasAttribute('data-net')&&['line','circle','path','polyline'].includes(n.localName))n.remove();
    for(const n of scene.components){const g=svg.getElementById('cell_'+n.id);if(g){g.setAttribute('transform',`translate(${n.x},${n.y})`);g.dataset.editorComponent=n.id;if(enabled)g.prepend(create('rect',{x:0,y:0,width:n.width,height:n.height,fill:'transparent',stroke:'none','pointer-events':'all','data-editor-body-hit':'true','data-editor-overlay':'true'}));}}
    const first=svg.querySelector('g[id^="cell_"]'),layer=create('g',{'data-editor-overlay':'true',class:'spice-wire-hit-layer'}),pinLayer=create('g',{'data-editor-overlay':'true',class:'spice-pin-layer'});
    for(const [i,s]of scene.segments.entries()){
      const line=create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,class:'net_'+s.bit,'data-net':names.get(s.bit)||String(s.bit),'stroke-width':i===selected?2.8:1.4});line.append(create('title'));line.firstChild.textContent='Node '+(names.get(s.bit)||s.bit);svg.insertBefore(line,first);
      if(enabled)layer.append(create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,'data-editor-wire':i,stroke:'transparent','stroke-width':9,'vector-effect':'non-scaling-stroke','pointer-events':'stroke'}));
    }
    for(const net of scene.connectivity())for(const p of net.points){const dirs=new Set();for(const s of net.segments)if(pointOnWire(p,s)){if(Math.min(s.a.x,s.b.x)<p.x-.001)dirs.add('w');if(Math.max(s.a.x,s.b.x)>p.x+.001)dirs.add('e');if(Math.min(s.a.y,s.b.y)<p.y-.001)dirs.add('n');if(Math.max(s.a.y,s.b.y)>p.y+.001)dirs.add('s');}if(dirs.size>=3||dirs.size>=2&&net.islands.some(i=>i.pins.some(q=>equal(p,q))))svg.insertBefore(create('circle',{cx:p.x,cy:p.y,r:2,class:'net_'+net.bit,'data-net':names.get(net.bit)||String(net.bit),fill:color(net.bit)}),first);}
    if(enabled){for(const p of scene.pins()){const marker=create('circle',{cx:p.x,cy:p.y,r:3,'data-editor-pin':p.id,'data-editor-bit':p.bit,fill:'#fff',stroke:color(p.bit),'stroke-width':1.5,'vector-effect':'non-scaling-stroke','pointer-events':'all',tabindex:0,role:'button','aria-label':p.owner+' '+p.pin});const title=create('title');title.textContent=p.id+' · '+(names.get(p.bit)||p.bit);marker.append(title);pinLayer.append(marker);}svg.append(layer,pinLayer);}
    drawDraft();
    const air=create('g',{'data-airwires':'true','pointer-events':'none'});for(const a of scene.airwires())air.append(create('line',{x1:a.a.x,y1:a.a.y,x2:a.b.x,y2:a.b.y,stroke:color(a.bit),'stroke-opacity':.75,'stroke-width':.8,'vector-effect':'non-scaling-stroke','data-air-net':a.bit,'data-from-owner':a.a.owner||'','data-to-owner':a.b.owner||''}));svg.append(air);
    const meta=create('metadata',{'data-manual-state':'true'});meta.textContent=JSON.stringify({version:1,grid,unrouted:scene.airwires().length,manual:true});svg.insertBefore(meta,air);notify();
  }
  function startOrEnd(p,bit){
    if(!draft){draft={bit,points:[p]};drawDraft();message('Click grid points for corners, then a pin or wire of the same node. Escape cancels.');return;}
    if(bit!==undefined&&draft.bit!==bit){message('Different nodes cannot be connected. Choose a pin or wire of the same node.');return;}
    const from=draft.points.at(-1),route=scene.findPath(draft.bit,from,p);if(!route){message('No clear grid path. Add a waypoint around the obstacle.');return;}
    if(bit===undefined){draft.points.push(...route.slice(1));drawDraft();return;}
    try{scene.addPath(bit,[...draft.points,...route.slice(1)]);draft=null;render();}catch(error){message(error.message);}
  }
  preview.addEventListener('pointerdown',e=>{
    if(!enabled||working||!scene||!svg||e.button!==0||e.shiftKey)return;
    const pin=e.target.closest('[data-editor-pin]'),wire=e.target.closest('[data-editor-wire]'),component=e.target.closest('[data-editor-component]');
    if(!pin&&!wire&&!component&&!draft)return;e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});
    if(pin){const p=scene.pins().find(p=>p.id===pin.dataset.editorPin);startOrEnd({x:p.x,y:p.y},p.bit);return;}
    if(wire){const i=+wire.dataset.editorWire,s=scene.segments[i];if($('edit-tool').value==='erase'&&!draft){scene.remove(i);selected=-1;render();return;}if(draft||$('edit-tool').value==='route'){const p=point(e);startOrEnd(s.a.x===s.b.x?{x:s.a.x,y:p.y}:{x:p.x,y:s.a.y},s.bit);}else{selected=i;render();message('Wire selected. Delete removes this segment; Route starts a branch from its middle.');}return;}
    if(draft){startOrEnd(point(e));return;}
    if(component){const id=component.dataset.editorComponent,n=scene.components.find(n=>n.id===id);if(!n)return;inspect?.(id);if($('edit-tool').value!=='move')return;ghost={id,n,element:component,x:e.clientX,y:e.clientY,start:point(e),dx:0,dy:0};component.style.opacity='.6';preview.setPointerCapture(e.pointerId);return;}
  },{capture:true});
  preview.addEventListener('pointermove',e=>{if(!enabled||!scene||!svg)return;if(ghost){e.stopImmediatePropagation();const p=point(e);ghost.dx=p.x-ghost.start.x;ghost.dy=p.y-ghost.start.y;ghost.element.setAttribute('transform',`translate(${ghost.n.x+ghost.dx},${ghost.n.y+ghost.dy})`);for(const l of svg.querySelectorAll('[data-airwires] line')){if(l.dataset.fromOwner===ghost.id){l.setAttribute('x1',+l.getAttribute('x1')-Number(l.dataset.dx||0)+ghost.dx);l.setAttribute('y1',+l.getAttribute('y1')-Number(l.dataset.dy||0)+ghost.dy);}if(l.dataset.toOwner===ghost.id){l.setAttribute('x2',+l.getAttribute('x2')-Number(l.dataset.dx||0)+ghost.dx);l.setAttribute('y2',+l.getAttribute('y2')-Number(l.dataset.dy||0)+ghost.dy);}l.dataset.dx=ghost.dx;l.dataset.dy=ghost.dy;}return;}if(draft)drawDraft(point(e));},{capture:true});
  preview.addEventListener('pointerup',e=>{if(!ghost)return;e.preventDefault();e.stopImmediatePropagation();const g=ghost;ghost=null;g.element.style.opacity='';if(preview.hasPointerCapture(e.pointerId))preview.releasePointerCapture(e.pointerId);try{scene.move(g.id,g.dx,g.dy);selected=-1;render();}catch(error){render();message(error.message);}},{capture:true});
  preview.addEventListener('pointercancel',()=>{if(ghost){ghost.element.style.opacity='';ghost=null;render();}});
  preview.addEventListener('keydown',e=>{if(!enabled||!scene)return;const pin=e.target.closest('[data-editor-pin]');if(pin&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();const p=scene.pins().find(p=>p.id===pin.dataset.editorPin);startOrEnd({x:p.x,y:p.y},p.bit);return;}if(e.key==='Escape'&&draft){e.preventDefault();e.stopPropagation();draft=null;render();}else if((e.key==='Delete'||e.key==='Backspace')&&selected>=0){e.preventDefault();scene.remove(selected);selected=-1;render();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?scene.redo():scene.undo();draft=null;render();}},{capture:true});
  async function autoRoute(){if(!scene||working)return;const token=revision;working=true;notify();message('Auto-routing remaining connections…');try{await scene.autoRoute(()=>token!==revision);if(token===revision){draft=null;selected=-1;working=false;render();}}catch(error){if(token===revision){working=false;render();message(error.message);}}}
  return {
    mount(element,drawing,circuit,netlist,settings,{reset=false}={}){revision++;working=false;svg=element;draft=null;ghost=null;selected=-1;grid=settings.gridSize||0;names=new Map(Object.values(circuit.nodes).map(n=>[n.bit,n.name]));if(!drawing||!grid){scene=null;controls();return;}
      const d=structuredClone(drawing);for(const n of d.components){const g=svg.getElementById('cell_'+n.id);for(const p of n.ports){const mark=[...g.children].find(q=>q.getAttribute('s:pid')===p.pin);p.side={top:'NORTH',bottom:'SOUTH',left:'WEST',right:'EAST'}[mark?.getAttribute('s:position')]||p.side;}}for(const [id,c]of Object.entries(netlist.modules.circuit.cells))if(c.attributes.name==='0'){const g=svg.getElementById('cell_'+id),m=g?.transform.baseVal.consolidate().matrix;if(g&&m)d.components.push({id,decoration:true,x:m.e,y:m.f,width:+g.getAttribute('s:width'),height:+g.getAttribute('s:height'),ports:[...g.children].filter(p=>p.hasAttribute('s:pid')).map(p=>({pin:p.getAttribute('s:pid'),x:m.e+Number(p.getAttribute('s:x')),y:m.f+Number(p.getAttribute('s:y')),bit:c.connections[p.getAttribute('s:pid')][0],side:'NORTH'}))});}
      const byName=new Map(Object.values(circuit.nodes).map(n=>[n.name,n.bit])),segments=[...svg.children].filter(n=>n.localName==='line'&&n.hasAttribute('data-net')).map(n=>({bit:byName.get(n.dataset.net),a:{x:+n.getAttribute('x1'),y:+n.getAttribute('y1')},b:{x:+n.getAttribute('x2'),y:+n.getAttribute('y2')}}));scene=new RoutingScene(d,{step:grid,segments});key=JSON.stringify([circuit.topology.signature,settings]);if(!reset&&saved.has(key))scene.restore(saved.get(key));else if($('flywire').checked)scene.clear();enabled=$('interactive').checked;
      if(enabled||!reset&&saved.has(key)||$('flywire').checked)render();else controls();
    },
    invalidate(){revision++;working=false;scene=null;svg=null;draft=null;ghost=null;controls();},
    setEnabled(value){enabled=value;if(!value)draft=null;if(scene)render();else controls();},
    clear(){if(scene){scene.clear();draft=null;render();}},autoRoute,
    undo(){if(scene){draft=null;scene.undo();render();}},redo(){if(scene){draft=null;scene.redo();render();}},
    complete(){return !scene||!working&&scene.airwires().length===0;},working(){return working;},stats,canEdit(){return !!scene;},
    refreshColors(){if(!svg)return;for(const line of svg.querySelectorAll('[data-air-net]'))line.setAttribute('stroke',color(+line.dataset.airNet));for(const pin of svg.querySelectorAll('[data-editor-bit]'))pin.setAttribute('stroke',color(+pin.dataset.editorBit));},
    cleanExport(element){for(const n of element.querySelectorAll('[data-editor-overlay],[data-route-preview]'))n.remove();for(const n of element.querySelectorAll('[data-editor-component]')){n.removeAttribute('data-editor-component');n.style.removeProperty('opacity');}}
  };
}
