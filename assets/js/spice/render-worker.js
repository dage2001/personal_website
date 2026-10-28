import {render} from 'netlistsvg';
import {makeSkin} from './skin.js';
import {renderConventional} from './netlistsvg-elk-bridge.js';

self.onmessage = async ({data}) => {
  const originalError=console.error;let layoutError='';
  console.error=(...args)=>{layoutError=args.map(e=>e?.message||String(e)).join(' ');};
  try {
    const netlist = structuredClone(data.netlist);
    const skin = makeSkin(netlist, data.settings);
    const svg = data.settings.conventional===false?await render(skin, netlist):await renderConventional(skin,netlist);
    if (!svg) throw Error(layoutError||'netlistsvg / ELK could not create a drawing.');
    self.postMessage({svg});
  } catch (error) { self.postMessage({error: error.message || String(error)}); }
  finally{console.error=originalError;}
};
