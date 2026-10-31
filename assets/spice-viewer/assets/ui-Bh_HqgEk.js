const Wt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, $t = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, qt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, zt = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Xt = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Yt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Kt = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Zt = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Jt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, en = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, tn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, nn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, on = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, rn = {
  AND: Wt,
  BUF: $t,
  COUNTER: qt,
  DFLOP: zt,
  SCHMITT: Xt,
  OR: Yt,
  PHASEDET: Kt,
  SRFLOP: Zt,
  XOR: Jt,
  MODULATOR: en,
  OTA: tn,
  SAMPLEHOLD: nn,
  VARISTOR: on
}, sn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Ie = (t) => t.toLowerCase(), ht = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), an = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function cn(t, e) {
  const n = (T) => e[Ie(T || "")] || Object.entries(e).find(([E]) => E.startsWith(Ie(T || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let r = [], a = [], u = "", s = "", d = [], h = [], l = 0, m = "", f = "", w = "", x = !0;
  if ("RLC".includes(i))
    r = ["A", "B"], s = Ie(i) + "_v";
  else if ("DVIB".includes(i))
    r = ["+", "-"], s = i === "D" ? "d_v" : i === "B" ? "spice_b" : Ie(i);
  else if (i === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !ht(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), u = t[r.length + 1] || "";
    const T = n(u)?.type;
    x = ["NPN", "PNP"].includes(T), s = x ? (r.length === 3 ? "q_" : "spice_q4_") + Ie(T) : "spice_q" + r.length;
  } else if (i === "M") {
    const T = n(t[4]), E = n(t[5]), b = T?.type === "VDMOS" || !E && (!t[5] || ht(t[5]));
    r = b ? ["D", "G", "S"] : ["D", "G", "S", "B"], u = t[r.length + 1] || "";
    const C = n(u), A = C?.type;
    if (b && C && A !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!b && A === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    x = ["NMOS", "PMOS", "VDMOS"].includes(A);
    let M = null, S = C;
    const R = /* @__PURE__ */ new Set();
    for (; S && !R.has(S.name) && (R.add(S.name), M = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(S.raw), !M); )
      S = n(S.baseModel);
    const U = A === "PMOS" || A === "VDMOS" && M && (M[1] === void 0 || Number(M[1]) >= 0.5);
    s = x ? "spice_" + (U ? "pmos" : "nmos") + (b ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    u = t[4] || "";
    const T = n(u)?.type, E = i === "Z" && ["NIGBT", "PIGBT"].includes(T);
    r = E ? ["C", "G", "E"] : ["D", "G", "S"], x = i === "J" ? ["NJF", "PJF"].includes(T) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(T), s = "spice_" + (E ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(T || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    r = ["+", "-"], s = "spice_" + Ie(i);
    let T = 3, E = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[T] || "");
    if (/^poly$/i.test(t[T] || "") && (E = /^\(\s*(\d+)\s*\)$/.exec(t[++T] || ""), !E))
      throw Error("POLY requires a dimension.");
    if (E) {
      const b = Number(E[1]);
      if (b > 128) throw Error("POLY supports at most 128 controlling variables.");
      let C = T + 1, A = [];
      const M = "EG".includes(i), S = b * (M ? 2 : 1);
      for (; A.length < S && C < t.length; ) A.push(...an(t[C++]));
      if (A.length !== S || C >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (M) {
        for (let R = 0; R < b; R++) r.push("C" + (R + 1) + "+", "C" + (R + 1) + "-");
        a = [t[1], t[2], ...A];
      } else d = A;
      l = C, m = "POLY(" + b + ") " + (M ? "" : A.join(" ") + " "), f = "POLY", M && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? f = "BEHAVIORAL" : "EG".includes(i) ? (r.push("C+", "C-"), f = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (d = [t[3]], l = 4, m = t[3] + " ");
    w = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (f ? " · " + f : "");
  } else if (i === "S")
    r = ["A", "B", "C+", "C-"], u = t[5] || "", s = "spice_device", w = "Voltage switch";
  else if (i === "W")
    r = ["A", "B"], d = [t[3]], u = t[4] || "", l = 3, s = "spice_device", w = "Current switch";
  else if ("TO".includes(i))
    r = ["L+", "L-", "R+", "R-"], i === "O" && (u = t[5] || ""), s = "spice_device", w = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    r = ["N1", "N2", "COM"], u = t[4] || "", s = "spice_device", w = "Distributed RC";
  else if (i === "A")
    r = Array.from({ length: 8 }, (T, E) => "P" + (E + 1)), s = "spice_device", w = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (h = t.slice(1, -1), h.some((T) => !/^L/i.test(T.split(":").at(-1)))) throw Error("K references must name inductors.");
    l = t.length - 1, s = "spice_coupling", w = "Magnetic coupling", m = h.join(" ") + " · k=";
  } else if (i === "@")
    r = ["IN", "OUT"], s = "spice_device", w = "FRA";
  else if (i === "&")
    r = ["O+", "O-", "I+", "I-"], s = "spice_device", w = "FRA probe";
  else if (i === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", w = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (l || (l = r.length + 1), a.length || (a = t.slice(1, r.length + 1)), a.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= l && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (a.some((T) => /[=()]/.test(T) && !/^\{[\s\S]*\}$/.test(T))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(l).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(l).join(" ")) && (s = "spice_br"), i === "D" && (u = t[3] || ""), i === "@") {
    const T = t.slice(l).join(" ");
    for (const E of T.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(E[1].toUpperCase()), a.push(E[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (d.some((T) => !T)) throw Error("Missing controlling voltage source.");
  const v = r.map((T, E) => i === "A" && rn[(t[9] || "").toUpperCase()]?.[String(E + 1)] || T);
  return { kind: i, pins: r, nodeTokens: a, pinLabels: v, model: u, type: s, controlSource: d[0] || "", controlSources: d, coupledInductors: h, value: m + t.slice(l).join(" "), sourceMode: f, symbol: w, polarityKnown: x };
}
const ln = sn, dn = new Set(ln.split(" ")), Xe = () => /* @__PURE__ */ Object.create(null), be = (t) => t.toLowerCase();
function He(t) {
  const e = [], n = [];
  let i = "", r = 0, a = "";
  for (let u = 0; u < t.length; u++) {
    const s = t[u];
    if (a) {
      i += s, s === a && t[u - 1] !== "\\" && (a = "");
      continue;
    }
    if (s === '"' || s === "'") {
      a = s, i += s;
      continue;
    }
    if (!r && (s === ";" || s === "$" && (!u || /\s/.test(t[u - 1])))) break;
    if ("({".includes(s) && (n.push(s), r++), ")}".includes(s) && (r--, n.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !r ? (i && e.push(i), i = "") : i += s;
  }
  if (r || a) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function un(t, e = {}) {
  const n = [], i = [], r = [], a = Object.assign(Xe(), e.models), u = Xe(), s = (E, b, C) => n.push({ severity: E, line: b, message: C });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const d = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((E, b) => {
    const C = E.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? d.length ? d.at(-1).text += " " + C.slice(1).trim() : s("error", b + 1, "Continuation has no preceding statement.") : d.push({ line: b + 1, text: C }));
  });
  for (const E of d) {
    try {
      E.tokens = He(E.text);
    } catch (C) {
      s("error", E.line, C.message), E.tokens = [];
    }
    const b = E.tokens;
    if (/^\.model$/i.test(b[0] || ""))
      if (b.length < 3) s("error", E.line, ".model requires a name and device type.");
      else {
        const C = /^ako:(.+)$/i.exec(b[2]), A = C && b[3] && !b[3].startsWith("(") ? b[3].split("(")[0].toUpperCase() : "";
        a[be(b[1])] = { name: b[1], type: C ? A : b[2].split("(")[0].toUpperCase(), baseModel: C?.[1] || "", raw: E.text };
      }
  }
  const h = /* @__PURE__ */ new Set();
  function l(E) {
    const b = a[be(E)];
    if (!b) return "";
    if (b.type) return b.type;
    if (h.has(be(E))) throw Error("Circular AKO model inheritance: " + E);
    return h.add(be(E)), b.type = l(b.baseModel), h.delete(be(E)), b.type;
  }
  for (const E of Object.values(a)) if (E.baseModel && !E.type)
    try {
      l(E.name);
    } catch (b) {
      s("error", 0, b.message);
    }
  let m = "", f = 0, w = !1, x = !1;
  const v = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: E, text: b, tokens: C } of d) {
    if (!C.length) continue;
    const A = be(C[0]);
    if (x) {
      s("warning", E, "Statement after .end is not rendered: " + b);
      continue;
    }
    if (A === ".control") {
      w = !0, s("warning", E, ".control script retained but not executed or rendered.");
      continue;
    }
    if (A === ".endc") {
      w = !1;
      continue;
    }
    if (w) continue;
    if (A === ".subckt") {
      f++, s("error", E, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (A === ".ends") {
      f ? f-- : s("error", E, "Unmatched .ends.");
      continue;
    }
    if (f) continue;
    if (A === ".end") {
      x = !0;
      continue;
    }
    if (A.startsWith(".")) {
      i.push({ line: E, text: b }), A === ".title" ? m = C.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(A) ? s("error", E, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(A) ? s("error", E, "Topology-changing directive is unsupported: " + b) : T.has(A) || s("warning", E, "Directive retained but not resolved: " + b);
      continue;
    }
    const M = C[0][0].toUpperCase();
    if (!dn.has(M)) {
      E === 1 && !/\d/.test(C[0]) && C.length > 1 && M !== "X" ? (m = b, s("warning", E, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", E, `Unsupported ${M} device was not rendered: ${b}`);
      continue;
    }
    const S = M === "M" || M === "Q" ? 5 : 4;
    if (E === 1 && !/\d/.test(C[0]) && (C.length < S || M === "T" && !/\b(?:zo|z0)\s*=/i.test(b))) {
      m = b, s("info", E, "SPICE title: " + b);
      continue;
    }
    try {
      if (v.has(A)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const R = cn(C, a), { pins: U, nodeTokens: g, ...p } = R;
      R.polarityKnown || s("warning", E, `${C[0]}: model polarity unknown; explicit ${U.join("/")} terminals retained.`);
      const P = Xe();
      U.forEach(($, H) => {
        const q = be(g[H]);
        u[q] || (u[q] = { name: q, displayName: C[H + 1], bit: Object.keys(u).length + 2, terminals: [] }), u[q].terminals.push({ component: C[0], pin: $ }), P[$] = q;
      }), r.push({ ...p, name: C[0], terminals: P, line: E, raw: b }), v.add(A);
    } catch (R) {
      s("error", E, `${C[0]}: ${R.message} Statement: ${b}`);
    }
  }
  f && s("error", 0, "Unclosed .subckt definition."), w && s("error", 0, "Unclosed .control block."), r.length || s("error", 0, "No supported components to render."), r.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const E of r) {
    for (const b of E.controlSources || []) !b.includes(":") && !r.some((C) => be(C.name) === be(b) && C.kind === "V") && s("error", E.line, `${E.name}: controlling voltage source ${b} was not found.`);
    for (const b of E.coupledInductors || []) !b.includes(":") && !r.some((C) => be(C.name) === be(b) && C.kind === "L") && s("error", E.line, `${E.name}: coupled inductor ${b} was not found.`);
    (E.kind === "B" || E.type === "spice_b") && s("info", E.line, `${E.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: r, nodes: u, models: a, directives: i, diagnostics: n };
}
const Ce = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), mt = (t) => Ce(t).split("/").at(-1);
function fn(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), r = [], a = [], u = [];
  let s = 0;
  const d = (l, m) => {
    const f = Ce(m).split("/").slice(0, -1).concat(Ce(l)).join("/"), w = [...i].filter(([v]) => Ce(v) === Ce(l) || Ce(v) === f);
    if (w.length === 1) return w[0];
    const x = [...i].filter(([v]) => mt(v) === mt(l));
    if (x.length !== 1) throw Error(x.length ? "Ambiguous library filename: " + l : "Missing library " + l + ". Add this file using Library files.");
    return x[0];
  };
  function h(l, m, f = "", w = []) {
    const x = Ce(m) + ":" + f.toLowerCase();
    if (w.includes(x)) throw Error("Circular library include: " + [...w, x].join(" → "));
    if (w.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const v = [], T = /^\s*\.endl\b/im.test(l);
    let E = !f;
    const b = (A, M) => {
      if (s += A.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      u.push(A), a.push({ file: m, line: M + 1 });
    };
    if (l.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((A, M) => {
      const S = A.trim();
      if (/^\.lib\b/i.test(S) && T) {
        const R = He(S);
        if (R.length === 2 && !/[.\\/]/.test(R[1])) {
          v.push(R[1].toLowerCase()), R[1].toLowerCase() === f.toLowerCase() && (E = !0), b("* Library section " + R[1], M);
          return;
        }
      }
      if (/^\.endl\b/i.test(S)) {
        v.pop(), b("* End library section", M);
        return;
      }
      if (f && v.length && !v.includes(f.toLowerCase())) {
        b("* Unselected library section", M);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(S))
        try {
          const R = He(S);
          if (!R[1]) throw Error("Include requires a filename.");
          const [U, g] = d(R[1], m);
          b("* Included " + U, M), h(g, U, R[2] || "", [...w, x]);
        } catch (R) {
          r.push({ severity: "error", line: M + 1, source: m, message: R.message }), b("* Unresolved include", M);
        }
      else b(A, M);
    }), !E) throw Error("Library section " + f + " not found in " + m);
  }
  try {
    h(t, n);
  } catch (l) {
    r.push({ severity: "error", line: 0, source: n, message: l.message });
  }
  return { source: u.join(`
`), origins: a, diagnostics: r };
}
function pn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], r = [];
  t.split(/\r?\n/).forEach((s, d) => {
    const h = s.trim();
    /^\.subckt\b/i.test(h) && (i.push(d + 1), n.set(d + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: s, line: d + 1 }) : e[d] = s, /^\.ends\b/i.test(h) && i.length > 1 && i.pop();
  });
  const a = gt(Array.from({ length: t.split(/\r?\n/).length }, (s, d) => e[d] || "").join(`
`));
  r.push(...a.diagnostics);
  const u = /* @__PURE__ */ new Map();
  for (const [s, d] of n) {
    const h = gt(d.map((l) => l.raw).join(`
`));
    u.set(s, h.layout), r.push(...h.diagnostics.map((l) => ({ ...l, line: d[l.line - 1]?.line || s })));
  }
  return { layout: a.layout, scopes: u, diagnostics: r };
}
function gt(t) {
  const e = [], n = [];
  let i = !1, r = !1, a = 0;
  if (t.split(/\r?\n/).forEach((b, C) => {
    const A = b.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(A)) {
      (r || i) && e.push({ severity: "error", line: C + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(A) || e.push({ severity: "error", line: C + 1, message: "Expected @layout begin v1." }), r = !0, i = !0, a = C + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(A)) {
      i || e.push({ severity: "error", line: C + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (A.startsWith("*") ? n.push(A.slice(1).trim()) : e.push({ severity: "error", line: C + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: a, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const u = n.join(" "), s = u.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], d = [], h = [], l = [], m = [];
  let f = 0, w = 0, x = 10;
  const v = () => s[f++], T = () => {
    const b = v();
    if (!b || !/^[A-Za-z_@][\w./%:@-]*$/.test(b)) throw Error("Expected layout identifier, got " + b);
    return b;
  };
  function E(b) {
    if (d.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const C = b ? T() : "@row" + w++, A = v();
    if (!["row", "column", "classic"].includes(A)) throw Error("Expected row, column or classic.");
    if (v() !== "{") throw Error("Expected { after " + A);
    const M = { id: C, direction: A, members: [] };
    for (d.push(M); f < s.length && s[f] !== "}"; )
      s[f] === "group" ? (v(), M.members.push(E(!0))) : ["row", "column"].includes(s[f]) ? M.members.push(E(!1)) : M.members.push(T());
    if (v() !== "}") throw Error("Unclosed group " + C);
    if (!M.members.length) throw Error("Empty layout group " + C);
    return C;
  }
  try {
    for (; f < s.length; )
      if (s[f] === "group")
        v(), E(!0);
      else if (["row", "column"].includes(s[f])) E(!1);
      else if (s[f] === "face") {
        v();
        const g = T(), p = v();
        if (!["left", "right"].includes(p)) throw Error("Expected face left or right.");
        if (m.some((P) => P.device.toLowerCase() === g.toLowerCase())) throw Error("Duplicate face device.");
        m.push({ device: g, side: p });
      } else if (s[f] === "pair") {
        v();
        const g = v();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(g)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (v() !== "{") throw Error("Expected { after pair kind.");
        const p = [];
        for (; f < s.length && s[f] !== "}"; ) p.push(T());
        if (v() !== "}" || !p.length) throw Error("Empty or unclosed pair.");
        if (l.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        l.push({ kind: g, members: p });
      } else if (s[f] === "priority-cap") {
        if (v(), x = Number(v()), !Number.isInteger(x) || x < 3 || x > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (v() === "place") {
        const g = T(), p = v(), P = T();
        if (!["left-of", "above"].includes(p)) throw Error("Expected left-of or above.");
        h.push({ a: g, relation: p, b: P });
      } else throw Error("Unknown layout instruction near " + s[f - 1]);
    const b = /* @__PURE__ */ new Set();
    for (const g of d) {
      const p = g.id.toLowerCase();
      if (b.has(p)) throw Error("Duplicate layout group " + g.id);
      b.add(p);
    }
    const C = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set(), M = new Map(d.map((g) => [g.id.toLowerCase(), g])), S = (g) => {
      if (C.has(g)) throw Error("Circular layout group " + g);
      if (!A.has(g)) {
        C.add(g);
        for (const p of M.get(g).members) M.has(p.toLowerCase()) && S(p.toLowerCase());
        C.delete(g), A.add(g);
      }
    };
    for (const g of M.keys()) S(g);
    const R = /* @__PURE__ */ new Map();
    for (const g of h) {
      if (g.a.toLowerCase() === g.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      R.has(g.a.toLowerCase()) || R.set(g.a.toLowerCase(), []), R.get(g.a.toLowerCase()).push(g.b.toLowerCase());
    }
    C.clear(), A.clear();
    const U = (g) => {
      if (C.has(g)) throw Error("Circular place constraints.");
      if (!A.has(g)) {
        C.add(g);
        for (const p of R.get(g) || []) U(p);
        C.delete(g), A.add(g);
      }
    };
    for (const g of R.keys()) U(g);
  } catch (b) {
    e.push({ severity: "error", line: a, message: "Layout description: " + b.message });
  }
  return { layout: { version: 1, priorityCap: x, groups: d, relations: h, pairs: l, faces: m }, diagnostics: e };
}
function hn(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const w = new Set(n.groups.map((v) => v.id.toLowerCase())), x = (v) => w.has(v.toLowerCase()) ? v : e.components.find((E) => E.synthetic && E.value.toLowerCase() === v.toLowerCase())?.name || e.focus + "/" + v;
    i = { ...n, groups: n.groups.map((v) => ({ ...v, members: v.members.map(x) })), relations: n.relations.map((v) => ({ ...v, a: x(v.a), b: x(v.b) })), faces: (n.faces || []).map((v) => ({ ...v, device: x(v.device) })), pairs: (n.pairs || []).map((v) => ({ ...v, members: v.members.map(x) })) };
  }
  const r = new Map(i.groups.map((w) => [w.id.toLowerCase(), w])), a = Object.values(t.contexts).flatMap((w) => w.devices.map((x) => x.name)), u = new Set([...Object.keys(t.contexts), ...a, ...e.components.map((w) => w.name)].map((w) => w.toLowerCase()));
  for (const w of r.values()) if (u.has((n ? e.focus + "/" + w.id : w.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + w.id);
  for (const w of r.values()) for (const x of w.members) if (!r.has(x.toLowerCase()) && !u.has(x.toLowerCase())) throw Error("Unknown @layout instance/device: " + x);
  for (const w of i.relations) for (const x of [w.a, w.b]) if (!r.has(x.toLowerCase()) && !u.has(x.toLowerCase())) throw Error("Unknown @layout place target: " + x);
  const s = (i.pairs || []).map((w) => ({ ...w, members: w.members.map((x) => {
    const v = e.components.find((T) => T.name.toLowerCase() === x.toLowerCase());
    if (!v || v.synthetic || v.block) throw Error("Unknown or non-visible @layout pair device: " + x);
    return v.name;
  }) })), d = (i.faces || []).map((w) => {
    const x = e.components.find((v) => v.name.toLowerCase() === w.device.toLowerCase());
    if (!x || !["Q", "M", "J", "Z"].includes(x.kind)) throw Error("Unknown or unsupported @layout face device: " + w.device);
    return { ...w, device: x.name };
  }), h = /* @__PURE__ */ new Map(), l = [], m = new Set(Object.keys(t.contexts).map((w) => w.toLowerCase()));
  for (const w of i.groups) {
    const x = [];
    for (const v of w.members) {
      if (r.has(v.toLowerCase())) {
        x.push({ group: v });
        continue;
      }
      for (const T of e.components) if (T.name.toLowerCase() === v.toLowerCase() || T.name.toLowerCase().startsWith(v.toLowerCase() + "/")) {
        if (h.has(T.name)) throw Error("Overlapping @layout membership: " + T.name);
        h.set(T.name, w.id), x.push({ cell: T.name, ...m.has(v.toLowerCase()) ? { instance: v } : {} });
      }
    }
    l.push({ id: w.id, direction: w.direction, members: x });
  }
  const f = /* @__PURE__ */ new Set();
  for (const w of l) for (const x of w.members) if (x.group) {
    const v = x.group.toLowerCase();
    if (f.has(v)) throw Error("Layout group has multiple parents: " + x.group);
    f.add(v);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: l, relations: i.relations, pairs: s, faces: d };
}
const Ae = () => /* @__PURE__ */ Object.create(null), he = (t) => t.toLowerCase();
function Rt(t) {
  const e = Ae();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!r) throw Error("Expected named parameter assignment, got: " + i);
    const a = he(r[1]);
    let u = r[2];
    if (u === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!s) throw Error("Expected = after parameter " + a);
      u = s[1];
    }
    if (u || (u = t[++n]), !u || /^params?:$/i.test(u)) throw Error("Missing value for parameter " + a);
    if (Object.hasOwn(e, a)) throw Error("Duplicate parameter: " + a);
    e[a] = u;
  }
  return e;
}
function bt(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, Ae()] : [t.slice(0, e), Rt(t.slice(e))];
}
function yt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = fn(t, e);
  t = n.source;
  const i = pn(t), r = [...n.diagnostics, ...i.diagnostics], a = Ae(), u = /* @__PURE__ */ new Set(["0"]), s = (b, C, A) => r.push({ severity: b, line: C, message: A }), d = (b, C, A, M = [], S = Ae(), R = 0) => {
    const U = { id: b, name: C, parent: A, ports: M, defaults: S, parameters: Ae(), definitions: Ae(), devices: [], instances: [], directives: [], line: R, statements: [], layoutDescription: i.scopes.get(R) || null };
    return a[b] = U, U;
  }, h = d("root", "Top", null), l = [h], m = [];
  let f = !1, w = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, C) => {
    const A = b.trim();
    !A || A.startsWith("*") || (A.startsWith("+") ? m.length ? m.at(-1).text += " " + A.slice(1).trim() : s("error", C + 1, "Continuation has no preceding statement.") : m.push({ text: A, line: C + 1 }));
  });
  for (const { text: b, line: C } of m)
    try {
      const A = He(b);
      if (!A.length) continue;
      const M = he(A[0]), S = l.at(-1);
      if (w) {
        s("warning", C, "Statement after .end is not rendered: " + b);
        continue;
      }
      if (M === ".control") {
        f = !0, s("warning", C, ".control script retained but not executed or rendered.");
        continue;
      }
      if (M === ".endc") {
        f = !1;
        continue;
      }
      if (f) continue;
      if (M === ".subckt") {
        if (A.length < 2) throw Error(".SUBCKT requires a name.");
        const [R, U] = bt(A.slice(2)), g = he(A[1]);
        if (Object.hasOwn(S.definitions, g)) throw Error("Duplicate subcircuit definition: " + A[1]);
        const p = R.map(he);
        if (new Set(p).size !== R.length || p.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (R.some(($) => /[{}()=]/.test($))) throw Error("Invalid formal port.");
        if (l.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const P = S.id + "/" + encodeURIComponent(g);
        S.definitions[g] = P, l.push(d(P, A[1], S.id, R, U, C));
        continue;
      }
      if (M === ".ends") {
        if (l.length === 1) throw Error("Unmatched .ENDS.");
        if (A[1] && he(A[1]) !== he(S.name)) throw Error(".ENDS name does not match " + S.name);
        l.pop();
        continue;
      }
      if (M === ".end") {
        if (l.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        w = !0;
        continue;
      }
      if (M === ".param") {
        const R = Rt(A.slice(1));
        for (const [U, g] of Object.entries(R)) {
          if (Object.hasOwn(S.parameters, U)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + U);
          S.parameters[U] = g;
        }
      }
      if (M === ".global") {
        if (A.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const R of A.slice(1)) u.add(he(R));
      }
      if (M.startsWith(".") && S.directives.push({ line: C, text: b }), M.startsWith("x")) {
        const [R, U] = bt(A.slice(1));
        if (!R.length) throw Error("X instance requires a subcircuit name.");
        const g = /;§pnba\s+(.+)$/i.exec(b)?.[1].split(")");
        S.instances.push({ name: A[0], nodes: R.slice(0, -1).map(he), definitionName: R.at(-1), definitionId: null, parameters: U, line: C, raw: b, pinNames: g });
      } else S.statements.push({ line: C, text: b });
    } catch (A) {
      s("error", C, A.message + " Statement: " + b);
    }
  l.length > 1 && s("error", l.at(-1).line, "Unclosed .SUBCKT " + l.at(-1).name), f && s("error", 0, "Unclosed .control block.");
  function x(b, C) {
    for (; b; ) {
      if (Object.hasOwn(b.definitions, he(C))) return b.definitions[he(C)];
      b = a[b.parent];
    }
    return null;
  }
  for (const b of Object.values(a)) {
    const C = [...b.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...b.statements], A = un(C.map((S) => S.text).join(`
`), { models: a[b.parent]?.models });
    b.devices = A.components.map((S) => ({ ...S, line: C[S.line - 1]?.line || b.line })), b.models = A.models, b === h && (h.title = A.title), r.push(...A.diagnostics.filter((S) => !S.message.includes("No supported components to render.") && !S.message.includes("300 components")).map((S) => ({ ...S, line: C[S.line - 1]?.line || b.line })));
    const M = new Set(b.devices.map((S) => he(S.name)));
    for (const S of b.instances)
      if (M.has(he(S.name)) && s("error", S.line, "Duplicate instance/device name: " + S.name), M.add(he(S.name)), S.definitionId = x(b, S.definitionName), !S.definitionId && !/^\{[\s\S]*\}$/.test(S.definitionName)) s("error", S.line, "Undefined subcircuit: " + S.definitionName + " in " + S.name);
      else if (S.definitionId) {
        const R = a[S.definitionId];
        R.ports.length !== S.nodes.length && s("error", S.line, `${S.name}: ${R.name} expects ${R.ports.length} ports; got ${S.nodes.length}.`);
      }
  }
  for (const b of Object.values(a)) delete b.statements;
  const v = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set();
  function E(b, C = []) {
    if (v.has(b)) {
      s("error", a[b].line, "Circular subcircuit reference: " + [...C, a[b].name].join(" → "));
      return;
    }
    if (!T.has(b)) {
      if (v.add(b), C.length >= 64) {
        s("error", a[b].line, "Subcircuit dependency nesting exceeds 64 levels."), v.delete(b), T.add(b);
        return;
      }
      for (const A of a[b].instances) A.definitionId && E(A.definitionId, [...C, a[b].name]);
      v.delete(b), T.add(b);
    }
  }
  for (const b of Object.keys(a)) E(b);
  !h.devices.length && !h.instances.length && s("error", 0, "No supported components or instances to render.");
  for (const b of r) !b.source && b.line && n.origins[b.line - 1] && (b.source = n.origins[b.line - 1].file, b.line = n.origins[b.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: h.title || "", scopes: a, globals: [...u], diagnostics: r, layoutDescription: i.layout };
}
const le = () => /* @__PURE__ */ Object.create(null), Te = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), rt = (t, e) => Te(t.map((n) => n.toLowerCase()), e.toLowerCase());
function mn(t, e = []) {
  const n = le(), i = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((a) => decodeURIComponent(a)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [a, u] of Object.entries(r.terminals)) i(u).terminals.push({ component: r.name, pin: a });
  for (const r of e) i(r);
  return n;
}
function gn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const wt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, bn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function We(t, e, n = (r) => r, i = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (u) => (r.push(u), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (u, s, d) => {
    const h = d.split(",").map((m) => m.trim());
    if (h.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + u);
    const l = s.toUpperCase() + "(" + h.map((m) => s.toLowerCase() === "v" ? n(m) : i(m, s)).join(",") + ")";
    return r.push(l), "@@" + (r.length - 1) + "@@";
  });
  let a = t.length;
  return t = t.replace(bn, (u, s, d) => {
    if (d.slice(s + u.length).trimStart().startsWith("(")) return u;
    const h = e(u.toLowerCase());
    if (h === void 0) return u;
    if (a += h.length + 2, a > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + h + ")";
  }), t.replace(/@@(\d+)@@/g, (u, s) => r[Number(s)]);
}
function yn(t, e, n, i) {
  const r = { ...e, ...n }, a = le(), u = /* @__PURE__ */ new Set(), s = le();
  for (const [h, l] of Object.entries(i)) s[h] = We(wt(l), (m) => t[m]);
  function d(h) {
    if (Object.hasOwn(s, h)) return s[h];
    if (Object.hasOwn(a, h)) return a[h];
    if (!Object.hasOwn(r, h)) return t[h];
    if (u.has(h)) {
      if (Object.hasOwn(t, h)) return t[h];
      throw Error("Circular parameter dependency: " + [...u, h].join(" → "));
    }
    return u.add(h), a[h] = We(wt(r[h]), d), u.delete(h), a[h];
  }
  for (const h of Object.keys(r)) d(h);
  return Object.assign(le(), t, a, s);
}
function it(t, e, n, i) {
  let r = "";
  for (let d = 0; d < t.length; ) {
    const h = t[d];
    if (h !== "{" && h !== "'") {
      r += h, d++;
      continue;
    }
    const l = d++;
    let m = 1, f = "";
    for (; d < t.length && m; d++) {
      if (h === "'") {
        t[d] === "'" && (m = 0);
        continue;
      }
      if (f) {
        t[d] === f && (f = "");
        continue;
      }
      if (t[d] === '"' || t[d] === "'") {
        f = t[d];
        continue;
      }
      t[d] === "{" && m++, t[d] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    r += h + We(t.slice(l + 1, d - 1), (w) => e[w], n, i) + (h === "{" ? "}" : "'");
  }
  const a = [];
  let u = 0, s = "";
  for (let d = 0; d < r.length; d++) {
    const h = r[d];
    if (s) {
      h === s && r[d - 1] !== "\\" && (s = "");
      continue;
    }
    if (h === '"' || h === "'") {
      s = h;
      continue;
    }
    if ("({".includes(h) && u++, ")}".includes(h) && u--, !u && (d === 0 || /\s/.test(r[d - 1]))) {
      const l = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(d));
      l && (a.push({ start: d, end: d + l[0].length, key: l[1].toLowerCase() }), d += l[0].length - 1);
    }
  }
  if (a.length) {
    let d = r.slice(0, a[0].start);
    a.forEach((h, l) => {
      const m = a[l + 1]?.start ?? r.length, f = r.slice(h.end, m);
      d += r.slice(h.start, h.end) + (f.includes("{") || ["refnode", "intnode"].includes(h.key) ? f : We(f, (w) => e[w], n, i));
    }), r = d;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class wn {
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
      for (let r in arguments[0])
        this.add(r, arguments[0][r], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(r) {
        this[r] = this[r] || [], n && this[r][i ? "unshift" : "push"](n);
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
class En {
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
  static addBinaryOp(e, n, i) {
    return O.max_binop_len = Math.max(e.length, O.max_binop_len), O.binary_ops[e] = n, i ? O.right_associative.add(e) : O.right_associative.delete(e), O;
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
      const i = { context: this, node: n };
      return O.hooks.run(e, i), i.node;
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
      return O.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
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
    let n = [], i, r;
    for (; this.index < this.expr.length; )
      if (i = this.code, i === O.SEMCOL_CODE || i === O.COMMA_CODE)
        this.index++;
      else if (r = this.gobbleExpression())
        n.push(r);
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
    let e, n, i, r, a, u, s, d, h;
    if (u = this.gobbleToken(), !u || (n = this.gobbleBinaryOp(), !n))
      return u;
    for (a = { value: n, prec: O.binaryPrecedence(n), right_a: O.right_associative.has(n) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + n), r = [u, a, s]; n = this.gobbleBinaryOp(); ) {
      if (i = O.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      a = { value: n, prec: i, right_a: O.right_associative.has(n) }, h = n;
      const l = (m) => a.right_a && m.right_a ? i > m.prec : i <= m.prec;
      for (; r.length > 2 && l(r[r.length - 2]); )
        s = r.pop(), n = r.pop().value, u = r.pop(), e = {
          type: O.BINARY_EXP,
          operator: n,
          left: u,
          right: s
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + h), r.push(a, e);
    }
    for (d = r.length - 1, e = r[d]; d > 1; )
      e = {
        type: O.BINARY_EXP,
        operator: r[d - 1].value,
        left: r[d - 2],
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
    let e, n, i, r;
    if (this.gobbleSpaces(), r = this.searchHook("gobble-token"), r)
      return this.runHook("after-token", r);
    if (e = this.code, O.isDecimalDigit(e) || e === O.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === O.SQUOTE_CODE || e === O.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === O.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, O.max_unop_len), i = n.length; i > 0; ) {
        if (O.unary_ops.hasOwnProperty(n) && (!O.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !O.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const a = this.gobbleToken();
          return a || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: O.UNARY_EXP,
            operator: n,
            argument: a,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
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
      let i;
      if (n === O.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== O.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
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
      } : (n === O.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: O.MEMBER_EXP,
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
    return i = this.code, O.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === O.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === O.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const n = this.index, i = this.expr.charAt(this.index++);
    let r = !1;
    for (; this.index < this.expr.length; ) {
      let a = this.expr.charAt(this.index++);
      if (a === i) {
        r = !0;
        break;
      } else if (a === "\\")
        switch (a = this.expr.charAt(this.index++), a) {
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
            e += a;
        }
      else
        e += a;
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
    let i = !1, r = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let a = this.code;
      if (a === e) {
        i = !0, this.index++, e === O.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (a === O.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === O.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === O.CBRACK_CODE)
            for (let u = n.length; u < r; u++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const u = this.gobbleExpression();
        (!u || u.type === O.COMPOUND) && this.throwError("Expected comma"), n.push(u);
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
const xn = new wn();
Object.assign(O, {
  hooks: xn,
  plugins: new En(O),
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
const ke = (t) => new O(t).parse(), vn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(O).filter((t) => !vn.includes(t) && ke[t] === void 0).forEach((t) => {
  ke[t] = O[t];
});
ke.Jsep = O;
const _n = "ConditionalExpression";
var Nn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const a = this.gobbleExpression();
          if (a || this.throwError("Expected expression"), n.node = {
            type: _n,
            test: i,
            consequent: r,
            alternate: a
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let u = i;
            for (; u.right.operator && t.binary_ops[u.right.operator] <= 0.9; )
              u = u.right;
            n.node.test = u.right, u.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ke.plugins.register(Nn);
const Cn = "ConditionalExpression";
var Sn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const a = this.gobbleExpression();
          if (a || this.throwError("Expected expression"), n.node = {
            type: Cn,
            test: i,
            consequent: r,
            alternate: a
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let u = i;
            for (; u.right.operator && t.binary_ops[u.right.operator] <= 0.9; )
              u = u.right;
            n.node.test = u.right, u.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ke.plugins.register(Sn);
const In = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Et = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, pe = (t) => Number(t) > 0.5;
function Pe(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function r(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (d) => {
      if (d[0] === '"' || d[0] === "'") return d;
      const [, h, l, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(d), f = l.toLowerCase(), w = f.startsWith("meg") ? 1e6 : f.startsWith("mil") ? 254e-7 : In[f[0]] || 1;
      return "(" + (m ? +(h + (h.includes(".") ? "" : ".") + m) : Number(h)) * w + ")";
    }), a(ke(s));
  }
  function a(s) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const d = s.name.toLowerCase();
      if (d === "pi") return Math.PI;
      if (d === "e") return Math.E;
      if (!Object.hasOwn(e, d)) throw Error("Undefined structural parameter: " + s.name);
      if (n.has(d)) throw Error("Circular structural parameter: " + d);
      n.add(d);
      const h = r(e[d]);
      return n.delete(d), h;
    }
    if (s.type === "ConditionalExpression") return pe(a(s.test)) ? a(s.consequent) : a(s.alternate);
    if (s.type === "UnaryExpression") {
      const d = a(s.argument);
      if (s.operator === "-") return -d;
      if (s.operator === "+") return +d;
      if (s.operator === "!" || s.operator === "~") return !pe(d);
    }
    if (s.type === "BinaryExpression") {
      const d = a(s.left);
      if (s.operator === "&&") return pe(d) && pe(a(s.right));
      if (s.operator === "||") return pe(d) || pe(a(s.right));
      const h = a(s.right);
      switch (s.operator) {
        case "+":
          return d + h;
        case "-":
          return d - h;
        case "*":
          return d * h;
        case "/":
          return d / h;
        case "**":
          return d ** h;
        case "%":
          return d % h;
        case "^":
          return pe(d) !== pe(h);
        case "&":
          return pe(d) && pe(h);
        case "|":
          return pe(d) || pe(h);
        case ">":
          return d > h;
        case "<":
          return d < h;
        case ">=":
          return d >= h;
        case "<=":
          return d <= h;
        case "==":
        case "===":
          return d === h;
        case "!=":
        case "!==":
          return d !== h;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const d = s.callee.name.toLowerCase();
      if (d === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return pe(a(s.arguments[0])) ? a(s.arguments[1]) : a(s.arguments[2]);
      }
      if (Object.hasOwn(Et, d)) return Et[d](...s.arguments.map(a));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const u = r(t);
  if (typeof u == "number" && !Number.isFinite(u)) throw Error("Structural expression is not finite.");
  return u;
}
function $e(t, { isolate: e = "" } = {}) {
  gn(t);
  const n = le(), i = /* @__PURE__ */ new Map();
  let r = 0, a = 0;
  function u(s, d, h, l, m, f, w) {
    if (d.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const x = t.scopes[s], v = d.length ? Te(d.slice(0, -1), d.at(-1)) : "", T = le();
    if (e && v === e && (h = le()), w.some((S) => S.scopeId === s)) throw Error("Circular subcircuit reference at " + v);
    const E = yn(l, x.defaults, x.parameters, m);
    function b(S) {
      if (/^\{[\s\S]*\}$/.test(S)) {
        const U = Pe(S, E);
        S = String(typeof U == "boolean" ? Number(U) : U);
      }
      /^"[\s\S]*"$/.test(S) && (S = S.slice(1, -1));
      const R = S.toLowerCase();
      return Object.hasOwn(h, R) ? h[R] : t.globals.includes(R) ? rt([], R) : T[R] || (T[R] = rt(d, R));
    }
    const C = { id: v, path: d, scopeId: s, name: f?.name || "Top", definition: x.name, ports: x.ports.map((S) => ({ name: S, node: b(S) })), params: E, nodes: T, models: le(), devices: [], children: [], raw: f?.raw || "", line: f?.line || 0 };
    n[v] = C, i.set(v, b);
    const A = [...w, C];
    function M(S) {
      if (!S) return "";
      let R = x;
      for (; R; ) {
        if (R.directives.some((U) => new RegExp("^\\.model\\s+" + S.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(U.text))) {
          const U = [...A].reverse().find((g) => g.scopeId === R.id);
          return Te(U?.path || [], S.toLowerCase());
        }
        R = t.scopes[R.parent];
      }
      return S;
    }
    for (const S of x.directives.filter((R) => /^\.model\b/i.test(R.text))) {
      const R = /^\.model\s+(\S+)/i.exec(S.text)?.[1];
      if (!R) continue;
      const U = M(R), g = x.models[R.toLowerCase()], p = it(S.text, E, b, (P) => Te(d, P));
      C.models[U] = { ...g, name: U, raw: p.replace(/^(\.model\s+)\S+/i, (P, $) => $ + U), instanceId: v, parameters: E };
    }
    for (const S of x.devices) {
      if (++a > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const R = le();
      for (const [g, p] of Object.entries(S.terminals)) R[g] = b(p);
      const U = M(S.model);
      C.devices.push({ ...S, name: Te(d, S.name), localName: S.name, instanceId: v, terminals: R, model: U, parameters: E });
    }
    for (const S of x.instances) {
      let R = S.definitionId;
      if (!R) {
        const P = String(Pe(S.definitionName, E)).toLowerCase();
        let $ = x;
        for (; $ && !R; )
          R = $.definitions[P], $ = t.scopes[$.parent];
        if (!R) throw Error("Undefined selected subcircuit: " + P);
      }
      const U = t.scopes[R], g = le();
      if (U.ports.length !== S.nodes.length) throw Error(S.name + ": expected " + U.ports.length + " ports; got " + S.nodes.length);
      U.ports.forEach((P, $) => {
        g[P.toLowerCase()] = b(S.nodes[$]);
      });
      const p = u(R, [...d, S.name], g, E, S.parameters, S, A);
      S.pinNames?.length === p.ports.length && p.ports.forEach((P, $) => {
        P.label = S.pinNames[$];
      }), C.children.push(p);
    }
    return C;
  }
  try {
    let m = function(f, w) {
      const x = w.split(":");
      if (x.length === 1) return { owner: f, name: w };
      const v = x.pop();
      for (const T of [[...f.path, ...x], x]) {
        const E = d.get(T.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: v };
      }
      throw Error("Unknown hierarchical reference: " + w);
    };
    const s = u(t.rootId, [], le(), le(), le(), null, []), d = new Map(Object.values(n).map((f) => [f.id.toLowerCase(), f])), h = Object.assign(le(), ...Object.values(n).map((f) => f.models)), l = (f) => h[f] || Object.entries(h).find(([w]) => w.startsWith(f + "."))?.[1];
    for (const f of Object.values(n)) for (const w of f.devices) {
      const x = t.scopes[f.scopeId].devices.find((E) => E.name === w.localName), v = (E) => {
        const b = m(f, E);
        return i.get(b.owner.id)(b.name);
      }, T = (E, b = "", C = "") => {
        const A = m(f, E), M = A.owner.devices.find((S) => S.localName.toLowerCase() === A.name.toLowerCase());
        if (b.toLowerCase() === "ix") {
          const S = A.owner.ports.find((R, U) => R.name.toLowerCase() === A.name.toLowerCase() || String(U + 1) === A.name);
          if (S) return A.owner.id + ":" + S.name;
        }
        if (!M) {
          if (C) throw Error(w.name + ": referenced " + C + " device " + E + " was not found.");
          return Te(A.owner.path, A.name);
        }
        if (C && M.kind !== C) throw Error(w.name + ": " + E + " must be a " + C + " device.");
        return M.name;
      };
      if (w.value = it(x.value, f.params, v, T), x.model && (w.value = w.value.replace(x.model, w.model)), w.kind === "M" && Object.keys(w.terminals).length === 3) {
        let E = l(w.model), b = !1;
        const C = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !C.has(E.name); ) {
          C.add(E.name);
          const A = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (A) {
            b = A[1] === void 0 || Number(Pe(A[1], E.parameters)) >= 0.5;
            break;
          }
          const M = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = l(M + (E.baseModel || "").toLowerCase()) || l((E.baseModel || "").toLowerCase());
        }
        C.size && (w.type = "spice_" + (b ? "pmos3" : "nmos3"));
      }
      w.controlSources = (x.controlSources || []).map((E) => T(E, "", "V")), w.controlSource = w.controlSources[0] || "", w.coupledInductors = (x.coupledInductors || []).map((E) => T(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...x.controlSources || [], ...x.coupledInductors || []])) {
        const b = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        w.value = w.value.replace(new RegExp("(?<![\\w./%])" + b + "(?![\\w.$])", "g"), () => T(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: s, contexts: n };
  } catch (s) {
    throw s.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: s.message }], s;
  }
}
function Oe(t) {
  return [...t.devices, ...t.children.flatMap(Oe)];
}
function Re(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function lt(t, e = {}) {
  const n = new Map(t.components.map((g) => [g.name, g])), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), a = [], u = (g, p) => JSON.stringify([g, p].sort()), s = (g) => e[g]?.potential !== null && e[g]?.potential !== void 0;
  for (const g of t.components) {
    for (const [y, I] of Object.entries(g.terminals))
      i.has(I) || i.set(I, []), i.get(I).push({ device: g.name, pin: y });
    if (g.kind === "R") {
      const y = Object.values(g.terminals);
      if (y.length === 2 && y[0] !== y[1]) {
        const I = u(...y);
        r.has(I) || r.set(I, []), r.get(I).push(g);
      }
    }
    const p = g.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(g.kind) ? "fet" : null, P = p === "bjt" ? /_(npn|pnp)$/.exec(g.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(g.type)?.[1];
    if (!p || !P) continue;
    const $ = g.terminals, H = $[p === "bjt" ? "B" : "G"], q = $[p === "bjt" ? "C" : "D"], ne = $[p === "bjt" ? "E" : "S"];
    [H, q, ne].some((y) => y === void 0) || H === ne || q === ne || a.push({ id: g.name, family: p, polarity: P, control: H, drain: q, source: ne, body: g.kind === "M" ? $.B : void 0 });
  }
  const d = [], h = /* @__PURE__ */ new Set(), l = (g, p, P, $, H, q = "basic", ne = [], y = "high") => {
    const I = [.../* @__PURE__ */ new Set([...p, ...ne])], G = JSON.stringify([g, q, [...I].sort()]);
    h.has(G) || (h.add(G), d.push({ id: "motif" + d.length, kind: g, variant: q, transistors: p, members: I, roles: P, nets: $, evidence: H, confidence: y }));
  }, m = (g, p) => g.family === p.family && g.polarity === p.polarity, f = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), v = new Map(a.map((g) => [g.id, g])), T = (g, p, P) => {
    g.has(p) || g.set(p, []), g.get(p).push(P);
  }, E = (g, p) => JSON.stringify([g.family, g.polarity, p]);
  for (const g of a)
    T(f, E(g, g.control), g), T(w, E(g, g.source), g), g.family === "bjt" && (i.get(g.source) || []).some((p) => {
      const P = v.get(p.device);
      return P && P.family === "bjt" && !m(g, P) && P.source === g.source;
    }) && T(x, E(g, g.drain), g);
  const b = (g) => [{ node: g.source, resistor: null }, ...(i.get(g.source) || []).flatMap((p) => {
    const P = n.get(p.device);
    if (P.kind !== "R") return [];
    const $ = Object.values(P.terminals).find((H) => H !== g.source);
    return $ !== void 0 && $ !== g.control && $ !== g.drain ? [{ node: $, resistor: P.name }] : [];
  })];
  for (const g of a) g.control === g.drain && l("diode-connected", [g.id], { reference: g.id }, { control: g.control, return: g.source }, ["control-drain-short", g.family]);
  for (const g of a) {
    const p = f.get(E(g, g.control));
    if (p.filter((y) => y.control === y.drain).length > 1) continue;
    let P = null;
    if (g.control !== g.drain && g.family === "bjt" && (P = (f.get(E(g, g.drain)) || []).find((y) => y.id !== g.id && m(y, g) && y.control === g.drain && y.source === g.control && s(y.drain))), g.control !== g.drain && !P) continue;
    const $ = b(g), H = [];
    let q = null, ne = [];
    for (const y of p) {
      if (y.id === g.id || y.id === P?.id || y.drain === g.drain || y.drain === y.control) continue;
      const I = $.flatMap((G) => b(y).filter((B) => G.node === B.node).map((B) => ({ node: G.node, rs: [G.resistor, B.resistor].filter(Boolean) }))).find((G) => q === null || G.node === q);
      I && (q = I.node, H.push(y.id), ne.push(...I.rs));
    }
    if (H.length) {
      const y = H.every((I) => v.get(I).body === g.body);
      l("current-mirror", [g.id, ...H, ...P ? [P.id] : []], { reference: g.id, outputs: H, ...P ? { helper: P.id } : {} }, { control: g.control, return: q }, ["same-polarity", "shared-control", P ? "emitter-follower-reference" : "diode-reference", ne.length ? "resistive-common-return" : "shared-return", y ? "compatible-bodies" : "different-body-connections"], P ? "assisted" : ne.length ? "degenerated" : "basic", [...ne, ...P ? [P.id] : []], y ? "high" : "medium");
    }
  }
  const C = [], A = /* @__PURE__ */ new Set(), M = (g, p) => {
    const P = JSON.stringify([g.id, p.id].sort());
    A.has(P) || (A.add(P), C.push([g, p]));
  };
  for (const g of w.values()) if (!s(g[0].source)) {
    const p = g.filter((P) => P.control !== P.drain);
    p.length === 2 ? M(...p) : p.length > 2 && new Set(p.map((P) => P.control)).size > 1 && l("differential-pair", p.map((P) => P.id), { inputs: p.map((P) => P.id) }, { tail: p[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const g of x.values()) for (let p = 0; p < g.length; p++) for (let P = p + 1; P < g.length; P++) M(g[p], g[P]);
  for (const [g, p] of C) {
    if (g.control === p.control || g.control === g.drain || p.control === p.drain) continue;
    if (g.source === p.source && g.drain !== p.drain && !s(g.source)) {
      const H = (i.get(g.source) || []).some((ne) => ne.device !== g.id && ne.device !== p.id), q = w.get(E(g, g.source)).length === 2;
      l("differential-pair", [g.id, p.id], { inputs: [g.id, p.id] }, { tail: g.source }, ["same-polarity", "distinct-controls", "shared-tail", H ? "tail-bias-connection" : "unbiased-tail", q ? "two-input-tail" : "multi-input-tail"], "basic", [], H && q && g.body === p.body ? "high" : "medium");
    }
    if (g.family !== "bjt" || g.drain !== p.drain || g.source === p.source) continue;
    const P = a.filter((H) => H.family === "bjt" && H.polarity !== g.polarity && H.source === g.source), $ = a.filter((H) => H.family === "bjt" && H.polarity !== g.polarity && H.source === p.source);
    for (const H of P) for (const q of $) H.id !== q.id && H.control === q.control && H.drain !== q.drain && H.control !== H.drain && q.control !== q.drain && l("differential-pair", [g.id, p.id, H.id, q.id], { inputs: [g.id, p.id], commonBase: [H.id, q.id] }, { inputCollectors: g.drain, bias: H.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const g of a) if (g.family === "bjt" && g.control !== g.drain) {
    const p = r.get(u(g.drain, g.control)) || [], P = r.get(u(g.control, g.source)) || [];
    p.length === 1 && P.length === 1 && l("vbe-multiplier", [g.id], { transistor: g.id, collectorResistor: p[0].name, emitterResistor: P[0].name }, { control: g.control, collector: g.drain, emitter: g.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [p[0].name, P[0].name]);
  }
  const S = a.filter((g) => g.family === "bjt"), R = /* @__PURE__ */ new Map();
  for (const g of S) T(R, g.control, g);
  const U = (g) => (i.get(g) || []).filter((p) => v.has(p.device));
  for (const g of S) if (g.control !== g.drain) {
    for (const p of R.get(g.source) || []) if (p.id !== g.id && m(g, p) && p.drain === g.control && p.source !== g.drain) {
      const P = r.get(u(g.source, p.source)) || [];
      P.length === 1 && l("current-limit-pair", [g.id, p.id], { driver: g.id, output: p.id, senseResistor: P[0].name }, { sense: g.source, drive: g.control, output: p.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [P[0].name]);
    }
    for (const p of R.get(g.source) || []) p.id !== g.id && m(g, p) && p.control !== p.drain && g.drain === p.drain && p.source !== g.control && l("darlington-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.source, collector: g.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (R.get(g.source) || []).length === 1 ? "high" : "medium");
    for (const p of R.get(g.drain) || []) p.id !== g.id && !m(g, p) && p.control !== p.drain && g.source === p.drain && p.source !== g.control && U(g.drain).length === 2 && l("sziklai-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.drain, feedback: g.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const p of i.get(g.drain) || []) {
      const P = v.get(p.device);
      !P || P.family !== "bjt" || P.id === g.id || !m(g, P) || P.source !== g.drain || s(g.drain) || P.control === g.control || P.control === P.drain || P.drain === g.source || U(g.drain).length !== 2 || l("cascode-pair", [g.id, P.id], { driver: g.id, output: P.id }, { link: g.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const g of S.filter((p) => p.polarity === "npn" && s(p.drain))) for (const p of S.filter((P) => P.polarity === "pnp" && s(P.drain))) {
    if (e[g.drain].potential <= e[p.drain].potential) continue;
    const P = b(g).flatMap(($) => b(p).filter((H) => $.node === H.node && !s($.node)).map((H) => ({ node: $.node, rs: [$.resistor, H.resistor].filter(Boolean) })))[0];
    P && l("push-pull-pair", [g.id, p.id], { upper: g.id, lower: p.id }, { output: P.node }, ["complementary-polarity", "ordered-collector-supplies", P.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", P.rs);
  }
  return d;
}
function dt(t, e, n = (i) => i) {
  const i = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([a, u]) => [a, i(u)])), nets: Object.fromEntries(Object.entries(r.nets).map(([a, u]) => [a, n(u)])) }));
}
function Tn(t, e, n) {
  const i = [], r = /* @__PURE__ */ new Set(), a = new Map(t.components.map((u) => [u.name, u]));
  for (const u of n) {
    if (new Set(u.members).size !== u.members.length) throw Error("Duplicate @layout pair member.");
    const s = u.members.map((f) => a.get(f));
    if (s.some((f) => !f)) throw Error("Unknown @layout pair device.");
    const d = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[u.kind], h = u.kind === "differential" && s.length === 2 ? t.components.filter((f) => !u.members.includes(f.name) && Object.values(f.terminals).includes(s[0].terminals.E ?? s[0].terminals.S)) : [], l = lt({ ...t, components: [...s, ...h] }, e), m = l.find((f) => f.kind === d && f.confidence === "high" && u.members.every((w) => f.members.includes(w)));
    if (!m) throw Error("Invalid @layout pair " + u.kind + " { " + u.members.join(" ") + " }: electrical structure does not match.");
    for (const f of l.filter((w) => w === m || w.kind === "diode-connected" && w.members.every((x) => m.members.includes(x)))) {
      const w = JSON.stringify([f.kind, [...f.members].sort()]);
      r.has(w) || (r.add(w), i.push({ ...f, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function An(t, e, n = lt(t, e)) {
  const i = /* @__PURE__ */ new Map(), r = t.components.filter((f) => f.kind === "R"), a = t.components.filter((f) => f.kind === "Q"), u = new Map(t.components.map((f) => [f.name, f])), s = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), h = (f) => Object.values(f.terminals), l = (f, w, x) => {
    f && i.set(f.name, { reverse: h(f)[0] !== w, reason: x });
  };
  for (const f of a) {
    const { C: w, B: x, E: v } = f.terminals, T = f.type.endsWith("pnp"), E = f.type.endsWith("npn");
    !T && !E || (s.has(v) || s.set(v, []), s.get(v).push(f), w === x && e[v]?.potential !== null && e[v]?.potential !== void 0 && d.set(w, { potential: e[v].potential }));
  }
  for (const f of n) if (f.kind === "vbe-multiplier" && f.confidence === "high") {
    const w = u.get(f.roles.transistor), x = w.type.endsWith("pnp"), v = u.get(x ? f.roles.emitterResistor : f.roles.collectorResistor), T = u.get(x ? f.roles.collectorResistor : f.roles.emitterResistor);
    l(v, w.terminals[x ? "E" : "C"], "recognized VBE multiplier"), l(T, w.terminals.B, "recognized VBE multiplier");
  }
  for (const f of r) {
    const [w, x] = h(f), v = d.get(w), T = d.get(x);
    v && T && v.potential !== T.potential && l(f, v.potential > T.potential ? w : x, "diode-connected bias reference");
  }
  const m = /* @__PURE__ */ new Map();
  for (const f of r) {
    const w = h(f);
    if (!w.some((x) => e[x]?.potential !== null && e[x]?.potential !== void 0))
      for (const x of w)
        m.has(x) || m.set(x, []), m.get(x).push(f);
  }
  for (const [f, w] of m)
    if (!(w.length > 12))
      for (const x of w) for (const v of w) {
        if (x === v) continue;
        const T = h(x).find((A) => A !== f), E = h(v).find((A) => A !== f), b = s.get(T)?.find((A) => A.type.endsWith("npn")), C = s.get(E)?.find((A) => A.type.endsWith("pnp"));
        b && C && (l(x, T, "complementary emitter output"), l(v, f, "complementary emitter output"));
      }
  return i;
}
function On(t) {
  const e = t.components.filter((a) => a.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((a) => a.kind === "R").map((a) => Object.values(a.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const u = a.terminals.E;
    n.has(u) || n.set(u, []), n.get(u).push(a);
  }
  for (const a of e) {
    const { B: u, C: s, E: d } = a.terminals;
    if (u === d || !i.has([u, d].sort().join("|"))) continue;
    const h = n.get(u) || [];
    if (!(h.length > 16))
      for (const l of h) {
        if (l === a) continue;
        if (l.terminals.B === s) {
          r.add(a.name);
          break;
        }
        const m = n.get(l.terminals.B) || [];
        if (m.length <= 16 && m.some((f) => f !== a && f !== l && f.terminals.B === s)) {
          r.add(a.name);
          break;
        }
      }
  }
  return r;
}
const De = 22;
function st(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const je = (t) => ["pwr", "ret", "bias"].includes(t), kn = (t) => String(t).split("/").at(-1).toLowerCase(), Mt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[kn(t)] || "unknown", xt = (t) => {
  const e = st(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Mt(t);
};
function Rn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (u, s, d) => {
    e.has(u) || e.set(u, []), e.get(u).push({ node: s, delta: d });
  };
  for (const u of t)
    if (u.kind === "V")
      try {
        let s = u.value.trim();
        const d = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (d && Number(Pe(d[1], u.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const h = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!h) continue;
        const l = Pe(h[1], u.parameters);
        if (typeof l != "number" || !Number.isFinite(l)) continue;
        i(u.terminals["-"], u.terminals["+"], l), i(u.terminals["+"], u.terminals["-"], -l);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), a = /* @__PURE__ */ new Set();
  for (const u of ["0", ...e.keys()]) {
    if (a.has(u)) continue;
    const s = /* @__PURE__ */ new Map([[u, 0]]), d = [u];
    a.add(u);
    let h = !1;
    for (let l = 0; l < d.length; l++) for (const m of e.get(d[l]) || []) {
      const f = s.get(d[l]) + m.delta;
      s.has(m.node) ? Math.abs(s.get(m.node) - f) > 1e-8 * Math.max(1, Math.abs(f)) && (h = !0) : (s.set(m.node, f), a.add(m.node), d.push(m.node));
    }
    h && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [l, m] of s) r[l] = { value: m, reference: u, known: u === "0" && !h, consistent: !h };
  }
  return { nodes: r, diagnostics: n };
}
function Mn(t, e, n = null) {
  const i = Rn(Oe(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), a = /* @__PURE__ */ Object.create(null);
  for (const l of Object.values(e.nodes)) {
    const m = st(l.name), f = Mt(l.name);
    r[l.name] = { role: m !== "unknown" ? m : f, roleSource: m !== "unknown" ? "node-name" : f !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[l.name]?.known ? i.nodes[l.name].value : null };
  }
  if (e.localScope) for (const l of e.interfaceBindings) {
    const m = r[l.local], f = xt(l.port);
    m && m.potential === null && ["pwr", "ret"].includes(f) && (m.potential = f === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(l.port) ? 0 : -1, m.potentialSource = "symbolic-port-order");
  }
  const u = n?.pairs?.length ? Tn(e, r, n.pairs) : lt(e, r), s = An(e, r, u), d = On(e), h = (l, m, f) => {
    const w = { role: r[f].role, roleSource: r[f].roleSource }, x = l.block?.ports.find((E) => E.pin === m);
    if (x?.implicit || !l.block && !l.synthetic) return w;
    const v = l.synthetic ? l.value : x?.name || x?.label, T = xt(v);
    return T !== "unknown" ? { role: T, roleSource: st(v) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : je(w.role) ? { ...w, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const l of e.components) {
    const m = Object.fromEntries(Object.entries(l.terminals).map(([U, g]) => [U, { ...r[g], ...h(l, U, g) }])), f = Object.values(m), w = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(l.type), x = w && !s.has(l.name) && f.length === 2 && f.every((U) => !je(U.role) && (U.potential === null || U.role !== "unknown")), v = l.terminals["+"], T = l.terminals["-"], E = [v, T].filter((U) => U && U !== "0"), b = l.kind === "V" && E.some((U) => je(r[U]?.role)) && !E.some((U) => ["in", "out", "io", "fb"].includes(r[U]?.role)) && [v, T].every((U) => i.nodes[U]?.known), C = v === "0" ? T : v, A = Object.keys(l.terminals), M = (U) => je(U.role) ? U.potential !== null ? U.potential > 0 ? "high" : "low" : U.role === "ret" ? "low" : "high" : "signal";
    let S = !1;
    A.length === 2 && (l.kind === "V" && f.every((U) => U.potential !== null) ? S = f[0].potential < f[1].potential : l.terminals[A[0]] === "0" ? S = !0 : l.terminals[A[1]] === "0" ? S = !1 : f.every((U) => U.potential !== null) ? S = f[0].potential < f[1].potential : S = M(f[0]) === "low" || M(f[1]) === "high" && M(f[0]) === "signal"), s.has(l.name) && (S = s.get(l.name).reverse);
    const R = l.synthetic ? "" : l.name.startsWith(e.focus + "/") ? l.name.slice(e.focus.length + 1) : l.name;
    a[l.name] = { version: De, kind: l.kind, polarity: l.type.endsWith("pnp") ? "p" : l.type.endsWith("npn") ? "n" : null, currentLimiter: d.has(l.name), orientationReason: s.get(l.name)?.reason || null, owner: R.includes("/") ? R.slice(0, R.lastIndexOf("/")) : "", passive: w, source: ["V", "I", "E", "F", "G", "H"].includes(l.kind) || l.kind === "B" && !w, ports: m, horizontal: x, orientation: x ? "horizontal" : S ? "vertical-reversed" : "vertical", flexible: A.length === 2 && (w || ["V", "I", "B", "F", "H"].includes(l.kind)), supply: !!b, voltage: b ? i.nodes[C].value : null };
  }
  return { version: De, nodes: r, cells: a, motifs: u, diagnostics: i.diagnostics };
}
function Lt(t, e) {
  const n = e.ports.map((r, a) => ({ pin: "P" + a, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), i = new Set(Oe(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const a = rt([], r);
    i.has(a) && !n.some((u) => u.node === a) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: a, implicit: !0 });
  }
  return n;
}
function Ve(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const r = t, a = t.contexts[i];
  if (!a) throw Error("Unknown instance: " + i);
  i && (t = $e(t.ir, { isolate: i }));
  const u = t.contexts[i];
  if (!u) throw Error("Unknown instance: " + i);
  const s = [], d = [];
  function h(x) {
    d.push(...Object.values(x.nodes), ...x.ports.map((T) => T.node));
    const v = [...x.devices.map((T) => ({ line: T.line, device: T })), ...x.children.map((T) => ({ line: T.line, child: T }))].sort((T, E) => T.line - E.line);
    for (const T of v) {
      if (T.device) {
        const A = T.device;
        s.push({ ...A, layoutLabel: [...x.path.slice(u.path.length), A.localName].join("/") });
        continue;
      }
      const E = T.child;
      if (e === "flat" || n.has(E.id)) {
        h(E);
        continue;
      }
      const b = Lt(t, E), C = le();
      b.forEach((A) => {
        C[A.pin] = A.node;
      }), s.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: C, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(u.path.length).join("/"), block: { definitionId: E.scopeId, ports: b, parameters: E.params } });
    }
  }
  h(u);
  for (const [x, v] of u.ports.entries()) s.push({ name: "@port/" + i + "/" + x, kind: "PORT", type: "spice_port", terminals: { A: v.node }, layoutLabel: v.name, value: v.name, raw: "Interface port " + v.name, synthetic: !0 });
  if (s.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const l = Object.assign(le(), ...Object.values(t.contexts).map((x) => x.models)), m = { title: i || t.ir.title, components: s, nodes: mn(s, d), models: l, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  m.interfaceBindings = u.ports.map((x, v) => ({ port: x.name, local: x.node, parent: a.ports[v].node }));
  const f = /* @__PURE__ */ new Map();
  for (const x of a.ports)
    f.has(x.node) || f.set(x.node, []), f.get(x.node).push(x.name);
  m.interfaceAliases = [...f].filter(([, x]) => x.length > 1).map(([x, v]) => ({ node: x, ports: v })), m.topology = Ln(r, m);
  const w = hn(t, m);
  return m.layout = Mn(t, m, w), m.layout.description = w, m;
}
function Ln(t, e) {
  const n = Oe(t.contexts[e.focus]);
  e.localScope && (t = $e(t.ir, { isolate: e.focus }));
  const i = [], r = /* @__PURE__ */ new Set();
  for (const s of e.components)
    if (!s.synthetic)
      if (s.kind === "X") {
        const d = t.contexts[s.instanceId];
        if (!d) throw Error("Projection contains an unknown block.");
        const h = Lt(t, d);
        if (JSON.stringify(Object.entries(s.terminals)) !== JSON.stringify(h.map((l) => [l.pin, l.node]))) throw Error("Block interface topology mismatch: " + s.name);
        i.push(...Oe(d));
      } else i.push(s);
  for (const s of i) {
    if (r.has(s.name)) throw Error("Projection duplicates " + s.name);
    r.add(s.name);
  }
  const a = Re(i), u = Oe(t.contexts[e.focus]);
  if (a !== Re(u)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const s = new Map(e.interfaceBindings.map((l) => [l.local, l.parent])), d = (l) => s.get(l) ?? l, h = i.map((l) => ({ ...l, terminals: Object.fromEntries(Object.entries(l.terminals).map(([m, f]) => [m, d(f)])), value: it(l.value, {}, d, (m) => m) }));
    if (Re(h) !== Re(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: a, boundSignature: Re(n), boundaryVerified: !0 };
}
function Qe(t) {
  const e = le(), n = le();
  for (const i of t.components) {
    const r = le(), a = le();
    for (const [u, s] of Object.entries(i.terminals))
      r[u] = [t.nodes[s].bit], a[u] = "input";
    e[i.name] = { type: i.type, port_directions: a, connections: r, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((u) => ({ pin: u.pin, label: u.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((u, s) => ({ pin: u, label: i.pinLabels?.[s] || u })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: dt(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Pn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, r = (h) => (n.has(h) || n.set(h, n.size + 2), n.get(h));
  Object.entries(t.modules.circuit.cells).forEach(([h, l], m) => {
    const f = "c" + m;
    e.set(f, h);
    const w = Object.fromEntries(Object.entries(l.connections).map(([x, v]) => [x, v.map(r)]));
    i[f] = { type: l.type, connections: w, port_directions: l.port_directions, attributes: { displayRef: l.attributes.displayRef || l.attributes.ref || "", value: l.attributes.value || "", name: l.attributes.name || "" } }, l.spiceBlock && (i[f].spiceBlock = l.spiceBlock), l.spiceSymbol && (i[f].spiceSymbol = l.spiceSymbol), l.spiceLayout && (i[f].spiceLayout = l.spiceLayout);
  });
  const a = new Map([...e].map(([h, l]) => [l, h])), u = t.modules.circuit.spiceLayoutDescription, s = u ? { ...u, faces: (u.faces || []).map((h) => ({ ...h, device: a.get(h.device) })), pairs: (u.pairs || []).map((h) => ({ ...h, members: h.members.map((l) => a.get(l)) })), groups: u.groups.map((h) => ({ ...h, members: h.members.map((l) => l.cell ? { ...l, cell: a.get(l.cell) } : l) })), relations: u.relations.map((h) => ({ ...h, a: a.get(h.a) || h.a, b: a.get(h.b) || h.b })) } : null, d = dt(t.modules.circuit.spiceMotifs || [], (h) => a.get(h), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: d, spiceLayoutDescription: s } } }, ids: e, bits: new Map([...n].map(([h, l]) => [l, h])) };
}
const Ne = /* @__PURE__ */ new Map();
async function Ye(t, e) {
  const n = Pn(t), i = JSON.stringify([n.netlist, e]);
  let r = Ne.get(i);
  r ? (Ne.delete(i), Ne.set(i, r)) : (r = await Dn(n.netlist, e), r.svg.length < 1e6 && (Ne.set(i, r), Ne.size > 20 && Ne.delete(Ne.keys().next().value)));
  const a = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (a.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const d of a.querySelectorAll("[id],[class]")) {
    const h = d.getAttribute("id");
    h?.startsWith("cell_") && n.ids.has(h.slice(5)) && d.setAttribute("id", "cell_" + n.ids.get(h.slice(5)));
    const l = d.getAttribute("class");
    l && d.setAttribute("class", l.split(/\s+/).map((m) => m.startsWith("cell_") && n.ids.has(m.slice(5)) ? "cell_" + n.ids.get(m.slice(5)) : /^net_\d+$/.test(m) && n.bits.has(Number(m.slice(4))) ? "net_" + n.bits.get(Number(m.slice(4))) : m).join(" "));
  }
  const u = r.drawing ? structuredClone(r.drawing) : null, s = a.querySelector("#spice-layout-report");
  if (s) {
    const d = JSON.parse(s.textContent), h = (l) => n.ids.get(l) || l;
    d.mirroredTransistors = (d.mirroredTransistors || []).map(h), d.orientationDevicesTested = (d.orientationDevicesTested || []).map(h), d.recognizedMotifs = dt(d.recognizedMotifs || [], h, (l) => n.bits.get(l) ?? l), d.inputAttachments = (d.inputAttachments || []).map(h), d.mirroredInputPorts = (d.mirroredInputPorts || []).map(h);
    for (const l of [...d.flippedPairs || [], ...d.pairOrientationTrials || []]) l.members = l.members.map(h);
    for (const l of d.pairCompactions || [])
      l.members = l.members.map(h), l.moved = h(l.moved);
    for (const l of d.pairConstraints || []) l.members = l.members.map(h);
    for (const l of d.pairProximity || []) l.members = l.members.map(h);
    for (const l of d.motifMeasurements || [])
      l.members = l.members.map(h), l.interlopers && (l.interlopers = l.interlopers.map(h));
    for (const l of d.voltageRails || []) l.bit !== void 0 && (l.bit = n.bits.get(l.bit) ?? l.bit);
    s.textContent = JSON.stringify(d);
  }
  if (u) {
    for (const d of u.components) {
      d.id = n.ids.get(d.id) || d.id;
      for (const h of d.ports) h.bit = n.bits.get(h.bit) ?? h.bit;
    }
    for (const d of u.segments) d.bit = n.bits.get(d.bit) ?? d.bit;
  }
  return { svg: new XMLSerializer().serializeToString(a.documentElement), drawing: u };
}
function Dn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, r) => {
    const a = (d, h) => {
      clearTimeout(s), n.terminate(), d ? r(Error(d)) : i(h);
    }, u = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => a("Layout timed out. Open a subcircuit sheet or collapse instances."), u);
    n.onmessage = ({ data: d }) => a(d.error, { svg: d.svg, drawing: d.drawing }), n.onerror = (d) => a(d.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Un = `* RLC low-pass filter
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
`, Bn = `* Voltage-divider biased common-emitter amplifier.
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
`, jn = `* Common-collector voltage follower; independently chosen example values.
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
`, Vn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, Qn = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, Me = {
  filter: { source: Un, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Bn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: jn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Vn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Qn, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Fn(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function vt(t) {
  return Fn(await t.arrayBuffer());
}
const Pt = [
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
].flat(), ut = "#292b29", qe = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Pt[e * 9 + t]))])], _t = (t) => /^#[\da-f]{6}$/i.test(t), Nt = "spice-node-colors-v1";
function Gn(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class Hn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = Gn(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, qe[this.assigned.size % qe.length]), this.assigned.get(e)) : ut;
  }
  set(e, n) {
    if (!_t(n)) throw Error("Invalid node color.");
    for (const i of e) this.manual.set(i, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((i) => Array.isArray(i) && typeof i[0] == "string" && _t(i[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Wn(t, e, n) {
  const i = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const a = i.get(r.getAttribute("data-net"));
    if (!a) continue;
    r.style.setProperty("stroke", a, "important"), r.localName === "circle" && r.style.setProperty("fill", a, "important");
  }
}
function $n(t, e) {
  const n = new Hn(), i = /* @__PURE__ */ new Set();
  let r = [], a = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Nt) || "null"));
  } catch {
  }
  const u = () => {
    try {
      sessionStorage.setItem(Nt, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, s = () => {
    const f = t("node-search").value.trim().toLowerCase();
    return r.filter((w) => !f || [w.name, w.displayName, ...w.terminals.map((x) => x.component + "." + x.pin)].some((x) => x.toLowerCase().includes(f)));
  };
  function d() {
    const f = s(), w = f.filter((x) => i.has(x.name)).length;
    t("node-count").textContent = `${f.length} / ${r.length} nodes · ${i.size} selected`, t("node-all").checked = !!f.length && w === f.length, t("node-all").indeterminate = w > 0 && w < f.length, t("node-auto").checked = n.auto;
    for (const x of ["node-apply", "node-clear"]) t(x).disabled = !a || !i.size;
    t("node-all").disabled = !a || !f.length;
  }
  function h() {
    t("nets").replaceChildren(...s().map((f) => {
      const w = document.createElement("tr");
      w.dataset.node = f.name;
      const x = document.createElement("td"), v = document.createElement("input");
      v.type = "checkbox", v.checked = i.has(f.name), v.disabled = !a, v.setAttribute("aria-label", "Select node " + f.displayName), v.onchange = () => {
        v.checked ? i.add(f.name) : i.delete(f.name), d();
      }, x.append(v);
      const T = document.createElement("td");
      T.textContent = f.displayName;
      const E = document.createElement("td"), b = document.createElement("input");
      b.type = "color", b.value = n.color(f.name), b.disabled = !a, b.setAttribute("aria-label", "Wire color for " + f.displayName), b.onchange = () => {
        n.set([f.name], b.value), l();
      }, E.append(b);
      const C = document.createElement("td");
      return C.textContent = f.terminals.map((A) => A.component + "." + A.pin).join(", "), w.append(x, T, E, C), w;
    })), d();
  }
  function l() {
    for (const f of r) n.color(f.name);
    h(), u(), e(n, r);
  }
  t("node-search").oninput = h, t("node-all").onchange = () => {
    for (const f of s()) t("node-all").checked ? i.add(f.name) : i.delete(f.name);
    h();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, l();
  }, t("node-apply").onclick = () => {
    n.set(i, t("node-color").value), l();
  }, t("node-clear").onclick = () => {
    n.set(i, ut), l();
  }, t("node-reset").onclick = () => {
    n.reset(), l();
  }, t("node-swatches").replaceChildren(...Pt.map((f) => {
    const w = document.createElement("button");
    return w.type = "button", w.style.backgroundColor = f, w.title = f, w.setAttribute("aria-label", "Apply palette color " + f), w.onclick = () => {
      i.size && (t("node-color").value = f, n.set(i, f), l());
    }, w;
  }));
  function m(f) {
    a = f;
    for (const w of t("node-panel").querySelectorAll("input,button")) w.disabled = !a;
    d();
  }
  return { snapshot: () => n.snapshot(), restore(f) {
    n.restore(f), i.clear(), l();
  }, setCircuit(f, w) {
    const x = n.sourceId;
    n.setSource(w), x !== n.sourceId && i.clear(), r = Object.values(f?.nodes || {});
    const v = new Set(r.map((T) => T.name));
    for (const T of i) v.has(T) || i.delete(T);
    for (const T of r) n.color(T.name);
    a = !!f, h(), m(a), u(), e(n, r);
  }, setEnabled: m };
}
function qn(t) {
  const e = (y) => t.querySelector("#spice-" + y), n = new AbortController(), i = n.signal, r = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, a = Object.fromEntries(Object.keys(r).map((y) => [y, t.querySelector(`[data-window-handle="${y}"]`)])), u = { editor: !0, details: !0, info: !0 }, s = { editor: !0, details: !0, info: !0 }, d = [], h = { editor: {}, details: {}, info: {} }, l = [];
  let m = !1, f = !1, w = null, x = null, v = null, T = null;
  function E(y, I) {
    s[y] = I, r[y].dataset.pinned = String(I);
    const G = e("pin-" + y), B = { editor: "netlist", details: "details", info: "messages" }[y], W = y === "info" ? "bottom edge" : y === "details" ? "lower left" : "left edge", F = I ? `Unpin ${B} from ${W}` : `Pin ${B} to ${W}`;
    if (G.setAttribute("aria-pressed", String(I)), G.setAttribute("aria-label", F), G.title = F, I) for (const j of ["left", "top", "right", "bottom", "width", "height"]) r[y].style.removeProperty(j);
    m && requestAnimationFrame(g);
  }
  for (const y of Object.keys(r)) E(y, !0);
  const b = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: m, panels: { ...u } } })), C = (y, I, G, B = {}) => y.addEventListener(I, G, { ...B, signal: i });
  function A(y, I) {
    u[y] = I, r[y].hidden = m && !I, requestAnimationFrame(g), b();
  }
  function M(y, I = e("details-content")) {
    const G = document.createComment("workspace return");
    y.before(G), d.push({ node: y, anchor: G }), I === e("details-content") ? I.prepend(y) : I.append(y);
  }
  function S(y) {
    const I = y.getBoundingClientRect(), G = t.getBoundingClientRect();
    return { x: I.left - G.left, y: I.top - G.top, w: I.width, h: I.height, width: G.width, height: G.height };
  }
  function R(y, I, G) {
    const B = S(y), W = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, F = Math.max(8, Math.min(I, B.width - B.w - 8)), j = Math.max(8, Math.min(W, B.height - B.h - 8)), Z = Math.max(j, Math.min(G, B.height - B.h - 8));
    y.style.left = Math.round(F) + "px", y.style.top = Math.round(Z) + "px", y.style.right = "auto", y.style.bottom = "auto";
  }
  function U() {
    if (!m || !s.info || r.info.hidden) return;
    const y = t.getBoundingClientRect(), I = y.width <= 600 ? 8 : 12, G = y.width <= 600 ? I : Math.max(I, ...["editor", "details"].filter((F) => s[F] && !r[F].hidden).map((F) => r[F].getBoundingClientRect().right - y.left + 12)), B = Math.min(G, Math.max(I, y.width - 160 - I)), W = r.info;
    for (const [F, j] of Object.entries({ left: Math.round(B) + "px", right: I + "px", width: "auto" })) W.style[F] !== j && (W.style[F] = j);
  }
  function g() {
    if (m) {
      U();
      for (const [y, I] of Object.entries(r)) if (!I.hidden && !s[y]) {
        const G = S(I);
        R(I, G.x, G.y);
      }
    }
  }
  function p() {
    for (const y of Object.values(r))
      for (const I of ["left", "top", "right", "bottom", "width", "height", "z-index"]) y.style.removeProperty(I);
    for (const y of Object.keys(r))
      E(y, !0), A(y, !0);
    requestAnimationFrame(g);
  }
  function P() {
    if (m) return;
    m = !0, w = document.activeElement, x = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, T = document.createComment("workspace mount"), t.before(T), document.body.append(t);
    for (const I of document.body.children) I !== t && (l.push({ node: I, inert: I.inert }), I.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const I of Object.keys(r))
      h[I].base = r[I].style.cssText, h[I].floating && (r[I].style.cssText = h[I].floating), r[I].setAttribute("role", "dialog"), r[I].setAttribute("aria-modal", "false"), r[I].setAttribute("aria-labelledby", "spice-" + I + "-title"), a[I].tabIndex = 0, a[I].title = "Drag to move; arrow keys move the window", A(I, u[I]);
    for (const I of ["selection-actions", "selection", "hierarchy-panel"]) M(e(I));
    const y = e("workspace-strip");
    for (const I of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (y.childElementCount) {
        const G = document.createElement("span");
        G.className = "spice-tool-divider", G.setAttribute("role", "separator"), G.setAttribute("aria-orientation", "vertical"), y.append(G);
      }
      M(I === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(I), y);
    }
    requestAnimationFrame(g), e("exit-fullscreen").focus({ preventScroll: !0 }), b();
  }
  function $() {
    if (m) {
      m = !1, v = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: y, anchor: I } of d.splice(0))
        I.before(y), I.remove();
      e("workspace-strip").replaceChildren();
      for (const y of Object.keys(r)) {
        h[y].floating = r[y].style.cssText, r[y].style.cssText = h[y].base, r[y].hidden = !1;
        for (const I of ["role", "aria-modal", "aria-labelledby"]) r[y].removeAttribute(I);
        a[y].removeAttribute("tabindex"), a[y].removeAttribute("title");
      }
      T && (T.before(t), T.remove(), T = null);
      for (const { node: y, inert: I } of l.splice(0)) y.inert = I;
      x && (document.documentElement.style.overflow = x.html, document.body.style.overflow = x.body, window.scrollTo(x.x, x.y)), w?.focus?.({ preventScroll: !0 }), b();
    }
  }
  async function H() {
    P(), t.dataset.nativeFullscreen = "false";
  }
  async function q() {
    if (f = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        f = !0;
        return;
      }
    $();
  }
  C(e("fullscreen"), "click", () => m ? q() : H()), C(e("exit-fullscreen"), "click", q), C(e("reset-windows"), "click", p);
  for (const y of Object.keys(r)) {
    C(e("pin-" + y), "click", () => {
      const B = S(r[y]);
      E(y, !s[y]), s[y] || (r[y].style.width = B.w + "px", r[y].style.height = B.h + "px", R(r[y], B.x, B.y)), b();
    }), C(e("close-" + y), "click", () => {
      A(y, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), C(r[y], "pointerdown", () => {
      if (m) {
        for (const B of Object.values(r)) B.style.zIndex = "20";
        r[y].style.zIndex = "30";
      }
    }, { capture: !0 });
    const I = a[y];
    C(I, "pointerdown", (B) => {
      if (!m || B.button !== 0 || B.target.closest("button,input,select,textarea,a,label")) return;
      B.preventDefault();
      const W = S(r[y]);
      E(y, !1), r[y].style.width = W.w + "px", r[y].style.height = W.h + "px", R(r[y], W.x, W.y), v = { id: y, pointer: B.pointerId, x: B.clientX, y: B.clientY, left: W.x, top: W.y }, I.setPointerCapture(B.pointerId);
    }), C(I, "pointermove", (B) => {
      v?.id === y && v.pointer === B.pointerId && R(r[y], v.left + B.clientX - v.x, v.top + B.clientY - v.y);
    });
    const G = () => {
      v = null;
    };
    C(I, "pointerup", G), C(I, "pointercancel", G), C(I, "lostpointercapture", G), C(I, "keydown", (B) => {
      if (!m || B.target !== I || !B.key.startsWith("Arrow")) return;
      B.preventDefault();
      const W = S(r[y]), F = B.shiftKey ? 32 : 8;
      E(y, !1), r[y].style.width = W.w + "px", r[y].style.height = W.h + "px", R(r[y], W.x + ({ ArrowLeft: -F, ArrowRight: F }[B.key] || 0), W.y + ({ ArrowUp: -F, ArrowDown: F }[B.key] || 0));
    });
  }
  C(document, "fullscreenchange", () => {
    m && f && document.fullscreenElement !== t && (f = !1, $());
  }), C(document, "keydown", (y) => {
    m && y.altKey && y.key === "Escape" && (y.preventDefault(), y.stopImmediatePropagation(), q());
  }, { capture: !0 }), C(window, "resize", g);
  const ne = new ResizeObserver(g);
  for (const y of Object.values(r)) ne.observe(y);
  return { enter: H, exit: q, showPanel: A, reset: p, destroy() {
    q(), n.abort(), ne.disconnect();
  } };
}
const se = 1e-3, re = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ie = (t, e) => Math.abs(t - e) < se, we = (t, e) => ie(e.a.x, e.b.x) ? ie(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - se && t.y <= Math.max(e.a.y, e.b.y) + se : ie(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - se && t.x <= Math.max(e.a.x, e.b.x) + se, zn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Xn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + se && Math.min(t.a.x, t.b.x) < e.x + e.width - se && Math.max(t.a.y, t.b.y) > e.y + se && Math.min(t.a.y, t.b.y) < e.y + e.height - se;
function Ke(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && re(e.at(-1)) === re(n))) {
      for (; e.length > 1 && (ie(e.at(-2).x, e.at(-1).x) && ie(e.at(-1).x, n.x) || ie(e.at(-2).y, e.at(-1).y) && ie(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class Dt {
  constructor(e, { step: n = 8, segments: i = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(i), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
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
    const i = this.pins();
    if (i.some((r) => r.bit !== n && we(r, e)) || this.segments.some((r) => r.bit !== n && (we(e.a, r) || we(e.b, r) || we(r.a, e) || we(r.b, e)))) return !1;
    for (const r of this.components) if (Xn(e, r) && !i.filter((u) => u.owner === r.id && u.bit === n).some((u) => u.side === "NORTH" ? ie(e.a.x, u.x) && ie(e.b.x, u.x) && Math.max(e.a.y, e.b.y) <= u.y + se : u.side === "SOUTH" ? ie(e.a.x, u.x) && ie(e.b.x, u.x) && Math.min(e.a.y, e.b.y) >= u.y - se : u.side === "WEST" ? ie(e.a.y, u.y) && ie(e.b.y, u.y) && Math.max(e.a.x, e.b.x) <= u.x + se : u.side === "EAST" ? ie(e.a.y, u.y) && ie(e.b.y, u.y) && Math.min(e.a.x, e.b.x) >= u.x - se : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const i = Ke(n), r = i.slice(1).map((a, u) => ({ bit: e, a: i[u], b: a })).filter((a) => zn(a) > se);
    if (!r.length) return !1;
    if (r.some((a) => !this.validSegment(a, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, i) {
    if (n = Math.round(n / this.step) * this.step, i = Math.round(i / this.step) * this.step, !n && !i) return;
    const r = this.snapshot(), a = this.components.find((d) => d.id === e);
    if (!a) return;
    const u = a.ports.map((d) => ({ ...d }));
    this.segments = this.segments.filter((d) => !u.some((h) => h.bit === d.bit && (re(h) === re(d.a) || re(h) === re(d.b)))), a.x += n, a.y += i;
    for (const d of a.ports)
      d.x += n, d.y += i;
    if (this.pinCache = null, this.components.some((d) => d !== a && a.x < d.x + d.width - se && a.x + a.width > d.x + se && a.y < d.y + d.height - se && a.y + a.height > d.y + se) || this.segments.some((d) => !this.validSegment(d, d.bit)) || a.ports.some((d) => this.pins().some((h) => h.owner !== e && h.bit !== d.bit && re(h) === re(d))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  transform(e, n) {
    const i = this.components.find((f) => f.id === e);
    if (!i) return;
    const r = this.snapshot(), a = i.width, u = i.height, s = n === "rotate" ? [0, 1, -1, 0, u, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, u] : n === "mirror-y" ? [-1, 0, 0, 1, a, 0] : null;
    if (!s) throw Error("Unknown transform.");
    const d = i.ports.map((f) => ({ ...f })), h = (f) => ({ x: s[0] * f.x + s[2] * f.y + s[4], y: s[1] * f.x + s[3] * f.y + s[5] });
    this.segments = this.segments.filter((f) => !d.some((w) => w.bit === f.bit && (re(w) === re(f.a) || re(w) === re(f.b))));
    const l = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const f of i.ports) {
      const w = h({ x: f.x - i.x, y: f.y - i.y });
      f.x = i.x + w.x, f.y = i.y + w.y, f.side = l[f.side] || f.side;
    }
    const m = i.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (i.editorMatrix = [s[0] * m[0] + s[2] * m[1], s[1] * m[0] + s[3] * m[1], s[0] * m[2] + s[2] * m[3], s[1] * m[2] + s[3] * m[3], s[0] * m[4] + s[2] * m[5] + s[4], s[1] * m[4] + s[3] * m[5] + s[5]], n === "rotate" && (i.width = u, i.height = a), this.pinCache = null, i.ports.some((f) => !this.onGrid(f)) || this.components.some((f) => f !== i && i.x < f.x + f.width - se && i.x + i.width > f.x + se && i.y < f.y + f.height - se && i.y + i.height > f.y + se) || this.segments.some((f) => !this.validSegment(f, f.bit)) || i.ports.some((f) => this.pins().some((w) => w.owner !== e && w.bit !== f.bit && re(w) === re(f))))
      throw this.restore(r), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(r);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const i of this.pins())
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).pins.push(i);
    for (const i of this.segments)
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).segments.push(i);
    const n = [];
    for (const [i, r] of e) {
      const a = /* @__PURE__ */ new Map(), u = (l) => {
        a.has(re(l)) || a.set(re(l), l);
      };
      r.pins.forEach(u);
      for (const l of r.segments)
        u(l.a), u(l.b);
      for (let l = 0; l < r.segments.length; l++) for (let m = l + 1; m < r.segments.length; m++) {
        const f = r.segments[l], w = r.segments[m];
        if (ie(f.a.x, f.b.x) === ie(w.a.x, w.b.x)) continue;
        const x = ie(f.a.x, f.b.x) ? f : w, v = x === f ? w : f, T = { x: x.a.x, y: v.a.y };
        we(T, x) && we(T, v) && u(T);
      }
      const s = new Map([...a.keys()].map((l) => [l, l])), d = (l) => {
        let m = l;
        for (; s.get(m) !== m; ) m = s.get(m);
        for (; l !== m; ) {
          const f = s.get(l);
          s.set(l, m), l = f;
        }
        return m;
      };
      for (const l of r.segments) {
        const m = [...a.values()].filter((f) => we(f, l));
        for (const f of m.slice(1)) s.set(d(re(f)), d(re(m[0])));
      }
      const h = /* @__PURE__ */ new Map();
      for (const l of r.pins) {
        const m = d(re(l));
        h.has(m) || h.set(m, { pins: [], points: [] }), h.get(m).pins.push(l);
      }
      for (const l of a.values()) {
        const m = d(re(l));
        h.has(m) && h.get(m).points.push(l);
      }
      n.push({ bit: i, islands: [...h.values()], points: [...a.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: i } of this.connectivity()) {
      if (i.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < i.length; ) {
        let a;
        for (const u of r) for (let s = 0; s < i.length; s++) if (!r.has(s)) for (const d of i[u].points) for (const h of i[s].points) {
          const l = (d.x - h.x) ** 2 + (d.y - h.y) ** 2;
          (!a || l < a.d) && (a = { bit: n, a: d, b: h, d: l, j: s });
        }
        e.push(a), r.add(a.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const a of this.components)
      e.push(a.x - 20, a.x + a.width + 20), n.push(a.y - 20, a.y + a.height + 20);
    for (const a of this.segments)
      e.push(a.a.x - 20, a.b.x + 20), n.push(a.a.y - 20, a.b.y + 20);
    const i = Math.min(...e), r = Math.min(...n);
    return { x: i, y: r, w: Math.max(...e) - i, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, i) {
    if (!this.onGrid(n) || !this.onGrid(i)) return null;
    const r = (M) => M.slice(1).every((S, R) => this.validSegment({ a: M[R], b: S }, e));
    for (const M of [[n, i], [n, { x: i.x, y: n.y }, i], [n, { x: n.x, y: i.y }, i]]) {
      const S = Ke(M);
      if (r(S)) return S;
    }
    const a = this.step, u = this.bounds(), s = Math.floor(Math.min(u.x, n.x, i.x) / a) - 5, d = Math.ceil(Math.max(u.x + u.w, n.x, i.x) / a) + 5, h = Math.floor(Math.min(u.y, n.y, i.y) / a) - 5, l = Math.ceil(Math.max(u.y + u.h, n.y, i.y) / a) + 5, m = { x: n.x / a, y: n.y / a, dir: -1, cost: 0, key: n.x / a + "," + n.y / a + ",-1" }, f = [m], w = /* @__PURE__ */ new Map([[m.key, 0]]), x = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map([[m.key, m]]), T = [[1, 0], [-1, 0], [0, 1], [0, -1]], E = (M) => Math.abs(M.x - i.x / a) + Math.abs(M.y - i.y / a);
    let b = null, C = 0;
    for (; f.length && C++ < 3e4; ) {
      let M = 0;
      for (let R = 1; R < f.length; R++) f[R].cost + E(f[R]) < f[M].cost + E(f[M]) && (M = R);
      const S = f.splice(M, 1)[0];
      if (S.cost === w.get(S.key)) {
        if (S.x === i.x / a && S.y === i.y / a) {
          b = S;
          break;
        }
        for (let R = 0; R < 4; R++) {
          const U = S.x + T[R][0], g = S.y + T[R][1];
          if (U < s || U > d || g < h || g > l) continue;
          const p = { x: U, y: g, dir: R, key: U + "," + g + "," + R, cost: S.cost + 1 + (S.dir !== -1 && S.dir !== R ? 3 : 0) };
          p.cost >= (w.get(p.key) ?? 1 / 0) || !this.validSegment({ a: { x: S.x * a, y: S.y * a }, b: { x: U * a, y: g * a } }, e) || (w.set(p.key, p.cost), x.set(p.key, S.key), v.set(p.key, p), f.push(p));
        }
      }
    }
    if (!b) return null;
    const A = [];
    for (let M = b; M; M = v.get(x.get(M.key))) A.push({ x: M.x * a, y: M.y * a });
    return Ke(A.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const i = /* @__PURE__ */ new Set();
    let r = 0;
    for (; !e() && r++ < Math.max(20, this.pins().length * 2); ) {
      const a = this.airwires().find((s) => !i.has(s.bit + ":" + re(s.a) + ":" + re(s.b)));
      if (!a) break;
      const u = this.findPath(a.bit, a.a, a.b);
      u ? (this.segments.push(...u.slice(1).map((s, d) => ({ bit: a.bit, a: u[d], b: s }))), this.cache = null) : i.add(a.bit + ":" + re(a.a) + ":" + re(a.b)), r % 3 === 0 && await new Promise((s) => setTimeout(s, 0));
    }
    this.redoStack = [];
  }
}
const Ut = "spice-viewer-project", Bt = 1, jt = 32 * 1024 * 1024, ee = (t) => {
  throw Error("Invalid project: " + t);
}, ye = (t) => t && typeof t == "object" && !Array.isArray(t), Se = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, Le = (t) => ye(t) && Se(t.x) && Se(t.y), xe = (t, e) => Math.abs(t - e) < 1e-3, at = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function Ct(t) {
  return ye(t) && Le(t) && Se(t.w) && Se(t.h) && t.w > 0 && t.h > 0;
}
function St(t) {
  (!ye(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && ee("unsupported drawing settings.");
}
function Vt(t) {
  new TextEncoder().encode(t).length > jt && ee("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    ee("expected a JSON project file.");
  }
  (!ye(e) || e.format !== Ut) && ee("unrecognized file format."), e.version !== Bt && ee("unsupported project version " + e.version + "."), e.layoutRulesVersion !== De && ee("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && ee("missing netlist or sheet."), (!ye(e.libraries) || Object.entries(e.libraries).some(([i, r]) => !i || ["__proto__", "constructor", "prototype"].includes(i) || typeof r != "string")) && ee("invalid libraries."), St(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((i) => typeof e[i] != "boolean") || !Ct(e.view)) && ee("invalid display settings."), (!ye(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((i) => !Array.isArray(e.colors[i]) || e.colors[i].some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || !/^#[\da-f]{6}$/i.test(r[1])))) && ee("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && ee("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const i of e.sheets) {
    (!ye(i) || typeof i.scope != "string" || typeof i.topology != "string") && ee("invalid sheet identity."), St(i.settings);
    const r = at(i.scope, i.topology, i.settings);
    n.has(r) && ee("duplicate sheet."), n.add(r), (i.settings.gridSize !== 4 || !i.settings.conventional) && ee("saved manual scenes require the fixed 4-unit grid."), i.view !== void 0 && !Ct(i.view) && ee("invalid sheet viewport."), Qt(i.snapshot);
  }
  return e;
}
function Yn(t) {
  const e = { ...t, format: Ut, version: Bt, layoutRulesVersion: De, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return Vt(n), n;
}
function Qt(t) {
  (!ye(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && ee("invalid scene size.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!ye(n) || typeof n.id != "string" || e.has(n.id) || !Le(n) || !Se(n.width) || !Se(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && ee("invalid component geometry."), e.add(n.id);
    const i = /* @__PURE__ */ new Set();
    for (const r of n.ports)
      (!Le(r) || typeof r.pin != "string" || i.has(r.pin) || !Number.isInteger(r.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(r.side)) && ee("invalid pin."), i.add(r.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(Se)) && ee("invalid symbol transform.");
  }
  for (const n of t.segments) (!ye(n) || !Number.isInteger(n.bit) || !Le(n.a) || !Le(n.b) || !xe(n.a.x, n.b.x) && !xe(n.a.y, n.b.y)) && ee("wire must be orthogonal.");
}
function Ft(t, e, n) {
  Qt(e);
  const i = new Map(t.components.map((d) => [d.id, d]));
  i.size !== e.components.length && ee("component count changed.");
  const r = e.components.map((d) => {
    const h = i.get(d.id);
    (!h || !!h.decoration != !!d.decoration || h.ports.length !== d.ports.length) && ee("component identity changed: " + d.id);
    const l = d.editorMatrix || [1, 0, 0, 1, 0, 0], [m, f, w, x] = l;
    (![m, f, w, x].every((E) => [-1, 0, 1].includes(E)) || m * m + f * f !== 1 || w * w + x * x !== 1 || m * w + f * x !== 0) && ee("symbol transform must be a rotation or mirror.");
    const v = [[0, 0], [h.width, 0], [0, h.height], [h.width, h.height]].map(([E, b]) => ({ x: m * E + w * b + l[4], y: f * E + x * b + l[5] }));
    (!xe(Math.min(...v.map((E) => E.x)), 0) || !xe(Math.min(...v.map((E) => E.y)), 0) || !xe(Math.max(...v.map((E) => E.x)), d.width) || !xe(Math.max(...v.map((E) => E.y)), d.height)) && ee("symbol dimensions changed: " + d.id);
    const T = d.ports.map((E) => {
      const b = h.ports.find((M) => M.pin === E.pin);
      (!b || b.bit !== E.bit || !xe(E.x, d.x + m * (b.x - h.x) + w * (b.y - h.y) + l[4]) || !xe(E.y, d.y + f * (b.x - h.x) + x * (b.y - h.y) + l[5])) && ee("pin connectivity or position changed: " + d.id + "." + E.pin);
      const C = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[b.side], A = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, M]) => M[0] === m * C[0] + w * C[1] && M[1] === f * C[0] + x * C[1])?.[0];
      return E.side !== A && ee("pin direction changed."), { ...b, x: E.x, y: E.y, side: A };
    });
    return { ...h, x: d.x, y: d.y, width: d.width, height: d.height, ports: T, ...d.editorMatrix ? { editorMatrix: [...l] } : {} };
  }), a = new Dt({ ...t, components: r, segments: e.segments }, { step: n });
  for (let d = 0; d < r.length; d++) for (let h = d + 1; h < r.length; h++) {
    const l = r[d], m = r[h];
    l.x < m.x + m.width - 1e-3 && l.x + l.width > m.x + 1e-3 && l.y < m.y + m.height - 1e-3 && l.y + l.height > m.y + 1e-3 && ee("component symbols overlap.");
  }
  const u = new Set(a.pins().map((d) => d.bit));
  (a.pins().some((d) => !a.onGrid(d)) || a.segments.some((d) => !u.has(d.bit) || !a.validSegment(d, d.bit))) && ee("off-grid wire, symbol collision or short circuit.");
  const s = /* @__PURE__ */ new Map();
  for (const d of a.pins()) {
    const h = d.x + "," + d.y;
    s.has(h) && s.get(h) !== d.bit && ee("different nodes share a pin position."), s.set(h, d.bit);
  }
  return a.snapshot();
}
const Kn = "http://www.w3.org/2000/svg", fe = (t, e = {}) => {
  const n = document.createElementNS(Kn, t);
  for (const [i, r] of Object.entries(e)) n.setAttribute(i, r);
  return n;
}, Zn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Gt(t, e, n, i) {
  const r = structuredClone(e);
  for (const s of r.components) {
    const d = t.getElementById("cell_" + s.id);
    for (const h of s.ports) {
      const l = [...d.children].find((m) => m.getAttribute("s:pid") === h.pin);
      h.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[l?.getAttribute("s:position")] || h.side;
    }
  }
  for (const [s, d] of Object.entries(i.modules.circuit.cells)) if (d.attributes.name === "0") {
    const h = t.getElementById("cell_" + s), l = h?.transform.baseVal.consolidate().matrix;
    h && l && r.components.push({ id: s, decoration: !0, x: l.e, y: l.f, width: +h.getAttribute("s:width"), height: +h.getAttribute("s:height"), ports: [...h.children].filter((m) => m.hasAttribute("s:pid")).map((m) => ({ pin: m.getAttribute("s:pid"), x: l.e + Number(m.getAttribute("s:x")), y: l.f + Number(m.getAttribute("s:y")), bit: d.connections[m.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const a = new Map(Object.values(n.nodes).map((s) => [s.name, s.bit])), u = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ bit: a.get(s.dataset.net), a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } }));
  return { ...r, segments: u };
}
function Jn(t, e, { changed: n, inspect: i, getNetColor: r }) {
  let a = null, u = null, s = !1, d = !1, h = null, l = null, m = -1, f = "", w = 0, x = "", v = 8, T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  const C = (y) => new DOMPoint(y.clientX, y.clientY).matrixTransform(u.getScreenCTM().inverse()), A = (y) => a.snap(C(y)), M = (y) => r?.(y) || qe[Number(y) % qe.length], S = (y) => {
    e("editor-status").textContent = y;
  };
  function R() {
    return { unrouted: a?.airwires().length || 0, wires: a?.segments.length || 0, editing: s, routing: d };
  }
  function U() {
    const y = !!a;
    for (const I of ["interactive", "flywire", "auto-route"]) e(I).disabled = !u || d;
    e("edit-tool").disabled = !y || d;
    for (const I of document.querySelectorAll("[data-editor-mode]"))
      I.disabled = !u || d, I.setAttribute("aria-pressed", String(s && I.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !y || d || !a.undoStack.length, e("wire-redo").disabled = !y || d || !a.redoStack.length, t.classList.toggle("spice-editing", s);
  }
  function g(y, I) {
    const G = b.get(y.id);
    if (G && (I.replaceChildren(...G.children.map((B) => B.cloneNode(!0))), y.editorMatrix)) {
      const B = y.editorMatrix, W = fe("g", { transform: "matrix(" + B.join(" ") + ")", "data-editor-glyph": "true" });
      W.append(...I.childNodes);
      for (const F of W.querySelectorAll("text")) F.remove();
      I.append(W);
      for (const [F, j] of G.labels.entries()) {
        const Z = j.node.cloneNode(!0);
        Z.removeAttribute("transform");
        let te = B[0] * j.x + B[2] * j.y + B[4], de = B[1] * j.x + B[3] * j.y + B[5];
        if (y.ports.length === 2 && G.labels.length === 2) {
          const oe = Math.abs(y.ports[0].y - y.ports[1].y) < 1e-3;
          te = oe ? y.width / 2 : y.ports[0].x - y.x + 20, de = oe ? y.ports[0].y - y.y - 26 + F * 16 : y.height / 2 - 8 + F * 16, Z.setAttribute("text-anchor", oe ? "middle" : "start");
        }
        Z.setAttribute("x", te), Z.setAttribute("y", de), I.append(Z);
      }
    }
  }
  function p(y) {
    if (h = null, ["rotate", "mirror-x", "mirror-y"].includes(y) && f) {
      try {
        a.transform(f, y), H();
      } catch (I) {
        S(I.message);
      }
      return;
    }
    e("edit-tool").value = y, $(), U();
  }
  function P() {
    if (!a) return;
    const y = R();
    S(`${y.unrouted} connection${y.unrouted === 1 ? "" : "s"} unrouted · ${y.wires} wire segments${d ? " · Auto-routing…" : ""}`), U(), n(a.drawing(), y, a.bounds()), E.set(x, a.snapshot());
  }
  function $(y = null) {
    if (u?.querySelector("[data-route-preview]")?.remove(), !h || !u) return;
    const I = [...h.points];
    if (y) {
      const W = I.at(-1);
      I.push({ x: y.x, y: W.y }, y);
    }
    const G = fe("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    G.append(fe("polyline", { points: I.map((W) => W.x + "," + W.y).join(" "), fill: "none", stroke: M(h.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), u.append(G);
    const B = u.querySelector("[data-airwires]");
    B && u.append(B);
  }
  function H() {
    if (!u || !a) return;
    for (const F of u.querySelectorAll("[data-editor-body-hit]")) F.remove();
    for (const F of [...u.children]) (F.hasAttribute("data-editor-overlay") || F.hasAttribute("data-airwires") || F.hasAttribute("data-manual-state") || F.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(F.localName)) && F.remove();
    for (const F of a.components) {
      const j = u.getElementById("cell_" + F.id);
      j && (g(F, j), j.setAttribute("s:width", F.width), j.setAttribute("s:height", F.height), j.setAttribute("transform", `translate(${F.x},${F.y})`), j.dataset.editorComponent = F.id, s && j.prepend(fe("rect", { x: 0, y: 0, width: F.width, height: F.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const y = u.querySelector('g[id^="cell_"]'), I = fe("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), G = fe("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [F, j] of a.segments.entries()) {
      const Z = fe("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, class: "net_" + j.bit, "data-net": T.get(j.bit) || String(j.bit), "stroke-width": F === m ? 2.8 : 1.4 });
      Z.append(fe("title")), Z.firstChild.textContent = "Node " + (T.get(j.bit) || j.bit), u.insertBefore(Z, y), s && I.append(fe("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, "data-editor-wire": F, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const F of a.connectivity()) for (const j of F.points) {
      const Z = /* @__PURE__ */ new Set();
      for (const te of F.segments) we(j, te) && (Math.min(te.a.x, te.b.x) < j.x - 1e-3 && Z.add("w"), Math.max(te.a.x, te.b.x) > j.x + 1e-3 && Z.add("e"), Math.min(te.a.y, te.b.y) < j.y - 1e-3 && Z.add("n"), Math.max(te.a.y, te.b.y) > j.y + 1e-3 && Z.add("s"));
      (Z.size >= 3 || Z.size >= 2 && F.islands.some((te) => te.pins.some((de) => Zn(j, de)))) && u.insertBefore(fe("circle", { cx: j.x, cy: j.y, r: 2, class: "net_" + F.bit, "data-net": T.get(F.bit) || String(F.bit), fill: M(F.bit) }), y);
    }
    if (s) {
      const F = a.components.find((j) => j.id === f);
      F && I.append(fe("rect", { x: F.x - 3, y: F.y - 3, width: F.width + 6, height: F.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const j of a.pins()) {
        const Z = fe("circle", { cx: j.x, cy: j.y, r: 3, "data-editor-pin": j.id, "data-editor-bit": j.bit, fill: "#fff", stroke: M(j.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": j.owner + " " + j.pin }), te = fe("title");
        te.textContent = j.id + " · " + (T.get(j.bit) || j.bit), Z.append(te), G.append(Z);
      }
      u.append(I, G);
    }
    $();
    const B = fe("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const F of a.airwires()) B.append(fe("line", { x1: F.a.x, y1: F.a.y, x2: F.b.x, y2: F.b.y, stroke: M(F.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": F.bit, "data-from-owner": F.a.owner || "", "data-to-owner": F.b.owner || "" }));
    u.append(B);
    const W = fe("metadata", { "data-manual-state": "true" });
    W.textContent = JSON.stringify({ version: 1, grid: v, unrouted: a.airwires().length, manual: !0 }), u.insertBefore(W, B), P();
  }
  function q(y, I) {
    if (!h) {
      h = { bit: I, points: [y] }, $(), S("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (I !== void 0 && h.bit !== I) {
      S("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const G = h.points.at(-1), B = a.findPath(h.bit, G, y);
    if (!B) {
      S("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (I === void 0) {
      h.points.push(...B.slice(1)), $();
      return;
    }
    try {
      a.addPath(I, [...h.points, ...B.slice(1)]), h = null, H();
    } catch (W) {
      S(W.message);
    }
  }
  t.addEventListener("pointerdown", (y) => {
    if (!s || d || !a || !u || y.button !== 0 || y.shiftKey) return;
    const I = y.target.closest("[data-editor-pin]"), G = y.target.closest("[data-editor-wire]"), B = y.target.closest("[data-editor-component]");
    if (!(!I && !G && !B && !h)) {
      if (y.preventDefault(), y.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), I) {
        const W = a.pins().find((F) => F.id === I.dataset.editorPin);
        e("edit-tool").value = "route", U(), q({ x: W.x, y: W.y }, W.bit);
        return;
      }
      if (G) {
        const W = +G.dataset.editorWire, F = a.segments[W];
        if (e("edit-tool").value === "erase" && !h) {
          a.remove(W), m = -1, H();
          return;
        }
        if (h || e("edit-tool").value === "route") {
          const j = A(y);
          q(F.a.x === F.b.x ? { x: F.a.x, y: j.y } : { x: j.x, y: F.a.y }, F.bit);
        } else
          m = W, H(), S("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (h) {
        q(A(y));
        return;
      }
      if (B) {
        const W = B.dataset.editorComponent, F = a.components.find((j) => j.id === W);
        if (!F) return;
        if (f = W, m = -1, i?.(W), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          p(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          H();
          return;
        }
        l = { id: W, n: F, element: B, x: y.clientX, y: y.clientY, start: C(y), dx: 0, dy: 0 }, B.style.opacity = ".6", t.setPointerCapture(y.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (y) => {
    if (!(!s || !a || !u)) {
      if (l) {
        y.stopImmediatePropagation();
        const I = C(y), G = a.snap({ x: I.x - l.start.x, y: I.y - l.start.y });
        l.dx = G.x, l.dy = G.y, l.element.setAttribute("transform", `translate(${l.n.x + l.dx},${l.n.y + l.dy})`);
        for (const B of u.querySelectorAll("[data-airwires] line"))
          B.dataset.fromOwner === l.id && (B.setAttribute("x1", +B.getAttribute("x1") - Number(B.dataset.dx || 0) + l.dx), B.setAttribute("y1", +B.getAttribute("y1") - Number(B.dataset.dy || 0) + l.dy)), B.dataset.toOwner === l.id && (B.setAttribute("x2", +B.getAttribute("x2") - Number(B.dataset.dx || 0) + l.dx), B.setAttribute("y2", +B.getAttribute("y2") - Number(B.dataset.dy || 0) + l.dy)), B.dataset.dx = l.dx, B.dataset.dy = l.dy;
        return;
      }
      h && $(A(y));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (y) => {
    if (!l) return;
    y.preventDefault(), y.stopImmediatePropagation();
    const I = l;
    l = null, I.element.style.opacity = "", t.hasPointerCapture(y.pointerId) && t.releasePointerCapture(y.pointerId);
    try {
      a.move(I.id, I.dx, I.dy), m = -1, H();
    } catch (G) {
      H(), S(G.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    l && (l.element.style.opacity = "", l = null, H());
  }), document.addEventListener("keydown", (y) => {
    if (e("download-dialog").open || !s || !a || d || y.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(y.target)) return;
    const I = y.target.closest("[data-editor-pin]"), G = y.key.toLowerCase();
    if (I && (y.key === "Enter" || y.key === " ")) {
      y.preventDefault(), y.stopImmediatePropagation();
      const B = a.pins().find((W) => W.id === I.dataset.editorPin);
      q({ x: B.x, y: B.y }, B.bit);
      return;
    }
    y.key === "Escape" ? (y.preventDefault(), y.stopImmediatePropagation(), h = null, p("move"), H()) : (y.key === "Delete" || y.key === "Backspace") && m >= 0 ? (y.preventDefault(), y.stopImmediatePropagation(), a.remove(m), m = -1, H()) : (y.ctrlKey || y.metaKey) && G === "z" ? (y.preventDefault(), y.stopImmediatePropagation(), y.shiftKey ? a.redo() : a.undo(), h = null, H()) : !y.ctrlKey && !y.metaKey && !y.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[G] && (y.preventDefault(), y.stopImmediatePropagation(), p({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[G]));
  }, { capture: !0 });
  async function ne() {
    if (!a || d) return;
    const y = w;
    d = !0, P(), S("Auto-routing remaining connections…");
    try {
      await a.autoRoute(() => y !== w), y === w && (h = null, m = -1, d = !1, H());
    } catch (I) {
      y === w && (d = !1, H(), S(I.message));
    }
  }
  return {
    mount(y, I, G, B, W, { reset: F = !1, scope: j = "" } = {}) {
      w++, d = !1, u = y, h = null, l = null, m = -1, f = "", b = /* @__PURE__ */ new Map();
      for (const de of u.querySelectorAll('g[id^="cell_"]')) {
        const oe = de.getCTM().inverse();
        b.set(de.id.slice(5), { children: [...de.childNodes].map((me) => me.cloneNode(!0)), labels: [...de.querySelectorAll("text")].map((me) => {
          const ue = new DOMPoint(+me.getAttribute("x") || 0, +me.getAttribute("y") || 0).matrixTransform(oe.multiply(me.getCTM()));
          return { node: me.cloneNode(!0), x: ue.x, y: ue.y };
        }) });
      }
      if (v = W.gridSize || 0, T = new Map(Object.values(G.nodes).map((de) => [de.bit, de.name])), !I || !v) {
        a = null, U();
        return;
      }
      const Z = Gt(u, I, G, B), te = Z.segments;
      a = new Dt(Z, { step: v, segments: te }), x = at(j, G.topology.signature, W), !F && E.has(x) ? a.restore(Ft({ ...Z, segments: te }, E.get(x), v)) : e("flywire").checked && a.clear(), s = e("interactive").checked, s || !F && E.has(x) || e("flywire").checked ? H() : U();
    },
    invalidate() {
      a && !d && E.set(x, a.snapshot()), w++, d = !1, a = null, u = null, h = null, l = null, U();
    },
    snapshotSheets() {
      return a && !d && E.set(x, a.snapshot()), [...E].map(([y, I]) => {
        const [G, B, W] = JSON.parse(y);
        return { scope: G, topology: B, settings: W, snapshot: structuredClone(I) };
      });
    },
    restoreSheets(y) {
      E = new Map(y.map((I) => [at(I.scope, I.topology, I.settings), structuredClone(I.snapshot)]));
    },
    clearSheets() {
      E.clear();
    },
    setEnabled(y) {
      s = y, y || (h = null), a ? H() : U();
    },
    clear() {
      a && (a.clear(), h = null, H());
    },
    autoRoute: ne,
    chooseTool: p,
    undo() {
      a && (h = null, a.undo(), H());
    },
    redo() {
      a && (h = null, a.redo(), H());
    },
    complete() {
      return !a || !d && a.airwires().length === 0;
    },
    working() {
      return d;
    },
    stats: R,
    canEdit() {
      return !!a;
    },
    refreshColors() {
      if (u) {
        for (const y of u.querySelectorAll("[data-air-net]")) y.setAttribute("stroke", M(+y.dataset.airNet));
        for (const y of u.querySelectorAll("[data-editor-bit]")) y.setAttribute("stroke", M(+y.dataset.editorBit));
      }
    },
    cleanExport(y) {
      for (const I of y.querySelectorAll("[data-editor-overlay],[data-route-preview]")) I.remove();
      for (const I of y.querySelectorAll("[data-editor-component]"))
        I.removeAttribute("data-editor-component"), I.style.removeProperty("opacity");
    }
  };
}
const ct = 4, Fe = "http://www.w3.org/2000/svg";
function Ge(t, e, n = !0, i = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), a = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(Fe, "defs"), r.dataset.coordinateGrid = "true";
    const w = document.createElementNS(Fe, "pattern");
    w.id = "spice-coordinate-grid", w.setAttribute("patternUnits", "userSpaceOnUse");
    const x = document.createElementNS(Fe, "path");
    x.setAttribute("fill", "none"), x.setAttribute("stroke", "#737b83"), x.setAttribute("stroke-opacity", ".23"), x.setAttribute("stroke-width", ".55"), x.setAttribute("vector-effect", "non-scaling-stroke"), w.append(x), r.append(w), a = document.createElementNS(Fe, "rect"), a.dataset.coordinateGrid = "true", a.setAttribute("fill", "url(#spice-coordinate-grid)"), a.setAttribute("stroke", "none"), a.setAttribute("pointer-events", "none"), t.prepend(a), t.prepend(r);
  }
  const u = r.firstElementChild, s = e || 8;
  u.setAttribute("width", s), u.setAttribute("height", s), u.firstElementChild.setAttribute("d", `M${s},0 H0 V${s}`), a.setAttribute("visibility", n && e ? "visible" : "hidden");
  let d = u.querySelector("[data-minor-grid]");
  d || (d = u.firstElementChild.cloneNode(), d.setAttribute("data-minor-grid", "true"), d.setAttribute("stroke-opacity", ".08"), u.append(d));
  const h = [];
  for (let w = ct; w < s; w += ct) h.push(`M${w},0 V${s} M0,${w} H${s}`);
  d.setAttribute("d", h.join(" ")), t.dataset.displayGridStep = String(s);
  let l = i;
  const m = t.closest(".spice-preview"), f = t.isConnected && m ? t.getScreenCTM() : null;
  if (f) {
    const w = m.getBoundingClientRect(), x = f.inverse(), v = [[w.left - 1, w.top - 1], [w.right + 1, w.top - 1], [w.right + 1, w.bottom + 1], [w.left - 1, w.bottom + 1]].map(([b, C]) => new DOMPoint(b, C).matrixTransform(x)), T = Math.min(...v.map((b) => b.x)), E = Math.min(...v.map((b) => b.y));
    l = { x: T, y: E, w: Math.max(...v.map((b) => b.x)) - T, h: Math.max(...v.map((b) => b.y)) - E };
  }
  if (!l) {
    const w = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    l = { x: w[0], y: w[1], w: w[2], h: w[3] };
  }
  for (const [w, x] of Object.entries({ x: l.x, y: l.y, width: l.w, height: l.h })) a.setAttribute(w, x);
}
const eo = `<svg
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
`, to = `<svg
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
`, no = `<svg
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
`, oo = `<svg
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
`, ro = `<svg
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
`, io = `<svg
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
`, so = `<svg
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
`, ao = `<svg
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
`, co = `<svg
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
`, lo = `<svg
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
`, uo = `<svg
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
`, fo = `<svg
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
`, Ze = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, po = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`, ho = `<svg
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
`, mo = `<svg
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
`, go = `<svg
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
`, bo = `<svg
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
`;
function yo(t) {
  const e = { move: eo, route: to, erase: no, rotate: oo, "mirror-x": ro, "mirror-y": io }, n = { "zoom-in": so, "zoom-out": ao, fit: co, "wire-undo": lo, "wire-redo": uo, "auto-route": fo, "pin-editor": Ze, "pin-info": Ze, "pin-details": Ze, fullscreen: po, "exit-fullscreen": ho, "reset-windows": mo, "open-download": go, upload: bo }, i = (r, a) => {
    if (!r) return;
    const u = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", u), r.title = u, r.innerHTML = a, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  for (const [r, a] of Object.entries(e)) i(t.querySelector(`[data-editor-mode="${r}"]`), a);
  for (const [r, a] of Object.entries(n)) i(t.querySelector("#spice-" + r), a);
}
function wo(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function i() {
      var r = !1;
      try {
        r = this instanceof i;
      } catch {
      }
      return r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(i) {
    var r = Object.getOwnPropertyDescriptor(t, i);
    Object.defineProperty(n, i, r.get ? r : {
      enumerable: !0,
      get: function() {
        return t[i];
      }
    });
  }), n;
}
var Je = {};
const Eo = {}, xo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Eo
}, Symbol.toStringTag, { value: "Module" })), vo = /* @__PURE__ */ wo(xo);
var It;
function _o() {
  return It || (It = 1, (function(t) {
    (function(e) {
      e.parser = function(c, o) {
        return new i(c, o);
      }, e.SAXParser = i, e.SAXStream = m, e.createStream = h, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function i(c, o) {
        if (!(this instanceof i))
          return new i(c, o);
        var _ = this;
        a(_), _.q = _.c = "", _.bufferCheckPosition = e.MAX_BUFFER_LENGTH, _.encoding = null, _.opt = o || {}, _.opt.lowercase = _.opt.lowercase || _.opt.lowercasetags, _.looseCase = _.opt.lowercase ? "toLowerCase" : "toUpperCase", _.opt.maxEntityCount = _.opt.maxEntityCount || 512, _.opt.maxEntityDepth = _.opt.maxEntityDepth || 4, _.entityCount = _.entityDepth = 0, _.tags = [], _.closed = _.closedRoot = _.sawRoot = !1, _.tag = _.error = null, _.strict = !!c, _.noscript = !!(c || _.opt.noscript), _.state = p.BEGIN, _.strictEntities = _.opt.strictEntities, _.ENTITIES = _.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), _.attribList = [], _.opt.xmlns && (_.ns = Object.create(T)), _.opt.unquotedAttributeValues === void 0 && (_.opt.unquotedAttributeValues = !c), _.trackPosition = _.opt.position !== !1, _.trackPosition && (_.position = _.line = _.column = 0), $(_, "onready");
      }
      Object.create || (Object.create = function(c) {
        function o() {
        }
        o.prototype = c;
        var _ = new o();
        return _;
      }), Object.keys || (Object.keys = function(c) {
        var o = [];
        for (var _ in c) c.hasOwnProperty(_) && o.push(_);
        return o;
      });
      function r(c) {
        for (var o = Math.max(e.MAX_BUFFER_LENGTH, 10), _ = 0, N = 0, X = n.length; N < X; N++) {
          var J = c[n[N]].length;
          if (J > o)
            switch (n[N]) {
              case "textNode":
                G(c);
                break;
              case "cdata":
                I(c, "oncdata", c.cdata), c.cdata = "";
                break;
              case "script":
                I(c, "onscript", c.script), c.script = "";
                break;
              default:
                W(c, "Max buffer length exceeded: " + n[N]);
            }
          _ = Math.max(_, J);
        }
        var Y = e.MAX_BUFFER_LENGTH - _;
        c.bufferCheckPosition = Y + c.position;
      }
      function a(c) {
        for (var o = 0, _ = n.length; o < _; o++)
          c[n[o]] = "";
      }
      function u(c) {
        G(c), c.cdata !== "" && (I(c, "oncdata", c.cdata), c.cdata = ""), c.script !== "" && (I(c, "onscript", c.script), c.script = "");
      }
      i.prototype = {
        end: function() {
          F(this);
        },
        write: Q,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          u(this);
        }
      };
      var s;
      try {
        s = vo.Stream;
      } catch {
        s = function() {
        };
      }
      s || (s = function() {
      });
      var d = e.EVENTS.filter(function(c) {
        return c !== "error" && c !== "end";
      });
      function h(c, o) {
        return new m(c, o);
      }
      function l(c, o) {
        if (c.length >= 2) {
          if (c[0] === 255 && c[1] === 254)
            return "utf-16le";
          if (c[0] === 254 && c[1] === 255)
            return "utf-16be";
        }
        return c.length >= 3 && c[0] === 239 && c[1] === 187 && c[2] === 191 ? "utf8" : c.length >= 4 ? c[0] === 60 && c[1] === 0 && c[2] === 63 && c[3] === 0 ? "utf-16le" : c[0] === 0 && c[1] === 60 && c[2] === 0 && c[3] === 63 ? "utf-16be" : "utf8" : o ? "utf8" : null;
      }
      function m(c, o) {
        if (!(this instanceof m))
          return new m(c, o);
        s.apply(this), this._parser = new i(c, o), this.writable = !0, this.readable = !0;
        var _ = this;
        this._parser.onend = function() {
          _.emit("end");
        }, this._parser.onerror = function(N) {
          _.emit("error", N), _._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, d.forEach(function(N) {
          Object.defineProperty(_, "on" + N, {
            get: function() {
              return _._parser["on" + N];
            },
            set: function(X) {
              if (!X)
                return _.removeAllListeners(N), _._parser["on" + N] = X, X;
              _.on(N, X);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      m.prototype = Object.create(s.prototype, {
        constructor: {
          value: m
        }
      }), m.prototype._decodeBuffer = function(c, o) {
        if (this._decoderBuffer && (c = Buffer.concat([this._decoderBuffer, c]), this._decoderBuffer = null), !this._decoder) {
          var _ = l(c, o);
          if (!_)
            return this._decoderBuffer = c, "";
          this._parser.encoding = _, this._decoder = new TextDecoder(_);
        }
        return this._decoder.decode(c, { stream: !o });
      }, m.prototype.write = function(c) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(c))
          c = this._decodeBuffer(c, !1);
        else if (this._decoderBuffer) {
          var o = this._decodeBuffer(Buffer.alloc(0), !0);
          o && (this._parser.write(o), this.emit("data", o));
        }
        return this._parser.write(c.toString()), this.emit("data", c), !0;
      }, m.prototype.end = function(c) {
        if (c && c.length && this.write(c), this._decoderBuffer) {
          var o = this._decodeBuffer(Buffer.alloc(0), !0);
          o && (this._parser.write(o), this.emit("data", o));
        } else if (this._decoder) {
          var _ = this._decoder.decode();
          _ && (this._parser.write(_), this.emit("data", _));
        }
        return this._parser.end(), !0;
      }, m.prototype.on = function(c, o) {
        var _ = this;
        return !_._parser["on" + c] && d.indexOf(c) !== -1 && (_._parser["on" + c] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, c), _.emit.apply(_, N);
        }), s.prototype.on.call(_, c, o);
      };
      var f = /^\[CDATA\[$/i, w = /^DOCTYPE$/i, x = "http://www.w3.org/XML/1998/namespace", v = "http://www.w3.org/2000/xmlns/", T = { xml: x, xmlns: v }, E = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, b = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function M(c) {
        return c === " " || c === `
` || c === "\r" || c === "	";
      }
      function S(c) {
        return c === '"' || c === "'";
      }
      function R(c) {
        return c === ">" || M(c);
      }
      function U(c, o) {
        return c.test(o);
      }
      function g(c, o) {
        return !U(c, o);
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
      }), Object.keys(e.ENTITIES).forEach(function(c) {
        var o = e.ENTITIES[c], _ = typeof o == "number" ? String.fromCharCode(o) : o;
        e.ENTITIES[c] = _;
      });
      for (var P in e.STATE)
        e.STATE[e.STATE[P]] = P;
      p = e.STATE;
      function $(c, o, _) {
        c[o] && c[o](_);
      }
      function H(c) {
        var o = c && c.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return o ? o[2] : null;
      }
      function q(c) {
        return c ? c.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function ne(c, o) {
        const _ = q(c), N = q(o);
        return !_ || !N ? !0 : N === "utf16" ? _ === "utf16le" || _ === "utf16be" : _ === N;
      }
      function y(c, o) {
        if (!(!c.strict || !c.encoding || !o || o.name !== "xml")) {
          var _ = H(o.body);
          _ && !ne(c.encoding, _) && j(
            c,
            "XML declaration encoding " + _ + " does not match detected stream encoding " + c.encoding.toUpperCase()
          );
        }
      }
      function I(c, o, _) {
        c.textNode && G(c), $(c, o, _);
      }
      function G(c) {
        c.textNode = B(c.opt, c.textNode), c.textNode && $(c, "ontext", c.textNode), c.textNode = "";
      }
      function B(c, o) {
        return c.trim && (o = o.trim()), c.normalize && (o = o.replace(/\s+/g, " ")), o;
      }
      function W(c, o) {
        return G(c), c.trackPosition && (o += `
Line: ` + c.line + `
Column: ` + c.column + `
Char: ` + c.c), o = new Error(o), c.error = o, $(c, "onerror", o), c;
      }
      function F(c) {
        return c.sawRoot && !c.closedRoot && j(c, "Unclosed root tag"), c.state !== p.BEGIN && c.state !== p.BEGIN_WHITESPACE && c.state !== p.TEXT && W(c, "Unexpected end"), G(c), c.c = "", c.closed = !0, $(c, "onend"), i.call(c, c.strict, c.opt), c;
      }
      function j(c, o) {
        if (typeof c != "object" || !(c instanceof i))
          throw new Error("bad call to strictFail");
        c.strict && W(c, o);
      }
      function Z(c) {
        c.strict || (c.tagName = c.tagName[c.looseCase]());
        var o = c.tags[c.tags.length - 1] || c, _ = c.tag = { name: c.tagName, attributes: {} };
        c.opt.xmlns && (_.ns = o.ns), c.attribList.length = 0, I(c, "onopentagstart", _);
      }
      function te(c, o) {
        var _ = c.indexOf(":"), N = _ < 0 ? ["", c] : c.split(":"), X = N[0], J = N[1];
        return o && c === "xmlns" && (X = "xmlns", J = ""), { prefix: X, local: J };
      }
      function de(c) {
        if (c.strict || (c.attribName = c.attribName[c.looseCase]()), c.attribList.indexOf(c.attribName) !== -1 || c.tag.attributes.hasOwnProperty(c.attribName)) {
          c.attribName = c.attribValue = "";
          return;
        }
        if (c.opt.xmlns) {
          var o = te(c.attribName, !0), _ = o.prefix, N = o.local;
          if (_ === "xmlns")
            if (N === "xml" && c.attribValue !== x)
              j(
                c,
                "xml: prefix must be bound to " + x + `
Actual: ` + c.attribValue
              );
            else if (N === "xmlns" && c.attribValue !== v)
              j(
                c,
                "xmlns: prefix must be bound to " + v + `
Actual: ` + c.attribValue
              );
            else {
              var X = c.tag, J = c.tags[c.tags.length - 1] || c;
              X.ns === J.ns && (X.ns = Object.create(J.ns)), X.ns[N] = c.attribValue;
            }
          c.attribList.push([c.attribName, c.attribValue]);
        } else
          c.tag.attributes[c.attribName] = c.attribValue, I(c, "onattribute", {
            name: c.attribName,
            value: c.attribValue
          });
        c.attribName = c.attribValue = "";
      }
      function oe(c, o) {
        if (c.opt.xmlns) {
          var _ = c.tag, N = te(c.tagName);
          _.prefix = N.prefix, _.local = N.local, _.uri = _.ns[N.prefix] || "", _.prefix && !_.uri && (j(
            c,
            "Unbound namespace prefix: " + JSON.stringify(c.tagName)
          ), _.uri = N.prefix);
          var X = c.tags[c.tags.length - 1] || c;
          _.ns && X.ns !== _.ns && Object.keys(_.ns).forEach(function(Be) {
            I(c, "onopennamespace", {
              prefix: Be,
              uri: _.ns[Be]
            });
          });
          for (var J = 0, Y = c.attribList.length; J < Y; J++) {
            var ae = c.attribList[J], K = ae[0], V = ae[1], z = te(K, !0), ce = z.prefix, ve = z.local, Ee = ce === "" ? "" : _.ns[ce] || "", _e = {
              name: K,
              value: V,
              prefix: ce,
              local: ve,
              uri: Ee
            };
            ce && ce !== "xmlns" && !Ee && (j(
              c,
              "Unbound namespace prefix: " + JSON.stringify(ce)
            ), _e.uri = ce), c.tag.attributes[K] = _e, I(c, "onattribute", _e);
          }
          c.attribList.length = 0;
        }
        c.tag.isSelfClosing = !!o, c.sawRoot = !0, c.tags.push(c.tag), I(c, "onopentag", c.tag), o || (!c.noscript && c.tagName.toLowerCase() === "script" ? c.state = p.SCRIPT : c.state = p.TEXT, c.tag = null, c.tagName = ""), c.attribName = c.attribValue = "", c.attribList.length = 0;
      }
      function me(c) {
        if (!c.tagName) {
          j(c, "Weird empty close tag."), c.textNode += "</>", c.state = p.TEXT;
          return;
        }
        if (c.script) {
          if (c.tagName !== "script") {
            c.script += "</" + c.tagName + ">", c.tagName = "", c.state = p.SCRIPT;
            return;
          }
          I(c, "onscript", c.script), c.script = "";
        }
        var o = c.tags.length, _ = c.tagName;
        c.strict || (_ = _[c.looseCase]());
        for (var N = _; o--; ) {
          var X = c.tags[o];
          if (X.name !== N)
            j(c, "Unexpected close tag");
          else
            break;
        }
        if (o < 0) {
          j(c, "Unmatched closing tag: " + c.tagName), c.textNode += "</" + c.tagName + ">", c.state = p.TEXT;
          return;
        }
        c.tagName = _;
        for (var J = c.tags.length; J-- > o; ) {
          var Y = c.tag = c.tags.pop();
          c.tagName = c.tag.name, I(c, "onclosetag", c.tagName);
          var ae = {};
          for (var K in Y.ns)
            ae[K] = Y.ns[K];
          var V = c.tags[c.tags.length - 1] || c;
          c.opt.xmlns && Y.ns !== V.ns && Object.keys(Y.ns).forEach(function(z) {
            var ce = Y.ns[z];
            I(c, "onclosenamespace", { prefix: z, uri: ce });
          });
        }
        o === 0 && (c.closedRoot = !0), c.tagName = c.attribValue = c.attribName = "", c.attribList.length = 0, c.state = p.TEXT;
      }
      function ue(c) {
        var o = c.entity, _ = o.toLowerCase(), N, X = "";
        return c.ENTITIES[o] ? c.ENTITIES[o] : c.ENTITIES[_] ? c.ENTITIES[_] : (o = _, o.charAt(0) === "#" && (o.charAt(1) === "x" ? (o = o.slice(2), N = parseInt(o, 16), X = N.toString(16)) : (o = o.slice(1), N = parseInt(o, 10), X = N.toString(10))), o = o.replace(/^0+/, ""), isNaN(N) || X.toLowerCase() !== o || N < 0 || N > 1114111 || !Ue(N) ? (j(c, "Invalid character entity"), "&" + c.entity + ";") : String.fromCodePoint(N));
      }
      function Ue(c) {
        return c === 9 || c === 10 || c === 13 || c >= 32 && c <= 55295 || c >= 57344 && c <= 65533 || c >= 65536 && c <= 1114111;
      }
      function k(c, o) {
        o === "<" ? (c.state = p.OPEN_WAKA, c.startTagPosition = c.position) : M(o) || (j(c, "Non-whitespace before first tag."), c.textNode = o, c.state = p.TEXT);
      }
      function L(c, o) {
        var _ = "";
        return o < c.length && (_ = c.charAt(o)), _;
      }
      function Q(c) {
        var o = this;
        if (this.error)
          throw this.error;
        if (o.closed)
          return W(
            o,
            "Cannot write after close. Assign an onready handler."
          );
        if (c === null)
          return F(o);
        typeof c == "object" && (c = c.toString());
        for (var _ = 0, N = ""; N = L(c, _++), o.c = N, !!N; )
          switch (o.trackPosition && (o.position++, N === `
` ? (o.line++, o.column = 0) : o.column++), o.state) {
            case p.BEGIN:
              if (o.state = p.BEGIN_WHITESPACE, N === "\uFEFF")
                continue;
              k(o, N);
              continue;
            case p.BEGIN_WHITESPACE:
              k(o, N);
              continue;
            case p.TEXT:
              if (o.sawRoot && !o.closedRoot) {
                for (var J = _ - 1; N && N !== "<" && N !== "&"; )
                  N = L(c, _++), N && o.trackPosition && (o.position++, N === `
` ? (o.line++, o.column = 0) : o.column++);
                o.textNode += c.substring(J, _ - 1);
              }
              N === "<" && !(o.sawRoot && o.closedRoot && !o.strict) ? (o.state = p.OPEN_WAKA, o.startTagPosition = o.position) : (!M(N) && (!o.sawRoot || o.closedRoot) && j(o, "Text data outside of root node."), N === "&" ? o.state = p.TEXT_ENTITY : o.textNode += N);
              continue;
            case p.SCRIPT:
              N === "<" ? o.state = p.SCRIPT_ENDING : o.script += N;
              continue;
            case p.SCRIPT_ENDING:
              N === "/" ? o.state = p.CLOSE_TAG : (o.script += "<" + N, o.state = p.SCRIPT);
              continue;
            case p.OPEN_WAKA:
              if (N === "!")
                o.state = p.SGML_DECL, o.sgmlDecl = "";
              else if (!M(N)) if (U(E, N))
                o.state = p.OPEN_TAG, o.tagName = N;
              else if (N === "/")
                o.state = p.CLOSE_TAG, o.tagName = "";
              else if (N === "?")
                o.state = p.PROC_INST, o.procInstName = o.procInstBody = "";
              else {
                if (j(o, "Unencoded <"), o.startTagPosition + 1 < o.position) {
                  var X = o.position - o.startTagPosition;
                  N = new Array(X).join(" ") + N;
                }
                o.textNode += "<" + N, o.state = p.TEXT;
              }
              continue;
            case p.SGML_DECL:
              if (o.sgmlDecl + N === "--") {
                o.state = p.COMMENT, o.comment = "", o.sgmlDecl = "";
                continue;
              }
              o.doctype && o.doctype !== !0 && o.sgmlDecl ? (o.state = p.DOCTYPE_DTD, o.doctype += "<!" + o.sgmlDecl + N, o.sgmlDecl = "") : f.test(o.sgmlDecl + N) ? (I(o, "onopencdata"), o.state = p.CDATA, o.sgmlDecl = "", o.cdata = "") : w.test(o.sgmlDecl + N) ? (o.state = p.DOCTYPE, (o.doctype || o.sawRoot) && j(
                o,
                "Inappropriately located doctype declaration"
              ), o.doctype = "", o.sgmlDecl = "") : N === ">" ? (I(o, "onsgmldeclaration", o.sgmlDecl), o.sgmlDecl = "", o.state = p.TEXT) : (S(N) && (o.state = p.SGML_DECL_QUOTED), o.sgmlDecl += N);
              continue;
            case p.SGML_DECL_QUOTED:
              N === o.q && (o.state = p.SGML_DECL, o.q = ""), o.sgmlDecl += N;
              continue;
            case p.DOCTYPE:
              N === ">" ? (o.state = p.TEXT, I(o, "ondoctype", o.doctype), o.doctype = !0) : (o.doctype += N, N === "[" ? o.state = p.DOCTYPE_DTD : S(N) && (o.state = p.DOCTYPE_QUOTED, o.q = N));
              continue;
            case p.DOCTYPE_QUOTED:
              o.doctype += N, N === o.q && (o.q = "", o.state = p.DOCTYPE);
              continue;
            case p.DOCTYPE_DTD:
              N === "]" ? (o.doctype += N, o.state = p.DOCTYPE) : N === "<" ? (o.state = p.OPEN_WAKA, o.startTagPosition = o.position) : S(N) ? (o.doctype += N, o.state = p.DOCTYPE_DTD_QUOTED, o.q = N) : o.doctype += N;
              continue;
            case p.DOCTYPE_DTD_QUOTED:
              o.doctype += N, N === o.q && (o.state = p.DOCTYPE_DTD, o.q = "");
              continue;
            case p.COMMENT:
              N === "-" ? o.state = p.COMMENT_ENDING : o.comment += N;
              continue;
            case p.COMMENT_ENDING:
              N === "-" ? (o.state = p.COMMENT_ENDED, o.comment = B(o.opt, o.comment), o.comment && I(o, "oncomment", o.comment), o.comment = "") : (o.comment += "-" + N, o.state = p.COMMENT);
              continue;
            case p.COMMENT_ENDED:
              N !== ">" ? (j(o, "Malformed comment"), o.comment += "--" + N, o.state = p.COMMENT) : o.doctype && o.doctype !== !0 ? o.state = p.DOCTYPE_DTD : o.state = p.TEXT;
              continue;
            case p.CDATA:
              for (var J = _ - 1; N && N !== "]"; )
                N = L(c, _++), N && o.trackPosition && (o.position++, N === `
` ? (o.line++, o.column = 0) : o.column++);
              o.cdata += c.substring(J, _ - 1), N === "]" && (o.state = p.CDATA_ENDING);
              continue;
            case p.CDATA_ENDING:
              N === "]" ? o.state = p.CDATA_ENDING_2 : (o.cdata += "]" + N, o.state = p.CDATA);
              continue;
            case p.CDATA_ENDING_2:
              N === ">" ? (o.cdata && I(o, "oncdata", o.cdata), I(o, "onclosecdata"), o.cdata = "", o.state = p.TEXT) : N === "]" ? o.cdata += "]" : (o.cdata += "]]" + N, o.state = p.CDATA);
              continue;
            case p.PROC_INST:
              N === "?" ? o.state = p.PROC_INST_ENDING : M(N) ? o.state = p.PROC_INST_BODY : o.procInstName += N;
              continue;
            case p.PROC_INST_BODY:
              if (!o.procInstBody && M(N))
                continue;
              N === "?" ? o.state = p.PROC_INST_ENDING : o.procInstBody += N;
              continue;
            case p.PROC_INST_ENDING:
              if (N === ">") {
                const V = {
                  name: o.procInstName,
                  body: o.procInstBody
                };
                y(o, V), I(o, "onprocessinginstruction", V), o.procInstName = o.procInstBody = "", o.state = p.TEXT;
              } else
                o.procInstBody += "?" + N, o.state = p.PROC_INST_BODY;
              continue;
            case p.OPEN_TAG:
              U(b, N) ? o.tagName += N : (Z(o), N === ">" ? oe(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : (M(N) || j(o, "Invalid character in tag name"), o.state = p.ATTRIB));
              continue;
            case p.OPEN_TAG_SLASH:
              N === ">" ? (oe(o, !0), me(o)) : (j(
                o,
                "Forward-slash in opening tag not followed by >"
              ), o.state = p.ATTRIB);
              continue;
            case p.ATTRIB:
              if (M(N))
                continue;
              N === ">" ? oe(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : U(E, N) ? (o.attribName = N, o.attribValue = "", o.state = p.ATTRIB_NAME) : j(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME:
              N === "=" ? o.state = p.ATTRIB_VALUE : N === ">" ? (j(o, "Attribute without value"), o.attribValue = o.attribName, de(o), oe(o)) : M(N) ? o.state = p.ATTRIB_NAME_SAW_WHITE : U(b, N) ? o.attribName += N : j(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME_SAW_WHITE:
              if (N === "=")
                o.state = p.ATTRIB_VALUE;
              else {
                if (M(N))
                  continue;
                j(o, "Attribute without value"), o.tag.attributes[o.attribName] = "", o.attribValue = "", I(o, "onattribute", {
                  name: o.attribName,
                  value: ""
                }), o.attribName = "", N === ">" ? oe(o) : U(E, N) ? (o.attribName = N, o.state = p.ATTRIB_NAME) : (j(o, "Invalid attribute name"), o.state = p.ATTRIB);
              }
              continue;
            case p.ATTRIB_VALUE:
              if (M(N))
                continue;
              S(N) ? (o.q = N, o.state = p.ATTRIB_VALUE_QUOTED) : (o.opt.unquotedAttributeValues || W(o, "Unquoted attribute value"), o.state = p.ATTRIB_VALUE_UNQUOTED, o.attribValue = N);
              continue;
            case p.ATTRIB_VALUE_QUOTED:
              if (N !== o.q) {
                N === "&" ? o.state = p.ATTRIB_VALUE_ENTITY_Q : o.attribValue += N;
                continue;
              }
              de(o), o.q = "", o.state = p.ATTRIB_VALUE_CLOSED;
              continue;
            case p.ATTRIB_VALUE_CLOSED:
              M(N) ? o.state = p.ATTRIB : N === ">" ? oe(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : U(E, N) ? (j(o, "No whitespace between attributes"), o.attribName = N, o.attribValue = "", o.state = p.ATTRIB_NAME) : j(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_VALUE_UNQUOTED:
              if (!R(N)) {
                N === "&" ? o.state = p.ATTRIB_VALUE_ENTITY_U : o.attribValue += N;
                continue;
              }
              de(o), N === ">" ? oe(o) : o.state = p.ATTRIB;
              continue;
            case p.CLOSE_TAG:
              if (o.tagName)
                N === ">" ? me(o) : U(b, N) ? o.tagName += N : o.script ? (o.script += "</" + o.tagName + N, o.tagName = "", o.state = p.SCRIPT) : (M(N) || j(o, "Invalid tagname in closing tag"), o.state = p.CLOSE_TAG_SAW_WHITE);
              else {
                if (M(N))
                  continue;
                g(E, N) ? o.script ? (o.script += "</" + N, o.state = p.SCRIPT) : j(o, "Invalid tagname in closing tag.") : o.tagName = N;
              }
              continue;
            case p.CLOSE_TAG_SAW_WHITE:
              if (M(N))
                continue;
              N === ">" ? me(o) : j(o, "Invalid characters in closing tag");
              continue;
            case p.TEXT_ENTITY:
            case p.ATTRIB_VALUE_ENTITY_Q:
            case p.ATTRIB_VALUE_ENTITY_U:
              var Y, ae;
              switch (o.state) {
                case p.TEXT_ENTITY:
                  Y = p.TEXT, ae = "textNode";
                  break;
                case p.ATTRIB_VALUE_ENTITY_Q:
                  Y = p.ATTRIB_VALUE_QUOTED, ae = "attribValue";
                  break;
                case p.ATTRIB_VALUE_ENTITY_U:
                  Y = p.ATTRIB_VALUE_UNQUOTED, ae = "attribValue";
                  break;
              }
              if (N === ";") {
                var K = ue(o);
                o.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(K) ? ((o.entityCount += 1) > o.opt.maxEntityCount && W(
                  o,
                  "Parsed entity count exceeds max entity count"
                ), (o.entityDepth += 1) > o.opt.maxEntityDepth && W(
                  o,
                  "Parsed entity depth exceeds max entity depth"
                ), o.entity = "", o.state = Y, o.write(K), o.entityDepth -= 1) : (o[ae] += K, o.entity = "", o.state = Y);
              } else U(o.entity.length ? A : C, N) ? o.entity += N : (j(o, "Invalid character in entity name"), o[ae] += "&" + o.entity + N, o.entity = "", o.state = Y);
              continue;
            default:
              throw new Error(o, "Unknown state: " + o.state);
          }
        return o.position >= o.bufferCheckPosition && r(o), o;
      }
      String.fromCodePoint || (function() {
        var c = String.fromCharCode, o = Math.floor, _ = function() {
          var N = 16384, X = [], J, Y, ae = -1, K = arguments.length;
          if (!K)
            return "";
          for (var V = ""; ++ae < K; ) {
            var z = Number(arguments[ae]);
            if (!isFinite(z) || // `NaN`, `+Infinity`, or `-Infinity`
            z < 0 || // not a valid Unicode code point
            z > 1114111 || // not a valid Unicode code point
            o(z) !== z)
              throw RangeError("Invalid code point: " + z);
            z <= 65535 ? X.push(z) : (z -= 65536, J = (z >> 10) + 55296, Y = z % 1024 + 56320, X.push(J, Y)), (ae + 1 === K || X.length > N) && (V += c.apply(null, X), X.length = 0);
          }
          return V;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: _,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = _;
      })();
    })(t);
  })(Je)), Je;
}
var et, Tt;
function No() {
  if (Tt) return et;
  Tt = 1;
  var t = _o().parser;
  function e(n) {
    var i = [], r = [], a = i, u;
    return u = t(!0), u.ontext = function(s) {
      s.trim() !== "" && a.push(s);
    }, u.onopentag = function(s) {
      var d;
      d = [s.name, s.attributes], r.push(a), a.push(d), a = d;
    }, u.onclosetag = function() {
      a = r.pop();
    }, u.write(n).close(), i[0];
  }
  return et = e, et;
}
var tt, At;
function Co() {
  if (At) return tt;
  At = 1;
  function t(e, n) {
    var i = function() {
    }, r = i, a = i;
    function u() {
      this._skip = !0;
    }
    function s() {
      this._remove = !0;
    }
    function d(m) {
      this._name = m;
    }
    function h(m) {
      this._replace = m;
    }
    function l(m, f) {
      var w, x = { attr: {}, full: m }, v = {
        name: d,
        skip: u,
        // break: breakFn,
        remove: s,
        replace: h,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, T = !0, E, b, C;
      if (m !== void 0 && m !== null && m !== !0 && m !== !1)
        switch (w = Object.prototype.toString.call(m), w) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (m.some(function(A, M) {
              if (M === 0)
                return x.name = A, !1;
              if (M === 1)
                return Object.prototype.toString.call(A) === "[object Object]" && (T = !1, x.attr = A), !0;
            }), r.call(v, x, f), v._name && (m[0] = v._name), v._replace)
              return v._replace;
            if (v._remove)
              return null;
            if (!v._skip) {
              for (E = 0, b = m.length; E < b; ) {
                if (E > 1 || E === 1 && T) {
                  if (C = l(m[E], x), C === null) {
                    m.splice(E, 1), b -= 1;
                    continue;
                  }
                  C && (m[E] = C);
                }
                E += 1;
              }
              if (a.call(v, x, f), v._name && (m[0] = v._name), v._replace)
                return v._replace;
              if (v._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (a = n.leave)), l(e, void 0);
  }
  return tt = t, tt;
}
var nt, Ot;
function So() {
  if (Ot) return nt;
  Ot = 1;
  const t = No(), e = Co(), n = (r) => String(r).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[a]);
  function i(r) {
    const [a, ...u] = r, s = u[0] && typeof u[0] == "object" && !Array.isArray(u[0]) ? u.shift() : {}, d = "<" + a + Object.entries(s).map(([h, l]) => " " + h + '="' + n(l) + '"').join("");
    return u.length ? d + ">" + u.map((h) => Array.isArray(h) ? i(h) : n(h)).join("") + "</" + a + ">" : d + "/>";
  }
  return nt = { parse: t, p: t, traverse: e, t: e, stringify: i, s: i }, nt;
}
So();
const ot = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), Io = (t, e) => [...t].reduce((n, i) => n + (i.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function To(t, e, n = 12) {
  const i = [], r = t.map((u) => ({ x: u.x, y: u.y, w: u.w, h: u.h }));
  for (const [u, s] of t.entries()) {
    if (!s.labels.length) continue;
    const d = Math.max(...s.labels.map((x) => Io(x.text, n))) + 4, h = s.labels.length * (n + 4), l = [];
    for (const x of [5, 14, 28, 48]) {
      const v = { x: s.x + (s.w - d) / 2, y: s.y - x - h, w: d, h }, T = { x: s.x + (s.w - d) / 2, y: s.y + s.h + x, w: d, h }, E = { x: s.x + s.w + x, y: s.y + (s.h - h) / 2, w: d, h }, b = { x: s.x - x - d, y: s.y + (s.h - h) / 2, w: d, h };
      l.push(...s.w > s.h ? [v, T, E, b] : [E, b, v, T]);
    }
    const m = (x) => e.reduce((v, T) => {
      const E = Math.min(T.a.x, T.b.x), b = Math.min(T.a.y, T.b.y), C = { x: E - 1, y: b - 1, w: Math.abs(T.a.x - T.b.x) + 2, h: Math.abs(T.a.y - T.b.y) + 2 };
      return v + ot(x, C) * 2;
    }, 0);
    let f = null, w = 1 / 0;
    for (const [x, v] of l.entries()) {
      const T = r.reduce((E, b, C) => E + (C === u ? 0 : ot(v, b)) * 500, 0) + i.reduce((E, b) => E + ot(v, b) * 100, 0) + m(v) + x * 3;
      T < w && (w = T, f = v);
    }
    s.labels.forEach((x, v) => {
      x.x = f.x - s.x, x.y = f.y - s.y + n + v * (n + 4);
    }), i.push(f);
  }
  const a = [...r, ...i];
  return { x: Math.min(0, ...a.map((u) => u.x)), y: Math.min(0, ...a.map((u) => u.y)), right: Math.max(0, ...a.map((u) => u.x + u.w)), bottom: Math.max(0, ...a.map((u) => u.y + u.h)) };
}
const Ao = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function Oo(t, e = 12) {
  const n = [...t.children].filter((a) => a.localName === "g" && a.id.startsWith("cell_")).map((a) => ({ ...Ao(a.getAttribute("transform")), w: +a.getAttribute("s:width"), h: +a.getAttribute("s:height"), labels: [...a.children].filter((u) => u.localName === "text" && u.hasAttribute("data-layout-label")).map((u) => ({ node: u, text: u.textContent })) })), i = [...t.children].filter((a) => a.localName === "line" && a.hasAttribute("data-net")).map((a) => ({ a: { x: +a.getAttribute("x1"), y: +a.getAttribute("y1") }, b: { x: +a.getAttribute("x2"), y: +a.getAttribute("y2") } })), r = To(n, i, e);
  for (const a of n) for (const u of a.labels)
    u.node.setAttribute("x", u.x), u.node.setAttribute("y", u.y), u.node.setAttribute("text-anchor", "start"), u.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
const kt = Me.filter.source, D = (t) => document.getElementById("spice-" + t), ge = D("app");
if (ge) {
  let $ = function() {
    const k = e.querySelector("svg");
    if (!k) return;
    const L = Number(k.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, Q = Oo(k, L), c = Math.min(C.x, Q.x - 20), o = Math.min(C.y, Q.y - 20);
    C = { x: c, y: o, w: Math.max(C.x + C.w, Q.right + 20) - c, h: Math.max(C.y + C.h, Q.bottom + 20) - o }, d && Wn(k, h, d), s?.refreshColors(), Ge(k, P(), D("show-grid").checked, b);
    const _ = k.cloneNode(!0);
    s?.cleanExport(_), _.setAttribute("width", C.w), _.setAttribute("height", C.h), _.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`), Ge(_, P(), D("show-grid").checked, C), l = new XMLSerializer().serializeToString(_), D("source").value = l;
  }, ne = function(k) {
    const L = D("example-info");
    if (L && (L.replaceChildren(), !!k && (L.append(document.createTextNode(k.description + " ")), k.url))) {
      const Q = document.createElement("a");
      Q.href = k.url, Q.target = "_blank", Q.rel = "noopener noreferrer", Q.textContent = k.reference, L.append(Q);
    }
  }, y = function() {
    s.invalidate(), H.setEnabled(!1), r = null, a = null, l = "", g(), ne(Object.values(Me).find((k) => k.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, I = function(k) {
    i.replaceChildren();
    for (const { severity: L, line: Q, message: c, source: o } of k) {
      const _ = document.createElement("li");
      _.className = L, _.textContent = `${L.toUpperCase()}${o && o !== "input.cir" ? " · " + o : ""}${Q ? " · line " + Q : ""}: ${c}`, i.append(_);
    }
    D("messages").open = k.some((L) => L.severity !== "info"), D("message-count").textContent = `${k.length} message${k.length === 1 ? "" : "s"}`;
  }, G = function() {
    !E && l && R.set(v, { ...b }), e.querySelector("svg")?.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    const k = e.querySelector("svg");
    k && Ge(k, P(), D("show-grid").checked, b), D("zoom-level").textContent = Math.round(C.w / b.w * 100) + "%";
  }, W = function(k, L = b.x + b.w / 2, Q = b.y + b.h / 2) {
    if (!e.querySelector("svg")) return;
    const c = Math.max(0.05, Math.min(10, b.w * k / C.w)) * C.w / b.w;
    b = { x: L + (b.x - L) * c, y: Q + (b.y - Q) * c, w: b.w * c, h: b.h * c }, G();
  }, j = function(k) {
    const L = new URLSearchParams();
    k && L.set("instance", k);
    const Q = L.toString();
    location.hash.slice(1) === Q ? (v = k, oe()) : location.hash = Q;
  }, Z = function() {
    v = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, te = function() {
    const k = !!(T && T !== v && f?.contexts[T]);
    D("selection-actions").hidden = !k, D("open-instance").href = "#" + new URLSearchParams({ instance: T });
  }, de = function() {
    D("breadcrumbs").replaceChildren();
    const k = (Q, c) => {
      const o = document.createElement("button");
      o.type = "button", o.textContent = Q, o.onclick = () => j(c), o.disabled = c === v, D("breadcrumbs").append(o);
    };
    if (k("Top", ""), v) {
      const Q = f.contexts[v].path;
      for (let c = 0; c < Q.length; c++) k(Q[c], Q.slice(0, c + 1).map(encodeURIComponent).join("/"));
    }
    D("instances").replaceChildren();
    const L = (Q, c) => {
      for (const o of Q.children) {
        const _ = document.createElement("div");
        _.className = "spice-instance-row", _.style.setProperty("--depth", Math.min(c, 8)), _.dataset.instance = o.id;
        const N = document.createElement("a");
        N.href = "#" + new URLSearchParams({ instance: o.id }), N.textContent = o.name + " · " + o.definition, N.title = "Open " + o.id + " as its own sheet";
        const X = document.createElement("span");
        if (X.className = "spice-help", X.textContent = Object.entries(o.params).map(([J, Y]) => J + "=" + Y).join(" · "), _.append(N), X.textContent) {
          const J = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", J.append(Y, X), _.append(J);
        }
        D("instances").append(_), L(o, c + 1);
      }
    };
    L(f.contexts[v], 0), D("hierarchy-panel").hidden = !f.contexts[v].children.length, D("focus-title").textContent = v ? v + " / " + f.contexts[v].definition : "Top-level schematic", te();
  };
  yo(ge), qn(ge);
  const t = D("input"), e = D("preview"), n = D("status"), i = D("diagnostics");
  let r = null, a = null, u = !1, s = null, d = null, h = [], l = "", m, f, w, x = "", v = "", T = "", E = !1, b = { x: 0, y: 0, w: 1, h: 1 }, C = { ...b }, A, M = !1, S = {}, R = /* @__PURE__ */ new Map(), U = !1;
  try {
    S = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ge.addEventListener("click", (k) => {
    E && k.target.closest('a[href^="#"]') && k.preventDefault();
  });
  const g = () => {
    D("upload").disabled = E || U || u, D("download-project").disabled = D("open-download").disabled = D("copy").disabled = D("download").disabled = !l || E || U || s?.working(), D("download-asc").disabled = D("download-asc-bundle").disabled = !l || !r || E || u || !s?.complete();
  }, p = () => ({ font: D("font").value, fontSize: Number(D("size").value), color: ut, gridSize: D("grid").checked && D("conventional").checked ? ct : 0, detailed: D("detailed").checked, conventional: D("conventional").checked }), P = () => m?.layout.report?.gridSize ? Number(D("grid-size").value) : 0, H = $n(D, (k, L) => {
    d = k, h = L, $();
  });
  s = Jn(e, D, { getNetColor: (k) => {
    const L = h.find((Q) => Q.bit === k);
    return L && d && (d.auto || d.manual.has(L.name)) ? d.color(L.name) : null;
  }, inspect: (k) => {
    const L = m?.components.find((Q) => Q.name === k);
    L && (T = L.instanceId || "", D("selection").textContent = L.raw, te());
  }, changed: (k, L, Q) => {
    r = k, a = null, C = Q;
    const c = e.querySelector("svg");
    if (c) {
      c.setAttribute("width", String(C.w)), c.setAttribute("height", String(C.h));
      const o = c.querySelector("#spice-layout-report");
      if (o) {
        const _ = JSON.parse(o.textContent);
        _.manualWiring = L, _.verifiedTerminals = !L.unrouted, _.geometricConnectivityVerified = !L.unrouted, o.textContent = JSON.stringify(_);
      }
    }
    m && w && (D("json").value = JSON.stringify({ circuit: m, netlist: Qe(m), hierarchy: w, interactive: { ...L, drawing: k } }, null, 2)), $(), g();
  } }), D("show-grid").onchange = $, D("grid-size").onchange = () => {
    $(), G();
  };
  async function q() {
    (!r || !m?.layout.report?.gridVerified) && (D("grid").checked = !0, D("conventional").checked = !0, await oe({ resetEditor: !0 })), s.setEnabled(D("interactive").checked), g();
  }
  D("interactive").onchange = q, D("flywire").onchange = async () => {
    D("interactive").checked = !0, await q(), D("flywire").checked ? s.clear() : await s.autoRoute(), g();
  }, D("auto-route").onclick = async () => {
    D("interactive").checked = !0, await q(), await s.autoRoute(), g();
  }, D("wire-undo").onclick = () => s.undo(), D("wire-redo").onclick = () => s.redo();
  for (const k of ge.querySelectorAll("[data-editor-mode]")) k.onclick = async () => {
    D("interactive").checked = !0, await q(), s.chooseTool(k.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  H.setEnabled(!1), t.value = kt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || kt;
  } catch {
  }
  ne(Object.values(Me).find((k) => k.source === t.value)), t.addEventListener("input", y);
  for (const k of ["font", "size", "detailed", "conventional", "grid"]) D(k).addEventListener("input", y);
  new ResizeObserver(() => {
    const k = e.querySelector("svg");
    k && Ge(k, P(), D("show-grid").checked, b);
  }).observe(e), D("zoom-in").onclick = () => W(0.8), D("zoom-out").onclick = () => W(1.25), D("fit").onclick = () => {
    b = { ...C }, G();
  };
  const F = (k) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(k.clientX, k.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (k) => {
    const L = F(k);
    L && (k.preventDefault(), W(k.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (k) => {
    ![0, 1].includes(k.button) || !e.querySelector("svg") || (A = { start: F(k), x: k.clientX, y: k.clientY, view: { ...b }, moved: !1 }, e.setPointerCapture(k.pointerId));
  }), e.addEventListener("pointermove", (k) => {
    if (!A) return;
    const L = F(k);
    Math.hypot(k.clientX - A.x, k.clientY - A.y) > 4 && (A.moved = !0), b.x += A.start.x - L.x, b.y += A.start.y - L.y, G();
  }), e.addEventListener("pointerup", (k) => {
    if (!A) return;
    const L = A.moved;
    if (A = null, e.hasPointerCapture(k.pointerId) && e.releasePointerCapture(k.pointerId), !L) {
      const Q = document.elementFromPoint(k.clientX, k.clientY)?.closest("[data-component]"), c = m?.components.find((o) => o.name === Q?.dataset.component);
      c && (T = c.instanceId || "", D("selection").textContent = `${c.raw}
${Object.entries(c.terminals).map(([o, _]) => `${o} → ${_}`).join("   ")}`, c.kind === "X" ? j(c.instanceId) : te());
    }
  }), window.addEventListener("hashchange", () => {
    if (E) {
      M = !0;
      return;
    }
    Z(), T = "", oe();
  }), e.addEventListener("pointercancel", () => {
    A = null;
  }), e.addEventListener("keydown", (k) => {
    const L = k.target.closest("[data-instance]");
    if (L && (k.key === "Enter" || k.key === " ")) {
      k.preventDefault(), T = L.dataset.instance, j(T);
      return;
    }
    k.key === "+" || k.key === "=" ? W(0.8) : k.key === "-" ? W(1.25) : k.key.toLowerCase() === "f" ? (b = { ...C }, G()) : k.key.startsWith("Arrow") && (k.preventDefault(), b.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[k.key] || 0) * b.w, b.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[k.key] || 0) * b.h, G());
  });
  async function oe({ resetEditor: k = !1 } = {}) {
    if (E) return;
    E = !0, s.invalidate(), H.setEnabled(!1), r = null, a = null, l = "", g(), D("generate").disabled = !0, t.readOnly = !0, D("file").disabled = !0, D("libraries").disabled = !0;
    for (const Q of ge.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) Q.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let L = [];
    try {
      if (x !== t.value || !f) {
        if (x && x !== t.value && (s.clearSheets(), R.clear()), w = yt(t.value, { files: S }), L = [...w.diagnostics], L.some((V) => V.severity === "error"))
          throw f = null, Error("Fix the parser errors below before generating.");
        f = $e(w), x && x !== t.value ? (v = "", T = "", history.replaceState(null, "", location.pathname + location.search)) : Z(), x = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (L = [...w.diagnostics], I(L), L.some((V) => V.severity === "error")) throw Error("Fix the parser errors below before generating.");
      m = Ve(f, { focus: v });
      for (const V of m.interfaceAliases) L.push({ severity: "info", message: `Instance boundary: ${V.ports.join(" = ")} share parent node ${V.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const Q = Qe(m);
      p().conventional && L.push(...m.layout.diagnostics);
      const c = await Ye(Q, p()), o = new DOMParser().parseFromString(c.svg, "image/svg+xml");
      if (o.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const _ = o.documentElement, N = _.querySelector("#spice-layout-report");
      if (N) {
        m.layout.report = JSON.parse(N.textContent);
        const V = m.layout.report;
        if (L.push({ severity: "info", message: `Layout: compact signal flow; ${V.powerSourcesChecked} DC/ground symbols checked, ${V.powerOrderViolations} DC order preference(s) unmet. ${V.powerPass}. ${V.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), V.classicTemplateFallback && L.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), V.groundPlacement && L.push({ severity: "info", message: `Ground: ${V.groundPlacement}; ${V.straightenedGroundDrops || 0} return-path simplification(s).` }), V.explicitGroups && L.push({ severity: "info", message: `Layout comments: ${V.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), V.classicRails && L.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${V.railCount} shared voltage rails.` }), V.localClassicInstances?.length && L.push({ severity: "info", message: `${V.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), V.localClassicStages?.length && L.push({ severity: "info", message: `Classic transistor proximity active: ${V.localClassicStages.join(", ")}.` }), V.sharedClassicRails && L.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), V.mirroredTransistors?.length && L.push({ severity: "info", message: `Control-pin mirror choices: ${V.mirroredTransistors.join(", ")}.` }), V.recognizedMotifs?.length && L.push({ severity: "info", message: `Transistor structures: ${V.recognizedMotifs.map((z) => `${z.kind} (${z.members.join(", ")}; ${z.confidence})`).join("; ")}.` }), V.appliedMotifs?.length && L.push({ severity: "info", message: `Topology preferences applied to ${V.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), V.subnetFirstFallback && L.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + V.subnetFirstFallback }), V.pairCompactionFallback && L.push({ severity: "warning", message: "Pair proximity kept the original regions: " + V.pairCompactionFallback }), V.compoundPairFallback && L.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + V.compoundPairFallback }), V.pairConstraints?.length) {
          const z = V.pairConstraints.filter((ce) => ce.crossRegion && !ce.compacted).length;
          L.push({ severity: "info", message: `${V.pairConstraints.length - z} adjacent transistor pair(s); ${z} cross-region mirror row constraint(s).` });
        }
        V.netShortcuts && L.push({ severity: "info", message: `${V.netShortcuts} safe straight net shortcut(s); ${V.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), V.sharedRailFallback && L.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${V.sharedRailFallback}.` });
        for (const z of V.localClassicFallbacks || []) z.stage && L.push({ severity: "info", message: `Classic stage ${z.stage} uses automatic layout: ${z.reason || "No unobstructed local template"}.` });
        V.geometricConnectivityVerified && L.push({ severity: "info", message: `Net geometry verified; ${V.cyclesRemoved} same-net loop(s) and ${V.leavesRemoved} unused wire branch(es) removed.` }), I(L);
      }
      if (_.localName !== "svg" || _.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const X = Number(_.getAttribute("width")), J = Number(_.getAttribute("height")), Y = JSON.parse(_.getAttribute("data-label-bounds") || "null");
      C = { x: Math.min(-20, (Y?.x ?? 0) - 20), y: Math.min(-20, (Y?.y ?? 0) - 20) }, C.w = Math.max(X, Y?.right || 0) + 20 - C.x, C.h = Math.max(J, Y?.bottom || 0) + 20 - C.y, b = { ...C }, _.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`), _.setAttribute("width", String(C.w)), _.setAttribute("height", String(C.h)), _.setAttribute("role", "img"), _.setAttribute("aria-label", m.title || "SPICE schematic"), _.setAttribute("style", "background:white");
      for (const V of m.components) {
        const z = o.getElementById("cell_" + V.name);
        if (!z) throw Error("Renderer omitted component " + V.name);
        z.setAttribute("data-component", V.name), V.kind === "X" && (z.setAttribute("data-instance", V.instanceId), z.setAttribute("role", "button"), z.setAttribute("tabindex", "0"), z.setAttribute("aria-label", "Open " + V.name));
        const ce = o.createElementNS(_.namespaceURI, "title");
        ce.textContent = V.raw + `
Resolved: ` + V.value + `
` + Object.entries(V.terminals).map(([ve, Ee]) => ve + ": " + Ee).join(", "), z.prepend(ce);
      }
      for (const V of Object.values(m.nodes))
        for (const z of _.querySelectorAll(".net_" + V.bit)) {
          z.setAttribute("data-net", V.name);
          const ce = o.createElementNS(_.namespaceURI, "title");
          ce.textContent = "Node " + V.displayName, z.append(ce);
        }
      const ae = m.components.filter((V) => V.kind === "K").map((V) => ({ name: V.name, inductors: V.coupledInductors, value: V.value }));
      if (ae.length) {
        const V = o.createElementNS(_.namespaceURI, "metadata");
        V.setAttribute("id", "spice-magnetic-couplings"), V.textContent = JSON.stringify(ae), _.append(V);
        for (const z of ae) for (const ce of z.inductors) {
          const ve = o.getElementById("cell_" + ce);
          if (!ve) continue;
          const Ee = o.createElementNS(_.namespaceURI, "circle"), _e = [...ve.children].find((ze) => ze.getAttribute("s:pid") === "A"), Be = _e?.getAttribute("s:position"), ft = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [ze, Ht] of Object.entries({ cx: Number(_e?.getAttribute("s:x")) + ft[0], cy: Number(_e?.getAttribute("s:y")) + ft[1], r: 3, fill: p().color, stroke: "none", "data-coupling": z.name })) Ee.setAttribute(ze, String(Ht));
          const pt = o.createElementNS(_.namespaceURI, "title");
          pt.textContent = z.name + " · dotted terminal: " + z.inductors.join(", "), Ee.append(pt), ve.append(Ee);
        }
      }
      r = c.drawing, l = new XMLSerializer().serializeToString(_), D("source").value = l, e.replaceChildren(document.importNode(_, !0)), G();
      const K = L.filter((V) => V.severity === "warning").length;
      n.textContent = `${m.components.filter((V) => !V.synthetic).length} components · ${Object.keys(m.nodes).length} nodes · ${m.topology.leafCount} primitive devices verified${m.interfaceAliases.length ? " · Parent-connected ports: " + m.interfaceAliases.map((V) => V.ports.join(" = ")).join("; ") + "." : ""}${K ? " · Review " + K + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${De}.`, m.layout.report?.gridVerified && (n.textContent += ` Grid ${m.layout.report.gridSize}.`), m.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${m.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), m.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), D("json").value = JSON.stringify({ circuit: m, netlist: Q, hierarchy: w }, null, 2), H.setCircuit(m, t.value), s.mount(e.querySelector("svg"), r, m, Q, p(), { reset: k, scope: v }), $(), !k && R.has(v) ? b = { ...R.get(v) } : R.set(v, { ...b }), G(), D("selection").textContent = "Click a component to inspect its original statement and pin connections.", de();
    } catch (Q) {
      if (e.replaceChildren(), l = "", D("source").value = "", D("json").value = "", D("nets").replaceChildren(), D("selection").textContent = "", n.textContent = Q.message, !f)
        D("hierarchy-panel").hidden = !0, D("selection-actions").hidden = !0, D("breadcrumbs").replaceChildren();
      else if (!f.contexts[v]) {
        const c = document.createElement("button");
        c.type = "button", c.textContent = "Return to Top", c.onclick = () => j(""), D("breadcrumbs").replaceChildren(c);
      }
      H.setCircuit(null, t.value), Q.diagnostics && (L = Q.diagnostics), L.some((c) => c.severity === "error") || L.push({ severity: "error", line: 0, message: Q.message }), I(L);
    } finally {
      E = !1, D("generate").disabled = !1, t.readOnly = !1, D("file").disabled = !1, D("libraries").disabled = !1;
      for (const Q of ge.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) Q.disabled = !1;
      f && f.contexts[v] && de(), H.setEnabled(!!l), e.setAttribute("aria-busy", "false"), g(), M && (M = !1, Z(), queueMicrotask(oe));
    }
  }
  D("generate").onclick = () => oe({ resetEditor: !0 });
  for (const k of ge.querySelectorAll("[data-example]")) k.onclick = () => {
    const L = Me[k.dataset.example];
    t.value = L.source, y(), ne(L), oe();
  };
  D("file").onchange = async (k) => {
    const L = k.target.files[0];
    if (L) {
      if (E || U) {
        k.target.value = "";
        return;
      }
      try {
        const Q = /\.(spiceproj|json)$/i.test(L.name);
        if (L.size > (Q ? jt : 2e6)) throw Error(Q ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        Q ? await me(await L.text()) : (t.value = await vt(L), y(), await oe());
      } catch (Q) {
        n.textContent = "File could not be opened: " + Q.message;
      } finally {
        k.target.value = "", g();
      }
    }
  };
  async function me(k) {
    U = !0, g();
    const L = ge.inert;
    ge.inert = !0;
    try {
      const Q = Vt(k), c = yt(Q.source, { files: Q.libraries });
      if (c.diagnostics.some((_) => _.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const o = $e(c);
      if (!o.contexts[Q.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const _ of Q.sheets) {
        if (!o.contexts[_.scope]) throw Error("Unknown saved sheet: " + _.scope);
        const N = Ve(o, { focus: _.scope });
        if (N.topology.signature !== _.topology) throw Error("Saved topology differs from the netlist: " + (_.scope || "Top"));
        const X = new Map(N.components.filter((K) => K.kind !== "K").map((K) => [K.name, K]));
        for (const K of _.snapshot.components) {
          if (K.decoration) continue;
          const V = X.get(K.id);
          if (!V || K.ports.length !== Object.keys(V.terminals).length || K.ports.some((z) => N.nodes[V.terminals[z.pin]]?.bit !== z.bit)) throw Error("Saved pin connectivity differs from the netlist: " + K.id);
          X.delete(K.id);
        }
        if (X.size) throw Error("Saved sheet omits components.");
        n.textContent = "Checking saved sheet " + (_.scope || "Top") + "…";
        const J = Qe(N), Y = await Ye(J, _.settings), ae = new DOMParser().parseFromString(Y.svg, "image/svg+xml").documentElement;
        for (const K of Object.values(N.nodes)) for (const V of ae.querySelectorAll(".net_" + K.bit)) V.setAttribute("data-net", K.name);
        Ft(Gt(ae, Y.drawing, N, J), _.snapshot, _.settings.gridSize);
      }
      Q.sheets.some((_) => _.scope === Q.focus && JSON.stringify(_.settings) === JSON.stringify(Q.settings)) || (n.textContent = "Checking current sheet…", await Ye(Qe(Ve(o, { focus: Q.focus })), Q.settings)), s.invalidate(), s.restoreSheets(Q.sheets), R = new Map(Q.sheets.filter((_) => _.view).map((_) => [_.scope, _.view])), R.set(Q.focus, Q.view), t.value = Q.source, S = Q.libraries, f = o, w = c, x = Q.source, v = Q.focus, T = "";
      for (const _ of ["font", "size"]) D(_).value = _ === "font" ? Q.settings.font : Q.settings.fontSize;
      for (const [_, N] of Object.entries({ detailed: Q.settings.detailed, conventional: Q.settings.conventional, grid: !!Q.settings.gridSize, "show-grid": Q.showGrid, interactive: Q.interactive, flywire: Q.flywire })) D(_).checked = N;
      D("grid-size").value = Q.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (v ? "#" + new URLSearchParams({ instance: v }) : "")), H.restore(Q.colors), ne(Object.values(Me).find((_) => _.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(S)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      D("library-status").textContent = Object.keys(S).length + " project library file(s) loaded", await oe(), l && (n.textContent += " Project restored.");
    } finally {
      ge.inert = L, U = !1, g();
    }
  }
  D("libraries").onchange = async (k) => {
    try {
      for (const L of k.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        S[L.webkitRelativePath || L.name] = await vt(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(S));
      } catch {
      }
      s.invalidate(), s.clearSheets(), R.clear(), f = null, x = "", D("library-status").textContent = Object.keys(S).length + " library file(s) loaded", oe();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      k.target.value = "";
    }
  }, D("library-status").textContent = Object.keys(S).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const ue = D("download-dialog");
  ge.addEventListener("spice:workspacechange", () => {
    ue.open && ue.close();
  }), D("open-download").onclick = () => {
    g(), ue.showModal();
  }, D("close-download").onclick = () => ue.close(), ue.addEventListener("click", (k) => {
    if (k.target !== ue) return;
    const L = ue.getBoundingClientRect();
    (k.clientX < L.left || k.clientX > L.right || k.clientY < L.top || k.clientY > L.bottom) && ue.close();
  }), document.addEventListener("keydown", (k) => {
    ue.open && !(k.altKey && k.key === "Escape") && (k.stopImmediatePropagation(), k.key === "Escape" && (k.preventDefault(), ue.close()));
  }, { capture: !0 }), D("upload").onclick = () => D("file").click(), D("download-project").onclick = () => {
    try {
      const k = s.snapshotSheets().filter((o) => f?.contexts[o.scope] && Ve(f, { focus: o.scope }).topology.signature === o.topology).map((o) => ({ ...o, ...R.has(o.scope) ? { view: R.get(o.scope) } : {} })), L = Yn({ source: t.value, libraries: S, settings: p(), displayGridStep: Number(D("grid-size").value), showGrid: D("show-grid").checked, interactive: D("interactive").checked, flywire: D("flywire").checked, focus: v, view: { ...b }, colors: H.snapshot(), sheets: k });
      ue.close();
      const Q = URL.createObjectURL(new Blob([L], { type: "application/json;charset=utf-8" })), c = document.createElement("a");
      c.href = Q, c.download = "spice-schematic.spiceproj", c.click(), setTimeout(() => URL.revokeObjectURL(Q), 1e3), n.textContent = "Project saved. Upload the .spiceproj file to resume editing.";
    } catch (k) {
      n.textContent = "Project save failed: " + k.message;
    }
  }, D("download").onclick = () => {
    ue.close();
    const k = URL.createObjectURL(new Blob([l], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = k, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(k), 1e3);
  };
  async function Ue(k) {
    const L = r;
    if (!(!L || E || u)) {
      u = !0, g(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: Q } = await import("./asc-export-W0r-5blq.js");
        if (r !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        a ||= Q({ tree: f, circuit: m, drawing: L, source: t.value, libraries: S });
        const c = k ? a.zip : a.ascBytes, o = URL.createObjectURL(new Blob([c], { type: k ? "application/zip" : "application/octet-stream" })), _ = document.createElement("a");
        _.href = o, _.download = k ? "spice-schematic-asc.zip" : "spice-schematic.asc", _.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), n.textContent = "ASC connections verified · " + a.manifest.audit.symbols + " symbols. " + (k ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), a.manifest.warnings.length && (n.textContent += " " + a.manifest.warnings.join(" "));
      } catch (Q) {
        n.textContent = "ASC export failed: " + Q.message;
        const c = document.createElement("li");
        c.className = "error", c.textContent = n.textContent, i.append(c);
      } finally {
        u = !1, g();
      }
    }
  }
  D("download-asc").onclick = () => {
    ue.close(), Ue(!1);
  }, D("download-asc-bundle").onclick = () => {
    ue.close(), Ue(!0);
  }, D("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(l), n.textContent = "SVG source copied to clipboard.";
    } catch {
      D("source-details").open = !0, D("source").focus(), D("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, oe();
}
export {
  it as b,
  $e as e,
  Oe as l,
  rt as n,
  yn as p
};
