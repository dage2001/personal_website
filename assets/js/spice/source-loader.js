import {tokenize} from './primitive-parser.js';
const normalize=s=>s.replace(/^['"]|['"]$/g,'').replace(/\\/g,'/').replace(/^\.\//,'').toLowerCase();
const base=s=>normalize(s).split('/').at(-1);
/** Explicit browser-provided libraries only. No network or local-filesystem guessing. */
export function loadSources(source,{files={},filename='input.cir'}={}) {
  const catalog=new Map(files instanceof Map?files:Object.entries(files)),diagnostics=[],origins=[],output=[];
  let bytes=0;
  const find=(name,parent)=>{
    const full=normalize(parent).split('/').slice(0,-1).concat(normalize(name)).join('/');
    const direct=[...catalog].filter(([key])=>normalize(key)===normalize(name)||normalize(key)===full);
    if(direct.length===1)return direct[0];
    const matches=[...catalog].filter(([key])=>base(key)===base(name));
    if(matches.length!==1)throw Error(matches.length?'Ambiguous library filename: '+name:'Missing library '+name+'. Add this file using Library files.');
    return matches[0];
  };
  function expand(text,file,section='',stack=[]) {
    const key=normalize(file)+':'+section.toLowerCase();
    if(stack.includes(key))throw Error('Circular library include: '+[...stack,key].join(' → '));
    if(stack.length>32)throw Error('Library nesting exceeds 32 levels.');
    const parts=[],hasSections=/^\s*\.endl\b/im.test(text);let found=!section;
    const append=(line,index)=>{bytes+=line.length;if(bytes>16000000)throw Error('Expanded library input exceeds 16 MB.');output.push(line);origins.push({file,line:index+1});};
    const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);
    lines.forEach((line,i)=>{
      const trimmed=line.trim();
      if(/^\.lib\b/i.test(trimmed)&&hasSections) {
        const t=tokenize(trimmed);
        if(t.length===2&&!/[.\\/]/.test(t[1])){parts.push(t[1].toLowerCase());if(t[1].toLowerCase()===section.toLowerCase())found=true;append('* Library section '+t[1],i);return;}
      }
      if(/^\.endl\b/i.test(trimmed)){parts.pop();append('* End library section',i);return;}
      if(section&&parts.length&&!parts.includes(section.toLowerCase())){append('* Unselected library section',i);return;}
      if(/^\.(?:include|inc|lib)\b/i.test(trimmed)) {
        try {
          const t=tokenize(trimmed);if(!t[1])throw Error('Include requires a filename.');
          const [name,body]=find(t[1],file);append('* Included '+name,i);expand(body,name,t[2]||'',[...stack,key]);
        }catch(error){diagnostics.push({severity:'error',line:i+1,source:file,message:error.message});append('* Unresolved include',i);}
      }else append(line,i);
    });
    if(!found)throw Error('Library section '+section+' not found in '+file);
  }
  try{expand(source,filename);}catch(error){diagnostics.push({severity:'error',line:0,source:filename,message:error.message});}
  return {source:output.join('\n'),origins,diagnostics};
}
