import {palette} from '../nature-palette.js';
export const defaultWireColor='#292b29';
export const automaticPalette=[...new Set(['#f6a168','#65a583','#5d8bbf','#c091ab',...[5,6,7,8,4,3,2,1,0].flatMap(shade=>[4,2,0,6,1,3,5,7,8,9].map(family=>palette[family*9+shade]))])];
const valid=color=>/^#[\da-f]{6}$/i.test(color),storageKey='spice-node-colors-v1';
function fingerprint(text){let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return text.length+':'+(hash>>>0);}
export class NodeColors {
  constructor(){this.sourceId='';this.auto=false;this.manual=new Map();this.assigned=new Map();}
  setSource(source){const id=fingerprint(source);if(id!==this.sourceId){this.sourceId=id;this.manual.clear();this.assigned.clear();}}
  color(name){if(this.manual.has(name))return this.manual.get(name);if(!this.auto)return defaultWireColor;if(!this.assigned.has(name))this.assigned.set(name,automaticPalette[this.assigned.size%automaticPalette.length]);return this.assigned.get(name);}
  set(names,color){if(!valid(color))throw Error('Invalid node color.');for(const name of names)this.manual.set(name,color.toLowerCase());}
  reset(){this.auto=false;this.manual.clear();this.assigned.clear();}
  restore(data){if(!data||typeof data.sourceId!=='string')return;this.sourceId=data.sourceId;this.auto=data.auto===true;for(const key of ['manual','assigned'])this[key]=new Map((Array.isArray(data[key])?data[key]:[]).filter(pair=>Array.isArray(pair)&&typeof pair[0]==='string'&&valid(pair[1])));}
  snapshot(){return {sourceId:this.sourceId,auto:this.auto,manual:[...this.manual],assigned:[...this.assigned]};}
}
/** Top-level wires and junctions only: never change component-owned geometry. */
export function colorSvgNets(svg,nodes,state){
  const colors=new Map(nodes.map(n=>[n.name,state.color(n.name)]));
  for(const element of svg.children)if(['line','path','polyline','circle'].includes(element.localName)&&element.hasAttribute('data-net')){
    const color=colors.get(element.getAttribute('data-net'));if(!color)continue;
    element.style.setProperty('stroke',color,'important');if(element.localName==='circle')element.style.setProperty('fill',color,'important');
  }
}
export function createNodeColorControls($,onChange){
  const state=new NodeColors(),selected=new Set();let nodes=[],enabled=false;
  try{state.restore(JSON.parse(sessionStorage.getItem(storageKey)||'null'));}catch{}
  const save=()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(state.snapshot()));}catch{}};
  const visible=()=>{const query=$('node-search').value.trim().toLowerCase();return nodes.filter(n=>!query||[n.name,n.displayName,...n.terminals.map(t=>t.component+'.'+t.pin)].some(s=>s.toLowerCase().includes(query)));};
  function toolbar(){const filtered=visible(),count=filtered.filter(n=>selected.has(n.name)).length;$('node-count').textContent=`${filtered.length} / ${nodes.length} nodes · ${selected.size} selected`;$('node-all').checked=!!filtered.length&&count===filtered.length;$('node-all').indeterminate=count>0&&count<filtered.length;$('node-auto').checked=state.auto;for(const id of ['node-apply','node-clear'])$(id).disabled=!enabled||!selected.size;$('node-all').disabled=!enabled||!filtered.length;}
  function render(){
    $('nets').replaceChildren(...visible().map(n=>{
      const row=document.createElement('tr');row.dataset.node=n.name;
      const choose=document.createElement('td'),check=document.createElement('input');check.type='checkbox';check.checked=selected.has(n.name);check.disabled=!enabled;check.setAttribute('aria-label','Select node '+n.displayName);check.onchange=()=>{check.checked?selected.add(n.name):selected.delete(n.name);toolbar();};choose.append(check);
      const name=document.createElement('td');name.textContent=n.displayName;
      const colorCell=document.createElement('td'),input=document.createElement('input');input.type='color';input.value=state.color(n.name);input.disabled=!enabled;input.setAttribute('aria-label','Wire color for '+n.displayName);input.onchange=()=>{state.set([n.name],input.value);changed();};colorCell.append(input);
      const terminals=document.createElement('td');terminals.textContent=n.terminals.map(t=>t.component+'.'+t.pin).join(', ');row.append(choose,name,colorCell,terminals);return row;
    }));toolbar();
  }
  function changed(){for(const n of nodes)state.color(n.name);render();save();onChange(state,nodes);}
  $('node-search').oninput=render;
  $('node-all').onchange=()=>{for(const n of visible())$('node-all').checked?selected.add(n.name):selected.delete(n.name);render();};
  $('node-auto').onchange=()=>{state.auto=$('node-auto').checked;changed();};
  $('node-apply').onclick=()=>{state.set(selected,$('node-color').value);changed();};
  $('node-clear').onclick=()=>{state.set(selected,defaultWireColor);changed();};
  $('node-reset').onclick=()=>{state.reset();changed();};
  $('node-swatches').replaceChildren(...palette.map(color=>{const button=document.createElement('button');button.type='button';button.style.backgroundColor=color;button.title=color;button.setAttribute('aria-label','Apply palette color '+color);button.onclick=()=>{if(!selected.size)return;$('node-color').value=color;state.set(selected,color);changed();};return button;}));
  function setEnabled(value){enabled=value;for(const element of $('node-panel').querySelectorAll('input,button'))element.disabled=!enabled;toolbar();}
  return {snapshot:()=>state.snapshot(),restore(data){state.restore(data);selected.clear();changed();},setCircuit(circuit,source){const previous=state.sourceId;state.setSource(source);if(previous!==state.sourceId)selected.clear();nodes=Object.values(circuit?.nodes||{});const available=new Set(nodes.map(n=>n.name));for(const name of selected)if(!available.has(name))selected.delete(name);for(const n of nodes)state.color(n.name);enabled=!!circuit;render();setEnabled(enabled);save();onChange(state,nodes);},setEnabled};
}
