const same=(a,b)=>Math.abs(a-b)<.002;
/** Keep glyphs/text rigid. Only terminal leads extend to grid-compatible tips. */
export function gridSkin(group,step,target=null){
  const pins=group.filter(n=>n[1]?.['s:pid']!==undefined),old=pins.map(p=>({pin:p[1]['s:pid'],x:+p[1]['s:x'],y:+p[1]['s:y'],side:p[1]['s:position']}));
  if(!pins.length)return;
  const w=target?.width??Math.ceil(+group[1]['s:width']/step)*step,h=target?.height??Math.ceil(+group[1]['s:height']/step)*step;
  const next=old.map(p=>({...p,...target?target.ports.find(q=>q.pin===p.pin):{x:p.side==='right'&&same(p.x,+group[1]['s:width'])?w:Math.ceil(p.x/step)*step,y:p.side==='bottom'&&same(p.y,+group[1]['s:height'])?h:Math.ceil(p.y/step)*step}}));
  const shift=(axis,sides)=>{const indices=old.map((p,i)=>sides.includes(p.side)?i:-1).filter(i=>i>=0);return indices.length&&indices.every(i=>same(old[i][axis],old[indices[0]][axis])&&same(next[i][axis],next[indices[0]][axis]))?next[indices[0]][axis]-old[indices[0]][axis]:0;};
  const box=group[1]['data-grid-box']==='true',lead=Number(group[1]['data-pin-length'])||step;let dx=box?0:shift('x',['top','bottom']),dy=box?0:shift('y',['left','right']);
  // Share unavoidable grid padding between opposite terminals instead of
  // leaving one short lead and one long lead. The body remains rigid.
  if(!box&&old.length===2){const anchors=old.map(p=>group.find(n=>n[1]?.['data-pin-lead']===p.pin)?.[1]);if(anchors.every(Boolean)){
    if(old.some(p=>p.side==='left')&&old.some(p=>p.side==='right'))dx=(next[0].x+next[1].x-Number(anchors[0]['data-inner-x'])-Number(anchors[1]['data-inner-x']))/2;
    if(old.some(p=>p.side==='top')&&old.some(p=>p.side==='bottom'))dy=(next[0].y+next[1].y-Number(anchors[0]['data-inner-y'])-Number(anchors[1]['data-inner-y']))/2;
  }}
  for(const child of group.slice(2)){
    if(!Array.isArray(child)||child[0]==='s:alias'||child[1]?.['s:pid']!==undefined)continue;
    const a=child[1];
    if(a['data-pin-lead']){
      const p=next.find(p=>p.pin===a['data-pin-lead']);let x=+a['data-inner-x']+dx,y=+a['data-inner-y']+dy;if(box){if(['left','right'].includes(p.side)){x=p.side==='left'?lead:w-lead;y=p.y;}else{x=p.x;y=p.side==='top'?lead:h-lead;}}a['data-inner-x']=x;a['data-inner-y']=y;delete a.transform;
      a.d=same(p.x,x)||same(p.y,y)?`M${p.x},${p.y} L${x},${y}`:['left','right'].includes(p.side)?`M${p.x},${p.y} L${x},${p.y} L${x},${y}`:`M${p.x},${p.y} L${p.x},${y} L${x},${y}`;
    }else if(box&&child[0]==='rect'&&a.class==='subckt-body'){a.x=lead;a.y=lead;a.width=w-2*lead;a.height=h-2*lead;}
    else if(box&&a['data-grid-pin-label']){const p=next.find(p=>p.pin===a['data-grid-pin-label']);if(['left','right'].includes(p.side)){a.x=p.side==='left'?lead+6:w-lead-6;a.y=p.y-4;}else{a.x=p.x;if(p.side==='bottom')a.y=h-lead-8;}}
    else if(child[0]==='text'){if(a.x!==undefined)a.x=+a.x+dx;if(a.y!==undefined)a.y=+a.y+dy;}
    else if(dx||dy)a.transform=`translate(${dx},${dy}) ${a.transform||''}`;
  }
  pins.forEach((p,i)=>{p[1]['s:x']=next[i].x;p[1]['s:y']=next[i].y;});group[1]['s:width']=w;group[1]['s:height']=h;
}
