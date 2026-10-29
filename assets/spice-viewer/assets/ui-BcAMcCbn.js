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
}, et = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ee = (n) => n.toLowerCase(), Ie = (n) => n === void 0 || n.includes("=") || /^(?:off|on)$/i.test(n), tt = (n) => n.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function nt(n, e) {
  const t = (E) => e[ee(E || "")] || Object.entries(e).find(([g]) => g.startsWith(ee(E || "") + "."))?.[1], o = n[0][0].toUpperCase();
  let i = [], l = [], c = "", s = "", r = [], a = [], h = 0, f = "", d = "", p = "", O = !0;
  if ("RLC".includes(o))
    i = ["A", "B"], s = ee(o) + "_v";
  else if ("DVIB".includes(o))
    i = ["+", "-"], s = o === "D" ? "d_v" : o === "B" ? "spice_b" : ee(o);
  else if (o === "Q") {
    i = ["C", "B", "E"], !t(n[4]) && (t(n[5]) || !Ie(n[5]) && !/^[+\-\d.{'"]/.test(n[5])) && i.push("S"), c = n[i.length + 1] || "";
    const E = t(c)?.type;
    O = ["NPN", "PNP"].includes(E), s = O ? (i.length === 3 ? "q_" : "spice_q4_") + ee(E) : "spice_q" + i.length;
  } else if (o === "M") {
    const E = t(n[4]), g = t(n[5]), u = E?.type === "VDMOS" || !g && (!n[5] || Ie(n[5]));
    i = u ? ["D", "G", "S"] : ["D", "G", "S", "B"], c = n[i.length + 1] || "";
    const w = t(c), N = w?.type;
    if (u && w && N !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!u && N === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    O = ["NMOS", "PMOS", "VDMOS"].includes(N);
    let y = null, b = w;
    const C = /* @__PURE__ */ new Set();
    for (; b && !C.has(b.name) && (C.add(b.name), y = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(b.raw), !y); )
      b = t(b.baseModel);
    const P = N === "PMOS" || N === "VDMOS" && y && (y[1] === void 0 || Number(y[1]) >= 0.5);
    s = O ? "spice_" + (P ? "pmos" : "nmos") + (u ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    c = n[4] || "";
    const E = t(c)?.type, g = o === "Z" && ["NIGBT", "PIGBT"].includes(E);
    i = g ? ["C", "G", "E"] : ["D", "G", "S"], O = o === "J" ? ["NJF", "PJF"].includes(E) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(E), s = "spice_" + (g ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(E || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    i = ["+", "-"], s = "spice_" + ee(o);
    let E = 3, g = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(n[E] || "");
    if (/^poly$/i.test(n[E] || "") && (g = /^\(\s*(\d+)\s*\)$/.exec(n[++E] || ""), !g))
      throw Error("POLY requires a dimension.");
    if (g) {
      const u = Number(g[1]);
      if (u > 128) throw Error("POLY supports at most 128 controlling variables.");
      let w = E + 1, N = [];
      const y = "EG".includes(o), b = u * (y ? 2 : 1);
      for (; N.length < b && w < n.length; ) N.push(...tt(n[w++]));
      if (N.length !== b || w >= n.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (y) {
        for (let C = 0; C < u; C++) i.push("C" + (C + 1) + "+", "C" + (C + 1) + "-");
        l = [n[1], n[2], ...N];
      } else r = N;
      h = w, f = "POLY(" + u + ") " + (y ? "" : N.join(" ") + " "), d = "POLY", y && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(n[3] || "") || n[3]?.startsWith("{") ? d = "BEHAVIORAL" : "EG".includes(o) ? (i.push("C+", "C-"), d = /\blaplace\s*=/i.test(n.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(n.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (r = [n[3]], h = 4, f = n[3] + " ");
    p = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (d ? " · " + d : "");
  } else if (o === "S")
    i = ["A", "B", "C+", "C-"], c = n[5] || "", s = "spice_device", p = "Voltage switch";
  else if (o === "W")
    i = ["A", "B"], r = [n[3]], c = n[4] || "", h = 3, s = "spice_device", p = "Current switch";
  else if ("TO".includes(o))
    i = ["L+", "L-", "R+", "R-"], o === "O" && (c = n[5] || ""), s = "spice_device", p = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    i = ["N1", "N2", "COM"], c = n[4] || "", s = "spice_device", p = "Distributed RC";
  else if (o === "A")
    i = Array.from({ length: 8 }, (E, g) => "P" + (g + 1)), s = "spice_device", p = n[9] || "A function";
  else if (o === "K") {
    if (n.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = n.slice(1, -1), a.some((E) => !/^L/i.test(E.split(":").at(-1)))) throw Error("K references must name inductors.");
    h = n.length - 1, s = "spice_coupling", p = "Magnetic coupling", f = a.join(" ") + " · k=";
  } else if (o === "@")
    i = ["IN", "OUT"], s = "spice_device", p = "FRA";
  else if (o === "&")
    i = ["O+", "O-", "I+", "I-"], s = "spice_device", p = "FRA probe";
  else if (o === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", p = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (h || (h = i.length + 1), l.length || (l = n.slice(1, i.length + 1)), l.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (n.length <= h && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (l.some((E) => /[=()]/.test(E) && !/^\{[\s\S]*\}$/.test(E))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(n.slice(h).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(n.slice(h).join(" ")) && (s = "spice_br"), o === "D" && (c = n[3] || ""), o === "@") {
    const E = n.slice(h).join(" ");
    for (const g of E.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(g[1].toUpperCase()), l.push(g[2]);
  }
  if (o === "A" && !n[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (r.some((E) => !E)) throw Error("Missing controlling voltage source.");
  const I = i.map((E, g) => o === "A" && Je[(n[9] || "").toUpperCase()]?.[String(g + 1)] || E);
  return { kind: o, pins: i, nodeTokens: l, pinLabels: I, model: c, type: s, controlSource: r[0] || "", controlSources: r, coupledInductors: a, value: f + n.slice(h).join(" "), sourceMode: d, symbol: p, polarityKnown: O };
}
const rt = et, ot = new Set(rt.split(" ")), ge = () => /* @__PURE__ */ Object.create(null), F = (n) => n.toLowerCase();
function pe(n) {
  const e = [], t = [];
  let o = "", i = 0, l = "";
  for (let c = 0; c < n.length; c++) {
    const s = n[c];
    if (l) {
      o += s, s === l && n[c - 1] !== "\\" && (l = "");
      continue;
    }
    if (s === '"' || s === "'") {
      l = s, o += s;
      continue;
    }
    if (!i && (s === ";" || s === "$" && (!c || /\s/.test(n[c - 1])))) break;
    if ("({".includes(s) && (t.push(s), i++), ")}".includes(s) && (i--, t.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !i ? (o && e.push(o), o = "") : o += s;
  }
  if (i || l) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function it(n, e = {}) {
  const t = [], o = [], i = [], l = Object.assign(ge(), e.models), c = ge(), s = (g, u, w) => t.push({ severity: g, line: u, message: w });
  if (typeof n != "string") throw TypeError("Netlist must be a string.");
  if (n.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const r = [];
  n.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((g, u) => {
    const w = g.trim();
    !w || w.startsWith("*") || (w.startsWith("+") ? r.length ? r.at(-1).text += " " + w.slice(1).trim() : s("error", u + 1, "Continuation has no preceding statement.") : r.push({ line: u + 1, text: w }));
  });
  for (const g of r) {
    try {
      g.tokens = pe(g.text);
    } catch (w) {
      s("error", g.line, w.message), g.tokens = [];
    }
    const u = g.tokens;
    if (/^\.model$/i.test(u[0] || ""))
      if (u.length < 3) s("error", g.line, ".model requires a name and device type.");
      else {
        const w = /^ako:(.+)$/i.exec(u[2]), N = w && u[3] && !u[3].startsWith("(") ? u[3].split("(")[0].toUpperCase() : "";
        l[F(u[1])] = { name: u[1], type: w ? N : u[2].split("(")[0].toUpperCase(), baseModel: w?.[1] || "", raw: g.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function h(g) {
    const u = l[F(g)];
    if (!u) return "";
    if (u.type) return u.type;
    if (a.has(F(g))) throw Error("Circular AKO model inheritance: " + g);
    return a.add(F(g)), u.type = h(u.baseModel), a.delete(F(g)), u.type;
  }
  for (const g of Object.values(l)) if (g.baseModel && !g.type)
    try {
      h(g.name);
    } catch (u) {
      s("error", 0, u.message);
    }
  let f = "", d = 0, p = !1, O = !1;
  const I = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: g, text: u, tokens: w } of r) {
    if (!w.length) continue;
    const N = F(w[0]);
    if (O) {
      s("warning", g, "Statement after .end is not rendered: " + u);
      continue;
    }
    if (N === ".control") {
      p = !0, s("warning", g, ".control script retained but not executed or rendered.");
      continue;
    }
    if (N === ".endc") {
      p = !1;
      continue;
    }
    if (p) continue;
    if (N === ".subckt") {
      d++, s("error", g, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (N === ".ends") {
      d ? d-- : s("error", g, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (N === ".end") {
      O = !0;
      continue;
    }
    if (N.startsWith(".")) {
      o.push({ line: g, text: u }), N === ".title" ? f = w.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(N) ? s("error", g, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(N) ? s("error", g, "Topology-changing directive is unsupported: " + u) : E.has(N) || s("warning", g, "Directive retained but not resolved: " + u);
      continue;
    }
    const y = w[0][0].toUpperCase();
    if (!ot.has(y)) {
      g === 1 && !/\d/.test(w[0]) && w.length > 1 && y !== "X" ? (f = u, s("warning", g, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", g, `Unsupported ${y} device was not rendered: ${u}`);
      continue;
    }
    const b = y === "M" || y === "Q" ? 5 : 4;
    if (g === 1 && !/\d/.test(w[0]) && (w.length < b || y === "T" && !/\b(?:zo|z0)\s*=/i.test(u))) {
      f = u, s("info", g, "SPICE title: " + u);
      continue;
    }
    try {
      if (I.has(N)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const C = nt(w, l), { pins: P, nodeTokens: A, ...M } = C;
      C.polarityKnown || s("warning", g, `${w[0]}: model polarity unknown; explicit ${P.join("/")} terminals retained.`);
      const T = ge();
      P.forEach((X, oe) => {
        const H = F(A[oe]);
        c[H] || (c[H] = { name: H, displayName: w[oe + 1], bit: Object.keys(c).length + 2, terminals: [] }), c[H].terminals.push({ component: w[0], pin: X }), T[X] = H;
      }), i.push({ ...M, name: w[0], terminals: T, line: g, raw: u }), I.add(N);
    } catch (C) {
      s("error", g, `${w[0]}: ${C.message} Statement: ${u}`);
    }
  }
  d && s("error", 0, "Unclosed .subckt definition."), p && s("error", 0, "Unclosed .control block."), i.length || s("error", 0, "No supported components to render."), i.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const g of i) {
    for (const u of g.controlSources || []) !u.includes(":") && !i.some((w) => F(w.name) === F(u) && w.kind === "V") && s("error", g.line, `${g.name}: controlling voltage source ${u} was not found.`);
    for (const u of g.coupledInductors || []) !u.includes(":") && !i.some((w) => F(w.name) === F(u) && w.kind === "L") && s("error", g.line, `${g.name}: coupled inductor ${u} was not found.`);
    (g.kind === "B" || g.type === "spice_b") && s("info", g.line, `${g.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: f, components: i, nodes: c, models: l, directives: o, diagnostics: t };
}
const Y = (n) => n.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Oe = (n) => Y(n).split("/").at(-1);
function st(n, { files: e = {}, filename: t = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), i = [], l = [], c = [];
  let s = 0;
  const r = (h, f) => {
    const d = Y(f).split("/").slice(0, -1).concat(Y(h)).join("/"), p = [...o].filter(([I]) => Y(I) === Y(h) || Y(I) === d);
    if (p.length === 1) return p[0];
    const O = [...o].filter(([I]) => Oe(I) === Oe(h));
    if (O.length !== 1) throw Error(O.length ? "Ambiguous library filename: " + h : "Missing library " + h + ". Add this file using Library files.");
    return O[0];
  };
  function a(h, f, d = "", p = []) {
    const O = Y(f) + ":" + d.toLowerCase();
    if (p.includes(O)) throw Error("Circular library include: " + [...p, O].join(" → "));
    if (p.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const I = [], E = /^\s*\.endl\b/im.test(h);
    let g = !d;
    const u = (N, y) => {
      if (s += N.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      c.push(N), l.push({ file: f, line: y + 1 });
    };
    if (h.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((N, y) => {
      const b = N.trim();
      if (/^\.lib\b/i.test(b) && E) {
        const C = pe(b);
        if (C.length === 2 && !/[.\\/]/.test(C[1])) {
          I.push(C[1].toLowerCase()), C[1].toLowerCase() === d.toLowerCase() && (g = !0), u("* Library section " + C[1], y);
          return;
        }
      }
      if (/^\.endl\b/i.test(b)) {
        I.pop(), u("* End library section", y);
        return;
      }
      if (d && I.length && !I.includes(d.toLowerCase())) {
        u("* Unselected library section", y);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(b))
        try {
          const C = pe(b);
          if (!C[1]) throw Error("Include requires a filename.");
          const [P, A] = r(C[1], f);
          u("* Included " + P, y), a(A, P, C[2] || "", [...p, O]);
        } catch (C) {
          i.push({ severity: "error", line: y + 1, source: f, message: C.message }), u("* Unresolved include", y);
        }
      else u(N, y);
    }), !g) throw Error("Library section " + d + " not found in " + f);
  }
  try {
    a(n, t);
  } catch (h) {
    i.push({ severity: "error", line: 0, source: t, message: h.message });
  }
  return { source: c.join(`
`), origins: l, diagnostics: i };
}
function at(n) {
  const e = [], t = /* @__PURE__ */ new Map(), o = [0], i = [];
  n.split(/\r?\n/).forEach((s, r) => {
    const a = s.trim();
    /^\.subckt\b/i.test(a) && (o.push(r + 1), t.set(r + 1, [])), o.at(-1) ? t.get(o.at(-1)).push({ raw: s, line: r + 1 }) : e[r] = s, /^\.ends\b/i.test(a) && o.length > 1 && o.pop();
  });
  const l = xe(Array.from({ length: n.split(/\r?\n/).length }, (s, r) => e[r] || "").join(`
`));
  i.push(...l.diagnostics);
  const c = /* @__PURE__ */ new Map();
  for (const [s, r] of t) {
    const a = xe(r.map((h) => h.raw).join(`
`));
    c.set(s, a.layout), i.push(...a.diagnostics.map((h) => ({ ...h, line: r[h.line - 1]?.line || s })));
  }
  return { layout: l.layout, scopes: c, diagnostics: i };
}
function xe(n) {
  const e = [], t = [];
  let o = !1, i = !1, l = 0;
  if (n.split(/\r?\n/).forEach((E, g) => {
    const u = E.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(u)) {
      (i || o) && e.push({ severity: "error", line: g + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(u) || e.push({ severity: "error", line: g + 1, message: "Expected @layout begin v1." }), i = !0, o = !0, l = g + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(u)) {
      o || e.push({ severity: "error", line: g + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (u.startsWith("*") ? t.push(u.slice(1).trim()) : e.push({ severity: "error", line: g + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: l, message: "Unclosed @layout block." }), !i) return { layout: null, diagnostics: e };
  const c = t.join(" "), s = c.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], r = [], a = [];
  let h = 0, f = 0, d = 10;
  const p = () => s[h++], O = () => {
    const E = p();
    if (!E || !/^[A-Za-z_@][\w./%:@-]*$/.test(E)) throw Error("Expected layout identifier, got " + E);
    return E;
  };
  function I(E) {
    if (r.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const g = E ? O() : "@row" + f++, u = p();
    if (!["row", "column", "classic"].includes(u)) throw Error("Expected row, column or classic.");
    if (p() !== "{") throw Error("Expected { after " + u);
    const w = { id: g, direction: u, members: [] };
    for (r.push(w); h < s.length && s[h] !== "}"; )
      s[h] === "group" ? (p(), w.members.push(I(!0))) : ["row", "column"].includes(s[h]) ? w.members.push(I(!1)) : w.members.push(O());
    if (p() !== "}") throw Error("Unclosed group " + g);
    if (!w.members.length) throw Error("Empty layout group " + g);
    return g;
  }
  try {
    for (; h < s.length; )
      if (s[h] === "group")
        p(), I(!0);
      else if (["row", "column"].includes(s[h])) I(!1);
      else if (s[h] === "priority-cap") {
        if (p(), d = Number(p()), !Number.isInteger(d) || d < 3 || d > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (p() === "place") {
        const C = O(), P = p(), A = O();
        if (!["left-of", "above"].includes(P)) throw Error("Expected left-of or above.");
        a.push({ a: C, relation: P, b: A });
      } else throw Error("Unknown layout instruction near " + s[h - 1]);
    const E = /* @__PURE__ */ new Set();
    for (const C of r) {
      const P = C.id.toLowerCase();
      if (E.has(P)) throw Error("Duplicate layout group " + C.id);
      E.add(P);
    }
    const g = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), w = new Map(r.map((C) => [C.id.toLowerCase(), C])), N = (C) => {
      if (g.has(C)) throw Error("Circular layout group " + C);
      if (!u.has(C)) {
        g.add(C);
        for (const P of w.get(C).members) w.has(P.toLowerCase()) && N(P.toLowerCase());
        g.delete(C), u.add(C);
      }
    };
    for (const C of w.keys()) N(C);
    const y = /* @__PURE__ */ new Map();
    for (const C of a) {
      if (C.a.toLowerCase() === C.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      y.has(C.a.toLowerCase()) || y.set(C.a.toLowerCase(), []), y.get(C.a.toLowerCase()).push(C.b.toLowerCase());
    }
    g.clear(), u.clear();
    const b = (C) => {
      if (g.has(C)) throw Error("Circular place constraints.");
      if (!u.has(C)) {
        g.add(C);
        for (const P of y.get(C) || []) b(P);
        g.delete(C), u.add(C);
      }
    };
    for (const C of y.keys()) b(C);
  } catch (E) {
    e.push({ severity: "error", line: l, message: "Layout description: " + E.message });
  }
  return { layout: { version: 1, priorityCap: d, groups: r, relations: a }, diagnostics: e };
}
function ct(n, e) {
  const t = e.focus ? n.ir.scopes[n.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? t : n.ir.layoutDescription;
  if (!o) return null;
  if (t) {
    const f = new Set(t.groups.map((p) => p.id.toLowerCase())), d = (p) => f.has(p.toLowerCase()) ? p : e.components.find((I) => I.synthetic && I.value.toLowerCase() === p.toLowerCase())?.name || e.focus + "/" + p;
    o = { ...t, groups: t.groups.map((p) => ({ ...p, members: p.members.map(d) })), relations: t.relations.map((p) => ({ ...p, a: d(p.a), b: d(p.b) })) };
  }
  const i = new Map(o.groups.map((f) => [f.id.toLowerCase(), f])), l = Object.values(n.contexts).flatMap((f) => f.devices.map((d) => d.name)), c = new Set([...Object.keys(n.contexts), ...l, ...e.components.map((f) => f.name)].map((f) => f.toLowerCase()));
  for (const f of i.values()) if (c.has((t ? e.focus + "/" + f.id : f.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + f.id);
  for (const f of i.values()) for (const d of f.members) if (!i.has(d.toLowerCase()) && !c.has(d.toLowerCase())) throw Error("Unknown @layout instance/device: " + d);
  for (const f of o.relations) for (const d of [f.a, f.b]) if (!i.has(d.toLowerCase()) && !c.has(d.toLowerCase())) throw Error("Unknown @layout place target: " + d);
  const s = /* @__PURE__ */ new Map(), r = [], a = new Set(Object.keys(n.contexts).map((f) => f.toLowerCase()));
  for (const f of o.groups) {
    const d = [];
    for (const p of f.members) {
      if (i.has(p.toLowerCase())) {
        d.push({ group: p });
        continue;
      }
      for (const O of e.components) if (O.name.toLowerCase() === p.toLowerCase() || O.name.toLowerCase().startsWith(p.toLowerCase() + "/")) {
        if (s.has(O.name)) throw Error("Overlapping @layout membership: " + O.name);
        s.set(O.name, f.id), d.push({ cell: O.name, ...a.has(p.toLowerCase()) ? { instance: p } : {} });
      }
    }
    r.push({ id: f.id, direction: f.direction, members: d });
  }
  const h = /* @__PURE__ */ new Set();
  for (const f of r) for (const d of f.members) if (d.group) {
    const p = d.group.toLowerCase();
    if (h.has(p)) throw Error("Layout group has multiple parents: " + d.group);
    h.add(p);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: r, relations: o.relations };
}
const ne = () => /* @__PURE__ */ Object.create(null), j = (n) => n.toLowerCase();
function Ue(n) {
  const e = ne();
  for (let t = 0; t < n.length; t++) {
    const o = n[t];
    if (/^params?:$/i.test(o)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!i) throw Error("Expected named parameter assignment, got: " + o);
    const l = j(i[1]);
    let c = i[2];
    if (c === void 0) {
      const s = /^=([\s\S]*)$/.exec(n[++t] || "");
      if (!s) throw Error("Expected = after parameter " + l);
      c = s[1];
    }
    if (c || (c = n[++t]), !c || /^params?:$/i.test(c)) throw Error("Missing value for parameter " + l);
    if (Object.hasOwn(e, l)) throw Error("Duplicate parameter: " + l);
    e[l] = c;
  }
  return e;
}
function ve(n) {
  const e = n.findIndex((t, o) => /^params?:$/i.test(t) || t.includes("=") || n[o + 1] === "=");
  return e < 0 ? [n, ne()] : [n.slice(0, e), Ue(n.slice(e))];
}
function lt(n, e = {}) {
  if (typeof n != "string") throw TypeError("Netlist must be a string.");
  if (n.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const t = st(n, e);
  n = t.source;
  const o = at(n), i = [...t.diagnostics, ...o.diagnostics], l = ne(), c = /* @__PURE__ */ new Set(["0"]), s = (u, w, N) => i.push({ severity: u, line: w, message: N }), r = (u, w, N, y = [], b = ne(), C = 0) => {
    const P = { id: u, name: w, parent: N, ports: y, defaults: b, parameters: ne(), definitions: ne(), devices: [], instances: [], directives: [], line: C, statements: [], layoutDescription: o.scopes.get(C) || null };
    return l[u] = P, P;
  }, a = r("root", "Top", null), h = [a], f = [];
  let d = !1, p = !1;
  n.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((u, w) => {
    const N = u.trim();
    !N || N.startsWith("*") || (N.startsWith("+") ? f.length ? f.at(-1).text += " " + N.slice(1).trim() : s("error", w + 1, "Continuation has no preceding statement.") : f.push({ text: N, line: w + 1 }));
  });
  for (const { text: u, line: w } of f)
    try {
      const N = pe(u);
      if (!N.length) continue;
      const y = j(N[0]), b = h.at(-1);
      if (p) {
        s("warning", w, "Statement after .end is not rendered: " + u);
        continue;
      }
      if (y === ".control") {
        d = !0, s("warning", w, ".control script retained but not executed or rendered.");
        continue;
      }
      if (y === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (y === ".subckt") {
        if (N.length < 2) throw Error(".SUBCKT requires a name.");
        const [C, P] = ve(N.slice(2)), A = j(N[1]);
        if (Object.hasOwn(b.definitions, A)) throw Error("Duplicate subcircuit definition: " + N[1]);
        const M = C.map(j);
        if (new Set(M).size !== C.length || M.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (C.some((X) => /[{}()=]/.test(X))) throw Error("Invalid formal port.");
        if (h.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const T = b.id + "/" + encodeURIComponent(A);
        b.definitions[A] = T, h.push(r(T, N[1], b.id, C, P, w));
        continue;
      }
      if (y === ".ends") {
        if (h.length === 1) throw Error("Unmatched .ENDS.");
        if (N[1] && j(N[1]) !== j(b.name)) throw Error(".ENDS name does not match " + b.name);
        h.pop();
        continue;
      }
      if (y === ".end") {
        if (h.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        p = !0;
        continue;
      }
      if (y === ".param") {
        const C = Ue(N.slice(1));
        for (const [P, A] of Object.entries(C)) {
          if (Object.hasOwn(b.parameters, P)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + P);
          b.parameters[P] = A;
        }
      }
      if (y === ".global") {
        if (N.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const C of N.slice(1)) c.add(j(C));
      }
      if (y.startsWith(".") && b.directives.push({ line: w, text: u }), y.startsWith("x")) {
        const [C, P] = ve(N.slice(1));
        if (!C.length) throw Error("X instance requires a subcircuit name.");
        const A = /;§pnba\s+(.+)$/i.exec(u)?.[1].split(")");
        b.instances.push({ name: N[0], nodes: C.slice(0, -1).map(j), definitionName: C.at(-1), definitionId: null, parameters: P, line: w, raw: u, pinNames: A });
      } else b.statements.push({ line: w, text: u });
    } catch (N) {
      s("error", w, N.message + " Statement: " + u);
    }
  h.length > 1 && s("error", h.at(-1).line, "Unclosed .SUBCKT " + h.at(-1).name), d && s("error", 0, "Unclosed .control block.");
  function O(u, w) {
    for (; u; ) {
      if (Object.hasOwn(u.definitions, j(w))) return u.definitions[j(w)];
      u = l[u.parent];
    }
    return null;
  }
  for (const u of Object.values(l)) {
    const w = [...u.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...u.statements], N = it(w.map((b) => b.text).join(`
`), { models: l[u.parent]?.models });
    u.devices = N.components.map((b) => ({ ...b, line: w[b.line - 1]?.line || u.line })), u.models = N.models, u === a && (a.title = N.title), i.push(...N.diagnostics.filter((b) => !b.message.includes("No supported components to render.") && !b.message.includes("300 components")).map((b) => ({ ...b, line: w[b.line - 1]?.line || u.line })));
    const y = new Set(u.devices.map((b) => j(b.name)));
    for (const b of u.instances)
      if (y.has(j(b.name)) && s("error", b.line, "Duplicate instance/device name: " + b.name), y.add(j(b.name)), b.definitionId = O(u, b.definitionName), !b.definitionId && !/^\{[\s\S]*\}$/.test(b.definitionName)) s("error", b.line, "Undefined subcircuit: " + b.definitionName + " in " + b.name);
      else if (b.definitionId) {
        const C = l[b.definitionId];
        C.ports.length !== b.nodes.length && s("error", b.line, `${b.name}: ${C.name} expects ${C.ports.length} ports; got ${b.nodes.length}.`);
      }
  }
  for (const u of Object.values(l)) delete u.statements;
  const I = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set();
  function g(u, w = []) {
    if (I.has(u)) {
      s("error", l[u].line, "Circular subcircuit reference: " + [...w, l[u].name].join(" → "));
      return;
    }
    if (!E.has(u)) {
      if (I.add(u), w.length >= 64) {
        s("error", l[u].line, "Subcircuit dependency nesting exceeds 64 levels."), I.delete(u), E.add(u);
        return;
      }
      for (const N of l[u].instances) N.definitionId && g(N.definitionId, [...w, l[u].name]);
      I.delete(u), E.add(u);
    }
  }
  for (const u of Object.keys(l)) g(u);
  !a.devices.length && !a.instances.length && s("error", 0, "No supported components or instances to render.");
  for (const u of i) !u.source && u.line && t.origins[u.line - 1] && (u.source = t.origins[u.line - 1].file, u.line = t.origins[u.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: l, globals: [...c], diagnostics: i, layoutDescription: o.layout };
}
const V = () => /* @__PURE__ */ Object.create(null), te = (n, e) => [...n, e].map((t) => encodeURIComponent(t)).join("/"), be = (n, e) => te(n.map((t) => t.toLowerCase()), e.toLowerCase());
function ut(n, e = []) {
  const t = V(), o = (i) => t[i] || (t[i] = { name: i, displayName: i.split("/").map((l) => decodeURIComponent(l)).join("/"), bit: Object.keys(t).length + 2, terminals: [] });
  for (const i of n) for (const [l, c] of Object.entries(i.terminals)) o(c).terminals.push({ component: i.name, pin: l });
  for (const i of e) o(i);
  return t;
}
function dt(n) {
  if (n.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = n.diagnostics, e;
  }
}
const Re = (n) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(n) ? n.slice(1, -1) : n, pt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function fe(n, e, t = (i) => i, o = (i) => i) {
  const i = [];
  n = n.replace(/"(?:\\.|[^"\\])*"/g, (c) => (i.push(c), "@@" + (i.length - 1) + "@@")), n = n.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (c, s, r) => {
    const a = r.split(",").map((f) => f.trim());
    if (a.some((f) => !f || /[\s{}+*()]/.test(f))) throw Error("Unsupported dynamic voltage/current reference: " + c);
    const h = s.toUpperCase() + "(" + a.map((f) => s.toLowerCase() === "v" ? t(f) : o(f, s)).join(",") + ")";
    return i.push(h), "@@" + (i.length - 1) + "@@";
  });
  let l = n.length;
  return n = n.replace(pt, (c, s, r) => {
    if (r.slice(s + c.length).trimStart().startsWith("(")) return c;
    const a = e(c.toLowerCase());
    if (a === void 0) return c;
    if (l += a.length + 2, l > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), n.replace(/@@(\d+)@@/g, (c, s) => i[Number(s)]);
}
function ft(n, e, t, o) {
  const i = { ...e, ...t }, l = V(), c = /* @__PURE__ */ new Set(), s = V();
  for (const [a, h] of Object.entries(o)) s[a] = fe(Re(h), (f) => n[f]);
  function r(a) {
    if (Object.hasOwn(s, a)) return s[a];
    if (Object.hasOwn(l, a)) return l[a];
    if (!Object.hasOwn(i, a)) return n[a];
    if (c.has(a)) {
      if (Object.hasOwn(n, a)) return n[a];
      throw Error("Circular parameter dependency: " + [...c, a].join(" → "));
    }
    return c.add(a), l[a] = fe(Re(i[a]), r), c.delete(a), l[a];
  }
  for (const a of Object.keys(i)) r(a);
  return Object.assign(V(), n, l, s);
}
function Se(n, e, t, o) {
  let i = "";
  for (let r = 0; r < n.length; ) {
    const a = n[r];
    if (a !== "{" && a !== "'") {
      i += a, r++;
      continue;
    }
    const h = r++;
    let f = 1, d = "";
    for (; r < n.length && f; r++) {
      if (a === "'") {
        n[r] === "'" && (f = 0);
        continue;
      }
      if (d) {
        n[r] === d && (d = "");
        continue;
      }
      if (n[r] === '"' || n[r] === "'") {
        d = n[r];
        continue;
      }
      n[r] === "{" && f++, n[r] === "}" && f--;
    }
    if (f) throw Error("Unclosed parameter expression.");
    i += a + fe(n.slice(h + 1, r - 1), (p) => e[p], t, o) + (a === "{" ? "}" : "'");
  }
  const l = [];
  let c = 0, s = "";
  for (let r = 0; r < i.length; r++) {
    const a = i[r];
    if (s) {
      a === s && i[r - 1] !== "\\" && (s = "");
      continue;
    }
    if (a === '"' || a === "'") {
      s = a;
      continue;
    }
    if ("({".includes(a) && c++, ")}".includes(a) && c--, !c && (r === 0 || /\s/.test(i[r - 1]))) {
      const h = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(r));
      h && (l.push({ start: r, end: r + h[0].length, key: h[1].toLowerCase() }), r += h[0].length - 1);
    }
  }
  if (l.length) {
    let r = i.slice(0, l[0].start);
    l.forEach((a, h) => {
      const f = l[h + 1]?.start ?? i.length, d = i.slice(a.end, f);
      r += i.slice(a.start, a.end) + (d.includes("{") || ["refnode", "intnode"].includes(a.key) ? d : fe(d, (p) => e[p], t, o));
    }), i = r;
  } else Object.hasOwn(e, n.toLowerCase()) && (i = "{" + e[n.toLowerCase()] + "}");
  return i;
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
  add(e, t, o) {
    if (typeof arguments[0] != "string")
      for (let i in arguments[0])
        this.add(i, arguments[0][i], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(i) {
        this[i] = this[i] || [], t && this[i][o ? "unshift" : "push"](t);
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
  run(e, t) {
    this[e] = this[e] || [], this[e].forEach(function(o) {
      o.call(t && t.context ? t.context : t, t);
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
    e.forEach((t) => {
      if (typeof t != "object" || !t.name || !t.init)
        throw new Error("Invalid JSEP plugin format");
      this.registered[t.name] || (t.init(this.jsep), this.registered[t.name] = t);
    });
  }
}
class m {
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
    return "JavaScript Expression Parser (JSEP) v" + m.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return m.max_unop_len = Math.max(e.length, m.max_unop_len), m.unary_ops[e] = 1, m;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, t, o) {
    return m.max_binop_len = Math.max(e.length, m.max_binop_len), m.binary_ops[e] = t, o ? m.right_associative.add(e) : m.right_associative.delete(e), m;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return m.additional_identifier_chars.add(e), m;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, t) {
    return m.literals[e] = t, m;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete m.unary_ops[e], e.length === m.max_unop_len && (m.max_unop_len = m.getMaxKeyLen(m.unary_ops)), m;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return m.unary_ops = {}, m.max_unop_len = 0, m;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return m.additional_identifier_chars.delete(e), m;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete m.binary_ops[e], e.length === m.max_binop_len && (m.max_binop_len = m.getMaxKeyLen(m.binary_ops)), m.right_associative.delete(e), m;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return m.binary_ops = {}, m.max_binop_len = 0, m;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete m.literals[e], m;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return m.literals = {}, m;
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
    return new m(e).parse();
  }
  /**
   * Get the longest key length of any object
   * @param {object} obj
   * @returns {number}
   */
  static getMaxKeyLen(e) {
    return Math.max(0, ...Object.keys(e).map((t) => t.length));
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
    return m.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !m.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    m.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return m.isIdentifierStart(e) || m.isDecimalDigit(e);
  }
  /**
   * throw error at index of the expression
   * @param {string} message
   * @throws
   */
  throwError(e) {
    const t = new Error(e + " at character " + this.index);
    throw t.index = this.index, t.description = e, t;
  }
  /**
   * Run a given hook
   * @param {string} name
   * @param {jsep.Expression|false} [node]
   * @returns {?jsep.Expression}
   */
  runHook(e, t) {
    if (m.hooks[e]) {
      const o = { context: this, node: t };
      return m.hooks.run(e, o), o.node;
    }
    return t;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (m.hooks[e]) {
      const t = { context: this };
      return m.hooks[e].find(function(o) {
        return o.call(t.context, t), t.node;
      }), t.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === m.SPACE_CODE || e === m.TAB_CODE || e === m.LF_CODE || e === m.CR_CODE; )
      e = this.expr.charCodeAt(++this.index);
    this.runHook("gobble-spaces");
  }
  /**
   * Top-level method to parse all expressions and returns compound or single node
   * @returns {jsep.Expression}
   */
  parse() {
    this.runHook("before-all");
    const e = this.gobbleExpressions(), t = e.length === 1 ? e[0] : {
      type: m.COMPOUND,
      body: e
    };
    return this.runHook("after-all", t);
  }
  /**
   * top-level parser (but can be reused within as well)
   * @param {number} [untilICode]
   * @returns {jsep.Expression[]}
   */
  gobbleExpressions(e) {
    let t = [], o, i;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === m.SEMCOL_CODE || o === m.COMMA_CODE)
        this.index++;
      else if (i = this.gobbleExpression())
        t.push(i);
      else if (this.index < this.expr.length) {
        if (o === e)
          break;
        this.throwError('Unexpected "' + this.char + '"');
      }
    return t;
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
    let e = this.expr.substr(this.index, m.max_binop_len), t = e.length;
    for (; t > 0; ) {
      if (m.binary_ops.hasOwnProperty(e) && (!m.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !m.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
        return this.index += t, e;
      e = e.substr(0, --t);
    }
    return !1;
  }
  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   * @returns {?jsep.BinaryExpression}
   */
  gobbleBinaryExpression() {
    let e, t, o, i, l, c, s, r, a;
    if (c = this.gobbleToken(), !c || (t = this.gobbleBinaryOp(), !t))
      return c;
    for (l = { value: t, prec: m.binaryPrecedence(t), right_a: m.right_associative.has(t) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + t), i = [c, l, s]; t = this.gobbleBinaryOp(); ) {
      if (o = m.binaryPrecedence(t), o === 0) {
        this.index -= t.length;
        break;
      }
      l = { value: t, prec: o, right_a: m.right_associative.has(t) }, a = t;
      const h = (f) => l.right_a && f.right_a ? o > f.prec : o <= f.prec;
      for (; i.length > 2 && h(i[i.length - 2]); )
        s = i.pop(), t = i.pop().value, c = i.pop(), e = {
          type: m.BINARY_EXP,
          operator: t,
          left: c,
          right: s
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), i.push(l, e);
    }
    for (r = i.length - 1, e = i[r]; r > 1; )
      e = {
        type: m.BINARY_EXP,
        operator: i[r - 1].value,
        left: i[r - 2],
        right: e
      }, r -= 2;
    return e;
  }
  /**
   * An individual part of a binary expression:
   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
   * @returns {boolean|jsep.Expression}
   */
  gobbleToken() {
    let e, t, o, i;
    if (this.gobbleSpaces(), i = this.searchHook("gobble-token"), i)
      return this.runHook("after-token", i);
    if (e = this.code, m.isDecimalDigit(e) || e === m.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === m.SQUOTE_CODE || e === m.DQUOTE_CODE)
      i = this.gobbleStringLiteral();
    else if (e === m.OBRACK_CODE)
      i = this.gobbleArray();
    else {
      for (t = this.expr.substr(this.index, m.max_unop_len), o = t.length; o > 0; ) {
        if (m.unary_ops.hasOwnProperty(t) && (!m.isIdentifierStart(this.code) || this.index + t.length < this.expr.length && !m.isIdentifierPart(this.expr.charCodeAt(this.index + t.length)))) {
          this.index += o;
          const l = this.gobbleToken();
          return l || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: m.UNARY_EXP,
            operator: t,
            argument: l,
            prefix: !0
          });
        }
        t = t.substr(0, --o);
      }
      m.isIdentifierStart(e) ? (i = this.gobbleIdentifier(), m.literals.hasOwnProperty(i.name) ? i = {
        type: m.LITERAL,
        value: m.literals[i.name],
        raw: i.name
      } : i.name === m.this_str && (i = { type: m.THIS_EXP })) : e === m.OPAREN_CODE && (i = this.gobbleGroup());
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
    let t = this.code;
    for (; t === m.PERIOD_CODE || t === m.OBRACK_CODE || t === m.OPAREN_CODE || t === m.QUMARK_CODE; ) {
      let o;
      if (t === m.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== m.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), t = this.code;
      }
      this.index++, t === m.OBRACK_CODE ? (e = {
        type: m.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), t = this.code, t !== m.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : t === m.OPAREN_CODE ? e = {
        type: m.CALL_EXP,
        arguments: this.gobbleArguments(m.CPAREN_CODE),
        callee: e
      } : (t === m.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: m.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), o && (e.optional = !0), this.gobbleSpaces(), t = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", t, o;
    for (; m.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === m.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); m.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (t = this.char, t === "e" || t === "E") {
      for (e += this.expr.charAt(this.index++), t = this.char, (t === "+" || t === "-") && (e += this.expr.charAt(this.index++)); m.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      m.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, m.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === m.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === m.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: m.LITERAL,
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
    const t = this.index, o = this.expr.charAt(this.index++);
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
      type: m.LITERAL,
      value: e,
      raw: this.expr.substring(t, this.index)
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
    let e = this.code, t = this.index;
    for (m.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, m.isIdentifierPart(e)); )
      this.index++;
    return {
      type: m.IDENTIFIER,
      name: this.expr.slice(t, this.index)
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
    const t = [];
    let o = !1, i = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let l = this.code;
      if (l === e) {
        o = !0, this.index++, e === m.CPAREN_CODE && i && i >= t.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (l === m.COMMA_CODE) {
        if (this.index++, i++, i !== t.length) {
          if (e === m.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === m.CBRACK_CODE)
            for (let c = t.length; c < i; c++)
              t.push(null);
        }
      } else if (t.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const c = this.gobbleExpression();
        (!c || c.type === m.COMPOUND) && this.throwError("Expected comma"), t.push(c);
      }
    }
    return o || this.throwError("Expected " + String.fromCharCode(e)), t;
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
    let e = this.gobbleExpressions(m.CPAREN_CODE);
    if (this.code === m.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: m.SEQUENCE_EXP,
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
      type: m.ARRAY_EXP,
      elements: this.gobbleArguments(m.CBRACK_CODE)
    };
  }
}
const gt = new ht();
Object.assign(m, {
  hooks: gt,
  plugins: new mt(m),
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
m.max_unop_len = m.getMaxKeyLen(m.unary_ops);
m.max_binop_len = m.getMaxKeyLen(m.binary_ops);
const re = (n) => new m(n).parse(), bt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(m).filter((n) => !bt.includes(n) && re[n] === void 0).forEach((n) => {
  re[n] = m[n];
});
re.Jsep = m;
const Et = "ConditionalExpression";
var _t = {
  name: "ternary",
  init(n) {
    n.hooks.add("after-expression", function(t) {
      if (t.node && this.code === n.QUMARK_CODE) {
        this.index++;
        const o = t.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === n.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), t.node = {
            type: Et,
            test: o,
            consequent: i,
            alternate: l
          }, o.operator && n.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && n.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            t.node.test = c.right, c.right = t.node, t.node = o;
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
  init(n) {
    n.hooks.add("after-expression", function(t) {
      if (t.node && this.code === n.QUMARK_CODE) {
        this.index++;
        const o = t.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === n.COLON_CODE) {
          this.index++;
          const l = this.gobbleExpression();
          if (l || this.throwError("Expected expression"), t.node = {
            type: wt,
            test: o,
            consequent: i,
            alternate: l
          }, o.operator && n.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && n.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            t.node.test = c.right, c.right = t.node, t.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
re.plugins.register(Nt);
const yt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Le = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (n, e) => Math.abs(n) ** e, mod: (n, e) => n % e, limit: (n, e, t) => Math.min(Math.max(n, e), t) }, B = (n) => Number(n) > 0.5;
function ae(n, e = {}) {
  const t = /* @__PURE__ */ new Set();
  let o = 0;
  function i(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (r) => {
      if (r[0] === '"' || r[0] === "'") return r;
      const [, a, h, f] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(r), d = h.toLowerCase(), p = d.startsWith("meg") ? 1e6 : d.startsWith("mil") ? 254e-7 : yt[d[0]] || 1;
      return "(" + (f ? +(a + (a.includes(".") ? "" : ".") + f) : Number(a)) * p + ")";
    }), l(re(s));
  }
  function l(s) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const r = s.name.toLowerCase();
      if (r === "pi") return Math.PI;
      if (r === "e") return Math.E;
      if (!Object.hasOwn(e, r)) throw Error("Undefined structural parameter: " + s.name);
      if (t.has(r)) throw Error("Circular structural parameter: " + r);
      t.add(r);
      const a = i(e[r]);
      return t.delete(r), a;
    }
    if (s.type === "ConditionalExpression") return B(l(s.test)) ? l(s.consequent) : l(s.alternate);
    if (s.type === "UnaryExpression") {
      const r = l(s.argument);
      if (s.operator === "-") return -r;
      if (s.operator === "+") return +r;
      if (s.operator === "!" || s.operator === "~") return !B(r);
    }
    if (s.type === "BinaryExpression") {
      const r = l(s.left);
      if (s.operator === "&&") return B(r) && B(l(s.right));
      if (s.operator === "||") return B(r) || B(l(s.right));
      const a = l(s.right);
      switch (s.operator) {
        case "+":
          return r + a;
        case "-":
          return r - a;
        case "*":
          return r * a;
        case "/":
          return r / a;
        case "**":
          return r ** a;
        case "%":
          return r % a;
        case "^":
          return B(r) !== B(a);
        case "&":
          return B(r) && B(a);
        case "|":
          return B(r) || B(a);
        case ">":
          return r > a;
        case "<":
          return r < a;
        case ">=":
          return r >= a;
        case "<=":
          return r <= a;
        case "==":
        case "===":
          return r === a;
        case "!=":
        case "!==":
          return r !== a;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const r = s.callee.name.toLowerCase();
      if (r === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return B(l(s.arguments[0])) ? l(s.arguments[1]) : l(s.arguments[2]);
      }
      if (Object.hasOwn(Le, r)) return Le[r](...s.arguments.map(l));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const c = i(n);
  if (typeof c == "number" && !Number.isFinite(c)) throw Error("Structural expression is not finite.");
  return c;
}
function Ct(n) {
  dt(n);
  const e = V(), t = /* @__PURE__ */ new Map();
  let o = 0, i = 0;
  function l(c, s, r, a, h, f, d) {
    if (s.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const p = n.scopes[c], O = s.length ? te(s.slice(0, -1), s.at(-1)) : "", I = V();
    if (d.some((y) => y.scopeId === c)) throw Error("Circular subcircuit reference at " + O);
    const E = ft(a, p.defaults, p.parameters, h);
    function g(y) {
      if (/^\{[\s\S]*\}$/.test(y)) {
        const C = ae(y, E);
        y = String(typeof C == "boolean" ? Number(C) : C);
      }
      /^"[\s\S]*"$/.test(y) && (y = y.slice(1, -1));
      const b = y.toLowerCase();
      return Object.hasOwn(r, b) ? r[b] : n.globals.includes(b) ? be([], b) : I[b] || (I[b] = be(s, b));
    }
    const u = { id: O, path: s, scopeId: c, name: f?.name || "Top", definition: p.name, ports: p.ports.map((y) => ({ name: y, node: g(y) })), params: E, nodes: I, models: V(), devices: [], children: [], raw: f?.raw || "", line: f?.line || 0 };
    e[O] = u, t.set(O, g);
    const w = [...d, u];
    function N(y) {
      if (!y) return "";
      let b = p;
      for (; b; ) {
        if (b.directives.some((C) => new RegExp("^\\.model\\s+" + y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(C.text))) {
          const C = [...w].reverse().find((P) => P.scopeId === b.id);
          return te(C?.path || [], y.toLowerCase());
        }
        b = n.scopes[b.parent];
      }
      return y;
    }
    for (const y of p.directives.filter((b) => /^\.model\b/i.test(b.text))) {
      const b = /^\.model\s+(\S+)/i.exec(y.text)?.[1];
      if (!b) continue;
      const C = N(b), P = p.models[b.toLowerCase()], A = Se(y.text, E, g, (M) => te(s, M));
      u.models[C] = { ...P, name: C, raw: A.replace(/^(\.model\s+)\S+/i, (M, T) => T + C), instanceId: O, parameters: E };
    }
    for (const y of p.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const b = V();
      for (const [P, A] of Object.entries(y.terminals)) b[P] = g(A);
      const C = N(y.model);
      u.devices.push({ ...y, name: te(s, y.name), localName: y.name, instanceId: O, terminals: b, model: C, parameters: E });
    }
    for (const y of p.instances) {
      let b = y.definitionId;
      if (!b) {
        const M = String(ae(y.definitionName, E)).toLowerCase();
        let T = p;
        for (; T && !b; )
          b = T.definitions[M], T = n.scopes[T.parent];
        if (!b) throw Error("Undefined selected subcircuit: " + M);
      }
      const C = n.scopes[b], P = V();
      if (C.ports.length !== y.nodes.length) throw Error(y.name + ": expected " + C.ports.length + " ports; got " + y.nodes.length);
      C.ports.forEach((M, T) => {
        P[M.toLowerCase()] = g(y.nodes[T]);
      });
      const A = l(b, [...s, y.name], P, E, y.parameters, y, w);
      y.pinNames?.length === A.ports.length && A.ports.forEach((M, T) => {
        M.label = y.pinNames[T];
      }), u.children.push(A);
    }
    return u;
  }
  try {
    let h = function(f, d) {
      const p = d.split(":");
      if (p.length === 1) return { owner: f, name: d };
      const O = p.pop();
      for (const I of [[...f.path, ...p], p]) {
        const E = s.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: O };
      }
      throw Error("Unknown hierarchical reference: " + d);
    };
    const c = l(n.rootId, [], V(), V(), V(), null, []), s = new Map(Object.values(e).map((f) => [f.id.toLowerCase(), f])), r = Object.assign(V(), ...Object.values(e).map((f) => f.models)), a = (f) => r[f] || Object.entries(r).find(([d]) => d.startsWith(f + "."))?.[1];
    for (const f of Object.values(e)) for (const d of f.devices) {
      const p = n.scopes[f.scopeId].devices.find((E) => E.name === d.localName), O = (E) => {
        const g = h(f, E);
        return t.get(g.owner.id)(g.name);
      }, I = (E, g = "", u = "") => {
        const w = h(f, E), N = w.owner.devices.find((y) => y.localName.toLowerCase() === w.name.toLowerCase());
        if (g.toLowerCase() === "ix") {
          const y = w.owner.ports.find((b, C) => b.name.toLowerCase() === w.name.toLowerCase() || String(C + 1) === w.name);
          if (y) return w.owner.id + ":" + y.name;
        }
        if (!N) {
          if (u) throw Error(d.name + ": referenced " + u + " device " + E + " was not found.");
          return te(w.owner.path, w.name);
        }
        if (u && N.kind !== u) throw Error(d.name + ": " + E + " must be a " + u + " device.");
        return N.name;
      };
      if (d.value = Se(p.value, f.params, O, I), p.model && (d.value = d.value.replace(p.model, d.model)), d.kind === "M" && Object.keys(d.terminals).length === 3) {
        let E = a(d.model), g = !1;
        const u = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !u.has(E.name); ) {
          u.add(E.name);
          const w = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (w) {
            g = w[1] === void 0 || Number(ae(w[1], E.parameters)) >= 0.5;
            break;
          }
          const N = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = a(N + (E.baseModel || "").toLowerCase()) || a((E.baseModel || "").toLowerCase());
        }
        u.size && (d.type = "spice_" + (g ? "pmos3" : "nmos3"));
      }
      d.controlSources = (p.controlSources || []).map((E) => I(E, "", "V")), d.controlSource = d.controlSources[0] || "", d.coupledInductors = (p.coupledInductors || []).map((E) => I(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...p.controlSources || [], ...p.coupledInductors || []])) {
        const g = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        d.value = d.value.replace(new RegExp("(?<![\\w./%])" + g + "(?![\\w.$])", "g"), () => I(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: n, root: c, contexts: e };
  } catch (c) {
    throw c.diagnostics = [...n.diagnostics, { severity: "error", line: 0, message: c.message }], c;
  }
}
function ce(n) {
  return [...n.devices, ...n.children.flatMap(ce)];
}
function Pe(n) {
  return JSON.stringify(n.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, t) => e[0].localeCompare(t[0])));
}
function It(n, e) {
  const t = /* @__PURE__ */ new Map(), o = n.components.filter((d) => d.kind === "R"), i = n.components.filter((d) => d.kind === "Q"), l = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), r = (d, p) => [d, p].sort().join("|"), a = (d) => Object.values(d.terminals);
  for (const d of o) {
    const p = a(d);
    p.length === 2 && l.set(r(...p), d);
  }
  const h = (d, p, O) => {
    d && t.set(d.name, { reverse: a(d)[0] !== p, reason: O });
  };
  for (const d of i) {
    const { C: p, B: O, E: I } = d.terminals, E = d.type.endsWith("pnp"), g = d.type.endsWith("npn");
    if (!E && !g) continue;
    c.has(I) || c.set(I, []), c.get(I).push(d), p === O && e[I]?.potential !== null && e[I]?.potential !== void 0 && s.set(p, { potential: e[I].potential });
    const u = E ? I : p, w = E ? p : I, N = l.get(r(u, O)), y = l.get(r(O, w));
    N && y && (h(N, u, "transistor bias divider"), h(y, O, "transistor bias divider"));
  }
  for (const d of o) {
    const [p, O] = a(d), I = s.get(p), E = s.get(O);
    I && E && I.potential !== E.potential && h(d, I.potential > E.potential ? p : O, "diode-connected bias reference");
  }
  const f = /* @__PURE__ */ new Map();
  for (const d of o) {
    const p = a(d);
    if (!p.some((O) => e[O]?.potential !== null && e[O]?.potential !== void 0))
      for (const O of p)
        f.has(O) || f.set(O, []), f.get(O).push(d);
  }
  for (const [d, p] of f)
    if (!(p.length > 12))
      for (const O of p) for (const I of p) {
        if (O === I) continue;
        const E = a(O).find((N) => N !== d), g = a(I).find((N) => N !== d), u = c.get(E)?.find((N) => N.type.endsWith("npn")), w = c.get(g)?.find((N) => N.type.endsWith("pnp"));
        u && w && (h(O, E, "complementary emitter output"), h(I, d, "complementary emitter output"));
      }
  return t;
}
function Ot(n) {
  const e = n.components.filter((l) => l.kind === "Q"), t = /* @__PURE__ */ new Map(), o = new Set(n.components.filter((l) => l.kind === "R").map((l) => Object.values(l.terminals).sort().join("|"))), i = /* @__PURE__ */ new Set();
  for (const l of e) {
    const c = l.terminals.E;
    t.has(c) || t.set(c, []), t.get(c).push(l);
  }
  for (const l of e) {
    const { B: c, C: s, E: r } = l.terminals;
    if (c === r || !o.has([c, r].sort().join("|"))) continue;
    const a = t.get(c) || [];
    if (!(a.length > 16))
      for (const h of a) {
        if (h === l) continue;
        if (h.terminals.B === s) {
          i.add(l.name);
          break;
        }
        const f = t.get(h.terminals.B) || [];
        if (f.length <= 16 && f.some((d) => d !== l && d !== h && d.terminals.B === s)) {
          i.add(l.name);
          break;
        }
      }
  }
  return i;
}
const ke = 9;
function Ee(n) {
  const e = String(n).split("/").at(-1);
  let t;
  try {
    t = decodeURIComponent(e);
  } catch {
    t = e;
  }
  return t === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(t)?.[1].toLowerCase() || "unknown";
}
const ue = (n) => ["pwr", "ret", "bias"].includes(n), xt = (n) => String(n).split("/").at(-1).toLowerCase(), Me = (n) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[xt(n)] || "unknown", vt = (n) => {
  const e = Ee(n);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(n).toLowerCase()] || Me(n);
};
function Rt(n) {
  const e = /* @__PURE__ */ new Map(), t = [], o = (c, s, r) => {
    e.has(c) || e.set(c, []), e.get(c).push({ node: s, delta: r });
  };
  for (const c of n)
    if (c.kind === "V")
      try {
        let s = c.value.trim();
        const r = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (r && Number(ae(r[1], c.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!a) continue;
        const h = ae(a[1], c.parameters);
        if (typeof h != "number" || !Number.isFinite(h)) continue;
        o(c.terminals["-"], c.terminals["+"], h), o(c.terminals["+"], c.terminals["-"], -h);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ new Set();
  for (const c of ["0", ...e.keys()]) {
    if (l.has(c)) continue;
    const s = /* @__PURE__ */ new Map([[c, 0]]), r = [c];
    l.add(c);
    let a = !1;
    for (let h = 0; h < r.length; h++) for (const f of e.get(r[h]) || []) {
      const d = s.get(r[h]) + f.delta;
      s.has(f.node) ? Math.abs(s.get(f.node) - d) > 1e-8 * Math.max(1, Math.abs(d)) && (a = !0) : (s.set(f.node, d), l.add(f.node), r.push(f.node));
    }
    a && t.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [h, f] of s) i[h] = { value: f, reference: c, known: c === "0" && !a, consistent: !a };
  }
  return { nodes: i, diagnostics: t };
}
function St(n, e) {
  const t = Rt(ce(n.root)), o = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const r of Object.values(e.nodes)) {
    const a = Ee(r.name), h = Me(r.name);
    o[r.name] = { role: a !== "unknown" ? a : h, roleSource: a !== "unknown" ? "node-name" : h !== "unknown" ? "legacy-rail-name" : "unknown", potential: t.nodes[r.name]?.known ? t.nodes[r.name].value : null };
  }
  const l = It(e, o), c = Ot(e), s = (r, a, h) => {
    const f = { role: o[h].role, roleSource: o[h].roleSource }, d = r.block?.ports.find((I) => I.pin === a);
    if (d?.implicit || !r.block && !r.synthetic) return f;
    const p = r.synthetic ? r.value : d?.name || d?.label, O = vt(p);
    return O !== "unknown" ? { role: O, roleSource: Ee(p) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ue(f.role) ? { ...f, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const r of e.components) {
    const a = Object.fromEntries(Object.entries(r.terminals).map(([b, C]) => [b, { ...o[C], ...s(r, b, C) }])), h = Object.values(a), f = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(r.type), d = f && !l.has(r.name) && h.length === 2 && h.every((b) => !ue(b.role) && (b.potential === null || b.role !== "unknown")), p = r.terminals["+"], O = r.terminals["-"], I = [p, O].filter((b) => b && b !== "0"), E = r.kind === "V" && I.some((b) => ue(o[b]?.role)) && !I.some((b) => ["in", "out", "io", "fb"].includes(o[b]?.role)) && [p, O].every((b) => t.nodes[b]?.known), g = p === "0" ? O : p, u = Object.keys(r.terminals), w = (b) => ue(b.role) ? b.potential !== null ? b.potential > 0 ? "high" : "low" : b.role === "ret" ? "low" : "high" : "signal";
    let N = !1;
    u.length === 2 && (r.kind === "V" && h.every((b) => b.potential !== null) ? N = h[0].potential < h[1].potential : r.terminals[u[0]] === "0" ? N = !0 : r.terminals[u[1]] === "0" ? N = !1 : h.every((b) => b.potential !== null) ? N = h[0].potential < h[1].potential : N = w(h[0]) === "low" || w(h[1]) === "high" && w(h[0]) === "signal"), l.has(r.name) && (N = l.get(r.name).reverse);
    const y = r.synthetic ? "" : r.name.startsWith(e.focus + "/") ? r.name.slice(e.focus.length + 1) : r.name;
    i[r.name] = { version: ke, kind: r.kind, polarity: r.type.endsWith("pnp") ? "p" : r.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(r.name), orientationReason: l.get(r.name)?.reason || null, owner: y.includes("/") ? y.slice(0, y.lastIndexOf("/")) : "", passive: f, source: ["V", "I", "E", "F", "G", "H"].includes(r.kind) || r.kind === "B" && !f, ports: a, horizontal: d, orientation: d ? "horizontal" : N ? "vertical-reversed" : "vertical", flexible: u.length === 2 && (f || ["V", "I", "B", "F", "H"].includes(r.kind)), supply: !!E, voltage: E ? t.nodes[g].value : null };
  }
  return { version: ke, nodes: o, cells: i, diagnostics: t.diagnostics };
}
function De(n, e) {
  const t = e.ports.map((i, l) => ({ pin: "P" + l, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), o = new Set(ce(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of n.ir.globals) {
    const l = be([], i);
    o.has(l) && !t.some((c) => c.node === l) && t.push({ pin: "G" + t.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: l, implicit: !0 });
  }
  return t;
}
function Lt(n, { mode: e = "hierarchical", expanded: t = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const i = n.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  const l = [], c = [];
  function s(h) {
    c.push(...Object.values(h.nodes), ...h.ports.map((d) => d.node));
    const f = [...h.devices.map((d) => ({ line: d.line, device: d })), ...h.children.map((d) => ({ line: d.line, child: d }))].sort((d, p) => d.line - p.line);
    for (const d of f) {
      if (d.device) {
        const E = d.device;
        l.push({ ...E, layoutLabel: [...h.path.slice(i.path.length), E.localName].join("/") });
        continue;
      }
      const p = d.child;
      if (e === "flat" || t.has(p.id)) {
        s(p);
        continue;
      }
      const O = De(n, p), I = V();
      O.forEach((E) => {
        I[E.pin] = E.node;
      }), l.push({ name: p.id, kind: "X", type: "spice_subckt", terminals: I, value: p.definition, raw: p.raw, line: p.line, instanceId: p.id, layoutLabel: p.path.slice(i.path.length).join("/"), block: { definitionId: p.scopeId, ports: O, parameters: p.params } });
    }
  }
  s(i);
  for (const [h, f] of i.ports.entries()) l.push({ name: "@port/" + o + "/" + h, kind: "PORT", type: "spice_port", terminals: { A: f.node }, layoutLabel: f.name, value: f.name, raw: "Interface port " + f.name, synthetic: !0 });
  if (l.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const r = Object.assign(V(), ...Object.values(n.contexts).map((h) => h.models)), a = { title: o || n.ir.title, components: l, nodes: ut(l, c), models: r, diagnostics: n.ir.diagnostics, mode: e, focus: o };
  return a.topology = Pt(n, a), a.layout = St(n, a), a.layout.description = ct(n, a), a;
}
function Pt(n, e) {
  const t = [], o = /* @__PURE__ */ new Set();
  for (const c of e.components)
    if (!c.synthetic)
      if (c.kind === "X") {
        const s = n.contexts[c.instanceId];
        if (!s) throw Error("Projection contains an unknown block.");
        const r = De(n, s);
        if (JSON.stringify(Object.entries(c.terminals)) !== JSON.stringify(r.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + c.name);
        t.push(...ce(s));
      } else t.push(c);
  for (const c of t) {
    if (o.has(c.name)) throw Error("Projection duplicates " + c.name);
    o.add(c.name);
  }
  const i = Pe(t), l = ce(n.contexts[e.focus]);
  if (i !== Pe(l)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: t.length, signature: i };
}
function kt(n) {
  const e = V(), t = V();
  for (const o of n.components) {
    const i = V(), l = V();
    for (const [c, s] of Object.entries(o.terminals))
      i[c] = [n.nodes[s].bit], l[c] = "input";
    e[o.name] = { type: o.type, port_directions: l, connections: i, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = n.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((c) => ({ pin: c.pin, label: c.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((c, s) => ({ pin: c, label: o.pinLabels?.[s] || c })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(n.nodes)) t[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (n.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [n.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: t, spiceLayoutDescription: n.layout?.description || null } } };
}
function At(n) {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), o = {}, i = (r) => (t.has(r) || t.set(r, t.size + 2), t.get(r));
  Object.entries(n.modules.circuit.cells).forEach(([r, a], h) => {
    const f = "c" + h;
    e.set(f, r);
    const d = Object.fromEntries(Object.entries(a.connections).map(([p, O]) => [p, O.map(i)]));
    o[f] = { type: a.type, connections: d, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (o[f].spiceBlock = a.spiceBlock), a.spiceSymbol && (o[f].spiceSymbol = a.spiceSymbol), a.spiceLayout && (o[f].spiceLayout = a.spiceLayout);
  });
  const l = new Map([...e].map(([r, a]) => [a, r])), c = n.modules.circuit.spiceLayoutDescription, s = c ? { ...c, groups: c.groups.map((r) => ({ ...r, members: r.members.map((a) => a.cell ? { ...a, cell: l.get(a.cell) } : a) })), relations: c.relations.map((r) => ({ ...r, a: l.get(r.a) || r.a, b: l.get(r.b) || r.b })) } : null;
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceLayoutDescription: s } } }, ids: e, bits: new Map([...t].map(([r, a]) => [a, r])) };
}
const K = /* @__PURE__ */ new Map();
async function Tt(n, e) {
  const t = At(n), o = JSON.stringify([t.netlist, e]);
  let i = K.get(o);
  i ? (K.delete(o), K.set(o, i)) : (i = await Ut(t.netlist, e), i.svg.length < 1e6 && (K.set(o, i), K.size > 20 && K.delete(K.keys().next().value)));
  const l = new DOMParser().parseFromString(i.svg, "image/svg+xml");
  if (l.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const r of l.querySelectorAll("[id],[class]")) {
    const a = r.getAttribute("id");
    a?.startsWith("cell_") && t.ids.has(a.slice(5)) && r.setAttribute("id", "cell_" + t.ids.get(a.slice(5)));
    const h = r.getAttribute("class");
    h && r.setAttribute("class", h.split(/\s+/).map((f) => f.startsWith("cell_") && t.ids.has(f.slice(5)) ? "cell_" + t.ids.get(f.slice(5)) : /^net_\d+$/.test(f) && t.bits.has(Number(f.slice(4))) ? "net_" + t.bits.get(Number(f.slice(4))) : f).join(" "));
  }
  const c = i.drawing ? structuredClone(i.drawing) : null, s = l.querySelector("#spice-layout-report");
  if (s) {
    const r = JSON.parse(s.textContent);
    r.mirroredTransistors = (r.mirroredTransistors || []).map((a) => t.ids.get(a) || a);
    for (const a of r.voltageRails || []) a.bit !== void 0 && (a.bit = t.bits.get(a.bit) ?? a.bit);
    s.textContent = JSON.stringify(r);
  }
  if (c) {
    for (const r of c.components) {
      r.id = t.ids.get(r.id) || r.id;
      for (const a of r.ports) a.bit = t.bits.get(a.bit) ?? a.bit;
    }
    for (const r of c.segments) r.bit = t.bits.get(r.bit) ?? r.bit;
  }
  return { svg: new XMLSerializer().serializeToString(l.documentElement), drawing: c };
}
function Ut(n, e) {
  const t = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DO72VNks.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, i) => {
    const l = (r, a) => {
      clearTimeout(s), t.terminate(), r ? i(Error(r)) : o(a);
    }, c = Object.keys(n.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => l("Layout timed out. Open a subcircuit sheet or collapse instances."), c);
    t.onmessage = ({ data: r }) => l(r.error, { svg: r.svg, drawing: r.drawing }), t.onerror = (r) => l(r.message || "Layout worker failed."), t.postMessage({ netlist: n, settings: e });
  });
}
const Mt = `* RLC low-pass filter
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
`, Qt = `* Unity-gain Sallen-Key second-order low-pass filter.
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
*   group INPUT classic { IN_P IN_N Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 R1 R2 R3 IO_NULL1 IO_NULL5 }
*   group BIAS classic { Q10 Q11 Q12 R4 R5 }
*   group GAIN classic { Q16 Q17 Q18 Q22 R7 R8 R11 R12 C1 }
*   group OUTPUT classic { Q13 Q14 Q15 Q20 R9 R10 OUT_SIG }
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
`, Bt = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.
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
*   group INPUT classic { IN_P IN_N Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 R1 R2 R3 IO_NULL1 IO_NULL5 }
*   group BIAS classic { Q10 Q11 Q12 R4 R5 }
*   group GAIN classic { Q16 Q17 Q18 Q22 R7 R8 R11 R12 C1 }
*   group OUTPUT classic { Q13 Q14 Q15 Q20 R9 R10 OUT_SIG }
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
  filter: { source: Mt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Dt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Vt, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Qt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Bt, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function jt(n) {
  const e = new Uint8Array(n);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Ae(n) {
  return jt(await n.arrayBuffer());
}
const Te = de.filter.source, v = (n) => document.getElementById("spice-" + n), se = v("app");
if (se) {
  let C = function(_) {
    const x = v("example-info");
    if (x && (x.replaceChildren(), !!_ && (x.append(document.createTextNode(_.description + " ")), _.url))) {
      const L = document.createElement("a");
      L.href = _.url, L.target = "_blank", L.rel = "noopener noreferrer", L.textContent = _.reference, x.append(L);
    }
  }, P = function() {
    i = null, l = null, s = "", y(), C(Object.values(de).find((_) => _.source === n.value)), t.textContent = "Input changed — generate to refresh the schematic.";
  }, A = function(_) {
    o.replaceChildren();
    for (const { severity: x, line: L, message: k, source: S } of _) {
      const D = document.createElement("li");
      D.className = x, D.textContent = `${x.toUpperCase()}${S && S !== "input.cir" ? " · " + S : ""}${L ? " · line " + L : ""}: ${k}`, o.append(D);
    }
    v("messages").open = _.some((x) => x.severity !== "info"), v("message-count").textContent = `${_.length} message${_.length === 1 ? "" : "s"}`;
  }, M = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`), v("zoom-level").textContent = Math.round(E.w / I.w * 100) + "%";
  }, T = function(_, x = I.x + I.w / 2, L = I.y + I.h / 2) {
    if (!e.querySelector("svg")) return;
    const k = Math.max(0.05, Math.min(10, I.w * _ / E.w)) * E.w / I.w;
    I = { x: x + (I.x - x) * k, y: L + (I.y - L) * k, w: I.w * k, h: I.h * k }, M();
  }, oe = function(_) {
    const x = new URLSearchParams();
    _ && x.set("instance", _);
    const L = x.toString();
    location.hash.slice(1) === L ? (d = _, Q()) : location.hash = L;
  }, H = function() {
    d = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, le = function(_) {
    const x = a.contexts[_].path;
    for (let L = 1; L <= x.length; L++) u.add(x.slice(0, L).map(encodeURIComponent).join("/"));
  }, _e = function() {
    const _ = !!(p && p !== d && a?.contexts[p]);
    v("selection-actions").hidden = !_, v("toggle-instance").textContent = u.has(p) ? "Collapse instance" : "Expand instance", v("toggle-instance").disabled = !1, v("open-instance").href = "#" + new URLSearchParams({ instance: p });
  }, we = function() {
    v("breadcrumbs").replaceChildren();
    const _ = (L, k) => {
      const S = document.createElement("button");
      S.type = "button", S.textContent = L, S.onclick = () => oe(k), S.disabled = k === d, v("breadcrumbs").append(S);
    };
    if (_("Top", ""), d) {
      const L = a.contexts[d].path;
      for (let k = 0; k < L.length; k++) _(L[k], L.slice(0, k + 1).map(encodeURIComponent).join("/"));
    }
    v("instances").replaceChildren();
    const x = (L, k) => {
      for (const S of L.children) {
        const D = document.createElement("div");
        D.className = "spice-instance-row", D.style.setProperty("--depth", Math.min(k, 8)), D.dataset.instance = S.id;
        const $ = document.createElement("button");
        $.type = "button", $.textContent = u.has(S.id) ? "−" : "+", $.title = (u.has(S.id) ? "Collapse " : "Expand ") + S.id, $.setAttribute("aria-label", $.title), $.setAttribute("aria-expanded", String(u.has(S.id))), $.onclick = () => {
          u.has(S.id) ? u.delete(S.id) : le(S.id), p = S.id, Q();
        };
        const Z = document.createElement("a");
        Z.href = "#" + new URLSearchParams({ instance: S.id }), Z.textContent = S.name + " · " + S.definition, Z.title = "Open " + S.id + " as its own sheet";
        const q = document.createElement("span");
        if (q.className = "spice-help", q.textContent = Object.entries(S.params).map(([z, J]) => z + "=" + J).join(" · "), D.append($, Z), q.textContent) {
          const z = document.createElement("details"), J = document.createElement("summary");
          J.textContent = "Parameters", z.append(J, q), D.append(z);
        }
        v("instances").append(D), x(S, k + 1);
      }
    };
    x(a.contexts[d], 0), v("hierarchy-panel").hidden = !a.contexts[d].children.length, v("focus-title").textContent = d ? d + " / " + a.contexts[d].definition : "Top-level schematic", _e();
  };
  const n = v("input"), e = v("preview"), t = v("status"), o = v("diagnostics");
  let i = null, l = null, c = !1, s = "", r, a, h, f = "", d = "", p = "", O = !1, I = { x: 0, y: 0, w: 1, h: 1 }, E = { ...I }, g;
  const u = /* @__PURE__ */ new Set();
  let w = !1, N = {};
  try {
    N = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  se.addEventListener("click", (_) => {
    O && _.target.closest('a[href^="#"]') && _.preventDefault();
  });
  const y = () => {
    v("copy").disabled = v("download").disabled = !s || O, v("download-asc").disabled = v("download-asc-bundle").disabled = !s || !i || O || c;
  }, b = () => ({ font: v("font").value, fontSize: Number(v("size").value), color: v("color").value, detailed: v("detailed").checked, conventional: v("conventional").checked });
  n.value = Te;
  try {
    n.value = sessionStorage.getItem("spice-netlist-v2") || Te;
  } catch {
  }
  C(Object.values(de).find((_) => _.source === n.value)), n.addEventListener("input", P);
  for (const _ of ["font", "size", "color", "detailed", "conventional"]) v(_).addEventListener("input", P);
  v("zoom-in").onclick = () => T(0.8), v("zoom-out").onclick = () => T(1.25), v("fit").onclick = () => {
    I = { ...E }, M();
  };
  const X = (_) => {
    const x = e.querySelector("svg");
    return x ? new DOMPoint(_.clientX, _.clientY).matrixTransform(x.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (_) => {
    const x = X(_);
    x && (_.preventDefault(), T(_.deltaY > 0 ? 1.12 : 1 / 1.12, x.x, x.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (_) => {
    _.button !== 0 || !e.querySelector("svg") || (g = { start: X(_), x: _.clientX, y: _.clientY, view: { ...I }, moved: !1 }, e.setPointerCapture(_.pointerId));
  }), e.addEventListener("pointermove", (_) => {
    if (!g) return;
    const x = X(_);
    Math.hypot(_.clientX - g.x, _.clientY - g.y) > 4 && (g.moved = !0), I.x += g.start.x - x.x, I.y += g.start.y - x.y, M();
  }), e.addEventListener("pointerup", (_) => {
    if (!g) return;
    const x = g.moved;
    if (g = null, e.hasPointerCapture(_.pointerId) && e.releasePointerCapture(_.pointerId), !x) {
      const L = document.elementFromPoint(_.clientX, _.clientY)?.closest("[data-component]"), k = r?.components.find((S) => S.name === L?.dataset.component);
      k && (p = k.instanceId || "", v("selection").textContent = `${k.raw}
${Object.entries(k.terminals).map(([S, D]) => `${S} → ${D}`).join("   ")}`, k.kind === "X" ? (le(k.instanceId), Q()) : _e());
    }
  }), window.addEventListener("hashchange", () => {
    if (O) {
      w = !0;
      return;
    }
    H(), p = "", Q();
  }), v("collapse-all").onclick = () => {
    u.clear(), Q();
  }, v("expand-all").onclick = () => {
    for (const _ of Object.keys(a?.contexts || {})) _ && u.add(_);
    Q();
  }, v("toggle-instance").onclick = () => {
    u.has(p) ? u.delete(p) : le(p), Q();
  }, e.addEventListener("pointercancel", () => {
    g = null;
  }), e.addEventListener("keydown", (_) => {
    const x = _.target.closest("[data-instance]");
    if (x && (_.key === "Enter" || _.key === " ")) {
      _.preventDefault(), p = x.dataset.instance, le(p), Q();
      return;
    }
    _.key === "+" || _.key === "=" ? T(0.8) : _.key === "-" ? T(1.25) : _.key.toLowerCase() === "f" ? (I = { ...E }, M()) : _.key.startsWith("Arrow") && (_.preventDefault(), I.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[_.key] || 0) * I.w, I.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[_.key] || 0) * I.h, M());
  });
  async function Q() {
    if (O) return;
    O = !0, i = null, l = null, s = "", y(), v("generate").disabled = !0, n.readOnly = !0, v("file").disabled = !0, v("libraries").disabled = !0;
    for (const x of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) x.disabled = !0;
    t.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let _ = [];
    try {
      if (f !== n.value || !a) {
        if (h = lt(n.value, { files: N }), _ = [...h.diagnostics], _.some((R) => R.severity === "error"))
          throw a = null, Error("Fix the parser errors below before generating.");
        a = Ct(h), f && f !== n.value ? (u.clear(), d = "", p = "", history.replaceState(null, "", location.pathname + location.search)) : H(), f = n.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", n.value);
        } catch {
        }
      }
      if (_ = [...h.diagnostics], A(_), _.some((R) => R.severity === "error")) throw Error("Fix the parser errors below before generating.");
      r = Lt(a, { expanded: u, focus: d });
      const x = kt(r);
      b().conventional && _.push(...r.layout.diagnostics);
      const L = await Tt(x, b()), k = new DOMParser().parseFromString(L.svg, "image/svg+xml");
      if (k.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const S = k.documentElement, D = S.querySelector("#spice-layout-report");
      if (D) {
        r.layout.report = JSON.parse(D.textContent);
        const R = r.layout.report;
        _.push({ severity: "info", message: `Layout: compact signal flow; ${R.powerSourcesChecked} DC/ground symbols checked, ${R.powerOrderViolations} DC order preference(s) unmet. ${R.powerPass}. ${R.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), R.classicTemplateFallback && _.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), R.groundPlacement && _.push({ severity: "info", message: `Ground: ${R.groundPlacement}; ${R.straightenedGroundDrops || 0} return-path simplification(s).` }), R.explicitGroups && _.push({ severity: "info", message: `Layout comments: ${R.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), R.classicRails && _.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${R.railCount} shared voltage rails.` }), R.localClassicInstances?.length && _.push({ severity: "info", message: `${R.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), R.localClassicStages?.length && _.push({ severity: "info", message: `Classic transistor proximity active: ${R.localClassicStages.join(", ")}.` }), R.sharedClassicRails && _.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), R.mirroredTransistors?.length && _.push({ severity: "info", message: `Control pins face right where shorter: ${R.mirroredTransistors.join(", ")}.` }), R.sharedRailFallback && _.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${R.sharedRailFallback}.` });
        for (const U of R.localClassicFallbacks || []) U.stage && _.push({ severity: "info", message: `Classic stage ${U.stage} uses automatic layout: ${U.reason || "No unobstructed local template"}.` });
        R.geometricConnectivityVerified && _.push({ severity: "info", message: `Net geometry verified; ${R.cyclesRemoved} same-net loop(s) and ${R.leavesRemoved} unused wire branch(es) removed.` }), A(_);
      }
      if (S.localName !== "svg" || S.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const $ = Number(S.getAttribute("width")), Z = Number(S.getAttribute("height"));
      E = { x: -20, y: -20, w: $ + 40, h: Z + 40 }, I = { ...E }, S.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), S.setAttribute("width", String(E.w)), S.setAttribute("height", String(E.h)), S.setAttribute("role", "img"), S.setAttribute("aria-label", r.title || "SPICE schematic"), S.setAttribute("style", "background:white");
      for (const R of r.components) {
        const U = k.getElementById("cell_" + R.name);
        if (!U) throw Error("Renderer omitted component " + R.name);
        U.setAttribute("data-component", R.name), R.kind === "X" && (U.setAttribute("data-instance", R.instanceId), U.setAttribute("role", "button"), U.setAttribute("tabindex", "0"), U.setAttribute("aria-label", "Expand " + R.name));
        const W = k.createElementNS(S.namespaceURI, "title");
        W.textContent = R.raw + `
Resolved: ` + R.value + `
` + Object.entries(R.terminals).map(([G, ie]) => G + ": " + ie).join(", "), U.prepend(W);
      }
      for (const R of Object.values(r.nodes))
        for (const U of S.querySelectorAll(".net_" + R.bit)) {
          U.setAttribute("data-net", R.name);
          const W = k.createElementNS(S.namespaceURI, "title");
          W.textContent = "Node " + R.displayName, U.append(W);
        }
      const q = r.components.filter((R) => R.kind === "K").map((R) => ({ name: R.name, inductors: R.coupledInductors, value: R.value }));
      if (q.length) {
        const R = k.createElementNS(S.namespaceURI, "metadata");
        R.setAttribute("id", "spice-magnetic-couplings"), R.textContent = JSON.stringify(q), S.append(R);
        for (const U of q) for (const W of U.inductors) {
          const G = k.getElementById("cell_" + W);
          if (!G) continue;
          const ie = k.createElementNS(S.namespaceURI, "circle"), he = [...G.children].find((me) => me.getAttribute("s:pid") === "A"), Ve = he?.getAttribute("s:position"), ye = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Ve] || [0, 0];
          for (const [me, Qe] of Object.entries({ cx: Number(he?.getAttribute("s:x")) + ye[0], cy: Number(he?.getAttribute("s:y")) + ye[1], r: 3, fill: b().color, stroke: "none", "data-coupling": U.name })) ie.setAttribute(me, String(Qe));
          const Ce = k.createElementNS(S.namespaceURI, "title");
          Ce.textContent = U.name + " · dotted terminal: " + U.inductors.join(", "), ie.append(Ce), G.append(ie);
        }
      }
      i = L.drawing, s = new XMLSerializer().serializeToString(S), v("source").value = s, e.replaceChildren(document.importNode(S, !0)), M();
      const z = _.filter((R) => R.severity === "warning").length;
      t.textContent = `${r.components.filter((R) => !R.synthetic).length} components · ${Object.keys(r.nodes).length} nodes · ${r.topology.leafCount} primitive devices verified${z ? " · Review " + z + " warning(s); drawing may be partial." : " · Schematic ready."}`, r.layout?.report?.powerOrderViolations && (t.textContent += ` Layout: ${r.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), r.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (t.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const J = Object.values(r.nodes).map((R) => {
        const U = document.createElement("tr");
        for (const W of [R.displayName, R.terminals.map((G) => G.component + "." + G.pin).join(", ")]) {
          const G = document.createElement("td");
          G.textContent = W, U.append(G);
        }
        return U;
      });
      v("nets").replaceChildren(...J), v("json").value = JSON.stringify({ circuit: r, netlist: x, hierarchy: h }, null, 2), v("selection").textContent = "Click a component to inspect its original statement and pin connections.", we();
    } catch (x) {
      if (e.replaceChildren(), s = "", v("source").value = "", v("json").value = "", v("nets").replaceChildren(), v("selection").textContent = "", t.textContent = x.message, !a)
        v("hierarchy-panel").hidden = !0, v("selection-actions").hidden = !0, v("breadcrumbs").replaceChildren();
      else if (!a.contexts[d]) {
        const L = document.createElement("button");
        L.type = "button", L.textContent = "Return to Top", L.onclick = () => oe(""), v("breadcrumbs").replaceChildren(L);
      }
      x.diagnostics && (_ = x.diagnostics), _.some((L) => L.severity === "error") || _.push({ severity: "error", line: 0, message: x.message }), A(_);
    } finally {
      O = !1, v("generate").disabled = !1, n.readOnly = !1, v("file").disabled = !1, v("libraries").disabled = !1;
      for (const x of se.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) x.disabled = !1;
      a && a.contexts[d] && we(), e.setAttribute("aria-busy", "false"), y(), w && (w = !1, H(), queueMicrotask(Q));
    }
  }
  v("generate").onclick = Q;
  for (const _ of se.querySelectorAll("[data-example]")) _.onclick = () => {
    const x = de[_.dataset.example];
    n.value = x.source, P(), C(x), Q();
  };
  v("file").onchange = async (_) => {
    const x = _.target.files[0];
    if (x) {
      if (x.size > 2e6) {
        t.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        n.value = await Ae(x), P(), Q();
      } catch (L) {
        t.textContent = "File could not be read: " + L.message;
      } finally {
        _.target.value = "";
      }
    }
  }, v("libraries").onchange = async (_) => {
    try {
      for (const x of _.target.files) {
        if (x.size > 16e6) throw Error("Library exceeds 16 MB: " + x.name);
        N[x.webkitRelativePath || x.name] = await Ae(x);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(N));
      } catch {
      }
      a = null, f = "", v("library-status").textContent = Object.keys(N).length + " library file(s) loaded", Q();
    } catch (x) {
      t.textContent = x.message;
    } finally {
      _.target.value = "";
    }
  }, v("library-status").textContent = Object.keys(N).length ? "Libraries restored from this session." : "For .include / .lib dependencies", v("download").onclick = () => {
    const _ = URL.createObjectURL(new Blob([s], { type: "image/svg+xml;charset=utf-8" })), x = document.createElement("a");
    x.href = _, x.download = "spice-schematic.svg", x.click(), setTimeout(() => URL.revokeObjectURL(_), 1e3);
  };
  async function Ne(_) {
    const x = i;
    if (!(!x || O || c)) {
      c = !0, y(), t.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: L } = await import("./asc-export-G71qWLOI.js");
        if (i !== x) throw Error("Schematic changed. Generate again before exporting ASC.");
        l ||= L({ tree: a, circuit: r, drawing: x, source: n.value, libraries: N });
        const k = _ ? l.zip : l.ascBytes, S = URL.createObjectURL(new Blob([k], { type: _ ? "application/zip" : "application/octet-stream" })), D = document.createElement("a");
        D.href = S, D.download = _ ? "spice-schematic-asc.zip" : "spice-schematic.asc", D.click(), setTimeout(() => URL.revokeObjectURL(S), 1e3), t.textContent = "ASC connections verified · " + l.manifest.audit.symbols + " symbols. " + (_ ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), l.manifest.warnings.length && (t.textContent += " " + l.manifest.warnings.join(" "));
      } catch (L) {
        t.textContent = "ASC export failed: " + L.message;
        const k = document.createElement("li");
        k.className = "error", k.textContent = t.textContent, o.append(k);
      } finally {
        c = !1, y();
      }
    }
  }
  v("download-asc").onclick = () => Ne(!1), v("download-asc-bundle").onclick = () => Ne(!0), v("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(s), t.textContent = "SVG source copied to clipboard.";
    } catch {
      v("source-details").open = !0, v("source").focus(), v("source").select(), t.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, Q();
}
export {
  Se as b,
  ce as l,
  be as n,
  ft as p
};
