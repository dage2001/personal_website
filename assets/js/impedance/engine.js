// Pure, synchronous RF models. All dimensions in metres; frequency in Hz.
// Provenance, assumptions and verification: docs/IMPEDANCE_MODELS.md.
export const C0 = 299792458;
export const ETA0 = 376.730313668;
const PI = Math.PI;
const positive = (v, name) => {
  if (!Number.isFinite(v) || v <= 0) throw new Error(`${name} must be a finite number greater than zero.`);
};
function agm(a, b) {
  for (let i = 0; i < 60; i++) {
    const next = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = next;
    if (Math.abs(a - b) < 1e-15 * a) return a;
  }
  throw new Error('Elliptic integral did not converge.');
}
// K(k)/K(kc), where kc is the complementary modulus, not the parameter m=k².
export function ellipticRatio(k, kc = Math.sqrt((1 - k) * (1 + k))) {
  if (!(k > 0 && k <= 1 && kc > 0 && kc <= 1)) throw new Error('Geometry exceeds the numerical range of the conformal-mapping model.');
  return agm(1, k) / agm(1, kc);
}
const logSinh = x => x + Math.log(-Math.expm1(-2 * x)) - Math.LN2;
const logTanh = x => Math.log(-Math.expm1(-2 * x)) - Math.log1p(Math.exp(-2 * x));
function ratioFromLog(logk) {
  return ellipticRatio(Math.exp(logk), Math.sqrt(-Math.expm1(2 * logk)));
}
function hjAir(u) {
  const f = 6 + (2 * PI - 6) * Math.exp(-((30.666 / u) ** 0.7528));
  return ETA0 / (2 * PI) * Math.log(f / u + Math.sqrt(1 + (2 / u) ** 2));
}
// Hammerstad–Jensen (1980), including its own normalized thickness correction.
function microstrip({ w, h, t = 0, er }) {
  const u = w / h, tn = t / h;
  if (!Number.isFinite(t) || t < 0) throw new Error('Copper thickness must be zero or positive.');
  if (t > 0.1 * h || t > 0.2 * w) throw new Error('Thickness correction is limited here to t/h ≤ 0.1 and t/W ≤ 0.2. Reduce t or use a field solver.');
  const du = tn === 0 ? 0 : tn / PI * Math.log1p(4 * Math.E / tn * Math.tanh(Math.sqrt(6.517 * u)) ** 2);
  const ur = u + du * (1 + 1 / Math.cosh(Math.sqrt(er - 1))) / 2;
  const a = 1 + Math.log((ur ** 4 + (ur / 52) ** 2) / (ur ** 4 + 0.432)) / 49 + Math.log1p((ur / 18.1) ** 3) / 18.7;
  const b = 0.564 * ((er - 0.9) / (er + 3)) ** 0.053;
  const e = (er + 1) / 2 + (er - 1) / 2 * (1 + 10 / ur) ** (-a * b);
  const zr = hjAir(ur);
  return { z: zr / Math.sqrt(e), eeff: e * (hjAir(u + du) / zr) ** 2 };
}
// Ghione–Naldi finite-substrate conformal mapping, zero conductor thickness.
function coplanar({ w, s, h, er, t = 0 }, grounded) {
  if (t !== 0) throw new Error('CPW/GCPW use zero-thickness conductors in this model; set t = 0.');
  const k = w / (w + 2 * s), q = ellipticRatio(k);
  const x = PI * w / (4 * h), y = PI * (w + 2 * s) / (4 * h);
  const qh = ratioFromLog(grounded ? logTanh(x) - logTanh(y) : logSinh(x) - logSinh(y));
  const eeff = grounded ? (q + er * qh) / (q + qh) : 1 + (er - 1) * qh / (2 * q);
  return { eeff, z: ETA0 / (grounded ? 2 * (q + qh) : 4 * q) / Math.sqrt(eeff) };
}
// Cohn exact centered, infinitesimally thin stripline. b = ground-plane separation.
function stripline({ w, b, er, t = 0 }) {
  if (t !== 0) throw new Error('Stripline uses Cohn’s zero-thickness model; set t = 0.');
  const x = PI * w / (2 * b);
  const q = ellipticRatio(Math.tanh(x), 2 * Math.exp(-x) / (1 + Math.exp(-2 * x)));
  return { z: ETA0 / (4 * Math.sqrt(er) * q), eeff: er };
}
function coax({ inner, outer, er }) {
  if (outer <= inner) throw new Error('Outer conductor inside diameter D must exceed inner conductor diameter d.');
  return { z: ETA0 / (2 * PI * Math.sqrt(er)) * Math.log(outer / inner), eeff: er, ratio: outer / inner };
}
function siw(p) {
  const { a, d, pitch, h, er, f } = p;
  if (pitch <= d) throw new Error('Via pitch p must exceed via diameter d (non-overlapping vias).');
  if (a <= d) throw new Error('Via-row center separation a must exceed via diameter d.');
  const aeff = a - d * d / (0.95 * pitch);
  positive(aeff, 'Equivalent width');
  const fc = C0 / (2 * aeff * Math.sqrt(er));
  const kc = PI / aeff, k = 2 * PI * f * Math.sqrt(er) / C0;
  const delta = (k - kc) * (k + kc);
  const atCutoff = Math.abs(f / fc - 1) <= 1e-10;
  const state = atCutoff ? 'cutoff' : delta > 0 ? 'propagating' : 'evanescent';
  const beta = state === 'propagating' ? Math.sqrt(delta) : 0;
  const decay = state === 'evanescent' ? Math.sqrt(-delta) : 0;
  return {
    state, aeff, fc, bulkEr: er, beta, decay,
    waveZ: state === 'propagating' ? ETA0 / Math.sqrt(er) * k / beta : null,
    waveZImag: state === 'evanescent' ? ETA0 / Math.sqrt(er) * k / decay : null,
    wavelength: beta > 0 ? 2 * PI / beta : null,
    velocity: beta > 0 ? 2 * PI * f / beta : null,
    phaseDelay: beta * 180 / PI / 1000,
    nextCutoff: Math.min(2 * fc, C0 / (2 * h * Math.sqrt(er)))
  };
}
export const MODEL_INFO = {
  microstrip: { name: 'Hammerstad–Jensen', note: 'Quasi-static microstrip; finite substrate height and H–J copper-thickness correction. Open air above, infinite ground below. No cover, solder mask, or frequency dispersion.' },
  cpw: { name: 'Ghione–Naldi · air-backed', note: 'Finite-height dielectric with air below; infinite lateral grounds, zero-thickness conductors. No copper-thickness correction, cover, solder mask, or frequency dispersion.' },
  gcpw: { name: 'Ghione–Naldi · metal-backed', note: 'Finite-height dielectric with a continuous bottom ground; infinite lateral grounds, zero-thickness conductors. Ground planes assumed equipotential. No via-fence, copper-thickness, or frequency-dispersion model.' },
  stripline: { name: 'Cohn · centered stripline', note: 'Exact conformal mapping for a centered zero-thickness strip between infinite ground planes in a homogeneous dielectric. B is the full plane separation. No copper-thickness correction.' },
  coax: { name: 'Exact lossless TEM', note: 'Concentric perfect conductors and homogeneous nonmagnetic dielectric. D is the inside diameter of the outer conductor. TEM propagation only; higher-order modes are not calculated.' },
  siw: { name: 'Equivalent rectangular guide · TE₁₀', note: 'Empirical a_eff = a − d²/(0.95p), followed by lossless rectangular-waveguide TE₁₀ dispersion. Nonmagnetic dielectric. TE wave impedance is E/H, not a unique 50 Ω port impedance. No leakage or conductor/dielectric loss model.' }
};
const DIMENSIONS = { microstrip: ['w', 'h'], cpw: ['w', 's', 'h'], gcpw: ['w', 's', 'h'], stripline: ['w', 'b'], coax: ['inner', 'outer'], siw: ['a', 'd', 'pitch', 'h'] };
export function analyze(type, p) {
  if (!DIMENSIONS[type]) throw new Error('Unknown transmission-line type.');
  positive(p.f, 'Frequency'); positive(p.er, 'Relative permittivity');
  if (p.er < 1 || p.er > 128) throw new Error('Relative permittivity must be between 1 and 128 for this calculator.');
  for (const key of DIMENSIONS[type]) {
    positive(p[key], key);
    if (p[key] < 1e-9 || p[key] > 10) throw new Error('Dimensions must be between 0.000001 and 10000 mm.');
  }
  const warnings = [];
  let result;
  if (type === 'siw') {
    result = siw(p);
    if (p.pitch > 2 * p.d || p.d / p.a >= 0.2) warnings.push('Via geometry is outside the conservative design checks p ≤ 2d and d/a < 0.2. Equivalent-width accuracy and leakage need full-wave verification.');
    if (p.h >= result.aeff) warnings.push('Height is not smaller than effective width; TE₁₀ may not be the dominant rectangular-guide mode.');
    if (p.f >= result.nextCutoff) warnings.push('Above the next equivalent-guide cutoff estimate: a single-mode TE₁₀ treatment is insufficient.');
  } else {
    result = type === 'microstrip' ? microstrip(p) : type === 'cpw' || type === 'gcpw' ? coplanar(p, type === 'gcpw') : type === 'stripline' ? stripline(p) : coax(p);
    const beta = 2 * PI * p.f * Math.sqrt(result.eeff) / C0;
    Object.assign(result, { state: 'propagating', beta, wavelength: 2 * PI / beta, velocity: C0 / Math.sqrt(result.eeff), phaseDelay: beta * 180 / PI / 1000 });
    if (['microstrip', 'cpw', 'gcpw'].includes(type)) {
      warnings.push('Quasi-static approximation: Z₀ and ε_eff have no frequency dispersion. Use when transverse dimensions are much smaller than wavelength; high-frequency accuracy is not guaranteed.');
      const span = Math.max(p.h, p.w + (p.s || 0) * 2);
      if (span / result.wavelength > 0.1) warnings.push('A transverse dimension exceeds λg/10. Treat these quasi-static results cautiously and verify with a dispersive or full-wave model.');
      if (type === 'microstrip' && (p.w / p.h < 0.01 || p.w / p.h > 100)) warnings.push('W/h is outside 0.01–100; the Hammerstad–Jensen fit is extrapolated.');
    }
  }
  for (const value of Object.values(result)) {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Geometry or frequency exceeds the model’s numerical range.');
  }
  return { ...result, warnings, model: MODEL_INFO[type].name };
}
export const SYNTHESIS_PARAMETERS = { microstrip: ['w'], cpw: ['w', 's'], gcpw: ['w', 's'], stripline: ['w'], coax: ['ratio'], siw: [] };
export function withParameter(p, parameter, value) {
  return parameter === 'ratio' ? { ...p, outer: p.inner * value } : { ...p, [parameter]: value };
}
// Logarithmic bracket search reveals multiple crossings and invalid regions;
// bisection operates only within a contiguous valid bracket.
export function synthesize(type, p, parameter, target, low, high) {
  if (!SYNTHESIS_PARAMETERS[type]?.includes(parameter)) throw new Error('This synthesis parameter is not supported. SIW has no 50 Ω synthesis.');
  positive(target, 'Target impedance'); positive(low, 'Lower bound'); positive(high, 'Upper bound');
  if (high <= low) throw new Error('Upper bound must exceed lower bound.');
  const evaluate = x => analyze(type, withParameter(p, parameter, x)).z - target;
  const brackets = [], exact = [];
  let previous = null, valid = 0;
  for (let i = 0; i <= 256; i++) {
    const x = Math.exp(Math.log(low) + i / 256 * Math.log(high / low));
    try {
      const residual = evaluate(x); valid++;
      if (Math.abs(residual) <= 1e-7) { exact.push(x); previous = null; continue; }
      else if (previous && previous.residual * residual < 0) brackets.push([previous.x, x]);
      previous = { x, residual };
    } catch (_) { previous = null; }
  }
  if (exact.length + brackets.length > 1) throw new Error('Multiple solutions detected in the sampled interval. Narrow the bounds to isolate a solution.');
  if (!exact.length && !brackets.length) throw new Error(valid ? 'No solution bracket found within the valid part of these bounds. Change the bounds or target.' : 'No valid geometry in these bounds. Check the fixed dimensions and model limits.');
  let value = exact[0], iterations = 0;
  if (!exact.length) {
    let [left, right] = brackets[0], fl = evaluate(left);
    for (; iterations < 100; iterations++) {
      value = (left + right) / 2;
      const fm = evaluate(value);
      if (Math.abs(fm) <= 1e-7) break;
      if (fl * fm < 0) right = value;
      else { left = value; fl = fm; }
    }
  }
  const design = withParameter(p, parameter, value), result = analyze(type, design);
  const residual = result.z - target;
  if (Math.abs(residual) > 1e-6) throw new Error('Solver did not converge to the required impedance residual (10⁻⁶ Ω).');
  return { value, design, result, residual, iterations: iterations + 1 };
}
export function sweep(type, p, parameter, low, high, count) {
  const allowed = [...(DIMENSIONS[type] || []), 'f', ...(type === 'coax' ? ['ratio'] : [])];
  if (!allowed.includes(parameter)) throw new Error('Unsupported sweep parameter.');
  positive(low, 'Sweep start'); positive(high, 'Sweep end');
  if (high <= low) throw new Error('Sweep end must exceed sweep start.');
  if (!Number.isInteger(count) || count < 2 || count > 501) throw new Error('Sweep samples must be an integer from 2 to 501.');
  return Array.from({ length: count }, (_, i) => {
    const x = low + (high - low) * i / (count - 1);
    try { return { x, result: analyze(type, withParameter(p, parameter, x)), error: null }; }
    catch (error) { return { x, result: null, error: error.message }; }
  });
}
