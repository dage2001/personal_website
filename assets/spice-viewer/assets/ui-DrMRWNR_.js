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
}, _t = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", fe = (t) => t.toLowerCase(), $e = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Nt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function vt(t, e) {
  const n = (C) => e[fe(C || "")] || Object.entries(e).find(([b]) => b.startsWith(fe(C || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let r = [], o = [], l = "", a = "", c = [], u = [], s = 0, h = "", f = "", m = "", y = !0;
  if ("RLC".includes(i))
    r = ["A", "B"], a = fe(i) + "_v";
  else if ("DVIB".includes(i))
    r = ["+", "-"], a = i === "D" ? "d_v" : i === "B" ? "spice_b" : fe(i);
  else if (i === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !$e(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), l = t[r.length + 1] || "";
    const C = n(l)?.type;
    y = ["NPN", "PNP"].includes(C), a = y ? (r.length === 3 ? "q_" : "spice_q4_") + fe(C) : "spice_q" + r.length;
  } else if (i === "M") {
    const C = n(t[4]), b = n(t[5]), p = C?.type === "VDMOS" || !b && (!t[5] || $e(t[5]));
    r = p ? ["D", "G", "S"] : ["D", "G", "S", "B"], l = t[r.length + 1] || "";
    const _ = n(l), v = _?.type;
    if (p && _ && v !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!p && v === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    y = ["NMOS", "PMOS", "VDMOS"].includes(v);
    let A = null, x = _;
    const k = /* @__PURE__ */ new Set();
    for (; x && !k.has(x.name) && (k.add(x.name), A = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !A); )
      x = n(x.baseModel);
    const L = v === "PMOS" || v === "VDMOS" && A && (A[1] === void 0 || Number(A[1]) >= 0.5);
    a = y ? "spice_" + (L ? "pmos" : "nmos") + (p ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    l = t[4] || "";
    const C = n(l)?.type, b = i === "Z" && ["NIGBT", "PIGBT"].includes(C);
    r = b ? ["C", "G", "E"] : ["D", "G", "S"], y = i === "J" ? ["NJF", "PJF"].includes(C) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(C), a = "spice_" + (b ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(C || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    r = ["+", "-"], a = "spice_" + fe(i);
    let C = 3, b = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[C] || "");
    if (/^poly$/i.test(t[C] || "") && (b = /^\(\s*(\d+)\s*\)$/.exec(t[++C] || ""), !b))
      throw Error("POLY requires a dimension.");
    if (b) {
      const p = Number(b[1]);
      if (p > 128) throw Error("POLY supports at most 128 controlling variables.");
      let _ = C + 1, v = [];
      const A = "EG".includes(i), x = p * (A ? 2 : 1);
      for (; v.length < x && _ < t.length; ) v.push(...Nt(t[_++]));
      if (v.length !== x || _ >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (A) {
        for (let k = 0; k < p; k++) r.push("C" + (k + 1) + "+", "C" + (k + 1) + "-");
        o = [t[1], t[2], ...v];
      } else c = v;
      s = _, h = "POLY(" + p + ") " + (A ? "" : v.join(" ") + " "), f = "POLY", A && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? f = "BEHAVIORAL" : "EG".includes(i) ? (r.push("C+", "C-"), f = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], s = 4, h = t[3] + " ");
    m = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (f ? " · " + f : "");
  } else if (i === "S")
    r = ["A", "B", "C+", "C-"], l = t[5] || "", a = "spice_device", m = "Voltage switch";
  else if (i === "W")
    r = ["A", "B"], c = [t[3]], l = t[4] || "", s = 3, a = "spice_device", m = "Current switch";
  else if ("TO".includes(i))
    r = ["L+", "L-", "R+", "R-"], i === "O" && (l = t[5] || ""), a = "spice_device", m = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    r = ["N1", "N2", "COM"], l = t[4] || "", a = "spice_device", m = "Distributed RC";
  else if (i === "A")
    r = Array.from({ length: 8 }, (C, b) => "P" + (b + 1)), a = "spice_device", m = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (u = t.slice(1, -1), u.some((C) => !/^L/i.test(C.split(":").at(-1)))) throw Error("K references must name inductors.");
    s = t.length - 1, a = "spice_coupling", m = "Magnetic coupling", h = u.join(" ") + " · k=";
  } else if (i === "@")
    r = ["IN", "OUT"], a = "spice_device", m = "FRA";
  else if (i === "&")
    r = ["O+", "O-", "I+", "I-"], a = "spice_device", m = "FRA probe";
  else if (i === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", m = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (s || (s = r.length + 1), o.length || (o = t.slice(1, r.length + 1)), o.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= s && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (o.some((C) => /[=()]/.test(C) && !/^\{[\s\S]*\}$/.test(C))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(s).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(s).join(" ")) && (a = "spice_br"), i === "D" && (l = t[3] || ""), i === "@") {
    const C = t.slice(s).join(" ");
    for (const b of C.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(b[1].toUpperCase()), o.push(b[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((C) => !C)) throw Error("Missing controlling voltage source.");
  const w = r.map((C, b) => i === "A" && xt[(t[9] || "").toUpperCase()]?.[String(b + 1)] || C);
  return { kind: i, pins: r, nodeTokens: o, pinLabels: w, model: l, type: a, controlSource: c[0] || "", controlSources: c, coupledInductors: u, value: h + t.slice(s).join(" "), sourceMode: f, symbol: m, polarityKnown: y };
}
const Ct = _t, It = new Set(Ct.split(" ")), Re = () => /* @__PURE__ */ Object.create(null), te = (t) => t.toLowerCase();
function Ce(t) {
  const e = [], n = [];
  let i = "", r = 0, o = "";
  for (let l = 0; l < t.length; l++) {
    const a = t[l];
    if (o) {
      i += a, a === o && t[l - 1] !== "\\" && (o = "");
      continue;
    }
    if (a === '"' || a === "'") {
      o = a, i += a;
      continue;
    }
    if (!r && (a === ";" || a === "$" && (!l || /\s/.test(t[l - 1])))) break;
    if ("({".includes(a) && (n.push(a), r++), ")}".includes(a) && (r--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !r ? (i && e.push(i), i = "") : i += a;
  }
  if (r || o) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function St(t, e = {}) {
  const n = [], i = [], r = [], o = Object.assign(Re(), e.models), l = Re(), a = (b, p, _) => n.push({ severity: b, line: p, message: _ });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, p) => {
    const _ = b.trim();
    !_ || _.startsWith("*") || (_.startsWith("+") ? c.length ? c.at(-1).text += " " + _.slice(1).trim() : a("error", p + 1, "Continuation has no preceding statement.") : c.push({ line: p + 1, text: _ }));
  });
  for (const b of c) {
    try {
      b.tokens = Ce(b.text);
    } catch (_) {
      a("error", b.line, _.message), b.tokens = [];
    }
    const p = b.tokens;
    if (/^\.model$/i.test(p[0] || ""))
      if (p.length < 3) a("error", b.line, ".model requires a name and device type.");
      else {
        const _ = /^ako:(.+)$/i.exec(p[2]), v = _ && p[3] && !p[3].startsWith("(") ? p[3].split("(")[0].toUpperCase() : "";
        o[te(p[1])] = { name: p[1], type: _ ? v : p[2].split("(")[0].toUpperCase(), baseModel: _?.[1] || "", raw: b.text };
      }
  }
  const u = /* @__PURE__ */ new Set();
  function s(b) {
    const p = o[te(b)];
    if (!p) return "";
    if (p.type) return p.type;
    if (u.has(te(b))) throw Error("Circular AKO model inheritance: " + b);
    return u.add(te(b)), p.type = s(p.baseModel), u.delete(te(b)), p.type;
  }
  for (const b of Object.values(o)) if (b.baseModel && !b.type)
    try {
      s(b.name);
    } catch (p) {
      a("error", 0, p.message);
    }
  let h = "", f = 0, m = !1, y = !1;
  const w = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: b, text: p, tokens: _ } of c) {
    if (!_.length) continue;
    const v = te(_[0]);
    if (y) {
      a("warning", b, "Statement after .end is not rendered: " + p);
      continue;
    }
    if (v === ".control") {
      m = !0, a("warning", b, ".control script retained but not executed or rendered.");
      continue;
    }
    if (v === ".endc") {
      m = !1;
      continue;
    }
    if (m) continue;
    if (v === ".subckt") {
      f++, a("error", b, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (v === ".ends") {
      f ? f-- : a("error", b, "Unmatched .ends.");
      continue;
    }
    if (f) continue;
    if (v === ".end") {
      y = !0;
      continue;
    }
    if (v.startsWith(".")) {
      i.push({ line: b, text: p }), v === ".title" ? h = _.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(v) ? a("error", b, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(v) ? a("error", b, "Topology-changing directive is unsupported: " + p) : C.has(v) || a("warning", b, "Directive retained but not resolved: " + p);
      continue;
    }
    const A = _[0][0].toUpperCase();
    if (!It.has(A)) {
      b === 1 && !/\d/.test(_[0]) && _.length > 1 && A !== "X" ? (h = p, a("warning", b, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", b, `Unsupported ${A} device was not rendered: ${p}`);
      continue;
    }
    const x = A === "M" || A === "Q" ? 5 : 4;
    if (b === 1 && !/\d/.test(_[0]) && (_.length < x || A === "T" && !/\b(?:zo|z0)\s*=/i.test(p))) {
      h = p, a("info", b, "SPICE title: " + p);
      continue;
    }
    try {
      if (w.has(v)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const k = vt(_, o), { pins: L, nodeTokens: d, ...N } = k;
      k.polarityKnown || a("warning", b, `${_[0]}: model polarity unknown; explicit ${L.join("/")} terminals retained.`);
      const g = Re();
      L.forEach((M, E) => {
        const P = te(d[E]);
        l[P] || (l[P] = { name: P, displayName: _[E + 1], bit: Object.keys(l).length + 2, terminals: [] }), l[P].terminals.push({ component: _[0], pin: M }), g[M] = P;
      }), r.push({ ...N, name: _[0], terminals: g, line: b, raw: p }), w.add(v);
    } catch (k) {
      a("error", b, `${_[0]}: ${k.message} Statement: ${p}`);
    }
  }
  f && a("error", 0, "Unclosed .subckt definition."), m && a("error", 0, "Unclosed .control block."), r.length || a("error", 0, "No supported components to render."), r.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const b of r) {
    for (const p of b.controlSources || []) !p.includes(":") && !r.some((_) => te(_.name) === te(p) && _.kind === "V") && a("error", b.line, `${b.name}: controlling voltage source ${p} was not found.`);
    for (const p of b.coupledInductors || []) !p.includes(":") && !r.some((_) => te(_.name) === te(p) && _.kind === "L") && a("error", b.line, `${b.name}: coupled inductor ${p} was not found.`);
    (b.kind === "B" || b.type === "spice_b") && a("info", b.line, `${b.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: h, components: r, nodes: l, models: o, directives: i, diagnostics: n };
}
const le = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), We = (t) => le(t).split("/").at(-1);
function kt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), r = [], o = [], l = [];
  let a = 0;
  const c = (s, h) => {
    const f = le(h).split("/").slice(0, -1).concat(le(s)).join("/"), m = [...i].filter(([w]) => le(w) === le(s) || le(w) === f);
    if (m.length === 1) return m[0];
    const y = [...i].filter(([w]) => We(w) === We(s));
    if (y.length !== 1) throw Error(y.length ? "Ambiguous library filename: " + s : "Missing library " + s + ". Add this file using Library files.");
    return y[0];
  };
  function u(s, h, f = "", m = []) {
    const y = le(h) + ":" + f.toLowerCase();
    if (m.includes(y)) throw Error("Circular library include: " + [...m, y].join(" → "));
    if (m.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const w = [], C = /^\s*\.endl\b/im.test(s);
    let b = !f;
    const p = (v, A) => {
      if (a += v.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      l.push(v), o.push({ file: h, line: A + 1 });
    };
    if (s.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((v, A) => {
      const x = v.trim();
      if (/^\.lib\b/i.test(x) && C) {
        const k = Ce(x);
        if (k.length === 2 && !/[.\\/]/.test(k[1])) {
          w.push(k[1].toLowerCase()), k[1].toLowerCase() === f.toLowerCase() && (b = !0), p("* Library section " + k[1], A);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        w.pop(), p("* End library section", A);
        return;
      }
      if (f && w.length && !w.includes(f.toLowerCase())) {
        p("* Unselected library section", A);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const k = Ce(x);
          if (!k[1]) throw Error("Include requires a filename.");
          const [L, d] = c(k[1], h);
          p("* Included " + L, A), u(d, L, k[2] || "", [...m, y]);
        } catch (k) {
          r.push({ severity: "error", line: A + 1, source: h, message: k.message }), p("* Unresolved include", A);
        }
      else p(v, A);
    }), !b) throw Error("Library section " + f + " not found in " + h);
  }
  try {
    u(t, n);
  } catch (s) {
    r.push({ severity: "error", line: 0, source: n, message: s.message });
  }
  return { source: l.join(`
`), origins: o, diagnostics: r };
}
function Ot(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], r = [];
  t.split(/\r?\n/).forEach((a, c) => {
    const u = a.trim();
    /^\.subckt\b/i.test(u) && (i.push(c + 1), n.set(c + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: a, line: c + 1 }) : e[c] = a, /^\.ends\b/i.test(u) && i.length > 1 && i.pop();
  });
  const o = He(Array.from({ length: t.split(/\r?\n/).length }, (a, c) => e[c] || "").join(`
`));
  r.push(...o.diagnostics);
  const l = /* @__PURE__ */ new Map();
  for (const [a, c] of n) {
    const u = He(c.map((s) => s.raw).join(`
`));
    l.set(a, u.layout), r.push(...u.diagnostics.map((s) => ({ ...s, line: c[s.line - 1]?.line || a })));
  }
  return { layout: o.layout, scopes: l, diagnostics: r };
}
function He(t) {
  const e = [], n = [];
  let i = !1, r = !1, o = 0;
  if (t.split(/\r?\n/).forEach((p, _) => {
    const v = p.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(v)) {
      (r || i) && e.push({ severity: "error", line: _ + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(v) || e.push({ severity: "error", line: _ + 1, message: "Expected @layout begin v1." }), r = !0, i = !0, o = _ + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(v)) {
      i || e.push({ severity: "error", line: _ + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (v.startsWith("*") ? n.push(v.slice(1).trim()) : e.push({ severity: "error", line: _ + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: o, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const l = n.join(" "), a = l.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], u = [], s = [], h = [];
  let f = 0, m = 0, y = 10;
  const w = () => a[f++], C = () => {
    const p = w();
    if (!p || !/^[A-Za-z_@][\w./%:@-]*$/.test(p)) throw Error("Expected layout identifier, got " + p);
    return p;
  };
  function b(p) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const _ = p ? C() : "@row" + m++, v = w();
    if (!["row", "column", "classic"].includes(v)) throw Error("Expected row, column or classic.");
    if (w() !== "{") throw Error("Expected { after " + v);
    const A = { id: _, direction: v, members: [] };
    for (c.push(A); f < a.length && a[f] !== "}"; )
      a[f] === "group" ? (w(), A.members.push(b(!0))) : ["row", "column"].includes(a[f]) ? A.members.push(b(!1)) : A.members.push(C());
    if (w() !== "}") throw Error("Unclosed group " + _);
    if (!A.members.length) throw Error("Empty layout group " + _);
    return _;
  }
  try {
    for (; f < a.length; )
      if (a[f] === "group")
        w(), b(!0);
      else if (["row", "column"].includes(a[f])) b(!1);
      else if (a[f] === "face") {
        w();
        const d = C(), N = w();
        if (!["left", "right"].includes(N)) throw Error("Expected face left or right.");
        if (h.some((g) => g.device.toLowerCase() === d.toLowerCase())) throw Error("Duplicate face device.");
        h.push({ device: d, side: N });
      } else if (a[f] === "pair") {
        w();
        const d = w();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(d)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (w() !== "{") throw Error("Expected { after pair kind.");
        const N = [];
        for (; f < a.length && a[f] !== "}"; ) N.push(C());
        if (w() !== "}" || !N.length) throw Error("Empty or unclosed pair.");
        if (s.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        s.push({ kind: d, members: N });
      } else if (a[f] === "priority-cap") {
        if (w(), y = Number(w()), !Number.isInteger(y) || y < 3 || y > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (w() === "place") {
        const d = C(), N = w(), g = C();
        if (!["left-of", "above"].includes(N)) throw Error("Expected left-of or above.");
        u.push({ a: d, relation: N, b: g });
      } else throw Error("Unknown layout instruction near " + a[f - 1]);
    const p = /* @__PURE__ */ new Set();
    for (const d of c) {
      const N = d.id.toLowerCase();
      if (p.has(N)) throw Error("Duplicate layout group " + d.id);
      p.add(N);
    }
    const _ = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set(), A = new Map(c.map((d) => [d.id.toLowerCase(), d])), x = (d) => {
      if (_.has(d)) throw Error("Circular layout group " + d);
      if (!v.has(d)) {
        _.add(d);
        for (const N of A.get(d).members) A.has(N.toLowerCase()) && x(N.toLowerCase());
        _.delete(d), v.add(d);
      }
    };
    for (const d of A.keys()) x(d);
    const k = /* @__PURE__ */ new Map();
    for (const d of u) {
      if (d.a.toLowerCase() === d.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      k.has(d.a.toLowerCase()) || k.set(d.a.toLowerCase(), []), k.get(d.a.toLowerCase()).push(d.b.toLowerCase());
    }
    _.clear(), v.clear();
    const L = (d) => {
      if (_.has(d)) throw Error("Circular place constraints.");
      if (!v.has(d)) {
        _.add(d);
        for (const N of k.get(d) || []) L(N);
        _.delete(d), v.add(d);
      }
    };
    for (const d of k.keys()) L(d);
  } catch (p) {
    e.push({ severity: "error", line: o, message: "Layout description: " + p.message });
  }
  return { layout: { version: 1, priorityCap: y, groups: c, relations: u, pairs: s, faces: h }, diagnostics: e };
}
function Rt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const m = new Set(n.groups.map((w) => w.id.toLowerCase())), y = (w) => m.has(w.toLowerCase()) ? w : e.components.find((b) => b.synthetic && b.value.toLowerCase() === w.toLowerCase())?.name || e.focus + "/" + w;
    i = { ...n, groups: n.groups.map((w) => ({ ...w, members: w.members.map(y) })), relations: n.relations.map((w) => ({ ...w, a: y(w.a), b: y(w.b) })), faces: (n.faces || []).map((w) => ({ ...w, device: y(w.device) })), pairs: (n.pairs || []).map((w) => ({ ...w, members: w.members.map(y) })) };
  }
  const r = new Map(i.groups.map((m) => [m.id.toLowerCase(), m])), o = Object.values(t.contexts).flatMap((m) => m.devices.map((y) => y.name)), l = new Set([...Object.keys(t.contexts), ...o, ...e.components.map((m) => m.name)].map((m) => m.toLowerCase()));
  for (const m of r.values()) if (l.has((n ? e.focus + "/" + m.id : m.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + m.id);
  for (const m of r.values()) for (const y of m.members) if (!r.has(y.toLowerCase()) && !l.has(y.toLowerCase())) throw Error("Unknown @layout instance/device: " + y);
  for (const m of i.relations) for (const y of [m.a, m.b]) if (!r.has(y.toLowerCase()) && !l.has(y.toLowerCase())) throw Error("Unknown @layout place target: " + y);
  const a = (i.pairs || []).map((m) => ({ ...m, members: m.members.map((y) => {
    const w = e.components.find((C) => C.name.toLowerCase() === y.toLowerCase());
    if (!w || w.synthetic || w.block) throw Error("Unknown or non-visible @layout pair device: " + y);
    return w.name;
  }) })), c = (i.faces || []).map((m) => {
    const y = e.components.find((w) => w.name.toLowerCase() === m.device.toLowerCase());
    if (!y || !["Q", "M", "J", "Z"].includes(y.kind)) throw Error("Unknown or unsupported @layout face device: " + m.device);
    return { ...m, device: y.name };
  }), u = /* @__PURE__ */ new Map(), s = [], h = new Set(Object.keys(t.contexts).map((m) => m.toLowerCase()));
  for (const m of i.groups) {
    const y = [];
    for (const w of m.members) {
      if (r.has(w.toLowerCase())) {
        y.push({ group: w });
        continue;
      }
      for (const C of e.components) if (C.name.toLowerCase() === w.toLowerCase() || C.name.toLowerCase().startsWith(w.toLowerCase() + "/")) {
        if (u.has(C.name)) throw Error("Overlapping @layout membership: " + C.name);
        u.set(C.name, m.id), y.push({ cell: C.name, ...h.has(w.toLowerCase()) ? { instance: w } : {} });
      }
    }
    s.push({ id: m.id, direction: m.direction, members: y });
  }
  const f = /* @__PURE__ */ new Set();
  for (const m of s) for (const y of m.members) if (y.group) {
    const w = y.group.toLowerCase();
    if (f.has(w)) throw Error("Layout group has multiple parents: " + y.group);
    f.add(w);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: s, relations: i.relations, pairs: a, faces: c };
}
const me = () => /* @__PURE__ */ Object.create(null), ee = (t) => t.toLowerCase();
function nt(t) {
  const e = me();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!r) throw Error("Expected named parameter assignment, got: " + i);
    const o = ee(r[1]);
    let l = r[2];
    if (l === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + o);
      l = a[1];
    }
    if (l || (l = t[++n]), !l || /^params?:$/i.test(l)) throw Error("Missing value for parameter " + o);
    if (Object.hasOwn(e, o)) throw Error("Duplicate parameter: " + o);
    e[o] = l;
  }
  return e;
}
function ze(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, me()] : [t.slice(0, e), nt(t.slice(e))];
}
function At(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = kt(t, e);
  t = n.source;
  const i = Ot(t), r = [...n.diagnostics, ...i.diagnostics], o = me(), l = /* @__PURE__ */ new Set(["0"]), a = (p, _, v) => r.push({ severity: p, line: _, message: v }), c = (p, _, v, A = [], x = me(), k = 0) => {
    const L = { id: p, name: _, parent: v, ports: A, defaults: x, parameters: me(), definitions: me(), devices: [], instances: [], directives: [], line: k, statements: [], layoutDescription: i.scopes.get(k) || null };
    return o[p] = L, L;
  }, u = c("root", "Top", null), s = [u], h = [];
  let f = !1, m = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((p, _) => {
    const v = p.trim();
    !v || v.startsWith("*") || (v.startsWith("+") ? h.length ? h.at(-1).text += " " + v.slice(1).trim() : a("error", _ + 1, "Continuation has no preceding statement.") : h.push({ text: v, line: _ + 1 }));
  });
  for (const { text: p, line: _ } of h)
    try {
      const v = Ce(p);
      if (!v.length) continue;
      const A = ee(v[0]), x = s.at(-1);
      if (m) {
        a("warning", _, "Statement after .end is not rendered: " + p);
        continue;
      }
      if (A === ".control") {
        f = !0, a("warning", _, ".control script retained but not executed or rendered.");
        continue;
      }
      if (A === ".endc") {
        f = !1;
        continue;
      }
      if (f) continue;
      if (A === ".subckt") {
        if (v.length < 2) throw Error(".SUBCKT requires a name.");
        const [k, L] = ze(v.slice(2)), d = ee(v[1]);
        if (Object.hasOwn(x.definitions, d)) throw Error("Duplicate subcircuit definition: " + v[1]);
        const N = k.map(ee);
        if (new Set(N).size !== k.length || N.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (k.some((M) => /[{}()=]/.test(M))) throw Error("Invalid formal port.");
        if (s.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const g = x.id + "/" + encodeURIComponent(d);
        x.definitions[d] = g, s.push(c(g, v[1], x.id, k, L, _));
        continue;
      }
      if (A === ".ends") {
        if (s.length === 1) throw Error("Unmatched .ENDS.");
        if (v[1] && ee(v[1]) !== ee(x.name)) throw Error(".ENDS name does not match " + x.name);
        s.pop();
        continue;
      }
      if (A === ".end") {
        if (s.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        m = !0;
        continue;
      }
      if (A === ".param") {
        const k = nt(v.slice(1));
        for (const [L, d] of Object.entries(k)) {
          if (Object.hasOwn(x.parameters, L)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + L);
          x.parameters[L] = d;
        }
      }
      if (A === ".global") {
        if (v.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const k of v.slice(1)) l.add(ee(k));
      }
      if (A.startsWith(".") && x.directives.push({ line: _, text: p }), A.startsWith("x")) {
        const [k, L] = ze(v.slice(1));
        if (!k.length) throw Error("X instance requires a subcircuit name.");
        const d = /;§pnba\s+(.+)$/i.exec(p)?.[1].split(")");
        x.instances.push({ name: v[0], nodes: k.slice(0, -1).map(ee), definitionName: k.at(-1), definitionId: null, parameters: L, line: _, raw: p, pinNames: d });
      } else x.statements.push({ line: _, text: p });
    } catch (v) {
      a("error", _, v.message + " Statement: " + p);
    }
  s.length > 1 && a("error", s.at(-1).line, "Unclosed .SUBCKT " + s.at(-1).name), f && a("error", 0, "Unclosed .control block.");
  function y(p, _) {
    for (; p; ) {
      if (Object.hasOwn(p.definitions, ee(_))) return p.definitions[ee(_)];
      p = o[p.parent];
    }
    return null;
  }
  for (const p of Object.values(o)) {
    const _ = [...p.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...p.statements], v = St(_.map((x) => x.text).join(`
`), { models: o[p.parent]?.models });
    p.devices = v.components.map((x) => ({ ...x, line: _[x.line - 1]?.line || p.line })), p.models = v.models, p === u && (u.title = v.title), r.push(...v.diagnostics.filter((x) => !x.message.includes("No supported components to render.") && !x.message.includes("300 components")).map((x) => ({ ...x, line: _[x.line - 1]?.line || p.line })));
    const A = new Set(p.devices.map((x) => ee(x.name)));
    for (const x of p.instances)
      if (A.has(ee(x.name)) && a("error", x.line, "Duplicate instance/device name: " + x.name), A.add(ee(x.name)), x.definitionId = y(p, x.definitionName), !x.definitionId && !/^\{[\s\S]*\}$/.test(x.definitionName)) a("error", x.line, "Undefined subcircuit: " + x.definitionName + " in " + x.name);
      else if (x.definitionId) {
        const k = o[x.definitionId];
        k.ports.length !== x.nodes.length && a("error", x.line, `${x.name}: ${k.name} expects ${k.ports.length} ports; got ${x.nodes.length}.`);
      }
  }
  for (const p of Object.values(o)) delete p.statements;
  const w = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set();
  function b(p, _ = []) {
    if (w.has(p)) {
      a("error", o[p].line, "Circular subcircuit reference: " + [..._, o[p].name].join(" → "));
      return;
    }
    if (!C.has(p)) {
      if (w.add(p), _.length >= 64) {
        a("error", o[p].line, "Subcircuit dependency nesting exceeds 64 levels."), w.delete(p), C.add(p);
        return;
      }
      for (const v of o[p].instances) v.definitionId && b(v.definitionId, [..._, o[p].name]);
      w.delete(p), C.add(p);
    }
  }
  for (const p of Object.keys(o)) b(p);
  !u.devices.length && !u.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const p of r) !p.source && p.line && n.origins[p.line - 1] && (p.source = n.origins[p.line - 1].file, p.line = n.origins[p.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: u.title || "", scopes: o, globals: [...l], diagnostics: r, layoutDescription: i.layout };
}
const q = () => /* @__PURE__ */ Object.create(null), he = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), Pe = (t, e) => he(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Lt(t, e = []) {
  const n = q(), i = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((o) => decodeURIComponent(o)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [o, l] of Object.entries(r.terminals)) i(l).terminals.push({ component: r.name, pin: o });
  for (const r of e) i(r);
  return n;
}
function Pt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const qe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Mt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Ie(t, e, n = (r) => r, i = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (l) => (r.push(l), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (l, a, c) => {
    const u = c.split(",").map((h) => h.trim());
    if (u.some((h) => !h || /[\s{}+*()]/.test(h))) throw Error("Unsupported dynamic voltage/current reference: " + l);
    const s = a.toUpperCase() + "(" + u.map((h) => a.toLowerCase() === "v" ? n(h) : i(h, a)).join(",") + ")";
    return r.push(s), "@@" + (r.length - 1) + "@@";
  });
  let o = t.length;
  return t = t.replace(Mt, (l, a, c) => {
    if (c.slice(a + l.length).trimStart().startsWith("(")) return l;
    const u = e(l.toLowerCase());
    if (u === void 0) return l;
    if (o += u.length + 2, o > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + u + ")";
  }), t.replace(/@@(\d+)@@/g, (l, a) => r[Number(a)]);
}
function Tt(t, e, n, i) {
  const r = { ...e, ...n }, o = q(), l = /* @__PURE__ */ new Set(), a = q();
  for (const [u, s] of Object.entries(i)) a[u] = Ie(qe(s), (h) => t[h]);
  function c(u) {
    if (Object.hasOwn(a, u)) return a[u];
    if (Object.hasOwn(o, u)) return o[u];
    if (!Object.hasOwn(r, u)) return t[u];
    if (l.has(u)) {
      if (Object.hasOwn(t, u)) return t[u];
      throw Error("Circular parameter dependency: " + [...l, u].join(" → "));
    }
    return l.add(u), o[u] = Ie(qe(r[u]), c), l.delete(u), o[u];
  }
  for (const u of Object.keys(r)) c(u);
  return Object.assign(q(), t, o, a);
}
function Me(t, e, n, i) {
  let r = "";
  for (let c = 0; c < t.length; ) {
    const u = t[c];
    if (u !== "{" && u !== "'") {
      r += u, c++;
      continue;
    }
    const s = c++;
    let h = 1, f = "";
    for (; c < t.length && h; c++) {
      if (u === "'") {
        t[c] === "'" && (h = 0);
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
      t[c] === "{" && h++, t[c] === "}" && h--;
    }
    if (h) throw Error("Unclosed parameter expression.");
    r += u + Ie(t.slice(s + 1, c - 1), (m) => e[m], n, i) + (u === "{" ? "}" : "'");
  }
  const o = [];
  let l = 0, a = "";
  for (let c = 0; c < r.length; c++) {
    const u = r[c];
    if (a) {
      u === a && r[c - 1] !== "\\" && (a = "");
      continue;
    }
    if (u === '"' || u === "'") {
      a = u;
      continue;
    }
    if ("({".includes(u) && l++, ")}".includes(u) && l--, !l && (c === 0 || /\s/.test(r[c - 1]))) {
      const s = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(c));
      s && (o.push({ start: c, end: c + s[0].length, key: s[1].toLowerCase() }), c += s[0].length - 1);
    }
  }
  if (o.length) {
    let c = r.slice(0, o[0].start);
    o.forEach((u, s) => {
      const h = o[s + 1]?.start ?? r.length, f = r.slice(u.end, h);
      c += r.slice(u.start, u.end) + (f.includes("{") || ["refnode", "intnode"].includes(u.key) ? f : Ie(f, (m) => e[m], n, i));
    }), r = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
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
    e.forEach((n) => {
      if (typeof n != "object" || !n.name || !n.init)
        throw new Error("Invalid JSEP plugin format");
      this.registered[n.name] || (n.init(this.jsep), this.registered[n.name] = n);
    });
  }
}
class I {
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
    return "JavaScript Expression Parser (JSEP) v" + I.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return I.max_unop_len = Math.max(e.length, I.max_unop_len), I.unary_ops[e] = 1, I;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return I.max_binop_len = Math.max(e.length, I.max_binop_len), I.binary_ops[e] = n, i ? I.right_associative.add(e) : I.right_associative.delete(e), I;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return I.additional_identifier_chars.add(e), I;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return I.literals[e] = n, I;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete I.unary_ops[e], e.length === I.max_unop_len && (I.max_unop_len = I.getMaxKeyLen(I.unary_ops)), I;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return I.unary_ops = {}, I.max_unop_len = 0, I;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return I.additional_identifier_chars.delete(e), I;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete I.binary_ops[e], e.length === I.max_binop_len && (I.max_binop_len = I.getMaxKeyLen(I.binary_ops)), I.right_associative.delete(e), I;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return I.binary_ops = {}, I.max_binop_len = 0, I;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete I.literals[e], I;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return I.literals = {}, I;
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
    return new I(e).parse();
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
    return I.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !I.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    I.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return I.isIdentifierStart(e) || I.isDecimalDigit(e);
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
    if (I.hooks[e]) {
      const i = { context: this, node: n };
      return I.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (I.hooks[e]) {
      const n = { context: this };
      return I.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === I.SPACE_CODE || e === I.TAB_CODE || e === I.LF_CODE || e === I.CR_CODE; )
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
      type: I.COMPOUND,
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
      if (i = this.code, i === I.SEMCOL_CODE || i === I.COMMA_CODE)
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
    let e = this.expr.substr(this.index, I.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (I.binary_ops.hasOwnProperty(e) && (!I.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !I.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, r, o, l, a, c, u;
    if (l = this.gobbleToken(), !l || (n = this.gobbleBinaryOp(), !n))
      return l;
    for (o = { value: n, prec: I.binaryPrecedence(n), right_a: I.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), r = [l, o, a]; n = this.gobbleBinaryOp(); ) {
      if (i = I.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      o = { value: n, prec: i, right_a: I.right_associative.has(n) }, u = n;
      const s = (h) => o.right_a && h.right_a ? i > h.prec : i <= h.prec;
      for (; r.length > 2 && s(r[r.length - 2]); )
        a = r.pop(), n = r.pop().value, l = r.pop(), e = {
          type: I.BINARY_EXP,
          operator: n,
          left: l,
          right: a
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + u), r.push(o, e);
    }
    for (c = r.length - 1, e = r[c]; c > 1; )
      e = {
        type: I.BINARY_EXP,
        operator: r[c - 1].value,
        left: r[c - 2],
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
    let e, n, i, r;
    if (this.gobbleSpaces(), r = this.searchHook("gobble-token"), r)
      return this.runHook("after-token", r);
    if (e = this.code, I.isDecimalDigit(e) || e === I.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === I.SQUOTE_CODE || e === I.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === I.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, I.max_unop_len), i = n.length; i > 0; ) {
        if (I.unary_ops.hasOwnProperty(n) && (!I.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !I.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const o = this.gobbleToken();
          return o || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: I.UNARY_EXP,
            operator: n,
            argument: o,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      I.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), I.literals.hasOwnProperty(r.name) ? r = {
        type: I.LITERAL,
        value: I.literals[r.name],
        raw: r.name
      } : r.name === I.this_str && (r = { type: I.THIS_EXP })) : e === I.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === I.PERIOD_CODE || n === I.OBRACK_CODE || n === I.OPAREN_CODE || n === I.QUMARK_CODE; ) {
      let i;
      if (n === I.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== I.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === I.OBRACK_CODE ? (e = {
        type: I.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== I.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === I.OPAREN_CODE ? e = {
        type: I.CALL_EXP,
        arguments: this.gobbleArguments(I.CPAREN_CODE),
        callee: e
      } : (n === I.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: I.MEMBER_EXP,
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
    for (; I.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === I.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); I.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); I.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      I.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, I.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === I.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === I.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: I.LITERAL,
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
      let o = this.expr.charAt(this.index++);
      if (o === i) {
        r = !0;
        break;
      } else if (o === "\\")
        switch (o = this.expr.charAt(this.index++), o) {
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
            e += o;
        }
      else
        e += o;
    }
    return r || this.throwError('Unclosed quote after "' + e + '"'), {
      type: I.LITERAL,
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
    for (I.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, I.isIdentifierPart(e)); )
      this.index++;
    return {
      type: I.IDENTIFIER,
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
      let o = this.code;
      if (o === e) {
        i = !0, this.index++, e === I.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (o === I.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === I.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === I.CBRACK_CODE)
            for (let l = n.length; l < r; l++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const l = this.gobbleExpression();
        (!l || l.type === I.COMPOUND) && this.throwError("Expected comma"), n.push(l);
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
    let e = this.gobbleExpressions(I.CPAREN_CODE);
    if (this.code === I.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: I.SEQUENCE_EXP,
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
      type: I.ARRAY_EXP,
      elements: this.gobbleArguments(I.CBRACK_CODE)
    };
  }
}
const Dt = new Ut();
Object.assign(I, {
  hooks: Dt,
  plugins: new Qt(I),
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
I.max_unop_len = I.getMaxKeyLen(I.unary_ops);
I.max_binop_len = I.getMaxKeyLen(I.binary_ops);
const be = (t) => new I(t).parse(), Vt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(I).filter((t) => !Vt.includes(t) && be[t] === void 0).forEach((t) => {
  be[t] = I[t];
});
be.Jsep = I;
const jt = "ConditionalExpression";
var Bt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const o = this.gobbleExpression();
          if (o || this.throwError("Expected expression"), n.node = {
            type: jt,
            test: i,
            consequent: r,
            alternate: o
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let l = i;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
be.plugins.register(Bt);
const Ft = "ConditionalExpression";
var Gt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const o = this.gobbleExpression();
          if (o || this.throwError("Expected expression"), n.node = {
            type: Ft,
            test: i,
            consequent: r,
            alternate: o
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let l = i;
            for (; l.right.operator && t.binary_ops[l.right.operator] <= 0.9; )
              l = l.right;
            n.node.test = l.right, l.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
be.plugins.register(Gt);
const $t = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Xe = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, J = (t) => Number(t) > 0.5;
function xe(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function r(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, u, s, h] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), f = s.toLowerCase(), m = f.startsWith("meg") ? 1e6 : f.startsWith("mil") ? 254e-7 : $t[f[0]] || 1;
      return "(" + (h ? +(u + (u.includes(".") ? "" : ".") + h) : Number(u)) * m + ")";
    }), o(be(a));
  }
  function o(a) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const c = a.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const u = r(e[c]);
      return n.delete(c), u;
    }
    if (a.type === "ConditionalExpression") return J(o(a.test)) ? o(a.consequent) : o(a.alternate);
    if (a.type === "UnaryExpression") {
      const c = o(a.argument);
      if (a.operator === "-") return -c;
      if (a.operator === "+") return +c;
      if (a.operator === "!" || a.operator === "~") return !J(c);
    }
    if (a.type === "BinaryExpression") {
      const c = o(a.left);
      if (a.operator === "&&") return J(c) && J(o(a.right));
      if (a.operator === "||") return J(c) || J(o(a.right));
      const u = o(a.right);
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
          return J(c) !== J(u);
        case "&":
          return J(c) && J(u);
        case "|":
          return J(c) || J(u);
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
        return J(o(a.arguments[0])) ? o(a.arguments[1]) : o(a.arguments[2]);
      }
      if (Object.hasOwn(Xe, c)) return Xe[c](...a.arguments.map(o));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const l = r(t);
  if (typeof l == "number" && !Number.isFinite(l)) throw Error("Structural expression is not finite.");
  return l;
}
function Qe(t, { isolate: e = "" } = {}) {
  Pt(t);
  const n = q(), i = /* @__PURE__ */ new Map();
  let r = 0, o = 0;
  function l(a, c, u, s, h, f, m) {
    if (c.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const y = t.scopes[a], w = c.length ? he(c.slice(0, -1), c.at(-1)) : "", C = q();
    if (e && w === e && (u = q()), m.some((x) => x.scopeId === a)) throw Error("Circular subcircuit reference at " + w);
    const b = Tt(s, y.defaults, y.parameters, h);
    function p(x) {
      if (/^\{[\s\S]*\}$/.test(x)) {
        const L = xe(x, b);
        x = String(typeof L == "boolean" ? Number(L) : L);
      }
      /^"[\s\S]*"$/.test(x) && (x = x.slice(1, -1));
      const k = x.toLowerCase();
      return Object.hasOwn(u, k) ? u[k] : t.globals.includes(k) ? Pe([], k) : C[k] || (C[k] = Pe(c, k));
    }
    const _ = { id: w, path: c, scopeId: a, name: f?.name || "Top", definition: y.name, ports: y.ports.map((x) => ({ name: x, node: p(x) })), params: b, nodes: C, models: q(), devices: [], children: [], raw: f?.raw || "", line: f?.line || 0 };
    n[w] = _, i.set(w, p);
    const v = [...m, _];
    function A(x) {
      if (!x) return "";
      let k = y;
      for (; k; ) {
        if (k.directives.some((L) => new RegExp("^\\.model\\s+" + x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(L.text))) {
          const L = [...v].reverse().find((d) => d.scopeId === k.id);
          return he(L?.path || [], x.toLowerCase());
        }
        k = t.scopes[k.parent];
      }
      return x;
    }
    for (const x of y.directives.filter((k) => /^\.model\b/i.test(k.text))) {
      const k = /^\.model\s+(\S+)/i.exec(x.text)?.[1];
      if (!k) continue;
      const L = A(k), d = y.models[k.toLowerCase()], N = Me(x.text, b, p, (g) => he(c, g));
      _.models[L] = { ...d, name: L, raw: N.replace(/^(\.model\s+)\S+/i, (g, M) => M + L), instanceId: w, parameters: b };
    }
    for (const x of y.devices) {
      if (++o > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const k = q();
      for (const [d, N] of Object.entries(x.terminals)) k[d] = p(N);
      const L = A(x.model);
      _.devices.push({ ...x, name: he(c, x.name), localName: x.name, instanceId: w, terminals: k, model: L, parameters: b });
    }
    for (const x of y.instances) {
      let k = x.definitionId;
      if (!k) {
        const g = String(xe(x.definitionName, b)).toLowerCase();
        let M = y;
        for (; M && !k; )
          k = M.definitions[g], M = t.scopes[M.parent];
        if (!k) throw Error("Undefined selected subcircuit: " + g);
      }
      const L = t.scopes[k], d = q();
      if (L.ports.length !== x.nodes.length) throw Error(x.name + ": expected " + L.ports.length + " ports; got " + x.nodes.length);
      L.ports.forEach((g, M) => {
        d[g.toLowerCase()] = p(x.nodes[M]);
      });
      const N = l(k, [...c, x.name], d, b, x.parameters, x, v);
      x.pinNames?.length === N.ports.length && N.ports.forEach((g, M) => {
        g.label = x.pinNames[M];
      }), _.children.push(N);
    }
    return _;
  }
  try {
    let h = function(f, m) {
      const y = m.split(":");
      if (y.length === 1) return { owner: f, name: m };
      const w = y.pop();
      for (const C of [[...f.path, ...y], y]) {
        const b = c.get(C.map(encodeURIComponent).join("/").toLowerCase());
        if (b) return { owner: b, name: w };
      }
      throw Error("Unknown hierarchical reference: " + m);
    };
    const a = l(t.rootId, [], q(), q(), q(), null, []), c = new Map(Object.values(n).map((f) => [f.id.toLowerCase(), f])), u = Object.assign(q(), ...Object.values(n).map((f) => f.models)), s = (f) => u[f] || Object.entries(u).find(([m]) => m.startsWith(f + "."))?.[1];
    for (const f of Object.values(n)) for (const m of f.devices) {
      const y = t.scopes[f.scopeId].devices.find((b) => b.name === m.localName), w = (b) => {
        const p = h(f, b);
        return i.get(p.owner.id)(p.name);
      }, C = (b, p = "", _ = "") => {
        const v = h(f, b), A = v.owner.devices.find((x) => x.localName.toLowerCase() === v.name.toLowerCase());
        if (p.toLowerCase() === "ix") {
          const x = v.owner.ports.find((k, L) => k.name.toLowerCase() === v.name.toLowerCase() || String(L + 1) === v.name);
          if (x) return v.owner.id + ":" + x.name;
        }
        if (!A) {
          if (_) throw Error(m.name + ": referenced " + _ + " device " + b + " was not found.");
          return he(v.owner.path, v.name);
        }
        if (_ && A.kind !== _) throw Error(m.name + ": " + b + " must be a " + _ + " device.");
        return A.name;
      };
      if (m.value = Me(y.value, f.params, w, C), y.model && (m.value = m.value.replace(y.model, m.model)), m.kind === "M" && Object.keys(m.terminals).length === 3) {
        let b = s(m.model), p = !1;
        const _ = /* @__PURE__ */ new Set();
        for (; b?.type === "VDMOS" && !_.has(b.name); ) {
          _.add(b.name);
          const v = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(b.raw);
          if (v) {
            p = v[1] === void 0 || Number(xe(v[1], b.parameters)) >= 0.5;
            break;
          }
          const A = b.name.includes("/") ? b.name.slice(0, b.name.lastIndexOf("/") + 1) : "";
          b = s(A + (b.baseModel || "").toLowerCase()) || s((b.baseModel || "").toLowerCase());
        }
        _.size && (m.type = "spice_" + (p ? "pmos3" : "nmos3"));
      }
      m.controlSources = (y.controlSources || []).map((b) => C(b, "", "V")), m.controlSource = m.controlSources[0] || "", m.coupledInductors = (y.coupledInductors || []).map((b) => C(b, "", "L"));
      for (const b of /* @__PURE__ */ new Set([...y.controlSources || [], ...y.coupledInductors || []])) {
        const p = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        m.value = m.value.replace(new RegExp("(?<![\\w./%])" + p + "(?![\\w.$])", "g"), () => C(b));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: n };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function ge(t) {
  return [...t.devices, ...t.children.flatMap(ge)];
}
function Ee(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function De(t, e = {}) {
  const n = new Map(t.components.map((d) => [d.name, d])), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), o = [], l = (d, N) => JSON.stringify([d, N].sort()), a = (d) => e[d]?.potential !== null && e[d]?.potential !== void 0;
  for (const d of t.components) {
    for (const [S, Q] of Object.entries(d.terminals))
      i.has(Q) || i.set(Q, []), i.get(Q).push({ device: d.name, pin: S });
    if (d.kind === "R") {
      const S = Object.values(d.terminals);
      if (S.length === 2 && S[0] !== S[1]) {
        const Q = l(...S);
        r.has(Q) || r.set(Q, []), r.get(Q).push(d);
      }
    }
    const N = d.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(d.kind) ? "fet" : null, g = N === "bjt" ? /_(npn|pnp)$/.exec(d.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(d.type)?.[1];
    if (!N || !g) continue;
    const M = d.terminals, E = M[N === "bjt" ? "B" : "G"], P = M[N === "bjt" ? "C" : "D"], D = M[N === "bjt" ? "E" : "S"];
    [E, P, D].some((S) => S === void 0) || E === D || P === D || o.push({ id: d.name, family: N, polarity: g, control: E, drain: P, source: D, body: d.kind === "M" ? M.B : void 0 });
  }
  const c = [], u = /* @__PURE__ */ new Set(), s = (d, N, g, M, E, P = "basic", D = [], S = "high") => {
    const Q = [.../* @__PURE__ */ new Set([...N, ...D])], G = JSON.stringify([d, P, [...Q].sort()]);
    u.has(G) || (u.add(G), c.push({ id: "motif" + c.length, kind: d, variant: P, transistors: N, members: Q, roles: g, nets: M, evidence: E, confidence: S }));
  }, h = (d, N) => d.family === N.family && d.polarity === N.polarity, f = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), w = new Map(o.map((d) => [d.id, d])), C = (d, N, g) => {
    d.has(N) || d.set(N, []), d.get(N).push(g);
  }, b = (d, N) => JSON.stringify([d.family, d.polarity, N]);
  for (const d of o)
    C(f, b(d, d.control), d), C(m, b(d, d.source), d), d.family === "bjt" && (i.get(d.source) || []).some((N) => {
      const g = w.get(N.device);
      return g && g.family === "bjt" && !h(d, g) && g.source === d.source;
    }) && C(y, b(d, d.drain), d);
  const p = (d) => [{ node: d.source, resistor: null }, ...(i.get(d.source) || []).flatMap((N) => {
    const g = n.get(N.device);
    if (g.kind !== "R") return [];
    const M = Object.values(g.terminals).find((E) => E !== d.source);
    return M !== void 0 && M !== d.control && M !== d.drain ? [{ node: M, resistor: g.name }] : [];
  })];
  for (const d of o) d.control === d.drain && s("diode-connected", [d.id], { reference: d.id }, { control: d.control, return: d.source }, ["control-drain-short", d.family]);
  for (const d of o) {
    const N = f.get(b(d, d.control));
    if (N.filter((S) => S.control === S.drain).length > 1) continue;
    let g = null;
    if (d.control !== d.drain && d.family === "bjt" && (g = (f.get(b(d, d.drain)) || []).find((S) => S.id !== d.id && h(S, d) && S.control === d.drain && S.source === d.control && a(S.drain))), d.control !== d.drain && !g) continue;
    const M = p(d), E = [];
    let P = null, D = [];
    for (const S of N) {
      if (S.id === d.id || S.id === g?.id || S.drain === d.drain || S.drain === S.control) continue;
      const Q = M.flatMap((G) => p(S).filter((H) => G.node === H.node).map((H) => ({ node: G.node, rs: [G.resistor, H.resistor].filter(Boolean) }))).find((G) => P === null || G.node === P);
      Q && (P = Q.node, E.push(S.id), D.push(...Q.rs));
    }
    if (E.length) {
      const S = E.every((Q) => w.get(Q).body === d.body);
      s("current-mirror", [d.id, ...E, ...g ? [g.id] : []], { reference: d.id, outputs: E, ...g ? { helper: g.id } : {} }, { control: d.control, return: P }, ["same-polarity", "shared-control", g ? "emitter-follower-reference" : "diode-reference", D.length ? "resistive-common-return" : "shared-return", S ? "compatible-bodies" : "different-body-connections"], g ? "assisted" : D.length ? "degenerated" : "basic", [...D, ...g ? [g.id] : []], S ? "high" : "medium");
    }
  }
  const _ = [], v = /* @__PURE__ */ new Set(), A = (d, N) => {
    const g = JSON.stringify([d.id, N.id].sort());
    v.has(g) || (v.add(g), _.push([d, N]));
  };
  for (const d of m.values()) if (!a(d[0].source)) {
    const N = d.filter((g) => g.control !== g.drain);
    N.length === 2 ? A(...N) : N.length > 2 && new Set(N.map((g) => g.control)).size > 1 && s("differential-pair", N.map((g) => g.id), { inputs: N.map((g) => g.id) }, { tail: N[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const d of y.values()) for (let N = 0; N < d.length; N++) for (let g = N + 1; g < d.length; g++) A(d[N], d[g]);
  for (const [d, N] of _) {
    if (d.control === N.control || d.control === d.drain || N.control === N.drain) continue;
    if (d.source === N.source && d.drain !== N.drain && !a(d.source)) {
      const E = (i.get(d.source) || []).some((D) => D.device !== d.id && D.device !== N.id), P = m.get(b(d, d.source)).length === 2;
      s("differential-pair", [d.id, N.id], { inputs: [d.id, N.id] }, { tail: d.source }, ["same-polarity", "distinct-controls", "shared-tail", E ? "tail-bias-connection" : "unbiased-tail", P ? "two-input-tail" : "multi-input-tail"], "basic", [], E && P && d.body === N.body ? "high" : "medium");
    }
    if (d.family !== "bjt" || d.drain !== N.drain || d.source === N.source) continue;
    const g = o.filter((E) => E.family === "bjt" && E.polarity !== d.polarity && E.source === d.source), M = o.filter((E) => E.family === "bjt" && E.polarity !== d.polarity && E.source === N.source);
    for (const E of g) for (const P of M) E.id !== P.id && E.control === P.control && E.drain !== P.drain && E.control !== E.drain && P.control !== P.drain && s("differential-pair", [d.id, N.id, E.id, P.id], { inputs: [d.id, N.id], commonBase: [E.id, P.id] }, { inputCollectors: d.drain, bias: E.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const d of o) if (d.family === "bjt" && d.control !== d.drain) {
    const N = r.get(l(d.drain, d.control)) || [], g = r.get(l(d.control, d.source)) || [];
    N.length === 1 && g.length === 1 && s("vbe-multiplier", [d.id], { transistor: d.id, collectorResistor: N[0].name, emitterResistor: g[0].name }, { control: d.control, collector: d.drain, emitter: d.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [N[0].name, g[0].name]);
  }
  const x = o.filter((d) => d.family === "bjt"), k = /* @__PURE__ */ new Map();
  for (const d of x) C(k, d.control, d);
  const L = (d) => (i.get(d) || []).filter((N) => w.has(N.device));
  for (const d of x) if (d.control !== d.drain) {
    for (const N of k.get(d.source) || []) if (N.id !== d.id && h(d, N) && N.drain === d.control && N.source !== d.drain) {
      const g = r.get(l(d.source, N.source)) || [];
      g.length === 1 && s("current-limit-pair", [d.id, N.id], { driver: d.id, output: N.id, senseResistor: g[0].name }, { sense: d.source, drive: d.control, output: N.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [g[0].name]);
    }
    for (const N of k.get(d.source) || []) N.id !== d.id && h(d, N) && N.control !== N.drain && d.drain === N.drain && N.source !== d.control && s("darlington-pair", [d.id, N.id], { driver: d.id, output: N.id }, { link: d.source, collector: d.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (k.get(d.source) || []).length === 1 ? "high" : "medium");
    for (const N of k.get(d.drain) || []) N.id !== d.id && !h(d, N) && N.control !== N.drain && d.source === N.drain && N.source !== d.control && L(d.drain).length === 2 && s("sziklai-pair", [d.id, N.id], { driver: d.id, output: N.id }, { link: d.drain, feedback: d.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const N of i.get(d.drain) || []) {
      const g = w.get(N.device);
      !g || g.family !== "bjt" || g.id === d.id || !h(d, g) || g.source !== d.drain || a(d.drain) || g.control === d.control || g.control === g.drain || g.drain === d.source || L(d.drain).length !== 2 || s("cascode-pair", [d.id, g.id], { driver: d.id, output: g.id }, { link: d.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const d of x.filter((N) => N.polarity === "npn" && a(N.drain))) for (const N of x.filter((g) => g.polarity === "pnp" && a(g.drain))) {
    if (e[d.drain].potential <= e[N.drain].potential) continue;
    const g = p(d).flatMap((M) => p(N).filter((E) => M.node === E.node && !a(M.node)).map((E) => ({ node: M.node, rs: [M.resistor, E.resistor].filter(Boolean) })))[0];
    g && s("push-pull-pair", [d.id, N.id], { upper: d.id, lower: N.id }, { output: g.node }, ["complementary-polarity", "ordered-collector-supplies", g.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", g.rs);
  }
  return c;
}
function Ve(t, e, n = (i) => i) {
  const i = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([o, l]) => [o, i(l)])), nets: Object.fromEntries(Object.entries(r.nets).map(([o, l]) => [o, n(l)])) }));
}
function Wt(t, e, n) {
  const i = [], r = /* @__PURE__ */ new Set(), o = new Map(t.components.map((l) => [l.name, l]));
  for (const l of n) {
    if (new Set(l.members).size !== l.members.length) throw Error("Duplicate @layout pair member.");
    const a = l.members.map((f) => o.get(f));
    if (a.some((f) => !f)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[l.kind], u = l.kind === "differential" && a.length === 2 ? t.components.filter((f) => !l.members.includes(f.name) && Object.values(f.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], s = De({ ...t, components: [...a, ...u] }, e), h = s.find((f) => f.kind === c && f.confidence === "high" && l.members.every((m) => f.members.includes(m)));
    if (!h) throw Error("Invalid @layout pair " + l.kind + " { " + l.members.join(" ") + " }: electrical structure does not match.");
    for (const f of s.filter((m) => m === h || m.kind === "diode-connected" && m.members.every((y) => h.members.includes(y)))) {
      const m = JSON.stringify([f.kind, [...f.members].sort()]);
      r.has(m) || (r.add(m), i.push({ ...f, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function Ht(t, e, n = De(t, e)) {
  const i = /* @__PURE__ */ new Map(), r = t.components.filter((f) => f.kind === "R"), o = t.components.filter((f) => f.kind === "Q"), l = new Map(t.components.map((f) => [f.name, f])), a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), u = (f) => Object.values(f.terminals), s = (f, m, y) => {
    f && i.set(f.name, { reverse: u(f)[0] !== m, reason: y });
  };
  for (const f of o) {
    const { C: m, B: y, E: w } = f.terminals, C = f.type.endsWith("pnp"), b = f.type.endsWith("npn");
    !C && !b || (a.has(w) || a.set(w, []), a.get(w).push(f), m === y && e[w]?.potential !== null && e[w]?.potential !== void 0 && c.set(m, { potential: e[w].potential }));
  }
  for (const f of n) if (f.kind === "vbe-multiplier" && f.confidence === "high") {
    const m = l.get(f.roles.transistor), y = m.type.endsWith("pnp"), w = l.get(y ? f.roles.emitterResistor : f.roles.collectorResistor), C = l.get(y ? f.roles.collectorResistor : f.roles.emitterResistor);
    s(w, m.terminals[y ? "E" : "C"], "recognized VBE multiplier"), s(C, m.terminals.B, "recognized VBE multiplier");
  }
  for (const f of r) {
    const [m, y] = u(f), w = c.get(m), C = c.get(y);
    w && C && w.potential !== C.potential && s(f, w.potential > C.potential ? m : y, "diode-connected bias reference");
  }
  const h = /* @__PURE__ */ new Map();
  for (const f of r) {
    const m = u(f);
    if (!m.some((y) => e[y]?.potential !== null && e[y]?.potential !== void 0))
      for (const y of m)
        h.has(y) || h.set(y, []), h.get(y).push(f);
  }
  for (const [f, m] of h)
    if (!(m.length > 12))
      for (const y of m) for (const w of m) {
        if (y === w) continue;
        const C = u(y).find((v) => v !== f), b = u(w).find((v) => v !== f), p = a.get(C)?.find((v) => v.type.endsWith("npn")), _ = a.get(b)?.find((v) => v.type.endsWith("pnp"));
        p && _ && (s(y, C, "complementary emitter output"), s(w, f, "complementary emitter output"));
      }
  return i;
}
function zt(t) {
  const e = t.components.filter((o) => o.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((o) => o.kind === "R").map((o) => Object.values(o.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const l = o.terminals.E;
    n.has(l) || n.set(l, []), n.get(l).push(o);
  }
  for (const o of e) {
    const { B: l, C: a, E: c } = o.terminals;
    if (l === c || !i.has([l, c].sort().join("|"))) continue;
    const u = n.get(l) || [];
    if (!(u.length > 16))
      for (const s of u) {
        if (s === o) continue;
        if (s.terminals.B === a) {
          r.add(o.name);
          break;
        }
        const h = n.get(s.terminals.B) || [];
        if (h.length <= 16 && h.some((f) => f !== o && f !== s && f.terminals.B === a)) {
          r.add(o.name);
          break;
        }
      }
  }
  return r;
}
const Te = 19;
function Ue(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const _e = (t) => ["pwr", "ret", "bias"].includes(t), qt = (t) => String(t).split("/").at(-1).toLowerCase(), rt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[qt(t)] || "unknown", Ke = (t) => {
  const e = Ue(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || rt(t);
};
function Xt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (l, a, c) => {
    e.has(l) || e.set(l, []), e.get(l).push({ node: a, delta: c });
  };
  for (const l of t)
    if (l.kind === "V")
      try {
        let a = l.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (c && Number(xe(c[1], l.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const u = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!u) continue;
        const s = xe(u[1], l.parameters);
        if (typeof s != "number" || !Number.isFinite(s)) continue;
        i(l.terminals["-"], l.terminals["+"], s), i(l.terminals["+"], l.terminals["-"], -s);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Set();
  for (const l of ["0", ...e.keys()]) {
    if (o.has(l)) continue;
    const a = /* @__PURE__ */ new Map([[l, 0]]), c = [l];
    o.add(l);
    let u = !1;
    for (let s = 0; s < c.length; s++) for (const h of e.get(c[s]) || []) {
      const f = a.get(c[s]) + h.delta;
      a.has(h.node) ? Math.abs(a.get(h.node) - f) > 1e-8 * Math.max(1, Math.abs(f)) && (u = !0) : (a.set(h.node, f), o.add(h.node), c.push(h.node));
    }
    u && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [s, h] of a) r[s] = { value: h, reference: l, known: l === "0" && !u, consistent: !u };
  }
  return { nodes: r, diagnostics: n };
}
function Kt(t, e, n = null) {
  const i = Xt(ge(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  for (const s of Object.values(e.nodes)) {
    const h = Ue(s.name), f = rt(s.name);
    r[s.name] = { role: h !== "unknown" ? h : f, roleSource: h !== "unknown" ? "node-name" : f !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[s.name]?.known ? i.nodes[s.name].value : null };
  }
  if (e.localScope) for (const s of e.interfaceBindings) {
    const h = r[s.local], f = Ke(s.port);
    h && h.potential === null && ["pwr", "ret"].includes(f) && (h.potential = f === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(s.port) ? 0 : -1, h.potentialSource = "symbolic-port-order");
  }
  const l = n?.pairs?.length ? Wt(e, r, n.pairs) : De(e, r), a = Ht(e, r, l), c = zt(e), u = (s, h, f) => {
    const m = { role: r[f].role, roleSource: r[f].roleSource }, y = s.block?.ports.find((b) => b.pin === h);
    if (y?.implicit || !s.block && !s.synthetic) return m;
    const w = s.synthetic ? s.value : y?.name || y?.label, C = Ke(w);
    return C !== "unknown" ? { role: C, roleSource: Ue(w) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : _e(m.role) ? { ...m, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const s of e.components) {
    const h = Object.fromEntries(Object.entries(s.terminals).map(([L, d]) => [L, { ...r[d], ...u(s, L, d) }])), f = Object.values(h), m = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(s.type), y = m && !a.has(s.name) && f.length === 2 && f.every((L) => !_e(L.role) && (L.potential === null || L.role !== "unknown")), w = s.terminals["+"], C = s.terminals["-"], b = [w, C].filter((L) => L && L !== "0"), p = s.kind === "V" && b.some((L) => _e(r[L]?.role)) && !b.some((L) => ["in", "out", "io", "fb"].includes(r[L]?.role)) && [w, C].every((L) => i.nodes[L]?.known), _ = w === "0" ? C : w, v = Object.keys(s.terminals), A = (L) => _e(L.role) ? L.potential !== null ? L.potential > 0 ? "high" : "low" : L.role === "ret" ? "low" : "high" : "signal";
    let x = !1;
    v.length === 2 && (s.kind === "V" && f.every((L) => L.potential !== null) ? x = f[0].potential < f[1].potential : s.terminals[v[0]] === "0" ? x = !0 : s.terminals[v[1]] === "0" ? x = !1 : f.every((L) => L.potential !== null) ? x = f[0].potential < f[1].potential : x = A(f[0]) === "low" || A(f[1]) === "high" && A(f[0]) === "signal"), a.has(s.name) && (x = a.get(s.name).reverse);
    const k = s.synthetic ? "" : s.name.startsWith(e.focus + "/") ? s.name.slice(e.focus.length + 1) : s.name;
    o[s.name] = { version: Te, kind: s.kind, polarity: s.type.endsWith("pnp") ? "p" : s.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(s.name), orientationReason: a.get(s.name)?.reason || null, owner: k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : "", passive: m, source: ["V", "I", "E", "F", "G", "H"].includes(s.kind) || s.kind === "B" && !m, ports: h, horizontal: y, orientation: y ? "horizontal" : x ? "vertical-reversed" : "vertical", flexible: v.length === 2 && (m || ["V", "I", "B", "F", "H"].includes(s.kind)), supply: !!p, voltage: p ? i.nodes[_].value : null };
  }
  return { version: Te, nodes: r, cells: o, motifs: l, diagnostics: i.diagnostics };
}
function ot(t, e) {
  const n = e.ports.map((r, o) => ({ pin: "P" + o, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), i = new Set(ge(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const o = Pe([], r);
    i.has(o) && !n.some((l) => l.node === o) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: o, implicit: !0 });
  }
  return n;
}
function Yt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const r = t, o = t.contexts[i];
  if (!o) throw Error("Unknown instance: " + i);
  i && (t = Qe(t.ir, { isolate: i }));
  const l = t.contexts[i];
  if (!l) throw Error("Unknown instance: " + i);
  const a = [], c = [];
  function u(y) {
    c.push(...Object.values(y.nodes), ...y.ports.map((C) => C.node));
    const w = [...y.devices.map((C) => ({ line: C.line, device: C })), ...y.children.map((C) => ({ line: C.line, child: C }))].sort((C, b) => C.line - b.line);
    for (const C of w) {
      if (C.device) {
        const v = C.device;
        a.push({ ...v, layoutLabel: [...y.path.slice(l.path.length), v.localName].join("/") });
        continue;
      }
      const b = C.child;
      if (e === "flat" || n.has(b.id)) {
        u(b);
        continue;
      }
      const p = ot(t, b), _ = q();
      p.forEach((v) => {
        _[v.pin] = v.node;
      }), a.push({ name: b.id, kind: "X", type: "spice_subckt", terminals: _, value: b.definition, raw: b.raw, line: b.line, instanceId: b.id, layoutLabel: b.path.slice(l.path.length).join("/"), block: { definitionId: b.scopeId, ports: p, parameters: b.params } });
    }
  }
  u(l);
  for (const [y, w] of l.ports.entries()) a.push({ name: "@port/" + i + "/" + y, kind: "PORT", type: "spice_port", terminals: { A: w.node }, layoutLabel: w.name, value: w.name, raw: "Interface port " + w.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const s = Object.assign(q(), ...Object.values(t.contexts).map((y) => y.models)), h = { title: i || t.ir.title, components: a, nodes: Lt(a, c), models: s, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  h.interfaceBindings = l.ports.map((y, w) => ({ port: y.name, local: y.node, parent: o.ports[w].node }));
  const f = /* @__PURE__ */ new Map();
  for (const y of o.ports)
    f.has(y.node) || f.set(y.node, []), f.get(y.node).push(y.name);
  h.interfaceAliases = [...f].filter(([, y]) => y.length > 1).map(([y, w]) => ({ node: y, ports: w })), h.topology = Zt(r, h);
  const m = Rt(t, h);
  return h.layout = Kt(t, h, m), h.layout.description = m, h;
}
function Zt(t, e) {
  const n = ge(t.contexts[e.focus]);
  e.localScope && (t = Qe(t.ir, { isolate: e.focus }));
  const i = [], r = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const c = t.contexts[a.instanceId];
        if (!c) throw Error("Projection contains an unknown block.");
        const u = ot(t, c);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(u.map((s) => [s.pin, s.node]))) throw Error("Block interface topology mismatch: " + a.name);
        i.push(...ge(c));
      } else i.push(a);
  for (const a of i) {
    if (r.has(a.name)) throw Error("Projection duplicates " + a.name);
    r.add(a.name);
  }
  const o = Ee(i), l = ge(t.contexts[e.focus]);
  if (o !== Ee(l)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((s) => [s.local, s.parent])), c = (s) => a.get(s) ?? s, u = i.map((s) => ({ ...s, terminals: Object.fromEntries(Object.entries(s.terminals).map(([h, f]) => [h, c(f)])), value: Me(s.value, {}, c, (h) => h) }));
    if (Ee(u) !== Ee(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: o, boundSignature: Ee(n), boundaryVerified: !0 };
}
function Ye(t) {
  const e = q(), n = q();
  for (const i of t.components) {
    const r = q(), o = q();
    for (const [l, a] of Object.entries(i.terminals))
      r[l] = [t.nodes[a].bit], o[l] = "input";
    e[i.name] = { type: i.type, port_directions: o, connections: r, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((l) => ({ pin: l.pin, label: l.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((l, a) => ({ pin: l, label: i.pinLabels?.[a] || l })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ve(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Jt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, r = (u) => (n.has(u) || n.set(u, n.size + 2), n.get(u));
  Object.entries(t.modules.circuit.cells).forEach(([u, s], h) => {
    const f = "c" + h;
    e.set(f, u);
    const m = Object.fromEntries(Object.entries(s.connections).map(([y, w]) => [y, w.map(r)]));
    i[f] = { type: s.type, connections: m, port_directions: s.port_directions, attributes: { displayRef: s.attributes.displayRef || s.attributes.ref || "", value: s.attributes.value || "", name: s.attributes.name || "" } }, s.spiceBlock && (i[f].spiceBlock = s.spiceBlock), s.spiceSymbol && (i[f].spiceSymbol = s.spiceSymbol), s.spiceLayout && (i[f].spiceLayout = s.spiceLayout);
  });
  const o = new Map([...e].map(([u, s]) => [s, u])), l = t.modules.circuit.spiceLayoutDescription, a = l ? { ...l, faces: (l.faces || []).map((u) => ({ ...u, device: o.get(u.device) })), pairs: (l.pairs || []).map((u) => ({ ...u, members: u.members.map((s) => o.get(s)) })), groups: l.groups.map((u) => ({ ...u, members: u.members.map((s) => s.cell ? { ...s, cell: o.get(s.cell) } : s) })), relations: l.relations.map((u) => ({ ...u, a: o.get(u.a) || u.a, b: o.get(u.b) || u.b })) } : null, c = Ve(t.modules.circuit.spiceMotifs || [], (u) => o.get(u), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: c, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([u, s]) => [s, u])) };
}
const ce = /* @__PURE__ */ new Map();
async function en(t, e) {
  const n = Jt(t), i = JSON.stringify([n.netlist, e]);
  let r = ce.get(i);
  r ? (ce.delete(i), ce.set(i, r)) : (r = await tn(n.netlist, e), r.svg.length < 1e6 && (ce.set(i, r), ce.size > 20 && ce.delete(ce.keys().next().value)));
  const o = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (o.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of o.querySelectorAll("[id],[class]")) {
    const u = c.getAttribute("id");
    u?.startsWith("cell_") && n.ids.has(u.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(u.slice(5)));
    const s = c.getAttribute("class");
    s && c.setAttribute("class", s.split(/\s+/).map((h) => h.startsWith("cell_") && n.ids.has(h.slice(5)) ? "cell_" + n.ids.get(h.slice(5)) : /^net_\d+$/.test(h) && n.bits.has(Number(h.slice(4))) ? "net_" + n.bits.get(Number(h.slice(4))) : h).join(" "));
  }
  const l = r.drawing ? structuredClone(r.drawing) : null, a = o.querySelector("#spice-layout-report");
  if (a) {
    const c = JSON.parse(a.textContent), u = (s) => n.ids.get(s) || s;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(u), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(u), c.recognizedMotifs = Ve(c.recognizedMotifs || [], u, (s) => n.bits.get(s) ?? s), c.inputAttachments = (c.inputAttachments || []).map(u), c.mirroredInputPorts = (c.mirroredInputPorts || []).map(u);
    for (const s of [...c.flippedPairs || [], ...c.pairOrientationTrials || []]) s.members = s.members.map(u);
    for (const s of c.pairCompactions || [])
      s.members = s.members.map(u), s.moved = u(s.moved);
    for (const s of c.pairConstraints || []) s.members = s.members.map(u);
    for (const s of c.pairProximity || []) s.members = s.members.map(u);
    for (const s of c.motifMeasurements || [])
      s.members = s.members.map(u), s.interlopers && (s.interlopers = s.interlopers.map(u));
    for (const s of c.voltageRails || []) s.bit !== void 0 && (s.bit = n.bits.get(s.bit) ?? s.bit);
    a.textContent = JSON.stringify(c);
  }
  if (l) {
    for (const c of l.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const u of c.ports) u.bit = n.bits.get(u.bit) ?? u.bit;
    }
    for (const c of l.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(o.documentElement), drawing: l };
}
function tn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DCIL6LzF.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, r) => {
    const o = (c, u) => {
      clearTimeout(a), n.terminate(), c ? r(Error(c)) : i(u);
    }, l = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => o("Layout timed out. Open a subcircuit sheet or collapse instances."), l);
    n.onmessage = ({ data: c }) => o(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => o(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
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
`, ve = {
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
].flat(), je = "#292b29", Se = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => it[e * 9 + t]))])], Je = (t) => /^#[\da-f]{6}$/i.test(t), et = "spice-node-colors-v1";
function ln(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class dn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = ln(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Se[this.assigned.size % Se.length]), this.assigned.get(e)) : je;
  }
  set(e, n) {
    if (!Je(n)) throw Error("Invalid node color.");
    for (const i of e) this.manual.set(i, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((i) => Array.isArray(i) && typeof i[0] == "string" && Je(i[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function un(t, e, n) {
  const i = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const o = i.get(r.getAttribute("data-net"));
    if (!o) continue;
    r.style.setProperty("stroke", o, "important"), r.localName === "circle" && r.style.setProperty("fill", o, "important");
  }
}
function fn(t, e) {
  const n = new dn(), i = /* @__PURE__ */ new Set();
  let r = [], o = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(et) || "null"));
  } catch {
  }
  const l = () => {
    try {
      sessionStorage.setItem(et, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const f = t("node-search").value.trim().toLowerCase();
    return r.filter((m) => !f || [m.name, m.displayName, ...m.terminals.map((y) => y.component + "." + y.pin)].some((y) => y.toLowerCase().includes(f)));
  };
  function c() {
    const f = a(), m = f.filter((y) => i.has(y.name)).length;
    t("node-count").textContent = `${f.length} / ${r.length} nodes · ${i.size} selected`, t("node-all").checked = !!f.length && m === f.length, t("node-all").indeterminate = m > 0 && m < f.length, t("node-auto").checked = n.auto;
    for (const y of ["node-apply", "node-clear"]) t(y).disabled = !o || !i.size;
    t("node-all").disabled = !o || !f.length;
  }
  function u() {
    t("nets").replaceChildren(...a().map((f) => {
      const m = document.createElement("tr");
      m.dataset.node = f.name;
      const y = document.createElement("td"), w = document.createElement("input");
      w.type = "checkbox", w.checked = i.has(f.name), w.disabled = !o, w.setAttribute("aria-label", "Select node " + f.displayName), w.onchange = () => {
        w.checked ? i.add(f.name) : i.delete(f.name), c();
      }, y.append(w);
      const C = document.createElement("td");
      C.textContent = f.displayName;
      const b = document.createElement("td"), p = document.createElement("input");
      p.type = "color", p.value = n.color(f.name), p.disabled = !o, p.setAttribute("aria-label", "Wire color for " + f.displayName), p.onchange = () => {
        n.set([f.name], p.value), s();
      }, b.append(p);
      const _ = document.createElement("td");
      return _.textContent = f.terminals.map((v) => v.component + "." + v.pin).join(", "), m.append(y, C, b, _), m;
    })), c();
  }
  function s() {
    for (const f of r) n.color(f.name);
    u(), l(), e(n, r);
  }
  t("node-search").oninput = u, t("node-all").onchange = () => {
    for (const f of a()) t("node-all").checked ? i.add(f.name) : i.delete(f.name);
    u();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, s();
  }, t("node-apply").onclick = () => {
    n.set(i, t("node-color").value), s();
  }, t("node-clear").onclick = () => {
    n.set(i, je), s();
  }, t("node-reset").onclick = () => {
    n.reset(), s();
  }, t("node-swatches").replaceChildren(...it.map((f) => {
    const m = document.createElement("button");
    return m.type = "button", m.style.backgroundColor = f, m.title = f, m.setAttribute("aria-label", "Apply palette color " + f), m.onclick = () => {
      i.size && (t("node-color").value = f, n.set(i, f), s());
    }, m;
  }));
  function h(f) {
    o = f;
    for (const m of t("node-panel").querySelectorAll("input,button")) m.disabled = !o;
    c();
  }
  return { setCircuit(f, m) {
    const y = n.sourceId;
    n.setSource(m), y !== n.sourceId && i.clear(), r = Object.values(f?.nodes || {});
    const w = new Set(r.map((C) => C.name));
    for (const C of i) w.has(C) || i.delete(C);
    for (const C of r) n.color(C.name);
    o = !!f, u(), h(o), l(), e(n, r);
  }, setEnabled: h };
}
function pn(t) {
  const e = (E) => t.querySelector("#spice-" + E), n = new AbortController(), i = n.signal, r = { editor: e("editor-panel"), info: e("info-panel") }, o = Object.fromEntries(Object.keys(r).map((E) => [E, t.querySelector(`[data-window-handle="${E}"]`)])), l = { editor: !0, info: !0 }, a = [], c = { editor: {}, info: {} }, u = [];
  let s = !1, h = !1, f = null, m = null, y = null, w = null;
  const C = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: s, panels: { ...l } } })), b = (E, P, D, S = {}) => E.addEventListener(P, D, { ...S, signal: i });
  function p(E, P) {
    l[E] = P, r[E].hidden = s && !P, e("show-" + E).setAttribute("aria-expanded", String(P)), C();
  }
  function _(E) {
    const P = document.createComment("workspace return");
    E.before(P), a.push({ node: E, anchor: P }), e("info-content").prepend(E);
  }
  function v(E) {
    const P = E.getBoundingClientRect(), D = t.getBoundingClientRect();
    return { x: P.left - D.left, y: P.top - D.top, w: P.width, h: P.height, width: D.width, height: D.height };
  }
  function A(E, P, D) {
    const S = v(E), Q = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, G = Math.max(8, Math.min(P, S.width - S.w - 8)), H = Math.max(8, Math.min(Q, S.height - S.h - 8)), $ = Math.max(H, Math.min(D, S.height - S.h - 8));
    E.style.left = Math.round(G) + "px", E.style.top = Math.round($) + "px", E.style.right = "auto", E.style.bottom = "auto";
  }
  function x() {
    if (s) {
      for (const E of Object.values(r)) if (!E.hidden) {
        const P = v(E);
        A(E, P.x, P.y);
      }
    }
  }
  function k() {
    for (const E of Object.values(r))
      for (const P of ["left", "top", "right", "bottom", "width", "height", "z-index"]) E.style.removeProperty(P);
    for (const E of Object.keys(r)) p(E, !0);
    requestAnimationFrame(x);
  }
  function L() {
    if (!s) {
      s = !0, f = document.activeElement, m = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, w = document.createComment("workspace mount"), t.before(w), document.body.append(t);
      for (const E of document.body.children) E !== t && (u.push({ node: E, inert: E.inert }), E.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const E of Object.keys(r))
        c[E].base = r[E].style.cssText, c[E].floating && (r[E].style.cssText = c[E].floating), r[E].setAttribute("role", "dialog"), r[E].setAttribute("aria-modal", "false"), r[E].setAttribute("aria-labelledby", "spice-" + E + "-title"), o[E].tabIndex = 0, o[E].title = "Drag to move; arrow keys move the window", p(E, l[E]);
      for (const E of ["selection-actions", "selection", "edit-help", "edit-toolbar", "hierarchy-panel"]) _(e(E));
      requestAnimationFrame(x), e("exit-fullscreen").focus({ preventScroll: !0 }), C();
    }
  }
  function d() {
    if (s) {
      s = !1, y = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: E, anchor: P } of a.splice(0))
        P.before(E), P.remove();
      for (const E of Object.keys(r)) {
        c[E].floating = r[E].style.cssText, r[E].style.cssText = c[E].base, r[E].hidden = !1;
        for (const P of ["role", "aria-modal", "aria-labelledby"]) r[E].removeAttribute(P);
        o[E].removeAttribute("tabindex"), o[E].removeAttribute("title");
      }
      w && (w.before(t), w.remove(), w = null);
      for (const { node: E, inert: P } of u.splice(0)) E.inert = P;
      m && (document.documentElement.style.overflow = m.html, document.body.style.overflow = m.body, window.scrollTo(m.x, m.y)), f?.focus?.({ preventScroll: !0 }), C();
    }
  }
  async function N() {
    if (L(), t.requestFullscreen && document.fullscreenEnabled) {
      h = !0;
      try {
        await t.requestFullscreen(), t.dataset.nativeFullscreen = "true";
      } catch {
        h = !1, t.dataset.nativeFullscreen = "false";
      }
    } else t.dataset.nativeFullscreen = "false";
  }
  async function g() {
    if (h = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        h = !0;
        return;
      }
    d();
  }
  b(e("fullscreen"), "click", () => s ? g() : N()), b(e("exit-fullscreen"), "click", g), b(e("reset-windows"), "click", k);
  for (const E of Object.keys(r)) {
    b(e("show-" + E), "click", () => {
      p(E, !l[E]), requestAnimationFrame(x);
    }), b(e("close-" + E), "click", () => {
      p(E, !1), e("show-" + E).focus({ preventScroll: !0 });
    }), b(r[E], "pointerdown", () => {
      if (s) {
        for (const S of Object.values(r)) S.style.zIndex = "20";
        r[E].style.zIndex = "30";
      }
    }, { capture: !0 });
    const P = o[E];
    b(P, "pointerdown", (S) => {
      if (!s || S.button !== 0 || S.target.closest("button,input,select,textarea,a,label")) return;
      S.preventDefault();
      const Q = v(r[E]);
      y = { id: E, pointer: S.pointerId, x: S.clientX, y: S.clientY, left: Q.x, top: Q.y }, P.setPointerCapture(S.pointerId);
    }), b(P, "pointermove", (S) => {
      y?.id === E && y.pointer === S.pointerId && A(r[E], y.left + S.clientX - y.x, y.top + S.clientY - y.y);
    });
    const D = () => {
      y = null;
    };
    b(P, "pointerup", D), b(P, "pointercancel", D), b(P, "lostpointercapture", D), b(P, "keydown", (S) => {
      if (!s || S.target !== P || !S.key.startsWith("Arrow")) return;
      S.preventDefault();
      const Q = v(r[E]), G = S.shiftKey ? 32 : 8;
      A(r[E], Q.x + ({ ArrowLeft: -G, ArrowRight: G }[S.key] || 0), Q.y + ({ ArrowUp: -G, ArrowDown: G }[S.key] || 0));
    });
  }
  b(document, "fullscreenchange", () => {
    s && h && document.fullscreenElement !== t && (h = !1, d());
  }), b(document, "keydown", (E) => {
    s && E.key === "Escape" && (E.preventDefault(), g());
  }), b(window, "resize", x);
  const M = new ResizeObserver(x);
  for (const E of Object.values(r)) M.observe(E);
  return { enter: N, exit: g, showPanel: p, reset: k, destroy() {
    g(), n.abort(), M.disconnect();
  } };
}
const Y = 1e-3, K = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), z = (t, e) => Math.abs(t - e) < Y, oe = (t, e) => z(e.a.x, e.b.x) ? z(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - Y && t.y <= Math.max(e.a.y, e.b.y) + Y : z(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - Y && t.x <= Math.max(e.a.x, e.b.x) + Y, hn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), mn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + Y && Math.min(t.a.x, t.b.x) < e.x + e.width - Y && Math.max(t.a.y, t.b.y) > e.y + Y && Math.min(t.a.y, t.b.y) < e.y + e.height - Y;
function Ae(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && K(e.at(-1)) === K(n))) {
      for (; e.length > 1 && (z(e.at(-2).x, e.at(-1).x) && z(e.at(-1).x, n.x) || z(e.at(-2).y, e.at(-1).y) && z(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class gn {
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
    return z(e.x / this.step, Math.round(e.x / this.step)) && z(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !z(e.a.x, e.b.x) && !z(e.a.y, e.b.y)) return !1;
    const i = this.pins();
    if (i.some((r) => r.bit !== n && oe(r, e)) || this.segments.some((r) => r.bit !== n && (oe(e.a, r) || oe(e.b, r) || oe(r.a, e) || oe(r.b, e)))) return !1;
    for (const r of this.components) if (mn(e, r) && !i.filter((l) => l.owner === r.id && l.bit === n).some((l) => l.side === "NORTH" ? z(e.a.x, l.x) && z(e.b.x, l.x) && Math.max(e.a.y, e.b.y) <= l.y + Y : l.side === "SOUTH" ? z(e.a.x, l.x) && z(e.b.x, l.x) && Math.min(e.a.y, e.b.y) >= l.y - Y : l.side === "WEST" ? z(e.a.y, l.y) && z(e.b.y, l.y) && Math.max(e.a.x, e.b.x) <= l.x + Y : l.side === "EAST" ? z(e.a.y, l.y) && z(e.b.y, l.y) && Math.min(e.a.x, e.b.x) >= l.x - Y : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const i = Ae(n), r = i.slice(1).map((o, l) => ({ bit: e, a: i[l], b: o })).filter((o) => hn(o) > Y);
    if (!r.length) return !1;
    if (r.some((o) => !this.validSegment(o, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, i) {
    if (n = Math.round(n / this.step) * this.step, i = Math.round(i / this.step) * this.step, !n && !i) return;
    const r = this.snapshot(), o = this.components.find((c) => c.id === e);
    if (!o) return;
    const l = o.ports.map((c) => ({ ...c }));
    this.segments = this.segments.filter((c) => !l.some((u) => u.bit === c.bit && (K(u) === K(c.a) || K(u) === K(c.b)))), o.x += n, o.y += i;
    for (const c of o.ports)
      c.x += n, c.y += i;
    if (this.pinCache = null, this.components.some((c) => c !== o && o.x < c.x + c.width - Y && o.x + o.width > c.x + Y && o.y < c.y + c.height - Y && o.y + o.height > c.y + Y) || this.segments.some((c) => !this.validSegment(c, c.bit)) || o.ports.some((c) => this.pins().some((u) => u.owner !== e && u.bit !== c.bit && K(u) === K(c))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
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
      const o = /* @__PURE__ */ new Map(), l = (s) => {
        o.has(K(s)) || o.set(K(s), s);
      };
      r.pins.forEach(l);
      for (const s of r.segments)
        l(s.a), l(s.b);
      for (let s = 0; s < r.segments.length; s++) for (let h = s + 1; h < r.segments.length; h++) {
        const f = r.segments[s], m = r.segments[h];
        if (z(f.a.x, f.b.x) === z(m.a.x, m.b.x)) continue;
        const y = z(f.a.x, f.b.x) ? f : m, w = y === f ? m : f, C = { x: y.a.x, y: w.a.y };
        oe(C, y) && oe(C, w) && l(C);
      }
      const a = new Map([...o.keys()].map((s) => [s, s])), c = (s) => {
        let h = s;
        for (; a.get(h) !== h; ) h = a.get(h);
        for (; s !== h; ) {
          const f = a.get(s);
          a.set(s, h), s = f;
        }
        return h;
      };
      for (const s of r.segments) {
        const h = [...o.values()].filter((f) => oe(f, s));
        for (const f of h.slice(1)) a.set(c(K(f)), c(K(h[0])));
      }
      const u = /* @__PURE__ */ new Map();
      for (const s of r.pins) {
        const h = c(K(s));
        u.has(h) || u.set(h, { pins: [], points: [] }), u.get(h).pins.push(s);
      }
      for (const s of o.values()) {
        const h = c(K(s));
        u.has(h) && u.get(h).points.push(s);
      }
      n.push({ bit: i, islands: [...u.values()], points: [...o.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: i } of this.connectivity()) {
      if (i.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < i.length; ) {
        let o;
        for (const l of r) for (let a = 0; a < i.length; a++) if (!r.has(a)) for (const c of i[l].points) for (const u of i[a].points) {
          const s = (c.x - u.x) ** 2 + (c.y - u.y) ** 2;
          (!o || s < o.d) && (o = { bit: n, a: c, b: u, d: s, j: a });
        }
        e.push(o), r.add(o.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const o of this.components)
      e.push(o.x - 20, o.x + o.width + 20), n.push(o.y - 20, o.y + o.height + 20);
    for (const o of this.segments)
      e.push(o.a.x - 20, o.b.x + 20), n.push(o.a.y - 20, o.b.y + 20);
    const i = Math.min(...e), r = Math.min(...n);
    return { x: i, y: r, w: Math.max(...e) - i, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, i) {
    if (!this.onGrid(n) || !this.onGrid(i)) return null;
    const r = (A) => A.slice(1).every((x, k) => this.validSegment({ a: A[k], b: x }, e));
    for (const A of [[n, i], [n, { x: i.x, y: n.y }, i], [n, { x: n.x, y: i.y }, i]]) {
      const x = Ae(A);
      if (r(x)) return x;
    }
    const o = this.step, l = this.bounds(), a = Math.floor(Math.min(l.x, n.x, i.x) / o) - 5, c = Math.ceil(Math.max(l.x + l.w, n.x, i.x) / o) + 5, u = Math.floor(Math.min(l.y, n.y, i.y) / o) - 5, s = Math.ceil(Math.max(l.y + l.h, n.y, i.y) / o) + 5, h = { x: n.x / o, y: n.y / o, dir: -1, cost: 0, key: n.x / o + "," + n.y / o + ",-1" }, f = [h], m = /* @__PURE__ */ new Map([[h.key, 0]]), y = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map([[h.key, h]]), C = [[1, 0], [-1, 0], [0, 1], [0, -1]], b = (A) => Math.abs(A.x - i.x / o) + Math.abs(A.y - i.y / o);
    let p = null, _ = 0;
    for (; f.length && _++ < 3e4; ) {
      let A = 0;
      for (let k = 1; k < f.length; k++) f[k].cost + b(f[k]) < f[A].cost + b(f[A]) && (A = k);
      const x = f.splice(A, 1)[0];
      if (x.cost === m.get(x.key)) {
        if (x.x === i.x / o && x.y === i.y / o) {
          p = x;
          break;
        }
        for (let k = 0; k < 4; k++) {
          const L = x.x + C[k][0], d = x.y + C[k][1];
          if (L < a || L > c || d < u || d > s) continue;
          const N = { x: L, y: d, dir: k, key: L + "," + d + "," + k, cost: x.cost + 1 + (x.dir !== -1 && x.dir !== k ? 3 : 0) };
          N.cost >= (m.get(N.key) ?? 1 / 0) || !this.validSegment({ a: { x: x.x * o, y: x.y * o }, b: { x: L * o, y: d * o } }, e) || (m.set(N.key, N.cost), y.set(N.key, x.key), w.set(N.key, N), f.push(N));
        }
      }
    }
    if (!p) return null;
    const v = [];
    for (let A = p; A; A = w.get(y.get(A.key))) v.push({ x: A.x * o, y: A.y * o });
    return Ae(v.reverse());
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
      const o = this.airwires().find((a) => !i.has(a.bit + ":" + K(a.a) + ":" + K(a.b)));
      if (!o) break;
      const l = this.findPath(o.bit, o.a, o.b);
      l ? (this.segments.push(...l.slice(1).map((a, c) => ({ bit: o.bit, a: l[c], b: a }))), this.cache = null) : i.add(o.bit + ":" + K(o.a) + ":" + K(o.b)), r % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const bn = "http://www.w3.org/2000/svg", Z = (t, e = {}) => {
  const n = document.createElementNS(bn, t);
  for (const [i, r] of Object.entries(e)) n.setAttribute(i, r);
  return n;
}, yn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function wn(t, e, { changed: n, inspect: i, getNetColor: r }) {
  let o = null, l = null, a = !1, c = !1, u = null, s = null, h = -1, f = 0, m = "", y = 8, w = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
  const b = (g) => {
    const M = l.getScreenCTM();
    return o.snap(new DOMPoint(g.clientX, g.clientY).matrixTransform(M.inverse()));
  }, p = (g) => r?.(g) || Se[Number(g) % Se.length], _ = (g) => {
    e("editor-status").textContent = g;
  };
  function v() {
    return { unrouted: o?.airwires().length || 0, wires: o?.segments.length || 0, editing: a, routing: c };
  }
  function A() {
    const g = !!o;
    for (const M of ["interactive", "flywire", "auto-route"]) e(M).disabled = !l || c;
    e("edit-tool").disabled = !g || c, e("wire-undo").disabled = !g || c || !o.undoStack.length, e("wire-redo").disabled = !g || c || !o.redoStack.length, t.classList.toggle("spice-editing", a);
  }
  function x() {
    if (!o) return;
    const g = v();
    _(`${g.unrouted} connection${g.unrouted === 1 ? "" : "s"} unrouted · ${g.wires} wire segments${c ? " · Auto-routing…" : ""}`), A(), n(o.drawing(), g, o.bounds()), C.set(m, o.snapshot()), C.size > 20 && C.delete(C.keys().next().value);
  }
  function k(g = null) {
    if (l?.querySelector("[data-route-preview]")?.remove(), !u || !l) return;
    const M = [...u.points];
    if (g) {
      const D = M.at(-1);
      M.push({ x: g.x, y: D.y }, g);
    }
    const E = Z("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    E.append(Z("polyline", { points: M.map((D) => D.x + "," + D.y).join(" "), fill: "none", stroke: p(u.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), l.append(E);
    const P = l.querySelector("[data-airwires]");
    P && l.append(P);
  }
  function L() {
    if (!l || !o) return;
    for (const S of l.querySelectorAll("[data-editor-body-hit]")) S.remove();
    for (const S of [...l.children]) (S.hasAttribute("data-editor-overlay") || S.hasAttribute("data-airwires") || S.hasAttribute("data-manual-state") || S.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(S.localName)) && S.remove();
    for (const S of o.components) {
      const Q = l.getElementById("cell_" + S.id);
      Q && (Q.setAttribute("transform", `translate(${S.x},${S.y})`), Q.dataset.editorComponent = S.id, a && Q.prepend(Z("rect", { x: 0, y: 0, width: S.width, height: S.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const g = l.querySelector('g[id^="cell_"]'), M = Z("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), E = Z("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [S, Q] of o.segments.entries()) {
      const G = Z("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, class: "net_" + Q.bit, "data-net": w.get(Q.bit) || String(Q.bit), "stroke-width": S === h ? 2.8 : 1.4 });
      G.append(Z("title")), G.firstChild.textContent = "Node " + (w.get(Q.bit) || Q.bit), l.insertBefore(G, g), a && M.append(Z("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, "data-editor-wire": S, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const S of o.connectivity()) for (const Q of S.points) {
      const G = /* @__PURE__ */ new Set();
      for (const H of S.segments) oe(Q, H) && (Math.min(H.a.x, H.b.x) < Q.x - 1e-3 && G.add("w"), Math.max(H.a.x, H.b.x) > Q.x + 1e-3 && G.add("e"), Math.min(H.a.y, H.b.y) < Q.y - 1e-3 && G.add("n"), Math.max(H.a.y, H.b.y) > Q.y + 1e-3 && G.add("s"));
      (G.size >= 3 || G.size >= 2 && S.islands.some((H) => H.pins.some(($) => yn(Q, $)))) && l.insertBefore(Z("circle", { cx: Q.x, cy: Q.y, r: 2, class: "net_" + S.bit, "data-net": w.get(S.bit) || String(S.bit), fill: p(S.bit) }), g);
    }
    if (a) {
      for (const S of o.pins()) {
        const Q = Z("circle", { cx: S.x, cy: S.y, r: 3, "data-editor-pin": S.id, "data-editor-bit": S.bit, fill: "#fff", stroke: p(S.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": S.owner + " " + S.pin }), G = Z("title");
        G.textContent = S.id + " · " + (w.get(S.bit) || S.bit), Q.append(G), E.append(Q);
      }
      l.append(M, E);
    }
    k();
    const P = Z("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const S of o.airwires()) P.append(Z("line", { x1: S.a.x, y1: S.a.y, x2: S.b.x, y2: S.b.y, stroke: p(S.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": S.bit, "data-from-owner": S.a.owner || "", "data-to-owner": S.b.owner || "" }));
    l.append(P);
    const D = Z("metadata", { "data-manual-state": "true" });
    D.textContent = JSON.stringify({ version: 1, grid: y, unrouted: o.airwires().length, manual: !0 }), l.insertBefore(D, P), x();
  }
  function d(g, M) {
    if (!u) {
      u = { bit: M, points: [g] }, k(), _("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (M !== void 0 && u.bit !== M) {
      _("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const E = u.points.at(-1), P = o.findPath(u.bit, E, g);
    if (!P) {
      _("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (M === void 0) {
      u.points.push(...P.slice(1)), k();
      return;
    }
    try {
      o.addPath(M, [...u.points, ...P.slice(1)]), u = null, L();
    } catch (D) {
      _(D.message);
    }
  }
  t.addEventListener("pointerdown", (g) => {
    if (!a || c || !o || !l || g.button !== 0 || g.shiftKey) return;
    const M = g.target.closest("[data-editor-pin]"), E = g.target.closest("[data-editor-wire]"), P = g.target.closest("[data-editor-component]");
    if (!(!M && !E && !P && !u)) {
      if (g.preventDefault(), g.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), M) {
        const D = o.pins().find((S) => S.id === M.dataset.editorPin);
        d({ x: D.x, y: D.y }, D.bit);
        return;
      }
      if (E) {
        const D = +E.dataset.editorWire, S = o.segments[D];
        if (e("edit-tool").value === "erase" && !u) {
          o.remove(D), h = -1, L();
          return;
        }
        if (u || e("edit-tool").value === "route") {
          const Q = b(g);
          d(S.a.x === S.b.x ? { x: S.a.x, y: Q.y } : { x: Q.x, y: S.a.y }, S.bit);
        } else
          h = D, L(), _("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (u) {
        d(b(g));
        return;
      }
      if (P) {
        const D = P.dataset.editorComponent, S = o.components.find((Q) => Q.id === D);
        if (!S || (i?.(D), e("edit-tool").value !== "move")) return;
        s = { id: D, n: S, element: P, x: g.clientX, y: g.clientY, start: b(g), dx: 0, dy: 0 }, P.style.opacity = ".6", t.setPointerCapture(g.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (g) => {
    if (!(!a || !o || !l)) {
      if (s) {
        g.stopImmediatePropagation();
        const M = b(g);
        s.dx = M.x - s.start.x, s.dy = M.y - s.start.y, s.element.setAttribute("transform", `translate(${s.n.x + s.dx},${s.n.y + s.dy})`);
        for (const E of l.querySelectorAll("[data-airwires] line"))
          E.dataset.fromOwner === s.id && (E.setAttribute("x1", +E.getAttribute("x1") - Number(E.dataset.dx || 0) + s.dx), E.setAttribute("y1", +E.getAttribute("y1") - Number(E.dataset.dy || 0) + s.dy)), E.dataset.toOwner === s.id && (E.setAttribute("x2", +E.getAttribute("x2") - Number(E.dataset.dx || 0) + s.dx), E.setAttribute("y2", +E.getAttribute("y2") - Number(E.dataset.dy || 0) + s.dy)), E.dataset.dx = s.dx, E.dataset.dy = s.dy;
        return;
      }
      u && k(b(g));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (g) => {
    if (!s) return;
    g.preventDefault(), g.stopImmediatePropagation();
    const M = s;
    s = null, M.element.style.opacity = "", t.hasPointerCapture(g.pointerId) && t.releasePointerCapture(g.pointerId);
    try {
      o.move(M.id, M.dx, M.dy), h = -1, L();
    } catch (E) {
      L(), _(E.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    s && (s.element.style.opacity = "", s = null, L());
  }), t.addEventListener("keydown", (g) => {
    if (!a || !o) return;
    const M = g.target.closest("[data-editor-pin]");
    if (M && (g.key === "Enter" || g.key === " ")) {
      g.preventDefault(), g.stopImmediatePropagation();
      const E = o.pins().find((P) => P.id === M.dataset.editorPin);
      d({ x: E.x, y: E.y }, E.bit);
      return;
    }
    g.key === "Escape" && u ? (g.preventDefault(), g.stopPropagation(), u = null, L()) : (g.key === "Delete" || g.key === "Backspace") && h >= 0 ? (g.preventDefault(), o.remove(h), h = -1, L()) : (g.ctrlKey || g.metaKey) && g.key.toLowerCase() === "z" && (g.preventDefault(), g.shiftKey ? o.redo() : o.undo(), u = null, L());
  }, { capture: !0 });
  async function N() {
    if (!o || c) return;
    const g = f;
    c = !0, x(), _("Auto-routing remaining connections…");
    try {
      await o.autoRoute(() => g !== f), g === f && (u = null, h = -1, c = !1, L());
    } catch (M) {
      g === f && (c = !1, L(), _(M.message));
    }
  }
  return {
    mount(g, M, E, P, D, { reset: S = !1 } = {}) {
      if (f++, c = !1, l = g, u = null, s = null, h = -1, y = D.gridSize || 0, w = new Map(Object.values(E.nodes).map(($) => [$.bit, $.name])), !M || !y) {
        o = null, A();
        return;
      }
      const Q = structuredClone(M);
      for (const $ of Q.components) {
        const se = l.getElementById("cell_" + $.id);
        for (const X of $.ports) {
          const ne = [...se.children].find((O) => O.getAttribute("s:pid") === X.pin);
          X.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[ne?.getAttribute("s:position")] || X.side;
        }
      }
      for (const [$, se] of Object.entries(P.modules.circuit.cells)) if (se.attributes.name === "0") {
        const X = l.getElementById("cell_" + $), ne = X?.transform.baseVal.consolidate().matrix;
        X && ne && Q.components.push({ id: $, decoration: !0, x: ne.e, y: ne.f, width: +X.getAttribute("s:width"), height: +X.getAttribute("s:height"), ports: [...X.children].filter((O) => O.hasAttribute("s:pid")).map((O) => ({ pin: O.getAttribute("s:pid"), x: ne.e + Number(O.getAttribute("s:x")), y: ne.f + Number(O.getAttribute("s:y")), bit: se.connections[O.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const G = new Map(Object.values(E.nodes).map(($) => [$.name, $.bit])), H = [...l.children].filter(($) => $.localName === "line" && $.hasAttribute("data-net")).map(($) => ({ bit: G.get($.dataset.net), a: { x: +$.getAttribute("x1"), y: +$.getAttribute("y1") }, b: { x: +$.getAttribute("x2"), y: +$.getAttribute("y2") } }));
      o = new gn(Q, { step: y, segments: H }), m = JSON.stringify([E.topology.signature, D]), !S && C.has(m) ? o.restore(C.get(m)) : e("flywire").checked && o.clear(), a = e("interactive").checked, a || !S && C.has(m) || e("flywire").checked ? L() : A();
    },
    invalidate() {
      f++, c = !1, o = null, l = null, u = null, s = null, A();
    },
    setEnabled(g) {
      a = g, g || (u = null), o ? L() : A();
    },
    clear() {
      o && (o.clear(), u = null, L());
    },
    autoRoute: N,
    undo() {
      o && (u = null, o.undo(), L());
    },
    redo() {
      o && (u = null, o.redo(), L());
    },
    complete() {
      return !o || !c && o.airwires().length === 0;
    },
    working() {
      return c;
    },
    stats: v,
    canEdit() {
      return !!o;
    },
    refreshColors() {
      if (l) {
        for (const g of l.querySelectorAll("[data-air-net]")) g.setAttribute("stroke", p(+g.dataset.airNet));
        for (const g of l.querySelectorAll("[data-editor-bit]")) g.setAttribute("stroke", p(+g.dataset.editorBit));
      }
    },
    cleanExport(g) {
      for (const M of g.querySelectorAll("[data-editor-overlay],[data-route-preview]")) M.remove();
      for (const M of g.querySelectorAll("[data-editor-component]"))
        M.removeAttribute("data-editor-component"), M.style.removeProperty("opacity");
    }
  };
}
const Ne = "http://www.w3.org/2000/svg";
function Le(t, e, n = !0, i = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), o = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(Ne, "defs"), r.dataset.coordinateGrid = "true";
    const u = document.createElementNS(Ne, "pattern");
    u.id = "spice-coordinate-grid", u.setAttribute("patternUnits", "userSpaceOnUse");
    const s = document.createElementNS(Ne, "path");
    s.setAttribute("fill", "none"), s.setAttribute("stroke", "#737b83"), s.setAttribute("stroke-opacity", ".23"), s.setAttribute("stroke-width", ".55"), s.setAttribute("vector-effect", "non-scaling-stroke"), u.append(s), r.append(u), o = document.createElementNS(Ne, "rect"), o.dataset.coordinateGrid = "true", o.setAttribute("fill", "url(#spice-coordinate-grid)"), o.setAttribute("stroke", "none"), o.setAttribute("pointer-events", "none"), t.prepend(o), t.prepend(r);
  }
  const l = r.firstElementChild, a = e || 8;
  l.setAttribute("width", a), l.setAttribute("height", a), l.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), o.setAttribute("visibility", n && e ? "visible" : "hidden");
  const c = i || (() => {
    const u = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    return { x: u[0], y: u[1], w: u[2], h: u[3] };
  })();
  for (const [u, s] of Object.entries({ x: c.x, y: c.y, width: c.w, height: c.h })) o.setAttribute(u, s);
}
const tt = ve.filter.source, T = (t) => document.getElementById("spice-" + t), pe = T("app");
if (pe) {
  let d = function() {
    const O = e.querySelector("svg");
    if (!O) return;
    c && un(O, u, c), a?.refreshColors(), Le(O, h?.layout.report?.gridSize || 0, T("show-grid").checked, p);
    const R = O.cloneNode(!0);
    a?.cleanExport(R), R.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), Le(R, h?.layout.report?.gridSize || 0, T("show-grid").checked, _), s = new XMLSerializer().serializeToString(R), T("source").value = s;
  }, M = function(O) {
    const R = T("example-info");
    if (R && (R.replaceChildren(), !!O && (R.append(document.createTextNode(O.description + " ")), O.url))) {
      const V = document.createElement("a");
      V.href = O.url, V.target = "_blank", V.rel = "noopener noreferrer", V.textContent = O.reference, R.append(V);
    }
  }, E = function() {
    a.invalidate(), N.setEnabled(!1), r = null, o = null, s = "", k(), M(Object.values(ve).find((O) => O.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, P = function(O) {
    i.replaceChildren();
    for (const { severity: R, line: V, message: j, source: F } of O) {
      const B = document.createElement("li");
      B.className = R, B.textContent = `${R.toUpperCase()}${F && F !== "input.cir" ? " · " + F : ""}${V ? " · line " + V : ""}: ${j}`, i.append(B);
    }
    T("messages").open = O.some((R) => R.severity !== "info"), T("message-count").textContent = `${O.length} message${O.length === 1 ? "" : "s"}`;
  }, D = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${p.x} ${p.y} ${p.w} ${p.h}`);
    const O = e.querySelector("svg");
    O && Le(O, h?.layout.report?.gridSize || 0, T("show-grid").checked, p), T("zoom-level").textContent = Math.round(_.w / p.w * 100) + "%";
  }, S = function(O, R = p.x + p.w / 2, V = p.y + p.h / 2) {
    if (!e.querySelector("svg")) return;
    const j = Math.max(0.05, Math.min(10, p.w * O / _.w)) * _.w / p.w;
    p = { x: R + (p.x - R) * j, y: V + (p.y - V) * j, w: p.w * j, h: p.h * j }, D();
  }, G = function(O) {
    const R = new URLSearchParams();
    O && R.set("instance", O);
    const V = R.toString();
    location.hash.slice(1) === V ? (w = O, X()) : location.hash = V;
  }, H = function() {
    w = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, $ = function() {
    const O = !!(C && C !== w && f?.contexts[C]);
    T("selection-actions").hidden = !O, T("open-instance").href = "#" + new URLSearchParams({ instance: C });
  }, se = function() {
    T("breadcrumbs").replaceChildren();
    const O = (V, j) => {
      const F = document.createElement("button");
      F.type = "button", F.textContent = V, F.onclick = () => G(j), F.disabled = j === w, T("breadcrumbs").append(F);
    };
    if (O("Top", ""), w) {
      const V = f.contexts[w].path;
      for (let j = 0; j < V.length; j++) O(V[j], V.slice(0, j + 1).map(encodeURIComponent).join("/"));
    }
    T("instances").replaceChildren();
    const R = (V, j) => {
      for (const F of V.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(j, 8)), B.dataset.instance = F.id;
        const ae = document.createElement("a");
        ae.href = "#" + new URLSearchParams({ instance: F.id }), ae.textContent = F.name + " · " + F.definition, ae.title = "Open " + F.id + " as its own sheet";
        const de = document.createElement("span");
        if (de.className = "spice-help", de.textContent = Object.entries(F.params).map(([ue, ie]) => ue + "=" + ie).join(" · "), B.append(ae), de.textContent) {
          const ue = document.createElement("details"), ie = document.createElement("summary");
          ie.textContent = "Parameters", ue.append(ie, de), B.append(ue);
        }
        T("instances").append(B), R(F, j + 1);
      }
    };
    R(f.contexts[w], 0), T("hierarchy-panel").hidden = !f.contexts[w].children.length, T("focus-title").textContent = w ? w + " / " + f.contexts[w].definition : "Top-level schematic", $();
  };
  pn(pe);
  const t = T("input"), e = T("preview"), n = T("status"), i = T("diagnostics");
  let r = null, o = null, l = !1, a = null, c = null, u = [], s = "", h, f, m, y = "", w = "", C = "", b = !1, p = { x: 0, y: 0, w: 1, h: 1 }, _ = { ...p }, v, A = !1, x = {};
  try {
    x = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  pe.addEventListener("click", (O) => {
    b && O.target.closest('a[href^="#"]') && O.preventDefault();
  });
  const k = () => {
    T("copy").disabled = T("download").disabled = !s || b || a?.working(), T("download-asc").disabled = T("download-asc-bundle").disabled = !s || !r || b || l || !a?.complete();
  }, L = () => ({ font: T("font").value, fontSize: Number(T("size").value), color: je, gridSize: T("grid").checked && T("conventional").checked ? Number(T("grid-size").value) : 0, detailed: T("detailed").checked, conventional: T("conventional").checked }), N = fn(T, (O, R) => {
    c = O, u = R, d();
  });
  a = wn(e, T, { getNetColor: (O) => {
    const R = u.find((V) => V.bit === O);
    return R && c && (c.auto || c.manual.has(R.name)) ? c.color(R.name) : null;
  }, inspect: (O) => {
    const R = h?.components.find((V) => V.name === O);
    R && (C = R.instanceId || "", T("selection").textContent = R.raw, $());
  }, changed: (O, R, V) => {
    r = O, o = null, _ = V;
    const j = e.querySelector("svg");
    if (j) {
      j.setAttribute("width", String(_.w)), j.setAttribute("height", String(_.h));
      const F = j.querySelector("#spice-layout-report");
      if (F) {
        const B = JSON.parse(F.textContent);
        B.manualWiring = R, B.verifiedTerminals = !R.unrouted, B.geometricConnectivityVerified = !R.unrouted, F.textContent = JSON.stringify(B);
      }
    }
    h && m && (T("json").value = JSON.stringify({ circuit: h, netlist: Ye(h), hierarchy: m, interactive: { ...R, drawing: O } }, null, 2)), d(), k();
  } }), T("show-grid").onchange = d;
  async function g() {
    (!r || !h?.layout.report?.gridVerified) && (T("grid").checked = !0, T("conventional").checked = !0, await X({ resetEditor: !0 })), a.setEnabled(T("interactive").checked), k();
  }
  T("interactive").onchange = g, T("flywire").onchange = async () => {
    T("interactive").checked = !0, await g(), T("flywire").checked ? a.clear() : await a.autoRoute(), k();
  }, T("auto-route").onclick = async () => {
    T("interactive").checked = !0, await g(), await a.autoRoute(), k();
  }, T("wire-undo").onclick = () => a.undo(), T("wire-redo").onclick = () => a.redo(), N.setEnabled(!1), t.value = tt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || tt;
  } catch {
  }
  M(Object.values(ve).find((O) => O.source === t.value)), t.addEventListener("input", E);
  for (const O of ["font", "size", "detailed", "conventional", "grid", "grid-size"]) T(O).addEventListener("input", E);
  T("zoom-in").onclick = () => S(0.8), T("zoom-out").onclick = () => S(1.25), T("fit").onclick = () => {
    p = { ..._ }, D();
  };
  const Q = (O) => {
    const R = e.querySelector("svg");
    return R ? new DOMPoint(O.clientX, O.clientY).matrixTransform(R.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (O) => {
    const R = Q(O);
    R && (O.preventDefault(), S(O.deltaY > 0 ? 1.12 : 1 / 1.12, R.x, R.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (O) => {
    ![0, 1].includes(O.button) || !e.querySelector("svg") || (v = { start: Q(O), x: O.clientX, y: O.clientY, view: { ...p }, moved: !1 }, e.setPointerCapture(O.pointerId));
  }), e.addEventListener("pointermove", (O) => {
    if (!v) return;
    const R = Q(O);
    Math.hypot(O.clientX - v.x, O.clientY - v.y) > 4 && (v.moved = !0), p.x += v.start.x - R.x, p.y += v.start.y - R.y, D();
  }), e.addEventListener("pointerup", (O) => {
    if (!v) return;
    const R = v.moved;
    if (v = null, e.hasPointerCapture(O.pointerId) && e.releasePointerCapture(O.pointerId), !R) {
      const V = document.elementFromPoint(O.clientX, O.clientY)?.closest("[data-component]"), j = h?.components.find((F) => F.name === V?.dataset.component);
      j && (C = j.instanceId || "", T("selection").textContent = `${j.raw}
${Object.entries(j.terminals).map(([F, B]) => `${F} → ${B}`).join("   ")}`, j.kind === "X" ? G(j.instanceId) : $());
    }
  }), window.addEventListener("hashchange", () => {
    if (b) {
      A = !0;
      return;
    }
    H(), C = "", X();
  }), e.addEventListener("pointercancel", () => {
    v = null;
  }), e.addEventListener("keydown", (O) => {
    const R = O.target.closest("[data-instance]");
    if (R && (O.key === "Enter" || O.key === " ")) {
      O.preventDefault(), C = R.dataset.instance, G(C);
      return;
    }
    O.key === "+" || O.key === "=" ? S(0.8) : O.key === "-" ? S(1.25) : O.key.toLowerCase() === "f" ? (p = { ..._ }, D()) : O.key.startsWith("Arrow") && (O.preventDefault(), p.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[O.key] || 0) * p.w, p.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[O.key] || 0) * p.h, D());
  });
  async function X({ resetEditor: O = !1 } = {}) {
    if (b) return;
    b = !0, a.invalidate(), N.setEnabled(!1), r = null, o = null, s = "", k(), T("generate").disabled = !0, t.readOnly = !0, T("file").disabled = !0, T("libraries").disabled = !0;
    for (const V of pe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) V.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let R = [];
    try {
      if (y !== t.value || !f) {
        if (m = At(t.value, { files: x }), R = [...m.diagnostics], R.some((U) => U.severity === "error"))
          throw f = null, Error("Fix the parser errors below before generating.");
        f = Qe(m), y && y !== t.value ? (w = "", C = "", history.replaceState(null, "", location.pathname + location.search)) : H(), y = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (R = [...m.diagnostics], P(R), R.some((U) => U.severity === "error")) throw Error("Fix the parser errors below before generating.");
      h = Yt(f, { focus: w });
      for (const U of h.interfaceAliases) R.push({ severity: "info", message: `Instance boundary: ${U.ports.join(" = ")} share parent node ${U.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const V = Ye(h);
      L().conventional && R.push(...h.layout.diagnostics);
      const j = await en(V, L()), F = new DOMParser().parseFromString(j.svg, "image/svg+xml");
      if (F.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const B = F.documentElement, ae = B.querySelector("#spice-layout-report");
      if (ae) {
        h.layout.report = JSON.parse(ae.textContent);
        const U = h.layout.report;
        if (R.push({ severity: "info", message: `Layout: compact signal flow; ${U.powerSourcesChecked} DC/ground symbols checked, ${U.powerOrderViolations} DC order preference(s) unmet. ${U.powerPass}. ${U.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), U.classicTemplateFallback && R.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), U.groundPlacement && R.push({ severity: "info", message: `Ground: ${U.groundPlacement}; ${U.straightenedGroundDrops || 0} return-path simplification(s).` }), U.explicitGroups && R.push({ severity: "info", message: `Layout comments: ${U.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), U.classicRails && R.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${U.railCount} shared voltage rails.` }), U.localClassicInstances?.length && R.push({ severity: "info", message: `${U.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), U.localClassicStages?.length && R.push({ severity: "info", message: `Classic transistor proximity active: ${U.localClassicStages.join(", ")}.` }), U.sharedClassicRails && R.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), U.mirroredTransistors?.length && R.push({ severity: "info", message: `Control-pin mirror choices: ${U.mirroredTransistors.join(", ")}.` }), U.recognizedMotifs?.length && R.push({ severity: "info", message: `Transistor structures: ${U.recognizedMotifs.map((W) => `${W.kind} (${W.members.join(", ")}; ${W.confidence})`).join("; ")}.` }), U.appliedMotifs?.length && R.push({ severity: "info", message: `Topology preferences applied to ${U.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), U.subnetFirstFallback && R.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + U.subnetFirstFallback }), U.pairCompactionFallback && R.push({ severity: "warning", message: "Pair proximity kept the original regions: " + U.pairCompactionFallback }), U.compoundPairFallback && R.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + U.compoundPairFallback }), U.pairConstraints?.length) {
          const W = U.pairConstraints.filter((re) => re.crossRegion && !re.compacted).length;
          R.push({ severity: "info", message: `${U.pairConstraints.length - W} adjacent transistor pair(s); ${W} cross-region mirror row constraint(s).` });
        }
        U.netShortcuts && R.push({ severity: "info", message: `${U.netShortcuts} safe straight net shortcut(s); ${U.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), U.sharedRailFallback && R.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${U.sharedRailFallback}.` });
        for (const W of U.localClassicFallbacks || []) W.stage && R.push({ severity: "info", message: `Classic stage ${W.stage} uses automatic layout: ${W.reason || "No unobstructed local template"}.` });
        U.geometricConnectivityVerified && R.push({ severity: "info", message: `Net geometry verified; ${U.cyclesRemoved} same-net loop(s) and ${U.leavesRemoved} unused wire branch(es) removed.` }), P(R);
      }
      if (B.localName !== "svg" || B.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const de = Number(B.getAttribute("width")), ue = Number(B.getAttribute("height"));
      _ = { x: -20, y: -20, w: de + 40, h: ue + 40 }, p = { ..._ }, B.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), B.setAttribute("width", String(_.w)), B.setAttribute("height", String(_.h)), B.setAttribute("role", "img"), B.setAttribute("aria-label", h.title || "SPICE schematic"), B.setAttribute("style", "background:white");
      for (const U of h.components) {
        const W = F.getElementById("cell_" + U.name);
        if (!W) throw Error("Renderer omitted component " + U.name);
        W.setAttribute("data-component", U.name), U.kind === "X" && (W.setAttribute("data-instance", U.instanceId), W.setAttribute("role", "button"), W.setAttribute("tabindex", "0"), W.setAttribute("aria-label", "Open " + U.name));
        const re = F.createElementNS(B.namespaceURI, "title");
        re.textContent = U.raw + `
Resolved: ` + U.value + `
` + Object.entries(U.terminals).map(([ye, we]) => ye + ": " + we).join(", "), W.prepend(re);
      }
      for (const U of Object.values(h.nodes))
        for (const W of B.querySelectorAll(".net_" + U.bit)) {
          W.setAttribute("data-net", U.name);
          const re = F.createElementNS(B.namespaceURI, "title");
          re.textContent = "Node " + U.displayName, W.append(re);
        }
      const ie = h.components.filter((U) => U.kind === "K").map((U) => ({ name: U.name, inductors: U.coupledInductors, value: U.value }));
      if (ie.length) {
        const U = F.createElementNS(B.namespaceURI, "metadata");
        U.setAttribute("id", "spice-magnetic-couplings"), U.textContent = JSON.stringify(ie), B.append(U);
        for (const W of ie) for (const re of W.inductors) {
          const ye = F.getElementById("cell_" + re);
          if (!ye) continue;
          const we = F.createElementNS(B.namespaceURI, "circle"), ke = [...ye.children].find((Oe) => Oe.getAttribute("s:pid") === "A"), st = ke?.getAttribute("s:position"), Fe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[st] || [0, 0];
          for (const [Oe, at] of Object.entries({ cx: Number(ke?.getAttribute("s:x")) + Fe[0], cy: Number(ke?.getAttribute("s:y")) + Fe[1], r: 3, fill: L().color, stroke: "none", "data-coupling": W.name })) we.setAttribute(Oe, String(at));
          const Ge = F.createElementNS(B.namespaceURI, "title");
          Ge.textContent = W.name + " · dotted terminal: " + W.inductors.join(", "), we.append(Ge), ye.append(we);
        }
      }
      r = j.drawing, s = new XMLSerializer().serializeToString(B), T("source").value = s, e.replaceChildren(document.importNode(B, !0)), D();
      const Be = R.filter((U) => U.severity === "warning").length;
      n.textContent = `${h.components.filter((U) => !U.synthetic).length} components · ${Object.keys(h.nodes).length} nodes · ${h.topology.leafCount} primitive devices verified${h.interfaceAliases.length ? " · Parent-connected ports: " + h.interfaceAliases.map((U) => U.ports.join(" = ")).join("; ") + "." : ""}${Be ? " · Review " + Be + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Te}.`, h.layout.report?.gridVerified && (n.textContent += ` Grid ${h.layout.report.gridSize}.`), h.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${h.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), h.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), T("json").value = JSON.stringify({ circuit: h, netlist: V, hierarchy: m }, null, 2), N.setCircuit(h, t.value), a.mount(e.querySelector("svg"), r, h, V, L(), { reset: O }), d(), T("selection").textContent = "Click a component to inspect its original statement and pin connections.", se();
    } catch (V) {
      if (e.replaceChildren(), s = "", T("source").value = "", T("json").value = "", T("nets").replaceChildren(), T("selection").textContent = "", n.textContent = V.message, !f)
        T("hierarchy-panel").hidden = !0, T("selection-actions").hidden = !0, T("breadcrumbs").replaceChildren();
      else if (!f.contexts[w]) {
        const j = document.createElement("button");
        j.type = "button", j.textContent = "Return to Top", j.onclick = () => G(""), T("breadcrumbs").replaceChildren(j);
      }
      N.setCircuit(null, t.value), V.diagnostics && (R = V.diagnostics), R.some((j) => j.severity === "error") || R.push({ severity: "error", line: 0, message: V.message }), P(R);
    } finally {
      b = !1, T("generate").disabled = !1, t.readOnly = !1, T("file").disabled = !1, T("libraries").disabled = !1;
      for (const V of pe.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) V.disabled = !1;
      f && f.contexts[w] && se(), N.setEnabled(!!s), e.setAttribute("aria-busy", "false"), k(), A && (A = !1, H(), queueMicrotask(X));
    }
  }
  T("generate").onclick = () => X({ resetEditor: !0 });
  for (const O of pe.querySelectorAll("[data-example]")) O.onclick = () => {
    const R = ve[O.dataset.example];
    t.value = R.source, E(), M(R), X();
  };
  T("file").onchange = async (O) => {
    const R = O.target.files[0];
    if (R) {
      if (R.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Ze(R), E(), X();
      } catch (V) {
        n.textContent = "File could not be read: " + V.message;
      } finally {
        O.target.value = "";
      }
    }
  }, T("libraries").onchange = async (O) => {
    try {
      for (const R of O.target.files) {
        if (R.size > 16e6) throw Error("Library exceeds 16 MB: " + R.name);
        x[R.webkitRelativePath || R.name] = await Ze(R);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(x));
      } catch {
      }
      f = null, y = "", T("library-status").textContent = Object.keys(x).length + " library file(s) loaded", X();
    } catch (R) {
      n.textContent = R.message;
    } finally {
      O.target.value = "";
    }
  }, T("library-status").textContent = Object.keys(x).length ? "Libraries restored from this session." : "For .include / .lib dependencies", T("download").onclick = () => {
    const O = URL.createObjectURL(new Blob([s], { type: "image/svg+xml;charset=utf-8" })), R = document.createElement("a");
    R.href = O, R.download = "spice-schematic.svg", R.click(), setTimeout(() => URL.revokeObjectURL(O), 1e3);
  };
  async function ne(O) {
    const R = r;
    if (!(!R || b || l)) {
      l = !0, k(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: V } = await import("./asc-export-C_DTGBls.js");
        if (r !== R) throw Error("Schematic changed. Generate again before exporting ASC.");
        o ||= V({ tree: f, circuit: h, drawing: R, source: t.value, libraries: x });
        const j = O ? o.zip : o.ascBytes, F = URL.createObjectURL(new Blob([j], { type: O ? "application/zip" : "application/octet-stream" })), B = document.createElement("a");
        B.href = F, B.download = O ? "spice-schematic-asc.zip" : "spice-schematic.asc", B.click(), setTimeout(() => URL.revokeObjectURL(F), 1e3), n.textContent = "ASC connections verified · " + o.manifest.audit.symbols + " symbols. " + (O ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), o.manifest.warnings.length && (n.textContent += " " + o.manifest.warnings.join(" "));
      } catch (V) {
        n.textContent = "ASC export failed: " + V.message;
        const j = document.createElement("li");
        j.className = "error", j.textContent = n.textContent, i.append(j);
      } finally {
        l = !1, k();
      }
    }
  }
  T("download-asc").onclick = () => ne(!1), T("download-asc-bundle").onclick = () => ne(!0), T("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(s), n.textContent = "SVG source copied to clipboard.";
    } catch {
      T("source-details").open = !0, T("source").focus(), T("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, X();
}
export {
  Me as b,
  Qe as e,
  ge as l,
  Pe as n,
  Tt as p
};
