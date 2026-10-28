/** Pure SPICE text -> circuit model -> Yosys/netlistsvg JSON. No DOM or evaluation. */
import {parseElement,LTSPICE_PREFIXES} from './ltspice-elements.js';
export const SUPPORTED = LTSPICE_PREFIXES;
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

export function parsePrimitiveCir(source,options={}) {
  const diagnostics = [], directives = [], components = [], models = Object.assign(record(),options.models), nodes = record();
  const report = (severity, line, message) => diagnostics.push({severity, line, message});
  if (typeof source !== 'string') throw TypeError('Netlist must be a string.');
  if (source.length > 16000000) throw Error('Expanded netlist exceeds 16 MB.');
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
      else {
        const inherited=/^ako:(.+)$/i.exec(t[2]);
        const explicit=inherited&&t[3]&&!t[3].startsWith('(')?t[3].split('(')[0].toUpperCase():'';
        models[key(t[1])] = {name:t[1],type:inherited?explicit:t[2].split('(')[0].toUpperCase(),baseModel:inherited?.[1]||'',raw:statement.text};
      }
    }
  }
  const resolving=new Set();
  function modelType(name){const model=models[key(name)];if(!model)return '';if(model.type)return model.type;if(resolving.has(key(name)))throw Error('Circular AKO model inheritance: '+name);resolving.add(key(name));model.type=modelType(model.baseModel);resolving.delete(key(name));return model.type;}
  for(const model of Object.values(models))if(model.baseModel&&!model.type){try{modelType(model.name);}catch(error){report('error',0,error.message);}}
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
    if (head === '.subckt') { subDepth++; report('error', line, 'Use parseHierarchy() for subcircuit definitions.'); continue; }
    if (head === '.ends') { if (!subDepth) report('error', line, 'Unmatched .ends.'); else subDepth--; continue; }
    if (subDepth) continue;
    if (head === '.end') { ended = true; continue; }
    if (head.startsWith('.')) {
      directives.push({line, text});
      if (head === '.title') title = t.slice(1).join(' ');
      else if(['.protect','.unprotect','.prot','.unprot'].includes(head))report('error',line,'Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.');
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
    const minimum = kind === 'M' || kind === 'Q' ? 5 : 4;
    if (line === 1 && !/\d/.test(t[0]) && (t.length < minimum || (kind==='T'&&!/\b(?:zo|z0)\s*=/i.test(text)))) {
      title = text; report('info', line, 'SPICE title: ' + text); continue;
    }
    try {
      if (names.has(head)) throw Error('Duplicate component name (SPICE names are case insensitive).');
      const parsed=parseElement(t,models),{pins,nodeTokens,...element}=parsed;
      if(!parsed.polarityKnown)report('warning',line,`${t[0]}: model polarity unknown; explicit ${pins.join('/')} terminals retained.`);
      const terminals = record();
      pins.forEach((pin, i) => {
        const name = key(nodeTokens[i]);
        if (!nodes[name]) nodes[name] = {name, displayName: t[i + 1], bit: Object.keys(nodes).length + 2, terminals: []};
        nodes[name].terminals.push({component: t[0], pin}); terminals[pin] = name;
      });
      components.push({...element,name:t[0],terminals,line,raw:text});names.add(head);
    } catch (error) { report('error', line, `${t[0]}: ${error.message} Statement: ${text}`); }
  }
  if (subDepth) report('error', 0, 'Unclosed .subckt definition.');
  if (control) report('error', 0, 'Unclosed .control block.');
  if (!components.length) report('error', 0, 'No supported components to render.');
  if (components.length > 300) report('error', 0, 'Phase 1 supports up to 300 components per drawing.');
  for (const component of components) {
    for(const source of component.controlSources||[])if(!source.includes(':')&&!components.some(c=>key(c.name)===key(source)&&c.kind==='V'))report('error',component.line,`${component.name}: controlling voltage source ${source} was not found.`);
    for(const inductor of component.coupledInductors||[])if(!inductor.includes(':')&&!components.some(c=>key(c.name)===key(inductor)&&c.kind==='L'))report('error',component.line,`${component.name}: coupled inductor ${inductor} was not found.`);
    if (component.kind === 'B' || component.type === 'spice_b') report('info', component.line, `${component.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return {title, components, nodes, models, directives, diagnostics};
}

