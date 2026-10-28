const Re = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ae = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Ne = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Pe = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, je = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Te = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ue = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Be = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, _e = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ve = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Fe = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, qe = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Xe = {
  AND: Re,
  BUF: Ae,
  COUNTER: Ne,
  DFLOP: Pe,
  SCHMITT: je,
  OR: Te,
  PHASEDET: Ue,
  SRFLOP: Be,
  XOR: $e,
  MODULATOR: _e,
  OTA: Ve,
  SAMPLEHOLD: Fe,
  VARISTOR: qe
}, ze = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Z = (t) => t.toLowerCase(), we = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Qe = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function He(t, e) {
  const n = (E) => e[Z(E || "")] || Object.entries(e).find(([c]) => c.startsWith(Z(E || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], l = [], i = "", s = "", a = [], d = [], b = 0, h = "", m = "", y = "", L = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], s = Z(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], s = o === "D" ? "d_v" : o === "B" ? "spice_b" : Z(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !we(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), i = t[r.length + 1] || "";
    const E = n(i)?.type;
    L = ["NPN", "PNP"].includes(E), s = L ? (r.length === 3 ? "q_" : "spice_q4_") + Z(E) : "spice_q" + r.length;
  } else if (o === "M") {
    const E = n(t[4]), c = n(t[5]), p = E?.type === "VDMOS" || !c && (!t[5] || we(t[5]));
    r = p ? ["D", "G", "S"] : ["D", "G", "S", "B"], i = t[r.length + 1] || "";
    const g = n(i), O = g?.type;
    if (p && g && O !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!p && O === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    L = ["NMOS", "PMOS", "VDMOS"].includes(O);
    let f = null, x = g;
    const v = /* @__PURE__ */ new Set();
    for (; x && !v.has(x.name) && (v.add(x.name), f = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !f); )
      x = n(x.baseModel);
    const A = O === "PMOS" || O === "VDMOS" && f && (f[1] === void 0 || Number(f[1]) >= 0.5);
    s = L ? "spice_" + (A ? "pmos" : "nmos") + (p ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    i = t[4] || "";
    const E = n(i)?.type, c = o === "Z" && ["NIGBT", "PIGBT"].includes(E);
    r = c ? ["C", "G", "E"] : ["D", "G", "S"], L = o === "J" ? ["NJF", "PJF"].includes(E) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(E), s = "spice_" + (c ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(E || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], s = "spice_" + Z(o);
    let E = 3, c = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[E] || "");
    if (/^poly$/i.test(t[E] || "") && (c = /^\(\s*(\d+)\s*\)$/.exec(t[++E] || ""), !c))
      throw Error("POLY requires a dimension.");
    if (c) {
      const p = Number(c[1]);
      if (p > 128) throw Error("POLY supports at most 128 controlling variables.");
      let g = E + 1, O = [];
      const f = "EG".includes(o), x = p * (f ? 2 : 1);
      for (; O.length < x && g < t.length; ) O.push(...Qe(t[g++]));
      if (O.length !== x || g >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (f) {
        for (let v = 0; v < p; v++) r.push("C" + (v + 1) + "+", "C" + (v + 1) + "-");
        l = [t[1], t[2], ...O];
      } else a = O;
      b = g, h = "POLY(" + p + ") " + (f ? "" : O.join(" ") + " "), m = "POLY", f && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? m = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), m = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (a = [t[3]], b = 4, h = t[3] + " ");
    y = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (m ? " · " + m : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], i = t[5] || "", s = "spice_device", y = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], a = [t[3]], i = t[4] || "", b = 3, s = "spice_device", y = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (i = t[5] || ""), s = "spice_device", y = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], i = t[4] || "", s = "spice_device", y = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (E, c) => "P" + (c + 1)), s = "spice_device", y = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (d = t.slice(1, -1), d.some((E) => !/^L/i.test(E.split(":").at(-1)))) throw Error("K references must name inductors.");
    b = t.length - 1, s = "spice_coupling", y = "Magnetic coupling", h = d.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], s = "spice_device", y = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], s = "spice_device", y = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", y = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (b || (b = r.length + 1), l.length || (l = t.slice(1, r.length + 1)), l.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= b && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (l.some((E) => /[=()]/.test(E) && !/^\{[\s\S]*\}$/.test(E))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(b).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(b).join(" ")) && (s = "spice_br"), o === "D" && (i = t[3] || ""), o === "@") {
    const E = t.slice(b).join(" ");
    for (const c of E.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(c[1].toUpperCase()), l.push(c[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (a.some((E) => !E)) throw Error("Missing controlling voltage source.");
  const S = r.map((E, c) => o === "A" && Xe[(t[9] || "").toUpperCase()]?.[String(c + 1)] || E);
  return { kind: o, pins: r, nodeTokens: l, pinLabels: S, model: i, type: s, controlSource: a[0] || "", controlSources: a, coupledInductors: d, value: h + t.slice(b).join(" "), sourceMode: m, symbol: y, polarityKnown: L };
}
const Ke = ze, We = new Set(Ke.split(" ")), ue = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function ce(t) {
  const e = [], n = [];
  let o = "", r = 0, l = "";
  for (let i = 0; i < t.length; i++) {
    const s = t[i];
    if (l) {
      o += s, s === l && t[i - 1] !== "\\" && (l = "");
      continue;
    }
    if (s === '"' || s === "'") {
      l = s, o += s;
      continue;
    }
    if (!r && (s === ";" || s === "$" && (!i || /\s/.test(t[i - 1])))) break;
    if ("({".includes(s) && (n.push(s), r++), ")}".includes(s) && (r--, n.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !r ? (o && e.push(o), o = "") : o += s;
  }
  if (r || l) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Ge(t, e = {}) {
  const n = [], o = [], r = [], l = Object.assign(ue(), e.models), i = ue(), s = (c, p, g) => n.push({ severity: c, line: p, message: g });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const a = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((c, p) => {
    const g = c.trim();
    !g || g.startsWith("*") || (g.startsWith("+") ? a.length ? a.at(-1).text += " " + g.slice(1).trim() : s("error", p + 1, "Continuation has no preceding statement.") : a.push({ line: p + 1, text: g }));
  });
  for (const c of a) {
    try {
      c.tokens = ce(c.text);
    } catch (g) {
      s("error", c.line, g.message), c.tokens = [];
    }
    const p = c.tokens;
    if (/^\.model$/i.test(p[0] || ""))
      if (p.length < 3) s("error", c.line, ".model requires a name and device type.");
      else {
        const g = /^ako:(.+)$/i.exec(p[2]), O = g && p[3] && !p[3].startsWith("(") ? p[3].split("(")[0].toUpperCase() : "";
        l[X(p[1])] = { name: p[1], type: g ? O : p[2].split("(")[0].toUpperCase(), baseModel: g?.[1] || "", raw: c.text };
      }
  }
  const d = /* @__PURE__ */ new Set();
  function b(c) {
    const p = l[X(c)];
    if (!p) return "";
    if (p.type) return p.type;
    if (d.has(X(c))) throw Error("Circular AKO model inheritance: " + c);
    return d.add(X(c)), p.type = b(p.baseModel), d.delete(X(c)), p.type;
  }
  for (const c of Object.values(l)) if (c.baseModel && !c.type)
    try {
      b(c.name);
    } catch (p) {
      s("error", 0, p.message);
    }
  let h = "", m = 0, y = !1, L = !1;
  const S = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: c, text: p, tokens: g } of a) {
    if (!g.length) continue;
    const O = X(g[0]);
    if (L) {
      s("warning", c, "Statement after .end is not rendered: " + p);
      continue;
    }
    if (O === ".control") {
      y = !0, s("warning", c, ".control script retained but not executed or rendered.");
      continue;
    }
    if (O === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (O === ".subckt") {
      m++, s("error", c, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (O === ".ends") {
      m ? m-- : s("error", c, "Unmatched .ends.");
      continue;
    }
    if (m) continue;
    if (O === ".end") {
      L = !0;
      continue;
    }
    if (O.startsWith(".")) {
      o.push({ line: c, text: p }), O === ".title" ? h = g.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(O) ? s("error", c, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(O) ? s("error", c, "Topology-changing directive is unsupported: " + p) : E.has(O) || s("warning", c, "Directive retained but not resolved: " + p);
      continue;
    }
    const f = g[0][0].toUpperCase();
    if (!We.has(f)) {
      c === 1 && !/\d/.test(g[0]) && g.length > 1 && f !== "X" ? (h = p, s("warning", c, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", c, `Unsupported ${f} device was not rendered: ${p}`);
      continue;
    }
    const x = f === "M" || f === "Q" ? 5 : 4;
    if (c === 1 && !/\d/.test(g[0]) && (g.length < x || f === "T" && !/\b(?:zo|z0)\s*=/i.test(p))) {
      h = p, s("info", c, "SPICE title: " + p);
      continue;
    }
    try {
      if (S.has(O)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const v = He(g, l), { pins: A, nodeTokens: B, ...T } = v;
      v.polarityKnown || s("warning", c, `${g[0]}: model polarity unknown; explicit ${A.join("/")} terminals retained.`);
      const P = ue();
      A.forEach((ne, re) => {
        const N = X(B[re]);
        i[N] || (i[N] = { name: N, displayName: g[re + 1], bit: Object.keys(i).length + 2, terminals: [] }), i[N].terminals.push({ component: g[0], pin: ne }), P[ne] = N;
      }), r.push({ ...T, name: g[0], terminals: P, line: c, raw: p }), S.add(O);
    } catch (v) {
      s("error", c, `${g[0]}: ${v.message} Statement: ${p}`);
    }
  }
  m && s("error", 0, "Unclosed .subckt definition."), y && s("error", 0, "Unclosed .control block."), r.length || s("error", 0, "No supported components to render."), r.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const c of r) {
    for (const p of c.controlSources || []) !p.includes(":") && !r.some((g) => X(g.name) === X(p) && g.kind === "V") && s("error", c.line, `${c.name}: controlling voltage source ${p} was not found.`);
    for (const p of c.coupledInductors || []) !p.includes(":") && !r.some((g) => X(g.name) === X(p) && g.kind === "L") && s("error", c.line, `${c.name}: coupled inductor ${p} was not found.`);
    (c.kind === "B" || c.type === "spice_b") && s("info", c.line, `${c.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: h, components: r, nodes: i, models: l, directives: o, diagnostics: n };
}
const W = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Ee = (t) => W(t).split("/").at(-1);
function Ye(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], l = [], i = [];
  let s = 0;
  const a = (b, h) => {
    const m = W(h).split("/").slice(0, -1).concat(W(b)).join("/"), y = [...o].filter(([S]) => W(S) === W(b) || W(S) === m);
    if (y.length === 1) return y[0];
    const L = [...o].filter(([S]) => Ee(S) === Ee(b));
    if (L.length !== 1) throw Error(L.length ? "Ambiguous library filename: " + b : "Missing library " + b + ". Add this file using Library files.");
    return L[0];
  };
  function d(b, h, m = "", y = []) {
    const L = W(h) + ":" + m.toLowerCase();
    if (y.includes(L)) throw Error("Circular library include: " + [...y, L].join(" → "));
    if (y.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const S = [], E = /^\s*\.endl\b/im.test(b);
    let c = !m;
    const p = (O, f) => {
      if (s += O.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      i.push(O), l.push({ file: h, line: f + 1 });
    };
    if (b.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((O, f) => {
      const x = O.trim();
      if (/^\.lib\b/i.test(x) && E) {
        const v = ce(x);
        if (v.length === 2 && !/[.\\/]/.test(v[1])) {
          S.push(v[1].toLowerCase()), v[1].toLowerCase() === m.toLowerCase() && (c = !0), p("* Library section " + v[1], f);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        S.pop(), p("* End library section", f);
        return;
      }
      if (m && S.length && !S.includes(m.toLowerCase())) {
        p("* Unselected library section", f);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const v = ce(x);
          if (!v[1]) throw Error("Include requires a filename.");
          const [A, B] = a(v[1], h);
          p("* Included " + A, f), d(B, A, v[2] || "", [...y, L]);
        } catch (v) {
          r.push({ severity: "error", line: f + 1, source: h, message: v.message }), p("* Unresolved include", f);
        }
      else p(O, f);
    }), !c) throw Error("Library section " + m + " not found in " + h);
  }
  try {
    d(t, n);
  } catch (b) {
    r.push({ severity: "error", line: 0, source: n, message: b.message });
  }
  return { source: i.join(`
`), origins: l, diagnostics: r };
}
const ee = () => /* @__PURE__ */ Object.create(null), V = (t) => t.toLowerCase();
function Ie(t) {
  const e = ee();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const l = V(r[1]);
    let i = r[2];
    if (i === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!s) throw Error("Expected = after parameter " + l);
      i = s[1];
    }
    if (i || (i = t[++n]), !i || /^params?:$/i.test(i)) throw Error("Missing value for parameter " + l);
    if (Object.hasOwn(e, l)) throw Error("Duplicate parameter: " + l);
    e[l] = i;
  }
  return e;
}
function ye(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ee()] : [t.slice(0, e), Ie(t.slice(e))];
}
function Ze(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Ye(t, e);
  t = n.source;
  const o = [...n.diagnostics], r = ee(), l = /* @__PURE__ */ new Set(["0"]), i = (c, p, g) => o.push({ severity: c, line: p, message: g }), s = (c, p, g, O = [], f = ee(), x = 0) => {
    const v = { id: c, name: p, parent: g, ports: O, defaults: f, parameters: ee(), definitions: ee(), devices: [], instances: [], directives: [], line: x, statements: [] };
    return r[c] = v, v;
  }, a = s("root", "Top", null), d = [a], b = [];
  let h = !1, m = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((c, p) => {
    const g = c.trim();
    !g || g.startsWith("*") || (g.startsWith("+") ? b.length ? b.at(-1).text += " " + g.slice(1).trim() : i("error", p + 1, "Continuation has no preceding statement.") : b.push({ text: g, line: p + 1 }));
  });
  for (const { text: c, line: p } of b)
    try {
      const g = ce(c);
      if (!g.length) continue;
      const O = V(g[0]), f = d.at(-1);
      if (m) {
        i("warning", p, "Statement after .end is not rendered: " + c);
        continue;
      }
      if (O === ".control") {
        h = !0, i("warning", p, ".control script retained but not executed or rendered.");
        continue;
      }
      if (O === ".endc") {
        h = !1;
        continue;
      }
      if (h) continue;
      if (O === ".subckt") {
        if (g.length < 2) throw Error(".SUBCKT requires a name.");
        const [x, v] = ye(g.slice(2)), A = V(g[1]);
        if (Object.hasOwn(f.definitions, A)) throw Error("Duplicate subcircuit definition: " + g[1]);
        const B = x.map(V);
        if (new Set(B).size !== x.length || B.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (x.some((P) => /[{}()=]/.test(P))) throw Error("Invalid formal port.");
        if (d.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const T = f.id + "/" + encodeURIComponent(A);
        f.definitions[A] = T, d.push(s(T, g[1], f.id, x, v, p));
        continue;
      }
      if (O === ".ends") {
        if (d.length === 1) throw Error("Unmatched .ENDS.");
        if (g[1] && V(g[1]) !== V(f.name)) throw Error(".ENDS name does not match " + f.name);
        d.pop();
        continue;
      }
      if (O === ".end") {
        if (d.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        m = !0;
        continue;
      }
      if (O === ".param") {
        const x = Ie(g.slice(1));
        for (const [v, A] of Object.entries(x)) {
          if (Object.hasOwn(f.parameters, v)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + v);
          f.parameters[v] = A;
        }
      }
      if (O === ".global") {
        if (g.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const x of g.slice(1)) l.add(V(x));
      }
      if (O.startsWith(".") && f.directives.push({ line: p, text: c }), O.startsWith("x")) {
        const [x, v] = ye(g.slice(1));
        if (!x.length) throw Error("X instance requires a subcircuit name.");
        const A = /;§pnba\s+(.+)$/i.exec(c)?.[1].split(")");
        f.instances.push({ name: g[0], nodes: x.slice(0, -1).map(V), definitionName: x.at(-1), definitionId: null, parameters: v, line: p, raw: c, pinNames: A });
      } else f.statements.push({ line: p, text: c });
    } catch (g) {
      i("error", p, g.message + " Statement: " + c);
    }
  d.length > 1 && i("error", d.at(-1).line, "Unclosed .SUBCKT " + d.at(-1).name), h && i("error", 0, "Unclosed .control block.");
  function y(c, p) {
    for (; c; ) {
      if (Object.hasOwn(c.definitions, V(p))) return c.definitions[V(p)];
      c = r[c.parent];
    }
    return null;
  }
  for (const c of Object.values(r)) {
    const p = [...c.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...c.statements], g = Ge(p.map((f) => f.text).join(`
`), { models: r[c.parent]?.models });
    c.devices = g.components.map((f) => ({ ...f, line: p[f.line - 1]?.line || c.line })), c.models = g.models, c === a && (a.title = g.title), o.push(...g.diagnostics.filter((f) => !f.message.includes("No supported components to render.") && !f.message.includes("300 components")).map((f) => ({ ...f, line: p[f.line - 1]?.line || c.line })));
    const O = new Set(c.devices.map((f) => V(f.name)));
    for (const f of c.instances)
      if (O.has(V(f.name)) && i("error", f.line, "Duplicate instance/device name: " + f.name), O.add(V(f.name)), f.definitionId = y(c, f.definitionName), !f.definitionId && !/^\{[\s\S]*\}$/.test(f.definitionName)) i("error", f.line, "Undefined subcircuit: " + f.definitionName + " in " + f.name);
      else if (f.definitionId) {
        const x = r[f.definitionId];
        x.ports.length !== f.nodes.length && i("error", f.line, `${f.name}: ${x.name} expects ${x.ports.length} ports; got ${f.nodes.length}.`);
      }
  }
  for (const c of Object.values(r)) delete c.statements;
  const L = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set();
  function E(c, p = []) {
    if (L.has(c)) {
      i("error", r[c].line, "Circular subcircuit reference: " + [...p, r[c].name].join(" → "));
      return;
    }
    if (!S.has(c)) {
      if (L.add(c), p.length >= 64) {
        i("error", r[c].line, "Subcircuit dependency nesting exceeds 64 levels."), L.delete(c), S.add(c);
        return;
      }
      for (const g of r[c].instances) g.definitionId && E(g.definitionId, [...p, r[c].name]);
      L.delete(c), S.add(c);
    }
  }
  for (const c of Object.keys(r)) E(c);
  !a.devices.length && !a.instances.length && i("error", 0, "No supported components or instances to render.");
  for (const c of o) !c.source && c.line && n.origins[c.line - 1] && (c.source = n.origins[c.line - 1].file, c.line = n.origins[c.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: r, globals: [...l], diagnostics: o };
}
const j = () => /* @__PURE__ */ Object.create(null), J = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), pe = (t, e) => J(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Je(t, e = []) {
  const n = j(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [l, i] of Object.entries(r.terminals)) o(i).terminals.push({ component: r.name, pin: l });
  for (const r of e) o(r);
  return n;
}
function et(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const xe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, tt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function le(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (i) => (r.push(i), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (i, s, a) => {
    const d = a.split(",").map((h) => h.trim());
    if (d.some((h) => !h || /[\s{}+*()]/.test(h))) throw Error("Unsupported dynamic voltage/current reference: " + i);
    const b = s.toUpperCase() + "(" + d.map((h) => s.toLowerCase() === "v" ? n(h) : o(h, s)).join(",") + ")";
    return r.push(b), "@@" + (r.length - 1) + "@@";
  });
  let l = t.length;
  return t = t.replace(tt, (i, s, a) => {
    if (a.slice(s + i.length).trimStart().startsWith("(")) return i;
    const d = e(i.toLowerCase());
    if (d === void 0) return i;
    if (l += d.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (i, s) => r[Number(s)]);
}
function nt(t, e, n, o) {
  const r = { ...e, ...n }, l = j(), i = /* @__PURE__ */ new Set(), s = j();
  for (const [d, b] of Object.entries(o)) s[d] = le(xe(b), (h) => t[h]);
  function a(d) {
    if (Object.hasOwn(s, d)) return s[d];
    if (Object.hasOwn(l, d)) return l[d];
    if (!Object.hasOwn(r, d)) return t[d];
    if (i.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...i, d].join(" → "));
    }
    return i.add(d), l[d] = le(xe(r[d]), a), i.delete(d), l[d];
  }
  for (const d of Object.keys(r)) a(d);
  return Object.assign(j(), t, l, s);
}
function Ce(t, e, n, o) {
  let r = "";
  for (let a = 0; a < t.length; ) {
    const d = t[a];
    if (d !== "{" && d !== "'") {
      r += d, a++;
      continue;
    }
    const b = a++;
    let h = 1, m = "";
    for (; a < t.length && h; a++) {
      if (d === "'") {
        t[a] === "'" && (h = 0);
        continue;
      }
      if (m) {
        t[a] === m && (m = "");
        continue;
      }
      if (t[a] === '"' || t[a] === "'") {
        m = t[a];
        continue;
      }
      t[a] === "{" && h++, t[a] === "}" && h--;
    }
    if (h) throw Error("Unclosed parameter expression.");
    r += d + le(t.slice(b + 1, a - 1), (y) => e[y], n, o) + (d === "{" ? "}" : "'");
  }
  const l = [];
  let i = 0, s = "";
  for (let a = 0; a < r.length; a++) {
    const d = r[a];
    if (s) {
      d === s && r[a - 1] !== "\\" && (s = "");
      continue;
    }
    if (d === '"' || d === "'") {
      s = d;
      continue;
    }
    if ("({".includes(d) && i++, ")}".includes(d) && i--, !i && (a === 0 || /\s/.test(r[a - 1]))) {
      const b = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(a));
      b && (l.push({ start: a, end: a + b[0].length, key: b[1].toLowerCase() }), a += b[0].length - 1);
    }
  }
  if (l.length) {
    let a = r.slice(0, l[0].start);
    l.forEach((d, b) => {
      const h = l[b + 1]?.start ?? r.length, m = r.slice(d.end, h);
      a += r.slice(d.start, d.end) + (m.includes("{") || ["refnode", "intnode"].includes(d.key) ? m : le(m, (y) => e[y], n, o));
    }), r = a;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class rt {
  /**
   * @callback HookCallback
   * @this {*|Jsep} this
   * @param {Jsep} env
   * @returns: void
   */
  /**
   * Adds the given callback to the list of callbacks for the given hook.
   *
   * The callback will be invoked when the hook it is registered for is run.
   *
   * One callback function can be registered to multiple hooks and the same hook multiple times.
   *
   * @param {string|object} name The name of the hook, or an object of callbacks keyed by name
   * @param {HookCallback|boolean} callback The callback function which is given environment variables.
   * @param {?boolean} [first=false] Will add the hook to the top of the list (defaults to the bottom)
   * @public
   */
  add(e, n, o) {
    if (typeof arguments[0] != "string")
      for (let r in arguments[0])
        this.add(r, arguments[0][r], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(r) {
        this[r] = this[r] || [], n && this[r][o ? "unshift" : "push"](n);
      }, this);
  }
  /**
   * Runs a hook invoking all registered callbacks with the given environment variables.
   *
   * Callbacks will be invoked synchronously and in the order in which they were registered.
   *
   * @param {string} name The name of the hook.
   * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
   * @public
   */
  run(e, n) {
    this[e] = this[e] || [], this[e].forEach(function(o) {
      o.call(n && n.context ? n.context : n, n);
    });
  }
}
class it {
  constructor(e) {
    this.jsep = e, this.registered = {};
  }
  /**
   * @callback PluginSetup
   * @this {Jsep} jsep
   * @returns: void
   */
  /**
   * Adds the given plugin(s) to the registry
   *
   * @param {object} plugins
   * @param {string} plugins.name The name of the plugin
   * @param {PluginSetup} plugins.init The init function
   * @public
   */
  register(...e) {
    e.forEach((n) => {
      if (typeof n != "object" || !n.name || !n.init)
        throw new Error("Invalid JSEP plugin format");
      this.registered[n.name] || (n.init(this.jsep), this.registered[n.name] = n);
    });
  }
}
class u {
  /**
   * @returns {string}
   */
  static get version() {
    return "1.6.0";
  }
  /**
   * @returns {string}
   */
  static toString() {
    return "JavaScript Expression Parser (JSEP) v" + u.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return u.max_unop_len = Math.max(e.length, u.max_unop_len), u.unary_ops[e] = 1, u;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return u.max_binop_len = Math.max(e.length, u.max_binop_len), u.binary_ops[e] = n, o ? u.right_associative.add(e) : u.right_associative.delete(e), u;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return u.additional_identifier_chars.add(e), u;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return u.literals[e] = n, u;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete u.unary_ops[e], e.length === u.max_unop_len && (u.max_unop_len = u.getMaxKeyLen(u.unary_ops)), u;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return u.unary_ops = {}, u.max_unop_len = 0, u;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return u.additional_identifier_chars.delete(e), u;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete u.binary_ops[e], e.length === u.max_binop_len && (u.max_binop_len = u.getMaxKeyLen(u.binary_ops)), u.right_associative.delete(e), u;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return u.binary_ops = {}, u.max_binop_len = 0, u;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete u.literals[e], u;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return u.literals = {}, u;
  }
  // ==================== END CONFIG ============================
  /**
   * @returns {string}
   */
  get char() {
    return this.expr.charAt(this.index);
  }
  /**
   * @returns {number}
   */
  get code() {
    return this.expr.charCodeAt(this.index);
  }
  /**
   * @param {string} expr a string with the passed in express
   * @returns Jsep
   */
  constructor(e) {
    this.expr = e, this.index = 0;
  }
  /**
   * static top-level parser
   * @returns {jsep.Expression}
   */
  static parse(e) {
    return new u(e).parse();
  }
  /**
   * Get the longest key length of any object
   * @param {object} obj
   * @returns {number}
   */
  static getMaxKeyLen(e) {
    return Math.max(0, ...Object.keys(e).map((n) => n.length));
  }
  /**
   * `ch` is a character code in the next three functions
   * @param {number} ch
   * @returns {boolean}
   */
  static isDecimalDigit(e) {
    return e >= 48 && e <= 57;
  }
  /**
   * Returns the precedence of a binary operator or `0` if it isn't a binary operator. Can be float.
   * @param {string} op_val
   * @returns {number}
   */
  static binaryPrecedence(e) {
    return u.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !u.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    u.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return u.isIdentifierStart(e) || u.isDecimalDigit(e);
  }
  /**
   * throw error at index of the expression
   * @param {string} message
   * @throws
   */
  throwError(e) {
    const n = new Error(e + " at character " + this.index);
    throw n.index = this.index, n.description = e, n;
  }
  /**
   * Run a given hook
   * @param {string} name
   * @param {jsep.Expression|false} [node]
   * @returns {?jsep.Expression}
   */
  runHook(e, n) {
    if (u.hooks[e]) {
      const o = { context: this, node: n };
      return u.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (u.hooks[e]) {
      const n = { context: this };
      return u.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === u.SPACE_CODE || e === u.TAB_CODE || e === u.LF_CODE || e === u.CR_CODE; )
      e = this.expr.charCodeAt(++this.index);
    this.runHook("gobble-spaces");
  }
  /**
   * Top-level method to parse all expressions and returns compound or single node
   * @returns {jsep.Expression}
   */
  parse() {
    this.runHook("before-all");
    const e = this.gobbleExpressions(), n = e.length === 1 ? e[0] : {
      type: u.COMPOUND,
      body: e
    };
    return this.runHook("after-all", n);
  }
  /**
   * top-level parser (but can be reused within as well)
   * @param {number} [untilICode]
   * @returns {jsep.Expression[]}
   */
  gobbleExpressions(e) {
    let n = [], o, r;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === u.SEMCOL_CODE || o === u.COMMA_CODE)
        this.index++;
      else if (r = this.gobbleExpression())
        n.push(r);
      else if (this.index < this.expr.length) {
        if (o === e)
          break;
        this.throwError('Unexpected "' + this.char + '"');
      }
    return n;
  }
  /**
   * The main parsing function.
   * @returns {?jsep.Expression}
   */
  gobbleExpression() {
    const e = this.searchHook("gobble-expression") || this.gobbleBinaryExpression();
    return this.gobbleSpaces(), this.runHook("after-expression", e);
  }
  /**
   * Search for the operation portion of the string (e.g. `+`, `===`)
   * Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
   * and move down from 3 to 2 to 1 character until a matching binary operation is found
   * then, return that binary operation
   * @returns {string|boolean}
   */
  gobbleBinaryOp() {
    this.gobbleSpaces();
    let e = this.expr.substr(this.index, u.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (u.binary_ops.hasOwnProperty(e) && (!u.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !u.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
        return this.index += n, e;
      e = e.substr(0, --n);
    }
    return !1;
  }
  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   * @returns {?jsep.BinaryExpression}
   */
  gobbleBinaryExpression() {
    let e, n, o, r, l, i, s, a, d;
    if (i = this.gobbleToken(), !i || (n = this.gobbleBinaryOp(), !n))
      return i;
    for (l = { value: n, prec: u.binaryPrecedence(n), right_a: u.right_associative.has(n) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + n), r = [i, l, s]; n = this.gobbleBinaryOp(); ) {
      if (o = u.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      l = { value: n, prec: o, right_a: u.right_associative.has(n) }, d = n;
      const b = (h) => l.right_a && h.right_a ? o > h.prec : o <= h.prec;
      for (; r.length > 2 && b(r[r.length - 2]); )
        s = r.pop(), n = r.pop().value, i = r.pop(), e = {
          type: u.BINARY_EXP,
          operator: n,
          left: i,
          right: s
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + d), r.push(l, e);
    }
    for (a = r.length - 1, e = r[a]; a > 1; )
      e = {
        type: u.BINARY_EXP,
        operator: r[a - 1].value,
        left: r[a - 2],
        right: e
      }, a -= 2;
    return e;
  }
  /**
   * An individual part of a binary expression:
   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
   * @returns {boolean|jsep.Expression}
   */
  gobbleToken() {
    let e, n, o, r;
    if (this.gobbleSpaces(), r = this.searchHook("gobble-token"), r)
      return this.runHook("after-token", r);
    if (e = this.code, u.isDecimalDigit(e) || e === u.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === u.SQUOTE_CODE || e === u.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === u.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, u.max_unop_len), o = n.length; o > 0; ) {
        if (u.unary_ops.hasOwnProperty(n) && (!u.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !u.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: u.UNARY_EXP,
            operator: n,
            argument: l,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      u.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), u.literals.hasOwnProperty(r.name) ? r = {
        type: u.LITERAL,
        value: u.literals[r.name],
        raw: r.name
      } : r.name === u.this_str && (r = { type: u.THIS_EXP })) : e === u.OPAREN_CODE && (r = this.gobbleGroup());
    }
    return r ? (r = this.gobbleTokenProperty(r), this.runHook("after-token", r)) : this.runHook("after-token", !1);
  }
  /**
   * Gobble properties of of identifiers/strings/arrays/groups.
   * e.g. `foo`, `bar.baz`, `foo['bar'].baz`
   * It also gobbles function calls:
   * e.g. `Math.acos(obj.angle)`
   * @param {jsep.Expression} node
   * @returns {jsep.Expression}
   */
  gobbleTokenProperty(e) {
    this.gobbleSpaces();
    let n = this.code;
    for (; n === u.PERIOD_CODE || n === u.OBRACK_CODE || n === u.OPAREN_CODE || n === u.QUMARK_CODE; ) {
      let o;
      if (n === u.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== u.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === u.OBRACK_CODE ? (e = {
        type: u.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== u.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === u.OPAREN_CODE ? e = {
        type: u.CALL_EXP,
        arguments: this.gobbleArguments(u.CPAREN_CODE),
        callee: e
      } : (n === u.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: u.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), o && (e.optional = !0), this.gobbleSpaces(), n = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", n, o;
    for (; u.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === u.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); u.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); u.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      u.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, u.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === u.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === u.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: u.LITERAL,
      value: parseFloat(e),
      raw: e
    };
  }
  /**
   * Parses a string literal, staring with single or double quotes with basic support for escape codes
   * e.g. `"hello world"`, `'this is\nJSEP'`
   * @returns {jsep.Literal}
   */
  gobbleStringLiteral() {
    let e = "";
    const n = this.index, o = this.expr.charAt(this.index++);
    let r = !1;
    for (; this.index < this.expr.length; ) {
      let l = this.expr.charAt(this.index++);
      if (l === o) {
        r = !0;
        break;
      } else if (l === "\\")
        switch (l = this.expr.charAt(this.index++), l) {
          case "n":
            e += `
`;
            break;
          case "r":
            e += "\r";
            break;
          case "t":
            e += "	";
            break;
          case "b":
            e += "\b";
            break;
          case "f":
            e += "\f";
            break;
          case "v":
            e += "\v";
            break;
          default:
            e += l;
        }
      else
        e += l;
    }
    return r || this.throwError('Unclosed quote after "' + e + '"'), {
      type: u.LITERAL,
      value: e,
      raw: this.expr.substring(n, this.index)
    };
  }
  /**
   * Gobbles only identifiers
   * e.g.: `foo`, `_value`, `$x1`
   * Also, this function checks if that identifier is a literal:
   * (e.g. `true`, `false`, `null`) or `this`
   * @returns {jsep.Identifier}
   */
  gobbleIdentifier() {
    let e = this.code, n = this.index;
    for (u.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, u.isIdentifierPart(e)); )
      this.index++;
    return {
      type: u.IDENTIFIER,
      name: this.expr.slice(n, this.index)
    };
  }
  /**
   * Gobbles a list of arguments within the context of a function call
   * or array literal. This function also assumes that the opening character
   * `(` or `[` has already been gobbled, and gobbles expressions and commas
   * until the terminator character `)` or `]` is encountered.
   * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
   * @param {number} termination
   * @returns {jsep.Expression[]}
   */
  gobbleArguments(e) {
    const n = [];
    let o = !1, r = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let l = this.code;
      if (l === e) {
        o = !0, this.index++, e === u.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === u.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === u.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === u.CBRACK_CODE)
            for (let i = n.length; i < r; i++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const i = this.gobbleExpression();
        (!i || i.type === u.COMPOUND) && this.throwError("Expected comma"), n.push(i);
      }
    }
    return o || this.throwError("Expected " + String.fromCharCode(e)), n;
  }
  /**
   * Responsible for parsing a group of things within parentheses `()`
   * that have no identifier in front (so not a function call)
   * This function assumes that it needs to gobble the opening parenthesis
   * and then tries to gobble everything within that parenthesis, assuming
   * that the next thing it should see is the close parenthesis. If not,
   * then the expression probably doesn't have a `)`
   * @returns {boolean|jsep.Expression}
   */
  gobbleGroup() {
    this.index++;
    let e = this.gobbleExpressions(u.CPAREN_CODE);
    if (this.code === u.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: u.SEQUENCE_EXP,
        expressions: e
      } : !1;
    this.throwError("Unclosed (");
  }
  /**
   * Responsible for parsing Array literals `[1, 2, 3]`
   * This function assumes that it needs to gobble the opening bracket
   * and then tries to gobble the expressions as arguments.
   * @returns {jsep.ArrayExpression}
   */
  gobbleArray() {
    return this.index++, {
      type: u.ARRAY_EXP,
      elements: this.gobbleArguments(u.CBRACK_CODE)
    };
  }
}
const ot = new rt();
Object.assign(u, {
  hooks: ot,
  plugins: new it(u),
  // Node Types
  // ----------
  // This is the full set of types that any JSEP node can be.
  // Store them here to save space when minified
  COMPOUND: "Compound",
  SEQUENCE_EXP: "SequenceExpression",
  IDENTIFIER: "Identifier",
  MEMBER_EXP: "MemberExpression",
  LITERAL: "Literal",
  THIS_EXP: "ThisExpression",
  CALL_EXP: "CallExpression",
  UNARY_EXP: "UnaryExpression",
  BINARY_EXP: "BinaryExpression",
  ARRAY_EXP: "ArrayExpression",
  TAB_CODE: 9,
  LF_CODE: 10,
  CR_CODE: 13,
  SPACE_CODE: 32,
  PERIOD_CODE: 46,
  // '.'
  COMMA_CODE: 44,
  // ','
  SQUOTE_CODE: 39,
  // single quote
  DQUOTE_CODE: 34,
  // double quotes
  OPAREN_CODE: 40,
  // (
  CPAREN_CODE: 41,
  // )
  OBRACK_CODE: 91,
  // [
  CBRACK_CODE: 93,
  // ]
  QUMARK_CODE: 63,
  // ?
  SEMCOL_CODE: 59,
  // ;
  COLON_CODE: 58,
  // :
  // Operations
  // ----------
  // Use a quickly-accessible map to store all of the unary operators
  // Values are set to `1` (it really doesn't matter)
  unary_ops: {
    "-": 1,
    "!": 1,
    "~": 1,
    "+": 1
  },
  // Also use a map for the binary operations but set their values to their
  // binary precedence for quick reference (higher number = higher precedence)
  // see [Order of operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
  binary_ops: {
    "||": 1,
    "??": 1,
    "&&": 2,
    "|": 3,
    "^": 4,
    "&": 5,
    "==": 6,
    "!=": 6,
    "===": 6,
    "!==": 6,
    "<": 7,
    ">": 7,
    "<=": 7,
    ">=": 7,
    "<<": 8,
    ">>": 8,
    ">>>": 8,
    "+": 9,
    "-": 9,
    "*": 10,
    "/": 10,
    "%": 10,
    "**": 11
  },
  // sets specific binary_ops as right-associative
  right_associative: /* @__PURE__ */ new Set(["**"]),
  // Additional valid identifier chars, apart from a-z, A-Z and 0-9 (except on the starting char)
  additional_identifier_chars: /* @__PURE__ */ new Set(["$", "_"]),
  // Literals
  // ----------
  // Store the values to return for the various literals we may encounter
  literals: {
    true: !0,
    false: !1,
    null: null
  },
  // Except for `this`, which is special. This could be changed to something like `'self'` as well
  this_str: "this"
});
u.max_unop_len = u.getMaxKeyLen(u.unary_ops);
u.max_binop_len = u.getMaxKeyLen(u.binary_ops);
const te = (t) => new u(t).parse(), st = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(u).filter((t) => !st.includes(t) && te[t] === void 0).forEach((t) => {
  te[t] = u[t];
});
te.Jsep = u;
const at = "ConditionalExpression";
var ct = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: at,
            test: o,
            consequent: r,
            alternate: l
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let i = o;
            for (; i.right.operator && t.binary_ops[i.right.operator] <= 0.9; )
              i = i.right;
            n.node.test = i.right, i.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
te.plugins.register(ct);
const lt = "ConditionalExpression";
var dt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: lt,
            test: o,
            consequent: r,
            alternate: l
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let i = o;
            for (; i.right.operator && t.binary_ops[i.right.operator] <= 0.9; )
              i = i.right;
            n.node.test = i.right, i.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
te.plugins.register(dt);
const ut = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Oe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, _ = (t) => Number(t) > 0.5;
function se(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (a) => {
      if (a[0] === '"' || a[0] === "'") return a;
      const [, d, b, h] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(a), m = b.toLowerCase(), y = m.startsWith("meg") ? 1e6 : m.startsWith("mil") ? 254e-7 : ut[m[0]] || 1;
      return "(" + (h ? +(d + (d.includes(".") ? "" : ".") + h) : Number(d)) * y + ")";
    }), l(te(s));
  }
  function l(s) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const a = s.name.toLowerCase();
      if (a === "pi") return Math.PI;
      if (a === "e") return Math.E;
      if (!Object.hasOwn(e, a)) throw Error("Undefined structural parameter: " + s.name);
      if (n.has(a)) throw Error("Circular structural parameter: " + a);
      n.add(a);
      const d = r(e[a]);
      return n.delete(a), d;
    }
    if (s.type === "ConditionalExpression") return _(l(s.test)) ? l(s.consequent) : l(s.alternate);
    if (s.type === "UnaryExpression") {
      const a = l(s.argument);
      if (s.operator === "-") return -a;
      if (s.operator === "+") return +a;
      if (s.operator === "!" || s.operator === "~") return !_(a);
    }
    if (s.type === "BinaryExpression") {
      const a = l(s.left);
      if (s.operator === "&&") return _(a) && _(l(s.right));
      if (s.operator === "||") return _(a) || _(l(s.right));
      const d = l(s.right);
      switch (s.operator) {
        case "+":
          return a + d;
        case "-":
          return a - d;
        case "*":
          return a * d;
        case "/":
          return a / d;
        case "**":
          return a ** d;
        case "%":
          return a % d;
        case "^":
          return _(a) !== _(d);
        case "&":
          return _(a) && _(d);
        case "|":
          return _(a) || _(d);
        case ">":
          return a > d;
        case "<":
          return a < d;
        case ">=":
          return a >= d;
        case "<=":
          return a <= d;
        case "==":
        case "===":
          return a === d;
        case "!=":
        case "!==":
          return a !== d;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const a = s.callee.name.toLowerCase();
      if (a === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return _(l(s.arguments[0])) ? l(s.arguments[1]) : l(s.arguments[2]);
      }
      if (Object.hasOwn(Oe, a)) return Oe[a](...s.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const i = r(t);
  if (typeof i == "number" && !Number.isFinite(i)) throw Error("Structural expression is not finite.");
  return i;
}
function ft(t) {
  et(t);
  const e = j(), n = /* @__PURE__ */ new Map();
  let o = 0, r = 0;
  function l(i, s, a, d, b, h, m) {
    if (s.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const y = t.scopes[i], L = s.length ? J(s.slice(0, -1), s.at(-1)) : "", S = j();
    if (m.some((f) => f.scopeId === i)) throw Error("Circular subcircuit reference at " + L);
    const E = nt(d, y.defaults, y.parameters, b);
    function c(f) {
      if (/^\{[\s\S]*\}$/.test(f)) {
        const v = se(f, E);
        f = String(typeof v == "boolean" ? Number(v) : v);
      }
      /^"[\s\S]*"$/.test(f) && (f = f.slice(1, -1));
      const x = f.toLowerCase();
      return Object.hasOwn(a, x) ? a[x] : t.globals.includes(x) ? pe([], x) : S[x] || (S[x] = pe(s, x));
    }
    const p = { id: L, path: s, scopeId: i, name: h?.name || "Top", definition: y.name, ports: y.ports.map((f) => ({ name: f, node: c(f) })), params: E, nodes: S, models: j(), devices: [], children: [], raw: h?.raw || "", line: h?.line || 0 };
    e[L] = p, n.set(L, c);
    const g = [...m, p];
    function O(f) {
      if (!f) return "";
      let x = y;
      for (; x; ) {
        if (x.directives.some((v) => new RegExp("^\\.model\\s+" + f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(v.text))) {
          const v = [...g].reverse().find((A) => A.scopeId === x.id);
          return J(v?.path || [], f.toLowerCase());
        }
        x = t.scopes[x.parent];
      }
      return f;
    }
    for (const f of y.directives.filter((x) => /^\.model\b/i.test(x.text))) {
      const x = /^\.model\s+(\S+)/i.exec(f.text)?.[1];
      if (!x) continue;
      const v = O(x), A = y.models[x.toLowerCase()], B = Ce(f.text, E, c, (T) => J(s, T));
      p.models[v] = { ...A, name: v, raw: B.replace(/^(\.model\s+)\S+/i, (T, P) => P + v), instanceId: L, parameters: E };
    }
    for (const f of y.devices) {
      if (++r > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const x = j();
      for (const [A, B] of Object.entries(f.terminals)) x[A] = c(B);
      const v = O(f.model);
      p.devices.push({ ...f, name: J(s, f.name), localName: f.name, instanceId: L, terminals: x, model: v, parameters: E });
    }
    for (const f of y.instances) {
      let x = f.definitionId;
      if (!x) {
        const T = String(se(f.definitionName, E)).toLowerCase();
        let P = y;
        for (; P && !x; )
          x = P.definitions[T], P = t.scopes[P.parent];
        if (!x) throw Error("Undefined selected subcircuit: " + T);
      }
      const v = t.scopes[x], A = j();
      if (v.ports.length !== f.nodes.length) throw Error(f.name + ": expected " + v.ports.length + " ports; got " + f.nodes.length);
      v.ports.forEach((T, P) => {
        A[T.toLowerCase()] = c(f.nodes[P]);
      });
      const B = l(x, [...s, f.name], A, E, f.parameters, f, g);
      f.pinNames?.length === B.ports.length && B.ports.forEach((T, P) => {
        T.label = f.pinNames[P];
      }), p.children.push(B);
    }
    return p;
  }
  try {
    let b = function(h, m) {
      const y = m.split(":");
      if (y.length === 1) return { owner: h, name: m };
      const L = y.pop();
      for (const S of [[...h.path, ...y], y]) {
        const E = s.get(S.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: L };
      }
      throw Error("Unknown hierarchical reference: " + m);
    };
    const i = l(t.rootId, [], j(), j(), j(), null, []), s = new Map(Object.values(e).map((h) => [h.id.toLowerCase(), h])), a = Object.assign(j(), ...Object.values(e).map((h) => h.models)), d = (h) => a[h] || Object.entries(a).find(([m]) => m.startsWith(h + "."))?.[1];
    for (const h of Object.values(e)) for (const m of h.devices) {
      const y = t.scopes[h.scopeId].devices.find((E) => E.name === m.localName), L = (E) => {
        const c = b(h, E);
        return n.get(c.owner.id)(c.name);
      }, S = (E, c = "", p = "") => {
        const g = b(h, E), O = g.owner.devices.find((f) => f.localName.toLowerCase() === g.name.toLowerCase());
        if (c.toLowerCase() === "ix") {
          const f = g.owner.ports.find((x, v) => x.name.toLowerCase() === g.name.toLowerCase() || String(v + 1) === g.name);
          if (f) return g.owner.id + ":" + f.name;
        }
        if (!O) {
          if (p) throw Error(m.name + ": referenced " + p + " device " + E + " was not found.");
          return J(g.owner.path, g.name);
        }
        if (p && O.kind !== p) throw Error(m.name + ": " + E + " must be a " + p + " device.");
        return O.name;
      };
      if (m.value = Ce(y.value, h.params, L, S), y.model && (m.value = m.value.replace(y.model, m.model)), m.kind === "M" && Object.keys(m.terminals).length === 3) {
        let E = d(m.model), c = !1;
        const p = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !p.has(E.name); ) {
          p.add(E.name);
          const g = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (g) {
            c = g[1] === void 0 || Number(se(g[1], E.parameters)) >= 0.5;
            break;
          }
          const O = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = d(O + (E.baseModel || "").toLowerCase()) || d((E.baseModel || "").toLowerCase());
        }
        p.size && (m.type = "spice_" + (c ? "pmos3" : "nmos3"));
      }
      m.controlSources = (y.controlSources || []).map((E) => S(E, "", "V")), m.controlSource = m.controlSources[0] || "", m.coupledInductors = (y.coupledInductors || []).map((E) => S(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...y.controlSources || [], ...y.coupledInductors || []])) {
        const c = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        m.value = m.value.replace(new RegExp("(?<![\\w./%])" + c + "(?![\\w.$])", "g"), () => S(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: i, contexts: e };
  } catch (i) {
    throw i.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: i.message }], i;
  }
}
function ae(t) {
  return [...t.devices, ...t.children.flatMap(ae)];
}
function ve(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const Se = 1;
function fe(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const ke = (t) => ["pwr", "ret", "bias"].includes(t);
function ht(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (i, s, a) => {
    e.has(i) || e.set(i, []), e.get(i).push({ node: s, delta: a });
  };
  for (const i of t)
    if (i.kind === "V")
      try {
        let s = i.value.trim();
        const a = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (a && Number(se(a[1], i.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const d = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!d) continue;
        const b = se(d[1], i.parameters);
        if (typeof b != "number" || !Number.isFinite(b)) continue;
        o(i.terminals["-"], i.terminals["+"], b), o(i.terminals["+"], i.terminals["-"], -b);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const i of ["0", ...e.keys()]) {
    if (l.has(i)) continue;
    const s = /* @__PURE__ */ new Map([[i, 0]]), a = [i];
    l.add(i);
    let d = !1;
    for (let b = 0; b < a.length; b++) for (const h of e.get(a[b]) || []) {
      const m = s.get(a[b]) + h.delta;
      s.has(h.node) ? Math.abs(s.get(h.node) - m) > 1e-8 * Math.max(1, Math.abs(m)) && (d = !0) : (s.set(h.node, m), l.add(h.node), a.push(h.node));
    }
    d && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [b, h] of s) r[b] = { value: h, reference: i, known: i === "0" && !d, consistent: !d };
  }
  return { nodes: r, diagnostics: n };
}
function pt(t, e) {
  const n = ht(ae(t.root)), o = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null);
  for (const i of Object.values(e.nodes)) o[i.name] = { role: fe(i.name), potential: n.nodes[i.name]?.known ? n.nodes[i.name].value : null };
  const l = (i, s, a) => {
    if (i.block) {
      const d = i.block.ports.find((b) => b.pin === s);
      return d?.implicit ? a === "0" ? "ret" : o[a].role : fe(d?.name || d?.label);
    }
    return i.synthetic ? fe(i.value) : o[a].role;
  };
  for (const i of e.components) {
    const s = Object.fromEntries(Object.entries(i.terminals).map(([S, E]) => [S, { ...o[E], role: l(i, S, E) }])), a = Object.values(s), d = ["R", "L", "C", "D"].includes(i.kind) && a.length === 2 && a.every((S) => !ke(S.role) && (S.potential === null || S.role !== "unknown")), b = i.terminals["+"], h = i.terminals["-"], m = [b, h].filter((S) => S && S !== "0"), y = i.kind === "V" && m.some((S) => ke(o[S]?.role)) && !m.some((S) => ["in", "out", "io", "fb"].includes(o[S]?.role)) && [b, h].every((S) => n.nodes[S]?.known), L = b === "0" ? h : b;
    r[i.name] = { version: Se, ports: s, horizontal: d, supply: !!y, voltage: y ? n.nodes[L].value : null };
  }
  return { version: Se, nodes: o, cells: r, diagnostics: n.diagnostics };
}
function De(t, e) {
  const n = e.ports.map((r, l) => ({ pin: "P" + l, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(ae(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const l = pe([], r);
    o.has(l) && !n.some((i) => i.node === l) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: l, implicit: !0 });
  }
  return n;
}
function mt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t.contexts[o];
  if (!r) throw Error("Unknown instance: " + o);
  const l = [], i = [];
  function s(b) {
    i.push(...Object.values(b.nodes), ...b.ports.map((h) => h.node)), l.push(...b.devices.map((h) => ({ ...h, layoutLabel: [...b.path.slice(r.path.length), h.localName].join("/") })));
    for (const h of b.children) {
      if (e === "flat" || n.has(h.id)) {
        s(h);
        continue;
      }
      const m = De(t, h), y = j();
      m.forEach((L) => {
        y[L.pin] = L.node;
      }), l.push({ name: h.id, kind: "X", type: "spice_subckt", terminals: y, value: h.definition, raw: h.raw, line: h.line, instanceId: h.id, layoutLabel: h.path.slice(r.path.length).join("/"), block: { definitionId: h.scopeId, ports: m, parameters: h.params } });
    }
  }
  s(r);
  for (const [b, h] of r.ports.entries()) l.push({ name: "@port/" + o + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (l.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const a = Object.assign(j(), ...Object.values(t.contexts).map((b) => b.models)), d = { title: o || t.ir.title, components: l, nodes: Je(l, i), models: a, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  return d.topology = gt(t, d), d.layout = pt(t, d), d;
}
function gt(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const i of e.components)
    if (!i.synthetic)
      if (i.kind === "X") {
        const s = t.contexts[i.instanceId];
        if (!s) throw Error("Projection contains an unknown block.");
        const a = De(t, s);
        if (JSON.stringify(Object.entries(i.terminals)) !== JSON.stringify(a.map((d) => [d.pin, d.node]))) throw Error("Block interface topology mismatch: " + i.name);
        n.push(...ae(s));
      } else n.push(i);
  for (const i of n) {
    if (o.has(i.name)) throw Error("Projection duplicates " + i.name);
    o.add(i.name);
  }
  const r = ve(n), l = ae(t.contexts[e.focus]);
  if (r !== ve(l)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: r };
}
function bt(t) {
  const e = j(), n = j();
  for (const o of t.components) {
    const r = j(), l = j();
    for (const [i, s] of Object.entries(o.terminals))
      r[i] = [t.nodes[s].bit], l[i] = "input";
    e[o.name] = { type: o.type, port_directions: l, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((i) => ({ pin: i.pin, label: i.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((i, s) => ({ pin: i, label: o.pinLabels?.[s] || i })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n } } };
}
function wt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (l) => (n.has(l) || n.set(l, n.size + 2), n.get(l));
  return Object.entries(t.modules.circuit.cells).forEach(([l, i], s) => {
    const a = "c" + s;
    e.set(a, l);
    const d = Object.fromEntries(Object.entries(i.connections).map(([b, h]) => [b, h.map(r)]));
    o[a] = { type: i.type, connections: d, port_directions: i.port_directions, attributes: { displayRef: i.attributes.displayRef || i.attributes.ref || "", value: i.attributes.value || "", name: i.attributes.name || "" } }, i.spiceBlock && (o[a].spiceBlock = i.spiceBlock), i.spiceSymbol && (o[a].spiceSymbol = i.spiceSymbol), i.spiceLayout && (o[a].spiceLayout = i.spiceLayout);
  }), { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o } } }, ids: e, bits: new Map([...n].map(([l, i]) => [i, l])) };
}
const K = /* @__PURE__ */ new Map();
async function Et(t, e) {
  const n = wt(t), o = JSON.stringify([n.netlist, e]);
  let r = K.get(o);
  r ? (K.delete(o), K.set(o, r)) : (r = await yt(n.netlist, e), r.length < 1e6 && (K.set(o, r), K.size > 20 && K.delete(K.keys().next().value)));
  const l = new DOMParser().parseFromString(r, "image/svg+xml");
  if (l.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const i of l.querySelectorAll("[id],[class]")) {
    const s = i.getAttribute("id");
    s?.startsWith("cell_") && n.ids.has(s.slice(5)) && i.setAttribute("id", "cell_" + n.ids.get(s.slice(5)));
    const a = i.getAttribute("class");
    a && i.setAttribute("class", a.split(/\s+/).map((d) => d.startsWith("cell_") && n.ids.has(d.slice(5)) ? "cell_" + n.ids.get(d.slice(5)) : /^net_\d+$/.test(d) && n.bits.has(Number(d.slice(4))) ? "net_" + n.bits.get(Number(d.slice(4))) : d).join(" "));
  }
  return new XMLSerializer().serializeToString(l.documentElement);
}
function yt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-D09xQDYb.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const l = (a, d) => {
      clearTimeout(s), n.terminate(), a ? r(Error(a)) : o(d);
    }, i = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => l("Layout timed out. Open a subcircuit sheet or collapse instances."), i);
    n.onmessage = ({ data: a }) => l(a.error, a.svg), n.onerror = (a) => l(a.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const xt = `* Mixed RLC, semiconductors and nonlinear / controlled sources
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
`, he = `* RLC low-pass filter
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, Ct = `* Two parameterized channels, each with two nested filter instances
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
`, Ot = `* Viewer grammar coverage: all documented LTspice 24+ element prefixes
.title LTspice element families
V1 in 0 PULSE(0 1 0 1n 1n 1u 2u 4) Rser=0
VSENSE sense 0 0
I1 in 0 PWL(0 0 1u 1m) load
R1 in mid 1k tc=.001
C1 mid 0 Q=100p*x ic=0
LA mid tank Flux=1m*tanh(x)
LB tank 0 2m Rser=0
K1 LA LB .8
D1 mid 0 DD m=2
Q1 in mid 0 QN off
M1 in mid 0 0 MN L=1u W=10u
MPOWER in mid 0 MPWR
J1 in mid 0 JN
Z1 in mid 0 ZN
ZIGBT in mid 0 ZI
E1 ev 0 in mid 2
G1 gi 0 in mid table=(0,0,1,1m)
F1 fi 0 VSENSE 2
H1 hv 0 VSENSE 1k
S1 in sw mid 0 SWMOD off
W1 sw 0 VSENSE CSMOD off
T1 in 0 t 0 ZO=50 TD=1n
O1 t 0 o 0 LTMOD
U1 o u 0 RCMOD L=1
B1 bv 0 V=if(V(mid)>0,tanh(V(mid)),0) tripdv=1m
BR1 mid 0 R=1k+time
BP1 mid 0 P=1m
A1 in mid 0 0 0 inverted logic 0 AND Vhigh=1.8 Td=1n
X1 in x 0 DIVIDER top=1k bot=2k
@1 in mid fstart=10 fend=1Meg refnode=0 intnode=mid
&1 mid 0 in 0
Ö1 ota in 0 mid in Gm1=1m Gm2=0 Ibias=1u
.model DD D(Is=1n)
.model QN NPN(Bf=100)
.model MN NMOS(Vto=1 Kp=1m)
.model MPWR VDMOS(Vto=2 Kp=1)
.model JN NJF(Vto=-2 Beta=1m)
.model ZN NMF(Vto=-1 Beta=1m)
.model ZI NIGBT(Vt=4)
.model SWMOD SW(Ron=1 Roff=1Meg Vt=.5)
.model CSMOD CSW(Ron=1 Roff=1Meg It=1m)
.model LTMOD LTRA(R=1 L=1u G=0 C=10p Len=1)
.model RCMOD URC(Rperl=1k Cperl=1n)
.subckt DIVIDER a b c
Rtop a b {top}
Rbot b c {bot}
.ends DIVIDER
.tran 0 10u
.end
`;
function vt(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Le(t) {
  return vt(await t.arrayBuffer());
}
const C = (t) => document.getElementById("spice-" + t), oe = C("app");
if (oe) {
  let O = function() {
    r = "", p(), n.textContent = "Input changed — generate to refresh the schematic.";
  }, f = function(w) {
    o.replaceChildren();
    for (const { severity: k, line: R, message: M, source: I } of w) {
      const $ = document.createElement("li");
      $.className = k, $.textContent = `${k.toUpperCase()}${I && I !== "input.cir" ? " · " + I : ""}${R ? " · line " + R : ""}: ${M}`, o.append($);
    }
    C("messages").open = w.some((k) => k.severity !== "info"), C("message-count").textContent = `${w.length} message${w.length === 1 ? "" : "s"}`;
  }, x = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${m.x} ${m.y} ${m.w} ${m.h}`), C("zoom-level").textContent = Math.round(y.w / m.w * 100) + "%";
  }, v = function(w, k = m.x + m.w / 2, R = m.y + m.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, m.w * w / y.w)) * y.w / m.w;
    m = { x: k + (m.x - k) * M, y: R + (m.y - R) * M, w: m.w * M, h: m.h * M }, x();
  }, B = function(w) {
    const k = new URLSearchParams();
    w && k.set("instance", w);
    const R = k.toString();
    location.hash.slice(1) === R ? (d = w, N()) : location.hash = R;
  }, T = function() {
    d = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, P = function(w) {
    const k = i.contexts[w].path;
    for (let R = 1; R <= k.length; R++) S.add(k.slice(0, R).map(encodeURIComponent).join("/"));
  }, ne = function() {
    const w = !!(b && b !== d && i?.contexts[b]);
    C("selection-actions").hidden = !w, C("toggle-instance").textContent = S.has(b) ? "Collapse instance" : "Expand instance", C("toggle-instance").disabled = C("mode").value === "flat", C("open-instance").href = "#" + new URLSearchParams({ instance: b });
  }, re = function() {
    C("breadcrumbs").replaceChildren();
    const w = (R, M) => {
      const I = document.createElement("button");
      I.type = "button", I.textContent = R, I.onclick = () => B(M), I.disabled = M === d, C("breadcrumbs").append(I);
    };
    if (w("Top", ""), d) {
      const R = i.contexts[d].path;
      for (let M = 0; M < R.length; M++) w(R[M], R.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    C("instances").replaceChildren();
    const k = (R, M) => {
      for (const I of R.children) {
        const $ = document.createElement("div");
        $.className = "spice-instance-row", $.style.setProperty("--depth", Math.min(M, 8)), $.dataset.instance = I.id;
        const F = document.createElement("button");
        F.type = "button", F.textContent = S.has(I.id) ? "−" : "+", F.title = (S.has(I.id) ? "Collapse " : "Expand ") + I.id, F.setAttribute("aria-label", F.title), F.setAttribute("aria-expanded", String(S.has(I.id))), F.disabled = C("mode").value === "flat", F.onclick = () => {
          S.has(I.id) ? S.delete(I.id) : P(I.id), b = I.id, N();
        };
        const G = document.createElement("a");
        G.href = "#" + new URLSearchParams({ instance: I.id }), G.textContent = I.name + " · " + I.definition, G.title = "Open " + I.id + " as its own sheet";
        const Q = document.createElement("span");
        if (Q.className = "spice-help", Q.textContent = Object.entries(I.params).map(([H, Y]) => H + "=" + Y).join(" · "), $.append(F, G), Q.textContent) {
          const H = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", H.append(Y, Q), $.append(H);
        }
        C("instances").append($), k(I, M + 1);
      }
    };
    k(i.contexts[d], 0), C("hierarchy-panel").hidden = !i.contexts[d].children.length, C("focus-title").textContent = d ? d + " / " + i.contexts[d].definition : "Top-level schematic", ne();
  };
  const t = C("input"), e = C("preview"), n = C("status"), o = C("diagnostics");
  let r = "", l, i, s, a = "", d = "", b = "", h = !1, m = { x: 0, y: 0, w: 1, h: 1 }, y = { ...m }, L;
  const S = /* @__PURE__ */ new Set();
  let E = !1, c = {};
  try {
    c = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  oe.addEventListener("click", (w) => {
    h && w.target.closest('a[href^="#"]') && w.preventDefault();
  });
  const p = () => {
    C("copy").disabled = C("download").disabled = !r || h;
  }, g = () => ({ font: C("font").value, fontSize: Number(C("size").value), color: C("color").value, detailed: C("detailed").checked, conventional: C("conventional").checked });
  t.value = he;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || he;
  } catch {
  }
  t.addEventListener("input", O);
  for (const w of ["font", "size", "color", "detailed", "conventional"]) C(w).addEventListener("input", O);
  C("zoom-in").onclick = () => v(0.8), C("zoom-out").onclick = () => v(1.25), C("fit").onclick = () => {
    m = { ...y }, x();
  };
  const A = (w) => {
    const k = e.querySelector("svg");
    return k ? new DOMPoint(w.clientX, w.clientY).matrixTransform(k.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (w) => {
    const k = A(w);
    k && (w.preventDefault(), v(w.deltaY > 0 ? 1.12 : 1 / 1.12, k.x, k.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (w) => {
    w.button !== 0 || !e.querySelector("svg") || (L = { start: A(w), x: w.clientX, y: w.clientY, view: { ...m }, moved: !1 }, e.setPointerCapture(w.pointerId));
  }), e.addEventListener("pointermove", (w) => {
    if (!L) return;
    const k = A(w);
    Math.hypot(w.clientX - L.x, w.clientY - L.y) > 4 && (L.moved = !0), m.x += L.start.x - k.x, m.y += L.start.y - k.y, x();
  }), e.addEventListener("pointerup", (w) => {
    if (!L) return;
    const k = L.moved;
    if (L = null, e.hasPointerCapture(w.pointerId) && e.releasePointerCapture(w.pointerId), !k) {
      const R = document.elementFromPoint(w.clientX, w.clientY)?.closest("[data-component]"), M = l?.components.find((I) => I.name === R?.dataset.component);
      M && (b = M.instanceId || "", C("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([I, $]) => `${I} → ${$}`).join("   ")}`, M.kind === "X" && C("mode").value === "hierarchical" ? (P(M.instanceId), N()) : ne());
    }
  }), window.addEventListener("hashchange", () => {
    if (h) {
      E = !0;
      return;
    }
    T(), b = "", N();
  }), C("mode").onchange = () => N(), C("collapse-all").onclick = () => {
    S.clear(), N();
  }, C("expand-all").onclick = () => {
    for (const w of Object.keys(i?.contexts || {})) w && S.add(w);
    N();
  }, C("toggle-instance").onclick = () => {
    S.has(b) ? S.delete(b) : P(b), N();
  }, e.addEventListener("pointercancel", () => {
    L = null;
  }), e.addEventListener("keydown", (w) => {
    const k = w.target.closest("[data-instance]");
    if (k && (w.key === "Enter" || w.key === " ")) {
      w.preventDefault(), b = k.dataset.instance, P(b), N();
      return;
    }
    w.key === "+" || w.key === "=" ? v(0.8) : w.key === "-" ? v(1.25) : w.key.toLowerCase() === "f" ? (m = { ...y }, x()) : w.key.startsWith("Arrow") && (w.preventDefault(), m.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[w.key] || 0) * m.w, m.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[w.key] || 0) * m.h, x());
  });
  async function N() {
    if (h) return;
    h = !0, r = "", p(), C("generate").disabled = !0, t.readOnly = !0, C("file").disabled = !0, C("libraries").disabled = !0;
    for (const k of oe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) k.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let w = [];
    try {
      if (a !== t.value || !i) {
        if (s = Ze(t.value, { files: c }), w = [...s.diagnostics], w.some((D) => D.severity === "error"))
          throw i = null, Error("Fix the parser errors below before generating.");
        i = ft(s), a && a !== t.value ? (S.clear(), d = "", b = "", history.replaceState(null, "", location.pathname + location.search)) : T(), a = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (w = [...s.diagnostics], f(w), w.some((D) => D.severity === "error")) throw Error("Fix the parser errors below before generating.");
      l = mt(i, { mode: C("mode").value, expanded: S, focus: d });
      const k = bt(l);
      g().conventional && w.push(...l.layout.diagnostics);
      const R = await Et(k, g()), M = new DOMParser().parseFromString(R, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const I = M.documentElement, $ = I.querySelector("#spice-layout-report");
      if ($) {
        l.layout.report = JSON.parse($.textContent);
        const D = l.layout.report;
        w.push({ severity: "info", message: `Layout: left-to-right signal guide; ${D.powerSourcesChecked} DC/ground symbols checked, ${D.powerOrderViolations} source-column order violation(s). ${D.powerPass}. Global voltage bands are a preference.` }), f(w);
      }
      if (I.localName !== "svg" || I.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const F = Number(I.getAttribute("width")), G = Number(I.getAttribute("height"));
      y = { x: -20, y: -20, w: F + 40, h: G + 40 }, m = { ...y }, I.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`), I.setAttribute("width", String(y.w)), I.setAttribute("height", String(y.h)), I.setAttribute("role", "img"), I.setAttribute("aria-label", l.title || "SPICE schematic"), I.setAttribute("style", "background:white");
      for (const D of l.components) {
        const U = M.getElementById("cell_" + D.name);
        if (!U) throw Error("Renderer omitted component " + D.name);
        U.setAttribute("data-component", D.name), D.kind === "X" && (U.setAttribute("data-instance", D.instanceId), U.setAttribute("role", "button"), U.setAttribute("tabindex", "0"), U.setAttribute("aria-label", "Expand " + D.name));
        const z = M.createElementNS(I.namespaceURI, "title");
        z.textContent = D.raw + `
Resolved: ` + D.value + `
` + Object.entries(D.terminals).map(([q, ie]) => q + ": " + ie).join(", "), U.prepend(z);
      }
      for (const D of Object.values(l.nodes))
        for (const U of I.querySelectorAll(".net_" + D.bit)) {
          U.setAttribute("data-net", D.name);
          const z = M.createElementNS(I.namespaceURI, "title");
          z.textContent = "Node " + D.displayName, U.append(z);
        }
      const Q = l.components.filter((D) => D.kind === "K").map((D) => ({ name: D.name, inductors: D.coupledInductors, value: D.value }));
      if (Q.length) {
        const D = M.createElementNS(I.namespaceURI, "metadata");
        D.setAttribute("id", "spice-magnetic-couplings"), D.textContent = JSON.stringify(Q), I.append(D);
        for (const U of Q) for (const z of U.inductors) {
          const q = M.getElementById("cell_" + z);
          if (!q) continue;
          const ie = M.createElementNS(I.namespaceURI, "circle"), me = [...q.children].find((de) => de.getAttribute("s:pid") === "A"), ge = me?.getAttribute("s:position") === "left";
          for (const [de, Me] of Object.entries({ cx: ge ? 20 : 24, cy: ge ? Number(me.getAttribute("s:y")) - 8 : 38, r: 3, fill: g().color, stroke: "none", "data-coupling": U.name })) ie.setAttribute(de, String(Me));
          const be = M.createElementNS(I.namespaceURI, "title");
          be.textContent = U.name + " · dotted terminal: " + U.inductors.join(", "), ie.append(be), q.append(ie);
        }
      }
      r = new XMLSerializer().serializeToString(I), C("source").value = r, e.replaceChildren(document.importNode(I, !0)), x();
      const H = w.filter((D) => D.severity === "warning").length;
      n.textContent = `${l.components.filter((D) => !D.synthetic).length} components · ${Object.keys(l.nodes).length} nodes · ${l.topology.leafCount} primitive devices verified${H ? " · Review " + H + " warning(s); drawing may be partial." : " · Schematic ready."}`, l.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${l.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`);
      const Y = Object.values(l.nodes).map((D) => {
        const U = document.createElement("tr");
        for (const z of [D.displayName, D.terminals.map((q) => q.component + "." + q.pin).join(", ")]) {
          const q = document.createElement("td");
          q.textContent = z, U.append(q);
        }
        return U;
      });
      C("nets").replaceChildren(...Y), C("json").value = JSON.stringify({ circuit: l, netlist: k, hierarchy: s }, null, 2), C("selection").textContent = "Click a component to inspect its original statement and pin connections.", re();
    } catch (k) {
      if (e.replaceChildren(), r = "", C("source").value = "", C("json").value = "", C("nets").replaceChildren(), C("selection").textContent = "", n.textContent = k.message, !i)
        C("hierarchy-panel").hidden = !0, C("selection-actions").hidden = !0, C("breadcrumbs").replaceChildren();
      else if (!i.contexts[d]) {
        const R = document.createElement("button");
        R.type = "button", R.textContent = "Return to Top", R.onclick = () => B(""), C("breadcrumbs").replaceChildren(R);
      }
      k.diagnostics && (w = k.diagnostics), w.some((R) => R.severity === "error") || w.push({ severity: "error", line: 0, message: k.message }), f(w);
    } finally {
      h = !1, C("generate").disabled = !1, t.readOnly = !1, C("file").disabled = !1, C("libraries").disabled = !1;
      for (const k of oe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) k.disabled = !1;
      i && i.contexts[d] && re(), e.setAttribute("aria-busy", "false"), p(), E && (E = !1, T(), queueMicrotask(N));
    }
  }
  C("generate").onclick = N;
  for (const w of oe.querySelectorAll("[data-example]")) w.onclick = () => {
    t.value = { mixed: xt, filter: he, hierarchy: Ct, ltspice: Ot }[w.dataset.example], O(), N();
  };
  C("file").onchange = async (w) => {
    const k = w.target.files[0];
    if (k) {
      if (k.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Le(k), O(), N();
      } catch (R) {
        n.textContent = "File could not be read: " + R.message;
      } finally {
        w.target.value = "";
      }
    }
  }, C("libraries").onchange = async (w) => {
    try {
      for (const k of w.target.files) {
        if (k.size > 16e6) throw Error("Library exceeds 16 MB: " + k.name);
        c[k.webkitRelativePath || k.name] = await Le(k);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(c));
      } catch {
      }
      i = null, a = "", C("library-status").textContent = Object.keys(c).length + " library file(s) loaded", N();
    } catch (k) {
      n.textContent = k.message;
    } finally {
      w.target.value = "";
    }
  }, C("library-status").textContent = Object.keys(c).length ? "Libraries restored from this session." : "For .include / .lib dependencies", C("download").onclick = () => {
    const w = URL.createObjectURL(new Blob([r], { type: "image/svg+xml;charset=utf-8" })), k = document.createElement("a");
    k.href = w, k.download = "spice-schematic.svg", k.click(), setTimeout(() => URL.revokeObjectURL(w), 1e3);
  }, C("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(r), n.textContent = "SVG source copied to clipboard.";
    } catch {
      C("source-details").open = !0, C("source").focus(), C("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, N();
}
