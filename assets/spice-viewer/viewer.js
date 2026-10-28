const Ne = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Pe = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, je = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Te = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Ue = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Be = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, _e = { 1: "a", 2: "b", 7: "Q", 8: "com" }, $e = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ve = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, qe = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Xe = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, ze = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, He = {
  AND: Ne,
  BUF: Pe,
  COUNTER: je,
  DFLOP: Te,
  SCHMITT: Ue,
  OR: Be,
  PHASEDET: _e,
  SRFLOP: $e,
  XOR: Ve,
  MODULATOR: Fe,
  OTA: qe,
  SAMPLEHOLD: Xe,
  VARISTOR: ze
}, Ge = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Z = (t) => t.toLowerCase(), Ee = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Qe = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Ke(t, e) {
  const n = (w) => e[Z(w || "")] || Object.entries(e).find(([c]) => c.startsWith(Z(w || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let i = [], d = [], r = "", s = "", a = [], l = [], b = 0, g = "", p = "", E = "", k = !0;
  if ("RLC".includes(o))
    i = ["A", "B"], s = Z(o) + "_v";
  else if ("DVIB".includes(o))
    i = ["+", "-"], s = o === "D" ? "d_v" : o === "B" ? "spice_b" : Z(o);
  else if (o === "Q") {
    i = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Ee(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && i.push("S"), r = t[i.length + 1] || "";
    const w = n(r)?.type;
    k = ["NPN", "PNP"].includes(w), s = k ? (i.length === 3 ? "q_" : "spice_q4_") + Z(w) : "spice_q" + i.length;
  } else if (o === "M") {
    const w = n(t[4]), c = n(t[5]), m = w?.type === "VDMOS" || !c && (!t[5] || Ee(t[5]));
    i = m ? ["D", "G", "S"] : ["D", "G", "S", "B"], r = t[i.length + 1] || "";
    const f = n(r), C = f?.type;
    if (m && f && C !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!m && C === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    k = ["NMOS", "PMOS", "VDMOS"].includes(C);
    let h = null, x = f;
    const v = /* @__PURE__ */ new Set();
    for (; x && !v.has(x.name) && (v.add(x.name), h = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !h); )
      x = n(x.baseModel);
    const M = C === "PMOS" || C === "VDMOS" && h && (h[1] === void 0 || Number(h[1]) >= 0.5);
    s = k ? "spice_" + (M ? "pmos" : "nmos") + (m ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    r = t[4] || "";
    const w = n(r)?.type, c = o === "Z" && ["NIGBT", "PIGBT"].includes(w);
    i = c ? ["C", "G", "E"] : ["D", "G", "S"], k = o === "J" ? ["NJF", "PJF"].includes(w) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(w), s = "spice_" + (c ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(w || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    i = ["+", "-"], s = "spice_" + Z(o);
    let w = 3, c = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[w] || "");
    if (/^poly$/i.test(t[w] || "") && (c = /^\(\s*(\d+)\s*\)$/.exec(t[++w] || ""), !c))
      throw Error("POLY requires a dimension.");
    if (c) {
      const m = Number(c[1]);
      if (m > 128) throw Error("POLY supports at most 128 controlling variables.");
      let f = w + 1, C = [];
      const h = "EG".includes(o), x = m * (h ? 2 : 1);
      for (; C.length < x && f < t.length; ) C.push(...Qe(t[f++]));
      if (C.length !== x || f >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (h) {
        for (let v = 0; v < m; v++) i.push("C" + (v + 1) + "+", "C" + (v + 1) + "-");
        d = [t[1], t[2], ...C];
      } else a = C;
      b = f, g = "POLY(" + m + ") " + (h ? "" : C.join(" ") + " "), p = "POLY", h && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(o) ? (i.push("C+", "C-"), p = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (a = [t[3]], b = 4, g = t[3] + " ");
    E = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (p ? " · " + p : "");
  } else if (o === "S")
    i = ["A", "B", "C+", "C-"], r = t[5] || "", s = "spice_device", E = "Voltage switch";
  else if (o === "W")
    i = ["A", "B"], a = [t[3]], r = t[4] || "", b = 3, s = "spice_device", E = "Current switch";
  else if ("TO".includes(o))
    i = ["L+", "L-", "R+", "R-"], o === "O" && (r = t[5] || ""), s = "spice_device", E = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    i = ["N1", "N2", "COM"], r = t[4] || "", s = "spice_device", E = "Distributed RC";
  else if (o === "A")
    i = Array.from({ length: 8 }, (w, c) => "P" + (c + 1)), s = "spice_device", E = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (l = t.slice(1, -1), l.some((w) => !/^L/i.test(w.split(":").at(-1)))) throw Error("K references must name inductors.");
    b = t.length - 1, s = "spice_coupling", E = "Magnetic coupling", g = l.join(" ") + " · k=";
  } else if (o === "@")
    i = ["IN", "OUT"], s = "spice_device", E = "FRA";
  else if (o === "&")
    i = ["O+", "O-", "I+", "I-"], s = "spice_device", E = "FRA probe";
  else if (o === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", E = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (b || (b = i.length + 1), d.length || (d = t.slice(1, i.length + 1)), d.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (t.length <= b && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (d.some((w) => /[=()]/.test(w) && !/^\{[\s\S]*\}$/.test(w))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(b).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(b).join(" ")) && (s = "spice_br"), o === "D" && (r = t[3] || ""), o === "@") {
    const w = t.slice(b).join(" ");
    for (const c of w.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(c[1].toUpperCase()), d.push(c[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (a.some((w) => !w)) throw Error("Missing controlling voltage source.");
  const I = i.map((w, c) => o === "A" && He[(t[9] || "").toUpperCase()]?.[String(c + 1)] || w);
  return { kind: o, pins: i, nodeTokens: d, pinLabels: I, model: r, type: s, controlSource: a[0] || "", controlSources: a, coupledInductors: l, value: g + t.slice(b).join(" "), sourceMode: p, symbol: E, polarityKnown: k };
}
const We = Ge, Ye = new Set(We.split(" ")), he = () => /* @__PURE__ */ Object.create(null), q = (t) => t.toLowerCase();
function le(t) {
  const e = [], n = [];
  let o = "", i = 0, d = "";
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    if (d) {
      o += s, s === d && t[r - 1] !== "\\" && (d = "");
      continue;
    }
    if (s === '"' || s === "'") {
      d = s, o += s;
      continue;
    }
    if (!i && (s === ";" || s === "$" && (!r || /\s/.test(t[r - 1])))) break;
    if ("({".includes(s) && (n.push(s), i++), ")}".includes(s) && (i--, n.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !i ? (o && e.push(o), o = "") : o += s;
  }
  if (i || d) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Ze(t, e = {}) {
  const n = [], o = [], i = [], d = Object.assign(he(), e.models), r = he(), s = (c, m, f) => n.push({ severity: c, line: m, message: f });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const a = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((c, m) => {
    const f = c.trim();
    !f || f.startsWith("*") || (f.startsWith("+") ? a.length ? a.at(-1).text += " " + f.slice(1).trim() : s("error", m + 1, "Continuation has no preceding statement.") : a.push({ line: m + 1, text: f }));
  });
  for (const c of a) {
    try {
      c.tokens = le(c.text);
    } catch (f) {
      s("error", c.line, f.message), c.tokens = [];
    }
    const m = c.tokens;
    if (/^\.model$/i.test(m[0] || ""))
      if (m.length < 3) s("error", c.line, ".model requires a name and device type.");
      else {
        const f = /^ako:(.+)$/i.exec(m[2]), C = f && m[3] && !m[3].startsWith("(") ? m[3].split("(")[0].toUpperCase() : "";
        d[q(m[1])] = { name: m[1], type: f ? C : m[2].split("(")[0].toUpperCase(), baseModel: f?.[1] || "", raw: c.text };
      }
  }
  const l = /* @__PURE__ */ new Set();
  function b(c) {
    const m = d[q(c)];
    if (!m) return "";
    if (m.type) return m.type;
    if (l.has(q(c))) throw Error("Circular AKO model inheritance: " + c);
    return l.add(q(c)), m.type = b(m.baseModel), l.delete(q(c)), m.type;
  }
  for (const c of Object.values(d)) if (c.baseModel && !c.type)
    try {
      b(c.name);
    } catch (m) {
      s("error", 0, m.message);
    }
  let g = "", p = 0, E = !1, k = !1;
  const I = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: c, text: m, tokens: f } of a) {
    if (!f.length) continue;
    const C = q(f[0]);
    if (k) {
      s("warning", c, "Statement after .end is not rendered: " + m);
      continue;
    }
    if (C === ".control") {
      E = !0, s("warning", c, ".control script retained but not executed or rendered.");
      continue;
    }
    if (C === ".endc") {
      E = !1;
      continue;
    }
    if (E) continue;
    if (C === ".subckt") {
      p++, s("error", c, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (C === ".ends") {
      p ? p-- : s("error", c, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (C === ".end") {
      k = !0;
      continue;
    }
    if (C.startsWith(".")) {
      o.push({ line: c, text: m }), C === ".title" ? g = f.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(C) ? s("error", c, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(C) ? s("error", c, "Topology-changing directive is unsupported: " + m) : w.has(C) || s("warning", c, "Directive retained but not resolved: " + m);
      continue;
    }
    const h = f[0][0].toUpperCase();
    if (!Ye.has(h)) {
      c === 1 && !/\d/.test(f[0]) && f.length > 1 && h !== "X" ? (g = m, s("warning", c, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", c, `Unsupported ${h} device was not rendered: ${m}`);
      continue;
    }
    const x = h === "M" || h === "Q" ? 5 : 4;
    if (c === 1 && !/\d/.test(f[0]) && (f.length < x || h === "T" && !/\b(?:zo|z0)\s*=/i.test(m))) {
      g = m, s("info", c, "SPICE title: " + m);
      continue;
    }
    try {
      if (I.has(C)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const v = Ke(f, d), { pins: M, nodeTokens: B, ...T } = v;
      v.polarityKnown || s("warning", c, `${f[0]}: model polarity unknown; explicit ${M.join("/")} terminals retained.`);
      const N = he();
      M.forEach((ne, re) => {
        const P = q(B[re]);
        r[P] || (r[P] = { name: P, displayName: f[re + 1], bit: Object.keys(r).length + 2, terminals: [] }), r[P].terminals.push({ component: f[0], pin: ne }), N[ne] = P;
      }), i.push({ ...T, name: f[0], terminals: N, line: c, raw: m }), I.add(C);
    } catch (v) {
      s("error", c, `${f[0]}: ${v.message} Statement: ${m}`);
    }
  }
  p && s("error", 0, "Unclosed .subckt definition."), E && s("error", 0, "Unclosed .control block."), i.length || s("error", 0, "No supported components to render."), i.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const c of i) {
    for (const m of c.controlSources || []) !m.includes(":") && !i.some((f) => q(f.name) === q(m) && f.kind === "V") && s("error", c.line, `${c.name}: controlling voltage source ${m} was not found.`);
    for (const m of c.coupledInductors || []) !m.includes(":") && !i.some((f) => q(f.name) === q(m) && f.kind === "L") && s("error", c.line, `${c.name}: coupled inductor ${m} was not found.`);
    (c.kind === "B" || c.type === "spice_b") && s("info", c.line, `${c.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: g, components: i, nodes: r, models: d, directives: o, diagnostics: n };
}
const K = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), ye = (t) => K(t).split("/").at(-1);
function Je(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), i = [], d = [], r = [];
  let s = 0;
  const a = (b, g) => {
    const p = K(g).split("/").slice(0, -1).concat(K(b)).join("/"), E = [...o].filter(([I]) => K(I) === K(b) || K(I) === p);
    if (E.length === 1) return E[0];
    const k = [...o].filter(([I]) => ye(I) === ye(b));
    if (k.length !== 1) throw Error(k.length ? "Ambiguous library filename: " + b : "Missing library " + b + ". Add this file using Library files.");
    return k[0];
  };
  function l(b, g, p = "", E = []) {
    const k = K(g) + ":" + p.toLowerCase();
    if (E.includes(k)) throw Error("Circular library include: " + [...E, k].join(" → "));
    if (E.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const I = [], w = /^\s*\.endl\b/im.test(b);
    let c = !p;
    const m = (C, h) => {
      if (s += C.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      r.push(C), d.push({ file: g, line: h + 1 });
    };
    if (b.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((C, h) => {
      const x = C.trim();
      if (/^\.lib\b/i.test(x) && w) {
        const v = le(x);
        if (v.length === 2 && !/[.\\/]/.test(v[1])) {
          I.push(v[1].toLowerCase()), v[1].toLowerCase() === p.toLowerCase() && (c = !0), m("* Library section " + v[1], h);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        I.pop(), m("* End library section", h);
        return;
      }
      if (p && I.length && !I.includes(p.toLowerCase())) {
        m("* Unselected library section", h);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const v = le(x);
          if (!v[1]) throw Error("Include requires a filename.");
          const [M, B] = a(v[1], g);
          m("* Included " + M, h), l(B, M, v[2] || "", [...E, k]);
        } catch (v) {
          i.push({ severity: "error", line: h + 1, source: g, message: v.message }), m("* Unresolved include", h);
        }
      else m(C, h);
    }), !c) throw Error("Library section " + p + " not found in " + g);
  }
  try {
    l(t, n);
  } catch (b) {
    i.push({ severity: "error", line: 0, source: n, message: b.message });
  }
  return { source: r.join(`
`), origins: d, diagnostics: i };
}
const ee = () => /* @__PURE__ */ Object.create(null), V = (t) => t.toLowerCase();
function Ie(t) {
  const e = ee();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!i) throw Error("Expected named parameter assignment, got: " + o);
    const d = V(i[1]);
    let r = i[2];
    if (r === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!s) throw Error("Expected = after parameter " + d);
      r = s[1];
    }
    if (r || (r = t[++n]), !r || /^params?:$/i.test(r)) throw Error("Missing value for parameter " + d);
    if (Object.hasOwn(e, d)) throw Error("Duplicate parameter: " + d);
    e[d] = r;
  }
  return e;
}
function xe(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ee()] : [t.slice(0, e), Ie(t.slice(e))];
}
function et(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Je(t, e);
  t = n.source;
  const o = [...n.diagnostics], i = ee(), d = /* @__PURE__ */ new Set(["0"]), r = (c, m, f) => o.push({ severity: c, line: m, message: f }), s = (c, m, f, C = [], h = ee(), x = 0) => {
    const v = { id: c, name: m, parent: f, ports: C, defaults: h, parameters: ee(), definitions: ee(), devices: [], instances: [], directives: [], line: x, statements: [] };
    return i[c] = v, v;
  }, a = s("root", "Top", null), l = [a], b = [];
  let g = !1, p = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((c, m) => {
    const f = c.trim();
    !f || f.startsWith("*") || (f.startsWith("+") ? b.length ? b.at(-1).text += " " + f.slice(1).trim() : r("error", m + 1, "Continuation has no preceding statement.") : b.push({ text: f, line: m + 1 }));
  });
  for (const { text: c, line: m } of b)
    try {
      const f = le(c);
      if (!f.length) continue;
      const C = V(f[0]), h = l.at(-1);
      if (p) {
        r("warning", m, "Statement after .end is not rendered: " + c);
        continue;
      }
      if (C === ".control") {
        g = !0, r("warning", m, ".control script retained but not executed or rendered.");
        continue;
      }
      if (C === ".endc") {
        g = !1;
        continue;
      }
      if (g) continue;
      if (C === ".subckt") {
        if (f.length < 2) throw Error(".SUBCKT requires a name.");
        const [x, v] = xe(f.slice(2)), M = V(f[1]);
        if (Object.hasOwn(h.definitions, M)) throw Error("Duplicate subcircuit definition: " + f[1]);
        const B = x.map(V);
        if (new Set(B).size !== x.length || B.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (x.some((N) => /[{}()=]/.test(N))) throw Error("Invalid formal port.");
        if (l.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const T = h.id + "/" + encodeURIComponent(M);
        h.definitions[M] = T, l.push(s(T, f[1], h.id, x, v, m));
        continue;
      }
      if (C === ".ends") {
        if (l.length === 1) throw Error("Unmatched .ENDS.");
        if (f[1] && V(f[1]) !== V(h.name)) throw Error(".ENDS name does not match " + h.name);
        l.pop();
        continue;
      }
      if (C === ".end") {
        if (l.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        p = !0;
        continue;
      }
      if (C === ".param") {
        const x = Ie(f.slice(1));
        for (const [v, M] of Object.entries(x)) {
          if (Object.hasOwn(h.parameters, v)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + v);
          h.parameters[v] = M;
        }
      }
      if (C === ".global") {
        if (f.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const x of f.slice(1)) d.add(V(x));
      }
      if (C.startsWith(".") && h.directives.push({ line: m, text: c }), C.startsWith("x")) {
        const [x, v] = xe(f.slice(1));
        if (!x.length) throw Error("X instance requires a subcircuit name.");
        const M = /;§pnba\s+(.+)$/i.exec(c)?.[1].split(")");
        h.instances.push({ name: f[0], nodes: x.slice(0, -1).map(V), definitionName: x.at(-1), definitionId: null, parameters: v, line: m, raw: c, pinNames: M });
      } else h.statements.push({ line: m, text: c });
    } catch (f) {
      r("error", m, f.message + " Statement: " + c);
    }
  l.length > 1 && r("error", l.at(-1).line, "Unclosed .SUBCKT " + l.at(-1).name), g && r("error", 0, "Unclosed .control block.");
  function E(c, m) {
    for (; c; ) {
      if (Object.hasOwn(c.definitions, V(m))) return c.definitions[V(m)];
      c = i[c.parent];
    }
    return null;
  }
  for (const c of Object.values(i)) {
    const m = [...c.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...c.statements], f = Ze(m.map((h) => h.text).join(`
`), { models: i[c.parent]?.models });
    c.devices = f.components.map((h) => ({ ...h, line: m[h.line - 1]?.line || c.line })), c.models = f.models, c === a && (a.title = f.title), o.push(...f.diagnostics.filter((h) => !h.message.includes("No supported components to render.") && !h.message.includes("300 components")).map((h) => ({ ...h, line: m[h.line - 1]?.line || c.line })));
    const C = new Set(c.devices.map((h) => V(h.name)));
    for (const h of c.instances)
      if (C.has(V(h.name)) && r("error", h.line, "Duplicate instance/device name: " + h.name), C.add(V(h.name)), h.definitionId = E(c, h.definitionName), !h.definitionId && !/^\{[\s\S]*\}$/.test(h.definitionName)) r("error", h.line, "Undefined subcircuit: " + h.definitionName + " in " + h.name);
      else if (h.definitionId) {
        const x = i[h.definitionId];
        x.ports.length !== h.nodes.length && r("error", h.line, `${h.name}: ${x.name} expects ${x.ports.length} ports; got ${h.nodes.length}.`);
      }
  }
  for (const c of Object.values(i)) delete c.statements;
  const k = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function w(c, m = []) {
    if (k.has(c)) {
      r("error", i[c].line, "Circular subcircuit reference: " + [...m, i[c].name].join(" → "));
      return;
    }
    if (!I.has(c)) {
      if (k.add(c), m.length >= 64) {
        r("error", i[c].line, "Subcircuit dependency nesting exceeds 64 levels."), k.delete(c), I.add(c);
        return;
      }
      for (const f of i[c].instances) f.definitionId && w(f.definitionId, [...m, i[c].name]);
      k.delete(c), I.add(c);
    }
  }
  for (const c of Object.keys(i)) w(c);
  !a.devices.length && !a.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const c of o) !c.source && c.line && n.origins[c.line - 1] && (c.source = n.origins[c.line - 1].file, c.line = n.origins[c.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: i, globals: [...d], diagnostics: o };
}
const j = () => /* @__PURE__ */ Object.create(null), J = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), me = (t, e) => J(t.map((n) => n.toLowerCase()), e.toLowerCase());
function tt(t, e = []) {
  const n = j(), o = (i) => n[i] || (n[i] = { name: i, displayName: i.split("/").map((d) => decodeURIComponent(d)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const i of t) for (const [d, r] of Object.entries(i.terminals)) o(r).terminals.push({ component: i.name, pin: d });
  for (const i of e) o(i);
  return n;
}
function nt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Ce = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, rt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function de(t, e, n = (i) => i, o = (i) => i) {
  const i = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (r) => (i.push(r), "@@" + (i.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (r, s, a) => {
    const l = a.split(",").map((g) => g.trim());
    if (l.some((g) => !g || /[\s{}+*()]/.test(g))) throw Error("Unsupported dynamic voltage/current reference: " + r);
    const b = s.toUpperCase() + "(" + l.map((g) => s.toLowerCase() === "v" ? n(g) : o(g, s)).join(",") + ")";
    return i.push(b), "@@" + (i.length - 1) + "@@";
  });
  let d = t.length;
  return t = t.replace(rt, (r, s, a) => {
    if (a.slice(s + r.length).trimStart().startsWith("(")) return r;
    const l = e(r.toLowerCase());
    if (l === void 0) return r;
    if (d += l.length + 2, d > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + l + ")";
  }), t.replace(/@@(\d+)@@/g, (r, s) => i[Number(s)]);
}
function it(t, e, n, o) {
  const i = { ...e, ...n }, d = j(), r = /* @__PURE__ */ new Set(), s = j();
  for (const [l, b] of Object.entries(o)) s[l] = de(Ce(b), (g) => t[g]);
  function a(l) {
    if (Object.hasOwn(s, l)) return s[l];
    if (Object.hasOwn(d, l)) return d[l];
    if (!Object.hasOwn(i, l)) return t[l];
    if (r.has(l)) {
      if (Object.hasOwn(t, l)) return t[l];
      throw Error("Circular parameter dependency: " + [...r, l].join(" → "));
    }
    return r.add(l), d[l] = de(Ce(i[l]), a), r.delete(l), d[l];
  }
  for (const l of Object.keys(i)) a(l);
  return Object.assign(j(), t, d, s);
}
function ve(t, e, n, o) {
  let i = "";
  for (let a = 0; a < t.length; ) {
    const l = t[a];
    if (l !== "{" && l !== "'") {
      i += l, a++;
      continue;
    }
    const b = a++;
    let g = 1, p = "";
    for (; a < t.length && g; a++) {
      if (l === "'") {
        t[a] === "'" && (g = 0);
        continue;
      }
      if (p) {
        t[a] === p && (p = "");
        continue;
      }
      if (t[a] === '"' || t[a] === "'") {
        p = t[a];
        continue;
      }
      t[a] === "{" && g++, t[a] === "}" && g--;
    }
    if (g) throw Error("Unclosed parameter expression.");
    i += l + de(t.slice(b + 1, a - 1), (E) => e[E], n, o) + (l === "{" ? "}" : "'");
  }
  const d = [];
  let r = 0, s = "";
  for (let a = 0; a < i.length; a++) {
    const l = i[a];
    if (s) {
      l === s && i[a - 1] !== "\\" && (s = "");
      continue;
    }
    if (l === '"' || l === "'") {
      s = l;
      continue;
    }
    if ("({".includes(l) && r++, ")}".includes(l) && r--, !r && (a === 0 || /\s/.test(i[a - 1]))) {
      const b = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(a));
      b && (d.push({ start: a, end: a + b[0].length, key: b[1].toLowerCase() }), a += b[0].length - 1);
    }
  }
  if (d.length) {
    let a = i.slice(0, d[0].start);
    d.forEach((l, b) => {
      const g = d[b + 1]?.start ?? i.length, p = i.slice(l.end, g);
      a += i.slice(l.start, l.end) + (p.includes("{") || ["refnode", "intnode"].includes(l.key) ? p : de(p, (E) => e[E], n, o));
    }), i = a;
  } else Object.hasOwn(e, t.toLowerCase()) && (i = "{" + e[t.toLowerCase()] + "}");
  return i;
}
class ot {
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
      for (let i in arguments[0])
        this.add(i, arguments[0][i], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(i) {
        this[i] = this[i] || [], n && this[i][o ? "unshift" : "push"](n);
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
class st {
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
    let n = [], o, i;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === u.SEMCOL_CODE || o === u.COMMA_CODE)
        this.index++;
      else if (i = this.gobbleExpression())
        n.push(i);
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
    let e, n, o, i, d, r, s, a, l;
    if (r = this.gobbleToken(), !r || (n = this.gobbleBinaryOp(), !n))
      return r;
    for (d = { value: n, prec: u.binaryPrecedence(n), right_a: u.right_associative.has(n) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + n), i = [r, d, s]; n = this.gobbleBinaryOp(); ) {
      if (o = u.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      d = { value: n, prec: o, right_a: u.right_associative.has(n) }, l = n;
      const b = (g) => d.right_a && g.right_a ? o > g.prec : o <= g.prec;
      for (; i.length > 2 && b(i[i.length - 2]); )
        s = i.pop(), n = i.pop().value, r = i.pop(), e = {
          type: u.BINARY_EXP,
          operator: n,
          left: r,
          right: s
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + l), i.push(d, e);
    }
    for (a = i.length - 1, e = i[a]; a > 1; )
      e = {
        type: u.BINARY_EXP,
        operator: i[a - 1].value,
        left: i[a - 2],
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
    let e, n, o, i;
    if (this.gobbleSpaces(), i = this.searchHook("gobble-token"), i)
      return this.runHook("after-token", i);
    if (e = this.code, u.isDecimalDigit(e) || e === u.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === u.SQUOTE_CODE || e === u.DQUOTE_CODE)
      i = this.gobbleStringLiteral();
    else if (e === u.OBRACK_CODE)
      i = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, u.max_unop_len), o = n.length; o > 0; ) {
        if (u.unary_ops.hasOwnProperty(n) && (!u.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !u.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const d = this.gobbleToken();
          return d || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: u.UNARY_EXP,
            operator: n,
            argument: d,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      u.isIdentifierStart(e) ? (i = this.gobbleIdentifier(), u.literals.hasOwnProperty(i.name) ? i = {
        type: u.LITERAL,
        value: u.literals[i.name],
        raw: i.name
      } : i.name === u.this_str && (i = { type: u.THIS_EXP })) : e === u.OPAREN_CODE && (i = this.gobbleGroup());
    }
    return i ? (i = this.gobbleTokenProperty(i), this.runHook("after-token", i)) : this.runHook("after-token", !1);
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
    let i = !1;
    for (; this.index < this.expr.length; ) {
      let d = this.expr.charAt(this.index++);
      if (d === o) {
        i = !0;
        break;
      } else if (d === "\\")
        switch (d = this.expr.charAt(this.index++), d) {
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
            e += d;
        }
      else
        e += d;
    }
    return i || this.throwError('Unclosed quote after "' + e + '"'), {
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
    let o = !1, i = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let d = this.code;
      if (d === e) {
        o = !0, this.index++, e === u.CPAREN_CODE && i && i >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (d === u.COMMA_CODE) {
        if (this.index++, i++, i !== n.length) {
          if (e === u.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === u.CBRACK_CODE)
            for (let r = n.length; r < i; r++)
              n.push(null);
        }
      } else if (n.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const r = this.gobbleExpression();
        (!r || r.type === u.COMPOUND) && this.throwError("Expected comma"), n.push(r);
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
const at = new ot();
Object.assign(u, {
  hooks: at,
  plugins: new st(u),
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
const te = (t) => new u(t).parse(), ct = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(u).filter((t) => !ct.includes(t) && te[t] === void 0).forEach((t) => {
  te[t] = u[t];
});
te.Jsep = u;
const lt = "ConditionalExpression";
var dt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), n.node = {
            type: lt,
            test: o,
            consequent: i,
            alternate: d
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let r = o;
            for (; r.right.operator && t.binary_ops[r.right.operator] <= 0.9; )
              r = r.right;
            n.node.test = r.right, r.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
te.plugins.register(dt);
const ut = "ConditionalExpression";
var ft = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), n.node = {
            type: ut,
            test: o,
            consequent: i,
            alternate: d
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let r = o;
            for (; r.right.operator && t.binary_ops[r.right.operator] <= 0.9; )
              r = r.right;
            n.node.test = r.right, r.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
te.plugins.register(ft);
const ht = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Oe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, $ = (t) => Number(t) > 0.5;
function se(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function i(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (a) => {
      if (a[0] === '"' || a[0] === "'") return a;
      const [, l, b, g] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(a), p = b.toLowerCase(), E = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : ht[p[0]] || 1;
      return "(" + (g ? +(l + (l.includes(".") ? "" : ".") + g) : Number(l)) * E + ")";
    }), d(te(s));
  }
  function d(s) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const a = s.name.toLowerCase();
      if (a === "pi") return Math.PI;
      if (a === "e") return Math.E;
      if (!Object.hasOwn(e, a)) throw Error("Undefined structural parameter: " + s.name);
      if (n.has(a)) throw Error("Circular structural parameter: " + a);
      n.add(a);
      const l = i(e[a]);
      return n.delete(a), l;
    }
    if (s.type === "ConditionalExpression") return $(d(s.test)) ? d(s.consequent) : d(s.alternate);
    if (s.type === "UnaryExpression") {
      const a = d(s.argument);
      if (s.operator === "-") return -a;
      if (s.operator === "+") return +a;
      if (s.operator === "!" || s.operator === "~") return !$(a);
    }
    if (s.type === "BinaryExpression") {
      const a = d(s.left);
      if (s.operator === "&&") return $(a) && $(d(s.right));
      if (s.operator === "||") return $(a) || $(d(s.right));
      const l = d(s.right);
      switch (s.operator) {
        case "+":
          return a + l;
        case "-":
          return a - l;
        case "*":
          return a * l;
        case "/":
          return a / l;
        case "**":
          return a ** l;
        case "%":
          return a % l;
        case "^":
          return $(a) !== $(l);
        case "&":
          return $(a) && $(l);
        case "|":
          return $(a) || $(l);
        case ">":
          return a > l;
        case "<":
          return a < l;
        case ">=":
          return a >= l;
        case "<=":
          return a <= l;
        case "==":
        case "===":
          return a === l;
        case "!=":
        case "!==":
          return a !== l;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const a = s.callee.name.toLowerCase();
      if (a === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return $(d(s.arguments[0])) ? d(s.arguments[1]) : d(s.arguments[2]);
      }
      if (Object.hasOwn(Oe, a)) return Oe[a](...s.arguments.map(d));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const r = i(t);
  if (typeof r == "number" && !Number.isFinite(r)) throw Error("Structural expression is not finite.");
  return r;
}
function pt(t) {
  nt(t);
  const e = j(), n = /* @__PURE__ */ new Map();
  let o = 0, i = 0;
  function d(r, s, a, l, b, g, p) {
    if (s.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[r], k = s.length ? J(s.slice(0, -1), s.at(-1)) : "", I = j();
    if (p.some((h) => h.scopeId === r)) throw Error("Circular subcircuit reference at " + k);
    const w = it(l, E.defaults, E.parameters, b);
    function c(h) {
      if (/^\{[\s\S]*\}$/.test(h)) {
        const v = se(h, w);
        h = String(typeof v == "boolean" ? Number(v) : v);
      }
      /^"[\s\S]*"$/.test(h) && (h = h.slice(1, -1));
      const x = h.toLowerCase();
      return Object.hasOwn(a, x) ? a[x] : t.globals.includes(x) ? me([], x) : I[x] || (I[x] = me(s, x));
    }
    const m = { id: k, path: s, scopeId: r, name: g?.name || "Top", definition: E.name, ports: E.ports.map((h) => ({ name: h, node: c(h) })), params: w, nodes: I, models: j(), devices: [], children: [], raw: g?.raw || "", line: g?.line || 0 };
    e[k] = m, n.set(k, c);
    const f = [...p, m];
    function C(h) {
      if (!h) return "";
      let x = E;
      for (; x; ) {
        if (x.directives.some((v) => new RegExp("^\\.model\\s+" + h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(v.text))) {
          const v = [...f].reverse().find((M) => M.scopeId === x.id);
          return J(v?.path || [], h.toLowerCase());
        }
        x = t.scopes[x.parent];
      }
      return h;
    }
    for (const h of E.directives.filter((x) => /^\.model\b/i.test(x.text))) {
      const x = /^\.model\s+(\S+)/i.exec(h.text)?.[1];
      if (!x) continue;
      const v = C(x), M = E.models[x.toLowerCase()], B = ve(h.text, w, c, (T) => J(s, T));
      m.models[v] = { ...M, name: v, raw: B.replace(/^(\.model\s+)\S+/i, (T, N) => N + v), instanceId: k, parameters: w };
    }
    for (const h of E.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const x = j();
      for (const [M, B] of Object.entries(h.terminals)) x[M] = c(B);
      const v = C(h.model);
      m.devices.push({ ...h, name: J(s, h.name), localName: h.name, instanceId: k, terminals: x, model: v, parameters: w });
    }
    for (const h of E.instances) {
      let x = h.definitionId;
      if (!x) {
        const T = String(se(h.definitionName, w)).toLowerCase();
        let N = E;
        for (; N && !x; )
          x = N.definitions[T], N = t.scopes[N.parent];
        if (!x) throw Error("Undefined selected subcircuit: " + T);
      }
      const v = t.scopes[x], M = j();
      if (v.ports.length !== h.nodes.length) throw Error(h.name + ": expected " + v.ports.length + " ports; got " + h.nodes.length);
      v.ports.forEach((T, N) => {
        M[T.toLowerCase()] = c(h.nodes[N]);
      });
      const B = d(x, [...s, h.name], M, w, h.parameters, h, f);
      h.pinNames?.length === B.ports.length && B.ports.forEach((T, N) => {
        T.label = h.pinNames[N];
      }), m.children.push(B);
    }
    return m;
  }
  try {
    let b = function(g, p) {
      const E = p.split(":");
      if (E.length === 1) return { owner: g, name: p };
      const k = E.pop();
      for (const I of [[...g.path, ...E], E]) {
        const w = s.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: k };
      }
      throw Error("Unknown hierarchical reference: " + p);
    };
    const r = d(t.rootId, [], j(), j(), j(), null, []), s = new Map(Object.values(e).map((g) => [g.id.toLowerCase(), g])), a = Object.assign(j(), ...Object.values(e).map((g) => g.models)), l = (g) => a[g] || Object.entries(a).find(([p]) => p.startsWith(g + "."))?.[1];
    for (const g of Object.values(e)) for (const p of g.devices) {
      const E = t.scopes[g.scopeId].devices.find((w) => w.name === p.localName), k = (w) => {
        const c = b(g, w);
        return n.get(c.owner.id)(c.name);
      }, I = (w, c = "", m = "") => {
        const f = b(g, w), C = f.owner.devices.find((h) => h.localName.toLowerCase() === f.name.toLowerCase());
        if (c.toLowerCase() === "ix") {
          const h = f.owner.ports.find((x, v) => x.name.toLowerCase() === f.name.toLowerCase() || String(v + 1) === f.name);
          if (h) return f.owner.id + ":" + h.name;
        }
        if (!C) {
          if (m) throw Error(p.name + ": referenced " + m + " device " + w + " was not found.");
          return J(f.owner.path, f.name);
        }
        if (m && C.kind !== m) throw Error(p.name + ": " + w + " must be a " + m + " device.");
        return C.name;
      };
      if (p.value = ve(E.value, g.params, k, I), E.model && (p.value = p.value.replace(E.model, p.model)), p.kind === "M" && Object.keys(p.terminals).length === 3) {
        let w = l(p.model), c = !1;
        const m = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !m.has(w.name); ) {
          m.add(w.name);
          const f = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (f) {
            c = f[1] === void 0 || Number(se(f[1], w.parameters)) >= 0.5;
            break;
          }
          const C = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = l(C + (w.baseModel || "").toLowerCase()) || l((w.baseModel || "").toLowerCase());
        }
        m.size && (p.type = "spice_" + (c ? "pmos3" : "nmos3"));
      }
      p.controlSources = (E.controlSources || []).map((w) => I(w, "", "V")), p.controlSource = p.controlSources[0] || "", p.coupledInductors = (E.coupledInductors || []).map((w) => I(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const c = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        p.value = p.value.replace(new RegExp("(?<![\\w./%])" + c + "(?![\\w.$])", "g"), () => I(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: r, contexts: e };
  } catch (r) {
    throw r.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: r.message }], r;
  }
}
function ae(t) {
  return [...t.devices, ...t.children.flatMap(ae)];
}
function Se(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const ke = 3;
function ge(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const ce = (t) => ["pwr", "ret", "bias"].includes(t), mt = (t) => String(t).split("/").at(-1).toLowerCase(), De = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[mt(t)] || "unknown", gt = (t) => {
  const e = ge(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || De(t);
};
function bt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (r, s, a) => {
    e.has(r) || e.set(r, []), e.get(r).push({ node: s, delta: a });
  };
  for (const r of t)
    if (r.kind === "V")
      try {
        let s = r.value.trim();
        const a = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (a && Number(se(a[1], r.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const l = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!l) continue;
        const b = se(l[1], r.parameters);
        if (typeof b != "number" || !Number.isFinite(b)) continue;
        o(r.terminals["-"], r.terminals["+"], b), o(r.terminals["+"], r.terminals["-"], -b);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Set();
  for (const r of ["0", ...e.keys()]) {
    if (d.has(r)) continue;
    const s = /* @__PURE__ */ new Map([[r, 0]]), a = [r];
    d.add(r);
    let l = !1;
    for (let b = 0; b < a.length; b++) for (const g of e.get(a[b]) || []) {
      const p = s.get(a[b]) + g.delta;
      s.has(g.node) ? Math.abs(s.get(g.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (l = !0) : (s.set(g.node, p), d.add(g.node), a.push(g.node));
    }
    l && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [b, g] of s) i[b] = { value: g, reference: r, known: r === "0" && !l, consistent: !l };
  }
  return { nodes: i, diagnostics: n };
}
function wt(t, e) {
  const n = bt(ae(t.root)), o = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const r of Object.values(e.nodes)) {
    const s = ge(r.name), a = De(r.name);
    o[r.name] = { role: s !== "unknown" ? s : a, roleSource: s !== "unknown" ? "node-name" : a !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[r.name]?.known ? n.nodes[r.name].value : null };
  }
  const d = (r, s, a) => {
    const l = { role: o[a].role, roleSource: o[a].roleSource }, b = r.block?.ports.find((E) => E.pin === s);
    if (b?.implicit || !r.block && !r.synthetic) return l;
    const g = r.synthetic ? r.value : b?.name || b?.label, p = gt(g);
    return p !== "unknown" ? { role: p, roleSource: ge(g) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ce(l.role) ? { ...l, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const r of e.components) {
    const s = Object.fromEntries(Object.entries(r.terminals).map(([f, C]) => [f, { ...o[C], ...d(r, f, C) }])), a = Object.values(s), l = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(r.type), b = l && a.length === 2 && a.every((f) => !ce(f.role) && (f.potential === null || f.role !== "unknown")), g = r.terminals["+"], p = r.terminals["-"], E = [g, p].filter((f) => f && f !== "0"), k = r.kind === "V" && E.some((f) => ce(o[f]?.role)) && !E.some((f) => ["in", "out", "io", "fb"].includes(o[f]?.role)) && [g, p].every((f) => n.nodes[f]?.known), I = g === "0" ? p : g, w = Object.keys(r.terminals), c = (f) => ce(f.role) ? f.potential !== null ? f.potential > 0 ? "high" : "low" : f.role === "ret" ? "low" : "high" : "signal";
    let m = !1;
    w.length === 2 && (r.terminals[w[0]] === "0" ? m = !0 : r.terminals[w[1]] === "0" ? m = !1 : a.every((f) => f.potential !== null) ? m = a[0].potential < a[1].potential : m = c(a[0]) === "low" || c(a[1]) === "high" && c(a[0]) === "signal"), i[r.name] = { version: ke, kind: r.kind, passive: l, source: ["V", "I", "E", "F", "G", "H"].includes(r.kind) || r.kind === "B" && !l, ports: s, horizontal: b, orientation: b ? "horizontal" : m ? "vertical-reversed" : "vertical", flexible: w.length === 2 && (l || ["V", "I", "B", "F", "H"].includes(r.kind)), supply: !!k, voltage: k ? n.nodes[I].value : null };
  }
  return { version: ke, nodes: o, cells: i, diagnostics: n.diagnostics };
}
function Re(t, e) {
  const n = e.ports.map((i, d) => ({ pin: "P" + d, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), o = new Set(ae(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of t.ir.globals) {
    const d = me([], i);
    o.has(d) && !n.some((r) => r.node === d) && n.push({ pin: "G" + n.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: d, implicit: !0 });
  }
  return n;
}
function Et(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  const d = [], r = [];
  function s(b) {
    r.push(...Object.values(b.nodes), ...b.ports.map((p) => p.node));
    const g = [...b.devices.map((p) => ({ line: p.line, device: p })), ...b.children.map((p) => ({ line: p.line, child: p }))].sort((p, E) => p.line - E.line);
    for (const p of g) {
      if (p.device) {
        const w = p.device;
        d.push({ ...w, layoutLabel: [...b.path.slice(i.path.length), w.localName].join("/") });
        continue;
      }
      const E = p.child;
      if (e === "flat" || n.has(E.id)) {
        s(E);
        continue;
      }
      const k = Re(t, E), I = j();
      k.forEach((w) => {
        I[w.pin] = w.node;
      }), d.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: I, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(i.path.length).join("/"), block: { definitionId: E.scopeId, ports: k, parameters: E.params } });
    }
  }
  s(i);
  for (const [b, g] of i.ports.entries()) d.push({ name: "@port/" + o + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: g.node }, layoutLabel: g.name, value: g.name, raw: "Interface port " + g.name, synthetic: !0 });
  if (d.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const a = Object.assign(j(), ...Object.values(t.contexts).map((b) => b.models)), l = { title: o || t.ir.title, components: d, nodes: tt(d, r), models: a, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  return l.topology = yt(t, l), l.layout = wt(t, l), l;
}
function yt(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e.components)
    if (!r.synthetic)
      if (r.kind === "X") {
        const s = t.contexts[r.instanceId];
        if (!s) throw Error("Projection contains an unknown block.");
        const a = Re(t, s);
        if (JSON.stringify(Object.entries(r.terminals)) !== JSON.stringify(a.map((l) => [l.pin, l.node]))) throw Error("Block interface topology mismatch: " + r.name);
        n.push(...ae(s));
      } else n.push(r);
  for (const r of n) {
    if (o.has(r.name)) throw Error("Projection duplicates " + r.name);
    o.add(r.name);
  }
  const i = Se(n), d = ae(t.contexts[e.focus]);
  if (i !== Se(d)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: i };
}
function xt(t) {
  const e = j(), n = j();
  for (const o of t.components) {
    const i = j(), d = j();
    for (const [r, s] of Object.entries(o.terminals))
      i[r] = [t.nodes[s].bit], d[r] = "input";
    e[o.name] = { type: o.type, port_directions: d, connections: i, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((r) => ({ pin: r.pin, label: r.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((r, s) => ({ pin: r, label: o.pinLabels?.[s] || r })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n } } };
}
function Ct(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, i = (d) => (n.has(d) || n.set(d, n.size + 2), n.get(d));
  return Object.entries(t.modules.circuit.cells).forEach(([d, r], s) => {
    const a = "c" + s;
    e.set(a, d);
    const l = Object.fromEntries(Object.entries(r.connections).map(([b, g]) => [b, g.map(i)]));
    o[a] = { type: r.type, connections: l, port_directions: r.port_directions, attributes: { displayRef: r.attributes.displayRef || r.attributes.ref || "", value: r.attributes.value || "", name: r.attributes.name || "" } }, r.spiceBlock && (o[a].spiceBlock = r.spiceBlock), r.spiceSymbol && (o[a].spiceSymbol = r.spiceSymbol), r.spiceLayout && (o[a].spiceLayout = r.spiceLayout);
  }), { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o } } }, ids: e, bits: new Map([...n].map(([d, r]) => [r, d])) };
}
const Q = /* @__PURE__ */ new Map();
async function vt(t, e) {
  const n = Ct(t), o = JSON.stringify([n.netlist, e]);
  let i = Q.get(o);
  i ? (Q.delete(o), Q.set(o, i)) : (i = await Ot(n.netlist, e), i.length < 1e6 && (Q.set(o, i), Q.size > 20 && Q.delete(Q.keys().next().value)));
  const d = new DOMParser().parseFromString(i, "image/svg+xml");
  if (d.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const r of d.querySelectorAll("[id],[class]")) {
    const s = r.getAttribute("id");
    s?.startsWith("cell_") && n.ids.has(s.slice(5)) && r.setAttribute("id", "cell_" + n.ids.get(s.slice(5)));
    const a = r.getAttribute("class");
    a && r.setAttribute("class", a.split(/\s+/).map((l) => l.startsWith("cell_") && n.ids.has(l.slice(5)) ? "cell_" + n.ids.get(l.slice(5)) : /^net_\d+$/.test(l) && n.bits.has(Number(l.slice(4))) ? "net_" + n.bits.get(Number(l.slice(4))) : l).join(" "));
  }
  return new XMLSerializer().serializeToString(d.documentElement);
}
function Ot(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-zF-jqopy.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, i) => {
    const d = (a, l) => {
      clearTimeout(s), n.terminate(), a ? i(Error(a)) : o(l);
    }, r = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => d("Layout timed out. Open a subcircuit sheet or collapse instances."), r);
    n.onmessage = ({ data: a }) => d(a.error, a.svg), n.onerror = (a) => d(a.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const St = `* Mixed RLC, semiconductors and nonlinear / controlled sources
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
`, pe = `* RLC low-pass filter
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, kt = `* Two parameterized channels, each with two nested filter instances
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
`, Lt = `* Viewer grammar coverage: all documented LTspice 24+ element prefixes
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
function It(t) {
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
  return It(await t.arrayBuffer());
}
const O = (t) => document.getElementById("spice-" + t), oe = O("app");
if (oe) {
  let C = function() {
    i = "", m(), n.textContent = "Input changed — generate to refresh the schematic.";
  }, h = function(y) {
    o.replaceChildren();
    for (const { severity: S, line: A, message: R, source: L } of y) {
      const _ = document.createElement("li");
      _.className = S, _.textContent = `${S.toUpperCase()}${L && L !== "input.cir" ? " · " + L : ""}${A ? " · line " + A : ""}: ${R}`, o.append(_);
    }
    O("messages").open = y.some((S) => S.severity !== "info"), O("message-count").textContent = `${y.length} message${y.length === 1 ? "" : "s"}`;
  }, x = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${p.x} ${p.y} ${p.w} ${p.h}`), O("zoom-level").textContent = Math.round(E.w / p.w * 100) + "%";
  }, v = function(y, S = p.x + p.w / 2, A = p.y + p.h / 2) {
    if (!e.querySelector("svg")) return;
    const R = Math.max(0.05, Math.min(10, p.w * y / E.w)) * E.w / p.w;
    p = { x: S + (p.x - S) * R, y: A + (p.y - A) * R, w: p.w * R, h: p.h * R }, x();
  }, B = function(y) {
    const S = new URLSearchParams();
    y && S.set("instance", y);
    const A = S.toString();
    location.hash.slice(1) === A ? (l = y, P()) : location.hash = A;
  }, T = function() {
    l = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, N = function(y) {
    const S = r.contexts[y].path;
    for (let A = 1; A <= S.length; A++) I.add(S.slice(0, A).map(encodeURIComponent).join("/"));
  }, ne = function() {
    const y = !!(b && b !== l && r?.contexts[b]);
    O("selection-actions").hidden = !y, O("toggle-instance").textContent = I.has(b) ? "Collapse instance" : "Expand instance", O("toggle-instance").disabled = !1, O("open-instance").href = "#" + new URLSearchParams({ instance: b });
  }, re = function() {
    O("breadcrumbs").replaceChildren();
    const y = (A, R) => {
      const L = document.createElement("button");
      L.type = "button", L.textContent = A, L.onclick = () => B(R), L.disabled = R === l, O("breadcrumbs").append(L);
    };
    if (y("Top", ""), l) {
      const A = r.contexts[l].path;
      for (let R = 0; R < A.length; R++) y(A[R], A.slice(0, R + 1).map(encodeURIComponent).join("/"));
    }
    O("instances").replaceChildren();
    const S = (A, R) => {
      for (const L of A.children) {
        const _ = document.createElement("div");
        _.className = "spice-instance-row", _.style.setProperty("--depth", Math.min(R, 8)), _.dataset.instance = L.id;
        const X = document.createElement("button");
        X.type = "button", X.textContent = I.has(L.id) ? "−" : "+", X.title = (I.has(L.id) ? "Collapse " : "Expand ") + L.id, X.setAttribute("aria-label", X.title), X.setAttribute("aria-expanded", String(I.has(L.id))), X.onclick = () => {
          I.has(L.id) ? I.delete(L.id) : N(L.id), b = L.id, P();
        };
        const W = document.createElement("a");
        W.href = "#" + new URLSearchParams({ instance: L.id }), W.textContent = L.name + " · " + L.definition, W.title = "Open " + L.id + " as its own sheet";
        const H = document.createElement("span");
        if (H.className = "spice-help", H.textContent = Object.entries(L.params).map(([G, Y]) => G + "=" + Y).join(" · "), _.append(X, W), H.textContent) {
          const G = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", G.append(Y, H), _.append(G);
        }
        O("instances").append(_), S(L, R + 1);
      }
    };
    S(r.contexts[l], 0), O("hierarchy-panel").hidden = !r.contexts[l].children.length, O("focus-title").textContent = l ? l + " / " + r.contexts[l].definition : "Top-level schematic", ne();
  };
  const t = O("input"), e = O("preview"), n = O("status"), o = O("diagnostics");
  let i = "", d, r, s, a = "", l = "", b = "", g = !1, p = { x: 0, y: 0, w: 1, h: 1 }, E = { ...p }, k;
  const I = /* @__PURE__ */ new Set();
  let w = !1, c = {};
  try {
    c = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  oe.addEventListener("click", (y) => {
    g && y.target.closest('a[href^="#"]') && y.preventDefault();
  });
  const m = () => {
    O("copy").disabled = O("download").disabled = !i || g;
  }, f = () => ({ font: O("font").value, fontSize: Number(O("size").value), color: O("color").value, detailed: O("detailed").checked, conventional: O("conventional").checked });
  t.value = pe;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || pe;
  } catch {
  }
  t.addEventListener("input", C);
  for (const y of ["font", "size", "color", "detailed", "conventional"]) O(y).addEventListener("input", C);
  O("zoom-in").onclick = () => v(0.8), O("zoom-out").onclick = () => v(1.25), O("fit").onclick = () => {
    p = { ...E }, x();
  };
  const M = (y) => {
    const S = e.querySelector("svg");
    return S ? new DOMPoint(y.clientX, y.clientY).matrixTransform(S.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (y) => {
    const S = M(y);
    S && (y.preventDefault(), v(y.deltaY > 0 ? 1.12 : 1 / 1.12, S.x, S.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (y) => {
    y.button !== 0 || !e.querySelector("svg") || (k = { start: M(y), x: y.clientX, y: y.clientY, view: { ...p }, moved: !1 }, e.setPointerCapture(y.pointerId));
  }), e.addEventListener("pointermove", (y) => {
    if (!k) return;
    const S = M(y);
    Math.hypot(y.clientX - k.x, y.clientY - k.y) > 4 && (k.moved = !0), p.x += k.start.x - S.x, p.y += k.start.y - S.y, x();
  }), e.addEventListener("pointerup", (y) => {
    if (!k) return;
    const S = k.moved;
    if (k = null, e.hasPointerCapture(y.pointerId) && e.releasePointerCapture(y.pointerId), !S) {
      const A = document.elementFromPoint(y.clientX, y.clientY)?.closest("[data-component]"), R = d?.components.find((L) => L.name === A?.dataset.component);
      R && (b = R.instanceId || "", O("selection").textContent = `${R.raw}
${Object.entries(R.terminals).map(([L, _]) => `${L} → ${_}`).join("   ")}`, R.kind === "X" ? (N(R.instanceId), P()) : ne());
    }
  }), window.addEventListener("hashchange", () => {
    if (g) {
      w = !0;
      return;
    }
    T(), b = "", P();
  }), O("collapse-all").onclick = () => {
    I.clear(), P();
  }, O("expand-all").onclick = () => {
    for (const y of Object.keys(r?.contexts || {})) y && I.add(y);
    P();
  }, O("toggle-instance").onclick = () => {
    I.has(b) ? I.delete(b) : N(b), P();
  }, e.addEventListener("pointercancel", () => {
    k = null;
  }), e.addEventListener("keydown", (y) => {
    const S = y.target.closest("[data-instance]");
    if (S && (y.key === "Enter" || y.key === " ")) {
      y.preventDefault(), b = S.dataset.instance, N(b), P();
      return;
    }
    y.key === "+" || y.key === "=" ? v(0.8) : y.key === "-" ? v(1.25) : y.key.toLowerCase() === "f" ? (p = { ...E }, x()) : y.key.startsWith("Arrow") && (y.preventDefault(), p.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[y.key] || 0) * p.w, p.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[y.key] || 0) * p.h, x());
  });
  async function P() {
    if (g) return;
    g = !0, i = "", m(), O("generate").disabled = !0, t.readOnly = !0, O("file").disabled = !0, O("libraries").disabled = !0;
    for (const S of oe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) S.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let y = [];
    try {
      if (a !== t.value || !r) {
        if (s = et(t.value, { files: c }), y = [...s.diagnostics], y.some((D) => D.severity === "error"))
          throw r = null, Error("Fix the parser errors below before generating.");
        r = pt(s), a && a !== t.value ? (I.clear(), l = "", b = "", history.replaceState(null, "", location.pathname + location.search)) : T(), a = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (y = [...s.diagnostics], h(y), y.some((D) => D.severity === "error")) throw Error("Fix the parser errors below before generating.");
      d = Et(r, { expanded: I, focus: l });
      const S = xt(d);
      f().conventional && y.push(...d.layout.diagnostics);
      const A = await vt(S, f()), R = new DOMParser().parseFromString(A, "image/svg+xml");
      if (R.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const L = R.documentElement, _ = L.querySelector("#spice-layout-report");
      if (_) {
        d.layout.report = JSON.parse(_.textContent);
        const D = d.layout.report;
        y.push({ severity: "info", message: `Layout: compact signal flow; ${D.powerSourcesChecked} DC/ground symbols checked, ${D.powerOrderViolations} DC order preference(s) unmet. ${D.powerPass}. Global voltage bands are a preference.` }), D.groundPlacement && y.push({ severity: "info", message: `Ground: ${D.groundPlacement}; ${D.straightenedGroundDrops || 0} return-path simplification(s).` }), h(y);
      }
      if (L.localName !== "svg" || L.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const X = Number(L.getAttribute("width")), W = Number(L.getAttribute("height"));
      E = { x: -20, y: -20, w: X + 40, h: W + 40 }, p = { ...E }, L.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), L.setAttribute("width", String(E.w)), L.setAttribute("height", String(E.h)), L.setAttribute("role", "img"), L.setAttribute("aria-label", d.title || "SPICE schematic"), L.setAttribute("style", "background:white");
      for (const D of d.components) {
        const U = R.getElementById("cell_" + D.name);
        if (!U) throw Error("Renderer omitted component " + D.name);
        U.setAttribute("data-component", D.name), D.kind === "X" && (U.setAttribute("data-instance", D.instanceId), U.setAttribute("role", "button"), U.setAttribute("tabindex", "0"), U.setAttribute("aria-label", "Expand " + D.name));
        const z = R.createElementNS(L.namespaceURI, "title");
        z.textContent = D.raw + `
Resolved: ` + D.value + `
` + Object.entries(D.terminals).map(([F, ie]) => F + ": " + ie).join(", "), U.prepend(z);
      }
      for (const D of Object.values(d.nodes))
        for (const U of L.querySelectorAll(".net_" + D.bit)) {
          U.setAttribute("data-net", D.name);
          const z = R.createElementNS(L.namespaceURI, "title");
          z.textContent = "Node " + D.displayName, U.append(z);
        }
      const H = d.components.filter((D) => D.kind === "K").map((D) => ({ name: D.name, inductors: D.coupledInductors, value: D.value }));
      if (H.length) {
        const D = R.createElementNS(L.namespaceURI, "metadata");
        D.setAttribute("id", "spice-magnetic-couplings"), D.textContent = JSON.stringify(H), L.append(D);
        for (const U of H) for (const z of U.inductors) {
          const F = R.getElementById("cell_" + z);
          if (!F) continue;
          const ie = R.createElementNS(L.namespaceURI, "circle"), ue = [...F.children].find((fe) => fe.getAttribute("s:pid") === "A"), Ae = ue?.getAttribute("s:position"), be = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Ae] || [0, 0];
          for (const [fe, Me] of Object.entries({ cx: Number(ue?.getAttribute("s:x")) + be[0], cy: Number(ue?.getAttribute("s:y")) + be[1], r: 3, fill: f().color, stroke: "none", "data-coupling": U.name })) ie.setAttribute(fe, String(Me));
          const we = R.createElementNS(L.namespaceURI, "title");
          we.textContent = U.name + " · dotted terminal: " + U.inductors.join(", "), ie.append(we), F.append(ie);
        }
      }
      i = new XMLSerializer().serializeToString(L), O("source").value = i, e.replaceChildren(document.importNode(L, !0)), x();
      const G = y.filter((D) => D.severity === "warning").length;
      n.textContent = `${d.components.filter((D) => !D.synthetic).length} components · ${Object.keys(d.nodes).length} nodes · ${d.topology.leafCount} primitive devices verified${G ? " · Review " + G + " warning(s); drawing may be partial." : " · Schematic ready."}`, d.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${d.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), d.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const Y = Object.values(d.nodes).map((D) => {
        const U = document.createElement("tr");
        for (const z of [D.displayName, D.terminals.map((F) => F.component + "." + F.pin).join(", ")]) {
          const F = document.createElement("td");
          F.textContent = z, U.append(F);
        }
        return U;
      });
      O("nets").replaceChildren(...Y), O("json").value = JSON.stringify({ circuit: d, netlist: S, hierarchy: s }, null, 2), O("selection").textContent = "Click a component to inspect its original statement and pin connections.", re();
    } catch (S) {
      if (e.replaceChildren(), i = "", O("source").value = "", O("json").value = "", O("nets").replaceChildren(), O("selection").textContent = "", n.textContent = S.message, !r)
        O("hierarchy-panel").hidden = !0, O("selection-actions").hidden = !0, O("breadcrumbs").replaceChildren();
      else if (!r.contexts[l]) {
        const A = document.createElement("button");
        A.type = "button", A.textContent = "Return to Top", A.onclick = () => B(""), O("breadcrumbs").replaceChildren(A);
      }
      S.diagnostics && (y = S.diagnostics), y.some((A) => A.severity === "error") || y.push({ severity: "error", line: 0, message: S.message }), h(y);
    } finally {
      g = !1, O("generate").disabled = !1, t.readOnly = !1, O("file").disabled = !1, O("libraries").disabled = !1;
      for (const S of oe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) S.disabled = !1;
      r && r.contexts[l] && re(), e.setAttribute("aria-busy", "false"), m(), w && (w = !1, T(), queueMicrotask(P));
    }
  }
  O("generate").onclick = P;
  for (const y of oe.querySelectorAll("[data-example]")) y.onclick = () => {
    t.value = { mixed: St, filter: pe, hierarchy: kt, ltspice: Lt }[y.dataset.example], C(), P();
  };
  O("file").onchange = async (y) => {
    const S = y.target.files[0];
    if (S) {
      if (S.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Le(S), C(), P();
      } catch (A) {
        n.textContent = "File could not be read: " + A.message;
      } finally {
        y.target.value = "";
      }
    }
  }, O("libraries").onchange = async (y) => {
    try {
      for (const S of y.target.files) {
        if (S.size > 16e6) throw Error("Library exceeds 16 MB: " + S.name);
        c[S.webkitRelativePath || S.name] = await Le(S);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(c));
      } catch {
      }
      r = null, a = "", O("library-status").textContent = Object.keys(c).length + " library file(s) loaded", P();
    } catch (S) {
      n.textContent = S.message;
    } finally {
      y.target.value = "";
    }
  }, O("library-status").textContent = Object.keys(c).length ? "Libraries restored from this session." : "For .include / .lib dependencies", O("download").onclick = () => {
    const y = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), S = document.createElement("a");
    S.href = y, S.download = "spice-schematic.svg", S.click(), setTimeout(() => URL.revokeObjectURL(y), 1e3);
  }, O("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      O("source-details").open = !0, O("source").focus(), O("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, P();
}
