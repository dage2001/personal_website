import {render} from 'netlistsvg';
import {makeSkin} from './skin.js';
import {renderConventional} from './netlistsvg-elk-bridge.js';
import onml from 'onml';
import {chooseLayoutCandidate} from './layout-quality.js';
import {captureDrawing} from './drawing-ir.js';

self.onmessage = async ({data}) => {
  const originalError=console.error;let layoutError='';
  console.error=(...args)=>{layoutError=args.map(e=>e?.message||String(e)).join(' ');};
  try {
    let svg,drawing=null;
    if(data.settings.conventional===false) {
      const netlist=structuredClone(data.netlist);svg=await render(makeSkin(netlist,data.settings),netlist);
    }else {
      const count=Object.keys(data.netlist.modules.circuit.cells).length,candidates=[],failures=[];let attempts=0;
      const pairSheet=!!data.netlist.modules.circuit.spiceLayoutDescription?.pairs?.length||count<=80&&data.netlist.modules.circuit.spiceMotifs?.some(m=>m.kind==='differential-pair'&&m.confidence==='high'&&m.roles.inputs.length===2&&m.roles.inputs.every(id=>data.netlist.modules.circuit.cells[id].spiceLayout.kind==='Q'&&Object.keys(data.netlist.modules.circuit.cells[id].connections).length===3));
      const profiles=[{orientationStrategy:'signal',balanced:false,motifLayout:!!pairSheet}];
      if(!pairSheet){
        if(count<=80&&data.netlist.modules.circuit.spiceMotifs?.some(m=>m.confidence==='high'&&m.members.length>1))profiles.push({orientationStrategy:'signal',balanced:false,motifLayout:true});
        if(count>=7)profiles.push({orientationStrategy:'flow',balanced:true,motifLayout:false});
        if(count>=7&&count<=100)profiles.push({orientationStrategy:'flow-reversed',balanced:true,motifLayout:false});
      }
      const attempt=async profile=>{
        attempts++;
        const netlist=structuredClone(data.netlist),skin=makeSkin(netlist,{...data.settings,...profile});
        let candidateDrawing;
        const source=await renderConventional(skin,netlist,{...profile,gridSize:data.settings.gridSize||0,onLayout:graph=>{candidateDrawing=captureDrawing(graph,netlist.modules.circuit.cells);}});
        const ast=onml.parse(source),metadata=ast.find(n=>Array.isArray(n)&&n[1]?.id==='spice-layout-report');
        const report=JSON.parse(metadata[2]);report.orientationStrategy=profile.orientationStrategy;metadata[2]=JSON.stringify(report);
        candidates.push({svg:onml.stringify(ast),drawing:candidateDrawing,report,profile});
      };
      for(const profile of profiles)try{await attempt(profile);}catch(error){failures.push(error.message);}
      if(candidates.length&&candidates.every(c=>c.report.aspectRatio>2.5))try{await attempt({orientationStrategy:'signal',balanced:true,wrapping:true});}catch(error){failures.push(error.message);}
      if(!candidates.length)try{await attempt({orientationStrategy:'signal',balanced:true,groupParallel:false});}catch(error){failures.push(error.message);}
      if(!candidates.length)throw Error(failures.join('; ')||'No valid layout candidate.');
      const chosen=chooseLayoutCandidate(candidates),ast=onml.parse(chosen.svg),metadata=ast.find(n=>Array.isArray(n)&&n[1]?.id==='spice-layout-report');
      metadata[2]=JSON.stringify({...chosen.report,candidatesTried:attempts,rejectedCandidates:failures.length,groupingFallback:chosen.profile.groupParallel===false});
      svg=onml.stringify(ast);
      drawing=chosen.drawing;
    }
    if (!svg) throw Error(layoutError||'netlistsvg / ELK could not create a drawing.');
    self.postMessage({svg,drawing});
  } catch (error) { self.postMessage({error: error.message || String(error)}); }
  finally{console.error=originalError;}
};
