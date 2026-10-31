const Jt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, en = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, tn = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, nn = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, on = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, rn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, sn = { 1: "a", 2: "b", 7: "Q", 8: "com" }, an = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, ln = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, cn = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, dn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, un = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, fn = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, pn = {
  AND: Jt,
  BUF: en,
  COUNTER: tn,
  DFLOP: nn,
  SCHMITT: on,
  OR: rn,
  PHASEDET: sn,
  SRFLOP: an,
  XOR: ln,
  MODULATOR: cn,
  OTA: dn,
  SAMPLEHOLD: un,
  VARISTOR: fn
}, hn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Te = (n) => n.toLowerCase(), gt = (n) => n === void 0 || n.includes("=") || /^(?:off|on)$/i.test(n), mn = (n) => n.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function gn(n, e) {
  const o = (N) => e[Te(N || "")] || Object.entries(e).find(([E]) => E.startsWith(Te(N || "") + "."))?.[1], r = n[0][0].toUpperCase();
  let s = [], d = [], l = "", a = "", c = [], u = [], f = 0, v = "", p = "", g = "", m = !0;
  if ("RLC".includes(r))
    s = ["A", "B"], a = Te(r) + "_v";
  else if ("DVIB".includes(r))
    s = ["+", "-"], a = r === "D" ? "d_v" : r === "B" ? "spice_b" : Te(r);
  else if (r === "Q") {
    s = ["C", "B", "E"], !o(n[4]) && (o(n[5]) || !gt(n[5]) && !/^[+\-\d.{'"]/.test(n[5])) && s.push("S"), l = n[s.length + 1] || "";
    const N = o(l)?.type;
    m = ["NPN", "PNP"].includes(N), a = m ? (s.length === 3 ? "q_" : "spice_q4_") + Te(N) : "spice_q" + s.length;
  } else if (r === "M") {
    const N = o(n[4]), E = o(n[5]), w = N?.type === "VDMOS" || !E && (!n[5] || gt(n[5]));
    s = w ? ["D", "G", "S"] : ["D", "G", "S", "B"], l = n[s.length + 1] || "";
    const C = o(l), A = C?.type;
    if (w && C && A !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!w && A === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    m = ["NMOS", "PMOS", "VDMOS"].includes(A);
    let S = null, I = C;
    const O = /* @__PURE__ */ new Set();
    for (; I && !O.has(I.name) && (O.add(I.name), S = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(I.raw), !S); )
      I = o(I.baseModel);
    const P = A === "PMOS" || A === "VDMOS" && S && (S[1] === void 0 || Number(S[1]) >= 0.5);
    a = m ? "spice_" + (P ? "pmos" : "nmos") + (w ? "3" : "") : "spice_m";
  } else if ("JZ".includes(r)) {
    l = n[4] || "";
    const N = o(l)?.type, E = r === "Z" && ["NIGBT", "PIGBT"].includes(N);
    s = E ? ["C", "G", "E"] : ["D", "G", "S"], m = r === "J" ? ["NJF", "PJF"].includes(N) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(N), a = "spice_" + (E ? "igbt" : r === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(N || "") ? "p" : "n");
  } else if ("EFGH".includes(r)) {
    s = ["+", "-"], a = "spice_" + Te(r);
    let N = 3, E = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(n[N] || "");
    if (/^poly$/i.test(n[N] || "") && (E = /^\(\s*(\d+)\s*\)$/.exec(n[++N] || ""), !E))
      throw Error("POLY requires a dimension.");
    if (E) {
      const w = Number(E[1]);
      if (w > 128) throw Error("POLY supports at most 128 controlling variables.");
      let C = N + 1, A = [];
      const S = "EG".includes(r), I = w * (S ? 2 : 1);
      for (; A.length < I && C < n.length; ) A.push(...mn(n[C++]));
      if (A.length !== I || C >= n.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (S) {
        for (let O = 0; O < w; O++) s.push("C" + (O + 1) + "+", "C" + (O + 1) + "-");
        d = [n[1], n[2], ...A];
      } else c = A;
      f = C, v = "POLY(" + w + ") " + (S ? "" : A.join(" ") + " "), p = "POLY", S && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(n[3] || "") || n[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(r) ? (s.push("C+", "C-"), p = /\blaplace\s*=/i.test(n.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(n.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [n[3]], f = 4, v = n[3] + " ");
    g = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[r] + (p ? " · " + p : "");
  } else if (r === "S")
    s = ["A", "B", "C+", "C-"], l = n[5] || "", a = "spice_device", g = "Voltage switch";
  else if (r === "W")
    s = ["A", "B"], c = [n[3]], l = n[4] || "", f = 3, a = "spice_device", g = "Current switch";
  else if ("TO".includes(r))
    s = ["L+", "L-", "R+", "R-"], r === "O" && (l = n[5] || ""), a = "spice_device", g = r === "T" ? "Transmission line" : "Lossy line";
  else if (r === "U")
    s = ["N1", "N2", "COM"], l = n[4] || "", a = "spice_device", g = "Distributed RC";
  else if (r === "A")
    s = Array.from({ length: 8 }, (N, E) => "P" + (E + 1)), a = "spice_device", g = n[9] || "A function";
  else if (r === "K") {
    if (n.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (u = n.slice(1, -1), u.some((N) => !/^L/i.test(N.split(":").at(-1)))) throw Error("K references must name inductors.");
    f = n.length - 1, a = "spice_coupling", g = "Magnetic coupling", v = u.join(" ") + " · k=";
  } else if (r === "@")
    s = ["IN", "OUT"], a = "spice_device", g = "FRA";
  else if (r === "&")
    s = ["O+", "O-", "I+", "I-"], a = "spice_device", g = "FRA probe";
  else if (r === "Ö")
    s = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", g = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + r);
  if (f || (f = s.length + 1), d.length || (d = n.slice(1, s.length + 1)), d.length !== s.length) throw Error("Incomplete terminal list: expected " + s.length + " nodes.");
  if (n.length <= f && !["&", "Ö"].includes(r)) throw Error("Missing value, model, or expression after " + s.length + " terminals.");
  if (d.some((N) => /[=()]/.test(N) && !/^\{[\s\S]*\}$/.test(N))) throw Error("Invalid terminal token; check terminal count.");
  if (r === "B" && !/\b[VIPR]\s*=/i.test(n.slice(f).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (r === "B" && /^R\s*=/i.test(n.slice(f).join(" ")) && (a = "spice_br"), r === "D" && (l = n[3] || ""), r === "@") {
    const N = n.slice(f).join(" ");
    for (const E of N.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      s.push(E[1].toUpperCase()), d.push(E[2]);
  }
  if (r === "A" && !n[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((N) => !N)) throw Error("Missing controlling voltage source.");
  const _ = s.map((N, E) => r === "A" && pn[(n[9] || "").toUpperCase()]?.[String(E + 1)] || N);
  return { kind: r, pins: s, nodeTokens: d, pinLabels: _, model: l, type: a, controlSource: c[0] || "", controlSources: c, coupledInductors: u, value: v + n.slice(f).join(" "), sourceMode: p, symbol: g, polarityKnown: m };
}
const bn = hn, yn = new Set(bn.split(" ")), Ye = () => /* @__PURE__ */ Object.create(null), ye = (n) => n.toLowerCase();
function He(n) {
  const e = [], o = [];
  let r = "", s = 0, d = "";
  for (let l = 0; l < n.length; l++) {
    const a = n[l];
    if (d) {
      r += a, a === d && n[l - 1] !== "\\" && (d = "");
      continue;
    }
    if (a === '"' || a === "'") {
      d = a, r += a;
      continue;
    }
    if (!s && (a === ";" || a === "$" && (!l || /\s/.test(n[l - 1])))) break;
    if ("({".includes(a) && (o.push(a), s++), ")}".includes(a) && (s--, o.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !s ? (r && e.push(r), r = "") : r += a;
  }
  if (s || d) throw Error("Unclosed expression or quoted string.");
  return r && e.push(r), e;
}
function wn(n, e = {}) {
  const o = [], r = [], s = [], d = Object.assign(Ye(), e.models), l = Ye(), a = (E, w, C) => o.push({ severity: E, line: w, message: C });
  if (typeof n != "string") throw TypeError("Netlist must be a string.");
  if (n.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  n.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((E, w) => {
    const C = E.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? c.length ? c.at(-1).text += " " + C.slice(1).trim() : a("error", w + 1, "Continuation has no preceding statement.") : c.push({ line: w + 1, text: C }));
  });
  for (const E of c) {
    try {
      E.tokens = He(E.text);
    } catch (C) {
      a("error", E.line, C.message), E.tokens = [];
    }
    const w = E.tokens;
    if (/^\.model$/i.test(w[0] || ""))
      if (w.length < 3) a("error", E.line, ".model requires a name and device type.");
      else {
        const C = /^ako:(.+)$/i.exec(w[2]), A = C && w[3] && !w[3].startsWith("(") ? w[3].split("(")[0].toUpperCase() : "";
        d[ye(w[1])] = { name: w[1], type: C ? A : w[2].split("(")[0].toUpperCase(), baseModel: C?.[1] || "", raw: E.text };
      }
  }
  const u = /* @__PURE__ */ new Set();
  function f(E) {
    const w = d[ye(E)];
    if (!w) return "";
    if (w.type) return w.type;
    if (u.has(ye(E))) throw Error("Circular AKO model inheritance: " + E);
    return u.add(ye(E)), w.type = f(w.baseModel), u.delete(ye(E)), w.type;
  }
  for (const E of Object.values(d)) if (E.baseModel && !E.type)
    try {
      f(E.name);
    } catch (w) {
      a("error", 0, w.message);
    }
  let v = "", p = 0, g = !1, m = !1;
  const _ = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: E, text: w, tokens: C } of c) {
    if (!C.length) continue;
    const A = ye(C[0]);
    if (m) {
      a("warning", E, "Statement after .end is not rendered: " + w);
      continue;
    }
    if (A === ".control") {
      g = !0, a("warning", E, ".control script retained but not executed or rendered.");
      continue;
    }
    if (A === ".endc") {
      g = !1;
      continue;
    }
    if (g) continue;
    if (A === ".subckt") {
      p++, a("error", E, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (A === ".ends") {
      p ? p-- : a("error", E, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (A === ".end") {
      m = !0;
      continue;
    }
    if (A.startsWith(".")) {
      r.push({ line: E, text: w }), A === ".title" ? v = C.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(A) ? a("error", E, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(A) ? a("error", E, "Topology-changing directive is unsupported: " + w) : N.has(A) || a("warning", E, "Directive retained but not resolved: " + w);
      continue;
    }
    const S = C[0][0].toUpperCase();
    if (!yn.has(S)) {
      E === 1 && !/\d/.test(C[0]) && C.length > 1 && S !== "X" ? (v = w, a("warning", E, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", E, `Unsupported ${S} device was not rendered: ${w}`);
      continue;
    }
    const I = S === "M" || S === "Q" ? 5 : 4;
    if (E === 1 && !/\d/.test(C[0]) && (C.length < I || S === "T" && !/\b(?:zo|z0)\s*=/i.test(w))) {
      v = w, a("info", E, "SPICE title: " + w);
      continue;
    }
    try {
      if (_.has(A)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const O = gn(C, d), { pins: P, nodeTokens: x, ...y } = O;
      O.polarityKnown || a("warning", E, `${C[0]}: model polarity unknown; explicit ${P.join("/")} terminals retained.`);
      const L = Ye();
      P.forEach((G, q) => {
        const X = ye(x[q]);
        l[X] || (l[X] = { name: X, displayName: C[q + 1], bit: Object.keys(l).length + 2, terminals: [] }), l[X].terminals.push({ component: C[0], pin: G }), L[G] = X;
      }), s.push({ ...y, name: C[0], terminals: L, line: E, raw: w }), _.add(A);
    } catch (O) {
      a("error", E, `${C[0]}: ${O.message} Statement: ${w}`);
    }
  }
  p && a("error", 0, "Unclosed .subckt definition."), g && a("error", 0, "Unclosed .control block."), s.length || a("error", 0, "No supported components to render."), s.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const E of s) {
    for (const w of E.controlSources || []) !w.includes(":") && !s.some((C) => ye(C.name) === ye(w) && C.kind === "V") && a("error", E.line, `${E.name}: controlling voltage source ${w} was not found.`);
    for (const w of E.coupledInductors || []) !w.includes(":") && !s.some((C) => ye(C.name) === ye(w) && C.kind === "L") && a("error", E.line, `${E.name}: coupled inductor ${w} was not found.`);
    (E.kind === "B" || E.type === "spice_b") && a("info", E.line, `${E.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: v, components: s, nodes: l, models: d, directives: r, diagnostics: o };
}
const Se = (n) => n.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), bt = (n) => Se(n).split("/").at(-1);
function xn(n, { files: e = {}, filename: o = "input.cir" } = {}) {
  const r = new Map(e instanceof Map ? e : Object.entries(e)), s = [], d = [], l = [];
  let a = 0;
  const c = (f, v) => {
    const p = Se(v).split("/").slice(0, -1).concat(Se(f)).join("/"), g = [...r].filter(([_]) => Se(_) === Se(f) || Se(_) === p);
    if (g.length === 1) return g[0];
    const m = [...r].filter(([_]) => bt(_) === bt(f));
    if (m.length !== 1) throw Error(m.length ? "Ambiguous library filename: " + f : "Missing library " + f + ". Add this file using Library files.");
    return m[0];
  };
  function u(f, v, p = "", g = []) {
    const m = Se(v) + ":" + p.toLowerCase();
    if (g.includes(m)) throw Error("Circular library include: " + [...g, m].join(" → "));
    if (g.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const _ = [], N = /^\s*\.endl\b/im.test(f);
    let E = !p;
    const w = (A, S) => {
      if (a += A.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      l.push(A), d.push({ file: v, line: S + 1 });
    };
    if (f.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((A, S) => {
      const I = A.trim();
      if (/^\.lib\b/i.test(I) && N) {
        const O = He(I);
        if (O.length === 2 && !/[.\\/]/.test(O[1])) {
          _.push(O[1].toLowerCase()), O[1].toLowerCase() === p.toLowerCase() && (E = !0), w("* Library section " + O[1], S);
          return;
        }
      }
      if (/^\.endl\b/i.test(I)) {
        _.pop(), w("* End library section", S);
        return;
      }
      if (p && _.length && !_.includes(p.toLowerCase())) {
        w("* Unselected library section", S);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(I))
        try {
          const O = He(I);
          if (!O[1]) throw Error("Include requires a filename.");
          const [P, x] = c(O[1], v);
          w("* Included " + P, S), u(x, P, O[2] || "", [...g, m]);
        } catch (O) {
          s.push({ severity: "error", line: S + 1, source: v, message: O.message }), w("* Unresolved include", S);
        }
      else w(A, S);
    }), !E) throw Error("Library section " + p + " not found in " + v);
  }
  try {
    u(n, o);
  } catch (f) {
    s.push({ severity: "error", line: 0, source: o, message: f.message });
  }
  return { source: l.join(`
`), origins: d, diagnostics: s };
}
function vn(n) {
  const e = [], o = /* @__PURE__ */ new Map(), r = [0], s = [];
  n.split(/\r?\n/).forEach((a, c) => {
    const u = a.trim();
    /^\.subckt\b/i.test(u) && (r.push(c + 1), o.set(c + 1, [])), r.at(-1) ? o.get(r.at(-1)).push({ raw: a, line: c + 1 }) : e[c] = a, /^\.ends\b/i.test(u) && r.length > 1 && r.pop();
  });
  const d = yt(Array.from({ length: n.split(/\r?\n/).length }, (a, c) => e[c] || "").join(`
`));
  s.push(...d.diagnostics);
  const l = /* @__PURE__ */ new Map();
  for (const [a, c] of o) {
    const u = yt(c.map((f) => f.raw).join(`
`));
    l.set(a, u.layout), s.push(...u.diagnostics.map((f) => ({ ...f, line: c[f.line - 1]?.line || a })));
  }
  return { layout: d.layout, scopes: l, diagnostics: s };
}
function yt(n) {
  const e = [], o = [];
  let r = !1, s = !1, d = 0;
  if (n.split(/\r?\n/).forEach((w, C) => {
    const A = w.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(A)) {
      (s || r) && e.push({ severity: "error", line: C + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(A) || e.push({ severity: "error", line: C + 1, message: "Expected @layout begin v1." }), s = !0, r = !0, d = C + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(A)) {
      r || e.push({ severity: "error", line: C + 1, message: "Unexpected @layout end." }), r = !1;
      return;
    }
    r && (A.startsWith("*") ? o.push(A.slice(1).trim()) : e.push({ severity: "error", line: C + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), r && e.push({ severity: "error", line: d, message: "Unclosed @layout block." }), !s) return { layout: null, diagnostics: e };
  const l = o.join(" "), a = l.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], u = [], f = [], v = [];
  let p = 0, g = 0, m = 10;
  const _ = () => a[p++], N = () => {
    const w = _();
    if (!w || !/^[A-Za-z_@][\w./%:@-]*$/.test(w)) throw Error("Expected layout identifier, got " + w);
    return w;
  };
  function E(w) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const C = w ? N() : "@row" + g++, A = _();
    if (!["row", "column", "classic"].includes(A)) throw Error("Expected row, column or classic.");
    if (_() !== "{") throw Error("Expected { after " + A);
    const S = { id: C, direction: A, members: [] };
    for (c.push(S); p < a.length && a[p] !== "}"; )
      a[p] === "group" ? (_(), S.members.push(E(!0))) : ["row", "column"].includes(a[p]) ? S.members.push(E(!1)) : S.members.push(N());
    if (_() !== "}") throw Error("Unclosed group " + C);
    if (!S.members.length) throw Error("Empty layout group " + C);
    return C;
  }
  try {
    for (; p < a.length; )
      if (a[p] === "group")
        _(), E(!0);
      else if (["row", "column"].includes(a[p])) E(!1);
      else if (a[p] === "face") {
        _();
        const x = N(), y = _();
        if (!["left", "right"].includes(y)) throw Error("Expected face left or right.");
        if (v.some((L) => L.device.toLowerCase() === x.toLowerCase())) throw Error("Duplicate face device.");
        v.push({ device: x, side: y });
      } else if (a[p] === "pair") {
        _();
        const x = _();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(x)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (_() !== "{") throw Error("Expected { after pair kind.");
        const y = [];
        for (; p < a.length && a[p] !== "}"; ) y.push(N());
        if (_() !== "}" || !y.length) throw Error("Empty or unclosed pair.");
        if (f.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        f.push({ kind: x, members: y });
      } else if (a[p] === "priority-cap") {
        if (_(), m = Number(_()), !Number.isInteger(m) || m < 3 || m > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (_() === "place") {
        const x = N(), y = _(), L = N();
        if (!["left-of", "above"].includes(y)) throw Error("Expected left-of or above.");
        u.push({ a: x, relation: y, b: L });
      } else throw Error("Unknown layout instruction near " + a[p - 1]);
    const w = /* @__PURE__ */ new Set();
    for (const x of c) {
      const y = x.id.toLowerCase();
      if (w.has(y)) throw Error("Duplicate layout group " + x.id);
      w.add(y);
    }
    const C = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set(), S = new Map(c.map((x) => [x.id.toLowerCase(), x])), I = (x) => {
      if (C.has(x)) throw Error("Circular layout group " + x);
      if (!A.has(x)) {
        C.add(x);
        for (const y of S.get(x).members) S.has(y.toLowerCase()) && I(y.toLowerCase());
        C.delete(x), A.add(x);
      }
    };
    for (const x of S.keys()) I(x);
    const O = /* @__PURE__ */ new Map();
    for (const x of u) {
      if (x.a.toLowerCase() === x.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      O.has(x.a.toLowerCase()) || O.set(x.a.toLowerCase(), []), O.get(x.a.toLowerCase()).push(x.b.toLowerCase());
    }
    C.clear(), A.clear();
    const P = (x) => {
      if (C.has(x)) throw Error("Circular place constraints.");
      if (!A.has(x)) {
        C.add(x);
        for (const y of O.get(x) || []) P(y);
        C.delete(x), A.add(x);
      }
    };
    for (const x of O.keys()) P(x);
  } catch (w) {
    e.push({ severity: "error", line: d, message: "Layout description: " + w.message });
  }
  return { layout: { version: 1, priorityCap: m, groups: c, relations: u, pairs: f, faces: v }, diagnostics: e };
}
function En(n, e) {
  const o = e.focus ? n.ir.scopes[n.contexts[e.focus].scopeId].layoutDescription : null;
  let r = e.focus ? o : n.ir.layoutDescription;
  if (!r) return null;
  if (o) {
    const g = new Set(o.groups.map((_) => _.id.toLowerCase())), m = (_) => g.has(_.toLowerCase()) ? _ : e.components.find((E) => E.synthetic && E.value.toLowerCase() === _.toLowerCase())?.name || e.focus + "/" + _;
    r = { ...o, groups: o.groups.map((_) => ({ ..._, members: _.members.map(m) })), relations: o.relations.map((_) => ({ ..._, a: m(_.a), b: m(_.b) })), faces: (o.faces || []).map((_) => ({ ..._, device: m(_.device) })), pairs: (o.pairs || []).map((_) => ({ ..._, members: _.members.map(m) })) };
  }
  const s = new Map(r.groups.map((g) => [g.id.toLowerCase(), g])), d = Object.values(n.contexts).flatMap((g) => g.devices.map((m) => m.name)), l = new Set([...Object.keys(n.contexts), ...d, ...e.components.map((g) => g.name)].map((g) => g.toLowerCase()));
  for (const g of s.values()) if (l.has((o ? e.focus + "/" + g.id : g.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + g.id);
  for (const g of s.values()) for (const m of g.members) if (!s.has(m.toLowerCase()) && !l.has(m.toLowerCase())) throw Error("Unknown @layout instance/device: " + m);
  for (const g of r.relations) for (const m of [g.a, g.b]) if (!s.has(m.toLowerCase()) && !l.has(m.toLowerCase())) throw Error("Unknown @layout place target: " + m);
  const a = (r.pairs || []).map((g) => ({ ...g, members: g.members.map((m) => {
    const _ = e.components.find((N) => N.name.toLowerCase() === m.toLowerCase());
    if (!_ || _.synthetic || _.block) throw Error("Unknown or non-visible @layout pair device: " + m);
    return _.name;
  }) })), c = (r.faces || []).map((g) => {
    const m = e.components.find((_) => _.name.toLowerCase() === g.device.toLowerCase());
    if (!m || !["Q", "M", "J", "Z"].includes(m.kind)) throw Error("Unknown or unsupported @layout face device: " + g.device);
    return { ...g, device: m.name };
  }), u = /* @__PURE__ */ new Map(), f = [], v = new Set(Object.keys(n.contexts).map((g) => g.toLowerCase()));
  for (const g of r.groups) {
    const m = [];
    for (const _ of g.members) {
      if (s.has(_.toLowerCase())) {
        m.push({ group: _ });
        continue;
      }
      for (const N of e.components) if (N.name.toLowerCase() === _.toLowerCase() || N.name.toLowerCase().startsWith(_.toLowerCase() + "/")) {
        if (u.has(N.name)) throw Error("Overlapping @layout membership: " + N.name);
        u.set(N.name, g.id), m.push({ cell: N.name, ...v.has(_.toLowerCase()) ? { instance: _ } : {} });
      }
    }
    f.push({ id: g.id, direction: g.direction, members: m });
  }
  const p = /* @__PURE__ */ new Set();
  for (const g of f) for (const m of g.members) if (m.group) {
    const _ = m.group.toLowerCase();
    if (p.has(_)) throw Error("Layout group has multiple parents: " + m.group);
    p.add(_);
  }
  return { version: 1, priorityCap: r.priorityCap, groups: f, relations: r.relations, pairs: a, faces: c };
}
const ke = () => /* @__PURE__ */ Object.create(null), ge = (n) => n.toLowerCase();
function Pt(n) {
  const e = ke();
  for (let o = 0; o < n.length; o++) {
    const r = n[o];
    if (/^params?:$/i.test(r)) continue;
    const s = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(r);
    if (!s) throw Error("Expected named parameter assignment, got: " + r);
    const d = ge(s[1]);
    let l = s[2];
    if (l === void 0) {
      const a = /^=([\s\S]*)$/.exec(n[++o] || "");
      if (!a) throw Error("Expected = after parameter " + d);
      l = a[1];
    }
    if (l || (l = n[++o]), !l || /^params?:$/i.test(l)) throw Error("Missing value for parameter " + d);
    if (Object.hasOwn(e, d)) throw Error("Duplicate parameter: " + d);
    e[d] = l;
  }
  return e;
}
function wt(n) {
  const e = n.findIndex((o, r) => /^params?:$/i.test(o) || o.includes("=") || n[r + 1] === "=");
  return e < 0 ? [n, ke()] : [n.slice(0, e), Pt(n.slice(e))];
}
function xt(n, e = {}) {
  if (typeof n != "string") throw TypeError("Netlist must be a string.");
  if (n.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const o = xn(n, e);
  n = o.source;
  const r = vn(n), s = [...o.diagnostics, ...r.diagnostics], d = ke(), l = /* @__PURE__ */ new Set(["0"]), a = (w, C, A) => s.push({ severity: w, line: C, message: A }), c = (w, C, A, S = [], I = ke(), O = 0) => {
    const P = { id: w, name: C, parent: A, ports: S, defaults: I, parameters: ke(), definitions: ke(), devices: [], instances: [], directives: [], line: O, statements: [], layoutDescription: r.scopes.get(O) || null };
    return d[w] = P, P;
  }, u = c("root", "Top", null), f = [u], v = [];
  let p = !1, g = !1;
  n.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, C) => {
    const A = w.trim();
    !A || A.startsWith("*") || (A.startsWith("+") ? v.length ? v.at(-1).text += " " + A.slice(1).trim() : a("error", C + 1, "Continuation has no preceding statement.") : v.push({ text: A, line: C + 1 }));
  });
  for (const { text: w, line: C } of v)
    try {
      const A = He(w);
      if (!A.length) continue;
      const S = ge(A[0]), I = f.at(-1);
      if (g) {
        a("warning", C, "Statement after .end is not rendered: " + w);
        continue;
      }
      if (S === ".control") {
        p = !0, a("warning", C, ".control script retained but not executed or rendered.");
        continue;
      }
      if (S === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (S === ".subckt") {
        if (A.length < 2) throw Error(".SUBCKT requires a name.");
        const [O, P] = wt(A.slice(2)), x = ge(A[1]);
        if (Object.hasOwn(I.definitions, x)) throw Error("Duplicate subcircuit definition: " + A[1]);
        const y = O.map(ge);
        if (new Set(y).size !== O.length || y.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (O.some((G) => /[{}()=]/.test(G))) throw Error("Invalid formal port.");
        if (f.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const L = I.id + "/" + encodeURIComponent(x);
        I.definitions[x] = L, f.push(c(L, A[1], I.id, O, P, C));
        continue;
      }
      if (S === ".ends") {
        if (f.length === 1) throw Error("Unmatched .ENDS.");
        if (A[1] && ge(A[1]) !== ge(I.name)) throw Error(".ENDS name does not match " + I.name);
        f.pop();
        continue;
      }
      if (S === ".end") {
        if (f.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        g = !0;
        continue;
      }
      if (S === ".param") {
        const O = Pt(A.slice(1));
        for (const [P, x] of Object.entries(O)) {
          if (Object.hasOwn(I.parameters, P)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + P);
          I.parameters[P] = x;
        }
      }
      if (S === ".global") {
        if (A.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const O of A.slice(1)) l.add(ge(O));
      }
      if (S.startsWith(".") && I.directives.push({ line: C, text: w }), S.startsWith("x")) {
        const [O, P] = wt(A.slice(1));
        if (!O.length) throw Error("X instance requires a subcircuit name.");
        const x = /;§pnba\s+(.+)$/i.exec(w)?.[1].split(")");
        I.instances.push({ name: A[0], nodes: O.slice(0, -1).map(ge), definitionName: O.at(-1), definitionId: null, parameters: P, line: C, raw: w, pinNames: x });
      } else I.statements.push({ line: C, text: w });
    } catch (A) {
      a("error", C, A.message + " Statement: " + w);
    }
  f.length > 1 && a("error", f.at(-1).line, "Unclosed .SUBCKT " + f.at(-1).name), p && a("error", 0, "Unclosed .control block.");
  function m(w, C) {
    for (; w; ) {
      if (Object.hasOwn(w.definitions, ge(C))) return w.definitions[ge(C)];
      w = d[w.parent];
    }
    return null;
  }
  for (const w of Object.values(d)) {
    const C = [...w.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...w.statements], A = wn(C.map((I) => I.text).join(`
`), { models: d[w.parent]?.models });
    w.devices = A.components.map((I) => ({ ...I, line: C[I.line - 1]?.line || w.line })), w.models = A.models, w === u && (u.title = A.title), s.push(...A.diagnostics.filter((I) => !I.message.includes("No supported components to render.") && !I.message.includes("300 components")).map((I) => ({ ...I, line: C[I.line - 1]?.line || w.line })));
    const S = new Set(w.devices.map((I) => ge(I.name)));
    for (const I of w.instances)
      if (S.has(ge(I.name)) && a("error", I.line, "Duplicate instance/device name: " + I.name), S.add(ge(I.name)), I.definitionId = m(w, I.definitionName), !I.definitionId && !/^\{[\s\S]*\}$/.test(I.definitionName)) a("error", I.line, "Undefined subcircuit: " + I.definitionName + " in " + I.name);
      else if (I.definitionId) {
        const O = d[I.definitionId];
        O.ports.length !== I.nodes.length && a("error", I.line, `${I.name}: ${O.name} expects ${O.ports.length} ports; got ${I.nodes.length}.`);
      }
  }
  for (const w of Object.values(d)) delete w.statements;
  const _ = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function E(w, C = []) {
    if (_.has(w)) {
      a("error", d[w].line, "Circular subcircuit reference: " + [...C, d[w].name].join(" → "));
      return;
    }
    if (!N.has(w)) {
      if (_.add(w), C.length >= 64) {
        a("error", d[w].line, "Subcircuit dependency nesting exceeds 64 levels."), _.delete(w), N.add(w);
        return;
      }
      for (const A of d[w].instances) A.definitionId && E(A.definitionId, [...C, d[w].name]);
      _.delete(w), N.add(w);
    }
  }
  for (const w of Object.keys(d)) E(w);
  !u.devices.length && !u.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const w of s) !w.source && w.line && o.origins[w.line - 1] && (w.source = o.origins[w.line - 1].file, w.line = o.origins[w.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: u.title || "", scopes: d, globals: [...l], diagnostics: s, layoutDescription: r.layout };
}
const le = () => /* @__PURE__ */ Object.create(null), Oe = (n, e) => [...n, e].map((o) => encodeURIComponent(o)).join("/"), it = (n, e) => Oe(n.map((o) => o.toLowerCase()), e.toLowerCase());
function _n(n, e = []) {
  const o = le(), r = (s) => o[s] || (o[s] = { name: s, displayName: s.split("/").map((d) => decodeURIComponent(d)).join("/"), bit: Object.keys(o).length + 2, terminals: [] });
  for (const s of n) for (const [d, l] of Object.entries(s.terminals)) r(l).terminals.push({ component: s.name, pin: d });
  for (const s of e) r(s);
  return o;
}
function Nn(n) {
  if (n.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = n.diagnostics, e;
  }
}
const vt = (n) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(n) ? n.slice(1, -1) : n, Cn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function We(n, e, o = (s) => s, r = (s) => s) {
  const s = [];
  n = n.replace(/"(?:\\.|[^"\\])*"/g, (l) => (s.push(l), "@@" + (s.length - 1) + "@@")), n = n.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (l, a, c) => {
    const u = c.split(",").map((v) => v.trim());
    if (u.some((v) => !v || /[\s{}+*()]/.test(v))) throw Error("Unsupported dynamic voltage/current reference: " + l);
    const f = a.toUpperCase() + "(" + u.map((v) => a.toLowerCase() === "v" ? o(v) : r(v, a)).join(",") + ")";
    return s.push(f), "@@" + (s.length - 1) + "@@";
  });
  let d = n.length;
  return n = n.replace(Cn, (l, a, c) => {
    if (c.slice(a + l.length).trimStart().startsWith("(")) return l;
    const u = e(l.toLowerCase());
    if (u === void 0) return l;
    if (d += u.length + 2, d > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + u + ")";
  }), n.replace(/@@(\d+)@@/g, (l, a) => s[Number(a)]);
}
function Sn(n, e, o, r) {
  const s = { ...e, ...o }, d = le(), l = /* @__PURE__ */ new Set(), a = le();
  for (const [u, f] of Object.entries(r)) a[u] = We(vt(f), (v) => n[v]);
  function c(u) {
    if (Object.hasOwn(a, u)) return a[u];
    if (Object.hasOwn(d, u)) return d[u];
    if (!Object.hasOwn(s, u)) return n[u];
    if (l.has(u)) {
      if (Object.hasOwn(n, u)) return n[u];
      throw Error("Circular parameter dependency: " + [...l, u].join(" → "));
    }
    return l.add(u), d[u] = We(vt(s[u]), c), l.delete(u), d[u];
  }
  for (const u of Object.keys(s)) c(u);
  return Object.assign(le(), n, d, a);
}
function st(n, e, o, r) {
  let s = "";
  for (let c = 0; c < n.length; ) {
    const u = n[c];
    if (u !== "{" && u !== "'") {
      s += u, c++;
      continue;
    }
    const f = c++;
    let v = 1, p = "";
    for (; c < n.length && v; c++) {
      if (u === "'") {
        n[c] === "'" && (v = 0);
        continue;
      }
      if (p) {
        n[c] === p && (p = "");
        continue;
      }
      if (n[c] === '"' || n[c] === "'") {
        p = n[c];
        continue;
      }
      n[c] === "{" && v++, n[c] === "}" && v--;
    }
    if (v) throw Error("Unclosed parameter expression.");
    s += u + We(n.slice(f + 1, c - 1), (g) => e[g], o, r) + (u === "{" ? "}" : "'");
  }
  const d = [];
  let l = 0, a = "";
  for (let c = 0; c < s.length; c++) {
    const u = s[c];
    if (a) {
      u === a && s[c - 1] !== "\\" && (a = "");
      continue;
    }
    if (u === '"' || u === "'") {
      a = u;
      continue;
    }
    if ("({".includes(u) && l++, ")}".includes(u) && l--, !l && (c === 0 || /\s/.test(s[c - 1]))) {
      const f = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(s.slice(c));
      f && (d.push({ start: c, end: c + f[0].length, key: f[1].toLowerCase() }), c += f[0].length - 1);
    }
  }
  if (d.length) {
    let c = s.slice(0, d[0].start);
    d.forEach((u, f) => {
      const v = d[f + 1]?.start ?? s.length, p = s.slice(u.end, v);
      c += s.slice(u.start, u.end) + (p.includes("{") || ["refnode", "intnode"].includes(u.key) ? p : We(p, (g) => e[g], o, r));
    }), s = c;
  } else Object.hasOwn(e, n.toLowerCase()) && (s = "{" + e[n.toLowerCase()] + "}");
  return s;
}
class In {
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
  add(e, o, r) {
    if (typeof arguments[0] != "string")
      for (let s in arguments[0])
        this.add(s, arguments[0][s], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(s) {
        this[s] = this[s] || [], o && this[s][r ? "unshift" : "push"](o);
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
  run(e, o) {
    this[e] = this[e] || [], this[e].forEach(function(r) {
      r.call(o && o.context ? o.context : o, o);
    });
  }
}
class An {
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
    e.forEach((o) => {
      if (typeof o != "object" || !o.name || !o.init)
        throw new Error("Invalid JSEP plugin format");
      this.registered[o.name] || (o.init(this.jsep), this.registered[o.name] = o);
    });
  }
}
class R {
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
    return "JavaScript Expression Parser (JSEP) v" + R.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return R.max_unop_len = Math.max(e.length, R.max_unop_len), R.unary_ops[e] = 1, R;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, o, r) {
    return R.max_binop_len = Math.max(e.length, R.max_binop_len), R.binary_ops[e] = o, r ? R.right_associative.add(e) : R.right_associative.delete(e), R;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return R.additional_identifier_chars.add(e), R;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, o) {
    return R.literals[e] = o, R;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete R.unary_ops[e], e.length === R.max_unop_len && (R.max_unop_len = R.getMaxKeyLen(R.unary_ops)), R;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return R.unary_ops = {}, R.max_unop_len = 0, R;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return R.additional_identifier_chars.delete(e), R;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete R.binary_ops[e], e.length === R.max_binop_len && (R.max_binop_len = R.getMaxKeyLen(R.binary_ops)), R.right_associative.delete(e), R;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return R.binary_ops = {}, R.max_binop_len = 0, R;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete R.literals[e], R;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return R.literals = {}, R;
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
    return new R(e).parse();
  }
  /**
   * Get the longest key length of any object
   * @param {object} obj
   * @returns {number}
   */
  static getMaxKeyLen(e) {
    return Math.max(0, ...Object.keys(e).map((o) => o.length));
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
    return R.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !R.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    R.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return R.isIdentifierStart(e) || R.isDecimalDigit(e);
  }
  /**
   * throw error at index of the expression
   * @param {string} message
   * @throws
   */
  throwError(e) {
    const o = new Error(e + " at character " + this.index);
    throw o.index = this.index, o.description = e, o;
  }
  /**
   * Run a given hook
   * @param {string} name
   * @param {jsep.Expression|false} [node]
   * @returns {?jsep.Expression}
   */
  runHook(e, o) {
    if (R.hooks[e]) {
      const r = { context: this, node: o };
      return R.hooks.run(e, r), r.node;
    }
    return o;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (R.hooks[e]) {
      const o = { context: this };
      return R.hooks[e].find(function(r) {
        return r.call(o.context, o), o.node;
      }), o.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === R.SPACE_CODE || e === R.TAB_CODE || e === R.LF_CODE || e === R.CR_CODE; )
      e = this.expr.charCodeAt(++this.index);
    this.runHook("gobble-spaces");
  }
  /**
   * Top-level method to parse all expressions and returns compound or single node
   * @returns {jsep.Expression}
   */
  parse() {
    this.runHook("before-all");
    const e = this.gobbleExpressions(), o = e.length === 1 ? e[0] : {
      type: R.COMPOUND,
      body: e
    };
    return this.runHook("after-all", o);
  }
  /**
   * top-level parser (but can be reused within as well)
   * @param {number} [untilICode]
   * @returns {jsep.Expression[]}
   */
  gobbleExpressions(e) {
    let o = [], r, s;
    for (; this.index < this.expr.length; )
      if (r = this.code, r === R.SEMCOL_CODE || r === R.COMMA_CODE)
        this.index++;
      else if (s = this.gobbleExpression())
        o.push(s);
      else if (this.index < this.expr.length) {
        if (r === e)
          break;
        this.throwError('Unexpected "' + this.char + '"');
      }
    return o;
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
    let e = this.expr.substr(this.index, R.max_binop_len), o = e.length;
    for (; o > 0; ) {
      if (R.binary_ops.hasOwnProperty(e) && (!R.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !R.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
        return this.index += o, e;
      e = e.substr(0, --o);
    }
    return !1;
  }
  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   * @returns {?jsep.BinaryExpression}
   */
  gobbleBinaryExpression() {
    let e, o, r, s, d, l, a, c, u;
    if (l = this.gobbleToken(), !l || (o = this.gobbleBinaryOp(), !o))
      return l;
    for (d = { value: o, prec: R.binaryPrecedence(o), right_a: R.right_associative.has(o) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + o), s = [l, d, a]; o = this.gobbleBinaryOp(); ) {
      if (r = R.binaryPrecedence(o), r === 0) {
        this.index -= o.length;
        break;
      }
      d = { value: o, prec: r, right_a: R.right_associative.has(o) }, u = o;
      const f = (v) => d.right_a && v.right_a ? r > v.prec : r <= v.prec;
      for (; s.length > 2 && f(s[s.length - 2]); )
        a = s.pop(), o = s.pop().value, l = s.pop(), e = {
          type: R.BINARY_EXP,
          operator: o,
          left: l,
          right: a
        }, s.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + u), s.push(d, e);
    }
    for (c = s.length - 1, e = s[c]; c > 1; )
      e = {
        type: R.BINARY_EXP,
        operator: s[c - 1].value,
        left: s[c - 2],
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
    let e, o, r, s;
    if (this.gobbleSpaces(), s = this.searchHook("gobble-token"), s)
      return this.runHook("after-token", s);
    if (e = this.code, R.isDecimalDigit(e) || e === R.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === R.SQUOTE_CODE || e === R.DQUOTE_CODE)
      s = this.gobbleStringLiteral();
    else if (e === R.OBRACK_CODE)
      s = this.gobbleArray();
    else {
      for (o = this.expr.substr(this.index, R.max_unop_len), r = o.length; r > 0; ) {
        if (R.unary_ops.hasOwnProperty(o) && (!R.isIdentifierStart(this.code) || this.index + o.length < this.expr.length && !R.isIdentifierPart(this.expr.charCodeAt(this.index + o.length)))) {
          this.index += r;
          const d = this.gobbleToken();
          return d || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: R.UNARY_EXP,
            operator: o,
            argument: d,
            prefix: !0
          });
        }
        o = o.substr(0, --r);
      }
      R.isIdentifierStart(e) ? (s = this.gobbleIdentifier(), R.literals.hasOwnProperty(s.name) ? s = {
        type: R.LITERAL,
        value: R.literals[s.name],
        raw: s.name
      } : s.name === R.this_str && (s = { type: R.THIS_EXP })) : e === R.OPAREN_CODE && (s = this.gobbleGroup());
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
    let o = this.code;
    for (; o === R.PERIOD_CODE || o === R.OBRACK_CODE || o === R.OPAREN_CODE || o === R.QUMARK_CODE; ) {
      let r;
      if (o === R.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== R.PERIOD_CODE)
          break;
        r = !0, this.index += 2, this.gobbleSpaces(), o = this.code;
      }
      this.index++, o === R.OBRACK_CODE ? (e = {
        type: R.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), o = this.code, o !== R.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : o === R.OPAREN_CODE ? e = {
        type: R.CALL_EXP,
        arguments: this.gobbleArguments(R.CPAREN_CODE),
        callee: e
      } : (o === R.PERIOD_CODE || r) && (r && this.index--, this.gobbleSpaces(), e = {
        type: R.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), r && (e.optional = !0), this.gobbleSpaces(), o = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", o, r;
    for (; R.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === R.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); R.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (o = this.char, o === "e" || o === "E") {
      for (e += this.expr.charAt(this.index++), o = this.char, (o === "+" || o === "-") && (e += this.expr.charAt(this.index++)); R.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      R.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return r = this.code, R.isIdentifierStart(r) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (r === R.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === R.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: R.LITERAL,
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
    const o = this.index, r = this.expr.charAt(this.index++);
    let s = !1;
    for (; this.index < this.expr.length; ) {
      let d = this.expr.charAt(this.index++);
      if (d === r) {
        s = !0;
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
    return s || this.throwError('Unclosed quote after "' + e + '"'), {
      type: R.LITERAL,
      value: e,
      raw: this.expr.substring(o, this.index)
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
    let e = this.code, o = this.index;
    for (R.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, R.isIdentifierPart(e)); )
      this.index++;
    return {
      type: R.IDENTIFIER,
      name: this.expr.slice(o, this.index)
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
    const o = [];
    let r = !1, s = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let d = this.code;
      if (d === e) {
        r = !0, this.index++, e === R.CPAREN_CODE && s && s >= o.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (d === R.COMMA_CODE) {
        if (this.index++, s++, s !== o.length) {
          if (e === R.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === R.CBRACK_CODE)
            for (let l = o.length; l < s; l++)
              o.push(null);
        }
      } else if (o.length !== s && s !== 0)
        this.throwError("Expected comma");
      else {
        const l = this.gobbleExpression();
        (!l || l.type === R.COMPOUND) && this.throwError("Expected comma"), o.push(l);
      }
    }
    return r || this.throwError("Expected " + String.fromCharCode(e)), o;
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
    let e = this.gobbleExpressions(R.CPAREN_CODE);
    if (this.code === R.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: R.SEQUENCE_EXP,
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
      type: R.ARRAY_EXP,
      elements: this.gobbleArguments(R.CBRACK_CODE)
    };
  }
}
const Tn = new In();
Object.assign(R, {
  hooks: Tn,
  plugins: new An(R),
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
R.max_unop_len = R.getMaxKeyLen(R.unary_ops);
R.max_binop_len = R.getMaxKeyLen(R.binary_ops);
const Re = (n) => new R(n).parse(), On = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(R).filter((n) => !On.includes(n) && Re[n] === void 0).forEach((n) => {
  Re[n] = R[n];
});
Re.Jsep = R;
const kn = "ConditionalExpression";
var Mn = {
  name: "ternary",
  init(n) {
    n.hooks.add("after-expression", function(o) {
      if (o.node && this.code === n.QUMARK_CODE) {
        this.index++;
        const r = o.node, s = this.gobbleExpression();
        if (s || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === n.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), o.node = {
            type: kn,
            test: r,
            consequent: s,
            alternate: d
          }, r.operator && n.binary_ops[r.operator] <= 0.9) {
            let l = r;
            for (; l.right.operator && n.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            o.node.test = l.right, l.right = o.node, o.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Re.plugins.register(Mn);
const Rn = "ConditionalExpression";
var Ln = {
  name: "ternary",
  init(n) {
    n.hooks.add("after-expression", function(o) {
      if (o.node && this.code === n.QUMARK_CODE) {
        this.index++;
        const r = o.node, s = this.gobbleExpression();
        if (s || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === n.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), o.node = {
            type: Rn,
            test: r,
            consequent: s,
            alternate: d
          }, r.operator && n.binary_ops[r.operator] <= 0.9) {
            let l = r;
            for (; l.right.operator && n.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            o.node.test = l.right, l.right = o.node, o.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Re.plugins.register(Ln);
const Pn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Et = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (n, e) => Math.abs(n) ** e, mod: (n, e) => n % e, limit: (n, e, o) => Math.min(Math.max(n, e), o) }, he = (n) => Number(n) > 0.5;
function Ue(n, e = {}) {
  const o = /* @__PURE__ */ new Set();
  let r = 0;
  function s(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, u, f, v] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), p = f.toLowerCase(), g = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : Pn[p[0]] || 1;
      return "(" + (v ? +(u + (u.includes(".") ? "" : ".") + v) : Number(u)) * g + ")";
    }), d(Re(a));
  }
  function d(a) {
    if (++r > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const c = a.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + a.name);
      if (o.has(c)) throw Error("Circular structural parameter: " + c);
      o.add(c);
      const u = s(e[c]);
      return o.delete(c), u;
    }
    if (a.type === "ConditionalExpression") return he(d(a.test)) ? d(a.consequent) : d(a.alternate);
    if (a.type === "UnaryExpression") {
      const c = d(a.argument);
      if (a.operator === "-") return -c;
      if (a.operator === "+") return +c;
      if (a.operator === "!" || a.operator === "~") return !he(c);
    }
    if (a.type === "BinaryExpression") {
      const c = d(a.left);
      if (a.operator === "&&") return he(c) && he(d(a.right));
      if (a.operator === "||") return he(c) || he(d(a.right));
      const u = d(a.right);
      switch (a.operator) {
        case "+":
          return c + u;
        case "-":
          return c - u;
        case "*":
          return c * u;
        case "/":
          return c / u;
        case "**":
          return c ** u;
        case "%":
          return c % u;
        case "^":
          return he(c) !== he(u);
        case "&":
          return he(c) && he(u);
        case "|":
          return he(c) || he(u);
        case ">":
          return c > u;
        case "<":
          return c < u;
        case ">=":
          return c >= u;
        case "<=":
          return c <= u;
        case "==":
        case "===":
          return c === u;
        case "!=":
        case "!==":
          return c !== u;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const c = a.callee.name.toLowerCase();
      if (c === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return he(d(a.arguments[0])) ? d(a.arguments[1]) : d(a.arguments[2]);
      }
      if (Object.hasOwn(Et, c)) return Et[c](...a.arguments.map(d));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const l = s(n);
  if (typeof l == "number" && !Number.isFinite(l)) throw Error("Structural expression is not finite.");
  return l;
}
function qe(n, { isolate: e = "" } = {}) {
  Nn(n);
  const o = le(), r = /* @__PURE__ */ new Map();
  let s = 0, d = 0;
  function l(a, c, u, f, v, p, g) {
    if (c.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++s > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const m = n.scopes[a], _ = c.length ? Oe(c.slice(0, -1), c.at(-1)) : "", N = le();
    if (e && _ === e && (u = le()), g.some((I) => I.scopeId === a)) throw Error("Circular subcircuit reference at " + _);
    const E = Sn(f, m.defaults, m.parameters, v);
    function w(I) {
      if (/^\{[\s\S]*\}$/.test(I)) {
        const P = Ue(I, E);
        I = String(typeof P == "boolean" ? Number(P) : P);
      }
      /^"[\s\S]*"$/.test(I) && (I = I.slice(1, -1));
      const O = I.toLowerCase();
      return Object.hasOwn(u, O) ? u[O] : n.globals.includes(O) ? it([], O) : N[O] || (N[O] = it(c, O));
    }
    const C = { id: _, path: c, scopeId: a, name: p?.name || "Top", definition: m.name, ports: m.ports.map((I) => ({ name: I, node: w(I) })), params: E, nodes: N, models: le(), devices: [], children: [], raw: p?.raw || "", line: p?.line || 0 };
    o[_] = C, r.set(_, w);
    const A = [...g, C];
    function S(I) {
      if (!I) return "";
      let O = m;
      for (; O; ) {
        if (O.directives.some((P) => new RegExp("^\\.model\\s+" + I.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(P.text))) {
          const P = [...A].reverse().find((x) => x.scopeId === O.id);
          return Oe(P?.path || [], I.toLowerCase());
        }
        O = n.scopes[O.parent];
      }
      return I;
    }
    for (const I of m.directives.filter((O) => /^\.model\b/i.test(O.text))) {
      const O = /^\.model\s+(\S+)/i.exec(I.text)?.[1];
      if (!O) continue;
      const P = S(O), x = m.models[O.toLowerCase()], y = st(I.text, E, w, (L) => Oe(c, L));
      C.models[P] = { ...x, name: P, raw: y.replace(/^(\.model\s+)\S+/i, (L, G) => G + P), instanceId: _, parameters: E };
    }
    for (const I of m.devices) {
      if (++d > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const O = le();
      for (const [x, y] of Object.entries(I.terminals)) O[x] = w(y);
      const P = S(I.model);
      C.devices.push({ ...I, name: Oe(c, I.name), localName: I.name, instanceId: _, terminals: O, model: P, parameters: E });
    }
    for (const I of m.instances) {
      let O = I.definitionId;
      if (!O) {
        const L = String(Ue(I.definitionName, E)).toLowerCase();
        let G = m;
        for (; G && !O; )
          O = G.definitions[L], G = n.scopes[G.parent];
        if (!O) throw Error("Undefined selected subcircuit: " + L);
      }
      const P = n.scopes[O], x = le();
      if (P.ports.length !== I.nodes.length) throw Error(I.name + ": expected " + P.ports.length + " ports; got " + I.nodes.length);
      P.ports.forEach((L, G) => {
        x[L.toLowerCase()] = w(I.nodes[G]);
      });
      const y = l(O, [...c, I.name], x, E, I.parameters, I, A);
      I.pinNames?.length === y.ports.length && y.ports.forEach((L, G) => {
        L.label = I.pinNames[G];
      }), C.children.push(y);
    }
    return C;
  }
  try {
    let v = function(p, g) {
      const m = g.split(":");
      if (m.length === 1) return { owner: p, name: g };
      const _ = m.pop();
      for (const N of [[...p.path, ...m], m]) {
        const E = c.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: _ };
      }
      throw Error("Unknown hierarchical reference: " + g);
    };
    const a = l(n.rootId, [], le(), le(), le(), null, []), c = new Map(Object.values(o).map((p) => [p.id.toLowerCase(), p])), u = Object.assign(le(), ...Object.values(o).map((p) => p.models)), f = (p) => u[p] || Object.entries(u).find(([g]) => g.startsWith(p + "."))?.[1];
    for (const p of Object.values(o)) for (const g of p.devices) {
      const m = n.scopes[p.scopeId].devices.find((E) => E.name === g.localName), _ = (E) => {
        const w = v(p, E);
        return r.get(w.owner.id)(w.name);
      }, N = (E, w = "", C = "") => {
        const A = v(p, E), S = A.owner.devices.find((I) => I.localName.toLowerCase() === A.name.toLowerCase());
        if (w.toLowerCase() === "ix") {
          const I = A.owner.ports.find((O, P) => O.name.toLowerCase() === A.name.toLowerCase() || String(P + 1) === A.name);
          if (I) return A.owner.id + ":" + I.name;
        }
        if (!S) {
          if (C) throw Error(g.name + ": referenced " + C + " device " + E + " was not found.");
          return Oe(A.owner.path, A.name);
        }
        if (C && S.kind !== C) throw Error(g.name + ": " + E + " must be a " + C + " device.");
        return S.name;
      };
      if (g.value = st(m.value, p.params, _, N), m.model && (g.value = g.value.replace(m.model, g.model)), g.kind === "M" && Object.keys(g.terminals).length === 3) {
        let E = f(g.model), w = !1;
        const C = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !C.has(E.name); ) {
          C.add(E.name);
          const A = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (A) {
            w = A[1] === void 0 || Number(Ue(A[1], E.parameters)) >= 0.5;
            break;
          }
          const S = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = f(S + (E.baseModel || "").toLowerCase()) || f((E.baseModel || "").toLowerCase());
        }
        C.size && (g.type = "spice_" + (w ? "pmos3" : "nmos3"));
      }
      g.controlSources = (m.controlSources || []).map((E) => N(E, "", "V")), g.controlSource = g.controlSources[0] || "", g.coupledInductors = (m.coupledInductors || []).map((E) => N(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...m.controlSources || [], ...m.coupledInductors || []])) {
        const w = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        g.value = g.value.replace(new RegExp("(?<![\\w./%])" + w + "(?![\\w.$])", "g"), () => N(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: n, root: a, contexts: o };
  } catch (a) {
    throw a.diagnostics = [...n.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function Me(n) {
  return [...n.devices, ...n.children.flatMap(Me)];
}
function Le(n) {
  return JSON.stringify(n.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, o) => e[0].localeCompare(o[0])));
}
function dt(n, e = {}) {
  const o = new Map(n.components.map((x) => [x.name, x])), r = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), d = [], l = (x, y) => JSON.stringify([x, y].sort()), a = (x) => e[x]?.potential !== null && e[x]?.potential !== void 0;
  for (const x of n.components) {
    for (const [k, D] of Object.entries(x.terminals))
      r.has(D) || r.set(D, []), r.get(D).push({ device: x.name, pin: k });
    if (x.kind === "R") {
      const k = Object.values(x.terminals);
      if (k.length === 2 && k[0] !== k[1]) {
        const D = l(...k);
        s.has(D) || s.set(D, []), s.get(D).push(x);
      }
    }
    const y = x.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(x.kind) ? "fet" : null, L = y === "bjt" ? /_(npn|pnp)$/.exec(x.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(x.type)?.[1];
    if (!y || !L) continue;
    const G = x.terminals, q = G[y === "bjt" ? "B" : "G"], X = G[y === "bjt" ? "C" : "D"], H = G[y === "bjt" ? "E" : "S"];
    [q, X, H].some((k) => k === void 0) || q === H || X === H || d.push({ id: x.name, family: y, polarity: L, control: q, drain: X, source: H, body: x.kind === "M" ? G.B : void 0 });
  }
  const c = [], u = /* @__PURE__ */ new Set(), f = (x, y, L, G, q, X = "basic", H = [], k = "high") => {
    const D = [.../* @__PURE__ */ new Set([...y, ...H])], W = JSON.stringify([x, X, [...D].sort()]);
    u.has(W) || (u.add(W), c.push({ id: "motif" + c.length, kind: x, variant: X, transistors: y, members: D, roles: L, nets: G, evidence: q, confidence: k }));
  }, v = (x, y) => x.family === y.family && x.polarity === y.polarity, p = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), _ = new Map(d.map((x) => [x.id, x])), N = (x, y, L) => {
    x.has(y) || x.set(y, []), x.get(y).push(L);
  }, E = (x, y) => JSON.stringify([x.family, x.polarity, y]);
  for (const x of d)
    N(p, E(x, x.control), x), N(g, E(x, x.source), x), x.family === "bjt" && (r.get(x.source) || []).some((y) => {
      const L = _.get(y.device);
      return L && L.family === "bjt" && !v(x, L) && L.source === x.source;
    }) && N(m, E(x, x.drain), x);
  const w = (x) => [{ node: x.source, resistor: null }, ...(r.get(x.source) || []).flatMap((y) => {
    const L = o.get(y.device);
    if (L.kind !== "R") return [];
    const G = Object.values(L.terminals).find((q) => q !== x.source);
    return G !== void 0 && G !== x.control && G !== x.drain ? [{ node: G, resistor: L.name }] : [];
  })];
  for (const x of d) x.control === x.drain && f("diode-connected", [x.id], { reference: x.id }, { control: x.control, return: x.source }, ["control-drain-short", x.family]);
  for (const x of d) {
    const y = p.get(E(x, x.control));
    if (y.filter((k) => k.control === k.drain).length > 1) continue;
    let L = null;
    if (x.control !== x.drain && x.family === "bjt" && (L = (p.get(E(x, x.drain)) || []).find((k) => k.id !== x.id && v(k, x) && k.control === x.drain && k.source === x.control && a(k.drain))), x.control !== x.drain && !L) continue;
    const G = w(x), q = [];
    let X = null, H = [];
    for (const k of y) {
      if (k.id === x.id || k.id === L?.id || k.drain === x.drain || k.drain === k.control) continue;
      const D = G.flatMap((W) => w(k).filter((z) => W.node === z.node).map((z) => ({ node: W.node, rs: [W.resistor, z.resistor].filter(Boolean) }))).find((W) => X === null || W.node === X);
      D && (X = D.node, q.push(k.id), H.push(...D.rs));
    }
    if (q.length) {
      const k = q.every((D) => _.get(D).body === x.body);
      f("current-mirror", [x.id, ...q, ...L ? [L.id] : []], { reference: x.id, outputs: q, ...L ? { helper: L.id } : {} }, { control: x.control, return: X }, ["same-polarity", "shared-control", L ? "emitter-follower-reference" : "diode-reference", H.length ? "resistive-common-return" : "shared-return", k ? "compatible-bodies" : "different-body-connections"], L ? "assisted" : H.length ? "degenerated" : "basic", [...H, ...L ? [L.id] : []], k ? "high" : "medium");
    }
  }
  const C = [], A = /* @__PURE__ */ new Set(), S = (x, y) => {
    const L = JSON.stringify([x.id, y.id].sort());
    A.has(L) || (A.add(L), C.push([x, y]));
  };
  for (const x of g.values()) if (!a(x[0].source)) {
    const y = x.filter((L) => L.control !== L.drain);
    y.length === 2 ? S(...y) : y.length > 2 && new Set(y.map((L) => L.control)).size > 1 && f("differential-pair", y.map((L) => L.id), { inputs: y.map((L) => L.id) }, { tail: y[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const x of m.values()) for (let y = 0; y < x.length; y++) for (let L = y + 1; L < x.length; L++) S(x[y], x[L]);
  for (const [x, y] of C) {
    if (x.control === y.control || x.control === x.drain || y.control === y.drain) continue;
    if (x.source === y.source && x.drain !== y.drain && !a(x.source)) {
      const q = (r.get(x.source) || []).some((H) => H.device !== x.id && H.device !== y.id), X = g.get(E(x, x.source)).length === 2;
      f("differential-pair", [x.id, y.id], { inputs: [x.id, y.id] }, { tail: x.source }, ["same-polarity", "distinct-controls", "shared-tail", q ? "tail-bias-connection" : "unbiased-tail", X ? "two-input-tail" : "multi-input-tail"], "basic", [], q && X && x.body === y.body ? "high" : "medium");
    }
    if (x.family !== "bjt" || x.drain !== y.drain || x.source === y.source) continue;
    const L = d.filter((q) => q.family === "bjt" && q.polarity !== x.polarity && q.source === x.source), G = d.filter((q) => q.family === "bjt" && q.polarity !== x.polarity && q.source === y.source);
    for (const q of L) for (const X of G) q.id !== X.id && q.control === X.control && q.drain !== X.drain && q.control !== q.drain && X.control !== X.drain && f("differential-pair", [x.id, y.id, q.id, X.id], { inputs: [x.id, y.id], commonBase: [q.id, X.id] }, { inputCollectors: x.drain, bias: q.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const x of d) if (x.family === "bjt" && x.control !== x.drain) {
    const y = s.get(l(x.drain, x.control)) || [], L = s.get(l(x.control, x.source)) || [];
    y.length === 1 && L.length === 1 && f("vbe-multiplier", [x.id], { transistor: x.id, collectorResistor: y[0].name, emitterResistor: L[0].name }, { control: x.control, collector: x.drain, emitter: x.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [y[0].name, L[0].name]);
  }
  const I = d.filter((x) => x.family === "bjt"), O = /* @__PURE__ */ new Map();
  for (const x of I) N(O, x.control, x);
  const P = (x) => (r.get(x) || []).filter((y) => _.has(y.device));
  for (const x of I) if (x.control !== x.drain) {
    for (const y of O.get(x.source) || []) if (y.id !== x.id && v(x, y) && y.drain === x.control && y.source !== x.drain) {
      const L = s.get(l(x.source, y.source)) || [];
      L.length === 1 && f("current-limit-pair", [x.id, y.id], { driver: x.id, output: y.id, senseResistor: L[0].name }, { sense: x.source, drive: x.control, output: y.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [L[0].name]);
    }
    for (const y of O.get(x.source) || []) y.id !== x.id && v(x, y) && y.control !== y.drain && x.drain === y.drain && y.source !== x.control && f("darlington-pair", [x.id, y.id], { driver: x.id, output: y.id }, { link: x.source, collector: x.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (O.get(x.source) || []).length === 1 ? "high" : "medium");
    for (const y of O.get(x.drain) || []) y.id !== x.id && !v(x, y) && y.control !== y.drain && x.source === y.drain && y.source !== x.control && P(x.drain).length === 2 && f("sziklai-pair", [x.id, y.id], { driver: x.id, output: y.id }, { link: x.drain, feedback: x.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const y of r.get(x.drain) || []) {
      const L = _.get(y.device);
      !L || L.family !== "bjt" || L.id === x.id || !v(x, L) || L.source !== x.drain || a(x.drain) || L.control === x.control || L.control === L.drain || L.drain === x.source || P(x.drain).length !== 2 || f("cascode-pair", [x.id, L.id], { driver: x.id, output: L.id }, { link: x.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const x of I.filter((y) => y.polarity === "npn" && a(y.drain))) for (const y of I.filter((L) => L.polarity === "pnp" && a(L.drain))) {
    if (e[x.drain].potential <= e[y.drain].potential) continue;
    const L = w(x).flatMap((G) => w(y).filter((q) => G.node === q.node && !a(G.node)).map((q) => ({ node: G.node, rs: [G.resistor, q.resistor].filter(Boolean) })))[0];
    L && f("push-pull-pair", [x.id, y.id], { upper: x.id, lower: y.id }, { output: L.node }, ["complementary-polarity", "ordered-collector-supplies", L.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", L.rs);
  }
  return c;
}
function ut(n, e, o = (r) => r) {
  const r = (s) => Array.isArray(s) ? s.map(e) : e(s);
  return n.map((s) => ({ ...s, members: s.members.map(e), transistors: s.transistors.map(e), roles: Object.fromEntries(Object.entries(s.roles).map(([d, l]) => [d, r(l)])), nets: Object.fromEntries(Object.entries(s.nets).map(([d, l]) => [d, o(l)])) }));
}
function Dn(n, e, o) {
  const r = [], s = /* @__PURE__ */ new Set(), d = new Map(n.components.map((l) => [l.name, l]));
  for (const l of o) {
    if (new Set(l.members).size !== l.members.length) throw Error("Duplicate @layout pair member.");
    const a = l.members.map((p) => d.get(p));
    if (a.some((p) => !p)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[l.kind], u = l.kind === "differential" && a.length === 2 ? n.components.filter((p) => !l.members.includes(p.name) && Object.values(p.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], f = dt({ ...n, components: [...a, ...u] }, e), v = f.find((p) => p.kind === c && p.confidence === "high" && l.members.every((g) => p.members.includes(g)));
    if (!v) throw Error("Invalid @layout pair " + l.kind + " { " + l.members.join(" ") + " }: electrical structure does not match.");
    for (const p of f.filter((g) => g === v || g.kind === "diode-connected" && g.members.every((m) => v.members.includes(m)))) {
      const g = JSON.stringify([p.kind, [...p.members].sort()]);
      s.has(g) || (s.add(g), r.push({ ...p, id: "motif" + r.length, origin: "annotation" }));
    }
  }
  return r;
}
function Un(n, e, o = dt(n, e)) {
  const r = /* @__PURE__ */ new Map(), s = n.components.filter((p) => p.kind === "R"), d = n.components.filter((p) => p.kind === "Q"), l = new Map(n.components.map((p) => [p.name, p])), a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), u = (p) => Object.values(p.terminals), f = (p, g, m) => {
    p && r.set(p.name, { reverse: u(p)[0] !== g, reason: m });
  };
  for (const p of d) {
    const { C: g, B: m, E: _ } = p.terminals, N = p.type.endsWith("pnp"), E = p.type.endsWith("npn");
    !N && !E || (a.has(_) || a.set(_, []), a.get(_).push(p), g === m && e[_]?.potential !== null && e[_]?.potential !== void 0 && c.set(g, { potential: e[_].potential }));
  }
  for (const p of o) if (p.kind === "vbe-multiplier" && p.confidence === "high") {
    const g = l.get(p.roles.transistor), m = g.type.endsWith("pnp"), _ = l.get(m ? p.roles.emitterResistor : p.roles.collectorResistor), N = l.get(m ? p.roles.collectorResistor : p.roles.emitterResistor);
    f(_, g.terminals[m ? "E" : "C"], "recognized VBE multiplier"), f(N, g.terminals.B, "recognized VBE multiplier");
  }
  for (const p of s) {
    const [g, m] = u(p), _ = c.get(g), N = c.get(m);
    _ && N && _.potential !== N.potential && f(p, _.potential > N.potential ? g : m, "diode-connected bias reference");
  }
  const v = /* @__PURE__ */ new Map();
  for (const p of s) {
    const g = u(p);
    if (!g.some((m) => e[m]?.potential !== null && e[m]?.potential !== void 0))
      for (const m of g)
        v.has(m) || v.set(m, []), v.get(m).push(p);
  }
  for (const [p, g] of v)
    if (!(g.length > 12))
      for (const m of g) for (const _ of g) {
        if (m === _) continue;
        const N = u(m).find((A) => A !== p), E = u(_).find((A) => A !== p), w = a.get(N)?.find((A) => A.type.endsWith("npn")), C = a.get(E)?.find((A) => A.type.endsWith("pnp"));
        w && C && (f(m, N, "complementary emitter output"), f(_, p, "complementary emitter output"));
      }
  return r;
}
function Bn(n) {
  const e = n.components.filter((d) => d.kind === "Q"), o = /* @__PURE__ */ new Map(), r = new Set(n.components.filter((d) => d.kind === "R").map((d) => Object.values(d.terminals).sort().join("|"))), s = /* @__PURE__ */ new Set();
  for (const d of e) {
    const l = d.terminals.E;
    o.has(l) || o.set(l, []), o.get(l).push(d);
  }
  for (const d of e) {
    const { B: l, C: a, E: c } = d.terminals;
    if (l === c || !r.has([l, c].sort().join("|"))) continue;
    const u = o.get(l) || [];
    if (!(u.length > 16))
      for (const f of u) {
        if (f === d) continue;
        if (f.terminals.B === a) {
          s.add(d.name);
          break;
        }
        const v = o.get(f.terminals.B) || [];
        if (v.length <= 16 && v.some((p) => p !== d && p !== f && p.terminals.B === a)) {
          s.add(d.name);
          break;
        }
      }
  }
  return s;
}
const Be = 22;
function at(n) {
  const e = String(n).split("/").at(-1);
  let o;
  try {
    o = decodeURIComponent(e);
  } catch {
    o = e;
  }
  return o === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(o)?.[1].toLowerCase() || "unknown";
}
const je = (n) => ["pwr", "ret", "bias"].includes(n), jn = (n) => String(n).split("/").at(-1).toLowerCase(), Dt = (n) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[jn(n)] || "unknown", _t = (n) => {
  const e = at(n);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(n).toLowerCase()] || Dt(n);
};
function Vn(n) {
  const e = /* @__PURE__ */ new Map(), o = [], r = (l, a, c) => {
    e.has(l) || e.set(l, []), e.get(l).push({ node: a, delta: c });
  };
  for (const l of n)
    if (l.kind === "V")
      try {
        let a = l.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (c && Number(Ue(c[1], l.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const u = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!u) continue;
        const f = Ue(u[1], l.parameters);
        if (typeof f != "number" || !Number.isFinite(f)) continue;
        r(l.terminals["-"], l.terminals["+"], f), r(l.terminals["+"], l.terminals["-"], -f);
      } catch {
      }
  const s = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Set();
  for (const l of ["0", ...e.keys()]) {
    if (d.has(l)) continue;
    const a = /* @__PURE__ */ new Map([[l, 0]]), c = [l];
    d.add(l);
    let u = !1;
    for (let f = 0; f < c.length; f++) for (const v of e.get(c[f]) || []) {
      const p = a.get(c[f]) + v.delta;
      a.has(v.node) ? Math.abs(a.get(v.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (u = !0) : (a.set(v.node, p), d.add(v.node), c.push(v.node));
    }
    u && o.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [f, v] of a) s[f] = { value: v, reference: l, known: l === "0" && !u, consistent: !u };
  }
  return { nodes: s, diagnostics: o };
}
function Qn(n, e, o = null) {
  const r = Vn(Me(e.localScope ? n.contexts[e.focus] : n.root)), s = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ Object.create(null);
  for (const f of Object.values(e.nodes)) {
    const v = at(f.name), p = Dt(f.name);
    s[f.name] = { role: v !== "unknown" ? v : p, roleSource: v !== "unknown" ? "node-name" : p !== "unknown" ? "legacy-rail-name" : "unknown", potential: r.nodes[f.name]?.known ? r.nodes[f.name].value : null };
  }
  if (e.localScope) for (const f of e.interfaceBindings) {
    const v = s[f.local], p = _t(f.port);
    v && v.potential === null && ["pwr", "ret"].includes(p) && (v.potential = p === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(f.port) ? 0 : -1, v.potentialSource = "symbolic-port-order");
  }
  const l = o?.pairs?.length ? Dn(e, s, o.pairs) : dt(e, s), a = Un(e, s, l), c = Bn(e), u = (f, v, p) => {
    const g = { role: s[p].role, roleSource: s[p].roleSource }, m = f.block?.ports.find((E) => E.pin === v);
    if (m?.implicit || !f.block && !f.synthetic) return g;
    const _ = f.synthetic ? f.value : m?.name || m?.label, N = _t(_);
    return N !== "unknown" ? { role: N, roleSource: at(_) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : je(g.role) ? { ...g, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const f of e.components) {
    const v = Object.fromEntries(Object.entries(f.terminals).map(([P, x]) => [P, { ...s[x], ...u(f, P, x) }])), p = Object.values(v), g = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(f.type), m = g && !a.has(f.name) && p.length === 2 && p.every((P) => !je(P.role) && (P.potential === null || P.role !== "unknown")), _ = f.terminals["+"], N = f.terminals["-"], E = [_, N].filter((P) => P && P !== "0"), w = f.kind === "V" && E.some((P) => je(s[P]?.role)) && !E.some((P) => ["in", "out", "io", "fb"].includes(s[P]?.role)) && [_, N].every((P) => r.nodes[P]?.known), C = _ === "0" ? N : _, A = Object.keys(f.terminals), S = (P) => je(P.role) ? P.potential !== null ? P.potential > 0 ? "high" : "low" : P.role === "ret" ? "low" : "high" : "signal";
    let I = !1;
    A.length === 2 && (f.kind === "V" && p.every((P) => P.potential !== null) ? I = p[0].potential < p[1].potential : f.terminals[A[0]] === "0" ? I = !0 : f.terminals[A[1]] === "0" ? I = !1 : p.every((P) => P.potential !== null) ? I = p[0].potential < p[1].potential : I = S(p[0]) === "low" || S(p[1]) === "high" && S(p[0]) === "signal"), a.has(f.name) && (I = a.get(f.name).reverse);
    const O = f.synthetic ? "" : f.name.startsWith(e.focus + "/") ? f.name.slice(e.focus.length + 1) : f.name;
    d[f.name] = { version: Be, kind: f.kind, polarity: f.type.endsWith("pnp") ? "p" : f.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(f.name), orientationReason: a.get(f.name)?.reason || null, owner: O.includes("/") ? O.slice(0, O.lastIndexOf("/")) : "", passive: g, source: ["V", "I", "E", "F", "G", "H"].includes(f.kind) || f.kind === "B" && !g, ports: v, horizontal: m, orientation: m ? "horizontal" : I ? "vertical-reversed" : "vertical", flexible: A.length === 2 && (g || ["V", "I", "B", "F", "H"].includes(f.kind)), supply: !!w, voltage: w ? r.nodes[C].value : null };
  }
  return { version: Be, nodes: s, cells: d, motifs: l, diagnostics: r.diagnostics };
}
function Ut(n, e) {
  const o = e.ports.map((s, d) => ({ pin: "P" + d, name: s.name, label: s.label || s.name, node: s.node, implicit: !1 })), r = new Set(Me(e).flatMap((s) => Object.values(s.terminals)));
  for (const s of n.ir.globals) {
    const d = it([], s);
    r.has(d) && !o.some((l) => l.node === d) && o.push({ pin: "G" + o.length, label: s === "0" ? "⏚ 0" : "global: " + s, node: d, implicit: !0 });
  }
  return o;
}
function Ve(n, { mode: e = "hierarchical", expanded: o = /* @__PURE__ */ new Set(), focus: r = "" } = {}) {
  const s = n, d = n.contexts[r];
  if (!d) throw Error("Unknown instance: " + r);
  r && (n = qe(n.ir, { isolate: r }));
  const l = n.contexts[r];
  if (!l) throw Error("Unknown instance: " + r);
  const a = [], c = [];
  function u(m) {
    c.push(...Object.values(m.nodes), ...m.ports.map((N) => N.node));
    const _ = [...m.devices.map((N) => ({ line: N.line, device: N })), ...m.children.map((N) => ({ line: N.line, child: N }))].sort((N, E) => N.line - E.line);
    for (const N of _) {
      if (N.device) {
        const A = N.device;
        a.push({ ...A, layoutLabel: [...m.path.slice(l.path.length), A.localName].join("/") });
        continue;
      }
      const E = N.child;
      if (e === "flat" || o.has(E.id)) {
        u(E);
        continue;
      }
      const w = Ut(n, E), C = le();
      w.forEach((A) => {
        C[A.pin] = A.node;
      }), a.push({ name: E.id, kind: "X", type: "spice_subckt", terminals: C, value: E.definition, raw: E.raw, line: E.line, instanceId: E.id, layoutLabel: E.path.slice(l.path.length).join("/"), block: { definitionId: E.scopeId, ports: w, parameters: E.params } });
    }
  }
  u(l);
  for (const [m, _] of l.ports.entries()) a.push({ name: "@port/" + r + "/" + m, kind: "PORT", type: "spice_port", terminals: { A: _.node }, layoutLabel: _.name, value: _.name, raw: "Interface port " + _.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const f = Object.assign(le(), ...Object.values(n.contexts).map((m) => m.models)), v = { title: r || n.ir.title, components: a, nodes: _n(a, c), models: f, diagnostics: n.ir.diagnostics, mode: e, focus: r, localScope: !!r };
  v.interfaceBindings = l.ports.map((m, _) => ({ port: m.name, local: m.node, parent: d.ports[_].node }));
  const p = /* @__PURE__ */ new Map();
  for (const m of d.ports)
    p.has(m.node) || p.set(m.node, []), p.get(m.node).push(m.name);
  v.interfaceAliases = [...p].filter(([, m]) => m.length > 1).map(([m, _]) => ({ node: m, ports: _ })), v.topology = Fn(s, v);
  const g = En(n, v);
  return v.layout = Qn(n, v, g), v.layout.description = g, v;
}
function Fn(n, e) {
  const o = Me(n.contexts[e.focus]);
  e.localScope && (n = qe(n.ir, { isolate: e.focus }));
  const r = [], s = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const c = n.contexts[a.instanceId];
        if (!c) throw Error("Projection contains an unknown block.");
        const u = Ut(n, c);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(u.map((f) => [f.pin, f.node]))) throw Error("Block interface topology mismatch: " + a.name);
        r.push(...Me(c));
      } else r.push(a);
  for (const a of r) {
    if (s.has(a.name)) throw Error("Projection duplicates " + a.name);
    s.add(a.name);
  }
  const d = Le(r), l = Me(n.contexts[e.focus]);
  if (d !== Le(l)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((f) => [f.local, f.parent])), c = (f) => a.get(f) ?? f, u = r.map((f) => ({ ...f, terminals: Object.fromEntries(Object.entries(f.terminals).map(([v, p]) => [v, c(p)])), value: st(f.value, {}, c, (v) => v) }));
    if (Le(u) !== Le(o)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: r.length, signature: d, boundSignature: Le(o), boundaryVerified: !0 };
}
function Qe(n) {
  const e = le(), o = le();
  for (const r of n.components) {
    const s = le(), d = le();
    for (const [l, a] of Object.entries(r.terminals))
      s[l] = [n.nodes[a].bit], d[l] = "input";
    e[r.name] = { type: r.type, port_directions: d, connections: s, parameters: {}, attributes: { ref: r.name, displayRef: r.layoutLabel || r.name, value: r.value, spice: r.raw } }, e[r.name].spiceLayout = n.layout?.cells[r.name], r.block && (e[r.name].spiceBlock = { ports: r.block.ports.map((l) => ({ pin: l.pin, label: l.label })), definitionId: r.block.definitionId }), (r.type === "spice_device" || r.type === "spice_coupling") && (e[r.name].spiceSymbol = { label: r.symbol || r.kind, ports: Object.keys(r.terminals).map((l, a) => ({ pin: l, label: r.pinLabels?.[a] || l })), references: r.coupledInductors?.length ? r.coupledInductors : r.controlSources || [] });
  }
  for (const r of Object.values(n.nodes)) o[r.name] = { hide_name: 0, bits: [r.bit], attributes: {} };
  if (n.nodes[0]) {
    let r = "__ground";
    for (; Object.hasOwn(e, r); ) r += "_";
    e[r] = { type: "gnd", connections: { A: [n.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: o, spiceMotifs: ut(n.layout?.motifs || [], (r) => r, (r) => n.nodes[r].bit), spiceLayoutDescription: n.layout?.description || null } } };
}
function Gn(n) {
  const e = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = {}, s = (u) => (o.has(u) || o.set(u, o.size + 2), o.get(u));
  Object.entries(n.modules.circuit.cells).forEach(([u, f], v) => {
    const p = "c" + v;
    e.set(p, u);
    const g = Object.fromEntries(Object.entries(f.connections).map(([m, _]) => [m, _.map(s)]));
    r[p] = { type: f.type, connections: g, port_directions: f.port_directions, attributes: { displayRef: f.attributes.displayRef || f.attributes.ref || "", value: f.attributes.value || "", name: f.attributes.name || "" } }, f.spiceBlock && (r[p].spiceBlock = f.spiceBlock), f.spiceSymbol && (r[p].spiceSymbol = f.spiceSymbol), f.spiceLayout && (r[p].spiceLayout = f.spiceLayout);
  });
  const d = new Map([...e].map(([u, f]) => [f, u])), l = n.modules.circuit.spiceLayoutDescription, a = l ? { ...l, faces: (l.faces || []).map((u) => ({ ...u, device: d.get(u.device) })), pairs: (l.pairs || []).map((u) => ({ ...u, members: u.members.map((f) => d.get(f)) })), groups: l.groups.map((u) => ({ ...u, members: u.members.map((f) => f.cell ? { ...f, cell: d.get(f.cell) } : f) })), relations: l.relations.map((u) => ({ ...u, a: d.get(u.a) || u.a, b: d.get(u.b) || u.b })) } : null, c = ut(n.modules.circuit.spiceMotifs || [], (u) => d.get(u), s);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: r, spiceMotifs: c, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...o].map(([u, f]) => [f, u])) };
}
const Ce = /* @__PURE__ */ new Map();
async function Ke(n, e) {
  const o = Gn(n), r = JSON.stringify([o.netlist, e]);
  let s = Ce.get(r);
  s ? (Ce.delete(r), Ce.set(r, s)) : (s = await Hn(o.netlist, e), s.svg.length < 1e6 && (Ce.set(r, s), Ce.size > 20 && Ce.delete(Ce.keys().next().value)));
  const d = new DOMParser().parseFromString(s.svg, "image/svg+xml");
  if (d.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of d.querySelectorAll("[id],[class]")) {
    const u = c.getAttribute("id");
    u?.startsWith("cell_") && o.ids.has(u.slice(5)) && c.setAttribute("id", "cell_" + o.ids.get(u.slice(5)));
    const f = c.getAttribute("class");
    f && c.setAttribute("class", f.split(/\s+/).map((v) => v.startsWith("cell_") && o.ids.has(v.slice(5)) ? "cell_" + o.ids.get(v.slice(5)) : /^net_\d+$/.test(v) && o.bits.has(Number(v.slice(4))) ? "net_" + o.bits.get(Number(v.slice(4))) : v).join(" "));
  }
  const l = s.drawing ? structuredClone(s.drawing) : null, a = d.querySelector("#spice-layout-report");
  if (a) {
    const c = JSON.parse(a.textContent), u = (f) => o.ids.get(f) || f;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(u), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(u), c.recognizedMotifs = ut(c.recognizedMotifs || [], u, (f) => o.bits.get(f) ?? f), c.inputAttachments = (c.inputAttachments || []).map(u), c.mirroredInputPorts = (c.mirroredInputPorts || []).map(u);
    for (const f of [...c.flippedPairs || [], ...c.pairOrientationTrials || []]) f.members = f.members.map(u);
    for (const f of c.pairCompactions || [])
      f.members = f.members.map(u), f.moved = u(f.moved);
    for (const f of c.pairConstraints || []) f.members = f.members.map(u);
    for (const f of c.pairProximity || []) f.members = f.members.map(u);
    for (const f of c.motifMeasurements || [])
      f.members = f.members.map(u), f.interlopers && (f.interlopers = f.interlopers.map(u));
    for (const f of c.voltageRails || []) f.bit !== void 0 && (f.bit = o.bits.get(f.bit) ?? f.bit);
    a.textContent = JSON.stringify(c);
  }
  if (l) {
    for (const c of l.components) {
      c.id = o.ids.get(c.id) || c.id;
      for (const u of c.ports) u.bit = o.bits.get(u.bit) ?? u.bit;
    }
    for (const c of l.segments) c.bit = o.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(d.documentElement), drawing: l };
}
function Hn(n, e) {
  const o = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((r, s) => {
    const d = (c, u) => {
      clearTimeout(a), o.terminate(), c ? s(Error(c)) : r(u);
    }, l = Object.keys(n.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => d("Layout timed out. Open a subcircuit sheet or collapse instances."), l);
    o.onmessage = ({ data: c }) => d(c.error, { svg: c.svg, drawing: c.drawing }), o.onerror = (c) => d(c.message || "Layout worker failed."), o.postMessage({ netlist: n, settings: e });
  });
}
const Wn = `* RLC low-pass filter
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
`, qn = `* Voltage-divider biased common-emitter amplifier.
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
`, zn = `* Common-collector voltage follower; independently chosen example values.
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
`, Xn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, $n = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, Pe = {
  filter: { source: Wn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: qn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: zn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Xn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: $n, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Yn(n) {
  const e = new Uint8Array(n);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Nt(n) {
  return Yn(await n.arrayBuffer());
}
const Bt = [
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
].flat(), ft = "#292b29", ze = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((n) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Bt[e * 9 + n]))])], Ct = (n) => /^#[\da-f]{6}$/i.test(n), St = "spice-node-colors-v1";
function Kn(n) {
  let e = 2166136261;
  for (let o = 0; o < n.length; o++) e = Math.imul(e ^ n.charCodeAt(o), 16777619);
  return n.length + ":" + (e >>> 0);
}
class Zn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const o = Kn(e);
    o !== this.sourceId && (this.sourceId = o, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, ze[this.assigned.size % ze.length]), this.assigned.get(e)) : ft;
  }
  set(e, o) {
    if (!Ct(o)) throw Error("Invalid node color.");
    for (const r of e) this.manual.set(r, o.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const o of ["manual", "assigned"]) this[o] = new Map((Array.isArray(e[o]) ? e[o] : []).filter((r) => Array.isArray(r) && typeof r[0] == "string" && Ct(r[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Jn(n, e, o) {
  const r = new Map(e.map((s) => [s.name, o.color(s.name)]));
  for (const s of n.children) if (["line", "path", "polyline", "circle"].includes(s.localName) && s.hasAttribute("data-net")) {
    const d = r.get(s.getAttribute("data-net"));
    if (!d) continue;
    s.style.setProperty("stroke", d, "important"), s.localName === "circle" && s.style.setProperty("fill", d, "important");
  }
}
function eo(n, e) {
  const o = new Zn(), r = /* @__PURE__ */ new Set();
  let s = [], d = !1;
  try {
    o.restore(JSON.parse(sessionStorage.getItem(St) || "null"));
  } catch {
  }
  const l = () => {
    try {
      sessionStorage.setItem(St, JSON.stringify(o.snapshot()));
    } catch {
    }
  }, a = () => {
    const p = n("node-search").value.trim().toLowerCase();
    return s.filter((g) => !p || [g.name, g.displayName, ...g.terminals.map((m) => m.component + "." + m.pin)].some((m) => m.toLowerCase().includes(p)));
  };
  function c() {
    const p = a(), g = p.filter((m) => r.has(m.name)).length;
    n("node-count").textContent = `${p.length} / ${s.length} nodes · ${r.size} selected`, n("node-all").checked = !!p.length && g === p.length, n("node-all").indeterminate = g > 0 && g < p.length, n("node-auto").checked = o.auto;
    for (const m of ["node-apply", "node-clear"]) n(m).disabled = !d || !r.size;
    n("node-all").disabled = !d || !p.length;
  }
  function u() {
    n("nets").replaceChildren(...a().map((p) => {
      const g = document.createElement("tr");
      g.dataset.node = p.name;
      const m = document.createElement("td"), _ = document.createElement("input");
      _.type = "checkbox", _.checked = r.has(p.name), _.disabled = !d, _.setAttribute("aria-label", "Select node " + p.displayName), _.onchange = () => {
        _.checked ? r.add(p.name) : r.delete(p.name), c();
      }, m.append(_);
      const N = document.createElement("td");
      N.textContent = p.displayName;
      const E = document.createElement("td"), w = document.createElement("input");
      w.type = "color", w.value = o.color(p.name), w.disabled = !d, w.setAttribute("aria-label", "Wire color for " + p.displayName), w.onchange = () => {
        o.set([p.name], w.value), f();
      }, E.append(w);
      const C = document.createElement("td");
      return C.textContent = p.terminals.map((A) => A.component + "." + A.pin).join(", "), g.append(m, N, E, C), g;
    })), c();
  }
  function f() {
    for (const p of s) o.color(p.name);
    u(), l(), e(o, s);
  }
  n("node-search").oninput = u, n("node-all").onchange = () => {
    for (const p of a()) n("node-all").checked ? r.add(p.name) : r.delete(p.name);
    u();
  }, n("node-auto").onchange = () => {
    o.auto = n("node-auto").checked, f();
  }, n("node-apply").onclick = () => {
    o.set(r, n("node-color").value), f();
  }, n("node-clear").onclick = () => {
    o.set(r, ft), f();
  }, n("node-reset").onclick = () => {
    o.reset(), f();
  }, n("node-swatches").replaceChildren(...Bt.map((p) => {
    const g = document.createElement("button");
    return g.type = "button", g.style.backgroundColor = p, g.title = p, g.setAttribute("aria-label", "Apply palette color " + p), g.onclick = () => {
      r.size && (n("node-color").value = p, o.set(r, p), f());
    }, g;
  }));
  function v(p) {
    d = p;
    for (const g of n("node-panel").querySelectorAll("input,button")) g.disabled = !d;
    c();
  }
  return { snapshot: () => o.snapshot(), restore(p) {
    o.restore(p), r.clear(), f();
  }, setCircuit(p, g) {
    const m = o.sourceId;
    o.setSource(g), m !== o.sourceId && r.clear(), s = Object.values(p?.nodes || {});
    const _ = new Set(s.map((N) => N.name));
    for (const N of r) _.has(N) || r.delete(N);
    for (const N of s) o.color(N.name);
    d = !!p, u(), v(d), l(), e(o, s);
  }, setEnabled: v };
}
function to(n) {
  const e = (k) => n.querySelector("#spice-" + k), o = new AbortController(), r = o.signal, s = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, d = Object.fromEntries(Object.keys(s).map((k) => [k, n.querySelector(`[data-window-handle="${k}"]`)])), l = { editor: !0, details: !0, info: !0 }, a = { editor: !0, details: !0, info: !0 }, c = [], u = { editor: {}, details: {}, info: {} }, f = [];
  let v = !1, p = !1, g = null, m = null, _ = null, N = null;
  function E(k, D) {
    a[k] = D, s[k].dataset.pinned = String(D);
    const W = e("pin-" + k), z = { editor: "netlist", details: "details", info: "messages" }[k], K = k === "info" ? "bottom edge" : k === "details" ? "lower left" : "left edge", re = D ? `Unpin ${z} from ${K}` : `Pin ${z} to ${K}`;
    if (W.setAttribute("aria-pressed", String(D)), W.setAttribute("aria-label", re), W.title = re, D) for (const Y of ["left", "top", "right", "bottom", "width", "height"]) s[k].style.removeProperty(Y);
    v && requestAnimationFrame(x);
  }
  for (const k of Object.keys(s)) E(k, !0);
  const w = () => n.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: v, panels: { ...l } } })), C = (k, D, W, z = {}) => k.addEventListener(D, W, { ...z, signal: r });
  function A(k, D) {
    l[k] = D, s[k].hidden = v && !D, requestAnimationFrame(x), w();
  }
  function S(k, D = e("details-content")) {
    const W = document.createComment("workspace return");
    k.before(W), c.push({ node: k, anchor: W }), D === e("details-content") ? D.prepend(k) : D.append(k);
  }
  function I(k) {
    const D = k.getBoundingClientRect(), W = n.getBoundingClientRect();
    return { x: D.left - W.left, y: D.top - W.top, w: D.width, h: D.height, width: W.width, height: W.height };
  }
  function O(k, D, W) {
    const z = I(k), K = parseFloat(getComputedStyle(n).getPropertyValue("--spice-window-top")) || 100, re = Math.max(8, Math.min(D, z.width - z.w - 8)), Y = Math.max(8, Math.min(K, z.height - z.h - 8)), de = Math.max(Y, Math.min(W, z.height - z.h - 8));
    k.style.left = Math.round(re) + "px", k.style.top = Math.round(de) + "px", k.style.right = "auto", k.style.bottom = "auto";
  }
  function P() {
    if (!v || !a.info || s.info.hidden) return;
    const k = n.getBoundingClientRect(), D = k.width <= 600 ? 8 : 12, W = k.width <= 600 ? D : Math.max(D, ...["editor", "details"].filter((re) => a[re] && !s[re].hidden).map((re) => s[re].getBoundingClientRect().right - k.left + 12)), z = Math.min(W, Math.max(D, k.width - 160 - D)), K = s.info;
    for (const [re, Y] of Object.entries({ left: Math.round(z) + "px", right: D + "px", width: "auto" })) K.style[re] !== Y && (K.style[re] = Y);
  }
  function x() {
    if (v) {
      P();
      for (const [k, D] of Object.entries(s)) if (!D.hidden && !a[k]) {
        const W = I(D);
        O(D, W.x, W.y);
      }
    }
  }
  function y() {
    for (const k of Object.values(s))
      for (const D of ["left", "top", "right", "bottom", "width", "height", "z-index"]) k.style.removeProperty(D);
    for (const k of Object.keys(s))
      E(k, !0), A(k, !0);
    requestAnimationFrame(x);
  }
  function L() {
    if (v) return;
    v = !0, g = document.activeElement, m = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, N = document.createComment("workspace mount"), n.before(N), document.body.append(n);
    for (const D of document.body.children) D !== n && (f.push({ node: D, inert: D.inert }), D.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", n.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const D of Object.keys(s))
      u[D].base = s[D].style.cssText, u[D].floating && (s[D].style.cssText = u[D].floating), s[D].setAttribute("role", "dialog"), s[D].setAttribute("aria-modal", "false"), s[D].setAttribute("aria-labelledby", "spice-" + D + "-title"), d[D].tabIndex = 0, d[D].title = "Drag to move; arrow keys move the window", A(D, l[D]);
    for (const D of ["selection-actions", "selection", "hierarchy-panel"]) S(e(D));
    const k = e("workspace-strip");
    for (const D of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (k.childElementCount) {
        const W = document.createElement("span");
        W.className = "spice-tool-divider", W.setAttribute("role", "separator"), W.setAttribute("aria-orientation", "vertical"), k.append(W);
      }
      S(D === "hierarchy-bar" ? n.querySelector(".spice-hierarchy-bar") : e(D), k);
    }
    requestAnimationFrame(x), e("exit-fullscreen").focus({ preventScroll: !0 }), w();
  }
  function G() {
    if (v) {
      v = !1, _ = null, n.classList.remove("spice-is-fullscreen"), n.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: k, anchor: D } of c.splice(0))
        D.before(k), D.remove();
      e("workspace-strip").replaceChildren();
      for (const k of Object.keys(s)) {
        u[k].floating = s[k].style.cssText, s[k].style.cssText = u[k].base, s[k].hidden = !1;
        for (const D of ["role", "aria-modal", "aria-labelledby"]) s[k].removeAttribute(D);
        d[k].removeAttribute("tabindex"), d[k].removeAttribute("title");
      }
      N && (N.before(n), N.remove(), N = null);
      for (const { node: k, inert: D } of f.splice(0)) k.inert = D;
      m && (document.documentElement.style.overflow = m.html, document.body.style.overflow = m.body, window.scrollTo(m.x, m.y)), g?.focus?.({ preventScroll: !0 }), w();
    }
  }
  async function q() {
    L(), n.dataset.nativeFullscreen = "false";
  }
  async function X() {
    if (p = !1, document.fullscreenElement === n)
      try {
        await document.exitFullscreen();
      } catch {
        p = !0;
        return;
      }
    G();
  }
  C(e("fullscreen"), "click", () => v ? X() : q()), C(e("exit-fullscreen"), "click", X), C(e("reset-windows"), "click", y);
  for (const k of Object.keys(s)) {
    C(e("pin-" + k), "click", () => {
      const z = I(s[k]);
      E(k, !a[k]), a[k] || (s[k].style.width = z.w + "px", s[k].style.height = z.h + "px", O(s[k], z.x, z.y)), w();
    }), C(e("close-" + k), "click", () => {
      A(k, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), C(s[k], "pointerdown", () => {
      if (v) {
        for (const z of Object.values(s)) z.style.zIndex = "20";
        s[k].style.zIndex = "30";
      }
    }, { capture: !0 });
    const D = d[k];
    C(D, "pointerdown", (z) => {
      if (!v || z.button !== 0 || z.target.closest("button,input,select,textarea,a,label")) return;
      z.preventDefault();
      const K = I(s[k]);
      E(k, !1), s[k].style.width = K.w + "px", s[k].style.height = K.h + "px", O(s[k], K.x, K.y), _ = { id: k, pointer: z.pointerId, x: z.clientX, y: z.clientY, left: K.x, top: K.y }, D.setPointerCapture(z.pointerId);
    }), C(D, "pointermove", (z) => {
      _?.id === k && _.pointer === z.pointerId && O(s[k], _.left + z.clientX - _.x, _.top + z.clientY - _.y);
    });
    const W = () => {
      _ = null;
    };
    C(D, "pointerup", W), C(D, "pointercancel", W), C(D, "lostpointercapture", W), C(D, "keydown", (z) => {
      if (!v || z.target !== D || !z.key.startsWith("Arrow")) return;
      z.preventDefault();
      const K = I(s[k]), re = z.shiftKey ? 32 : 8;
      E(k, !1), s[k].style.width = K.w + "px", s[k].style.height = K.h + "px", O(s[k], K.x + ({ ArrowLeft: -re, ArrowRight: re }[z.key] || 0), K.y + ({ ArrowUp: -re, ArrowDown: re }[z.key] || 0));
    });
  }
  C(document, "fullscreenchange", () => {
    v && p && document.fullscreenElement !== n && (p = !1, G());
  }), C(document, "keydown", (k) => {
    v && k.altKey && k.key === "Escape" && (k.preventDefault(), k.stopImmediatePropagation(), X());
  }, { capture: !0 }), C(window, "resize", x);
  const H = new ResizeObserver(x);
  for (const k of Object.values(s)) H.observe(k);
  return { enter: q, exit: X, showPanel: A, reset: y, destroy() {
    X(), o.abort(), H.disconnect();
  } };
}
const jt = (n, e) => encodeURIComponent(n) + ":" + e;
function Vt(n) {
  if (n === void 0) return;
  if (!Array.isArray(n) || n.length > 2e4) throw Error("Invalid project: invalid label overrides.");
  const e = /* @__PURE__ */ new Set();
  for (const o of n) {
    if (!o || typeof o.owner != "string" || !Number.isSafeInteger(o.index) || o.index < 0 || o.id !== jt(o.owner, o.index) || e.has(o.id) || typeof o.text != "string" || o.text.length > 2e4 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(o.text) || ![o.x, o.y].every((s) => Number.isFinite(s) && Math.abs(s) <= 1e6)) throw Error("Invalid project: invalid label identity, text or position.");
    e.add(o.id);
    const r = o.orientation;
    if (!Array.isArray(r) || r.length !== 4 || !r.every((s) => [-1, 0, 1].includes(s)) || r[0] ** 2 + r[1] ** 2 !== 1 || r[2] ** 2 + r[3] ** 2 !== 1 || r[0] * r[2] + r[1] * r[3] !== 0) throw Error("Invalid project: label transform must be a rotation or mirror.");
  }
}
function no(n, e) {
  const o = { rotate: [0, 1, -1, 0], "mirror-x": [1, 0, 0, -1], "mirror-y": [-1, 0, 0, 1] }[e];
  if (!o) throw Error("Unknown label transform.");
  const r = n.orientation;
  return { ...n, orientation: [o[0] * r[0] + o[2] * r[1], o[1] * r[0] + o[3] * r[1], o[0] * r[2] + o[2] * r[3], o[1] * r[2] + o[3] * r[3]].map((s) => s || 0) };
}
const oo = "http://www.w3.org/2000/svg";
function Qt(n) {
  const e = /* @__PURE__ */ new Map();
  return [...n.querySelectorAll("text")].filter((o) => !o.closest("defs")).map((o) => {
    const r = o.closest('g[id^="cell_"]')?.id.slice(5) || "", s = e.get(r) || 0;
    return e.set(r, s + 1), { node: o, owner: r, index: s, id: jt(r, s) };
  });
}
function Ft(n, e) {
  Vt(e);
  const o = new Set(Qt(n).map((r) => r.id));
  for (const r of e || []) if (!o.has(r.id)) throw Error("Invalid project: unknown label " + r.id);
}
function ro() {
  let n = null, e = /* @__PURE__ */ new Map(), o = [], r = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), d = !1, l = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  const c = (g, m) => {
    const _ = document.createElementNS(oo, g);
    for (const [N, E] of Object.entries(m)) _.setAttribute(N, E);
    return _;
  };
  function u() {
    for (const g of e.values()) if (g.node.isConnected) {
      for (const m of [...g.node.attributes]) g.node.removeAttribute(m.name);
      for (const [m, _] of g.attributes) g.node.setAttribute(m, _);
      g.node.textContent = g.text;
    }
    n?.querySelector("[data-label-hit-layer]")?.remove(), e.clear(), o = [];
  }
  function f(g) {
    const m = g.getBBox(), _ = n.getCTM().inverse().multiply(g.getCTM()), N = [[m.x, m.y], [m.x + m.width, m.y], [m.x, m.y + m.height], [m.x + m.width, m.y + m.height]].map(([C, A]) => new DOMPoint(C, A).matrixTransform(_)), E = Math.min(...N.map((C) => C.x)), w = Math.min(...N.map((C) => C.y));
    return { x: E, y: w, width: Math.max(...N.map((C) => C.x)) - E, height: Math.max(...N.map((C) => C.y)) - w };
  }
  function v(g, m) {
    g.node.textContent = m.text;
    const _ = g.node.getBBox(), [N, E, w, C] = m.orientation, A = r.get(m.owner) || { x: 0, y: 0 }, S = [0, N * _.width, w * _.height, N * _.width + w * _.height], I = [0, E * _.width, C * _.height, E * _.width + C * _.height], O = new DOMMatrix([N, E, w, C, A.x + m.x - Math.min(...S) - N * _.x - w * _.y, A.y + m.y - Math.min(...I) - E * _.x - C * _.y]), P = n.getCTM().inverse().multiply(g.node.parentElement.getCTM()), x = new DOMMatrix([P.a, P.b, P.c, P.d, P.e, P.f]), y = x.inverse().multiply(O);
    g.node.setAttribute("transform", "matrix(" + [y.a, y.b, y.c, y.d, y.e, y.f].join(" ") + ")");
  }
  function p() {
    if (n?.querySelector("[data-label-hit-layer]")?.remove(), a.clear(), !d || !n) return;
    const g = c("g", { "data-label-hit-layer": "true", "data-editor-overlay": "true" });
    for (const _ of o) {
      const N = c("rect", { x: _.x - 2, y: _.y - 2, width: Math.max(8, _.width) + 4, height: Math.max(12, _.height) + 4, fill: l.has(_.id) ? "#507d9c" : "transparent", "fill-opacity": l.has(_.id) ? 0.12 : 0, stroke: "#507d9c", "stroke-opacity": l.has(_.id) ? 1 : 0.35, "stroke-width": l.has(_.id) ? 1.5 : 0.7, "stroke-dasharray": l.has(_.id) ? "none" : "3 3", "vector-effect": "non-scaling-stroke", "pointer-events": "all", "data-editor-label": _.id, ...l.has(_.id) ? { "data-selected-label": _.id } : {} });
      a.set(_.id, N), g.append(N);
    }
    const m = n.querySelector("[data-airwires]");
    m ? n.insertBefore(g, m) : n.append(g);
  }
  return {
    reset: u,
    layout(g, m, _, N, E) {
      n = g, r = new Map(m.map((w) => [w.id, w])), s = new Map((_ || []).map((w) => [w.id, w])), d = N, l = E, e.clear(), o = [];
      for (const w of Qt(n)) {
        const C = f(w.node), A = r.get(w.owner) || { x: 0, y: 0 }, S = { ...w, attributes: [...w.node.attributes].map((O) => [O.name, O.value]), text: w.node.textContent, record: { id: w.id, owner: w.owner, index: w.index, text: w.node.textContent, x: C.x - A.x, y: C.y - A.y, orientation: [1, 0, 0, 1] } };
        e.set(w.id, S);
        const I = s.get(w.id);
        I && v(S, I), w.node.dataset.labelId = w.id, o.push({ id: w.id, ...f(w.node), ports: [] });
      }
      return p(), { x: Math.min(0, ...o.map((w) => w.x)), y: Math.min(0, ...o.map((w) => w.y)), right: Math.max(0, ...o.map((w) => w.x + w.width)), bottom: Math.max(0, ...o.map((w) => w.y + w.height)) };
    },
    nodes: () => o,
    record(g) {
      const m = e.get(g);
      if (!m) throw Error("Label no longer exists.");
      return structuredClone(s.get(g) || m.record);
    },
    preview(g) {
      const m = new Set(g.map((_) => _.id));
      for (const _ of g) {
        const N = e.get(_.id);
        if (N) {
          const E = this.record(_.id);
          v(N, { ...E, x: E.x + _.dx, y: E.y + _.dy });
        }
      }
      o = o.map((_) => {
        if (!m.has(_.id)) return _;
        const N = { ..._, ...f(e.get(_.id).node) }, E = a.get(_.id);
        if (E) for (const [w, C] of Object.entries({ x: N.x - 2, y: N.y - 2, width: Math.max(8, N.width) + 4, height: Math.max(12, N.height) + 4 })) E.setAttribute(w, C);
        return N;
      });
    }
  };
}
const oe = 1e-3, ne = (n) => Math.round(n.x * 1e3) + "," + Math.round(n.y * 1e3), ie = (n, e) => Math.abs(n - e) < oe, xe = (n, e) => ie(e.a.x, e.b.x) ? ie(n.x, e.a.x) && n.y >= Math.min(e.a.y, e.b.y) - oe && n.y <= Math.max(e.a.y, e.b.y) + oe : ie(n.y, e.a.y) && n.x >= Math.min(e.a.x, e.b.x) - oe && n.x <= Math.max(e.a.x, e.b.x) + oe, io = (n) => Math.abs(n.a.x - n.b.x) + Math.abs(n.a.y - n.b.y), so = (n, e) => Math.max(n.a.x, n.b.x) > e.x + oe && Math.min(n.a.x, n.b.x) < e.x + e.width - oe && Math.max(n.a.y, n.b.y) > e.y + oe && Math.min(n.a.y, n.b.y) < e.y + e.height - oe;
function Ze(n) {
  const e = [];
  for (const o of n)
    if (!(e.length && ne(e.at(-1)) === ne(o))) {
      for (; e.length > 1 && (ie(e.at(-2).x, e.at(-1).x) && ie(e.at(-1).x, o.x) || ie(e.at(-2).y, e.at(-1).y) && ie(e.at(-1).y, o.y)); ) e.pop();
      e.push({ ...o });
    }
  return e;
}
class Gt {
  constructor(e, { step: o = 8, segments: r = e.segments } = {}) {
    this.step = o, this.components = structuredClone(e.components), this.segments = structuredClone(r), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
  }
  pins() {
    return this.pinCache || (this.pinCache = this.components.flatMap((e) => e.ports.map((o) => ({ ...o, owner: e.id, id: e.id + "." + o.pin }))));
  }
  snapshot() {
    return structuredClone({ components: this.components, segments: this.segments, ...this.labelOverrides?.length ? { labelOverrides: this.labelOverrides } : {} });
  }
  restore(e) {
    this.components = structuredClone(e.components), this.segments = structuredClone(e.segments), this.labelOverrides = structuredClone(e.labelOverrides || []), this.cache = null, this.pinCache = null;
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
  validSegment(e, o) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !ie(e.a.x, e.b.x) && !ie(e.a.y, e.b.y)) return !1;
    const r = this.pins();
    if (r.some((s) => s.bit !== o && xe(s, e)) || this.segments.some((s) => s.bit !== o && (xe(e.a, s) || xe(e.b, s) || xe(s.a, e) || xe(s.b, e)))) return !1;
    for (const s of this.components) if (so(e, s) && !r.filter((l) => l.owner === s.id && l.bit === o).some((l) => l.side === "NORTH" ? ie(e.a.x, l.x) && ie(e.b.x, l.x) && Math.max(e.a.y, e.b.y) <= l.y + oe : l.side === "SOUTH" ? ie(e.a.x, l.x) && ie(e.b.x, l.x) && Math.min(e.a.y, e.b.y) >= l.y - oe : l.side === "WEST" ? ie(e.a.y, l.y) && ie(e.b.y, l.y) && Math.max(e.a.x, e.b.x) <= l.x + oe : l.side === "EAST" ? ie(e.a.y, l.y) && ie(e.b.y, l.y) && Math.min(e.a.x, e.b.x) >= l.x - oe : !1))
      return !1;
    return !0;
  }
  addPath(e, o) {
    const r = Ze(o), s = r.slice(1).map((d, l) => ({ bit: e, a: r[l], b: d })).filter((d) => io(d) > oe);
    if (!s.length) return !1;
    if (s.some((d) => !this.validSegment(d, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...s), !0;
  }
  move(e, o, r) {
    if (o = Math.round(o / this.step) * this.step, r = Math.round(r / this.step) * this.step, !o && !r) return;
    const s = this.snapshot(), d = this.components.find((c) => c.id === e);
    if (!d) return;
    const l = d.ports.map((c) => ({ ...c }));
    this.segments = this.segments.filter((c) => !l.some((u) => u.bit === c.bit && (ne(u) === ne(c.a) || ne(u) === ne(c.b)))), d.x += o, d.y += r;
    for (const c of d.ports)
      c.x += o, c.y += r;
    if (this.pinCache = null, this.components.some((c) => c !== d && d.x < c.x + c.width - oe && d.x + d.width > c.x + oe && d.y < c.y + c.height - oe && d.y + d.height > c.y + oe) || this.segments.some((c) => !this.validSegment(c, c.bit)) || d.ports.some((c) => this.pins().some((u) => u.owner !== e && u.bit !== c.bit && ne(u) === ne(c))))
      throw this.restore(s), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(s);
  }
  moveMany(e) {
    const o = new Map(e.map((c) => [c.id, { dx: Math.round(c.dx / this.step) * this.step, dy: Math.round(c.dy / this.step) * this.step }]).filter(([, c]) => c.dx || c.dy)), r = this.components.filter((c) => o.has(c.id));
    if (!r.length) return !1;
    const s = this.snapshot(), d = r.flatMap((c) => c.ports);
    this.segments = this.segments.filter((c) => !d.some((u) => u.bit === c.bit && xe(u, c)));
    for (const c of r) {
      const u = o.get(c.id);
      c.x += u.dx, c.y += u.dy;
      for (const f of c.ports)
        f.x += u.dx, f.y += u.dy;
    }
    this.pinCache = null, this.cache = null;
    const l = this.pins();
    if (r.some((c) => this.components.some((u) => u !== c && c.x < u.x + u.width - oe && c.x + c.width > u.x + oe && c.y < u.y + u.height - oe && c.y + c.height > u.y + oe)) || l.some((c) => !this.onGrid(c) || l.some((u) => u.owner !== c.owner && u.bit !== c.bit && ne(u) === ne(c))) || this.segments.some((c) => !this.validSegment(c, c.bit)))
      throw this.restore(s), Error("Arrangement blocked: a component or another node occupies the target position.");
    return this.remember(s), !0;
  }
  transform(e, o) {
    const r = this.components.find((p) => p.id === e);
    if (!r) return;
    const s = this.snapshot(), d = r.width, l = r.height, a = o === "rotate" ? [0, 1, -1, 0, l, 0] : o === "mirror-x" ? [1, 0, 0, -1, 0, l] : o === "mirror-y" ? [-1, 0, 0, 1, d, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const c = r.ports.map((p) => ({ ...p })), u = (p) => ({ x: a[0] * p.x + a[2] * p.y + a[4], y: a[1] * p.x + a[3] * p.y + a[5] });
    this.segments = this.segments.filter((p) => !c.some((g) => g.bit === p.bit && (ne(g) === ne(p.a) || ne(g) === ne(p.b))));
    const f = o === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : o === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const p of r.ports) {
      const g = u({ x: p.x - r.x, y: p.y - r.y });
      p.x = r.x + g.x, p.y = r.y + g.y, p.side = f[p.side] || p.side;
    }
    const v = r.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (r.editorMatrix = [a[0] * v[0] + a[2] * v[1], a[1] * v[0] + a[3] * v[1], a[0] * v[2] + a[2] * v[3], a[1] * v[2] + a[3] * v[3], a[0] * v[4] + a[2] * v[5] + a[4], a[1] * v[4] + a[3] * v[5] + a[5]], o === "rotate" && (r.width = l, r.height = d), this.pinCache = null, r.ports.some((p) => !this.onGrid(p)) || this.components.some((p) => p !== r && r.x < p.x + p.width - oe && r.x + r.width > p.x + oe && r.y < p.y + p.height - oe && r.y + r.height > p.y + oe) || this.segments.some((p) => !this.validSegment(p, p.bit)) || r.ports.some((p) => this.pins().some((g) => g.owner !== e && g.bit !== p.bit && ne(g) === ne(p))))
      throw this.restore(s), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(s);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const r of this.pins())
      e.has(r.bit) || e.set(r.bit, { pins: [], segments: [] }), e.get(r.bit).pins.push(r);
    for (const r of this.segments)
      e.has(r.bit) || e.set(r.bit, { pins: [], segments: [] }), e.get(r.bit).segments.push(r);
    const o = [];
    for (const [r, s] of e) {
      const d = /* @__PURE__ */ new Map(), l = (f) => {
        d.has(ne(f)) || d.set(ne(f), f);
      };
      s.pins.forEach(l);
      for (const f of s.segments)
        l(f.a), l(f.b);
      for (let f = 0; f < s.segments.length; f++) for (let v = f + 1; v < s.segments.length; v++) {
        const p = s.segments[f], g = s.segments[v];
        if (ie(p.a.x, p.b.x) === ie(g.a.x, g.b.x)) continue;
        const m = ie(p.a.x, p.b.x) ? p : g, _ = m === p ? g : p, N = { x: m.a.x, y: _.a.y };
        xe(N, m) && xe(N, _) && l(N);
      }
      const a = new Map([...d.keys()].map((f) => [f, f])), c = (f) => {
        let v = f;
        for (; a.get(v) !== v; ) v = a.get(v);
        for (; f !== v; ) {
          const p = a.get(f);
          a.set(f, v), f = p;
        }
        return v;
      };
      for (const f of s.segments) {
        const v = [...d.values()].filter((p) => xe(p, f));
        for (const p of v.slice(1)) a.set(c(ne(p)), c(ne(v[0])));
      }
      const u = /* @__PURE__ */ new Map();
      for (const f of s.pins) {
        const v = c(ne(f));
        u.has(v) || u.set(v, { pins: [], points: [] }), u.get(v).pins.push(f);
      }
      for (const f of d.values()) {
        const v = c(ne(f));
        u.has(v) && u.get(v).points.push(f);
      }
      o.push({ bit: r, islands: [...u.values()], points: [...d.values()], segments: s.segments });
    }
    return this.cache = o, o;
  }
  airwires() {
    const e = [];
    for (const { bit: o, islands: r } of this.connectivity()) {
      if (r.length < 2) continue;
      const s = /* @__PURE__ */ new Set([0]);
      for (; s.size < r.length; ) {
        let d;
        for (const l of s) for (let a = 0; a < r.length; a++) if (!s.has(a)) for (const c of r[l].points) for (const u of r[a].points) {
          const f = (c.x - u.x) ** 2 + (c.y - u.y) ** 2;
          (!d || f < d.d) && (d = { bit: o, a: c, b: u, d: f, j: a });
        }
        e.push(d), s.add(d.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], o = [-20, this.base.height + 20];
    for (const d of this.components)
      e.push(d.x - 20, d.x + d.width + 20), o.push(d.y - 20, d.y + d.height + 20);
    for (const d of this.segments)
      e.push(d.a.x - 20, d.b.x + 20), o.push(d.a.y - 20, d.b.y + 20);
    const r = Math.min(...e), s = Math.min(...o);
    return { x: r, y: s, w: Math.max(...e) - r, h: Math.max(...o) - s };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((o) => !o.decoration)), segments: structuredClone(this.segments), ...this.labelOverrides?.length ? { labelOverrides: structuredClone(this.labelOverrides) } : {} };
  }
  findPath(e, o, r) {
    if (!this.onGrid(o) || !this.onGrid(r)) return null;
    const s = (S) => S.slice(1).every((I, O) => this.validSegment({ a: S[O], b: I }, e));
    for (const S of [[o, r], [o, { x: r.x, y: o.y }, r], [o, { x: o.x, y: r.y }, r]]) {
      const I = Ze(S);
      if (s(I)) return I;
    }
    const d = this.step, l = this.bounds(), a = Math.floor(Math.min(l.x, o.x, r.x) / d) - 5, c = Math.ceil(Math.max(l.x + l.w, o.x, r.x) / d) + 5, u = Math.floor(Math.min(l.y, o.y, r.y) / d) - 5, f = Math.ceil(Math.max(l.y + l.h, o.y, r.y) / d) + 5, v = { x: o.x / d, y: o.y / d, dir: -1, cost: 0, key: o.x / d + "," + o.y / d + ",-1" }, p = [v], g = /* @__PURE__ */ new Map([[v.key, 0]]), m = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map([[v.key, v]]), N = [[1, 0], [-1, 0], [0, 1], [0, -1]], E = (S) => Math.abs(S.x - r.x / d) + Math.abs(S.y - r.y / d);
    let w = null, C = 0;
    for (; p.length && C++ < 3e4; ) {
      let S = 0;
      for (let O = 1; O < p.length; O++) p[O].cost + E(p[O]) < p[S].cost + E(p[S]) && (S = O);
      const I = p.splice(S, 1)[0];
      if (I.cost === g.get(I.key)) {
        if (I.x === r.x / d && I.y === r.y / d) {
          w = I;
          break;
        }
        for (let O = 0; O < 4; O++) {
          const P = I.x + N[O][0], x = I.y + N[O][1];
          if (P < a || P > c || x < u || x > f) continue;
          const y = { x: P, y: x, dir: O, key: P + "," + x + "," + O, cost: I.cost + 1 + (I.dir !== -1 && I.dir !== O ? 3 : 0) };
          y.cost >= (g.get(y.key) ?? 1 / 0) || !this.validSegment({ a: { x: I.x * d, y: I.y * d }, b: { x: P * d, y: x * d } }, e) || (g.set(y.key, y.cost), m.set(y.key, I.key), _.set(y.key, y), p.push(y));
        }
      }
    }
    if (!w) return null;
    const A = [];
    for (let S = w; S; S = _.get(m.get(S.key))) A.push({ x: S.x * d, y: S.y * d });
    return Ze(A.reverse());
  }
  async autoRoute(e = () => !1) {
    const o = this.snapshot();
    if (this.remember(o), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const r = /* @__PURE__ */ new Set();
    let s = 0;
    for (; !e() && s++ < Math.max(20, this.pins().length * 2); ) {
      const d = this.airwires().find((a) => !r.has(a.bit + ":" + ne(a.a) + ":" + ne(a.b)));
      if (!d) break;
      const l = this.findPath(d.bit, d.a, d.b);
      l ? (this.segments.push(...l.slice(1).map((a, c) => ({ bit: d.bit, a: l[c], b: a }))), this.cache = null) : r.add(d.bit + ":" + ne(d.a) + ":" + ne(d.b)), s % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const Ht = "spice-viewer-project", Wt = 2, qt = 32 * 1024 * 1024, te = (n) => {
  throw Error("Invalid project: " + n);
}, ve = (n) => n && typeof n == "object" && !Array.isArray(n), Ie = (n) => Number.isFinite(n) && Math.abs(n) <= 1e6, De = (n) => ve(n) && Ie(n.x) && Ie(n.y), Ne = (n, e) => Math.abs(n - e) < 1e-3, lt = (n, e, o) => JSON.stringify([n, e, { font: o.font, fontSize: o.fontSize, color: o.color, gridSize: o.gridSize, detailed: o.detailed, conventional: o.conventional }]);
function It(n) {
  return ve(n) && De(n) && Ie(n.w) && Ie(n.h) && n.w > 0 && n.h > 0;
}
function At(n) {
  (!ve(n) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(n.font) || !Number.isInteger(n.fontSize) || n.fontSize < 8 || n.fontSize > 24 || ![0, 4].includes(n.gridSize) || typeof n.detailed != "boolean" || typeof n.conventional != "boolean" || n.color !== "#292b29") && te("unsupported drawing settings.");
}
function zt(n) {
  new TextEncoder().encode(n).length > qt && te("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(n);
  } catch {
    te("expected a JSON project file.");
  }
  (!ve(e) || e.format !== Ht) && te("unrecognized file format."), [1, Wt].includes(e.version) || te("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Be && te("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && te("missing netlist or sheet."), (!ve(e.libraries) || Object.entries(e.libraries).some(([r, s]) => !r || ["__proto__", "constructor", "prototype"].includes(r) || typeof s != "string")) && te("invalid libraries."), At(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((r) => typeof e[r] != "boolean") || !It(e.view)) && te("invalid display settings."), e.labelEditing !== void 0 && typeof e.labelEditing != "boolean" && te("invalid label editing mode."), (!ve(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((r) => !Array.isArray(e.colors[r]) || e.colors[r].some((s) => !Array.isArray(s) || s.length !== 2 || typeof s[0] != "string" || !/^#[\da-f]{6}$/i.test(s[1])))) && te("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && te("invalid saved sheets.");
  const o = /* @__PURE__ */ new Set();
  for (const r of e.sheets) {
    (!ve(r) || typeof r.scope != "string" || typeof r.topology != "string") && te("invalid sheet identity."), At(r.settings);
    const s = lt(r.scope, r.topology, r.settings);
    o.has(s) && te("duplicate sheet."), o.add(s), (r.settings.gridSize !== 4 || !r.settings.conventional) && te("saved manual scenes require the fixed 4-unit grid."), r.view !== void 0 && !It(r.view) && te("invalid sheet viewport."), Xt(r.snapshot);
  }
  return e;
}
function ao(n) {
  const e = { ...n, format: Ht, version: Wt, layoutRulesVersion: Be, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, o = JSON.stringify(e, null, 2);
  return zt(o), o;
}
function Xt(n) {
  (!ve(n) || !Array.isArray(n.components) || !Array.isArray(n.segments) || n.components.length > 1e4 || n.segments.length > 5e4) && te("invalid scene size."), Vt(n.labelOverrides);
  const e = /* @__PURE__ */ new Set();
  for (const o of n.components) {
    (!ve(o) || typeof o.id != "string" || e.has(o.id) || !De(o) || !Ie(o.width) || !Ie(o.height) || o.width < 0 || o.height < 0 || !Array.isArray(o.ports) || o.ports.length > 2e3) && te("invalid component geometry."), e.add(o.id);
    const r = /* @__PURE__ */ new Set();
    for (const s of o.ports)
      (!De(s) || typeof s.pin != "string" || r.has(s.pin) || !Number.isInteger(s.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(s.side)) && te("invalid pin."), r.add(s.pin);
    o.editorMatrix !== void 0 && (!Array.isArray(o.editorMatrix) || o.editorMatrix.length !== 6 || !o.editorMatrix.every(Ie)) && te("invalid symbol transform.");
  }
  for (const o of n.segments) (!ve(o) || !Number.isInteger(o.bit) || !De(o.a) || !De(o.b) || !Ne(o.a.x, o.b.x) && !Ne(o.a.y, o.b.y)) && te("wire must be orthogonal.");
}
function $t(n, e, o) {
  Xt(e);
  const r = new Map(n.components.map((c) => [c.id, c]));
  r.size !== e.components.length && te("component count changed.");
  const s = e.components.map((c) => {
    const u = r.get(c.id);
    (!u || !!u.decoration != !!c.decoration || u.ports.length !== c.ports.length) && te("component identity changed: " + c.id);
    const f = c.editorMatrix || [1, 0, 0, 1, 0, 0], [v, p, g, m] = f;
    (![v, p, g, m].every((E) => [-1, 0, 1].includes(E)) || v * v + p * p !== 1 || g * g + m * m !== 1 || v * g + p * m !== 0) && te("symbol transform must be a rotation or mirror.");
    const _ = [[0, 0], [u.width, 0], [0, u.height], [u.width, u.height]].map(([E, w]) => ({ x: v * E + g * w + f[4], y: p * E + m * w + f[5] }));
    (!Ne(Math.min(..._.map((E) => E.x)), 0) || !Ne(Math.min(..._.map((E) => E.y)), 0) || !Ne(Math.max(..._.map((E) => E.x)), c.width) || !Ne(Math.max(..._.map((E) => E.y)), c.height)) && te("symbol dimensions changed: " + c.id);
    const N = c.ports.map((E) => {
      const w = u.ports.find((S) => S.pin === E.pin);
      (!w || w.bit !== E.bit || !Ne(E.x, c.x + v * (w.x - u.x) + g * (w.y - u.y) + f[4]) || !Ne(E.y, c.y + p * (w.x - u.x) + m * (w.y - u.y) + f[5])) && te("pin connectivity or position changed: " + c.id + "." + E.pin);
      const C = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[w.side], A = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, S]) => S[0] === v * C[0] + g * C[1] && S[1] === p * C[0] + m * C[1])?.[0];
      return E.side !== A && te("pin direction changed."), { ...w, x: E.x, y: E.y, side: A };
    });
    return { ...u, x: c.x, y: c.y, width: c.width, height: c.height, ports: N, ...c.editorMatrix ? { editorMatrix: [...f] } : {} };
  }), d = new Gt({ ...n, components: s, segments: e.segments }, { step: o });
  for (let c = 0; c < s.length; c++) for (let u = c + 1; u < s.length; u++) {
    const f = s[c], v = s[u];
    f.x < v.x + v.width - 1e-3 && f.x + f.width > v.x + 1e-3 && f.y < v.y + v.height - 1e-3 && f.y + f.height > v.y + 1e-3 && te("component symbols overlap.");
  }
  const l = new Set(d.pins().map((c) => c.bit));
  (d.pins().some((c) => !d.onGrid(c)) || d.segments.some((c) => !l.has(c.bit) || !d.validSegment(c, c.bit))) && te("off-grid wire, symbol collision or short circuit.");
  const a = /* @__PURE__ */ new Map();
  for (const c of d.pins()) {
    const u = c.x + "," + c.y;
    a.has(u) && a.get(u) !== c.bit && te("different nodes share a pin position."), a.set(u, c.bit);
  }
  return { ...d.snapshot(), ...e.labelOverrides?.length ? { labelOverrides: structuredClone(e.labelOverrides) } : {} };
}
const pt = (n) => !n.decoration || n.selectable === !0;
function Tt(n, e, o) {
  const r = Math.min(e.x, o.x), s = Math.max(e.x, o.x), d = Math.min(e.y, o.y), l = Math.max(e.y, o.y), a = o.x < e.x, c = 1e-3;
  return n.filter((u) => pt(u) && (a ? u.x <= s + c && u.x + u.width >= r - c && u.y <= l + c && u.y + u.height >= d - c : u.x >= r - c && u.x + u.width <= s + c && u.y >= d - c && u.y + u.height <= l + c)).map((u) => u.id);
}
function lo(n, e, o, r) {
  const s = new Set(e), d = n.filter((N) => s.has(N.id) && pt(N)), l = o.startsWith("space-");
  if (d.length < (l ? 3 : 2)) throw Error(l ? "Select at least three components." : "Select at least two components.");
  const a = ["left", "right", "center-x", "space-x"].includes(o), c = ["top", "bottom", "center-y", "space-y"].includes(o);
  if (!a && !c) throw Error("Unknown arrangement.");
  const u = a ? "x" : "y", f = a ? "width" : "height", v = Math.min(...d.map((N) => N[u])), p = Math.max(...d.map((N) => N[u] + N[f])), g = /* @__PURE__ */ new Map();
  if (l) {
    const N = [...d].sort((S, I) => S[u] - I[u] || S.id.localeCompare(I.id)), E = N.at(-1), w = E[u] + E[f] - N[0][u], C = (w - N.reduce((S, I) => S + I[f], 0)) / (d.length - 1);
    if (C < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let A = N[0][u];
    for (const S of N)
      g.set(S.id, A), A += S[f] + C;
  } else for (const N of d) g.set(N.id, ["left", "top"].includes(o) ? v : ["right", "bottom"].includes(o) ? p - N[f] : (v + p - N[f]) / 2);
  let m = !1;
  return { moves: d.map((N) => {
    const E = g.get(N.id) - N[u], w = Math.round(E / r) * r;
    return Math.abs(w - E) > 1e-3 && (m = !0), { id: N.id, dx: a ? w : 0, dy: c ? w : 0 };
  }), rounded: m };
}
const co = "http://www.w3.org/2000/svg", ae = (n, e = {}) => {
  const o = document.createElementNS(co, n);
  for (const [r, s] of Object.entries(e)) o.setAttribute(r, s);
  return o;
}, uo = (n, e) => Math.abs(n.x - e.x) < 1e-3 && Math.abs(n.y - e.y) < 1e-3;
function Yt(n, e, o, r) {
  const s = structuredClone(e);
  for (const a of s.components) {
    const c = n.getElementById("cell_" + a.id);
    for (const u of a.ports) {
      const f = [...c.children].find((v) => v.getAttribute("s:pid") === u.pin);
      u.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[f?.getAttribute("s:position")] || u.side;
    }
  }
  for (const [a, c] of Object.entries(r.modules.circuit.cells)) if (c.attributes.name === "0") {
    const u = n.getElementById("cell_" + a), f = u?.transform.baseVal.consolidate().matrix;
    u && f && s.components.push({ id: a, decoration: !0, selectable: !0, x: f.e, y: f.f, width: +u.getAttribute("s:width"), height: +u.getAttribute("s:height"), ports: [...u.children].filter((v) => v.hasAttribute("s:pid")).map((v) => ({ pin: v.getAttribute("s:pid"), x: f.e + Number(v.getAttribute("s:x")), y: f.f + Number(v.getAttribute("s:y")), bit: c.connections[v.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const d = new Map(Object.values(o.nodes).map((a) => [a.name, a.bit])), l = [...n.children].filter((a) => a.localName === "line" && a.hasAttribute("data-net")).map((a) => ({ bit: d.get(a.dataset.net), a: { x: +a.getAttribute("x1"), y: +a.getAttribute("y1") }, b: { x: +a.getAttribute("x2"), y: +a.getAttribute("y2") } }));
  return { ...s, segments: l };
}
function fo(n, e, { changed: o, inspect: r, getNetColor: s, report: d }) {
  let l = null, a = null, c = !1, u = !1, f = null, v = null, p = null, g = null, m = /* @__PURE__ */ new Set(), _ = 0, N = "", E = 8, w = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), S = !1, I = null, O = null, P = null, x = null, y = "";
  const L = ro(), G = (t) => new DOMPoint(t.clientX, t.clientY).matrixTransform(a.getScreenCTM().inverse()), q = (t) => l.snap(G(t)), X = (t) => s?.(t) || ze[Number(t) % ze.length], H = (t, { severity: b = "info", log: h = !0 } = {}) => {
    e("editor-status").textContent = t, h && d?.({ message: t, severity: b, category: "Tools" });
  };
  function k() {
    return { unrouted: l?.airwires().length || 0, wires: l?.segments.length || 0, editing: c, routing: u, selectedComponents: S ? [] : [...m], selectedLabels: S ? [...m] : [], labelEditing: S };
  }
  function D(t) {
    if (!t.length) return !1;
    if (!S) return !0;
    const b = t.at(-1);
    return JSON.stringify(b.components) === JSON.stringify(l.components) && JSON.stringify(b.segments) === JSON.stringify(l.segments);
  }
  function W() {
    const t = !!l;
    for (const b of ["interactive", "flywire", "auto-route"]) e(b).disabled = !a || u || S && b !== "interactive";
    e("label-edit").disabled = !a || u, e("label-edit").setAttribute("aria-pressed", String(c && S)), e("edit-tool").disabled = !t || u;
    for (const b of document.querySelectorAll("[data-editor-mode]"))
      b.disabled = !a || u || S && ["route", "erase"].includes(b.dataset.editorMode), b.setAttribute("aria-pressed", String(c && b.dataset.editorMode === e("edit-tool").value));
    for (const b of document.querySelectorAll("[data-editor-arrange]")) b.disabled = !c || !t || u || m.size < (b.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !t || u || !D(l.undoStack), e("wire-redo").disabled = !t || u || !D(l.redoStack), n.classList.toggle("spice-editing", c), n.dataset.toolMode = c ? e("edit-tool").value : "none", n.dataset.labelEditing = String(c && S);
  }
  function z(t, b) {
    const h = A.get(t.id);
    if (h && (b.replaceChildren(...h.children.map((T) => T.cloneNode(!0))), t.editorMatrix)) {
      const T = t.editorMatrix, Q = ae("g", { transform: "matrix(" + T.join(" ") + ")", "data-editor-glyph": "true" });
      Q.append(...b.childNodes);
      for (const U of Q.querySelectorAll("text")) U.remove();
      b.append(Q);
      for (const [U, V] of h.labels.entries()) {
        const F = V.node.cloneNode(!0);
        F.removeAttribute("transform");
        let Z = T[0] * V.x + T[2] * V.y + T[4], $ = T[1] * V.x + T[3] * V.y + T[5];
        if (t.ports.length === 2 && h.labels.length === 2) {
          const j = Math.abs(t.ports[0].y - t.ports[1].y) < 1e-3;
          Z = j ? t.width / 2 : t.ports[0].x - t.x + 20, $ = j ? t.ports[0].y - t.y - 26 + U * 16 : t.height / 2 - 8 + U * 16, F.setAttribute("text-anchor", j ? "middle" : "start");
        }
        F.setAttribute("x", Z), F.setAttribute("y", $), b.append(F);
      }
    }
  }
  function K(t) {
    if (P = null, f = null, p = null, v = null, I = null, O = null, S && ["route", "erase"].includes(t)) {
      H("Components and wires are locked in label mode.", { severity: "warning" });
      return;
    }
    if (S && ["rotate", "mirror-x", "mirror-y"].includes(t) && m.size) {
      be([...m].map((b) => no(L.record(b), t))), H(t + " applied to " + m.size + " label(s).");
      return;
    }
    if (["rotate", "mirror-x", "mirror-y"].includes(t) && m.size === 1) {
      try {
        l.transform([...m][0], t), ee(), H(t + " applied to " + [...m][0] + ".");
      } catch (b) {
        H(b.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = t, l ? (ee(), H("Tool: " + t + ".")) : W();
  }
  function re() {
    if (!l) return;
    const t = k();
    H(`${m.size ? m.size + " selected · " : ""}${t.unrouted} connection${t.unrouted === 1 ? "" : "s"} unrouted · ${t.wires} wire segments${u ? " · Auto-routing…" : ""}`, { log: !1 }), W(), o(l.drawing(), t, l.bounds()), C.set(N, l.snapshot());
  }
  function Y(t) {
    const b = a.querySelector("[data-airwires]");
    b ? a.insertBefore(t, b) : a.append(t);
  }
  function de() {
    if (a?.querySelector("[data-route-preview]")?.remove(), a?.querySelector("[data-route-guides]")?.remove(), !a) return;
    if (c && e("edit-tool").value === "route" && g) {
      const h = n.getBoundingClientRect(), T = a.getScreenCTM().inverse(), Q = new DOMPoint(h.left, h.top).matrixTransform(T), U = new DOMPoint(h.right, h.bottom).matrixTransform(T), V = ae("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      V.append(ae("line", { x1: Q.x, y1: g.y, x2: U.x, y2: g.y, "vector-effect": "non-scaling-stroke" }), ae("line", { x1: g.x, y1: Q.y, x2: g.x, y2: U.y, "vector-effect": "non-scaling-stroke" })), Y(V);
    }
    if (!f) return;
    const t = [...f.points];
    if (g) {
      const h = t.at(-1);
      t.push({ x: g.x, y: h.y }, g);
    }
    const b = ae("g", { "data-route-preview": "true", "data-waypoints": f.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    b.append(ae("polyline", { points: t.map((h) => h.x + "," + h.y).join(" "), fill: "none", stroke: X(f.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Y(b);
  }
  function pe() {
    if (a?.querySelector("[data-selection-box]")?.remove(), !p || !a) return;
    const t = p.start, b = p.end, h = b.x < t.x;
    Y(ae("rect", { x: Math.min(t.x, b.x), y: Math.min(t.y, b.y), width: Math.abs(t.x - b.x), height: Math.abs(t.y - b.y), fill: h ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: h ? "#4c9675" : "#507d9c", "stroke-dasharray": h ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": h ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function ee() {
    if (!a || !l) return;
    for (const U of a.querySelectorAll("[data-editor-body-hit]")) U.remove();
    for (const U of [...a.children]) (U.hasAttribute("data-editor-overlay") || U.hasAttribute("data-airwires") || U.hasAttribute("data-manual-state") || U.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(U.localName)) && U.remove();
    for (const U of l.components) {
      const V = a.getElementById("cell_" + U.id);
      V && (V.style.removeProperty("opacity"), z(U, V), V.setAttribute("s:width", U.width), V.setAttribute("s:height", U.height), V.setAttribute("transform", `translate(${U.x},${U.y})`), V.dataset.editorComponent = U.id, c && !S && V.prepend(ae("rect", { x: 0, y: 0, width: U.width, height: U.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const t = a.querySelector('g[id^="cell_"]'), b = ae("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), h = ae("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [U, V] of l.segments.entries()) {
      const F = ae("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, class: "net_" + V.bit, "data-net": w.get(V.bit) || String(V.bit), "stroke-width": 1.4 });
      F.append(ae("title")), F.firstChild.textContent = "Node " + (w.get(V.bit) || V.bit), a.insertBefore(F, t), c && !S && ["route", "erase"].includes(e("edit-tool").value) && b.append(ae("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, "data-editor-wire": U, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const U of l.connectivity()) for (const V of U.points) {
      const F = /* @__PURE__ */ new Set();
      for (const Z of U.segments) xe(V, Z) && (Math.min(Z.a.x, Z.b.x) < V.x - 1e-3 && F.add("w"), Math.max(Z.a.x, Z.b.x) > V.x + 1e-3 && F.add("e"), Math.min(Z.a.y, Z.b.y) < V.y - 1e-3 && F.add("n"), Math.max(Z.a.y, Z.b.y) > V.y + 1e-3 && F.add("s"));
      (F.size >= 3 || F.size >= 2 && U.islands.some((Z) => Z.pins.some(($) => uo(V, $)))) && a.insertBefore(ae("circle", { cx: V.x, cy: V.y, r: 2, class: "net_" + U.bit, "data-net": w.get(U.bit) || String(U.bit), fill: X(U.bit) }), t);
    }
    if (c && !S) {
      for (const U of l.components.filter((V) => m.has(V.id))) b.append(ae("rect", { x: U.x - 3, y: U.y - 3, width: U.width + 6, height: U.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": U.id }));
      for (const U of l.pins()) {
        const V = ae("circle", { cx: U.x, cy: U.y, r: 3, "data-editor-pin": U.id, "data-editor-bit": U.bit, fill: "#fff", stroke: X(U.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": U.owner + " " + U.pin }), F = ae("title");
        F.textContent = U.id + " · " + (w.get(U.bit) || U.bit), V.append(F), h.append(V);
      }
      a.append(b, h);
    }
    de();
    const T = ae("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const U of l.airwires()) T.append(ae("line", { x1: U.a.x, y1: U.a.y, x2: U.b.x, y2: U.b.y, stroke: X(U.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": U.bit, "data-from-owner": U.a.owner || "", "data-to-owner": U.b.owner || "" }));
    a.append(T);
    const Q = ae("metadata", { "data-manual-state": "true" });
    Q.textContent = JSON.stringify({ version: 1, grid: E, unrouted: l.airwires().length, manual: !0 }), a.insertBefore(Q, T), re();
  }
  function ce(t, b) {
    if (!f) {
      f = { bit: b, points: [t], checkpoints: [] }, de(), H("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (b !== void 0 && f.bit !== b) {
      H("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const h = f.points.at(-1), T = l.findPath(f.bit, h, t);
    if (!T) {
      H("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (b === void 0) {
      T.length > 1 && (f.checkpoints.push(f.points.length), f.points.push(...T.slice(1))), de(), H("Waypoint " + f.checkpoints.length + " confirmed.");
      return;
    }
    try {
      l.addPath(b, [...f.points, ...T.slice(1)]), f = null, ee(), H("Connection added.");
    } catch (Q) {
      H(Q.message, { severity: "error" });
    }
  }
  function be(t, b = []) {
    const h = new Map((l.labelOverrides || []).map((T) => [T.id, T]));
    for (const T of b) h.delete(T);
    for (const T of t) h.set(T.id, T);
    if (JSON.stringify([...h.values()]) === JSON.stringify(l.labelOverrides || [])) {
      ee();
      return;
    }
    l.remember(), l.labelOverrides = structuredClone([...h.values()]), ee();
  }
  function fe(t) {
    be(t.map((b) => {
      const h = L.record(b.id);
      return { ...h, x: h.x + b.dx, y: h.y + b.dy };
    }));
  }
  function Ae(t) {
    l && (P = null, S = t, m.clear(), f = null, v = null, p = null, I = null, O = null, e("edit-tool").value = "select", ee(), H(t ? "Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text." : "Label editing disabled."));
  }
  function se(t) {
    if (!l) return;
    const b = t ? l.redoStack : l.undoStack;
    if (!D(b)) {
      H(S ? "No label edit to " + (t ? "redo." : "undo.") : "No edit to " + (t ? "redo." : "undo."));
      return;
    }
    f = null, v = null, p = null, I = null, O = null, t ? l.redo() : l.undo(), ee(), H(t ? "Redo." : "Undo.");
  }
  function we(t) {
    x = null, y = t, e("label-text").value = L.record(t).text, e("label-dialog").showModal(), e("label-text").focus(), e("label-text").select();
  }
  e("close-label").onclick = () => e("label-dialog").close(), e("label-dialog").addEventListener("close", () => n.focus({ preventScroll: !0 })), e("app").addEventListener("spice:workspacechange", () => {
    e("label-dialog").open && e("label-dialog").close();
  }), e("label-form").onsubmit = (t) => {
    t.preventDefault();
    const b = L.record(y), h = e("label-text").value;
    e("label-dialog").close(), be([{ ...b, text: h }]), H("Display text updated. SPICE source unchanged.");
  }, e("label-reset").onclick = () => {
    const t = y;
    e("label-dialog").close(), be([], [t]), H("Label reset to automatic placement and original text.");
  }, n.addEventListener("pointerdown", (t) => {
    if (!S || !c || u || !l || t.button !== 0) return;
    if (t.shiftKey) {
      x = null;
      return;
    }
    x = t.pointerId, t.preventDefault(), t.stopImmediatePropagation(), n.focus({ preventScroll: !0 });
    const b = t.target.closest("[data-editor-label]"), h = b?.getAttribute("data-editor-label"), T = e("edit-tool").value, Q = h && P?.id === h && t.timeStamp - P.time < 450 && Math.hypot(t.clientX - P.x, t.clientY - P.y) < 5;
    if (P = h ? { id: h, time: t.timeStamp, x: t.clientX, y: t.clientY } : null, Q) {
      P = null, I = null, m = /* @__PURE__ */ new Set([h]), ee(), we(h);
      return;
    }
    if (T === "box") {
      O = { start: G(t), end: G(t), additive: t.ctrlKey || t.metaKey }, n.setPointerCapture(t.pointerId), p = O, pe(), p = null;
      return;
    }
    if (!h) {
      m.clear(), ee();
      return;
    }
    if (t.ctrlKey || t.metaKey) {
      m.has(h) ? m.delete(h) : m.add(h), ee();
      return;
    }
    if ((T !== "move" || !m.has(h)) && (m = /* @__PURE__ */ new Set([h])), ["rotate", "mirror-x", "mirror-y"].includes(T)) {
      K(T);
      return;
    }
    ee(), T === "move" && (I = { start: G(t), dx: 0, dy: 0 }, n.setPointerCapture(t.pointerId));
  }, { capture: !0 }), n.addEventListener("pointermove", (t) => {
    if (!(!S || !c || !l) && (O && (t.stopImmediatePropagation(), O.end = G(t), p = O, pe(), p = null), I)) {
      t.stopImmediatePropagation();
      const b = G(t), h = l.snap({ x: b.x - I.start.x, y: b.y - I.start.y });
      I.dx = h.x, I.dy = h.y, (h.x || h.y) && (P = null), L.preview([...m].map((T) => ({ id: T, dx: h.x, dy: h.y })));
    }
  }, { capture: !0 }), n.addEventListener("pointerup", (t) => {
    if (!(!S || x !== t.pointerId)) {
      if (x = null, t.stopImmediatePropagation(), n.hasPointerCapture(t.pointerId) && n.releasePointerCapture(t.pointerId), O) {
        const b = O;
        O = null;
        const h = Tt(L.nodes(), b.start, G(t));
        m = b.additive ? /* @__PURE__ */ new Set([...m, ...h]) : new Set(h), ee(), H(m.size + " label(s) selected.");
      }
      if (I) {
        const b = I;
        I = null, b.dx || b.dy ? (fe([...m].map((h) => ({ id: h, dx: b.dx, dy: b.dy }))), H("Moved " + m.size + " label(s).")) : ee();
      }
    }
  }, { capture: !0 }), n.addEventListener("pointercancel", () => {
    S && (I = null, O = null, ee());
  }), n.addEventListener("dblclick", (t) => {
    if (!S) return;
    t.preventDefault(), t.stopImmediatePropagation();
    const b = G(t), h = t.target.closest("[data-editor-label]")?.getAttribute("data-editor-label") || L.nodes().findLast((T) => b.x >= T.x - 2 && b.x <= T.x + Math.max(8, T.width) + 2 && b.y >= T.y - 2 && b.y <= T.y + Math.max(12, T.height) + 2)?.id;
    h && we(h);
  }, { capture: !0 }), n.addEventListener("pointerdown", (t) => {
    if (S || !c || u || !l || !a || t.button !== 0 || t.shiftKey) return;
    const b = e("edit-tool").value, h = t.target.closest("[data-editor-pin]"), T = t.target.closest("[data-editor-wire]"), Q = h && l.pins().find((F) => F.id === h.dataset.editorPin), U = t.target.closest("[data-editor-component]") || Q && a.getElementById("cell_" + Q.owner), V = U && l.components.find((F) => F.id === U.dataset.editorComponent && pt(F));
    if (b === "box") {
      t.preventDefault(), t.stopImmediatePropagation(), n.focus({ preventScroll: !0 }), p = { start: G(t), end: G(t), additive: t.ctrlKey || t.metaKey }, n.setPointerCapture(t.pointerId), pe();
      return;
    }
    if (b === "route" || b === "erase") {
      if (t.preventDefault(), t.stopImmediatePropagation(), n.focus({ preventScroll: !0 }), g = q(t), b === "erase") {
        T && (l.remove(+T.dataset.editorWire), ee(), H("Wire segment erased."));
        return;
      }
      if (Q) {
        ce({ x: Q.x, y: Q.y }, Q.bit);
        return;
      }
      if (T) {
        const F = l.segments[+T.dataset.editorWire], Z = q(t);
        ce(F.a.x === F.b.x ? { x: F.a.x, y: Z.y } : { x: Z.x, y: F.a.y }, F.bit);
        return;
      }
      f ? ce(q(t)) : de();
      return;
    }
    if (!V) {
      m.size && (m.clear(), ee());
      return;
    }
    if (t.preventDefault(), t.stopImmediatePropagation(), n.focus({ preventScroll: !0 }), r?.(V.id, V), t.ctrlKey || t.metaKey) {
      m.has(V.id) ? m.delete(V.id) : m.add(V.id), ee();
      return;
    }
    if ((b !== "move" || !m.has(V.id)) && (m = /* @__PURE__ */ new Set([V.id])), ["rotate", "mirror-x", "mirror-y"].includes(b)) {
      K(b);
      return;
    }
    if (ee(), b === "move") {
      v = { entries: l.components.filter((F) => m.has(F.id)).map((F) => ({ n: F, element: a.getElementById("cell_" + F.id) })), start: G(t), dx: 0, dy: 0 };
      for (const F of v.entries) F.element.style.opacity = ".6";
      n.setPointerCapture(t.pointerId);
    }
  }, { capture: !0 }), n.addEventListener("pointermove", (t) => {
    if (!(S || !c || !l || !a)) {
      if (g = q(t), p) {
        t.stopImmediatePropagation(), p.end = G(t), pe();
        return;
      }
      if (v) {
        t.stopImmediatePropagation();
        const b = G(t), h = l.snap({ x: b.x - v.start.x, y: b.y - v.start.y });
        v.dx = h.x, v.dy = h.y;
        for (const { n: T, element: Q } of v.entries) {
          Q.setAttribute("transform", `translate(${T.x + h.x},${T.y + h.y})`);
          const U = a.querySelector('[data-selected-component="' + CSS.escape(T.id) + '"]');
          U && (U.setAttribute("x", T.x + h.x - 3), U.setAttribute("y", T.y + h.y - 3));
        }
        for (const T of a.querySelectorAll("[data-airwires] line"))
          m.has(T.dataset.fromOwner) && (T.setAttribute("x1", +T.getAttribute("x1") - Number(T.dataset.dx || 0) + h.x), T.setAttribute("y1", +T.getAttribute("y1") - Number(T.dataset.dy || 0) + h.y)), m.has(T.dataset.toOwner) && (T.setAttribute("x2", +T.getAttribute("x2") - Number(T.dataset.dx || 0) + h.x), T.setAttribute("y2", +T.getAttribute("y2") - Number(T.dataset.dy || 0) + h.y)), T.dataset.dx = h.x, T.dataset.dy = h.y;
        return;
      }
      e("edit-tool").value === "route" && de();
    }
  }, { capture: !0 }), n.addEventListener("pointerup", (t) => {
    if (!p && !v) return;
    if (t.preventDefault(), t.stopImmediatePropagation(), n.hasPointerCapture(t.pointerId) && n.releasePointerCapture(t.pointerId), p) {
      const h = p;
      p = null;
      const T = Tt(l.components, h.start, G(t));
      m = h.additive ? /* @__PURE__ */ new Set([...m, ...T]) : new Set(T), ee(), H(m.size + " symbol(s) selected.");
      return;
    }
    const b = v;
    v = null;
    for (const h of b.entries) h.element.style.opacity = "";
    try {
      const h = l.moveMany(b.entries.map(({ n: T }) => ({ id: T.id, dx: b.dx, dy: b.dy })));
      ee(), h && H("Moved " + b.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (h) {
      ee(), H(h.message, { severity: "error" });
    }
  }, { capture: !0 }), n.addEventListener("pointercancel", () => {
    (v || p) && (v = null, p = null, ee());
  }), n.addEventListener("pointerleave", () => {
    !v && !p && (g = null, de());
  }), n.addEventListener("wheel", (t) => {
    requestAnimationFrame(() => {
      c && l && a && e("edit-tool").value === "route" && (g = q(t), de());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (t) => {
    if (e("download-dialog").open || e("label-dialog").open || !c || !l || u || t.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(t.target)) return;
    const b = t.target.closest("[data-editor-pin]"), h = t.key.toLowerCase();
    if (h === "t" && !t.ctrlKey && !t.metaKey && !t.altKey) {
      t.preventDefault(), t.stopImmediatePropagation(), Ae(!S);
      return;
    }
    if (S && t.key === "Enter" && m.size === 1) {
      t.preventDefault(), t.stopImmediatePropagation(), we([...m][0]);
      return;
    }
    if (b && e("edit-tool").value === "route" && (t.key === "Enter" || t.key === " ")) {
      t.preventDefault(), t.stopImmediatePropagation();
      const T = l.pins().find((Q) => Q.id === b.dataset.editorPin);
      ce({ x: T.x, y: T.y }, T.bit);
      return;
    }
    if (t.key === "Backspace" && e("edit-tool").value === "route") {
      if (t.preventDefault(), t.stopImmediatePropagation(), f) {
        const T = f.checkpoints.pop();
        T === void 0 ? f = null : f.points.length = T, de(), H(f ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    if (t.key === "Escape")
      t.preventDefault(), t.stopImmediatePropagation(), f = null, v = null, p = null, K("select");
    else if ((t.ctrlKey || t.metaKey) && h === "z") {
      t.preventDefault(), t.stopImmediatePropagation(), se(t.shiftKey);
      return;
    } else !t.ctrlKey && !t.metaKey && !t.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[h] && (t.preventDefault(), t.stopImmediatePropagation(), K({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[h]));
  }, { capture: !0 });
  function M(t) {
    if (!(!l || u)) {
      f = null, v = null, p = null, e("edit-tool").value = "select";
      try {
        const { moves: b, rounded: h } = lo(S ? L.nodes() : l.components, m, t, E);
        S ? fe(b) : l.moveMany(b), ee(), H(`${m.size} ${S ? "labels" : "components"} arranged.${h ? " Centers or gaps rounded to the " + E + "-unit pin grid." : ""}${S ? "" : " Detached connections remain flywires."}`);
      } catch (b) {
        ee(), H(b.message, { severity: "error" });
      }
    }
  }
  async function i() {
    if (!l || u || S) return;
    const t = _;
    u = !0, re(), H("Auto-routing remaining connections…");
    try {
      if (await l.autoRoute(() => t !== _), t === _) {
        f = null, u = !1, ee();
        const b = l.airwires().length;
        H(b ? "Auto-routing finished: " + b + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: b ? "warning" : "info" });
      }
    } catch (b) {
      t === _ && (u = !1, ee(), H(b.message, { severity: "error" }));
    }
  }
  return {
    mount(t, b, h, T, Q, { reset: U = !1, scope: V = "" } = {}) {
      _++, u = !1, a = t, f = null, v = null, p = null, g = null, m.clear(), A = /* @__PURE__ */ new Map();
      for (const $ of a.querySelectorAll('g[id^="cell_"]')) {
        const j = $.getCTM().inverse();
        A.set($.id.slice(5), { children: [...$.childNodes].map((J) => J.cloneNode(!0)), labels: [...$.querySelectorAll("text")].map((J) => {
          const ue = new DOMPoint(+J.getAttribute("x") || 0, +J.getAttribute("y") || 0).matrixTransform(j.multiply(J.getCTM()));
          return { node: J.cloneNode(!0), x: ue.x, y: ue.y };
        }) });
      }
      if (E = Q.gridSize || 0, w = new Map(Object.values(h.nodes).map(($) => [$.bit, $.name])), !b || !E) {
        l = null, W();
        return;
      }
      const F = Yt(a, b, h, T), Z = F.segments;
      l = new Gt(F, { step: E, segments: Z }), N = lt(V, h.topology.signature, Q), !U && C.has(N) ? (Ft(a, C.get(N).labelOverrides), l.restore($t({ ...F, segments: Z }, C.get(N), E))) : e("flywire").checked && l.clear(), c = e("interactive").checked, c || !U && C.has(N) || e("flywire").checked ? ee() : W();
    },
    invalidate() {
      P = null, I = null, O = null, e("label-dialog").open && e("label-dialog").close(), l && !u && C.set(N, l.snapshot()), _++, u = !1, l = null, a = null, f = null, v = null, p = null, g = null, m.clear(), W();
    },
    snapshotSheets() {
      return l && !u && C.set(N, l.snapshot()), [...C].map(([t, b]) => {
        const [h, T, Q] = JSON.parse(t);
        return { scope: h, topology: T, settings: Q, snapshot: structuredClone(b) };
      });
    },
    restoreSheets(t) {
      C = new Map(t.map((b) => [lt(b.scope, b.topology, b.settings), structuredClone(b.snapshot)]));
    },
    clearSheets() {
      C.clear();
    },
    setEnabled(t) {
      c = t, t || (S = !1, I = null, O = null, f = null, v = null, p = null, g = null, m.clear()), l ? ee() : W();
    },
    clear() {
      l && !S && (l.clear(), f = null, ee(), H("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: i,
    chooseTool: K,
    arrange: M,
    setLabelEditing: Ae,
    labelEditing: () => S,
    resetLabelDisplay: () => L.reset(),
    placeLabels: () => a && l ? L.layout(a, l.components, l.labelOverrides, c && S, m) : null,
    undo: () => se(!1),
    redo: () => se(!0),
    complete() {
      return !l || !u && l.airwires().length === 0;
    },
    working() {
      return u;
    },
    stats: k,
    canEdit() {
      return !!l;
    },
    refreshControls: W,
    refreshColors() {
      if (a) {
        for (const t of a.querySelectorAll("[data-air-net]")) t.setAttribute("stroke", X(+t.dataset.airNet));
        for (const t of a.querySelectorAll("[data-editor-bit]")) t.setAttribute("stroke", X(+t.dataset.editorBit));
      }
    },
    cleanExport(t) {
      for (const b of t.querySelectorAll("[data-label-id]")) b.removeAttribute("data-label-id");
      for (const b of t.querySelectorAll("[data-editor-overlay],[data-route-preview]")) b.remove();
      for (const b of t.querySelectorAll("[data-editor-component]"))
        b.removeAttribute("data-editor-component"), b.style.removeProperty("opacity");
    }
  };
}
const ct = 4, Fe = "http://www.w3.org/2000/svg";
function Ge(n, e, o = !0, r = null) {
  let s = n.querySelector("defs[data-coordinate-grid]"), d = n.querySelector("rect[data-coordinate-grid]");
  if (!s) {
    s = document.createElementNS(Fe, "defs"), s.dataset.coordinateGrid = "true";
    const g = document.createElementNS(Fe, "pattern");
    g.id = "spice-coordinate-grid", g.setAttribute("patternUnits", "userSpaceOnUse");
    const m = document.createElementNS(Fe, "path");
    m.setAttribute("fill", "none"), m.setAttribute("stroke", "#737b83"), m.setAttribute("stroke-opacity", ".38"), m.setAttribute("stroke-width", ".55"), m.setAttribute("vector-effect", "non-scaling-stroke"), g.append(m), s.append(g), d = document.createElementNS(Fe, "rect"), d.dataset.coordinateGrid = "true", d.setAttribute("fill", "url(#spice-coordinate-grid)"), d.setAttribute("stroke", "none"), d.setAttribute("pointer-events", "none"), n.prepend(d), n.prepend(s);
  }
  const l = s.firstElementChild, a = e || 8;
  l.setAttribute("width", a), l.setAttribute("height", a), l.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), d.setAttribute("visibility", o && e ? "visible" : "hidden");
  let c = l.querySelector("[data-minor-grid]");
  c || (c = l.firstElementChild.cloneNode(), c.setAttribute("data-minor-grid", "true"), c.setAttribute("stroke-opacity", ".16"), l.append(c));
  const u = [];
  for (let g = ct; g < a; g += ct) u.push(`M${g},0 V${a} M0,${g} H${a}`);
  c.setAttribute("d", u.join(" ")), n.dataset.displayGridStep = String(a);
  let f = r;
  const v = n.closest(".spice-preview"), p = n.isConnected && v ? n.getScreenCTM() : null;
  if (p) {
    const g = v.getBoundingClientRect(), m = p.inverse(), _ = [[g.left - 1, g.top - 1], [g.right + 1, g.top - 1], [g.right + 1, g.bottom + 1], [g.left - 1, g.bottom + 1]].map(([w, C]) => new DOMPoint(w, C).matrixTransform(m)), N = Math.min(..._.map((w) => w.x)), E = Math.min(..._.map((w) => w.y));
    f = { x: N, y: E, w: Math.max(..._.map((w) => w.x)) - N, h: Math.max(..._.map((w) => w.y)) - E };
  }
  if (!f) {
    const g = n.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    f = { x: g[0], y: g[1], w: g[2], h: g[3] };
  }
  for (const [g, m] of Object.entries({ x: f.x, y: f.y, width: f.w, height: f.h })) d.setAttribute(g, m);
}
const po = `<svg
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
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
</svg>
`, yo = `<svg
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
`, wo = `<svg
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
`, xo = `<svg
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
`, vo = `<svg
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
`, Eo = `<svg
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
`, _o = `<svg
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
`, No = `<svg
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
`, Je = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, Co = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`, So = `<svg
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
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
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M12 2v20" />
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="12" y="7" rx="2" />
  <path d="M22 2v20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
</svg>
`, Uo = `<svg
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
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
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
  <rect width="6" height="14" x="3" y="5" rx="2" />
  <rect width="6" height="10" x="15" y="7" rx="2" />
  <path d="M3 2v20" />
  <path d="M21 2v20" />
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
  <rect width="14" height="6" x="5" y="15" rx="2" />
  <rect width="10" height="6" x="7" y="3" rx="2" />
  <path d="M2 21h20" />
  <path d="M2 3h20" />
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
`;
function Fo(n) {
  const e = { select: Oo, box: ko, move: po, route: ho, erase: mo, rotate: go, "mirror-x": bo, "mirror-y": yo }, o = { left: Ro, right: Po, top: Do, bottom: Bo, "center-x": Lo, "center-y": Uo, "space-x": jo, "space-y": Vo }, r = { "zoom-in": wo, "zoom-out": xo, fit: vo, "wire-undo": Eo, "wire-redo": _o, "auto-route": No, "pin-editor": Je, "pin-info": Je, "pin-details": Je, fullscreen: Co, "exit-fullscreen": So, "reset-windows": Io, "open-download": Ao, upload: To }, s = (d, l) => {
    if (!d) return;
    const a = d.title || d.getAttribute("aria-label") || d.textContent;
    d.setAttribute("aria-label", a), d.title = a, d.innerHTML = l, d.firstElementChild.setAttribute("aria-hidden", "true"), d.firstElementChild.setAttribute("focusable", "false"), d.classList.add("spice-icon-button");
  };
  s(n.querySelector("#spice-copy"), Mo), s(n.querySelector("#spice-label-edit"), Qo);
  for (const [d, l] of Object.entries(o)) s(n.querySelector(`[data-editor-arrange="${d}"]`), l);
  for (const [d, l] of Object.entries(e)) s(n.querySelector(`[data-editor-mode="${d}"]`), l);
  for (const [d, l] of Object.entries(r)) s(n.querySelector("#spice-" + d), l);
}
function Go(n) {
  if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
  var e = n.default;
  if (typeof e == "function") {
    var o = function r() {
      var s = !1;
      try {
        s = this instanceof r;
      } catch {
      }
      return s ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    o.prototype = e.prototype;
  } else o = {};
  return Object.defineProperty(o, "__esModule", { value: !0 }), Object.keys(n).forEach(function(r) {
    var s = Object.getOwnPropertyDescriptor(n, r);
    Object.defineProperty(o, r, s.get ? s : {
      enumerable: !0,
      get: function() {
        return n[r];
      }
    });
  }), o;
}
var et = {};
const Ho = {}, Wo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ho
}, Symbol.toStringTag, { value: "Module" })), qo = /* @__PURE__ */ Go(Wo);
var Ot;
function zo() {
  return Ot || (Ot = 1, (function(n) {
    (function(e) {
      e.parser = function(i, t) {
        return new r(i, t);
      }, e.SAXParser = r, e.SAXStream = v, e.createStream = u, e.MAX_BUFFER_LENGTH = 64 * 1024;
      var o = [
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
      function r(i, t) {
        if (!(this instanceof r))
          return new r(i, t);
        var b = this;
        d(b), b.q = b.c = "", b.bufferCheckPosition = e.MAX_BUFFER_LENGTH, b.encoding = null, b.opt = t || {}, b.opt.lowercase = b.opt.lowercase || b.opt.lowercasetags, b.looseCase = b.opt.lowercase ? "toLowerCase" : "toUpperCase", b.opt.maxEntityCount = b.opt.maxEntityCount || 512, b.opt.maxEntityDepth = b.opt.maxEntityDepth || 4, b.entityCount = b.entityDepth = 0, b.tags = [], b.closed = b.closedRoot = b.sawRoot = !1, b.tag = b.error = null, b.strict = !!i, b.noscript = !!(i || b.opt.noscript), b.state = y.BEGIN, b.strictEntities = b.opt.strictEntities, b.ENTITIES = b.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), b.attribList = [], b.opt.xmlns && (b.ns = Object.create(N)), b.opt.unquotedAttributeValues === void 0 && (b.opt.unquotedAttributeValues = !i), b.trackPosition = b.opt.position !== !1, b.trackPosition && (b.position = b.line = b.column = 0), G(b, "onready");
      }
      Object.create || (Object.create = function(i) {
        function t() {
        }
        t.prototype = i;
        var b = new t();
        return b;
      }), Object.keys || (Object.keys = function(i) {
        var t = [];
        for (var b in i) i.hasOwnProperty(b) && t.push(b);
        return t;
      });
      function s(i) {
        for (var t = Math.max(e.MAX_BUFFER_LENGTH, 10), b = 0, h = 0, T = o.length; h < T; h++) {
          var Q = i[o[h]].length;
          if (Q > t)
            switch (o[h]) {
              case "textNode":
                W(i);
                break;
              case "cdata":
                D(i, "oncdata", i.cdata), i.cdata = "";
                break;
              case "script":
                D(i, "onscript", i.script), i.script = "";
                break;
              default:
                K(i, "Max buffer length exceeded: " + o[h]);
            }
          b = Math.max(b, Q);
        }
        var U = e.MAX_BUFFER_LENGTH - b;
        i.bufferCheckPosition = U + i.position;
      }
      function d(i) {
        for (var t = 0, b = o.length; t < b; t++)
          i[o[t]] = "";
      }
      function l(i) {
        W(i), i.cdata !== "" && (D(i, "oncdata", i.cdata), i.cdata = ""), i.script !== "" && (D(i, "onscript", i.script), i.script = "");
      }
      r.prototype = {
        end: function() {
          re(this);
        },
        write: M,
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
        a = qo.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var c = e.EVENTS.filter(function(i) {
        return i !== "error" && i !== "end";
      });
      function u(i, t) {
        return new v(i, t);
      }
      function f(i, t) {
        if (i.length >= 2) {
          if (i[0] === 255 && i[1] === 254)
            return "utf-16le";
          if (i[0] === 254 && i[1] === 255)
            return "utf-16be";
        }
        return i.length >= 3 && i[0] === 239 && i[1] === 187 && i[2] === 191 ? "utf8" : i.length >= 4 ? i[0] === 60 && i[1] === 0 && i[2] === 63 && i[3] === 0 ? "utf-16le" : i[0] === 0 && i[1] === 60 && i[2] === 0 && i[3] === 63 ? "utf-16be" : "utf8" : t ? "utf8" : null;
      }
      function v(i, t) {
        if (!(this instanceof v))
          return new v(i, t);
        a.apply(this), this._parser = new r(i, t), this.writable = !0, this.readable = !0;
        var b = this;
        this._parser.onend = function() {
          b.emit("end");
        }, this._parser.onerror = function(h) {
          b.emit("error", h), b._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, c.forEach(function(h) {
          Object.defineProperty(b, "on" + h, {
            get: function() {
              return b._parser["on" + h];
            },
            set: function(T) {
              if (!T)
                return b.removeAllListeners(h), b._parser["on" + h] = T, T;
              b.on(h, T);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      v.prototype = Object.create(a.prototype, {
        constructor: {
          value: v
        }
      }), v.prototype._decodeBuffer = function(i, t) {
        if (this._decoderBuffer && (i = Buffer.concat([this._decoderBuffer, i]), this._decoderBuffer = null), !this._decoder) {
          var b = f(i, t);
          if (!b)
            return this._decoderBuffer = i, "";
          this._parser.encoding = b, this._decoder = new TextDecoder(b);
        }
        return this._decoder.decode(i, { stream: !t });
      }, v.prototype.write = function(i) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(i))
          i = this._decodeBuffer(i, !1);
        else if (this._decoderBuffer) {
          var t = this._decodeBuffer(Buffer.alloc(0), !0);
          t && (this._parser.write(t), this.emit("data", t));
        }
        return this._parser.write(i.toString()), this.emit("data", i), !0;
      }, v.prototype.end = function(i) {
        if (i && i.length && this.write(i), this._decoderBuffer) {
          var t = this._decodeBuffer(Buffer.alloc(0), !0);
          t && (this._parser.write(t), this.emit("data", t));
        } else if (this._decoder) {
          var b = this._decoder.decode();
          b && (this._parser.write(b), this.emit("data", b));
        }
        return this._parser.end(), !0;
      }, v.prototype.on = function(i, t) {
        var b = this;
        return !b._parser["on" + i] && c.indexOf(i) !== -1 && (b._parser["on" + i] = function() {
          var h = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          h.splice(0, 0, i), b.emit.apply(b, h);
        }), a.prototype.on.call(b, i, t);
      };
      var p = /^\[CDATA\[$/i, g = /^DOCTYPE$/i, m = "http://www.w3.org/XML/1998/namespace", _ = "http://www.w3.org/2000/xmlns/", N = { xml: m, xmlns: _ }, E = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function S(i) {
        return i === " " || i === `
` || i === "\r" || i === "	";
      }
      function I(i) {
        return i === '"' || i === "'";
      }
      function O(i) {
        return i === ">" || S(i);
      }
      function P(i, t) {
        return i.test(t);
      }
      function x(i, t) {
        return !P(i, t);
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
      }), Object.keys(e.ENTITIES).forEach(function(i) {
        var t = e.ENTITIES[i], b = typeof t == "number" ? String.fromCharCode(t) : t;
        e.ENTITIES[i] = b;
      });
      for (var L in e.STATE)
        e.STATE[e.STATE[L]] = L;
      y = e.STATE;
      function G(i, t, b) {
        i[t] && i[t](b);
      }
      function q(i) {
        var t = i && i.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return t ? t[2] : null;
      }
      function X(i) {
        return i ? i.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function H(i, t) {
        const b = X(i), h = X(t);
        return !b || !h ? !0 : h === "utf16" ? b === "utf16le" || b === "utf16be" : b === h;
      }
      function k(i, t) {
        if (!(!i.strict || !i.encoding || !t || t.name !== "xml")) {
          var b = q(t.body);
          b && !H(i.encoding, b) && Y(
            i,
            "XML declaration encoding " + b + " does not match detected stream encoding " + i.encoding.toUpperCase()
          );
        }
      }
      function D(i, t, b) {
        i.textNode && W(i), G(i, t, b);
      }
      function W(i) {
        i.textNode = z(i.opt, i.textNode), i.textNode && G(i, "ontext", i.textNode), i.textNode = "";
      }
      function z(i, t) {
        return i.trim && (t = t.trim()), i.normalize && (t = t.replace(/\s+/g, " ")), t;
      }
      function K(i, t) {
        return W(i), i.trackPosition && (t += `
Line: ` + i.line + `
Column: ` + i.column + `
Char: ` + i.c), t = new Error(t), i.error = t, G(i, "onerror", t), i;
      }
      function re(i) {
        return i.sawRoot && !i.closedRoot && Y(i, "Unclosed root tag"), i.state !== y.BEGIN && i.state !== y.BEGIN_WHITESPACE && i.state !== y.TEXT && K(i, "Unexpected end"), W(i), i.c = "", i.closed = !0, G(i, "onend"), r.call(i, i.strict, i.opt), i;
      }
      function Y(i, t) {
        if (typeof i != "object" || !(i instanceof r))
          throw new Error("bad call to strictFail");
        i.strict && K(i, t);
      }
      function de(i) {
        i.strict || (i.tagName = i.tagName[i.looseCase]());
        var t = i.tags[i.tags.length - 1] || i, b = i.tag = { name: i.tagName, attributes: {} };
        i.opt.xmlns && (b.ns = t.ns), i.attribList.length = 0, D(i, "onopentagstart", b);
      }
      function pe(i, t) {
        var b = i.indexOf(":"), h = b < 0 ? ["", i] : i.split(":"), T = h[0], Q = h[1];
        return t && i === "xmlns" && (T = "xmlns", Q = ""), { prefix: T, local: Q };
      }
      function ee(i) {
        if (i.strict || (i.attribName = i.attribName[i.looseCase]()), i.attribList.indexOf(i.attribName) !== -1 || i.tag.attributes.hasOwnProperty(i.attribName)) {
          i.attribName = i.attribValue = "";
          return;
        }
        if (i.opt.xmlns) {
          var t = pe(i.attribName, !0), b = t.prefix, h = t.local;
          if (b === "xmlns")
            if (h === "xml" && i.attribValue !== m)
              Y(
                i,
                "xml: prefix must be bound to " + m + `
Actual: ` + i.attribValue
              );
            else if (h === "xmlns" && i.attribValue !== _)
              Y(
                i,
                "xmlns: prefix must be bound to " + _ + `
Actual: ` + i.attribValue
              );
            else {
              var T = i.tag, Q = i.tags[i.tags.length - 1] || i;
              T.ns === Q.ns && (T.ns = Object.create(Q.ns)), T.ns[h] = i.attribValue;
            }
          i.attribList.push([i.attribName, i.attribValue]);
        } else
          i.tag.attributes[i.attribName] = i.attribValue, D(i, "onattribute", {
            name: i.attribName,
            value: i.attribValue
          });
        i.attribName = i.attribValue = "";
      }
      function ce(i, t) {
        if (i.opt.xmlns) {
          var b = i.tag, h = pe(i.tagName);
          b.prefix = h.prefix, b.local = h.local, b.uri = b.ns[h.prefix] || "", b.prefix && !b.uri && (Y(
            i,
            "Unbound namespace prefix: " + JSON.stringify(i.tagName)
          ), b.uri = h.prefix);
          var T = i.tags[i.tags.length - 1] || i;
          b.ns && T.ns !== b.ns && Object.keys(b.ns).forEach(function(_e) {
            D(i, "onopennamespace", {
              prefix: _e,
              uri: b.ns[_e]
            });
          });
          for (var Q = 0, U = i.attribList.length; Q < U; Q++) {
            var V = i.attribList[Q], F = V[0], Z = V[1], $ = pe(F, !0), j = $.prefix, J = $.local, ue = j === "" ? "" : b.ns[j] || "", Ee = {
              name: F,
              value: Z,
              prefix: j,
              local: J,
              uri: ue
            };
            j && j !== "xmlns" && !ue && (Y(
              i,
              "Unbound namespace prefix: " + JSON.stringify(j)
            ), Ee.uri = j), i.tag.attributes[F] = Ee, D(i, "onattribute", Ee);
          }
          i.attribList.length = 0;
        }
        i.tag.isSelfClosing = !!t, i.sawRoot = !0, i.tags.push(i.tag), D(i, "onopentag", i.tag), t || (!i.noscript && i.tagName.toLowerCase() === "script" ? i.state = y.SCRIPT : i.state = y.TEXT, i.tag = null, i.tagName = ""), i.attribName = i.attribValue = "", i.attribList.length = 0;
      }
      function be(i) {
        if (!i.tagName) {
          Y(i, "Weird empty close tag."), i.textNode += "</>", i.state = y.TEXT;
          return;
        }
        if (i.script) {
          if (i.tagName !== "script") {
            i.script += "</" + i.tagName + ">", i.tagName = "", i.state = y.SCRIPT;
            return;
          }
          D(i, "onscript", i.script), i.script = "";
        }
        var t = i.tags.length, b = i.tagName;
        i.strict || (b = b[i.looseCase]());
        for (var h = b; t--; ) {
          var T = i.tags[t];
          if (T.name !== h)
            Y(i, "Unexpected close tag");
          else
            break;
        }
        if (t < 0) {
          Y(i, "Unmatched closing tag: " + i.tagName), i.textNode += "</" + i.tagName + ">", i.state = y.TEXT;
          return;
        }
        i.tagName = b;
        for (var Q = i.tags.length; Q-- > t; ) {
          var U = i.tag = i.tags.pop();
          i.tagName = i.tag.name, D(i, "onclosetag", i.tagName);
          var V = {};
          for (var F in U.ns)
            V[F] = U.ns[F];
          var Z = i.tags[i.tags.length - 1] || i;
          i.opt.xmlns && U.ns !== Z.ns && Object.keys(U.ns).forEach(function($) {
            var j = U.ns[$];
            D(i, "onclosenamespace", { prefix: $, uri: j });
          });
        }
        t === 0 && (i.closedRoot = !0), i.tagName = i.attribValue = i.attribName = "", i.attribList.length = 0, i.state = y.TEXT;
      }
      function fe(i) {
        var t = i.entity, b = t.toLowerCase(), h, T = "";
        return i.ENTITIES[t] ? i.ENTITIES[t] : i.ENTITIES[b] ? i.ENTITIES[b] : (t = b, t.charAt(0) === "#" && (t.charAt(1) === "x" ? (t = t.slice(2), h = parseInt(t, 16), T = h.toString(16)) : (t = t.slice(1), h = parseInt(t, 10), T = h.toString(10))), t = t.replace(/^0+/, ""), isNaN(h) || T.toLowerCase() !== t || h < 0 || h > 1114111 || !Ae(h) ? (Y(i, "Invalid character entity"), "&" + i.entity + ";") : String.fromCodePoint(h));
      }
      function Ae(i) {
        return i === 9 || i === 10 || i === 13 || i >= 32 && i <= 55295 || i >= 57344 && i <= 65533 || i >= 65536 && i <= 1114111;
      }
      function se(i, t) {
        t === "<" ? (i.state = y.OPEN_WAKA, i.startTagPosition = i.position) : S(t) || (Y(i, "Non-whitespace before first tag."), i.textNode = t, i.state = y.TEXT);
      }
      function we(i, t) {
        var b = "";
        return t < i.length && (b = i.charAt(t)), b;
      }
      function M(i) {
        var t = this;
        if (this.error)
          throw this.error;
        if (t.closed)
          return K(
            t,
            "Cannot write after close. Assign an onready handler."
          );
        if (i === null)
          return re(t);
        typeof i == "object" && (i = i.toString());
        for (var b = 0, h = ""; h = we(i, b++), t.c = h, !!h; )
          switch (t.trackPosition && (t.position++, h === `
` ? (t.line++, t.column = 0) : t.column++), t.state) {
            case y.BEGIN:
              if (t.state = y.BEGIN_WHITESPACE, h === "\uFEFF")
                continue;
              se(t, h);
              continue;
            case y.BEGIN_WHITESPACE:
              se(t, h);
              continue;
            case y.TEXT:
              if (t.sawRoot && !t.closedRoot) {
                for (var Q = b - 1; h && h !== "<" && h !== "&"; )
                  h = we(i, b++), h && t.trackPosition && (t.position++, h === `
` ? (t.line++, t.column = 0) : t.column++);
                t.textNode += i.substring(Q, b - 1);
              }
              h === "<" && !(t.sawRoot && t.closedRoot && !t.strict) ? (t.state = y.OPEN_WAKA, t.startTagPosition = t.position) : (!S(h) && (!t.sawRoot || t.closedRoot) && Y(t, "Text data outside of root node."), h === "&" ? t.state = y.TEXT_ENTITY : t.textNode += h);
              continue;
            case y.SCRIPT:
              h === "<" ? t.state = y.SCRIPT_ENDING : t.script += h;
              continue;
            case y.SCRIPT_ENDING:
              h === "/" ? t.state = y.CLOSE_TAG : (t.script += "<" + h, t.state = y.SCRIPT);
              continue;
            case y.OPEN_WAKA:
              if (h === "!")
                t.state = y.SGML_DECL, t.sgmlDecl = "";
              else if (!S(h)) if (P(E, h))
                t.state = y.OPEN_TAG, t.tagName = h;
              else if (h === "/")
                t.state = y.CLOSE_TAG, t.tagName = "";
              else if (h === "?")
                t.state = y.PROC_INST, t.procInstName = t.procInstBody = "";
              else {
                if (Y(t, "Unencoded <"), t.startTagPosition + 1 < t.position) {
                  var T = t.position - t.startTagPosition;
                  h = new Array(T).join(" ") + h;
                }
                t.textNode += "<" + h, t.state = y.TEXT;
              }
              continue;
            case y.SGML_DECL:
              if (t.sgmlDecl + h === "--") {
                t.state = y.COMMENT, t.comment = "", t.sgmlDecl = "";
                continue;
              }
              t.doctype && t.doctype !== !0 && t.sgmlDecl ? (t.state = y.DOCTYPE_DTD, t.doctype += "<!" + t.sgmlDecl + h, t.sgmlDecl = "") : p.test(t.sgmlDecl + h) ? (D(t, "onopencdata"), t.state = y.CDATA, t.sgmlDecl = "", t.cdata = "") : g.test(t.sgmlDecl + h) ? (t.state = y.DOCTYPE, (t.doctype || t.sawRoot) && Y(
                t,
                "Inappropriately located doctype declaration"
              ), t.doctype = "", t.sgmlDecl = "") : h === ">" ? (D(t, "onsgmldeclaration", t.sgmlDecl), t.sgmlDecl = "", t.state = y.TEXT) : (I(h) && (t.state = y.SGML_DECL_QUOTED), t.sgmlDecl += h);
              continue;
            case y.SGML_DECL_QUOTED:
              h === t.q && (t.state = y.SGML_DECL, t.q = ""), t.sgmlDecl += h;
              continue;
            case y.DOCTYPE:
              h === ">" ? (t.state = y.TEXT, D(t, "ondoctype", t.doctype), t.doctype = !0) : (t.doctype += h, h === "[" ? t.state = y.DOCTYPE_DTD : I(h) && (t.state = y.DOCTYPE_QUOTED, t.q = h));
              continue;
            case y.DOCTYPE_QUOTED:
              t.doctype += h, h === t.q && (t.q = "", t.state = y.DOCTYPE);
              continue;
            case y.DOCTYPE_DTD:
              h === "]" ? (t.doctype += h, t.state = y.DOCTYPE) : h === "<" ? (t.state = y.OPEN_WAKA, t.startTagPosition = t.position) : I(h) ? (t.doctype += h, t.state = y.DOCTYPE_DTD_QUOTED, t.q = h) : t.doctype += h;
              continue;
            case y.DOCTYPE_DTD_QUOTED:
              t.doctype += h, h === t.q && (t.state = y.DOCTYPE_DTD, t.q = "");
              continue;
            case y.COMMENT:
              h === "-" ? t.state = y.COMMENT_ENDING : t.comment += h;
              continue;
            case y.COMMENT_ENDING:
              h === "-" ? (t.state = y.COMMENT_ENDED, t.comment = z(t.opt, t.comment), t.comment && D(t, "oncomment", t.comment), t.comment = "") : (t.comment += "-" + h, t.state = y.COMMENT);
              continue;
            case y.COMMENT_ENDED:
              h !== ">" ? (Y(t, "Malformed comment"), t.comment += "--" + h, t.state = y.COMMENT) : t.doctype && t.doctype !== !0 ? t.state = y.DOCTYPE_DTD : t.state = y.TEXT;
              continue;
            case y.CDATA:
              for (var Q = b - 1; h && h !== "]"; )
                h = we(i, b++), h && t.trackPosition && (t.position++, h === `
` ? (t.line++, t.column = 0) : t.column++);
              t.cdata += i.substring(Q, b - 1), h === "]" && (t.state = y.CDATA_ENDING);
              continue;
            case y.CDATA_ENDING:
              h === "]" ? t.state = y.CDATA_ENDING_2 : (t.cdata += "]" + h, t.state = y.CDATA);
              continue;
            case y.CDATA_ENDING_2:
              h === ">" ? (t.cdata && D(t, "oncdata", t.cdata), D(t, "onclosecdata"), t.cdata = "", t.state = y.TEXT) : h === "]" ? t.cdata += "]" : (t.cdata += "]]" + h, t.state = y.CDATA);
              continue;
            case y.PROC_INST:
              h === "?" ? t.state = y.PROC_INST_ENDING : S(h) ? t.state = y.PROC_INST_BODY : t.procInstName += h;
              continue;
            case y.PROC_INST_BODY:
              if (!t.procInstBody && S(h))
                continue;
              h === "?" ? t.state = y.PROC_INST_ENDING : t.procInstBody += h;
              continue;
            case y.PROC_INST_ENDING:
              if (h === ">") {
                const Z = {
                  name: t.procInstName,
                  body: t.procInstBody
                };
                k(t, Z), D(t, "onprocessinginstruction", Z), t.procInstName = t.procInstBody = "", t.state = y.TEXT;
              } else
                t.procInstBody += "?" + h, t.state = y.PROC_INST_BODY;
              continue;
            case y.OPEN_TAG:
              P(w, h) ? t.tagName += h : (de(t), h === ">" ? ce(t) : h === "/" ? t.state = y.OPEN_TAG_SLASH : (S(h) || Y(t, "Invalid character in tag name"), t.state = y.ATTRIB));
              continue;
            case y.OPEN_TAG_SLASH:
              h === ">" ? (ce(t, !0), be(t)) : (Y(
                t,
                "Forward-slash in opening tag not followed by >"
              ), t.state = y.ATTRIB);
              continue;
            case y.ATTRIB:
              if (S(h))
                continue;
              h === ">" ? ce(t) : h === "/" ? t.state = y.OPEN_TAG_SLASH : P(E, h) ? (t.attribName = h, t.attribValue = "", t.state = y.ATTRIB_NAME) : Y(t, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME:
              h === "=" ? t.state = y.ATTRIB_VALUE : h === ">" ? (Y(t, "Attribute without value"), t.attribValue = t.attribName, ee(t), ce(t)) : S(h) ? t.state = y.ATTRIB_NAME_SAW_WHITE : P(w, h) ? t.attribName += h : Y(t, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME_SAW_WHITE:
              if (h === "=")
                t.state = y.ATTRIB_VALUE;
              else {
                if (S(h))
                  continue;
                Y(t, "Attribute without value"), t.tag.attributes[t.attribName] = "", t.attribValue = "", D(t, "onattribute", {
                  name: t.attribName,
                  value: ""
                }), t.attribName = "", h === ">" ? ce(t) : P(E, h) ? (t.attribName = h, t.state = y.ATTRIB_NAME) : (Y(t, "Invalid attribute name"), t.state = y.ATTRIB);
              }
              continue;
            case y.ATTRIB_VALUE:
              if (S(h))
                continue;
              I(h) ? (t.q = h, t.state = y.ATTRIB_VALUE_QUOTED) : (t.opt.unquotedAttributeValues || K(t, "Unquoted attribute value"), t.state = y.ATTRIB_VALUE_UNQUOTED, t.attribValue = h);
              continue;
            case y.ATTRIB_VALUE_QUOTED:
              if (h !== t.q) {
                h === "&" ? t.state = y.ATTRIB_VALUE_ENTITY_Q : t.attribValue += h;
                continue;
              }
              ee(t), t.q = "", t.state = y.ATTRIB_VALUE_CLOSED;
              continue;
            case y.ATTRIB_VALUE_CLOSED:
              S(h) ? t.state = y.ATTRIB : h === ">" ? ce(t) : h === "/" ? t.state = y.OPEN_TAG_SLASH : P(E, h) ? (Y(t, "No whitespace between attributes"), t.attribName = h, t.attribValue = "", t.state = y.ATTRIB_NAME) : Y(t, "Invalid attribute name");
              continue;
            case y.ATTRIB_VALUE_UNQUOTED:
              if (!O(h)) {
                h === "&" ? t.state = y.ATTRIB_VALUE_ENTITY_U : t.attribValue += h;
                continue;
              }
              ee(t), h === ">" ? ce(t) : t.state = y.ATTRIB;
              continue;
            case y.CLOSE_TAG:
              if (t.tagName)
                h === ">" ? be(t) : P(w, h) ? t.tagName += h : t.script ? (t.script += "</" + t.tagName + h, t.tagName = "", t.state = y.SCRIPT) : (S(h) || Y(t, "Invalid tagname in closing tag"), t.state = y.CLOSE_TAG_SAW_WHITE);
              else {
                if (S(h))
                  continue;
                x(E, h) ? t.script ? (t.script += "</" + h, t.state = y.SCRIPT) : Y(t, "Invalid tagname in closing tag.") : t.tagName = h;
              }
              continue;
            case y.CLOSE_TAG_SAW_WHITE:
              if (S(h))
                continue;
              h === ">" ? be(t) : Y(t, "Invalid characters in closing tag");
              continue;
            case y.TEXT_ENTITY:
            case y.ATTRIB_VALUE_ENTITY_Q:
            case y.ATTRIB_VALUE_ENTITY_U:
              var U, V;
              switch (t.state) {
                case y.TEXT_ENTITY:
                  U = y.TEXT, V = "textNode";
                  break;
                case y.ATTRIB_VALUE_ENTITY_Q:
                  U = y.ATTRIB_VALUE_QUOTED, V = "attribValue";
                  break;
                case y.ATTRIB_VALUE_ENTITY_U:
                  U = y.ATTRIB_VALUE_UNQUOTED, V = "attribValue";
                  break;
              }
              if (h === ";") {
                var F = fe(t);
                t.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(F) ? ((t.entityCount += 1) > t.opt.maxEntityCount && K(
                  t,
                  "Parsed entity count exceeds max entity count"
                ), (t.entityDepth += 1) > t.opt.maxEntityDepth && K(
                  t,
                  "Parsed entity depth exceeds max entity depth"
                ), t.entity = "", t.state = U, t.write(F), t.entityDepth -= 1) : (t[V] += F, t.entity = "", t.state = U);
              } else P(t.entity.length ? A : C, h) ? t.entity += h : (Y(t, "Invalid character in entity name"), t[V] += "&" + t.entity + h, t.entity = "", t.state = U);
              continue;
            default:
              throw new Error(t, "Unknown state: " + t.state);
          }
        return t.position >= t.bufferCheckPosition && s(t), t;
      }
      String.fromCodePoint || (function() {
        var i = String.fromCharCode, t = Math.floor, b = function() {
          var h = 16384, T = [], Q, U, V = -1, F = arguments.length;
          if (!F)
            return "";
          for (var Z = ""; ++V < F; ) {
            var $ = Number(arguments[V]);
            if (!isFinite($) || // `NaN`, `+Infinity`, or `-Infinity`
            $ < 0 || // not a valid Unicode code point
            $ > 1114111 || // not a valid Unicode code point
            t($) !== $)
              throw RangeError("Invalid code point: " + $);
            $ <= 65535 ? T.push($) : ($ -= 65536, Q = ($ >> 10) + 55296, U = $ % 1024 + 56320, T.push(Q, U)), (V + 1 === F || T.length > h) && (Z += i.apply(null, T), T.length = 0);
          }
          return Z;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: b,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = b;
      })();
    })(n);
  })(et)), et;
}
var tt, kt;
function Xo() {
  if (kt) return tt;
  kt = 1;
  var n = zo().parser;
  function e(o) {
    var r = [], s = [], d = r, l;
    return l = n(!0), l.ontext = function(a) {
      a.trim() !== "" && d.push(a);
    }, l.onopentag = function(a) {
      var c;
      c = [a.name, a.attributes], s.push(d), d.push(c), d = c;
    }, l.onclosetag = function() {
      d = s.pop();
    }, l.write(o).close(), r[0];
  }
  return tt = e, tt;
}
var nt, Mt;
function $o() {
  if (Mt) return nt;
  Mt = 1;
  function n(e, o) {
    var r = function() {
    }, s = r, d = r;
    function l() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function c(v) {
      this._name = v;
    }
    function u(v) {
      this._replace = v;
    }
    function f(v, p) {
      var g, m = { attr: {}, full: v }, _ = {
        name: c,
        skip: l,
        // break: breakFn,
        remove: a,
        replace: u,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, N = !0, E, w, C;
      if (v !== void 0 && v !== null && v !== !0 && v !== !1)
        switch (g = Object.prototype.toString.call(v), g) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (v.some(function(A, S) {
              if (S === 0)
                return m.name = A, !1;
              if (S === 1)
                return Object.prototype.toString.call(A) === "[object Object]" && (N = !1, m.attr = A), !0;
            }), s.call(_, m, p), _._name && (v[0] = _._name), _._replace)
              return _._replace;
            if (_._remove)
              return null;
            if (!_._skip) {
              for (E = 0, w = v.length; E < w; ) {
                if (E > 1 || E === 1 && N) {
                  if (C = f(v[E], m), C === null) {
                    v.splice(E, 1), w -= 1;
                    continue;
                  }
                  C && (v[E] = C);
                }
                E += 1;
              }
              if (d.call(_, m, p), _._name && (v[0] = _._name), _._replace)
                return _._replace;
              if (_._remove)
                return null;
            }
        }
    }
    o && (o.enter && (s = o.enter), o.leave && (d = o.leave)), f(e, void 0);
  }
  return nt = n, nt;
}
var ot, Rt;
function Yo() {
  if (Rt) return ot;
  Rt = 1;
  const n = Xo(), e = $o(), o = (s) => String(s).replace(/[&<>"']/g, (d) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[d]);
  function r(s) {
    const [d, ...l] = s, a = l[0] && typeof l[0] == "object" && !Array.isArray(l[0]) ? l.shift() : {}, c = "<" + d + Object.entries(a).map(([u, f]) => " " + u + '="' + o(f) + '"').join("");
    return l.length ? c + ">" + l.map((u) => Array.isArray(u) ? r(u) : o(u)).join("") + "</" + d + ">" : c + "/>";
  }
  return ot = { parse: n, p: n, traverse: e, t: e, stringify: r, s: r }, ot;
}
Yo();
const rt = (n, e) => Math.max(0, Math.min(n.x + n.w, e.x + e.w) - Math.max(n.x, e.x)) * Math.max(0, Math.min(n.y + n.h, e.y + e.h) - Math.max(n.y, e.y)), Ko = (n, e) => [...n].reduce((o, r) => o + (r.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function Zo(n, e, o = 12) {
  const r = [], s = n.map((l) => ({ x: l.x, y: l.y, w: l.w, h: l.h }));
  for (const [l, a] of n.entries()) {
    if (!a.labels.length) continue;
    const c = Math.max(...a.labels.map((m) => Ko(m.text, o))) + 4, u = a.labels.length * (o + 4), f = [];
    for (const m of [5, 14, 28, 48]) {
      const _ = { x: a.x + (a.w - c) / 2, y: a.y - m - u, w: c, h: u }, N = { x: a.x + (a.w - c) / 2, y: a.y + a.h + m, w: c, h: u }, E = { x: a.x + a.w + m, y: a.y + (a.h - u) / 2, w: c, h: u }, w = { x: a.x - m - c, y: a.y + (a.h - u) / 2, w: c, h: u };
      f.push(...a.w > a.h ? [_, N, E, w] : [E, w, _, N]);
    }
    const v = (m) => e.reduce((_, N) => {
      const E = Math.min(N.a.x, N.b.x), w = Math.min(N.a.y, N.b.y), C = { x: E - 1, y: w - 1, w: Math.abs(N.a.x - N.b.x) + 2, h: Math.abs(N.a.y - N.b.y) + 2 };
      return _ + rt(m, C) * 2;
    }, 0);
    let p = null, g = 1 / 0;
    for (const [m, _] of f.entries()) {
      const N = s.reduce((E, w, C) => E + (C === l ? 0 : rt(_, w)) * 500, 0) + r.reduce((E, w) => E + rt(_, w) * 100, 0) + v(_) + m * 3;
      N < g && (g = N, p = _);
    }
    a.labels.forEach((m, _) => {
      m.x = p.x - a.x, m.y = p.y - a.y + o + _ * (o + 4);
    }), r.push(p);
  }
  const d = [...s, ...r];
  return { x: Math.min(0, ...d.map((l) => l.x)), y: Math.min(0, ...d.map((l) => l.y)), right: Math.max(0, ...d.map((l) => l.x + l.w)), bottom: Math.max(0, ...d.map((l) => l.y + l.h)) };
}
const Jo = (n) => {
  const e = n?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function er(n, e = 12) {
  const o = [...n.children].filter((d) => d.localName === "g" && d.id.startsWith("cell_")).map((d) => ({ ...Jo(d.getAttribute("transform")), w: +d.getAttribute("s:width"), h: +d.getAttribute("s:height"), labels: [...d.children].filter((l) => l.localName === "text" && l.hasAttribute("data-layout-label")).map((l) => ({ node: l, text: l.textContent })) })), r = [...n.children].filter((d) => d.localName === "line" && d.hasAttribute("data-net")).map((d) => ({ a: { x: +d.getAttribute("x1"), y: +d.getAttribute("y1") }, b: { x: +d.getAttribute("x2"), y: +d.getAttribute("y2") } })), s = Zo(o, r, e);
  for (const d of o) for (const l of d.labels)
    l.node.setAttribute("x", l.x), l.node.setAttribute("y", l.y), l.node.setAttribute("text-anchor", "start"), l.node.setAttribute("pointer-events", "none");
  return n.dataset.labelBounds = JSON.stringify(s), s;
}
function tr(n) {
  const e = n("diagnostics"), o = n("messages"), r = n("toggle-log");
  let s = 0, d = !0, l = !1;
  function a(m) {
    o.dataset.expanded = String(m), r.setAttribute("aria-expanded", String(m)), e.hidden = !m;
  }
  r.onclick = () => a(r.getAttribute("aria-expanded") !== "true");
  let c = [];
  const u = () => [e.clientWidth, e.clientHeight], f = () => u().some((m, _) => m !== c[_]);
  function v() {
    l || (l = !0, requestAnimationFrame(() => {
      d && (e.scrollTop = e.scrollHeight), c = u(), l = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (f()) {
      c = u(), d && v();
      return;
    }
    l || (d = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    c = u(), d && v();
  }).observe(e);
  function g({ message: m, severity: _ = "info", category: N = "Tools", line: E, source: w }) {
    if (!m) return;
    const C = d, A = /* @__PURE__ */ new Date(), S = document.createElement("li"), I = document.createElement("time"), O = document.createElement("span"), P = document.createElement("strong");
    _ = ["error", "warning", "info"].includes(_) ? _ : "info", S.className = _, S.dataset.logSequence = String(++s), S.dataset.logCategory = N, S.dataset.logSeverity = _, I.dateTime = A.toISOString(), I.textContent = A.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), I.title = I.dateTime, P.textContent = _.toUpperCase() + " · " + N + " ", O.append(P, document.createTextNode((w && w !== "input.cir" ? w + " · " : "") + (E ? "line " + E + " · " : "") + m)), S.append(I, O), e.append(S), n("message-count").textContent = s + " entries", _ !== "info" && a(!0), C && v();
  }
  return { append: g };
}
const Lt = Pe.filter.source, B = (n) => document.getElementById("spice-" + n), me = B("app");
if (me) {
  let d = function(M, { severity: i = "info", category: t = "Rendering" } = {}) {
    o.textContent = M, r.append({ message: M, severity: i, category: t });
  }, X = function() {
    const M = e.querySelector("svg");
    if (!M) return;
    u?.resetLabelDisplay();
    const i = Number(M.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, t = er(M, i), b = u?.placeLabels() || t;
    M.dataset.labelBounds = JSON.stringify(b);
    const h = Math.min(S.x, b.x - 20), T = Math.min(S.y, b.y - 20);
    S = { x: h, y: T, w: Math.max(S.x + S.w, b.right + 20) - h, h: Math.max(S.y + S.h, b.bottom + 20) - T }, f && Jn(M, v, f), u?.refreshColors(), Ge(M, q(), B("show-grid").checked, A);
    const Q = M.cloneNode(!0);
    u?.cleanExport(Q), Q.setAttribute("width", S.w), Q.setAttribute("height", S.h), Q.setAttribute("viewBox", `${S.x} ${S.y} ${S.w} ${S.h}`), Ge(Q, q(), B("show-grid").checked, S), p = new XMLSerializer().serializeToString(Q), B("source").value = p;
  }, D = function(M) {
    const i = B("example-info");
    if (i && (i.replaceChildren(), !!M && (i.append(document.createTextNode(M.description + " ")), M.url))) {
      const t = document.createElement("a");
      t.href = M.url, t.target = "_blank", t.rel = "noopener noreferrer", t.textContent = M.reference, i.append(t);
    }
  }, W = function() {
    u.invalidate(), H.setEnabled(!1), l = null, a = null, p = "", L(), D(Object.values(Pe).find((M) => M.source === n.value)), o.textContent = "Input changed — generate to refresh the schematic.";
  }, z = function(M) {
    for (const i of M) {
      const t = JSON.stringify([i.severity, i.line, i.message, i.source]);
      s.has(t) || (s.add(t), r.append({ ...i, category: "Parser / rendering" }));
    }
  }, K = function() {
    !C && p && x.set(E, { ...A }), e.querySelector("svg")?.setAttribute("viewBox", `${A.x} ${A.y} ${A.w} ${A.h}`);
    const M = e.querySelector("svg");
    M && Ge(M, q(), B("show-grid").checked, A), B("zoom-level").textContent = Math.round(S.w / A.w * 100) + "%";
  }, Y = function(M, i = A.x + A.w / 2, t = A.y + A.h / 2) {
    if (!e.querySelector("svg")) return;
    const b = Math.max(0.05, Math.min(10, A.w * M / S.w)) * S.w / A.w;
    A = { x: i + (A.x - i) * b, y: t + (A.y - t) * b, w: A.w * b, h: A.h * b }, K();
  }, pe = function(M) {
    const i = new URLSearchParams();
    M && i.set("instance", M);
    const t = i.toString();
    location.hash.slice(1) === t ? (E = M, fe()) : location.hash = t;
  }, ee = function() {
    E = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, ce = function() {
    const M = !!(w && w !== E && m?.contexts[w]);
    B("selection-actions").hidden = !M, B("open-instance").href = "#" + new URLSearchParams({ instance: w });
  }, be = function() {
    B("breadcrumbs").replaceChildren();
    const M = (t, b) => {
      const h = document.createElement("button");
      h.type = "button", h.textContent = t, h.onclick = () => pe(b), h.disabled = b === E, B("breadcrumbs").append(h);
    };
    if (M("Top", ""), E) {
      const t = m.contexts[E].path;
      for (let b = 0; b < t.length; b++) M(t[b], t.slice(0, b + 1).map(encodeURIComponent).join("/"));
    }
    B("instances").replaceChildren();
    const i = (t, b) => {
      for (const h of t.children) {
        const T = document.createElement("div");
        T.className = "spice-instance-row", T.style.setProperty("--depth", Math.min(b, 8)), T.dataset.instance = h.id;
        const Q = document.createElement("a");
        Q.href = "#" + new URLSearchParams({ instance: h.id }), Q.textContent = h.name + " · " + h.definition, Q.title = "Open " + h.id + " as its own sheet";
        const U = document.createElement("span");
        if (U.className = "spice-help", U.textContent = Object.entries(h.params).map(([V, F]) => V + "=" + F).join(" · "), T.append(Q), U.textContent) {
          const V = document.createElement("details"), F = document.createElement("summary");
          F.textContent = "Parameters", V.append(F, U), T.append(V);
        }
        B("instances").append(T), i(h, b + 1);
      }
    };
    i(m.contexts[E], 0), B("hierarchy-panel").hidden = !m.contexts[E].children.length, B("focus-title").textContent = E ? E + " / " + m.contexts[E].definition : "Top-level schematic", ce();
  };
  Fo(me), to(me);
  const n = B("input"), e = B("preview"), o = B("status"), r = tr(B);
  let s = /* @__PURE__ */ new Set(), l = null, a = null, c = !1, u = null, f = null, v = [], p = "", g, m, _, N = "", E = "", w = "", C = !1, A = { x: 0, y: 0, w: 1, h: 1 }, S = { ...A }, I, O = !1, P = {}, x = /* @__PURE__ */ new Map(), y = !1;
  try {
    P = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  me.addEventListener("click", (M) => {
    C && M.target.closest('a[href^="#"]') && M.preventDefault();
  });
  const L = () => {
    B("upload").disabled = C || y || c, B("download-project").disabled = B("open-download").disabled = B("copy").disabled = B("download").disabled = !p || C || y || u?.working(), B("download-asc").disabled = B("download-asc-bundle").disabled = !p || !l || C || c || !u?.complete();
  }, G = () => ({ font: B("font").value, fontSize: Number(B("size").value), color: ft, gridSize: B("grid").checked && B("conventional").checked ? ct : 0, detailed: B("detailed").checked, conventional: B("conventional").checked }), q = () => g?.layout.report?.gridSize ? Number(B("grid-size").value) : 0, H = eo(B, (M, i) => {
    f = M, v = i, X();
  });
  u = fo(e, B, { report: r.append, getNetColor: (M) => {
    const i = v.find((t) => t.bit === M);
    return i && f && (f.auto || f.manual.has(i.name)) ? f.color(i.name) : null;
  }, inspect: (M, i) => {
    const t = g?.components.find((b) => b.name === M);
    if (t)
      w = t.instanceId || "", B("selection").textContent = t.raw, ce();
    else if (i?.decoration) {
      w = "";
      const b = Object.values(g.nodes).find((h) => h.bit === i.ports[0]?.bit);
      B("selection").textContent = "Ground symbol · " + (b?.displayName || "0"), ce();
    }
  }, changed: (M, i, t) => {
    l = M, a = null, S = t;
    const b = e.querySelector("svg");
    if (b) {
      b.setAttribute("width", String(S.w)), b.setAttribute("height", String(S.h));
      const h = b.querySelector("#spice-layout-report");
      if (h) {
        const T = JSON.parse(h.textContent);
        T.manualWiring = i, T.verifiedTerminals = !i.unrouted, T.geometricConnectivityVerified = !i.unrouted, h.textContent = JSON.stringify(T);
      }
    }
    g && _ && (B("json").value = JSON.stringify({ circuit: g, netlist: Qe(g), hierarchy: _, interactive: { ...i, drawing: M } }, null, 2)), X(), L();
  } }), B("show-grid").onchange = X, B("grid-size").onchange = () => {
    X(), K();
  };
  async function k() {
    (!l || !g?.layout.report?.gridVerified) && (B("grid").checked = !0, B("conventional").checked = !0, await fe({ resetEditor: !0 })), u.setEnabled(B("interactive").checked), L();
  }
  B("interactive").onchange = k, B("label-edit").onclick = async () => {
    B("interactive").checked = !0, await k(), u.setLabelEditing(!u.labelEditing()), e.focus({ preventScroll: !0 });
  }, B("flywire").onchange = async () => {
    B("interactive").checked = !0, await k(), B("flywire").checked ? u.clear() : await u.autoRoute(), L();
  }, B("auto-route").onclick = async () => {
    B("interactive").checked = !0, await k(), await u.autoRoute(), L();
  }, B("wire-undo").onclick = () => u.undo(), B("wire-redo").onclick = () => u.redo();
  for (const M of me.querySelectorAll("[data-editor-mode]")) M.onclick = async () => {
    B("interactive").checked = !0, await k(), u.chooseTool(M.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const M of me.querySelectorAll("[data-editor-arrange]")) M.onclick = () => {
    u.arrange(M.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  H.setEnabled(!1), n.value = Lt;
  try {
    n.value = sessionStorage.getItem("spice-netlist-v2") || Lt;
  } catch {
  }
  D(Object.values(Pe).find((M) => M.source === n.value)), n.addEventListener("input", W);
  for (const M of ["font", "size", "detailed", "conventional", "grid"]) B(M).addEventListener("input", W);
  new ResizeObserver(() => {
    const M = e.querySelector("svg");
    M && Ge(M, q(), B("show-grid").checked, A);
  }).observe(e), B("zoom-in").onclick = () => Y(0.8), B("zoom-out").onclick = () => Y(1.25), B("fit").onclick = () => {
    A = { ...S }, K();
  };
  const de = (M) => {
    const i = e.querySelector("svg");
    return i ? new DOMPoint(M.clientX, M.clientY).matrixTransform(i.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (M) => {
    const i = de(M);
    i && (M.preventDefault(), Y(M.deltaY > 0 ? 1.12 : 1 / 1.12, i.x, i.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (M) => {
    ![0, 1].includes(M.button) || !e.querySelector("svg") || (I = { start: de(M), x: M.clientX, y: M.clientY, view: { ...A }, moved: !1 }, e.setPointerCapture(M.pointerId));
  }), e.addEventListener("pointermove", (M) => {
    if (!I) return;
    const i = de(M);
    Math.hypot(M.clientX - I.x, M.clientY - I.y) > 4 && (I.moved = !0), A.x += I.start.x - i.x, A.y += I.start.y - i.y, K();
  }), e.addEventListener("pointerup", (M) => {
    if (!I) return;
    const i = I.moved;
    if (I = null, e.hasPointerCapture(M.pointerId) && e.releasePointerCapture(M.pointerId), !i && !u?.labelEditing()) {
      const t = document.elementFromPoint(M.clientX, M.clientY)?.closest("[data-component]"), b = g?.components.find((h) => h.name === t?.dataset.component);
      b && (w = b.instanceId || "", B("selection").textContent = `${b.raw}
${Object.entries(b.terminals).map(([h, T]) => `${h} → ${T}`).join("   ")}`, b.kind === "X" ? pe(b.instanceId) : ce());
    }
  }), window.addEventListener("hashchange", () => {
    if (C) {
      O = !0;
      return;
    }
    ee(), w = "", fe();
  }), e.addEventListener("pointercancel", () => {
    I = null;
  }), e.addEventListener("keydown", (M) => {
    const i = M.target.closest("[data-instance]");
    if (i && !u?.labelEditing() && (M.key === "Enter" || M.key === " ")) {
      M.preventDefault(), w = i.dataset.instance, pe(w);
      return;
    }
    M.key === "+" || M.key === "=" ? Y(0.8) : M.key === "-" ? Y(1.25) : M.key.toLowerCase() === "f" ? (A = { ...S }, K()) : M.key.startsWith("Arrow") && (M.preventDefault(), A.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[M.key] || 0) * A.w, A.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[M.key] || 0) * A.h, K());
  });
  async function fe({ resetEditor: M = !1 } = {}) {
    if (C) return;
    s = /* @__PURE__ */ new Set(), C = !0, u.invalidate(), H.setEnabled(!1), l = null, a = null, p = "", L(), B("generate").disabled = !0, n.readOnly = !0, B("file").disabled = !0, B("libraries").disabled = !0;
    for (const t of me.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) t.disabled = !0;
    d("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let i = [];
    try {
      if (N !== n.value || !m) {
        if (N && N !== n.value && (u.clearSheets(), x.clear()), _ = xt(n.value, { files: P }), i = [..._.diagnostics], i.some((j) => j.severity === "error"))
          throw m = null, Error("Fix the parser errors below before generating.");
        m = qe(_), N && N !== n.value ? (E = "", w = "", history.replaceState(null, "", location.pathname + location.search)) : ee(), N = n.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", n.value);
        } catch {
        }
      }
      if (i = [..._.diagnostics], z(i), i.some((j) => j.severity === "error")) throw Error("Fix the parser errors below before generating.");
      g = Ve(m, { focus: E });
      for (const j of g.interfaceAliases) i.push({ severity: "info", message: `Instance boundary: ${j.ports.join(" = ")} share parent node ${j.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const t = Qe(g);
      G().conventional && i.push(...g.layout.diagnostics);
      const b = await Ke(t, G()), h = new DOMParser().parseFromString(b.svg, "image/svg+xml");
      if (h.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const T = h.documentElement, Q = T.querySelector("#spice-layout-report");
      if (Q) {
        g.layout.report = JSON.parse(Q.textContent);
        const j = g.layout.report;
        if (i.push({ severity: "info", message: `Layout: compact signal flow; ${j.powerSourcesChecked} DC/ground symbols checked, ${j.powerOrderViolations} DC order preference(s) unmet. ${j.powerPass}. ${j.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), j.classicTemplateFallback && i.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), j.groundPlacement && i.push({ severity: "info", message: `Ground: ${j.groundPlacement}; ${j.straightenedGroundDrops || 0} return-path simplification(s).` }), j.explicitGroups && i.push({ severity: "info", message: `Layout comments: ${j.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), j.classicRails && i.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${j.railCount} shared voltage rails.` }), j.localClassicInstances?.length && i.push({ severity: "info", message: `${j.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), j.localClassicStages?.length && i.push({ severity: "info", message: `Classic transistor proximity active: ${j.localClassicStages.join(", ")}.` }), j.sharedClassicRails && i.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), j.mirroredTransistors?.length && i.push({ severity: "info", message: `Control-pin mirror choices: ${j.mirroredTransistors.join(", ")}.` }), j.recognizedMotifs?.length && i.push({ severity: "info", message: `Transistor structures: ${j.recognizedMotifs.map((J) => `${J.kind} (${J.members.join(", ")}; ${J.confidence})`).join("; ")}.` }), j.appliedMotifs?.length && i.push({ severity: "info", message: `Topology preferences applied to ${j.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), j.subnetFirstFallback && i.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + j.subnetFirstFallback }), j.pairCompactionFallback && i.push({ severity: "warning", message: "Pair proximity kept the original regions: " + j.pairCompactionFallback }), j.compoundPairFallback && i.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + j.compoundPairFallback }), j.pairConstraints?.length) {
          const J = j.pairConstraints.filter((ue) => ue.crossRegion && !ue.compacted).length;
          i.push({ severity: "info", message: `${j.pairConstraints.length - J} adjacent transistor pair(s); ${J} cross-region mirror row constraint(s).` });
        }
        j.netShortcuts && i.push({ severity: "info", message: `${j.netShortcuts} safe straight net shortcut(s); ${j.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), j.sharedRailFallback && i.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${j.sharedRailFallback}.` });
        for (const J of j.localClassicFallbacks || []) J.stage && i.push({ severity: "info", message: `Classic stage ${J.stage} uses automatic layout: ${J.reason || "No unobstructed local template"}.` });
        j.geometricConnectivityVerified && i.push({ severity: "info", message: `Net geometry verified; ${j.cyclesRemoved} same-net loop(s) and ${j.leavesRemoved} unused wire branch(es) removed.` }), z(i);
      }
      if (T.localName !== "svg" || T.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const U = Number(T.getAttribute("width")), V = Number(T.getAttribute("height")), F = JSON.parse(T.getAttribute("data-label-bounds") || "null");
      S = { x: Math.min(-20, (F?.x ?? 0) - 20), y: Math.min(-20, (F?.y ?? 0) - 20) }, S.w = Math.max(U, F?.right || 0) + 20 - S.x, S.h = Math.max(V, F?.bottom || 0) + 20 - S.y, A = { ...S }, T.setAttribute("viewBox", `${S.x} ${S.y} ${S.w} ${S.h}`), T.setAttribute("width", String(S.w)), T.setAttribute("height", String(S.h)), T.setAttribute("role", "img"), T.setAttribute("aria-label", g.title || "SPICE schematic"), T.setAttribute("style", "background:white");
      for (const j of g.components) {
        const J = h.getElementById("cell_" + j.name);
        if (!J) throw Error("Renderer omitted component " + j.name);
        J.setAttribute("data-component", j.name), j.kind === "X" && (J.setAttribute("data-instance", j.instanceId), J.setAttribute("role", "button"), J.setAttribute("tabindex", "0"), J.setAttribute("aria-label", "Open " + j.name));
        const ue = h.createElementNS(T.namespaceURI, "title");
        ue.textContent = j.raw + `
Resolved: ` + j.value + `
` + Object.entries(j.terminals).map(([Ee, _e]) => Ee + ": " + _e).join(", "), J.prepend(ue);
      }
      for (const j of Object.values(g.nodes))
        for (const J of T.querySelectorAll(".net_" + j.bit)) {
          J.setAttribute("data-net", j.name);
          const ue = h.createElementNS(T.namespaceURI, "title");
          ue.textContent = "Node " + j.displayName, J.append(ue);
        }
      const Z = g.components.filter((j) => j.kind === "K").map((j) => ({ name: j.name, inductors: j.coupledInductors, value: j.value }));
      if (Z.length) {
        const j = h.createElementNS(T.namespaceURI, "metadata");
        j.setAttribute("id", "spice-magnetic-couplings"), j.textContent = JSON.stringify(Z), T.append(j);
        for (const J of Z) for (const ue of J.inductors) {
          const Ee = h.getElementById("cell_" + ue);
          if (!Ee) continue;
          const _e = h.createElementNS(T.namespaceURI, "circle"), Xe = [...Ee.children].find(($e) => $e.getAttribute("s:pid") === "A"), Kt = Xe?.getAttribute("s:position"), ht = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Kt] || [0, 0];
          for (const [$e, Zt] of Object.entries({ cx: Number(Xe?.getAttribute("s:x")) + ht[0], cy: Number(Xe?.getAttribute("s:y")) + ht[1], r: 3, fill: G().color, stroke: "none", "data-coupling": J.name })) _e.setAttribute($e, String(Zt));
          const mt = h.createElementNS(T.namespaceURI, "title");
          mt.textContent = J.name + " · dotted terminal: " + J.inductors.join(", "), _e.append(mt), Ee.append(_e);
        }
      }
      l = b.drawing, p = new XMLSerializer().serializeToString(T), B("source").value = p, e.replaceChildren(document.importNode(T, !0)), K();
      const $ = i.filter((j) => j.severity === "warning").length;
      o.textContent = `${g.components.filter((j) => !j.synthetic).length} components · ${Object.keys(g.nodes).length} nodes · ${g.topology.leafCount} primitive devices verified${g.interfaceAliases.length ? " · Parent-connected ports: " + g.interfaceAliases.map((j) => j.ports.join(" = ")).join("; ") + "." : ""}${$ ? " · Review " + $ + " warning(s); drawing may be partial." : " · Schematic ready."}`, o.textContent += ` Layout rules v${Be}.`, g.layout.report?.gridVerified && (o.textContent += ` Grid ${g.layout.report.gridSize}.`), g.layout?.report?.powerOrderViolations && (o.textContent += ` Layout: ${g.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), g.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (o.textContent += " Ground marker: routed fallback; no safe short attachment found."), r.append({ message: o.textContent, category: "Rendering", severity: $ ? "warning" : "info" }), B("json").value = JSON.stringify({ circuit: g, netlist: t, hierarchy: _ }, null, 2), H.setCircuit(g, n.value), u.mount(e.querySelector("svg"), l, g, t, G(), { reset: M, scope: E }), X(), !M && x.has(E) ? A = { ...x.get(E) } : x.set(E, { ...A }), K(), B("selection").textContent = "Click a component to inspect its original statement and pin connections.", be();
    } catch (t) {
      if (e.replaceChildren(), p = "", B("source").value = "", B("json").value = "", B("nets").replaceChildren(), B("selection").textContent = "", d(t.message, { severity: "error" }), !m)
        B("hierarchy-panel").hidden = !0, B("selection-actions").hidden = !0, B("breadcrumbs").replaceChildren();
      else if (!m.contexts[E]) {
        const b = document.createElement("button");
        b.type = "button", b.textContent = "Return to Top", b.onclick = () => pe(""), B("breadcrumbs").replaceChildren(b);
      }
      H.setCircuit(null, n.value), t.diagnostics && (i = t.diagnostics), i.some((b) => b.severity === "error") || i.push({ severity: "error", line: 0, message: t.message }), z(i);
    } finally {
      C = !1, B("generate").disabled = !1, n.readOnly = !1, B("file").disabled = !1, B("libraries").disabled = !1;
      for (const t of me.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) t.disabled = !1;
      m && m.contexts[E] && be(), H.setEnabled(!!p), u.refreshControls(), e.setAttribute("aria-busy", "false"), L(), O && (O = !1, ee(), queueMicrotask(fe));
    }
  }
  B("generate").onclick = () => fe({ resetEditor: !0 });
  for (const M of me.querySelectorAll("[data-example]")) M.onclick = () => {
    const i = Pe[M.dataset.example];
    n.value = i.source, W(), D(i), fe();
  };
  B("file").onchange = async (M) => {
    const i = M.target.files[0];
    if (i) {
      if (C || y) {
        M.target.value = "";
        return;
      }
      try {
        const t = /\.(spiceproj|json)$/i.test(i.name);
        if (i.size > (t ? qt : 2e6)) throw Error(t ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        t ? await Ae(await i.text()) : (n.value = await Nt(i), W(), await fe());
      } catch (t) {
        d("File could not be opened: " + t.message, { severity: "error", category: "Files" });
      } finally {
        M.target.value = "", L();
      }
    }
  };
  async function Ae(M) {
    y = !0, L();
    const i = me.inert;
    me.inert = !0;
    try {
      const t = zt(M), b = xt(t.source, { files: t.libraries });
      if (b.diagnostics.some((T) => T.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const h = qe(b);
      if (!h.contexts[t.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const T of t.sheets) {
        if (!h.contexts[T.scope]) throw Error("Unknown saved sheet: " + T.scope);
        const Q = Ve(h, { focus: T.scope });
        if (Q.topology.signature !== T.topology) throw Error("Saved topology differs from the netlist: " + (T.scope || "Top"));
        const U = new Map(Q.components.filter(($) => $.kind !== "K").map(($) => [$.name, $]));
        for (const $ of T.snapshot.components) {
          if ($.decoration) continue;
          const j = U.get($.id);
          if (!j || $.ports.length !== Object.keys(j.terminals).length || $.ports.some((J) => Q.nodes[j.terminals[J.pin]]?.bit !== J.bit)) throw Error("Saved pin connectivity differs from the netlist: " + $.id);
          U.delete($.id);
        }
        if (U.size) throw Error("Saved sheet omits components.");
        d("Checking saved sheet " + (T.scope || "Top") + "…", { category: "Files" });
        const V = Qe(Q), F = await Ke(V, T.settings), Z = new DOMParser().parseFromString(F.svg, "image/svg+xml").documentElement;
        for (const $ of Object.values(Q.nodes)) for (const j of Z.querySelectorAll(".net_" + $.bit)) j.setAttribute("data-net", $.name);
        Ft(Z, T.snapshot.labelOverrides), $t(Yt(Z, F.drawing, Q, V), T.snapshot, T.settings.gridSize);
      }
      t.sheets.some((T) => T.scope === t.focus && JSON.stringify(T.settings) === JSON.stringify(t.settings)) || (d("Checking current sheet…", { category: "Files" }), await Ke(Qe(Ve(h, { focus: t.focus })), t.settings)), u.invalidate(), u.restoreSheets(t.sheets), x = new Map(t.sheets.filter((T) => T.view).map((T) => [T.scope, T.view])), x.set(t.focus, t.view), n.value = t.source, P = t.libraries, m = h, _ = b, N = t.source, E = t.focus, w = "";
      for (const T of ["font", "size"]) B(T).value = T === "font" ? t.settings.font : t.settings.fontSize;
      for (const [T, Q] of Object.entries({ detailed: t.settings.detailed, conventional: t.settings.conventional, grid: !!t.settings.gridSize, "show-grid": t.showGrid, interactive: t.interactive, flywire: t.flywire })) B(T).checked = Q;
      B("grid-size").value = t.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (E ? "#" + new URLSearchParams({ instance: E }) : "")), H.restore(t.colors), D(Object.values(Pe).find((T) => T.source === n.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(P)), sessionStorage.setItem("spice-netlist-v2", n.value);
      } catch {
      }
      B("library-status").textContent = Object.keys(P).length + " project library file(s) loaded", await fe(), p && (u.setLabelEditing(t.labelEditing === !0), o.textContent += " Project restored.", r.append({ message: "Project restored.", category: "Files" }));
    } finally {
      me.inert = i, y = !1, L();
    }
  }
  B("libraries").onchange = async (M) => {
    try {
      for (const i of M.target.files) {
        if (i.size > 16e6) throw Error("Library exceeds 16 MB: " + i.name);
        P[i.webkitRelativePath || i.name] = await Nt(i);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(P));
      } catch {
      }
      u.invalidate(), u.clearSheets(), x.clear(), m = null, N = "", B("library-status").textContent = Object.keys(P).length + " library file(s) loaded", fe();
    } catch (i) {
      d(i.message, { severity: "error", category: "Files" });
    } finally {
      M.target.value = "";
    }
  }, B("library-status").textContent = Object.keys(P).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const se = B("download-dialog");
  me.addEventListener("spice:workspacechange", () => {
    se.open && se.close();
  }), B("open-download").onclick = () => {
    L(), se.showModal();
  }, B("close-download").onclick = () => se.close(), se.addEventListener("click", (M) => {
    if (M.target !== se) return;
    const i = se.getBoundingClientRect();
    (M.clientX < i.left || M.clientX > i.right || M.clientY < i.top || M.clientY > i.bottom) && se.close();
  }), document.addEventListener("keydown", (M) => {
    se.open && !(M.altKey && M.key === "Escape") && (M.stopImmediatePropagation(), M.key === "Escape" && (M.preventDefault(), se.close()));
  }, { capture: !0 }), B("upload").onclick = () => B("file").click(), B("download-project").onclick = () => {
    try {
      const M = u.snapshotSheets().filter((h) => m?.contexts[h.scope] && Ve(m, { focus: h.scope }).topology.signature === h.topology).map((h) => ({ ...h, ...x.has(h.scope) ? { view: x.get(h.scope) } : {} })), i = ao({ source: n.value, libraries: P, settings: G(), displayGridStep: Number(B("grid-size").value), showGrid: B("show-grid").checked, interactive: B("interactive").checked, flywire: B("flywire").checked, labelEditing: u.labelEditing(), focus: E, view: { ...A }, colors: H.snapshot(), sheets: M });
      se.close();
      const t = URL.createObjectURL(new Blob([i], { type: "application/json;charset=utf-8" })), b = document.createElement("a");
      b.href = t, b.download = "spice-schematic.spiceproj", b.click(), setTimeout(() => URL.revokeObjectURL(t), 1e3), d("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (M) {
      d("Project save failed: " + M.message, { severity: "error", category: "Files" });
    }
  }, B("download").onclick = () => {
    se.close();
    const M = URL.createObjectURL(new Blob([p], { type: "image/svg+xml;charset=utf-8" })), i = document.createElement("a");
    i.href = M, i.download = "spice-schematic.svg", i.click(), setTimeout(() => URL.revokeObjectURL(M), 1e3), d("SVG downloaded.", { category: "Export" });
  };
  async function we(M) {
    const i = l;
    if (!(!i || C || c)) {
      c = !0, L(), d("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: t } = await import("./asc-export-CrvJPrQA.js");
        if (l !== i) throw Error("Schematic changed. Generate again before exporting ASC.");
        a ||= t({ tree: m, circuit: g, drawing: i, source: n.value, libraries: P });
        const b = M ? a.zip : a.ascBytes, h = URL.createObjectURL(new Blob([b], { type: M ? "application/zip" : "application/octet-stream" })), T = document.createElement("a");
        T.href = h, T.download = M ? "spice-schematic-asc.zip" : "spice-schematic.asc", T.click(), setTimeout(() => URL.revokeObjectURL(h), 1e3), o.textContent = "ASC connections verified · " + a.manifest.audit.symbols + " symbols. " + (M ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), a.manifest.warnings.length && (o.textContent += " " + a.manifest.warnings.join(" ")), r.append({ message: o.textContent, category: "Export", severity: a.manifest.warnings.length ? "warning" : "info" });
      } catch (t) {
        d("ASC export failed: " + t.message, { severity: "error", category: "Export" });
      } finally {
        c = !1, L();
      }
    }
  }
  B("download-asc").onclick = () => {
    se.close(), we(!1);
  }, B("download-asc-bundle").onclick = () => {
    se.close(), we(!0);
  }, B("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(p), d("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      B("source-details").open = !0, B("source").focus(), B("source").select(), d("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, fe();
}
export {
  st as b,
  qe as e,
  Me as l,
  it as n,
  Sn as p
};
