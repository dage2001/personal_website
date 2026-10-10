// Original SVG schematics, intentionally fixed geometry for legible dimensions.
const dim = (x1, y1, x2, y2, label, tx, ty) => {
  const dx = y1 === y2 ? 0 : 3, dy = y1 === y2 ? 3 : 0;
  return `<path class="rf-dimension" d="M${x1} ${y1}L${x2} ${y2}M${x1-dx} ${y1-dy}L${x1+dx} ${y1+dy}M${x2-dx} ${y2-dy}L${x2+dx} ${y2+dy}"/><text x="${tx}" y="${ty}" text-anchor="middle">${label}</text>`;
};
const rect = (x, y, w, h, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
const substrate = rect(55, 100, 300, 90, 'rf-dielectric');
const ground = rect(55, 190, 300, 8, 'rf-conductor');
const coplanar = rect(55, 92, 90, 8, 'rf-conductor') + rect(175, 92, 60, 8, 'rf-conductor') + rect(265, 92, 90, 8, 'rf-conductor');
const coplanarDims = dim(175, 70, 235, 70, 'W', 205, 58) + dim(145, 82, 175, 82, 'S', 160, 69) + dim(365, 100, 365, 190, 'h', 382, 150);
const drawings = {
  microstrip: substrate + ground + rect(145, 88, 120, 12, 'rf-conductor') + dim(145, 65, 265, 65, 'W', 205, 52) + dim(365, 100, 365, 190, 'h', 382, 150) + dim(280, 88, 280, 100, 't', 297, 97) + '<text x="205" y="150" text-anchor="middle">εᵣ</text><text x="85" y="62">Air</text>',
  cpw: substrate + coplanar + coplanarDims + '<text x="205" y="150" text-anchor="middle">εᵣ</text><text x="205" y="218" text-anchor="middle">Air below · t = 0</text>',
  gcpw: substrate + ground + coplanar + coplanarDims + '<text x="205" y="150" text-anchor="middle">εᵣ</text><text x="205" y="218" text-anchor="middle">Bottom ground · t = 0</text>',
  stripline: rect(55, 70, 300, 120, 'rf-dielectric') + ground + rect(55, 62, 300, 8, 'rf-conductor') + rect(145, 128, 120, 4, 'rf-conductor') + dim(145, 112, 265, 112, 'W', 205, 102) + dim(365, 70, 365, 190, 'B', 382, 138) + '<text x="90" y="110">εᵣ</text><text x="205" y="220" text-anchor="middle">Centered conductor · t = 0</text>',
  coax: '<circle class="rf-conductor" cx="205" cy="130" r="85"/><circle class="rf-dielectric" cx="205" cy="130" r="74"/><circle class="rf-conductor" cx="205" cy="130" r="24"/>' + dim(181, 130, 229, 130, 'd', 205, 119) + dim(131, 225, 279, 225, 'D (inside)', 205, 244) + '<text x="247" y="100">εᵣ</text>',
  siw: rect(70, 67, 270, 123, 'rf-dielectric') + rect(70, 60, 270, 7, 'rf-conductor') + rect(70, 190, 270, 7, 'rf-conductor') + rect(85, 67, 14, 123, 'rf-conductor') + rect(311, 67, 14, 123, 'rf-conductor') + dim(92, 42, 318, 42, 'a (via centers)', 205, 30) + dim(355, 67, 355, 190, 'h', 372, 134) + '<text x="205" y="128" text-anchor="middle">εᵣ · TE₁₀</text><text x="205" y="217" text-anchor="middle">Via row detail (top view)</text>' + [95, 155, 215].map(x => `<circle class="rf-conductor" cx="${x}" cy="240" r="8"/>`).join('') + dim(95, 256, 155, 256, 'p', 125, 275) + dim(237, 232, 237, 248, 'd', 253, 245)
};
export function diagram(type, mini = false) {
  return `<svg viewBox="0 0 410 ${type === 'siw' ? 285 : 255}" ${mini ? 'aria-hidden="true"' : `role="img" aria-label="${type} cross section with dimension labels"`} xmlns="http://www.w3.org/2000/svg">${drawings[type]}</svg>`;
}
