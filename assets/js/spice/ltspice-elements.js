/** LTspice 24+ element grammar: terminal syntax is parsed; all constitutive text is retained. */
import aPins from './ltspice-a-pins.json' with {type:'json'};
export const LTSPICE_PREFIXES='A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö';
const lower=s=>s.toLowerCase();
const parameter=t=>t===undefined||t.includes('=')||/^(?:off|on)$/i.test(t);
const nodesFromPair=t=>t.replace(/^\(/,'').replace(/\)$/,'').split(/[\s,]+/).filter(Boolean);
export function parseElement(t,models) {
  const findModel=name=>models[lower(name||'')]||Object.entries(models).find(([key])=>key.startsWith(lower(name||'')+'.'))?.[1];
  const kind=t[0][0].toUpperCase();
  let pins=[],nodeTokens=[],model='',type='',controlSources=[],coupledInductors=[],index=0,valuePrefix='',sourceMode='',symbol='',polarityKnown=true;
  if('RLC'.includes(kind)){pins=['A','B'];type=lower(kind)+'_v';}
  else if('DVIB'.includes(kind)){pins=['+','-'];type=kind==='D'?'d_v':kind==='B'?'spice_b':lower(kind);}
  else if(kind==='Q') {
    pins=['C','B','E'];
    if(!findModel(t[4])&&(findModel(t[5])||(!parameter(t[5])&&!/^[+\-\d.{'"]/.test(t[5]))))pins.push('S');
    model=t[pins.length+1]||'';
    const polarity=findModel(model)?.type;
    polarityKnown=['NPN','PNP'].includes(polarity);
    type=polarityKnown?(pins.length===3?'q_':'spice_q4_')+lower(polarity):'spice_q'+pins.length;
  } else if(kind==='M') {
    const m3=findModel(t[4]),m4=findModel(t[5]);
    const three=m3?.type==='VDMOS'||(!m4&&(!t[5]||parameter(t[5])));
    pins=three?['D','G','S']:['D','G','S','B'];model=t[pins.length+1]||'';
    const definition=findModel(model),polarity=definition?.type;
    if(three&&definition&&polarity!=='VDMOS')throw Error('Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.');
    if(!three&&polarity==='VDMOS')throw Error('VDMOS requires exactly D/G/S terminals.');
    polarityKnown=['NMOS','PMOS','VDMOS'].includes(polarity);
    let flag=null,ancestor=definition;const seen=new Set();
    while(ancestor&&!seen.has(ancestor.name)){seen.add(ancestor.name);flag=/\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(ancestor.raw);if(flag)break;ancestor=findModel(ancestor.baseModel);}
    const p=polarity==='PMOS'||(polarity==='VDMOS'&&flag&&(flag[1]===undefined||Number(flag[1])>=.5));
    type=polarityKnown?'spice_'+(p?'pmos':'nmos')+(three?'3':''):'spice_m';
  } else if('JZ'.includes(kind)) {
    model=t[4]||'';const m=findModel(model)?.type;
    const igbt=kind==='Z'&&['NIGBT','PIGBT'].includes(m);
    pins=igbt?['C','G','E']:['D','G','S'];
    polarityKnown=kind==='J'?['NJF','PJF'].includes(m):['NMF','PMF','NIGBT','PIGBT'].includes(m);
    type='spice_'+(igbt?'igbt':kind==='J'?'jfet':'mesfet')+'_'+(/^P/.test(m||'')?'p':'n');
  } else if('EFGH'.includes(kind)) {
    pins=['+','-'];type='spice_'+lower(kind);
    let start=3,poly=/^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[start]||'');
    if(/^poly$/i.test(t[start]||'')){poly=/^\(\s*(\d+)\s*\)$/.exec(t[++start]||'');if(!poly)throw Error('POLY requires a dimension.');}
    if(poly) {
      const dimension=Number(poly[1]);if(dimension>128)throw Error('POLY supports at most 128 controlling variables.');
      let cursor=start+1,controls=[];const voltage='EG'.includes(kind),needed=dimension*(voltage?2:1);
      while(controls.length<needed&&cursor<t.length)controls.push(...nodesFromPair(t[cursor++]));
      if(controls.length!==needed||cursor>=t.length)throw Error('POLY control count or coefficient list is incomplete.');
      if(voltage){for(let i=0;i<dimension;i++)pins.push('C'+(i+1)+'+','C'+(i+1)+'-');nodeTokens=[t[1],t[2],...controls];}
      else controlSources=controls;
      index=cursor;valuePrefix='POLY('+dimension+') '+(voltage?'':controls.join(' ')+' ');sourceMode='POLY';
      if(voltage)type='spice_device';
    } else if(/^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3]||'')||t[3]?.startsWith('{')) {
      sourceMode='BEHAVIORAL';
    } else if('EG'.includes(kind)) {pins.push('C+','C-');sourceMode=/\blaplace\s*=/i.test(t.slice(5).join(' '))?'LAPLACE':/\btable\s*=/i.test(t.slice(5).join(' '))?'TABLE':'LINEAR';}
    else {controlSources=[t[3]];index=4;valuePrefix=t[3]+' ';}
    symbol=({E:'VCVS',G:'VCCS',F:'CCCS',H:'CCVS'})[kind]+(sourceMode?' · '+sourceMode:'');
  } else if(kind==='S'){pins=['A','B','C+','C-'];model=t[5]||'';type='spice_device';symbol='Voltage switch';}
  else if(kind==='W'){pins=['A','B'];controlSources=[t[3]];model=t[4]||'';index=3;type='spice_device';symbol='Current switch';}
  else if('TO'.includes(kind)){pins=['L+','L-','R+','R-'];if(kind==='O')model=t[5]||'';type='spice_device';symbol=kind==='T'?'Transmission line':'Lossy line';}
  else if(kind==='U'){pins=['N1','N2','COM'];model=t[4]||'';type='spice_device';symbol='Distributed RC';}
  else if(kind==='A'){pins=Array.from({length:8},(_,i)=>'P'+(i+1));type='spice_device';symbol=t[9]||'A function';}
  else if(kind==='K') {
    if(t.length<4)throw Error('Mutual coupling requires at least two inductors and a coefficient.');
    coupledInductors=t.slice(1,-1);if(coupledInductors.some(n=>!/^L/i.test(n.split(':').at(-1))))throw Error('K references must name inductors.');
    index=t.length-1;type='spice_coupling';symbol='Magnetic coupling';valuePrefix=coupledInductors.join(' ')+' · k=';
  } else if(kind==='@'){pins=['IN','OUT'];type='spice_device';symbol='FRA';}
  else if(kind==='&'){pins=['O+','O-','I+','I-'];type='spice_device';symbol='FRA probe';}
  else if(kind==='Ö'){pins=['OUT','V+','V-','IN-','IN+'];type='spice_device';symbol='Transconductance';}
  else throw Error('Unknown LTspice element prefix: '+kind);
  if(!index)index=pins.length+1;
  if(!nodeTokens.length)nodeTokens=t.slice(1,pins.length+1);
  if(nodeTokens.length!==pins.length)throw Error('Incomplete terminal list: expected '+pins.length+' nodes.');
  if(t.length<=index&&!['&','Ö'].includes(kind))throw Error('Missing value, model, or expression after '+pins.length+' terminals.');
  if(nodeTokens.some(n=>/[=()]/.test(n)&&!/^\{[\s\S]*\}$/.test(n)))throw Error('Invalid terminal token; check terminal count.');
  if(kind==='B'&&!/\b[VIPR]\s*=/i.test(t.slice(index).join(' ')))throw Error('Behavioral source requires V=, I=, R= or P=.');
  if(kind==='B'&&/^R\s*=/i.test(t.slice(index).join(' ')))type='spice_br';
  if(kind==='D')model=t[3]||'';
  if(kind==='@') {
    const args=t.slice(index).join(' ');
    for(const match of args.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi)){pins.push(match[1].toUpperCase());nodeTokens.push(match[2]);}
  }
  if(kind==='A'&&!t[9])throw Error('A element requires eight terminals followed by its function name.');
  if(controlSources.some(n=>!n))throw Error('Missing controlling voltage source.');
  const pinLabels=pins.map((pin,i)=>kind==='A'?(aPins[(t[9]||'').toUpperCase()]?.[String(i+1)]||pin):pin);
  return {kind,pins,nodeTokens,pinLabels,model,type,controlSource:controlSources[0]||'',controlSources,coupledInductors,value:valuePrefix+t.slice(index).join(' '),sourceMode,symbol,polarityKnown};
}
