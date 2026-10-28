import {render} from 'netlistsvg';
import {makeSkin} from './skin.js';

self.onmessage = async ({data}) => {
  try {
    const netlist = structuredClone(data.netlist);
    const skin = makeSkin(netlist, data.settings);
    const svg = await render(skin, netlist);
    if (!svg) throw Error('netlistsvg / ELK could not create a drawing.');
    self.postMessage({svg});
  } catch (error) { self.postMessage({error: error.message || String(error)}); }
};
