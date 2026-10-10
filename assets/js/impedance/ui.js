import { analyze, synthesize, sweep, withParameter, MODEL_INFO, SYNTHESIS_PARAMETERS } from './engine.js';
import { diagram } from './diagrams.js';

const $ = id => document.getElementById('rf-' + id);
const root = $('tool');
const TYPES = {
  microstrip: { label: 'Microstrip', keys: ['w', 'h', 't'], defaults: { w: 1.5, h: 0.8, t: 0.035, er: 4.3, f: 2.4 } },
  cpw: { label: 'CPW', keys: ['w', 's', 'h'], defaults: { w: 1.5, s: 0.2, h: 0.8, er: 4.3, f: 2.4 } },
  gcpw: { label: 'Grounded CPW', keys: ['w', 's', 'h'], defaults: { w: 1, s: 0.2, h: 0.8, er: 4.3, f: 2.4 } },
  stripline: { label: 'Stripline', keys: ['w', 'b'], defaults: { w: 0.5, b: 1.6, er: 4.3, f: 2.4 } },
  coax: { label: 'Coax', keys: ['inner', 'outer'], defaults: { inner: 1, outer: 3.5, er: 2.1, f: 2.4 } },
  siw: { label: 'SIW', keys: ['a', 'd', 'pitch', 'h'], defaults: { a: 15, d: 0.8, pitch: 1.4, h: 0.8, er: 3.48, f: 10 } }
};
const PARAMETERS = {
  w: ['Line width W', 'mm'], s: ['Gap S', 'mm'], h: ['Substrate height h', 'mm'],
  t: ['Copper thickness t', 'mm'], b: ['Plane separation B', 'mm'],
  inner: ['Inner conductor diameter d', 'mm'], outer: ['Outer inside diameter D', 'mm'],
  a: ['Via-row center separation a', 'mm'], d: ['Via diameter d', 'mm'], pitch: ['Via pitch p', 'mm'],
  er: ['Relative permittivity εᵣ', ''], f: ['Frequency', 'GHz'], ratio: ['Diameter ratio D/d', '']
};
const METRICS = {
  z: { label: 'Characteristic impedance Z₀', unit: 'Ω', factor: 1 },
  waveZ: { label: 'TE₁₀ wave impedance (real)', unit: 'Ω', factor: 1 },
  eeff: { label: 'Effective permittivity ε_eff', unit: '', factor: 1 },
  beta: { label: 'Phase constant β', unit: 'rad/m', factor: 1 },
  decay: { label: 'Evanescent decay α', unit: 'Np/m', factor: 1 },
  wavelength: { label: 'Guided wavelength λg', unit: 'mm', factor: 1000 },
  velocity: { label: 'Phase velocity vₚ', unit: 'm/s', factor: 1 },
  phaseDelay: { label: 'Phase delay', unit: '°/mm', factor: 1 },
  fc: { label: 'TE₁₀ cutoff frequency', unit: 'GHz', factor: 1e-9 },
  aeff: { label: 'Equivalent width a_eff', unit: 'mm', factor: 1000 },
  bulkEr: { label: 'Bulk relative permittivity εᵣ', unit: '', factor: 1 },
  ratio: { label: 'Diameter ratio D/d', unit: '', factor: 1 }
};
const REFERENCES = {
  microstrip: [['Hammerstad–Jensen implementation and thickness correction (scikit-rf)', 'https://scikit-rf.readthedocs.io/en/latest/_modules/skrf/media/mline.html']],
  cpw: [['Ghione–Naldi finite-height conformal mapping (scikit-rf)', 'https://scikit-rf.readthedocs.io/en/latest/_modules/skrf/media/cpw.html']],
  stripline: [['Cohn centered thin-strip solution (Polar Instruments, IPC 1999)', 'https://www.polarinstruments.com/support/cits/IPC1999.pdf']],
  coax: [['Lossless coaxial-line TEM parameters (scikit-rf)', 'https://scikit-rf.readthedocs.io/en/latest/_modules/skrf/media/coaxial.html']],
  siw: [['SIW equivalent-width model (Xu & Wu, 2005)', 'https://doi.org/10.1109/TMTT.2004.839303'], ['SIW equivalent-guide review (Bozzi et al., 2011)', 'https://doi.org/10.1049/iet-map.2010.0463'], ['Rectangular-waveguide modes (scikit-rf)', 'https://scikit-rf.readthedocs.io/en/latest/_modules/skrf/media/rectangularWaveguide.html']]
};
REFERENCES.gcpw = REFERENCES.cpw;
const designs = Object.fromEntries(Object.entries(TYPES).map(([key, type]) => [key, { ...type.defaults }]));
let type = 'microstrip', mode = 'analysis', solution = null, result = null, activeDesign = null;
let sweepRows = [], chartData = null;

function numberText(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  return magnitude >= 1e6 || magnitude < 0.001 ? value.toExponential(3) : Number(value.toPrecision(5)).toLocaleString('en-US', { maximumFractionDigits: 6 });
}
function status(id, text, error = false) {
  $(id).textContent = text;
  $(id).dataset.error = String(error);
}
function toSI(key, value) { return key === 'f' ? value * 1e9 : key === 'er' || key === 'ratio' ? value : value * 1e-3; }
function fromSI(key, value) { return key === 'f' ? value * 1e-9 : key === 'er' || key === 'ratio' ? value : value * 1e3; }
function readNumber(id) { const value = $(id).value; return value.trim() === '' ? NaN : Number(value); }
function getDesign() {
  const values = designs[type], p = {};
  for (const key of [...TYPES[type].keys, 'er', 'f']) {
    const input = document.getElementById('rf-input-' + key);
    // A synthesized dimension is an output; only fixed inputs need a value.
    const solved = mode === 'synthesis' && $('solve-parameter').value === key;
    const numeric = solved ? TYPES[type].defaults[key] : input.value.trim() === '' ? NaN : Number(input.value);
    input.setAttribute('aria-invalid', String(!Number.isFinite(numeric) || (key === 't' ? numeric < 0 : numeric <= 0)));
    if (!Number.isFinite(numeric)) throw new Error(`${PARAMETERS[key][0]} requires a number.`);
    if (!solved) values[key] = numeric;
    p[key] = toSI(key, numeric);
  }
  return p;
}
function options(select, items) {
  select.replaceChildren(...items.map(([value, label]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label; return option;
  }));
}
function makeFields() {
  $('fields').replaceChildren(...[...TYPES[type].keys, 'er', 'f'].map(key => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label'); label.htmlFor = 'rf-input-' + key;
    label.append(document.createTextNode(PARAMETERS[key][0]));
    const unit = document.createElement('span'); unit.textContent = ' ' + PARAMETERS[key][1]; label.append(unit);
    const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'number'; input.step = 'any'; input.min = key === 't' ? '0' : '0.000001';
    if (key === 'er') { input.min = '1'; input.max = '128'; }
    input.value = designs[type][key]; input.dataset.parameter = key;
    wrapper.append(label, input); return wrapper;
  }));
}
function currentParameterValue(parameter, p = activeDesign) {
  if (!p) return designs[type][parameter] || 1;
  return parameter === 'ratio' ? p.outer / p.inner : fromSI(parameter, p[parameter]);
}
function solveDefaults() {
  const key = $('solve-parameter').value;
  $('solve-low').value = key === 'ratio' ? 1.01 : key === 's' ? 0.001 : 0.01;
  $('solve-high').value = key === 'ratio' ? 20 : 10;
  root.querySelectorAll('.rf-solve-unit').forEach(node => { node.textContent = PARAMETERS[key]?.[1] || 'ratio'; });
  lockSolvedField();
}
function lockSolvedField() {
  root.querySelectorAll('[data-parameter]').forEach(input => {
    input.disabled = mode === 'synthesis' && (input.dataset.parameter === $('solve-parameter').value || (type === 'coax' && input.dataset.parameter === 'outer'));
  });
}
function sweepDefaults() {
  const key = $('sweep-parameter').value, value = currentParameterValue(key);
  $('sweep-low').value = Number((key === 'ratio' ? Math.max(1.01, value * 0.5) : value * 0.5).toPrecision(5));
  $('sweep-high').value = Number((value * 1.5).toPrecision(5));
  root.querySelectorAll('.rf-sweep-unit').forEach(node => { node.textContent = PARAMETERS[key][1] || 'ratio'; });
}
function selectType(key) {
  type = key; mode = 'analysis'; activeDesign = null;
  root.querySelectorAll('[data-line]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.line === type)));
  $('line-title').textContent = TYPES[type].label + ' cross section';
  $('cross-section').innerHTML = diagram(type);
  $('model-name').textContent = MODEL_INFO[type].name;
  $('model-note').textContent = MODEL_INFO[type].note;
  $('model-links').replaceChildren(...REFERENCES[type].map(([label, href]) => {
    const li = document.createElement('li'), a = document.createElement('a'); a.href = href; a.textContent = label; li.append(a); return li;
  }));
  $('input-note').textContent = ['cpw', 'gcpw', 'stripline'].includes(type) ? 'Thin-conductor model (t = 0); finite copper thickness is not corrected.' : type === 'siw' ? 'a and p are center-to-center dimensions. SIW synthesis is disabled: TE wave impedance is not a 50 Ω port impedance.' : type === 'coax' ? 'D is measured on the inside of the outer conductor.' : 'Use t = 0 for an infinitesimally thin strip.';
  makeFields();
  options($('solve-parameter'), SYNTHESIS_PARAMETERS[type].map(key => [key, PARAMETERS[key][0]]));
  const sweepKeys = type === 'siw' ? ['f', 'a', 'd', 'pitch', 'h'] : [...TYPES[type].keys.filter(key => key !== 't'), ...(type === 'coax' ? ['ratio'] : []), 'f'];
  options($('sweep-parameter'), sweepKeys.map(key => [key, PARAMETERS[key][0]]));
  const metrics = type === 'siw' ? ['waveZ', 'fc', 'beta', 'decay', 'wavelength', 'aeff'] : ['z', 'eeff', 'beta', 'wavelength'];
  options($('sweep-metric'), metrics.map(key => [key, METRICS[key].label]));
  $('synthesis').disabled = type === 'siw';
  setMode('analysis');
  if (type !== 'siw') solveDefaults();
  sweepDefaults(); updateSweep();
}
function setMode(next) {
  mode = next;
  $('analysis').setAttribute('aria-pressed', String(mode === 'analysis'));
  $('synthesis').setAttribute('aria-pressed', String(mode === 'synthesis'));
  $('synthesis-controls').hidden = mode !== 'synthesis';
  lockSolvedField(); calculate();
}
function calculate() {
  solution = result = activeDesign = null;
  $('results').replaceChildren(); $('warnings').replaceChildren();
  $('apply').disabled = $('copy').disabled = true; $('copy-status').textContent = '';
  try {
    let p = getDesign();
    if (mode === 'synthesis') {
      const parameter = $('solve-parameter').value;
      solution = synthesize(type, p, parameter, readNumber('target'), toSI(parameter, readNumber('solve-low')), toSI(parameter, readNumber('solve-high')));
      p = solution.design;
      const unit = PARAMETERS[parameter][1];
      status('solve-status', `${PARAMETERS[parameter][0]} = ${numberText(fromSI(parameter, solution.value))} ${unit}. Residual ${solution.residual.toExponential(2)} Ω; ${solution.iterations} bisection steps. Brackets searched at 257 log-spaced points.`);
      $('apply').disabled = false;
    }
    result = analyze(type, p); activeDesign = p;
    const label = type === 'siw' ? result.state === 'evanescent' ? 'TE₁₀ · evanescent below cutoff' : result.state === 'cutoff' ? 'TE₁₀ · at cutoff' : 'TE₁₀ · propagating' : mode === 'synthesis' ? 'Synthesized design' : 'Analysis · updates as you type';
    status('status', label);
    const metrics = type === 'siw' ? ['waveZ', 'bulkEr', 'fc', 'aeff', 'beta', 'wavelength', 'velocity', 'phaseDelay'] : ['z', 'eeff', 'beta', 'wavelength', 'velocity', 'phaseDelay', ...(type === 'coax' && !solution ? ['ratio'] : [])];
    const outputs = metrics.map(key => {
      let value = numberText(result[key] === null ? null : result[key] * METRICS[key].factor);
      if (key === 'waveZ' && result.state === 'evanescent') value = 'j ' + numberText(result.waveZImag);
      if (key === 'waveZ' && result.state === 'cutoff') value = 'Diverges at cutoff';
      return { key, value, label: key === 'waveZ' ? 'TE₁₀ wave impedance E/H' : METRICS[key].label, unit: METRICS[key].unit };
    });
    if (type === 'siw' && result.state === 'evanescent') outputs.push({ key: 'decay', value: numberText(result.decay), ...METRICS.decay });
    if (solution) outputs.unshift({ key: 'dimension', label: PARAMETERS[$('solve-parameter').value][0], value: numberText(fromSI($('solve-parameter').value, solution.value)), unit: PARAMETERS[$('solve-parameter').value][1] });
    $('results').replaceChildren(...outputs.map(({ label, value, unit }) => {
      const div = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'), small = document.createElement('small');
      dt.textContent = label; dd.textContent = value + ' '; small.textContent = unit; dd.append(small); div.append(dt, dd); return div;
    }));
    const notes = [...result.warnings];
    if (type === 'siw') {
      notes.unshift('TE E/H wave impedance is not a unique transmission-line port Z₀. Do not use it alone for a 50 Ω matching design.');
      if (result.state === 'evanescent') notes.push('No real propagation wavelength or phase velocity below cutoff. α is modal decay, not conductor/dielectric attenuation. Phasor convention: eʲωᵗ, forward dependence e⁻ᵞᶻ.');
      if (result.state === 'cutoff') notes.push('At cutoff β = 0; real guided wavelength, phase velocity, and TE wave impedance diverge and are not exported as finite values.');
      if (result.state === 'propagating') notes.push('TE phase velocity can exceed c; it is not signal or energy velocity.');
    }
    $('warnings').replaceChildren(...notes.map(note => { const p = document.createElement('p'); p.className = 'rf-help'; p.textContent = note; return p; }));
    $('copy').disabled = false;
  } catch (error) {
    status('status', error.message, true);
    if (mode === 'synthesis') status('solve-status', error.message, true);
  }
  updateSweep();
}
function metricValue(row, metric) {
  const value = row?.result?.[metric];
  return typeof value === 'number' && Number.isFinite(value) ? value * METRICS[metric].factor : null;
}
function updateSweep() {
  $('csv').disabled = true; sweepRows = []; chartData = null; $('chart').replaceChildren();
  $('chart').setAttribute('aria-label', 'No parameter sweep data');
  $('chart-readout').textContent = 'No sweep data.';
  if (!activeDesign) { status('sweep-status', 'Enter a valid design to generate a sweep.'); return; }
  try {
    const parameter = $('sweep-parameter').value;
    sweepRows = sweep(type, activeDesign, parameter, toSI(parameter, readNumber('sweep-low')), toSI(parameter, readNumber('sweep-high')), readNumber('sweep-count'));
    const invalid = sweepRows.filter(row => row.error).length;
    const metric = $('sweep-metric').value;
    const missing = sweepRows.filter(row => !row.error && metricValue(row, metric) === null).length;
    status('sweep-status', `${sweepRows.length} samples · ${invalid} invalid geometries${missing ? ` · ${missing} non-propagating/cutoff points omitted from this curve` : ''}. Gaps are preserved; CSV includes state, model warnings, and errors.`);
    $('csv').disabled = false;
    drawChart(parameter, metric);
  } catch (error) { status('sweep-status', error.message, true); $('chart-readout').textContent = 'No sweep data.'; }
}
function svgNode(name, attributes = {}, text = '') {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text) node.textContent = text; return node;
}
function drawChart(parameter, metric) {
  const chart = $('chart'), left = 78, right = 614, top = 20, bottom = 219;
  chart.replaceChildren();
  const points = sweepRows.map(row => ({ x: fromSI(parameter, row.x), y: metricValue(row, metric), row }));
  const valid = points.filter(point => point.y !== null);
  if (!valid.length) { status('chart-readout', 'No finite values for this quantity in the sweep range.'); return; }
  const xmin = points[0].x, xmax = points.at(-1).x;
  const min = Math.min(...valid.map(point => point.y)), max = Math.max(...valid.map(point => point.y));
  const pad = max === min ? Math.max(Math.abs(min) * 0.05, 0.01) : (max - min) * 0.08;
  const ymin = Math.max(0, min - pad), ymax = max + pad;
  const sx = x => left + (x - xmin) / (xmax - xmin) * (right - left);
  const sy = y => bottom - (y - ymin) / (ymax - ymin) * (bottom - top);
  chart.setAttribute('aria-label', `${METRICS[metric].label} versus ${PARAMETERS[parameter][0]}. Use left and right arrow keys to inspect ${points.length} samples.`);
  chart.setAttribute('tabindex', '0');
  chart.append(svgNode('title', {}, chart.getAttribute('aria-label')));
  for (let i = 0; i <= 4; i++) {
    const x = xmin + (xmax - xmin) * i / 4, y = ymin + (ymax - ymin) * i / 4;
    chart.append(svgNode('line', { x1: left, y1: sy(y), x2: right, y2: sy(y), class: 'rf-chart-grid' }));
    chart.append(svgNode('text', { x: left - 8, y: sy(y) + 4, 'text-anchor': 'end', class: 'rf-chart-label' }, numberText(y)));
    chart.append(svgNode('text', { x: sx(x), y: bottom + 18, 'text-anchor': 'middle', class: 'rf-chart-label' }, numberText(x)));
  }
  chart.append(svgNode('path', { d: `M${left} ${top}V${bottom}H${right}`, class: 'rf-chart-axis' }));
  chart.append(svgNode('text', { x: (left + right) / 2, y: 265, 'text-anchor': 'middle', class: 'rf-chart-label' }, PARAMETERS[parameter][0] + (PARAMETERS[parameter][1] ? ` (${PARAMETERS[parameter][1]})` : '')));
  chart.append(svgNode('text', { x: left, y: 11, class: 'rf-chart-label' }, METRICS[metric].label + (METRICS[metric].unit ? ` (${METRICS[metric].unit})` : '')));
  let path = '', gap = true;
  points.forEach(point => { if (point.y === null) { gap = true; return; } path += `${gap ? 'M' : 'L'}${sx(point.x).toFixed(2)} ${sy(point.y).toFixed(2)} `; gap = false; });
  chart.append(svgNode('path', { d: path, class: 'rf-chart-line' }));
  const designX = currentParameterValue(parameter), designY = metricValue({ result }, metric);
  if (designX >= xmin && designX <= xmax && designY !== null && designY >= ymin && designY <= ymax) {
    chart.append(svgNode('line', { x1: sx(designX), x2: sx(designX), y1: top, y2: bottom, class: 'rf-chart-design' }));
    const dot = svgNode('circle', { cx: sx(designX), cy: sy(designY), r: 4, class: 'rf-chart-dot' });
    dot.append(svgNode('title', {}, 'Current design')); chart.append(dot);
  }
  const hover = svgNode('line', { x1: left, x2: left, y1: top, y2: bottom, class: 'rf-chart-hover', visibility: 'hidden' });
  chart.append(hover);
  chartData = { points, sx, sy, xmin, xmax, left, right, hover, parameter, metric, index: 0 };
  status('chart-readout', `Current design: ${numberText(designX)} ${PARAMETERS[parameter][1]} → ${numberText(designY)} ${METRICS[metric].unit}. Hover or focus the plot and use ← / → to inspect samples.`);
}
function inspect(index) {
  if (!chartData) return;
  const data = chartData; data.index = Math.max(0, Math.min(data.points.length - 1, index));
  const point = data.points[data.index];
  data.hover.setAttribute('x1', data.sx(point.x)); data.hover.setAttribute('x2', data.sx(point.x)); data.hover.setAttribute('visibility', 'visible');
  status('chart-readout', `${PARAMETERS[data.parameter][0]}: ${numberText(point.x)} ${PARAMETERS[data.parameter][1]} · ${point.row.error || (point.y === null ? `${point.row.result.state}: no finite ${METRICS[data.metric].label}` : `${METRICS[data.metric].label}: ${numberText(point.y)} ${METRICS[data.metric].unit} · ${point.row.result.state}`)}`);
}
function downloadText(text, name, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value) { return '"' + String(value ?? '').replaceAll('"', '""') + '"'; }
function exportCSV() {
  if (!sweepRows.length || !activeDesign) return;
  const parameter = $('sweep-parameter').value;
  const keys = type === 'siw' ? ['waveZ', 'fc', 'aeff', 'bulkEr', 'beta', 'decay', 'wavelength', 'velocity', 'phaseDelay'] : ['z', 'eeff', 'beta', 'wavelength', 'velocity', 'phaseDelay'];
  const geometryKeys = [...TYPES[type].keys, 'er', 'f'];
  const header = ['line', 'model', `sweep_${parameter}_${PARAMETERS[parameter][1] || 'ratio'}`, ...geometryKeys.map(key => `${key}_${PARAMETERS[key][1] || 'relative'}`), 'state', ...keys.map(key => `${key}_${METRICS[key].unit || 'relative'}`), ...(type === 'siw' ? ['waveZ_imag_ohm'] : []), 'warnings', 'error'];
  const rows = sweepRows.map(row => {
    const p = withParameter(activeDesign, parameter, row.x);
    return [type, MODEL_INFO[type].name, fromSI(parameter, row.x), ...geometryKeys.map(key => fromSI(key, p[key])), row.result?.state, ...keys.map(key => metricValue(row, key)), ...(type === 'siw' ? [row.result?.waveZImag] : []), row.result?.warnings.join(' | '), row.error];
  });
  downloadText([header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'), `${type}-${parameter}-sweep.csv`, 'text/csv;charset=utf-8');
}

if (root) {
  $('selector').replaceChildren(...Object.entries(TYPES).map(([key, info]) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.line = key; button.setAttribute('aria-pressed', 'false');
    button.innerHTML = diagram(key, true); const text = document.createElement('span'); text.textContent = info.label; button.append(text);
    button.addEventListener('click', () => selectType(key)); return button;
  }));
  $('fields').addEventListener('input', calculate);
  $('analysis').addEventListener('click', () => setMode('analysis'));
  $('synthesis').addEventListener('click', () => { if (type !== 'siw') setMode('synthesis'); });
  $('solve-parameter').addEventListener('change', () => { solveDefaults(); calculate(); });
  ['target', 'solve-low', 'solve-high'].forEach(id => $(id).addEventListener('input', calculate));
  $('apply').addEventListener('click', () => {
    if (!solution) return;
    for (const key of TYPES[type].keys) designs[type][key] = fromSI(key, solution.design[key]);
    makeFields(); setMode('analysis'); sweepDefaults(); updateSweep();
  });
  $('reset').addEventListener('click', () => { designs[type] = { ...TYPES[type].defaults }; selectType(type); });
  $('sweep-parameter').addEventListener('change', () => { sweepDefaults(); updateSweep(); });
  $('sweep-metric').addEventListener('change', updateSweep);
  ['sweep-low', 'sweep-high', 'sweep-count'].forEach(id => $(id).addEventListener('input', updateSweep));
  $('chart').addEventListener('pointermove', event => {
    if (!chartData) return;
    const rect = $('chart').getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width * 640;
    inspect(Math.round((x - chartData.left) / (chartData.right - chartData.left) * (chartData.points.length - 1)));
  });
  $('chart').addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && chartData) {
      event.preventDefault(); inspect(event.key === 'Home' ? 0 : event.key === 'End' ? chartData.points.length - 1 : chartData.index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  $('csv').addEventListener('click', exportCSV);
  $('copy').addEventListener('click', async () => {
    if (!result || !activeDesign) return;
    const inputs = [...TYPES[type].keys, 'er', 'f'].map(key => `${PARAMETERS[key][0]}: ${numberText(fromSI(key, activeDesign[key]))} ${PARAMETERS[key][1]}`);
    const values = [...$('results').children].map(div => `${div.querySelector('dt').textContent}: ${div.querySelector('dd').textContent}`);
    const text = [TYPES[type].label, MODEL_INFO[type].name, ...inputs, ...values, MODEL_INFO[type].note, 'Losses not calculated. Material permittivity is frequency independent.', ...result.warnings].join('\n');
    try { await navigator.clipboard.writeText(text); status('copy-status', 'Results copied.'); }
    catch (_) { downloadText(text, `${type}-results.txt`, 'text/plain;charset=utf-8'); status('copy-status', 'Clipboard unavailable; downloaded results as text.'); }
  });
  selectType(type);
}
