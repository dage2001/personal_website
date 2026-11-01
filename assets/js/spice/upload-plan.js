export const uploadName=name=>name.replace(/\\/g,'/').replace(/^\.\//,'').toLowerCase();
const base=name=>uploadName(name).split('/').at(-1);
export function referencedFiles(text){
  const result=[];for(const line of text.split(/\r?\n/)){const m=/^\s*\.(include|inc|lib)\s+(?:"([^"]+)"|'([^']+)'|([^\s;$]+))/i.exec(line);if(m){const name=m[2]||m[3]||m[4];if(m[1].toLowerCase()!=='lib'||/[.\\/]/.test(name)||/^\s*\.lib\s+(?:"[^"]+"|'[^']+'|\S+)\s+[^;$\s]/i.test(line))result.push(uploadName(name));}}return result;
}
export function classifyUpload(name,text,references=[]){
  if(/\.(spiceproj|json)$/i.test(name)||/^\s*\{/.test(text)&&/"format"\s*:\s*"spice-viewer-project"/.test(text))return 'project';
  if(references.some(ref=>ref===uploadName(name)||base(ref)===base(name))||/\.(lib|sub|mod|inc)$/i.test(name))return 'library';
  let depth=0,definitions=false,devices=false,analysis=false;
  for(const [index,raw]of text.split(/\r?\n/).entries()){const line=raw.trim();if(!line||line.startsWith('*')||line.startsWith('+'))continue;
    if(index===0&&!line.startsWith('.')&&!/^\S*[\d_]\S*\s/.test(line))continue; // ordinary SPICE title, not a model-library device
    if(/^\.subckt\b/i.test(line)){definitions=true;depth++;continue;}if(/^\.ends\b/i.test(line)){depth=Math.max(0,depth-1);continue;}if(depth)continue;
    if(/^\.(model|param|func)\b/i.test(line))definitions=true;
    if(/^\.(tran|ac|dc|op|tf|noise|pz|sens|four|meas)\b/i.test(line))analysis=true;
    if(/^[RLCVIQMDJZEFGHBXSWTKOUAPY]\S*\s+\S+\s+\S+(?:\s+\S+)?/i.test(line)&&!line.startsWith('.'))devices=true;
  }
  if(definitions&&!devices&&!analysis)return 'library';
  if(devices||analysis||/\.(cir|sp|spice|net)$/i.test(name))return 'netlist';
  return 'unknown';
}
export function planUploads(files,currentSource=''){
  if(!files.length)return {files:[],needsChoice:false};
  const names=new Set();for(const f of files){const name=uploadName(f.name);if(!name||['__proto__','constructor','prototype'].includes(name)||names.has(name))throw Error('Duplicate or invalid upload filename: '+f.name);names.add(name);}
  const references=[...referencedFiles(currentSource),...files.flatMap(f=>referencedFiles(f.text))],classified=files.map(f=>({...f,kind:classifyUpload(f.name,f.text,references)}));
  const projects=classified.filter(f=>f.kind==='project');if(projects.length&&(classified.length!==1))throw Error('Open one project file by itself. Projects already contain their libraries.');
  return {files:classified,needsChoice:classified.some(f=>f.kind==='unknown')||classified.filter(f=>f.kind==='netlist').length>1};
}
export function resolveUploads(files){
  const main=files.filter(f=>f.kind==='netlist'),projects=files.filter(f=>f.kind==='project');
  if(main.length>1)throw Error('Choose one main netlist; mark the other files as libraries.');
  if(files.some(f=>!['netlist','library','project'].includes(f.kind)))throw Error('Choose a role for each file.');
  if(projects.length&&files.length!==1)throw Error('Open one project file by itself.');
  for(const f of files)if(new TextEncoder().encode(f.text).length>(f.kind==='project'?32*1024*1024:f.kind==='library'?16000000:2000000))throw Error(f.name+': '+(f.kind==='library'?'Library exceeds 16 MB.':f.kind==='project'?'Project exceeds 32 MB.':'Netlist exceeds 2 MB.'));
  return {project:projects[0],netlist:main[0],libraries:files.filter(f=>f.kind==='library')};
}
