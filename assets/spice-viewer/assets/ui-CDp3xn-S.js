const $e = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ge = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, We = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, He = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Xe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ze = { 1: "a", 2: "b", 7: "Q", 8: "com" }, qe = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ke = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ye = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ze = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Je = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, et = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, tt = {
  AND: $e,
  BUF: Ge,
  COUNTER: Fe,
  DFLOP: We,
  SCHMITT: He,
  OR: Xe,
  PHASEDET: ze,
  SRFLOP: qe,
  XOR: Ke,
  MODULATOR: Ye,
  OTA: Ze,
  SAMPLEHOLD: Je,
  VARISTOR: et
}, nt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ne = (t) => t.toLowerCase(), Re = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), rt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function ot(t, e) {
  const n = (v) => e[ne(v || "")] || Object.entries(e).find(([m]) => m.startsWith(ne(v || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let s = [], u = [], d = "", r = "", a = [], l = [], c = 0, y = "", p = "", g = "", b = !0;
  if ("RLC".includes(i))
    s = ["A", "B"], r = ne(i) + "_v";
  else if ("DVIB".includes(i))
    s = ["+", "-"], r = i === "D" ? "d_v" : i === "B" ? "spice_b" : ne(i);
  else if (i === "Q") {
    s = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Re(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && s.push("S"), d = t[s.length + 1] || "";
    const v = n(d)?.type;
    b = ["NPN", "PNP"].includes(v), r = b ? (s.length === 3 ? "q_" : "spice_q4_") + ne(v) : "spice_q" + s.length;
  } else if (i === "M") {
    const v = n(t[4]), m = n(t[5]), f = v?.type === "VDMOS" || !m && (!t[5] || Re(t[5]));
    s = f ? ["D", "G", "S"] : ["D", "G", "S", "B"], d = t[s.length + 1] || "";
    const C = n(d), _ = C?.type;
    if (f && C && _ !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!f && _ === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    b = ["NMOS", "PMOS", "VDMOS"].includes(_);
    let L = null, N = C;
    const O = /* @__PURE__ */ new Set();
    for (; N && !O.has(N.name) && (O.add(N.name), L = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(N.raw), !L); )
      N = n(N.baseModel);
    const x = _ === "PMOS" || _ === "VDMOS" && L && (L[1] === void 0 || Number(L[1]) >= 0.5);
    r = b ? "spice_" + (x ? "pmos" : "nmos") + (f ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    d = t[4] || "";
    const v = n(d)?.type, m = i === "Z" && ["NIGBT", "PIGBT"].includes(v);
    s = m ? ["C", "G", "E"] : ["D", "G", "S"], b = i === "J" ? ["NJF", "PJF"].includes(v) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(v), r = "spice_" + (m ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(v || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    s = ["+", "-"], r = "spice_" + ne(i);
    let v = 3, m = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[v] || "");
    if (/^poly$/i.test(t[v] || "") && (m = /^\(\s*(\d+)\s*\)$/.exec(t[++v] || ""), !m))
      throw Error("POLY requires a dimension.");
    if (m) {
      const f = Number(m[1]);
      if (f > 128) throw Error("POLY supports at most 128 controlling variables.");
      let C = v + 1, _ = [];
      const L = "EG".includes(i), N = f * (L ? 2 : 1);
      for (; _.length < N && C < t.length; ) _.push(...rt(t[C++]));
      if (_.length !== N || C >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (L) {
        for (let O = 0; O < f; O++) s.push("C" + (O + 1) + "+", "C" + (O + 1) + "-");
        u = [t[1], t[2], ..._];
      } else a = _;
      c = C, y = "POLY(" + f + ") " + (L ? "" : _.join(" ") + " "), p = "POLY", L && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(i) ? (s.push("C+", "C-"), p = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (a = [t[3]], c = 4, y = t[3] + " ");
    g = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (p ? " · " + p : "");
  } else if (i === "S")
    s = ["A", "B", "C+", "C-"], d = t[5] || "", r = "spice_device", g = "Voltage switch";
  else if (i === "W")
    s = ["A", "B"], a = [t[3]], d = t[4] || "", c = 3, r = "spice_device", g = "Current switch";
  else if ("TO".includes(i))
    s = ["L+", "L-", "R+", "R-"], i === "O" && (d = t[5] || ""), r = "spice_device", g = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    s = ["N1", "N2", "COM"], d = t[4] || "", r = "spice_device", g = "Distributed RC";
  else if (i === "A")
    s = Array.from({ length: 8 }, (v, m) => "P" + (m + 1)), r = "spice_device", g = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (l = t.slice(1, -1), l.some((v) => !/^L/i.test(v.split(":").at(-1)))) throw Error("K references must name inductors.");
    c = t.length - 1, r = "spice_coupling", g = "Magnetic coupling", y = l.join(" ") + " · k=";
  } else if (i === "@")
    s = ["IN", "OUT"], r = "spice_device", g = "FRA";
  else if (i === "&")
    s = ["O+", "O-", "I+", "I-"], r = "spice_device", g = "FRA probe";
  else if (i === "Ö")
    s = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", g = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (c || (c = s.length + 1), u.length || (u = t.slice(1, s.length + 1)), u.length !== s.length) throw Error("Incomplete terminal list: expected " + s.length + " nodes.");
  if (t.length <= c && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + s.length + " terminals.");
  if (u.some((v) => /[=()]/.test(v) && !/^\{[\s\S]*\}$/.test(v))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(c).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(c).join(" ")) && (r = "spice_br"), i === "D" && (d = t[3] || ""), i === "@") {
    const v = t.slice(c).join(" ");
    for (const m of v.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      s.push(m[1].toUpperCase()), u.push(m[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (a.some((v) => !v)) throw Error("Missing controlling voltage source.");
  const h = s.map((v, m) => i === "A" && tt[(t[9] || "").toUpperCase()]?.[String(m + 1)] || v);
  return { kind: i, pins: s, nodeTokens: u, pinLabels: h, model: d, type: r, controlSource: a[0] || "", controlSources: a, coupledInductors: l, value: y + t.slice(c).join(" "), sourceMode: p, symbol: g, polarityKnown: b };
}
const it = nt, st = new Set(it.split(" ")), be = () => /* @__PURE__ */ Object.create(null), q = (t) => t.toLowerCase();
function fe(t) {
  const e = [], n = [];
  let i = "", s = 0, u = "";
  for (let d = 0; d < t.length; d++) {
    const r = t[d];
    if (u) {
      i += r, r === u && t[d - 1] !== "\\" && (u = "");
      continue;
    }
    if (r === '"' || r === "'") {
      u = r, i += r;
      continue;
    }
    if (!s && (r === ";" || r === "$" && (!d || /\s/.test(t[d - 1])))) break;
    if ("({".includes(r) && (n.push(r), s++), ")}".includes(r) && (s--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !s ? (i && e.push(i), i = "") : i += r;
  }
  if (s || u) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function at(t, e = {}) {
  const n = [], i = [], s = [], u = Object.assign(be(), e.models), d = be(), r = (m, f, C) => n.push({ severity: m, line: f, message: C });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const a = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, f) => {
    const C = m.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? a.length ? a.at(-1).text += " " + C.slice(1).trim() : r("error", f + 1, "Continuation has no preceding statement.") : a.push({ line: f + 1, text: C }));
  });
  for (const m of a) {
    try {
      m.tokens = fe(m.text);
    } catch (C) {
      r("error", m.line, C.message), m.tokens = [];
    }
    const f = m.tokens;
    if (/^\.model$/i.test(f[0] || ""))
      if (f.length < 3) r("error", m.line, ".model requires a name and device type.");
      else {
        const C = /^ako:(.+)$/i.exec(f[2]), _ = C && f[3] && !f[3].startsWith("(") ? f[3].split("(")[0].toUpperCase() : "";
        u[q(f[1])] = { name: f[1], type: C ? _ : f[2].split("(")[0].toUpperCase(), baseModel: C?.[1] || "", raw: m.text };
      }
  }
  const l = /* @__PURE__ */ new Set();
  function c(m) {
    const f = u[q(m)];
    if (!f) return "";
    if (f.type) return f.type;
    if (l.has(q(m))) throw Error("Circular AKO model inheritance: " + m);
    return l.add(q(m)), f.type = c(f.baseModel), l.delete(q(m)), f.type;
  }
  for (const m of Object.values(u)) if (m.baseModel && !m.type)
    try {
      c(m.name);
    } catch (f) {
      r("error", 0, f.message);
    }
  let y = "", p = 0, g = !1, b = !1;
  const h = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: m, text: f, tokens: C } of a) {
    if (!C.length) continue;
    const _ = q(C[0]);
    if (b) {
      r("warning", m, "Statement after .end is not rendered: " + f);
      continue;
    }
    if (_ === ".control") {
      g = !0, r("warning", m, ".control script retained but not executed or rendered.");
      continue;
    }
    if (_ === ".endc") {
      g = !1;
      continue;
    }
    if (g) continue;
    if (_ === ".subckt") {
      p++, r("error", m, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (_ === ".ends") {
      p ? p-- : r("error", m, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (_ === ".end") {
      b = !0;
      continue;
    }
    if (_.startsWith(".")) {
      i.push({ line: m, text: f }), _ === ".title" ? y = C.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(_) ? r("error", m, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(_) ? r("error", m, "Topology-changing directive is unsupported: " + f) : v.has(_) || r("warning", m, "Directive retained but not resolved: " + f);
      continue;
    }
    const L = C[0][0].toUpperCase();
    if (!st.has(L)) {
      m === 1 && !/\d/.test(C[0]) && C.length > 1 && L !== "X" ? (y = f, r("warning", m, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", m, `Unsupported ${L} device was not rendered: ${f}`);
      continue;
    }
    const N = L === "M" || L === "Q" ? 5 : 4;
    if (m === 1 && !/\d/.test(C[0]) && (C.length < N || L === "T" && !/\b(?:zo|z0)\s*=/i.test(f))) {
      y = f, r("info", m, "SPICE title: " + f);
      continue;
    }
    try {
      if (h.has(_)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const O = ot(C, u), { pins: x, nodeTokens: o, ...E } = O;
      O.polarityKnown || r("warning", m, `${C[0]}: model polarity unknown; explicit ${x.join("/")} terminals retained.`);
      const R = be();
      x.forEach((U, T) => {
        const V = q(o[T]);
        d[V] || (d[V] = { name: V, displayName: C[T + 1], bit: Object.keys(d).length + 2, terminals: [] }), d[V].terminals.push({ component: C[0], pin: U }), R[U] = V;
      }), s.push({ ...E, name: C[0], terminals: R, line: m, raw: f }), h.add(_);
    } catch (O) {
      r("error", m, `${C[0]}: ${O.message} Statement: ${f}`);
    }
  }
  p && r("error", 0, "Unclosed .subckt definition."), g && r("error", 0, "Unclosed .control block."), s.length || r("error", 0, "No supported components to render."), s.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const m of s) {
    for (const f of m.controlSources || []) !f.includes(":") && !s.some((C) => q(C.name) === q(f) && C.kind === "V") && r("error", m.line, `${m.name}: controlling voltage source ${f} was not found.`);
    for (const f of m.coupledInductors || []) !f.includes(":") && !s.some((C) => q(C.name) === q(f) && C.kind === "L") && r("error", m.line, `${m.name}: coupled inductor ${f} was not found.`);
    (m.kind === "B" || m.type === "spice_b") && r("info", m.line, `${m.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: y, components: s, nodes: d, models: u, directives: i, diagnostics: n };
}
const J = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Se = (t) => J(t).split("/").at(-1);
function ct(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), s = [], u = [], d = [];
  let r = 0;
  const a = (c, y) => {
    const p = J(y).split("/").slice(0, -1).concat(J(c)).join("/"), g = [...i].filter(([h]) => J(h) === J(c) || J(h) === p);
    if (g.length === 1) return g[0];
    const b = [...i].filter(([h]) => Se(h) === Se(c));
    if (b.length !== 1) throw Error(b.length ? "Ambiguous library filename: " + c : "Missing library " + c + ". Add this file using Library files.");
    return b[0];
  };
  function l(c, y, p = "", g = []) {
    const b = J(y) + ":" + p.toLowerCase();
    if (g.includes(b)) throw Error("Circular library include: " + [...g, b].join(" → "));
    if (g.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const h = [], v = /^\s*\.endl\b/im.test(c);
    let m = !p;
    const f = (_, L) => {
      if (r += _.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      d.push(_), u.push({ file: y, line: L + 1 });
    };
    if (c.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((_, L) => {
      const N = _.trim();
      if (/^\.lib\b/i.test(N) && v) {
        const O = fe(N);
        if (O.length === 2 && !/[.\\/]/.test(O[1])) {
          h.push(O[1].toLowerCase()), O[1].toLowerCase() === p.toLowerCase() && (m = !0), f("* Library section " + O[1], L);
          return;
        }
      }
      if (/^\.endl\b/i.test(N)) {
        h.pop(), f("* End library section", L);
        return;
      }
      if (p && h.length && !h.includes(p.toLowerCase())) {
        f("* Unselected library section", L);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(N))
        try {
          const O = fe(N);
          if (!O[1]) throw Error("Include requires a filename.");
          const [x, o] = a(O[1], y);
          f("* Included " + x, L), l(o, x, O[2] || "", [...g, b]);
        } catch (O) {
          s.push({ severity: "error", line: L + 1, source: y, message: O.message }), f("* Unresolved include", L);
        }
      else f(_, L);
    }), !m) throw Error("Library section " + p + " not found in " + y);
  }
  try {
    l(t, n);
  } catch (c) {
    s.push({ severity: "error", line: 0, source: n, message: c.message });
  }
  return { source: d.join(`
`), origins: u, diagnostics: s };
}
function lt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], s = [];
  t.split(/\r?\n/).forEach((r, a) => {
    const l = r.trim();
    /^\.subckt\b/i.test(l) && (i.push(a + 1), n.set(a + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: r, line: a + 1 }) : e[a] = r, /^\.ends\b/i.test(l) && i.length > 1 && i.pop();
  });
  const u = xe(Array.from({ length: t.split(/\r?\n/).length }, (r, a) => e[a] || "").join(`
`));
  s.push(...u.diagnostics);
  const d = /* @__PURE__ */ new Map();
  for (const [r, a] of n) {
    const l = xe(a.map((c) => c.raw).join(`
`));
    d.set(r, l.layout), s.push(...l.diagnostics.map((c) => ({ ...c, line: a[c.line - 1]?.line || r })));
  }
  return { layout: u.layout, scopes: d, diagnostics: s };
}
function xe(t) {
  const e = [], n = [];
  let i = !1, s = !1, u = 0;
  if (t.split(/\r?\n/).forEach((f, C) => {
    const _ = f.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(_)) {
      (s || i) && e.push({ severity: "error", line: C + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(_) || e.push({ severity: "error", line: C + 1, message: "Expected @layout begin v1." }), s = !0, i = !0, u = C + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(_)) {
      i || e.push({ severity: "error", line: C + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (_.startsWith("*") ? n.push(_.slice(1).trim()) : e.push({ severity: "error", line: C + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !s) return { layout: null, diagnostics: e };
  const d = n.join(" "), r = d.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], a = [], l = [], c = [], y = [];
  let p = 0, g = 0, b = 10;
  const h = () => r[p++], v = () => {
    const f = h();
    if (!f || !/^[A-Za-z_@][\w./%:@-]*$/.test(f)) throw Error("Expected layout identifier, got " + f);
    return f;
  };
  function m(f) {
    if (a.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const C = f ? v() : "@row" + g++, _ = h();
    if (!["row", "column", "classic"].includes(_)) throw Error("Expected row, column or classic.");
    if (h() !== "{") throw Error("Expected { after " + _);
    const L = { id: C, direction: _, members: [] };
    for (a.push(L); p < r.length && r[p] !== "}"; )
      r[p] === "group" ? (h(), L.members.push(m(!0))) : ["row", "column"].includes(r[p]) ? L.members.push(m(!1)) : L.members.push(v());
    if (h() !== "}") throw Error("Unclosed group " + C);
    if (!L.members.length) throw Error("Empty layout group " + C);
    return C;
  }
  try {
    for (; p < r.length; )
      if (r[p] === "group")
        h(), m(!0);
      else if (["row", "column"].includes(r[p])) m(!1);
      else if (r[p] === "face") {
        h();
        const o = v(), E = h();
        if (!["left", "right"].includes(E)) throw Error("Expected face left or right.");
        if (y.some((R) => R.device.toLowerCase() === o.toLowerCase())) throw Error("Duplicate face device.");
        y.push({ device: o, side: E });
      } else if (r[p] === "pair") {
        h();
        const o = h();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(o)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (h() !== "{") throw Error("Expected { after pair kind.");
        const E = [];
        for (; p < r.length && r[p] !== "}"; ) E.push(v());
        if (h() !== "}" || !E.length) throw Error("Empty or unclosed pair.");
        if (c.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        c.push({ kind: o, members: E });
      } else if (r[p] === "priority-cap") {
        if (h(), b = Number(h()), !Number.isInteger(b) || b < 3 || b > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (h() === "place") {
        const o = v(), E = h(), R = v();
        if (!["left-of", "above"].includes(E)) throw Error("Expected left-of or above.");
        l.push({ a: o, relation: E, b: R });
      } else throw Error("Unknown layout instruction near " + r[p - 1]);
    const f = /* @__PURE__ */ new Set();
    for (const o of a) {
      const E = o.id.toLowerCase();
      if (f.has(E)) throw Error("Duplicate layout group " + o.id);
      f.add(E);
    }
    const C = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set(), L = new Map(a.map((o) => [o.id.toLowerCase(), o])), N = (o) => {
      if (C.has(o)) throw Error("Circular layout group " + o);
      if (!_.has(o)) {
        C.add(o);
        for (const E of L.get(o).members) L.has(E.toLowerCase()) && N(E.toLowerCase());
        C.delete(o), _.add(o);
      }
    };
    for (const o of L.keys()) N(o);
    const O = /* @__PURE__ */ new Map();
    for (const o of l) {
      if (o.a.toLowerCase() === o.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      O.has(o.a.toLowerCase()) || O.set(o.a.toLowerCase(), []), O.get(o.a.toLowerCase()).push(o.b.toLowerCase());
    }
    C.clear(), _.clear();
    const x = (o) => {
      if (C.has(o)) throw Error("Circular place constraints.");
      if (!_.has(o)) {
        C.add(o);
        for (const E of O.get(o) || []) x(E);
        C.delete(o), _.add(o);
      }
    };
    for (const o of O.keys()) x(o);
  } catch (f) {
    e.push({ severity: "error", line: u, message: "Layout description: " + f.message });
  }
  return { layout: { version: 1, priorityCap: b, groups: a, relations: l, pairs: c, faces: y }, diagnostics: e };
}
function dt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const g = new Set(n.groups.map((h) => h.id.toLowerCase())), b = (h) => g.has(h.toLowerCase()) ? h : e.components.find((m) => m.synthetic && m.value.toLowerCase() === h.toLowerCase())?.name || e.focus + "/" + h;
    i = { ...n, groups: n.groups.map((h) => ({ ...h, members: h.members.map(b) })), relations: n.relations.map((h) => ({ ...h, a: b(h.a), b: b(h.b) })), faces: (n.faces || []).map((h) => ({ ...h, device: b(h.device) })), pairs: (n.pairs || []).map((h) => ({ ...h, members: h.members.map(b) })) };
  }
  const s = new Map(i.groups.map((g) => [g.id.toLowerCase(), g])), u = Object.values(t.contexts).flatMap((g) => g.devices.map((b) => b.name)), d = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((g) => g.name)].map((g) => g.toLowerCase()));
  for (const g of s.values()) if (d.has((n ? e.focus + "/" + g.id : g.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + g.id);
  for (const g of s.values()) for (const b of g.members) if (!s.has(b.toLowerCase()) && !d.has(b.toLowerCase())) throw Error("Unknown @layout instance/device: " + b);
  for (const g of i.relations) for (const b of [g.a, g.b]) if (!s.has(b.toLowerCase()) && !d.has(b.toLowerCase())) throw Error("Unknown @layout place target: " + b);
  const r = (i.pairs || []).map((g) => ({ ...g, members: g.members.map((b) => {
    const h = e.components.find((v) => v.name.toLowerCase() === b.toLowerCase());
    if (!h || h.synthetic || h.block) throw Error("Unknown or non-visible @layout pair device: " + b);
    return h.name;
  }) })), a = (i.faces || []).map((g) => {
    const b = e.components.find((h) => h.name.toLowerCase() === g.device.toLowerCase());
    if (!b || !["Q", "M", "J", "Z"].includes(b.kind)) throw Error("Unknown or unsupported @layout face device: " + g.device);
    return { ...g, device: b.name };
  }), l = /* @__PURE__ */ new Map(), c = [], y = new Set(Object.keys(t.contexts).map((g) => g.toLowerCase()));
  for (const g of i.groups) {
    const b = [];
    for (const h of g.members) {
      if (s.has(h.toLowerCase())) {
        b.push({ group: h });
        continue;
      }
      for (const v of e.components) if (v.name.toLowerCase() === h.toLowerCase() || v.name.toLowerCase().startsWith(h.toLowerCase() + "/")) {
        if (l.has(v.name)) throw Error("Overlapping @layout membership: " + v.name);
        l.set(v.name, g.id), b.push({ cell: v.name, ...y.has(h.toLowerCase()) ? { instance: h } : {} });
      }
    }
    c.push({ id: g.id, direction: g.direction, members: b });
  }
  const p = /* @__PURE__ */ new Set();
  for (const g of c) for (const b of g.members) if (b.group) {
    const h = b.group.toLowerCase();
    if (p.has(h)) throw Error("Layout group has multiple parents: " + b.group);
    p.add(h);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: c, relations: i.relations, pairs: r, faces: a };
}
const oe = () => /* @__PURE__ */ Object.create(null), H = (t) => t.toLowerCase();
function Me(t) {
  const e = oe();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const s = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!s) throw Error("Expected named parameter assignment, got: " + i);
    const u = H(s[1]);
    let d = s[2];
    if (d === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + u);
      d = r[1];
    }
    if (d || (d = t[++n]), !d || /^params?:$/i.test(d)) throw Error("Missing value for parameter " + u);
    if (Object.hasOwn(e, u)) throw Error("Duplicate parameter: " + u);
    e[u] = d;
  }
  return e;
}
function Le(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, oe()] : [t.slice(0, e), Me(t.slice(e))];
}
function ut(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = ct(t, e);
  t = n.source;
  const i = lt(t), s = [...n.diagnostics, ...i.diagnostics], u = oe(), d = /* @__PURE__ */ new Set(["0"]), r = (f, C, _) => s.push({ severity: f, line: C, message: _ }), a = (f, C, _, L = [], N = oe(), O = 0) => {
    const x = { id: f, name: C, parent: _, ports: L, defaults: N, parameters: oe(), definitions: oe(), devices: [], instances: [], directives: [], line: O, statements: [], layoutDescription: i.scopes.get(O) || null };
    return u[f] = x, x;
  }, l = a("root", "Top", null), c = [l], y = [];
  let p = !1, g = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((f, C) => {
    const _ = f.trim();
    !_ || _.startsWith("*") || (_.startsWith("+") ? y.length ? y.at(-1).text += " " + _.slice(1).trim() : r("error", C + 1, "Continuation has no preceding statement.") : y.push({ text: _, line: C + 1 }));
  });
  for (const { text: f, line: C } of y)
    try {
      const _ = fe(f);
      if (!_.length) continue;
      const L = H(_[0]), N = c.at(-1);
      if (g) {
        r("warning", C, "Statement after .end is not rendered: " + f);
        continue;
      }
      if (L === ".control") {
        p = !0, r("warning", C, ".control script retained but not executed or rendered.");
        continue;
      }
      if (L === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (L === ".subckt") {
        if (_.length < 2) throw Error(".SUBCKT requires a name.");
        const [O, x] = Le(_.slice(2)), o = H(_[1]);
        if (Object.hasOwn(N.definitions, o)) throw Error("Duplicate subcircuit definition: " + _[1]);
        const E = O.map(H);
        if (new Set(E).size !== O.length || E.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (O.some((U) => /[{}()=]/.test(U))) throw Error("Invalid formal port.");
        if (c.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const R = N.id + "/" + encodeURIComponent(o);
        N.definitions[o] = R, c.push(a(R, _[1], N.id, O, x, C));
        continue;
      }
      if (L === ".ends") {
        if (c.length === 1) throw Error("Unmatched .ENDS.");
        if (_[1] && H(_[1]) !== H(N.name)) throw Error(".ENDS name does not match " + N.name);
        c.pop();
        continue;
      }
      if (L === ".end") {
        if (c.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        g = !0;
        continue;
      }
      if (L === ".param") {
        const O = Me(_.slice(1));
        for (const [x, o] of Object.entries(O)) {
          if (Object.hasOwn(N.parameters, x)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + x);
          N.parameters[x] = o;
        }
      }
      if (L === ".global") {
        if (_.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const O of _.slice(1)) d.add(H(O));
      }
      if (L.startsWith(".") && N.directives.push({ line: C, text: f }), L.startsWith("x")) {
        const [O, x] = Le(_.slice(1));
        if (!O.length) throw Error("X instance requires a subcircuit name.");
        const o = /;§pnba\s+(.+)$/i.exec(f)?.[1].split(")");
        N.instances.push({ name: _[0], nodes: O.slice(0, -1).map(H), definitionName: O.at(-1), definitionId: null, parameters: x, line: C, raw: f, pinNames: o });
      } else N.statements.push({ line: C, text: f });
    } catch (_) {
      r("error", C, _.message + " Statement: " + f);
    }
  c.length > 1 && r("error", c.at(-1).line, "Unclosed .SUBCKT " + c.at(-1).name), p && r("error", 0, "Unclosed .control block.");
  function b(f, C) {
    for (; f; ) {
      if (Object.hasOwn(f.definitions, H(C))) return f.definitions[H(C)];
      f = u[f.parent];
    }
    return null;
  }
  for (const f of Object.values(u)) {
    const C = [...f.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...f.statements], _ = at(C.map((N) => N.text).join(`
`), { models: u[f.parent]?.models });
    f.devices = _.components.map((N) => ({ ...N, line: C[N.line - 1]?.line || f.line })), f.models = _.models, f === l && (l.title = _.title), s.push(..._.diagnostics.filter((N) => !N.message.includes("No supported components to render.") && !N.message.includes("300 components")).map((N) => ({ ...N, line: C[N.line - 1]?.line || f.line })));
    const L = new Set(f.devices.map((N) => H(N.name)));
    for (const N of f.instances)
      if (L.has(H(N.name)) && r("error", N.line, "Duplicate instance/device name: " + N.name), L.add(H(N.name)), N.definitionId = b(f, N.definitionName), !N.definitionId && !/^\{[\s\S]*\}$/.test(N.definitionName)) r("error", N.line, "Undefined subcircuit: " + N.definitionName + " in " + N.name);
      else if (N.definitionId) {
        const O = u[N.definitionId];
        O.ports.length !== N.nodes.length && r("error", N.line, `${N.name}: ${O.name} expects ${O.ports.length} ports; got ${N.nodes.length}.`);
      }
  }
  for (const f of Object.values(u)) delete f.statements;
  const h = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set();
  function m(f, C = []) {
    if (h.has(f)) {
      r("error", u[f].line, "Circular subcircuit reference: " + [...C, u[f].name].join(" → "));
      return;
    }
    if (!v.has(f)) {
      if (h.add(f), C.length >= 64) {
        r("error", u[f].line, "Subcircuit dependency nesting exceeds 64 levels."), h.delete(f), v.add(f);
        return;
      }
      for (const _ of u[f].instances) _.definitionId && m(_.definitionId, [...C, u[f].name]);
      h.delete(f), v.add(f);
    }
  }
  for (const f of Object.keys(u)) m(f);
  !l.devices.length && !l.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const f of s) !f.source && f.line && n.origins[f.line - 1] && (f.source = n.origins[f.line - 1].file, f.line = n.origins[f.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: l.title || "", scopes: u, globals: [...d], diagnostics: s, layoutDescription: i.layout };
}
const j = () => /* @__PURE__ */ Object.create(null), re = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), Ee = (t, e) => re(t.map((n) => n.toLowerCase()), e.toLowerCase());
function pt(t, e = []) {
  const n = j(), i = (s) => n[s] || (n[s] = { name: s, displayName: s.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const s of t) for (const [u, d] of Object.entries(s.terminals)) i(d).terminals.push({ component: s.name, pin: u });
  for (const s of e) i(s);
  return n;
}
function ft(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ke = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, mt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function me(t, e, n = (s) => s, i = (s) => s) {
  const s = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (d) => (s.push(d), "@@" + (s.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (d, r, a) => {
    const l = a.split(",").map((y) => y.trim());
    if (l.some((y) => !y || /[\s{}+*()]/.test(y))) throw Error("Unsupported dynamic voltage/current reference: " + d);
    const c = r.toUpperCase() + "(" + l.map((y) => r.toLowerCase() === "v" ? n(y) : i(y, r)).join(",") + ")";
    return s.push(c), "@@" + (s.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(mt, (d, r, a) => {
    if (a.slice(r + d.length).trimStart().startsWith("(")) return d;
    const l = e(d.toLowerCase());
    if (l === void 0) return d;
    if (u += l.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + l + ")";
  }), t.replace(/@@(\d+)@@/g, (d, r) => s[Number(r)]);
}
function ht(t, e, n, i) {
  const s = { ...e, ...n }, u = j(), d = /* @__PURE__ */ new Set(), r = j();
  for (const [l, c] of Object.entries(i)) r[l] = me(ke(c), (y) => t[y]);
  function a(l) {
    if (Object.hasOwn(r, l)) return r[l];
    if (Object.hasOwn(u, l)) return u[l];
    if (!Object.hasOwn(s, l)) return t[l];
    if (d.has(l)) {
      if (Object.hasOwn(t, l)) return t[l];
      throw Error("Circular parameter dependency: " + [...d, l].join(" → "));
    }
    return d.add(l), u[l] = me(ke(s[l]), a), d.delete(l), u[l];
  }
  for (const l of Object.keys(s)) a(l);
  return Object.assign(j(), t, u, r);
}
function we(t, e, n, i) {
  let s = "";
  for (let a = 0; a < t.length; ) {
    const l = t[a];
    if (l !== "{" && l !== "'") {
      s += l, a++;
      continue;
    }
    const c = a++;
    let y = 1, p = "";
    for (; a < t.length && y; a++) {
      if (l === "'") {
        t[a] === "'" && (y = 0);
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
      t[a] === "{" && y++, t[a] === "}" && y--;
    }
    if (y) throw Error("Unclosed parameter expression.");
    s += l + me(t.slice(c + 1, a - 1), (g) => e[g], n, i) + (l === "{" ? "}" : "'");
  }
  const u = [];
  let d = 0, r = "";
  for (let a = 0; a < s.length; a++) {
    const l = s[a];
    if (r) {
      l === r && s[a - 1] !== "\\" && (r = "");
      continue;
    }
    if (l === '"' || l === "'") {
      r = l;
      continue;
    }
    if ("({".includes(l) && d++, ")}".includes(l) && d--, !d && (a === 0 || /\s/.test(s[a - 1]))) {
      const c = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(s.slice(a));
      c && (u.push({ start: a, end: a + c[0].length, key: c[1].toLowerCase() }), a += c[0].length - 1);
    }
  }
  if (u.length) {
    let a = s.slice(0, u[0].start);
    u.forEach((l, c) => {
      const y = u[c + 1]?.start ?? s.length, p = s.slice(l.end, y);
      a += s.slice(l.start, l.end) + (p.includes("{") || ["refnode", "intnode"].includes(l.key) ? p : me(p, (g) => e[g], n, i));
    }), s = a;
  } else Object.hasOwn(e, t.toLowerCase()) && (s = "{" + e[t.toLowerCase()] + "}");
  return s;
}
class gt {
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
  add(e, n, i) {
    if (typeof arguments[0] != "string")
      for (let s in arguments[0])
        this.add(s, arguments[0][s], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(s) {
        this[s] = this[s] || [], n && this[s][i ? "unshift" : "push"](n);
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
    this[e] = this[e] || [], this[e].forEach(function(i) {
      i.call(n && n.context ? n.context : n, n);
    });
  }
}
class bt {
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
class w {
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
    return "JavaScript Expression Parser (JSEP) v" + w.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return w.max_unop_len = Math.max(e.length, w.max_unop_len), w.unary_ops[e] = 1, w;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return w.max_binop_len = Math.max(e.length, w.max_binop_len), w.binary_ops[e] = n, i ? w.right_associative.add(e) : w.right_associative.delete(e), w;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return w.additional_identifier_chars.add(e), w;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return w.literals[e] = n, w;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete w.unary_ops[e], e.length === w.max_unop_len && (w.max_unop_len = w.getMaxKeyLen(w.unary_ops)), w;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return w.unary_ops = {}, w.max_unop_len = 0, w;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return w.additional_identifier_chars.delete(e), w;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete w.binary_ops[e], e.length === w.max_binop_len && (w.max_binop_len = w.getMaxKeyLen(w.binary_ops)), w.right_associative.delete(e), w;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return w.binary_ops = {}, w.max_binop_len = 0, w;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete w.literals[e], w;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return w.literals = {}, w;
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
    return new w(e).parse();
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
    return w.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !w.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    w.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return w.isIdentifierStart(e) || w.isDecimalDigit(e);
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
    if (w.hooks[e]) {
      const i = { context: this, node: n };
      return w.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (w.hooks[e]) {
      const n = { context: this };
      return w.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === w.SPACE_CODE || e === w.TAB_CODE || e === w.LF_CODE || e === w.CR_CODE; )
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
      type: w.COMPOUND,
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
    let n = [], i, s;
    for (; this.index < this.expr.length; )
      if (i = this.code, i === w.SEMCOL_CODE || i === w.COMMA_CODE)
        this.index++;
      else if (s = this.gobbleExpression())
        n.push(s);
      else if (this.index < this.expr.length) {
        if (i === e)
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
    let e = this.expr.substr(this.index, w.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (w.binary_ops.hasOwnProperty(e) && (!w.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !w.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, s, u, d, r, a, l;
    if (d = this.gobbleToken(), !d || (n = this.gobbleBinaryOp(), !n))
      return d;
    for (u = { value: n, prec: w.binaryPrecedence(n), right_a: w.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), s = [d, u, r]; n = this.gobbleBinaryOp(); ) {
      if (i = w.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: i, right_a: w.right_associative.has(n) }, l = n;
      const c = (y) => u.right_a && y.right_a ? i > y.prec : i <= y.prec;
      for (; s.length > 2 && c(s[s.length - 2]); )
        r = s.pop(), n = s.pop().value, d = s.pop(), e = {
          type: w.BINARY_EXP,
          operator: n,
          left: d,
          right: r
        }, s.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + l), s.push(u, e);
    }
    for (a = s.length - 1, e = s[a]; a > 1; )
      e = {
        type: w.BINARY_EXP,
        operator: s[a - 1].value,
        left: s[a - 2],
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
    let e, n, i, s;
    if (this.gobbleSpaces(), s = this.searchHook("gobble-token"), s)
      return this.runHook("after-token", s);
    if (e = this.code, w.isDecimalDigit(e) || e === w.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === w.SQUOTE_CODE || e === w.DQUOTE_CODE)
      s = this.gobbleStringLiteral();
    else if (e === w.OBRACK_CODE)
      s = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, w.max_unop_len), i = n.length; i > 0; ) {
        if (w.unary_ops.hasOwnProperty(n) && (!w.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !w.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: w.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      w.isIdentifierStart(e) ? (s = this.gobbleIdentifier(), w.literals.hasOwnProperty(s.name) ? s = {
        type: w.LITERAL,
        value: w.literals[s.name],
        raw: s.name
      } : s.name === w.this_str && (s = { type: w.THIS_EXP })) : e === w.OPAREN_CODE && (s = this.gobbleGroup());
    }
    return s ? (s = this.gobbleTokenProperty(s), this.runHook("after-token", s)) : this.runHook("after-token", !1);
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
    for (; n === w.PERIOD_CODE || n === w.OBRACK_CODE || n === w.OPAREN_CODE || n === w.QUMARK_CODE; ) {
      let i;
      if (n === w.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== w.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === w.OBRACK_CODE ? (e = {
        type: w.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== w.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === w.OPAREN_CODE ? e = {
        type: w.CALL_EXP,
        arguments: this.gobbleArguments(w.CPAREN_CODE),
        callee: e
      } : (n === w.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: w.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), i && (e.optional = !0), this.gobbleSpaces(), n = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", n, i;
    for (; w.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === w.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); w.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); w.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      w.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, w.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === w.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === w.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: w.LITERAL,
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
    const n = this.index, i = this.expr.charAt(this.index++);
    let s = !1;
    for (; this.index < this.expr.length; ) {
      let u = this.expr.charAt(this.index++);
      if (u === i) {
        s = !0;
        break;
      } else if (u === "\\")
        switch (u = this.expr.charAt(this.index++), u) {
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
            e += u;
        }
      else
        e += u;
    }
    return s || this.throwError('Unclosed quote after "' + e + '"'), {
      type: w.LITERAL,
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
    for (w.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, w.isIdentifierPart(e)); )
      this.index++;
    return {
      type: w.IDENTIFIER,
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
    let i = !1, s = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let u = this.code;
      if (u === e) {
        i = !0, this.index++, e === w.CPAREN_CODE && s && s >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (u === w.COMMA_CODE) {
        if (this.index++, s++, s !== n.length) {
          if (e === w.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === w.CBRACK_CODE)
            for (let d = n.length; d < s; d++)
              n.push(null);
        }
      } else if (n.length !== s && s !== 0)
        this.throwError("Expected comma");
      else {
        const d = this.gobbleExpression();
        (!d || d.type === w.COMPOUND) && this.throwError("Expected comma"), n.push(d);
      }
    }
    return i || this.throwError("Expected " + String.fromCharCode(e)), n;
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
    let e = this.gobbleExpressions(w.CPAREN_CODE);
    if (this.code === w.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: w.SEQUENCE_EXP,
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
      type: w.ARRAY_EXP,
      elements: this.gobbleArguments(w.CBRACK_CODE)
    };
  }
}
const Et = new gt();
Object.assign(w, {
  hooks: Et,
  plugins: new bt(w),
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
w.max_unop_len = w.getMaxKeyLen(w.unary_ops);
w.max_binop_len = w.getMaxKeyLen(w.binary_ops);
const se = (t) => new w(t).parse(), wt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(w).filter((t) => !wt.includes(t) && se[t] === void 0).forEach((t) => {
  se[t] = w[t];
});
se.Jsep = w;
const yt = "ConditionalExpression";
var _t = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, s = this.gobbleExpression();
        if (s || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: yt,
            test: i,
            consequent: s,
            alternate: u
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let d = i;
            for (; d.right.operator && t.binary_ops[d.right.operator] <= 0.9; )
              d = d.right;
            n.node.test = d.right, d.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(_t);
const Nt = "ConditionalExpression";
var Ct = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, s = this.gobbleExpression();
        if (s || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: Nt,
            test: i,
            consequent: s,
            alternate: u
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let d = i;
            for (; d.right.operator && t.binary_ops[d.right.operator] <= 0.9; )
              d = d.right;
            n.node.test = d.right, d.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(Ct);
const It = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Pe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, W = (t) => Number(t) > 0.5;
function de(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function s(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (a) => {
      if (a[0] === '"' || a[0] === "'") return a;
      const [, l, c, y] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(a), p = c.toLowerCase(), g = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : It[p[0]] || 1;
      return "(" + (y ? +(l + (l.includes(".") ? "" : ".") + y) : Number(l)) * g + ")";
    }), u(se(r));
  }
  function u(r) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const a = r.name.toLowerCase();
      if (a === "pi") return Math.PI;
      if (a === "e") return Math.E;
      if (!Object.hasOwn(e, a)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(a)) throw Error("Circular structural parameter: " + a);
      n.add(a);
      const l = s(e[a]);
      return n.delete(a), l;
    }
    if (r.type === "ConditionalExpression") return W(u(r.test)) ? u(r.consequent) : u(r.alternate);
    if (r.type === "UnaryExpression") {
      const a = u(r.argument);
      if (r.operator === "-") return -a;
      if (r.operator === "+") return +a;
      if (r.operator === "!" || r.operator === "~") return !W(a);
    }
    if (r.type === "BinaryExpression") {
      const a = u(r.left);
      if (r.operator === "&&") return W(a) && W(u(r.right));
      if (r.operator === "||") return W(a) || W(u(r.right));
      const l = u(r.right);
      switch (r.operator) {
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
          return W(a) !== W(l);
        case "&":
          return W(a) && W(l);
        case "|":
          return W(a) || W(l);
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
    if (r.type === "CallExpression" && r.callee.type === "Identifier") {
      const a = r.callee.name.toLowerCase();
      if (a === "if") {
        if (r.arguments.length !== 3) throw Error("if() needs three arguments.");
        return W(u(r.arguments[0])) ? u(r.arguments[1]) : u(r.arguments[2]);
      }
      if (Object.hasOwn(Pe, a)) return Pe[a](...r.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const d = s(t);
  if (typeof d == "number" && !Number.isFinite(d)) throw Error("Structural expression is not finite.");
  return d;
}
function Ne(t, { isolate: e = "" } = {}) {
  ft(t);
  const n = j(), i = /* @__PURE__ */ new Map();
  let s = 0, u = 0;
  function d(r, a, l, c, y, p, g) {
    if (a.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++s > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const b = t.scopes[r], h = a.length ? re(a.slice(0, -1), a.at(-1)) : "", v = j();
    if (e && h === e && (l = j()), g.some((N) => N.scopeId === r)) throw Error("Circular subcircuit reference at " + h);
    const m = ht(c, b.defaults, b.parameters, y);
    function f(N) {
      if (/^\{[\s\S]*\}$/.test(N)) {
        const x = de(N, m);
        N = String(typeof x == "boolean" ? Number(x) : x);
      }
      /^"[\s\S]*"$/.test(N) && (N = N.slice(1, -1));
      const O = N.toLowerCase();
      return Object.hasOwn(l, O) ? l[O] : t.globals.includes(O) ? Ee([], O) : v[O] || (v[O] = Ee(a, O));
    }
    const C = { id: h, path: a, scopeId: r, name: p?.name || "Top", definition: b.name, ports: b.ports.map((N) => ({ name: N, node: f(N) })), params: m, nodes: v, models: j(), devices: [], children: [], raw: p?.raw || "", line: p?.line || 0 };
    n[h] = C, i.set(h, f);
    const _ = [...g, C];
    function L(N) {
      if (!N) return "";
      let O = b;
      for (; O; ) {
        if (O.directives.some((x) => new RegExp("^\\.model\\s+" + N.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(x.text))) {
          const x = [..._].reverse().find((o) => o.scopeId === O.id);
          return re(x?.path || [], N.toLowerCase());
        }
        O = t.scopes[O.parent];
      }
      return N;
    }
    for (const N of b.directives.filter((O) => /^\.model\b/i.test(O.text))) {
      const O = /^\.model\s+(\S+)/i.exec(N.text)?.[1];
      if (!O) continue;
      const x = L(O), o = b.models[O.toLowerCase()], E = we(N.text, m, f, (R) => re(a, R));
      C.models[x] = { ...o, name: x, raw: E.replace(/^(\.model\s+)\S+/i, (R, U) => U + x), instanceId: h, parameters: m };
    }
    for (const N of b.devices) {
      if (++u > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const O = j();
      for (const [o, E] of Object.entries(N.terminals)) O[o] = f(E);
      const x = L(N.model);
      C.devices.push({ ...N, name: re(a, N.name), localName: N.name, instanceId: h, terminals: O, model: x, parameters: m });
    }
    for (const N of b.instances) {
      let O = N.definitionId;
      if (!O) {
        const R = String(de(N.definitionName, m)).toLowerCase();
        let U = b;
        for (; U && !O; )
          O = U.definitions[R], U = t.scopes[U.parent];
        if (!O) throw Error("Undefined selected subcircuit: " + R);
      }
      const x = t.scopes[O], o = j();
      if (x.ports.length !== N.nodes.length) throw Error(N.name + ": expected " + x.ports.length + " ports; got " + N.nodes.length);
      x.ports.forEach((R, U) => {
        o[R.toLowerCase()] = f(N.nodes[U]);
      });
      const E = d(O, [...a, N.name], o, m, N.parameters, N, _);
      N.pinNames?.length === E.ports.length && E.ports.forEach((R, U) => {
        R.label = N.pinNames[U];
      }), C.children.push(E);
    }
    return C;
  }
  try {
    let y = function(p, g) {
      const b = g.split(":");
      if (b.length === 1) return { owner: p, name: g };
      const h = b.pop();
      for (const v of [[...p.path, ...b], b]) {
        const m = a.get(v.map(encodeURIComponent).join("/").toLowerCase());
        if (m) return { owner: m, name: h };
      }
      throw Error("Unknown hierarchical reference: " + g);
    };
    const r = d(t.rootId, [], j(), j(), j(), null, []), a = new Map(Object.values(n).map((p) => [p.id.toLowerCase(), p])), l = Object.assign(j(), ...Object.values(n).map((p) => p.models)), c = (p) => l[p] || Object.entries(l).find(([g]) => g.startsWith(p + "."))?.[1];
    for (const p of Object.values(n)) for (const g of p.devices) {
      const b = t.scopes[p.scopeId].devices.find((m) => m.name === g.localName), h = (m) => {
        const f = y(p, m);
        return i.get(f.owner.id)(f.name);
      }, v = (m, f = "", C = "") => {
        const _ = y(p, m), L = _.owner.devices.find((N) => N.localName.toLowerCase() === _.name.toLowerCase());
        if (f.toLowerCase() === "ix") {
          const N = _.owner.ports.find((O, x) => O.name.toLowerCase() === _.name.toLowerCase() || String(x + 1) === _.name);
          if (N) return _.owner.id + ":" + N.name;
        }
        if (!L) {
          if (C) throw Error(g.name + ": referenced " + C + " device " + m + " was not found.");
          return re(_.owner.path, _.name);
        }
        if (C && L.kind !== C) throw Error(g.name + ": " + m + " must be a " + C + " device.");
        return L.name;
      };
      if (g.value = we(b.value, p.params, h, v), b.model && (g.value = g.value.replace(b.model, g.model)), g.kind === "M" && Object.keys(g.terminals).length === 3) {
        let m = c(g.model), f = !1;
        const C = /* @__PURE__ */ new Set();
        for (; m?.type === "VDMOS" && !C.has(m.name); ) {
          C.add(m.name);
          const _ = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(m.raw);
          if (_) {
            f = _[1] === void 0 || Number(de(_[1], m.parameters)) >= 0.5;
            break;
          }
          const L = m.name.includes("/") ? m.name.slice(0, m.name.lastIndexOf("/") + 1) : "";
          m = c(L + (m.baseModel || "").toLowerCase()) || c((m.baseModel || "").toLowerCase());
        }
        C.size && (g.type = "spice_" + (f ? "pmos3" : "nmos3"));
      }
      g.controlSources = (b.controlSources || []).map((m) => v(m, "", "V")), g.controlSource = g.controlSources[0] || "", g.coupledInductors = (b.coupledInductors || []).map((m) => v(m, "", "L"));
      for (const m of /* @__PURE__ */ new Set([...b.controlSources || [], ...b.coupledInductors || []])) {
        const f = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        g.value = g.value.replace(new RegExp("(?<![\\w./%])" + f + "(?![\\w.$])", "g"), () => v(m));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: r, contexts: n };
  } catch (r) {
    throw r.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: r.message }], r;
  }
}
function ie(t) {
  return [...t.devices, ...t.children.flatMap(ie)];
}
function ce(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Ce(t, e = {}) {
  const n = new Map(t.components.map((o) => [o.name, o])), i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), u = [], d = (o, E) => JSON.stringify([o, E].sort()), r = (o) => e[o]?.potential !== null && e[o]?.potential !== void 0;
  for (const o of t.components) {
    for (const [D, $] of Object.entries(o.terminals))
      i.has($) || i.set($, []), i.get($).push({ device: o.name, pin: D });
    if (o.kind === "R") {
      const D = Object.values(o.terminals);
      if (D.length === 2 && D[0] !== D[1]) {
        const $ = d(...D);
        s.has($) || s.set($, []), s.get($).push(o);
      }
    }
    const E = o.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(o.kind) ? "fet" : null, R = E === "bjt" ? /_(npn|pnp)$/.exec(o.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(o.type)?.[1];
    if (!E || !R) continue;
    const U = o.terminals, T = U[E === "bjt" ? "B" : "G"], V = U[E === "bjt" ? "C" : "D"], F = U[E === "bjt" ? "E" : "S"];
    [T, V, F].some((D) => D === void 0) || T === F || V === F || u.push({ id: o.name, family: E, polarity: R, control: T, drain: V, source: F, body: o.kind === "M" ? U.B : void 0 });
  }
  const a = [], l = /* @__PURE__ */ new Set(), c = (o, E, R, U, T, V = "basic", F = [], D = "high") => {
    const $ = [.../* @__PURE__ */ new Set([...E, ...F])], I = JSON.stringify([o, V, [...$].sort()]);
    l.has(I) || (l.add(I), a.push({ id: "motif" + a.length, kind: o, variant: V, transistors: E, members: $, roles: R, nets: U, evidence: T, confidence: D }));
  }, y = (o, E) => o.family === E.family && o.polarity === E.polarity, p = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), h = new Map(u.map((o) => [o.id, o])), v = (o, E, R) => {
    o.has(E) || o.set(E, []), o.get(E).push(R);
  }, m = (o, E) => JSON.stringify([o.family, o.polarity, E]);
  for (const o of u)
    v(p, m(o, o.control), o), v(g, m(o, o.source), o), o.family === "bjt" && (i.get(o.source) || []).some((E) => {
      const R = h.get(E.device);
      return R && R.family === "bjt" && !y(o, R) && R.source === o.source;
    }) && v(b, m(o, o.drain), o);
  const f = (o) => [{ node: o.source, resistor: null }, ...(i.get(o.source) || []).flatMap((E) => {
    const R = n.get(E.device);
    if (R.kind !== "R") return [];
    const U = Object.values(R.terminals).find((T) => T !== o.source);
    return U !== void 0 && U !== o.control && U !== o.drain ? [{ node: U, resistor: R.name }] : [];
  })];
  for (const o of u) o.control === o.drain && c("diode-connected", [o.id], { reference: o.id }, { control: o.control, return: o.source }, ["control-drain-short", o.family]);
  for (const o of u) {
    const E = p.get(m(o, o.control));
    if (E.filter((D) => D.control === D.drain).length > 1) continue;
    let R = null;
    if (o.control !== o.drain && o.family === "bjt" && (R = (p.get(m(o, o.drain)) || []).find((D) => D.id !== o.id && y(D, o) && D.control === o.drain && D.source === o.control && r(D.drain))), o.control !== o.drain && !R) continue;
    const U = f(o), T = [];
    let V = null, F = [];
    for (const D of E) {
      if (D.id === o.id || D.id === R?.id || D.drain === o.drain || D.drain === D.control) continue;
      const $ = U.flatMap((I) => f(D).filter((k) => I.node === k.node).map((k) => ({ node: I.node, rs: [I.resistor, k.resistor].filter(Boolean) }))).find((I) => V === null || I.node === V);
      $ && (V = $.node, T.push(D.id), F.push(...$.rs));
    }
    if (T.length) {
      const D = T.every(($) => h.get($).body === o.body);
      c("current-mirror", [o.id, ...T, ...R ? [R.id] : []], { reference: o.id, outputs: T, ...R ? { helper: R.id } : {} }, { control: o.control, return: V }, ["same-polarity", "shared-control", R ? "emitter-follower-reference" : "diode-reference", F.length ? "resistive-common-return" : "shared-return", D ? "compatible-bodies" : "different-body-connections"], R ? "assisted" : F.length ? "degenerated" : "basic", [...F, ...R ? [R.id] : []], D ? "high" : "medium");
    }
  }
  const C = [], _ = /* @__PURE__ */ new Set(), L = (o, E) => {
    const R = JSON.stringify([o.id, E.id].sort());
    _.has(R) || (_.add(R), C.push([o, E]));
  };
  for (const o of g.values()) if (!r(o[0].source)) {
    const E = o.filter((R) => R.control !== R.drain);
    E.length === 2 ? L(...E) : E.length > 2 && new Set(E.map((R) => R.control)).size > 1 && c("differential-pair", E.map((R) => R.id), { inputs: E.map((R) => R.id) }, { tail: E[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const o of b.values()) for (let E = 0; E < o.length; E++) for (let R = E + 1; R < o.length; R++) L(o[E], o[R]);
  for (const [o, E] of C) {
    if (o.control === E.control || o.control === o.drain || E.control === E.drain) continue;
    if (o.source === E.source && o.drain !== E.drain && !r(o.source)) {
      const T = (i.get(o.source) || []).some((F) => F.device !== o.id && F.device !== E.id), V = g.get(m(o, o.source)).length === 2;
      c("differential-pair", [o.id, E.id], { inputs: [o.id, E.id] }, { tail: o.source }, ["same-polarity", "distinct-controls", "shared-tail", T ? "tail-bias-connection" : "unbiased-tail", V ? "two-input-tail" : "multi-input-tail"], "basic", [], T && V && o.body === E.body ? "high" : "medium");
    }
    if (o.family !== "bjt" || o.drain !== E.drain || o.source === E.source) continue;
    const R = u.filter((T) => T.family === "bjt" && T.polarity !== o.polarity && T.source === o.source), U = u.filter((T) => T.family === "bjt" && T.polarity !== o.polarity && T.source === E.source);
    for (const T of R) for (const V of U) T.id !== V.id && T.control === V.control && T.drain !== V.drain && T.control !== T.drain && V.control !== V.drain && c("differential-pair", [o.id, E.id, T.id, V.id], { inputs: [o.id, E.id], commonBase: [T.id, V.id] }, { inputCollectors: o.drain, bias: T.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const o of u) if (o.family === "bjt" && o.control !== o.drain) {
    const E = s.get(d(o.drain, o.control)) || [], R = s.get(d(o.control, o.source)) || [];
    E.length === 1 && R.length === 1 && c("vbe-multiplier", [o.id], { transistor: o.id, collectorResistor: E[0].name, emitterResistor: R[0].name }, { control: o.control, collector: o.drain, emitter: o.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [E[0].name, R[0].name]);
  }
  const N = u.filter((o) => o.family === "bjt"), O = /* @__PURE__ */ new Map();
  for (const o of N) v(O, o.control, o);
  const x = (o) => (i.get(o) || []).filter((E) => h.has(E.device));
  for (const o of N) if (o.control !== o.drain) {
    for (const E of O.get(o.source) || []) if (E.id !== o.id && y(o, E) && E.drain === o.control && E.source !== o.drain) {
      const R = s.get(d(o.source, E.source)) || [];
      R.length === 1 && c("current-limit-pair", [o.id, E.id], { driver: o.id, output: E.id, senseResistor: R[0].name }, { sense: o.source, drive: o.control, output: E.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [R[0].name]);
    }
    for (const E of O.get(o.source) || []) E.id !== o.id && y(o, E) && E.control !== E.drain && o.drain === E.drain && E.source !== o.control && c("darlington-pair", [o.id, E.id], { driver: o.id, output: E.id }, { link: o.source, collector: o.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (O.get(o.source) || []).length === 1 ? "high" : "medium");
    for (const E of O.get(o.drain) || []) E.id !== o.id && !y(o, E) && E.control !== E.drain && o.source === E.drain && E.source !== o.control && x(o.drain).length === 2 && c("sziklai-pair", [o.id, E.id], { driver: o.id, output: E.id }, { link: o.drain, feedback: o.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const E of i.get(o.drain) || []) {
      const R = h.get(E.device);
      !R || R.family !== "bjt" || R.id === o.id || !y(o, R) || R.source !== o.drain || r(o.drain) || R.control === o.control || R.control === R.drain || R.drain === o.source || x(o.drain).length !== 2 || c("cascode-pair", [o.id, R.id], { driver: o.id, output: R.id }, { link: o.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const o of N.filter((E) => E.polarity === "npn" && r(E.drain))) for (const E of N.filter((R) => R.polarity === "pnp" && r(R.drain))) {
    if (e[o.drain].potential <= e[E.drain].potential) continue;
    const R = f(o).flatMap((U) => f(E).filter((T) => U.node === T.node && !r(U.node)).map((T) => ({ node: U.node, rs: [U.resistor, T.resistor].filter(Boolean) })))[0];
    R && c("push-pull-pair", [o.id, E.id], { upper: o.id, lower: E.id }, { output: R.node }, ["complementary-polarity", "ordered-collector-supplies", R.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", R.rs);
  }
  return a;
}
function Ie(t, e, n = (i) => i) {
  const i = (s) => Array.isArray(s) ? s.map(e) : e(s);
  return t.map((s) => ({ ...s, members: s.members.map(e), transistors: s.transistors.map(e), roles: Object.fromEntries(Object.entries(s.roles).map(([u, d]) => [u, i(d)])), nets: Object.fromEntries(Object.entries(s.nets).map(([u, d]) => [u, n(d)])) }));
}
function vt(t, e, n) {
  const i = [], s = /* @__PURE__ */ new Set(), u = new Map(t.components.map((d) => [d.name, d]));
  for (const d of n) {
    if (new Set(d.members).size !== d.members.length) throw Error("Duplicate @layout pair member.");
    const r = d.members.map((p) => u.get(p));
    if (r.some((p) => !p)) throw Error("Unknown @layout pair device.");
    const a = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[d.kind], l = d.kind === "differential" && r.length === 2 ? t.components.filter((p) => !d.members.includes(p.name) && Object.values(p.terminals).includes(r[0].terminals.E ?? r[0].terminals.S)) : [], c = Ce({ ...t, components: [...r, ...l] }, e), y = c.find((p) => p.kind === a && p.confidence === "high" && d.members.every((g) => p.members.includes(g)));
    if (!y) throw Error("Invalid @layout pair " + d.kind + " { " + d.members.join(" ") + " }: electrical structure does not match.");
    for (const p of c.filter((g) => g === y || g.kind === "diode-connected" && g.members.every((b) => y.members.includes(b)))) {
      const g = JSON.stringify([p.kind, [...p.members].sort()]);
      s.has(g) || (s.add(g), i.push({ ...p, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function Ot(t, e, n = Ce(t, e)) {
  const i = /* @__PURE__ */ new Map(), s = t.components.filter((p) => p.kind === "R"), u = t.components.filter((p) => p.kind === "Q"), d = new Map(t.components.map((p) => [p.name, p])), r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = (p) => Object.values(p.terminals), c = (p, g, b) => {
    p && i.set(p.name, { reverse: l(p)[0] !== g, reason: b });
  };
  for (const p of u) {
    const { C: g, B: b, E: h } = p.terminals, v = p.type.endsWith("pnp"), m = p.type.endsWith("npn");
    !v && !m || (r.has(h) || r.set(h, []), r.get(h).push(p), g === b && e[h]?.potential !== null && e[h]?.potential !== void 0 && a.set(g, { potential: e[h].potential }));
  }
  for (const p of n) if (p.kind === "vbe-multiplier" && p.confidence === "high") {
    const g = d.get(p.roles.transistor), b = g.type.endsWith("pnp"), h = d.get(b ? p.roles.emitterResistor : p.roles.collectorResistor), v = d.get(b ? p.roles.collectorResistor : p.roles.emitterResistor);
    c(h, g.terminals[b ? "E" : "C"], "recognized VBE multiplier"), c(v, g.terminals.B, "recognized VBE multiplier");
  }
  for (const p of s) {
    const [g, b] = l(p), h = a.get(g), v = a.get(b);
    h && v && h.potential !== v.potential && c(p, h.potential > v.potential ? g : b, "diode-connected bias reference");
  }
  const y = /* @__PURE__ */ new Map();
  for (const p of s) {
    const g = l(p);
    if (!g.some((b) => e[b]?.potential !== null && e[b]?.potential !== void 0))
      for (const b of g)
        y.has(b) || y.set(b, []), y.get(b).push(p);
  }
  for (const [p, g] of y)
    if (!(g.length > 12))
      for (const b of g) for (const h of g) {
        if (b === h) continue;
        const v = l(b).find((_) => _ !== p), m = l(h).find((_) => _ !== p), f = r.get(v)?.find((_) => _.type.endsWith("npn")), C = r.get(m)?.find((_) => _.type.endsWith("pnp"));
        f && C && (c(b, v, "complementary emitter output"), c(h, p, "complementary emitter output"));
      }
  return i;
}
function Rt(t) {
  const e = t.components.filter((u) => u.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((u) => u.kind === "R").map((u) => Object.values(u.terminals).sort().join("|"))), s = /* @__PURE__ */ new Set();
  for (const u of e) {
    const d = u.terminals.E;
    n.has(d) || n.set(d, []), n.get(d).push(u);
  }
  for (const u of e) {
    const { B: d, C: r, E: a } = u.terminals;
    if (d === a || !i.has([d, a].sort().join("|"))) continue;
    const l = n.get(d) || [];
    if (!(l.length > 16))
      for (const c of l) {
        if (c === u) continue;
        if (c.terminals.B === r) {
          s.add(u.name);
          break;
        }
        const y = n.get(c.terminals.B) || [];
        if (y.length <= 16 && y.some((p) => p !== u && p !== c && p.terminals.B === r)) {
          s.add(u.name);
          break;
        }
      }
  }
  return s;
}
const ye = 18;
function _e(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const ue = (t) => ["pwr", "ret", "bias"].includes(t), St = (t) => String(t).split("/").at(-1).toLowerCase(), Qe = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[St(t)] || "unknown", Ae = (t) => {
  const e = _e(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Qe(t);
};
function xt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (d, r, a) => {
    e.has(d) || e.set(d, []), e.get(d).push({ node: r, delta: a });
  };
  for (const d of t)
    if (d.kind === "V")
      try {
        let r = d.value.trim();
        const a = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (a && Number(de(a[1], d.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const l = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!l) continue;
        const c = de(l[1], d.parameters);
        if (typeof c != "number" || !Number.isFinite(c)) continue;
        i(d.terminals["-"], d.terminals["+"], c), i(d.terminals["+"], d.terminals["-"], -c);
      } catch {
      }
  const s = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  for (const d of ["0", ...e.keys()]) {
    if (u.has(d)) continue;
    const r = /* @__PURE__ */ new Map([[d, 0]]), a = [d];
    u.add(d);
    let l = !1;
    for (let c = 0; c < a.length; c++) for (const y of e.get(a[c]) || []) {
      const p = r.get(a[c]) + y.delta;
      r.has(y.node) ? Math.abs(r.get(y.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (l = !0) : (r.set(y.node, p), u.add(y.node), a.push(y.node));
    }
    l && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [c, y] of r) s[c] = { value: y, reference: d, known: d === "0" && !l, consistent: !l };
  }
  return { nodes: s, diagnostics: n };
}
function Lt(t, e, n = null) {
  const i = xt(ie(e.localScope ? t.contexts[e.focus] : t.root)), s = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
  for (const c of Object.values(e.nodes)) {
    const y = _e(c.name), p = Qe(c.name);
    s[c.name] = { role: y !== "unknown" ? y : p, roleSource: y !== "unknown" ? "node-name" : p !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[c.name]?.known ? i.nodes[c.name].value : null };
  }
  if (e.localScope) for (const c of e.interfaceBindings) {
    const y = s[c.local], p = Ae(c.port);
    y && y.potential === null && ["pwr", "ret"].includes(p) && (y.potential = p === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(c.port) ? 0 : -1, y.potentialSource = "symbolic-port-order");
  }
  const d = n?.pairs?.length ? vt(e, s, n.pairs) : Ce(e, s), r = Ot(e, s, d), a = Rt(e), l = (c, y, p) => {
    const g = { role: s[p].role, roleSource: s[p].roleSource }, b = c.block?.ports.find((m) => m.pin === y);
    if (b?.implicit || !c.block && !c.synthetic) return g;
    const h = c.synthetic ? c.value : b?.name || b?.label, v = Ae(h);
    return v !== "unknown" ? { role: v, roleSource: _e(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ue(g.role) ? { ...g, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const c of e.components) {
    const y = Object.fromEntries(Object.entries(c.terminals).map(([x, o]) => [x, { ...s[o], ...l(c, x, o) }])), p = Object.values(y), g = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(c.type), b = g && !r.has(c.name) && p.length === 2 && p.every((x) => !ue(x.role) && (x.potential === null || x.role !== "unknown")), h = c.terminals["+"], v = c.terminals["-"], m = [h, v].filter((x) => x && x !== "0"), f = c.kind === "V" && m.some((x) => ue(s[x]?.role)) && !m.some((x) => ["in", "out", "io", "fb"].includes(s[x]?.role)) && [h, v].every((x) => i.nodes[x]?.known), C = h === "0" ? v : h, _ = Object.keys(c.terminals), L = (x) => ue(x.role) ? x.potential !== null ? x.potential > 0 ? "high" : "low" : x.role === "ret" ? "low" : "high" : "signal";
    let N = !1;
    _.length === 2 && (c.kind === "V" && p.every((x) => x.potential !== null) ? N = p[0].potential < p[1].potential : c.terminals[_[0]] === "0" ? N = !0 : c.terminals[_[1]] === "0" ? N = !1 : p.every((x) => x.potential !== null) ? N = p[0].potential < p[1].potential : N = L(p[0]) === "low" || L(p[1]) === "high" && L(p[0]) === "signal"), r.has(c.name) && (N = r.get(c.name).reverse);
    const O = c.synthetic ? "" : c.name.startsWith(e.focus + "/") ? c.name.slice(e.focus.length + 1) : c.name;
    u[c.name] = { version: ye, kind: c.kind, polarity: c.type.endsWith("pnp") ? "p" : c.type.endsWith("npn") ? "n" : null, currentLimiter: a.has(c.name), orientationReason: r.get(c.name)?.reason || null, owner: O.includes("/") ? O.slice(0, O.lastIndexOf("/")) : "", passive: g, source: ["V", "I", "E", "F", "G", "H"].includes(c.kind) || c.kind === "B" && !g, ports: y, horizontal: b, orientation: b ? "horizontal" : N ? "vertical-reversed" : "vertical", flexible: _.length === 2 && (g || ["V", "I", "B", "F", "H"].includes(c.kind)), supply: !!f, voltage: f ? i.nodes[C].value : null };
  }
  return { version: ye, nodes: s, cells: u, motifs: d, diagnostics: i.diagnostics };
}
function De(t, e) {
  const n = e.ports.map((s, u) => ({ pin: "P" + u, name: s.name, label: s.label || s.name, node: s.node, implicit: !1 })), i = new Set(ie(e).flatMap((s) => Object.values(s.terminals)));
  for (const s of t.ir.globals) {
    const u = Ee([], s);
    i.has(u) && !n.some((d) => d.node === u) && n.push({ pin: "G" + n.length, label: s === "0" ? "⏚ 0" : "global: " + s, node: u, implicit: !0 });
  }
  return n;
}
function kt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const s = t, u = t.contexts[i];
  if (!u) throw Error("Unknown instance: " + i);
  i && (t = Ne(t.ir, { isolate: i }));
  const d = t.contexts[i];
  if (!d) throw Error("Unknown instance: " + i);
  const r = [], a = [];
  function l(b) {
    a.push(...Object.values(b.nodes), ...b.ports.map((v) => v.node));
    const h = [...b.devices.map((v) => ({ line: v.line, device: v })), ...b.children.map((v) => ({ line: v.line, child: v }))].sort((v, m) => v.line - m.line);
    for (const v of h) {
      if (v.device) {
        const _ = v.device;
        r.push({ ..._, layoutLabel: [...b.path.slice(d.path.length), _.localName].join("/") });
        continue;
      }
      const m = v.child;
      if (e === "flat" || n.has(m.id)) {
        l(m);
        continue;
      }
      const f = De(t, m), C = j();
      f.forEach((_) => {
        C[_.pin] = _.node;
      }), r.push({ name: m.id, kind: "X", type: "spice_subckt", terminals: C, value: m.definition, raw: m.raw, line: m.line, instanceId: m.id, layoutLabel: m.path.slice(d.path.length).join("/"), block: { definitionId: m.scopeId, ports: f, parameters: m.params } });
    }
  }
  l(d);
  for (const [b, h] of d.ports.entries()) r.push({ name: "@port/" + i + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (r.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(j(), ...Object.values(t.contexts).map((b) => b.models)), y = { title: i || t.ir.title, components: r, nodes: pt(r, a), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  y.interfaceBindings = d.ports.map((b, h) => ({ port: b.name, local: b.node, parent: u.ports[h].node }));
  const p = /* @__PURE__ */ new Map();
  for (const b of u.ports)
    p.has(b.node) || p.set(b.node, []), p.get(b.node).push(b.name);
  y.interfaceAliases = [...p].filter(([, b]) => b.length > 1).map(([b, h]) => ({ node: b, ports: h })), y.topology = Pt(s, y);
  const g = dt(t, y);
  return y.layout = Lt(t, y, g), y.layout.description = g, y;
}
function Pt(t, e) {
  const n = ie(t.contexts[e.focus]);
  e.localScope && (t = Ne(t.ir, { isolate: e.focus }));
  const i = [], s = /* @__PURE__ */ new Set();
  for (const r of e.components)
    if (!r.synthetic)
      if (r.kind === "X") {
        const a = t.contexts[r.instanceId];
        if (!a) throw Error("Projection contains an unknown block.");
        const l = De(t, a);
        if (JSON.stringify(Object.entries(r.terminals)) !== JSON.stringify(l.map((c) => [c.pin, c.node]))) throw Error("Block interface topology mismatch: " + r.name);
        i.push(...ie(a));
      } else i.push(r);
  for (const r of i) {
    if (s.has(r.name)) throw Error("Projection duplicates " + r.name);
    s.add(r.name);
  }
  const u = ce(i), d = ie(t.contexts[e.focus]);
  if (u !== ce(d)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const r = new Map(e.interfaceBindings.map((c) => [c.local, c.parent])), a = (c) => r.get(c) ?? c, l = i.map((c) => ({ ...c, terminals: Object.fromEntries(Object.entries(c.terminals).map(([y, p]) => [y, a(p)])), value: we(c.value, {}, a, (y) => y) }));
    if (ce(l) !== ce(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: u, boundSignature: ce(n), boundaryVerified: !0 };
}
function At(t) {
  const e = j(), n = j();
  for (const i of t.components) {
    const s = j(), u = j();
    for (const [d, r] of Object.entries(i.terminals))
      s[d] = [t.nodes[r].bit], u[d] = "input";
    e[i.name] = { type: i.type, port_directions: u, connections: s, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((d) => ({ pin: d.pin, label: d.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((d, r) => ({ pin: d, label: i.pinLabels?.[r] || d })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ie(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Tt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, s = (l) => (n.has(l) || n.set(l, n.size + 2), n.get(l));
  Object.entries(t.modules.circuit.cells).forEach(([l, c], y) => {
    const p = "c" + y;
    e.set(p, l);
    const g = Object.fromEntries(Object.entries(c.connections).map(([b, h]) => [b, h.map(s)]));
    i[p] = { type: c.type, connections: g, port_directions: c.port_directions, attributes: { displayRef: c.attributes.displayRef || c.attributes.ref || "", value: c.attributes.value || "", name: c.attributes.name || "" } }, c.spiceBlock && (i[p].spiceBlock = c.spiceBlock), c.spiceSymbol && (i[p].spiceSymbol = c.spiceSymbol), c.spiceLayout && (i[p].spiceLayout = c.spiceLayout);
  });
  const u = new Map([...e].map(([l, c]) => [c, l])), d = t.modules.circuit.spiceLayoutDescription, r = d ? { ...d, faces: (d.faces || []).map((l) => ({ ...l, device: u.get(l.device) })), pairs: (d.pairs || []).map((l) => ({ ...l, members: l.members.map((c) => u.get(c)) })), groups: d.groups.map((l) => ({ ...l, members: l.members.map((c) => c.cell ? { ...c, cell: u.get(c.cell) } : c) })), relations: d.relations.map((l) => ({ ...l, a: u.get(l.a) || l.a, b: u.get(l.b) || l.b })) } : null, a = Ie(t.modules.circuit.spiceMotifs || [], (l) => u.get(l), s);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: a, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([l, c]) => [c, l])) };
}
const Z = /* @__PURE__ */ new Map();
async function Ut(t, e) {
  const n = Tt(t), i = JSON.stringify([n.netlist, e]);
  let s = Z.get(i);
  s ? (Z.delete(i), Z.set(i, s)) : (s = await Mt(n.netlist, e), s.svg.length < 1e6 && (Z.set(i, s), Z.size > 20 && Z.delete(Z.keys().next().value)));
  const u = new DOMParser().parseFromString(s.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const a of u.querySelectorAll("[id],[class]")) {
    const l = a.getAttribute("id");
    l?.startsWith("cell_") && n.ids.has(l.slice(5)) && a.setAttribute("id", "cell_" + n.ids.get(l.slice(5)));
    const c = a.getAttribute("class");
    c && a.setAttribute("class", c.split(/\s+/).map((y) => y.startsWith("cell_") && n.ids.has(y.slice(5)) ? "cell_" + n.ids.get(y.slice(5)) : /^net_\d+$/.test(y) && n.bits.has(Number(y.slice(4))) ? "net_" + n.bits.get(Number(y.slice(4))) : y).join(" "));
  }
  const d = s.drawing ? structuredClone(s.drawing) : null, r = u.querySelector("#spice-layout-report");
  if (r) {
    const a = JSON.parse(r.textContent), l = (c) => n.ids.get(c) || c;
    a.mirroredTransistors = (a.mirroredTransistors || []).map(l), a.orientationDevicesTested = (a.orientationDevicesTested || []).map(l), a.recognizedMotifs = Ie(a.recognizedMotifs || [], l, (c) => n.bits.get(c) ?? c), a.inputAttachments = (a.inputAttachments || []).map(l), a.mirroredInputPorts = (a.mirroredInputPorts || []).map(l);
    for (const c of [...a.flippedPairs || [], ...a.pairOrientationTrials || []]) c.members = c.members.map(l);
    for (const c of a.pairCompactions || [])
      c.members = c.members.map(l), c.moved = l(c.moved);
    for (const c of a.pairConstraints || []) c.members = c.members.map(l);
    for (const c of a.pairProximity || []) c.members = c.members.map(l);
    for (const c of a.motifMeasurements || [])
      c.members = c.members.map(l), c.interlopers && (c.interlopers = c.interlopers.map(l));
    for (const c of a.voltageRails || []) c.bit !== void 0 && (c.bit = n.bits.get(c.bit) ?? c.bit);
    r.textContent = JSON.stringify(a);
  }
  if (d) {
    for (const a of d.components) {
      a.id = n.ids.get(a.id) || a.id;
      for (const l of a.ports) l.bit = n.bits.get(l.bit) ?? l.bit;
    }
    for (const a of d.segments) a.bit = n.bits.get(a.bit) ?? a.bit;
  }
  return { svg: new XMLSerializer().serializeToString(u.documentElement), drawing: d };
}
function Mt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DQwUzxhK.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, s) => {
    const u = (a, l) => {
      clearTimeout(r), n.terminate(), a ? s(Error(a)) : i(l);
    }, d = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), d);
    n.onmessage = ({ data: a }) => u(a.error, { svg: a.svg, drawing: a.drawing }), n.onerror = (a) => u(a.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Qt = `* RLC low-pass filter
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
`, Vt = `* Common-collector voltage follower; independently chosen example values.
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
`, Bt = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, jt = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, pe = {
  filter: { source: Qt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Dt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Vt, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Bt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: jt, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function $t(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Te(t) {
  return $t(await t.arrayBuffer());
}
const Ue = pe.filter.source, P = (t) => document.getElementById("spice-" + t), le = P("app");
if (le) {
  let N = function(I) {
    const k = P("example-info");
    if (k && (k.replaceChildren(), !!I && (k.append(document.createTextNode(I.description + " ")), I.url))) {
      const M = document.createElement("a");
      M.href = I.url, M.target = "_blank", M.rel = "noopener noreferrer", M.textContent = I.reference, k.append(M);
    }
  }, O = function() {
    s = null, u = null, r = "", _(), N(Object.values(pe).find((I) => I.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, x = function(I) {
    i.replaceChildren();
    for (const { severity: k, line: M, message: Q, source: A } of I) {
      const G = document.createElement("li");
      G.className = k, G.textContent = `${k.toUpperCase()}${A && A !== "input.cir" ? " · " + A : ""}${M ? " · line " + M : ""}: ${Q}`, i.append(G);
    }
    P("messages").open = I.some((k) => k.severity !== "info"), P("message-count").textContent = `${I.length} message${I.length === 1 ? "" : "s"}`;
  }, o = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${h.x} ${h.y} ${h.w} ${h.h}`), P("zoom-level").textContent = Math.round(v.w / h.w * 100) + "%";
  }, E = function(I, k = h.x + h.w / 2, M = h.y + h.h / 2) {
    if (!e.querySelector("svg")) return;
    const Q = Math.max(0.05, Math.min(10, h.w * I / v.w)) * v.w / h.w;
    h = { x: k + (h.x - k) * Q, y: M + (h.y - M) * Q, w: h.w * Q, h: h.h * Q }, o();
  }, U = function(I) {
    const k = new URLSearchParams();
    I && k.set("instance", I);
    const M = k.toString();
    location.hash.slice(1) === M ? (p = I, D()) : location.hash = M;
  }, T = function() {
    p = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, V = function() {
    const I = !!(g && g !== p && l?.contexts[g]);
    P("selection-actions").hidden = !I, P("open-instance").href = "#" + new URLSearchParams({ instance: g });
  }, F = function() {
    P("breadcrumbs").replaceChildren();
    const I = (M, Q) => {
      const A = document.createElement("button");
      A.type = "button", A.textContent = M, A.onclick = () => U(Q), A.disabled = Q === p, P("breadcrumbs").append(A);
    };
    if (I("Top", ""), p) {
      const M = l.contexts[p].path;
      for (let Q = 0; Q < M.length; Q++) I(M[Q], M.slice(0, Q + 1).map(encodeURIComponent).join("/"));
    }
    P("instances").replaceChildren();
    const k = (M, Q) => {
      for (const A of M.children) {
        const G = document.createElement("div");
        G.className = "spice-instance-row", G.style.setProperty("--depth", Math.min(Q, 8)), G.dataset.instance = A.id;
        const ee = document.createElement("a");
        ee.href = "#" + new URLSearchParams({ instance: A.id }), ee.textContent = A.name + " · " + A.definition, ee.title = "Open " + A.id + " as its own sheet";
        const te = document.createElement("span");
        if (te.className = "spice-help", te.textContent = Object.entries(A.params).map(([K, Y]) => K + "=" + Y).join(" · "), G.append(ee), te.textContent) {
          const K = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", K.append(Y, te), G.append(K);
        }
        P("instances").append(G), k(A, Q + 1);
      }
    };
    k(l.contexts[p], 0), P("hierarchy-panel").hidden = !l.contexts[p].children.length, P("focus-title").textContent = p ? p + " / " + l.contexts[p].definition : "Top-level schematic", V();
  };
  const t = P("input"), e = P("preview"), n = P("status"), i = P("diagnostics");
  let s = null, u = null, d = !1, r = "", a, l, c, y = "", p = "", g = "", b = !1, h = { x: 0, y: 0, w: 1, h: 1 }, v = { ...h }, m, f = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  le.addEventListener("click", (I) => {
    b && I.target.closest('a[href^="#"]') && I.preventDefault();
  });
  const _ = () => {
    P("copy").disabled = P("download").disabled = !r || b, P("download-asc").disabled = P("download-asc-bundle").disabled = !r || !s || b || d;
  }, L = () => ({ font: P("font").value, fontSize: Number(P("size").value), color: P("color").value, detailed: P("detailed").checked, conventional: P("conventional").checked });
  t.value = Ue;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Ue;
  } catch {
  }
  N(Object.values(pe).find((I) => I.source === t.value)), t.addEventListener("input", O);
  for (const I of ["font", "size", "color", "detailed", "conventional"]) P(I).addEventListener("input", O);
  P("zoom-in").onclick = () => E(0.8), P("zoom-out").onclick = () => E(1.25), P("fit").onclick = () => {
    h = { ...v }, o();
  };
  const R = (I) => {
    const k = e.querySelector("svg");
    return k ? new DOMPoint(I.clientX, I.clientY).matrixTransform(k.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (I) => {
    const k = R(I);
    k && (I.preventDefault(), E(I.deltaY > 0 ? 1.12 : 1 / 1.12, k.x, k.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (I) => {
    I.button !== 0 || !e.querySelector("svg") || (m = { start: R(I), x: I.clientX, y: I.clientY, view: { ...h }, moved: !1 }, e.setPointerCapture(I.pointerId));
  }), e.addEventListener("pointermove", (I) => {
    if (!m) return;
    const k = R(I);
    Math.hypot(I.clientX - m.x, I.clientY - m.y) > 4 && (m.moved = !0), h.x += m.start.x - k.x, h.y += m.start.y - k.y, o();
  }), e.addEventListener("pointerup", (I) => {
    if (!m) return;
    const k = m.moved;
    if (m = null, e.hasPointerCapture(I.pointerId) && e.releasePointerCapture(I.pointerId), !k) {
      const M = document.elementFromPoint(I.clientX, I.clientY)?.closest("[data-component]"), Q = a?.components.find((A) => A.name === M?.dataset.component);
      Q && (g = Q.instanceId || "", P("selection").textContent = `${Q.raw}
${Object.entries(Q.terminals).map(([A, G]) => `${A} → ${G}`).join("   ")}`, Q.kind === "X" ? U(Q.instanceId) : V());
    }
  }), window.addEventListener("hashchange", () => {
    if (b) {
      f = !0;
      return;
    }
    T(), g = "", D();
  }), e.addEventListener("pointercancel", () => {
    m = null;
  }), e.addEventListener("keydown", (I) => {
    const k = I.target.closest("[data-instance]");
    if (k && (I.key === "Enter" || I.key === " ")) {
      I.preventDefault(), g = k.dataset.instance, U(g);
      return;
    }
    I.key === "+" || I.key === "=" ? E(0.8) : I.key === "-" ? E(1.25) : I.key.toLowerCase() === "f" ? (h = { ...v }, o()) : I.key.startsWith("Arrow") && (I.preventDefault(), h.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[I.key] || 0) * h.w, h.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[I.key] || 0) * h.h, o());
  });
  async function D() {
    if (b) return;
    b = !0, s = null, u = null, r = "", _(), P("generate").disabled = !0, t.readOnly = !0, P("file").disabled = !0, P("libraries").disabled = !0;
    for (const k of le.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) k.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let I = [];
    try {
      if (y !== t.value || !l) {
        if (c = ut(t.value, { files: C }), I = [...c.diagnostics], I.some((S) => S.severity === "error"))
          throw l = null, Error("Fix the parser errors below before generating.");
        l = Ne(c), y && y !== t.value ? (p = "", g = "", history.replaceState(null, "", location.pathname + location.search)) : T(), y = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (I = [...c.diagnostics], x(I), I.some((S) => S.severity === "error")) throw Error("Fix the parser errors below before generating.");
      a = kt(l, { focus: p });
      for (const S of a.interfaceAliases) I.push({ severity: "info", message: `Instance boundary: ${S.ports.join(" = ")} share parent node ${S.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const k = At(a);
      L().conventional && I.push(...a.layout.diagnostics);
      const M = await Ut(k, L()), Q = new DOMParser().parseFromString(M.svg, "image/svg+xml");
      if (Q.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const A = Q.documentElement, G = A.querySelector("#spice-layout-report");
      if (G) {
        a.layout.report = JSON.parse(G.textContent);
        const S = a.layout.report;
        if (I.push({ severity: "info", message: `Layout: compact signal flow; ${S.powerSourcesChecked} DC/ground symbols checked, ${S.powerOrderViolations} DC order preference(s) unmet. ${S.powerPass}. ${S.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), S.classicTemplateFallback && I.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), S.groundPlacement && I.push({ severity: "info", message: `Ground: ${S.groundPlacement}; ${S.straightenedGroundDrops || 0} return-path simplification(s).` }), S.explicitGroups && I.push({ severity: "info", message: `Layout comments: ${S.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), S.classicRails && I.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${S.railCount} shared voltage rails.` }), S.localClassicInstances?.length && I.push({ severity: "info", message: `${S.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), S.localClassicStages?.length && I.push({ severity: "info", message: `Classic transistor proximity active: ${S.localClassicStages.join(", ")}.` }), S.sharedClassicRails && I.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), S.mirroredTransistors?.length && I.push({ severity: "info", message: `Control-pin mirror choices: ${S.mirroredTransistors.join(", ")}.` }), S.recognizedMotifs?.length && I.push({ severity: "info", message: `Transistor structures: ${S.recognizedMotifs.map((B) => `${B.kind} (${B.members.join(", ")}; ${B.confidence})`).join("; ")}.` }), S.appliedMotifs?.length && I.push({ severity: "info", message: `Topology preferences applied to ${S.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), S.subnetFirstFallback && I.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + S.subnetFirstFallback }), S.pairCompactionFallback && I.push({ severity: "warning", message: "Pair proximity kept the original regions: " + S.pairCompactionFallback }), S.compoundPairFallback && I.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + S.compoundPairFallback }), S.pairConstraints?.length) {
          const B = S.pairConstraints.filter((X) => X.crossRegion && !X.compacted).length;
          I.push({ severity: "info", message: `${S.pairConstraints.length - B} adjacent transistor pair(s); ${B} cross-region mirror row constraint(s).` });
        }
        S.netShortcuts && I.push({ severity: "info", message: `${S.netShortcuts} safe straight net shortcut(s); ${S.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), S.sharedRailFallback && I.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${S.sharedRailFallback}.` });
        for (const B of S.localClassicFallbacks || []) B.stage && I.push({ severity: "info", message: `Classic stage ${B.stage} uses automatic layout: ${B.reason || "No unobstructed local template"}.` });
        S.geometricConnectivityVerified && I.push({ severity: "info", message: `Net geometry verified; ${S.cyclesRemoved} same-net loop(s) and ${S.leavesRemoved} unused wire branch(es) removed.` }), x(I);
      }
      if (A.localName !== "svg" || A.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const ee = Number(A.getAttribute("width")), te = Number(A.getAttribute("height"));
      v = { x: -20, y: -20, w: ee + 40, h: te + 40 }, h = { ...v }, A.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), A.setAttribute("width", String(v.w)), A.setAttribute("height", String(v.h)), A.setAttribute("role", "img"), A.setAttribute("aria-label", a.title || "SPICE schematic"), A.setAttribute("style", "background:white");
      for (const S of a.components) {
        const B = Q.getElementById("cell_" + S.name);
        if (!B) throw Error("Renderer omitted component " + S.name);
        B.setAttribute("data-component", S.name), S.kind === "X" && (B.setAttribute("data-instance", S.instanceId), B.setAttribute("role", "button"), B.setAttribute("tabindex", "0"), B.setAttribute("aria-label", "Open " + S.name));
        const X = Q.createElementNS(A.namespaceURI, "title");
        X.textContent = S.raw + `
Resolved: ` + S.value + `
` + Object.entries(S.terminals).map(([z, ae]) => z + ": " + ae).join(", "), B.prepend(X);
      }
      for (const S of Object.values(a.nodes))
        for (const B of A.querySelectorAll(".net_" + S.bit)) {
          B.setAttribute("data-net", S.name);
          const X = Q.createElementNS(A.namespaceURI, "title");
          X.textContent = "Node " + S.displayName, B.append(X);
        }
      const K = a.components.filter((S) => S.kind === "K").map((S) => ({ name: S.name, inductors: S.coupledInductors, value: S.value }));
      if (K.length) {
        const S = Q.createElementNS(A.namespaceURI, "metadata");
        S.setAttribute("id", "spice-magnetic-couplings"), S.textContent = JSON.stringify(K), A.append(S);
        for (const B of K) for (const X of B.inductors) {
          const z = Q.getElementById("cell_" + X);
          if (!z) continue;
          const ae = Q.createElementNS(A.namespaceURI, "circle"), he = [...z.children].find((ge) => ge.getAttribute("s:pid") === "A"), Be = he?.getAttribute("s:position"), ve = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [ge, je] of Object.entries({ cx: Number(he?.getAttribute("s:x")) + ve[0], cy: Number(he?.getAttribute("s:y")) + ve[1], r: 3, fill: L().color, stroke: "none", "data-coupling": B.name })) ae.setAttribute(ge, String(je));
          const Oe = Q.createElementNS(A.namespaceURI, "title");
          Oe.textContent = B.name + " · dotted terminal: " + B.inductors.join(", "), ae.append(Oe), z.append(ae);
        }
      }
      s = M.drawing, r = new XMLSerializer().serializeToString(A), P("source").value = r, e.replaceChildren(document.importNode(A, !0)), o();
      const Y = I.filter((S) => S.severity === "warning").length;
      n.textContent = `${a.components.filter((S) => !S.synthetic).length} components · ${Object.keys(a.nodes).length} nodes · ${a.topology.leafCount} primitive devices verified${a.interfaceAliases.length ? " · Parent-connected ports: " + a.interfaceAliases.map((S) => S.ports.join(" = ")).join("; ") + "." : ""}${Y ? " · Review " + Y + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${ye}.`, a.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${a.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), a.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const Ve = Object.values(a.nodes).map((S) => {
        const B = document.createElement("tr");
        for (const X of [S.displayName, S.terminals.map((z) => z.component + "." + z.pin).join(", ")]) {
          const z = document.createElement("td");
          z.textContent = X, B.append(z);
        }
        return B;
      });
      P("nets").replaceChildren(...Ve), P("json").value = JSON.stringify({ circuit: a, netlist: k, hierarchy: c }, null, 2), P("selection").textContent = "Click a component to inspect its original statement and pin connections.", F();
    } catch (k) {
      if (e.replaceChildren(), r = "", P("source").value = "", P("json").value = "", P("nets").replaceChildren(), P("selection").textContent = "", n.textContent = k.message, !l)
        P("hierarchy-panel").hidden = !0, P("selection-actions").hidden = !0, P("breadcrumbs").replaceChildren();
      else if (!l.contexts[p]) {
        const M = document.createElement("button");
        M.type = "button", M.textContent = "Return to Top", M.onclick = () => U(""), P("breadcrumbs").replaceChildren(M);
      }
      k.diagnostics && (I = k.diagnostics), I.some((M) => M.severity === "error") || I.push({ severity: "error", line: 0, message: k.message }), x(I);
    } finally {
      b = !1, P("generate").disabled = !1, t.readOnly = !1, P("file").disabled = !1, P("libraries").disabled = !1;
      for (const k of le.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) k.disabled = !1;
      l && l.contexts[p] && F(), e.setAttribute("aria-busy", "false"), _(), f && (f = !1, T(), queueMicrotask(D));
    }
  }
  P("generate").onclick = D;
  for (const I of le.querySelectorAll("[data-example]")) I.onclick = () => {
    const k = pe[I.dataset.example];
    t.value = k.source, O(), N(k), D();
  };
  P("file").onchange = async (I) => {
    const k = I.target.files[0];
    if (k) {
      if (k.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Te(k), O(), D();
      } catch (M) {
        n.textContent = "File could not be read: " + M.message;
      } finally {
        I.target.value = "";
      }
    }
  }, P("libraries").onchange = async (I) => {
    try {
      for (const k of I.target.files) {
        if (k.size > 16e6) throw Error("Library exceeds 16 MB: " + k.name);
        C[k.webkitRelativePath || k.name] = await Te(k);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      l = null, y = "", P("library-status").textContent = Object.keys(C).length + " library file(s) loaded", D();
    } catch (k) {
      n.textContent = k.message;
    } finally {
      I.target.value = "";
    }
  }, P("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", P("download").onclick = () => {
    const I = URL.createObjectURL(new Blob([r], { type: "image/svg+xml;charset=utf-8" })), k = document.createElement("a");
    k.href = I, k.download = "spice-schematic.svg", k.click(), setTimeout(() => URL.revokeObjectURL(I), 1e3);
  };
  async function $(I) {
    const k = s;
    if (!(!k || b || d)) {
      d = !0, _(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: M } = await import("./asc-export-CGFk97H4.js");
        if (s !== k) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= M({ tree: l, circuit: a, drawing: k, source: t.value, libraries: C });
        const Q = I ? u.zip : u.ascBytes, A = URL.createObjectURL(new Blob([Q], { type: I ? "application/zip" : "application/octet-stream" })), G = document.createElement("a");
        G.href = A, G.download = I ? "spice-schematic-asc.zip" : "spice-schematic.asc", G.click(), setTimeout(() => URL.revokeObjectURL(A), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (I ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (M) {
        n.textContent = "ASC export failed: " + M.message;
        const Q = document.createElement("li");
        Q.className = "error", Q.textContent = n.textContent, i.append(Q);
      } finally {
        d = !1, _();
      }
    }
  }
  P("download-asc").onclick = () => $(!1), P("download-asc-bundle").onclick = () => $(!0), P("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(r), n.textContent = "SVG source copied to clipboard.";
    } catch {
      P("source-details").open = !0, P("source").focus(), P("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, D();
}
export {
  we as b,
  Ne as e,
  ie as l,
  Ee as n,
  ht as p
};
