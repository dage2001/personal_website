/** One edit toggle, with a measured horizontal reveal and no hidden tab stops. */
export function createEditToolbar($){
  const button=$('interactive'),reveal=$('edit-tools-reveal'),inner=$('edit-tools-inner');
  const enabled=()=>button.getAttribute('aria-pressed')==='true';
  const measure=()=>{reveal.style.width=enabled()?inner.scrollWidth+'px':'0px';};
  function set(value){button.setAttribute('aria-pressed',String(value));button.setAttribute('aria-expanded',String(value));button.title=value?'Exit editing and hide tools':'Edit schematic';button.setAttribute('aria-label',button.title);reveal.inert=!value;reveal.classList.toggle('is-open',value);measure();}
  new ResizeObserver(measure).observe(inner);set(false);
  return {enabled,set};
}
