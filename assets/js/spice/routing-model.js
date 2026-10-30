const eps=.001,key=p=>Math.round(p.x*1000)+','+Math.round(p.y*1000),same=(a,b)=>Math.abs(a-b)<eps;
export const pointOnWire=(p,s)=>same(s.a.x,s.b.x)?same(p.x,s.a.x)&&p.y>=Math.min(s.a.y,s.b.y)-eps&&p.y<=Math.max(s.a.y,s.b.y)+eps:same(p.y,s.a.y)&&p.x>=Math.min(s.a.x,s.b.x)-eps&&p.x<=Math.max(s.a.x,s.b.x)+eps;
const length=s=>Math.abs(s.a.x-s.b.x)+Math.abs(s.a.y-s.b.y),hits=(s,n)=>Math.max(s.a.x,s.b.x)>n.x+eps&&Math.min(s.a.x,s.b.x)<n.x+n.width-eps&&Math.max(s.a.y,s.b.y)>n.y+eps&&Math.min(s.a.y,s.b.y)<n.y+n.height-eps;
function clean(ps){const out=[];for(const p of ps){if(out.length&&key(out.at(-1))===key(p))continue;while(out.length>1&&(same(out.at(-2).x,out.at(-1).x)&&same(out.at(-1).x,p.x)||same(out.at(-2).y,out.at(-1).y)&&same(out.at(-1).y,p.y)))out.pop();out.push({...p});}return out;}
export class RoutingScene {
  constructor(drawing,{step=8,segments=drawing.segments}={}){this.step=step;this.components=structuredClone(drawing.components);this.segments=structuredClone(segments);this.seed=structuredClone(this.segments);this.initial=JSON.stringify(this.components);this.base={width:drawing.width,height:drawing.height};this.undoStack=[];this.redoStack=[];this.cache=null;}
  pins(){return this.pinCache||(this.pinCache=this.components.flatMap(n=>n.ports.map(p=>({...p,owner:n.id,id:n.id+'.'+p.pin}))));}
  snapshot(){return structuredClone({components:this.components,segments:this.segments});}
  restore(s){this.components=structuredClone(s.components);this.segments=structuredClone(s.segments);this.cache=null;this.pinCache=null;}
  remember(before=this.snapshot()){this.undoStack.push(before);if(this.undoStack.length>60)this.undoStack.shift();this.redoStack=[];this.cache=null;this.pinCache=null;}
  undo(){if(!this.undoStack.length)return;this.redoStack.push(this.snapshot());this.restore(this.undoStack.pop());}
  redo(){if(!this.redoStack.length)return;this.undoStack.push(this.snapshot());this.restore(this.redoStack.pop());}
  clear(){this.remember();this.segments=[];}
  remove(index){if(!this.segments[index])return;this.remember();this.segments.splice(index,1);}
  onGrid(p){return same(p.x/this.step,Math.round(p.x/this.step))&&same(p.y/this.step,Math.round(p.y/this.step));}
  snap(p){return {x:Math.round(p.x/this.step)*this.step,y:Math.round(p.y/this.step)*this.step};}
  validSegment(s,bit){
    if(!this.onGrid(s.a)||!this.onGrid(s.b)||!same(s.a.x,s.b.x)&&!same(s.a.y,s.b.y))return false;
    const pins=this.pins();if(pins.some(p=>p.bit!==bit&&pointOnWire(p,s)))return false;
    if(this.segments.some(t=>t.bit!==bit&&(pointOnWire(s.a,t)||pointOnWire(s.b,t)||pointOnWire(t.a,s)||pointOnWire(t.b,s))))return false;
    for(const n of this.components)if(hits(s,n)){
      const allowed=pins.filter(p=>p.owner===n.id&&p.bit===bit).some(p=>p.side==='NORTH'?same(s.a.x,p.x)&&same(s.b.x,p.x)&&Math.max(s.a.y,s.b.y)<=p.y+eps:p.side==='SOUTH'?same(s.a.x,p.x)&&same(s.b.x,p.x)&&Math.min(s.a.y,s.b.y)>=p.y-eps:p.side==='WEST'?same(s.a.y,p.y)&&same(s.b.y,p.y)&&Math.max(s.a.x,s.b.x)<=p.x+eps:p.side==='EAST'?same(s.a.y,p.y)&&same(s.b.y,p.y)&&Math.min(s.a.x,s.b.x)>=p.x-eps:false);
      if(!allowed)return false;
    }return true;
  }
  addPath(bit,path){const ps=clean(path),parts=ps.slice(1).map((b,i)=>({bit,a:ps[i],b})).filter(s=>length(s)>eps);if(!parts.length)return false;if(parts.some(s=>!this.validSegment(s,bit)))throw Error('Route blocked by a component or another node.');this.remember();this.segments.push(...parts);return true;}
  move(id,dx,dy){dx=Math.round(dx/this.step)*this.step;dy=Math.round(dy/this.step)*this.step;if(!dx&&!dy)return;const before=this.snapshot(),n=this.components.find(n=>n.id===id);if(!n)return;const old=n.ports.map(p=>({...p}));this.segments=this.segments.filter(s=>!old.some(p=>p.bit===s.bit&&(key(p)===key(s.a)||key(p)===key(s.b))));n.x+=dx;n.y+=dy;for(const p of n.ports){p.x+=dx;p.y+=dy;}
    this.pinCache=null;const overlap=this.components.some(m=>m!==n&&n.x<m.x+m.width-eps&&n.x+n.width>m.x+eps&&n.y<m.y+m.height-eps&&n.y+n.height>m.y+eps);
    if(overlap||this.segments.some(s=>!this.validSegment(s,s.bit))||n.ports.some(p=>this.pins().some(q=>q.owner!==id&&q.bit!==p.bit&&key(q)===key(p)))){this.restore(before);throw Error('Drop blocked: a component or another node occupies that position.');}this.remember(before);
  }
  transform(id,action){
    const n=this.components.find(n=>n.id===id);if(!n)return;const before=this.snapshot(),w=n.width,h=n.height;
    const m=action==='rotate'?[0,1,-1,0,h,0]:action==='mirror-x'?[1,0,0,-1,0,h]:action==='mirror-y'?[-1,0,0,1,w,0]:null;if(!m)throw Error('Unknown transform.');
    const old=n.ports.map(p=>({...p})),apply=p=>({x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]});
    this.segments=this.segments.filter(s=>!old.some(p=>p.bit===s.bit&&(key(p)===key(s.a)||key(p)===key(s.b))));
    const sides=action==='rotate'?{NORTH:'EAST',EAST:'SOUTH',SOUTH:'WEST',WEST:'NORTH'}:action==='mirror-x'?{NORTH:'SOUTH',SOUTH:'NORTH'}:{EAST:'WEST',WEST:'EAST'};
    for(const p of n.ports){const q=apply({x:p.x-n.x,y:p.y-n.y});p.x=n.x+q.x;p.y=n.y+q.y;p.side=sides[p.side]||p.side;}
    const b=n.editorMatrix||[1,0,0,1,0,0];n.editorMatrix=[m[0]*b[0]+m[2]*b[1],m[1]*b[0]+m[3]*b[1],m[0]*b[2]+m[2]*b[3],m[1]*b[2]+m[3]*b[3],m[0]*b[4]+m[2]*b[5]+m[4],m[1]*b[4]+m[3]*b[5]+m[5]];
    if(action==='rotate'){n.width=h;n.height=w;}this.pinCache=null;
    if(n.ports.some(p=>!this.onGrid(p))||this.components.some(q=>q!==n&&n.x<q.x+q.width-eps&&n.x+n.width>q.x+eps&&n.y<q.y+q.height-eps&&n.y+n.height>q.y+eps)||this.segments.some(s=>!this.validSegment(s,s.bit))||n.ports.some(p=>this.pins().some(q=>q.owner!==id&&q.bit!==p.bit&&key(q)===key(p)))){this.restore(before);throw Error('Transform blocked: a component or wire occupies that position.');}this.remember(before);
  }
  connectivity(){
    if(this.cache)return this.cache;const nets=new Map();for(const p of this.pins()){if(!nets.has(p.bit))nets.set(p.bit,{pins:[],segments:[]});nets.get(p.bit).pins.push(p);}for(const s of this.segments){if(!nets.has(s.bit))nets.set(s.bit,{pins:[],segments:[]});nets.get(s.bit).segments.push(s);}
    const results=[];for(const [bit,net]of nets){const points=new Map(),add=p=>{if(!points.has(key(p)))points.set(key(p),p);};net.pins.forEach(add);for(const s of net.segments){add(s.a);add(s.b);}for(let i=0;i<net.segments.length;i++)for(let j=i+1;j<net.segments.length;j++){const a=net.segments[i],b=net.segments[j];if(same(a.a.x,a.b.x)===same(b.a.x,b.b.x))continue;const v=same(a.a.x,a.b.x)?a:b,h=v===a?b:a,p={x:v.a.x,y:h.a.y};if(pointOnWire(p,v)&&pointOnWire(p,h))add(p);}
      const parent=new Map([...points.keys()].map(k=>[k,k])),find=k=>{let r=k;while(parent.get(r)!==r)r=parent.get(r);while(k!==r){const next=parent.get(k);parent.set(k,r);k=next;}return r;};for(const s of net.segments){const ps=[...points.values()].filter(p=>pointOnWire(p,s));for(const p of ps.slice(1))parent.set(find(key(p)),find(key(ps[0])));}
      const islands=new Map();for(const p of net.pins){const id=find(key(p));if(!islands.has(id))islands.set(id,{pins:[],points:[]});islands.get(id).pins.push(p);}for(const p of points.values()){const id=find(key(p));if(islands.has(id))islands.get(id).points.push(p);}results.push({bit,islands:[...islands.values()],points:[...points.values()],segments:net.segments});
    }this.cache=results;return results;
  }
  airwires(){const result=[];for(const {bit,islands}of this.connectivity()){if(islands.length<2)continue;const joined=new Set([0]);while(joined.size<islands.length){let best;for(const i of joined)for(let j=0;j<islands.length;j++)if(!joined.has(j))for(const a of islands[i].points)for(const b of islands[j].points){const d=(a.x-b.x)**2+(a.y-b.y)**2;if(!best||d<best.d)best={bit,a,b,d,j};}result.push(best);joined.add(best.j);}}return result;}
  bounds(){const xs=[-20,this.base.width+20],ys=[-20,this.base.height+20];for(const n of this.components){xs.push(n.x-20,n.x+n.width+20);ys.push(n.y-20,n.y+n.height+20);}for(const s of this.segments){xs.push(s.a.x-20,s.b.x+20);ys.push(s.a.y-20,s.b.y+20);}const x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};}
  drawing(){const b=this.bounds();return {version:1,width:b.w,height:b.h,components:structuredClone(this.components.filter(n=>!n.decoration)),segments:structuredClone(this.segments)};}
  findPath(bit,a,b){
    if(!this.onGrid(a)||!this.onGrid(b))return null;const good=ps=>ps.slice(1).every((p,i)=>this.validSegment({a:ps[i],b:p},bit));for(const ps of [[a,b],[a,{x:b.x,y:a.y},b],[a,{x:a.x,y:b.y},b]]){const path=clean(ps);if(good(path))return path;}
    const g=this.step,bs=this.bounds(),minX=Math.floor(Math.min(bs.x,a.x,b.x)/g)-5,maxX=Math.ceil(Math.max(bs.x+bs.w,a.x,b.x)/g)+5,minY=Math.floor(Math.min(bs.y,a.y,b.y)/g)-5,maxY=Math.ceil(Math.max(bs.y+bs.h,a.y,b.y)/g)+5;
    const start={x:a.x/g,y:a.y/g,dir:-1,cost:0,key:a.x/g+','+a.y/g+',-1'},open=[start],costs=new Map([[start.key,0]]),previous=new Map(),states=new Map([[start.key,start]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]],heuristic=n=>Math.abs(n.x-b.x/g)+Math.abs(n.y-b.y/g);let finish=null,visits=0;
    while(open.length&&visits++<30000){let best=0;for(let i=1;i<open.length;i++)if(open[i].cost+heuristic(open[i])<open[best].cost+heuristic(open[best]))best=i;const n=open.splice(best,1)[0];if(n.cost!==costs.get(n.key))continue;if(n.x===b.x/g&&n.y===b.y/g){finish=n;break;}
      for(let d=0;d<4;d++){const x=n.x+dirs[d][0],y=n.y+dirs[d][1];if(x<minX||x>maxX||y<minY||y>maxY)continue;const next={x,y,dir:d,key:x+','+y+','+d,cost:n.cost+1+(n.dir!==-1&&n.dir!==d?3:0)};if(next.cost>=(costs.get(next.key)??Infinity)||!this.validSegment({a:{x:n.x*g,y:n.y*g},b:{x:x*g,y:y*g}},bit))continue;costs.set(next.key,next.cost);previous.set(next.key,n.key);states.set(next.key,next);open.push(next);}
    }if(!finish)return null;const ps=[];for(let n=finish;n;n=states.get(previous.get(n.key)))ps.push({x:n.x*g,y:n.y*g});return clean(ps.reverse());
  }
  async autoRoute(cancel=()=>false){const before=this.snapshot();this.remember(before);if(!this.segments.length&&JSON.stringify(this.components)===this.initial){this.segments=structuredClone(this.seed);this.cache=null;return;}
    const failed=new Set();let iterations=0;while(!cancel()&&iterations++<Math.max(20,this.pins().length*2)){const air=this.airwires().find(a=>!failed.has(a.bit+':'+key(a.a)+':'+key(a.b)));if(!air)break;const path=this.findPath(air.bit,air.a,air.b);if(path){this.segments.push(...path.slice(1).map((b,i)=>({bit:air.bit,a:path[i],b})));this.cache=null;}else failed.add(air.bit+':'+key(air.a)+':'+key(air.b));if(iterations%3===0)await new Promise(r=>setTimeout(r,0));}this.redoStack=[];
  }
}
