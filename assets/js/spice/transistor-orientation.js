import onml from 'onml';

/** Compare real same-net neighbours; mirroring never exchanges pin identities. */
export function controlSideChoices(graph,cells) {
  const byNet=new Map(),choices=[];
  for(const n of graph.children)for(const p of n.ports||[]){const bit=cells[n.id]?.connections[p.id.slice(n.id.length+1)]?.[0];if(bit===undefined)continue;if(!byNet.has(bit))byNet.set(bit,[]);byNet.get(bit).push({owner:n.id,x:n.x+p.x,y:n.y+p.y});}
  for(const n of graph.children){const c=cells[n.id],control=c?.spiceLayout?.kind==='Q'?'B':['M','J','Z'].includes(c?.spiceLayout?.kind)?'G':null;if(!control)continue;
    const cp=n.ports.find(p=>p.id===n.id+'.'+control);if(!cp||Math.min(Math.abs(cp.x),Math.abs(cp.x-n.width))>.02)continue;
    let oldCost=0,newCost=0;
    for(const p of n.ports){const pin=p.id.slice(n.id.length+1),bit=c.connections[pin]?.[0],meta=c.spiceLayout.ports[pin];if(meta?.potential!==null&&meta?.potential!==undefined)continue;
      const neighbours=(byNet.get(bit)||[]).filter(p=>p.owner!==n.id);if(!neighbours.length)continue;
      const weight=pin===control?2:1;
      // One net has one geometric neighbourhood, independent of fanout.
      oldCost+=weight*neighbours.reduce((sum,q)=>sum+Math.abs(n.x+p.x-q.x),0)/neighbours.length;
      newCost+=weight*neighbours.reduce((sum,q)=>sum+Math.abs(n.x+n.width-p.x-q.x),0)/neighbours.length;
    }
    if(newCost+20<oldCost)choices.push({id:n.id,gain:oldCost-newCost});
  }
  return choices.sort((a,b)=>b.gain-a.gain).map(c=>c.id);
}

/** Reflect symbol strokes and fixed ports, keeping labels readable and E/C/D/S unchanged. */
export function mirrorTransistorSkin(source,cells,ids) {
  const skin=onml.parse(source),types=new Set(ids.map(id=>cells[id].type));
  for(const g of skin){if(!Array.isArray(g)||!types.has(g[1]?.['s:type']))continue;
    g[1]['data-control-mirrored']=g[1]['data-control-mirrored']==='true'?'false':'true';
    const width=Number(g[1]['s:width']);
    for(let i=2;i<g.length;i++){const child=g[i];if(!Array.isArray(child)||child[0]==='s:alias')continue;
      if(child[1]?.['s:pid']){const a=child[1];a['s:x']=width-Number(a['s:x']);if(a['s:position']==='left')a['s:position']='right';else if(a['s:position']==='right')a['s:position']='left';}
      else if(child[0]==='text'){child[1].x=width-Number(child[1].x);const anchor=child[1]['text-anchor']||'start';child[1]['text-anchor']=anchor==='start'?'end':anchor==='end'?'start':anchor;}
      else {if(child[1]?.['data-pin-lead'])child[1]['data-inner-x']=width-Number(child[1]['data-inner-x']);child[1].transform=`translate(${width},0) scale(-1,1) ${child[1].transform||''}`;}
    }
  }
  return onml.stringify(skin);
}

/** Rank whole-pair horizontal reflections by external, non-rail net distance.
 * Shared internal nets count once; movable input markers and rail taps are not anchors. */
export function pairSideChoices(graph,cells,pairs,faces=[]) {
  const fixed=new Set(faces.map(f=>f.device)),nodes=new Map(graph.children.map(n=>[n.id,n])),byNet=new Map(),groups=new Map();
  for(const n of graph.children){const c=cells[n.id];if(!c||c.spiceLayout?.kind==='PORT'||c.spiceLayout?.passive&&Object.values(c.spiceLayout.ports||{}).some(p=>p.potential!==null&&p.potential!==undefined))continue;
    for(const p of n.ports||[]){const pin=p.id.slice(n.id.length+1),meta=c.spiceLayout?.ports[pin];if(meta?.potential!==null&&meta?.potential!==undefined)continue;const bit=c.connections[pin]?.[0];if(bit===undefined)continue;if(!byNet.has(bit))byNet.set(bit,[]);byNet.get(bit).push({owner:n.id,x:n.x+p.x});}
  }
  for(const p of pairs)if(p.placement==='row'){if(!groups.has(p.motif))groups.set(p.motif,[]);groups.get(p.motif).push(p);}
  const choices=[];
  for(const [motif,rows]of groups){const members=new Set(rows.flatMap(p=>p.members));if([...members].some(id=>fixed.has(id)))continue;let oldCost=0,newCost=0;
    for(const row of rows){const ns=row.members.map(id=>nodes.get(id));if(ns.some(n=>!n))continue;const sum=Math.min(...ns.map(n=>n.x))+Math.max(...ns.map(n=>n.x+n.width)),own=new Map();
      for(const n of ns)for(const p of n.ports){const pin=p.id.slice(n.id.length+1),c=cells[n.id],meta=c.spiceLayout?.ports[pin];if(meta?.potential!==null&&meta?.potential!==undefined)continue;const bit=c.connections[pin]?.[0];if(!own.has(bit))own.set(bit,[]);own.get(bit).push(n.x+p.x);}
      for(const [bit,xs]of own){const external=(byNet.get(bit)||[]).filter(p=>!members.has(p.owner));if(!external.length)continue;for(const p of external){oldCost+=xs.reduce((s,x)=>s+Math.abs(x-p.x),0)/xs.length/external.length;newCost+=xs.reduce((s,x)=>s+Math.abs(sum-x-p.x),0)/xs.length/external.length;}}
    }
    if(oldCost-newCost>1)choices.push({motif,gain:oldCost-newCost,members:[...members]});
  }
  return choices.sort((a,b)=>b.gain-a.gain).slice(0,2);
}
