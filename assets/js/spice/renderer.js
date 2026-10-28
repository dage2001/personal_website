/** One render per worker: netlistsvg has mutable module state. Termination bounds layout time. */
export function renderSchematic(netlist, settings) {
  const worker = new Worker(new URL('./render-worker.js', import.meta.url), {type:'module'});
  return new Promise((resolve, reject) => {
    const finish = (error, svg) => { clearTimeout(timer); worker.terminate(); error ? reject(Error(error)) : resolve(svg); };
    const timer = setTimeout(() => finish('Layout exceeded 30 seconds. Try a smaller netlist.'), 30000);
    worker.onmessage = ({data}) => finish(data.error, data.svg);
    worker.onerror = event => finish(event.message || 'Layout worker failed.');
    worker.postMessage({netlist, settings});
  });
}
