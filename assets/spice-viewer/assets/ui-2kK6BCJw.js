const an = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ln = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, cn = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, dn = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, un = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, fn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, pn = { 1: "a", 2: "b", 7: "Q", 8: "com" }, hn = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, mn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, gn = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, bn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, yn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, wn = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, xn = {
  AND: an,
  BUF: ln,
  COUNTER: cn,
  DFLOP: dn,
  SCHMITT: un,
  OR: fn,
  PHASEDET: pn,
  SRFLOP: hn,
  XOR: mn,
  MODULATOR: gn,
  OTA: bn,
  SAMPLEHOLD: yn,
  VARISTOR: wn
}, vn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Ue = (t) => t.toLowerCase(), It = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), En = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Nn(t, e) {
  const n = (N) => e[Ue(N || "")] || Object.entries(e).find(([b]) => b.startsWith(Ue(N || "") + "."))?.[1], s = t[0][0].toUpperCase();
  let o = [], l = [], p = "", r = "", d = [], c = [], u = 0, x = "", g = "", f = "", m = !0;
  if ("RLC".includes(s))
    o = ["A", "B"], r = Ue(s) + "_v";
  else if ("DVIB".includes(s))
    o = ["+", "-"], r = s === "D" ? "d_v" : s === "B" ? "spice_b" : Ue(s);
  else if (s === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !It(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), p = t[o.length + 1] || "";
    const N = n(p)?.type;
    m = ["NPN", "PNP"].includes(N), r = m ? (o.length === 3 ? "q_" : "spice_q4_") + Ue(N) : "spice_q" + o.length;
  } else if (s === "M") {
    const N = n(t[4]), b = n(t[5]), y = N?.type === "VDMOS" || !b && (!t[5] || It(t[5]));
    o = y ? ["D", "G", "S"] : ["D", "G", "S", "B"], p = t[o.length + 1] || "";
    const I = n(p), C = I?.type;
    if (y && I && C !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!y && C === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    m = ["NMOS", "PMOS", "VDMOS"].includes(C);
    let T = null, _ = I;
    const M = /* @__PURE__ */ new Set();
    for (; _ && !M.has(_.name) && (M.add(_.name), T = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(_.raw), !T); )
      _ = n(_.baseModel);
    const D = C === "PMOS" || C === "VDMOS" && T && (T[1] === void 0 || Number(T[1]) >= 0.5);
    r = m ? "spice_" + (D ? "pmos" : "nmos") + (y ? "3" : "") : "spice_m";
  } else if ("JZ".includes(s)) {
    p = t[4] || "";
    const N = n(p)?.type, b = s === "Z" && ["NIGBT", "PIGBT"].includes(N);
    o = b ? ["C", "G", "E"] : ["D", "G", "S"], m = s === "J" ? ["NJF", "PJF"].includes(N) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(N), r = "spice_" + (b ? "igbt" : s === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(N || "") ? "p" : "n");
  } else if ("EFGH".includes(s)) {
    o = ["+", "-"], r = "spice_" + Ue(s);
    let N = 3, b = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[N] || "");
    if (/^poly$/i.test(t[N] || "") && (b = /^\(\s*(\d+)\s*\)$/.exec(t[++N] || ""), !b))
      throw Error("POLY requires a dimension.");
    if (b) {
      const y = Number(b[1]);
      if (y > 128) throw Error("POLY supports at most 128 controlling variables.");
      let I = N + 1, C = [];
      const T = "EG".includes(s), _ = y * (T ? 2 : 1);
      for (; C.length < _ && I < t.length; ) C.push(...En(t[I++]));
      if (C.length !== _ || I >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (T) {
        for (let M = 0; M < y; M++) o.push("C" + (M + 1) + "+", "C" + (M + 1) + "-");
        l = [t[1], t[2], ...C];
      } else d = C;
      u = I, x = "POLY(" + y + ") " + (T ? "" : C.join(" ") + " "), g = "POLY", T && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? g = "BEHAVIORAL" : "EG".includes(s) ? (o.push("C+", "C-"), g = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (d = [t[3]], u = 4, x = t[3] + " ");
    f = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[s] + (g ? " · " + g : "");
  } else if (s === "S")
    o = ["A", "B", "C+", "C-"], p = t[5] || "", r = "spice_device", f = "Voltage switch";
  else if (s === "W")
    o = ["A", "B"], d = [t[3]], p = t[4] || "", u = 3, r = "spice_device", f = "Current switch";
  else if ("TO".includes(s))
    o = ["L+", "L-", "R+", "R-"], s === "O" && (p = t[5] || ""), r = "spice_device", f = s === "T" ? "Transmission line" : "Lossy line";
  else if (s === "U")
    o = ["N1", "N2", "COM"], p = t[4] || "", r = "spice_device", f = "Distributed RC";
  else if (s === "A")
    o = Array.from({ length: 8 }, (N, b) => "P" + (b + 1)), r = "spice_device", f = t[9] || "A function";
  else if (s === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (c = t.slice(1, -1), c.some((N) => !/^L/i.test(N.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, r = "spice_coupling", f = "Magnetic coupling", x = c.join(" ") + " · k=";
  } else if (s === "@")
    o = ["IN", "OUT"], r = "spice_device", f = "FRA";
  else if (s === "&")
    o = ["O+", "O-", "I+", "I-"], r = "spice_device", f = "FRA probe";
  else if (s === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", f = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + s);
  if (u || (u = o.length + 1), l.length || (l = t.slice(1, o.length + 1)), l.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(s)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (l.some((N) => /[=()]/.test(N) && !/^\{[\s\S]*\}$/.test(N))) throw Error("Invalid terminal token; check terminal count.");
  if (s === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (s === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (r = "spice_br"), s === "D" && (p = t[3] || ""), s === "@") {
    const N = t.slice(u).join(" ");
    for (const b of N.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(b[1].toUpperCase()), l.push(b[2]);
  }
  if (s === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (d.some((N) => !N)) throw Error("Missing controlling voltage source.");
  const h = o.map((N, b) => s === "A" && xn[(t[9] || "").toUpperCase()]?.[String(b + 1)] || N);
  return { kind: s, pins: o, nodeTokens: l, pinLabels: h, model: p, type: r, controlSource: d[0] || "", controlSources: d, coupledInductors: c, value: x + t.slice(u).join(" "), sourceMode: g, symbol: f, polarityKnown: m };
}
const Sn = vn, _n = new Set(Sn.split(" ")), dt = () => /* @__PURE__ */ Object.create(null), Ne = (t) => t.toLowerCase();
function nt(t) {
  const e = [], n = [];
  let s = "", o = 0, l = "";
  for (let p = 0; p < t.length; p++) {
    const r = t[p];
    if (l) {
      s += r, r === l && t[p - 1] !== "\\" && (l = "");
      continue;
    }
    if (r === '"' || r === "'") {
      l = r, s += r;
      continue;
    }
    if (!o && (r === ";" || r === "$" && (!p || /\s/.test(t[p - 1])))) break;
    if ("({".includes(r) && (n.push(r), o++), ")}".includes(r) && (o--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !o ? (s && e.push(s), s = "") : s += r;
  }
  if (o || l) throw Error("Unclosed expression or quoted string.");
  return s && e.push(s), e;
}
function Cn(t, e = {}) {
  const n = [], s = [], o = [], l = Object.assign(dt(), e.models), p = dt(), r = (b, y, I) => n.push({ severity: b, line: y, message: I });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const d = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, y) => {
    const I = b.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? d.length ? d.at(-1).text += " " + I.slice(1).trim() : r("error", y + 1, "Continuation has no preceding statement.") : d.push({ line: y + 1, text: I }));
  });
  for (const b of d) {
    try {
      b.tokens = nt(b.text);
    } catch (I) {
      r("error", b.line, I.message), b.tokens = [];
    }
    const y = b.tokens;
    if (/^\.model$/i.test(y[0] || ""))
      if (y.length < 3) r("error", b.line, ".model requires a name and device type.");
      else {
        const I = /^ako:(.+)$/i.exec(y[2]), C = I && y[3] && !y[3].startsWith("(") ? y[3].split("(")[0].toUpperCase() : "";
        l[Ne(y[1])] = { name: y[1], type: I ? C : y[2].split("(")[0].toUpperCase(), baseModel: I?.[1] || "", raw: b.text };
      }
  }
  const c = /* @__PURE__ */ new Set();
  function u(b) {
    const y = l[Ne(b)];
    if (!y) return "";
    if (y.type) return y.type;
    if (c.has(Ne(b))) throw Error("Circular AKO model inheritance: " + b);
    return c.add(Ne(b)), y.type = u(y.baseModel), c.delete(Ne(b)), y.type;
  }
  for (const b of Object.values(l)) if (b.baseModel && !b.type)
    try {
      u(b.name);
    } catch (y) {
      r("error", 0, y.message);
    }
  let x = "", g = 0, f = !1, m = !1;
  const h = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: b, text: y, tokens: I } of d) {
    if (!I.length) continue;
    const C = Ne(I[0]);
    if (m) {
      r("warning", b, "Statement after .end is not rendered: " + y);
      continue;
    }
    if (C === ".control") {
      f = !0, r("warning", b, ".control script retained but not executed or rendered.");
      continue;
    }
    if (C === ".endc") {
      f = !1;
      continue;
    }
    if (f) continue;
    if (C === ".subckt") {
      g++, r("error", b, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (C === ".ends") {
      g ? g-- : r("error", b, "Unmatched .ends.");
      continue;
    }
    if (g) continue;
    if (C === ".end") {
      m = !0;
      continue;
    }
    if (C.startsWith(".")) {
      s.push({ line: b, text: y }), C === ".title" ? x = I.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(C) ? r("error", b, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(C) ? r("error", b, "Topology-changing directive is unsupported: " + y) : N.has(C) || r("warning", b, "Directive retained but not resolved: " + y);
      continue;
    }
    const T = I[0][0].toUpperCase();
    if (!_n.has(T)) {
      b === 1 && !/\d/.test(I[0]) && I.length > 1 && T !== "X" ? (x = y, r("warning", b, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", b, `Unsupported ${T} device was not rendered: ${y}`);
      continue;
    }
    const _ = T === "M" || T === "Q" ? 5 : 4;
    if (b === 1 && !/\d/.test(I[0]) && (I.length < _ || T === "T" && !/\b(?:zo|z0)\s*=/i.test(y))) {
      x = y, r("info", b, "SPICE title: " + y);
      continue;
    }
    try {
      if (h.has(C)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const M = Nn(I, l), { pins: D, nodeTokens: E, ...w } = M;
      M.polarityKnown || r("warning", b, `${I[0]}: model polarity unknown; explicit ${D.join("/")} terminals retained.`);
      const B = dt();
      D.forEach((W, z) => {
        const $ = Ne(E[z]);
        p[$] || (p[$] = { name: $, displayName: I[z + 1], bit: Object.keys(p).length + 2, terminals: [] }), p[$].terminals.push({ component: I[0], pin: W }), B[W] = $;
      }), o.push({ ...w, name: I[0], terminals: B, line: b, raw: y }), h.add(C);
    } catch (M) {
      r("error", b, `${I[0]}: ${M.message} Statement: ${y}`);
    }
  }
  g && r("error", 0, "Unclosed .subckt definition."), f && r("error", 0, "Unclosed .control block."), o.length || r("error", 0, "No supported components to render."), o.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const b of o) {
    for (const y of b.controlSources || []) !y.includes(":") && !o.some((I) => Ne(I.name) === Ne(y) && I.kind === "V") && r("error", b.line, `${b.name}: controlling voltage source ${y} was not found.`);
    for (const y of b.coupledInductors || []) !y.includes(":") && !o.some((I) => Ne(I.name) === Ne(y) && I.kind === "L") && r("error", b.line, `${b.name}: coupled inductor ${y} was not found.`);
    (b.kind === "B" || b.type === "spice_b") && r("info", b.line, `${b.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: x, components: o, nodes: p, models: l, directives: s, diagnostics: n };
}
const Le = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), kt = (t) => Le(t).split("/").at(-1);
function In(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const s = new Map(e instanceof Map ? e : Object.entries(e)), o = [], l = [], p = [];
  let r = 0;
  const d = (u, x) => {
    const g = Le(x).split("/").slice(0, -1).concat(Le(u)).join("/"), f = [...s].filter(([h]) => Le(h) === Le(u) || Le(h) === g);
    if (f.length === 1) return f[0];
    const m = [...s].filter(([h]) => kt(h) === kt(u));
    if (m.length !== 1) throw Error(m.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return m[0];
  };
  function c(u, x, g = "", f = []) {
    const m = Le(x) + ":" + g.toLowerCase();
    if (f.includes(m)) throw Error("Circular library include: " + [...f, m].join(" → "));
    if (f.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const h = [], N = /^\s*\.endl\b/im.test(u);
    let b = !g;
    const y = (C, T) => {
      if (r += C.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      p.push(C), l.push({ file: x, line: T + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((C, T) => {
      const _ = C.trim();
      if (/^\.lib\b/i.test(_) && N) {
        const M = nt(_);
        if (M.length === 2 && !/[.\\/]/.test(M[1])) {
          h.push(M[1].toLowerCase()), M[1].toLowerCase() === g.toLowerCase() && (b = !0), y("* Library section " + M[1], T);
          return;
        }
      }
      if (/^\.endl\b/i.test(_)) {
        h.pop(), y("* End library section", T);
        return;
      }
      if (g && h.length && !h.includes(g.toLowerCase())) {
        y("* Unselected library section", T);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(_))
        try {
          const M = nt(_);
          if (!M[1]) throw Error("Include requires a filename.");
          const [D, E] = d(M[1], x);
          y("* Included " + D, T), c(E, D, M[2] || "", [...f, m]);
        } catch (M) {
          o.push({ severity: "error", line: T + 1, source: x, message: M.message }), y("* Unresolved include", T);
        }
      else y(C, T);
    }), !b) throw Error("Library section " + g + " not found in " + x);
  }
  try {
    c(t, n);
  } catch (u) {
    o.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: p.join(`
`), origins: l, diagnostics: o };
}
function kn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), s = [0], o = [];
  t.split(/\r?\n/).forEach((r, d) => {
    const c = r.trim();
    /^\.subckt\b/i.test(c) && (s.push(d + 1), n.set(d + 1, [])), s.at(-1) ? n.get(s.at(-1)).push({ raw: r, line: d + 1 }) : e[d] = r, /^\.ends\b/i.test(c) && s.length > 1 && s.pop();
  });
  const l = At(Array.from({ length: t.split(/\r?\n/).length }, (r, d) => e[d] || "").join(`
`));
  o.push(...l.diagnostics);
  const p = /* @__PURE__ */ new Map();
  for (const [r, d] of n) {
    const c = At(d.map((u) => u.raw).join(`
`));
    p.set(r, c.layout), o.push(...c.diagnostics.map((u) => ({ ...u, line: d[u.line - 1]?.line || r })));
  }
  return { layout: l.layout, scopes: p, diagnostics: o };
}
function At(t) {
  const e = [], n = [];
  let s = !1, o = !1, l = 0;
  if (t.split(/\r?\n/).forEach((y, I) => {
    const C = y.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(C)) {
      (o || s) && e.push({ severity: "error", line: I + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(C) || e.push({ severity: "error", line: I + 1, message: "Expected @layout begin v1." }), o = !0, s = !0, l = I + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(C)) {
      s || e.push({ severity: "error", line: I + 1, message: "Unexpected @layout end." }), s = !1;
      return;
    }
    s && (C.startsWith("*") ? n.push(C.slice(1).trim()) : e.push({ severity: "error", line: I + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), s && e.push({ severity: "error", line: l, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const p = n.join(" "), r = p.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], d = [], c = [], u = [], x = [];
  let g = 0, f = 0, m = 10;
  const h = () => r[g++], N = () => {
    const y = h();
    if (!y || !/^[A-Za-z_@][\w./%:@-]*$/.test(y)) throw Error("Expected layout identifier, got " + y);
    return y;
  };
  function b(y) {
    if (d.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const I = y ? N() : "@row" + f++, C = h();
    if (!["row", "column", "classic"].includes(C)) throw Error("Expected row, column or classic.");
    if (h() !== "{") throw Error("Expected { after " + C);
    const T = { id: I, direction: C, members: [] };
    for (d.push(T); g < r.length && r[g] !== "}"; )
      r[g] === "group" ? (h(), T.members.push(b(!0))) : ["row", "column"].includes(r[g]) ? T.members.push(b(!1)) : T.members.push(N());
    if (h() !== "}") throw Error("Unclosed group " + I);
    if (!T.members.length) throw Error("Empty layout group " + I);
    return I;
  }
  try {
    for (; g < r.length; )
      if (r[g] === "group")
        h(), b(!0);
      else if (["row", "column"].includes(r[g])) b(!1);
      else if (r[g] === "face") {
        h();
        const E = N(), w = h();
        if (!["left", "right"].includes(w)) throw Error("Expected face left or right.");
        if (x.some((B) => B.device.toLowerCase() === E.toLowerCase())) throw Error("Duplicate face device.");
        x.push({ device: E, side: w });
      } else if (r[g] === "pair") {
        h();
        const E = h();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(E)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (h() !== "{") throw Error("Expected { after pair kind.");
        const w = [];
        for (; g < r.length && r[g] !== "}"; ) w.push(N());
        if (h() !== "}" || !w.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: E, members: w });
      } else if (r[g] === "priority-cap") {
        if (h(), m = Number(h()), !Number.isInteger(m) || m < 3 || m > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (h() === "place") {
        const E = N(), w = h(), B = N();
        if (!["left-of", "above"].includes(w)) throw Error("Expected left-of or above.");
        c.push({ a: E, relation: w, b: B });
      } else throw Error("Unknown layout instruction near " + r[g - 1]);
    const y = /* @__PURE__ */ new Set();
    for (const E of d) {
      const w = E.id.toLowerCase();
      if (y.has(w)) throw Error("Duplicate layout group " + E.id);
      y.add(w);
    }
    const I = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), T = new Map(d.map((E) => [E.id.toLowerCase(), E])), _ = (E) => {
      if (I.has(E)) throw Error("Circular layout group " + E);
      if (!C.has(E)) {
        I.add(E);
        for (const w of T.get(E).members) T.has(w.toLowerCase()) && _(w.toLowerCase());
        I.delete(E), C.add(E);
      }
    };
    for (const E of T.keys()) _(E);
    const M = /* @__PURE__ */ new Map();
    for (const E of c) {
      if (E.a.toLowerCase() === E.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      M.has(E.a.toLowerCase()) || M.set(E.a.toLowerCase(), []), M.get(E.a.toLowerCase()).push(E.b.toLowerCase());
    }
    I.clear(), C.clear();
    const D = (E) => {
      if (I.has(E)) throw Error("Circular place constraints.");
      if (!C.has(E)) {
        I.add(E);
        for (const w of M.get(E) || []) D(w);
        I.delete(E), C.add(E);
      }
    };
    for (const E of M.keys()) D(E);
  } catch (y) {
    e.push({ severity: "error", line: l, message: "Layout description: " + y.message });
  }
  return { layout: { version: 1, priorityCap: m, groups: d, relations: c, pairs: u, faces: x }, diagnostics: e };
}
function An(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let s = e.focus ? n : t.ir.layoutDescription;
  if (!s) return null;
  if (n) {
    const f = new Set(n.groups.map((h) => h.id.toLowerCase())), m = (h) => f.has(h.toLowerCase()) ? h : e.components.find((b) => b.synthetic && b.value.toLowerCase() === h.toLowerCase())?.name || e.focus + "/" + h;
    s = { ...n, groups: n.groups.map((h) => ({ ...h, members: h.members.map(m) })), relations: n.relations.map((h) => ({ ...h, a: m(h.a), b: m(h.b) })), faces: (n.faces || []).map((h) => ({ ...h, device: m(h.device) })), pairs: (n.pairs || []).map((h) => ({ ...h, members: h.members.map(m) })) };
  }
  const o = new Map(s.groups.map((f) => [f.id.toLowerCase(), f])), l = Object.values(t.contexts).flatMap((f) => f.devices.map((m) => m.name)), p = new Set([...Object.keys(t.contexts), ...l, ...e.components.map((f) => f.name)].map((f) => f.toLowerCase()));
  for (const f of o.values()) if (p.has((n ? e.focus + "/" + f.id : f.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + f.id);
  for (const f of o.values()) for (const m of f.members) if (!o.has(m.toLowerCase()) && !p.has(m.toLowerCase())) throw Error("Unknown @layout instance/device: " + m);
  for (const f of s.relations) for (const m of [f.a, f.b]) if (!o.has(m.toLowerCase()) && !p.has(m.toLowerCase())) throw Error("Unknown @layout place target: " + m);
  const r = (s.pairs || []).map((f) => ({ ...f, members: f.members.map((m) => {
    const h = e.components.find((N) => N.name.toLowerCase() === m.toLowerCase());
    if (!h || h.synthetic || h.block) throw Error("Unknown or non-visible @layout pair device: " + m);
    return h.name;
  }) })), d = (s.faces || []).map((f) => {
    const m = e.components.find((h) => h.name.toLowerCase() === f.device.toLowerCase());
    if (!m || !["Q", "M", "J", "Z"].includes(m.kind)) throw Error("Unknown or unsupported @layout face device: " + f.device);
    return { ...f, device: m.name };
  }), c = /* @__PURE__ */ new Map(), u = [], x = new Set(Object.keys(t.contexts).map((f) => f.toLowerCase()));
  for (const f of s.groups) {
    const m = [];
    for (const h of f.members) {
      if (o.has(h.toLowerCase())) {
        m.push({ group: h });
        continue;
      }
      for (const N of e.components) if (N.name.toLowerCase() === h.toLowerCase() || N.name.toLowerCase().startsWith(h.toLowerCase() + "/")) {
        if (c.has(N.name)) throw Error("Overlapping @layout membership: " + N.name);
        c.set(N.name, f.id), m.push({ cell: N.name, ...x.has(h.toLowerCase()) ? { instance: h } : {} });
      }
    }
    u.push({ id: f.id, direction: f.direction, members: m });
  }
  const g = /* @__PURE__ */ new Set();
  for (const f of u) for (const m of f.members) if (m.group) {
    const h = m.group.toLowerCase();
    if (g.has(h)) throw Error("Layout group has multiple parents: " + m.group);
    g.add(h);
  }
  return { version: 1, priorityCap: s.priorityCap, groups: u, relations: s.relations, pairs: r, faces: d };
}
const je = () => /* @__PURE__ */ Object.create(null), xe = (t) => t.toLowerCase();
function Wt(t) {
  const e = je();
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    if (/^params?:$/i.test(s)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(s);
    if (!o) throw Error("Expected named parameter assignment, got: " + s);
    const l = xe(o[1]);
    let p = o[2];
    if (p === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + l);
      p = r[1];
    }
    if (p || (p = t[++n]), !p || /^params?:$/i.test(p)) throw Error("Missing value for parameter " + l);
    if (Object.hasOwn(e, l)) throw Error("Duplicate parameter: " + l);
    e[l] = p;
  }
  return e;
}
function Ot(t) {
  const e = t.findIndex((n, s) => /^params?:$/i.test(n) || n.includes("=") || t[s + 1] === "=");
  return e < 0 ? [t, je()] : [t.slice(0, e), Wt(t.slice(e))];
}
function Tt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = In(t, e);
  t = n.source;
  const s = kn(t), o = [...n.diagnostics, ...s.diagnostics], l = je(), p = /* @__PURE__ */ new Set(["0"]), r = (y, I, C) => o.push({ severity: y, line: I, message: C }), d = (y, I, C, T = [], _ = je(), M = 0) => {
    const D = { id: y, name: I, parent: C, ports: T, defaults: _, parameters: je(), definitions: je(), devices: [], instances: [], directives: [], line: M, statements: [], layoutDescription: s.scopes.get(M) || null };
    return l[y] = D, D;
  }, c = d("root", "Top", null), u = [c], x = [];
  let g = !1, f = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, I) => {
    const C = y.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? x.length ? x.at(-1).text += " " + C.slice(1).trim() : r("error", I + 1, "Continuation has no preceding statement.") : x.push({ text: C, line: I + 1 }));
  });
  for (const { text: y, line: I } of x)
    try {
      const C = nt(y);
      if (!C.length) continue;
      const T = xe(C[0]), _ = u.at(-1);
      if (f) {
        r("warning", I, "Statement after .end is not rendered: " + y);
        continue;
      }
      if (T === ".control") {
        g = !0, r("warning", I, ".control script retained but not executed or rendered.");
        continue;
      }
      if (T === ".endc") {
        g = !1;
        continue;
      }
      if (g) continue;
      if (T === ".subckt") {
        if (C.length < 2) throw Error(".SUBCKT requires a name.");
        const [M, D] = Ot(C.slice(2)), E = xe(C[1]);
        if (Object.hasOwn(_.definitions, E)) throw Error("Duplicate subcircuit definition: " + C[1]);
        const w = M.map(xe);
        if (new Set(w).size !== M.length || w.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (M.some((W) => /[{}()=]/.test(W))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const B = _.id + "/" + encodeURIComponent(E);
        _.definitions[E] = B, u.push(d(B, C[1], _.id, M, D, I));
        continue;
      }
      if (T === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (C[1] && xe(C[1]) !== xe(_.name)) throw Error(".ENDS name does not match " + _.name);
        u.pop();
        continue;
      }
      if (T === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        f = !0;
        continue;
      }
      if (T === ".param") {
        const M = Wt(C.slice(1));
        for (const [D, E] of Object.entries(M)) {
          if (Object.hasOwn(_.parameters, D)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + D);
          _.parameters[D] = E;
        }
      }
      if (T === ".global") {
        if (C.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const M of C.slice(1)) p.add(xe(M));
      }
      if (T.startsWith(".") && _.directives.push({ line: I, text: y }), T.startsWith("x")) {
        const [M, D] = Ot(C.slice(1));
        if (!M.length) throw Error("X instance requires a subcircuit name.");
        const E = /;§pnba\s+(.+)$/i.exec(y)?.[1].split(")");
        _.instances.push({ name: C[0], nodes: M.slice(0, -1).map(xe), definitionName: M.at(-1), definitionId: null, parameters: D, line: I, raw: y, pinNames: E });
      } else _.statements.push({ line: I, text: y });
    } catch (C) {
      r("error", I, C.message + " Statement: " + y);
    }
  u.length > 1 && r("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), g && r("error", 0, "Unclosed .control block.");
  function m(y, I) {
    for (; y; ) {
      if (Object.hasOwn(y.definitions, xe(I))) return y.definitions[xe(I)];
      y = l[y.parent];
    }
    return null;
  }
  for (const y of Object.values(l)) {
    const I = [...y.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...y.statements], C = Cn(I.map((_) => _.text).join(`
`), { models: l[y.parent]?.models });
    y.devices = C.components.map((_) => ({ ..._, line: I[_.line - 1]?.line || y.line })), y.models = C.models, y === c && (c.title = C.title), o.push(...C.diagnostics.filter((_) => !_.message.includes("No supported components to render.") && !_.message.includes("300 components")).map((_) => ({ ..._, line: I[_.line - 1]?.line || y.line })));
    const T = new Set(y.devices.map((_) => xe(_.name)));
    for (const _ of y.instances)
      if (T.has(xe(_.name)) && r("error", _.line, "Duplicate instance/device name: " + _.name), T.add(xe(_.name)), _.definitionId = m(y, _.definitionName), !_.definitionId && !/^\{[\s\S]*\}$/.test(_.definitionName)) r("error", _.line, "Undefined subcircuit: " + _.definitionName + " in " + _.name);
      else if (_.definitionId) {
        const M = l[_.definitionId];
        M.ports.length !== _.nodes.length && r("error", _.line, `${_.name}: ${M.name} expects ${M.ports.length} ports; got ${_.nodes.length}.`);
      }
  }
  for (const y of Object.values(l)) delete y.statements;
  const h = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function b(y, I = []) {
    if (h.has(y)) {
      r("error", l[y].line, "Circular subcircuit reference: " + [...I, l[y].name].join(" → "));
      return;
    }
    if (!N.has(y)) {
      if (h.add(y), I.length >= 64) {
        r("error", l[y].line, "Subcircuit dependency nesting exceeds 64 levels."), h.delete(y), N.add(y);
        return;
      }
      for (const C of l[y].instances) C.definitionId && b(C.definitionId, [...I, l[y].name]);
      h.delete(y), N.add(y);
    }
  }
  for (const y of Object.keys(l)) b(y);
  !c.devices.length && !c.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const y of o) !y.source && y.line && n.origins[y.line - 1] && (y.source = n.origins[y.line - 1].file, y.line = n.origins[y.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: c.title || "", scopes: l, globals: [...p], diagnostics: o, layoutDescription: s.layout };
}
const he = () => /* @__PURE__ */ Object.create(null), Be = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ot = (t, e) => Be(t.map((n) => n.toLowerCase()), e.toLowerCase());
function On(t, e = []) {
  const n = he(), s = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [l, p] of Object.entries(o.terminals)) s(p).terminals.push({ component: o.name, pin: l });
  for (const o of e) s(o);
  return n;
}
function Tn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Mt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Mn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function rt(t, e, n = (o) => o, s = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (p) => (o.push(p), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (p, r, d) => {
    const c = d.split(",").map((x) => x.trim());
    if (c.some((x) => !x || /[\s{}+*()]/.test(x))) throw Error("Unsupported dynamic voltage/current reference: " + p);
    const u = r.toUpperCase() + "(" + c.map((x) => r.toLowerCase() === "v" ? n(x) : s(x, r)).join(",") + ")";
    return o.push(u), "@@" + (o.length - 1) + "@@";
  });
  let l = t.length;
  return t = t.replace(Mn, (p, r, d) => {
    if (d.slice(r + p.length).trimStart().startsWith("(")) return p;
    const c = e(p.toLowerCase());
    if (c === void 0) return p;
    if (l += c.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + c + ")";
  }), t.replace(/@@(\d+)@@/g, (p, r) => o[Number(r)]);
}
function Rn(t, e, n, s) {
  const o = { ...e, ...n }, l = he(), p = /* @__PURE__ */ new Set(), r = he();
  for (const [c, u] of Object.entries(s)) r[c] = rt(Mt(u), (x) => t[x]);
  function d(c) {
    if (Object.hasOwn(r, c)) return r[c];
    if (Object.hasOwn(l, c)) return l[c];
    if (!Object.hasOwn(o, c)) return t[c];
    if (p.has(c)) {
      if (Object.hasOwn(t, c)) return t[c];
      throw Error("Circular parameter dependency: " + [...p, c].join(" → "));
    }
    return p.add(c), l[c] = rt(Mt(o[c]), d), p.delete(c), l[c];
  }
  for (const c of Object.keys(o)) d(c);
  return Object.assign(he(), t, l, r);
}
function yt(t, e, n, s) {
  let o = "";
  for (let d = 0; d < t.length; ) {
    const c = t[d];
    if (c !== "{" && c !== "'") {
      o += c, d++;
      continue;
    }
    const u = d++;
    let x = 1, g = "";
    for (; d < t.length && x; d++) {
      if (c === "'") {
        t[d] === "'" && (x = 0);
        continue;
      }
      if (g) {
        t[d] === g && (g = "");
        continue;
      }
      if (t[d] === '"' || t[d] === "'") {
        g = t[d];
        continue;
      }
      t[d] === "{" && x++, t[d] === "}" && x--;
    }
    if (x) throw Error("Unclosed parameter expression.");
    o += c + rt(t.slice(u + 1, d - 1), (f) => e[f], n, s) + (c === "{" ? "}" : "'");
  }
  const l = [];
  let p = 0, r = "";
  for (let d = 0; d < o.length; d++) {
    const c = o[d];
    if (r) {
      c === r && o[d - 1] !== "\\" && (r = "");
      continue;
    }
    if (c === '"' || c === "'") {
      r = c;
      continue;
    }
    if ("({".includes(c) && p++, ")}".includes(c) && p--, !p && (d === 0 || /\s/.test(o[d - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(d));
      u && (l.push({ start: d, end: d + u[0].length, key: u[1].toLowerCase() }), d += u[0].length - 1);
    }
  }
  if (l.length) {
    let d = o.slice(0, l[0].start);
    l.forEach((c, u) => {
      const x = l[u + 1]?.start ?? o.length, g = o.slice(c.end, x);
      d += o.slice(c.start, c.end) + (g.includes("{") || ["refnode", "intnode"].includes(c.key) ? g : rt(g, (f) => e[f], n, s));
    }), o = d;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
}
class Ln {
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
  add(e, n, s) {
    if (typeof arguments[0] != "string")
      for (let o in arguments[0])
        this.add(o, arguments[0][o], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(o) {
        this[o] = this[o] || [], n && this[o][s ? "unshift" : "push"](n);
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
    this[e] = this[e] || [], this[e].forEach(function(s) {
      s.call(n && n.context ? n.context : n, n);
    });
  }
}
class Pn {
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
  static addBinaryOp(e, n, s) {
    return P.max_binop_len = Math.max(e.length, P.max_binop_len), P.binary_ops[e] = n, s ? P.right_associative.add(e) : P.right_associative.delete(e), P;
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
      const s = { context: this, node: n };
      return P.hooks.run(e, s), s.node;
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
      return P.hooks[e].find(function(s) {
        return s.call(n.context, n), n.node;
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
    let n = [], s, o;
    for (; this.index < this.expr.length; )
      if (s = this.code, s === P.SEMCOL_CODE || s === P.COMMA_CODE)
        this.index++;
      else if (o = this.gobbleExpression())
        n.push(o);
      else if (this.index < this.expr.length) {
        if (s === e)
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
    let e, n, s, o, l, p, r, d, c;
    if (p = this.gobbleToken(), !p || (n = this.gobbleBinaryOp(), !n))
      return p;
    for (l = { value: n, prec: P.binaryPrecedence(n), right_a: P.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), o = [p, l, r]; n = this.gobbleBinaryOp(); ) {
      if (s = P.binaryPrecedence(n), s === 0) {
        this.index -= n.length;
        break;
      }
      l = { value: n, prec: s, right_a: P.right_associative.has(n) }, c = n;
      const u = (x) => l.right_a && x.right_a ? s > x.prec : s <= x.prec;
      for (; o.length > 2 && u(o[o.length - 2]); )
        r = o.pop(), n = o.pop().value, p = o.pop(), e = {
          type: P.BINARY_EXP,
          operator: n,
          left: p,
          right: r
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + c), o.push(l, e);
    }
    for (d = o.length - 1, e = o[d]; d > 1; )
      e = {
        type: P.BINARY_EXP,
        operator: o[d - 1].value,
        left: o[d - 2],
        right: e
      }, d -= 2;
    return e;
  }
  /**
   * An individual part of a binary expression:
   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
   * @returns {boolean|jsep.Expression}
   */
  gobbleToken() {
    let e, n, s, o;
    if (this.gobbleSpaces(), o = this.searchHook("gobble-token"), o)
      return this.runHook("after-token", o);
    if (e = this.code, P.isDecimalDigit(e) || e === P.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === P.SQUOTE_CODE || e === P.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === P.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, P.max_unop_len), s = n.length; s > 0; ) {
        if (P.unary_ops.hasOwnProperty(n) && (!P.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !P.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += s;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: P.UNARY_EXP,
            operator: n,
            argument: l,
            prefix: !0
          });
        }
        n = n.substr(0, --s);
      }
      P.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), P.literals.hasOwnProperty(o.name) ? o = {
        type: P.LITERAL,
        value: P.literals[o.name],
        raw: o.name
      } : o.name === P.this_str && (o = { type: P.THIS_EXP })) : e === P.OPAREN_CODE && (o = this.gobbleGroup());
    }
    return o ? (o = this.gobbleTokenProperty(o), this.runHook("after-token", o)) : this.runHook("after-token", !1);
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
      let s;
      if (n === P.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== P.PERIOD_CODE)
          break;
        s = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
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
      } : (n === P.PERIOD_CODE || s) && (s && this.index--, this.gobbleSpaces(), e = {
        type: P.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), s && (e.optional = !0), this.gobbleSpaces(), n = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", n, s;
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
    return s = this.code, P.isIdentifierStart(s) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (s === P.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === P.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const n = this.index, s = this.expr.charAt(this.index++);
    let o = !1;
    for (; this.index < this.expr.length; ) {
      let l = this.expr.charAt(this.index++);
      if (l === s) {
        o = !0;
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
    return o || this.throwError('Unclosed quote after "' + e + '"'), {
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
    let s = !1, o = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let l = this.code;
      if (l === e) {
        s = !0, this.index++, e === P.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === P.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === P.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === P.CBRACK_CODE)
            for (let p = n.length; p < o; p++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const p = this.gobbleExpression();
        (!p || p.type === P.COMPOUND) && this.throwError("Expected comma"), n.push(p);
      }
    }
    return s || this.throwError("Expected " + String.fromCharCode(e)), n;
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
const Dn = new Ln();
Object.assign(P, {
  hooks: Dn,
  plugins: new Pn(P),
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
const Ge = (t) => new P(t).parse(), Un = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(P).filter((t) => !Un.includes(t) && Ge[t] === void 0).forEach((t) => {
  Ge[t] = P[t];
});
Ge.Jsep = P;
const Bn = "ConditionalExpression";
var jn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const s = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: Bn,
            test: s,
            consequent: o,
            alternate: l
          }, s.operator && t.binary_ops[s.operator] <= 0.9) {
            let p = s;
            for (; p.right.operator && t.binary_ops[p.right.operator] <= 0.9; )
              p = p.right;
            n.node.test = p.right, p.right = n.node, n.node = s;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ge.plugins.register(jn);
const Vn = "ConditionalExpression";
var Gn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const s = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), n.node = {
            type: Vn,
            test: s,
            consequent: o,
            alternate: l
          }, s.operator && t.binary_ops[s.operator] <= 0.9) {
            let p = s;
            for (; p.right.operator && t.binary_ops[p.right.operator] <= 0.9; )
              p = p.right;
            n.node.test = p.right, p.right = n.node, n.node = s;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ge.plugins.register(Gn);
const Qn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Rt = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, ye = (t) => Number(t) > 0.5;
function $e(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let s = 0;
  function o(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (d) => {
      if (d[0] === '"' || d[0] === "'") return d;
      const [, c, u, x] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(d), g = u.toLowerCase(), f = g.startsWith("meg") ? 1e6 : g.startsWith("mil") ? 254e-7 : Qn[g[0]] || 1;
      return "(" + (x ? +(c + (c.includes(".") ? "" : ".") + x) : Number(c)) * f + ")";
    }), l(Ge(r));
  }
  function l(r) {
    if (++s > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const d = r.name.toLowerCase();
      if (d === "pi") return Math.PI;
      if (d === "e") return Math.E;
      if (!Object.hasOwn(e, d)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(d)) throw Error("Circular structural parameter: " + d);
      n.add(d);
      const c = o(e[d]);
      return n.delete(d), c;
    }
    if (r.type === "ConditionalExpression") return ye(l(r.test)) ? l(r.consequent) : l(r.alternate);
    if (r.type === "UnaryExpression") {
      const d = l(r.argument);
      if (r.operator === "-") return -d;
      if (r.operator === "+") return +d;
      if (r.operator === "!" || r.operator === "~") return !ye(d);
    }
    if (r.type === "BinaryExpression") {
      const d = l(r.left);
      if (r.operator === "&&") return ye(d) && ye(l(r.right));
      if (r.operator === "||") return ye(d) || ye(l(r.right));
      const c = l(r.right);
      switch (r.operator) {
        case "+":
          return d + c;
        case "-":
          return d - c;
        case "*":
          return d * c;
        case "/":
          return d / c;
        case "**":
          return d ** c;
        case "%":
          return d % c;
        case "^":
          return ye(d) !== ye(c);
        case "&":
          return ye(d) && ye(c);
        case "|":
          return ye(d) || ye(c);
        case ">":
          return d > c;
        case "<":
          return d < c;
        case ">=":
          return d >= c;
        case "<=":
          return d <= c;
        case "==":
        case "===":
          return d === c;
        case "!=":
        case "!==":
          return d !== c;
      }
    }
    if (r.type === "CallExpression" && r.callee.type === "Identifier") {
      const d = r.callee.name.toLowerCase();
      if (d === "if") {
        if (r.arguments.length !== 3) throw Error("if() needs three arguments.");
        return ye(l(r.arguments[0])) ? l(r.arguments[1]) : l(r.arguments[2]);
      }
      if (Object.hasOwn(Rt, d)) return Rt[d](...r.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const p = o(t);
  if (typeof p == "number" && !Number.isFinite(p)) throw Error("Structural expression is not finite.");
  return p;
}
function it(t, { isolate: e = "" } = {}) {
  Tn(t);
  const n = he(), s = /* @__PURE__ */ new Map();
  let o = 0, l = 0;
  function p(r, d, c, u, x, g, f) {
    if (d.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const m = t.scopes[r], h = d.length ? Be(d.slice(0, -1), d.at(-1)) : "", N = he();
    if (e && h === e && (c = he()), f.some((_) => _.scopeId === r)) throw Error("Circular subcircuit reference at " + h);
    const b = Rn(u, m.defaults, m.parameters, x);
    function y(_) {
      if (/^\{[\s\S]*\}$/.test(_)) {
        const D = $e(_, b);
        _ = String(typeof D == "boolean" ? Number(D) : D);
      }
      /^"[\s\S]*"$/.test(_) && (_ = _.slice(1, -1));
      const M = _.toLowerCase();
      return Object.hasOwn(c, M) ? c[M] : t.globals.includes(M) ? ot([], M) : N[M] || (N[M] = ot(d, M));
    }
    const I = { id: h, path: d, scopeId: r, name: g?.name || "Top", definition: m.name, ports: m.ports.map((_) => ({ name: _, node: y(_) })), params: b, nodes: N, models: he(), devices: [], children: [], raw: g?.raw || "", line: g?.line || 0 };
    n[h] = I, s.set(h, y);
    const C = [...f, I];
    function T(_) {
      if (!_) return "";
      let M = m;
      for (; M; ) {
        if (M.directives.some((D) => new RegExp("^\\.model\\s+" + _.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(D.text))) {
          const D = [...C].reverse().find((E) => E.scopeId === M.id);
          return Be(D?.path || [], _.toLowerCase());
        }
        M = t.scopes[M.parent];
      }
      return _;
    }
    for (const _ of m.directives.filter((M) => /^\.model\b/i.test(M.text))) {
      const M = /^\.model\s+(\S+)/i.exec(_.text)?.[1];
      if (!M) continue;
      const D = T(M), E = m.models[M.toLowerCase()], w = yt(_.text, b, y, (B) => Be(d, B));
      I.models[D] = { ...E, name: D, raw: w.replace(/^(\.model\s+)\S+/i, (B, W) => W + D), instanceId: h, parameters: b };
    }
    for (const _ of m.devices) {
      if (++l > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const M = he();
      for (const [E, w] of Object.entries(_.terminals)) M[E] = y(w);
      const D = T(_.model);
      I.devices.push({ ..._, name: Be(d, _.name), localName: _.name, instanceId: h, terminals: M, model: D, parameters: b });
    }
    for (const _ of m.instances) {
      let M = _.definitionId;
      if (!M) {
        const B = String($e(_.definitionName, b)).toLowerCase();
        let W = m;
        for (; W && !M; )
          M = W.definitions[B], W = t.scopes[W.parent];
        if (!M) throw Error("Undefined selected subcircuit: " + B);
      }
      const D = t.scopes[M], E = he();
      if (D.ports.length !== _.nodes.length) throw Error(_.name + ": expected " + D.ports.length + " ports; got " + _.nodes.length);
      D.ports.forEach((B, W) => {
        E[B.toLowerCase()] = y(_.nodes[W]);
      });
      const w = p(M, [...d, _.name], E, b, _.parameters, _, C);
      _.pinNames?.length === w.ports.length && w.ports.forEach((B, W) => {
        B.label = _.pinNames[W];
      }), I.children.push(w);
    }
    return I;
  }
  try {
    let x = function(g, f) {
      const m = f.split(":");
      if (m.length === 1) return { owner: g, name: f };
      const h = m.pop();
      for (const N of [[...g.path, ...m], m]) {
        const b = d.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (b) return { owner: b, name: h };
      }
      throw Error("Unknown hierarchical reference: " + f);
    };
    const r = p(t.rootId, [], he(), he(), he(), null, []), d = new Map(Object.values(n).map((g) => [g.id.toLowerCase(), g])), c = Object.assign(he(), ...Object.values(n).map((g) => g.models)), u = (g) => c[g] || Object.entries(c).find(([f]) => f.startsWith(g + "."))?.[1];
    for (const g of Object.values(n)) for (const f of g.devices) {
      const m = t.scopes[g.scopeId].devices.find((b) => b.name === f.localName), h = (b) => {
        const y = x(g, b);
        return s.get(y.owner.id)(y.name);
      }, N = (b, y = "", I = "") => {
        const C = x(g, b), T = C.owner.devices.find((_) => _.localName.toLowerCase() === C.name.toLowerCase());
        if (y.toLowerCase() === "ix") {
          const _ = C.owner.ports.find((M, D) => M.name.toLowerCase() === C.name.toLowerCase() || String(D + 1) === C.name);
          if (_) return C.owner.id + ":" + _.name;
        }
        if (!T) {
          if (I) throw Error(f.name + ": referenced " + I + " device " + b + " was not found.");
          return Be(C.owner.path, C.name);
        }
        if (I && T.kind !== I) throw Error(f.name + ": " + b + " must be a " + I + " device.");
        return T.name;
      };
      if (f.value = yt(m.value, g.params, h, N), m.model && (f.value = f.value.replace(m.model, f.model)), f.kind === "M" && Object.keys(f.terminals).length === 3) {
        let b = u(f.model), y = !1;
        const I = /* @__PURE__ */ new Set();
        for (; b?.type === "VDMOS" && !I.has(b.name); ) {
          I.add(b.name);
          const C = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(b.raw);
          if (C) {
            y = C[1] === void 0 || Number($e(C[1], b.parameters)) >= 0.5;
            break;
          }
          const T = b.name.includes("/") ? b.name.slice(0, b.name.lastIndexOf("/") + 1) : "";
          b = u(T + (b.baseModel || "").toLowerCase()) || u((b.baseModel || "").toLowerCase());
        }
        I.size && (f.type = "spice_" + (y ? "pmos3" : "nmos3"));
      }
      f.controlSources = (m.controlSources || []).map((b) => N(b, "", "V")), f.controlSource = f.controlSources[0] || "", f.coupledInductors = (m.coupledInductors || []).map((b) => N(b, "", "L"));
      for (const b of /* @__PURE__ */ new Set([...m.controlSources || [], ...m.coupledInductors || []])) {
        const y = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        f.value = f.value.replace(new RegExp("(?<![\\w./%])" + y + "(?![\\w.$])", "g"), () => N(b));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: r, contexts: n };
  } catch (r) {
    throw r.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: r.message }], r;
  }
}
function Ve(t) {
  return [...t.devices, ...t.children.flatMap(Ve)];
}
function Qe(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function St(t, e = {}) {
  const n = new Map(t.components.map((E) => [E.name, E])), s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = [], p = (E, w) => JSON.stringify([E, w].sort()), r = (E) => e[E]?.potential !== null && e[E]?.potential !== void 0;
  for (const E of t.components) {
    for (const [L, U] of Object.entries(E.terminals))
      s.has(U) || s.set(U, []), s.get(U).push({ device: E.name, pin: L });
    if (E.kind === "R") {
      const L = Object.values(E.terminals);
      if (L.length === 2 && L[0] !== L[1]) {
        const U = p(...L);
        o.has(U) || o.set(U, []), o.get(U).push(E);
      }
    }
    const w = E.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(E.kind) ? "fet" : null, B = w === "bjt" ? /_(npn|pnp)$/.exec(E.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(E.type)?.[1];
    if (!w || !B) continue;
    const W = E.terminals, z = W[w === "bjt" ? "B" : "G"], $ = W[w === "bjt" ? "C" : "D"], ee = W[w === "bjt" ? "E" : "S"];
    [z, $, ee].some((L) => L === void 0) || z === ee || $ === ee || l.push({ id: E.name, family: w, polarity: B, control: z, drain: $, source: ee, body: E.kind === "M" ? W.B : void 0 });
  }
  const d = [], c = /* @__PURE__ */ new Set(), u = (E, w, B, W, z, $ = "basic", ee = [], L = "high") => {
    const U = [.../* @__PURE__ */ new Set([...w, ...ee])], X = JSON.stringify([E, $, [...U].sort()]);
    c.has(X) || (c.add(X), d.push({ id: "motif" + d.length, kind: E, variant: $, transistors: w, members: U, roles: B, nets: W, evidence: z, confidence: L }));
  }, x = (E, w) => E.family === w.family && E.polarity === w.polarity, g = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = new Map(l.map((E) => [E.id, E])), N = (E, w, B) => {
    E.has(w) || E.set(w, []), E.get(w).push(B);
  }, b = (E, w) => JSON.stringify([E.family, E.polarity, w]);
  for (const E of l)
    N(g, b(E, E.control), E), N(f, b(E, E.source), E), E.family === "bjt" && (s.get(E.source) || []).some((w) => {
      const B = h.get(w.device);
      return B && B.family === "bjt" && !x(E, B) && B.source === E.source;
    }) && N(m, b(E, E.drain), E);
  const y = (E) => [{ node: E.source, resistor: null }, ...(s.get(E.source) || []).flatMap((w) => {
    const B = n.get(w.device);
    if (B.kind !== "R") return [];
    const W = Object.values(B.terminals).find((z) => z !== E.source);
    return W !== void 0 && W !== E.control && W !== E.drain ? [{ node: W, resistor: B.name }] : [];
  })];
  for (const E of l) E.control === E.drain && u("diode-connected", [E.id], { reference: E.id }, { control: E.control, return: E.source }, ["control-drain-short", E.family]);
  for (const E of l) {
    const w = g.get(b(E, E.control));
    if (w.filter((L) => L.control === L.drain).length > 1) continue;
    let B = null;
    if (E.control !== E.drain && E.family === "bjt" && (B = (g.get(b(E, E.drain)) || []).find((L) => L.id !== E.id && x(L, E) && L.control === E.drain && L.source === E.control && r(L.drain))), E.control !== E.drain && !B) continue;
    const W = y(E), z = [];
    let $ = null, ee = [];
    for (const L of w) {
      if (L.id === E.id || L.id === B?.id || L.drain === E.drain || L.drain === L.control) continue;
      const U = W.flatMap((X) => y(L).filter((F) => X.node === F.node).map((F) => ({ node: X.node, rs: [X.resistor, F.resistor].filter(Boolean) }))).find((X) => $ === null || X.node === $);
      U && ($ = U.node, z.push(L.id), ee.push(...U.rs));
    }
    if (z.length) {
      const L = z.every((U) => h.get(U).body === E.body);
      u("current-mirror", [E.id, ...z, ...B ? [B.id] : []], { reference: E.id, outputs: z, ...B ? { helper: B.id } : {} }, { control: E.control, return: $ }, ["same-polarity", "shared-control", B ? "emitter-follower-reference" : "diode-reference", ee.length ? "resistive-common-return" : "shared-return", L ? "compatible-bodies" : "different-body-connections"], B ? "assisted" : ee.length ? "degenerated" : "basic", [...ee, ...B ? [B.id] : []], L ? "high" : "medium");
    }
  }
  const I = [], C = /* @__PURE__ */ new Set(), T = (E, w) => {
    const B = JSON.stringify([E.id, w.id].sort());
    C.has(B) || (C.add(B), I.push([E, w]));
  };
  for (const E of f.values()) if (!r(E[0].source)) {
    const w = E.filter((B) => B.control !== B.drain);
    w.length === 2 ? T(...w) : w.length > 2 && new Set(w.map((B) => B.control)).size > 1 && u("differential-pair", w.map((B) => B.id), { inputs: w.map((B) => B.id) }, { tail: w[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const E of m.values()) for (let w = 0; w < E.length; w++) for (let B = w + 1; B < E.length; B++) T(E[w], E[B]);
  for (const [E, w] of I) {
    if (E.control === w.control || E.control === E.drain || w.control === w.drain) continue;
    if (E.source === w.source && E.drain !== w.drain && !r(E.source)) {
      const z = (s.get(E.source) || []).some((ee) => ee.device !== E.id && ee.device !== w.id), $ = f.get(b(E, E.source)).length === 2;
      u("differential-pair", [E.id, w.id], { inputs: [E.id, w.id] }, { tail: E.source }, ["same-polarity", "distinct-controls", "shared-tail", z ? "tail-bias-connection" : "unbiased-tail", $ ? "two-input-tail" : "multi-input-tail"], "basic", [], z && $ && E.body === w.body ? "high" : "medium");
    }
    if (E.family !== "bjt" || E.drain !== w.drain || E.source === w.source) continue;
    const B = l.filter((z) => z.family === "bjt" && z.polarity !== E.polarity && z.source === E.source), W = l.filter((z) => z.family === "bjt" && z.polarity !== E.polarity && z.source === w.source);
    for (const z of B) for (const $ of W) z.id !== $.id && z.control === $.control && z.drain !== $.drain && z.control !== z.drain && $.control !== $.drain && u("differential-pair", [E.id, w.id, z.id, $.id], { inputs: [E.id, w.id], commonBase: [z.id, $.id] }, { inputCollectors: E.drain, bias: z.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const E of l) if (E.family === "bjt" && E.control !== E.drain) {
    const w = o.get(p(E.drain, E.control)) || [], B = o.get(p(E.control, E.source)) || [];
    w.length === 1 && B.length === 1 && u("vbe-multiplier", [E.id], { transistor: E.id, collectorResistor: w[0].name, emitterResistor: B[0].name }, { control: E.control, collector: E.drain, emitter: E.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [w[0].name, B[0].name]);
  }
  const _ = l.filter((E) => E.family === "bjt"), M = /* @__PURE__ */ new Map();
  for (const E of _) N(M, E.control, E);
  const D = (E) => (s.get(E) || []).filter((w) => h.has(w.device));
  for (const E of _) if (E.control !== E.drain) {
    for (const w of M.get(E.source) || []) if (w.id !== E.id && x(E, w) && w.drain === E.control && w.source !== E.drain) {
      const B = o.get(p(E.source, w.source)) || [];
      B.length === 1 && u("current-limit-pair", [E.id, w.id], { driver: E.id, output: w.id, senseResistor: B[0].name }, { sense: E.source, drive: E.control, output: w.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [B[0].name]);
    }
    for (const w of M.get(E.source) || []) w.id !== E.id && x(E, w) && w.control !== w.drain && E.drain === w.drain && w.source !== E.control && u("darlington-pair", [E.id, w.id], { driver: E.id, output: w.id }, { link: E.source, collector: E.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (M.get(E.source) || []).length === 1 ? "high" : "medium");
    for (const w of M.get(E.drain) || []) w.id !== E.id && !x(E, w) && w.control !== w.drain && E.source === w.drain && w.source !== E.control && D(E.drain).length === 2 && u("sziklai-pair", [E.id, w.id], { driver: E.id, output: w.id }, { link: E.drain, feedback: E.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const w of s.get(E.drain) || []) {
      const B = h.get(w.device);
      !B || B.family !== "bjt" || B.id === E.id || !x(E, B) || B.source !== E.drain || r(E.drain) || B.control === E.control || B.control === B.drain || B.drain === E.source || D(E.drain).length !== 2 || u("cascode-pair", [E.id, B.id], { driver: E.id, output: B.id }, { link: E.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const E of _.filter((w) => w.polarity === "npn" && r(w.drain))) for (const w of _.filter((B) => B.polarity === "pnp" && r(B.drain))) {
    if (e[E.drain].potential <= e[w.drain].potential) continue;
    const B = y(E).flatMap((W) => y(w).filter((z) => W.node === z.node && !r(W.node)).map((z) => ({ node: W.node, rs: [W.resistor, z.resistor].filter(Boolean) })))[0];
    B && u("push-pull-pair", [E.id, w.id], { upper: E.id, lower: w.id }, { output: B.node }, ["complementary-polarity", "ordered-collector-supplies", B.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", B.rs);
  }
  return d;
}
function _t(t, e, n = (s) => s) {
  const s = (o) => Array.isArray(o) ? o.map(e) : e(o);
  return t.map((o) => ({ ...o, members: o.members.map(e), transistors: o.transistors.map(e), roles: Object.fromEntries(Object.entries(o.roles).map(([l, p]) => [l, s(p)])), nets: Object.fromEntries(Object.entries(o.nets).map(([l, p]) => [l, n(p)])) }));
}
function Fn(t, e, n) {
  const s = [], o = /* @__PURE__ */ new Set(), l = new Map(t.components.map((p) => [p.name, p]));
  for (const p of n) {
    if (new Set(p.members).size !== p.members.length) throw Error("Duplicate @layout pair member.");
    const r = p.members.map((g) => l.get(g));
    if (r.some((g) => !g)) throw Error("Unknown @layout pair device.");
    const d = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[p.kind], c = p.kind === "differential" && r.length === 2 ? t.components.filter((g) => !p.members.includes(g.name) && Object.values(g.terminals).includes(r[0].terminals.E ?? r[0].terminals.S)) : [], u = St({ ...t, components: [...r, ...c] }, e), x = u.find((g) => g.kind === d && g.confidence === "high" && p.members.every((f) => g.members.includes(f)));
    if (!x) throw Error("Invalid @layout pair " + p.kind + " { " + p.members.join(" ") + " }: electrical structure does not match.");
    for (const g of u.filter((f) => f === x || f.kind === "diode-connected" && f.members.every((m) => x.members.includes(m)))) {
      const f = JSON.stringify([g.kind, [...g.members].sort()]);
      o.has(f) || (o.add(f), s.push({ ...g, id: "motif" + s.length, origin: "annotation" }));
    }
  }
  return s;
}
function Hn(t, e, n = St(t, e)) {
  const s = /* @__PURE__ */ new Map(), o = t.components.filter((g) => g.kind === "R"), l = t.components.filter((g) => g.kind === "Q"), p = new Map(t.components.map((g) => [g.name, g])), r = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), c = (g) => Object.values(g.terminals), u = (g, f, m) => {
    g && s.set(g.name, { reverse: c(g)[0] !== f, reason: m });
  };
  for (const g of l) {
    const { C: f, B: m, E: h } = g.terminals, N = g.type.endsWith("pnp"), b = g.type.endsWith("npn");
    !N && !b || (r.has(h) || r.set(h, []), r.get(h).push(g), f === m && e[h]?.potential !== null && e[h]?.potential !== void 0 && d.set(f, { potential: e[h].potential }));
  }
  for (const g of n) if (g.kind === "vbe-multiplier" && g.confidence === "high") {
    const f = p.get(g.roles.transistor), m = f.type.endsWith("pnp"), h = p.get(m ? g.roles.emitterResistor : g.roles.collectorResistor), N = p.get(m ? g.roles.collectorResistor : g.roles.emitterResistor);
    u(h, f.terminals[m ? "E" : "C"], "recognized VBE multiplier"), u(N, f.terminals.B, "recognized VBE multiplier");
  }
  for (const g of o) {
    const [f, m] = c(g), h = d.get(f), N = d.get(m);
    h && N && h.potential !== N.potential && u(g, h.potential > N.potential ? f : m, "diode-connected bias reference");
  }
  const x = /* @__PURE__ */ new Map();
  for (const g of o) {
    const f = c(g);
    if (!f.some((m) => e[m]?.potential !== null && e[m]?.potential !== void 0))
      for (const m of f)
        x.has(m) || x.set(m, []), x.get(m).push(g);
  }
  for (const [g, f] of x)
    if (!(f.length > 12))
      for (const m of f) for (const h of f) {
        if (m === h) continue;
        const N = c(m).find((C) => C !== g), b = c(h).find((C) => C !== g), y = r.get(N)?.find((C) => C.type.endsWith("npn")), I = r.get(b)?.find((C) => C.type.endsWith("pnp"));
        y && I && (u(m, N, "complementary emitter output"), u(h, g, "complementary emitter output"));
      }
  return s;
}
function zn(t) {
  const e = t.components.filter((l) => l.kind === "Q"), n = /* @__PURE__ */ new Map(), s = new Set(t.components.filter((l) => l.kind === "R").map((l) => Object.values(l.terminals).sort().join("|"))), o = /* @__PURE__ */ new Set();
  for (const l of e) {
    const p = l.terminals.E;
    n.has(p) || n.set(p, []), n.get(p).push(l);
  }
  for (const l of e) {
    const { B: p, C: r, E: d } = l.terminals;
    if (p === d || !s.has([p, d].sort().join("|"))) continue;
    const c = n.get(p) || [];
    if (!(c.length > 16))
      for (const u of c) {
        if (u === l) continue;
        if (u.terminals.B === r) {
          o.add(l.name);
          break;
        }
        const x = n.get(u.terminals.B) || [];
        if (x.length <= 16 && x.some((g) => g !== l && g !== u && g.terminals.B === r)) {
          o.add(l.name);
          break;
        }
      }
  }
  return o;
}
const Ke = 22;
function wt(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const Ye = (t) => ["pwr", "ret", "bias"].includes(t), qn = (t) => String(t).split("/").at(-1).toLowerCase(), Xt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[qn(t)] || "unknown", Lt = (t) => {
  const e = wt(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Xt(t);
};
function Wn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], s = (p, r, d) => {
    e.has(p) || e.set(p, []), e.get(p).push({ node: r, delta: d });
  };
  for (const p of t)
    if (p.kind === "V")
      try {
        let r = p.value.trim();
        const d = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (d && Number($e(d[1], p.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const c = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!c) continue;
        const u = $e(c[1], p.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        s(p.terminals["-"], p.terminals["+"], u), s(p.terminals["+"], p.terminals["-"], -u);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const p of ["0", ...e.keys()]) {
    if (l.has(p)) continue;
    const r = /* @__PURE__ */ new Map([[p, 0]]), d = [p];
    l.add(p);
    let c = !1;
    for (let u = 0; u < d.length; u++) for (const x of e.get(d[u]) || []) {
      const g = r.get(d[u]) + x.delta;
      r.has(x.node) ? Math.abs(r.get(x.node) - g) > 1e-8 * Math.max(1, Math.abs(g)) && (c = !0) : (r.set(x.node, g), l.add(x.node), d.push(x.node));
    }
    c && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, x] of r) o[u] = { value: x, reference: p, known: p === "0" && !c, consistent: !c };
  }
  return { nodes: o, diagnostics: n };
}
function Xn(t, e, n = null) {
  const s = Wn(Ve(e.localScope ? t.contexts[e.focus] : t.root)), o = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const x = wt(u.name), g = Xt(u.name);
    o[u.name] = { role: x !== "unknown" ? x : g, roleSource: x !== "unknown" ? "node-name" : g !== "unknown" ? "legacy-rail-name" : "unknown", potential: s.nodes[u.name]?.known ? s.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const x = o[u.local], g = Lt(u.port);
    x && x.potential === null && ["pwr", "ret"].includes(g) && (x.potential = g === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, x.potentialSource = "symbolic-port-order");
  }
  const p = n?.pairs?.length ? Fn(e, o, n.pairs) : St(e, o), r = Hn(e, o, p), d = zn(e), c = (u, x, g) => {
    const f = { role: o[g].role, roleSource: o[g].roleSource }, m = u.block?.ports.find((b) => b.pin === x);
    if (m?.implicit || !u.block && !u.synthetic) return f;
    const h = u.synthetic ? u.value : m?.name || m?.label, N = Lt(h);
    return N !== "unknown" ? { role: N, roleSource: wt(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : Ye(f.role) ? { ...f, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const x = Object.fromEntries(Object.entries(u.terminals).map(([D, E]) => [D, { ...o[E], ...c(u, D, E) }])), g = Object.values(x), f = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), m = f && !r.has(u.name) && g.length === 2 && g.every((D) => !Ye(D.role) && (D.potential === null || D.role !== "unknown")), h = u.terminals["+"], N = u.terminals["-"], b = [h, N].filter((D) => D && D !== "0"), y = u.kind === "V" && b.some((D) => Ye(o[D]?.role)) && !b.some((D) => ["in", "out", "io", "fb"].includes(o[D]?.role)) && [h, N].every((D) => s.nodes[D]?.known), I = h === "0" ? N : h, C = Object.keys(u.terminals), T = (D) => Ye(D.role) ? D.potential !== null ? D.potential > 0 ? "high" : "low" : D.role === "ret" ? "low" : "high" : "signal";
    let _ = !1;
    C.length === 2 && (u.kind === "V" && g.every((D) => D.potential !== null) ? _ = g[0].potential < g[1].potential : u.terminals[C[0]] === "0" ? _ = !0 : u.terminals[C[1]] === "0" ? _ = !1 : g.every((D) => D.potential !== null) ? _ = g[0].potential < g[1].potential : _ = T(g[0]) === "low" || T(g[1]) === "high" && T(g[0]) === "signal"), r.has(u.name) && (_ = r.get(u.name).reverse);
    const M = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    l[u.name] = { version: Ke, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: d.has(u.name), orientationReason: r.get(u.name)?.reason || null, owner: M.includes("/") ? M.slice(0, M.lastIndexOf("/")) : "", passive: f, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !f, ports: x, horizontal: m, orientation: m ? "horizontal" : _ ? "vertical-reversed" : "vertical", flexible: C.length === 2 && (f || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!y, voltage: y ? s.nodes[I].value : null };
  }
  return { version: Ke, nodes: o, cells: l, motifs: p, diagnostics: s.diagnostics };
}
function $t(t, e) {
  const n = e.ports.map((o, l) => ({ pin: "P" + l, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), s = new Set(Ve(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const l = ot([], o);
    s.has(l) && !n.some((p) => p.node === l) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: l, implicit: !0 });
  }
  return n;
}
function He(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: s = "" } = {}) {
  const o = t, l = t.contexts[s];
  if (!l) throw Error("Unknown instance: " + s);
  s && (t = it(t.ir, { isolate: s }));
  const p = t.contexts[s];
  if (!p) throw Error("Unknown instance: " + s);
  const r = [], d = [];
  function c(m) {
    d.push(...Object.values(m.nodes), ...m.ports.map((N) => N.node));
    const h = [...m.devices.map((N) => ({ line: N.line, device: N })), ...m.children.map((N) => ({ line: N.line, child: N }))].sort((N, b) => N.line - b.line);
    for (const N of h) {
      if (N.device) {
        const C = N.device;
        r.push({ ...C, layoutLabel: [...m.path.slice(p.path.length), C.localName].join("/") });
        continue;
      }
      const b = N.child;
      if (e === "flat" || n.has(b.id)) {
        c(b);
        continue;
      }
      const y = $t(t, b), I = he();
      y.forEach((C) => {
        I[C.pin] = C.node;
      }), r.push({ name: b.id, kind: "X", type: "spice_subckt", terminals: I, value: b.definition, raw: b.raw, line: b.line, instanceId: b.id, layoutLabel: b.path.slice(p.path.length).join("/"), block: { definitionId: b.scopeId, ports: y, parameters: b.params } });
    }
  }
  c(p);
  for (const [m, h] of p.ports.entries()) r.push({ name: "@port/" + s + "/" + m, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (r.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(he(), ...Object.values(t.contexts).map((m) => m.models)), x = { title: s || t.ir.title, components: r, nodes: On(r, d), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: s, localScope: !!s };
  x.interfaceBindings = p.ports.map((m, h) => ({ port: m.name, local: m.node, parent: l.ports[h].node }));
  const g = /* @__PURE__ */ new Map();
  for (const m of l.ports)
    g.has(m.node) || g.set(m.node, []), g.get(m.node).push(m.name);
  x.interfaceAliases = [...g].filter(([, m]) => m.length > 1).map(([m, h]) => ({ node: m, ports: h })), x.topology = $n(o, x);
  const f = An(t, x);
  return x.layout = Xn(t, x, f), x.layout.description = f, x;
}
function $n(t, e) {
  const n = Ve(t.contexts[e.focus]);
  e.localScope && (t = it(t.ir, { isolate: e.focus }));
  const s = [], o = /* @__PURE__ */ new Set();
  for (const r of e.components)
    if (!r.synthetic)
      if (r.kind === "X") {
        const d = t.contexts[r.instanceId];
        if (!d) throw Error("Projection contains an unknown block.");
        const c = $t(t, d);
        if (JSON.stringify(Object.entries(r.terminals)) !== JSON.stringify(c.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + r.name);
        s.push(...Ve(d));
      } else s.push(r);
  for (const r of s) {
    if (o.has(r.name)) throw Error("Projection duplicates " + r.name);
    o.add(r.name);
  }
  const l = Qe(s), p = Ve(t.contexts[e.focus]);
  if (l !== Qe(p)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const r = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), d = (u) => r.get(u) ?? u, c = s.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([x, g]) => [x, d(g)])), value: yt(u.value, {}, d, (x) => x) }));
    if (Qe(c) !== Qe(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: s.length, signature: l, boundSignature: Qe(n), boundaryVerified: !0 };
}
function Fe(t) {
  const e = he(), n = he();
  for (const s of t.components) {
    const o = he(), l = he();
    for (const [p, r] of Object.entries(s.terminals))
      o[p] = [t.nodes[r].bit], l[p] = "input";
    e[s.name] = { type: s.type, port_directions: l, connections: o, parameters: {}, attributes: { ref: s.name, displayRef: s.layoutLabel || s.name, value: s.value, spice: s.raw } }, e[s.name].spiceLayout = t.layout?.cells[s.name], s.block && (e[s.name].spiceBlock = { ports: s.block.ports.map((p) => ({ pin: p.pin, label: p.label })), definitionId: s.block.definitionId }), (s.type === "spice_device" || s.type === "spice_coupling") && (e[s.name].spiceSymbol = { label: s.symbol || s.kind, ports: Object.keys(s.terminals).map((p, r) => ({ pin: p, label: s.pinLabels?.[r] || p })), references: s.coupledInductors?.length ? s.coupledInductors : s.controlSources || [] });
  }
  for (const s of Object.values(t.nodes)) n[s.name] = { hide_name: 0, bits: [s.bit], attributes: {} };
  if (t.nodes[0]) {
    let s = "__ground";
    for (; Object.hasOwn(e, s); ) s += "_";
    e[s] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: _t(t.layout?.motifs || [], (s) => s, (s) => t.nodes[s].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Kn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), s = {}, o = (c) => (n.has(c) || n.set(c, n.size + 2), n.get(c));
  Object.entries(t.modules.circuit.cells).forEach(([c, u], x) => {
    const g = "c" + x;
    e.set(g, c);
    const f = Object.fromEntries(Object.entries(u.connections).map(([m, h]) => [m, h.map(o)]));
    s[g] = { type: u.type, connections: f, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (s[g].spiceBlock = u.spiceBlock), u.spiceSymbol && (s[g].spiceSymbol = u.spiceSymbol), u.spiceLayout && (s[g].spiceLayout = u.spiceLayout);
  });
  const l = new Map([...e].map(([c, u]) => [u, c])), p = t.modules.circuit.spiceLayoutDescription, r = p ? { ...p, faces: (p.faces || []).map((c) => ({ ...c, device: l.get(c.device) })), pairs: (p.pairs || []).map((c) => ({ ...c, members: c.members.map((u) => l.get(u)) })), groups: p.groups.map((c) => ({ ...c, members: c.members.map((u) => u.cell ? { ...u, cell: l.get(u.cell) } : u) })), relations: p.relations.map((c) => ({ ...c, a: l.get(c.a) || c.a, b: l.get(c.b) || c.b })) } : null, d = _t(t.modules.circuit.spiceMotifs || [], (c) => l.get(c), o);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: s, spiceMotifs: d, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([c, u]) => [u, c])) };
}
const Re = /* @__PURE__ */ new Map();
async function Ze(t, e) {
  const n = Kn(t), s = JSON.stringify([n.netlist, e]);
  let o = Re.get(s);
  o ? (Re.delete(s), Re.set(s, o)) : (o = await Yn(n.netlist, e), o.svg.length < 1e6 && (Re.set(s, o), Re.size > 20 && Re.delete(Re.keys().next().value)));
  const l = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (l.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const d of l.querySelectorAll("[id],[class]")) {
    const c = d.getAttribute("id");
    c?.startsWith("cell_") && n.ids.has(c.slice(5)) && d.setAttribute("id", "cell_" + n.ids.get(c.slice(5)));
    const u = d.getAttribute("class");
    u && d.setAttribute("class", u.split(/\s+/).map((x) => x.startsWith("cell_") && n.ids.has(x.slice(5)) ? "cell_" + n.ids.get(x.slice(5)) : /^net_\d+$/.test(x) && n.bits.has(Number(x.slice(4))) ? "net_" + n.bits.get(Number(x.slice(4))) : x).join(" "));
  }
  const p = o.drawing ? structuredClone(o.drawing) : null, r = l.querySelector("#spice-layout-report");
  if (r) {
    const d = JSON.parse(r.textContent), c = (u) => n.ids.get(u) || u;
    d.mirroredTransistors = (d.mirroredTransistors || []).map(c), d.orientationDevicesTested = (d.orientationDevicesTested || []).map(c), d.recognizedMotifs = _t(d.recognizedMotifs || [], c, (u) => n.bits.get(u) ?? u), d.inputAttachments = (d.inputAttachments || []).map(c), d.mirroredInputPorts = (d.mirroredInputPorts || []).map(c);
    for (const u of [...d.flippedPairs || [], ...d.pairOrientationTrials || []]) u.members = u.members.map(c);
    for (const u of d.pairCompactions || [])
      u.members = u.members.map(c), u.moved = c(u.moved);
    for (const u of d.pairConstraints || []) u.members = u.members.map(c);
    for (const u of d.pairProximity || []) u.members = u.members.map(c);
    for (const u of d.motifMeasurements || [])
      u.members = u.members.map(c), u.interlopers && (u.interlopers = u.interlopers.map(c));
    for (const u of d.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    r.textContent = JSON.stringify(d);
  }
  if (p) {
    for (const d of p.components) {
      d.id = n.ids.get(d.id) || d.id;
      for (const c of d.ports) c.bit = n.bits.get(c.bit) ?? c.bit;
    }
    for (const d of p.segments) d.bit = n.bits.get(d.bit) ?? d.bit;
  }
  return { svg: new XMLSerializer().serializeToString(l.documentElement), drawing: p };
}
function Yn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((s, o) => {
    const l = (d, c) => {
      clearTimeout(r), n.terminate(), d ? o(Error(d)) : s(c);
    }, p = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => l("Layout timed out. Open a subcircuit sheet or collapse instances."), p);
    n.onmessage = ({ data: d }) => l(d.error, { svg: d.svg, drawing: d.drawing }), n.onerror = (d) => l(d.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Zn = `* RLC low-pass filter
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
`, Jn = `* Voltage-divider biased common-emitter amplifier.
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
`, eo = `* Common-collector voltage follower; independently chosen example values.
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
`, to = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, no = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, ze = {
  filter: { source: Zn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Jn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: eo, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: to, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: no, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function oo(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Pt(t) {
  return oo(await t.arrayBuffer());
}
const Kt = [
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
].flat(), Ct = "#292b29", st = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Kt[e * 9 + t]))])], Dt = (t) => /^#[\da-f]{6}$/i.test(t), Ut = "spice-node-colors-v1";
function ro(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class io {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = ro(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, st[this.assigned.size % st.length]), this.assigned.get(e)) : Ct;
  }
  set(e, n) {
    if (!Dt(n)) throw Error("Invalid node color.");
    for (const s of e) this.manual.set(s, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((s) => Array.isArray(s) && typeof s[0] == "string" && Dt(s[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function so(t, e, n) {
  const s = new Map(e.map((o) => [o.name, n.color(o.name)]));
  for (const o of t.children) if (["line", "path", "polyline", "circle"].includes(o.localName) && o.hasAttribute("data-net")) {
    const l = s.get(o.getAttribute("data-net"));
    if (!l) continue;
    o.style.setProperty("stroke", l, "important"), o.localName === "circle" && o.style.setProperty("fill", l, "important");
  }
}
function ao(t, e) {
  const n = new io(), s = /* @__PURE__ */ new Set();
  let o = [], l = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Ut) || "null"));
  } catch {
  }
  const p = () => {
    try {
      sessionStorage.setItem(Ut, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, r = () => {
    const g = t("node-search").value.trim().toLowerCase();
    return o.filter((f) => !g || [f.name, f.displayName, ...f.terminals.map((m) => m.component + "." + m.pin)].some((m) => m.toLowerCase().includes(g)));
  };
  function d() {
    const g = r(), f = g.filter((m) => s.has(m.name)).length;
    t("node-count").textContent = `${g.length} / ${o.length} nodes · ${s.size} selected`, t("node-all").checked = !!g.length && f === g.length, t("node-all").indeterminate = f > 0 && f < g.length, t("node-auto").checked = n.auto;
    for (const m of ["node-apply", "node-clear"]) t(m).disabled = !l || !s.size;
    t("node-all").disabled = !l || !g.length;
  }
  function c() {
    t("nets").replaceChildren(...r().map((g) => {
      const f = document.createElement("tr");
      f.dataset.node = g.name;
      const m = document.createElement("td"), h = document.createElement("input");
      h.type = "checkbox", h.checked = s.has(g.name), h.disabled = !l, h.setAttribute("aria-label", "Select node " + g.displayName), h.onchange = () => {
        h.checked ? s.add(g.name) : s.delete(g.name), d();
      }, m.append(h);
      const N = document.createElement("td");
      N.textContent = g.displayName;
      const b = document.createElement("td"), y = document.createElement("input");
      y.type = "color", y.value = n.color(g.name), y.disabled = !l, y.setAttribute("aria-label", "Wire color for " + g.displayName), y.onchange = () => {
        n.set([g.name], y.value), u();
      }, b.append(y);
      const I = document.createElement("td");
      return I.textContent = g.terminals.map((C) => C.component + "." + C.pin).join(", "), f.append(m, N, b, I), f;
    })), d();
  }
  function u() {
    for (const g of o) n.color(g.name);
    c(), p(), e(n, o);
  }
  t("node-search").oninput = c, t("node-all").onchange = () => {
    for (const g of r()) t("node-all").checked ? s.add(g.name) : s.delete(g.name);
    c();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, u();
  }, t("node-apply").onclick = () => {
    n.set(s, t("node-color").value), u();
  }, t("node-clear").onclick = () => {
    n.set(s, Ct), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...Kt.map((g) => {
    const f = document.createElement("button");
    return f.type = "button", f.style.backgroundColor = g, f.title = g, f.setAttribute("aria-label", "Apply palette color " + g), f.onclick = () => {
      s.size && (t("node-color").value = g, n.set(s, g), u());
    }, f;
  }));
  function x(g) {
    l = g;
    for (const f of t("node-panel").querySelectorAll("input,button")) f.disabled = !l;
    d();
  }
  return { snapshot: () => n.snapshot(), restore(g) {
    n.restore(g), s.clear(), u();
  }, setCircuit(g, f) {
    const m = n.sourceId;
    n.setSource(f), m !== n.sourceId && s.clear(), o = Object.values(g?.nodes || {});
    const h = new Set(o.map((N) => N.name));
    for (const N of s) h.has(N) || s.delete(N);
    for (const N of o) n.color(N.name);
    l = !!g, c(), x(l), p(), e(n, o);
  }, setEnabled: x };
}
function lo(t) {
  const e = (L) => t.querySelector("#spice-" + L), n = new AbortController(), s = n.signal, o = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, l = Object.fromEntries(Object.keys(o).map((L) => [L, t.querySelector(`[data-window-handle="${L}"]`)])), p = { editor: !0, details: !0, info: !0 }, r = { editor: !0, details: !0, info: !0 }, d = [], c = { editor: {}, details: {}, info: {} }, u = [];
  let x = !1, g = !1, f = null, m = null, h = null, N = null;
  function b(L, U) {
    r[L] = U, o[L].dataset.pinned = String(U);
    const X = e("pin-" + L), F = { editor: "netlist", details: "details", info: "messages" }[L], te = L === "info" ? "bottom edge" : L === "details" ? "lower left" : "left edge", ne = U ? `Unpin ${F} from ${te}` : `Pin ${F} to ${te}`;
    if (X.setAttribute("aria-pressed", String(U)), X.setAttribute("aria-label", ne), X.title = ne, U) for (const Z of ["left", "top", "right", "bottom", "width", "height"]) o[L].style.removeProperty(Z);
    x && requestAnimationFrame(E);
  }
  for (const L of Object.keys(o)) b(L, !0);
  const y = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: x, panels: { ...p } } })), I = (L, U, X, F = {}) => L.addEventListener(U, X, { ...F, signal: s });
  function C(L, U) {
    p[L] = U, o[L].hidden = x && !U, requestAnimationFrame(E), y();
  }
  function T(L, U = e("details-content")) {
    const X = document.createComment("workspace return");
    L.before(X), d.push({ node: L, anchor: X }), U === e("details-content") ? U.prepend(L) : U.append(L);
  }
  function _(L) {
    const U = L.getBoundingClientRect(), X = t.getBoundingClientRect();
    return { x: U.left - X.left, y: U.top - X.top, w: U.width, h: U.height, width: X.width, height: X.height };
  }
  function M(L, U, X) {
    const F = _(L), te = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, ne = Math.max(8, Math.min(U, F.width - F.w - 8)), Z = Math.max(8, Math.min(te, F.height - F.h - 8)), ve = Math.max(Z, Math.min(X, F.height - F.h - 8));
    L.style.left = Math.round(ne) + "px", L.style.top = Math.round(ve) + "px", L.style.right = "auto", L.style.bottom = "auto";
  }
  function D() {
    if (!x || !r.info || o.info.hidden) return;
    const L = t.getBoundingClientRect(), U = L.width <= 600 ? 8 : 12, X = L.width <= 600 ? U : Math.max(U, ...["editor", "details"].filter((ne) => r[ne] && !o[ne].hidden).map((ne) => o[ne].getBoundingClientRect().right - L.left + 12)), F = Math.min(X, Math.max(U, L.width - 160 - U)), te = o.info;
    for (const [ne, Z] of Object.entries({ left: Math.round(F) + "px", right: U + "px", width: "auto" })) te.style[ne] !== Z && (te.style[ne] = Z);
  }
  function E() {
    if (x) {
      D();
      for (const [L, U] of Object.entries(o)) if (!U.hidden && !r[L]) {
        const X = _(U);
        M(U, X.x, X.y);
      }
    }
  }
  function w() {
    for (const L of Object.values(o))
      for (const U of ["left", "top", "right", "bottom", "width", "height", "z-index"]) L.style.removeProperty(U);
    for (const L of Object.keys(o))
      b(L, !0), C(L, !0);
    requestAnimationFrame(E);
  }
  function B() {
    if (x) return;
    x = !0, f = document.activeElement, m = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, N = document.createComment("workspace mount"), t.before(N), document.body.append(t);
    for (const U of document.body.children) U !== t && (u.push({ node: U, inert: U.inert }), U.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const U of Object.keys(o))
      c[U].base = o[U].style.cssText, c[U].floating && (o[U].style.cssText = c[U].floating), o[U].setAttribute("role", "dialog"), o[U].setAttribute("aria-modal", "false"), o[U].setAttribute("aria-labelledby", "spice-" + U + "-title"), l[U].tabIndex = 0, l[U].title = "Drag to move; arrow keys move the window", C(U, p[U]);
    for (const U of ["selection-actions", "selection", "hierarchy-panel"]) T(e(U));
    const L = e("workspace-strip");
    for (const U of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (L.childElementCount) {
        const X = document.createElement("span");
        X.className = "spice-tool-divider", X.setAttribute("role", "separator"), X.setAttribute("aria-orientation", "vertical"), L.append(X);
      }
      T(U === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(U), L);
    }
    requestAnimationFrame(E), e("exit-fullscreen").focus({ preventScroll: !0 }), y();
  }
  function W() {
    if (x) {
      x = !1, h = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: L, anchor: U } of d.splice(0))
        U.before(L), U.remove();
      e("workspace-strip").replaceChildren();
      for (const L of Object.keys(o)) {
        c[L].floating = o[L].style.cssText, o[L].style.cssText = c[L].base, o[L].hidden = !1;
        for (const U of ["role", "aria-modal", "aria-labelledby"]) o[L].removeAttribute(U);
        l[L].removeAttribute("tabindex"), l[L].removeAttribute("title");
      }
      N && (N.before(t), N.remove(), N = null);
      for (const { node: L, inert: U } of u.splice(0)) L.inert = U;
      m && (document.documentElement.style.overflow = m.html, document.body.style.overflow = m.body, window.scrollTo(m.x, m.y)), f?.focus?.({ preventScroll: !0 }), y();
    }
  }
  async function z() {
    B(), t.dataset.nativeFullscreen = "false";
  }
  async function $() {
    if (g = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        g = !0;
        return;
      }
    W();
  }
  I(e("fullscreen"), "click", () => x ? $() : z()), I(e("exit-fullscreen"), "click", $), I(e("reset-windows"), "click", w);
  for (const L of Object.keys(o)) {
    I(e("pin-" + L), "click", () => {
      const F = _(o[L]);
      b(L, !r[L]), r[L] || (o[L].style.width = F.w + "px", o[L].style.height = F.h + "px", M(o[L], F.x, F.y)), y();
    }), I(e("close-" + L), "click", () => {
      C(L, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), I(o[L], "pointerdown", () => {
      if (x) {
        for (const F of Object.values(o)) F.style.zIndex = "20";
        o[L].style.zIndex = "30";
      }
    }, { capture: !0 });
    const U = l[L];
    I(U, "pointerdown", (F) => {
      if (!x || F.button !== 0 || F.target.closest("button,input,select,textarea,a,label")) return;
      F.preventDefault();
      const te = _(o[L]);
      b(L, !1), o[L].style.width = te.w + "px", o[L].style.height = te.h + "px", M(o[L], te.x, te.y), h = { id: L, pointer: F.pointerId, x: F.clientX, y: F.clientY, left: te.x, top: te.y }, U.setPointerCapture(F.pointerId);
    }), I(U, "pointermove", (F) => {
      h?.id === L && h.pointer === F.pointerId && M(o[L], h.left + F.clientX - h.x, h.top + F.clientY - h.y);
    });
    const X = () => {
      h = null;
    };
    I(U, "pointerup", X), I(U, "pointercancel", X), I(U, "lostpointercapture", X), I(U, "keydown", (F) => {
      if (!x || F.target !== U || !F.key.startsWith("Arrow")) return;
      F.preventDefault();
      const te = _(o[L]), ne = F.shiftKey ? 32 : 8;
      b(L, !1), o[L].style.width = te.w + "px", o[L].style.height = te.h + "px", M(o[L], te.x + ({ ArrowLeft: -ne, ArrowRight: ne }[F.key] || 0), te.y + ({ ArrowUp: -ne, ArrowDown: ne }[F.key] || 0));
    });
  }
  I(document, "fullscreenchange", () => {
    x && g && document.fullscreenElement !== t && (g = !1, W());
  }), I(document, "keydown", (L) => {
    x && L.altKey && L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), $());
  }, { capture: !0 }), I(window, "resize", E);
  const ee = new ResizeObserver(E);
  for (const L of Object.values(o)) ee.observe(L);
  return { enter: z, exit: $, showPanel: C, reset: w, destroy() {
    $(), n.abort(), ee.disconnect();
  } };
}
const co = `<svg
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
  <circle cx="12" cy="12" r="10" />
  <path d="m9 12 2 2 4-4" />
</svg>
`, lt = (t) => !t.decoration || t.selectable === !0;
function Bt(t, e, n) {
  const s = Math.min(e.x, n.x), o = Math.max(e.x, n.x), l = Math.min(e.y, n.y), p = Math.max(e.y, n.y), r = n.x < e.x, d = 1e-3;
  return t.filter((c) => lt(c) && (r ? c.x <= o + d && c.x + c.width >= s - d && c.y <= p + d && c.y + c.height >= l - d : c.x >= s - d && c.x + c.width <= o + d && c.y >= l - d && c.y + c.height <= p + d)).map((c) => c.id);
}
function uo(t, e, n, s) {
  const o = new Set(e), l = t.filter((N) => o.has(N.id) && lt(N)), p = n.startsWith("space-");
  if (l.length < (p ? 3 : 2)) throw Error(p ? "Select at least three components." : "Select at least two components.");
  const r = ["left", "right", "center-x", "space-x"].includes(n), d = ["top", "bottom", "center-y", "space-y"].includes(n);
  if (!r && !d) throw Error("Unknown arrangement.");
  const c = r ? "x" : "y", u = r ? "width" : "height", x = Math.min(...l.map((N) => N[c])), g = Math.max(...l.map((N) => N[c] + N[u])), f = /* @__PURE__ */ new Map();
  if (p) {
    const N = [...l].sort((T, _) => T[c] - _[c] || T.id.localeCompare(_.id)), b = N.at(-1), y = b[c] + b[u] - N[0][c], I = (y - N.reduce((T, _) => T + _[u], 0)) / (l.length - 1);
    if (I < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let C = N[0][c];
    for (const T of N)
      f.set(T.id, C), C += T[u] + I;
  } else for (const N of l) f.set(N.id, ["left", "top"].includes(n) ? x : ["right", "bottom"].includes(n) ? g - N[u] : (x + g - N[u]) / 2);
  let m = !1;
  return { moves: l.map((N) => {
    const b = f.get(N.id) - N[c], y = Math.round(b / s) * s;
    return Math.abs(y - b) > 1e-3 && (m = !0), { id: N.id, dx: r ? y : 0, dy: d ? y : 0 };
  }), rounded: m };
}
const fo = (t) => "@manual-group/" + t;
function xt(t, e = []) {
  const n = new Set(t);
  for (const s of e) if (s.members.some((o) => n.has(o))) for (const o of s.members) n.add(o);
  return n;
}
function Je(t, e = []) {
  const n = new Set(t);
  return e.find((s) => s.members.length === n.size && s.members.every((o) => n.has(o)));
}
function Pe(t, e = []) {
  const n = new Map(t.map((l) => [l.id, l])), s = new Set(e.flatMap((l) => l.members)), o = t.filter((l) => !s.has(l.id)).map((l) => ({ ...l, members: [l.id] }));
  for (const l of e) {
    const p = l.members.map((c) => n.get(c));
    if (p.some((c) => !c)) throw Error("Unknown manual group member.");
    const r = Math.min(...p.map((c) => c.x)), d = Math.min(...p.map((c) => c.y));
    o.push({ id: fo(l.id), groupId: l.id, members: [...l.members], x: r, y: d, width: Math.max(...p.map((c) => c.x + c.width)) - r, height: Math.max(...p.map((c) => c.y + c.height)) - d, ports: [] });
  }
  return o;
}
function qe(t, e = []) {
  if (!e.length) return !1;
  const n = Pe(t, e);
  return n.some((s, o) => n.slice(o + 1).some((l) => (s.groupId || l.groupId) && s.x < l.x + l.width - 1e-3 && s.x + s.width > l.x + 1e-3 && s.y < l.y + l.height - 1e-3 && s.y + s.height > l.y + 1e-3));
}
function Yt(t, e) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 5e3) throw Error("Invalid project: invalid manual groups.");
  const n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), o = new Map(e.map((l) => [l.id, l]));
  for (const l of t) {
    if (!l || typeof l.id != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(l.id) || n.has(l.id) || !Array.isArray(l.members) || l.members.length < 2) throw Error("Invalid project: invalid manual group identity.");
    n.add(l.id);
    for (const p of l.members) {
      const r = o.get(p);
      if (!r || !lt(r) || s.has(p)) throw Error("Invalid project: missing or duplicate manual group member.");
      s.add(p);
    }
  }
}
const ct = (t, e) => encodeURIComponent(t) + ":" + e;
function Zt(t) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 2e4) throw Error("Invalid project: invalid label overrides.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!n || typeof n.owner != "string" || !Number.isSafeInteger(n.index) || n.index < 0 || n.id !== ct(n.owner, n.index) || e.has(n.id) || typeof n.text != "string" || n.text.length > 2e4 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(n.text) || ![n.x, n.y].every((o) => Number.isFinite(o) && Math.abs(o) <= 1e6)) throw Error("Invalid project: invalid label identity, text or position.");
    e.add(n.id);
    const s = n.orientation;
    if (!Array.isArray(s) || s.length !== 4 || !s.every((o) => [-1, 0, 1].includes(o)) || s[0] ** 2 + s[1] ** 2 !== 1 || s[2] ** 2 + s[3] ** 2 !== 1 || s[0] * s[2] + s[1] * s[3] !== 0) throw Error("Invalid project: label transform must be a rotation or mirror.");
  }
}
function po(t, e) {
  const n = { rotate: [0, 1, -1, 0], "mirror-x": [1, 0, 0, -1], "mirror-y": [-1, 0, 0, 1] }[e];
  if (!n) throw Error("Unknown label transform.");
  const s = t.orientation;
  return { ...t, orientation: [n[0] * s[0] + n[2] * s[1], n[1] * s[0] + n[3] * s[1], n[0] * s[2] + n[2] * s[3], n[1] * s[2] + n[3] * s[3]].map((o) => o || 0) };
}
const ho = "http://www.w3.org/2000/svg";
function Jt(t) {
  const e = /* @__PURE__ */ new Map();
  return [...t.querySelectorAll("text")].filter((n) => !n.closest("defs")).map((n) => {
    const s = n.closest('g[id^="cell_"]')?.id.slice(5) || "", o = e.get(s) || 0;
    return e.set(s, o + 1), { node: n, owner: s, index: o, id: ct(s, o) };
  });
}
function vt(t, e) {
  Zt(e);
  const n = new Set(Jt(t).map((s) => s.id));
  for (const s of e || []) if (!n.has(s.id)) throw Error("Invalid project: unknown label " + s.id);
}
function mo() {
  let t = null, e = /* @__PURE__ */ new Map(), n = [], s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = !1, p = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  const d = (f, m) => {
    const h = document.createElementNS(ho, f);
    for (const [N, b] of Object.entries(m)) h.setAttribute(N, b);
    return h;
  };
  function c() {
    for (const f of e.values()) if (f.node.isConnected) {
      for (const m of [...f.node.attributes]) f.node.removeAttribute(m.name);
      for (const [m, h] of f.attributes) f.node.setAttribute(m, h);
      f.node.textContent = f.text;
    }
    t?.querySelector("[data-label-hit-layer]")?.remove(), e.clear(), n = [];
  }
  function u(f) {
    const m = f.getBBox(), h = t.getCTM().inverse().multiply(f.getCTM()), N = [[m.x, m.y], [m.x + m.width, m.y], [m.x, m.y + m.height], [m.x + m.width, m.y + m.height]].map(([I, C]) => new DOMPoint(I, C).matrixTransform(h)), b = Math.min(...N.map((I) => I.x)), y = Math.min(...N.map((I) => I.y));
    return { x: b, y, width: Math.max(...N.map((I) => I.x)) - b, height: Math.max(...N.map((I) => I.y)) - y };
  }
  function x(f, m) {
    f.node.textContent = m.text;
    const h = f.node.getBBox(), [N, b, y, I] = m.orientation, C = s.get(m.owner) || { x: 0, y: 0 }, T = [0, N * h.width, y * h.height, N * h.width + y * h.height], _ = [0, b * h.width, I * h.height, b * h.width + I * h.height], M = new DOMMatrix([N, b, y, I, C.x + m.x - Math.min(...T) - N * h.x - y * h.y, C.y + m.y - Math.min(..._) - b * h.x - I * h.y]), D = t.getCTM().inverse().multiply(f.node.parentElement.getCTM()), E = new DOMMatrix([D.a, D.b, D.c, D.d, D.e, D.f]), w = E.inverse().multiply(M);
    f.node.setAttribute("transform", "matrix(" + [w.a, w.b, w.c, w.d, w.e, w.f].join(" ") + ")");
  }
  function g() {
    if (t?.querySelector("[data-label-hit-layer]")?.remove(), r.clear(), !l || !t) return;
    const f = d("g", { "data-label-hit-layer": "true", "data-editor-overlay": "true" });
    for (const h of n) {
      const N = d("rect", { x: h.x - 2, y: h.y - 2, width: Math.max(8, h.width) + 4, height: Math.max(12, h.height) + 4, fill: p.has(h.id) ? "#507d9c" : "transparent", "fill-opacity": p.has(h.id) ? 0.12 : 0, stroke: "#507d9c", "stroke-opacity": p.has(h.id) ? 1 : 0.35, "stroke-width": p.has(h.id) ? 1.5 : 0.7, "stroke-dasharray": p.has(h.id) ? "none" : "3 3", "vector-effect": "non-scaling-stroke", "pointer-events": "all", "data-editor-label": h.id, ...p.has(h.id) ? { "data-selected-label": h.id } : {} });
      r.set(h.id, N), f.append(N);
    }
    const m = t.querySelector("[data-airwires]");
    m ? t.insertBefore(f, m) : t.append(f);
  }
  return {
    reset: c,
    layout(f, m, h, N, b) {
      t = f, s = new Map(m.map((y) => [y.id, y])), o = new Map((h || []).map((y) => [y.id, y])), l = N, p = b, e.clear(), n = [];
      for (const y of Jt(t)) {
        const I = u(y.node), C = s.get(y.owner) || { x: 0, y: 0 }, T = { ...y, attributes: [...y.node.attributes].map((M) => [M.name, M.value]), text: y.node.textContent, record: { id: y.id, owner: y.owner, index: y.index, text: y.node.textContent, x: I.x - C.x, y: I.y - C.y, orientation: [1, 0, 0, 1] } };
        e.set(y.id, T);
        const _ = o.get(y.id);
        _ && x(T, _), y.node.dataset.labelId = y.id, n.push({ id: y.id, ...u(y.node), ports: [] });
      }
      return g(), { x: Math.min(0, ...n.map((y) => y.x)), y: Math.min(0, ...n.map((y) => y.y)), right: Math.max(0, ...n.map((y) => y.x + y.width)), bottom: Math.max(0, ...n.map((y) => y.y + y.height)) };
    },
    nodes: () => n,
    record(f) {
      const m = e.get(f);
      if (!m) throw Error("Label no longer exists.");
      return structuredClone(o.get(f) || m.record);
    },
    preview(f) {
      const m = new Set(f.map((h) => h.id));
      for (const h of f) {
        const N = e.get(h.id);
        if (N) {
          const b = this.record(h.id);
          x(N, { ...b, x: b.x + h.dx, y: b.y + h.dy });
        }
      }
      n = n.map((h) => {
        if (!m.has(h.id)) return h;
        const N = { ...h, ...u(e.get(h.id).node) }, b = r.get(h.id);
        if (b) for (const [y, I] of Object.entries({ x: N.x - 2, y: N.y - 2, width: Math.max(8, N.width) + 4, height: Math.max(12, N.height) + 4 })) b.setAttribute(y, I);
        return N;
      });
    }
  };
}
const ae = 1e-3, de = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), pe = (t, e) => Math.abs(t - e) < ae, Se = (t, e) => pe(e.a.x, e.b.x) ? pe(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - ae && t.y <= Math.max(e.a.y, e.b.y) + ae : pe(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - ae && t.x <= Math.max(e.a.x, e.b.x) + ae, go = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), bo = (t, e) => Math.max(t.a.x, t.b.x) > e.x + ae && Math.min(t.a.x, t.b.x) < e.x + e.width - ae && Math.max(t.a.y, t.b.y) > e.y + ae && Math.min(t.a.y, t.b.y) < e.y + e.height - ae;
function ut(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && de(e.at(-1)) === de(n))) {
      for (; e.length > 1 && (pe(e.at(-2).x, e.at(-1).x) && pe(e.at(-1).x, n.x) || pe(e.at(-2).y, e.at(-1).y) && pe(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class en {
  constructor(e, { step: n = 8, segments: s = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(s), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
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
    return pe(e.x / this.step, Math.round(e.x / this.step)) && pe(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !pe(e.a.x, e.b.x) && !pe(e.a.y, e.b.y)) return !1;
    const s = this.pins();
    if (s.some((o) => o.bit !== n && Se(o, e)) || this.segments.some((o) => o.bit !== n && (Se(e.a, o) || Se(e.b, o) || Se(o.a, e) || Se(o.b, e)))) return !1;
    for (const o of this.components) if (bo(e, o) && !s.filter((p) => p.owner === o.id && p.bit === n).some((p) => p.side === "NORTH" ? pe(e.a.x, p.x) && pe(e.b.x, p.x) && Math.max(e.a.y, e.b.y) <= p.y + ae : p.side === "SOUTH" ? pe(e.a.x, p.x) && pe(e.b.x, p.x) && Math.min(e.a.y, e.b.y) >= p.y - ae : p.side === "WEST" ? pe(e.a.y, p.y) && pe(e.b.y, p.y) && Math.max(e.a.x, e.b.x) <= p.x + ae : p.side === "EAST" ? pe(e.a.y, p.y) && pe(e.b.y, p.y) && Math.min(e.a.x, e.b.x) >= p.x - ae : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const s = ut(n), o = s.slice(1).map((l, p) => ({ bit: e, a: s[p], b: l })).filter((l) => go(l) > ae);
    if (!o.length) return !1;
    if (o.some((l) => !this.validSegment(l, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...o), !0;
  }
  move(e, n, s) {
    if (this.manualGroups?.length) return this.moveMany([{ id: e, dx: n, dy: s }]);
    if (n = Math.round(n / this.step) * this.step, s = Math.round(s / this.step) * this.step, !n && !s) return;
    const o = this.snapshot(), l = this.components.find((d) => d.id === e);
    if (!l) return;
    const p = l.ports.map((d) => ({ ...d }));
    this.segments = this.segments.filter((d) => !p.some((c) => c.bit === d.bit && (de(c) === de(d.a) || de(c) === de(d.b)))), l.x += n, l.y += s;
    for (const d of l.ports)
      d.x += n, d.y += s;
    if (this.pinCache = null, this.components.some((d) => d !== l && l.x < d.x + d.width - ae && l.x + l.width > d.x + ae && l.y < d.y + d.height - ae && l.y + l.height > d.y + ae) || this.segments.some((d) => !this.validSegment(d, d.bit)) || l.ports.some((d) => this.pins().some((c) => c.owner !== e && c.bit !== d.bit && de(c) === de(d))))
      throw this.restore(o), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(o);
  }
  moveMany(e) {
    const n = new Map(e.map((c) => [c.id, { ...c }]));
    for (const c of this.manualGroups || []) {
      const u = c.members.map((g) => n.get(g)).filter(Boolean);
      if (!u.length) continue;
      const x = u[0];
      if (u.some((g) => g.dx !== x.dx || g.dy !== x.dy)) throw Error("Grouped components must move together.");
      for (const g of c.members) n.set(g, { id: g, dx: x.dx, dy: x.dy });
    }
    e = [...n.values()];
    const s = new Map(e.map((c) => [c.id, { dx: Math.round(c.dx / this.step) * this.step, dy: Math.round(c.dy / this.step) * this.step }]).filter(([, c]) => c.dx || c.dy)), o = this.components.filter((c) => s.has(c.id));
    if (!o.length) return !1;
    const l = this.snapshot(), p = o.flatMap((c) => c.ports);
    this.segments = this.segments.filter((c) => !p.some((u) => u.bit === c.bit && Se(u, c)));
    for (const c of o) {
      const u = s.get(c.id);
      c.x += u.dx, c.y += u.dy;
      for (const x of c.ports)
        x.x += u.dx, x.y += u.dy;
    }
    this.pinCache = null, this.cache = null;
    const r = this.pins();
    if (o.some((c) => this.components.some((u) => u !== c && c.x < u.x + u.width - ae && c.x + c.width > u.x + ae && c.y < u.y + u.height - ae && c.y + c.height > u.y + ae)) || qe(this.components, this.manualGroups) || r.some((c) => !this.onGrid(c) || r.some((u) => u.owner !== c.owner && u.bit !== c.bit && de(u) === de(c))) || this.segments.some((c) => !this.validSegment(c, c.bit)))
      throw this.restore(l), Error("Arrangement blocked: a component, manual group or another node occupies the target position.");
    return this.remember(l), !0;
  }
  transform(e, n) {
    const s = this.manualGroups?.find((f) => f.members.includes(e));
    if (s) return this.transformGroup(s.id, n);
    const o = this.components.find((f) => f.id === e);
    if (!o) return;
    const l = this.snapshot(), p = o.width, r = o.height, d = n === "rotate" ? [0, 1, -1, 0, r, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, r] : n === "mirror-y" ? [-1, 0, 0, 1, p, 0] : null;
    if (!d) throw Error("Unknown transform.");
    const c = o.ports.map((f) => ({ ...f })), u = (f) => ({ x: d[0] * f.x + d[2] * f.y + d[4], y: d[1] * f.x + d[3] * f.y + d[5] });
    this.segments = this.segments.filter((f) => !c.some((m) => m.bit === f.bit && (de(m) === de(f.a) || de(m) === de(f.b))));
    const x = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const f of o.ports) {
      const m = u({ x: f.x - o.x, y: f.y - o.y });
      f.x = o.x + m.x, f.y = o.y + m.y, f.side = x[f.side] || f.side;
    }
    const g = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [d[0] * g[0] + d[2] * g[1], d[1] * g[0] + d[3] * g[1], d[0] * g[2] + d[2] * g[3], d[1] * g[2] + d[3] * g[3], d[0] * g[4] + d[2] * g[5] + d[4], d[1] * g[4] + d[3] * g[5] + d[5]], n === "rotate" && (o.width = r, o.height = p), this.pinCache = null, qe(this.components, this.manualGroups) || o.ports.some((f) => !this.onGrid(f)) || this.components.some((f) => f !== o && o.x < f.x + f.width - ae && o.x + o.width > f.x + ae && o.y < f.y + f.height - ae && o.y + o.height > f.y + ae) || this.segments.some((f) => !this.validSegment(f, f.bit)) || o.ports.some((f) => this.pins().some((m) => m.owner !== e && m.bit !== f.bit && de(m) === de(f))))
      throw this.restore(l), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(l);
  }
  group(e) {
    const n = [...xt(e, this.manualGroups)], s = (this.manualGroups || []).filter((p) => !p.members.some((r) => n.includes(r)));
    if (n.length < 2) throw Error("Select at least two components to group.");
    let o = 1;
    for (; s.some((p) => p.id === "g" + o); ) o++;
    const l = { id: "g" + o, members: n };
    if (s.push(l), Yt(s, this.components), qe(this.components, s)) throw Error("Group box overlaps an unselected component or another group. Include it in the selection or move it away.");
    return this.remember(), this.manualGroups = s, l;
  }
  ungroup(e) {
    const n = new Set(e), s = (this.manualGroups || []).filter((o) => !o.members.some((l) => n.has(l)));
    return s.length === (this.manualGroups || []).length ? !1 : (this.remember(), this.manualGroups = s, !0);
  }
  transformGroup(e, n) {
    const s = this.manualGroups?.find((f) => f.id === e);
    if (!s) return;
    const o = Pe(this.components, [s]).find((f) => f.groupId === e), l = n === "rotate" ? [0, 1, -1, 0, o.height, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, o.height] : n === "mirror-y" ? [-1, 0, 0, 1, o.width, 0] : null;
    if (!l) throw Error("Unknown group transform.");
    const p = this.snapshot(), r = this.components.filter((f) => s.members.includes(f.id)), d = r.flatMap((f) => f.ports);
    this.segments = this.segments.filter((f) => !d.some((m) => m.bit === f.bit && Se(m, f)));
    const c = (f) => ({ x: o.x + l[0] * (f.x - o.x) + l[2] * (f.y - o.y) + l[4], y: o.y + l[1] * (f.x - o.x) + l[3] * (f.y - o.y) + l[5] }), u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const f of r) {
      const m = f.width, h = f.height, N = [c(f), c({ x: f.x + m, y: f.y + h })], b = Math.min(...N.map((T) => T.x)), y = Math.min(...N.map((T) => T.y)), I = c(f), C = f.editorMatrix || [1, 0, 0, 1, 0, 0];
      f.editorMatrix = [l[0] * C[0] + l[2] * C[1], l[1] * C[0] + l[3] * C[1], l[0] * C[2] + l[2] * C[3], l[1] * C[2] + l[3] * C[3], l[0] * C[4] + l[2] * C[5] + I.x - b, l[1] * C[4] + l[3] * C[5] + I.y - y];
      for (const T of f.ports) {
        const _ = c(T);
        T.x = _.x, T.y = _.y, T.side = u[T.side] || T.side;
      }
      f.x = b, f.y = y, n === "rotate" && (f.width = h, f.height = m);
    }
    this.pinCache = null, this.cache = null;
    const x = this.pins();
    if (r.some((f) => this.components.some((m) => m !== f && f.x < m.x + m.width - ae && f.x + f.width > m.x + ae && f.y < m.y + m.height - ae && f.y + f.height > m.y + ae)) || qe(this.components, this.manualGroups) || x.some((f) => !this.onGrid(f) || x.some((m) => m.bit !== f.bit && de(m) === de(f))) || this.segments.some((f) => !this.validSegment(f, f.bit)))
      throw this.restore(p), Error("Group transform blocked by a component, wire or another node.");
    this.remember(p);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const s of this.pins())
      e.has(s.bit) || e.set(s.bit, { pins: [], segments: [] }), e.get(s.bit).pins.push(s);
    for (const s of this.segments)
      e.has(s.bit) || e.set(s.bit, { pins: [], segments: [] }), e.get(s.bit).segments.push(s);
    const n = [];
    for (const [s, o] of e) {
      const l = /* @__PURE__ */ new Map(), p = (u) => {
        l.has(de(u)) || l.set(de(u), u);
      };
      o.pins.forEach(p);
      for (const u of o.segments)
        p(u.a), p(u.b);
      for (let u = 0; u < o.segments.length; u++) for (let x = u + 1; x < o.segments.length; x++) {
        const g = o.segments[u], f = o.segments[x];
        if (pe(g.a.x, g.b.x) === pe(f.a.x, f.b.x)) continue;
        const m = pe(g.a.x, g.b.x) ? g : f, h = m === g ? f : g, N = { x: m.a.x, y: h.a.y };
        Se(N, m) && Se(N, h) && p(N);
      }
      const r = new Map([...l.keys()].map((u) => [u, u])), d = (u) => {
        let x = u;
        for (; r.get(x) !== x; ) x = r.get(x);
        for (; u !== x; ) {
          const g = r.get(u);
          r.set(u, x), u = g;
        }
        return x;
      };
      for (const u of o.segments) {
        const x = [...l.values()].filter((g) => Se(g, u));
        for (const g of x.slice(1)) r.set(d(de(g)), d(de(x[0])));
      }
      const c = /* @__PURE__ */ new Map();
      for (const u of o.pins) {
        const x = d(de(u));
        c.has(x) || c.set(x, { pins: [], points: [] }), c.get(x).pins.push(u);
      }
      for (const u of l.values()) {
        const x = d(de(u));
        c.has(x) && c.get(x).points.push(u);
      }
      n.push({ bit: s, islands: [...c.values()], points: [...l.values()], segments: o.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: s } of this.connectivity()) {
      if (s.length < 2) continue;
      const o = /* @__PURE__ */ new Set([0]);
      for (; o.size < s.length; ) {
        let l;
        for (const p of o) for (let r = 0; r < s.length; r++) if (!o.has(r)) for (const d of s[p].points) for (const c of s[r].points) {
          const u = (d.x - c.x) ** 2 + (d.y - c.y) ** 2;
          (!l || u < l.d) && (l = { bit: n, a: d, b: c, d: u, j: r });
        }
        e.push(l), o.add(l.j);
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
    const s = Math.min(...e), o = Math.min(...n);
    return { x: s, y: o, w: Math.max(...e) - s, h: Math.max(...n) - o };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments), ...this.labelOverrides?.length ? { labelOverrides: structuredClone(this.labelOverrides) } : {}, ...this.manualGroups?.length ? { manualGroups: structuredClone(this.manualGroups) } : {} };
  }
  findPath(e, n, s) {
    if (!this.onGrid(n) || !this.onGrid(s)) return null;
    const o = (T) => T.slice(1).every((_, M) => this.validSegment({ a: T[M], b: _ }, e));
    for (const T of [[n, s], [n, { x: s.x, y: n.y }, s], [n, { x: n.x, y: s.y }, s]]) {
      const _ = ut(T);
      if (o(_)) return _;
    }
    const l = this.step, p = this.bounds(), r = Math.floor(Math.min(p.x, n.x, s.x) / l) - 5, d = Math.ceil(Math.max(p.x + p.w, n.x, s.x) / l) + 5, c = Math.floor(Math.min(p.y, n.y, s.y) / l) - 5, u = Math.ceil(Math.max(p.y + p.h, n.y, s.y) / l) + 5, x = { x: n.x / l, y: n.y / l, dir: -1, cost: 0, key: n.x / l + "," + n.y / l + ",-1" }, g = [x], f = /* @__PURE__ */ new Map([[x.key, 0]]), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map([[x.key, x]]), N = [[1, 0], [-1, 0], [0, 1], [0, -1]], b = (T) => Math.abs(T.x - s.x / l) + Math.abs(T.y - s.y / l);
    let y = null, I = 0;
    for (; g.length && I++ < 3e4; ) {
      let T = 0;
      for (let M = 1; M < g.length; M++) g[M].cost + b(g[M]) < g[T].cost + b(g[T]) && (T = M);
      const _ = g.splice(T, 1)[0];
      if (_.cost === f.get(_.key)) {
        if (_.x === s.x / l && _.y === s.y / l) {
          y = _;
          break;
        }
        for (let M = 0; M < 4; M++) {
          const D = _.x + N[M][0], E = _.y + N[M][1];
          if (D < r || D > d || E < c || E > u) continue;
          const w = { x: D, y: E, dir: M, key: D + "," + E + "," + M, cost: _.cost + 1 + (_.dir !== -1 && _.dir !== M ? 3 : 0) };
          w.cost >= (f.get(w.key) ?? 1 / 0) || !this.validSegment({ a: { x: _.x * l, y: _.y * l }, b: { x: D * l, y: E * l } }, e) || (f.set(w.key, w.cost), m.set(w.key, _.key), h.set(w.key, w), g.push(w));
        }
      }
    }
    if (!y) return null;
    const C = [];
    for (let T = y; T; T = h.get(m.get(T.key))) C.push({ x: T.x * l, y: T.y * l });
    return ut(C.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const s = /* @__PURE__ */ new Set();
    let o = 0;
    for (; !e() && o++ < Math.max(20, this.pins().length * 2); ) {
      const l = this.airwires().find((r) => !s.has(r.bit + ":" + de(r.a) + ":" + de(r.b)));
      if (!l) break;
      const p = this.findPath(l.bit, l.a, l.b);
      p ? (this.segments.push(...p.slice(1).map((r, d) => ({ bit: l.bit, a: p[d], b: r }))), this.cache = null) : s.add(l.bit + ":" + de(l.a) + ":" + de(l.b)), o % 3 === 0 && await new Promise((r) => setTimeout(r, 0));
    }
    this.redoStack = [];
  }
}
const tn = "spice-viewer-project", nn = 4, on = 32 * 1024 * 1024, re = (t) => {
  throw Error("Invalid project: " + t);
}, Ie = (t) => t && typeof t == "object" && !Array.isArray(t), De = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, We = (t) => Ie(t) && De(t.x) && De(t.y), Te = (t, e) => Math.abs(t - e) < 1e-3, Xe = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function jt(t) {
  return Ie(t) && We(t) && De(t.w) && De(t.h) && t.w > 0 && t.h > 0;
}
function Vt(t) {
  (!Ie(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && re("unsupported drawing settings.");
}
function rn(t) {
  new TextEncoder().encode(t).length > on && re("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    re("expected a JSON project file.");
  }
  (!Ie(e) || e.format !== tn) && re("unrecognized file format."), [1, 2, 3, nn].includes(e.version) || re("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Ke && re("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && re("missing netlist or sheet."), (!Ie(e.libraries) || Object.entries(e.libraries).some(([s, o]) => !s || ["__proto__", "constructor", "prototype"].includes(s) || typeof o != "string")) && re("invalid libraries."), Vt(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((s) => typeof e[s] != "boolean") || !jt(e.view)) && re("invalid display settings."), e.labelEditing !== void 0 && typeof e.labelEditing != "boolean" && re("invalid label editing mode."), (!Ie(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((s) => !Array.isArray(e.colors[s]) || e.colors[s].some((o) => !Array.isArray(o) || o.length !== 2 || typeof o[0] != "string" || !/^#[\da-f]{6}$/i.test(o[1])))) && re("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && re("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const s of e.sheets) {
    (!Ie(s) || typeof s.scope != "string" || typeof s.topology != "string") && re("invalid sheet identity."), Vt(s.settings);
    const o = Xe(s.scope, s.topology, s.settings);
    n.has(o) && re("duplicate sheet."), n.add(o), (s.settings.gridSize !== 4 || !s.settings.conventional) && re("saved manual scenes require the fixed 4-unit grid."), s.view !== void 0 && !jt(s.view) && re("invalid sheet viewport."), s.templateSource !== void 0 && (typeof s.templateSource != "string" || !s.templateSource || s.templateSource === s.scope || s.templateSource.length > 1e4) && re("invalid layout template source."), sn(s.snapshot);
  }
  return e;
}
function yo(t) {
  const e = { ...t, format: tn, version: nn, layoutRulesVersion: Ke, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return rn(n), n;
}
function sn(t) {
  (!Ie(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && re("invalid scene size."), Zt(t.labelOverrides), Yt(t.manualGroups, t.components);
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!Ie(n) || typeof n.id != "string" || e.has(n.id) || !We(n) || !De(n.width) || !De(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && re("invalid component geometry."), e.add(n.id);
    const s = /* @__PURE__ */ new Set();
    for (const o of n.ports)
      (!We(o) || typeof o.pin != "string" || s.has(o.pin) || !Number.isInteger(o.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(o.side)) && re("invalid pin."), s.add(o.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(De)) && re("invalid symbol transform.");
  }
  for (const n of t.segments) (!Ie(n) || !Number.isInteger(n.bit) || !We(n.a) || !We(n.b) || !Te(n.a.x, n.b.x) && !Te(n.a.y, n.b.y)) && re("wire must be orthogonal.");
}
function at(t, e, n) {
  sn(e);
  const s = new Map(t.components.map((d) => [d.id, d]));
  s.size !== e.components.length && re("component count changed.");
  const o = e.components.map((d) => {
    const c = s.get(d.id);
    (!c || !!c.decoration != !!d.decoration || c.ports.length !== d.ports.length) && re("component identity changed: " + d.id);
    const u = d.editorMatrix || [1, 0, 0, 1, 0, 0], [x, g, f, m] = u;
    (![x, g, f, m].every((b) => [-1, 0, 1].includes(b)) || x * x + g * g !== 1 || f * f + m * m !== 1 || x * f + g * m !== 0) && re("symbol transform must be a rotation or mirror.");
    const h = [[0, 0], [c.width, 0], [0, c.height], [c.width, c.height]].map(([b, y]) => ({ x: x * b + f * y + u[4], y: g * b + m * y + u[5] }));
    (!Te(Math.min(...h.map((b) => b.x)), 0) || !Te(Math.min(...h.map((b) => b.y)), 0) || !Te(Math.max(...h.map((b) => b.x)), d.width) || !Te(Math.max(...h.map((b) => b.y)), d.height)) && re("symbol dimensions changed: " + d.id);
    const N = d.ports.map((b) => {
      const y = c.ports.find((T) => T.pin === b.pin);
      (!y || y.bit !== b.bit || !Te(b.x, d.x + x * (y.x - c.x) + f * (y.y - c.y) + u[4]) || !Te(b.y, d.y + g * (y.x - c.x) + m * (y.y - c.y) + u[5])) && re("pin connectivity or position changed: " + d.id + "." + b.pin);
      const I = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[y.side], C = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, T]) => T[0] === x * I[0] + f * I[1] && T[1] === g * I[0] + m * I[1])?.[0];
      return b.side !== C && re("pin direction changed."), { ...y, x: b.x, y: b.y, side: C };
    });
    return { ...c, x: d.x, y: d.y, width: d.width, height: d.height, ports: N, ...d.editorMatrix ? { editorMatrix: [...u] } : {} };
  }), l = new en({ ...t, components: o, segments: e.segments }, { step: n });
  qe(o, e.manualGroups) && re("manual group boxes overlap other components or groups.");
  for (let d = 0; d < o.length; d++) for (let c = d + 1; c < o.length; c++) {
    const u = o[d], x = o[c];
    u.x < x.x + x.width - 1e-3 && u.x + u.width > x.x + 1e-3 && u.y < x.y + x.height - 1e-3 && u.y + u.height > x.y + 1e-3 && re("component symbols overlap.");
  }
  const p = new Set(l.pins().map((d) => d.bit));
  (l.pins().some((d) => !l.onGrid(d)) || l.segments.some((d) => !p.has(d.bit) || !l.validSegment(d, d.bit))) && re("off-grid wire, symbol collision or short circuit.");
  const r = /* @__PURE__ */ new Map();
  for (const d of l.pins()) {
    const c = d.x + "," + d.y;
    r.has(c) && r.get(c) !== d.bit && re("different nodes share a pin position."), r.set(c, d.bit);
  }
  return { ...l.snapshot(), ...e.labelOverrides?.length ? { labelOverrides: structuredClone(e.labelOverrides) } : {}, ...e.manualGroups?.length ? { manualGroups: structuredClone(e.manualGroups) } : {} };
}
const wo = "http://www.w3.org/2000/svg", fe = (t, e = {}) => {
  const n = document.createElementNS(wo, t);
  for (const [s, o] of Object.entries(e)) n.setAttribute(s, o);
  return n;
}, xo = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Et(t, e, n, s) {
  const o = structuredClone(e);
  for (const r of o.components) {
    const d = t.getElementById("cell_" + r.id);
    for (const c of r.ports) {
      const u = [...d.children].find((x) => x.getAttribute("s:pid") === c.pin);
      c.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[u?.getAttribute("s:position")] || c.side;
    }
  }
  for (const [r, d] of Object.entries(s.modules.circuit.cells)) if (d.attributes.name === "0") {
    const c = t.getElementById("cell_" + r), u = c?.transform.baseVal.consolidate().matrix;
    c && u && o.components.push({ id: r, decoration: !0, selectable: !0, x: u.e, y: u.f, width: +c.getAttribute("s:width"), height: +c.getAttribute("s:height"), ports: [...c.children].filter((x) => x.hasAttribute("s:pid")).map((x) => ({ pin: x.getAttribute("s:pid"), x: u.e + Number(x.getAttribute("s:x")), y: u.f + Number(x.getAttribute("s:y")), bit: d.connections[x.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const l = new Map(Object.values(n.nodes).map((r) => [r.name, r.bit])), p = [...t.children].filter((r) => r.localName === "line" && r.hasAttribute("data-net")).map((r) => ({ bit: l.get(r.dataset.net), a: { x: +r.getAttribute("x1"), y: +r.getAttribute("y1") }, b: { x: +r.getAttribute("x2"), y: +r.getAttribute("y2") } }));
  return { ...o, segments: p };
}
function vo(t, e, { changed: n, inspect: s, getNetColor: o, report: l, applyLayoutTemplate: p }) {
  let r = null, d = null, c = !1, u = !1, x = null, g = null, f = null, m = null, h = /* @__PURE__ */ new Set(), N = 0, b = "", y = 8, I = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), _ = !1, M = null, D = null, E = null, w = null, B = "";
  const W = mo();
  let z = "", $ = /* @__PURE__ */ new Map(), ee = /* @__PURE__ */ new Map();
  const L = (v) => new DOMPoint(v.clientX, v.clientY).matrixTransform(d.getScreenCTM().inverse()), U = (v) => r.snap(L(v)), X = (v) => o?.(v) || st[Number(v) % st.length], F = (v, { severity: O = "info", log: k = !0 } = {}) => {
    e("editor-status").textContent = v, k && l?.({ message: v, severity: O, category: "Tools" });
  };
  function te() {
    return { unrouted: r?.airwires().length || 0, wires: r?.segments.length || 0, editing: c, routing: u, selectedComponents: _ ? [] : [...h], selectedLabels: _ ? [...h] : [], labelEditing: _ };
  }
  function ne(v) {
    if (!v.length) return !1;
    if (!_) return !0;
    const O = v.at(-1);
    return JSON.stringify(O.components) === JSON.stringify(r.components) && JSON.stringify(O.segments) === JSON.stringify(r.segments) && JSON.stringify(O.manualGroups || []) === JSON.stringify(r.manualGroups || []);
  }
  function Z() {
    const v = !!r, O = u || !!z, k = r && !_ && Je(h, r.manualGroups), R = e("layout-brush"), q = h.size === 1 && $.has([...h][0]);
    R.disabled = !c || !v || u || _ || !z && (!q || e("edit-tool").value !== "select"), R.setAttribute("aria-pressed", String(!!z)), R.title = z ? "Exit layout format brush (Escape)" : "Copy the selected subcircuit's internal layout", e("group").disabled = !c || !v || O || _ || h.size < 2, e("group").setAttribute("aria-pressed", String(!!k)), e("group").title = k ? "Ungroup selected components (Ctrl+G or Ctrl+Shift+G)" : "Group selected components (Ctrl+G)", e("group").setAttribute("aria-label", e("group").title);
    for (const Q of ["interactive", "flywire", "auto-route"]) e(Q).disabled = !d || O || _ && Q !== "interactive";
    e("label-edit").disabled = !d || O, e("label-edit").setAttribute("aria-pressed", String(c && _)), e("edit-tool").disabled = !v || O;
    for (const Q of document.querySelectorAll("[data-editor-mode]"))
      Q.disabled = !d || O || _ && ["route", "erase"].includes(Q.dataset.editorMode), Q.setAttribute("aria-pressed", String(c && Q.dataset.editorMode === e("edit-tool").value));
    const j = _ ? h.size : r ? Pe(r.components, r.manualGroups).filter((Q) => Q.members.some((J) => h.has(J))).length : 0;
    for (const Q of document.querySelectorAll("[data-editor-arrange]")) Q.disabled = !c || !v || O || j < (Q.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !v || O || !ne(r.undoStack), e("wire-redo").disabled = !v || O || !ne(r.redoStack), t.classList.toggle("spice-editing", c), t.dataset.toolMode = z ? "layout-brush" : c ? e("edit-tool").value : "none", t.dataset.labelEditing = String(c && _);
  }
  function ve(v) {
    const O = JSON.stringify(JSON.parse(b)[2]);
    return [...ee].find(([k]) => {
      const R = JSON.parse(k);
      return R[0] === v && JSON.stringify(R[2]) === O;
    })?.[1];
  }
  function ke() {
    for (const k of d.querySelectorAll("[data-brush-dimmed]"))
      k.style.removeProperty("opacity"), k.removeAttribute("data-brush-dimmed");
    const v = fe("g", { "data-editor-overlay": "true", "data-layout-brush-layer": "true", "pointer-events": "none" });
    if (z) {
      for (const k of [...d.children]) k.hasAttribute("data-net") && (k.style.opacity = ".18", k.setAttribute("data-brush-dimmed", "true"));
      for (const k of r.components) {
        if (!$.has(k.id)) {
          const q = d.getElementById("cell_" + k.id);
          q.style.opacity = ".18", q.setAttribute("data-brush-dimmed", "true");
          continue;
        }
        const R = k.id === z;
        v.append(fe("rect", { x: k.x - 4, y: k.y - 4, width: k.width + 8, height: k.height + 8, fill: "none", stroke: R ? "#507d9c" : "#65a583", "stroke-width": 2, "vector-effect": "non-scaling-stroke", "data-brush-block": k.id }));
      }
    }
    const O = new DOMParser().parseFromString(co, "image/svg+xml").documentElement;
    for (const k of r.components) {
      const R = $.has(k.id) && ve($.get(k.id));
      if (!R) continue;
      const q = fe("g", { "data-layout-template-applied": k.id, transform: "translate(" + (k.x + k.width - 12) + "," + (k.y - 12) + ") scale(.75)", stroke: "#367757", "stroke-width": 2, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }), j = fe("title");
      j.textContent = "Layout copied from " + R, q.append(j, fe("circle", { cx: 12, cy: 12, r: 12, fill: "white", stroke: "none" }), ...[...O.children].map((Q) => Q.cloneNode(!0))), v.append(q);
    }
    d.append(v);
  }
  function Ee() {
    if (!r || u || _) return;
    if (z) {
      z = "", a(), F("Layout format brush cancelled.");
      return;
    }
    const v = h.size === 1 && [...h][0];
    !c || e("edit-tool").value !== "select" || !$.has(v) || (z = v, x = null, g = null, f = null, a(), F("Choose a target subcircuit block. Escape exits the layout format brush."));
  }
  async function be(v) {
    if (u || v === z) return;
    const O = z, k = N;
    u = !0, Z(), F("Checking subcircuit structures…");
    try {
      if (await p($.get(O), $.get(v), () => k === N && z === O), k !== N) return;
      u = !1, a(), F("Layout applied from " + O + " to " + v + ".");
    } catch (R) {
      if (k !== N) return;
      u = !1, a(), F(R.message, { severity: "error" });
    }
  }
  function _e(v, O) {
    const k = T.get(v.id);
    if (k && (O.replaceChildren(...k.children.map((R) => R.cloneNode(!0))), v.editorMatrix)) {
      const R = v.editorMatrix, q = fe("g", { transform: "matrix(" + R.join(" ") + ")", "data-editor-glyph": "true" });
      q.append(...O.childNodes);
      for (const j of q.querySelectorAll("text")) j.remove();
      O.append(q);
      for (const [j, Q] of k.labels.entries()) {
        const J = Q.node.cloneNode(!0);
        J.removeAttribute("transform");
        let ie = R[0] * Q.x + R[2] * Q.y + R[4], K = R[1] * Q.x + R[3] * Q.y + R[5];
        if (v.ports.length === 2 && k.labels.length === 2) {
          const ce = Math.abs(v.ports[0].y - v.ports[1].y) < 1e-3;
          ie = ce ? v.width / 2 : v.ports[0].x - v.x + 20, K = ce ? v.ports[0].y - v.y - 26 + j * 16 : v.height / 2 - 8 + j * 16, J.setAttribute("text-anchor", ce ? "middle" : "start");
        }
        J.setAttribute("x", ie), J.setAttribute("y", K), O.append(J);
      }
    }
  }
  function Ce(v) {
    if (z = "", E = null, x = null, f = null, g = null, M = null, D = null, _ && ["route", "erase"].includes(v)) {
      F("Components and wires are locked in label mode.", { severity: "warning" });
      return;
    }
    if (_ && ["rotate", "mirror-x", "mirror-y"].includes(v) && h.size) {
      S([...h].map((O) => po(W.record(O), v))), F(v + " applied to " + h.size + " label(s).");
      return;
    }
    if (!_ && ["rotate", "mirror-x", "mirror-y"].includes(v) && Je(h, r.manualGroups)) {
      try {
        r.transformGroup(Je(h, r.manualGroups).id, v), a(), F("Manual group " + v + " applied.");
      } catch (O) {
        F(O.message, { severity: "error" });
      }
      return;
    }
    if (["rotate", "mirror-x", "mirror-y"].includes(v) && h.size === 1) {
      try {
        r.transform([...h][0], v), a(), F(v + " applied to " + [...h][0] + ".");
      } catch (O) {
        F(O.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = v, r ? (a(), F("Tool: " + v + ".")) : Z();
  }
  function ge() {
    if (!r) return;
    const v = te();
    F(`${h.size ? h.size + " selected · " : ""}${v.unrouted} connection${v.unrouted === 1 ? "" : "s"} unrouted · ${v.wires} wire segments${u ? " · Auto-routing…" : ""}`, { log: !1 }), Z(), n(r.drawing(), v, r.bounds());
    const O = r.snapshot();
    if (C.has(b) && JSON.stringify(C.get(b)) !== JSON.stringify(O)) {
      const [k, , R] = JSON.parse(b);
      for (const q of ee.keys()) {
        const [j, , Q] = JSON.parse(q);
        (k === j || k.startsWith(j + "/")) && JSON.stringify(R) === JSON.stringify(Q) && ee.delete(q);
      }
    }
    C.set(b, O);
  }
  function Oe(v) {
    const O = d.querySelector("[data-airwires]");
    O ? d.insertBefore(v, O) : d.append(v);
  }
  function ue() {
    if (d?.querySelector("[data-route-preview]")?.remove(), d?.querySelector("[data-route-guides]")?.remove(), !d) return;
    if (c && e("edit-tool").value === "route" && m) {
      const k = t.getBoundingClientRect(), R = d.getScreenCTM().inverse(), q = new DOMPoint(k.left, k.top).matrixTransform(R), j = new DOMPoint(k.right, k.bottom).matrixTransform(R), Q = fe("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      Q.append(fe("line", { x1: q.x, y1: m.y, x2: j.x, y2: m.y, "vector-effect": "non-scaling-stroke" }), fe("line", { x1: m.x, y1: q.y, x2: m.x, y2: j.y, "vector-effect": "non-scaling-stroke" })), Oe(Q);
    }
    if (!x) return;
    const v = [...x.points];
    if (m) {
      const k = v.at(-1);
      v.push({ x: m.x, y: k.y }, m);
    }
    const O = fe("g", { "data-route-preview": "true", "data-waypoints": x.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    O.append(fe("polyline", { points: v.map((k) => k.x + "," + k.y).join(" "), fill: "none", stroke: X(x.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Oe(O);
  }
  function Ae() {
    if (d?.querySelector("[data-selection-box]")?.remove(), !f || !d) return;
    const v = f.start, O = f.end, k = O.x < v.x;
    Oe(fe("rect", { x: Math.min(v.x, O.x), y: Math.min(v.y, O.y), width: Math.abs(v.x - O.x), height: Math.abs(v.y - O.y), fill: k ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: k ? "#4c9675" : "#507d9c", "stroke-dasharray": k ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": k ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function a() {
    if (!d || !r) return;
    for (const j of d.querySelectorAll("[data-editor-body-hit]")) j.remove();
    for (const j of [...d.children]) (j.hasAttribute("data-editor-overlay") || j.hasAttribute("data-airwires") || j.hasAttribute("data-manual-state") || j.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(j.localName)) && j.remove();
    for (const j of r.components) {
      const Q = d.getElementById("cell_" + j.id);
      Q && (Q.style.removeProperty("opacity"), _e(j, Q), Q.setAttribute("s:width", j.width), Q.setAttribute("s:height", j.height), Q.setAttribute("transform", `translate(${j.x},${j.y})`), Q.dataset.editorComponent = j.id, c && !_ && Q.prepend(fe("rect", { x: 0, y: 0, width: j.width, height: j.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    if (c && !u && !_) {
      const j = fe("g", { "data-editor-overlay": "true", "data-manual-group-layer": "true" });
      for (const Q of Pe(r.components, r.manualGroups).filter((J) => J.groupId)) {
        const J = Q.members.every((ie) => h.has(ie));
        j.append(fe("rect", { x: Q.x, y: Q.y, width: Q.width, height: Q.height, fill: "transparent", stroke: J ? "#507d9c" : "#89958c", "stroke-width": J ? 1.5 : 0.8, "stroke-dasharray": "5 3", "vector-effect": "non-scaling-stroke", "pointer-events": ["route", "erase"].includes(e("edit-tool").value) ? "none" : "all", "data-editor-group": Q.groupId }));
      }
      d.insertBefore(j, d.querySelector('g[id^="cell_"]'));
    }
    const v = d.querySelector('g[id^="cell_"]'), O = fe("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), k = fe("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [j, Q] of r.segments.entries()) {
      const J = fe("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, class: "net_" + Q.bit, "data-net": I.get(Q.bit) || String(Q.bit), "stroke-width": 1.4 });
      J.append(fe("title")), J.firstChild.textContent = "Node " + (I.get(Q.bit) || Q.bit), d.insertBefore(J, v), c && !_ && ["route", "erase"].includes(e("edit-tool").value) && O.append(fe("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, "data-editor-wire": j, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const j of r.connectivity()) for (const Q of j.points) {
      const J = /* @__PURE__ */ new Set();
      for (const ie of j.segments) Se(Q, ie) && (Math.min(ie.a.x, ie.b.x) < Q.x - 1e-3 && J.add("w"), Math.max(ie.a.x, ie.b.x) > Q.x + 1e-3 && J.add("e"), Math.min(ie.a.y, ie.b.y) < Q.y - 1e-3 && J.add("n"), Math.max(ie.a.y, ie.b.y) > Q.y + 1e-3 && J.add("s"));
      (J.size >= 3 || J.size >= 2 && j.islands.some((ie) => ie.pins.some((K) => xo(Q, K)))) && d.insertBefore(fe("circle", { cx: Q.x, cy: Q.y, r: 2, class: "net_" + j.bit, "data-net": I.get(j.bit) || String(j.bit), fill: X(j.bit) }), v);
    }
    if (c && !_) {
      for (const j of r.components.filter((Q) => h.has(Q.id))) O.append(fe("rect", { x: j.x - 3, y: j.y - 3, width: j.width + 6, height: j.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": j.id }));
      for (const j of r.pins()) {
        const Q = fe("circle", { cx: j.x, cy: j.y, r: 3, "data-editor-pin": j.id, "data-editor-bit": j.bit, fill: "#fff", stroke: X(j.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": j.owner + " " + j.pin }), J = fe("title");
        J.textContent = j.id + " · " + (I.get(j.bit) || j.bit), Q.append(J), k.append(Q);
      }
      d.append(O, k);
    }
    ue();
    const R = fe("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const j of r.airwires()) R.append(fe("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, stroke: X(j.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": j.bit, "data-from-owner": j.a.owner || "", "data-to-owner": j.b.owner || "" }));
    d.append(R);
    const q = fe("metadata", { "data-manual-state": "true" });
    q.textContent = JSON.stringify({ version: 1, grid: y, unrouted: r.airwires().length, manual: !0 }), d.insertBefore(q, R), ke(), ge();
  }
  function i(v, O) {
    if (!x) {
      x = { bit: O, points: [v], checkpoints: [] }, ue(), F("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (O !== void 0 && x.bit !== O) {
      F("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const k = x.points.at(-1), R = r.findPath(x.bit, k, v);
    if (!R) {
      F("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (O === void 0) {
      R.length > 1 && (x.checkpoints.push(x.points.length), x.points.push(...R.slice(1))), ue(), F("Waypoint " + x.checkpoints.length + " confirmed.");
      return;
    }
    try {
      r.addPath(O, [...x.points, ...R.slice(1)]), x = null, a(), F("Connection added.");
    } catch (q) {
      F(q.message, { severity: "error" });
    }
  }
  function A(v = !1) {
    if (!(!r || u || _))
      try {
        if (v || Je(h, r.manualGroups))
          r.ungroup(h) && F("Manual group removed.");
        else {
          const O = r.group(h);
          h = new Set(O.members), F("Grouped " + O.members.length + " components for manual editing.");
        }
        a();
      } catch (O) {
        F(O.message, { severity: "error" });
      }
  }
  function S(v, O = []) {
    const k = new Map((r.labelOverrides || []).map((R) => [R.id, R]));
    for (const R of O) k.delete(R);
    for (const R of v) k.set(R.id, R);
    if (JSON.stringify([...k.values()]) === JSON.stringify(r.labelOverrides || [])) {
      a();
      return;
    }
    r.remember(), r.labelOverrides = structuredClone([...k.values()]), a();
  }
  function H(v) {
    S(v.map((O) => {
      const k = W.record(O.id);
      return { ...k, x: k.x + O.dx, y: k.y + O.dy };
    }));
  }
  function G(v) {
    r && (E = null, _ = v, h.clear(), x = null, g = null, f = null, M = null, D = null, e("edit-tool").value = "select", a(), F(v ? "Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text." : "Label editing disabled."));
  }
  function Y(v) {
    if (!r) return;
    const O = v ? r.redoStack : r.undoStack;
    if (!ne(O)) {
      F(_ ? "No label edit to " + (v ? "redo." : "undo.") : "No edit to " + (v ? "redo." : "undo."));
      return;
    }
    x = null, g = null, f = null, M = null, D = null, v ? r.redo() : r.undo(), a(), F(v ? "Redo." : "Undo.");
  }
  function oe(v) {
    w = null, B = v, e("label-text").value = W.record(v).text, e("label-dialog").showModal(), e("label-text").focus(), e("label-text").select();
  }
  e("close-label").onclick = () => e("label-dialog").close(), e("label-dialog").addEventListener("close", () => t.focus({ preventScroll: !0 })), e("app").addEventListener("spice:workspacechange", () => {
    e("label-dialog").open && e("label-dialog").close();
  }), e("label-form").onsubmit = (v) => {
    v.preventDefault();
    const O = W.record(B), k = e("label-text").value;
    e("label-dialog").close(), S([{ ...O, text: k }]), F("Display text updated. SPICE source unchanged.");
  }, e("label-reset").onclick = () => {
    const v = B;
    e("label-dialog").close(), S([], [v]), F("Label reset to automatic placement and original text.");
  }, t.addEventListener("pointerdown", (v) => {
    if (!z || !d || v.button !== 0 || v.shiftKey || (v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), u)) return;
    const O = v.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
    $.has(O) && be(O);
  }, { capture: !0 }), t.addEventListener("keydown", (v) => {
    if (z && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), v.stopImmediatePropagation();
      const O = v.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
      $.has(O) && be(O);
    }
  }, { capture: !0 }), t.addEventListener("pointerdown", (v) => {
    if (!_ || !c || u || !r || v.button !== 0) return;
    if (v.shiftKey) {
      w = null;
      return;
    }
    w = v.pointerId, v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 });
    const O = v.target.closest("[data-editor-label]"), k = O?.getAttribute("data-editor-label"), R = e("edit-tool").value, q = k && E?.id === k && v.timeStamp - E.time < 450 && Math.hypot(v.clientX - E.x, v.clientY - E.y) < 5;
    if (E = k ? { id: k, time: v.timeStamp, x: v.clientX, y: v.clientY } : null, q) {
      E = null, M = null, h = /* @__PURE__ */ new Set([k]), a(), oe(k);
      return;
    }
    if (R === "box") {
      D = { start: L(v), end: L(v), additive: v.ctrlKey || v.metaKey }, t.setPointerCapture(v.pointerId), f = D, Ae(), f = null;
      return;
    }
    if (!k) {
      h.clear(), a();
      return;
    }
    if (v.ctrlKey || v.metaKey) {
      h.has(k) ? h.delete(k) : h.add(k), a();
      return;
    }
    if ((R !== "move" || !h.has(k)) && (h = /* @__PURE__ */ new Set([k])), ["rotate", "mirror-x", "mirror-y"].includes(R)) {
      Ce(R);
      return;
    }
    a(), R === "move" && (M = { start: L(v), dx: 0, dy: 0 }, t.setPointerCapture(v.pointerId));
  }, { capture: !0 }), t.addEventListener("pointermove", (v) => {
    if (!(!_ || !c || !r) && (D && (v.stopImmediatePropagation(), D.end = L(v), f = D, Ae(), f = null), M)) {
      v.stopImmediatePropagation();
      const O = L(v), k = r.snap({ x: O.x - M.start.x, y: O.y - M.start.y });
      M.dx = k.x, M.dy = k.y, (k.x || k.y) && (E = null), W.preview([...h].map((R) => ({ id: R, dx: k.x, dy: k.y })));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (v) => {
    if (!(!_ || w !== v.pointerId)) {
      if (w = null, v.stopImmediatePropagation(), t.hasPointerCapture(v.pointerId) && t.releasePointerCapture(v.pointerId), D) {
        const O = D;
        D = null;
        const k = Bt(W.nodes(), O.start, L(v));
        h = O.additive ? /* @__PURE__ */ new Set([...h, ...k]) : new Set(k), a(), F(h.size + " label(s) selected.");
      }
      if (M) {
        const O = M;
        M = null, O.dx || O.dy ? (H([...h].map((k) => ({ id: k, dx: O.dx, dy: O.dy }))), F("Moved " + h.size + " label(s).")) : a();
      }
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    _ && (M = null, D = null, a());
  }), t.addEventListener("dblclick", (v) => {
    if (!_) return;
    v.preventDefault(), v.stopImmediatePropagation();
    const O = L(v), k = v.target.closest("[data-editor-label]")?.getAttribute("data-editor-label") || W.nodes().findLast((R) => O.x >= R.x - 2 && O.x <= R.x + Math.max(8, R.width) + 2 && O.y >= R.y - 2 && O.y <= R.y + Math.max(12, R.height) + 2)?.id;
    k && oe(k);
  }, { capture: !0 }), t.addEventListener("pointerdown", (v) => {
    if (_ || !c || u || !r || !d || v.button !== 0 || v.shiftKey) return;
    const O = e("edit-tool").value, k = v.target.closest("[data-editor-pin]"), R = v.target.closest("[data-editor-wire]"), q = k && r.pins().find((K) => K.id === k.dataset.editorPin), j = v.target.closest("[data-editor-group]"), Q = j ? r.manualGroups?.find((K) => K.id === j.getAttribute("data-editor-group")) : r.manualGroups?.length ? Pe(r.components, r.manualGroups).find((K) => {
      if (!K.groupId) return !1;
      const ce = L(v);
      return ce.x >= K.x && ce.x <= K.x + K.width && ce.y >= K.y && ce.y <= K.y + K.height;
    }) : null, J = v.target.closest("[data-editor-component]") || q && d.getElementById("cell_" + q.owner) || Q && d.getElementById("cell_" + Q.members[0]), ie = J && r.components.find((K) => K.id === J.dataset.editorComponent && lt(K));
    if (O === "box") {
      v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), f = { start: L(v), end: L(v), additive: v.ctrlKey || v.metaKey }, t.setPointerCapture(v.pointerId), Ae();
      return;
    }
    if (O === "route" || O === "erase") {
      if (v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), m = U(v), O === "erase") {
        R && (r.remove(+R.dataset.editorWire), a(), F("Wire segment erased."));
        return;
      }
      if (q) {
        i({ x: q.x, y: q.y }, q.bit);
        return;
      }
      if (R) {
        const K = r.segments[+R.dataset.editorWire], ce = U(v);
        i(K.a.x === K.b.x ? { x: K.a.x, y: ce.y } : { x: ce.x, y: K.a.y }, K.bit);
        return;
      }
      x ? i(U(v)) : ue();
      return;
    }
    if (!ie) {
      h.size && (h.clear(), a());
      return;
    }
    if (v.preventDefault(), v.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), s?.(ie.id, ie), v.ctrlKey || v.metaKey) {
      const K = xt([ie.id], r.manualGroups), ce = [...K].every((me) => h.has(me));
      for (const me of K) ce ? h.delete(me) : h.add(me);
      a();
      return;
    }
    if ((O !== "move" || !h.has(ie.id)) && (h = xt([ie.id], r.manualGroups)), ["rotate", "mirror-x", "mirror-y"].includes(O)) {
      Ce(O);
      return;
    }
    if (a(), O === "move") {
      g = { entries: r.components.filter((K) => h.has(K.id)).map((K) => ({ n: K, element: d.getElementById("cell_" + K.id) })), start: L(v), dx: 0, dy: 0 };
      for (const K of g.entries) K.element.style.opacity = ".6";
      t.setPointerCapture(v.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (v) => {
    if (!(_ || !c || !r || !d)) {
      if (m = U(v), f) {
        v.stopImmediatePropagation(), f.end = L(v), Ae();
        return;
      }
      if (g) {
        v.stopImmediatePropagation();
        const O = L(v), k = r.snap({ x: O.x - g.start.x, y: O.y - g.start.y });
        g.dx = k.x, g.dy = k.y;
        for (const { n: R, element: q } of g.entries) {
          q.setAttribute("transform", `translate(${R.x + k.x},${R.y + k.y})`);
          const j = d.querySelector('[data-selected-component="' + CSS.escape(R.id) + '"]');
          j && (j.setAttribute("x", R.x + k.x - 3), j.setAttribute("y", R.y + k.y - 3));
        }
        for (const R of r.manualGroups || []) R.members.every((q) => h.has(q)) && d.querySelector("[data-editor-group=" + JSON.stringify(R.id) + "]")?.setAttribute("transform", `translate(${k.x},${k.y})`);
        for (const R of d.querySelectorAll("[data-airwires] line"))
          h.has(R.dataset.fromOwner) && (R.setAttribute("x1", +R.getAttribute("x1") - Number(R.dataset.dx || 0) + k.x), R.setAttribute("y1", +R.getAttribute("y1") - Number(R.dataset.dy || 0) + k.y)), h.has(R.dataset.toOwner) && (R.setAttribute("x2", +R.getAttribute("x2") - Number(R.dataset.dx || 0) + k.x), R.setAttribute("y2", +R.getAttribute("y2") - Number(R.dataset.dy || 0) + k.y)), R.dataset.dx = k.x, R.dataset.dy = k.y;
        return;
      }
      e("edit-tool").value === "route" && ue();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (v) => {
    if (!f && !g) return;
    if (v.preventDefault(), v.stopImmediatePropagation(), t.hasPointerCapture(v.pointerId) && t.releasePointerCapture(v.pointerId), f) {
      const k = f;
      f = null;
      const R = Pe(r.components, r.manualGroups), q = Bt(R, k.start, L(v)), j = R.filter((Q) => q.includes(Q.id)).flatMap((Q) => Q.members);
      h = k.additive ? /* @__PURE__ */ new Set([...h, ...j]) : new Set(j), a(), F(h.size + " symbol(s) selected.");
      return;
    }
    const O = g;
    g = null;
    for (const k of O.entries) k.element.style.opacity = "";
    try {
      const k = r.moveMany(O.entries.map(({ n: R }) => ({ id: R.id, dx: O.dx, dy: O.dy })));
      a(), k && F("Moved " + O.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (k) {
      a(), F(k.message, { severity: "error" });
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (g || f) && (g = null, f = null, a());
  }), t.addEventListener("pointerleave", () => {
    !g && !f && (m = null, ue());
  }), t.addEventListener("wheel", (v) => {
    requestAnimationFrame(() => {
      c && r && d && e("edit-tool").value === "route" && (m = U(v), ue());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (v) => {
    if (e("download-dialog").open || e("label-dialog").open || !c || !r || u || v.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(v.target)) return;
    if (z) {
      v.key === "Escape" && (v.preventDefault(), v.stopImmediatePropagation(), Ee());
      return;
    }
    const O = v.target.closest("[data-editor-pin]"), k = v.key.toLowerCase();
    if ((v.ctrlKey || v.metaKey) && k === "g") {
      v.preventDefault(), v.stopImmediatePropagation(), A(v.shiftKey);
      return;
    }
    if (k === "t" && !v.ctrlKey && !v.metaKey && !v.altKey) {
      v.preventDefault(), v.stopImmediatePropagation(), G(!_);
      return;
    }
    if (_ && v.key === "Enter" && h.size === 1) {
      v.preventDefault(), v.stopImmediatePropagation(), oe([...h][0]);
      return;
    }
    if (O && e("edit-tool").value === "route" && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), v.stopImmediatePropagation();
      const R = r.pins().find((q) => q.id === O.dataset.editorPin);
      i({ x: R.x, y: R.y }, R.bit);
      return;
    }
    if (v.key === "Backspace" && e("edit-tool").value === "route") {
      if (v.preventDefault(), v.stopImmediatePropagation(), x) {
        const R = x.checkpoints.pop();
        R === void 0 ? x = null : x.points.length = R, ue(), F(x ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    if (v.key === "Escape")
      v.preventDefault(), v.stopImmediatePropagation(), x = null, g = null, f = null, Ce("select");
    else if ((v.ctrlKey || v.metaKey) && k === "z") {
      v.preventDefault(), v.stopImmediatePropagation(), Y(v.shiftKey);
      return;
    } else !v.ctrlKey && !v.metaKey && !v.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[k] && (v.preventDefault(), v.stopImmediatePropagation(), Ce({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[k]));
  }, { capture: !0 });
  function se(v) {
    if (!(!r || u)) {
      x = null, g = null, f = null, e("edit-tool").value = "select";
      try {
        const O = _ ? W.nodes() : Pe(r.components, r.manualGroups), k = _ ? h : new Set(O.filter((j) => j.members.some((Q) => h.has(Q))).map((j) => j.id)), { moves: R, rounded: q } = uo(O, k, v, y);
        _ ? H(R) : r.moveMany(R.flatMap((j) => O.find((Q) => Q.id === j.id).members.map((Q) => ({ id: Q, dx: j.dx, dy: j.dy })))), a(), F(`${h.size} ${_ ? "labels" : "components"} arranged.${q ? " Centers or gaps rounded to the " + y + "-unit pin grid." : ""}${_ ? "" : " Detached connections remain flywires."}`);
      } catch (O) {
        a(), F(O.message, { severity: "error" });
      }
    }
  }
  async function le() {
    if (!r || u || _) return;
    const v = N;
    u = !0, ge(), F("Auto-routing remaining connections…");
    try {
      if (await r.autoRoute(() => v !== N), v === N) {
        x = null, u = !1, a();
        const O = r.airwires().length;
        F(O ? "Auto-routing finished: " + O + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: O ? "warning" : "info" });
      }
    } catch (O) {
      v === N && (u = !1, a(), F(O.message, { severity: "error" }));
    }
  }
  return {
    mount(v, O, k, R, q, { reset: j = !1, scope: Q = "" } = {}) {
      N++, u = !1, z = "", $ = new Map(k.components.filter((K) => K.block).map((K) => [K.name, K.instanceId])), d = v, x = null, g = null, f = null, m = null, h.clear(), T = /* @__PURE__ */ new Map();
      for (const K of d.querySelectorAll('g[id^="cell_"]')) {
        const ce = K.getCTM().inverse();
        T.set(K.id.slice(5), { children: [...K.childNodes].map((me) => me.cloneNode(!0)), labels: [...K.querySelectorAll("text")].map((me) => {
          const Me = new DOMPoint(+me.getAttribute("x") || 0, +me.getAttribute("y") || 0).matrixTransform(ce.multiply(me.getCTM()));
          return { node: me.cloneNode(!0), x: Me.x, y: Me.y };
        }) });
      }
      if (y = q.gridSize || 0, I = new Map(Object.values(k.nodes).map((K) => [K.bit, K.name])), !O || !y) {
        r = null, Z();
        return;
      }
      const J = Et(d, O, k, R), ie = J.segments;
      r = new en(J, { step: y, segments: ie }), b = Xe(Q, k.topology.signature, q), !j && C.has(b) ? (vt(d, C.get(b).labelOverrides), r.restore(at({ ...J, segments: ie }, C.get(b), y))) : e("flywire").checked && r.clear(), c = e("interactive").checked, c || !j && C.has(b) || e("flywire").checked ? a() : Z();
    },
    invalidate() {
      z = "", $.clear(), E = null, M = null, D = null, e("label-dialog").open && e("label-dialog").close(), r && !u && C.set(b, r.snapshot()), N++, u = !1, r = null, d = null, x = null, g = null, f = null, m = null, h.clear(), Z();
    },
    snapshotSheets() {
      return r && !u && C.set(b, r.snapshot()), [...C].map(([v, O]) => {
        const [k, R, q] = JSON.parse(v);
        return { scope: k, topology: R, settings: q, snapshot: structuredClone(O), ...ee.has(v) ? { templateSource: ee.get(v) } : {} };
      });
    },
    restoreSheets(v) {
      ee = new Map(v.filter((O) => O.templateSource).map((O) => [Xe(O.scope, O.topology, O.settings), O.templateSource])), C = new Map(v.map((O) => [Xe(O.scope, O.topology, O.settings), structuredClone(O.snapshot)]));
    },
    clearSheets() {
      C.clear(), ee.clear();
    },
    saveTemplateSheet(v) {
      const O = Xe(v.scope, v.topology, v.settings);
      C.set(O, structuredClone(v.snapshot)), ee.set(O, v.templateSource);
    },
    setEnabled(v) {
      c = v, v || (z = ""), v || (_ = !1, M = null, D = null, x = null, g = null, f = null, m = null, h.clear()), r ? a() : Z();
    },
    clear() {
      r && !_ && (r.clear(), x = null, a(), F("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: le,
    chooseTool: Ce,
    arrange: se,
    toggleGroup: A,
    toggleLayoutBrush: Ee,
    layoutBrushActive: () => !!z,
    setLabelEditing: G,
    labelEditing: () => _,
    resetLabelDisplay: () => W.reset(),
    placeLabels: () => d && r ? W.layout(d, r.components, r.labelOverrides, c && _, h) : null,
    undo: () => Y(!1),
    redo: () => Y(!0),
    complete() {
      return !r || !u && r.airwires().length === 0;
    },
    working() {
      return u;
    },
    stats: te,
    canEdit() {
      return !!r;
    },
    refreshControls: Z,
    refreshColors() {
      if (d) {
        for (const v of d.querySelectorAll("[data-air-net]")) v.setAttribute("stroke", X(+v.dataset.airNet));
        for (const v of d.querySelectorAll("[data-editor-bit]")) v.setAttribute("stroke", X(+v.dataset.editorBit));
      }
    },
    cleanExport(v) {
      for (const O of v.querySelectorAll("[data-brush-dimmed]"))
        O.style.removeProperty("opacity"), O.removeAttribute("data-brush-dimmed");
      for (const O of v.querySelectorAll("[data-label-id]")) O.removeAttribute("data-label-id");
      for (const O of v.querySelectorAll("[data-editor-overlay],[data-route-preview]")) O.remove();
      for (const O of v.querySelectorAll("[data-editor-component]"))
        O.removeAttribute("data-editor-component"), O.style.removeProperty("opacity");
    }
  };
}
function Gt(t, e) {
  const n = /* @__PURE__ */ new Map(), s = (o, l, p) => {
    if (!n.has(o) || !n.has(l)) throw Error("Layout template has an unresolved control/reference.");
    n.get(o).edges.push([l, ">" + p]), n.get(l).edges.push([o, "<" + p]);
  };
  for (const o of Object.values(t.nodes)) n.set("n:" + o.name, { id: o.name, kind: "net", label: "net:" + (e.has(o.name) ? o.name : ""), edges: [] });
  for (const o of t.components) {
    const l = Object.keys(o.terminals).sort();
    n.set("c:" + o.name, { id: o.name, kind: "cell", component: o, label: JSON.stringify([o.kind, l, o.synthetic ? Number(o.name.split("/").at(-1)) : null]), edges: [] });
  }
  for (const o of t.components) {
    const l = "c:" + o.name;
    for (const [r, d] of Object.entries(o.terminals)) s(l, "n:" + d, "pin:" + r);
    for (const [r, d] of (o.controlSources || []).entries()) s(l, "c:" + d, "control:" + r);
    for (const [r, d] of (o.coupledInductors || []).entries()) s(l, "c:" + d, "coupled:" + r);
    let p = 0;
    for (const r of (o.value || "").matchAll(/\b(V|I|Ix)\s*\(([^()]+)\)/gi)) {
      const d = r[1].toLowerCase();
      for (const [c, u] of r[2].split(",").map((x) => x.trim()).entries()) s(l, (d === "v" ? "n:" : "c:") + u, "expression:" + d + ":" + p + ":" + c);
      p++;
    }
  }
  return n;
}
function Eo(t, e, n, s) {
  if (t.size !== e.size) return null;
  const o = [...t.values(), ...e.values()];
  let l = new Map(o.map((m) => [m, m.label]));
  for (let m = 0; m < o.length; m++) {
    if (performance.now() > s.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    const h = new Array(o.length);
    for (let I = 0; I < o.length; I++) {
      const C = o[I], T = I < t.size ? t : e;
      h[I] = JSON.stringify([l.get(C), C.edges.map(([_, M]) => [M, l.get(T.get(_))]).sort((_, M) => JSON.stringify(_).localeCompare(JSON.stringify(M)))]);
    }
    const N = new Map([...new Set(h)].sort().map((I, C) => [I, C])), b = new Map(o.map((I, C) => [I, N.get(h[C])])), y = new Set(l.values()).size;
    if (l = b, N.size === y) break;
  }
  const p = (m) => {
    const h = /* @__PURE__ */ new Map();
    for (const [N, b] of m) {
      const y = l.get(b);
      h.has(y) || h.set(y, []), h.get(y).push(N);
    }
    return h;
  }, r = p(t), d = p(e);
  if ([...r].some(([m, h]) => h.length !== d.get(m)?.length)) return null;
  const c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), x = (m, h, N) => m.get(h).edges.filter(([b]) => b === N).map(([, b]) => b).sort().join("|"), g = (m, h) => {
    if (x(t, m, m) !== x(e, h, h)) return !1;
    for (const [N, b] of c) if (x(t, m, N) !== x(e, h, b)) return !1;
    return n(t.get(m), e.get(h));
  };
  function f() {
    if (--s.states < 0 || performance.now() > s.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    if (c.size === t.size) return !0;
    let m, h;
    for (const [b, y] of t) {
      if (c.has(b)) continue;
      const I = d.get(l.get(y)).filter((C) => !u.has(C) && g(b, C));
      if (!I.length) return !1;
      if ((!h || I.length < h.length) && (m = b, h = I, I.length === 1))
        break;
    }
    const N = (b) => b.split("/").at(-1);
    h.sort((b, y) => (N(y) === N(m)) - (N(b) === N(m)) || b.localeCompare(y));
    for (const b of h) {
      if (c.set(m, b), u.add(b), f()) return !0;
      c.delete(m), u.delete(b);
    }
    return !1;
  }
  return f() ? c : null;
}
function No(t, e, n, { maxStates: s = 5e4, timeout: o = 1500 } = {}) {
  if (!e || !n || e === n || !t.contexts[e] || !t.contexts[n]) throw Error("Choose two different subcircuit blocks.");
  const l = new Set(t.ir.globals.map((m) => ot([], m))), p = { states: s, deadline: performance.now() + o }, r = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), c = (m) => (d.has(m) || d.set(m, He(t, { focus: m })), d.get(m)), u = (m, h) => {
    const N = JSON.stringify([m, h]);
    if (r.has(N)) return r.get(N);
    const b = c(m), y = c(h), I = Gt(b, l), C = Gt(y, l), T = Eo(I, C, (_, M) => _.kind !== "cell" || !_.component.block || !!u(_.component.instanceId, M.component.instanceId), p);
    return r.set(N, T), T;
  };
  if (!u(e, n)) throw Error("Subcircuit structures differ; no layout was changed.");
  const g = [];
  function f(m, h) {
    const N = c(m), b = c(h), y = r.get(JSON.stringify([m, h])), I = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
    for (const [T, _] of y) T.startsWith("c:") ? I.set(T.slice(2), _.slice(2)) : C.set(N.nodes[T.slice(2)].bit, b.nodes[_.slice(2)].bit);
    g.push({ source: m, target: h, sourceCircuit: N, targetCircuit: b, components: I, bits: C });
    for (const T of N.components.filter((_) => _.block)) f(T.instanceId, b.components.find((_) => _.name === I.get(T.name)).instanceId);
  }
  return f(e, n), { ...g[0], instances: g };
}
function So(t, e, n, { targetLabels: s = /* @__PURE__ */ new Map(), targetOverrides: o = [] } = {}) {
  const l = new Map(n.components), p = new Map(e.components.map((u) => [u.id, u])), r = new Map(o.map((u) => [u.id, u.text]));
  for (const u of t.components.filter((x) => x.decoration)) {
    const x = n.bits.get(u.ports[0]?.bit), g = e.components.find((f) => f.decoration && f.ports[0]?.bit === x);
    if (!g) throw Error("Template and target ground symbols differ.");
    l.set(u.id, g.id);
  }
  const c = { components: t.components.map((u) => {
    const x = l.get(u.id), g = p.get(x);
    if (!g) throw Error("Template and target symbols differ.");
    const f = [u.editorMatrix || [1, 0, 0, 1, 0, 0], ...[1, -1].flatMap((b) => [1, -1].flatMap((y) => [[b, 0, 0, y, b < 0 ? g.width : 0, y < 0 ? g.height : 0], [0, b, y, 0, y < 0 ? g.height : 0, b < 0 ? g.width : 0]]))], m = { NORTH: [0, -1], SOUTH: [0, 1], WEST: [-1, 0], EAST: [1, 0] }, h = (b, y) => Math.abs(b - y) < 1e-3, N = f.find((b) => {
      const y = [[0, 0], [g.width, 0], [0, g.height], [g.width, g.height]].map(([I, C]) => [b[0] * I + b[2] * C + b[4], b[1] * I + b[3] * C + b[5]]);
      return !h(Math.min(...y.map((I) => I[0])), 0) || !h(Math.min(...y.map((I) => I[1])), 0) || !h(Math.max(...y.map((I) => I[0])), u.width) || !h(Math.max(...y.map((I) => I[1])), u.height) ? !1 : u.ports.every((I) => {
        const C = g.ports.find((E) => E.pin === I.pin);
        if (!C) return !1;
        const [T, _] = m[C.side], [M, D] = m[I.side];
        return h(u.x + b[0] * (C.x - g.x) + b[2] * (C.y - g.y) + b[4], I.x) && h(u.y + b[1] * (C.x - g.x) + b[3] * (C.y - g.y) + b[5], I.y) && b[0] * T + b[2] * _ === M && b[1] * T + b[3] * _ === D;
      });
    });
    if (!N) throw Error("Subcircuits are topologically identical, but target symbol geometry cannot fit the template: " + x + ". No layout was changed.");
    return { ...g, x: u.x, y: u.y, width: u.width, height: u.height, ports: u.ports.map((b) => ({ ...b, bit: n.bits.get(b.bit) })), ...!N.every((b, y) => b === [1, 0, 0, 1, 0, 0][y]) || u.editorMatrix ? { editorMatrix: N } : {} };
  }), segments: t.segments.map((u) => ({ ...u, bit: n.bits.get(u.bit), a: { ...u.a }, b: { ...u.b } })) };
  return t.manualGroups?.length && (c.manualGroups = t.manualGroups.map((u) => ({ ...u, members: u.members.map((x) => l.get(x)) }))), t.labelOverrides?.length && (c.labelOverrides = t.labelOverrides.flatMap((u) => {
    const x = l.get(u.owner);
    if (!x) return [];
    const g = ct(x, u.index), f = r.get(g) ?? s.get(g);
    if (f === void 0) throw Error("Template and target label slots differ.");
    return [{ ...u, id: g, owner: x, text: f, orientation: [...u.orientation] }];
  })), at(e, c, 4);
}
const Nt = 4, et = "http://www.w3.org/2000/svg";
function tt(t, e, n = !0, s = null) {
  let o = t.querySelector("defs[data-coordinate-grid]"), l = t.querySelector("rect[data-coordinate-grid]");
  if (!o) {
    o = document.createElementNS(et, "defs"), o.dataset.coordinateGrid = "true";
    const f = document.createElementNS(et, "pattern");
    f.id = "spice-coordinate-grid", f.setAttribute("patternUnits", "userSpaceOnUse");
    const m = document.createElementNS(et, "path");
    m.setAttribute("fill", "none"), m.setAttribute("stroke", "#737b83"), m.setAttribute("stroke-opacity", ".38"), m.setAttribute("stroke-width", ".55"), m.setAttribute("vector-effect", "non-scaling-stroke"), f.append(m), o.append(f), l = document.createElementNS(et, "rect"), l.dataset.coordinateGrid = "true", l.setAttribute("fill", "url(#spice-coordinate-grid)"), l.setAttribute("stroke", "none"), l.setAttribute("pointer-events", "none"), t.prepend(l), t.prepend(o);
  }
  const p = o.firstElementChild, r = e || 8;
  p.setAttribute("width", r), p.setAttribute("height", r), p.firstElementChild.setAttribute("d", `M${r},0 H0 V${r}`), l.setAttribute("visibility", n && e ? "visible" : "hidden");
  let d = p.querySelector("[data-minor-grid]");
  d || (d = p.firstElementChild.cloneNode(), d.setAttribute("data-minor-grid", "true"), d.setAttribute("stroke-opacity", ".16"), p.append(d));
  const c = [];
  for (let f = Nt; f < r; f += Nt) c.push(`M${f},0 V${r} M0,${f} H${r}`);
  d.setAttribute("d", c.join(" ")), t.dataset.displayGridStep = String(r);
  let u = s;
  const x = t.closest(".spice-preview"), g = t.isConnected && x ? t.getScreenCTM() : null;
  if (g) {
    const f = x.getBoundingClientRect(), m = g.inverse(), h = [[f.left - 1, f.top - 1], [f.right + 1, f.top - 1], [f.right + 1, f.bottom + 1], [f.left - 1, f.bottom + 1]].map(([y, I]) => new DOMPoint(y, I).matrixTransform(m)), N = Math.min(...h.map((y) => y.x)), b = Math.min(...h.map((y) => y.y));
    u = { x: N, y: b, w: Math.max(...h.map((y) => y.x)) - N, h: Math.max(...h.map((y) => y.y)) - b };
  }
  if (!u) {
    const f = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    u = { x: f[0], y: f[1], w: f[2], h: f[3] };
  }
  for (const [f, m] of Object.entries({ x: u.x, y: u.y, width: u.w, height: u.h })) l.setAttribute(f, m);
}
const _o = `<svg
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
`, Co = `<svg
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
`, Io = `<svg
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
`, ko = `<svg
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
`, Ao = `<svg
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
`, Oo = `<svg
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
`, To = `<svg
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
`, Mo = `<svg
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
`, Ro = `<svg
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
`, Lo = `<svg
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
`, Po = `<svg
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
`, Do = `<svg
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
`, ft = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, Uo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`, Bo = `<svg
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
`, jo = `<svg
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
`, Vo = `<svg
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
`, Go = `<svg
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
`, Qo = `<svg
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
`, Fo = `<svg
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
`, Ho = `<svg
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
`, zo = `<svg
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
`, qo = `<svg
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
`, Wo = `<svg
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
`, Xo = `<svg
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
`, $o = `<svg
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
`, Ko = `<svg
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
`, Yo = `<svg
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
`, Zo = `<svg
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
`, Jo = `<svg
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
`, er = `<svg
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
`, tr = `<svg
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
  <path d="m14.622 17.897-10.68-2.913" />
  <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
  <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
</svg>
`;
function nr(t) {
  const e = { select: Qo, box: Fo, move: _o, route: Co, erase: Io, rotate: ko, "mirror-x": Ao, "mirror-y": Oo }, n = { left: zo, right: Wo, top: Xo, bottom: Ko, "center-x": qo, "center-y": $o, "space-x": Yo, "space-y": Zo }, s = { "zoom-in": To, "zoom-out": Mo, fit: Ro, "wire-undo": Lo, "wire-redo": Po, "auto-route": Do, "pin-editor": ft, "pin-info": ft, "pin-details": ft, fullscreen: Uo, "exit-fullscreen": Bo, "reset-windows": jo, "open-download": Vo, upload: Go }, o = (l, p) => {
    if (!l) return;
    const r = l.title || l.getAttribute("aria-label") || l.textContent;
    l.setAttribute("aria-label", r), l.title = r, l.innerHTML = p, l.firstElementChild.setAttribute("aria-hidden", "true"), l.firstElementChild.setAttribute("focusable", "false"), l.classList.add("spice-icon-button");
  };
  o(t.querySelector("#spice-copy"), Ho), o(t.querySelector("#spice-label-edit"), Jo), o(t.querySelector("#spice-group"), er), o(t.querySelector("#spice-layout-brush"), tr);
  for (const [l, p] of Object.entries(n)) o(t.querySelector(`[data-editor-arrange="${l}"]`), p);
  for (const [l, p] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${l}"]`), p);
  for (const [l, p] of Object.entries(s)) o(t.querySelector("#spice-" + l), p);
}
function or(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function s() {
      var o = !1;
      try {
        o = this instanceof s;
      } catch {
      }
      return o ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(s) {
    var o = Object.getOwnPropertyDescriptor(t, s);
    Object.defineProperty(n, s, o.get ? o : {
      enumerable: !0,
      get: function() {
        return t[s];
      }
    });
  }), n;
}
var pt = {};
const rr = {}, ir = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: rr
}, Symbol.toStringTag, { value: "Module" })), sr = /* @__PURE__ */ or(ir);
var Qt;
function ar() {
  return Qt || (Qt = 1, (function(t) {
    (function(e) {
      e.parser = function(a, i) {
        return new s(a, i);
      }, e.SAXParser = s, e.SAXStream = x, e.createStream = c, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function s(a, i) {
        if (!(this instanceof s))
          return new s(a, i);
        var A = this;
        l(A), A.q = A.c = "", A.bufferCheckPosition = e.MAX_BUFFER_LENGTH, A.encoding = null, A.opt = i || {}, A.opt.lowercase = A.opt.lowercase || A.opt.lowercasetags, A.looseCase = A.opt.lowercase ? "toLowerCase" : "toUpperCase", A.opt.maxEntityCount = A.opt.maxEntityCount || 512, A.opt.maxEntityDepth = A.opt.maxEntityDepth || 4, A.entityCount = A.entityDepth = 0, A.tags = [], A.closed = A.closedRoot = A.sawRoot = !1, A.tag = A.error = null, A.strict = !!a, A.noscript = !!(a || A.opt.noscript), A.state = w.BEGIN, A.strictEntities = A.opt.strictEntities, A.ENTITIES = A.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), A.attribList = [], A.opt.xmlns && (A.ns = Object.create(N)), A.opt.unquotedAttributeValues === void 0 && (A.opt.unquotedAttributeValues = !a), A.trackPosition = A.opt.position !== !1, A.trackPosition && (A.position = A.line = A.column = 0), W(A, "onready");
      }
      Object.create || (Object.create = function(a) {
        function i() {
        }
        i.prototype = a;
        var A = new i();
        return A;
      }), Object.keys || (Object.keys = function(a) {
        var i = [];
        for (var A in a) a.hasOwnProperty(A) && i.push(A);
        return i;
      });
      function o(a) {
        for (var i = Math.max(e.MAX_BUFFER_LENGTH, 10), A = 0, S = 0, H = n.length; S < H; S++) {
          var G = a[n[S]].length;
          if (G > i)
            switch (n[S]) {
              case "textNode":
                X(a);
                break;
              case "cdata":
                U(a, "oncdata", a.cdata), a.cdata = "";
                break;
              case "script":
                U(a, "onscript", a.script), a.script = "";
                break;
              default:
                te(a, "Max buffer length exceeded: " + n[S]);
            }
          A = Math.max(A, G);
        }
        var Y = e.MAX_BUFFER_LENGTH - A;
        a.bufferCheckPosition = Y + a.position;
      }
      function l(a) {
        for (var i = 0, A = n.length; i < A; i++)
          a[n[i]] = "";
      }
      function p(a) {
        X(a), a.cdata !== "" && (U(a, "oncdata", a.cdata), a.cdata = ""), a.script !== "" && (U(a, "onscript", a.script), a.script = "");
      }
      s.prototype = {
        end: function() {
          ne(this);
        },
        write: Ae,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          p(this);
        }
      };
      var r;
      try {
        r = sr.Stream;
      } catch {
        r = function() {
        };
      }
      r || (r = function() {
      });
      var d = e.EVENTS.filter(function(a) {
        return a !== "error" && a !== "end";
      });
      function c(a, i) {
        return new x(a, i);
      }
      function u(a, i) {
        if (a.length >= 2) {
          if (a[0] === 255 && a[1] === 254)
            return "utf-16le";
          if (a[0] === 254 && a[1] === 255)
            return "utf-16be";
        }
        return a.length >= 3 && a[0] === 239 && a[1] === 187 && a[2] === 191 ? "utf8" : a.length >= 4 ? a[0] === 60 && a[1] === 0 && a[2] === 63 && a[3] === 0 ? "utf-16le" : a[0] === 0 && a[1] === 60 && a[2] === 0 && a[3] === 63 ? "utf-16be" : "utf8" : i ? "utf8" : null;
      }
      function x(a, i) {
        if (!(this instanceof x))
          return new x(a, i);
        r.apply(this), this._parser = new s(a, i), this.writable = !0, this.readable = !0;
        var A = this;
        this._parser.onend = function() {
          A.emit("end");
        }, this._parser.onerror = function(S) {
          A.emit("error", S), A._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, d.forEach(function(S) {
          Object.defineProperty(A, "on" + S, {
            get: function() {
              return A._parser["on" + S];
            },
            set: function(H) {
              if (!H)
                return A.removeAllListeners(S), A._parser["on" + S] = H, H;
              A.on(S, H);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      x.prototype = Object.create(r.prototype, {
        constructor: {
          value: x
        }
      }), x.prototype._decodeBuffer = function(a, i) {
        if (this._decoderBuffer && (a = Buffer.concat([this._decoderBuffer, a]), this._decoderBuffer = null), !this._decoder) {
          var A = u(a, i);
          if (!A)
            return this._decoderBuffer = a, "";
          this._parser.encoding = A, this._decoder = new TextDecoder(A);
        }
        return this._decoder.decode(a, { stream: !i });
      }, x.prototype.write = function(a) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(a))
          a = this._decodeBuffer(a, !1);
        else if (this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        }
        return this._parser.write(a.toString()), this.emit("data", a), !0;
      }, x.prototype.end = function(a) {
        if (a && a.length && this.write(a), this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        } else if (this._decoder) {
          var A = this._decoder.decode();
          A && (this._parser.write(A), this.emit("data", A));
        }
        return this._parser.end(), !0;
      }, x.prototype.on = function(a, i) {
        var A = this;
        return !A._parser["on" + a] && d.indexOf(a) !== -1 && (A._parser["on" + a] = function() {
          var S = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          S.splice(0, 0, a), A.emit.apply(A, S);
        }), r.prototype.on.call(A, a, i);
      };
      var g = /^\[CDATA\[$/i, f = /^DOCTYPE$/i, m = "http://www.w3.org/XML/1998/namespace", h = "http://www.w3.org/2000/xmlns/", N = { xml: m, xmlns: h }, b = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, I = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function T(a) {
        return a === " " || a === `
` || a === "\r" || a === "	";
      }
      function _(a) {
        return a === '"' || a === "'";
      }
      function M(a) {
        return a === ">" || T(a);
      }
      function D(a, i) {
        return a.test(i);
      }
      function E(a, i) {
        return !D(a, i);
      }
      var w = 0;
      e.STATE = {
        BEGIN: w++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: w++,
        // leading whitespace
        TEXT: w++,
        // general stuff
        TEXT_ENTITY: w++,
        // &amp and such.
        OPEN_WAKA: w++,
        // <
        SGML_DECL: w++,
        // <!BLARG
        SGML_DECL_QUOTED: w++,
        // <!BLARG foo "bar
        DOCTYPE: w++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: w++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: w++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: w++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: w++,
        // <!-
        COMMENT: w++,
        // <!--
        COMMENT_ENDING: w++,
        // <!-- blah -
        COMMENT_ENDED: w++,
        // <!-- blah --
        CDATA: w++,
        // <![CDATA[ something
        CDATA_ENDING: w++,
        // ]
        CDATA_ENDING_2: w++,
        // ]]
        PROC_INST: w++,
        // <?hi
        PROC_INST_BODY: w++,
        // <?hi there
        PROC_INST_ENDING: w++,
        // <?hi "there" ?
        OPEN_TAG: w++,
        // <strong
        OPEN_TAG_SLASH: w++,
        // <strong /
        ATTRIB: w++,
        // <a
        ATTRIB_NAME: w++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: w++,
        // <a foo _
        ATTRIB_VALUE: w++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: w++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: w++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: w++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: w++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: w++,
        // <foo bar=&quot
        CLOSE_TAG: w++,
        // </a
        CLOSE_TAG_SAW_WHITE: w++,
        // </a   >
        SCRIPT: w++,
        // <script> ...
        SCRIPT_ENDING: w++
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
        var i = e.ENTITIES[a], A = typeof i == "number" ? String.fromCharCode(i) : i;
        e.ENTITIES[a] = A;
      });
      for (var B in e.STATE)
        e.STATE[e.STATE[B]] = B;
      w = e.STATE;
      function W(a, i, A) {
        a[i] && a[i](A);
      }
      function z(a) {
        var i = a && a.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return i ? i[2] : null;
      }
      function $(a) {
        return a ? a.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function ee(a, i) {
        const A = $(a), S = $(i);
        return !A || !S ? !0 : S === "utf16" ? A === "utf16le" || A === "utf16be" : A === S;
      }
      function L(a, i) {
        if (!(!a.strict || !a.encoding || !i || i.name !== "xml")) {
          var A = z(i.body);
          A && !ee(a.encoding, A) && Z(
            a,
            "XML declaration encoding " + A + " does not match detected stream encoding " + a.encoding.toUpperCase()
          );
        }
      }
      function U(a, i, A) {
        a.textNode && X(a), W(a, i, A);
      }
      function X(a) {
        a.textNode = F(a.opt, a.textNode), a.textNode && W(a, "ontext", a.textNode), a.textNode = "";
      }
      function F(a, i) {
        return a.trim && (i = i.trim()), a.normalize && (i = i.replace(/\s+/g, " ")), i;
      }
      function te(a, i) {
        return X(a), a.trackPosition && (i += `
Line: ` + a.line + `
Column: ` + a.column + `
Char: ` + a.c), i = new Error(i), a.error = i, W(a, "onerror", i), a;
      }
      function ne(a) {
        return a.sawRoot && !a.closedRoot && Z(a, "Unclosed root tag"), a.state !== w.BEGIN && a.state !== w.BEGIN_WHITESPACE && a.state !== w.TEXT && te(a, "Unexpected end"), X(a), a.c = "", a.closed = !0, W(a, "onend"), s.call(a, a.strict, a.opt), a;
      }
      function Z(a, i) {
        if (typeof a != "object" || !(a instanceof s))
          throw new Error("bad call to strictFail");
        a.strict && te(a, i);
      }
      function ve(a) {
        a.strict || (a.tagName = a.tagName[a.looseCase]());
        var i = a.tags[a.tags.length - 1] || a, A = a.tag = { name: a.tagName, attributes: {} };
        a.opt.xmlns && (A.ns = i.ns), a.attribList.length = 0, U(a, "onopentagstart", A);
      }
      function ke(a, i) {
        var A = a.indexOf(":"), S = A < 0 ? ["", a] : a.split(":"), H = S[0], G = S[1];
        return i && a === "xmlns" && (H = "xmlns", G = ""), { prefix: H, local: G };
      }
      function Ee(a) {
        if (a.strict || (a.attribName = a.attribName[a.looseCase]()), a.attribList.indexOf(a.attribName) !== -1 || a.tag.attributes.hasOwnProperty(a.attribName)) {
          a.attribName = a.attribValue = "";
          return;
        }
        if (a.opt.xmlns) {
          var i = ke(a.attribName, !0), A = i.prefix, S = i.local;
          if (A === "xmlns")
            if (S === "xml" && a.attribValue !== m)
              Z(
                a,
                "xml: prefix must be bound to " + m + `
Actual: ` + a.attribValue
              );
            else if (S === "xmlns" && a.attribValue !== h)
              Z(
                a,
                "xmlns: prefix must be bound to " + h + `
Actual: ` + a.attribValue
              );
            else {
              var H = a.tag, G = a.tags[a.tags.length - 1] || a;
              H.ns === G.ns && (H.ns = Object.create(G.ns)), H.ns[S] = a.attribValue;
            }
          a.attribList.push([a.attribName, a.attribValue]);
        } else
          a.tag.attributes[a.attribName] = a.attribValue, U(a, "onattribute", {
            name: a.attribName,
            value: a.attribValue
          });
        a.attribName = a.attribValue = "";
      }
      function be(a, i) {
        if (a.opt.xmlns) {
          var A = a.tag, S = ke(a.tagName);
          A.prefix = S.prefix, A.local = S.local, A.uri = A.ns[S.prefix] || "", A.prefix && !A.uri && (Z(
            a,
            "Unbound namespace prefix: " + JSON.stringify(a.tagName)
          ), A.uri = S.prefix);
          var H = a.tags[a.tags.length - 1] || a;
          A.ns && H.ns !== A.ns && Object.keys(A.ns).forEach(function(j) {
            U(a, "onopennamespace", {
              prefix: j,
              uri: A.ns[j]
            });
          });
          for (var G = 0, Y = a.attribList.length; G < Y; G++) {
            var oe = a.attribList[G], se = oe[0], le = oe[1], v = ke(se, !0), O = v.prefix, k = v.local, R = O === "" ? "" : A.ns[O] || "", q = {
              name: se,
              value: le,
              prefix: O,
              local: k,
              uri: R
            };
            O && O !== "xmlns" && !R && (Z(
              a,
              "Unbound namespace prefix: " + JSON.stringify(O)
            ), q.uri = O), a.tag.attributes[se] = q, U(a, "onattribute", q);
          }
          a.attribList.length = 0;
        }
        a.tag.isSelfClosing = !!i, a.sawRoot = !0, a.tags.push(a.tag), U(a, "onopentag", a.tag), i || (!a.noscript && a.tagName.toLowerCase() === "script" ? a.state = w.SCRIPT : a.state = w.TEXT, a.tag = null, a.tagName = ""), a.attribName = a.attribValue = "", a.attribList.length = 0;
      }
      function _e(a) {
        if (!a.tagName) {
          Z(a, "Weird empty close tag."), a.textNode += "</>", a.state = w.TEXT;
          return;
        }
        if (a.script) {
          if (a.tagName !== "script") {
            a.script += "</" + a.tagName + ">", a.tagName = "", a.state = w.SCRIPT;
            return;
          }
          U(a, "onscript", a.script), a.script = "";
        }
        var i = a.tags.length, A = a.tagName;
        a.strict || (A = A[a.looseCase]());
        for (var S = A; i--; ) {
          var H = a.tags[i];
          if (H.name !== S)
            Z(a, "Unexpected close tag");
          else
            break;
        }
        if (i < 0) {
          Z(a, "Unmatched closing tag: " + a.tagName), a.textNode += "</" + a.tagName + ">", a.state = w.TEXT;
          return;
        }
        a.tagName = A;
        for (var G = a.tags.length; G-- > i; ) {
          var Y = a.tag = a.tags.pop();
          a.tagName = a.tag.name, U(a, "onclosetag", a.tagName);
          var oe = {};
          for (var se in Y.ns)
            oe[se] = Y.ns[se];
          var le = a.tags[a.tags.length - 1] || a;
          a.opt.xmlns && Y.ns !== le.ns && Object.keys(Y.ns).forEach(function(v) {
            var O = Y.ns[v];
            U(a, "onclosenamespace", { prefix: v, uri: O });
          });
        }
        i === 0 && (a.closedRoot = !0), a.tagName = a.attribValue = a.attribName = "", a.attribList.length = 0, a.state = w.TEXT;
      }
      function Ce(a) {
        var i = a.entity, A = i.toLowerCase(), S, H = "";
        return a.ENTITIES[i] ? a.ENTITIES[i] : a.ENTITIES[A] ? a.ENTITIES[A] : (i = A, i.charAt(0) === "#" && (i.charAt(1) === "x" ? (i = i.slice(2), S = parseInt(i, 16), H = S.toString(16)) : (i = i.slice(1), S = parseInt(i, 10), H = S.toString(10))), i = i.replace(/^0+/, ""), isNaN(S) || H.toLowerCase() !== i || S < 0 || S > 1114111 || !ge(S) ? (Z(a, "Invalid character entity"), "&" + a.entity + ";") : String.fromCodePoint(S));
      }
      function ge(a) {
        return a === 9 || a === 10 || a === 13 || a >= 32 && a <= 55295 || a >= 57344 && a <= 65533 || a >= 65536 && a <= 1114111;
      }
      function Oe(a, i) {
        i === "<" ? (a.state = w.OPEN_WAKA, a.startTagPosition = a.position) : T(i) || (Z(a, "Non-whitespace before first tag."), a.textNode = i, a.state = w.TEXT);
      }
      function ue(a, i) {
        var A = "";
        return i < a.length && (A = a.charAt(i)), A;
      }
      function Ae(a) {
        var i = this;
        if (this.error)
          throw this.error;
        if (i.closed)
          return te(
            i,
            "Cannot write after close. Assign an onready handler."
          );
        if (a === null)
          return ne(i);
        typeof a == "object" && (a = a.toString());
        for (var A = 0, S = ""; S = ue(a, A++), i.c = S, !!S; )
          switch (i.trackPosition && (i.position++, S === `
` ? (i.line++, i.column = 0) : i.column++), i.state) {
            case w.BEGIN:
              if (i.state = w.BEGIN_WHITESPACE, S === "\uFEFF")
                continue;
              Oe(i, S);
              continue;
            case w.BEGIN_WHITESPACE:
              Oe(i, S);
              continue;
            case w.TEXT:
              if (i.sawRoot && !i.closedRoot) {
                for (var G = A - 1; S && S !== "<" && S !== "&"; )
                  S = ue(a, A++), S && i.trackPosition && (i.position++, S === `
` ? (i.line++, i.column = 0) : i.column++);
                i.textNode += a.substring(G, A - 1);
              }
              S === "<" && !(i.sawRoot && i.closedRoot && !i.strict) ? (i.state = w.OPEN_WAKA, i.startTagPosition = i.position) : (!T(S) && (!i.sawRoot || i.closedRoot) && Z(i, "Text data outside of root node."), S === "&" ? i.state = w.TEXT_ENTITY : i.textNode += S);
              continue;
            case w.SCRIPT:
              S === "<" ? i.state = w.SCRIPT_ENDING : i.script += S;
              continue;
            case w.SCRIPT_ENDING:
              S === "/" ? i.state = w.CLOSE_TAG : (i.script += "<" + S, i.state = w.SCRIPT);
              continue;
            case w.OPEN_WAKA:
              if (S === "!")
                i.state = w.SGML_DECL, i.sgmlDecl = "";
              else if (!T(S)) if (D(b, S))
                i.state = w.OPEN_TAG, i.tagName = S;
              else if (S === "/")
                i.state = w.CLOSE_TAG, i.tagName = "";
              else if (S === "?")
                i.state = w.PROC_INST, i.procInstName = i.procInstBody = "";
              else {
                if (Z(i, "Unencoded <"), i.startTagPosition + 1 < i.position) {
                  var H = i.position - i.startTagPosition;
                  S = new Array(H).join(" ") + S;
                }
                i.textNode += "<" + S, i.state = w.TEXT;
              }
              continue;
            case w.SGML_DECL:
              if (i.sgmlDecl + S === "--") {
                i.state = w.COMMENT, i.comment = "", i.sgmlDecl = "";
                continue;
              }
              i.doctype && i.doctype !== !0 && i.sgmlDecl ? (i.state = w.DOCTYPE_DTD, i.doctype += "<!" + i.sgmlDecl + S, i.sgmlDecl = "") : g.test(i.sgmlDecl + S) ? (U(i, "onopencdata"), i.state = w.CDATA, i.sgmlDecl = "", i.cdata = "") : f.test(i.sgmlDecl + S) ? (i.state = w.DOCTYPE, (i.doctype || i.sawRoot) && Z(
                i,
                "Inappropriately located doctype declaration"
              ), i.doctype = "", i.sgmlDecl = "") : S === ">" ? (U(i, "onsgmldeclaration", i.sgmlDecl), i.sgmlDecl = "", i.state = w.TEXT) : (_(S) && (i.state = w.SGML_DECL_QUOTED), i.sgmlDecl += S);
              continue;
            case w.SGML_DECL_QUOTED:
              S === i.q && (i.state = w.SGML_DECL, i.q = ""), i.sgmlDecl += S;
              continue;
            case w.DOCTYPE:
              S === ">" ? (i.state = w.TEXT, U(i, "ondoctype", i.doctype), i.doctype = !0) : (i.doctype += S, S === "[" ? i.state = w.DOCTYPE_DTD : _(S) && (i.state = w.DOCTYPE_QUOTED, i.q = S));
              continue;
            case w.DOCTYPE_QUOTED:
              i.doctype += S, S === i.q && (i.q = "", i.state = w.DOCTYPE);
              continue;
            case w.DOCTYPE_DTD:
              S === "]" ? (i.doctype += S, i.state = w.DOCTYPE) : S === "<" ? (i.state = w.OPEN_WAKA, i.startTagPosition = i.position) : _(S) ? (i.doctype += S, i.state = w.DOCTYPE_DTD_QUOTED, i.q = S) : i.doctype += S;
              continue;
            case w.DOCTYPE_DTD_QUOTED:
              i.doctype += S, S === i.q && (i.state = w.DOCTYPE_DTD, i.q = "");
              continue;
            case w.COMMENT:
              S === "-" ? i.state = w.COMMENT_ENDING : i.comment += S;
              continue;
            case w.COMMENT_ENDING:
              S === "-" ? (i.state = w.COMMENT_ENDED, i.comment = F(i.opt, i.comment), i.comment && U(i, "oncomment", i.comment), i.comment = "") : (i.comment += "-" + S, i.state = w.COMMENT);
              continue;
            case w.COMMENT_ENDED:
              S !== ">" ? (Z(i, "Malformed comment"), i.comment += "--" + S, i.state = w.COMMENT) : i.doctype && i.doctype !== !0 ? i.state = w.DOCTYPE_DTD : i.state = w.TEXT;
              continue;
            case w.CDATA:
              for (var G = A - 1; S && S !== "]"; )
                S = ue(a, A++), S && i.trackPosition && (i.position++, S === `
` ? (i.line++, i.column = 0) : i.column++);
              i.cdata += a.substring(G, A - 1), S === "]" && (i.state = w.CDATA_ENDING);
              continue;
            case w.CDATA_ENDING:
              S === "]" ? i.state = w.CDATA_ENDING_2 : (i.cdata += "]" + S, i.state = w.CDATA);
              continue;
            case w.CDATA_ENDING_2:
              S === ">" ? (i.cdata && U(i, "oncdata", i.cdata), U(i, "onclosecdata"), i.cdata = "", i.state = w.TEXT) : S === "]" ? i.cdata += "]" : (i.cdata += "]]" + S, i.state = w.CDATA);
              continue;
            case w.PROC_INST:
              S === "?" ? i.state = w.PROC_INST_ENDING : T(S) ? i.state = w.PROC_INST_BODY : i.procInstName += S;
              continue;
            case w.PROC_INST_BODY:
              if (!i.procInstBody && T(S))
                continue;
              S === "?" ? i.state = w.PROC_INST_ENDING : i.procInstBody += S;
              continue;
            case w.PROC_INST_ENDING:
              if (S === ">") {
                const le = {
                  name: i.procInstName,
                  body: i.procInstBody
                };
                L(i, le), U(i, "onprocessinginstruction", le), i.procInstName = i.procInstBody = "", i.state = w.TEXT;
              } else
                i.procInstBody += "?" + S, i.state = w.PROC_INST_BODY;
              continue;
            case w.OPEN_TAG:
              D(y, S) ? i.tagName += S : (ve(i), S === ">" ? be(i) : S === "/" ? i.state = w.OPEN_TAG_SLASH : (T(S) || Z(i, "Invalid character in tag name"), i.state = w.ATTRIB));
              continue;
            case w.OPEN_TAG_SLASH:
              S === ">" ? (be(i, !0), _e(i)) : (Z(
                i,
                "Forward-slash in opening tag not followed by >"
              ), i.state = w.ATTRIB);
              continue;
            case w.ATTRIB:
              if (T(S))
                continue;
              S === ">" ? be(i) : S === "/" ? i.state = w.OPEN_TAG_SLASH : D(b, S) ? (i.attribName = S, i.attribValue = "", i.state = w.ATTRIB_NAME) : Z(i, "Invalid attribute name");
              continue;
            case w.ATTRIB_NAME:
              S === "=" ? i.state = w.ATTRIB_VALUE : S === ">" ? (Z(i, "Attribute without value"), i.attribValue = i.attribName, Ee(i), be(i)) : T(S) ? i.state = w.ATTRIB_NAME_SAW_WHITE : D(y, S) ? i.attribName += S : Z(i, "Invalid attribute name");
              continue;
            case w.ATTRIB_NAME_SAW_WHITE:
              if (S === "=")
                i.state = w.ATTRIB_VALUE;
              else {
                if (T(S))
                  continue;
                Z(i, "Attribute without value"), i.tag.attributes[i.attribName] = "", i.attribValue = "", U(i, "onattribute", {
                  name: i.attribName,
                  value: ""
                }), i.attribName = "", S === ">" ? be(i) : D(b, S) ? (i.attribName = S, i.state = w.ATTRIB_NAME) : (Z(i, "Invalid attribute name"), i.state = w.ATTRIB);
              }
              continue;
            case w.ATTRIB_VALUE:
              if (T(S))
                continue;
              _(S) ? (i.q = S, i.state = w.ATTRIB_VALUE_QUOTED) : (i.opt.unquotedAttributeValues || te(i, "Unquoted attribute value"), i.state = w.ATTRIB_VALUE_UNQUOTED, i.attribValue = S);
              continue;
            case w.ATTRIB_VALUE_QUOTED:
              if (S !== i.q) {
                S === "&" ? i.state = w.ATTRIB_VALUE_ENTITY_Q : i.attribValue += S;
                continue;
              }
              Ee(i), i.q = "", i.state = w.ATTRIB_VALUE_CLOSED;
              continue;
            case w.ATTRIB_VALUE_CLOSED:
              T(S) ? i.state = w.ATTRIB : S === ">" ? be(i) : S === "/" ? i.state = w.OPEN_TAG_SLASH : D(b, S) ? (Z(i, "No whitespace between attributes"), i.attribName = S, i.attribValue = "", i.state = w.ATTRIB_NAME) : Z(i, "Invalid attribute name");
              continue;
            case w.ATTRIB_VALUE_UNQUOTED:
              if (!M(S)) {
                S === "&" ? i.state = w.ATTRIB_VALUE_ENTITY_U : i.attribValue += S;
                continue;
              }
              Ee(i), S === ">" ? be(i) : i.state = w.ATTRIB;
              continue;
            case w.CLOSE_TAG:
              if (i.tagName)
                S === ">" ? _e(i) : D(y, S) ? i.tagName += S : i.script ? (i.script += "</" + i.tagName + S, i.tagName = "", i.state = w.SCRIPT) : (T(S) || Z(i, "Invalid tagname in closing tag"), i.state = w.CLOSE_TAG_SAW_WHITE);
              else {
                if (T(S))
                  continue;
                E(b, S) ? i.script ? (i.script += "</" + S, i.state = w.SCRIPT) : Z(i, "Invalid tagname in closing tag.") : i.tagName = S;
              }
              continue;
            case w.CLOSE_TAG_SAW_WHITE:
              if (T(S))
                continue;
              S === ">" ? _e(i) : Z(i, "Invalid characters in closing tag");
              continue;
            case w.TEXT_ENTITY:
            case w.ATTRIB_VALUE_ENTITY_Q:
            case w.ATTRIB_VALUE_ENTITY_U:
              var Y, oe;
              switch (i.state) {
                case w.TEXT_ENTITY:
                  Y = w.TEXT, oe = "textNode";
                  break;
                case w.ATTRIB_VALUE_ENTITY_Q:
                  Y = w.ATTRIB_VALUE_QUOTED, oe = "attribValue";
                  break;
                case w.ATTRIB_VALUE_ENTITY_U:
                  Y = w.ATTRIB_VALUE_UNQUOTED, oe = "attribValue";
                  break;
              }
              if (S === ";") {
                var se = Ce(i);
                i.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(se) ? ((i.entityCount += 1) > i.opt.maxEntityCount && te(
                  i,
                  "Parsed entity count exceeds max entity count"
                ), (i.entityDepth += 1) > i.opt.maxEntityDepth && te(
                  i,
                  "Parsed entity depth exceeds max entity depth"
                ), i.entity = "", i.state = Y, i.write(se), i.entityDepth -= 1) : (i[oe] += se, i.entity = "", i.state = Y);
              } else D(i.entity.length ? C : I, S) ? i.entity += S : (Z(i, "Invalid character in entity name"), i[oe] += "&" + i.entity + S, i.entity = "", i.state = Y);
              continue;
            default:
              throw new Error(i, "Unknown state: " + i.state);
          }
        return i.position >= i.bufferCheckPosition && o(i), i;
      }
      String.fromCodePoint || (function() {
        var a = String.fromCharCode, i = Math.floor, A = function() {
          var S = 16384, H = [], G, Y, oe = -1, se = arguments.length;
          if (!se)
            return "";
          for (var le = ""; ++oe < se; ) {
            var v = Number(arguments[oe]);
            if (!isFinite(v) || // `NaN`, `+Infinity`, or `-Infinity`
            v < 0 || // not a valid Unicode code point
            v > 1114111 || // not a valid Unicode code point
            i(v) !== v)
              throw RangeError("Invalid code point: " + v);
            v <= 65535 ? H.push(v) : (v -= 65536, G = (v >> 10) + 55296, Y = v % 1024 + 56320, H.push(G, Y)), (oe + 1 === se || H.length > S) && (le += a.apply(null, H), H.length = 0);
          }
          return le;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: A,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = A;
      })();
    })(t);
  })(pt)), pt;
}
var ht, Ft;
function lr() {
  if (Ft) return ht;
  Ft = 1;
  var t = ar().parser;
  function e(n) {
    var s = [], o = [], l = s, p;
    return p = t(!0), p.ontext = function(r) {
      r.trim() !== "" && l.push(r);
    }, p.onopentag = function(r) {
      var d;
      d = [r.name, r.attributes], o.push(l), l.push(d), l = d;
    }, p.onclosetag = function() {
      l = o.pop();
    }, p.write(n).close(), s[0];
  }
  return ht = e, ht;
}
var mt, Ht;
function cr() {
  if (Ht) return mt;
  Ht = 1;
  function t(e, n) {
    var s = function() {
    }, o = s, l = s;
    function p() {
      this._skip = !0;
    }
    function r() {
      this._remove = !0;
    }
    function d(x) {
      this._name = x;
    }
    function c(x) {
      this._replace = x;
    }
    function u(x, g) {
      var f, m = { attr: {}, full: x }, h = {
        name: d,
        skip: p,
        // break: breakFn,
        remove: r,
        replace: c,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, N = !0, b, y, I;
      if (x !== void 0 && x !== null && x !== !0 && x !== !1)
        switch (f = Object.prototype.toString.call(x), f) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (x.some(function(C, T) {
              if (T === 0)
                return m.name = C, !1;
              if (T === 1)
                return Object.prototype.toString.call(C) === "[object Object]" && (N = !1, m.attr = C), !0;
            }), o.call(h, m, g), h._name && (x[0] = h._name), h._replace)
              return h._replace;
            if (h._remove)
              return null;
            if (!h._skip) {
              for (b = 0, y = x.length; b < y; ) {
                if (b > 1 || b === 1 && N) {
                  if (I = u(x[b], m), I === null) {
                    x.splice(b, 1), y -= 1;
                    continue;
                  }
                  I && (x[b] = I);
                }
                b += 1;
              }
              if (l.call(h, m, g), h._name && (x[0] = h._name), h._replace)
                return h._replace;
              if (h._remove)
                return null;
            }
        }
    }
    n && (n.enter && (o = n.enter), n.leave && (l = n.leave)), u(e, void 0);
  }
  return mt = t, mt;
}
var gt, zt;
function dr() {
  if (zt) return gt;
  zt = 1;
  const t = lr(), e = cr(), n = (o) => String(o).replace(/[&<>"']/g, (l) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[l]);
  function s(o) {
    const [l, ...p] = o, r = p[0] && typeof p[0] == "object" && !Array.isArray(p[0]) ? p.shift() : {}, d = "<" + l + Object.entries(r).map(([c, u]) => " " + c + '="' + n(u) + '"').join("");
    return p.length ? d + ">" + p.map((c) => Array.isArray(c) ? s(c) : n(c)).join("") + "</" + l + ">" : d + "/>";
  }
  return gt = { parse: t, p: t, traverse: e, t: e, stringify: s, s }, gt;
}
dr();
const bt = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), ur = (t, e) => [...t].reduce((n, s) => n + (s.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function fr(t, e, n = 12) {
  const s = [], o = t.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));
  for (const [p, r] of t.entries()) {
    if (!r.labels.length) continue;
    const d = Math.max(...r.labels.map((m) => ur(m.text, n))) + 4, c = r.labels.length * (n + 4), u = [];
    for (const m of [5, 14, 28, 48]) {
      const h = { x: r.x + (r.w - d) / 2, y: r.y - m - c, w: d, h: c }, N = { x: r.x + (r.w - d) / 2, y: r.y + r.h + m, w: d, h: c }, b = { x: r.x + r.w + m, y: r.y + (r.h - c) / 2, w: d, h: c }, y = { x: r.x - m - d, y: r.y + (r.h - c) / 2, w: d, h: c };
      u.push(...r.w > r.h ? [h, N, b, y] : [b, y, h, N]);
    }
    const x = (m) => e.reduce((h, N) => {
      const b = Math.min(N.a.x, N.b.x), y = Math.min(N.a.y, N.b.y), I = { x: b - 1, y: y - 1, w: Math.abs(N.a.x - N.b.x) + 2, h: Math.abs(N.a.y - N.b.y) + 2 };
      return h + bt(m, I) * 2;
    }, 0);
    let g = null, f = 1 / 0;
    for (const [m, h] of u.entries()) {
      const N = o.reduce((b, y, I) => b + (I === p ? 0 : bt(h, y)) * 500, 0) + s.reduce((b, y) => b + bt(h, y) * 100, 0) + x(h) + m * 3;
      N < f && (f = N, g = h);
    }
    r.labels.forEach((m, h) => {
      m.x = g.x - r.x, m.y = g.y - r.y + n + h * (n + 4);
    }), s.push(g);
  }
  const l = [...o, ...s];
  return { x: Math.min(0, ...l.map((p) => p.x)), y: Math.min(0, ...l.map((p) => p.y)), right: Math.max(0, ...l.map((p) => p.x + p.w)), bottom: Math.max(0, ...l.map((p) => p.y + p.h)) };
}
const pr = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function hr(t, e = 12) {
  const n = [...t.children].filter((l) => l.localName === "g" && l.id.startsWith("cell_")).map((l) => ({ ...pr(l.getAttribute("transform")), w: +l.getAttribute("s:width"), h: +l.getAttribute("s:height"), labels: [...l.children].filter((p) => p.localName === "text" && p.hasAttribute("data-layout-label")).map((p) => ({ node: p, text: p.textContent })) })), s = [...t.children].filter((l) => l.localName === "line" && l.hasAttribute("data-net")).map((l) => ({ a: { x: +l.getAttribute("x1"), y: +l.getAttribute("y1") }, b: { x: +l.getAttribute("x2"), y: +l.getAttribute("y2") } })), o = fr(n, s, e);
  for (const l of n) for (const p of l.labels)
    p.node.setAttribute("x", p.x), p.node.setAttribute("y", p.y), p.node.setAttribute("text-anchor", "start"), p.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(o), o;
}
function mr(t) {
  const e = t("diagnostics"), n = t("messages"), s = t("toggle-log");
  let o = 0, l = !0, p = !1;
  function r(m) {
    n.dataset.expanded = String(m), s.setAttribute("aria-expanded", String(m)), e.hidden = !m;
  }
  s.onclick = () => r(s.getAttribute("aria-expanded") !== "true");
  let d = [];
  const c = () => [e.clientWidth, e.clientHeight], u = () => c().some((m, h) => m !== d[h]);
  function x() {
    p || (p = !0, requestAnimationFrame(() => {
      l && (e.scrollTop = e.scrollHeight), d = c(), p = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (u()) {
      d = c(), l && x();
      return;
    }
    p || (l = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    d = c(), l && x();
  }).observe(e);
  function f({ message: m, severity: h = "info", category: N = "Tools", line: b, source: y }) {
    if (!m) return;
    const I = l, C = /* @__PURE__ */ new Date(), T = document.createElement("li"), _ = document.createElement("time"), M = document.createElement("span"), D = document.createElement("strong");
    h = ["error", "warning", "info"].includes(h) ? h : "info", T.className = h, T.dataset.logSequence = String(++o), T.dataset.logCategory = N, T.dataset.logSeverity = h, _.dateTime = C.toISOString(), _.textContent = C.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), _.title = _.dateTime, D.textContent = h.toUpperCase() + " · " + N + " ", M.append(D, document.createTextNode((y && y !== "input.cir" ? y + " · " : "") + (b ? "line " + b + " · " : "") + m)), T.append(_, M), e.append(T), t("message-count").textContent = o + " entries", h !== "info" && r(!0), I && x();
  }
  return { append: f };
}
const qt = ze.filter.source, V = (t) => document.getElementById("spice-" + t), we = V("app");
if (we) {
  let l = function(a, { severity: i = "info", category: A = "Rendering" } = {}) {
    n.textContent = a, s.append({ message: a, severity: i, category: A });
  }, $ = function() {
    const a = e.querySelector("svg");
    if (!a) return;
    c?.resetLabelDisplay();
    const i = Number(a.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, A = hr(a, i), S = c?.placeLabels() || A;
    a.dataset.labelBounds = JSON.stringify(S);
    const H = Math.min(T.x, S.x - 20), G = Math.min(T.y, S.y - 20);
    T = { x: H, y: G, w: Math.max(T.x + T.w, S.right + 20) - H, h: Math.max(T.y + T.h, S.bottom + 20) - G }, u && so(a, x, u), c?.refreshColors(), tt(a, z(), V("show-grid").checked, C);
    const Y = a.cloneNode(!0);
    c?.cleanExport(Y), Y.setAttribute("width", T.w), Y.setAttribute("height", T.h), Y.setAttribute("viewBox", `${T.x} ${T.y} ${T.w} ${T.h}`), tt(Y, z(), V("show-grid").checked, T), g = new XMLSerializer().serializeToString(Y), V("source").value = g;
  }, X = function(a) {
    const i = V("example-info");
    if (i && (i.replaceChildren(), !!a && (i.append(document.createTextNode(a.description + " ")), a.url))) {
      const A = document.createElement("a");
      A.href = a.url, A.target = "_blank", A.rel = "noopener noreferrer", A.textContent = a.reference, i.append(A);
    }
  }, F = function() {
    c.invalidate(), ee.setEnabled(!1), p = null, r = null, g = "", B(), X(Object.values(ze).find((a) => a.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, te = function(a) {
    for (const i of a) {
      const A = JSON.stringify([i.severity, i.line, i.message, i.source]);
      o.has(A) || (o.add(A), s.append({ ...i, category: "Parser / rendering" }));
    }
  }, ne = function() {
    !I && g && E.set(b, { ...C }), e.querySelector("svg")?.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`);
    const a = e.querySelector("svg");
    a && tt(a, z(), V("show-grid").checked, C), V("zoom-level").textContent = Math.round(T.w / C.w * 100) + "%";
  }, ve = function(a, i = C.x + C.w / 2, A = C.y + C.h / 2) {
    if (!e.querySelector("svg")) return;
    const S = Math.max(0.05, Math.min(10, C.w * a / T.w)) * T.w / C.w;
    C = { x: i + (C.x - i) * S, y: A + (C.y - A) * S, w: C.w * S, h: C.h * S }, ne();
  }, Ee = function(a) {
    const i = new URLSearchParams();
    a && i.set("instance", a);
    const A = i.toString();
    location.hash.slice(1) === A ? (b = a, ge()) : location.hash = A;
  }, be = function() {
    b = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, _e = function() {
    const a = !!(y && y !== b && m?.contexts[y]);
    V("selection-actions").hidden = !a, V("open-instance").href = "#" + new URLSearchParams({ instance: y });
  }, Ce = function() {
    V("breadcrumbs").replaceChildren();
    const a = (A, S) => {
      const H = document.createElement("button");
      H.type = "button", H.textContent = A, H.onclick = () => Ee(S), H.disabled = S === b, V("breadcrumbs").append(H);
    };
    if (a("Top", ""), b) {
      const A = m.contexts[b].path;
      for (let S = 0; S < A.length; S++) a(A[S], A.slice(0, S + 1).map(encodeURIComponent).join("/"));
    }
    V("instances").replaceChildren();
    const i = (A, S) => {
      for (const H of A.children) {
        const G = document.createElement("div");
        G.className = "spice-instance-row", G.style.setProperty("--depth", Math.min(S, 8)), G.dataset.instance = H.id;
        const Y = document.createElement("a");
        Y.href = "#" + new URLSearchParams({ instance: H.id }), Y.textContent = H.name + " · " + H.definition, Y.title = "Open " + H.id + " as its own sheet";
        const oe = document.createElement("span");
        if (oe.className = "spice-help", oe.textContent = Object.entries(H.params).map(([se, le]) => se + "=" + le).join(" · "), G.append(Y), oe.textContent) {
          const se = document.createElement("details"), le = document.createElement("summary");
          le.textContent = "Parameters", se.append(le, oe), G.append(se);
        }
        V("instances").append(G), i(H, S + 1);
      }
    };
    i(m.contexts[b], 0), V("hierarchy-panel").hidden = !m.contexts[b].children.length, V("focus-title").textContent = b ? b + " / " + m.contexts[b].definition : "Top-level schematic", _e();
  };
  nr(we), lo(we);
  const t = V("input"), e = V("preview"), n = V("status"), s = mr(V);
  let o = /* @__PURE__ */ new Set(), p = null, r = null, d = !1, c = null, u = null, x = [], g = "", f, m, h, N = "", b = "", y = "", I = !1, C = { x: 0, y: 0, w: 1, h: 1 }, T = { ...C }, _, M = !1, D = {}, E = /* @__PURE__ */ new Map(), w = !1;
  try {
    D = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  we.addEventListener("click", (a) => {
    I && a.target.closest('a[href^="#"]') && a.preventDefault();
  });
  const B = () => {
    V("upload").disabled = I || w || d, V("download-project").disabled = V("open-download").disabled = V("copy").disabled = V("download").disabled = !g || I || w || c?.working(), V("download-asc").disabled = V("download-asc-bundle").disabled = !g || !p || I || d || !c?.complete();
  }, W = () => ({ font: V("font").value, fontSize: Number(V("size").value), color: Ct, gridSize: V("grid").checked && V("conventional").checked ? Nt : 0, detailed: V("detailed").checked, conventional: V("conventional").checked }), z = () => f?.layout.report?.gridSize ? Number(V("grid-size").value) : 0, ee = ao(V, (a, i) => {
    u = a, x = i, $();
  });
  c = vo(e, V, { report: s.append, applyLayoutTemplate: L, getNetColor: (a) => {
    const i = x.find((A) => A.bit === a);
    return i && u && (u.auto || u.manual.has(i.name)) ? u.color(i.name) : null;
  }, inspect: (a, i) => {
    const A = f?.components.find((S) => S.name === a);
    if (A)
      y = A.instanceId || "", V("selection").textContent = A.raw, _e();
    else if (i?.decoration) {
      y = "";
      const S = Object.values(f.nodes).find((H) => H.bit === i.ports[0]?.bit);
      V("selection").textContent = "Ground symbol · " + (S?.displayName || "0"), _e();
    }
  }, changed: (a, i, A) => {
    p = a, r = null, T = A;
    const S = e.querySelector("svg");
    if (S) {
      S.setAttribute("width", String(T.w)), S.setAttribute("height", String(T.h));
      const H = S.querySelector("#spice-layout-report");
      if (H) {
        const G = JSON.parse(H.textContent);
        G.manualWiring = i, G.verifiedTerminals = !i.unrouted, G.geometricConnectivityVerified = !i.unrouted, H.textContent = JSON.stringify(G);
      }
    }
    f && h && (V("json").value = JSON.stringify({ circuit: f, netlist: Fe(f), hierarchy: h, interactive: { ...i, drawing: a } }, null, 2)), $(), B();
  } }), V("show-grid").onchange = $, V("grid-size").onchange = () => {
    $(), ne();
  };
  async function L(a, i, A) {
    const S = m, H = t.value, G = W(), Y = No(S, a, i), oe = c.snapshotSheets(), se = [], le = (O) => JSON.stringify(O) === JSON.stringify(G);
    async function v(O) {
      const k = Fe(O), R = await Ze(k, G), q = new DOMParser().parseFromString(R.svg, "image/svg+xml").documentElement;
      for (const j of Object.values(O.nodes)) for (const Q of q.querySelectorAll(".net_" + j.bit)) Q.setAttribute("data-net", j.name);
      return { drawing: Et(q, R.drawing, O, k), svg: q };
    }
    for (const O of Y.instances) {
      const k = oe.find((ce) => ce.scope === O.source && le(ce.settings)), R = oe.find((ce) => ce.scope === O.target && le(ce.settings)), q = await v(O.sourceCircuit), j = await v(O.targetCircuit), Q = k?.snapshot || q.drawing;
      at(q.drawing, Q, 4);
      const J = /* @__PURE__ */ new Map(), ie = /* @__PURE__ */ new Map();
      for (const ce of j.svg.querySelectorAll("text")) {
        if (ce.closest("defs")) continue;
        const me = ce.closest('g[id^="cell_"]')?.id.slice(5) || "", Me = J.get(me) || 0;
        J.set(me, Me + 1), ie.set(ct(me, Me), ce.textContent);
      }
      const K = So(Q, j.drawing, O, { targetLabels: ie, targetOverrides: R?.snapshot.labelOverrides || [] });
      vt(j.svg, K.labelOverrides), se.push({ scope: O.target, topology: O.targetCircuit.topology.signature, settings: G, snapshot: K, templateSource: O.source });
    }
    if (!A() || m !== S || t.value !== H || !le(W())) throw Error("Layout template cancelled because the current circuit changed.");
    for (const O of se) c.saveTemplateSheet(O);
    s.append({ category: "Tools", message: "Layout template applied to " + se.length + " subcircuit page(s), including all nested instances." });
  }
  async function U() {
    (!p || !f?.layout.report?.gridVerified) && (V("grid").checked = !0, V("conventional").checked = !0, await ge({ resetEditor: !0 })), c.setEnabled(V("interactive").checked), B();
  }
  V("interactive").onchange = U, V("label-edit").onclick = async () => {
    V("interactive").checked = !0, await U(), c.setLabelEditing(!c.labelEditing()), e.focus({ preventScroll: !0 });
  }, V("group").onclick = () => {
    c.toggleGroup(), e.focus({ preventScroll: !0 });
  }, V("flywire").onchange = async () => {
    V("interactive").checked = !0, await U(), V("flywire").checked ? c.clear() : await c.autoRoute(), B();
  }, V("layout-brush").onclick = () => {
    c.toggleLayoutBrush(), e.focus({ preventScroll: !0 });
  }, V("auto-route").onclick = async () => {
    V("interactive").checked = !0, await U(), await c.autoRoute(), B();
  }, V("wire-undo").onclick = () => c.undo(), V("wire-redo").onclick = () => c.redo();
  for (const a of we.querySelectorAll("[data-editor-mode]")) a.onclick = async () => {
    V("interactive").checked = !0, await U(), c.chooseTool(a.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const a of we.querySelectorAll("[data-editor-arrange]")) a.onclick = () => {
    c.arrange(a.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  ee.setEnabled(!1), t.value = qt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || qt;
  } catch {
  }
  X(Object.values(ze).find((a) => a.source === t.value)), t.addEventListener("input", F);
  for (const a of ["font", "size", "detailed", "conventional", "grid"]) V(a).addEventListener("input", F);
  new ResizeObserver(() => {
    const a = e.querySelector("svg");
    a && tt(a, z(), V("show-grid").checked, C);
  }).observe(e), V("zoom-in").onclick = () => ve(0.8), V("zoom-out").onclick = () => ve(1.25), V("fit").onclick = () => {
    C = { ...T }, ne();
  };
  const ke = (a) => {
    const i = e.querySelector("svg");
    return i ? new DOMPoint(a.clientX, a.clientY).matrixTransform(i.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (a) => {
    const i = ke(a);
    i && (a.preventDefault(), ve(a.deltaY > 0 ? 1.12 : 1 / 1.12, i.x, i.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (a) => {
    ![0, 1].includes(a.button) || !e.querySelector("svg") || (_ = { start: ke(a), x: a.clientX, y: a.clientY, view: { ...C }, moved: !1 }, e.setPointerCapture(a.pointerId));
  }), e.addEventListener("pointermove", (a) => {
    if (!_) return;
    const i = ke(a);
    Math.hypot(a.clientX - _.x, a.clientY - _.y) > 4 && (_.moved = !0), C.x += _.start.x - i.x, C.y += _.start.y - i.y, ne();
  }), e.addEventListener("pointerup", (a) => {
    if (!_) return;
    const i = _.moved;
    if (_ = null, e.hasPointerCapture(a.pointerId) && e.releasePointerCapture(a.pointerId), !i && !c?.labelEditing()) {
      const A = document.elementFromPoint(a.clientX, a.clientY)?.closest("[data-component]"), S = f?.components.find((H) => H.name === A?.dataset.component);
      S && (y = S.instanceId || "", V("selection").textContent = `${S.raw}
${Object.entries(S.terminals).map(([H, G]) => `${H} → ${G}`).join("   ")}`, S.kind === "X" ? Ee(S.instanceId) : _e());
    }
  }), window.addEventListener("hashchange", () => {
    if (I) {
      M = !0;
      return;
    }
    be(), y = "", ge();
  }), e.addEventListener("pointercancel", () => {
    _ = null;
  }), e.addEventListener("keydown", (a) => {
    const i = a.target.closest("[data-instance]");
    if (i && !c?.layoutBrushActive() && !c?.labelEditing() && (a.key === "Enter" || a.key === " ")) {
      a.preventDefault(), y = i.dataset.instance, Ee(y);
      return;
    }
    a.key === "+" || a.key === "=" ? ve(0.8) : a.key === "-" ? ve(1.25) : a.key.toLowerCase() === "f" ? (C = { ...T }, ne()) : a.key.startsWith("Arrow") && (a.preventDefault(), C.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[a.key] || 0) * C.w, C.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[a.key] || 0) * C.h, ne());
  });
  async function ge({ resetEditor: a = !1 } = {}) {
    if (I) return;
    o = /* @__PURE__ */ new Set(), I = !0, c.invalidate(), ee.setEnabled(!1), p = null, r = null, g = "", B(), V("generate").disabled = !0, t.readOnly = !0, V("file").disabled = !0, V("libraries").disabled = !0;
    for (const A of we.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) A.disabled = !0;
    l("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let i = [];
    try {
      if (N !== t.value || !m) {
        if (N && N !== t.value && (c.clearSheets(), E.clear()), h = Tt(t.value, { files: D }), i = [...h.diagnostics], i.some((k) => k.severity === "error"))
          throw m = null, Error("Fix the parser errors below before generating.");
        m = it(h), N && N !== t.value ? (b = "", y = "", history.replaceState(null, "", location.pathname + location.search)) : be(), N = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (i = [...h.diagnostics], te(i), i.some((k) => k.severity === "error")) throw Error("Fix the parser errors below before generating.");
      f = He(m, { focus: b });
      for (const k of f.interfaceAliases) i.push({ severity: "info", message: `Instance boundary: ${k.ports.join(" = ")} share parent node ${k.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const A = Fe(f);
      W().conventional && i.push(...f.layout.diagnostics);
      const S = await Ze(A, W()), H = new DOMParser().parseFromString(S.svg, "image/svg+xml");
      if (H.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const G = H.documentElement, Y = G.querySelector("#spice-layout-report");
      if (Y) {
        f.layout.report = JSON.parse(Y.textContent);
        const k = f.layout.report;
        if (i.push({ severity: "info", message: `Layout: compact signal flow; ${k.powerSourcesChecked} DC/ground symbols checked, ${k.powerOrderViolations} DC order preference(s) unmet. ${k.powerPass}. ${k.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), k.classicTemplateFallback && i.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), k.groundPlacement && i.push({ severity: "info", message: `Ground: ${k.groundPlacement}; ${k.straightenedGroundDrops || 0} return-path simplification(s).` }), k.explicitGroups && i.push({ severity: "info", message: `Layout comments: ${k.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), k.classicRails && i.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${k.railCount} shared voltage rails.` }), k.localClassicInstances?.length && i.push({ severity: "info", message: `${k.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), k.localClassicStages?.length && i.push({ severity: "info", message: `Classic transistor proximity active: ${k.localClassicStages.join(", ")}.` }), k.sharedClassicRails && i.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), k.mirroredTransistors?.length && i.push({ severity: "info", message: `Control-pin mirror choices: ${k.mirroredTransistors.join(", ")}.` }), k.recognizedMotifs?.length && i.push({ severity: "info", message: `Transistor structures: ${k.recognizedMotifs.map((R) => `${R.kind} (${R.members.join(", ")}; ${R.confidence})`).join("; ")}.` }), k.appliedMotifs?.length && i.push({ severity: "info", message: `Topology preferences applied to ${k.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), k.subnetFirstFallback && i.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + k.subnetFirstFallback }), k.pairCompactionFallback && i.push({ severity: "warning", message: "Pair proximity kept the original regions: " + k.pairCompactionFallback }), k.compoundPairFallback && i.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + k.compoundPairFallback }), k.pairConstraints?.length) {
          const R = k.pairConstraints.filter((q) => q.crossRegion && !q.compacted).length;
          i.push({ severity: "info", message: `${k.pairConstraints.length - R} adjacent transistor pair(s); ${R} cross-region mirror row constraint(s).` });
        }
        k.netShortcuts && i.push({ severity: "info", message: `${k.netShortcuts} safe straight net shortcut(s); ${k.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), k.sharedRailFallback && i.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${k.sharedRailFallback}.` });
        for (const R of k.localClassicFallbacks || []) R.stage && i.push({ severity: "info", message: `Classic stage ${R.stage} uses automatic layout: ${R.reason || "No unobstructed local template"}.` });
        k.geometricConnectivityVerified && i.push({ severity: "info", message: `Net geometry verified; ${k.cyclesRemoved} same-net loop(s) and ${k.leavesRemoved} unused wire branch(es) removed.` }), te(i);
      }
      if (G.localName !== "svg" || G.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const oe = Number(G.getAttribute("width")), se = Number(G.getAttribute("height")), le = JSON.parse(G.getAttribute("data-label-bounds") || "null");
      T = { x: Math.min(-20, (le?.x ?? 0) - 20), y: Math.min(-20, (le?.y ?? 0) - 20) }, T.w = Math.max(oe, le?.right || 0) + 20 - T.x, T.h = Math.max(se, le?.bottom || 0) + 20 - T.y, C = { ...T }, G.setAttribute("viewBox", `${T.x} ${T.y} ${T.w} ${T.h}`), G.setAttribute("width", String(T.w)), G.setAttribute("height", String(T.h)), G.setAttribute("role", "img"), G.setAttribute("aria-label", f.title || "SPICE schematic"), G.setAttribute("style", "background:white");
      for (const k of f.components) {
        const R = H.getElementById("cell_" + k.name);
        if (!R) throw Error("Renderer omitted component " + k.name);
        R.setAttribute("data-component", k.name), k.kind === "X" && (R.setAttribute("data-instance", k.instanceId), R.setAttribute("role", "button"), R.setAttribute("tabindex", "0"), R.setAttribute("aria-label", "Open " + k.name));
        const q = H.createElementNS(G.namespaceURI, "title");
        q.textContent = k.raw + `
Resolved: ` + k.value + `
` + Object.entries(k.terminals).map(([j, Q]) => j + ": " + Q).join(", "), R.prepend(q);
      }
      for (const k of Object.values(f.nodes))
        for (const R of G.querySelectorAll(".net_" + k.bit)) {
          R.setAttribute("data-net", k.name);
          const q = H.createElementNS(G.namespaceURI, "title");
          q.textContent = "Node " + k.displayName, R.append(q);
        }
      const v = f.components.filter((k) => k.kind === "K").map((k) => ({ name: k.name, inductors: k.coupledInductors, value: k.value }));
      if (v.length) {
        const k = H.createElementNS(G.namespaceURI, "metadata");
        k.setAttribute("id", "spice-magnetic-couplings"), k.textContent = JSON.stringify(v), G.append(k);
        for (const R of v) for (const q of R.inductors) {
          const j = H.getElementById("cell_" + q);
          if (!j) continue;
          const Q = H.createElementNS(G.namespaceURI, "circle"), J = [...j.children].find((me) => me.getAttribute("s:pid") === "A"), ie = J?.getAttribute("s:position"), K = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[ie] || [0, 0];
          for (const [me, Me] of Object.entries({ cx: Number(J?.getAttribute("s:x")) + K[0], cy: Number(J?.getAttribute("s:y")) + K[1], r: 3, fill: W().color, stroke: "none", "data-coupling": R.name })) Q.setAttribute(me, String(Me));
          const ce = H.createElementNS(G.namespaceURI, "title");
          ce.textContent = R.name + " · dotted terminal: " + R.inductors.join(", "), Q.append(ce), j.append(Q);
        }
      }
      p = S.drawing, g = new XMLSerializer().serializeToString(G), V("source").value = g, e.replaceChildren(document.importNode(G, !0)), ne();
      const O = i.filter((k) => k.severity === "warning").length;
      n.textContent = `${f.components.filter((k) => !k.synthetic).length} components · ${Object.keys(f.nodes).length} nodes · ${f.topology.leafCount} primitive devices verified${f.interfaceAliases.length ? " · Parent-connected ports: " + f.interfaceAliases.map((k) => k.ports.join(" = ")).join("; ") + "." : ""}${O ? " · Review " + O + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Ke}.`, f.layout.report?.gridVerified && (n.textContent += ` Grid ${f.layout.report.gridSize}.`), f.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${f.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), f.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), s.append({ message: n.textContent, category: "Rendering", severity: O ? "warning" : "info" }), V("json").value = JSON.stringify({ circuit: f, netlist: A, hierarchy: h }, null, 2), ee.setCircuit(f, t.value), c.mount(e.querySelector("svg"), p, f, A, W(), { reset: a, scope: b }), $(), !a && E.has(b) ? C = { ...E.get(b) } : E.set(b, { ...C }), ne(), V("selection").textContent = "Click a component to inspect its original statement and pin connections.", Ce();
    } catch (A) {
      if (e.replaceChildren(), g = "", V("source").value = "", V("json").value = "", V("nets").replaceChildren(), V("selection").textContent = "", l(A.message, { severity: "error" }), !m)
        V("hierarchy-panel").hidden = !0, V("selection-actions").hidden = !0, V("breadcrumbs").replaceChildren();
      else if (!m.contexts[b]) {
        const S = document.createElement("button");
        S.type = "button", S.textContent = "Return to Top", S.onclick = () => Ee(""), V("breadcrumbs").replaceChildren(S);
      }
      ee.setCircuit(null, t.value), A.diagnostics && (i = A.diagnostics), i.some((S) => S.severity === "error") || i.push({ severity: "error", line: 0, message: A.message }), te(i);
    } finally {
      I = !1, V("generate").disabled = !1, t.readOnly = !1, V("file").disabled = !1, V("libraries").disabled = !1;
      for (const A of we.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) A.disabled = !1;
      m && m.contexts[b] && Ce(), ee.setEnabled(!!g), c.refreshControls(), e.setAttribute("aria-busy", "false"), B(), M && (M = !1, be(), queueMicrotask(ge));
    }
  }
  V("generate").onclick = () => ge({ resetEditor: !0 });
  for (const a of we.querySelectorAll("[data-example]")) a.onclick = () => {
    const i = ze[a.dataset.example];
    t.value = i.source, F(), X(i), ge();
  };
  V("file").onchange = async (a) => {
    const i = a.target.files[0];
    if (i) {
      if (I || w) {
        a.target.value = "";
        return;
      }
      try {
        const A = /\.(spiceproj|json)$/i.test(i.name);
        if (i.size > (A ? on : 2e6)) throw Error(A ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        A ? await Oe(await i.text()) : (t.value = await Pt(i), F(), await ge());
      } catch (A) {
        l("File could not be opened: " + A.message, { severity: "error", category: "Files" });
      } finally {
        a.target.value = "", B();
      }
    }
  };
  async function Oe(a) {
    w = !0, B();
    const i = we.inert;
    we.inert = !0;
    try {
      const A = rn(a), S = Tt(A.source, { files: A.libraries });
      if (S.diagnostics.some((G) => G.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const H = it(S);
      if (!H.contexts[A.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const G of A.sheets) {
        if (!H.contexts[G.scope]) throw Error("Unknown saved sheet: " + G.scope);
        if (G.templateSource && !H.contexts[G.templateSource]) throw Error("Unknown layout template source: " + G.templateSource);
        const Y = He(H, { focus: G.scope });
        if (Y.topology.signature !== G.topology) throw Error("Saved topology differs from the netlist: " + (G.scope || "Top"));
        const oe = new Map(Y.components.filter((O) => O.kind !== "K").map((O) => [O.name, O]));
        for (const O of G.snapshot.components) {
          if (O.decoration) continue;
          const k = oe.get(O.id);
          if (!k || O.ports.length !== Object.keys(k.terminals).length || O.ports.some((R) => Y.nodes[k.terminals[R.pin]]?.bit !== R.bit)) throw Error("Saved pin connectivity differs from the netlist: " + O.id);
          oe.delete(O.id);
        }
        if (oe.size) throw Error("Saved sheet omits components.");
        l("Checking saved sheet " + (G.scope || "Top") + "…", { category: "Files" });
        const se = Fe(Y), le = await Ze(se, G.settings), v = new DOMParser().parseFromString(le.svg, "image/svg+xml").documentElement;
        for (const O of Object.values(Y.nodes)) for (const k of v.querySelectorAll(".net_" + O.bit)) k.setAttribute("data-net", O.name);
        vt(v, G.snapshot.labelOverrides), at(Et(v, le.drawing, Y, se), G.snapshot, G.settings.gridSize);
      }
      A.sheets.some((G) => G.scope === A.focus && JSON.stringify(G.settings) === JSON.stringify(A.settings)) || (l("Checking current sheet…", { category: "Files" }), await Ze(Fe(He(H, { focus: A.focus })), A.settings)), c.invalidate(), c.restoreSheets(A.sheets), E = new Map(A.sheets.filter((G) => G.view).map((G) => [G.scope, G.view])), E.set(A.focus, A.view), t.value = A.source, D = A.libraries, m = H, h = S, N = A.source, b = A.focus, y = "";
      for (const G of ["font", "size"]) V(G).value = G === "font" ? A.settings.font : A.settings.fontSize;
      for (const [G, Y] of Object.entries({ detailed: A.settings.detailed, conventional: A.settings.conventional, grid: !!A.settings.gridSize, "show-grid": A.showGrid, interactive: A.interactive, flywire: A.flywire })) V(G).checked = Y;
      V("grid-size").value = A.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (b ? "#" + new URLSearchParams({ instance: b }) : "")), ee.restore(A.colors), X(Object.values(ze).find((G) => G.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(D)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      V("library-status").textContent = Object.keys(D).length + " project library file(s) loaded", await ge(), g && (c.setLabelEditing(A.labelEditing === !0), n.textContent += " Project restored.", s.append({ message: "Project restored.", category: "Files" }));
    } finally {
      we.inert = i, w = !1, B();
    }
  }
  V("libraries").onchange = async (a) => {
    try {
      for (const i of a.target.files) {
        if (i.size > 16e6) throw Error("Library exceeds 16 MB: " + i.name);
        D[i.webkitRelativePath || i.name] = await Pt(i);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(D));
      } catch {
      }
      c.invalidate(), c.clearSheets(), E.clear(), m = null, N = "", V("library-status").textContent = Object.keys(D).length + " library file(s) loaded", ge();
    } catch (i) {
      l(i.message, { severity: "error", category: "Files" });
    } finally {
      a.target.value = "";
    }
  }, V("library-status").textContent = Object.keys(D).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const ue = V("download-dialog");
  we.addEventListener("spice:workspacechange", () => {
    ue.open && ue.close();
  }), V("open-download").onclick = () => {
    B(), ue.showModal();
  }, V("close-download").onclick = () => ue.close(), ue.addEventListener("click", (a) => {
    if (a.target !== ue) return;
    const i = ue.getBoundingClientRect();
    (a.clientX < i.left || a.clientX > i.right || a.clientY < i.top || a.clientY > i.bottom) && ue.close();
  }), document.addEventListener("keydown", (a) => {
    ue.open && !(a.altKey && a.key === "Escape") && (a.stopImmediatePropagation(), a.key === "Escape" && (a.preventDefault(), ue.close()));
  }, { capture: !0 }), V("upload").onclick = () => V("file").click(), V("download-project").onclick = () => {
    try {
      const a = c.snapshotSheets().filter((H) => m?.contexts[H.scope] && He(m, { focus: H.scope }).topology.signature === H.topology).map((H) => ({ ...H, ...E.has(H.scope) ? { view: E.get(H.scope) } : {} })), i = yo({ source: t.value, libraries: D, settings: W(), displayGridStep: Number(V("grid-size").value), showGrid: V("show-grid").checked, interactive: V("interactive").checked, flywire: V("flywire").checked, labelEditing: c.labelEditing(), focus: b, view: { ...C }, colors: ee.snapshot(), sheets: a });
      ue.close();
      const A = URL.createObjectURL(new Blob([i], { type: "application/json;charset=utf-8" })), S = document.createElement("a");
      S.href = A, S.download = "spice-schematic.spiceproj", S.click(), setTimeout(() => URL.revokeObjectURL(A), 1e3), l("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (a) {
      l("Project save failed: " + a.message, { severity: "error", category: "Files" });
    }
  }, V("download").onclick = () => {
    ue.close();
    const a = URL.createObjectURL(new Blob([g], { type: "image/svg+xml;charset=utf-8" })), i = document.createElement("a");
    i.href = a, i.download = "spice-schematic.svg", i.click(), setTimeout(() => URL.revokeObjectURL(a), 1e3), l("SVG downloaded.", { category: "Export" });
  };
  async function Ae(a) {
    const i = p;
    if (!(!i || I || d)) {
      d = !0, B(), l("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: A } = await import("./asc-export-BvAH_xkj.js");
        if (p !== i) throw Error("Schematic changed. Generate again before exporting ASC.");
        r ||= A({ tree: m, circuit: f, drawing: i, source: t.value, libraries: D });
        const S = a ? r.zip : r.ascBytes, H = URL.createObjectURL(new Blob([S], { type: a ? "application/zip" : "application/octet-stream" })), G = document.createElement("a");
        G.href = H, G.download = a ? "spice-schematic-asc.zip" : "spice-schematic.asc", G.click(), setTimeout(() => URL.revokeObjectURL(H), 1e3), n.textContent = "ASC connections verified · " + r.manifest.audit.symbols + " symbols. " + (a ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), r.manifest.warnings.length && (n.textContent += " " + r.manifest.warnings.join(" ")), s.append({ message: n.textContent, category: "Export", severity: r.manifest.warnings.length ? "warning" : "info" });
      } catch (A) {
        l("ASC export failed: " + A.message, { severity: "error", category: "Export" });
      } finally {
        d = !1, B();
      }
    }
  }
  V("download-asc").onclick = () => {
    ue.close(), Ae(!1);
  }, V("download-asc-bundle").onclick = () => {
    ue.close(), Ae(!0);
  }, V("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(g), l("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      V("source-details").open = !0, V("source").focus(), V("source").select(), l("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, ge();
}
export {
  yt as b,
  it as e,
  Ve as l,
  ot as n,
  Rn as p
};
