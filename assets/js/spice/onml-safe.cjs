// Upstream onml 0.3 serializes user strings without XML escaping.
// Keep its parser/traverser, replacing only the serializer for this bundle.
const parse = require('onml/lib/parse.js');
const traverse = require('onml/lib/traverse.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]));
function stringify(node) {
  const [tag, ...rest] = node;
  const attrs = rest[0] && typeof rest[0] === 'object' && !Array.isArray(rest[0]) ? rest.shift() : {};
  const head = '<' + tag + Object.entries(attrs).map(([k,v]) => ' ' + k + '="' + escape(v) + '"').join('');
  return rest.length ? head + '>' + rest.map(n => Array.isArray(n) ? stringify(n) : escape(n)).join('') + '</' + tag + '>' : head + '/>';
}
module.exports = {parse, p:parse, traverse, t:traverse, stringify, s:stringify};
