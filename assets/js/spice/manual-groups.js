import {isSelectableComponent} from './component-selection.js';
export const groupUnitId=id=>'@manual-group/'+id;
export function expandGroupSelection(ids,groups=[]){const result=new Set(ids);for(const g of groups)if(g.members.some(id=>result.has(id)))for(const id of g.members)result.add(id);return result;}
export function selectedGroup(ids,groups=[]){const set=new Set(ids);return groups.find(g=>g.members.length===set.size&&g.members.every(id=>set.has(id)));}
export function manualUnits(components,groups=[]){
  const map=new Map(components.map(n=>[n.id,n])),grouped=new Set(groups.flatMap(g=>g.members)),units=components.filter(n=>!grouped.has(n.id)).map(n=>({...n,members:[n.id]}));
  for(const g of groups){const ns=g.members.map(id=>map.get(id));if(ns.some(n=>!n))throw Error('Unknown manual group member.');const x=Math.min(...ns.map(n=>n.x)),y=Math.min(...ns.map(n=>n.y));units.push({id:groupUnitId(g.id),groupId:g.id,members:[...g.members],x,y,width:Math.max(...ns.map(n=>n.x+n.width))-x,height:Math.max(...ns.map(n=>n.y+n.height))-y,ports:[]});}return units;
}
export function groupCollision(components,groups=[]){
  if(!groups.length)return false;
  const units=manualUnits(components,groups);return units.some((a,i)=>units.slice(i+1).some(b=>(a.groupId||b.groupId)&&a.x<b.x+b.width-.001&&a.x+a.width>b.x+.001&&a.y<b.y+b.height-.001&&a.y+a.height>b.y+.001));
}
export function validateManualGroups(groups,components){
  if(groups===undefined)return;if(!Array.isArray(groups)||groups.length>5000)throw Error('Invalid project: invalid manual groups.');
  const ids=new Set(),members=new Set(),map=new Map(components.map(n=>[n.id,n]));for(const g of groups){if(!g||typeof g.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(g.id)||ids.has(g.id)||!Array.isArray(g.members)||g.members.length<2)throw Error('Invalid project: invalid manual group identity.');ids.add(g.id);for(const id of g.members){const n=map.get(id);if(!n||!isSelectableComponent(n)||members.has(id))throw Error('Invalid project: missing or duplicate manual group member.');members.add(id);}}
}
