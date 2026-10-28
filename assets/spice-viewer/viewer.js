const de = "R L C D Q M V I E G F H B", ue = new Set(de.split(" ")), Z = () => /* @__PURE__ */ Object.create(null), V = (t) => t.toLowerCase();
function se(t) {
  const s = [], i = [];
  let a = "", o = 0, n = "";
  for (let e = 0; e < t.length; e++) {
    const l = t[e];
    if (n) {
      a += l, l === n && t[e - 1] !== "\\" && (n = "");
      continue;
    }
    if (l === '"' || l === "'") {
      n = l, a += l;
      continue;
    }
    if (!o && (l === ";" || l === "$" && (!e || /\s/.test(t[e - 1])))) break;
    if ("({".includes(l) && (i.push(l), o++), ")}".includes(l) && (o--, i.pop() !== (l === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(l) && !o ? (a && s.push(a), a = "") : a += l;
  }
  if (o || n) throw Error("Unclosed expression or quoted string.");
  return a && s.push(a), s;
}
function fe(t) {
  const s = [], i = [], a = [], o = Z(), n = Z(), e = (m, r, u) => s.push({ severity: m, line: r, message: u });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 5e5) throw Error("Netlist exceeds the Phase 1 limit of 500 kB.");
  const l = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, r) => {
    const u = m.trim();
    !u || u.startsWith("*") || (u.startsWith("+") ? l.length ? l.at(-1).text += " " + u.slice(1).trim() : e("error", r + 1, "Continuation has no preceding statement.") : l.push({ line: r + 1, text: u }));
  });
  for (const m of l) {
    try {
      m.tokens = se(m.text);
    } catch (u) {
      e("error", m.line, u.message), m.tokens = [];
    }
    const r = m.tokens;
    /^\.model$/i.test(r[0] || "") && (r.length < 3 ? e("error", m.line, ".model requires a name and device type.") : o[V(r[1])] = { name: r[1], type: r[2].split("(")[0].toUpperCase(), raw: m.text });
  }
  let E = "", d = 0, y = !1, x = !1;
  const v = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: m, text: r, tokens: u } of l) {
    if (!u.length) continue;
    const g = V(u[0]);
    if (x) {
      e("warning", m, "Statement after .end is not rendered: " + r);
      continue;
    }
    if (g === ".control") {
      y = !0, e("warning", m, ".control script retained but not executed or rendered.");
      continue;
    }
    if (g === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (g === ".subckt") {
      d++, e("warning", m, "Subcircuit definition is not expanded in Phase 1: " + r);
      continue;
    }
    if (g === ".ends") {
      d ? d-- : e("error", m, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (g === ".end") {
      x = !0;
      continue;
    }
    if (g.startsWith(".")) {
      i.push({ line: m, text: r }), g === ".title" ? E = u.slice(1).join(" ") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(g) ? e("error", m, "Topology-changing directive is unsupported: " + r) : N.has(g) || e("warning", m, "Directive retained but not resolved: " + r);
      continue;
    }
    const k = u[0][0].toUpperCase();
    if (!ue.has(k)) {
      m === 1 && !/\d/.test(u[0]) && u.length > 1 && k !== "X" ? (E = r, e("warning", m, "First line treated as a SPICE title; use .title for an unambiguous title.")) : e("warning", m, `Unsupported ${k} device was not rendered: ${r}`);
      continue;
    }
    const I = k === "M" ? 7 : k === "Q" ? 5 : 4;
    if (m === 1 && !/\d/.test(u[0]) && u.length < I) {
      E = r, e("warning", m, "First line treated as title: " + r);
      continue;
    }
    try {
      if (v.has(g)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      let f, b, p = "", L = "", $;
      if ("RLC".includes(k))
        f = ["A", "B"], $ = k.toLowerCase() + "_v";
      else if ("DVI".includes(k))
        f = ["+", "-"], $ = k === "D" ? "d_v" : k.toLowerCase();
      else if (k === "B")
        f = ["+", "-"], $ = "spice_b";
      else if (k === "Q") {
        f = ["C", "B", "E"], (o[V(u[5] || "")] || u.length >= 6 && !o[V(u[4] || "")] && !/[=(){}]/.test(u[5]) && !/^[+\-\d.]/.test(u[5])) && f.push("S"), p = u[f.length + 1];
        const D = o[V(p || "")]?.type;
        $ = ["NPN", "PNP"].includes(D) ? (f.length === 3 ? "q_" : "spice_q4_") + D.toLowerCase() : "spice_q" + f.length, ["NPN", "PNP"].includes(D) || e("warning", m, `${u[0]}: model polarity unknown; rendered with explicit C/B/E${f.length === 4 ? "/S" : ""} pins.`);
      } else if (k === "M") {
        f = ["D", "G", "S", "B"], p = u[5];
        const D = o[V(p || "")]?.type;
        $ = ["NMOS", "PMOS"].includes(D) ? "spice_" + D.toLowerCase() : "spice_m", ["NMOS", "PMOS"].includes(D) || e("warning", m, `${u[0]}: MOS model polarity unknown; rendered with explicit D/G/S/B pins.`);
      } else if ("EG".includes(k)) {
        if (/^(?:poly|laplace)/i.test(u[3] || "")) throw Error("POLY/LAPLACE controlled source syntax is unsupported.");
        /^(?:value|vol|cur|table|v\s*=|i\s*=)/i.test(u[3] || "") ? (f = ["+", "-"], $ = "spice_b") : (f = ["+", "-", "C+", "C-"], $ = "spice_" + k.toLowerCase());
      } else
        f = ["+", "-"], L = u[3], $ = "spice_" + k.toLowerCase();
      if (b = f.length, u.length < b + 2) throw Error(`Expected ${b} nodes and a value/model/expression.`);
      if (u.slice(1, b + 1).some((D) => /[={}()]/.test(D))) throw Error("Invalid node token; check pin count or unsupported source syntax.");
      if ("FH".includes(k) && u.length < 5) throw Error("Current-controlled source requires a controlling voltage source and gain.");
      if (k === "B" && !/\b[VI]\s*=/i.test(u.slice(3).join(" "))) throw Error("Behavioral source requires V= or I= expression.");
      k === "D" && (p = u[3]);
      const M = Z();
      f.forEach((D, Q) => {
        const R = V(u[Q + 1]);
        n[R] || (n[R] = { name: R, displayName: u[Q + 1], bit: Object.keys(n).length + 2, terminals: [] }), n[R].terminals.push({ component: u[0], pin: D }), M[D] = R;
      });
      const _ = u.slice(b + 1).join(" ");
      a.push({ name: u[0], kind: k, type: $, terminals: M, value: _, model: p, controlSource: L, line: m, raw: r }), v.add(g);
    } catch (f) {
      e("error", m, `${u[0]}: ${f.message} Statement: ${r}`);
    }
  }
  d && e("error", 0, "Unclosed .subckt definition."), y && e("error", 0, "Unclosed .control block."), a.length || e("error", 0, "No supported components to render."), a.length > 300 && e("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const m of a)
    m.controlSource && !a.some((r) => V(r.name) === V(m.controlSource) && r.kind === "V") && e("error", m.line, `${m.name}: controlling voltage source ${m.controlSource} was not found.`), (m.kind === "B" || m.type === "spice_b") && e("info", m.line, `${m.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  return { title: E, components: a, nodes: n, models: o, directives: i, diagnostics: s };
}
const G = () => /* @__PURE__ */ Object.create(null), U = (t) => t.toLowerCase();
function ae(t) {
  const s = G();
  for (let i = 0; i < t.length; i++) {
    const a = t[i];
    if (/^params?:$/i.test(a)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(a);
    if (!o) throw Error("Expected named parameter assignment, got: " + a);
    const n = U(o[1]);
    let e = o[2];
    if (e === void 0) {
      const l = /^=([\s\S]*)$/.exec(t[++i] || "");
      if (!l) throw Error("Expected = after parameter " + n);
      e = l[1];
    }
    if (e || (e = t[++i]), !e || /^params?:$/i.test(e)) throw Error("Missing value for parameter " + n);
    if (Object.hasOwn(s, n)) throw Error("Duplicate parameter: " + n);
    s[n] = e;
  }
  return s;
}
function ne(t) {
  const s = t.findIndex((i, a) => /^params?:$/i.test(i) || i.includes("=") || t[a + 1] === "=");
  return s < 0 ? [t, G()] : [t.slice(0, s), ae(t.slice(s))];
}
function pe(t) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 5e5) throw Error("Netlist exceeds the limit of 500 kB.");
  const s = [], i = G(), a = /* @__PURE__ */ new Set(["0"]), o = (r, u, g) => s.push({ severity: r, line: u, message: g }), n = (r, u, g, k = [], I = G(), f = 0) => {
    const b = { id: r, name: u, parent: g, ports: k, defaults: I, parameters: G(), definitions: G(), devices: [], instances: [], directives: [], line: f, statements: [] };
    return i[r] = b, b;
  }, e = n("root", "Top", null), l = [e], E = [];
  let d = !1, y = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((r, u) => {
    const g = r.trim();
    !g || g.startsWith("*") || (g.startsWith("+") ? E.length ? E.at(-1).text += " " + g.slice(1).trim() : o("error", u + 1, "Continuation has no preceding statement.") : E.push({ text: g, line: u + 1 }));
  });
  for (const { text: r, line: u } of E)
    try {
      const g = se(r);
      if (!g.length) continue;
      const k = U(g[0]), I = l.at(-1);
      if (y) {
        o("warning", u, "Statement after .end is not rendered: " + r);
        continue;
      }
      if (k === ".control") {
        d = !0, o("warning", u, ".control script retained but not executed or rendered.");
        continue;
      }
      if (k === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (k === ".subckt") {
        if (g.length < 2) throw Error(".SUBCKT requires a name.");
        const [f, b] = ne(g.slice(2)), p = U(g[1]);
        if (Object.hasOwn(I.definitions, p)) throw Error("Duplicate subcircuit definition: " + g[1]);
        const L = f.map(U);
        if (new Set(L).size !== f.length || L.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (f.some((M) => /[{}()=]/.test(M))) throw Error("Invalid formal port.");
        if (l.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const $ = I.id + "/" + encodeURIComponent(p);
        I.definitions[p] = $, l.push(n($, g[1], I.id, f, b, u));
        continue;
      }
      if (k === ".ends") {
        if (l.length === 1) throw Error("Unmatched .ENDS.");
        if (g[1] && U(g[1]) !== U(I.name)) throw Error(".ENDS name does not match " + I.name);
        l.pop();
        continue;
      }
      if (k === ".end") {
        if (l.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        y = !0;
        continue;
      }
      if (k === ".param") {
        const f = ae(g.slice(1));
        for (const [b, p] of Object.entries(f)) {
          if (Object.hasOwn(I.parameters, b)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + b);
          I.parameters[b] = p;
        }
      }
      if (k === ".global") {
        if (g.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const f of g.slice(1)) a.add(U(f));
      }
      if (k.startsWith(".") && I.directives.push({ line: u, text: r }), k.startsWith("x")) {
        const [f, b] = ne(g.slice(1));
        if (!f.length) throw Error("X instance requires a subcircuit name.");
        I.instances.push({ name: g[0], nodes: f.slice(0, -1).map(U), definitionName: f.at(-1), definitionId: null, parameters: b, line: u, raw: r });
      } else I.statements.push({ line: u, text: r });
    } catch (g) {
      o("error", u, g.message + " Statement: " + r);
    }
  l.length > 1 && o("error", l.at(-1).line, "Unclosed .SUBCKT " + l.at(-1).name), d && o("error", 0, "Unclosed .control block.");
  function x(r, u) {
    for (; r; ) {
      if (Object.hasOwn(r.definitions, U(u))) return r.definitions[U(u)];
      r = i[r.parent];
    }
    return null;
  }
  for (const r of Object.values(i)) {
    const u = [];
    let g = r;
    for (; g; )
      u.unshift(g), g = i[g.parent];
    const k = u.flatMap((p) => p.statements.filter((L) => /^\.model\b/i.test(L.text))), I = [...r.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...r.statements, ...k], f = fe(I.map((p) => p.text).join(`
`));
    r.devices = f.components.map((p) => ({ ...p, line: I[p.line - 1]?.line || r.line })), r.models = f.models, r === e && (e.title = f.title), s.push(...f.diagnostics.filter((p) => !p.message.includes("No supported components to render.") && !p.message.includes("300 components")).map((p) => ({ ...p, line: I[p.line - 1]?.line || r.line })));
    const b = new Set(r.devices.map((p) => U(p.name)));
    for (const p of r.instances)
      if (b.has(U(p.name)) && o("error", p.line, "Duplicate instance/device name: " + p.name), b.add(U(p.name)), p.definitionId = x(r, p.definitionName), !p.definitionId) o("error", p.line, "Undefined subcircuit: " + p.definitionName + " in " + p.name);
      else {
        const L = i[p.definitionId];
        L.ports.length !== p.nodes.length && o("error", p.line, `${p.name}: ${L.name} expects ${L.ports.length} ports; got ${p.nodes.length}.`);
        for (const $ of Object.keys(p.parameters)) !Object.hasOwn(L.defaults, $) && !Object.hasOwn(L.parameters, $) && o("error", p.line, `${p.name}: undeclared subcircuit parameter ${$}.`);
      }
  }
  for (const r of Object.values(i)) delete r.statements;
  const v = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function m(r, u = []) {
    if (v.has(r)) {
      o("error", i[r].line, "Circular subcircuit reference: " + [...u, i[r].name].join(" → "));
      return;
    }
    if (!N.has(r)) {
      if (v.add(r), u.length >= 64) {
        o("error", i[r].line, "Subcircuit dependency nesting exceeds 64 levels."), v.delete(r), N.add(r);
        return;
      }
      for (const g of i[r].instances) g.definitionId && m(g.definitionId, [...u, i[r].name]);
      v.delete(r), N.add(r);
    }
  }
  for (const r of Object.keys(i)) m(r);
  return !e.devices.length && !e.instances.length && o("error", 0, "No supported components or instances to render."), { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: e.title || "", scopes: i, globals: [...a], diagnostics: s };
}
const P = () => /* @__PURE__ */ Object.create(null), H = (t, s) => [...t, s].map((i) => encodeURIComponent(i)).join("/"), te = (t, s) => H(t.map((i) => i.toLowerCase()), s.toLowerCase());
function me(t, s = []) {
  const i = P(), a = (o) => i[o] || (i[o] = { name: o, displayName: o, bit: Object.keys(i).length + 2, terminals: [] });
  for (const o of t) for (const [n, e] of Object.entries(o.terminals)) a(e).terminals.push({ component: o.name, pin: n });
  for (const o of s) a(o);
  return i;
}
function he(t) {
  if (t.diagnostics.some((s) => s.severity === "error")) {
    const s = Error("Fix the parser errors below before generating.");
    throw s.diagnostics = t.diagnostics, s;
  }
}
const oe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, ge = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function J(t, s, i = (o) => o, a = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (e) => (o.push(e), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b([vi])\s*\(([^()]*)\)/gi, (e, l, E) => {
    const d = E.split(",").map((x) => x.trim());
    if (d.some((x) => !x || /[\s{}+*()]/.test(x))) throw Error("Unsupported dynamic voltage/current reference: " + e);
    const y = l.toUpperCase() + "(" + d.map(l.toLowerCase() === "v" ? i : a).join(",") + ")";
    return o.push(y), "@@" + (o.length - 1) + "@@";
  });
  let n = t.length;
  return t = t.replace(ge, (e, l, E) => {
    if (E.slice(l + e.length).trimStart().startsWith("(")) return e;
    const d = s(e.toLowerCase());
    if (d === void 0) return e;
    if (n += d.length + 2, n > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (e, l) => o[Number(l)]);
}
function be(t, s, i, a) {
  const o = { ...s, ...i }, n = P(), e = /* @__PURE__ */ new Set(), l = P();
  for (const [d, y] of Object.entries(a)) l[d] = J(oe(y), (x) => t[x]);
  function E(d) {
    if (Object.hasOwn(l, d)) return l[d];
    if (Object.hasOwn(n, d)) return n[d];
    if (!Object.hasOwn(o, d)) return t[d];
    if (e.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...e, d].join(" → "));
    }
    return e.add(d), n[d] = J(oe(o[d]), E), e.delete(d), n[d];
  }
  for (const d of Object.keys(o)) E(d);
  return Object.assign(P(), t, n, l);
}
function re(t, s, i, a) {
  let o = "";
  for (let n = 0; n < t.length; ) {
    const e = t[n];
    if (e !== "{" && e !== "'") {
      o += e, n++;
      continue;
    }
    const l = n++;
    let E = 1, d = "";
    for (; n < t.length && E; n++) {
      if (e === "'") {
        t[n] === "'" && (E = 0);
        continue;
      }
      if (d) {
        t[n] === d && (d = "");
        continue;
      }
      if (t[n] === '"' || t[n] === "'") {
        d = t[n];
        continue;
      }
      t[n] === "{" && E++, t[n] === "}" && E--;
    }
    if (E) throw Error("Unclosed parameter expression.");
    o += e + J(t.slice(l + 1, n - 1), (y) => s[y], i, a) + (e === "{" ? "}" : "'");
  }
  if (!t.includes("{") && !t.includes("'") && /^(?:[VI]|VALUE|VOL|CUR)\s*=/i.test(t)) {
    const n = t.indexOf("=");
    o = t.slice(0, n + 1) + J(t.slice(n + 1), (e) => s[e], i, a);
  } else Object.hasOwn(s, t.toLowerCase()) && (o = "{" + s[t.toLowerCase()] + "}");
  return o;
}
function we(t) {
  he(t);
  const s = P();
  let i = 0, a = 0;
  function o(n, e, l, E, d, y, x) {
    if (e.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++i > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const v = t.scopes[n], N = e.length ? H(e.slice(0, -1), e.at(-1)) : "", m = P(), r = be(E, v.defaults, v.parameters, d);
    function u(f) {
      const b = f.toLowerCase();
      return Object.hasOwn(l, b) ? l[b] : t.globals.includes(b) ? te([], b) : m[b] || (m[b] = te(e, b));
    }
    const g = { id: N, path: e, scopeId: n, name: y?.name || "Top", definition: v.name, ports: v.ports.map((f) => ({ name: f, node: u(f) })), params: r, nodes: m, models: P(), devices: [], children: [], raw: y?.raw || "", line: y?.line || 0 };
    s[N] = g;
    const k = [...x, g];
    function I(f) {
      if (!f) return "";
      let b = v;
      for (; b; ) {
        if (b.directives.some((p) => new RegExp("^\\.model\\s+" + f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\s|$)", "i").test(p.text))) {
          const p = [...k].reverse().find((L) => L.scopeId === b.id);
          return H(p?.path || [], f.toLowerCase());
        }
        b = t.scopes[b.parent];
      }
      return f;
    }
    for (const f of v.directives.filter((b) => /^\.model\b/i.test(b.text))) {
      const b = /^\.model\s+(\S+)/i.exec(f.text)?.[1];
      if (!b) continue;
      const p = I(b), L = v.models[b.toLowerCase()], $ = re(f.text, r, u, (M) => H(e, M));
      g.models[p] = { ...L, name: p, raw: $.replace(/^(\.model\s+)\S+/i, (M, _) => _ + p), instanceId: N, parameters: r };
    }
    for (const f of v.devices) {
      if (++a > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const b = P();
      for (const [M, _] of Object.entries(f.terminals)) b[M] = u(_);
      const p = (M) => H(e, v.devices.find((_) => _.name.toLowerCase() === M.toLowerCase())?.name || M);
      let L = re(f.value, r, u, p);
      const $ = I(f.model);
      f.model && (L = L.replace(f.model, $)), f.controlSource && (L = L.replace(f.controlSource, p(f.controlSource))), g.devices.push({ ...f, name: H(e, f.name), localName: f.name, instanceId: N, terminals: b, value: L, model: $, controlSource: f.controlSource ? p(f.controlSource) : "", parameters: r });
    }
    for (const f of v.instances) {
      const b = t.scopes[f.definitionId], p = P();
      b.ports.forEach((L, $) => {
        p[L.toLowerCase()] = u(f.nodes[$]);
      }), g.children.push(o(f.definitionId, [...e, f.name], p, r, f.parameters, f, k));
    }
    return g;
  }
  try {
    const n = o(t.rootId, [], P(), P(), P(), null, []);
    return { kind: "ElaboratedHierarchy", ir: t, root: n, contexts: s };
  } catch (n) {
    throw n.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: n.message }], n;
  }
}
function K(t) {
  return [...t.devices, ...t.children.flatMap(K)];
}
function ie(t) {
  return JSON.stringify(t.map((s) => [s.name, s.kind, Object.entries(s.terminals).sort(), s.value, s.model, s.controlSource]).sort((s, i) => s[0].localeCompare(i[0])));
}
function ce(t, s) {
  const i = s.ports.map((o, n) => ({ pin: "P" + n, label: o.name, node: o.node, implicit: !1 })), a = new Set(K(s).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const n = te([], o);
    a.has(n) && !i.some((e) => e.node === n) && i.push({ pin: "G" + i.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: n, implicit: !0 });
  }
  return i;
}
function ve(t, { mode: s = "hierarchical", expanded: i = /* @__PURE__ */ new Set(), focus: a = "" } = {}) {
  const o = t.contexts[a];
  if (!o) throw Error("Unknown instance: " + a);
  const n = [], e = (y) => a ? y.slice(a.length + 1) : y;
  function l(y) {
    n.push(...y.devices.map((x) => ({ ...x, layoutLabel: e(x.name) })));
    for (const x of y.children) {
      if (s === "flat" || i.has(x.id)) {
        l(x);
        continue;
      }
      const v = ce(t, x), N = P();
      v.forEach((m) => {
        N[m.pin] = m.node;
      }), n.push({ name: x.id, kind: "X", type: "spice_subckt", terminals: N, value: x.definition, raw: x.raw, line: x.line, instanceId: x.id, layoutLabel: e(x.id), block: { definitionId: x.scopeId, ports: v, parameters: x.params } });
    }
  }
  l(o);
  for (const [y, x] of o.ports.entries()) n.push({ name: "@port/" + a + "/" + y, kind: "PORT", type: "spice_port", terminals: { A: x.node }, layoutLabel: x.name, value: x.name, raw: "Interface port " + x.name, synthetic: !0 });
  if (n.length > 300) throw Error("This sheet exceeds 300 symbols. Collapse instances or open a subcircuit.");
  const E = Object.assign(P(), ...Object.values(t.contexts).map((y) => y.models)), d = { title: a || t.ir.title, components: n, nodes: me(n, o.ports.map((y) => y.node)), models: E, diagnostics: t.ir.diagnostics, mode: s, focus: a };
  return d.topology = ye(t, d), d;
}
function ye(t, s) {
  const i = [], a = /* @__PURE__ */ new Set();
  for (const e of s.components)
    if (!e.synthetic)
      if (e.kind === "X") {
        const l = t.contexts[e.instanceId];
        if (!l) throw Error("Projection contains an unknown block.");
        const E = ce(t, l);
        if (JSON.stringify(Object.entries(e.terminals)) !== JSON.stringify(E.map((d) => [d.pin, d.node]))) throw Error("Block interface topology mismatch: " + e.name);
        i.push(...K(l));
      } else i.push(e);
  for (const e of i) {
    if (a.has(e.name)) throw Error("Projection duplicates " + e.name);
    a.add(e.name);
  }
  const o = ie(i), n = K(t.contexts[s.focus]);
  if (o !== ie(n)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: i.length, signature: o };
}
function Ce(t) {
  const s = P(), i = P();
  for (const a of t.components) {
    const o = P(), n = P();
    for (const [e, l] of Object.entries(a.terminals))
      o[e] = [t.nodes[l].bit], n[e] = "input";
    s[a.name] = { type: a.type, port_directions: n, connections: o, parameters: {}, attributes: { ref: a.name, displayRef: a.layoutLabel || a.name, value: a.value, spice: a.raw } }, a.block && (s[a.name].spiceBlock = { ports: a.block.ports.map((e) => ({ pin: e.pin, label: e.label })), definitionId: a.block.definitionId });
  }
  for (const a of Object.values(t.nodes)) i[a.name] = { hide_name: 0, bits: [a.bit], attributes: {} };
  if (t.nodes[0]) {
    let a = "__ground";
    for (; Object.hasOwn(s, a); ) a += "_";
    s[a] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: s, netnames: i } } };
}
function Ee(t) {
  const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = {}, o = (n) => (i.has(n) || i.set(n, i.size + 2), i.get(n));
  return Object.entries(t.modules.circuit.cells).forEach(([n, e], l) => {
    const E = "c" + l;
    s.set(E, n);
    const d = Object.fromEntries(Object.entries(e.connections).map(([y, x]) => [y, x.map(o)]));
    a[E] = { type: e.type, connections: d, port_directions: e.port_directions, attributes: { displayRef: e.attributes.displayRef || e.attributes.ref || "", value: e.attributes.value || "", name: e.attributes.name || "" } }, e.spiceBlock && (a[E].spiceBlock = e.spiceBlock);
  }), { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: a } } }, ids: s, bits: new Map([...i].map(([n, e]) => [e, n])) };
}
const X = /* @__PURE__ */ new Map();
async function xe(t, s) {
  const i = Ee(t), a = JSON.stringify([i.netlist, s]);
  let o = X.get(a);
  o ? (X.delete(a), X.set(a, o)) : (o = await ke(i.netlist, s), o.length < 1e6 && (X.set(a, o), X.size > 20 && X.delete(X.keys().next().value)));
  const n = new DOMParser().parseFromString(o, "image/svg+xml");
  if (n.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const e of n.querySelectorAll("[id],[class]")) {
    const l = e.getAttribute("id");
    l?.startsWith("cell_") && i.ids.has(l.slice(5)) && e.setAttribute("id", "cell_" + i.ids.get(l.slice(5)));
    const E = e.getAttribute("class");
    E && e.setAttribute("class", E.split(/\s+/).map((d) => d.startsWith("cell_") && i.ids.has(d.slice(5)) ? "cell_" + i.ids.get(d.slice(5)) : /^net_\d+$/.test(d) && i.bits.has(Number(d.slice(4))) ? "net_" + i.bits.get(Number(d.slice(4))) : d).join(" "));
  }
  return new XMLSerializer().serializeToString(n.documentElement);
}
function ke(t, s) {
  const i = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-DvQX8oA8.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((a, o) => {
    const n = (l, E) => {
      clearTimeout(e), i.terminate(), l ? o(Error(l)) : a(E);
    }, e = setTimeout(() => n("Layout exceeded 30 seconds. Try a smaller netlist."), 3e4);
    i.onmessage = ({ data: l }) => n(l.error, l.svg), i.onerror = (l) => n(l.message || "Layout worker failed."), i.postMessage({ netlist: t, settings: s });
  });
}
const Se = `* Mixed RLC, semiconductors and nonlinear / controlled sources
.title Mixed analog circuit
VCC vcc 0 DC 5
VIN in 0 SIN(0 0.1 1k)
R1 in tank 1k
L1 tank out 10m
C1 out 0 100n
D1 out vcc DCLAMP
Q1 vcc out emitter QN
R2 emitter 0 2.2k
M1 drain out 0 0 MN W=10u L=1u
R3 vcc drain 4.7k
B1 nonlinear 0 V={tanh(V(out))*2}
R4 nonlinear 0 10k
E1 ev 0 out 0 2
R5 ev 0 10k
G1 gi 0 out 0 1m
R6 gi 0 1k
F1 fi 0 VIN 0.5
R7 fi 0 1k
H1 hi 0 VIN 100
R8 hi 0 10k
I1 vcc out DC 10u
.model DCLAMP D(Is=1n)
.model QN NPN(Bf=100)
.model MN NMOS(Vto=1 Kp=100u)
.param gain=2
.tran 1u 10m
.end
`, ee = `* RLC low-pass filter
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, Oe = `* Two parameterized channels, each with two nested filter instances
.title Hierarchical analog channels
.global vdd
.param base=1k
VCC vdd 0 DC 5
VIN input 0 AC 1
Xleft input left CHANNEL params: rval={base} cval=10n
Xright input right CHANNEL rval={base*2} cval=22n
Rleft left 0 10k
Rright right 0 10k
.subckt CHANNEL in out params: rval=1k cval=10n
.param second={rval*2}
Xfirst in mid FILTER r={rval} c={cval}
Xsecond mid out FILTER r={second} c={cval}
Dbias out vdd CLAMP
.model CLAMP D(Is=1n)
.subckt FILTER a b params: r=1k c=10n
R1 a local {r}
L1 local b 10u
C1 b 0 {c}
Bmonitor monitor 0 V={tanh(V(local))}
Rmonitor monitor 0 1Meg
.ends FILTER
.ends CHANNEL
.tran 1u 1m
.end
`, h = (t) => document.getElementById("spice-" + t), Y = h("app");
if (Y) {
  let I = function() {
    o = "", g(), i.textContent = "Input changed — generate to refresh the schematic.";
  }, f = function(c) {
    a.replaceChildren();
    for (const { severity: w, line: S, message: O } of c) {
      const C = document.createElement("li");
      C.className = w, C.textContent = `${w.toUpperCase()}${S ? " · line " + S : ""}: ${O}`, a.append(C);
    }
    h("messages").open = c.some((w) => w.severity !== "info"), h("message-count").textContent = `${c.length} message${c.length === 1 ? "" : "s"}`;
  }, b = function() {
    s.querySelector("svg")?.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), h("zoom-level").textContent = Math.round(N.w / v.w * 100) + "%";
  }, p = function(c, w = v.x + v.w / 2, S = v.y + v.h / 2) {
    if (!s.querySelector("svg")) return;
    const O = Math.max(0.05, Math.min(10, v.w * c / N.w)) * N.w / v.w;
    v = { x: w + (v.x - w) * O, y: S + (v.y - S) * O, w: v.w * O, h: v.h * O }, b();
  }, $ = function(c) {
    const w = new URLSearchParams();
    c && w.set("instance", c);
    const S = w.toString();
    location.hash.slice(1) === S ? (d = c, R()) : location.hash = S;
  }, M = function() {
    d = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, _ = function(c) {
    const w = e.contexts[c].path;
    for (let S = 1; S <= w.length; S++) r.add(w.slice(0, S).map(encodeURIComponent).join("/"));
  }, D = function() {
    const c = !!(y && y !== d && e?.contexts[y]);
    h("selection-actions").hidden = !c, h("toggle-instance").textContent = r.has(y) ? "Collapse instance" : "Expand instance", h("toggle-instance").disabled = h("mode").value === "flat", h("open-instance").href = "#" + new URLSearchParams({ instance: y });
  }, Q = function() {
    h("breadcrumbs").replaceChildren();
    const c = (S, O) => {
      const C = document.createElement("button");
      C.type = "button", C.textContent = S, C.onclick = () => $(O), C.disabled = O === d, h("breadcrumbs").append(C);
    };
    if (c("Top", ""), d) {
      const S = e.contexts[d].path;
      for (let O = 0; O < S.length; O++) c(S[O], S.slice(0, O + 1).map(encodeURIComponent).join("/"));
    }
    h("instances").replaceChildren();
    const w = (S, O) => {
      for (const C of S.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(O, 8)), B.dataset.instance = C.id;
        const q = document.createElement("button");
        q.type = "button", q.textContent = r.has(C.id) ? "−" : "+", q.title = (r.has(C.id) ? "Collapse " : "Expand ") + C.id, q.setAttribute("aria-label", q.title), q.setAttribute("aria-expanded", String(r.has(C.id))), q.disabled = h("mode").value === "flat", q.onclick = () => {
          r.has(C.id) ? r.delete(C.id) : _(C.id), y = C.id, R();
        };
        const T = document.createElement("a");
        T.href = "#" + new URLSearchParams({ instance: C.id }), T.textContent = C.name + " · " + C.definition, T.title = "Open " + C.id + " as its own sheet";
        const W = document.createElement("span");
        if (W.className = "spice-help", W.textContent = Object.entries(C.params).map(([j, A]) => j + "=" + A).join(" · "), B.append(q, T), W.textContent) {
          const j = document.createElement("details"), A = document.createElement("summary");
          A.textContent = "Parameters", j.append(A, W), B.append(j);
        }
        h("instances").append(B), w(C, O + 1);
      }
    };
    w(e.contexts[d], 0), h("hierarchy-panel").hidden = !e.contexts[d].children.length, h("focus-title").textContent = d ? d + " / " + e.contexts[d].definition : "Top-level schematic", D();
  };
  const t = h("input"), s = h("preview"), i = h("status"), a = h("diagnostics");
  let o = "", n, e, l, E = "", d = "", y = "", x = !1, v = { x: 0, y: 0, w: 1, h: 1 }, N = { ...v }, m;
  const r = /* @__PURE__ */ new Set();
  let u = !1;
  Y.addEventListener("click", (c) => {
    x && c.target.closest('a[href^="#"]') && c.preventDefault();
  });
  const g = () => {
    h("copy").disabled = h("download").disabled = !o || x;
  }, k = () => ({ font: h("font").value, fontSize: Number(h("size").value), color: h("color").value });
  t.value = ee;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || ee;
  } catch {
  }
  t.addEventListener("input", I);
  for (const c of ["font", "size", "color"]) h(c).addEventListener("input", I);
  h("zoom-in").onclick = () => p(0.8), h("zoom-out").onclick = () => p(1.25), h("fit").onclick = () => {
    v = { ...N }, b();
  };
  const L = (c) => {
    const w = s.querySelector("svg");
    return w ? new DOMPoint(c.clientX, c.clientY).matrixTransform(w.getScreenCTM().inverse()) : null;
  };
  s.addEventListener("wheel", (c) => {
    const w = L(c);
    w && (c.preventDefault(), p(c.deltaY > 0 ? 1.12 : 1 / 1.12, w.x, w.y));
  }, { passive: !1 }), s.addEventListener("pointerdown", (c) => {
    c.button !== 0 || !s.querySelector("svg") || (m = { start: L(c), x: c.clientX, y: c.clientY, view: { ...v }, moved: !1 }, s.setPointerCapture(c.pointerId));
  }), s.addEventListener("pointermove", (c) => {
    if (!m) return;
    const w = L(c);
    Math.hypot(c.clientX - m.x, c.clientY - m.y) > 4 && (m.moved = !0), v.x += m.start.x - w.x, v.y += m.start.y - w.y, b();
  }), s.addEventListener("pointerup", (c) => {
    if (!m) return;
    const w = m.moved;
    if (m = null, s.hasPointerCapture(c.pointerId) && s.releasePointerCapture(c.pointerId), !w) {
      const S = document.elementFromPoint(c.clientX, c.clientY)?.closest("[data-component]"), O = n?.components.find((C) => C.name === S?.dataset.component);
      O && (y = O.instanceId || "", h("selection").textContent = `${O.raw}
${Object.entries(O.terminals).map(([C, B]) => `${C} → ${B}`).join("   ")}`, O.kind === "X" && h("mode").value === "hierarchical" ? (_(O.instanceId), R()) : D());
    }
  }), window.addEventListener("hashchange", () => {
    if (x) {
      u = !0;
      return;
    }
    M(), y = "", R();
  }), h("mode").onchange = () => R(), h("collapse-all").onclick = () => {
    r.clear(), R();
  }, h("expand-all").onclick = () => {
    for (const c of Object.keys(e?.contexts || {})) c && r.add(c);
    R();
  }, h("toggle-instance").onclick = () => {
    r.has(y) ? r.delete(y) : _(y), R();
  }, s.addEventListener("pointercancel", () => {
    m = null;
  }), s.addEventListener("keydown", (c) => {
    const w = c.target.closest("[data-instance]");
    if (w && (c.key === "Enter" || c.key === " ")) {
      c.preventDefault(), y = w.dataset.instance, _(y), R();
      return;
    }
    c.key === "+" || c.key === "=" ? p(0.8) : c.key === "-" ? p(1.25) : c.key.toLowerCase() === "f" ? (v = { ...N }, b()) : c.key.startsWith("Arrow") && (c.preventDefault(), v.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[c.key] || 0) * v.w, v.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[c.key] || 0) * v.h, b());
  });
  async function R() {
    if (x) return;
    x = !0, o = "", g(), h("generate").disabled = !0, t.readOnly = !0, h("file").disabled = !0;
    for (const w of Y.querySelectorAll("[data-example], select, input[type=number], input[type=color], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) w.disabled = !0;
    i.textContent = "Parsing netlist and routing wires…", s.setAttribute("aria-busy", "true");
    let c = [];
    try {
      if (E !== t.value || !e) {
        if (l = pe(t.value), c = l.diagnostics, c.some((j) => j.severity === "error"))
          throw e = null, Error("Fix the parser errors below before generating.");
        e = we(l), E && E !== t.value ? (r.clear(), d = "", y = "", history.replaceState(null, "", location.pathname + location.search)) : M(), E = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (c = l.diagnostics, f(c), c.some((j) => j.severity === "error")) throw Error("Fix the parser errors below before generating.");
      n = ve(e, { mode: h("mode").value, expanded: r, focus: d });
      const w = Ce(n), S = await xe(w, k()), O = new DOMParser().parseFromString(S, "image/svg+xml");
      if (O.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const C = O.documentElement;
      if (C.localName !== "svg" || C.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const B = Number(C.getAttribute("width")), q = Number(C.getAttribute("height"));
      N = { x: -20, y: -20, w: B + 40, h: q + 40 }, v = { ...N }, C.setAttribute("viewBox", `${N.x} ${N.y} ${N.w} ${N.h}`), C.setAttribute("width", String(N.w)), C.setAttribute("height", String(N.h)), C.setAttribute("role", "img"), C.setAttribute("aria-label", n.title || "SPICE schematic"), C.setAttribute("style", "background:white");
      for (const j of n.components) {
        const A = O.getElementById("cell_" + j.name);
        if (!A) throw Error("Renderer omitted component " + j.name);
        A.setAttribute("data-component", j.name), j.kind === "X" && (A.setAttribute("data-instance", j.instanceId), A.setAttribute("role", "button"), A.setAttribute("tabindex", "0"), A.setAttribute("aria-label", "Expand " + j.name));
        const z = O.createElementNS(C.namespaceURI, "title");
        z.textContent = j.raw + `
` + Object.entries(j.terminals).map(([F, le]) => F + ": " + le).join(", "), A.prepend(z);
      }
      for (const j of Object.values(n.nodes))
        for (const A of C.querySelectorAll(".net_" + j.bit)) {
          A.setAttribute("data-net", j.name);
          const z = O.createElementNS(C.namespaceURI, "title");
          z.textContent = "Node " + j.displayName, A.append(z);
        }
      o = new XMLSerializer().serializeToString(C), h("source").value = o, s.replaceChildren(document.importNode(C, !0)), b();
      const T = c.filter((j) => j.severity === "warning").length;
      i.textContent = `${n.components.filter((j) => !j.synthetic).length} components · ${Object.keys(n.nodes).length} nodes · ${n.topology.leafCount} primitive devices verified${T ? " · Review " + T + " warning(s); drawing may be partial." : " · Schematic ready."}`;
      const W = Object.values(n.nodes).map((j) => {
        const A = document.createElement("tr");
        for (const z of [j.displayName, j.terminals.map((F) => F.component + "." + F.pin).join(", ")]) {
          const F = document.createElement("td");
          F.textContent = z, A.append(F);
        }
        return A;
      });
      h("nets").replaceChildren(...W), h("json").value = JSON.stringify({ circuit: n, netlist: w, hierarchy: l }, null, 2), h("selection").textContent = "Click a component to inspect its original statement and pin connections.", Q();
    } catch (w) {
      if (s.replaceChildren(), o = "", h("source").value = "", h("json").value = "", h("nets").replaceChildren(), h("selection").textContent = "", i.textContent = w.message, !e)
        h("hierarchy-panel").hidden = !0, h("selection-actions").hidden = !0, h("breadcrumbs").replaceChildren();
      else if (!e.contexts[d]) {
        const S = document.createElement("button");
        S.type = "button", S.textContent = "Return to Top", S.onclick = () => $(""), h("breadcrumbs").replaceChildren(S);
      }
      w.diagnostics && (c = w.diagnostics), c.some((S) => S.severity === "error") || c.push({ severity: "error", line: 0, message: w.message }), f(c);
    } finally {
      x = !1, h("generate").disabled = !1, t.readOnly = !1, h("file").disabled = !1;
      for (const w of Y.querySelectorAll("[data-example], select, input[type=number], input[type=color], #spice-instances button, #spice-collapse-all, #spice-expand-all")) w.disabled = !1;
      e && e.contexts[d] && Q(), s.setAttribute("aria-busy", "false"), g(), u && (u = !1, M(), queueMicrotask(R));
    }
  }
  h("generate").onclick = R;
  for (const c of Y.querySelectorAll("[data-example]")) c.onclick = () => {
    t.value = { mixed: Se, filter: ee, hierarchy: Oe }[c.dataset.example], I(), R();
  };
  h("file").onchange = async (c) => {
    const w = c.target.files[0];
    if (w) {
      if (w.size > 5e5) {
        i.textContent = "File exceeds 500 kB.";
        return;
      }
      try {
        t.value = await w.text(), I(), R();
      } catch (S) {
        i.textContent = "File could not be read: " + S.message;
      } finally {
        c.target.value = "";
      }
    }
  }, h("download").onclick = () => {
    const c = URL.createObjectURL(new Blob([o], { type: "image/svg+xml;charset=utf-8" })), w = document.createElement("a");
    w.href = c, w.download = "spice-schematic.svg", w.click(), setTimeout(() => URL.revokeObjectURL(c), 1e3);
  }, h("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(o), i.textContent = "SVG source copied to clipboard.";
    } catch {
      h("source-details").open = !0, h("source").focus(), h("source").select(), i.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, R();
}
