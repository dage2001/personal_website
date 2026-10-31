/** One append-only session log. Re-rendering never removes earlier diagnostics. */
export function createActivityLog($){
  const list=$('diagnostics'),details=$('messages');let sequence=0,follow=true,pending=false;
  let dimensions=[];
  const measure=()=>[list.clientWidth,list.clientHeight,list.scrollHeight];
  const resized=()=>measure().some((n,i)=>n!==dimensions[i]);
  function tail(){if(pending)return;pending=true;requestAnimationFrame(()=>{if(follow)list.scrollTop=list.scrollHeight;dimensions=measure();pending=false;});}
  list.setAttribute('role','log');list.setAttribute('aria-live','polite');list.setAttribute('aria-relevant','additions');list.setAttribute('aria-label','Schematic activity log');
  list.addEventListener('scroll',()=>{if(resized()){dimensions=measure();if(follow)tail();return;}if(!pending)follow=list.scrollHeight-list.scrollTop-list.clientHeight<24;});
  const observer=new ResizeObserver(()=>{dimensions=measure();if(follow)tail();});observer.observe(list);
  function append({message,severity='info',category='Tools',line,source}){
    if(!message)return;const atTail=follow,date=new Date(),li=document.createElement('li'),time=document.createElement('time'),body=document.createElement('span'),label=document.createElement('strong');
    severity=['error','warning','info'].includes(severity)?severity:'info';
    li.className=severity;li.dataset.logSequence=String(++sequence);li.dataset.logCategory=category;li.dataset.logSeverity=severity;
    time.dateTime=date.toISOString();time.textContent=date.toLocaleTimeString([], {hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});time.title=time.dateTime;
    label.textContent=severity.toUpperCase()+' · '+category+' ';body.append(label,document.createTextNode((source&&source!=='input.cir'?source+' · ':'')+(line?'line '+line+' · ':'')+message));li.append(time,body);list.append(li);
    $('message-count').textContent=sequence+' entries';if(severity!=='info')details.open=true;
    if(atTail)tail();
  }
  return {append};
}
