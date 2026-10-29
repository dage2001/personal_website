const Me = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Pe = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, je = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ue = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Te = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Be = { 1: "a", 2: "b", 7: "Q", 8: "com" }, _e = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ve = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, qe = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, ze = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Xe = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Ge = {
  AND: Me,
  BUF: Pe,
  COUNTER: je,
  DFLOP: Ue,
  SCHMITT: Te,
  OR: $e,
  PHASEDET: Be,
  SRFLOP: _e,
  XOR: Ve,
  MODULATOR: Fe,
  OTA: qe,
  SAMPLEHOLD: ze,
  VARISTOR: Xe
}, He = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", J = (t) => t.toLowerCase(), ye = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), We = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Qe(t, e) {
  const n = (b) => e[J(b || "")] || Object.entries(e).find(([p]) => p.startsWith(J(b || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let i = [], l = [], s = "", r = "", c = [], a = [], h = 0, m = "", u = "", E = "", k = !0;
  if ("RLC".includes(o))
    i = ["A", "B"], r = J(o) + "_v";
  else if ("DVIB".includes(o))
    i = ["+", "-"], r = o === "D" ? "d_v" : o === "B" ? "spice_b" : J(o);
  else if (o === "Q") {
    i = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !ye(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && i.push("S"), s = t[i.length + 1] || "";
    const b = n(s)?.type;
    k = ["NPN", "PNP"].includes(b), r = k ? (i.length === 3 ? "q_" : "spice_q4_") + J(b) : "spice_q" + i.length;
  } else if (o === "M") {
    const b = n(t[4]), p = n(t[5]), d = b?.type === "VDMOS" || !p && (!t[5] || ye(t[5]));
    i = d ? ["D", "G", "S"] : ["D", "G", "S", "B"], s = t[i.length + 1] || "";
    const w = n(s), g = w?.type;
    if (d && w && g !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!d && g === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    k = ["NMOS", "PMOS", "VDMOS"].includes(g);
    let C = null, y = w;
    const x = /* @__PURE__ */ new Set();
    for (; y && !x.has(y.name) && (x.add(y.name), C = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(y.raw), !C); )
      y = n(y.baseModel);
    const N = g === "PMOS" || g === "VDMOS" && C && (C[1] === void 0 || Number(C[1]) >= 0.5);
    r = k ? "spice_" + (N ? "pmos" : "nmos") + (d ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    s = t[4] || "";
    const b = n(s)?.type, p = o === "Z" && ["NIGBT", "PIGBT"].includes(b);
    i = p ? ["C", "G", "E"] : ["D", "G", "S"], k = o === "J" ? ["NJF", "PJF"].includes(b) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(b), r = "spice_" + (p ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(b || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    i = ["+", "-"], r = "spice_" + J(o);
    let b = 3, p = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[b] || "");
    if (/^poly$/i.test(t[b] || "") && (p = /^\(\s*(\d+)\s*\)$/.exec(t[++b] || ""), !p))
      throw Error("POLY requires a dimension.");
    if (p) {
      const d = Number(p[1]);
      if (d > 128) throw Error("POLY supports at most 128 controlling variables.");
      let w = b + 1, g = [];
      const C = "EG".includes(o), y = d * (C ? 2 : 1);
      for (; g.length < y && w < t.length; ) g.push(...We(t[w++]));
      if (g.length !== y || w >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (C) {
        for (let x = 0; x < d; x++) i.push("C" + (x + 1) + "+", "C" + (x + 1) + "-");
        l = [t[1], t[2], ...g];
      } else c = g;
      h = w, m = "POLY(" + d + ") " + (C ? "" : g.join(" ") + " "), u = "POLY", C && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? u = "BEHAVIORAL" : "EG".includes(o) ? (i.push("C+", "C-"), u = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], h = 4, m = t[3] + " ");
    E = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (u ? " · " + u : "");
  } else if (o === "S")
    i = ["A", "B", "C+", "C-"], s = t[5] || "", r = "spice_device", E = "Voltage switch";
  else if (o === "W")
    i = ["A", "B"], c = [t[3]], s = t[4] || "", h = 3, r = "spice_device", E = "Current switch";
  else if ("TO".includes(o))
    i = ["L+", "L-", "R+", "R-"], o === "O" && (s = t[5] || ""), r = "spice_device", E = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    i = ["N1", "N2", "COM"], s = t[4] || "", r = "spice_device", E = "Distributed RC";
  else if (o === "A")
    i = Array.from({ length: 8 }, (b, p) => "P" + (p + 1)), r = "spice_device", E = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = t.slice(1, -1), a.some((b) => !/^L/i.test(b.split(":").at(-1)))) throw Error("K references must name inductors.");
    h = t.length - 1, r = "spice_coupling", E = "Magnetic coupling", m = a.join(" ") + " · k=";
  } else if (o === "@")
    i = ["IN", "OUT"], r = "spice_device", E = "FRA";
  else if (o === "&")
    i = ["O+", "O-", "I+", "I-"], r = "spice_device", E = "FRA probe";
  else if (o === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", E = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (h || (h = i.length + 1), l.length || (l = t.slice(1, i.length + 1)), l.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (t.length <= h && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (l.some((b) => /[=()]/.test(b) && !/^\{[\s\S]*\}$/.test(b))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(h).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(h).join(" ")) && (r = "spice_br"), o === "D" && (s = t[3] || ""), o === "@") {
    const b = t.slice(h).join(" ");
    for (const p of b.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(p[1].toUpperCase()), l.push(p[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((b) => !b)) throw Error("Missing controlling voltage source.");
  const L = i.map((b, p) => o === "A" && Ge[(t[9] || "").toUpperCase()]?.[String(p + 1)] || b);
  return { kind: o, pins: i, nodeTokens: l, pinLabels: L, model: s, type: r, controlSource: c[0] || "", controlSources: c, coupledInductors: a, value: m + t.slice(h).join(" "), sourceMode: u, symbol: E, polarityKnown: k };
}
const Ke = He, Ye = new Set(Ke.split(" ")), he = () => /* @__PURE__ */ Object.create(null), q = (t) => t.toLowerCase();
function le(t) {
  const e = [], n = [];
  let o = "", i = 0, l = "";
  for (let s = 0; s < t.length; s++) {
    const r = t[s];
    if (l) {
      o += r, r === l && t[s - 1] !== "\\" && (l = "");
      continue;
    }
    if (r === '"' || r === "'") {
      l = r, o += r;
      continue;
    }
    if (!i && (r === ";" || r === "$" && (!s || /\s/.test(t[s - 1])))) break;
    if ("({".includes(r) && (n.push(r), i++), ")}".includes(r) && (i--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !i ? (o && e.push(o), o = "") : o += r;
  }
  if (i || l) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Ze(t, e = {}) {
  const n = [], o = [], i = [], l = Object.assign(he(), e.models), s = he(), r = (p, d, w) => n.push({ severity: p, line: d, message: w });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((p, d) => {
    const w = p.trim();
    !w || w.startsWith("*") || (w.startsWith("+") ? c.length ? c.at(-1).text += " " + w.slice(1).trim() : r("error", d + 1, "Continuation has no preceding statement.") : c.push({ line: d + 1, text: w }));
  });
  for (const p of c) {
    try {
      p.tokens = le(p.text);
    } catch (w) {
      r("error", p.line, w.message), p.tokens = [];
    }
    const d = p.tokens;
    if (/^\.model$/i.test(d[0] || ""))
      if (d.length < 3) r("error", p.line, ".model requires a name and device type.");
      else {
        const w = /^ako:(.+)$/i.exec(d[2]), g = w && d[3] && !d[3].startsWith("(") ? d[3].split("(")[0].toUpperCase() : "";
        l[q(d[1])] = { name: d[1], type: w ? g : d[2].split("(")[0].toUpperCase(), baseModel: w?.[1] || "", raw: p.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function h(p) {
    const d = l[q(p)];
    if (!d) return "";
    if (d.type) return d.type;
    if (a.has(q(p))) throw Error("Circular AKO model inheritance: " + p);
    return a.add(q(p)), d.type = h(d.baseModel), a.delete(q(p)), d.type;
  }
  for (const p of Object.values(l)) if (p.baseModel && !p.type)
    try {
      h(p.name);
    } catch (d) {
      r("error", 0, d.message);
    }
  let m = "", u = 0, E = !1, k = !1;
  const L = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: p, text: d, tokens: w } of c) {
    if (!w.length) continue;
    const g = q(w[0]);
    if (k) {
      r("warning", p, "Statement after .end is not rendered: " + d);
      continue;
    }
    if (g === ".control") {
      E = !0, r("warning", p, ".control script retained but not executed or rendered.");
      continue;
    }
    if (g === ".endc") {
      E = !1;
      continue;
    }
    if (E) continue;
    if (g === ".subckt") {
      u++, r("error", p, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (g === ".ends") {
      u ? u-- : r("error", p, "Unmatched .ends.");
      continue;
    }
    if (u) continue;
    if (g === ".end") {
      k = !0;
      continue;
    }
    if (g.startsWith(".")) {
      o.push({ line: p, text: d }), g === ".title" ? m = w.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(g) ? r("error", p, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(g) ? r("error", p, "Topology-changing directive is unsupported: " + d) : b.has(g) || r("warning", p, "Directive retained but not resolved: " + d);
      continue;
    }
    const C = w[0][0].toUpperCase();
    if (!Ye.has(C)) {
      p === 1 && !/\d/.test(w[0]) && w.length > 1 && C !== "X" ? (m = d, r("warning", p, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", p, `Unsupported ${C} device was not rendered: ${d}`);
      continue;
    }
    const y = C === "M" || C === "Q" ? 5 : 4;
    if (p === 1 && !/\d/.test(w[0]) && (w.length < y || C === "T" && !/\b(?:zo|z0)\s*=/i.test(d))) {
      m = d, r("info", p, "SPICE title: " + d);
      continue;
    }
    try {
      if (L.has(g)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const x = Qe(w, l), { pins: N, nodeTokens: M, ...T } = x;
      x.polarityKnown || r("warning", p, `${w[0]}: model polarity unknown; explicit ${N.join("/")} terminals retained.`);
      const P = he();
      N.forEach((H, re) => {
        const j = q(M[re]);
        s[j] || (s[j] = { name: j, displayName: w[re + 1], bit: Object.keys(s).length + 2, terminals: [] }), s[j].terminals.push({ component: w[0], pin: H }), P[H] = j;
      }), i.push({ ...T, name: w[0], terminals: P, line: p, raw: d }), L.add(g);
    } catch (x) {
      r("error", p, `${w[0]}: ${x.message} Statement: ${d}`);
    }
  }
  u && r("error", 0, "Unclosed .subckt definition."), E && r("error", 0, "Unclosed .control block."), i.length || r("error", 0, "No supported components to render."), i.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const p of i) {
    for (const d of p.controlSources || []) !d.includes(":") && !i.some((w) => q(w.name) === q(d) && w.kind === "V") && r("error", p.line, `${p.name}: controlling voltage source ${d} was not found.`);
    for (const d of p.coupledInductors || []) !d.includes(":") && !i.some((w) => q(w.name) === q(d) && w.kind === "L") && r("error", p.line, `${p.name}: coupled inductor ${d} was not found.`);
    (p.kind === "B" || p.type === "spice_b") && r("info", p.line, `${p.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: i, nodes: s, models: l, directives: o, diagnostics: n };
}
const K = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Ee = (t) => K(t).split("/").at(-1);
function Je(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), i = [], l = [], s = [];
  let r = 0;
  const c = (h, m) => {
    const u = K(m).split("/").slice(0, -1).concat(K(h)).join("/"), E = [...o].filter(([L]) => K(L) === K(h) || K(L) === u);
    if (E.length === 1) return E[0];
    const k = [...o].filter(([L]) => Ee(L) === Ee(h));
    if (k.length !== 1) throw Error(k.length ? "Ambiguous library filename: " + h : "Missing library " + h + ". Add this file using Library files.");
    return k[0];
  };
  function a(h, m, u = "", E = []) {
    const k = K(m) + ":" + u.toLowerCase();
    if (E.includes(k)) throw Error("Circular library include: " + [...E, k].join(" → "));
    if (E.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const L = [], b = /^\s*\.endl\b/im.test(h);
    let p = !u;
    const d = (g, C) => {
      if (r += g.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      s.push(g), l.push({ file: m, line: C + 1 });
    };
    if (h.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((g, C) => {
      const y = g.trim();
      if (/^\.lib\b/i.test(y) && b) {
        const x = le(y);
        if (x.length === 2 && !/[.\\/]/.test(x[1])) {
          L.push(x[1].toLowerCase()), x[1].toLowerCase() === u.toLowerCase() && (p = !0), d("* Library section " + x[1], C);
          return;
        }
      }
      if (/^\.endl\b/i.test(y)) {
        L.pop(), d("* End library section", C);
        return;
      }
      if (u && L.length && !L.includes(u.toLowerCase())) {
        d("* Unselected library section", C);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(y))
        try {
          const x = le(y);
          if (!x[1]) throw Error("Include requires a filename.");
          const [N, M] = c(x[1], m);
          d("* Included " + N, C), a(M, N, x[2] || "", [...E, k]);
        } catch (x) {
          i.push({ severity: "error", line: C + 1, source: m, message: x.message }), d("* Unresolved include", C);
        }
      else d(g, C);
    }), !p) throw Error("Library section " + u + " not found in " + m);
  }
  try {
    a(t, n);
  } catch (h) {
    i.push({ severity: "error", line: 0, source: n, message: h.message });
  }
  return { source: s.join(`
`), origins: l, diagnostics: i };
}
function et(t) {
  const e = [], n = [];
  let o = !1, i = !1, l = 0;
  if (t.split(/\r?\n/).forEach((b, p) => {
    const d = b.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(d)) {
      (i || o) && e.push({ severity: "error", line: p + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(d) || e.push({ severity: "error", line: p + 1, message: "Expected @layout begin v1." }), i = !0, o = !0, l = p + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(d)) {
      o || e.push({ severity: "error", line: p + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (d.startsWith("*") ? n.push(d.slice(1).trim()) : e.push({ severity: "error", line: p + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: l, message: "Unclosed @layout block." }), !i) return { layout: null, diagnostics: e };
  const s = n.join(" "), r = s.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], a = [];
  let h = 0, m = 0, u = 10;
  const E = () => r[h++], k = () => {
    const b = E();
    if (!b || !/^[A-Za-z_@][\w./%:@-]*$/.test(b)) throw Error("Expected layout identifier, got " + b);
    return b;
  };
  function L(b) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const p = b ? k() : "@row" + m++, d = E();
    if (!["row", "column"].includes(d)) throw Error("Expected row or column.");
    if (E() !== "{") throw Error("Expected { after " + d);
    const w = { id: p, direction: d, members: [] };
    for (c.push(w); h < r.length && r[h] !== "}"; )
      r[h] === "group" ? (E(), w.members.push(L(!0))) : ["row", "column"].includes(r[h]) ? w.members.push(L(!1)) : w.members.push(k());
    if (E() !== "}") throw Error("Unclosed group " + p);
    if (!w.members.length) throw Error("Empty layout group " + p);
    return p;
  }
  try {
    for (; h < r.length; )
      if (r[h] === "group")
        E(), L(!0);
      else if (["row", "column"].includes(r[h])) L(!1);
      else if (r[h] === "priority-cap") {
        if (E(), u = Number(E()), !Number.isInteger(u) || u < 3 || u > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const x = k(), N = E(), M = k();
        if (!["left-of", "above"].includes(N)) throw Error("Expected left-of or above.");
        a.push({ a: x, relation: N, b: M });
      } else throw Error("Unknown layout instruction near " + r[h - 1]);
    const b = /* @__PURE__ */ new Set();
    for (const x of c) {
      const N = x.id.toLowerCase();
      if (b.has(N)) throw Error("Duplicate layout group " + x.id);
      b.add(N);
    }
    const p = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Set(), w = new Map(c.map((x) => [x.id.toLowerCase(), x])), g = (x) => {
      if (p.has(x)) throw Error("Circular layout group " + x);
      if (!d.has(x)) {
        p.add(x);
        for (const N of w.get(x).members) w.has(N.toLowerCase()) && g(N.toLowerCase());
        p.delete(x), d.add(x);
      }
    };
    for (const x of w.keys()) g(x);
    const C = /* @__PURE__ */ new Map();
    for (const x of a) {
      if (x.a.toLowerCase() === x.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      C.has(x.a.toLowerCase()) || C.set(x.a.toLowerCase(), []), C.get(x.a.toLowerCase()).push(x.b.toLowerCase());
    }
    p.clear(), d.clear();
    const y = (x) => {
      if (p.has(x)) throw Error("Circular place constraints.");
      if (!d.has(x)) {
        p.add(x);
        for (const N of C.get(x) || []) y(N);
        p.delete(x), d.add(x);
      }
    };
    for (const x of C.keys()) y(x);
  } catch (b) {
    e.push({ severity: "error", line: l, message: "Layout description: " + b.message });
  }
  return { layout: { version: 1, priorityCap: u, groups: c, relations: a }, diagnostics: e };
}
function tt(t, e) {
  const n = t.ir.layoutDescription;
  if (!n) return null;
  const o = new Map(n.groups.map((a) => [a.id.toLowerCase(), a])), i = Object.values(t.contexts).flatMap((a) => a.devices.map((h) => h.name)), l = new Set([...Object.keys(t.contexts), ...i].map((a) => a.toLowerCase()));
  for (const a of o.values()) if (l.has(a.id.toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + a.id);
  for (const a of o.values()) for (const h of a.members) if (!o.has(h.toLowerCase()) && !l.has(h.toLowerCase())) throw Error("Unknown @layout instance/device: " + h);
  for (const a of n.relations) for (const h of [a.a, a.b]) if (!o.has(h.toLowerCase()) && !l.has(h.toLowerCase())) throw Error("Unknown @layout place target: " + h);
  if (e.focus) return null;
  const s = /* @__PURE__ */ new Map(), r = [];
  for (const a of n.groups) {
    const h = [];
    for (const m of a.members) {
      if (o.has(m.toLowerCase())) {
        h.push({ group: m });
        continue;
      }
      for (const u of e.components) if (u.name.toLowerCase() === m.toLowerCase() || u.name.toLowerCase().startsWith(m.toLowerCase() + "/")) {
        if (s.has(u.name)) throw Error("Overlapping @layout membership: " + u.name);
        s.set(u.name, a.id), h.push({ cell: u.name, instance: m });
      }
    }
    r.push({ id: a.id, direction: a.direction, members: h });
  }
  const c = /* @__PURE__ */ new Set();
  for (const a of r) for (const h of a.members) if (h.group) {
    const m = h.group.toLowerCase();
    if (c.has(m)) throw Error("Layout group has multiple parents: " + h.group);
    c.add(m);
  }
  return { version: 1, priorityCap: n.priorityCap, groups: r, relations: n.relations };
}
const te = () => /* @__PURE__ */ Object.create(null), V = (t) => t.toLowerCase();
function Ie(t) {
  const e = te();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!i) throw Error("Expected named parameter assignment, got: " + o);
    const l = V(i[1]);
    let s = i[2];
    if (s === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + l);
      s = r[1];
    }
    if (s || (s = t[++n]), !s || /^params?:$/i.test(s)) throw Error("Missing value for parameter " + l);
    if (Object.hasOwn(e, l)) throw Error("Duplicate parameter: " + l);
    e[l] = s;
  }
  return e;
}
function xe(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, te()] : [t.slice(0, e), Ie(t.slice(e))];
}
function nt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = et(t), o = Je(t, e);
  t = o.source;
  const i = [...o.diagnostics, ...n.diagnostics], l = te(), s = /* @__PURE__ */ new Set(["0"]), r = (d, w, g) => i.push({ severity: d, line: w, message: g }), c = (d, w, g, C = [], y = te(), x = 0) => {
    const N = { id: d, name: w, parent: g, ports: C, defaults: y, parameters: te(), definitions: te(), devices: [], instances: [], directives: [], line: x, statements: [] };
    return l[d] = N, N;
  }, a = c("root", "Top", null), h = [a], m = [];
  let u = !1, E = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((d, w) => {
    const g = d.trim();
    !g || g.startsWith("*") || (g.startsWith("+") ? m.length ? m.at(-1).text += " " + g.slice(1).trim() : r("error", w + 1, "Continuation has no preceding statement.") : m.push({ text: g, line: w + 1 }));
  });
  for (const { text: d, line: w } of m)
    try {
      const g = le(d);
      if (!g.length) continue;
      const C = V(g[0]), y = h.at(-1);
      if (E) {
        r("warning", w, "Statement after .end is not rendered: " + d);
        continue;
      }
      if (C === ".control") {
        u = !0, r("warning", w, ".control script retained but not executed or rendered.");
        continue;
      }
      if (C === ".endc") {
        u = !1;
        continue;
      }
      if (u) continue;
      if (C === ".subckt") {
        if (g.length < 2) throw Error(".SUBCKT requires a name.");
        const [x, N] = xe(g.slice(2)), M = V(g[1]);
        if (Object.hasOwn(y.definitions, M)) throw Error("Duplicate subcircuit definition: " + g[1]);
        const T = x.map(V);
        if (new Set(T).size !== x.length || T.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (x.some((H) => /[{}()=]/.test(H))) throw Error("Invalid formal port.");
        if (h.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const P = y.id + "/" + encodeURIComponent(M);
        y.definitions[M] = P, h.push(c(P, g[1], y.id, x, N, w));
        continue;
      }
      if (C === ".ends") {
        if (h.length === 1) throw Error("Unmatched .ENDS.");
        if (g[1] && V(g[1]) !== V(y.name)) throw Error(".ENDS name does not match " + y.name);
        h.pop();
        continue;
      }
      if (C === ".end") {
        if (h.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        E = !0;
        continue;
      }
      if (C === ".param") {
        const x = Ie(g.slice(1));
        for (const [N, M] of Object.entries(x)) {
          if (Object.hasOwn(y.parameters, N)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + N);
          y.parameters[N] = M;
        }
      }
      if (C === ".global") {
        if (g.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const x of g.slice(1)) s.add(V(x));
      }
      if (C.startsWith(".") && y.directives.push({ line: w, text: d }), C.startsWith("x")) {
        const [x, N] = xe(g.slice(1));
        if (!x.length) throw Error("X instance requires a subcircuit name.");
        const M = /;§pnba\s+(.+)$/i.exec(d)?.[1].split(")");
        y.instances.push({ name: g[0], nodes: x.slice(0, -1).map(V), definitionName: x.at(-1), definitionId: null, parameters: N, line: w, raw: d, pinNames: M });
      } else y.statements.push({ line: w, text: d });
    } catch (g) {
      r("error", w, g.message + " Statement: " + d);
    }
  h.length > 1 && r("error", h.at(-1).line, "Unclosed .SUBCKT " + h.at(-1).name), u && r("error", 0, "Unclosed .control block.");
  function k(d, w) {
    for (; d; ) {
      if (Object.hasOwn(d.definitions, V(w))) return d.definitions[V(w)];
      d = l[d.parent];
    }
    return null;
  }
  for (const d of Object.values(l)) {
    const w = [...d.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...d.statements], g = Ze(w.map((y) => y.text).join(`
`), { models: l[d.parent]?.models });
    d.devices = g.components.map((y) => ({ ...y, line: w[y.line - 1]?.line || d.line })), d.models = g.models, d === a && (a.title = g.title), i.push(...g.diagnostics.filter((y) => !y.message.includes("No supported components to render.") && !y.message.includes("300 components")).map((y) => ({ ...y, line: w[y.line - 1]?.line || d.line })));
    const C = new Set(d.devices.map((y) => V(y.name)));
    for (const y of d.instances)
      if (C.has(V(y.name)) && r("error", y.line, "Duplicate instance/device name: " + y.name), C.add(V(y.name)), y.definitionId = k(d, y.definitionName), !y.definitionId && !/^\{[\s\S]*\}$/.test(y.definitionName)) r("error", y.line, "Undefined subcircuit: " + y.definitionName + " in " + y.name);
      else if (y.definitionId) {
        const x = l[y.definitionId];
        x.ports.length !== y.nodes.length && r("error", y.line, `${y.name}: ${x.name} expects ${x.ports.length} ports; got ${y.nodes.length}.`);
      }
  }
  for (const d of Object.values(l)) delete d.statements;
  const L = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set();
  function p(d, w = []) {
    if (L.has(d)) {
      r("error", l[d].line, "Circular subcircuit reference: " + [...w, l[d].name].join(" → "));
      return;
    }
    if (!b.has(d)) {
      if (L.add(d), w.length >= 64) {
        r("error", l[d].line, "Subcircuit dependency nesting exceeds 64 levels."), L.delete(d), b.add(d);
        return;
      }
      for (const g of l[d].instances) g.definitionId && p(g.definitionId, [...w, l[d].name]);
      L.delete(d), b.add(d);
    }
  }
  for (const d of Object.keys(l)) p(d);
  !a.devices.length && !a.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const d of i) !d.source && d.line && o.origins[d.line - 1] && (d.source = o.origins[d.line - 1].file, d.line = o.origins[d.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: l, globals: [...s], diagnostics: i, layoutDescription: n.layout };
}
const U = () => /* @__PURE__ */ Object.create(null), ee = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), me = (t, e) => ee(t.map((n) => n.toLowerCase()), e.toLowerCase());
function rt(t, e = []) {
  const n = U(), o = (i) => n[i] || (n[i] = { name: i, displayName: i.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const i of t) for (const [l, s] of Object.entries(i.terminals)) o(s).terminals.push({ component: i.name, pin: l });
  for (const i of e) o(i);
  return n;
}
function ot(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Ce = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, it = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function de(t, e, n = (i) => i, o = (i) => i) {
  const i = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (s) => (i.push(s), "@@" + (i.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (s, r, c) => {
    const a = c.split(",").map((m) => m.trim());
    if (a.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + s);
    const h = r.toUpperCase() + "(" + a.map((m) => r.toLowerCase() === "v" ? n(m) : o(m, r)).join(",") + ")";
    return i.push(h), "@@" + (i.length - 1) + "@@";
  });
  let l = t.length;
  return t = t.replace(it, (s, r, c) => {
    if (c.slice(r + s.length).trimStart().startsWith("(")) return s;
    const a = e(s.toLowerCase());
    if (a === void 0) return s;
    if (l += a.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), t.replace(/@@(\d+)@@/g, (s, r) => i[Number(r)]);
}
function st(t, e, n, o) {
  const i = { ...e, ...n }, l = U(), s = /* @__PURE__ */ new Set(), r = U();
  for (const [a, h] of Object.entries(o)) r[a] = de(Ce(h), (m) => t[m]);
  function c(a) {
    if (Object.hasOwn(r, a)) return r[a];
    if (Object.hasOwn(l, a)) return l[a];
    if (!Object.hasOwn(i, a)) return t[a];
    if (s.has(a)) {
      if (Object.hasOwn(t, a)) return t[a];
      throw Error("Circular parameter dependency: " + [...s, a].join(" → "));
    }
    return s.add(a), l[a] = de(Ce(i[a]), c), s.delete(a), l[a];
  }
  for (const a of Object.keys(i)) c(a);
  return Object.assign(U(), t, l, r);
}
function ve(t, e, n, o) {
  let i = "";
  for (let c = 0; c < t.length; ) {
    const a = t[c];
    if (a !== "{" && a !== "'") {
      i += a, c++;
      continue;
    }
    const h = c++;
    let m = 1, u = "";
    for (; c < t.length && m; c++) {
      if (a === "'") {
        t[c] === "'" && (m = 0);
        continue;
      }
      if (u) {
        t[c] === u && (u = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        u = t[c];
        continue;
      }
      t[c] === "{" && m++, t[c] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    i += a + de(t.slice(h + 1, c - 1), (E) => e[E], n, o) + (a === "{" ? "}" : "'");
  }
  const l = [];
  let s = 0, r = "";
  for (let c = 0; c < i.length; c++) {
    const a = i[c];
    if (r) {
      a === r && i[c - 1] !== "\\" && (r = "");
      continue;
    }
    if (a === '"' || a === "'") {
      r = a;
      continue;
    }
    if ("({".includes(a) && s++, ")}".includes(a) && s--, !s && (c === 0 || /\s/.test(i[c - 1]))) {
      const h = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(c));
      h && (l.push({ start: c, end: c + h[0].length, key: h[1].toLowerCase() }), c += h[0].length - 1);
    }
  }
  if (l.length) {
    let c = i.slice(0, l[0].start);
    l.forEach((a, h) => {
      const m = l[h + 1]?.start ?? i.length, u = i.slice(a.end, m);
      c += i.slice(a.start, a.end) + (u.includes("{") || ["refnode", "intnode"].includes(a.key) ? u : de(u, (E) => e[E], n, o));
    }), i = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (i = "{" + e[t.toLowerCase()] + "}");
  return i;
}
class at {
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
class ct {
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
class f {
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
    return "JavaScript Expression Parser (JSEP) v" + f.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return f.max_unop_len = Math.max(e.length, f.max_unop_len), f.unary_ops[e] = 1, f;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return f.max_binop_len = Math.max(e.length, f.max_binop_len), f.binary_ops[e] = n, o ? f.right_associative.add(e) : f.right_associative.delete(e), f;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return f.additional_identifier_chars.add(e), f;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return f.literals[e] = n, f;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete f.unary_ops[e], e.length === f.max_unop_len && (f.max_unop_len = f.getMaxKeyLen(f.unary_ops)), f;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return f.unary_ops = {}, f.max_unop_len = 0, f;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return f.additional_identifier_chars.delete(e), f;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete f.binary_ops[e], e.length === f.max_binop_len && (f.max_binop_len = f.getMaxKeyLen(f.binary_ops)), f.right_associative.delete(e), f;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return f.binary_ops = {}, f.max_binop_len = 0, f;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete f.literals[e], f;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return f.literals = {}, f;
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
    return new f(e).parse();
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
    return f.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !f.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    f.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return f.isIdentifierStart(e) || f.isDecimalDigit(e);
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
    if (f.hooks[e]) {
      const o = { context: this, node: n };
      return f.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (f.hooks[e]) {
      const n = { context: this };
      return f.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === f.SPACE_CODE || e === f.TAB_CODE || e === f.LF_CODE || e === f.CR_CODE; )
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
      type: f.COMPOUND,
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
      if (o = this.code, o === f.SEMCOL_CODE || o === f.COMMA_CODE)
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
    let e = this.expr.substr(this.index, f.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (f.binary_ops.hasOwnProperty(e) && (!f.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !f.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, o, i, l, s, r, c, a;
    if (s = this.gobbleToken(), !s || (n = this.gobbleBinaryOp(), !n))
      return s;
    for (l = { value: n, prec: f.binaryPrecedence(n), right_a: f.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), i = [s, l, r]; n = this.gobbleBinaryOp(); ) {
      if (o = f.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      l = { value: n, prec: o, right_a: f.right_associative.has(n) }, a = n;
      const h = (m) => l.right_a && m.right_a ? o > m.prec : o <= m.prec;
      for (; i.length > 2 && h(i[i.length - 2]); )
        r = i.pop(), n = i.pop().value, s = i.pop(), e = {
          type: f.BINARY_EXP,
          operator: n,
          left: s,
          right: r
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), i.push(l, e);
    }
    for (c = i.length - 1, e = i[c]; c > 1; )
      e = {
        type: f.BINARY_EXP,
        operator: i[c - 1].value,
        left: i[c - 2],
        right: e
      }, c -= 2;
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
    if (e = this.code, f.isDecimalDigit(e) || e === f.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === f.SQUOTE_CODE || e === f.DQUOTE_CODE)
      i = this.gobbleStringLiteral();
    else if (e === f.OBRACK_CODE)
      i = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, f.max_unop_len), o = n.length; o > 0; ) {
        if (f.unary_ops.hasOwnProperty(n) && (!f.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !f.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: f.UNARY_EXP,
            operator: n,
            argument: l,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      f.isIdentifierStart(e) ? (i = this.gobbleIdentifier(), f.literals.hasOwnProperty(i.name) ? i = {
        type: f.LITERAL,
        value: f.literals[i.name],
        raw: i.name
      } : i.name === f.this_str && (i = { type: f.THIS_EXP })) : e === f.OPAREN_CODE && (i = this.gobbleGroup());
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
    for (; n === f.PERIOD_CODE || n === f.OBRACK_CODE || n === f.OPAREN_CODE || n === f.QUMARK_CODE; ) {
      let o;
      if (n === f.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== f.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === f.OBRACK_CODE ? (e = {
        type: f.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== f.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === f.OPAREN_CODE ? e = {
        type: f.CALL_EXP,
        arguments: this.gobbleArguments(f.CPAREN_CODE),
        callee: e
      } : (n === f.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: f.MEMBER_EXP,
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
    for (; f.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === f.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); f.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); f.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      f.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, f.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === f.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === f.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: f.LITERAL,
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
      let l = this.expr.charAt(this.index++);
      if (l === o) {
        i = !0;
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
    return i || this.throwError('Unclosed quote after "' + e + '"'), {
      type: f.LITERAL,
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
    for (f.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, f.isIdentifierPart(e)); )
      this.index++;
    return {
      type: f.IDENTIFIER,
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
      let l = this.code;
      if (l === e) {
        o = !0, this.index++, e === f.CPAREN_CODE && i && i >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === f.COMMA_CODE) {
        if (this.index++, i++, i !== n.length) {
          if (e === f.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === f.CBRACK_CODE)
            for (let s = n.length; s < i; s++)
              n.push(null);
        }
      } else if (n.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const s = this.gobbleExpression();
        (!s || s.type === f.COMPOUND) && this.throwError("Expected comma"), n.push(s);
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
    let e = this.gobbleExpressions(f.CPAREN_CODE);
    if (this.code === f.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: f.SEQUENCE_EXP,
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
      type: f.ARRAY_EXP,
      elements: this.gobbleArguments(f.CBRACK_CODE)
    };
  }
}
const lt = new at();
Object.assign(f, {
  hooks: lt,
  plugins: new ct(f),
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
f.max_unop_len = f.getMaxKeyLen(f.unary_ops);
f.max_binop_len = f.getMaxKeyLen(f.binary_ops);
const ne = (t) => new f(t).parse(), dt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(f).filter((t) => !dt.includes(t) && ne[t] === void 0).forEach((t) => {
  ne[t] = f[t];
});
ne.Jsep = f;
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
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: ut,
            test: o,
            consequent: i,
            alternate: l
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let s = o;
            for (; s.right.operator && t.binary_ops[s.right.operator] <= 0.9; )
              s = s.right;
            n.node.test = s.right, s.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ne.plugins.register(ft);
const ht = "ConditionalExpression";
var pt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: ht,
            test: o,
            consequent: i,
            alternate: l
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let s = o;
            for (; s.right.operator && t.binary_ops[s.right.operator] <= 0.9; )
              s = s.right;
            n.node.test = s.right, s.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ne.plugins.register(pt);
const mt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Oe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, _ = (t) => Number(t) > 0.5;
function se(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function i(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, a, h, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), u = h.toLowerCase(), E = u.startsWith("meg") ? 1e6 : u.startsWith("mil") ? 254e-7 : mt[u[0]] || 1;
      return "(" + (m ? +(a + (a.includes(".") ? "" : ".") + m) : Number(a)) * E + ")";
    }), l(ne(r));
  }
  function l(r) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const c = r.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const a = i(e[c]);
      return n.delete(c), a;
    }
    if (r.type === "ConditionalExpression") return _(l(r.test)) ? l(r.consequent) : l(r.alternate);
    if (r.type === "UnaryExpression") {
      const c = l(r.argument);
      if (r.operator === "-") return -c;
      if (r.operator === "+") return +c;
      if (r.operator === "!" || r.operator === "~") return !_(c);
    }
    if (r.type === "BinaryExpression") {
      const c = l(r.left);
      if (r.operator === "&&") return _(c) && _(l(r.right));
      if (r.operator === "||") return _(c) || _(l(r.right));
      const a = l(r.right);
      switch (r.operator) {
        case "+":
          return c + a;
        case "-":
          return c - a;
        case "*":
          return c * a;
        case "/":
          return c / a;
        case "**":
          return c ** a;
        case "%":
          return c % a;
        case "^":
          return _(c) !== _(a);
        case "&":
          return _(c) && _(a);
        case "|":
          return _(c) || _(a);
        case ">":
          return c > a;
        case "<":
          return c < a;
        case ">=":
          return c >= a;
        case "<=":
          return c <= a;
        case "==":
        case "===":
          return c === a;
        case "!=":
        case "!==":
          return c !== a;
      }
    }
    if (r.type === "CallExpression" && r.callee.type === "Identifier") {
      const c = r.callee.name.toLowerCase();
      if (c === "if") {
        if (r.arguments.length !== 3) throw Error("if() needs three arguments.");
        return _(l(r.arguments[0])) ? l(r.arguments[1]) : l(r.arguments[2]);
      }
      if (Object.hasOwn(Oe, c)) return Oe[c](...r.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const s = i(t);
  if (typeof s == "number" && !Number.isFinite(s)) throw Error("Structural expression is not finite.");
  return s;
}
function gt(t) {
  ot(t);
  const e = U(), n = /* @__PURE__ */ new Map();
  let o = 0, i = 0;
  function l(s, r, c, a, h, m, u) {
    if (r.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[s], k = r.length ? ee(r.slice(0, -1), r.at(-1)) : "", L = U();
    if (u.some((C) => C.scopeId === s)) throw Error("Circular subcircuit reference at " + k);
    const b = st(a, E.defaults, E.parameters, h);
    function p(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const x = se(C, b);
        C = String(typeof x == "boolean" ? Number(x) : x);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const y = C.toLowerCase();
      return Object.hasOwn(c, y) ? c[y] : t.globals.includes(y) ? me([], y) : L[y] || (L[y] = me(r, y));
    }
    const d = { id: k, path: r, scopeId: s, name: m?.name || "Top", definition: E.name, ports: E.ports.map((C) => ({ name: C, node: p(C) })), params: b, nodes: L, models: U(), devices: [], children: [], raw: m?.raw || "", line: m?.line || 0 };
    e[k] = d, n.set(k, p);
    const w = [...u, d];
    function g(C) {
      if (!C) return "";
      let y = E;
      for (; y; ) {
        if (y.directives.some((x) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(x.text))) {
          const x = [...w].reverse().find((N) => N.scopeId === y.id);
          return ee(x?.path || [], C.toLowerCase());
        }
        y = t.scopes[y.parent];
      }
      return C;
    }
    for (const C of E.directives.filter((y) => /^\.model\b/i.test(y.text))) {
      const y = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!y) continue;
      const x = g(y), N = E.models[y.toLowerCase()], M = ve(C.text, b, p, (T) => ee(r, T));
      d.models[x] = { ...N, name: x, raw: M.replace(/^(\.model\s+)\S+/i, (T, P) => P + x), instanceId: k, parameters: b };
    }
    for (const C of E.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const y = U();
      for (const [N, M] of Object.entries(C.terminals)) y[N] = p(M);
      const x = g(C.model);
      d.devices.push({ ...C, name: ee(r, C.name), localName: C.name, instanceId: k, terminals: y, model: x, parameters: b });
    }
    for (const C of E.instances) {
      let y = C.definitionId;
      if (!y) {
        const T = String(se(C.definitionName, b)).toLowerCase();
        let P = E;
        for (; P && !y; )
          y = P.definitions[T], P = t.scopes[P.parent];
        if (!y) throw Error("Undefined selected subcircuit: " + T);
      }
      const x = t.scopes[y], N = U();
      if (x.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + x.ports.length + " ports; got " + C.nodes.length);
      x.ports.forEach((T, P) => {
        N[T.toLowerCase()] = p(C.nodes[P]);
      });
      const M = l(y, [...r, C.name], N, b, C.parameters, C, w);
      C.pinNames?.length === M.ports.length && M.ports.forEach((T, P) => {
        T.label = C.pinNames[P];
      }), d.children.push(M);
    }
    return d;
  }
  try {
    let h = function(m, u) {
      const E = u.split(":");
      if (E.length === 1) return { owner: m, name: u };
      const k = E.pop();
      for (const L of [[...m.path, ...E], E]) {
        const b = r.get(L.map(encodeURIComponent).join("/").toLowerCase());
        if (b) return { owner: b, name: k };
      }
      throw Error("Unknown hierarchical reference: " + u);
    };
    const s = l(t.rootId, [], U(), U(), U(), null, []), r = new Map(Object.values(e).map((m) => [m.id.toLowerCase(), m])), c = Object.assign(U(), ...Object.values(e).map((m) => m.models)), a = (m) => c[m] || Object.entries(c).find(([u]) => u.startsWith(m + "."))?.[1];
    for (const m of Object.values(e)) for (const u of m.devices) {
      const E = t.scopes[m.scopeId].devices.find((b) => b.name === u.localName), k = (b) => {
        const p = h(m, b);
        return n.get(p.owner.id)(p.name);
      }, L = (b, p = "", d = "") => {
        const w = h(m, b), g = w.owner.devices.find((C) => C.localName.toLowerCase() === w.name.toLowerCase());
        if (p.toLowerCase() === "ix") {
          const C = w.owner.ports.find((y, x) => y.name.toLowerCase() === w.name.toLowerCase() || String(x + 1) === w.name);
          if (C) return w.owner.id + ":" + C.name;
        }
        if (!g) {
          if (d) throw Error(u.name + ": referenced " + d + " device " + b + " was not found.");
          return ee(w.owner.path, w.name);
        }
        if (d && g.kind !== d) throw Error(u.name + ": " + b + " must be a " + d + " device.");
        return g.name;
      };
      if (u.value = ve(E.value, m.params, k, L), E.model && (u.value = u.value.replace(E.model, u.model)), u.kind === "M" && Object.keys(u.terminals).length === 3) {
        let b = a(u.model), p = !1;
        const d = /* @__PURE__ */ new Set();
        for (; b?.type === "VDMOS" && !d.has(b.name); ) {
          d.add(b.name);
          const w = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(b.raw);
          if (w) {
            p = w[1] === void 0 || Number(se(w[1], b.parameters)) >= 0.5;
            break;
          }
          const g = b.name.includes("/") ? b.name.slice(0, b.name.lastIndexOf("/") + 1) : "";
          b = a(g + (b.baseModel || "").toLowerCase()) || a((b.baseModel || "").toLowerCase());
        }
        d.size && (u.type = "spice_" + (p ? "pmos3" : "nmos3"));
      }
      u.controlSources = (E.controlSources || []).map((b) => L(b, "", "V")), u.controlSource = u.controlSources[0] || "", u.coupledInductors = (E.coupledInductors || []).map((b) => L(b, "", "L"));
      for (const b of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const p = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        u.value = u.value.replace(new RegExp("(?<![\\w./%])" + p + "(?![\\w.$])", "g"), () => L(b));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: s, contexts: e };
  } catch (s) {
    throw s.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: s.message }], s;
  }
}
function ae(t) {
  return [...t.devices, ...t.children.flatMap(ae)];
}
function Se(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const ke = 4;
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
const ce = (t) => ["pwr", "ret", "bias"].includes(t), bt = (t) => String(t).split("/").at(-1).toLowerCase(), De = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[bt(t)] || "unknown", wt = (t) => {
  const e = ge(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || De(t);
};
function yt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (s, r, c) => {
    e.has(s) || e.set(s, []), e.get(s).push({ node: r, delta: c });
  };
  for (const s of t)
    if (s.kind === "V")
      try {
        let r = s.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (c && Number(se(c[1], s.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!a) continue;
        const h = se(a[1], s.parameters);
        if (typeof h != "number" || !Number.isFinite(h)) continue;
        o(s.terminals["-"], s.terminals["+"], h), o(s.terminals["+"], s.terminals["-"], -h);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const s of ["0", ...e.keys()]) {
    if (l.has(s)) continue;
    const r = /* @__PURE__ */ new Map([[s, 0]]), c = [s];
    l.add(s);
    let a = !1;
    for (let h = 0; h < c.length; h++) for (const m of e.get(c[h]) || []) {
      const u = r.get(c[h]) + m.delta;
      r.has(m.node) ? Math.abs(r.get(m.node) - u) > 1e-8 * Math.max(1, Math.abs(u)) && (a = !0) : (r.set(m.node, u), l.add(m.node), c.push(m.node));
    }
    a && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [h, m] of r) i[h] = { value: m, reference: s, known: s === "0" && !a, consistent: !a };
  }
  return { nodes: i, diagnostics: n };
}
function Et(t, e) {
  const n = yt(ae(t.root)), o = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const s of Object.values(e.nodes)) {
    const r = ge(s.name), c = De(s.name);
    o[s.name] = { role: r !== "unknown" ? r : c, roleSource: r !== "unknown" ? "node-name" : c !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[s.name]?.known ? n.nodes[s.name].value : null };
  }
  const l = (s, r, c) => {
    const a = { role: o[c].role, roleSource: o[c].roleSource }, h = s.block?.ports.find((E) => E.pin === r);
    if (h?.implicit || !s.block && !s.synthetic) return a;
    const m = s.synthetic ? s.value : h?.name || h?.label, u = wt(m);
    return u !== "unknown" ? { role: u, roleSource: ge(m) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ce(a.role) ? { ...a, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const s of e.components) {
    const r = Object.fromEntries(Object.entries(s.terminals).map(([g, C]) => [g, { ...o[C], ...l(s, g, C) }])), c = Object.values(r), a = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(s.type), h = a && c.length === 2 && c.every((g) => !ce(g.role) && (g.potential === null || g.role !== "unknown")), m = s.terminals["+"], u = s.terminals["-"], E = [m, u].filter((g) => g && g !== "0"), k = s.kind === "V" && E.some((g) => ce(o[g]?.role)) && !E.some((g) => ["in", "out", "io", "fb"].includes(o[g]?.role)) && [m, u].every((g) => n.nodes[g]?.known), L = m === "0" ? u : m, b = Object.keys(s.terminals), p = (g) => ce(g.role) ? g.potential !== null ? g.potential > 0 ? "high" : "low" : g.role === "ret" ? "low" : "high" : "signal";
    let d = !1;
    b.length === 2 && (s.terminals[b[0]] === "0" ? d = !0 : s.terminals[b[1]] === "0" ? d = !1 : c.every((g) => g.potential !== null) ? d = c[0].potential < c[1].potential : d = p(c[0]) === "low" || p(c[1]) === "high" && p(c[0]) === "signal");
    const w = s.synthetic ? "" : s.name.startsWith(e.focus + "/") ? s.name.slice(e.focus.length + 1) : s.name;
    i[s.name] = { version: ke, kind: s.kind, owner: w.includes("/") ? w.slice(0, w.lastIndexOf("/")) : "", passive: a, source: ["V", "I", "E", "F", "G", "H"].includes(s.kind) || s.kind === "B" && !a, ports: r, horizontal: h, orientation: h ? "horizontal" : d ? "vertical-reversed" : "vertical", flexible: b.length === 2 && (a || ["V", "I", "B", "F", "H"].includes(s.kind)), supply: !!k, voltage: k ? n.nodes[L].value : null };
  }
  return { version: ke, nodes: o, cells: i, diagnostics: n.diagnostics };
}
function Ne(t, e) {
  const n = e.ports.map((i, l) => ({ pin: "P" + l, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), o = new Set(ae(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of t.ir.globals) {
    const l = me([], i);
    o.has(l) && !n.some((s) => s.node === l) && n.push({ pin: "G" + n.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: l, implicit: !0 });
  }
  return n;
}
function xt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  const l = [], s = [];
  function r(h) {
    s.push(...Object.values(h.nodes), ...h.ports.map((u) => u.node));
    const m = [...h.devices.map((u) => ({ line: u.line, device: u })), ...h.children.map((u) => ({ line: u.line, child: u }))].sort((u, E) => u.line - E.line);
    for (const u of m) {
      if (u.device) {
        const b = u.device;
        l.push({ ...b, layoutLabel: [...h.path.slice(i.path.length), b.localName].join("/") });
        continue;
      }
      const E = u.child;
      if (e === "flat" || n.has(E.id)) {
        r(E);
        continue;
      }
      const k = Ne(t, E), L = U();
      k.forEach((b) => {
        L[b.pin] = b.node;
      }), l.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: L, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(i.path.length).join("/"), block: { definitionId: E.scopeId, ports: k, parameters: E.params } });
    }
  }
  r(i);
  for (const [h, m] of i.ports.entries()) l.push({ name: "@port/" + o + "/" + h, kind: "PORT", type: "spice_port", terminals: { A: m.node }, layoutLabel: m.name, value: m.name, raw: "Interface port " + m.name, synthetic: !0 });
  if (l.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(U(), ...Object.values(t.contexts).map((h) => h.models)), a = { title: o || t.ir.title, components: l, nodes: rt(l, s), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  return a.topology = Ct(t, a), a.layout = Et(t, a), a.layout.description = tt(t, a), a;
}
function Ct(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e.components)
    if (!s.synthetic)
      if (s.kind === "X") {
        const r = t.contexts[s.instanceId];
        if (!r) throw Error("Projection contains an unknown block.");
        const c = Ne(t, r);
        if (JSON.stringify(Object.entries(s.terminals)) !== JSON.stringify(c.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + s.name);
        n.push(...ae(r));
      } else n.push(s);
  for (const s of n) {
    if (o.has(s.name)) throw Error("Projection duplicates " + s.name);
    o.add(s.name);
  }
  const i = Se(n), l = ae(t.contexts[e.focus]);
  if (i !== Se(l)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: i };
}
function vt(t) {
  const e = U(), n = U();
  for (const o of t.components) {
    const i = U(), l = U();
    for (const [s, r] of Object.entries(o.terminals))
      i[s] = [t.nodes[r].bit], l[s] = "input";
    e[o.name] = { type: o.type, port_directions: l, connections: i, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((s) => ({ pin: s.pin, label: s.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((s, r) => ({ pin: s, label: o.pinLabels?.[r] || s })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceLayoutDescription: t.layout?.description || null } } };
}
function Ot(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, i = (c) => (n.has(c) || n.set(c, n.size + 2), n.get(c));
  Object.entries(t.modules.circuit.cells).forEach(([c, a], h) => {
    const m = "c" + h;
    e.set(m, c);
    const u = Object.fromEntries(Object.entries(a.connections).map(([E, k]) => [E, k.map(i)]));
    o[m] = { type: a.type, connections: u, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (o[m].spiceBlock = a.spiceBlock), a.spiceSymbol && (o[m].spiceSymbol = a.spiceSymbol), a.spiceLayout && (o[m].spiceLayout = a.spiceLayout);
  });
  const l = new Map([...e].map(([c, a]) => [a, c])), s = t.modules.circuit.spiceLayoutDescription, r = s ? { ...s, groups: s.groups.map((c) => ({ ...c, members: c.members.map((a) => a.cell ? { ...a, cell: l.get(a.cell) } : a) })), relations: s.relations.map((c) => ({ ...c, a: l.get(c.a) || c.a, b: l.get(c.b) || c.b })) } : null;
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([c, a]) => [a, c])) };
}
const Q = /* @__PURE__ */ new Map();
async function St(t, e) {
  const n = Ot(t), o = JSON.stringify([n.netlist, e]);
  let i = Q.get(o);
  i ? (Q.delete(o), Q.set(o, i)) : (i = await kt(n.netlist, e), i.length < 1e6 && (Q.set(o, i), Q.size > 20 && Q.delete(Q.keys().next().value)));
  const l = new DOMParser().parseFromString(i, "image/svg+xml");
  if (l.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const s of l.querySelectorAll("[id],[class]")) {
    const r = s.getAttribute("id");
    r?.startsWith("cell_") && n.ids.has(r.slice(5)) && s.setAttribute("id", "cell_" + n.ids.get(r.slice(5)));
    const c = s.getAttribute("class");
    c && s.setAttribute("class", c.split(/\s+/).map((a) => a.startsWith("cell_") && n.ids.has(a.slice(5)) ? "cell_" + n.ids.get(a.slice(5)) : /^net_\d+$/.test(a) && n.bits.has(Number(a.slice(4))) ? "net_" + n.bits.get(Number(a.slice(4))) : a).join(" "));
  }
  return new XMLSerializer().serializeToString(l.documentElement);
}
function kt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-CnSf-L4p.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, i) => {
    const l = (c, a) => {
      clearTimeout(r), n.terminate(), c ? i(Error(c)) : o(a);
    }, s = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => l("Layout timed out. Open a subcircuit sheet or collapse instances."), s);
    n.onmessage = ({ data: c }) => l(c.error, c.svg), n.onerror = (c) => l(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Lt = `* Mixed RLC, semiconductors and nonlinear / controlled sources
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
`, It = `* Two parameterized channels, each with two nested filter instances
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
`, Dt = `* Viewer grammar coverage: all documented LTspice 24+ element prefixes
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
`, Nt = `* Voltage-divider biased common-emitter amplifier; layout regression.
* Topology reference: Analog Devices, Single Transistor Amplifier Stages, 9.2.
V1 vcc 0 12
V2 in 0 SINE(0 10m 1k) AC 1
C1 in b 1u
R1 vcc b 47k
R2 b 0 10k
RC vcc c 4.7k
RE e 0 1k
CE e 0 100u
Q1 c b e 2N3904
.model 2N3904 NPN(IS=6.7f BF=200 VAF=100)
.tran 5m
.end
`;
function Rt(t) {
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
  return Rt(await t.arrayBuffer());
}
const O = (t) => document.getElementById("spice-" + t), ie = O("app");
if (ie) {
  let g = function() {
    i = "", d(), n.textContent = "Input changed — generate to refresh the schematic.";
  }, C = function(v) {
    o.replaceChildren();
    for (const { severity: S, line: A, message: R, source: I } of v) {
      const B = document.createElement("li");
      B.className = S, B.textContent = `${S.toUpperCase()}${I && I !== "input.cir" ? " · " + I : ""}${A ? " · line " + A : ""}: ${R}`, o.append(B);
    }
    O("messages").open = v.some((S) => S.severity !== "info"), O("message-count").textContent = `${v.length} message${v.length === 1 ? "" : "s"}`;
  }, y = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${u.x} ${u.y} ${u.w} ${u.h}`), O("zoom-level").textContent = Math.round(E.w / u.w * 100) + "%";
  }, x = function(v, S = u.x + u.w / 2, A = u.y + u.h / 2) {
    if (!e.querySelector("svg")) return;
    const R = Math.max(0.05, Math.min(10, u.w * v / E.w)) * E.w / u.w;
    u = { x: S + (u.x - S) * R, y: A + (u.y - A) * R, w: u.w * R, h: u.h * R }, y();
  }, M = function(v) {
    const S = new URLSearchParams();
    v && S.set("instance", v);
    const A = S.toString();
    location.hash.slice(1) === A ? (a = v, j()) : location.hash = A;
  }, T = function() {
    a = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, P = function(v) {
    const S = s.contexts[v].path;
    for (let A = 1; A <= S.length; A++) L.add(S.slice(0, A).map(encodeURIComponent).join("/"));
  }, H = function() {
    const v = !!(h && h !== a && s?.contexts[h]);
    O("selection-actions").hidden = !v, O("toggle-instance").textContent = L.has(h) ? "Collapse instance" : "Expand instance", O("toggle-instance").disabled = !1, O("open-instance").href = "#" + new URLSearchParams({ instance: h });
  }, re = function() {
    O("breadcrumbs").replaceChildren();
    const v = (A, R) => {
      const I = document.createElement("button");
      I.type = "button", I.textContent = A, I.onclick = () => M(R), I.disabled = R === a, O("breadcrumbs").append(I);
    };
    if (v("Top", ""), a) {
      const A = s.contexts[a].path;
      for (let R = 0; R < A.length; R++) v(A[R], A.slice(0, R + 1).map(encodeURIComponent).join("/"));
    }
    O("instances").replaceChildren();
    const S = (A, R) => {
      for (const I of A.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(R, 8)), B.dataset.instance = I.id;
        const z = document.createElement("button");
        z.type = "button", z.textContent = L.has(I.id) ? "−" : "+", z.title = (L.has(I.id) ? "Collapse " : "Expand ") + I.id, z.setAttribute("aria-label", z.title), z.setAttribute("aria-expanded", String(L.has(I.id))), z.onclick = () => {
          L.has(I.id) ? L.delete(I.id) : P(I.id), h = I.id, j();
        };
        const Y = document.createElement("a");
        Y.href = "#" + new URLSearchParams({ instance: I.id }), Y.textContent = I.name + " · " + I.definition, Y.title = "Open " + I.id + " as its own sheet";
        const G = document.createElement("span");
        if (G.className = "spice-help", G.textContent = Object.entries(I.params).map(([W, Z]) => W + "=" + Z).join(" · "), B.append(z, Y), G.textContent) {
          const W = document.createElement("details"), Z = document.createElement("summary");
          Z.textContent = "Parameters", W.append(Z, G), B.append(W);
        }
        O("instances").append(B), S(I, R + 1);
      }
    };
    S(s.contexts[a], 0), O("hierarchy-panel").hidden = !s.contexts[a].children.length, O("focus-title").textContent = a ? a + " / " + s.contexts[a].definition : "Top-level schematic", H();
  };
  const t = O("input"), e = O("preview"), n = O("status"), o = O("diagnostics");
  let i = "", l, s, r, c = "", a = "", h = "", m = !1, u = { x: 0, y: 0, w: 1, h: 1 }, E = { ...u }, k;
  const L = /* @__PURE__ */ new Set();
  let b = !1, p = {};
  try {
    p = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ie.addEventListener("click", (v) => {
    m && v.target.closest('a[href^="#"]') && v.preventDefault();
  });
  const d = () => {
    O("copy").disabled = O("download").disabled = !i || m;
  }, w = () => ({ font: O("font").value, fontSize: Number(O("size").value), color: O("color").value, detailed: O("detailed").checked, conventional: O("conventional").checked });
  t.value = pe;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || pe;
  } catch {
  }
  t.addEventListener("input", g);
  for (const v of ["font", "size", "color", "detailed", "conventional"]) O(v).addEventListener("input", g);
  O("zoom-in").onclick = () => x(0.8), O("zoom-out").onclick = () => x(1.25), O("fit").onclick = () => {
    u = { ...E }, y();
  };
  const N = (v) => {
    const S = e.querySelector("svg");
    return S ? new DOMPoint(v.clientX, v.clientY).matrixTransform(S.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (v) => {
    const S = N(v);
    S && (v.preventDefault(), x(v.deltaY > 0 ? 1.12 : 1 / 1.12, S.x, S.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (v) => {
    v.button !== 0 || !e.querySelector("svg") || (k = { start: N(v), x: v.clientX, y: v.clientY, view: { ...u }, moved: !1 }, e.setPointerCapture(v.pointerId));
  }), e.addEventListener("pointermove", (v) => {
    if (!k) return;
    const S = N(v);
    Math.hypot(v.clientX - k.x, v.clientY - k.y) > 4 && (k.moved = !0), u.x += k.start.x - S.x, u.y += k.start.y - S.y, y();
  }), e.addEventListener("pointerup", (v) => {
    if (!k) return;
    const S = k.moved;
    if (k = null, e.hasPointerCapture(v.pointerId) && e.releasePointerCapture(v.pointerId), !S) {
      const A = document.elementFromPoint(v.clientX, v.clientY)?.closest("[data-component]"), R = l?.components.find((I) => I.name === A?.dataset.component);
      R && (h = R.instanceId || "", O("selection").textContent = `${R.raw}
${Object.entries(R.terminals).map(([I, B]) => `${I} → ${B}`).join("   ")}`, R.kind === "X" ? (P(R.instanceId), j()) : H());
    }
  }), window.addEventListener("hashchange", () => {
    if (m) {
      b = !0;
      return;
    }
    T(), h = "", j();
  }), O("collapse-all").onclick = () => {
    L.clear(), j();
  }, O("expand-all").onclick = () => {
    for (const v of Object.keys(s?.contexts || {})) v && L.add(v);
    j();
  }, O("toggle-instance").onclick = () => {
    L.has(h) ? L.delete(h) : P(h), j();
  }, e.addEventListener("pointercancel", () => {
    k = null;
  }), e.addEventListener("keydown", (v) => {
    const S = v.target.closest("[data-instance]");
    if (S && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), h = S.dataset.instance, P(h), j();
      return;
    }
    v.key === "+" || v.key === "=" ? x(0.8) : v.key === "-" ? x(1.25) : v.key.toLowerCase() === "f" ? (u = { ...E }, y()) : v.key.startsWith("Arrow") && (v.preventDefault(), u.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[v.key] || 0) * u.w, u.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[v.key] || 0) * u.h, y());
  });
  async function j() {
    if (m) return;
    m = !0, i = "", d(), O("generate").disabled = !0, t.readOnly = !0, O("file").disabled = !0, O("libraries").disabled = !0;
    for (const S of ie.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) S.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let v = [];
    try {
      if (c !== t.value || !s) {
        if (r = nt(t.value, { files: p }), v = [...r.diagnostics], v.some((D) => D.severity === "error"))
          throw s = null, Error("Fix the parser errors below before generating.");
        s = gt(r), c && c !== t.value ? (L.clear(), a = "", h = "", history.replaceState(null, "", location.pathname + location.search)) : T(), c = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (v = [...r.diagnostics], C(v), v.some((D) => D.severity === "error")) throw Error("Fix the parser errors below before generating.");
      l = xt(s, { expanded: L, focus: a });
      const S = vt(l);
      w().conventional && v.push(...l.layout.diagnostics);
      const A = await St(S, w()), R = new DOMParser().parseFromString(A, "image/svg+xml");
      if (R.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const I = R.documentElement, B = I.querySelector("#spice-layout-report");
      if (B) {
        l.layout.report = JSON.parse(B.textContent);
        const D = l.layout.report;
        v.push({ severity: "info", message: `Layout: compact signal flow; ${D.powerSourcesChecked} DC/ground symbols checked, ${D.powerOrderViolations} DC order preference(s) unmet. ${D.powerPass}. Global voltage bands are a preference.` }), D.groundPlacement && v.push({ severity: "info", message: `Ground: ${D.groundPlacement}; ${D.straightenedGroundDrops || 0} return-path simplification(s).` }), D.explicitGroups && v.push({ severity: "info", message: `Layout comments: ${D.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), D.classicRails && v.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${D.railCount} shared voltage rails.` }), D.geometricConnectivityVerified && v.push({ severity: "info", message: `Net geometry verified; ${D.cyclesRemoved} same-net loop(s) and ${D.leavesRemoved} unused wire branch(es) removed.` }), C(v);
      }
      if (I.localName !== "svg" || I.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const z = Number(I.getAttribute("width")), Y = Number(I.getAttribute("height"));
      E = { x: -20, y: -20, w: z + 40, h: Y + 40 }, u = { ...E }, I.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), I.setAttribute("width", String(E.w)), I.setAttribute("height", String(E.h)), I.setAttribute("role", "img"), I.setAttribute("aria-label", l.title || "SPICE schematic"), I.setAttribute("style", "background:white");
      for (const D of l.components) {
        const $ = R.getElementById("cell_" + D.name);
        if (!$) throw Error("Renderer omitted component " + D.name);
        $.setAttribute("data-component", D.name), D.kind === "X" && ($.setAttribute("data-instance", D.instanceId), $.setAttribute("role", "button"), $.setAttribute("tabindex", "0"), $.setAttribute("aria-label", "Expand " + D.name));
        const X = R.createElementNS(I.namespaceURI, "title");
        X.textContent = D.raw + `
Resolved: ` + D.value + `
` + Object.entries(D.terminals).map(([F, oe]) => F + ": " + oe).join(", "), $.prepend(X);
      }
      for (const D of Object.values(l.nodes))
        for (const $ of I.querySelectorAll(".net_" + D.bit)) {
          $.setAttribute("data-net", D.name);
          const X = R.createElementNS(I.namespaceURI, "title");
          X.textContent = "Node " + D.displayName, $.append(X);
        }
      const G = l.components.filter((D) => D.kind === "K").map((D) => ({ name: D.name, inductors: D.coupledInductors, value: D.value }));
      if (G.length) {
        const D = R.createElementNS(I.namespaceURI, "metadata");
        D.setAttribute("id", "spice-magnetic-couplings"), D.textContent = JSON.stringify(G), I.append(D);
        for (const $ of G) for (const X of $.inductors) {
          const F = R.getElementById("cell_" + X);
          if (!F) continue;
          const oe = R.createElementNS(I.namespaceURI, "circle"), ue = [...F.children].find((fe) => fe.getAttribute("s:pid") === "A"), Re = ue?.getAttribute("s:position"), be = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Re] || [0, 0];
          for (const [fe, Ae] of Object.entries({ cx: Number(ue?.getAttribute("s:x")) + be[0], cy: Number(ue?.getAttribute("s:y")) + be[1], r: 3, fill: w().color, stroke: "none", "data-coupling": $.name })) oe.setAttribute(fe, String(Ae));
          const we = R.createElementNS(I.namespaceURI, "title");
          we.textContent = $.name + " · dotted terminal: " + $.inductors.join(", "), oe.append(we), F.append(oe);
        }
      }
      i = new XMLSerializer().serializeToString(I), O("source").value = i, e.replaceChildren(document.importNode(I, !0)), y();
      const W = v.filter((D) => D.severity === "warning").length;
      n.textContent = `${l.components.filter((D) => !D.synthetic).length} components · ${Object.keys(l.nodes).length} nodes · ${l.topology.leafCount} primitive devices verified${W ? " · Review " + W + " warning(s); drawing may be partial." : " · Schematic ready."}`, l.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${l.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), l.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const Z = Object.values(l.nodes).map((D) => {
        const $ = document.createElement("tr");
        for (const X of [D.displayName, D.terminals.map((F) => F.component + "." + F.pin).join(", ")]) {
          const F = document.createElement("td");
          F.textContent = X, $.append(F);
        }
        return $;
      });
      O("nets").replaceChildren(...Z), O("json").value = JSON.stringify({ circuit: l, netlist: S, hierarchy: r }, null, 2), O("selection").textContent = "Click a component to inspect its original statement and pin connections.", re();
    } catch (S) {
      if (e.replaceChildren(), i = "", O("source").value = "", O("json").value = "", O("nets").replaceChildren(), O("selection").textContent = "", n.textContent = S.message, !s)
        O("hierarchy-panel").hidden = !0, O("selection-actions").hidden = !0, O("breadcrumbs").replaceChildren();
      else if (!s.contexts[a]) {
        const A = document.createElement("button");
        A.type = "button", A.textContent = "Return to Top", A.onclick = () => M(""), O("breadcrumbs").replaceChildren(A);
      }
      S.diagnostics && (v = S.diagnostics), v.some((A) => A.severity === "error") || v.push({ severity: "error", line: 0, message: S.message }), C(v);
    } finally {
      m = !1, O("generate").disabled = !1, t.readOnly = !1, O("file").disabled = !1, O("libraries").disabled = !1;
      for (const S of ie.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) S.disabled = !1;
      s && s.contexts[a] && re(), e.setAttribute("aria-busy", "false"), d(), b && (b = !1, T(), queueMicrotask(j));
    }
  }
  O("generate").onclick = j;
  for (const v of ie.querySelectorAll("[data-example]")) v.onclick = () => {
    t.value = { mixed: Lt, filter: pe, hierarchy: It, ltspice: Dt, amplifier: Nt }[v.dataset.example], g(), j();
  };
  O("file").onchange = async (v) => {
    const S = v.target.files[0];
    if (S) {
      if (S.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Le(S), g(), j();
      } catch (A) {
        n.textContent = "File could not be read: " + A.message;
      } finally {
        v.target.value = "";
      }
    }
  }, O("libraries").onchange = async (v) => {
    try {
      for (const S of v.target.files) {
        if (S.size > 16e6) throw Error("Library exceeds 16 MB: " + S.name);
        p[S.webkitRelativePath || S.name] = await Le(S);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(p));
      } catch {
      }
      s = null, c = "", O("library-status").textContent = Object.keys(p).length + " library file(s) loaded", j();
    } catch (S) {
      n.textContent = S.message;
    } finally {
      v.target.value = "";
    }
  }, O("library-status").textContent = Object.keys(p).length ? "Libraries restored from this session." : "For .include / .lib dependencies", O("download").onclick = () => {
    const v = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), S = document.createElement("a");
    S.href = v, S.download = "spice-schematic.svg", S.click(), setTimeout(() => URL.revokeObjectURL(v), 1e3);
  }, O("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      O("source-details").open = !0, O("source").focus(), O("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
