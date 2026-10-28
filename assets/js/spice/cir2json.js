/** Pure SPICE text -> circuit model -> Yosys/netlistsvg JSON. No DOM or evaluation. */
export const SUPPORTED = 'R L C D Q M V I E G F H B';
const kinds = new Set(SUPPORTED.split(' '));
const record = () => Object.create(null);
const key = value => value.toLowerCase();

// Whitespace and inline comments only delimit outside expressions/quotes.
export function tokenize(line) {
  const tokens = [], stack = []; let token = '', depth = 0, quote = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) { token += c; if (c === quote && line[i - 1] !== '\\') quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; token += c; continue; }
    if (!depth && (c === ';' || (c === '$' && (!i || /\s/.test(line[i - 1]))))) break;
    if ('({'.includes(c)) { stack.push(c); depth++; }
    if (')}'.includes(c)) { depth--; if (stack.pop() !== (c === ')' ? '(' : '{')) throw Error('Unbalanced expression delimiters.'); }
    if (/\s/.test(c) && !depth) { if (token) tokens.push(token); token = ''; }
    else token += c;
  }
  if (depth || quote) throw Error('Unclosed expression or quoted string.');
  if (token) tokens.push(token);
  return tokens;
}

export function parseCir(source) {
  const diagnostics = [], directives = [], components = [], models = record(), nodes = record();
  const report = (severity, line, message) => diagnostics.push({severity, line, message});
  if (typeof source !== 'string') throw TypeError('Netlist must be a string.');
  if (source.length > 500000) throw Error('Netlist exceeds the Phase 1 limit of 500 kB.');
  const lines = [];
  source.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((raw, i) => {
    const text = raw.trim();
    if (!text || text.startsWith('*')) return;
    if (text.startsWith('+')) {
      if (!lines.length) report('error', i + 1, 'Continuation has no preceding statement.');
      else lines.at(-1).text += ' ' + text.slice(1).trim();
    } else lines.push({line: i + 1, text});
  });
  for (const statement of lines) {
    try { statement.tokens = tokenize(statement.text); }
    catch (error) { report('error', statement.line, error.message); statement.tokens = []; }
    const t = statement.tokens;
    if (/^\.model$/i.test(t[0] || '')) {
      if (t.length < 3) report('error', statement.line, '.model requires a name and device type.');
      else models[key(t[1])] = {name: t[1], type: t[2].split('(')[0].toUpperCase(), raw: statement.text};
    }
  }
  let title = '', subDepth = 0, control = false, ended = false;
  const names = new Set();
  const knownDirectives = new Set(['.title', '.model', '.param', '.func', '.tran', '.ac', '.dc', '.op', '.options', '.option', '.ic', '.nodeset', '.save', '.probe', '.print', '.plot', '.meas', '.measure', '.temp', '.step', '.global', '.backanno', '.width', '.four', '.noise', '.pz', '.tf', '.sens']);
  for (const {line, text, tokens: t} of lines) {
    if (!t.length) continue;
    const head = key(t[0]);
    if (ended) { report('warning', line, 'Statement after .end is not rendered: ' + text); continue; }
    if (head === '.control') { control = true; report('warning', line, '.control script retained but not executed or rendered.'); continue; }
    if (head === '.endc') { control = false; continue; }
    if (control) continue;
    if (head === '.subckt') { subDepth++; report('warning', line, 'Subcircuit definition is not expanded in Phase 1: ' + text); continue; }
    if (head === '.ends') { if (!subDepth) report('error', line, 'Unmatched .ends.'); else subDepth--; continue; }
    if (subDepth) continue;
    if (head === '.end') { ended = true; continue; }
    if (head.startsWith('.')) {
      directives.push({line, text});
      if (head === '.title') title = t.slice(1).join(' ');
      else if (['.if', '.elseif', '.else', '.endif', '.connect', '.alias'].includes(head)) report('error', line, 'Topology-changing directive is unsupported: ' + text);
      else if (!knownDirectives.has(head)) report('warning', line, 'Directive retained but not resolved: ' + text);
      continue;
    }
    const kind = t[0][0].toUpperCase();
    if (!kinds.has(kind)) {
      if (line === 1 && !/\d/.test(t[0]) && t.length > 1 && kind !== 'X') {
        title = text; report('warning', line, 'First line treated as a SPICE title; use .title for an unambiguous title.');
      } else report('warning', line, `Unsupported ${kind} device was not rendered: ${text}`);
      continue;
    }
    // Ordinary SPICE title lines often start with a supported letter.
    const minimum = kind === 'M' ? 7 : kind === 'Q' ? 5 : 4;
    if (line === 1 && !/\d/.test(t[0]) && t.length < minimum) {
      title = text; report('warning', line, 'First line treated as title: ' + text); continue;
    }
    try {
      if (names.has(head)) throw Error('Duplicate component name (SPICE names are case insensitive).');
      let pins, count, model = '', controlSource = '', type;
      if ('RLC'.includes(kind)) { pins = ['A', 'B']; type = kind.toLowerCase() + '_v'; }
      else if ('DVI'.includes(kind)) { pins = ['+', '-']; type = kind === 'D' ? 'd_v' : kind.toLowerCase(); }
      else if (kind === 'B') { pins = ['+', '-']; type = 'spice_b'; }
      else if (kind === 'Q') {
        pins = ['C', 'B', 'E'];
        if (models[key(t[5] || '')] || (t.length >= 6 && !models[key(t[4] || '')] && !/[=(){}]/.test(t[5]) && !/^[+\-\d.]/.test(t[5]))) pins.push('S');
        model = t[pins.length + 1];
        const polarity = models[key(model || '')]?.type;
        type = ['NPN', 'PNP'].includes(polarity) ? (pins.length === 3 ? 'q_' : 'spice_q4_') + polarity.toLowerCase() : 'spice_q' + pins.length;
        if (!['NPN', 'PNP'].includes(polarity)) report('warning', line, `${t[0]}: model polarity unknown; rendered with explicit C/B/E${pins.length === 4 ? '/S' : ''} pins.`);
      } else if (kind === 'M') {
        pins = ['D', 'G', 'S', 'B']; model = t[5];
        const polarity = models[key(model || '')]?.type;
        type = ['NMOS', 'PMOS'].includes(polarity) ? 'spice_' + polarity.toLowerCase() : 'spice_m';
        if (!['NMOS', 'PMOS'].includes(polarity)) report('warning', line, `${t[0]}: MOS model polarity unknown; rendered with explicit D/G/S/B pins.`);
      } else if ('EG'.includes(kind)) {
        if (/^(?:poly|laplace)/i.test(t[3] || '')) throw Error('POLY/LAPLACE controlled source syntax is unsupported.');
        if (/^(?:value|vol|cur|table|v\s*=|i\s*=)/i.test(t[3] || '')) { pins = ['+', '-']; type = 'spice_b'; }
        else { pins = ['+', '-', 'C+', 'C-']; type = 'spice_' + kind.toLowerCase(); }
      } else { pins = ['+', '-']; controlSource = t[3]; type = 'spice_' + kind.toLowerCase(); }
      count = pins.length;
      if (t.length < count + 2) throw Error(`Expected ${count} nodes and a value/model/expression.`);
      if (t.slice(1, count + 1).some(n => /[={}()]/.test(n))) throw Error('Invalid node token; check pin count or unsupported source syntax.');
      if ('FH'.includes(kind) && t.length < 5) throw Error('Current-controlled source requires a controlling voltage source and gain.');
      if (kind === 'B' && !/\b[VI]\s*=/i.test(t.slice(3).join(' '))) throw Error('Behavioral source requires V= or I= expression.');
      if (kind === 'D') model = t[3];
      const terminals = record();
      pins.forEach((pin, i) => {
        const name = key(t[i + 1]);
        if (!nodes[name]) nodes[name] = {name, displayName: t[i + 1], bit: Object.keys(nodes).length + 2, terminals: []};
        nodes[name].terminals.push({component: t[0], pin}); terminals[pin] = name;
      });
      const value = t.slice(count + 1).join(' ');
      components.push({name: t[0], kind, type, terminals, value, model, controlSource, line, raw: text}); names.add(head);
    } catch (error) { report('error', line, `${t[0]}: ${error.message} Statement: ${text}`); }
  }
  if (subDepth) report('error', 0, 'Unclosed .subckt definition.');
  if (control) report('error', 0, 'Unclosed .control block.');
  if (!components.length) report('error', 0, 'No supported components to render.');
  if (components.length > 300) report('error', 0, 'Phase 1 supports up to 300 components per drawing.');
  for (const component of components) {
    if (component.controlSource && !components.some(c => key(c.name) === key(component.controlSource) && c.kind === 'V')) report('error', component.line, `${component.name}: controlling voltage source ${component.controlSource} was not found.`);
    if (component.kind === 'B' || component.type === 'spice_b') report('info', component.line, `${component.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return {title, components, nodes, models, directives, diagnostics};
}

export function toNetlistsvg(circuit) {
  const cells = record(), netnames = record();
  for (const c of circuit.components) {
    const connections = record(), port_directions = record();
    for (const [pin, node] of Object.entries(c.terminals)) { connections[pin] = [circuit.nodes[node].bit]; port_directions[pin] = 'input'; }
    cells[c.name] = {type: c.type, port_directions, connections, parameters: {}, attributes: {ref: c.name, value: c.value, spice: c.raw}};
  }
  for (const n of Object.values(circuit.nodes)) netnames[n.name] = {hide_name: 0, bits: [n.bit], attributes: {}};
  // One ground reference, connected to the same real net as every node 0 pin.
  if (circuit.nodes['0']) {
    let ground = '__ground'; while (Object.hasOwn(cells, ground)) ground += '_';
    cells[ground] = {type: 'gnd', connections: {A: [circuit.nodes['0'].bit]}, port_directions: {A: 'input'}, attributes: {name: '0'}, parameters: {}};
  }
  return {modules: {circuit: {attributes: {top: 1}, ports: {}, cells, netnames}}};
}

export function cir2json(source) {
  const circuit = parseCir(source);
  if (circuit.diagnostics.some(d => d.severity === 'error')) {
    const error = Error('SPICE parsing failed. See error.diagnostics for line numbers.');
    error.diagnostics = circuit.diagnostics; throw error;
  }
  return {...toNetlistsvg(circuit), spice: {title: circuit.title, directives: circuit.directives, diagnostics: circuit.diagnostics}};
}
export default cir2json;
