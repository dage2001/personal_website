/** Workspace chrome is independent of parser, layout, drawing and UI framework.
 * A future React host can mount/destroy this controller without owning the SVG. */
export function createWorkspace(root){
  const $=id=>root.querySelector('#spice-'+id),abort=new AbortController(),signal=abort.signal;
  const panels={editor:$('editor-panel'),details:$('details-panel'),info:$('info-panel')},handles=Object.fromEntries(Object.keys(panels).map(id=>[id,root.querySelector(`[data-window-handle="${id}"]`)]));
  const visible={editor:true,details:true,info:true},pinned={editor:true,details:true,info:true},docked=[],styles={editor:{},details:{},info:{}},siblings=[];let active=false,nativeRequested=false,previousFocus=null,scroll=null,drag=null,mountAnchor=null;
  function pin(id,value){pinned[id]=value;panels[id].dataset.pinned=String(value);const button=$('pin-'+id),name={editor:'netlist',details:'details',info:'messages'}[id],edge=id==='info'?'bottom edge':id==='details'?'lower left':'left edge',label=value?`Unpin ${name} from ${edge}`:`Pin ${name} to ${edge}`;button.setAttribute('aria-pressed',String(value));button.setAttribute('aria-label',label);button.title=label;if(value)for(const p of ['left','top','right','bottom','width','height'])panels[id].style.removeProperty(p);if(active)requestAnimationFrame(clamp);}
  for(const id of Object.keys(panels))pin(id,true);
  const emit=()=>root.dispatchEvent(new CustomEvent('spice:workspacechange',{detail:{fullscreen:active,panels:{...visible}}}));
  const listen=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal});
  function showPanel(id,value){visible[id]=value;panels[id].hidden=active&&!value;requestAnimationFrame(clamp);emit();}
  function dock(node,target=$('details-content')){const anchor=document.createComment('workspace return');node.before(anchor);docked.push({node,anchor});if(target===$('details-content'))target.prepend(node);else target.append(node);}
  function bounds(panel){const r=panel.getBoundingClientRect(),host=root.getBoundingClientRect();return {x:r.left-host.left,y:r.top-host.top,w:r.width,h:r.height,width:host.width,height:host.height};}
  function move(panel,x,y){const b=bounds(panel),top=parseFloat(getComputedStyle(root).getPropertyValue('--spice-window-top'))||100;const left=Math.max(8,Math.min(x,b.width-b.w-8)),upper=Math.max(8,Math.min(top,b.height-b.h-8)),above=Math.max(upper,Math.min(y,b.height-b.h-8));panel.style.left=Math.round(left)+'px';panel.style.top=Math.round(above)+'px';panel.style.right='auto';panel.style.bottom='auto';}
  function adaptMessages(){if(!active||!pinned.info||panels.info.hidden)return;const host=root.getBoundingClientRect(),gutter=host.width<=600?8:12,side=host.width<=600?gutter:Math.max(gutter,...['editor','details'].filter(id=>pinned[id]&&!panels[id].hidden).map(id=>panels[id].getBoundingClientRect().right-host.left+12)),left=Math.min(side,Math.max(gutter,host.width-160-gutter)),panel=panels.info;for(const [p,v]of Object.entries({left:Math.round(left)+'px',right:gutter+'px',width:'auto'}))if(panel.style[p]!==v)panel.style[p]=v;}
  function clamp(){if(active){adaptMessages();for(const [id,panel]of Object.entries(panels))if(!panel.hidden&&!pinned[id]){const b=bounds(panel);move(panel,b.x,b.y);}}}
  function reset(){for(const panel of Object.values(panels)){for(const property of ['left','top','right','bottom','width','height','z-index'])panel.style.removeProperty(property);}for(const id of Object.keys(panels)){pin(id,true);showPanel(id,true);}requestAnimationFrame(clamp);}
  function activate(){
    if(active)return;active=true;previousFocus=document.activeElement;scroll={x:window.scrollX,y:window.scrollY,html:document.documentElement.style.overflow,body:document.body.style.overflow};
    // Portal out of animated/transformed site containers, which can trap fixed
    // positioning in CSS fallback mode. Move the real DOM; never clone editors.
    mountAnchor=document.createComment('workspace mount');root.before(mountAnchor);document.body.append(root);
    for(const node of document.body.children)if(node!==root){siblings.push({node,inert:node.inert});node.inert=true;}
    document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';root.classList.add('spice-is-fullscreen');$('fullscreen').setAttribute('aria-pressed','true');
    for(const id of Object.keys(panels)){styles[id].base=panels[id].style.cssText;if(styles[id].floating)panels[id].style.cssText=styles[id].floating;panels[id].setAttribute('role','dialog');panels[id].setAttribute('aria-modal','false');panels[id].setAttribute('aria-labelledby','spice-'+id+'-title');handles[id].tabIndex=0;handles[id].title='Drag to move; arrow keys move the window';showPanel(id,visible[id]);}
    for(const id of ['selection-actions','selection','hierarchy-panel'])dock($(id));
    const strip=$('workspace-strip');for(const id of ['hierarchy-bar','canvas-toolbar','edit-toolbar']){if(strip.childElementCount){const divider=document.createElement('span');divider.className='spice-tool-divider';divider.setAttribute('role','separator');divider.setAttribute('aria-orientation','vertical');strip.append(divider);}dock(id==='hierarchy-bar'?root.querySelector('.spice-hierarchy-bar'):$(id),strip);}
    requestAnimationFrame(clamp);$('exit-fullscreen').focus({preventScroll:true});emit();
  }
  function deactivate(){
    if(!active)return;active=false;drag=null;root.classList.remove('spice-is-fullscreen');root.removeAttribute('data-native-fullscreen');$('fullscreen').setAttribute('aria-pressed','false');
    for(const {node,anchor}of docked.splice(0)){anchor.before(node);anchor.remove();}
    $('workspace-strip').replaceChildren();
    for(const id of Object.keys(panels)){styles[id].floating=panels[id].style.cssText;panels[id].style.cssText=styles[id].base;panels[id].hidden=false;for(const a of ['role','aria-modal','aria-labelledby'])panels[id].removeAttribute(a);handles[id].removeAttribute('tabindex');handles[id].removeAttribute('title');}
    if(mountAnchor){mountAnchor.before(root);mountAnchor.remove();mountAnchor=null;}
    for(const {node,inert}of siblings.splice(0))node.inert=inert;
    if(scroll){document.documentElement.style.overflow=scroll.html;document.body.style.overflow=scroll.body;window.scrollTo(scroll.x,scroll.y);}previousFocus?.focus?.({preventScroll:true});emit();
  }
  // Native fullscreen reserves Escape before page handlers can cancel a route.
  // Use viewport fullscreen so Escape has one predictable editing meaning.
  async function enter(){activate();root.dataset.nativeFullscreen='false';}
  async function exit(){nativeRequested=false;if(document.fullscreenElement===root){try{await document.exitFullscreen();}catch{nativeRequested=true;return;}}deactivate();}
  listen($('fullscreen'),'click',()=>active?exit():enter());listen($('exit-fullscreen'),'click',exit);listen($('reset-windows'),'click',reset);
  for(const id of Object.keys(panels)){
    listen($('pin-'+id),'click',()=>{const b=bounds(panels[id]);pin(id,!pinned[id]);if(!pinned[id]){panels[id].style.width=b.w+'px';panels[id].style.height=b.h+'px';move(panels[id],b.x,b.y);}emit();});
    listen($('close-'+id),'click',()=>{showPanel(id,false);$('reset-windows').focus({preventScroll:true});});
    listen(panels[id],'pointerdown',()=>{if(active){for(const panel of Object.values(panels))panel.style.zIndex='20';panels[id].style.zIndex='30';}},{capture:true});
    const handle=handles[id];
    listen(handle,'pointerdown',event=>{if(!active||event.button!==0||event.target.closest('button,input,select,textarea,a,label'))return;event.preventDefault();const b=bounds(panels[id]);pin(id,false);panels[id].style.width=b.w+'px';panels[id].style.height=b.h+'px';move(panels[id],b.x,b.y);drag={id,pointer:event.pointerId,x:event.clientX,y:event.clientY,left:b.x,top:b.y};handle.setPointerCapture(event.pointerId);});
    listen(handle,'pointermove',event=>{if(drag?.id===id&&drag.pointer===event.pointerId)move(panels[id],drag.left+event.clientX-drag.x,drag.top+event.clientY-drag.y);});
    const end=()=>{drag=null;};listen(handle,'pointerup',end);listen(handle,'pointercancel',end);listen(handle,'lostpointercapture',end);
    listen(handle,'keydown',event=>{if(!active||event.target!==handle||!event.key.startsWith('Arrow'))return;event.preventDefault();const b=bounds(panels[id]),step=event.shiftKey?32:8;pin(id,false);panels[id].style.width=b.w+'px';panels[id].style.height=b.h+'px';move(panels[id],b.x+({'ArrowLeft':-step,'ArrowRight':step}[event.key]||0),b.y+({'ArrowUp':-step,'ArrowDown':step}[event.key]||0));});
  }
  listen(document,'fullscreenchange',()=>{if(active&&nativeRequested&&document.fullscreenElement!==root){nativeRequested=false;deactivate();}});
  listen(document,'keydown',event=>{if(active&&event.altKey&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();exit();}},{capture:true});
  listen(window,'resize',clamp);
  const observer=new ResizeObserver(clamp);for(const panel of Object.values(panels))observer.observe(panel);
  return {enter,exit,showPanel,reset,destroy(){exit();abort.abort();observer.disconnect();}};
}
