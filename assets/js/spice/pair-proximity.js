import {rigidTransistorPairs} from './paired-layout.js';

/** Visual classic regions are affinities, not electrical hierarchy boundaries.
 * Co-locate a cross-region pair before ELK; never edit the caller's description. */
export function compactPairGroups(description,motifs,cells) {
  if(!description?.groups?.length)return {description,compactions:[]};
  const result=structuredClone(description),owners=new Map(),parents=new Map();
  for(const group of result.groups)for(const member of group.members){if(member.cell)owners.set(member.cell,group);if(member.group)parents.set(member.group.toLowerCase(),group);}
  const compactions=[];
  // Ignore visual group ownership when collecting pair candidates; the true
  // expanded-instance owner is checked separately below.
  for(const pair of rigidTransistorPairs(motifs,cells,null)){
    const [a,b]=pair.members,[target,source]=pair.members.map(id=>owners.get(id));
    if(!target||!source||target===source||target.direction!=='classic'||source.direction!=='classic')continue;
    const parent=parents.get(target.id.toLowerCase());if(!parent||parent!==parents.get(source.id.toLowerCase())||parent.direction!=='row')continue;
    if((cells[a].spiceLayout.owner||'')!==(cells[b].spiceLayout.owner||''))continue;
    const member=source.members.find(m=>m.cell===b);if(!member||member.instance||cells[b].spiceBlock)continue;
    const active=target.members.filter(m=>m.cell&&['Q','M','J','Z'].includes(cells[m.cell]?.spiceLayout?.kind)).length;if(active>=12)continue;
    source.members=source.members.filter(m=>m!==member);target.members.push(member);owners.set(b,target);
    compactions.push({motif:pair.motif,kind:pair.kind,members:[a,b],moved:b,from:source.id,to:target.id});
  }
  return {description:compactions.length?result:description,compactions};
}
