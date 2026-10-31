const _t = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, vt = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Nt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ct = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, It = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Tt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, St = { 1: "a", 2: "b", 7: "Q", 8: "com" }, At = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ot = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, kt = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Rt = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Lt = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Mt = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Pt = {
  AND: _t,
  BUF: vt,
  COUNTER: Nt,
  DFLOP: Ct,
  SCHMITT: It,
  OR: Tt,
  PHASEDET: St,
  SRFLOP: At,
  XOR: Ot,
  MODULATOR: kt,
  OTA: Rt,
  SAMPLEHOLD: Lt,
  VARISTOR: Mt
}, Dt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", _e = (t) => t.toLowerCase(), nt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Ut = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Bt(t, e) {
  const n = (I) => e[_e(I || "")] || Object.entries(e).find(([x]) => x.startsWith(_e(I || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], i = [], c = "", a = "", f = [], h = [], u = 0, g = "", d = "", y = "", w = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], a = _e(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], a = o === "D" ? "d_v" : o === "B" ? "spice_b" : _e(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !nt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), c = t[r.length + 1] || "";
    const I = n(c)?.type;
    w = ["NPN", "PNP"].includes(I), a = w ? (r.length === 3 ? "q_" : "spice_q4_") + _e(I) : "spice_q" + r.length;
  } else if (o === "M") {
    const I = n(t[4]), x = n(t[5]), b = I?.type === "VDMOS" || !x && (!t[5] || nt(t[5]));
    r = b ? ["D", "G", "S"] : ["D", "G", "S", "B"], c = t[r.length + 1] || "";
    const v = n(c), T = v?.type;
    if (b && v && T !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!b && T === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    w = ["NMOS", "PMOS", "VDMOS"].includes(T);
    let M = null, C = v;
    const k = /* @__PURE__ */ new Set();
    for (; C && !k.has(C.name) && (k.add(C.name), M = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !M); )
      C = n(C.baseModel);
    const U = T === "PMOS" || T === "VDMOS" && M && (M[1] === void 0 || Number(M[1]) >= 0.5);
    a = w ? "spice_" + (U ? "pmos" : "nmos") + (b ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    c = t[4] || "";
    const I = n(c)?.type, x = o === "Z" && ["NIGBT", "PIGBT"].includes(I);
    r = x ? ["C", "G", "E"] : ["D", "G", "S"], w = o === "J" ? ["NJF", "PJF"].includes(I) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(I), a = "spice_" + (x ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(I || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], a = "spice_" + _e(o);
    let I = 3, x = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[I] || "");
    if (/^poly$/i.test(t[I] || "") && (x = /^\(\s*(\d+)\s*\)$/.exec(t[++I] || ""), !x))
      throw Error("POLY requires a dimension.");
    if (x) {
      const b = Number(x[1]);
      if (b > 128) throw Error("POLY supports at most 128 controlling variables.");
      let v = I + 1, T = [];
      const M = "EG".includes(o), C = b * (M ? 2 : 1);
      for (; T.length < C && v < t.length; ) T.push(...Ut(t[v++]));
      if (T.length !== C || v >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (M) {
        for (let k = 0; k < b; k++) r.push("C" + (k + 1) + "+", "C" + (k + 1) + "-");
        i = [t[1], t[2], ...T];
      } else f = T;
      u = v, g = "POLY(" + b + ") " + (M ? "" : T.join(" ") + " "), d = "POLY", M && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? d = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), d = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (f = [t[3]], u = 4, g = t[3] + " ");
    y = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (d ? " · " + d : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], c = t[5] || "", a = "spice_device", y = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], f = [t[3]], c = t[4] || "", u = 3, a = "spice_device", y = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (c = t[5] || ""), a = "spice_device", y = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], c = t[4] || "", a = "spice_device", y = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (I, x) => "P" + (x + 1)), a = "spice_device", y = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (h = t.slice(1, -1), h.some((I) => !/^L/i.test(I.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, a = "spice_coupling", y = "Magnetic coupling", g = h.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], a = "spice_device", y = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], a = "spice_device", y = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", y = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (u || (u = r.length + 1), i.length || (i = t.slice(1, r.length + 1)), i.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (i.some((I) => /[=()]/.test(I) && !/^\{[\s\S]*\}$/.test(I))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (a = "spice_br"), o === "D" && (c = t[3] || ""), o === "@") {
    const I = t.slice(u).join(" ");
    for (const x of I.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(x[1].toUpperCase()), i.push(x[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (f.some((I) => !I)) throw Error("Missing controlling voltage source.");
  const E = r.map((I, x) => o === "A" && Pt[(t[9] || "").toUpperCase()]?.[String(x + 1)] || I);
  return { kind: o, pins: r, nodeTokens: i, pinLabels: E, model: c, type: a, controlSource: f[0] || "", controlSources: f, coupledInductors: h, value: g + t.slice(u).join(" "), sourceMode: d, symbol: y, polarityKnown: w };
}
const Vt = Dt, jt = new Set(Vt.split(" ")), Ve = () => /* @__PURE__ */ Object.create(null), me = (t) => t.toLowerCase();
function De(t) {
  const e = [], n = [];
  let o = "", r = 0, i = "";
  for (let c = 0; c < t.length; c++) {
    const a = t[c];
    if (i) {
      o += a, a === i && t[c - 1] !== "\\" && (i = "");
      continue;
    }
    if (a === '"' || a === "'") {
      i = a, o += a;
      continue;
    }
    if (!r && (a === ";" || a === "$" && (!c || /\s/.test(t[c - 1])))) break;
    if ("({".includes(a) && (n.push(a), r++), ")}".includes(a) && (r--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !r ? (o && e.push(o), o = "") : o += a;
  }
  if (r || i) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Qt(t, e = {}) {
  const n = [], o = [], r = [], i = Object.assign(Ve(), e.models), c = Ve(), a = (x, b, v) => n.push({ severity: x, line: b, message: v });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const f = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((x, b) => {
    const v = x.trim();
    !v || v.startsWith("*") || (v.startsWith("+") ? f.length ? f.at(-1).text += " " + v.slice(1).trim() : a("error", b + 1, "Continuation has no preceding statement.") : f.push({ line: b + 1, text: v }));
  });
  for (const x of f) {
    try {
      x.tokens = De(x.text);
    } catch (v) {
      a("error", x.line, v.message), x.tokens = [];
    }
    const b = x.tokens;
    if (/^\.model$/i.test(b[0] || ""))
      if (b.length < 3) a("error", x.line, ".model requires a name and device type.");
      else {
        const v = /^ako:(.+)$/i.exec(b[2]), T = v && b[3] && !b[3].startsWith("(") ? b[3].split("(")[0].toUpperCase() : "";
        i[me(b[1])] = { name: b[1], type: v ? T : b[2].split("(")[0].toUpperCase(), baseModel: v?.[1] || "", raw: x.text };
      }
  }
  const h = /* @__PURE__ */ new Set();
  function u(x) {
    const b = i[me(x)];
    if (!b) return "";
    if (b.type) return b.type;
    if (h.has(me(x))) throw Error("Circular AKO model inheritance: " + x);
    return h.add(me(x)), b.type = u(b.baseModel), h.delete(me(x)), b.type;
  }
  for (const x of Object.values(i)) if (x.baseModel && !x.type)
    try {
      u(x.name);
    } catch (b) {
      a("error", 0, b.message);
    }
  let g = "", d = 0, y = !1, w = !1;
  const E = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: x, text: b, tokens: v } of f) {
    if (!v.length) continue;
    const T = me(v[0]);
    if (w) {
      a("warning", x, "Statement after .end is not rendered: " + b);
      continue;
    }
    if (T === ".control") {
      y = !0, a("warning", x, ".control script retained but not executed or rendered.");
      continue;
    }
    if (T === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (T === ".subckt") {
      d++, a("error", x, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (T === ".ends") {
      d ? d-- : a("error", x, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (T === ".end") {
      w = !0;
      continue;
    }
    if (T.startsWith(".")) {
      o.push({ line: x, text: b }), T === ".title" ? g = v.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(T) ? a("error", x, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(T) ? a("error", x, "Topology-changing directive is unsupported: " + b) : I.has(T) || a("warning", x, "Directive retained but not resolved: " + b);
      continue;
    }
    const M = v[0][0].toUpperCase();
    if (!jt.has(M)) {
      x === 1 && !/\d/.test(v[0]) && v.length > 1 && M !== "X" ? (g = b, a("warning", x, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", x, `Unsupported ${M} device was not rendered: ${b}`);
      continue;
    }
    const C = M === "M" || M === "Q" ? 5 : 4;
    if (x === 1 && !/\d/.test(v[0]) && (v.length < C || M === "T" && !/\b(?:zo|z0)\s*=/i.test(b))) {
      g = b, a("info", x, "SPICE title: " + b);
      continue;
    }
    try {
      if (E.has(T)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const k = Bt(v, i), { pins: U, nodeTokens: m, ...p } = k;
      k.polarityKnown || a("warning", x, `${v[0]}: model polarity unknown; explicit ${U.join("/")} terminals retained.`);
      const D = Ve();
      U.forEach((q, H) => {
        const K = me(m[H]);
        c[K] || (c[K] = { name: K, displayName: v[H + 1], bit: Object.keys(c).length + 2, terminals: [] }), c[K].terminals.push({ component: v[0], pin: q }), D[q] = K;
      }), r.push({ ...p, name: v[0], terminals: D, line: x, raw: b }), E.add(T);
    } catch (k) {
      a("error", x, `${v[0]}: ${k.message} Statement: ${b}`);
    }
  }
  d && a("error", 0, "Unclosed .subckt definition."), y && a("error", 0, "Unclosed .control block."), r.length || a("error", 0, "No supported components to render."), r.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const x of r) {
    for (const b of x.controlSources || []) !b.includes(":") && !r.some((v) => me(v.name) === me(b) && v.kind === "V") && a("error", x.line, `${x.name}: controlling voltage source ${b} was not found.`);
    for (const b of x.coupledInductors || []) !b.includes(":") && !r.some((v) => me(v.name) === me(b) && v.kind === "L") && a("error", x.line, `${x.name}: coupled inductor ${b} was not found.`);
    (x.kind === "B" || x.type === "spice_b") && a("info", x.line, `${x.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: g, components: r, nodes: c, models: i, directives: o, diagnostics: n };
}
const xe = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), rt = (t) => xe(t).split("/").at(-1);
function Ft(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], i = [], c = [];
  let a = 0;
  const f = (u, g) => {
    const d = xe(g).split("/").slice(0, -1).concat(xe(u)).join("/"), y = [...o].filter(([E]) => xe(E) === xe(u) || xe(E) === d);
    if (y.length === 1) return y[0];
    const w = [...o].filter(([E]) => rt(E) === rt(u));
    if (w.length !== 1) throw Error(w.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return w[0];
  };
  function h(u, g, d = "", y = []) {
    const w = xe(g) + ":" + d.toLowerCase();
    if (y.includes(w)) throw Error("Circular library include: " + [...y, w].join(" → "));
    if (y.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const E = [], I = /^\s*\.endl\b/im.test(u);
    let x = !d;
    const b = (T, M) => {
      if (a += T.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      c.push(T), i.push({ file: g, line: M + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((T, M) => {
      const C = T.trim();
      if (/^\.lib\b/i.test(C) && I) {
        const k = De(C);
        if (k.length === 2 && !/[.\\/]/.test(k[1])) {
          E.push(k[1].toLowerCase()), k[1].toLowerCase() === d.toLowerCase() && (x = !0), b("* Library section " + k[1], M);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        E.pop(), b("* End library section", M);
        return;
      }
      if (d && E.length && !E.includes(d.toLowerCase())) {
        b("* Unselected library section", M);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const k = De(C);
          if (!k[1]) throw Error("Include requires a filename.");
          const [U, m] = f(k[1], g);
          b("* Included " + U, M), h(m, U, k[2] || "", [...y, w]);
        } catch (k) {
          r.push({ severity: "error", line: M + 1, source: g, message: k.message }), b("* Unresolved include", M);
        }
      else b(T, M);
    }), !x) throw Error("Library section " + d + " not found in " + g);
  }
  try {
    h(t, n);
  } catch (u) {
    r.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: c.join(`
`), origins: i, diagnostics: r };
}
function Gt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((a, f) => {
    const h = a.trim();
    /^\.subckt\b/i.test(h) && (o.push(f + 1), n.set(f + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: a, line: f + 1 }) : e[f] = a, /^\.ends\b/i.test(h) && o.length > 1 && o.pop();
  });
  const i = ot(Array.from({ length: t.split(/\r?\n/).length }, (a, f) => e[f] || "").join(`
`));
  r.push(...i.diagnostics);
  const c = /* @__PURE__ */ new Map();
  for (const [a, f] of n) {
    const h = ot(f.map((u) => u.raw).join(`
`));
    c.set(a, h.layout), r.push(...h.diagnostics.map((u) => ({ ...u, line: f[u.line - 1]?.line || a })));
  }
  return { layout: i.layout, scopes: c, diagnostics: r };
}
function ot(t) {
  const e = [], n = [];
  let o = !1, r = !1, i = 0;
  if (t.split(/\r?\n/).forEach((b, v) => {
    const T = b.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(T)) {
      (r || o) && e.push({ severity: "error", line: v + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(T) || e.push({ severity: "error", line: v + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, i = v + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(T)) {
      o || e.push({ severity: "error", line: v + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (T.startsWith("*") ? n.push(T.slice(1).trim()) : e.push({ severity: "error", line: v + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: i, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const c = n.join(" "), a = c.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], f = [], h = [], u = [], g = [];
  let d = 0, y = 0, w = 10;
  const E = () => a[d++], I = () => {
    const b = E();
    if (!b || !/^[A-Za-z_@][\w./%:@-]*$/.test(b)) throw Error("Expected layout identifier, got " + b);
    return b;
  };
  function x(b) {
    if (f.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const v = b ? I() : "@row" + y++, T = E();
    if (!["row", "column", "classic"].includes(T)) throw Error("Expected row, column or classic.");
    if (E() !== "{") throw Error("Expected { after " + T);
    const M = { id: v, direction: T, members: [] };
    for (f.push(M); d < a.length && a[d] !== "}"; )
      a[d] === "group" ? (E(), M.members.push(x(!0))) : ["row", "column"].includes(a[d]) ? M.members.push(x(!1)) : M.members.push(I());
    if (E() !== "}") throw Error("Unclosed group " + v);
    if (!M.members.length) throw Error("Empty layout group " + v);
    return v;
  }
  try {
    for (; d < a.length; )
      if (a[d] === "group")
        E(), x(!0);
      else if (["row", "column"].includes(a[d])) x(!1);
      else if (a[d] === "face") {
        E();
        const m = I(), p = E();
        if (!["left", "right"].includes(p)) throw Error("Expected face left or right.");
        if (g.some((D) => D.device.toLowerCase() === m.toLowerCase())) throw Error("Duplicate face device.");
        g.push({ device: m, side: p });
      } else if (a[d] === "pair") {
        E();
        const m = E();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(m)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (E() !== "{") throw Error("Expected { after pair kind.");
        const p = [];
        for (; d < a.length && a[d] !== "}"; ) p.push(I());
        if (E() !== "}" || !p.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: m, members: p });
      } else if (a[d] === "priority-cap") {
        if (E(), w = Number(E()), !Number.isInteger(w) || w < 3 || w > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const m = I(), p = E(), D = I();
        if (!["left-of", "above"].includes(p)) throw Error("Expected left-of or above.");
        h.push({ a: m, relation: p, b: D });
      } else throw Error("Unknown layout instruction near " + a[d - 1]);
    const b = /* @__PURE__ */ new Set();
    for (const m of f) {
      const p = m.id.toLowerCase();
      if (b.has(p)) throw Error("Duplicate layout group " + m.id);
      b.add(p);
    }
    const v = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), M = new Map(f.map((m) => [m.id.toLowerCase(), m])), C = (m) => {
      if (v.has(m)) throw Error("Circular layout group " + m);
      if (!T.has(m)) {
        v.add(m);
        for (const p of M.get(m).members) M.has(p.toLowerCase()) && C(p.toLowerCase());
        v.delete(m), T.add(m);
      }
    };
    for (const m of M.keys()) C(m);
    const k = /* @__PURE__ */ new Map();
    for (const m of h) {
      if (m.a.toLowerCase() === m.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      k.has(m.a.toLowerCase()) || k.set(m.a.toLowerCase(), []), k.get(m.a.toLowerCase()).push(m.b.toLowerCase());
    }
    v.clear(), T.clear();
    const U = (m) => {
      if (v.has(m)) throw Error("Circular place constraints.");
      if (!T.has(m)) {
        v.add(m);
        for (const p of k.get(m) || []) U(p);
        v.delete(m), T.add(m);
      }
    };
    for (const m of k.keys()) U(m);
  } catch (b) {
    e.push({ severity: "error", line: i, message: "Layout description: " + b.message });
  }
  return { layout: { version: 1, priorityCap: w, groups: f, relations: h, pairs: u, faces: g }, diagnostics: e };
}
function Ht(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const y = new Set(n.groups.map((E) => E.id.toLowerCase())), w = (E) => y.has(E.toLowerCase()) ? E : e.components.find((x) => x.synthetic && x.value.toLowerCase() === E.toLowerCase())?.name || e.focus + "/" + E;
    o = { ...n, groups: n.groups.map((E) => ({ ...E, members: E.members.map(w) })), relations: n.relations.map((E) => ({ ...E, a: w(E.a), b: w(E.b) })), faces: (n.faces || []).map((E) => ({ ...E, device: w(E.device) })), pairs: (n.pairs || []).map((E) => ({ ...E, members: E.members.map(w) })) };
  }
  const r = new Map(o.groups.map((y) => [y.id.toLowerCase(), y])), i = Object.values(t.contexts).flatMap((y) => y.devices.map((w) => w.name)), c = new Set([...Object.keys(t.contexts), ...i, ...e.components.map((y) => y.name)].map((y) => y.toLowerCase()));
  for (const y of r.values()) if (c.has((n ? e.focus + "/" + y.id : y.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + y.id);
  for (const y of r.values()) for (const w of y.members) if (!r.has(w.toLowerCase()) && !c.has(w.toLowerCase())) throw Error("Unknown @layout instance/device: " + w);
  for (const y of o.relations) for (const w of [y.a, y.b]) if (!r.has(w.toLowerCase()) && !c.has(w.toLowerCase())) throw Error("Unknown @layout place target: " + w);
  const a = (o.pairs || []).map((y) => ({ ...y, members: y.members.map((w) => {
    const E = e.components.find((I) => I.name.toLowerCase() === w.toLowerCase());
    if (!E || E.synthetic || E.block) throw Error("Unknown or non-visible @layout pair device: " + w);
    return E.name;
  }) })), f = (o.faces || []).map((y) => {
    const w = e.components.find((E) => E.name.toLowerCase() === y.device.toLowerCase());
    if (!w || !["Q", "M", "J", "Z"].includes(w.kind)) throw Error("Unknown or unsupported @layout face device: " + y.device);
    return { ...y, device: w.name };
  }), h = /* @__PURE__ */ new Map(), u = [], g = new Set(Object.keys(t.contexts).map((y) => y.toLowerCase()));
  for (const y of o.groups) {
    const w = [];
    for (const E of y.members) {
      if (r.has(E.toLowerCase())) {
        w.push({ group: E });
        continue;
      }
      for (const I of e.components) if (I.name.toLowerCase() === E.toLowerCase() || I.name.toLowerCase().startsWith(E.toLowerCase() + "/")) {
        if (h.has(I.name)) throw Error("Overlapping @layout membership: " + I.name);
        h.set(I.name, y.id), w.push({ cell: I.name, ...g.has(E.toLowerCase()) ? { instance: E } : {} });
      }
    }
    u.push({ id: y.id, direction: y.direction, members: w });
  }
  const d = /* @__PURE__ */ new Set();
  for (const y of u) for (const w of y.members) if (w.group) {
    const E = w.group.toLowerCase();
    if (d.has(E)) throw Error("Layout group has multiple parents: " + w.group);
    d.add(E);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: u, relations: o.relations, pairs: a, faces: f };
}
const Ne = () => /* @__PURE__ */ Object.create(null), pe = (t) => t.toLowerCase();
function yt(t) {
  const e = Ne();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const i = pe(r[1]);
    let c = r[2];
    if (c === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + i);
      c = a[1];
    }
    if (c || (c = t[++n]), !c || /^params?:$/i.test(c)) throw Error("Missing value for parameter " + i);
    if (Object.hasOwn(e, i)) throw Error("Duplicate parameter: " + i);
    e[i] = c;
  }
  return e;
}
function it(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, Ne()] : [t.slice(0, e), yt(t.slice(e))];
}
function Wt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Ft(t, e);
  t = n.source;
  const o = Gt(t), r = [...n.diagnostics, ...o.diagnostics], i = Ne(), c = /* @__PURE__ */ new Set(["0"]), a = (b, v, T) => r.push({ severity: b, line: v, message: T }), f = (b, v, T, M = [], C = Ne(), k = 0) => {
    const U = { id: b, name: v, parent: T, ports: M, defaults: C, parameters: Ne(), definitions: Ne(), devices: [], instances: [], directives: [], line: k, statements: [], layoutDescription: o.scopes.get(k) || null };
    return i[b] = U, U;
  }, h = f("root", "Top", null), u = [h], g = [];
  let d = !1, y = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, v) => {
    const T = b.trim();
    !T || T.startsWith("*") || (T.startsWith("+") ? g.length ? g.at(-1).text += " " + T.slice(1).trim() : a("error", v + 1, "Continuation has no preceding statement.") : g.push({ text: T, line: v + 1 }));
  });
  for (const { text: b, line: v } of g)
    try {
      const T = De(b);
      if (!T.length) continue;
      const M = pe(T[0]), C = u.at(-1);
      if (y) {
        a("warning", v, "Statement after .end is not rendered: " + b);
        continue;
      }
      if (M === ".control") {
        d = !0, a("warning", v, ".control script retained but not executed or rendered.");
        continue;
      }
      if (M === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (M === ".subckt") {
        if (T.length < 2) throw Error(".SUBCKT requires a name.");
        const [k, U] = it(T.slice(2)), m = pe(T[1]);
        if (Object.hasOwn(C.definitions, m)) throw Error("Duplicate subcircuit definition: " + T[1]);
        const p = k.map(pe);
        if (new Set(p).size !== k.length || p.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (k.some((q) => /[{}()=]/.test(q))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = C.id + "/" + encodeURIComponent(m);
        C.definitions[m] = D, u.push(f(D, T[1], C.id, k, U, v));
        continue;
      }
      if (M === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (T[1] && pe(T[1]) !== pe(C.name)) throw Error(".ENDS name does not match " + C.name);
        u.pop();
        continue;
      }
      if (M === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        y = !0;
        continue;
      }
      if (M === ".param") {
        const k = yt(T.slice(1));
        for (const [U, m] of Object.entries(k)) {
          if (Object.hasOwn(C.parameters, U)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + U);
          C.parameters[U] = m;
        }
      }
      if (M === ".global") {
        if (T.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const k of T.slice(1)) c.add(pe(k));
      }
      if (M.startsWith(".") && C.directives.push({ line: v, text: b }), M.startsWith("x")) {
        const [k, U] = it(T.slice(1));
        if (!k.length) throw Error("X instance requires a subcircuit name.");
        const m = /;§pnba\s+(.+)$/i.exec(b)?.[1].split(")");
        C.instances.push({ name: T[0], nodes: k.slice(0, -1).map(pe), definitionName: k.at(-1), definitionId: null, parameters: U, line: v, raw: b, pinNames: m });
      } else C.statements.push({ line: v, text: b });
    } catch (T) {
      a("error", v, T.message + " Statement: " + b);
    }
  u.length > 1 && a("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), d && a("error", 0, "Unclosed .control block.");
  function w(b, v) {
    for (; b; ) {
      if (Object.hasOwn(b.definitions, pe(v))) return b.definitions[pe(v)];
      b = i[b.parent];
    }
    return null;
  }
  for (const b of Object.values(i)) {
    const v = [...b.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...b.statements], T = Qt(v.map((C) => C.text).join(`
`), { models: i[b.parent]?.models });
    b.devices = T.components.map((C) => ({ ...C, line: v[C.line - 1]?.line || b.line })), b.models = T.models, b === h && (h.title = T.title), r.push(...T.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: v[C.line - 1]?.line || b.line })));
    const M = new Set(b.devices.map((C) => pe(C.name)));
    for (const C of b.instances)
      if (M.has(pe(C.name)) && a("error", C.line, "Duplicate instance/device name: " + C.name), M.add(pe(C.name)), C.definitionId = w(b, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) a("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const k = i[C.definitionId];
        k.ports.length !== C.nodes.length && a("error", C.line, `${C.name}: ${k.name} expects ${k.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const b of Object.values(i)) delete b.statements;
  const E = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function x(b, v = []) {
    if (E.has(b)) {
      a("error", i[b].line, "Circular subcircuit reference: " + [...v, i[b].name].join(" → "));
      return;
    }
    if (!I.has(b)) {
      if (E.add(b), v.length >= 64) {
        a("error", i[b].line, "Subcircuit dependency nesting exceeds 64 levels."), E.delete(b), I.add(b);
        return;
      }
      for (const T of i[b].instances) T.definitionId && x(T.definitionId, [...v, i[b].name]);
      E.delete(b), I.add(b);
    }
  }
  for (const b of Object.keys(i)) x(b);
  !h.devices.length && !h.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const b of r) !b.source && b.line && n.origins[b.line - 1] && (b.source = n.origins[b.line - 1].file, b.line = n.origins[b.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: h.title || "", scopes: i, globals: [...c], diagnostics: r, layoutDescription: o.layout };
}
const le = () => /* @__PURE__ */ Object.create(null), ve = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), qe = (t, e) => ve(t.map((n) => n.toLowerCase()), e.toLowerCase());
function $t(t, e = []) {
  const n = le(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((i) => decodeURIComponent(i)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [i, c] of Object.entries(r.terminals)) o(c).terminals.push({ component: r.name, pin: i });
  for (const r of e) o(r);
  return n;
}
function qt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const st = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Xt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Ue(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (c) => (r.push(c), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (c, a, f) => {
    const h = f.split(",").map((g) => g.trim());
    if (h.some((g) => !g || /[\s{}+*()]/.test(g))) throw Error("Unsupported dynamic voltage/current reference: " + c);
    const u = a.toUpperCase() + "(" + h.map((g) => a.toLowerCase() === "v" ? n(g) : o(g, a)).join(",") + ")";
    return r.push(u), "@@" + (r.length - 1) + "@@";
  });
  let i = t.length;
  return t = t.replace(Xt, (c, a, f) => {
    if (f.slice(a + c.length).trimStart().startsWith("(")) return c;
    const h = e(c.toLowerCase());
    if (h === void 0) return c;
    if (i += h.length + 2, i > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + h + ")";
  }), t.replace(/@@(\d+)@@/g, (c, a) => r[Number(a)]);
}
function zt(t, e, n, o) {
  const r = { ...e, ...n }, i = le(), c = /* @__PURE__ */ new Set(), a = le();
  for (const [h, u] of Object.entries(o)) a[h] = Ue(st(u), (g) => t[g]);
  function f(h) {
    if (Object.hasOwn(a, h)) return a[h];
    if (Object.hasOwn(i, h)) return i[h];
    if (!Object.hasOwn(r, h)) return t[h];
    if (c.has(h)) {
      if (Object.hasOwn(t, h)) return t[h];
      throw Error("Circular parameter dependency: " + [...c, h].join(" → "));
    }
    return c.add(h), i[h] = Ue(st(r[h]), f), c.delete(h), i[h];
  }
  for (const h of Object.keys(r)) f(h);
  return Object.assign(le(), t, i, a);
}
function Xe(t, e, n, o) {
  let r = "";
  for (let f = 0; f < t.length; ) {
    const h = t[f];
    if (h !== "{" && h !== "'") {
      r += h, f++;
      continue;
    }
    const u = f++;
    let g = 1, d = "";
    for (; f < t.length && g; f++) {
      if (h === "'") {
        t[f] === "'" && (g = 0);
        continue;
      }
      if (d) {
        t[f] === d && (d = "");
        continue;
      }
      if (t[f] === '"' || t[f] === "'") {
        d = t[f];
        continue;
      }
      t[f] === "{" && g++, t[f] === "}" && g--;
    }
    if (g) throw Error("Unclosed parameter expression.");
    r += h + Ue(t.slice(u + 1, f - 1), (y) => e[y], n, o) + (h === "{" ? "}" : "'");
  }
  const i = [];
  let c = 0, a = "";
  for (let f = 0; f < r.length; f++) {
    const h = r[f];
    if (a) {
      h === a && r[f - 1] !== "\\" && (a = "");
      continue;
    }
    if (h === '"' || h === "'") {
      a = h;
      continue;
    }
    if ("({".includes(h) && c++, ")}".includes(h) && c--, !c && (f === 0 || /\s/.test(r[f - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(f));
      u && (i.push({ start: f, end: f + u[0].length, key: u[1].toLowerCase() }), f += u[0].length - 1);
    }
  }
  if (i.length) {
    let f = r.slice(0, i[0].start);
    i.forEach((h, u) => {
      const g = i[u + 1]?.start ?? r.length, d = r.slice(h.end, g);
      f += r.slice(h.start, h.end) + (d.includes("{") || ["refnode", "intnode"].includes(h.key) ? d : Ue(d, (y) => e[y], n, o));
    }), r = f;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class Yt {
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
class Kt {
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
class O {
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
    return "JavaScript Expression Parser (JSEP) v" + O.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return O.max_unop_len = Math.max(e.length, O.max_unop_len), O.unary_ops[e] = 1, O;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return O.max_binop_len = Math.max(e.length, O.max_binop_len), O.binary_ops[e] = n, o ? O.right_associative.add(e) : O.right_associative.delete(e), O;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return O.additional_identifier_chars.add(e), O;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return O.literals[e] = n, O;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete O.unary_ops[e], e.length === O.max_unop_len && (O.max_unop_len = O.getMaxKeyLen(O.unary_ops)), O;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return O.unary_ops = {}, O.max_unop_len = 0, O;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return O.additional_identifier_chars.delete(e), O;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete O.binary_ops[e], e.length === O.max_binop_len && (O.max_binop_len = O.getMaxKeyLen(O.binary_ops)), O.right_associative.delete(e), O;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return O.binary_ops = {}, O.max_binop_len = 0, O;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete O.literals[e], O;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return O.literals = {}, O;
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
    return new O(e).parse();
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
    return O.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !O.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    O.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return O.isIdentifierStart(e) || O.isDecimalDigit(e);
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
    if (O.hooks[e]) {
      const o = { context: this, node: n };
      return O.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (O.hooks[e]) {
      const n = { context: this };
      return O.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === O.SPACE_CODE || e === O.TAB_CODE || e === O.LF_CODE || e === O.CR_CODE; )
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
      type: O.COMPOUND,
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
      if (o = this.code, o === O.SEMCOL_CODE || o === O.COMMA_CODE)
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
    let e = this.expr.substr(this.index, O.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (O.binary_ops.hasOwnProperty(e) && (!O.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !O.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, o, r, i, c, a, f, h;
    if (c = this.gobbleToken(), !c || (n = this.gobbleBinaryOp(), !n))
      return c;
    for (i = { value: n, prec: O.binaryPrecedence(n), right_a: O.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), r = [c, i, a]; n = this.gobbleBinaryOp(); ) {
      if (o = O.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      i = { value: n, prec: o, right_a: O.right_associative.has(n) }, h = n;
      const u = (g) => i.right_a && g.right_a ? o > g.prec : o <= g.prec;
      for (; r.length > 2 && u(r[r.length - 2]); )
        a = r.pop(), n = r.pop().value, c = r.pop(), e = {
          type: O.BINARY_EXP,
          operator: n,
          left: c,
          right: a
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + h), r.push(i, e);
    }
    for (f = r.length - 1, e = r[f]; f > 1; )
      e = {
        type: O.BINARY_EXP,
        operator: r[f - 1].value,
        left: r[f - 2],
        right: e
      }, f -= 2;
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
    if (e = this.code, O.isDecimalDigit(e) || e === O.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === O.SQUOTE_CODE || e === O.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === O.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, O.max_unop_len), o = n.length; o > 0; ) {
        if (O.unary_ops.hasOwnProperty(n) && (!O.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !O.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const i = this.gobbleToken();
          return i || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: O.UNARY_EXP,
            operator: n,
            argument: i,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      O.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), O.literals.hasOwnProperty(r.name) ? r = {
        type: O.LITERAL,
        value: O.literals[r.name],
        raw: r.name
      } : r.name === O.this_str && (r = { type: O.THIS_EXP })) : e === O.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === O.PERIOD_CODE || n === O.OBRACK_CODE || n === O.OPAREN_CODE || n === O.QUMARK_CODE; ) {
      let o;
      if (n === O.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== O.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === O.OBRACK_CODE ? (e = {
        type: O.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== O.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === O.OPAREN_CODE ? e = {
        type: O.CALL_EXP,
        arguments: this.gobbleArguments(O.CPAREN_CODE),
        callee: e
      } : (n === O.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: O.MEMBER_EXP,
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
    for (; O.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === O.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); O.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); O.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      O.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, O.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === O.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === O.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: O.LITERAL,
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
      let i = this.expr.charAt(this.index++);
      if (i === o) {
        r = !0;
        break;
      } else if (i === "\\")
        switch (i = this.expr.charAt(this.index++), i) {
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
            e += i;
        }
      else
        e += i;
    }
    return r || this.throwError('Unclosed quote after "' + e + '"'), {
      type: O.LITERAL,
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
    for (O.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, O.isIdentifierPart(e)); )
      this.index++;
    return {
      type: O.IDENTIFIER,
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
      let i = this.code;
      if (i === e) {
        o = !0, this.index++, e === O.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (i === O.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === O.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === O.CBRACK_CODE)
            for (let c = n.length; c < r; c++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const c = this.gobbleExpression();
        (!c || c.type === O.COMPOUND) && this.throwError("Expected comma"), n.push(c);
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
    let e = this.gobbleExpressions(O.CPAREN_CODE);
    if (this.code === O.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: O.SEQUENCE_EXP,
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
      type: O.ARRAY_EXP,
      elements: this.gobbleArguments(O.CBRACK_CODE)
    };
  }
}
const Zt = new Yt();
Object.assign(O, {
  hooks: Zt,
  plugins: new Kt(O),
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
O.max_unop_len = O.getMaxKeyLen(O.unary_ops);
O.max_binop_len = O.getMaxKeyLen(O.binary_ops);
const Ie = (t) => new O(t).parse(), Jt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(O).filter((t) => !Jt.includes(t) && Ie[t] === void 0).forEach((t) => {
  Ie[t] = O[t];
});
Ie.Jsep = O;
const en = "ConditionalExpression";
var tn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), n.node = {
            type: en,
            test: o,
            consequent: r,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            n.node.test = c.right, c.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ie.plugins.register(tn);
const nn = "ConditionalExpression";
var rn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), n.node = {
            type: nn,
            test: o,
            consequent: r,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            n.node.test = c.right, c.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ie.plugins.register(rn);
const on = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, at = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, fe = (t) => Number(t) > 0.5;
function Ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (f) => {
      if (f[0] === '"' || f[0] === "'") return f;
      const [, h, u, g] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(f), d = u.toLowerCase(), y = d.startsWith("meg") ? 1e6 : d.startsWith("mil") ? 254e-7 : on[d[0]] || 1;
      return "(" + (g ? +(h + (h.includes(".") ? "" : ".") + g) : Number(h)) * y + ")";
    }), i(Ie(a));
  }
  function i(a) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const f = a.name.toLowerCase();
      if (f === "pi") return Math.PI;
      if (f === "e") return Math.E;
      if (!Object.hasOwn(e, f)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(f)) throw Error("Circular structural parameter: " + f);
      n.add(f);
      const h = r(e[f]);
      return n.delete(f), h;
    }
    if (a.type === "ConditionalExpression") return fe(i(a.test)) ? i(a.consequent) : i(a.alternate);
    if (a.type === "UnaryExpression") {
      const f = i(a.argument);
      if (a.operator === "-") return -f;
      if (a.operator === "+") return +f;
      if (a.operator === "!" || a.operator === "~") return !fe(f);
    }
    if (a.type === "BinaryExpression") {
      const f = i(a.left);
      if (a.operator === "&&") return fe(f) && fe(i(a.right));
      if (a.operator === "||") return fe(f) || fe(i(a.right));
      const h = i(a.right);
      switch (a.operator) {
        case "+":
          return f + h;
        case "-":
          return f - h;
        case "*":
          return f * h;
        case "/":
          return f / h;
        case "**":
          return f ** h;
        case "%":
          return f % h;
        case "^":
          return fe(f) !== fe(h);
        case "&":
          return fe(f) && fe(h);
        case "|":
          return fe(f) || fe(h);
        case ">":
          return f > h;
        case "<":
          return f < h;
        case ">=":
          return f >= h;
        case "<=":
          return f <= h;
        case "==":
        case "===":
          return f === h;
        case "!=":
        case "!==":
          return f !== h;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const f = a.callee.name.toLowerCase();
      if (f === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return fe(i(a.arguments[0])) ? i(a.arguments[1]) : i(a.arguments[2]);
      }
      if (Object.hasOwn(at, f)) return at[f](...a.arguments.map(i));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const c = r(t);
  if (typeof c == "number" && !Number.isFinite(c)) throw Error("Structural expression is not finite.");
  return c;
}
function Ze(t, { isolate: e = "" } = {}) {
  qt(t);
  const n = le(), o = /* @__PURE__ */ new Map();
  let r = 0, i = 0;
  function c(a, f, h, u, g, d, y) {
    if (f.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const w = t.scopes[a], E = f.length ? ve(f.slice(0, -1), f.at(-1)) : "", I = le();
    if (e && E === e && (h = le()), y.some((C) => C.scopeId === a)) throw Error("Circular subcircuit reference at " + E);
    const x = zt(u, w.defaults, w.parameters, g);
    function b(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const U = Ae(C, x);
        C = String(typeof U == "boolean" ? Number(U) : U);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const k = C.toLowerCase();
      return Object.hasOwn(h, k) ? h[k] : t.globals.includes(k) ? qe([], k) : I[k] || (I[k] = qe(f, k));
    }
    const v = { id: E, path: f, scopeId: a, name: d?.name || "Top", definition: w.name, ports: w.ports.map((C) => ({ name: C, node: b(C) })), params: x, nodes: I, models: le(), devices: [], children: [], raw: d?.raw || "", line: d?.line || 0 };
    n[E] = v, o.set(E, b);
    const T = [...y, v];
    function M(C) {
      if (!C) return "";
      let k = w;
      for (; k; ) {
        if (k.directives.some((U) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(U.text))) {
          const U = [...T].reverse().find((m) => m.scopeId === k.id);
          return ve(U?.path || [], C.toLowerCase());
        }
        k = t.scopes[k.parent];
      }
      return C;
    }
    for (const C of w.directives.filter((k) => /^\.model\b/i.test(k.text))) {
      const k = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!k) continue;
      const U = M(k), m = w.models[k.toLowerCase()], p = Xe(C.text, x, b, (D) => ve(f, D));
      v.models[U] = { ...m, name: U, raw: p.replace(/^(\.model\s+)\S+/i, (D, q) => q + U), instanceId: E, parameters: x };
    }
    for (const C of w.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const k = le();
      for (const [m, p] of Object.entries(C.terminals)) k[m] = b(p);
      const U = M(C.model);
      v.devices.push({ ...C, name: ve(f, C.name), localName: C.name, instanceId: E, terminals: k, model: U, parameters: x });
    }
    for (const C of w.instances) {
      let k = C.definitionId;
      if (!k) {
        const D = String(Ae(C.definitionName, x)).toLowerCase();
        let q = w;
        for (; q && !k; )
          k = q.definitions[D], q = t.scopes[q.parent];
        if (!k) throw Error("Undefined selected subcircuit: " + D);
      }
      const U = t.scopes[k], m = le();
      if (U.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + U.ports.length + " ports; got " + C.nodes.length);
      U.ports.forEach((D, q) => {
        m[D.toLowerCase()] = b(C.nodes[q]);
      });
      const p = c(k, [...f, C.name], m, x, C.parameters, C, T);
      C.pinNames?.length === p.ports.length && p.ports.forEach((D, q) => {
        D.label = C.pinNames[q];
      }), v.children.push(p);
    }
    return v;
  }
  try {
    let g = function(d, y) {
      const w = y.split(":");
      if (w.length === 1) return { owner: d, name: y };
      const E = w.pop();
      for (const I of [[...d.path, ...w], w]) {
        const x = f.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (x) return { owner: x, name: E };
      }
      throw Error("Unknown hierarchical reference: " + y);
    };
    const a = c(t.rootId, [], le(), le(), le(), null, []), f = new Map(Object.values(n).map((d) => [d.id.toLowerCase(), d])), h = Object.assign(le(), ...Object.values(n).map((d) => d.models)), u = (d) => h[d] || Object.entries(h).find(([y]) => y.startsWith(d + "."))?.[1];
    for (const d of Object.values(n)) for (const y of d.devices) {
      const w = t.scopes[d.scopeId].devices.find((x) => x.name === y.localName), E = (x) => {
        const b = g(d, x);
        return o.get(b.owner.id)(b.name);
      }, I = (x, b = "", v = "") => {
        const T = g(d, x), M = T.owner.devices.find((C) => C.localName.toLowerCase() === T.name.toLowerCase());
        if (b.toLowerCase() === "ix") {
          const C = T.owner.ports.find((k, U) => k.name.toLowerCase() === T.name.toLowerCase() || String(U + 1) === T.name);
          if (C) return T.owner.id + ":" + C.name;
        }
        if (!M) {
          if (v) throw Error(y.name + ": referenced " + v + " device " + x + " was not found.");
          return ve(T.owner.path, T.name);
        }
        if (v && M.kind !== v) throw Error(y.name + ": " + x + " must be a " + v + " device.");
        return M.name;
      };
      if (y.value = Xe(w.value, d.params, E, I), w.model && (y.value = y.value.replace(w.model, y.model)), y.kind === "M" && Object.keys(y.terminals).length === 3) {
        let x = u(y.model), b = !1;
        const v = /* @__PURE__ */ new Set();
        for (; x?.type === "VDMOS" && !v.has(x.name); ) {
          v.add(x.name);
          const T = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(x.raw);
          if (T) {
            b = T[1] === void 0 || Number(Ae(T[1], x.parameters)) >= 0.5;
            break;
          }
          const M = x.name.includes("/") ? x.name.slice(0, x.name.lastIndexOf("/") + 1) : "";
          x = u(M + (x.baseModel || "").toLowerCase()) || u((x.baseModel || "").toLowerCase());
        }
        v.size && (y.type = "spice_" + (b ? "pmos3" : "nmos3"));
      }
      y.controlSources = (w.controlSources || []).map((x) => I(x, "", "V")), y.controlSource = y.controlSources[0] || "", y.coupledInductors = (w.coupledInductors || []).map((x) => I(x, "", "L"));
      for (const x of /* @__PURE__ */ new Set([...w.controlSources || [], ...w.coupledInductors || []])) {
        const b = x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        y.value = y.value.replace(new RegExp("(?<![\\w./%])" + b + "(?![\\w.$])", "g"), () => I(x));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: n };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function Ce(t) {
  return [...t.devices, ...t.children.flatMap(Ce)];
}
function Se(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Je(t, e = {}) {
  const n = new Map(t.components.map((m) => [m.name, m])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = [], c = (m, p) => JSON.stringify([m, p].sort()), a = (m) => e[m]?.potential !== null && e[m]?.potential !== void 0;
  for (const m of t.components) {
    for (const [_, P] of Object.entries(m.terminals))
      o.has(P) || o.set(P, []), o.get(P).push({ device: m.name, pin: _ });
    if (m.kind === "R") {
      const _ = Object.values(m.terminals);
      if (_.length === 2 && _[0] !== _[1]) {
        const P = c(..._);
        r.has(P) || r.set(P, []), r.get(P).push(m);
      }
    }
    const p = m.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(m.kind) ? "fet" : null, D = p === "bjt" ? /_(npn|pnp)$/.exec(m.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(m.type)?.[1];
    if (!p || !D) continue;
    const q = m.terminals, H = q[p === "bjt" ? "B" : "G"], K = q[p === "bjt" ? "C" : "D"], A = q[p === "bjt" ? "E" : "S"];
    [H, K, A].some((_) => _ === void 0) || H === A || K === A || i.push({ id: m.name, family: p, polarity: D, control: H, drain: K, source: A, body: m.kind === "M" ? q.B : void 0 });
  }
  const f = [], h = /* @__PURE__ */ new Set(), u = (m, p, D, q, H, K = "basic", A = [], _ = "high") => {
    const P = [.../* @__PURE__ */ new Set([...p, ...A])], j = JSON.stringify([m, K, [...P].sort()]);
    h.has(j) || (h.add(j), f.push({ id: "motif" + f.length, kind: m, variant: K, transistors: p, members: P, roles: D, nets: q, evidence: H, confidence: _ }));
  }, g = (m, p) => m.family === p.family && m.polarity === p.polarity, d = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), E = new Map(i.map((m) => [m.id, m])), I = (m, p, D) => {
    m.has(p) || m.set(p, []), m.get(p).push(D);
  }, x = (m, p) => JSON.stringify([m.family, m.polarity, p]);
  for (const m of i)
    I(d, x(m, m.control), m), I(y, x(m, m.source), m), m.family === "bjt" && (o.get(m.source) || []).some((p) => {
      const D = E.get(p.device);
      return D && D.family === "bjt" && !g(m, D) && D.source === m.source;
    }) && I(w, x(m, m.drain), m);
  const b = (m) => [{ node: m.source, resistor: null }, ...(o.get(m.source) || []).flatMap((p) => {
    const D = n.get(p.device);
    if (D.kind !== "R") return [];
    const q = Object.values(D.terminals).find((H) => H !== m.source);
    return q !== void 0 && q !== m.control && q !== m.drain ? [{ node: q, resistor: D.name }] : [];
  })];
  for (const m of i) m.control === m.drain && u("diode-connected", [m.id], { reference: m.id }, { control: m.control, return: m.source }, ["control-drain-short", m.family]);
  for (const m of i) {
    const p = d.get(x(m, m.control));
    if (p.filter((_) => _.control === _.drain).length > 1) continue;
    let D = null;
    if (m.control !== m.drain && m.family === "bjt" && (D = (d.get(x(m, m.drain)) || []).find((_) => _.id !== m.id && g(_, m) && _.control === m.drain && _.source === m.control && a(_.drain))), m.control !== m.drain && !D) continue;
    const q = b(m), H = [];
    let K = null, A = [];
    for (const _ of p) {
      if (_.id === m.id || _.id === D?.id || _.drain === m.drain || _.drain === _.control) continue;
      const P = q.flatMap((j) => b(_).filter((F) => j.node === F.node).map((F) => ({ node: j.node, rs: [j.resistor, F.resistor].filter(Boolean) }))).find((j) => K === null || j.node === K);
      P && (K = P.node, H.push(_.id), A.push(...P.rs));
    }
    if (H.length) {
      const _ = H.every((P) => E.get(P).body === m.body);
      u("current-mirror", [m.id, ...H, ...D ? [D.id] : []], { reference: m.id, outputs: H, ...D ? { helper: D.id } : {} }, { control: m.control, return: K }, ["same-polarity", "shared-control", D ? "emitter-follower-reference" : "diode-reference", A.length ? "resistive-common-return" : "shared-return", _ ? "compatible-bodies" : "different-body-connections"], D ? "assisted" : A.length ? "degenerated" : "basic", [...A, ...D ? [D.id] : []], _ ? "high" : "medium");
    }
  }
  const v = [], T = /* @__PURE__ */ new Set(), M = (m, p) => {
    const D = JSON.stringify([m.id, p.id].sort());
    T.has(D) || (T.add(D), v.push([m, p]));
  };
  for (const m of y.values()) if (!a(m[0].source)) {
    const p = m.filter((D) => D.control !== D.drain);
    p.length === 2 ? M(...p) : p.length > 2 && new Set(p.map((D) => D.control)).size > 1 && u("differential-pair", p.map((D) => D.id), { inputs: p.map((D) => D.id) }, { tail: p[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const m of w.values()) for (let p = 0; p < m.length; p++) for (let D = p + 1; D < m.length; D++) M(m[p], m[D]);
  for (const [m, p] of v) {
    if (m.control === p.control || m.control === m.drain || p.control === p.drain) continue;
    if (m.source === p.source && m.drain !== p.drain && !a(m.source)) {
      const H = (o.get(m.source) || []).some((A) => A.device !== m.id && A.device !== p.id), K = y.get(x(m, m.source)).length === 2;
      u("differential-pair", [m.id, p.id], { inputs: [m.id, p.id] }, { tail: m.source }, ["same-polarity", "distinct-controls", "shared-tail", H ? "tail-bias-connection" : "unbiased-tail", K ? "two-input-tail" : "multi-input-tail"], "basic", [], H && K && m.body === p.body ? "high" : "medium");
    }
    if (m.family !== "bjt" || m.drain !== p.drain || m.source === p.source) continue;
    const D = i.filter((H) => H.family === "bjt" && H.polarity !== m.polarity && H.source === m.source), q = i.filter((H) => H.family === "bjt" && H.polarity !== m.polarity && H.source === p.source);
    for (const H of D) for (const K of q) H.id !== K.id && H.control === K.control && H.drain !== K.drain && H.control !== H.drain && K.control !== K.drain && u("differential-pair", [m.id, p.id, H.id, K.id], { inputs: [m.id, p.id], commonBase: [H.id, K.id] }, { inputCollectors: m.drain, bias: H.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const m of i) if (m.family === "bjt" && m.control !== m.drain) {
    const p = r.get(c(m.drain, m.control)) || [], D = r.get(c(m.control, m.source)) || [];
    p.length === 1 && D.length === 1 && u("vbe-multiplier", [m.id], { transistor: m.id, collectorResistor: p[0].name, emitterResistor: D[0].name }, { control: m.control, collector: m.drain, emitter: m.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [p[0].name, D[0].name]);
  }
  const C = i.filter((m) => m.family === "bjt"), k = /* @__PURE__ */ new Map();
  for (const m of C) I(k, m.control, m);
  const U = (m) => (o.get(m) || []).filter((p) => E.has(p.device));
  for (const m of C) if (m.control !== m.drain) {
    for (const p of k.get(m.source) || []) if (p.id !== m.id && g(m, p) && p.drain === m.control && p.source !== m.drain) {
      const D = r.get(c(m.source, p.source)) || [];
      D.length === 1 && u("current-limit-pair", [m.id, p.id], { driver: m.id, output: p.id, senseResistor: D[0].name }, { sense: m.source, drive: m.control, output: p.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [D[0].name]);
    }
    for (const p of k.get(m.source) || []) p.id !== m.id && g(m, p) && p.control !== p.drain && m.drain === p.drain && p.source !== m.control && u("darlington-pair", [m.id, p.id], { driver: m.id, output: p.id }, { link: m.source, collector: m.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (k.get(m.source) || []).length === 1 ? "high" : "medium");
    for (const p of k.get(m.drain) || []) p.id !== m.id && !g(m, p) && p.control !== p.drain && m.source === p.drain && p.source !== m.control && U(m.drain).length === 2 && u("sziklai-pair", [m.id, p.id], { driver: m.id, output: p.id }, { link: m.drain, feedback: m.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const p of o.get(m.drain) || []) {
      const D = E.get(p.device);
      !D || D.family !== "bjt" || D.id === m.id || !g(m, D) || D.source !== m.drain || a(m.drain) || D.control === m.control || D.control === D.drain || D.drain === m.source || U(m.drain).length !== 2 || u("cascode-pair", [m.id, D.id], { driver: m.id, output: D.id }, { link: m.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const m of C.filter((p) => p.polarity === "npn" && a(p.drain))) for (const p of C.filter((D) => D.polarity === "pnp" && a(D.drain))) {
    if (e[m.drain].potential <= e[p.drain].potential) continue;
    const D = b(m).flatMap((q) => b(p).filter((H) => q.node === H.node && !a(q.node)).map((H) => ({ node: q.node, rs: [q.resistor, H.resistor].filter(Boolean) })))[0];
    D && u("push-pull-pair", [m.id, p.id], { upper: m.id, lower: p.id }, { output: D.node }, ["complementary-polarity", "ordered-collector-supplies", D.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", D.rs);
  }
  return f;
}
function et(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([i, c]) => [i, o(c)])), nets: Object.fromEntries(Object.entries(r.nets).map(([i, c]) => [i, n(c)])) }));
}
function sn(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), i = new Map(t.components.map((c) => [c.name, c]));
  for (const c of n) {
    if (new Set(c.members).size !== c.members.length) throw Error("Duplicate @layout pair member.");
    const a = c.members.map((d) => i.get(d));
    if (a.some((d) => !d)) throw Error("Unknown @layout pair device.");
    const f = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[c.kind], h = c.kind === "differential" && a.length === 2 ? t.components.filter((d) => !c.members.includes(d.name) && Object.values(d.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], u = Je({ ...t, components: [...a, ...h] }, e), g = u.find((d) => d.kind === f && d.confidence === "high" && c.members.every((y) => d.members.includes(y)));
    if (!g) throw Error("Invalid @layout pair " + c.kind + " { " + c.members.join(" ") + " }: electrical structure does not match.");
    for (const d of u.filter((y) => y === g || y.kind === "diode-connected" && y.members.every((w) => g.members.includes(w)))) {
      const y = JSON.stringify([d.kind, [...d.members].sort()]);
      r.has(y) || (r.add(y), o.push({ ...d, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function an(t, e, n = Je(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((d) => d.kind === "R"), i = t.components.filter((d) => d.kind === "Q"), c = new Map(t.components.map((d) => [d.name, d])), a = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), h = (d) => Object.values(d.terminals), u = (d, y, w) => {
    d && o.set(d.name, { reverse: h(d)[0] !== y, reason: w });
  };
  for (const d of i) {
    const { C: y, B: w, E } = d.terminals, I = d.type.endsWith("pnp"), x = d.type.endsWith("npn");
    !I && !x || (a.has(E) || a.set(E, []), a.get(E).push(d), y === w && e[E]?.potential !== null && e[E]?.potential !== void 0 && f.set(y, { potential: e[E].potential }));
  }
  for (const d of n) if (d.kind === "vbe-multiplier" && d.confidence === "high") {
    const y = c.get(d.roles.transistor), w = y.type.endsWith("pnp"), E = c.get(w ? d.roles.emitterResistor : d.roles.collectorResistor), I = c.get(w ? d.roles.collectorResistor : d.roles.emitterResistor);
    u(E, y.terminals[w ? "E" : "C"], "recognized VBE multiplier"), u(I, y.terminals.B, "recognized VBE multiplier");
  }
  for (const d of r) {
    const [y, w] = h(d), E = f.get(y), I = f.get(w);
    E && I && E.potential !== I.potential && u(d, E.potential > I.potential ? y : w, "diode-connected bias reference");
  }
  const g = /* @__PURE__ */ new Map();
  for (const d of r) {
    const y = h(d);
    if (!y.some((w) => e[w]?.potential !== null && e[w]?.potential !== void 0))
      for (const w of y)
        g.has(w) || g.set(w, []), g.get(w).push(d);
  }
  for (const [d, y] of g)
    if (!(y.length > 12))
      for (const w of y) for (const E of y) {
        if (w === E) continue;
        const I = h(w).find((T) => T !== d), x = h(E).find((T) => T !== d), b = a.get(I)?.find((T) => T.type.endsWith("npn")), v = a.get(x)?.find((T) => T.type.endsWith("pnp"));
        b && v && (u(w, I, "complementary emitter output"), u(E, d, "complementary emitter output"));
      }
  return o;
}
function cn(t) {
  const e = t.components.filter((i) => i.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((i) => i.kind === "R").map((i) => Object.values(i.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const c = i.terminals.E;
    n.has(c) || n.set(c, []), n.get(c).push(i);
  }
  for (const i of e) {
    const { B: c, C: a, E: f } = i.terminals;
    if (c === f || !o.has([c, f].sort().join("|"))) continue;
    const h = n.get(c) || [];
    if (!(h.length > 16))
      for (const u of h) {
        if (u === i) continue;
        if (u.terminals.B === a) {
          r.add(i.name);
          break;
        }
        const g = n.get(u.terminals.B) || [];
        if (g.length <= 16 && g.some((d) => d !== i && d !== u && d.terminals.B === a)) {
          r.add(i.name);
          break;
        }
      }
  }
  return r;
}
const ze = 22;
function Ye(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const Re = (t) => ["pwr", "ret", "bias"].includes(t), ln = (t) => String(t).split("/").at(-1).toLowerCase(), wt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[ln(t)] || "unknown", ct = (t) => {
  const e = Ye(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || wt(t);
};
function un(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (c, a, f) => {
    e.has(c) || e.set(c, []), e.get(c).push({ node: a, delta: f });
  };
  for (const c of t)
    if (c.kind === "V")
      try {
        let a = c.value.trim();
        const f = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (f && Number(Ae(f[1], c.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const h = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!h) continue;
        const u = Ae(h[1], c.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        o(c.terminals["-"], c.terminals["+"], u), o(c.terminals["+"], c.terminals["-"], -u);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ new Set();
  for (const c of ["0", ...e.keys()]) {
    if (i.has(c)) continue;
    const a = /* @__PURE__ */ new Map([[c, 0]]), f = [c];
    i.add(c);
    let h = !1;
    for (let u = 0; u < f.length; u++) for (const g of e.get(f[u]) || []) {
      const d = a.get(f[u]) + g.delta;
      a.has(g.node) ? Math.abs(a.get(g.node) - d) > 1e-8 * Math.max(1, Math.abs(d)) && (h = !0) : (a.set(g.node, d), i.add(g.node), f.push(g.node));
    }
    h && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, g] of a) r[u] = { value: g, reference: c, known: c === "0" && !h, consistent: !h };
  }
  return { nodes: r, diagnostics: n };
}
function dn(t, e, n = null) {
  const o = un(Ce(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const g = Ye(u.name), d = wt(u.name);
    r[u.name] = { role: g !== "unknown" ? g : d, roleSource: g !== "unknown" ? "node-name" : d !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[u.name]?.known ? o.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const g = r[u.local], d = ct(u.port);
    g && g.potential === null && ["pwr", "ret"].includes(d) && (g.potential = d === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, g.potentialSource = "symbolic-port-order");
  }
  const c = n?.pairs?.length ? sn(e, r, n.pairs) : Je(e, r), a = an(e, r, c), f = cn(e), h = (u, g, d) => {
    const y = { role: r[d].role, roleSource: r[d].roleSource }, w = u.block?.ports.find((x) => x.pin === g);
    if (w?.implicit || !u.block && !u.synthetic) return y;
    const E = u.synthetic ? u.value : w?.name || w?.label, I = ct(E);
    return I !== "unknown" ? { role: I, roleSource: Ye(E) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : Re(y.role) ? { ...y, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const g = Object.fromEntries(Object.entries(u.terminals).map(([U, m]) => [U, { ...r[m], ...h(u, U, m) }])), d = Object.values(g), y = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), w = y && !a.has(u.name) && d.length === 2 && d.every((U) => !Re(U.role) && (U.potential === null || U.role !== "unknown")), E = u.terminals["+"], I = u.terminals["-"], x = [E, I].filter((U) => U && U !== "0"), b = u.kind === "V" && x.some((U) => Re(r[U]?.role)) && !x.some((U) => ["in", "out", "io", "fb"].includes(r[U]?.role)) && [E, I].every((U) => o.nodes[U]?.known), v = E === "0" ? I : E, T = Object.keys(u.terminals), M = (U) => Re(U.role) ? U.potential !== null ? U.potential > 0 ? "high" : "low" : U.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    T.length === 2 && (u.kind === "V" && d.every((U) => U.potential !== null) ? C = d[0].potential < d[1].potential : u.terminals[T[0]] === "0" ? C = !0 : u.terminals[T[1]] === "0" ? C = !1 : d.every((U) => U.potential !== null) ? C = d[0].potential < d[1].potential : C = M(d[0]) === "low" || M(d[1]) === "high" && M(d[0]) === "signal"), a.has(u.name) && (C = a.get(u.name).reverse);
    const k = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    i[u.name] = { version: ze, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: f.has(u.name), orientationReason: a.get(u.name)?.reason || null, owner: k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : "", passive: y, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !y, ports: g, horizontal: w, orientation: w ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: T.length === 2 && (y || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!b, voltage: b ? o.nodes[v].value : null };
  }
  return { version: ze, nodes: r, cells: i, motifs: c, diagnostics: o.diagnostics };
}
function Et(t, e) {
  const n = e.ports.map((r, i) => ({ pin: "P" + i, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(Ce(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const i = qe([], r);
    o.has(i) && !n.some((c) => c.node === i) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: i, implicit: !0 });
  }
  return n;
}
function fn(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  o && (t = Ze(t.ir, { isolate: o }));
  const c = t.contexts[o];
  if (!c) throw Error("Unknown instance: " + o);
  const a = [], f = [];
  function h(w) {
    f.push(...Object.values(w.nodes), ...w.ports.map((I) => I.node));
    const E = [...w.devices.map((I) => ({ line: I.line, device: I })), ...w.children.map((I) => ({ line: I.line, child: I }))].sort((I, x) => I.line - x.line);
    for (const I of E) {
      if (I.device) {
        const T = I.device;
        a.push({ ...T, layoutLabel: [...w.path.slice(c.path.length), T.localName].join("/") });
        continue;
      }
      const x = I.child;
      if (e === "flat" || n.has(x.id)) {
        h(x);
        continue;
      }
      const b = Et(t, x), v = le();
      b.forEach((T) => {
        v[T.pin] = T.node;
      }), a.push({ name: x.id, kind: "X", type: "spice_subckt", terminals: v, value: x.definition, raw: x.raw, line: x.line, instanceId: x.id, layoutLabel: x.path.slice(c.path.length).join("/"), block: { definitionId: x.scopeId, ports: b, parameters: x.params } });
    }
  }
  h(c);
  for (const [w, E] of c.ports.entries()) a.push({ name: "@port/" + o + "/" + w, kind: "PORT", type: "spice_port", terminals: { A: E.node }, layoutLabel: E.name, value: E.name, raw: "Interface port " + E.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(le(), ...Object.values(t.contexts).map((w) => w.models)), g = { title: o || t.ir.title, components: a, nodes: $t(a, f), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  g.interfaceBindings = c.ports.map((w, E) => ({ port: w.name, local: w.node, parent: i.ports[E].node }));
  const d = /* @__PURE__ */ new Map();
  for (const w of i.ports)
    d.has(w.node) || d.set(w.node, []), d.get(w.node).push(w.name);
  g.interfaceAliases = [...d].filter(([, w]) => w.length > 1).map(([w, E]) => ({ node: w, ports: E })), g.topology = pn(r, g);
  const y = Ht(t, g);
  return g.layout = dn(t, g, y), g.layout.description = y, g;
}
function pn(t, e) {
  const n = Ce(t.contexts[e.focus]);
  e.localScope && (t = Ze(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const f = t.contexts[a.instanceId];
        if (!f) throw Error("Projection contains an unknown block.");
        const h = Et(t, f);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(h.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + a.name);
        o.push(...Ce(f));
      } else o.push(a);
  for (const a of o) {
    if (r.has(a.name)) throw Error("Projection duplicates " + a.name);
    r.add(a.name);
  }
  const i = Se(o), c = Ce(t.contexts[e.focus]);
  if (i !== Se(c)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), f = (u) => a.get(u) ?? u, h = o.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([g, d]) => [g, f(d)])), value: Xe(u.value, {}, f, (g) => g) }));
    if (Se(h) !== Se(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: i, boundSignature: Se(n), boundaryVerified: !0 };
}
function lt(t) {
  const e = le(), n = le();
  for (const o of t.components) {
    const r = le(), i = le();
    for (const [c, a] of Object.entries(o.terminals))
      r[c] = [t.nodes[a].bit], i[c] = "input";
    e[o.name] = { type: o.type, port_directions: i, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((c) => ({ pin: c.pin, label: c.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((c, a) => ({ pin: c, label: o.pinLabels?.[a] || c })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: et(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function hn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (h) => (n.has(h) || n.set(h, n.size + 2), n.get(h));
  Object.entries(t.modules.circuit.cells).forEach(([h, u], g) => {
    const d = "c" + g;
    e.set(d, h);
    const y = Object.fromEntries(Object.entries(u.connections).map(([w, E]) => [w, E.map(r)]));
    o[d] = { type: u.type, connections: y, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (o[d].spiceBlock = u.spiceBlock), u.spiceSymbol && (o[d].spiceSymbol = u.spiceSymbol), u.spiceLayout && (o[d].spiceLayout = u.spiceLayout);
  });
  const i = new Map([...e].map(([h, u]) => [u, h])), c = t.modules.circuit.spiceLayoutDescription, a = c ? { ...c, faces: (c.faces || []).map((h) => ({ ...h, device: i.get(h.device) })), pairs: (c.pairs || []).map((h) => ({ ...h, members: h.members.map((u) => i.get(u)) })), groups: c.groups.map((h) => ({ ...h, members: h.members.map((u) => u.cell ? { ...u, cell: i.get(u.cell) } : u) })), relations: c.relations.map((h) => ({ ...h, a: i.get(h.a) || h.a, b: i.get(h.b) || h.b })) } : null, f = et(t.modules.circuit.spiceMotifs || [], (h) => i.get(h), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: f, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([h, u]) => [u, h])) };
}
const Ee = /* @__PURE__ */ new Map();
async function mn(t, e) {
  const n = hn(t), o = JSON.stringify([n.netlist, e]);
  let r = Ee.get(o);
  r ? (Ee.delete(o), Ee.set(o, r)) : (r = await gn(n.netlist, e), r.svg.length < 1e6 && (Ee.set(o, r), Ee.size > 20 && Ee.delete(Ee.keys().next().value)));
  const i = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (i.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const f of i.querySelectorAll("[id],[class]")) {
    const h = f.getAttribute("id");
    h?.startsWith("cell_") && n.ids.has(h.slice(5)) && f.setAttribute("id", "cell_" + n.ids.get(h.slice(5)));
    const u = f.getAttribute("class");
    u && f.setAttribute("class", u.split(/\s+/).map((g) => g.startsWith("cell_") && n.ids.has(g.slice(5)) ? "cell_" + n.ids.get(g.slice(5)) : /^net_\d+$/.test(g) && n.bits.has(Number(g.slice(4))) ? "net_" + n.bits.get(Number(g.slice(4))) : g).join(" "));
  }
  const c = r.drawing ? structuredClone(r.drawing) : null, a = i.querySelector("#spice-layout-report");
  if (a) {
    const f = JSON.parse(a.textContent), h = (u) => n.ids.get(u) || u;
    f.mirroredTransistors = (f.mirroredTransistors || []).map(h), f.orientationDevicesTested = (f.orientationDevicesTested || []).map(h), f.recognizedMotifs = et(f.recognizedMotifs || [], h, (u) => n.bits.get(u) ?? u), f.inputAttachments = (f.inputAttachments || []).map(h), f.mirroredInputPorts = (f.mirroredInputPorts || []).map(h);
    for (const u of [...f.flippedPairs || [], ...f.pairOrientationTrials || []]) u.members = u.members.map(h);
    for (const u of f.pairCompactions || [])
      u.members = u.members.map(h), u.moved = h(u.moved);
    for (const u of f.pairConstraints || []) u.members = u.members.map(h);
    for (const u of f.pairProximity || []) u.members = u.members.map(h);
    for (const u of f.motifMeasurements || [])
      u.members = u.members.map(h), u.interlopers && (u.interlopers = u.interlopers.map(h));
    for (const u of f.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    a.textContent = JSON.stringify(f);
  }
  if (c) {
    for (const f of c.components) {
      f.id = n.ids.get(f.id) || f.id;
      for (const h of f.ports) h.bit = n.bits.get(h.bit) ?? h.bit;
    }
    for (const f of c.segments) f.bit = n.bits.get(f.bit) ?? f.bit;
  }
  return { svg: new XMLSerializer().serializeToString(i.documentElement), drawing: c };
}
function gn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const i = (f, h) => {
      clearTimeout(a), n.terminate(), f ? r(Error(f)) : o(h);
    }, c = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => i("Layout timed out. Open a subcircuit sheet or collapse instances."), c);
    n.onmessage = ({ data: f }) => i(f.error, { svg: f.svg, drawing: f.drawing }), n.onerror = (f) => i(f.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const bn = `* RLC low-pass filter
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
`, yn = `* Voltage-divider biased common-emitter amplifier.
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
`, wn = `* Common-collector voltage follower; independently chosen example values.
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
`, En = `* Unity-gain Sallen-Key second-order low-pass filter.\r
* Topology: TI SLOA024B, section 3 (Analysis of the Sallen-Key Architecture).\r
* https://www.ti.com/lit/an/sloa024b/sloa024b.pdf\r
* Equal 10k resistors and 10n capacitors: ideal f0=1.59kHz, Q=0.5.\r
* Example component values; LM741_TL is a 20-BJT topology model, not a fitted device model.\r
* LM741_TL pin order: non-inverting, inverting, V+, V-, output, offset-null 1, offset-null 5.\r
.title Sallen-Key low-pass with transistor-level 741\r
VCC PWR_VCC 0 15\r
VEE RET_VEE 0 -15\r
VIN IN_SIG 0 AC 1 SIN(0 100m 100)\r
R1 IN_SIG N_FILTER 10k\r
R2 N_FILTER N_NONINV 10k\r
C1 N_FILTER OUT_SIG 10n\r
C2 N_NONINV 0 10n\r
XU1 N_NONINV OUT_SIG PWR_VCC RET_VEE OUT_SIG N_NULL_XU1_1 N_NULL_XU1_5 LM741_TL\r
RL OUT_SIG 0 100k\r
.ac dec 40 10 100k\r
.tran 20u 20m\r
* Self-contained transistor-level definition follows.\r
* 741-style transistor-level teaching circuit, transcribed from the TI LM741\r
* internal schematic supplied with the viewer discussion (datasheet section 7.2).\r
* https://www.ti.com/lit/ds/symlink/lm741.pdf\r
* Independent SPICE transcription; not the manufacturer's behavioral macromodel.\r
* Generic BJT parameters below illustrate topology; not a calibrated LM741 model.\r
* Interface order: IN+ (3), IN- (2), V+ (7), V- (4), OUT (6), NULL (1), NULL (5).\r
* The source diagram repeats Q15 and leaves the VBE multiplier unnumbered:\r
* Q16 denotes the gain input follower; Q18 denotes the VBE multiplier here.\r
.subckt LM741_TL IN_P IN_N PWR_VCC RET_VEE OUT_SIG IO_NULL1 IO_NULL5\r
* Local visual constraints apply only when this instance sheet is opened.\r
* @layout begin v1\r
* pair differential { Q1 Q2 Q3 Q4 }\r
* pair mirror { Q5 Q6 Q7 R1 R2 }\r
* pair mirror { Q8 Q9 }\r
* pair mirror { Q11 Q10 R4 }\r
* pair mirror { Q12 Q13 }\r
* pair vbe { Q18 R7 R8 }\r
* pair darlington { Q16 Q17 }\r
* pair current-limit { Q14 Q15 R9 }\r
* pair push-pull { Q14 Q20 R9 R10 }\r
* face Q7 right\r
* face Q16 left\r
* face Q17 left\r
* face Q18 left\r
* face Q22 left\r
* face Q14 right\r
* face Q15 left\r
* face Q20 left\r
* group SUPPLY row { PWR_VCC }\r
* group CORE row {\r
*   group INPUT classic { IN_P IN_N Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 R1 R2 R3 IO_NULL1 IO_NULL5 }\r
*   group BIAS classic { Q10 Q11 Q12 R4 R5 }\r
*   group GAIN classic { Q16 Q17 Q18 Q22 R7 R8 R11 R12 C1 }\r
*   group OUTPUT classic { Q13 Q14 Q15 Q20 R9 R10 OUT_SIG }\r
* }\r
* group RETURN row { RET_VEE }\r
* place SUPPLY above CORE\r
* place CORE above RETURN\r
* @layout end\r
* Differential input and active-load mirror.\r
Q1 N_INPUT_COL IN_P N_INPUT_EP Q741_N\r
Q2 N_INPUT_COL IN_N N_INPUT_EN Q741_N\r
Q3 N_MIRROR_LEFT N_PNP_BASE N_INPUT_EP Q741_P\r
Q4 N_GAIN_IN N_PNP_BASE N_INPUT_EN Q741_P\r
Q5 N_MIRROR_LEFT N_MIRROR_BASE IO_NULL1 Q741_N\r
Q6 N_GAIN_IN N_MIRROR_BASE IO_NULL5 Q741_N\r
Q7 PWR_VCC N_MIRROR_LEFT N_MIRROR_BASE Q741_N\r
Q8 N_INPUT_COL N_INPUT_COL PWR_VCC Q741_P\r
Q9 N_PNP_BASE N_INPUT_COL PWR_VCC Q741_P\r
R1 IO_NULL1 RET_VEE 1k\r
R2 IO_NULL5 RET_VEE 1k\r
R3 N_MIRROR_BASE RET_VEE 50k\r
* Self-biased current reference. No ideal current sources.\r
Q10 N_PNP_BASE N_BIAS_LOW N_BIAS_EMIT Q741_N\r
Q11 N_BIAS_LOW N_BIAS_LOW RET_VEE Q741_N\r
Q12 N_BIAS_HIGH N_BIAS_HIGH PWR_VCC Q741_P\r
Q13 N_DRIVE_HIGH N_BIAS_HIGH PWR_VCC Q741_P\r
R4 N_BIAS_EMIT RET_VEE 5k\r
R5 N_BIAS_HIGH N_BIAS_LOW 39k\r
* Darlington voltage-gain stage and Miller compensation.\r
Q16 N_DRIVE_LOW N_GAIN_IN N_GAIN_BASE Q741_N\r
Q17 N_DRIVE_LOW N_GAIN_BASE N_GAIN_EMIT Q741_N\r
Q18 N_DRIVE_HIGH N_CLASS_AB N_DRIVE_LOW Q741_N\r
R7 N_DRIVE_HIGH N_CLASS_AB 4.5k\r
R8 N_CLASS_AB N_DRIVE_LOW 7.5k\r
R11 N_GAIN_EMIT RET_VEE 50\r
R12 N_GAIN_BASE RET_VEE 50k\r
C1 N_GAIN_IN N_DRIVE_HIGH 30p\r
* Complementary emitter followers and protection transistors.\r
Q14 PWR_VCC N_DRIVE_HIGH N_OUTPUT_HIGH Q741_N\r
Q15 N_DRIVE_HIGH N_OUTPUT_HIGH OUT_SIG Q741_N\r
Q20 RET_VEE N_DRIVE_LOW N_OUTPUT_LOW Q741_P\r
Q22 N_GAIN_IN N_GAIN_EMIT RET_VEE Q741_N\r
R9 N_OUTPUT_HIGH OUT_SIG 25\r
R10 OUT_SIG N_OUTPUT_LOW 50\r
.ends LM741_TL\r
.model Q741_N NPN(IS=10f BF=200 BR=2 VAF=100 CJE=2p CJC=1p TF=350p)\r
.model Q741_P PNP(IS=10f BF=50 BR=4 VAF=50 CJE=1p CJC=2p TF=30n)\r
\r
.end\r
`, xn = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
* Topology and resistor ratios: TI SBOA282A (Three Op Amp Instrumentation Amplifier).\r
* https://www.ti.com/lit/an/sboa282a/sboa282a.pdf\r
* Adaptation: 741-style transistor models replace the reference design's TLV171 devices.\r
* Rf=10k, Rg=2.21k; unity-gain difference stage. Ideal overall gain=10.05.\r
* Open XINA -> XINPUT / XDIFF -> XU1 / XU2 / XU3 to inspect each transistor-level IC circuit.\r
* LM741_TL pin order: non-inverting, inverting, V+, V-, output, offset-null 1, offset-null 5.\r
.title Three-op-amp instrumentation amplifier\r
VCC PWR_VCC 0 15\r
VEE RET_VEE 0 -15\r
VIP IN_P 0 SIN(0 25m 100) AC 0.5\r
VIN IN_N 0 SIN(0 25m 100 0 0 180) AC 0.5 180\r
XINA IN_P IN_N OUT_SIG PWR_VCC RET_VEE INA3\r
RL OUT_SIG 0 100k\r
CP PWR_VCC 0 100n\r
CN RET_VEE 0 100n\r
\r
.subckt INA3 IN_P IN_N OUT_SIG PWR_VCC RET_VEE\r
XINPUT IN_P IN_N N_BUFFER_P N_BUFFER_N PWR_VCC RET_VEE INPUT_PAIR\r
XDIFF N_BUFFER_P N_BUFFER_N OUT_SIG PWR_VCC RET_VEE DIFFERENCE\r
.ends INA3\r
\r
.subckt INPUT_PAIR IN_P IN_N OUT_P OUT_N PWR_VCC RET_VEE\r
XU1 IN_P N_INV_P PWR_VCC RET_VEE OUT_P N_NULL_XU1_1 N_NULL_XU1_5 LM741_TL\r
XU2 IN_N N_INV_N PWR_VCC RET_VEE OUT_N N_NULL_XU2_1 N_NULL_XU2_5 LM741_TL\r
RF1 OUT_P N_INV_P 10k\r
RF2 OUT_N N_INV_N 10k\r
RG N_INV_P N_INV_N 2.21k\r
.ends INPUT_PAIR\r
\r
.subckt DIFFERENCE IN_P IN_N OUT_SIG PWR_VCC RET_VEE\r
R1 IN_N N_INV 10k\r
R2 OUT_SIG N_INV 10k\r
R3 IN_P N_NONINV 10k\r
R4 N_NONINV 0 10k\r
XU3 N_NONINV N_INV PWR_VCC RET_VEE OUT_SIG N_NULL_XU3_1 N_NULL_XU3_5 LM741_TL\r
.ends DIFFERENCE\r
\r
.ac dec 40 1 100k\r
.tran 20u 40m\r
* Self-contained transistor-level definition follows.\r
* 741-style transistor-level teaching circuit, transcribed from the TI LM741\r
* internal schematic supplied with the viewer discussion (datasheet section 7.2).\r
* https://www.ti.com/lit/ds/symlink/lm741.pdf\r
* Independent SPICE transcription; not the manufacturer's behavioral macromodel.\r
* Generic BJT parameters below illustrate topology; not a calibrated LM741 model.\r
* Interface order: IN+ (3), IN- (2), V+ (7), V- (4), OUT (6), NULL (1), NULL (5).\r
* The source diagram repeats Q15 and leaves the VBE multiplier unnumbered:\r
* Q16 denotes the gain input follower; Q18 denotes the VBE multiplier here.\r
.subckt LM741_TL IN_P IN_N PWR_VCC RET_VEE OUT_SIG IO_NULL1 IO_NULL5\r
* Local visual constraints apply only when this instance sheet is opened.\r
* @layout begin v1\r
* pair differential { Q1 Q2 Q3 Q4 }\r
* pair mirror { Q5 Q6 Q7 R1 R2 }\r
* pair mirror { Q8 Q9 }\r
* pair mirror { Q11 Q10 R4 }\r
* pair mirror { Q12 Q13 }\r
* pair vbe { Q18 R7 R8 }\r
* pair darlington { Q16 Q17 }\r
* pair current-limit { Q14 Q15 R9 }\r
* pair push-pull { Q14 Q20 R9 R10 }\r
* face Q7 right\r
* face Q16 left\r
* face Q17 left\r
* face Q18 left\r
* face Q22 left\r
* face Q14 right\r
* face Q15 left\r
* face Q20 left\r
* group SUPPLY row { PWR_VCC }\r
* group CORE row {\r
*   group INPUT classic { IN_P IN_N Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 R1 R2 R3 IO_NULL1 IO_NULL5 }\r
*   group BIAS classic { Q10 Q11 Q12 R4 R5 }\r
*   group GAIN classic { Q16 Q17 Q18 Q22 R7 R8 R11 R12 C1 }\r
*   group OUTPUT classic { Q13 Q14 Q15 Q20 R9 R10 OUT_SIG }\r
* }\r
* group RETURN row { RET_VEE }\r
* place SUPPLY above CORE\r
* place CORE above RETURN\r
* @layout end\r
* Differential input and active-load mirror.\r
Q1 N_INPUT_COL IN_P N_INPUT_EP Q741_N\r
Q2 N_INPUT_COL IN_N N_INPUT_EN Q741_N\r
Q3 N_MIRROR_LEFT N_PNP_BASE N_INPUT_EP Q741_P\r
Q4 N_GAIN_IN N_PNP_BASE N_INPUT_EN Q741_P\r
Q5 N_MIRROR_LEFT N_MIRROR_BASE IO_NULL1 Q741_N\r
Q6 N_GAIN_IN N_MIRROR_BASE IO_NULL5 Q741_N\r
Q7 PWR_VCC N_MIRROR_LEFT N_MIRROR_BASE Q741_N\r
Q8 N_INPUT_COL N_INPUT_COL PWR_VCC Q741_P\r
Q9 N_PNP_BASE N_INPUT_COL PWR_VCC Q741_P\r
R1 IO_NULL1 RET_VEE 1k\r
R2 IO_NULL5 RET_VEE 1k\r
R3 N_MIRROR_BASE RET_VEE 50k\r
* Self-biased current reference. No ideal current sources.\r
Q10 N_PNP_BASE N_BIAS_LOW N_BIAS_EMIT Q741_N\r
Q11 N_BIAS_LOW N_BIAS_LOW RET_VEE Q741_N\r
Q12 N_BIAS_HIGH N_BIAS_HIGH PWR_VCC Q741_P\r
Q13 N_DRIVE_HIGH N_BIAS_HIGH PWR_VCC Q741_P\r
R4 N_BIAS_EMIT RET_VEE 5k\r
R5 N_BIAS_HIGH N_BIAS_LOW 39k\r
* Darlington voltage-gain stage and Miller compensation.\r
Q16 N_DRIVE_LOW N_GAIN_IN N_GAIN_BASE Q741_N\r
Q17 N_DRIVE_LOW N_GAIN_BASE N_GAIN_EMIT Q741_N\r
Q18 N_DRIVE_HIGH N_CLASS_AB N_DRIVE_LOW Q741_N\r
R7 N_DRIVE_HIGH N_CLASS_AB 4.5k\r
R8 N_CLASS_AB N_DRIVE_LOW 7.5k\r
R11 N_GAIN_EMIT RET_VEE 50\r
R12 N_GAIN_BASE RET_VEE 50k\r
C1 N_GAIN_IN N_DRIVE_HIGH 30p\r
* Complementary emitter followers and protection transistors.\r
Q14 PWR_VCC N_DRIVE_HIGH N_OUTPUT_HIGH Q741_N\r
Q15 N_DRIVE_HIGH N_OUTPUT_HIGH OUT_SIG Q741_N\r
Q20 RET_VEE N_DRIVE_LOW N_OUTPUT_LOW Q741_P\r
Q22 N_GAIN_IN N_GAIN_EMIT RET_VEE Q741_N\r
R9 N_OUTPUT_HIGH OUT_SIG 25\r
R10 OUT_SIG N_OUTPUT_LOW 50\r
.ends LM741_TL\r
.model Q741_N NPN(IS=10f BF=200 BR=2 VAF=100 CJE=2p CJC=1p TF=350p)\r
.model Q741_P PNP(IS=10f BF=50 BR=4 VAF=50 CJE=1p CJC=2p TF=30n)\r
\r
.end\r
`, Pe = {
  filter: { source: bn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: yn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: wn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: En, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: xn, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function _n(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function ut(t) {
  return _n(await t.arrayBuffer());
}
const xt = [
  ["#dae8f1", "#c3daec", "#b7d2e5", "#9abddd", "#7ea8d1", "#5d8bbf", "#3f72aa", "#23598f", "#073a68"],
  ["#def1ef", "#c9eae9", "#c2e6e6", "#a8dddd", "#8bd1d3", "#6fc3c6", "#57b0b6", "#3f9b9e", "#157579"],
  ["#e3f0e6", "#cde5d5", "#c3e0ce", "#aed6be", "#96c8ad", "#7db898", "#65a583", "#519370", "#31714e"],
  ["#fef0d3", "#fde7b5", "#fce2a5", "#fcdc91", "#fbd276", "#f9c65c", "#f4bb49", "#eaaa36", "#de9419"],
  ["#fde7d7", "#fddbc2", "#fcd1b0", "#fbc39a", "#f7b381", "#f6a168", "#f19055", "#e87b42", "#ca5625"],
  ["#fce3df", "#fdd2cc", "#fbc6be", "#fbb8ad", "#f8a698", "#f38f7f", "#ed7e72", "#df6861", "#bc4b4d"],
  ["#f2e6ea", "#ebd7e0", "#e6ccd9", "#dbbbca", "#cea7bc", "#c091ab", "#b07b99", "#9f6887", "#774566"],
  ["#ebe8f1", "#d4d1e4", "#cac6df", "#bab5d4", "#a39ec7", "#8d89ba", "#7a77af", "#5f5f95", "#454778"],
  ["#ede4db", "#e0d6cc", "#d4c8bc", "#cbbbae", "#b6a496", "#a28f80", "#8e7b6a", "#7d6a5b", "#55473c"],
  ["#eaebed", "#dedee0", "#d4d4d6", "#c1c1c1", "#a9adb0", "#979b9e", "#818588", "#666a6d", "#3a3e3f"]
].flat(), tt = "#292b29", Be = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => xt[e * 9 + t]))])], dt = (t) => /^#[\da-f]{6}$/i.test(t), ft = "spice-node-colors-v1";
function vn(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class Nn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = vn(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Be[this.assigned.size % Be.length]), this.assigned.get(e)) : tt;
  }
  set(e, n) {
    if (!dt(n)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && dt(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Cn(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const i = o.get(r.getAttribute("data-net"));
    if (!i) continue;
    r.style.setProperty("stroke", i, "important"), r.localName === "circle" && r.style.setProperty("fill", i, "important");
  }
}
function In(t, e) {
  const n = new Nn(), o = /* @__PURE__ */ new Set();
  let r = [], i = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(ft) || "null"));
  } catch {
  }
  const c = () => {
    try {
      sessionStorage.setItem(ft, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const d = t("node-search").value.trim().toLowerCase();
    return r.filter((y) => !d || [y.name, y.displayName, ...y.terminals.map((w) => w.component + "." + w.pin)].some((w) => w.toLowerCase().includes(d)));
  };
  function f() {
    const d = a(), y = d.filter((w) => o.has(w.name)).length;
    t("node-count").textContent = `${d.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!d.length && y === d.length, t("node-all").indeterminate = y > 0 && y < d.length, t("node-auto").checked = n.auto;
    for (const w of ["node-apply", "node-clear"]) t(w).disabled = !i || !o.size;
    t("node-all").disabled = !i || !d.length;
  }
  function h() {
    t("nets").replaceChildren(...a().map((d) => {
      const y = document.createElement("tr");
      y.dataset.node = d.name;
      const w = document.createElement("td"), E = document.createElement("input");
      E.type = "checkbox", E.checked = o.has(d.name), E.disabled = !i, E.setAttribute("aria-label", "Select node " + d.displayName), E.onchange = () => {
        E.checked ? o.add(d.name) : o.delete(d.name), f();
      }, w.append(E);
      const I = document.createElement("td");
      I.textContent = d.displayName;
      const x = document.createElement("td"), b = document.createElement("input");
      b.type = "color", b.value = n.color(d.name), b.disabled = !i, b.setAttribute("aria-label", "Wire color for " + d.displayName), b.onchange = () => {
        n.set([d.name], b.value), u();
      }, x.append(b);
      const v = document.createElement("td");
      return v.textContent = d.terminals.map((T) => T.component + "." + T.pin).join(", "), y.append(w, I, x, v), y;
    })), f();
  }
  function u() {
    for (const d of r) n.color(d.name);
    h(), c(), e(n, r);
  }
  t("node-search").oninput = h, t("node-all").onchange = () => {
    for (const d of a()) t("node-all").checked ? o.add(d.name) : o.delete(d.name);
    h();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, u();
  }, t("node-apply").onclick = () => {
    n.set(o, t("node-color").value), u();
  }, t("node-clear").onclick = () => {
    n.set(o, tt), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...xt.map((d) => {
    const y = document.createElement("button");
    return y.type = "button", y.style.backgroundColor = d, y.title = d, y.setAttribute("aria-label", "Apply palette color " + d), y.onclick = () => {
      o.size && (t("node-color").value = d, n.set(o, d), u());
    }, y;
  }));
  function g(d) {
    i = d;
    for (const y of t("node-panel").querySelectorAll("input,button")) y.disabled = !i;
    f();
  }
  return { setCircuit(d, y) {
    const w = n.sourceId;
    n.setSource(y), w !== n.sourceId && o.clear(), r = Object.values(d?.nodes || {});
    const E = new Set(r.map((I) => I.name));
    for (const I of o) E.has(I) || o.delete(I);
    for (const I of r) n.color(I.name);
    i = !!d, h(), g(i), c(), e(n, r);
  }, setEnabled: g };
}
function Tn(t) {
  const e = (A) => t.querySelector("#spice-" + A), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, i = Object.fromEntries(Object.keys(r).map((A) => [A, t.querySelector(`[data-window-handle="${A}"]`)])), c = { editor: !0, details: !0, info: !0 }, a = { editor: !0, details: !0, info: !0 }, f = [], h = { editor: {}, details: {}, info: {} }, u = [];
  let g = !1, d = !1, y = null, w = null, E = null, I = null;
  function x(A, _) {
    a[A] = _, r[A].dataset.pinned = String(_);
    const P = e("pin-" + A), j = { editor: "netlist", details: "details", info: "messages" }[A], F = A === "info" ? "bottom edge" : A === "details" ? "lower left" : "left edge", X = _ ? `Unpin ${j} from ${F}` : `Pin ${j} to ${F}`;
    if (P.setAttribute("aria-pressed", String(_)), P.setAttribute("aria-label", X), P.title = X, _) for (const G of ["left", "top", "right", "bottom", "width", "height"]) r[A].style.removeProperty(G);
  }
  for (const A of Object.keys(r)) x(A, !0);
  const b = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: g, panels: { ...c } } })), v = (A, _, P, j = {}) => A.addEventListener(_, P, { ...j, signal: o });
  function T(A, _) {
    c[A] = _, r[A].hidden = g && !_, e("show-" + A).setAttribute("aria-expanded", String(_)), b();
  }
  function M(A) {
    const _ = document.createComment("workspace return");
    A.before(_), f.push({ node: A, anchor: _ }), e("details-content").prepend(A);
  }
  function C(A) {
    const _ = A.getBoundingClientRect(), P = t.getBoundingClientRect();
    return { x: _.left - P.left, y: _.top - P.top, w: _.width, h: _.height, width: P.width, height: P.height };
  }
  function k(A, _, P) {
    const j = C(A), F = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, X = Math.max(8, Math.min(_, j.width - j.w - 8)), G = Math.max(8, Math.min(F, j.height - j.h - 8)), V = Math.max(G, Math.min(P, j.height - j.h - 8));
    A.style.left = Math.round(X) + "px", A.style.top = Math.round(V) + "px", A.style.right = "auto", A.style.bottom = "auto";
  }
  function U() {
    if (g) {
      for (const [A, _] of Object.entries(r)) if (!_.hidden && !a[A]) {
        const P = C(_);
        k(_, P.x, P.y);
      }
    }
  }
  function m() {
    for (const A of Object.values(r))
      for (const _ of ["left", "top", "right", "bottom", "width", "height", "z-index"]) A.style.removeProperty(_);
    for (const A of Object.keys(r))
      x(A, !0), T(A, !0);
    requestAnimationFrame(U);
  }
  function p() {
    if (!g) {
      g = !0, y = document.activeElement, w = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, I = document.createComment("workspace mount"), t.before(I), document.body.append(t);
      for (const A of document.body.children) A !== t && (u.push({ node: A, inert: A.inert }), A.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const A of Object.keys(r))
        h[A].base = r[A].style.cssText, h[A].floating && (r[A].style.cssText = h[A].floating), r[A].setAttribute("role", "dialog"), r[A].setAttribute("aria-modal", "false"), r[A].setAttribute("aria-labelledby", "spice-" + A + "-title"), i[A].tabIndex = 0, i[A].title = "Drag to move; arrow keys move the window", T(A, c[A]);
      for (const A of ["selection-actions", "selection", "hierarchy-panel"]) M(e(A));
      requestAnimationFrame(U), e("exit-fullscreen").focus({ preventScroll: !0 }), b();
    }
  }
  function D() {
    if (g) {
      g = !1, E = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: A, anchor: _ } of f.splice(0))
        _.before(A), _.remove();
      for (const A of Object.keys(r)) {
        h[A].floating = r[A].style.cssText, r[A].style.cssText = h[A].base, r[A].hidden = !1;
        for (const _ of ["role", "aria-modal", "aria-labelledby"]) r[A].removeAttribute(_);
        i[A].removeAttribute("tabindex"), i[A].removeAttribute("title");
      }
      I && (I.before(t), I.remove(), I = null);
      for (const { node: A, inert: _ } of u.splice(0)) A.inert = _;
      w && (document.documentElement.style.overflow = w.html, document.body.style.overflow = w.body, window.scrollTo(w.x, w.y)), y?.focus?.({ preventScroll: !0 }), b();
    }
  }
  async function q() {
    p(), t.dataset.nativeFullscreen = "false";
  }
  async function H() {
    if (d = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        d = !0;
        return;
      }
    D();
  }
  v(e("fullscreen"), "click", () => g ? H() : q()), v(e("exit-fullscreen"), "click", H), v(e("reset-windows"), "click", m);
  for (const A of Object.keys(r)) {
    v(e("pin-" + A), "click", () => {
      const j = C(r[A]);
      x(A, !a[A]), a[A] || (r[A].style.width = j.w + "px", r[A].style.height = j.h + "px", k(r[A], j.x, j.y)), b();
    }), v(e("show-" + A), "click", () => {
      T(A, !c[A]), requestAnimationFrame(U);
    }), v(e("close-" + A), "click", () => {
      T(A, !1), e("show-" + A).focus({ preventScroll: !0 });
    }), v(r[A], "pointerdown", () => {
      if (g) {
        for (const j of Object.values(r)) j.style.zIndex = "20";
        r[A].style.zIndex = "30";
      }
    }, { capture: !0 });
    const _ = i[A];
    v(_, "pointerdown", (j) => {
      if (!g || j.button !== 0 || j.target.closest("button,input,select,textarea,a,label")) return;
      j.preventDefault();
      const F = C(r[A]);
      x(A, !1), r[A].style.width = F.w + "px", r[A].style.height = F.h + "px", k(r[A], F.x, F.y), E = { id: A, pointer: j.pointerId, x: j.clientX, y: j.clientY, left: F.x, top: F.y }, _.setPointerCapture(j.pointerId);
    }), v(_, "pointermove", (j) => {
      E?.id === A && E.pointer === j.pointerId && k(r[A], E.left + j.clientX - E.x, E.top + j.clientY - E.y);
    });
    const P = () => {
      E = null;
    };
    v(_, "pointerup", P), v(_, "pointercancel", P), v(_, "lostpointercapture", P), v(_, "keydown", (j) => {
      if (!g || j.target !== _ || !j.key.startsWith("Arrow")) return;
      j.preventDefault();
      const F = C(r[A]), X = j.shiftKey ? 32 : 8;
      x(A, !1), r[A].style.width = F.w + "px", r[A].style.height = F.h + "px", k(r[A], F.x + ({ ArrowLeft: -X, ArrowRight: X }[j.key] || 0), F.y + ({ ArrowUp: -X, ArrowDown: X }[j.key] || 0));
    });
  }
  v(document, "fullscreenchange", () => {
    g && d && document.fullscreenElement !== t && (d = !1, D());
  }), v(document, "keydown", (A) => {
    g && A.altKey && A.key === "Escape" && (A.preventDefault(), A.stopImmediatePropagation(), H());
  }, { capture: !0 }), v(window, "resize", U);
  const K = new ResizeObserver(U);
  for (const A of Object.values(r)) K.observe(A);
  return { enter: q, exit: H, showPanel: T, reset: m, destroy() {
    H(), n.abort(), K.disconnect();
  } };
}
const se = 1e-3, oe = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ie = (t, e) => Math.abs(t - e) < se, be = (t, e) => ie(e.a.x, e.b.x) ? ie(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - se && t.y <= Math.max(e.a.y, e.b.y) + se : ie(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - se && t.x <= Math.max(e.a.x, e.b.x) + se, Sn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), An = (t, e) => Math.max(t.a.x, t.b.x) > e.x + se && Math.min(t.a.x, t.b.x) < e.x + e.width - se && Math.max(t.a.y, t.b.y) > e.y + se && Math.min(t.a.y, t.b.y) < e.y + e.height - se;
function je(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && oe(e.at(-1)) === oe(n))) {
      for (; e.length > 1 && (ie(e.at(-2).x, e.at(-1).x) && ie(e.at(-1).x, n.x) || ie(e.at(-2).y, e.at(-1).y) && ie(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class On {
  constructor(e, { step: n = 8, segments: o = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(o), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
  }
  pins() {
    return this.pinCache || (this.pinCache = this.components.flatMap((e) => e.ports.map((n) => ({ ...n, owner: e.id, id: e.id + "." + n.pin }))));
  }
  snapshot() {
    return structuredClone({ components: this.components, segments: this.segments });
  }
  restore(e) {
    this.components = structuredClone(e.components), this.segments = structuredClone(e.segments), this.cache = null, this.pinCache = null;
  }
  remember(e = this.snapshot()) {
    this.undoStack.push(e), this.undoStack.length > 60 && this.undoStack.shift(), this.redoStack = [], this.cache = null, this.pinCache = null;
  }
  undo() {
    this.undoStack.length && (this.redoStack.push(this.snapshot()), this.restore(this.undoStack.pop()));
  }
  redo() {
    this.redoStack.length && (this.undoStack.push(this.snapshot()), this.restore(this.redoStack.pop()));
  }
  clear() {
    this.remember(), this.segments = [];
  }
  remove(e) {
    this.segments[e] && (this.remember(), this.segments.splice(e, 1));
  }
  onGrid(e) {
    return ie(e.x / this.step, Math.round(e.x / this.step)) && ie(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !ie(e.a.x, e.b.x) && !ie(e.a.y, e.b.y)) return !1;
    const o = this.pins();
    if (o.some((r) => r.bit !== n && be(r, e)) || this.segments.some((r) => r.bit !== n && (be(e.a, r) || be(e.b, r) || be(r.a, e) || be(r.b, e)))) return !1;
    for (const r of this.components) if (An(e, r) && !o.filter((c) => c.owner === r.id && c.bit === n).some((c) => c.side === "NORTH" ? ie(e.a.x, c.x) && ie(e.b.x, c.x) && Math.max(e.a.y, e.b.y) <= c.y + se : c.side === "SOUTH" ? ie(e.a.x, c.x) && ie(e.b.x, c.x) && Math.min(e.a.y, e.b.y) >= c.y - se : c.side === "WEST" ? ie(e.a.y, c.y) && ie(e.b.y, c.y) && Math.max(e.a.x, e.b.x) <= c.x + se : c.side === "EAST" ? ie(e.a.y, c.y) && ie(e.b.y, c.y) && Math.min(e.a.x, e.b.x) >= c.x - se : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const o = je(n), r = o.slice(1).map((i, c) => ({ bit: e, a: o[c], b: i })).filter((i) => Sn(i) > se);
    if (!r.length) return !1;
    if (r.some((i) => !this.validSegment(i, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, o) {
    if (n = Math.round(n / this.step) * this.step, o = Math.round(o / this.step) * this.step, !n && !o) return;
    const r = this.snapshot(), i = this.components.find((f) => f.id === e);
    if (!i) return;
    const c = i.ports.map((f) => ({ ...f }));
    this.segments = this.segments.filter((f) => !c.some((h) => h.bit === f.bit && (oe(h) === oe(f.a) || oe(h) === oe(f.b)))), i.x += n, i.y += o;
    for (const f of i.ports)
      f.x += n, f.y += o;
    if (this.pinCache = null, this.components.some((f) => f !== i && i.x < f.x + f.width - se && i.x + i.width > f.x + se && i.y < f.y + f.height - se && i.y + i.height > f.y + se) || this.segments.some((f) => !this.validSegment(f, f.bit)) || i.ports.some((f) => this.pins().some((h) => h.owner !== e && h.bit !== f.bit && oe(h) === oe(f))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  transform(e, n) {
    const o = this.components.find((d) => d.id === e);
    if (!o) return;
    const r = this.snapshot(), i = o.width, c = o.height, a = n === "rotate" ? [0, 1, -1, 0, c, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, c] : n === "mirror-y" ? [-1, 0, 0, 1, i, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const f = o.ports.map((d) => ({ ...d })), h = (d) => ({ x: a[0] * d.x + a[2] * d.y + a[4], y: a[1] * d.x + a[3] * d.y + a[5] });
    this.segments = this.segments.filter((d) => !f.some((y) => y.bit === d.bit && (oe(y) === oe(d.a) || oe(y) === oe(d.b))));
    const u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of o.ports) {
      const y = h({ x: d.x - o.x, y: d.y - o.y });
      d.x = o.x + y.x, d.y = o.y + y.y, d.side = u[d.side] || d.side;
    }
    const g = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [a[0] * g[0] + a[2] * g[1], a[1] * g[0] + a[3] * g[1], a[0] * g[2] + a[2] * g[3], a[1] * g[2] + a[3] * g[3], a[0] * g[4] + a[2] * g[5] + a[4], a[1] * g[4] + a[3] * g[5] + a[5]], n === "rotate" && (o.width = c, o.height = i), this.pinCache = null, o.ports.some((d) => !this.onGrid(d)) || this.components.some((d) => d !== o && o.x < d.x + d.width - se && o.x + o.width > d.x + se && o.y < d.y + d.height - se && o.y + o.height > d.y + se) || this.segments.some((d) => !this.validSegment(d, d.bit)) || o.ports.some((d) => this.pins().some((y) => y.owner !== e && y.bit !== d.bit && oe(y) === oe(d))))
      throw this.restore(r), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(r);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const o of this.pins())
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).pins.push(o);
    for (const o of this.segments)
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).segments.push(o);
    const n = [];
    for (const [o, r] of e) {
      const i = /* @__PURE__ */ new Map(), c = (u) => {
        i.has(oe(u)) || i.set(oe(u), u);
      };
      r.pins.forEach(c);
      for (const u of r.segments)
        c(u.a), c(u.b);
      for (let u = 0; u < r.segments.length; u++) for (let g = u + 1; g < r.segments.length; g++) {
        const d = r.segments[u], y = r.segments[g];
        if (ie(d.a.x, d.b.x) === ie(y.a.x, y.b.x)) continue;
        const w = ie(d.a.x, d.b.x) ? d : y, E = w === d ? y : d, I = { x: w.a.x, y: E.a.y };
        be(I, w) && be(I, E) && c(I);
      }
      const a = new Map([...i.keys()].map((u) => [u, u])), f = (u) => {
        let g = u;
        for (; a.get(g) !== g; ) g = a.get(g);
        for (; u !== g; ) {
          const d = a.get(u);
          a.set(u, g), u = d;
        }
        return g;
      };
      for (const u of r.segments) {
        const g = [...i.values()].filter((d) => be(d, u));
        for (const d of g.slice(1)) a.set(f(oe(d)), f(oe(g[0])));
      }
      const h = /* @__PURE__ */ new Map();
      for (const u of r.pins) {
        const g = f(oe(u));
        h.has(g) || h.set(g, { pins: [], points: [] }), h.get(g).pins.push(u);
      }
      for (const u of i.values()) {
        const g = f(oe(u));
        h.has(g) && h.get(g).points.push(u);
      }
      n.push({ bit: o, islands: [...h.values()], points: [...i.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: o } of this.connectivity()) {
      if (o.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < o.length; ) {
        let i;
        for (const c of r) for (let a = 0; a < o.length; a++) if (!r.has(a)) for (const f of o[c].points) for (const h of o[a].points) {
          const u = (f.x - h.x) ** 2 + (f.y - h.y) ** 2;
          (!i || u < i.d) && (i = { bit: n, a: f, b: h, d: u, j: a });
        }
        e.push(i), r.add(i.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const i of this.components)
      e.push(i.x - 20, i.x + i.width + 20), n.push(i.y - 20, i.y + i.height + 20);
    for (const i of this.segments)
      e.push(i.a.x - 20, i.b.x + 20), n.push(i.a.y - 20, i.b.y + 20);
    const o = Math.min(...e), r = Math.min(...n);
    return { x: o, y: r, w: Math.max(...e) - o, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, o) {
    if (!this.onGrid(n) || !this.onGrid(o)) return null;
    const r = (M) => M.slice(1).every((C, k) => this.validSegment({ a: M[k], b: C }, e));
    for (const M of [[n, o], [n, { x: o.x, y: n.y }, o], [n, { x: n.x, y: o.y }, o]]) {
      const C = je(M);
      if (r(C)) return C;
    }
    const i = this.step, c = this.bounds(), a = Math.floor(Math.min(c.x, n.x, o.x) / i) - 5, f = Math.ceil(Math.max(c.x + c.w, n.x, o.x) / i) + 5, h = Math.floor(Math.min(c.y, n.y, o.y) / i) - 5, u = Math.ceil(Math.max(c.y + c.h, n.y, o.y) / i) + 5, g = { x: n.x / i, y: n.y / i, dir: -1, cost: 0, key: n.x / i + "," + n.y / i + ",-1" }, d = [g], y = /* @__PURE__ */ new Map([[g.key, 0]]), w = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map([[g.key, g]]), I = [[1, 0], [-1, 0], [0, 1], [0, -1]], x = (M) => Math.abs(M.x - o.x / i) + Math.abs(M.y - o.y / i);
    let b = null, v = 0;
    for (; d.length && v++ < 3e4; ) {
      let M = 0;
      for (let k = 1; k < d.length; k++) d[k].cost + x(d[k]) < d[M].cost + x(d[M]) && (M = k);
      const C = d.splice(M, 1)[0];
      if (C.cost === y.get(C.key)) {
        if (C.x === o.x / i && C.y === o.y / i) {
          b = C;
          break;
        }
        for (let k = 0; k < 4; k++) {
          const U = C.x + I[k][0], m = C.y + I[k][1];
          if (U < a || U > f || m < h || m > u) continue;
          const p = { x: U, y: m, dir: k, key: U + "," + m + "," + k, cost: C.cost + 1 + (C.dir !== -1 && C.dir !== k ? 3 : 0) };
          p.cost >= (y.get(p.key) ?? 1 / 0) || !this.validSegment({ a: { x: C.x * i, y: C.y * i }, b: { x: U * i, y: m * i } }, e) || (y.set(p.key, p.cost), w.set(p.key, C.key), E.set(p.key, p), d.push(p));
        }
      }
    }
    if (!b) return null;
    const T = [];
    for (let M = b; M; M = E.get(w.get(M.key))) T.push({ x: M.x * i, y: M.y * i });
    return je(T.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const o = /* @__PURE__ */ new Set();
    let r = 0;
    for (; !e() && r++ < Math.max(20, this.pins().length * 2); ) {
      const i = this.airwires().find((a) => !o.has(a.bit + ":" + oe(a.a) + ":" + oe(a.b)));
      if (!i) break;
      const c = this.findPath(i.bit, i.a, i.b);
      c ? (this.segments.push(...c.slice(1).map((a, f) => ({ bit: i.bit, a: c[f], b: a }))), this.cache = null) : o.add(i.bit + ":" + oe(i.a) + ":" + oe(i.b)), r % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const kn = "http://www.w3.org/2000/svg", ue = (t, e = {}) => {
  const n = document.createElementNS(kn, t);
  for (const [o, r] of Object.entries(e)) n.setAttribute(o, r);
  return n;
}, Rn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Ln(t, e, { changed: n, inspect: o, getNetColor: r }) {
  let i = null, c = null, a = !1, f = !1, h = null, u = null, g = -1, d = "", y = 0, w = "", E = 8, I = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  const v = (_) => new DOMPoint(_.clientX, _.clientY).matrixTransform(c.getScreenCTM().inverse()), T = (_) => i.snap(v(_)), M = (_) => r?.(_) || Be[Number(_) % Be.length], C = (_) => {
    e("editor-status").textContent = _;
  };
  function k() {
    return { unrouted: i?.airwires().length || 0, wires: i?.segments.length || 0, editing: a, routing: f };
  }
  function U() {
    const _ = !!i;
    for (const P of ["interactive", "flywire", "auto-route"]) e(P).disabled = !c || f;
    e("edit-tool").disabled = !_ || f;
    for (const P of document.querySelectorAll("[data-editor-mode]"))
      P.disabled = !c || f, P.setAttribute("aria-pressed", String(a && P.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !_ || f || !i.undoStack.length, e("wire-redo").disabled = !_ || f || !i.redoStack.length, t.classList.toggle("spice-editing", a);
  }
  function m(_, P) {
    const j = b.get(_.id);
    if (j && (P.replaceChildren(...j.children.map((F) => F.cloneNode(!0))), _.editorMatrix)) {
      const F = _.editorMatrix, X = ue("g", { transform: "matrix(" + F.join(" ") + ")", "data-editor-glyph": "true" });
      X.append(...P.childNodes);
      for (const G of X.querySelectorAll("text")) G.remove();
      P.append(X);
      for (const [G, V] of j.labels.entries()) {
        const ne = V.node.cloneNode(!0);
        ne.removeAttribute("transform");
        let ee = F[0] * V.x + F[2] * V.y + F[4], J = F[1] * V.x + F[3] * V.y + F[5];
        if (_.ports.length === 2 && j.labels.length === 2) {
          const R = Math.abs(_.ports[0].y - _.ports[1].y) < 1e-3;
          ee = R ? _.width / 2 : _.ports[0].x - _.x + 20, J = R ? _.ports[0].y - _.y - 26 + G * 16 : _.height / 2 - 8 + G * 16, ne.setAttribute("text-anchor", R ? "middle" : "start");
        }
        ne.setAttribute("x", ee), ne.setAttribute("y", J), P.append(ne);
      }
    }
  }
  function p(_) {
    if (h = null, ["rotate", "mirror-x", "mirror-y"].includes(_) && d) {
      try {
        i.transform(d, _), H();
      } catch (P) {
        C(P.message);
      }
      return;
    }
    e("edit-tool").value = _, q(), U();
  }
  function D() {
    if (!i) return;
    const _ = k();
    C(`${_.unrouted} connection${_.unrouted === 1 ? "" : "s"} unrouted · ${_.wires} wire segments${f ? " · Auto-routing…" : ""}`), U(), n(i.drawing(), _, i.bounds()), x.set(w, i.snapshot()), x.size > 20 && x.delete(x.keys().next().value);
  }
  function q(_ = null) {
    if (c?.querySelector("[data-route-preview]")?.remove(), !h || !c) return;
    const P = [...h.points];
    if (_) {
      const X = P.at(-1);
      P.push({ x: _.x, y: X.y }, _);
    }
    const j = ue("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    j.append(ue("polyline", { points: P.map((X) => X.x + "," + X.y).join(" "), fill: "none", stroke: M(h.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), c.append(j);
    const F = c.querySelector("[data-airwires]");
    F && c.append(F);
  }
  function H() {
    if (!c || !i) return;
    for (const G of c.querySelectorAll("[data-editor-body-hit]")) G.remove();
    for (const G of [...c.children]) (G.hasAttribute("data-editor-overlay") || G.hasAttribute("data-airwires") || G.hasAttribute("data-manual-state") || G.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(G.localName)) && G.remove();
    for (const G of i.components) {
      const V = c.getElementById("cell_" + G.id);
      V && (m(G, V), V.setAttribute("s:width", G.width), V.setAttribute("s:height", G.height), V.setAttribute("transform", `translate(${G.x},${G.y})`), V.dataset.editorComponent = G.id, a && V.prepend(ue("rect", { x: 0, y: 0, width: G.width, height: G.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const _ = c.querySelector('g[id^="cell_"]'), P = ue("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), j = ue("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [G, V] of i.segments.entries()) {
      const ne = ue("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, class: "net_" + V.bit, "data-net": I.get(V.bit) || String(V.bit), "stroke-width": G === g ? 2.8 : 1.4 });
      ne.append(ue("title")), ne.firstChild.textContent = "Node " + (I.get(V.bit) || V.bit), c.insertBefore(ne, _), a && P.append(ue("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, "data-editor-wire": G, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const G of i.connectivity()) for (const V of G.points) {
      const ne = /* @__PURE__ */ new Set();
      for (const ee of G.segments) be(V, ee) && (Math.min(ee.a.x, ee.b.x) < V.x - 1e-3 && ne.add("w"), Math.max(ee.a.x, ee.b.x) > V.x + 1e-3 && ne.add("e"), Math.min(ee.a.y, ee.b.y) < V.y - 1e-3 && ne.add("n"), Math.max(ee.a.y, ee.b.y) > V.y + 1e-3 && ne.add("s"));
      (ne.size >= 3 || ne.size >= 2 && G.islands.some((ee) => ee.pins.some((J) => Rn(V, J)))) && c.insertBefore(ue("circle", { cx: V.x, cy: V.y, r: 2, class: "net_" + G.bit, "data-net": I.get(G.bit) || String(G.bit), fill: M(G.bit) }), _);
    }
    if (a) {
      const G = i.components.find((V) => V.id === d);
      G && P.append(ue("rect", { x: G.x - 3, y: G.y - 3, width: G.width + 6, height: G.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const V of i.pins()) {
        const ne = ue("circle", { cx: V.x, cy: V.y, r: 3, "data-editor-pin": V.id, "data-editor-bit": V.bit, fill: "#fff", stroke: M(V.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": V.owner + " " + V.pin }), ee = ue("title");
        ee.textContent = V.id + " · " + (I.get(V.bit) || V.bit), ne.append(ee), j.append(ne);
      }
      c.append(P, j);
    }
    q();
    const F = ue("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const G of i.airwires()) F.append(ue("line", { x1: G.a.x, y1: G.a.y, x2: G.b.x, y2: G.b.y, stroke: M(G.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": G.bit, "data-from-owner": G.a.owner || "", "data-to-owner": G.b.owner || "" }));
    c.append(F);
    const X = ue("metadata", { "data-manual-state": "true" });
    X.textContent = JSON.stringify({ version: 1, grid: E, unrouted: i.airwires().length, manual: !0 }), c.insertBefore(X, F), D();
  }
  function K(_, P) {
    if (!h) {
      h = { bit: P, points: [_] }, q(), C("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (P !== void 0 && h.bit !== P) {
      C("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const j = h.points.at(-1), F = i.findPath(h.bit, j, _);
    if (!F) {
      C("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (P === void 0) {
      h.points.push(...F.slice(1)), q();
      return;
    }
    try {
      i.addPath(P, [...h.points, ...F.slice(1)]), h = null, H();
    } catch (X) {
      C(X.message);
    }
  }
  t.addEventListener("pointerdown", (_) => {
    if (!a || f || !i || !c || _.button !== 0 || _.shiftKey) return;
    const P = _.target.closest("[data-editor-pin]"), j = _.target.closest("[data-editor-wire]"), F = _.target.closest("[data-editor-component]");
    if (!(!P && !j && !F && !h)) {
      if (_.preventDefault(), _.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), P) {
        const X = i.pins().find((G) => G.id === P.dataset.editorPin);
        e("edit-tool").value = "route", U(), K({ x: X.x, y: X.y }, X.bit);
        return;
      }
      if (j) {
        const X = +j.dataset.editorWire, G = i.segments[X];
        if (e("edit-tool").value === "erase" && !h) {
          i.remove(X), g = -1, H();
          return;
        }
        if (h || e("edit-tool").value === "route") {
          const V = T(_);
          K(G.a.x === G.b.x ? { x: G.a.x, y: V.y } : { x: V.x, y: G.a.y }, G.bit);
        } else
          g = X, H(), C("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (h) {
        K(T(_));
        return;
      }
      if (F) {
        const X = F.dataset.editorComponent, G = i.components.find((V) => V.id === X);
        if (!G) return;
        if (d = X, g = -1, o?.(X), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          p(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          H();
          return;
        }
        u = { id: X, n: G, element: F, x: _.clientX, y: _.clientY, start: v(_), dx: 0, dy: 0 }, F.style.opacity = ".6", t.setPointerCapture(_.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (_) => {
    if (!(!a || !i || !c)) {
      if (u) {
        _.stopImmediatePropagation();
        const P = v(_), j = i.snap({ x: P.x - u.start.x, y: P.y - u.start.y });
        u.dx = j.x, u.dy = j.y, u.element.setAttribute("transform", `translate(${u.n.x + u.dx},${u.n.y + u.dy})`);
        for (const F of c.querySelectorAll("[data-airwires] line"))
          F.dataset.fromOwner === u.id && (F.setAttribute("x1", +F.getAttribute("x1") - Number(F.dataset.dx || 0) + u.dx), F.setAttribute("y1", +F.getAttribute("y1") - Number(F.dataset.dy || 0) + u.dy)), F.dataset.toOwner === u.id && (F.setAttribute("x2", +F.getAttribute("x2") - Number(F.dataset.dx || 0) + u.dx), F.setAttribute("y2", +F.getAttribute("y2") - Number(F.dataset.dy || 0) + u.dy)), F.dataset.dx = u.dx, F.dataset.dy = u.dy;
        return;
      }
      h && q(T(_));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (_) => {
    if (!u) return;
    _.preventDefault(), _.stopImmediatePropagation();
    const P = u;
    u = null, P.element.style.opacity = "", t.hasPointerCapture(_.pointerId) && t.releasePointerCapture(_.pointerId);
    try {
      i.move(P.id, P.dx, P.dy), g = -1, H();
    } catch (j) {
      H(), C(j.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    u && (u.element.style.opacity = "", u = null, H());
  }), document.addEventListener("keydown", (_) => {
    if (!a || !i || f || _.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(_.target)) return;
    const P = _.target.closest("[data-editor-pin]"), j = _.key.toLowerCase();
    if (P && (_.key === "Enter" || _.key === " ")) {
      _.preventDefault(), _.stopImmediatePropagation();
      const F = i.pins().find((X) => X.id === P.dataset.editorPin);
      K({ x: F.x, y: F.y }, F.bit);
      return;
    }
    _.key === "Escape" ? (_.preventDefault(), _.stopImmediatePropagation(), h = null, p("move"), H()) : (_.key === "Delete" || _.key === "Backspace") && g >= 0 ? (_.preventDefault(), _.stopImmediatePropagation(), i.remove(g), g = -1, H()) : (_.ctrlKey || _.metaKey) && j === "z" ? (_.preventDefault(), _.stopImmediatePropagation(), _.shiftKey ? i.redo() : i.undo(), h = null, H()) : !_.ctrlKey && !_.metaKey && !_.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[j] && (_.preventDefault(), _.stopImmediatePropagation(), p({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[j]));
  }, { capture: !0 });
  async function A() {
    if (!i || f) return;
    const _ = y;
    f = !0, D(), C("Auto-routing remaining connections…");
    try {
      await i.autoRoute(() => _ !== y), _ === y && (h = null, g = -1, f = !1, H());
    } catch (P) {
      _ === y && (f = !1, H(), C(P.message));
    }
  }
  return {
    mount(_, P, j, F, X, { reset: G = !1 } = {}) {
      y++, f = !1, c = _, h = null, u = null, g = -1, d = "", b = /* @__PURE__ */ new Map();
      for (const J of c.querySelectorAll('g[id^="cell_"]')) {
        const R = J.getCTM().inverse();
        b.set(J.id.slice(5), { children: [...J.childNodes].map((L) => L.cloneNode(!0)), labels: [...J.querySelectorAll("text")].map((L) => {
          const W = new DOMPoint(+L.getAttribute("x") || 0, +L.getAttribute("y") || 0).matrixTransform(R.multiply(L.getCTM()));
          return { node: L.cloneNode(!0), x: W.x, y: W.y };
        }) });
      }
      if (E = X.gridSize || 0, I = new Map(Object.values(j.nodes).map((J) => [J.bit, J.name])), !P || !E) {
        i = null, U();
        return;
      }
      const V = structuredClone(P);
      for (const J of V.components) {
        const R = c.getElementById("cell_" + J.id);
        for (const L of J.ports) {
          const W = [...R.children].find(($) => $.getAttribute("s:pid") === L.pin);
          L.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[W?.getAttribute("s:position")] || L.side;
        }
      }
      for (const [J, R] of Object.entries(F.modules.circuit.cells)) if (R.attributes.name === "0") {
        const L = c.getElementById("cell_" + J), W = L?.transform.baseVal.consolidate().matrix;
        L && W && V.components.push({ id: J, decoration: !0, x: W.e, y: W.f, width: +L.getAttribute("s:width"), height: +L.getAttribute("s:height"), ports: [...L.children].filter(($) => $.hasAttribute("s:pid")).map(($) => ({ pin: $.getAttribute("s:pid"), x: W.e + Number($.getAttribute("s:x")), y: W.f + Number($.getAttribute("s:y")), bit: R.connections[$.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const ne = new Map(Object.values(j.nodes).map((J) => [J.name, J.bit])), ee = [...c.children].filter((J) => J.localName === "line" && J.hasAttribute("data-net")).map((J) => ({ bit: ne.get(J.dataset.net), a: { x: +J.getAttribute("x1"), y: +J.getAttribute("y1") }, b: { x: +J.getAttribute("x2"), y: +J.getAttribute("y2") } }));
      i = new On(V, { step: E, segments: ee }), w = JSON.stringify([j.topology.signature, X]), !G && x.has(w) ? i.restore(x.get(w)) : e("flywire").checked && i.clear(), a = e("interactive").checked, a || !G && x.has(w) || e("flywire").checked ? H() : U();
    },
    invalidate() {
      y++, f = !1, i = null, c = null, h = null, u = null, U();
    },
    setEnabled(_) {
      a = _, _ || (h = null), i ? H() : U();
    },
    clear() {
      i && (i.clear(), h = null, H());
    },
    autoRoute: A,
    chooseTool: p,
    undo() {
      i && (h = null, i.undo(), H());
    },
    redo() {
      i && (h = null, i.redo(), H());
    },
    complete() {
      return !i || !f && i.airwires().length === 0;
    },
    working() {
      return f;
    },
    stats: k,
    canEdit() {
      return !!i;
    },
    refreshColors() {
      if (c) {
        for (const _ of c.querySelectorAll("[data-air-net]")) _.setAttribute("stroke", M(+_.dataset.airNet));
        for (const _ of c.querySelectorAll("[data-editor-bit]")) _.setAttribute("stroke", M(+_.dataset.editorBit));
      }
    },
    cleanExport(_) {
      for (const P of _.querySelectorAll("[data-editor-overlay],[data-route-preview]")) P.remove();
      for (const P of _.querySelectorAll("[data-editor-component]"))
        P.removeAttribute("data-editor-component"), P.style.removeProperty("opacity");
    }
  };
}
const Ke = 4, Le = "http://www.w3.org/2000/svg";
function Me(t, e, n = !0, o = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), i = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(Le, "defs"), r.dataset.coordinateGrid = "true";
    const y = document.createElementNS(Le, "pattern");
    y.id = "spice-coordinate-grid", y.setAttribute("patternUnits", "userSpaceOnUse");
    const w = document.createElementNS(Le, "path");
    w.setAttribute("fill", "none"), w.setAttribute("stroke", "#737b83"), w.setAttribute("stroke-opacity", ".23"), w.setAttribute("stroke-width", ".55"), w.setAttribute("vector-effect", "non-scaling-stroke"), y.append(w), r.append(y), i = document.createElementNS(Le, "rect"), i.dataset.coordinateGrid = "true", i.setAttribute("fill", "url(#spice-coordinate-grid)"), i.setAttribute("stroke", "none"), i.setAttribute("pointer-events", "none"), t.prepend(i), t.prepend(r);
  }
  const c = r.firstElementChild, a = e || 8;
  c.setAttribute("width", a), c.setAttribute("height", a), c.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), i.setAttribute("visibility", n && e ? "visible" : "hidden");
  let f = c.querySelector("[data-minor-grid]");
  f || (f = c.firstElementChild.cloneNode(), f.setAttribute("data-minor-grid", "true"), f.setAttribute("stroke-opacity", ".08"), c.append(f));
  const h = [];
  for (let y = Ke; y < a; y += Ke) h.push(`M${y},0 V${a} M0,${y} H${a}`);
  f.setAttribute("d", h.join(" ")), t.dataset.displayGridStep = String(a);
  let u = o;
  const g = t.closest(".spice-preview"), d = t.isConnected && g ? t.getScreenCTM() : null;
  if (d) {
    const y = g.getBoundingClientRect(), w = d.inverse(), E = [[y.left - 1, y.top - 1], [y.right + 1, y.top - 1], [y.right + 1, y.bottom + 1], [y.left - 1, y.bottom + 1]].map(([b, v]) => new DOMPoint(b, v).matrixTransform(w)), I = Math.min(...E.map((b) => b.x)), x = Math.min(...E.map((b) => b.y));
    u = { x: I, y: x, w: Math.max(...E.map((b) => b.x)) - I, h: Math.max(...E.map((b) => b.y)) - x };
  }
  if (!u) {
    const y = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    u = { x: y[0], y: y[1], w: y[2], h: y[3] };
  }
  for (const [y, w] of Object.entries({ x: u.x, y: u.y, width: u.w, height: u.h })) i.setAttribute(y, w);
}
const Mn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 2v20" />
  <path d="m15 19-3 3-3-3" />
  <path d="m19 9 3 3-3 3" />
  <path d="M2 12h20" />
  <path d="m5 9-3 3 3 3" />
  <path d="m9 5 3-3 3 3" />
</svg>
`, Pn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
</svg>
`, Dn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
</svg>
`, Un = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
</svg>
`, Bn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
</svg>
`, Vn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
</svg>
`, jn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
</svg>
`, Qn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="8" x2="14" y1="11" y2="11" />
</svg>
`, Fn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
</svg>
`, Gn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
</svg>
`, Hn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
</svg>
`, Wn = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`, Qe = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, $n = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`;
function qn(t) {
  const e = { move: Mn, route: Pn, erase: Dn, rotate: Un, "mirror-x": Bn, "mirror-y": Vn }, n = { "zoom-in": jn, "zoom-out": Qn, fit: Fn, "wire-undo": Gn, "wire-redo": Hn, "auto-route": Wn, "pin-editor": Qe, "pin-info": Qe, "pin-details": Qe, fullscreen: $n }, o = (r, i) => {
    if (!r) return;
    const c = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", c), r.title = c, r.innerHTML = i, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  for (const [r, i] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${r}"]`), i);
  for (const [r, i] of Object.entries(n)) o(t.querySelector("#spice-" + r), i);
}
function Xn(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function o() {
      var r = !1;
      try {
        r = this instanceof o;
      } catch {
      }
      return r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(o) {
    var r = Object.getOwnPropertyDescriptor(t, o);
    Object.defineProperty(n, o, r.get ? r : {
      enumerable: !0,
      get: function() {
        return t[o];
      }
    });
  }), n;
}
var Fe = {};
const zn = {}, Yn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: zn
}, Symbol.toStringTag, { value: "Module" })), Kn = /* @__PURE__ */ Xn(Yn);
var pt;
function Zn() {
  return pt || (pt = 1, (function(t) {
    (function(e) {
      e.parser = function(l, s) {
        return new o(l, s);
      }, e.SAXParser = o, e.SAXStream = g, e.createStream = h, e.MAX_BUFFER_LENGTH = 64 * 1024;
      var n = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      e.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function o(l, s) {
        if (!(this instanceof o))
          return new o(l, s);
        var S = this;
        i(S), S.q = S.c = "", S.bufferCheckPosition = e.MAX_BUFFER_LENGTH, S.encoding = null, S.opt = s || {}, S.opt.lowercase = S.opt.lowercase || S.opt.lowercasetags, S.looseCase = S.opt.lowercase ? "toLowerCase" : "toUpperCase", S.opt.maxEntityCount = S.opt.maxEntityCount || 512, S.opt.maxEntityDepth = S.opt.maxEntityDepth || 4, S.entityCount = S.entityDepth = 0, S.tags = [], S.closed = S.closedRoot = S.sawRoot = !1, S.tag = S.error = null, S.strict = !!l, S.noscript = !!(l || S.opt.noscript), S.state = p.BEGIN, S.strictEntities = S.opt.strictEntities, S.ENTITIES = S.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), S.attribList = [], S.opt.xmlns && (S.ns = Object.create(I)), S.opt.unquotedAttributeValues === void 0 && (S.opt.unquotedAttributeValues = !l), S.trackPosition = S.opt.position !== !1, S.trackPosition && (S.position = S.line = S.column = 0), q(S, "onready");
      }
      Object.create || (Object.create = function(l) {
        function s() {
        }
        s.prototype = l;
        var S = new s();
        return S;
      }), Object.keys || (Object.keys = function(l) {
        var s = [];
        for (var S in l) l.hasOwnProperty(S) && s.push(S);
        return s;
      });
      function r(l) {
        for (var s = Math.max(e.MAX_BUFFER_LENGTH, 10), S = 0, N = 0, te = n.length; N < te; N++) {
          var B = l[n[N]].length;
          if (B > s)
            switch (n[N]) {
              case "textNode":
                j(l);
                break;
              case "cdata":
                P(l, "oncdata", l.cdata), l.cdata = "";
                break;
              case "script":
                P(l, "onscript", l.script), l.script = "";
                break;
              default:
                X(l, "Max buffer length exceeded: " + n[N]);
            }
          S = Math.max(S, B);
        }
        var Y = e.MAX_BUFFER_LENGTH - S;
        l.bufferCheckPosition = Y + l.position;
      }
      function i(l) {
        for (var s = 0, S = n.length; s < S; s++)
          l[n[s]] = "";
      }
      function c(l) {
        j(l), l.cdata !== "" && (P(l, "oncdata", l.cdata), l.cdata = ""), l.script !== "" && (P(l, "onscript", l.script), l.script = "");
      }
      o.prototype = {
        end: function() {
          G(this);
        },
        write: ge,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          c(this);
        }
      };
      var a;
      try {
        a = Kn.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var f = e.EVENTS.filter(function(l) {
        return l !== "error" && l !== "end";
      });
      function h(l, s) {
        return new g(l, s);
      }
      function u(l, s) {
        if (l.length >= 2) {
          if (l[0] === 255 && l[1] === 254)
            return "utf-16le";
          if (l[0] === 254 && l[1] === 255)
            return "utf-16be";
        }
        return l.length >= 3 && l[0] === 239 && l[1] === 187 && l[2] === 191 ? "utf8" : l.length >= 4 ? l[0] === 60 && l[1] === 0 && l[2] === 63 && l[3] === 0 ? "utf-16le" : l[0] === 0 && l[1] === 60 && l[2] === 0 && l[3] === 63 ? "utf-16be" : "utf8" : s ? "utf8" : null;
      }
      function g(l, s) {
        if (!(this instanceof g))
          return new g(l, s);
        a.apply(this), this._parser = new o(l, s), this.writable = !0, this.readable = !0;
        var S = this;
        this._parser.onend = function() {
          S.emit("end");
        }, this._parser.onerror = function(N) {
          S.emit("error", N), S._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, f.forEach(function(N) {
          Object.defineProperty(S, "on" + N, {
            get: function() {
              return S._parser["on" + N];
            },
            set: function(te) {
              if (!te)
                return S.removeAllListeners(N), S._parser["on" + N] = te, te;
              S.on(N, te);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      g.prototype = Object.create(a.prototype, {
        constructor: {
          value: g
        }
      }), g.prototype._decodeBuffer = function(l, s) {
        if (this._decoderBuffer && (l = Buffer.concat([this._decoderBuffer, l]), this._decoderBuffer = null), !this._decoder) {
          var S = u(l, s);
          if (!S)
            return this._decoderBuffer = l, "";
          this._parser.encoding = S, this._decoder = new TextDecoder(S);
        }
        return this._decoder.decode(l, { stream: !s });
      }, g.prototype.write = function(l) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(l))
          l = this._decodeBuffer(l, !1);
        else if (this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        }
        return this._parser.write(l.toString()), this.emit("data", l), !0;
      }, g.prototype.end = function(l) {
        if (l && l.length && this.write(l), this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        } else if (this._decoder) {
          var S = this._decoder.decode();
          S && (this._parser.write(S), this.emit("data", S));
        }
        return this._parser.end(), !0;
      }, g.prototype.on = function(l, s) {
        var S = this;
        return !S._parser["on" + l] && f.indexOf(l) !== -1 && (S._parser["on" + l] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, l), S.emit.apply(S, N);
        }), a.prototype.on.call(S, l, s);
      };
      var d = /^\[CDATA\[$/i, y = /^DOCTYPE$/i, w = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", I = { xml: w, xmlns: E }, x = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, b = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, v = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function M(l) {
        return l === " " || l === `
` || l === "\r" || l === "	";
      }
      function C(l) {
        return l === '"' || l === "'";
      }
      function k(l) {
        return l === ">" || M(l);
      }
      function U(l, s) {
        return l.test(s);
      }
      function m(l, s) {
        return !U(l, s);
      }
      var p = 0;
      e.STATE = {
        BEGIN: p++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: p++,
        // leading whitespace
        TEXT: p++,
        // general stuff
        TEXT_ENTITY: p++,
        // &amp and such.
        OPEN_WAKA: p++,
        // <
        SGML_DECL: p++,
        // <!BLARG
        SGML_DECL_QUOTED: p++,
        // <!BLARG foo "bar
        DOCTYPE: p++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: p++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: p++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: p++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: p++,
        // <!-
        COMMENT: p++,
        // <!--
        COMMENT_ENDING: p++,
        // <!-- blah -
        COMMENT_ENDED: p++,
        // <!-- blah --
        CDATA: p++,
        // <![CDATA[ something
        CDATA_ENDING: p++,
        // ]
        CDATA_ENDING_2: p++,
        // ]]
        PROC_INST: p++,
        // <?hi
        PROC_INST_BODY: p++,
        // <?hi there
        PROC_INST_ENDING: p++,
        // <?hi "there" ?
        OPEN_TAG: p++,
        // <strong
        OPEN_TAG_SLASH: p++,
        // <strong /
        ATTRIB: p++,
        // <a
        ATTRIB_NAME: p++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: p++,
        // <a foo _
        ATTRIB_VALUE: p++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: p++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: p++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: p++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: p++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: p++,
        // <foo bar=&quot
        CLOSE_TAG: p++,
        // </a
        CLOSE_TAG_SAW_WHITE: p++,
        // </a   >
        SCRIPT: p++,
        // <script> ...
        SCRIPT_ENDING: p++
        // <script> ... <
      }, e.XML_ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }), e.ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }), Object.keys(e.ENTITIES).forEach(function(l) {
        var s = e.ENTITIES[l], S = typeof s == "number" ? String.fromCharCode(s) : s;
        e.ENTITIES[l] = S;
      });
      for (var D in e.STATE)
        e.STATE[e.STATE[D]] = D;
      p = e.STATE;
      function q(l, s, S) {
        l[s] && l[s](S);
      }
      function H(l) {
        var s = l && l.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return s ? s[2] : null;
      }
      function K(l) {
        return l ? l.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function A(l, s) {
        const S = K(l), N = K(s);
        return !S || !N ? !0 : N === "utf16" ? S === "utf16le" || S === "utf16be" : S === N;
      }
      function _(l, s) {
        if (!(!l.strict || !l.encoding || !s || s.name !== "xml")) {
          var S = H(s.body);
          S && !A(l.encoding, S) && V(
            l,
            "XML declaration encoding " + S + " does not match detected stream encoding " + l.encoding.toUpperCase()
          );
        }
      }
      function P(l, s, S) {
        l.textNode && j(l), q(l, s, S);
      }
      function j(l) {
        l.textNode = F(l.opt, l.textNode), l.textNode && q(l, "ontext", l.textNode), l.textNode = "";
      }
      function F(l, s) {
        return l.trim && (s = s.trim()), l.normalize && (s = s.replace(/\s+/g, " ")), s;
      }
      function X(l, s) {
        return j(l), l.trackPosition && (s += `
Line: ` + l.line + `
Column: ` + l.column + `
Char: ` + l.c), s = new Error(s), l.error = s, q(l, "onerror", s), l;
      }
      function G(l) {
        return l.sawRoot && !l.closedRoot && V(l, "Unclosed root tag"), l.state !== p.BEGIN && l.state !== p.BEGIN_WHITESPACE && l.state !== p.TEXT && X(l, "Unexpected end"), j(l), l.c = "", l.closed = !0, q(l, "onend"), o.call(l, l.strict, l.opt), l;
      }
      function V(l, s) {
        if (typeof l != "object" || !(l instanceof o))
          throw new Error("bad call to strictFail");
        l.strict && X(l, s);
      }
      function ne(l) {
        l.strict || (l.tagName = l.tagName[l.looseCase]());
        var s = l.tags[l.tags.length - 1] || l, S = l.tag = { name: l.tagName, attributes: {} };
        l.opt.xmlns && (S.ns = s.ns), l.attribList.length = 0, P(l, "onopentagstart", S);
      }
      function ee(l, s) {
        var S = l.indexOf(":"), N = S < 0 ? ["", l] : l.split(":"), te = N[0], B = N[1];
        return s && l === "xmlns" && (te = "xmlns", B = ""), { prefix: te, local: B };
      }
      function J(l) {
        if (l.strict || (l.attribName = l.attribName[l.looseCase]()), l.attribList.indexOf(l.attribName) !== -1 || l.tag.attributes.hasOwnProperty(l.attribName)) {
          l.attribName = l.attribValue = "";
          return;
        }
        if (l.opt.xmlns) {
          var s = ee(l.attribName, !0), S = s.prefix, N = s.local;
          if (S === "xmlns")
            if (N === "xml" && l.attribValue !== w)
              V(
                l,
                "xml: prefix must be bound to " + w + `
Actual: ` + l.attribValue
              );
            else if (N === "xmlns" && l.attribValue !== E)
              V(
                l,
                "xmlns: prefix must be bound to " + E + `
Actual: ` + l.attribValue
              );
            else {
              var te = l.tag, B = l.tags[l.tags.length - 1] || l;
              te.ns === B.ns && (te.ns = Object.create(B.ns)), te.ns[N] = l.attribValue;
            }
          l.attribList.push([l.attribName, l.attribValue]);
        } else
          l.tag.attributes[l.attribName] = l.attribValue, P(l, "onattribute", {
            name: l.attribName,
            value: l.attribValue
          });
        l.attribName = l.attribValue = "";
      }
      function R(l, s) {
        if (l.opt.xmlns) {
          var S = l.tag, N = ee(l.tagName);
          S.prefix = N.prefix, S.local = N.local, S.uri = S.ns[N.prefix] || "", S.prefix && !S.uri && (V(
            l,
            "Unbound namespace prefix: " + JSON.stringify(l.tagName)
          ), S.uri = N.prefix);
          var te = l.tags[l.tags.length - 1] || l;
          S.ns && te.ns !== S.ns && Object.keys(S.ns).forEach(function(ke) {
            P(l, "onopennamespace", {
              prefix: ke,
              uri: S.ns[ke]
            });
          });
          for (var B = 0, Y = l.attribList.length; B < Y; B++) {
            var re = l.attribList[B], ce = re[0], de = re[1], ae = ee(ce, !0), he = ae.prefix, Oe = ae.local, Te = he === "" ? "" : S.ns[he] || "", we = {
              name: ce,
              value: de,
              prefix: he,
              local: Oe,
              uri: Te
            };
            he && he !== "xmlns" && !Te && (V(
              l,
              "Unbound namespace prefix: " + JSON.stringify(he)
            ), we.uri = he), l.tag.attributes[ce] = we, P(l, "onattribute", we);
          }
          l.attribList.length = 0;
        }
        l.tag.isSelfClosing = !!s, l.sawRoot = !0, l.tags.push(l.tag), P(l, "onopentag", l.tag), s || (!l.noscript && l.tagName.toLowerCase() === "script" ? l.state = p.SCRIPT : l.state = p.TEXT, l.tag = null, l.tagName = ""), l.attribName = l.attribValue = "", l.attribList.length = 0;
      }
      function L(l) {
        if (!l.tagName) {
          V(l, "Weird empty close tag."), l.textNode += "</>", l.state = p.TEXT;
          return;
        }
        if (l.script) {
          if (l.tagName !== "script") {
            l.script += "</" + l.tagName + ">", l.tagName = "", l.state = p.SCRIPT;
            return;
          }
          P(l, "onscript", l.script), l.script = "";
        }
        var s = l.tags.length, S = l.tagName;
        l.strict || (S = S[l.looseCase]());
        for (var N = S; s--; ) {
          var te = l.tags[s];
          if (te.name !== N)
            V(l, "Unexpected close tag");
          else
            break;
        }
        if (s < 0) {
          V(l, "Unmatched closing tag: " + l.tagName), l.textNode += "</" + l.tagName + ">", l.state = p.TEXT;
          return;
        }
        l.tagName = S;
        for (var B = l.tags.length; B-- > s; ) {
          var Y = l.tag = l.tags.pop();
          l.tagName = l.tag.name, P(l, "onclosetag", l.tagName);
          var re = {};
          for (var ce in Y.ns)
            re[ce] = Y.ns[ce];
          var de = l.tags[l.tags.length - 1] || l;
          l.opt.xmlns && Y.ns !== de.ns && Object.keys(Y.ns).forEach(function(ae) {
            var he = Y.ns[ae];
            P(l, "onclosenamespace", { prefix: ae, uri: he });
          });
        }
        s === 0 && (l.closedRoot = !0), l.tagName = l.attribValue = l.attribName = "", l.attribList.length = 0, l.state = p.TEXT;
      }
      function W(l) {
        var s = l.entity, S = s.toLowerCase(), N, te = "";
        return l.ENTITIES[s] ? l.ENTITIES[s] : l.ENTITIES[S] ? l.ENTITIES[S] : (s = S, s.charAt(0) === "#" && (s.charAt(1) === "x" ? (s = s.slice(2), N = parseInt(s, 16), te = N.toString(16)) : (s = s.slice(1), N = parseInt(s, 10), te = N.toString(10))), s = s.replace(/^0+/, ""), isNaN(N) || te.toLowerCase() !== s || N < 0 || N > 1114111 || !$(N) ? (V(l, "Invalid character entity"), "&" + l.entity + ";") : String.fromCodePoint(N));
      }
      function $(l) {
        return l === 9 || l === 10 || l === 13 || l >= 32 && l <= 55295 || l >= 57344 && l <= 65533 || l >= 65536 && l <= 1114111;
      }
      function Z(l, s) {
        s === "<" ? (l.state = p.OPEN_WAKA, l.startTagPosition = l.position) : M(s) || (V(l, "Non-whitespace before first tag."), l.textNode = s, l.state = p.TEXT);
      }
      function z(l, s) {
        var S = "";
        return s < l.length && (S = l.charAt(s)), S;
      }
      function ge(l) {
        var s = this;
        if (this.error)
          throw this.error;
        if (s.closed)
          return X(
            s,
            "Cannot write after close. Assign an onready handler."
          );
        if (l === null)
          return G(s);
        typeof l == "object" && (l = l.toString());
        for (var S = 0, N = ""; N = z(l, S++), s.c = N, !!N; )
          switch (s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++), s.state) {
            case p.BEGIN:
              if (s.state = p.BEGIN_WHITESPACE, N === "\uFEFF")
                continue;
              Z(s, N);
              continue;
            case p.BEGIN_WHITESPACE:
              Z(s, N);
              continue;
            case p.TEXT:
              if (s.sawRoot && !s.closedRoot) {
                for (var B = S - 1; N && N !== "<" && N !== "&"; )
                  N = z(l, S++), N && s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++);
                s.textNode += l.substring(B, S - 1);
              }
              N === "<" && !(s.sawRoot && s.closedRoot && !s.strict) ? (s.state = p.OPEN_WAKA, s.startTagPosition = s.position) : (!M(N) && (!s.sawRoot || s.closedRoot) && V(s, "Text data outside of root node."), N === "&" ? s.state = p.TEXT_ENTITY : s.textNode += N);
              continue;
            case p.SCRIPT:
              N === "<" ? s.state = p.SCRIPT_ENDING : s.script += N;
              continue;
            case p.SCRIPT_ENDING:
              N === "/" ? s.state = p.CLOSE_TAG : (s.script += "<" + N, s.state = p.SCRIPT);
              continue;
            case p.OPEN_WAKA:
              if (N === "!")
                s.state = p.SGML_DECL, s.sgmlDecl = "";
              else if (!M(N)) if (U(x, N))
                s.state = p.OPEN_TAG, s.tagName = N;
              else if (N === "/")
                s.state = p.CLOSE_TAG, s.tagName = "";
              else if (N === "?")
                s.state = p.PROC_INST, s.procInstName = s.procInstBody = "";
              else {
                if (V(s, "Unencoded <"), s.startTagPosition + 1 < s.position) {
                  var te = s.position - s.startTagPosition;
                  N = new Array(te).join(" ") + N;
                }
                s.textNode += "<" + N, s.state = p.TEXT;
              }
              continue;
            case p.SGML_DECL:
              if (s.sgmlDecl + N === "--") {
                s.state = p.COMMENT, s.comment = "", s.sgmlDecl = "";
                continue;
              }
              s.doctype && s.doctype !== !0 && s.sgmlDecl ? (s.state = p.DOCTYPE_DTD, s.doctype += "<!" + s.sgmlDecl + N, s.sgmlDecl = "") : d.test(s.sgmlDecl + N) ? (P(s, "onopencdata"), s.state = p.CDATA, s.sgmlDecl = "", s.cdata = "") : y.test(s.sgmlDecl + N) ? (s.state = p.DOCTYPE, (s.doctype || s.sawRoot) && V(
                s,
                "Inappropriately located doctype declaration"
              ), s.doctype = "", s.sgmlDecl = "") : N === ">" ? (P(s, "onsgmldeclaration", s.sgmlDecl), s.sgmlDecl = "", s.state = p.TEXT) : (C(N) && (s.state = p.SGML_DECL_QUOTED), s.sgmlDecl += N);
              continue;
            case p.SGML_DECL_QUOTED:
              N === s.q && (s.state = p.SGML_DECL, s.q = ""), s.sgmlDecl += N;
              continue;
            case p.DOCTYPE:
              N === ">" ? (s.state = p.TEXT, P(s, "ondoctype", s.doctype), s.doctype = !0) : (s.doctype += N, N === "[" ? s.state = p.DOCTYPE_DTD : C(N) && (s.state = p.DOCTYPE_QUOTED, s.q = N));
              continue;
            case p.DOCTYPE_QUOTED:
              s.doctype += N, N === s.q && (s.q = "", s.state = p.DOCTYPE);
              continue;
            case p.DOCTYPE_DTD:
              N === "]" ? (s.doctype += N, s.state = p.DOCTYPE) : N === "<" ? (s.state = p.OPEN_WAKA, s.startTagPosition = s.position) : C(N) ? (s.doctype += N, s.state = p.DOCTYPE_DTD_QUOTED, s.q = N) : s.doctype += N;
              continue;
            case p.DOCTYPE_DTD_QUOTED:
              s.doctype += N, N === s.q && (s.state = p.DOCTYPE_DTD, s.q = "");
              continue;
            case p.COMMENT:
              N === "-" ? s.state = p.COMMENT_ENDING : s.comment += N;
              continue;
            case p.COMMENT_ENDING:
              N === "-" ? (s.state = p.COMMENT_ENDED, s.comment = F(s.opt, s.comment), s.comment && P(s, "oncomment", s.comment), s.comment = "") : (s.comment += "-" + N, s.state = p.COMMENT);
              continue;
            case p.COMMENT_ENDED:
              N !== ">" ? (V(s, "Malformed comment"), s.comment += "--" + N, s.state = p.COMMENT) : s.doctype && s.doctype !== !0 ? s.state = p.DOCTYPE_DTD : s.state = p.TEXT;
              continue;
            case p.CDATA:
              for (var B = S - 1; N && N !== "]"; )
                N = z(l, S++), N && s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++);
              s.cdata += l.substring(B, S - 1), N === "]" && (s.state = p.CDATA_ENDING);
              continue;
            case p.CDATA_ENDING:
              N === "]" ? s.state = p.CDATA_ENDING_2 : (s.cdata += "]" + N, s.state = p.CDATA);
              continue;
            case p.CDATA_ENDING_2:
              N === ">" ? (s.cdata && P(s, "oncdata", s.cdata), P(s, "onclosecdata"), s.cdata = "", s.state = p.TEXT) : N === "]" ? s.cdata += "]" : (s.cdata += "]]" + N, s.state = p.CDATA);
              continue;
            case p.PROC_INST:
              N === "?" ? s.state = p.PROC_INST_ENDING : M(N) ? s.state = p.PROC_INST_BODY : s.procInstName += N;
              continue;
            case p.PROC_INST_BODY:
              if (!s.procInstBody && M(N))
                continue;
              N === "?" ? s.state = p.PROC_INST_ENDING : s.procInstBody += N;
              continue;
            case p.PROC_INST_ENDING:
              if (N === ">") {
                const de = {
                  name: s.procInstName,
                  body: s.procInstBody
                };
                _(s, de), P(s, "onprocessinginstruction", de), s.procInstName = s.procInstBody = "", s.state = p.TEXT;
              } else
                s.procInstBody += "?" + N, s.state = p.PROC_INST_BODY;
              continue;
            case p.OPEN_TAG:
              U(b, N) ? s.tagName += N : (ne(s), N === ">" ? R(s) : N === "/" ? s.state = p.OPEN_TAG_SLASH : (M(N) || V(s, "Invalid character in tag name"), s.state = p.ATTRIB));
              continue;
            case p.OPEN_TAG_SLASH:
              N === ">" ? (R(s, !0), L(s)) : (V(
                s,
                "Forward-slash in opening tag not followed by >"
              ), s.state = p.ATTRIB);
              continue;
            case p.ATTRIB:
              if (M(N))
                continue;
              N === ">" ? R(s) : N === "/" ? s.state = p.OPEN_TAG_SLASH : U(x, N) ? (s.attribName = N, s.attribValue = "", s.state = p.ATTRIB_NAME) : V(s, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME:
              N === "=" ? s.state = p.ATTRIB_VALUE : N === ">" ? (V(s, "Attribute without value"), s.attribValue = s.attribName, J(s), R(s)) : M(N) ? s.state = p.ATTRIB_NAME_SAW_WHITE : U(b, N) ? s.attribName += N : V(s, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME_SAW_WHITE:
              if (N === "=")
                s.state = p.ATTRIB_VALUE;
              else {
                if (M(N))
                  continue;
                V(s, "Attribute without value"), s.tag.attributes[s.attribName] = "", s.attribValue = "", P(s, "onattribute", {
                  name: s.attribName,
                  value: ""
                }), s.attribName = "", N === ">" ? R(s) : U(x, N) ? (s.attribName = N, s.state = p.ATTRIB_NAME) : (V(s, "Invalid attribute name"), s.state = p.ATTRIB);
              }
              continue;
            case p.ATTRIB_VALUE:
              if (M(N))
                continue;
              C(N) ? (s.q = N, s.state = p.ATTRIB_VALUE_QUOTED) : (s.opt.unquotedAttributeValues || X(s, "Unquoted attribute value"), s.state = p.ATTRIB_VALUE_UNQUOTED, s.attribValue = N);
              continue;
            case p.ATTRIB_VALUE_QUOTED:
              if (N !== s.q) {
                N === "&" ? s.state = p.ATTRIB_VALUE_ENTITY_Q : s.attribValue += N;
                continue;
              }
              J(s), s.q = "", s.state = p.ATTRIB_VALUE_CLOSED;
              continue;
            case p.ATTRIB_VALUE_CLOSED:
              M(N) ? s.state = p.ATTRIB : N === ">" ? R(s) : N === "/" ? s.state = p.OPEN_TAG_SLASH : U(x, N) ? (V(s, "No whitespace between attributes"), s.attribName = N, s.attribValue = "", s.state = p.ATTRIB_NAME) : V(s, "Invalid attribute name");
              continue;
            case p.ATTRIB_VALUE_UNQUOTED:
              if (!k(N)) {
                N === "&" ? s.state = p.ATTRIB_VALUE_ENTITY_U : s.attribValue += N;
                continue;
              }
              J(s), N === ">" ? R(s) : s.state = p.ATTRIB;
              continue;
            case p.CLOSE_TAG:
              if (s.tagName)
                N === ">" ? L(s) : U(b, N) ? s.tagName += N : s.script ? (s.script += "</" + s.tagName + N, s.tagName = "", s.state = p.SCRIPT) : (M(N) || V(s, "Invalid tagname in closing tag"), s.state = p.CLOSE_TAG_SAW_WHITE);
              else {
                if (M(N))
                  continue;
                m(x, N) ? s.script ? (s.script += "</" + N, s.state = p.SCRIPT) : V(s, "Invalid tagname in closing tag.") : s.tagName = N;
              }
              continue;
            case p.CLOSE_TAG_SAW_WHITE:
              if (M(N))
                continue;
              N === ">" ? L(s) : V(s, "Invalid characters in closing tag");
              continue;
            case p.TEXT_ENTITY:
            case p.ATTRIB_VALUE_ENTITY_Q:
            case p.ATTRIB_VALUE_ENTITY_U:
              var Y, re;
              switch (s.state) {
                case p.TEXT_ENTITY:
                  Y = p.TEXT, re = "textNode";
                  break;
                case p.ATTRIB_VALUE_ENTITY_Q:
                  Y = p.ATTRIB_VALUE_QUOTED, re = "attribValue";
                  break;
                case p.ATTRIB_VALUE_ENTITY_U:
                  Y = p.ATTRIB_VALUE_UNQUOTED, re = "attribValue";
                  break;
              }
              if (N === ";") {
                var ce = W(s);
                s.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(ce) ? ((s.entityCount += 1) > s.opt.maxEntityCount && X(
                  s,
                  "Parsed entity count exceeds max entity count"
                ), (s.entityDepth += 1) > s.opt.maxEntityDepth && X(
                  s,
                  "Parsed entity depth exceeds max entity depth"
                ), s.entity = "", s.state = Y, s.write(ce), s.entityDepth -= 1) : (s[re] += ce, s.entity = "", s.state = Y);
              } else U(s.entity.length ? T : v, N) ? s.entity += N : (V(s, "Invalid character in entity name"), s[re] += "&" + s.entity + N, s.entity = "", s.state = Y);
              continue;
            default:
              throw new Error(s, "Unknown state: " + s.state);
          }
        return s.position >= s.bufferCheckPosition && r(s), s;
      }
      String.fromCodePoint || (function() {
        var l = String.fromCharCode, s = Math.floor, S = function() {
          var N = 16384, te = [], B, Y, re = -1, ce = arguments.length;
          if (!ce)
            return "";
          for (var de = ""; ++re < ce; ) {
            var ae = Number(arguments[re]);
            if (!isFinite(ae) || // `NaN`, `+Infinity`, or `-Infinity`
            ae < 0 || // not a valid Unicode code point
            ae > 1114111 || // not a valid Unicode code point
            s(ae) !== ae)
              throw RangeError("Invalid code point: " + ae);
            ae <= 65535 ? te.push(ae) : (ae -= 65536, B = (ae >> 10) + 55296, Y = ae % 1024 + 56320, te.push(B, Y)), (re + 1 === ce || te.length > N) && (de += l.apply(null, te), te.length = 0);
          }
          return de;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: S,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = S;
      })();
    })(t);
  })(Fe)), Fe;
}
var Ge, ht;
function Jn() {
  if (ht) return Ge;
  ht = 1;
  var t = Zn().parser;
  function e(n) {
    var o = [], r = [], i = o, c;
    return c = t(!0), c.ontext = function(a) {
      a.trim() !== "" && i.push(a);
    }, c.onopentag = function(a) {
      var f;
      f = [a.name, a.attributes], r.push(i), i.push(f), i = f;
    }, c.onclosetag = function() {
      i = r.pop();
    }, c.write(n).close(), o[0];
  }
  return Ge = e, Ge;
}
var He, mt;
function er() {
  if (mt) return He;
  mt = 1;
  function t(e, n) {
    var o = function() {
    }, r = o, i = o;
    function c() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function f(g) {
      this._name = g;
    }
    function h(g) {
      this._replace = g;
    }
    function u(g, d) {
      var y, w = { attr: {}, full: g }, E = {
        name: f,
        skip: c,
        // break: breakFn,
        remove: a,
        replace: h,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, I = !0, x, b, v;
      if (g !== void 0 && g !== null && g !== !0 && g !== !1)
        switch (y = Object.prototype.toString.call(g), y) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (g.some(function(T, M) {
              if (M === 0)
                return w.name = T, !1;
              if (M === 1)
                return Object.prototype.toString.call(T) === "[object Object]" && (I = !1, w.attr = T), !0;
            }), r.call(E, w, d), E._name && (g[0] = E._name), E._replace)
              return E._replace;
            if (E._remove)
              return null;
            if (!E._skip) {
              for (x = 0, b = g.length; x < b; ) {
                if (x > 1 || x === 1 && I) {
                  if (v = u(g[x], w), v === null) {
                    g.splice(x, 1), b -= 1;
                    continue;
                  }
                  v && (g[x] = v);
                }
                x += 1;
              }
              if (i.call(E, w, d), E._name && (g[0] = E._name), E._replace)
                return E._replace;
              if (E._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (i = n.leave)), u(e, void 0);
  }
  return He = t, He;
}
var We, gt;
function tr() {
  if (gt) return We;
  gt = 1;
  const t = Jn(), e = er(), n = (r) => String(r).replace(/[&<>"']/g, (i) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[i]);
  function o(r) {
    const [i, ...c] = r, a = c[0] && typeof c[0] == "object" && !Array.isArray(c[0]) ? c.shift() : {}, f = "<" + i + Object.entries(a).map(([h, u]) => " " + h + '="' + n(u) + '"').join("");
    return c.length ? f + ">" + c.map((h) => Array.isArray(h) ? o(h) : n(h)).join("") + "</" + i + ">" : f + "/>";
  }
  return We = { parse: t, p: t, traverse: e, t: e, stringify: o, s: o }, We;
}
tr();
const $e = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), nr = (t, e) => [...t].reduce((n, o) => n + (o.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function rr(t, e, n = 12) {
  const o = [], r = t.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }));
  for (const [c, a] of t.entries()) {
    if (!a.labels.length) continue;
    const f = Math.max(...a.labels.map((w) => nr(w.text, n))) + 4, h = a.labels.length * (n + 4), u = [];
    for (const w of [5, 14, 28, 48]) {
      const E = { x: a.x + (a.w - f) / 2, y: a.y - w - h, w: f, h }, I = { x: a.x + (a.w - f) / 2, y: a.y + a.h + w, w: f, h }, x = { x: a.x + a.w + w, y: a.y + (a.h - h) / 2, w: f, h }, b = { x: a.x - w - f, y: a.y + (a.h - h) / 2, w: f, h };
      u.push(...a.w > a.h ? [E, I, x, b] : [x, b, E, I]);
    }
    const g = (w) => e.reduce((E, I) => {
      const x = Math.min(I.a.x, I.b.x), b = Math.min(I.a.y, I.b.y), v = { x: x - 1, y: b - 1, w: Math.abs(I.a.x - I.b.x) + 2, h: Math.abs(I.a.y - I.b.y) + 2 };
      return E + $e(w, v) * 2;
    }, 0);
    let d = null, y = 1 / 0;
    for (const [w, E] of u.entries()) {
      const I = r.reduce((x, b, v) => x + (v === c ? 0 : $e(E, b)) * 500, 0) + o.reduce((x, b) => x + $e(E, b) * 100, 0) + g(E) + w * 3;
      I < y && (y = I, d = E);
    }
    a.labels.forEach((w, E) => {
      w.x = d.x - a.x, w.y = d.y - a.y + n + E * (n + 4);
    }), o.push(d);
  }
  const i = [...r, ...o];
  return { x: Math.min(0, ...i.map((c) => c.x)), y: Math.min(0, ...i.map((c) => c.y)), right: Math.max(0, ...i.map((c) => c.x + c.w)), bottom: Math.max(0, ...i.map((c) => c.y + c.h)) };
}
const or = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function ir(t, e = 12) {
  const n = [...t.children].filter((i) => i.localName === "g" && i.id.startsWith("cell_")).map((i) => ({ ...or(i.getAttribute("transform")), w: +i.getAttribute("s:width"), h: +i.getAttribute("s:height"), labels: [...i.children].filter((c) => c.localName === "text" && c.hasAttribute("data-layout-label")).map((c) => ({ node: c, text: c.textContent })) })), o = [...t.children].filter((i) => i.localName === "line" && i.hasAttribute("data-net")).map((i) => ({ a: { x: +i.getAttribute("x1"), y: +i.getAttribute("y1") }, b: { x: +i.getAttribute("x2"), y: +i.getAttribute("y2") } })), r = rr(n, o, e);
  for (const i of n) for (const c of i.labels)
    c.node.setAttribute("x", c.x), c.node.setAttribute("y", c.y), c.node.setAttribute("text-anchor", "start"), c.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
const bt = Pe.filter.source, Q = (t) => document.getElementById("spice-" + t), ye = Q("app");
if (ye) {
  let p = function() {
    const R = e.querySelector("svg");
    if (!R) return;
    const L = Number(R.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, W = ir(R, L), $ = Math.min(v.x, W.x - 20), Z = Math.min(v.y, W.y - 20);
    v = { x: $, y: Z, w: Math.max(v.x + v.w, W.right + 20) - $, h: Math.max(v.y + v.h, W.bottom + 20) - Z }, f && Cn(R, h, f), a?.refreshColors(), Me(R, m(), Q("show-grid").checked, b);
    const z = R.cloneNode(!0);
    a?.cleanExport(z), z.setAttribute("width", v.w), z.setAttribute("height", v.h), z.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), Me(z, m(), Q("show-grid").checked, v), u = new XMLSerializer().serializeToString(z), Q("source").value = u;
  }, H = function(R) {
    const L = Q("example-info");
    if (L && (L.replaceChildren(), !!R && (L.append(document.createTextNode(R.description + " ")), R.url))) {
      const W = document.createElement("a");
      W.href = R.url, W.target = "_blank", W.rel = "noopener noreferrer", W.textContent = R.reference, L.append(W);
    }
  }, K = function() {
    a.invalidate(), D.setEnabled(!1), r = null, i = null, u = "", k(), H(Object.values(Pe).find((R) => R.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, A = function(R) {
    o.replaceChildren();
    for (const { severity: L, line: W, message: $, source: Z } of R) {
      const z = document.createElement("li");
      z.className = L, z.textContent = `${L.toUpperCase()}${Z && Z !== "input.cir" ? " · " + Z : ""}${W ? " · line " + W : ""}: ${$}`, o.append(z);
    }
    Q("messages").open = R.some((L) => L.severity !== "info"), Q("message-count").textContent = `${R.length} message${R.length === 1 ? "" : "s"}`;
  }, _ = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    const R = e.querySelector("svg");
    R && Me(R, m(), Q("show-grid").checked, b), Q("zoom-level").textContent = Math.round(v.w / b.w * 100) + "%";
  }, j = function(R, L = b.x + b.w / 2, W = b.y + b.h / 2) {
    if (!e.querySelector("svg")) return;
    const $ = Math.max(0.05, Math.min(10, b.w * R / v.w)) * v.w / b.w;
    b = { x: L + (b.x - L) * $, y: W + (b.y - W) * $, w: b.w * $, h: b.h * $ }, _();
  }, X = function(R) {
    const L = new URLSearchParams();
    R && L.set("instance", R);
    const W = L.toString();
    location.hash.slice(1) === W ? (E = R, ee()) : location.hash = W;
  }, G = function() {
    E = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, V = function() {
    const R = !!(I && I !== E && d?.contexts[I]);
    Q("selection-actions").hidden = !R, Q("open-instance").href = "#" + new URLSearchParams({ instance: I });
  }, ne = function() {
    Q("breadcrumbs").replaceChildren();
    const R = (W, $) => {
      const Z = document.createElement("button");
      Z.type = "button", Z.textContent = W, Z.onclick = () => X($), Z.disabled = $ === E, Q("breadcrumbs").append(Z);
    };
    if (R("Top", ""), E) {
      const W = d.contexts[E].path;
      for (let $ = 0; $ < W.length; $++) R(W[$], W.slice(0, $ + 1).map(encodeURIComponent).join("/"));
    }
    Q("instances").replaceChildren();
    const L = (W, $) => {
      for (const Z of W.children) {
        const z = document.createElement("div");
        z.className = "spice-instance-row", z.style.setProperty("--depth", Math.min($, 8)), z.dataset.instance = Z.id;
        const ge = document.createElement("a");
        ge.href = "#" + new URLSearchParams({ instance: Z.id }), ge.textContent = Z.name + " · " + Z.definition, ge.title = "Open " + Z.id + " as its own sheet";
        const l = document.createElement("span");
        if (l.className = "spice-help", l.textContent = Object.entries(Z.params).map(([s, S]) => s + "=" + S).join(" · "), z.append(ge), l.textContent) {
          const s = document.createElement("details"), S = document.createElement("summary");
          S.textContent = "Parameters", s.append(S, l), z.append(s);
        }
        Q("instances").append(z), L(Z, $ + 1);
      }
    };
    L(d.contexts[E], 0), Q("hierarchy-panel").hidden = !d.contexts[E].children.length, Q("focus-title").textContent = E ? E + " / " + d.contexts[E].definition : "Top-level schematic", V();
  };
  qn(ye), Tn(ye);
  const t = Q("input"), e = Q("preview"), n = Q("status"), o = Q("diagnostics");
  let r = null, i = null, c = !1, a = null, f = null, h = [], u = "", g, d, y, w = "", E = "", I = "", x = !1, b = { x: 0, y: 0, w: 1, h: 1 }, v = { ...b }, T, M = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ye.addEventListener("click", (R) => {
    x && R.target.closest('a[href^="#"]') && R.preventDefault();
  });
  const k = () => {
    Q("copy").disabled = Q("download").disabled = !u || x || a?.working(), Q("download-asc").disabled = Q("download-asc-bundle").disabled = !u || !r || x || c || !a?.complete();
  }, U = () => ({ font: Q("font").value, fontSize: Number(Q("size").value), color: tt, gridSize: Q("grid").checked && Q("conventional").checked ? Ke : 0, detailed: Q("detailed").checked, conventional: Q("conventional").checked }), m = () => g?.layout.report?.gridSize ? Number(Q("grid-size").value) : 0, D = In(Q, (R, L) => {
    f = R, h = L, p();
  });
  a = Ln(e, Q, { getNetColor: (R) => {
    const L = h.find((W) => W.bit === R);
    return L && f && (f.auto || f.manual.has(L.name)) ? f.color(L.name) : null;
  }, inspect: (R) => {
    const L = g?.components.find((W) => W.name === R);
    L && (I = L.instanceId || "", Q("selection").textContent = L.raw, V());
  }, changed: (R, L, W) => {
    r = R, i = null, v = W;
    const $ = e.querySelector("svg");
    if ($) {
      $.setAttribute("width", String(v.w)), $.setAttribute("height", String(v.h));
      const Z = $.querySelector("#spice-layout-report");
      if (Z) {
        const z = JSON.parse(Z.textContent);
        z.manualWiring = L, z.verifiedTerminals = !L.unrouted, z.geometricConnectivityVerified = !L.unrouted, Z.textContent = JSON.stringify(z);
      }
    }
    g && y && (Q("json").value = JSON.stringify({ circuit: g, netlist: lt(g), hierarchy: y, interactive: { ...L, drawing: R } }, null, 2)), p(), k();
  } }), Q("show-grid").onchange = p, Q("grid-size").onchange = () => {
    p(), _();
  };
  async function q() {
    (!r || !g?.layout.report?.gridVerified) && (Q("grid").checked = !0, Q("conventional").checked = !0, await ee({ resetEditor: !0 })), a.setEnabled(Q("interactive").checked), k();
  }
  Q("interactive").onchange = q, Q("flywire").onchange = async () => {
    Q("interactive").checked = !0, await q(), Q("flywire").checked ? a.clear() : await a.autoRoute(), k();
  }, Q("auto-route").onclick = async () => {
    Q("interactive").checked = !0, await q(), await a.autoRoute(), k();
  }, Q("wire-undo").onclick = () => a.undo(), Q("wire-redo").onclick = () => a.redo();
  for (const R of ye.querySelectorAll("[data-editor-mode]")) R.onclick = async () => {
    Q("interactive").checked = !0, await q(), a.chooseTool(R.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  D.setEnabled(!1), t.value = bt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || bt;
  } catch {
  }
  H(Object.values(Pe).find((R) => R.source === t.value)), t.addEventListener("input", K);
  for (const R of ["font", "size", "detailed", "conventional", "grid"]) Q(R).addEventListener("input", K);
  new ResizeObserver(() => {
    const R = e.querySelector("svg");
    R && Me(R, m(), Q("show-grid").checked, b);
  }).observe(e), Q("zoom-in").onclick = () => j(0.8), Q("zoom-out").onclick = () => j(1.25), Q("fit").onclick = () => {
    b = { ...v }, _();
  };
  const F = (R) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(R.clientX, R.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (R) => {
    const L = F(R);
    L && (R.preventDefault(), j(R.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (R) => {
    ![0, 1].includes(R.button) || !e.querySelector("svg") || (T = { start: F(R), x: R.clientX, y: R.clientY, view: { ...b }, moved: !1 }, e.setPointerCapture(R.pointerId));
  }), e.addEventListener("pointermove", (R) => {
    if (!T) return;
    const L = F(R);
    Math.hypot(R.clientX - T.x, R.clientY - T.y) > 4 && (T.moved = !0), b.x += T.start.x - L.x, b.y += T.start.y - L.y, _();
  }), e.addEventListener("pointerup", (R) => {
    if (!T) return;
    const L = T.moved;
    if (T = null, e.hasPointerCapture(R.pointerId) && e.releasePointerCapture(R.pointerId), !L) {
      const W = document.elementFromPoint(R.clientX, R.clientY)?.closest("[data-component]"), $ = g?.components.find((Z) => Z.name === W?.dataset.component);
      $ && (I = $.instanceId || "", Q("selection").textContent = `${$.raw}
${Object.entries($.terminals).map(([Z, z]) => `${Z} → ${z}`).join("   ")}`, $.kind === "X" ? X($.instanceId) : V());
    }
  }), window.addEventListener("hashchange", () => {
    if (x) {
      M = !0;
      return;
    }
    G(), I = "", ee();
  }), e.addEventListener("pointercancel", () => {
    T = null;
  }), e.addEventListener("keydown", (R) => {
    const L = R.target.closest("[data-instance]");
    if (L && (R.key === "Enter" || R.key === " ")) {
      R.preventDefault(), I = L.dataset.instance, X(I);
      return;
    }
    R.key === "+" || R.key === "=" ? j(0.8) : R.key === "-" ? j(1.25) : R.key.toLowerCase() === "f" ? (b = { ...v }, _()) : R.key.startsWith("Arrow") && (R.preventDefault(), b.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[R.key] || 0) * b.w, b.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[R.key] || 0) * b.h, _());
  });
  async function ee({ resetEditor: R = !1 } = {}) {
    if (x) return;
    x = !0, a.invalidate(), D.setEnabled(!1), r = null, i = null, u = "", k(), Q("generate").disabled = !0, t.readOnly = !0, Q("file").disabled = !0, Q("libraries").disabled = !0;
    for (const W of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) W.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let L = [];
    try {
      if (w !== t.value || !d) {
        if (y = Wt(t.value, { files: C }), L = [...y.diagnostics], L.some((B) => B.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = Ze(y), w && w !== t.value ? (E = "", I = "", history.replaceState(null, "", location.pathname + location.search)) : G(), w = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (L = [...y.diagnostics], A(L), L.some((B) => B.severity === "error")) throw Error("Fix the parser errors below before generating.");
      g = fn(d, { focus: E });
      for (const B of g.interfaceAliases) L.push({ severity: "info", message: `Instance boundary: ${B.ports.join(" = ")} share parent node ${B.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const W = lt(g);
      U().conventional && L.push(...g.layout.diagnostics);
      const $ = await mn(W, U()), Z = new DOMParser().parseFromString($.svg, "image/svg+xml");
      if (Z.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const z = Z.documentElement, ge = z.querySelector("#spice-layout-report");
      if (ge) {
        g.layout.report = JSON.parse(ge.textContent);
        const B = g.layout.report;
        if (L.push({ severity: "info", message: `Layout: compact signal flow; ${B.powerSourcesChecked} DC/ground symbols checked, ${B.powerOrderViolations} DC order preference(s) unmet. ${B.powerPass}. ${B.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), B.classicTemplateFallback && L.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), B.groundPlacement && L.push({ severity: "info", message: `Ground: ${B.groundPlacement}; ${B.straightenedGroundDrops || 0} return-path simplification(s).` }), B.explicitGroups && L.push({ severity: "info", message: `Layout comments: ${B.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), B.classicRails && L.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${B.railCount} shared voltage rails.` }), B.localClassicInstances?.length && L.push({ severity: "info", message: `${B.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), B.localClassicStages?.length && L.push({ severity: "info", message: `Classic transistor proximity active: ${B.localClassicStages.join(", ")}.` }), B.sharedClassicRails && L.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), B.mirroredTransistors?.length && L.push({ severity: "info", message: `Control-pin mirror choices: ${B.mirroredTransistors.join(", ")}.` }), B.recognizedMotifs?.length && L.push({ severity: "info", message: `Transistor structures: ${B.recognizedMotifs.map((Y) => `${Y.kind} (${Y.members.join(", ")}; ${Y.confidence})`).join("; ")}.` }), B.appliedMotifs?.length && L.push({ severity: "info", message: `Topology preferences applied to ${B.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), B.subnetFirstFallback && L.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + B.subnetFirstFallback }), B.pairCompactionFallback && L.push({ severity: "warning", message: "Pair proximity kept the original regions: " + B.pairCompactionFallback }), B.compoundPairFallback && L.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + B.compoundPairFallback }), B.pairConstraints?.length) {
          const Y = B.pairConstraints.filter((re) => re.crossRegion && !re.compacted).length;
          L.push({ severity: "info", message: `${B.pairConstraints.length - Y} adjacent transistor pair(s); ${Y} cross-region mirror row constraint(s).` });
        }
        B.netShortcuts && L.push({ severity: "info", message: `${B.netShortcuts} safe straight net shortcut(s); ${B.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), B.sharedRailFallback && L.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${B.sharedRailFallback}.` });
        for (const Y of B.localClassicFallbacks || []) Y.stage && L.push({ severity: "info", message: `Classic stage ${Y.stage} uses automatic layout: ${Y.reason || "No unobstructed local template"}.` });
        B.geometricConnectivityVerified && L.push({ severity: "info", message: `Net geometry verified; ${B.cyclesRemoved} same-net loop(s) and ${B.leavesRemoved} unused wire branch(es) removed.` }), A(L);
      }
      if (z.localName !== "svg" || z.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const l = Number(z.getAttribute("width")), s = Number(z.getAttribute("height")), S = JSON.parse(z.getAttribute("data-label-bounds") || "null");
      v = { x: Math.min(-20, (S?.x ?? 0) - 20), y: Math.min(-20, (S?.y ?? 0) - 20) }, v.w = Math.max(l, S?.right || 0) + 20 - v.x, v.h = Math.max(s, S?.bottom || 0) + 20 - v.y, b = { ...v }, z.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), z.setAttribute("width", String(v.w)), z.setAttribute("height", String(v.h)), z.setAttribute("role", "img"), z.setAttribute("aria-label", g.title || "SPICE schematic"), z.setAttribute("style", "background:white");
      for (const B of g.components) {
        const Y = Z.getElementById("cell_" + B.name);
        if (!Y) throw Error("Renderer omitted component " + B.name);
        Y.setAttribute("data-component", B.name), B.kind === "X" && (Y.setAttribute("data-instance", B.instanceId), Y.setAttribute("role", "button"), Y.setAttribute("tabindex", "0"), Y.setAttribute("aria-label", "Open " + B.name));
        const re = Z.createElementNS(z.namespaceURI, "title");
        re.textContent = B.raw + `
Resolved: ` + B.value + `
` + Object.entries(B.terminals).map(([ce, de]) => ce + ": " + de).join(", "), Y.prepend(re);
      }
      for (const B of Object.values(g.nodes))
        for (const Y of z.querySelectorAll(".net_" + B.bit)) {
          Y.setAttribute("data-net", B.name);
          const re = Z.createElementNS(z.namespaceURI, "title");
          re.textContent = "Node " + B.displayName, Y.append(re);
        }
      const N = g.components.filter((B) => B.kind === "K").map((B) => ({ name: B.name, inductors: B.coupledInductors, value: B.value }));
      if (N.length) {
        const B = Z.createElementNS(z.namespaceURI, "metadata");
        B.setAttribute("id", "spice-magnetic-couplings"), B.textContent = JSON.stringify(N), z.append(B);
        for (const Y of N) for (const re of Y.inductors) {
          const ce = Z.getElementById("cell_" + re);
          if (!ce) continue;
          const de = Z.createElementNS(z.namespaceURI, "circle"), ae = [...ce.children].find((we) => we.getAttribute("s:pid") === "A"), he = ae?.getAttribute("s:position"), Oe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[he] || [0, 0];
          for (const [we, ke] of Object.entries({ cx: Number(ae?.getAttribute("s:x")) + Oe[0], cy: Number(ae?.getAttribute("s:y")) + Oe[1], r: 3, fill: U().color, stroke: "none", "data-coupling": Y.name })) de.setAttribute(we, String(ke));
          const Te = Z.createElementNS(z.namespaceURI, "title");
          Te.textContent = Y.name + " · dotted terminal: " + Y.inductors.join(", "), de.append(Te), ce.append(de);
        }
      }
      r = $.drawing, u = new XMLSerializer().serializeToString(z), Q("source").value = u, e.replaceChildren(document.importNode(z, !0)), _();
      const te = L.filter((B) => B.severity === "warning").length;
      n.textContent = `${g.components.filter((B) => !B.synthetic).length} components · ${Object.keys(g.nodes).length} nodes · ${g.topology.leafCount} primitive devices verified${g.interfaceAliases.length ? " · Parent-connected ports: " + g.interfaceAliases.map((B) => B.ports.join(" = ")).join("; ") + "." : ""}${te ? " · Review " + te + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${ze}.`, g.layout.report?.gridVerified && (n.textContent += ` Grid ${g.layout.report.gridSize}.`), g.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${g.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), g.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), Q("json").value = JSON.stringify({ circuit: g, netlist: W, hierarchy: y }, null, 2), D.setCircuit(g, t.value), a.mount(e.querySelector("svg"), r, g, W, U(), { reset: R }), p(), Q("selection").textContent = "Click a component to inspect its original statement and pin connections.", ne();
    } catch (W) {
      if (e.replaceChildren(), u = "", Q("source").value = "", Q("json").value = "", Q("nets").replaceChildren(), Q("selection").textContent = "", n.textContent = W.message, !d)
        Q("hierarchy-panel").hidden = !0, Q("selection-actions").hidden = !0, Q("breadcrumbs").replaceChildren();
      else if (!d.contexts[E]) {
        const $ = document.createElement("button");
        $.type = "button", $.textContent = "Return to Top", $.onclick = () => X(""), Q("breadcrumbs").replaceChildren($);
      }
      D.setCircuit(null, t.value), W.diagnostics && (L = W.diagnostics), L.some(($) => $.severity === "error") || L.push({ severity: "error", line: 0, message: W.message }), A(L);
    } finally {
      x = !1, Q("generate").disabled = !1, t.readOnly = !1, Q("file").disabled = !1, Q("libraries").disabled = !1;
      for (const W of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) W.disabled = !1;
      d && d.contexts[E] && ne(), D.setEnabled(!!u), e.setAttribute("aria-busy", "false"), k(), M && (M = !1, G(), queueMicrotask(ee));
    }
  }
  Q("generate").onclick = () => ee({ resetEditor: !0 });
  for (const R of ye.querySelectorAll("[data-example]")) R.onclick = () => {
    const L = Pe[R.dataset.example];
    t.value = L.source, K(), H(L), ee();
  };
  Q("file").onchange = async (R) => {
    const L = R.target.files[0];
    if (L) {
      if (L.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await ut(L), K(), ee();
      } catch (W) {
        n.textContent = "File could not be read: " + W.message;
      } finally {
        R.target.value = "";
      }
    }
  }, Q("libraries").onchange = async (R) => {
    try {
      for (const L of R.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        C[L.webkitRelativePath || L.name] = await ut(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      d = null, w = "", Q("library-status").textContent = Object.keys(C).length + " library file(s) loaded", ee();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      R.target.value = "";
    }
  }, Q("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", Q("download").onclick = () => {
    const R = URL.createObjectURL(new Blob([u], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = R, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(R), 1e3);
  };
  async function J(R) {
    const L = r;
    if (!(!L || x || c)) {
      c = !0, k(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: W } = await import("./asc-export-CCZE8Yzd.js");
        if (r !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        i ||= W({ tree: d, circuit: g, drawing: L, source: t.value, libraries: C });
        const $ = R ? i.zip : i.ascBytes, Z = URL.createObjectURL(new Blob([$], { type: R ? "application/zip" : "application/octet-stream" })), z = document.createElement("a");
        z.href = Z, z.download = R ? "spice-schematic-asc.zip" : "spice-schematic.asc", z.click(), setTimeout(() => URL.revokeObjectURL(Z), 1e3), n.textContent = "ASC connections verified · " + i.manifest.audit.symbols + " symbols. " + (R ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), i.manifest.warnings.length && (n.textContent += " " + i.manifest.warnings.join(" "));
      } catch (W) {
        n.textContent = "ASC export failed: " + W.message;
        const $ = document.createElement("li");
        $.className = "error", $.textContent = n.textContent, o.append($);
      } finally {
        c = !1, k();
      }
    }
  }
  Q("download-asc").onclick = () => J(!1), Q("download-asc-bundle").onclick = () => J(!0), Q("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(u), n.textContent = "SVG source copied to clipboard.";
    } catch {
      Q("source-details").open = !0, Q("source").focus(), Q("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, ee();
}
export {
  Xe as b,
  Ze as e,
  Ce as l,
  qe as n,
  zt as p
};
