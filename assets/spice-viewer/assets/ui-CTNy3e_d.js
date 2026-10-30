const ct = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, lt = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, dt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, ut = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, ft = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, pt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ht = { 1: "a", 2: "b", 7: "Q", 8: "com" }, mt = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, gt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, bt = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, yt = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, wt = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Et = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, xt = {
  AND: ct,
  BUF: lt,
  COUNTER: dt,
  DFLOP: ut,
  SCHMITT: ft,
  OR: pt,
  PHASEDET: ht,
  SRFLOP: mt,
  XOR: gt,
  MODULATOR: bt,
  OTA: yt,
  SAMPLEHOLD: wt,
  VARISTOR: Et
}, vt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", pe = (t) => t.toLowerCase(), He = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), _t = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Nt(t, e) {
  const r = (N) => e[pe(N || "")] || Object.entries(e).find(([y]) => y.startsWith(pe(N || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let n = [], i = [], l = "", s = "", d = [], f = [], a = 0, h = "", c = "", g = "", b = !0;
  if ("RLC".includes(o))
    n = ["A", "B"], s = pe(o) + "_v";
  else if ("DVIB".includes(o))
    n = ["+", "-"], s = o === "D" ? "d_v" : o === "B" ? "spice_b" : pe(o);
  else if (o === "Q") {
    n = ["C", "B", "E"], !r(t[4]) && (r(t[5]) || !He(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && n.push("S"), l = t[n.length + 1] || "";
    const N = r(l)?.type;
    b = ["NPN", "PNP"].includes(N), s = b ? (n.length === 3 ? "q_" : "spice_q4_") + pe(N) : "spice_q" + n.length;
  } else if (o === "M") {
    const N = r(t[4]), y = r(t[5]), m = N?.type === "VDMOS" || !y && (!t[5] || He(t[5]));
    n = m ? ["D", "G", "S"] : ["D", "G", "S", "B"], l = t[n.length + 1] || "";
    const E = r(l), v = E?.type;
    if (m && E && v !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!m && v === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    b = ["NMOS", "PMOS", "VDMOS"].includes(v);
    let A = null, x = E;
    const I = /* @__PURE__ */ new Set();
    for (; x && !I.has(x.name) && (I.add(x.name), A = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !A); )
      x = r(x.baseModel);
    const L = v === "PMOS" || v === "VDMOS" && A && (A[1] === void 0 || Number(A[1]) >= 0.5);
    s = b ? "spice_" + (L ? "pmos" : "nmos") + (m ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    l = t[4] || "";
    const N = r(l)?.type, y = o === "Z" && ["NIGBT", "PIGBT"].includes(N);
    n = y ? ["C", "G", "E"] : ["D", "G", "S"], b = o === "J" ? ["NJF", "PJF"].includes(N) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(N), s = "spice_" + (y ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(N || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    n = ["+", "-"], s = "spice_" + pe(o);
    let N = 3, y = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[N] || "");
    if (/^poly$/i.test(t[N] || "") && (y = /^\(\s*(\d+)\s*\)$/.exec(t[++N] || ""), !y))
      throw Error("POLY requires a dimension.");
    if (y) {
      const m = Number(y[1]);
      if (m > 128) throw Error("POLY supports at most 128 controlling variables.");
      let E = N + 1, v = [];
      const A = "EG".includes(o), x = m * (A ? 2 : 1);
      for (; v.length < x && E < t.length; ) v.push(..._t(t[E++]));
      if (v.length !== x || E >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (A) {
        for (let I = 0; I < m; I++) n.push("C" + (I + 1) + "+", "C" + (I + 1) + "-");
        i = [t[1], t[2], ...v];
      } else d = v;
      a = E, h = "POLY(" + m + ") " + (A ? "" : v.join(" ") + " "), c = "POLY", A && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? c = "BEHAVIORAL" : "EG".includes(o) ? (n.push("C+", "C-"), c = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (d = [t[3]], a = 4, h = t[3] + " ");
    g = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (c ? " · " + c : "");
  } else if (o === "S")
    n = ["A", "B", "C+", "C-"], l = t[5] || "", s = "spice_device", g = "Voltage switch";
  else if (o === "W")
    n = ["A", "B"], d = [t[3]], l = t[4] || "", a = 3, s = "spice_device", g = "Current switch";
  else if ("TO".includes(o))
    n = ["L+", "L-", "R+", "R-"], o === "O" && (l = t[5] || ""), s = "spice_device", g = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    n = ["N1", "N2", "COM"], l = t[4] || "", s = "spice_device", g = "Distributed RC";
  else if (o === "A")
    n = Array.from({ length: 8 }, (N, y) => "P" + (y + 1)), s = "spice_device", g = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (f = t.slice(1, -1), f.some((N) => !/^L/i.test(N.split(":").at(-1)))) throw Error("K references must name inductors.");
    a = t.length - 1, s = "spice_coupling", g = "Magnetic coupling", h = f.join(" ") + " · k=";
  } else if (o === "@")
    n = ["IN", "OUT"], s = "spice_device", g = "FRA";
  else if (o === "&")
    n = ["O+", "O-", "I+", "I-"], s = "spice_device", g = "FRA probe";
  else if (o === "Ö")
    n = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", g = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (a || (a = n.length + 1), i.length || (i = t.slice(1, n.length + 1)), i.length !== n.length) throw Error("Incomplete terminal list: expected " + n.length + " nodes.");
  if (t.length <= a && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + n.length + " terminals.");
  if (i.some((N) => /[=()]/.test(N) && !/^\{[\s\S]*\}$/.test(N))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(a).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(a).join(" ")) && (s = "spice_br"), o === "D" && (l = t[3] || ""), o === "@") {
    const N = t.slice(a).join(" ");
    for (const y of N.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      n.push(y[1].toUpperCase()), i.push(y[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (d.some((N) => !N)) throw Error("Missing controlling voltage source.");
  const w = n.map((N, y) => o === "A" && xt[(t[9] || "").toUpperCase()]?.[String(y + 1)] || N);
  return { kind: o, pins: n, nodeTokens: i, pinLabels: w, model: l, type: s, controlSource: d[0] || "", controlSources: d, coupledInductors: f, value: h + t.slice(a).join(" "), sourceMode: c, symbol: g, polarityKnown: b };
}
const Ct = vt, St = new Set(Ct.split(" ")), Re = () => /* @__PURE__ */ Object.create(null), re = (t) => t.toLowerCase();
function Ce(t) {
  const e = [], r = [];
  let o = "", n = 0, i = "";
  for (let l = 0; l < t.length; l++) {
    const s = t[l];
    if (i) {
      o += s, s === i && t[l - 1] !== "\\" && (i = "");
      continue;
    }
    if (s === '"' || s === "'") {
      i = s, o += s;
      continue;
    }
    if (!n && (s === ";" || s === "$" && (!l || /\s/.test(t[l - 1])))) break;
    if ("({".includes(s) && (r.push(s), n++), ")}".includes(s) && (n--, r.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !n ? (o && e.push(o), o = "") : o += s;
  }
  if (n || i) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function kt(t, e = {}) {
  const r = [], o = [], n = [], i = Object.assign(Re(), e.models), l = Re(), s = (y, m, E) => r.push({ severity: y, line: m, message: E });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const d = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, m) => {
    const E = y.trim();
    !E || E.startsWith("*") || (E.startsWith("+") ? d.length ? d.at(-1).text += " " + E.slice(1).trim() : s("error", m + 1, "Continuation has no preceding statement.") : d.push({ line: m + 1, text: E }));
  });
  for (const y of d) {
    try {
      y.tokens = Ce(y.text);
    } catch (E) {
      s("error", y.line, E.message), y.tokens = [];
    }
    const m = y.tokens;
    if (/^\.model$/i.test(m[0] || ""))
      if (m.length < 3) s("error", y.line, ".model requires a name and device type.");
      else {
        const E = /^ako:(.+)$/i.exec(m[2]), v = E && m[3] && !m[3].startsWith("(") ? m[3].split("(")[0].toUpperCase() : "";
        i[re(m[1])] = { name: m[1], type: E ? v : m[2].split("(")[0].toUpperCase(), baseModel: E?.[1] || "", raw: y.text };
      }
  }
  const f = /* @__PURE__ */ new Set();
  function a(y) {
    const m = i[re(y)];
    if (!m) return "";
    if (m.type) return m.type;
    if (f.has(re(y))) throw Error("Circular AKO model inheritance: " + y);
    return f.add(re(y)), m.type = a(m.baseModel), f.delete(re(y)), m.type;
  }
  for (const y of Object.values(i)) if (y.baseModel && !y.type)
    try {
      a(y.name);
    } catch (m) {
      s("error", 0, m.message);
    }
  let h = "", c = 0, g = !1, b = !1;
  const w = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: y, text: m, tokens: E } of d) {
    if (!E.length) continue;
    const v = re(E[0]);
    if (b) {
      s("warning", y, "Statement after .end is not rendered: " + m);
      continue;
    }
    if (v === ".control") {
      g = !0, s("warning", y, ".control script retained but not executed or rendered.");
      continue;
    }
    if (v === ".endc") {
      g = !1;
      continue;
    }
    if (g) continue;
    if (v === ".subckt") {
      c++, s("error", y, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (v === ".ends") {
      c ? c-- : s("error", y, "Unmatched .ends.");
      continue;
    }
    if (c) continue;
    if (v === ".end") {
      b = !0;
      continue;
    }
    if (v.startsWith(".")) {
      o.push({ line: y, text: m }), v === ".title" ? h = E.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(v) ? s("error", y, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(v) ? s("error", y, "Topology-changing directive is unsupported: " + m) : N.has(v) || s("warning", y, "Directive retained but not resolved: " + m);
      continue;
    }
    const A = E[0][0].toUpperCase();
    if (!St.has(A)) {
      y === 1 && !/\d/.test(E[0]) && E.length > 1 && A !== "X" ? (h = m, s("warning", y, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", y, `Unsupported ${A} device was not rendered: ${m}`);
      continue;
    }
    const x = A === "M" || A === "Q" ? 5 : 4;
    if (y === 1 && !/\d/.test(E[0]) && (E.length < x || A === "T" && !/\b(?:zo|z0)\s*=/i.test(m))) {
      h = m, s("info", y, "SPICE title: " + m);
      continue;
    }
    try {
      if (w.has(v)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const I = Nt(E, i), { pins: L, nodeTokens: u, ..._ } = I;
      I.polarityKnown || s("warning", y, `${E[0]}: model polarity unknown; explicit ${L.join("/")} terminals retained.`);
      const R = Re();
      L.forEach((j, B) => {
        const W = re(u[B]);
        l[W] || (l[W] = { name: W, displayName: E[B + 1], bit: Object.keys(l).length + 2, terminals: [] }), l[W].terminals.push({ component: E[0], pin: j }), R[j] = W;
      }), n.push({ ..._, name: E[0], terminals: R, line: y, raw: m }), w.add(v);
    } catch (I) {
      s("error", y, `${E[0]}: ${I.message} Statement: ${m}`);
    }
  }
  c && s("error", 0, "Unclosed .subckt definition."), g && s("error", 0, "Unclosed .control block."), n.length || s("error", 0, "No supported components to render."), n.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const y of n) {
    for (const m of y.controlSources || []) !m.includes(":") && !n.some((E) => re(E.name) === re(m) && E.kind === "V") && s("error", y.line, `${y.name}: controlling voltage source ${m} was not found.`);
    for (const m of y.coupledInductors || []) !m.includes(":") && !n.some((E) => re(E.name) === re(m) && E.kind === "L") && s("error", y.line, `${y.name}: coupled inductor ${m} was not found.`);
    (y.kind === "B" || y.type === "spice_b") && s("info", y.line, `${y.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: h, components: n, nodes: l, models: i, directives: o, diagnostics: r };
}
const de = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), $e = (t) => de(t).split("/").at(-1);
function It(t, { files: e = {}, filename: r = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), n = [], i = [], l = [];
  let s = 0;
  const d = (a, h) => {
    const c = de(h).split("/").slice(0, -1).concat(de(a)).join("/"), g = [...o].filter(([w]) => de(w) === de(a) || de(w) === c);
    if (g.length === 1) return g[0];
    const b = [...o].filter(([w]) => $e(w) === $e(a));
    if (b.length !== 1) throw Error(b.length ? "Ambiguous library filename: " + a : "Missing library " + a + ". Add this file using Library files.");
    return b[0];
  };
  function f(a, h, c = "", g = []) {
    const b = de(h) + ":" + c.toLowerCase();
    if (g.includes(b)) throw Error("Circular library include: " + [...g, b].join(" → "));
    if (g.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const w = [], N = /^\s*\.endl\b/im.test(a);
    let y = !c;
    const m = (v, A) => {
      if (s += v.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      l.push(v), i.push({ file: h, line: A + 1 });
    };
    if (a.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((v, A) => {
      const x = v.trim();
      if (/^\.lib\b/i.test(x) && N) {
        const I = Ce(x);
        if (I.length === 2 && !/[.\\/]/.test(I[1])) {
          w.push(I[1].toLowerCase()), I[1].toLowerCase() === c.toLowerCase() && (y = !0), m("* Library section " + I[1], A);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        w.pop(), m("* End library section", A);
        return;
      }
      if (c && w.length && !w.includes(c.toLowerCase())) {
        m("* Unselected library section", A);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const I = Ce(x);
          if (!I[1]) throw Error("Include requires a filename.");
          const [L, u] = d(I[1], h);
          m("* Included " + L, A), f(u, L, I[2] || "", [...g, b]);
        } catch (I) {
          n.push({ severity: "error", line: A + 1, source: h, message: I.message }), m("* Unresolved include", A);
        }
      else m(v, A);
    }), !y) throw Error("Library section " + c + " not found in " + h);
  }
  try {
    f(t, r);
  } catch (a) {
    n.push({ severity: "error", line: 0, source: r, message: a.message });
  }
  return { source: l.join(`
`), origins: i, diagnostics: n };
}
function Ot(t) {
  const e = [], r = /* @__PURE__ */ new Map(), o = [0], n = [];
  t.split(/\r?\n/).forEach((s, d) => {
    const f = s.trim();
    /^\.subckt\b/i.test(f) && (o.push(d + 1), r.set(d + 1, [])), o.at(-1) ? r.get(o.at(-1)).push({ raw: s, line: d + 1 }) : e[d] = s, /^\.ends\b/i.test(f) && o.length > 1 && o.pop();
  });
  const i = We(Array.from({ length: t.split(/\r?\n/).length }, (s, d) => e[d] || "").join(`
`));
  n.push(...i.diagnostics);
  const l = /* @__PURE__ */ new Map();
  for (const [s, d] of r) {
    const f = We(d.map((a) => a.raw).join(`
`));
    l.set(s, f.layout), n.push(...f.diagnostics.map((a) => ({ ...a, line: d[a.line - 1]?.line || s })));
  }
  return { layout: i.layout, scopes: l, diagnostics: n };
}
function We(t) {
  const e = [], r = [];
  let o = !1, n = !1, i = 0;
  if (t.split(/\r?\n/).forEach((m, E) => {
    const v = m.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(v)) {
      (n || o) && e.push({ severity: "error", line: E + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(v) || e.push({ severity: "error", line: E + 1, message: "Expected @layout begin v1." }), n = !0, o = !0, i = E + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(v)) {
      o || e.push({ severity: "error", line: E + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (v.startsWith("*") ? r.push(v.slice(1).trim()) : e.push({ severity: "error", line: E + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: i, message: "Unclosed @layout block." }), !n) return { layout: null, diagnostics: e };
  const l = r.join(" "), s = l.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], d = [], f = [], a = [], h = [];
  let c = 0, g = 0, b = 10;
  const w = () => s[c++], N = () => {
    const m = w();
    if (!m || !/^[A-Za-z_@][\w./%:@-]*$/.test(m)) throw Error("Expected layout identifier, got " + m);
    return m;
  };
  function y(m) {
    if (d.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const E = m ? N() : "@row" + g++, v = w();
    if (!["row", "column", "classic"].includes(v)) throw Error("Expected row, column or classic.");
    if (w() !== "{") throw Error("Expected { after " + v);
    const A = { id: E, direction: v, members: [] };
    for (d.push(A); c < s.length && s[c] !== "}"; )
      s[c] === "group" ? (w(), A.members.push(y(!0))) : ["row", "column"].includes(s[c]) ? A.members.push(y(!1)) : A.members.push(N());
    if (w() !== "}") throw Error("Unclosed group " + E);
    if (!A.members.length) throw Error("Empty layout group " + E);
    return E;
  }
  try {
    for (; c < s.length; )
      if (s[c] === "group")
        w(), y(!0);
      else if (["row", "column"].includes(s[c])) y(!1);
      else if (s[c] === "face") {
        w();
        const u = N(), _ = w();
        if (!["left", "right"].includes(_)) throw Error("Expected face left or right.");
        if (h.some((R) => R.device.toLowerCase() === u.toLowerCase())) throw Error("Duplicate face device.");
        h.push({ device: u, side: _ });
      } else if (s[c] === "pair") {
        w();
        const u = w();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(u)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (w() !== "{") throw Error("Expected { after pair kind.");
        const _ = [];
        for (; c < s.length && s[c] !== "}"; ) _.push(N());
        if (w() !== "}" || !_.length) throw Error("Empty or unclosed pair.");
        if (a.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        a.push({ kind: u, members: _ });
      } else if (s[c] === "priority-cap") {
        if (w(), b = Number(w()), !Number.isInteger(b) || b < 3 || b > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (w() === "place") {
        const u = N(), _ = w(), R = N();
        if (!["left-of", "above"].includes(_)) throw Error("Expected left-of or above.");
        f.push({ a: u, relation: _, b: R });
      } else throw Error("Unknown layout instruction near " + s[c - 1]);
    const m = /* @__PURE__ */ new Set();
    for (const u of d) {
      const _ = u.id.toLowerCase();
      if (m.has(_)) throw Error("Duplicate layout group " + u.id);
      m.add(_);
    }
    const E = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set(), A = new Map(d.map((u) => [u.id.toLowerCase(), u])), x = (u) => {
      if (E.has(u)) throw Error("Circular layout group " + u);
      if (!v.has(u)) {
        E.add(u);
        for (const _ of A.get(u).members) A.has(_.toLowerCase()) && x(_.toLowerCase());
        E.delete(u), v.add(u);
      }
    };
    for (const u of A.keys()) x(u);
    const I = /* @__PURE__ */ new Map();
    for (const u of f) {
      if (u.a.toLowerCase() === u.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      I.has(u.a.toLowerCase()) || I.set(u.a.toLowerCase(), []), I.get(u.a.toLowerCase()).push(u.b.toLowerCase());
    }
    E.clear(), v.clear();
    const L = (u) => {
      if (E.has(u)) throw Error("Circular place constraints.");
      if (!v.has(u)) {
        E.add(u);
        for (const _ of I.get(u) || []) L(_);
        E.delete(u), v.add(u);
      }
    };
    for (const u of I.keys()) L(u);
  } catch (m) {
    e.push({ severity: "error", line: i, message: "Layout description: " + m.message });
  }
  return { layout: { version: 1, priorityCap: b, groups: d, relations: f, pairs: a, faces: h }, diagnostics: e };
}
function Rt(t, e) {
  const r = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? r : t.ir.layoutDescription;
  if (!o) return null;
  if (r) {
    const g = new Set(r.groups.map((w) => w.id.toLowerCase())), b = (w) => g.has(w.toLowerCase()) ? w : e.components.find((y) => y.synthetic && y.value.toLowerCase() === w.toLowerCase())?.name || e.focus + "/" + w;
    o = { ...r, groups: r.groups.map((w) => ({ ...w, members: w.members.map(b) })), relations: r.relations.map((w) => ({ ...w, a: b(w.a), b: b(w.b) })), faces: (r.faces || []).map((w) => ({ ...w, device: b(w.device) })), pairs: (r.pairs || []).map((w) => ({ ...w, members: w.members.map(b) })) };
  }
  const n = new Map(o.groups.map((g) => [g.id.toLowerCase(), g])), i = Object.values(t.contexts).flatMap((g) => g.devices.map((b) => b.name)), l = new Set([...Object.keys(t.contexts), ...i, ...e.components.map((g) => g.name)].map((g) => g.toLowerCase()));
  for (const g of n.values()) if (l.has((r ? e.focus + "/" + g.id : g.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + g.id);
  for (const g of n.values()) for (const b of g.members) if (!n.has(b.toLowerCase()) && !l.has(b.toLowerCase())) throw Error("Unknown @layout instance/device: " + b);
  for (const g of o.relations) for (const b of [g.a, g.b]) if (!n.has(b.toLowerCase()) && !l.has(b.toLowerCase())) throw Error("Unknown @layout place target: " + b);
  const s = (o.pairs || []).map((g) => ({ ...g, members: g.members.map((b) => {
    const w = e.components.find((N) => N.name.toLowerCase() === b.toLowerCase());
    if (!w || w.synthetic || w.block) throw Error("Unknown or non-visible @layout pair device: " + b);
    return w.name;
  }) })), d = (o.faces || []).map((g) => {
    const b = e.components.find((w) => w.name.toLowerCase() === g.device.toLowerCase());
    if (!b || !["Q", "M", "J", "Z"].includes(b.kind)) throw Error("Unknown or unsupported @layout face device: " + g.device);
    return { ...g, device: b.name };
  }), f = /* @__PURE__ */ new Map(), a = [], h = new Set(Object.keys(t.contexts).map((g) => g.toLowerCase()));
  for (const g of o.groups) {
    const b = [];
    for (const w of g.members) {
      if (n.has(w.toLowerCase())) {
        b.push({ group: w });
        continue;
      }
      for (const N of e.components) if (N.name.toLowerCase() === w.toLowerCase() || N.name.toLowerCase().startsWith(w.toLowerCase() + "/")) {
        if (f.has(N.name)) throw Error("Overlapping @layout membership: " + N.name);
        f.set(N.name, g.id), b.push({ cell: N.name, ...h.has(w.toLowerCase()) ? { instance: w } : {} });
      }
    }
    a.push({ id: g.id, direction: g.direction, members: b });
  }
  const c = /* @__PURE__ */ new Set();
  for (const g of a) for (const b of g.members) if (b.group) {
    const w = b.group.toLowerCase();
    if (c.has(w)) throw Error("Layout group has multiple parents: " + b.group);
    c.add(w);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: a, relations: o.relations, pairs: s, faces: d };
}
const me = () => /* @__PURE__ */ Object.create(null), ne = (t) => t.toLowerCase();
function nt(t) {
  const e = me();
  for (let r = 0; r < t.length; r++) {
    const o = t[r];
    if (/^params?:$/i.test(o)) continue;
    const n = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!n) throw Error("Expected named parameter assignment, got: " + o);
    const i = ne(n[1]);
    let l = n[2];
    if (l === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++r] || "");
      if (!s) throw Error("Expected = after parameter " + i);
      l = s[1];
    }
    if (l || (l = t[++r]), !l || /^params?:$/i.test(l)) throw Error("Missing value for parameter " + i);
    if (Object.hasOwn(e, i)) throw Error("Duplicate parameter: " + i);
    e[i] = l;
  }
  return e;
}
function ze(t) {
  const e = t.findIndex((r, o) => /^params?:$/i.test(r) || r.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, me()] : [t.slice(0, e), nt(t.slice(e))];
}
function At(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const r = It(t, e);
  t = r.source;
  const o = Ot(t), n = [...r.diagnostics, ...o.diagnostics], i = me(), l = /* @__PURE__ */ new Set(["0"]), s = (m, E, v) => n.push({ severity: m, line: E, message: v }), d = (m, E, v, A = [], x = me(), I = 0) => {
    const L = { id: m, name: E, parent: v, ports: A, defaults: x, parameters: me(), definitions: me(), devices: [], instances: [], directives: [], line: I, statements: [], layoutDescription: o.scopes.get(I) || null };
    return i[m] = L, L;
  }, f = d("root", "Top", null), a = [f], h = [];
  let c = !1, g = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, E) => {
    const v = m.trim();
    !v || v.startsWith("*") || (v.startsWith("+") ? h.length ? h.at(-1).text += " " + v.slice(1).trim() : s("error", E + 1, "Continuation has no preceding statement.") : h.push({ text: v, line: E + 1 }));
  });
  for (const { text: m, line: E } of h)
    try {
      const v = Ce(m);
      if (!v.length) continue;
      const A = ne(v[0]), x = a.at(-1);
      if (g) {
        s("warning", E, "Statement after .end is not rendered: " + m);
        continue;
      }
      if (A === ".control") {
        c = !0, s("warning", E, ".control script retained but not executed or rendered.");
        continue;
      }
      if (A === ".endc") {
        c = !1;
        continue;
      }
      if (c) continue;
      if (A === ".subckt") {
        if (v.length < 2) throw Error(".SUBCKT requires a name.");
        const [I, L] = ze(v.slice(2)), u = ne(v[1]);
        if (Object.hasOwn(x.definitions, u)) throw Error("Duplicate subcircuit definition: " + v[1]);
        const _ = I.map(ne);
        if (new Set(_).size !== I.length || _.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (I.some((j) => /[{}()=]/.test(j))) throw Error("Invalid formal port.");
        if (a.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const R = x.id + "/" + encodeURIComponent(u);
        x.definitions[u] = R, a.push(d(R, v[1], x.id, I, L, E));
        continue;
      }
      if (A === ".ends") {
        if (a.length === 1) throw Error("Unmatched .ENDS.");
        if (v[1] && ne(v[1]) !== ne(x.name)) throw Error(".ENDS name does not match " + x.name);
        a.pop();
        continue;
      }
      if (A === ".end") {
        if (a.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        g = !0;
        continue;
      }
      if (A === ".param") {
        const I = nt(v.slice(1));
        for (const [L, u] of Object.entries(I)) {
          if (Object.hasOwn(x.parameters, L)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + L);
          x.parameters[L] = u;
        }
      }
      if (A === ".global") {
        if (v.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const I of v.slice(1)) l.add(ne(I));
      }
      if (A.startsWith(".") && x.directives.push({ line: E, text: m }), A.startsWith("x")) {
        const [I, L] = ze(v.slice(1));
        if (!I.length) throw Error("X instance requires a subcircuit name.");
        const u = /;§pnba\s+(.+)$/i.exec(m)?.[1].split(")");
        x.instances.push({ name: v[0], nodes: I.slice(0, -1).map(ne), definitionName: I.at(-1), definitionId: null, parameters: L, line: E, raw: m, pinNames: u });
      } else x.statements.push({ line: E, text: m });
    } catch (v) {
      s("error", E, v.message + " Statement: " + m);
    }
  a.length > 1 && s("error", a.at(-1).line, "Unclosed .SUBCKT " + a.at(-1).name), c && s("error", 0, "Unclosed .control block.");
  function b(m, E) {
    for (; m; ) {
      if (Object.hasOwn(m.definitions, ne(E))) return m.definitions[ne(E)];
      m = i[m.parent];
    }
    return null;
  }
  for (const m of Object.values(i)) {
    const E = [...m.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...m.statements], v = kt(E.map((x) => x.text).join(`
`), { models: i[m.parent]?.models });
    m.devices = v.components.map((x) => ({ ...x, line: E[x.line - 1]?.line || m.line })), m.models = v.models, m === f && (f.title = v.title), n.push(...v.diagnostics.filter((x) => !x.message.includes("No supported components to render.") && !x.message.includes("300 components")).map((x) => ({ ...x, line: E[x.line - 1]?.line || m.line })));
    const A = new Set(m.devices.map((x) => ne(x.name)));
    for (const x of m.instances)
      if (A.has(ne(x.name)) && s("error", x.line, "Duplicate instance/device name: " + x.name), A.add(ne(x.name)), x.definitionId = b(m, x.definitionName), !x.definitionId && !/^\{[\s\S]*\}$/.test(x.definitionName)) s("error", x.line, "Undefined subcircuit: " + x.definitionName + " in " + x.name);
      else if (x.definitionId) {
        const I = i[x.definitionId];
        I.ports.length !== x.nodes.length && s("error", x.line, `${x.name}: ${I.name} expects ${I.ports.length} ports; got ${x.nodes.length}.`);
      }
  }
  for (const m of Object.values(i)) delete m.statements;
  const w = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function y(m, E = []) {
    if (w.has(m)) {
      s("error", i[m].line, "Circular subcircuit reference: " + [...E, i[m].name].join(" → "));
      return;
    }
    if (!N.has(m)) {
      if (w.add(m), E.length >= 64) {
        s("error", i[m].line, "Subcircuit dependency nesting exceeds 64 levels."), w.delete(m), N.add(m);
        return;
      }
      for (const v of i[m].instances) v.definitionId && y(v.definitionId, [...E, i[m].name]);
      w.delete(m), N.add(m);
    }
  }
  for (const m of Object.keys(i)) y(m);
  !f.devices.length && !f.instances.length && s("error", 0, "No supported components or instances to render.");
  for (const m of n) !m.source && m.line && r.origins[m.line - 1] && (m.source = r.origins[m.line - 1].file, m.line = r.origins[m.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: f.title || "", scopes: i, globals: [...l], diagnostics: n, layoutDescription: o.layout };
}
const J = () => /* @__PURE__ */ Object.create(null), he = (t, e) => [...t, e].map((r) => encodeURIComponent(r)).join("/"), Me = (t, e) => he(t.map((r) => r.toLowerCase()), e.toLowerCase());
function Lt(t, e = []) {
  const r = J(), o = (n) => r[n] || (r[n] = { name: n, displayName: n.split("/").map((i) => decodeURIComponent(i)).join("/"), bit: Object.keys(r).length + 2, terminals: [] });
  for (const n of t) for (const [i, l] of Object.entries(n.terminals)) o(l).terminals.push({ component: n.name, pin: i });
  for (const n of e) o(n);
  return r;
}
function Mt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Xe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Pt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Se(t, e, r = (n) => n, o = (n) => n) {
  const n = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (l) => (n.push(l), "@@" + (n.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (l, s, d) => {
    const f = d.split(",").map((h) => h.trim());
    if (f.some((h) => !h || /[\s{}+*()]/.test(h))) throw Error("Unsupported dynamic voltage/current reference: " + l);
    const a = s.toUpperCase() + "(" + f.map((h) => s.toLowerCase() === "v" ? r(h) : o(h, s)).join(",") + ")";
    return n.push(a), "@@" + (n.length - 1) + "@@";
  });
  let i = t.length;
  return t = t.replace(Pt, (l, s, d) => {
    if (d.slice(s + l.length).trimStart().startsWith("(")) return l;
    const f = e(l.toLowerCase());
    if (f === void 0) return l;
    if (i += f.length + 2, i > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + f + ")";
  }), t.replace(/@@(\d+)@@/g, (l, s) => n[Number(s)]);
}
function Tt(t, e, r, o) {
  const n = { ...e, ...r }, i = J(), l = /* @__PURE__ */ new Set(), s = J();
  for (const [f, a] of Object.entries(o)) s[f] = Se(Xe(a), (h) => t[h]);
  function d(f) {
    if (Object.hasOwn(s, f)) return s[f];
    if (Object.hasOwn(i, f)) return i[f];
    if (!Object.hasOwn(n, f)) return t[f];
    if (l.has(f)) {
      if (Object.hasOwn(t, f)) return t[f];
      throw Error("Circular parameter dependency: " + [...l, f].join(" → "));
    }
    return l.add(f), i[f] = Se(Xe(n[f]), d), l.delete(f), i[f];
  }
  for (const f of Object.keys(n)) d(f);
  return Object.assign(J(), t, i, s);
}
function Pe(t, e, r, o) {
  let n = "";
  for (let d = 0; d < t.length; ) {
    const f = t[d];
    if (f !== "{" && f !== "'") {
      n += f, d++;
      continue;
    }
    const a = d++;
    let h = 1, c = "";
    for (; d < t.length && h; d++) {
      if (f === "'") {
        t[d] === "'" && (h = 0);
        continue;
      }
      if (c) {
        t[d] === c && (c = "");
        continue;
      }
      if (t[d] === '"' || t[d] === "'") {
        c = t[d];
        continue;
      }
      t[d] === "{" && h++, t[d] === "}" && h--;
    }
    if (h) throw Error("Unclosed parameter expression.");
    n += f + Se(t.slice(a + 1, d - 1), (g) => e[g], r, o) + (f === "{" ? "}" : "'");
  }
  const i = [];
  let l = 0, s = "";
  for (let d = 0; d < n.length; d++) {
    const f = n[d];
    if (s) {
      f === s && n[d - 1] !== "\\" && (s = "");
      continue;
    }
    if (f === '"' || f === "'") {
      s = f;
      continue;
    }
    if ("({".includes(f) && l++, ")}".includes(f) && l--, !l && (d === 0 || /\s/.test(n[d - 1]))) {
      const a = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(n.slice(d));
      a && (i.push({ start: d, end: d + a[0].length, key: a[1].toLowerCase() }), d += a[0].length - 1);
    }
  }
  if (i.length) {
    let d = n.slice(0, i[0].start);
    i.forEach((f, a) => {
      const h = i[a + 1]?.start ?? n.length, c = n.slice(f.end, h);
      d += n.slice(f.start, f.end) + (c.includes("{") || ["refnode", "intnode"].includes(f.key) ? c : Se(c, (g) => e[g], r, o));
    }), n = d;
  } else Object.hasOwn(e, t.toLowerCase()) && (n = "{" + e[t.toLowerCase()] + "}");
  return n;
}
class Ut {
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
  add(e, r, o) {
    if (typeof arguments[0] != "string")
      for (let n in arguments[0])
        this.add(n, arguments[0][n], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(n) {
        this[n] = this[n] || [], r && this[n][o ? "unshift" : "push"](r);
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
  run(e, r) {
    this[e] = this[e] || [], this[e].forEach(function(o) {
      o.call(r && r.context ? r.context : r, r);
    });
  }
}
class Qt {
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
    e.forEach((r) => {
      if (typeof r != "object" || !r.name || !r.init)
        throw new Error("Invalid JSEP plugin format");
      this.registered[r.name] || (r.init(this.jsep), this.registered[r.name] = r);
    });
  }
}
class S {
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
    return "JavaScript Expression Parser (JSEP) v" + S.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return S.max_unop_len = Math.max(e.length, S.max_unop_len), S.unary_ops[e] = 1, S;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, r, o) {
    return S.max_binop_len = Math.max(e.length, S.max_binop_len), S.binary_ops[e] = r, o ? S.right_associative.add(e) : S.right_associative.delete(e), S;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return S.additional_identifier_chars.add(e), S;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, r) {
    return S.literals[e] = r, S;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete S.unary_ops[e], e.length === S.max_unop_len && (S.max_unop_len = S.getMaxKeyLen(S.unary_ops)), S;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return S.unary_ops = {}, S.max_unop_len = 0, S;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return S.additional_identifier_chars.delete(e), S;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete S.binary_ops[e], e.length === S.max_binop_len && (S.max_binop_len = S.getMaxKeyLen(S.binary_ops)), S.right_associative.delete(e), S;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return S.binary_ops = {}, S.max_binop_len = 0, S;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete S.literals[e], S;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return S.literals = {}, S;
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
    return new S(e).parse();
  }
  /**
   * Get the longest key length of any object
   * @param {object} obj
   * @returns {number}
   */
  static getMaxKeyLen(e) {
    return Math.max(0, ...Object.keys(e).map((r) => r.length));
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
    return S.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !S.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    S.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return S.isIdentifierStart(e) || S.isDecimalDigit(e);
  }
  /**
   * throw error at index of the expression
   * @param {string} message
   * @throws
   */
  throwError(e) {
    const r = new Error(e + " at character " + this.index);
    throw r.index = this.index, r.description = e, r;
  }
  /**
   * Run a given hook
   * @param {string} name
   * @param {jsep.Expression|false} [node]
   * @returns {?jsep.Expression}
   */
  runHook(e, r) {
    if (S.hooks[e]) {
      const o = { context: this, node: r };
      return S.hooks.run(e, o), o.node;
    }
    return r;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (S.hooks[e]) {
      const r = { context: this };
      return S.hooks[e].find(function(o) {
        return o.call(r.context, r), r.node;
      }), r.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === S.SPACE_CODE || e === S.TAB_CODE || e === S.LF_CODE || e === S.CR_CODE; )
      e = this.expr.charCodeAt(++this.index);
    this.runHook("gobble-spaces");
  }
  /**
   * Top-level method to parse all expressions and returns compound or single node
   * @returns {jsep.Expression}
   */
  parse() {
    this.runHook("before-all");
    const e = this.gobbleExpressions(), r = e.length === 1 ? e[0] : {
      type: S.COMPOUND,
      body: e
    };
    return this.runHook("after-all", r);
  }
  /**
   * top-level parser (but can be reused within as well)
   * @param {number} [untilICode]
   * @returns {jsep.Expression[]}
   */
  gobbleExpressions(e) {
    let r = [], o, n;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === S.SEMCOL_CODE || o === S.COMMA_CODE)
        this.index++;
      else if (n = this.gobbleExpression())
        r.push(n);
      else if (this.index < this.expr.length) {
        if (o === e)
          break;
        this.throwError('Unexpected "' + this.char + '"');
      }
    return r;
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
    let e = this.expr.substr(this.index, S.max_binop_len), r = e.length;
    for (; r > 0; ) {
      if (S.binary_ops.hasOwnProperty(e) && (!S.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !S.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
        return this.index += r, e;
      e = e.substr(0, --r);
    }
    return !1;
  }
  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   * @returns {?jsep.BinaryExpression}
   */
  gobbleBinaryExpression() {
    let e, r, o, n, i, l, s, d, f;
    if (l = this.gobbleToken(), !l || (r = this.gobbleBinaryOp(), !r))
      return l;
    for (i = { value: r, prec: S.binaryPrecedence(r), right_a: S.right_associative.has(r) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + r), n = [l, i, s]; r = this.gobbleBinaryOp(); ) {
      if (o = S.binaryPrecedence(r), o === 0) {
        this.index -= r.length;
        break;
      }
      i = { value: r, prec: o, right_a: S.right_associative.has(r) }, f = r;
      const a = (h) => i.right_a && h.right_a ? o > h.prec : o <= h.prec;
      for (; n.length > 2 && a(n[n.length - 2]); )
        s = n.pop(), r = n.pop().value, l = n.pop(), e = {
          type: S.BINARY_EXP,
          operator: r,
          left: l,
          right: s
        }, n.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + f), n.push(i, e);
    }
    for (d = n.length - 1, e = n[d]; d > 1; )
      e = {
        type: S.BINARY_EXP,
        operator: n[d - 1].value,
        left: n[d - 2],
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
    let e, r, o, n;
    if (this.gobbleSpaces(), n = this.searchHook("gobble-token"), n)
      return this.runHook("after-token", n);
    if (e = this.code, S.isDecimalDigit(e) || e === S.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === S.SQUOTE_CODE || e === S.DQUOTE_CODE)
      n = this.gobbleStringLiteral();
    else if (e === S.OBRACK_CODE)
      n = this.gobbleArray();
    else {
      for (r = this.expr.substr(this.index, S.max_unop_len), o = r.length; o > 0; ) {
        if (S.unary_ops.hasOwnProperty(r) && (!S.isIdentifierStart(this.code) || this.index + r.length < this.expr.length && !S.isIdentifierPart(this.expr.charCodeAt(this.index + r.length)))) {
          this.index += o;
          const i = this.gobbleToken();
          return i || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: S.UNARY_EXP,
            operator: r,
            argument: i,
            prefix: !0
          });
        }
        r = r.substr(0, --o);
      }
      S.isIdentifierStart(e) ? (n = this.gobbleIdentifier(), S.literals.hasOwnProperty(n.name) ? n = {
        type: S.LITERAL,
        value: S.literals[n.name],
        raw: n.name
      } : n.name === S.this_str && (n = { type: S.THIS_EXP })) : e === S.OPAREN_CODE && (n = this.gobbleGroup());
    }
    return n ? (n = this.gobbleTokenProperty(n), this.runHook("after-token", n)) : this.runHook("after-token", !1);
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
    let r = this.code;
    for (; r === S.PERIOD_CODE || r === S.OBRACK_CODE || r === S.OPAREN_CODE || r === S.QUMARK_CODE; ) {
      let o;
      if (r === S.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== S.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), r = this.code;
      }
      this.index++, r === S.OBRACK_CODE ? (e = {
        type: S.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), r = this.code, r !== S.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : r === S.OPAREN_CODE ? e = {
        type: S.CALL_EXP,
        arguments: this.gobbleArguments(S.CPAREN_CODE),
        callee: e
      } : (r === S.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: S.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), o && (e.optional = !0), this.gobbleSpaces(), r = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", r, o;
    for (; S.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === S.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); S.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (r = this.char, r === "e" || r === "E") {
      for (e += this.expr.charAt(this.index++), r = this.char, (r === "+" || r === "-") && (e += this.expr.charAt(this.index++)); S.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      S.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, S.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === S.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === S.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: S.LITERAL,
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
    const r = this.index, o = this.expr.charAt(this.index++);
    let n = !1;
    for (; this.index < this.expr.length; ) {
      let i = this.expr.charAt(this.index++);
      if (i === o) {
        n = !0;
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
    return n || this.throwError('Unclosed quote after "' + e + '"'), {
      type: S.LITERAL,
      value: e,
      raw: this.expr.substring(r, this.index)
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
    let e = this.code, r = this.index;
    for (S.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, S.isIdentifierPart(e)); )
      this.index++;
    return {
      type: S.IDENTIFIER,
      name: this.expr.slice(r, this.index)
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
    const r = [];
    let o = !1, n = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let i = this.code;
      if (i === e) {
        o = !0, this.index++, e === S.CPAREN_CODE && n && n >= r.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (i === S.COMMA_CODE) {
        if (this.index++, n++, n !== r.length) {
          if (e === S.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === S.CBRACK_CODE)
            for (let l = r.length; l < n; l++)
              r.push(null);
        }
      } else if (r.length !== n && n !== 0)
        this.throwError("Expected comma");
      else {
        const l = this.gobbleExpression();
        (!l || l.type === S.COMPOUND) && this.throwError("Expected comma"), r.push(l);
      }
    }
    return o || this.throwError("Expected " + String.fromCharCode(e)), r;
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
    let e = this.gobbleExpressions(S.CPAREN_CODE);
    if (this.code === S.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: S.SEQUENCE_EXP,
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
      type: S.ARRAY_EXP,
      elements: this.gobbleArguments(S.CBRACK_CODE)
    };
  }
}
const Dt = new Ut();
Object.assign(S, {
  hooks: Dt,
  plugins: new Qt(S),
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
S.max_unop_len = S.getMaxKeyLen(S.unary_ops);
S.max_binop_len = S.getMaxKeyLen(S.binary_ops);
const be = (t) => new S(t).parse(), jt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(S).filter((t) => !jt.includes(t) && be[t] === void 0).forEach((t) => {
  be[t] = S[t];
});
be.Jsep = S;
const Vt = "ConditionalExpression";
var Bt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(r) {
      if (r.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = r.node, n = this.gobbleExpression();
        if (n || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), r.node = {
            type: Vt,
            test: o,
            consequent: n,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let l = o;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            r.node.test = l.right, l.right = r.node, r.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
be.plugins.register(Bt);
const Gt = "ConditionalExpression";
var Ft = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(r) {
      if (r.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = r.node, n = this.gobbleExpression();
        if (n || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), r.node = {
            type: Gt,
            test: o,
            consequent: n,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let l = o;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            r.node.test = l.right, l.right = r.node, r.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
be.plugins.register(Ft);
const Ht = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, qe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, r) => Math.min(Math.max(t, e), r) }, te = (t) => Number(t) > 0.5;
function xe(t, e = {}) {
  const r = /* @__PURE__ */ new Set();
  let o = 0;
  function n(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (d) => {
      if (d[0] === '"' || d[0] === "'") return d;
      const [, f, a, h] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(d), c = a.toLowerCase(), g = c.startsWith("meg") ? 1e6 : c.startsWith("mil") ? 254e-7 : Ht[c[0]] || 1;
      return "(" + (h ? +(f + (f.includes(".") ? "" : ".") + h) : Number(f)) * g + ")";
    }), i(be(s));
  }
  function i(s) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const d = s.name.toLowerCase();
      if (d === "pi") return Math.PI;
      if (d === "e") return Math.E;
      if (!Object.hasOwn(e, d)) throw Error("Undefined structural parameter: " + s.name);
      if (r.has(d)) throw Error("Circular structural parameter: " + d);
      r.add(d);
      const f = n(e[d]);
      return r.delete(d), f;
    }
    if (s.type === "ConditionalExpression") return te(i(s.test)) ? i(s.consequent) : i(s.alternate);
    if (s.type === "UnaryExpression") {
      const d = i(s.argument);
      if (s.operator === "-") return -d;
      if (s.operator === "+") return +d;
      if (s.operator === "!" || s.operator === "~") return !te(d);
    }
    if (s.type === "BinaryExpression") {
      const d = i(s.left);
      if (s.operator === "&&") return te(d) && te(i(s.right));
      if (s.operator === "||") return te(d) || te(i(s.right));
      const f = i(s.right);
      switch (s.operator) {
        case "+":
          return d + f;
        case "-":
          return d - f;
        case "*":
          return d * f;
        case "/":
          return d / f;
        case "**":
          return d ** f;
        case "%":
          return d % f;
        case "^":
          return te(d) !== te(f);
        case "&":
          return te(d) && te(f);
        case "|":
          return te(d) || te(f);
        case ">":
          return d > f;
        case "<":
          return d < f;
        case ">=":
          return d >= f;
        case "<=":
          return d <= f;
        case "==":
        case "===":
          return d === f;
        case "!=":
        case "!==":
          return d !== f;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const d = s.callee.name.toLowerCase();
      if (d === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return te(i(s.arguments[0])) ? i(s.arguments[1]) : i(s.arguments[2]);
      }
      if (Object.hasOwn(qe, d)) return qe[d](...s.arguments.map(i));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const l = n(t);
  if (typeof l == "number" && !Number.isFinite(l)) throw Error("Structural expression is not finite.");
  return l;
}
function Qe(t, { isolate: e = "" } = {}) {
  Mt(t);
  const r = J(), o = /* @__PURE__ */ new Map();
  let n = 0, i = 0;
  function l(s, d, f, a, h, c, g) {
    if (d.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++n > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const b = t.scopes[s], w = d.length ? he(d.slice(0, -1), d.at(-1)) : "", N = J();
    if (e && w === e && (f = J()), g.some((x) => x.scopeId === s)) throw Error("Circular subcircuit reference at " + w);
    const y = Tt(a, b.defaults, b.parameters, h);
    function m(x) {
      if (/^\{[\s\S]*\}$/.test(x)) {
        const L = xe(x, y);
        x = String(typeof L == "boolean" ? Number(L) : L);
      }
      /^"[\s\S]*"$/.test(x) && (x = x.slice(1, -1));
      const I = x.toLowerCase();
      return Object.hasOwn(f, I) ? f[I] : t.globals.includes(I) ? Me([], I) : N[I] || (N[I] = Me(d, I));
    }
    const E = { id: w, path: d, scopeId: s, name: c?.name || "Top", definition: b.name, ports: b.ports.map((x) => ({ name: x, node: m(x) })), params: y, nodes: N, models: J(), devices: [], children: [], raw: c?.raw || "", line: c?.line || 0 };
    r[w] = E, o.set(w, m);
    const v = [...g, E];
    function A(x) {
      if (!x) return "";
      let I = b;
      for (; I; ) {
        if (I.directives.some((L) => new RegExp("^\\.model\\s+" + x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(L.text))) {
          const L = [...v].reverse().find((u) => u.scopeId === I.id);
          return he(L?.path || [], x.toLowerCase());
        }
        I = t.scopes[I.parent];
      }
      return x;
    }
    for (const x of b.directives.filter((I) => /^\.model\b/i.test(I.text))) {
      const I = /^\.model\s+(\S+)/i.exec(x.text)?.[1];
      if (!I) continue;
      const L = A(I), u = b.models[I.toLowerCase()], _ = Pe(x.text, y, m, (R) => he(d, R));
      E.models[L] = { ...u, name: L, raw: _.replace(/^(\.model\s+)\S+/i, (R, j) => j + L), instanceId: w, parameters: y };
    }
    for (const x of b.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const I = J();
      for (const [u, _] of Object.entries(x.terminals)) I[u] = m(_);
      const L = A(x.model);
      E.devices.push({ ...x, name: he(d, x.name), localName: x.name, instanceId: w, terminals: I, model: L, parameters: y });
    }
    for (const x of b.instances) {
      let I = x.definitionId;
      if (!I) {
        const R = String(xe(x.definitionName, y)).toLowerCase();
        let j = b;
        for (; j && !I; )
          I = j.definitions[R], j = t.scopes[j.parent];
        if (!I) throw Error("Undefined selected subcircuit: " + R);
      }
      const L = t.scopes[I], u = J();
      if (L.ports.length !== x.nodes.length) throw Error(x.name + ": expected " + L.ports.length + " ports; got " + x.nodes.length);
      L.ports.forEach((R, j) => {
        u[R.toLowerCase()] = m(x.nodes[j]);
      });
      const _ = l(I, [...d, x.name], u, y, x.parameters, x, v);
      x.pinNames?.length === _.ports.length && _.ports.forEach((R, j) => {
        R.label = x.pinNames[j];
      }), E.children.push(_);
    }
    return E;
  }
  try {
    let h = function(c, g) {
      const b = g.split(":");
      if (b.length === 1) return { owner: c, name: g };
      const w = b.pop();
      for (const N of [[...c.path, ...b], b]) {
        const y = d.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (y) return { owner: y, name: w };
      }
      throw Error("Unknown hierarchical reference: " + g);
    };
    const s = l(t.rootId, [], J(), J(), J(), null, []), d = new Map(Object.values(r).map((c) => [c.id.toLowerCase(), c])), f = Object.assign(J(), ...Object.values(r).map((c) => c.models)), a = (c) => f[c] || Object.entries(f).find(([g]) => g.startsWith(c + "."))?.[1];
    for (const c of Object.values(r)) for (const g of c.devices) {
      const b = t.scopes[c.scopeId].devices.find((y) => y.name === g.localName), w = (y) => {
        const m = h(c, y);
        return o.get(m.owner.id)(m.name);
      }, N = (y, m = "", E = "") => {
        const v = h(c, y), A = v.owner.devices.find((x) => x.localName.toLowerCase() === v.name.toLowerCase());
        if (m.toLowerCase() === "ix") {
          const x = v.owner.ports.find((I, L) => I.name.toLowerCase() === v.name.toLowerCase() || String(L + 1) === v.name);
          if (x) return v.owner.id + ":" + x.name;
        }
        if (!A) {
          if (E) throw Error(g.name + ": referenced " + E + " device " + y + " was not found.");
          return he(v.owner.path, v.name);
        }
        if (E && A.kind !== E) throw Error(g.name + ": " + y + " must be a " + E + " device.");
        return A.name;
      };
      if (g.value = Pe(b.value, c.params, w, N), b.model && (g.value = g.value.replace(b.model, g.model)), g.kind === "M" && Object.keys(g.terminals).length === 3) {
        let y = a(g.model), m = !1;
        const E = /* @__PURE__ */ new Set();
        for (; y?.type === "VDMOS" && !E.has(y.name); ) {
          E.add(y.name);
          const v = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(y.raw);
          if (v) {
            m = v[1] === void 0 || Number(xe(v[1], y.parameters)) >= 0.5;
            break;
          }
          const A = y.name.includes("/") ? y.name.slice(0, y.name.lastIndexOf("/") + 1) : "";
          y = a(A + (y.baseModel || "").toLowerCase()) || a((y.baseModel || "").toLowerCase());
        }
        E.size && (g.type = "spice_" + (m ? "pmos3" : "nmos3"));
      }
      g.controlSources = (b.controlSources || []).map((y) => N(y, "", "V")), g.controlSource = g.controlSources[0] || "", g.coupledInductors = (b.coupledInductors || []).map((y) => N(y, "", "L"));
      for (const y of /* @__PURE__ */ new Set([...b.controlSources || [], ...b.coupledInductors || []])) {
        const m = y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        g.value = g.value.replace(new RegExp("(?<![\\w./%])" + m + "(?![\\w.$])", "g"), () => N(y));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: s, contexts: r };
  } catch (s) {
    throw s.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: s.message }], s;
  }
}
function ge(t) {
  return [...t.devices, ...t.children.flatMap(ge)];
}
function Ee(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, r) => e[0].localeCompare(r[0])));
}
function De(t, e = {}) {
  const r = new Map(t.components.map((u) => [u.name, u])), o = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = [], l = (u, _) => JSON.stringify([u, _].sort()), s = (u) => e[u]?.potential !== null && e[u]?.potential !== void 0;
  for (const u of t.components) {
    for (const [k, P] of Object.entries(u.terminals))
      o.has(P) || o.set(P, []), o.get(P).push({ device: u.name, pin: k });
    if (u.kind === "R") {
      const k = Object.values(u.terminals);
      if (k.length === 2 && k[0] !== k[1]) {
        const P = l(...k);
        n.has(P) || n.set(P, []), n.get(P).push(u);
      }
    }
    const _ = u.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(u.kind) ? "fet" : null, R = _ === "bjt" ? /_(npn|pnp)$/.exec(u.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(u.type)?.[1];
    if (!_ || !R) continue;
    const j = u.terminals, B = j[_ === "bjt" ? "B" : "G"], W = j[_ === "bjt" ? "C" : "D"], p = j[_ === "bjt" ? "E" : "S"];
    [B, W, p].some((k) => k === void 0) || B === p || W === p || i.push({ id: u.name, family: _, polarity: R, control: B, drain: W, source: p, body: u.kind === "M" ? j.B : void 0 });
  }
  const d = [], f = /* @__PURE__ */ new Set(), a = (u, _, R, j, B, W = "basic", p = [], k = "high") => {
    const P = [.../* @__PURE__ */ new Set([..._, ...p])], T = JSON.stringify([u, W, [...P].sort()]);
    f.has(T) || (f.add(T), d.push({ id: "motif" + d.length, kind: u, variant: W, transistors: _, members: P, roles: R, nets: j, evidence: B, confidence: k }));
  }, h = (u, _) => u.family === _.family && u.polarity === _.polarity, c = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), w = new Map(i.map((u) => [u.id, u])), N = (u, _, R) => {
    u.has(_) || u.set(_, []), u.get(_).push(R);
  }, y = (u, _) => JSON.stringify([u.family, u.polarity, _]);
  for (const u of i)
    N(c, y(u, u.control), u), N(g, y(u, u.source), u), u.family === "bjt" && (o.get(u.source) || []).some((_) => {
      const R = w.get(_.device);
      return R && R.family === "bjt" && !h(u, R) && R.source === u.source;
    }) && N(b, y(u, u.drain), u);
  const m = (u) => [{ node: u.source, resistor: null }, ...(o.get(u.source) || []).flatMap((_) => {
    const R = r.get(_.device);
    if (R.kind !== "R") return [];
    const j = Object.values(R.terminals).find((B) => B !== u.source);
    return j !== void 0 && j !== u.control && j !== u.drain ? [{ node: j, resistor: R.name }] : [];
  })];
  for (const u of i) u.control === u.drain && a("diode-connected", [u.id], { reference: u.id }, { control: u.control, return: u.source }, ["control-drain-short", u.family]);
  for (const u of i) {
    const _ = c.get(y(u, u.control));
    if (_.filter((k) => k.control === k.drain).length > 1) continue;
    let R = null;
    if (u.control !== u.drain && u.family === "bjt" && (R = (c.get(y(u, u.drain)) || []).find((k) => k.id !== u.id && h(k, u) && k.control === u.drain && k.source === u.control && s(k.drain))), u.control !== u.drain && !R) continue;
    const j = m(u), B = [];
    let W = null, p = [];
    for (const k of _) {
      if (k.id === u.id || k.id === R?.id || k.drain === u.drain || k.drain === k.control) continue;
      const P = j.flatMap((T) => m(k).filter((F) => T.node === F.node).map((F) => ({ node: T.node, rs: [T.resistor, F.resistor].filter(Boolean) }))).find((T) => W === null || T.node === W);
      P && (W = P.node, B.push(k.id), p.push(...P.rs));
    }
    if (B.length) {
      const k = B.every((P) => w.get(P).body === u.body);
      a("current-mirror", [u.id, ...B, ...R ? [R.id] : []], { reference: u.id, outputs: B, ...R ? { helper: R.id } : {} }, { control: u.control, return: W }, ["same-polarity", "shared-control", R ? "emitter-follower-reference" : "diode-reference", p.length ? "resistive-common-return" : "shared-return", k ? "compatible-bodies" : "different-body-connections"], R ? "assisted" : p.length ? "degenerated" : "basic", [...p, ...R ? [R.id] : []], k ? "high" : "medium");
    }
  }
  const E = [], v = /* @__PURE__ */ new Set(), A = (u, _) => {
    const R = JSON.stringify([u.id, _.id].sort());
    v.has(R) || (v.add(R), E.push([u, _]));
  };
  for (const u of g.values()) if (!s(u[0].source)) {
    const _ = u.filter((R) => R.control !== R.drain);
    _.length === 2 ? A(..._) : _.length > 2 && new Set(_.map((R) => R.control)).size > 1 && a("differential-pair", _.map((R) => R.id), { inputs: _.map((R) => R.id) }, { tail: _[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const u of b.values()) for (let _ = 0; _ < u.length; _++) for (let R = _ + 1; R < u.length; R++) A(u[_], u[R]);
  for (const [u, _] of E) {
    if (u.control === _.control || u.control === u.drain || _.control === _.drain) continue;
    if (u.source === _.source && u.drain !== _.drain && !s(u.source)) {
      const B = (o.get(u.source) || []).some((p) => p.device !== u.id && p.device !== _.id), W = g.get(y(u, u.source)).length === 2;
      a("differential-pair", [u.id, _.id], { inputs: [u.id, _.id] }, { tail: u.source }, ["same-polarity", "distinct-controls", "shared-tail", B ? "tail-bias-connection" : "unbiased-tail", W ? "two-input-tail" : "multi-input-tail"], "basic", [], B && W && u.body === _.body ? "high" : "medium");
    }
    if (u.family !== "bjt" || u.drain !== _.drain || u.source === _.source) continue;
    const R = i.filter((B) => B.family === "bjt" && B.polarity !== u.polarity && B.source === u.source), j = i.filter((B) => B.family === "bjt" && B.polarity !== u.polarity && B.source === _.source);
    for (const B of R) for (const W of j) B.id !== W.id && B.control === W.control && B.drain !== W.drain && B.control !== B.drain && W.control !== W.drain && a("differential-pair", [u.id, _.id, B.id, W.id], { inputs: [u.id, _.id], commonBase: [B.id, W.id] }, { inputCollectors: u.drain, bias: B.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const u of i) if (u.family === "bjt" && u.control !== u.drain) {
    const _ = n.get(l(u.drain, u.control)) || [], R = n.get(l(u.control, u.source)) || [];
    _.length === 1 && R.length === 1 && a("vbe-multiplier", [u.id], { transistor: u.id, collectorResistor: _[0].name, emitterResistor: R[0].name }, { control: u.control, collector: u.drain, emitter: u.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [_[0].name, R[0].name]);
  }
  const x = i.filter((u) => u.family === "bjt"), I = /* @__PURE__ */ new Map();
  for (const u of x) N(I, u.control, u);
  const L = (u) => (o.get(u) || []).filter((_) => w.has(_.device));
  for (const u of x) if (u.control !== u.drain) {
    for (const _ of I.get(u.source) || []) if (_.id !== u.id && h(u, _) && _.drain === u.control && _.source !== u.drain) {
      const R = n.get(l(u.source, _.source)) || [];
      R.length === 1 && a("current-limit-pair", [u.id, _.id], { driver: u.id, output: _.id, senseResistor: R[0].name }, { sense: u.source, drive: u.control, output: _.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [R[0].name]);
    }
    for (const _ of I.get(u.source) || []) _.id !== u.id && h(u, _) && _.control !== _.drain && u.drain === _.drain && _.source !== u.control && a("darlington-pair", [u.id, _.id], { driver: u.id, output: _.id }, { link: u.source, collector: u.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (I.get(u.source) || []).length === 1 ? "high" : "medium");
    for (const _ of I.get(u.drain) || []) _.id !== u.id && !h(u, _) && _.control !== _.drain && u.source === _.drain && _.source !== u.control && L(u.drain).length === 2 && a("sziklai-pair", [u.id, _.id], { driver: u.id, output: _.id }, { link: u.drain, feedback: u.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const _ of o.get(u.drain) || []) {
      const R = w.get(_.device);
      !R || R.family !== "bjt" || R.id === u.id || !h(u, R) || R.source !== u.drain || s(u.drain) || R.control === u.control || R.control === R.drain || R.drain === u.source || L(u.drain).length !== 2 || a("cascode-pair", [u.id, R.id], { driver: u.id, output: R.id }, { link: u.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const u of x.filter((_) => _.polarity === "npn" && s(_.drain))) for (const _ of x.filter((R) => R.polarity === "pnp" && s(R.drain))) {
    if (e[u.drain].potential <= e[_.drain].potential) continue;
    const R = m(u).flatMap((j) => m(_).filter((B) => j.node === B.node && !s(j.node)).map((B) => ({ node: j.node, rs: [j.resistor, B.resistor].filter(Boolean) })))[0];
    R && a("push-pull-pair", [u.id, _.id], { upper: u.id, lower: _.id }, { output: R.node }, ["complementary-polarity", "ordered-collector-supplies", R.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", R.rs);
  }
  return d;
}
function je(t, e, r = (o) => o) {
  const o = (n) => Array.isArray(n) ? n.map(e) : e(n);
  return t.map((n) => ({ ...n, members: n.members.map(e), transistors: n.transistors.map(e), roles: Object.fromEntries(Object.entries(n.roles).map(([i, l]) => [i, o(l)])), nets: Object.fromEntries(Object.entries(n.nets).map(([i, l]) => [i, r(l)])) }));
}
function $t(t, e, r) {
  const o = [], n = /* @__PURE__ */ new Set(), i = new Map(t.components.map((l) => [l.name, l]));
  for (const l of r) {
    if (new Set(l.members).size !== l.members.length) throw Error("Duplicate @layout pair member.");
    const s = l.members.map((c) => i.get(c));
    if (s.some((c) => !c)) throw Error("Unknown @layout pair device.");
    const d = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[l.kind], f = l.kind === "differential" && s.length === 2 ? t.components.filter((c) => !l.members.includes(c.name) && Object.values(c.terminals).includes(s[0].terminals.E ?? s[0].terminals.S)) : [], a = De({ ...t, components: [...s, ...f] }, e), h = a.find((c) => c.kind === d && c.confidence === "high" && l.members.every((g) => c.members.includes(g)));
    if (!h) throw Error("Invalid @layout pair " + l.kind + " { " + l.members.join(" ") + " }: electrical structure does not match.");
    for (const c of a.filter((g) => g === h || g.kind === "diode-connected" && g.members.every((b) => h.members.includes(b)))) {
      const g = JSON.stringify([c.kind, [...c.members].sort()]);
      n.has(g) || (n.add(g), o.push({ ...c, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function Wt(t, e, r = De(t, e)) {
  const o = /* @__PURE__ */ new Map(), n = t.components.filter((c) => c.kind === "R"), i = t.components.filter((c) => c.kind === "Q"), l = new Map(t.components.map((c) => [c.name, c])), s = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), f = (c) => Object.values(c.terminals), a = (c, g, b) => {
    c && o.set(c.name, { reverse: f(c)[0] !== g, reason: b });
  };
  for (const c of i) {
    const { C: g, B: b, E: w } = c.terminals, N = c.type.endsWith("pnp"), y = c.type.endsWith("npn");
    !N && !y || (s.has(w) || s.set(w, []), s.get(w).push(c), g === b && e[w]?.potential !== null && e[w]?.potential !== void 0 && d.set(g, { potential: e[w].potential }));
  }
  for (const c of r) if (c.kind === "vbe-multiplier" && c.confidence === "high") {
    const g = l.get(c.roles.transistor), b = g.type.endsWith("pnp"), w = l.get(b ? c.roles.emitterResistor : c.roles.collectorResistor), N = l.get(b ? c.roles.collectorResistor : c.roles.emitterResistor);
    a(w, g.terminals[b ? "E" : "C"], "recognized VBE multiplier"), a(N, g.terminals.B, "recognized VBE multiplier");
  }
  for (const c of n) {
    const [g, b] = f(c), w = d.get(g), N = d.get(b);
    w && N && w.potential !== N.potential && a(c, w.potential > N.potential ? g : b, "diode-connected bias reference");
  }
  const h = /* @__PURE__ */ new Map();
  for (const c of n) {
    const g = f(c);
    if (!g.some((b) => e[b]?.potential !== null && e[b]?.potential !== void 0))
      for (const b of g)
        h.has(b) || h.set(b, []), h.get(b).push(c);
  }
  for (const [c, g] of h)
    if (!(g.length > 12))
      for (const b of g) for (const w of g) {
        if (b === w) continue;
        const N = f(b).find((v) => v !== c), y = f(w).find((v) => v !== c), m = s.get(N)?.find((v) => v.type.endsWith("npn")), E = s.get(y)?.find((v) => v.type.endsWith("pnp"));
        m && E && (a(b, N, "complementary emitter output"), a(w, c, "complementary emitter output"));
      }
  return o;
}
function zt(t) {
  const e = t.components.filter((i) => i.kind === "Q"), r = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((i) => i.kind === "R").map((i) => Object.values(i.terminals).sort().join("|"))), n = /* @__PURE__ */ new Set();
  for (const i of e) {
    const l = i.terminals.E;
    r.has(l) || r.set(l, []), r.get(l).push(i);
  }
  for (const i of e) {
    const { B: l, C: s, E: d } = i.terminals;
    if (l === d || !o.has([l, d].sort().join("|"))) continue;
    const f = r.get(l) || [];
    if (!(f.length > 16))
      for (const a of f) {
        if (a === i) continue;
        if (a.terminals.B === s) {
          n.add(i.name);
          break;
        }
        const h = r.get(a.terminals.B) || [];
        if (h.length <= 16 && h.some((c) => c !== i && c !== a && c.terminals.B === s)) {
          n.add(i.name);
          break;
        }
      }
  }
  return n;
}
const Te = 19;
function Ue(t) {
  const e = String(t).split("/").at(-1);
  let r;
  try {
    r = decodeURIComponent(e);
  } catch {
    r = e;
  }
  return r === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(r)?.[1].toLowerCase() || "unknown";
}
const ve = (t) => ["pwr", "ret", "bias"].includes(t), Xt = (t) => String(t).split("/").at(-1).toLowerCase(), rt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[Xt(t)] || "unknown", Ke = (t) => {
  const e = Ue(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || rt(t);
};
function qt(t) {
  const e = /* @__PURE__ */ new Map(), r = [], o = (l, s, d) => {
    e.has(l) || e.set(l, []), e.get(l).push({ node: s, delta: d });
  };
  for (const l of t)
    if (l.kind === "V")
      try {
        let s = l.value.trim();
        const d = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (d && Number(xe(d[1], l.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const f = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!f) continue;
        const a = xe(f[1], l.parameters);
        if (typeof a != "number" || !Number.isFinite(a)) continue;
        o(l.terminals["-"], l.terminals["+"], a), o(l.terminals["+"], l.terminals["-"], -a);
      } catch {
      }
  const n = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ new Set();
  for (const l of ["0", ...e.keys()]) {
    if (i.has(l)) continue;
    const s = /* @__PURE__ */ new Map([[l, 0]]), d = [l];
    i.add(l);
    let f = !1;
    for (let a = 0; a < d.length; a++) for (const h of e.get(d[a]) || []) {
      const c = s.get(d[a]) + h.delta;
      s.has(h.node) ? Math.abs(s.get(h.node) - c) > 1e-8 * Math.max(1, Math.abs(c)) && (f = !0) : (s.set(h.node, c), i.add(h.node), d.push(h.node));
    }
    f && r.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [a, h] of s) n[a] = { value: h, reference: l, known: l === "0" && !f, consistent: !f };
  }
  return { nodes: n, diagnostics: r };
}
function Kt(t, e, r = null) {
  const o = qt(ge(e.localScope ? t.contexts[e.focus] : t.root)), n = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const h = Ue(a.name), c = rt(a.name);
    n[a.name] = { role: h !== "unknown" ? h : c, roleSource: h !== "unknown" ? "node-name" : c !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[a.name]?.known ? o.nodes[a.name].value : null };
  }
  if (e.localScope) for (const a of e.interfaceBindings) {
    const h = n[a.local], c = Ke(a.port);
    h && h.potential === null && ["pwr", "ret"].includes(c) && (h.potential = c === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(a.port) ? 0 : -1, h.potentialSource = "symbolic-port-order");
  }
  const l = r?.pairs?.length ? $t(e, n, r.pairs) : De(e, n), s = Wt(e, n, l), d = zt(e), f = (a, h, c) => {
    const g = { role: n[c].role, roleSource: n[c].roleSource }, b = a.block?.ports.find((y) => y.pin === h);
    if (b?.implicit || !a.block && !a.synthetic) return g;
    const w = a.synthetic ? a.value : b?.name || b?.label, N = Ke(w);
    return N !== "unknown" ? { role: N, roleSource: Ue(w) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ve(g.role) ? { ...g, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const h = Object.fromEntries(Object.entries(a.terminals).map(([L, u]) => [L, { ...n[u], ...f(a, L, u) }])), c = Object.values(h), g = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), b = g && !s.has(a.name) && c.length === 2 && c.every((L) => !ve(L.role) && (L.potential === null || L.role !== "unknown")), w = a.terminals["+"], N = a.terminals["-"], y = [w, N].filter((L) => L && L !== "0"), m = a.kind === "V" && y.some((L) => ve(n[L]?.role)) && !y.some((L) => ["in", "out", "io", "fb"].includes(n[L]?.role)) && [w, N].every((L) => o.nodes[L]?.known), E = w === "0" ? N : w, v = Object.keys(a.terminals), A = (L) => ve(L.role) ? L.potential !== null ? L.potential > 0 ? "high" : "low" : L.role === "ret" ? "low" : "high" : "signal";
    let x = !1;
    v.length === 2 && (a.kind === "V" && c.every((L) => L.potential !== null) ? x = c[0].potential < c[1].potential : a.terminals[v[0]] === "0" ? x = !0 : a.terminals[v[1]] === "0" ? x = !1 : c.every((L) => L.potential !== null) ? x = c[0].potential < c[1].potential : x = A(c[0]) === "low" || A(c[1]) === "high" && A(c[0]) === "signal"), s.has(a.name) && (x = s.get(a.name).reverse);
    const I = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    i[a.name] = { version: Te, kind: a.kind, polarity: a.type.endsWith("pnp") ? "p" : a.type.endsWith("npn") ? "n" : null, currentLimiter: d.has(a.name), orientationReason: s.get(a.name)?.reason || null, owner: I.includes("/") ? I.slice(0, I.lastIndexOf("/")) : "", passive: g, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !g, ports: h, horizontal: b, orientation: b ? "horizontal" : x ? "vertical-reversed" : "vertical", flexible: v.length === 2 && (g || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!m, voltage: m ? o.nodes[E].value : null };
  }
  return { version: Te, nodes: n, cells: i, motifs: l, diagnostics: o.diagnostics };
}
function ot(t, e) {
  const r = e.ports.map((n, i) => ({ pin: "P" + i, name: n.name, label: n.label || n.name, node: n.node, implicit: !1 })), o = new Set(ge(e).flatMap((n) => Object.values(n.terminals)));
  for (const n of t.ir.globals) {
    const i = Me([], n);
    o.has(i) && !r.some((l) => l.node === i) && r.push({ pin: "G" + r.length, label: n === "0" ? "⏚ 0" : "global: " + n, node: i, implicit: !0 });
  }
  return r;
}
function Yt(t, { mode: e = "hierarchical", expanded: r = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const n = t, i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  o && (t = Qe(t.ir, { isolate: o }));
  const l = t.contexts[o];
  if (!l) throw Error("Unknown instance: " + o);
  const s = [], d = [];
  function f(b) {
    d.push(...Object.values(b.nodes), ...b.ports.map((N) => N.node));
    const w = [...b.devices.map((N) => ({ line: N.line, device: N })), ...b.children.map((N) => ({ line: N.line, child: N }))].sort((N, y) => N.line - y.line);
    for (const N of w) {
      if (N.device) {
        const v = N.device;
        s.push({ ...v, layoutLabel: [...b.path.slice(l.path.length), v.localName].join("/") });
        continue;
      }
      const y = N.child;
      if (e === "flat" || r.has(y.id)) {
        f(y);
        continue;
      }
      const m = ot(t, y), E = J();
      m.forEach((v) => {
        E[v.pin] = v.node;
      }), s.push({ name: y.id, kind: "X", type: "spice_subckt", terminals: E, value: y.definition, raw: y.raw, line: y.line, instanceId: y.id, layoutLabel: y.path.slice(l.path.length).join("/"), block: { definitionId: y.scopeId, ports: m, parameters: y.params } });
    }
  }
  f(l);
  for (const [b, w] of l.ports.entries()) s.push({ name: "@port/" + o + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: w.node }, layoutLabel: w.name, value: w.name, raw: "Interface port " + w.name, synthetic: !0 });
  if (s.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const a = Object.assign(J(), ...Object.values(t.contexts).map((b) => b.models)), h = { title: o || t.ir.title, components: s, nodes: Lt(s, d), models: a, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  h.interfaceBindings = l.ports.map((b, w) => ({ port: b.name, local: b.node, parent: i.ports[w].node }));
  const c = /* @__PURE__ */ new Map();
  for (const b of i.ports)
    c.has(b.node) || c.set(b.node, []), c.get(b.node).push(b.name);
  h.interfaceAliases = [...c].filter(([, b]) => b.length > 1).map(([b, w]) => ({ node: b, ports: w })), h.topology = Zt(n, h);
  const g = Rt(t, h);
  return h.layout = Kt(t, h, g), h.layout.description = g, h;
}
function Zt(t, e) {
  const r = ge(t.contexts[e.focus]);
  e.localScope && (t = Qe(t.ir, { isolate: e.focus }));
  const o = [], n = /* @__PURE__ */ new Set();
  for (const s of e.components)
    if (!s.synthetic)
      if (s.kind === "X") {
        const d = t.contexts[s.instanceId];
        if (!d) throw Error("Projection contains an unknown block.");
        const f = ot(t, d);
        if (JSON.stringify(Object.entries(s.terminals)) !== JSON.stringify(f.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + s.name);
        o.push(...ge(d));
      } else o.push(s);
  for (const s of o) {
    if (n.has(s.name)) throw Error("Projection duplicates " + s.name);
    n.add(s.name);
  }
  const i = Ee(o), l = ge(t.contexts[e.focus]);
  if (i !== Ee(l)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const s = new Map(e.interfaceBindings.map((a) => [a.local, a.parent])), d = (a) => s.get(a) ?? a, f = o.map((a) => ({ ...a, terminals: Object.fromEntries(Object.entries(a.terminals).map(([h, c]) => [h, d(c)])), value: Pe(a.value, {}, d, (h) => h) }));
    if (Ee(f) !== Ee(r)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: i, boundSignature: Ee(r), boundaryVerified: !0 };
}
function Ye(t) {
  const e = J(), r = J();
  for (const o of t.components) {
    const n = J(), i = J();
    for (const [l, s] of Object.entries(o.terminals))
      n[l] = [t.nodes[s].bit], i[l] = "input";
    e[o.name] = { type: o.type, port_directions: i, connections: n, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((l) => ({ pin: l.pin, label: l.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((l, s) => ({ pin: l, label: o.pinLabels?.[s] || l })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) r[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: r, spiceMotifs: je(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Jt(t) {
  const e = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), o = {}, n = (f) => (r.has(f) || r.set(f, r.size + 2), r.get(f));
  Object.entries(t.modules.circuit.cells).forEach(([f, a], h) => {
    const c = "c" + h;
    e.set(c, f);
    const g = Object.fromEntries(Object.entries(a.connections).map(([b, w]) => [b, w.map(n)]));
    o[c] = { type: a.type, connections: g, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (o[c].spiceBlock = a.spiceBlock), a.spiceSymbol && (o[c].spiceSymbol = a.spiceSymbol), a.spiceLayout && (o[c].spiceLayout = a.spiceLayout);
  });
  const i = new Map([...e].map(([f, a]) => [a, f])), l = t.modules.circuit.spiceLayoutDescription, s = l ? { ...l, faces: (l.faces || []).map((f) => ({ ...f, device: i.get(f.device) })), pairs: (l.pairs || []).map((f) => ({ ...f, members: f.members.map((a) => i.get(a)) })), groups: l.groups.map((f) => ({ ...f, members: f.members.map((a) => a.cell ? { ...a, cell: i.get(a.cell) } : a) })), relations: l.relations.map((f) => ({ ...f, a: i.get(f.a) || f.a, b: i.get(f.b) || f.b })) } : null, d = je(t.modules.circuit.spiceMotifs || [], (f) => i.get(f), n);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: d, spiceLayoutDescription: s } } }, ids: e, bits: new Map([...r].map(([f, a]) => [a, f])) };
}
const le = /* @__PURE__ */ new Map();
async function en(t, e) {
  const r = Jt(t), o = JSON.stringify([r.netlist, e]);
  let n = le.get(o);
  n ? (le.delete(o), le.set(o, n)) : (n = await tn(r.netlist, e), n.svg.length < 1e6 && (le.set(o, n), le.size > 20 && le.delete(le.keys().next().value)));
  const i = new DOMParser().parseFromString(n.svg, "image/svg+xml");
  if (i.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const d of i.querySelectorAll("[id],[class]")) {
    const f = d.getAttribute("id");
    f?.startsWith("cell_") && r.ids.has(f.slice(5)) && d.setAttribute("id", "cell_" + r.ids.get(f.slice(5)));
    const a = d.getAttribute("class");
    a && d.setAttribute("class", a.split(/\s+/).map((h) => h.startsWith("cell_") && r.ids.has(h.slice(5)) ? "cell_" + r.ids.get(h.slice(5)) : /^net_\d+$/.test(h) && r.bits.has(Number(h.slice(4))) ? "net_" + r.bits.get(Number(h.slice(4))) : h).join(" "));
  }
  const l = n.drawing ? structuredClone(n.drawing) : null, s = i.querySelector("#spice-layout-report");
  if (s) {
    const d = JSON.parse(s.textContent), f = (a) => r.ids.get(a) || a;
    d.mirroredTransistors = (d.mirroredTransistors || []).map(f), d.orientationDevicesTested = (d.orientationDevicesTested || []).map(f), d.recognizedMotifs = je(d.recognizedMotifs || [], f, (a) => r.bits.get(a) ?? a), d.inputAttachments = (d.inputAttachments || []).map(f), d.mirroredInputPorts = (d.mirroredInputPorts || []).map(f);
    for (const a of [...d.flippedPairs || [], ...d.pairOrientationTrials || []]) a.members = a.members.map(f);
    for (const a of d.pairCompactions || [])
      a.members = a.members.map(f), a.moved = f(a.moved);
    for (const a of d.pairConstraints || []) a.members = a.members.map(f);
    for (const a of d.pairProximity || []) a.members = a.members.map(f);
    for (const a of d.motifMeasurements || [])
      a.members = a.members.map(f), a.interlopers && (a.interlopers = a.interlopers.map(f));
    for (const a of d.voltageRails || []) a.bit !== void 0 && (a.bit = r.bits.get(a.bit) ?? a.bit);
    s.textContent = JSON.stringify(d);
  }
  if (l) {
    for (const d of l.components) {
      d.id = r.ids.get(d.id) || d.id;
      for (const f of d.ports) f.bit = r.bits.get(f.bit) ?? f.bit;
    }
    for (const d of l.segments) d.bit = r.bits.get(d.bit) ?? d.bit;
  }
  return { svg: new XMLSerializer().serializeToString(i.documentElement), drawing: l };
}
function tn(t, e) {
  const r = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DCIL6LzF.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, n) => {
    const i = (d, f) => {
      clearTimeout(s), r.terminate(), d ? n(Error(d)) : o(f);
    }, l = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => i("Layout timed out. Open a subcircuit sheet or collapse instances."), l);
    r.onmessage = ({ data: d }) => i(d.error, { svg: d.svg, drawing: d.drawing }), r.onerror = (d) => i(d.message || "Layout worker failed."), r.postMessage({ netlist: t, settings: e });
  });
}
const nn = `* RLC low-pass filter
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
`, rn = `* Voltage-divider biased common-emitter amplifier.
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
`, on = `* Common-collector voltage follower; independently chosen example values.
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
`, sn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, an = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, Ne = {
  filter: { source: nn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: rn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: on, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: sn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: an, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function cn(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Ze(t) {
  return cn(await t.arrayBuffer());
}
const it = [
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
].flat(), Ve = "#292b29", ke = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => it[e * 9 + t]))])], Je = (t) => /^#[\da-f]{6}$/i.test(t), et = "spice-node-colors-v1";
function ln(t) {
  let e = 2166136261;
  for (let r = 0; r < t.length; r++) e = Math.imul(e ^ t.charCodeAt(r), 16777619);
  return t.length + ":" + (e >>> 0);
}
class dn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const r = ln(e);
    r !== this.sourceId && (this.sourceId = r, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, ke[this.assigned.size % ke.length]), this.assigned.get(e)) : Ve;
  }
  set(e, r) {
    if (!Je(r)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, r.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const r of ["manual", "assigned"]) this[r] = new Map((Array.isArray(e[r]) ? e[r] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && Je(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function un(t, e, r) {
  const o = new Map(e.map((n) => [n.name, r.color(n.name)]));
  for (const n of t.children) if (["line", "path", "polyline", "circle"].includes(n.localName) && n.hasAttribute("data-net")) {
    const i = o.get(n.getAttribute("data-net"));
    if (!i) continue;
    n.style.setProperty("stroke", i, "important"), n.localName === "circle" && n.style.setProperty("fill", i, "important");
  }
}
function fn(t, e) {
  const r = new dn(), o = /* @__PURE__ */ new Set();
  let n = [], i = !1;
  try {
    r.restore(JSON.parse(sessionStorage.getItem(et) || "null"));
  } catch {
  }
  const l = () => {
    try {
      sessionStorage.setItem(et, JSON.stringify(r.snapshot()));
    } catch {
    }
  }, s = () => {
    const c = t("node-search").value.trim().toLowerCase();
    return n.filter((g) => !c || [g.name, g.displayName, ...g.terminals.map((b) => b.component + "." + b.pin)].some((b) => b.toLowerCase().includes(c)));
  };
  function d() {
    const c = s(), g = c.filter((b) => o.has(b.name)).length;
    t("node-count").textContent = `${c.length} / ${n.length} nodes · ${o.size} selected`, t("node-all").checked = !!c.length && g === c.length, t("node-all").indeterminate = g > 0 && g < c.length, t("node-auto").checked = r.auto;
    for (const b of ["node-apply", "node-clear"]) t(b).disabled = !i || !o.size;
    t("node-all").disabled = !i || !c.length;
  }
  function f() {
    t("nets").replaceChildren(...s().map((c) => {
      const g = document.createElement("tr");
      g.dataset.node = c.name;
      const b = document.createElement("td"), w = document.createElement("input");
      w.type = "checkbox", w.checked = o.has(c.name), w.disabled = !i, w.setAttribute("aria-label", "Select node " + c.displayName), w.onchange = () => {
        w.checked ? o.add(c.name) : o.delete(c.name), d();
      }, b.append(w);
      const N = document.createElement("td");
      N.textContent = c.displayName;
      const y = document.createElement("td"), m = document.createElement("input");
      m.type = "color", m.value = r.color(c.name), m.disabled = !i, m.setAttribute("aria-label", "Wire color for " + c.displayName), m.onchange = () => {
        r.set([c.name], m.value), a();
      }, y.append(m);
      const E = document.createElement("td");
      return E.textContent = c.terminals.map((v) => v.component + "." + v.pin).join(", "), g.append(b, N, y, E), g;
    })), d();
  }
  function a() {
    for (const c of n) r.color(c.name);
    f(), l(), e(r, n);
  }
  t("node-search").oninput = f, t("node-all").onchange = () => {
    for (const c of s()) t("node-all").checked ? o.add(c.name) : o.delete(c.name);
    f();
  }, t("node-auto").onchange = () => {
    r.auto = t("node-auto").checked, a();
  }, t("node-apply").onclick = () => {
    r.set(o, t("node-color").value), a();
  }, t("node-clear").onclick = () => {
    r.set(o, Ve), a();
  }, t("node-reset").onclick = () => {
    r.reset(), a();
  }, t("node-swatches").replaceChildren(...it.map((c) => {
    const g = document.createElement("button");
    return g.type = "button", g.style.backgroundColor = c, g.title = c, g.setAttribute("aria-label", "Apply palette color " + c), g.onclick = () => {
      o.size && (t("node-color").value = c, r.set(o, c), a());
    }, g;
  }));
  function h(c) {
    i = c;
    for (const g of t("node-panel").querySelectorAll("input,button")) g.disabled = !i;
    d();
  }
  return { setCircuit(c, g) {
    const b = r.sourceId;
    r.setSource(g), b !== r.sourceId && o.clear(), n = Object.values(c?.nodes || {});
    const w = new Set(n.map((N) => N.name));
    for (const N of o) w.has(N) || o.delete(N);
    for (const N of n) r.color(N.name);
    i = !!c, f(), h(i), l(), e(r, n);
  }, setEnabled: h };
}
function pn(t) {
  const e = (p) => t.querySelector("#spice-" + p), r = new AbortController(), o = r.signal, n = { editor: e("editor-panel"), info: e("info-panel") }, i = Object.fromEntries(Object.keys(n).map((p) => [p, t.querySelector(`[data-window-handle="${p}"]`)])), l = { editor: !0, info: !0 }, s = { editor: !0, info: !0 }, d = [], f = { editor: {}, info: {} }, a = [];
  let h = !1, c = !1, g = null, b = null, w = null, N = null;
  function y(p, k) {
    if (s[p] = k, n[p].dataset.pinned = String(k), e("pin-" + p).setAttribute("aria-pressed", String(k)), k) for (const P of ["left", "top", "right", "bottom", "width", "height"]) n[p].style.removeProperty(P);
  }
  for (const p of Object.keys(n)) y(p, !0);
  const m = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: h, panels: { ...l } } })), E = (p, k, P, T = {}) => p.addEventListener(k, P, { ...T, signal: o });
  function v(p, k) {
    l[p] = k, n[p].hidden = h && !k, e("show-" + p).setAttribute("aria-expanded", String(k)), m();
  }
  function A(p) {
    const k = document.createComment("workspace return");
    p.before(k), d.push({ node: p, anchor: k }), e("info-content").prepend(p);
  }
  function x(p) {
    const k = p.getBoundingClientRect(), P = t.getBoundingClientRect();
    return { x: k.left - P.left, y: k.top - P.top, w: k.width, h: k.height, width: P.width, height: P.height };
  }
  function I(p, k, P) {
    const T = x(p), F = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, Q = Math.max(8, Math.min(k, T.width - T.w - 8)), V = Math.max(8, Math.min(F, T.height - T.h - 8)), z = Math.max(V, Math.min(P, T.height - T.h - 8));
    p.style.left = Math.round(Q) + "px", p.style.top = Math.round(z) + "px", p.style.right = "auto", p.style.bottom = "auto";
  }
  function L() {
    if (h) {
      for (const [p, k] of Object.entries(n)) if (!k.hidden && !s[p]) {
        const P = x(k);
        I(k, P.x, P.y);
      }
    }
  }
  function u() {
    for (const p of Object.values(n))
      for (const k of ["left", "top", "right", "bottom", "width", "height", "z-index"]) p.style.removeProperty(k);
    for (const p of Object.keys(n))
      y(p, !0), v(p, !0);
    requestAnimationFrame(L);
  }
  function _() {
    if (!h) {
      h = !0, g = document.activeElement, b = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, N = document.createComment("workspace mount"), t.before(N), document.body.append(t);
      for (const p of document.body.children) p !== t && (a.push({ node: p, inert: p.inert }), p.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const p of Object.keys(n))
        f[p].base = n[p].style.cssText, f[p].floating && (n[p].style.cssText = f[p].floating), n[p].setAttribute("role", "dialog"), n[p].setAttribute("aria-modal", "false"), n[p].setAttribute("aria-labelledby", "spice-" + p + "-title"), i[p].tabIndex = 0, i[p].title = "Drag to move; arrow keys move the window", v(p, l[p]);
      for (const p of ["selection-actions", "selection", "edit-help", "hierarchy-panel"]) A(e(p));
      requestAnimationFrame(L), e("exit-fullscreen").focus({ preventScroll: !0 }), m();
    }
  }
  function R() {
    if (h) {
      h = !1, w = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: p, anchor: k } of d.splice(0))
        k.before(p), k.remove();
      for (const p of Object.keys(n)) {
        f[p].floating = n[p].style.cssText, n[p].style.cssText = f[p].base, n[p].hidden = !1;
        for (const k of ["role", "aria-modal", "aria-labelledby"]) n[p].removeAttribute(k);
        i[p].removeAttribute("tabindex"), i[p].removeAttribute("title");
      }
      N && (N.before(t), N.remove(), N = null);
      for (const { node: p, inert: k } of a.splice(0)) p.inert = k;
      b && (document.documentElement.style.overflow = b.html, document.body.style.overflow = b.body, window.scrollTo(b.x, b.y)), g?.focus?.({ preventScroll: !0 }), m();
    }
  }
  async function j() {
    _(), t.dataset.nativeFullscreen = "false";
  }
  async function B() {
    if (c = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        c = !0;
        return;
      }
    R();
  }
  E(e("fullscreen"), "click", () => h ? B() : j()), E(e("exit-fullscreen"), "click", B), E(e("reset-windows"), "click", u);
  for (const p of Object.keys(n)) {
    E(e("pin-" + p), "click", () => {
      const T = x(n[p]);
      y(p, !s[p]), s[p] || (n[p].style.width = T.w + "px", n[p].style.height = T.h + "px", I(n[p], T.x, T.y)), m();
    }), E(e("show-" + p), "click", () => {
      v(p, !l[p]), requestAnimationFrame(L);
    }), E(e("close-" + p), "click", () => {
      v(p, !1), e("show-" + p).focus({ preventScroll: !0 });
    }), E(n[p], "pointerdown", () => {
      if (h) {
        for (const T of Object.values(n)) T.style.zIndex = "20";
        n[p].style.zIndex = "30";
      }
    }, { capture: !0 });
    const k = i[p];
    E(k, "pointerdown", (T) => {
      if (!h || T.button !== 0 || T.target.closest("button,input,select,textarea,a,label")) return;
      T.preventDefault();
      const F = x(n[p]);
      y(p, !1), n[p].style.width = F.w + "px", n[p].style.height = F.h + "px", I(n[p], F.x, F.y), w = { id: p, pointer: T.pointerId, x: T.clientX, y: T.clientY, left: F.x, top: F.y }, k.setPointerCapture(T.pointerId);
    }), E(k, "pointermove", (T) => {
      w?.id === p && w.pointer === T.pointerId && I(n[p], w.left + T.clientX - w.x, w.top + T.clientY - w.y);
    });
    const P = () => {
      w = null;
    };
    E(k, "pointerup", P), E(k, "pointercancel", P), E(k, "lostpointercapture", P), E(k, "keydown", (T) => {
      if (!h || T.target !== k || !T.key.startsWith("Arrow")) return;
      T.preventDefault();
      const F = x(n[p]), Q = T.shiftKey ? 32 : 8;
      y(p, !1), n[p].style.width = F.w + "px", n[p].style.height = F.h + "px", I(n[p], F.x + ({ ArrowLeft: -Q, ArrowRight: Q }[T.key] || 0), F.y + ({ ArrowUp: -Q, ArrowDown: Q }[T.key] || 0));
    });
  }
  E(document, "fullscreenchange", () => {
    h && c && document.fullscreenElement !== t && (c = !1, R());
  }), E(document, "keydown", (p) => {
    h && p.altKey && p.key === "Escape" && (p.preventDefault(), p.stopImmediatePropagation(), B());
  }, { capture: !0 }), E(window, "resize", L);
  const W = new ResizeObserver(L);
  for (const p of Object.values(n)) W.observe(p);
  return { enter: j, exit: B, showPanel: v, reset: u, destroy() {
    B(), r.abort(), W.disconnect();
  } };
}
const Z = 1e-3, q = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), Y = (t, e) => Math.abs(t - e) < Z, ie = (t, e) => Y(e.a.x, e.b.x) ? Y(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - Z && t.y <= Math.max(e.a.y, e.b.y) + Z : Y(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - Z && t.x <= Math.max(e.a.x, e.b.x) + Z, hn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), mn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + Z && Math.min(t.a.x, t.b.x) < e.x + e.width - Z && Math.max(t.a.y, t.b.y) > e.y + Z && Math.min(t.a.y, t.b.y) < e.y + e.height - Z;
function Ae(t) {
  const e = [];
  for (const r of t)
    if (!(e.length && q(e.at(-1)) === q(r))) {
      for (; e.length > 1 && (Y(e.at(-2).x, e.at(-1).x) && Y(e.at(-1).x, r.x) || Y(e.at(-2).y, e.at(-1).y) && Y(e.at(-1).y, r.y)); ) e.pop();
      e.push({ ...r });
    }
  return e;
}
class gn {
  constructor(e, { step: r = 8, segments: o = e.segments } = {}) {
    this.step = r, this.components = structuredClone(e.components), this.segments = structuredClone(o), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
  }
  pins() {
    return this.pinCache || (this.pinCache = this.components.flatMap((e) => e.ports.map((r) => ({ ...r, owner: e.id, id: e.id + "." + r.pin }))));
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
    return Y(e.x / this.step, Math.round(e.x / this.step)) && Y(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, r) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !Y(e.a.x, e.b.x) && !Y(e.a.y, e.b.y)) return !1;
    const o = this.pins();
    if (o.some((n) => n.bit !== r && ie(n, e)) || this.segments.some((n) => n.bit !== r && (ie(e.a, n) || ie(e.b, n) || ie(n.a, e) || ie(n.b, e)))) return !1;
    for (const n of this.components) if (mn(e, n) && !o.filter((l) => l.owner === n.id && l.bit === r).some((l) => l.side === "NORTH" ? Y(e.a.x, l.x) && Y(e.b.x, l.x) && Math.max(e.a.y, e.b.y) <= l.y + Z : l.side === "SOUTH" ? Y(e.a.x, l.x) && Y(e.b.x, l.x) && Math.min(e.a.y, e.b.y) >= l.y - Z : l.side === "WEST" ? Y(e.a.y, l.y) && Y(e.b.y, l.y) && Math.max(e.a.x, e.b.x) <= l.x + Z : l.side === "EAST" ? Y(e.a.y, l.y) && Y(e.b.y, l.y) && Math.min(e.a.x, e.b.x) >= l.x - Z : !1))
      return !1;
    return !0;
  }
  addPath(e, r) {
    const o = Ae(r), n = o.slice(1).map((i, l) => ({ bit: e, a: o[l], b: i })).filter((i) => hn(i) > Z);
    if (!n.length) return !1;
    if (n.some((i) => !this.validSegment(i, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...n), !0;
  }
  move(e, r, o) {
    if (r = Math.round(r / this.step) * this.step, o = Math.round(o / this.step) * this.step, !r && !o) return;
    const n = this.snapshot(), i = this.components.find((d) => d.id === e);
    if (!i) return;
    const l = i.ports.map((d) => ({ ...d }));
    this.segments = this.segments.filter((d) => !l.some((f) => f.bit === d.bit && (q(f) === q(d.a) || q(f) === q(d.b)))), i.x += r, i.y += o;
    for (const d of i.ports)
      d.x += r, d.y += o;
    if (this.pinCache = null, this.components.some((d) => d !== i && i.x < d.x + d.width - Z && i.x + i.width > d.x + Z && i.y < d.y + d.height - Z && i.y + i.height > d.y + Z) || this.segments.some((d) => !this.validSegment(d, d.bit)) || i.ports.some((d) => this.pins().some((f) => f.owner !== e && f.bit !== d.bit && q(f) === q(d))))
      throw this.restore(n), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(n);
  }
  transform(e, r) {
    const o = this.components.find((c) => c.id === e);
    if (!o) return;
    const n = this.snapshot(), i = o.width, l = o.height, s = r === "rotate" ? [0, 1, -1, 0, l, 0] : r === "mirror-x" ? [1, 0, 0, -1, 0, l] : r === "mirror-y" ? [-1, 0, 0, 1, i, 0] : null;
    if (!s) throw Error("Unknown transform.");
    const d = o.ports.map((c) => ({ ...c })), f = (c) => ({ x: s[0] * c.x + s[2] * c.y + s[4], y: s[1] * c.x + s[3] * c.y + s[5] });
    this.segments = this.segments.filter((c) => !d.some((g) => g.bit === c.bit && (q(g) === q(c.a) || q(g) === q(c.b))));
    const a = r === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : r === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const c of o.ports) {
      const g = f({ x: c.x - o.x, y: c.y - o.y });
      c.x = o.x + g.x, c.y = o.y + g.y, c.side = a[c.side] || c.side;
    }
    const h = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [s[0] * h[0] + s[2] * h[1], s[1] * h[0] + s[3] * h[1], s[0] * h[2] + s[2] * h[3], s[1] * h[2] + s[3] * h[3], s[0] * h[4] + s[2] * h[5] + s[4], s[1] * h[4] + s[3] * h[5] + s[5]], r === "rotate" && (o.width = l, o.height = i), this.pinCache = null, o.ports.some((c) => !this.onGrid(c)) || this.components.some((c) => c !== o && o.x < c.x + c.width - Z && o.x + o.width > c.x + Z && o.y < c.y + c.height - Z && o.y + o.height > c.y + Z) || this.segments.some((c) => !this.validSegment(c, c.bit)) || o.ports.some((c) => this.pins().some((g) => g.owner !== e && g.bit !== c.bit && q(g) === q(c))))
      throw this.restore(n), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(n);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const o of this.pins())
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).pins.push(o);
    for (const o of this.segments)
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).segments.push(o);
    const r = [];
    for (const [o, n] of e) {
      const i = /* @__PURE__ */ new Map(), l = (a) => {
        i.has(q(a)) || i.set(q(a), a);
      };
      n.pins.forEach(l);
      for (const a of n.segments)
        l(a.a), l(a.b);
      for (let a = 0; a < n.segments.length; a++) for (let h = a + 1; h < n.segments.length; h++) {
        const c = n.segments[a], g = n.segments[h];
        if (Y(c.a.x, c.b.x) === Y(g.a.x, g.b.x)) continue;
        const b = Y(c.a.x, c.b.x) ? c : g, w = b === c ? g : c, N = { x: b.a.x, y: w.a.y };
        ie(N, b) && ie(N, w) && l(N);
      }
      const s = new Map([...i.keys()].map((a) => [a, a])), d = (a) => {
        let h = a;
        for (; s.get(h) !== h; ) h = s.get(h);
        for (; a !== h; ) {
          const c = s.get(a);
          s.set(a, h), a = c;
        }
        return h;
      };
      for (const a of n.segments) {
        const h = [...i.values()].filter((c) => ie(c, a));
        for (const c of h.slice(1)) s.set(d(q(c)), d(q(h[0])));
      }
      const f = /* @__PURE__ */ new Map();
      for (const a of n.pins) {
        const h = d(q(a));
        f.has(h) || f.set(h, { pins: [], points: [] }), f.get(h).pins.push(a);
      }
      for (const a of i.values()) {
        const h = d(q(a));
        f.has(h) && f.get(h).points.push(a);
      }
      r.push({ bit: o, islands: [...f.values()], points: [...i.values()], segments: n.segments });
    }
    return this.cache = r, r;
  }
  airwires() {
    const e = [];
    for (const { bit: r, islands: o } of this.connectivity()) {
      if (o.length < 2) continue;
      const n = /* @__PURE__ */ new Set([0]);
      for (; n.size < o.length; ) {
        let i;
        for (const l of n) for (let s = 0; s < o.length; s++) if (!n.has(s)) for (const d of o[l].points) for (const f of o[s].points) {
          const a = (d.x - f.x) ** 2 + (d.y - f.y) ** 2;
          (!i || a < i.d) && (i = { bit: r, a: d, b: f, d: a, j: s });
        }
        e.push(i), n.add(i.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], r = [-20, this.base.height + 20];
    for (const i of this.components)
      e.push(i.x - 20, i.x + i.width + 20), r.push(i.y - 20, i.y + i.height + 20);
    for (const i of this.segments)
      e.push(i.a.x - 20, i.b.x + 20), r.push(i.a.y - 20, i.b.y + 20);
    const o = Math.min(...e), n = Math.min(...r);
    return { x: o, y: n, w: Math.max(...e) - o, h: Math.max(...r) - n };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((r) => !r.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, r, o) {
    if (!this.onGrid(r) || !this.onGrid(o)) return null;
    const n = (A) => A.slice(1).every((x, I) => this.validSegment({ a: A[I], b: x }, e));
    for (const A of [[r, o], [r, { x: o.x, y: r.y }, o], [r, { x: r.x, y: o.y }, o]]) {
      const x = Ae(A);
      if (n(x)) return x;
    }
    const i = this.step, l = this.bounds(), s = Math.floor(Math.min(l.x, r.x, o.x) / i) - 5, d = Math.ceil(Math.max(l.x + l.w, r.x, o.x) / i) + 5, f = Math.floor(Math.min(l.y, r.y, o.y) / i) - 5, a = Math.ceil(Math.max(l.y + l.h, r.y, o.y) / i) + 5, h = { x: r.x / i, y: r.y / i, dir: -1, cost: 0, key: r.x / i + "," + r.y / i + ",-1" }, c = [h], g = /* @__PURE__ */ new Map([[h.key, 0]]), b = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map([[h.key, h]]), N = [[1, 0], [-1, 0], [0, 1], [0, -1]], y = (A) => Math.abs(A.x - o.x / i) + Math.abs(A.y - o.y / i);
    let m = null, E = 0;
    for (; c.length && E++ < 3e4; ) {
      let A = 0;
      for (let I = 1; I < c.length; I++) c[I].cost + y(c[I]) < c[A].cost + y(c[A]) && (A = I);
      const x = c.splice(A, 1)[0];
      if (x.cost === g.get(x.key)) {
        if (x.x === o.x / i && x.y === o.y / i) {
          m = x;
          break;
        }
        for (let I = 0; I < 4; I++) {
          const L = x.x + N[I][0], u = x.y + N[I][1];
          if (L < s || L > d || u < f || u > a) continue;
          const _ = { x: L, y: u, dir: I, key: L + "," + u + "," + I, cost: x.cost + 1 + (x.dir !== -1 && x.dir !== I ? 3 : 0) };
          _.cost >= (g.get(_.key) ?? 1 / 0) || !this.validSegment({ a: { x: x.x * i, y: x.y * i }, b: { x: L * i, y: u * i } }, e) || (g.set(_.key, _.cost), b.set(_.key, x.key), w.set(_.key, _), c.push(_));
        }
      }
    }
    if (!m) return null;
    const v = [];
    for (let A = m; A; A = w.get(b.get(A.key))) v.push({ x: A.x * i, y: A.y * i });
    return Ae(v.reverse());
  }
  async autoRoute(e = () => !1) {
    const r = this.snapshot();
    if (this.remember(r), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const o = /* @__PURE__ */ new Set();
    let n = 0;
    for (; !e() && n++ < Math.max(20, this.pins().length * 2); ) {
      const i = this.airwires().find((s) => !o.has(s.bit + ":" + q(s.a) + ":" + q(s.b)));
      if (!i) break;
      const l = this.findPath(i.bit, i.a, i.b);
      l ? (this.segments.push(...l.slice(1).map((s, d) => ({ bit: i.bit, a: l[d], b: s }))), this.cache = null) : o.add(i.bit + ":" + q(i.a) + ":" + q(i.b)), n % 3 === 0 && await new Promise((s) => setTimeout(s, 0));
    }
    this.redoStack = [];
  }
}
const bn = "http://www.w3.org/2000/svg", ee = (t, e = {}) => {
  const r = document.createElementNS(bn, t);
  for (const [o, n] of Object.entries(e)) r.setAttribute(o, n);
  return r;
}, yn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function wn(t, e, { changed: r, inspect: o, getNetColor: n }) {
  let i = null, l = null, s = !1, d = !1, f = null, a = null, h = -1, c = "", g = 0, b = "", w = 8, N = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map();
  const E = (p) => {
    const k = l.getScreenCTM();
    return i.snap(new DOMPoint(p.clientX, p.clientY).matrixTransform(k.inverse()));
  }, v = (p) => n?.(p) || ke[Number(p) % ke.length], A = (p) => {
    e("editor-status").textContent = p;
  };
  function x() {
    return { unrouted: i?.airwires().length || 0, wires: i?.segments.length || 0, editing: s, routing: d };
  }
  function I() {
    const p = !!i;
    for (const k of ["interactive", "flywire", "auto-route"]) e(k).disabled = !l || d;
    e("edit-tool").disabled = !p || d;
    for (const k of document.querySelectorAll("[data-editor-mode]"))
      k.disabled = !l || d, k.setAttribute("aria-pressed", String(s && k.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !p || d || !i.undoStack.length, e("wire-redo").disabled = !p || d || !i.redoStack.length, t.classList.toggle("spice-editing", s);
  }
  function L(p, k) {
    const P = m.get(p.id);
    if (P && (k.replaceChildren(...P.children.map((T) => T.cloneNode(!0))), p.editorMatrix)) {
      const T = p.editorMatrix, F = ee("g", { transform: "matrix(" + T.join(" ") + ")", "data-editor-glyph": "true" });
      F.append(...k.childNodes);
      for (const Q of F.querySelectorAll("text")) Q.remove();
      k.append(F);
      for (const [Q, V] of P.labels.entries()) {
        const z = V.node.cloneNode(!0);
        z.removeAttribute("transform");
        let K = T[0] * V.x + T[2] * V.y + T[4], C = T[1] * V.x + T[3] * V.y + T[5];
        if (p.ports.length === 2 && P.labels.length === 2) {
          const O = Math.abs(p.ports[0].y - p.ports[1].y) < 1e-3;
          K = O ? p.width / 2 : p.ports[0].x - p.x + 20, C = O ? p.ports[0].y - p.y - 26 + Q * 16 : p.height / 2 - 8 + Q * 16, z.setAttribute("text-anchor", O ? "middle" : "start");
        }
        z.setAttribute("x", K), z.setAttribute("y", C), k.append(z);
      }
    }
  }
  function u(p) {
    if (f = null, ["rotate", "mirror-x", "mirror-y"].includes(p) && c) {
      try {
        i.transform(c, p), j();
      } catch (k) {
        A(k.message);
      }
      return;
    }
    e("edit-tool").value = p, R(), I();
  }
  function _() {
    if (!i) return;
    const p = x();
    A(`${p.unrouted} connection${p.unrouted === 1 ? "" : "s"} unrouted · ${p.wires} wire segments${d ? " · Auto-routing…" : ""}`), I(), r(i.drawing(), p, i.bounds()), y.set(b, i.snapshot()), y.size > 20 && y.delete(y.keys().next().value);
  }
  function R(p = null) {
    if (l?.querySelector("[data-route-preview]")?.remove(), !f || !l) return;
    const k = [...f.points];
    if (p) {
      const F = k.at(-1);
      k.push({ x: p.x, y: F.y }, p);
    }
    const P = ee("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    P.append(ee("polyline", { points: k.map((F) => F.x + "," + F.y).join(" "), fill: "none", stroke: v(f.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), l.append(P);
    const T = l.querySelector("[data-airwires]");
    T && l.append(T);
  }
  function j() {
    if (!l || !i) return;
    for (const Q of l.querySelectorAll("[data-editor-body-hit]")) Q.remove();
    for (const Q of [...l.children]) (Q.hasAttribute("data-editor-overlay") || Q.hasAttribute("data-airwires") || Q.hasAttribute("data-manual-state") || Q.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(Q.localName)) && Q.remove();
    for (const Q of i.components) {
      const V = l.getElementById("cell_" + Q.id);
      V && (L(Q, V), V.setAttribute("transform", `translate(${Q.x},${Q.y})`), V.dataset.editorComponent = Q.id, s && V.prepend(ee("rect", { x: 0, y: 0, width: Q.width, height: Q.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const p = l.querySelector('g[id^="cell_"]'), k = ee("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), P = ee("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [Q, V] of i.segments.entries()) {
      const z = ee("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, class: "net_" + V.bit, "data-net": N.get(V.bit) || String(V.bit), "stroke-width": Q === h ? 2.8 : 1.4 });
      z.append(ee("title")), z.firstChild.textContent = "Node " + (N.get(V.bit) || V.bit), l.insertBefore(z, p), s && k.append(ee("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, "data-editor-wire": Q, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const Q of i.connectivity()) for (const V of Q.points) {
      const z = /* @__PURE__ */ new Set();
      for (const K of Q.segments) ie(V, K) && (Math.min(K.a.x, K.b.x) < V.x - 1e-3 && z.add("w"), Math.max(K.a.x, K.b.x) > V.x + 1e-3 && z.add("e"), Math.min(K.a.y, K.b.y) < V.y - 1e-3 && z.add("n"), Math.max(K.a.y, K.b.y) > V.y + 1e-3 && z.add("s"));
      (z.size >= 3 || z.size >= 2 && Q.islands.some((K) => K.pins.some((C) => yn(V, C)))) && l.insertBefore(ee("circle", { cx: V.x, cy: V.y, r: 2, class: "net_" + Q.bit, "data-net": N.get(Q.bit) || String(Q.bit), fill: v(Q.bit) }), p);
    }
    if (s) {
      const Q = i.components.find((V) => V.id === c);
      Q && k.append(ee("rect", { x: Q.x - 3, y: Q.y - 3, width: Q.width + 6, height: Q.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const V of i.pins()) {
        const z = ee("circle", { cx: V.x, cy: V.y, r: 3, "data-editor-pin": V.id, "data-editor-bit": V.bit, fill: "#fff", stroke: v(V.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": V.owner + " " + V.pin }), K = ee("title");
        K.textContent = V.id + " · " + (N.get(V.bit) || V.bit), z.append(K), P.append(z);
      }
      l.append(k, P);
    }
    R();
    const T = ee("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const Q of i.airwires()) T.append(ee("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, stroke: v(Q.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": Q.bit, "data-from-owner": Q.a.owner || "", "data-to-owner": Q.b.owner || "" }));
    l.append(T);
    const F = ee("metadata", { "data-manual-state": "true" });
    F.textContent = JSON.stringify({ version: 1, grid: w, unrouted: i.airwires().length, manual: !0 }), l.insertBefore(F, T), _();
  }
  function B(p, k) {
    if (!f) {
      f = { bit: k, points: [p] }, R(), A("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (k !== void 0 && f.bit !== k) {
      A("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const P = f.points.at(-1), T = i.findPath(f.bit, P, p);
    if (!T) {
      A("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (k === void 0) {
      f.points.push(...T.slice(1)), R();
      return;
    }
    try {
      i.addPath(k, [...f.points, ...T.slice(1)]), f = null, j();
    } catch (F) {
      A(F.message);
    }
  }
  t.addEventListener("pointerdown", (p) => {
    if (!s || d || !i || !l || p.button !== 0 || p.shiftKey) return;
    const k = p.target.closest("[data-editor-pin]"), P = p.target.closest("[data-editor-wire]"), T = p.target.closest("[data-editor-component]");
    if (!(!k && !P && !T && !f)) {
      if (p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), k) {
        const F = i.pins().find((Q) => Q.id === k.dataset.editorPin);
        e("edit-tool").value = "route", I(), B({ x: F.x, y: F.y }, F.bit);
        return;
      }
      if (P) {
        const F = +P.dataset.editorWire, Q = i.segments[F];
        if (e("edit-tool").value === "erase" && !f) {
          i.remove(F), h = -1, j();
          return;
        }
        if (f || e("edit-tool").value === "route") {
          const V = E(p);
          B(Q.a.x === Q.b.x ? { x: Q.a.x, y: V.y } : { x: V.x, y: Q.a.y }, Q.bit);
        } else
          h = F, j(), A("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (f) {
        B(E(p));
        return;
      }
      if (T) {
        const F = T.dataset.editorComponent, Q = i.components.find((V) => V.id === F);
        if (!Q) return;
        if (c = F, h = -1, o?.(F), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          u(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          j();
          return;
        }
        a = { id: F, n: Q, element: T, x: p.clientX, y: p.clientY, start: E(p), dx: 0, dy: 0 }, T.style.opacity = ".6", t.setPointerCapture(p.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (p) => {
    if (!(!s || !i || !l)) {
      if (a) {
        p.stopImmediatePropagation();
        const k = E(p);
        a.dx = k.x - a.start.x, a.dy = k.y - a.start.y, a.element.setAttribute("transform", `translate(${a.n.x + a.dx},${a.n.y + a.dy})`);
        for (const P of l.querySelectorAll("[data-airwires] line"))
          P.dataset.fromOwner === a.id && (P.setAttribute("x1", +P.getAttribute("x1") - Number(P.dataset.dx || 0) + a.dx), P.setAttribute("y1", +P.getAttribute("y1") - Number(P.dataset.dy || 0) + a.dy)), P.dataset.toOwner === a.id && (P.setAttribute("x2", +P.getAttribute("x2") - Number(P.dataset.dx || 0) + a.dx), P.setAttribute("y2", +P.getAttribute("y2") - Number(P.dataset.dy || 0) + a.dy)), P.dataset.dx = a.dx, P.dataset.dy = a.dy;
        return;
      }
      f && R(E(p));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (p) => {
    if (!a) return;
    p.preventDefault(), p.stopImmediatePropagation();
    const k = a;
    a = null, k.element.style.opacity = "", t.hasPointerCapture(p.pointerId) && t.releasePointerCapture(p.pointerId);
    try {
      i.move(k.id, k.dx, k.dy), h = -1, j();
    } catch (P) {
      j(), A(P.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    a && (a.element.style.opacity = "", a = null, j());
  }), document.addEventListener("keydown", (p) => {
    if (!s || !i || d || p.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(p.target)) return;
    const k = p.target.closest("[data-editor-pin]"), P = p.key.toLowerCase();
    if (k && (p.key === "Enter" || p.key === " ")) {
      p.preventDefault(), p.stopImmediatePropagation();
      const T = i.pins().find((F) => F.id === k.dataset.editorPin);
      B({ x: T.x, y: T.y }, T.bit);
      return;
    }
    p.key === "Escape" ? (p.preventDefault(), p.stopImmediatePropagation(), f = null, u("move"), j()) : (p.key === "Delete" || p.key === "Backspace") && h >= 0 ? (p.preventDefault(), p.stopImmediatePropagation(), i.remove(h), h = -1, j()) : (p.ctrlKey || p.metaKey) && P === "z" ? (p.preventDefault(), p.stopImmediatePropagation(), p.shiftKey ? i.redo() : i.undo(), f = null, j()) : !p.ctrlKey && !p.metaKey && !p.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[P] && (p.preventDefault(), p.stopImmediatePropagation(), u({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[P]));
  }, { capture: !0 });
  async function W() {
    if (!i || d) return;
    const p = g;
    d = !0, _(), A("Auto-routing remaining connections…");
    try {
      await i.autoRoute(() => p !== g), p === g && (f = null, h = -1, d = !1, j());
    } catch (k) {
      p === g && (d = !1, j(), A(k.message));
    }
  }
  return {
    mount(p, k, P, T, F, { reset: Q = !1 } = {}) {
      g++, d = !1, l = p, f = null, a = null, h = -1, c = "", m = /* @__PURE__ */ new Map();
      for (const C of l.querySelectorAll('g[id^="cell_"]')) {
        const O = C.getCTM().inverse();
        m.set(C.id.slice(5), { children: [...C.childNodes].map((D) => D.cloneNode(!0)), labels: [...C.querySelectorAll("text")].map((D) => {
          const G = new DOMPoint(+D.getAttribute("x") || 0, +D.getAttribute("y") || 0).matrixTransform(O.multiply(D.getCTM()));
          return { node: D.cloneNode(!0), x: G.x, y: G.y };
        }) });
      }
      if (w = F.gridSize || 0, N = new Map(Object.values(P.nodes).map((C) => [C.bit, C.name])), !k || !w) {
        i = null, I();
        return;
      }
      const V = structuredClone(k);
      for (const C of V.components) {
        const O = l.getElementById("cell_" + C.id);
        for (const D of C.ports) {
          const G = [...O.children].find((H) => H.getAttribute("s:pid") === D.pin);
          D.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[G?.getAttribute("s:position")] || D.side;
        }
      }
      for (const [C, O] of Object.entries(T.modules.circuit.cells)) if (O.attributes.name === "0") {
        const D = l.getElementById("cell_" + C), G = D?.transform.baseVal.consolidate().matrix;
        D && G && V.components.push({ id: C, decoration: !0, x: G.e, y: G.f, width: +D.getAttribute("s:width"), height: +D.getAttribute("s:height"), ports: [...D.children].filter((H) => H.hasAttribute("s:pid")).map((H) => ({ pin: H.getAttribute("s:pid"), x: G.e + Number(H.getAttribute("s:x")), y: G.f + Number(H.getAttribute("s:y")), bit: O.connections[H.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const z = new Map(Object.values(P.nodes).map((C) => [C.name, C.bit])), K = [...l.children].filter((C) => C.localName === "line" && C.hasAttribute("data-net")).map((C) => ({ bit: z.get(C.dataset.net), a: { x: +C.getAttribute("x1"), y: +C.getAttribute("y1") }, b: { x: +C.getAttribute("x2"), y: +C.getAttribute("y2") } }));
      i = new gn(V, { step: w, segments: K }), b = JSON.stringify([P.topology.signature, F]), !Q && y.has(b) ? i.restore(y.get(b)) : e("flywire").checked && i.clear(), s = e("interactive").checked, s || !Q && y.has(b) || e("flywire").checked ? j() : I();
    },
    invalidate() {
      g++, d = !1, i = null, l = null, f = null, a = null, I();
    },
    setEnabled(p) {
      s = p, p || (f = null), i ? j() : I();
    },
    clear() {
      i && (i.clear(), f = null, j());
    },
    autoRoute: W,
    chooseTool: u,
    undo() {
      i && (f = null, i.undo(), j());
    },
    redo() {
      i && (f = null, i.redo(), j());
    },
    complete() {
      return !i || !d && i.airwires().length === 0;
    },
    working() {
      return d;
    },
    stats: x,
    canEdit() {
      return !!i;
    },
    refreshColors() {
      if (l) {
        for (const p of l.querySelectorAll("[data-air-net]")) p.setAttribute("stroke", v(+p.dataset.airNet));
        for (const p of l.querySelectorAll("[data-editor-bit]")) p.setAttribute("stroke", v(+p.dataset.editorBit));
      }
    },
    cleanExport(p) {
      for (const k of p.querySelectorAll("[data-editor-overlay],[data-route-preview]")) k.remove();
      for (const k of p.querySelectorAll("[data-editor-component]"))
        k.removeAttribute("data-editor-component"), k.style.removeProperty("opacity");
    }
  };
}
const _e = "http://www.w3.org/2000/svg";
function Le(t, e, r = !0, o = null) {
  let n = t.querySelector("defs[data-coordinate-grid]"), i = t.querySelector("rect[data-coordinate-grid]");
  if (!n) {
    n = document.createElementNS(_e, "defs"), n.dataset.coordinateGrid = "true";
    const f = document.createElementNS(_e, "pattern");
    f.id = "spice-coordinate-grid", f.setAttribute("patternUnits", "userSpaceOnUse");
    const a = document.createElementNS(_e, "path");
    a.setAttribute("fill", "none"), a.setAttribute("stroke", "#737b83"), a.setAttribute("stroke-opacity", ".23"), a.setAttribute("stroke-width", ".55"), a.setAttribute("vector-effect", "non-scaling-stroke"), f.append(a), n.append(f), i = document.createElementNS(_e, "rect"), i.dataset.coordinateGrid = "true", i.setAttribute("fill", "url(#spice-coordinate-grid)"), i.setAttribute("stroke", "none"), i.setAttribute("pointer-events", "none"), t.prepend(i), t.prepend(n);
  }
  const l = n.firstElementChild, s = e || 8;
  l.setAttribute("width", s), l.setAttribute("height", s), l.firstElementChild.setAttribute("d", `M${s},0 H0 V${s}`), i.setAttribute("visibility", r && e ? "visible" : "hidden");
  const d = o || (() => {
    const f = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    return { x: f[0], y: f[1], w: f[2], h: f[3] };
  })();
  for (const [f, a] of Object.entries({ x: d.x, y: d.y, width: d.w, height: d.h })) i.setAttribute(f, a);
}
const En = `<svg
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
`, xn = `<svg
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
`, vn = `<svg
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
`, _n = `<svg
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
`, Nn = `<svg
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
`, Cn = `<svg
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
`, Sn = `<svg
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
`, kn = `<svg
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
`, In = `<svg
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
`, On = `<svg
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
`, Rn = `<svg
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
`, An = `<svg
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
function Ln(t) {
  const e = { move: En, route: xn, erase: vn, rotate: _n, "mirror-x": Nn, "mirror-y": Cn }, r = { "zoom-in": Sn, "zoom-out": kn, fit: In, "wire-undo": On, "wire-redo": Rn, "auto-route": An }, o = (n, i) => {
    if (!n) return;
    const l = n.title || n.getAttribute("aria-label") || n.textContent;
    n.setAttribute("aria-label", l), n.title = l, n.innerHTML = i, n.firstElementChild.setAttribute("aria-hidden", "true"), n.firstElementChild.setAttribute("focusable", "false"), n.classList.add("spice-icon-button");
  };
  for (const [n, i] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${n}"]`), i);
  for (const [n, i] of Object.entries(r)) o(t.querySelector("#spice-" + n), i);
}
const tt = Ne.filter.source, M = (t) => document.getElementById("spice-" + t), ae = M("app");
if (ae) {
  let u = function() {
    const C = e.querySelector("svg");
    if (!C) return;
    d && un(C, f, d), s?.refreshColors(), Le(C, h?.layout.report?.gridSize || 0, M("show-grid").checked, m);
    const O = C.cloneNode(!0);
    s?.cleanExport(O), O.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), Le(O, h?.layout.report?.gridSize || 0, M("show-grid").checked, E), a = new XMLSerializer().serializeToString(O), M("source").value = a;
  }, j = function(C) {
    const O = M("example-info");
    if (O && (O.replaceChildren(), !!C && (O.append(document.createTextNode(C.description + " ")), C.url))) {
      const D = document.createElement("a");
      D.href = C.url, D.target = "_blank", D.rel = "noopener noreferrer", D.textContent = C.reference, O.append(D);
    }
  }, B = function() {
    s.invalidate(), _.setEnabled(!1), n = null, i = null, a = "", I(), j(Object.values(Ne).find((C) => C.source === t.value)), r.textContent = "Input changed — generate to refresh the schematic.";
  }, W = function(C) {
    o.replaceChildren();
    for (const { severity: O, line: D, message: G, source: H } of C) {
      const $ = document.createElement("li");
      $.className = O, $.textContent = `${O.toUpperCase()}${H && H !== "input.cir" ? " · " + H : ""}${D ? " · line " + D : ""}: ${G}`, o.append($);
    }
    M("messages").open = C.some((O) => O.severity !== "info"), M("message-count").textContent = `${C.length} message${C.length === 1 ? "" : "s"}`;
  }, p = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${m.x} ${m.y} ${m.w} ${m.h}`);
    const C = e.querySelector("svg");
    C && Le(C, h?.layout.report?.gridSize || 0, M("show-grid").checked, m), M("zoom-level").textContent = Math.round(E.w / m.w * 100) + "%";
  }, k = function(C, O = m.x + m.w / 2, D = m.y + m.h / 2) {
    if (!e.querySelector("svg")) return;
    const G = Math.max(0.05, Math.min(10, m.w * C / E.w)) * E.w / m.w;
    m = { x: O + (m.x - O) * G, y: D + (m.y - D) * G, w: m.w * G, h: m.h * G }, p();
  }, T = function(C) {
    const O = new URLSearchParams();
    C && O.set("instance", C);
    const D = O.toString();
    location.hash.slice(1) === D ? (w = C, z()) : location.hash = D;
  }, F = function() {
    w = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, Q = function() {
    const C = !!(N && N !== w && c?.contexts[N]);
    M("selection-actions").hidden = !C, M("open-instance").href = "#" + new URLSearchParams({ instance: N });
  }, V = function() {
    M("breadcrumbs").replaceChildren();
    const C = (D, G) => {
      const H = document.createElement("button");
      H.type = "button", H.textContent = D, H.onclick = () => T(G), H.disabled = G === w, M("breadcrumbs").append(H);
    };
    if (C("Top", ""), w) {
      const D = c.contexts[w].path;
      for (let G = 0; G < D.length; G++) C(D[G], D.slice(0, G + 1).map(encodeURIComponent).join("/"));
    }
    M("instances").replaceChildren();
    const O = (D, G) => {
      for (const H of D.children) {
        const $ = document.createElement("div");
        $.className = "spice-instance-row", $.style.setProperty("--depth", Math.min(G, 8)), $.dataset.instance = H.id;
        const ce = document.createElement("a");
        ce.href = "#" + new URLSearchParams({ instance: H.id }), ce.textContent = H.name + " · " + H.definition, ce.title = "Open " + H.id + " as its own sheet";
        const ue = document.createElement("span");
        if (ue.className = "spice-help", ue.textContent = Object.entries(H.params).map(([fe, se]) => fe + "=" + se).join(" · "), $.append(ce), ue.textContent) {
          const fe = document.createElement("details"), se = document.createElement("summary");
          se.textContent = "Parameters", fe.append(se, ue), $.append(fe);
        }
        M("instances").append($), O(H, G + 1);
      }
    };
    O(c.contexts[w], 0), M("hierarchy-panel").hidden = !c.contexts[w].children.length, M("focus-title").textContent = w ? w + " / " + c.contexts[w].definition : "Top-level schematic", Q();
  };
  Ln(ae), pn(ae);
  const t = M("input"), e = M("preview"), r = M("status"), o = M("diagnostics");
  let n = null, i = null, l = !1, s = null, d = null, f = [], a = "", h, c, g, b = "", w = "", N = "", y = !1, m = { x: 0, y: 0, w: 1, h: 1 }, E = { ...m }, v, A = !1, x = {};
  try {
    x = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ae.addEventListener("click", (C) => {
    y && C.target.closest('a[href^="#"]') && C.preventDefault();
  });
  const I = () => {
    M("copy").disabled = M("download").disabled = !a || y || s?.working(), M("download-asc").disabled = M("download-asc-bundle").disabled = !a || !n || y || l || !s?.complete();
  }, L = () => ({ font: M("font").value, fontSize: Number(M("size").value), color: Ve, gridSize: M("grid").checked && M("conventional").checked ? Number(M("grid-size").value) : 0, detailed: M("detailed").checked, conventional: M("conventional").checked }), _ = fn(M, (C, O) => {
    d = C, f = O, u();
  });
  s = wn(e, M, { getNetColor: (C) => {
    const O = f.find((D) => D.bit === C);
    return O && d && (d.auto || d.manual.has(O.name)) ? d.color(O.name) : null;
  }, inspect: (C) => {
    const O = h?.components.find((D) => D.name === C);
    O && (N = O.instanceId || "", M("selection").textContent = O.raw, Q());
  }, changed: (C, O, D) => {
    n = C, i = null, E = D;
    const G = e.querySelector("svg");
    if (G) {
      G.setAttribute("width", String(E.w)), G.setAttribute("height", String(E.h));
      const H = G.querySelector("#spice-layout-report");
      if (H) {
        const $ = JSON.parse(H.textContent);
        $.manualWiring = O, $.verifiedTerminals = !O.unrouted, $.geometricConnectivityVerified = !O.unrouted, H.textContent = JSON.stringify($);
      }
    }
    h && g && (M("json").value = JSON.stringify({ circuit: h, netlist: Ye(h), hierarchy: g, interactive: { ...O, drawing: C } }, null, 2)), u(), I();
  } }), M("show-grid").onchange = u;
  async function R() {
    (!n || !h?.layout.report?.gridVerified) && (M("grid").checked = !0, M("conventional").checked = !0, await z({ resetEditor: !0 })), s.setEnabled(M("interactive").checked), I();
  }
  M("interactive").onchange = R, M("flywire").onchange = async () => {
    M("interactive").checked = !0, await R(), M("flywire").checked ? s.clear() : await s.autoRoute(), I();
  }, M("auto-route").onclick = async () => {
    M("interactive").checked = !0, await R(), await s.autoRoute(), I();
  }, M("wire-undo").onclick = () => s.undo(), M("wire-redo").onclick = () => s.redo();
  for (const C of ae.querySelectorAll("[data-editor-mode]")) C.onclick = async () => {
    M("interactive").checked = !0, await R(), s.chooseTool(C.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  _.setEnabled(!1), t.value = tt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || tt;
  } catch {
  }
  j(Object.values(Ne).find((C) => C.source === t.value)), t.addEventListener("input", B);
  for (const C of ["font", "size", "detailed", "conventional", "grid", "grid-size"]) M(C).addEventListener("input", B);
  M("zoom-in").onclick = () => k(0.8), M("zoom-out").onclick = () => k(1.25), M("fit").onclick = () => {
    m = { ...E }, p();
  };
  const P = (C) => {
    const O = e.querySelector("svg");
    return O ? new DOMPoint(C.clientX, C.clientY).matrixTransform(O.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (C) => {
    const O = P(C);
    O && (C.preventDefault(), k(C.deltaY > 0 ? 1.12 : 1 / 1.12, O.x, O.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (C) => {
    ![0, 1].includes(C.button) || !e.querySelector("svg") || (v = { start: P(C), x: C.clientX, y: C.clientY, view: { ...m }, moved: !1 }, e.setPointerCapture(C.pointerId));
  }), e.addEventListener("pointermove", (C) => {
    if (!v) return;
    const O = P(C);
    Math.hypot(C.clientX - v.x, C.clientY - v.y) > 4 && (v.moved = !0), m.x += v.start.x - O.x, m.y += v.start.y - O.y, p();
  }), e.addEventListener("pointerup", (C) => {
    if (!v) return;
    const O = v.moved;
    if (v = null, e.hasPointerCapture(C.pointerId) && e.releasePointerCapture(C.pointerId), !O) {
      const D = document.elementFromPoint(C.clientX, C.clientY)?.closest("[data-component]"), G = h?.components.find((H) => H.name === D?.dataset.component);
      G && (N = G.instanceId || "", M("selection").textContent = `${G.raw}
${Object.entries(G.terminals).map(([H, $]) => `${H} → ${$}`).join("   ")}`, G.kind === "X" ? T(G.instanceId) : Q());
    }
  }), window.addEventListener("hashchange", () => {
    if (y) {
      A = !0;
      return;
    }
    F(), N = "", z();
  }), e.addEventListener("pointercancel", () => {
    v = null;
  }), e.addEventListener("keydown", (C) => {
    const O = C.target.closest("[data-instance]");
    if (O && (C.key === "Enter" || C.key === " ")) {
      C.preventDefault(), N = O.dataset.instance, T(N);
      return;
    }
    C.key === "+" || C.key === "=" ? k(0.8) : C.key === "-" ? k(1.25) : C.key.toLowerCase() === "f" ? (m = { ...E }, p()) : C.key.startsWith("Arrow") && (C.preventDefault(), m.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[C.key] || 0) * m.w, m.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[C.key] || 0) * m.h, p());
  });
  async function z({ resetEditor: C = !1 } = {}) {
    if (y) return;
    y = !0, s.invalidate(), _.setEnabled(!1), n = null, i = null, a = "", I(), M("generate").disabled = !0, t.readOnly = !0, M("file").disabled = !0, M("libraries").disabled = !0;
    for (const D of ae.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) D.disabled = !0;
    r.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let O = [];
    try {
      if (b !== t.value || !c) {
        if (g = At(t.value, { files: x }), O = [...g.diagnostics], O.some((U) => U.severity === "error"))
          throw c = null, Error("Fix the parser errors below before generating.");
        c = Qe(g), b && b !== t.value ? (w = "", N = "", history.replaceState(null, "", location.pathname + location.search)) : F(), b = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (O = [...g.diagnostics], W(O), O.some((U) => U.severity === "error")) throw Error("Fix the parser errors below before generating.");
      h = Yt(c, { focus: w });
      for (const U of h.interfaceAliases) O.push({ severity: "info", message: `Instance boundary: ${U.ports.join(" = ")} share parent node ${U.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const D = Ye(h);
      L().conventional && O.push(...h.layout.diagnostics);
      const G = await en(D, L()), H = new DOMParser().parseFromString(G.svg, "image/svg+xml");
      if (H.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const $ = H.documentElement, ce = $.querySelector("#spice-layout-report");
      if (ce) {
        h.layout.report = JSON.parse(ce.textContent);
        const U = h.layout.report;
        if (O.push({ severity: "info", message: `Layout: compact signal flow; ${U.powerSourcesChecked} DC/ground symbols checked, ${U.powerOrderViolations} DC order preference(s) unmet. ${U.powerPass}. ${U.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), U.classicTemplateFallback && O.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), U.groundPlacement && O.push({ severity: "info", message: `Ground: ${U.groundPlacement}; ${U.straightenedGroundDrops || 0} return-path simplification(s).` }), U.explicitGroups && O.push({ severity: "info", message: `Layout comments: ${U.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), U.classicRails && O.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${U.railCount} shared voltage rails.` }), U.localClassicInstances?.length && O.push({ severity: "info", message: `${U.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), U.localClassicStages?.length && O.push({ severity: "info", message: `Classic transistor proximity active: ${U.localClassicStages.join(", ")}.` }), U.sharedClassicRails && O.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), U.mirroredTransistors?.length && O.push({ severity: "info", message: `Control-pin mirror choices: ${U.mirroredTransistors.join(", ")}.` }), U.recognizedMotifs?.length && O.push({ severity: "info", message: `Transistor structures: ${U.recognizedMotifs.map((X) => `${X.kind} (${X.members.join(", ")}; ${X.confidence})`).join("; ")}.` }), U.appliedMotifs?.length && O.push({ severity: "info", message: `Topology preferences applied to ${U.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), U.subnetFirstFallback && O.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + U.subnetFirstFallback }), U.pairCompactionFallback && O.push({ severity: "warning", message: "Pair proximity kept the original regions: " + U.pairCompactionFallback }), U.compoundPairFallback && O.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + U.compoundPairFallback }), U.pairConstraints?.length) {
          const X = U.pairConstraints.filter((oe) => oe.crossRegion && !oe.compacted).length;
          O.push({ severity: "info", message: `${U.pairConstraints.length - X} adjacent transistor pair(s); ${X} cross-region mirror row constraint(s).` });
        }
        U.netShortcuts && O.push({ severity: "info", message: `${U.netShortcuts} safe straight net shortcut(s); ${U.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), U.sharedRailFallback && O.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${U.sharedRailFallback}.` });
        for (const X of U.localClassicFallbacks || []) X.stage && O.push({ severity: "info", message: `Classic stage ${X.stage} uses automatic layout: ${X.reason || "No unobstructed local template"}.` });
        U.geometricConnectivityVerified && O.push({ severity: "info", message: `Net geometry verified; ${U.cyclesRemoved} same-net loop(s) and ${U.leavesRemoved} unused wire branch(es) removed.` }), W(O);
      }
      if ($.localName !== "svg" || $.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const ue = Number($.getAttribute("width")), fe = Number($.getAttribute("height"));
      E = { x: -20, y: -20, w: ue + 40, h: fe + 40 }, m = { ...E }, $.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), $.setAttribute("width", String(E.w)), $.setAttribute("height", String(E.h)), $.setAttribute("role", "img"), $.setAttribute("aria-label", h.title || "SPICE schematic"), $.setAttribute("style", "background:white");
      for (const U of h.components) {
        const X = H.getElementById("cell_" + U.name);
        if (!X) throw Error("Renderer omitted component " + U.name);
        X.setAttribute("data-component", U.name), U.kind === "X" && (X.setAttribute("data-instance", U.instanceId), X.setAttribute("role", "button"), X.setAttribute("tabindex", "0"), X.setAttribute("aria-label", "Open " + U.name));
        const oe = H.createElementNS($.namespaceURI, "title");
        oe.textContent = U.raw + `
Resolved: ` + U.value + `
` + Object.entries(U.terminals).map(([ye, we]) => ye + ": " + we).join(", "), X.prepend(oe);
      }
      for (const U of Object.values(h.nodes))
        for (const X of $.querySelectorAll(".net_" + U.bit)) {
          X.setAttribute("data-net", U.name);
          const oe = H.createElementNS($.namespaceURI, "title");
          oe.textContent = "Node " + U.displayName, X.append(oe);
        }
      const se = h.components.filter((U) => U.kind === "K").map((U) => ({ name: U.name, inductors: U.coupledInductors, value: U.value }));
      if (se.length) {
        const U = H.createElementNS($.namespaceURI, "metadata");
        U.setAttribute("id", "spice-magnetic-couplings"), U.textContent = JSON.stringify(se), $.append(U);
        for (const X of se) for (const oe of X.inductors) {
          const ye = H.getElementById("cell_" + oe);
          if (!ye) continue;
          const we = H.createElementNS($.namespaceURI, "circle"), Ie = [...ye.children].find((Oe) => Oe.getAttribute("s:pid") === "A"), st = Ie?.getAttribute("s:position"), Ge = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[st] || [0, 0];
          for (const [Oe, at] of Object.entries({ cx: Number(Ie?.getAttribute("s:x")) + Ge[0], cy: Number(Ie?.getAttribute("s:y")) + Ge[1], r: 3, fill: L().color, stroke: "none", "data-coupling": X.name })) we.setAttribute(Oe, String(at));
          const Fe = H.createElementNS($.namespaceURI, "title");
          Fe.textContent = X.name + " · dotted terminal: " + X.inductors.join(", "), we.append(Fe), ye.append(we);
        }
      }
      n = G.drawing, a = new XMLSerializer().serializeToString($), M("source").value = a, e.replaceChildren(document.importNode($, !0)), p();
      const Be = O.filter((U) => U.severity === "warning").length;
      r.textContent = `${h.components.filter((U) => !U.synthetic).length} components · ${Object.keys(h.nodes).length} nodes · ${h.topology.leafCount} primitive devices verified${h.interfaceAliases.length ? " · Parent-connected ports: " + h.interfaceAliases.map((U) => U.ports.join(" = ")).join("; ") + "." : ""}${Be ? " · Review " + Be + " warning(s); drawing may be partial." : " · Schematic ready."}`, r.textContent += ` Layout rules v${Te}.`, h.layout.report?.gridVerified && (r.textContent += ` Grid ${h.layout.report.gridSize}.`), h.layout?.report?.powerOrderViolations && (r.textContent += ` Layout: ${h.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), h.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (r.textContent += " Ground marker: routed fallback; no safe short attachment found."), M("json").value = JSON.stringify({ circuit: h, netlist: D, hierarchy: g }, null, 2), _.setCircuit(h, t.value), s.mount(e.querySelector("svg"), n, h, D, L(), { reset: C }), u(), M("selection").textContent = "Click a component to inspect its original statement and pin connections.", V();
    } catch (D) {
      if (e.replaceChildren(), a = "", M("source").value = "", M("json").value = "", M("nets").replaceChildren(), M("selection").textContent = "", r.textContent = D.message, !c)
        M("hierarchy-panel").hidden = !0, M("selection-actions").hidden = !0, M("breadcrumbs").replaceChildren();
      else if (!c.contexts[w]) {
        const G = document.createElement("button");
        G.type = "button", G.textContent = "Return to Top", G.onclick = () => T(""), M("breadcrumbs").replaceChildren(G);
      }
      _.setCircuit(null, t.value), D.diagnostics && (O = D.diagnostics), O.some((G) => G.severity === "error") || O.push({ severity: "error", line: 0, message: D.message }), W(O);
    } finally {
      y = !1, M("generate").disabled = !1, t.readOnly = !1, M("file").disabled = !1, M("libraries").disabled = !1;
      for (const D of ae.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) D.disabled = !1;
      c && c.contexts[w] && V(), _.setEnabled(!!a), e.setAttribute("aria-busy", "false"), I(), A && (A = !1, F(), queueMicrotask(z));
    }
  }
  M("generate").onclick = () => z({ resetEditor: !0 });
  for (const C of ae.querySelectorAll("[data-example]")) C.onclick = () => {
    const O = Ne[C.dataset.example];
    t.value = O.source, B(), j(O), z();
  };
  M("file").onchange = async (C) => {
    const O = C.target.files[0];
    if (O) {
      if (O.size > 2e6) {
        r.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Ze(O), B(), z();
      } catch (D) {
        r.textContent = "File could not be read: " + D.message;
      } finally {
        C.target.value = "";
      }
    }
  }, M("libraries").onchange = async (C) => {
    try {
      for (const O of C.target.files) {
        if (O.size > 16e6) throw Error("Library exceeds 16 MB: " + O.name);
        x[O.webkitRelativePath || O.name] = await Ze(O);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(x));
      } catch {
      }
      c = null, b = "", M("library-status").textContent = Object.keys(x).length + " library file(s) loaded", z();
    } catch (O) {
      r.textContent = O.message;
    } finally {
      C.target.value = "";
    }
  }, M("library-status").textContent = Object.keys(x).length ? "Libraries restored from this session." : "For .include / .lib dependencies", M("download").onclick = () => {
    const C = URL.createObjectURL(new Blob([a], { type: "image/svg+xml;charset=utf-8" })), O = document.createElement("a");
    O.href = C, O.download = "spice-schematic.svg", O.click(), setTimeout(() => URL.revokeObjectURL(C), 1e3);
  };
  async function K(C) {
    const O = n;
    if (!(!O || y || l)) {
      l = !0, I(), r.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: D } = await import("./asc-export-n7OAk256.js");
        if (n !== O) throw Error("Schematic changed. Generate again before exporting ASC.");
        i ||= D({ tree: c, circuit: h, drawing: O, source: t.value, libraries: x });
        const G = C ? i.zip : i.ascBytes, H = URL.createObjectURL(new Blob([G], { type: C ? "application/zip" : "application/octet-stream" })), $ = document.createElement("a");
        $.href = H, $.download = C ? "spice-schematic-asc.zip" : "spice-schematic.asc", $.click(), setTimeout(() => URL.revokeObjectURL(H), 1e3), r.textContent = "ASC connections verified · " + i.manifest.audit.symbols + " symbols. " + (C ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), i.manifest.warnings.length && (r.textContent += " " + i.manifest.warnings.join(" "));
      } catch (D) {
        r.textContent = "ASC export failed: " + D.message;
        const G = document.createElement("li");
        G.className = "error", G.textContent = r.textContent, o.append(G);
      } finally {
        l = !1, I();
      }
    }
  }
  M("download-asc").onclick = () => K(!1), M("download-asc-bundle").onclick = () => K(!0), M("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(a), r.textContent = "SVG source copied to clipboard.";
    } catch {
      M("source-details").open = !0, M("source").focus(), M("source").select(), r.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, z();
}
export {
  Pe as b,
  Qe as e,
  ge as l,
  Me as n,
  Tt as p
};
