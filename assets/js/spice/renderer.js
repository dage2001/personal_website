import {normalizeLayout} from './layout-cache.js';
import {mapTransistorMotifs} from './transistor-motifs.js';
const cache=new Map();let hits=0,misses=0;
export const getLayoutCacheStats=()=>({hits,misses,entries:cache.size});
export async function renderSchematic(netlist, settings) {
  const normalized=normalizeLayout(netlist),key=JSON.stringify([normalized.netlist,settings]);
  let source=cache.get(key);
  if(source){hits++;cache.delete(key);cache.set(key,source);}
  else {
    misses++;source=await renderInWorker(normalized.netlist,settings);
    if(source.svg.length<1000000){cache.set(key,source);if(cache.size>20)cache.delete(cache.keys().next().value);}
  }
  const doc=new DOMParser().parseFromString(source.svg,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw Error('Renderer produced invalid SVG.');
  for(const element of doc.querySelectorAll('[id],[class]')) {
    const id=element.getAttribute('id');
    if(id?.startsWith('cell_')&&normalized.ids.has(id.slice(5)))element.setAttribute('id','cell_'+normalized.ids.get(id.slice(5)));
    const classes=element.getAttribute('class');
    if(classes)element.setAttribute('class',classes.split(/\s+/).map(c=>{
      if(c.startsWith('cell_')&&normalized.ids.has(c.slice(5)))return 'cell_'+normalized.ids.get(c.slice(5));
      if(/^net_\d+$/.test(c)&&normalized.bits.has(Number(c.slice(4))))return 'net_'+normalized.bits.get(Number(c.slice(4)));
      return c;
    }).join(' '));
  }
  const drawing=source.drawing?structuredClone(source.drawing):null;
  const metadata=doc.querySelector('#spice-layout-report');
  if(metadata){const report=JSON.parse(metadata.textContent),device=id=>normalized.ids.get(id)||id;report.mirroredTransistors=(report.mirroredTransistors||[]).map(device);report.orientationDevicesTested=(report.orientationDevicesTested||[]).map(device);report.recognizedMotifs=mapTransistorMotifs(report.recognizedMotifs||[],device,bit=>normalized.bits.get(bit)??bit);for(const p of report.pairConstraints||[])p.members=p.members.map(device);for(const m of report.motifMeasurements||[]){m.members=m.members.map(device);if(m.interlopers)m.interlopers=m.interlopers.map(device);}for(const rail of report.voltageRails||[])if(rail.bit!==undefined)rail.bit=normalized.bits.get(rail.bit)??rail.bit;metadata.textContent=JSON.stringify(report);}
  if(drawing){for(const c of drawing.components){c.id=normalized.ids.get(c.id)||c.id;for(const p of c.ports)p.bit=normalized.bits.get(p.bit)??p.bit;}for(const s of drawing.segments)s.bit=normalized.bits.get(s.bit)??s.bit;}
  return {svg:new XMLSerializer().serializeToString(doc.documentElement),drawing};
}
/** Fresh workers isolate netlistsvg mutable state; timeout bounds layout time. */
function renderInWorker(netlist, settings) {
  const worker = new Worker(new URL('./render-worker.js', import.meta.url), {type:'module'});
  return new Promise((resolve, reject) => {
    const finish = (error, svg) => { clearTimeout(timer); worker.terminate(); error ? reject(Error(error)) : resolve(svg); };
    const duration=Object.keys(netlist.modules.circuit.cells).length>300?60000:30000;
    const timer = setTimeout(() => finish('Layout timed out. Open a subcircuit sheet or collapse instances.'), duration);
    worker.onmessage = ({data}) => finish(data.error, {svg:data.svg,drawing:data.drawing});
    worker.onerror = event => finish(event.message || 'Layout worker failed.');
    worker.postMessage({netlist, settings});
  });
}
