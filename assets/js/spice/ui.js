import {parseHierarchy} from './hierarchy-parser.js';
import {elaborateCircuit} from './elaborate.js';
import {projectHierarchy,toNetlistsvg} from './layout-adapter.js';
import {renderSchematic} from './renderer.js';
import mixed from './examples/mixed.cir?raw';
import filter from './examples/filter.cir?raw';
import hierarchy from './examples/hierarchy.cir?raw';
import ltspice from './examples/ltspice-elements.cir?raw';
import amplifier from './examples/common-emitter.cir?raw';
import {readSpiceFile} from './file-text.js';
import './viewer.css';

const $ = id => document.getElementById('spice-' + id);
const root = $('app');
if (root) {
  const input = $('input'), preview = $('preview'), status = $('status'), diagnostics = $('diagnostics');
  let svgText = '', circuit, tree, ir, lastSource='', focus='', selectedInstance='', busy = false, view = {x:0,y:0,w:1,h:1}, full = {...view}, drag;
  const expanded=new Set();let pendingRoute=false,libraries={};
  try{libraries=JSON.parse(sessionStorage.getItem('spice-libraries-v3')||'{}');}catch{}
  root.addEventListener('click',event=>{if(busy&&event.target.closest('a[href^="#"]'))event.preventDefault();});
  const exports = () => { $('copy').disabled = $('download').disabled = !svgText || busy; };
  const settings = () => ({font:$('font').value, fontSize:Number($('size').value), color:$('color').value,detailed:$('detailed').checked,conventional:$('conventional').checked});
  function invalidate() { svgText = ''; exports(); status.textContent = 'Input changed — generate to refresh the schematic.'; }
  input.value = filter;
  try {input.value=sessionStorage.getItem('spice-netlist-v2')||filter;}catch{}
  input.addEventListener('input', invalidate);
  for (const id of ['font','size','color','detailed','conventional']) $(id).addEventListener('input', invalidate);
  function showDiagnostics(items) {
    diagnostics.replaceChildren();
    for (const {severity,line,message,source} of items) {
      const li = document.createElement('li'); li.className = severity;
      li.textContent = `${severity.toUpperCase()}${source&&source!=='input.cir'?' · '+source:''}${line ? ' · line ' + line : ''}: ${message}`; diagnostics.append(li);
    }
    $('messages').open = items.some(d => d.severity !== 'info');
    $('message-count').textContent = `${items.length} message${items.length === 1 ? '' : 's'}`;
  }
  function setView() {
    preview.querySelector('svg')?.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    $('zoom-level').textContent = Math.round(full.w / view.w * 100) + '%';
  }
  function zoom(factor, cx = view.x + view.w/2, cy = view.y + view.h/2) {
    if (!preview.querySelector('svg')) return;
    const ratio = Math.max(.05, Math.min(10, view.w * factor / full.w)) * full.w / view.w;
    view = {x:cx+(view.x-cx)*ratio,y:cy+(view.y-cy)*ratio,w:view.w*ratio,h:view.h*ratio}; setView();
  }
  $('zoom-in').onclick = () => zoom(.8); $('zoom-out').onclick = () => zoom(1.25);
  $('fit').onclick = () => { view = {...full}; setView(); };
  const svgPoint = event => {
    const svg = preview.querySelector('svg');
    if (!svg) return null;
    return new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  };
  preview.addEventListener('wheel', event => { const p=svgPoint(event); if (!p) return; event.preventDefault(); zoom(event.deltaY>0?1.12:1/1.12,p.x,p.y); }, {passive:false});
  preview.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !preview.querySelector('svg')) return;
    drag = {start:svgPoint(event), x:event.clientX, y:event.clientY, view:{...view}, moved:false}; preview.setPointerCapture(event.pointerId);
  });
  preview.addEventListener('pointermove', event => {
    if (!drag) return; const p=svgPoint(event);
    if (Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4) drag.moved=true;
    view.x += drag.start.x-p.x; view.y += drag.start.y-p.y; setView();
  });
  preview.addEventListener('pointerup', event => {
    if (!drag) return; const moved=drag.moved; drag=null;
    if (preview.hasPointerCapture(event.pointerId)) preview.releasePointerCapture(event.pointerId);
    if (!moved) {
      const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-component]');
      const component=circuit?.components.find(c => c.name === target?.dataset.component);
      if (component) {
        selectedInstance=component.instanceId||'';
        $('selection').textContent = `${component.raw}\n${Object.entries(component.terminals).map(([p,n])=>`${p} → ${n}`).join('   ')}`;
        if(component.kind==='X'){expandInstance(component.instanceId);generate();}
        else updateSelection();
      }
    }
  });
  function route(instance) {
    const query=new URLSearchParams();if(instance)query.set('instance',instance);
    const hash=query.toString();
    if(location.hash.slice(1)===hash){focus=instance;generate();}else location.hash=hash;
  }
  function readRoute(){focus=new URLSearchParams(location.hash.slice(1)).get('instance')||'';}
  function expandInstance(id){const path=tree.contexts[id].path;for(let i=1;i<=path.length;i++)expanded.add(path.slice(0,i).map(encodeURIComponent).join('/'));}
  window.addEventListener('hashchange',()=>{if(busy){pendingRoute=true;return;}readRoute();selectedInstance='';generate();});
  function updateSelection() {
    const valid=Boolean(selectedInstance&&selectedInstance!==focus&&tree?.contexts[selectedInstance]);
    $('selection-actions').hidden=!valid;
    $('toggle-instance').textContent=expanded.has(selectedInstance)?'Collapse instance':'Expand instance';
    $('toggle-instance').disabled=false;
    $('open-instance').href='#'+new URLSearchParams({instance:selectedInstance});
  }
  function updateHierarchy() {
    $('breadcrumbs').replaceChildren();
    const addCrumb=(label,id)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>route(id);button.disabled=id===focus;$('breadcrumbs').append(button);};
    addCrumb('Top','');
    if(focus) {
      const path=tree.contexts[focus].path;
      for(let i=0;i<path.length;i++)addCrumb(path[i],path.slice(0,i+1).map(encodeURIComponent).join('/'));
    }
    $('instances').replaceChildren();
    const walk=(current,depth)=>{
      for(const child of current.children) {
        const row=document.createElement('div');row.className='spice-instance-row';row.style.setProperty('--depth',Math.min(depth,8));row.dataset.instance=child.id;
        const toggle=document.createElement('button');toggle.type='button';toggle.textContent=expanded.has(child.id)?'−':'+';toggle.title=(expanded.has(child.id)?'Collapse ':'Expand ')+child.id;
        toggle.setAttribute('aria-label',toggle.title);toggle.setAttribute('aria-expanded',String(expanded.has(child.id)));toggle.onclick=()=>{expanded.has(child.id)?expanded.delete(child.id):expandInstance(child.id);selectedInstance=child.id;generate();};
        const link=document.createElement('a');link.href='#'+new URLSearchParams({instance:child.id});link.textContent=child.name+' · '+child.definition;link.title='Open '+child.id+' as its own sheet';
        const params=document.createElement('span');params.className='spice-help';params.textContent=Object.entries(child.params).map(([k,v])=>k+'='+v).join(' · ');
        row.append(toggle,link);if(params.textContent){const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Parameters';detail.append(summary,params);row.append(detail);}
        $('instances').append(row);walk(child,depth+1);
      }
    };
    walk(tree.contexts[focus],0);
    $('hierarchy-panel').hidden=!tree.contexts[focus].children.length;
    $('focus-title').textContent=focus?focus+' / '+tree.contexts[focus].definition:'Top-level schematic';
    updateSelection();
  }
  $('collapse-all').onclick=()=>{expanded.clear();generate();};
  $('expand-all').onclick=()=>{for(const id of Object.keys(tree?.contexts||{}))if(id)expanded.add(id);generate();};
  $('toggle-instance').onclick=()=>{expanded.has(selectedInstance)?expanded.delete(selectedInstance):expandInstance(selectedInstance);generate();};
  preview.addEventListener('pointercancel', () => {drag=null;});
  preview.addEventListener('keydown', event => {
    const block=event.target.closest('[data-instance]');
    if(block&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectedInstance=block.dataset.instance;expandInstance(selectedInstance);generate();return;}
    if (event.key === '+' || event.key === '=') zoom(.8);
    else if (event.key === '-') zoom(1.25);
    else if (event.key.toLowerCase() === 'f') {view={...full};setView();}
    else if (event.key.startsWith('Arrow')) {event.preventDefault();view.x+=({'ArrowLeft':-.08,'ArrowRight':.08}[event.key]||0)*view.w;view.y+=({'ArrowUp':-.08,'ArrowDown':.08}[event.key]||0)*view.h;setView();}
  });
  async function generate() {
    if (busy) return;
    busy=true; svgText=''; exports(); $('generate').disabled=true;
    input.readOnly=true; $('file').disabled=true;$('libraries').disabled=true;
    for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance')) element.disabled=true;
    status.textContent='Parsing netlist and routing wires…'; preview.setAttribute('aria-busy','true');
    let items=[];
    try {
      if(lastSource!==input.value||!tree) {
        ir=parseHierarchy(input.value,{files:libraries});items=[...ir.diagnostics];
        if(items.some(d=>d.severity==='error')){tree=null;throw Error('Fix the parser errors below before generating.');}
        tree=elaborateCircuit(ir);
        if(lastSource&&lastSource!==input.value){expanded.clear();focus='';selectedInstance='';history.replaceState(null,'',location.pathname+location.search);}
        else readRoute();
        lastSource=input.value;
        try{sessionStorage.setItem('spice-netlist-v2',input.value);}catch{}
      }
      items=[...ir.diagnostics];showDiagnostics(items);
      if (items.some(d=>d.severity==='error')) throw Error('Fix the parser errors below before generating.');
      circuit=projectHierarchy(tree,{expanded,focus});
      const netlist=toNetlistsvg(circuit);
      if(settings().conventional)items.push(...circuit.layout.diagnostics);
      const rendered=await renderSchematic(netlist,settings());
      const documentSVG=new DOMParser().parseFromString(rendered,'image/svg+xml');
      if (documentSVG.querySelector('parsererror')) throw Error('Renderer produced invalid SVG.');
      const svg=documentSVG.documentElement;
      const layoutReport=svg.querySelector('#spice-layout-report');
      if(layoutReport) {
        circuit.layout.report=JSON.parse(layoutReport.textContent);
        const r=circuit.layout.report;
        items.push({severity:'info',message:`Layout: compact signal flow; ${r.powerSourcesChecked} DC/ground symbols checked, ${r.powerOrderViolations} DC order preference(s) unmet. ${r.powerPass}. Global voltage bands are a preference.`});
        if(r.groundPlacement)items.push({severity:'info',message:`Ground: ${r.groundPlacement}; ${r.straightenedGroundDrops||0} return-path simplification(s).`});
        if(r.explicitGroups)items.push({severity:'info',message:`Layout comments: ${r.explicitGroups} visual groups; nested row/column placement retained on expansion.`});
        if(r.classicRails)items.push({severity:'info',message:`Transistor layout: local load/bias branches; ${r.railCount} shared voltage rails.`});
        if(r.geometricConnectivityVerified)items.push({severity:'info',message:`Net geometry verified; ${r.cyclesRemoved} same-net loop(s) and ${r.leavesRemoved} unused wire branch(es) removed.`});
        showDiagnostics(items);
      }
      if (svg.localName!=='svg' || svg.querySelector('script,foreignObject')) throw Error('Invalid schematic output.');
      const width=Number(svg.getAttribute('width')),height=Number(svg.getAttribute('height'));
      full={x:-20,y:-20,w:width+40,h:height+40}; view={...full};
      svg.setAttribute('viewBox',`${full.x} ${full.y} ${full.w} ${full.h}`);
      svg.setAttribute('width',String(full.w));svg.setAttribute('height',String(full.h));
      svg.setAttribute('role','img');svg.setAttribute('aria-label',circuit.title||'SPICE schematic');
      svg.setAttribute('style','background:white');
      for (const c of circuit.components) {
        const element=documentSVG.getElementById('cell_'+c.name);
        if (!element) throw Error('Renderer omitted component '+c.name);
        element.setAttribute('data-component',c.name);
        if(c.kind==='X'){element.setAttribute('data-instance',c.instanceId);element.setAttribute('role','button');element.setAttribute('tabindex','0');element.setAttribute('aria-label','Expand '+c.name);}
        const title=documentSVG.createElementNS(svg.namespaceURI,'title');title.textContent=c.raw+'\nResolved: '+c.value+'\n'+Object.entries(c.terminals).map(([p,n])=>p+': '+n).join(', ');element.prepend(title);
      }
      for (const n of Object.values(circuit.nodes)) {
        for (const element of svg.querySelectorAll('.net_'+n.bit)) {
          element.setAttribute('data-net',n.name);
          const title=documentSVG.createElementNS(svg.namespaceURI,'title');title.textContent='Node '+n.displayName;element.append(title);
        }
      }
      const magnetic=circuit.components.filter(c=>c.kind==='K').map(c=>({name:c.name,inductors:c.coupledInductors,value:c.value}));
      if(magnetic.length) {
        const metadata=documentSVG.createElementNS(svg.namespaceURI,'metadata');metadata.setAttribute('id','spice-magnetic-couplings');metadata.textContent=JSON.stringify(magnetic);svg.append(metadata);
        for(const coupling of magnetic)for(const name of coupling.inductors) {
          const group=documentSVG.getElementById('cell_'+name);if(!group)continue;
          const dot=documentSVG.createElementNS(svg.namespaceURI,'circle');
          const firstPort=[...group.children].find(p=>p.getAttribute('s:pid')==='A');
          const side=firstPort?.getAttribute('s:position'),offset={left:[6,-8],right:[-6,-8],top:[-8,6],bottom:[-8,-6]}[side]||[0,0];
          for(const [key,value]of Object.entries({cx:Number(firstPort?.getAttribute('s:x'))+offset[0],cy:Number(firstPort?.getAttribute('s:y'))+offset[1],r:3,fill:settings().color,stroke:'none','data-coupling':coupling.name}))dot.setAttribute(key,String(value));
          const title=documentSVG.createElementNS(svg.namespaceURI,'title');title.textContent=coupling.name+' · dotted terminal: '+coupling.inductors.join(', ');dot.append(title);group.append(dot);
        }
      }
      // Export remains at the fitted full-sheet view regardless of preview pan/zoom.
      svgText=new XMLSerializer().serializeToString(svg); $('source').value=svgText;
      preview.replaceChildren(document.importNode(svg,true)); setView();
      const warnings=items.filter(d=>d.severity==='warning').length;
      status.textContent=`${circuit.components.filter(c=>!c.synthetic).length} components · ${Object.keys(circuit.nodes).length} nodes · ${circuit.topology.leafCount} primitive devices verified${warnings?' · Review '+warnings+' warning(s); drawing may be partial.':' · Schematic ready.'}`;
      if(circuit.layout?.report?.powerOrderViolations)status.textContent+=` Layout: ${circuit.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`;
      if(circuit.layout?.report?.groundPlacement?.startsWith('ELK fallback'))status.textContent+=' Ground marker: routed fallback; no safe short attachment found.';
      const rows=Object.values(circuit.nodes).map(n => {
        const tr=document.createElement('tr');
        for (const text of [n.displayName,n.terminals.map(t=>t.component+'.'+t.pin).join(', ')]) {const td=document.createElement('td');td.textContent=text;tr.append(td);} return tr;
      });
      $('nets').replaceChildren(...rows); $('json').value=JSON.stringify({circuit,netlist,hierarchy:ir},null,2);
      $('selection').textContent='Click a component to inspect its original statement and pin connections.';
      updateHierarchy();
    } catch(error) {
      preview.replaceChildren(); svgText=''; $('source').value=''; $('json').value=''; $('nets').replaceChildren();
      $('selection').textContent=''; status.textContent=error.message;
      if(!tree){$('hierarchy-panel').hidden=true;$('selection-actions').hidden=true;$('breadcrumbs').replaceChildren();}
      else if(!tree.contexts[focus]){const home=document.createElement('button');home.type='button';home.textContent='Return to Top';home.onclick=()=>route('');$('breadcrumbs').replaceChildren(home);}
      if(error.diagnostics)items=error.diagnostics;
      if (!items.some(d=>d.severity==='error')) items.push({severity:'error',line:0,message:error.message});
      showDiagnostics(items);
    } finally {
      busy=false; $('generate').disabled=false; input.readOnly=false; $('file').disabled=false;$('libraries').disabled=false;
      for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all')) element.disabled=false;
      if(tree&&tree.contexts[focus])updateHierarchy();
      preview.setAttribute('aria-busy','false');exports();
      if(pendingRoute){pendingRoute=false;readRoute();queueMicrotask(generate);}
    }
  }
  $('generate').onclick=generate;
  for (const button of root.querySelectorAll('[data-example]')) button.onclick=()=>{input.value=({mixed,filter,hierarchy,ltspice,amplifier})[button.dataset.example];invalidate();generate();};
  $('file').onchange=async event=>{
    const file=event.target.files[0];if (!file)return;
    if (file.size>2000000) {status.textContent='File exceeds 2 MB.';return;}
    try {input.value=await readSpiceFile(file);invalidate();generate();} catch(error){status.textContent='File could not be read: '+error.message;}
    finally{event.target.value='';}
  };
  $('libraries').onchange=async event=>{
    try{
      for(const file of event.target.files){if(file.size>16000000)throw Error('Library exceeds 16 MB: '+file.name);libraries[file.webkitRelativePath||file.name]=await readSpiceFile(file);}
      try{sessionStorage.setItem('spice-libraries-v3',JSON.stringify(libraries));}catch{}
      tree=null;lastSource='';$('library-status').textContent=Object.keys(libraries).length+' library file(s) loaded';generate();
    }catch(error){status.textContent=error.message;}
    finally{event.target.value='';}
  };
  $('library-status').textContent=Object.keys(libraries).length?'Libraries restored from this session.':'For .include / .lib dependencies';
  $('download').onclick=()=>{
    const url=URL.createObjectURL(new Blob([svgText],{type:'image/svg+xml;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='spice-schematic.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('copy').onclick=async()=>{
    try {await navigator.clipboard.writeText(svgText);status.textContent='SVG source copied to clipboard.';}
    catch { $('source-details').open=true;$('source').focus();$('source').select();status.textContent='Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.'; }
  };
  generate();
}
