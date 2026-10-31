// Lucide SVG subset, vendored with its ISC license in ./icons/.
import move from './icons/move.svg?raw';
import route from './icons/route.svg?raw';
import erase from './icons/eraser.svg?raw';
import rotate from './icons/rotate-cw.svg?raw';
import mirrorX from './icons/flip-vertical-2.svg?raw';
import mirrorY from './icons/flip-horizontal-2.svg?raw';
import zoomIn from './icons/zoom-in.svg?raw';
import zoomOut from './icons/zoom-out.svg?raw';
import fit from './icons/maximize.svg?raw';
import undo from './icons/undo-2.svg?raw';
import redo from './icons/redo-2.svg?raw';
import auto from './icons/wand-sparkles.svg?raw';
import pin from './icons/pin.svg?raw';
import expand from './icons/expand.svg?raw';
import shrink from './icons/shrink.svg?raw';
import reset from './icons/panels-left-bottom.svg?raw';
export function mountToolIcons(root){
  const modes={move,route,erase,rotate,'mirror-x':mirrorX,'mirror-y':mirrorY};
  const ids={'zoom-in':zoomIn,'zoom-out':zoomOut,fit,'wire-undo':undo,'wire-redo':redo,'auto-route':auto,'pin-editor':pin,'pin-info':pin,'pin-details':pin,fullscreen:expand,'exit-fullscreen':shrink,'reset-windows':reset};
  const apply=(button,svg)=>{if(!button)return;const label=button.title||button.getAttribute('aria-label')||button.textContent;button.setAttribute('aria-label',label);button.title=label;button.innerHTML=svg;button.firstElementChild.setAttribute('aria-hidden','true');button.firstElementChild.setAttribute('focusable','false');button.classList.add('spice-icon-button');};
  for(const [mode,svg]of Object.entries(modes))apply(root.querySelector(`[data-editor-mode="${mode}"]`),svg);
  for(const [id,svg]of Object.entries(ids))apply(root.querySelector('#spice-'+id),svg);
}
