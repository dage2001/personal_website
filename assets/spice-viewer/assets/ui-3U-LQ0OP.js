const on = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, sn = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, an = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, ln = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, cn = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, dn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, un = { 1: "a", 2: "b", 7: "Q", 8: "com" }, fn = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, pn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, hn = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, mn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, gn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, bn = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, yn = {
  AND: on,
  BUF: sn,
  COUNTER: an,
  DFLOP: ln,
  SCHMITT: cn,
  OR: dn,
  PHASEDET: un,
  SRFLOP: fn,
  XOR: pn,
  MODULATOR: hn,
  OTA: mn,
  SAMPLEHOLD: gn,
  VARISTOR: bn
}, wn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Oe = (t) => t.toLowerCase(), xt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), xn = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function vn(t, e) {
  const n = (N) => e[Oe(N || "")] || Object.entries(e).find(([E]) => E.startsWith(Oe(N || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], l = [], s = "", c = "", f = [], d = [], p = 0, v = "", b = "", h = "", m = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], c = Oe(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], c = o === "D" ? "d_v" : o === "B" ? "spice_b" : Oe(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !xt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), s = t[r.length + 1] || "";
    const N = n(s)?.type;
    m = ["NPN", "PNP"].includes(N), c = m ? (r.length === 3 ? "q_" : "spice_q4_") + Oe(N) : "spice_q" + r.length;
  } else if (o === "M") {
    const N = n(t[4]), E = n(t[5]), w = N?.type === "VDMOS" || !E && (!t[5] || xt(t[5]));
    r = w ? ["D", "G", "S"] : ["D", "G", "S", "B"], s = t[r.length + 1] || "";
    const A = n(s), I = A?.type;
    if (w && A && I !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!w && I === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    m = ["NMOS", "PMOS", "VDMOS"].includes(I);
    let C = null, T = A;
    const k = /* @__PURE__ */ new Set();
    for (; T && !k.has(T.name) && (k.add(T.name), C = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(T.raw), !C); )
      T = n(T.baseModel);
    const U = I === "PMOS" || I === "VDMOS" && C && (C[1] === void 0 || Number(C[1]) >= 0.5);
    c = m ? "spice_" + (U ? "pmos" : "nmos") + (w ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    s = t[4] || "";
    const N = n(s)?.type, E = o === "Z" && ["NIGBT", "PIGBT"].includes(N);
    r = E ? ["C", "G", "E"] : ["D", "G", "S"], m = o === "J" ? ["NJF", "PJF"].includes(N) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(N), c = "spice_" + (E ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(N || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], c = "spice_" + Oe(o);
    let N = 3, E = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[N] || "");
    if (/^poly$/i.test(t[N] || "") && (E = /^\(\s*(\d+)\s*\)$/.exec(t[++N] || ""), !E))
      throw Error("POLY requires a dimension.");
    if (E) {
      const w = Number(E[1]);
      if (w > 128) throw Error("POLY supports at most 128 controlling variables.");
      let A = N + 1, I = [];
      const C = "EG".includes(o), T = w * (C ? 2 : 1);
      for (; I.length < T && A < t.length; ) I.push(...xn(t[A++]));
      if (I.length !== T || A >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (C) {
        for (let k = 0; k < w; k++) r.push("C" + (k + 1) + "+", "C" + (k + 1) + "-");
        l = [t[1], t[2], ...I];
      } else f = I;
      p = A, v = "POLY(" + w + ") " + (C ? "" : I.join(" ") + " "), b = "POLY", C && (c = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? b = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), b = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (f = [t[3]], p = 4, v = t[3] + " ");
    h = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (b ? " · " + b : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], s = t[5] || "", c = "spice_device", h = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], f = [t[3]], s = t[4] || "", p = 3, c = "spice_device", h = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (s = t[5] || ""), c = "spice_device", h = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], s = t[4] || "", c = "spice_device", h = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (N, E) => "P" + (E + 1)), c = "spice_device", h = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (d = t.slice(1, -1), d.some((N) => !/^L/i.test(N.split(":").at(-1)))) throw Error("K references must name inductors.");
    p = t.length - 1, c = "spice_coupling", h = "Magnetic coupling", v = d.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], c = "spice_device", h = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], c = "spice_device", h = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], c = "spice_device", h = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (p || (p = r.length + 1), l.length || (l = t.slice(1, r.length + 1)), l.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= p && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (l.some((N) => /[=()]/.test(N) && !/^\{[\s\S]*\}$/.test(N))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(p).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(p).join(" ")) && (c = "spice_br"), o === "D" && (s = t[3] || ""), o === "@") {
    const N = t.slice(p).join(" ");
    for (const E of N.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(E[1].toUpperCase()), l.push(E[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (f.some((N) => !N)) throw Error("Missing controlling voltage source.");
  const _ = r.map((N, E) => o === "A" && yn[(t[9] || "").toUpperCase()]?.[String(E + 1)] || N);
  return { kind: o, pins: r, nodeTokens: l, pinLabels: _, model: s, type: c, controlSource: f[0] || "", controlSources: f, coupledInductors: d, value: v + t.slice(p).join(" "), sourceMode: b, symbol: h, polarityKnown: m };
}
const En = wn, _n = new Set(En.split(" ")), et = () => /* @__PURE__ */ Object.create(null), ye = (t) => t.toLowerCase();
function ze(t) {
  const e = [], n = [];
  let o = "", r = 0, l = "";
  for (let s = 0; s < t.length; s++) {
    const c = t[s];
    if (l) {
      o += c, c === l && t[s - 1] !== "\\" && (l = "");
      continue;
    }
    if (c === '"' || c === "'") {
      l = c, o += c;
      continue;
    }
    if (!r && (c === ";" || c === "$" && (!s || /\s/.test(t[s - 1])))) break;
    if ("({".includes(c) && (n.push(c), r++), ")}".includes(c) && (r--, n.pop() !== (c === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(c) && !r ? (o && e.push(o), o = "") : o += c;
  }
  if (r || l) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Nn(t, e = {}) {
  const n = [], o = [], r = [], l = Object.assign(et(), e.models), s = et(), c = (E, w, A) => n.push({ severity: E, line: w, message: A });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const f = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((E, w) => {
    const A = E.trim();
    !A || A.startsWith("*") || (A.startsWith("+") ? f.length ? f.at(-1).text += " " + A.slice(1).trim() : c("error", w + 1, "Continuation has no preceding statement.") : f.push({ line: w + 1, text: A }));
  });
  for (const E of f) {
    try {
      E.tokens = ze(E.text);
    } catch (A) {
      c("error", E.line, A.message), E.tokens = [];
    }
    const w = E.tokens;
    if (/^\.model$/i.test(w[0] || ""))
      if (w.length < 3) c("error", E.line, ".model requires a name and device type.");
      else {
        const A = /^ako:(.+)$/i.exec(w[2]), I = A && w[3] && !w[3].startsWith("(") ? w[3].split("(")[0].toUpperCase() : "";
        l[ye(w[1])] = { name: w[1], type: A ? I : w[2].split("(")[0].toUpperCase(), baseModel: A?.[1] || "", raw: E.text };
      }
  }
  const d = /* @__PURE__ */ new Set();
  function p(E) {
    const w = l[ye(E)];
    if (!w) return "";
    if (w.type) return w.type;
    if (d.has(ye(E))) throw Error("Circular AKO model inheritance: " + E);
    return d.add(ye(E)), w.type = p(w.baseModel), d.delete(ye(E)), w.type;
  }
  for (const E of Object.values(l)) if (E.baseModel && !E.type)
    try {
      p(E.name);
    } catch (w) {
      c("error", 0, w.message);
    }
  let v = "", b = 0, h = !1, m = !1;
  const _ = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: E, text: w, tokens: A } of f) {
    if (!A.length) continue;
    const I = ye(A[0]);
    if (m) {
      c("warning", E, "Statement after .end is not rendered: " + w);
      continue;
    }
    if (I === ".control") {
      h = !0, c("warning", E, ".control script retained but not executed or rendered.");
      continue;
    }
    if (I === ".endc") {
      h = !1;
      continue;
    }
    if (h) continue;
    if (I === ".subckt") {
      b++, c("error", E, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (I === ".ends") {
      b ? b-- : c("error", E, "Unmatched .ends.");
      continue;
    }
    if (b) continue;
    if (I === ".end") {
      m = !0;
      continue;
    }
    if (I.startsWith(".")) {
      o.push({ line: E, text: w }), I === ".title" ? v = A.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(I) ? c("error", E, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(I) ? c("error", E, "Topology-changing directive is unsupported: " + w) : N.has(I) || c("warning", E, "Directive retained but not resolved: " + w);
      continue;
    }
    const C = A[0][0].toUpperCase();
    if (!_n.has(C)) {
      E === 1 && !/\d/.test(A[0]) && A.length > 1 && C !== "X" ? (v = w, c("warning", E, "First line treated as a SPICE title; use .title for an unambiguous title.")) : c("warning", E, `Unsupported ${C} device was not rendered: ${w}`);
      continue;
    }
    const T = C === "M" || C === "Q" ? 5 : 4;
    if (E === 1 && !/\d/.test(A[0]) && (A.length < T || C === "T" && !/\b(?:zo|z0)\s*=/i.test(w))) {
      v = w, c("info", E, "SPICE title: " + w);
      continue;
    }
    try {
      if (_.has(I)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const k = vn(A, l), { pins: U, nodeTokens: x, ...y } = k;
      k.polarityKnown || c("warning", E, `${A[0]}: model polarity unknown; explicit ${U.join("/")} terminals retained.`);
      const D = et();
      U.forEach((F, z) => {
        const $ = ye(x[z]);
        s[$] || (s[$] = { name: $, displayName: A[z + 1], bit: Object.keys(s).length + 2, terminals: [] }), s[$].terminals.push({ component: A[0], pin: F }), D[F] = $;
      }), r.push({ ...y, name: A[0], terminals: D, line: E, raw: w }), _.add(I);
    } catch (k) {
      c("error", E, `${A[0]}: ${k.message} Statement: ${w}`);
    }
  }
  b && c("error", 0, "Unclosed .subckt definition."), h && c("error", 0, "Unclosed .control block."), r.length || c("error", 0, "No supported components to render."), r.length > 300 && c("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const E of r) {
    for (const w of E.controlSources || []) !w.includes(":") && !r.some((A) => ye(A.name) === ye(w) && A.kind === "V") && c("error", E.line, `${E.name}: controlling voltage source ${w} was not found.`);
    for (const w of E.coupledInductors || []) !w.includes(":") && !r.some((A) => ye(A.name) === ye(w) && A.kind === "L") && c("error", E.line, `${E.name}: coupled inductor ${w} was not found.`);
    (E.kind === "B" || E.type === "spice_b") && c("info", E.line, `${E.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: v, components: r, nodes: s, models: l, directives: o, diagnostics: n };
}
const Se = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), vt = (t) => Se(t).split("/").at(-1);
function Cn(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], l = [], s = [];
  let c = 0;
  const f = (p, v) => {
    const b = Se(v).split("/").slice(0, -1).concat(Se(p)).join("/"), h = [...o].filter(([_]) => Se(_) === Se(p) || Se(_) === b);
    if (h.length === 1) return h[0];
    const m = [...o].filter(([_]) => vt(_) === vt(p));
    if (m.length !== 1) throw Error(m.length ? "Ambiguous library filename: " + p : "Missing library " + p + ". Add this file using Library files.");
    return m[0];
  };
  function d(p, v, b = "", h = []) {
    const m = Se(v) + ":" + b.toLowerCase();
    if (h.includes(m)) throw Error("Circular library include: " + [...h, m].join(" → "));
    if (h.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const _ = [], N = /^\s*\.endl\b/im.test(p);
    let E = !b;
    const w = (I, C) => {
      if (c += I.length, c > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      s.push(I), l.push({ file: v, line: C + 1 });
    };
    if (p.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((I, C) => {
      const T = I.trim();
      if (/^\.lib\b/i.test(T) && N) {
        const k = ze(T);
        if (k.length === 2 && !/[.\\/]/.test(k[1])) {
          _.push(k[1].toLowerCase()), k[1].toLowerCase() === b.toLowerCase() && (E = !0), w("* Library section " + k[1], C);
          return;
        }
      }
      if (/^\.endl\b/i.test(T)) {
        _.pop(), w("* End library section", C);
        return;
      }
      if (b && _.length && !_.includes(b.toLowerCase())) {
        w("* Unselected library section", C);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(T))
        try {
          const k = ze(T);
          if (!k[1]) throw Error("Include requires a filename.");
          const [U, x] = f(k[1], v);
          w("* Included " + U, C), d(x, U, k[2] || "", [...h, m]);
        } catch (k) {
          r.push({ severity: "error", line: C + 1, source: v, message: k.message }), w("* Unresolved include", C);
        }
      else w(I, C);
    }), !E) throw Error("Library section " + b + " not found in " + v);
  }
  try {
    d(t, n);
  } catch (p) {
    r.push({ severity: "error", line: 0, source: n, message: p.message });
  }
  return { source: s.join(`
`), origins: l, diagnostics: r };
}
function Sn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((c, f) => {
    const d = c.trim();
    /^\.subckt\b/i.test(d) && (o.push(f + 1), n.set(f + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: c, line: f + 1 }) : e[f] = c, /^\.ends\b/i.test(d) && o.length > 1 && o.pop();
  });
  const l = Et(Array.from({ length: t.split(/\r?\n/).length }, (c, f) => e[f] || "").join(`
`));
  r.push(...l.diagnostics);
  const s = /* @__PURE__ */ new Map();
  for (const [c, f] of n) {
    const d = Et(f.map((p) => p.raw).join(`
`));
    s.set(c, d.layout), r.push(...d.diagnostics.map((p) => ({ ...p, line: f[p.line - 1]?.line || c })));
  }
  return { layout: l.layout, scopes: s, diagnostics: r };
}
function Et(t) {
  const e = [], n = [];
  let o = !1, r = !1, l = 0;
  if (t.split(/\r?\n/).forEach((w, A) => {
    const I = w.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(I)) {
      (r || o) && e.push({ severity: "error", line: A + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(I) || e.push({ severity: "error", line: A + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, l = A + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(I)) {
      o || e.push({ severity: "error", line: A + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (I.startsWith("*") ? n.push(I.slice(1).trim()) : e.push({ severity: "error", line: A + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: l, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const s = n.join(" "), c = s.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], f = [], d = [], p = [], v = [];
  let b = 0, h = 0, m = 10;
  const _ = () => c[b++], N = () => {
    const w = _();
    if (!w || !/^[A-Za-z_@][\w./%:@-]*$/.test(w)) throw Error("Expected layout identifier, got " + w);
    return w;
  };
  function E(w) {
    if (f.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const A = w ? N() : "@row" + h++, I = _();
    if (!["row", "column", "classic"].includes(I)) throw Error("Expected row, column or classic.");
    if (_() !== "{") throw Error("Expected { after " + I);
    const C = { id: A, direction: I, members: [] };
    for (f.push(C); b < c.length && c[b] !== "}"; )
      c[b] === "group" ? (_(), C.members.push(E(!0))) : ["row", "column"].includes(c[b]) ? C.members.push(E(!1)) : C.members.push(N());
    if (_() !== "}") throw Error("Unclosed group " + A);
    if (!C.members.length) throw Error("Empty layout group " + A);
    return A;
  }
  try {
    for (; b < c.length; )
      if (c[b] === "group")
        _(), E(!0);
      else if (["row", "column"].includes(c[b])) E(!1);
      else if (c[b] === "face") {
        _();
        const x = N(), y = _();
        if (!["left", "right"].includes(y)) throw Error("Expected face left or right.");
        if (v.some((D) => D.device.toLowerCase() === x.toLowerCase())) throw Error("Duplicate face device.");
        v.push({ device: x, side: y });
      } else if (c[b] === "pair") {
        _();
        const x = _();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(x)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (_() !== "{") throw Error("Expected { after pair kind.");
        const y = [];
        for (; b < c.length && c[b] !== "}"; ) y.push(N());
        if (_() !== "}" || !y.length) throw Error("Empty or unclosed pair.");
        if (p.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        p.push({ kind: x, members: y });
      } else if (c[b] === "priority-cap") {
        if (_(), m = Number(_()), !Number.isInteger(m) || m < 3 || m > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (_() === "place") {
        const x = N(), y = _(), D = N();
        if (!["left-of", "above"].includes(y)) throw Error("Expected left-of or above.");
        d.push({ a: x, relation: y, b: D });
      } else throw Error("Unknown layout instruction near " + c[b - 1]);
    const w = /* @__PURE__ */ new Set();
    for (const x of f) {
      const y = x.id.toLowerCase();
      if (w.has(y)) throw Error("Duplicate layout group " + x.id);
      w.add(y);
    }
    const A = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set(), C = new Map(f.map((x) => [x.id.toLowerCase(), x])), T = (x) => {
      if (A.has(x)) throw Error("Circular layout group " + x);
      if (!I.has(x)) {
        A.add(x);
        for (const y of C.get(x).members) C.has(y.toLowerCase()) && T(y.toLowerCase());
        A.delete(x), I.add(x);
      }
    };
    for (const x of C.keys()) T(x);
    const k = /* @__PURE__ */ new Map();
    for (const x of d) {
      if (x.a.toLowerCase() === x.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      k.has(x.a.toLowerCase()) || k.set(x.a.toLowerCase(), []), k.get(x.a.toLowerCase()).push(x.b.toLowerCase());
    }
    A.clear(), I.clear();
    const U = (x) => {
      if (A.has(x)) throw Error("Circular place constraints.");
      if (!I.has(x)) {
        A.add(x);
        for (const y of k.get(x) || []) U(y);
        A.delete(x), I.add(x);
      }
    };
    for (const x of k.keys()) U(x);
  } catch (w) {
    e.push({ severity: "error", line: l, message: "Layout description: " + w.message });
  }
  return { layout: { version: 1, priorityCap: m, groups: f, relations: d, pairs: p, faces: v }, diagnostics: e };
}
function In(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const h = new Set(n.groups.map((_) => _.id.toLowerCase())), m = (_) => h.has(_.toLowerCase()) ? _ : e.components.find((E) => E.synthetic && E.value.toLowerCase() === _.toLowerCase())?.name || e.focus + "/" + _;
    o = { ...n, groups: n.groups.map((_) => ({ ..._, members: _.members.map(m) })), relations: n.relations.map((_) => ({ ..._, a: m(_.a), b: m(_.b) })), faces: (n.faces || []).map((_) => ({ ..._, device: m(_.device) })), pairs: (n.pairs || []).map((_) => ({ ..._, members: _.members.map(m) })) };
  }
  const r = new Map(o.groups.map((h) => [h.id.toLowerCase(), h])), l = Object.values(t.contexts).flatMap((h) => h.devices.map((m) => m.name)), s = new Set([...Object.keys(t.contexts), ...l, ...e.components.map((h) => h.name)].map((h) => h.toLowerCase()));
  for (const h of r.values()) if (s.has((n ? e.focus + "/" + h.id : h.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + h.id);
  for (const h of r.values()) for (const m of h.members) if (!r.has(m.toLowerCase()) && !s.has(m.toLowerCase())) throw Error("Unknown @layout instance/device: " + m);
  for (const h of o.relations) for (const m of [h.a, h.b]) if (!r.has(m.toLowerCase()) && !s.has(m.toLowerCase())) throw Error("Unknown @layout place target: " + m);
  const c = (o.pairs || []).map((h) => ({ ...h, members: h.members.map((m) => {
    const _ = e.components.find((N) => N.name.toLowerCase() === m.toLowerCase());
    if (!_ || _.synthetic || _.block) throw Error("Unknown or non-visible @layout pair device: " + m);
    return _.name;
  }) })), f = (o.faces || []).map((h) => {
    const m = e.components.find((_) => _.name.toLowerCase() === h.device.toLowerCase());
    if (!m || !["Q", "M", "J", "Z"].includes(m.kind)) throw Error("Unknown or unsupported @layout face device: " + h.device);
    return { ...h, device: m.name };
  }), d = /* @__PURE__ */ new Map(), p = [], v = new Set(Object.keys(t.contexts).map((h) => h.toLowerCase()));
  for (const h of o.groups) {
    const m = [];
    for (const _ of h.members) {
      if (r.has(_.toLowerCase())) {
        m.push({ group: _ });
        continue;
      }
      for (const N of e.components) if (N.name.toLowerCase() === _.toLowerCase() || N.name.toLowerCase().startsWith(_.toLowerCase() + "/")) {
        if (d.has(N.name)) throw Error("Overlapping @layout membership: " + N.name);
        d.set(N.name, h.id), m.push({ cell: N.name, ...v.has(_.toLowerCase()) ? { instance: _ } : {} });
      }
    }
    p.push({ id: h.id, direction: h.direction, members: m });
  }
  const b = /* @__PURE__ */ new Set();
  for (const h of p) for (const m of h.members) if (m.group) {
    const _ = m.group.toLowerCase();
    if (b.has(_)) throw Error("Layout group has multiple parents: " + m.group);
    b.add(_);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: p, relations: o.relations, pairs: c, faces: f };
}
const Me = () => /* @__PURE__ */ Object.create(null), ge = (t) => t.toLowerCase();
function jt(t) {
  const e = Me();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const l = ge(r[1]);
    let s = r[2];
    if (s === void 0) {
      const c = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!c) throw Error("Expected = after parameter " + l);
      s = c[1];
    }
    if (s || (s = t[++n]), !s || /^params?:$/i.test(s)) throw Error("Missing value for parameter " + l);
    if (Object.hasOwn(e, l)) throw Error("Duplicate parameter: " + l);
    e[l] = s;
  }
  return e;
}
function _t(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, Me()] : [t.slice(0, e), jt(t.slice(e))];
}
function Nt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Cn(t, e);
  t = n.source;
  const o = Sn(t), r = [...n.diagnostics, ...o.diagnostics], l = Me(), s = /* @__PURE__ */ new Set(["0"]), c = (w, A, I) => r.push({ severity: w, line: A, message: I }), f = (w, A, I, C = [], T = Me(), k = 0) => {
    const U = { id: w, name: A, parent: I, ports: C, defaults: T, parameters: Me(), definitions: Me(), devices: [], instances: [], directives: [], line: k, statements: [], layoutDescription: o.scopes.get(k) || null };
    return l[w] = U, U;
  }, d = f("root", "Top", null), p = [d], v = [];
  let b = !1, h = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, A) => {
    const I = w.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? v.length ? v.at(-1).text += " " + I.slice(1).trim() : c("error", A + 1, "Continuation has no preceding statement.") : v.push({ text: I, line: A + 1 }));
  });
  for (const { text: w, line: A } of v)
    try {
      const I = ze(w);
      if (!I.length) continue;
      const C = ge(I[0]), T = p.at(-1);
      if (h) {
        c("warning", A, "Statement after .end is not rendered: " + w);
        continue;
      }
      if (C === ".control") {
        b = !0, c("warning", A, ".control script retained but not executed or rendered.");
        continue;
      }
      if (C === ".endc") {
        b = !1;
        continue;
      }
      if (b) continue;
      if (C === ".subckt") {
        if (I.length < 2) throw Error(".SUBCKT requires a name.");
        const [k, U] = _t(I.slice(2)), x = ge(I[1]);
        if (Object.hasOwn(T.definitions, x)) throw Error("Duplicate subcircuit definition: " + I[1]);
        const y = k.map(ge);
        if (new Set(y).size !== k.length || y.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (k.some((F) => /[{}()=]/.test(F))) throw Error("Invalid formal port.");
        if (p.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = T.id + "/" + encodeURIComponent(x);
        T.definitions[x] = D, p.push(f(D, I[1], T.id, k, U, A));
        continue;
      }
      if (C === ".ends") {
        if (p.length === 1) throw Error("Unmatched .ENDS.");
        if (I[1] && ge(I[1]) !== ge(T.name)) throw Error(".ENDS name does not match " + T.name);
        p.pop();
        continue;
      }
      if (C === ".end") {
        if (p.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        h = !0;
        continue;
      }
      if (C === ".param") {
        const k = jt(I.slice(1));
        for (const [U, x] of Object.entries(k)) {
          if (Object.hasOwn(T.parameters, U)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + U);
          T.parameters[U] = x;
        }
      }
      if (C === ".global") {
        if (I.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const k of I.slice(1)) s.add(ge(k));
      }
      if (C.startsWith(".") && T.directives.push({ line: A, text: w }), C.startsWith("x")) {
        const [k, U] = _t(I.slice(1));
        if (!k.length) throw Error("X instance requires a subcircuit name.");
        const x = /;§pnba\s+(.+)$/i.exec(w)?.[1].split(")");
        T.instances.push({ name: I[0], nodes: k.slice(0, -1).map(ge), definitionName: k.at(-1), definitionId: null, parameters: U, line: A, raw: w, pinNames: x });
      } else T.statements.push({ line: A, text: w });
    } catch (I) {
      c("error", A, I.message + " Statement: " + w);
    }
  p.length > 1 && c("error", p.at(-1).line, "Unclosed .SUBCKT " + p.at(-1).name), b && c("error", 0, "Unclosed .control block.");
  function m(w, A) {
    for (; w; ) {
      if (Object.hasOwn(w.definitions, ge(A))) return w.definitions[ge(A)];
      w = l[w.parent];
    }
    return null;
  }
  for (const w of Object.values(l)) {
    const A = [...w.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...w.statements], I = Nn(A.map((T) => T.text).join(`
`), { models: l[w.parent]?.models });
    w.devices = I.components.map((T) => ({ ...T, line: A[T.line - 1]?.line || w.line })), w.models = I.models, w === d && (d.title = I.title), r.push(...I.diagnostics.filter((T) => !T.message.includes("No supported components to render.") && !T.message.includes("300 components")).map((T) => ({ ...T, line: A[T.line - 1]?.line || w.line })));
    const C = new Set(w.devices.map((T) => ge(T.name)));
    for (const T of w.instances)
      if (C.has(ge(T.name)) && c("error", T.line, "Duplicate instance/device name: " + T.name), C.add(ge(T.name)), T.definitionId = m(w, T.definitionName), !T.definitionId && !/^\{[\s\S]*\}$/.test(T.definitionName)) c("error", T.line, "Undefined subcircuit: " + T.definitionName + " in " + T.name);
      else if (T.definitionId) {
        const k = l[T.definitionId];
        k.ports.length !== T.nodes.length && c("error", T.line, `${T.name}: ${k.name} expects ${k.ports.length} ports; got ${T.nodes.length}.`);
      }
  }
  for (const w of Object.values(l)) delete w.statements;
  const _ = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function E(w, A = []) {
    if (_.has(w)) {
      c("error", l[w].line, "Circular subcircuit reference: " + [...A, l[w].name].join(" → "));
      return;
    }
    if (!N.has(w)) {
      if (_.add(w), A.length >= 64) {
        c("error", l[w].line, "Subcircuit dependency nesting exceeds 64 levels."), _.delete(w), N.add(w);
        return;
      }
      for (const I of l[w].instances) I.definitionId && E(I.definitionId, [...A, l[w].name]);
      _.delete(w), N.add(w);
    }
  }
  for (const w of Object.keys(l)) E(w);
  !d.devices.length && !d.instances.length && c("error", 0, "No supported components or instances to render.");
  for (const w of r) !w.source && w.line && n.origins[w.line - 1] && (w.source = n.origins[w.line - 1].file, w.line = n.origins[w.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: d.title || "", scopes: l, globals: [...s], diagnostics: r, layoutDescription: o.layout };
}
const ce = () => /* @__PURE__ */ Object.create(null), ke = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ct = (t, e) => ke(t.map((n) => n.toLowerCase()), e.toLowerCase());
function An(t, e = []) {
  const n = ce(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [l, s] of Object.entries(r.terminals)) o(s).terminals.push({ component: r.name, pin: l });
  for (const r of e) o(r);
  return n;
}
function Tn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Ct = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, On = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Xe(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (s) => (r.push(s), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (s, c, f) => {
    const d = f.split(",").map((v) => v.trim());
    if (d.some((v) => !v || /[\s{}+*()]/.test(v))) throw Error("Unsupported dynamic voltage/current reference: " + s);
    const p = c.toUpperCase() + "(" + d.map((v) => c.toLowerCase() === "v" ? n(v) : o(v, c)).join(",") + ")";
    return r.push(p), "@@" + (r.length - 1) + "@@";
  });
  let l = t.length;
  return t = t.replace(On, (s, c, f) => {
    if (f.slice(c + s.length).trimStart().startsWith("(")) return s;
    const d = e(s.toLowerCase());
    if (d === void 0) return s;
    if (l += d.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (s, c) => r[Number(c)]);
}
function kn(t, e, n, o) {
  const r = { ...e, ...n }, l = ce(), s = /* @__PURE__ */ new Set(), c = ce();
  for (const [d, p] of Object.entries(o)) c[d] = Xe(Ct(p), (v) => t[v]);
  function f(d) {
    if (Object.hasOwn(c, d)) return c[d];
    if (Object.hasOwn(l, d)) return l[d];
    if (!Object.hasOwn(r, d)) return t[d];
    if (s.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...s, d].join(" → "));
    }
    return s.add(d), l[d] = Xe(Ct(r[d]), f), s.delete(d), l[d];
  }
  for (const d of Object.keys(r)) f(d);
  return Object.assign(ce(), t, l, c);
}
function dt(t, e, n, o) {
  let r = "";
  for (let f = 0; f < t.length; ) {
    const d = t[f];
    if (d !== "{" && d !== "'") {
      r += d, f++;
      continue;
    }
    const p = f++;
    let v = 1, b = "";
    for (; f < t.length && v; f++) {
      if (d === "'") {
        t[f] === "'" && (v = 0);
        continue;
      }
      if (b) {
        t[f] === b && (b = "");
        continue;
      }
      if (t[f] === '"' || t[f] === "'") {
        b = t[f];
        continue;
      }
      t[f] === "{" && v++, t[f] === "}" && v--;
    }
    if (v) throw Error("Unclosed parameter expression.");
    r += d + Xe(t.slice(p + 1, f - 1), (h) => e[h], n, o) + (d === "{" ? "}" : "'");
  }
  const l = [];
  let s = 0, c = "";
  for (let f = 0; f < r.length; f++) {
    const d = r[f];
    if (c) {
      d === c && r[f - 1] !== "\\" && (c = "");
      continue;
    }
    if (d === '"' || d === "'") {
      c = d;
      continue;
    }
    if ("({".includes(d) && s++, ")}".includes(d) && s--, !s && (f === 0 || /\s/.test(r[f - 1]))) {
      const p = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(f));
      p && (l.push({ start: f, end: f + p[0].length, key: p[1].toLowerCase() }), f += p[0].length - 1);
    }
  }
  if (l.length) {
    let f = r.slice(0, l[0].start);
    l.forEach((d, p) => {
      const v = l[p + 1]?.start ?? r.length, b = r.slice(d.end, v);
      f += r.slice(d.start, d.end) + (b.includes("{") || ["refnode", "intnode"].includes(d.key) ? b : Xe(b, (h) => e[h], n, o));
    }), r = f;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class Mn {
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
class Rn {
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
class P {
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
    return "JavaScript Expression Parser (JSEP) v" + P.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return P.max_unop_len = Math.max(e.length, P.max_unop_len), P.unary_ops[e] = 1, P;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return P.max_binop_len = Math.max(e.length, P.max_binop_len), P.binary_ops[e] = n, o ? P.right_associative.add(e) : P.right_associative.delete(e), P;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return P.additional_identifier_chars.add(e), P;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return P.literals[e] = n, P;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete P.unary_ops[e], e.length === P.max_unop_len && (P.max_unop_len = P.getMaxKeyLen(P.unary_ops)), P;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return P.unary_ops = {}, P.max_unop_len = 0, P;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return P.additional_identifier_chars.delete(e), P;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete P.binary_ops[e], e.length === P.max_binop_len && (P.max_binop_len = P.getMaxKeyLen(P.binary_ops)), P.right_associative.delete(e), P;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return P.binary_ops = {}, P.max_binop_len = 0, P;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete P.literals[e], P;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return P.literals = {}, P;
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
    return new P(e).parse();
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
    return P.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !P.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    P.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return P.isIdentifierStart(e) || P.isDecimalDigit(e);
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
    if (P.hooks[e]) {
      const o = { context: this, node: n };
      return P.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (P.hooks[e]) {
      const n = { context: this };
      return P.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === P.SPACE_CODE || e === P.TAB_CODE || e === P.LF_CODE || e === P.CR_CODE; )
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
      type: P.COMPOUND,
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
      if (o = this.code, o === P.SEMCOL_CODE || o === P.COMMA_CODE)
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
    let e = this.expr.substr(this.index, P.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (P.binary_ops.hasOwnProperty(e) && (!P.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !P.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, o, r, l, s, c, f, d;
    if (s = this.gobbleToken(), !s || (n = this.gobbleBinaryOp(), !n))
      return s;
    for (l = { value: n, prec: P.binaryPrecedence(n), right_a: P.right_associative.has(n) }, c = this.gobbleToken(), c || this.throwError("Expected expression after " + n), r = [s, l, c]; n = this.gobbleBinaryOp(); ) {
      if (o = P.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      l = { value: n, prec: o, right_a: P.right_associative.has(n) }, d = n;
      const p = (v) => l.right_a && v.right_a ? o > v.prec : o <= v.prec;
      for (; r.length > 2 && p(r[r.length - 2]); )
        c = r.pop(), n = r.pop().value, s = r.pop(), e = {
          type: P.BINARY_EXP,
          operator: n,
          left: s,
          right: c
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + d), r.push(l, e);
    }
    for (f = r.length - 1, e = r[f]; f > 1; )
      e = {
        type: P.BINARY_EXP,
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
    if (e = this.code, P.isDecimalDigit(e) || e === P.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === P.SQUOTE_CODE || e === P.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === P.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, P.max_unop_len), o = n.length; o > 0; ) {
        if (P.unary_ops.hasOwnProperty(n) && (!P.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !P.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: P.UNARY_EXP,
            operator: n,
            argument: l,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      P.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), P.literals.hasOwnProperty(r.name) ? r = {
        type: P.LITERAL,
        value: P.literals[r.name],
        raw: r.name
      } : r.name === P.this_str && (r = { type: P.THIS_EXP })) : e === P.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === P.PERIOD_CODE || n === P.OBRACK_CODE || n === P.OPAREN_CODE || n === P.QUMARK_CODE; ) {
      let o;
      if (n === P.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== P.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === P.OBRACK_CODE ? (e = {
        type: P.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== P.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === P.OPAREN_CODE ? e = {
        type: P.CALL_EXP,
        arguments: this.gobbleArguments(P.CPAREN_CODE),
        callee: e
      } : (n === P.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: P.MEMBER_EXP,
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
    for (; P.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === P.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); P.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); P.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      P.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, P.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === P.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === P.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: P.LITERAL,
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
      type: P.LITERAL,
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
    for (P.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, P.isIdentifierPart(e)); )
      this.index++;
    return {
      type: P.IDENTIFIER,
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
        o = !0, this.index++, e === P.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === P.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === P.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === P.CBRACK_CODE)
            for (let s = n.length; s < r; s++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const s = this.gobbleExpression();
        (!s || s.type === P.COMPOUND) && this.throwError("Expected comma"), n.push(s);
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
    let e = this.gobbleExpressions(P.CPAREN_CODE);
    if (this.code === P.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: P.SEQUENCE_EXP,
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
      type: P.ARRAY_EXP,
      elements: this.gobbleArguments(P.CBRACK_CODE)
    };
  }
}
const Ln = new Mn();
Object.assign(P, {
  hooks: Ln,
  plugins: new Rn(P),
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
P.max_unop_len = P.getMaxKeyLen(P.unary_ops);
P.max_binop_len = P.getMaxKeyLen(P.binary_ops);
const Le = (t) => new P(t).parse(), Pn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(P).filter((t) => !Pn.includes(t) && Le[t] === void 0).forEach((t) => {
  Le[t] = P[t];
});
Le.Jsep = P;
const Dn = "ConditionalExpression";
var Un = {
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
            type: Dn,
            test: o,
            consequent: r,
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
Le.plugins.register(Un);
const Bn = "ConditionalExpression";
var jn = {
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
            type: Bn,
            test: o,
            consequent: r,
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
Le.plugins.register(jn);
const Vn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, St = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, he = (t) => Number(t) > 0.5;
function je(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(c) {
    return c = String(c).trim(), /^\{[\s\S]*\}$/.test(c) && (c = c.slice(1, -1)), c = c.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (f) => {
      if (f[0] === '"' || f[0] === "'") return f;
      const [, d, p, v] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(f), b = p.toLowerCase(), h = b.startsWith("meg") ? 1e6 : b.startsWith("mil") ? 254e-7 : Vn[b[0]] || 1;
      return "(" + (v ? +(d + (d.includes(".") ? "" : ".") + v) : Number(d)) * h + ")";
    }), l(Le(c));
  }
  function l(c) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (c.type === "Literal") return c.value;
    if (c.type === "Identifier") {
      const f = c.name.toLowerCase();
      if (f === "pi") return Math.PI;
      if (f === "e") return Math.E;
      if (!Object.hasOwn(e, f)) throw Error("Undefined structural parameter: " + c.name);
      if (n.has(f)) throw Error("Circular structural parameter: " + f);
      n.add(f);
      const d = r(e[f]);
      return n.delete(f), d;
    }
    if (c.type === "ConditionalExpression") return he(l(c.test)) ? l(c.consequent) : l(c.alternate);
    if (c.type === "UnaryExpression") {
      const f = l(c.argument);
      if (c.operator === "-") return -f;
      if (c.operator === "+") return +f;
      if (c.operator === "!" || c.operator === "~") return !he(f);
    }
    if (c.type === "BinaryExpression") {
      const f = l(c.left);
      if (c.operator === "&&") return he(f) && he(l(c.right));
      if (c.operator === "||") return he(f) || he(l(c.right));
      const d = l(c.right);
      switch (c.operator) {
        case "+":
          return f + d;
        case "-":
          return f - d;
        case "*":
          return f * d;
        case "/":
          return f / d;
        case "**":
          return f ** d;
        case "%":
          return f % d;
        case "^":
          return he(f) !== he(d);
        case "&":
          return he(f) && he(d);
        case "|":
          return he(f) || he(d);
        case ">":
          return f > d;
        case "<":
          return f < d;
        case ">=":
          return f >= d;
        case "<=":
          return f <= d;
        case "==":
        case "===":
          return f === d;
        case "!=":
        case "!==":
          return f !== d;
      }
    }
    if (c.type === "CallExpression" && c.callee.type === "Identifier") {
      const f = c.callee.name.toLowerCase();
      if (f === "if") {
        if (c.arguments.length !== 3) throw Error("if() needs three arguments.");
        return he(l(c.arguments[0])) ? l(c.arguments[1]) : l(c.arguments[2]);
      }
      if (Object.hasOwn(St, f)) return St[f](...c.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const s = r(t);
  if (typeof s == "number" && !Number.isFinite(s)) throw Error("Structural expression is not finite.");
  return s;
}
function $e(t, { isolate: e = "" } = {}) {
  Tn(t);
  const n = ce(), o = /* @__PURE__ */ new Map();
  let r = 0, l = 0;
  function s(c, f, d, p, v, b, h) {
    if (f.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const m = t.scopes[c], _ = f.length ? ke(f.slice(0, -1), f.at(-1)) : "", N = ce();
    if (e && _ === e && (d = ce()), h.some((T) => T.scopeId === c)) throw Error("Circular subcircuit reference at " + _);
    const E = kn(p, m.defaults, m.parameters, v);
    function w(T) {
      if (/^\{[\s\S]*\}$/.test(T)) {
        const U = je(T, E);
        T = String(typeof U == "boolean" ? Number(U) : U);
      }
      /^"[\s\S]*"$/.test(T) && (T = T.slice(1, -1));
      const k = T.toLowerCase();
      return Object.hasOwn(d, k) ? d[k] : t.globals.includes(k) ? ct([], k) : N[k] || (N[k] = ct(f, k));
    }
    const A = { id: _, path: f, scopeId: c, name: b?.name || "Top", definition: m.name, ports: m.ports.map((T) => ({ name: T, node: w(T) })), params: E, nodes: N, models: ce(), devices: [], children: [], raw: b?.raw || "", line: b?.line || 0 };
    n[_] = A, o.set(_, w);
    const I = [...h, A];
    function C(T) {
      if (!T) return "";
      let k = m;
      for (; k; ) {
        if (k.directives.some((U) => new RegExp("^\\.model\\s+" + T.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(U.text))) {
          const U = [...I].reverse().find((x) => x.scopeId === k.id);
          return ke(U?.path || [], T.toLowerCase());
        }
        k = t.scopes[k.parent];
      }
      return T;
    }
    for (const T of m.directives.filter((k) => /^\.model\b/i.test(k.text))) {
      const k = /^\.model\s+(\S+)/i.exec(T.text)?.[1];
      if (!k) continue;
      const U = C(k), x = m.models[k.toLowerCase()], y = dt(T.text, E, w, (D) => ke(f, D));
      A.models[U] = { ...x, name: U, raw: y.replace(/^(\.model\s+)\S+/i, (D, F) => F + U), instanceId: _, parameters: E };
    }
    for (const T of m.devices) {
      if (++l > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const k = ce();
      for (const [x, y] of Object.entries(T.terminals)) k[x] = w(y);
      const U = C(T.model);
      A.devices.push({ ...T, name: ke(f, T.name), localName: T.name, instanceId: _, terminals: k, model: U, parameters: E });
    }
    for (const T of m.instances) {
      let k = T.definitionId;
      if (!k) {
        const D = String(je(T.definitionName, E)).toLowerCase();
        let F = m;
        for (; F && !k; )
          k = F.definitions[D], F = t.scopes[F.parent];
        if (!k) throw Error("Undefined selected subcircuit: " + D);
      }
      const U = t.scopes[k], x = ce();
      if (U.ports.length !== T.nodes.length) throw Error(T.name + ": expected " + U.ports.length + " ports; got " + T.nodes.length);
      U.ports.forEach((D, F) => {
        x[D.toLowerCase()] = w(T.nodes[F]);
      });
      const y = s(k, [...f, T.name], x, E, T.parameters, T, I);
      T.pinNames?.length === y.ports.length && y.ports.forEach((D, F) => {
        D.label = T.pinNames[F];
      }), A.children.push(y);
    }
    return A;
  }
  try {
    let v = function(b, h) {
      const m = h.split(":");
      if (m.length === 1) return { owner: b, name: h };
      const _ = m.pop();
      for (const N of [[...b.path, ...m], m]) {
        const E = f.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: _ };
      }
      throw Error("Unknown hierarchical reference: " + h);
    };
    const c = s(t.rootId, [], ce(), ce(), ce(), null, []), f = new Map(Object.values(n).map((b) => [b.id.toLowerCase(), b])), d = Object.assign(ce(), ...Object.values(n).map((b) => b.models)), p = (b) => d[b] || Object.entries(d).find(([h]) => h.startsWith(b + "."))?.[1];
    for (const b of Object.values(n)) for (const h of b.devices) {
      const m = t.scopes[b.scopeId].devices.find((E) => E.name === h.localName), _ = (E) => {
        const w = v(b, E);
        return o.get(w.owner.id)(w.name);
      }, N = (E, w = "", A = "") => {
        const I = v(b, E), C = I.owner.devices.find((T) => T.localName.toLowerCase() === I.name.toLowerCase());
        if (w.toLowerCase() === "ix") {
          const T = I.owner.ports.find((k, U) => k.name.toLowerCase() === I.name.toLowerCase() || String(U + 1) === I.name);
          if (T) return I.owner.id + ":" + T.name;
        }
        if (!C) {
          if (A) throw Error(h.name + ": referenced " + A + " device " + E + " was not found.");
          return ke(I.owner.path, I.name);
        }
        if (A && C.kind !== A) throw Error(h.name + ": " + E + " must be a " + A + " device.");
        return C.name;
      };
      if (h.value = dt(m.value, b.params, _, N), m.model && (h.value = h.value.replace(m.model, h.model)), h.kind === "M" && Object.keys(h.terminals).length === 3) {
        let E = p(h.model), w = !1;
        const A = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !A.has(E.name); ) {
          A.add(E.name);
          const I = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (I) {
            w = I[1] === void 0 || Number(je(I[1], E.parameters)) >= 0.5;
            break;
          }
          const C = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = p(C + (E.baseModel || "").toLowerCase()) || p((E.baseModel || "").toLowerCase());
        }
        A.size && (h.type = "spice_" + (w ? "pmos3" : "nmos3"));
      }
      h.controlSources = (m.controlSources || []).map((E) => N(E, "", "V")), h.controlSource = h.controlSources[0] || "", h.coupledInductors = (m.coupledInductors || []).map((E) => N(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...m.controlSources || [], ...m.coupledInductors || []])) {
        const w = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        h.value = h.value.replace(new RegExp("(?<![\\w./%])" + w + "(?![\\w.$])", "g"), () => N(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: c, contexts: n };
  } catch (c) {
    throw c.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: c.message }], c;
  }
}
function Re(t) {
  return [...t.devices, ...t.children.flatMap(Re)];
}
function Pe(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function mt(t, e = {}) {
  const n = new Map(t.components.map((x) => [x.name, x])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), l = [], s = (x, y) => JSON.stringify([x, y].sort()), c = (x) => e[x]?.potential !== null && e[x]?.potential !== void 0;
  for (const x of t.components) {
    for (const [L, B] of Object.entries(x.terminals))
      o.has(B) || o.set(B, []), o.get(B).push({ device: x.name, pin: L });
    if (x.kind === "R") {
      const L = Object.values(x.terminals);
      if (L.length === 2 && L[0] !== L[1]) {
        const B = s(...L);
        r.has(B) || r.set(B, []), r.get(B).push(x);
      }
    }
    const y = x.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(x.kind) ? "fet" : null, D = y === "bjt" ? /_(npn|pnp)$/.exec(x.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(x.type)?.[1];
    if (!y || !D) continue;
    const F = x.terminals, z = F[y === "bjt" ? "B" : "G"], $ = F[y === "bjt" ? "C" : "D"], H = F[y === "bjt" ? "E" : "S"];
    [z, $, H].some((L) => L === void 0) || z === H || $ === H || l.push({ id: x.name, family: y, polarity: D, control: z, drain: $, source: H, body: x.kind === "M" ? F.B : void 0 });
  }
  const f = [], d = /* @__PURE__ */ new Set(), p = (x, y, D, F, z, $ = "basic", H = [], L = "high") => {
    const B = [.../* @__PURE__ */ new Set([...y, ...H])], q = JSON.stringify([x, $, [...B].sort()]);
    d.has(q) || (d.add(q), f.push({ id: "motif" + f.length, kind: x, variant: $, transistors: y, members: B, roles: D, nets: F, evidence: z, confidence: L }));
  }, v = (x, y) => x.family === y.family && x.polarity === y.polarity, b = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), _ = new Map(l.map((x) => [x.id, x])), N = (x, y, D) => {
    x.has(y) || x.set(y, []), x.get(y).push(D);
  }, E = (x, y) => JSON.stringify([x.family, x.polarity, y]);
  for (const x of l)
    N(b, E(x, x.control), x), N(h, E(x, x.source), x), x.family === "bjt" && (o.get(x.source) || []).some((y) => {
      const D = _.get(y.device);
      return D && D.family === "bjt" && !v(x, D) && D.source === x.source;
    }) && N(m, E(x, x.drain), x);
  const w = (x) => [{ node: x.source, resistor: null }, ...(o.get(x.source) || []).flatMap((y) => {
    const D = n.get(y.device);
    if (D.kind !== "R") return [];
    const F = Object.values(D.terminals).find((z) => z !== x.source);
    return F !== void 0 && F !== x.control && F !== x.drain ? [{ node: F, resistor: D.name }] : [];
  })];
  for (const x of l) x.control === x.drain && p("diode-connected", [x.id], { reference: x.id }, { control: x.control, return: x.source }, ["control-drain-short", x.family]);
  for (const x of l) {
    const y = b.get(E(x, x.control));
    if (y.filter((L) => L.control === L.drain).length > 1) continue;
    let D = null;
    if (x.control !== x.drain && x.family === "bjt" && (D = (b.get(E(x, x.drain)) || []).find((L) => L.id !== x.id && v(L, x) && L.control === x.drain && L.source === x.control && c(L.drain))), x.control !== x.drain && !D) continue;
    const F = w(x), z = [];
    let $ = null, H = [];
    for (const L of y) {
      if (L.id === x.id || L.id === D?.id || L.drain === x.drain || L.drain === L.control) continue;
      const B = F.flatMap((q) => w(L).filter((X) => q.node === X.node).map((X) => ({ node: q.node, rs: [q.resistor, X.resistor].filter(Boolean) }))).find((q) => $ === null || q.node === $);
      B && ($ = B.node, z.push(L.id), H.push(...B.rs));
    }
    if (z.length) {
      const L = z.every((B) => _.get(B).body === x.body);
      p("current-mirror", [x.id, ...z, ...D ? [D.id] : []], { reference: x.id, outputs: z, ...D ? { helper: D.id } : {} }, { control: x.control, return: $ }, ["same-polarity", "shared-control", D ? "emitter-follower-reference" : "diode-reference", H.length ? "resistive-common-return" : "shared-return", L ? "compatible-bodies" : "different-body-connections"], D ? "assisted" : H.length ? "degenerated" : "basic", [...H, ...D ? [D.id] : []], L ? "high" : "medium");
    }
  }
  const A = [], I = /* @__PURE__ */ new Set(), C = (x, y) => {
    const D = JSON.stringify([x.id, y.id].sort());
    I.has(D) || (I.add(D), A.push([x, y]));
  };
  for (const x of h.values()) if (!c(x[0].source)) {
    const y = x.filter((D) => D.control !== D.drain);
    y.length === 2 ? C(...y) : y.length > 2 && new Set(y.map((D) => D.control)).size > 1 && p("differential-pair", y.map((D) => D.id), { inputs: y.map((D) => D.id) }, { tail: y[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const x of m.values()) for (let y = 0; y < x.length; y++) for (let D = y + 1; D < x.length; D++) C(x[y], x[D]);
  for (const [x, y] of A) {
    if (x.control === y.control || x.control === x.drain || y.control === y.drain) continue;
    if (x.source === y.source && x.drain !== y.drain && !c(x.source)) {
      const z = (o.get(x.source) || []).some((H) => H.device !== x.id && H.device !== y.id), $ = h.get(E(x, x.source)).length === 2;
      p("differential-pair", [x.id, y.id], { inputs: [x.id, y.id] }, { tail: x.source }, ["same-polarity", "distinct-controls", "shared-tail", z ? "tail-bias-connection" : "unbiased-tail", $ ? "two-input-tail" : "multi-input-tail"], "basic", [], z && $ && x.body === y.body ? "high" : "medium");
    }
    if (x.family !== "bjt" || x.drain !== y.drain || x.source === y.source) continue;
    const D = l.filter((z) => z.family === "bjt" && z.polarity !== x.polarity && z.source === x.source), F = l.filter((z) => z.family === "bjt" && z.polarity !== x.polarity && z.source === y.source);
    for (const z of D) for (const $ of F) z.id !== $.id && z.control === $.control && z.drain !== $.drain && z.control !== z.drain && $.control !== $.drain && p("differential-pair", [x.id, y.id, z.id, $.id], { inputs: [x.id, y.id], commonBase: [z.id, $.id] }, { inputCollectors: x.drain, bias: z.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const x of l) if (x.family === "bjt" && x.control !== x.drain) {
    const y = r.get(s(x.drain, x.control)) || [], D = r.get(s(x.control, x.source)) || [];
    y.length === 1 && D.length === 1 && p("vbe-multiplier", [x.id], { transistor: x.id, collectorResistor: y[0].name, emitterResistor: D[0].name }, { control: x.control, collector: x.drain, emitter: x.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [y[0].name, D[0].name]);
  }
  const T = l.filter((x) => x.family === "bjt"), k = /* @__PURE__ */ new Map();
  for (const x of T) N(k, x.control, x);
  const U = (x) => (o.get(x) || []).filter((y) => _.has(y.device));
  for (const x of T) if (x.control !== x.drain) {
    for (const y of k.get(x.source) || []) if (y.id !== x.id && v(x, y) && y.drain === x.control && y.source !== x.drain) {
      const D = r.get(s(x.source, y.source)) || [];
      D.length === 1 && p("current-limit-pair", [x.id, y.id], { driver: x.id, output: y.id, senseResistor: D[0].name }, { sense: x.source, drive: x.control, output: y.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [D[0].name]);
    }
    for (const y of k.get(x.source) || []) y.id !== x.id && v(x, y) && y.control !== y.drain && x.drain === y.drain && y.source !== x.control && p("darlington-pair", [x.id, y.id], { driver: x.id, output: y.id }, { link: x.source, collector: x.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (k.get(x.source) || []).length === 1 ? "high" : "medium");
    for (const y of k.get(x.drain) || []) y.id !== x.id && !v(x, y) && y.control !== y.drain && x.source === y.drain && y.source !== x.control && U(x.drain).length === 2 && p("sziklai-pair", [x.id, y.id], { driver: x.id, output: y.id }, { link: x.drain, feedback: x.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const y of o.get(x.drain) || []) {
      const D = _.get(y.device);
      !D || D.family !== "bjt" || D.id === x.id || !v(x, D) || D.source !== x.drain || c(x.drain) || D.control === x.control || D.control === D.drain || D.drain === x.source || U(x.drain).length !== 2 || p("cascode-pair", [x.id, D.id], { driver: x.id, output: D.id }, { link: x.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const x of T.filter((y) => y.polarity === "npn" && c(y.drain))) for (const y of T.filter((D) => D.polarity === "pnp" && c(D.drain))) {
    if (e[x.drain].potential <= e[y.drain].potential) continue;
    const D = w(x).flatMap((F) => w(y).filter((z) => F.node === z.node && !c(F.node)).map((z) => ({ node: F.node, rs: [F.resistor, z.resistor].filter(Boolean) })))[0];
    D && p("push-pull-pair", [x.id, y.id], { upper: x.id, lower: y.id }, { output: D.node }, ["complementary-polarity", "ordered-collector-supplies", D.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", D.rs);
  }
  return f;
}
function gt(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([l, s]) => [l, o(s)])), nets: Object.fromEntries(Object.entries(r.nets).map(([l, s]) => [l, n(s)])) }));
}
function Qn(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), l = new Map(t.components.map((s) => [s.name, s]));
  for (const s of n) {
    if (new Set(s.members).size !== s.members.length) throw Error("Duplicate @layout pair member.");
    const c = s.members.map((b) => l.get(b));
    if (c.some((b) => !b)) throw Error("Unknown @layout pair device.");
    const f = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[s.kind], d = s.kind === "differential" && c.length === 2 ? t.components.filter((b) => !s.members.includes(b.name) && Object.values(b.terminals).includes(c[0].terminals.E ?? c[0].terminals.S)) : [], p = mt({ ...t, components: [...c, ...d] }, e), v = p.find((b) => b.kind === f && b.confidence === "high" && s.members.every((h) => b.members.includes(h)));
    if (!v) throw Error("Invalid @layout pair " + s.kind + " { " + s.members.join(" ") + " }: electrical structure does not match.");
    for (const b of p.filter((h) => h === v || h.kind === "diode-connected" && h.members.every((m) => v.members.includes(m)))) {
      const h = JSON.stringify([b.kind, [...b.members].sort()]);
      r.has(h) || (r.add(h), o.push({ ...b, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function Gn(t, e, n = mt(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((b) => b.kind === "R"), l = t.components.filter((b) => b.kind === "Q"), s = new Map(t.components.map((b) => [b.name, b])), c = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), d = (b) => Object.values(b.terminals), p = (b, h, m) => {
    b && o.set(b.name, { reverse: d(b)[0] !== h, reason: m });
  };
  for (const b of l) {
    const { C: h, B: m, E: _ } = b.terminals, N = b.type.endsWith("pnp"), E = b.type.endsWith("npn");
    !N && !E || (c.has(_) || c.set(_, []), c.get(_).push(b), h === m && e[_]?.potential !== null && e[_]?.potential !== void 0 && f.set(h, { potential: e[_].potential }));
  }
  for (const b of n) if (b.kind === "vbe-multiplier" && b.confidence === "high") {
    const h = s.get(b.roles.transistor), m = h.type.endsWith("pnp"), _ = s.get(m ? b.roles.emitterResistor : b.roles.collectorResistor), N = s.get(m ? b.roles.collectorResistor : b.roles.emitterResistor);
    p(_, h.terminals[m ? "E" : "C"], "recognized VBE multiplier"), p(N, h.terminals.B, "recognized VBE multiplier");
  }
  for (const b of r) {
    const [h, m] = d(b), _ = f.get(h), N = f.get(m);
    _ && N && _.potential !== N.potential && p(b, _.potential > N.potential ? h : m, "diode-connected bias reference");
  }
  const v = /* @__PURE__ */ new Map();
  for (const b of r) {
    const h = d(b);
    if (!h.some((m) => e[m]?.potential !== null && e[m]?.potential !== void 0))
      for (const m of h)
        v.has(m) || v.set(m, []), v.get(m).push(b);
  }
  for (const [b, h] of v)
    if (!(h.length > 12))
      for (const m of h) for (const _ of h) {
        if (m === _) continue;
        const N = d(m).find((I) => I !== b), E = d(_).find((I) => I !== b), w = c.get(N)?.find((I) => I.type.endsWith("npn")), A = c.get(E)?.find((I) => I.type.endsWith("pnp"));
        w && A && (p(m, N, "complementary emitter output"), p(_, b, "complementary emitter output"));
      }
  return o;
}
function Fn(t) {
  const e = t.components.filter((l) => l.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((l) => l.kind === "R").map((l) => Object.values(l.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const l of e) {
    const s = l.terminals.E;
    n.has(s) || n.set(s, []), n.get(s).push(l);
  }
  for (const l of e) {
    const { B: s, C: c, E: f } = l.terminals;
    if (s === f || !o.has([s, f].sort().join("|"))) continue;
    const d = n.get(s) || [];
    if (!(d.length > 16))
      for (const p of d) {
        if (p === l) continue;
        if (p.terminals.B === c) {
          r.add(l.name);
          break;
        }
        const v = n.get(p.terminals.B) || [];
        if (v.length <= 16 && v.some((b) => b !== l && b !== p && b.terminals.B === c)) {
          r.add(l.name);
          break;
        }
      }
  }
  return r;
}
const Ve = 22;
function ut(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const Qe = (t) => ["pwr", "ret", "bias"].includes(t), Hn = (t) => String(t).split("/").at(-1).toLowerCase(), Vt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[Hn(t)] || "unknown", It = (t) => {
  const e = ut(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Vt(t);
};
function Wn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (s, c, f) => {
    e.has(s) || e.set(s, []), e.get(s).push({ node: c, delta: f });
  };
  for (const s of t)
    if (s.kind === "V")
      try {
        let c = s.value.trim();
        const f = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(c);
        if (f && Number(je(f[1], s.parameters)) !== 0 || (c = c.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(c))) continue;
        const d = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(c);
        if (!d) continue;
        const p = je(d[1], s.parameters);
        if (typeof p != "number" || !Number.isFinite(p)) continue;
        o(s.terminals["-"], s.terminals["+"], p), o(s.terminals["+"], s.terminals["-"], -p);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const s of ["0", ...e.keys()]) {
    if (l.has(s)) continue;
    const c = /* @__PURE__ */ new Map([[s, 0]]), f = [s];
    l.add(s);
    let d = !1;
    for (let p = 0; p < f.length; p++) for (const v of e.get(f[p]) || []) {
      const b = c.get(f[p]) + v.delta;
      c.has(v.node) ? Math.abs(c.get(v.node) - b) > 1e-8 * Math.max(1, Math.abs(b)) && (d = !0) : (c.set(v.node, b), l.add(v.node), f.push(v.node));
    }
    d && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [p, v] of c) r[p] = { value: v, reference: s, known: s === "0" && !d, consistent: !d };
  }
  return { nodes: r, diagnostics: n };
}
function qn(t, e, n = null) {
  const o = Wn(Re(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ Object.create(null);
  for (const p of Object.values(e.nodes)) {
    const v = ut(p.name), b = Vt(p.name);
    r[p.name] = { role: v !== "unknown" ? v : b, roleSource: v !== "unknown" ? "node-name" : b !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[p.name]?.known ? o.nodes[p.name].value : null };
  }
  if (e.localScope) for (const p of e.interfaceBindings) {
    const v = r[p.local], b = It(p.port);
    v && v.potential === null && ["pwr", "ret"].includes(b) && (v.potential = b === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(p.port) ? 0 : -1, v.potentialSource = "symbolic-port-order");
  }
  const s = n?.pairs?.length ? Qn(e, r, n.pairs) : mt(e, r), c = Gn(e, r, s), f = Fn(e), d = (p, v, b) => {
    const h = { role: r[b].role, roleSource: r[b].roleSource }, m = p.block?.ports.find((E) => E.pin === v);
    if (m?.implicit || !p.block && !p.synthetic) return h;
    const _ = p.synthetic ? p.value : m?.name || m?.label, N = It(_);
    return N !== "unknown" ? { role: N, roleSource: ut(_) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : Qe(h.role) ? { ...h, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const p of e.components) {
    const v = Object.fromEntries(Object.entries(p.terminals).map(([U, x]) => [U, { ...r[x], ...d(p, U, x) }])), b = Object.values(v), h = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(p.type), m = h && !c.has(p.name) && b.length === 2 && b.every((U) => !Qe(U.role) && (U.potential === null || U.role !== "unknown")), _ = p.terminals["+"], N = p.terminals["-"], E = [_, N].filter((U) => U && U !== "0"), w = p.kind === "V" && E.some((U) => Qe(r[U]?.role)) && !E.some((U) => ["in", "out", "io", "fb"].includes(r[U]?.role)) && [_, N].every((U) => o.nodes[U]?.known), A = _ === "0" ? N : _, I = Object.keys(p.terminals), C = (U) => Qe(U.role) ? U.potential !== null ? U.potential > 0 ? "high" : "low" : U.role === "ret" ? "low" : "high" : "signal";
    let T = !1;
    I.length === 2 && (p.kind === "V" && b.every((U) => U.potential !== null) ? T = b[0].potential < b[1].potential : p.terminals[I[0]] === "0" ? T = !0 : p.terminals[I[1]] === "0" ? T = !1 : b.every((U) => U.potential !== null) ? T = b[0].potential < b[1].potential : T = C(b[0]) === "low" || C(b[1]) === "high" && C(b[0]) === "signal"), c.has(p.name) && (T = c.get(p.name).reverse);
    const k = p.synthetic ? "" : p.name.startsWith(e.focus + "/") ? p.name.slice(e.focus.length + 1) : p.name;
    l[p.name] = { version: Ve, kind: p.kind, polarity: p.type.endsWith("pnp") ? "p" : p.type.endsWith("npn") ? "n" : null, currentLimiter: f.has(p.name), orientationReason: c.get(p.name)?.reason || null, owner: k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : "", passive: h, source: ["V", "I", "E", "F", "G", "H"].includes(p.kind) || p.kind === "B" && !h, ports: v, horizontal: m, orientation: m ? "horizontal" : T ? "vertical-reversed" : "vertical", flexible: I.length === 2 && (h || ["V", "I", "B", "F", "H"].includes(p.kind)), supply: !!w, voltage: w ? o.nodes[A].value : null };
  }
  return { version: Ve, nodes: r, cells: l, motifs: s, diagnostics: o.diagnostics };
}
function Qt(t, e) {
  const n = e.ports.map((r, l) => ({ pin: "P" + l, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(Re(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const l = ct([], r);
    o.has(l) && !n.some((s) => s.node === l) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: l, implicit: !0 });
  }
  return n;
}
function Ge(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, l = t.contexts[o];
  if (!l) throw Error("Unknown instance: " + o);
  o && (t = $e(t.ir, { isolate: o }));
  const s = t.contexts[o];
  if (!s) throw Error("Unknown instance: " + o);
  const c = [], f = [];
  function d(m) {
    f.push(...Object.values(m.nodes), ...m.ports.map((N) => N.node));
    const _ = [...m.devices.map((N) => ({ line: N.line, device: N })), ...m.children.map((N) => ({ line: N.line, child: N }))].sort((N, E) => N.line - E.line);
    for (const N of _) {
      if (N.device) {
        const I = N.device;
        c.push({ ...I, layoutLabel: [...m.path.slice(s.path.length), I.localName].join("/") });
        continue;
      }
      const E = N.child;
      if (e === "flat" || n.has(E.id)) {
        d(E);
        continue;
      }
      const w = Qt(t, E), A = ce();
      w.forEach((I) => {
        A[I.pin] = I.node;
      }), c.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: A, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(s.path.length).join("/"), block: { definitionId: E.scopeId, ports: w, parameters: E.params } });
    }
  }
  d(s);
  for (const [m, _] of s.ports.entries()) c.push({ name: "@port/" + o + "/" + m, kind: "PORT", type: "spice_port", terminals: { A: _.node }, layoutLabel: _.name, value: _.name, raw: "Interface port " + _.name, synthetic: !0 });
  if (c.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const p = Object.assign(ce(), ...Object.values(t.contexts).map((m) => m.models)), v = { title: o || t.ir.title, components: c, nodes: An(c, f), models: p, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  v.interfaceBindings = s.ports.map((m, _) => ({ port: m.name, local: m.node, parent: l.ports[_].node }));
  const b = /* @__PURE__ */ new Map();
  for (const m of l.ports)
    b.has(m.node) || b.set(m.node, []), b.get(m.node).push(m.name);
  v.interfaceAliases = [...b].filter(([, m]) => m.length > 1).map(([m, _]) => ({ node: m, ports: _ })), v.topology = zn(r, v);
  const h = In(t, v);
  return v.layout = qn(t, v, h), v.layout.description = h, v;
}
function zn(t, e) {
  const n = Re(t.contexts[e.focus]);
  e.localScope && (t = $e(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const c of e.components)
    if (!c.synthetic)
      if (c.kind === "X") {
        const f = t.contexts[c.instanceId];
        if (!f) throw Error("Projection contains an unknown block.");
        const d = Qt(t, f);
        if (JSON.stringify(Object.entries(c.terminals)) !== JSON.stringify(d.map((p) => [p.pin, p.node]))) throw Error("Block interface topology mismatch: " + c.name);
        o.push(...Re(f));
      } else o.push(c);
  for (const c of o) {
    if (r.has(c.name)) throw Error("Projection duplicates " + c.name);
    r.add(c.name);
  }
  const l = Pe(o), s = Re(t.contexts[e.focus]);
  if (l !== Pe(s)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const c = new Map(e.interfaceBindings.map((p) => [p.local, p.parent])), f = (p) => c.get(p) ?? p, d = o.map((p) => ({ ...p, terminals: Object.fromEntries(Object.entries(p.terminals).map(([v, b]) => [v, f(b)])), value: dt(p.value, {}, f, (v) => v) }));
    if (Pe(d) !== Pe(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: l, boundSignature: Pe(n), boundaryVerified: !0 };
}
function Fe(t) {
  const e = ce(), n = ce();
  for (const o of t.components) {
    const r = ce(), l = ce();
    for (const [s, c] of Object.entries(o.terminals))
      r[s] = [t.nodes[c].bit], l[s] = "input";
    e[o.name] = { type: o.type, port_directions: l, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((s) => ({ pin: s.pin, label: s.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((s, c) => ({ pin: s, label: o.pinLabels?.[c] || s })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: gt(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Xn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (d) => (n.has(d) || n.set(d, n.size + 2), n.get(d));
  Object.entries(t.modules.circuit.cells).forEach(([d, p], v) => {
    const b = "c" + v;
    e.set(b, d);
    const h = Object.fromEntries(Object.entries(p.connections).map(([m, _]) => [m, _.map(r)]));
    o[b] = { type: p.type, connections: h, port_directions: p.port_directions, attributes: { displayRef: p.attributes.displayRef || p.attributes.ref || "", value: p.attributes.value || "", name: p.attributes.name || "" } }, p.spiceBlock && (o[b].spiceBlock = p.spiceBlock), p.spiceSymbol && (o[b].spiceSymbol = p.spiceSymbol), p.spiceLayout && (o[b].spiceLayout = p.spiceLayout);
  });
  const l = new Map([...e].map(([d, p]) => [p, d])), s = t.modules.circuit.spiceLayoutDescription, c = s ? { ...s, faces: (s.faces || []).map((d) => ({ ...d, device: l.get(d.device) })), pairs: (s.pairs || []).map((d) => ({ ...d, members: d.members.map((p) => l.get(p)) })), groups: s.groups.map((d) => ({ ...d, members: d.members.map((p) => p.cell ? { ...p, cell: l.get(p.cell) } : p) })), relations: s.relations.map((d) => ({ ...d, a: l.get(d.a) || d.a, b: l.get(d.b) || d.b })) } : null, f = gt(t.modules.circuit.spiceMotifs || [], (d) => l.get(d), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: f, spiceLayoutDescription: c } } }, ids: e, bits: new Map([...n].map(([d, p]) => [p, d])) };
}
const Ce = /* @__PURE__ */ new Map();
async function tt(t, e) {
  const n = Xn(t), o = JSON.stringify([n.netlist, e]);
  let r = Ce.get(o);
  r ? (Ce.delete(o), Ce.set(o, r)) : (r = await $n(n.netlist, e), r.svg.length < 1e6 && (Ce.set(o, r), Ce.size > 20 && Ce.delete(Ce.keys().next().value)));
  const l = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (l.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const f of l.querySelectorAll("[id],[class]")) {
    const d = f.getAttribute("id");
    d?.startsWith("cell_") && n.ids.has(d.slice(5)) && f.setAttribute("id", "cell_" + n.ids.get(d.slice(5)));
    const p = f.getAttribute("class");
    p && f.setAttribute("class", p.split(/\s+/).map((v) => v.startsWith("cell_") && n.ids.has(v.slice(5)) ? "cell_" + n.ids.get(v.slice(5)) : /^net_\d+$/.test(v) && n.bits.has(Number(v.slice(4))) ? "net_" + n.bits.get(Number(v.slice(4))) : v).join(" "));
  }
  const s = r.drawing ? structuredClone(r.drawing) : null, c = l.querySelector("#spice-layout-report");
  if (c) {
    const f = JSON.parse(c.textContent), d = (p) => n.ids.get(p) || p;
    f.mirroredTransistors = (f.mirroredTransistors || []).map(d), f.orientationDevicesTested = (f.orientationDevicesTested || []).map(d), f.recognizedMotifs = gt(f.recognizedMotifs || [], d, (p) => n.bits.get(p) ?? p), f.inputAttachments = (f.inputAttachments || []).map(d), f.mirroredInputPorts = (f.mirroredInputPorts || []).map(d);
    for (const p of [...f.flippedPairs || [], ...f.pairOrientationTrials || []]) p.members = p.members.map(d);
    for (const p of f.pairCompactions || [])
      p.members = p.members.map(d), p.moved = d(p.moved);
    for (const p of f.pairConstraints || []) p.members = p.members.map(d);
    for (const p of f.pairProximity || []) p.members = p.members.map(d);
    for (const p of f.motifMeasurements || [])
      p.members = p.members.map(d), p.interlopers && (p.interlopers = p.interlopers.map(d));
    for (const p of f.voltageRails || []) p.bit !== void 0 && (p.bit = n.bits.get(p.bit) ?? p.bit);
    c.textContent = JSON.stringify(f);
  }
  if (s) {
    for (const f of s.components) {
      f.id = n.ids.get(f.id) || f.id;
      for (const d of f.ports) d.bit = n.bits.get(d.bit) ?? d.bit;
    }
    for (const f of s.segments) f.bit = n.bits.get(f.bit) ?? f.bit;
  }
  return { svg: new XMLSerializer().serializeToString(l.documentElement), drawing: s };
}
function $n(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const l = (f, d) => {
      clearTimeout(c), n.terminate(), f ? r(Error(f)) : o(d);
    }, s = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, c = setTimeout(() => l("Layout timed out. Open a subcircuit sheet or collapse instances."), s);
    n.onmessage = ({ data: f }) => l(f.error, { svg: f.svg, drawing: f.drawing }), n.onerror = (f) => l(f.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Yn = `* RLC low-pass filter
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
`, Kn = `* Voltage-divider biased common-emitter amplifier.
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
`, Zn = `* Common-collector voltage follower; independently chosen example values.
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
`, Jn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, er = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, De = {
  filter: { source: Yn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Kn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Zn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Jn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: er, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function tr(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function At(t) {
  return tr(await t.arrayBuffer());
}
const Gt = [
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
].flat(), bt = "#292b29", Ye = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Gt[e * 9 + t]))])], Tt = (t) => /^#[\da-f]{6}$/i.test(t), Ot = "spice-node-colors-v1";
function nr(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class rr {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = nr(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Ye[this.assigned.size % Ye.length]), this.assigned.get(e)) : bt;
  }
  set(e, n) {
    if (!Tt(n)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && Tt(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function or(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const l = o.get(r.getAttribute("data-net"));
    if (!l) continue;
    r.style.setProperty("stroke", l, "important"), r.localName === "circle" && r.style.setProperty("fill", l, "important");
  }
}
function ir(t, e) {
  const n = new rr(), o = /* @__PURE__ */ new Set();
  let r = [], l = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Ot) || "null"));
  } catch {
  }
  const s = () => {
    try {
      sessionStorage.setItem(Ot, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, c = () => {
    const b = t("node-search").value.trim().toLowerCase();
    return r.filter((h) => !b || [h.name, h.displayName, ...h.terminals.map((m) => m.component + "." + m.pin)].some((m) => m.toLowerCase().includes(b)));
  };
  function f() {
    const b = c(), h = b.filter((m) => o.has(m.name)).length;
    t("node-count").textContent = `${b.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!b.length && h === b.length, t("node-all").indeterminate = h > 0 && h < b.length, t("node-auto").checked = n.auto;
    for (const m of ["node-apply", "node-clear"]) t(m).disabled = !l || !o.size;
    t("node-all").disabled = !l || !b.length;
  }
  function d() {
    t("nets").replaceChildren(...c().map((b) => {
      const h = document.createElement("tr");
      h.dataset.node = b.name;
      const m = document.createElement("td"), _ = document.createElement("input");
      _.type = "checkbox", _.checked = o.has(b.name), _.disabled = !l, _.setAttribute("aria-label", "Select node " + b.displayName), _.onchange = () => {
        _.checked ? o.add(b.name) : o.delete(b.name), f();
      }, m.append(_);
      const N = document.createElement("td");
      N.textContent = b.displayName;
      const E = document.createElement("td"), w = document.createElement("input");
      w.type = "color", w.value = n.color(b.name), w.disabled = !l, w.setAttribute("aria-label", "Wire color for " + b.displayName), w.onchange = () => {
        n.set([b.name], w.value), p();
      }, E.append(w);
      const A = document.createElement("td");
      return A.textContent = b.terminals.map((I) => I.component + "." + I.pin).join(", "), h.append(m, N, E, A), h;
    })), f();
  }
  function p() {
    for (const b of r) n.color(b.name);
    d(), s(), e(n, r);
  }
  t("node-search").oninput = d, t("node-all").onchange = () => {
    for (const b of c()) t("node-all").checked ? o.add(b.name) : o.delete(b.name);
    d();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, p();
  }, t("node-apply").onclick = () => {
    n.set(o, t("node-color").value), p();
  }, t("node-clear").onclick = () => {
    n.set(o, bt), p();
  }, t("node-reset").onclick = () => {
    n.reset(), p();
  }, t("node-swatches").replaceChildren(...Gt.map((b) => {
    const h = document.createElement("button");
    return h.type = "button", h.style.backgroundColor = b, h.title = b, h.setAttribute("aria-label", "Apply palette color " + b), h.onclick = () => {
      o.size && (t("node-color").value = b, n.set(o, b), p());
    }, h;
  }));
  function v(b) {
    l = b;
    for (const h of t("node-panel").querySelectorAll("input,button")) h.disabled = !l;
    f();
  }
  return { snapshot: () => n.snapshot(), restore(b) {
    n.restore(b), o.clear(), p();
  }, setCircuit(b, h) {
    const m = n.sourceId;
    n.setSource(h), m !== n.sourceId && o.clear(), r = Object.values(b?.nodes || {});
    const _ = new Set(r.map((N) => N.name));
    for (const N of o) _.has(N) || o.delete(N);
    for (const N of r) n.color(N.name);
    l = !!b, d(), v(l), s(), e(n, r);
  }, setEnabled: v };
}
function sr(t) {
  const e = (L) => t.querySelector("#spice-" + L), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, l = Object.fromEntries(Object.keys(r).map((L) => [L, t.querySelector(`[data-window-handle="${L}"]`)])), s = { editor: !0, details: !0, info: !0 }, c = { editor: !0, details: !0, info: !0 }, f = [], d = { editor: {}, details: {}, info: {} }, p = [];
  let v = !1, b = !1, h = null, m = null, _ = null, N = null;
  function E(L, B) {
    c[L] = B, r[L].dataset.pinned = String(B);
    const q = e("pin-" + L), X = { editor: "netlist", details: "details", info: "messages" }[L], J = L === "info" ? "bottom edge" : L === "details" ? "lower left" : "left edge", ie = B ? `Unpin ${X} from ${J}` : `Pin ${X} to ${J}`;
    if (q.setAttribute("aria-pressed", String(B)), q.setAttribute("aria-label", ie), q.title = ie, B) for (const Z of ["left", "top", "right", "bottom", "width", "height"]) r[L].style.removeProperty(Z);
    v && requestAnimationFrame(x);
  }
  for (const L of Object.keys(r)) E(L, !0);
  const w = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: v, panels: { ...s } } })), A = (L, B, q, X = {}) => L.addEventListener(B, q, { ...X, signal: o });
  function I(L, B) {
    s[L] = B, r[L].hidden = v && !B, requestAnimationFrame(x), w();
  }
  function C(L, B = e("details-content")) {
    const q = document.createComment("workspace return");
    L.before(q), f.push({ node: L, anchor: q }), B === e("details-content") ? B.prepend(L) : B.append(L);
  }
  function T(L) {
    const B = L.getBoundingClientRect(), q = t.getBoundingClientRect();
    return { x: B.left - q.left, y: B.top - q.top, w: B.width, h: B.height, width: q.width, height: q.height };
  }
  function k(L, B, q) {
    const X = T(L), J = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, ie = Math.max(8, Math.min(B, X.width - X.w - 8)), Z = Math.max(8, Math.min(J, X.height - X.h - 8)), fe = Math.max(Z, Math.min(q, X.height - X.h - 8));
    L.style.left = Math.round(ie) + "px", L.style.top = Math.round(fe) + "px", L.style.right = "auto", L.style.bottom = "auto";
  }
  function U() {
    if (!v || !c.info || r.info.hidden) return;
    const L = t.getBoundingClientRect(), B = L.width <= 600 ? 8 : 12, q = L.width <= 600 ? B : Math.max(B, ...["editor", "details"].filter((ie) => c[ie] && !r[ie].hidden).map((ie) => r[ie].getBoundingClientRect().right - L.left + 12)), X = Math.min(q, Math.max(B, L.width - 160 - B)), J = r.info;
    for (const [ie, Z] of Object.entries({ left: Math.round(X) + "px", right: B + "px", width: "auto" })) J.style[ie] !== Z && (J.style[ie] = Z);
  }
  function x() {
    if (v) {
      U();
      for (const [L, B] of Object.entries(r)) if (!B.hidden && !c[L]) {
        const q = T(B);
        k(B, q.x, q.y);
      }
    }
  }
  function y() {
    for (const L of Object.values(r))
      for (const B of ["left", "top", "right", "bottom", "width", "height", "z-index"]) L.style.removeProperty(B);
    for (const L of Object.keys(r))
      E(L, !0), I(L, !0);
    requestAnimationFrame(x);
  }
  function D() {
    if (v) return;
    v = !0, h = document.activeElement, m = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, N = document.createComment("workspace mount"), t.before(N), document.body.append(t);
    for (const B of document.body.children) B !== t && (p.push({ node: B, inert: B.inert }), B.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const B of Object.keys(r))
      d[B].base = r[B].style.cssText, d[B].floating && (r[B].style.cssText = d[B].floating), r[B].setAttribute("role", "dialog"), r[B].setAttribute("aria-modal", "false"), r[B].setAttribute("aria-labelledby", "spice-" + B + "-title"), l[B].tabIndex = 0, l[B].title = "Drag to move; arrow keys move the window", I(B, s[B]);
    for (const B of ["selection-actions", "selection", "hierarchy-panel"]) C(e(B));
    const L = e("workspace-strip");
    for (const B of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (L.childElementCount) {
        const q = document.createElement("span");
        q.className = "spice-tool-divider", q.setAttribute("role", "separator"), q.setAttribute("aria-orientation", "vertical"), L.append(q);
      }
      C(B === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(B), L);
    }
    requestAnimationFrame(x), e("exit-fullscreen").focus({ preventScroll: !0 }), w();
  }
  function F() {
    if (v) {
      v = !1, _ = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: L, anchor: B } of f.splice(0))
        B.before(L), B.remove();
      e("workspace-strip").replaceChildren();
      for (const L of Object.keys(r)) {
        d[L].floating = r[L].style.cssText, r[L].style.cssText = d[L].base, r[L].hidden = !1;
        for (const B of ["role", "aria-modal", "aria-labelledby"]) r[L].removeAttribute(B);
        l[L].removeAttribute("tabindex"), l[L].removeAttribute("title");
      }
      N && (N.before(t), N.remove(), N = null);
      for (const { node: L, inert: B } of p.splice(0)) L.inert = B;
      m && (document.documentElement.style.overflow = m.html, document.body.style.overflow = m.body, window.scrollTo(m.x, m.y)), h?.focus?.({ preventScroll: !0 }), w();
    }
  }
  async function z() {
    D(), t.dataset.nativeFullscreen = "false";
  }
  async function $() {
    if (b = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        b = !0;
        return;
      }
    F();
  }
  A(e("fullscreen"), "click", () => v ? $() : z()), A(e("exit-fullscreen"), "click", $), A(e("reset-windows"), "click", y);
  for (const L of Object.keys(r)) {
    A(e("pin-" + L), "click", () => {
      const X = T(r[L]);
      E(L, !c[L]), c[L] || (r[L].style.width = X.w + "px", r[L].style.height = X.h + "px", k(r[L], X.x, X.y)), w();
    }), A(e("close-" + L), "click", () => {
      I(L, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), A(r[L], "pointerdown", () => {
      if (v) {
        for (const X of Object.values(r)) X.style.zIndex = "20";
        r[L].style.zIndex = "30";
      }
    }, { capture: !0 });
    const B = l[L];
    A(B, "pointerdown", (X) => {
      if (!v || X.button !== 0 || X.target.closest("button,input,select,textarea,a,label")) return;
      X.preventDefault();
      const J = T(r[L]);
      E(L, !1), r[L].style.width = J.w + "px", r[L].style.height = J.h + "px", k(r[L], J.x, J.y), _ = { id: L, pointer: X.pointerId, x: X.clientX, y: X.clientY, left: J.x, top: J.y }, B.setPointerCapture(X.pointerId);
    }), A(B, "pointermove", (X) => {
      _?.id === L && _.pointer === X.pointerId && k(r[L], _.left + X.clientX - _.x, _.top + X.clientY - _.y);
    });
    const q = () => {
      _ = null;
    };
    A(B, "pointerup", q), A(B, "pointercancel", q), A(B, "lostpointercapture", q), A(B, "keydown", (X) => {
      if (!v || X.target !== B || !X.key.startsWith("Arrow")) return;
      X.preventDefault();
      const J = T(r[L]), ie = X.shiftKey ? 32 : 8;
      E(L, !1), r[L].style.width = J.w + "px", r[L].style.height = J.h + "px", k(r[L], J.x + ({ ArrowLeft: -ie, ArrowRight: ie }[X.key] || 0), J.y + ({ ArrowUp: -ie, ArrowDown: ie }[X.key] || 0));
    });
  }
  A(document, "fullscreenchange", () => {
    v && b && document.fullscreenElement !== t && (b = !1, F());
  }), A(document, "keydown", (L) => {
    v && L.altKey && L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), $());
  }, { capture: !0 }), A(window, "resize", x);
  const H = new ResizeObserver(x);
  for (const L of Object.values(r)) H.observe(L);
  return { enter: z, exit: $, showPanel: I, reset: y, destroy() {
    $(), n.abort(), H.disconnect();
  } };
}
const Ke = (t) => !t.decoration || t.selectable === !0;
function kt(t, e, n) {
  const o = Math.min(e.x, n.x), r = Math.max(e.x, n.x), l = Math.min(e.y, n.y), s = Math.max(e.y, n.y), c = n.x < e.x, f = 1e-3;
  return t.filter((d) => Ke(d) && (c ? d.x <= r + f && d.x + d.width >= o - f && d.y <= s + f && d.y + d.height >= l - f : d.x >= o - f && d.x + d.width <= r + f && d.y >= l - f && d.y + d.height <= s + f)).map((d) => d.id);
}
function ar(t, e, n, o) {
  const r = new Set(e), l = t.filter((N) => r.has(N.id) && Ke(N)), s = n.startsWith("space-");
  if (l.length < (s ? 3 : 2)) throw Error(s ? "Select at least three components." : "Select at least two components.");
  const c = ["left", "right", "center-x", "space-x"].includes(n), f = ["top", "bottom", "center-y", "space-y"].includes(n);
  if (!c && !f) throw Error("Unknown arrangement.");
  const d = c ? "x" : "y", p = c ? "width" : "height", v = Math.min(...l.map((N) => N[d])), b = Math.max(...l.map((N) => N[d] + N[p])), h = /* @__PURE__ */ new Map();
  if (s) {
    const N = [...l].sort((C, T) => C[d] - T[d] || C.id.localeCompare(T.id)), E = N.at(-1), w = E[d] + E[p] - N[0][d], A = (w - N.reduce((C, T) => C + T[p], 0)) / (l.length - 1);
    if (A < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let I = N[0][d];
    for (const C of N)
      h.set(C.id, I), I += C[p] + A;
  } else for (const N of l) h.set(N.id, ["left", "top"].includes(n) ? v : ["right", "bottom"].includes(n) ? b - N[p] : (v + b - N[p]) / 2);
  let m = !1;
  return { moves: l.map((N) => {
    const E = h.get(N.id) - N[d], w = Math.round(E / o) * o;
    return Math.abs(w - E) > 1e-3 && (m = !0), { id: N.id, dx: c ? w : 0, dy: f ? w : 0 };
  }), rounded: m };
}
const lr = (t) => "@manual-group/" + t;
function ft(t, e = []) {
  const n = new Set(t);
  for (const o of e) if (o.members.some((r) => n.has(r))) for (const r of o.members) n.add(r);
  return n;
}
function He(t, e = []) {
  const n = new Set(t);
  return e.find((o) => o.members.length === n.size && o.members.every((r) => n.has(r)));
}
function Ie(t, e = []) {
  const n = new Map(t.map((l) => [l.id, l])), o = new Set(e.flatMap((l) => l.members)), r = t.filter((l) => !o.has(l.id)).map((l) => ({ ...l, members: [l.id] }));
  for (const l of e) {
    const s = l.members.map((d) => n.get(d));
    if (s.some((d) => !d)) throw Error("Unknown manual group member.");
    const c = Math.min(...s.map((d) => d.x)), f = Math.min(...s.map((d) => d.y));
    r.push({ id: lr(l.id), groupId: l.id, members: [...l.members], x: c, y: f, width: Math.max(...s.map((d) => d.x + d.width)) - c, height: Math.max(...s.map((d) => d.y + d.height)) - f, ports: [] });
  }
  return r;
}
function Ue(t, e = []) {
  if (!e.length) return !1;
  const n = Ie(t, e);
  return n.some((o, r) => n.slice(r + 1).some((l) => (o.groupId || l.groupId) && o.x < l.x + l.width - 1e-3 && o.x + o.width > l.x + 1e-3 && o.y < l.y + l.height - 1e-3 && o.y + o.height > l.y + 1e-3));
}
function Ft(t, e) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 5e3) throw Error("Invalid project: invalid manual groups.");
  const n = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), r = new Map(e.map((l) => [l.id, l]));
  for (const l of t) {
    if (!l || typeof l.id != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(l.id) || n.has(l.id) || !Array.isArray(l.members) || l.members.length < 2) throw Error("Invalid project: invalid manual group identity.");
    n.add(l.id);
    for (const s of l.members) {
      const c = r.get(s);
      if (!c || !Ke(c) || o.has(s)) throw Error("Invalid project: missing or duplicate manual group member.");
      o.add(s);
    }
  }
}
const Ht = (t, e) => encodeURIComponent(t) + ":" + e;
function Wt(t) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 2e4) throw Error("Invalid project: invalid label overrides.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!n || typeof n.owner != "string" || !Number.isSafeInteger(n.index) || n.index < 0 || n.id !== Ht(n.owner, n.index) || e.has(n.id) || typeof n.text != "string" || n.text.length > 2e4 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(n.text) || ![n.x, n.y].every((r) => Number.isFinite(r) && Math.abs(r) <= 1e6)) throw Error("Invalid project: invalid label identity, text or position.");
    e.add(n.id);
    const o = n.orientation;
    if (!Array.isArray(o) || o.length !== 4 || !o.every((r) => [-1, 0, 1].includes(r)) || o[0] ** 2 + o[1] ** 2 !== 1 || o[2] ** 2 + o[3] ** 2 !== 1 || o[0] * o[2] + o[1] * o[3] !== 0) throw Error("Invalid project: label transform must be a rotation or mirror.");
  }
}
function cr(t, e) {
  const n = { rotate: [0, 1, -1, 0], "mirror-x": [1, 0, 0, -1], "mirror-y": [-1, 0, 0, 1] }[e];
  if (!n) throw Error("Unknown label transform.");
  const o = t.orientation;
  return { ...t, orientation: [n[0] * o[0] + n[2] * o[1], n[1] * o[0] + n[3] * o[1], n[0] * o[2] + n[2] * o[3], n[1] * o[2] + n[3] * o[3]].map((r) => r || 0) };
}
const dr = "http://www.w3.org/2000/svg";
function qt(t) {
  const e = /* @__PURE__ */ new Map();
  return [...t.querySelectorAll("text")].filter((n) => !n.closest("defs")).map((n) => {
    const o = n.closest('g[id^="cell_"]')?.id.slice(5) || "", r = e.get(o) || 0;
    return e.set(o, r + 1), { node: n, owner: o, index: r, id: Ht(o, r) };
  });
}
function zt(t, e) {
  Wt(e);
  const n = new Set(qt(t).map((o) => o.id));
  for (const o of e || []) if (!n.has(o.id)) throw Error("Invalid project: unknown label " + o.id);
}
function ur() {
  let t = null, e = /* @__PURE__ */ new Map(), n = [], o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), l = !1, s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
  const f = (h, m) => {
    const _ = document.createElementNS(dr, h);
    for (const [N, E] of Object.entries(m)) _.setAttribute(N, E);
    return _;
  };
  function d() {
    for (const h of e.values()) if (h.node.isConnected) {
      for (const m of [...h.node.attributes]) h.node.removeAttribute(m.name);
      for (const [m, _] of h.attributes) h.node.setAttribute(m, _);
      h.node.textContent = h.text;
    }
    t?.querySelector("[data-label-hit-layer]")?.remove(), e.clear(), n = [];
  }
  function p(h) {
    const m = h.getBBox(), _ = t.getCTM().inverse().multiply(h.getCTM()), N = [[m.x, m.y], [m.x + m.width, m.y], [m.x, m.y + m.height], [m.x + m.width, m.y + m.height]].map(([A, I]) => new DOMPoint(A, I).matrixTransform(_)), E = Math.min(...N.map((A) => A.x)), w = Math.min(...N.map((A) => A.y));
    return { x: E, y: w, width: Math.max(...N.map((A) => A.x)) - E, height: Math.max(...N.map((A) => A.y)) - w };
  }
  function v(h, m) {
    h.node.textContent = m.text;
    const _ = h.node.getBBox(), [N, E, w, A] = m.orientation, I = o.get(m.owner) || { x: 0, y: 0 }, C = [0, N * _.width, w * _.height, N * _.width + w * _.height], T = [0, E * _.width, A * _.height, E * _.width + A * _.height], k = new DOMMatrix([N, E, w, A, I.x + m.x - Math.min(...C) - N * _.x - w * _.y, I.y + m.y - Math.min(...T) - E * _.x - A * _.y]), U = t.getCTM().inverse().multiply(h.node.parentElement.getCTM()), x = new DOMMatrix([U.a, U.b, U.c, U.d, U.e, U.f]), y = x.inverse().multiply(k);
    h.node.setAttribute("transform", "matrix(" + [y.a, y.b, y.c, y.d, y.e, y.f].join(" ") + ")");
  }
  function b() {
    if (t?.querySelector("[data-label-hit-layer]")?.remove(), c.clear(), !l || !t) return;
    const h = f("g", { "data-label-hit-layer": "true", "data-editor-overlay": "true" });
    for (const _ of n) {
      const N = f("rect", { x: _.x - 2, y: _.y - 2, width: Math.max(8, _.width) + 4, height: Math.max(12, _.height) + 4, fill: s.has(_.id) ? "#507d9c" : "transparent", "fill-opacity": s.has(_.id) ? 0.12 : 0, stroke: "#507d9c", "stroke-opacity": s.has(_.id) ? 1 : 0.35, "stroke-width": s.has(_.id) ? 1.5 : 0.7, "stroke-dasharray": s.has(_.id) ? "none" : "3 3", "vector-effect": "non-scaling-stroke", "pointer-events": "all", "data-editor-label": _.id, ...s.has(_.id) ? { "data-selected-label": _.id } : {} });
      c.set(_.id, N), h.append(N);
    }
    const m = t.querySelector("[data-airwires]");
    m ? t.insertBefore(h, m) : t.append(h);
  }
  return {
    reset: d,
    layout(h, m, _, N, E) {
      t = h, o = new Map(m.map((w) => [w.id, w])), r = new Map((_ || []).map((w) => [w.id, w])), l = N, s = E, e.clear(), n = [];
      for (const w of qt(t)) {
        const A = p(w.node), I = o.get(w.owner) || { x: 0, y: 0 }, C = { ...w, attributes: [...w.node.attributes].map((k) => [k.name, k.value]), text: w.node.textContent, record: { id: w.id, owner: w.owner, index: w.index, text: w.node.textContent, x: A.x - I.x, y: A.y - I.y, orientation: [1, 0, 0, 1] } };
        e.set(w.id, C);
        const T = r.get(w.id);
        T && v(C, T), w.node.dataset.labelId = w.id, n.push({ id: w.id, ...p(w.node), ports: [] });
      }
      return b(), { x: Math.min(0, ...n.map((w) => w.x)), y: Math.min(0, ...n.map((w) => w.y)), right: Math.max(0, ...n.map((w) => w.x + w.width)), bottom: Math.max(0, ...n.map((w) => w.y + w.height)) };
    },
    nodes: () => n,
    record(h) {
      const m = e.get(h);
      if (!m) throw Error("Label no longer exists.");
      return structuredClone(r.get(h) || m.record);
    },
    preview(h) {
      const m = new Set(h.map((_) => _.id));
      for (const _ of h) {
        const N = e.get(_.id);
        if (N) {
          const E = this.record(_.id);
          v(N, { ...E, x: E.x + _.dx, y: E.y + _.dy });
        }
      }
      n = n.map((_) => {
        if (!m.has(_.id)) return _;
        const N = { ..._, ...p(e.get(_.id).node) }, E = c.get(_.id);
        if (E) for (const [w, A] of Object.entries({ x: N.x - 2, y: N.y - 2, width: Math.max(8, N.width) + 4, height: Math.max(12, N.height) + 4 })) E.setAttribute(w, A);
        return N;
      });
    }
  };
}
const ne = 1e-3, re = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ae = (t, e) => Math.abs(t - e) < ne, we = (t, e) => ae(e.a.x, e.b.x) ? ae(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - ne && t.y <= Math.max(e.a.y, e.b.y) + ne : ae(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - ne && t.x <= Math.max(e.a.x, e.b.x) + ne, fr = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), pr = (t, e) => Math.max(t.a.x, t.b.x) > e.x + ne && Math.min(t.a.x, t.b.x) < e.x + e.width - ne && Math.max(t.a.y, t.b.y) > e.y + ne && Math.min(t.a.y, t.b.y) < e.y + e.height - ne;
function nt(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && re(e.at(-1)) === re(n))) {
      for (; e.length > 1 && (ae(e.at(-2).x, e.at(-1).x) && ae(e.at(-1).x, n.x) || ae(e.at(-2).y, e.at(-1).y) && ae(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class Xt {
  constructor(e, { step: n = 8, segments: o = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(o), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
  }
  pins() {
    return this.pinCache || (this.pinCache = this.components.flatMap((e) => e.ports.map((n) => ({ ...n, owner: e.id, id: e.id + "." + n.pin }))));
  }
  snapshot() {
    return structuredClone({ components: this.components, segments: this.segments, ...this.labelOverrides?.length ? { labelOverrides: this.labelOverrides } : {}, ...this.manualGroups?.length ? { manualGroups: this.manualGroups } : {} });
  }
  restore(e) {
    this.components = structuredClone(e.components), this.segments = structuredClone(e.segments), this.labelOverrides = structuredClone(e.labelOverrides || []), this.manualGroups = structuredClone(e.manualGroups || []), this.cache = null, this.pinCache = null;
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
    return ae(e.x / this.step, Math.round(e.x / this.step)) && ae(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !ae(e.a.x, e.b.x) && !ae(e.a.y, e.b.y)) return !1;
    const o = this.pins();
    if (o.some((r) => r.bit !== n && we(r, e)) || this.segments.some((r) => r.bit !== n && (we(e.a, r) || we(e.b, r) || we(r.a, e) || we(r.b, e)))) return !1;
    for (const r of this.components) if (pr(e, r) && !o.filter((s) => s.owner === r.id && s.bit === n).some((s) => s.side === "NORTH" ? ae(e.a.x, s.x) && ae(e.b.x, s.x) && Math.max(e.a.y, e.b.y) <= s.y + ne : s.side === "SOUTH" ? ae(e.a.x, s.x) && ae(e.b.x, s.x) && Math.min(e.a.y, e.b.y) >= s.y - ne : s.side === "WEST" ? ae(e.a.y, s.y) && ae(e.b.y, s.y) && Math.max(e.a.x, e.b.x) <= s.x + ne : s.side === "EAST" ? ae(e.a.y, s.y) && ae(e.b.y, s.y) && Math.min(e.a.x, e.b.x) >= s.x - ne : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const o = nt(n), r = o.slice(1).map((l, s) => ({ bit: e, a: o[s], b: l })).filter((l) => fr(l) > ne);
    if (!r.length) return !1;
    if (r.some((l) => !this.validSegment(l, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, o) {
    if (this.manualGroups?.length) return this.moveMany([{ id: e, dx: n, dy: o }]);
    if (n = Math.round(n / this.step) * this.step, o = Math.round(o / this.step) * this.step, !n && !o) return;
    const r = this.snapshot(), l = this.components.find((f) => f.id === e);
    if (!l) return;
    const s = l.ports.map((f) => ({ ...f }));
    this.segments = this.segments.filter((f) => !s.some((d) => d.bit === f.bit && (re(d) === re(f.a) || re(d) === re(f.b)))), l.x += n, l.y += o;
    for (const f of l.ports)
      f.x += n, f.y += o;
    if (this.pinCache = null, this.components.some((f) => f !== l && l.x < f.x + f.width - ne && l.x + l.width > f.x + ne && l.y < f.y + f.height - ne && l.y + l.height > f.y + ne) || this.segments.some((f) => !this.validSegment(f, f.bit)) || l.ports.some((f) => this.pins().some((d) => d.owner !== e && d.bit !== f.bit && re(d) === re(f))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  moveMany(e) {
    const n = new Map(e.map((d) => [d.id, { ...d }]));
    for (const d of this.manualGroups || []) {
      const p = d.members.map((b) => n.get(b)).filter(Boolean);
      if (!p.length) continue;
      const v = p[0];
      if (p.some((b) => b.dx !== v.dx || b.dy !== v.dy)) throw Error("Grouped components must move together.");
      for (const b of d.members) n.set(b, { id: b, dx: v.dx, dy: v.dy });
    }
    e = [...n.values()];
    const o = new Map(e.map((d) => [d.id, { dx: Math.round(d.dx / this.step) * this.step, dy: Math.round(d.dy / this.step) * this.step }]).filter(([, d]) => d.dx || d.dy)), r = this.components.filter((d) => o.has(d.id));
    if (!r.length) return !1;
    const l = this.snapshot(), s = r.flatMap((d) => d.ports);
    this.segments = this.segments.filter((d) => !s.some((p) => p.bit === d.bit && we(p, d)));
    for (const d of r) {
      const p = o.get(d.id);
      d.x += p.dx, d.y += p.dy;
      for (const v of d.ports)
        v.x += p.dx, v.y += p.dy;
    }
    this.pinCache = null, this.cache = null;
    const c = this.pins();
    if (r.some((d) => this.components.some((p) => p !== d && d.x < p.x + p.width - ne && d.x + d.width > p.x + ne && d.y < p.y + p.height - ne && d.y + d.height > p.y + ne)) || Ue(this.components, this.manualGroups) || c.some((d) => !this.onGrid(d) || c.some((p) => p.owner !== d.owner && p.bit !== d.bit && re(p) === re(d))) || this.segments.some((d) => !this.validSegment(d, d.bit)))
      throw this.restore(l), Error("Arrangement blocked: a component, manual group or another node occupies the target position.");
    return this.remember(l), !0;
  }
  transform(e, n) {
    const o = this.manualGroups?.find((h) => h.members.includes(e));
    if (o) return this.transformGroup(o.id, n);
    const r = this.components.find((h) => h.id === e);
    if (!r) return;
    const l = this.snapshot(), s = r.width, c = r.height, f = n === "rotate" ? [0, 1, -1, 0, c, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, c] : n === "mirror-y" ? [-1, 0, 0, 1, s, 0] : null;
    if (!f) throw Error("Unknown transform.");
    const d = r.ports.map((h) => ({ ...h })), p = (h) => ({ x: f[0] * h.x + f[2] * h.y + f[4], y: f[1] * h.x + f[3] * h.y + f[5] });
    this.segments = this.segments.filter((h) => !d.some((m) => m.bit === h.bit && (re(m) === re(h.a) || re(m) === re(h.b))));
    const v = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const h of r.ports) {
      const m = p({ x: h.x - r.x, y: h.y - r.y });
      h.x = r.x + m.x, h.y = r.y + m.y, h.side = v[h.side] || h.side;
    }
    const b = r.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (r.editorMatrix = [f[0] * b[0] + f[2] * b[1], f[1] * b[0] + f[3] * b[1], f[0] * b[2] + f[2] * b[3], f[1] * b[2] + f[3] * b[3], f[0] * b[4] + f[2] * b[5] + f[4], f[1] * b[4] + f[3] * b[5] + f[5]], n === "rotate" && (r.width = c, r.height = s), this.pinCache = null, Ue(this.components, this.manualGroups) || r.ports.some((h) => !this.onGrid(h)) || this.components.some((h) => h !== r && r.x < h.x + h.width - ne && r.x + r.width > h.x + ne && r.y < h.y + h.height - ne && r.y + r.height > h.y + ne) || this.segments.some((h) => !this.validSegment(h, h.bit)) || r.ports.some((h) => this.pins().some((m) => m.owner !== e && m.bit !== h.bit && re(m) === re(h))))
      throw this.restore(l), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(l);
  }
  group(e) {
    const n = [...ft(e, this.manualGroups)], o = (this.manualGroups || []).filter((s) => !s.members.some((c) => n.includes(c)));
    if (n.length < 2) throw Error("Select at least two components to group.");
    let r = 1;
    for (; o.some((s) => s.id === "g" + r); ) r++;
    const l = { id: "g" + r, members: n };
    if (o.push(l), Ft(o, this.components), Ue(this.components, o)) throw Error("Group box overlaps an unselected component or another group. Include it in the selection or move it away.");
    return this.remember(), this.manualGroups = o, l;
  }
  ungroup(e) {
    const n = new Set(e), o = (this.manualGroups || []).filter((r) => !r.members.some((l) => n.has(l)));
    return o.length === (this.manualGroups || []).length ? !1 : (this.remember(), this.manualGroups = o, !0);
  }
  transformGroup(e, n) {
    const o = this.manualGroups?.find((h) => h.id === e);
    if (!o) return;
    const r = Ie(this.components, [o]).find((h) => h.groupId === e), l = n === "rotate" ? [0, 1, -1, 0, r.height, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, r.height] : n === "mirror-y" ? [-1, 0, 0, 1, r.width, 0] : null;
    if (!l) throw Error("Unknown group transform.");
    const s = this.snapshot(), c = this.components.filter((h) => o.members.includes(h.id)), f = c.flatMap((h) => h.ports);
    this.segments = this.segments.filter((h) => !f.some((m) => m.bit === h.bit && we(m, h)));
    const d = (h) => ({ x: r.x + l[0] * (h.x - r.x) + l[2] * (h.y - r.y) + l[4], y: r.y + l[1] * (h.x - r.x) + l[3] * (h.y - r.y) + l[5] }), p = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const h of c) {
      const m = h.width, _ = h.height, N = [d(h), d({ x: h.x + m, y: h.y + _ })], E = Math.min(...N.map((C) => C.x)), w = Math.min(...N.map((C) => C.y)), A = d(h), I = h.editorMatrix || [1, 0, 0, 1, 0, 0];
      h.editorMatrix = [l[0] * I[0] + l[2] * I[1], l[1] * I[0] + l[3] * I[1], l[0] * I[2] + l[2] * I[3], l[1] * I[2] + l[3] * I[3], l[0] * I[4] + l[2] * I[5] + A.x - E, l[1] * I[4] + l[3] * I[5] + A.y - w];
      for (const C of h.ports) {
        const T = d(C);
        C.x = T.x, C.y = T.y, C.side = p[C.side] || C.side;
      }
      h.x = E, h.y = w, n === "rotate" && (h.width = _, h.height = m);
    }
    this.pinCache = null, this.cache = null;
    const v = this.pins();
    if (c.some((h) => this.components.some((m) => m !== h && h.x < m.x + m.width - ne && h.x + h.width > m.x + ne && h.y < m.y + m.height - ne && h.y + h.height > m.y + ne)) || Ue(this.components, this.manualGroups) || v.some((h) => !this.onGrid(h) || v.some((m) => m.bit !== h.bit && re(m) === re(h))) || this.segments.some((h) => !this.validSegment(h, h.bit)))
      throw this.restore(s), Error("Group transform blocked by a component, wire or another node.");
    this.remember(s);
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
      const l = /* @__PURE__ */ new Map(), s = (p) => {
        l.has(re(p)) || l.set(re(p), p);
      };
      r.pins.forEach(s);
      for (const p of r.segments)
        s(p.a), s(p.b);
      for (let p = 0; p < r.segments.length; p++) for (let v = p + 1; v < r.segments.length; v++) {
        const b = r.segments[p], h = r.segments[v];
        if (ae(b.a.x, b.b.x) === ae(h.a.x, h.b.x)) continue;
        const m = ae(b.a.x, b.b.x) ? b : h, _ = m === b ? h : b, N = { x: m.a.x, y: _.a.y };
        we(N, m) && we(N, _) && s(N);
      }
      const c = new Map([...l.keys()].map((p) => [p, p])), f = (p) => {
        let v = p;
        for (; c.get(v) !== v; ) v = c.get(v);
        for (; p !== v; ) {
          const b = c.get(p);
          c.set(p, v), p = b;
        }
        return v;
      };
      for (const p of r.segments) {
        const v = [...l.values()].filter((b) => we(b, p));
        for (const b of v.slice(1)) c.set(f(re(b)), f(re(v[0])));
      }
      const d = /* @__PURE__ */ new Map();
      for (const p of r.pins) {
        const v = f(re(p));
        d.has(v) || d.set(v, { pins: [], points: [] }), d.get(v).pins.push(p);
      }
      for (const p of l.values()) {
        const v = f(re(p));
        d.has(v) && d.get(v).points.push(p);
      }
      n.push({ bit: o, islands: [...d.values()], points: [...l.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: o } of this.connectivity()) {
      if (o.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < o.length; ) {
        let l;
        for (const s of r) for (let c = 0; c < o.length; c++) if (!r.has(c)) for (const f of o[s].points) for (const d of o[c].points) {
          const p = (f.x - d.x) ** 2 + (f.y - d.y) ** 2;
          (!l || p < l.d) && (l = { bit: n, a: f, b: d, d: p, j: c });
        }
        e.push(l), r.add(l.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const l of this.components)
      e.push(l.x - 20, l.x + l.width + 20), n.push(l.y - 20, l.y + l.height + 20);
    for (const l of this.segments)
      e.push(l.a.x - 20, l.b.x + 20), n.push(l.a.y - 20, l.b.y + 20);
    const o = Math.min(...e), r = Math.min(...n);
    return { x: o, y: r, w: Math.max(...e) - o, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments), ...this.labelOverrides?.length ? { labelOverrides: structuredClone(this.labelOverrides) } : {}, ...this.manualGroups?.length ? { manualGroups: structuredClone(this.manualGroups) } : {} };
  }
  findPath(e, n, o) {
    if (!this.onGrid(n) || !this.onGrid(o)) return null;
    const r = (C) => C.slice(1).every((T, k) => this.validSegment({ a: C[k], b: T }, e));
    for (const C of [[n, o], [n, { x: o.x, y: n.y }, o], [n, { x: n.x, y: o.y }, o]]) {
      const T = nt(C);
      if (r(T)) return T;
    }
    const l = this.step, s = this.bounds(), c = Math.floor(Math.min(s.x, n.x, o.x) / l) - 5, f = Math.ceil(Math.max(s.x + s.w, n.x, o.x) / l) + 5, d = Math.floor(Math.min(s.y, n.y, o.y) / l) - 5, p = Math.ceil(Math.max(s.y + s.h, n.y, o.y) / l) + 5, v = { x: n.x / l, y: n.y / l, dir: -1, cost: 0, key: n.x / l + "," + n.y / l + ",-1" }, b = [v], h = /* @__PURE__ */ new Map([[v.key, 0]]), m = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map([[v.key, v]]), N = [[1, 0], [-1, 0], [0, 1], [0, -1]], E = (C) => Math.abs(C.x - o.x / l) + Math.abs(C.y - o.y / l);
    let w = null, A = 0;
    for (; b.length && A++ < 3e4; ) {
      let C = 0;
      for (let k = 1; k < b.length; k++) b[k].cost + E(b[k]) < b[C].cost + E(b[C]) && (C = k);
      const T = b.splice(C, 1)[0];
      if (T.cost === h.get(T.key)) {
        if (T.x === o.x / l && T.y === o.y / l) {
          w = T;
          break;
        }
        for (let k = 0; k < 4; k++) {
          const U = T.x + N[k][0], x = T.y + N[k][1];
          if (U < c || U > f || x < d || x > p) continue;
          const y = { x: U, y: x, dir: k, key: U + "," + x + "," + k, cost: T.cost + 1 + (T.dir !== -1 && T.dir !== k ? 3 : 0) };
          y.cost >= (h.get(y.key) ?? 1 / 0) || !this.validSegment({ a: { x: T.x * l, y: T.y * l }, b: { x: U * l, y: x * l } }, e) || (h.set(y.key, y.cost), m.set(y.key, T.key), _.set(y.key, y), b.push(y));
        }
      }
    }
    if (!w) return null;
    const I = [];
    for (let C = w; C; C = _.get(m.get(C.key))) I.push({ x: C.x * l, y: C.y * l });
    return nt(I.reverse());
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
      const l = this.airwires().find((c) => !o.has(c.bit + ":" + re(c.a) + ":" + re(c.b)));
      if (!l) break;
      const s = this.findPath(l.bit, l.a, l.b);
      s ? (this.segments.push(...s.slice(1).map((c, f) => ({ bit: l.bit, a: s[f], b: c }))), this.cache = null) : o.add(l.bit + ":" + re(l.a) + ":" + re(l.b)), r % 3 === 0 && await new Promise((c) => setTimeout(c, 0));
    }
    this.redoStack = [];
  }
}
const $t = "spice-viewer-project", Yt = 3, Kt = 32 * 1024 * 1024, te = (t) => {
  throw Error("Invalid project: " + t);
}, ve = (t) => t && typeof t == "object" && !Array.isArray(t), Ae = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, Be = (t) => ve(t) && Ae(t.x) && Ae(t.y), Ne = (t, e) => Math.abs(t - e) < 1e-3, pt = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function Mt(t) {
  return ve(t) && Be(t) && Ae(t.w) && Ae(t.h) && t.w > 0 && t.h > 0;
}
function Rt(t) {
  (!ve(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && te("unsupported drawing settings.");
}
function Zt(t) {
  new TextEncoder().encode(t).length > Kt && te("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    te("expected a JSON project file.");
  }
  (!ve(e) || e.format !== $t) && te("unrecognized file format."), [1, 2, Yt].includes(e.version) || te("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Ve && te("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && te("missing netlist or sheet."), (!ve(e.libraries) || Object.entries(e.libraries).some(([o, r]) => !o || ["__proto__", "constructor", "prototype"].includes(o) || typeof r != "string")) && te("invalid libraries."), Rt(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((o) => typeof e[o] != "boolean") || !Mt(e.view)) && te("invalid display settings."), e.labelEditing !== void 0 && typeof e.labelEditing != "boolean" && te("invalid label editing mode."), (!ve(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((o) => !Array.isArray(e.colors[o]) || e.colors[o].some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || !/^#[\da-f]{6}$/i.test(r[1])))) && te("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && te("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const o of e.sheets) {
    (!ve(o) || typeof o.scope != "string" || typeof o.topology != "string") && te("invalid sheet identity."), Rt(o.settings);
    const r = pt(o.scope, o.topology, o.settings);
    n.has(r) && te("duplicate sheet."), n.add(r), (o.settings.gridSize !== 4 || !o.settings.conventional) && te("saved manual scenes require the fixed 4-unit grid."), o.view !== void 0 && !Mt(o.view) && te("invalid sheet viewport."), Jt(o.snapshot);
  }
  return e;
}
function hr(t) {
  const e = { ...t, format: $t, version: Yt, layoutRulesVersion: Ve, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return Zt(n), n;
}
function Jt(t) {
  (!ve(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && te("invalid scene size."), Wt(t.labelOverrides), Ft(t.manualGroups, t.components);
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!ve(n) || typeof n.id != "string" || e.has(n.id) || !Be(n) || !Ae(n.width) || !Ae(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && te("invalid component geometry."), e.add(n.id);
    const o = /* @__PURE__ */ new Set();
    for (const r of n.ports)
      (!Be(r) || typeof r.pin != "string" || o.has(r.pin) || !Number.isInteger(r.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(r.side)) && te("invalid pin."), o.add(r.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(Ae)) && te("invalid symbol transform.");
  }
  for (const n of t.segments) (!ve(n) || !Number.isInteger(n.bit) || !Be(n.a) || !Be(n.b) || !Ne(n.a.x, n.b.x) && !Ne(n.a.y, n.b.y)) && te("wire must be orthogonal.");
}
function en(t, e, n) {
  Jt(e);
  const o = new Map(t.components.map((f) => [f.id, f]));
  o.size !== e.components.length && te("component count changed.");
  const r = e.components.map((f) => {
    const d = o.get(f.id);
    (!d || !!d.decoration != !!f.decoration || d.ports.length !== f.ports.length) && te("component identity changed: " + f.id);
    const p = f.editorMatrix || [1, 0, 0, 1, 0, 0], [v, b, h, m] = p;
    (![v, b, h, m].every((E) => [-1, 0, 1].includes(E)) || v * v + b * b !== 1 || h * h + m * m !== 1 || v * h + b * m !== 0) && te("symbol transform must be a rotation or mirror.");
    const _ = [[0, 0], [d.width, 0], [0, d.height], [d.width, d.height]].map(([E, w]) => ({ x: v * E + h * w + p[4], y: b * E + m * w + p[5] }));
    (!Ne(Math.min(..._.map((E) => E.x)), 0) || !Ne(Math.min(..._.map((E) => E.y)), 0) || !Ne(Math.max(..._.map((E) => E.x)), f.width) || !Ne(Math.max(..._.map((E) => E.y)), f.height)) && te("symbol dimensions changed: " + f.id);
    const N = f.ports.map((E) => {
      const w = d.ports.find((C) => C.pin === E.pin);
      (!w || w.bit !== E.bit || !Ne(E.x, f.x + v * (w.x - d.x) + h * (w.y - d.y) + p[4]) || !Ne(E.y, f.y + b * (w.x - d.x) + m * (w.y - d.y) + p[5])) && te("pin connectivity or position changed: " + f.id + "." + E.pin);
      const A = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[w.side], I = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, C]) => C[0] === v * A[0] + h * A[1] && C[1] === b * A[0] + m * A[1])?.[0];
      return E.side !== I && te("pin direction changed."), { ...w, x: E.x, y: E.y, side: I };
    });
    return { ...d, x: f.x, y: f.y, width: f.width, height: f.height, ports: N, ...f.editorMatrix ? { editorMatrix: [...p] } : {} };
  }), l = new Xt({ ...t, components: r, segments: e.segments }, { step: n });
  Ue(r, e.manualGroups) && te("manual group boxes overlap other components or groups.");
  for (let f = 0; f < r.length; f++) for (let d = f + 1; d < r.length; d++) {
    const p = r[f], v = r[d];
    p.x < v.x + v.width - 1e-3 && p.x + p.width > v.x + 1e-3 && p.y < v.y + v.height - 1e-3 && p.y + p.height > v.y + 1e-3 && te("component symbols overlap.");
  }
  const s = new Set(l.pins().map((f) => f.bit));
  (l.pins().some((f) => !l.onGrid(f)) || l.segments.some((f) => !s.has(f.bit) || !l.validSegment(f, f.bit))) && te("off-grid wire, symbol collision or short circuit.");
  const c = /* @__PURE__ */ new Map();
  for (const f of l.pins()) {
    const d = f.x + "," + f.y;
    c.has(d) && c.get(d) !== f.bit && te("different nodes share a pin position."), c.set(d, f.bit);
  }
  return { ...l.snapshot(), ...e.labelOverrides?.length ? { labelOverrides: structuredClone(e.labelOverrides) } : {}, ...e.manualGroups?.length ? { manualGroups: structuredClone(e.manualGroups) } : {} };
}
const mr = "http://www.w3.org/2000/svg", se = (t, e = {}) => {
  const n = document.createElementNS(mr, t);
  for (const [o, r] of Object.entries(e)) n.setAttribute(o, r);
  return n;
}, gr = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function tn(t, e, n, o) {
  const r = structuredClone(e);
  for (const c of r.components) {
    const f = t.getElementById("cell_" + c.id);
    for (const d of c.ports) {
      const p = [...f.children].find((v) => v.getAttribute("s:pid") === d.pin);
      d.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[p?.getAttribute("s:position")] || d.side;
    }
  }
  for (const [c, f] of Object.entries(o.modules.circuit.cells)) if (f.attributes.name === "0") {
    const d = t.getElementById("cell_" + c), p = d?.transform.baseVal.consolidate().matrix;
    d && p && r.components.push({ id: c, decoration: !0, selectable: !0, x: p.e, y: p.f, width: +d.getAttribute("s:width"), height: +d.getAttribute("s:height"), ports: [...d.children].filter((v) => v.hasAttribute("s:pid")).map((v) => ({ pin: v.getAttribute("s:pid"), x: p.e + Number(v.getAttribute("s:x")), y: p.f + Number(v.getAttribute("s:y")), bit: f.connections[v.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const l = new Map(Object.values(n.nodes).map((c) => [c.name, c.bit])), s = [...t.children].filter((c) => c.localName === "line" && c.hasAttribute("data-net")).map((c) => ({ bit: l.get(c.dataset.net), a: { x: +c.getAttribute("x1"), y: +c.getAttribute("y1") }, b: { x: +c.getAttribute("x2"), y: +c.getAttribute("y2") } }));
  return { ...r, segments: s };
}
function br(t, e, { changed: n, inspect: o, getNetColor: r, report: l }) {
  let s = null, c = null, f = !1, d = !1, p = null, v = null, b = null, h = null, m = /* @__PURE__ */ new Set(), _ = 0, N = "", E = 8, w = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map(), C = !1, T = null, k = null, U = null, x = null, y = "";
  const D = ur(), F = (u) => new DOMPoint(u.clientX, u.clientY).matrixTransform(c.getScreenCTM().inverse()), z = (u) => s.snap(F(u)), $ = (u) => r?.(u) || Ye[Number(u) % Ye.length], H = (u, { severity: g = "info", log: S = !0 } = {}) => {
    e("editor-status").textContent = u, S && l?.({ message: u, severity: g, category: "Tools" });
  };
  function L() {
    return { unrouted: s?.airwires().length || 0, wires: s?.segments.length || 0, editing: f, routing: d, selectedComponents: C ? [] : [...m], selectedLabels: C ? [...m] : [], labelEditing: C };
  }
  function B(u) {
    if (!u.length) return !1;
    if (!C) return !0;
    const g = u.at(-1);
    return JSON.stringify(g.components) === JSON.stringify(s.components) && JSON.stringify(g.segments) === JSON.stringify(s.segments) && JSON.stringify(g.manualGroups || []) === JSON.stringify(s.manualGroups || []);
  }
  function q() {
    const u = !!s, g = s && !C && He(m, s.manualGroups);
    e("group").disabled = !f || !u || d || C || m.size < 2, e("group").setAttribute("aria-pressed", String(!!g)), e("group").title = g ? "Ungroup selected components (Ctrl+G or Ctrl+Shift+G)" : "Group selected components (Ctrl+G)", e("group").setAttribute("aria-label", e("group").title);
    for (const O of ["interactive", "flywire", "auto-route"]) e(O).disabled = !c || d || C && O !== "interactive";
    e("label-edit").disabled = !c || d, e("label-edit").setAttribute("aria-pressed", String(f && C)), e("edit-tool").disabled = !u || d;
    for (const O of document.querySelectorAll("[data-editor-mode]"))
      O.disabled = !c || d || C && ["route", "erase"].includes(O.dataset.editorMode), O.setAttribute("aria-pressed", String(f && O.dataset.editorMode === e("edit-tool").value));
    const S = C ? m.size : s ? Ie(s.components, s.manualGroups).filter((O) => O.members.some((G) => m.has(G))).length : 0;
    for (const O of document.querySelectorAll("[data-editor-arrange]")) O.disabled = !f || !u || d || S < (O.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !u || d || !B(s.undoStack), e("wire-redo").disabled = !u || d || !B(s.redoStack), t.classList.toggle("spice-editing", f), t.dataset.toolMode = f ? e("edit-tool").value : "none", t.dataset.labelEditing = String(f && C);
  }
  function X(u, g) {
    const S = I.get(u.id);
    if (S && (g.replaceChildren(...S.children.map((O) => O.cloneNode(!0))), u.editorMatrix)) {
      const O = u.editorMatrix, G = se("g", { transform: "matrix(" + O.join(" ") + ")", "data-editor-glyph": "true" });
      G.append(...g.childNodes);
      for (const j of G.querySelectorAll("text")) j.remove();
      g.append(G);
      for (const [j, Q] of S.labels.entries()) {
        const Y = Q.node.cloneNode(!0);
        Y.removeAttribute("transform");
        let W = O[0] * Q.x + O[2] * Q.y + O[4], R = O[1] * Q.x + O[3] * Q.y + O[5];
        if (u.ports.length === 2 && S.labels.length === 2) {
          const K = Math.abs(u.ports[0].y - u.ports[1].y) < 1e-3;
          W = K ? u.width / 2 : u.ports[0].x - u.x + 20, R = K ? u.ports[0].y - u.y - 26 + j * 16 : u.height / 2 - 8 + j * 16, Y.setAttribute("text-anchor", K ? "middle" : "start");
        }
        Y.setAttribute("x", W), Y.setAttribute("y", R), g.append(Y);
      }
    }
  }
  function J(u) {
    if (U = null, p = null, b = null, v = null, T = null, k = null, C && ["route", "erase"].includes(u)) {
      H("Components and wires are locked in label mode.", { severity: "warning" });
      return;
    }
    if (C && ["rotate", "mirror-x", "mirror-y"].includes(u) && m.size) {
      ue([...m].map((g) => cr(D.record(g), u))), H(u + " applied to " + m.size + " label(s).");
      return;
    }
    if (!C && ["rotate", "mirror-x", "mirror-y"].includes(u) && He(m, s.manualGroups)) {
      try {
        s.transformGroup(He(m, s.manualGroups).id, u), ee(), H("Manual group " + u + " applied.");
      } catch (g) {
        H(g.message, { severity: "error" });
      }
      return;
    }
    if (["rotate", "mirror-x", "mirror-y"].includes(u) && m.size === 1) {
      try {
        s.transform([...m][0], u), ee(), H(u + " applied to " + [...m][0] + ".");
      } catch (g) {
        H(g.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = u, s ? (ee(), H("Tool: " + u + ".")) : q();
  }
  function ie() {
    if (!s) return;
    const u = L();
    H(`${m.size ? m.size + " selected · " : ""}${u.unrouted} connection${u.unrouted === 1 ? "" : "s"} unrouted · ${u.wires} wire segments${d ? " · Auto-routing…" : ""}`, { log: !1 }), q(), n(s.drawing(), u, s.bounds()), A.set(N, s.snapshot());
  }
  function Z(u) {
    const g = c.querySelector("[data-airwires]");
    g ? c.insertBefore(u, g) : c.append(u);
  }
  function fe() {
    if (c?.querySelector("[data-route-preview]")?.remove(), c?.querySelector("[data-route-guides]")?.remove(), !c) return;
    if (f && e("edit-tool").value === "route" && h) {
      const S = t.getBoundingClientRect(), O = c.getScreenCTM().inverse(), G = new DOMPoint(S.left, S.top).matrixTransform(O), j = new DOMPoint(S.right, S.bottom).matrixTransform(O), Q = se("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      Q.append(se("line", { x1: G.x, y1: h.y, x2: j.x, y2: h.y, "vector-effect": "non-scaling-stroke" }), se("line", { x1: h.x, y1: G.y, x2: h.x, y2: j.y, "vector-effect": "non-scaling-stroke" })), Z(Q);
    }
    if (!p) return;
    const u = [...p.points];
    if (h) {
      const S = u.at(-1);
      u.push({ x: h.x, y: S.y }, h);
    }
    const g = se("g", { "data-route-preview": "true", "data-waypoints": p.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    g.append(se("polyline", { points: u.map((S) => S.x + "," + S.y).join(" "), fill: "none", stroke: $(p.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Z(g);
  }
  function pe() {
    if (c?.querySelector("[data-selection-box]")?.remove(), !b || !c) return;
    const u = b.start, g = b.end, S = g.x < u.x;
    Z(se("rect", { x: Math.min(u.x, g.x), y: Math.min(u.y, g.y), width: Math.abs(u.x - g.x), height: Math.abs(u.y - g.y), fill: S ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: S ? "#4c9675" : "#507d9c", "stroke-dasharray": S ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": S ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function ee() {
    if (!c || !s) return;
    for (const j of c.querySelectorAll("[data-editor-body-hit]")) j.remove();
    for (const j of [...c.children]) (j.hasAttribute("data-editor-overlay") || j.hasAttribute("data-airwires") || j.hasAttribute("data-manual-state") || j.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(j.localName)) && j.remove();
    for (const j of s.components) {
      const Q = c.getElementById("cell_" + j.id);
      Q && (Q.style.removeProperty("opacity"), X(j, Q), Q.setAttribute("s:width", j.width), Q.setAttribute("s:height", j.height), Q.setAttribute("transform", `translate(${j.x},${j.y})`), Q.dataset.editorComponent = j.id, f && !C && Q.prepend(se("rect", { x: 0, y: 0, width: j.width, height: j.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    if (f && !d && !C) {
      const j = se("g", { "data-editor-overlay": "true", "data-manual-group-layer": "true" });
      for (const Q of Ie(s.components, s.manualGroups).filter((Y) => Y.groupId)) {
        const Y = Q.members.every((W) => m.has(W));
        j.append(se("rect", { x: Q.x, y: Q.y, width: Q.width, height: Q.height, fill: "transparent", stroke: Y ? "#507d9c" : "#89958c", "stroke-width": Y ? 1.5 : 0.8, "stroke-dasharray": "5 3", "vector-effect": "non-scaling-stroke", "pointer-events": ["route", "erase"].includes(e("edit-tool").value) ? "none" : "all", "data-editor-group": Q.groupId }));
      }
      c.insertBefore(j, c.querySelector('g[id^="cell_"]'));
    }
    const u = c.querySelector('g[id^="cell_"]'), g = se("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), S = se("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [j, Q] of s.segments.entries()) {
      const Y = se("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, class: "net_" + Q.bit, "data-net": w.get(Q.bit) || String(Q.bit), "stroke-width": 1.4 });
      Y.append(se("title")), Y.firstChild.textContent = "Node " + (w.get(Q.bit) || Q.bit), c.insertBefore(Y, u), f && !C && ["route", "erase"].includes(e("edit-tool").value) && g.append(se("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, "data-editor-wire": j, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const j of s.connectivity()) for (const Q of j.points) {
      const Y = /* @__PURE__ */ new Set();
      for (const W of j.segments) we(Q, W) && (Math.min(W.a.x, W.b.x) < Q.x - 1e-3 && Y.add("w"), Math.max(W.a.x, W.b.x) > Q.x + 1e-3 && Y.add("e"), Math.min(W.a.y, W.b.y) < Q.y - 1e-3 && Y.add("n"), Math.max(W.a.y, W.b.y) > Q.y + 1e-3 && Y.add("s"));
      (Y.size >= 3 || Y.size >= 2 && j.islands.some((W) => W.pins.some((R) => gr(Q, R)))) && c.insertBefore(se("circle", { cx: Q.x, cy: Q.y, r: 2, class: "net_" + j.bit, "data-net": w.get(j.bit) || String(j.bit), fill: $(j.bit) }), u);
    }
    if (f && !C) {
      for (const j of s.components.filter((Q) => m.has(Q.id))) g.append(se("rect", { x: j.x - 3, y: j.y - 3, width: j.width + 6, height: j.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": j.id }));
      for (const j of s.pins()) {
        const Q = se("circle", { cx: j.x, cy: j.y, r: 3, "data-editor-pin": j.id, "data-editor-bit": j.bit, fill: "#fff", stroke: $(j.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": j.owner + " " + j.pin }), Y = se("title");
        Y.textContent = j.id + " · " + (w.get(j.bit) || j.bit), Q.append(Y), S.append(Q);
      }
      c.append(g, S);
    }
    fe();
    const O = se("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const j of s.airwires()) O.append(se("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, stroke: $(j.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": j.bit, "data-from-owner": j.a.owner || "", "data-to-owner": j.b.owner || "" }));
    c.append(O);
    const G = se("metadata", { "data-manual-state": "true" });
    G.textContent = JSON.stringify({ version: 1, grid: E, unrouted: s.airwires().length, manual: !0 }), c.insertBefore(G, O), ie();
  }
  function de(u, g) {
    if (!p) {
      p = { bit: g, points: [u], checkpoints: [] }, fe(), H("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (g !== void 0 && p.bit !== g) {
      H("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const S = p.points.at(-1), O = s.findPath(p.bit, S, u);
    if (!O) {
      H("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (g === void 0) {
      O.length > 1 && (p.checkpoints.push(p.points.length), p.points.push(...O.slice(1))), fe(), H("Waypoint " + p.checkpoints.length + " confirmed.");
      return;
    }
    try {
      s.addPath(g, [...p.points, ...O.slice(1)]), p = null, ee(), H("Connection added.");
    } catch (G) {
      H(G.message, { severity: "error" });
    }
  }
  function Ee(u = !1) {
    if (!(!s || d || C))
      try {
        if (u || He(m, s.manualGroups))
          s.ungroup(m) && H("Manual group removed.");
        else {
          const g = s.group(m);
          m = new Set(g.members), H("Grouped " + g.members.length + " components for manual editing.");
        }
        ee();
      } catch (g) {
        H(g.message, { severity: "error" });
      }
  }
  function ue(u, g = []) {
    const S = new Map((s.labelOverrides || []).map((O) => [O.id, O]));
    for (const O of g) S.delete(O);
    for (const O of u) S.set(O.id, O);
    if (JSON.stringify([...S.values()]) === JSON.stringify(s.labelOverrides || [])) {
      ee();
      return;
    }
    s.remember(), s.labelOverrides = structuredClone([...S.values()]), ee();
  }
  function Te(u) {
    ue(u.map((g) => {
      const S = D.record(g.id);
      return { ...S, x: S.x + g.dx, y: S.y + g.dy };
    }));
  }
  function le(u) {
    s && (U = null, C = u, m.clear(), p = null, v = null, b = null, T = null, k = null, e("edit-tool").value = "select", ee(), H(u ? "Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text." : "Label editing disabled."));
  }
  function xe(u) {
    if (!s) return;
    const g = u ? s.redoStack : s.undoStack;
    if (!B(g)) {
      H(C ? "No label edit to " + (u ? "redo." : "undo.") : "No edit to " + (u ? "redo." : "undo."));
      return;
    }
    p = null, v = null, b = null, T = null, k = null, u ? s.redo() : s.undo(), ee(), H(u ? "Redo." : "Undo.");
  }
  function M(u) {
    x = null, y = u, e("label-text").value = D.record(u).text, e("label-dialog").showModal(), e("label-text").focus(), e("label-text").select();
  }
  e("close-label").onclick = () => e("label-dialog").close(), e("label-dialog").addEventListener("close", () => t.focus({ preventScroll: !0 })), e("app").addEventListener("spice:workspacechange", () => {
    e("label-dialog").open && e("label-dialog").close();
  }), e("label-form").onsubmit = (u) => {
    u.preventDefault();
    const g = D.record(y), S = e("label-text").value;
    e("label-dialog").close(), ue([{ ...g, text: S }]), H("Display text updated. SPICE source unchanged.");
  }, e("label-reset").onclick = () => {
    const u = y;
    e("label-dialog").close(), ue([], [u]), H("Label reset to automatic placement and original text.");
  }, t.addEventListener("pointerdown", (u) => {
    if (!C || !f || d || !s || u.button !== 0) return;
    if (u.shiftKey) {
      x = null;
      return;
    }
    x = u.pointerId, u.preventDefault(), u.stopImmediatePropagation(), t.focus({ preventScroll: !0 });
    const g = u.target.closest("[data-editor-label]"), S = g?.getAttribute("data-editor-label"), O = e("edit-tool").value, G = S && U?.id === S && u.timeStamp - U.time < 450 && Math.hypot(u.clientX - U.x, u.clientY - U.y) < 5;
    if (U = S ? { id: S, time: u.timeStamp, x: u.clientX, y: u.clientY } : null, G) {
      U = null, T = null, m = /* @__PURE__ */ new Set([S]), ee(), M(S);
      return;
    }
    if (O === "box") {
      k = { start: F(u), end: F(u), additive: u.ctrlKey || u.metaKey }, t.setPointerCapture(u.pointerId), b = k, pe(), b = null;
      return;
    }
    if (!S) {
      m.clear(), ee();
      return;
    }
    if (u.ctrlKey || u.metaKey) {
      m.has(S) ? m.delete(S) : m.add(S), ee();
      return;
    }
    if ((O !== "move" || !m.has(S)) && (m = /* @__PURE__ */ new Set([S])), ["rotate", "mirror-x", "mirror-y"].includes(O)) {
      J(O);
      return;
    }
    ee(), O === "move" && (T = { start: F(u), dx: 0, dy: 0 }, t.setPointerCapture(u.pointerId));
  }, { capture: !0 }), t.addEventListener("pointermove", (u) => {
    if (!(!C || !f || !s) && (k && (u.stopImmediatePropagation(), k.end = F(u), b = k, pe(), b = null), T)) {
      u.stopImmediatePropagation();
      const g = F(u), S = s.snap({ x: g.x - T.start.x, y: g.y - T.start.y });
      T.dx = S.x, T.dy = S.y, (S.x || S.y) && (U = null), D.preview([...m].map((O) => ({ id: O, dx: S.x, dy: S.y })));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (u) => {
    if (!(!C || x !== u.pointerId)) {
      if (x = null, u.stopImmediatePropagation(), t.hasPointerCapture(u.pointerId) && t.releasePointerCapture(u.pointerId), k) {
        const g = k;
        k = null;
        const S = kt(D.nodes(), g.start, F(u));
        m = g.additive ? /* @__PURE__ */ new Set([...m, ...S]) : new Set(S), ee(), H(m.size + " label(s) selected.");
      }
      if (T) {
        const g = T;
        T = null, g.dx || g.dy ? (Te([...m].map((S) => ({ id: S, dx: g.dx, dy: g.dy }))), H("Moved " + m.size + " label(s).")) : ee();
      }
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    C && (T = null, k = null, ee());
  }), t.addEventListener("dblclick", (u) => {
    if (!C) return;
    u.preventDefault(), u.stopImmediatePropagation();
    const g = F(u), S = u.target.closest("[data-editor-label]")?.getAttribute("data-editor-label") || D.nodes().findLast((O) => g.x >= O.x - 2 && g.x <= O.x + Math.max(8, O.width) + 2 && g.y >= O.y - 2 && g.y <= O.y + Math.max(12, O.height) + 2)?.id;
    S && M(S);
  }, { capture: !0 }), t.addEventListener("pointerdown", (u) => {
    if (C || !f || d || !s || !c || u.button !== 0 || u.shiftKey) return;
    const g = e("edit-tool").value, S = u.target.closest("[data-editor-pin]"), O = u.target.closest("[data-editor-wire]"), G = S && s.pins().find((R) => R.id === S.dataset.editorPin), j = u.target.closest("[data-editor-group]"), Q = j ? s.manualGroups?.find((R) => R.id === j.getAttribute("data-editor-group")) : s.manualGroups?.length ? Ie(s.components, s.manualGroups).find((R) => {
      if (!R.groupId) return !1;
      const K = F(u);
      return K.x >= R.x && K.x <= R.x + R.width && K.y >= R.y && K.y <= R.y + R.height;
    }) : null, Y = u.target.closest("[data-editor-component]") || G && c.getElementById("cell_" + G.owner) || Q && c.getElementById("cell_" + Q.members[0]), W = Y && s.components.find((R) => R.id === Y.dataset.editorComponent && Ke(R));
    if (g === "box") {
      u.preventDefault(), u.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), b = { start: F(u), end: F(u), additive: u.ctrlKey || u.metaKey }, t.setPointerCapture(u.pointerId), pe();
      return;
    }
    if (g === "route" || g === "erase") {
      if (u.preventDefault(), u.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), h = z(u), g === "erase") {
        O && (s.remove(+O.dataset.editorWire), ee(), H("Wire segment erased."));
        return;
      }
      if (G) {
        de({ x: G.x, y: G.y }, G.bit);
        return;
      }
      if (O) {
        const R = s.segments[+O.dataset.editorWire], K = z(u);
        de(R.a.x === R.b.x ? { x: R.a.x, y: K.y } : { x: K.x, y: R.a.y }, R.bit);
        return;
      }
      p ? de(z(u)) : fe();
      return;
    }
    if (!W) {
      m.size && (m.clear(), ee());
      return;
    }
    if (u.preventDefault(), u.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), o?.(W.id, W), u.ctrlKey || u.metaKey) {
      const R = ft([W.id], s.manualGroups), K = [...R].every((oe) => m.has(oe));
      for (const oe of R) K ? m.delete(oe) : m.add(oe);
      ee();
      return;
    }
    if ((g !== "move" || !m.has(W.id)) && (m = ft([W.id], s.manualGroups)), ["rotate", "mirror-x", "mirror-y"].includes(g)) {
      J(g);
      return;
    }
    if (ee(), g === "move") {
      v = { entries: s.components.filter((R) => m.has(R.id)).map((R) => ({ n: R, element: c.getElementById("cell_" + R.id) })), start: F(u), dx: 0, dy: 0 };
      for (const R of v.entries) R.element.style.opacity = ".6";
      t.setPointerCapture(u.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (u) => {
    if (!(C || !f || !s || !c)) {
      if (h = z(u), b) {
        u.stopImmediatePropagation(), b.end = F(u), pe();
        return;
      }
      if (v) {
        u.stopImmediatePropagation();
        const g = F(u), S = s.snap({ x: g.x - v.start.x, y: g.y - v.start.y });
        v.dx = S.x, v.dy = S.y;
        for (const { n: O, element: G } of v.entries) {
          G.setAttribute("transform", `translate(${O.x + S.x},${O.y + S.y})`);
          const j = c.querySelector('[data-selected-component="' + CSS.escape(O.id) + '"]');
          j && (j.setAttribute("x", O.x + S.x - 3), j.setAttribute("y", O.y + S.y - 3));
        }
        for (const O of s.manualGroups || []) O.members.every((G) => m.has(G)) && c.querySelector("[data-editor-group=" + JSON.stringify(O.id) + "]")?.setAttribute("transform", `translate(${S.x},${S.y})`);
        for (const O of c.querySelectorAll("[data-airwires] line"))
          m.has(O.dataset.fromOwner) && (O.setAttribute("x1", +O.getAttribute("x1") - Number(O.dataset.dx || 0) + S.x), O.setAttribute("y1", +O.getAttribute("y1") - Number(O.dataset.dy || 0) + S.y)), m.has(O.dataset.toOwner) && (O.setAttribute("x2", +O.getAttribute("x2") - Number(O.dataset.dx || 0) + S.x), O.setAttribute("y2", +O.getAttribute("y2") - Number(O.dataset.dy || 0) + S.y)), O.dataset.dx = S.x, O.dataset.dy = S.y;
        return;
      }
      e("edit-tool").value === "route" && fe();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (u) => {
    if (!b && !v) return;
    if (u.preventDefault(), u.stopImmediatePropagation(), t.hasPointerCapture(u.pointerId) && t.releasePointerCapture(u.pointerId), b) {
      const S = b;
      b = null;
      const O = Ie(s.components, s.manualGroups), G = kt(O, S.start, F(u)), j = O.filter((Q) => G.includes(Q.id)).flatMap((Q) => Q.members);
      m = S.additive ? /* @__PURE__ */ new Set([...m, ...j]) : new Set(j), ee(), H(m.size + " symbol(s) selected.");
      return;
    }
    const g = v;
    v = null;
    for (const S of g.entries) S.element.style.opacity = "";
    try {
      const S = s.moveMany(g.entries.map(({ n: O }) => ({ id: O.id, dx: g.dx, dy: g.dy })));
      ee(), S && H("Moved " + g.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (S) {
      ee(), H(S.message, { severity: "error" });
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (v || b) && (v = null, b = null, ee());
  }), t.addEventListener("pointerleave", () => {
    !v && !b && (h = null, fe());
  }), t.addEventListener("wheel", (u) => {
    requestAnimationFrame(() => {
      f && s && c && e("edit-tool").value === "route" && (h = z(u), fe());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (u) => {
    if (e("download-dialog").open || e("label-dialog").open || !f || !s || d || u.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(u.target)) return;
    const g = u.target.closest("[data-editor-pin]"), S = u.key.toLowerCase();
    if ((u.ctrlKey || u.metaKey) && S === "g") {
      u.preventDefault(), u.stopImmediatePropagation(), Ee(u.shiftKey);
      return;
    }
    if (S === "t" && !u.ctrlKey && !u.metaKey && !u.altKey) {
      u.preventDefault(), u.stopImmediatePropagation(), le(!C);
      return;
    }
    if (C && u.key === "Enter" && m.size === 1) {
      u.preventDefault(), u.stopImmediatePropagation(), M([...m][0]);
      return;
    }
    if (g && e("edit-tool").value === "route" && (u.key === "Enter" || u.key === " ")) {
      u.preventDefault(), u.stopImmediatePropagation();
      const O = s.pins().find((G) => G.id === g.dataset.editorPin);
      de({ x: O.x, y: O.y }, O.bit);
      return;
    }
    if (u.key === "Backspace" && e("edit-tool").value === "route") {
      if (u.preventDefault(), u.stopImmediatePropagation(), p) {
        const O = p.checkpoints.pop();
        O === void 0 ? p = null : p.points.length = O, fe(), H(p ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    if (u.key === "Escape")
      u.preventDefault(), u.stopImmediatePropagation(), p = null, v = null, b = null, J("select");
    else if ((u.ctrlKey || u.metaKey) && S === "z") {
      u.preventDefault(), u.stopImmediatePropagation(), xe(u.shiftKey);
      return;
    } else !u.ctrlKey && !u.metaKey && !u.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[S] && (u.preventDefault(), u.stopImmediatePropagation(), J({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[S]));
  }, { capture: !0 });
  function a(u) {
    if (!(!s || d)) {
      p = null, v = null, b = null, e("edit-tool").value = "select";
      try {
        const g = C ? D.nodes() : Ie(s.components, s.manualGroups), S = C ? m : new Set(g.filter((j) => j.members.some((Q) => m.has(Q))).map((j) => j.id)), { moves: O, rounded: G } = ar(g, S, u, E);
        C ? Te(O) : s.moveMany(O.flatMap((j) => g.find((Q) => Q.id === j.id).members.map((Q) => ({ id: Q, dx: j.dx, dy: j.dy })))), ee(), H(`${m.size} ${C ? "labels" : "components"} arranged.${G ? " Centers or gaps rounded to the " + E + "-unit pin grid." : ""}${C ? "" : " Detached connections remain flywires."}`);
      } catch (g) {
        ee(), H(g.message, { severity: "error" });
      }
    }
  }
  async function i() {
    if (!s || d || C) return;
    const u = _;
    d = !0, ie(), H("Auto-routing remaining connections…");
    try {
      if (await s.autoRoute(() => u !== _), u === _) {
        p = null, d = !1, ee();
        const g = s.airwires().length;
        H(g ? "Auto-routing finished: " + g + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: g ? "warning" : "info" });
      }
    } catch (g) {
      u === _ && (d = !1, ee(), H(g.message, { severity: "error" }));
    }
  }
  return {
    mount(u, g, S, O, G, { reset: j = !1, scope: Q = "" } = {}) {
      _++, d = !1, c = u, p = null, v = null, b = null, h = null, m.clear(), I = /* @__PURE__ */ new Map();
      for (const R of c.querySelectorAll('g[id^="cell_"]')) {
        const K = R.getCTM().inverse();
        I.set(R.id.slice(5), { children: [...R.childNodes].map((oe) => oe.cloneNode(!0)), labels: [...R.querySelectorAll("text")].map((oe) => {
          const be = new DOMPoint(+oe.getAttribute("x") || 0, +oe.getAttribute("y") || 0).matrixTransform(K.multiply(oe.getCTM()));
          return { node: oe.cloneNode(!0), x: be.x, y: be.y };
        }) });
      }
      if (E = G.gridSize || 0, w = new Map(Object.values(S.nodes).map((R) => [R.bit, R.name])), !g || !E) {
        s = null, q();
        return;
      }
      const Y = tn(c, g, S, O), W = Y.segments;
      s = new Xt(Y, { step: E, segments: W }), N = pt(Q, S.topology.signature, G), !j && A.has(N) ? (zt(c, A.get(N).labelOverrides), s.restore(en({ ...Y, segments: W }, A.get(N), E))) : e("flywire").checked && s.clear(), f = e("interactive").checked, f || !j && A.has(N) || e("flywire").checked ? ee() : q();
    },
    invalidate() {
      U = null, T = null, k = null, e("label-dialog").open && e("label-dialog").close(), s && !d && A.set(N, s.snapshot()), _++, d = !1, s = null, c = null, p = null, v = null, b = null, h = null, m.clear(), q();
    },
    snapshotSheets() {
      return s && !d && A.set(N, s.snapshot()), [...A].map(([u, g]) => {
        const [S, O, G] = JSON.parse(u);
        return { scope: S, topology: O, settings: G, snapshot: structuredClone(g) };
      });
    },
    restoreSheets(u) {
      A = new Map(u.map((g) => [pt(g.scope, g.topology, g.settings), structuredClone(g.snapshot)]));
    },
    clearSheets() {
      A.clear();
    },
    setEnabled(u) {
      f = u, u || (C = !1, T = null, k = null, p = null, v = null, b = null, h = null, m.clear()), s ? ee() : q();
    },
    clear() {
      s && !C && (s.clear(), p = null, ee(), H("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: i,
    chooseTool: J,
    arrange: a,
    toggleGroup: Ee,
    setLabelEditing: le,
    labelEditing: () => C,
    resetLabelDisplay: () => D.reset(),
    placeLabels: () => c && s ? D.layout(c, s.components, s.labelOverrides, f && C, m) : null,
    undo: () => xe(!1),
    redo: () => xe(!0),
    complete() {
      return !s || !d && s.airwires().length === 0;
    },
    working() {
      return d;
    },
    stats: L,
    canEdit() {
      return !!s;
    },
    refreshControls: q,
    refreshColors() {
      if (c) {
        for (const u of c.querySelectorAll("[data-air-net]")) u.setAttribute("stroke", $(+u.dataset.airNet));
        for (const u of c.querySelectorAll("[data-editor-bit]")) u.setAttribute("stroke", $(+u.dataset.editorBit));
      }
    },
    cleanExport(u) {
      for (const g of u.querySelectorAll("[data-label-id]")) g.removeAttribute("data-label-id");
      for (const g of u.querySelectorAll("[data-editor-overlay],[data-route-preview]")) g.remove();
      for (const g of u.querySelectorAll("[data-editor-component]"))
        g.removeAttribute("data-editor-component"), g.style.removeProperty("opacity");
    }
  };
}
const ht = 4, We = "http://www.w3.org/2000/svg";
function qe(t, e, n = !0, o = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), l = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(We, "defs"), r.dataset.coordinateGrid = "true";
    const h = document.createElementNS(We, "pattern");
    h.id = "spice-coordinate-grid", h.setAttribute("patternUnits", "userSpaceOnUse");
    const m = document.createElementNS(We, "path");
    m.setAttribute("fill", "none"), m.setAttribute("stroke", "#737b83"), m.setAttribute("stroke-opacity", ".38"), m.setAttribute("stroke-width", ".55"), m.setAttribute("vector-effect", "non-scaling-stroke"), h.append(m), r.append(h), l = document.createElementNS(We, "rect"), l.dataset.coordinateGrid = "true", l.setAttribute("fill", "url(#spice-coordinate-grid)"), l.setAttribute("stroke", "none"), l.setAttribute("pointer-events", "none"), t.prepend(l), t.prepend(r);
  }
  const s = r.firstElementChild, c = e || 8;
  s.setAttribute("width", c), s.setAttribute("height", c), s.firstElementChild.setAttribute("d", `M${c},0 H0 V${c}`), l.setAttribute("visibility", n && e ? "visible" : "hidden");
  let f = s.querySelector("[data-minor-grid]");
  f || (f = s.firstElementChild.cloneNode(), f.setAttribute("data-minor-grid", "true"), f.setAttribute("stroke-opacity", ".16"), s.append(f));
  const d = [];
  for (let h = ht; h < c; h += ht) d.push(`M${h},0 V${c} M0,${h} H${c}`);
  f.setAttribute("d", d.join(" ")), t.dataset.displayGridStep = String(c);
  let p = o;
  const v = t.closest(".spice-preview"), b = t.isConnected && v ? t.getScreenCTM() : null;
  if (b) {
    const h = v.getBoundingClientRect(), m = b.inverse(), _ = [[h.left - 1, h.top - 1], [h.right + 1, h.top - 1], [h.right + 1, h.bottom + 1], [h.left - 1, h.bottom + 1]].map(([w, A]) => new DOMPoint(w, A).matrixTransform(m)), N = Math.min(..._.map((w) => w.x)), E = Math.min(..._.map((w) => w.y));
    p = { x: N, y: E, w: Math.max(..._.map((w) => w.x)) - N, h: Math.max(..._.map((w) => w.y)) - E };
  }
  if (!p) {
    const h = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    p = { x: h[0], y: h[1], w: h[2], h: h[3] };
  }
  for (const [h, m] of Object.entries({ x: p.x, y: p.y, width: p.w, height: p.h })) l.setAttribute(h, m);
}
const yr = `<svg
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
`, wr = `<svg
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
`, xr = `<svg
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
`, vr = `<svg
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
`, Er = `<svg
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
`, _r = `<svg
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
`, Nr = `<svg
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
`, Cr = `<svg
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
`, Sr = `<svg
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
`, Ir = `<svg
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
`, Ar = `<svg
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
`, Tr = `<svg
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
`, rt = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, Or = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`, kr = `<svg
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
  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
  <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
  <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
</svg>
`, Mr = `<svg
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
</svg>
`, Rr = `<svg
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
</svg>
`, Lr = `<svg
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
</svg>
`, Pr = `<svg
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
</svg>
`, Dr = `<svg
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
  <path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z" />
  <path d="M5 3a2 2 0 0 0-2 2" />
  <path d="M19 3a2 2 0 0 1 2 2" />
  <path d="M5 21a2 2 0 0 1-2-2" />
  <path d="M9 3h1" />
  <path d="M9 21h2" />
  <path d="M14 3h1" />
  <path d="M3 9v1" />
  <path d="M21 9v2" />
  <path d="M3 14v1" />
</svg>
`, Ur = `<svg
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
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
`, Br = `<svg
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
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
</svg>
`, jr = `<svg
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M12 2v20" />
</svg>
`, Vr = `<svg
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="12" y="7" rx="2" />
  <path d="M22 2v20" />
</svg>
`, Qr = `<svg
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
</svg>
`, Gr = `<svg
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 12h20" />
</svg>
`, Fr = `<svg
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
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
</svg>
`, Hr = `<svg
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
  <rect width="6" height="14" x="3" y="5" rx="2" />
  <rect width="6" height="10" x="15" y="7" rx="2" />
  <path d="M3 2v20" />
  <path d="M21 2v20" />
</svg>
`, Wr = `<svg
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
  <rect width="14" height="6" x="5" y="15" rx="2" />
  <rect width="10" height="6" x="7" y="3" rx="2" />
  <path d="M2 21h20" />
  <path d="M2 3h20" />
</svg>
`, qr = `<svg
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
  <path d="M14 21h1" />
  <path d="M14 3h1" />
  <path d="M19 3a2 2 0 0 1 2 2" />
  <path d="M21 14v1" />
  <path d="M21 19a2 2 0 0 1-2 2" />
  <path d="M21 9v1" />
  <path d="M3 14v1" />
  <path d="M3 9v1" />
  <path d="M5 21a2 2 0 0 1-2-2" />
  <path d="M5 3a2 2 0 0 0-2 2" />
  <path d="M7 12h10" />
  <path d="M7 16h6" />
  <path d="M7 8h8" />
  <path d="M9 21h1" />
  <path d="M9 3h1" />
</svg>
`, zr = `<svg
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
  <path d="M3 7V5c0-1.1.9-2 2-2h2" />
  <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
  <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
  <rect width="7" height="5" x="7" y="7" rx="1" />
  <rect width="7" height="5" x="10" y="12" rx="1" />
</svg>
`;
function Xr(t) {
  const e = { select: Pr, box: Dr, move: yr, route: wr, erase: xr, rotate: vr, "mirror-x": Er, "mirror-y": _r }, n = { left: Br, right: Vr, top: Qr, bottom: Fr, "center-x": jr, "center-y": Gr, "space-x": Hr, "space-y": Wr }, o = { "zoom-in": Nr, "zoom-out": Cr, fit: Sr, "wire-undo": Ir, "wire-redo": Ar, "auto-route": Tr, "pin-editor": rt, "pin-info": rt, "pin-details": rt, fullscreen: Or, "exit-fullscreen": kr, "reset-windows": Mr, "open-download": Rr, upload: Lr }, r = (l, s) => {
    if (!l) return;
    const c = l.title || l.getAttribute("aria-label") || l.textContent;
    l.setAttribute("aria-label", c), l.title = c, l.innerHTML = s, l.firstElementChild.setAttribute("aria-hidden", "true"), l.firstElementChild.setAttribute("focusable", "false"), l.classList.add("spice-icon-button");
  };
  r(t.querySelector("#spice-copy"), Ur), r(t.querySelector("#spice-label-edit"), qr), r(t.querySelector("#spice-group"), zr);
  for (const [l, s] of Object.entries(n)) r(t.querySelector(`[data-editor-arrange="${l}"]`), s);
  for (const [l, s] of Object.entries(e)) r(t.querySelector(`[data-editor-mode="${l}"]`), s);
  for (const [l, s] of Object.entries(o)) r(t.querySelector("#spice-" + l), s);
}
function $r(t) {
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
var ot = {};
const Yr = {}, Kr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Yr
}, Symbol.toStringTag, { value: "Module" })), Zr = /* @__PURE__ */ $r(Kr);
var Lt;
function Jr() {
  return Lt || (Lt = 1, (function(t) {
    (function(e) {
      e.parser = function(a, i) {
        return new o(a, i);
      }, e.SAXParser = o, e.SAXStream = v, e.createStream = d, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function o(a, i) {
        if (!(this instanceof o))
          return new o(a, i);
        var u = this;
        l(u), u.q = u.c = "", u.bufferCheckPosition = e.MAX_BUFFER_LENGTH, u.encoding = null, u.opt = i || {}, u.opt.lowercase = u.opt.lowercase || u.opt.lowercasetags, u.looseCase = u.opt.lowercase ? "toLowerCase" : "toUpperCase", u.opt.maxEntityCount = u.opt.maxEntityCount || 512, u.opt.maxEntityDepth = u.opt.maxEntityDepth || 4, u.entityCount = u.entityDepth = 0, u.tags = [], u.closed = u.closedRoot = u.sawRoot = !1, u.tag = u.error = null, u.strict = !!a, u.noscript = !!(a || u.opt.noscript), u.state = y.BEGIN, u.strictEntities = u.opt.strictEntities, u.ENTITIES = u.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), u.attribList = [], u.opt.xmlns && (u.ns = Object.create(N)), u.opt.unquotedAttributeValues === void 0 && (u.opt.unquotedAttributeValues = !a), u.trackPosition = u.opt.position !== !1, u.trackPosition && (u.position = u.line = u.column = 0), F(u, "onready");
      }
      Object.create || (Object.create = function(a) {
        function i() {
        }
        i.prototype = a;
        var u = new i();
        return u;
      }), Object.keys || (Object.keys = function(a) {
        var i = [];
        for (var u in a) a.hasOwnProperty(u) && i.push(u);
        return i;
      });
      function r(a) {
        for (var i = Math.max(e.MAX_BUFFER_LENGTH, 10), u = 0, g = 0, S = n.length; g < S; g++) {
          var O = a[n[g]].length;
          if (O > i)
            switch (n[g]) {
              case "textNode":
                q(a);
                break;
              case "cdata":
                B(a, "oncdata", a.cdata), a.cdata = "";
                break;
              case "script":
                B(a, "onscript", a.script), a.script = "";
                break;
              default:
                J(a, "Max buffer length exceeded: " + n[g]);
            }
          u = Math.max(u, O);
        }
        var G = e.MAX_BUFFER_LENGTH - u;
        a.bufferCheckPosition = G + a.position;
      }
      function l(a) {
        for (var i = 0, u = n.length; i < u; i++)
          a[n[i]] = "";
      }
      function s(a) {
        q(a), a.cdata !== "" && (B(a, "oncdata", a.cdata), a.cdata = ""), a.script !== "" && (B(a, "onscript", a.script), a.script = "");
      }
      o.prototype = {
        end: function() {
          ie(this);
        },
        write: M,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          s(this);
        }
      };
      var c;
      try {
        c = Zr.Stream;
      } catch {
        c = function() {
        };
      }
      c || (c = function() {
      });
      var f = e.EVENTS.filter(function(a) {
        return a !== "error" && a !== "end";
      });
      function d(a, i) {
        return new v(a, i);
      }
      function p(a, i) {
        if (a.length >= 2) {
          if (a[0] === 255 && a[1] === 254)
            return "utf-16le";
          if (a[0] === 254 && a[1] === 255)
            return "utf-16be";
        }
        return a.length >= 3 && a[0] === 239 && a[1] === 187 && a[2] === 191 ? "utf8" : a.length >= 4 ? a[0] === 60 && a[1] === 0 && a[2] === 63 && a[3] === 0 ? "utf-16le" : a[0] === 0 && a[1] === 60 && a[2] === 0 && a[3] === 63 ? "utf-16be" : "utf8" : i ? "utf8" : null;
      }
      function v(a, i) {
        if (!(this instanceof v))
          return new v(a, i);
        c.apply(this), this._parser = new o(a, i), this.writable = !0, this.readable = !0;
        var u = this;
        this._parser.onend = function() {
          u.emit("end");
        }, this._parser.onerror = function(g) {
          u.emit("error", g), u._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, f.forEach(function(g) {
          Object.defineProperty(u, "on" + g, {
            get: function() {
              return u._parser["on" + g];
            },
            set: function(S) {
              if (!S)
                return u.removeAllListeners(g), u._parser["on" + g] = S, S;
              u.on(g, S);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      v.prototype = Object.create(c.prototype, {
        constructor: {
          value: v
        }
      }), v.prototype._decodeBuffer = function(a, i) {
        if (this._decoderBuffer && (a = Buffer.concat([this._decoderBuffer, a]), this._decoderBuffer = null), !this._decoder) {
          var u = p(a, i);
          if (!u)
            return this._decoderBuffer = a, "";
          this._parser.encoding = u, this._decoder = new TextDecoder(u);
        }
        return this._decoder.decode(a, { stream: !i });
      }, v.prototype.write = function(a) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(a))
          a = this._decodeBuffer(a, !1);
        else if (this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        }
        return this._parser.write(a.toString()), this.emit("data", a), !0;
      }, v.prototype.end = function(a) {
        if (a && a.length && this.write(a), this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        } else if (this._decoder) {
          var u = this._decoder.decode();
          u && (this._parser.write(u), this.emit("data", u));
        }
        return this._parser.end(), !0;
      }, v.prototype.on = function(a, i) {
        var u = this;
        return !u._parser["on" + a] && f.indexOf(a) !== -1 && (u._parser["on" + a] = function() {
          var g = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          g.splice(0, 0, a), u.emit.apply(u, g);
        }), c.prototype.on.call(u, a, i);
      };
      var b = /^\[CDATA\[$/i, h = /^DOCTYPE$/i, m = "http://www.w3.org/XML/1998/namespace", _ = "http://www.w3.org/2000/xmlns/", N = { xml: m, xmlns: _ }, E = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, I = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function C(a) {
        return a === " " || a === `
` || a === "\r" || a === "	";
      }
      function T(a) {
        return a === '"' || a === "'";
      }
      function k(a) {
        return a === ">" || C(a);
      }
      function U(a, i) {
        return a.test(i);
      }
      function x(a, i) {
        return !U(a, i);
      }
      var y = 0;
      e.STATE = {
        BEGIN: y++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: y++,
        // leading whitespace
        TEXT: y++,
        // general stuff
        TEXT_ENTITY: y++,
        // &amp and such.
        OPEN_WAKA: y++,
        // <
        SGML_DECL: y++,
        // <!BLARG
        SGML_DECL_QUOTED: y++,
        // <!BLARG foo "bar
        DOCTYPE: y++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: y++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: y++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: y++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: y++,
        // <!-
        COMMENT: y++,
        // <!--
        COMMENT_ENDING: y++,
        // <!-- blah -
        COMMENT_ENDED: y++,
        // <!-- blah --
        CDATA: y++,
        // <![CDATA[ something
        CDATA_ENDING: y++,
        // ]
        CDATA_ENDING_2: y++,
        // ]]
        PROC_INST: y++,
        // <?hi
        PROC_INST_BODY: y++,
        // <?hi there
        PROC_INST_ENDING: y++,
        // <?hi "there" ?
        OPEN_TAG: y++,
        // <strong
        OPEN_TAG_SLASH: y++,
        // <strong /
        ATTRIB: y++,
        // <a
        ATTRIB_NAME: y++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: y++,
        // <a foo _
        ATTRIB_VALUE: y++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: y++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: y++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: y++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: y++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: y++,
        // <foo bar=&quot
        CLOSE_TAG: y++,
        // </a
        CLOSE_TAG_SAW_WHITE: y++,
        // </a   >
        SCRIPT: y++,
        // <script> ...
        SCRIPT_ENDING: y++
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
      }), Object.keys(e.ENTITIES).forEach(function(a) {
        var i = e.ENTITIES[a], u = typeof i == "number" ? String.fromCharCode(i) : i;
        e.ENTITIES[a] = u;
      });
      for (var D in e.STATE)
        e.STATE[e.STATE[D]] = D;
      y = e.STATE;
      function F(a, i, u) {
        a[i] && a[i](u);
      }
      function z(a) {
        var i = a && a.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return i ? i[2] : null;
      }
      function $(a) {
        return a ? a.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function H(a, i) {
        const u = $(a), g = $(i);
        return !u || !g ? !0 : g === "utf16" ? u === "utf16le" || u === "utf16be" : u === g;
      }
      function L(a, i) {
        if (!(!a.strict || !a.encoding || !i || i.name !== "xml")) {
          var u = z(i.body);
          u && !H(a.encoding, u) && Z(
            a,
            "XML declaration encoding " + u + " does not match detected stream encoding " + a.encoding.toUpperCase()
          );
        }
      }
      function B(a, i, u) {
        a.textNode && q(a), F(a, i, u);
      }
      function q(a) {
        a.textNode = X(a.opt, a.textNode), a.textNode && F(a, "ontext", a.textNode), a.textNode = "";
      }
      function X(a, i) {
        return a.trim && (i = i.trim()), a.normalize && (i = i.replace(/\s+/g, " ")), i;
      }
      function J(a, i) {
        return q(a), a.trackPosition && (i += `
Line: ` + a.line + `
Column: ` + a.column + `
Char: ` + a.c), i = new Error(i), a.error = i, F(a, "onerror", i), a;
      }
      function ie(a) {
        return a.sawRoot && !a.closedRoot && Z(a, "Unclosed root tag"), a.state !== y.BEGIN && a.state !== y.BEGIN_WHITESPACE && a.state !== y.TEXT && J(a, "Unexpected end"), q(a), a.c = "", a.closed = !0, F(a, "onend"), o.call(a, a.strict, a.opt), a;
      }
      function Z(a, i) {
        if (typeof a != "object" || !(a instanceof o))
          throw new Error("bad call to strictFail");
        a.strict && J(a, i);
      }
      function fe(a) {
        a.strict || (a.tagName = a.tagName[a.looseCase]());
        var i = a.tags[a.tags.length - 1] || a, u = a.tag = { name: a.tagName, attributes: {} };
        a.opt.xmlns && (u.ns = i.ns), a.attribList.length = 0, B(a, "onopentagstart", u);
      }
      function pe(a, i) {
        var u = a.indexOf(":"), g = u < 0 ? ["", a] : a.split(":"), S = g[0], O = g[1];
        return i && a === "xmlns" && (S = "xmlns", O = ""), { prefix: S, local: O };
      }
      function ee(a) {
        if (a.strict || (a.attribName = a.attribName[a.looseCase]()), a.attribList.indexOf(a.attribName) !== -1 || a.tag.attributes.hasOwnProperty(a.attribName)) {
          a.attribName = a.attribValue = "";
          return;
        }
        if (a.opt.xmlns) {
          var i = pe(a.attribName, !0), u = i.prefix, g = i.local;
          if (u === "xmlns")
            if (g === "xml" && a.attribValue !== m)
              Z(
                a,
                "xml: prefix must be bound to " + m + `
Actual: ` + a.attribValue
              );
            else if (g === "xmlns" && a.attribValue !== _)
              Z(
                a,
                "xmlns: prefix must be bound to " + _ + `
Actual: ` + a.attribValue
              );
            else {
              var S = a.tag, O = a.tags[a.tags.length - 1] || a;
              S.ns === O.ns && (S.ns = Object.create(O.ns)), S.ns[g] = a.attribValue;
            }
          a.attribList.push([a.attribName, a.attribValue]);
        } else
          a.tag.attributes[a.attribName] = a.attribValue, B(a, "onattribute", {
            name: a.attribName,
            value: a.attribValue
          });
        a.attribName = a.attribValue = "";
      }
      function de(a, i) {
        if (a.opt.xmlns) {
          var u = a.tag, g = pe(a.tagName);
          u.prefix = g.prefix, u.local = g.local, u.uri = u.ns[g.prefix] || "", u.prefix && !u.uri && (Z(
            a,
            "Unbound namespace prefix: " + JSON.stringify(a.tagName)
          ), u.uri = g.prefix);
          var S = a.tags[a.tags.length - 1] || a;
          u.ns && S.ns !== u.ns && Object.keys(u.ns).forEach(function(_e) {
            B(a, "onopennamespace", {
              prefix: _e,
              uri: u.ns[_e]
            });
          });
          for (var O = 0, G = a.attribList.length; O < G; O++) {
            var j = a.attribList[O], Q = j[0], Y = j[1], W = pe(Q, !0), R = W.prefix, K = W.local, oe = R === "" ? "" : u.ns[R] || "", be = {
              name: Q,
              value: Y,
              prefix: R,
              local: K,
              uri: oe
            };
            R && R !== "xmlns" && !oe && (Z(
              a,
              "Unbound namespace prefix: " + JSON.stringify(R)
            ), be.uri = R), a.tag.attributes[Q] = be, B(a, "onattribute", be);
          }
          a.attribList.length = 0;
        }
        a.tag.isSelfClosing = !!i, a.sawRoot = !0, a.tags.push(a.tag), B(a, "onopentag", a.tag), i || (!a.noscript && a.tagName.toLowerCase() === "script" ? a.state = y.SCRIPT : a.state = y.TEXT, a.tag = null, a.tagName = ""), a.attribName = a.attribValue = "", a.attribList.length = 0;
      }
      function Ee(a) {
        if (!a.tagName) {
          Z(a, "Weird empty close tag."), a.textNode += "</>", a.state = y.TEXT;
          return;
        }
        if (a.script) {
          if (a.tagName !== "script") {
            a.script += "</" + a.tagName + ">", a.tagName = "", a.state = y.SCRIPT;
            return;
          }
          B(a, "onscript", a.script), a.script = "";
        }
        var i = a.tags.length, u = a.tagName;
        a.strict || (u = u[a.looseCase]());
        for (var g = u; i--; ) {
          var S = a.tags[i];
          if (S.name !== g)
            Z(a, "Unexpected close tag");
          else
            break;
        }
        if (i < 0) {
          Z(a, "Unmatched closing tag: " + a.tagName), a.textNode += "</" + a.tagName + ">", a.state = y.TEXT;
          return;
        }
        a.tagName = u;
        for (var O = a.tags.length; O-- > i; ) {
          var G = a.tag = a.tags.pop();
          a.tagName = a.tag.name, B(a, "onclosetag", a.tagName);
          var j = {};
          for (var Q in G.ns)
            j[Q] = G.ns[Q];
          var Y = a.tags[a.tags.length - 1] || a;
          a.opt.xmlns && G.ns !== Y.ns && Object.keys(G.ns).forEach(function(W) {
            var R = G.ns[W];
            B(a, "onclosenamespace", { prefix: W, uri: R });
          });
        }
        i === 0 && (a.closedRoot = !0), a.tagName = a.attribValue = a.attribName = "", a.attribList.length = 0, a.state = y.TEXT;
      }
      function ue(a) {
        var i = a.entity, u = i.toLowerCase(), g, S = "";
        return a.ENTITIES[i] ? a.ENTITIES[i] : a.ENTITIES[u] ? a.ENTITIES[u] : (i = u, i.charAt(0) === "#" && (i.charAt(1) === "x" ? (i = i.slice(2), g = parseInt(i, 16), S = g.toString(16)) : (i = i.slice(1), g = parseInt(i, 10), S = g.toString(10))), i = i.replace(/^0+/, ""), isNaN(g) || S.toLowerCase() !== i || g < 0 || g > 1114111 || !Te(g) ? (Z(a, "Invalid character entity"), "&" + a.entity + ";") : String.fromCodePoint(g));
      }
      function Te(a) {
        return a === 9 || a === 10 || a === 13 || a >= 32 && a <= 55295 || a >= 57344 && a <= 65533 || a >= 65536 && a <= 1114111;
      }
      function le(a, i) {
        i === "<" ? (a.state = y.OPEN_WAKA, a.startTagPosition = a.position) : C(i) || (Z(a, "Non-whitespace before first tag."), a.textNode = i, a.state = y.TEXT);
      }
      function xe(a, i) {
        var u = "";
        return i < a.length && (u = a.charAt(i)), u;
      }
      function M(a) {
        var i = this;
        if (this.error)
          throw this.error;
        if (i.closed)
          return J(
            i,
            "Cannot write after close. Assign an onready handler."
          );
        if (a === null)
          return ie(i);
        typeof a == "object" && (a = a.toString());
        for (var u = 0, g = ""; g = xe(a, u++), i.c = g, !!g; )
          switch (i.trackPosition && (i.position++, g === `
` ? (i.line++, i.column = 0) : i.column++), i.state) {
            case y.BEGIN:
              if (i.state = y.BEGIN_WHITESPACE, g === "\uFEFF")
                continue;
              le(i, g);
              continue;
            case y.BEGIN_WHITESPACE:
              le(i, g);
              continue;
            case y.TEXT:
              if (i.sawRoot && !i.closedRoot) {
                for (var O = u - 1; g && g !== "<" && g !== "&"; )
                  g = xe(a, u++), g && i.trackPosition && (i.position++, g === `
` ? (i.line++, i.column = 0) : i.column++);
                i.textNode += a.substring(O, u - 1);
              }
              g === "<" && !(i.sawRoot && i.closedRoot && !i.strict) ? (i.state = y.OPEN_WAKA, i.startTagPosition = i.position) : (!C(g) && (!i.sawRoot || i.closedRoot) && Z(i, "Text data outside of root node."), g === "&" ? i.state = y.TEXT_ENTITY : i.textNode += g);
              continue;
            case y.SCRIPT:
              g === "<" ? i.state = y.SCRIPT_ENDING : i.script += g;
              continue;
            case y.SCRIPT_ENDING:
              g === "/" ? i.state = y.CLOSE_TAG : (i.script += "<" + g, i.state = y.SCRIPT);
              continue;
            case y.OPEN_WAKA:
              if (g === "!")
                i.state = y.SGML_DECL, i.sgmlDecl = "";
              else if (!C(g)) if (U(E, g))
                i.state = y.OPEN_TAG, i.tagName = g;
              else if (g === "/")
                i.state = y.CLOSE_TAG, i.tagName = "";
              else if (g === "?")
                i.state = y.PROC_INST, i.procInstName = i.procInstBody = "";
              else {
                if (Z(i, "Unencoded <"), i.startTagPosition + 1 < i.position) {
                  var S = i.position - i.startTagPosition;
                  g = new Array(S).join(" ") + g;
                }
                i.textNode += "<" + g, i.state = y.TEXT;
              }
              continue;
            case y.SGML_DECL:
              if (i.sgmlDecl + g === "--") {
                i.state = y.COMMENT, i.comment = "", i.sgmlDecl = "";
                continue;
              }
              i.doctype && i.doctype !== !0 && i.sgmlDecl ? (i.state = y.DOCTYPE_DTD, i.doctype += "<!" + i.sgmlDecl + g, i.sgmlDecl = "") : b.test(i.sgmlDecl + g) ? (B(i, "onopencdata"), i.state = y.CDATA, i.sgmlDecl = "", i.cdata = "") : h.test(i.sgmlDecl + g) ? (i.state = y.DOCTYPE, (i.doctype || i.sawRoot) && Z(
                i,
                "Inappropriately located doctype declaration"
              ), i.doctype = "", i.sgmlDecl = "") : g === ">" ? (B(i, "onsgmldeclaration", i.sgmlDecl), i.sgmlDecl = "", i.state = y.TEXT) : (T(g) && (i.state = y.SGML_DECL_QUOTED), i.sgmlDecl += g);
              continue;
            case y.SGML_DECL_QUOTED:
              g === i.q && (i.state = y.SGML_DECL, i.q = ""), i.sgmlDecl += g;
              continue;
            case y.DOCTYPE:
              g === ">" ? (i.state = y.TEXT, B(i, "ondoctype", i.doctype), i.doctype = !0) : (i.doctype += g, g === "[" ? i.state = y.DOCTYPE_DTD : T(g) && (i.state = y.DOCTYPE_QUOTED, i.q = g));
              continue;
            case y.DOCTYPE_QUOTED:
              i.doctype += g, g === i.q && (i.q = "", i.state = y.DOCTYPE);
              continue;
            case y.DOCTYPE_DTD:
              g === "]" ? (i.doctype += g, i.state = y.DOCTYPE) : g === "<" ? (i.state = y.OPEN_WAKA, i.startTagPosition = i.position) : T(g) ? (i.doctype += g, i.state = y.DOCTYPE_DTD_QUOTED, i.q = g) : i.doctype += g;
              continue;
            case y.DOCTYPE_DTD_QUOTED:
              i.doctype += g, g === i.q && (i.state = y.DOCTYPE_DTD, i.q = "");
              continue;
            case y.COMMENT:
              g === "-" ? i.state = y.COMMENT_ENDING : i.comment += g;
              continue;
            case y.COMMENT_ENDING:
              g === "-" ? (i.state = y.COMMENT_ENDED, i.comment = X(i.opt, i.comment), i.comment && B(i, "oncomment", i.comment), i.comment = "") : (i.comment += "-" + g, i.state = y.COMMENT);
              continue;
            case y.COMMENT_ENDED:
              g !== ">" ? (Z(i, "Malformed comment"), i.comment += "--" + g, i.state = y.COMMENT) : i.doctype && i.doctype !== !0 ? i.state = y.DOCTYPE_DTD : i.state = y.TEXT;
              continue;
            case y.CDATA:
              for (var O = u - 1; g && g !== "]"; )
                g = xe(a, u++), g && i.trackPosition && (i.position++, g === `
` ? (i.line++, i.column = 0) : i.column++);
              i.cdata += a.substring(O, u - 1), g === "]" && (i.state = y.CDATA_ENDING);
              continue;
            case y.CDATA_ENDING:
              g === "]" ? i.state = y.CDATA_ENDING_2 : (i.cdata += "]" + g, i.state = y.CDATA);
              continue;
            case y.CDATA_ENDING_2:
              g === ">" ? (i.cdata && B(i, "oncdata", i.cdata), B(i, "onclosecdata"), i.cdata = "", i.state = y.TEXT) : g === "]" ? i.cdata += "]" : (i.cdata += "]]" + g, i.state = y.CDATA);
              continue;
            case y.PROC_INST:
              g === "?" ? i.state = y.PROC_INST_ENDING : C(g) ? i.state = y.PROC_INST_BODY : i.procInstName += g;
              continue;
            case y.PROC_INST_BODY:
              if (!i.procInstBody && C(g))
                continue;
              g === "?" ? i.state = y.PROC_INST_ENDING : i.procInstBody += g;
              continue;
            case y.PROC_INST_ENDING:
              if (g === ">") {
                const Y = {
                  name: i.procInstName,
                  body: i.procInstBody
                };
                L(i, Y), B(i, "onprocessinginstruction", Y), i.procInstName = i.procInstBody = "", i.state = y.TEXT;
              } else
                i.procInstBody += "?" + g, i.state = y.PROC_INST_BODY;
              continue;
            case y.OPEN_TAG:
              U(w, g) ? i.tagName += g : (fe(i), g === ">" ? de(i) : g === "/" ? i.state = y.OPEN_TAG_SLASH : (C(g) || Z(i, "Invalid character in tag name"), i.state = y.ATTRIB));
              continue;
            case y.OPEN_TAG_SLASH:
              g === ">" ? (de(i, !0), Ee(i)) : (Z(
                i,
                "Forward-slash in opening tag not followed by >"
              ), i.state = y.ATTRIB);
              continue;
            case y.ATTRIB:
              if (C(g))
                continue;
              g === ">" ? de(i) : g === "/" ? i.state = y.OPEN_TAG_SLASH : U(E, g) ? (i.attribName = g, i.attribValue = "", i.state = y.ATTRIB_NAME) : Z(i, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME:
              g === "=" ? i.state = y.ATTRIB_VALUE : g === ">" ? (Z(i, "Attribute without value"), i.attribValue = i.attribName, ee(i), de(i)) : C(g) ? i.state = y.ATTRIB_NAME_SAW_WHITE : U(w, g) ? i.attribName += g : Z(i, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME_SAW_WHITE:
              if (g === "=")
                i.state = y.ATTRIB_VALUE;
              else {
                if (C(g))
                  continue;
                Z(i, "Attribute without value"), i.tag.attributes[i.attribName] = "", i.attribValue = "", B(i, "onattribute", {
                  name: i.attribName,
                  value: ""
                }), i.attribName = "", g === ">" ? de(i) : U(E, g) ? (i.attribName = g, i.state = y.ATTRIB_NAME) : (Z(i, "Invalid attribute name"), i.state = y.ATTRIB);
              }
              continue;
            case y.ATTRIB_VALUE:
              if (C(g))
                continue;
              T(g) ? (i.q = g, i.state = y.ATTRIB_VALUE_QUOTED) : (i.opt.unquotedAttributeValues || J(i, "Unquoted attribute value"), i.state = y.ATTRIB_VALUE_UNQUOTED, i.attribValue = g);
              continue;
            case y.ATTRIB_VALUE_QUOTED:
              if (g !== i.q) {
                g === "&" ? i.state = y.ATTRIB_VALUE_ENTITY_Q : i.attribValue += g;
                continue;
              }
              ee(i), i.q = "", i.state = y.ATTRIB_VALUE_CLOSED;
              continue;
            case y.ATTRIB_VALUE_CLOSED:
              C(g) ? i.state = y.ATTRIB : g === ">" ? de(i) : g === "/" ? i.state = y.OPEN_TAG_SLASH : U(E, g) ? (Z(i, "No whitespace between attributes"), i.attribName = g, i.attribValue = "", i.state = y.ATTRIB_NAME) : Z(i, "Invalid attribute name");
              continue;
            case y.ATTRIB_VALUE_UNQUOTED:
              if (!k(g)) {
                g === "&" ? i.state = y.ATTRIB_VALUE_ENTITY_U : i.attribValue += g;
                continue;
              }
              ee(i), g === ">" ? de(i) : i.state = y.ATTRIB;
              continue;
            case y.CLOSE_TAG:
              if (i.tagName)
                g === ">" ? Ee(i) : U(w, g) ? i.tagName += g : i.script ? (i.script += "</" + i.tagName + g, i.tagName = "", i.state = y.SCRIPT) : (C(g) || Z(i, "Invalid tagname in closing tag"), i.state = y.CLOSE_TAG_SAW_WHITE);
              else {
                if (C(g))
                  continue;
                x(E, g) ? i.script ? (i.script += "</" + g, i.state = y.SCRIPT) : Z(i, "Invalid tagname in closing tag.") : i.tagName = g;
              }
              continue;
            case y.CLOSE_TAG_SAW_WHITE:
              if (C(g))
                continue;
              g === ">" ? Ee(i) : Z(i, "Invalid characters in closing tag");
              continue;
            case y.TEXT_ENTITY:
            case y.ATTRIB_VALUE_ENTITY_Q:
            case y.ATTRIB_VALUE_ENTITY_U:
              var G, j;
              switch (i.state) {
                case y.TEXT_ENTITY:
                  G = y.TEXT, j = "textNode";
                  break;
                case y.ATTRIB_VALUE_ENTITY_Q:
                  G = y.ATTRIB_VALUE_QUOTED, j = "attribValue";
                  break;
                case y.ATTRIB_VALUE_ENTITY_U:
                  G = y.ATTRIB_VALUE_UNQUOTED, j = "attribValue";
                  break;
              }
              if (g === ";") {
                var Q = ue(i);
                i.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(Q) ? ((i.entityCount += 1) > i.opt.maxEntityCount && J(
                  i,
                  "Parsed entity count exceeds max entity count"
                ), (i.entityDepth += 1) > i.opt.maxEntityDepth && J(
                  i,
                  "Parsed entity depth exceeds max entity depth"
                ), i.entity = "", i.state = G, i.write(Q), i.entityDepth -= 1) : (i[j] += Q, i.entity = "", i.state = G);
              } else U(i.entity.length ? I : A, g) ? i.entity += g : (Z(i, "Invalid character in entity name"), i[j] += "&" + i.entity + g, i.entity = "", i.state = G);
              continue;
            default:
              throw new Error(i, "Unknown state: " + i.state);
          }
        return i.position >= i.bufferCheckPosition && r(i), i;
      }
      String.fromCodePoint || (function() {
        var a = String.fromCharCode, i = Math.floor, u = function() {
          var g = 16384, S = [], O, G, j = -1, Q = arguments.length;
          if (!Q)
            return "";
          for (var Y = ""; ++j < Q; ) {
            var W = Number(arguments[j]);
            if (!isFinite(W) || // `NaN`, `+Infinity`, or `-Infinity`
            W < 0 || // not a valid Unicode code point
            W > 1114111 || // not a valid Unicode code point
            i(W) !== W)
              throw RangeError("Invalid code point: " + W);
            W <= 65535 ? S.push(W) : (W -= 65536, O = (W >> 10) + 55296, G = W % 1024 + 56320, S.push(O, G)), (j + 1 === Q || S.length > g) && (Y += a.apply(null, S), S.length = 0);
          }
          return Y;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: u,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = u;
      })();
    })(t);
  })(ot)), ot;
}
var it, Pt;
function eo() {
  if (Pt) return it;
  Pt = 1;
  var t = Jr().parser;
  function e(n) {
    var o = [], r = [], l = o, s;
    return s = t(!0), s.ontext = function(c) {
      c.trim() !== "" && l.push(c);
    }, s.onopentag = function(c) {
      var f;
      f = [c.name, c.attributes], r.push(l), l.push(f), l = f;
    }, s.onclosetag = function() {
      l = r.pop();
    }, s.write(n).close(), o[0];
  }
  return it = e, it;
}
var st, Dt;
function to() {
  if (Dt) return st;
  Dt = 1;
  function t(e, n) {
    var o = function() {
    }, r = o, l = o;
    function s() {
      this._skip = !0;
    }
    function c() {
      this._remove = !0;
    }
    function f(v) {
      this._name = v;
    }
    function d(v) {
      this._replace = v;
    }
    function p(v, b) {
      var h, m = { attr: {}, full: v }, _ = {
        name: f,
        skip: s,
        // break: breakFn,
        remove: c,
        replace: d,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, N = !0, E, w, A;
      if (v !== void 0 && v !== null && v !== !0 && v !== !1)
        switch (h = Object.prototype.toString.call(v), h) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (v.some(function(I, C) {
              if (C === 0)
                return m.name = I, !1;
              if (C === 1)
                return Object.prototype.toString.call(I) === "[object Object]" && (N = !1, m.attr = I), !0;
            }), r.call(_, m, b), _._name && (v[0] = _._name), _._replace)
              return _._replace;
            if (_._remove)
              return null;
            if (!_._skip) {
              for (E = 0, w = v.length; E < w; ) {
                if (E > 1 || E === 1 && N) {
                  if (A = p(v[E], m), A === null) {
                    v.splice(E, 1), w -= 1;
                    continue;
                  }
                  A && (v[E] = A);
                }
                E += 1;
              }
              if (l.call(_, m, b), _._name && (v[0] = _._name), _._replace)
                return _._replace;
              if (_._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (l = n.leave)), p(e, void 0);
  }
  return st = t, st;
}
var at, Ut;
function no() {
  if (Ut) return at;
  Ut = 1;
  const t = eo(), e = to(), n = (r) => String(r).replace(/[&<>"']/g, (l) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[l]);
  function o(r) {
    const [l, ...s] = r, c = s[0] && typeof s[0] == "object" && !Array.isArray(s[0]) ? s.shift() : {}, f = "<" + l + Object.entries(c).map(([d, p]) => " " + d + '="' + n(p) + '"').join("");
    return s.length ? f + ">" + s.map((d) => Array.isArray(d) ? o(d) : n(d)).join("") + "</" + l + ">" : f + "/>";
  }
  return at = { parse: t, p: t, traverse: e, t: e, stringify: o, s: o }, at;
}
no();
const lt = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), ro = (t, e) => [...t].reduce((n, o) => n + (o.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function oo(t, e, n = 12) {
  const o = [], r = t.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
  for (const [s, c] of t.entries()) {
    if (!c.labels.length) continue;
    const f = Math.max(...c.labels.map((m) => ro(m.text, n))) + 4, d = c.labels.length * (n + 4), p = [];
    for (const m of [5, 14, 28, 48]) {
      const _ = { x: c.x + (c.w - f) / 2, y: c.y - m - d, w: f, h: d }, N = { x: c.x + (c.w - f) / 2, y: c.y + c.h + m, w: f, h: d }, E = { x: c.x + c.w + m, y: c.y + (c.h - d) / 2, w: f, h: d }, w = { x: c.x - m - f, y: c.y + (c.h - d) / 2, w: f, h: d };
      p.push(...c.w > c.h ? [_, N, E, w] : [E, w, _, N]);
    }
    const v = (m) => e.reduce((_, N) => {
      const E = Math.min(N.a.x, N.b.x), w = Math.min(N.a.y, N.b.y), A = { x: E - 1, y: w - 1, w: Math.abs(N.a.x - N.b.x) + 2, h: Math.abs(N.a.y - N.b.y) + 2 };
      return _ + lt(m, A) * 2;
    }, 0);
    let b = null, h = 1 / 0;
    for (const [m, _] of p.entries()) {
      const N = r.reduce((E, w, A) => E + (A === s ? 0 : lt(_, w)) * 500, 0) + o.reduce((E, w) => E + lt(_, w) * 100, 0) + v(_) + m * 3;
      N < h && (h = N, b = _);
    }
    c.labels.forEach((m, _) => {
      m.x = b.x - c.x, m.y = b.y - c.y + n + _ * (n + 4);
    }), o.push(b);
  }
  const l = [...r, ...o];
  return { x: Math.min(0, ...l.map((s) => s.x)), y: Math.min(0, ...l.map((s) => s.y)), right: Math.max(0, ...l.map((s) => s.x + s.w)), bottom: Math.max(0, ...l.map((s) => s.y + s.h)) };
}
const io = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function so(t, e = 12) {
  const n = [...t.children].filter((l) => l.localName === "g" && l.id.startsWith("cell_")).map((l) => ({ ...io(l.getAttribute("transform")), w: +l.getAttribute("s:width"), h: +l.getAttribute("s:height"), labels: [...l.children].filter((s) => s.localName === "text" && s.hasAttribute("data-layout-label")).map((s) => ({ node: s, text: s.textContent })) })), o = [...t.children].filter((l) => l.localName === "line" && l.hasAttribute("data-net")).map((l) => ({ a: { x: +l.getAttribute("x1"), y: +l.getAttribute("y1") }, b: { x: +l.getAttribute("x2"), y: +l.getAttribute("y2") } })), r = oo(n, o, e);
  for (const l of n) for (const s of l.labels)
    s.node.setAttribute("x", s.x), s.node.setAttribute("y", s.y), s.node.setAttribute("text-anchor", "start"), s.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
function ao(t) {
  const e = t("diagnostics"), n = t("messages"), o = t("toggle-log");
  let r = 0, l = !0, s = !1;
  function c(m) {
    n.dataset.expanded = String(m), o.setAttribute("aria-expanded", String(m)), e.hidden = !m;
  }
  o.onclick = () => c(o.getAttribute("aria-expanded") !== "true");
  let f = [];
  const d = () => [e.clientWidth, e.clientHeight], p = () => d().some((m, _) => m !== f[_]);
  function v() {
    s || (s = !0, requestAnimationFrame(() => {
      l && (e.scrollTop = e.scrollHeight), f = d(), s = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (p()) {
      f = d(), l && v();
      return;
    }
    s || (l = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    f = d(), l && v();
  }).observe(e);
  function h({ message: m, severity: _ = "info", category: N = "Tools", line: E, source: w }) {
    if (!m) return;
    const A = l, I = /* @__PURE__ */ new Date(), C = document.createElement("li"), T = document.createElement("time"), k = document.createElement("span"), U = document.createElement("strong");
    _ = ["error", "warning", "info"].includes(_) ? _ : "info", C.className = _, C.dataset.logSequence = String(++r), C.dataset.logCategory = N, C.dataset.logSeverity = _, T.dateTime = I.toISOString(), T.textContent = I.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), T.title = T.dateTime, U.textContent = _.toUpperCase() + " · " + N + " ", k.append(U, document.createTextNode((w && w !== "input.cir" ? w + " · " : "") + (E ? "line " + E + " · " : "") + m)), C.append(T, k), e.append(C), t("message-count").textContent = r + " entries", _ !== "info" && c(!0), A && v();
  }
  return { append: h };
}
const Bt = De.filter.source, V = (t) => document.getElementById("spice-" + t), me = V("app");
if (me) {
  let l = function(M, { severity: a = "info", category: i = "Rendering" } = {}) {
    n.textContent = M, o.append({ message: M, severity: a, category: i });
  }, $ = function() {
    const M = e.querySelector("svg");
    if (!M) return;
    d?.resetLabelDisplay();
    const a = Number(M.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, i = so(M, a), u = d?.placeLabels() || i;
    M.dataset.labelBounds = JSON.stringify(u);
    const g = Math.min(C.x, u.x - 20), S = Math.min(C.y, u.y - 20);
    C = { x: g, y: S, w: Math.max(C.x + C.w, u.right + 20) - g, h: Math.max(C.y + C.h, u.bottom + 20) - S }, p && or(M, v, p), d?.refreshColors(), qe(M, z(), V("show-grid").checked, I);
    const O = M.cloneNode(!0);
    d?.cleanExport(O), O.setAttribute("width", C.w), O.setAttribute("height", C.h), O.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`), qe(O, z(), V("show-grid").checked, C), b = new XMLSerializer().serializeToString(O), V("source").value = b;
  }, B = function(M) {
    const a = V("example-info");
    if (a && (a.replaceChildren(), !!M && (a.append(document.createTextNode(M.description + " ")), M.url))) {
      const i = document.createElement("a");
      i.href = M.url, i.target = "_blank", i.rel = "noopener noreferrer", i.textContent = M.reference, a.append(i);
    }
  }, q = function() {
    d.invalidate(), H.setEnabled(!1), s = null, c = null, b = "", D(), B(Object.values(De).find((M) => M.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, X = function(M) {
    for (const a of M) {
      const i = JSON.stringify([a.severity, a.line, a.message, a.source]);
      r.has(i) || (r.add(i), o.append({ ...a, category: "Parser / rendering" }));
    }
  }, J = function() {
    !A && b && x.set(E, { ...I }), e.querySelector("svg")?.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`);
    const M = e.querySelector("svg");
    M && qe(M, z(), V("show-grid").checked, I), V("zoom-level").textContent = Math.round(C.w / I.w * 100) + "%";
  }, Z = function(M, a = I.x + I.w / 2, i = I.y + I.h / 2) {
    if (!e.querySelector("svg")) return;
    const u = Math.max(0.05, Math.min(10, I.w * M / C.w)) * C.w / I.w;
    I = { x: a + (I.x - a) * u, y: i + (I.y - i) * u, w: I.w * u, h: I.h * u }, J();
  }, pe = function(M) {
    const a = new URLSearchParams();
    M && a.set("instance", M);
    const i = a.toString();
    location.hash.slice(1) === i ? (E = M, ue()) : location.hash = i;
  }, ee = function() {
    E = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, de = function() {
    const M = !!(w && w !== E && m?.contexts[w]);
    V("selection-actions").hidden = !M, V("open-instance").href = "#" + new URLSearchParams({ instance: w });
  }, Ee = function() {
    V("breadcrumbs").replaceChildren();
    const M = (i, u) => {
      const g = document.createElement("button");
      g.type = "button", g.textContent = i, g.onclick = () => pe(u), g.disabled = u === E, V("breadcrumbs").append(g);
    };
    if (M("Top", ""), E) {
      const i = m.contexts[E].path;
      for (let u = 0; u < i.length; u++) M(i[u], i.slice(0, u + 1).map(encodeURIComponent).join("/"));
    }
    V("instances").replaceChildren();
    const a = (i, u) => {
      for (const g of i.children) {
        const S = document.createElement("div");
        S.className = "spice-instance-row", S.style.setProperty("--depth", Math.min(u, 8)), S.dataset.instance = g.id;
        const O = document.createElement("a");
        O.href = "#" + new URLSearchParams({ instance: g.id }), O.textContent = g.name + " · " + g.definition, O.title = "Open " + g.id + " as its own sheet";
        const G = document.createElement("span");
        if (G.className = "spice-help", G.textContent = Object.entries(g.params).map(([j, Q]) => j + "=" + Q).join(" · "), S.append(O), G.textContent) {
          const j = document.createElement("details"), Q = document.createElement("summary");
          Q.textContent = "Parameters", j.append(Q, G), S.append(j);
        }
        V("instances").append(S), a(g, u + 1);
      }
    };
    a(m.contexts[E], 0), V("hierarchy-panel").hidden = !m.contexts[E].children.length, V("focus-title").textContent = E ? E + " / " + m.contexts[E].definition : "Top-level schematic", de();
  };
  Xr(me), sr(me);
  const t = V("input"), e = V("preview"), n = V("status"), o = ao(V);
  let r = /* @__PURE__ */ new Set(), s = null, c = null, f = !1, d = null, p = null, v = [], b = "", h, m, _, N = "", E = "", w = "", A = !1, I = { x: 0, y: 0, w: 1, h: 1 }, C = { ...I }, T, k = !1, U = {}, x = /* @__PURE__ */ new Map(), y = !1;
  try {
    U = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  me.addEventListener("click", (M) => {
    A && M.target.closest('a[href^="#"]') && M.preventDefault();
  });
  const D = () => {
    V("upload").disabled = A || y || f, V("download-project").disabled = V("open-download").disabled = V("copy").disabled = V("download").disabled = !b || A || y || d?.working(), V("download-asc").disabled = V("download-asc-bundle").disabled = !b || !s || A || f || !d?.complete();
  }, F = () => ({ font: V("font").value, fontSize: Number(V("size").value), color: bt, gridSize: V("grid").checked && V("conventional").checked ? ht : 0, detailed: V("detailed").checked, conventional: V("conventional").checked }), z = () => h?.layout.report?.gridSize ? Number(V("grid-size").value) : 0, H = ir(V, (M, a) => {
    p = M, v = a, $();
  });
  d = br(e, V, { report: o.append, getNetColor: (M) => {
    const a = v.find((i) => i.bit === M);
    return a && p && (p.auto || p.manual.has(a.name)) ? p.color(a.name) : null;
  }, inspect: (M, a) => {
    const i = h?.components.find((u) => u.name === M);
    if (i)
      w = i.instanceId || "", V("selection").textContent = i.raw, de();
    else if (a?.decoration) {
      w = "";
      const u = Object.values(h.nodes).find((g) => g.bit === a.ports[0]?.bit);
      V("selection").textContent = "Ground symbol · " + (u?.displayName || "0"), de();
    }
  }, changed: (M, a, i) => {
    s = M, c = null, C = i;
    const u = e.querySelector("svg");
    if (u) {
      u.setAttribute("width", String(C.w)), u.setAttribute("height", String(C.h));
      const g = u.querySelector("#spice-layout-report");
      if (g) {
        const S = JSON.parse(g.textContent);
        S.manualWiring = a, S.verifiedTerminals = !a.unrouted, S.geometricConnectivityVerified = !a.unrouted, g.textContent = JSON.stringify(S);
      }
    }
    h && _ && (V("json").value = JSON.stringify({ circuit: h, netlist: Fe(h), hierarchy: _, interactive: { ...a, drawing: M } }, null, 2)), $(), D();
  } }), V("show-grid").onchange = $, V("grid-size").onchange = () => {
    $(), J();
  };
  async function L() {
    (!s || !h?.layout.report?.gridVerified) && (V("grid").checked = !0, V("conventional").checked = !0, await ue({ resetEditor: !0 })), d.setEnabled(V("interactive").checked), D();
  }
  V("interactive").onchange = L, V("label-edit").onclick = async () => {
    V("interactive").checked = !0, await L(), d.setLabelEditing(!d.labelEditing()), e.focus({ preventScroll: !0 });
  }, V("group").onclick = () => {
    d.toggleGroup(), e.focus({ preventScroll: !0 });
  }, V("flywire").onchange = async () => {
    V("interactive").checked = !0, await L(), V("flywire").checked ? d.clear() : await d.autoRoute(), D();
  }, V("auto-route").onclick = async () => {
    V("interactive").checked = !0, await L(), await d.autoRoute(), D();
  }, V("wire-undo").onclick = () => d.undo(), V("wire-redo").onclick = () => d.redo();
  for (const M of me.querySelectorAll("[data-editor-mode]")) M.onclick = async () => {
    V("interactive").checked = !0, await L(), d.chooseTool(M.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const M of me.querySelectorAll("[data-editor-arrange]")) M.onclick = () => {
    d.arrange(M.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  H.setEnabled(!1), t.value = Bt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Bt;
  } catch {
  }
  B(Object.values(De).find((M) => M.source === t.value)), t.addEventListener("input", q);
  for (const M of ["font", "size", "detailed", "conventional", "grid"]) V(M).addEventListener("input", q);
  new ResizeObserver(() => {
    const M = e.querySelector("svg");
    M && qe(M, z(), V("show-grid").checked, I);
  }).observe(e), V("zoom-in").onclick = () => Z(0.8), V("zoom-out").onclick = () => Z(1.25), V("fit").onclick = () => {
    I = { ...C }, J();
  };
  const fe = (M) => {
    const a = e.querySelector("svg");
    return a ? new DOMPoint(M.clientX, M.clientY).matrixTransform(a.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (M) => {
    const a = fe(M);
    a && (M.preventDefault(), Z(M.deltaY > 0 ? 1.12 : 1 / 1.12, a.x, a.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (M) => {
    ![0, 1].includes(M.button) || !e.querySelector("svg") || (T = { start: fe(M), x: M.clientX, y: M.clientY, view: { ...I }, moved: !1 }, e.setPointerCapture(M.pointerId));
  }), e.addEventListener("pointermove", (M) => {
    if (!T) return;
    const a = fe(M);
    Math.hypot(M.clientX - T.x, M.clientY - T.y) > 4 && (T.moved = !0), I.x += T.start.x - a.x, I.y += T.start.y - a.y, J();
  }), e.addEventListener("pointerup", (M) => {
    if (!T) return;
    const a = T.moved;
    if (T = null, e.hasPointerCapture(M.pointerId) && e.releasePointerCapture(M.pointerId), !a && !d?.labelEditing()) {
      const i = document.elementFromPoint(M.clientX, M.clientY)?.closest("[data-component]"), u = h?.components.find((g) => g.name === i?.dataset.component);
      u && (w = u.instanceId || "", V("selection").textContent = `${u.raw}
${Object.entries(u.terminals).map(([g, S]) => `${g} → ${S}`).join("   ")}`, u.kind === "X" ? pe(u.instanceId) : de());
    }
  }), window.addEventListener("hashchange", () => {
    if (A) {
      k = !0;
      return;
    }
    ee(), w = "", ue();
  }), e.addEventListener("pointercancel", () => {
    T = null;
  }), e.addEventListener("keydown", (M) => {
    const a = M.target.closest("[data-instance]");
    if (a && !d?.labelEditing() && (M.key === "Enter" || M.key === " ")) {
      M.preventDefault(), w = a.dataset.instance, pe(w);
      return;
    }
    M.key === "+" || M.key === "=" ? Z(0.8) : M.key === "-" ? Z(1.25) : M.key.toLowerCase() === "f" ? (I = { ...C }, J()) : M.key.startsWith("Arrow") && (M.preventDefault(), I.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[M.key] || 0) * I.w, I.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[M.key] || 0) * I.h, J());
  });
  async function ue({ resetEditor: M = !1 } = {}) {
    if (A) return;
    r = /* @__PURE__ */ new Set(), A = !0, d.invalidate(), H.setEnabled(!1), s = null, c = null, b = "", D(), V("generate").disabled = !0, t.readOnly = !0, V("file").disabled = !0, V("libraries").disabled = !0;
    for (const i of me.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) i.disabled = !0;
    l("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let a = [];
    try {
      if (N !== t.value || !m) {
        if (N && N !== t.value && (d.clearSheets(), x.clear()), _ = Nt(t.value, { files: U }), a = [..._.diagnostics], a.some((R) => R.severity === "error"))
          throw m = null, Error("Fix the parser errors below before generating.");
        m = $e(_), N && N !== t.value ? (E = "", w = "", history.replaceState(null, "", location.pathname + location.search)) : ee(), N = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (a = [..._.diagnostics], X(a), a.some((R) => R.severity === "error")) throw Error("Fix the parser errors below before generating.");
      h = Ge(m, { focus: E });
      for (const R of h.interfaceAliases) a.push({ severity: "info", message: `Instance boundary: ${R.ports.join(" = ")} share parent node ${R.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const i = Fe(h);
      F().conventional && a.push(...h.layout.diagnostics);
      const u = await tt(i, F()), g = new DOMParser().parseFromString(u.svg, "image/svg+xml");
      if (g.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const S = g.documentElement, O = S.querySelector("#spice-layout-report");
      if (O) {
        h.layout.report = JSON.parse(O.textContent);
        const R = h.layout.report;
        if (a.push({ severity: "info", message: `Layout: compact signal flow; ${R.powerSourcesChecked} DC/ground symbols checked, ${R.powerOrderViolations} DC order preference(s) unmet. ${R.powerPass}. ${R.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), R.classicTemplateFallback && a.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), R.groundPlacement && a.push({ severity: "info", message: `Ground: ${R.groundPlacement}; ${R.straightenedGroundDrops || 0} return-path simplification(s).` }), R.explicitGroups && a.push({ severity: "info", message: `Layout comments: ${R.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), R.classicRails && a.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${R.railCount} shared voltage rails.` }), R.localClassicInstances?.length && a.push({ severity: "info", message: `${R.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), R.localClassicStages?.length && a.push({ severity: "info", message: `Classic transistor proximity active: ${R.localClassicStages.join(", ")}.` }), R.sharedClassicRails && a.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), R.mirroredTransistors?.length && a.push({ severity: "info", message: `Control-pin mirror choices: ${R.mirroredTransistors.join(", ")}.` }), R.recognizedMotifs?.length && a.push({ severity: "info", message: `Transistor structures: ${R.recognizedMotifs.map((K) => `${K.kind} (${K.members.join(", ")}; ${K.confidence})`).join("; ")}.` }), R.appliedMotifs?.length && a.push({ severity: "info", message: `Topology preferences applied to ${R.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), R.subnetFirstFallback && a.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + R.subnetFirstFallback }), R.pairCompactionFallback && a.push({ severity: "warning", message: "Pair proximity kept the original regions: " + R.pairCompactionFallback }), R.compoundPairFallback && a.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + R.compoundPairFallback }), R.pairConstraints?.length) {
          const K = R.pairConstraints.filter((oe) => oe.crossRegion && !oe.compacted).length;
          a.push({ severity: "info", message: `${R.pairConstraints.length - K} adjacent transistor pair(s); ${K} cross-region mirror row constraint(s).` });
        }
        R.netShortcuts && a.push({ severity: "info", message: `${R.netShortcuts} safe straight net shortcut(s); ${R.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), R.sharedRailFallback && a.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${R.sharedRailFallback}.` });
        for (const K of R.localClassicFallbacks || []) K.stage && a.push({ severity: "info", message: `Classic stage ${K.stage} uses automatic layout: ${K.reason || "No unobstructed local template"}.` });
        R.geometricConnectivityVerified && a.push({ severity: "info", message: `Net geometry verified; ${R.cyclesRemoved} same-net loop(s) and ${R.leavesRemoved} unused wire branch(es) removed.` }), X(a);
      }
      if (S.localName !== "svg" || S.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const G = Number(S.getAttribute("width")), j = Number(S.getAttribute("height")), Q = JSON.parse(S.getAttribute("data-label-bounds") || "null");
      C = { x: Math.min(-20, (Q?.x ?? 0) - 20), y: Math.min(-20, (Q?.y ?? 0) - 20) }, C.w = Math.max(G, Q?.right || 0) + 20 - C.x, C.h = Math.max(j, Q?.bottom || 0) + 20 - C.y, I = { ...C }, S.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`), S.setAttribute("width", String(C.w)), S.setAttribute("height", String(C.h)), S.setAttribute("role", "img"), S.setAttribute("aria-label", h.title || "SPICE schematic"), S.setAttribute("style", "background:white");
      for (const R of h.components) {
        const K = g.getElementById("cell_" + R.name);
        if (!K) throw Error("Renderer omitted component " + R.name);
        K.setAttribute("data-component", R.name), R.kind === "X" && (K.setAttribute("data-instance", R.instanceId), K.setAttribute("role", "button"), K.setAttribute("tabindex", "0"), K.setAttribute("aria-label", "Open " + R.name));
        const oe = g.createElementNS(S.namespaceURI, "title");
        oe.textContent = R.raw + `
Resolved: ` + R.value + `
` + Object.entries(R.terminals).map(([be, _e]) => be + ": " + _e).join(", "), K.prepend(oe);
      }
      for (const R of Object.values(h.nodes))
        for (const K of S.querySelectorAll(".net_" + R.bit)) {
          K.setAttribute("data-net", R.name);
          const oe = g.createElementNS(S.namespaceURI, "title");
          oe.textContent = "Node " + R.displayName, K.append(oe);
        }
      const Y = h.components.filter((R) => R.kind === "K").map((R) => ({ name: R.name, inductors: R.coupledInductors, value: R.value }));
      if (Y.length) {
        const R = g.createElementNS(S.namespaceURI, "metadata");
        R.setAttribute("id", "spice-magnetic-couplings"), R.textContent = JSON.stringify(Y), S.append(R);
        for (const K of Y) for (const oe of K.inductors) {
          const be = g.getElementById("cell_" + oe);
          if (!be) continue;
          const _e = g.createElementNS(S.namespaceURI, "circle"), Ze = [...be.children].find((Je) => Je.getAttribute("s:pid") === "A"), nn = Ze?.getAttribute("s:position"), yt = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[nn] || [0, 0];
          for (const [Je, rn] of Object.entries({ cx: Number(Ze?.getAttribute("s:x")) + yt[0], cy: Number(Ze?.getAttribute("s:y")) + yt[1], r: 3, fill: F().color, stroke: "none", "data-coupling": K.name })) _e.setAttribute(Je, String(rn));
          const wt = g.createElementNS(S.namespaceURI, "title");
          wt.textContent = K.name + " · dotted terminal: " + K.inductors.join(", "), _e.append(wt), be.append(_e);
        }
      }
      s = u.drawing, b = new XMLSerializer().serializeToString(S), V("source").value = b, e.replaceChildren(document.importNode(S, !0)), J();
      const W = a.filter((R) => R.severity === "warning").length;
      n.textContent = `${h.components.filter((R) => !R.synthetic).length} components · ${Object.keys(h.nodes).length} nodes · ${h.topology.leafCount} primitive devices verified${h.interfaceAliases.length ? " · Parent-connected ports: " + h.interfaceAliases.map((R) => R.ports.join(" = ")).join("; ") + "." : ""}${W ? " · Review " + W + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Ve}.`, h.layout.report?.gridVerified && (n.textContent += ` Grid ${h.layout.report.gridSize}.`), h.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${h.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), h.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), o.append({ message: n.textContent, category: "Rendering", severity: W ? "warning" : "info" }), V("json").value = JSON.stringify({ circuit: h, netlist: i, hierarchy: _ }, null, 2), H.setCircuit(h, t.value), d.mount(e.querySelector("svg"), s, h, i, F(), { reset: M, scope: E }), $(), !M && x.has(E) ? I = { ...x.get(E) } : x.set(E, { ...I }), J(), V("selection").textContent = "Click a component to inspect its original statement and pin connections.", Ee();
    } catch (i) {
      if (e.replaceChildren(), b = "", V("source").value = "", V("json").value = "", V("nets").replaceChildren(), V("selection").textContent = "", l(i.message, { severity: "error" }), !m)
        V("hierarchy-panel").hidden = !0, V("selection-actions").hidden = !0, V("breadcrumbs").replaceChildren();
      else if (!m.contexts[E]) {
        const u = document.createElement("button");
        u.type = "button", u.textContent = "Return to Top", u.onclick = () => pe(""), V("breadcrumbs").replaceChildren(u);
      }
      H.setCircuit(null, t.value), i.diagnostics && (a = i.diagnostics), a.some((u) => u.severity === "error") || a.push({ severity: "error", line: 0, message: i.message }), X(a);
    } finally {
      A = !1, V("generate").disabled = !1, t.readOnly = !1, V("file").disabled = !1, V("libraries").disabled = !1;
      for (const i of me.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) i.disabled = !1;
      m && m.contexts[E] && Ee(), H.setEnabled(!!b), d.refreshControls(), e.setAttribute("aria-busy", "false"), D(), k && (k = !1, ee(), queueMicrotask(ue));
    }
  }
  V("generate").onclick = () => ue({ resetEditor: !0 });
  for (const M of me.querySelectorAll("[data-example]")) M.onclick = () => {
    const a = De[M.dataset.example];
    t.value = a.source, q(), B(a), ue();
  };
  V("file").onchange = async (M) => {
    const a = M.target.files[0];
    if (a) {
      if (A || y) {
        M.target.value = "";
        return;
      }
      try {
        const i = /\.(spiceproj|json)$/i.test(a.name);
        if (a.size > (i ? Kt : 2e6)) throw Error(i ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        i ? await Te(await a.text()) : (t.value = await At(a), q(), await ue());
      } catch (i) {
        l("File could not be opened: " + i.message, { severity: "error", category: "Files" });
      } finally {
        M.target.value = "", D();
      }
    }
  };
  async function Te(M) {
    y = !0, D();
    const a = me.inert;
    me.inert = !0;
    try {
      const i = Zt(M), u = Nt(i.source, { files: i.libraries });
      if (u.diagnostics.some((S) => S.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const g = $e(u);
      if (!g.contexts[i.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const S of i.sheets) {
        if (!g.contexts[S.scope]) throw Error("Unknown saved sheet: " + S.scope);
        const O = Ge(g, { focus: S.scope });
        if (O.topology.signature !== S.topology) throw Error("Saved topology differs from the netlist: " + (S.scope || "Top"));
        const G = new Map(O.components.filter((W) => W.kind !== "K").map((W) => [W.name, W]));
        for (const W of S.snapshot.components) {
          if (W.decoration) continue;
          const R = G.get(W.id);
          if (!R || W.ports.length !== Object.keys(R.terminals).length || W.ports.some((K) => O.nodes[R.terminals[K.pin]]?.bit !== K.bit)) throw Error("Saved pin connectivity differs from the netlist: " + W.id);
          G.delete(W.id);
        }
        if (G.size) throw Error("Saved sheet omits components.");
        l("Checking saved sheet " + (S.scope || "Top") + "…", { category: "Files" });
        const j = Fe(O), Q = await tt(j, S.settings), Y = new DOMParser().parseFromString(Q.svg, "image/svg+xml").documentElement;
        for (const W of Object.values(O.nodes)) for (const R of Y.querySelectorAll(".net_" + W.bit)) R.setAttribute("data-net", W.name);
        zt(Y, S.snapshot.labelOverrides), en(tn(Y, Q.drawing, O, j), S.snapshot, S.settings.gridSize);
      }
      i.sheets.some((S) => S.scope === i.focus && JSON.stringify(S.settings) === JSON.stringify(i.settings)) || (l("Checking current sheet…", { category: "Files" }), await tt(Fe(Ge(g, { focus: i.focus })), i.settings)), d.invalidate(), d.restoreSheets(i.sheets), x = new Map(i.sheets.filter((S) => S.view).map((S) => [S.scope, S.view])), x.set(i.focus, i.view), t.value = i.source, U = i.libraries, m = g, _ = u, N = i.source, E = i.focus, w = "";
      for (const S of ["font", "size"]) V(S).value = S === "font" ? i.settings.font : i.settings.fontSize;
      for (const [S, O] of Object.entries({ detailed: i.settings.detailed, conventional: i.settings.conventional, grid: !!i.settings.gridSize, "show-grid": i.showGrid, interactive: i.interactive, flywire: i.flywire })) V(S).checked = O;
      V("grid-size").value = i.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (E ? "#" + new URLSearchParams({ instance: E }) : "")), H.restore(i.colors), B(Object.values(De).find((S) => S.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(U)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      V("library-status").textContent = Object.keys(U).length + " project library file(s) loaded", await ue(), b && (d.setLabelEditing(i.labelEditing === !0), n.textContent += " Project restored.", o.append({ message: "Project restored.", category: "Files" }));
    } finally {
      me.inert = a, y = !1, D();
    }
  }
  V("libraries").onchange = async (M) => {
    try {
      for (const a of M.target.files) {
        if (a.size > 16e6) throw Error("Library exceeds 16 MB: " + a.name);
        U[a.webkitRelativePath || a.name] = await At(a);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(U));
      } catch {
      }
      d.invalidate(), d.clearSheets(), x.clear(), m = null, N = "", V("library-status").textContent = Object.keys(U).length + " library file(s) loaded", ue();
    } catch (a) {
      l(a.message, { severity: "error", category: "Files" });
    } finally {
      M.target.value = "";
    }
  }, V("library-status").textContent = Object.keys(U).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const le = V("download-dialog");
  me.addEventListener("spice:workspacechange", () => {
    le.open && le.close();
  }), V("open-download").onclick = () => {
    D(), le.showModal();
  }, V("close-download").onclick = () => le.close(), le.addEventListener("click", (M) => {
    if (M.target !== le) return;
    const a = le.getBoundingClientRect();
    (M.clientX < a.left || M.clientX > a.right || M.clientY < a.top || M.clientY > a.bottom) && le.close();
  }), document.addEventListener("keydown", (M) => {
    le.open && !(M.altKey && M.key === "Escape") && (M.stopImmediatePropagation(), M.key === "Escape" && (M.preventDefault(), le.close()));
  }, { capture: !0 }), V("upload").onclick = () => V("file").click(), V("download-project").onclick = () => {
    try {
      const M = d.snapshotSheets().filter((g) => m?.contexts[g.scope] && Ge(m, { focus: g.scope }).topology.signature === g.topology).map((g) => ({ ...g, ...x.has(g.scope) ? { view: x.get(g.scope) } : {} })), a = hr({ source: t.value, libraries: U, settings: F(), displayGridStep: Number(V("grid-size").value), showGrid: V("show-grid").checked, interactive: V("interactive").checked, flywire: V("flywire").checked, labelEditing: d.labelEditing(), focus: E, view: { ...I }, colors: H.snapshot(), sheets: M });
      le.close();
      const i = URL.createObjectURL(new Blob([a], { type: "application/json;charset=utf-8" })), u = document.createElement("a");
      u.href = i, u.download = "spice-schematic.spiceproj", u.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3), l("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (M) {
      l("Project save failed: " + M.message, { severity: "error", category: "Files" });
    }
  }, V("download").onclick = () => {
    le.close();
    const M = URL.createObjectURL(new Blob([b], { type: "image/svg+xml;charset=utf-8" })), a = document.createElement("a");
    a.href = M, a.download = "spice-schematic.svg", a.click(), setTimeout(() => URL.revokeObjectURL(M), 1e3), l("SVG downloaded.", { category: "Export" });
  };
  async function xe(M) {
    const a = s;
    if (!(!a || A || f)) {
      f = !0, D(), l("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: i } = await import("./asc-export-BdMrB3Ud.js");
        if (s !== a) throw Error("Schematic changed. Generate again before exporting ASC.");
        c ||= i({ tree: m, circuit: h, drawing: a, source: t.value, libraries: U });
        const u = M ? c.zip : c.ascBytes, g = URL.createObjectURL(new Blob([u], { type: M ? "application/zip" : "application/octet-stream" })), S = document.createElement("a");
        S.href = g, S.download = M ? "spice-schematic-asc.zip" : "spice-schematic.asc", S.click(), setTimeout(() => URL.revokeObjectURL(g), 1e3), n.textContent = "ASC connections verified · " + c.manifest.audit.symbols + " symbols. " + (M ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), c.manifest.warnings.length && (n.textContent += " " + c.manifest.warnings.join(" ")), o.append({ message: n.textContent, category: "Export", severity: c.manifest.warnings.length ? "warning" : "info" });
      } catch (i) {
        l("ASC export failed: " + i.message, { severity: "error", category: "Export" });
      } finally {
        f = !1, D();
      }
    }
  }
  V("download-asc").onclick = () => {
    le.close(), xe(!1);
  }, V("download-asc-bundle").onclick = () => {
    le.close(), xe(!0);
  }, V("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(b), l("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      V("source-details").open = !0, V("source").focus(), V("source").select(), l("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, ue();
}
export {
  dt as b,
  $e as e,
  Re as l,
  ct as n,
  kn as p
};
