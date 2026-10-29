import onml from 'onml';
import analog from 'netlistsvg/lib/analog.svg?raw';

const path = d => ['path', {d, class: 'symbol'}];
const txt = (x, y, text) => ['text', {x, y, class: 'pin-label'}, text];
const originals = onml.parse(analog);
const find = alias => originals.find(n => Array.isArray(n) && n.some?.(c => Array.isArray(c) && c[0] === 's:alias' && c[1].val === alias));
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function makeSkin(netlist, {font = 'Arial', fontSize = 12, color = '#292b29', detailed = false, conventional = true, orientationStrategy = 'signal'} = {}) {
  if (!['Arial', 'Helvetica', 'Times New Roman', 'monospace'].includes(font)) font = 'Arial';
  fontSize = Math.max(8, Math.min(24, Number(fontSize) || 12));
  if (!/^#[0-9a-f]{6}$/i.test(color)) color = '#292b29';
  const templates = [];
  const large=Object.keys(netlist.modules.circuit.cells).length>120;
  const pairMembers=new Map(),verticalPairs=new Set();
  for(const cell of Object.values(netlist.modules.circuit.cells)) {
    const bits=(cell.spiceLayout?.source&&cell.connections['+']&&cell.connections['-']?[cell.connections['+'],cell.connections['-']]:Object.values(cell.connections)).map(p=>p[0]);
    if(bits.length!==2||bits[0]===bits[1])continue;
    const key=bits.sort((a,b)=>a-b).join(':');if(!pairMembers.has(key))pairMembers.set(key,[]);pairMembers.get(key).push(cell);
  }
  for(const members of pairMembers.values())if(members.length>1&&members.some(c=>c.spiceLayout?.passive)&&members.some(c=>c.spiceLayout?.source)&&members.some(c=>Object.values(c.spiceLayout?.ports||{}).some(p=>['pwr','ret','bias'].includes(p.role)||p.role==='unknown'&&p.potential!==null)))for(const cell of members)verticalPairs.add(cell);
  let index = 0;
  for (const cell of Object.values(netlist.modules.circuit.cells)) {
    const type = cell.type, alias = 'spice_cell_' + index++;
    cell.type = alias;
    const wrap=detailed?32:24;
    const rawLines = (cell.attributes.value || '').match(new RegExp(`.{1,${wrap}}(?:\\s|$)|.{1,${wrap}}`,'g'))?.map(s => s.trim()) || [];
    const lines=detailed?rawLines:rawLines.slice(0,2);
    if(!detailed&&rawLines.length>2)lines[1]=lines[1]+'…';
    const labelWidth = Math.max((cell.attributes.displayRef||cell.attributes.ref)?.length || 0, ...lines.map(s => s.length)) * fontSize * .68;
    const width = Math.max(104, 90 + labelWidth), height = Math.max(108, fontSize + 12 + lines.length * (fontSize + 4));
    const group = ['g', {'s:type': alias, 's:width': width, 's:height': height}, ['s:alias', {val: alias}]];
    const pins = [], geometry = [];let labelsPlaced=false;
    let orientation=cell.spiceLayout?.orientation||(cell.spiceLayout?.horizontal?'horizontal':'vertical');
    if(orientationStrategy.startsWith('flow')&&cell.spiceLayout?.flexible&&cell.spiceLayout.source&&!Object.values(cell.spiceLayout.ports).every(p=>p.potential!==null))orientation=orientationStrategy==='flow'?'horizontal':'horizontal-reversed';
    if(verticalPairs.has(cell)&&cell.spiceLayout?.flexible)orientation=cell.spiceLayout.orientation.startsWith('vertical')?cell.spiceLayout.orientation:'vertical';
    const horizontal=orientation.startsWith('horizontal'),reversed=orientation.endsWith('reversed');
    const terminal = (name, x, y, side, sx, sy) => {
      geometry.push(path(`M${x},${y} L${sx},${sy}`));
      pins.push(['g', {'s:pid': name, 's:x': x, 's:y': y, 's:position': side, 's:dir': 'lateral'}]);
    };
    if (['spice_subckt','spice_device','spice_coupling'].includes(type)) {
      const ports=(cell.spiceBlock||cell.spiceSymbol).ports;
      const plain=ports.filter(p=>!conventional||!['pwr','ret','bias'].includes(cell.spiceLayout?.ports[p.pin]?.role)),left=Math.ceil(plain.length/2);
      const sides={left:[],right:[],top:[],bottom:[]};
      ports.forEach((p,i)=>{
        const meta=conventional?cell.spiceLayout?.ports[p.pin]:null,role=meta?.role;
        let side=plain.indexOf(p)<left?'left':'right';
        if(role==='in')side='left';else if(role==='out')side='right';
        else if(['pwr','bias','ret'].includes(role))side=meta.potential!==null&&meta.potential!==undefined?(meta.potential>0?'top':'bottom'):(role==='ret'?'bottom':'top');
        sides[side].push(p);
      });
      const rows=Math.max(sides.left.length,sides.right.length);
      const railWidth=Math.max(0,...[sides.top,sides.bottom].map(ps=>ps.length*(Math.max(0,...ps.map(p=>p.label.length))*fontSize*.68+16)));
      const sideWidth=side=>Math.max(0,...sides[side].map(p=>p.label.length*fontSize*.68));
      const blockWidth=Math.max(120,labelWidth+32,railWidth+24,sideWidth('left')+sideWidth('right')+52);
      const topSpace=sides.top.length?fontSize+16:0,rowStart=topSpace+3*(fontSize+4)+8,pitch=fontSize+10;
      const valueSpace=type==='spice_subckt'?0:lines.length*(fontSize+4)+10;
      const blockHeight=Math.max(90,rowStart+rows*pitch+valueSpace+(sides.bottom.length?fontSize+22:12));
      group[1]['s:width']=blockWidth;group[1]['s:height']=blockHeight;
      geometry.push(['rect',{x:12,y:8,width:blockWidth-24,height:blockHeight-16,rx:5,class:'subckt-body'}]);
      const caption=type==='spice_subckt'?cell.attributes.value:cell.spiceSymbol.label;
      geometry.push(['text',{x:22,y:topSpace+fontSize+8,'s:attribute':'displayRef',class:'ref'},'ref'],txt(22,topSpace+2*(fontSize+4)+4,caption));
      if(type!=='spice_subckt')lines.forEach((line,i)=>geometry.push(txt(22,rowStart+rows*pitch+fontSize+i*(fontSize+4),line)));
      for(const [side,ps]of Object.entries(sides))ps.forEach((p,i)=>{
        if(side==='left'||side==='right') {
          const isLeft=side==='left',y=rowStart+i*pitch,x=isLeft?0:blockWidth;
          terminal(p.pin,x,y,side,isLeft?12:blockWidth-12,y);
          geometry.push(['text',{x:isLeft?18:blockWidth-18,y:y-4,'text-anchor':isLeft?'start':'end',class:'pin-label'},p.label]);
        }else {
          const x=(i+1)*blockWidth/(ps.length+1),top=side==='top',y=top?0:blockHeight;
          terminal(p.pin,x,y,side,x,top?8:blockHeight-8);
          geometry.push(['text',{x,y:top?fontSize+12:blockHeight-16,'text-anchor':'middle',class:'pin-label'},p.label]);
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
    } else if(conventional&&['r_v','spice_br','l_v','c_v','d_v'].includes(type)) {
      const original=structuredClone(find(type==='spice_br'?'r_v':type)),glyphWidth=Number(original[1]['s:width']);
      const w=horizontal?Math.max(70,labelWidth+16):Math.max(56,glyphWidth+28+labelWidth);
      const head=(lines.length+1)*(fontSize+4)+6,h=horizontal?head+glyphWidth+8:Math.max(66,(lines.length+1)*(fontSize+4)+12);
      group[1]['s:width']=w;group[1]['s:height']=h;
      const start=(w-50)/2,ox=8,oy=8;
      const transform=horizontal?(reversed?`translate(${start+50},${head}) rotate(90)`:`translate(${start},${head+glyphWidth}) rotate(-90)`):(reversed?`translate(${ox+glyphWidth},${oy+50}) rotate(180)`:`translate(${ox},${oy})`);
      for(const n of original.slice(2)) {
        if(n[0]==='s:alias'||n[0]==='text')continue;
        if(n[0]==='g'&&n[1]['s:pid']) {
          const a=n[1],first=Number(a['s:y'])===0,pid=type==='spice_br'?(a['s:pid']==='A'?'+':'-'):a['s:pid'];
          if(horizontal) {
            const left=first!==reversed,y=head+(reversed?Number(a['s:x']):glyphWidth-Number(a['s:x']));
            terminal(pid,left?0:w,y,left?'left':'right',left?start:start+50,y);
          }else {
            const top=first!==reversed,x=ox+(reversed?glyphWidth-Number(a['s:x']):Number(a['s:x']));
            terminal(pid,x,top?0:h,top?'top':'bottom',x,top?oy:oy+50);
          }
        }else {n[1].transform=transform;geometry.push(n);}
      }
      const lx=horizontal?w/2:glyphWidth+20,anchor=horizontal?'middle':'start';
      geometry.push(['text',{x:lx,y:fontSize+4,'text-anchor':anchor,'s:attribute':'displayRef',class:'ref'},'ref']);
      lines.forEach((line,i)=>geometry.push(['text',{x:lx,y:fontSize+4+(i+1)*(fontSize+4),'text-anchor':anchor},line]));labelsPlaced=true;
    } else if(conventional&&['v','i','spice_b','spice_f','spice_h'].includes(type)&&Object.keys(cell.connections).length===2) {
      const controlled=['spice_f','spice_h'].includes(type),radius=controlled?25:22;
      const head=(lines.length+1)*(fontSize+4)+6,w=horizontal?Math.max(type==='spice_b'?94:70,labelWidth+16):Math.max(94,73+labelWidth),h=horizontal?head+radius*2+8:Math.max(68,(lines.length+1)*(fontSize+4)+12);
      group[1]['s:width']=w;group[1]['s:height']=h;
      const cx=horizontal?w/2:30,cy=horizontal?head+radius:34;
      geometry.push(controlled?path(`M${cx},${cy-radius} L${cx+20},${cy} ${cx},${cy+radius} ${cx-20},${cy} Z`):['circle',{cx,cy,r:radius,class:'symbol'}]);
      const current=type==='i'||type==='spice_f'||type==='spice_b'&&/^[IP]\s*=/i.test(cell.attributes.value),sign=reversed?-1:1;
      if(current)geometry.push(path(horizontal?`M${cx-12*sign},${cy} H${cx+12*sign} M${cx+5*sign},${cy-5} L${cx+12*sign},${cy} ${cx+5*sign},${cy+5}`:`M${cx},${cy-12*sign} V${cy+12*sign} M${cx-5},${cy+5*sign} L${cx},${cy+12*sign} ${cx+5},${cy+5*sign}`));
      else {const px=horizontal?cx-9*sign:cx,py=horizontal?cy:cy-9*sign,mx=horizontal?cx+9*sign:cx,my=horizontal?cy:cy+9*sign;geometry.push(path(`M${px-5},${py} H${px+5} M${px},${py-5} V${py+5} M${mx-5},${my} H${mx+5}`));}
      for(const [i,pin]of ['+','-'].entries()) {
        const first=(i===0)!==reversed;
        if(horizontal)terminal(pin,first?0:w,cy,first?'left':'right',cx+(first?-1:1)*(controlled?20:radius),cy);
        else terminal(pin,cx,first?0:h,first?'top':'bottom',cx,cy+(first?-radius:radius));
      }
      if(type==='spice_b')geometry.push(txt(cx+radius+4,cy+4,'B'));
      const lx=horizontal?w/2:65,anchor=horizontal?'middle':'start';
      geometry.push(['text',{x:lx,y:fontSize+4,'text-anchor':anchor,'s:attribute':'displayRef',class:'ref'},'ref']);
      lines.forEach((line,i)=>geometry.push(['text',{x:lx,y:fontSize+4+(i+1)*(fontSize+4),'text-anchor':anchor},line]));labelsPlaced=true;
    } else if (['r_v','spice_br', 'l_v', 'c_v', 'd_v', 'q_npn', 'q_pnp'].includes(type) || type.startsWith('spice_q4_')) {
      const original = structuredClone(find(type==='spice_br'?'r_v':type.startsWith('spice_q4_') ? 'q_' + type.slice(9) : type));
      const ox = 30, oy = 30;
      for (const n of original.slice(2)) {
        if (n[0] === 's:alias' || n[0] === 'text') continue;
        if (n[0] === 'g' && n[1]['s:pid']) {
          const a = n[1], sx = Number(a['s:x']) + ox, sy = Number(a['s:y']) + oy;
          const side = a['s:position'];
          // The analog PNP glyph has its emitter arrow on the upper branch.
          const pnp=type==='q_pnp'||type==='spice_q4_pnp';
          const pid=type==='spice_br'?(a['s:pid']==='A'?'+':'-'):pnp&&a['s:pid']==='C'?'E':pnp&&a['s:pid']==='E'?'C':a['s:pid'];
          terminal(pid, side === 'left' ? 0 : side === 'right' ? width : sx, side === 'top' ? 0 : side === 'bottom' ? height : sy, side, sx, sy);
          if (type.startsWith('q') || type.startsWith('spice_q4_')) geometry.push(txt(sx + 5, sy - 5, pid));
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
    if (!labelsPlaced&&!['gnd','spice_subckt','spice_device','spice_coupling','spice_port'].includes(type)) {
      const labelX=82;
      group.push(['text',{x:labelX,y:fontSize+4,'s:attribute':'displayRef',class:'ref'},'ref']);
      // Literal text is escaped by onml; no expressions are ever evaluated.
      lines.forEach((line,i) => group.push(['text',{x:labelX,y:fontSize+4+(i+1)*(fontSize+4)},line]));
    }
    group.push(...pins); templates.push(onml.stringify(group));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:s="https://github.com/nturley/netlistsvg">
  <s:properties constants="false" splitsAndJoins="false" genericsLaterals="true"><s:layoutEngine
  org.eclipse.elk.algorithm="layered" org.eclipse.elk.direction="${conventional?'RIGHT':'DOWN'}"
  org.eclipse.elk.edgeRouting="ORTHOGONAL" org.eclipse.elk.spacing.nodeNode="22"
  ${large?'org.eclipse.elk.layered.layering.strategy="COFFMAN_GRAHAM" org.eclipse.elk.layered.layering.coffmanGraham.layerBound="14"':''}
  org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers="24"
  org.eclipse.elk.spacing.componentComponent="30" org.eclipse.elk.separateConnectedComponents="false"/>
  </s:properties><style>svg{stroke:${color};fill:none;stroke-width:1.4}
  text{font-family:'${escape(font)}',Arial,sans-serif;font-size:${fontSize}px;fill:${color};stroke:none;font-weight:normal}
  .ref{font-weight:bold}.pin-label{font-size:${Math.max(8,fontSize-2)}px}.symbol{stroke-linejoin:round;stroke-linecap:round}
  .detail{fill:${color}} .subckt-body{fill:#f3f6f1;stroke:${color}} circle[class^="net_"]{fill:${color}!important}
  </style>${templates.join('\n')}</svg>`;
}
