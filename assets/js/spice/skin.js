import onml from 'onml';
import analog from 'netlistsvg/lib/analog.svg?raw';

const path = d => ['path', {d, class: 'symbol'}];
const txt = (x, y, text) => ['text', {x, y, class: 'pin-label'}, text];
const originals = onml.parse(analog);
const find = alias => originals.find(n => Array.isArray(n) && n.some?.(c => Array.isArray(c) && c[0] === 's:alias' && c[1].val === alias));
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function makeSkin(netlist, {font = 'Arial', fontSize = 12, color = '#292b29', detailed = false, conventional = true} = {}) {
  if (!['Arial', 'Helvetica', 'Times New Roman', 'monospace'].includes(font)) font = 'Arial';
  fontSize = Math.max(8, Math.min(24, Number(fontSize) || 12));
  if (!/^#[0-9a-f]{6}$/i.test(color)) color = '#292b29';
  const templates = [];
  const large=Object.keys(netlist.modules.circuit.cells).length>120;
  let index = 0;
  for (const cell of Object.values(netlist.modules.circuit.cells)) {
    const type = cell.type, alias = 'spice_cell_' + index++;
    cell.type = alias;
    const rawLines = (cell.attributes.value || '').match(/.{1,32}(?:\s|$)|.{1,32}/g)?.map(s => s.trim()) || [];
    const lines=detailed?rawLines:rawLines.slice(0,2);
    if(!detailed&&rawLines.length>2)lines[1]=lines[1]+'…';
    const labelWidth = Math.max((cell.attributes.displayRef||cell.attributes.ref)?.length || 0, ...lines.map(s => s.length)) * fontSize * .68;
    const width = Math.max(150, 100 + labelWidth), height = Math.max(120, 45 + lines.length * (fontSize + 4));
    const group = ['g', {'s:type': alias, 's:width': width, 's:height': height}, ['s:alias', {val: alias}]];
    const pins = [], geometry = [];
    const terminal = (name, x, y, side, sx, sy) => {
      geometry.push(path(`M${x},${y} L${sx},${sy}`));
      pins.push(['g', {'s:pid': name, 's:x': x, 's:y': y, 's:position': side, 's:dir': 'lateral'}]);
    };
    if (['spice_subckt','spice_device','spice_coupling'].includes(type)) {
      const ports=(cell.spiceBlock||cell.spiceSymbol).ports,left=Math.ceil(ports.length/2);
      const sides={left:[],right:[],top:[],bottom:[]};
      ports.forEach((p,i)=>{
        const meta=conventional?cell.spiceLayout?.ports[p.pin]:null,role=meta?.role;
        let side=i<left?'left':'right';
        if(role==='in')side='left';else if(role==='out')side='right';
        else if(['pwr','bias','ret'].includes(role))side=meta.potential!==null&&meta.potential!==undefined?(meta.potential>0?'top':'bottom'):(role==='ret'?'bottom':'top');
        sides[side].push(p);
      });
      const rows=Math.max(sides.left.length,sides.right.length);
      const railWidth=Math.max(0,...[sides.top,sides.bottom].map(ps=>ps.length*(Math.max(0,...ps.map(p=>p.label.length))*fontSize*.68+25)));
      const blockWidth=Math.max(200,labelWidth+70,railWidth+60,...ports.map(p=>p.label.length*fontSize*.68*2+100));
      const blockHeight=Math.max(155,120+rows*(fontSize+18));
      group[1]['s:width']=blockWidth;group[1]['s:height']=blockHeight;
      geometry.push(['rect',{x:25,y:8,width:blockWidth-50,height:blockHeight-16,rx:6,class:'subckt-body'}]);
      const caption=type==='spice_subckt'?cell.attributes.value:cell.spiceSymbol.label;
      geometry.push(['text',{x:40,y:62,'s:attribute':'displayRef',class:'ref'},'ref'],txt(40,82,caption));
      if(type!=='spice_subckt')lines.forEach((line,i)=>geometry.push(txt(40,blockHeight+12+i*(fontSize+4),line)));
      if(type!=='spice_subckt')group[1]['s:height']=blockHeight+lines.length*(fontSize+4)+12;
      for(const [side,ps]of Object.entries(sides))ps.forEach((p,i)=>{
        if(side==='left'||side==='right') {
          const isLeft=side==='left',y=110+i*(fontSize+18),x=isLeft?0:blockWidth;
          terminal(p.pin,x,y,side,isLeft?25:blockWidth-25,y);
          geometry.push(['text',{x:isLeft?32:blockWidth-32,y:y-5,'text-anchor':isLeft?'start':'end',class:'pin-label'},p.label]);
        }else {
          const x=(i+1)*blockWidth/(ps.length+1),top=side==='top',y=top?0:blockHeight;
          terminal(p.pin,x,y,side,x,top?8:blockHeight-8);
          geometry.push(['text',{x,y:top?30:blockHeight-20,'text-anchor':'middle',class:'pin-label'},p.label]);
        }
      });
    } else if(type==='spice_port') {
      group[1]['s:width']=Math.max(80,labelWidth+30);group[1]['s:height']=40;
      const role=conventional?cell.spiceLayout?.ports.A?.role:null;
      if(role==='in'){terminal('A',group[1]['s:width'],20,'right',group[1]['s:width']-20,20);geometry.push(txt(5,15,cell.attributes.value));}
      else if(['pwr','ret','bias'].includes(role)) {
        const potential=cell.spiceLayout.ports.A.potential,low=potential!==null?potential<=0:role==='ret',x=group[1]['s:width']/2;
        terminal('A',x,low?0:40,low?'top':'bottom',x,20);geometry.push(txt(5,low?35:15,cell.attributes.value));
      }
      else {terminal('A',0,20,'left',20,20);geometry.push(path('M20,14 L30,20 20,26 Z'),txt(35,24,cell.attributes.value));}
    } else if (type === 'gnd') {
      group[1]['s:width'] = 55; group[1]['s:height'] = 50;
      geometry.push(path('M25,0 V25 M10,25 H40 M15,31 H35 M21,37 H29'), txt(35,18,'0'));
      terminal('A',25,0,'top',25,0);
    } else if(conventional&&cell.spiceLayout?.horizontal&&['r_v','l_v','c_v','d_v'].includes(type)) {
      const original=structuredClone(find(type));
      const baseline=Math.max(100,45+lines.length*(fontSize+4)+35);
      group[1]['s:height']=baseline+25;
      for(const n of original.slice(2)) {
        if(n[0]==='s:alias'||n[0]==='text')continue;
        if(n[0]==='g'&&n[1]['s:pid']) {
          const a=n[1],left=Number(a['s:y'])===0,y=baseline-Number(a['s:x']);
          terminal(a['s:pid'],left?0:width,y,left?'left':'right',left?25:75,y);
        }else {n[1].transform=`translate(25,${baseline}) rotate(-90)`;geometry.push(n);}
      }
    } else if (['r_v','spice_br', 'l_v', 'c_v', 'd_v', 'q_npn', 'q_pnp'].includes(type) || type.startsWith('spice_q4_')) {
      const original = structuredClone(find(type==='spice_br'?'r_v':type.startsWith('spice_q4_') ? 'q_' + type.slice(9) : type));
      const ox = 30, oy = 30;
      for (const n of original.slice(2)) {
        if (n[0] === 's:alias' || n[0] === 'text') continue;
        if (n[0] === 'g' && n[1]['s:pid']) {
          const a = n[1], sx = Number(a['s:x']) + ox, sy = Number(a['s:y']) + oy;
          const side = a['s:position'];
          const pid=type==='spice_br'?(a['s:pid']==='A'?'+':'-'):a['s:pid'];
          terminal(pid, side === 'left' ? 0 : side === 'right' ? width : sx, side === 'top' ? 0 : side === 'bottom' ? height : sy, side, sx, sy);
          if (type.startsWith('q') || type.startsWith('spice_q4_')) geometry.push(txt(sx + 5, sy - 5, a['s:pid']));
        } else { n[1].transform = `translate(${ox},${oy})`; if (n[1].style) n[1].style = n[1].style.replace(/#000000/g,color); geometry.push(n); }
      }
      if (type.startsWith('spice_q4_')) {
        geometry.push(path(`M62,46 H80 V${height-15}`),txt(width-20,height-21,'S'));
        terminal('S',width,height-15,'right',80,height-15);
      }
    } else if (/^spice_(?:jfet|mesfet|igbt)_/.test(type)) {
      const igbt=type.includes('igbt'),p=type.endsWith('_p');
      geometry.push(path('M42,30 V85 M42,35 H58 V20 M42,80 H58 V100'));
      if(igbt)geometry.push(path('M28,35 V80 M0,55 H28'));
      else geometry.push(path(p?'M0,55 H42 M30,50 L23,55 30,60':'M0,55 H42 M33,50 L40,55 33,60'));
      const labels=igbt?['C','G','E']:['D','G','S'];
      terminal(labels[0],58,0,'top',58,20);terminal(labels[1],0,55,'left',0,55);terminal(labels[2],58,height,'bottom',58,100);
      geometry.push(txt(63,20,labels[0]),txt(4,47,'G'),txt(63,105,labels[2]));
    } else if (/^spice_(?:nmos|pmos|m|q)/.test(type)) {
      const isQ = type.startsWith('spice_q');
      if (isQ) geometry.push(['rect', {x:20,y:25,width:45,height:65}], txt(38,60,'Q'));
      else geometry.push(path('M28,35 V75 M38,35 V75 M38,40 H55 V25 M38,70 H55 V90'));
      if (type !== 'spice_m' && !isQ) {
        geometry.push(path(type === 'spice_pmos' ? 'M38,55 H58 M48,50 L38,55 48,60' : 'M38,55 H58 M48,50 L58,55 48,60'));
      }
      const portNames = isQ ? ['C','B','E'] : ['D','G','S'];
      terminal(portNames[0],55,0,'top',55,25); terminal(portNames[1],0,55,'left',isQ?20:28,55); terminal(portNames[2],55,height,'bottom',55,90);
      geometry.push(txt(60,22,portNames[0]),txt(4,49,portNames[1]),txt(60,100,portNames[2]));
      if (Object.keys(cell.connections).length === 4) {
        const bulk = isQ ? 'S' : 'B';
        geometry.push(path(`M${isQ?65:58},55 H75 V${height-15}`), txt(width-20,height-21,bulk));
        terminal(bulk,width,height-15,'right',75,height-15);
      }
    } else {
      const controlled = /^spice_[efgh]$/.test(type);
      geometry.push(controlled ? path('M45,25 L65,55 45,85 25,55 Z') : ['circle',{cx:45,cy:55,r:22,class:'symbol'}]);
      const isCurrent = type === 'i' || /^spice_[fg]$/.test(type) || (type === 'spice_b' && /^[IP]\s*=/i.test(cell.attributes.value));
      geometry.push(path(isCurrent ? 'M45,42 V68 M40,61 L45,68 50,61' : 'M39,45 H51 M45,39 V51 M39,66 H51'));
      terminal('+',45,0,'top',45,controlled?25:33); terminal('-',45,height,'bottom',45,controlled?85:77);
      geometry.push(txt(53,19,'+'),txt(53,height-8,'−'));
      if (cell.connections['C+']) {
        terminal('C+',0,40,'left',35,40); terminal('C-',0,75,'left',38.33,75);
        geometry.push(txt(2,34,'C+'),txt(2,91,'C−'));
      }
      if (type === 'spice_b') geometry.push(txt(72,60,'B'));
    }
    group.push(...geometry);
    if (!['gnd','spice_subckt','spice_device','spice_coupling','spice_port'].includes(type)) {
      const labelX=conventional&&cell.spiceLayout?.horizontal?25:95;
      group.push(['text',{x:labelX,y:24,'s:attribute':'displayRef',class:'ref'},'ref']);
      // Literal text is escaped by onml; no expressions are ever evaluated.
      lines.forEach((line,i) => group.push(['text',{x:labelX,y:46+i*(fontSize+4)},line]));
    }
    group.push(...pins); templates.push(onml.stringify(group));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:s="https://github.com/nturley/netlistsvg">
  <s:properties constants="false" splitsAndJoins="false" genericsLaterals="true"><s:layoutEngine
  org.eclipse.elk.algorithm="layered" org.eclipse.elk.direction="${conventional?'RIGHT':'DOWN'}"
  org.eclipse.elk.edgeRouting="ORTHOGONAL" org.eclipse.elk.spacing.nodeNode="40"
  ${large?'org.eclipse.elk.layered.layering.strategy="COFFMAN_GRAHAM" org.eclipse.elk.layered.layering.coffmanGraham.layerBound="14"':''}
  org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers="55"
  org.eclipse.elk.spacing.componentComponent="65" org.eclipse.elk.separateConnectedComponents="false"/>
  </s:properties><style>svg{stroke:${color};fill:none;stroke-width:1.4}
  text{font-family:'${escape(font)}',Arial,sans-serif;font-size:${fontSize}px;fill:${color};stroke:none;font-weight:normal}
  .ref{font-weight:bold}.pin-label{font-size:${Math.max(8,fontSize-2)}px}.symbol{stroke-linejoin:round;stroke-linecap:round}
  .detail{fill:${color}} .subckt-body{fill:#f3f6f1;stroke:${color}} circle[class^="net_"]{fill:${color}!important}
  </style>${templates.join('\n')}</svg>`;
}
