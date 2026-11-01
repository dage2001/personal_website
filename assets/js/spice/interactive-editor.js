import checkIcon from './icons/circle-check.svg?raw';
import {expandGroupSelection,selectedGroup,manualUnits} from './manual-groups.js';
import {createLabelLayer,validateLabelTargets} from './label-layer.js';
import {transformLabel} from './label-model.js';
import {RoutingScene,pointOnWire} from './routing-model.js';
import {automaticPalette} from './node-colors.js';
import {sheetKey,restoreProjectScene} from './project-file.js';
import {selectInBox,arrangeComponents,isSelectableComponent} from './component-selection.js';
const ns='http://www.w3.org/2000/svg',create=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;},equal=(a,b)=>Math.abs(a.x-b.x)<.001&&Math.abs(a.y-b.y)<.001;
export function prepareRoutingDrawing(svg,drawing,circuit,netlist){
  const d=structuredClone(drawing);for(const n of d.components){const g=svg.getElementById('cell_'+n.id);for(const p of n.ports){const mark=[...g.children].find(q=>q.getAttribute('s:pid')===p.pin);p.side={top:'NORTH',bottom:'SOUTH',left:'WEST',right:'EAST'}[mark?.getAttribute('s:position')]||p.side;}}for(const [id,c]of Object.entries(netlist.modules.circuit.cells))if(c.attributes.name==='0'){const g=svg.getElementById('cell_'+id),m=g?.transform.baseVal.consolidate().matrix;if(g&&m)d.components.push({id,decoration:true,selectable:true,x:m.e,y:m.f,width:+g.getAttribute('s:width'),height:+g.getAttribute('s:height'),ports:[...g.children].filter(p=>p.hasAttribute('s:pid')).map(p=>({pin:p.getAttribute('s:pid'),x:m.e+Number(p.getAttribute('s:x')),y:m.f+Number(p.getAttribute('s:y')),bit:c.connections[p.getAttribute('s:pid')][0],side:'NORTH'}))});}
      const byName=new Map(Object.values(circuit.nodes).map(n=>[n.name,n.bit])),segments=[...svg.children].filter(n=>n.localName==='line'&&n.hasAttribute('data-net')).map(n=>({bit:byName.get(n.dataset.net),a:{x:+n.getAttribute('x1'),y:+n.getAttribute('y1')},b:{x:+n.getAttribute('x2'),y:+n.getAttribute('y2')}}));
  return {...d,segments};
}
export function createInteractiveEditor(preview,$,{changed,inspect,getNetColor,report,applyLayoutTemplate}){
  let scene=null,svg=null,enabled=false,working=false,draft=null,ghost=null,marquee=null,cursor=null,selection=new Set(),revision=0,key='',grid=8,names=new Map(),saved=new Map(),originals=new Map();
  let labelMode=false,labelDrag=null,labelBox=null,labelClick=null,labelPointer=null,editingLabel='';const labelLayer=createLabelLayer();
  let brushSource='',blockInstances=new Map(),templateSources=new Map();
  const rawPoint=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const point=e=>scene.snap(rawPoint(e));
  const color=bit=>getNetColor?.(bit)||automaticPalette[Number(bit)%automaticPalette.length];
  const message=(text,{severity='info',log=true}={})=>{$('editor-status').textContent=text;if(log)report?.({message:text,severity,category:'Tools'});};
  function stats(){return {unrouted:scene?.airwires().length||0,wires:scene?.segments.length||0,editing:enabled,routing:working,selectedComponents:labelMode?[]:[...selection],selectedLabels:labelMode?[...selection]:[],labelEditing:labelMode};}
  function canHistory(stack){if(!stack.length)return false;if(!labelMode)return true;const previous=stack.at(-1);return JSON.stringify(previous.components)===JSON.stringify(scene.components)&&JSON.stringify(previous.segments)===JSON.stringify(scene.segments)&&JSON.stringify(previous.manualGroups||[])===JSON.stringify(scene.manualGroups||[]);}
  function controls(){
    const valid=!!scene,locked=working||!!brushSource,group=scene&&!labelMode&&selectedGroup(selection,scene.manualGroups);
    const brush=$('layout-brush'),source=selection.size===1&&blockInstances.has([...selection][0]);
    brush.disabled=!enabled||!valid||working||labelMode||(!brushSource&&(!source||$('edit-tool').value!=='select'));brush.setAttribute('aria-pressed',String(!!brushSource));brush.title=brushSource?'Exit layout format brush (Escape)':"Copy the selected subcircuit's internal layout";
    $('group').disabled=!enabled||!valid||locked||labelMode||selection.size<2;$('group').setAttribute('aria-pressed',String(!!group));$('group').title=group?'Ungroup selected components (Ctrl+G or Ctrl+Shift+G)':'Group selected components (Ctrl+G)';$('group').setAttribute('aria-label',$('group').title);
    for(const id of ['interactive','flywire','auto-route'])$(id).disabled=!svg||locked||(labelMode&&id!=='interactive');$('label-edit').disabled=!svg||locked;$('label-edit').setAttribute('aria-pressed',String(enabled&&labelMode));$('edit-tool').disabled=!valid||locked;
    for(const b of document.querySelectorAll('[data-editor-mode]')){b.disabled=!svg||locked||(labelMode&&['route','erase'].includes(b.dataset.editorMode));b.setAttribute('aria-pressed',String(enabled&&b.dataset.editorMode===$('edit-tool').value));}
    const count=labelMode?selection.size:scene?manualUnits(scene.components,scene.manualGroups).filter(n=>n.members.some(id=>selection.has(id))).length:0;
    for(const b of document.querySelectorAll('[data-editor-arrange]'))b.disabled=!enabled||!valid||locked||count<(b.dataset.editorArrange.startsWith('space-')?3:2);
    $('wire-undo').disabled=!valid||locked||!canHistory(scene.undoStack);$('wire-redo').disabled=!valid||locked||!canHistory(scene.redoStack);preview.classList.toggle('spice-editing',enabled);preview.dataset.toolMode=brushSource?'layout-brush':enabled?$('edit-tool').value:'none';preview.dataset.labelEditing=String(enabled&&labelMode);
  }
  function templateFor(scope){const settings=JSON.stringify(JSON.parse(key)[2]);return [...templateSources].find(([k])=>{const p=JSON.parse(k);return p[0]===scope&&JSON.stringify(p[2])===settings;})?.[1];}
  function brushOverlay(){
    for(const n of svg.querySelectorAll('[data-brush-dimmed]')){n.style.removeProperty('opacity');n.removeAttribute('data-brush-dimmed');}
    const layer=create('g',{'data-editor-overlay':'true','data-layout-brush-layer':'true','pointer-events':'none'});
    if(brushSource){for(const element of [...svg.children])if(element.hasAttribute('data-net')){element.style.opacity='.18';element.setAttribute('data-brush-dimmed','true');}
      for(const n of scene.components){if(!blockInstances.has(n.id)){const g=svg.getElementById('cell_'+n.id);g.style.opacity='.18';g.setAttribute('data-brush-dimmed','true');continue;}
        const source=n.id===brushSource;layer.append(create('rect',{x:n.x-4,y:n.y-4,width:n.width+8,height:n.height+8,fill:'none',stroke:source?'#507d9c':'#65a583','stroke-width':2,'vector-effect':'non-scaling-stroke','data-brush-block':n.id}));}}
    const check=new DOMParser().parseFromString(checkIcon,'image/svg+xml').documentElement;
    for(const n of scene.components){const from=blockInstances.has(n.id)&&templateFor(blockInstances.get(n.id));if(!from)continue;const badge=create('g',{'data-layout-template-applied':n.id,transform:'translate('+(n.x+n.width-12)+','+(n.y-12)+') scale(.75)',stroke:'#367757','stroke-width':2,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'});const title=create('title');title.textContent='Layout copied from '+from;badge.append(title,create('circle',{cx:12,cy:12,r:12,fill:'white',stroke:'none'}),...[...check.children].map(c=>c.cloneNode(true)));layer.append(badge);}
    svg.append(layer);
  }
  function toggleLayoutBrush(){if(!scene||working||labelMode)return;if(brushSource){brushSource='';render();message('Layout format brush cancelled.');return;}const id=selection.size===1&&[...selection][0];if(!enabled||$('edit-tool').value!=='select'||!blockInstances.has(id))return;brushSource=id;draft=null;ghost=null;marquee=null;render();message('Choose a target subcircuit block. Escape exits the layout format brush.');}
  async function paintLayout(id){if(working||id===brushSource)return;const source=brushSource,token=revision;working=true;controls();message('Checking subcircuit structures…');try{await applyLayoutTemplate(blockInstances.get(source),blockInstances.get(id),()=>token===revision&&brushSource===source);if(token!==revision)return;working=false;render();message('Layout applied from '+source+' to '+id+'.');}catch(error){if(token!==revision)return;working=false;render();message(error.message,{severity:'error'});}}

  function glyph(n,g){const original=originals.get(n.id);if(!original)return;g.replaceChildren(...original.children.map(c=>c.cloneNode(true)));if(n.editorMatrix){const m=n.editorMatrix,inner=create('g',{transform:'matrix('+m.join(' ')+')','data-editor-glyph':'true'});inner.append(...g.childNodes);for(const t of inner.querySelectorAll('text'))t.remove();g.append(inner);for(const [i,label]of original.labels.entries()){const t=label.node.cloneNode(true);t.removeAttribute('transform');let x=m[0]*label.x+m[2]*label.y+m[4],y=m[1]*label.x+m[3]*label.y+m[5];if(n.ports.length===2&&original.labels.length===2){const horizontal=Math.abs(n.ports[0].y-n.ports[1].y)<.001;x=horizontal?n.width/2:n.ports[0].x-n.x+20;y=horizontal?n.ports[0].y-n.y-26+i*16:n.height/2-8+i*16;t.setAttribute('text-anchor',horizontal?'middle':'start');}t.setAttribute('x',x);t.setAttribute('y',y);g.append(t);}}}
  function chooseTool(mode){brushSource='';labelClick=null;draft=null;marquee=null;ghost=null;labelDrag=null;labelBox=null;if(labelMode&&['route','erase'].includes(mode)){message('Components and wires are locked in label mode.',{severity:'warning'});return;}if(labelMode&&['rotate','mirror-x','mirror-y'].includes(mode)&&selection.size){commitLabels([...selection].map(id=>transformLabel(labelLayer.record(id),mode)));message(mode+' applied to '+selection.size+' label(s).');return;}if(!labelMode&&['rotate','mirror-x','mirror-y'].includes(mode)&&selectedGroup(selection,scene.manualGroups)){try{scene.transformGroup(selectedGroup(selection,scene.manualGroups).id,mode);render();message('Manual group '+mode+' applied.');}catch(error){message(error.message,{severity:'error'});}return;}if(['rotate','mirror-x','mirror-y'].includes(mode)&&selection.size===1){try{scene.transform([...selection][0],mode);render();message(mode+' applied to '+[...selection][0]+'.');}catch(error){message(error.message,{severity:'error'});}return;}$('edit-tool').value=mode;if(scene){render();message('Tool: '+mode+'.');}else controls();}
  function notify(){if(!scene)return;const s=stats();message(`${selection.size?selection.size+' selected · ':''}${s.unrouted} connection${s.unrouted===1?'':'s'} unrouted · ${s.wires} wire segments${working?' · Auto-routing…':''}`,{log:false});controls();changed(scene.drawing(),s,scene.bounds());const snapshot=scene.snapshot();if(saved.has(key)&&JSON.stringify(saved.get(key))!==JSON.stringify(snapshot)){const [scope,,settings]=JSON.parse(key);for(const k of templateSources.keys()){const [target,,configuration]=JSON.parse(k);if((scope===target||scope.startsWith(target+'/'))&&JSON.stringify(settings)===JSON.stringify(configuration))templateSources.delete(k);}}saved.set(key,snapshot);}
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
    for(const n of scene.components){const g=svg.getElementById('cell_'+n.id);if(g){g.style.removeProperty('opacity');glyph(n,g);g.setAttribute('s:width',n.width);g.setAttribute('s:height',n.height);g.setAttribute('transform',`translate(${n.x},${n.y})`);g.dataset.editorComponent=n.id;if(enabled&&!labelMode)g.prepend(create('rect',{x:0,y:0,width:n.width,height:n.height,fill:'transparent',stroke:'none','pointer-events':'all','data-editor-body-hit':'true','data-editor-overlay':'true'}));}}
    if(enabled&&!working&&!labelMode){const groups=create('g',{'data-editor-overlay':'true','data-manual-group-layer':'true'});for(const n of manualUnits(scene.components,scene.manualGroups).filter(n=>n.groupId)){const selected=n.members.every(id=>selection.has(id));groups.append(create('rect',{x:n.x,y:n.y,width:n.width,height:n.height,fill:'transparent',stroke:selected?'#507d9c':'#89958c','stroke-width':selected?1.5:.8,'stroke-dasharray':'5 3','vector-effect':'non-scaling-stroke','pointer-events':['route','erase'].includes($('edit-tool').value)?'none':'all','data-editor-group':n.groupId}));}svg.insertBefore(groups,svg.querySelector('g[id^="cell_"]'));}
    const first=svg.querySelector('g[id^="cell_"]'),layer=create('g',{'data-editor-overlay':'true',class:'spice-wire-hit-layer'}),pinLayer=create('g',{'data-editor-overlay':'true',class:'spice-pin-layer'});
    for(const [i,s]of scene.segments.entries()){
      const line=create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,class:'net_'+s.bit,'data-net':names.get(s.bit)||String(s.bit),'stroke-width':1.4});line.append(create('title'));line.firstChild.textContent='Node '+(names.get(s.bit)||s.bit);svg.insertBefore(line,first);
      if(enabled&&!labelMode&&['route','erase'].includes($('edit-tool').value))layer.append(create('line',{x1:s.a.x,y1:s.a.y,x2:s.b.x,y2:s.b.y,'data-editor-wire':i,stroke:'transparent','stroke-width':9,'vector-effect':'non-scaling-stroke','pointer-events':'stroke'}));
    }
    for(const net of scene.connectivity())for(const p of net.points){const dirs=new Set();for(const s of net.segments)if(pointOnWire(p,s)){if(Math.min(s.a.x,s.b.x)<p.x-.001)dirs.add('w');if(Math.max(s.a.x,s.b.x)>p.x+.001)dirs.add('e');if(Math.min(s.a.y,s.b.y)<p.y-.001)dirs.add('n');if(Math.max(s.a.y,s.b.y)>p.y+.001)dirs.add('s');}if(dirs.size>=3||dirs.size>=2&&net.islands.some(i=>i.pins.some(q=>equal(p,q))))svg.insertBefore(create('circle',{cx:p.x,cy:p.y,r:2,class:'net_'+net.bit,'data-net':names.get(net.bit)||String(net.bit),fill:color(net.bit)}),first);}
    if(enabled&&!labelMode){for(const n of scene.components.filter(n=>selection.has(n.id)))layer.append(create('rect',{x:n.x-3,y:n.y-3,width:n.width+6,height:n.height+6,fill:'none',stroke:'#507d9c','stroke-dasharray':'3 3','stroke-width':1,'vector-effect':'non-scaling-stroke','pointer-events':'none','data-selected-component':n.id}));for(const p of scene.pins()){const marker=create('circle',{cx:p.x,cy:p.y,r:3,'data-editor-pin':p.id,'data-editor-bit':p.bit,fill:'#fff',stroke:color(p.bit),'stroke-width':1.5,'vector-effect':'non-scaling-stroke','pointer-events':$('edit-tool').value==='route'?'all':'none',tabindex:$('edit-tool').value==='route'?0:-1,role:'button','aria-label':p.owner+' '+p.pin});const title=create('title');title.textContent=p.id+' · '+(names.get(p.bit)||p.bit);marker.append(title);pinLayer.append(marker);}svg.append(layer,pinLayer);}
    drawDraft();
    const air=create('g',{'data-airwires':'true','pointer-events':'none'});for(const a of scene.airwires())air.append(create('line',{x1:a.a.x,y1:a.a.y,x2:a.b.x,y2:a.b.y,stroke:color(a.bit),'stroke-opacity':.75,'stroke-width':.8,'vector-effect':'non-scaling-stroke','data-air-net':a.bit,'data-from-owner':a.a.owner||'','data-to-owner':a.b.owner||''}));svg.append(air);
    const meta=create('metadata',{'data-manual-state':'true'});meta.textContent=JSON.stringify({version:1,grid,unrouted:scene.airwires().length,manual:true});svg.insertBefore(meta,air);brushOverlay();notify();
  }
  function startOrEnd(p,bit){
    if(!draft){draft={bit,points:[p],checkpoints:[]};drawDraft();message('Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.');return;}
    if(bit!==undefined&&draft.bit!==bit){message('Different nodes cannot be connected. Choose a pin or wire of the same node.',{severity:'warning'});return;}
    const from=draft.points.at(-1),route=scene.findPath(draft.bit,from,p);if(!route){message('No clear grid path. Add a waypoint around the obstacle.',{severity:'warning'});return;}
    if(bit===undefined){if(route.length>1){draft.checkpoints.push(draft.points.length);draft.points.push(...route.slice(1));}drawDraft();message('Waypoint '+draft.checkpoints.length+' confirmed.');return;}
    try{scene.addPath(bit,[...draft.points,...route.slice(1)]);draft=null;render();message('Connection added.');}catch(error){message(error.message,{severity:'error'});}
  }
  function toggleGroup(forceUngroup=false){if(!scene||working||labelMode)return;try{if(forceUngroup||selectedGroup(selection,scene.manualGroups)){if(scene.ungroup(selection))message('Manual group removed.');}else{const g=scene.group(selection);selection=new Set(g.members);message('Grouped '+g.members.length+' components for manual editing.');}render();}catch(error){message(error.message,{severity:'error'});}}
  function commitLabels(records,removed=[]){
    const next=new Map((scene.labelOverrides||[]).map(l=>[l.id,l]));for(const id of removed)next.delete(id);for(const l of records)next.set(l.id,l);
    if(JSON.stringify([...next.values()])===JSON.stringify(scene.labelOverrides||[])){render();return;}
    scene.remember();scene.labelOverrides=structuredClone([...next.values()]);render();
  }
  function commitLabelMoves(moves){commitLabels(moves.map(m=>{const l=labelLayer.record(m.id);return {...l,x:l.x+m.dx,y:l.y+m.dy};}));}
  function setLabelEditing(value){
    if(!scene)return;labelClick=null;labelMode=value;selection.clear();draft=null;ghost=null;marquee=null;labelDrag=null;labelBox=null;$('edit-tool').value='select';render();message(value?'Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text.':'Label editing disabled.');
  }
  function history(redo){
    if(!scene)return;const stack=redo?scene.redoStack:scene.undoStack;if(!canHistory(stack)){message(labelMode?'No label edit to '+(redo?'redo.':'undo.'):'No edit to '+(redo?'redo.':'undo.'));return;}
    draft=null;ghost=null;marquee=null;labelDrag=null;labelBox=null;redo?scene.redo():scene.undo();render();message(redo?'Redo.':'Undo.');
  }
  function openLabel(id){labelPointer=null;editingLabel=id;$('label-text').value=labelLayer.record(id).text;$('label-dialog').showModal();$('label-text').focus();$('label-text').select();}
  $('close-label').onclick=()=>$('label-dialog').close();
  $('label-dialog').addEventListener('close',()=>preview.focus({preventScroll:true}));
  $('app').addEventListener('spice:workspacechange',()=>{if($('label-dialog').open)$('label-dialog').close();});
  $('label-form').onsubmit=e=>{e.preventDefault();const l=labelLayer.record(editingLabel),text=$('label-text').value;$('label-dialog').close();commitLabels([{...l,text}]);message('Display text updated. SPICE source unchanged.');};
  $('label-reset').onclick=()=>{const id=editingLabel;$('label-dialog').close();commitLabels([],[id]);message('Label reset to automatic placement and original text.');};
  preview.addEventListener('pointerdown',e=>{if(!brushSource||!svg||e.button!==0||e.shiftKey)return;e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});if(working)return;const id=e.target.closest('[data-editor-component]')?.getAttribute('data-editor-component');if(blockInstances.has(id))paintLayout(id);},{capture:true});
  preview.addEventListener('keydown',e=>{if(brushSource&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();const id=e.target.closest('[data-editor-component]')?.getAttribute('data-editor-component');if(blockInstances.has(id))paintLayout(id);}},{capture:true});
  preview.addEventListener('pointerdown',e=>{
    if(!labelMode||!enabled||working||!scene||e.button!==0)return;if(e.shiftKey){labelPointer=null;return;}labelPointer=e.pointerId;
    e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});const hit=e.target.closest('[data-editor-label]'),id=hit?.getAttribute('data-editor-label'),mode=$('edit-tool').value;
    const double=id&&labelClick?.id===id&&e.timeStamp-labelClick.time<450&&Math.hypot(e.clientX-labelClick.x,e.clientY-labelClick.y)<5;labelClick=id?{id,time:e.timeStamp,x:e.clientX,y:e.clientY}:null;
    if(double){labelClick=null;labelDrag=null;selection=new Set([id]);render();openLabel(id);return;}
    if(mode==='box'){labelBox={start:rawPoint(e),end:rawPoint(e),additive:e.ctrlKey||e.metaKey};preview.setPointerCapture(e.pointerId);marquee=labelBox;drawMarquee();marquee=null;return;}
    if(!id){selection.clear();render();return;}
    if(e.ctrlKey||e.metaKey){selection.has(id)?selection.delete(id):selection.add(id);render();return;}
    if(mode!=='move'||!selection.has(id))selection=new Set([id]);
    if(['rotate','mirror-x','mirror-y'].includes(mode)){chooseTool(mode);return;}
    render();if(mode==='move'){labelDrag={start:rawPoint(e),dx:0,dy:0};preview.setPointerCapture(e.pointerId);}
  },{capture:true});
  preview.addEventListener('pointermove',e=>{
    if(!labelMode||!enabled||!scene)return;
    if(labelBox){e.stopImmediatePropagation();labelBox.end=rawPoint(e);marquee=labelBox;drawMarquee();marquee=null;}
    if(labelDrag){e.stopImmediatePropagation();const p=rawPoint(e),d=scene.snap({x:p.x-labelDrag.start.x,y:p.y-labelDrag.start.y});labelDrag.dx=d.x;labelDrag.dy=d.y;if(d.x||d.y)labelClick=null;labelLayer.preview([...selection].map(id=>({id,dx:d.x,dy:d.y})));}
  },{capture:true});
  preview.addEventListener('pointerup',e=>{
    if(!labelMode||labelPointer!==e.pointerId)return;labelPointer=null;e.stopImmediatePropagation();
    if(preview.hasPointerCapture(e.pointerId))preview.releasePointerCapture(e.pointerId);
    if(labelBox){const b=labelBox;labelBox=null;const ids=selectInBox(labelLayer.nodes(),b.start,rawPoint(e));selection=b.additive?new Set([...selection,...ids]):new Set(ids);render();message(selection.size+' label(s) selected.');}
    if(labelDrag){const d=labelDrag;labelDrag=null;if(d.dx||d.dy){commitLabelMoves([...selection].map(id=>({id,dx:d.dx,dy:d.dy})));message('Moved '+selection.size+' label(s).');}else render();}
  },{capture:true});
  preview.addEventListener('pointercancel',()=>{if(labelMode){labelDrag=null;labelBox=null;render();}});
  preview.addEventListener('dblclick',e=>{if(!labelMode)return;e.preventDefault();e.stopImmediatePropagation();const p=rawPoint(e),id=e.target.closest('[data-editor-label]')?.getAttribute('data-editor-label')||labelLayer.nodes().findLast(n=>p.x>=n.x-2&&p.x<=n.x+Math.max(8,n.width)+2&&p.y>=n.y-2&&p.y<=n.y+Math.max(12,n.height)+2)?.id;if(id)openLabel(id);},{capture:true});
  preview.addEventListener('pointerdown',e=>{
    if(labelMode||!enabled||working||!scene||!svg||e.button!==0||e.shiftKey)return;
    const mode=$('edit-tool').value,pin=e.target.closest('[data-editor-pin]'),wire=e.target.closest('[data-editor-wire]');
    const pinModel=pin&&scene.pins().find(p=>p.id===pin.dataset.editorPin),groupHit=e.target.closest('[data-editor-group]'),group=groupHit?scene.manualGroups?.find(g=>g.id===groupHit.getAttribute('data-editor-group')):(scene.manualGroups?.length?manualUnits(scene.components,scene.manualGroups).find(n=>{if(!n.groupId)return false;const p=rawPoint(e);return p.x>=n.x&&p.x<=n.x+n.width&&p.y>=n.y&&p.y<=n.y+n.height;}):null),component=e.target.closest('[data-editor-component]')||(pinModel&&svg.getElementById('cell_'+pinModel.owner))||(group&&svg.getElementById('cell_'+group.members[0]));
    const n=component&&scene.components.find(n=>n.id===component.dataset.editorComponent&&isSelectableComponent(n));
    if(mode==='box'){
      e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});
      marquee={start:rawPoint(e),end:rawPoint(e),additive:e.ctrlKey||e.metaKey};preview.setPointerCapture(e.pointerId);drawMarquee();return;
    }
    if(mode==='route'||mode==='erase'){
      e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});cursor=point(e);
      if(mode==='erase'){if(wire){scene.remove(+wire.dataset.editorWire);render();message('Wire segment erased.');}return;}
      if(pinModel){startOrEnd({x:pinModel.x,y:pinModel.y},pinModel.bit);return;}
      if(wire){const s=scene.segments[+wire.dataset.editorWire],p=point(e);startOrEnd(s.a.x===s.b.x?{x:s.a.x,y:p.y}:{x:p.x,y:s.a.y},s.bit);return;}
      if(draft)startOrEnd(point(e));else drawDraft();return;
    }
    if(!n){if(selection.size){selection.clear();render();}return;}
    e.preventDefault();e.stopImmediatePropagation();preview.focus({preventScroll:true});inspect?.(n.id,n);
    if(e.ctrlKey||e.metaKey){const ids=expandGroupSelection([n.id],scene.manualGroups),remove=[...ids].every(id=>selection.has(id));for(const id of ids)remove?selection.delete(id):selection.add(id);render();return;}
    if(mode!=='move'||!selection.has(n.id))selection=expandGroupSelection([n.id],scene.manualGroups);
    if(['rotate','mirror-x','mirror-y'].includes(mode)){chooseTool(mode);return;}
    render();if(mode!=='move')return;
    ghost={entries:scene.components.filter(n=>selection.has(n.id)).map(n=>({n,element:svg.getElementById('cell_'+n.id)})),start:rawPoint(e),dx:0,dy:0};
    for(const g of ghost.entries)g.element.style.opacity='.6';preview.setPointerCapture(e.pointerId);
  },{capture:true});
  preview.addEventListener('pointermove',e=>{
    if(labelMode||!enabled||!scene||!svg)return;cursor=point(e);
    if(marquee){e.stopImmediatePropagation();marquee.end=rawPoint(e);drawMarquee();return;}
    if(ghost){
      e.stopImmediatePropagation();const p=rawPoint(e),delta=scene.snap({x:p.x-ghost.start.x,y:p.y-ghost.start.y});ghost.dx=delta.x;ghost.dy=delta.y;
      for(const {n,element}of ghost.entries){element.setAttribute('transform',`translate(${n.x+delta.x},${n.y+delta.y})`);const outline=svg.querySelector('[data-selected-component="'+CSS.escape(n.id)+'"]');if(outline){outline.setAttribute('x',n.x+delta.x-3);outline.setAttribute('y',n.y+delta.y-3);}}
      for(const group of scene.manualGroups||[])if(group.members.every(id=>selection.has(id)))svg.querySelector('[data-editor-group='+JSON.stringify(group.id)+']')?.setAttribute('transform',`translate(${delta.x},${delta.y})`);
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
    if(marquee){const m=marquee;marquee=null;const units=manualUnits(scene.components,scene.manualGroups),selected=selectInBox(units,m.start,rawPoint(e)),ids=units.filter(n=>selected.includes(n.id)).flatMap(n=>n.members);selection=m.additive?new Set([...selection,...ids]):new Set(ids);render();message(selection.size+' symbol(s) selected.');return;}
    const g=ghost;ghost=null;for(const e of g.entries)e.element.style.opacity='';
    try{const moved=scene.moveMany(g.entries.map(({n})=>({id:n.id,dx:g.dx,dy:g.dy})));render();if(moved)message('Moved '+g.entries.length+' symbol(s). Detached connections remain flywires.');}catch(error){render();message(error.message,{severity:'error'});}
  },{capture:true});
  preview.addEventListener('pointercancel',()=>{if(ghost||marquee){ghost=null;marquee=null;render();}});
  preview.addEventListener('pointerleave',()=>{if(!ghost&&!marquee){cursor=null;drawDraft();}});
  preview.addEventListener('wheel',e=>{requestAnimationFrame(()=>{if(enabled&&scene&&svg&&$('edit-tool').value==='route'){cursor=point(e);drawDraft();}});},{passive:true});
  document.addEventListener('keydown',e=>{
    if($('download-dialog').open||$('label-dialog').open||!enabled||!scene||working||e.target.closest('input,textarea,select,[contenteditable="true"]')||!$('app').contains(e.target))return;
    if(brushSource){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();toggleLayoutBrush();}return;}const pin=e.target.closest('[data-editor-pin]'),k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&k==='g'){e.preventDefault();e.stopImmediatePropagation();toggleGroup(e.shiftKey);return;}if(k==='t'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();e.stopImmediatePropagation();setLabelEditing(!labelMode);return;}if(labelMode&&e.key==='Enter'&&selection.size===1){e.preventDefault();e.stopImmediatePropagation();openLabel([...selection][0]);return;}
    if(pin&&$('edit-tool').value==='route'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();const p=scene.pins().find(p=>p.id===pin.dataset.editorPin);startOrEnd({x:p.x,y:p.y},p.bit);return;}
    if(e.key==='Backspace'&&$('edit-tool').value==='route'){
      e.preventDefault();e.stopImmediatePropagation();if(draft){const length=draft.checkpoints.pop();if(length===undefined)draft=null;else draft.points.length=length;drawDraft();message(draft?'Last waypoint removed.':'Route start removed. Choose a pin to begin.');}return;
    }
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();draft=null;ghost=null;marquee=null;chooseTool('select');}
    else if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();e.stopImmediatePropagation();history(e.shiftKey);return;}
    else if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&{s:'select',b:'box',v:'move',w:'route',d:'erase',r:'rotate',x:'mirror-x',y:'mirror-y'}[k]){e.preventDefault();e.stopImmediatePropagation();chooseTool({s:'select',b:'box',v:'move',w:'route',d:'erase',r:'rotate',x:'mirror-x',y:'mirror-y'}[k]);}
  },{capture:true});
  function arrange(action){
    if(!scene||working)return;
    draft=null;ghost=null;marquee=null;$('edit-tool').value='select';
    try{const units=labelMode?labelLayer.nodes():manualUnits(scene.components,scene.manualGroups),chosen=labelMode?selection:new Set(units.filter(n=>n.members.some(id=>selection.has(id))).map(n=>n.id)),{moves,rounded}=arrangeComponents(units,chosen,action,grid);if(labelMode)commitLabelMoves(moves);else scene.moveMany(moves.flatMap(m=>units.find(n=>n.id===m.id).members.map(id=>({id,dx:m.dx,dy:m.dy}))));render();message(`${selection.size} ${labelMode?'labels':'components'} arranged.${rounded?' Centers or gaps rounded to the '+grid+'-unit pin grid.':''}${labelMode?'':' Detached connections remain flywires.'}`);}
    catch(error){render();message(error.message,{severity:'error'});}
  }

  async function autoRoute(){if(!scene||working||labelMode)return;const token=revision;working=true;notify();message('Auto-routing remaining connections…');try{await scene.autoRoute(()=>token!==revision);if(token===revision){draft=null;working=false;render();const remaining=scene.airwires().length;message(remaining?'Auto-routing finished: '+remaining+' connection(s) remain unrouted.':'Auto-routing complete.',{severity:remaining?'warning':'info'});}}catch(error){if(token===revision){working=false;render();message(error.message,{severity:'error'});}}}
  return {
    mount(element,drawing,circuit,netlist,settings,{reset=false,scope=''}={}){revision++;working=false;brushSource='';blockInstances=new Map(circuit.components.filter(c=>c.block).map(c=>[c.name,c.instanceId]));svg=element;draft=null;ghost=null;marquee=null;cursor=null;selection.clear();originals=new Map();for(const g of svg.querySelectorAll('g[id^="cell_"]')){const inverse=g.getCTM().inverse();originals.set(g.id.slice(5),{children:[...g.childNodes].map(n=>n.cloneNode(true)),labels:[...g.querySelectorAll('text')].map(t=>{const p=new DOMPoint(+t.getAttribute('x')||0,+t.getAttribute('y')||0).matrixTransform(inverse.multiply(t.getCTM()));return {node:t.cloneNode(true),x:p.x,y:p.y};})});}grid=settings.gridSize||0;names=new Map(Object.values(circuit.nodes).map(n=>[n.bit,n.name]));if(!drawing||!grid){scene=null;controls();return;}
      const d=prepareRoutingDrawing(svg,drawing,circuit,netlist),segments=d.segments;scene=new RoutingScene(d,{step:grid,segments});key=sheetKey(scope,circuit.topology.signature,settings);if(!reset&&saved.has(key))(validateLabelTargets(svg,saved.get(key).labelOverrides),scene.restore(restoreProjectScene({...d,segments},saved.get(key),grid)));else if($('flywire').checked)scene.clear();enabled=$('interactive').checked;
      if(enabled||!reset&&saved.has(key)||$('flywire').checked)render();else controls();
    },
    invalidate(){brushSource='';blockInstances.clear();labelClick=null;labelDrag=null;labelBox=null;if($('label-dialog').open)$('label-dialog').close();if(scene&&!working)saved.set(key,scene.snapshot());revision++;working=false;scene=null;svg=null;draft=null;ghost=null;marquee=null;cursor=null;selection.clear();controls();},
    snapshotSheets(){if(scene&&!working)saved.set(key,scene.snapshot());return [...saved].map(([key,snapshot])=>{const [scope,topology,settings]=JSON.parse(key);return {scope,topology,settings,snapshot:structuredClone(snapshot),...(templateSources.has(key)?{templateSource:templateSources.get(key)}:{})};});},
    restoreSheets(sheets){templateSources=new Map(sheets.filter(s=>s.templateSource).map(s=>[sheetKey(s.scope,s.topology,s.settings),s.templateSource]));saved=new Map(sheets.map(s=>[sheetKey(s.scope,s.topology,s.settings),structuredClone(s.snapshot)]));},
    clearSheets(){saved.clear();templateSources.clear();},
    saveTemplateSheet(sheet){const k=sheetKey(sheet.scope,sheet.topology,sheet.settings);saved.set(k,structuredClone(sheet.snapshot));templateSources.set(k,sheet.templateSource);},
    setEnabled(value){enabled=value;if(!value)brushSource='';if(!value){labelMode=false;labelDrag=null;labelBox=null;draft=null;ghost=null;marquee=null;cursor=null;selection.clear();}if(scene)render();else controls();},
    clear(){if(scene&&!labelMode){scene.clear();draft=null;render();message('Wiring cleared. Connections remain as flywires.');}},autoRoute,chooseTool,arrange,toggleGroup,toggleLayoutBrush,layoutBrushActive:()=>!!brushSource,setLabelEditing,labelEditing:()=>labelMode,
    resetLabelDisplay:()=>labelLayer.reset(),placeLabels:()=>svg&&scene?labelLayer.layout(svg,scene.components,scene.labelOverrides,enabled&&labelMode,selection):null,
    undo:()=>history(false),redo:()=>history(true),
    complete(){return !scene||!working&&scene.airwires().length===0;},working(){return working;},stats,canEdit(){return !!scene;},refreshControls:controls,
    refreshColors(){if(!svg)return;for(const line of svg.querySelectorAll('[data-air-net]'))line.setAttribute('stroke',color(+line.dataset.airNet));for(const pin of svg.querySelectorAll('[data-editor-bit]'))pin.setAttribute('stroke',color(+pin.dataset.editorBit));},
    cleanExport(element){for(const n of element.querySelectorAll('[data-brush-dimmed]')){n.style.removeProperty('opacity');n.removeAttribute('data-brush-dimmed');}for(const t of element.querySelectorAll('[data-label-id]'))t.removeAttribute('data-label-id');for(const n of element.querySelectorAll('[data-editor-overlay],[data-route-preview]'))n.remove();for(const n of element.querySelectorAll('[data-editor-component]')){n.removeAttribute('data-editor-component');n.style.removeProperty('opacity');}}
  };
}
