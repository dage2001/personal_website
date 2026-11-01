const mn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, gn = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, bn = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, yn = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, wn = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, xn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, vn = { 1: "a", 2: "b", 7: "Q", 8: "com" }, En = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Nn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Sn = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, _n = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Cn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, kn = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, In = {
  AND: mn,
  BUF: gn,
  COUNTER: bn,
  DFLOP: yn,
  SCHMITT: wn,
  OR: xn,
  PHASEDET: vn,
  SRFLOP: En,
  XOR: Nn,
  MODULATOR: Sn,
  OTA: _n,
  SAMPLEHOLD: Cn,
  VARISTOR: kn
}, An = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Ve = (t) => t.toLowerCase(), Rt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), On = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Tn(t, e) {
  const n = (N) => e[Ve(N || "")] || Object.entries(e).find(([y]) => y.startsWith(Ve(N || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let o = [], s = [], u = "", r = "", l = [], a = [], c = 0, v = "", b = "", d = "", g = !0;
  if ("RLC".includes(i))
    o = ["A", "B"], r = Ve(i) + "_v";
  else if ("DVIB".includes(i))
    o = ["+", "-"], r = i === "D" ? "d_v" : i === "B" ? "spice_b" : Ve(i);
  else if (i === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Rt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), u = t[o.length + 1] || "";
    const N = n(u)?.type;
    g = ["NPN", "PNP"].includes(N), r = g ? (o.length === 3 ? "q_" : "spice_q4_") + Ve(N) : "spice_q" + o.length;
  } else if (i === "M") {
    const N = n(t[4]), y = n(t[5]), w = N?.type === "VDMOS" || !y && (!t[5] || Rt(t[5]));
    o = w ? ["D", "G", "S"] : ["D", "G", "S", "B"], u = t[o.length + 1] || "";
    const C = n(u), _ = C?.type;
    if (w && C && _ !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!w && _ === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    g = ["NMOS", "PMOS", "VDMOS"].includes(_);
    let I = null, S = C;
    const M = /* @__PURE__ */ new Set();
    for (; S && !M.has(S.name) && (M.add(S.name), I = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(S.raw), !I); )
      S = n(S.baseModel);
    const B = _ === "PMOS" || _ === "VDMOS" && I && (I[1] === void 0 || Number(I[1]) >= 0.5);
    r = g ? "spice_" + (B ? "pmos" : "nmos") + (w ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    u = t[4] || "";
    const N = n(u)?.type, y = i === "Z" && ["NIGBT", "PIGBT"].includes(N);
    o = y ? ["C", "G", "E"] : ["D", "G", "S"], g = i === "J" ? ["NJF", "PJF"].includes(N) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(N), r = "spice_" + (y ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(N || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    o = ["+", "-"], r = "spice_" + Ve(i);
    let N = 3, y = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[N] || "");
    if (/^poly$/i.test(t[N] || "") && (y = /^\(\s*(\d+)\s*\)$/.exec(t[++N] || ""), !y))
      throw Error("POLY requires a dimension.");
    if (y) {
      const w = Number(y[1]);
      if (w > 128) throw Error("POLY supports at most 128 controlling variables.");
      let C = N + 1, _ = [];
      const I = "EG".includes(i), S = w * (I ? 2 : 1);
      for (; _.length < S && C < t.length; ) _.push(...On(t[C++]));
      if (_.length !== S || C >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (I) {
        for (let M = 0; M < w; M++) o.push("C" + (M + 1) + "+", "C" + (M + 1) + "-");
        s = [t[1], t[2], ..._];
      } else l = _;
      c = C, v = "POLY(" + w + ") " + (I ? "" : _.join(" ") + " "), b = "POLY", I && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? b = "BEHAVIORAL" : "EG".includes(i) ? (o.push("C+", "C-"), b = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (l = [t[3]], c = 4, v = t[3] + " ");
    d = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (b ? " · " + b : "");
  } else if (i === "S")
    o = ["A", "B", "C+", "C-"], u = t[5] || "", r = "spice_device", d = "Voltage switch";
  else if (i === "W")
    o = ["A", "B"], l = [t[3]], u = t[4] || "", c = 3, r = "spice_device", d = "Current switch";
  else if ("TO".includes(i))
    o = ["L+", "L-", "R+", "R-"], i === "O" && (u = t[5] || ""), r = "spice_device", d = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    o = ["N1", "N2", "COM"], u = t[4] || "", r = "spice_device", d = "Distributed RC";
  else if (i === "A")
    o = Array.from({ length: 8 }, (N, y) => "P" + (y + 1)), r = "spice_device", d = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = t.slice(1, -1), a.some((N) => !/^L/i.test(N.split(":").at(-1)))) throw Error("K references must name inductors.");
    c = t.length - 1, r = "spice_coupling", d = "Magnetic coupling", v = a.join(" ") + " · k=";
  } else if (i === "@")
    o = ["IN", "OUT"], r = "spice_device", d = "FRA";
  else if (i === "&")
    o = ["O+", "O-", "I+", "I-"], r = "spice_device", d = "FRA probe";
  else if (i === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", d = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (c || (c = o.length + 1), s.length || (s = t.slice(1, o.length + 1)), s.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= c && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (s.some((N) => /[=()]/.test(N) && !/^\{[\s\S]*\}$/.test(N))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(c).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(c).join(" ")) && (r = "spice_br"), i === "D" && (u = t[3] || ""), i === "@") {
    const N = t.slice(c).join(" ");
    for (const y of N.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(y[1].toUpperCase()), s.push(y[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (l.some((N) => !N)) throw Error("Missing controlling voltage source.");
  const m = o.map((N, y) => i === "A" && In[(t[9] || "").toUpperCase()]?.[String(y + 1)] || N);
  return { kind: i, pins: o, nodeTokens: s, pinLabels: m, model: u, type: r, controlSource: l[0] || "", controlSources: l, coupledInductors: a, value: v + t.slice(c).join(" "), sourceMode: b, symbol: d, polarityKnown: g };
}
const Mn = An, Ln = new Set(Mn.split(" ")), bt = () => /* @__PURE__ */ Object.create(null), _e = (t) => t.toLowerCase();
function ct(t) {
  const e = [], n = [];
  let i = "", o = 0, s = "";
  for (let u = 0; u < t.length; u++) {
    const r = t[u];
    if (s) {
      i += r, r === s && t[u - 1] !== "\\" && (s = "");
      continue;
    }
    if (r === '"' || r === "'") {
      s = r, i += r;
      continue;
    }
    if (!o && (r === ";" || r === "$" && (!u || /\s/.test(t[u - 1])))) break;
    if ("({".includes(r) && (n.push(r), o++), ")}".includes(r) && (o--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !o ? (i && e.push(i), i = "") : i += r;
  }
  if (o || s) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function Rn(t, e = {}) {
  const n = [], i = [], o = [], s = Object.assign(bt(), e.models), u = bt(), r = (y, w, C) => n.push({ severity: y, line: w, message: C });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const l = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, w) => {
    const C = y.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? l.length ? l.at(-1).text += " " + C.slice(1).trim() : r("error", w + 1, "Continuation has no preceding statement.") : l.push({ line: w + 1, text: C }));
  });
  for (const y of l) {
    try {
      y.tokens = ct(y.text);
    } catch (C) {
      r("error", y.line, C.message), y.tokens = [];
    }
    const w = y.tokens;
    if (/^\.model$/i.test(w[0] || ""))
      if (w.length < 3) r("error", y.line, ".model requires a name and device type.");
      else {
        const C = /^ako:(.+)$/i.exec(w[2]), _ = C && w[3] && !w[3].startsWith("(") ? w[3].split("(")[0].toUpperCase() : "";
        s[_e(w[1])] = { name: w[1], type: C ? _ : w[2].split("(")[0].toUpperCase(), baseModel: C?.[1] || "", raw: y.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function c(y) {
    const w = s[_e(y)];
    if (!w) return "";
    if (w.type) return w.type;
    if (a.has(_e(y))) throw Error("Circular AKO model inheritance: " + y);
    return a.add(_e(y)), w.type = c(w.baseModel), a.delete(_e(y)), w.type;
  }
  for (const y of Object.values(s)) if (y.baseModel && !y.type)
    try {
      c(y.name);
    } catch (w) {
      r("error", 0, w.message);
    }
  let v = "", b = 0, d = !1, g = !1;
  const m = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: y, text: w, tokens: C } of l) {
    if (!C.length) continue;
    const _ = _e(C[0]);
    if (g) {
      r("warning", y, "Statement after .end is not rendered: " + w);
      continue;
    }
    if (_ === ".control") {
      d = !0, r("warning", y, ".control script retained but not executed or rendered.");
      continue;
    }
    if (_ === ".endc") {
      d = !1;
      continue;
    }
    if (d) continue;
    if (_ === ".subckt") {
      b++, r("error", y, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (_ === ".ends") {
      b ? b-- : r("error", y, "Unmatched .ends.");
      continue;
    }
    if (b) continue;
    if (_ === ".end") {
      g = !0;
      continue;
    }
    if (_.startsWith(".")) {
      i.push({ line: y, text: w }), _ === ".title" ? v = C.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(_) ? r("error", y, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(_) ? r("error", y, "Topology-changing directive is unsupported: " + w) : N.has(_) || r("warning", y, "Directive retained but not resolved: " + w);
      continue;
    }
    const I = C[0][0].toUpperCase();
    if (!Ln.has(I)) {
      y === 1 && !/\d/.test(C[0]) && C.length > 1 && I !== "X" ? (v = w, r("warning", y, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", y, `Unsupported ${I} device was not rendered: ${w}`);
      continue;
    }
    const S = I === "M" || I === "Q" ? 5 : 4;
    if (y === 1 && !/\d/.test(C[0]) && (C.length < S || I === "T" && !/\b(?:zo|z0)\s*=/i.test(w))) {
      v = w, r("info", y, "SPICE title: " + w);
      continue;
    }
    try {
      if (m.has(_)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const M = Tn(C, s), { pins: B, nodeTokens: E, ...x } = M;
      M.polarityKnown || r("warning", y, `${C[0]}: model polarity unknown; explicit ${B.join("/")} terminals retained.`);
      const H = bt();
      B.forEach((K, $) => {
        const te = _e(E[$]);
        u[te] || (u[te] = { name: te, displayName: C[$ + 1], bit: Object.keys(u).length + 2, terminals: [] }), u[te].terminals.push({ component: C[0], pin: K }), H[K] = te;
      }), o.push({ ...x, name: C[0], terminals: H, line: y, raw: w }), m.add(_);
    } catch (M) {
      r("error", y, `${C[0]}: ${M.message} Statement: ${w}`);
    }
  }
  b && r("error", 0, "Unclosed .subckt definition."), d && r("error", 0, "Unclosed .control block."), o.length || r("error", 0, "No supported components to render."), o.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const y of o) {
    for (const w of y.controlSources || []) !w.includes(":") && !o.some((C) => _e(C.name) === _e(w) && C.kind === "V") && r("error", y.line, `${y.name}: controlling voltage source ${w} was not found.`);
    for (const w of y.coupledInductors || []) !w.includes(":") && !o.some((C) => _e(C.name) === _e(w) && C.kind === "L") && r("error", y.line, `${y.name}: coupled inductor ${w} was not found.`);
    (y.kind === "B" || y.type === "spice_b") && r("info", y.line, `${y.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: v, components: o, nodes: u, models: s, directives: i, diagnostics: n };
}
const Ue = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Pt = (t) => Ue(t).split("/").at(-1);
function Pn(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), o = [], s = [], u = [];
  let r = 0;
  const l = (c, v) => {
    const b = Ue(v).split("/").slice(0, -1).concat(Ue(c)).join("/"), d = [...i].filter(([m]) => Ue(m) === Ue(c) || Ue(m) === b);
    if (d.length === 1) return d[0];
    const g = [...i].filter(([m]) => Pt(m) === Pt(c));
    if (g.length !== 1) throw Error(g.length ? "Ambiguous library filename: " + c : "Missing library " + c + ". Add this file using Upload.");
    return g[0];
  };
  function a(c, v, b = "", d = []) {
    const g = Ue(v) + ":" + b.toLowerCase();
    if (d.includes(g)) throw Error("Circular library include: " + [...d, g].join(" → "));
    if (d.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const m = [], N = /^\s*\.endl\b/im.test(c);
    let y = !b;
    const w = (_, I) => {
      if (r += _.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      u.push(_), s.push({ file: v, line: I + 1 });
    };
    if (c.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((_, I) => {
      const S = _.trim();
      if (/^\.lib\b/i.test(S) && N) {
        const M = ct(S);
        if (M.length === 2 && !/[.\\/]/.test(M[1])) {
          m.push(M[1].toLowerCase()), M[1].toLowerCase() === b.toLowerCase() && (y = !0), w("* Library section " + M[1], I);
          return;
        }
      }
      if (/^\.endl\b/i.test(S)) {
        m.pop(), w("* End library section", I);
        return;
      }
      if (b && m.length && !m.includes(b.toLowerCase())) {
        w("* Unselected library section", I);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(S))
        try {
          const M = ct(S);
          if (!M[1]) throw Error("Include requires a filename.");
          const [B, E] = l(M[1], v);
          w("* Included " + B, I), a(E, B, M[2] || "", [...d, g]);
        } catch (M) {
          o.push({ severity: "error", line: I + 1, source: v, message: M.message }), w("* Unresolved include", I);
        }
      else w(_, I);
    }), !y) throw Error("Library section " + b + " not found in " + v);
  }
  try {
    a(t, n);
  } catch (c) {
    o.push({ severity: "error", line: 0, source: n, message: c.message });
  }
  return { source: u.join(`
`), origins: s, diagnostics: o };
}
function Dn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], o = [];
  t.split(/\r?\n/).forEach((r, l) => {
    const a = r.trim();
    /^\.subckt\b/i.test(a) && (i.push(l + 1), n.set(l + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: r, line: l + 1 }) : e[l] = r, /^\.ends\b/i.test(a) && i.length > 1 && i.pop();
  });
  const s = Dt(Array.from({ length: t.split(/\r?\n/).length }, (r, l) => e[l] || "").join(`
`));
  o.push(...s.diagnostics);
  const u = /* @__PURE__ */ new Map();
  for (const [r, l] of n) {
    const a = Dt(l.map((c) => c.raw).join(`
`));
    u.set(r, a.layout), o.push(...a.diagnostics.map((c) => ({ ...c, line: l[c.line - 1]?.line || r })));
  }
  return { layout: s.layout, scopes: u, diagnostics: o };
}
function Dt(t) {
  const e = [], n = [];
  let i = !1, o = !1, s = 0;
  if (t.split(/\r?\n/).forEach((w, C) => {
    const _ = w.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(_)) {
      (o || i) && e.push({ severity: "error", line: C + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(_) || e.push({ severity: "error", line: C + 1, message: "Expected @layout begin v1." }), o = !0, i = !0, s = C + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(_)) {
      i || e.push({ severity: "error", line: C + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (_.startsWith("*") ? n.push(_.slice(1).trim()) : e.push({ severity: "error", line: C + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: s, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const u = n.join(" "), r = u.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], l = [], a = [], c = [], v = [];
  let b = 0, d = 0, g = 10;
  const m = () => r[b++], N = () => {
    const w = m();
    if (!w || !/^[A-Za-z_@][\w./%:@-]*$/.test(w)) throw Error("Expected layout identifier, got " + w);
    return w;
  };
  function y(w) {
    if (l.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const C = w ? N() : "@row" + d++, _ = m();
    if (!["row", "column", "classic"].includes(_)) throw Error("Expected row, column or classic.");
    if (m() !== "{") throw Error("Expected { after " + _);
    const I = { id: C, direction: _, members: [] };
    for (l.push(I); b < r.length && r[b] !== "}"; )
      r[b] === "group" ? (m(), I.members.push(y(!0))) : ["row", "column"].includes(r[b]) ? I.members.push(y(!1)) : I.members.push(N());
    if (m() !== "}") throw Error("Unclosed group " + C);
    if (!I.members.length) throw Error("Empty layout group " + C);
    return C;
  }
  try {
    for (; b < r.length; )
      if (r[b] === "group")
        m(), y(!0);
      else if (["row", "column"].includes(r[b])) y(!1);
      else if (r[b] === "face") {
        m();
        const E = N(), x = m();
        if (!["left", "right"].includes(x)) throw Error("Expected face left or right.");
        if (v.some((H) => H.device.toLowerCase() === E.toLowerCase())) throw Error("Duplicate face device.");
        v.push({ device: E, side: x });
      } else if (r[b] === "pair") {
        m();
        const E = m();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(E)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (m() !== "{") throw Error("Expected { after pair kind.");
        const x = [];
        for (; b < r.length && r[b] !== "}"; ) x.push(N());
        if (m() !== "}" || !x.length) throw Error("Empty or unclosed pair.");
        if (c.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        c.push({ kind: E, members: x });
      } else if (r[b] === "priority-cap") {
        if (m(), g = Number(m()), !Number.isInteger(g) || g < 3 || g > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (m() === "place") {
        const E = N(), x = m(), H = N();
        if (!["left-of", "above"].includes(x)) throw Error("Expected left-of or above.");
        a.push({ a: E, relation: x, b: H });
      } else throw Error("Unknown layout instruction near " + r[b - 1]);
    const w = /* @__PURE__ */ new Set();
    for (const E of l) {
      const x = E.id.toLowerCase();
      if (w.has(x)) throw Error("Duplicate layout group " + E.id);
      w.add(x);
    }
    const C = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set(), I = new Map(l.map((E) => [E.id.toLowerCase(), E])), S = (E) => {
      if (C.has(E)) throw Error("Circular layout group " + E);
      if (!_.has(E)) {
        C.add(E);
        for (const x of I.get(E).members) I.has(x.toLowerCase()) && S(x.toLowerCase());
        C.delete(E), _.add(E);
      }
    };
    for (const E of I.keys()) S(E);
    const M = /* @__PURE__ */ new Map();
    for (const E of a) {
      if (E.a.toLowerCase() === E.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      M.has(E.a.toLowerCase()) || M.set(E.a.toLowerCase(), []), M.get(E.a.toLowerCase()).push(E.b.toLowerCase());
    }
    C.clear(), _.clear();
    const B = (E) => {
      if (C.has(E)) throw Error("Circular place constraints.");
      if (!_.has(E)) {
        C.add(E);
        for (const x of M.get(E) || []) B(x);
        C.delete(E), _.add(E);
      }
    };
    for (const E of M.keys()) B(E);
  } catch (w) {
    e.push({ severity: "error", line: s, message: "Layout description: " + w.message });
  }
  return { layout: { version: 1, priorityCap: g, groups: l, relations: a, pairs: c, faces: v }, diagnostics: e };
}
function Un(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const d = new Set(n.groups.map((m) => m.id.toLowerCase())), g = (m) => d.has(m.toLowerCase()) ? m : e.components.find((y) => y.synthetic && y.value.toLowerCase() === m.toLowerCase())?.name || e.focus + "/" + m;
    i = { ...n, groups: n.groups.map((m) => ({ ...m, members: m.members.map(g) })), relations: n.relations.map((m) => ({ ...m, a: g(m.a), b: g(m.b) })), faces: (n.faces || []).map((m) => ({ ...m, device: g(m.device) })), pairs: (n.pairs || []).map((m) => ({ ...m, members: m.members.map(g) })) };
  }
  const o = new Map(i.groups.map((d) => [d.id.toLowerCase(), d])), s = Object.values(t.contexts).flatMap((d) => d.devices.map((g) => g.name)), u = new Set([...Object.keys(t.contexts), ...s, ...e.components.map((d) => d.name)].map((d) => d.toLowerCase()));
  for (const d of o.values()) if (u.has((n ? e.focus + "/" + d.id : d.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + d.id);
  for (const d of o.values()) for (const g of d.members) if (!o.has(g.toLowerCase()) && !u.has(g.toLowerCase())) throw Error("Unknown @layout instance/device: " + g);
  for (const d of i.relations) for (const g of [d.a, d.b]) if (!o.has(g.toLowerCase()) && !u.has(g.toLowerCase())) throw Error("Unknown @layout place target: " + g);
  const r = (i.pairs || []).map((d) => ({ ...d, members: d.members.map((g) => {
    const m = e.components.find((N) => N.name.toLowerCase() === g.toLowerCase());
    if (!m || m.synthetic || m.block) throw Error("Unknown or non-visible @layout pair device: " + g);
    return m.name;
  }) })), l = (i.faces || []).map((d) => {
    const g = e.components.find((m) => m.name.toLowerCase() === d.device.toLowerCase());
    if (!g || !["Q", "M", "J", "Z"].includes(g.kind)) throw Error("Unknown or unsupported @layout face device: " + d.device);
    return { ...d, device: g.name };
  }), a = /* @__PURE__ */ new Map(), c = [], v = new Set(Object.keys(t.contexts).map((d) => d.toLowerCase()));
  for (const d of i.groups) {
    const g = [];
    for (const m of d.members) {
      if (o.has(m.toLowerCase())) {
        g.push({ group: m });
        continue;
      }
      for (const N of e.components) if (N.name.toLowerCase() === m.toLowerCase() || N.name.toLowerCase().startsWith(m.toLowerCase() + "/")) {
        if (a.has(N.name)) throw Error("Overlapping @layout membership: " + N.name);
        a.set(N.name, d.id), g.push({ cell: N.name, ...v.has(m.toLowerCase()) ? { instance: m } : {} });
      }
    }
    c.push({ id: d.id, direction: d.direction, members: g });
  }
  const b = /* @__PURE__ */ new Set();
  for (const d of c) for (const g of d.members) if (g.group) {
    const m = g.group.toLowerCase();
    if (b.has(m)) throw Error("Layout group has multiple parents: " + g.group);
    b.add(m);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: c, relations: i.relations, pairs: r, faces: l };
}
const Qe = () => /* @__PURE__ */ Object.create(null), ve = (t) => t.toLowerCase();
function nn(t) {
  const e = Qe();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!o) throw Error("Expected named parameter assignment, got: " + i);
    const s = ve(o[1]);
    let u = o[2];
    if (u === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + s);
      u = r[1];
    }
    if (u || (u = t[++n]), !u || /^params?:$/i.test(u)) throw Error("Missing value for parameter " + s);
    if (Object.hasOwn(e, s)) throw Error("Duplicate parameter: " + s);
    e[s] = u;
  }
  return e;
}
function Ut(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, Qe()] : [t.slice(0, e), nn(t.slice(e))];
}
function Bt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Pn(t, e);
  t = n.source;
  const i = Dn(t), o = [...n.diagnostics, ...i.diagnostics], s = Qe(), u = /* @__PURE__ */ new Set(["0"]), r = (w, C, _) => o.push({ severity: w, line: C, message: _ }), l = (w, C, _, I = [], S = Qe(), M = 0) => {
    const B = { id: w, name: C, parent: _, ports: I, defaults: S, parameters: Qe(), definitions: Qe(), devices: [], instances: [], directives: [], line: M, statements: [], layoutDescription: i.scopes.get(M) || null };
    return s[w] = B, B;
  }, a = l("root", "Top", null), c = [a], v = [];
  let b = !1, d = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, C) => {
    const _ = w.trim();
    !_ || _.startsWith("*") || (_.startsWith("+") ? v.length ? v.at(-1).text += " " + _.slice(1).trim() : r("error", C + 1, "Continuation has no preceding statement.") : v.push({ text: _, line: C + 1 }));
  });
  for (const { text: w, line: C } of v)
    try {
      const _ = ct(w);
      if (!_.length) continue;
      const I = ve(_[0]), S = c.at(-1);
      if (d) {
        r("warning", C, "Statement after .end is not rendered: " + w);
        continue;
      }
      if (I === ".control") {
        b = !0, r("warning", C, ".control script retained but not executed or rendered.");
        continue;
      }
      if (I === ".endc") {
        b = !1;
        continue;
      }
      if (b) continue;
      if (I === ".subckt") {
        if (_.length < 2) throw Error(".SUBCKT requires a name.");
        const [M, B] = Ut(_.slice(2)), E = ve(_[1]);
        if (Object.hasOwn(S.definitions, E)) throw Error("Duplicate subcircuit definition: " + _[1]);
        const x = M.map(ve);
        if (new Set(x).size !== M.length || x.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (M.some((K) => /[{}()=]/.test(K))) throw Error("Invalid formal port.");
        if (c.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const H = S.id + "/" + encodeURIComponent(E);
        S.definitions[E] = H, c.push(l(H, _[1], S.id, M, B, C));
        continue;
      }
      if (I === ".ends") {
        if (c.length === 1) throw Error("Unmatched .ENDS.");
        if (_[1] && ve(_[1]) !== ve(S.name)) throw Error(".ENDS name does not match " + S.name);
        c.pop();
        continue;
      }
      if (I === ".end") {
        if (c.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        d = !0;
        continue;
      }
      if (I === ".param") {
        const M = nn(_.slice(1));
        for (const [B, E] of Object.entries(M)) {
          if (Object.hasOwn(S.parameters, B)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + B);
          S.parameters[B] = E;
        }
      }
      if (I === ".global") {
        if (_.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const M of _.slice(1)) u.add(ve(M));
      }
      if (I.startsWith(".") && S.directives.push({ line: C, text: w }), I.startsWith("x")) {
        const [M, B] = Ut(_.slice(1));
        if (!M.length) throw Error("X instance requires a subcircuit name.");
        const E = /;§pnba\s+(.+)$/i.exec(w)?.[1].split(")");
        S.instances.push({ name: _[0], nodes: M.slice(0, -1).map(ve), definitionName: M.at(-1), definitionId: null, parameters: B, line: C, raw: w, pinNames: E });
      } else S.statements.push({ line: C, text: w });
    } catch (_) {
      r("error", C, _.message + " Statement: " + w);
    }
  c.length > 1 && r("error", c.at(-1).line, "Unclosed .SUBCKT " + c.at(-1).name), b && r("error", 0, "Unclosed .control block.");
  function g(w, C) {
    for (; w; ) {
      if (Object.hasOwn(w.definitions, ve(C))) return w.definitions[ve(C)];
      w = s[w.parent];
    }
    return null;
  }
  for (const w of Object.values(s)) {
    const C = [...w.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...w.statements], _ = Rn(C.map((S) => S.text).join(`
`), { models: s[w.parent]?.models });
    w.devices = _.components.map((S) => ({ ...S, line: C[S.line - 1]?.line || w.line })), w.models = _.models, w === a && (a.title = _.title), o.push(..._.diagnostics.filter((S) => !S.message.includes("No supported components to render.") && !S.message.includes("300 components")).map((S) => ({ ...S, line: C[S.line - 1]?.line || w.line })));
    const I = new Set(w.devices.map((S) => ve(S.name)));
    for (const S of w.instances)
      if (I.has(ve(S.name)) && r("error", S.line, "Duplicate instance/device name: " + S.name), I.add(ve(S.name)), S.definitionId = g(w, S.definitionName), !S.definitionId && !/^\{[\s\S]*\}$/.test(S.definitionName)) r("error", S.line, "Undefined subcircuit: " + S.definitionName + " in " + S.name);
      else if (S.definitionId) {
        const M = s[S.definitionId];
        M.ports.length !== S.nodes.length && r("error", S.line, `${S.name}: ${M.name} expects ${M.ports.length} ports; got ${S.nodes.length}.`);
      }
  }
  for (const w of Object.values(s)) delete w.statements;
  const m = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set();
  function y(w, C = []) {
    if (m.has(w)) {
      r("error", s[w].line, "Circular subcircuit reference: " + [...C, s[w].name].join(" → "));
      return;
    }
    if (!N.has(w)) {
      if (m.add(w), C.length >= 64) {
        r("error", s[w].line, "Subcircuit dependency nesting exceeds 64 levels."), m.delete(w), N.add(w);
        return;
      }
      for (const _ of s[w].instances) _.definitionId && y(_.definitionId, [...C, s[w].name]);
      m.delete(w), N.add(w);
    }
  }
  for (const w of Object.keys(s)) y(w);
  !a.devices.length && !a.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const w of o) !w.source && w.line && n.origins[w.line - 1] && (w.source = n.origins[w.line - 1].file, w.line = n.origins[w.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: s, globals: [...u], diagnostics: o, layoutDescription: i.layout };
}
const he = () => /* @__PURE__ */ Object.create(null), Ge = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), dt = (t, e) => Ge(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Bn(t, e = []) {
  const n = he(), i = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((s) => decodeURIComponent(s)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [s, u] of Object.entries(o.terminals)) i(u).terminals.push({ component: o.name, pin: s });
  for (const o of e) i(o);
  return n;
}
function jn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const jt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Vn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function ut(t, e, n = (o) => o, i = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (u) => (o.push(u), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (u, r, l) => {
    const a = l.split(",").map((v) => v.trim());
    if (a.some((v) => !v || /[\s{}+*()]/.test(v))) throw Error("Unsupported dynamic voltage/current reference: " + u);
    const c = r.toUpperCase() + "(" + a.map((v) => r.toLowerCase() === "v" ? n(v) : i(v, r)).join(",") + ")";
    return o.push(c), "@@" + (o.length - 1) + "@@";
  });
  let s = t.length;
  return t = t.replace(Vn, (u, r, l) => {
    if (l.slice(r + u.length).trimStart().startsWith("(")) return u;
    const a = e(u.toLowerCase());
    if (a === void 0) return u;
    if (s += a.length + 2, s > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), t.replace(/@@(\d+)@@/g, (u, r) => o[Number(r)]);
}
function Gn(t, e, n, i) {
  const o = { ...e, ...n }, s = he(), u = /* @__PURE__ */ new Set(), r = he();
  for (const [a, c] of Object.entries(i)) r[a] = ut(jt(c), (v) => t[v]);
  function l(a) {
    if (Object.hasOwn(r, a)) return r[a];
    if (Object.hasOwn(s, a)) return s[a];
    if (!Object.hasOwn(o, a)) return t[a];
    if (u.has(a)) {
      if (Object.hasOwn(t, a)) return t[a];
      throw Error("Circular parameter dependency: " + [...u, a].join(" → "));
    }
    return u.add(a), s[a] = ut(jt(o[a]), l), u.delete(a), s[a];
  }
  for (const a of Object.keys(o)) l(a);
  return Object.assign(he(), t, s, r);
}
function _t(t, e, n, i) {
  let o = "";
  for (let l = 0; l < t.length; ) {
    const a = t[l];
    if (a !== "{" && a !== "'") {
      o += a, l++;
      continue;
    }
    const c = l++;
    let v = 1, b = "";
    for (; l < t.length && v; l++) {
      if (a === "'") {
        t[l] === "'" && (v = 0);
        continue;
      }
      if (b) {
        t[l] === b && (b = "");
        continue;
      }
      if (t[l] === '"' || t[l] === "'") {
        b = t[l];
        continue;
      }
      t[l] === "{" && v++, t[l] === "}" && v--;
    }
    if (v) throw Error("Unclosed parameter expression.");
    o += a + ut(t.slice(c + 1, l - 1), (d) => e[d], n, i) + (a === "{" ? "}" : "'");
  }
  const s = [];
  let u = 0, r = "";
  for (let l = 0; l < o.length; l++) {
    const a = o[l];
    if (r) {
      a === r && o[l - 1] !== "\\" && (r = "");
      continue;
    }
    if (a === '"' || a === "'") {
      r = a;
      continue;
    }
    if ("({".includes(a) && u++, ")}".includes(a) && u--, !u && (l === 0 || /\s/.test(o[l - 1]))) {
      const c = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(l));
      c && (s.push({ start: l, end: l + c[0].length, key: c[1].toLowerCase() }), l += c[0].length - 1);
    }
  }
  if (s.length) {
    let l = o.slice(0, s[0].start);
    s.forEach((a, c) => {
      const v = s[c + 1]?.start ?? o.length, b = o.slice(a.end, v);
      l += o.slice(a.start, a.end) + (b.includes("{") || ["refnode", "intnode"].includes(a.key) ? b : ut(b, (d) => e[d], n, i));
    }), o = l;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
}
class Qn {
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
class Fn {
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
class U {
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
    return "JavaScript Expression Parser (JSEP) v" + U.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return U.max_unop_len = Math.max(e.length, U.max_unop_len), U.unary_ops[e] = 1, U;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return U.max_binop_len = Math.max(e.length, U.max_binop_len), U.binary_ops[e] = n, i ? U.right_associative.add(e) : U.right_associative.delete(e), U;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return U.additional_identifier_chars.add(e), U;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return U.literals[e] = n, U;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete U.unary_ops[e], e.length === U.max_unop_len && (U.max_unop_len = U.getMaxKeyLen(U.unary_ops)), U;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return U.unary_ops = {}, U.max_unop_len = 0, U;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return U.additional_identifier_chars.delete(e), U;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete U.binary_ops[e], e.length === U.max_binop_len && (U.max_binop_len = U.getMaxKeyLen(U.binary_ops)), U.right_associative.delete(e), U;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return U.binary_ops = {}, U.max_binop_len = 0, U;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete U.literals[e], U;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return U.literals = {}, U;
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
    return new U(e).parse();
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
    return U.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !U.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    U.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return U.isIdentifierStart(e) || U.isDecimalDigit(e);
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
    if (U.hooks[e]) {
      const i = { context: this, node: n };
      return U.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (U.hooks[e]) {
      const n = { context: this };
      return U.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === U.SPACE_CODE || e === U.TAB_CODE || e === U.LF_CODE || e === U.CR_CODE; )
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
      type: U.COMPOUND,
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
      if (i = this.code, i === U.SEMCOL_CODE || i === U.COMMA_CODE)
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
    let e = this.expr.substr(this.index, U.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (U.binary_ops.hasOwnProperty(e) && (!U.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !U.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, o, s, u, r, l, a;
    if (u = this.gobbleToken(), !u || (n = this.gobbleBinaryOp(), !n))
      return u;
    for (s = { value: n, prec: U.binaryPrecedence(n), right_a: U.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), o = [u, s, r]; n = this.gobbleBinaryOp(); ) {
      if (i = U.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      s = { value: n, prec: i, right_a: U.right_associative.has(n) }, a = n;
      const c = (v) => s.right_a && v.right_a ? i > v.prec : i <= v.prec;
      for (; o.length > 2 && c(o[o.length - 2]); )
        r = o.pop(), n = o.pop().value, u = o.pop(), e = {
          type: U.BINARY_EXP,
          operator: n,
          left: u,
          right: r
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), o.push(s, e);
    }
    for (l = o.length - 1, e = o[l]; l > 1; )
      e = {
        type: U.BINARY_EXP,
        operator: o[l - 1].value,
        left: o[l - 2],
        right: e
      }, l -= 2;
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
    if (e = this.code, U.isDecimalDigit(e) || e === U.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === U.SQUOTE_CODE || e === U.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === U.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, U.max_unop_len), i = n.length; i > 0; ) {
        if (U.unary_ops.hasOwnProperty(n) && (!U.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !U.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const s = this.gobbleToken();
          return s || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: U.UNARY_EXP,
            operator: n,
            argument: s,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      U.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), U.literals.hasOwnProperty(o.name) ? o = {
        type: U.LITERAL,
        value: U.literals[o.name],
        raw: o.name
      } : o.name === U.this_str && (o = { type: U.THIS_EXP })) : e === U.OPAREN_CODE && (o = this.gobbleGroup());
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
    for (; n === U.PERIOD_CODE || n === U.OBRACK_CODE || n === U.OPAREN_CODE || n === U.QUMARK_CODE; ) {
      let i;
      if (n === U.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== U.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === U.OBRACK_CODE ? (e = {
        type: U.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== U.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === U.OPAREN_CODE ? e = {
        type: U.CALL_EXP,
        arguments: this.gobbleArguments(U.CPAREN_CODE),
        callee: e
      } : (n === U.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: U.MEMBER_EXP,
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
    for (; U.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === U.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); U.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); U.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      U.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, U.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === U.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === U.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: U.LITERAL,
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
      let s = this.expr.charAt(this.index++);
      if (s === i) {
        o = !0;
        break;
      } else if (s === "\\")
        switch (s = this.expr.charAt(this.index++), s) {
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
            e += s;
        }
      else
        e += s;
    }
    return o || this.throwError('Unclosed quote after "' + e + '"'), {
      type: U.LITERAL,
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
    for (U.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, U.isIdentifierPart(e)); )
      this.index++;
    return {
      type: U.IDENTIFIER,
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
      let s = this.code;
      if (s === e) {
        i = !0, this.index++, e === U.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (s === U.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === U.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === U.CBRACK_CODE)
            for (let u = n.length; u < o; u++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const u = this.gobbleExpression();
        (!u || u.type === U.COMPOUND) && this.throwError("Expected comma"), n.push(u);
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
    let e = this.gobbleExpressions(U.CPAREN_CODE);
    if (this.code === U.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: U.SEQUENCE_EXP,
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
      type: U.ARRAY_EXP,
      elements: this.gobbleArguments(U.CBRACK_CODE)
    };
  }
}
const Hn = new Qn();
Object.assign(U, {
  hooks: Hn,
  plugins: new Fn(U),
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
U.max_unop_len = U.getMaxKeyLen(U.unary_ops);
U.max_binop_len = U.getMaxKeyLen(U.binary_ops);
const He = (t) => new U(t).parse(), Wn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(U).filter((t) => !Wn.includes(t) && He[t] === void 0).forEach((t) => {
  He[t] = U[t];
});
He.Jsep = U;
const zn = "ConditionalExpression";
var qn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: zn,
            test: i,
            consequent: o,
            alternate: s
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
He.plugins.register(qn);
const Xn = "ConditionalExpression";
var $n = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: Xn,
            test: i,
            consequent: o,
            alternate: s
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
He.plugins.register($n);
const Kn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Vt = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, xe = (t) => Number(t) > 0.5;
function et(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function o(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (l) => {
      if (l[0] === '"' || l[0] === "'") return l;
      const [, a, c, v] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(l), b = c.toLowerCase(), d = b.startsWith("meg") ? 1e6 : b.startsWith("mil") ? 254e-7 : Kn[b[0]] || 1;
      return "(" + (v ? +(a + (a.includes(".") ? "" : ".") + v) : Number(a)) * d + ")";
    }), s(He(r));
  }
  function s(r) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (r.type === "Literal") return r.value;
    if (r.type === "Identifier") {
      const l = r.name.toLowerCase();
      if (l === "pi") return Math.PI;
      if (l === "e") return Math.E;
      if (!Object.hasOwn(e, l)) throw Error("Undefined structural parameter: " + r.name);
      if (n.has(l)) throw Error("Circular structural parameter: " + l);
      n.add(l);
      const a = o(e[l]);
      return n.delete(l), a;
    }
    if (r.type === "ConditionalExpression") return xe(s(r.test)) ? s(r.consequent) : s(r.alternate);
    if (r.type === "UnaryExpression") {
      const l = s(r.argument);
      if (r.operator === "-") return -l;
      if (r.operator === "+") return +l;
      if (r.operator === "!" || r.operator === "~") return !xe(l);
    }
    if (r.type === "BinaryExpression") {
      const l = s(r.left);
      if (r.operator === "&&") return xe(l) && xe(s(r.right));
      if (r.operator === "||") return xe(l) || xe(s(r.right));
      const a = s(r.right);
      switch (r.operator) {
        case "+":
          return l + a;
        case "-":
          return l - a;
        case "*":
          return l * a;
        case "/":
          return l / a;
        case "**":
          return l ** a;
        case "%":
          return l % a;
        case "^":
          return xe(l) !== xe(a);
        case "&":
          return xe(l) && xe(a);
        case "|":
          return xe(l) || xe(a);
        case ">":
          return l > a;
        case "<":
          return l < a;
        case ">=":
          return l >= a;
        case "<=":
          return l <= a;
        case "==":
        case "===":
          return l === a;
        case "!=":
        case "!==":
          return l !== a;
      }
    }
    if (r.type === "CallExpression" && r.callee.type === "Identifier") {
      const l = r.callee.name.toLowerCase();
      if (l === "if") {
        if (r.arguments.length !== 3) throw Error("if() needs three arguments.");
        return xe(s(r.arguments[0])) ? s(r.arguments[1]) : s(r.arguments[2]);
      }
      if (Object.hasOwn(Vt, l)) return Vt[l](...r.arguments.map(s));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const u = o(t);
  if (typeof u == "number" && !Number.isFinite(u)) throw Error("Structural expression is not finite.");
  return u;
}
function ft(t, { isolate: e = "" } = {}) {
  jn(t);
  const n = he(), i = /* @__PURE__ */ new Map();
  let o = 0, s = 0;
  function u(r, l, a, c, v, b, d) {
    if (l.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const g = t.scopes[r], m = l.length ? Ge(l.slice(0, -1), l.at(-1)) : "", N = he();
    if (e && m === e && (a = he()), d.some((S) => S.scopeId === r)) throw Error("Circular subcircuit reference at " + m);
    const y = Gn(c, g.defaults, g.parameters, v);
    function w(S) {
      if (/^\{[\s\S]*\}$/.test(S)) {
        const B = et(S, y);
        S = String(typeof B == "boolean" ? Number(B) : B);
      }
      /^"[\s\S]*"$/.test(S) && (S = S.slice(1, -1));
      const M = S.toLowerCase();
      return Object.hasOwn(a, M) ? a[M] : t.globals.includes(M) ? dt([], M) : N[M] || (N[M] = dt(l, M));
    }
    const C = { id: m, path: l, scopeId: r, name: b?.name || "Top", definition: g.name, ports: g.ports.map((S) => ({ name: S, node: w(S) })), params: y, nodes: N, models: he(), devices: [], children: [], raw: b?.raw || "", line: b?.line || 0 };
    n[m] = C, i.set(m, w);
    const _ = [...d, C];
    function I(S) {
      if (!S) return "";
      let M = g;
      for (; M; ) {
        if (M.directives.some((B) => new RegExp("^\\.model\\s+" + S.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(B.text))) {
          const B = [..._].reverse().find((E) => E.scopeId === M.id);
          return Ge(B?.path || [], S.toLowerCase());
        }
        M = t.scopes[M.parent];
      }
      return S;
    }
    for (const S of g.directives.filter((M) => /^\.model\b/i.test(M.text))) {
      const M = /^\.model\s+(\S+)/i.exec(S.text)?.[1];
      if (!M) continue;
      const B = I(M), E = g.models[M.toLowerCase()], x = _t(S.text, y, w, (H) => Ge(l, H));
      C.models[B] = { ...E, name: B, raw: x.replace(/^(\.model\s+)\S+/i, (H, K) => K + B), instanceId: m, parameters: y };
    }
    for (const S of g.devices) {
      if (++s > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const M = he();
      for (const [E, x] of Object.entries(S.terminals)) M[E] = w(x);
      const B = I(S.model);
      C.devices.push({ ...S, name: Ge(l, S.name), localName: S.name, instanceId: m, terminals: M, model: B, parameters: y });
    }
    for (const S of g.instances) {
      let M = S.definitionId;
      if (!M) {
        const H = String(et(S.definitionName, y)).toLowerCase();
        let K = g;
        for (; K && !M; )
          M = K.definitions[H], K = t.scopes[K.parent];
        if (!M) throw Error("Undefined selected subcircuit: " + H);
      }
      const B = t.scopes[M], E = he();
      if (B.ports.length !== S.nodes.length) throw Error(S.name + ": expected " + B.ports.length + " ports; got " + S.nodes.length);
      B.ports.forEach((H, K) => {
        E[H.toLowerCase()] = w(S.nodes[K]);
      });
      const x = u(M, [...l, S.name], E, y, S.parameters, S, _);
      S.pinNames?.length === x.ports.length && x.ports.forEach((H, K) => {
        H.label = S.pinNames[K];
      }), C.children.push(x);
    }
    return C;
  }
  try {
    let v = function(b, d) {
      const g = d.split(":");
      if (g.length === 1) return { owner: b, name: d };
      const m = g.pop();
      for (const N of [[...b.path, ...g], g]) {
        const y = l.get(N.map(encodeURIComponent).join("/").toLowerCase());
        if (y) return { owner: y, name: m };
      }
      throw Error("Unknown hierarchical reference: " + d);
    };
    const r = u(t.rootId, [], he(), he(), he(), null, []), l = new Map(Object.values(n).map((b) => [b.id.toLowerCase(), b])), a = Object.assign(he(), ...Object.values(n).map((b) => b.models)), c = (b) => a[b] || Object.entries(a).find(([d]) => d.startsWith(b + "."))?.[1];
    for (const b of Object.values(n)) for (const d of b.devices) {
      const g = t.scopes[b.scopeId].devices.find((y) => y.name === d.localName), m = (y) => {
        const w = v(b, y);
        return i.get(w.owner.id)(w.name);
      }, N = (y, w = "", C = "") => {
        const _ = v(b, y), I = _.owner.devices.find((S) => S.localName.toLowerCase() === _.name.toLowerCase());
        if (w.toLowerCase() === "ix") {
          const S = _.owner.ports.find((M, B) => M.name.toLowerCase() === _.name.toLowerCase() || String(B + 1) === _.name);
          if (S) return _.owner.id + ":" + S.name;
        }
        if (!I) {
          if (C) throw Error(d.name + ": referenced " + C + " device " + y + " was not found.");
          return Ge(_.owner.path, _.name);
        }
        if (C && I.kind !== C) throw Error(d.name + ": " + y + " must be a " + C + " device.");
        return I.name;
      };
      if (d.value = _t(g.value, b.params, m, N), g.model && (d.value = d.value.replace(g.model, d.model)), d.kind === "M" && Object.keys(d.terminals).length === 3) {
        let y = c(d.model), w = !1;
        const C = /* @__PURE__ */ new Set();
        for (; y?.type === "VDMOS" && !C.has(y.name); ) {
          C.add(y.name);
          const _ = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(y.raw);
          if (_) {
            w = _[1] === void 0 || Number(et(_[1], y.parameters)) >= 0.5;
            break;
          }
          const I = y.name.includes("/") ? y.name.slice(0, y.name.lastIndexOf("/") + 1) : "";
          y = c(I + (y.baseModel || "").toLowerCase()) || c((y.baseModel || "").toLowerCase());
        }
        C.size && (d.type = "spice_" + (w ? "pmos3" : "nmos3"));
      }
      d.controlSources = (g.controlSources || []).map((y) => N(y, "", "V")), d.controlSource = d.controlSources[0] || "", d.coupledInductors = (g.coupledInductors || []).map((y) => N(y, "", "L"));
      for (const y of /* @__PURE__ */ new Set([...g.controlSources || [], ...g.coupledInductors || []])) {
        const w = y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        d.value = d.value.replace(new RegExp("(?<![\\w./%])" + w + "(?![\\w.$])", "g"), () => N(y));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: r, contexts: n };
  } catch (r) {
    throw r.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: r.message }], r;
  }
}
function Fe(t) {
  return [...t.devices, ...t.children.flatMap(Fe)];
}
function qe(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Tt(t, e = {}) {
  const n = new Map(t.components.map((E) => [E.name, E])), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = [], u = (E, x) => JSON.stringify([E, x].sort()), r = (E) => e[E]?.potential !== null && e[E]?.potential !== void 0;
  for (const E of t.components) {
    for (const [L, G] of Object.entries(E.terminals))
      i.has(G) || i.set(G, []), i.get(G).push({ device: E.name, pin: L });
    if (E.kind === "R") {
      const L = Object.values(E.terminals);
      if (L.length === 2 && L[0] !== L[1]) {
        const G = u(...L);
        o.has(G) || o.set(G, []), o.get(G).push(E);
      }
    }
    const x = E.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(E.kind) ? "fet" : null, H = x === "bjt" ? /_(npn|pnp)$/.exec(E.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(E.type)?.[1];
    if (!x || !H) continue;
    const K = E.terminals, $ = K[x === "bjt" ? "B" : "G"], te = K[x === "bjt" ? "C" : "D"], re = K[x === "bjt" ? "E" : "S"];
    [$, te, re].some((L) => L === void 0) || $ === re || te === re || s.push({ id: E.name, family: x, polarity: H, control: $, drain: te, source: re, body: E.kind === "M" ? K.B : void 0 });
  }
  const l = [], a = /* @__PURE__ */ new Set(), c = (E, x, H, K, $, te = "basic", re = [], L = "high") => {
    const G = [.../* @__PURE__ */ new Set([...x, ...re])], ee = JSON.stringify([E, te, [...G].sort()]);
    a.has(ee) || (a.add(ee), l.push({ id: "motif" + l.length, kind: E, variant: te, transistors: x, members: G, roles: H, nets: K, evidence: $, confidence: L }));
  }, v = (E, x) => E.family === x.family && E.polarity === x.polarity, b = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), m = new Map(s.map((E) => [E.id, E])), N = (E, x, H) => {
    E.has(x) || E.set(x, []), E.get(x).push(H);
  }, y = (E, x) => JSON.stringify([E.family, E.polarity, x]);
  for (const E of s)
    N(b, y(E, E.control), E), N(d, y(E, E.source), E), E.family === "bjt" && (i.get(E.source) || []).some((x) => {
      const H = m.get(x.device);
      return H && H.family === "bjt" && !v(E, H) && H.source === E.source;
    }) && N(g, y(E, E.drain), E);
  const w = (E) => [{ node: E.source, resistor: null }, ...(i.get(E.source) || []).flatMap((x) => {
    const H = n.get(x.device);
    if (H.kind !== "R") return [];
    const K = Object.values(H.terminals).find(($) => $ !== E.source);
    return K !== void 0 && K !== E.control && K !== E.drain ? [{ node: K, resistor: H.name }] : [];
  })];
  for (const E of s) E.control === E.drain && c("diode-connected", [E.id], { reference: E.id }, { control: E.control, return: E.source }, ["control-drain-short", E.family]);
  for (const E of s) {
    const x = b.get(y(E, E.control));
    if (x.filter((L) => L.control === L.drain).length > 1) continue;
    let H = null;
    if (E.control !== E.drain && E.family === "bjt" && (H = (b.get(y(E, E.drain)) || []).find((L) => L.id !== E.id && v(L, E) && L.control === E.drain && L.source === E.control && r(L.drain))), E.control !== E.drain && !H) continue;
    const K = w(E), $ = [];
    let te = null, re = [];
    for (const L of x) {
      if (L.id === E.id || L.id === H?.id || L.drain === E.drain || L.drain === L.control) continue;
      const G = K.flatMap((ee) => w(L).filter((z) => ee.node === z.node).map((z) => ({ node: ee.node, rs: [ee.resistor, z.resistor].filter(Boolean) }))).find((ee) => te === null || ee.node === te);
      G && (te = G.node, $.push(L.id), re.push(...G.rs));
    }
    if ($.length) {
      const L = $.every((G) => m.get(G).body === E.body);
      c("current-mirror", [E.id, ...$, ...H ? [H.id] : []], { reference: E.id, outputs: $, ...H ? { helper: H.id } : {} }, { control: E.control, return: te }, ["same-polarity", "shared-control", H ? "emitter-follower-reference" : "diode-reference", re.length ? "resistive-common-return" : "shared-return", L ? "compatible-bodies" : "different-body-connections"], H ? "assisted" : re.length ? "degenerated" : "basic", [...re, ...H ? [H.id] : []], L ? "high" : "medium");
    }
  }
  const C = [], _ = /* @__PURE__ */ new Set(), I = (E, x) => {
    const H = JSON.stringify([E.id, x.id].sort());
    _.has(H) || (_.add(H), C.push([E, x]));
  };
  for (const E of d.values()) if (!r(E[0].source)) {
    const x = E.filter((H) => H.control !== H.drain);
    x.length === 2 ? I(...x) : x.length > 2 && new Set(x.map((H) => H.control)).size > 1 && c("differential-pair", x.map((H) => H.id), { inputs: x.map((H) => H.id) }, { tail: x[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const E of g.values()) for (let x = 0; x < E.length; x++) for (let H = x + 1; H < E.length; H++) I(E[x], E[H]);
  for (const [E, x] of C) {
    if (E.control === x.control || E.control === E.drain || x.control === x.drain) continue;
    if (E.source === x.source && E.drain !== x.drain && !r(E.source)) {
      const $ = (i.get(E.source) || []).some((re) => re.device !== E.id && re.device !== x.id), te = d.get(y(E, E.source)).length === 2;
      c("differential-pair", [E.id, x.id], { inputs: [E.id, x.id] }, { tail: E.source }, ["same-polarity", "distinct-controls", "shared-tail", $ ? "tail-bias-connection" : "unbiased-tail", te ? "two-input-tail" : "multi-input-tail"], "basic", [], $ && te && E.body === x.body ? "high" : "medium");
    }
    if (E.family !== "bjt" || E.drain !== x.drain || E.source === x.source) continue;
    const H = s.filter(($) => $.family === "bjt" && $.polarity !== E.polarity && $.source === E.source), K = s.filter(($) => $.family === "bjt" && $.polarity !== E.polarity && $.source === x.source);
    for (const $ of H) for (const te of K) $.id !== te.id && $.control === te.control && $.drain !== te.drain && $.control !== $.drain && te.control !== te.drain && c("differential-pair", [E.id, x.id, $.id, te.id], { inputs: [E.id, x.id], commonBase: [$.id, te.id] }, { inputCollectors: E.drain, bias: $.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const E of s) if (E.family === "bjt" && E.control !== E.drain) {
    const x = o.get(u(E.drain, E.control)) || [], H = o.get(u(E.control, E.source)) || [];
    x.length === 1 && H.length === 1 && c("vbe-multiplier", [E.id], { transistor: E.id, collectorResistor: x[0].name, emitterResistor: H[0].name }, { control: E.control, collector: E.drain, emitter: E.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [x[0].name, H[0].name]);
  }
  const S = s.filter((E) => E.family === "bjt"), M = /* @__PURE__ */ new Map();
  for (const E of S) N(M, E.control, E);
  const B = (E) => (i.get(E) || []).filter((x) => m.has(x.device));
  for (const E of S) if (E.control !== E.drain) {
    for (const x of M.get(E.source) || []) if (x.id !== E.id && v(E, x) && x.drain === E.control && x.source !== E.drain) {
      const H = o.get(u(E.source, x.source)) || [];
      H.length === 1 && c("current-limit-pair", [E.id, x.id], { driver: E.id, output: x.id, senseResistor: H[0].name }, { sense: E.source, drive: E.control, output: x.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [H[0].name]);
    }
    for (const x of M.get(E.source) || []) x.id !== E.id && v(E, x) && x.control !== x.drain && E.drain === x.drain && x.source !== E.control && c("darlington-pair", [E.id, x.id], { driver: E.id, output: x.id }, { link: E.source, collector: E.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (M.get(E.source) || []).length === 1 ? "high" : "medium");
    for (const x of M.get(E.drain) || []) x.id !== E.id && !v(E, x) && x.control !== x.drain && E.source === x.drain && x.source !== E.control && B(E.drain).length === 2 && c("sziklai-pair", [E.id, x.id], { driver: E.id, output: x.id }, { link: E.drain, feedback: E.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const x of i.get(E.drain) || []) {
      const H = m.get(x.device);
      !H || H.family !== "bjt" || H.id === E.id || !v(E, H) || H.source !== E.drain || r(E.drain) || H.control === E.control || H.control === H.drain || H.drain === E.source || B(E.drain).length !== 2 || c("cascode-pair", [E.id, H.id], { driver: E.id, output: H.id }, { link: E.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const E of S.filter((x) => x.polarity === "npn" && r(x.drain))) for (const x of S.filter((H) => H.polarity === "pnp" && r(H.drain))) {
    if (e[E.drain].potential <= e[x.drain].potential) continue;
    const H = w(E).flatMap((K) => w(x).filter(($) => K.node === $.node && !r(K.node)).map(($) => ({ node: K.node, rs: [K.resistor, $.resistor].filter(Boolean) })))[0];
    H && c("push-pull-pair", [E.id, x.id], { upper: E.id, lower: x.id }, { output: H.node }, ["complementary-polarity", "ordered-collector-supplies", H.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", H.rs);
  }
  return l;
}
function Mt(t, e, n = (i) => i) {
  const i = (o) => Array.isArray(o) ? o.map(e) : e(o);
  return t.map((o) => ({ ...o, members: o.members.map(e), transistors: o.transistors.map(e), roles: Object.fromEntries(Object.entries(o.roles).map(([s, u]) => [s, i(u)])), nets: Object.fromEntries(Object.entries(o.nets).map(([s, u]) => [s, n(u)])) }));
}
function Yn(t, e, n) {
  const i = [], o = /* @__PURE__ */ new Set(), s = new Map(t.components.map((u) => [u.name, u]));
  for (const u of n) {
    if (new Set(u.members).size !== u.members.length) throw Error("Duplicate @layout pair member.");
    const r = u.members.map((b) => s.get(b));
    if (r.some((b) => !b)) throw Error("Unknown @layout pair device.");
    const l = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[u.kind], a = u.kind === "differential" && r.length === 2 ? t.components.filter((b) => !u.members.includes(b.name) && Object.values(b.terminals).includes(r[0].terminals.E ?? r[0].terminals.S)) : [], c = Tt({ ...t, components: [...r, ...a] }, e), v = c.find((b) => b.kind === l && b.confidence === "high" && u.members.every((d) => b.members.includes(d)));
    if (!v) throw Error("Invalid @layout pair " + u.kind + " { " + u.members.join(" ") + " }: electrical structure does not match.");
    for (const b of c.filter((d) => d === v || d.kind === "diode-connected" && d.members.every((g) => v.members.includes(g)))) {
      const d = JSON.stringify([b.kind, [...b.members].sort()]);
      o.has(d) || (o.add(d), i.push({ ...b, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function Zn(t, e, n = Tt(t, e)) {
  const i = /* @__PURE__ */ new Map(), o = t.components.filter((b) => b.kind === "R"), s = t.components.filter((b) => b.kind === "Q"), u = new Map(t.components.map((b) => [b.name, b])), r = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), a = (b) => Object.values(b.terminals), c = (b, d, g) => {
    b && i.set(b.name, { reverse: a(b)[0] !== d, reason: g });
  };
  for (const b of s) {
    const { C: d, B: g, E: m } = b.terminals, N = b.type.endsWith("pnp"), y = b.type.endsWith("npn");
    !N && !y || (r.has(m) || r.set(m, []), r.get(m).push(b), d === g && e[m]?.potential !== null && e[m]?.potential !== void 0 && l.set(d, { potential: e[m].potential }));
  }
  for (const b of n) if (b.kind === "vbe-multiplier" && b.confidence === "high") {
    const d = u.get(b.roles.transistor), g = d.type.endsWith("pnp"), m = u.get(g ? b.roles.emitterResistor : b.roles.collectorResistor), N = u.get(g ? b.roles.collectorResistor : b.roles.emitterResistor);
    c(m, d.terminals[g ? "E" : "C"], "recognized VBE multiplier"), c(N, d.terminals.B, "recognized VBE multiplier");
  }
  for (const b of o) {
    const [d, g] = a(b), m = l.get(d), N = l.get(g);
    m && N && m.potential !== N.potential && c(b, m.potential > N.potential ? d : g, "diode-connected bias reference");
  }
  const v = /* @__PURE__ */ new Map();
  for (const b of o) {
    const d = a(b);
    if (!d.some((g) => e[g]?.potential !== null && e[g]?.potential !== void 0))
      for (const g of d)
        v.has(g) || v.set(g, []), v.get(g).push(b);
  }
  for (const [b, d] of v)
    if (!(d.length > 12))
      for (const g of d) for (const m of d) {
        if (g === m) continue;
        const N = a(g).find((_) => _ !== b), y = a(m).find((_) => _ !== b), w = r.get(N)?.find((_) => _.type.endsWith("npn")), C = r.get(y)?.find((_) => _.type.endsWith("pnp"));
        w && C && (c(g, N, "complementary emitter output"), c(m, b, "complementary emitter output"));
      }
  return i;
}
function Jn(t) {
  const e = t.components.filter((s) => s.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((s) => s.kind === "R").map((s) => Object.values(s.terminals).sort().join("|"))), o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const u = s.terminals.E;
    n.has(u) || n.set(u, []), n.get(u).push(s);
  }
  for (const s of e) {
    const { B: u, C: r, E: l } = s.terminals;
    if (u === l || !i.has([u, l].sort().join("|"))) continue;
    const a = n.get(u) || [];
    if (!(a.length > 16))
      for (const c of a) {
        if (c === s) continue;
        if (c.terminals.B === r) {
          o.add(s.name);
          break;
        }
        const v = n.get(c.terminals.B) || [];
        if (v.length <= 16 && v.some((b) => b !== s && b !== c && b.terminals.B === r)) {
          o.add(s.name);
          break;
        }
      }
  }
  return o;
}
const tt = 22;
function Ct(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const rt = (t) => ["pwr", "ret", "bias"].includes(t), eo = (t) => String(t).split("/").at(-1).toLowerCase(), on = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[eo(t)] || "unknown", Gt = (t) => {
  const e = Ct(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || on(t);
};
function to(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (u, r, l) => {
    e.has(u) || e.set(u, []), e.get(u).push({ node: r, delta: l });
  };
  for (const u of t)
    if (u.kind === "V")
      try {
        let r = u.value.trim();
        const l = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (l && Number(et(l[1], u.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!a) continue;
        const c = et(a[1], u.parameters);
        if (typeof c != "number" || !Number.isFinite(c)) continue;
        i(u.terminals["-"], u.terminals["+"], c), i(u.terminals["+"], u.terminals["-"], -c);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ new Set();
  for (const u of ["0", ...e.keys()]) {
    if (s.has(u)) continue;
    const r = /* @__PURE__ */ new Map([[u, 0]]), l = [u];
    s.add(u);
    let a = !1;
    for (let c = 0; c < l.length; c++) for (const v of e.get(l[c]) || []) {
      const b = r.get(l[c]) + v.delta;
      r.has(v.node) ? Math.abs(r.get(v.node) - b) > 1e-8 * Math.max(1, Math.abs(b)) && (a = !0) : (r.set(v.node, b), s.add(v.node), l.push(v.node));
    }
    a && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [c, v] of r) o[c] = { value: v, reference: u, known: u === "0" && !a, consistent: !a };
  }
  return { nodes: o, diagnostics: n };
}
function no(t, e, n = null) {
  const i = to(Fe(e.localScope ? t.contexts[e.focus] : t.root)), o = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  for (const c of Object.values(e.nodes)) {
    const v = Ct(c.name), b = on(c.name);
    o[c.name] = { role: v !== "unknown" ? v : b, roleSource: v !== "unknown" ? "node-name" : b !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[c.name]?.known ? i.nodes[c.name].value : null };
  }
  if (e.localScope) for (const c of e.interfaceBindings) {
    const v = o[c.local], b = Gt(c.port);
    v && v.potential === null && ["pwr", "ret"].includes(b) && (v.potential = b === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(c.port) ? 0 : -1, v.potentialSource = "symbolic-port-order");
  }
  const u = n?.pairs?.length ? Yn(e, o, n.pairs) : Tt(e, o), r = Zn(e, o, u), l = Jn(e), a = (c, v, b) => {
    const d = { role: o[b].role, roleSource: o[b].roleSource }, g = c.block?.ports.find((y) => y.pin === v);
    if (g?.implicit || !c.block && !c.synthetic) return d;
    const m = c.synthetic ? c.value : g?.name || g?.label, N = Gt(m);
    return N !== "unknown" ? { role: N, roleSource: Ct(m) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : rt(d.role) ? { ...d, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const c of e.components) {
    const v = Object.fromEntries(Object.entries(c.terminals).map(([B, E]) => [B, { ...o[E], ...a(c, B, E) }])), b = Object.values(v), d = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(c.type), g = d && !r.has(c.name) && b.length === 2 && b.every((B) => !rt(B.role) && (B.potential === null || B.role !== "unknown")), m = c.terminals["+"], N = c.terminals["-"], y = [m, N].filter((B) => B && B !== "0"), w = c.kind === "V" && y.some((B) => rt(o[B]?.role)) && !y.some((B) => ["in", "out", "io", "fb"].includes(o[B]?.role)) && [m, N].every((B) => i.nodes[B]?.known), C = m === "0" ? N : m, _ = Object.keys(c.terminals), I = (B) => rt(B.role) ? B.potential !== null ? B.potential > 0 ? "high" : "low" : B.role === "ret" ? "low" : "high" : "signal";
    let S = !1;
    _.length === 2 && (c.kind === "V" && b.every((B) => B.potential !== null) ? S = b[0].potential < b[1].potential : c.terminals[_[0]] === "0" ? S = !0 : c.terminals[_[1]] === "0" ? S = !1 : b.every((B) => B.potential !== null) ? S = b[0].potential < b[1].potential : S = I(b[0]) === "low" || I(b[1]) === "high" && I(b[0]) === "signal"), r.has(c.name) && (S = r.get(c.name).reverse);
    const M = c.synthetic ? "" : c.name.startsWith(e.focus + "/") ? c.name.slice(e.focus.length + 1) : c.name;
    s[c.name] = { version: tt, kind: c.kind, polarity: c.type.endsWith("pnp") ? "p" : c.type.endsWith("npn") ? "n" : null, currentLimiter: l.has(c.name), orientationReason: r.get(c.name)?.reason || null, owner: M.includes("/") ? M.slice(0, M.lastIndexOf("/")) : "", passive: d, source: ["V", "I", "E", "F", "G", "H"].includes(c.kind) || c.kind === "B" && !d, ports: v, horizontal: g, orientation: g ? "horizontal" : S ? "vertical-reversed" : "vertical", flexible: _.length === 2 && (d || ["V", "I", "B", "F", "H"].includes(c.kind)), supply: !!w, voltage: w ? i.nodes[C].value : null };
  }
  return { version: tt, nodes: o, cells: s, motifs: u, diagnostics: i.diagnostics };
}
function rn(t, e) {
  const n = e.ports.map((o, s) => ({ pin: "P" + s, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), i = new Set(Fe(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const s = dt([], o);
    i.has(s) && !n.some((u) => u.node === s) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: s, implicit: !0 });
  }
  return n;
}
function $e(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const o = t, s = t.contexts[i];
  if (!s) throw Error("Unknown instance: " + i);
  i && (t = ft(t.ir, { isolate: i }));
  const u = t.contexts[i];
  if (!u) throw Error("Unknown instance: " + i);
  const r = [], l = [];
  function a(g) {
    l.push(...Object.values(g.nodes), ...g.ports.map((N) => N.node));
    const m = [...g.devices.map((N) => ({ line: N.line, device: N })), ...g.children.map((N) => ({ line: N.line, child: N }))].sort((N, y) => N.line - y.line);
    for (const N of m) {
      if (N.device) {
        const _ = N.device;
        r.push({ ..._, layoutLabel: [...g.path.slice(u.path.length), _.localName].join("/") });
        continue;
      }
      const y = N.child;
      if (e === "flat" || n.has(y.id)) {
        a(y);
        continue;
      }
      const w = rn(t, y), C = he();
      w.forEach((_) => {
        C[_.pin] = _.node;
      }), r.push({ name: y.id, kind: "X", type: "spice_subckt", terminals: C, value: y.definition, raw: y.raw, line: y.line, instanceId: y.id, layoutLabel: y.path.slice(u.path.length).join("/"), block: { definitionId: y.scopeId, ports: w, parameters: y.params } });
    }
  }
  a(u);
  for (const [g, m] of u.ports.entries()) r.push({ name: "@port/" + i + "/" + g, kind: "PORT", type: "spice_port", terminals: { A: m.node }, layoutLabel: m.name, value: m.name, raw: "Interface port " + m.name, synthetic: !0 });
  if (r.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(he(), ...Object.values(t.contexts).map((g) => g.models)), v = { title: i || t.ir.title, components: r, nodes: Bn(r, l), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  v.interfaceBindings = u.ports.map((g, m) => ({ port: g.name, local: g.node, parent: s.ports[m].node }));
  const b = /* @__PURE__ */ new Map();
  for (const g of s.ports)
    b.has(g.node) || b.set(g.node, []), b.get(g.node).push(g.name);
  v.interfaceAliases = [...b].filter(([, g]) => g.length > 1).map(([g, m]) => ({ node: g, ports: m })), v.topology = oo(o, v);
  const d = Un(t, v);
  return v.layout = no(t, v, d), v.layout.description = d, v;
}
function oo(t, e) {
  const n = Fe(t.contexts[e.focus]);
  e.localScope && (t = ft(t.ir, { isolate: e.focus }));
  const i = [], o = /* @__PURE__ */ new Set();
  for (const r of e.components)
    if (!r.synthetic)
      if (r.kind === "X") {
        const l = t.contexts[r.instanceId];
        if (!l) throw Error("Projection contains an unknown block.");
        const a = rn(t, l);
        if (JSON.stringify(Object.entries(r.terminals)) !== JSON.stringify(a.map((c) => [c.pin, c.node]))) throw Error("Block interface topology mismatch: " + r.name);
        i.push(...Fe(l));
      } else i.push(r);
  for (const r of i) {
    if (o.has(r.name)) throw Error("Projection duplicates " + r.name);
    o.add(r.name);
  }
  const s = qe(i), u = Fe(t.contexts[e.focus]);
  if (s !== qe(u)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const r = new Map(e.interfaceBindings.map((c) => [c.local, c.parent])), l = (c) => r.get(c) ?? c, a = i.map((c) => ({ ...c, terminals: Object.fromEntries(Object.entries(c.terminals).map(([v, b]) => [v, l(b)])), value: _t(c.value, {}, l, (v) => v) }));
    if (qe(a) !== qe(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: s, boundSignature: qe(n), boundaryVerified: !0 };
}
function Xe(t) {
  const e = he(), n = he();
  for (const i of t.components) {
    const o = he(), s = he();
    for (const [u, r] of Object.entries(i.terminals))
      o[u] = [t.nodes[r].bit], s[u] = "input";
    e[i.name] = { type: i.type, port_directions: s, connections: o, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((u) => ({ pin: u.pin, label: u.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((u, r) => ({ pin: u, label: i.pinLabels?.[r] || u })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Mt(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function ro(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, o = (a) => (n.has(a) || n.set(a, n.size + 2), n.get(a));
  Object.entries(t.modules.circuit.cells).forEach(([a, c], v) => {
    const b = "c" + v;
    e.set(b, a);
    const d = Object.fromEntries(Object.entries(c.connections).map(([g, m]) => [g, m.map(o)]));
    i[b] = { type: c.type, connections: d, port_directions: c.port_directions, attributes: { displayRef: c.attributes.displayRef || c.attributes.ref || "", value: c.attributes.value || "", name: c.attributes.name || "" } }, c.spiceBlock && (i[b].spiceBlock = c.spiceBlock), c.spiceSymbol && (i[b].spiceSymbol = c.spiceSymbol), c.spiceLayout && (i[b].spiceLayout = c.spiceLayout);
  });
  const s = new Map([...e].map(([a, c]) => [c, a])), u = t.modules.circuit.spiceLayoutDescription, r = u ? { ...u, faces: (u.faces || []).map((a) => ({ ...a, device: s.get(a.device) })), pairs: (u.pairs || []).map((a) => ({ ...a, members: a.members.map((c) => s.get(c)) })), groups: u.groups.map((a) => ({ ...a, members: a.members.map((c) => c.cell ? { ...c, cell: s.get(c.cell) } : c) })), relations: u.relations.map((a) => ({ ...a, a: s.get(a.a) || a.a, b: s.get(a.b) || a.b })) } : null, l = Mt(t.modules.circuit.spiceMotifs || [], (a) => s.get(a), o);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: l, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([a, c]) => [c, a])) };
}
const De = /* @__PURE__ */ new Map();
async function it(t, e) {
  const n = ro(t), i = JSON.stringify([n.netlist, e]);
  let o = De.get(i);
  o ? (De.delete(i), De.set(i, o)) : (o = await io(n.netlist, e), o.svg.length < 1e6 && (De.set(i, o), De.size > 20 && De.delete(De.keys().next().value)));
  const s = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (s.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const l of s.querySelectorAll("[id],[class]")) {
    const a = l.getAttribute("id");
    a?.startsWith("cell_") && n.ids.has(a.slice(5)) && l.setAttribute("id", "cell_" + n.ids.get(a.slice(5)));
    const c = l.getAttribute("class");
    c && l.setAttribute("class", c.split(/\s+/).map((v) => v.startsWith("cell_") && n.ids.has(v.slice(5)) ? "cell_" + n.ids.get(v.slice(5)) : /^net_\d+$/.test(v) && n.bits.has(Number(v.slice(4))) ? "net_" + n.bits.get(Number(v.slice(4))) : v).join(" "));
  }
  const u = o.drawing ? structuredClone(o.drawing) : null, r = s.querySelector("#spice-layout-report");
  if (r) {
    const l = JSON.parse(r.textContent), a = (c) => n.ids.get(c) || c;
    l.mirroredTransistors = (l.mirroredTransistors || []).map(a), l.orientationDevicesTested = (l.orientationDevicesTested || []).map(a), l.recognizedMotifs = Mt(l.recognizedMotifs || [], a, (c) => n.bits.get(c) ?? c), l.inputAttachments = (l.inputAttachments || []).map(a), l.mirroredInputPorts = (l.mirroredInputPorts || []).map(a);
    for (const c of [...l.flippedPairs || [], ...l.pairOrientationTrials || []]) c.members = c.members.map(a);
    for (const c of l.pairCompactions || [])
      c.members = c.members.map(a), c.moved = a(c.moved);
    for (const c of l.pairConstraints || []) c.members = c.members.map(a);
    for (const c of l.pairProximity || []) c.members = c.members.map(a);
    for (const c of l.motifMeasurements || [])
      c.members = c.members.map(a), c.interlopers && (c.interlopers = c.interlopers.map(a));
    for (const c of l.voltageRails || []) c.bit !== void 0 && (c.bit = n.bits.get(c.bit) ?? c.bit);
    r.textContent = JSON.stringify(l);
  }
  if (u) {
    for (const l of u.components) {
      l.id = n.ids.get(l.id) || l.id;
      for (const a of l.ports) a.bit = n.bits.get(a.bit) ?? a.bit;
    }
    for (const l of u.segments) l.bit = n.bits.get(l.bit) ?? l.bit;
  }
  return { svg: new XMLSerializer().serializeToString(s.documentElement), drawing: u };
}
function io(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, o) => {
    const s = (l, a) => {
      clearTimeout(r), n.terminate(), l ? o(Error(l)) : i(a);
    }, u = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => s("Layout timed out. Open a subcircuit sheet or collapse instances."), u);
    n.onmessage = ({ data: l }) => s(l.error, { svg: l.svg, drawing: l.drawing }), n.onerror = (l) => s(l.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const so = `* RLC low-pass filter
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
`, ao = `* Voltage-divider biased common-emitter amplifier.
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
`, lo = `* Common-collector voltage follower; independently chosen example values.
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
`, co = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, uo = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, Ke = {
  filter: { source: so, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: ao, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: lo, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: co, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: uo, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
}, We = (t) => t.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Qt = (t) => We(t).split("/").at(-1);
function Ft(t) {
  const e = [];
  for (const n of t.split(/\r?\n/)) {
    const i = /^\s*\.(include|inc|lib)\s+(?:"([^"]+)"|'([^']+)'|([^\s;$]+))/i.exec(n);
    if (i) {
      const o = i[2] || i[3] || i[4];
      (i[1].toLowerCase() !== "lib" || /[.\\/]/.test(o) || /^\s*\.lib\s+(?:"[^"]+"|'[^']+'|\S+)\s+[^;$\s]/i.test(n)) && e.push(We(o));
    }
  }
  return e;
}
function fo(t, e, n = []) {
  if (/\.(spiceproj|json)$/i.test(t) || /^\s*\{/.test(e) && /"format"\s*:\s*"spice-viewer-project"/.test(e)) return "project";
  if (n.some((r) => r === We(t) || Qt(r) === Qt(t)) || /\.(lib|sub|mod|inc)$/i.test(t)) return "library";
  let i = 0, o = !1, s = !1, u = !1;
  for (const [r, l] of e.split(/\r?\n/).entries()) {
    const a = l.trim();
    if (!(!a || a.startsWith("*") || a.startsWith("+")) && !(r === 0 && !a.startsWith(".") && !/^\S*[\d_]\S*\s/.test(a))) {
      if (/^\.subckt\b/i.test(a)) {
        o = !0, i++;
        continue;
      }
      if (/^\.ends\b/i.test(a)) {
        i = Math.max(0, i - 1);
        continue;
      }
      i || (/^\.(model|param|func)\b/i.test(a) && (o = !0), /^\.(tran|ac|dc|op|tf|noise|pz|sens|four|meas)\b/i.test(a) && (u = !0), /^[RLCVIQMDJZEFGHBXSWTKOUAPY]\S*\s+\S+\s+\S+(?:\s+\S+)?/i.test(a) && !a.startsWith(".") && (s = !0));
    }
  }
  return o && !s && !u ? "library" : s || u || /\.(cir|sp|spice|net)$/i.test(t) ? "netlist" : "unknown";
}
function po(t, e = "") {
  if (!t.length) return { files: [], needsChoice: !1 };
  const n = /* @__PURE__ */ new Set();
  for (const u of t) {
    const r = We(u.name);
    if (!r || ["__proto__", "constructor", "prototype"].includes(r) || n.has(r)) throw Error("Duplicate or invalid upload filename: " + u.name);
    n.add(r);
  }
  const i = [...Ft(e), ...t.flatMap((u) => Ft(u.text))], o = t.map((u) => ({ ...u, kind: fo(u.name, u.text, i) }));
  if (o.filter((u) => u.kind === "project").length && o.length !== 1) throw Error("Open one project file by itself. Projects already contain their libraries.");
  return { files: o, needsChoice: o.some((u) => u.kind === "unknown") || o.filter((u) => u.kind === "netlist").length > 1 };
}
function Ht(t) {
  const e = t.filter((i) => i.kind === "netlist"), n = t.filter((i) => i.kind === "project");
  if (e.length > 1) throw Error("Choose one main netlist; mark the other files as libraries.");
  if (t.some((i) => !["netlist", "library", "project"].includes(i.kind))) throw Error("Choose a role for each file.");
  if (n.length && t.length !== 1) throw Error("Open one project file by itself.");
  for (const i of t) if (new TextEncoder().encode(i.text).length > (i.kind === "project" ? 32 * 1024 * 1024 : i.kind === "library" ? 16e6 : 2e6)) throw Error(i.name + ": " + (i.kind === "library" ? "Library exceeds 16 MB." : i.kind === "project" ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB."));
  return { project: n[0], netlist: e[0], libraries: t.filter((i) => i.kind === "library") };
}
function ho(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function mo(t) {
  return ho(await t.arrayBuffer());
}
const go = [
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
].flat(), Lt = "#292b29", pt = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => go[e * 9 + t]))])], Wt = (t) => /^#[\da-f]{6}$/i.test(t), zt = "spice-node-colors-v1";
function bo(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class yo {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = bo(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, pt[this.assigned.size % pt.length]), this.assigned.get(e)) : Lt;
  }
  set(e, n) {
    if (!Wt(n)) throw Error("Invalid node color.");
    for (const i of e) this.manual.set(i, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((i) => Array.isArray(i) && typeof i[0] == "string" && Wt(i[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function wo(t, e, n) {
  const i = new Map(e.map((o) => [o.name, n.color(o.name)]));
  for (const o of t.children) if (["line", "path", "polyline", "circle"].includes(o.localName) && o.hasAttribute("data-net")) {
    const s = i.get(o.getAttribute("data-net"));
    if (!s) continue;
    o.style.setProperty("stroke", s, "important"), o.localName === "circle" && o.style.setProperty("fill", s, "important");
  }
}
function xo(t, e) {
  const n = new yo(), i = /* @__PURE__ */ new Set();
  let o = [], s = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(zt) || "null"));
  } catch {
  }
  const u = () => {
    try {
      sessionStorage.setItem(zt, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, r = () => {
    const b = t("node-search").value.trim().toLowerCase();
    return o.filter((d) => !b || [d.name, d.displayName, ...d.terminals.map((g) => g.component + "." + g.pin)].some((g) => g.toLowerCase().includes(b)));
  };
  function l() {
    const b = r(), d = b.filter((g) => i.has(g.name)).length;
    t("node-count").textContent = `${b.length} / ${o.length} nodes · ${i.size} selected`, t("node-all").checked = !!b.length && d === b.length, t("node-all").indeterminate = d > 0 && d < b.length, t("node-auto").checked = n.auto;
    for (const g of ["node-apply", "node-clear"]) t(g).disabled = !s || !i.size;
    t("node-all").disabled = !s || !b.length;
  }
  function a() {
    t("nets").replaceChildren(...r().map((b) => {
      const d = document.createElement("tr");
      d.dataset.node = b.name;
      const g = document.createElement("td"), m = document.createElement("input");
      m.type = "checkbox", m.checked = i.has(b.name), m.disabled = !s, m.setAttribute("aria-label", "Select node " + b.displayName), m.onchange = () => {
        m.checked ? i.add(b.name) : i.delete(b.name), l();
      }, g.append(m);
      const N = document.createElement("td");
      N.textContent = b.displayName;
      const y = document.createElement("td"), w = document.createElement("input");
      w.type = "color", w.value = n.color(b.name), w.disabled = !s, w.setAttribute("aria-label", "Wire color for " + b.displayName), w.onchange = () => {
        n.set([b.name], w.value), c();
      }, y.append(w);
      const C = document.createElement("td");
      return C.textContent = b.terminals.map((_) => _.component + "." + _.pin).join(", "), d.append(g, N, y, C), d;
    })), l();
  }
  function c() {
    for (const b of o) n.color(b.name);
    a(), u(), e(n, o);
  }
  t("node-search").oninput = a, t("node-all").onchange = () => {
    for (const b of r()) t("node-all").checked ? i.add(b.name) : i.delete(b.name);
    a();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, c();
  }, t("node-apply").onclick = () => {
    n.set(i, t("node-color").value), c();
  }, t("node-clear").onclick = () => {
    n.set(i, Lt), c();
  }, t("node-reset").onclick = () => {
    n.reset(), c();
  };
  function v(b) {
    s = b;
    for (const d of t("node-panel").querySelectorAll("input,button")) d.disabled = !s;
    l();
  }
  return { snapshot: () => n.snapshot(), restore(b) {
    n.restore(b), i.clear(), c();
  }, setCircuit(b, d) {
    const g = n.sourceId;
    n.setSource(d), g !== n.sourceId && i.clear(), o = Object.values(b?.nodes || {});
    const m = new Set(o.map((N) => N.name));
    for (const N of i) m.has(N) || i.delete(N);
    for (const N of o) n.color(N.name);
    s = !!b, a(), v(s), u(), e(n, o);
  }, setEnabled: v };
}
function vo(t) {
  const e = (L) => t.querySelector("#spice-" + L), n = new AbortController(), i = n.signal, o = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, s = Object.fromEntries(Object.keys(o).map((L) => [L, t.querySelector(`[data-window-handle="${L}"]`)])), u = { editor: !0, details: !0, info: !0 }, r = { editor: !0, details: !0, info: !0 }, l = [], a = { editor: {}, details: {}, info: {} }, c = [];
  let v = !1, b = !1, d = null, g = null, m = null, N = null;
  function y(L, G) {
    r[L] = G, o[L].dataset.pinned = String(G);
    const ee = e("pin-" + L), z = { editor: "netlist", details: "details", info: "messages" }[L], ie = L === "info" ? "bottom edge" : L === "details" ? "lower left" : "left edge", le = G ? `Unpin ${z} from ${ie}` : `Pin ${z} to ${ie}`;
    if (ee.setAttribute("aria-pressed", String(G)), ee.setAttribute("aria-label", le), ee.title = le, G) for (const ne of ["left", "top", "right", "bottom", "width", "height"]) o[L].style.removeProperty(ne);
    v && requestAnimationFrame(E);
  }
  for (const L of Object.keys(o)) y(L, !0);
  const w = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: v, panels: { ...u } } })), C = (L, G, ee, z = {}) => L.addEventListener(G, ee, { ...z, signal: i });
  function _(L, G) {
    u[L] = G, o[L].hidden = v && !G, requestAnimationFrame(E), w();
  }
  function I(L, G = e("details-content")) {
    const ee = document.createComment("workspace return");
    L.before(ee), l.push({ node: L, anchor: ee }), G === e("details-content") ? G.prepend(L) : G.append(L);
  }
  function S(L) {
    const G = L.getBoundingClientRect(), ee = t.getBoundingClientRect();
    return { x: G.left - ee.left, y: G.top - ee.top, w: G.width, h: G.height, width: ee.width, height: ee.height };
  }
  function M(L, G, ee) {
    const z = S(L), ie = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, le = Math.max(8, Math.min(G, z.width - z.w - 8)), ne = Math.max(8, Math.min(ie, z.height - z.h - 8)), Ie = Math.max(ne, Math.min(ee, z.height - z.h - 8));
    L.style.left = Math.round(le) + "px", L.style.top = Math.round(Ie) + "px", L.style.right = "auto", L.style.bottom = "auto";
  }
  function B() {
    if (!v || !r.info || o.info.hidden) return;
    const L = t.getBoundingClientRect(), G = L.width <= 600 ? 8 : 12, ee = L.width <= 600 ? G : Math.max(G, ...["editor", "details"].filter((le) => r[le] && !o[le].hidden).map((le) => o[le].getBoundingClientRect().right - L.left + 12)), z = Math.min(ee, Math.max(G, L.width - 160 - G)), ie = o.info;
    for (const [le, ne] of Object.entries({ left: Math.round(z) + "px", right: G + "px", width: "auto" })) ie.style[le] !== ne && (ie.style[le] = ne);
  }
  function E() {
    if (v) {
      B();
      for (const [L, G] of Object.entries(o)) if (!G.hidden && !r[L]) {
        const ee = S(G);
        M(G, ee.x, ee.y);
      }
    }
  }
  function x() {
    for (const L of Object.values(o))
      for (const G of ["left", "top", "right", "bottom", "width", "height", "z-index"]) L.style.removeProperty(G);
    for (const L of Object.keys(o))
      y(L, !0), _(L, !0);
    requestAnimationFrame(E);
  }
  function H() {
    if (v) return;
    v = !0, d = document.activeElement, g = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, N = document.createComment("workspace mount"), t.before(N), document.body.append(t);
    for (const G of document.body.children) G !== t && (c.push({ node: G, inert: G.inert }), G.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const G of Object.keys(o))
      a[G].base = o[G].style.cssText, a[G].floating && (o[G].style.cssText = a[G].floating), o[G].setAttribute("role", "dialog"), o[G].setAttribute("aria-modal", "false"), o[G].setAttribute("aria-labelledby", "spice-" + G + "-title"), s[G].tabIndex = 0, s[G].title = "Drag to move; arrow keys move the window", _(G, u[G]);
    for (const G of ["selection-actions", "selection", "hierarchy-panel"]) I(e(G));
    const L = e("workspace-strip");
    for (const G of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (L.childElementCount) {
        const ee = document.createElement("span");
        ee.className = "spice-tool-divider", ee.setAttribute("role", "separator"), ee.setAttribute("aria-orientation", "vertical"), L.append(ee);
      }
      I(G === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(G), L);
    }
    I(e("generate"), e("workspace-bar")), e("workspace-bar").insertBefore(e("generate"), e("workspace-fixed-divider")), requestAnimationFrame(E), e("exit-fullscreen").focus({ preventScroll: !0 }), w();
  }
  function K() {
    if (v) {
      v = !1, m = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: L, anchor: G } of l.splice(0))
        G.before(L), G.remove();
      e("workspace-strip").replaceChildren();
      for (const L of Object.keys(o)) {
        a[L].floating = o[L].style.cssText, o[L].style.cssText = a[L].base, o[L].hidden = !1;
        for (const G of ["role", "aria-modal", "aria-labelledby"]) o[L].removeAttribute(G);
        s[L].removeAttribute("tabindex"), s[L].removeAttribute("title");
      }
      N && (N.before(t), N.remove(), N = null);
      for (const { node: L, inert: G } of c.splice(0)) L.inert = G;
      g && (document.documentElement.style.overflow = g.html, document.body.style.overflow = g.body, window.scrollTo(g.x, g.y)), d?.focus?.({ preventScroll: !0 }), w();
    }
  }
  async function $() {
    H(), t.dataset.nativeFullscreen = "false";
  }
  async function te() {
    if (b = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        b = !0;
        return;
      }
    K();
  }
  C(e("fullscreen"), "click", () => v ? te() : $()), C(e("exit-fullscreen"), "click", te), C(e("reset-windows"), "click", x);
  for (const L of Object.keys(o)) {
    C(e("pin-" + L), "click", () => {
      const z = S(o[L]);
      y(L, !r[L]), r[L] || (o[L].style.width = z.w + "px", o[L].style.height = z.h + "px", M(o[L], z.x, z.y)), w();
    }), C(e("close-" + L), "click", () => {
      _(L, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), C(o[L], "pointerdown", () => {
      if (v) {
        for (const z of Object.values(o)) z.style.zIndex = "20";
        o[L].style.zIndex = "30";
      }
    }, { capture: !0 });
    const G = s[L];
    C(G, "pointerdown", (z) => {
      if (!v || z.button !== 0 || z.target.closest("button,input,select,textarea,a,label")) return;
      z.preventDefault();
      const ie = S(o[L]);
      y(L, !1), o[L].style.width = ie.w + "px", o[L].style.height = ie.h + "px", M(o[L], ie.x, ie.y), m = { id: L, pointer: z.pointerId, x: z.clientX, y: z.clientY, left: ie.x, top: ie.y }, G.setPointerCapture(z.pointerId);
    }), C(G, "pointermove", (z) => {
      m?.id === L && m.pointer === z.pointerId && M(o[L], m.left + z.clientX - m.x, m.top + z.clientY - m.y);
    });
    const ee = () => {
      m = null;
    };
    C(G, "pointerup", ee), C(G, "pointercancel", ee), C(G, "lostpointercapture", ee), C(G, "keydown", (z) => {
      if (!v || z.target !== G || !z.key.startsWith("Arrow")) return;
      z.preventDefault();
      const ie = S(o[L]), le = z.shiftKey ? 32 : 8;
      y(L, !1), o[L].style.width = ie.w + "px", o[L].style.height = ie.h + "px", M(o[L], ie.x + ({ ArrowLeft: -le, ArrowRight: le }[z.key] || 0), ie.y + ({ ArrowUp: -le, ArrowDown: le }[z.key] || 0));
    });
  }
  C(document, "fullscreenchange", () => {
    v && b && document.fullscreenElement !== t && (b = !1, K());
  }), C(document, "keydown", (L) => {
    v && L.altKey && L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), te());
  }, { capture: !0 }), C(window, "resize", E);
  const re = new ResizeObserver(E);
  for (const L of Object.values(o)) re.observe(L);
  return { enter: $, exit: te, showPanel: _, reset: x, destroy() {
    te(), n.abort(), re.disconnect();
  } };
}
const Eo = `<svg
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
`, mt = (t) => !t.decoration || t.selectable === !0;
function qt(t, e, n) {
  const i = Math.min(e.x, n.x), o = Math.max(e.x, n.x), s = Math.min(e.y, n.y), u = Math.max(e.y, n.y), r = n.x < e.x, l = 1e-3;
  return t.filter((a) => mt(a) && (r ? a.x <= o + l && a.x + a.width >= i - l && a.y <= u + l && a.y + a.height >= s - l : a.x >= i - l && a.x + a.width <= o + l && a.y >= s - l && a.y + a.height <= u + l)).map((a) => a.id);
}
function No(t, e, n, i) {
  const o = new Set(e), s = t.filter((N) => o.has(N.id) && mt(N)), u = n.startsWith("space-");
  if (s.length < (u ? 3 : 2)) throw Error(u ? "Select at least three components." : "Select at least two components.");
  const r = ["left", "right", "center-x", "space-x"].includes(n), l = ["top", "bottom", "center-y", "space-y"].includes(n);
  if (!r && !l) throw Error("Unknown arrangement.");
  const a = r ? "x" : "y", c = r ? "width" : "height", v = Math.min(...s.map((N) => N[a])), b = Math.max(...s.map((N) => N[a] + N[c])), d = /* @__PURE__ */ new Map();
  if (u) {
    const N = [...s].sort((I, S) => I[a] - S[a] || I.id.localeCompare(S.id)), y = N.at(-1), w = y[a] + y[c] - N[0][a], C = (w - N.reduce((I, S) => I + S[c], 0)) / (s.length - 1);
    if (C < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let _ = N[0][a];
    for (const I of N)
      d.set(I.id, _), _ += I[c] + C;
  } else for (const N of s) d.set(N.id, ["left", "top"].includes(n) ? v : ["right", "bottom"].includes(n) ? b - N[c] : (v + b - N[c]) / 2);
  let g = !1;
  return { moves: s.map((N) => {
    const y = d.get(N.id) - N[a], w = Math.round(y / i) * i;
    return Math.abs(w - y) > 1e-3 && (g = !0), { id: N.id, dx: r ? w : 0, dy: l ? w : 0 };
  }), rounded: g };
}
const So = (t) => "@manual-group/" + t;
function kt(t, e = []) {
  const n = new Set(t);
  for (const i of e) if (i.members.some((o) => n.has(o))) for (const o of i.members) n.add(o);
  return n;
}
function st(t, e = []) {
  const n = new Set(t);
  return e.find((i) => i.members.length === n.size && i.members.every((o) => n.has(o)));
}
function Be(t, e = []) {
  const n = new Map(t.map((s) => [s.id, s])), i = new Set(e.flatMap((s) => s.members)), o = t.filter((s) => !i.has(s.id)).map((s) => ({ ...s, members: [s.id] }));
  for (const s of e) {
    const u = s.members.map((a) => n.get(a));
    if (u.some((a) => !a)) throw Error("Unknown manual group member.");
    const r = Math.min(...u.map((a) => a.x)), l = Math.min(...u.map((a) => a.y));
    o.push({ id: So(s.id), groupId: s.id, members: [...s.members], x: r, y: l, width: Math.max(...u.map((a) => a.x + a.width)) - r, height: Math.max(...u.map((a) => a.y + a.height)) - l, ports: [] });
  }
  return o;
}
function Ye(t, e = []) {
  if (!e.length) return !1;
  const n = Be(t, e);
  return n.some((i, o) => n.slice(o + 1).some((s) => (i.groupId || s.groupId) && i.x < s.x + s.width - 1e-3 && i.x + i.width > s.x + 1e-3 && i.y < s.y + s.height - 1e-3 && i.y + i.height > s.y + 1e-3));
}
function sn(t, e) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 5e3) throw Error("Invalid project: invalid manual groups.");
  const n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = new Map(e.map((s) => [s.id, s]));
  for (const s of t) {
    if (!s || typeof s.id != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(s.id) || n.has(s.id) || !Array.isArray(s.members) || s.members.length < 2) throw Error("Invalid project: invalid manual group identity.");
    n.add(s.id);
    for (const u of s.members) {
      const r = o.get(u);
      if (!r || !mt(r) || i.has(u)) throw Error("Invalid project: missing or duplicate manual group member.");
      i.add(u);
    }
  }
}
const gt = (t, e) => encodeURIComponent(t) + ":" + e;
function an(t) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 2e4) throw Error("Invalid project: invalid label overrides.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!n || typeof n.owner != "string" || !Number.isSafeInteger(n.index) || n.index < 0 || n.id !== gt(n.owner, n.index) || e.has(n.id) || typeof n.text != "string" || n.text.length > 2e4 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(n.text) || ![n.x, n.y].every((o) => Number.isFinite(o) && Math.abs(o) <= 1e6)) throw Error("Invalid project: invalid label identity, text or position.");
    e.add(n.id);
    const i = n.orientation;
    if (!Array.isArray(i) || i.length !== 4 || !i.every((o) => [-1, 0, 1].includes(o)) || i[0] ** 2 + i[1] ** 2 !== 1 || i[2] ** 2 + i[3] ** 2 !== 1 || i[0] * i[2] + i[1] * i[3] !== 0) throw Error("Invalid project: label transform must be a rotation or mirror.");
  }
}
function _o(t, e) {
  const n = { rotate: [0, 1, -1, 0], "mirror-x": [1, 0, 0, -1], "mirror-y": [-1, 0, 0, 1] }[e];
  if (!n) throw Error("Unknown label transform.");
  const i = t.orientation;
  return { ...t, orientation: [n[0] * i[0] + n[2] * i[1], n[1] * i[0] + n[3] * i[1], n[0] * i[2] + n[2] * i[3], n[1] * i[2] + n[3] * i[3]].map((o) => o || 0) };
}
const Co = "http://www.w3.org/2000/svg";
function ln(t) {
  const e = /* @__PURE__ */ new Map();
  return [...t.querySelectorAll("text")].filter((n) => !n.closest("defs")).map((n) => {
    const i = n.closest('g[id^="cell_"]')?.id.slice(5) || "", o = e.get(i) || 0;
    return e.set(i, o + 1), { node: n, owner: i, index: o, id: gt(i, o) };
  });
}
function It(t, e) {
  an(e);
  const n = new Set(ln(t).map((i) => i.id));
  for (const i of e || []) if (!n.has(i.id)) throw Error("Invalid project: unknown label " + i.id);
}
function ko() {
  let t = null, e = /* @__PURE__ */ new Map(), n = [], i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = !1, u = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  const l = (d, g) => {
    const m = document.createElementNS(Co, d);
    for (const [N, y] of Object.entries(g)) m.setAttribute(N, y);
    return m;
  };
  function a() {
    for (const d of e.values()) if (d.node.isConnected) {
      for (const g of [...d.node.attributes]) d.node.removeAttribute(g.name);
      for (const [g, m] of d.attributes) d.node.setAttribute(g, m);
      d.node.textContent = d.text;
    }
    t?.querySelector("[data-label-hit-layer]")?.remove(), e.clear(), n = [];
  }
  function c(d) {
    const g = d.getBBox(), m = t.getCTM().inverse().multiply(d.getCTM()), N = [[g.x, g.y], [g.x + g.width, g.y], [g.x, g.y + g.height], [g.x + g.width, g.y + g.height]].map(([C, _]) => new DOMPoint(C, _).matrixTransform(m)), y = Math.min(...N.map((C) => C.x)), w = Math.min(...N.map((C) => C.y));
    return { x: y, y: w, width: Math.max(...N.map((C) => C.x)) - y, height: Math.max(...N.map((C) => C.y)) - w };
  }
  function v(d, g) {
    d.node.textContent = g.text;
    const m = d.node.getBBox(), [N, y, w, C] = g.orientation, _ = i.get(g.owner) || { x: 0, y: 0 }, I = [0, N * m.width, w * m.height, N * m.width + w * m.height], S = [0, y * m.width, C * m.height, y * m.width + C * m.height], M = new DOMMatrix([N, y, w, C, _.x + g.x - Math.min(...I) - N * m.x - w * m.y, _.y + g.y - Math.min(...S) - y * m.x - C * m.y]), B = t.getCTM().inverse().multiply(d.node.parentElement.getCTM()), E = new DOMMatrix([B.a, B.b, B.c, B.d, B.e, B.f]), x = E.inverse().multiply(M);
    d.node.setAttribute("transform", "matrix(" + [x.a, x.b, x.c, x.d, x.e, x.f].join(" ") + ")");
  }
  function b() {
    if (t?.querySelector("[data-label-hit-layer]")?.remove(), r.clear(), !s || !t) return;
    const d = l("g", { "data-label-hit-layer": "true", "data-editor-overlay": "true" });
    for (const m of n) {
      const N = l("rect", { x: m.x - 2, y: m.y - 2, width: Math.max(8, m.width) + 4, height: Math.max(12, m.height) + 4, fill: u.has(m.id) ? "#507d9c" : "transparent", "fill-opacity": u.has(m.id) ? 0.12 : 0, stroke: "#507d9c", "stroke-opacity": u.has(m.id) ? 1 : 0.35, "stroke-width": u.has(m.id) ? 1.5 : 0.7, "stroke-dasharray": u.has(m.id) ? "none" : "3 3", "vector-effect": "non-scaling-stroke", "pointer-events": "all", "data-editor-label": m.id, ...u.has(m.id) ? { "data-selected-label": m.id } : {} });
      r.set(m.id, N), d.append(N);
    }
    const g = t.querySelector("[data-airwires]");
    g ? t.insertBefore(d, g) : t.append(d);
  }
  return {
    reset: a,
    layout(d, g, m, N, y) {
      t = d, i = new Map(g.map((w) => [w.id, w])), o = new Map((m || []).map((w) => [w.id, w])), s = N, u = y, e.clear(), n = [];
      for (const w of ln(t)) {
        const C = c(w.node), _ = i.get(w.owner) || { x: 0, y: 0 }, I = { ...w, attributes: [...w.node.attributes].map((M) => [M.name, M.value]), text: w.node.textContent, record: { id: w.id, owner: w.owner, index: w.index, text: w.node.textContent, x: C.x - _.x, y: C.y - _.y, orientation: [1, 0, 0, 1] } };
        e.set(w.id, I);
        const S = o.get(w.id);
        S && v(I, S), w.node.dataset.labelId = w.id, n.push({ id: w.id, ...c(w.node), ports: [] });
      }
      return b(), { x: Math.min(0, ...n.map((w) => w.x)), y: Math.min(0, ...n.map((w) => w.y)), right: Math.max(0, ...n.map((w) => w.x + w.width)), bottom: Math.max(0, ...n.map((w) => w.y + w.height)) };
    },
    nodes: () => n,
    record(d) {
      const g = e.get(d);
      if (!g) throw Error("Label no longer exists.");
      return structuredClone(o.get(d) || g.record);
    },
    preview(d) {
      const g = new Set(d.map((m) => m.id));
      for (const m of d) {
        const N = e.get(m.id);
        if (N) {
          const y = this.record(m.id);
          v(N, { ...y, x: y.x + m.dx, y: y.y + m.dy });
        }
      }
      n = n.map((m) => {
        if (!g.has(m.id)) return m;
        const N = { ...m, ...c(e.get(m.id).node) }, y = r.get(m.id);
        if (y) for (const [w, C] of Object.entries({ x: N.x - 2, y: N.y - 2, width: Math.max(8, N.width) + 4, height: Math.max(12, N.height) + 4 })) y.setAttribute(w, C);
        return N;
      });
    }
  };
}
const ae = 1e-3, de = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), pe = (t, e) => Math.abs(t - e) < ae, Ce = (t, e) => pe(e.a.x, e.b.x) ? pe(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - ae && t.y <= Math.max(e.a.y, e.b.y) + ae : pe(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - ae && t.x <= Math.max(e.a.x, e.b.x) + ae, Io = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Ao = (t, e) => Math.max(t.a.x, t.b.x) > e.x + ae && Math.min(t.a.x, t.b.x) < e.x + e.width - ae && Math.max(t.a.y, t.b.y) > e.y + ae && Math.min(t.a.y, t.b.y) < e.y + e.height - ae;
function yt(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && de(e.at(-1)) === de(n))) {
      for (; e.length > 1 && (pe(e.at(-2).x, e.at(-1).x) && pe(e.at(-1).x, n.x) || pe(e.at(-2).y, e.at(-1).y) && pe(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class cn {
  constructor(e, { step: n = 8, segments: i = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(i), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
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
    const i = this.pins();
    if (i.some((o) => o.bit !== n && Ce(o, e)) || this.segments.some((o) => o.bit !== n && (Ce(e.a, o) || Ce(e.b, o) || Ce(o.a, e) || Ce(o.b, e)))) return !1;
    for (const o of this.components) if (Ao(e, o) && !i.filter((u) => u.owner === o.id && u.bit === n).some((u) => u.side === "NORTH" ? pe(e.a.x, u.x) && pe(e.b.x, u.x) && Math.max(e.a.y, e.b.y) <= u.y + ae : u.side === "SOUTH" ? pe(e.a.x, u.x) && pe(e.b.x, u.x) && Math.min(e.a.y, e.b.y) >= u.y - ae : u.side === "WEST" ? pe(e.a.y, u.y) && pe(e.b.y, u.y) && Math.max(e.a.x, e.b.x) <= u.x + ae : u.side === "EAST" ? pe(e.a.y, u.y) && pe(e.b.y, u.y) && Math.min(e.a.x, e.b.x) >= u.x - ae : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const i = yt(n), o = i.slice(1).map((s, u) => ({ bit: e, a: i[u], b: s })).filter((s) => Io(s) > ae);
    if (!o.length) return !1;
    if (o.some((s) => !this.validSegment(s, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...o), !0;
  }
  move(e, n, i) {
    if (this.manualGroups?.length) return this.moveMany([{ id: e, dx: n, dy: i }]);
    if (n = Math.round(n / this.step) * this.step, i = Math.round(i / this.step) * this.step, !n && !i) return;
    const o = this.snapshot(), s = this.components.find((l) => l.id === e);
    if (!s) return;
    const u = s.ports.map((l) => ({ ...l }));
    this.segments = this.segments.filter((l) => !u.some((a) => a.bit === l.bit && (de(a) === de(l.a) || de(a) === de(l.b)))), s.x += n, s.y += i;
    for (const l of s.ports)
      l.x += n, l.y += i;
    if (this.pinCache = null, this.components.some((l) => l !== s && s.x < l.x + l.width - ae && s.x + s.width > l.x + ae && s.y < l.y + l.height - ae && s.y + s.height > l.y + ae) || this.segments.some((l) => !this.validSegment(l, l.bit)) || s.ports.some((l) => this.pins().some((a) => a.owner !== e && a.bit !== l.bit && de(a) === de(l))))
      throw this.restore(o), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(o);
  }
  moveMany(e) {
    const n = new Map(e.map((a) => [a.id, { ...a }]));
    for (const a of this.manualGroups || []) {
      const c = a.members.map((b) => n.get(b)).filter(Boolean);
      if (!c.length) continue;
      const v = c[0];
      if (c.some((b) => b.dx !== v.dx || b.dy !== v.dy)) throw Error("Grouped components must move together.");
      for (const b of a.members) n.set(b, { id: b, dx: v.dx, dy: v.dy });
    }
    e = [...n.values()];
    const i = new Map(e.map((a) => [a.id, { dx: Math.round(a.dx / this.step) * this.step, dy: Math.round(a.dy / this.step) * this.step }]).filter(([, a]) => a.dx || a.dy)), o = this.components.filter((a) => i.has(a.id));
    if (!o.length) return !1;
    const s = this.snapshot(), u = o.flatMap((a) => a.ports);
    this.segments = this.segments.filter((a) => !u.some((c) => c.bit === a.bit && Ce(c, a)));
    for (const a of o) {
      const c = i.get(a.id);
      a.x += c.dx, a.y += c.dy;
      for (const v of a.ports)
        v.x += c.dx, v.y += c.dy;
    }
    this.pinCache = null, this.cache = null;
    const r = this.pins();
    if (o.some((a) => this.components.some((c) => c !== a && a.x < c.x + c.width - ae && a.x + a.width > c.x + ae && a.y < c.y + c.height - ae && a.y + a.height > c.y + ae)) || Ye(this.components, this.manualGroups) || r.some((a) => !this.onGrid(a) || r.some((c) => c.owner !== a.owner && c.bit !== a.bit && de(c) === de(a))) || this.segments.some((a) => !this.validSegment(a, a.bit)))
      throw this.restore(s), Error("Arrangement blocked: a component, manual group or another node occupies the target position.");
    return this.remember(s), !0;
  }
  transform(e, n) {
    const i = this.manualGroups?.find((d) => d.members.includes(e));
    if (i) return this.transformGroup(i.id, n);
    const o = this.components.find((d) => d.id === e);
    if (!o) return;
    const s = this.snapshot(), u = o.width, r = o.height, l = n === "rotate" ? [0, 1, -1, 0, r, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, r] : n === "mirror-y" ? [-1, 0, 0, 1, u, 0] : null;
    if (!l) throw Error("Unknown transform.");
    const a = o.ports.map((d) => ({ ...d })), c = (d) => ({ x: l[0] * d.x + l[2] * d.y + l[4], y: l[1] * d.x + l[3] * d.y + l[5] });
    this.segments = this.segments.filter((d) => !a.some((g) => g.bit === d.bit && (de(g) === de(d.a) || de(g) === de(d.b))));
    const v = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of o.ports) {
      const g = c({ x: d.x - o.x, y: d.y - o.y });
      d.x = o.x + g.x, d.y = o.y + g.y, d.side = v[d.side] || d.side;
    }
    const b = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [l[0] * b[0] + l[2] * b[1], l[1] * b[0] + l[3] * b[1], l[0] * b[2] + l[2] * b[3], l[1] * b[2] + l[3] * b[3], l[0] * b[4] + l[2] * b[5] + l[4], l[1] * b[4] + l[3] * b[5] + l[5]], n === "rotate" && (o.width = r, o.height = u), this.pinCache = null, Ye(this.components, this.manualGroups) || o.ports.some((d) => !this.onGrid(d)) || this.components.some((d) => d !== o && o.x < d.x + d.width - ae && o.x + o.width > d.x + ae && o.y < d.y + d.height - ae && o.y + o.height > d.y + ae) || this.segments.some((d) => !this.validSegment(d, d.bit)) || o.ports.some((d) => this.pins().some((g) => g.owner !== e && g.bit !== d.bit && de(g) === de(d))))
      throw this.restore(s), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(s);
  }
  group(e) {
    const n = [...kt(e, this.manualGroups)], i = (this.manualGroups || []).filter((u) => !u.members.some((r) => n.includes(r)));
    if (n.length < 2) throw Error("Select at least two components to group.");
    let o = 1;
    for (; i.some((u) => u.id === "g" + o); ) o++;
    const s = { id: "g" + o, members: n };
    if (i.push(s), sn(i, this.components), Ye(this.components, i)) throw Error("Group box overlaps an unselected component or another group. Include it in the selection or move it away.");
    return this.remember(), this.manualGroups = i, s;
  }
  ungroup(e) {
    const n = new Set(e), i = (this.manualGroups || []).filter((o) => !o.members.some((s) => n.has(s)));
    return i.length === (this.manualGroups || []).length ? !1 : (this.remember(), this.manualGroups = i, !0);
  }
  transformGroup(e, n) {
    const i = this.manualGroups?.find((d) => d.id === e);
    if (!i) return;
    const o = Be(this.components, [i]).find((d) => d.groupId === e), s = n === "rotate" ? [0, 1, -1, 0, o.height, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, o.height] : n === "mirror-y" ? [-1, 0, 0, 1, o.width, 0] : null;
    if (!s) throw Error("Unknown group transform.");
    const u = this.snapshot(), r = this.components.filter((d) => i.members.includes(d.id)), l = r.flatMap((d) => d.ports);
    this.segments = this.segments.filter((d) => !l.some((g) => g.bit === d.bit && Ce(g, d)));
    const a = (d) => ({ x: o.x + s[0] * (d.x - o.x) + s[2] * (d.y - o.y) + s[4], y: o.y + s[1] * (d.x - o.x) + s[3] * (d.y - o.y) + s[5] }), c = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of r) {
      const g = d.width, m = d.height, N = [a(d), a({ x: d.x + g, y: d.y + m })], y = Math.min(...N.map((I) => I.x)), w = Math.min(...N.map((I) => I.y)), C = a(d), _ = d.editorMatrix || [1, 0, 0, 1, 0, 0];
      d.editorMatrix = [s[0] * _[0] + s[2] * _[1], s[1] * _[0] + s[3] * _[1], s[0] * _[2] + s[2] * _[3], s[1] * _[2] + s[3] * _[3], s[0] * _[4] + s[2] * _[5] + C.x - y, s[1] * _[4] + s[3] * _[5] + C.y - w];
      for (const I of d.ports) {
        const S = a(I);
        I.x = S.x, I.y = S.y, I.side = c[I.side] || I.side;
      }
      d.x = y, d.y = w, n === "rotate" && (d.width = m, d.height = g);
    }
    this.pinCache = null, this.cache = null;
    const v = this.pins();
    if (r.some((d) => this.components.some((g) => g !== d && d.x < g.x + g.width - ae && d.x + d.width > g.x + ae && d.y < g.y + g.height - ae && d.y + d.height > g.y + ae)) || Ye(this.components, this.manualGroups) || v.some((d) => !this.onGrid(d) || v.some((g) => g.bit !== d.bit && de(g) === de(d))) || this.segments.some((d) => !this.validSegment(d, d.bit)))
      throw this.restore(u), Error("Group transform blocked by a component, wire or another node.");
    this.remember(u);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const i of this.pins())
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).pins.push(i);
    for (const i of this.segments)
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).segments.push(i);
    const n = [];
    for (const [i, o] of e) {
      const s = /* @__PURE__ */ new Map(), u = (c) => {
        s.has(de(c)) || s.set(de(c), c);
      };
      o.pins.forEach(u);
      for (const c of o.segments)
        u(c.a), u(c.b);
      for (let c = 0; c < o.segments.length; c++) for (let v = c + 1; v < o.segments.length; v++) {
        const b = o.segments[c], d = o.segments[v];
        if (pe(b.a.x, b.b.x) === pe(d.a.x, d.b.x)) continue;
        const g = pe(b.a.x, b.b.x) ? b : d, m = g === b ? d : b, N = { x: g.a.x, y: m.a.y };
        Ce(N, g) && Ce(N, m) && u(N);
      }
      const r = new Map([...s.keys()].map((c) => [c, c])), l = (c) => {
        let v = c;
        for (; r.get(v) !== v; ) v = r.get(v);
        for (; c !== v; ) {
          const b = r.get(c);
          r.set(c, v), c = b;
        }
        return v;
      };
      for (const c of o.segments) {
        const v = [...s.values()].filter((b) => Ce(b, c));
        for (const b of v.slice(1)) r.set(l(de(b)), l(de(v[0])));
      }
      const a = /* @__PURE__ */ new Map();
      for (const c of o.pins) {
        const v = l(de(c));
        a.has(v) || a.set(v, { pins: [], points: [] }), a.get(v).pins.push(c);
      }
      for (const c of s.values()) {
        const v = l(de(c));
        a.has(v) && a.get(v).points.push(c);
      }
      n.push({ bit: i, islands: [...a.values()], points: [...s.values()], segments: o.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: i } of this.connectivity()) {
      if (i.length < 2) continue;
      const o = /* @__PURE__ */ new Set([0]);
      for (; o.size < i.length; ) {
        let s;
        for (const u of o) for (let r = 0; r < i.length; r++) if (!o.has(r)) for (const l of i[u].points) for (const a of i[r].points) {
          const c = (l.x - a.x) ** 2 + (l.y - a.y) ** 2;
          (!s || c < s.d) && (s = { bit: n, a: l, b: a, d: c, j: r });
        }
        e.push(s), o.add(s.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const s of this.components)
      e.push(s.x - 20, s.x + s.width + 20), n.push(s.y - 20, s.y + s.height + 20);
    for (const s of this.segments)
      e.push(s.a.x - 20, s.b.x + 20), n.push(s.a.y - 20, s.b.y + 20);
    const i = Math.min(...e), o = Math.min(...n);
    return { x: i, y: o, w: Math.max(...e) - i, h: Math.max(...n) - o };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments), ...this.labelOverrides?.length ? { labelOverrides: structuredClone(this.labelOverrides) } : {}, ...this.manualGroups?.length ? { manualGroups: structuredClone(this.manualGroups) } : {} };
  }
  findPath(e, n, i) {
    if (!this.onGrid(n) || !this.onGrid(i)) return null;
    const o = (I) => I.slice(1).every((S, M) => this.validSegment({ a: I[M], b: S }, e));
    for (const I of [[n, i], [n, { x: i.x, y: n.y }, i], [n, { x: n.x, y: i.y }, i]]) {
      const S = yt(I);
      if (o(S)) return S;
    }
    const s = this.step, u = this.bounds(), r = Math.floor(Math.min(u.x, n.x, i.x) / s) - 5, l = Math.ceil(Math.max(u.x + u.w, n.x, i.x) / s) + 5, a = Math.floor(Math.min(u.y, n.y, i.y) / s) - 5, c = Math.ceil(Math.max(u.y + u.h, n.y, i.y) / s) + 5, v = { x: n.x / s, y: n.y / s, dir: -1, cost: 0, key: n.x / s + "," + n.y / s + ",-1" }, b = [v], d = /* @__PURE__ */ new Map([[v.key, 0]]), g = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map([[v.key, v]]), N = [[1, 0], [-1, 0], [0, 1], [0, -1]], y = (I) => Math.abs(I.x - i.x / s) + Math.abs(I.y - i.y / s);
    let w = null, C = 0;
    for (; b.length && C++ < 3e4; ) {
      let I = 0;
      for (let M = 1; M < b.length; M++) b[M].cost + y(b[M]) < b[I].cost + y(b[I]) && (I = M);
      const S = b.splice(I, 1)[0];
      if (S.cost === d.get(S.key)) {
        if (S.x === i.x / s && S.y === i.y / s) {
          w = S;
          break;
        }
        for (let M = 0; M < 4; M++) {
          const B = S.x + N[M][0], E = S.y + N[M][1];
          if (B < r || B > l || E < a || E > c) continue;
          const x = { x: B, y: E, dir: M, key: B + "," + E + "," + M, cost: S.cost + 1 + (S.dir !== -1 && S.dir !== M ? 3 : 0) };
          x.cost >= (d.get(x.key) ?? 1 / 0) || !this.validSegment({ a: { x: S.x * s, y: S.y * s }, b: { x: B * s, y: E * s } }, e) || (d.set(x.key, x.cost), g.set(x.key, S.key), m.set(x.key, x), b.push(x));
        }
      }
    }
    if (!w) return null;
    const _ = [];
    for (let I = w; I; I = m.get(g.get(I.key))) _.push({ x: I.x * s, y: I.y * s });
    return yt(_.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const i = /* @__PURE__ */ new Set();
    let o = 0;
    for (; !e() && o++ < Math.max(20, this.pins().length * 2); ) {
      const s = this.airwires().find((r) => !i.has(r.bit + ":" + de(r.a) + ":" + de(r.b)));
      if (!s) break;
      const u = this.findPath(s.bit, s.a, s.b);
      u ? (this.segments.push(...u.slice(1).map((r, l) => ({ bit: s.bit, a: u[l], b: r }))), this.cache = null) : i.add(s.bit + ":" + de(s.a) + ":" + de(s.b)), o % 3 === 0 && await new Promise((r) => setTimeout(r, 0));
    }
    this.redoStack = [];
  }
}
const dn = "spice-viewer-project", un = 4, fn = 32 * 1024 * 1024, se = (t) => {
  throw Error("Invalid project: " + t);
}, ke = (t) => t && typeof t == "object" && !Array.isArray(t), je = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, Ze = (t) => ke(t) && je(t.x) && je(t.y), Le = (t, e) => Math.abs(t - e) < 1e-3, Je = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function Xt(t) {
  return ke(t) && Ze(t) && je(t.w) && je(t.h) && t.w > 0 && t.h > 0;
}
function $t(t) {
  (!ke(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && se("unsupported drawing settings.");
}
function pn(t) {
  new TextEncoder().encode(t).length > fn && se("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    se("expected a JSON project file.");
  }
  (!ke(e) || e.format !== dn) && se("unrecognized file format."), [1, 2, 3, un].includes(e.version) || se("unsupported project version " + e.version + "."), e.layoutRulesVersion !== tt && se("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && se("missing netlist or sheet."), (!ke(e.libraries) || Object.entries(e.libraries).some(([i, o]) => !i || ["__proto__", "constructor", "prototype"].includes(i) || typeof o != "string")) && se("invalid libraries."), $t(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((i) => typeof e[i] != "boolean") || !Xt(e.view)) && se("invalid display settings."), e.labelEditing !== void 0 && typeof e.labelEditing != "boolean" && se("invalid label editing mode."), (!ke(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((i) => !Array.isArray(e.colors[i]) || e.colors[i].some((o) => !Array.isArray(o) || o.length !== 2 || typeof o[0] != "string" || !/^#[\da-f]{6}$/i.test(o[1])))) && se("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && se("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const i of e.sheets) {
    (!ke(i) || typeof i.scope != "string" || typeof i.topology != "string") && se("invalid sheet identity."), $t(i.settings);
    const o = Je(i.scope, i.topology, i.settings);
    n.has(o) && se("duplicate sheet."), n.add(o), (i.settings.gridSize !== 4 || !i.settings.conventional) && se("saved manual scenes require the fixed 4-unit grid."), i.view !== void 0 && !Xt(i.view) && se("invalid sheet viewport."), i.templateSource !== void 0 && (typeof i.templateSource != "string" || !i.templateSource || i.templateSource === i.scope || i.templateSource.length > 1e4) && se("invalid layout template source."), hn(i.snapshot);
  }
  return e;
}
function Oo(t) {
  const e = { ...t, format: dn, version: un, layoutRulesVersion: tt, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return pn(n), n;
}
function hn(t) {
  (!ke(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && se("invalid scene size."), an(t.labelOverrides), sn(t.manualGroups, t.components);
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!ke(n) || typeof n.id != "string" || e.has(n.id) || !Ze(n) || !je(n.width) || !je(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && se("invalid component geometry."), e.add(n.id);
    const i = /* @__PURE__ */ new Set();
    for (const o of n.ports)
      (!Ze(o) || typeof o.pin != "string" || i.has(o.pin) || !Number.isInteger(o.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(o.side)) && se("invalid pin."), i.add(o.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(je)) && se("invalid symbol transform.");
  }
  for (const n of t.segments) (!ke(n) || !Number.isInteger(n.bit) || !Ze(n.a) || !Ze(n.b) || !Le(n.a.x, n.b.x) && !Le(n.a.y, n.b.y)) && se("wire must be orthogonal.");
}
function ht(t, e, n) {
  hn(e);
  const i = new Map(t.components.map((l) => [l.id, l]));
  i.size !== e.components.length && se("component count changed.");
  const o = e.components.map((l) => {
    const a = i.get(l.id);
    (!a || !!a.decoration != !!l.decoration || a.ports.length !== l.ports.length) && se("component identity changed: " + l.id);
    const c = l.editorMatrix || [1, 0, 0, 1, 0, 0], [v, b, d, g] = c;
    (![v, b, d, g].every((y) => [-1, 0, 1].includes(y)) || v * v + b * b !== 1 || d * d + g * g !== 1 || v * d + b * g !== 0) && se("symbol transform must be a rotation or mirror.");
    const m = [[0, 0], [a.width, 0], [0, a.height], [a.width, a.height]].map(([y, w]) => ({ x: v * y + d * w + c[4], y: b * y + g * w + c[5] }));
    (!Le(Math.min(...m.map((y) => y.x)), 0) || !Le(Math.min(...m.map((y) => y.y)), 0) || !Le(Math.max(...m.map((y) => y.x)), l.width) || !Le(Math.max(...m.map((y) => y.y)), l.height)) && se("symbol dimensions changed: " + l.id);
    const N = l.ports.map((y) => {
      const w = a.ports.find((I) => I.pin === y.pin);
      (!w || w.bit !== y.bit || !Le(y.x, l.x + v * (w.x - a.x) + d * (w.y - a.y) + c[4]) || !Le(y.y, l.y + b * (w.x - a.x) + g * (w.y - a.y) + c[5])) && se("pin connectivity or position changed: " + l.id + "." + y.pin);
      const C = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[w.side], _ = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, I]) => I[0] === v * C[0] + d * C[1] && I[1] === b * C[0] + g * C[1])?.[0];
      return y.side !== _ && se("pin direction changed."), { ...w, x: y.x, y: y.y, side: _ };
    });
    return { ...a, x: l.x, y: l.y, width: l.width, height: l.height, ports: N, ...l.editorMatrix ? { editorMatrix: [...c] } : {} };
  }), s = new cn({ ...t, components: o, segments: e.segments }, { step: n });
  Ye(o, e.manualGroups) && se("manual group boxes overlap other components or groups.");
  for (let l = 0; l < o.length; l++) for (let a = l + 1; a < o.length; a++) {
    const c = o[l], v = o[a];
    c.x < v.x + v.width - 1e-3 && c.x + c.width > v.x + 1e-3 && c.y < v.y + v.height - 1e-3 && c.y + c.height > v.y + 1e-3 && se("component symbols overlap.");
  }
  const u = new Set(s.pins().map((l) => l.bit));
  (s.pins().some((l) => !s.onGrid(l)) || s.segments.some((l) => !u.has(l.bit) || !s.validSegment(l, l.bit))) && se("off-grid wire, symbol collision or short circuit.");
  const r = /* @__PURE__ */ new Map();
  for (const l of s.pins()) {
    const a = l.x + "," + l.y;
    r.has(a) && r.get(a) !== l.bit && se("different nodes share a pin position."), r.set(a, l.bit);
  }
  return { ...s.snapshot(), ...e.labelOverrides?.length ? { labelOverrides: structuredClone(e.labelOverrides) } : {}, ...e.manualGroups?.length ? { manualGroups: structuredClone(e.manualGroups) } : {} };
}
const To = "http://www.w3.org/2000/svg", ue = (t, e = {}) => {
  const n = document.createElementNS(To, t);
  for (const [i, o] of Object.entries(e)) n.setAttribute(i, o);
  return n;
}, Mo = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function At(t, e, n, i) {
  const o = structuredClone(e);
  for (const r of o.components) {
    const l = t.getElementById("cell_" + r.id);
    for (const a of r.ports) {
      const c = [...l.children].find((v) => v.getAttribute("s:pid") === a.pin);
      a.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[c?.getAttribute("s:position")] || a.side;
    }
  }
  for (const [r, l] of Object.entries(i.modules.circuit.cells)) if (l.attributes.name === "0") {
    const a = t.getElementById("cell_" + r), c = a?.transform.baseVal.consolidate().matrix;
    a && c && o.components.push({ id: r, decoration: !0, selectable: !0, x: c.e, y: c.f, width: +a.getAttribute("s:width"), height: +a.getAttribute("s:height"), ports: [...a.children].filter((v) => v.hasAttribute("s:pid")).map((v) => ({ pin: v.getAttribute("s:pid"), x: c.e + Number(v.getAttribute("s:x")), y: c.f + Number(v.getAttribute("s:y")), bit: l.connections[v.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const s = new Map(Object.values(n.nodes).map((r) => [r.name, r.bit])), u = [...t.children].filter((r) => r.localName === "line" && r.hasAttribute("data-net")).map((r) => ({ bit: s.get(r.dataset.net), a: { x: +r.getAttribute("x1"), y: +r.getAttribute("y1") }, b: { x: +r.getAttribute("x2"), y: +r.getAttribute("y2") } }));
  return { ...o, segments: u };
}
function Lo(t, e, { changed: n, inspect: i, getNetColor: o, report: s, applyLayoutTemplate: u }) {
  let r = null, l = null, a = !1, c = !1, v = null, b = null, d = null, g = null, m = /* @__PURE__ */ new Set(), N = 0, y = "", w = 8, C = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map(), S = !1, M = null, B = null, E = null, x = null, H = "";
  const K = ko();
  let $ = "", te = /* @__PURE__ */ new Map(), re = /* @__PURE__ */ new Map();
  const L = (p) => new DOMPoint(p.clientX, p.clientY).matrixTransform(l.getScreenCTM().inverse()), G = (p) => r.snap(L(p)), ee = (p) => o?.(p) || pt[Number(p) % pt.length], z = (p, { severity: k = "info", log: T = !0 } = {}) => {
    e("editor-status").textContent = p, T && s?.({ message: p, severity: k, category: "Tools" });
  };
  function ie() {
    return { unrouted: r?.airwires().length || 0, wires: r?.segments.length || 0, editing: a, routing: c, selectedComponents: S ? [] : [...m], selectedLabels: S ? [...m] : [], labelEditing: S };
  }
  function le(p) {
    if (!p.length) return !1;
    if (!S) return !0;
    const k = p.at(-1);
    return JSON.stringify(k.components) === JSON.stringify(r.components) && JSON.stringify(k.segments) === JSON.stringify(r.segments) && JSON.stringify(k.manualGroups || []) === JSON.stringify(r.manualGroups || []);
  }
  function ne() {
    const p = !!r, k = c || !!$, T = r && !S && st(m, r.manualGroups), D = e("layout-brush"), Y = m.size === 1 && te.has([...m][0]);
    D.disabled = !a || !p || c || S || !$ && (!Y || e("edit-tool").value !== "select"), D.setAttribute("aria-pressed", String(!!$)), D.title = $ ? "Exit layout format brush (Escape)" : "Copy the selected subcircuit's internal layout", e("group").disabled = !a || !p || k || S || m.size < 2, e("group").setAttribute("aria-pressed", String(!!T)), e("group").title = T ? "Ungroup selected components (Ctrl+G or Ctrl+Shift+G)" : "Group selected components (Ctrl+G)", e("group").setAttribute("aria-label", e("group").title);
    for (const j of ["interactive", "flywire", "auto-route"]) e(j).disabled = !l || (j === "interactive" ? c : k) || S && j !== "interactive";
    e("label-edit").disabled = !l || k, e("label-edit").setAttribute("aria-pressed", String(a && S)), e("edit-tool").disabled = !p || k;
    for (const j of document.querySelectorAll("[data-editor-mode]"))
      j.disabled = !l || k || S && ["route", "erase"].includes(j.dataset.editorMode), j.setAttribute("aria-pressed", String(a && j.dataset.editorMode === e("edit-tool").value));
    const F = S ? m.size : r ? Be(r.components, r.manualGroups).filter((j) => j.members.some((V) => m.has(V))).length : 0;
    for (const j of document.querySelectorAll("[data-editor-arrange]")) j.disabled = !a || !p || k || F < (j.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !p || k || !le(r.undoStack), e("wire-redo").disabled = !p || k || !le(r.redoStack), t.classList.toggle("spice-editing", a), t.dataset.toolMode = $ ? "layout-brush" : a ? e("edit-tool").value : "none", t.dataset.labelEditing = String(a && S);
  }
  function Ie(p) {
    const k = JSON.stringify(JSON.parse(y)[2]);
    return [...re].find(([T]) => {
      const D = JSON.parse(T);
      return D[0] === p && JSON.stringify(D[2]) === k;
    })?.[1];
  }
  function we() {
    for (const T of l.querySelectorAll("[data-brush-dimmed]"))
      T.style.removeProperty("opacity"), T.removeAttribute("data-brush-dimmed");
    const p = ue("g", { "data-editor-overlay": "true", "data-layout-brush-layer": "true", "pointer-events": "none" });
    if ($) {
      for (const T of [...l.children]) T.hasAttribute("data-net") && (T.style.opacity = ".18", T.setAttribute("data-brush-dimmed", "true"));
      for (const T of r.components) {
        if (!te.has(T.id)) {
          const Y = l.getElementById("cell_" + T.id);
          Y.style.opacity = ".18", Y.setAttribute("data-brush-dimmed", "true");
          continue;
        }
        const D = T.id === $;
        p.append(ue("rect", { x: T.x - 4, y: T.y - 4, width: T.width + 8, height: T.height + 8, fill: "none", stroke: D ? "#507d9c" : "#65a583", "stroke-width": 2, "vector-effect": "non-scaling-stroke", "data-brush-block": T.id }));
      }
    }
    const k = new DOMParser().parseFromString(Eo, "image/svg+xml").documentElement;
    for (const T of r.components) {
      const D = te.has(T.id) && Ie(te.get(T.id));
      if (!D) continue;
      const Y = ue("g", { "data-layout-template-applied": T.id, transform: "translate(" + (T.x + T.width - 12) + "," + (T.y - 12) + ") scale(.75)", stroke: "#367757", "stroke-width": 2, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }), F = ue("title");
      F.textContent = "Layout copied from " + D, Y.append(F, ue("circle", { cx: 12, cy: 12, r: 12, fill: "white", stroke: "none" }), ...[...k.children].map((j) => j.cloneNode(!0))), p.append(Y);
    }
    Ne(p);
  }
  function Re() {
    if (!r || c || S) return;
    if ($) {
      $ = "", h(), z("Layout format brush cancelled.");
      return;
    }
    const p = m.size === 1 && [...m][0];
    !a || e("edit-tool").value !== "select" || !te.has(p) || ($ = p, v = null, b = null, d = null, h(), z("Choose a target subcircuit block. Escape exits the layout format brush."));
  }
  async function me(p) {
    if (c || p === $) return;
    const k = $, T = N;
    c = !0, ne(), z("Checking subcircuit structures…");
    try {
      if (await u(te.get(k), te.get(p), () => T === N && $ === k), T !== N) return;
      c = !1, h(), z("Layout applied from " + k + " to " + p + ".");
    } catch (D) {
      if (T !== N) return;
      c = !1, h(), z(D.message, { severity: "error" });
    }
  }
  function Ae(p, k) {
    const T = I.get(p.id);
    if (T && (k.replaceChildren(...T.children.map((D) => D.cloneNode(!0))), p.editorMatrix)) {
      const D = p.editorMatrix, Y = ue("g", { transform: "matrix(" + D.join(" ") + ")", "data-editor-glyph": "true" });
      Y.append(...k.childNodes);
      for (const F of Y.querySelectorAll("text")) F.remove();
      k.append(Y);
      for (const [F, j] of T.labels.entries()) {
        const V = j.node.cloneNode(!0);
        V.removeAttribute("transform");
        let J = D[0] * j.x + D[2] * j.y + D[4], Z = D[1] * j.x + D[3] * j.y + D[5];
        if (p.ports.length === 2 && T.labels.length === 2) {
          const ce = Math.abs(p.ports[0].y - p.ports[1].y) < 1e-3;
          J = ce ? p.width / 2 : p.ports[0].x - p.x + 20, Z = ce ? p.ports[0].y - p.y - 26 + F * 16 : p.height / 2 - 8 + F * 16, V.setAttribute("text-anchor", ce ? "middle" : "start");
        }
        V.setAttribute("x", J), V.setAttribute("y", Z), k.append(V);
      }
    }
  }
  function Ee(p) {
    if ($ = "", E = null, v = null, d = null, b = null, M = null, B = null, S && ["route", "erase"].includes(p)) {
      z("Components and wires are locked in label mode.", { severity: "warning" });
      return;
    }
    if (S && ["rotate", "mirror-x", "mirror-y"].includes(p) && m.size) {
      A([...m].map((k) => _o(K.record(k), p))), z(p + " applied to " + m.size + " label(s).");
      return;
    }
    if (!S && ["rotate", "mirror-x", "mirror-y"].includes(p) && st(m, r.manualGroups)) {
      try {
        r.transformGroup(st(m, r.manualGroups).id, p), h(), z("Manual group " + p + " applied.");
      } catch (k) {
        z(k.message, { severity: "error" });
      }
      return;
    }
    if (["rotate", "mirror-x", "mirror-y"].includes(p) && m.size === 1) {
      try {
        r.transform([...m][0], p), h(), z(p + " applied to " + [...m][0] + ".");
      } catch (k) {
        z(k.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = p, r ? (h(), z("Tool: " + p + ".")) : ne();
  }
  function Me() {
    if (!r) return;
    const p = ie();
    z(`${m.size ? m.size + " selected · " : ""}${p.unrouted} connection${p.unrouted === 1 ? "" : "s"} unrouted · ${p.wires} wire segments${c ? " · Auto-routing…" : ""}`, { log: !1 }), ne(), n(r.drawing(), p, r.bounds());
    const k = r.snapshot();
    if (_.has(y) && JSON.stringify(_.get(y)) !== JSON.stringify(k)) {
      const [T, , D] = JSON.parse(y);
      for (const Y of re.keys()) {
        const [F, , j] = JSON.parse(Y);
        (T === F || T.startsWith(F + "/")) && JSON.stringify(D) === JSON.stringify(j) && re.delete(Y);
      }
    }
    _.set(y, k);
  }
  function Ne(p) {
    const k = l.querySelector("[data-airwires]");
    k ? l.insertBefore(p, k) : l.append(p);
  }
  function be() {
    if (l?.querySelector("[data-route-preview]")?.remove(), l?.querySelector("[data-route-guides]")?.remove(), !l) return;
    if (a && e("edit-tool").value === "route" && g) {
      const T = t.getBoundingClientRect(), D = l.getScreenCTM().inverse(), Y = new DOMPoint(T.left, T.top).matrixTransform(D), F = new DOMPoint(T.right, T.bottom).matrixTransform(D), j = ue("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      j.append(ue("line", { x1: Y.x, y1: g.y, x2: F.x, y2: g.y, "vector-effect": "non-scaling-stroke" }), ue("line", { x1: g.x, y1: Y.y, x2: g.x, y2: F.y, "vector-effect": "non-scaling-stroke" })), Ne(j);
    }
    if (!v) return;
    const p = [...v.points];
    if (g) {
      const T = p.at(-1);
      p.push({ x: g.x, y: T.y }, g);
    }
    const k = ue("g", { "data-route-preview": "true", "data-waypoints": v.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    k.append(ue("polyline", { points: p.map((T) => T.x + "," + T.y).join(" "), fill: "none", stroke: ee(v.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Ne(k);
  }
  function ge() {
    if (l?.querySelector("[data-selection-box]")?.remove(), !d || !l) return;
    const p = d.start, k = d.end, T = k.x < p.x;
    Ne(ue("rect", { x: Math.min(p.x, k.x), y: Math.min(p.y, k.y), width: Math.abs(p.x - k.x), height: Math.abs(p.y - k.y), fill: T ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: T ? "#4c9675" : "#507d9c", "stroke-dasharray": T ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": T ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function h() {
    if (!l || !r) return;
    for (const F of l.querySelectorAll("[data-editor-body-hit]")) F.remove();
    for (const F of [...l.children]) (F.hasAttribute("data-editor-overlay") || F.hasAttribute("data-airwires") || F.hasAttribute("data-manual-state") || F.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(F.localName)) && F.remove();
    for (const F of r.components) {
      const j = l.getElementById("cell_" + F.id);
      j && (j.style.removeProperty("opacity"), Ae(F, j), j.setAttribute("s:width", F.width), j.setAttribute("s:height", F.height), j.setAttribute("transform", `translate(${F.x},${F.y})`), j.dataset.editorComponent = F.id, a && !S && j.prepend(ue("rect", { x: 0, y: 0, width: F.width, height: F.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    if (a && !c && !S) {
      const F = ue("g", { "data-editor-overlay": "true", "data-manual-group-layer": "true" });
      for (const j of Be(r.components, r.manualGroups).filter((V) => V.groupId)) {
        const V = j.members.every((J) => m.has(J));
        F.append(ue("rect", { x: j.x, y: j.y, width: j.width, height: j.height, fill: "transparent", stroke: V ? "#507d9c" : "#89958c", "stroke-width": V ? 1.5 : 0.8, "stroke-dasharray": "5 3", "vector-effect": "non-scaling-stroke", "pointer-events": ["route", "erase"].includes(e("edit-tool").value) ? "none" : "all", "data-editor-group": j.groupId }));
      }
      l.insertBefore(F, l.querySelector('g[id^="cell_"]'));
    }
    const p = l.querySelector('g[id^="cell_"]'), k = ue("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), T = ue("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [F, j] of r.segments.entries()) {
      const V = ue("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, class: "net_" + j.bit, "data-net": C.get(j.bit) || String(j.bit), "stroke-width": 1.4 });
      V.append(ue("title")), V.firstChild.textContent = "Node " + (C.get(j.bit) || j.bit), l.insertBefore(V, p), a && !S && ["route", "erase"].includes(e("edit-tool").value) && k.append(ue("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, "data-editor-wire": F, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const F of r.connectivity()) for (const j of F.points) {
      const V = /* @__PURE__ */ new Set();
      for (const J of F.segments) Ce(j, J) && (Math.min(J.a.x, J.b.x) < j.x - 1e-3 && V.add("w"), Math.max(J.a.x, J.b.x) > j.x + 1e-3 && V.add("e"), Math.min(J.a.y, J.b.y) < j.y - 1e-3 && V.add("n"), Math.max(J.a.y, J.b.y) > j.y + 1e-3 && V.add("s"));
      (V.size >= 3 || V.size >= 2 && F.islands.some((J) => J.pins.some((Z) => Mo(j, Z)))) && l.insertBefore(ue("circle", { cx: j.x, cy: j.y, r: 2, class: "net_" + F.bit, "data-net": C.get(F.bit) || String(F.bit), fill: ee(F.bit) }), p);
    }
    if (a && !S) {
      for (const F of r.components.filter((j) => m.has(j.id))) k.append(ue("rect", { x: F.x - 3, y: F.y - 3, width: F.width + 6, height: F.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": F.id }));
      for (const F of r.pins()) {
        const j = ue("circle", { cx: F.x, cy: F.y, r: 3, "data-editor-pin": F.id, "data-editor-bit": F.bit, fill: "#fff", stroke: ee(F.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": F.owner + " " + F.pin }), V = ue("title");
        V.textContent = F.id + " · " + (C.get(F.bit) || F.bit), j.append(V), T.append(j);
      }
      l.append(k, T);
    }
    be();
    const D = ue("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const F of r.airwires()) D.append(ue("line", { x1: F.a.x, y1: F.a.y, x2: F.b.x, y2: F.b.y, stroke: ee(F.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": F.bit, "data-from-owner": F.a.owner || "", "data-to-owner": F.b.owner || "" }));
    l.append(D);
    const Y = ue("metadata", { "data-manual-state": "true" });
    Y.textContent = JSON.stringify({ version: 1, grid: w, unrouted: r.airwires().length, manual: !0 }), l.insertBefore(Y, D), we(), Me();
  }
  function f(p, k) {
    if (!v) {
      v = { bit: k, points: [p], checkpoints: [] }, be(), z("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (k !== void 0 && v.bit !== k) {
      z("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const T = v.points.at(-1), D = r.findPath(v.bit, T, p);
    if (!D) {
      z("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (k === void 0) {
      D.length > 1 && (v.checkpoints.push(v.points.length), v.points.push(...D.slice(1))), be(), z("Waypoint " + v.checkpoints.length + " confirmed.");
      return;
    }
    try {
      r.addPath(k, [...v.points, ...D.slice(1)]), v = null, h(), z("Connection added.");
    } catch (Y) {
      z(Y.message, { severity: "error" });
    }
  }
  function R(p = !1) {
    if (!(!r || c || S))
      try {
        if (p || st(m, r.manualGroups))
          r.ungroup(m) && z("Manual group removed.");
        else {
          const k = r.group(m);
          m = new Set(k.members), z("Grouped " + k.members.length + " components for manual editing.");
        }
        h();
      } catch (k) {
        z(k.message, { severity: "error" });
      }
  }
  function A(p, k = []) {
    const T = new Map((r.labelOverrides || []).map((D) => [D.id, D]));
    for (const D of k) T.delete(D);
    for (const D of p) T.set(D.id, D);
    if (JSON.stringify([...T.values()]) === JSON.stringify(r.labelOverrides || [])) {
      h();
      return;
    }
    r.remember(), r.labelOverrides = structuredClone([...T.values()]), h();
  }
  function oe(p) {
    A(p.map((k) => {
      const T = K.record(k.id);
      return { ...T, x: T.x + k.dx, y: T.y + k.dy };
    }));
  }
  function O(p) {
    r && (E = null, S = p, m.clear(), v = null, b = null, d = null, M = null, B = null, e("edit-tool").value = "select", h(), z(p ? "Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text." : "Label editing disabled."));
  }
  function P(p) {
    if (!r) return;
    const k = p ? r.redoStack : r.undoStack;
    if (!le(k)) {
      z(S ? "No label edit to " + (p ? "redo." : "undo.") : "No edit to " + (p ? "redo." : "undo."));
      return;
    }
    v = null, b = null, d = null, M = null, B = null, p ? r.redo() : r.undo(), h(), z(p ? "Redo." : "Undo.");
  }
  function Q(p) {
    x = null, H = p, e("label-text").value = K.record(p).text, e("label-dialog").showModal(), e("label-text").focus(), e("label-text").select();
  }
  e("close-label").onclick = () => e("label-dialog").close(), e("label-dialog").addEventListener("close", () => t.focus({ preventScroll: !0 })), e("app").addEventListener("spice:workspacechange", () => {
    e("label-dialog").open && e("label-dialog").close();
  }), e("label-form").onsubmit = (p) => {
    p.preventDefault();
    const k = K.record(H), T = e("label-text").value;
    e("label-dialog").close(), A([{ ...k, text: T }]), z("Display text updated. SPICE source unchanged.");
  }, e("label-reset").onclick = () => {
    const p = H;
    e("label-dialog").close(), A([], [p]), z("Label reset to automatic placement and original text.");
  }, t.addEventListener("pointerdown", (p) => {
    if (!$ || !l || p.button !== 0 || p.shiftKey || (p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), c)) return;
    const k = p.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
    te.has(k) && me(k);
  }, { capture: !0 }), t.addEventListener("keydown", (p) => {
    if ($ && (p.key === "Enter" || p.key === " ")) {
      p.preventDefault(), p.stopImmediatePropagation();
      const k = p.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
      te.has(k) && me(k);
    }
  }, { capture: !0 }), t.addEventListener("pointerdown", (p) => {
    if (!S || !a || c || !r || p.button !== 0) return;
    if (p.shiftKey) {
      x = null;
      return;
    }
    x = p.pointerId, p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 });
    const k = p.target.closest("[data-editor-label]"), T = k?.getAttribute("data-editor-label"), D = e("edit-tool").value, Y = T && E?.id === T && p.timeStamp - E.time < 450 && Math.hypot(p.clientX - E.x, p.clientY - E.y) < 5;
    if (E = T ? { id: T, time: p.timeStamp, x: p.clientX, y: p.clientY } : null, Y) {
      E = null, M = null, m = /* @__PURE__ */ new Set([T]), h(), Q(T);
      return;
    }
    if (D === "box") {
      B = { start: L(p), end: L(p), additive: p.ctrlKey || p.metaKey }, t.setPointerCapture(p.pointerId), d = B, ge(), d = null;
      return;
    }
    if (!T) {
      m.clear(), h();
      return;
    }
    if (p.ctrlKey || p.metaKey) {
      m.has(T) ? m.delete(T) : m.add(T), h();
      return;
    }
    if ((D !== "move" || !m.has(T)) && (m = /* @__PURE__ */ new Set([T])), ["rotate", "mirror-x", "mirror-y"].includes(D)) {
      Ee(D);
      return;
    }
    h(), D === "move" && (M = { start: L(p), dx: 0, dy: 0 }, t.setPointerCapture(p.pointerId));
  }, { capture: !0 }), t.addEventListener("pointermove", (p) => {
    if (!(!S || !a || !r) && (B && (p.stopImmediatePropagation(), B.end = L(p), d = B, ge(), d = null), M)) {
      p.stopImmediatePropagation();
      const k = L(p), T = r.snap({ x: k.x - M.start.x, y: k.y - M.start.y });
      M.dx = T.x, M.dy = T.y, (T.x || T.y) && (E = null), K.preview([...m].map((D) => ({ id: D, dx: T.x, dy: T.y })));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (p) => {
    if (!(!S || x !== p.pointerId)) {
      if (x = null, p.stopImmediatePropagation(), t.hasPointerCapture(p.pointerId) && t.releasePointerCapture(p.pointerId), B) {
        const k = B;
        B = null;
        const T = qt(K.nodes(), k.start, L(p));
        m = k.additive ? /* @__PURE__ */ new Set([...m, ...T]) : new Set(T), h(), z(m.size + " label(s) selected.");
      }
      if (M) {
        const k = M;
        M = null, k.dx || k.dy ? (oe([...m].map((T) => ({ id: T, dx: k.dx, dy: k.dy }))), z("Moved " + m.size + " label(s).")) : h();
      }
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    S && (M = null, B = null, h());
  }), t.addEventListener("dblclick", (p) => {
    if (!S) return;
    p.preventDefault(), p.stopImmediatePropagation();
    const k = L(p), T = p.target.closest("[data-editor-label]")?.getAttribute("data-editor-label") || K.nodes().findLast((D) => k.x >= D.x - 2 && k.x <= D.x + Math.max(8, D.width) + 2 && k.y >= D.y - 2 && k.y <= D.y + Math.max(12, D.height) + 2)?.id;
    T && Q(T);
  }, { capture: !0 }), t.addEventListener("pointerdown", (p) => {
    if (S || !a || c || !r || !l || p.button !== 0 || p.shiftKey) return;
    const k = e("edit-tool").value, T = p.target.closest("[data-editor-pin]"), D = p.target.closest("[data-editor-wire]"), Y = T && r.pins().find((Z) => Z.id === T.dataset.editorPin), F = p.target.closest("[data-editor-group]"), j = F ? r.manualGroups?.find((Z) => Z.id === F.getAttribute("data-editor-group")) : r.manualGroups?.length ? Be(r.components, r.manualGroups).find((Z) => {
      if (!Z.groupId) return !1;
      const ce = L(p);
      return ce.x >= Z.x && ce.x <= Z.x + Z.width && ce.y >= Z.y && ce.y <= Z.y + Z.height;
    }) : null, V = p.target.closest("[data-editor-component]") || Y && l.getElementById("cell_" + Y.owner) || j && l.getElementById("cell_" + j.members[0]), J = V && r.components.find((Z) => Z.id === V.dataset.editorComponent && mt(Z));
    if (k === "box") {
      p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), d = { start: L(p), end: L(p), additive: p.ctrlKey || p.metaKey }, t.setPointerCapture(p.pointerId), ge();
      return;
    }
    if (k === "route" || k === "erase") {
      if (p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), g = G(p), k === "erase") {
        D && (r.remove(+D.dataset.editorWire), h(), z("Wire segment erased."));
        return;
      }
      if (Y) {
        f({ x: Y.x, y: Y.y }, Y.bit);
        return;
      }
      if (D) {
        const Z = r.segments[+D.dataset.editorWire], ce = G(p);
        f(Z.a.x === Z.b.x ? { x: Z.a.x, y: ce.y } : { x: ce.x, y: Z.a.y }, Z.bit);
        return;
      }
      v ? f(G(p)) : be();
      return;
    }
    if (!J) {
      m.size && (m.clear(), h());
      return;
    }
    if (p.preventDefault(), p.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), i?.(J.id, J), p.ctrlKey || p.metaKey) {
      const Z = kt([J.id], r.manualGroups), ce = [...Z].every((fe) => m.has(fe));
      for (const fe of Z) ce ? m.delete(fe) : m.add(fe);
      h();
      return;
    }
    if ((k !== "move" || !m.has(J.id)) && (m = kt([J.id], r.manualGroups)), ["rotate", "mirror-x", "mirror-y"].includes(k)) {
      Ee(k);
      return;
    }
    if (h(), k === "move") {
      b = { entries: r.components.filter((Z) => m.has(Z.id)).map((Z) => ({ n: Z, element: l.getElementById("cell_" + Z.id) })), start: L(p), dx: 0, dy: 0 };
      for (const Z of b.entries) Z.element.style.opacity = ".6";
      t.setPointerCapture(p.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (p) => {
    if (!(S || !a || !r || !l)) {
      if (g = G(p), d) {
        p.stopImmediatePropagation(), d.end = L(p), ge();
        return;
      }
      if (b) {
        p.stopImmediatePropagation();
        const k = L(p), T = r.snap({ x: k.x - b.start.x, y: k.y - b.start.y });
        b.dx = T.x, b.dy = T.y;
        for (const { n: D, element: Y } of b.entries) {
          Y.setAttribute("transform", `translate(${D.x + T.x},${D.y + T.y})`);
          const F = l.querySelector('[data-selected-component="' + CSS.escape(D.id) + '"]');
          F && (F.setAttribute("x", D.x + T.x - 3), F.setAttribute("y", D.y + T.y - 3));
        }
        for (const D of r.manualGroups || []) D.members.every((Y) => m.has(Y)) && l.querySelector("[data-editor-group=" + JSON.stringify(D.id) + "]")?.setAttribute("transform", `translate(${T.x},${T.y})`);
        for (const D of l.querySelectorAll("[data-airwires] line"))
          m.has(D.dataset.fromOwner) && (D.setAttribute("x1", +D.getAttribute("x1") - Number(D.dataset.dx || 0) + T.x), D.setAttribute("y1", +D.getAttribute("y1") - Number(D.dataset.dy || 0) + T.y)), m.has(D.dataset.toOwner) && (D.setAttribute("x2", +D.getAttribute("x2") - Number(D.dataset.dx || 0) + T.x), D.setAttribute("y2", +D.getAttribute("y2") - Number(D.dataset.dy || 0) + T.y)), D.dataset.dx = T.x, D.dataset.dy = T.y;
        return;
      }
      e("edit-tool").value === "route" && be();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (p) => {
    if (!d && !b) return;
    if (p.preventDefault(), p.stopImmediatePropagation(), t.hasPointerCapture(p.pointerId) && t.releasePointerCapture(p.pointerId), d) {
      const T = d;
      d = null;
      const D = Be(r.components, r.manualGroups), Y = qt(D, T.start, L(p)), F = D.filter((j) => Y.includes(j.id)).flatMap((j) => j.members);
      m = T.additive ? /* @__PURE__ */ new Set([...m, ...F]) : new Set(F), h(), z(m.size + " symbol(s) selected.");
      return;
    }
    const k = b;
    b = null;
    for (const T of k.entries) T.element.style.opacity = "";
    try {
      const T = r.moveMany(k.entries.map(({ n: D }) => ({ id: D.id, dx: k.dx, dy: k.dy })));
      h(), T && z("Moved " + k.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (T) {
      h(), z(T.message, { severity: "error" });
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (b || d) && (b = null, d = null, h());
  }), t.addEventListener("pointerleave", () => {
    !b && !d && (g = null, be());
  }), t.addEventListener("wheel", (p) => {
    requestAnimationFrame(() => {
      a && r && l && e("edit-tool").value === "route" && (g = G(p), be());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (p) => {
    if (e("download-dialog").open || e("label-dialog").open || e("clear-wires-dialog").open || e("upload-dialog").open || !a || !r || c || p.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(p.target)) return;
    if ($) {
      p.key === "Escape" && (p.preventDefault(), p.stopImmediatePropagation(), Re());
      return;
    }
    const k = p.target.closest("[data-editor-pin]"), T = p.key.toLowerCase();
    if ((p.ctrlKey || p.metaKey) && T === "g") {
      p.preventDefault(), p.stopImmediatePropagation(), R(p.shiftKey);
      return;
    }
    if (T === "t" && !p.ctrlKey && !p.metaKey && !p.altKey) {
      p.preventDefault(), p.stopImmediatePropagation(), O(!S);
      return;
    }
    if (S && p.key === "Enter" && m.size === 1) {
      p.preventDefault(), p.stopImmediatePropagation(), Q([...m][0]);
      return;
    }
    if (k && e("edit-tool").value === "route" && (p.key === "Enter" || p.key === " ")) {
      p.preventDefault(), p.stopImmediatePropagation();
      const D = r.pins().find((Y) => Y.id === k.dataset.editorPin);
      f({ x: D.x, y: D.y }, D.bit);
      return;
    }
    if (p.key === "Backspace" && e("edit-tool").value === "route") {
      if (p.preventDefault(), p.stopImmediatePropagation(), v) {
        const D = v.checkpoints.pop();
        D === void 0 ? v = null : v.points.length = D, be(), z(v ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    if (p.key === "Escape")
      p.preventDefault(), p.stopImmediatePropagation(), v = null, b = null, d = null, Ee("select");
    else if ((p.ctrlKey || p.metaKey) && T === "z") {
      p.preventDefault(), p.stopImmediatePropagation(), P(p.shiftKey);
      return;
    } else !p.ctrlKey && !p.metaKey && !p.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[T] && (p.preventDefault(), p.stopImmediatePropagation(), Ee({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[T]));
  }, { capture: !0 });
  function q(p) {
    if (!(!r || c)) {
      v = null, b = null, d = null, e("edit-tool").value = "select";
      try {
        const k = S ? K.nodes() : Be(r.components, r.manualGroups), T = S ? m : new Set(k.filter((F) => F.members.some((j) => m.has(j))).map((F) => F.id)), { moves: D, rounded: Y } = No(k, T, p, w);
        S ? oe(D) : r.moveMany(D.flatMap((F) => k.find((j) => j.id === F.id).members.map((j) => ({ id: j, dx: F.dx, dy: F.dy })))), h(), z(`${m.size} ${S ? "labels" : "components"} arranged.${Y ? " Centers or gaps rounded to the " + w + "-unit pin grid." : ""}${S ? "" : " Detached connections remain flywires."}`);
      } catch (k) {
        h(), z(k.message, { severity: "error" });
      }
    }
  }
  async function X() {
    if (!r || c || S) return;
    const p = N;
    c = !0, Me(), z("Auto-routing remaining connections…");
    try {
      if (await r.autoRoute(() => p !== N), p === N) {
        v = null, c = !1, h();
        const k = r.airwires().length;
        z(k ? "Auto-routing finished: " + k + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: k ? "warning" : "info" });
      }
    } catch (k) {
      p === N && (c = !1, h(), z(k.message, { severity: "error" }));
    }
  }
  return {
    mount(p, k, T, D, Y, { reset: F = !1, scope: j = "" } = {}) {
      N++, c = !1, $ = "", te = new Map(T.components.filter((Z) => Z.block).map((Z) => [Z.name, Z.instanceId])), l = p, v = null, b = null, d = null, g = null, m.clear(), I = /* @__PURE__ */ new Map();
      for (const Z of l.querySelectorAll('g[id^="cell_"]')) {
        const ce = Z.getCTM().inverse();
        I.set(Z.id.slice(5), { children: [...Z.childNodes].map((fe) => fe.cloneNode(!0)), labels: [...Z.querySelectorAll("text")].map((fe) => {
          const Oe = new DOMPoint(+fe.getAttribute("x") || 0, +fe.getAttribute("y") || 0).matrixTransform(ce.multiply(fe.getCTM()));
          return { node: fe.cloneNode(!0), x: Oe.x, y: Oe.y };
        }) });
      }
      if (w = Y.gridSize || 0, C = new Map(Object.values(T.nodes).map((Z) => [Z.bit, Z.name])), !k || !w) {
        r = null, ne();
        return;
      }
      const V = At(l, k, T, D), J = V.segments;
      r = new cn(V, { step: w, segments: J }), y = Je(j, T.topology.signature, Y), !F && _.has(y) && (It(l, _.get(y).labelOverrides), r.restore(ht({ ...V, segments: J }, _.get(y), w))), a = e("interactive").getAttribute("aria-pressed") === "true", a || !F && _.has(y) ? h() : ne();
    },
    invalidate() {
      $ = "", te.clear(), E = null, M = null, B = null, e("label-dialog").open && e("label-dialog").close(), r && !c && _.set(y, r.snapshot()), N++, c = !1, r = null, l = null, v = null, b = null, d = null, g = null, m.clear(), ne();
    },
    snapshotSheets() {
      return r && !c && _.set(y, r.snapshot()), [..._].map(([p, k]) => {
        const [T, D, Y] = JSON.parse(p);
        return { scope: T, topology: D, settings: Y, snapshot: structuredClone(k), ...re.has(p) ? { templateSource: re.get(p) } : {} };
      });
    },
    restoreSheets(p) {
      re = new Map(p.filter((k) => k.templateSource).map((k) => [Je(k.scope, k.topology, k.settings), k.templateSource])), _ = new Map(p.map((k) => [Je(k.scope, k.topology, k.settings), structuredClone(k.snapshot)]));
    },
    clearSheets() {
      _.clear(), re.clear();
    },
    saveTemplateSheet(p) {
      const k = Je(p.scope, p.topology, p.settings);
      _.set(k, structuredClone(p.snapshot)), re.set(k, p.templateSource);
    },
    setEnabled(p) {
      a = p, p || ($ = ""), p || (e("edit-tool").value = "select", S = !1, M = null, B = null, v = null, b = null, d = null, g = null, m.clear()), r ? h() : ne();
    },
    clear() {
      r && !S && (r.clear(), v = null, h(), z("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: X,
    chooseTool: Ee,
    arrange: q,
    toggleGroup: R,
    toggleLayoutBrush: Re,
    layoutBrushActive: () => !!$,
    setLabelEditing: O,
    labelEditing: () => S,
    resetLabelDisplay: () => K.reset(),
    placeLabels: () => l && r ? K.layout(l, r.components, r.labelOverrides, a && S, m) : null,
    undo: () => P(!1),
    redo: () => P(!0),
    complete() {
      return !r || !c && r.airwires().length === 0;
    },
    working() {
      return c;
    },
    stats: ie,
    canEdit() {
      return !!r;
    },
    refreshControls: ne,
    refreshColors() {
      if (l) {
        for (const p of l.querySelectorAll("[data-air-net]")) p.setAttribute("stroke", ee(+p.dataset.airNet));
        for (const p of l.querySelectorAll("[data-editor-bit]")) p.setAttribute("stroke", ee(+p.dataset.editorBit));
      }
    },
    cleanExport(p) {
      for (const k of p.querySelectorAll("[data-brush-dimmed]"))
        k.style.removeProperty("opacity"), k.removeAttribute("data-brush-dimmed");
      for (const k of p.querySelectorAll("[data-label-id]")) k.removeAttribute("data-label-id");
      for (const k of p.querySelectorAll("[data-editor-overlay],[data-route-preview]")) k.remove();
      for (const k of p.querySelectorAll("[data-editor-component]"))
        k.removeAttribute("data-editor-component"), k.style.removeProperty("opacity");
    }
  };
}
function Kt(t, e) {
  const n = /* @__PURE__ */ new Map(), i = (o, s, u) => {
    if (!n.has(o) || !n.has(s)) throw Error("Layout template has an unresolved control/reference.");
    n.get(o).edges.push([s, ">" + u]), n.get(s).edges.push([o, "<" + u]);
  };
  for (const o of Object.values(t.nodes)) n.set("n:" + o.name, { id: o.name, kind: "net", label: "net:" + (e.has(o.name) ? o.name : ""), edges: [] });
  for (const o of t.components) {
    const s = Object.keys(o.terminals).sort();
    n.set("c:" + o.name, { id: o.name, kind: "cell", component: o, label: JSON.stringify([o.kind, s, o.synthetic ? Number(o.name.split("/").at(-1)) : null]), edges: [] });
  }
  for (const o of t.components) {
    const s = "c:" + o.name;
    for (const [r, l] of Object.entries(o.terminals)) i(s, "n:" + l, "pin:" + r);
    for (const [r, l] of (o.controlSources || []).entries()) i(s, "c:" + l, "control:" + r);
    for (const [r, l] of (o.coupledInductors || []).entries()) i(s, "c:" + l, "coupled:" + r);
    let u = 0;
    for (const r of (o.value || "").matchAll(/\b(V|I|Ix)\s*\(([^()]+)\)/gi)) {
      const l = r[1].toLowerCase();
      for (const [a, c] of r[2].split(",").map((v) => v.trim()).entries()) i(s, (l === "v" ? "n:" : "c:") + c, "expression:" + l + ":" + u + ":" + a);
      u++;
    }
  }
  return n;
}
function Ro(t, e, n, i) {
  if (t.size !== e.size) return null;
  const o = [...t.values(), ...e.values()];
  let s = new Map(o.map((g) => [g, g.label]));
  for (let g = 0; g < o.length; g++) {
    if (performance.now() > i.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    const m = new Array(o.length);
    for (let C = 0; C < o.length; C++) {
      const _ = o[C], I = C < t.size ? t : e;
      m[C] = JSON.stringify([s.get(_), _.edges.map(([S, M]) => [M, s.get(I.get(S))]).sort((S, M) => JSON.stringify(S).localeCompare(JSON.stringify(M)))]);
    }
    const N = new Map([...new Set(m)].sort().map((C, _) => [C, _])), y = new Map(o.map((C, _) => [C, N.get(m[_])])), w = new Set(s.values()).size;
    if (s = y, N.size === w) break;
  }
  const u = (g) => {
    const m = /* @__PURE__ */ new Map();
    for (const [N, y] of g) {
      const w = s.get(y);
      m.has(w) || m.set(w, []), m.get(w).push(N);
    }
    return m;
  }, r = u(t), l = u(e);
  if ([...r].some(([g, m]) => m.length !== l.get(g)?.length)) return null;
  const a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set(), v = (g, m, N) => g.get(m).edges.filter(([y]) => y === N).map(([, y]) => y).sort().join("|"), b = (g, m) => {
    if (v(t, g, g) !== v(e, m, m)) return !1;
    for (const [N, y] of a) if (v(t, g, N) !== v(e, m, y)) return !1;
    return n(t.get(g), e.get(m));
  };
  function d() {
    if (--i.states < 0 || performance.now() > i.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    if (a.size === t.size) return !0;
    let g, m;
    for (const [y, w] of t) {
      if (a.has(y)) continue;
      const C = l.get(s.get(w)).filter((_) => !c.has(_) && b(y, _));
      if (!C.length) return !1;
      if ((!m || C.length < m.length) && (g = y, m = C, C.length === 1))
        break;
    }
    const N = (y) => y.split("/").at(-1);
    m.sort((y, w) => (N(w) === N(g)) - (N(y) === N(g)) || y.localeCompare(w));
    for (const y of m) {
      if (a.set(g, y), c.add(y), d()) return !0;
      a.delete(g), c.delete(y);
    }
    return !1;
  }
  return d() ? a : null;
}
function Po(t, e, n, { maxStates: i = 5e4, timeout: o = 1500 } = {}) {
  if (!e || !n || e === n || !t.contexts[e] || !t.contexts[n]) throw Error("Choose two different subcircuit blocks.");
  const s = new Set(t.ir.globals.map((g) => dt([], g))), u = { states: i, deadline: performance.now() + o }, r = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), a = (g) => (l.has(g) || l.set(g, $e(t, { focus: g })), l.get(g)), c = (g, m) => {
    const N = JSON.stringify([g, m]);
    if (r.has(N)) return r.get(N);
    const y = a(g), w = a(m), C = Kt(y, s), _ = Kt(w, s), I = Ro(C, _, (S, M) => S.kind !== "cell" || !S.component.block || !!c(S.component.instanceId, M.component.instanceId), u);
    return r.set(N, I), I;
  };
  if (!c(e, n)) throw Error("Subcircuit structures differ; no layout was changed.");
  const b = [];
  function d(g, m) {
    const N = a(g), y = a(m), w = r.get(JSON.stringify([g, m])), C = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
    for (const [I, S] of w) I.startsWith("c:") ? C.set(I.slice(2), S.slice(2)) : _.set(N.nodes[I.slice(2)].bit, y.nodes[S.slice(2)].bit);
    b.push({ source: g, target: m, sourceCircuit: N, targetCircuit: y, components: C, bits: _ });
    for (const I of N.components.filter((S) => S.block)) d(I.instanceId, y.components.find((S) => S.name === C.get(I.name)).instanceId);
  }
  return d(e, n), { ...b[0], instances: b };
}
function Do(t, e, n, { targetLabels: i = /* @__PURE__ */ new Map(), targetOverrides: o = [] } = {}) {
  const s = new Map(n.components), u = new Map(e.components.map((c) => [c.id, c])), r = new Map(o.map((c) => [c.id, c.text]));
  for (const c of t.components.filter((v) => v.decoration)) {
    const v = n.bits.get(c.ports[0]?.bit), b = e.components.find((d) => d.decoration && d.ports[0]?.bit === v);
    if (!b) throw Error("Template and target ground symbols differ.");
    s.set(c.id, b.id);
  }
  const a = { components: t.components.map((c) => {
    const v = s.get(c.id), b = u.get(v);
    if (!b) throw Error("Template and target symbols differ.");
    const d = [c.editorMatrix || [1, 0, 0, 1, 0, 0], ...[1, -1].flatMap((y) => [1, -1].flatMap((w) => [[y, 0, 0, w, y < 0 ? b.width : 0, w < 0 ? b.height : 0], [0, y, w, 0, w < 0 ? b.height : 0, y < 0 ? b.width : 0]]))], g = { NORTH: [0, -1], SOUTH: [0, 1], WEST: [-1, 0], EAST: [1, 0] }, m = (y, w) => Math.abs(y - w) < 1e-3, N = d.find((y) => {
      const w = [[0, 0], [b.width, 0], [0, b.height], [b.width, b.height]].map(([C, _]) => [y[0] * C + y[2] * _ + y[4], y[1] * C + y[3] * _ + y[5]]);
      return !m(Math.min(...w.map((C) => C[0])), 0) || !m(Math.min(...w.map((C) => C[1])), 0) || !m(Math.max(...w.map((C) => C[0])), c.width) || !m(Math.max(...w.map((C) => C[1])), c.height) ? !1 : c.ports.every((C) => {
        const _ = b.ports.find((E) => E.pin === C.pin);
        if (!_) return !1;
        const [I, S] = g[_.side], [M, B] = g[C.side];
        return m(c.x + y[0] * (_.x - b.x) + y[2] * (_.y - b.y) + y[4], C.x) && m(c.y + y[1] * (_.x - b.x) + y[3] * (_.y - b.y) + y[5], C.y) && y[0] * I + y[2] * S === M && y[1] * I + y[3] * S === B;
      });
    });
    if (!N) throw Error("Subcircuits are topologically identical, but target symbol geometry cannot fit the template: " + v + ". No layout was changed.");
    return { ...b, x: c.x, y: c.y, width: c.width, height: c.height, ports: c.ports.map((y) => ({ ...y, bit: n.bits.get(y.bit) })), ...!N.every((y, w) => y === [1, 0, 0, 1, 0, 0][w]) || c.editorMatrix ? { editorMatrix: N } : {} };
  }), segments: t.segments.map((c) => ({ ...c, bit: n.bits.get(c.bit), a: { ...c.a }, b: { ...c.b } })) };
  return t.manualGroups?.length && (a.manualGroups = t.manualGroups.map((c) => ({ ...c, members: c.members.map((v) => s.get(v)) }))), t.labelOverrides?.length && (a.labelOverrides = t.labelOverrides.flatMap((c) => {
    const v = s.get(c.owner);
    if (!v) return [];
    const b = gt(v, c.index), d = r.get(b) ?? i.get(b);
    if (d === void 0) throw Error("Template and target label slots differ.");
    return [{ ...c, id: b, owner: v, text: d, orientation: [...c.orientation] }];
  })), ht(e, a, 4);
}
const Ot = 4, at = "http://www.w3.org/2000/svg";
function lt(t, e, n = !0, i = null) {
  let o = t.querySelector("defs[data-coordinate-grid]"), s = t.querySelector("rect[data-coordinate-grid]");
  if (!o) {
    o = document.createElementNS(at, "defs"), o.dataset.coordinateGrid = "true";
    const d = document.createElementNS(at, "pattern");
    d.id = "spice-coordinate-grid", d.setAttribute("patternUnits", "userSpaceOnUse");
    const g = document.createElementNS(at, "path");
    g.setAttribute("fill", "none"), g.setAttribute("stroke", "#737b83"), g.setAttribute("stroke-opacity", ".38"), g.setAttribute("stroke-width", ".55"), g.setAttribute("vector-effect", "non-scaling-stroke"), d.append(g), o.append(d), s = document.createElementNS(at, "rect"), s.dataset.coordinateGrid = "true", s.setAttribute("fill", "url(#spice-coordinate-grid)"), s.setAttribute("stroke", "none"), s.setAttribute("pointer-events", "none"), t.prepend(s), t.prepend(o);
  }
  const u = o.firstElementChild, r = e || 8;
  u.setAttribute("width", r), u.setAttribute("height", r), u.firstElementChild.setAttribute("d", `M${r},0 H0 V${r}`), s.setAttribute("visibility", n && e ? "visible" : "hidden");
  let l = u.querySelector("[data-minor-grid]");
  l || (l = u.firstElementChild.cloneNode(), l.setAttribute("data-minor-grid", "true"), l.setAttribute("stroke-opacity", ".16"), u.append(l));
  const a = [];
  for (let d = Ot; d < r; d += Ot) a.push(`M${d},0 V${r} M0,${d} H${r}`);
  l.setAttribute("d", a.join(" ")), t.dataset.displayGridStep = String(r);
  let c = i;
  const v = t.closest(".spice-preview"), b = t.isConnected && v ? t.getScreenCTM() : null;
  if (b) {
    const d = v.getBoundingClientRect(), g = b.inverse(), m = [[d.left - 1, d.top - 1], [d.right + 1, d.top - 1], [d.right + 1, d.bottom + 1], [d.left - 1, d.bottom + 1]].map(([w, C]) => new DOMPoint(w, C).matrixTransform(g)), N = Math.min(...m.map((w) => w.x)), y = Math.min(...m.map((w) => w.y));
    c = { x: N, y, w: Math.max(...m.map((w) => w.x)) - N, h: Math.max(...m.map((w) => w.y)) - y };
  }
  if (!c) {
    const d = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    c = { x: d[0], y: d[1], w: d[2], h: d[3] };
  }
  for (const [d, g] of Object.entries({ x: c.x, y: c.y, width: c.w, height: c.h })) s.setAttribute(d, g);
}
const Uo = `<svg
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
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
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
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
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
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`, wt = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, $o = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
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
  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
  <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
  <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
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
`, nr = `<svg
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
`, or = `<svg
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
`, rr = `<svg
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
`, ir = `<svg
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
`, sr = `<svg
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
`, ar = `<svg
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
`, lr = `<svg
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
`, cr = `<svg
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
`, dr = `<svg
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
`, ur = `<svg
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
`, fr = `<svg
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
`, pr = `<svg
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
`, hr = `<svg
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
  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
</svg>
`, mr = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 12v5.5a1 1 0 01-7 0V10"/>
  <path d="M17 21v-2a1 1 0 01-1-1v-2"/>
  <path d="M19 13.343V6.5a3.5 3.5 0 00-6.997-.154"/>
  <path d="M19 19h-2"/>
  <path d="m2 2 20 20"/>
  <path d="M20 14a2 2 0 012 2v.343"/>
  <path d="M3 5h2"/>
  <path d="M8 8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a1 1 0 011-1V3"/>
</svg>
`, gr = `<svg
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
  <path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" />
  <path d="m8 6 2-2" />
  <path d="m18 16 2-2" />
  <path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17" />
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  <path d="m15 5 4 4" />
</svg>
`;
function br(t) {
  const e = { select: er, box: tr, move: Uo, route: Bo, erase: jo, rotate: Vo, "mirror-x": Go, "mirror-y": Qo }, n = { left: or, right: ir, top: sr, bottom: lr, "center-x": rr, "center-y": ar, "space-x": cr, "space-y": dr }, i = { "zoom-in": Fo, "zoom-out": Ho, fit: Wo, "wire-undo": zo, "wire-redo": qo, "auto-route": Xo, "pin-editor": wt, "pin-info": wt, "pin-details": wt, fullscreen: $o, "exit-fullscreen": Ko, "reset-windows": Yo, "open-download": Zo, upload: Jo }, o = (r, l) => {
    if (!r) return;
    const a = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", a), r.title = a, r.innerHTML = l, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  o(t.querySelector("#spice-copy"), nr), o(t.querySelector("#spice-label-edit"), ur), o(t.querySelector("#spice-group"), fr), o(t.querySelector("#spice-layout-brush"), pr), o(t.querySelector("#spice-interactive"), hr), o(t.querySelector("#spice-flywire"), mr);
  const s = t.querySelector("#spice-generate");
  o(s, gr), s.classList.remove("spice-icon-button"), s.classList.add("spice-generate-button");
  const u = document.createElement("span");
  u.textContent = "Generate", s.prepend(u);
  for (const [r, l] of Object.entries(n)) o(t.querySelector(`[data-editor-arrange="${r}"]`), l);
  for (const [r, l] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${r}"]`), l);
  for (const [r, l] of Object.entries(i)) o(t.querySelector("#spice-" + r), l);
}
function yr(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function i() {
      var o = !1;
      try {
        o = this instanceof i;
      } catch {
      }
      return o ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(i) {
    var o = Object.getOwnPropertyDescriptor(t, i);
    Object.defineProperty(n, i, o.get ? o : {
      enumerable: !0,
      get: function() {
        return t[i];
      }
    });
  }), n;
}
var xt = {};
const wr = {}, xr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wr
}, Symbol.toStringTag, { value: "Module" })), vr = /* @__PURE__ */ yr(xr);
var Yt;
function Er() {
  return Yt || (Yt = 1, (function(t) {
    (function(e) {
      e.parser = function(h, f) {
        return new i(h, f);
      }, e.SAXParser = i, e.SAXStream = v, e.createStream = a, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function i(h, f) {
        if (!(this instanceof i))
          return new i(h, f);
        var R = this;
        s(R), R.q = R.c = "", R.bufferCheckPosition = e.MAX_BUFFER_LENGTH, R.encoding = null, R.opt = f || {}, R.opt.lowercase = R.opt.lowercase || R.opt.lowercasetags, R.looseCase = R.opt.lowercase ? "toLowerCase" : "toUpperCase", R.opt.maxEntityCount = R.opt.maxEntityCount || 512, R.opt.maxEntityDepth = R.opt.maxEntityDepth || 4, R.entityCount = R.entityDepth = 0, R.tags = [], R.closed = R.closedRoot = R.sawRoot = !1, R.tag = R.error = null, R.strict = !!h, R.noscript = !!(h || R.opt.noscript), R.state = x.BEGIN, R.strictEntities = R.opt.strictEntities, R.ENTITIES = R.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), R.attribList = [], R.opt.xmlns && (R.ns = Object.create(N)), R.opt.unquotedAttributeValues === void 0 && (R.opt.unquotedAttributeValues = !h), R.trackPosition = R.opt.position !== !1, R.trackPosition && (R.position = R.line = R.column = 0), K(R, "onready");
      }
      Object.create || (Object.create = function(h) {
        function f() {
        }
        f.prototype = h;
        var R = new f();
        return R;
      }), Object.keys || (Object.keys = function(h) {
        var f = [];
        for (var R in h) h.hasOwnProperty(R) && f.push(R);
        return f;
      });
      function o(h) {
        for (var f = Math.max(e.MAX_BUFFER_LENGTH, 10), R = 0, A = 0, oe = n.length; A < oe; A++) {
          var O = h[n[A]].length;
          if (O > f)
            switch (n[A]) {
              case "textNode":
                ee(h);
                break;
              case "cdata":
                G(h, "oncdata", h.cdata), h.cdata = "";
                break;
              case "script":
                G(h, "onscript", h.script), h.script = "";
                break;
              default:
                ie(h, "Max buffer length exceeded: " + n[A]);
            }
          R = Math.max(R, O);
        }
        var P = e.MAX_BUFFER_LENGTH - R;
        h.bufferCheckPosition = P + h.position;
      }
      function s(h) {
        for (var f = 0, R = n.length; f < R; f++)
          h[n[f]] = "";
      }
      function u(h) {
        ee(h), h.cdata !== "" && (G(h, "oncdata", h.cdata), h.cdata = ""), h.script !== "" && (G(h, "onscript", h.script), h.script = "");
      }
      i.prototype = {
        end: function() {
          le(this);
        },
        write: ge,
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
      var r;
      try {
        r = vr.Stream;
      } catch {
        r = function() {
        };
      }
      r || (r = function() {
      });
      var l = e.EVENTS.filter(function(h) {
        return h !== "error" && h !== "end";
      });
      function a(h, f) {
        return new v(h, f);
      }
      function c(h, f) {
        if (h.length >= 2) {
          if (h[0] === 255 && h[1] === 254)
            return "utf-16le";
          if (h[0] === 254 && h[1] === 255)
            return "utf-16be";
        }
        return h.length >= 3 && h[0] === 239 && h[1] === 187 && h[2] === 191 ? "utf8" : h.length >= 4 ? h[0] === 60 && h[1] === 0 && h[2] === 63 && h[3] === 0 ? "utf-16le" : h[0] === 0 && h[1] === 60 && h[2] === 0 && h[3] === 63 ? "utf-16be" : "utf8" : f ? "utf8" : null;
      }
      function v(h, f) {
        if (!(this instanceof v))
          return new v(h, f);
        r.apply(this), this._parser = new i(h, f), this.writable = !0, this.readable = !0;
        var R = this;
        this._parser.onend = function() {
          R.emit("end");
        }, this._parser.onerror = function(A) {
          R.emit("error", A), R._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, l.forEach(function(A) {
          Object.defineProperty(R, "on" + A, {
            get: function() {
              return R._parser["on" + A];
            },
            set: function(oe) {
              if (!oe)
                return R.removeAllListeners(A), R._parser["on" + A] = oe, oe;
              R.on(A, oe);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      v.prototype = Object.create(r.prototype, {
        constructor: {
          value: v
        }
      }), v.prototype._decodeBuffer = function(h, f) {
        if (this._decoderBuffer && (h = Buffer.concat([this._decoderBuffer, h]), this._decoderBuffer = null), !this._decoder) {
          var R = c(h, f);
          if (!R)
            return this._decoderBuffer = h, "";
          this._parser.encoding = R, this._decoder = new TextDecoder(R);
        }
        return this._decoder.decode(h, { stream: !f });
      }, v.prototype.write = function(h) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(h))
          h = this._decodeBuffer(h, !1);
        else if (this._decoderBuffer) {
          var f = this._decodeBuffer(Buffer.alloc(0), !0);
          f && (this._parser.write(f), this.emit("data", f));
        }
        return this._parser.write(h.toString()), this.emit("data", h), !0;
      }, v.prototype.end = function(h) {
        if (h && h.length && this.write(h), this._decoderBuffer) {
          var f = this._decodeBuffer(Buffer.alloc(0), !0);
          f && (this._parser.write(f), this.emit("data", f));
        } else if (this._decoder) {
          var R = this._decoder.decode();
          R && (this._parser.write(R), this.emit("data", R));
        }
        return this._parser.end(), !0;
      }, v.prototype.on = function(h, f) {
        var R = this;
        return !R._parser["on" + h] && l.indexOf(h) !== -1 && (R._parser["on" + h] = function() {
          var A = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          A.splice(0, 0, h), R.emit.apply(R, A);
        }), r.prototype.on.call(R, h, f);
      };
      var b = /^\[CDATA\[$/i, d = /^DOCTYPE$/i, g = "http://www.w3.org/XML/1998/namespace", m = "http://www.w3.org/2000/xmlns/", N = { xml: g, xmlns: m }, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, _ = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function I(h) {
        return h === " " || h === `
` || h === "\r" || h === "	";
      }
      function S(h) {
        return h === '"' || h === "'";
      }
      function M(h) {
        return h === ">" || I(h);
      }
      function B(h, f) {
        return h.test(f);
      }
      function E(h, f) {
        return !B(h, f);
      }
      var x = 0;
      e.STATE = {
        BEGIN: x++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: x++,
        // leading whitespace
        TEXT: x++,
        // general stuff
        TEXT_ENTITY: x++,
        // &amp and such.
        OPEN_WAKA: x++,
        // <
        SGML_DECL: x++,
        // <!BLARG
        SGML_DECL_QUOTED: x++,
        // <!BLARG foo "bar
        DOCTYPE: x++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: x++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: x++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: x++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: x++,
        // <!-
        COMMENT: x++,
        // <!--
        COMMENT_ENDING: x++,
        // <!-- blah -
        COMMENT_ENDED: x++,
        // <!-- blah --
        CDATA: x++,
        // <![CDATA[ something
        CDATA_ENDING: x++,
        // ]
        CDATA_ENDING_2: x++,
        // ]]
        PROC_INST: x++,
        // <?hi
        PROC_INST_BODY: x++,
        // <?hi there
        PROC_INST_ENDING: x++,
        // <?hi "there" ?
        OPEN_TAG: x++,
        // <strong
        OPEN_TAG_SLASH: x++,
        // <strong /
        ATTRIB: x++,
        // <a
        ATTRIB_NAME: x++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: x++,
        // <a foo _
        ATTRIB_VALUE: x++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: x++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: x++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: x++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: x++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: x++,
        // <foo bar=&quot
        CLOSE_TAG: x++,
        // </a
        CLOSE_TAG_SAW_WHITE: x++,
        // </a   >
        SCRIPT: x++,
        // <script> ...
        SCRIPT_ENDING: x++
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
      }), Object.keys(e.ENTITIES).forEach(function(h) {
        var f = e.ENTITIES[h], R = typeof f == "number" ? String.fromCharCode(f) : f;
        e.ENTITIES[h] = R;
      });
      for (var H in e.STATE)
        e.STATE[e.STATE[H]] = H;
      x = e.STATE;
      function K(h, f, R) {
        h[f] && h[f](R);
      }
      function $(h) {
        var f = h && h.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return f ? f[2] : null;
      }
      function te(h) {
        return h ? h.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function re(h, f) {
        const R = te(h), A = te(f);
        return !R || !A ? !0 : A === "utf16" ? R === "utf16le" || R === "utf16be" : R === A;
      }
      function L(h, f) {
        if (!(!h.strict || !h.encoding || !f || f.name !== "xml")) {
          var R = $(f.body);
          R && !re(h.encoding, R) && ne(
            h,
            "XML declaration encoding " + R + " does not match detected stream encoding " + h.encoding.toUpperCase()
          );
        }
      }
      function G(h, f, R) {
        h.textNode && ee(h), K(h, f, R);
      }
      function ee(h) {
        h.textNode = z(h.opt, h.textNode), h.textNode && K(h, "ontext", h.textNode), h.textNode = "";
      }
      function z(h, f) {
        return h.trim && (f = f.trim()), h.normalize && (f = f.replace(/\s+/g, " ")), f;
      }
      function ie(h, f) {
        return ee(h), h.trackPosition && (f += `
Line: ` + h.line + `
Column: ` + h.column + `
Char: ` + h.c), f = new Error(f), h.error = f, K(h, "onerror", f), h;
      }
      function le(h) {
        return h.sawRoot && !h.closedRoot && ne(h, "Unclosed root tag"), h.state !== x.BEGIN && h.state !== x.BEGIN_WHITESPACE && h.state !== x.TEXT && ie(h, "Unexpected end"), ee(h), h.c = "", h.closed = !0, K(h, "onend"), i.call(h, h.strict, h.opt), h;
      }
      function ne(h, f) {
        if (typeof h != "object" || !(h instanceof i))
          throw new Error("bad call to strictFail");
        h.strict && ie(h, f);
      }
      function Ie(h) {
        h.strict || (h.tagName = h.tagName[h.looseCase]());
        var f = h.tags[h.tags.length - 1] || h, R = h.tag = { name: h.tagName, attributes: {} };
        h.opt.xmlns && (R.ns = f.ns), h.attribList.length = 0, G(h, "onopentagstart", R);
      }
      function we(h, f) {
        var R = h.indexOf(":"), A = R < 0 ? ["", h] : h.split(":"), oe = A[0], O = A[1];
        return f && h === "xmlns" && (oe = "xmlns", O = ""), { prefix: oe, local: O };
      }
      function Re(h) {
        if (h.strict || (h.attribName = h.attribName[h.looseCase]()), h.attribList.indexOf(h.attribName) !== -1 || h.tag.attributes.hasOwnProperty(h.attribName)) {
          h.attribName = h.attribValue = "";
          return;
        }
        if (h.opt.xmlns) {
          var f = we(h.attribName, !0), R = f.prefix, A = f.local;
          if (R === "xmlns")
            if (A === "xml" && h.attribValue !== g)
              ne(
                h,
                "xml: prefix must be bound to " + g + `
Actual: ` + h.attribValue
              );
            else if (A === "xmlns" && h.attribValue !== m)
              ne(
                h,
                "xmlns: prefix must be bound to " + m + `
Actual: ` + h.attribValue
              );
            else {
              var oe = h.tag, O = h.tags[h.tags.length - 1] || h;
              oe.ns === O.ns && (oe.ns = Object.create(O.ns)), oe.ns[A] = h.attribValue;
            }
          h.attribList.push([h.attribName, h.attribValue]);
        } else
          h.tag.attributes[h.attribName] = h.attribValue, G(h, "onattribute", {
            name: h.attribName,
            value: h.attribValue
          });
        h.attribName = h.attribValue = "";
      }
      function me(h, f) {
        if (h.opt.xmlns) {
          var R = h.tag, A = we(h.tagName);
          R.prefix = A.prefix, R.local = A.local, R.uri = R.ns[A.prefix] || "", R.prefix && !R.uri && (ne(
            h,
            "Unbound namespace prefix: " + JSON.stringify(h.tagName)
          ), R.uri = A.prefix);
          var oe = h.tags[h.tags.length - 1] || h;
          R.ns && oe.ns !== R.ns && Object.keys(R.ns).forEach(function(F) {
            G(h, "onopennamespace", {
              prefix: F,
              uri: R.ns[F]
            });
          });
          for (var O = 0, P = h.attribList.length; O < P; O++) {
            var Q = h.attribList[O], q = Q[0], X = Q[1], p = we(q, !0), k = p.prefix, T = p.local, D = k === "" ? "" : R.ns[k] || "", Y = {
              name: q,
              value: X,
              prefix: k,
              local: T,
              uri: D
            };
            k && k !== "xmlns" && !D && (ne(
              h,
              "Unbound namespace prefix: " + JSON.stringify(k)
            ), Y.uri = k), h.tag.attributes[q] = Y, G(h, "onattribute", Y);
          }
          h.attribList.length = 0;
        }
        h.tag.isSelfClosing = !!f, h.sawRoot = !0, h.tags.push(h.tag), G(h, "onopentag", h.tag), f || (!h.noscript && h.tagName.toLowerCase() === "script" ? h.state = x.SCRIPT : h.state = x.TEXT, h.tag = null, h.tagName = ""), h.attribName = h.attribValue = "", h.attribList.length = 0;
      }
      function Ae(h) {
        if (!h.tagName) {
          ne(h, "Weird empty close tag."), h.textNode += "</>", h.state = x.TEXT;
          return;
        }
        if (h.script) {
          if (h.tagName !== "script") {
            h.script += "</" + h.tagName + ">", h.tagName = "", h.state = x.SCRIPT;
            return;
          }
          G(h, "onscript", h.script), h.script = "";
        }
        var f = h.tags.length, R = h.tagName;
        h.strict || (R = R[h.looseCase]());
        for (var A = R; f--; ) {
          var oe = h.tags[f];
          if (oe.name !== A)
            ne(h, "Unexpected close tag");
          else
            break;
        }
        if (f < 0) {
          ne(h, "Unmatched closing tag: " + h.tagName), h.textNode += "</" + h.tagName + ">", h.state = x.TEXT;
          return;
        }
        h.tagName = R;
        for (var O = h.tags.length; O-- > f; ) {
          var P = h.tag = h.tags.pop();
          h.tagName = h.tag.name, G(h, "onclosetag", h.tagName);
          var Q = {};
          for (var q in P.ns)
            Q[q] = P.ns[q];
          var X = h.tags[h.tags.length - 1] || h;
          h.opt.xmlns && P.ns !== X.ns && Object.keys(P.ns).forEach(function(p) {
            var k = P.ns[p];
            G(h, "onclosenamespace", { prefix: p, uri: k });
          });
        }
        f === 0 && (h.closedRoot = !0), h.tagName = h.attribValue = h.attribName = "", h.attribList.length = 0, h.state = x.TEXT;
      }
      function Ee(h) {
        var f = h.entity, R = f.toLowerCase(), A, oe = "";
        return h.ENTITIES[f] ? h.ENTITIES[f] : h.ENTITIES[R] ? h.ENTITIES[R] : (f = R, f.charAt(0) === "#" && (f.charAt(1) === "x" ? (f = f.slice(2), A = parseInt(f, 16), oe = A.toString(16)) : (f = f.slice(1), A = parseInt(f, 10), oe = A.toString(10))), f = f.replace(/^0+/, ""), isNaN(A) || oe.toLowerCase() !== f || A < 0 || A > 1114111 || !Me(A) ? (ne(h, "Invalid character entity"), "&" + h.entity + ";") : String.fromCodePoint(A));
      }
      function Me(h) {
        return h === 9 || h === 10 || h === 13 || h >= 32 && h <= 55295 || h >= 57344 && h <= 65533 || h >= 65536 && h <= 1114111;
      }
      function Ne(h, f) {
        f === "<" ? (h.state = x.OPEN_WAKA, h.startTagPosition = h.position) : I(f) || (ne(h, "Non-whitespace before first tag."), h.textNode = f, h.state = x.TEXT);
      }
      function be(h, f) {
        var R = "";
        return f < h.length && (R = h.charAt(f)), R;
      }
      function ge(h) {
        var f = this;
        if (this.error)
          throw this.error;
        if (f.closed)
          return ie(
            f,
            "Cannot write after close. Assign an onready handler."
          );
        if (h === null)
          return le(f);
        typeof h == "object" && (h = h.toString());
        for (var R = 0, A = ""; A = be(h, R++), f.c = A, !!A; )
          switch (f.trackPosition && (f.position++, A === `
` ? (f.line++, f.column = 0) : f.column++), f.state) {
            case x.BEGIN:
              if (f.state = x.BEGIN_WHITESPACE, A === "\uFEFF")
                continue;
              Ne(f, A);
              continue;
            case x.BEGIN_WHITESPACE:
              Ne(f, A);
              continue;
            case x.TEXT:
              if (f.sawRoot && !f.closedRoot) {
                for (var O = R - 1; A && A !== "<" && A !== "&"; )
                  A = be(h, R++), A && f.trackPosition && (f.position++, A === `
` ? (f.line++, f.column = 0) : f.column++);
                f.textNode += h.substring(O, R - 1);
              }
              A === "<" && !(f.sawRoot && f.closedRoot && !f.strict) ? (f.state = x.OPEN_WAKA, f.startTagPosition = f.position) : (!I(A) && (!f.sawRoot || f.closedRoot) && ne(f, "Text data outside of root node."), A === "&" ? f.state = x.TEXT_ENTITY : f.textNode += A);
              continue;
            case x.SCRIPT:
              A === "<" ? f.state = x.SCRIPT_ENDING : f.script += A;
              continue;
            case x.SCRIPT_ENDING:
              A === "/" ? f.state = x.CLOSE_TAG : (f.script += "<" + A, f.state = x.SCRIPT);
              continue;
            case x.OPEN_WAKA:
              if (A === "!")
                f.state = x.SGML_DECL, f.sgmlDecl = "";
              else if (!I(A)) if (B(y, A))
                f.state = x.OPEN_TAG, f.tagName = A;
              else if (A === "/")
                f.state = x.CLOSE_TAG, f.tagName = "";
              else if (A === "?")
                f.state = x.PROC_INST, f.procInstName = f.procInstBody = "";
              else {
                if (ne(f, "Unencoded <"), f.startTagPosition + 1 < f.position) {
                  var oe = f.position - f.startTagPosition;
                  A = new Array(oe).join(" ") + A;
                }
                f.textNode += "<" + A, f.state = x.TEXT;
              }
              continue;
            case x.SGML_DECL:
              if (f.sgmlDecl + A === "--") {
                f.state = x.COMMENT, f.comment = "", f.sgmlDecl = "";
                continue;
              }
              f.doctype && f.doctype !== !0 && f.sgmlDecl ? (f.state = x.DOCTYPE_DTD, f.doctype += "<!" + f.sgmlDecl + A, f.sgmlDecl = "") : b.test(f.sgmlDecl + A) ? (G(f, "onopencdata"), f.state = x.CDATA, f.sgmlDecl = "", f.cdata = "") : d.test(f.sgmlDecl + A) ? (f.state = x.DOCTYPE, (f.doctype || f.sawRoot) && ne(
                f,
                "Inappropriately located doctype declaration"
              ), f.doctype = "", f.sgmlDecl = "") : A === ">" ? (G(f, "onsgmldeclaration", f.sgmlDecl), f.sgmlDecl = "", f.state = x.TEXT) : (S(A) && (f.state = x.SGML_DECL_QUOTED), f.sgmlDecl += A);
              continue;
            case x.SGML_DECL_QUOTED:
              A === f.q && (f.state = x.SGML_DECL, f.q = ""), f.sgmlDecl += A;
              continue;
            case x.DOCTYPE:
              A === ">" ? (f.state = x.TEXT, G(f, "ondoctype", f.doctype), f.doctype = !0) : (f.doctype += A, A === "[" ? f.state = x.DOCTYPE_DTD : S(A) && (f.state = x.DOCTYPE_QUOTED, f.q = A));
              continue;
            case x.DOCTYPE_QUOTED:
              f.doctype += A, A === f.q && (f.q = "", f.state = x.DOCTYPE);
              continue;
            case x.DOCTYPE_DTD:
              A === "]" ? (f.doctype += A, f.state = x.DOCTYPE) : A === "<" ? (f.state = x.OPEN_WAKA, f.startTagPosition = f.position) : S(A) ? (f.doctype += A, f.state = x.DOCTYPE_DTD_QUOTED, f.q = A) : f.doctype += A;
              continue;
            case x.DOCTYPE_DTD_QUOTED:
              f.doctype += A, A === f.q && (f.state = x.DOCTYPE_DTD, f.q = "");
              continue;
            case x.COMMENT:
              A === "-" ? f.state = x.COMMENT_ENDING : f.comment += A;
              continue;
            case x.COMMENT_ENDING:
              A === "-" ? (f.state = x.COMMENT_ENDED, f.comment = z(f.opt, f.comment), f.comment && G(f, "oncomment", f.comment), f.comment = "") : (f.comment += "-" + A, f.state = x.COMMENT);
              continue;
            case x.COMMENT_ENDED:
              A !== ">" ? (ne(f, "Malformed comment"), f.comment += "--" + A, f.state = x.COMMENT) : f.doctype && f.doctype !== !0 ? f.state = x.DOCTYPE_DTD : f.state = x.TEXT;
              continue;
            case x.CDATA:
              for (var O = R - 1; A && A !== "]"; )
                A = be(h, R++), A && f.trackPosition && (f.position++, A === `
` ? (f.line++, f.column = 0) : f.column++);
              f.cdata += h.substring(O, R - 1), A === "]" && (f.state = x.CDATA_ENDING);
              continue;
            case x.CDATA_ENDING:
              A === "]" ? f.state = x.CDATA_ENDING_2 : (f.cdata += "]" + A, f.state = x.CDATA);
              continue;
            case x.CDATA_ENDING_2:
              A === ">" ? (f.cdata && G(f, "oncdata", f.cdata), G(f, "onclosecdata"), f.cdata = "", f.state = x.TEXT) : A === "]" ? f.cdata += "]" : (f.cdata += "]]" + A, f.state = x.CDATA);
              continue;
            case x.PROC_INST:
              A === "?" ? f.state = x.PROC_INST_ENDING : I(A) ? f.state = x.PROC_INST_BODY : f.procInstName += A;
              continue;
            case x.PROC_INST_BODY:
              if (!f.procInstBody && I(A))
                continue;
              A === "?" ? f.state = x.PROC_INST_ENDING : f.procInstBody += A;
              continue;
            case x.PROC_INST_ENDING:
              if (A === ">") {
                const X = {
                  name: f.procInstName,
                  body: f.procInstBody
                };
                L(f, X), G(f, "onprocessinginstruction", X), f.procInstName = f.procInstBody = "", f.state = x.TEXT;
              } else
                f.procInstBody += "?" + A, f.state = x.PROC_INST_BODY;
              continue;
            case x.OPEN_TAG:
              B(w, A) ? f.tagName += A : (Ie(f), A === ">" ? me(f) : A === "/" ? f.state = x.OPEN_TAG_SLASH : (I(A) || ne(f, "Invalid character in tag name"), f.state = x.ATTRIB));
              continue;
            case x.OPEN_TAG_SLASH:
              A === ">" ? (me(f, !0), Ae(f)) : (ne(
                f,
                "Forward-slash in opening tag not followed by >"
              ), f.state = x.ATTRIB);
              continue;
            case x.ATTRIB:
              if (I(A))
                continue;
              A === ">" ? me(f) : A === "/" ? f.state = x.OPEN_TAG_SLASH : B(y, A) ? (f.attribName = A, f.attribValue = "", f.state = x.ATTRIB_NAME) : ne(f, "Invalid attribute name");
              continue;
            case x.ATTRIB_NAME:
              A === "=" ? f.state = x.ATTRIB_VALUE : A === ">" ? (ne(f, "Attribute without value"), f.attribValue = f.attribName, Re(f), me(f)) : I(A) ? f.state = x.ATTRIB_NAME_SAW_WHITE : B(w, A) ? f.attribName += A : ne(f, "Invalid attribute name");
              continue;
            case x.ATTRIB_NAME_SAW_WHITE:
              if (A === "=")
                f.state = x.ATTRIB_VALUE;
              else {
                if (I(A))
                  continue;
                ne(f, "Attribute without value"), f.tag.attributes[f.attribName] = "", f.attribValue = "", G(f, "onattribute", {
                  name: f.attribName,
                  value: ""
                }), f.attribName = "", A === ">" ? me(f) : B(y, A) ? (f.attribName = A, f.state = x.ATTRIB_NAME) : (ne(f, "Invalid attribute name"), f.state = x.ATTRIB);
              }
              continue;
            case x.ATTRIB_VALUE:
              if (I(A))
                continue;
              S(A) ? (f.q = A, f.state = x.ATTRIB_VALUE_QUOTED) : (f.opt.unquotedAttributeValues || ie(f, "Unquoted attribute value"), f.state = x.ATTRIB_VALUE_UNQUOTED, f.attribValue = A);
              continue;
            case x.ATTRIB_VALUE_QUOTED:
              if (A !== f.q) {
                A === "&" ? f.state = x.ATTRIB_VALUE_ENTITY_Q : f.attribValue += A;
                continue;
              }
              Re(f), f.q = "", f.state = x.ATTRIB_VALUE_CLOSED;
              continue;
            case x.ATTRIB_VALUE_CLOSED:
              I(A) ? f.state = x.ATTRIB : A === ">" ? me(f) : A === "/" ? f.state = x.OPEN_TAG_SLASH : B(y, A) ? (ne(f, "No whitespace between attributes"), f.attribName = A, f.attribValue = "", f.state = x.ATTRIB_NAME) : ne(f, "Invalid attribute name");
              continue;
            case x.ATTRIB_VALUE_UNQUOTED:
              if (!M(A)) {
                A === "&" ? f.state = x.ATTRIB_VALUE_ENTITY_U : f.attribValue += A;
                continue;
              }
              Re(f), A === ">" ? me(f) : f.state = x.ATTRIB;
              continue;
            case x.CLOSE_TAG:
              if (f.tagName)
                A === ">" ? Ae(f) : B(w, A) ? f.tagName += A : f.script ? (f.script += "</" + f.tagName + A, f.tagName = "", f.state = x.SCRIPT) : (I(A) || ne(f, "Invalid tagname in closing tag"), f.state = x.CLOSE_TAG_SAW_WHITE);
              else {
                if (I(A))
                  continue;
                E(y, A) ? f.script ? (f.script += "</" + A, f.state = x.SCRIPT) : ne(f, "Invalid tagname in closing tag.") : f.tagName = A;
              }
              continue;
            case x.CLOSE_TAG_SAW_WHITE:
              if (I(A))
                continue;
              A === ">" ? Ae(f) : ne(f, "Invalid characters in closing tag");
              continue;
            case x.TEXT_ENTITY:
            case x.ATTRIB_VALUE_ENTITY_Q:
            case x.ATTRIB_VALUE_ENTITY_U:
              var P, Q;
              switch (f.state) {
                case x.TEXT_ENTITY:
                  P = x.TEXT, Q = "textNode";
                  break;
                case x.ATTRIB_VALUE_ENTITY_Q:
                  P = x.ATTRIB_VALUE_QUOTED, Q = "attribValue";
                  break;
                case x.ATTRIB_VALUE_ENTITY_U:
                  P = x.ATTRIB_VALUE_UNQUOTED, Q = "attribValue";
                  break;
              }
              if (A === ";") {
                var q = Ee(f);
                f.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(q) ? ((f.entityCount += 1) > f.opt.maxEntityCount && ie(
                  f,
                  "Parsed entity count exceeds max entity count"
                ), (f.entityDepth += 1) > f.opt.maxEntityDepth && ie(
                  f,
                  "Parsed entity depth exceeds max entity depth"
                ), f.entity = "", f.state = P, f.write(q), f.entityDepth -= 1) : (f[Q] += q, f.entity = "", f.state = P);
              } else B(f.entity.length ? _ : C, A) ? f.entity += A : (ne(f, "Invalid character in entity name"), f[Q] += "&" + f.entity + A, f.entity = "", f.state = P);
              continue;
            default:
              throw new Error(f, "Unknown state: " + f.state);
          }
        return f.position >= f.bufferCheckPosition && o(f), f;
      }
      String.fromCodePoint || (function() {
        var h = String.fromCharCode, f = Math.floor, R = function() {
          var A = 16384, oe = [], O, P, Q = -1, q = arguments.length;
          if (!q)
            return "";
          for (var X = ""; ++Q < q; ) {
            var p = Number(arguments[Q]);
            if (!isFinite(p) || // `NaN`, `+Infinity`, or `-Infinity`
            p < 0 || // not a valid Unicode code point
            p > 1114111 || // not a valid Unicode code point
            f(p) !== p)
              throw RangeError("Invalid code point: " + p);
            p <= 65535 ? oe.push(p) : (p -= 65536, O = (p >> 10) + 55296, P = p % 1024 + 56320, oe.push(O, P)), (Q + 1 === q || oe.length > A) && (X += h.apply(null, oe), oe.length = 0);
          }
          return X;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: R,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = R;
      })();
    })(t);
  })(xt)), xt;
}
var vt, Zt;
function Nr() {
  if (Zt) return vt;
  Zt = 1;
  var t = Er().parser;
  function e(n) {
    var i = [], o = [], s = i, u;
    return u = t(!0), u.ontext = function(r) {
      r.trim() !== "" && s.push(r);
    }, u.onopentag = function(r) {
      var l;
      l = [r.name, r.attributes], o.push(s), s.push(l), s = l;
    }, u.onclosetag = function() {
      s = o.pop();
    }, u.write(n).close(), i[0];
  }
  return vt = e, vt;
}
var Et, Jt;
function Sr() {
  if (Jt) return Et;
  Jt = 1;
  function t(e, n) {
    var i = function() {
    }, o = i, s = i;
    function u() {
      this._skip = !0;
    }
    function r() {
      this._remove = !0;
    }
    function l(v) {
      this._name = v;
    }
    function a(v) {
      this._replace = v;
    }
    function c(v, b) {
      var d, g = { attr: {}, full: v }, m = {
        name: l,
        skip: u,
        // break: breakFn,
        remove: r,
        replace: a,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, N = !0, y, w, C;
      if (v !== void 0 && v !== null && v !== !0 && v !== !1)
        switch (d = Object.prototype.toString.call(v), d) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (v.some(function(_, I) {
              if (I === 0)
                return g.name = _, !1;
              if (I === 1)
                return Object.prototype.toString.call(_) === "[object Object]" && (N = !1, g.attr = _), !0;
            }), o.call(m, g, b), m._name && (v[0] = m._name), m._replace)
              return m._replace;
            if (m._remove)
              return null;
            if (!m._skip) {
              for (y = 0, w = v.length; y < w; ) {
                if (y > 1 || y === 1 && N) {
                  if (C = c(v[y], g), C === null) {
                    v.splice(y, 1), w -= 1;
                    continue;
                  }
                  C && (v[y] = C);
                }
                y += 1;
              }
              if (s.call(m, g, b), m._name && (v[0] = m._name), m._replace)
                return m._replace;
              if (m._remove)
                return null;
            }
        }
    }
    n && (n.enter && (o = n.enter), n.leave && (s = n.leave)), c(e, void 0);
  }
  return Et = t, Et;
}
var Nt, en;
function _r() {
  if (en) return Nt;
  en = 1;
  const t = Nr(), e = Sr(), n = (o) => String(o).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[s]);
  function i(o) {
    const [s, ...u] = o, r = u[0] && typeof u[0] == "object" && !Array.isArray(u[0]) ? u.shift() : {}, l = "<" + s + Object.entries(r).map(([a, c]) => " " + a + '="' + n(c) + '"').join("");
    return u.length ? l + ">" + u.map((a) => Array.isArray(a) ? i(a) : n(a)).join("") + "</" + s + ">" : l + "/>";
  }
  return Nt = { parse: t, p: t, traverse: e, t: e, stringify: i, s: i }, Nt;
}
_r();
const St = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), Cr = (t, e) => [...t].reduce((n, i) => n + (i.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function kr(t, e, n = 12) {
  const i = [], o = t.map((u) => ({ x: u.x, y: u.y, w: u.w, h: u.h }));
  for (const [u, r] of t.entries()) {
    if (!r.labels.length) continue;
    const l = Math.max(...r.labels.map((g) => Cr(g.text, n))) + 4, a = r.labels.length * (n + 4), c = [];
    for (const g of [5, 14, 28, 48]) {
      const m = { x: r.x + (r.w - l) / 2, y: r.y - g - a, w: l, h: a }, N = { x: r.x + (r.w - l) / 2, y: r.y + r.h + g, w: l, h: a }, y = { x: r.x + r.w + g, y: r.y + (r.h - a) / 2, w: l, h: a }, w = { x: r.x - g - l, y: r.y + (r.h - a) / 2, w: l, h: a };
      c.push(...r.w > r.h ? [m, N, y, w] : [y, w, m, N]);
    }
    const v = (g) => e.reduce((m, N) => {
      const y = Math.min(N.a.x, N.b.x), w = Math.min(N.a.y, N.b.y), C = { x: y - 1, y: w - 1, w: Math.abs(N.a.x - N.b.x) + 2, h: Math.abs(N.a.y - N.b.y) + 2 };
      return m + St(g, C) * 2;
    }, 0);
    let b = null, d = 1 / 0;
    for (const [g, m] of c.entries()) {
      const N = o.reduce((y, w, C) => y + (C === u ? 0 : St(m, w)) * 500, 0) + i.reduce((y, w) => y + St(m, w) * 100, 0) + v(m) + g * 3;
      N < d && (d = N, b = m);
    }
    r.labels.forEach((g, m) => {
      g.x = b.x - r.x, g.y = b.y - r.y + n + m * (n + 4);
    }), i.push(b);
  }
  const s = [...o, ...i];
  return { x: Math.min(0, ...s.map((u) => u.x)), y: Math.min(0, ...s.map((u) => u.y)), right: Math.max(0, ...s.map((u) => u.x + u.w)), bottom: Math.max(0, ...s.map((u) => u.y + u.h)) };
}
const Ir = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function Ar(t, e = 12) {
  const n = [...t.children].filter((s) => s.localName === "g" && s.id.startsWith("cell_")).map((s) => ({ ...Ir(s.getAttribute("transform")), w: +s.getAttribute("s:width"), h: +s.getAttribute("s:height"), labels: [...s.children].filter((u) => u.localName === "text" && u.hasAttribute("data-layout-label")).map((u) => ({ node: u, text: u.textContent })) })), i = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } })), o = kr(n, i, e);
  for (const s of n) for (const u of s.labels)
    u.node.setAttribute("x", u.x), u.node.setAttribute("y", u.y), u.node.setAttribute("text-anchor", "start"), u.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(o), o;
}
function Or(t) {
  const e = t("interactive"), n = t("edit-tools-reveal"), i = t("edit-tools-inner"), o = () => e.getAttribute("aria-pressed") === "true", s = () => {
    n.style.width = o() ? i.scrollWidth + "px" : "0px";
  };
  function u(r) {
    e.setAttribute("aria-pressed", String(r)), e.setAttribute("aria-expanded", String(r)), e.title = r ? "Exit editing and hide tools" : "Edit schematic", e.setAttribute("aria-label", e.title), n.inert = !r, n.classList.toggle("is-open", r), s();
  }
  return new ResizeObserver(s).observe(i), u(!1), { enabled: o, set: u };
}
function Tr(t) {
  const e = t("diagnostics"), n = t("messages"), i = t("toggle-log");
  let o = 0, s = !0, u = !1;
  function r(g) {
    n.dataset.expanded = String(g), i.setAttribute("aria-expanded", String(g)), e.hidden = !g;
  }
  i.onclick = () => r(i.getAttribute("aria-expanded") !== "true");
  let l = [];
  const a = () => [e.clientWidth, e.clientHeight], c = () => a().some((g, m) => g !== l[m]);
  function v() {
    u || (u = !0, requestAnimationFrame(() => {
      s && (e.scrollTop = e.scrollHeight), l = a(), u = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (c()) {
      l = a(), s && v();
      return;
    }
    u || (s = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    l = a(), s && v();
  }).observe(e);
  function d({ message: g, severity: m = "info", category: N = "Tools", line: y, source: w }) {
    if (!g) return;
    const C = s, _ = /* @__PURE__ */ new Date(), I = document.createElement("li"), S = document.createElement("time"), M = document.createElement("span"), B = document.createElement("strong");
    m = ["error", "warning", "info"].includes(m) ? m : "info", I.className = m, I.dataset.logSequence = String(++o), I.dataset.logCategory = N, I.dataset.logSeverity = m, S.dateTime = _.toISOString(), S.textContent = _.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), S.title = S.dateTime, B.textContent = m.toUpperCase() + " · " + N + " ", M.append(B, document.createTextNode((w && w !== "input.cir" ? w + " · " : "") + (y ? "line " + y + " · " : "") + g)), I.append(S, M), e.append(I), t("message-count").textContent = o + " entries", m !== "info" && r(!0), C && v();
  }
  return { append: d };
}
const tn = Ke.filter.source, W = (t) => document.getElementById("spice-" + t), ye = W("app"), Te = Or(W);
if (ye) {
  let s = function(O, { severity: P = "info", category: Q = "Rendering" } = {}) {
    n.textContent = O, i.append({ message: O, severity: P, category: Q });
  }, re = function() {
    const O = e.querySelector("svg");
    if (!O) return;
    a?.resetLabelDisplay();
    const P = Number(O.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, Q = Ar(O, P), q = a?.placeLabels() || Q;
    O.dataset.labelBounds = JSON.stringify(q);
    const X = Math.min(I.x, q.x - 20), p = Math.min(I.y, q.y - 20);
    I = { x: X, y: p, w: Math.max(I.x + I.w, q.right + 20) - X, h: Math.max(I.y + I.h, q.bottom + 20) - p }, c && wo(O, v, c), a?.refreshColors(), lt(O, te(), W("show-grid").checked, _);
    const k = O.cloneNode(!0);
    a?.cleanExport(k), k.setAttribute("width", I.w), k.setAttribute("height", I.h), k.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`), lt(k, te(), W("show-grid").checked, I), b = new XMLSerializer().serializeToString(k), W("source").value = b;
  }, le = function(O) {
    const P = W("example-info");
    if (P && (P.replaceChildren(), !!O && (P.append(document.createTextNode(O.description + " ")), O.url))) {
      const Q = document.createElement("a");
      Q.href = O.url, Q.target = "_blank", Q.rel = "noopener noreferrer", Q.textContent = O.reference, P.append(Q);
    }
  }, ne = function() {
    a.invalidate(), L.setEnabled(!1), u = null, r = null, b = "", K(), le(Object.values(Ke).find((O) => O.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, Ie = function(O) {
    for (const P of O) {
      const Q = JSON.stringify([P.severity, P.line, P.message, P.source]);
      o.has(Q) || (o.add(Q), i.append({ ...P, category: "Parser / rendering" }));
    }
  }, we = function() {
    !C && b && x.set(y, { ..._ }), e.querySelector("svg")?.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`);
    const O = e.querySelector("svg");
    O && lt(O, te(), W("show-grid").checked, _), W("zoom-level").textContent = Math.round(I.w / _.w * 100) + "%";
  }, me = function(O, P = _.x + _.w / 2, Q = _.y + _.h / 2) {
    if (!e.querySelector("svg")) return;
    const q = Math.max(0.05, Math.min(10, _.w * O / I.w)) * I.w / _.w;
    _ = { x: P + (_.x - P) * q, y: Q + (_.y - Q) * q, w: _.w * q, h: _.h * q }, we();
  }, Ee = function(O) {
    const P = new URLSearchParams();
    O && P.set("instance", O);
    const Q = P.toString();
    location.hash.slice(1) === Q ? (y = O, ge()) : location.hash = Q;
  }, Me = function() {
    y = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, Ne = function() {
    const O = !!(w && w !== y && g?.contexts[w]);
    W("selection-actions").hidden = !O, W("open-instance").href = "#" + new URLSearchParams({ instance: w });
  }, be = function() {
    W("breadcrumbs").replaceChildren();
    const O = (Q, q) => {
      const X = document.createElement("button");
      X.type = "button", X.textContent = Q, X.onclick = () => Ee(q), X.disabled = q === y, W("breadcrumbs").append(X);
    };
    if (O("Top", ""), y) {
      const Q = g.contexts[y].path;
      for (let q = 0; q < Q.length; q++) O(Q[q], Q.slice(0, q + 1).map(encodeURIComponent).join("/"));
    }
    W("instances").replaceChildren();
    const P = (Q, q) => {
      for (const X of Q.children) {
        const p = document.createElement("div");
        p.className = "spice-instance-row", p.style.setProperty("--depth", Math.min(q, 8)), p.dataset.instance = X.id;
        const k = document.createElement("a");
        k.href = "#" + new URLSearchParams({ instance: X.id }), k.textContent = X.name + " · " + X.definition, k.title = "Open " + X.id + " as its own sheet";
        const T = document.createElement("span");
        if (T.className = "spice-help", T.textContent = Object.entries(X.params).map(([D, Y]) => D + "=" + Y).join(" · "), p.append(k), T.textContent) {
          const D = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", D.append(Y, T), p.append(D);
        }
        W("instances").append(p), P(X, q + 1);
      }
    };
    P(g.contexts[y], 0), W("hierarchy-panel").hidden = !g.contexts[y].children.length, W("focus-title").textContent = y ? y + " / " + g.contexts[y].definition : "Top-level schematic", Ne();
  }, f = function(O) {
    let P = !1;
    const Q = O.some((X) => X.kind === "netlist"), q = [];
    W("upload-choices").replaceChildren(), W("upload-error").textContent = "";
    for (const X of O) {
      const p = document.createElement("label"), k = document.createElement("span"), T = document.createElement("select");
      k.textContent = X.name, T.setAttribute("aria-label", "Role for " + X.name);
      for (const [Y, F] of [["netlist", "Main netlist"], ["library", "Library / include"]]) {
        const j = document.createElement("option");
        j.value = Y, j.textContent = F, T.append(j);
      }
      const D = !P && (X.kind === "netlist" || X.kind === "unknown" && !Q);
      T.value = D ? "netlist" : "library", D && (P = !0), q.push(T), p.append(k, T), W("upload-choices").append(p);
    }
    return W("confirm-upload").onclick = () => {
      try {
        Ht(O.map((X, p) => ({ ...X, kind: q[p].value }))), h.close("apply");
      } catch (X) {
        W("upload-error").textContent = X.message;
      }
    }, new Promise((X) => {
      h.returnValue = "cancel", h.addEventListener("close", () => X(h.returnValue === "apply" ? O.map((p, k) => ({ ...p, kind: q[k].value })) : null), { once: !0 }), h.showModal();
    });
  };
  br(ye), vo(ye);
  const t = W("input"), e = W("preview"), n = W("status"), i = Tr(W);
  let o = /* @__PURE__ */ new Set(), u = null, r = null, l = !1, a = null, c = null, v = [], b = "", d, g, m, N = "", y = "", w = "", C = !1, _ = { x: 0, y: 0, w: 1, h: 1 }, I = { ..._ }, S, M = !1, B = {}, E = !1, x = /* @__PURE__ */ new Map(), H = !1;
  try {
    B = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ye.addEventListener("click", (O) => {
    C && O.target.closest('a[href^="#"]') && O.preventDefault();
  });
  const K = () => {
    W("generate").disabled = C || H || E, W("upload").disabled = C || H || E || l, W("download-project").disabled = W("open-download").disabled = W("copy").disabled = W("download").disabled = !b || C || H || a?.working(), W("download-asc").disabled = W("download-asc-bundle").disabled = !b || !u || C || l || !a?.complete();
  }, $ = () => ({ font: W("font").value, fontSize: Number(W("size").value), color: Lt, gridSize: W("grid").checked && W("conventional").checked ? Ot : 0, detailed: W("detailed").checked, conventional: W("conventional").checked }), te = () => d?.layout.report?.gridSize ? Number(W("grid-size").value) : 0, L = xo(W, (O, P) => {
    c = O, v = P, re();
  });
  a = Lo(e, W, { report: i.append, applyLayoutTemplate: G, getNetColor: (O) => {
    const P = v.find((Q) => Q.bit === O);
    return P && c && (c.auto || c.manual.has(P.name)) ? c.color(P.name) : null;
  }, inspect: (O, P) => {
    const Q = d?.components.find((q) => q.name === O);
    if (Q)
      w = Q.instanceId || "", W("selection").textContent = Q.raw, Ne();
    else if (P?.decoration) {
      w = "";
      const q = Object.values(d.nodes).find((X) => X.bit === P.ports[0]?.bit);
      W("selection").textContent = "Ground symbol · " + (q?.displayName || "0"), Ne();
    }
  }, changed: (O, P, Q) => {
    u = O, r = null, I = Q;
    const q = e.querySelector("svg");
    if (q) {
      q.setAttribute("width", String(I.w)), q.setAttribute("height", String(I.h));
      const X = q.querySelector("#spice-layout-report");
      if (X) {
        const p = JSON.parse(X.textContent);
        p.manualWiring = P, p.verifiedTerminals = !P.unrouted, p.geometricConnectivityVerified = !P.unrouted, X.textContent = JSON.stringify(p);
      }
    }
    d && m && (W("json").value = JSON.stringify({ circuit: d, netlist: Xe(d), hierarchy: m, interactive: { ...P, drawing: O } }, null, 2)), re(), K();
  } }), W("show-grid").onchange = re, W("grid-size").onchange = () => {
    re(), we();
  };
  async function G(O, P, Q) {
    const q = g, X = t.value, p = $(), k = Po(q, O, P), T = a.snapshotSheets(), D = [], Y = (j) => JSON.stringify(j) === JSON.stringify(p);
    async function F(j) {
      const V = Xe(j), J = await it(V, p), Z = new DOMParser().parseFromString(J.svg, "image/svg+xml").documentElement;
      for (const ce of Object.values(j.nodes)) for (const fe of Z.querySelectorAll(".net_" + ce.bit)) fe.setAttribute("data-net", ce.name);
      return { drawing: At(Z, J.drawing, j, V), svg: Z };
    }
    for (const j of k.instances) {
      const V = T.find((Se) => Se.scope === j.source && Y(Se.settings)), J = T.find((Se) => Se.scope === j.target && Y(Se.settings)), Z = await F(j.sourceCircuit), ce = await F(j.targetCircuit), fe = V?.snapshot || Z.drawing;
      ht(Z.drawing, fe, 4);
      const Oe = /* @__PURE__ */ new Map(), nt = /* @__PURE__ */ new Map();
      for (const Se of ce.svg.querySelectorAll("text")) {
        if (Se.closest("defs")) continue;
        const Pe = Se.closest('g[id^="cell_"]')?.id.slice(5) || "", ot = Oe.get(Pe) || 0;
        Oe.set(Pe, ot + 1), nt.set(gt(Pe, ot), Se.textContent);
      }
      const ze = Do(fe, ce.drawing, j, { targetLabels: nt, targetOverrides: J?.snapshot.labelOverrides || [] });
      It(ce.svg, ze.labelOverrides), D.push({ scope: j.target, topology: j.targetCircuit.topology.signature, settings: p, snapshot: ze, templateSource: j.source });
    }
    if (!Q() || g !== q || t.value !== X || !Y($())) throw Error("Layout template cancelled because the current circuit changed.");
    for (const j of D) a.saveTemplateSheet(j);
    i.append({ category: "Tools", message: "Layout template applied to " + D.length + " subcircuit page(s), including all nested instances." });
  }
  async function ee() {
    (!u || !d?.layout.report?.gridVerified) && (W("grid").checked = !0, W("conventional").checked = !0, await ge({ resetEditor: !0 })), a.setEnabled(Te.enabled()), K();
  }
  W("interactive").onclick = async () => {
    Te.set(!Te.enabled()), await ee(), e.focus({ preventScroll: !0 });
  }, W("label-edit").onclick = async () => {
    Te.set(!0), await ee(), a.setLabelEditing(!a.labelEditing()), e.focus({ preventScroll: !0 });
  }, W("group").onclick = () => {
    a.toggleGroup(), e.focus({ preventScroll: !0 });
  };
  const z = W("clear-wires-dialog");
  let ie = null;
  W("flywire").onclick = () => {
    !a.canEdit() || a.working() || (ie = { tree: g, focus: y }, z.showModal());
  }, W("cancel-clear-wires").onclick = () => z.close(), W("confirm-clear-wires").onclick = () => {
    const O = ie;
    z.close(), !(O?.tree !== g || O?.focus !== y || !Te.enabled() || a.working()) && (a.clear(), K());
  }, z.addEventListener("close", () => {
    ie = null, W("flywire").focus({ preventScroll: !0 });
  }), ye.addEventListener("spice:workspacechange", () => {
    z.open && z.close();
  }), document.addEventListener("keydown", (O) => {
    z.open && !(O.altKey && O.key === "Escape") && (O.stopImmediatePropagation(), O.key === "Escape" && (O.preventDefault(), z.close()));
  }, { capture: !0 }), W("layout-brush").onclick = () => {
    a.toggleLayoutBrush(), e.focus({ preventScroll: !0 });
  }, W("auto-route").onclick = async () => {
    Te.set(!0), await ee(), await a.autoRoute(), K();
  }, W("wire-undo").onclick = () => a.undo(), W("wire-redo").onclick = () => a.redo();
  for (const O of ye.querySelectorAll("[data-editor-mode]")) O.onclick = async () => {
    Te.set(!0), await ee(), a.chooseTool(O.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const O of ye.querySelectorAll("[data-editor-arrange]")) O.onclick = () => {
    a.arrange(O.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  L.setEnabled(!1), t.value = tn;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || tn;
  } catch {
  }
  le(Object.values(Ke).find((O) => O.source === t.value)), t.addEventListener("input", ne);
  for (const O of ["font", "size", "detailed", "conventional", "grid"]) W(O).addEventListener("input", ne);
  new ResizeObserver(() => {
    const O = e.querySelector("svg");
    O && lt(O, te(), W("show-grid").checked, _);
  }).observe(e), W("zoom-in").onclick = () => me(0.8), W("zoom-out").onclick = () => me(1.25), W("fit").onclick = () => {
    _ = { ...I }, we();
  };
  const Ae = (O) => {
    const P = e.querySelector("svg");
    return P ? new DOMPoint(O.clientX, O.clientY).matrixTransform(P.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (O) => {
    const P = Ae(O);
    P && (O.preventDefault(), me(O.deltaY > 0 ? 1.12 : 1 / 1.12, P.x, P.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (O) => {
    ![0, 1].includes(O.button) || !e.querySelector("svg") || (S = { start: Ae(O), x: O.clientX, y: O.clientY, view: { ..._ }, moved: !1 }, e.setPointerCapture(O.pointerId));
  }), e.addEventListener("pointermove", (O) => {
    if (!S) return;
    const P = Ae(O);
    Math.hypot(O.clientX - S.x, O.clientY - S.y) > 4 && (S.moved = !0), _.x += S.start.x - P.x, _.y += S.start.y - P.y, we();
  }), e.addEventListener("pointerup", (O) => {
    if (!S) return;
    const P = S.moved;
    if (S = null, e.hasPointerCapture(O.pointerId) && e.releasePointerCapture(O.pointerId), !P && !a?.labelEditing()) {
      const Q = document.elementFromPoint(O.clientX, O.clientY)?.closest("[data-component]"), q = d?.components.find((X) => X.name === Q?.dataset.component);
      q && (w = q.instanceId || "", W("selection").textContent = `${q.raw}
${Object.entries(q.terminals).map(([X, p]) => `${X} → ${p}`).join("   ")}`, q.kind === "X" ? Ee(q.instanceId) : Ne());
    }
  }), window.addEventListener("hashchange", () => {
    if (C) {
      M = !0;
      return;
    }
    Me(), w = "", ge();
  }), e.addEventListener("pointercancel", () => {
    S = null;
  }), e.addEventListener("keydown", (O) => {
    const P = O.target.closest("[data-instance]");
    if (P && !a?.layoutBrushActive() && !a?.labelEditing() && (O.key === "Enter" || O.key === " ")) {
      O.preventDefault(), w = P.dataset.instance, Ee(w);
      return;
    }
    O.key === "+" || O.key === "=" ? me(0.8) : O.key === "-" ? me(1.25) : O.key.toLowerCase() === "f" ? (_ = { ...I }, we()) : O.key.startsWith("Arrow") && (O.preventDefault(), _.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[O.key] || 0) * _.w, _.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[O.key] || 0) * _.h, we());
  });
  async function ge({ resetEditor: O = !1 } = {}) {
    if (C) return;
    o = /* @__PURE__ */ new Set(), C = !0, a.invalidate(), L.setEnabled(!1), u = null, r = null, b = "", K(), W("generate").disabled = !0, t.readOnly = !0, W("file").disabled = !0;
    for (const Q of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) Q.disabled = !0;
    s("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let P = [];
    try {
      if (N !== t.value || !g) {
        if (N && N !== t.value && (a.clearSheets(), x.clear()), m = Bt(t.value, { files: B }), P = [...m.diagnostics], P.some((V) => V.severity === "error"))
          throw g = null, Error("Fix the parser errors below before generating.");
        g = ft(m), N && N !== t.value ? (y = "", w = "", history.replaceState(null, "", location.pathname + location.search)) : Me(), N = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (P = [...m.diagnostics], Ie(P), P.some((V) => V.severity === "error")) throw Error("Fix the parser errors below before generating.");
      d = $e(g, { focus: y });
      for (const V of d.interfaceAliases) P.push({ severity: "info", message: `Instance boundary: ${V.ports.join(" = ")} share parent node ${V.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const Q = Xe(d);
      $().conventional && P.push(...d.layout.diagnostics);
      const q = await it(Q, $()), X = new DOMParser().parseFromString(q.svg, "image/svg+xml");
      if (X.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const p = X.documentElement, k = p.querySelector("#spice-layout-report");
      if (k) {
        d.layout.report = JSON.parse(k.textContent);
        const V = d.layout.report;
        if (P.push({ severity: "info", message: `Layout: compact signal flow; ${V.powerSourcesChecked} DC/ground symbols checked, ${V.powerOrderViolations} DC order preference(s) unmet. ${V.powerPass}. ${V.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), V.classicTemplateFallback && P.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), V.groundPlacement && P.push({ severity: "info", message: `Ground: ${V.groundPlacement}; ${V.straightenedGroundDrops || 0} return-path simplification(s).` }), V.explicitGroups && P.push({ severity: "info", message: `Layout comments: ${V.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), V.classicRails && P.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${V.railCount} shared voltage rails.` }), V.localClassicInstances?.length && P.push({ severity: "info", message: `${V.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), V.localClassicStages?.length && P.push({ severity: "info", message: `Classic transistor proximity active: ${V.localClassicStages.join(", ")}.` }), V.sharedClassicRails && P.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), V.mirroredTransistors?.length && P.push({ severity: "info", message: `Control-pin mirror choices: ${V.mirroredTransistors.join(", ")}.` }), V.recognizedMotifs?.length && P.push({ severity: "info", message: `Transistor structures: ${V.recognizedMotifs.map((J) => `${J.kind} (${J.members.join(", ")}; ${J.confidence})`).join("; ")}.` }), V.appliedMotifs?.length && P.push({ severity: "info", message: `Topology preferences applied to ${V.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), V.subnetFirstFallback && P.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + V.subnetFirstFallback }), V.pairCompactionFallback && P.push({ severity: "warning", message: "Pair proximity kept the original regions: " + V.pairCompactionFallback }), V.compoundPairFallback && P.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + V.compoundPairFallback }), V.pairConstraints?.length) {
          const J = V.pairConstraints.filter((Z) => Z.crossRegion && !Z.compacted).length;
          P.push({ severity: "info", message: `${V.pairConstraints.length - J} adjacent transistor pair(s); ${J} cross-region mirror row constraint(s).` });
        }
        V.netShortcuts && P.push({ severity: "info", message: `${V.netShortcuts} safe straight net shortcut(s); ${V.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), V.sharedRailFallback && P.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${V.sharedRailFallback}.` });
        for (const J of V.localClassicFallbacks || []) J.stage && P.push({ severity: "info", message: `Classic stage ${J.stage} uses automatic layout: ${J.reason || "No unobstructed local template"}.` });
        V.geometricConnectivityVerified && P.push({ severity: "info", message: `Net geometry verified; ${V.cyclesRemoved} same-net loop(s) and ${V.leavesRemoved} unused wire branch(es) removed.` }), Ie(P);
      }
      if (p.localName !== "svg" || p.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const T = Number(p.getAttribute("width")), D = Number(p.getAttribute("height")), Y = JSON.parse(p.getAttribute("data-label-bounds") || "null");
      I = { x: Math.min(-20, (Y?.x ?? 0) - 20), y: Math.min(-20, (Y?.y ?? 0) - 20) }, I.w = Math.max(T, Y?.right || 0) + 20 - I.x, I.h = Math.max(D, Y?.bottom || 0) + 20 - I.y, _ = { ...I }, p.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`), p.setAttribute("width", String(I.w)), p.setAttribute("height", String(I.h)), p.setAttribute("role", "img"), p.setAttribute("aria-label", d.title || "SPICE schematic"), p.setAttribute("style", "background:white");
      for (const V of d.components) {
        const J = X.getElementById("cell_" + V.name);
        if (!J) throw Error("Renderer omitted component " + V.name);
        J.setAttribute("data-component", V.name), V.kind === "X" && (J.setAttribute("data-instance", V.instanceId), J.setAttribute("role", "button"), J.setAttribute("tabindex", "0"), J.setAttribute("aria-label", "Open " + V.name));
        const Z = X.createElementNS(p.namespaceURI, "title");
        Z.textContent = V.raw + `
Resolved: ` + V.value + `
` + Object.entries(V.terminals).map(([ce, fe]) => ce + ": " + fe).join(", "), J.prepend(Z);
      }
      for (const V of Object.values(d.nodes))
        for (const J of p.querySelectorAll(".net_" + V.bit)) {
          J.setAttribute("data-net", V.name);
          const Z = X.createElementNS(p.namespaceURI, "title");
          Z.textContent = "Node " + V.displayName, J.append(Z);
        }
      const F = d.components.filter((V) => V.kind === "K").map((V) => ({ name: V.name, inductors: V.coupledInductors, value: V.value }));
      if (F.length) {
        const V = X.createElementNS(p.namespaceURI, "metadata");
        V.setAttribute("id", "spice-magnetic-couplings"), V.textContent = JSON.stringify(F), p.append(V);
        for (const J of F) for (const Z of J.inductors) {
          const ce = X.getElementById("cell_" + Z);
          if (!ce) continue;
          const fe = X.createElementNS(p.namespaceURI, "circle"), Oe = [...ce.children].find((Pe) => Pe.getAttribute("s:pid") === "A"), nt = Oe?.getAttribute("s:position"), ze = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[nt] || [0, 0];
          for (const [Pe, ot] of Object.entries({ cx: Number(Oe?.getAttribute("s:x")) + ze[0], cy: Number(Oe?.getAttribute("s:y")) + ze[1], r: 3, fill: $().color, stroke: "none", "data-coupling": J.name })) fe.setAttribute(Pe, String(ot));
          const Se = X.createElementNS(p.namespaceURI, "title");
          Se.textContent = J.name + " · dotted terminal: " + J.inductors.join(", "), fe.append(Se), ce.append(fe);
        }
      }
      u = q.drawing, b = new XMLSerializer().serializeToString(p), W("source").value = b, e.replaceChildren(document.importNode(p, !0)), we();
      const j = P.filter((V) => V.severity === "warning").length;
      n.textContent = `${d.components.filter((V) => !V.synthetic).length} components · ${Object.keys(d.nodes).length} nodes · ${d.topology.leafCount} primitive devices verified${d.interfaceAliases.length ? " · Parent-connected ports: " + d.interfaceAliases.map((V) => V.ports.join(" = ")).join("; ") + "." : ""}${j ? " · Review " + j + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${tt}.`, d.layout.report?.gridVerified && (n.textContent += ` Grid ${d.layout.report.gridSize}.`), d.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${d.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), d.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), i.append({ message: n.textContent, category: "Rendering", severity: j ? "warning" : "info" }), W("json").value = JSON.stringify({ circuit: d, netlist: Q, hierarchy: m }, null, 2), L.setCircuit(d, t.value), a.mount(e.querySelector("svg"), u, d, Q, $(), { reset: O, scope: y }), re(), !O && x.has(y) ? _ = { ...x.get(y) } : x.set(y, { ..._ }), we(), W("selection").textContent = "Click a component to inspect its original statement and pin connections.", be();
    } catch (Q) {
      if (e.replaceChildren(), b = "", W("source").value = "", W("json").value = "", W("nets").replaceChildren(), W("selection").textContent = "", s(Q.message, { severity: "error" }), !g)
        W("hierarchy-panel").hidden = !0, W("selection-actions").hidden = !0, W("breadcrumbs").replaceChildren();
      else if (!g.contexts[y]) {
        const q = document.createElement("button");
        q.type = "button", q.textContent = "Return to Top", q.onclick = () => Ee(""), W("breadcrumbs").replaceChildren(q);
      }
      L.setCircuit(null, t.value), Q.diagnostics && (P = Q.diagnostics), P.some((q) => q.severity === "error") || P.push({ severity: "error", line: 0, message: Q.message }), Ie(P);
    } finally {
      C = !1, W("generate").disabled = !1, t.readOnly = !1, W("file").disabled = !1;
      for (const Q of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) Q.disabled = !1;
      g && g.contexts[y] && be(), L.setEnabled(!!b), a.refreshControls(), e.setAttribute("aria-busy", "false"), K(), M && (M = !1, Me(), queueMicrotask(ge));
    }
  }
  W("generate").onclick = () => ge({ resetEditor: !0 });
  for (const O of ye.querySelectorAll("[data-example]")) O.onclick = () => {
    const P = Ke[O.dataset.example];
    t.value = P.source, ne(), le(P), ge();
  };
  const h = W("upload-dialog");
  W("cancel-upload").onclick = () => h.close("cancel"), h.addEventListener("cancel", (O) => {
    O.preventDefault(), h.close("cancel");
  }), ye.addEventListener("spice:workspacechange", () => {
    h.open && h.close("cancel");
  }), document.addEventListener("keydown", (O) => {
    h.open && !(O.altKey && O.key === "Escape") && (O.stopImmediatePropagation(), O.key === "Escape" && (O.preventDefault(), h.close("cancel")));
  }, { capture: !0 }), W("file").onchange = async (O) => {
    const P = [...O.target.files];
    if (P.length) {
      if (C || H || E) {
        O.target.value = "";
        return;
      }
      E = !0, K();
      try {
        if (P.length > 64 || P.reduce((T, D) => T + D.size, 0) > fn) throw Error("Upload exceeds 64 files or 32 MB.");
        const Q = await Promise.all(P.map(async (T) => ({ name: T.webkitRelativePath || T.name, text: await mo(T) }))), q = po(Q, t.value), X = q.needsChoice ? await f(q.files) : q.files;
        if (!X) {
          i.append({ category: "Files", message: "Upload cancelled. Current work was kept." });
          return;
        }
        const p = Ht(X);
        if (p.project) {
          await R(p.project.text);
          return;
        }
        const k = { ...B };
        for (const T of p.libraries) {
          for (const D of Object.keys(k)) We(D) === We(T.name) && delete k[D];
          Object.defineProperty(k, T.name, { value: T.text, enumerable: !0, configurable: !0, writable: !0 });
        }
        B = k;
        try {
          sessionStorage.setItem("spice-libraries-v3", JSON.stringify(B));
        } catch {
        }
        a.invalidate(), a.clearSheets(), x.clear(), g = null, N = "", p.netlist && (t.value = p.netlist.text, y = "", w = "", history.replaceState(null, "", location.pathname + location.search)), i.append({ category: "Files", message: (p.netlist ? "Opened " + p.netlist.name + ". " : "") + p.libraries.length + " library file(s) loaded." }), await ge();
      } catch (Q) {
        s("File could not be opened: " + Q.message, { severity: "error", category: "Files" });
      } finally {
        E = !1, O.target.value = "", K();
      }
    }
  };
  async function R(O) {
    H = !0, K();
    const P = ye.inert;
    ye.inert = !0;
    try {
      const Q = pn(O), q = Bt(Q.source, { files: Q.libraries });
      if (q.diagnostics.some((p) => p.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const X = ft(q);
      if (!X.contexts[Q.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const p of Q.sheets) {
        if (!X.contexts[p.scope]) throw Error("Unknown saved sheet: " + p.scope);
        if (p.templateSource && !X.contexts[p.templateSource]) throw Error("Unknown layout template source: " + p.templateSource);
        const k = $e(X, { focus: p.scope });
        if (k.topology.signature !== p.topology) throw Error("Saved topology differs from the netlist: " + (p.scope || "Top"));
        const T = new Map(k.components.filter((j) => j.kind !== "K").map((j) => [j.name, j]));
        for (const j of p.snapshot.components) {
          if (j.decoration) continue;
          const V = T.get(j.id);
          if (!V || j.ports.length !== Object.keys(V.terminals).length || j.ports.some((J) => k.nodes[V.terminals[J.pin]]?.bit !== J.bit)) throw Error("Saved pin connectivity differs from the netlist: " + j.id);
          T.delete(j.id);
        }
        if (T.size) throw Error("Saved sheet omits components.");
        s("Checking saved sheet " + (p.scope || "Top") + "…", { category: "Files" });
        const D = Xe(k), Y = await it(D, p.settings), F = new DOMParser().parseFromString(Y.svg, "image/svg+xml").documentElement;
        for (const j of Object.values(k.nodes)) for (const V of F.querySelectorAll(".net_" + j.bit)) V.setAttribute("data-net", j.name);
        It(F, p.snapshot.labelOverrides), ht(At(F, Y.drawing, k, D), p.snapshot, p.settings.gridSize);
      }
      Q.sheets.some((p) => p.scope === Q.focus && JSON.stringify(p.settings) === JSON.stringify(Q.settings)) || (s("Checking current sheet…", { category: "Files" }), await it(Xe($e(X, { focus: Q.focus })), Q.settings)), a.invalidate(), a.restoreSheets(Q.sheets), x = new Map(Q.sheets.filter((p) => p.view).map((p) => [p.scope, p.view])), x.set(Q.focus, Q.view), t.value = Q.source, B = Q.libraries, g = X, m = q, N = Q.source, y = Q.focus, w = "";
      for (const p of ["font", "size"]) W(p).value = p === "font" ? Q.settings.font : Q.settings.fontSize;
      for (const [p, k] of Object.entries({ detailed: Q.settings.detailed, conventional: Q.settings.conventional, grid: !!Q.settings.gridSize, "show-grid": Q.showGrid })) W(p).checked = k;
      Te.set(Q.interactive), W("grid-size").value = Q.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (y ? "#" + new URLSearchParams({ instance: y }) : "")), L.restore(Q.colors), le(Object.values(Ke).find((p) => p.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(B)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      i.append({ category: "Files", message: Object.keys(B).length + " project library file(s) loaded." }), await ge(), b && (a.setLabelEditing(Q.labelEditing === !0), n.textContent += " Project restored.", i.append({ message: "Project restored.", category: "Files" }));
    } finally {
      ye.inert = P, H = !1, K();
    }
  }
  const A = W("download-dialog");
  ye.addEventListener("spice:workspacechange", () => {
    A.open && A.close();
  }), W("open-download").onclick = () => {
    K(), A.showModal();
  }, W("close-download").onclick = () => A.close(), A.addEventListener("click", (O) => {
    if (O.target !== A) return;
    const P = A.getBoundingClientRect();
    (O.clientX < P.left || O.clientX > P.right || O.clientY < P.top || O.clientY > P.bottom) && A.close();
  }), document.addEventListener("keydown", (O) => {
    A.open && !(O.altKey && O.key === "Escape") && (O.stopImmediatePropagation(), O.key === "Escape" && (O.preventDefault(), A.close()));
  }, { capture: !0 }), W("upload").onclick = () => W("file").click(), W("download-project").onclick = () => {
    try {
      const O = a.snapshotSheets().filter((X) => g?.contexts[X.scope] && $e(g, { focus: X.scope }).topology.signature === X.topology).map((X) => ({ ...X, ...x.has(X.scope) ? { view: x.get(X.scope) } : {} })), P = Oo({ source: t.value, libraries: B, settings: $(), displayGridStep: Number(W("grid-size").value), showGrid: W("show-grid").checked, interactive: Te.enabled(), flywire: !1, labelEditing: a.labelEditing(), focus: y, view: { ..._ }, colors: L.snapshot(), sheets: O });
      A.close();
      const Q = URL.createObjectURL(new Blob([P], { type: "application/json;charset=utf-8" })), q = document.createElement("a");
      q.href = Q, q.download = "spice-schematic.spiceproj", q.click(), setTimeout(() => URL.revokeObjectURL(Q), 1e3), s("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (O) {
      s("Project save failed: " + O.message, { severity: "error", category: "Files" });
    }
  }, W("download").onclick = () => {
    A.close();
    const O = URL.createObjectURL(new Blob([b], { type: "image/svg+xml;charset=utf-8" })), P = document.createElement("a");
    P.href = O, P.download = "spice-schematic.svg", P.click(), setTimeout(() => URL.revokeObjectURL(O), 1e3), s("SVG downloaded.", { category: "Export" });
  };
  async function oe(O) {
    const P = u;
    if (!(!P || C || l)) {
      l = !0, K(), s("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: Q } = await import("./asc-export-CiQfCooM.js");
        if (u !== P) throw Error("Schematic changed. Generate again before exporting ASC.");
        r ||= Q({ tree: g, circuit: d, drawing: P, source: t.value, libraries: B });
        const q = O ? r.zip : r.ascBytes, X = URL.createObjectURL(new Blob([q], { type: O ? "application/zip" : "application/octet-stream" })), p = document.createElement("a");
        p.href = X, p.download = O ? "spice-schematic-asc.zip" : "spice-schematic.asc", p.click(), setTimeout(() => URL.revokeObjectURL(X), 1e3), n.textContent = "ASC connections verified · " + r.manifest.audit.symbols + " symbols. " + (O ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), r.manifest.warnings.length && (n.textContent += " " + r.manifest.warnings.join(" ")), i.append({ message: n.textContent, category: "Export", severity: r.manifest.warnings.length ? "warning" : "info" });
      } catch (Q) {
        s("ASC export failed: " + Q.message, { severity: "error", category: "Export" });
      } finally {
        l = !1, K();
      }
    }
  }
  W("download-asc").onclick = () => {
    A.close(), oe(!1);
  }, W("download-asc-bundle").onclick = () => {
    A.close(), oe(!0);
  }, W("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(b), s("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      W("source-details").open = !0, W("source").focus(), W("source").select(), s("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, ge();
}
export {
  _t as b,
  ft as e,
  Fe as l,
  dt as n,
  Gn as p
};
