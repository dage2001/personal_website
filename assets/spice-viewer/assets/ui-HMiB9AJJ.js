const Et = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, _t = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, xt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, vt = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Nt = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Ct = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, It = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Tt = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, St = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, At = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ot = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, kt = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Rt = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Lt = {
  AND: Et,
  BUF: _t,
  COUNTER: xt,
  DFLOP: vt,
  SCHMITT: Nt,
  OR: Ct,
  PHASEDET: It,
  SRFLOP: Tt,
  XOR: St,
  MODULATOR: At,
  OTA: Ot,
  SAMPLEHOLD: kt,
  VARISTOR: Rt
}, Mt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", _e = (t) => t.toLowerCase(), et = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Pt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Dt(t, e) {
  const n = (I) => e[_e(I || "")] || Object.entries(e).find(([x]) => x.startsWith(_e(I || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], i = [], l = "", a = "", p = [], h = [], u = 0, b = "", f = "", w = "", _ = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], a = _e(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], a = o === "D" ? "d_v" : o === "B" ? "spice_b" : _e(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !et(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), l = t[r.length + 1] || "";
    const I = n(l)?.type;
    _ = ["NPN", "PNP"].includes(I), a = _ ? (r.length === 3 ? "q_" : "spice_q4_") + _e(I) : "spice_q" + r.length;
  } else if (o === "M") {
    const I = n(t[4]), x = n(t[5]), y = I?.type === "VDMOS" || !x && (!t[5] || et(t[5]));
    r = y ? ["D", "G", "S"] : ["D", "G", "S", "B"], l = t[r.length + 1] || "";
    const N = n(l), T = N?.type;
    if (y && N && T !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!y && T === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    _ = ["NMOS", "PMOS", "VDMOS"].includes(T);
    let M = null, C = N;
    const L = /* @__PURE__ */ new Set();
    for (; C && !L.has(C.name) && (L.add(C.name), M = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !M); )
      C = n(C.baseModel);
    const U = T === "PMOS" || T === "VDMOS" && M && (M[1] === void 0 || Number(M[1]) >= 0.5);
    a = _ ? "spice_" + (U ? "pmos" : "nmos") + (y ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    l = t[4] || "";
    const I = n(l)?.type, x = o === "Z" && ["NIGBT", "PIGBT"].includes(I);
    r = x ? ["C", "G", "E"] : ["D", "G", "S"], _ = o === "J" ? ["NJF", "PJF"].includes(I) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(I), a = "spice_" + (x ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(I || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], a = "spice_" + _e(o);
    let I = 3, x = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[I] || "");
    if (/^poly$/i.test(t[I] || "") && (x = /^\(\s*(\d+)\s*\)$/.exec(t[++I] || ""), !x))
      throw Error("POLY requires a dimension.");
    if (x) {
      const y = Number(x[1]);
      if (y > 128) throw Error("POLY supports at most 128 controlling variables.");
      let N = I + 1, T = [];
      const M = "EG".includes(o), C = y * (M ? 2 : 1);
      for (; T.length < C && N < t.length; ) T.push(...Pt(t[N++]));
      if (T.length !== C || N >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (M) {
        for (let L = 0; L < y; L++) r.push("C" + (L + 1) + "+", "C" + (L + 1) + "-");
        i = [t[1], t[2], ...T];
      } else p = T;
      u = N, b = "POLY(" + y + ") " + (M ? "" : T.join(" ") + " "), f = "POLY", M && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? f = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), f = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (p = [t[3]], u = 4, b = t[3] + " ");
    w = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (f ? " · " + f : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], l = t[5] || "", a = "spice_device", w = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], p = [t[3]], l = t[4] || "", u = 3, a = "spice_device", w = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (l = t[5] || ""), a = "spice_device", w = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], l = t[4] || "", a = "spice_device", w = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (I, x) => "P" + (x + 1)), a = "spice_device", w = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (h = t.slice(1, -1), h.some((I) => !/^L/i.test(I.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, a = "spice_coupling", w = "Magnetic coupling", b = h.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], a = "spice_device", w = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], a = "spice_device", w = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", w = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (u || (u = r.length + 1), i.length || (i = t.slice(1, r.length + 1)), i.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (i.some((I) => /[=()]/.test(I) && !/^\{[\s\S]*\}$/.test(I))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (a = "spice_br"), o === "D" && (l = t[3] || ""), o === "@") {
    const I = t.slice(u).join(" ");
    for (const x of I.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(x[1].toUpperCase()), i.push(x[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (p.some((I) => !I)) throw Error("Missing controlling voltage source.");
  const E = r.map((I, x) => o === "A" && Lt[(t[9] || "").toUpperCase()]?.[String(x + 1)] || I);
  return { kind: o, pins: r, nodeTokens: i, pinLabels: E, model: l, type: a, controlSource: p[0] || "", controlSources: p, coupledInductors: h, value: b + t.slice(u).join(" "), sourceMode: f, symbol: w, polarityKnown: _ };
}
const Ut = Mt, Bt = new Set(Ut.split(" ")), Ue = () => /* @__PURE__ */ Object.create(null), pe = (t) => t.toLowerCase();
function Le(t) {
  const e = [], n = [];
  let o = "", r = 0, i = "";
  for (let l = 0; l < t.length; l++) {
    const a = t[l];
    if (i) {
      o += a, a === i && t[l - 1] !== "\\" && (i = "");
      continue;
    }
    if (a === '"' || a === "'") {
      i = a, o += a;
      continue;
    }
    if (!r && (a === ";" || a === "$" && (!l || /\s/.test(t[l - 1])))) break;
    if ("({".includes(a) && (n.push(a), r++), ")}".includes(a) && (r--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !r ? (o && e.push(o), o = "") : o += a;
  }
  if (r || i) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Qt(t, e = {}) {
  const n = [], o = [], r = [], i = Object.assign(Ue(), e.models), l = Ue(), a = (x, y, N) => n.push({ severity: x, line: y, message: N });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const p = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((x, y) => {
    const N = x.trim();
    !N || N.startsWith("*") || (N.startsWith("+") ? p.length ? p.at(-1).text += " " + N.slice(1).trim() : a("error", y + 1, "Continuation has no preceding statement.") : p.push({ line: y + 1, text: N }));
  });
  for (const x of p) {
    try {
      x.tokens = Le(x.text);
    } catch (N) {
      a("error", x.line, N.message), x.tokens = [];
    }
    const y = x.tokens;
    if (/^\.model$/i.test(y[0] || ""))
      if (y.length < 3) a("error", x.line, ".model requires a name and device type.");
      else {
        const N = /^ako:(.+)$/i.exec(y[2]), T = N && y[3] && !y[3].startsWith("(") ? y[3].split("(")[0].toUpperCase() : "";
        i[pe(y[1])] = { name: y[1], type: N ? T : y[2].split("(")[0].toUpperCase(), baseModel: N?.[1] || "", raw: x.text };
      }
  }
  const h = /* @__PURE__ */ new Set();
  function u(x) {
    const y = i[pe(x)];
    if (!y) return "";
    if (y.type) return y.type;
    if (h.has(pe(x))) throw Error("Circular AKO model inheritance: " + x);
    return h.add(pe(x)), y.type = u(y.baseModel), h.delete(pe(x)), y.type;
  }
  for (const x of Object.values(i)) if (x.baseModel && !x.type)
    try {
      u(x.name);
    } catch (y) {
      a("error", 0, y.message);
    }
  let b = "", f = 0, w = !1, _ = !1;
  const E = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: x, text: y, tokens: N } of p) {
    if (!N.length) continue;
    const T = pe(N[0]);
    if (_) {
      a("warning", x, "Statement after .end is not rendered: " + y);
      continue;
    }
    if (T === ".control") {
      w = !0, a("warning", x, ".control script retained but not executed or rendered.");
      continue;
    }
    if (T === ".endc") {
      w = !1;
      continue;
    }
    if (w) continue;
    if (T === ".subckt") {
      f++, a("error", x, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (T === ".ends") {
      f ? f-- : a("error", x, "Unmatched .ends.");
      continue;
    }
    if (f) continue;
    if (T === ".end") {
      _ = !0;
      continue;
    }
    if (T.startsWith(".")) {
      o.push({ line: x, text: y }), T === ".title" ? b = N.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(T) ? a("error", x, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(T) ? a("error", x, "Topology-changing directive is unsupported: " + y) : I.has(T) || a("warning", x, "Directive retained but not resolved: " + y);
      continue;
    }
    const M = N[0][0].toUpperCase();
    if (!Bt.has(M)) {
      x === 1 && !/\d/.test(N[0]) && N.length > 1 && M !== "X" ? (b = y, a("warning", x, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", x, `Unsupported ${M} device was not rendered: ${y}`);
      continue;
    }
    const C = M === "M" || M === "Q" ? 5 : 4;
    if (x === 1 && !/\d/.test(N[0]) && (N.length < C || M === "T" && !/\b(?:zo|z0)\s*=/i.test(y))) {
      b = y, a("info", x, "SPICE title: " + y);
      continue;
    }
    try {
      if (E.has(T)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const L = Dt(N, i), { pins: U, nodeTokens: m, ...d } = L;
      L.polarityKnown || a("warning", x, `${N[0]}: model polarity unknown; explicit ${U.join("/")} terminals retained.`);
      const D = Ue();
      U.forEach((q, G) => {
        const K = pe(m[G]);
        l[K] || (l[K] = { name: K, displayName: N[G + 1], bit: Object.keys(l).length + 2, terminals: [] }), l[K].terminals.push({ component: N[0], pin: q }), D[q] = K;
      }), r.push({ ...d, name: N[0], terminals: D, line: x, raw: y }), E.add(T);
    } catch (L) {
      a("error", x, `${N[0]}: ${L.message} Statement: ${y}`);
    }
  }
  f && a("error", 0, "Unclosed .subckt definition."), w && a("error", 0, "Unclosed .control block."), r.length || a("error", 0, "No supported components to render."), r.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const x of r) {
    for (const y of x.controlSources || []) !y.includes(":") && !r.some((N) => pe(N.name) === pe(y) && N.kind === "V") && a("error", x.line, `${x.name}: controlling voltage source ${y} was not found.`);
    for (const y of x.coupledInductors || []) !y.includes(":") && !r.some((N) => pe(N.name) === pe(y) && N.kind === "L") && a("error", x.line, `${x.name}: coupled inductor ${y} was not found.`);
    (x.kind === "B" || x.type === "spice_b") && a("info", x.line, `${x.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: b, components: r, nodes: l, models: i, directives: o, diagnostics: n };
}
const Ee = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), tt = (t) => Ee(t).split("/").at(-1);
function jt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], i = [], l = [];
  let a = 0;
  const p = (u, b) => {
    const f = Ee(b).split("/").slice(0, -1).concat(Ee(u)).join("/"), w = [...o].filter(([E]) => Ee(E) === Ee(u) || Ee(E) === f);
    if (w.length === 1) return w[0];
    const _ = [...o].filter(([E]) => tt(E) === tt(u));
    if (_.length !== 1) throw Error(_.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return _[0];
  };
  function h(u, b, f = "", w = []) {
    const _ = Ee(b) + ":" + f.toLowerCase();
    if (w.includes(_)) throw Error("Circular library include: " + [...w, _].join(" → "));
    if (w.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const E = [], I = /^\s*\.endl\b/im.test(u);
    let x = !f;
    const y = (T, M) => {
      if (a += T.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      l.push(T), i.push({ file: b, line: M + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((T, M) => {
      const C = T.trim();
      if (/^\.lib\b/i.test(C) && I) {
        const L = Le(C);
        if (L.length === 2 && !/[.\\/]/.test(L[1])) {
          E.push(L[1].toLowerCase()), L[1].toLowerCase() === f.toLowerCase() && (x = !0), y("* Library section " + L[1], M);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        E.pop(), y("* End library section", M);
        return;
      }
      if (f && E.length && !E.includes(f.toLowerCase())) {
        y("* Unselected library section", M);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const L = Le(C);
          if (!L[1]) throw Error("Include requires a filename.");
          const [U, m] = p(L[1], b);
          y("* Included " + U, M), h(m, U, L[2] || "", [...w, _]);
        } catch (L) {
          r.push({ severity: "error", line: M + 1, source: b, message: L.message }), y("* Unresolved include", M);
        }
      else y(T, M);
    }), !x) throw Error("Library section " + f + " not found in " + b);
  }
  try {
    h(t, n);
  } catch (u) {
    r.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: l.join(`
`), origins: i, diagnostics: r };
}
function Vt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((a, p) => {
    const h = a.trim();
    /^\.subckt\b/i.test(h) && (o.push(p + 1), n.set(p + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: a, line: p + 1 }) : e[p] = a, /^\.ends\b/i.test(h) && o.length > 1 && o.pop();
  });
  const i = nt(Array.from({ length: t.split(/\r?\n/).length }, (a, p) => e[p] || "").join(`
`));
  r.push(...i.diagnostics);
  const l = /* @__PURE__ */ new Map();
  for (const [a, p] of n) {
    const h = nt(p.map((u) => u.raw).join(`
`));
    l.set(a, h.layout), r.push(...h.diagnostics.map((u) => ({ ...u, line: p[u.line - 1]?.line || a })));
  }
  return { layout: i.layout, scopes: l, diagnostics: r };
}
function nt(t) {
  const e = [], n = [];
  let o = !1, r = !1, i = 0;
  if (t.split(/\r?\n/).forEach((y, N) => {
    const T = y.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(T)) {
      (r || o) && e.push({ severity: "error", line: N + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(T) || e.push({ severity: "error", line: N + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, i = N + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(T)) {
      o || e.push({ severity: "error", line: N + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (T.startsWith("*") ? n.push(T.slice(1).trim()) : e.push({ severity: "error", line: N + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: i, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const l = n.join(" "), a = l.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], p = [], h = [], u = [], b = [];
  let f = 0, w = 0, _ = 10;
  const E = () => a[f++], I = () => {
    const y = E();
    if (!y || !/^[A-Za-z_@][\w./%:@-]*$/.test(y)) throw Error("Expected layout identifier, got " + y);
    return y;
  };
  function x(y) {
    if (p.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const N = y ? I() : "@row" + w++, T = E();
    if (!["row", "column", "classic"].includes(T)) throw Error("Expected row, column or classic.");
    if (E() !== "{") throw Error("Expected { after " + T);
    const M = { id: N, direction: T, members: [] };
    for (p.push(M); f < a.length && a[f] !== "}"; )
      a[f] === "group" ? (E(), M.members.push(x(!0))) : ["row", "column"].includes(a[f]) ? M.members.push(x(!1)) : M.members.push(I());
    if (E() !== "}") throw Error("Unclosed group " + N);
    if (!M.members.length) throw Error("Empty layout group " + N);
    return N;
  }
  try {
    for (; f < a.length; )
      if (a[f] === "group")
        E(), x(!0);
      else if (["row", "column"].includes(a[f])) x(!1);
      else if (a[f] === "face") {
        E();
        const m = I(), d = E();
        if (!["left", "right"].includes(d)) throw Error("Expected face left or right.");
        if (b.some((D) => D.device.toLowerCase() === m.toLowerCase())) throw Error("Duplicate face device.");
        b.push({ device: m, side: d });
      } else if (a[f] === "pair") {
        E();
        const m = E();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(m)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (E() !== "{") throw Error("Expected { after pair kind.");
        const d = [];
        for (; f < a.length && a[f] !== "}"; ) d.push(I());
        if (E() !== "}" || !d.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: m, members: d });
      } else if (a[f] === "priority-cap") {
        if (E(), _ = Number(E()), !Number.isInteger(_) || _ < 3 || _ > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const m = I(), d = E(), D = I();
        if (!["left-of", "above"].includes(d)) throw Error("Expected left-of or above.");
        h.push({ a: m, relation: d, b: D });
      } else throw Error("Unknown layout instruction near " + a[f - 1]);
    const y = /* @__PURE__ */ new Set();
    for (const m of p) {
      const d = m.id.toLowerCase();
      if (y.has(d)) throw Error("Duplicate layout group " + m.id);
      y.add(d);
    }
    const N = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), M = new Map(p.map((m) => [m.id.toLowerCase(), m])), C = (m) => {
      if (N.has(m)) throw Error("Circular layout group " + m);
      if (!T.has(m)) {
        N.add(m);
        for (const d of M.get(m).members) M.has(d.toLowerCase()) && C(d.toLowerCase());
        N.delete(m), T.add(m);
      }
    };
    for (const m of M.keys()) C(m);
    const L = /* @__PURE__ */ new Map();
    for (const m of h) {
      if (m.a.toLowerCase() === m.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      L.has(m.a.toLowerCase()) || L.set(m.a.toLowerCase(), []), L.get(m.a.toLowerCase()).push(m.b.toLowerCase());
    }
    N.clear(), T.clear();
    const U = (m) => {
      if (N.has(m)) throw Error("Circular place constraints.");
      if (!T.has(m)) {
        N.add(m);
        for (const d of L.get(m) || []) U(d);
        N.delete(m), T.add(m);
      }
    };
    for (const m of L.keys()) U(m);
  } catch (y) {
    e.push({ severity: "error", line: i, message: "Layout description: " + y.message });
  }
  return { layout: { version: 1, priorityCap: _, groups: p, relations: h, pairs: u, faces: b }, diagnostics: e };
}
function Ft(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const w = new Set(n.groups.map((E) => E.id.toLowerCase())), _ = (E) => w.has(E.toLowerCase()) ? E : e.components.find((x) => x.synthetic && x.value.toLowerCase() === E.toLowerCase())?.name || e.focus + "/" + E;
    o = { ...n, groups: n.groups.map((E) => ({ ...E, members: E.members.map(_) })), relations: n.relations.map((E) => ({ ...E, a: _(E.a), b: _(E.b) })), faces: (n.faces || []).map((E) => ({ ...E, device: _(E.device) })), pairs: (n.pairs || []).map((E) => ({ ...E, members: E.members.map(_) })) };
  }
  const r = new Map(o.groups.map((w) => [w.id.toLowerCase(), w])), i = Object.values(t.contexts).flatMap((w) => w.devices.map((_) => _.name)), l = new Set([...Object.keys(t.contexts), ...i, ...e.components.map((w) => w.name)].map((w) => w.toLowerCase()));
  for (const w of r.values()) if (l.has((n ? e.focus + "/" + w.id : w.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + w.id);
  for (const w of r.values()) for (const _ of w.members) if (!r.has(_.toLowerCase()) && !l.has(_.toLowerCase())) throw Error("Unknown @layout instance/device: " + _);
  for (const w of o.relations) for (const _ of [w.a, w.b]) if (!r.has(_.toLowerCase()) && !l.has(_.toLowerCase())) throw Error("Unknown @layout place target: " + _);
  const a = (o.pairs || []).map((w) => ({ ...w, members: w.members.map((_) => {
    const E = e.components.find((I) => I.name.toLowerCase() === _.toLowerCase());
    if (!E || E.synthetic || E.block) throw Error("Unknown or non-visible @layout pair device: " + _);
    return E.name;
  }) })), p = (o.faces || []).map((w) => {
    const _ = e.components.find((E) => E.name.toLowerCase() === w.device.toLowerCase());
    if (!_ || !["Q", "M", "J", "Z"].includes(_.kind)) throw Error("Unknown or unsupported @layout face device: " + w.device);
    return { ...w, device: _.name };
  }), h = /* @__PURE__ */ new Map(), u = [], b = new Set(Object.keys(t.contexts).map((w) => w.toLowerCase()));
  for (const w of o.groups) {
    const _ = [];
    for (const E of w.members) {
      if (r.has(E.toLowerCase())) {
        _.push({ group: E });
        continue;
      }
      for (const I of e.components) if (I.name.toLowerCase() === E.toLowerCase() || I.name.toLowerCase().startsWith(E.toLowerCase() + "/")) {
        if (h.has(I.name)) throw Error("Overlapping @layout membership: " + I.name);
        h.set(I.name, w.id), _.push({ cell: I.name, ...b.has(E.toLowerCase()) ? { instance: E } : {} });
      }
    }
    u.push({ id: w.id, direction: w.direction, members: _ });
  }
  const f = /* @__PURE__ */ new Set();
  for (const w of u) for (const _ of w.members) if (_.group) {
    const E = _.group.toLowerCase();
    if (f.has(E)) throw Error("Layout group has multiple parents: " + _.group);
    f.add(E);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: u, relations: o.relations, pairs: a, faces: p };
}
const ve = () => /* @__PURE__ */ Object.create(null), ue = (t) => t.toLowerCase();
function gt(t) {
  const e = ve();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const i = ue(r[1]);
    let l = r[2];
    if (l === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + i);
      l = a[1];
    }
    if (l || (l = t[++n]), !l || /^params?:$/i.test(l)) throw Error("Missing value for parameter " + i);
    if (Object.hasOwn(e, i)) throw Error("Duplicate parameter: " + i);
    e[i] = l;
  }
  return e;
}
function rt(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ve()] : [t.slice(0, e), gt(t.slice(e))];
}
function Gt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = jt(t, e);
  t = n.source;
  const o = Vt(t), r = [...n.diagnostics, ...o.diagnostics], i = ve(), l = /* @__PURE__ */ new Set(["0"]), a = (y, N, T) => r.push({ severity: y, line: N, message: T }), p = (y, N, T, M = [], C = ve(), L = 0) => {
    const U = { id: y, name: N, parent: T, ports: M, defaults: C, parameters: ve(), definitions: ve(), devices: [], instances: [], directives: [], line: L, statements: [], layoutDescription: o.scopes.get(L) || null };
    return i[y] = U, U;
  }, h = p("root", "Top", null), u = [h], b = [];
  let f = !1, w = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, N) => {
    const T = y.trim();
    !T || T.startsWith("*") || (T.startsWith("+") ? b.length ? b.at(-1).text += " " + T.slice(1).trim() : a("error", N + 1, "Continuation has no preceding statement.") : b.push({ text: T, line: N + 1 }));
  });
  for (const { text: y, line: N } of b)
    try {
      const T = Le(y);
      if (!T.length) continue;
      const M = ue(T[0]), C = u.at(-1);
      if (w) {
        a("warning", N, "Statement after .end is not rendered: " + y);
        continue;
      }
      if (M === ".control") {
        f = !0, a("warning", N, ".control script retained but not executed or rendered.");
        continue;
      }
      if (M === ".endc") {
        f = !1;
        continue;
      }
      if (f) continue;
      if (M === ".subckt") {
        if (T.length < 2) throw Error(".SUBCKT requires a name.");
        const [L, U] = rt(T.slice(2)), m = ue(T[1]);
        if (Object.hasOwn(C.definitions, m)) throw Error("Duplicate subcircuit definition: " + T[1]);
        const d = L.map(ue);
        if (new Set(d).size !== L.length || d.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (L.some((q) => /[{}()=]/.test(q))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = C.id + "/" + encodeURIComponent(m);
        C.definitions[m] = D, u.push(p(D, T[1], C.id, L, U, N));
        continue;
      }
      if (M === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (T[1] && ue(T[1]) !== ue(C.name)) throw Error(".ENDS name does not match " + C.name);
        u.pop();
        continue;
      }
      if (M === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        w = !0;
        continue;
      }
      if (M === ".param") {
        const L = gt(T.slice(1));
        for (const [U, m] of Object.entries(L)) {
          if (Object.hasOwn(C.parameters, U)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + U);
          C.parameters[U] = m;
        }
      }
      if (M === ".global") {
        if (T.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const L of T.slice(1)) l.add(ue(L));
      }
      if (M.startsWith(".") && C.directives.push({ line: N, text: y }), M.startsWith("x")) {
        const [L, U] = rt(T.slice(1));
        if (!L.length) throw Error("X instance requires a subcircuit name.");
        const m = /;§pnba\s+(.+)$/i.exec(y)?.[1].split(")");
        C.instances.push({ name: T[0], nodes: L.slice(0, -1).map(ue), definitionName: L.at(-1), definitionId: null, parameters: U, line: N, raw: y, pinNames: m });
      } else C.statements.push({ line: N, text: y });
    } catch (T) {
      a("error", N, T.message + " Statement: " + y);
    }
  u.length > 1 && a("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), f && a("error", 0, "Unclosed .control block.");
  function _(y, N) {
    for (; y; ) {
      if (Object.hasOwn(y.definitions, ue(N))) return y.definitions[ue(N)];
      y = i[y.parent];
    }
    return null;
  }
  for (const y of Object.values(i)) {
    const N = [...y.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...y.statements], T = Qt(N.map((C) => C.text).join(`
`), { models: i[y.parent]?.models });
    y.devices = T.components.map((C) => ({ ...C, line: N[C.line - 1]?.line || y.line })), y.models = T.models, y === h && (h.title = T.title), r.push(...T.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: N[C.line - 1]?.line || y.line })));
    const M = new Set(y.devices.map((C) => ue(C.name)));
    for (const C of y.instances)
      if (M.has(ue(C.name)) && a("error", C.line, "Duplicate instance/device name: " + C.name), M.add(ue(C.name)), C.definitionId = _(y, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) a("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const L = i[C.definitionId];
        L.ports.length !== C.nodes.length && a("error", C.line, `${C.name}: ${L.name} expects ${L.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const y of Object.values(i)) delete y.statements;
  const E = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function x(y, N = []) {
    if (E.has(y)) {
      a("error", i[y].line, "Circular subcircuit reference: " + [...N, i[y].name].join(" → "));
      return;
    }
    if (!I.has(y)) {
      if (E.add(y), N.length >= 64) {
        a("error", i[y].line, "Subcircuit dependency nesting exceeds 64 levels."), E.delete(y), I.add(y);
        return;
      }
      for (const T of i[y].instances) T.definitionId && x(T.definitionId, [...N, i[y].name]);
      E.delete(y), I.add(y);
    }
  }
  for (const y of Object.keys(i)) x(y);
  !h.devices.length && !h.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const y of r) !y.source && y.line && n.origins[y.line - 1] && (y.source = n.origins[y.line - 1].file, y.line = n.origins[y.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: h.title || "", scopes: i, globals: [...l], diagnostics: r, layoutDescription: o.layout };
}
const se = () => /* @__PURE__ */ Object.create(null), xe = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), We = (t, e) => xe(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Ht(t, e = []) {
  const n = se(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((i) => decodeURIComponent(i)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [i, l] of Object.entries(r.terminals)) o(l).terminals.push({ component: r.name, pin: i });
  for (const r of e) o(r);
  return n;
}
function Wt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ot = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Xt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Me(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (l) => (r.push(l), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (l, a, p) => {
    const h = p.split(",").map((b) => b.trim());
    if (h.some((b) => !b || /[\s{}+*()]/.test(b))) throw Error("Unsupported dynamic voltage/current reference: " + l);
    const u = a.toUpperCase() + "(" + h.map((b) => a.toLowerCase() === "v" ? n(b) : o(b, a)).join(",") + ")";
    return r.push(u), "@@" + (r.length - 1) + "@@";
  });
  let i = t.length;
  return t = t.replace(Xt, (l, a, p) => {
    if (p.slice(a + l.length).trimStart().startsWith("(")) return l;
    const h = e(l.toLowerCase());
    if (h === void 0) return l;
    if (i += h.length + 2, i > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + h + ")";
  }), t.replace(/@@(\d+)@@/g, (l, a) => r[Number(a)]);
}
function $t(t, e, n, o) {
  const r = { ...e, ...n }, i = se(), l = /* @__PURE__ */ new Set(), a = se();
  for (const [h, u] of Object.entries(o)) a[h] = Me(ot(u), (b) => t[b]);
  function p(h) {
    if (Object.hasOwn(a, h)) return a[h];
    if (Object.hasOwn(i, h)) return i[h];
    if (!Object.hasOwn(r, h)) return t[h];
    if (l.has(h)) {
      if (Object.hasOwn(t, h)) return t[h];
      throw Error("Circular parameter dependency: " + [...l, h].join(" → "));
    }
    return l.add(h), i[h] = Me(ot(r[h]), p), l.delete(h), i[h];
  }
  for (const h of Object.keys(r)) p(h);
  return Object.assign(se(), t, i, a);
}
function Xe(t, e, n, o) {
  let r = "";
  for (let p = 0; p < t.length; ) {
    const h = t[p];
    if (h !== "{" && h !== "'") {
      r += h, p++;
      continue;
    }
    const u = p++;
    let b = 1, f = "";
    for (; p < t.length && b; p++) {
      if (h === "'") {
        t[p] === "'" && (b = 0);
        continue;
      }
      if (f) {
        t[p] === f && (f = "");
        continue;
      }
      if (t[p] === '"' || t[p] === "'") {
        f = t[p];
        continue;
      }
      t[p] === "{" && b++, t[p] === "}" && b--;
    }
    if (b) throw Error("Unclosed parameter expression.");
    r += h + Me(t.slice(u + 1, p - 1), (w) => e[w], n, o) + (h === "{" ? "}" : "'");
  }
  const i = [];
  let l = 0, a = "";
  for (let p = 0; p < r.length; p++) {
    const h = r[p];
    if (a) {
      h === a && r[p - 1] !== "\\" && (a = "");
      continue;
    }
    if (h === '"' || h === "'") {
      a = h;
      continue;
    }
    if ("({".includes(h) && l++, ")}".includes(h) && l--, !l && (p === 0 || /\s/.test(r[p - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(p));
      u && (i.push({ start: p, end: p + u[0].length, key: u[1].toLowerCase() }), p += u[0].length - 1);
    }
  }
  if (i.length) {
    let p = r.slice(0, i[0].start);
    i.forEach((h, u) => {
      const b = i[u + 1]?.start ?? r.length, f = r.slice(h.end, b);
      p += r.slice(h.start, h.end) + (f.includes("{") || ["refnode", "intnode"].includes(h.key) ? f : Me(f, (w) => e[w], n, o));
    }), r = p;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class qt {
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
class zt {
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
class k {
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
    return "JavaScript Expression Parser (JSEP) v" + k.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return k.max_unop_len = Math.max(e.length, k.max_unop_len), k.unary_ops[e] = 1, k;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return k.max_binop_len = Math.max(e.length, k.max_binop_len), k.binary_ops[e] = n, o ? k.right_associative.add(e) : k.right_associative.delete(e), k;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return k.additional_identifier_chars.add(e), k;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return k.literals[e] = n, k;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete k.unary_ops[e], e.length === k.max_unop_len && (k.max_unop_len = k.getMaxKeyLen(k.unary_ops)), k;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return k.unary_ops = {}, k.max_unop_len = 0, k;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return k.additional_identifier_chars.delete(e), k;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete k.binary_ops[e], e.length === k.max_binop_len && (k.max_binop_len = k.getMaxKeyLen(k.binary_ops)), k.right_associative.delete(e), k;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return k.binary_ops = {}, k.max_binop_len = 0, k;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete k.literals[e], k;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return k.literals = {}, k;
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
    return new k(e).parse();
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
    return k.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !k.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    k.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return k.isIdentifierStart(e) || k.isDecimalDigit(e);
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
    if (k.hooks[e]) {
      const o = { context: this, node: n };
      return k.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (k.hooks[e]) {
      const n = { context: this };
      return k.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === k.SPACE_CODE || e === k.TAB_CODE || e === k.LF_CODE || e === k.CR_CODE; )
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
      type: k.COMPOUND,
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
      if (o = this.code, o === k.SEMCOL_CODE || o === k.COMMA_CODE)
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
    let e = this.expr.substr(this.index, k.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (k.binary_ops.hasOwnProperty(e) && (!k.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !k.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, o, r, i, l, a, p, h;
    if (l = this.gobbleToken(), !l || (n = this.gobbleBinaryOp(), !n))
      return l;
    for (i = { value: n, prec: k.binaryPrecedence(n), right_a: k.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), r = [l, i, a]; n = this.gobbleBinaryOp(); ) {
      if (o = k.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      i = { value: n, prec: o, right_a: k.right_associative.has(n) }, h = n;
      const u = (b) => i.right_a && b.right_a ? o > b.prec : o <= b.prec;
      for (; r.length > 2 && u(r[r.length - 2]); )
        a = r.pop(), n = r.pop().value, l = r.pop(), e = {
          type: k.BINARY_EXP,
          operator: n,
          left: l,
          right: a
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + h), r.push(i, e);
    }
    for (p = r.length - 1, e = r[p]; p > 1; )
      e = {
        type: k.BINARY_EXP,
        operator: r[p - 1].value,
        left: r[p - 2],
        right: e
      }, p -= 2;
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
    if (e = this.code, k.isDecimalDigit(e) || e === k.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === k.SQUOTE_CODE || e === k.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === k.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, k.max_unop_len), o = n.length; o > 0; ) {
        if (k.unary_ops.hasOwnProperty(n) && (!k.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !k.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const i = this.gobbleToken();
          return i || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: k.UNARY_EXP,
            operator: n,
            argument: i,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      k.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), k.literals.hasOwnProperty(r.name) ? r = {
        type: k.LITERAL,
        value: k.literals[r.name],
        raw: r.name
      } : r.name === k.this_str && (r = { type: k.THIS_EXP })) : e === k.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === k.PERIOD_CODE || n === k.OBRACK_CODE || n === k.OPAREN_CODE || n === k.QUMARK_CODE; ) {
      let o;
      if (n === k.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== k.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === k.OBRACK_CODE ? (e = {
        type: k.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== k.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === k.OPAREN_CODE ? e = {
        type: k.CALL_EXP,
        arguments: this.gobbleArguments(k.CPAREN_CODE),
        callee: e
      } : (n === k.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: k.MEMBER_EXP,
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
    for (; k.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === k.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); k.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); k.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      k.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, k.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === k.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === k.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: k.LITERAL,
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
      type: k.LITERAL,
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
    for (k.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, k.isIdentifierPart(e)); )
      this.index++;
    return {
      type: k.IDENTIFIER,
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
        o = !0, this.index++, e === k.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (i === k.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === k.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === k.CBRACK_CODE)
            for (let l = n.length; l < r; l++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const l = this.gobbleExpression();
        (!l || l.type === k.COMPOUND) && this.throwError("Expected comma"), n.push(l);
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
    let e = this.gobbleExpressions(k.CPAREN_CODE);
    if (this.code === k.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: k.SEQUENCE_EXP,
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
      type: k.ARRAY_EXP,
      elements: this.gobbleArguments(k.CBRACK_CODE)
    };
  }
}
const Yt = new qt();
Object.assign(k, {
  hooks: Yt,
  plugins: new zt(k),
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
k.max_unop_len = k.getMaxKeyLen(k.unary_ops);
k.max_binop_len = k.getMaxKeyLen(k.binary_ops);
const Ce = (t) => new k(t).parse(), Kt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(k).filter((t) => !Kt.includes(t) && Ce[t] === void 0).forEach((t) => {
  Ce[t] = k[t];
});
Ce.Jsep = k;
const Zt = "ConditionalExpression";
var Jt = {
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
            type: Zt,
            test: o,
            consequent: r,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let l = o;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ce.plugins.register(Jt);
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
            let l = o;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ce.plugins.register(tn);
const nn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, it = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, le = (t) => Number(t) > 0.5;
function Se(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (p) => {
      if (p[0] === '"' || p[0] === "'") return p;
      const [, h, u, b] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(p), f = u.toLowerCase(), w = f.startsWith("meg") ? 1e6 : f.startsWith("mil") ? 254e-7 : nn[f[0]] || 1;
      return "(" + (b ? +(h + (h.includes(".") ? "" : ".") + b) : Number(h)) * w + ")";
    }), i(Ce(a));
  }
  function i(a) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const p = a.name.toLowerCase();
      if (p === "pi") return Math.PI;
      if (p === "e") return Math.E;
      if (!Object.hasOwn(e, p)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(p)) throw Error("Circular structural parameter: " + p);
      n.add(p);
      const h = r(e[p]);
      return n.delete(p), h;
    }
    if (a.type === "ConditionalExpression") return le(i(a.test)) ? i(a.consequent) : i(a.alternate);
    if (a.type === "UnaryExpression") {
      const p = i(a.argument);
      if (a.operator === "-") return -p;
      if (a.operator === "+") return +p;
      if (a.operator === "!" || a.operator === "~") return !le(p);
    }
    if (a.type === "BinaryExpression") {
      const p = i(a.left);
      if (a.operator === "&&") return le(p) && le(i(a.right));
      if (a.operator === "||") return le(p) || le(i(a.right));
      const h = i(a.right);
      switch (a.operator) {
        case "+":
          return p + h;
        case "-":
          return p - h;
        case "*":
          return p * h;
        case "/":
          return p / h;
        case "**":
          return p ** h;
        case "%":
          return p % h;
        case "^":
          return le(p) !== le(h);
        case "&":
          return le(p) && le(h);
        case "|":
          return le(p) || le(h);
        case ">":
          return p > h;
        case "<":
          return p < h;
        case ">=":
          return p >= h;
        case "<=":
          return p <= h;
        case "==":
        case "===":
          return p === h;
        case "!=":
        case "!==":
          return p !== h;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const p = a.callee.name.toLowerCase();
      if (p === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return le(i(a.arguments[0])) ? i(a.arguments[1]) : i(a.arguments[2]);
      }
      if (Object.hasOwn(it, p)) return it[p](...a.arguments.map(i));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const l = r(t);
  if (typeof l == "number" && !Number.isFinite(l)) throw Error("Structural expression is not finite.");
  return l;
}
function ze(t, { isolate: e = "" } = {}) {
  Wt(t);
  const n = se(), o = /* @__PURE__ */ new Map();
  let r = 0, i = 0;
  function l(a, p, h, u, b, f, w) {
    if (p.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const _ = t.scopes[a], E = p.length ? xe(p.slice(0, -1), p.at(-1)) : "", I = se();
    if (e && E === e && (h = se()), w.some((C) => C.scopeId === a)) throw Error("Circular subcircuit reference at " + E);
    const x = $t(u, _.defaults, _.parameters, b);
    function y(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const U = Se(C, x);
        C = String(typeof U == "boolean" ? Number(U) : U);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const L = C.toLowerCase();
      return Object.hasOwn(h, L) ? h[L] : t.globals.includes(L) ? We([], L) : I[L] || (I[L] = We(p, L));
    }
    const N = { id: E, path: p, scopeId: a, name: f?.name || "Top", definition: _.name, ports: _.ports.map((C) => ({ name: C, node: y(C) })), params: x, nodes: I, models: se(), devices: [], children: [], raw: f?.raw || "", line: f?.line || 0 };
    n[E] = N, o.set(E, y);
    const T = [...w, N];
    function M(C) {
      if (!C) return "";
      let L = _;
      for (; L; ) {
        if (L.directives.some((U) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(U.text))) {
          const U = [...T].reverse().find((m) => m.scopeId === L.id);
          return xe(U?.path || [], C.toLowerCase());
        }
        L = t.scopes[L.parent];
      }
      return C;
    }
    for (const C of _.directives.filter((L) => /^\.model\b/i.test(L.text))) {
      const L = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!L) continue;
      const U = M(L), m = _.models[L.toLowerCase()], d = Xe(C.text, x, y, (D) => xe(p, D));
      N.models[U] = { ...m, name: U, raw: d.replace(/^(\.model\s+)\S+/i, (D, q) => q + U), instanceId: E, parameters: x };
    }
    for (const C of _.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const L = se();
      for (const [m, d] of Object.entries(C.terminals)) L[m] = y(d);
      const U = M(C.model);
      N.devices.push({ ...C, name: xe(p, C.name), localName: C.name, instanceId: E, terminals: L, model: U, parameters: x });
    }
    for (const C of _.instances) {
      let L = C.definitionId;
      if (!L) {
        const D = String(Se(C.definitionName, x)).toLowerCase();
        let q = _;
        for (; q && !L; )
          L = q.definitions[D], q = t.scopes[q.parent];
        if (!L) throw Error("Undefined selected subcircuit: " + D);
      }
      const U = t.scopes[L], m = se();
      if (U.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + U.ports.length + " ports; got " + C.nodes.length);
      U.ports.forEach((D, q) => {
        m[D.toLowerCase()] = y(C.nodes[q]);
      });
      const d = l(L, [...p, C.name], m, x, C.parameters, C, T);
      C.pinNames?.length === d.ports.length && d.ports.forEach((D, q) => {
        D.label = C.pinNames[q];
      }), N.children.push(d);
    }
    return N;
  }
  try {
    let b = function(f, w) {
      const _ = w.split(":");
      if (_.length === 1) return { owner: f, name: w };
      const E = _.pop();
      for (const I of [[...f.path, ..._], _]) {
        const x = p.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (x) return { owner: x, name: E };
      }
      throw Error("Unknown hierarchical reference: " + w);
    };
    const a = l(t.rootId, [], se(), se(), se(), null, []), p = new Map(Object.values(n).map((f) => [f.id.toLowerCase(), f])), h = Object.assign(se(), ...Object.values(n).map((f) => f.models)), u = (f) => h[f] || Object.entries(h).find(([w]) => w.startsWith(f + "."))?.[1];
    for (const f of Object.values(n)) for (const w of f.devices) {
      const _ = t.scopes[f.scopeId].devices.find((x) => x.name === w.localName), E = (x) => {
        const y = b(f, x);
        return o.get(y.owner.id)(y.name);
      }, I = (x, y = "", N = "") => {
        const T = b(f, x), M = T.owner.devices.find((C) => C.localName.toLowerCase() === T.name.toLowerCase());
        if (y.toLowerCase() === "ix") {
          const C = T.owner.ports.find((L, U) => L.name.toLowerCase() === T.name.toLowerCase() || String(U + 1) === T.name);
          if (C) return T.owner.id + ":" + C.name;
        }
        if (!M) {
          if (N) throw Error(w.name + ": referenced " + N + " device " + x + " was not found.");
          return xe(T.owner.path, T.name);
        }
        if (N && M.kind !== N) throw Error(w.name + ": " + x + " must be a " + N + " device.");
        return M.name;
      };
      if (w.value = Xe(_.value, f.params, E, I), _.model && (w.value = w.value.replace(_.model, w.model)), w.kind === "M" && Object.keys(w.terminals).length === 3) {
        let x = u(w.model), y = !1;
        const N = /* @__PURE__ */ new Set();
        for (; x?.type === "VDMOS" && !N.has(x.name); ) {
          N.add(x.name);
          const T = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(x.raw);
          if (T) {
            y = T[1] === void 0 || Number(Se(T[1], x.parameters)) >= 0.5;
            break;
          }
          const M = x.name.includes("/") ? x.name.slice(0, x.name.lastIndexOf("/") + 1) : "";
          x = u(M + (x.baseModel || "").toLowerCase()) || u((x.baseModel || "").toLowerCase());
        }
        N.size && (w.type = "spice_" + (y ? "pmos3" : "nmos3"));
      }
      w.controlSources = (_.controlSources || []).map((x) => I(x, "", "V")), w.controlSource = w.controlSources[0] || "", w.coupledInductors = (_.coupledInductors || []).map((x) => I(x, "", "L"));
      for (const x of /* @__PURE__ */ new Set([..._.controlSources || [], ..._.coupledInductors || []])) {
        const y = x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        w.value = w.value.replace(new RegExp("(?<![\\w./%])" + y + "(?![\\w.$])", "g"), () => I(x));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: n };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function Ne(t) {
  return [...t.devices, ...t.children.flatMap(Ne)];
}
function Te(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Ye(t, e = {}) {
  const n = new Map(t.components.map((m) => [m.name, m])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = [], l = (m, d) => JSON.stringify([m, d].sort()), a = (m) => e[m]?.potential !== null && e[m]?.potential !== void 0;
  for (const m of t.components) {
    for (const [v, P] of Object.entries(m.terminals))
      o.has(P) || o.set(P, []), o.get(P).push({ device: m.name, pin: v });
    if (m.kind === "R") {
      const v = Object.values(m.terminals);
      if (v.length === 2 && v[0] !== v[1]) {
        const P = l(...v);
        r.has(P) || r.set(P, []), r.get(P).push(m);
      }
    }
    const d = m.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(m.kind) ? "fet" : null, D = d === "bjt" ? /_(npn|pnp)$/.exec(m.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(m.type)?.[1];
    if (!d || !D) continue;
    const q = m.terminals, G = q[d === "bjt" ? "B" : "G"], K = q[d === "bjt" ? "C" : "D"], O = q[d === "bjt" ? "E" : "S"];
    [G, K, O].some((v) => v === void 0) || G === O || K === O || i.push({ id: m.name, family: d, polarity: D, control: G, drain: K, source: O, body: m.kind === "M" ? q.B : void 0 });
  }
  const p = [], h = /* @__PURE__ */ new Set(), u = (m, d, D, q, G, K = "basic", O = [], v = "high") => {
    const P = [.../* @__PURE__ */ new Set([...d, ...O])], Q = JSON.stringify([m, K, [...P].sort()]);
    h.has(Q) || (h.add(Q), p.push({ id: "motif" + p.length, kind: m, variant: K, transistors: d, members: P, roles: D, nets: q, evidence: G, confidence: v }));
  }, b = (m, d) => m.family === d.family && m.polarity === d.polarity, f = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), E = new Map(i.map((m) => [m.id, m])), I = (m, d, D) => {
    m.has(d) || m.set(d, []), m.get(d).push(D);
  }, x = (m, d) => JSON.stringify([m.family, m.polarity, d]);
  for (const m of i)
    I(f, x(m, m.control), m), I(w, x(m, m.source), m), m.family === "bjt" && (o.get(m.source) || []).some((d) => {
      const D = E.get(d.device);
      return D && D.family === "bjt" && !b(m, D) && D.source === m.source;
    }) && I(_, x(m, m.drain), m);
  const y = (m) => [{ node: m.source, resistor: null }, ...(o.get(m.source) || []).flatMap((d) => {
    const D = n.get(d.device);
    if (D.kind !== "R") return [];
    const q = Object.values(D.terminals).find((G) => G !== m.source);
    return q !== void 0 && q !== m.control && q !== m.drain ? [{ node: q, resistor: D.name }] : [];
  })];
  for (const m of i) m.control === m.drain && u("diode-connected", [m.id], { reference: m.id }, { control: m.control, return: m.source }, ["control-drain-short", m.family]);
  for (const m of i) {
    const d = f.get(x(m, m.control));
    if (d.filter((v) => v.control === v.drain).length > 1) continue;
    let D = null;
    if (m.control !== m.drain && m.family === "bjt" && (D = (f.get(x(m, m.drain)) || []).find((v) => v.id !== m.id && b(v, m) && v.control === m.drain && v.source === m.control && a(v.drain))), m.control !== m.drain && !D) continue;
    const q = y(m), G = [];
    let K = null, O = [];
    for (const v of d) {
      if (v.id === m.id || v.id === D?.id || v.drain === m.drain || v.drain === v.control) continue;
      const P = q.flatMap((Q) => y(v).filter((V) => Q.node === V.node).map((V) => ({ node: Q.node, rs: [Q.resistor, V.resistor].filter(Boolean) }))).find((Q) => K === null || Q.node === K);
      P && (K = P.node, G.push(v.id), O.push(...P.rs));
    }
    if (G.length) {
      const v = G.every((P) => E.get(P).body === m.body);
      u("current-mirror", [m.id, ...G, ...D ? [D.id] : []], { reference: m.id, outputs: G, ...D ? { helper: D.id } : {} }, { control: m.control, return: K }, ["same-polarity", "shared-control", D ? "emitter-follower-reference" : "diode-reference", O.length ? "resistive-common-return" : "shared-return", v ? "compatible-bodies" : "different-body-connections"], D ? "assisted" : O.length ? "degenerated" : "basic", [...O, ...D ? [D.id] : []], v ? "high" : "medium");
    }
  }
  const N = [], T = /* @__PURE__ */ new Set(), M = (m, d) => {
    const D = JSON.stringify([m.id, d.id].sort());
    T.has(D) || (T.add(D), N.push([m, d]));
  };
  for (const m of w.values()) if (!a(m[0].source)) {
    const d = m.filter((D) => D.control !== D.drain);
    d.length === 2 ? M(...d) : d.length > 2 && new Set(d.map((D) => D.control)).size > 1 && u("differential-pair", d.map((D) => D.id), { inputs: d.map((D) => D.id) }, { tail: d[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const m of _.values()) for (let d = 0; d < m.length; d++) for (let D = d + 1; D < m.length; D++) M(m[d], m[D]);
  for (const [m, d] of N) {
    if (m.control === d.control || m.control === m.drain || d.control === d.drain) continue;
    if (m.source === d.source && m.drain !== d.drain && !a(m.source)) {
      const G = (o.get(m.source) || []).some((O) => O.device !== m.id && O.device !== d.id), K = w.get(x(m, m.source)).length === 2;
      u("differential-pair", [m.id, d.id], { inputs: [m.id, d.id] }, { tail: m.source }, ["same-polarity", "distinct-controls", "shared-tail", G ? "tail-bias-connection" : "unbiased-tail", K ? "two-input-tail" : "multi-input-tail"], "basic", [], G && K && m.body === d.body ? "high" : "medium");
    }
    if (m.family !== "bjt" || m.drain !== d.drain || m.source === d.source) continue;
    const D = i.filter((G) => G.family === "bjt" && G.polarity !== m.polarity && G.source === m.source), q = i.filter((G) => G.family === "bjt" && G.polarity !== m.polarity && G.source === d.source);
    for (const G of D) for (const K of q) G.id !== K.id && G.control === K.control && G.drain !== K.drain && G.control !== G.drain && K.control !== K.drain && u("differential-pair", [m.id, d.id, G.id, K.id], { inputs: [m.id, d.id], commonBase: [G.id, K.id] }, { inputCollectors: m.drain, bias: G.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const m of i) if (m.family === "bjt" && m.control !== m.drain) {
    const d = r.get(l(m.drain, m.control)) || [], D = r.get(l(m.control, m.source)) || [];
    d.length === 1 && D.length === 1 && u("vbe-multiplier", [m.id], { transistor: m.id, collectorResistor: d[0].name, emitterResistor: D[0].name }, { control: m.control, collector: m.drain, emitter: m.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [d[0].name, D[0].name]);
  }
  const C = i.filter((m) => m.family === "bjt"), L = /* @__PURE__ */ new Map();
  for (const m of C) I(L, m.control, m);
  const U = (m) => (o.get(m) || []).filter((d) => E.has(d.device));
  for (const m of C) if (m.control !== m.drain) {
    for (const d of L.get(m.source) || []) if (d.id !== m.id && b(m, d) && d.drain === m.control && d.source !== m.drain) {
      const D = r.get(l(m.source, d.source)) || [];
      D.length === 1 && u("current-limit-pair", [m.id, d.id], { driver: m.id, output: d.id, senseResistor: D[0].name }, { sense: m.source, drive: m.control, output: d.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [D[0].name]);
    }
    for (const d of L.get(m.source) || []) d.id !== m.id && b(m, d) && d.control !== d.drain && m.drain === d.drain && d.source !== m.control && u("darlington-pair", [m.id, d.id], { driver: m.id, output: d.id }, { link: m.source, collector: m.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (L.get(m.source) || []).length === 1 ? "high" : "medium");
    for (const d of L.get(m.drain) || []) d.id !== m.id && !b(m, d) && d.control !== d.drain && m.source === d.drain && d.source !== m.control && U(m.drain).length === 2 && u("sziklai-pair", [m.id, d.id], { driver: m.id, output: d.id }, { link: m.drain, feedback: m.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const d of o.get(m.drain) || []) {
      const D = E.get(d.device);
      !D || D.family !== "bjt" || D.id === m.id || !b(m, D) || D.source !== m.drain || a(m.drain) || D.control === m.control || D.control === D.drain || D.drain === m.source || U(m.drain).length !== 2 || u("cascode-pair", [m.id, D.id], { driver: m.id, output: D.id }, { link: m.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const m of C.filter((d) => d.polarity === "npn" && a(d.drain))) for (const d of C.filter((D) => D.polarity === "pnp" && a(D.drain))) {
    if (e[m.drain].potential <= e[d.drain].potential) continue;
    const D = y(m).flatMap((q) => y(d).filter((G) => q.node === G.node && !a(q.node)).map((G) => ({ node: q.node, rs: [q.resistor, G.resistor].filter(Boolean) })))[0];
    D && u("push-pull-pair", [m.id, d.id], { upper: m.id, lower: d.id }, { output: D.node }, ["complementary-polarity", "ordered-collector-supplies", D.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", D.rs);
  }
  return p;
}
function Ke(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([i, l]) => [i, o(l)])), nets: Object.fromEntries(Object.entries(r.nets).map(([i, l]) => [i, n(l)])) }));
}
function rn(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), i = new Map(t.components.map((l) => [l.name, l]));
  for (const l of n) {
    if (new Set(l.members).size !== l.members.length) throw Error("Duplicate @layout pair member.");
    const a = l.members.map((f) => i.get(f));
    if (a.some((f) => !f)) throw Error("Unknown @layout pair device.");
    const p = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[l.kind], h = l.kind === "differential" && a.length === 2 ? t.components.filter((f) => !l.members.includes(f.name) && Object.values(f.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], u = Ye({ ...t, components: [...a, ...h] }, e), b = u.find((f) => f.kind === p && f.confidence === "high" && l.members.every((w) => f.members.includes(w)));
    if (!b) throw Error("Invalid @layout pair " + l.kind + " { " + l.members.join(" ") + " }: electrical structure does not match.");
    for (const f of u.filter((w) => w === b || w.kind === "diode-connected" && w.members.every((_) => b.members.includes(_)))) {
      const w = JSON.stringify([f.kind, [...f.members].sort()]);
      r.has(w) || (r.add(w), o.push({ ...f, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function on(t, e, n = Ye(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((f) => f.kind === "R"), i = t.components.filter((f) => f.kind === "Q"), l = new Map(t.components.map((f) => [f.name, f])), a = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), h = (f) => Object.values(f.terminals), u = (f, w, _) => {
    f && o.set(f.name, { reverse: h(f)[0] !== w, reason: _ });
  };
  for (const f of i) {
    const { C: w, B: _, E } = f.terminals, I = f.type.endsWith("pnp"), x = f.type.endsWith("npn");
    !I && !x || (a.has(E) || a.set(E, []), a.get(E).push(f), w === _ && e[E]?.potential !== null && e[E]?.potential !== void 0 && p.set(w, { potential: e[E].potential }));
  }
  for (const f of n) if (f.kind === "vbe-multiplier" && f.confidence === "high") {
    const w = l.get(f.roles.transistor), _ = w.type.endsWith("pnp"), E = l.get(_ ? f.roles.emitterResistor : f.roles.collectorResistor), I = l.get(_ ? f.roles.collectorResistor : f.roles.emitterResistor);
    u(E, w.terminals[_ ? "E" : "C"], "recognized VBE multiplier"), u(I, w.terminals.B, "recognized VBE multiplier");
  }
  for (const f of r) {
    const [w, _] = h(f), E = p.get(w), I = p.get(_);
    E && I && E.potential !== I.potential && u(f, E.potential > I.potential ? w : _, "diode-connected bias reference");
  }
  const b = /* @__PURE__ */ new Map();
  for (const f of r) {
    const w = h(f);
    if (!w.some((_) => e[_]?.potential !== null && e[_]?.potential !== void 0))
      for (const _ of w)
        b.has(_) || b.set(_, []), b.get(_).push(f);
  }
  for (const [f, w] of b)
    if (!(w.length > 12))
      for (const _ of w) for (const E of w) {
        if (_ === E) continue;
        const I = h(_).find((T) => T !== f), x = h(E).find((T) => T !== f), y = a.get(I)?.find((T) => T.type.endsWith("npn")), N = a.get(x)?.find((T) => T.type.endsWith("pnp"));
        y && N && (u(_, I, "complementary emitter output"), u(E, f, "complementary emitter output"));
      }
  return o;
}
function sn(t) {
  const e = t.components.filter((i) => i.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((i) => i.kind === "R").map((i) => Object.values(i.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const l = i.terminals.E;
    n.has(l) || n.set(l, []), n.get(l).push(i);
  }
  for (const i of e) {
    const { B: l, C: a, E: p } = i.terminals;
    if (l === p || !o.has([l, p].sort().join("|"))) continue;
    const h = n.get(l) || [];
    if (!(h.length > 16))
      for (const u of h) {
        if (u === i) continue;
        if (u.terminals.B === a) {
          r.add(i.name);
          break;
        }
        const b = n.get(u.terminals.B) || [];
        if (b.length <= 16 && b.some((f) => f !== i && f !== u && f.terminals.B === a)) {
          r.add(i.name);
          break;
        }
      }
  }
  return r;
}
const $e = 20;
function qe(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const Oe = (t) => ["pwr", "ret", "bias"].includes(t), an = (t) => String(t).split("/").at(-1).toLowerCase(), bt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[an(t)] || "unknown", st = (t) => {
  const e = qe(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || bt(t);
};
function cn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (l, a, p) => {
    e.has(l) || e.set(l, []), e.get(l).push({ node: a, delta: p });
  };
  for (const l of t)
    if (l.kind === "V")
      try {
        let a = l.value.trim();
        const p = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (p && Number(Se(p[1], l.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const h = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!h) continue;
        const u = Se(h[1], l.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        o(l.terminals["-"], l.terminals["+"], u), o(l.terminals["+"], l.terminals["-"], -u);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ new Set();
  for (const l of ["0", ...e.keys()]) {
    if (i.has(l)) continue;
    const a = /* @__PURE__ */ new Map([[l, 0]]), p = [l];
    i.add(l);
    let h = !1;
    for (let u = 0; u < p.length; u++) for (const b of e.get(p[u]) || []) {
      const f = a.get(p[u]) + b.delta;
      a.has(b.node) ? Math.abs(a.get(b.node) - f) > 1e-8 * Math.max(1, Math.abs(f)) && (h = !0) : (a.set(b.node, f), i.add(b.node), p.push(b.node));
    }
    h && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, b] of a) r[u] = { value: b, reference: l, known: l === "0" && !h, consistent: !h };
  }
  return { nodes: r, diagnostics: n };
}
function ln(t, e, n = null) {
  const o = cn(Ne(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const b = qe(u.name), f = bt(u.name);
    r[u.name] = { role: b !== "unknown" ? b : f, roleSource: b !== "unknown" ? "node-name" : f !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[u.name]?.known ? o.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const b = r[u.local], f = st(u.port);
    b && b.potential === null && ["pwr", "ret"].includes(f) && (b.potential = f === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, b.potentialSource = "symbolic-port-order");
  }
  const l = n?.pairs?.length ? rn(e, r, n.pairs) : Ye(e, r), a = on(e, r, l), p = sn(e), h = (u, b, f) => {
    const w = { role: r[f].role, roleSource: r[f].roleSource }, _ = u.block?.ports.find((x) => x.pin === b);
    if (_?.implicit || !u.block && !u.synthetic) return w;
    const E = u.synthetic ? u.value : _?.name || _?.label, I = st(E);
    return I !== "unknown" ? { role: I, roleSource: qe(E) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : Oe(w.role) ? { ...w, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const b = Object.fromEntries(Object.entries(u.terminals).map(([U, m]) => [U, { ...r[m], ...h(u, U, m) }])), f = Object.values(b), w = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), _ = w && !a.has(u.name) && f.length === 2 && f.every((U) => !Oe(U.role) && (U.potential === null || U.role !== "unknown")), E = u.terminals["+"], I = u.terminals["-"], x = [E, I].filter((U) => U && U !== "0"), y = u.kind === "V" && x.some((U) => Oe(r[U]?.role)) && !x.some((U) => ["in", "out", "io", "fb"].includes(r[U]?.role)) && [E, I].every((U) => o.nodes[U]?.known), N = E === "0" ? I : E, T = Object.keys(u.terminals), M = (U) => Oe(U.role) ? U.potential !== null ? U.potential > 0 ? "high" : "low" : U.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    T.length === 2 && (u.kind === "V" && f.every((U) => U.potential !== null) ? C = f[0].potential < f[1].potential : u.terminals[T[0]] === "0" ? C = !0 : u.terminals[T[1]] === "0" ? C = !1 : f.every((U) => U.potential !== null) ? C = f[0].potential < f[1].potential : C = M(f[0]) === "low" || M(f[1]) === "high" && M(f[0]) === "signal"), a.has(u.name) && (C = a.get(u.name).reverse);
    const L = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    i[u.name] = { version: $e, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: p.has(u.name), orientationReason: a.get(u.name)?.reason || null, owner: L.includes("/") ? L.slice(0, L.lastIndexOf("/")) : "", passive: w, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !w, ports: b, horizontal: _, orientation: _ ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: T.length === 2 && (w || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!y, voltage: y ? o.nodes[N].value : null };
  }
  return { version: $e, nodes: r, cells: i, motifs: l, diagnostics: o.diagnostics };
}
function yt(t, e) {
  const n = e.ports.map((r, i) => ({ pin: "P" + i, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(Ne(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const i = We([], r);
    o.has(i) && !n.some((l) => l.node === i) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: i, implicit: !0 });
  }
  return n;
}
function un(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  o && (t = ze(t.ir, { isolate: o }));
  const l = t.contexts[o];
  if (!l) throw Error("Unknown instance: " + o);
  const a = [], p = [];
  function h(_) {
    p.push(...Object.values(_.nodes), ..._.ports.map((I) => I.node));
    const E = [..._.devices.map((I) => ({ line: I.line, device: I })), ..._.children.map((I) => ({ line: I.line, child: I }))].sort((I, x) => I.line - x.line);
    for (const I of E) {
      if (I.device) {
        const T = I.device;
        a.push({ ...T, layoutLabel: [..._.path.slice(l.path.length), T.localName].join("/") });
        continue;
      }
      const x = I.child;
      if (e === "flat" || n.has(x.id)) {
        h(x);
        continue;
      }
      const y = yt(t, x), N = se();
      y.forEach((T) => {
        N[T.pin] = T.node;
      }), a.push({ name: x.id, kind: "X", type: "spice_subckt", terminals: N, value: x.definition, raw: x.raw, line: x.line, instanceId: x.id, layoutLabel: x.path.slice(l.path.length).join("/"), block: { definitionId: x.scopeId, ports: y, parameters: x.params } });
    }
  }
  h(l);
  for (const [_, E] of l.ports.entries()) a.push({ name: "@port/" + o + "/" + _, kind: "PORT", type: "spice_port", terminals: { A: E.node }, layoutLabel: E.name, value: E.name, raw: "Interface port " + E.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(se(), ...Object.values(t.contexts).map((_) => _.models)), b = { title: o || t.ir.title, components: a, nodes: Ht(a, p), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  b.interfaceBindings = l.ports.map((_, E) => ({ port: _.name, local: _.node, parent: i.ports[E].node }));
  const f = /* @__PURE__ */ new Map();
  for (const _ of i.ports)
    f.has(_.node) || f.set(_.node, []), f.get(_.node).push(_.name);
  b.interfaceAliases = [...f].filter(([, _]) => _.length > 1).map(([_, E]) => ({ node: _, ports: E })), b.topology = dn(r, b);
  const w = Ft(t, b);
  return b.layout = ln(t, b, w), b.layout.description = w, b;
}
function dn(t, e) {
  const n = Ne(t.contexts[e.focus]);
  e.localScope && (t = ze(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const p = t.contexts[a.instanceId];
        if (!p) throw Error("Projection contains an unknown block.");
        const h = yt(t, p);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(h.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + a.name);
        o.push(...Ne(p));
      } else o.push(a);
  for (const a of o) {
    if (r.has(a.name)) throw Error("Projection duplicates " + a.name);
    r.add(a.name);
  }
  const i = Te(o), l = Ne(t.contexts[e.focus]);
  if (i !== Te(l)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), p = (u) => a.get(u) ?? u, h = o.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([b, f]) => [b, p(f)])), value: Xe(u.value, {}, p, (b) => b) }));
    if (Te(h) !== Te(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: i, boundSignature: Te(n), boundaryVerified: !0 };
}
function at(t) {
  const e = se(), n = se();
  for (const o of t.components) {
    const r = se(), i = se();
    for (const [l, a] of Object.entries(o.terminals))
      r[l] = [t.nodes[a].bit], i[l] = "input";
    e[o.name] = { type: o.type, port_directions: i, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((l) => ({ pin: l.pin, label: l.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((l, a) => ({ pin: l, label: o.pinLabels?.[a] || l })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ke(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function fn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (h) => (n.has(h) || n.set(h, n.size + 2), n.get(h));
  Object.entries(t.modules.circuit.cells).forEach(([h, u], b) => {
    const f = "c" + b;
    e.set(f, h);
    const w = Object.fromEntries(Object.entries(u.connections).map(([_, E]) => [_, E.map(r)]));
    o[f] = { type: u.type, connections: w, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (o[f].spiceBlock = u.spiceBlock), u.spiceSymbol && (o[f].spiceSymbol = u.spiceSymbol), u.spiceLayout && (o[f].spiceLayout = u.spiceLayout);
  });
  const i = new Map([...e].map(([h, u]) => [u, h])), l = t.modules.circuit.spiceLayoutDescription, a = l ? { ...l, faces: (l.faces || []).map((h) => ({ ...h, device: i.get(h.device) })), pairs: (l.pairs || []).map((h) => ({ ...h, members: h.members.map((u) => i.get(u)) })), groups: l.groups.map((h) => ({ ...h, members: h.members.map((u) => u.cell ? { ...u, cell: i.get(u.cell) } : u) })), relations: l.relations.map((h) => ({ ...h, a: i.get(h.a) || h.a, b: i.get(h.b) || h.b })) } : null, p = Ke(t.modules.circuit.spiceMotifs || [], (h) => i.get(h), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: p, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([h, u]) => [u, h])) };
}
const we = /* @__PURE__ */ new Map();
async function pn(t, e) {
  const n = fn(t), o = JSON.stringify([n.netlist, e]);
  let r = we.get(o);
  r ? (we.delete(o), we.set(o, r)) : (r = await hn(n.netlist, e), r.svg.length < 1e6 && (we.set(o, r), we.size > 20 && we.delete(we.keys().next().value)));
  const i = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (i.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const p of i.querySelectorAll("[id],[class]")) {
    const h = p.getAttribute("id");
    h?.startsWith("cell_") && n.ids.has(h.slice(5)) && p.setAttribute("id", "cell_" + n.ids.get(h.slice(5)));
    const u = p.getAttribute("class");
    u && p.setAttribute("class", u.split(/\s+/).map((b) => b.startsWith("cell_") && n.ids.has(b.slice(5)) ? "cell_" + n.ids.get(b.slice(5)) : /^net_\d+$/.test(b) && n.bits.has(Number(b.slice(4))) ? "net_" + n.bits.get(Number(b.slice(4))) : b).join(" "));
  }
  const l = r.drawing ? structuredClone(r.drawing) : null, a = i.querySelector("#spice-layout-report");
  if (a) {
    const p = JSON.parse(a.textContent), h = (u) => n.ids.get(u) || u;
    p.mirroredTransistors = (p.mirroredTransistors || []).map(h), p.orientationDevicesTested = (p.orientationDevicesTested || []).map(h), p.recognizedMotifs = Ke(p.recognizedMotifs || [], h, (u) => n.bits.get(u) ?? u), p.inputAttachments = (p.inputAttachments || []).map(h), p.mirroredInputPorts = (p.mirroredInputPorts || []).map(h);
    for (const u of [...p.flippedPairs || [], ...p.pairOrientationTrials || []]) u.members = u.members.map(h);
    for (const u of p.pairCompactions || [])
      u.members = u.members.map(h), u.moved = h(u.moved);
    for (const u of p.pairConstraints || []) u.members = u.members.map(h);
    for (const u of p.pairProximity || []) u.members = u.members.map(h);
    for (const u of p.motifMeasurements || [])
      u.members = u.members.map(h), u.interlopers && (u.interlopers = u.interlopers.map(h));
    for (const u of p.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    a.textContent = JSON.stringify(p);
  }
  if (l) {
    for (const p of l.components) {
      p.id = n.ids.get(p.id) || p.id;
      for (const h of p.ports) h.bit = n.bits.get(h.bit) ?? h.bit;
    }
    for (const p of l.segments) p.bit = n.bits.get(p.bit) ?? p.bit;
  }
  return { svg: new XMLSerializer().serializeToString(i.documentElement), drawing: l };
}
function hn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-CkF79f-P.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const i = (p, h) => {
      clearTimeout(a), n.terminate(), p ? r(Error(p)) : o(h);
    }, l = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => i("Layout timed out. Open a subcircuit sheet or collapse instances."), l);
    n.onmessage = ({ data: p }) => i(p.error, { svg: p.svg, drawing: p.drawing }), n.onerror = (p) => i(p.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const mn = `* RLC low-pass filter
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
`, gn = `* Voltage-divider biased common-emitter amplifier.
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
`, bn = `* Common-collector voltage follower; independently chosen example values.
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
`, yn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, wn = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, Re = {
  filter: { source: mn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: gn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: bn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: yn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: wn, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function En(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function ct(t) {
  return En(await t.arrayBuffer());
}
const wt = [
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
].flat(), Ze = "#292b29", Pe = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => wt[e * 9 + t]))])], lt = (t) => /^#[\da-f]{6}$/i.test(t), ut = "spice-node-colors-v1";
function _n(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class xn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = _n(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Pe[this.assigned.size % Pe.length]), this.assigned.get(e)) : Ze;
  }
  set(e, n) {
    if (!lt(n)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && lt(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function vn(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const i = o.get(r.getAttribute("data-net"));
    if (!i) continue;
    r.style.setProperty("stroke", i, "important"), r.localName === "circle" && r.style.setProperty("fill", i, "important");
  }
}
function Nn(t, e) {
  const n = new xn(), o = /* @__PURE__ */ new Set();
  let r = [], i = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(ut) || "null"));
  } catch {
  }
  const l = () => {
    try {
      sessionStorage.setItem(ut, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const f = t("node-search").value.trim().toLowerCase();
    return r.filter((w) => !f || [w.name, w.displayName, ...w.terminals.map((_) => _.component + "." + _.pin)].some((_) => _.toLowerCase().includes(f)));
  };
  function p() {
    const f = a(), w = f.filter((_) => o.has(_.name)).length;
    t("node-count").textContent = `${f.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!f.length && w === f.length, t("node-all").indeterminate = w > 0 && w < f.length, t("node-auto").checked = n.auto;
    for (const _ of ["node-apply", "node-clear"]) t(_).disabled = !i || !o.size;
    t("node-all").disabled = !i || !f.length;
  }
  function h() {
    t("nets").replaceChildren(...a().map((f) => {
      const w = document.createElement("tr");
      w.dataset.node = f.name;
      const _ = document.createElement("td"), E = document.createElement("input");
      E.type = "checkbox", E.checked = o.has(f.name), E.disabled = !i, E.setAttribute("aria-label", "Select node " + f.displayName), E.onchange = () => {
        E.checked ? o.add(f.name) : o.delete(f.name), p();
      }, _.append(E);
      const I = document.createElement("td");
      I.textContent = f.displayName;
      const x = document.createElement("td"), y = document.createElement("input");
      y.type = "color", y.value = n.color(f.name), y.disabled = !i, y.setAttribute("aria-label", "Wire color for " + f.displayName), y.onchange = () => {
        n.set([f.name], y.value), u();
      }, x.append(y);
      const N = document.createElement("td");
      return N.textContent = f.terminals.map((T) => T.component + "." + T.pin).join(", "), w.append(_, I, x, N), w;
    })), p();
  }
  function u() {
    for (const f of r) n.color(f.name);
    h(), l(), e(n, r);
  }
  t("node-search").oninput = h, t("node-all").onchange = () => {
    for (const f of a()) t("node-all").checked ? o.add(f.name) : o.delete(f.name);
    h();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, u();
  }, t("node-apply").onclick = () => {
    n.set(o, t("node-color").value), u();
  }, t("node-clear").onclick = () => {
    n.set(o, Ze), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...wt.map((f) => {
    const w = document.createElement("button");
    return w.type = "button", w.style.backgroundColor = f, w.title = f, w.setAttribute("aria-label", "Apply palette color " + f), w.onclick = () => {
      o.size && (t("node-color").value = f, n.set(o, f), u());
    }, w;
  }));
  function b(f) {
    i = f;
    for (const w of t("node-panel").querySelectorAll("input,button")) w.disabled = !i;
    p();
  }
  return { setCircuit(f, w) {
    const _ = n.sourceId;
    n.setSource(w), _ !== n.sourceId && o.clear(), r = Object.values(f?.nodes || {});
    const E = new Set(r.map((I) => I.name));
    for (const I of o) E.has(I) || o.delete(I);
    for (const I of r) n.color(I.name);
    i = !!f, h(), b(i), l(), e(n, r);
  }, setEnabled: b };
}
function Cn(t) {
  const e = (O) => t.querySelector("#spice-" + O), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), info: e("info-panel") }, i = Object.fromEntries(Object.keys(r).map((O) => [O, t.querySelector(`[data-window-handle="${O}"]`)])), l = { editor: !0, info: !0 }, a = { editor: !0, info: !0 }, p = [], h = { editor: {}, info: {} }, u = [];
  let b = !1, f = !1, w = null, _ = null, E = null, I = null;
  function x(O, v) {
    if (a[O] = v, r[O].dataset.pinned = String(v), e("pin-" + O).setAttribute("aria-pressed", String(v)), v) for (const P of ["left", "top", "right", "bottom", "width", "height"]) r[O].style.removeProperty(P);
  }
  for (const O of Object.keys(r)) x(O, !0);
  const y = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: b, panels: { ...l } } })), N = (O, v, P, Q = {}) => O.addEventListener(v, P, { ...Q, signal: o });
  function T(O, v) {
    l[O] = v, r[O].hidden = b && !v, e("show-" + O).setAttribute("aria-expanded", String(v)), y();
  }
  function M(O) {
    const v = document.createComment("workspace return");
    O.before(v), p.push({ node: O, anchor: v }), e("info-content").prepend(O);
  }
  function C(O) {
    const v = O.getBoundingClientRect(), P = t.getBoundingClientRect();
    return { x: v.left - P.left, y: v.top - P.top, w: v.width, h: v.height, width: P.width, height: P.height };
  }
  function L(O, v, P) {
    const Q = C(O), V = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, Y = Math.max(8, Math.min(v, Q.width - Q.w - 8)), H = Math.max(8, Math.min(V, Q.height - Q.h - 8)), B = Math.max(H, Math.min(P, Q.height - Q.h - 8));
    O.style.left = Math.round(Y) + "px", O.style.top = Math.round(B) + "px", O.style.right = "auto", O.style.bottom = "auto";
  }
  function U() {
    if (b) {
      for (const [O, v] of Object.entries(r)) if (!v.hidden && !a[O]) {
        const P = C(v);
        L(v, P.x, P.y);
      }
    }
  }
  function m() {
    for (const O of Object.values(r))
      for (const v of ["left", "top", "right", "bottom", "width", "height", "z-index"]) O.style.removeProperty(v);
    for (const O of Object.keys(r))
      x(O, !0), T(O, !0);
    requestAnimationFrame(U);
  }
  function d() {
    if (!b) {
      b = !0, w = document.activeElement, _ = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, I = document.createComment("workspace mount"), t.before(I), document.body.append(t);
      for (const O of document.body.children) O !== t && (u.push({ node: O, inert: O.inert }), O.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const O of Object.keys(r))
        h[O].base = r[O].style.cssText, h[O].floating && (r[O].style.cssText = h[O].floating), r[O].setAttribute("role", "dialog"), r[O].setAttribute("aria-modal", "false"), r[O].setAttribute("aria-labelledby", "spice-" + O + "-title"), i[O].tabIndex = 0, i[O].title = "Drag to move; arrow keys move the window", T(O, l[O]);
      for (const O of ["selection-actions", "selection", "edit-help", "hierarchy-panel"]) M(e(O));
      requestAnimationFrame(U), e("exit-fullscreen").focus({ preventScroll: !0 }), y();
    }
  }
  function D() {
    if (b) {
      b = !1, E = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: O, anchor: v } of p.splice(0))
        v.before(O), v.remove();
      for (const O of Object.keys(r)) {
        h[O].floating = r[O].style.cssText, r[O].style.cssText = h[O].base, r[O].hidden = !1;
        for (const v of ["role", "aria-modal", "aria-labelledby"]) r[O].removeAttribute(v);
        i[O].removeAttribute("tabindex"), i[O].removeAttribute("title");
      }
      I && (I.before(t), I.remove(), I = null);
      for (const { node: O, inert: v } of u.splice(0)) O.inert = v;
      _ && (document.documentElement.style.overflow = _.html, document.body.style.overflow = _.body, window.scrollTo(_.x, _.y)), w?.focus?.({ preventScroll: !0 }), y();
    }
  }
  async function q() {
    d(), t.dataset.nativeFullscreen = "false";
  }
  async function G() {
    if (f = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        f = !0;
        return;
      }
    D();
  }
  N(e("fullscreen"), "click", () => b ? G() : q()), N(e("exit-fullscreen"), "click", G), N(e("reset-windows"), "click", m);
  for (const O of Object.keys(r)) {
    N(e("pin-" + O), "click", () => {
      const Q = C(r[O]);
      x(O, !a[O]), a[O] || (r[O].style.width = Q.w + "px", r[O].style.height = Q.h + "px", L(r[O], Q.x, Q.y)), y();
    }), N(e("show-" + O), "click", () => {
      T(O, !l[O]), requestAnimationFrame(U);
    }), N(e("close-" + O), "click", () => {
      T(O, !1), e("show-" + O).focus({ preventScroll: !0 });
    }), N(r[O], "pointerdown", () => {
      if (b) {
        for (const Q of Object.values(r)) Q.style.zIndex = "20";
        r[O].style.zIndex = "30";
      }
    }, { capture: !0 });
    const v = i[O];
    N(v, "pointerdown", (Q) => {
      if (!b || Q.button !== 0 || Q.target.closest("button,input,select,textarea,a,label")) return;
      Q.preventDefault();
      const V = C(r[O]);
      x(O, !1), r[O].style.width = V.w + "px", r[O].style.height = V.h + "px", L(r[O], V.x, V.y), E = { id: O, pointer: Q.pointerId, x: Q.clientX, y: Q.clientY, left: V.x, top: V.y }, v.setPointerCapture(Q.pointerId);
    }), N(v, "pointermove", (Q) => {
      E?.id === O && E.pointer === Q.pointerId && L(r[O], E.left + Q.clientX - E.x, E.top + Q.clientY - E.y);
    });
    const P = () => {
      E = null;
    };
    N(v, "pointerup", P), N(v, "pointercancel", P), N(v, "lostpointercapture", P), N(v, "keydown", (Q) => {
      if (!b || Q.target !== v || !Q.key.startsWith("Arrow")) return;
      Q.preventDefault();
      const V = C(r[O]), Y = Q.shiftKey ? 32 : 8;
      x(O, !1), r[O].style.width = V.w + "px", r[O].style.height = V.h + "px", L(r[O], V.x + ({ ArrowLeft: -Y, ArrowRight: Y }[Q.key] || 0), V.y + ({ ArrowUp: -Y, ArrowDown: Y }[Q.key] || 0));
    });
  }
  N(document, "fullscreenchange", () => {
    b && f && document.fullscreenElement !== t && (f = !1, D());
  }), N(document, "keydown", (O) => {
    b && O.altKey && O.key === "Escape" && (O.preventDefault(), O.stopImmediatePropagation(), G());
  }, { capture: !0 }), N(window, "resize", U);
  const K = new ResizeObserver(U);
  for (const O of Object.values(r)) K.observe(O);
  return { enter: q, exit: G, showPanel: T, reset: m, destroy() {
    G(), n.abort(), K.disconnect();
  } };
}
const re = 1e-3, te = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ne = (t, e) => Math.abs(t - e) < re, ge = (t, e) => ne(e.a.x, e.b.x) ? ne(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - re && t.y <= Math.max(e.a.y, e.b.y) + re : ne(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - re && t.x <= Math.max(e.a.x, e.b.x) + re, In = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Tn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + re && Math.min(t.a.x, t.b.x) < e.x + e.width - re && Math.max(t.a.y, t.b.y) > e.y + re && Math.min(t.a.y, t.b.y) < e.y + e.height - re;
function Be(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && te(e.at(-1)) === te(n))) {
      for (; e.length > 1 && (ne(e.at(-2).x, e.at(-1).x) && ne(e.at(-1).x, n.x) || ne(e.at(-2).y, e.at(-1).y) && ne(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class Sn {
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
    return ne(e.x / this.step, Math.round(e.x / this.step)) && ne(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !ne(e.a.x, e.b.x) && !ne(e.a.y, e.b.y)) return !1;
    const o = this.pins();
    if (o.some((r) => r.bit !== n && ge(r, e)) || this.segments.some((r) => r.bit !== n && (ge(e.a, r) || ge(e.b, r) || ge(r.a, e) || ge(r.b, e)))) return !1;
    for (const r of this.components) if (Tn(e, r) && !o.filter((l) => l.owner === r.id && l.bit === n).some((l) => l.side === "NORTH" ? ne(e.a.x, l.x) && ne(e.b.x, l.x) && Math.max(e.a.y, e.b.y) <= l.y + re : l.side === "SOUTH" ? ne(e.a.x, l.x) && ne(e.b.x, l.x) && Math.min(e.a.y, e.b.y) >= l.y - re : l.side === "WEST" ? ne(e.a.y, l.y) && ne(e.b.y, l.y) && Math.max(e.a.x, e.b.x) <= l.x + re : l.side === "EAST" ? ne(e.a.y, l.y) && ne(e.b.y, l.y) && Math.min(e.a.x, e.b.x) >= l.x - re : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const o = Be(n), r = o.slice(1).map((i, l) => ({ bit: e, a: o[l], b: i })).filter((i) => In(i) > re);
    if (!r.length) return !1;
    if (r.some((i) => !this.validSegment(i, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, o) {
    if (n = Math.round(n / this.step) * this.step, o = Math.round(o / this.step) * this.step, !n && !o) return;
    const r = this.snapshot(), i = this.components.find((p) => p.id === e);
    if (!i) return;
    const l = i.ports.map((p) => ({ ...p }));
    this.segments = this.segments.filter((p) => !l.some((h) => h.bit === p.bit && (te(h) === te(p.a) || te(h) === te(p.b)))), i.x += n, i.y += o;
    for (const p of i.ports)
      p.x += n, p.y += o;
    if (this.pinCache = null, this.components.some((p) => p !== i && i.x < p.x + p.width - re && i.x + i.width > p.x + re && i.y < p.y + p.height - re && i.y + i.height > p.y + re) || this.segments.some((p) => !this.validSegment(p, p.bit)) || i.ports.some((p) => this.pins().some((h) => h.owner !== e && h.bit !== p.bit && te(h) === te(p))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  transform(e, n) {
    const o = this.components.find((f) => f.id === e);
    if (!o) return;
    const r = this.snapshot(), i = o.width, l = o.height, a = n === "rotate" ? [0, 1, -1, 0, l, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, l] : n === "mirror-y" ? [-1, 0, 0, 1, i, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const p = o.ports.map((f) => ({ ...f })), h = (f) => ({ x: a[0] * f.x + a[2] * f.y + a[4], y: a[1] * f.x + a[3] * f.y + a[5] });
    this.segments = this.segments.filter((f) => !p.some((w) => w.bit === f.bit && (te(w) === te(f.a) || te(w) === te(f.b))));
    const u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const f of o.ports) {
      const w = h({ x: f.x - o.x, y: f.y - o.y });
      f.x = o.x + w.x, f.y = o.y + w.y, f.side = u[f.side] || f.side;
    }
    const b = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]], n === "rotate" && (o.width = l, o.height = i), this.pinCache = null, o.ports.some((f) => !this.onGrid(f)) || this.components.some((f) => f !== o && o.x < f.x + f.width - re && o.x + o.width > f.x + re && o.y < f.y + f.height - re && o.y + o.height > f.y + re) || this.segments.some((f) => !this.validSegment(f, f.bit)) || o.ports.some((f) => this.pins().some((w) => w.owner !== e && w.bit !== f.bit && te(w) === te(f))))
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
      const i = /* @__PURE__ */ new Map(), l = (u) => {
        i.has(te(u)) || i.set(te(u), u);
      };
      r.pins.forEach(l);
      for (const u of r.segments)
        l(u.a), l(u.b);
      for (let u = 0; u < r.segments.length; u++) for (let b = u + 1; b < r.segments.length; b++) {
        const f = r.segments[u], w = r.segments[b];
        if (ne(f.a.x, f.b.x) === ne(w.a.x, w.b.x)) continue;
        const _ = ne(f.a.x, f.b.x) ? f : w, E = _ === f ? w : f, I = { x: _.a.x, y: E.a.y };
        ge(I, _) && ge(I, E) && l(I);
      }
      const a = new Map([...i.keys()].map((u) => [u, u])), p = (u) => {
        let b = u;
        for (; a.get(b) !== b; ) b = a.get(b);
        for (; u !== b; ) {
          const f = a.get(u);
          a.set(u, b), u = f;
        }
        return b;
      };
      for (const u of r.segments) {
        const b = [...i.values()].filter((f) => ge(f, u));
        for (const f of b.slice(1)) a.set(p(te(f)), p(te(b[0])));
      }
      const h = /* @__PURE__ */ new Map();
      for (const u of r.pins) {
        const b = p(te(u));
        h.has(b) || h.set(b, { pins: [], points: [] }), h.get(b).pins.push(u);
      }
      for (const u of i.values()) {
        const b = p(te(u));
        h.has(b) && h.get(b).points.push(u);
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
        for (const l of r) for (let a = 0; a < o.length; a++) if (!r.has(a)) for (const p of o[l].points) for (const h of o[a].points) {
          const u = (p.x - h.x) ** 2 + (p.y - h.y) ** 2;
          (!i || u < i.d) && (i = { bit: n, a: p, b: h, d: u, j: a });
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
    const r = (M) => M.slice(1).every((C, L) => this.validSegment({ a: M[L], b: C }, e));
    for (const M of [[n, o], [n, { x: o.x, y: n.y }, o], [n, { x: n.x, y: o.y }, o]]) {
      const C = Be(M);
      if (r(C)) return C;
    }
    const i = this.step, l = this.bounds(), a = Math.floor(Math.min(l.x, n.x, o.x) / i) - 5, p = Math.ceil(Math.max(l.x + l.w, n.x, o.x) / i) + 5, h = Math.floor(Math.min(l.y, n.y, o.y) / i) - 5, u = Math.ceil(Math.max(l.y + l.h, n.y, o.y) / i) + 5, b = { x: n.x / i, y: n.y / i, dir: -1, cost: 0, key: n.x / i + "," + n.y / i + ",-1" }, f = [b], w = /* @__PURE__ */ new Map([[b.key, 0]]), _ = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map([[b.key, b]]), I = [[1, 0], [-1, 0], [0, 1], [0, -1]], x = (M) => Math.abs(M.x - o.x / i) + Math.abs(M.y - o.y / i);
    let y = null, N = 0;
    for (; f.length && N++ < 3e4; ) {
      let M = 0;
      for (let L = 1; L < f.length; L++) f[L].cost + x(f[L]) < f[M].cost + x(f[M]) && (M = L);
      const C = f.splice(M, 1)[0];
      if (C.cost === w.get(C.key)) {
        if (C.x === o.x / i && C.y === o.y / i) {
          y = C;
          break;
        }
        for (let L = 0; L < 4; L++) {
          const U = C.x + I[L][0], m = C.y + I[L][1];
          if (U < a || U > p || m < h || m > u) continue;
          const d = { x: U, y: m, dir: L, key: U + "," + m + "," + L, cost: C.cost + 1 + (C.dir !== -1 && C.dir !== L ? 3 : 0) };
          d.cost >= (w.get(d.key) ?? 1 / 0) || !this.validSegment({ a: { x: C.x * i, y: C.y * i }, b: { x: U * i, y: m * i } }, e) || (w.set(d.key, d.cost), _.set(d.key, C.key), E.set(d.key, d), f.push(d));
        }
      }
    }
    if (!y) return null;
    const T = [];
    for (let M = y; M; M = E.get(_.get(M.key))) T.push({ x: M.x * i, y: M.y * i });
    return Be(T.reverse());
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
      const i = this.airwires().find((a) => !o.has(a.bit + ":" + te(a.a) + ":" + te(a.b)));
      if (!i) break;
      const l = this.findPath(i.bit, i.a, i.b);
      l ? (this.segments.push(...l.slice(1).map((a, p) => ({ bit: i.bit, a: l[p], b: a }))), this.cache = null) : o.add(i.bit + ":" + te(i.a) + ":" + te(i.b)), r % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const An = "http://www.w3.org/2000/svg", ce = (t, e = {}) => {
  const n = document.createElementNS(An, t);
  for (const [o, r] of Object.entries(e)) n.setAttribute(o, r);
  return n;
}, On = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function kn(t, e, { changed: n, inspect: o, getNetColor: r }) {
  let i = null, l = null, a = !1, p = !1, h = null, u = null, b = -1, f = "", w = 0, _ = "", E = 8, I = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
  const N = (v) => new DOMPoint(v.clientX, v.clientY).matrixTransform(l.getScreenCTM().inverse()), T = (v) => i.snap(N(v)), M = (v) => r?.(v) || Pe[Number(v) % Pe.length], C = (v) => {
    e("editor-status").textContent = v;
  };
  function L() {
    return { unrouted: i?.airwires().length || 0, wires: i?.segments.length || 0, editing: a, routing: p };
  }
  function U() {
    const v = !!i;
    for (const P of ["interactive", "flywire", "auto-route"]) e(P).disabled = !l || p;
    e("edit-tool").disabled = !v || p;
    for (const P of document.querySelectorAll("[data-editor-mode]"))
      P.disabled = !l || p, P.setAttribute("aria-pressed", String(a && P.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !v || p || !i.undoStack.length, e("wire-redo").disabled = !v || p || !i.redoStack.length, t.classList.toggle("spice-editing", a);
  }
  function m(v, P) {
    const Q = y.get(v.id);
    if (Q && (P.replaceChildren(...Q.children.map((V) => V.cloneNode(!0))), v.editorMatrix)) {
      const V = v.editorMatrix, Y = ce("g", { transform: "matrix(" + V.join(" ") + ")", "data-editor-glyph": "true" });
      Y.append(...P.childNodes);
      for (const H of Y.querySelectorAll("text")) H.remove();
      P.append(Y);
      for (const [H, B] of Q.labels.entries()) {
        const J = B.node.cloneNode(!0);
        J.removeAttribute("transform");
        let R = V[0] * B.x + V[2] * B.y + V[4], S = V[1] * B.x + V[3] * B.y + V[5];
        if (v.ports.length === 2 && Q.labels.length === 2) {
          const F = Math.abs(v.ports[0].y - v.ports[1].y) < 1e-3;
          R = F ? v.width / 2 : v.ports[0].x - v.x + 20, S = F ? v.ports[0].y - v.y - 26 + H * 16 : v.height / 2 - 8 + H * 16, J.setAttribute("text-anchor", F ? "middle" : "start");
        }
        J.setAttribute("x", R), J.setAttribute("y", S), P.append(J);
      }
    }
  }
  function d(v) {
    if (h = null, ["rotate", "mirror-x", "mirror-y"].includes(v) && f) {
      try {
        i.transform(f, v), G();
      } catch (P) {
        C(P.message);
      }
      return;
    }
    e("edit-tool").value = v, q(), U();
  }
  function D() {
    if (!i) return;
    const v = L();
    C(`${v.unrouted} connection${v.unrouted === 1 ? "" : "s"} unrouted · ${v.wires} wire segments${p ? " · Auto-routing…" : ""}`), U(), n(i.drawing(), v, i.bounds()), x.set(_, i.snapshot()), x.size > 20 && x.delete(x.keys().next().value);
  }
  function q(v = null) {
    if (l?.querySelector("[data-route-preview]")?.remove(), !h || !l) return;
    const P = [...h.points];
    if (v) {
      const Y = P.at(-1);
      P.push({ x: v.x, y: Y.y }, v);
    }
    const Q = ce("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    Q.append(ce("polyline", { points: P.map((Y) => Y.x + "," + Y.y).join(" "), fill: "none", stroke: M(h.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), l.append(Q);
    const V = l.querySelector("[data-airwires]");
    V && l.append(V);
  }
  function G() {
    if (!l || !i) return;
    for (const H of l.querySelectorAll("[data-editor-body-hit]")) H.remove();
    for (const H of [...l.children]) (H.hasAttribute("data-editor-overlay") || H.hasAttribute("data-airwires") || H.hasAttribute("data-manual-state") || H.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(H.localName)) && H.remove();
    for (const H of i.components) {
      const B = l.getElementById("cell_" + H.id);
      B && (m(H, B), B.setAttribute("s:width", H.width), B.setAttribute("s:height", H.height), B.setAttribute("transform", `translate(${H.x},${H.y})`), B.dataset.editorComponent = H.id, a && B.prepend(ce("rect", { x: 0, y: 0, width: H.width, height: H.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const v = l.querySelector('g[id^="cell_"]'), P = ce("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), Q = ce("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [H, B] of i.segments.entries()) {
      const J = ce("line", { x1: B.a.x, y1: B.a.y, x2: B.b.x, y2: B.b.y, class: "net_" + B.bit, "data-net": I.get(B.bit) || String(B.bit), "stroke-width": H === b ? 2.8 : 1.4 });
      J.append(ce("title")), J.firstChild.textContent = "Node " + (I.get(B.bit) || B.bit), l.insertBefore(J, v), a && P.append(ce("line", { x1: B.a.x, y1: B.a.y, x2: B.b.x, y2: B.b.y, "data-editor-wire": H, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const H of i.connectivity()) for (const B of H.points) {
      const J = /* @__PURE__ */ new Set();
      for (const R of H.segments) ge(B, R) && (Math.min(R.a.x, R.b.x) < B.x - 1e-3 && J.add("w"), Math.max(R.a.x, R.b.x) > B.x + 1e-3 && J.add("e"), Math.min(R.a.y, R.b.y) < B.y - 1e-3 && J.add("n"), Math.max(R.a.y, R.b.y) > B.y + 1e-3 && J.add("s"));
      (J.size >= 3 || J.size >= 2 && H.islands.some((R) => R.pins.some((S) => On(B, S)))) && l.insertBefore(ce("circle", { cx: B.x, cy: B.y, r: 2, class: "net_" + H.bit, "data-net": I.get(H.bit) || String(H.bit), fill: M(H.bit) }), v);
    }
    if (a) {
      const H = i.components.find((B) => B.id === f);
      H && P.append(ce("rect", { x: H.x - 3, y: H.y - 3, width: H.width + 6, height: H.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const B of i.pins()) {
        const J = ce("circle", { cx: B.x, cy: B.y, r: 3, "data-editor-pin": B.id, "data-editor-bit": B.bit, fill: "#fff", stroke: M(B.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": B.owner + " " + B.pin }), R = ce("title");
        R.textContent = B.id + " · " + (I.get(B.bit) || B.bit), J.append(R), Q.append(J);
      }
      l.append(P, Q);
    }
    q();
    const V = ce("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const H of i.airwires()) V.append(ce("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, stroke: M(H.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": H.bit, "data-from-owner": H.a.owner || "", "data-to-owner": H.b.owner || "" }));
    l.append(V);
    const Y = ce("metadata", { "data-manual-state": "true" });
    Y.textContent = JSON.stringify({ version: 1, grid: E, unrouted: i.airwires().length, manual: !0 }), l.insertBefore(Y, V), D();
  }
  function K(v, P) {
    if (!h) {
      h = { bit: P, points: [v] }, q(), C("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (P !== void 0 && h.bit !== P) {
      C("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const Q = h.points.at(-1), V = i.findPath(h.bit, Q, v);
    if (!V) {
      C("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (P === void 0) {
      h.points.push(...V.slice(1)), q();
      return;
    }
    try {
      i.addPath(P, [...h.points, ...V.slice(1)]), h = null, G();
    } catch (Y) {
      C(Y.message);
    }
  }
  t.addEventListener("pointerdown", (v) => {
    if (!a || p || !i || !l || v.button !== 0 || v.shiftKey) return;
    const P = v.target.closest("[data-editor-pin]"), Q = v.target.closest("[data-editor-wire]"), V = v.target.closest("[data-editor-component]");
    if (!(!P && !Q && !V && !h)) {
      if (v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), P) {
        const Y = i.pins().find((H) => H.id === P.dataset.editorPin);
        e("edit-tool").value = "route", U(), K({ x: Y.x, y: Y.y }, Y.bit);
        return;
      }
      if (Q) {
        const Y = +Q.dataset.editorWire, H = i.segments[Y];
        if (e("edit-tool").value === "erase" && !h) {
          i.remove(Y), b = -1, G();
          return;
        }
        if (h || e("edit-tool").value === "route") {
          const B = T(v);
          K(H.a.x === H.b.x ? { x: H.a.x, y: B.y } : { x: B.x, y: H.a.y }, H.bit);
        } else
          b = Y, G(), C("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (h) {
        K(T(v));
        return;
      }
      if (V) {
        const Y = V.dataset.editorComponent, H = i.components.find((B) => B.id === Y);
        if (!H) return;
        if (f = Y, b = -1, o?.(Y), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          d(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          G();
          return;
        }
        u = { id: Y, n: H, element: V, x: v.clientX, y: v.clientY, start: N(v), dx: 0, dy: 0 }, V.style.opacity = ".6", t.setPointerCapture(v.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (v) => {
    if (!(!a || !i || !l)) {
      if (u) {
        v.stopImmediatePropagation();
        const P = N(v), Q = i.snap({ x: P.x - u.start.x, y: P.y - u.start.y });
        u.dx = Q.x, u.dy = Q.y, u.element.setAttribute("transform", `translate(${u.n.x + u.dx},${u.n.y + u.dy})`);
        for (const V of l.querySelectorAll("[data-airwires] line"))
          V.dataset.fromOwner === u.id && (V.setAttribute("x1", +V.getAttribute("x1") - Number(V.dataset.dx || 0) + u.dx), V.setAttribute("y1", +V.getAttribute("y1") - Number(V.dataset.dy || 0) + u.dy)), V.dataset.toOwner === u.id && (V.setAttribute("x2", +V.getAttribute("x2") - Number(V.dataset.dx || 0) + u.dx), V.setAttribute("y2", +V.getAttribute("y2") - Number(V.dataset.dy || 0) + u.dy)), V.dataset.dx = u.dx, V.dataset.dy = u.dy;
        return;
      }
      h && q(T(v));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (v) => {
    if (!u) return;
    v.preventDefault(), v.stopImmediatePropagation();
    const P = u;
    u = null, P.element.style.opacity = "", t.hasPointerCapture(v.pointerId) && t.releasePointerCapture(v.pointerId);
    try {
      i.move(P.id, P.dx, P.dy), b = -1, G();
    } catch (Q) {
      G(), C(Q.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    u && (u.element.style.opacity = "", u = null, G());
  }), document.addEventListener("keydown", (v) => {
    if (!a || !i || p || v.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(v.target)) return;
    const P = v.target.closest("[data-editor-pin]"), Q = v.key.toLowerCase();
    if (P && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), v.stopImmediatePropagation();
      const V = i.pins().find((Y) => Y.id === P.dataset.editorPin);
      K({ x: V.x, y: V.y }, V.bit);
      return;
    }
    v.key === "Escape" ? (v.preventDefault(), v.stopImmediatePropagation(), h = null, d("move"), G()) : (v.key === "Delete" || v.key === "Backspace") && b >= 0 ? (v.preventDefault(), v.stopImmediatePropagation(), i.remove(b), b = -1, G()) : (v.ctrlKey || v.metaKey) && Q === "z" ? (v.preventDefault(), v.stopImmediatePropagation(), v.shiftKey ? i.redo() : i.undo(), h = null, G()) : !v.ctrlKey && !v.metaKey && !v.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[Q] && (v.preventDefault(), v.stopImmediatePropagation(), d({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[Q]));
  }, { capture: !0 });
  async function O() {
    if (!i || p) return;
    const v = w;
    p = !0, D(), C("Auto-routing remaining connections…");
    try {
      await i.autoRoute(() => v !== w), v === w && (h = null, b = -1, p = !1, G());
    } catch (P) {
      v === w && (p = !1, G(), C(P.message));
    }
  }
  return {
    mount(v, P, Q, V, Y, { reset: H = !1 } = {}) {
      w++, p = !1, l = v, h = null, u = null, b = -1, f = "", y = /* @__PURE__ */ new Map();
      for (const S of l.querySelectorAll('g[id^="cell_"]')) {
        const F = S.getCTM().inverse();
        y.set(S.id.slice(5), { children: [...S.childNodes].map((W) => W.cloneNode(!0)), labels: [...S.querySelectorAll("text")].map((W) => {
          const z = new DOMPoint(+W.getAttribute("x") || 0, +W.getAttribute("y") || 0).matrixTransform(F.multiply(W.getCTM()));
          return { node: W.cloneNode(!0), x: z.x, y: z.y };
        }) });
      }
      if (E = Y.gridSize || 0, I = new Map(Object.values(Q.nodes).map((S) => [S.bit, S.name])), !P || !E) {
        i = null, U();
        return;
      }
      const B = structuredClone(P);
      for (const S of B.components) {
        const F = l.getElementById("cell_" + S.id);
        for (const W of S.ports) {
          const z = [...F.children].find((X) => X.getAttribute("s:pid") === W.pin);
          W.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[z?.getAttribute("s:position")] || W.side;
        }
      }
      for (const [S, F] of Object.entries(V.modules.circuit.cells)) if (F.attributes.name === "0") {
        const W = l.getElementById("cell_" + S), z = W?.transform.baseVal.consolidate().matrix;
        W && z && B.components.push({ id: S, decoration: !0, x: z.e, y: z.f, width: +W.getAttribute("s:width"), height: +W.getAttribute("s:height"), ports: [...W.children].filter((X) => X.hasAttribute("s:pid")).map((X) => ({ pin: X.getAttribute("s:pid"), x: z.e + Number(X.getAttribute("s:x")), y: z.f + Number(X.getAttribute("s:y")), bit: F.connections[X.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const J = new Map(Object.values(Q.nodes).map((S) => [S.name, S.bit])), R = [...l.children].filter((S) => S.localName === "line" && S.hasAttribute("data-net")).map((S) => ({ bit: J.get(S.dataset.net), a: { x: +S.getAttribute("x1"), y: +S.getAttribute("y1") }, b: { x: +S.getAttribute("x2"), y: +S.getAttribute("y2") } }));
      i = new Sn(B, { step: E, segments: R }), _ = JSON.stringify([Q.topology.signature, Y]), !H && x.has(_) ? i.restore(x.get(_)) : e("flywire").checked && i.clear(), a = e("interactive").checked, a || !H && x.has(_) || e("flywire").checked ? G() : U();
    },
    invalidate() {
      w++, p = !1, i = null, l = null, h = null, u = null, U();
    },
    setEnabled(v) {
      a = v, v || (h = null), i ? G() : U();
    },
    clear() {
      i && (i.clear(), h = null, G());
    },
    autoRoute: O,
    chooseTool: d,
    undo() {
      i && (h = null, i.undo(), G());
    },
    redo() {
      i && (h = null, i.redo(), G());
    },
    complete() {
      return !i || !p && i.airwires().length === 0;
    },
    working() {
      return p;
    },
    stats: L,
    canEdit() {
      return !!i;
    },
    refreshColors() {
      if (l) {
        for (const v of l.querySelectorAll("[data-air-net]")) v.setAttribute("stroke", M(+v.dataset.airNet));
        for (const v of l.querySelectorAll("[data-editor-bit]")) v.setAttribute("stroke", M(+v.dataset.editorBit));
      }
    },
    cleanExport(v) {
      for (const P of v.querySelectorAll("[data-editor-overlay],[data-route-preview]")) P.remove();
      for (const P of v.querySelectorAll("[data-editor-component]"))
        P.removeAttribute("data-editor-component"), P.style.removeProperty("opacity");
    }
  };
}
const ke = "http://www.w3.org/2000/svg";
function Qe(t, e, n = !0, o = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), i = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(ke, "defs"), r.dataset.coordinateGrid = "true";
    const h = document.createElementNS(ke, "pattern");
    h.id = "spice-coordinate-grid", h.setAttribute("patternUnits", "userSpaceOnUse");
    const u = document.createElementNS(ke, "path");
    u.setAttribute("fill", "none"), u.setAttribute("stroke", "#737b83"), u.setAttribute("stroke-opacity", ".23"), u.setAttribute("stroke-width", ".55"), u.setAttribute("vector-effect", "non-scaling-stroke"), h.append(u), r.append(h), i = document.createElementNS(ke, "rect"), i.dataset.coordinateGrid = "true", i.setAttribute("fill", "url(#spice-coordinate-grid)"), i.setAttribute("stroke", "none"), i.setAttribute("pointer-events", "none"), t.prepend(i), t.prepend(r);
  }
  const l = r.firstElementChild, a = e || 8;
  l.setAttribute("width", a), l.setAttribute("height", a), l.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), i.setAttribute("visibility", n && e ? "visible" : "hidden");
  const p = o || (() => {
    const h = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    return { x: h[0], y: h[1], w: h[2], h: h[3] };
  })();
  for (const [h, u] of Object.entries({ x: p.x, y: p.y, width: p.w, height: p.h })) i.setAttribute(h, u);
}
const Rn = `<svg
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
`, Ln = `<svg
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
`, Mn = `<svg
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
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
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
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
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
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
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`;
function Hn(t) {
  const e = { move: Rn, route: Ln, erase: Mn, rotate: Pn, "mirror-x": Dn, "mirror-y": Un }, n = { "zoom-in": Bn, "zoom-out": Qn, fit: jn, "wire-undo": Vn, "wire-redo": Fn, "auto-route": Gn }, o = (r, i) => {
    if (!r) return;
    const l = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", l), r.title = l, r.innerHTML = i, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  for (const [r, i] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${r}"]`), i);
  for (const [r, i] of Object.entries(n)) o(t.querySelector("#spice-" + r), i);
}
function Wn(t) {
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
var je = {};
const Xn = {}, $n = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Xn
}, Symbol.toStringTag, { value: "Module" })), qn = /* @__PURE__ */ Wn($n);
var dt;
function zn() {
  return dt || (dt = 1, (function(t) {
    (function(e) {
      e.parser = function(c, s) {
        return new o(c, s);
      }, e.SAXParser = o, e.SAXStream = b, e.createStream = h, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function o(c, s) {
        if (!(this instanceof o))
          return new o(c, s);
        var A = this;
        i(A), A.q = A.c = "", A.bufferCheckPosition = e.MAX_BUFFER_LENGTH, A.encoding = null, A.opt = s || {}, A.opt.lowercase = A.opt.lowercase || A.opt.lowercasetags, A.looseCase = A.opt.lowercase ? "toLowerCase" : "toUpperCase", A.opt.maxEntityCount = A.opt.maxEntityCount || 512, A.opt.maxEntityDepth = A.opt.maxEntityDepth || 4, A.entityCount = A.entityDepth = 0, A.tags = [], A.closed = A.closedRoot = A.sawRoot = !1, A.tag = A.error = null, A.strict = !!c, A.noscript = !!(c || A.opt.noscript), A.state = d.BEGIN, A.strictEntities = A.opt.strictEntities, A.ENTITIES = A.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), A.attribList = [], A.opt.xmlns && (A.ns = Object.create(I)), A.opt.unquotedAttributeValues === void 0 && (A.opt.unquotedAttributeValues = !c), A.trackPosition = A.opt.position !== !1, A.trackPosition && (A.position = A.line = A.column = 0), q(A, "onready");
      }
      Object.create || (Object.create = function(c) {
        function s() {
        }
        s.prototype = c;
        var A = new s();
        return A;
      }), Object.keys || (Object.keys = function(c) {
        var s = [];
        for (var A in c) c.hasOwnProperty(A) && s.push(A);
        return s;
      });
      function r(c) {
        for (var s = Math.max(e.MAX_BUFFER_LENGTH, 10), A = 0, g = 0, $ = n.length; g < $; g++) {
          var Z = c[n[g]].length;
          if (Z > s)
            switch (n[g]) {
              case "textNode":
                Q(c);
                break;
              case "cdata":
                P(c, "oncdata", c.cdata), c.cdata = "";
                break;
              case "script":
                P(c, "onscript", c.script), c.script = "";
                break;
              default:
                Y(c, "Max buffer length exceeded: " + n[g]);
            }
          A = Math.max(A, Z);
        }
        var ee = e.MAX_BUFFER_LENGTH - A;
        c.bufferCheckPosition = ee + c.position;
      }
      function i(c) {
        for (var s = 0, A = n.length; s < A; s++)
          c[n[s]] = "";
      }
      function l(c) {
        Q(c), c.cdata !== "" && (P(c, "oncdata", c.cdata), c.cdata = ""), c.script !== "" && (P(c, "onscript", c.script), c.script = "");
      }
      o.prototype = {
        end: function() {
          H(this);
        },
        write: be,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          l(this);
        }
      };
      var a;
      try {
        a = qn.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var p = e.EVENTS.filter(function(c) {
        return c !== "error" && c !== "end";
      });
      function h(c, s) {
        return new b(c, s);
      }
      function u(c, s) {
        if (c.length >= 2) {
          if (c[0] === 255 && c[1] === 254)
            return "utf-16le";
          if (c[0] === 254 && c[1] === 255)
            return "utf-16be";
        }
        return c.length >= 3 && c[0] === 239 && c[1] === 187 && c[2] === 191 ? "utf8" : c.length >= 4 ? c[0] === 60 && c[1] === 0 && c[2] === 63 && c[3] === 0 ? "utf-16le" : c[0] === 0 && c[1] === 60 && c[2] === 0 && c[3] === 63 ? "utf-16be" : "utf8" : s ? "utf8" : null;
      }
      function b(c, s) {
        if (!(this instanceof b))
          return new b(c, s);
        a.apply(this), this._parser = new o(c, s), this.writable = !0, this.readable = !0;
        var A = this;
        this._parser.onend = function() {
          A.emit("end");
        }, this._parser.onerror = function(g) {
          A.emit("error", g), A._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, p.forEach(function(g) {
          Object.defineProperty(A, "on" + g, {
            get: function() {
              return A._parser["on" + g];
            },
            set: function($) {
              if (!$)
                return A.removeAllListeners(g), A._parser["on" + g] = $, $;
              A.on(g, $);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      b.prototype = Object.create(a.prototype, {
        constructor: {
          value: b
        }
      }), b.prototype._decodeBuffer = function(c, s) {
        if (this._decoderBuffer && (c = Buffer.concat([this._decoderBuffer, c]), this._decoderBuffer = null), !this._decoder) {
          var A = u(c, s);
          if (!A)
            return this._decoderBuffer = c, "";
          this._parser.encoding = A, this._decoder = new TextDecoder(A);
        }
        return this._decoder.decode(c, { stream: !s });
      }, b.prototype.write = function(c) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(c))
          c = this._decodeBuffer(c, !1);
        else if (this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        }
        return this._parser.write(c.toString()), this.emit("data", c), !0;
      }, b.prototype.end = function(c) {
        if (c && c.length && this.write(c), this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        } else if (this._decoder) {
          var A = this._decoder.decode();
          A && (this._parser.write(A), this.emit("data", A));
        }
        return this._parser.end(), !0;
      }, b.prototype.on = function(c, s) {
        var A = this;
        return !A._parser["on" + c] && p.indexOf(c) !== -1 && (A._parser["on" + c] = function() {
          var g = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          g.splice(0, 0, c), A.emit.apply(A, g);
        }), a.prototype.on.call(A, c, s);
      };
      var f = /^\[CDATA\[$/i, w = /^DOCTYPE$/i, _ = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", I = { xml: _, xmlns: E }, x = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function M(c) {
        return c === " " || c === `
` || c === "\r" || c === "	";
      }
      function C(c) {
        return c === '"' || c === "'";
      }
      function L(c) {
        return c === ">" || M(c);
      }
      function U(c, s) {
        return c.test(s);
      }
      function m(c, s) {
        return !U(c, s);
      }
      var d = 0;
      e.STATE = {
        BEGIN: d++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: d++,
        // leading whitespace
        TEXT: d++,
        // general stuff
        TEXT_ENTITY: d++,
        // &amp and such.
        OPEN_WAKA: d++,
        // <
        SGML_DECL: d++,
        // <!BLARG
        SGML_DECL_QUOTED: d++,
        // <!BLARG foo "bar
        DOCTYPE: d++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: d++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: d++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: d++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: d++,
        // <!-
        COMMENT: d++,
        // <!--
        COMMENT_ENDING: d++,
        // <!-- blah -
        COMMENT_ENDED: d++,
        // <!-- blah --
        CDATA: d++,
        // <![CDATA[ something
        CDATA_ENDING: d++,
        // ]
        CDATA_ENDING_2: d++,
        // ]]
        PROC_INST: d++,
        // <?hi
        PROC_INST_BODY: d++,
        // <?hi there
        PROC_INST_ENDING: d++,
        // <?hi "there" ?
        OPEN_TAG: d++,
        // <strong
        OPEN_TAG_SLASH: d++,
        // <strong /
        ATTRIB: d++,
        // <a
        ATTRIB_NAME: d++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: d++,
        // <a foo _
        ATTRIB_VALUE: d++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: d++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: d++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: d++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: d++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: d++,
        // <foo bar=&quot
        CLOSE_TAG: d++,
        // </a
        CLOSE_TAG_SAW_WHITE: d++,
        // </a   >
        SCRIPT: d++,
        // <script> ...
        SCRIPT_ENDING: d++
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
      }), Object.keys(e.ENTITIES).forEach(function(c) {
        var s = e.ENTITIES[c], A = typeof s == "number" ? String.fromCharCode(s) : s;
        e.ENTITIES[c] = A;
      });
      for (var D in e.STATE)
        e.STATE[e.STATE[D]] = D;
      d = e.STATE;
      function q(c, s, A) {
        c[s] && c[s](A);
      }
      function G(c) {
        var s = c && c.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return s ? s[2] : null;
      }
      function K(c) {
        return c ? c.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function O(c, s) {
        const A = K(c), g = K(s);
        return !A || !g ? !0 : g === "utf16" ? A === "utf16le" || A === "utf16be" : A === g;
      }
      function v(c, s) {
        if (!(!c.strict || !c.encoding || !s || s.name !== "xml")) {
          var A = G(s.body);
          A && !O(c.encoding, A) && B(
            c,
            "XML declaration encoding " + A + " does not match detected stream encoding " + c.encoding.toUpperCase()
          );
        }
      }
      function P(c, s, A) {
        c.textNode && Q(c), q(c, s, A);
      }
      function Q(c) {
        c.textNode = V(c.opt, c.textNode), c.textNode && q(c, "ontext", c.textNode), c.textNode = "";
      }
      function V(c, s) {
        return c.trim && (s = s.trim()), c.normalize && (s = s.replace(/\s+/g, " ")), s;
      }
      function Y(c, s) {
        return Q(c), c.trackPosition && (s += `
Line: ` + c.line + `
Column: ` + c.column + `
Char: ` + c.c), s = new Error(s), c.error = s, q(c, "onerror", s), c;
      }
      function H(c) {
        return c.sawRoot && !c.closedRoot && B(c, "Unclosed root tag"), c.state !== d.BEGIN && c.state !== d.BEGIN_WHITESPACE && c.state !== d.TEXT && Y(c, "Unexpected end"), Q(c), c.c = "", c.closed = !0, q(c, "onend"), o.call(c, c.strict, c.opt), c;
      }
      function B(c, s) {
        if (typeof c != "object" || !(c instanceof o))
          throw new Error("bad call to strictFail");
        c.strict && Y(c, s);
      }
      function J(c) {
        c.strict || (c.tagName = c.tagName[c.looseCase]());
        var s = c.tags[c.tags.length - 1] || c, A = c.tag = { name: c.tagName, attributes: {} };
        c.opt.xmlns && (A.ns = s.ns), c.attribList.length = 0, P(c, "onopentagstart", A);
      }
      function R(c, s) {
        var A = c.indexOf(":"), g = A < 0 ? ["", c] : c.split(":"), $ = g[0], Z = g[1];
        return s && c === "xmlns" && ($ = "xmlns", Z = ""), { prefix: $, local: Z };
      }
      function S(c) {
        if (c.strict || (c.attribName = c.attribName[c.looseCase]()), c.attribList.indexOf(c.attribName) !== -1 || c.tag.attributes.hasOwnProperty(c.attribName)) {
          c.attribName = c.attribValue = "";
          return;
        }
        if (c.opt.xmlns) {
          var s = R(c.attribName, !0), A = s.prefix, g = s.local;
          if (A === "xmlns")
            if (g === "xml" && c.attribValue !== _)
              B(
                c,
                "xml: prefix must be bound to " + _ + `
Actual: ` + c.attribValue
              );
            else if (g === "xmlns" && c.attribValue !== E)
              B(
                c,
                "xmlns: prefix must be bound to " + E + `
Actual: ` + c.attribValue
              );
            else {
              var $ = c.tag, Z = c.tags[c.tags.length - 1] || c;
              $.ns === Z.ns && ($.ns = Object.create(Z.ns)), $.ns[g] = c.attribValue;
            }
          c.attribList.push([c.attribName, c.attribValue]);
        } else
          c.tag.attributes[c.attribName] = c.attribValue, P(c, "onattribute", {
            name: c.attribName,
            value: c.attribValue
          });
        c.attribName = c.attribValue = "";
      }
      function F(c, s) {
        if (c.opt.xmlns) {
          var A = c.tag, g = R(c.tagName);
          A.prefix = g.prefix, A.local = g.local, A.uri = A.ns[g.prefix] || "", A.prefix && !A.uri && (B(
            c,
            "Unbound namespace prefix: " + JSON.stringify(c.tagName)
          ), A.uri = g.prefix);
          var $ = c.tags[c.tags.length - 1] || c;
          A.ns && $.ns !== A.ns && Object.keys(A.ns).forEach(function(Je) {
            P(c, "onopennamespace", {
              prefix: Je,
              uri: A.ns[Je]
            });
          });
          for (var Z = 0, ee = c.attribList.length; Z < ee; Z++) {
            var oe = c.attribList[Z], ae = oe[0], fe = oe[1], ie = R(ae, !0), de = ie.prefix, Ie = ie.local, Ae = de === "" ? "" : A.ns[de] || "", De = {
              name: ae,
              value: fe,
              prefix: de,
              local: Ie,
              uri: Ae
            };
            de && de !== "xmlns" && !Ae && (B(
              c,
              "Unbound namespace prefix: " + JSON.stringify(de)
            ), De.uri = de), c.tag.attributes[ae] = De, P(c, "onattribute", De);
          }
          c.attribList.length = 0;
        }
        c.tag.isSelfClosing = !!s, c.sawRoot = !0, c.tags.push(c.tag), P(c, "onopentag", c.tag), s || (!c.noscript && c.tagName.toLowerCase() === "script" ? c.state = d.SCRIPT : c.state = d.TEXT, c.tag = null, c.tagName = ""), c.attribName = c.attribValue = "", c.attribList.length = 0;
      }
      function W(c) {
        if (!c.tagName) {
          B(c, "Weird empty close tag."), c.textNode += "</>", c.state = d.TEXT;
          return;
        }
        if (c.script) {
          if (c.tagName !== "script") {
            c.script += "</" + c.tagName + ">", c.tagName = "", c.state = d.SCRIPT;
            return;
          }
          P(c, "onscript", c.script), c.script = "";
        }
        var s = c.tags.length, A = c.tagName;
        c.strict || (A = A[c.looseCase]());
        for (var g = A; s--; ) {
          var $ = c.tags[s];
          if ($.name !== g)
            B(c, "Unexpected close tag");
          else
            break;
        }
        if (s < 0) {
          B(c, "Unmatched closing tag: " + c.tagName), c.textNode += "</" + c.tagName + ">", c.state = d.TEXT;
          return;
        }
        c.tagName = A;
        for (var Z = c.tags.length; Z-- > s; ) {
          var ee = c.tag = c.tags.pop();
          c.tagName = c.tag.name, P(c, "onclosetag", c.tagName);
          var oe = {};
          for (var ae in ee.ns)
            oe[ae] = ee.ns[ae];
          var fe = c.tags[c.tags.length - 1] || c;
          c.opt.xmlns && ee.ns !== fe.ns && Object.keys(ee.ns).forEach(function(ie) {
            var de = ee.ns[ie];
            P(c, "onclosenamespace", { prefix: ie, uri: de });
          });
        }
        s === 0 && (c.closedRoot = !0), c.tagName = c.attribValue = c.attribName = "", c.attribList.length = 0, c.state = d.TEXT;
      }
      function z(c) {
        var s = c.entity, A = s.toLowerCase(), g, $ = "";
        return c.ENTITIES[s] ? c.ENTITIES[s] : c.ENTITIES[A] ? c.ENTITIES[A] : (s = A, s.charAt(0) === "#" && (s.charAt(1) === "x" ? (s = s.slice(2), g = parseInt(s, 16), $ = g.toString(16)) : (s = s.slice(1), g = parseInt(s, 10), $ = g.toString(10))), s = s.replace(/^0+/, ""), isNaN(g) || $.toLowerCase() !== s || g < 0 || g > 1114111 || !X(g) ? (B(c, "Invalid character entity"), "&" + c.entity + ";") : String.fromCodePoint(g));
      }
      function X(c) {
        return c === 9 || c === 10 || c === 13 || c >= 32 && c <= 55295 || c >= 57344 && c <= 65533 || c >= 65536 && c <= 1114111;
      }
      function he(c, s) {
        s === "<" ? (c.state = d.OPEN_WAKA, c.startTagPosition = c.position) : M(s) || (B(c, "Non-whitespace before first tag."), c.textNode = s, c.state = d.TEXT);
      }
      function me(c, s) {
        var A = "";
        return s < c.length && (A = c.charAt(s)), A;
      }
      function be(c) {
        var s = this;
        if (this.error)
          throw this.error;
        if (s.closed)
          return Y(
            s,
            "Cannot write after close. Assign an onready handler."
          );
        if (c === null)
          return H(s);
        typeof c == "object" && (c = c.toString());
        for (var A = 0, g = ""; g = me(c, A++), s.c = g, !!g; )
          switch (s.trackPosition && (s.position++, g === `
` ? (s.line++, s.column = 0) : s.column++), s.state) {
            case d.BEGIN:
              if (s.state = d.BEGIN_WHITESPACE, g === "\uFEFF")
                continue;
              he(s, g);
              continue;
            case d.BEGIN_WHITESPACE:
              he(s, g);
              continue;
            case d.TEXT:
              if (s.sawRoot && !s.closedRoot) {
                for (var Z = A - 1; g && g !== "<" && g !== "&"; )
                  g = me(c, A++), g && s.trackPosition && (s.position++, g === `
` ? (s.line++, s.column = 0) : s.column++);
                s.textNode += c.substring(Z, A - 1);
              }
              g === "<" && !(s.sawRoot && s.closedRoot && !s.strict) ? (s.state = d.OPEN_WAKA, s.startTagPosition = s.position) : (!M(g) && (!s.sawRoot || s.closedRoot) && B(s, "Text data outside of root node."), g === "&" ? s.state = d.TEXT_ENTITY : s.textNode += g);
              continue;
            case d.SCRIPT:
              g === "<" ? s.state = d.SCRIPT_ENDING : s.script += g;
              continue;
            case d.SCRIPT_ENDING:
              g === "/" ? s.state = d.CLOSE_TAG : (s.script += "<" + g, s.state = d.SCRIPT);
              continue;
            case d.OPEN_WAKA:
              if (g === "!")
                s.state = d.SGML_DECL, s.sgmlDecl = "";
              else if (!M(g)) if (U(x, g))
                s.state = d.OPEN_TAG, s.tagName = g;
              else if (g === "/")
                s.state = d.CLOSE_TAG, s.tagName = "";
              else if (g === "?")
                s.state = d.PROC_INST, s.procInstName = s.procInstBody = "";
              else {
                if (B(s, "Unencoded <"), s.startTagPosition + 1 < s.position) {
                  var $ = s.position - s.startTagPosition;
                  g = new Array($).join(" ") + g;
                }
                s.textNode += "<" + g, s.state = d.TEXT;
              }
              continue;
            case d.SGML_DECL:
              if (s.sgmlDecl + g === "--") {
                s.state = d.COMMENT, s.comment = "", s.sgmlDecl = "";
                continue;
              }
              s.doctype && s.doctype !== !0 && s.sgmlDecl ? (s.state = d.DOCTYPE_DTD, s.doctype += "<!" + s.sgmlDecl + g, s.sgmlDecl = "") : f.test(s.sgmlDecl + g) ? (P(s, "onopencdata"), s.state = d.CDATA, s.sgmlDecl = "", s.cdata = "") : w.test(s.sgmlDecl + g) ? (s.state = d.DOCTYPE, (s.doctype || s.sawRoot) && B(
                s,
                "Inappropriately located doctype declaration"
              ), s.doctype = "", s.sgmlDecl = "") : g === ">" ? (P(s, "onsgmldeclaration", s.sgmlDecl), s.sgmlDecl = "", s.state = d.TEXT) : (C(g) && (s.state = d.SGML_DECL_QUOTED), s.sgmlDecl += g);
              continue;
            case d.SGML_DECL_QUOTED:
              g === s.q && (s.state = d.SGML_DECL, s.q = ""), s.sgmlDecl += g;
              continue;
            case d.DOCTYPE:
              g === ">" ? (s.state = d.TEXT, P(s, "ondoctype", s.doctype), s.doctype = !0) : (s.doctype += g, g === "[" ? s.state = d.DOCTYPE_DTD : C(g) && (s.state = d.DOCTYPE_QUOTED, s.q = g));
              continue;
            case d.DOCTYPE_QUOTED:
              s.doctype += g, g === s.q && (s.q = "", s.state = d.DOCTYPE);
              continue;
            case d.DOCTYPE_DTD:
              g === "]" ? (s.doctype += g, s.state = d.DOCTYPE) : g === "<" ? (s.state = d.OPEN_WAKA, s.startTagPosition = s.position) : C(g) ? (s.doctype += g, s.state = d.DOCTYPE_DTD_QUOTED, s.q = g) : s.doctype += g;
              continue;
            case d.DOCTYPE_DTD_QUOTED:
              s.doctype += g, g === s.q && (s.state = d.DOCTYPE_DTD, s.q = "");
              continue;
            case d.COMMENT:
              g === "-" ? s.state = d.COMMENT_ENDING : s.comment += g;
              continue;
            case d.COMMENT_ENDING:
              g === "-" ? (s.state = d.COMMENT_ENDED, s.comment = V(s.opt, s.comment), s.comment && P(s, "oncomment", s.comment), s.comment = "") : (s.comment += "-" + g, s.state = d.COMMENT);
              continue;
            case d.COMMENT_ENDED:
              g !== ">" ? (B(s, "Malformed comment"), s.comment += "--" + g, s.state = d.COMMENT) : s.doctype && s.doctype !== !0 ? s.state = d.DOCTYPE_DTD : s.state = d.TEXT;
              continue;
            case d.CDATA:
              for (var Z = A - 1; g && g !== "]"; )
                g = me(c, A++), g && s.trackPosition && (s.position++, g === `
` ? (s.line++, s.column = 0) : s.column++);
              s.cdata += c.substring(Z, A - 1), g === "]" && (s.state = d.CDATA_ENDING);
              continue;
            case d.CDATA_ENDING:
              g === "]" ? s.state = d.CDATA_ENDING_2 : (s.cdata += "]" + g, s.state = d.CDATA);
              continue;
            case d.CDATA_ENDING_2:
              g === ">" ? (s.cdata && P(s, "oncdata", s.cdata), P(s, "onclosecdata"), s.cdata = "", s.state = d.TEXT) : g === "]" ? s.cdata += "]" : (s.cdata += "]]" + g, s.state = d.CDATA);
              continue;
            case d.PROC_INST:
              g === "?" ? s.state = d.PROC_INST_ENDING : M(g) ? s.state = d.PROC_INST_BODY : s.procInstName += g;
              continue;
            case d.PROC_INST_BODY:
              if (!s.procInstBody && M(g))
                continue;
              g === "?" ? s.state = d.PROC_INST_ENDING : s.procInstBody += g;
              continue;
            case d.PROC_INST_ENDING:
              if (g === ">") {
                const fe = {
                  name: s.procInstName,
                  body: s.procInstBody
                };
                v(s, fe), P(s, "onprocessinginstruction", fe), s.procInstName = s.procInstBody = "", s.state = d.TEXT;
              } else
                s.procInstBody += "?" + g, s.state = d.PROC_INST_BODY;
              continue;
            case d.OPEN_TAG:
              U(y, g) ? s.tagName += g : (J(s), g === ">" ? F(s) : g === "/" ? s.state = d.OPEN_TAG_SLASH : (M(g) || B(s, "Invalid character in tag name"), s.state = d.ATTRIB));
              continue;
            case d.OPEN_TAG_SLASH:
              g === ">" ? (F(s, !0), W(s)) : (B(
                s,
                "Forward-slash in opening tag not followed by >"
              ), s.state = d.ATTRIB);
              continue;
            case d.ATTRIB:
              if (M(g))
                continue;
              g === ">" ? F(s) : g === "/" ? s.state = d.OPEN_TAG_SLASH : U(x, g) ? (s.attribName = g, s.attribValue = "", s.state = d.ATTRIB_NAME) : B(s, "Invalid attribute name");
              continue;
            case d.ATTRIB_NAME:
              g === "=" ? s.state = d.ATTRIB_VALUE : g === ">" ? (B(s, "Attribute without value"), s.attribValue = s.attribName, S(s), F(s)) : M(g) ? s.state = d.ATTRIB_NAME_SAW_WHITE : U(y, g) ? s.attribName += g : B(s, "Invalid attribute name");
              continue;
            case d.ATTRIB_NAME_SAW_WHITE:
              if (g === "=")
                s.state = d.ATTRIB_VALUE;
              else {
                if (M(g))
                  continue;
                B(s, "Attribute without value"), s.tag.attributes[s.attribName] = "", s.attribValue = "", P(s, "onattribute", {
                  name: s.attribName,
                  value: ""
                }), s.attribName = "", g === ">" ? F(s) : U(x, g) ? (s.attribName = g, s.state = d.ATTRIB_NAME) : (B(s, "Invalid attribute name"), s.state = d.ATTRIB);
              }
              continue;
            case d.ATTRIB_VALUE:
              if (M(g))
                continue;
              C(g) ? (s.q = g, s.state = d.ATTRIB_VALUE_QUOTED) : (s.opt.unquotedAttributeValues || Y(s, "Unquoted attribute value"), s.state = d.ATTRIB_VALUE_UNQUOTED, s.attribValue = g);
              continue;
            case d.ATTRIB_VALUE_QUOTED:
              if (g !== s.q) {
                g === "&" ? s.state = d.ATTRIB_VALUE_ENTITY_Q : s.attribValue += g;
                continue;
              }
              S(s), s.q = "", s.state = d.ATTRIB_VALUE_CLOSED;
              continue;
            case d.ATTRIB_VALUE_CLOSED:
              M(g) ? s.state = d.ATTRIB : g === ">" ? F(s) : g === "/" ? s.state = d.OPEN_TAG_SLASH : U(x, g) ? (B(s, "No whitespace between attributes"), s.attribName = g, s.attribValue = "", s.state = d.ATTRIB_NAME) : B(s, "Invalid attribute name");
              continue;
            case d.ATTRIB_VALUE_UNQUOTED:
              if (!L(g)) {
                g === "&" ? s.state = d.ATTRIB_VALUE_ENTITY_U : s.attribValue += g;
                continue;
              }
              S(s), g === ">" ? F(s) : s.state = d.ATTRIB;
              continue;
            case d.CLOSE_TAG:
              if (s.tagName)
                g === ">" ? W(s) : U(y, g) ? s.tagName += g : s.script ? (s.script += "</" + s.tagName + g, s.tagName = "", s.state = d.SCRIPT) : (M(g) || B(s, "Invalid tagname in closing tag"), s.state = d.CLOSE_TAG_SAW_WHITE);
              else {
                if (M(g))
                  continue;
                m(x, g) ? s.script ? (s.script += "</" + g, s.state = d.SCRIPT) : B(s, "Invalid tagname in closing tag.") : s.tagName = g;
              }
              continue;
            case d.CLOSE_TAG_SAW_WHITE:
              if (M(g))
                continue;
              g === ">" ? W(s) : B(s, "Invalid characters in closing tag");
              continue;
            case d.TEXT_ENTITY:
            case d.ATTRIB_VALUE_ENTITY_Q:
            case d.ATTRIB_VALUE_ENTITY_U:
              var ee, oe;
              switch (s.state) {
                case d.TEXT_ENTITY:
                  ee = d.TEXT, oe = "textNode";
                  break;
                case d.ATTRIB_VALUE_ENTITY_Q:
                  ee = d.ATTRIB_VALUE_QUOTED, oe = "attribValue";
                  break;
                case d.ATTRIB_VALUE_ENTITY_U:
                  ee = d.ATTRIB_VALUE_UNQUOTED, oe = "attribValue";
                  break;
              }
              if (g === ";") {
                var ae = z(s);
                s.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(ae) ? ((s.entityCount += 1) > s.opt.maxEntityCount && Y(
                  s,
                  "Parsed entity count exceeds max entity count"
                ), (s.entityDepth += 1) > s.opt.maxEntityDepth && Y(
                  s,
                  "Parsed entity depth exceeds max entity depth"
                ), s.entity = "", s.state = ee, s.write(ae), s.entityDepth -= 1) : (s[oe] += ae, s.entity = "", s.state = ee);
              } else U(s.entity.length ? T : N, g) ? s.entity += g : (B(s, "Invalid character in entity name"), s[oe] += "&" + s.entity + g, s.entity = "", s.state = ee);
              continue;
            default:
              throw new Error(s, "Unknown state: " + s.state);
          }
        return s.position >= s.bufferCheckPosition && r(s), s;
      }
      String.fromCodePoint || (function() {
        var c = String.fromCharCode, s = Math.floor, A = function() {
          var g = 16384, $ = [], Z, ee, oe = -1, ae = arguments.length;
          if (!ae)
            return "";
          for (var fe = ""; ++oe < ae; ) {
            var ie = Number(arguments[oe]);
            if (!isFinite(ie) || // `NaN`, `+Infinity`, or `-Infinity`
            ie < 0 || // not a valid Unicode code point
            ie > 1114111 || // not a valid Unicode code point
            s(ie) !== ie)
              throw RangeError("Invalid code point: " + ie);
            ie <= 65535 ? $.push(ie) : (ie -= 65536, Z = (ie >> 10) + 55296, ee = ie % 1024 + 56320, $.push(Z, ee)), (oe + 1 === ae || $.length > g) && (fe += c.apply(null, $), $.length = 0);
          }
          return fe;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: A,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = A;
      })();
    })(t);
  })(je)), je;
}
var Ve, ft;
function Yn() {
  if (ft) return Ve;
  ft = 1;
  var t = zn().parser;
  function e(n) {
    var o = [], r = [], i = o, l;
    return l = t(!0), l.ontext = function(a) {
      a.trim() !== "" && i.push(a);
    }, l.onopentag = function(a) {
      var p;
      p = [a.name, a.attributes], r.push(i), i.push(p), i = p;
    }, l.onclosetag = function() {
      i = r.pop();
    }, l.write(n).close(), o[0];
  }
  return Ve = e, Ve;
}
var Fe, pt;
function Kn() {
  if (pt) return Fe;
  pt = 1;
  function t(e, n) {
    var o = function() {
    }, r = o, i = o;
    function l() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function p(b) {
      this._name = b;
    }
    function h(b) {
      this._replace = b;
    }
    function u(b, f) {
      var w, _ = { attr: {}, full: b }, E = {
        name: p,
        skip: l,
        // break: breakFn,
        remove: a,
        replace: h,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, I = !0, x, y, N;
      if (b !== void 0 && b !== null && b !== !0 && b !== !1)
        switch (w = Object.prototype.toString.call(b), w) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (b.some(function(T, M) {
              if (M === 0)
                return _.name = T, !1;
              if (M === 1)
                return Object.prototype.toString.call(T) === "[object Object]" && (I = !1, _.attr = T), !0;
            }), r.call(E, _, f), E._name && (b[0] = E._name), E._replace)
              return E._replace;
            if (E._remove)
              return null;
            if (!E._skip) {
              for (x = 0, y = b.length; x < y; ) {
                if (x > 1 || x === 1 && I) {
                  if (N = u(b[x], _), N === null) {
                    b.splice(x, 1), y -= 1;
                    continue;
                  }
                  N && (b[x] = N);
                }
                x += 1;
              }
              if (i.call(E, _, f), E._name && (b[0] = E._name), E._replace)
                return E._replace;
              if (E._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (i = n.leave)), u(e, void 0);
  }
  return Fe = t, Fe;
}
var Ge, ht;
function Zn() {
  if (ht) return Ge;
  ht = 1;
  const t = Yn(), e = Kn(), n = (r) => String(r).replace(/[&<>"']/g, (i) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[i]);
  function o(r) {
    const [i, ...l] = r, a = l[0] && typeof l[0] == "object" && !Array.isArray(l[0]) ? l.shift() : {}, p = "<" + i + Object.entries(a).map(([h, u]) => " " + h + '="' + n(u) + '"').join("");
    return l.length ? p + ">" + l.map((h) => Array.isArray(h) ? o(h) : n(h)).join("") + "</" + i + ">" : p + "/>";
  }
  return Ge = { parse: t, p: t, traverse: e, t: e, stringify: o, s: o }, Ge;
}
Zn();
const He = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), Jn = (t, e) => [...t].reduce((n, o) => n + (o.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function er(t, e, n = 12) {
  const o = [], r = t.map((l) => ({ x: l.x, y: l.y, w: l.w, h: l.h }));
  for (const [l, a] of t.entries()) {
    if (!a.labels.length) continue;
    const p = Math.max(...a.labels.map((_) => Jn(_.text, n))) + 4, h = a.labels.length * (n + 4), u = [];
    for (const _ of [5, 14, 28, 48]) {
      const E = { x: a.x + (a.w - p) / 2, y: a.y - _ - h, w: p, h }, I = { x: a.x + (a.w - p) / 2, y: a.y + a.h + _, w: p, h }, x = { x: a.x + a.w + _, y: a.y + (a.h - h) / 2, w: p, h }, y = { x: a.x - _ - p, y: a.y + (a.h - h) / 2, w: p, h };
      u.push(...a.w > a.h ? [E, I, x, y] : [x, y, E, I]);
    }
    const b = (_) => e.reduce((E, I) => {
      const x = Math.min(I.a.x, I.b.x), y = Math.min(I.a.y, I.b.y), N = { x: x - 1, y: y - 1, w: Math.abs(I.a.x - I.b.x) + 2, h: Math.abs(I.a.y - I.b.y) + 2 };
      return E + He(_, N) * 2;
    }, 0);
    let f = null, w = 1 / 0;
    for (const [_, E] of u.entries()) {
      const I = r.reduce((x, y, N) => x + (N === l ? 0 : He(E, y)) * 500, 0) + o.reduce((x, y) => x + He(E, y) * 100, 0) + b(E) + _ * 3;
      I < w && (w = I, f = E);
    }
    a.labels.forEach((_, E) => {
      _.x = f.x - a.x, _.y = f.y - a.y + n + E * (n + 4);
    }), o.push(f);
  }
  const i = [...r, ...o];
  return { x: Math.min(0, ...i.map((l) => l.x)), y: Math.min(0, ...i.map((l) => l.y)), right: Math.max(0, ...i.map((l) => l.x + l.w)), bottom: Math.max(0, ...i.map((l) => l.y + l.h)) };
}
const tr = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function nr(t, e = 12) {
  const n = [...t.children].filter((i) => i.localName === "g" && i.id.startsWith("cell_")).map((i) => ({ ...tr(i.getAttribute("transform")), w: +i.getAttribute("s:width"), h: +i.getAttribute("s:height"), labels: [...i.children].filter((l) => l.localName === "text" && l.hasAttribute("data-layout-label")).map((l) => ({ node: l, text: l.textContent })) })), o = [...t.children].filter((i) => i.localName === "line" && i.hasAttribute("data-net")).map((i) => ({ a: { x: +i.getAttribute("x1"), y: +i.getAttribute("y1") }, b: { x: +i.getAttribute("x2"), y: +i.getAttribute("y2") } })), r = er(n, o, e);
  for (const i of n) for (const l of i.labels)
    l.node.setAttribute("x", l.x), l.node.setAttribute("y", l.y), l.node.setAttribute("text-anchor", "start"), l.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
const mt = Re.filter.source, j = (t) => document.getElementById("spice-" + t), ye = j("app");
if (ye) {
  let m = function() {
    const R = e.querySelector("svg");
    if (!R) return;
    const S = Number(R.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, F = nr(R, S), W = Math.min(N.x, F.x - 20), z = Math.min(N.y, F.y - 20);
    N = { x: W, y: z, w: Math.max(N.x + N.w, F.right + 20) - W, h: Math.max(N.y + N.h, F.bottom + 20) - z }, p && vn(R, h, p), a?.refreshColors(), Qe(R, b?.layout.report?.gridSize || 0, j("show-grid").checked, y);
    const X = R.cloneNode(!0);
    a?.cleanExport(X), X.setAttribute("width", N.w), X.setAttribute("height", N.h), X.setAttribute("viewBox", `${N.x} ${N.y} ${N.w} ${N.h}`), Qe(X, b?.layout.report?.gridSize || 0, j("show-grid").checked, N), u = new XMLSerializer().serializeToString(X), j("source").value = u;
  }, q = function(R) {
    const S = j("example-info");
    if (S && (S.replaceChildren(), !!R && (S.append(document.createTextNode(R.description + " ")), R.url))) {
      const F = document.createElement("a");
      F.href = R.url, F.target = "_blank", F.rel = "noopener noreferrer", F.textContent = R.reference, S.append(F);
    }
  }, G = function() {
    a.invalidate(), d.setEnabled(!1), r = null, i = null, u = "", L(), q(Object.values(Re).find((R) => R.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, K = function(R) {
    o.replaceChildren();
    for (const { severity: S, line: F, message: W, source: z } of R) {
      const X = document.createElement("li");
      X.className = S, X.textContent = `${S.toUpperCase()}${z && z !== "input.cir" ? " · " + z : ""}${F ? " · line " + F : ""}: ${W}`, o.append(X);
    }
    j("messages").open = R.some((S) => S.severity !== "info"), j("message-count").textContent = `${R.length} message${R.length === 1 ? "" : "s"}`;
  }, O = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`);
    const R = e.querySelector("svg");
    R && Qe(R, b?.layout.report?.gridSize || 0, j("show-grid").checked, y), j("zoom-level").textContent = Math.round(N.w / y.w * 100) + "%";
  }, v = function(R, S = y.x + y.w / 2, F = y.y + y.h / 2) {
    if (!e.querySelector("svg")) return;
    const W = Math.max(0.05, Math.min(10, y.w * R / N.w)) * N.w / y.w;
    y = { x: S + (y.x - S) * W, y: F + (y.y - F) * W, w: y.w * W, h: y.h * W }, O();
  }, Q = function(R) {
    const S = new URLSearchParams();
    R && S.set("instance", R);
    const F = S.toString();
    location.hash.slice(1) === F ? (E = R, B()) : location.hash = F;
  }, V = function() {
    E = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, Y = function() {
    const R = !!(I && I !== E && f?.contexts[I]);
    j("selection-actions").hidden = !R, j("open-instance").href = "#" + new URLSearchParams({ instance: I });
  }, H = function() {
    j("breadcrumbs").replaceChildren();
    const R = (F, W) => {
      const z = document.createElement("button");
      z.type = "button", z.textContent = F, z.onclick = () => Q(W), z.disabled = W === E, j("breadcrumbs").append(z);
    };
    if (R("Top", ""), E) {
      const F = f.contexts[E].path;
      for (let W = 0; W < F.length; W++) R(F[W], F.slice(0, W + 1).map(encodeURIComponent).join("/"));
    }
    j("instances").replaceChildren();
    const S = (F, W) => {
      for (const z of F.children) {
        const X = document.createElement("div");
        X.className = "spice-instance-row", X.style.setProperty("--depth", Math.min(W, 8)), X.dataset.instance = z.id;
        const he = document.createElement("a");
        he.href = "#" + new URLSearchParams({ instance: z.id }), he.textContent = z.name + " · " + z.definition, he.title = "Open " + z.id + " as its own sheet";
        const me = document.createElement("span");
        if (me.className = "spice-help", me.textContent = Object.entries(z.params).map(([be, c]) => be + "=" + c).join(" · "), X.append(he), me.textContent) {
          const be = document.createElement("details"), c = document.createElement("summary");
          c.textContent = "Parameters", be.append(c, me), X.append(be);
        }
        j("instances").append(X), S(z, W + 1);
      }
    };
    S(f.contexts[E], 0), j("hierarchy-panel").hidden = !f.contexts[E].children.length, j("focus-title").textContent = E ? E + " / " + f.contexts[E].definition : "Top-level schematic", Y();
  };
  Hn(ye), Cn(ye);
  const t = j("input"), e = j("preview"), n = j("status"), o = j("diagnostics");
  let r = null, i = null, l = !1, a = null, p = null, h = [], u = "", b, f, w, _ = "", E = "", I = "", x = !1, y = { x: 0, y: 0, w: 1, h: 1 }, N = { ...y }, T, M = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ye.addEventListener("click", (R) => {
    x && R.target.closest('a[href^="#"]') && R.preventDefault();
  });
  const L = () => {
    j("copy").disabled = j("download").disabled = !u || x || a?.working(), j("download-asc").disabled = j("download-asc-bundle").disabled = !u || !r || x || l || !a?.complete();
  }, U = () => ({ font: j("font").value, fontSize: Number(j("size").value), color: Ze, gridSize: j("grid").checked && j("conventional").checked ? Number(j("grid-size").value) : 0, detailed: j("detailed").checked, conventional: j("conventional").checked }), d = Nn(j, (R, S) => {
    p = R, h = S, m();
  });
  a = kn(e, j, { getNetColor: (R) => {
    const S = h.find((F) => F.bit === R);
    return S && p && (p.auto || p.manual.has(S.name)) ? p.color(S.name) : null;
  }, inspect: (R) => {
    const S = b?.components.find((F) => F.name === R);
    S && (I = S.instanceId || "", j("selection").textContent = S.raw, Y());
  }, changed: (R, S, F) => {
    r = R, i = null, N = F;
    const W = e.querySelector("svg");
    if (W) {
      W.setAttribute("width", String(N.w)), W.setAttribute("height", String(N.h));
      const z = W.querySelector("#spice-layout-report");
      if (z) {
        const X = JSON.parse(z.textContent);
        X.manualWiring = S, X.verifiedTerminals = !S.unrouted, X.geometricConnectivityVerified = !S.unrouted, z.textContent = JSON.stringify(X);
      }
    }
    b && w && (j("json").value = JSON.stringify({ circuit: b, netlist: at(b), hierarchy: w, interactive: { ...S, drawing: R } }, null, 2)), m(), L();
  } }), j("show-grid").onchange = m;
  async function D() {
    (!r || !b?.layout.report?.gridVerified) && (j("grid").checked = !0, j("conventional").checked = !0, await B({ resetEditor: !0 })), a.setEnabled(j("interactive").checked), L();
  }
  j("interactive").onchange = D, j("flywire").onchange = async () => {
    j("interactive").checked = !0, await D(), j("flywire").checked ? a.clear() : await a.autoRoute(), L();
  }, j("auto-route").onclick = async () => {
    j("interactive").checked = !0, await D(), await a.autoRoute(), L();
  }, j("wire-undo").onclick = () => a.undo(), j("wire-redo").onclick = () => a.redo();
  for (const R of ye.querySelectorAll("[data-editor-mode]")) R.onclick = async () => {
    j("interactive").checked = !0, await D(), a.chooseTool(R.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  d.setEnabled(!1), t.value = mt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || mt;
  } catch {
  }
  q(Object.values(Re).find((R) => R.source === t.value)), t.addEventListener("input", G);
  for (const R of ["font", "size", "detailed", "conventional", "grid", "grid-size"]) j(R).addEventListener("input", G);
  j("zoom-in").onclick = () => v(0.8), j("zoom-out").onclick = () => v(1.25), j("fit").onclick = () => {
    y = { ...N }, O();
  };
  const P = (R) => {
    const S = e.querySelector("svg");
    return S ? new DOMPoint(R.clientX, R.clientY).matrixTransform(S.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (R) => {
    const S = P(R);
    S && (R.preventDefault(), v(R.deltaY > 0 ? 1.12 : 1 / 1.12, S.x, S.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (R) => {
    ![0, 1].includes(R.button) || !e.querySelector("svg") || (T = { start: P(R), x: R.clientX, y: R.clientY, view: { ...y }, moved: !1 }, e.setPointerCapture(R.pointerId));
  }), e.addEventListener("pointermove", (R) => {
    if (!T) return;
    const S = P(R);
    Math.hypot(R.clientX - T.x, R.clientY - T.y) > 4 && (T.moved = !0), y.x += T.start.x - S.x, y.y += T.start.y - S.y, O();
  }), e.addEventListener("pointerup", (R) => {
    if (!T) return;
    const S = T.moved;
    if (T = null, e.hasPointerCapture(R.pointerId) && e.releasePointerCapture(R.pointerId), !S) {
      const F = document.elementFromPoint(R.clientX, R.clientY)?.closest("[data-component]"), W = b?.components.find((z) => z.name === F?.dataset.component);
      W && (I = W.instanceId || "", j("selection").textContent = `${W.raw}
${Object.entries(W.terminals).map(([z, X]) => `${z} → ${X}`).join("   ")}`, W.kind === "X" ? Q(W.instanceId) : Y());
    }
  }), window.addEventListener("hashchange", () => {
    if (x) {
      M = !0;
      return;
    }
    V(), I = "", B();
  }), e.addEventListener("pointercancel", () => {
    T = null;
  }), e.addEventListener("keydown", (R) => {
    const S = R.target.closest("[data-instance]");
    if (S && (R.key === "Enter" || R.key === " ")) {
      R.preventDefault(), I = S.dataset.instance, Q(I);
      return;
    }
    R.key === "+" || R.key === "=" ? v(0.8) : R.key === "-" ? v(1.25) : R.key.toLowerCase() === "f" ? (y = { ...N }, O()) : R.key.startsWith("Arrow") && (R.preventDefault(), y.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[R.key] || 0) * y.w, y.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[R.key] || 0) * y.h, O());
  });
  async function B({ resetEditor: R = !1 } = {}) {
    if (x) return;
    x = !0, a.invalidate(), d.setEnabled(!1), r = null, i = null, u = "", L(), j("generate").disabled = !0, t.readOnly = !0, j("file").disabled = !0, j("libraries").disabled = !0;
    for (const F of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) F.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let S = [];
    try {
      if (_ !== t.value || !f) {
        if (w = Gt(t.value, { files: C }), S = [...w.diagnostics], S.some((g) => g.severity === "error"))
          throw f = null, Error("Fix the parser errors below before generating.");
        f = ze(w), _ && _ !== t.value ? (E = "", I = "", history.replaceState(null, "", location.pathname + location.search)) : V(), _ = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (S = [...w.diagnostics], K(S), S.some((g) => g.severity === "error")) throw Error("Fix the parser errors below before generating.");
      b = un(f, { focus: E });
      for (const g of b.interfaceAliases) S.push({ severity: "info", message: `Instance boundary: ${g.ports.join(" = ")} share parent node ${g.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const F = at(b);
      U().conventional && S.push(...b.layout.diagnostics);
      const W = await pn(F, U()), z = new DOMParser().parseFromString(W.svg, "image/svg+xml");
      if (z.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const X = z.documentElement, he = X.querySelector("#spice-layout-report");
      if (he) {
        b.layout.report = JSON.parse(he.textContent);
        const g = b.layout.report;
        if (S.push({ severity: "info", message: `Layout: compact signal flow; ${g.powerSourcesChecked} DC/ground symbols checked, ${g.powerOrderViolations} DC order preference(s) unmet. ${g.powerPass}. ${g.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), g.classicTemplateFallback && S.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), g.groundPlacement && S.push({ severity: "info", message: `Ground: ${g.groundPlacement}; ${g.straightenedGroundDrops || 0} return-path simplification(s).` }), g.explicitGroups && S.push({ severity: "info", message: `Layout comments: ${g.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), g.classicRails && S.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${g.railCount} shared voltage rails.` }), g.localClassicInstances?.length && S.push({ severity: "info", message: `${g.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), g.localClassicStages?.length && S.push({ severity: "info", message: `Classic transistor proximity active: ${g.localClassicStages.join(", ")}.` }), g.sharedClassicRails && S.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), g.mirroredTransistors?.length && S.push({ severity: "info", message: `Control-pin mirror choices: ${g.mirroredTransistors.join(", ")}.` }), g.recognizedMotifs?.length && S.push({ severity: "info", message: `Transistor structures: ${g.recognizedMotifs.map(($) => `${$.kind} (${$.members.join(", ")}; ${$.confidence})`).join("; ")}.` }), g.appliedMotifs?.length && S.push({ severity: "info", message: `Topology preferences applied to ${g.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), g.subnetFirstFallback && S.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + g.subnetFirstFallback }), g.pairCompactionFallback && S.push({ severity: "warning", message: "Pair proximity kept the original regions: " + g.pairCompactionFallback }), g.compoundPairFallback && S.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + g.compoundPairFallback }), g.pairConstraints?.length) {
          const $ = g.pairConstraints.filter((Z) => Z.crossRegion && !Z.compacted).length;
          S.push({ severity: "info", message: `${g.pairConstraints.length - $} adjacent transistor pair(s); ${$} cross-region mirror row constraint(s).` });
        }
        g.netShortcuts && S.push({ severity: "info", message: `${g.netShortcuts} safe straight net shortcut(s); ${g.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), g.sharedRailFallback && S.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${g.sharedRailFallback}.` });
        for (const $ of g.localClassicFallbacks || []) $.stage && S.push({ severity: "info", message: `Classic stage ${$.stage} uses automatic layout: ${$.reason || "No unobstructed local template"}.` });
        g.geometricConnectivityVerified && S.push({ severity: "info", message: `Net geometry verified; ${g.cyclesRemoved} same-net loop(s) and ${g.leavesRemoved} unused wire branch(es) removed.` }), K(S);
      }
      if (X.localName !== "svg" || X.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const me = Number(X.getAttribute("width")), be = Number(X.getAttribute("height")), c = JSON.parse(X.getAttribute("data-label-bounds") || "null");
      N = { x: Math.min(-20, (c?.x ?? 0) - 20), y: Math.min(-20, (c?.y ?? 0) - 20) }, N.w = Math.max(me, c?.right || 0) + 20 - N.x, N.h = Math.max(be, c?.bottom || 0) + 20 - N.y, y = { ...N }, X.setAttribute("viewBox", `${N.x} ${N.y} ${N.w} ${N.h}`), X.setAttribute("width", String(N.w)), X.setAttribute("height", String(N.h)), X.setAttribute("role", "img"), X.setAttribute("aria-label", b.title || "SPICE schematic"), X.setAttribute("style", "background:white");
      for (const g of b.components) {
        const $ = z.getElementById("cell_" + g.name);
        if (!$) throw Error("Renderer omitted component " + g.name);
        $.setAttribute("data-component", g.name), g.kind === "X" && ($.setAttribute("data-instance", g.instanceId), $.setAttribute("role", "button"), $.setAttribute("tabindex", "0"), $.setAttribute("aria-label", "Open " + g.name));
        const Z = z.createElementNS(X.namespaceURI, "title");
        Z.textContent = g.raw + `
Resolved: ` + g.value + `
` + Object.entries(g.terminals).map(([ee, oe]) => ee + ": " + oe).join(", "), $.prepend(Z);
      }
      for (const g of Object.values(b.nodes))
        for (const $ of X.querySelectorAll(".net_" + g.bit)) {
          $.setAttribute("data-net", g.name);
          const Z = z.createElementNS(X.namespaceURI, "title");
          Z.textContent = "Node " + g.displayName, $.append(Z);
        }
      const s = b.components.filter((g) => g.kind === "K").map((g) => ({ name: g.name, inductors: g.coupledInductors, value: g.value }));
      if (s.length) {
        const g = z.createElementNS(X.namespaceURI, "metadata");
        g.setAttribute("id", "spice-magnetic-couplings"), g.textContent = JSON.stringify(s), X.append(g);
        for (const $ of s) for (const Z of $.inductors) {
          const ee = z.getElementById("cell_" + Z);
          if (!ee) continue;
          const oe = z.createElementNS(X.namespaceURI, "circle"), ae = [...ee.children].find((Ie) => Ie.getAttribute("s:pid") === "A"), fe = ae?.getAttribute("s:position"), ie = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[fe] || [0, 0];
          for (const [Ie, Ae] of Object.entries({ cx: Number(ae?.getAttribute("s:x")) + ie[0], cy: Number(ae?.getAttribute("s:y")) + ie[1], r: 3, fill: U().color, stroke: "none", "data-coupling": $.name })) oe.setAttribute(Ie, String(Ae));
          const de = z.createElementNS(X.namespaceURI, "title");
          de.textContent = $.name + " · dotted terminal: " + $.inductors.join(", "), oe.append(de), ee.append(oe);
        }
      }
      r = W.drawing, u = new XMLSerializer().serializeToString(X), j("source").value = u, e.replaceChildren(document.importNode(X, !0)), O();
      const A = S.filter((g) => g.severity === "warning").length;
      n.textContent = `${b.components.filter((g) => !g.synthetic).length} components · ${Object.keys(b.nodes).length} nodes · ${b.topology.leafCount} primitive devices verified${b.interfaceAliases.length ? " · Parent-connected ports: " + b.interfaceAliases.map((g) => g.ports.join(" = ")).join("; ") + "." : ""}${A ? " · Review " + A + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${$e}.`, b.layout.report?.gridVerified && (n.textContent += ` Grid ${b.layout.report.gridSize}.`), b.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${b.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), b.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), j("json").value = JSON.stringify({ circuit: b, netlist: F, hierarchy: w }, null, 2), d.setCircuit(b, t.value), a.mount(e.querySelector("svg"), r, b, F, U(), { reset: R }), m(), j("selection").textContent = "Click a component to inspect its original statement and pin connections.", H();
    } catch (F) {
      if (e.replaceChildren(), u = "", j("source").value = "", j("json").value = "", j("nets").replaceChildren(), j("selection").textContent = "", n.textContent = F.message, !f)
        j("hierarchy-panel").hidden = !0, j("selection-actions").hidden = !0, j("breadcrumbs").replaceChildren();
      else if (!f.contexts[E]) {
        const W = document.createElement("button");
        W.type = "button", W.textContent = "Return to Top", W.onclick = () => Q(""), j("breadcrumbs").replaceChildren(W);
      }
      d.setCircuit(null, t.value), F.diagnostics && (S = F.diagnostics), S.some((W) => W.severity === "error") || S.push({ severity: "error", line: 0, message: F.message }), K(S);
    } finally {
      x = !1, j("generate").disabled = !1, t.readOnly = !1, j("file").disabled = !1, j("libraries").disabled = !1;
      for (const F of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) F.disabled = !1;
      f && f.contexts[E] && H(), d.setEnabled(!!u), e.setAttribute("aria-busy", "false"), L(), M && (M = !1, V(), queueMicrotask(B));
    }
  }
  j("generate").onclick = () => B({ resetEditor: !0 });
  for (const R of ye.querySelectorAll("[data-example]")) R.onclick = () => {
    const S = Re[R.dataset.example];
    t.value = S.source, G(), q(S), B();
  };
  j("file").onchange = async (R) => {
    const S = R.target.files[0];
    if (S) {
      if (S.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await ct(S), G(), B();
      } catch (F) {
        n.textContent = "File could not be read: " + F.message;
      } finally {
        R.target.value = "";
      }
    }
  }, j("libraries").onchange = async (R) => {
    try {
      for (const S of R.target.files) {
        if (S.size > 16e6) throw Error("Library exceeds 16 MB: " + S.name);
        C[S.webkitRelativePath || S.name] = await ct(S);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      f = null, _ = "", j("library-status").textContent = Object.keys(C).length + " library file(s) loaded", B();
    } catch (S) {
      n.textContent = S.message;
    } finally {
      R.target.value = "";
    }
  }, j("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", j("download").onclick = () => {
    const R = URL.createObjectURL(new Blob([u], { type: "image/svg+xml;charset=utf-8" })), S = document.createElement("a");
    S.href = R, S.download = "spice-schematic.svg", S.click(), setTimeout(() => URL.revokeObjectURL(R), 1e3);
  };
  async function J(R) {
    const S = r;
    if (!(!S || x || l)) {
      l = !0, L(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: F } = await import("./asc-export-BuFSVOs7.js");
        if (r !== S) throw Error("Schematic changed. Generate again before exporting ASC.");
        i ||= F({ tree: f, circuit: b, drawing: S, source: t.value, libraries: C });
        const W = R ? i.zip : i.ascBytes, z = URL.createObjectURL(new Blob([W], { type: R ? "application/zip" : "application/octet-stream" })), X = document.createElement("a");
        X.href = z, X.download = R ? "spice-schematic-asc.zip" : "spice-schematic.asc", X.click(), setTimeout(() => URL.revokeObjectURL(z), 1e3), n.textContent = "ASC connections verified · " + i.manifest.audit.symbols + " symbols. " + (R ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), i.manifest.warnings.length && (n.textContent += " " + i.manifest.warnings.join(" "));
      } catch (F) {
        n.textContent = "ASC export failed: " + F.message;
        const W = document.createElement("li");
        W.className = "error", W.textContent = n.textContent, o.append(W);
      } finally {
        l = !1, L();
      }
    }
  }
  j("download-asc").onclick = () => J(!1), j("download-asc-bundle").onclick = () => J(!0), j("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(u), n.textContent = "SVG source copied to clipboard.";
    } catch {
      j("source-details").open = !0, j("source").focus(), j("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, B();
}
export {
  Xe as b,
  ze as e,
  Ne as l,
  We as n,
  $t as p
};
