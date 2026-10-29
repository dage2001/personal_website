const _e = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Te = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Ue = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ve = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, je = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Be = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Xe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ge = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ke = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, ze = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, qe = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Qe = {
  AND: _e,
  BUF: Te,
  COUNTER: Ue,
  DFLOP: Ve,
  SCHMITT: je,
  OR: Fe,
  PHASEDET: $e,
  SRFLOP: Be,
  XOR: Xe,
  MODULATOR: Ge,
  OTA: Ke,
  SAMPLEHOLD: ze,
  VARISTOR: qe
}, He = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ee = (t) => t.toLowerCase(), ye = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), We = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Ye(t, e) {
  const n = (b) => e[ee(b || "")] || Object.entries(e).find(([h]) => h.startsWith(ee(b || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let i = [], l = [], s = "", r = "", c = [], a = [], f = 0, m = "", d = "", y = "", I = !0;
  if ("RLC".includes(o))
    i = ["A", "B"], r = ee(o) + "_v";
  else if ("DVIB".includes(o))
    i = ["+", "-"], r = o === "D" ? "d_v" : o === "B" ? "spice_b" : ee(o);
  else if (o === "Q") {
    i = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !ye(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && i.push("S"), s = t[i.length + 1] || "";
    const b = n(s)?.type;
    I = ["NPN", "PNP"].includes(b), r = I ? (i.length === 3 ? "q_" : "spice_q4_") + ee(b) : "spice_q" + i.length;
  } else if (o === "M") {
    const b = n(t[4]), h = n(t[5]), u = b?.type === "VDMOS" || !h && (!t[5] || ye(t[5]));
    i = u ? ["D", "G", "S"] : ["D", "G", "S", "B"], s = t[i.length + 1] || "";
    const E = n(s), g = E?.type;
    if (u && E && g !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!u && g === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    I = ["NMOS", "PMOS", "VDMOS"].includes(g);
    let x = null, C = E;
    const w = /* @__PURE__ */ new Set();
    for (; C && !w.has(C.name) && (w.add(C.name), x = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !x); )
      C = n(C.baseModel);
    const R = g === "PMOS" || g === "VDMOS" && x && (x[1] === void 0 || Number(x[1]) >= 0.5);
    r = I ? "spice_" + (R ? "pmos" : "nmos") + (u ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    s = t[4] || "";
    const b = n(s)?.type, h = o === "Z" && ["NIGBT", "PIGBT"].includes(b);
    i = h ? ["C", "G", "E"] : ["D", "G", "S"], I = o === "J" ? ["NJF", "PJF"].includes(b) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(b), r = "spice_" + (h ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(b || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    i = ["+", "-"], r = "spice_" + ee(o);
    let b = 3, h = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[b] || "");
    if (/^poly$/i.test(t[b] || "") && (h = /^\(\s*(\d+)\s*\)$/.exec(t[++b] || ""), !h))
      throw Error("POLY requires a dimension.");
    if (h) {
      const u = Number(h[1]);
      if (u > 128) throw Error("POLY supports at most 128 controlling variables.");
      let E = b + 1, g = [];
      const x = "EG".includes(o), C = u * (x ? 2 : 1);
      for (; g.length < C && E < t.length; ) g.push(...We(t[E++]));
      if (g.length !== C || E >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (x) {
        for (let w = 0; w < u; w++) i.push("C" + (w + 1) + "+", "C" + (w + 1) + "-");
        l = [t[1], t[2], ...g];
      } else c = g;
      f = E, m = "POLY(" + u + ") " + (x ? "" : g.join(" ") + " "), d = "POLY", x && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? d = "BEHAVIORAL" : "EG".includes(o) ? (i.push("C+", "C-"), d = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], f = 4, m = t[3] + " ");
    y = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (d ? " · " + d : "");
  } else if (o === "S")
    i = ["A", "B", "C+", "C-"], s = t[5] || "", r = "spice_device", y = "Voltage switch";
  else if (o === "W")
    i = ["A", "B"], c = [t[3]], s = t[4] || "", f = 3, r = "spice_device", y = "Current switch";
  else if ("TO".includes(o))
    i = ["L+", "L-", "R+", "R-"], o === "O" && (s = t[5] || ""), r = "spice_device", y = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    i = ["N1", "N2", "COM"], s = t[4] || "", r = "spice_device", y = "Distributed RC";
  else if (o === "A")
    i = Array.from({ length: 8 }, (b, h) => "P" + (h + 1)), r = "spice_device", y = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = t.slice(1, -1), a.some((b) => !/^L/i.test(b.split(":").at(-1)))) throw Error("K references must name inductors.");
    f = t.length - 1, r = "spice_coupling", y = "Magnetic coupling", m = a.join(" ") + " · k=";
  } else if (o === "@")
    i = ["IN", "OUT"], r = "spice_device", y = "FRA";
  else if (o === "&")
    i = ["O+", "O-", "I+", "I-"], r = "spice_device", y = "FRA probe";
  else if (o === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", y = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (f || (f = i.length + 1), l.length || (l = t.slice(1, i.length + 1)), l.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (t.length <= f && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (l.some((b) => /[=()]/.test(b) && !/^\{[\s\S]*\}$/.test(b))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(f).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(f).join(" ")) && (r = "spice_br"), o === "D" && (s = t[3] || ""), o === "@") {
    const b = t.slice(f).join(" ");
    for (const h of b.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(h[1].toUpperCase()), l.push(h[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((b) => !b)) throw Error("Missing controlling voltage source.");
  const N = i.map((b, h) => o === "A" && Qe[(t[9] || "").toUpperCase()]?.[String(h + 1)] || b);
  return { kind: o, pins: i, nodeTokens: l, pinLabels: N, model: s, type: r, controlSource: c[0] || "", controlSources: c, coupledInductors: a, value: m + t.slice(f).join(" "), sourceMode: d, symbol: y, polarityKnown: I };
}
const Ze = He, Je = new Set(Ze.split(" ")), me = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function de(t) {
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
function et(t, e = {}) {
  const n = [], o = [], i = [], l = Object.assign(me(), e.models), s = me(), r = (h, u, E) => n.push({ severity: h, line: u, message: E });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((h, u) => {
    const E = h.trim();
    !E || E.startsWith("*") || (E.startsWith("+") ? c.length ? c.at(-1).text += " " + E.slice(1).trim() : r("error", u + 1, "Continuation has no preceding statement.") : c.push({ line: u + 1, text: E }));
  });
  for (const h of c) {
    try {
      h.tokens = de(h.text);
    } catch (E) {
      r("error", h.line, E.message), h.tokens = [];
    }
    const u = h.tokens;
    if (/^\.model$/i.test(u[0] || ""))
      if (u.length < 3) r("error", h.line, ".model requires a name and device type.");
      else {
        const E = /^ako:(.+)$/i.exec(u[2]), g = E && u[3] && !u[3].startsWith("(") ? u[3].split("(")[0].toUpperCase() : "";
        l[X(u[1])] = { name: u[1], type: E ? g : u[2].split("(")[0].toUpperCase(), baseModel: E?.[1] || "", raw: h.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function f(h) {
    const u = l[X(h)];
    if (!u) return "";
    if (u.type) return u.type;
    if (a.has(X(h))) throw Error("Circular AKO model inheritance: " + h);
    return a.add(X(h)), u.type = f(u.baseModel), a.delete(X(h)), u.type;
  }
  for (const h of Object.values(l)) if (h.baseModel && !h.type)
    try {
      f(h.name);
    } catch (u) {
      r("error", 0, u.message);
    }
  let m = "", d = 0, y = !1, I = !1;
  const N = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: h, text: u, tokens: E } of c) {
    if (!E.length) continue;
    const g = X(E[0]);
    if (I) {
      r("warning", h, "Statement after .end is not rendered: " + u);
      continue;
    }
    if (g === ".control") {
      y = !0, r("warning", h, ".control script retained but not executed or rendered.");
      continue;
    }
    if (g === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (g === ".subckt") {
      d++, r("error", h, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (g === ".ends") {
      d ? d-- : r("error", h, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (g === ".end") {
      I = !0;
      continue;
    }
    if (g.startsWith(".")) {
      o.push({ line: h, text: u }), g === ".title" ? m = E.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(g) ? r("error", h, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(g) ? r("error", h, "Topology-changing directive is unsupported: " + u) : b.has(g) || r("warning", h, "Directive retained but not resolved: " + u);
      continue;
    }
    const x = E[0][0].toUpperCase();
    if (!Je.has(x)) {
      h === 1 && !/\d/.test(E[0]) && E.length > 1 && x !== "X" ? (m = u, r("warning", h, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", h, `Unsupported ${x} device was not rendered: ${u}`);
      continue;
    }
    const C = x === "M" || x === "Q" ? 5 : 4;
    if (h === 1 && !/\d/.test(E[0]) && (E.length < C || x === "T" && !/\b(?:zo|z0)\s*=/i.test(u))) {
      m = u, r("info", h, "SPICE title: " + u);
      continue;
    }
    try {
      if (N.has(g)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const w = Ye(E, l), { pins: R, nodeTokens: P, ...U } = w;
      w.polarityKnown || r("warning", h, `${E[0]}: model polarity unknown; explicit ${R.join("/")} terminals retained.`);
      const D = me();
      R.forEach((K, oe) => {
        const q = X(P[oe]);
        s[q] || (s[q] = { name: q, displayName: E[oe + 1], bit: Object.keys(s).length + 2, terminals: [] }), s[q].terminals.push({ component: E[0], pin: K }), D[K] = q;
      }), i.push({ ...U, name: E[0], terminals: D, line: h, raw: u }), N.add(g);
    } catch (w) {
      r("error", h, `${E[0]}: ${w.message} Statement: ${u}`);
    }
  }
  d && r("error", 0, "Unclosed .subckt definition."), y && r("error", 0, "Unclosed .control block."), i.length || r("error", 0, "No supported components to render."), i.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const h of i) {
    for (const u of h.controlSources || []) !u.includes(":") && !i.some((E) => X(E.name) === X(u) && E.kind === "V") && r("error", h.line, `${h.name}: controlling voltage source ${u} was not found.`);
    for (const u of h.coupledInductors || []) !u.includes(":") && !i.some((E) => X(E.name) === X(u) && E.kind === "L") && r("error", h.line, `${h.name}: coupled inductor ${u} was not found.`);
    (h.kind === "B" || h.type === "spice_b") && r("info", h.line, `${h.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: i, nodes: s, models: l, directives: o, diagnostics: n };
}
const Y = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Ce = (t) => Y(t).split("/").at(-1);
function tt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), i = [], l = [], s = [];
  let r = 0;
  const c = (f, m) => {
    const d = Y(m).split("/").slice(0, -1).concat(Y(f)).join("/"), y = [...o].filter(([N]) => Y(N) === Y(f) || Y(N) === d);
    if (y.length === 1) return y[0];
    const I = [...o].filter(([N]) => Ce(N) === Ce(f));
    if (I.length !== 1) throw Error(I.length ? "Ambiguous library filename: " + f : "Missing library " + f + ". Add this file using Library files.");
    return I[0];
  };
  function a(f, m, d = "", y = []) {
    const I = Y(m) + ":" + d.toLowerCase();
    if (y.includes(I)) throw Error("Circular library include: " + [...y, I].join(" → "));
    if (y.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const N = [], b = /^\s*\.endl\b/im.test(f);
    let h = !d;
    const u = (g, x) => {
      if (r += g.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      s.push(g), l.push({ file: m, line: x + 1 });
    };
    if (f.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((g, x) => {
      const C = g.trim();
      if (/^\.lib\b/i.test(C) && b) {
        const w = de(C);
        if (w.length === 2 && !/[.\\/]/.test(w[1])) {
          N.push(w[1].toLowerCase()), w[1].toLowerCase() === d.toLowerCase() && (h = !0), u("* Library section " + w[1], x);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        N.pop(), u("* End library section", x);
        return;
      }
      if (d && N.length && !N.includes(d.toLowerCase())) {
        u("* Unselected library section", x);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const w = de(C);
          if (!w[1]) throw Error("Include requires a filename.");
          const [R, P] = c(w[1], m);
          u("* Included " + R, x), a(P, R, w[2] || "", [...y, I]);
        } catch (w) {
          i.push({ severity: "error", line: x + 1, source: m, message: w.message }), u("* Unresolved include", x);
        }
      else u(g, x);
    }), !h) throw Error("Library section " + d + " not found in " + m);
  }
  try {
    a(t, n);
  } catch (f) {
    i.push({ severity: "error", line: 0, source: n, message: f.message });
  }
  return { source: s.join(`
`), origins: l, diagnostics: i };
}
function nt(t) {
  const e = [], n = [];
  let o = !1, i = !1, l = 0;
  if (t.split(/\r?\n/).forEach((b, h) => {
    const u = b.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(u)) {
      (i || o) && e.push({ severity: "error", line: h + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(u) || e.push({ severity: "error", line: h + 1, message: "Expected @layout begin v1." }), i = !0, o = !0, l = h + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(u)) {
      o || e.push({ severity: "error", line: h + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (u.startsWith("*") ? n.push(u.slice(1).trim()) : e.push({ severity: "error", line: h + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: l, message: "Unclosed @layout block." }), !i) return { layout: null, diagnostics: e };
  const s = n.join(" "), r = s.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], a = [];
  let f = 0, m = 0, d = 10;
  const y = () => r[f++], I = () => {
    const b = y();
    if (!b || !/^[A-Za-z_@][\w./%:@-]*$/.test(b)) throw Error("Expected layout identifier, got " + b);
    return b;
  };
  function N(b) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const h = b ? I() : "@row" + m++, u = y();
    if (!["row", "column"].includes(u)) throw Error("Expected row or column.");
    if (y() !== "{") throw Error("Expected { after " + u);
    const E = { id: h, direction: u, members: [] };
    for (c.push(E); f < r.length && r[f] !== "}"; )
      r[f] === "group" ? (y(), E.members.push(N(!0))) : ["row", "column"].includes(r[f]) ? E.members.push(N(!1)) : E.members.push(I());
    if (y() !== "}") throw Error("Unclosed group " + h);
    if (!E.members.length) throw Error("Empty layout group " + h);
    return h;
  }
  try {
    for (; f < r.length; )
      if (r[f] === "group")
        y(), N(!0);
      else if (["row", "column"].includes(r[f])) N(!1);
      else if (r[f] === "priority-cap") {
        if (y(), d = Number(y()), !Number.isInteger(d) || d < 3 || d > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (y() === "place") {
        const w = I(), R = y(), P = I();
        if (!["left-of", "above"].includes(R)) throw Error("Expected left-of or above.");
        a.push({ a: w, relation: R, b: P });
      } else throw Error("Unknown layout instruction near " + r[f - 1]);
    const b = /* @__PURE__ */ new Set();
    for (const w of c) {
      const R = w.id.toLowerCase();
      if (b.has(R)) throw Error("Duplicate layout group " + w.id);
      b.add(R);
    }
    const h = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), E = new Map(c.map((w) => [w.id.toLowerCase(), w])), g = (w) => {
      if (h.has(w)) throw Error("Circular layout group " + w);
      if (!u.has(w)) {
        h.add(w);
        for (const R of E.get(w).members) E.has(R.toLowerCase()) && g(R.toLowerCase());
        h.delete(w), u.add(w);
      }
    };
    for (const w of E.keys()) g(w);
    const x = /* @__PURE__ */ new Map();
    for (const w of a) {
      if (w.a.toLowerCase() === w.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      x.has(w.a.toLowerCase()) || x.set(w.a.toLowerCase(), []), x.get(w.a.toLowerCase()).push(w.b.toLowerCase());
    }
    h.clear(), u.clear();
    const C = (w) => {
      if (h.has(w)) throw Error("Circular place constraints.");
      if (!u.has(w)) {
        h.add(w);
        for (const R of x.get(w) || []) C(R);
        h.delete(w), u.add(w);
      }
    };
    for (const w of x.keys()) C(w);
  } catch (b) {
    e.push({ severity: "error", line: l, message: "Layout description: " + b.message });
  }
  return { layout: { version: 1, priorityCap: d, groups: c, relations: a }, diagnostics: e };
}
function rt(t, e) {
  const n = t.ir.layoutDescription;
  if (!n) return null;
  const o = new Map(n.groups.map((a) => [a.id.toLowerCase(), a])), i = Object.values(t.contexts).flatMap((a) => a.devices.map((f) => f.name)), l = new Set([...Object.keys(t.contexts), ...i].map((a) => a.toLowerCase()));
  for (const a of o.values()) if (l.has(a.id.toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + a.id);
  for (const a of o.values()) for (const f of a.members) if (!o.has(f.toLowerCase()) && !l.has(f.toLowerCase())) throw Error("Unknown @layout instance/device: " + f);
  for (const a of n.relations) for (const f of [a.a, a.b]) if (!o.has(f.toLowerCase()) && !l.has(f.toLowerCase())) throw Error("Unknown @layout place target: " + f);
  if (e.focus) return null;
  const s = /* @__PURE__ */ new Map(), r = [];
  for (const a of n.groups) {
    const f = [];
    for (const m of a.members) {
      if (o.has(m.toLowerCase())) {
        f.push({ group: m });
        continue;
      }
      for (const d of e.components) if (d.name.toLowerCase() === m.toLowerCase() || d.name.toLowerCase().startsWith(m.toLowerCase() + "/")) {
        if (s.has(d.name)) throw Error("Overlapping @layout membership: " + d.name);
        s.set(d.name, a.id), f.push({ cell: d.name, instance: m });
      }
    }
    r.push({ id: a.id, direction: a.direction, members: f });
  }
  const c = /* @__PURE__ */ new Set();
  for (const a of r) for (const f of a.members) if (f.group) {
    const m = f.group.toLowerCase();
    if (c.has(m)) throw Error("Layout group has multiple parents: " + f.group);
    c.add(m);
  }
  return { version: 1, priorityCap: n.priorityCap, groups: r, relations: n.relations };
}
const ne = () => /* @__PURE__ */ Object.create(null), $ = (t) => t.toLowerCase();
function Re(t) {
  const e = ne();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!i) throw Error("Expected named parameter assignment, got: " + o);
    const l = $(i[1]);
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
  return e < 0 ? [t, ne()] : [t.slice(0, e), Re(t.slice(e))];
}
function ot(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = nt(t), o = tt(t, e);
  t = o.source;
  const i = [...o.diagnostics, ...n.diagnostics], l = ne(), s = /* @__PURE__ */ new Set(["0"]), r = (u, E, g) => i.push({ severity: u, line: E, message: g }), c = (u, E, g, x = [], C = ne(), w = 0) => {
    const R = { id: u, name: E, parent: g, ports: x, defaults: C, parameters: ne(), definitions: ne(), devices: [], instances: [], directives: [], line: w, statements: [] };
    return l[u] = R, R;
  }, a = c("root", "Top", null), f = [a], m = [];
  let d = !1, y = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((u, E) => {
    const g = u.trim();
    !g || g.startsWith("*") || (g.startsWith("+") ? m.length ? m.at(-1).text += " " + g.slice(1).trim() : r("error", E + 1, "Continuation has no preceding statement.") : m.push({ text: g, line: E + 1 }));
  });
  for (const { text: u, line: E } of m)
    try {
      const g = de(u);
      if (!g.length) continue;
      const x = $(g[0]), C = f.at(-1);
      if (y) {
        r("warning", E, "Statement after .end is not rendered: " + u);
        continue;
      }
      if (x === ".control") {
        d = !0, r("warning", E, ".control script retained but not executed or rendered.");
        continue;
      }
      if (x === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (x === ".subckt") {
        if (g.length < 2) throw Error(".SUBCKT requires a name.");
        const [w, R] = xe(g.slice(2)), P = $(g[1]);
        if (Object.hasOwn(C.definitions, P)) throw Error("Duplicate subcircuit definition: " + g[1]);
        const U = w.map($);
        if (new Set(U).size !== w.length || U.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (w.some((K) => /[{}()=]/.test(K))) throw Error("Invalid formal port.");
        if (f.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = C.id + "/" + encodeURIComponent(P);
        C.definitions[P] = D, f.push(c(D, g[1], C.id, w, R, E));
        continue;
      }
      if (x === ".ends") {
        if (f.length === 1) throw Error("Unmatched .ENDS.");
        if (g[1] && $(g[1]) !== $(C.name)) throw Error(".ENDS name does not match " + C.name);
        f.pop();
        continue;
      }
      if (x === ".end") {
        if (f.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        y = !0;
        continue;
      }
      if (x === ".param") {
        const w = Re(g.slice(1));
        for (const [R, P] of Object.entries(w)) {
          if (Object.hasOwn(C.parameters, R)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + R);
          C.parameters[R] = P;
        }
      }
      if (x === ".global") {
        if (g.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const w of g.slice(1)) s.add($(w));
      }
      if (x.startsWith(".") && C.directives.push({ line: E, text: u }), x.startsWith("x")) {
        const [w, R] = xe(g.slice(1));
        if (!w.length) throw Error("X instance requires a subcircuit name.");
        const P = /;§pnba\s+(.+)$/i.exec(u)?.[1].split(")");
        C.instances.push({ name: g[0], nodes: w.slice(0, -1).map($), definitionName: w.at(-1), definitionId: null, parameters: R, line: E, raw: u, pinNames: P });
      } else C.statements.push({ line: E, text: u });
    } catch (g) {
      r("error", E, g.message + " Statement: " + u);
    }
  f.length > 1 && r("error", f.at(-1).line, "Unclosed .SUBCKT " + f.at(-1).name), d && r("error", 0, "Unclosed .control block.");
  function I(u, E) {
    for (; u; ) {
      if (Object.hasOwn(u.definitions, $(E))) return u.definitions[$(E)];
      u = l[u.parent];
    }
    return null;
  }
  for (const u of Object.values(l)) {
    const E = [...u.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...u.statements], g = et(E.map((C) => C.text).join(`
`), { models: l[u.parent]?.models });
    u.devices = g.components.map((C) => ({ ...C, line: E[C.line - 1]?.line || u.line })), u.models = g.models, u === a && (a.title = g.title), i.push(...g.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: E[C.line - 1]?.line || u.line })));
    const x = new Set(u.devices.map((C) => $(C.name)));
    for (const C of u.instances)
      if (x.has($(C.name)) && r("error", C.line, "Duplicate instance/device name: " + C.name), x.add($(C.name)), C.definitionId = I(u, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) r("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const w = l[C.definitionId];
        w.ports.length !== C.nodes.length && r("error", C.line, `${C.name}: ${w.name} expects ${w.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const u of Object.values(l)) delete u.statements;
  const N = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set();
  function h(u, E = []) {
    if (N.has(u)) {
      r("error", l[u].line, "Circular subcircuit reference: " + [...E, l[u].name].join(" → "));
      return;
    }
    if (!b.has(u)) {
      if (N.add(u), E.length >= 64) {
        r("error", l[u].line, "Subcircuit dependency nesting exceeds 64 levels."), N.delete(u), b.add(u);
        return;
      }
      for (const g of l[u].instances) g.definitionId && h(g.definitionId, [...E, l[u].name]);
      N.delete(u), b.add(u);
    }
  }
  for (const u of Object.keys(l)) h(u);
  !a.devices.length && !a.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const u of i) !u.source && u.line && o.origins[u.line - 1] && (u.source = o.origins[u.line - 1].file, u.line = o.origins[u.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: l, globals: [...s], diagnostics: i, layoutDescription: n.layout };
}
const _ = () => /* @__PURE__ */ Object.create(null), te = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ge = (t, e) => te(t.map((n) => n.toLowerCase()), e.toLowerCase());
function it(t, e = []) {
  const n = _(), o = (i) => n[i] || (n[i] = { name: i, displayName: i.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const i of t) for (const [l, s] of Object.entries(i.terminals)) o(s).terminals.push({ component: i.name, pin: l });
  for (const i of e) o(i);
  return n;
}
function st(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ve = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, at = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function pe(t, e, n = (i) => i, o = (i) => i) {
  const i = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (s) => (i.push(s), "@@" + (i.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (s, r, c) => {
    const a = c.split(",").map((m) => m.trim());
    if (a.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + s);
    const f = r.toUpperCase() + "(" + a.map((m) => r.toLowerCase() === "v" ? n(m) : o(m, r)).join(",") + ")";
    return i.push(f), "@@" + (i.length - 1) + "@@";
  });
  let l = t.length;
  return t = t.replace(at, (s, r, c) => {
    if (c.slice(r + s.length).trimStart().startsWith("(")) return s;
    const a = e(s.toLowerCase());
    if (a === void 0) return s;
    if (l += a.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), t.replace(/@@(\d+)@@/g, (s, r) => i[Number(r)]);
}
function ct(t, e, n, o) {
  const i = { ...e, ...n }, l = _(), s = /* @__PURE__ */ new Set(), r = _();
  for (const [a, f] of Object.entries(o)) r[a] = pe(ve(f), (m) => t[m]);
  function c(a) {
    if (Object.hasOwn(r, a)) return r[a];
    if (Object.hasOwn(l, a)) return l[a];
    if (!Object.hasOwn(i, a)) return t[a];
    if (s.has(a)) {
      if (Object.hasOwn(t, a)) return t[a];
      throw Error("Circular parameter dependency: " + [...s, a].join(" → "));
    }
    return s.add(a), l[a] = pe(ve(i[a]), c), s.delete(a), l[a];
  }
  for (const a of Object.keys(i)) c(a);
  return Object.assign(_(), t, l, r);
}
function Oe(t, e, n, o) {
  let i = "";
  for (let c = 0; c < t.length; ) {
    const a = t[c];
    if (a !== "{" && a !== "'") {
      i += a, c++;
      continue;
    }
    const f = c++;
    let m = 1, d = "";
    for (; c < t.length && m; c++) {
      if (a === "'") {
        t[c] === "'" && (m = 0);
        continue;
      }
      if (d) {
        t[c] === d && (d = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        d = t[c];
        continue;
      }
      t[c] === "{" && m++, t[c] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    i += a + pe(t.slice(f + 1, c - 1), (y) => e[y], n, o) + (a === "{" ? "}" : "'");
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
      const f = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(c));
      f && (l.push({ start: c, end: c + f[0].length, key: f[1].toLowerCase() }), c += f[0].length - 1);
    }
  }
  if (l.length) {
    let c = i.slice(0, l[0].start);
    l.forEach((a, f) => {
      const m = l[f + 1]?.start ?? i.length, d = i.slice(a.end, m);
      c += i.slice(a.start, a.end) + (d.includes("{") || ["refnode", "intnode"].includes(a.key) ? d : pe(d, (y) => e[y], n, o));
    }), i = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (i = "{" + e[t.toLowerCase()] + "}");
  return i;
}
class lt {
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
class ut {
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
class p {
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
    return "JavaScript Expression Parser (JSEP) v" + p.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return p.max_unop_len = Math.max(e.length, p.max_unop_len), p.unary_ops[e] = 1, p;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return p.max_binop_len = Math.max(e.length, p.max_binop_len), p.binary_ops[e] = n, o ? p.right_associative.add(e) : p.right_associative.delete(e), p;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return p.additional_identifier_chars.add(e), p;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return p.literals[e] = n, p;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete p.unary_ops[e], e.length === p.max_unop_len && (p.max_unop_len = p.getMaxKeyLen(p.unary_ops)), p;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return p.unary_ops = {}, p.max_unop_len = 0, p;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return p.additional_identifier_chars.delete(e), p;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete p.binary_ops[e], e.length === p.max_binop_len && (p.max_binop_len = p.getMaxKeyLen(p.binary_ops)), p.right_associative.delete(e), p;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return p.binary_ops = {}, p.max_binop_len = 0, p;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete p.literals[e], p;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return p.literals = {}, p;
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
    return new p(e).parse();
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
    return p.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !p.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    p.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return p.isIdentifierStart(e) || p.isDecimalDigit(e);
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
    if (p.hooks[e]) {
      const o = { context: this, node: n };
      return p.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (p.hooks[e]) {
      const n = { context: this };
      return p.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === p.SPACE_CODE || e === p.TAB_CODE || e === p.LF_CODE || e === p.CR_CODE; )
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
      type: p.COMPOUND,
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
      if (o = this.code, o === p.SEMCOL_CODE || o === p.COMMA_CODE)
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
    let e = this.expr.substr(this.index, p.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (p.binary_ops.hasOwnProperty(e) && (!p.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !p.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    for (l = { value: n, prec: p.binaryPrecedence(n), right_a: p.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), i = [s, l, r]; n = this.gobbleBinaryOp(); ) {
      if (o = p.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      l = { value: n, prec: o, right_a: p.right_associative.has(n) }, a = n;
      const f = (m) => l.right_a && m.right_a ? o > m.prec : o <= m.prec;
      for (; i.length > 2 && f(i[i.length - 2]); )
        r = i.pop(), n = i.pop().value, s = i.pop(), e = {
          type: p.BINARY_EXP,
          operator: n,
          left: s,
          right: r
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), i.push(l, e);
    }
    for (c = i.length - 1, e = i[c]; c > 1; )
      e = {
        type: p.BINARY_EXP,
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
    if (e = this.code, p.isDecimalDigit(e) || e === p.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === p.SQUOTE_CODE || e === p.DQUOTE_CODE)
      i = this.gobbleStringLiteral();
    else if (e === p.OBRACK_CODE)
      i = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, p.max_unop_len), o = n.length; o > 0; ) {
        if (p.unary_ops.hasOwnProperty(n) && (!p.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !p.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: p.UNARY_EXP,
            operator: n,
            argument: l,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      p.isIdentifierStart(e) ? (i = this.gobbleIdentifier(), p.literals.hasOwnProperty(i.name) ? i = {
        type: p.LITERAL,
        value: p.literals[i.name],
        raw: i.name
      } : i.name === p.this_str && (i = { type: p.THIS_EXP })) : e === p.OPAREN_CODE && (i = this.gobbleGroup());
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
    for (; n === p.PERIOD_CODE || n === p.OBRACK_CODE || n === p.OPAREN_CODE || n === p.QUMARK_CODE; ) {
      let o;
      if (n === p.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== p.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === p.OBRACK_CODE ? (e = {
        type: p.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== p.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === p.OPAREN_CODE ? e = {
        type: p.CALL_EXP,
        arguments: this.gobbleArguments(p.CPAREN_CODE),
        callee: e
      } : (n === p.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: p.MEMBER_EXP,
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
    for (; p.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === p.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); p.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); p.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      p.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, p.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === p.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === p.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: p.LITERAL,
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
      type: p.LITERAL,
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
    for (p.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, p.isIdentifierPart(e)); )
      this.index++;
    return {
      type: p.IDENTIFIER,
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
        o = !0, this.index++, e === p.CPAREN_CODE && i && i >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === p.COMMA_CODE) {
        if (this.index++, i++, i !== n.length) {
          if (e === p.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === p.CBRACK_CODE)
            for (let s = n.length; s < i; s++)
              n.push(null);
        }
      } else if (n.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const s = this.gobbleExpression();
        (!s || s.type === p.COMPOUND) && this.throwError("Expected comma"), n.push(s);
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
    let e = this.gobbleExpressions(p.CPAREN_CODE);
    if (this.code === p.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: p.SEQUENCE_EXP,
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
      type: p.ARRAY_EXP,
      elements: this.gobbleArguments(p.CBRACK_CODE)
    };
  }
}
const dt = new lt();
Object.assign(p, {
  hooks: dt,
  plugins: new ut(p),
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
p.max_unop_len = p.getMaxKeyLen(p.unary_ops);
p.max_binop_len = p.getMaxKeyLen(p.binary_ops);
const re = (t) => new p(t).parse(), pt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(p).filter((t) => !pt.includes(t) && re[t] === void 0).forEach((t) => {
  re[t] = p[t];
});
re.Jsep = p;
const ft = "ConditionalExpression";
var ht = {
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
            type: ft,
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
re.plugins.register(ht);
const mt = "ConditionalExpression";
var gt = {
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
            type: mt,
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
re.plugins.register(gt);
const bt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Se = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, F = (t) => Number(t) > 0.5;
function ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function i(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, a, f, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), d = f.toLowerCase(), y = d.startsWith("meg") ? 1e6 : d.startsWith("mil") ? 254e-7 : bt[d[0]] || 1;
      return "(" + (m ? +(a + (a.includes(".") ? "" : ".") + m) : Number(a)) * y + ")";
    }), l(re(r));
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
    if (r.type === "ConditionalExpression") return F(l(r.test)) ? l(r.consequent) : l(r.alternate);
    if (r.type === "UnaryExpression") {
      const c = l(r.argument);
      if (r.operator === "-") return -c;
      if (r.operator === "+") return +c;
      if (r.operator === "!" || r.operator === "~") return !F(c);
    }
    if (r.type === "BinaryExpression") {
      const c = l(r.left);
      if (r.operator === "&&") return F(c) && F(l(r.right));
      if (r.operator === "||") return F(c) || F(l(r.right));
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
          return F(c) !== F(a);
        case "&":
          return F(c) && F(a);
        case "|":
          return F(c) || F(a);
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
        return F(l(r.arguments[0])) ? l(r.arguments[1]) : l(r.arguments[2]);
      }
      if (Object.hasOwn(Se, c)) return Se[c](...r.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const s = i(t);
  if (typeof s == "number" && !Number.isFinite(s)) throw Error("Structural expression is not finite.");
  return s;
}
function Et(t) {
  st(t);
  const e = _(), n = /* @__PURE__ */ new Map();
  let o = 0, i = 0;
  function l(s, r, c, a, f, m, d) {
    if (r.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const y = t.scopes[s], I = r.length ? te(r.slice(0, -1), r.at(-1)) : "", N = _();
    if (d.some((x) => x.scopeId === s)) throw Error("Circular subcircuit reference at " + I);
    const b = ct(a, y.defaults, y.parameters, f);
    function h(x) {
      if (/^\{[\s\S]*\}$/.test(x)) {
        const w = ae(x, b);
        x = String(typeof w == "boolean" ? Number(w) : w);
      }
      /^"[\s\S]*"$/.test(x) && (x = x.slice(1, -1));
      const C = x.toLowerCase();
      return Object.hasOwn(c, C) ? c[C] : t.globals.includes(C) ? ge([], C) : N[C] || (N[C] = ge(r, C));
    }
    const u = { id: I, path: r, scopeId: s, name: m?.name || "Top", definition: y.name, ports: y.ports.map((x) => ({ name: x, node: h(x) })), params: b, nodes: N, models: _(), devices: [], children: [], raw: m?.raw || "", line: m?.line || 0 };
    e[I] = u, n.set(I, h);
    const E = [...d, u];
    function g(x) {
      if (!x) return "";
      let C = y;
      for (; C; ) {
        if (C.directives.some((w) => new RegExp("^\\.model\\s+" + x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(w.text))) {
          const w = [...E].reverse().find((R) => R.scopeId === C.id);
          return te(w?.path || [], x.toLowerCase());
        }
        C = t.scopes[C.parent];
      }
      return x;
    }
    for (const x of y.directives.filter((C) => /^\.model\b/i.test(C.text))) {
      const C = /^\.model\s+(\S+)/i.exec(x.text)?.[1];
      if (!C) continue;
      const w = g(C), R = y.models[C.toLowerCase()], P = Oe(x.text, b, h, (U) => te(r, U));
      u.models[w] = { ...R, name: w, raw: P.replace(/^(\.model\s+)\S+/i, (U, D) => D + w), instanceId: I, parameters: b };
    }
    for (const x of y.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const C = _();
      for (const [R, P] of Object.entries(x.terminals)) C[R] = h(P);
      const w = g(x.model);
      u.devices.push({ ...x, name: te(r, x.name), localName: x.name, instanceId: I, terminals: C, model: w, parameters: b });
    }
    for (const x of y.instances) {
      let C = x.definitionId;
      if (!C) {
        const U = String(ae(x.definitionName, b)).toLowerCase();
        let D = y;
        for (; D && !C; )
          C = D.definitions[U], D = t.scopes[D.parent];
        if (!C) throw Error("Undefined selected subcircuit: " + U);
      }
      const w = t.scopes[C], R = _();
      if (w.ports.length !== x.nodes.length) throw Error(x.name + ": expected " + w.ports.length + " ports; got " + x.nodes.length);
      w.ports.forEach((U, D) => {
        R[U.toLowerCase()] = h(x.nodes[D]);
      });
      const P = l(C, [...r, x.name], R, b, x.parameters, x, E);
      x.pinNames?.length === P.ports.length && P.ports.forEach((U, D) => {
        U.label = x.pinNames[D];
      }), u.children.push(P);
    }
    return u;
  }
  try {
    let f = function(m, d) {
      const y = d.split(":");
      if (y.length === 1) return { owner: m, name: d };
      const I = y.pop();
      for (const N of [[...m.path, ...y], y]) {
        const b = r.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (b) return { owner: b, name: I };
      }
      throw Error("Unknown hierarchical reference: " + d);
    };
    const s = l(t.rootId, [], _(), _(), _(), null, []), r = new Map(Object.values(e).map((m) => [m.id.toLowerCase(), m])), c = Object.assign(_(), ...Object.values(e).map((m) => m.models)), a = (m) => c[m] || Object.entries(c).find(([d]) => d.startsWith(m + "."))?.[1];
    for (const m of Object.values(e)) for (const d of m.devices) {
      const y = t.scopes[m.scopeId].devices.find((b) => b.name === d.localName), I = (b) => {
        const h = f(m, b);
        return n.get(h.owner.id)(h.name);
      }, N = (b, h = "", u = "") => {
        const E = f(m, b), g = E.owner.devices.find((x) => x.localName.toLowerCase() === E.name.toLowerCase());
        if (h.toLowerCase() === "ix") {
          const x = E.owner.ports.find((C, w) => C.name.toLowerCase() === E.name.toLowerCase() || String(w + 1) === E.name);
          if (x) return E.owner.id + ":" + x.name;
        }
        if (!g) {
          if (u) throw Error(d.name + ": referenced " + u + " device " + b + " was not found.");
          return te(E.owner.path, E.name);
        }
        if (u && g.kind !== u) throw Error(d.name + ": " + b + " must be a " + u + " device.");
        return g.name;
      };
      if (d.value = Oe(y.value, m.params, I, N), y.model && (d.value = d.value.replace(y.model, d.model)), d.kind === "M" && Object.keys(d.terminals).length === 3) {
        let b = a(d.model), h = !1;
        const u = /* @__PURE__ */ new Set();
        for (; b?.type === "VDMOS" && !u.has(b.name); ) {
          u.add(b.name);
          const E = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(b.raw);
          if (E) {
            h = E[1] === void 0 || Number(ae(E[1], b.parameters)) >= 0.5;
            break;
          }
          const g = b.name.includes("/") ? b.name.slice(0, b.name.lastIndexOf("/") + 1) : "";
          b = a(g + (b.baseModel || "").toLowerCase()) || a((b.baseModel || "").toLowerCase());
        }
        u.size && (d.type = "spice_" + (h ? "pmos3" : "nmos3"));
      }
      d.controlSources = (y.controlSources || []).map((b) => N(b, "", "V")), d.controlSource = d.controlSources[0] || "", d.coupledInductors = (y.coupledInductors || []).map((b) => N(b, "", "L"));
      for (const b of /* @__PURE__ */ new Set([...y.controlSources || [], ...y.coupledInductors || []])) {
        const h = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        d.value = d.value.replace(new RegExp("(?<![\\w./%])" + h + "(?![\\w.$])", "g"), () => N(b));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: s, contexts: e };
  } catch (s) {
    throw s.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: s.message }], s;
  }
}
function ce(t) {
  return [...t.devices, ...t.children.flatMap(ce)];
}
function Ie(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const Ne = 4;
function be(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const le = (t) => ["pwr", "ret", "bias"].includes(t), wt = (t) => String(t).split("/").at(-1).toLowerCase(), Ae = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[wt(t)] || "unknown", yt = (t) => {
  const e = be(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Ae(t);
};
function Ct(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (s, r, c) => {
    e.has(s) || e.set(s, []), e.get(s).push({ node: r, delta: c });
  };
  for (const s of t)
    if (s.kind === "V")
      try {
        let r = s.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (c && Number(ae(c[1], s.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!a) continue;
        const f = ae(a[1], s.parameters);
        if (typeof f != "number" || !Number.isFinite(f)) continue;
        o(s.terminals["-"], s.terminals["+"], f), o(s.terminals["+"], s.terminals["-"], -f);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const s of ["0", ...e.keys()]) {
    if (l.has(s)) continue;
    const r = /* @__PURE__ */ new Map([[s, 0]]), c = [s];
    l.add(s);
    let a = !1;
    for (let f = 0; f < c.length; f++) for (const m of e.get(c[f]) || []) {
      const d = r.get(c[f]) + m.delta;
      r.has(m.node) ? Math.abs(r.get(m.node) - d) > 1e-8 * Math.max(1, Math.abs(d)) && (a = !0) : (r.set(m.node, d), l.add(m.node), c.push(m.node));
    }
    a && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [f, m] of r) i[f] = { value: m, reference: s, known: s === "0" && !a, consistent: !a };
  }
  return { nodes: i, diagnostics: n };
}
function xt(t, e) {
  const n = Ct(ce(t.root)), o = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const s of Object.values(e.nodes)) {
    const r = be(s.name), c = Ae(s.name);
    o[s.name] = { role: r !== "unknown" ? r : c, roleSource: r !== "unknown" ? "node-name" : c !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[s.name]?.known ? n.nodes[s.name].value : null };
  }
  const l = (s, r, c) => {
    const a = { role: o[c].role, roleSource: o[c].roleSource }, f = s.block?.ports.find((y) => y.pin === r);
    if (f?.implicit || !s.block && !s.synthetic) return a;
    const m = s.synthetic ? s.value : f?.name || f?.label, d = yt(m);
    return d !== "unknown" ? { role: d, roleSource: be(m) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : le(a.role) ? { ...a, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const s of e.components) {
    const r = Object.fromEntries(Object.entries(s.terminals).map(([g, x]) => [g, { ...o[x], ...l(s, g, x) }])), c = Object.values(r), a = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(s.type), f = a && c.length === 2 && c.every((g) => !le(g.role) && (g.potential === null || g.role !== "unknown")), m = s.terminals["+"], d = s.terminals["-"], y = [m, d].filter((g) => g && g !== "0"), I = s.kind === "V" && y.some((g) => le(o[g]?.role)) && !y.some((g) => ["in", "out", "io", "fb"].includes(o[g]?.role)) && [m, d].every((g) => n.nodes[g]?.known), N = m === "0" ? d : m, b = Object.keys(s.terminals), h = (g) => le(g.role) ? g.potential !== null ? g.potential > 0 ? "high" : "low" : g.role === "ret" ? "low" : "high" : "signal";
    let u = !1;
    b.length === 2 && (s.terminals[b[0]] === "0" ? u = !0 : s.terminals[b[1]] === "0" ? u = !1 : c.every((g) => g.potential !== null) ? u = c[0].potential < c[1].potential : u = h(c[0]) === "low" || h(c[1]) === "high" && h(c[0]) === "signal");
    const E = s.synthetic ? "" : s.name.startsWith(e.focus + "/") ? s.name.slice(e.focus.length + 1) : s.name;
    i[s.name] = { version: Ne, kind: s.kind, owner: E.includes("/") ? E.slice(0, E.lastIndexOf("/")) : "", passive: a, source: ["V", "I", "E", "F", "G", "H"].includes(s.kind) || s.kind === "B" && !a, ports: r, horizontal: f, orientation: f ? "horizontal" : u ? "vertical-reversed" : "vertical", flexible: b.length === 2 && (a || ["V", "I", "B", "F", "H"].includes(s.kind)), supply: !!I, voltage: I ? n.nodes[N].value : null };
  }
  return { version: Ne, nodes: o, cells: i, diagnostics: n.diagnostics };
}
function Me(t, e) {
  const n = e.ports.map((i, l) => ({ pin: "P" + l, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), o = new Set(ce(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of t.ir.globals) {
    const l = ge([], i);
    o.has(l) && !n.some((s) => s.node === l) && n.push({ pin: "G" + n.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: l, implicit: !0 });
  }
  return n;
}
function vt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  const l = [], s = [];
  function r(f) {
    s.push(...Object.values(f.nodes), ...f.ports.map((d) => d.node));
    const m = [...f.devices.map((d) => ({ line: d.line, device: d })), ...f.children.map((d) => ({ line: d.line, child: d }))].sort((d, y) => d.line - y.line);
    for (const d of m) {
      if (d.device) {
        const b = d.device;
        l.push({ ...b, layoutLabel: [...f.path.slice(i.path.length), b.localName].join("/") });
        continue;
      }
      const y = d.child;
      if (e === "flat" || n.has(y.id)) {
        r(y);
        continue;
      }
      const I = Me(t, y), N = _();
      I.forEach((b) => {
        N[b.pin] = b.node;
      }), l.push({ name: y.id, kind: "X", type: "spice_subckt", terminals: N, value: y.definition, raw: y.raw, line: y.line, instanceId: y.id, layoutLabel: y.path.slice(i.path.length).join("/"), block: { definitionId: y.scopeId, ports: I, parameters: y.params } });
    }
  }
  r(i);
  for (const [f, m] of i.ports.entries()) l.push({ name: "@port/" + o + "/" + f, kind: "PORT", type: "spice_port", terminals: { A: m.node }, layoutLabel: m.name, value: m.name, raw: "Interface port " + m.name, synthetic: !0 });
  if (l.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(_(), ...Object.values(t.contexts).map((f) => f.models)), a = { title: o || t.ir.title, components: l, nodes: it(l, s), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  return a.topology = Ot(t, a), a.layout = xt(t, a), a.layout.description = rt(t, a), a;
}
function Ot(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e.components)
    if (!s.synthetic)
      if (s.kind === "X") {
        const r = t.contexts[s.instanceId];
        if (!r) throw Error("Projection contains an unknown block.");
        const c = Me(t, r);
        if (JSON.stringify(Object.entries(s.terminals)) !== JSON.stringify(c.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + s.name);
        n.push(...ce(r));
      } else n.push(s);
  for (const s of n) {
    if (o.has(s.name)) throw Error("Projection duplicates " + s.name);
    o.add(s.name);
  }
  const i = Ie(n), l = ce(t.contexts[e.focus]);
  if (i !== Ie(l)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: i };
}
function St(t) {
  const e = _(), n = _();
  for (const o of t.components) {
    const i = _(), l = _();
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
function It(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, i = (c) => (n.has(c) || n.set(c, n.size + 2), n.get(c));
  Object.entries(t.modules.circuit.cells).forEach(([c, a], f) => {
    const m = "c" + f;
    e.set(m, c);
    const d = Object.fromEntries(Object.entries(a.connections).map(([y, I]) => [y, I.map(i)]));
    o[m] = { type: a.type, connections: d, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (o[m].spiceBlock = a.spiceBlock), a.spiceSymbol && (o[m].spiceSymbol = a.spiceSymbol), a.spiceLayout && (o[m].spiceLayout = a.spiceLayout);
  });
  const l = new Map([...e].map(([c, a]) => [a, c])), s = t.modules.circuit.spiceLayoutDescription, r = s ? { ...s, groups: s.groups.map((c) => ({ ...c, members: c.members.map((a) => a.cell ? { ...a, cell: l.get(a.cell) } : a) })), relations: s.relations.map((c) => ({ ...c, a: l.get(c.a) || c.a, b: l.get(c.b) || c.b })) } : null;
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([c, a]) => [a, c])) };
}
const W = /* @__PURE__ */ new Map();
async function Nt(t, e) {
  const n = It(t), o = JSON.stringify([n.netlist, e]);
  let i = W.get(o);
  i ? (W.delete(o), W.set(o, i)) : (i = await Lt(n.netlist, e), i.length < 1e6 && (W.set(o, i), W.size > 20 && W.delete(W.keys().next().value)));
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
function Lt(t, e) {
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
const kt = `* RLC low-pass filter
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
`, Rt = `* Voltage-divider biased common-emitter amplifier.
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
`, At = `* Common-collector voltage follower; independently chosen example values.
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
`, Mt = `* Unity-gain Sallen-Key second-order low-pass filter.
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
`, Pt = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.
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
  filter: { source: kt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Rt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: At, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Mt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the official LM741 macromodel.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Pt, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each LM741 macromodel.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Dt(t) {
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
  return Dt(await t.arrayBuffer());
}
const ke = ue.filter.source, S = (t) => document.getElementById("spice-" + t), se = S("app");
if (se) {
  let g = function(v) {
    const O = S("example-info");
    if (O && (O.replaceChildren(), !!v && (O.append(document.createTextNode(v.description + " ")), v.url))) {
      const A = document.createElement("a");
      A.href = v.url, A.target = "_blank", A.rel = "noopener noreferrer", A.textContent = v.reference, O.append(A);
    }
  }, x = function() {
    i = "", u(), g(Object.values(ue).find((v) => v.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, C = function(v) {
    o.replaceChildren();
    for (const { severity: O, line: A, message: M, source: L } of v) {
      const V = document.createElement("li");
      V.className = O, V.textContent = `${O.toUpperCase()}${L && L !== "input.cir" ? " · " + L : ""}${A ? " · line " + A : ""}: ${M}`, o.append(V);
    }
    S("messages").open = v.some((O) => O.severity !== "info"), S("message-count").textContent = `${v.length} message${v.length === 1 ? "" : "s"}`;
  }, w = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${d.x} ${d.y} ${d.w} ${d.h}`), S("zoom-level").textContent = Math.round(y.w / d.w * 100) + "%";
  }, R = function(v, O = d.x + d.w / 2, A = d.y + d.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, d.w * v / y.w)) * y.w / d.w;
    d = { x: O + (d.x - O) * M, y: A + (d.y - A) * M, w: d.w * M, h: d.h * M }, w();
  }, U = function(v) {
    const O = new URLSearchParams();
    v && O.set("instance", v);
    const A = O.toString();
    location.hash.slice(1) === A ? (a = v, j()) : location.hash = A;
  }, D = function() {
    a = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, K = function(v) {
    const O = s.contexts[v].path;
    for (let A = 1; A <= O.length; A++) N.add(O.slice(0, A).map(encodeURIComponent).join("/"));
  }, oe = function() {
    const v = !!(f && f !== a && s?.contexts[f]);
    S("selection-actions").hidden = !v, S("toggle-instance").textContent = N.has(f) ? "Collapse instance" : "Expand instance", S("toggle-instance").disabled = !1, S("open-instance").href = "#" + new URLSearchParams({ instance: f });
  }, q = function() {
    S("breadcrumbs").replaceChildren();
    const v = (A, M) => {
      const L = document.createElement("button");
      L.type = "button", L.textContent = A, L.onclick = () => U(M), L.disabled = M === a, S("breadcrumbs").append(L);
    };
    if (v("Top", ""), a) {
      const A = s.contexts[a].path;
      for (let M = 0; M < A.length; M++) v(A[M], A.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    S("instances").replaceChildren();
    const O = (A, M) => {
      for (const L of A.children) {
        const V = document.createElement("div");
        V.className = "spice-instance-row", V.style.setProperty("--depth", Math.min(M, 8)), V.dataset.instance = L.id;
        const G = document.createElement("button");
        G.type = "button", G.textContent = N.has(L.id) ? "−" : "+", G.title = (N.has(L.id) ? "Collapse " : "Expand ") + L.id, G.setAttribute("aria-label", G.title), G.setAttribute("aria-expanded", String(N.has(L.id))), G.onclick = () => {
          N.has(L.id) ? N.delete(L.id) : K(L.id), f = L.id, j();
        };
        const Z = document.createElement("a");
        Z.href = "#" + new URLSearchParams({ instance: L.id }), Z.textContent = L.name + " · " + L.definition, Z.title = "Open " + L.id + " as its own sheet";
        const Q = document.createElement("span");
        if (Q.className = "spice-help", Q.textContent = Object.entries(L.params).map(([H, J]) => H + "=" + J).join(" · "), V.append(G, Z), Q.textContent) {
          const H = document.createElement("details"), J = document.createElement("summary");
          J.textContent = "Parameters", H.append(J, Q), V.append(H);
        }
        S("instances").append(V), O(L, M + 1);
      }
    };
    O(s.contexts[a], 0), S("hierarchy-panel").hidden = !s.contexts[a].children.length, S("focus-title").textContent = a ? a + " / " + s.contexts[a].definition : "Top-level schematic", oe();
  };
  const t = S("input"), e = S("preview"), n = S("status"), o = S("diagnostics");
  let i = "", l, s, r, c = "", a = "", f = "", m = !1, d = { x: 0, y: 0, w: 1, h: 1 }, y = { ...d }, I;
  const N = /* @__PURE__ */ new Set();
  let b = !1, h = {};
  try {
    h = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  se.addEventListener("click", (v) => {
    m && v.target.closest('a[href^="#"]') && v.preventDefault();
  });
  const u = () => {
    S("copy").disabled = S("download").disabled = !i || m;
  }, E = () => ({ font: S("font").value, fontSize: Number(S("size").value), color: S("color").value, detailed: S("detailed").checked, conventional: S("conventional").checked });
  t.value = ke;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || ke;
  } catch {
  }
  g(Object.values(ue).find((v) => v.source === t.value)), t.addEventListener("input", x);
  for (const v of ["font", "size", "color", "detailed", "conventional"]) S(v).addEventListener("input", x);
  S("zoom-in").onclick = () => R(0.8), S("zoom-out").onclick = () => R(1.25), S("fit").onclick = () => {
    d = { ...y }, w();
  };
  const P = (v) => {
    const O = e.querySelector("svg");
    return O ? new DOMPoint(v.clientX, v.clientY).matrixTransform(O.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (v) => {
    const O = P(v);
    O && (v.preventDefault(), R(v.deltaY > 0 ? 1.12 : 1 / 1.12, O.x, O.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (v) => {
    v.button !== 0 || !e.querySelector("svg") || (I = { start: P(v), x: v.clientX, y: v.clientY, view: { ...d }, moved: !1 }, e.setPointerCapture(v.pointerId));
  }), e.addEventListener("pointermove", (v) => {
    if (!I) return;
    const O = P(v);
    Math.hypot(v.clientX - I.x, v.clientY - I.y) > 4 && (I.moved = !0), d.x += I.start.x - O.x, d.y += I.start.y - O.y, w();
  }), e.addEventListener("pointerup", (v) => {
    if (!I) return;
    const O = I.moved;
    if (I = null, e.hasPointerCapture(v.pointerId) && e.releasePointerCapture(v.pointerId), !O) {
      const A = document.elementFromPoint(v.clientX, v.clientY)?.closest("[data-component]"), M = l?.components.find((L) => L.name === A?.dataset.component);
      M && (f = M.instanceId || "", S("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([L, V]) => `${L} → ${V}`).join("   ")}`, M.kind === "X" ? (K(M.instanceId), j()) : oe());
    }
  }), window.addEventListener("hashchange", () => {
    if (m) {
      b = !0;
      return;
    }
    D(), f = "", j();
  }), S("collapse-all").onclick = () => {
    N.clear(), j();
  }, S("expand-all").onclick = () => {
    for (const v of Object.keys(s?.contexts || {})) v && N.add(v);
    j();
  }, S("toggle-instance").onclick = () => {
    N.has(f) ? N.delete(f) : K(f), j();
  }, e.addEventListener("pointercancel", () => {
    I = null;
  }), e.addEventListener("keydown", (v) => {
    const O = v.target.closest("[data-instance]");
    if (O && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), f = O.dataset.instance, K(f), j();
      return;
    }
    v.key === "+" || v.key === "=" ? R(0.8) : v.key === "-" ? R(1.25) : v.key.toLowerCase() === "f" ? (d = { ...y }, w()) : v.key.startsWith("Arrow") && (v.preventDefault(), d.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[v.key] || 0) * d.w, d.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[v.key] || 0) * d.h, w());
  });
  async function j() {
    if (m) return;
    m = !0, i = "", u(), S("generate").disabled = !0, t.readOnly = !0, S("file").disabled = !0, S("libraries").disabled = !0;
    for (const O of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) O.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let v = [];
    try {
      if (c !== t.value || !s) {
        if (r = ot(t.value, { files: h }), v = [...r.diagnostics], v.some((k) => k.severity === "error"))
          throw s = null, Error("Fix the parser errors below before generating.");
        s = Et(r), c && c !== t.value ? (N.clear(), a = "", f = "", history.replaceState(null, "", location.pathname + location.search)) : D(), c = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (v = [...r.diagnostics], C(v), v.some((k) => k.severity === "error")) throw Error("Fix the parser errors below before generating.");
      l = vt(s, { expanded: N, focus: a });
      const O = St(l);
      E().conventional && v.push(...l.layout.diagnostics);
      const A = await Nt(O, E()), M = new DOMParser().parseFromString(A, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const L = M.documentElement, V = L.querySelector("#spice-layout-report");
      if (V) {
        l.layout.report = JSON.parse(V.textContent);
        const k = l.layout.report;
        v.push({ severity: "info", message: `Layout: compact signal flow; ${k.powerSourcesChecked} DC/ground symbols checked, ${k.powerOrderViolations} DC order preference(s) unmet. ${k.powerPass}. Global voltage bands are a preference.` }), k.groundPlacement && v.push({ severity: "info", message: `Ground: ${k.groundPlacement}; ${k.straightenedGroundDrops || 0} return-path simplification(s).` }), k.explicitGroups && v.push({ severity: "info", message: `Layout comments: ${k.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), k.classicRails && v.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${k.railCount} shared voltage rails.` }), k.geometricConnectivityVerified && v.push({ severity: "info", message: `Net geometry verified; ${k.cyclesRemoved} same-net loop(s) and ${k.leavesRemoved} unused wire branch(es) removed.` }), C(v);
      }
      if (L.localName !== "svg" || L.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const G = Number(L.getAttribute("width")), Z = Number(L.getAttribute("height"));
      y = { x: -20, y: -20, w: G + 40, h: Z + 40 }, d = { ...y }, L.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`), L.setAttribute("width", String(y.w)), L.setAttribute("height", String(y.h)), L.setAttribute("role", "img"), L.setAttribute("aria-label", l.title || "SPICE schematic"), L.setAttribute("style", "background:white");
      for (const k of l.components) {
        const T = M.getElementById("cell_" + k.name);
        if (!T) throw Error("Renderer omitted component " + k.name);
        T.setAttribute("data-component", k.name), k.kind === "X" && (T.setAttribute("data-instance", k.instanceId), T.setAttribute("role", "button"), T.setAttribute("tabindex", "0"), T.setAttribute("aria-label", "Expand " + k.name));
        const z = M.createElementNS(L.namespaceURI, "title");
        z.textContent = k.raw + `
Resolved: ` + k.value + `
` + Object.entries(k.terminals).map(([B, ie]) => B + ": " + ie).join(", "), T.prepend(z);
      }
      for (const k of Object.values(l.nodes))
        for (const T of L.querySelectorAll(".net_" + k.bit)) {
          T.setAttribute("data-net", k.name);
          const z = M.createElementNS(L.namespaceURI, "title");
          z.textContent = "Node " + k.displayName, T.append(z);
        }
      const Q = l.components.filter((k) => k.kind === "K").map((k) => ({ name: k.name, inductors: k.coupledInductors, value: k.value }));
      if (Q.length) {
        const k = M.createElementNS(L.namespaceURI, "metadata");
        k.setAttribute("id", "spice-magnetic-couplings"), k.textContent = JSON.stringify(Q), L.append(k);
        for (const T of Q) for (const z of T.inductors) {
          const B = M.getElementById("cell_" + z);
          if (!B) continue;
          const ie = M.createElementNS(L.namespaceURI, "circle"), fe = [...B.children].find((he) => he.getAttribute("s:pid") === "A"), Pe = fe?.getAttribute("s:position"), Ee = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Pe] || [0, 0];
          for (const [he, De] of Object.entries({ cx: Number(fe?.getAttribute("s:x")) + Ee[0], cy: Number(fe?.getAttribute("s:y")) + Ee[1], r: 3, fill: E().color, stroke: "none", "data-coupling": T.name })) ie.setAttribute(he, String(De));
          const we = M.createElementNS(L.namespaceURI, "title");
          we.textContent = T.name + " · dotted terminal: " + T.inductors.join(", "), ie.append(we), B.append(ie);
        }
      }
      i = new XMLSerializer().serializeToString(L), S("source").value = i, e.replaceChildren(document.importNode(L, !0)), w();
      const H = v.filter((k) => k.severity === "warning").length;
      n.textContent = `${l.components.filter((k) => !k.synthetic).length} components · ${Object.keys(l.nodes).length} nodes · ${l.topology.leafCount} primitive devices verified${H ? " · Review " + H + " warning(s); drawing may be partial." : " · Schematic ready."}`, l.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${l.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), l.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const J = Object.values(l.nodes).map((k) => {
        const T = document.createElement("tr");
        for (const z of [k.displayName, k.terminals.map((B) => B.component + "." + B.pin).join(", ")]) {
          const B = document.createElement("td");
          B.textContent = z, T.append(B);
        }
        return T;
      });
      S("nets").replaceChildren(...J), S("json").value = JSON.stringify({ circuit: l, netlist: O, hierarchy: r }, null, 2), S("selection").textContent = "Click a component to inspect its original statement and pin connections.", q();
    } catch (O) {
      if (e.replaceChildren(), i = "", S("source").value = "", S("json").value = "", S("nets").replaceChildren(), S("selection").textContent = "", n.textContent = O.message, !s)
        S("hierarchy-panel").hidden = !0, S("selection-actions").hidden = !0, S("breadcrumbs").replaceChildren();
      else if (!s.contexts[a]) {
        const A = document.createElement("button");
        A.type = "button", A.textContent = "Return to Top", A.onclick = () => U(""), S("breadcrumbs").replaceChildren(A);
      }
      O.diagnostics && (v = O.diagnostics), v.some((A) => A.severity === "error") || v.push({ severity: "error", line: 0, message: O.message }), C(v);
    } finally {
      m = !1, S("generate").disabled = !1, t.readOnly = !1, S("file").disabled = !1, S("libraries").disabled = !1;
      for (const O of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) O.disabled = !1;
      s && s.contexts[a] && q(), e.setAttribute("aria-busy", "false"), u(), b && (b = !1, D(), queueMicrotask(j));
    }
  }
  S("generate").onclick = j;
  for (const v of se.querySelectorAll("[data-example]")) v.onclick = () => {
    const O = ue[v.dataset.example];
    t.value = O.source, x(), g(O), j();
  };
  S("file").onchange = async (v) => {
    const O = v.target.files[0];
    if (O) {
      if (O.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Le(O), x(), j();
      } catch (A) {
        n.textContent = "File could not be read: " + A.message;
      } finally {
        v.target.value = "";
      }
    }
  }, S("libraries").onchange = async (v) => {
    try {
      for (const O of v.target.files) {
        if (O.size > 16e6) throw Error("Library exceeds 16 MB: " + O.name);
        h[O.webkitRelativePath || O.name] = await Le(O);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(h));
      } catch {
      }
      s = null, c = "", S("library-status").textContent = Object.keys(h).length + " library file(s) loaded", j();
    } catch (O) {
      n.textContent = O.message;
    } finally {
      v.target.value = "";
    }
  }, S("library-status").textContent = Object.keys(h).length ? "Libraries restored from this session." : "For .include / .lib dependencies", S("download").onclick = () => {
    const v = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), O = document.createElement("a");
    O.href = v, O.download = "spice-schematic.svg", O.click(), setTimeout(() => URL.revokeObjectURL(v), 1e3);
  }, S("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      S("source-details").open = !0, S("source").focus(), S("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
