import {render} from 'netlistsvg';
import {makeSkin} from './skin.js';

self.onmessage = async ({data}) => {
  const originalError=console.error;let layoutError='';
  console.error=(...args)=>{layoutError=args.map(e=>e?.message||String(e)).join(' ');};
  try {
    const netlist = structuredClone(data.netlist);
    const skin = makeSkin(netlist, data.settings);
    const svg = await render(skin, netlist);
    if (!svg) throw Error(layoutError||'netlistsvg / ELK could not create a drawing.');
    self.postMessage({svg});
  } catch (error) { self.postMessage({error: error.message || String(error)}); }
  finally{console.error=originalError;}
};
