/** Compare complete, electrically validated ELK candidates, independently of cell type. */
export function layoutCost(report) {
  return (report.uniqueWireLength??report.wireLength)+12*(report.uniqueBends??report.bends)+.35*(report.detourLength||0)+2*Math.sqrt(report.width*report.height)+3*(report.motifPenalty||0)+3*(report.pairSeparationPenalty||0);
}
export function chooseLayoutCandidate(candidates) {
  if(!candidates.length)throw Error('No valid schematic layout candidate.');
  const paired=Math.max(...candidates.map(c=>c.report.pairConstraints?.length||0));
  candidates=candidates.filter(c=>(c.report.pairConstraints?.length||0)===paired);
  const bounded=candidates.filter(c=>c.report.aspectRatio<=2.5);
  return [...(bounded.length?bounded:candidates)].sort((a,b)=>layoutCost(a.report)-layoutCost(b.report))[0];
}
