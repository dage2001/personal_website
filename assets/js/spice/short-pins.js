export const symbolGridSize=4;
/** Pack a rigid symbol body with one fixed minimum cell of terminal clearance.
 * Non-grid body spans can require a fractional extra cell; never scale a glyph. */
export function shortSymbolPins(group,body,step=symbolGridSize){
  if(!body)return;const dx=step-body.x,dy=step-body.y,w=Math.ceil((body.w+2*step)/step)*step,h=Math.ceil((body.h+2*step)/step)*step;
  const leads=new Map(group.filter(n=>n[1]?.['data-pin-lead']).map(n=>[n[1]['data-pin-lead'],{x:+n[1]['data-inner-x'],y:+n[1]['data-inner-y']} ]));
  for(const n of group.slice(2)){
    if(!Array.isArray(n)||n[0]==='s:alias')continue;const a=n[1];
    if(a['s:pid']!==undefined){const lead=leads.get(a['s:pid']),side=a['s:position'];a['s:x']=side==='left'?0:side==='right'?w:lead.x+dx;a['s:y']=side==='top'?0:side==='bottom'?h:lead.y+dy;}
    else if(a['data-pin-lead']){a['data-inner-x']=+a['data-inner-x']+dx;a['data-inner-y']=+a['data-inner-y']+dy;}
    else if(n[0]==='text'){a.x=+a.x+dx;a.y=+a.y+dy;}
    else a.transform=`translate(${dx},${dy}) ${a.transform||''}`;
  }
  group[1]['s:width']=w;group[1]['s:height']=h;group[1]['data-pin-length']=step;
}
