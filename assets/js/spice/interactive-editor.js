import {RoutingScene,pointOnWire} from './routing-model.js';
import {automaticPalette} from './node-colors.js';
import {sheetKey,restoreProjectScene} from './project-file.js';
import {selectInBox,arrangeComponents} from './component-selection.js';
const ns='http://www.w3.org/2000/svg',create=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;},equal=(a,b)=>Math.abs(a.x-b.x)<.001&&Math.abs(a.y-b.y)<.001;
export function prepareRoutingDrawing(svg,drawing,circuit,netlist){
  const d=structuredClone(drawing);for(const n of d.components){const g=svg.getElementById('cell_'+n.id);for(const p of n.ports){const mark=[...g.children].find(q=>q.getAttribute('s:pid')===p.pin);p.side={top:'NORTH',bottom:'SOUTH',left:'WEST',right:'EAST'}[mark?.getAttribute('s:position')]||p.side;}}for(const [id,c]of Object.entries(netlist.modules.circuit.cells))if(c.attributes.name==='0'){const g=svg.getElementById('cell_'+id),m=g?.transform.baseVal.consolidate().matrix;if(g&&m)d.components.push({id,decoration:true,x:m.e,y:m.f,width:+g.getAttribute('s:width'),height:+g.getAttribute('s:height'),ports:[...g.children].filter(p=>p.hasAttribute('s:pid')).map(p=>({pin:p.getAttribute('s:pid'),x:m.e+Number(p.getAttribute('s:x')),y:m.f+Number(p.getAttribute('s:y')),bit:c.connections[p.getAttribute('s:pid')][0],side:'NORTH'}))});}
      const byName=new Map(Object.values(circuit.nodes).map(n=>[n.name,n.bit])),segments=[...svg.children].filter(n=>n.localName==='line'&&n.hasAttribute('data-net')).map(n=>({bit:byName.get(n.dataset.net),a:{x:+n.getAttribute('x1'),y:+n.getAttribute('y1')},b:{x:+n.getAttribute('x2'),y:+n.getAttribute('y2')}}));
  return {...d,segments};
}
export function createInteractiveEditor(preview,$,{changed,inspect,getNetColor}){
  let scene=null,svg=null,enabled=false,working=false,draft=null,ghost=null,marquee=null,cursor=null,selection=new Set(),revision=0,key='',grid=8,names=new Map(),saved=new Map(),originals=new Map();
  const rawPoint=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const point=e=>scene.snap(rawPoint(e));
  const color=bit=>getNetColor?.(bit)||automaticPalette[Number(bit)%automaticPalette.length];
  const message=text=>{$('editor-status').textContent=text;};
  function stats(){return {unrouted:scene?.airwires().length||0,wires:scene?.segments.length||0,editing:enabled,routing:working,selectedComponents:[...selection]};}
  function controls(){const valid=!!scene;for(const id of ['interactive','flywire','auto-route'])$(id).disabled=!svg||working;$('edit-tool').disabled=!valid||working;for(const b of document.querySelectorAll('[data-editor-mode]')){b.disabled=!svg||working;b.setAttribute('aria-pressed',String(enabled&&b.dataset.editorMode===$('edit-tool').value));}for(const b of document.querySelectorAll('[data-editor-arrange]'))b.disabled=!enabled||!valid||working||selection.size<(b.dataset.editorArrange.startsWith('space-')?3:2);$('wire-undo').disabled=!valid||working||!scene.undoStack.length;$('wire-redo').disabled=!valid||working||!scene.redoStack.length;preview.classList.toggle('spice-editing',enabled);preview.dataset.toolMode=enabled?$('edit-tool').value:'none';}
  function glyph(n,g){const original=originals.get(n.id);if(!original)return;g.replaceChildren(...original.children.map(c=>c.cloneNode(true)));if(n.editorMatrix){const m=n.editorMatrix,inner=create('g',{transform:'matrix('+m.join(' ')+')','data-editor-glyph':'true'});inner.append(...g.childNodes);for(const t of inner.querySelectorAll('text'))t.remove();g.append(inner);for(const [i,label]of original.labels.entries()){const t=label.node.cloneNode(true);t.removeAttribute('transform');let x=m[0]*label.x+m[2]*label.y+m[4],y=m[1]*label.x+m[3]*label.y+m[5];if(n.ports.length===2&&original.labels.length===2){const horizontal=Math.abs(n.ports[0].y-n.ports[1].y)<.001;x=horizontal?n.width/2:n.ports[0].x-n.x+20;y=horizontal?n.ports[0].y-n.y-26+i*16:n.height/2-8+i*16;t.setAttribute('text-anchor',horizontal?'middle':'start');}t.setAttribute('x',x);t.setAttribute('y',y);g.append(t);}}}
  function chooseTool(mode){draft=null;marquee=null;ghost=null;if(['rotate','mirror-x','mirror-y'].includes(mode)&&selection.size===1){try{scene.transform([...selection][0],mode);render();}catch(error){message(error.message);}return;}$('edit-tool').value=mode;if(scene)render();else controls();}
  function notify(){if(!scene)return;const s=stats();message(`${selection.size?selection.size+' selected · ':''}${s.unrouted} connection${s.unrouted===1?'':'s'} unrouted · ${s.wires} wire segments${working?' · Auto-routing…':''}`);controls();changed(scene.drawing(),s,scene.bounds());saved.set(key,scene.snapshot());}
  function overlay(group){const air=svg.querySelector('[data-airwires]');if(air)svg.insertBefore(group,air);else svg.append(group);}
  function drawDraft(){
    svg?.querySelector('[data-route-preview]')?.remove();svg?.querySelector('[data-route-guides]')?.remove();if(!svg)return;
    if(enabled&&$('edit-tool').value==='route'&&cursor){
      const r=preview.getBoundingClientRect(),inverse=svg.getScreenCTM().inverse(),a=new DOMPoint(r.left,r.top).matrixTransform(inverse),b=new DOMPoint(r.right,r.bottom).matrixTransform(inverse),guide=create('g',{'data-route-guides':'true','data-editor-overlay':'true','pointer-events':'none',stroke:'#507d9c','stroke-opacity':.65,'stroke-width':.8,'stroke-dasharray':'5 4'});
      guide.append(create('line',{x1:a.x,y1:cursor.y,x2:b.x,y2:cursor.y,'vector-effect':'non-scaling-stroke'}),create('line',{x1:cursor.x,y1:a.y,x2:cursor.x,y2:b.y,'vector-effect':'non-scaling-stroke'}));overlay(guide);
    }
    if(!draft)return;const points=[...draft.points];if(cursor){const start=points.at(-1);points.push({x:cursor.x,y:start.y},cursor);}const group=create('g',{'data-route-preview':'true','data-waypoints':draft.checkpoints.length,'data-editor-overlay':'true','pointer-events':'none'});group.append(create('polyline',{points:points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:color(draft.bit),'stroke-width':1.6,'stroke-dasharray':'4 3','vector-effect':'non-scaling-stroke'}));overlay(group);
  }
  function drawMarquee(){svg?.querySelector('[data-selection-box]')?.remove();if(!marquee||!svg)return;const a=marquee.start,b=marquee.end,crossing=b.x<a.x;overlay(create('rect',{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y),fill:crossing?'#4c9675':'#507d9c','fill-opacity':.12,stroke:crossing?'#4c9675':'#507d9c','stroke-dasharray':crossing?'5 3':'none','stroke-width':1,'vector-effect':'non-scaling-stroke','data-selection-box':crossing?'crossing':'window','data-editor-overlay':'true','pointer-events':'none'}));}
  function render(){if(!svg||!scene)return;
    for(const n of svg.querySelectorAll('[data-editor-body-hit]'))n.remove();
    for(const n of [...svg.children])if(n.hasAttribute('data-editor-overlay')||n.hasAttribute('data-airwires')||n.hasAttribute('data-manual-state')||n.hasAttribute('data-net')&&['line','circle','path','polyline'].includes(n.localName))n.remove();
    for(const n of scene.components){const g=svg.getElementById('cell_'+n.id);if(g){g.style.removeProperty('opacity');glyph(n,g);g.setAttribute('s:width',n.width);g.setAttribute('s:height',n.height);g.setAttribute('transform',`translate(${n.x},${n.y})`);g.dataset.editorComponent=n.id;if(enabled)g.prepend(create('rect',{x:0,y:0,width:n.width,height:n.height,fill:'transparent',stroke:'none','pointer-events':'all','data-editor-body-hit':'true','data-editor-overlay':'true'}));}}
    const first=svg.querySelector('g[id^="cell_"]'),layer=create('g',{'data-editor-overlay':'true',class:'spice-wire-hit-layer'}),pinLayer=create('g',{'data-editor-overlay':'true',class:'spice-pin-layer'});
    for(const [i,s]of scene.segments.entries()){
      const line=create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,class:'net_'+s.bit,'data-net':names.get(s.bit)||String(s.bit),'stroke-width':1.4});line.append(create('title'));line.firstChild.textContent='Node '+(names.get(s.bit)||s.bit);svg.insertBefore(line,first);
      if(enabled&&['route','erase'].includes($('edit-tool').value))layer.append(create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,'data-editor-wire':i,stroke:'transparent','stroke-width':9,'vector-effect':'non-scaling-stroke','pointer-events':'stroke'}));
    }
    for(const net of scene.connectivity())for(const p of net.points){const dirs=new Set();for(const s of net.segments)if(pointOnWire(p,s)){if(Math.min(s.a.x,s.b.x)<p.x-.001)dirs.add('w');if(Math.max(s.a.x,s.b.x)>p.x+.001)dirs.add('e');if(Math.min(s.a.y,s.b.y)<p.y-.001)dirs.add('n');if(Math.max(s.a.y,s.b.y)>p.y+.001)dirs.add('s');}if(dirs.size>=3||dirs.size>=2&&net.islands.some(i=>i.pins.some(q=>equal(p,q))))svg.insertBefore(create('circle',{cx:p.x,cy:p.y,r:2,class:'net_'+net.bit,'data-net':names.get(net.bit)||String(net.bit),fill:color(net.bit)}),first);}
    if(enabled){for(const n of scene.components.filter(n=>selection.has(n.id)))layer.append(create('rect',{x:n.x-3,y:n.y-3,width:n.width+6,height:n.height+6,fill:'none',stroke:'#507d9c','stroke-dasharray':'3 3','stroke-width':1,'vector-effect':'non-scaling-stroke','pointer-events':'none','data-selected-component':n.id}));for(const p of scene.pins()){const marker=create('circle',{cx:p.x,cy:p.y,r:3,'data-editor-pin':p.id,'data-editor-bit':p.bit,fill:'#fff',stroke:color(p.bit),'stroke-width':1.5,'vector-effect':'non-scaling-stroke','pointer-events':$('edit-tool').value==='route'?'all':'none',tabindex:$('edit-tool').value==='route'?0:-1,role:'button','aria-label':p.owner+' '+p.pin});const title=create('title');title.textContent=p.id+' · '+(names.get(p.bit)||p.bit);marker.append(title);pinLayer.append(marker);}svg.append(layer,pinLayer);}
    drawDraft();
    const air=create('g',{'data-airwires':'true','pointer-events':'none'});for(const a of scene.airwires())air.append(create('line',{x1:a.a.x,y1:a.a.y,x2:a.b.x,y2:a.b.y,stroke:color(a.bit),'stroke-opacity':.75,'stroke-width':.8,'vector-effect':'non-scaling-stroke','data-air-net':a.bit,'data-from-owner':a.a.owner||'','data-to-owner':a.b.owner||''}));svg.append(air);
    const meta=create('metadata',{'data-manual-state':'true'});meta.textContent=JSON.stringify({version:1,grid,unrouted:scene.airwires().length,manual:true});svg.insertBefore(meta,air);notify();
  }
  function startOrEnd(p,bit){
    if(!draft){draft={bit,points:[p],checkpoints:[]};drawDraft();message('Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.');return;}
    if(bit!==undefined&&draft.bit!==bit){message('Different nodes cannot be connected. Choose a pin or wire of the same node.');return;}
    const from=draft.points.at(-1),route=scene.findPath(draft.bit,from,p);if(!route){message('No clear grid path. Add a waypoint around the obstacle.');return;}
    if(bit===undefined){if(route.length>1){draft.checkpoints.push(draft.points.length);draft.points.push(...route.slice(1));}drawDraft();return;}
    try{scene.addPath(bit,[...draft.points,...route.slice(1)]);draft=null;render();}catch(error){message(error.message);}
  }
  preview.addEventListener('pointerdown',e=>{
    if(!enabled||working||!scene||!svg||e.button!==0||e.shiftKey)return;
    const mode=$('edit-tool').value,pin=e.target.closest('[data-editor-pin]'),wire=e.target.closest('[data-editor-wire]');
    const pinModel=pin&&scene.pins().find(p=>p.id===pin.dataset.editorPin),component=e.target.closest('[data-editor-component]')||(pinModel&&svg.getElementById('cell_'+pinModel.owner));
    const n=component&&scene.components.find(n=>n.id===component.dataset.editorComponent&&!n.decoration);
    if(mode==='box'){
      e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});
      marquee={start:rawPoint(e),end:rawPoint(e),additive:e.ctrlKey||e.metaKey};preview.setPointerCapture(e.pointerId);drawMarquee();return;
    }
    if(mode==='route'||mode==='erase'){
      e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});cursor=point(e);
      if(mode==='erase'){if(wire){scene.remove(+wire.dataset.editorWire);render();}return;}
      if(pinModel){startOrEnd({x:pinModel.x,y:pinModel.y},pinModel.bit);return;}
      if(wire){const s=scene.segments[+wire.dataset.editorWire],p=point(e);startOrEnd(s.a.x===s.b.x?{x:s.a.x,y:p.y}:{x:p.x,y:s.a.y},s.bit);return;}
      if(draft)startOrEnd(point(e));else drawDraft();return;
    }
    if(!n){if(selection.size){selection.clear();render();}return;}
    e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});inspect?.(n.id);
    if(e.ctrlKey||e.metaKey){selection.has(n.id)?selection.delete(n.id):selection.add(n.id);render();return;}
    if(mode!=='move'||!selection.has(n.id))selection=new Set([n.id]);
    if(['rotate','mirror-x','mirror-y'].includes(mode)){chooseTool(mode);return;}
    render();if(mode!=='move')return;
    ghost={entries:scene.components.filter(n=>selection.has(n.id)).map(n=>({n,element:svg.getElementById('cell_'+n.id)})),start:rawPoint(e),dx:0,dy:0};
    for(const g of ghost.entries)g.element.style.opacity='.6';preview.setPointerCapture(e.pointerId);
  },{capture:true});
  preview.addEventListener('pointermove',e=>{
    if(!enabled||!scene||!svg)return;cursor=point(e);
    if(marquee){e.stopImmediatePropagation();marquee.end=rawPoint(e);drawMarquee();return;}
    if(ghost){
      e.stopImmediatePropagation();const p=rawPoint(e),delta=scene.snap({x:p.x-ghost.start.x,y:p.y-ghost.start.y});ghost.dx=delta.x;ghost.dy=delta.y;
      for(const {n,element}of ghost.entries){element.setAttribute('transform',`translate(${n.x+delta.x},${n.y+delta.y})`);const outline=svg.querySelector('[data-selected-component="'+CSS.escape(n.id)+'"]');if(outline){outline.setAttribute('x',n.x+delta.x-3);outline.setAttribute('y',n.y+delta.y-3);}}
      for(const l of svg.querySelectorAll('[data-airwires] line')){
        if(selection.has(l.dataset.fromOwner)){l.setAttribute('x1',+l.getAttribute('x1')-Number(l.dataset.dx||0)+delta.x);l.setAttribute('y1',+l.getAttribute('y1')-Number(l.dataset.dy||0)+delta.y);}
        if(selection.has(l.dataset.toOwner)){l.setAttribute('x2',+l.getAttribute('x2')-Number(l.dataset.dx||0)+delta.x);l.setAttribute('y2',+l.getAttribute('y2')-Number(l.dataset.dy||0)+delta.y);}
        l.dataset.dx=delta.x;l.dataset.dy=delta.y;
      }return;
    }
    if($('edit-tool').value==='route')drawDraft();
  },{capture:true});
  preview.addEventListener('pointerup',e=>{
    if(!marquee&&!ghost)return;e.preventDefault();e.stopImmediatePropagation();
    if(preview.hasPointerCapture(e.pointerId))preview.releasePointerCapture(e.pointerId);
    if(marquee){const m=marquee;marquee=null;const ids=selectInBox(scene.components,m.start,rawPoint(e));selection=m.additive?new Set([...selection,...ids]):new Set(ids);render();return;}
    const g=ghost;ghost=null;for(const e of g.entries)e.element.style.opacity='';
    try{scene.moveMany(g.entries.map(({n})=>({id:n.id,dx:g.dx,dy:g.dy})));render();}catch(error){render();message(error.message);}
  },{capture:true});
  preview.addEventListener('pointercancel',()=>{if(ghost||marquee){ghost=null;marquee=null;render();}});
  preview.addEventListener('pointerleave',()=>{if(!ghost&&!marquee){cursor=null;drawDraft();}});
  preview.addEventListener('wheel',e=>{requestAnimationFrame(()=>{if(enabled&&scene&&svg&&$('edit-tool').value==='route'){cursor=point(e);drawDraft();}});},{passive:true});
  document.addEventListener('keydown',e=>{
    if($('download-dialog').open||!enabled||!scene||working||e.target.closest('input,textarea,select,[contenteditable="true"]')||!$('app').contains(e.target))return;
    const pin=e.target.closest('[data-editor-pin]'),k=e.key.toLowerCase();
    if(pin&&$('edit-tool').value==='route'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();const p=scene.pins().find(p=>p.id===pin.dataset.editorPin);startOrEnd({x:p.x,y:p.y},p.bit);return;}
    if(e.key==='Backspace'&&$('edit-tool').value==='route'){
      e.preventDefault();e.stopImmediatePropagation();if(draft){const length=draft.checkpoints.pop();if(length===undefined)draft=null;else draft.points.length=length;drawDraft();message(draft?'Last waypoint removed.':'Route start removed. Choose a pin to begin.');}return;
    }
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();draft=null;ghost=null;marquee=null;chooseTool('select');}
    else if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();e.stopImmediatePropagation();e.shiftKey?scene.redo():scene.undo();draft=null;ghost=null;marquee=null;render();}
    else if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&{s:'select',b:'box',v:'move',w:'route',d:'erase',r:'rotate',x:'mirror-x',y:'mirror-y'}[k]){e.preventDefault();e.stopImmediatePropagation();chooseTool({s:'select',b:'box',v:'move',w:'route',d:'erase',r:'rotate',x:'mirror-x',y:'mirror-y'}[k]);}
  },{capture:true});
  function arrange(action){
    if(!scene||working)return;
    draft=null;ghost=null;marquee=null;$('edit-tool').value='select';
    try{const {moves,rounded}=arrangeComponents(scene.components,selection,action,grid);scene.moveMany(moves);render();message(`${selection.size} components arranged.${rounded?' Centers or gaps rounded to the '+grid+'-unit pin grid.':''} Detached connections remain flywires.`);}
    catch(error){render();message(error.message);}
  }

  async function autoRoute(){if(!scene||working)return;const token=revision;working=true;notify();message('Auto-routing remaining connections…');try{await scene.autoRoute(()=>token!==revision);if(token===revision){draft=null;working=false;render();}}catch(error){if(token===revision){working=false;render();message(error.message);}}}
  return {
    mount(element,drawing,circuit,netlist,settings,{reset=false,scope=''}={}){revision++;working=false;svg=element;draft=null;ghost=null;marquee=null;cursor=null;selection.clear();originals=new Map();for(const g of svg.querySelectorAll('g[id^="cell_"]')){const inverse=g.getCTM().inverse();originals.set(g.id.slice(5),{children:[...g.childNodes].map(n=>n.cloneNode(true)),labels:[...g.querySelectorAll('text')].map(t=>{const p=new DOMPoint(+t.getAttribute('x')||0,+t.getAttribute('y')||0).matrixTransform(inverse.multiply(t.getCTM()));return {node:t.cloneNode(true),x:p.x,y:p.y};})});}grid=settings.gridSize||0;names=new Map(Object.values(circuit.nodes).map(n=>[n.bit,n.name]));if(!drawing||!grid){scene=null;controls();return;}
      const d=prepareRoutingDrawing(svg,drawing,circuit,netlist),segments=d.segments;scene=new RoutingScene(d,{step:grid,segments});key=sheetKey(scope,circuit.topology.signature,settings);if(!reset&&saved.has(key))scene.restore(restoreProjectScene({...d,segments},saved.get(key),grid));else if($('flywire').checked)scene.clear();enabled=$('interactive').checked;
      if(enabled||!reset&&saved.has(key)||$('flywire').checked)render();else controls();
    },
    invalidate(){if(scene&&!working)saved.set(key,scene.snapshot());revision++;working=false;scene=null;svg=null;draft=null;ghost=null;marquee=null;cursor=null;selection.clear();controls();},
    snapshotSheets(){if(scene&&!working)saved.set(key,scene.snapshot());return [...saved].map(([key,snapshot])=>{const [scope,topology,settings]=JSON.parse(key);return {scope,topology,settings,snapshot:structuredClone(snapshot)};});},
    restoreSheets(sheets){saved=new Map(sheets.map(s=>[sheetKey(s.scope,s.topology,s.settings),structuredClone(s.snapshot)]));},
    clearSheets(){saved.clear();},
    setEnabled(value){enabled=value;if(!value){draft=null;ghost=null;marquee=null;cursor=null;selection.clear();}if(scene)render();else controls();},
    clear(){if(scene){scene.clear();draft=null;render();}},autoRoute,chooseTool,arrange,
    undo(){if(scene){draft=null;ghost=null;marquee=null;scene.undo();render();}},redo(){if(scene){draft=null;ghost=null;marquee=null;scene.redo();render();}},
    complete(){return !scene||!working&&scene.airwires().length===0;},working(){return working;},stats,canEdit(){return !!scene;},
    refreshColors(){if(!svg)return;for(const line of svg.querySelectorAll('[data-air-net]'))line.setAttribute('stroke',color(+line.dataset.airNet));for(const pin of svg.querySelectorAll('[data-editor-bit]'))pin.setAttribute('stroke',color(+pin.dataset.editorBit));},
    cleanExport(element){for(const n of element.querySelectorAll('[data-editor-overlay],[data-route-preview]'))n.remove();for(const n of element.querySelectorAll('[data-editor-component]')){n.removeAttribute('data-editor-component');n.style.removeProperty('opacity');}}
  };
}
