const Be = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, je = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Ge = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Fe = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, He = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, We = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Xe = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, qe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ze = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ke = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Ye = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Ze = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Je = {
  AND: Be,
  BUF: je,
  COUNTER: Ge,
  DFLOP: Fe,
  SCHMITT: $e,
  OR: He,
  PHASEDET: We,
  SRFLOP: Xe,
  XOR: qe,
  MODULATOR: ze,
  OTA: Ke,
  SAMPLEHOLD: Ye,
  VARISTOR: Ze
}, et = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ee = (t) => t.toLowerCase(), Ie = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), tt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function nt(t, e) {
  const n = (g) => e[ee(g || "")] || Object.entries(e).find(([m]) => m.startsWith(ee(g || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let o = [], u = [], a = "", r = "", s = [], c = [], d = 0, h = "", p = "", E = "", R = !0;
  if ("RLC".includes(i))
    o = ["A", "B"], r = ee(i) + "_v";
  else if ("DVIB".includes(i))
    o = ["+", "-"], r = i === "D" ? "d_v" : i === "B" ? "spice_b" : ee(i);
  else if (i === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Ie(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), a = t[o.length + 1] || "";
    const g = n(a)?.type;
    R = ["NPN", "PNP"].includes(g), r = R ? (o.length === 3 ? "q_" : "spice_q4_") + ee(g) : "spice_q" + o.length;
  } else if (i === "M") {
    const g = n(t[4]), m = n(t[5]), l = g?.type === "VDMOS" || !m && (!t[5] || Ie(t[5]));
    o = l ? ["D", "G", "S"] : ["D", "G", "S", "B"], a = t[o.length + 1] || "";
    const w = n(a), b = w?.type;
    if (l && w && b !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!l && b === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    R = ["NMOS", "PMOS", "VDMOS"].includes(b);
    let y = null, C = w;
    const N = /* @__PURE__ */ new Set();
    for (; C && !N.has(C.name) && (N.add(C.name), y = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !y); )
      C = n(C.baseModel);
    const P = b === "PMOS" || b === "VDMOS" && y && (y[1] === void 0 || Number(y[1]) >= 0.5);
    r = R ? "spice_" + (P ? "pmos" : "nmos") + (l ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    a = t[4] || "";
    const g = n(a)?.type, m = i === "Z" && ["NIGBT", "PIGBT"].includes(g);
    o = m ? ["C", "G", "E"] : ["D", "G", "S"], R = i === "J" ? ["NJF", "PJF"].includes(g) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(g), r = "spice_" + (m ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(g || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    o = ["+", "-"], r = "spice_" + ee(i);
    let g = 3, m = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[g] || "");
    if (/^poly$/i.test(t[g] || "") && (m = /^\(\s*(\d+)\s*\)$/.exec(t[++g] || ""), !m))
      throw Error("POLY requires a dimension.");
    if (m) {
      const l = Number(m[1]);
      if (l > 128) throw Error("POLY supports at most 128 controlling variables.");
      let w = g + 1, b = [];
      const y = "EG".includes(i), C = l * (y ? 2 : 1);
      for (; b.length < C && w < t.length; ) b.push(...tt(t[w++]));
      if (b.length !== C || w >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (y) {
        for (let N = 0; N < l; N++) o.push("C" + (N + 1) + "+", "C" + (N + 1) + "-");
        u = [t[1], t[2], ...b];
      } else s = b;
      d = w, h = "POLY(" + l + ") " + (y ? "" : b.join(" ") + " "), p = "POLY", y && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(i) ? (o.push("C+", "C-"), p = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (s = [t[3]], d = 4, h = t[3] + " ");
    E = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (p ? " · " + p : "");
  } else if (i === "S")
    o = ["A", "B", "C+", "C-"], a = t[5] || "", r = "spice_device", E = "Voltage switch";
  else if (i === "W")
    o = ["A", "B"], s = [t[3]], a = t[4] || "", d = 3, r = "spice_device", E = "Current switch";
  else if ("TO".includes(i))
    o = ["L+", "L-", "R+", "R-"], i === "O" && (a = t[5] || ""), r = "spice_device", E = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    o = ["N1", "N2", "COM"], a = t[4] || "", r = "spice_device", E = "Distributed RC";
  else if (i === "A")
    o = Array.from({ length: 8 }, (g, m) => "P" + (m + 1)), r = "spice_device", E = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (c = t.slice(1, -1), c.some((g) => !/^L/i.test(g.split(":").at(-1)))) throw Error("K references must name inductors.");
    d = t.length - 1, r = "spice_coupling", E = "Magnetic coupling", h = c.join(" ") + " · k=";
  } else if (i === "@")
    o = ["IN", "OUT"], r = "spice_device", E = "FRA";
  else if (i === "&")
    o = ["O+", "O-", "I+", "I-"], r = "spice_device", E = "FRA probe";
  else if (i === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", E = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (d || (d = o.length + 1), u.length || (u = t.slice(1, o.length + 1)), u.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= d && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (u.some((g) => /[=()]/.test(g) && !/^\{[\s\S]*\}$/.test(g))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(d).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(d).join(" ")) && (r = "spice_br"), i === "D" && (a = t[3] || ""), i === "@") {
    const g = t.slice(d).join(" ");
    for (const m of g.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(m[1].toUpperCase()), u.push(m[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (s.some((g) => !g)) throw Error("Missing controlling voltage source.");
  const O = o.map((g, m) => i === "A" && Je[(t[9] || "").toUpperCase()]?.[String(m + 1)] || g);
  return { kind: i, pins: o, nodeTokens: u, pinLabels: O, model: a, type: r, controlSource: s[0] || "", controlSources: s, coupledInductors: c, value: h + t.slice(d).join(" "), sourceMode: p, symbol: E, polarityKnown: R };
}
const rt = et, ot = new Set(rt.split(" ")), ge = () => /* @__PURE__ */ Object.create(null), F = (t) => t.toLowerCase();
function pe(t) {
  const e = [], n = [];
  let i = "", o = 0, u = "";
  for (let a = 0; a < t.length; a++) {
    const r = t[a];
    if (u) {
      i += r, r === u && t[a - 1] !== "\\" && (u = "");
      continue;
    }
    if (r === '"' || r === "'") {
      u = r, i += r;
      continue;
    }
    if (!o && (r === ";" || r === "$" && (!a || /\s/.test(t[a - 1])))) break;
    if ("({".includes(r) && (n.push(r), o++), ")}".includes(r) && (o--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !o ? (i && e.push(i), i = "") : i += r;
  }
  if (o || u) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function it(t, e = {}) {
  const n = [], i = [], o = [], u = Object.assign(ge(), e.models), a = ge(), r = (m, l, w) => n.push({ severity: m, line: l, message: w });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const s = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, l) => {
    const w = m.trim();
    !w || w.startsWith("*") || (w.startsWith("+") ? s.length ? s.at(-1).text += " " + w.slice(1).trim() : r("error", l + 1, "Continuation has no preceding statement.") : s.push({ line: l + 1, text: w }));
  });
  for (const m of s) {
    try {
      m.tokens = pe(m.text);
    } catch (w) {
      r("error", m.line, w.message), m.tokens = [];
    }
    const l = m.tokens;
    if (/^\.model$/i.test(l[0] || ""))
      if (l.length < 3) r("error", m.line, ".model requires a name and device type.");
      else {
        const w = /^ako:(.+)$/i.exec(l[2]), b = w && l[3] && !l[3].startsWith("(") ? l[3].split("(")[0].toUpperCase() : "";
        u[F(l[1])] = { name: l[1], type: w ? b : l[2].split("(")[0].toUpperCase(), baseModel: w?.[1] || "", raw: m.text };
      }
  }
  const c = /* @__PURE__ */ new Set();
  function d(m) {
    const l = u[F(m)];
    if (!l) return "";
    if (l.type) return l.type;
    if (c.has(F(m))) throw Error("Circular AKO model inheritance: " + m);
    return c.add(F(m)), l.type = d(l.baseModel), c.delete(F(m)), l.type;
  }
  for (const m of Object.values(u)) if (m.baseModel && !m.type)
    try {
      d(m.name);
    } catch (l) {
      r("error", 0, l.message);
    }
  let h = "", p = 0, E = !1, R = !1;
  const O = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: m, text: l, tokens: w } of s) {
    if (!w.length) continue;
    const b = F(w[0]);
    if (R) {
      r("warning", m, "Statement after .end is not rendered: " + l);
      continue;
    }
    if (b === ".control") {
      E = !0, r("warning", m, ".control script retained but not executed or rendered.");
      continue;
    }
    if (b === ".endc") {
      E = !1;
      continue;
    }
    if (E) continue;
    if (b === ".subckt") {
      p++, r("error", m, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (b === ".ends") {
      p ? p-- : r("error", m, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (b === ".end") {
      R = !0;
      continue;
    }
    if (b.startsWith(".")) {
      i.push({ line: m, text: l }), b === ".title" ? h = w.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(b) ? r("error", m, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(b) ? r("error", m, "Topology-changing directive is unsupported: " + l) : g.has(b) || r("warning", m, "Directive retained but not resolved: " + l);
      continue;
    }
    const y = w[0][0].toUpperCase();
    if (!ot.has(y)) {
      m === 1 && !/\d/.test(w[0]) && w.length > 1 && y !== "X" ? (h = l, r("warning", m, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", m, `Unsupported ${y} device was not rendered: ${l}`);
      continue;
    }
    const C = y === "M" || y === "Q" ? 5 : 4;
    if (m === 1 && !/\d/.test(w[0]) && (w.length < C || y === "T" && !/\b(?:zo|z0)\s*=/i.test(l))) {
      h = l, r("info", m, "SPICE title: " + l);
      continue;
    }
    try {
      if (O.has(b)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const N = nt(w, u), { pins: P, nodeTokens: k, ...U } = N;
      N.polarityKnown || r("warning", m, `${w[0]}: model polarity unknown; explicit ${P.join("/")} terminals retained.`);
      const T = ge();
      P.forEach((X, oe) => {
        const H = F(k[oe]);
        a[H] || (a[H] = { name: H, displayName: w[oe + 1], bit: Object.keys(a).length + 2, terminals: [] }), a[H].terminals.push({ component: w[0], pin: X }), T[X] = H;
      }), o.push({ ...U, name: w[0], terminals: T, line: m, raw: l }), O.add(b);
    } catch (N) {
      r("error", m, `${w[0]}: ${N.message} Statement: ${l}`);
    }
  }
  p && r("error", 0, "Unclosed .subckt definition."), E && r("error", 0, "Unclosed .control block."), o.length || r("error", 0, "No supported components to render."), o.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const m of o) {
    for (const l of m.controlSources || []) !l.includes(":") && !o.some((w) => F(w.name) === F(l) && w.kind === "V") && r("error", m.line, `${m.name}: controlling voltage source ${l} was not found.`);
    for (const l of m.coupledInductors || []) !l.includes(":") && !o.some((w) => F(w.name) === F(l) && w.kind === "L") && r("error", m.line, `${m.name}: coupled inductor ${l} was not found.`);
    (m.kind === "B" || m.type === "spice_b") && r("info", m.line, `${m.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: h, components: o, nodes: a, models: u, directives: i, diagnostics: n };
}
const Y = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Oe = (t) => Y(t).split("/").at(-1);
function st(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), o = [], u = [], a = [];
  let r = 0;
  const s = (d, h) => {
    const p = Y(h).split("/").slice(0, -1).concat(Y(d)).join("/"), E = [...i].filter(([O]) => Y(O) === Y(d) || Y(O) === p);
    if (E.length === 1) return E[0];
    const R = [...i].filter(([O]) => Oe(O) === Oe(d));
    if (R.length !== 1) throw Error(R.length ? "Ambiguous library filename: " + d : "Missing library " + d + ". Add this file using Library files.");
    return R[0];
  };
  function c(d, h, p = "", E = []) {
    const R = Y(h) + ":" + p.toLowerCase();
    if (E.includes(R)) throw Error("Circular library include: " + [...E, R].join(" → "));
    if (E.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const O = [], g = /^\s*\.endl\b/im.test(d);
    let m = !p;
    const l = (b, y) => {
      if (r += b.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      a.push(b), u.push({ file: h, line: y + 1 });
    };
    if (d.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, y) => {
      const C = b.trim();
      if (/^\.lib\b/i.test(C) && g) {
        const N = pe(C);
        if (N.length === 2 && !/[.\\/]/.test(N[1])) {
          O.push(N[1].toLowerCase()), N[1].toLowerCase() === p.toLowerCase() && (m = !0), l("* Library section " + N[1], y);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        O.pop(), l("* End library section", y);
        return;
      }
      if (p && O.length && !O.includes(p.toLowerCase())) {
        l("* Unselected library section", y);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const N = pe(C);
          if (!N[1]) throw Error("Include requires a filename.");
          const [P, k] = s(N[1], h);
          l("* Included " + P, y), c(k, P, N[2] || "", [...E, R]);
        } catch (N) {
          o.push({ severity: "error", line: y + 1, source: h, message: N.message }), l("* Unresolved include", y);
        }
      else l(b, y);
    }), !m) throw Error("Library section " + p + " not found in " + h);
  }
  try {
    c(t, n);
  } catch (d) {
    o.push({ severity: "error", line: 0, source: n, message: d.message });
  }
  return { source: a.join(`
`), origins: u, diagnostics: o };
}
function at(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], o = [];
  t.split(/\r?\n/).forEach((r, s) => {
    const c = r.trim();
    /^\.subckt\b/i.test(c) && (i.push(s + 1), n.set(s + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: r, line: s + 1 }) : e[s] = r, /^\.ends\b/i.test(c) && i.length > 1 && i.pop();
  });
  const u = xe(Array.from({ length: t.split(/\r?\n/).length }, (r, s) => e[s] || "").join(`
`));
  o.push(...u.diagnostics);
  const a = /* @__PURE__ */ new Map();
  for (const [r, s] of n) {
    const c = xe(s.map((d) => d.raw).join(`
`));
    a.set(r, c.layout), o.push(...c.diagnostics.map((d) => ({ ...d, line: s[d.line - 1]?.line || r })));
  }
  return { layout: u.layout, scopes: a, diagnostics: o };
}
function xe(t) {
  const e = [], n = [];
  let i = !1, o = !1, u = 0;
  if (t.split(/\r?\n/).forEach((g, m) => {
    const l = g.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(l)) {
      (o || i) && e.push({ severity: "error", line: m + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(l) || e.push({ severity: "error", line: m + 1, message: "Expected @layout begin v1." }), o = !0, i = !0, u = m + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(l)) {
      i || e.push({ severity: "error", line: m + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (l.startsWith("*") ? n.push(l.slice(1).trim()) : e.push({ severity: "error", line: m + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const a = n.join(" "), r = a.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], s = [], c = [];
  let d = 0, h = 0, p = 10;
  const E = () => r[d++], R = () => {
    const g = E();
    if (!g || !/^[A-Za-z_@][\w./%:@-]*$/.test(g)) throw Error("Expected layout identifier, got " + g);
    return g;
  };
  function O(g) {
    if (s.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const m = g ? R() : "@row" + h++, l = E();
    if (!["row", "column"].includes(l)) throw Error("Expected row or column.");
    if (E() !== "{") throw Error("Expected { after " + l);
    const w = { id: m, direction: l, members: [] };
    for (s.push(w); d < r.length && r[d] !== "}"; )
      r[d] === "group" ? (E(), w.members.push(O(!0))) : ["row", "column"].includes(r[d]) ? w.members.push(O(!1)) : w.members.push(R());
    if (E() !== "}") throw Error("Unclosed group " + m);
    if (!w.members.length) throw Error("Empty layout group " + m);
    return m;
  }
  try {
    for (; d < r.length; )
      if (r[d] === "group")
        E(), O(!0);
      else if (["row", "column"].includes(r[d])) O(!1);
      else if (r[d] === "priority-cap") {
        if (E(), p = Number(E()), !Number.isInteger(p) || p < 3 || p > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const N = R(), P = E(), k = R();
        if (!["left-of", "above"].includes(P)) throw Error("Expected left-of or above.");
        c.push({ a: N, relation: P, b: k });
      } else throw Error("Unknown layout instruction near " + r[d - 1]);
    const g = /* @__PURE__ */ new Set();
    for (const N of s) {
      const P = N.id.toLowerCase();
      if (g.has(P)) throw Error("Duplicate layout group " + N.id);
      g.add(P);
    }
    const m = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), w = new Map(s.map((N) => [N.id.toLowerCase(), N])), b = (N) => {
      if (m.has(N)) throw Error("Circular layout group " + N);
      if (!l.has(N)) {
        m.add(N);
        for (const P of w.get(N).members) w.has(P.toLowerCase()) && b(P.toLowerCase());
        m.delete(N), l.add(N);
      }
    };
    for (const N of w.keys()) b(N);
    const y = /* @__PURE__ */ new Map();
    for (const N of c) {
      if (N.a.toLowerCase() === N.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      y.has(N.a.toLowerCase()) || y.set(N.a.toLowerCase(), []), y.get(N.a.toLowerCase()).push(N.b.toLowerCase());
    }
    m.clear(), l.clear();
    const C = (N) => {
      if (m.has(N)) throw Error("Circular place constraints.");
      if (!l.has(N)) {
        m.add(N);
        for (const P of y.get(N) || []) C(P);
        m.delete(N), l.add(N);
      }
    };
    for (const N of y.keys()) C(N);
  } catch (g) {
    e.push({ severity: "error", line: u, message: "Layout description: " + g.message });
  }
  return { layout: { version: 1, priorityCap: p, groups: s, relations: c }, diagnostics: e };
}
function ct(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const d = new Set(n.groups.map((p) => p.id.toLowerCase())), h = (p) => d.has(p.toLowerCase()) ? p : e.components.find((R) => R.synthetic && R.value.toLowerCase() === p.toLowerCase())?.name || e.focus + "/" + p;
    i = { ...n, groups: n.groups.map((p) => ({ ...p, members: p.members.map(h) })), relations: n.relations.map((p) => ({ ...p, a: h(p.a), b: h(p.b) })) };
  }
  const o = new Map(i.groups.map((d) => [d.id.toLowerCase(), d])), u = Object.values(t.contexts).flatMap((d) => d.devices.map((h) => h.name)), a = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((d) => d.name)].map((d) => d.toLowerCase()));
  for (const d of o.values()) if (a.has((n ? e.focus + "/" + d.id : d.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + d.id);
  for (const d of o.values()) for (const h of d.members) if (!o.has(h.toLowerCase()) && !a.has(h.toLowerCase())) throw Error("Unknown @layout instance/device: " + h);
  for (const d of i.relations) for (const h of [d.a, d.b]) if (!o.has(h.toLowerCase()) && !a.has(h.toLowerCase())) throw Error("Unknown @layout place target: " + h);
  const r = /* @__PURE__ */ new Map(), s = [];
  for (const d of i.groups) {
    const h = [];
    for (const p of d.members) {
      if (o.has(p.toLowerCase())) {
        h.push({ group: p });
        continue;
      }
      for (const E of e.components) if (E.name.toLowerCase() === p.toLowerCase() || E.name.toLowerCase().startsWith(p.toLowerCase() + "/")) {
        if (r.has(E.name)) throw Error("Overlapping @layout membership: " + E.name);
        r.set(E.name, d.id), h.push({ cell: E.name, instance: p });
      }
    }
    s.push({ id: d.id, direction: d.direction, members: h });
  }
  const c = /* @__PURE__ */ new Set();
  for (const d of s) for (const h of d.members) if (h.group) {
    const p = h.group.toLowerCase();
    if (c.has(p)) throw Error("Layout group has multiple parents: " + h.group);
    c.add(p);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: s, relations: i.relations };
}
const ne = () => /* @__PURE__ */ Object.create(null), j = (t) => t.toLowerCase();
function Ue(t) {
  const e = ne();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!o) throw Error("Expected named parameter assignment, got: " + i);
    const u = j(o[1]);
    let a = o[2];
    if (a === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + u);
      a = r[1];
    }
    if (a || (a = t[++n]), !a || /^params?:$/i.test(a)) throw Error("Missing value for parameter " + u);
    if (Object.hasOwn(e, u)) throw Error("Duplicate parameter: " + u);
    e[u] = a;
  }
  return e;
}
function Re(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, ne()] : [t.slice(0, e), Ue(t.slice(e))];
}
function lt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = st(t, e);
  t = n.source;
  const i = at(t), o = [...n.diagnostics, ...i.diagnostics], u = ne(), a = /* @__PURE__ */ new Set(["0"]), r = (l, w, b) => o.push({ severity: l, line: w, message: b }), s = (l, w, b, y = [], C = ne(), N = 0) => {
    const P = { id: l, name: w, parent: b, ports: y, defaults: C, parameters: ne(), definitions: ne(), devices: [], instances: [], directives: [], line: N, statements: [], layoutDescription: i.scopes.get(N) || null };
    return u[l] = P, P;
  }, c = s("root", "Top", null), d = [c], h = [];
  let p = !1, E = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((l, w) => {
    const b = l.trim();
    !b || b.startsWith("*") || (b.startsWith("+") ? h.length ? h.at(-1).text += " " + b.slice(1).trim() : r("error", w + 1, "Continuation has no preceding statement.") : h.push({ text: b, line: w + 1 }));
  });
  for (const { text: l, line: w } of h)
    try {
      const b = pe(l);
      if (!b.length) continue;
      const y = j(b[0]), C = d.at(-1);
      if (E) {
        r("warning", w, "Statement after .end is not rendered: " + l);
        continue;
      }
      if (y === ".control") {
        p = !0, r("warning", w, ".control script retained but not executed or rendered.");
        continue;
      }
      if (y === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (y === ".subckt") {
        if (b.length < 2) throw Error(".SUBCKT requires a name.");
        const [N, P] = Re(b.slice(2)), k = j(b[1]);
        if (Object.hasOwn(C.definitions, k)) throw Error("Duplicate subcircuit definition: " + b[1]);
        const U = N.map(j);
        if (new Set(U).size !== N.length || U.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (N.some((X) => /[{}()=]/.test(X))) throw Error("Invalid formal port.");
        if (d.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const T = C.id + "/" + encodeURIComponent(k);
        C.definitions[k] = T, d.push(s(T, b[1], C.id, N, P, w));
        continue;
      }
      if (y === ".ends") {
        if (d.length === 1) throw Error("Unmatched .ENDS.");
        if (b[1] && j(b[1]) !== j(C.name)) throw Error(".ENDS name does not match " + C.name);
        d.pop();
        continue;
      }
      if (y === ".end") {
        if (d.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        E = !0;
        continue;
      }
      if (y === ".param") {
        const N = Ue(b.slice(1));
        for (const [P, k] of Object.entries(N)) {
          if (Object.hasOwn(C.parameters, P)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + P);
          C.parameters[P] = k;
        }
      }
      if (y === ".global") {
        if (b.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const N of b.slice(1)) a.add(j(N));
      }
      if (y.startsWith(".") && C.directives.push({ line: w, text: l }), y.startsWith("x")) {
        const [N, P] = Re(b.slice(1));
        if (!N.length) throw Error("X instance requires a subcircuit name.");
        const k = /;§pnba\s+(.+)$/i.exec(l)?.[1].split(")");
        C.instances.push({ name: b[0], nodes: N.slice(0, -1).map(j), definitionName: N.at(-1), definitionId: null, parameters: P, line: w, raw: l, pinNames: k });
      } else C.statements.push({ line: w, text: l });
    } catch (b) {
      r("error", w, b.message + " Statement: " + l);
    }
  d.length > 1 && r("error", d.at(-1).line, "Unclosed .SUBCKT " + d.at(-1).name), p && r("error", 0, "Unclosed .control block.");
  function R(l, w) {
    for (; l; ) {
      if (Object.hasOwn(l.definitions, j(w))) return l.definitions[j(w)];
      l = u[l.parent];
    }
    return null;
  }
  for (const l of Object.values(u)) {
    const w = [...l.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...l.statements], b = it(w.map((C) => C.text).join(`
`), { models: u[l.parent]?.models });
    l.devices = b.components.map((C) => ({ ...C, line: w[C.line - 1]?.line || l.line })), l.models = b.models, l === c && (c.title = b.title), o.push(...b.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: w[C.line - 1]?.line || l.line })));
    const y = new Set(l.devices.map((C) => j(C.name)));
    for (const C of l.instances)
      if (y.has(j(C.name)) && r("error", C.line, "Duplicate instance/device name: " + C.name), y.add(j(C.name)), C.definitionId = R(l, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) r("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const N = u[C.definitionId];
        N.ports.length !== C.nodes.length && r("error", C.line, `${C.name}: ${N.name} expects ${N.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const l of Object.values(u)) delete l.statements;
  const O = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set();
  function m(l, w = []) {
    if (O.has(l)) {
      r("error", u[l].line, "Circular subcircuit reference: " + [...w, u[l].name].join(" → "));
      return;
    }
    if (!g.has(l)) {
      if (O.add(l), w.length >= 64) {
        r("error", u[l].line, "Subcircuit dependency nesting exceeds 64 levels."), O.delete(l), g.add(l);
        return;
      }
      for (const b of u[l].instances) b.definitionId && m(b.definitionId, [...w, u[l].name]);
      O.delete(l), g.add(l);
    }
  }
  for (const l of Object.keys(u)) m(l);
  !c.devices.length && !c.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const l of o) !l.source && l.line && n.origins[l.line - 1] && (l.source = n.origins[l.line - 1].file, l.line = n.origins[l.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: c.title || "", scopes: u, globals: [...a], diagnostics: o, layoutDescription: i.layout };
}
const M = () => /* @__PURE__ */ Object.create(null), te = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), be = (t, e) => te(t.map((n) => n.toLowerCase()), e.toLowerCase());
function ut(t, e = []) {
  const n = M(), i = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [u, a] of Object.entries(o.terminals)) i(a).terminals.push({ component: o.name, pin: u });
  for (const o of e) i(o);
  return n;
}
function dt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ve = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, pt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function fe(t, e, n = (o) => o, i = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (a) => (o.push(a), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (a, r, s) => {
    const c = s.split(",").map((h) => h.trim());
    if (c.some((h) => !h || /[\s{}+*()]/.test(h))) throw Error("Unsupported dynamic voltage/current reference: " + a);
    const d = r.toUpperCase() + "(" + c.map((h) => r.toLowerCase() === "v" ? n(h) : i(h, r)).join(",") + ")";
    return o.push(d), "@@" + (o.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(pt, (a, r, s) => {
    if (s.slice(r + a.length).trimStart().startsWith("(")) return a;
    const c = e(a.toLowerCase());
    if (c === void 0) return a;
    if (u += c.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + c + ")";
  }), t.replace(/@@(\d+)@@/g, (a, r) => o[Number(r)]);
}
function ft(t, e, n, i) {
  const o = { ...e, ...n }, u = M(), a = /* @__PURE__ */ new Set(), r = M();
  for (const [c, d] of Object.entries(i)) r[c] = fe(ve(d), (h) => t[h]);
  function s(c) {
    if (Object.hasOwn(r, c)) return r[c];
    if (Object.hasOwn(u, c)) return u[c];
    if (!Object.hasOwn(o, c)) return t[c];
    if (a.has(c)) {
      if (Object.hasOwn(t, c)) return t[c];
      throw Error("Circular parameter dependency: " + [...a, c].join(" → "));
    }
    return a.add(c), u[c] = fe(ve(o[c]), s), a.delete(c), u[c];
  }
  for (const c of Object.keys(o)) s(c);
  return Object.assign(M(), t, u, r);
}
function Se(t, e, n, i) {
  let o = "";
  for (let s = 0; s < t.length; ) {
    const c = t[s];
    if (c !== "{" && c !== "'") {
      o += c, s++;
      continue;
    }
    const d = s++;
    let h = 1, p = "";
    for (; s < t.length && h; s++) {
      if (c === "'") {
        t[s] === "'" && (h = 0);
        continue;
      }
      if (p) {
        t[s] === p && (p = "");
        continue;
      }
      if (t[s] === '"' || t[s] === "'") {
        p = t[s];
        continue;
      }
      t[s] === "{" && h++, t[s] === "}" && h--;
    }
    if (h) throw Error("Unclosed parameter expression.");
    o += c + fe(t.slice(d + 1, s - 1), (E) => e[E], n, i) + (c === "{" ? "}" : "'");
  }
  const u = [];
  let a = 0, r = "";
  for (let s = 0; s < o.length; s++) {
    const c = o[s];
    if (r) {
      c === r && o[s - 1] !== "\\" && (r = "");
      continue;
    }
    if (c === '"' || c === "'") {
      r = c;
      continue;
    }
    if ("({".includes(c) && a++, ")}".includes(c) && a--, !a && (s === 0 || /\s/.test(o[s - 1]))) {
      const d = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(s));
      d && (u.push({ start: s, end: s + d[0].length, key: d[1].toLowerCase() }), s += d[0].length - 1);
    }
  }
  if (u.length) {
    let s = o.slice(0, u[0].start);
    u.forEach((c, d) => {
      const h = u[d + 1]?.start ?? o.length, p = o.slice(c.end, h);
      s += o.slice(c.start, c.end) + (p.includes("{") || ["refnode", "intnode"].includes(c.key) ? p : fe(p, (E) => e[E], n, i));
    }), o = s;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
}
class ht {
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
      for (let o in arguments[0])
        this.add(o, arguments[0][o], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(o) {
        this[o] = this[o] || [], n && this[o][i ? "unshift" : "push"](n);
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
class mt {
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
  static addBinaryOp(e, n, i) {
    return f.max_binop_len = Math.max(e.length, f.max_binop_len), f.binary_ops[e] = n, i ? f.right_associative.add(e) : f.right_associative.delete(e), f;
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
      const i = { context: this, node: n };
      return f.hooks.run(e, i), i.node;
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
      return f.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
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
    let n = [], i, o;
    for (; this.index < this.expr.length; )
      if (i = this.code, i === f.SEMCOL_CODE || i === f.COMMA_CODE)
        this.index++;
      else if (o = this.gobbleExpression())
        n.push(o);
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
    let e, n, i, o, u, a, r, s, c;
    if (a = this.gobbleToken(), !a || (n = this.gobbleBinaryOp(), !n))
      return a;
    for (u = { value: n, prec: f.binaryPrecedence(n), right_a: f.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), o = [a, u, r]; n = this.gobbleBinaryOp(); ) {
      if (i = f.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: i, right_a: f.right_associative.has(n) }, c = n;
      const d = (h) => u.right_a && h.right_a ? i > h.prec : i <= h.prec;
      for (; o.length > 2 && d(o[o.length - 2]); )
        r = o.pop(), n = o.pop().value, a = o.pop(), e = {
          type: f.BINARY_EXP,
          operator: n,
          left: a,
          right: r
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + c), o.push(u, e);
    }
    for (s = o.length - 1, e = o[s]; s > 1; )
      e = {
        type: f.BINARY_EXP,
        operator: o[s - 1].value,
        left: o[s - 2],
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
    let e, n, i, o;
    if (this.gobbleSpaces(), o = this.searchHook("gobble-token"), o)
      return this.runHook("after-token", o);
    if (e = this.code, f.isDecimalDigit(e) || e === f.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === f.SQUOTE_CODE || e === f.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === f.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, f.max_unop_len), i = n.length; i > 0; ) {
        if (f.unary_ops.hasOwnProperty(n) && (!f.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !f.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: f.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      f.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), f.literals.hasOwnProperty(o.name) ? o = {
        type: f.LITERAL,
        value: f.literals[o.name],
        raw: o.name
      } : o.name === f.this_str && (o = { type: f.THIS_EXP })) : e === f.OPAREN_CODE && (o = this.gobbleGroup());
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
    for (; n === f.PERIOD_CODE || n === f.OBRACK_CODE || n === f.OPAREN_CODE || n === f.QUMARK_CODE; ) {
      let i;
      if (n === f.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== f.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
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
      } : (n === f.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: f.MEMBER_EXP,
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
    return i = this.code, f.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === f.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === f.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const n = this.index, i = this.expr.charAt(this.index++);
    let o = !1;
    for (; this.index < this.expr.length; ) {
      let u = this.expr.charAt(this.index++);
      if (u === i) {
        o = !0;
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
    return o || this.throwError('Unclosed quote after "' + e + '"'), {
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
    let i = !1, o = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let u = this.code;
      if (u === e) {
        i = !0, this.index++, e === f.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (u === f.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === f.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === f.CBRACK_CODE)
            for (let a = n.length; a < o; a++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const a = this.gobbleExpression();
        (!a || a.type === f.COMPOUND) && this.throwError("Expected comma"), n.push(a);
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
const gt = new ht();
Object.assign(f, {
  hooks: gt,
  plugins: new mt(f),
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
const re = (t) => new f(t).parse(), bt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(f).filter((t) => !bt.includes(t) && re[t] === void 0).forEach((t) => {
  re[t] = f[t];
});
re.Jsep = f;
const Et = "ConditionalExpression";
var _t = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: Et,
            test: i,
            consequent: o,
            alternate: u
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let a = i;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
re.plugins.register(_t);
const wt = "ConditionalExpression";
var Nt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: wt,
            test: i,
            consequent: o,
            alternate: u
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let a = i;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
re.plugins.register(Nt);
const yt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Le = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, B = (t) => Number(t) > 0.5;
function ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function o(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (s) => {
      if (s[0] === '"' || s[0] === "'") return s;
      const [, c, d, h] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(s), p = d.toLowerCase(), E = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : yt[p[0]] || 1;
      return "(" + (h ? +(c + (c.includes(".") ? "" : ".") + h) : Number(c)) * E + ")";
    }), u(re(r));
  }
  function u(r) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const s = r.name.toLowerCase();
      if (s === "pi") return Math.PI;
      if (s === "e") return Math.E;
      if (!Object.hasOwn(e, s)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(s)) throw Error("Circular structural parameter: " + s);
      n.add(s);
      const c = o(e[s]);
      return n.delete(s), c;
    }
    if (r.type === "ConditionalExpression") return B(u(r.test)) ? u(r.consequent) : u(r.alternate);
    if (r.type === "UnaryExpression") {
      const s = u(r.argument);
      if (r.operator === "-") return -s;
      if (r.operator === "+") return +s;
      if (r.operator === "!" || r.operator === "~") return !B(s);
    }
    if (r.type === "BinaryExpression") {
      const s = u(r.left);
      if (r.operator === "&&") return B(s) && B(u(r.right));
      if (r.operator === "||") return B(s) || B(u(r.right));
      const c = u(r.right);
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
          return B(s) !== B(c);
        case "&":
          return B(s) && B(c);
        case "|":
          return B(s) || B(c);
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
        return B(u(r.arguments[0])) ? u(r.arguments[1]) : u(r.arguments[2]);
      }
      if (Object.hasOwn(Le, s)) return Le[s](...r.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const a = o(t);
  if (typeof a == "number" && !Number.isFinite(a)) throw Error("Structural expression is not finite.");
  return a;
}
function Ct(t) {
  dt(t);
  const e = M(), n = /* @__PURE__ */ new Map();
  let i = 0, o = 0;
  function u(a, r, s, c, d, h, p) {
    if (r.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++i > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[a], R = r.length ? te(r.slice(0, -1), r.at(-1)) : "", O = M();
    if (p.some((y) => y.scopeId === a)) throw Error("Circular subcircuit reference at " + R);
    const g = ft(c, E.defaults, E.parameters, d);
    function m(y) {
      if (/^\{[\s\S]*\}$/.test(y)) {
        const N = ae(y, g);
        y = String(typeof N == "boolean" ? Number(N) : N);
      }
      /^"[\s\S]*"$/.test(y) && (y = y.slice(1, -1));
      const C = y.toLowerCase();
      return Object.hasOwn(s, C) ? s[C] : t.globals.includes(C) ? be([], C) : O[C] || (O[C] = be(r, C));
    }
    const l = { id: R, path: r, scopeId: a, name: h?.name || "Top", definition: E.name, ports: E.ports.map((y) => ({ name: y, node: m(y) })), params: g, nodes: O, models: M(), devices: [], children: [], raw: h?.raw || "", line: h?.line || 0 };
    e[R] = l, n.set(R, m);
    const w = [...p, l];
    function b(y) {
      if (!y) return "";
      let C = E;
      for (; C; ) {
        if (C.directives.some((N) => new RegExp("^\\.model\\s+" + y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(N.text))) {
          const N = [...w].reverse().find((P) => P.scopeId === C.id);
          return te(N?.path || [], y.toLowerCase());
        }
        C = t.scopes[C.parent];
      }
      return y;
    }
    for (const y of E.directives.filter((C) => /^\.model\b/i.test(C.text))) {
      const C = /^\.model\s+(\S+)/i.exec(y.text)?.[1];
      if (!C) continue;
      const N = b(C), P = E.models[C.toLowerCase()], k = Se(y.text, g, m, (U) => te(r, U));
      l.models[N] = { ...P, name: N, raw: k.replace(/^(\.model\s+)\S+/i, (U, T) => T + N), instanceId: R, parameters: g };
    }
    for (const y of E.devices) {
      if (++o > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const C = M();
      for (const [P, k] of Object.entries(y.terminals)) C[P] = m(k);
      const N = b(y.model);
      l.devices.push({ ...y, name: te(r, y.name), localName: y.name, instanceId: R, terminals: C, model: N, parameters: g });
    }
    for (const y of E.instances) {
      let C = y.definitionId;
      if (!C) {
        const U = String(ae(y.definitionName, g)).toLowerCase();
        let T = E;
        for (; T && !C; )
          C = T.definitions[U], T = t.scopes[T.parent];
        if (!C) throw Error("Undefined selected subcircuit: " + U);
      }
      const N = t.scopes[C], P = M();
      if (N.ports.length !== y.nodes.length) throw Error(y.name + ": expected " + N.ports.length + " ports; got " + y.nodes.length);
      N.ports.forEach((U, T) => {
        P[U.toLowerCase()] = m(y.nodes[T]);
      });
      const k = u(C, [...r, y.name], P, g, y.parameters, y, w);
      y.pinNames?.length === k.ports.length && k.ports.forEach((U, T) => {
        U.label = y.pinNames[T];
      }), l.children.push(k);
    }
    return l;
  }
  try {
    let d = function(h, p) {
      const E = p.split(":");
      if (E.length === 1) return { owner: h, name: p };
      const R = E.pop();
      for (const O of [[...h.path, ...E], E]) {
        const g = r.get(O.map(encodeURIComponent).join("/").toLowerCase());
        if (g) return { owner: g, name: R };
      }
      throw Error("Unknown hierarchical reference: " + p);
    };
    const a = u(t.rootId, [], M(), M(), M(), null, []), r = new Map(Object.values(e).map((h) => [h.id.toLowerCase(), h])), s = Object.assign(M(), ...Object.values(e).map((h) => h.models)), c = (h) => s[h] || Object.entries(s).find(([p]) => p.startsWith(h + "."))?.[1];
    for (const h of Object.values(e)) for (const p of h.devices) {
      const E = t.scopes[h.scopeId].devices.find((g) => g.name === p.localName), R = (g) => {
        const m = d(h, g);
        return n.get(m.owner.id)(m.name);
      }, O = (g, m = "", l = "") => {
        const w = d(h, g), b = w.owner.devices.find((y) => y.localName.toLowerCase() === w.name.toLowerCase());
        if (m.toLowerCase() === "ix") {
          const y = w.owner.ports.find((C, N) => C.name.toLowerCase() === w.name.toLowerCase() || String(N + 1) === w.name);
          if (y) return w.owner.id + ":" + y.name;
        }
        if (!b) {
          if (l) throw Error(p.name + ": referenced " + l + " device " + g + " was not found.");
          return te(w.owner.path, w.name);
        }
        if (l && b.kind !== l) throw Error(p.name + ": " + g + " must be a " + l + " device.");
        return b.name;
      };
      if (p.value = Se(E.value, h.params, R, O), E.model && (p.value = p.value.replace(E.model, p.model)), p.kind === "M" && Object.keys(p.terminals).length === 3) {
        let g = c(p.model), m = !1;
        const l = /* @__PURE__ */ new Set();
        for (; g?.type === "VDMOS" && !l.has(g.name); ) {
          l.add(g.name);
          const w = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(g.raw);
          if (w) {
            m = w[1] === void 0 || Number(ae(w[1], g.parameters)) >= 0.5;
            break;
          }
          const b = g.name.includes("/") ? g.name.slice(0, g.name.lastIndexOf("/") + 1) : "";
          g = c(b + (g.baseModel || "").toLowerCase()) || c((g.baseModel || "").toLowerCase());
        }
        l.size && (p.type = "spice_" + (m ? "pmos3" : "nmos3"));
      }
      p.controlSources = (E.controlSources || []).map((g) => O(g, "", "V")), p.controlSource = p.controlSources[0] || "", p.coupledInductors = (E.coupledInductors || []).map((g) => O(g, "", "L"));
      for (const g of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const m = g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        p.value = p.value.replace(new RegExp("(?<![\\w./%])" + m + "(?![\\w.$])", "g"), () => O(g));
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
function Pe(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
const Ae = 7;
function Ee(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const ue = (t) => ["pwr", "ret", "bias"].includes(t), It = (t) => String(t).split("/").at(-1).toLowerCase(), De = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[It(t)] || "unknown", Ot = (t) => {
  const e = Ee(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || De(t);
};
function xt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (a, r, s) => {
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
        const d = ae(c[1], a.parameters);
        if (typeof d != "number" || !Number.isFinite(d)) continue;
        i(a.terminals["-"], a.terminals["+"], d), i(a.terminals["+"], a.terminals["-"], -d);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  for (const a of ["0", ...e.keys()]) {
    if (u.has(a)) continue;
    const r = /* @__PURE__ */ new Map([[a, 0]]), s = [a];
    u.add(a);
    let c = !1;
    for (let d = 0; d < s.length; d++) for (const h of e.get(s[d]) || []) {
      const p = r.get(s[d]) + h.delta;
      r.has(h.node) ? Math.abs(r.get(h.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (c = !0) : (r.set(h.node, p), u.add(h.node), s.push(h.node));
    }
    c && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [d, h] of r) o[d] = { value: h, reference: a, known: a === "0" && !c, consistent: !c };
  }
  return { nodes: o, diagnostics: n };
}
function Rt(t, e) {
  const n = xt(ce(t.root)), i = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const r = Ee(a.name), s = De(a.name);
    i[a.name] = { role: r !== "unknown" ? r : s, roleSource: r !== "unknown" ? "node-name" : s !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[a.name]?.known ? n.nodes[a.name].value : null };
  }
  const u = (a, r, s) => {
    const c = { role: i[s].role, roleSource: i[s].roleSource }, d = a.block?.ports.find((E) => E.pin === r);
    if (d?.implicit || !a.block && !a.synthetic) return c;
    const h = a.synthetic ? a.value : d?.name || d?.label, p = Ot(h);
    return p !== "unknown" ? { role: p, roleSource: Ee(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ue(c.role) ? { ...c, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const r = Object.fromEntries(Object.entries(a.terminals).map(([b, y]) => [b, { ...i[y], ...u(a, b, y) }])), s = Object.values(r), c = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), d = c && s.length === 2 && s.every((b) => !ue(b.role) && (b.potential === null || b.role !== "unknown")), h = a.terminals["+"], p = a.terminals["-"], E = [h, p].filter((b) => b && b !== "0"), R = a.kind === "V" && E.some((b) => ue(i[b]?.role)) && !E.some((b) => ["in", "out", "io", "fb"].includes(i[b]?.role)) && [h, p].every((b) => n.nodes[b]?.known), O = h === "0" ? p : h, g = Object.keys(a.terminals), m = (b) => ue(b.role) ? b.potential !== null ? b.potential > 0 ? "high" : "low" : b.role === "ret" ? "low" : "high" : "signal";
    let l = !1;
    g.length === 2 && (a.kind === "V" && s.every((b) => b.potential !== null) ? l = s[0].potential < s[1].potential : a.terminals[g[0]] === "0" ? l = !0 : a.terminals[g[1]] === "0" ? l = !1 : s.every((b) => b.potential !== null) ? l = s[0].potential < s[1].potential : l = m(s[0]) === "low" || m(s[1]) === "high" && m(s[0]) === "signal");
    const w = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    o[a.name] = { version: Ae, kind: a.kind, owner: w.includes("/") ? w.slice(0, w.lastIndexOf("/")) : "", passive: c, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !c, ports: r, horizontal: d, orientation: d ? "horizontal" : l ? "vertical-reversed" : "vertical", flexible: g.length === 2 && (c || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!R, voltage: R ? n.nodes[O].value : null };
  }
  return { version: Ae, nodes: i, cells: o, diagnostics: n.diagnostics };
}
function Me(t, e) {
  const n = e.ports.map((o, u) => ({ pin: "P" + u, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), i = new Set(ce(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const u = be([], o);
    i.has(u) && !n.some((a) => a.node === u) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: u, implicit: !0 });
  }
  return n;
}
function vt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const o = t.contexts[i];
  if (!o) throw Error("Unknown instance: " + i);
  const u = [], a = [];
  function r(d) {
    a.push(...Object.values(d.nodes), ...d.ports.map((p) => p.node));
    const h = [...d.devices.map((p) => ({ line: p.line, device: p })), ...d.children.map((p) => ({ line: p.line, child: p }))].sort((p, E) => p.line - E.line);
    for (const p of h) {
      if (p.device) {
        const g = p.device;
        u.push({ ...g, layoutLabel: [...d.path.slice(o.path.length), g.localName].join("/") });
        continue;
      }
      const E = p.child;
      if (e === "flat" || n.has(E.id)) {
        r(E);
        continue;
      }
      const R = Me(t, E), O = M();
      R.forEach((g) => {
        O[g.pin] = g.node;
      }), u.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: O, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(o.path.length).join("/"), block: { definitionId: E.scopeId, ports: R, parameters: E.params } });
    }
  }
  r(o);
  for (const [d, h] of o.ports.entries()) u.push({ name: "@port/" + i + "/" + d, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (u.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const s = Object.assign(M(), ...Object.values(t.contexts).map((d) => d.models)), c = { title: i || t.ir.title, components: u, nodes: ut(u, a), models: s, diagnostics: t.ir.diagnostics, mode: e, focus: i };
  return c.topology = St(t, c), c.layout = Rt(t, c), c.layout.description = ct(t, c), c;
}
function St(t, e) {
  const n = [], i = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const r = t.contexts[a.instanceId];
        if (!r) throw Error("Projection contains an unknown block.");
        const s = Me(t, r);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(s.map((c) => [c.pin, c.node]))) throw Error("Block interface topology mismatch: " + a.name);
        n.push(...ce(r));
      } else n.push(a);
  for (const a of n) {
    if (i.has(a.name)) throw Error("Projection duplicates " + a.name);
    i.add(a.name);
  }
  const o = Pe(n), u = ce(t.contexts[e.focus]);
  if (o !== Pe(u)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: o };
}
function Lt(t) {
  const e = M(), n = M();
  for (const i of t.components) {
    const o = M(), u = M();
    for (const [a, r] of Object.entries(i.terminals))
      o[a] = [t.nodes[r].bit], u[a] = "input";
    e[i.name] = { type: i.type, port_directions: u, connections: o, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((a) => ({ pin: a.pin, label: a.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((a, r) => ({ pin: a, label: i.pinLabels?.[r] || a })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceLayoutDescription: t.layout?.description || null } } };
}
function Pt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, o = (s) => (n.has(s) || n.set(s, n.size + 2), n.get(s));
  Object.entries(t.modules.circuit.cells).forEach(([s, c], d) => {
    const h = "c" + d;
    e.set(h, s);
    const p = Object.fromEntries(Object.entries(c.connections).map(([E, R]) => [E, R.map(o)]));
    i[h] = { type: c.type, connections: p, port_directions: c.port_directions, attributes: { displayRef: c.attributes.displayRef || c.attributes.ref || "", value: c.attributes.value || "", name: c.attributes.name || "" } }, c.spiceBlock && (i[h].spiceBlock = c.spiceBlock), c.spiceSymbol && (i[h].spiceSymbol = c.spiceSymbol), c.spiceLayout && (i[h].spiceLayout = c.spiceLayout);
  });
  const u = new Map([...e].map(([s, c]) => [c, s])), a = t.modules.circuit.spiceLayoutDescription, r = a ? { ...a, groups: a.groups.map((s) => ({ ...s, members: s.members.map((c) => c.cell ? { ...c, cell: u.get(c.cell) } : c) })), relations: a.relations.map((s) => ({ ...s, a: u.get(s.a) || s.a, b: u.get(s.b) || s.b })) } : null;
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([s, c]) => [c, s])) };
}
const K = /* @__PURE__ */ new Map();
async function At(t, e) {
  const n = Pt(t), i = JSON.stringify([n.netlist, e]);
  let o = K.get(i);
  o ? (K.delete(i), K.set(i, o)) : (o = await kt(n.netlist, e), o.svg.length < 1e6 && (K.set(i, o), K.size > 20 && K.delete(K.keys().next().value)));
  const u = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const r of u.querySelectorAll("[id],[class]")) {
    const s = r.getAttribute("id");
    s?.startsWith("cell_") && n.ids.has(s.slice(5)) && r.setAttribute("id", "cell_" + n.ids.get(s.slice(5)));
    const c = r.getAttribute("class");
    c && r.setAttribute("class", c.split(/\s+/).map((d) => d.startsWith("cell_") && n.ids.has(d.slice(5)) ? "cell_" + n.ids.get(d.slice(5)) : /^net_\d+$/.test(d) && n.bits.has(Number(d.slice(4))) ? "net_" + n.bits.get(Number(d.slice(4))) : d).join(" "));
  }
  const a = o.drawing ? structuredClone(o.drawing) : null;
  if (a) {
    for (const r of a.components) {
      r.id = n.ids.get(r.id) || r.id;
      for (const s of r.ports) s.bit = n.bits.get(s.bit) ?? s.bit;
    }
    for (const r of a.segments) r.bit = n.bits.get(r.bit) ?? r.bit;
  }
  return { svg: new XMLSerializer().serializeToString(u.documentElement), drawing: a };
}
function kt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-D6B0shDp.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, o) => {
    const u = (s, c) => {
      clearTimeout(r), n.terminate(), s ? o(Error(s)) : i(c);
    }, a = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), a);
    n.onmessage = ({ data: s }) => u(s.error, { svg: s.svg, drawing: s.drawing }), n.onerror = (s) => u(s.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Tt = `* RLC low-pass filter
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
`, Ut = `* Voltage-divider biased common-emitter amplifier.
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
`, Dt = `* Common-collector voltage follower; independently chosen example values.
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
* Example component values; LM741_TL is a 20-BJT topology model, not a fitted device model.
* LM741_TL pin order: non-inverting, inverting, V+, V-, output, offset-null 1, offset-null 5.
.title Sallen-Key low-pass with transistor-level 741
VCC PWR_VCC 0 15
VEE RET_VEE 0 -15
VIN IN_SIG 0 AC 1 SIN(0 100m 100)
R1 IN_SIG N_FILTER 10k
R2 N_FILTER N_NONINV 10k
C1 N_FILTER OUT_SIG 10n
C2 N_NONINV 0 10n
XU1 N_NONINV OUT_SIG PWR_VCC RET_VEE OUT_SIG N_NULL_XU1_1 N_NULL_XU1_5 LM741_TL
RL OUT_SIG 0 100k
.ac dec 40 10 100k
.tran 20u 20m
* Self-contained transistor-level definition follows.
* 741-style transistor-level teaching circuit, transcribed from the TI LM741
* internal schematic supplied with the viewer discussion (datasheet section 7.2).
* https://www.ti.com/lit/ds/symlink/lm741.pdf
* Independent SPICE transcription; not the manufacturer's behavioral macromodel.
* Generic BJT parameters below illustrate topology; not a calibrated LM741 model.
* Interface order: IN+ (3), IN- (2), V+ (7), V- (4), OUT (6), NULL (1), NULL (5).
* The source diagram repeats Q15 and leaves the VBE multiplier unnumbered:
* Q16 denotes the gain input follower; Q18 denotes the VBE multiplier here.
.subckt LM741_TL IN_P IN_N PWR_VCC RET_VEE OUT_SIG IO_NULL1 IO_NULL5
* Local visual constraints apply only when this instance sheet is opened.
* @layout begin v1
* group SUPPLY row { PWR_VCC }
* group CORE row {
*   group INPUT row {
*     column { Q8 row { IN_P Q1 } Q3 Q7 Q5 R1 IO_NULL1 }
*     column { Q9 row { IN_N Q2 } Q4 Q6 R2 IO_NULL5 }
*     column { R3 }
*   }
*   group BIAS column { Q12 R5 Q11 Q10 R4 }
*   group GAIN row { column { Q18 Q16 Q17 R11 } column { R7 R8 R12 Q22 C1 } }
*   group OUTPUT row { column { Q13 Q14 R9 OUT_SIG R10 Q20 } column { Q15 } }
* }
* group RETURN row { RET_VEE }
* place SUPPLY above CORE
* place CORE above RETURN
* @layout end
* Differential input and active-load mirror.
Q1 N_INPUT_COL IN_P N_INPUT_EP Q741_N
Q2 N_INPUT_COL IN_N N_INPUT_EN Q741_N
Q3 N_MIRROR_LEFT N_PNP_BASE N_INPUT_EP Q741_P
Q4 N_GAIN_IN N_PNP_BASE N_INPUT_EN Q741_P
Q5 N_MIRROR_LEFT N_MIRROR_BASE IO_NULL1 Q741_N
Q6 N_GAIN_IN N_MIRROR_BASE IO_NULL5 Q741_N
Q7 PWR_VCC N_MIRROR_LEFT N_MIRROR_BASE Q741_N
Q8 N_INPUT_COL N_INPUT_COL PWR_VCC Q741_P
Q9 N_PNP_BASE N_INPUT_COL PWR_VCC Q741_P
R1 IO_NULL1 RET_VEE 1k
R2 IO_NULL5 RET_VEE 1k
R3 N_MIRROR_BASE RET_VEE 50k
* Self-biased current reference. No ideal current sources.
Q10 N_PNP_BASE N_BIAS_LOW N_BIAS_EMIT Q741_N
Q11 N_BIAS_LOW N_BIAS_LOW RET_VEE Q741_N
Q12 N_BIAS_HIGH N_BIAS_HIGH PWR_VCC Q741_P
Q13 N_DRIVE_HIGH N_BIAS_HIGH PWR_VCC Q741_P
R4 N_BIAS_EMIT RET_VEE 5k
R5 N_BIAS_HIGH N_BIAS_LOW 39k
* Darlington voltage-gain stage and Miller compensation.
Q16 N_DRIVE_LOW N_GAIN_IN N_GAIN_BASE Q741_N
Q17 N_DRIVE_LOW N_GAIN_BASE N_GAIN_EMIT Q741_N
Q18 N_DRIVE_HIGH N_CLASS_AB N_DRIVE_LOW Q741_N
R7 N_DRIVE_HIGH N_CLASS_AB 4.5k
R8 N_CLASS_AB N_DRIVE_LOW 7.5k
R11 N_GAIN_EMIT RET_VEE 50
R12 N_GAIN_BASE RET_VEE 50k
C1 N_GAIN_IN N_DRIVE_HIGH 30p
* Complementary emitter followers and protection transistors.
Q14 PWR_VCC N_DRIVE_HIGH N_OUTPUT_HIGH Q741_N
Q15 N_DRIVE_HIGH N_OUTPUT_HIGH OUT_SIG Q741_N
Q20 RET_VEE N_DRIVE_LOW N_OUTPUT_LOW Q741_P
Q22 N_GAIN_IN N_GAIN_EMIT RET_VEE Q741_N
R9 N_OUTPUT_HIGH OUT_SIG 25
R10 OUT_SIG N_OUTPUT_LOW 50
.ends LM741_TL
.model Q741_N NPN(IS=10f BF=200 BR=2 VAF=100 CJE=2p CJC=1p TF=350p)
.model Q741_P PNP(IS=10f BF=50 BR=4 VAF=50 CJE=1p CJC=2p TF=30n)

.end
`, Vt = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.
* Topology and resistor ratios: TI SBOA282A (Three Op Amp Instrumentation Amplifier).
* https://www.ti.com/lit/an/sboa282a/sboa282a.pdf
* Adaptation: 741-style transistor models replace the reference design's TLV171 devices.
* Rf=10k, Rg=2.21k; unity-gain difference stage. Ideal overall gain=10.05.
* Open XINA -> XINPUT / XDIFF -> XU1 / XU2 / XU3 to inspect each transistor-level IC circuit.
* LM741_TL pin order: non-inverting, inverting, V+, V-, output, offset-null 1, offset-null 5.
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
XU1 IN_P N_INV_P PWR_VCC RET_VEE OUT_P N_NULL_XU1_1 N_NULL_XU1_5 LM741_TL
XU2 IN_N N_INV_N PWR_VCC RET_VEE OUT_N N_NULL_XU2_1 N_NULL_XU2_5 LM741_TL
RF1 OUT_P N_INV_P 10k
RF2 OUT_N N_INV_N 10k
RG N_INV_P N_INV_N 2.21k
.ends INPUT_PAIR

.subckt DIFFERENCE IN_P IN_N OUT_SIG PWR_VCC RET_VEE
R1 IN_N N_INV 10k
R2 OUT_SIG N_INV 10k
R3 IN_P N_NONINV 10k
R4 N_NONINV 0 10k
XU3 N_NONINV N_INV PWR_VCC RET_VEE OUT_SIG N_NULL_XU3_1 N_NULL_XU3_5 LM741_TL
.ends DIFFERENCE

.ac dec 40 1 100k
.tran 20u 40m
* Self-contained transistor-level definition follows.
* 741-style transistor-level teaching circuit, transcribed from the TI LM741
* internal schematic supplied with the viewer discussion (datasheet section 7.2).
* https://www.ti.com/lit/ds/symlink/lm741.pdf
* Independent SPICE transcription; not the manufacturer's behavioral macromodel.
* Generic BJT parameters below illustrate topology; not a calibrated LM741 model.
* Interface order: IN+ (3), IN- (2), V+ (7), V- (4), OUT (6), NULL (1), NULL (5).
* The source diagram repeats Q15 and leaves the VBE multiplier unnumbered:
* Q16 denotes the gain input follower; Q18 denotes the VBE multiplier here.
.subckt LM741_TL IN_P IN_N PWR_VCC RET_VEE OUT_SIG IO_NULL1 IO_NULL5
* Local visual constraints apply only when this instance sheet is opened.
* @layout begin v1
* group SUPPLY row { PWR_VCC }
* group CORE row {
*   group INPUT row {
*     column { Q8 row { IN_P Q1 } Q3 Q7 Q5 R1 IO_NULL1 }
*     column { Q9 row { IN_N Q2 } Q4 Q6 R2 IO_NULL5 }
*     column { R3 }
*   }
*   group BIAS column { Q12 R5 Q11 Q10 R4 }
*   group GAIN row { column { Q18 Q16 Q17 R11 } column { R7 R8 R12 Q22 C1 } }
*   group OUTPUT row { column { Q13 Q14 R9 OUT_SIG R10 Q20 } column { Q15 } }
* }
* group RETURN row { RET_VEE }
* place SUPPLY above CORE
* place CORE above RETURN
* @layout end
* Differential input and active-load mirror.
Q1 N_INPUT_COL IN_P N_INPUT_EP Q741_N
Q2 N_INPUT_COL IN_N N_INPUT_EN Q741_N
Q3 N_MIRROR_LEFT N_PNP_BASE N_INPUT_EP Q741_P
Q4 N_GAIN_IN N_PNP_BASE N_INPUT_EN Q741_P
Q5 N_MIRROR_LEFT N_MIRROR_BASE IO_NULL1 Q741_N
Q6 N_GAIN_IN N_MIRROR_BASE IO_NULL5 Q741_N
Q7 PWR_VCC N_MIRROR_LEFT N_MIRROR_BASE Q741_N
Q8 N_INPUT_COL N_INPUT_COL PWR_VCC Q741_P
Q9 N_PNP_BASE N_INPUT_COL PWR_VCC Q741_P
R1 IO_NULL1 RET_VEE 1k
R2 IO_NULL5 RET_VEE 1k
R3 N_MIRROR_BASE RET_VEE 50k
* Self-biased current reference. No ideal current sources.
Q10 N_PNP_BASE N_BIAS_LOW N_BIAS_EMIT Q741_N
Q11 N_BIAS_LOW N_BIAS_LOW RET_VEE Q741_N
Q12 N_BIAS_HIGH N_BIAS_HIGH PWR_VCC Q741_P
Q13 N_DRIVE_HIGH N_BIAS_HIGH PWR_VCC Q741_P
R4 N_BIAS_EMIT RET_VEE 5k
R5 N_BIAS_HIGH N_BIAS_LOW 39k
* Darlington voltage-gain stage and Miller compensation.
Q16 N_DRIVE_LOW N_GAIN_IN N_GAIN_BASE Q741_N
Q17 N_DRIVE_LOW N_GAIN_BASE N_GAIN_EMIT Q741_N
Q18 N_DRIVE_HIGH N_CLASS_AB N_DRIVE_LOW Q741_N
R7 N_DRIVE_HIGH N_CLASS_AB 4.5k
R8 N_CLASS_AB N_DRIVE_LOW 7.5k
R11 N_GAIN_EMIT RET_VEE 50
R12 N_GAIN_BASE RET_VEE 50k
C1 N_GAIN_IN N_DRIVE_HIGH 30p
* Complementary emitter followers and protection transistors.
Q14 PWR_VCC N_DRIVE_HIGH N_OUTPUT_HIGH Q741_N
Q15 N_DRIVE_HIGH N_OUTPUT_HIGH OUT_SIG Q741_N
Q20 RET_VEE N_DRIVE_LOW N_OUTPUT_LOW Q741_P
Q22 N_GAIN_IN N_GAIN_EMIT RET_VEE Q741_N
R9 N_OUTPUT_HIGH OUT_SIG 25
R10 OUT_SIG N_OUTPUT_LOW 50
.ends LM741_TL
.model Q741_N NPN(IS=10f BF=200 BR=2 VAF=100 CJE=2p CJC=1p TF=350p)
.model Q741_P PNP(IS=10f BF=50 BR=4 VAF=50 CJE=1p CJC=2p TF=30n)

.end
`, de = {
  filter: { source: Tt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Ut, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Dt, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Mt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Vt, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Qt(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function ke(t) {
  return Qt(await t.arrayBuffer());
}
const Te = de.filter.source, x = (t) => document.getElementById("spice-" + t), se = x("app");
if (se) {
  let N = function(_) {
    const I = x("example-info");
    if (I && (I.replaceChildren(), !!_ && (I.append(document.createTextNode(_.description + " ")), _.url))) {
      const L = document.createElement("a");
      L.href = _.url, L.target = "_blank", L.rel = "noopener noreferrer", L.textContent = _.reference, I.append(L);
    }
  }, P = function() {
    o = null, u = null, r = "", y(), N(Object.values(de).find((_) => _.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, k = function(_) {
    i.replaceChildren();
    for (const { severity: I, line: L, message: A, source: v } of _) {
      const D = document.createElement("li");
      D.className = I, D.textContent = `${I.toUpperCase()}${v && v !== "input.cir" ? " · " + v : ""}${L ? " · line " + L : ""}: ${A}`, i.append(D);
    }
    x("messages").open = _.some((I) => I.severity !== "info"), x("message-count").textContent = `${_.length} message${_.length === 1 ? "" : "s"}`;
  }, U = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${O.x} ${O.y} ${O.w} ${O.h}`), x("zoom-level").textContent = Math.round(g.w / O.w * 100) + "%";
  }, T = function(_, I = O.x + O.w / 2, L = O.y + O.h / 2) {
    if (!e.querySelector("svg")) return;
    const A = Math.max(0.05, Math.min(10, O.w * _ / g.w)) * g.w / O.w;
    O = { x: I + (O.x - I) * A, y: L + (O.y - L) * A, w: O.w * A, h: O.h * A }, U();
  }, oe = function(_) {
    const I = new URLSearchParams();
    _ && I.set("instance", _);
    const L = I.toString();
    location.hash.slice(1) === L ? (p = _, Q()) : location.hash = L;
  }, H = function() {
    p = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, le = function(_) {
    const I = c.contexts[_].path;
    for (let L = 1; L <= I.length; L++) l.add(I.slice(0, L).map(encodeURIComponent).join("/"));
  }, _e = function() {
    const _ = !!(E && E !== p && c?.contexts[E]);
    x("selection-actions").hidden = !_, x("toggle-instance").textContent = l.has(E) ? "Collapse instance" : "Expand instance", x("toggle-instance").disabled = !1, x("open-instance").href = "#" + new URLSearchParams({ instance: E });
  }, we = function() {
    x("breadcrumbs").replaceChildren();
    const _ = (L, A) => {
      const v = document.createElement("button");
      v.type = "button", v.textContent = L, v.onclick = () => oe(A), v.disabled = A === p, x("breadcrumbs").append(v);
    };
    if (_("Top", ""), p) {
      const L = c.contexts[p].path;
      for (let A = 0; A < L.length; A++) _(L[A], L.slice(0, A + 1).map(encodeURIComponent).join("/"));
    }
    x("instances").replaceChildren();
    const I = (L, A) => {
      for (const v of L.children) {
        const D = document.createElement("div");
        D.className = "spice-instance-row", D.style.setProperty("--depth", Math.min(A, 8)), D.dataset.instance = v.id;
        const $ = document.createElement("button");
        $.type = "button", $.textContent = l.has(v.id) ? "−" : "+", $.title = (l.has(v.id) ? "Collapse " : "Expand ") + v.id, $.setAttribute("aria-label", $.title), $.setAttribute("aria-expanded", String(l.has(v.id))), $.onclick = () => {
          l.has(v.id) ? l.delete(v.id) : le(v.id), E = v.id, Q();
        };
        const Z = document.createElement("a");
        Z.href = "#" + new URLSearchParams({ instance: v.id }), Z.textContent = v.name + " · " + v.definition, Z.title = "Open " + v.id + " as its own sheet";
        const q = document.createElement("span");
        if (q.className = "spice-help", q.textContent = Object.entries(v.params).map(([z, J]) => z + "=" + J).join(" · "), D.append($, Z), q.textContent) {
          const z = document.createElement("details"), J = document.createElement("summary");
          J.textContent = "Parameters", z.append(J, q), D.append(z);
        }
        x("instances").append(D), I(v, A + 1);
      }
    };
    I(c.contexts[p], 0), x("hierarchy-panel").hidden = !c.contexts[p].children.length, x("focus-title").textContent = p ? p + " / " + c.contexts[p].definition : "Top-level schematic", _e();
  };
  const t = x("input"), e = x("preview"), n = x("status"), i = x("diagnostics");
  let o = null, u = null, a = !1, r = "", s, c, d, h = "", p = "", E = "", R = !1, O = { x: 0, y: 0, w: 1, h: 1 }, g = { ...O }, m;
  const l = /* @__PURE__ */ new Set();
  let w = !1, b = {};
  try {
    b = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  se.addEventListener("click", (_) => {
    R && _.target.closest('a[href^="#"]') && _.preventDefault();
  });
  const y = () => {
    x("copy").disabled = x("download").disabled = !r || R, x("download-asc").disabled = x("download-asc-bundle").disabled = !r || !o || R || a;
  }, C = () => ({ font: x("font").value, fontSize: Number(x("size").value), color: x("color").value, detailed: x("detailed").checked, conventional: x("conventional").checked });
  t.value = Te;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Te;
  } catch {
  }
  N(Object.values(de).find((_) => _.source === t.value)), t.addEventListener("input", P);
  for (const _ of ["font", "size", "color", "detailed", "conventional"]) x(_).addEventListener("input", P);
  x("zoom-in").onclick = () => T(0.8), x("zoom-out").onclick = () => T(1.25), x("fit").onclick = () => {
    O = { ...g }, U();
  };
  const X = (_) => {
    const I = e.querySelector("svg");
    return I ? new DOMPoint(_.clientX, _.clientY).matrixTransform(I.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (_) => {
    const I = X(_);
    I && (_.preventDefault(), T(_.deltaY > 0 ? 1.12 : 1 / 1.12, I.x, I.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (_) => {
    _.button !== 0 || !e.querySelector("svg") || (m = { start: X(_), x: _.clientX, y: _.clientY, view: { ...O }, moved: !1 }, e.setPointerCapture(_.pointerId));
  }), e.addEventListener("pointermove", (_) => {
    if (!m) return;
    const I = X(_);
    Math.hypot(_.clientX - m.x, _.clientY - m.y) > 4 && (m.moved = !0), O.x += m.start.x - I.x, O.y += m.start.y - I.y, U();
  }), e.addEventListener("pointerup", (_) => {
    if (!m) return;
    const I = m.moved;
    if (m = null, e.hasPointerCapture(_.pointerId) && e.releasePointerCapture(_.pointerId), !I) {
      const L = document.elementFromPoint(_.clientX, _.clientY)?.closest("[data-component]"), A = s?.components.find((v) => v.name === L?.dataset.component);
      A && (E = A.instanceId || "", x("selection").textContent = `${A.raw}
${Object.entries(A.terminals).map(([v, D]) => `${v} → ${D}`).join("   ")}`, A.kind === "X" ? (le(A.instanceId), Q()) : _e());
    }
  }), window.addEventListener("hashchange", () => {
    if (R) {
      w = !0;
      return;
    }
    H(), E = "", Q();
  }), x("collapse-all").onclick = () => {
    l.clear(), Q();
  }, x("expand-all").onclick = () => {
    for (const _ of Object.keys(c?.contexts || {})) _ && l.add(_);
    Q();
  }, x("toggle-instance").onclick = () => {
    l.has(E) ? l.delete(E) : le(E), Q();
  }, e.addEventListener("pointercancel", () => {
    m = null;
  }), e.addEventListener("keydown", (_) => {
    const I = _.target.closest("[data-instance]");
    if (I && (_.key === "Enter" || _.key === " ")) {
      _.preventDefault(), E = I.dataset.instance, le(E), Q();
      return;
    }
    _.key === "+" || _.key === "=" ? T(0.8) : _.key === "-" ? T(1.25) : _.key.toLowerCase() === "f" ? (O = { ...g }, U()) : _.key.startsWith("Arrow") && (_.preventDefault(), O.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[_.key] || 0) * O.w, O.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[_.key] || 0) * O.h, U());
  });
  async function Q() {
    if (R) return;
    R = !0, o = null, u = null, r = "", y(), x("generate").disabled = !0, t.readOnly = !0, x("file").disabled = !0, x("libraries").disabled = !0;
    for (const I of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) I.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let _ = [];
    try {
      if (h !== t.value || !c) {
        if (d = lt(t.value, { files: b }), _ = [...d.diagnostics], _.some((S) => S.severity === "error"))
          throw c = null, Error("Fix the parser errors below before generating.");
        c = Ct(d), h && h !== t.value ? (l.clear(), p = "", E = "", history.replaceState(null, "", location.pathname + location.search)) : H(), h = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (_ = [...d.diagnostics], k(_), _.some((S) => S.severity === "error")) throw Error("Fix the parser errors below before generating.");
      s = vt(c, { expanded: l, focus: p });
      const I = Lt(s);
      C().conventional && _.push(...s.layout.diagnostics);
      const L = await At(I, C()), A = new DOMParser().parseFromString(L.svg, "image/svg+xml");
      if (A.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const v = A.documentElement, D = v.querySelector("#spice-layout-report");
      if (D) {
        s.layout.report = JSON.parse(D.textContent);
        const S = s.layout.report;
        _.push({ severity: "info", message: `Layout: compact signal flow; ${S.powerSourcesChecked} DC/ground symbols checked, ${S.powerOrderViolations} DC order preference(s) unmet. ${S.powerPass}. ${S.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), S.classicTemplateFallback && _.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), S.groundPlacement && _.push({ severity: "info", message: `Ground: ${S.groundPlacement}; ${S.straightenedGroundDrops || 0} return-path simplification(s).` }), S.explicitGroups && _.push({ severity: "info", message: `Layout comments: ${S.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), S.classicRails && _.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${S.railCount} shared voltage rails.` }), S.localClassicInstances?.length && _.push({ severity: "info", message: `${S.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), S.geometricConnectivityVerified && _.push({ severity: "info", message: `Net geometry verified; ${S.cyclesRemoved} same-net loop(s) and ${S.leavesRemoved} unused wire branch(es) removed.` }), k(_);
      }
      if (v.localName !== "svg" || v.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const $ = Number(v.getAttribute("width")), Z = Number(v.getAttribute("height"));
      g = { x: -20, y: -20, w: $ + 40, h: Z + 40 }, O = { ...g }, v.setAttribute("viewBox", `${g.x} ${g.y} ${g.w} ${g.h}`), v.setAttribute("width", String(g.w)), v.setAttribute("height", String(g.h)), v.setAttribute("role", "img"), v.setAttribute("aria-label", s.title || "SPICE schematic"), v.setAttribute("style", "background:white");
      for (const S of s.components) {
        const V = A.getElementById("cell_" + S.name);
        if (!V) throw Error("Renderer omitted component " + S.name);
        V.setAttribute("data-component", S.name), S.kind === "X" && (V.setAttribute("data-instance", S.instanceId), V.setAttribute("role", "button"), V.setAttribute("tabindex", "0"), V.setAttribute("aria-label", "Expand " + S.name));
        const W = A.createElementNS(v.namespaceURI, "title");
        W.textContent = S.raw + `
Resolved: ` + S.value + `
` + Object.entries(S.terminals).map(([G, ie]) => G + ": " + ie).join(", "), V.prepend(W);
      }
      for (const S of Object.values(s.nodes))
        for (const V of v.querySelectorAll(".net_" + S.bit)) {
          V.setAttribute("data-net", S.name);
          const W = A.createElementNS(v.namespaceURI, "title");
          W.textContent = "Node " + S.displayName, V.append(W);
        }
      const q = s.components.filter((S) => S.kind === "K").map((S) => ({ name: S.name, inductors: S.coupledInductors, value: S.value }));
      if (q.length) {
        const S = A.createElementNS(v.namespaceURI, "metadata");
        S.setAttribute("id", "spice-magnetic-couplings"), S.textContent = JSON.stringify(q), v.append(S);
        for (const V of q) for (const W of V.inductors) {
          const G = A.getElementById("cell_" + W);
          if (!G) continue;
          const ie = A.createElementNS(v.namespaceURI, "circle"), he = [...G.children].find((me) => me.getAttribute("s:pid") === "A"), Ve = he?.getAttribute("s:position"), ye = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Ve] || [0, 0];
          for (const [me, Qe] of Object.entries({ cx: Number(he?.getAttribute("s:x")) + ye[0], cy: Number(he?.getAttribute("s:y")) + ye[1], r: 3, fill: C().color, stroke: "none", "data-coupling": V.name })) ie.setAttribute(me, String(Qe));
          const Ce = A.createElementNS(v.namespaceURI, "title");
          Ce.textContent = V.name + " · dotted terminal: " + V.inductors.join(", "), ie.append(Ce), G.append(ie);
        }
      }
      o = L.drawing, r = new XMLSerializer().serializeToString(v), x("source").value = r, e.replaceChildren(document.importNode(v, !0)), U();
      const z = _.filter((S) => S.severity === "warning").length;
      n.textContent = `${s.components.filter((S) => !S.synthetic).length} components · ${Object.keys(s.nodes).length} nodes · ${s.topology.leafCount} primitive devices verified${z ? " · Review " + z + " warning(s); drawing may be partial." : " · Schematic ready."}`, s.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${s.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), s.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const J = Object.values(s.nodes).map((S) => {
        const V = document.createElement("tr");
        for (const W of [S.displayName, S.terminals.map((G) => G.component + "." + G.pin).join(", ")]) {
          const G = document.createElement("td");
          G.textContent = W, V.append(G);
        }
        return V;
      });
      x("nets").replaceChildren(...J), x("json").value = JSON.stringify({ circuit: s, netlist: I, hierarchy: d }, null, 2), x("selection").textContent = "Click a component to inspect its original statement and pin connections.", we();
    } catch (I) {
      if (e.replaceChildren(), r = "", x("source").value = "", x("json").value = "", x("nets").replaceChildren(), x("selection").textContent = "", n.textContent = I.message, !c)
        x("hierarchy-panel").hidden = !0, x("selection-actions").hidden = !0, x("breadcrumbs").replaceChildren();
      else if (!c.contexts[p]) {
        const L = document.createElement("button");
        L.type = "button", L.textContent = "Return to Top", L.onclick = () => oe(""), x("breadcrumbs").replaceChildren(L);
      }
      I.diagnostics && (_ = I.diagnostics), _.some((L) => L.severity === "error") || _.push({ severity: "error", line: 0, message: I.message }), k(_);
    } finally {
      R = !1, x("generate").disabled = !1, t.readOnly = !1, x("file").disabled = !1, x("libraries").disabled = !1;
      for (const I of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) I.disabled = !1;
      c && c.contexts[p] && we(), e.setAttribute("aria-busy", "false"), y(), w && (w = !1, H(), queueMicrotask(Q));
    }
  }
  x("generate").onclick = Q;
  for (const _ of se.querySelectorAll("[data-example]")) _.onclick = () => {
    const I = de[_.dataset.example];
    t.value = I.source, P(), N(I), Q();
  };
  x("file").onchange = async (_) => {
    const I = _.target.files[0];
    if (I) {
      if (I.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await ke(I), P(), Q();
      } catch (L) {
        n.textContent = "File could not be read: " + L.message;
      } finally {
        _.target.value = "";
      }
    }
  }, x("libraries").onchange = async (_) => {
    try {
      for (const I of _.target.files) {
        if (I.size > 16e6) throw Error("Library exceeds 16 MB: " + I.name);
        b[I.webkitRelativePath || I.name] = await ke(I);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(b));
      } catch {
      }
      c = null, h = "", x("library-status").textContent = Object.keys(b).length + " library file(s) loaded", Q();
    } catch (I) {
      n.textContent = I.message;
    } finally {
      _.target.value = "";
    }
  }, x("library-status").textContent = Object.keys(b).length ? "Libraries restored from this session." : "For .include / .lib dependencies", x("download").onclick = () => {
    const _ = URL.createObjectURL(new Blob([r], { type: "image/svg+xml;charset=utf-8" })), I = document.createElement("a");
    I.href = _, I.download = "spice-schematic.svg", I.click(), setTimeout(() => URL.revokeObjectURL(_), 1e3);
  };
  async function Ne(_) {
    const I = o;
    if (!(!I || R || a)) {
      a = !0, y(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: L } = await import("./asc-export-BNfkiGxk.js");
        if (o !== I) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= L({ tree: c, circuit: s, drawing: I, source: t.value, libraries: b });
        const A = _ ? u.zip : u.ascBytes, v = URL.createObjectURL(new Blob([A], { type: _ ? "application/zip" : "application/octet-stream" })), D = document.createElement("a");
        D.href = v, D.download = _ ? "spice-schematic-asc.zip" : "spice-schematic.asc", D.click(), setTimeout(() => URL.revokeObjectURL(v), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (_ ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (L) {
        n.textContent = "ASC export failed: " + L.message;
        const A = document.createElement("li");
        A.className = "error", A.textContent = n.textContent, i.append(A);
      } finally {
        a = !1, y();
      }
    }
  }
  x("download-asc").onclick = () => Ne(!1), x("download-asc-bundle").onclick = () => Ne(!0), x("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(r), n.textContent = "SVG source copied to clipboard.";
    } catch {
      x("source-details").open = !0, x("source").focus(), x("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, Q();
}
export {
  Se as b,
  ce as l,
  be as n,
  ft as p
};
