/** Canonical cell/net IDs allow reuse across equivalent instance sheets. */
export function normalizeLayout(netlist) {
  const ids=new Map(),bits=new Map(),cells={};
  const normalizeBit=bit=>{if(!bits.has(bit))bits.set(bit,bits.size+2);return bits.get(bit);};
  Object.entries(netlist.modules.circuit.cells).forEach(([name,cell],index)=>{
    const id='c'+index;ids.set(id,name);
    const connections=Object.fromEntries(Object.entries(cell.connections).map(([pin,values])=>[pin,values.map(normalizeBit)]));
    cells[id]={type:cell.type,connections,port_directions:cell.port_directions,attributes:{displayRef:cell.attributes.displayRef||cell.attributes.ref||'',value:cell.attributes.value||'',name:cell.attributes.name||''}};
    if(cell.spiceBlock)cells[id].spiceBlock=cell.spiceBlock;
    if(cell.spiceSymbol)cells[id].spiceSymbol=cell.spiceSymbol;
    if(cell.spiceLayout)cells[id].spiceLayout=cell.spiceLayout;
  });
  return {netlist:{modules:{circuit:{attributes:{top:1},ports:{},cells}}},ids,bits:new Map([...bits].map(([old,canonical])=>[canonical,old]))};
}
