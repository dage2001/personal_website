import {parseCir, toNetlistsvg} from './cir2json.js';
import {renderSchematic} from './renderer.js';
import mixed from './examples/mixed.cir?raw';
import filter from './examples/filter.cir?raw';
import './viewer.css';

const $ = id => document.getElementById('spice-' + id);
const root = $('app');
if (root) {
  const input = $('input'), preview = $('preview'), status = $('status'), diagnostics = $('diagnostics');
  let svgText = '', circuit, busy = false, view = {x:0,y:0,w:1,h:1}, full = {...view}, drag;
  const exports = () => { $('copy').disabled = $('download').disabled = !svgText || busy; };
  const settings = () => ({font:$('font').value, fontSize:Number($('size').value), color:$('color').value});
  function invalidate() { svgText = ''; exports(); status.textContent = 'Input changed — generate to refresh the schematic.'; }
  input.value = filter;
  input.addEventListener('input', invalidate);
  for (const id of ['font','size','color']) $(id).addEventListener('input', invalidate);
  function showDiagnostics(items) {
    diagnostics.replaceChildren();
    for (const {severity,line,message} of items) {
      const li = document.createElement('li'); li.className = severity;
      li.textContent = `${severity.toUpperCase()}${line ? ' · line ' + line : ''}: ${message}`; diagnostics.append(li);
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
      if (component) $('selection').textContent = `${component.raw}\n${Object.entries(component.terminals).map(([p,n])=>`${p} → ${n}`).join('   ')}`;
    }
  });
  preview.addEventListener('pointercancel', () => {drag=null;});
  preview.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') zoom(.8);
    else if (event.key === '-') zoom(1.25);
    else if (event.key.toLowerCase() === 'f') {view={...full};setView();}
    else if (event.key.startsWith('Arrow')) {event.preventDefault();view.x+=({'ArrowLeft':-.08,'ArrowRight':.08}[event.key]||0)*view.w;view.y+=({'ArrowUp':-.08,'ArrowDown':.08}[event.key]||0)*view.h;setView();}
  });
  async function generate() {
    if (busy) return;
    busy=true; svgText=''; exports(); $('generate').disabled=true;
    input.readOnly=true; $('file').disabled=true;
    for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color]')) element.disabled=true;
    status.textContent='Parsing netlist and routing wires…'; preview.setAttribute('aria-busy','true');
    let items=[];
    try {
      circuit=parseCir(input.value); items=circuit.diagnostics; showDiagnostics(items);
      if (items.some(d=>d.severity==='error')) throw Error('Fix the parser errors below before generating.');
      const netlist=toNetlistsvg(circuit);
      const rendered=await renderSchematic(netlist,settings());
      const documentSVG=new DOMParser().parseFromString(rendered,'image/svg+xml');
      if (documentSVG.querySelector('parsererror')) throw Error('Renderer produced invalid SVG.');
      const svg=documentSVG.documentElement;
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
        const title=documentSVG.createElementNS(svg.namespaceURI,'title');title.textContent=c.raw+'\n'+Object.entries(c.terminals).map(([p,n])=>p+': '+n).join(', ');element.prepend(title);
      }
      for (const n of Object.values(circuit.nodes)) {
        for (const element of svg.querySelectorAll('.net_'+n.bit)) {
          element.setAttribute('data-net',n.name);
          const title=documentSVG.createElementNS(svg.namespaceURI,'title');title.textContent='Node '+n.displayName;element.append(title);
        }
      }
      // Export remains at the fitted full-sheet view regardless of preview pan/zoom.
      svgText=new XMLSerializer().serializeToString(svg); $('source').value=svgText;
      preview.replaceChildren(document.importNode(svg,true)); setView();
      const warnings=items.filter(d=>d.severity==='warning').length;
      status.textContent=`${circuit.components.length} components · ${Object.keys(circuit.nodes).length} nodes${warnings?' · Review '+warnings+' warning(s); drawing may be partial.':' · Schematic ready.'}`;
      const rows=Object.values(circuit.nodes).map(n => {
        const tr=document.createElement('tr');
        for (const text of [n.displayName,n.terminals.map(t=>t.component+'.'+t.pin).join(', ')]) {const td=document.createElement('td');td.textContent=text;tr.append(td);} return tr;
      });
      $('nets').replaceChildren(...rows); $('json').value=JSON.stringify({circuit,netlist},null,2);
      $('selection').textContent='Click a component to inspect its original statement and pin connections.';
    } catch(error) {
      preview.replaceChildren(); svgText=''; $('source').value=''; $('json').value=''; $('nets').replaceChildren();
      $('selection').textContent=''; status.textContent=error.message;
      if (!items.some(d=>d.severity==='error')) items.push({severity:'error',line:0,message:error.message});
      showDiagnostics(items);
    } finally {
      busy=false; $('generate').disabled=false; input.readOnly=false; $('file').disabled=false;
      for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color]')) element.disabled=false;
      preview.setAttribute('aria-busy','false');exports();
    }
  }
  $('generate').onclick=generate;
  for (const button of root.querySelectorAll('[data-example]')) button.onclick=()=>{input.value=button.dataset.example==='mixed'?mixed:filter;invalidate();generate();};
  $('file').onchange=async event=>{
    const file=event.target.files[0];if (!file)return;
    if (file.size>500000) {status.textContent='File exceeds 500 kB.';return;}
    try {input.value=await file.text();invalidate();generate();} catch(error){status.textContent='File could not be read: '+error.message;}
    finally{event.target.value='';}
  };
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
