const je = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Be = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Xe = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Ge = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ze = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Ke = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, qe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Qe = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, He = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, We = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Ye = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Ze = {
  AND: je,
  BUF: Fe,
  COUNTER: $e,
  DFLOP: Be,
  SCHMITT: Xe,
  OR: Ge,
  PHASEDET: ze,
  SRFLOP: Ke,
  XOR: qe,
  MODULATOR: Qe,
  OTA: He,
  SAMPLEHOLD: We,
  VARISTOR: Ye
}, Je = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ee = (t) => t.toLowerCase(), Oe = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), et = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function tt(t, e) {
  const n = (g) => e[ee(g || "")] || Object.entries(e).find(([f]) => f.startsWith(ee(g || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let i = [], d = [], a = "", r = "", s = [], c = [], p = 0, m = "", h = "", E = "", N = !0;
  if ("RLC".includes(o))
    i = ["A", "B"], r = ee(o) + "_v";
  else if ("DVIB".includes(o))
    i = ["+", "-"], r = o === "D" ? "d_v" : o === "B" ? "spice_b" : ee(o);
  else if (o === "Q") {
    i = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Oe(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && i.push("S"), a = t[i.length + 1] || "";
    const g = n(a)?.type;
    N = ["NPN", "PNP"].includes(g), r = N ? (i.length === 3 ? "q_" : "spice_q4_") + ee(g) : "spice_q" + i.length;
  } else if (o === "M") {
    const g = n(t[4]), f = n(t[5]), l = g?.type === "VDMOS" || !f && (!t[5] || Oe(t[5]));
    i = l ? ["D", "G", "S"] : ["D", "G", "S", "B"], a = t[i.length + 1] || "";
    const y = n(a), b = y?.type;
    if (l && y && b !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!l && b === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    N = ["NMOS", "PMOS", "VDMOS"].includes(b);
    let C = null, x = y;
    const v = /* @__PURE__ */ new Set();
    for (; x && !v.has(x.name) && (v.add(x.name), C = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !C); )
      x = n(x.baseModel);
    const A = b === "PMOS" || b === "VDMOS" && C && (C[1] === void 0 || Number(C[1]) >= 0.5);
    r = N ? "spice_" + (A ? "pmos" : "nmos") + (l ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    a = t[4] || "";
    const g = n(a)?.type, f = o === "Z" && ["NIGBT", "PIGBT"].includes(g);
    i = f ? ["C", "G", "E"] : ["D", "G", "S"], N = o === "J" ? ["NJF", "PJF"].includes(g) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(g), r = "spice_" + (f ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(g || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    i = ["+", "-"], r = "spice_" + ee(o);
    let g = 3, f = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[g] || "");
    if (/^poly$/i.test(t[g] || "") && (f = /^\(\s*(\d+)\s*\)$/.exec(t[++g] || ""), !f))
      throw Error("POLY requires a dimension.");
    if (f) {
      const l = Number(f[1]);
      if (l > 128) throw Error("POLY supports at most 128 controlling variables.");
      let y = g + 1, b = [];
      const C = "EG".includes(o), x = l * (C ? 2 : 1);
      for (; b.length < x && y < t.length; ) b.push(...et(t[y++]));
      if (b.length !== x || y >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (C) {
        for (let v = 0; v < l; v++) i.push("C" + (v + 1) + "+", "C" + (v + 1) + "-");
        d = [t[1], t[2], ...b];
      } else s = b;
      p = y, m = "POLY(" + l + ") " + (C ? "" : b.join(" ") + " "), h = "POLY", C && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? h = "BEHAVIORAL" : "EG".includes(o) ? (i.push("C+", "C-"), h = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (s = [t[3]], p = 4, m = t[3] + " ");
    E = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (h ? " · " + h : "");
  } else if (o === "S")
    i = ["A", "B", "C+", "C-"], a = t[5] || "", r = "spice_device", E = "Voltage switch";
  else if (o === "W")
    i = ["A", "B"], s = [t[3]], a = t[4] || "", p = 3, r = "spice_device", E = "Current switch";
  else if ("TO".includes(o))
    i = ["L+", "L-", "R+", "R-"], o === "O" && (a = t[5] || ""), r = "spice_device", E = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    i = ["N1", "N2", "COM"], a = t[4] || "", r = "spice_device", E = "Distributed RC";
  else if (o === "A")
    i = Array.from({ length: 8 }, (g, f) => "P" + (f + 1)), r = "spice_device", E = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (c = t.slice(1, -1), c.some((g) => !/^L/i.test(g.split(":").at(-1)))) throw Error("K references must name inductors.");
    p = t.length - 1, r = "spice_coupling", E = "Magnetic coupling", m = c.join(" ") + " · k=";
  } else if (o === "@")
    i = ["IN", "OUT"], r = "spice_device", E = "FRA";
  else if (o === "&")
    i = ["O+", "O-", "I+", "I-"], r = "spice_device", E = "FRA probe";
  else if (o === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", E = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (p || (p = i.length + 1), d.length || (d = t.slice(1, i.length + 1)), d.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (t.length <= p && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (d.some((g) => /[=()]/.test(g) && !/^\{[\s\S]*\}$/.test(g))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(p).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(p).join(" ")) && (r = "spice_br"), o === "D" && (a = t[3] || ""), o === "@") {
    const g = t.slice(p).join(" ");
    for (const f of g.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(f[1].toUpperCase()), d.push(f[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (s.some((g) => !g)) throw Error("Missing controlling voltage source.");
  const S = i.map((g, f) => o === "A" && Ze[(t[9] || "").toUpperCase()]?.[String(f + 1)] || g);
  return { kind: o, pins: i, nodeTokens: d, pinLabels: S, model: a, type: r, controlSource: s[0] || "", controlSources: s, coupledInductors: c, value: m + t.slice(p).join(" "), sourceMode: h, symbol: E, polarityKnown: N };
}
const nt = Je, rt = new Set(nt.split(" ")), ge = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function pe(t) {
  const e = [], n = [];
  let o = "", i = 0, d = "";
  for (let a = 0; a < t.length; a++) {
    const r = t[a];
    if (d) {
      o += r, r === d && t[a - 1] !== "\\" && (d = "");
      continue;
    }
    if (r === '"' || r === "'") {
      d = r, o += r;
      continue;
    }
    if (!i && (r === ";" || r === "$" && (!a || /\s/.test(t[a - 1])))) break;
    if ("({".includes(r) && (n.push(r), i++), ")}".includes(r) && (i--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !i ? (o && e.push(o), o = "") : o += r;
  }
  if (i || d) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function ot(t, e = {}) {
  const n = [], o = [], i = [], d = Object.assign(ge(), e.models), a = ge(), r = (f, l, y) => n.push({ severity: f, line: l, message: y });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const s = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((f, l) => {
    const y = f.trim();
    !y || y.startsWith("*") || (y.startsWith("+") ? s.length ? s.at(-1).text += " " + y.slice(1).trim() : r("error", l + 1, "Continuation has no preceding statement.") : s.push({ line: l + 1, text: y }));
  });
  for (const f of s) {
    try {
      f.tokens = pe(f.text);
    } catch (y) {
      r("error", f.line, y.message), f.tokens = [];
    }
    const l = f.tokens;
    if (/^\.model$/i.test(l[0] || ""))
      if (l.length < 3) r("error", f.line, ".model requires a name and device type.");
      else {
        const y = /^ako:(.+)$/i.exec(l[2]), b = y && l[3] && !l[3].startsWith("(") ? l[3].split("(")[0].toUpperCase() : "";
        d[X(l[1])] = { name: l[1], type: y ? b : l[2].split("(")[0].toUpperCase(), baseModel: y?.[1] || "", raw: f.text };
      }
  }
  const c = /* @__PURE__ */ new Set();
  function p(f) {
    const l = d[X(f)];
    if (!l) return "";
    if (l.type) return l.type;
    if (c.has(X(f))) throw Error("Circular AKO model inheritance: " + f);
    return c.add(X(f)), l.type = p(l.baseModel), c.delete(X(f)), l.type;
  }
  for (const f of Object.values(d)) if (f.baseModel && !f.type)
    try {
      p(f.name);
    } catch (l) {
      r("error", 0, l.message);
    }
  let m = "", h = 0, E = !1, N = !1;
  const S = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: f, text: l, tokens: y } of s) {
    if (!y.length) continue;
    const b = X(y[0]);
    if (N) {
      r("warning", f, "Statement after .end is not rendered: " + l);
      continue;
    }
    if (b === ".control") {
      E = !0, r("warning", f, ".control script retained but not executed or rendered.");
      continue;
    }
    if (b === ".endc") {
      E = !1;
      continue;
    }
    if (E) continue;
    if (b === ".subckt") {
      h++, r("error", f, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (b === ".ends") {
      h ? h-- : r("error", f, "Unmatched .ends.");
      continue;
    }
    if (h) continue;
    if (b === ".end") {
      N = !0;
      continue;
    }
    if (b.startsWith(".")) {
      o.push({ line: f, text: l }), b === ".title" ? m = y.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(b) ? r("error", f, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(b) ? r("error", f, "Topology-changing directive is unsupported: " + l) : g.has(b) || r("warning", f, "Directive retained but not resolved: " + l);
      continue;
    }
    const C = y[0][0].toUpperCase();
    if (!rt.has(C)) {
      f === 1 && !/\d/.test(y[0]) && y.length > 1 && C !== "X" ? (m = l, r("warning", f, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", f, `Unsupported ${C} device was not rendered: ${l}`);
      continue;
    }
    const x = C === "M" || C === "Q" ? 5 : 4;
    if (f === 1 && !/\d/.test(y[0]) && (y.length < x || C === "T" && !/\b(?:zo|z0)\s*=/i.test(l))) {
      m = l, r("info", f, "SPICE title: " + l);
      continue;
    }
    try {
      if (S.has(b)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const v = tt(y, d), { pins: A, nodeTokens: P, ..._ } = v;
      v.polarityKnown || r("warning", f, `${y[0]}: model polarity unknown; explicit ${A.join("/")} terminals retained.`);
      const D = ge();
      A.forEach((q, oe) => {
        const z = X(P[oe]);
        a[z] || (a[z] = { name: z, displayName: y[oe + 1], bit: Object.keys(a).length + 2, terminals: [] }), a[z].terminals.push({ component: y[0], pin: q }), D[q] = z;
      }), i.push({ ..._, name: y[0], terminals: D, line: f, raw: l }), S.add(b);
    } catch (v) {
      r("error", f, `${y[0]}: ${v.message} Statement: ${l}`);
    }
  }
  h && r("error", 0, "Unclosed .subckt definition."), E && r("error", 0, "Unclosed .control block."), i.length || r("error", 0, "No supported components to render."), i.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const f of i) {
    for (const l of f.controlSources || []) !l.includes(":") && !i.some((y) => X(y.name) === X(l) && y.kind === "V") && r("error", f.line, `${f.name}: controlling voltage source ${l} was not found.`);
    for (const l of f.coupledInductors || []) !l.includes(":") && !i.some((y) => X(y.name) === X(l) && y.kind === "L") && r("error", f.line, `${f.name}: coupled inductor ${l} was not found.`);
    (f.kind === "B" || f.type === "spice_b") && r("info", f.line, `${f.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: i, nodes: a, models: d, directives: o, diagnostics: n };
}
const Y = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Se = (t) => Y(t).split("/").at(-1);
function it(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), i = [], d = [], a = [];
  let r = 0;
  const s = (p, m) => {
    const h = Y(m).split("/").slice(0, -1).concat(Y(p)).join("/"), E = [...o].filter(([S]) => Y(S) === Y(p) || Y(S) === h);
    if (E.length === 1) return E[0];
    const N = [...o].filter(([S]) => Se(S) === Se(p));
    if (N.length !== 1) throw Error(N.length ? "Ambiguous library filename: " + p : "Missing library " + p + ". Add this file using Library files.");
    return N[0];
  };
  function c(p, m, h = "", E = []) {
    const N = Y(m) + ":" + h.toLowerCase();
    if (E.includes(N)) throw Error("Circular library include: " + [...E, N].join(" → "));
    if (E.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const S = [], g = /^\s*\.endl\b/im.test(p);
    let f = !h;
    const l = (b, C) => {
      if (r += b.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      a.push(b), d.push({ file: m, line: C + 1 });
    };
    if (p.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, C) => {
      const x = b.trim();
      if (/^\.lib\b/i.test(x) && g) {
        const v = pe(x);
        if (v.length === 2 && !/[.\\/]/.test(v[1])) {
          S.push(v[1].toLowerCase()), v[1].toLowerCase() === h.toLowerCase() && (f = !0), l("* Library section " + v[1], C);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        S.pop(), l("* End library section", C);
        return;
      }
      if (h && S.length && !S.includes(h.toLowerCase())) {
        l("* Unselected library section", C);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const v = pe(x);
          if (!v[1]) throw Error("Include requires a filename.");
          const [A, P] = s(v[1], m);
          l("* Included " + A, C), c(P, A, v[2] || "", [...E, N]);
        } catch (v) {
          i.push({ severity: "error", line: C + 1, source: m, message: v.message }), l("* Unresolved include", C);
        }
      else l(b, C);
    }), !f) throw Error("Library section " + h + " not found in " + m);
  }
  try {
    c(t, n);
  } catch (p) {
    i.push({ severity: "error", line: 0, source: n, message: p.message });
  }
  return { source: a.join(`
`), origins: d, diagnostics: i };
}
function st(t) {
  const e = [], n = [];
  let o = !1, i = !1, d = 0;
  if (t.split(/\r?\n/).forEach((g, f) => {
    const l = g.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(l)) {
      (i || o) && e.push({ severity: "error", line: f + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(l) || e.push({ severity: "error", line: f + 1, message: "Expected @layout begin v1." }), i = !0, o = !0, d = f + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(l)) {
      o || e.push({ severity: "error", line: f + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (l.startsWith("*") ? n.push(l.slice(1).trim()) : e.push({ severity: "error", line: f + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: d, message: "Unclosed @layout block." }), !i) return { layout: null, diagnostics: e };
  const a = n.join(" "), r = a.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], s = [], c = [];
  let p = 0, m = 0, h = 10;
  const E = () => r[p++], N = () => {
    const g = E();
    if (!g || !/^[A-Za-z_@][\w./%:@-]*$/.test(g)) throw Error("Expected layout identifier, got " + g);
    return g;
  };
  function S(g) {
    if (s.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const f = g ? N() : "@row" + m++, l = E();
    if (!["row", "column"].includes(l)) throw Error("Expected row or column.");
    if (E() !== "{") throw Error("Expected { after " + l);
    const y = { id: f, direction: l, members: [] };
    for (s.push(y); p < r.length && r[p] !== "}"; )
      r[p] === "group" ? (E(), y.members.push(S(!0))) : ["row", "column"].includes(r[p]) ? y.members.push(S(!1)) : y.members.push(N());
    if (E() !== "}") throw Error("Unclosed group " + f);
    if (!y.members.length) throw Error("Empty layout group " + f);
    return f;
  }
  try {
    for (; p < r.length; )
      if (r[p] === "group")
        E(), S(!0);
      else if (["row", "column"].includes(r[p])) S(!1);
      else if (r[p] === "priority-cap") {
        if (E(), h = Number(E()), !Number.isInteger(h) || h < 3 || h > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const v = N(), A = E(), P = N();
        if (!["left-of", "above"].includes(A)) throw Error("Expected left-of or above.");
        c.push({ a: v, relation: A, b: P });
      } else throw Error("Unknown layout instruction near " + r[p - 1]);
    const g = /* @__PURE__ */ new Set();
    for (const v of s) {
      const A = v.id.toLowerCase();
      if (g.has(A)) throw Error("Duplicate layout group " + v.id);
      g.add(A);
    }
    const f = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), y = new Map(s.map((v) => [v.id.toLowerCase(), v])), b = (v) => {
      if (f.has(v)) throw Error("Circular layout group " + v);
      if (!l.has(v)) {
        f.add(v);
        for (const A of y.get(v).members) y.has(A.toLowerCase()) && b(A.toLowerCase());
        f.delete(v), l.add(v);
      }
    };
    for (const v of y.keys()) b(v);
    const C = /* @__PURE__ */ new Map();
    for (const v of c) {
      if (v.a.toLowerCase() === v.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      C.has(v.a.toLowerCase()) || C.set(v.a.toLowerCase(), []), C.get(v.a.toLowerCase()).push(v.b.toLowerCase());
    }
    f.clear(), l.clear();
    const x = (v) => {
      if (f.has(v)) throw Error("Circular place constraints.");
      if (!l.has(v)) {
        f.add(v);
        for (const A of C.get(v) || []) x(A);
        f.delete(v), l.add(v);
      }
    };
    for (const v of C.keys()) x(v);
  } catch (g) {
    e.push({ severity: "error", line: d, message: "Layout description: " + g.message });
  }
  return { layout: { version: 1, priorityCap: h, groups: s, relations: c }, diagnostics: e };
}
function at(t, e) {
  const n = t.ir.layoutDescription;
  if (!n) return null;
  const o = new Map(n.groups.map((c) => [c.id.toLowerCase(), c])), i = Object.values(t.contexts).flatMap((c) => c.devices.map((p) => p.name)), d = new Set([...Object.keys(t.contexts), ...i].map((c) => c.toLowerCase()));
  for (const c of o.values()) if (d.has(c.id.toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + c.id);
  for (const c of o.values()) for (const p of c.members) if (!o.has(p.toLowerCase()) && !d.has(p.toLowerCase())) throw Error("Unknown @layout instance/device: " + p);
  for (const c of n.relations) for (const p of [c.a, c.b]) if (!o.has(p.toLowerCase()) && !d.has(p.toLowerCase())) throw Error("Unknown @layout place target: " + p);
  if (e.focus) return null;
  const a = /* @__PURE__ */ new Map(), r = [];
  for (const c of n.groups) {
    const p = [];
    for (const m of c.members) {
      if (o.has(m.toLowerCase())) {
        p.push({ group: m });
        continue;
      }
      for (const h of e.components) if (h.name.toLowerCase() === m.toLowerCase() || h.name.toLowerCase().startsWith(m.toLowerCase() + "/")) {
        if (a.has(h.name)) throw Error("Overlapping @layout membership: " + h.name);
        a.set(h.name, c.id), p.push({ cell: h.name, instance: m });
      }
    }
    r.push({ id: c.id, direction: c.direction, members: p });
  }
  const s = /* @__PURE__ */ new Set();
  for (const c of r) for (const p of c.members) if (p.group) {
    const m = p.group.toLowerCase();
    if (s.has(m)) throw Error("Layout group has multiple parents: " + p.group);
    s.add(m);
  }
  return { version: 1, priorityCap: n.priorityCap, groups: r, relations: n.relations };
}
const ne = () => /* @__PURE__ */ Object.create(null), $ = (t) => t.toLowerCase();
function De(t) {
  const e = ne();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!i) throw Error("Expected named parameter assignment, got: " + o);
    const d = $(i[1]);
    let a = i[2];
    if (a === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + d);
      a = r[1];
    }
    if (a || (a = t[++n]), !a || /^params?:$/i.test(a)) throw Error("Missing value for parameter " + d);
    if (Object.hasOwn(e, d)) throw Error("Duplicate parameter: " + d);
    e[d] = a;
  }
  return e;
}
function Ie(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ne()] : [t.slice(0, e), De(t.slice(e))];
}
function ct(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = st(t), o = it(t, e);
  t = o.source;
  const i = [...o.diagnostics, ...n.diagnostics], d = ne(), a = /* @__PURE__ */ new Set(["0"]), r = (l, y, b) => i.push({ severity: l, line: y, message: b }), s = (l, y, b, C = [], x = ne(), v = 0) => {
    const A = { id: l, name: y, parent: b, ports: C, defaults: x, parameters: ne(), definitions: ne(), devices: [], instances: [], directives: [], line: v, statements: [] };
    return d[l] = A, A;
  }, c = s("root", "Top", null), p = [c], m = [];
  let h = !1, E = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((l, y) => {
    const b = l.trim();
    !b || b.startsWith("*") || (b.startsWith("+") ? m.length ? m.at(-1).text += " " + b.slice(1).trim() : r("error", y + 1, "Continuation has no preceding statement.") : m.push({ text: b, line: y + 1 }));
  });
  for (const { text: l, line: y } of m)
    try {
      const b = pe(l);
      if (!b.length) continue;
      const C = $(b[0]), x = p.at(-1);
      if (E) {
        r("warning", y, "Statement after .end is not rendered: " + l);
        continue;
      }
      if (C === ".control") {
        h = !0, r("warning", y, ".control script retained but not executed or rendered.");
        continue;
      }
      if (C === ".endc") {
        h = !1;
        continue;
      }
      if (h) continue;
      if (C === ".subckt") {
        if (b.length < 2) throw Error(".SUBCKT requires a name.");
        const [v, A] = Ie(b.slice(2)), P = $(b[1]);
        if (Object.hasOwn(x.definitions, P)) throw Error("Duplicate subcircuit definition: " + b[1]);
        const _ = v.map($);
        if (new Set(_).size !== v.length || _.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (v.some((q) => /[{}()=]/.test(q))) throw Error("Invalid formal port.");
        if (p.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = x.id + "/" + encodeURIComponent(P);
        x.definitions[P] = D, p.push(s(D, b[1], x.id, v, A, y));
        continue;
      }
      if (C === ".ends") {
        if (p.length === 1) throw Error("Unmatched .ENDS.");
        if (b[1] && $(b[1]) !== $(x.name)) throw Error(".ENDS name does not match " + x.name);
        p.pop();
        continue;
      }
      if (C === ".end") {
        if (p.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        E = !0;
        continue;
      }
      if (C === ".param") {
        const v = De(b.slice(1));
        for (const [A, P] of Object.entries(v)) {
          if (Object.hasOwn(x.parameters, A)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + A);
          x.parameters[A] = P;
        }
      }
      if (C === ".global") {
        if (b.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const v of b.slice(1)) a.add($(v));
      }
      if (C.startsWith(".") && x.directives.push({ line: y, text: l }), C.startsWith("x")) {
        const [v, A] = Ie(b.slice(1));
        if (!v.length) throw Error("X instance requires a subcircuit name.");
        const P = /;§pnba\s+(.+)$/i.exec(l)?.[1].split(")");
        x.instances.push({ name: b[0], nodes: v.slice(0, -1).map($), definitionName: v.at(-1), definitionId: null, parameters: A, line: y, raw: l, pinNames: P });
      } else x.statements.push({ line: y, text: l });
    } catch (b) {
      r("error", y, b.message + " Statement: " + l);
    }
  p.length > 1 && r("error", p.at(-1).line, "Unclosed .SUBCKT " + p.at(-1).name), h && r("error", 0, "Unclosed .control block.");
  function N(l, y) {
    for (; l; ) {
      if (Object.hasOwn(l.definitions, $(y))) return l.definitions[$(y)];
      l = d[l.parent];
    }
    return null;
  }
  for (const l of Object.values(d)) {
    const y = [...l.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...l.statements], b = ot(y.map((x) => x.text).join(`
`), { models: d[l.parent]?.models });
    l.devices = b.components.map((x) => ({ ...x, line: y[x.line - 1]?.line || l.line })), l.models = b.models, l === c && (c.title = b.title), i.push(...b.diagnostics.filter((x) => !x.message.includes("No supported components to render.") && !x.message.includes("300 components")).map((x) => ({ ...x, line: y[x.line - 1]?.line || l.line })));
    const C = new Set(l.devices.map((x) => $(x.name)));
    for (const x of l.instances)
      if (C.has($(x.name)) && r("error", x.line, "Duplicate instance/device name: " + x.name), C.add($(x.name)), x.definitionId = N(l, x.definitionName), !x.definitionId && !/^\{[\s\S]*\}$/.test(x.definitionName)) r("error", x.line, "Undefined subcircuit: " + x.definitionName + " in " + x.name);
      else if (x.definitionId) {
        const v = d[x.definitionId];
        v.ports.length !== x.nodes.length && r("error", x.line, `${x.name}: ${v.name} expects ${v.ports.length} ports; got ${x.nodes.length}.`);
      }
  }
  for (const l of Object.values(d)) delete l.statements;
  const S = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set();
  function f(l, y = []) {
    if (S.has(l)) {
      r("error", d[l].line, "Circular subcircuit reference: " + [...y, d[l].name].join(" → "));
      return;
    }
    if (!g.has(l)) {
      if (S.add(l), y.length >= 64) {
        r("error", d[l].line, "Subcircuit dependency nesting exceeds 64 levels."), S.delete(l), g.add(l);
        return;
      }
      for (const b of d[l].instances) b.definitionId && f(b.definitionId, [...y, d[l].name]);
      S.delete(l), g.add(l);
    }
  }
  for (const l of Object.keys(d)) f(l);
  !c.devices.length && !c.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const l of i) !l.source && l.line && o.origins[l.line - 1] && (l.source = o.origins[l.line - 1].file, l.line = o.origins[l.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: c.title || "", scopes: d, globals: [...a], diagnostics: i, layoutDescription: n.layout };
}
const U = () => /* @__PURE__ */ Object.create(null), te = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), be = (t, e) => te(t.map((n) => n.toLowerCase()), e.toLowerCase());
function lt(t, e = []) {
  const n = U(), o = (i) => n[i] || (n[i] = { name: i, displayName: i.split("/").map((d) => decodeURIComponent(d)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const i of t) for (const [d, a] of Object.entries(i.terminals)) o(a).terminals.push({ component: i.name, pin: d });
  for (const i of e) o(i);
  return n;
}
function dt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Ne = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, ut = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function fe(t, e, n = (i) => i, o = (i) => i) {
  const i = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (a) => (i.push(a), "@@" + (i.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (a, r, s) => {
    const c = s.split(",").map((m) => m.trim());
    if (c.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + a);
    const p = r.toUpperCase() + "(" + c.map((m) => r.toLowerCase() === "v" ? n(m) : o(m, r)).join(",") + ")";
    return i.push(p), "@@" + (i.length - 1) + "@@";
  });
  let d = t.length;
  return t = t.replace(ut, (a, r, s) => {
    if (s.slice(r + a.length).trimStart().startsWith("(")) return a;
    const c = e(a.toLowerCase());
    if (c === void 0) return a;
    if (d += c.length + 2, d > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + c + ")";
  }), t.replace(/@@(\d+)@@/g, (a, r) => i[Number(r)]);
}
function pt(t, e, n, o) {
  const i = { ...e, ...n }, d = U(), a = /* @__PURE__ */ new Set(), r = U();
  for (const [c, p] of Object.entries(o)) r[c] = fe(Ne(p), (m) => t[m]);
  function s(c) {
    if (Object.hasOwn(r, c)) return r[c];
    if (Object.hasOwn(d, c)) return d[c];
    if (!Object.hasOwn(i, c)) return t[c];
    if (a.has(c)) {
      if (Object.hasOwn(t, c)) return t[c];
      throw Error("Circular parameter dependency: " + [...a, c].join(" → "));
    }
    return a.add(c), d[c] = fe(Ne(i[c]), s), a.delete(c), d[c];
  }
  for (const c of Object.keys(i)) s(c);
  return Object.assign(U(), t, d, r);
}
function Le(t, e, n, o) {
  let i = "";
  for (let s = 0; s < t.length; ) {
    const c = t[s];
    if (c !== "{" && c !== "'") {
      i += c, s++;
      continue;
    }
    const p = s++;
    let m = 1, h = "";
    for (; s < t.length && m; s++) {
      if (c === "'") {
        t[s] === "'" && (m = 0);
        continue;
      }
      if (h) {
        t[s] === h && (h = "");
        continue;
      }
      if (t[s] === '"' || t[s] === "'") {
        h = t[s];
        continue;
      }
      t[s] === "{" && m++, t[s] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    i += c + fe(t.slice(p + 1, s - 1), (E) => e[E], n, o) + (c === "{" ? "}" : "'");
  }
  const d = [];
  let a = 0, r = "";
  for (let s = 0; s < i.length; s++) {
    const c = i[s];
    if (r) {
      c === r && i[s - 1] !== "\\" && (r = "");
      continue;
    }
    if (c === '"' || c === "'") {
      r = c;
      continue;
    }
    if ("({".includes(c) && a++, ")}".includes(c) && a--, !a && (s === 0 || /\s/.test(i[s - 1]))) {
      const p = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(s));
      p && (d.push({ start: s, end: s + p[0].length, key: p[1].toLowerCase() }), s += p[0].length - 1);
    }
  }
  if (d.length) {
    let s = i.slice(0, d[0].start);
    d.forEach((c, p) => {
      const m = d[p + 1]?.start ?? i.length, h = i.slice(c.end, m);
      s += i.slice(c.start, c.end) + (h.includes("{") || ["refnode", "intnode"].includes(c.key) ? h : fe(h, (E) => e[E], n, o));
    }), i = s;
  } else Object.hasOwn(e, t.toLowerCase()) && (i = "{" + e[t.toLowerCase()] + "}");
  return i;
}
class ft {
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
class ht {
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
    let e, n, o, i, d, a, r, s, c;
    if (a = this.gobbleToken(), !a || (n = this.gobbleBinaryOp(), !n))
      return a;
    for (d = { value: n, prec: u.binaryPrecedence(n), right_a: u.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), i = [a, d, r]; n = this.gobbleBinaryOp(); ) {
      if (o = u.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      d = { value: n, prec: o, right_a: u.right_associative.has(n) }, c = n;
      const p = (m) => d.right_a && m.right_a ? o > m.prec : o <= m.prec;
      for (; i.length > 2 && p(i[i.length - 2]); )
        r = i.pop(), n = i.pop().value, a = i.pop(), e = {
          type: u.BINARY_EXP,
          operator: n,
          left: a,
          right: r
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + c), i.push(d, e);
    }
    for (s = i.length - 1, e = i[s]; s > 1; )
      e = {
        type: u.BINARY_EXP,
        operator: i[s - 1].value,
        left: i[s - 2],
        right: e
      }, s -= 2;
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
            for (let a = n.length; a < i; a++)
              n.push(null);
        }
      } else if (n.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const a = this.gobbleExpression();
        (!a || a.type === u.COMPOUND) && this.throwError("Expected comma"), n.push(a);
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
const mt = new ft();
Object.assign(u, {
  hooks: mt,
  plugins: new ht(u),
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
const re = (t) => new u(t).parse(), gt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(u).filter((t) => !gt.includes(t) && re[t] === void 0).forEach((t) => {
  re[t] = u[t];
});
re.Jsep = u;
const bt = "ConditionalExpression";
var wt = {
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
            type: bt,
            test: o,
            consequent: i,
            alternate: d
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let a = o;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
re.plugins.register(wt);
const Et = "ConditionalExpression";
var yt = {
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
            type: Et,
            test: o,
            consequent: i,
            alternate: d
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let a = o;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
re.plugins.register(yt);
const Ct = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, ke = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, F = (t) => Number(t) > 0.5;
function ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function i(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (s) => {
      if (s[0] === '"' || s[0] === "'") return s;
      const [, c, p, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(s), h = p.toLowerCase(), E = h.startsWith("meg") ? 1e6 : h.startsWith("mil") ? 254e-7 : Ct[h[0]] || 1;
      return "(" + (m ? +(c + (c.includes(".") ? "" : ".") + m) : Number(c)) * E + ")";
    }), d(re(r));
  }
  function d(r) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const s = r.name.toLowerCase();
      if (s === "pi") return Math.PI;
      if (s === "e") return Math.E;
      if (!Object.hasOwn(e, s)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(s)) throw Error("Circular structural parameter: " + s);
      n.add(s);
      const c = i(e[s]);
      return n.delete(s), c;
    }
    if (r.type === "ConditionalExpression") return F(d(r.test)) ? d(r.consequent) : d(r.alternate);
    if (r.type === "UnaryExpression") {
      const s = d(r.argument);
      if (r.operator === "-") return -s;
      if (r.operator === "+") return +s;
      if (r.operator === "!" || r.operator === "~") return !F(s);
    }
    if (r.type === "BinaryExpression") {
      const s = d(r.left);
      if (r.operator === "&&") return F(s) && F(d(r.right));
      if (r.operator === "||") return F(s) || F(d(r.right));
      const c = d(r.right);
      switch (r.operator) {
        case "+":
          return s + c;
        case "-":
          return s - c;
        case "*":
          return s * c;
        case "/":
          return s / c;
        case "**":
          return s ** c;
        case "%":
          return s % c;
        case "^":
          return F(s) !== F(c);
        case "&":
          return F(s) && F(c);
        case "|":
          return F(s) || F(c);
        case ">":
          return s > c;
        case "<":
          return s < c;
        case ">=":
          return s >= c;
        case "<=":
          return s <= c;
        case "==":
        case "===":
          return s === c;
        case "!=":
        case "!==":
          return s !== c;
      }
    }
    if (r.type === "CallExpression" && r.callee.type === "Identifier") {
      const s = r.callee.name.toLowerCase();
      if (s === "if") {
        if (r.arguments.length !== 3) throw Error("if() needs three arguments.");
        return F(d(r.arguments[0])) ? d(r.arguments[1]) : d(r.arguments[2]);
      }
      if (Object.hasOwn(ke, s)) return ke[s](...r.arguments.map(d));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const a = i(t);
  if (typeof a == "number" && !Number.isFinite(a)) throw Error("Structural expression is not finite.");
  return a;
}
function xt(t) {
  dt(t);
  const e = U(), n = /* @__PURE__ */ new Map();
  let o = 0, i = 0;
  function d(a, r, s, c, p, m, h) {
    if (r.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[a], N = r.length ? te(r.slice(0, -1), r.at(-1)) : "", S = U();
    if (h.some((C) => C.scopeId === a)) throw Error("Circular subcircuit reference at " + N);
    const g = pt(c, E.defaults, E.parameters, p);
    function f(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const v = ae(C, g);
        C = String(typeof v == "boolean" ? Number(v) : v);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const x = C.toLowerCase();
      return Object.hasOwn(s, x) ? s[x] : t.globals.includes(x) ? be([], x) : S[x] || (S[x] = be(r, x));
    }
    const l = { id: N, path: r, scopeId: a, name: m?.name || "Top", definition: E.name, ports: E.ports.map((C) => ({ name: C, node: f(C) })), params: g, nodes: S, models: U(), devices: [], children: [], raw: m?.raw || "", line: m?.line || 0 };
    e[N] = l, n.set(N, f);
    const y = [...h, l];
    function b(C) {
      if (!C) return "";
      let x = E;
      for (; x; ) {
        if (x.directives.some((v) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(v.text))) {
          const v = [...y].reverse().find((A) => A.scopeId === x.id);
          return te(v?.path || [], C.toLowerCase());
        }
        x = t.scopes[x.parent];
      }
      return C;
    }
    for (const C of E.directives.filter((x) => /^\.model\b/i.test(x.text))) {
      const x = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!x) continue;
      const v = b(x), A = E.models[x.toLowerCase()], P = Le(C.text, g, f, (_) => te(r, _));
      l.models[v] = { ...A, name: v, raw: P.replace(/^(\.model\s+)\S+/i, (_, D) => D + v), instanceId: N, parameters: g };
    }
    for (const C of E.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const x = U();
      for (const [A, P] of Object.entries(C.terminals)) x[A] = f(P);
      const v = b(C.model);
      l.devices.push({ ...C, name: te(r, C.name), localName: C.name, instanceId: N, terminals: x, model: v, parameters: g });
    }
    for (const C of E.instances) {
      let x = C.definitionId;
      if (!x) {
        const _ = String(ae(C.definitionName, g)).toLowerCase();
        let D = E;
        for (; D && !x; )
          x = D.definitions[_], D = t.scopes[D.parent];
        if (!x) throw Error("Undefined selected subcircuit: " + _);
      }
      const v = t.scopes[x], A = U();
      if (v.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + v.ports.length + " ports; got " + C.nodes.length);
      v.ports.forEach((_, D) => {
        A[_.toLowerCase()] = f(C.nodes[D]);
      });
      const P = d(x, [...r, C.name], A, g, C.parameters, C, y);
      C.pinNames?.length === P.ports.length && P.ports.forEach((_, D) => {
        _.label = C.pinNames[D];
      }), l.children.push(P);
    }
    return l;
  }
  try {
    let p = function(m, h) {
      const E = h.split(":");
      if (E.length === 1) return { owner: m, name: h };
      const N = E.pop();
      for (const S of [[...m.path, ...E], E]) {
        const g = r.get(S.map(encodeURIComponent).join("/").toLowerCase());
        if (g) return { owner: g, name: N };
      }
      throw Error("Unknown hierarchical reference: " + h);
    };
    const a = d(t.rootId, [], U(), U(), U(), null, []), r = new Map(Object.values(e).map((m) => [m.id.toLowerCase(), m])), s = Object.assign(U(), ...Object.values(e).map((m) => m.models)), c = (m) => s[m] || Object.entries(s).find(([h]) => h.startsWith(m + "."))?.[1];
    for (const m of Object.values(e)) for (const h of m.devices) {
      const E = t.scopes[m.scopeId].devices.find((g) => g.name === h.localName), N = (g) => {
        const f = p(m, g);
        return n.get(f.owner.id)(f.name);
      }, S = (g, f = "", l = "") => {
        const y = p(m, g), b = y.owner.devices.find((C) => C.localName.toLowerCase() === y.name.toLowerCase());
        if (f.toLowerCase() === "ix") {
          const C = y.owner.ports.find((x, v) => x.name.toLowerCase() === y.name.toLowerCase() || String(v + 1) === y.name);
          if (C) return y.owner.id + ":" + C.name;
        }
        if (!b) {
          if (l) throw Error(h.name + ": referenced " + l + " device " + g + " was not found.");
          return te(y.owner.path, y.name);
        }
        if (l && b.kind !== l) throw Error(h.name + ": " + g + " must be a " + l + " device.");
        return b.name;
      };
      if (h.value = Le(E.value, m.params, N, S), E.model && (h.value = h.value.replace(E.model, h.model)), h.kind === "M" && Object.keys(h.terminals).length === 3) {
        let g = c(h.model), f = !1;
        const l = /* @__PURE__ */ new Set();
        for (; g?.type === "VDMOS" && !l.has(g.name); ) {
          l.add(g.name);
          const y = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(g.raw);
          if (y) {
            f = y[1] === void 0 || Number(ae(y[1], g.parameters)) >= 0.5;
            break;
          }
          const b = g.name.includes("/") ? g.name.slice(0, g.name.lastIndexOf("/") + 1) : "";
          g = c(b + (g.baseModel || "").toLowerCase()) || c((g.baseModel || "").toLowerCase());
        }
        l.size && (h.type = "spice_" + (f ? "pmos3" : "nmos3"));
      }
      h.controlSources = (E.controlSources || []).map((g) => S(g, "", "V")), h.controlSource = h.controlSources[0] || "", h.coupledInductors = (E.coupledInductors || []).map((g) => S(g, "", "L"));
      for (const g of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const f = g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        h.value = h.value.replace(new RegExp("(?<![\\w./%])" + f + "(?![\\w.$])", "g"), () => S(g));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: e };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function ce(t) {
  return [...t.devices, ...t.children.flatMap(ce)];
}
function Re(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const Ae = 6;
function we(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const de = (t) => ["pwr", "ret", "bias"].includes(t), vt = (t) => String(t).split("/").at(-1).toLowerCase(), _e = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[vt(t)] || "unknown", Ot = (t) => {
  const e = we(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || _e(t);
};
function St(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (a, r, s) => {
    e.has(a) || e.set(a, []), e.get(a).push({ node: r, delta: s });
  };
  for (const a of t)
    if (a.kind === "V")
      try {
        let r = a.value.trim();
        const s = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (s && Number(ae(s[1], a.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const c = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!c) continue;
        const p = ae(c[1], a.parameters);
        if (typeof p != "number" || !Number.isFinite(p)) continue;
        o(a.terminals["-"], a.terminals["+"], p), o(a.terminals["+"], a.terminals["-"], -p);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Set();
  for (const a of ["0", ...e.keys()]) {
    if (d.has(a)) continue;
    const r = /* @__PURE__ */ new Map([[a, 0]]), s = [a];
    d.add(a);
    let c = !1;
    for (let p = 0; p < s.length; p++) for (const m of e.get(s[p]) || []) {
      const h = r.get(s[p]) + m.delta;
      r.has(m.node) ? Math.abs(r.get(m.node) - h) > 1e-8 * Math.max(1, Math.abs(h)) && (c = !0) : (r.set(m.node, h), d.add(m.node), s.push(m.node));
    }
    c && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [p, m] of r) i[p] = { value: m, reference: a, known: a === "0" && !c, consistent: !c };
  }
  return { nodes: i, diagnostics: n };
}
function It(t, e) {
  const n = St(ce(t.root)), o = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const r = we(a.name), s = _e(a.name);
    o[a.name] = { role: r !== "unknown" ? r : s, roleSource: r !== "unknown" ? "node-name" : s !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[a.name]?.known ? n.nodes[a.name].value : null };
  }
  const d = (a, r, s) => {
    const c = { role: o[s].role, roleSource: o[s].roleSource }, p = a.block?.ports.find((E) => E.pin === r);
    if (p?.implicit || !a.block && !a.synthetic) return c;
    const m = a.synthetic ? a.value : p?.name || p?.label, h = Ot(m);
    return h !== "unknown" ? { role: h, roleSource: we(m) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : de(c.role) ? { ...c, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const r = Object.fromEntries(Object.entries(a.terminals).map(([b, C]) => [b, { ...o[C], ...d(a, b, C) }])), s = Object.values(r), c = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), p = c && s.length === 2 && s.every((b) => !de(b.role) && (b.potential === null || b.role !== "unknown")), m = a.terminals["+"], h = a.terminals["-"], E = [m, h].filter((b) => b && b !== "0"), N = a.kind === "V" && E.some((b) => de(o[b]?.role)) && !E.some((b) => ["in", "out", "io", "fb"].includes(o[b]?.role)) && [m, h].every((b) => n.nodes[b]?.known), S = m === "0" ? h : m, g = Object.keys(a.terminals), f = (b) => de(b.role) ? b.potential !== null ? b.potential > 0 ? "high" : "low" : b.role === "ret" ? "low" : "high" : "signal";
    let l = !1;
    g.length === 2 && (a.kind === "V" && s.every((b) => b.potential !== null) ? l = s[0].potential < s[1].potential : a.terminals[g[0]] === "0" ? l = !0 : a.terminals[g[1]] === "0" ? l = !1 : s.every((b) => b.potential !== null) ? l = s[0].potential < s[1].potential : l = f(s[0]) === "low" || f(s[1]) === "high" && f(s[0]) === "signal");
    const y = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    i[a.name] = { version: Ae, kind: a.kind, owner: y.includes("/") ? y.slice(0, y.lastIndexOf("/")) : "", passive: c, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !c, ports: r, horizontal: p, orientation: p ? "horizontal" : l ? "vertical-reversed" : "vertical", flexible: g.length === 2 && (c || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!N, voltage: N ? n.nodes[S].value : null };
  }
  return { version: Ae, nodes: o, cells: i, diagnostics: n.diagnostics };
}
function Te(t, e) {
  const n = e.ports.map((i, d) => ({ pin: "P" + d, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), o = new Set(ce(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of t.ir.globals) {
    const d = be([], i);
    o.has(d) && !n.some((a) => a.node === d) && n.push({ pin: "G" + n.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: d, implicit: !0 });
  }
  return n;
}
function Nt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  const d = [], a = [];
  function r(p) {
    a.push(...Object.values(p.nodes), ...p.ports.map((h) => h.node));
    const m = [...p.devices.map((h) => ({ line: h.line, device: h })), ...p.children.map((h) => ({ line: h.line, child: h }))].sort((h, E) => h.line - E.line);
    for (const h of m) {
      if (h.device) {
        const g = h.device;
        d.push({ ...g, layoutLabel: [...p.path.slice(i.path.length), g.localName].join("/") });
        continue;
      }
      const E = h.child;
      if (e === "flat" || n.has(E.id)) {
        r(E);
        continue;
      }
      const N = Te(t, E), S = U();
      N.forEach((g) => {
        S[g.pin] = g.node;
      }), d.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: S, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(i.path.length).join("/"), block: { definitionId: E.scopeId, ports: N, parameters: E.params } });
    }
  }
  r(i);
  for (const [p, m] of i.ports.entries()) d.push({ name: "@port/" + o + "/" + p, kind: "PORT", type: "spice_port", terminals: { A: m.node }, layoutLabel: m.name, value: m.name, raw: "Interface port " + m.name, synthetic: !0 });
  if (d.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const s = Object.assign(U(), ...Object.values(t.contexts).map((p) => p.models)), c = { title: o || t.ir.title, components: d, nodes: lt(d, a), models: s, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  return c.topology = Lt(t, c), c.layout = It(t, c), c.layout.description = at(t, c), c;
}
function Lt(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const r = t.contexts[a.instanceId];
        if (!r) throw Error("Projection contains an unknown block.");
        const s = Te(t, r);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(s.map((c) => [c.pin, c.node]))) throw Error("Block interface topology mismatch: " + a.name);
        n.push(...ce(r));
      } else n.push(a);
  for (const a of n) {
    if (o.has(a.name)) throw Error("Projection duplicates " + a.name);
    o.add(a.name);
  }
  const i = Re(n), d = ce(t.contexts[e.focus]);
  if (i !== Re(d)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: i };
}
function kt(t) {
  const e = U(), n = U();
  for (const o of t.components) {
    const i = U(), d = U();
    for (const [a, r] of Object.entries(o.terminals))
      i[a] = [t.nodes[r].bit], d[a] = "input";
    e[o.name] = { type: o.type, port_directions: d, connections: i, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((a) => ({ pin: a.pin, label: a.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((a, r) => ({ pin: a, label: o.pinLabels?.[r] || a })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceLayoutDescription: t.layout?.description || null } } };
}
function Rt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, i = (s) => (n.has(s) || n.set(s, n.size + 2), n.get(s));
  Object.entries(t.modules.circuit.cells).forEach(([s, c], p) => {
    const m = "c" + p;
    e.set(m, s);
    const h = Object.fromEntries(Object.entries(c.connections).map(([E, N]) => [E, N.map(i)]));
    o[m] = { type: c.type, connections: h, port_directions: c.port_directions, attributes: { displayRef: c.attributes.displayRef || c.attributes.ref || "", value: c.attributes.value || "", name: c.attributes.name || "" } }, c.spiceBlock && (o[m].spiceBlock = c.spiceBlock), c.spiceSymbol && (o[m].spiceSymbol = c.spiceSymbol), c.spiceLayout && (o[m].spiceLayout = c.spiceLayout);
  });
  const d = new Map([...e].map(([s, c]) => [c, s])), a = t.modules.circuit.spiceLayoutDescription, r = a ? { ...a, groups: a.groups.map((s) => ({ ...s, members: s.members.map((c) => c.cell ? { ...c, cell: d.get(c.cell) } : c) })), relations: a.relations.map((s) => ({ ...s, a: d.get(s.a) || s.a, b: d.get(s.b) || s.b })) } : null;
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([s, c]) => [c, s])) };
}
const W = /* @__PURE__ */ new Map();
async function At(t, e) {
  const n = Rt(t), o = JSON.stringify([n.netlist, e]);
  let i = W.get(o);
  i ? (W.delete(o), W.set(o, i)) : (i = await Mt(n.netlist, e), i.svg.length < 1e6 && (W.set(o, i), W.size > 20 && W.delete(W.keys().next().value)));
  const d = new DOMParser().parseFromString(i.svg, "image/svg+xml");
  if (d.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const r of d.querySelectorAll("[id],[class]")) {
    const s = r.getAttribute("id");
    s?.startsWith("cell_") && n.ids.has(s.slice(5)) && r.setAttribute("id", "cell_" + n.ids.get(s.slice(5)));
    const c = r.getAttribute("class");
    c && r.setAttribute("class", c.split(/\s+/).map((p) => p.startsWith("cell_") && n.ids.has(p.slice(5)) ? "cell_" + n.ids.get(p.slice(5)) : /^net_\d+$/.test(p) && n.bits.has(Number(p.slice(4))) ? "net_" + n.bits.get(Number(p.slice(4))) : p).join(" "));
  }
  const a = i.drawing ? structuredClone(i.drawing) : null;
  if (a) {
    for (const r of a.components) {
      r.id = n.ids.get(r.id) || r.id;
      for (const s of r.ports) s.bit = n.bits.get(s.bit) ?? s.bit;
    }
    for (const r of a.segments) r.bit = n.bits.get(r.bit) ?? r.bit;
  }
  return { svg: new XMLSerializer().serializeToString(d.documentElement), drawing: a };
}
function Mt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DXOKq-d2.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, i) => {
    const d = (s, c) => {
      clearTimeout(r), n.terminate(), s ? i(Error(s)) : o(c);
    }, a = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => d("Layout timed out. Open a subcircuit sheet or collapse instances."), a);
    n.onmessage = ({ data: s }) => d(s.error, { svg: s.svg, drawing: s.drawing }), n.onerror = (s) => d(s.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Pt = `* RLC low-pass filter
* Classic capacitor-output series-RLC topology, with a 1k output load.
* Reference: https://circuits.mit.edu/S26/psets/12/series_filters
* Component values are illustrative, not copied from a reference design.
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, Dt = `* Voltage-divider biased common-emitter amplifier.
* Topology reference: Analog Devices, Single Transistor Amplifier Stages, 9.2.
* https://wiki.analog.com/university/courses/electronics/text/chapter-9
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
`, _t = `* Common-collector voltage follower; independently chosen example values.
* Topology reference: Analog Devices, Single Transistor Amplifier Stages, 9.4.
* https://wiki.analog.com/university/courses/electronics/text/chapter-9
V1 vcc 0 12
V2 in 0 SINE(0 10m 1k)
CIN in b 1u
R1 vcc b 100k
R2 b 0 100k
Q1 vcc b e QN
RE e 0 2.2k
COUT e out 1u
RL out 0 10k
.model QN NPN(BF=150)
.end
`, Tt = `* Unity-gain Sallen-Key second-order low-pass filter.
* Topology: TI SLOA024B, section 3 (Analysis of the Sallen-Key Architecture).
* https://www.ti.com/lit/an/sloa024b/sloa024b.pdf
* Equal 10k resistors and 10n capacitors: ideal f0=1.59kHz, Q=0.5.
* Example component values; LM741 is the official TI/National macromodel.
* LM741 model pin order: non-inverting, inverting, V+, V-, output.
.title Sallen-Key low-pass with LM741
VCC PWR_VCC 0 15
VEE RET_VEE 0 -15
VIN IN_SIG 0 AC 1 SIN(0 100m 100)
R1 IN_SIG N_FILTER 10k
R2 N_FILTER N_NONINV 10k
C1 N_FILTER OUT_SIG 10n
C2 N_NONINV 0 10n
XU1 N_NONINV OUT_SIG PWR_VCC RET_VEE OUT_SIG LM741
RL OUT_SIG 0 100k
.ac dec 40 10 100k
.tran 20u 20m
* Vendor model follows verbatim; no external .include is required.

*//////////////////////////////////////////////////////////////////////
* (C) National Semiconductor, Inc.
* Models developed and under copyright by:
* National Semiconductor, Inc.  

*/////////////////////////////////////////////////////////////////////
* Legal Notice: This material is intended for free software support.
* The file may be copied, and distributed; however, reselling the 
*  material is illegal

*////////////////////////////////////////////////////////////////////
* For ordering or technical information on these models, contact:
* National Semiconductor's Customer Response Center
*                 7:00 A.M.--7:00 P.M.  U.S. Central Time
*                                (800) 272-9959
* For Applications support, contact the Internet address:
*  amps-apps@galaxy.nsc.com

*//////////////////////////////////////////////////////////
*LM741 OPERATIONAL AMPLIFIER MACRO-MODEL
*//////////////////////////////////////////////////////////
*
* connections:      non-inverting input
*                   |   inverting input
*                   |   |   positive power supply
*                   |   |   |   negative power supply
*                   |   |   |   |   output
*                   |   |   |   |   |
*                   |   |   |   |   |
.SUBCKT LM741       1   2  99  50  28
*
*Features:
*Improved performance over industry standards
*Plug-in replacement for LM709,LM201,MC1439,748
*Input and output overload protection
*
****************INPUT STAGE**************
*
IOS 2 1 20N
*^Input offset current
R1 1 3 250K
R2 3 2 250K
I1 4 50 100U
R3 5 99 517
R4 6 99 517
Q1 5 2 4 QX
Q2 6 7 4 QX
*Fp2=2.55 MHz
C4 5 6 60.3614P
*
***********COMMON MODE EFFECT***********
*
I2 99 50 1.6MA
*^Quiescent supply current
EOS 7 1 POLY(1) 16 49 1E-3 1
*Input offset voltage.^
R8 99 49 40K
R9 49 50 40K
*
*********OUTPUT VOLTAGE LIMITING********
V2 99 8 1.63
D1 9 8 DX
D2 10 9 DX
V3 10 50 1.63
*
**************SECOND STAGE**************
*
EH 99 98 99 49 1
G1 98 9 5 6 2.1E-3
*Fp1=5 Hz
R5 98 9 95.493MEG
C3 98 9 333.33P
*
***************POLE STAGE***************
*
*Fp=30 MHz
G3 98 15 9 49 1E-6
R12 98 15 1MEG
C5 98 15 5.3052E-15
*
*********COMMON-MODE ZERO STAGE*********
*
*Fpcm=300 Hz
G4 98 16 3 49 3.1623E-8
L2 98 17 530.5M
R13 17 16 1K
*
**************OUTPUT STAGE**************
*
F6 50 99 POLY(1) V6 450U 1
E1 99 23 99 15 1
R16 24 23 25
D5 26 24 DX
V6 26 22 0.65V
R17 23 25 25
D6 25 27 DX
V7 22 27 0.65V
V5 22 21 0.18V
D4 21 15 DX
V4 20 22 0.18V
D3 15 20 DX
L3 22 28 100P
RL3 22 28 100K
*
***************MODELS USED**************
*
.MODEL DX D(IS=1E-15)
.MODEL QX NPN(BF=625)
*
.ENDS
*$

.end
`, Ut = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.
* Topology and resistor ratios: TI SBOA282A (Three Op Amp Instrumentation Amplifier).
* https://www.ti.com/lit/an/sboa282a/sboa282a.pdf
* Adaptation: LM741 models replace the reference design's TLV171 devices.
* Rf=10k, Rg=2.21k; unity-gain difference stage. Ideal overall gain=10.05.
* Open XINA -> XINPUT / XDIFF -> XU1 / XU2 / XU3 to inspect each IC macromodel.
* LM741 pin order: non-inverting, inverting, V+, V-, output.
.title Three-op-amp instrumentation amplifier
VCC PWR_VCC 0 15
VEE RET_VEE 0 -15
VIP IN_P 0 SIN(0 25m 100) AC 0.5
VIN IN_N 0 SIN(0 25m 100 0 0 180) AC 0.5 180
XINA IN_P IN_N OUT_SIG PWR_VCC RET_VEE INA3
RL OUT_SIG 0 100k
CP PWR_VCC 0 100n
CN RET_VEE 0 100n

.subckt INA3 IN_P IN_N OUT_SIG PWR_VCC RET_VEE
XINPUT IN_P IN_N N_BUFFER_P N_BUFFER_N PWR_VCC RET_VEE INPUT_PAIR
XDIFF N_BUFFER_P N_BUFFER_N OUT_SIG PWR_VCC RET_VEE DIFFERENCE
.ends INA3

.subckt INPUT_PAIR IN_P IN_N OUT_P OUT_N PWR_VCC RET_VEE
XU1 IN_P N_INV_P PWR_VCC RET_VEE OUT_P LM741
XU2 IN_N N_INV_N PWR_VCC RET_VEE OUT_N LM741
RF1 OUT_P N_INV_P 10k
RF2 OUT_N N_INV_N 10k
RG N_INV_P N_INV_N 2.21k
.ends INPUT_PAIR

.subckt DIFFERENCE IN_P IN_N OUT_SIG PWR_VCC RET_VEE
R1 IN_N N_INV 10k
R2 OUT_SIG N_INV 10k
R3 IN_P N_NONINV 10k
R4 N_NONINV 0 10k
XU3 N_NONINV N_INV PWR_VCC RET_VEE OUT_SIG LM741
.ends DIFFERENCE

.ac dec 40 1 100k
.tran 20u 40m
* Vendor model follows verbatim; no external .include is required.

*//////////////////////////////////////////////////////////////////////
* (C) National Semiconductor, Inc.
* Models developed and under copyright by:
* National Semiconductor, Inc.  

*/////////////////////////////////////////////////////////////////////
* Legal Notice: This material is intended for free software support.
* The file may be copied, and distributed; however, reselling the 
*  material is illegal

*////////////////////////////////////////////////////////////////////
* For ordering or technical information on these models, contact:
* National Semiconductor's Customer Response Center
*                 7:00 A.M.--7:00 P.M.  U.S. Central Time
*                                (800) 272-9959
* For Applications support, contact the Internet address:
*  amps-apps@galaxy.nsc.com

*//////////////////////////////////////////////////////////
*LM741 OPERATIONAL AMPLIFIER MACRO-MODEL
*//////////////////////////////////////////////////////////
*
* connections:      non-inverting input
*                   |   inverting input
*                   |   |   positive power supply
*                   |   |   |   negative power supply
*                   |   |   |   |   output
*                   |   |   |   |   |
*                   |   |   |   |   |
.SUBCKT LM741       1   2  99  50  28
*
*Features:
*Improved performance over industry standards
*Plug-in replacement for LM709,LM201,MC1439,748
*Input and output overload protection
*
****************INPUT STAGE**************
*
IOS 2 1 20N
*^Input offset current
R1 1 3 250K
R2 3 2 250K
I1 4 50 100U
R3 5 99 517
R4 6 99 517
Q1 5 2 4 QX
Q2 6 7 4 QX
*Fp2=2.55 MHz
C4 5 6 60.3614P
*
***********COMMON MODE EFFECT***********
*
I2 99 50 1.6MA
*^Quiescent supply current
EOS 7 1 POLY(1) 16 49 1E-3 1
*Input offset voltage.^
R8 99 49 40K
R9 49 50 40K
*
*********OUTPUT VOLTAGE LIMITING********
V2 99 8 1.63
D1 9 8 DX
D2 10 9 DX
V3 10 50 1.63
*
**************SECOND STAGE**************
*
EH 99 98 99 49 1
G1 98 9 5 6 2.1E-3
*Fp1=5 Hz
R5 98 9 95.493MEG
C3 98 9 333.33P
*
***************POLE STAGE***************
*
*Fp=30 MHz
G3 98 15 9 49 1E-6
R12 98 15 1MEG
C5 98 15 5.3052E-15
*
*********COMMON-MODE ZERO STAGE*********
*
*Fpcm=300 Hz
G4 98 16 3 49 3.1623E-8
L2 98 17 530.5M
R13 17 16 1K
*
**************OUTPUT STAGE**************
*
F6 50 99 POLY(1) V6 450U 1
E1 99 23 99 15 1
R16 24 23 25
D5 26 24 DX
V6 26 22 0.65V
R17 23 25 25
D6 25 27 DX
V7 22 27 0.65V
V5 22 21 0.18V
D4 21 15 DX
V4 20 22 0.18V
D3 15 20 DX
L3 22 28 100P
RL3 22 28 100K
*
***************MODELS USED**************
*
.MODEL DX D(IS=1E-15)
.MODEL QX NPN(BF=625)
*
.ENDS
*$

.end
`, ue = {
  filter: { source: Pt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Dt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: _t, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Tt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the official LM741 macromodel.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Ut, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each LM741 macromodel.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Vt(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Me(t) {
  return Vt(await t.arrayBuffer());
}
const Pe = ue.filter.source, I = (t) => document.getElementById("spice-" + t), se = I("app");
if (se) {
  let v = function(w) {
    const O = I("example-info");
    if (O && (O.replaceChildren(), !!w && (O.append(document.createTextNode(w.description + " ")), w.url))) {
      const R = document.createElement("a");
      R.href = w.url, R.target = "_blank", R.rel = "noopener noreferrer", R.textContent = w.reference, O.append(R);
    }
  }, A = function() {
    i = null, d = null, r = "", C(), v(Object.values(ue).find((w) => w.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, P = function(w) {
    o.replaceChildren();
    for (const { severity: O, line: R, message: M, source: L } of w) {
      const T = document.createElement("li");
      T.className = O, T.textContent = `${O.toUpperCase()}${L && L !== "input.cir" ? " · " + L : ""}${R ? " · line " + R : ""}: ${M}`, o.append(T);
    }
    I("messages").open = w.some((O) => O.severity !== "info"), I("message-count").textContent = `${w.length} message${w.length === 1 ? "" : "s"}`;
  }, _ = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${S.x} ${S.y} ${S.w} ${S.h}`), I("zoom-level").textContent = Math.round(g.w / S.w * 100) + "%";
  }, D = function(w, O = S.x + S.w / 2, R = S.y + S.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, S.w * w / g.w)) * g.w / S.w;
    S = { x: O + (S.x - O) * M, y: R + (S.y - R) * M, w: S.w * M, h: S.h * M }, _();
  }, oe = function(w) {
    const O = new URLSearchParams();
    w && O.set("instance", w);
    const R = O.toString();
    location.hash.slice(1) === R ? (h = w, j()) : location.hash = R;
  }, z = function() {
    h = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, le = function(w) {
    const O = c.contexts[w].path;
    for (let R = 1; R <= O.length; R++) l.add(O.slice(0, R).map(encodeURIComponent).join("/"));
  }, Ee = function() {
    const w = !!(E && E !== h && c?.contexts[E]);
    I("selection-actions").hidden = !w, I("toggle-instance").textContent = l.has(E) ? "Collapse instance" : "Expand instance", I("toggle-instance").disabled = !1, I("open-instance").href = "#" + new URLSearchParams({ instance: E });
  }, ye = function() {
    I("breadcrumbs").replaceChildren();
    const w = (R, M) => {
      const L = document.createElement("button");
      L.type = "button", L.textContent = R, L.onclick = () => oe(M), L.disabled = M === h, I("breadcrumbs").append(L);
    };
    if (w("Top", ""), h) {
      const R = c.contexts[h].path;
      for (let M = 0; M < R.length; M++) w(R[M], R.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    I("instances").replaceChildren();
    const O = (R, M) => {
      for (const L of R.children) {
        const T = document.createElement("div");
        T.className = "spice-instance-row", T.style.setProperty("--depth", Math.min(M, 8)), T.dataset.instance = L.id;
        const G = document.createElement("button");
        G.type = "button", G.textContent = l.has(L.id) ? "−" : "+", G.title = (l.has(L.id) ? "Collapse " : "Expand ") + L.id, G.setAttribute("aria-label", G.title), G.setAttribute("aria-expanded", String(l.has(L.id))), G.onclick = () => {
          l.has(L.id) ? l.delete(L.id) : le(L.id), E = L.id, j();
        };
        const Z = document.createElement("a");
        Z.href = "#" + new URLSearchParams({ instance: L.id }), Z.textContent = L.name + " · " + L.definition, Z.title = "Open " + L.id + " as its own sheet";
        const Q = document.createElement("span");
        if (Q.className = "spice-help", Q.textContent = Object.entries(L.params).map(([H, J]) => H + "=" + J).join(" · "), T.append(G, Z), Q.textContent) {
          const H = document.createElement("details"), J = document.createElement("summary");
          J.textContent = "Parameters", H.append(J, Q), T.append(H);
        }
        I("instances").append(T), O(L, M + 1);
      }
    };
    O(c.contexts[h], 0), I("hierarchy-panel").hidden = !c.contexts[h].children.length, I("focus-title").textContent = h ? h + " / " + c.contexts[h].definition : "Top-level schematic", Ee();
  };
  const t = I("input"), e = I("preview"), n = I("status"), o = I("diagnostics");
  let i = null, d = null, a = !1, r = "", s, c, p, m = "", h = "", E = "", N = !1, S = { x: 0, y: 0, w: 1, h: 1 }, g = { ...S }, f;
  const l = /* @__PURE__ */ new Set();
  let y = !1, b = {};
  try {
    b = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  se.addEventListener("click", (w) => {
    N && w.target.closest('a[href^="#"]') && w.preventDefault();
  });
  const C = () => {
    I("copy").disabled = I("download").disabled = !r || N, I("download-asc").disabled = I("download-asc-bundle").disabled = !r || !i || N || a;
  }, x = () => ({ font: I("font").value, fontSize: Number(I("size").value), color: I("color").value, detailed: I("detailed").checked, conventional: I("conventional").checked });
  t.value = Pe;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Pe;
  } catch {
  }
  v(Object.values(ue).find((w) => w.source === t.value)), t.addEventListener("input", A);
  for (const w of ["font", "size", "color", "detailed", "conventional"]) I(w).addEventListener("input", A);
  I("zoom-in").onclick = () => D(0.8), I("zoom-out").onclick = () => D(1.25), I("fit").onclick = () => {
    S = { ...g }, _();
  };
  const q = (w) => {
    const O = e.querySelector("svg");
    return O ? new DOMPoint(w.clientX, w.clientY).matrixTransform(O.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (w) => {
    const O = q(w);
    O && (w.preventDefault(), D(w.deltaY > 0 ? 1.12 : 1 / 1.12, O.x, O.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (w) => {
    w.button !== 0 || !e.querySelector("svg") || (f = { start: q(w), x: w.clientX, y: w.clientY, view: { ...S }, moved: !1 }, e.setPointerCapture(w.pointerId));
  }), e.addEventListener("pointermove", (w) => {
    if (!f) return;
    const O = q(w);
    Math.hypot(w.clientX - f.x, w.clientY - f.y) > 4 && (f.moved = !0), S.x += f.start.x - O.x, S.y += f.start.y - O.y, _();
  }), e.addEventListener("pointerup", (w) => {
    if (!f) return;
    const O = f.moved;
    if (f = null, e.hasPointerCapture(w.pointerId) && e.releasePointerCapture(w.pointerId), !O) {
      const R = document.elementFromPoint(w.clientX, w.clientY)?.closest("[data-component]"), M = s?.components.find((L) => L.name === R?.dataset.component);
      M && (E = M.instanceId || "", I("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([L, T]) => `${L} → ${T}`).join("   ")}`, M.kind === "X" ? (le(M.instanceId), j()) : Ee());
    }
  }), window.addEventListener("hashchange", () => {
    if (N) {
      y = !0;
      return;
    }
    z(), E = "", j();
  }), I("collapse-all").onclick = () => {
    l.clear(), j();
  }, I("expand-all").onclick = () => {
    for (const w of Object.keys(c?.contexts || {})) w && l.add(w);
    j();
  }, I("toggle-instance").onclick = () => {
    l.has(E) ? l.delete(E) : le(E), j();
  }, e.addEventListener("pointercancel", () => {
    f = null;
  }), e.addEventListener("keydown", (w) => {
    const O = w.target.closest("[data-instance]");
    if (O && (w.key === "Enter" || w.key === " ")) {
      w.preventDefault(), E = O.dataset.instance, le(E), j();
      return;
    }
    w.key === "+" || w.key === "=" ? D(0.8) : w.key === "-" ? D(1.25) : w.key.toLowerCase() === "f" ? (S = { ...g }, _()) : w.key.startsWith("Arrow") && (w.preventDefault(), S.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[w.key] || 0) * S.w, S.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[w.key] || 0) * S.h, _());
  });
  async function j() {
    if (N) return;
    N = !0, i = null, d = null, r = "", C(), I("generate").disabled = !0, t.readOnly = !0, I("file").disabled = !0, I("libraries").disabled = !0;
    for (const O of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) O.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let w = [];
    try {
      if (m !== t.value || !c) {
        if (p = ct(t.value, { files: b }), w = [...p.diagnostics], w.some((k) => k.severity === "error"))
          throw c = null, Error("Fix the parser errors below before generating.");
        c = xt(p), m && m !== t.value ? (l.clear(), h = "", E = "", history.replaceState(null, "", location.pathname + location.search)) : z(), m = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (w = [...p.diagnostics], P(w), w.some((k) => k.severity === "error")) throw Error("Fix the parser errors below before generating.");
      s = Nt(c, { expanded: l, focus: h });
      const O = kt(s);
      x().conventional && w.push(...s.layout.diagnostics);
      const R = await At(O, x()), M = new DOMParser().parseFromString(R.svg, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const L = M.documentElement, T = L.querySelector("#spice-layout-report");
      if (T) {
        s.layout.report = JSON.parse(T.textContent);
        const k = s.layout.report;
        w.push({ severity: "info", message: `Layout: compact signal flow; ${k.powerSourcesChecked} DC/ground symbols checked, ${k.powerOrderViolations} DC order preference(s) unmet. ${k.powerPass}. ${k.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), k.classicTemplateFallback && w.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), k.groundPlacement && w.push({ severity: "info", message: `Ground: ${k.groundPlacement}; ${k.straightenedGroundDrops || 0} return-path simplification(s).` }), k.explicitGroups && w.push({ severity: "info", message: `Layout comments: ${k.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), k.classicRails && w.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${k.railCount} shared voltage rails.` }), k.localClassicInstances?.length && w.push({ severity: "info", message: `${k.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), k.geometricConnectivityVerified && w.push({ severity: "info", message: `Net geometry verified; ${k.cyclesRemoved} same-net loop(s) and ${k.leavesRemoved} unused wire branch(es) removed.` }), P(w);
      }
      if (L.localName !== "svg" || L.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const G = Number(L.getAttribute("width")), Z = Number(L.getAttribute("height"));
      g = { x: -20, y: -20, w: G + 40, h: Z + 40 }, S = { ...g }, L.setAttribute("viewBox", `${g.x} ${g.y} ${g.w} ${g.h}`), L.setAttribute("width", String(g.w)), L.setAttribute("height", String(g.h)), L.setAttribute("role", "img"), L.setAttribute("aria-label", s.title || "SPICE schematic"), L.setAttribute("style", "background:white");
      for (const k of s.components) {
        const V = M.getElementById("cell_" + k.name);
        if (!V) throw Error("Renderer omitted component " + k.name);
        V.setAttribute("data-component", k.name), k.kind === "X" && (V.setAttribute("data-instance", k.instanceId), V.setAttribute("role", "button"), V.setAttribute("tabindex", "0"), V.setAttribute("aria-label", "Expand " + k.name));
        const K = M.createElementNS(L.namespaceURI, "title");
        K.textContent = k.raw + `
Resolved: ` + k.value + `
` + Object.entries(k.terminals).map(([B, ie]) => B + ": " + ie).join(", "), V.prepend(K);
      }
      for (const k of Object.values(s.nodes))
        for (const V of L.querySelectorAll(".net_" + k.bit)) {
          V.setAttribute("data-net", k.name);
          const K = M.createElementNS(L.namespaceURI, "title");
          K.textContent = "Node " + k.displayName, V.append(K);
        }
      const Q = s.components.filter((k) => k.kind === "K").map((k) => ({ name: k.name, inductors: k.coupledInductors, value: k.value }));
      if (Q.length) {
        const k = M.createElementNS(L.namespaceURI, "metadata");
        k.setAttribute("id", "spice-magnetic-couplings"), k.textContent = JSON.stringify(Q), L.append(k);
        for (const V of Q) for (const K of V.inductors) {
          const B = M.getElementById("cell_" + K);
          if (!B) continue;
          const ie = M.createElementNS(L.namespaceURI, "circle"), he = [...B.children].find((me) => me.getAttribute("s:pid") === "A"), Ue = he?.getAttribute("s:position"), xe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Ue] || [0, 0];
          for (const [me, Ve] of Object.entries({ cx: Number(he?.getAttribute("s:x")) + xe[0], cy: Number(he?.getAttribute("s:y")) + xe[1], r: 3, fill: x().color, stroke: "none", "data-coupling": V.name })) ie.setAttribute(me, String(Ve));
          const ve = M.createElementNS(L.namespaceURI, "title");
          ve.textContent = V.name + " · dotted terminal: " + V.inductors.join(", "), ie.append(ve), B.append(ie);
        }
      }
      i = R.drawing, r = new XMLSerializer().serializeToString(L), I("source").value = r, e.replaceChildren(document.importNode(L, !0)), _();
      const H = w.filter((k) => k.severity === "warning").length;
      n.textContent = `${s.components.filter((k) => !k.synthetic).length} components · ${Object.keys(s.nodes).length} nodes · ${s.topology.leafCount} primitive devices verified${H ? " · Review " + H + " warning(s); drawing may be partial." : " · Schematic ready."}`, s.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${s.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), s.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const J = Object.values(s.nodes).map((k) => {
        const V = document.createElement("tr");
        for (const K of [k.displayName, k.terminals.map((B) => B.component + "." + B.pin).join(", ")]) {
          const B = document.createElement("td");
          B.textContent = K, V.append(B);
        }
        return V;
      });
      I("nets").replaceChildren(...J), I("json").value = JSON.stringify({ circuit: s, netlist: O, hierarchy: p }, null, 2), I("selection").textContent = "Click a component to inspect its original statement and pin connections.", ye();
    } catch (O) {
      if (e.replaceChildren(), r = "", I("source").value = "", I("json").value = "", I("nets").replaceChildren(), I("selection").textContent = "", n.textContent = O.message, !c)
        I("hierarchy-panel").hidden = !0, I("selection-actions").hidden = !0, I("breadcrumbs").replaceChildren();
      else if (!c.contexts[h]) {
        const R = document.createElement("button");
        R.type = "button", R.textContent = "Return to Top", R.onclick = () => oe(""), I("breadcrumbs").replaceChildren(R);
      }
      O.diagnostics && (w = O.diagnostics), w.some((R) => R.severity === "error") || w.push({ severity: "error", line: 0, message: O.message }), P(w);
    } finally {
      N = !1, I("generate").disabled = !1, t.readOnly = !1, I("file").disabled = !1, I("libraries").disabled = !1;
      for (const O of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) O.disabled = !1;
      c && c.contexts[h] && ye(), e.setAttribute("aria-busy", "false"), C(), y && (y = !1, z(), queueMicrotask(j));
    }
  }
  I("generate").onclick = j;
  for (const w of se.querySelectorAll("[data-example]")) w.onclick = () => {
    const O = ue[w.dataset.example];
    t.value = O.source, A(), v(O), j();
  };
  I("file").onchange = async (w) => {
    const O = w.target.files[0];
    if (O) {
      if (O.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Me(O), A(), j();
      } catch (R) {
        n.textContent = "File could not be read: " + R.message;
      } finally {
        w.target.value = "";
      }
    }
  }, I("libraries").onchange = async (w) => {
    try {
      for (const O of w.target.files) {
        if (O.size > 16e6) throw Error("Library exceeds 16 MB: " + O.name);
        b[O.webkitRelativePath || O.name] = await Me(O);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(b));
      } catch {
      }
      c = null, m = "", I("library-status").textContent = Object.keys(b).length + " library file(s) loaded", j();
    } catch (O) {
      n.textContent = O.message;
    } finally {
      w.target.value = "";
    }
  }, I("library-status").textContent = Object.keys(b).length ? "Libraries restored from this session." : "For .include / .lib dependencies", I("download").onclick = () => {
    const w = URL.createObjectURL(new Blob([r], { type: "image/svg+xml;charset=utf-8" })), O = document.createElement("a");
    O.href = w, O.download = "spice-schematic.svg", O.click(), setTimeout(() => URL.revokeObjectURL(w), 1e3);
  };
  async function Ce(w) {
    const O = i;
    if (!(!O || N || a)) {
      a = !0, C(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: R } = await import("./asc-export-MuPKVdWr.js");
        if (i !== O) throw Error("Schematic changed. Generate again before exporting ASC.");
        d ||= R({ tree: c, circuit: s, drawing: O, source: t.value, libraries: b });
        const M = w ? d.zip : d.ascBytes, L = URL.createObjectURL(new Blob([M], { type: w ? "application/zip" : "application/octet-stream" })), T = document.createElement("a");
        T.href = L, T.download = w ? "spice-schematic-asc.zip" : "spice-schematic.asc", T.click(), setTimeout(() => URL.revokeObjectURL(L), 1e3), n.textContent = "ASC connections verified · " + d.manifest.audit.symbols + " symbols. " + (w ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), d.manifest.warnings.length && (n.textContent += " " + d.manifest.warnings.join(" "));
      } catch (R) {
        n.textContent = "ASC export failed: " + R.message;
        const M = document.createElement("li");
        M.className = "error", M.textContent = n.textContent, o.append(M);
      } finally {
        a = !1, C();
      }
    }
  }
  I("download-asc").onclick = () => Ce(!1), I("download-asc-bundle").onclick = () => Ce(!0), I("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(r), n.textContent = "SVG source copied to clipboard.";
    } catch {
      I("source-details").open = !0, I("source").focus(), I("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
export {
  Le as b,
  ce as l,
  be as n,
  pt as p
};
