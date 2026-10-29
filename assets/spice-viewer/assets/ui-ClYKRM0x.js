const Ge = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, $e = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Fe = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, We = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, He = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Xe = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ze = { 1: "a", 2: "b", 7: "Q", 8: "com" }, qe = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ke = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ye = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Ze = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Je = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, et = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, tt = {
  AND: Ge,
  BUF: $e,
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
}, nt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", oe = (t) => t.toLowerCase(), ve = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), ot = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function rt(t, e) {
  const n = (w) => e[oe(w || "")] || Object.entries(e).find(([b]) => b.startsWith(oe(w || "") + "."))?.[1], r = t[0][0].toUpperCase();
  let o = [], d = [], l = "", s = "", c = [], a = [], p = 0, m = "", f = "", g = "", v = !0;
  if ("RLC".includes(r))
    o = ["A", "B"], s = oe(r) + "_v";
  else if ("DVIB".includes(r))
    o = ["+", "-"], s = r === "D" ? "d_v" : r === "B" ? "spice_b" : oe(r);
  else if (r === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !ve(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), l = t[o.length + 1] || "";
    const w = n(l)?.type;
    v = ["NPN", "PNP"].includes(w), s = v ? (o.length === 3 ? "q_" : "spice_q4_") + oe(w) : "spice_q" + o.length;
  } else if (r === "M") {
    const w = n(t[4]), b = n(t[5]), h = w?.type === "VDMOS" || !b && (!t[5] || ve(t[5]));
    o = h ? ["D", "G", "S"] : ["D", "G", "S", "B"], l = t[o.length + 1] || "";
    const y = n(l), C = y?.type;
    if (h && y && C !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!h && C === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    v = ["NMOS", "PMOS", "VDMOS"].includes(C);
    let N = null, i = y;
    const u = /* @__PURE__ */ new Set();
    for (; i && !u.has(i.name) && (u.add(i.name), N = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(i.raw), !N); )
      i = n(i.baseModel);
    const O = C === "PMOS" || C === "VDMOS" && N && (N[1] === void 0 || Number(N[1]) >= 0.5);
    s = v ? "spice_" + (O ? "pmos" : "nmos") + (h ? "3" : "") : "spice_m";
  } else if ("JZ".includes(r)) {
    l = t[4] || "";
    const w = n(l)?.type, b = r === "Z" && ["NIGBT", "PIGBT"].includes(w);
    o = b ? ["C", "G", "E"] : ["D", "G", "S"], v = r === "J" ? ["NJF", "PJF"].includes(w) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(w), s = "spice_" + (b ? "igbt" : r === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(w || "") ? "p" : "n");
  } else if ("EFGH".includes(r)) {
    o = ["+", "-"], s = "spice_" + oe(r);
    let w = 3, b = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[w] || "");
    if (/^poly$/i.test(t[w] || "") && (b = /^\(\s*(\d+)\s*\)$/.exec(t[++w] || ""), !b))
      throw Error("POLY requires a dimension.");
    if (b) {
      const h = Number(b[1]);
      if (h > 128) throw Error("POLY supports at most 128 controlling variables.");
      let y = w + 1, C = [];
      const N = "EG".includes(r), i = h * (N ? 2 : 1);
      for (; C.length < i && y < t.length; ) C.push(...ot(t[y++]));
      if (C.length !== i || y >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (N) {
        for (let u = 0; u < h; u++) o.push("C" + (u + 1) + "+", "C" + (u + 1) + "-");
        d = [t[1], t[2], ...C];
      } else c = C;
      p = y, m = "POLY(" + h + ") " + (N ? "" : C.join(" ") + " "), f = "POLY", N && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? f = "BEHAVIORAL" : "EG".includes(r) ? (o.push("C+", "C-"), f = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], p = 4, m = t[3] + " ");
    g = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[r] + (f ? " · " + f : "");
  } else if (r === "S")
    o = ["A", "B", "C+", "C-"], l = t[5] || "", s = "spice_device", g = "Voltage switch";
  else if (r === "W")
    o = ["A", "B"], c = [t[3]], l = t[4] || "", p = 3, s = "spice_device", g = "Current switch";
  else if ("TO".includes(r))
    o = ["L+", "L-", "R+", "R-"], r === "O" && (l = t[5] || ""), s = "spice_device", g = r === "T" ? "Transmission line" : "Lossy line";
  else if (r === "U")
    o = ["N1", "N2", "COM"], l = t[4] || "", s = "spice_device", g = "Distributed RC";
  else if (r === "A")
    o = Array.from({ length: 8 }, (w, b) => "P" + (b + 1)), s = "spice_device", g = t[9] || "A function";
  else if (r === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = t.slice(1, -1), a.some((w) => !/^L/i.test(w.split(":").at(-1)))) throw Error("K references must name inductors.");
    p = t.length - 1, s = "spice_coupling", g = "Magnetic coupling", m = a.join(" ") + " · k=";
  } else if (r === "@")
    o = ["IN", "OUT"], s = "spice_device", g = "FRA";
  else if (r === "&")
    o = ["O+", "O-", "I+", "I-"], s = "spice_device", g = "FRA probe";
  else if (r === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", g = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + r);
  if (p || (p = o.length + 1), d.length || (d = t.slice(1, o.length + 1)), d.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= p && !["&", "Ö"].includes(r)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (d.some((w) => /[=()]/.test(w) && !/^\{[\s\S]*\}$/.test(w))) throw Error("Invalid terminal token; check terminal count.");
  if (r === "B" && !/\b[VIPR]\s*=/i.test(t.slice(p).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (r === "B" && /^R\s*=/i.test(t.slice(p).join(" ")) && (s = "spice_br"), r === "D" && (l = t[3] || ""), r === "@") {
    const w = t.slice(p).join(" ");
    for (const b of w.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(b[1].toUpperCase()), d.push(b[2]);
  }
  if (r === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((w) => !w)) throw Error("Missing controlling voltage source.");
  const I = o.map((w, b) => r === "A" && tt[(t[9] || "").toUpperCase()]?.[String(b + 1)] || w);
  return { kind: r, pins: o, nodeTokens: d, pinLabels: I, model: l, type: s, controlSource: c[0] || "", controlSources: c, coupledInductors: a, value: m + t.slice(p).join(" "), sourceMode: f, symbol: g, polarityKnown: v };
}
const it = nt, st = new Set(it.split(" ")), be = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function pe(t) {
  const e = [], n = [];
  let r = "", o = 0, d = "";
  for (let l = 0; l < t.length; l++) {
    const s = t[l];
    if (d) {
      r += s, s === d && t[l - 1] !== "\\" && (d = "");
      continue;
    }
    if (s === '"' || s === "'") {
      d = s, r += s;
      continue;
    }
    if (!o && (s === ";" || s === "$" && (!l || /\s/.test(t[l - 1])))) break;
    if ("({".includes(s) && (n.push(s), o++), ")}".includes(s) && (o--, n.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !o ? (r && e.push(r), r = "") : r += s;
  }
  if (o || d) throw Error("Unclosed expression or quoted string.");
  return r && e.push(r), e;
}
function at(t, e = {}) {
  const n = [], r = [], o = [], d = Object.assign(be(), e.models), l = be(), s = (b, h, y) => n.push({ severity: b, line: h, message: y });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, h) => {
    const y = b.trim();
    !y || y.startsWith("*") || (y.startsWith("+") ? c.length ? c.at(-1).text += " " + y.slice(1).trim() : s("error", h + 1, "Continuation has no preceding statement.") : c.push({ line: h + 1, text: y }));
  });
  for (const b of c) {
    try {
      b.tokens = pe(b.text);
    } catch (y) {
      s("error", b.line, y.message), b.tokens = [];
    }
    const h = b.tokens;
    if (/^\.model$/i.test(h[0] || ""))
      if (h.length < 3) s("error", b.line, ".model requires a name and device type.");
      else {
        const y = /^ako:(.+)$/i.exec(h[2]), C = y && h[3] && !h[3].startsWith("(") ? h[3].split("(")[0].toUpperCase() : "";
        d[X(h[1])] = { name: h[1], type: y ? C : h[2].split("(")[0].toUpperCase(), baseModel: y?.[1] || "", raw: b.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function p(b) {
    const h = d[X(b)];
    if (!h) return "";
    if (h.type) return h.type;
    if (a.has(X(b))) throw Error("Circular AKO model inheritance: " + b);
    return a.add(X(b)), h.type = p(h.baseModel), a.delete(X(b)), h.type;
  }
  for (const b of Object.values(d)) if (b.baseModel && !b.type)
    try {
      p(b.name);
    } catch (h) {
      s("error", 0, h.message);
    }
  let m = "", f = 0, g = !1, v = !1;
  const I = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: b, text: h, tokens: y } of c) {
    if (!y.length) continue;
    const C = X(y[0]);
    if (v) {
      s("warning", b, "Statement after .end is not rendered: " + h);
      continue;
    }
    if (C === ".control") {
      g = !0, s("warning", b, ".control script retained but not executed or rendered.");
      continue;
    }
    if (C === ".endc") {
      g = !1;
      continue;
    }
    if (g) continue;
    if (C === ".subckt") {
      f++, s("error", b, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (C === ".ends") {
      f ? f-- : s("error", b, "Unmatched .ends.");
      continue;
    }
    if (f) continue;
    if (C === ".end") {
      v = !0;
      continue;
    }
    if (C.startsWith(".")) {
      r.push({ line: b, text: h }), C === ".title" ? m = y.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(C) ? s("error", b, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(C) ? s("error", b, "Topology-changing directive is unsupported: " + h) : w.has(C) || s("warning", b, "Directive retained but not resolved: " + h);
      continue;
    }
    const N = y[0][0].toUpperCase();
    if (!st.has(N)) {
      b === 1 && !/\d/.test(y[0]) && y.length > 1 && N !== "X" ? (m = h, s("warning", b, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", b, `Unsupported ${N} device was not rendered: ${h}`);
      continue;
    }
    const i = N === "M" || N === "Q" ? 5 : 4;
    if (b === 1 && !/\d/.test(y[0]) && (y.length < i || N === "T" && !/\b(?:zo|z0)\s*=/i.test(h))) {
      m = h, s("info", b, "SPICE title: " + h);
      continue;
    }
    try {
      if (I.has(C)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const u = rt(y, d), { pins: O, nodeTokens: T, ...L } = u;
      u.polarityKnown || s("warning", b, `${y[0]}: model polarity unknown; explicit ${O.join("/")} terminals retained.`);
      const P = be();
      O.forEach((Q, M) => {
        const D = X(T[M]);
        l[D] || (l[D] = { name: D, displayName: y[M + 1], bit: Object.keys(l).length + 2, terminals: [] }), l[D].terminals.push({ component: y[0], pin: Q }), P[Q] = D;
      }), o.push({ ...L, name: y[0], terminals: P, line: b, raw: h }), I.add(C);
    } catch (u) {
      s("error", b, `${y[0]}: ${u.message} Statement: ${h}`);
    }
  }
  f && s("error", 0, "Unclosed .subckt definition."), g && s("error", 0, "Unclosed .control block."), o.length || s("error", 0, "No supported components to render."), o.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const b of o) {
    for (const h of b.controlSources || []) !h.includes(":") && !o.some((y) => X(y.name) === X(h) && y.kind === "V") && s("error", b.line, `${b.name}: controlling voltage source ${h} was not found.`);
    for (const h of b.coupledInductors || []) !h.includes(":") && !o.some((y) => X(y.name) === X(h) && y.kind === "L") && s("error", b.line, `${b.name}: coupled inductor ${h} was not found.`);
    (b.kind === "B" || b.type === "spice_b") && s("info", b.line, `${b.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: o, nodes: l, models: d, directives: r, diagnostics: n };
}
const J = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), xe = (t) => J(t).split("/").at(-1);
function ct(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const r = new Map(e instanceof Map ? e : Object.entries(e)), o = [], d = [], l = [];
  let s = 0;
  const c = (p, m) => {
    const f = J(m).split("/").slice(0, -1).concat(J(p)).join("/"), g = [...r].filter(([I]) => J(I) === J(p) || J(I) === f);
    if (g.length === 1) return g[0];
    const v = [...r].filter(([I]) => xe(I) === xe(p));
    if (v.length !== 1) throw Error(v.length ? "Ambiguous library filename: " + p : "Missing library " + p + ". Add this file using Library files.");
    return v[0];
  };
  function a(p, m, f = "", g = []) {
    const v = J(m) + ":" + f.toLowerCase();
    if (g.includes(v)) throw Error("Circular library include: " + [...g, v].join(" → "));
    if (g.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const I = [], w = /^\s*\.endl\b/im.test(p);
    let b = !f;
    const h = (C, N) => {
      if (s += C.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      l.push(C), d.push({ file: m, line: N + 1 });
    };
    if (p.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((C, N) => {
      const i = C.trim();
      if (/^\.lib\b/i.test(i) && w) {
        const u = pe(i);
        if (u.length === 2 && !/[.\\/]/.test(u[1])) {
          I.push(u[1].toLowerCase()), u[1].toLowerCase() === f.toLowerCase() && (b = !0), h("* Library section " + u[1], N);
          return;
        }
      }
      if (/^\.endl\b/i.test(i)) {
        I.pop(), h("* End library section", N);
        return;
      }
      if (f && I.length && !I.includes(f.toLowerCase())) {
        h("* Unselected library section", N);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(i))
        try {
          const u = pe(i);
          if (!u[1]) throw Error("Include requires a filename.");
          const [O, T] = c(u[1], m);
          h("* Included " + O, N), a(T, O, u[2] || "", [...g, v]);
        } catch (u) {
          o.push({ severity: "error", line: N + 1, source: m, message: u.message }), h("* Unresolved include", N);
        }
      else h(C, N);
    }), !b) throw Error("Library section " + f + " not found in " + m);
  }
  try {
    a(t, n);
  } catch (p) {
    o.push({ severity: "error", line: 0, source: n, message: p.message });
  }
  return { source: l.join(`
`), origins: d, diagnostics: o };
}
function lt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), r = [0], o = [];
  t.split(/\r?\n/).forEach((s, c) => {
    const a = s.trim();
    /^\.subckt\b/i.test(a) && (r.push(c + 1), n.set(c + 1, [])), r.at(-1) ? n.get(r.at(-1)).push({ raw: s, line: c + 1 }) : e[c] = s, /^\.ends\b/i.test(a) && r.length > 1 && r.pop();
  });
  const d = Se(Array.from({ length: t.split(/\r?\n/).length }, (s, c) => e[c] || "").join(`
`));
  o.push(...d.diagnostics);
  const l = /* @__PURE__ */ new Map();
  for (const [s, c] of n) {
    const a = Se(c.map((p) => p.raw).join(`
`));
    l.set(s, a.layout), o.push(...a.diagnostics.map((p) => ({ ...p, line: c[p.line - 1]?.line || s })));
  }
  return { layout: d.layout, scopes: l, diagnostics: o };
}
function Se(t) {
  const e = [], n = [];
  let r = !1, o = !1, d = 0;
  if (t.split(/\r?\n/).forEach((w, b) => {
    const h = w.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(h)) {
      (o || r) && e.push({ severity: "error", line: b + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(h) || e.push({ severity: "error", line: b + 1, message: "Expected @layout begin v1." }), o = !0, r = !0, d = b + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(h)) {
      r || e.push({ severity: "error", line: b + 1, message: "Unexpected @layout end." }), r = !1;
      return;
    }
    r && (h.startsWith("*") ? n.push(h.slice(1).trim()) : e.push({ severity: "error", line: b + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), r && e.push({ severity: "error", line: d, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const l = n.join(" "), s = l.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], a = [];
  let p = 0, m = 0, f = 10;
  const g = () => s[p++], v = () => {
    const w = g();
    if (!w || !/^[A-Za-z_@][\w./%:@-]*$/.test(w)) throw Error("Expected layout identifier, got " + w);
    return w;
  };
  function I(w) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const b = w ? v() : "@row" + m++, h = g();
    if (!["row", "column", "classic"].includes(h)) throw Error("Expected row, column or classic.");
    if (g() !== "{") throw Error("Expected { after " + h);
    const y = { id: b, direction: h, members: [] };
    for (c.push(y); p < s.length && s[p] !== "}"; )
      s[p] === "group" ? (g(), y.members.push(I(!0))) : ["row", "column"].includes(s[p]) ? y.members.push(I(!1)) : y.members.push(v());
    if (g() !== "}") throw Error("Unclosed group " + b);
    if (!y.members.length) throw Error("Empty layout group " + b);
    return b;
  }
  try {
    for (; p < s.length; )
      if (s[p] === "group")
        g(), I(!0);
      else if (["row", "column"].includes(s[p])) I(!1);
      else if (s[p] === "priority-cap") {
        if (g(), f = Number(g()), !Number.isInteger(f) || f < 3 || f > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (g() === "place") {
        const u = v(), O = g(), T = v();
        if (!["left-of", "above"].includes(O)) throw Error("Expected left-of or above.");
        a.push({ a: u, relation: O, b: T });
      } else throw Error("Unknown layout instruction near " + s[p - 1]);
    const w = /* @__PURE__ */ new Set();
    for (const u of c) {
      const O = u.id.toLowerCase();
      if (w.has(O)) throw Error("Duplicate layout group " + u.id);
      w.add(O);
    }
    const b = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set(), y = new Map(c.map((u) => [u.id.toLowerCase(), u])), C = (u) => {
      if (b.has(u)) throw Error("Circular layout group " + u);
      if (!h.has(u)) {
        b.add(u);
        for (const O of y.get(u).members) y.has(O.toLowerCase()) && C(O.toLowerCase());
        b.delete(u), h.add(u);
      }
    };
    for (const u of y.keys()) C(u);
    const N = /* @__PURE__ */ new Map();
    for (const u of a) {
      if (u.a.toLowerCase() === u.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      N.has(u.a.toLowerCase()) || N.set(u.a.toLowerCase(), []), N.get(u.a.toLowerCase()).push(u.b.toLowerCase());
    }
    b.clear(), h.clear();
    const i = (u) => {
      if (b.has(u)) throw Error("Circular place constraints.");
      if (!h.has(u)) {
        b.add(u);
        for (const O of N.get(u) || []) i(O);
        b.delete(u), h.add(u);
      }
    };
    for (const u of N.keys()) i(u);
  } catch (w) {
    e.push({ severity: "error", line: d, message: "Layout description: " + w.message });
  }
  return { layout: { version: 1, priorityCap: f, groups: c, relations: a }, diagnostics: e };
}
function dt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let r = e.focus ? n : t.ir.layoutDescription;
  if (!r) return null;
  if (n) {
    const m = new Set(n.groups.map((g) => g.id.toLowerCase())), f = (g) => m.has(g.toLowerCase()) ? g : e.components.find((I) => I.synthetic && I.value.toLowerCase() === g.toLowerCase())?.name || e.focus + "/" + g;
    r = { ...n, groups: n.groups.map((g) => ({ ...g, members: g.members.map(f) })), relations: n.relations.map((g) => ({ ...g, a: f(g.a), b: f(g.b) })) };
  }
  const o = new Map(r.groups.map((m) => [m.id.toLowerCase(), m])), d = Object.values(t.contexts).flatMap((m) => m.devices.map((f) => f.name)), l = new Set([...Object.keys(t.contexts), ...d, ...e.components.map((m) => m.name)].map((m) => m.toLowerCase()));
  for (const m of o.values()) if (l.has((n ? e.focus + "/" + m.id : m.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + m.id);
  for (const m of o.values()) for (const f of m.members) if (!o.has(f.toLowerCase()) && !l.has(f.toLowerCase())) throw Error("Unknown @layout instance/device: " + f);
  for (const m of r.relations) for (const f of [m.a, m.b]) if (!o.has(f.toLowerCase()) && !l.has(f.toLowerCase())) throw Error("Unknown @layout place target: " + f);
  const s = /* @__PURE__ */ new Map(), c = [], a = new Set(Object.keys(t.contexts).map((m) => m.toLowerCase()));
  for (const m of r.groups) {
    const f = [];
    for (const g of m.members) {
      if (o.has(g.toLowerCase())) {
        f.push({ group: g });
        continue;
      }
      for (const v of e.components) if (v.name.toLowerCase() === g.toLowerCase() || v.name.toLowerCase().startsWith(g.toLowerCase() + "/")) {
        if (s.has(v.name)) throw Error("Overlapping @layout membership: " + v.name);
        s.set(v.name, m.id), f.push({ cell: v.name, ...a.has(g.toLowerCase()) ? { instance: g } : {} });
      }
    }
    c.push({ id: m.id, direction: m.direction, members: f });
  }
  const p = /* @__PURE__ */ new Set();
  for (const m of c) for (const f of m.members) if (f.group) {
    const g = f.group.toLowerCase();
    if (p.has(g)) throw Error("Layout group has multiple parents: " + f.group);
    p.add(g);
  }
  return { version: 1, priorityCap: r.priorityCap, groups: c, relations: r.relations };
}
const ie = () => /* @__PURE__ */ Object.create(null), W = (t) => t.toLowerCase();
function Me(t) {
  const e = ie();
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    if (/^params?:$/i.test(r)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(r);
    if (!o) throw Error("Expected named parameter assignment, got: " + r);
    const d = W(o[1]);
    let l = o[2];
    if (l === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!s) throw Error("Expected = after parameter " + d);
      l = s[1];
    }
    if (l || (l = t[++n]), !l || /^params?:$/i.test(l)) throw Error("Missing value for parameter " + d);
    if (Object.hasOwn(e, d)) throw Error("Duplicate parameter: " + d);
    e[d] = l;
  }
  return e;
}
function Re(t) {
  const e = t.findIndex((n, r) => /^params?:$/i.test(n) || n.includes("=") || t[r + 1] === "=");
  return e < 0 ? [t, ie()] : [t.slice(0, e), Me(t.slice(e))];
}
function ut(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = ct(t, e);
  t = n.source;
  const r = lt(t), o = [...n.diagnostics, ...r.diagnostics], d = ie(), l = /* @__PURE__ */ new Set(["0"]), s = (h, y, C) => o.push({ severity: h, line: y, message: C }), c = (h, y, C, N = [], i = ie(), u = 0) => {
    const O = { id: h, name: y, parent: C, ports: N, defaults: i, parameters: ie(), definitions: ie(), devices: [], instances: [], directives: [], line: u, statements: [], layoutDescription: r.scopes.get(u) || null };
    return d[h] = O, O;
  }, a = c("root", "Top", null), p = [a], m = [];
  let f = !1, g = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((h, y) => {
    const C = h.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? m.length ? m.at(-1).text += " " + C.slice(1).trim() : s("error", y + 1, "Continuation has no preceding statement.") : m.push({ text: C, line: y + 1 }));
  });
  for (const { text: h, line: y } of m)
    try {
      const C = pe(h);
      if (!C.length) continue;
      const N = W(C[0]), i = p.at(-1);
      if (g) {
        s("warning", y, "Statement after .end is not rendered: " + h);
        continue;
      }
      if (N === ".control") {
        f = !0, s("warning", y, ".control script retained but not executed or rendered.");
        continue;
      }
      if (N === ".endc") {
        f = !1;
        continue;
      }
      if (f) continue;
      if (N === ".subckt") {
        if (C.length < 2) throw Error(".SUBCKT requires a name.");
        const [u, O] = Re(C.slice(2)), T = W(C[1]);
        if (Object.hasOwn(i.definitions, T)) throw Error("Duplicate subcircuit definition: " + C[1]);
        const L = u.map(W);
        if (new Set(L).size !== u.length || L.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (u.some((Q) => /[{}()=]/.test(Q))) throw Error("Invalid formal port.");
        if (p.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const P = i.id + "/" + encodeURIComponent(T);
        i.definitions[T] = P, p.push(c(P, C[1], i.id, u, O, y));
        continue;
      }
      if (N === ".ends") {
        if (p.length === 1) throw Error("Unmatched .ENDS.");
        if (C[1] && W(C[1]) !== W(i.name)) throw Error(".ENDS name does not match " + i.name);
        p.pop();
        continue;
      }
      if (N === ".end") {
        if (p.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        g = !0;
        continue;
      }
      if (N === ".param") {
        const u = Me(C.slice(1));
        for (const [O, T] of Object.entries(u)) {
          if (Object.hasOwn(i.parameters, O)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + O);
          i.parameters[O] = T;
        }
      }
      if (N === ".global") {
        if (C.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const u of C.slice(1)) l.add(W(u));
      }
      if (N.startsWith(".") && i.directives.push({ line: y, text: h }), N.startsWith("x")) {
        const [u, O] = Re(C.slice(1));
        if (!u.length) throw Error("X instance requires a subcircuit name.");
        const T = /;§pnba\s+(.+)$/i.exec(h)?.[1].split(")");
        i.instances.push({ name: C[0], nodes: u.slice(0, -1).map(W), definitionName: u.at(-1), definitionId: null, parameters: O, line: y, raw: h, pinNames: T });
      } else i.statements.push({ line: y, text: h });
    } catch (C) {
      s("error", y, C.message + " Statement: " + h);
    }
  p.length > 1 && s("error", p.at(-1).line, "Unclosed .SUBCKT " + p.at(-1).name), f && s("error", 0, "Unclosed .control block.");
  function v(h, y) {
    for (; h; ) {
      if (Object.hasOwn(h.definitions, W(y))) return h.definitions[W(y)];
      h = d[h.parent];
    }
    return null;
  }
  for (const h of Object.values(d)) {
    const y = [...h.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...h.statements], C = at(y.map((i) => i.text).join(`
`), { models: d[h.parent]?.models });
    h.devices = C.components.map((i) => ({ ...i, line: y[i.line - 1]?.line || h.line })), h.models = C.models, h === a && (a.title = C.title), o.push(...C.diagnostics.filter((i) => !i.message.includes("No supported components to render.") && !i.message.includes("300 components")).map((i) => ({ ...i, line: y[i.line - 1]?.line || h.line })));
    const N = new Set(h.devices.map((i) => W(i.name)));
    for (const i of h.instances)
      if (N.has(W(i.name)) && s("error", i.line, "Duplicate instance/device name: " + i.name), N.add(W(i.name)), i.definitionId = v(h, i.definitionName), !i.definitionId && !/^\{[\s\S]*\}$/.test(i.definitionName)) s("error", i.line, "Undefined subcircuit: " + i.definitionName + " in " + i.name);
      else if (i.definitionId) {
        const u = d[i.definitionId];
        u.ports.length !== i.nodes.length && s("error", i.line, `${i.name}: ${u.name} expects ${u.ports.length} ports; got ${i.nodes.length}.`);
      }
  }
  for (const h of Object.values(d)) delete h.statements;
  const I = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set();
  function b(h, y = []) {
    if (I.has(h)) {
      s("error", d[h].line, "Circular subcircuit reference: " + [...y, d[h].name].join(" → "));
      return;
    }
    if (!w.has(h)) {
      if (I.add(h), y.length >= 64) {
        s("error", d[h].line, "Subcircuit dependency nesting exceeds 64 levels."), I.delete(h), w.add(h);
        return;
      }
      for (const C of d[h].instances) C.definitionId && b(C.definitionId, [...y, d[h].name]);
      I.delete(h), w.add(h);
    }
  }
  for (const h of Object.keys(d)) b(h);
  !a.devices.length && !a.instances.length && s("error", 0, "No supported components or instances to render.");
  for (const h of o) !h.source && h.line && n.origins[h.line - 1] && (h.source = n.origins[h.line - 1].file, h.line = n.origins[h.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: d, globals: [...l], diagnostics: o, layoutDescription: r.layout };
}
const j = () => /* @__PURE__ */ Object.create(null), re = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), Ee = (t, e) => re(t.map((n) => n.toLowerCase()), e.toLowerCase());
function ft(t, e = []) {
  const n = j(), r = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((d) => decodeURIComponent(d)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [d, l] of Object.entries(o.terminals)) r(l).terminals.push({ component: o.name, pin: d });
  for (const o of e) r(o);
  return n;
}
function pt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Le = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, ht = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function he(t, e, n = (o) => o, r = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (l) => (o.push(l), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (l, s, c) => {
    const a = c.split(",").map((m) => m.trim());
    if (a.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + l);
    const p = s.toUpperCase() + "(" + a.map((m) => s.toLowerCase() === "v" ? n(m) : r(m, s)).join(",") + ")";
    return o.push(p), "@@" + (o.length - 1) + "@@";
  });
  let d = t.length;
  return t = t.replace(ht, (l, s, c) => {
    if (c.slice(s + l.length).trimStart().startsWith("(")) return l;
    const a = e(l.toLowerCase());
    if (a === void 0) return l;
    if (d += a.length + 2, d > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), t.replace(/@@(\d+)@@/g, (l, s) => o[Number(s)]);
}
function mt(t, e, n, r) {
  const o = { ...e, ...n }, d = j(), l = /* @__PURE__ */ new Set(), s = j();
  for (const [a, p] of Object.entries(r)) s[a] = he(Le(p), (m) => t[m]);
  function c(a) {
    if (Object.hasOwn(s, a)) return s[a];
    if (Object.hasOwn(d, a)) return d[a];
    if (!Object.hasOwn(o, a)) return t[a];
    if (l.has(a)) {
      if (Object.hasOwn(t, a)) return t[a];
      throw Error("Circular parameter dependency: " + [...l, a].join(" → "));
    }
    return l.add(a), d[a] = he(Le(o[a]), c), l.delete(a), d[a];
  }
  for (const a of Object.keys(o)) c(a);
  return Object.assign(j(), t, d, s);
}
function ke(t, e, n, r) {
  let o = "";
  for (let c = 0; c < t.length; ) {
    const a = t[c];
    if (a !== "{" && a !== "'") {
      o += a, c++;
      continue;
    }
    const p = c++;
    let m = 1, f = "";
    for (; c < t.length && m; c++) {
      if (a === "'") {
        t[c] === "'" && (m = 0);
        continue;
      }
      if (f) {
        t[c] === f && (f = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        f = t[c];
        continue;
      }
      t[c] === "{" && m++, t[c] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    o += a + he(t.slice(p + 1, c - 1), (g) => e[g], n, r) + (a === "{" ? "}" : "'");
  }
  const d = [];
  let l = 0, s = "";
  for (let c = 0; c < o.length; c++) {
    const a = o[c];
    if (s) {
      a === s && o[c - 1] !== "\\" && (s = "");
      continue;
    }
    if (a === '"' || a === "'") {
      s = a;
      continue;
    }
    if ("({".includes(a) && l++, ")}".includes(a) && l--, !l && (c === 0 || /\s/.test(o[c - 1]))) {
      const p = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(c));
      p && (d.push({ start: c, end: c + p[0].length, key: p[1].toLowerCase() }), c += p[0].length - 1);
    }
  }
  if (d.length) {
    let c = o.slice(0, d[0].start);
    d.forEach((a, p) => {
      const m = d[p + 1]?.start ?? o.length, f = o.slice(a.end, m);
      c += o.slice(a.start, a.end) + (f.includes("{") || ["refnode", "intnode"].includes(a.key) ? f : he(f, (g) => e[g], n, r));
    }), o = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
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
  add(e, n, r) {
    if (typeof arguments[0] != "string")
      for (let o in arguments[0])
        this.add(o, arguments[0][o], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(o) {
        this[o] = this[o] || [], n && this[o][r ? "unshift" : "push"](n);
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
    this[e] = this[e] || [], this[e].forEach(function(r) {
      r.call(n && n.context ? n.context : n, n);
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
class E {
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
    return "JavaScript Expression Parser (JSEP) v" + E.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return E.max_unop_len = Math.max(e.length, E.max_unop_len), E.unary_ops[e] = 1, E;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, r) {
    return E.max_binop_len = Math.max(e.length, E.max_binop_len), E.binary_ops[e] = n, r ? E.right_associative.add(e) : E.right_associative.delete(e), E;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return E.additional_identifier_chars.add(e), E;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return E.literals[e] = n, E;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete E.unary_ops[e], e.length === E.max_unop_len && (E.max_unop_len = E.getMaxKeyLen(E.unary_ops)), E;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return E.unary_ops = {}, E.max_unop_len = 0, E;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return E.additional_identifier_chars.delete(e), E;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete E.binary_ops[e], e.length === E.max_binop_len && (E.max_binop_len = E.getMaxKeyLen(E.binary_ops)), E.right_associative.delete(e), E;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return E.binary_ops = {}, E.max_binop_len = 0, E;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete E.literals[e], E;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return E.literals = {}, E;
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
    return new E(e).parse();
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
    return E.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !E.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    E.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return E.isIdentifierStart(e) || E.isDecimalDigit(e);
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
    if (E.hooks[e]) {
      const r = { context: this, node: n };
      return E.hooks.run(e, r), r.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (E.hooks[e]) {
      const n = { context: this };
      return E.hooks[e].find(function(r) {
        return r.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === E.SPACE_CODE || e === E.TAB_CODE || e === E.LF_CODE || e === E.CR_CODE; )
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
      type: E.COMPOUND,
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
    let n = [], r, o;
    for (; this.index < this.expr.length; )
      if (r = this.code, r === E.SEMCOL_CODE || r === E.COMMA_CODE)
        this.index++;
      else if (o = this.gobbleExpression())
        n.push(o);
      else if (this.index < this.expr.length) {
        if (r === e)
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
    let e = this.expr.substr(this.index, E.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (E.binary_ops.hasOwnProperty(e) && (!E.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !E.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, r, o, d, l, s, c, a;
    if (l = this.gobbleToken(), !l || (n = this.gobbleBinaryOp(), !n))
      return l;
    for (d = { value: n, prec: E.binaryPrecedence(n), right_a: E.right_associative.has(n) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + n), o = [l, d, s]; n = this.gobbleBinaryOp(); ) {
      if (r = E.binaryPrecedence(n), r === 0) {
        this.index -= n.length;
        break;
      }
      d = { value: n, prec: r, right_a: E.right_associative.has(n) }, a = n;
      const p = (m) => d.right_a && m.right_a ? r > m.prec : r <= m.prec;
      for (; o.length > 2 && p(o[o.length - 2]); )
        s = o.pop(), n = o.pop().value, l = o.pop(), e = {
          type: E.BINARY_EXP,
          operator: n,
          left: l,
          right: s
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), o.push(d, e);
    }
    for (c = o.length - 1, e = o[c]; c > 1; )
      e = {
        type: E.BINARY_EXP,
        operator: o[c - 1].value,
        left: o[c - 2],
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
    let e, n, r, o;
    if (this.gobbleSpaces(), o = this.searchHook("gobble-token"), o)
      return this.runHook("after-token", o);
    if (e = this.code, E.isDecimalDigit(e) || e === E.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === E.SQUOTE_CODE || e === E.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === E.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, E.max_unop_len), r = n.length; r > 0; ) {
        if (E.unary_ops.hasOwnProperty(n) && (!E.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !E.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += r;
          const d = this.gobbleToken();
          return d || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: E.UNARY_EXP,
            operator: n,
            argument: d,
            prefix: !0
          });
        }
        n = n.substr(0, --r);
      }
      E.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), E.literals.hasOwnProperty(o.name) ? o = {
        type: E.LITERAL,
        value: E.literals[o.name],
        raw: o.name
      } : o.name === E.this_str && (o = { type: E.THIS_EXP })) : e === E.OPAREN_CODE && (o = this.gobbleGroup());
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
    for (; n === E.PERIOD_CODE || n === E.OBRACK_CODE || n === E.OPAREN_CODE || n === E.QUMARK_CODE; ) {
      let r;
      if (n === E.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== E.PERIOD_CODE)
          break;
        r = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === E.OBRACK_CODE ? (e = {
        type: E.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== E.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === E.OPAREN_CODE ? e = {
        type: E.CALL_EXP,
        arguments: this.gobbleArguments(E.CPAREN_CODE),
        callee: e
      } : (n === E.PERIOD_CODE || r) && (r && this.index--, this.gobbleSpaces(), e = {
        type: E.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), r && (e.optional = !0), this.gobbleSpaces(), n = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", n, r;
    for (; E.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === E.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); E.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); E.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      E.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return r = this.code, E.isIdentifierStart(r) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (r === E.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === E.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: E.LITERAL,
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
    const n = this.index, r = this.expr.charAt(this.index++);
    let o = !1;
    for (; this.index < this.expr.length; ) {
      let d = this.expr.charAt(this.index++);
      if (d === r) {
        o = !0;
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
    return o || this.throwError('Unclosed quote after "' + e + '"'), {
      type: E.LITERAL,
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
    for (E.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, E.isIdentifierPart(e)); )
      this.index++;
    return {
      type: E.IDENTIFIER,
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
    let r = !1, o = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let d = this.code;
      if (d === e) {
        r = !0, this.index++, e === E.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (d === E.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === E.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === E.CBRACK_CODE)
            for (let l = n.length; l < o; l++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const l = this.gobbleExpression();
        (!l || l.type === E.COMPOUND) && this.throwError("Expected comma"), n.push(l);
      }
    }
    return r || this.throwError("Expected " + String.fromCharCode(e)), n;
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
    let e = this.gobbleExpressions(E.CPAREN_CODE);
    if (this.code === E.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: E.SEQUENCE_EXP,
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
      type: E.ARRAY_EXP,
      elements: this.gobbleArguments(E.CBRACK_CODE)
    };
  }
}
const Et = new gt();
Object.assign(E, {
  hooks: Et,
  plugins: new bt(E),
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
E.max_unop_len = E.getMaxKeyLen(E.unary_ops);
E.max_binop_len = E.getMaxKeyLen(E.binary_ops);
const se = (t) => new E(t).parse(), wt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(E).filter((t) => !wt.includes(t) && se[t] === void 0).forEach((t) => {
  se[t] = E[t];
});
se.Jsep = E;
const _t = "ConditionalExpression";
var yt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), n.node = {
            type: _t,
            test: r,
            consequent: o,
            alternate: d
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let l = r;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(yt);
const Nt = "ConditionalExpression";
var Ct = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), n.node = {
            type: Nt,
            test: r,
            consequent: o,
            alternate: d
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let l = r;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(Ct);
const It = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Pe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, F = (t) => Number(t) > 0.5;
function le(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let r = 0;
  function o(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, a, p, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), f = p.toLowerCase(), g = f.startsWith("meg") ? 1e6 : f.startsWith("mil") ? 254e-7 : It[f[0]] || 1;
      return "(" + (m ? +(a + (a.includes(".") ? "" : ".") + m) : Number(a)) * g + ")";
    }), d(se(s));
  }
  function d(s) {
    if (++r > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const c = s.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + s.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const a = o(e[c]);
      return n.delete(c), a;
    }
    if (s.type === "ConditionalExpression") return F(d(s.test)) ? d(s.consequent) : d(s.alternate);
    if (s.type === "UnaryExpression") {
      const c = d(s.argument);
      if (s.operator === "-") return -c;
      if (s.operator === "+") return +c;
      if (s.operator === "!" || s.operator === "~") return !F(c);
    }
    if (s.type === "BinaryExpression") {
      const c = d(s.left);
      if (s.operator === "&&") return F(c) && F(d(s.right));
      if (s.operator === "||") return F(c) || F(d(s.right));
      const a = d(s.right);
      switch (s.operator) {
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
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const c = s.callee.name.toLowerCase();
      if (c === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return F(d(s.arguments[0])) ? d(s.arguments[1]) : d(s.arguments[2]);
      }
      if (Object.hasOwn(Pe, c)) return Pe[c](...s.arguments.map(d));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const l = o(t);
  if (typeof l == "number" && !Number.isFinite(l)) throw Error("Structural expression is not finite.");
  return l;
}
function Ot(t) {
  pt(t);
  const e = j(), n = /* @__PURE__ */ new Map();
  let r = 0, o = 0;
  function d(l, s, c, a, p, m, f) {
    if (s.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const g = t.scopes[l], v = s.length ? re(s.slice(0, -1), s.at(-1)) : "", I = j();
    if (f.some((N) => N.scopeId === l)) throw Error("Circular subcircuit reference at " + v);
    const w = mt(a, g.defaults, g.parameters, p);
    function b(N) {
      if (/^\{[\s\S]*\}$/.test(N)) {
        const u = le(N, w);
        N = String(typeof u == "boolean" ? Number(u) : u);
      }
      /^"[\s\S]*"$/.test(N) && (N = N.slice(1, -1));
      const i = N.toLowerCase();
      return Object.hasOwn(c, i) ? c[i] : t.globals.includes(i) ? Ee([], i) : I[i] || (I[i] = Ee(s, i));
    }
    const h = { id: v, path: s, scopeId: l, name: m?.name || "Top", definition: g.name, ports: g.ports.map((N) => ({ name: N, node: b(N) })), params: w, nodes: I, models: j(), devices: [], children: [], raw: m?.raw || "", line: m?.line || 0 };
    e[v] = h, n.set(v, b);
    const y = [...f, h];
    function C(N) {
      if (!N) return "";
      let i = g;
      for (; i; ) {
        if (i.directives.some((u) => new RegExp("^\\.model\\s+" + N.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(u.text))) {
          const u = [...y].reverse().find((O) => O.scopeId === i.id);
          return re(u?.path || [], N.toLowerCase());
        }
        i = t.scopes[i.parent];
      }
      return N;
    }
    for (const N of g.directives.filter((i) => /^\.model\b/i.test(i.text))) {
      const i = /^\.model\s+(\S+)/i.exec(N.text)?.[1];
      if (!i) continue;
      const u = C(i), O = g.models[i.toLowerCase()], T = ke(N.text, w, b, (L) => re(s, L));
      h.models[u] = { ...O, name: u, raw: T.replace(/^(\.model\s+)\S+/i, (L, P) => P + u), instanceId: v, parameters: w };
    }
    for (const N of g.devices) {
      if (++o > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const i = j();
      for (const [O, T] of Object.entries(N.terminals)) i[O] = b(T);
      const u = C(N.model);
      h.devices.push({ ...N, name: re(s, N.name), localName: N.name, instanceId: v, terminals: i, model: u, parameters: w });
    }
    for (const N of g.instances) {
      let i = N.definitionId;
      if (!i) {
        const L = String(le(N.definitionName, w)).toLowerCase();
        let P = g;
        for (; P && !i; )
          i = P.definitions[L], P = t.scopes[P.parent];
        if (!i) throw Error("Undefined selected subcircuit: " + L);
      }
      const u = t.scopes[i], O = j();
      if (u.ports.length !== N.nodes.length) throw Error(N.name + ": expected " + u.ports.length + " ports; got " + N.nodes.length);
      u.ports.forEach((L, P) => {
        O[L.toLowerCase()] = b(N.nodes[P]);
      });
      const T = d(i, [...s, N.name], O, w, N.parameters, N, y);
      N.pinNames?.length === T.ports.length && T.ports.forEach((L, P) => {
        L.label = N.pinNames[P];
      }), h.children.push(T);
    }
    return h;
  }
  try {
    let p = function(m, f) {
      const g = f.split(":");
      if (g.length === 1) return { owner: m, name: f };
      const v = g.pop();
      for (const I of [[...m.path, ...g], g]) {
        const w = s.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: v };
      }
      throw Error("Unknown hierarchical reference: " + f);
    };
    const l = d(t.rootId, [], j(), j(), j(), null, []), s = new Map(Object.values(e).map((m) => [m.id.toLowerCase(), m])), c = Object.assign(j(), ...Object.values(e).map((m) => m.models)), a = (m) => c[m] || Object.entries(c).find(([f]) => f.startsWith(m + "."))?.[1];
    for (const m of Object.values(e)) for (const f of m.devices) {
      const g = t.scopes[m.scopeId].devices.find((w) => w.name === f.localName), v = (w) => {
        const b = p(m, w);
        return n.get(b.owner.id)(b.name);
      }, I = (w, b = "", h = "") => {
        const y = p(m, w), C = y.owner.devices.find((N) => N.localName.toLowerCase() === y.name.toLowerCase());
        if (b.toLowerCase() === "ix") {
          const N = y.owner.ports.find((i, u) => i.name.toLowerCase() === y.name.toLowerCase() || String(u + 1) === y.name);
          if (N) return y.owner.id + ":" + N.name;
        }
        if (!C) {
          if (h) throw Error(f.name + ": referenced " + h + " device " + w + " was not found.");
          return re(y.owner.path, y.name);
        }
        if (h && C.kind !== h) throw Error(f.name + ": " + w + " must be a " + h + " device.");
        return C.name;
      };
      if (f.value = ke(g.value, m.params, v, I), g.model && (f.value = f.value.replace(g.model, f.model)), f.kind === "M" && Object.keys(f.terminals).length === 3) {
        let w = a(f.model), b = !1;
        const h = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !h.has(w.name); ) {
          h.add(w.name);
          const y = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (y) {
            b = y[1] === void 0 || Number(le(y[1], w.parameters)) >= 0.5;
            break;
          }
          const C = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = a(C + (w.baseModel || "").toLowerCase()) || a((w.baseModel || "").toLowerCase());
        }
        h.size && (f.type = "spice_" + (b ? "pmos3" : "nmos3"));
      }
      f.controlSources = (g.controlSources || []).map((w) => I(w, "", "V")), f.controlSource = f.controlSources[0] || "", f.coupledInductors = (g.coupledInductors || []).map((w) => I(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...g.controlSources || [], ...g.coupledInductors || []])) {
        const b = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        f.value = f.value.replace(new RegExp("(?<![\\w./%])" + b + "(?![\\w.$])", "g"), () => I(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: l, contexts: e };
  } catch (l) {
    throw l.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: l.message }], l;
  }
}
function de(t) {
  return [...t.devices, ...t.children.flatMap(de)];
}
function Ae(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function De(t, e = {}) {
  const n = new Map(t.components.map((i) => [i.name, i])), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), d = [], l = (i, u) => JSON.stringify([i, u].sort()), s = (i) => e[i]?.potential !== null && e[i]?.potential !== void 0;
  for (const i of t.components) {
    for (const [M, D] of Object.entries(i.terminals))
      r.has(D) || r.set(D, []), r.get(D).push({ device: i.name, pin: M });
    if (i.kind === "R") {
      const M = Object.values(i.terminals);
      if (M.length === 2 && M[0] !== M[1]) {
        const D = l(...M);
        o.has(D) || o.set(D, []), o.get(D).push(i);
      }
    }
    const u = i.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(i.kind) ? "fet" : null, O = u === "bjt" ? /_(npn|pnp)$/.exec(i.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(i.type)?.[1];
    if (!u || !O) continue;
    const T = i.terminals, L = T[u === "bjt" ? "B" : "G"], P = T[u === "bjt" ? "C" : "D"], Q = T[u === "bjt" ? "E" : "S"];
    [L, P, Q].some((M) => M === void 0) || L === Q || P === Q || d.push({ id: i.name, family: u, polarity: O, control: L, drain: P, source: Q, body: i.kind === "M" ? T.B : void 0 });
  }
  const c = [], a = /* @__PURE__ */ new Set(), p = (i, u, O, T, L, P = "basic", Q = [], M = "high") => {
    const D = [.../* @__PURE__ */ new Set([...u, ...Q])], $ = JSON.stringify([i, P, [...D].sort()]);
    a.has($) || (a.add($), c.push({ id: "motif" + c.length, kind: i, variant: P, transistors: u, members: D, roles: O, nets: T, evidence: L, confidence: M }));
  }, m = (i, u) => i.family === u.family && i.polarity === u.polarity, f = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), I = new Map(d.map((i) => [i.id, i])), w = (i, u, O) => {
    i.has(u) || i.set(u, []), i.get(u).push(O);
  }, b = (i, u) => JSON.stringify([i.family, i.polarity, u]);
  for (const i of d)
    w(f, b(i, i.control), i), w(g, b(i, i.source), i), i.family === "bjt" && (r.get(i.source) || []).some((u) => {
      const O = I.get(u.device);
      return O && O.family === "bjt" && !m(i, O) && O.source === i.source;
    }) && w(v, b(i, i.drain), i);
  const h = (i) => [{ node: i.source, resistor: null }, ...(r.get(i.source) || []).flatMap((u) => {
    const O = n.get(u.device);
    if (O.kind !== "R") return [];
    const T = Object.values(O.terminals).find((L) => L !== i.source);
    return T !== void 0 && T !== i.control && T !== i.drain ? [{ node: T, resistor: O.name }] : [];
  })];
  for (const i of d) i.control === i.drain && p("diode-connected", [i.id], { reference: i.id }, { control: i.control, return: i.source }, ["control-drain-short", i.family]);
  for (const i of d) {
    const u = f.get(b(i, i.control));
    if (u.filter((M) => M.control === M.drain).length > 1) continue;
    let O = null;
    if (i.control !== i.drain && i.family === "bjt" && (O = (f.get(b(i, i.drain)) || []).find((M) => M.id !== i.id && m(M, i) && M.control === i.drain && M.source === i.control && s(M.drain))), i.control !== i.drain && !O) continue;
    const T = h(i), L = [];
    let P = null, Q = [];
    for (const M of u) {
      if (M.id === i.id || M.id === O?.id || M.drain === i.drain || M.drain === M.control) continue;
      const D = T.flatMap(($) => h(M).filter((ee) => $.node === ee.node).map((ee) => ({ node: $.node, rs: [$.resistor, ee.resistor].filter(Boolean) }))).find(($) => P === null || $.node === P);
      D && (P = D.node, L.push(M.id), Q.push(...D.rs));
    }
    if (L.length) {
      const M = L.every((D) => I.get(D).body === i.body);
      p("current-mirror", [i.id, ...L, ...O ? [O.id] : []], { reference: i.id, outputs: L, ...O ? { helper: O.id } : {} }, { control: i.control, return: P }, ["same-polarity", "shared-control", O ? "emitter-follower-reference" : "diode-reference", Q.length ? "resistive-common-return" : "shared-return", M ? "compatible-bodies" : "different-body-connections"], O ? "assisted" : Q.length ? "degenerated" : "basic", [...Q, ...O ? [O.id] : []], M ? "high" : "medium");
    }
  }
  const y = [], C = /* @__PURE__ */ new Set(), N = (i, u) => {
    const O = JSON.stringify([i.id, u.id].sort());
    C.has(O) || (C.add(O), y.push([i, u]));
  };
  for (const i of g.values()) if (!s(i[0].source)) {
    const u = i.filter((O) => O.control !== O.drain);
    u.length === 2 ? N(...u) : u.length > 2 && new Set(u.map((O) => O.control)).size > 1 && p("differential-pair", u.map((O) => O.id), { inputs: u.map((O) => O.id) }, { tail: u[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const i of v.values()) for (let u = 0; u < i.length; u++) for (let O = u + 1; O < i.length; O++) N(i[u], i[O]);
  for (const [i, u] of y) {
    if (i.control === u.control || i.control === i.drain || u.control === u.drain) continue;
    if (i.source === u.source && i.drain !== u.drain && !s(i.source)) {
      const L = (r.get(i.source) || []).some((Q) => Q.device !== i.id && Q.device !== u.id), P = g.get(b(i, i.source)).length === 2;
      p("differential-pair", [i.id, u.id], { inputs: [i.id, u.id] }, { tail: i.source }, ["same-polarity", "distinct-controls", "shared-tail", L ? "tail-bias-connection" : "unbiased-tail", P ? "two-input-tail" : "multi-input-tail"], "basic", [], L && P && i.body === u.body ? "high" : "medium");
    }
    if (i.family !== "bjt" || i.drain !== u.drain || i.source === u.source) continue;
    const O = d.filter((L) => L.family === "bjt" && L.polarity !== i.polarity && L.source === i.source), T = d.filter((L) => L.family === "bjt" && L.polarity !== i.polarity && L.source === u.source);
    for (const L of O) for (const P of T) L.id !== P.id && L.control === P.control && L.drain !== P.drain && L.control !== L.drain && P.control !== P.drain && p("differential-pair", [i.id, u.id, L.id, P.id], { inputs: [i.id, u.id], commonBase: [L.id, P.id] }, { inputCollectors: i.drain, bias: L.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const i of d) if (i.family === "bjt" && i.control !== i.drain) {
    const u = o.get(l(i.drain, i.control)) || [], O = o.get(l(i.control, i.source)) || [];
    u.length === 1 && O.length === 1 && p("vbe-multiplier", [i.id], { transistor: i.id, collectorResistor: u[0].name, emitterResistor: O[0].name }, { control: i.control, collector: i.drain, emitter: i.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [u[0].name, O[0].name]);
  }
  return c;
}
function ye(t, e, n = (r) => r) {
  const r = (o) => Array.isArray(o) ? o.map(e) : e(o);
  return t.map((o) => ({ ...o, members: o.members.map(e), transistors: o.transistors.map(e), roles: Object.fromEntries(Object.entries(o.roles).map(([d, l]) => [d, r(l)])), nets: Object.fromEntries(Object.entries(o.nets).map(([d, l]) => [d, n(l)])) }));
}
function vt(t, e, n = De(t, e)) {
  const r = /* @__PURE__ */ new Map(), o = t.components.filter((f) => f.kind === "R"), d = t.components.filter((f) => f.kind === "Q"), l = new Map(t.components.map((f) => [f.name, f])), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), a = (f) => Object.values(f.terminals), p = (f, g, v) => {
    f && r.set(f.name, { reverse: a(f)[0] !== g, reason: v });
  };
  for (const f of d) {
    const { C: g, B: v, E: I } = f.terminals, w = f.type.endsWith("pnp"), b = f.type.endsWith("npn");
    !w && !b || (s.has(I) || s.set(I, []), s.get(I).push(f), g === v && e[I]?.potential !== null && e[I]?.potential !== void 0 && c.set(g, { potential: e[I].potential }));
  }
  for (const f of n) if (f.kind === "vbe-multiplier" && f.confidence === "high") {
    const g = l.get(f.roles.transistor), v = g.type.endsWith("pnp"), I = l.get(v ? f.roles.emitterResistor : f.roles.collectorResistor), w = l.get(v ? f.roles.collectorResistor : f.roles.emitterResistor);
    p(I, g.terminals[v ? "E" : "C"], "recognized VBE multiplier"), p(w, g.terminals.B, "recognized VBE multiplier");
  }
  for (const f of o) {
    const [g, v] = a(f), I = c.get(g), w = c.get(v);
    I && w && I.potential !== w.potential && p(f, I.potential > w.potential ? g : v, "diode-connected bias reference");
  }
  const m = /* @__PURE__ */ new Map();
  for (const f of o) {
    const g = a(f);
    if (!g.some((v) => e[v]?.potential !== null && e[v]?.potential !== void 0))
      for (const v of g)
        m.has(v) || m.set(v, []), m.get(v).push(f);
  }
  for (const [f, g] of m)
    if (!(g.length > 12))
      for (const v of g) for (const I of g) {
        if (v === I) continue;
        const w = a(v).find((C) => C !== f), b = a(I).find((C) => C !== f), h = s.get(w)?.find((C) => C.type.endsWith("npn")), y = s.get(b)?.find((C) => C.type.endsWith("pnp"));
        h && y && (p(v, w, "complementary emitter output"), p(I, f, "complementary emitter output"));
      }
  return r;
}
function xt(t) {
  const e = t.components.filter((d) => d.kind === "Q"), n = /* @__PURE__ */ new Map(), r = new Set(t.components.filter((d) => d.kind === "R").map((d) => Object.values(d.terminals).sort().join("|"))), o = /* @__PURE__ */ new Set();
  for (const d of e) {
    const l = d.terminals.E;
    n.has(l) || n.set(l, []), n.get(l).push(d);
  }
  for (const d of e) {
    const { B: l, C: s, E: c } = d.terminals;
    if (l === c || !r.has([l, c].sort().join("|"))) continue;
    const a = n.get(l) || [];
    if (!(a.length > 16))
      for (const p of a) {
        if (p === d) continue;
        if (p.terminals.B === s) {
          o.add(d.name);
          break;
        }
        const m = n.get(p.terminals.B) || [];
        if (m.length <= 16 && m.some((f) => f !== d && f !== p && f.terminals.B === s)) {
          o.add(d.name);
          break;
        }
      }
  }
  return o;
}
const we = 12;
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
const ue = (t) => ["pwr", "ret", "bias"].includes(t), St = (t) => String(t).split("/").at(-1).toLowerCase(), Ve = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[St(t)] || "unknown", Rt = (t) => {
  const e = _e(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Ve(t);
};
function Lt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], r = (l, s, c) => {
    e.has(l) || e.set(l, []), e.get(l).push({ node: s, delta: c });
  };
  for (const l of t)
    if (l.kind === "V")
      try {
        let s = l.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (c && Number(le(c[1], l.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!a) continue;
        const p = le(a[1], l.parameters);
        if (typeof p != "number" || !Number.isFinite(p)) continue;
        r(l.terminals["-"], l.terminals["+"], p), r(l.terminals["+"], l.terminals["-"], -p);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Set();
  for (const l of ["0", ...e.keys()]) {
    if (d.has(l)) continue;
    const s = /* @__PURE__ */ new Map([[l, 0]]), c = [l];
    d.add(l);
    let a = !1;
    for (let p = 0; p < c.length; p++) for (const m of e.get(c[p]) || []) {
      const f = s.get(c[p]) + m.delta;
      s.has(m.node) ? Math.abs(s.get(m.node) - f) > 1e-8 * Math.max(1, Math.abs(f)) && (a = !0) : (s.set(m.node, f), d.add(m.node), c.push(m.node));
    }
    a && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [p, m] of s) o[p] = { value: m, reference: l, known: l === "0" && !a, consistent: !a };
  }
  return { nodes: o, diagnostics: n };
}
function kt(t, e) {
  const n = Lt(de(t.root)), r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const p = _e(a.name), m = Ve(a.name);
    r[a.name] = { role: p !== "unknown" ? p : m, roleSource: p !== "unknown" ? "node-name" : m !== "unknown" ? "legacy-rail-name" : "unknown", potential: n.nodes[a.name]?.known ? n.nodes[a.name].value : null };
  }
  const d = De(e, r), l = vt(e, r, d), s = xt(e), c = (a, p, m) => {
    const f = { role: r[m].role, roleSource: r[m].roleSource }, g = a.block?.ports.find((w) => w.pin === p);
    if (g?.implicit || !a.block && !a.synthetic) return f;
    const v = a.synthetic ? a.value : g?.name || g?.label, I = Rt(v);
    return I !== "unknown" ? { role: I, roleSource: _e(v) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ue(f.role) ? { ...f, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const p = Object.fromEntries(Object.entries(a.terminals).map(([u, O]) => [u, { ...r[O], ...c(a, u, O) }])), m = Object.values(p), f = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), g = f && !l.has(a.name) && m.length === 2 && m.every((u) => !ue(u.role) && (u.potential === null || u.role !== "unknown")), v = a.terminals["+"], I = a.terminals["-"], w = [v, I].filter((u) => u && u !== "0"), b = a.kind === "V" && w.some((u) => ue(r[u]?.role)) && !w.some((u) => ["in", "out", "io", "fb"].includes(r[u]?.role)) && [v, I].every((u) => n.nodes[u]?.known), h = v === "0" ? I : v, y = Object.keys(a.terminals), C = (u) => ue(u.role) ? u.potential !== null ? u.potential > 0 ? "high" : "low" : u.role === "ret" ? "low" : "high" : "signal";
    let N = !1;
    y.length === 2 && (a.kind === "V" && m.every((u) => u.potential !== null) ? N = m[0].potential < m[1].potential : a.terminals[y[0]] === "0" ? N = !0 : a.terminals[y[1]] === "0" ? N = !1 : m.every((u) => u.potential !== null) ? N = m[0].potential < m[1].potential : N = C(m[0]) === "low" || C(m[1]) === "high" && C(m[0]) === "signal"), l.has(a.name) && (N = l.get(a.name).reverse);
    const i = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    o[a.name] = { version: we, kind: a.kind, polarity: a.type.endsWith("pnp") ? "p" : a.type.endsWith("npn") ? "n" : null, currentLimiter: s.has(a.name), orientationReason: l.get(a.name)?.reason || null, owner: i.includes("/") ? i.slice(0, i.lastIndexOf("/")) : "", passive: f, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !f, ports: p, horizontal: g, orientation: g ? "horizontal" : N ? "vertical-reversed" : "vertical", flexible: y.length === 2 && (f || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!b, voltage: b ? n.nodes[h].value : null };
  }
  return { version: we, nodes: r, cells: o, motifs: d, diagnostics: n.diagnostics };
}
function Qe(t, e) {
  const n = e.ports.map((o, d) => ({ pin: "P" + d, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), r = new Set(de(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const d = Ee([], o);
    r.has(d) && !n.some((l) => l.node === d) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: d, implicit: !0 });
  }
  return n;
}
function Pt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: r = "" } = {}) {
  const o = t.contexts[r];
  if (!o) throw Error("Unknown instance: " + r);
  const d = [], l = [];
  function s(p) {
    l.push(...Object.values(p.nodes), ...p.ports.map((f) => f.node));
    const m = [...p.devices.map((f) => ({ line: f.line, device: f })), ...p.children.map((f) => ({ line: f.line, child: f }))].sort((f, g) => f.line - g.line);
    for (const f of m) {
      if (f.device) {
        const w = f.device;
        d.push({ ...w, layoutLabel: [...p.path.slice(o.path.length), w.localName].join("/") });
        continue;
      }
      const g = f.child;
      if (e === "flat" || n.has(g.id)) {
        s(g);
        continue;
      }
      const v = Qe(t, g), I = j();
      v.forEach((w) => {
        I[w.pin] = w.node;
      }), d.push({ name: g.id, kind: "X", type: "spice_subckt", terminals: I, value: g.definition, raw: g.raw, line: g.line, instanceId: g.id, layoutLabel: g.path.slice(o.path.length).join("/"), block: { definitionId: g.scopeId, ports: v, parameters: g.params } });
    }
  }
  s(o);
  for (const [p, m] of o.ports.entries()) d.push({ name: "@port/" + r + "/" + p, kind: "PORT", type: "spice_port", terminals: { A: m.node }, layoutLabel: m.name, value: m.name, raw: "Interface port " + m.name, synthetic: !0 });
  if (d.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(j(), ...Object.values(t.contexts).map((p) => p.models)), a = { title: r || t.ir.title, components: d, nodes: ft(d, l), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: r };
  return a.topology = At(t, a), a.layout = kt(t, a), a.layout.description = dt(t, a), a;
}
function At(t, e) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const l of e.components)
    if (!l.synthetic)
      if (l.kind === "X") {
        const s = t.contexts[l.instanceId];
        if (!s) throw Error("Projection contains an unknown block.");
        const c = Qe(t, s);
        if (JSON.stringify(Object.entries(l.terminals)) !== JSON.stringify(c.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + l.name);
        n.push(...de(s));
      } else n.push(l);
  for (const l of n) {
    if (r.has(l.name)) throw Error("Projection duplicates " + l.name);
    r.add(l.name);
  }
  const o = Ae(n), d = de(t.contexts[e.focus]);
  if (o !== Ae(d)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: o };
}
function Tt(t) {
  const e = j(), n = j();
  for (const r of t.components) {
    const o = j(), d = j();
    for (const [l, s] of Object.entries(r.terminals))
      o[l] = [t.nodes[s].bit], d[l] = "input";
    e[r.name] = { type: r.type, port_directions: d, connections: o, parameters: {}, attributes: { ref: r.name, displayRef: r.layoutLabel || r.name, value: r.value, spice: r.raw } }, e[r.name].spiceLayout = t.layout?.cells[r.name], r.block && (e[r.name].spiceBlock = { ports: r.block.ports.map((l) => ({ pin: l.pin, label: l.label })), definitionId: r.block.definitionId }), (r.type === "spice_device" || r.type === "spice_coupling") && (e[r.name].spiceSymbol = { label: r.symbol || r.kind, ports: Object.keys(r.terminals).map((l, s) => ({ pin: l, label: r.pinLabels?.[s] || l })), references: r.coupledInductors?.length ? r.coupledInductors : r.controlSources || [] });
  }
  for (const r of Object.values(t.nodes)) n[r.name] = { hide_name: 0, bits: [r.bit], attributes: {} };
  if (t.nodes[0]) {
    let r = "__ground";
    for (; Object.hasOwn(e, r); ) r += "_";
    e[r] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: ye(t.layout?.motifs || [], (r) => r, (r) => t.nodes[r].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Ut(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = {}, o = (a) => (n.has(a) || n.set(a, n.size + 2), n.get(a));
  Object.entries(t.modules.circuit.cells).forEach(([a, p], m) => {
    const f = "c" + m;
    e.set(f, a);
    const g = Object.fromEntries(Object.entries(p.connections).map(([v, I]) => [v, I.map(o)]));
    r[f] = { type: p.type, connections: g, port_directions: p.port_directions, attributes: { displayRef: p.attributes.displayRef || p.attributes.ref || "", value: p.attributes.value || "", name: p.attributes.name || "" } }, p.spiceBlock && (r[f].spiceBlock = p.spiceBlock), p.spiceSymbol && (r[f].spiceSymbol = p.spiceSymbol), p.spiceLayout && (r[f].spiceLayout = p.spiceLayout);
  });
  const d = new Map([...e].map(([a, p]) => [p, a])), l = t.modules.circuit.spiceLayoutDescription, s = l ? { ...l, groups: l.groups.map((a) => ({ ...a, members: a.members.map((p) => p.cell ? { ...p, cell: d.get(p.cell) } : p) })), relations: l.relations.map((a) => ({ ...a, a: d.get(a.a) || a.a, b: d.get(a.b) || a.b })) } : null, c = ye(t.modules.circuit.spiceMotifs || [], (a) => d.get(a), o);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: r, spiceMotifs: c, spiceLayoutDescription: s } } }, ids: e, bits: new Map([...n].map(([a, p]) => [p, a])) };
}
const Z = /* @__PURE__ */ new Map();
async function Mt(t, e) {
  const n = Ut(t), r = JSON.stringify([n.netlist, e]);
  let o = Z.get(r);
  o ? (Z.delete(r), Z.set(r, o)) : (o = await Dt(n.netlist, e), o.svg.length < 1e6 && (Z.set(r, o), Z.size > 20 && Z.delete(Z.keys().next().value)));
  const d = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (d.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of d.querySelectorAll("[id],[class]")) {
    const a = c.getAttribute("id");
    a?.startsWith("cell_") && n.ids.has(a.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(a.slice(5)));
    const p = c.getAttribute("class");
    p && c.setAttribute("class", p.split(/\s+/).map((m) => m.startsWith("cell_") && n.ids.has(m.slice(5)) ? "cell_" + n.ids.get(m.slice(5)) : /^net_\d+$/.test(m) && n.bits.has(Number(m.slice(4))) ? "net_" + n.bits.get(Number(m.slice(4))) : m).join(" "));
  }
  const l = o.drawing ? structuredClone(o.drawing) : null, s = d.querySelector("#spice-layout-report");
  if (s) {
    const c = JSON.parse(s.textContent), a = (p) => n.ids.get(p) || p;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(a), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(a), c.recognizedMotifs = ye(c.recognizedMotifs || [], a, (p) => n.bits.get(p) ?? p);
    for (const p of c.pairConstraints || []) p.members = p.members.map(a);
    for (const p of c.motifMeasurements || [])
      p.members = p.members.map(a), p.interlopers && (p.interlopers = p.interlopers.map(a));
    for (const p of c.voltageRails || []) p.bit !== void 0 && (p.bit = n.bits.get(p.bit) ?? p.bit);
    s.textContent = JSON.stringify(c);
  }
  if (l) {
    for (const c of l.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const a of c.ports) a.bit = n.bits.get(a.bit) ?? a.bit;
    }
    for (const c of l.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(d.documentElement), drawing: l };
}
function Dt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-QPytGn_-.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((r, o) => {
    const d = (c, a) => {
      clearTimeout(s), n.terminate(), c ? o(Error(c)) : r(a);
    }, l = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => d("Layout timed out. Open a subcircuit sheet or collapse instances."), l);
    n.onmessage = ({ data: c }) => d(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => d(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Vt = `* RLC low-pass filter
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
`, Qt = `* Voltage-divider biased common-emitter amplifier.
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
`, Bt = `* Common-collector voltage follower; independently chosen example values.
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
`, jt = `* Unity-gain Sallen-Key second-order low-pass filter.
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
`, Gt = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.
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
`, fe = {
  filter: { source: Vt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Qt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Bt, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: jt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Gt, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
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
const Ue = fe.filter.source, R = (t) => document.getElementById("spice-" + t), ce = R("app");
if (ce) {
  let u = function(_) {
    const x = R("example-info");
    if (x && (x.replaceChildren(), !!_ && (x.append(document.createTextNode(_.description + " ")), _.url))) {
      const A = document.createElement("a");
      A.href = _.url, A.target = "_blank", A.rel = "noopener noreferrer", A.textContent = _.reference, x.append(A);
    }
  }, O = function() {
    o = null, d = null, s = "", N(), u(Object.values(fe).find((_) => _.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, T = function(_) {
    r.replaceChildren();
    for (const { severity: x, line: A, message: U, source: k } of _) {
      const B = document.createElement("li");
      B.className = x, B.textContent = `${x.toUpperCase()}${k && k !== "input.cir" ? " · " + k : ""}${A ? " · line " + A : ""}: ${U}`, r.append(B);
    }
    R("messages").open = _.some((x) => x.severity !== "info"), R("message-count").textContent = `${_.length} message${_.length === 1 ? "" : "s"}`;
  }, L = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`), R("zoom-level").textContent = Math.round(w.w / I.w * 100) + "%";
  }, P = function(_, x = I.x + I.w / 2, A = I.y + I.h / 2) {
    if (!e.querySelector("svg")) return;
    const U = Math.max(0.05, Math.min(10, I.w * _ / w.w)) * w.w / I.w;
    I = { x: x + (I.x - x) * U, y: A + (I.y - A) * U, w: I.w * U, h: I.h * U }, L();
  }, M = function(_) {
    const x = new URLSearchParams();
    _ && x.set("instance", _);
    const A = x.toString();
    location.hash.slice(1) === A ? (f = _, G()) : location.hash = A;
  }, D = function() {
    f = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, $ = function(_) {
    const x = a.contexts[_].path;
    for (let A = 1; A <= x.length; A++) h.add(x.slice(0, A).map(encodeURIComponent).join("/"));
  }, ee = function() {
    const _ = !!(g && g !== f && a?.contexts[g]);
    R("selection-actions").hidden = !_, R("toggle-instance").textContent = h.has(g) ? "Collapse instance" : "Expand instance", R("toggle-instance").disabled = !1, R("open-instance").href = "#" + new URLSearchParams({ instance: g });
  }, Ne = function() {
    R("breadcrumbs").replaceChildren();
    const _ = (A, U) => {
      const k = document.createElement("button");
      k.type = "button", k.textContent = A, k.onclick = () => M(U), k.disabled = U === f, R("breadcrumbs").append(k);
    };
    if (_("Top", ""), f) {
      const A = a.contexts[f].path;
      for (let U = 0; U < A.length; U++) _(A[U], A.slice(0, U + 1).map(encodeURIComponent).join("/"));
    }
    R("instances").replaceChildren();
    const x = (A, U) => {
      for (const k of A.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(U, 8)), B.dataset.instance = k.id;
        const z = document.createElement("button");
        z.type = "button", z.textContent = h.has(k.id) ? "−" : "+", z.title = (h.has(k.id) ? "Collapse " : "Expand ") + k.id, z.setAttribute("aria-label", z.title), z.setAttribute("aria-expanded", String(h.has(k.id))), z.onclick = () => {
          h.has(k.id) ? h.delete(k.id) : $(k.id), g = k.id, G();
        };
        const te = document.createElement("a");
        te.href = "#" + new URLSearchParams({ instance: k.id }), te.textContent = k.name + " · " + k.definition, te.title = "Open " + k.id + " as its own sheet";
        const K = document.createElement("span");
        if (K.className = "spice-help", K.textContent = Object.entries(k.params).map(([Y, ne]) => Y + "=" + ne).join(" · "), B.append(z, te), K.textContent) {
          const Y = document.createElement("details"), ne = document.createElement("summary");
          ne.textContent = "Parameters", Y.append(ne, K), B.append(Y);
        }
        R("instances").append(B), x(k, U + 1);
      }
    };
    x(a.contexts[f], 0), R("hierarchy-panel").hidden = !a.contexts[f].children.length, R("focus-title").textContent = f ? f + " / " + a.contexts[f].definition : "Top-level schematic", ee();
  };
  const t = R("input"), e = R("preview"), n = R("status"), r = R("diagnostics");
  let o = null, d = null, l = !1, s = "", c, a, p, m = "", f = "", g = "", v = !1, I = { x: 0, y: 0, w: 1, h: 1 }, w = { ...I }, b;
  const h = /* @__PURE__ */ new Set();
  let y = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ce.addEventListener("click", (_) => {
    v && _.target.closest('a[href^="#"]') && _.preventDefault();
  });
  const N = () => {
    R("copy").disabled = R("download").disabled = !s || v, R("download-asc").disabled = R("download-asc-bundle").disabled = !s || !o || v || l;
  }, i = () => ({ font: R("font").value, fontSize: Number(R("size").value), color: R("color").value, detailed: R("detailed").checked, conventional: R("conventional").checked });
  t.value = Ue;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Ue;
  } catch {
  }
  u(Object.values(fe).find((_) => _.source === t.value)), t.addEventListener("input", O);
  for (const _ of ["font", "size", "color", "detailed", "conventional"]) R(_).addEventListener("input", O);
  R("zoom-in").onclick = () => P(0.8), R("zoom-out").onclick = () => P(1.25), R("fit").onclick = () => {
    I = { ...w }, L();
  };
  const Q = (_) => {
    const x = e.querySelector("svg");
    return x ? new DOMPoint(_.clientX, _.clientY).matrixTransform(x.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (_) => {
    const x = Q(_);
    x && (_.preventDefault(), P(_.deltaY > 0 ? 1.12 : 1 / 1.12, x.x, x.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (_) => {
    _.button !== 0 || !e.querySelector("svg") || (b = { start: Q(_), x: _.clientX, y: _.clientY, view: { ...I }, moved: !1 }, e.setPointerCapture(_.pointerId));
  }), e.addEventListener("pointermove", (_) => {
    if (!b) return;
    const x = Q(_);
    Math.hypot(_.clientX - b.x, _.clientY - b.y) > 4 && (b.moved = !0), I.x += b.start.x - x.x, I.y += b.start.y - x.y, L();
  }), e.addEventListener("pointerup", (_) => {
    if (!b) return;
    const x = b.moved;
    if (b = null, e.hasPointerCapture(_.pointerId) && e.releasePointerCapture(_.pointerId), !x) {
      const A = document.elementFromPoint(_.clientX, _.clientY)?.closest("[data-component]"), U = c?.components.find((k) => k.name === A?.dataset.component);
      U && (g = U.instanceId || "", R("selection").textContent = `${U.raw}
${Object.entries(U.terminals).map(([k, B]) => `${k} → ${B}`).join("   ")}`, U.kind === "X" ? ($(U.instanceId), G()) : ee());
    }
  }), window.addEventListener("hashchange", () => {
    if (v) {
      y = !0;
      return;
    }
    D(), g = "", G();
  }), R("collapse-all").onclick = () => {
    h.clear(), G();
  }, R("expand-all").onclick = () => {
    for (const _ of Object.keys(a?.contexts || {})) _ && h.add(_);
    G();
  }, R("toggle-instance").onclick = () => {
    h.has(g) ? h.delete(g) : $(g), G();
  }, e.addEventListener("pointercancel", () => {
    b = null;
  }), e.addEventListener("keydown", (_) => {
    const x = _.target.closest("[data-instance]");
    if (x && (_.key === "Enter" || _.key === " ")) {
      _.preventDefault(), g = x.dataset.instance, $(g), G();
      return;
    }
    _.key === "+" || _.key === "=" ? P(0.8) : _.key === "-" ? P(1.25) : _.key.toLowerCase() === "f" ? (I = { ...w }, L()) : _.key.startsWith("Arrow") && (_.preventDefault(), I.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[_.key] || 0) * I.w, I.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[_.key] || 0) * I.h, L());
  });
  async function G() {
    if (v) return;
    v = !0, o = null, d = null, s = "", N(), R("generate").disabled = !0, t.readOnly = !0, R("file").disabled = !0, R("libraries").disabled = !0;
    for (const x of ce.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) x.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let _ = [];
    try {
      if (m !== t.value || !a) {
        if (p = ut(t.value, { files: C }), _ = [...p.diagnostics], _.some((S) => S.severity === "error"))
          throw a = null, Error("Fix the parser errors below before generating.");
        a = Ot(p), m && m !== t.value ? (h.clear(), f = "", g = "", history.replaceState(null, "", location.pathname + location.search)) : D(), m = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (_ = [...p.diagnostics], T(_), _.some((S) => S.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = Pt(a, { expanded: h, focus: f });
      const x = Tt(c);
      i().conventional && _.push(...c.layout.diagnostics);
      const A = await Mt(x, i()), U = new DOMParser().parseFromString(A.svg, "image/svg+xml");
      if (U.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const k = U.documentElement, B = k.querySelector("#spice-layout-report");
      if (B) {
        c.layout.report = JSON.parse(B.textContent);
        const S = c.layout.report;
        _.push({ severity: "info", message: `Layout: compact signal flow; ${S.powerSourcesChecked} DC/ground symbols checked, ${S.powerOrderViolations} DC order preference(s) unmet. ${S.powerPass}. ${S.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), S.classicTemplateFallback && _.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), S.groundPlacement && _.push({ severity: "info", message: `Ground: ${S.groundPlacement}; ${S.straightenedGroundDrops || 0} return-path simplification(s).` }), S.explicitGroups && _.push({ severity: "info", message: `Layout comments: ${S.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), S.classicRails && _.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${S.railCount} shared voltage rails.` }), S.localClassicInstances?.length && _.push({ severity: "info", message: `${S.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), S.localClassicStages?.length && _.push({ severity: "info", message: `Classic transistor proximity active: ${S.localClassicStages.join(", ")}.` }), S.sharedClassicRails && _.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), S.mirroredTransistors?.length && _.push({ severity: "info", message: `Control-pin mirror choices: ${S.mirroredTransistors.join(", ")}.` }), S.recognizedMotifs?.length && _.push({ severity: "info", message: `Transistor structures: ${S.recognizedMotifs.map((V) => `${V.kind} (${V.members.join(", ")}; ${V.confidence})`).join("; ")}.` }), S.appliedMotifs?.length && _.push({ severity: "info", message: `Topology preferences applied to ${S.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), S.pairConstraints?.length && _.push({ severity: "info", message: `${S.pairConstraints.length} transistor motif group(s) placed together; unrelated devices cannot enter the pair.` }), S.netShortcuts && _.push({ severity: "info", message: `${S.netShortcuts} safe straight net shortcut(s); ${S.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), S.sharedRailFallback && _.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${S.sharedRailFallback}.` });
        for (const V of S.localClassicFallbacks || []) V.stage && _.push({ severity: "info", message: `Classic stage ${V.stage} uses automatic layout: ${V.reason || "No unobstructed local template"}.` });
        S.geometricConnectivityVerified && _.push({ severity: "info", message: `Net geometry verified; ${S.cyclesRemoved} same-net loop(s) and ${S.leavesRemoved} unused wire branch(es) removed.` }), T(_);
      }
      if (k.localName !== "svg" || k.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const z = Number(k.getAttribute("width")), te = Number(k.getAttribute("height"));
      w = { x: -20, y: -20, w: z + 40, h: te + 40 }, I = { ...w }, k.setAttribute("viewBox", `${w.x} ${w.y} ${w.w} ${w.h}`), k.setAttribute("width", String(w.w)), k.setAttribute("height", String(w.h)), k.setAttribute("role", "img"), k.setAttribute("aria-label", c.title || "SPICE schematic"), k.setAttribute("style", "background:white");
      for (const S of c.components) {
        const V = U.getElementById("cell_" + S.name);
        if (!V) throw Error("Renderer omitted component " + S.name);
        V.setAttribute("data-component", S.name), S.kind === "X" && (V.setAttribute("data-instance", S.instanceId), V.setAttribute("role", "button"), V.setAttribute("tabindex", "0"), V.setAttribute("aria-label", "Expand " + S.name));
        const q = U.createElementNS(k.namespaceURI, "title");
        q.textContent = S.raw + `
Resolved: ` + S.value + `
` + Object.entries(S.terminals).map(([H, ae]) => H + ": " + ae).join(", "), V.prepend(q);
      }
      for (const S of Object.values(c.nodes))
        for (const V of k.querySelectorAll(".net_" + S.bit)) {
          V.setAttribute("data-net", S.name);
          const q = U.createElementNS(k.namespaceURI, "title");
          q.textContent = "Node " + S.displayName, V.append(q);
        }
      const K = c.components.filter((S) => S.kind === "K").map((S) => ({ name: S.name, inductors: S.coupledInductors, value: S.value }));
      if (K.length) {
        const S = U.createElementNS(k.namespaceURI, "metadata");
        S.setAttribute("id", "spice-magnetic-couplings"), S.textContent = JSON.stringify(K), k.append(S);
        for (const V of K) for (const q of V.inductors) {
          const H = U.getElementById("cell_" + q);
          if (!H) continue;
          const ae = U.createElementNS(k.namespaceURI, "circle"), me = [...H.children].find((ge) => ge.getAttribute("s:pid") === "A"), Be = me?.getAttribute("s:position"), Ie = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [ge, je] of Object.entries({ cx: Number(me?.getAttribute("s:x")) + Ie[0], cy: Number(me?.getAttribute("s:y")) + Ie[1], r: 3, fill: i().color, stroke: "none", "data-coupling": V.name })) ae.setAttribute(ge, String(je));
          const Oe = U.createElementNS(k.namespaceURI, "title");
          Oe.textContent = V.name + " · dotted terminal: " + V.inductors.join(", "), ae.append(Oe), H.append(ae);
        }
      }
      o = A.drawing, s = new XMLSerializer().serializeToString(k), R("source").value = s, e.replaceChildren(document.importNode(k, !0)), L();
      const Y = _.filter((S) => S.severity === "warning").length;
      n.textContent = `${c.components.filter((S) => !S.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${Y ? " · Review " + Y + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${we}.`, c.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${c.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), c.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const ne = Object.values(c.nodes).map((S) => {
        const V = document.createElement("tr");
        for (const q of [S.displayName, S.terminals.map((H) => H.component + "." + H.pin).join(", ")]) {
          const H = document.createElement("td");
          H.textContent = q, V.append(H);
        }
        return V;
      });
      R("nets").replaceChildren(...ne), R("json").value = JSON.stringify({ circuit: c, netlist: x, hierarchy: p }, null, 2), R("selection").textContent = "Click a component to inspect its original statement and pin connections.", Ne();
    } catch (x) {
      if (e.replaceChildren(), s = "", R("source").value = "", R("json").value = "", R("nets").replaceChildren(), R("selection").textContent = "", n.textContent = x.message, !a)
        R("hierarchy-panel").hidden = !0, R("selection-actions").hidden = !0, R("breadcrumbs").replaceChildren();
      else if (!a.contexts[f]) {
        const A = document.createElement("button");
        A.type = "button", A.textContent = "Return to Top", A.onclick = () => M(""), R("breadcrumbs").replaceChildren(A);
      }
      x.diagnostics && (_ = x.diagnostics), _.some((A) => A.severity === "error") || _.push({ severity: "error", line: 0, message: x.message }), T(_);
    } finally {
      v = !1, R("generate").disabled = !1, t.readOnly = !1, R("file").disabled = !1, R("libraries").disabled = !1;
      for (const x of ce.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) x.disabled = !1;
      a && a.contexts[f] && Ne(), e.setAttribute("aria-busy", "false"), N(), y && (y = !1, D(), queueMicrotask(G));
    }
  }
  R("generate").onclick = G;
  for (const _ of ce.querySelectorAll("[data-example]")) _.onclick = () => {
    const x = fe[_.dataset.example];
    t.value = x.source, O(), u(x), G();
  };
  R("file").onchange = async (_) => {
    const x = _.target.files[0];
    if (x) {
      if (x.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Te(x), O(), G();
      } catch (A) {
        n.textContent = "File could not be read: " + A.message;
      } finally {
        _.target.value = "";
      }
    }
  }, R("libraries").onchange = async (_) => {
    try {
      for (const x of _.target.files) {
        if (x.size > 16e6) throw Error("Library exceeds 16 MB: " + x.name);
        C[x.webkitRelativePath || x.name] = await Te(x);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      a = null, m = "", R("library-status").textContent = Object.keys(C).length + " library file(s) loaded", G();
    } catch (x) {
      n.textContent = x.message;
    } finally {
      _.target.value = "";
    }
  }, R("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", R("download").onclick = () => {
    const _ = URL.createObjectURL(new Blob([s], { type: "image/svg+xml;charset=utf-8" })), x = document.createElement("a");
    x.href = _, x.download = "spice-schematic.svg", x.click(), setTimeout(() => URL.revokeObjectURL(_), 1e3);
  };
  async function Ce(_) {
    const x = o;
    if (!(!x || v || l)) {
      l = !0, N(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: A } = await import("./asc-export-sCQ3sbSl.js");
        if (o !== x) throw Error("Schematic changed. Generate again before exporting ASC.");
        d ||= A({ tree: a, circuit: c, drawing: x, source: t.value, libraries: C });
        const U = _ ? d.zip : d.ascBytes, k = URL.createObjectURL(new Blob([U], { type: _ ? "application/zip" : "application/octet-stream" })), B = document.createElement("a");
        B.href = k, B.download = _ ? "spice-schematic-asc.zip" : "spice-schematic.asc", B.click(), setTimeout(() => URL.revokeObjectURL(k), 1e3), n.textContent = "ASC connections verified · " + d.manifest.audit.symbols + " symbols. " + (_ ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), d.manifest.warnings.length && (n.textContent += " " + d.manifest.warnings.join(" "));
      } catch (A) {
        n.textContent = "ASC export failed: " + A.message;
        const U = document.createElement("li");
        U.className = "error", U.textContent = n.textContent, r.append(U);
      } finally {
        l = !1, N();
      }
    }
  }
  R("download-asc").onclick = () => Ce(!1), R("download-asc-bundle").onclick = () => Ce(!0), R("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(s), n.textContent = "SVG source copied to clipboard.";
    } catch {
      R("source-details").open = !0, R("source").focus(), R("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, G();
}
export {
  ke as b,
  de as l,
  Ee as n,
  mt as p
};
