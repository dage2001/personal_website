export const labelId=(owner,index)=>encodeURIComponent(owner)+':'+index;
export function validateLabelOverrides(labels){
  if(labels===undefined)return;
  if(!Array.isArray(labels)||labels.length>20000)throw Error('Invalid project: invalid label overrides.');
  const ids=new Set();for(const l of labels){
    if(!l||typeof l.owner!=='string'||!Number.isSafeInteger(l.index)||l.index<0||l.id!==labelId(l.owner,l.index)||ids.has(l.id)||typeof l.text!=='string'||l.text.length>20000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(l.text)||![l.x,l.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=1000000))throw Error('Invalid project: invalid label identity, text or position.');ids.add(l.id);
    const m=l.orientation;if(!Array.isArray(m)||m.length!==4||!m.every(n=>[-1,0,1].includes(n))||m[0]**2+m[1]**2!==1||m[2]**2+m[3]**2!==1||m[0]*m[2]+m[1]*m[3]!==0)throw Error('Invalid project: label transform must be a rotation or mirror.');
  }
}
export function transformLabel(label,action){
  const t={rotate:[0,1,-1,0],'mirror-x':[1,0,0,-1],'mirror-y':[-1,0,0,1]}[action];if(!t)throw Error('Unknown label transform.');
  const m=label.orientation;return {...label,orientation:[t[0]*m[0]+t[2]*m[1],t[1]*m[0]+t[3]*m[1],t[0]*m[2]+t[2]*m[3],t[1]*m[2]+t[3]*m[3]].map(n=>n||0)};
}
