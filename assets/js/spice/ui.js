import {parseHierarchy} from './hierarchy-parser.js';
import {elaborateCircuit} from './elaborate.js';
import {projectHierarchy,toNetlistsvg} from './layout-adapter.js';
import {renderSchematic} from './renderer.js';
import {examples} from './examples.js';
import {readSpiceFile} from './file-text.js';
import {layoutRulesVersion} from './layout-semantics.js';
import './viewer.css';
import {createNodeColorControls,colorSvgNets,defaultWireColor} from './node-colors.js';
import {createWorkspace} from './workspace.js';
import {createInteractiveEditor,prepareRoutingDrawing} from './interactive-editor.js';
import {showCoordinateGrid} from './svg-grid.js';
import {mountToolIcons} from './tool-icons.js';
import {symbolGridSize} from './short-pins.js';
import {placeDomLabels} from './label-placement.js';
import {decodeProject,encodeProject,maxProjectBytes,restoreProjectScene} from './project-file.js';
const filter=examples.filter.source;

const $ = id => document.getElementById('spice-' + id);
const root = $('app');
if (root) {
  mountToolIcons(root);
  createWorkspace(root);
  const input = $('input'), preview = $('preview'), status = $('status'), diagnostics = $('diagnostics');
  let drawing=null,ascPackage=null,ascExporting=false,editor=null,colorState=null,colorNodes=[];
  let svgText = '', circuit, tree, ir, lastSource='', focus='', selectedInstance='', busy = false, view = {x:0,y:0,w:1,h:1}, full = {...view}, drag;
  let pendingRoute=false,libraries={};
  let sheetViews=new Map(),projectLoading=false;
  try{libraries=JSON.parse(sessionStorage.getItem('spice-libraries-v3')||'{}');}catch{}
  root.addEventListener('click',event=>{if(busy&&event.target.closest('a[href^="#"]'))event.preventDefault();});
  const exports = () => { $('upload').disabled=busy||projectLoading||ascExporting; $('download-project').disabled=$('open-download').disabled = $('copy').disabled = $('download').disabled = !svgText || busy || projectLoading || editor?.working(); $('download-asc').disabled=$('download-asc-bundle').disabled=!svgText||!drawing||busy||ascExporting||!editor?.complete(); };
  const settings = () => ({font:$('font').value, fontSize:Number($('size').value), color:defaultWireColor,gridSize:$('grid').checked&&$('conventional').checked?symbolGridSize:0,detailed:$('detailed').checked,conventional:$('conventional').checked});
  const displayGridStep=()=>circuit?.layout.report?.gridSize?Number($('grid-size').value):0;
  function syncSource(){const svg=preview.querySelector('svg');if(!svg)return;const font=Number(svg.querySelector('style')?.textContent.match(/font-size:([\d.]+)px/)?.[1])||12,b=placeDomLabels(svg,font),x=Math.min(full.x,b.x-20),y=Math.min(full.y,b.y-20);full={x,y,w:Math.max(full.x+full.w,b.right+20)-x,h:Math.max(full.y+full.h,b.bottom+20)-y};if(colorState)colorSvgNets(svg,colorNodes,colorState);editor?.refreshColors();showCoordinateGrid(svg,displayGridStep(),$('show-grid').checked,view);const exported=svg.cloneNode(true);editor?.cleanExport(exported);exported.setAttribute('width',full.w);exported.setAttribute('height',full.h);exported.setAttribute('viewBox',`${full.x} ${full.y} ${full.w} ${full.h}`);showCoordinateGrid(exported,displayGridStep(),$('show-grid').checked,full);svgText=new XMLSerializer().serializeToString(exported);$('source').value=svgText;}
  const nodeColors=createNodeColorControls($,(state,nodes)=>{colorState=state;colorNodes=nodes;syncSource();});
  editor=createInteractiveEditor(preview,$,{getNetColor:bit=>{const n=colorNodes.find(n=>n.bit===bit);return n&&colorState&&(colorState.auto||colorState.manual.has(n.name))?colorState.color(n.name):null;},inspect:id=>{const c=circuit?.components.find(c=>c.name===id);if(c){selectedInstance=c.instanceId||'';$('selection').textContent=c.raw;updateSelection();}},changed:(next,stats,bounds)=>{drawing=next;ascPackage=null;full=bounds;const svg=preview.querySelector('svg');if(svg){svg.setAttribute('width',String(full.w));svg.setAttribute('height',String(full.h));const meta=svg.querySelector('#spice-layout-report');if(meta){const r=JSON.parse(meta.textContent);r.manualWiring=stats;r.verifiedTerminals=!stats.unrouted;r.geometricConnectivityVerified=!stats.unrouted;meta.textContent=JSON.stringify(r);}}if(circuit&&ir)$('json').value=JSON.stringify({circuit,netlist:toNetlistsvg(circuit),hierarchy:ir,interactive:{...stats,drawing:next}},null,2);syncSource();exports();}});
  $('show-grid').onchange=syncSource;
  $('grid-size').onchange=()=>{syncSource();setView();};
  async function enableEditing(){if(!drawing||!circuit?.layout.report?.gridVerified){$('grid').checked=true;$('conventional').checked=true;await generate({resetEditor:true});}editor.setEnabled($('interactive').checked);exports();}
  $('interactive').onchange=enableEditing;
  $('flywire').onchange=async()=>{$('interactive').checked=true;await enableEditing();if($('flywire').checked)editor.clear();else await editor.autoRoute();exports();};
  $('auto-route').onclick=async()=>{$('interactive').checked=true;await enableEditing();await editor.autoRoute();exports();};
  $('wire-undo').onclick=()=>editor.undo();$('wire-redo').onclick=()=>editor.redo();
  for(const button of root.querySelectorAll('[data-editor-mode]'))button.onclick=async()=>{$('interactive').checked=true;await enableEditing();editor.chooseTool(button.dataset.editorMode);preview.focus({preventScroll:true});};
  nodeColors.setEnabled(false);
  function showExampleInfo(example) {
    const element=$('example-info');if(!element)return;element.replaceChildren();if(!example)return;
    element.append(document.createTextNode(example.description+' '));
    if(example.url){const link=document.createElement('a');link.href=example.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=example.reference;element.append(link);}
  }
  function invalidate() { editor.invalidate();nodeColors.setEnabled(false);drawing=null;ascPackage=null;svgText = ''; exports(); showExampleInfo(Object.values(examples).find(e=>e.source===input.value));status.textContent = 'Input changed — generate to refresh the schematic.'; }
  input.value = filter;
  try {input.value=sessionStorage.getItem('spice-netlist-v2')||filter;}catch{}
  showExampleInfo(Object.values(examples).find(e=>e.source===input.value));
  input.addEventListener('input', invalidate);
  for (const id of ['font','size','detailed','conventional','grid']) $(id).addEventListener('input', invalidate);
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
    if(!busy&&svgText)sheetViews.set(focus,{...view});
    preview.querySelector('svg')?.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    const svg=preview.querySelector('svg');if(svg)showCoordinateGrid(svg,displayGridStep(),$('show-grid').checked,view);
    $('zoom-level').textContent = Math.round(full.w / view.w * 100) + '%';
  }
  const gridViewportObserver=new ResizeObserver(()=>{const svg=preview.querySelector('svg');if(svg)showCoordinateGrid(svg,displayGridStep(),$('show-grid').checked,view);});gridViewportObserver.observe(preview);
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
    if (![0,1].includes(event.button) || !preview.querySelector('svg')) return;
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
        if(component.kind==='X')route(component.instanceId);
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
  window.addEventListener('hashchange',()=>{if(busy){pendingRoute=true;return;}readRoute();selectedInstance='';generate();});
  function updateSelection() {
    const valid=Boolean(selectedInstance&&selectedInstance!==focus&&tree?.contexts[selectedInstance]);
    $('selection-actions').hidden=!valid;
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
        const link=document.createElement('a');link.href='#'+new URLSearchParams({instance:child.id});link.textContent=child.name+' · '+child.definition;link.title='Open '+child.id+' as its own sheet';
        const params=document.createElement('span');params.className='spice-help';params.textContent=Object.entries(child.params).map(([k,v])=>k+'='+v).join(' · ');
        row.append(link);if(params.textContent){const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Parameters';detail.append(summary,params);row.append(detail);}
        $('instances').append(row);walk(child,depth+1);
      }
    };
    walk(tree.contexts[focus],0);
    $('hierarchy-panel').hidden=!tree.contexts[focus].children.length;
    $('focus-title').textContent=focus?focus+' / '+tree.contexts[focus].definition:'Top-level schematic';
    updateSelection();
  }
  preview.addEventListener('pointercancel', () => {drag=null;});
  preview.addEventListener('keydown', event => {
    const block=event.target.closest('[data-instance]');
    if(block&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectedInstance=block.dataset.instance;route(selectedInstance);return;}
    if (event.key === '+' || event.key === '=') zoom(.8);
    else if (event.key === '-') zoom(1.25);
    else if (event.key.toLowerCase() === 'f') {view={...full};setView();}
    else if (event.key.startsWith('Arrow')) {event.preventDefault();view.x+=({'ArrowLeft':-.08,'ArrowRight':.08}[event.key]||0)*view.w;view.y+=({'ArrowUp':-.08,'ArrowDown':.08}[event.key]||0)*view.h;setView();}
  });
  async function generate({resetEditor=false}={}) {
    if (busy) return;
    busy=true; editor.invalidate();nodeColors.setEnabled(false);drawing=null;ascPackage=null;svgText=''; exports(); $('generate').disabled=true;
    input.readOnly=true; $('file').disabled=true;$('libraries').disabled=true;
    for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button')) element.disabled=true;
    status.textContent='Parsing netlist and routing wires…'; preview.setAttribute('aria-busy','true');
    let items=[];
    try {
      if(lastSource!==input.value||!tree) {
        if(lastSource&&lastSource!==input.value){editor.clearSheets();sheetViews.clear();}
        ir=parseHierarchy(input.value,{files:libraries});items=[...ir.diagnostics];
        if(items.some(d=>d.severity==='error')){tree=null;throw Error('Fix the parser errors below before generating.');}
        tree=elaborateCircuit(ir);
        if(lastSource&&lastSource!==input.value){focus='';selectedInstance='';history.replaceState(null,'',location.pathname+location.search);}
        else readRoute();
        lastSource=input.value;
        try{sessionStorage.setItem('spice-netlist-v2',input.value);}catch{}
      }
      items=[...ir.diagnostics];showDiagnostics(items);
      if (items.some(d=>d.severity==='error')) throw Error('Fix the parser errors below before generating.');
      circuit=projectHierarchy(tree,{focus});
      for(const alias of circuit.interfaceAliases)items.push({severity:'info',message:`Instance boundary: ${alias.ports.join(' = ')} share parent node ${alias.node}. This connection belongs to the parent sheet only; local formal ports remain independent.`});
      const netlist=toNetlistsvg(circuit);
      if(settings().conventional)items.push(...circuit.layout.diagnostics);
      const rendered=await renderSchematic(netlist,settings());
      const documentSVG=new DOMParser().parseFromString(rendered.svg,'image/svg+xml');
      if (documentSVG.querySelector('parsererror')) throw Error('Renderer produced invalid SVG.');
      const svg=documentSVG.documentElement;
      const layoutReport=svg.querySelector('#spice-layout-report');
      if(layoutReport) {
        circuit.layout.report=JSON.parse(layoutReport.textContent);
        const r=circuit.layout.report;
        items.push({severity:'info',message:`Layout: compact signal flow; ${r.powerSourcesChecked} DC/ground symbols checked, ${r.powerOrderViolations} DC order preference(s) unmet. ${r.powerPass}. ${r.classicRails?'Fixed local voltage rails.':'Global voltage bands are a preference.'}`});
        if(r.classicTemplateFallback)items.push({severity:'info',message:'Some local branches could not use the classic template without crossing symbols; automatic layout was used.'});
        if(r.groundPlacement)items.push({severity:'info',message:`Ground: ${r.groundPlacement}; ${r.straightenedGroundDrops||0} return-path simplification(s).`});
        if(r.explicitGroups)items.push({severity:'info',message:`Layout comments: ${r.explicitGroups} visual groups; nested row/column placement retained on expansion.`});
        if(r.classicRails)items.push({severity:'info',message:`Transistor layout: local load/bias branches; ${r.railCount} shared voltage rails.`});
        if(r.localClassicInstances?.length)items.push({severity:'info',message:`${r.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.`});
        if(r.localClassicStages?.length)items.push({severity:'info',message:`Classic transistor proximity active: ${r.localClassicStages.join(', ')}.`});
        if(r.sharedClassicRails)items.push({severity:'info',message:'Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes.'});
        if(r.mirroredTransistors?.length)items.push({severity:'info',message:`Control-pin mirror choices: ${r.mirroredTransistors.join(', ')}.`});
        if(r.recognizedMotifs?.length)items.push({severity:'info',message:`Transistor structures: ${r.recognizedMotifs.map(m=>`${m.kind} (${m.members.join(', ')}; ${m.confidence})`).join('; ')}.`});
        if(r.appliedMotifs?.length)items.push({severity:'info',message:`Topology preferences applied to ${r.appliedMotifs.length} local structure(s); ELK still determines placement and routing.`});
        if(r.subnetFirstFallback)items.push({severity:'warning',message:'Subnet attachment kept the previous safe placement: '+r.subnetFirstFallback});
        if(r.pairCompactionFallback)items.push({severity:'warning',message:'Pair proximity kept the original regions: '+r.pairCompactionFallback});
        if(r.compoundPairFallback)items.push({severity:'warning',message:'Compound-pair placement fell back to proximity rules: '+r.compoundPairFallback});
        if(r.pairConstraints?.length){const cross=r.pairConstraints.filter(p=>p.crossRegion&&!p.compacted).length;items.push({severity:'info',message:`${r.pairConstraints.length-cross} adjacent transistor pair(s); ${cross} cross-region mirror row constraint(s).`});}
        if(r.netShortcuts)items.push({severity:'info',message:`${r.netShortcuts} safe straight net shortcut(s); ${r.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.`});
        if(r.sharedRailFallback)items.push({severity:'warning',message:`Shared rail layout uses an automatic fallback: ${r.sharedRailFallback}.`});
        for(const f of r.localClassicFallbacks||[])if(f.stage)items.push({severity:'info',message:`Classic stage ${f.stage} uses automatic layout: ${f.reason||'No unobstructed local template'}.`});
        if(r.geometricConnectivityVerified)items.push({severity:'info',message:`Net geometry verified; ${r.cyclesRemoved} same-net loop(s) and ${r.leavesRemoved} unused wire branch(es) removed.`});
        showDiagnostics(items);
      }
      if (svg.localName!=='svg' || svg.querySelector('script,foreignObject')) throw Error('Invalid schematic output.');
      const width=Number(svg.getAttribute('width')),height=Number(svg.getAttribute('height'));
      const lb=JSON.parse(svg.getAttribute('data-label-bounds')||'null');full={x:Math.min(-20,(lb?.x??0)-20),y:Math.min(-20,(lb?.y??0)-20)};full.w=Math.max(width,lb?.right||0)+20-full.x;full.h=Math.max(height,lb?.bottom||0)+20-full.y;view={...full};
      svg.setAttribute('viewBox',`${full.x} ${full.y} ${full.w} ${full.h}`);
      svg.setAttribute('width',String(full.w));svg.setAttribute('height',String(full.h));
      svg.setAttribute('role','img');svg.setAttribute('aria-label',circuit.title||'SPICE schematic');
      svg.setAttribute('style','background:white');
      for (const c of circuit.components) {
        const element=documentSVG.getElementById('cell_'+c.name);
        if (!element) throw Error('Renderer omitted component '+c.name);
        element.setAttribute('data-component',c.name);
        if(c.kind==='X'){element.setAttribute('data-instance',c.instanceId);element.setAttribute('role','button');element.setAttribute('tabindex','0');element.setAttribute('aria-label','Open '+c.name);}
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
      drawing=rendered.drawing;svgText=new XMLSerializer().serializeToString(svg); $('source').value=svgText;
      preview.replaceChildren(document.importNode(svg,true)); setView();
      const warnings=items.filter(d=>d.severity==='warning').length;
      status.textContent=`${circuit.components.filter(c=>!c.synthetic).length} components · ${Object.keys(circuit.nodes).length} nodes · ${circuit.topology.leafCount} primitive devices verified${circuit.interfaceAliases.length?' · Parent-connected ports: '+circuit.interfaceAliases.map(a=>a.ports.join(' = ')).join('; ')+'.':''}${warnings?' · Review '+warnings+' warning(s); drawing may be partial.':' · Schematic ready.'}`;
      status.textContent+=` Layout rules v${layoutRulesVersion}.`;if(circuit.layout.report?.gridVerified)status.textContent+=` Grid ${circuit.layout.report.gridSize}.`;
      if(circuit.layout?.report?.powerOrderViolations)status.textContent+=` Layout: ${circuit.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`;
      if(circuit.layout?.report?.groundPlacement?.startsWith('ELK fallback'))status.textContent+=' Ground marker: routed fallback; no safe short attachment found.';
      $('json').value=JSON.stringify({circuit,netlist,hierarchy:ir},null,2);nodeColors.setCircuit(circuit,input.value);editor.mount(preview.querySelector('svg'),drawing,circuit,netlist,settings(),{reset:resetEditor,scope:focus});syncSource();
      if(!resetEditor&&sheetViews.has(focus))view={...sheetViews.get(focus)};
      else sheetViews.set(focus,{...view});setView();
      $('selection').textContent='Click a component to inspect its original statement and pin connections.';
      updateHierarchy();
    } catch(error) {
      preview.replaceChildren(); svgText=''; $('source').value=''; $('json').value=''; $('nets').replaceChildren();
      $('selection').textContent=''; status.textContent=error.message;
      if(!tree){$('hierarchy-panel').hidden=true;$('selection-actions').hidden=true;$('breadcrumbs').replaceChildren();}
      else if(!tree.contexts[focus]){const home=document.createElement('button');home.type='button';home.textContent='Return to Top';home.onclick=()=>route('');$('breadcrumbs').replaceChildren(home);}
      nodeColors.setCircuit(null,input.value);
      if(error.diagnostics)items=error.diagnostics;
      if (!items.some(d=>d.severity==='error')) items.push({severity:'error',line:0,message:error.message});
      showDiagnostics(items);
    } finally {
      busy=false; $('generate').disabled=false; input.readOnly=false; $('file').disabled=false;$('libraries').disabled=false;
      for (const element of root.querySelectorAll('[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button')) element.disabled=false;
      if(tree&&tree.contexts[focus])updateHierarchy();
      nodeColors.setEnabled(!!svgText);preview.setAttribute('aria-busy','false');exports();
      if(pendingRoute){pendingRoute=false;readRoute();queueMicrotask(generate);}
    }
  }
  $('generate').onclick=()=>generate({resetEditor:true});
  for (const button of root.querySelectorAll('[data-example]')) button.onclick=()=>{const example=examples[button.dataset.example];input.value=example.source;invalidate();showExampleInfo(example);generate();};
  $('file').onchange=async event=>{
    const file=event.target.files[0];if (!file)return;
    if(busy||projectLoading){event.target.value='';return;}
    try {
      const isProject=/\.(spiceproj|json)$/i.test(file.name);
      if(file.size>(isProject?maxProjectBytes:2000000))throw Error(isProject?'Project exceeds 32 MB.':'Netlist exceeds 2 MB.');
      if(isProject)await openProject(await file.text());
      else{input.value=await readSpiceFile(file);invalidate();await generate();}
    } catch(error){status.textContent='File could not be opened: '+error.message;}
    finally{event.target.value='';exports();}
  };
  async function openProject(text){
    projectLoading=true;exports();const wasInert=root.inert;root.inert=true;
    try{
      const p=decodeProject(text),nextIR=parseHierarchy(p.source,{files:p.libraries});
      if(nextIR.diagnostics.some(d=>d.severity==='error'))throw Error('Project netlist has parser errors. Current work was kept.');
      const nextTree=elaborateCircuit(nextIR);
      if(!nextTree.contexts[p.focus])throw Error('Saved sheet is not present in the netlist.');
      // Check all saved sheets against the source before replacing the current work.
      for(const s of p.sheets){
        if(!nextTree.contexts[s.scope])throw Error('Unknown saved sheet: '+s.scope);
        const c=projectHierarchy(nextTree,{focus:s.scope});
        if(c.topology.signature!==s.topology)throw Error('Saved topology differs from the netlist: '+(s.scope||'Top'));
        const expected=new Map(c.components.filter(c=>c.kind!=='K').map(c=>[c.name,c]));
        for(const n of s.snapshot.components){if(n.decoration)continue;const d=expected.get(n.id);if(!d||n.ports.length!==Object.keys(d.terminals).length||n.ports.some(p=>c.nodes[d.terminals[p.pin]]?.bit!==p.bit))throw Error('Saved pin connectivity differs from the netlist: '+n.id);expected.delete(n.id);}
        if(expected.size)throw Error('Saved sheet omits components.');
        status.textContent='Checking saved sheet '+(s.scope||'Top')+'…';
        const netlist=toNetlistsvg(c),rendered=await renderSchematic(netlist,s.settings),svg=new DOMParser().parseFromString(rendered.svg,'image/svg+xml').documentElement;
        for(const n of Object.values(c.nodes))for(const element of svg.querySelectorAll('.net_'+n.bit))element.setAttribute('data-net',n.name);
        restoreProjectScene(prepareRoutingDrawing(svg,rendered.drawing,c,netlist),s.snapshot,s.settings.gridSize);
      }
      if(!p.sheets.some(s=>s.scope===p.focus&&JSON.stringify(s.settings)===JSON.stringify(p.settings))){
        status.textContent='Checking current sheet…';await renderSchematic(toNetlistsvg(projectHierarchy(nextTree,{focus:p.focus})),p.settings);
      }
      editor.invalidate();editor.restoreSheets(p.sheets);sheetViews=new Map(p.sheets.filter(s=>s.view).map(s=>[s.scope,s.view]));sheetViews.set(p.focus,p.view);
      input.value=p.source;libraries=p.libraries;tree=nextTree;ir=nextIR;lastSource=p.source;focus=p.focus;selectedInstance='';
      for(const id of ['font','size'])$(id).value=id==='font'?p.settings.font:p.settings.fontSize;
      for(const [id,value]of Object.entries({detailed:p.settings.detailed,conventional:p.settings.conventional,grid:!!p.settings.gridSize,'show-grid':p.showGrid,interactive:p.interactive,flywire:p.flywire}))$(id).checked=value;
      $('grid-size').value=p.displayGridStep;
      history.replaceState(null,'',location.pathname+location.search+(focus?'#'+new URLSearchParams({instance:focus}):''));
      nodeColors.restore(p.colors);showExampleInfo(Object.values(examples).find(e=>e.source===input.value));
      try{sessionStorage.setItem('spice-libraries-v3',JSON.stringify(libraries));sessionStorage.setItem('spice-netlist-v2',input.value);}catch{}
      $('library-status').textContent=Object.keys(libraries).length+' project library file(s) loaded';
      await generate();if(svgText)status.textContent+=' Project restored.';
    }finally{root.inert=wasInert;projectLoading=false;exports();}
  }
  $('libraries').onchange=async event=>{
    try{
      for(const file of event.target.files){if(file.size>16000000)throw Error('Library exceeds 16 MB: '+file.name);libraries[file.webkitRelativePath||file.name]=await readSpiceFile(file);}
      try{sessionStorage.setItem('spice-libraries-v3',JSON.stringify(libraries));}catch{}
      editor.invalidate();editor.clearSheets();sheetViews.clear();tree=null;lastSource='';$('library-status').textContent=Object.keys(libraries).length+' library file(s) loaded';generate();
    }catch(error){status.textContent=error.message;}
    finally{event.target.value='';}
  };
  $('library-status').textContent=Object.keys(libraries).length?'Libraries restored from this session.':'For .include / .lib dependencies';
  const downloadDialog=$('download-dialog');
  root.addEventListener('spice:workspacechange',()=>{if(downloadDialog.open)downloadDialog.close();});
  $('open-download').onclick=()=>{exports();downloadDialog.showModal();};
  $('close-download').onclick=()=>downloadDialog.close();
  downloadDialog.addEventListener('click',event=>{if(event.target!==downloadDialog)return;const b=downloadDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)downloadDialog.close();});
  // Keep modal keyboard events out of the schematic editing shortcuts.
  document.addEventListener('keydown',event=>{if(downloadDialog.open&&!(event.altKey&&event.key==='Escape')){event.stopImmediatePropagation();if(event.key==='Escape'){event.preventDefault();downloadDialog.close();}}},{capture:true});
  $('upload').onclick=()=>$('file').click();
  $('download-project').onclick=()=>{
    try{
      const sheets=editor.snapshotSheets().filter(s=>tree?.contexts[s.scope]&&projectHierarchy(tree,{focus:s.scope}).topology.signature===s.topology).map(s=>({...s,...(sheetViews.has(s.scope)?{view:sheetViews.get(s.scope)}:{})}));
      const text=encodeProject({source:input.value,libraries,settings:settings(),displayGridStep:Number($('grid-size').value),showGrid:$('show-grid').checked,interactive:$('interactive').checked,flywire:$('flywire').checked,focus,view:{...view},colors:nodeColors.snapshot(),sheets});
      downloadDialog.close();const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='spice-schematic.spiceproj';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Project saved. Upload the .spiceproj file to resume editing.';
    }catch(error){status.textContent='Project save failed: '+error.message;}
  };
  $('download').onclick=()=>{
    downloadDialog.close();
    const url=URL.createObjectURL(new Blob([svgText],{type:'image/svg+xml;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='spice-schematic.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  async function downloadAsc(bundle) {
    const snapshot=drawing;if(!snapshot||busy||ascExporting)return;
    ascExporting=true;exports();status.textContent='Generating ASC from the selected layout and checking connections…';
    try {
      const {exportAsc}=await import('./asc-export.js');
      if(drawing!==snapshot)throw Error('Schematic changed. Generate again before exporting ASC.');
      ascPackage ||= exportAsc({tree,circuit,drawing:snapshot,source:input.value,libraries});
      const bytes=bundle?ascPackage.zip:ascPackage.ascBytes;
      const url=URL.createObjectURL(new Blob([bytes],{type:bundle?'application/zip':'application/octet-stream'}));
      const a=document.createElement('a');a.href=url;a.download=bundle?'spice-schematic-asc.zip':'spice-schematic.asc';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='ASC connections verified · '+ascPackage.manifest.audit.symbols+' symbols. '+(bundle?'Extract all files together, then open spice-schematic.asc in LTspice.':'This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together.');
      if(ascPackage.manifest.warnings.length)status.textContent+=' '+ascPackage.manifest.warnings.join(' ');
    }catch(error){status.textContent='ASC export failed: '+error.message;const li=document.createElement('li');li.className='error';li.textContent=status.textContent;diagnostics.append(li);}
    finally{ascExporting=false;exports();}
  }
  $('download-asc').onclick=()=>{downloadDialog.close();downloadAsc(false);};
  $('download-asc-bundle').onclick=()=>{downloadDialog.close();downloadAsc(true);};
  $('copy').onclick=async()=>{
    try {await navigator.clipboard.writeText(svgText);status.textContent='SVG source copied to clipboard.';}
    catch { $('source-details').open=true;$('source').focus();$('source').select();status.textContent='Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.'; }
  };
  generate();
}
