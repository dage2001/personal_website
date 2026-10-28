/** Compare complete, electrically validated ELK candidates, independently of cell type. */
export function layoutCost(report) {
  return report.wireLength+12*report.bends+.35*(report.detourLength||0)+2*Math.sqrt(report.width*report.height);
}
export function chooseLayoutCandidate(candidates) {
  if(!candidates.length)throw Error('No valid schematic layout candidate.');
  const bounded=candidates.filter(c=>c.report.aspectRatio<=2.5);
  return [...(bounded.length?bounded:candidates)].sort((a,b)=>layoutCost(a.report)-layoutCost(b.report))[0];
}
