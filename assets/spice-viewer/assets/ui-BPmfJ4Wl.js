const Wt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, qt = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, zt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, $t = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Xt = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Yt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Kt = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Zt = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Jt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, en = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, tn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, nn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, on = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, rn = {
  AND: Wt,
  BUF: qt,
  COUNTER: zt,
  DFLOP: $t,
  SCHMITT: Xt,
  OR: Yt,
  PHASEDET: Kt,
  SRFLOP: Zt,
  XOR: Jt,
  MODULATOR: en,
  OTA: tn,
  SAMPLEHOLD: nn,
  VARISTOR: on
}, sn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Te = (t) => t.toLowerCase(), pt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), an = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function cn(t, e) {
  const n = (C) => e[Te(C || "")] || Object.entries(e).find(([w]) => w.startsWith(Te(C || "") + "."))?.[1], r = t[0][0].toUpperCase();
  let i = [], s = [], d = "", a = "", c = [], f = [], u = 0, m = "", h = "", b = "", x = !0;
  if ("RLC".includes(r))
    i = ["A", "B"], a = Te(r) + "_v";
  else if ("DVIB".includes(r))
    i = ["+", "-"], a = r === "D" ? "d_v" : r === "B" ? "spice_b" : Te(r);
  else if (r === "Q") {
    i = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !pt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && i.push("S"), d = t[i.length + 1] || "";
    const C = n(d)?.type;
    x = ["NPN", "PNP"].includes(C), a = x ? (i.length === 3 ? "q_" : "spice_q4_") + Te(C) : "spice_q" + i.length;
  } else if (r === "M") {
    const C = n(t[4]), w = n(t[5]), y = C?.type === "VDMOS" || !w && (!t[5] || pt(t[5]));
    i = y ? ["D", "G", "S"] : ["D", "G", "S", "B"], d = t[i.length + 1] || "";
    const _ = n(d), T = _?.type;
    if (y && _ && T !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!y && T === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    x = ["NMOS", "PMOS", "VDMOS"].includes(T);
    let R = null, S = _;
    const O = /* @__PURE__ */ new Set();
    for (; S && !O.has(S.name) && (O.add(S.name), R = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(S.raw), !R); )
      S = n(S.baseModel);
    const V = T === "PMOS" || T === "VDMOS" && R && (R[1] === void 0 || Number(R[1]) >= 0.5);
    a = x ? "spice_" + (V ? "pmos" : "nmos") + (y ? "3" : "") : "spice_m";
  } else if ("JZ".includes(r)) {
    d = t[4] || "";
    const C = n(d)?.type, w = r === "Z" && ["NIGBT", "PIGBT"].includes(C);
    i = w ? ["C", "G", "E"] : ["D", "G", "S"], x = r === "J" ? ["NJF", "PJF"].includes(C) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(C), a = "spice_" + (w ? "igbt" : r === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(C || "") ? "p" : "n");
  } else if ("EFGH".includes(r)) {
    i = ["+", "-"], a = "spice_" + Te(r);
    let C = 3, w = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[C] || "");
    if (/^poly$/i.test(t[C] || "") && (w = /^\(\s*(\d+)\s*\)$/.exec(t[++C] || ""), !w))
      throw Error("POLY requires a dimension.");
    if (w) {
      const y = Number(w[1]);
      if (y > 128) throw Error("POLY supports at most 128 controlling variables.");
      let _ = C + 1, T = [];
      const R = "EG".includes(r), S = y * (R ? 2 : 1);
      for (; T.length < S && _ < t.length; ) T.push(...an(t[_++]));
      if (T.length !== S || _ >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (R) {
        for (let O = 0; O < y; O++) i.push("C" + (O + 1) + "+", "C" + (O + 1) + "-");
        s = [t[1], t[2], ...T];
      } else c = T;
      u = _, m = "POLY(" + y + ") " + (R ? "" : T.join(" ") + " "), h = "POLY", R && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? h = "BEHAVIORAL" : "EG".includes(r) ? (i.push("C+", "C-"), h = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], u = 4, m = t[3] + " ");
    b = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[r] + (h ? " · " + h : "");
  } else if (r === "S")
    i = ["A", "B", "C+", "C-"], d = t[5] || "", a = "spice_device", b = "Voltage switch";
  else if (r === "W")
    i = ["A", "B"], c = [t[3]], d = t[4] || "", u = 3, a = "spice_device", b = "Current switch";
  else if ("TO".includes(r))
    i = ["L+", "L-", "R+", "R-"], r === "O" && (d = t[5] || ""), a = "spice_device", b = r === "T" ? "Transmission line" : "Lossy line";
  else if (r === "U")
    i = ["N1", "N2", "COM"], d = t[4] || "", a = "spice_device", b = "Distributed RC";
  else if (r === "A")
    i = Array.from({ length: 8 }, (C, w) => "P" + (w + 1)), a = "spice_device", b = t[9] || "A function";
  else if (r === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (f = t.slice(1, -1), f.some((C) => !/^L/i.test(C.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, a = "spice_coupling", b = "Magnetic coupling", m = f.join(" ") + " · k=";
  } else if (r === "@")
    i = ["IN", "OUT"], a = "spice_device", b = "FRA";
  else if (r === "&")
    i = ["O+", "O-", "I+", "I-"], a = "spice_device", b = "FRA probe";
  else if (r === "Ö")
    i = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", b = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + r);
  if (u || (u = i.length + 1), s.length || (s = t.slice(1, i.length + 1)), s.length !== i.length) throw Error("Incomplete terminal list: expected " + i.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(r)) throw Error("Missing value, model, or expression after " + i.length + " terminals.");
  if (s.some((C) => /[=()]/.test(C) && !/^\{[\s\S]*\}$/.test(C))) throw Error("Invalid terminal token; check terminal count.");
  if (r === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (r === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (a = "spice_br"), r === "D" && (d = t[3] || ""), r === "@") {
    const C = t.slice(u).join(" ");
    for (const w of C.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      i.push(w[1].toUpperCase()), s.push(w[2]);
  }
  if (r === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((C) => !C)) throw Error("Missing controlling voltage source.");
  const E = i.map((C, w) => r === "A" && rn[(t[9] || "").toUpperCase()]?.[String(w + 1)] || C);
  return { kind: r, pins: i, nodeTokens: s, pinLabels: E, model: d, type: a, controlSource: c[0] || "", controlSources: c, coupledInductors: f, value: m + t.slice(u).join(" "), sourceMode: h, symbol: b, polarityKnown: x };
}
const ln = sn, dn = new Set(ln.split(" ")), Xe = () => /* @__PURE__ */ Object.create(null), ye = (t) => t.toLowerCase();
function He(t) {
  const e = [], n = [];
  let r = "", i = 0, s = "";
  for (let d = 0; d < t.length; d++) {
    const a = t[d];
    if (s) {
      r += a, a === s && t[d - 1] !== "\\" && (s = "");
      continue;
    }
    if (a === '"' || a === "'") {
      s = a, r += a;
      continue;
    }
    if (!i && (a === ";" || a === "$" && (!d || /\s/.test(t[d - 1])))) break;
    if ("({".includes(a) && (n.push(a), i++), ")}".includes(a) && (i--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !i ? (r && e.push(r), r = "") : r += a;
  }
  if (i || s) throw Error("Unclosed expression or quoted string.");
  return r && e.push(r), e;
}
function un(t, e = {}) {
  const n = [], r = [], i = [], s = Object.assign(Xe(), e.models), d = Xe(), a = (w, y, _) => n.push({ severity: w, line: y, message: _ });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, y) => {
    const _ = w.trim();
    !_ || _.startsWith("*") || (_.startsWith("+") ? c.length ? c.at(-1).text += " " + _.slice(1).trim() : a("error", y + 1, "Continuation has no preceding statement.") : c.push({ line: y + 1, text: _ }));
  });
  for (const w of c) {
    try {
      w.tokens = He(w.text);
    } catch (_) {
      a("error", w.line, _.message), w.tokens = [];
    }
    const y = w.tokens;
    if (/^\.model$/i.test(y[0] || ""))
      if (y.length < 3) a("error", w.line, ".model requires a name and device type.");
      else {
        const _ = /^ako:(.+)$/i.exec(y[2]), T = _ && y[3] && !y[3].startsWith("(") ? y[3].split("(")[0].toUpperCase() : "";
        s[ye(y[1])] = { name: y[1], type: _ ? T : y[2].split("(")[0].toUpperCase(), baseModel: _?.[1] || "", raw: w.text };
      }
  }
  const f = /* @__PURE__ */ new Set();
  function u(w) {
    const y = s[ye(w)];
    if (!y) return "";
    if (y.type) return y.type;
    if (f.has(ye(w))) throw Error("Circular AKO model inheritance: " + w);
    return f.add(ye(w)), y.type = u(y.baseModel), f.delete(ye(w)), y.type;
  }
  for (const w of Object.values(s)) if (w.baseModel && !w.type)
    try {
      u(w.name);
    } catch (y) {
      a("error", 0, y.message);
    }
  let m = "", h = 0, b = !1, x = !1;
  const E = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: w, text: y, tokens: _ } of c) {
    if (!_.length) continue;
    const T = ye(_[0]);
    if (x) {
      a("warning", w, "Statement after .end is not rendered: " + y);
      continue;
    }
    if (T === ".control") {
      b = !0, a("warning", w, ".control script retained but not executed or rendered.");
      continue;
    }
    if (T === ".endc") {
      b = !1;
      continue;
    }
    if (b) continue;
    if (T === ".subckt") {
      h++, a("error", w, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (T === ".ends") {
      h ? h-- : a("error", w, "Unmatched .ends.");
      continue;
    }
    if (h) continue;
    if (T === ".end") {
      x = !0;
      continue;
    }
    if (T.startsWith(".")) {
      r.push({ line: w, text: y }), T === ".title" ? m = _.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(T) ? a("error", w, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(T) ? a("error", w, "Topology-changing directive is unsupported: " + y) : C.has(T) || a("warning", w, "Directive retained but not resolved: " + y);
      continue;
    }
    const R = _[0][0].toUpperCase();
    if (!dn.has(R)) {
      w === 1 && !/\d/.test(_[0]) && _.length > 1 && R !== "X" ? (m = y, a("warning", w, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", w, `Unsupported ${R} device was not rendered: ${y}`);
      continue;
    }
    const S = R === "M" || R === "Q" ? 5 : 4;
    if (w === 1 && !/\d/.test(_[0]) && (_.length < S || R === "T" && !/\b(?:zo|z0)\s*=/i.test(y))) {
      m = y, a("info", w, "SPICE title: " + y);
      continue;
    }
    try {
      if (E.has(T)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const O = cn(_, s), { pins: V, nodeTokens: g, ...p } = O;
      O.polarityKnown || a("warning", w, `${_[0]}: model polarity unknown; explicit ${V.join("/")} terminals retained.`);
      const D = Xe();
      V.forEach(($, q) => {
        const X = ye(g[q]);
        d[X] || (d[X] = { name: X, displayName: _[q + 1], bit: Object.keys(d).length + 2, terminals: [] }), d[X].terminals.push({ component: _[0], pin: $ }), D[$] = X;
      }), i.push({ ...p, name: _[0], terminals: D, line: w, raw: y }), E.add(T);
    } catch (O) {
      a("error", w, `${_[0]}: ${O.message} Statement: ${y}`);
    }
  }
  h && a("error", 0, "Unclosed .subckt definition."), b && a("error", 0, "Unclosed .control block."), i.length || a("error", 0, "No supported components to render."), i.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const w of i) {
    for (const y of w.controlSources || []) !y.includes(":") && !i.some((_) => ye(_.name) === ye(y) && _.kind === "V") && a("error", w.line, `${w.name}: controlling voltage source ${y} was not found.`);
    for (const y of w.coupledInductors || []) !y.includes(":") && !i.some((_) => ye(_.name) === ye(y) && _.kind === "L") && a("error", w.line, `${w.name}: coupled inductor ${y} was not found.`);
    (w.kind === "B" || w.type === "spice_b") && a("info", w.line, `${w.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: i, nodes: d, models: s, directives: r, diagnostics: n };
}
const Se = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), mt = (t) => Se(t).split("/").at(-1);
function fn(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const r = new Map(e instanceof Map ? e : Object.entries(e)), i = [], s = [], d = [];
  let a = 0;
  const c = (u, m) => {
    const h = Se(m).split("/").slice(0, -1).concat(Se(u)).join("/"), b = [...r].filter(([E]) => Se(E) === Se(u) || Se(E) === h);
    if (b.length === 1) return b[0];
    const x = [...r].filter(([E]) => mt(E) === mt(u));
    if (x.length !== 1) throw Error(x.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return x[0];
  };
  function f(u, m, h = "", b = []) {
    const x = Se(m) + ":" + h.toLowerCase();
    if (b.includes(x)) throw Error("Circular library include: " + [...b, x].join(" → "));
    if (b.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const E = [], C = /^\s*\.endl\b/im.test(u);
    let w = !h;
    const y = (T, R) => {
      if (a += T.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      d.push(T), s.push({ file: m, line: R + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((T, R) => {
      const S = T.trim();
      if (/^\.lib\b/i.test(S) && C) {
        const O = He(S);
        if (O.length === 2 && !/[.\\/]/.test(O[1])) {
          E.push(O[1].toLowerCase()), O[1].toLowerCase() === h.toLowerCase() && (w = !0), y("* Library section " + O[1], R);
          return;
        }
      }
      if (/^\.endl\b/i.test(S)) {
        E.pop(), y("* End library section", R);
        return;
      }
      if (h && E.length && !E.includes(h.toLowerCase())) {
        y("* Unselected library section", R);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(S))
        try {
          const O = He(S);
          if (!O[1]) throw Error("Include requires a filename.");
          const [V, g] = c(O[1], m);
          y("* Included " + V, R), f(g, V, O[2] || "", [...b, x]);
        } catch (O) {
          i.push({ severity: "error", line: R + 1, source: m, message: O.message }), y("* Unresolved include", R);
        }
      else y(T, R);
    }), !w) throw Error("Library section " + h + " not found in " + m);
  }
  try {
    f(t, n);
  } catch (u) {
    i.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: d.join(`
`), origins: s, diagnostics: i };
}
function hn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), r = [0], i = [];
  t.split(/\r?\n/).forEach((a, c) => {
    const f = a.trim();
    /^\.subckt\b/i.test(f) && (r.push(c + 1), n.set(c + 1, [])), r.at(-1) ? n.get(r.at(-1)).push({ raw: a, line: c + 1 }) : e[c] = a, /^\.ends\b/i.test(f) && r.length > 1 && r.pop();
  });
  const s = gt(Array.from({ length: t.split(/\r?\n/).length }, (a, c) => e[c] || "").join(`
`));
  i.push(...s.diagnostics);
  const d = /* @__PURE__ */ new Map();
  for (const [a, c] of n) {
    const f = gt(c.map((u) => u.raw).join(`
`));
    d.set(a, f.layout), i.push(...f.diagnostics.map((u) => ({ ...u, line: c[u.line - 1]?.line || a })));
  }
  return { layout: s.layout, scopes: d, diagnostics: i };
}
function gt(t) {
  const e = [], n = [];
  let r = !1, i = !1, s = 0;
  if (t.split(/\r?\n/).forEach((y, _) => {
    const T = y.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(T)) {
      (i || r) && e.push({ severity: "error", line: _ + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(T) || e.push({ severity: "error", line: _ + 1, message: "Expected @layout begin v1." }), i = !0, r = !0, s = _ + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(T)) {
      r || e.push({ severity: "error", line: _ + 1, message: "Unexpected @layout end." }), r = !1;
      return;
    }
    r && (T.startsWith("*") ? n.push(T.slice(1).trim()) : e.push({ severity: "error", line: _ + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), r && e.push({ severity: "error", line: s, message: "Unclosed @layout block." }), !i) return { layout: null, diagnostics: e };
  const d = n.join(" "), a = d.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], f = [], u = [], m = [];
  let h = 0, b = 0, x = 10;
  const E = () => a[h++], C = () => {
    const y = E();
    if (!y || !/^[A-Za-z_@][\w./%:@-]*$/.test(y)) throw Error("Expected layout identifier, got " + y);
    return y;
  };
  function w(y) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const _ = y ? C() : "@row" + b++, T = E();
    if (!["row", "column", "classic"].includes(T)) throw Error("Expected row, column or classic.");
    if (E() !== "{") throw Error("Expected { after " + T);
    const R = { id: _, direction: T, members: [] };
    for (c.push(R); h < a.length && a[h] !== "}"; )
      a[h] === "group" ? (E(), R.members.push(w(!0))) : ["row", "column"].includes(a[h]) ? R.members.push(w(!1)) : R.members.push(C());
    if (E() !== "}") throw Error("Unclosed group " + _);
    if (!R.members.length) throw Error("Empty layout group " + _);
    return _;
  }
  try {
    for (; h < a.length; )
      if (a[h] === "group")
        E(), w(!0);
      else if (["row", "column"].includes(a[h])) w(!1);
      else if (a[h] === "face") {
        E();
        const g = C(), p = E();
        if (!["left", "right"].includes(p)) throw Error("Expected face left or right.");
        if (m.some((D) => D.device.toLowerCase() === g.toLowerCase())) throw Error("Duplicate face device.");
        m.push({ device: g, side: p });
      } else if (a[h] === "pair") {
        E();
        const g = E();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(g)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (E() !== "{") throw Error("Expected { after pair kind.");
        const p = [];
        for (; h < a.length && a[h] !== "}"; ) p.push(C());
        if (E() !== "}" || !p.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: g, members: p });
      } else if (a[h] === "priority-cap") {
        if (E(), x = Number(E()), !Number.isInteger(x) || x < 3 || x > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const g = C(), p = E(), D = C();
        if (!["left-of", "above"].includes(p)) throw Error("Expected left-of or above.");
        f.push({ a: g, relation: p, b: D });
      } else throw Error("Unknown layout instruction near " + a[h - 1]);
    const y = /* @__PURE__ */ new Set();
    for (const g of c) {
      const p = g.id.toLowerCase();
      if (y.has(p)) throw Error("Duplicate layout group " + g.id);
      y.add(p);
    }
    const _ = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), R = new Map(c.map((g) => [g.id.toLowerCase(), g])), S = (g) => {
      if (_.has(g)) throw Error("Circular layout group " + g);
      if (!T.has(g)) {
        _.add(g);
        for (const p of R.get(g).members) R.has(p.toLowerCase()) && S(p.toLowerCase());
        _.delete(g), T.add(g);
      }
    };
    for (const g of R.keys()) S(g);
    const O = /* @__PURE__ */ new Map();
    for (const g of f) {
      if (g.a.toLowerCase() === g.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      O.has(g.a.toLowerCase()) || O.set(g.a.toLowerCase(), []), O.get(g.a.toLowerCase()).push(g.b.toLowerCase());
    }
    _.clear(), T.clear();
    const V = (g) => {
      if (_.has(g)) throw Error("Circular place constraints.");
      if (!T.has(g)) {
        _.add(g);
        for (const p of O.get(g) || []) V(p);
        _.delete(g), T.add(g);
      }
    };
    for (const g of O.keys()) V(g);
  } catch (y) {
    e.push({ severity: "error", line: s, message: "Layout description: " + y.message });
  }
  return { layout: { version: 1, priorityCap: x, groups: c, relations: f, pairs: u, faces: m }, diagnostics: e };
}
function pn(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let r = e.focus ? n : t.ir.layoutDescription;
  if (!r) return null;
  if (n) {
    const b = new Set(n.groups.map((E) => E.id.toLowerCase())), x = (E) => b.has(E.toLowerCase()) ? E : e.components.find((w) => w.synthetic && w.value.toLowerCase() === E.toLowerCase())?.name || e.focus + "/" + E;
    r = { ...n, groups: n.groups.map((E) => ({ ...E, members: E.members.map(x) })), relations: n.relations.map((E) => ({ ...E, a: x(E.a), b: x(E.b) })), faces: (n.faces || []).map((E) => ({ ...E, device: x(E.device) })), pairs: (n.pairs || []).map((E) => ({ ...E, members: E.members.map(x) })) };
  }
  const i = new Map(r.groups.map((b) => [b.id.toLowerCase(), b])), s = Object.values(t.contexts).flatMap((b) => b.devices.map((x) => x.name)), d = new Set([...Object.keys(t.contexts), ...s, ...e.components.map((b) => b.name)].map((b) => b.toLowerCase()));
  for (const b of i.values()) if (d.has((n ? e.focus + "/" + b.id : b.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + b.id);
  for (const b of i.values()) for (const x of b.members) if (!i.has(x.toLowerCase()) && !d.has(x.toLowerCase())) throw Error("Unknown @layout instance/device: " + x);
  for (const b of r.relations) for (const x of [b.a, b.b]) if (!i.has(x.toLowerCase()) && !d.has(x.toLowerCase())) throw Error("Unknown @layout place target: " + x);
  const a = (r.pairs || []).map((b) => ({ ...b, members: b.members.map((x) => {
    const E = e.components.find((C) => C.name.toLowerCase() === x.toLowerCase());
    if (!E || E.synthetic || E.block) throw Error("Unknown or non-visible @layout pair device: " + x);
    return E.name;
  }) })), c = (r.faces || []).map((b) => {
    const x = e.components.find((E) => E.name.toLowerCase() === b.device.toLowerCase());
    if (!x || !["Q", "M", "J", "Z"].includes(x.kind)) throw Error("Unknown or unsupported @layout face device: " + b.device);
    return { ...b, device: x.name };
  }), f = /* @__PURE__ */ new Map(), u = [], m = new Set(Object.keys(t.contexts).map((b) => b.toLowerCase()));
  for (const b of r.groups) {
    const x = [];
    for (const E of b.members) {
      if (i.has(E.toLowerCase())) {
        x.push({ group: E });
        continue;
      }
      for (const C of e.components) if (C.name.toLowerCase() === E.toLowerCase() || C.name.toLowerCase().startsWith(E.toLowerCase() + "/")) {
        if (f.has(C.name)) throw Error("Overlapping @layout membership: " + C.name);
        f.set(C.name, b.id), x.push({ cell: C.name, ...m.has(E.toLowerCase()) ? { instance: E } : {} });
      }
    }
    u.push({ id: b.id, direction: b.direction, members: x });
  }
  const h = /* @__PURE__ */ new Set();
  for (const b of u) for (const x of b.members) if (x.group) {
    const E = x.group.toLowerCase();
    if (h.has(E)) throw Error("Layout group has multiple parents: " + x.group);
    h.add(E);
  }
  return { version: 1, priorityCap: r.priorityCap, groups: u, relations: r.relations, pairs: a, faces: c };
}
const ke = () => /* @__PURE__ */ Object.create(null), be = (t) => t.toLowerCase();
function Mt(t) {
  const e = ke();
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    if (/^params?:$/i.test(r)) continue;
    const i = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(r);
    if (!i) throw Error("Expected named parameter assignment, got: " + r);
    const s = be(i[1]);
    let d = i[2];
    if (d === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + s);
      d = a[1];
    }
    if (d || (d = t[++n]), !d || /^params?:$/i.test(d)) throw Error("Missing value for parameter " + s);
    if (Object.hasOwn(e, s)) throw Error("Duplicate parameter: " + s);
    e[s] = d;
  }
  return e;
}
function bt(t) {
  const e = t.findIndex((n, r) => /^params?:$/i.test(n) || n.includes("=") || t[r + 1] === "=");
  return e < 0 ? [t, ke()] : [t.slice(0, e), Mt(t.slice(e))];
}
function yt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = fn(t, e);
  t = n.source;
  const r = hn(t), i = [...n.diagnostics, ...r.diagnostics], s = ke(), d = /* @__PURE__ */ new Set(["0"]), a = (y, _, T) => i.push({ severity: y, line: _, message: T }), c = (y, _, T, R = [], S = ke(), O = 0) => {
    const V = { id: y, name: _, parent: T, ports: R, defaults: S, parameters: ke(), definitions: ke(), devices: [], instances: [], directives: [], line: O, statements: [], layoutDescription: r.scopes.get(O) || null };
    return s[y] = V, V;
  }, f = c("root", "Top", null), u = [f], m = [];
  let h = !1, b = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, _) => {
    const T = y.trim();
    !T || T.startsWith("*") || (T.startsWith("+") ? m.length ? m.at(-1).text += " " + T.slice(1).trim() : a("error", _ + 1, "Continuation has no preceding statement.") : m.push({ text: T, line: _ + 1 }));
  });
  for (const { text: y, line: _ } of m)
    try {
      const T = He(y);
      if (!T.length) continue;
      const R = be(T[0]), S = u.at(-1);
      if (b) {
        a("warning", _, "Statement after .end is not rendered: " + y);
        continue;
      }
      if (R === ".control") {
        h = !0, a("warning", _, ".control script retained but not executed or rendered.");
        continue;
      }
      if (R === ".endc") {
        h = !1;
        continue;
      }
      if (h) continue;
      if (R === ".subckt") {
        if (T.length < 2) throw Error(".SUBCKT requires a name.");
        const [O, V] = bt(T.slice(2)), g = be(T[1]);
        if (Object.hasOwn(S.definitions, g)) throw Error("Duplicate subcircuit definition: " + T[1]);
        const p = O.map(be);
        if (new Set(p).size !== O.length || p.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (O.some(($) => /[{}()=]/.test($))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = S.id + "/" + encodeURIComponent(g);
        S.definitions[g] = D, u.push(c(D, T[1], S.id, O, V, _));
        continue;
      }
      if (R === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (T[1] && be(T[1]) !== be(S.name)) throw Error(".ENDS name does not match " + S.name);
        u.pop();
        continue;
      }
      if (R === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        b = !0;
        continue;
      }
      if (R === ".param") {
        const O = Mt(T.slice(1));
        for (const [V, g] of Object.entries(O)) {
          if (Object.hasOwn(S.parameters, V)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + V);
          S.parameters[V] = g;
        }
      }
      if (R === ".global") {
        if (T.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const O of T.slice(1)) d.add(be(O));
      }
      if (R.startsWith(".") && S.directives.push({ line: _, text: y }), R.startsWith("x")) {
        const [O, V] = bt(T.slice(1));
        if (!O.length) throw Error("X instance requires a subcircuit name.");
        const g = /;§pnba\s+(.+)$/i.exec(y)?.[1].split(")");
        S.instances.push({ name: T[0], nodes: O.slice(0, -1).map(be), definitionName: O.at(-1), definitionId: null, parameters: V, line: _, raw: y, pinNames: g });
      } else S.statements.push({ line: _, text: y });
    } catch (T) {
      a("error", _, T.message + " Statement: " + y);
    }
  u.length > 1 && a("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), h && a("error", 0, "Unclosed .control block.");
  function x(y, _) {
    for (; y; ) {
      if (Object.hasOwn(y.definitions, be(_))) return y.definitions[be(_)];
      y = s[y.parent];
    }
    return null;
  }
  for (const y of Object.values(s)) {
    const _ = [...y.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...y.statements], T = un(_.map((S) => S.text).join(`
`), { models: s[y.parent]?.models });
    y.devices = T.components.map((S) => ({ ...S, line: _[S.line - 1]?.line || y.line })), y.models = T.models, y === f && (f.title = T.title), i.push(...T.diagnostics.filter((S) => !S.message.includes("No supported components to render.") && !S.message.includes("300 components")).map((S) => ({ ...S, line: _[S.line - 1]?.line || y.line })));
    const R = new Set(y.devices.map((S) => be(S.name)));
    for (const S of y.instances)
      if (R.has(be(S.name)) && a("error", S.line, "Duplicate instance/device name: " + S.name), R.add(be(S.name)), S.definitionId = x(y, S.definitionName), !S.definitionId && !/^\{[\s\S]*\}$/.test(S.definitionName)) a("error", S.line, "Undefined subcircuit: " + S.definitionName + " in " + S.name);
      else if (S.definitionId) {
        const O = s[S.definitionId];
        O.ports.length !== S.nodes.length && a("error", S.line, `${S.name}: ${O.name} expects ${O.ports.length} ports; got ${S.nodes.length}.`);
      }
  }
  for (const y of Object.values(s)) delete y.statements;
  const E = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set();
  function w(y, _ = []) {
    if (E.has(y)) {
      a("error", s[y].line, "Circular subcircuit reference: " + [..._, s[y].name].join(" → "));
      return;
    }
    if (!C.has(y)) {
      if (E.add(y), _.length >= 64) {
        a("error", s[y].line, "Subcircuit dependency nesting exceeds 64 levels."), E.delete(y), C.add(y);
        return;
      }
      for (const T of s[y].instances) T.definitionId && w(T.definitionId, [..._, s[y].name]);
      E.delete(y), C.add(y);
    }
  }
  for (const y of Object.keys(s)) w(y);
  !f.devices.length && !f.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const y of i) !y.source && y.line && n.origins[y.line - 1] && (y.source = n.origins[y.line - 1].file, y.line = n.origins[y.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: f.title || "", scopes: s, globals: [...d], diagnostics: i, layoutDescription: r.layout };
}
const he = () => /* @__PURE__ */ Object.create(null), Ae = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), rt = (t, e) => Ae(t.map((n) => n.toLowerCase()), e.toLowerCase());
function mn(t, e = []) {
  const n = he(), r = (i) => n[i] || (n[i] = { name: i, displayName: i.split("/").map((s) => decodeURIComponent(s)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const i of t) for (const [s, d] of Object.entries(i.terminals)) r(d).terminals.push({ component: i.name, pin: s });
  for (const i of e) r(i);
  return n;
}
function gn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const wt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, bn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function We(t, e, n = (i) => i, r = (i) => i) {
  const i = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (d) => (i.push(d), "@@" + (i.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (d, a, c) => {
    const f = c.split(",").map((m) => m.trim());
    if (f.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + d);
    const u = a.toUpperCase() + "(" + f.map((m) => a.toLowerCase() === "v" ? n(m) : r(m, a)).join(",") + ")";
    return i.push(u), "@@" + (i.length - 1) + "@@";
  });
  let s = t.length;
  return t = t.replace(bn, (d, a, c) => {
    if (c.slice(a + d.length).trimStart().startsWith("(")) return d;
    const f = e(d.toLowerCase());
    if (f === void 0) return d;
    if (s += f.length + 2, s > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + f + ")";
  }), t.replace(/@@(\d+)@@/g, (d, a) => i[Number(a)]);
}
function yn(t, e, n, r) {
  const i = { ...e, ...n }, s = he(), d = /* @__PURE__ */ new Set(), a = he();
  for (const [f, u] of Object.entries(r)) a[f] = We(wt(u), (m) => t[m]);
  function c(f) {
    if (Object.hasOwn(a, f)) return a[f];
    if (Object.hasOwn(s, f)) return s[f];
    if (!Object.hasOwn(i, f)) return t[f];
    if (d.has(f)) {
      if (Object.hasOwn(t, f)) return t[f];
      throw Error("Circular parameter dependency: " + [...d, f].join(" → "));
    }
    return d.add(f), s[f] = We(wt(i[f]), c), d.delete(f), s[f];
  }
  for (const f of Object.keys(i)) c(f);
  return Object.assign(he(), t, s, a);
}
function it(t, e, n, r) {
  let i = "";
  for (let c = 0; c < t.length; ) {
    const f = t[c];
    if (f !== "{" && f !== "'") {
      i += f, c++;
      continue;
    }
    const u = c++;
    let m = 1, h = "";
    for (; c < t.length && m; c++) {
      if (f === "'") {
        t[c] === "'" && (m = 0);
        continue;
      }
      if (h) {
        t[c] === h && (h = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        h = t[c];
        continue;
      }
      t[c] === "{" && m++, t[c] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    i += f + We(t.slice(u + 1, c - 1), (b) => e[b], n, r) + (f === "{" ? "}" : "'");
  }
  const s = [];
  let d = 0, a = "";
  for (let c = 0; c < i.length; c++) {
    const f = i[c];
    if (a) {
      f === a && i[c - 1] !== "\\" && (a = "");
      continue;
    }
    if (f === '"' || f === "'") {
      a = f;
      continue;
    }
    if ("({".includes(f) && d++, ")}".includes(f) && d--, !d && (c === 0 || /\s/.test(i[c - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(i.slice(c));
      u && (s.push({ start: c, end: c + u[0].length, key: u[1].toLowerCase() }), c += u[0].length - 1);
    }
  }
  if (s.length) {
    let c = i.slice(0, s[0].start);
    s.forEach((f, u) => {
      const m = s[u + 1]?.start ?? i.length, h = i.slice(f.end, m);
      c += i.slice(f.start, f.end) + (h.includes("{") || ["refnode", "intnode"].includes(f.key) ? h : We(h, (b) => e[b], n, r));
    }), i = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (i = "{" + e[t.toLowerCase()] + "}");
  return i;
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
  add(e, n, r) {
    if (typeof arguments[0] != "string")
      for (let i in arguments[0])
        this.add(i, arguments[0][i], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(i) {
        this[i] = this[i] || [], n && this[i][r ? "unshift" : "push"](n);
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
class xn {
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
class M {
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
    return "JavaScript Expression Parser (JSEP) v" + M.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return M.max_unop_len = Math.max(e.length, M.max_unop_len), M.unary_ops[e] = 1, M;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, r) {
    return M.max_binop_len = Math.max(e.length, M.max_binop_len), M.binary_ops[e] = n, r ? M.right_associative.add(e) : M.right_associative.delete(e), M;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return M.additional_identifier_chars.add(e), M;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return M.literals[e] = n, M;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete M.unary_ops[e], e.length === M.max_unop_len && (M.max_unop_len = M.getMaxKeyLen(M.unary_ops)), M;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return M.unary_ops = {}, M.max_unop_len = 0, M;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return M.additional_identifier_chars.delete(e), M;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete M.binary_ops[e], e.length === M.max_binop_len && (M.max_binop_len = M.getMaxKeyLen(M.binary_ops)), M.right_associative.delete(e), M;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return M.binary_ops = {}, M.max_binop_len = 0, M;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete M.literals[e], M;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return M.literals = {}, M;
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
    return new M(e).parse();
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
    return M.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !M.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    M.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return M.isIdentifierStart(e) || M.isDecimalDigit(e);
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
    if (M.hooks[e]) {
      const r = { context: this, node: n };
      return M.hooks.run(e, r), r.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (M.hooks[e]) {
      const n = { context: this };
      return M.hooks[e].find(function(r) {
        return r.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === M.SPACE_CODE || e === M.TAB_CODE || e === M.LF_CODE || e === M.CR_CODE; )
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
      type: M.COMPOUND,
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
    let n = [], r, i;
    for (; this.index < this.expr.length; )
      if (r = this.code, r === M.SEMCOL_CODE || r === M.COMMA_CODE)
        this.index++;
      else if (i = this.gobbleExpression())
        n.push(i);
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
    let e = this.expr.substr(this.index, M.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (M.binary_ops.hasOwnProperty(e) && (!M.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !M.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, r, i, s, d, a, c, f;
    if (d = this.gobbleToken(), !d || (n = this.gobbleBinaryOp(), !n))
      return d;
    for (s = { value: n, prec: M.binaryPrecedence(n), right_a: M.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), i = [d, s, a]; n = this.gobbleBinaryOp(); ) {
      if (r = M.binaryPrecedence(n), r === 0) {
        this.index -= n.length;
        break;
      }
      s = { value: n, prec: r, right_a: M.right_associative.has(n) }, f = n;
      const u = (m) => s.right_a && m.right_a ? r > m.prec : r <= m.prec;
      for (; i.length > 2 && u(i[i.length - 2]); )
        a = i.pop(), n = i.pop().value, d = i.pop(), e = {
          type: M.BINARY_EXP,
          operator: n,
          left: d,
          right: a
        }, i.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + f), i.push(s, e);
    }
    for (c = i.length - 1, e = i[c]; c > 1; )
      e = {
        type: M.BINARY_EXP,
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
    let e, n, r, i;
    if (this.gobbleSpaces(), i = this.searchHook("gobble-token"), i)
      return this.runHook("after-token", i);
    if (e = this.code, M.isDecimalDigit(e) || e === M.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === M.SQUOTE_CODE || e === M.DQUOTE_CODE)
      i = this.gobbleStringLiteral();
    else if (e === M.OBRACK_CODE)
      i = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, M.max_unop_len), r = n.length; r > 0; ) {
        if (M.unary_ops.hasOwnProperty(n) && (!M.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !M.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += r;
          const s = this.gobbleToken();
          return s || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: M.UNARY_EXP,
            operator: n,
            argument: s,
            prefix: !0
          });
        }
        n = n.substr(0, --r);
      }
      M.isIdentifierStart(e) ? (i = this.gobbleIdentifier(), M.literals.hasOwnProperty(i.name) ? i = {
        type: M.LITERAL,
        value: M.literals[i.name],
        raw: i.name
      } : i.name === M.this_str && (i = { type: M.THIS_EXP })) : e === M.OPAREN_CODE && (i = this.gobbleGroup());
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
    for (; n === M.PERIOD_CODE || n === M.OBRACK_CODE || n === M.OPAREN_CODE || n === M.QUMARK_CODE; ) {
      let r;
      if (n === M.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== M.PERIOD_CODE)
          break;
        r = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === M.OBRACK_CODE ? (e = {
        type: M.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== M.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === M.OPAREN_CODE ? e = {
        type: M.CALL_EXP,
        arguments: this.gobbleArguments(M.CPAREN_CODE),
        callee: e
      } : (n === M.PERIOD_CODE || r) && (r && this.index--, this.gobbleSpaces(), e = {
        type: M.MEMBER_EXP,
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
    for (; M.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === M.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); M.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); M.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      M.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return r = this.code, M.isIdentifierStart(r) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (r === M.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === M.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: M.LITERAL,
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
    let i = !1;
    for (; this.index < this.expr.length; ) {
      let s = this.expr.charAt(this.index++);
      if (s === r) {
        i = !0;
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
    return i || this.throwError('Unclosed quote after "' + e + '"'), {
      type: M.LITERAL,
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
    for (M.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, M.isIdentifierPart(e)); )
      this.index++;
    return {
      type: M.IDENTIFIER,
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
    let r = !1, i = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let s = this.code;
      if (s === e) {
        r = !0, this.index++, e === M.CPAREN_CODE && i && i >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (s === M.COMMA_CODE) {
        if (this.index++, i++, i !== n.length) {
          if (e === M.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === M.CBRACK_CODE)
            for (let d = n.length; d < i; d++)
              n.push(null);
        }
      } else if (n.length !== i && i !== 0)
        this.throwError("Expected comma");
      else {
        const d = this.gobbleExpression();
        (!d || d.type === M.COMPOUND) && this.throwError("Expected comma"), n.push(d);
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
    let e = this.gobbleExpressions(M.CPAREN_CODE);
    if (this.code === M.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: M.SEQUENCE_EXP,
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
      type: M.ARRAY_EXP,
      elements: this.gobbleArguments(M.CBRACK_CODE)
    };
  }
}
const En = new wn();
Object.assign(M, {
  hooks: En,
  plugins: new xn(M),
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
M.max_unop_len = M.getMaxKeyLen(M.unary_ops);
M.max_binop_len = M.getMaxKeyLen(M.binary_ops);
const Me = (t) => new M(t).parse(), vn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(M).filter((t) => !vn.includes(t) && Me[t] === void 0).forEach((t) => {
  Me[t] = M[t];
});
Me.Jsep = M;
const _n = "ConditionalExpression";
var Nn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: _n,
            test: r,
            consequent: i,
            alternate: s
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let d = r;
            for (; d.right.operator && t.binary_ops[d.right.operator] <= 0.9; )
              d = d.right;
            n.node.test = d.right, d.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Me.plugins.register(Nn);
const Cn = "ConditionalExpression";
var Sn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, i = this.gobbleExpression();
        if (i || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: Cn,
            test: r,
            consequent: i,
            alternate: s
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let d = r;
            for (; d.right.operator && t.binary_ops[d.right.operator] <= 0.9; )
              d = d.right;
            n.node.test = d.right, d.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Me.plugins.register(Sn);
const In = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, xt = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, me = (t) => Number(t) > 0.5;
function De(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let r = 0;
  function i(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, f, u, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), h = u.toLowerCase(), b = h.startsWith("meg") ? 1e6 : h.startsWith("mil") ? 254e-7 : In[h[0]] || 1;
      return "(" + (m ? +(f + (f.includes(".") ? "" : ".") + m) : Number(f)) * b + ")";
    }), s(Me(a));
  }
  function s(a) {
    if (++r > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const c = a.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const f = i(e[c]);
      return n.delete(c), f;
    }
    if (a.type === "ConditionalExpression") return me(s(a.test)) ? s(a.consequent) : s(a.alternate);
    if (a.type === "UnaryExpression") {
      const c = s(a.argument);
      if (a.operator === "-") return -c;
      if (a.operator === "+") return +c;
      if (a.operator === "!" || a.operator === "~") return !me(c);
    }
    if (a.type === "BinaryExpression") {
      const c = s(a.left);
      if (a.operator === "&&") return me(c) && me(s(a.right));
      if (a.operator === "||") return me(c) || me(s(a.right));
      const f = s(a.right);
      switch (a.operator) {
        case "+":
          return c + f;
        case "-":
          return c - f;
        case "*":
          return c * f;
        case "/":
          return c / f;
        case "**":
          return c ** f;
        case "%":
          return c % f;
        case "^":
          return me(c) !== me(f);
        case "&":
          return me(c) && me(f);
        case "|":
          return me(c) || me(f);
        case ">":
          return c > f;
        case "<":
          return c < f;
        case ">=":
          return c >= f;
        case "<=":
          return c <= f;
        case "==":
        case "===":
          return c === f;
        case "!=":
        case "!==":
          return c !== f;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const c = a.callee.name.toLowerCase();
      if (c === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return me(s(a.arguments[0])) ? s(a.arguments[1]) : s(a.arguments[2]);
      }
      if (Object.hasOwn(xt, c)) return xt[c](...a.arguments.map(s));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const d = i(t);
  if (typeof d == "number" && !Number.isFinite(d)) throw Error("Structural expression is not finite.");
  return d;
}
function qe(t, { isolate: e = "" } = {}) {
  gn(t);
  const n = he(), r = /* @__PURE__ */ new Map();
  let i = 0, s = 0;
  function d(a, c, f, u, m, h, b) {
    if (c.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++i > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const x = t.scopes[a], E = c.length ? Ae(c.slice(0, -1), c.at(-1)) : "", C = he();
    if (e && E === e && (f = he()), b.some((S) => S.scopeId === a)) throw Error("Circular subcircuit reference at " + E);
    const w = yn(u, x.defaults, x.parameters, m);
    function y(S) {
      if (/^\{[\s\S]*\}$/.test(S)) {
        const V = De(S, w);
        S = String(typeof V == "boolean" ? Number(V) : V);
      }
      /^"[\s\S]*"$/.test(S) && (S = S.slice(1, -1));
      const O = S.toLowerCase();
      return Object.hasOwn(f, O) ? f[O] : t.globals.includes(O) ? rt([], O) : C[O] || (C[O] = rt(c, O));
    }
    const _ = { id: E, path: c, scopeId: a, name: h?.name || "Top", definition: x.name, ports: x.ports.map((S) => ({ name: S, node: y(S) })), params: w, nodes: C, models: he(), devices: [], children: [], raw: h?.raw || "", line: h?.line || 0 };
    n[E] = _, r.set(E, y);
    const T = [...b, _];
    function R(S) {
      if (!S) return "";
      let O = x;
      for (; O; ) {
        if (O.directives.some((V) => new RegExp("^\\.model\\s+" + S.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(V.text))) {
          const V = [...T].reverse().find((g) => g.scopeId === O.id);
          return Ae(V?.path || [], S.toLowerCase());
        }
        O = t.scopes[O.parent];
      }
      return S;
    }
    for (const S of x.directives.filter((O) => /^\.model\b/i.test(O.text))) {
      const O = /^\.model\s+(\S+)/i.exec(S.text)?.[1];
      if (!O) continue;
      const V = R(O), g = x.models[O.toLowerCase()], p = it(S.text, w, y, (D) => Ae(c, D));
      _.models[V] = { ...g, name: V, raw: p.replace(/^(\.model\s+)\S+/i, (D, $) => $ + V), instanceId: E, parameters: w };
    }
    for (const S of x.devices) {
      if (++s > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const O = he();
      for (const [g, p] of Object.entries(S.terminals)) O[g] = y(p);
      const V = R(S.model);
      _.devices.push({ ...S, name: Ae(c, S.name), localName: S.name, instanceId: E, terminals: O, model: V, parameters: w });
    }
    for (const S of x.instances) {
      let O = S.definitionId;
      if (!O) {
        const D = String(De(S.definitionName, w)).toLowerCase();
        let $ = x;
        for (; $ && !O; )
          O = $.definitions[D], $ = t.scopes[$.parent];
        if (!O) throw Error("Undefined selected subcircuit: " + D);
      }
      const V = t.scopes[O], g = he();
      if (V.ports.length !== S.nodes.length) throw Error(S.name + ": expected " + V.ports.length + " ports; got " + S.nodes.length);
      V.ports.forEach((D, $) => {
        g[D.toLowerCase()] = y(S.nodes[$]);
      });
      const p = d(O, [...c, S.name], g, w, S.parameters, S, T);
      S.pinNames?.length === p.ports.length && p.ports.forEach((D, $) => {
        D.label = S.pinNames[$];
      }), _.children.push(p);
    }
    return _;
  }
  try {
    let m = function(h, b) {
      const x = b.split(":");
      if (x.length === 1) return { owner: h, name: b };
      const E = x.pop();
      for (const C of [[...h.path, ...x], x]) {
        const w = c.get(C.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: E };
      }
      throw Error("Unknown hierarchical reference: " + b);
    };
    const a = d(t.rootId, [], he(), he(), he(), null, []), c = new Map(Object.values(n).map((h) => [h.id.toLowerCase(), h])), f = Object.assign(he(), ...Object.values(n).map((h) => h.models)), u = (h) => f[h] || Object.entries(f).find(([b]) => b.startsWith(h + "."))?.[1];
    for (const h of Object.values(n)) for (const b of h.devices) {
      const x = t.scopes[h.scopeId].devices.find((w) => w.name === b.localName), E = (w) => {
        const y = m(h, w);
        return r.get(y.owner.id)(y.name);
      }, C = (w, y = "", _ = "") => {
        const T = m(h, w), R = T.owner.devices.find((S) => S.localName.toLowerCase() === T.name.toLowerCase());
        if (y.toLowerCase() === "ix") {
          const S = T.owner.ports.find((O, V) => O.name.toLowerCase() === T.name.toLowerCase() || String(V + 1) === T.name);
          if (S) return T.owner.id + ":" + S.name;
        }
        if (!R) {
          if (_) throw Error(b.name + ": referenced " + _ + " device " + w + " was not found.");
          return Ae(T.owner.path, T.name);
        }
        if (_ && R.kind !== _) throw Error(b.name + ": " + w + " must be a " + _ + " device.");
        return R.name;
      };
      if (b.value = it(x.value, h.params, E, C), x.model && (b.value = b.value.replace(x.model, b.model)), b.kind === "M" && Object.keys(b.terminals).length === 3) {
        let w = u(b.model), y = !1;
        const _ = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !_.has(w.name); ) {
          _.add(w.name);
          const T = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (T) {
            y = T[1] === void 0 || Number(De(T[1], w.parameters)) >= 0.5;
            break;
          }
          const R = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = u(R + (w.baseModel || "").toLowerCase()) || u((w.baseModel || "").toLowerCase());
        }
        _.size && (b.type = "spice_" + (y ? "pmos3" : "nmos3"));
      }
      b.controlSources = (x.controlSources || []).map((w) => C(w, "", "V")), b.controlSource = b.controlSources[0] || "", b.coupledInductors = (x.coupledInductors || []).map((w) => C(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...x.controlSources || [], ...x.coupledInductors || []])) {
        const y = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        b.value = b.value.replace(new RegExp("(?<![\\w./%])" + y + "(?![\\w.$])", "g"), () => C(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: n };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function Oe(t) {
  return [...t.devices, ...t.children.flatMap(Oe)];
}
function Re(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function lt(t, e = {}) {
  const n = new Map(t.components.map((g) => [g.name, g])), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), s = [], d = (g, p) => JSON.stringify([g, p].sort()), a = (g) => e[g]?.potential !== null && e[g]?.potential !== void 0;
  for (const g of t.components) {
    for (const [A, P] of Object.entries(g.terminals))
      r.has(P) || r.set(P, []), r.get(P).push({ device: g.name, pin: A });
    if (g.kind === "R") {
      const A = Object.values(g.terminals);
      if (A.length === 2 && A[0] !== A[1]) {
        const P = d(...A);
        i.has(P) || i.set(P, []), i.get(P).push(g);
      }
    }
    const p = g.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(g.kind) ? "fet" : null, D = p === "bjt" ? /_(npn|pnp)$/.exec(g.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(g.type)?.[1];
    if (!p || !D) continue;
    const $ = g.terminals, q = $[p === "bjt" ? "B" : "G"], X = $[p === "bjt" ? "C" : "D"], se = $[p === "bjt" ? "E" : "S"];
    [q, X, se].some((A) => A === void 0) || q === se || X === se || s.push({ id: g.name, family: p, polarity: D, control: q, drain: X, source: se, body: g.kind === "M" ? $.B : void 0 });
  }
  const c = [], f = /* @__PURE__ */ new Set(), u = (g, p, D, $, q, X = "basic", se = [], A = "high") => {
    const P = [.../* @__PURE__ */ new Set([...p, ...se])], z = JSON.stringify([g, X, [...P].sort()]);
    f.has(z) || (f.add(z), c.push({ id: "motif" + c.length, kind: g, variant: X, transistors: p, members: P, roles: D, nets: $, evidence: q, confidence: A }));
  }, m = (g, p) => g.family === p.family && g.polarity === p.polarity, h = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), E = new Map(s.map((g) => [g.id, g])), C = (g, p, D) => {
    g.has(p) || g.set(p, []), g.get(p).push(D);
  }, w = (g, p) => JSON.stringify([g.family, g.polarity, p]);
  for (const g of s)
    C(h, w(g, g.control), g), C(b, w(g, g.source), g), g.family === "bjt" && (r.get(g.source) || []).some((p) => {
      const D = E.get(p.device);
      return D && D.family === "bjt" && !m(g, D) && D.source === g.source;
    }) && C(x, w(g, g.drain), g);
  const y = (g) => [{ node: g.source, resistor: null }, ...(r.get(g.source) || []).flatMap((p) => {
    const D = n.get(p.device);
    if (D.kind !== "R") return [];
    const $ = Object.values(D.terminals).find((q) => q !== g.source);
    return $ !== void 0 && $ !== g.control && $ !== g.drain ? [{ node: $, resistor: D.name }] : [];
  })];
  for (const g of s) g.control === g.drain && u("diode-connected", [g.id], { reference: g.id }, { control: g.control, return: g.source }, ["control-drain-short", g.family]);
  for (const g of s) {
    const p = h.get(w(g, g.control));
    if (p.filter((A) => A.control === A.drain).length > 1) continue;
    let D = null;
    if (g.control !== g.drain && g.family === "bjt" && (D = (h.get(w(g, g.drain)) || []).find((A) => A.id !== g.id && m(A, g) && A.control === g.drain && A.source === g.control && a(A.drain))), g.control !== g.drain && !D) continue;
    const $ = y(g), q = [];
    let X = null, se = [];
    for (const A of p) {
      if (A.id === g.id || A.id === D?.id || A.drain === g.drain || A.drain === A.control) continue;
      const P = $.flatMap((z) => y(A).filter((Y) => z.node === Y.node).map((Y) => ({ node: z.node, rs: [z.resistor, Y.resistor].filter(Boolean) }))).find((z) => X === null || z.node === X);
      P && (X = P.node, q.push(A.id), se.push(...P.rs));
    }
    if (q.length) {
      const A = q.every((P) => E.get(P).body === g.body);
      u("current-mirror", [g.id, ...q, ...D ? [D.id] : []], { reference: g.id, outputs: q, ...D ? { helper: D.id } : {} }, { control: g.control, return: X }, ["same-polarity", "shared-control", D ? "emitter-follower-reference" : "diode-reference", se.length ? "resistive-common-return" : "shared-return", A ? "compatible-bodies" : "different-body-connections"], D ? "assisted" : se.length ? "degenerated" : "basic", [...se, ...D ? [D.id] : []], A ? "high" : "medium");
    }
  }
  const _ = [], T = /* @__PURE__ */ new Set(), R = (g, p) => {
    const D = JSON.stringify([g.id, p.id].sort());
    T.has(D) || (T.add(D), _.push([g, p]));
  };
  for (const g of b.values()) if (!a(g[0].source)) {
    const p = g.filter((D) => D.control !== D.drain);
    p.length === 2 ? R(...p) : p.length > 2 && new Set(p.map((D) => D.control)).size > 1 && u("differential-pair", p.map((D) => D.id), { inputs: p.map((D) => D.id) }, { tail: p[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const g of x.values()) for (let p = 0; p < g.length; p++) for (let D = p + 1; D < g.length; D++) R(g[p], g[D]);
  for (const [g, p] of _) {
    if (g.control === p.control || g.control === g.drain || p.control === p.drain) continue;
    if (g.source === p.source && g.drain !== p.drain && !a(g.source)) {
      const q = (r.get(g.source) || []).some((se) => se.device !== g.id && se.device !== p.id), X = b.get(w(g, g.source)).length === 2;
      u("differential-pair", [g.id, p.id], { inputs: [g.id, p.id] }, { tail: g.source }, ["same-polarity", "distinct-controls", "shared-tail", q ? "tail-bias-connection" : "unbiased-tail", X ? "two-input-tail" : "multi-input-tail"], "basic", [], q && X && g.body === p.body ? "high" : "medium");
    }
    if (g.family !== "bjt" || g.drain !== p.drain || g.source === p.source) continue;
    const D = s.filter((q) => q.family === "bjt" && q.polarity !== g.polarity && q.source === g.source), $ = s.filter((q) => q.family === "bjt" && q.polarity !== g.polarity && q.source === p.source);
    for (const q of D) for (const X of $) q.id !== X.id && q.control === X.control && q.drain !== X.drain && q.control !== q.drain && X.control !== X.drain && u("differential-pair", [g.id, p.id, q.id, X.id], { inputs: [g.id, p.id], commonBase: [q.id, X.id] }, { inputCollectors: g.drain, bias: q.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const g of s) if (g.family === "bjt" && g.control !== g.drain) {
    const p = i.get(d(g.drain, g.control)) || [], D = i.get(d(g.control, g.source)) || [];
    p.length === 1 && D.length === 1 && u("vbe-multiplier", [g.id], { transistor: g.id, collectorResistor: p[0].name, emitterResistor: D[0].name }, { control: g.control, collector: g.drain, emitter: g.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [p[0].name, D[0].name]);
  }
  const S = s.filter((g) => g.family === "bjt"), O = /* @__PURE__ */ new Map();
  for (const g of S) C(O, g.control, g);
  const V = (g) => (r.get(g) || []).filter((p) => E.has(p.device));
  for (const g of S) if (g.control !== g.drain) {
    for (const p of O.get(g.source) || []) if (p.id !== g.id && m(g, p) && p.drain === g.control && p.source !== g.drain) {
      const D = i.get(d(g.source, p.source)) || [];
      D.length === 1 && u("current-limit-pair", [g.id, p.id], { driver: g.id, output: p.id, senseResistor: D[0].name }, { sense: g.source, drive: g.control, output: p.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [D[0].name]);
    }
    for (const p of O.get(g.source) || []) p.id !== g.id && m(g, p) && p.control !== p.drain && g.drain === p.drain && p.source !== g.control && u("darlington-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.source, collector: g.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (O.get(g.source) || []).length === 1 ? "high" : "medium");
    for (const p of O.get(g.drain) || []) p.id !== g.id && !m(g, p) && p.control !== p.drain && g.source === p.drain && p.source !== g.control && V(g.drain).length === 2 && u("sziklai-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.drain, feedback: g.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const p of r.get(g.drain) || []) {
      const D = E.get(p.device);
      !D || D.family !== "bjt" || D.id === g.id || !m(g, D) || D.source !== g.drain || a(g.drain) || D.control === g.control || D.control === D.drain || D.drain === g.source || V(g.drain).length !== 2 || u("cascode-pair", [g.id, D.id], { driver: g.id, output: D.id }, { link: g.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const g of S.filter((p) => p.polarity === "npn" && a(p.drain))) for (const p of S.filter((D) => D.polarity === "pnp" && a(D.drain))) {
    if (e[g.drain].potential <= e[p.drain].potential) continue;
    const D = y(g).flatMap(($) => y(p).filter((q) => $.node === q.node && !a($.node)).map((q) => ({ node: $.node, rs: [$.resistor, q.resistor].filter(Boolean) })))[0];
    D && u("push-pull-pair", [g.id, p.id], { upper: g.id, lower: p.id }, { output: D.node }, ["complementary-polarity", "ordered-collector-supplies", D.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", D.rs);
  }
  return c;
}
function dt(t, e, n = (r) => r) {
  const r = (i) => Array.isArray(i) ? i.map(e) : e(i);
  return t.map((i) => ({ ...i, members: i.members.map(e), transistors: i.transistors.map(e), roles: Object.fromEntries(Object.entries(i.roles).map(([s, d]) => [s, r(d)])), nets: Object.fromEntries(Object.entries(i.nets).map(([s, d]) => [s, n(d)])) }));
}
function Tn(t, e, n) {
  const r = [], i = /* @__PURE__ */ new Set(), s = new Map(t.components.map((d) => [d.name, d]));
  for (const d of n) {
    if (new Set(d.members).size !== d.members.length) throw Error("Duplicate @layout pair member.");
    const a = d.members.map((h) => s.get(h));
    if (a.some((h) => !h)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[d.kind], f = d.kind === "differential" && a.length === 2 ? t.components.filter((h) => !d.members.includes(h.name) && Object.values(h.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], u = lt({ ...t, components: [...a, ...f] }, e), m = u.find((h) => h.kind === c && h.confidence === "high" && d.members.every((b) => h.members.includes(b)));
    if (!m) throw Error("Invalid @layout pair " + d.kind + " { " + d.members.join(" ") + " }: electrical structure does not match.");
    for (const h of u.filter((b) => b === m || b.kind === "diode-connected" && b.members.every((x) => m.members.includes(x)))) {
      const b = JSON.stringify([h.kind, [...h.members].sort()]);
      i.has(b) || (i.add(b), r.push({ ...h, id: "motif" + r.length, origin: "annotation" }));
    }
  }
  return r;
}
function An(t, e, n = lt(t, e)) {
  const r = /* @__PURE__ */ new Map(), i = t.components.filter((h) => h.kind === "R"), s = t.components.filter((h) => h.kind === "Q"), d = new Map(t.components.map((h) => [h.name, h])), a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), f = (h) => Object.values(h.terminals), u = (h, b, x) => {
    h && r.set(h.name, { reverse: f(h)[0] !== b, reason: x });
  };
  for (const h of s) {
    const { C: b, B: x, E } = h.terminals, C = h.type.endsWith("pnp"), w = h.type.endsWith("npn");
    !C && !w || (a.has(E) || a.set(E, []), a.get(E).push(h), b === x && e[E]?.potential !== null && e[E]?.potential !== void 0 && c.set(b, { potential: e[E].potential }));
  }
  for (const h of n) if (h.kind === "vbe-multiplier" && h.confidence === "high") {
    const b = d.get(h.roles.transistor), x = b.type.endsWith("pnp"), E = d.get(x ? h.roles.emitterResistor : h.roles.collectorResistor), C = d.get(x ? h.roles.collectorResistor : h.roles.emitterResistor);
    u(E, b.terminals[x ? "E" : "C"], "recognized VBE multiplier"), u(C, b.terminals.B, "recognized VBE multiplier");
  }
  for (const h of i) {
    const [b, x] = f(h), E = c.get(b), C = c.get(x);
    E && C && E.potential !== C.potential && u(h, E.potential > C.potential ? b : x, "diode-connected bias reference");
  }
  const m = /* @__PURE__ */ new Map();
  for (const h of i) {
    const b = f(h);
    if (!b.some((x) => e[x]?.potential !== null && e[x]?.potential !== void 0))
      for (const x of b)
        m.has(x) || m.set(x, []), m.get(x).push(h);
  }
  for (const [h, b] of m)
    if (!(b.length > 12))
      for (const x of b) for (const E of b) {
        if (x === E) continue;
        const C = f(x).find((T) => T !== h), w = f(E).find((T) => T !== h), y = a.get(C)?.find((T) => T.type.endsWith("npn")), _ = a.get(w)?.find((T) => T.type.endsWith("pnp"));
        y && _ && (u(x, C, "complementary emitter output"), u(E, h, "complementary emitter output"));
      }
  return r;
}
function kn(t) {
  const e = t.components.filter((s) => s.kind === "Q"), n = /* @__PURE__ */ new Map(), r = new Set(t.components.filter((s) => s.kind === "R").map((s) => Object.values(s.terminals).sort().join("|"))), i = /* @__PURE__ */ new Set();
  for (const s of e) {
    const d = s.terminals.E;
    n.has(d) || n.set(d, []), n.get(d).push(s);
  }
  for (const s of e) {
    const { B: d, C: a, E: c } = s.terminals;
    if (d === c || !r.has([d, c].sort().join("|"))) continue;
    const f = n.get(d) || [];
    if (!(f.length > 16))
      for (const u of f) {
        if (u === s) continue;
        if (u.terminals.B === a) {
          i.add(s.name);
          break;
        }
        const m = n.get(u.terminals.B) || [];
        if (m.length <= 16 && m.some((h) => h !== s && h !== u && h.terminals.B === a)) {
          i.add(s.name);
          break;
        }
      }
  }
  return i;
}
const Ue = 22;
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
const je = (t) => ["pwr", "ret", "bias"].includes(t), On = (t) => String(t).split("/").at(-1).toLowerCase(), Rt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[On(t)] || "unknown", Et = (t) => {
  const e = st(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Rt(t);
};
function Mn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], r = (d, a, c) => {
    e.has(d) || e.set(d, []), e.get(d).push({ node: a, delta: c });
  };
  for (const d of t)
    if (d.kind === "V")
      try {
        let a = d.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (c && Number(De(c[1], d.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const f = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!f) continue;
        const u = De(f[1], d.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        r(d.terminals["-"], d.terminals["+"], u), r(d.terminals["+"], d.terminals["-"], -u);
      } catch {
      }
  const i = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ new Set();
  for (const d of ["0", ...e.keys()]) {
    if (s.has(d)) continue;
    const a = /* @__PURE__ */ new Map([[d, 0]]), c = [d];
    s.add(d);
    let f = !1;
    for (let u = 0; u < c.length; u++) for (const m of e.get(c[u]) || []) {
      const h = a.get(c[u]) + m.delta;
      a.has(m.node) ? Math.abs(a.get(m.node) - h) > 1e-8 * Math.max(1, Math.abs(h)) && (f = !0) : (a.set(m.node, h), s.add(m.node), c.push(m.node));
    }
    f && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, m] of a) i[u] = { value: m, reference: d, known: d === "0" && !f, consistent: !f };
  }
  return { nodes: i, diagnostics: n };
}
function Rn(t, e, n = null) {
  const r = Mn(Oe(e.localScope ? t.contexts[e.focus] : t.root)), i = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const m = st(u.name), h = Rt(u.name);
    i[u.name] = { role: m !== "unknown" ? m : h, roleSource: m !== "unknown" ? "node-name" : h !== "unknown" ? "legacy-rail-name" : "unknown", potential: r.nodes[u.name]?.known ? r.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const m = i[u.local], h = Et(u.port);
    m && m.potential === null && ["pwr", "ret"].includes(h) && (m.potential = h === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, m.potentialSource = "symbolic-port-order");
  }
  const d = n?.pairs?.length ? Tn(e, i, n.pairs) : lt(e, i), a = An(e, i, d), c = kn(e), f = (u, m, h) => {
    const b = { role: i[h].role, roleSource: i[h].roleSource }, x = u.block?.ports.find((w) => w.pin === m);
    if (x?.implicit || !u.block && !u.synthetic) return b;
    const E = u.synthetic ? u.value : x?.name || x?.label, C = Et(E);
    return C !== "unknown" ? { role: C, roleSource: st(E) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : je(b.role) ? { ...b, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const m = Object.fromEntries(Object.entries(u.terminals).map(([V, g]) => [V, { ...i[g], ...f(u, V, g) }])), h = Object.values(m), b = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), x = b && !a.has(u.name) && h.length === 2 && h.every((V) => !je(V.role) && (V.potential === null || V.role !== "unknown")), E = u.terminals["+"], C = u.terminals["-"], w = [E, C].filter((V) => V && V !== "0"), y = u.kind === "V" && w.some((V) => je(i[V]?.role)) && !w.some((V) => ["in", "out", "io", "fb"].includes(i[V]?.role)) && [E, C].every((V) => r.nodes[V]?.known), _ = E === "0" ? C : E, T = Object.keys(u.terminals), R = (V) => je(V.role) ? V.potential !== null ? V.potential > 0 ? "high" : "low" : V.role === "ret" ? "low" : "high" : "signal";
    let S = !1;
    T.length === 2 && (u.kind === "V" && h.every((V) => V.potential !== null) ? S = h[0].potential < h[1].potential : u.terminals[T[0]] === "0" ? S = !0 : u.terminals[T[1]] === "0" ? S = !1 : h.every((V) => V.potential !== null) ? S = h[0].potential < h[1].potential : S = R(h[0]) === "low" || R(h[1]) === "high" && R(h[0]) === "signal"), a.has(u.name) && (S = a.get(u.name).reverse);
    const O = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    s[u.name] = { version: Ue, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(u.name), orientationReason: a.get(u.name)?.reason || null, owner: O.includes("/") ? O.slice(0, O.lastIndexOf("/")) : "", passive: b, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !b, ports: m, horizontal: x, orientation: x ? "horizontal" : S ? "vertical-reversed" : "vertical", flexible: T.length === 2 && (b || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!y, voltage: y ? r.nodes[_].value : null };
  }
  return { version: Ue, nodes: i, cells: s, motifs: d, diagnostics: r.diagnostics };
}
function Lt(t, e) {
  const n = e.ports.map((i, s) => ({ pin: "P" + s, name: i.name, label: i.label || i.name, node: i.node, implicit: !1 })), r = new Set(Oe(e).flatMap((i) => Object.values(i.terminals)));
  for (const i of t.ir.globals) {
    const s = rt([], i);
    r.has(s) && !n.some((d) => d.node === s) && n.push({ pin: "G" + n.length, label: i === "0" ? "⏚ 0" : "global: " + i, node: s, implicit: !0 });
  }
  return n;
}
function Ve(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: r = "" } = {}) {
  const i = t, s = t.contexts[r];
  if (!s) throw Error("Unknown instance: " + r);
  r && (t = qe(t.ir, { isolate: r }));
  const d = t.contexts[r];
  if (!d) throw Error("Unknown instance: " + r);
  const a = [], c = [];
  function f(x) {
    c.push(...Object.values(x.nodes), ...x.ports.map((C) => C.node));
    const E = [...x.devices.map((C) => ({ line: C.line, device: C })), ...x.children.map((C) => ({ line: C.line, child: C }))].sort((C, w) => C.line - w.line);
    for (const C of E) {
      if (C.device) {
        const T = C.device;
        a.push({ ...T, layoutLabel: [...x.path.slice(d.path.length), T.localName].join("/") });
        continue;
      }
      const w = C.child;
      if (e === "flat" || n.has(w.id)) {
        f(w);
        continue;
      }
      const y = Lt(t, w), _ = he();
      y.forEach((T) => {
        _[T.pin] = T.node;
      }), a.push({ name: w.id, kind: "X", type: "spice_subckt", terminals: _, value: w.definition, raw: w.raw, line: w.line, instanceId: w.id, layoutLabel: w.path.slice(d.path.length).join("/"), block: { definitionId: w.scopeId, ports: y, parameters: w.params } });
    }
  }
  f(d);
  for (const [x, E] of d.ports.entries()) a.push({ name: "@port/" + r + "/" + x, kind: "PORT", type: "spice_port", terminals: { A: E.node }, layoutLabel: E.name, value: E.name, raw: "Interface port " + E.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(he(), ...Object.values(t.contexts).map((x) => x.models)), m = { title: r || t.ir.title, components: a, nodes: mn(a, c), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: r, localScope: !!r };
  m.interfaceBindings = d.ports.map((x, E) => ({ port: x.name, local: x.node, parent: s.ports[E].node }));
  const h = /* @__PURE__ */ new Map();
  for (const x of s.ports)
    h.has(x.node) || h.set(x.node, []), h.get(x.node).push(x.name);
  m.interfaceAliases = [...h].filter(([, x]) => x.length > 1).map(([x, E]) => ({ node: x, ports: E })), m.topology = Ln(i, m);
  const b = pn(t, m);
  return m.layout = Rn(t, m, b), m.layout.description = b, m;
}
function Ln(t, e) {
  const n = Oe(t.contexts[e.focus]);
  e.localScope && (t = qe(t.ir, { isolate: e.focus }));
  const r = [], i = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const c = t.contexts[a.instanceId];
        if (!c) throw Error("Projection contains an unknown block.");
        const f = Lt(t, c);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(f.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + a.name);
        r.push(...Oe(c));
      } else r.push(a);
  for (const a of r) {
    if (i.has(a.name)) throw Error("Projection duplicates " + a.name);
    i.add(a.name);
  }
  const s = Re(r), d = Oe(t.contexts[e.focus]);
  if (s !== Re(d)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), c = (u) => a.get(u) ?? u, f = r.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([m, h]) => [m, c(h)])), value: it(u.value, {}, c, (m) => m) }));
    if (Re(f) !== Re(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: r.length, signature: s, boundSignature: Re(n), boundaryVerified: !0 };
}
function Qe(t) {
  const e = he(), n = he();
  for (const r of t.components) {
    const i = he(), s = he();
    for (const [d, a] of Object.entries(r.terminals))
      i[d] = [t.nodes[a].bit], s[d] = "input";
    e[r.name] = { type: r.type, port_directions: s, connections: i, parameters: {}, attributes: { ref: r.name, displayRef: r.layoutLabel || r.name, value: r.value, spice: r.raw } }, e[r.name].spiceLayout = t.layout?.cells[r.name], r.block && (e[r.name].spiceBlock = { ports: r.block.ports.map((d) => ({ pin: d.pin, label: d.label })), definitionId: r.block.definitionId }), (r.type === "spice_device" || r.type === "spice_coupling") && (e[r.name].spiceSymbol = { label: r.symbol || r.kind, ports: Object.keys(r.terminals).map((d, a) => ({ pin: d, label: r.pinLabels?.[a] || d })), references: r.coupledInductors?.length ? r.coupledInductors : r.controlSources || [] });
  }
  for (const r of Object.values(t.nodes)) n[r.name] = { hide_name: 0, bits: [r.bit], attributes: {} };
  if (t.nodes[0]) {
    let r = "__ground";
    for (; Object.hasOwn(e, r); ) r += "_";
    e[r] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: dt(t.layout?.motifs || [], (r) => r, (r) => t.nodes[r].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Pn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = {}, i = (f) => (n.has(f) || n.set(f, n.size + 2), n.get(f));
  Object.entries(t.modules.circuit.cells).forEach(([f, u], m) => {
    const h = "c" + m;
    e.set(h, f);
    const b = Object.fromEntries(Object.entries(u.connections).map(([x, E]) => [x, E.map(i)]));
    r[h] = { type: u.type, connections: b, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (r[h].spiceBlock = u.spiceBlock), u.spiceSymbol && (r[h].spiceSymbol = u.spiceSymbol), u.spiceLayout && (r[h].spiceLayout = u.spiceLayout);
  });
  const s = new Map([...e].map(([f, u]) => [u, f])), d = t.modules.circuit.spiceLayoutDescription, a = d ? { ...d, faces: (d.faces || []).map((f) => ({ ...f, device: s.get(f.device) })), pairs: (d.pairs || []).map((f) => ({ ...f, members: f.members.map((u) => s.get(u)) })), groups: d.groups.map((f) => ({ ...f, members: f.members.map((u) => u.cell ? { ...u, cell: s.get(u.cell) } : u) })), relations: d.relations.map((f) => ({ ...f, a: s.get(f.a) || f.a, b: s.get(f.b) || f.b })) } : null, c = dt(t.modules.circuit.spiceMotifs || [], (f) => s.get(f), i);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: r, spiceMotifs: c, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([f, u]) => [u, f])) };
}
const Ce = /* @__PURE__ */ new Map();
async function Ye(t, e) {
  const n = Pn(t), r = JSON.stringify([n.netlist, e]);
  let i = Ce.get(r);
  i ? (Ce.delete(r), Ce.set(r, i)) : (i = await Dn(n.netlist, e), i.svg.length < 1e6 && (Ce.set(r, i), Ce.size > 20 && Ce.delete(Ce.keys().next().value)));
  const s = new DOMParser().parseFromString(i.svg, "image/svg+xml");
  if (s.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of s.querySelectorAll("[id],[class]")) {
    const f = c.getAttribute("id");
    f?.startsWith("cell_") && n.ids.has(f.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(f.slice(5)));
    const u = c.getAttribute("class");
    u && c.setAttribute("class", u.split(/\s+/).map((m) => m.startsWith("cell_") && n.ids.has(m.slice(5)) ? "cell_" + n.ids.get(m.slice(5)) : /^net_\d+$/.test(m) && n.bits.has(Number(m.slice(4))) ? "net_" + n.bits.get(Number(m.slice(4))) : m).join(" "));
  }
  const d = i.drawing ? structuredClone(i.drawing) : null, a = s.querySelector("#spice-layout-report");
  if (a) {
    const c = JSON.parse(a.textContent), f = (u) => n.ids.get(u) || u;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(f), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(f), c.recognizedMotifs = dt(c.recognizedMotifs || [], f, (u) => n.bits.get(u) ?? u), c.inputAttachments = (c.inputAttachments || []).map(f), c.mirroredInputPorts = (c.mirroredInputPorts || []).map(f);
    for (const u of [...c.flippedPairs || [], ...c.pairOrientationTrials || []]) u.members = u.members.map(f);
    for (const u of c.pairCompactions || [])
      u.members = u.members.map(f), u.moved = f(u.moved);
    for (const u of c.pairConstraints || []) u.members = u.members.map(f);
    for (const u of c.pairProximity || []) u.members = u.members.map(f);
    for (const u of c.motifMeasurements || [])
      u.members = u.members.map(f), u.interlopers && (u.interlopers = u.interlopers.map(f));
    for (const u of c.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    a.textContent = JSON.stringify(c);
  }
  if (d) {
    for (const c of d.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const f of c.ports) f.bit = n.bits.get(f.bit) ?? f.bit;
    }
    for (const c of d.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(s.documentElement), drawing: d };
}
function Dn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((r, i) => {
    const s = (c, f) => {
      clearTimeout(a), n.terminate(), c ? i(Error(c)) : r(f);
    }, d = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => s("Layout timed out. Open a subcircuit sheet or collapse instances."), d);
    n.onmessage = ({ data: c }) => s(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => s(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
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
`, Le = {
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
].flat(), ut = "#292b29", ze = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Pt[e * 9 + t]))])], _t = (t) => /^#[\da-f]{6}$/i.test(t), Nt = "spice-node-colors-v1";
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
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, ze[this.assigned.size % ze.length]), this.assigned.get(e)) : ut;
  }
  set(e, n) {
    if (!_t(n)) throw Error("Invalid node color.");
    for (const r of e) this.manual.set(r, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((r) => Array.isArray(r) && typeof r[0] == "string" && _t(r[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Wn(t, e, n) {
  const r = new Map(e.map((i) => [i.name, n.color(i.name)]));
  for (const i of t.children) if (["line", "path", "polyline", "circle"].includes(i.localName) && i.hasAttribute("data-net")) {
    const s = r.get(i.getAttribute("data-net"));
    if (!s) continue;
    i.style.setProperty("stroke", s, "important"), i.localName === "circle" && i.style.setProperty("fill", s, "important");
  }
}
function qn(t, e) {
  const n = new Hn(), r = /* @__PURE__ */ new Set();
  let i = [], s = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Nt) || "null"));
  } catch {
  }
  const d = () => {
    try {
      sessionStorage.setItem(Nt, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const h = t("node-search").value.trim().toLowerCase();
    return i.filter((b) => !h || [b.name, b.displayName, ...b.terminals.map((x) => x.component + "." + x.pin)].some((x) => x.toLowerCase().includes(h)));
  };
  function c() {
    const h = a(), b = h.filter((x) => r.has(x.name)).length;
    t("node-count").textContent = `${h.length} / ${i.length} nodes · ${r.size} selected`, t("node-all").checked = !!h.length && b === h.length, t("node-all").indeterminate = b > 0 && b < h.length, t("node-auto").checked = n.auto;
    for (const x of ["node-apply", "node-clear"]) t(x).disabled = !s || !r.size;
    t("node-all").disabled = !s || !h.length;
  }
  function f() {
    t("nets").replaceChildren(...a().map((h) => {
      const b = document.createElement("tr");
      b.dataset.node = h.name;
      const x = document.createElement("td"), E = document.createElement("input");
      E.type = "checkbox", E.checked = r.has(h.name), E.disabled = !s, E.setAttribute("aria-label", "Select node " + h.displayName), E.onchange = () => {
        E.checked ? r.add(h.name) : r.delete(h.name), c();
      }, x.append(E);
      const C = document.createElement("td");
      C.textContent = h.displayName;
      const w = document.createElement("td"), y = document.createElement("input");
      y.type = "color", y.value = n.color(h.name), y.disabled = !s, y.setAttribute("aria-label", "Wire color for " + h.displayName), y.onchange = () => {
        n.set([h.name], y.value), u();
      }, w.append(y);
      const _ = document.createElement("td");
      return _.textContent = h.terminals.map((T) => T.component + "." + T.pin).join(", "), b.append(x, C, w, _), b;
    })), c();
  }
  function u() {
    for (const h of i) n.color(h.name);
    f(), d(), e(n, i);
  }
  t("node-search").oninput = f, t("node-all").onchange = () => {
    for (const h of a()) t("node-all").checked ? r.add(h.name) : r.delete(h.name);
    f();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, u();
  }, t("node-apply").onclick = () => {
    n.set(r, t("node-color").value), u();
  }, t("node-clear").onclick = () => {
    n.set(r, ut), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...Pt.map((h) => {
    const b = document.createElement("button");
    return b.type = "button", b.style.backgroundColor = h, b.title = h, b.setAttribute("aria-label", "Apply palette color " + h), b.onclick = () => {
      r.size && (t("node-color").value = h, n.set(r, h), u());
    }, b;
  }));
  function m(h) {
    s = h;
    for (const b of t("node-panel").querySelectorAll("input,button")) b.disabled = !s;
    c();
  }
  return { snapshot: () => n.snapshot(), restore(h) {
    n.restore(h), r.clear(), u();
  }, setCircuit(h, b) {
    const x = n.sourceId;
    n.setSource(b), x !== n.sourceId && r.clear(), i = Object.values(h?.nodes || {});
    const E = new Set(i.map((C) => C.name));
    for (const C of r) E.has(C) || r.delete(C);
    for (const C of i) n.color(C.name);
    s = !!h, f(), m(s), d(), e(n, i);
  }, setEnabled: m };
}
function zn(t) {
  const e = (A) => t.querySelector("#spice-" + A), n = new AbortController(), r = n.signal, i = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, s = Object.fromEntries(Object.keys(i).map((A) => [A, t.querySelector(`[data-window-handle="${A}"]`)])), d = { editor: !0, details: !0, info: !0 }, a = { editor: !0, details: !0, info: !0 }, c = [], f = { editor: {}, details: {}, info: {} }, u = [];
  let m = !1, h = !1, b = null, x = null, E = null, C = null;
  function w(A, P) {
    a[A] = P, i[A].dataset.pinned = String(P);
    const z = e("pin-" + A), Y = { editor: "netlist", details: "details", info: "messages" }[A], I = A === "info" ? "bottom edge" : A === "details" ? "lower left" : "left edge", U = P ? `Unpin ${Y} from ${I}` : `Pin ${Y} to ${I}`;
    if (z.setAttribute("aria-pressed", String(P)), z.setAttribute("aria-label", U), z.title = U, P) for (const B of ["left", "top", "right", "bottom", "width", "height"]) i[A].style.removeProperty(B);
    m && requestAnimationFrame(g);
  }
  for (const A of Object.keys(i)) w(A, !0);
  const y = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: m, panels: { ...d } } })), _ = (A, P, z, Y = {}) => A.addEventListener(P, z, { ...Y, signal: r });
  function T(A, P) {
    d[A] = P, i[A].hidden = m && !P, requestAnimationFrame(g), y();
  }
  function R(A, P = e("details-content")) {
    const z = document.createComment("workspace return");
    A.before(z), c.push({ node: A, anchor: z }), P === e("details-content") ? P.prepend(A) : P.append(A);
  }
  function S(A) {
    const P = A.getBoundingClientRect(), z = t.getBoundingClientRect();
    return { x: P.left - z.left, y: P.top - z.top, w: P.width, h: P.height, width: z.width, height: z.height };
  }
  function O(A, P, z) {
    const Y = S(A), I = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, U = Math.max(8, Math.min(P, Y.width - Y.w - 8)), B = Math.max(8, Math.min(I, Y.height - Y.h - 8)), W = Math.max(B, Math.min(z, Y.height - Y.h - 8));
    A.style.left = Math.round(U) + "px", A.style.top = Math.round(W) + "px", A.style.right = "auto", A.style.bottom = "auto";
  }
  function V() {
    if (!m || !a.info || i.info.hidden) return;
    const A = t.getBoundingClientRect(), P = A.width <= 600 ? 8 : 12, z = A.width <= 600 ? P : Math.max(P, ...["editor", "details"].filter((U) => a[U] && !i[U].hidden).map((U) => i[U].getBoundingClientRect().right - A.left + 12)), Y = Math.min(z, Math.max(P, A.width - 160 - P)), I = i.info;
    for (const [U, B] of Object.entries({ left: Math.round(Y) + "px", right: P + "px", width: "auto" })) I.style[U] !== B && (I.style[U] = B);
  }
  function g() {
    if (m) {
      V();
      for (const [A, P] of Object.entries(i)) if (!P.hidden && !a[A]) {
        const z = S(P);
        O(P, z.x, z.y);
      }
    }
  }
  function p() {
    for (const A of Object.values(i))
      for (const P of ["left", "top", "right", "bottom", "width", "height", "z-index"]) A.style.removeProperty(P);
    for (const A of Object.keys(i))
      w(A, !0), T(A, !0);
    requestAnimationFrame(g);
  }
  function D() {
    if (m) return;
    m = !0, b = document.activeElement, x = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, C = document.createComment("workspace mount"), t.before(C), document.body.append(t);
    for (const P of document.body.children) P !== t && (u.push({ node: P, inert: P.inert }), P.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const P of Object.keys(i))
      f[P].base = i[P].style.cssText, f[P].floating && (i[P].style.cssText = f[P].floating), i[P].setAttribute("role", "dialog"), i[P].setAttribute("aria-modal", "false"), i[P].setAttribute("aria-labelledby", "spice-" + P + "-title"), s[P].tabIndex = 0, s[P].title = "Drag to move; arrow keys move the window", T(P, d[P]);
    for (const P of ["selection-actions", "selection", "hierarchy-panel"]) R(e(P));
    const A = e("workspace-strip");
    for (const P of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (A.childElementCount) {
        const z = document.createElement("span");
        z.className = "spice-tool-divider", z.setAttribute("role", "separator"), z.setAttribute("aria-orientation", "vertical"), A.append(z);
      }
      R(P === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(P), A);
    }
    requestAnimationFrame(g), e("exit-fullscreen").focus({ preventScroll: !0 }), y();
  }
  function $() {
    if (m) {
      m = !1, E = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: A, anchor: P } of c.splice(0))
        P.before(A), P.remove();
      e("workspace-strip").replaceChildren();
      for (const A of Object.keys(i)) {
        f[A].floating = i[A].style.cssText, i[A].style.cssText = f[A].base, i[A].hidden = !1;
        for (const P of ["role", "aria-modal", "aria-labelledby"]) i[A].removeAttribute(P);
        s[A].removeAttribute("tabindex"), s[A].removeAttribute("title");
      }
      C && (C.before(t), C.remove(), C = null);
      for (const { node: A, inert: P } of u.splice(0)) A.inert = P;
      x && (document.documentElement.style.overflow = x.html, document.body.style.overflow = x.body, window.scrollTo(x.x, x.y)), b?.focus?.({ preventScroll: !0 }), y();
    }
  }
  async function q() {
    D(), t.dataset.nativeFullscreen = "false";
  }
  async function X() {
    if (h = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        h = !0;
        return;
      }
    $();
  }
  _(e("fullscreen"), "click", () => m ? X() : q()), _(e("exit-fullscreen"), "click", X), _(e("reset-windows"), "click", p);
  for (const A of Object.keys(i)) {
    _(e("pin-" + A), "click", () => {
      const Y = S(i[A]);
      w(A, !a[A]), a[A] || (i[A].style.width = Y.w + "px", i[A].style.height = Y.h + "px", O(i[A], Y.x, Y.y)), y();
    }), _(e("close-" + A), "click", () => {
      T(A, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), _(i[A], "pointerdown", () => {
      if (m) {
        for (const Y of Object.values(i)) Y.style.zIndex = "20";
        i[A].style.zIndex = "30";
      }
    }, { capture: !0 });
    const P = s[A];
    _(P, "pointerdown", (Y) => {
      if (!m || Y.button !== 0 || Y.target.closest("button,input,select,textarea,a,label")) return;
      Y.preventDefault();
      const I = S(i[A]);
      w(A, !1), i[A].style.width = I.w + "px", i[A].style.height = I.h + "px", O(i[A], I.x, I.y), E = { id: A, pointer: Y.pointerId, x: Y.clientX, y: Y.clientY, left: I.x, top: I.y }, P.setPointerCapture(Y.pointerId);
    }), _(P, "pointermove", (Y) => {
      E?.id === A && E.pointer === Y.pointerId && O(i[A], E.left + Y.clientX - E.x, E.top + Y.clientY - E.y);
    });
    const z = () => {
      E = null;
    };
    _(P, "pointerup", z), _(P, "pointercancel", z), _(P, "lostpointercapture", z), _(P, "keydown", (Y) => {
      if (!m || Y.target !== P || !Y.key.startsWith("Arrow")) return;
      Y.preventDefault();
      const I = S(i[A]), U = Y.shiftKey ? 32 : 8;
      w(A, !1), i[A].style.width = I.w + "px", i[A].style.height = I.h + "px", O(i[A], I.x + ({ ArrowLeft: -U, ArrowRight: U }[Y.key] || 0), I.y + ({ ArrowUp: -U, ArrowDown: U }[Y.key] || 0));
    });
  }
  _(document, "fullscreenchange", () => {
    m && h && document.fullscreenElement !== t && (h = !1, $());
  }), _(document, "keydown", (A) => {
    m && A.altKey && A.key === "Escape" && (A.preventDefault(), A.stopImmediatePropagation(), X());
  }, { capture: !0 }), _(window, "resize", g);
  const se = new ResizeObserver(g);
  for (const A of Object.values(i)) se.observe(A);
  return { enter: q, exit: X, showPanel: T, reset: p, destroy() {
    X(), n.abort(), se.disconnect();
  } };
}
const ce = 1e-3, ae = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), le = (t, e) => Math.abs(t - e) < ce, we = (t, e) => le(e.a.x, e.b.x) ? le(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - ce && t.y <= Math.max(e.a.y, e.b.y) + ce : le(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - ce && t.x <= Math.max(e.a.x, e.b.x) + ce, $n = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Xn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + ce && Math.min(t.a.x, t.b.x) < e.x + e.width - ce && Math.max(t.a.y, t.b.y) > e.y + ce && Math.min(t.a.y, t.b.y) < e.y + e.height - ce;
function Ke(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && ae(e.at(-1)) === ae(n))) {
      for (; e.length > 1 && (le(e.at(-2).x, e.at(-1).x) && le(e.at(-1).x, n.x) || le(e.at(-2).y, e.at(-1).y) && le(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class Dt {
  constructor(e, { step: n = 8, segments: r = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(r), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
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
    return le(e.x / this.step, Math.round(e.x / this.step)) && le(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !le(e.a.x, e.b.x) && !le(e.a.y, e.b.y)) return !1;
    const r = this.pins();
    if (r.some((i) => i.bit !== n && we(i, e)) || this.segments.some((i) => i.bit !== n && (we(e.a, i) || we(e.b, i) || we(i.a, e) || we(i.b, e)))) return !1;
    for (const i of this.components) if (Xn(e, i) && !r.filter((d) => d.owner === i.id && d.bit === n).some((d) => d.side === "NORTH" ? le(e.a.x, d.x) && le(e.b.x, d.x) && Math.max(e.a.y, e.b.y) <= d.y + ce : d.side === "SOUTH" ? le(e.a.x, d.x) && le(e.b.x, d.x) && Math.min(e.a.y, e.b.y) >= d.y - ce : d.side === "WEST" ? le(e.a.y, d.y) && le(e.b.y, d.y) && Math.max(e.a.x, e.b.x) <= d.x + ce : d.side === "EAST" ? le(e.a.y, d.y) && le(e.b.y, d.y) && Math.min(e.a.x, e.b.x) >= d.x - ce : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const r = Ke(n), i = r.slice(1).map((s, d) => ({ bit: e, a: r[d], b: s })).filter((s) => $n(s) > ce);
    if (!i.length) return !1;
    if (i.some((s) => !this.validSegment(s, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...i), !0;
  }
  move(e, n, r) {
    if (n = Math.round(n / this.step) * this.step, r = Math.round(r / this.step) * this.step, !n && !r) return;
    const i = this.snapshot(), s = this.components.find((c) => c.id === e);
    if (!s) return;
    const d = s.ports.map((c) => ({ ...c }));
    this.segments = this.segments.filter((c) => !d.some((f) => f.bit === c.bit && (ae(f) === ae(c.a) || ae(f) === ae(c.b)))), s.x += n, s.y += r;
    for (const c of s.ports)
      c.x += n, c.y += r;
    if (this.pinCache = null, this.components.some((c) => c !== s && s.x < c.x + c.width - ce && s.x + s.width > c.x + ce && s.y < c.y + c.height - ce && s.y + s.height > c.y + ce) || this.segments.some((c) => !this.validSegment(c, c.bit)) || s.ports.some((c) => this.pins().some((f) => f.owner !== e && f.bit !== c.bit && ae(f) === ae(c))))
      throw this.restore(i), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(i);
  }
  moveMany(e) {
    const n = new Map(e.map((c) => [c.id, { dx: Math.round(c.dx / this.step) * this.step, dy: Math.round(c.dy / this.step) * this.step }]).filter(([, c]) => c.dx || c.dy)), r = this.components.filter((c) => n.has(c.id));
    if (!r.length) return !1;
    const i = this.snapshot(), s = r.flatMap((c) => c.ports);
    this.segments = this.segments.filter((c) => !s.some((f) => f.bit === c.bit && we(f, c)));
    for (const c of r) {
      const f = n.get(c.id);
      c.x += f.dx, c.y += f.dy;
      for (const u of c.ports)
        u.x += f.dx, u.y += f.dy;
    }
    this.pinCache = null, this.cache = null;
    const d = this.pins();
    if (r.some((c) => this.components.some((f) => f !== c && c.x < f.x + f.width - ce && c.x + c.width > f.x + ce && c.y < f.y + f.height - ce && c.y + c.height > f.y + ce)) || d.some((c) => !this.onGrid(c) || d.some((f) => f.owner !== c.owner && f.bit !== c.bit && ae(f) === ae(c))) || this.segments.some((c) => !this.validSegment(c, c.bit)))
      throw this.restore(i), Error("Arrangement blocked: a component or another node occupies the target position.");
    return this.remember(i), !0;
  }
  transform(e, n) {
    const r = this.components.find((h) => h.id === e);
    if (!r) return;
    const i = this.snapshot(), s = r.width, d = r.height, a = n === "rotate" ? [0, 1, -1, 0, d, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, d] : n === "mirror-y" ? [-1, 0, 0, 1, s, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const c = r.ports.map((h) => ({ ...h })), f = (h) => ({ x: a[0] * h.x + a[2] * h.y + a[4], y: a[1] * h.x + a[3] * h.y + a[5] });
    this.segments = this.segments.filter((h) => !c.some((b) => b.bit === h.bit && (ae(b) === ae(h.a) || ae(b) === ae(h.b))));
    const u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const h of r.ports) {
      const b = f({ x: h.x - r.x, y: h.y - r.y });
      h.x = r.x + b.x, h.y = r.y + b.y, h.side = u[h.side] || h.side;
    }
    const m = r.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (r.editorMatrix = [a[0] * m[0] + a[2] * m[1], a[1] * m[0] + a[3] * m[1], a[0] * m[2] + a[2] * m[3], a[1] * m[2] + a[3] * m[3], a[0] * m[4] + a[2] * m[5] + a[4], a[1] * m[4] + a[3] * m[5] + a[5]], n === "rotate" && (r.width = d, r.height = s), this.pinCache = null, r.ports.some((h) => !this.onGrid(h)) || this.components.some((h) => h !== r && r.x < h.x + h.width - ce && r.x + r.width > h.x + ce && r.y < h.y + h.height - ce && r.y + r.height > h.y + ce) || this.segments.some((h) => !this.validSegment(h, h.bit)) || r.ports.some((h) => this.pins().some((b) => b.owner !== e && b.bit !== h.bit && ae(b) === ae(h))))
      throw this.restore(i), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(i);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const r of this.pins())
      e.has(r.bit) || e.set(r.bit, { pins: [], segments: [] }), e.get(r.bit).pins.push(r);
    for (const r of this.segments)
      e.has(r.bit) || e.set(r.bit, { pins: [], segments: [] }), e.get(r.bit).segments.push(r);
    const n = [];
    for (const [r, i] of e) {
      const s = /* @__PURE__ */ new Map(), d = (u) => {
        s.has(ae(u)) || s.set(ae(u), u);
      };
      i.pins.forEach(d);
      for (const u of i.segments)
        d(u.a), d(u.b);
      for (let u = 0; u < i.segments.length; u++) for (let m = u + 1; m < i.segments.length; m++) {
        const h = i.segments[u], b = i.segments[m];
        if (le(h.a.x, h.b.x) === le(b.a.x, b.b.x)) continue;
        const x = le(h.a.x, h.b.x) ? h : b, E = x === h ? b : h, C = { x: x.a.x, y: E.a.y };
        we(C, x) && we(C, E) && d(C);
      }
      const a = new Map([...s.keys()].map((u) => [u, u])), c = (u) => {
        let m = u;
        for (; a.get(m) !== m; ) m = a.get(m);
        for (; u !== m; ) {
          const h = a.get(u);
          a.set(u, m), u = h;
        }
        return m;
      };
      for (const u of i.segments) {
        const m = [...s.values()].filter((h) => we(h, u));
        for (const h of m.slice(1)) a.set(c(ae(h)), c(ae(m[0])));
      }
      const f = /* @__PURE__ */ new Map();
      for (const u of i.pins) {
        const m = c(ae(u));
        f.has(m) || f.set(m, { pins: [], points: [] }), f.get(m).pins.push(u);
      }
      for (const u of s.values()) {
        const m = c(ae(u));
        f.has(m) && f.get(m).points.push(u);
      }
      n.push({ bit: r, islands: [...f.values()], points: [...s.values()], segments: i.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: r } of this.connectivity()) {
      if (r.length < 2) continue;
      const i = /* @__PURE__ */ new Set([0]);
      for (; i.size < r.length; ) {
        let s;
        for (const d of i) for (let a = 0; a < r.length; a++) if (!i.has(a)) for (const c of r[d].points) for (const f of r[a].points) {
          const u = (c.x - f.x) ** 2 + (c.y - f.y) ** 2;
          (!s || u < s.d) && (s = { bit: n, a: c, b: f, d: u, j: a });
        }
        e.push(s), i.add(s.j);
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
    const r = Math.min(...e), i = Math.min(...n);
    return { x: r, y: i, w: Math.max(...e) - r, h: Math.max(...n) - i };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, r) {
    if (!this.onGrid(n) || !this.onGrid(r)) return null;
    const i = (R) => R.slice(1).every((S, O) => this.validSegment({ a: R[O], b: S }, e));
    for (const R of [[n, r], [n, { x: r.x, y: n.y }, r], [n, { x: n.x, y: r.y }, r]]) {
      const S = Ke(R);
      if (i(S)) return S;
    }
    const s = this.step, d = this.bounds(), a = Math.floor(Math.min(d.x, n.x, r.x) / s) - 5, c = Math.ceil(Math.max(d.x + d.w, n.x, r.x) / s) + 5, f = Math.floor(Math.min(d.y, n.y, r.y) / s) - 5, u = Math.ceil(Math.max(d.y + d.h, n.y, r.y) / s) + 5, m = { x: n.x / s, y: n.y / s, dir: -1, cost: 0, key: n.x / s + "," + n.y / s + ",-1" }, h = [m], b = /* @__PURE__ */ new Map([[m.key, 0]]), x = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map([[m.key, m]]), C = [[1, 0], [-1, 0], [0, 1], [0, -1]], w = (R) => Math.abs(R.x - r.x / s) + Math.abs(R.y - r.y / s);
    let y = null, _ = 0;
    for (; h.length && _++ < 3e4; ) {
      let R = 0;
      for (let O = 1; O < h.length; O++) h[O].cost + w(h[O]) < h[R].cost + w(h[R]) && (R = O);
      const S = h.splice(R, 1)[0];
      if (S.cost === b.get(S.key)) {
        if (S.x === r.x / s && S.y === r.y / s) {
          y = S;
          break;
        }
        for (let O = 0; O < 4; O++) {
          const V = S.x + C[O][0], g = S.y + C[O][1];
          if (V < a || V > c || g < f || g > u) continue;
          const p = { x: V, y: g, dir: O, key: V + "," + g + "," + O, cost: S.cost + 1 + (S.dir !== -1 && S.dir !== O ? 3 : 0) };
          p.cost >= (b.get(p.key) ?? 1 / 0) || !this.validSegment({ a: { x: S.x * s, y: S.y * s }, b: { x: V * s, y: g * s } }, e) || (b.set(p.key, p.cost), x.set(p.key, S.key), E.set(p.key, p), h.push(p));
        }
      }
    }
    if (!y) return null;
    const T = [];
    for (let R = y; R; R = E.get(x.get(R.key))) T.push({ x: R.x * s, y: R.y * s });
    return Ke(T.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const r = /* @__PURE__ */ new Set();
    let i = 0;
    for (; !e() && i++ < Math.max(20, this.pins().length * 2); ) {
      const s = this.airwires().find((a) => !r.has(a.bit + ":" + ae(a.a) + ":" + ae(a.b)));
      if (!s) break;
      const d = this.findPath(s.bit, s.a, s.b);
      d ? (this.segments.push(...d.slice(1).map((a, c) => ({ bit: s.bit, a: d[c], b: a }))), this.cache = null) : r.add(s.bit + ":" + ae(s.a) + ":" + ae(s.b)), i % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const Ut = "spice-viewer-project", Bt = 1, jt = 32 * 1024 * 1024, ie = (t) => {
  throw Error("Invalid project: " + t);
}, xe = (t) => t && typeof t == "object" && !Array.isArray(t), Ie = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, Pe = (t) => xe(t) && Ie(t.x) && Ie(t.y), ve = (t, e) => Math.abs(t - e) < 1e-3, at = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function Ct(t) {
  return xe(t) && Pe(t) && Ie(t.w) && Ie(t.h) && t.w > 0 && t.h > 0;
}
function St(t) {
  (!xe(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && ie("unsupported drawing settings.");
}
function Vt(t) {
  new TextEncoder().encode(t).length > jt && ie("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    ie("expected a JSON project file.");
  }
  (!xe(e) || e.format !== Ut) && ie("unrecognized file format."), e.version !== Bt && ie("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Ue && ie("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && ie("missing netlist or sheet."), (!xe(e.libraries) || Object.entries(e.libraries).some(([r, i]) => !r || ["__proto__", "constructor", "prototype"].includes(r) || typeof i != "string")) && ie("invalid libraries."), St(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((r) => typeof e[r] != "boolean") || !Ct(e.view)) && ie("invalid display settings."), (!xe(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((r) => !Array.isArray(e.colors[r]) || e.colors[r].some((i) => !Array.isArray(i) || i.length !== 2 || typeof i[0] != "string" || !/^#[\da-f]{6}$/i.test(i[1])))) && ie("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && ie("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const r of e.sheets) {
    (!xe(r) || typeof r.scope != "string" || typeof r.topology != "string") && ie("invalid sheet identity."), St(r.settings);
    const i = at(r.scope, r.topology, r.settings);
    n.has(i) && ie("duplicate sheet."), n.add(i), (r.settings.gridSize !== 4 || !r.settings.conventional) && ie("saved manual scenes require the fixed 4-unit grid."), r.view !== void 0 && !Ct(r.view) && ie("invalid sheet viewport."), Qt(r.snapshot);
  }
  return e;
}
function Yn(t) {
  const e = { ...t, format: Ut, version: Bt, layoutRulesVersion: Ue, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return Vt(n), n;
}
function Qt(t) {
  (!xe(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && ie("invalid scene size.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!xe(n) || typeof n.id != "string" || e.has(n.id) || !Pe(n) || !Ie(n.width) || !Ie(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && ie("invalid component geometry."), e.add(n.id);
    const r = /* @__PURE__ */ new Set();
    for (const i of n.ports)
      (!Pe(i) || typeof i.pin != "string" || r.has(i.pin) || !Number.isInteger(i.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(i.side)) && ie("invalid pin."), r.add(i.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(Ie)) && ie("invalid symbol transform.");
  }
  for (const n of t.segments) (!xe(n) || !Number.isInteger(n.bit) || !Pe(n.a) || !Pe(n.b) || !ve(n.a.x, n.b.x) && !ve(n.a.y, n.b.y)) && ie("wire must be orthogonal.");
}
function Ft(t, e, n) {
  Qt(e);
  const r = new Map(t.components.map((c) => [c.id, c]));
  r.size !== e.components.length && ie("component count changed.");
  const i = e.components.map((c) => {
    const f = r.get(c.id);
    (!f || !!f.decoration != !!c.decoration || f.ports.length !== c.ports.length) && ie("component identity changed: " + c.id);
    const u = c.editorMatrix || [1, 0, 0, 1, 0, 0], [m, h, b, x] = u;
    (![m, h, b, x].every((w) => [-1, 0, 1].includes(w)) || m * m + h * h !== 1 || b * b + x * x !== 1 || m * b + h * x !== 0) && ie("symbol transform must be a rotation or mirror.");
    const E = [[0, 0], [f.width, 0], [0, f.height], [f.width, f.height]].map(([w, y]) => ({ x: m * w + b * y + u[4], y: h * w + x * y + u[5] }));
    (!ve(Math.min(...E.map((w) => w.x)), 0) || !ve(Math.min(...E.map((w) => w.y)), 0) || !ve(Math.max(...E.map((w) => w.x)), c.width) || !ve(Math.max(...E.map((w) => w.y)), c.height)) && ie("symbol dimensions changed: " + c.id);
    const C = c.ports.map((w) => {
      const y = f.ports.find((R) => R.pin === w.pin);
      (!y || y.bit !== w.bit || !ve(w.x, c.x + m * (y.x - f.x) + b * (y.y - f.y) + u[4]) || !ve(w.y, c.y + h * (y.x - f.x) + x * (y.y - f.y) + u[5])) && ie("pin connectivity or position changed: " + c.id + "." + w.pin);
      const _ = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[y.side], T = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, R]) => R[0] === m * _[0] + b * _[1] && R[1] === h * _[0] + x * _[1])?.[0];
      return w.side !== T && ie("pin direction changed."), { ...y, x: w.x, y: w.y, side: T };
    });
    return { ...f, x: c.x, y: c.y, width: c.width, height: c.height, ports: C, ...c.editorMatrix ? { editorMatrix: [...u] } : {} };
  }), s = new Dt({ ...t, components: i, segments: e.segments }, { step: n });
  for (let c = 0; c < i.length; c++) for (let f = c + 1; f < i.length; f++) {
    const u = i[c], m = i[f];
    u.x < m.x + m.width - 1e-3 && u.x + u.width > m.x + 1e-3 && u.y < m.y + m.height - 1e-3 && u.y + u.height > m.y + 1e-3 && ie("component symbols overlap.");
  }
  const d = new Set(s.pins().map((c) => c.bit));
  (s.pins().some((c) => !s.onGrid(c)) || s.segments.some((c) => !d.has(c.bit) || !s.validSegment(c, c.bit))) && ie("off-grid wire, symbol collision or short circuit.");
  const a = /* @__PURE__ */ new Map();
  for (const c of s.pins()) {
    const f = c.x + "," + c.y;
    a.has(f) && a.get(f) !== c.bit && ie("different nodes share a pin position."), a.set(f, c.bit);
  }
  return s.snapshot();
}
function Kn(t, e, n) {
  const r = Math.min(e.x, n.x), i = Math.max(e.x, n.x), s = Math.min(e.y, n.y), d = Math.max(e.y, n.y), a = n.x < e.x, c = 1e-3;
  return t.filter((f) => !f.decoration && (a ? f.x <= i + c && f.x + f.width >= r - c && f.y <= d + c && f.y + f.height >= s - c : f.x >= r - c && f.x + f.width <= i + c && f.y >= s - c && f.y + f.height <= d + c)).map((f) => f.id);
}
function Zn(t, e, n, r) {
  const i = new Set(e), s = t.filter((C) => i.has(C.id) && !C.decoration), d = n.startsWith("space-");
  if (s.length < (d ? 3 : 2)) throw Error(d ? "Select at least three components." : "Select at least two components.");
  const a = ["left", "right", "center-x", "space-x"].includes(n), c = ["top", "bottom", "center-y", "space-y"].includes(n);
  if (!a && !c) throw Error("Unknown arrangement.");
  const f = a ? "x" : "y", u = a ? "width" : "height", m = Math.min(...s.map((C) => C[f])), h = Math.max(...s.map((C) => C[f] + C[u])), b = /* @__PURE__ */ new Map();
  if (d) {
    const C = [...s].sort((R, S) => R[f] - S[f] || R.id.localeCompare(S.id)), w = C.at(-1), y = w[f] + w[u] - C[0][f], _ = (y - C.reduce((R, S) => R + S[u], 0)) / (s.length - 1);
    if (_ < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let T = C[0][f];
    for (const R of C)
      b.set(R.id, T), T += R[u] + _;
  } else for (const C of s) b.set(C.id, ["left", "top"].includes(n) ? m : ["right", "bottom"].includes(n) ? h - C[u] : (m + h - C[u]) / 2);
  let x = !1;
  return { moves: s.map((C) => {
    const w = b.get(C.id) - C[f], y = Math.round(w / r) * r;
    return Math.abs(y - w) > 1e-3 && (x = !0), { id: C.id, dx: a ? y : 0, dy: c ? y : 0 };
  }), rounded: x };
}
const Jn = "http://www.w3.org/2000/svg", fe = (t, e = {}) => {
  const n = document.createElementNS(Jn, t);
  for (const [r, i] of Object.entries(e)) n.setAttribute(r, i);
  return n;
}, eo = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Gt(t, e, n, r) {
  const i = structuredClone(e);
  for (const a of i.components) {
    const c = t.getElementById("cell_" + a.id);
    for (const f of a.ports) {
      const u = [...c.children].find((m) => m.getAttribute("s:pid") === f.pin);
      f.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[u?.getAttribute("s:position")] || f.side;
    }
  }
  for (const [a, c] of Object.entries(r.modules.circuit.cells)) if (c.attributes.name === "0") {
    const f = t.getElementById("cell_" + a), u = f?.transform.baseVal.consolidate().matrix;
    f && u && i.components.push({ id: a, decoration: !0, x: u.e, y: u.f, width: +f.getAttribute("s:width"), height: +f.getAttribute("s:height"), ports: [...f.children].filter((m) => m.hasAttribute("s:pid")).map((m) => ({ pin: m.getAttribute("s:pid"), x: u.e + Number(m.getAttribute("s:x")), y: u.f + Number(m.getAttribute("s:y")), bit: c.connections[m.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const s = new Map(Object.values(n.nodes).map((a) => [a.name, a.bit])), d = [...t.children].filter((a) => a.localName === "line" && a.hasAttribute("data-net")).map((a) => ({ bit: s.get(a.dataset.net), a: { x: +a.getAttribute("x1"), y: +a.getAttribute("y1") }, b: { x: +a.getAttribute("x2"), y: +a.getAttribute("y2") } }));
  return { ...i, segments: d };
}
function to(t, e, { changed: n, inspect: r, getNetColor: i }) {
  let s = null, d = null, a = !1, c = !1, f = null, u = null, m = null, h = null, b = /* @__PURE__ */ new Set(), x = 0, E = "", C = 8, w = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map();
  const T = (I) => new DOMPoint(I.clientX, I.clientY).matrixTransform(d.getScreenCTM().inverse()), R = (I) => s.snap(T(I)), S = (I) => i?.(I) || ze[Number(I) % ze.length], O = (I) => {
    e("editor-status").textContent = I;
  };
  function V() {
    return { unrouted: s?.airwires().length || 0, wires: s?.segments.length || 0, editing: a, routing: c, selectedComponents: [...b] };
  }
  function g() {
    const I = !!s;
    for (const U of ["interactive", "flywire", "auto-route"]) e(U).disabled = !d || c;
    e("edit-tool").disabled = !I || c;
    for (const U of document.querySelectorAll("[data-editor-mode]"))
      U.disabled = !d || c, U.setAttribute("aria-pressed", String(a && U.dataset.editorMode === e("edit-tool").value));
    for (const U of document.querySelectorAll("[data-editor-arrange]")) U.disabled = !a || !I || c || b.size < (U.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !I || c || !s.undoStack.length, e("wire-redo").disabled = !I || c || !s.redoStack.length, t.classList.toggle("spice-editing", a), t.dataset.toolMode = a ? e("edit-tool").value : "none";
  }
  function p(I, U) {
    const B = _.get(I.id);
    if (B && (U.replaceChildren(...B.children.map((W) => W.cloneNode(!0))), I.editorMatrix)) {
      const W = I.editorMatrix, te = fe("g", { transform: "matrix(" + W.join(" ") + ")", "data-editor-glyph": "true" });
      te.append(...U.childNodes);
      for (const G of te.querySelectorAll("text")) G.remove();
      U.append(te);
      for (const [G, H] of B.labels.entries()) {
        const K = H.node.cloneNode(!0);
        K.removeAttribute("transform");
        let ee = W[0] * H.x + W[2] * H.y + W[4], pe = W[1] * H.x + W[3] * H.y + W[5];
        if (I.ports.length === 2 && B.labels.length === 2) {
          const k = Math.abs(I.ports[0].y - I.ports[1].y) < 1e-3;
          ee = k ? I.width / 2 : I.ports[0].x - I.x + 20, pe = k ? I.ports[0].y - I.y - 26 + G * 16 : I.height / 2 - 8 + G * 16, K.setAttribute("text-anchor", k ? "middle" : "start");
        }
        K.setAttribute("x", ee), K.setAttribute("y", pe), U.append(K);
      }
    }
  }
  function D(I) {
    if (f = null, m = null, u = null, ["rotate", "mirror-x", "mirror-y"].includes(I) && b.size === 1) {
      try {
        s.transform([...b][0], I), A();
      } catch (U) {
        O(U.message);
      }
      return;
    }
    e("edit-tool").value = I, s ? A() : g();
  }
  function $() {
    if (!s) return;
    const I = V();
    O(`${b.size ? b.size + " selected · " : ""}${I.unrouted} connection${I.unrouted === 1 ? "" : "s"} unrouted · ${I.wires} wire segments${c ? " · Auto-routing…" : ""}`), g(), n(s.drawing(), I, s.bounds()), y.set(E, s.snapshot());
  }
  function q(I) {
    const U = d.querySelector("[data-airwires]");
    U ? d.insertBefore(I, U) : d.append(I);
  }
  function X() {
    if (d?.querySelector("[data-route-preview]")?.remove(), d?.querySelector("[data-route-guides]")?.remove(), !d) return;
    if (a && e("edit-tool").value === "route" && h) {
      const B = t.getBoundingClientRect(), W = d.getScreenCTM().inverse(), te = new DOMPoint(B.left, B.top).matrixTransform(W), G = new DOMPoint(B.right, B.bottom).matrixTransform(W), H = fe("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      H.append(fe("line", { x1: te.x, y1: h.y, x2: G.x, y2: h.y, "vector-effect": "non-scaling-stroke" }), fe("line", { x1: h.x, y1: te.y, x2: h.x, y2: G.y, "vector-effect": "non-scaling-stroke" })), q(H);
    }
    if (!f) return;
    const I = [...f.points];
    if (h) {
      const B = I.at(-1);
      I.push({ x: h.x, y: B.y }, h);
    }
    const U = fe("g", { "data-route-preview": "true", "data-waypoints": f.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    U.append(fe("polyline", { points: I.map((B) => B.x + "," + B.y).join(" "), fill: "none", stroke: S(f.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), q(U);
  }
  function se() {
    if (d?.querySelector("[data-selection-box]")?.remove(), !m || !d) return;
    const I = m.start, U = m.end, B = U.x < I.x;
    q(fe("rect", { x: Math.min(I.x, U.x), y: Math.min(I.y, U.y), width: Math.abs(I.x - U.x), height: Math.abs(I.y - U.y), fill: B ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: B ? "#4c9675" : "#507d9c", "stroke-dasharray": B ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": B ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function A() {
    if (!d || !s) return;
    for (const G of d.querySelectorAll("[data-editor-body-hit]")) G.remove();
    for (const G of [...d.children]) (G.hasAttribute("data-editor-overlay") || G.hasAttribute("data-airwires") || G.hasAttribute("data-manual-state") || G.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(G.localName)) && G.remove();
    for (const G of s.components) {
      const H = d.getElementById("cell_" + G.id);
      H && (H.style.removeProperty("opacity"), p(G, H), H.setAttribute("s:width", G.width), H.setAttribute("s:height", G.height), H.setAttribute("transform", `translate(${G.x},${G.y})`), H.dataset.editorComponent = G.id, a && H.prepend(fe("rect", { x: 0, y: 0, width: G.width, height: G.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const I = d.querySelector('g[id^="cell_"]'), U = fe("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), B = fe("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [G, H] of s.segments.entries()) {
      const K = fe("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, class: "net_" + H.bit, "data-net": w.get(H.bit) || String(H.bit), "stroke-width": 1.4 });
      K.append(fe("title")), K.firstChild.textContent = "Node " + (w.get(H.bit) || H.bit), d.insertBefore(K, I), a && ["route", "erase"].includes(e("edit-tool").value) && U.append(fe("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, "data-editor-wire": G, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const G of s.connectivity()) for (const H of G.points) {
      const K = /* @__PURE__ */ new Set();
      for (const ee of G.segments) we(H, ee) && (Math.min(ee.a.x, ee.b.x) < H.x - 1e-3 && K.add("w"), Math.max(ee.a.x, ee.b.x) > H.x + 1e-3 && K.add("e"), Math.min(ee.a.y, ee.b.y) < H.y - 1e-3 && K.add("n"), Math.max(ee.a.y, ee.b.y) > H.y + 1e-3 && K.add("s"));
      (K.size >= 3 || K.size >= 2 && G.islands.some((ee) => ee.pins.some((pe) => eo(H, pe)))) && d.insertBefore(fe("circle", { cx: H.x, cy: H.y, r: 2, class: "net_" + G.bit, "data-net": w.get(G.bit) || String(G.bit), fill: S(G.bit) }), I);
    }
    if (a) {
      for (const G of s.components.filter((H) => b.has(H.id))) U.append(fe("rect", { x: G.x - 3, y: G.y - 3, width: G.width + 6, height: G.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": G.id }));
      for (const G of s.pins()) {
        const H = fe("circle", { cx: G.x, cy: G.y, r: 3, "data-editor-pin": G.id, "data-editor-bit": G.bit, fill: "#fff", stroke: S(G.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": G.owner + " " + G.pin }), K = fe("title");
        K.textContent = G.id + " · " + (w.get(G.bit) || G.bit), H.append(K), B.append(H);
      }
      d.append(U, B);
    }
    X();
    const W = fe("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const G of s.airwires()) W.append(fe("line", { x1: G.a.x, y1: G.a.y, x2: G.b.x, y2: G.b.y, stroke: S(G.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": G.bit, "data-from-owner": G.a.owner || "", "data-to-owner": G.b.owner || "" }));
    d.append(W);
    const te = fe("metadata", { "data-manual-state": "true" });
    te.textContent = JSON.stringify({ version: 1, grid: C, unrouted: s.airwires().length, manual: !0 }), d.insertBefore(te, W), $();
  }
  function P(I, U) {
    if (!f) {
      f = { bit: U, points: [I], checkpoints: [] }, X(), O("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (U !== void 0 && f.bit !== U) {
      O("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const B = f.points.at(-1), W = s.findPath(f.bit, B, I);
    if (!W) {
      O("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (U === void 0) {
      W.length > 1 && (f.checkpoints.push(f.points.length), f.points.push(...W.slice(1))), X();
      return;
    }
    try {
      s.addPath(U, [...f.points, ...W.slice(1)]), f = null, A();
    } catch (te) {
      O(te.message);
    }
  }
  t.addEventListener("pointerdown", (I) => {
    if (!a || c || !s || !d || I.button !== 0 || I.shiftKey) return;
    const U = e("edit-tool").value, B = I.target.closest("[data-editor-pin]"), W = I.target.closest("[data-editor-wire]"), te = B && s.pins().find((K) => K.id === B.dataset.editorPin), G = I.target.closest("[data-editor-component]") || te && d.getElementById("cell_" + te.owner), H = G && s.components.find((K) => K.id === G.dataset.editorComponent && !K.decoration);
    if (U === "box") {
      I.preventDefault(), I.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), m = { start: T(I), end: T(I), additive: I.ctrlKey || I.metaKey }, t.setPointerCapture(I.pointerId), se();
      return;
    }
    if (U === "route" || U === "erase") {
      if (I.preventDefault(), I.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), h = R(I), U === "erase") {
        W && (s.remove(+W.dataset.editorWire), A());
        return;
      }
      if (te) {
        P({ x: te.x, y: te.y }, te.bit);
        return;
      }
      if (W) {
        const K = s.segments[+W.dataset.editorWire], ee = R(I);
        P(K.a.x === K.b.x ? { x: K.a.x, y: ee.y } : { x: ee.x, y: K.a.y }, K.bit);
        return;
      }
      f ? P(R(I)) : X();
      return;
    }
    if (!H) {
      b.size && (b.clear(), A());
      return;
    }
    if (I.preventDefault(), I.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), r?.(H.id), I.ctrlKey || I.metaKey) {
      b.has(H.id) ? b.delete(H.id) : b.add(H.id), A();
      return;
    }
    if ((U !== "move" || !b.has(H.id)) && (b = /* @__PURE__ */ new Set([H.id])), ["rotate", "mirror-x", "mirror-y"].includes(U)) {
      D(U);
      return;
    }
    if (A(), U === "move") {
      u = { entries: s.components.filter((K) => b.has(K.id)).map((K) => ({ n: K, element: d.getElementById("cell_" + K.id) })), start: T(I), dx: 0, dy: 0 };
      for (const K of u.entries) K.element.style.opacity = ".6";
      t.setPointerCapture(I.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (I) => {
    if (!(!a || !s || !d)) {
      if (h = R(I), m) {
        I.stopImmediatePropagation(), m.end = T(I), se();
        return;
      }
      if (u) {
        I.stopImmediatePropagation();
        const U = T(I), B = s.snap({ x: U.x - u.start.x, y: U.y - u.start.y });
        u.dx = B.x, u.dy = B.y;
        for (const { n: W, element: te } of u.entries) {
          te.setAttribute("transform", `translate(${W.x + B.x},${W.y + B.y})`);
          const G = d.querySelector('[data-selected-component="' + CSS.escape(W.id) + '"]');
          G && (G.setAttribute("x", W.x + B.x - 3), G.setAttribute("y", W.y + B.y - 3));
        }
        for (const W of d.querySelectorAll("[data-airwires] line"))
          b.has(W.dataset.fromOwner) && (W.setAttribute("x1", +W.getAttribute("x1") - Number(W.dataset.dx || 0) + B.x), W.setAttribute("y1", +W.getAttribute("y1") - Number(W.dataset.dy || 0) + B.y)), b.has(W.dataset.toOwner) && (W.setAttribute("x2", +W.getAttribute("x2") - Number(W.dataset.dx || 0) + B.x), W.setAttribute("y2", +W.getAttribute("y2") - Number(W.dataset.dy || 0) + B.y)), W.dataset.dx = B.x, W.dataset.dy = B.y;
        return;
      }
      e("edit-tool").value === "route" && X();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (I) => {
    if (!m && !u) return;
    if (I.preventDefault(), I.stopImmediatePropagation(), t.hasPointerCapture(I.pointerId) && t.releasePointerCapture(I.pointerId), m) {
      const B = m;
      m = null;
      const W = Kn(s.components, B.start, T(I));
      b = B.additive ? /* @__PURE__ */ new Set([...b, ...W]) : new Set(W), A();
      return;
    }
    const U = u;
    u = null;
    for (const B of U.entries) B.element.style.opacity = "";
    try {
      s.moveMany(U.entries.map(({ n: B }) => ({ id: B.id, dx: U.dx, dy: U.dy }))), A();
    } catch (B) {
      A(), O(B.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (u || m) && (u = null, m = null, A());
  }), t.addEventListener("pointerleave", () => {
    !u && !m && (h = null, X());
  }), t.addEventListener("wheel", (I) => {
    requestAnimationFrame(() => {
      a && s && d && e("edit-tool").value === "route" && (h = R(I), X());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (I) => {
    if (e("download-dialog").open || !a || !s || c || I.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(I.target)) return;
    const U = I.target.closest("[data-editor-pin]"), B = I.key.toLowerCase();
    if (U && e("edit-tool").value === "route" && (I.key === "Enter" || I.key === " ")) {
      I.preventDefault(), I.stopImmediatePropagation();
      const W = s.pins().find((te) => te.id === U.dataset.editorPin);
      P({ x: W.x, y: W.y }, W.bit);
      return;
    }
    if (I.key === "Backspace" && e("edit-tool").value === "route") {
      if (I.preventDefault(), I.stopImmediatePropagation(), f) {
        const W = f.checkpoints.pop();
        W === void 0 ? f = null : f.points.length = W, X(), O(f ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    I.key === "Escape" ? (I.preventDefault(), I.stopImmediatePropagation(), f = null, u = null, m = null, D("select")) : (I.ctrlKey || I.metaKey) && B === "z" ? (I.preventDefault(), I.stopImmediatePropagation(), I.shiftKey ? s.redo() : s.undo(), f = null, u = null, m = null, A()) : !I.ctrlKey && !I.metaKey && !I.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[B] && (I.preventDefault(), I.stopImmediatePropagation(), D({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[B]));
  }, { capture: !0 });
  function z(I) {
    if (!(!s || c)) {
      f = null, u = null, m = null, e("edit-tool").value = "select";
      try {
        const { moves: U, rounded: B } = Zn(s.components, b, I, C);
        s.moveMany(U), A(), O(`${b.size} components arranged.${B ? " Centers or gaps rounded to the " + C + "-unit pin grid." : ""} Detached connections remain flywires.`);
      } catch (U) {
        A(), O(U.message);
      }
    }
  }
  async function Y() {
    if (!s || c) return;
    const I = x;
    c = !0, $(), O("Auto-routing remaining connections…");
    try {
      await s.autoRoute(() => I !== x), I === x && (f = null, c = !1, A());
    } catch (U) {
      I === x && (c = !1, A(), O(U.message));
    }
  }
  return {
    mount(I, U, B, W, te, { reset: G = !1, scope: H = "" } = {}) {
      x++, c = !1, d = I, f = null, u = null, m = null, h = null, b.clear(), _ = /* @__PURE__ */ new Map();
      for (const pe of d.querySelectorAll('g[id^="cell_"]')) {
        const k = pe.getCTM().inverse();
        _.set(pe.id.slice(5), { children: [...pe.childNodes].map((L) => L.cloneNode(!0)), labels: [...pe.querySelectorAll("text")].map((L) => {
          const Q = new DOMPoint(+L.getAttribute("x") || 0, +L.getAttribute("y") || 0).matrixTransform(k.multiply(L.getCTM()));
          return { node: L.cloneNode(!0), x: Q.x, y: Q.y };
        }) });
      }
      if (C = te.gridSize || 0, w = new Map(Object.values(B.nodes).map((pe) => [pe.bit, pe.name])), !U || !C) {
        s = null, g();
        return;
      }
      const K = Gt(d, U, B, W), ee = K.segments;
      s = new Dt(K, { step: C, segments: ee }), E = at(H, B.topology.signature, te), !G && y.has(E) ? s.restore(Ft({ ...K, segments: ee }, y.get(E), C)) : e("flywire").checked && s.clear(), a = e("interactive").checked, a || !G && y.has(E) || e("flywire").checked ? A() : g();
    },
    invalidate() {
      s && !c && y.set(E, s.snapshot()), x++, c = !1, s = null, d = null, f = null, u = null, m = null, h = null, b.clear(), g();
    },
    snapshotSheets() {
      return s && !c && y.set(E, s.snapshot()), [...y].map(([I, U]) => {
        const [B, W, te] = JSON.parse(I);
        return { scope: B, topology: W, settings: te, snapshot: structuredClone(U) };
      });
    },
    restoreSheets(I) {
      y = new Map(I.map((U) => [at(U.scope, U.topology, U.settings), structuredClone(U.snapshot)]));
    },
    clearSheets() {
      y.clear();
    },
    setEnabled(I) {
      a = I, I || (f = null, u = null, m = null, h = null, b.clear()), s ? A() : g();
    },
    clear() {
      s && (s.clear(), f = null, A());
    },
    autoRoute: Y,
    chooseTool: D,
    arrange: z,
    undo() {
      s && (f = null, u = null, m = null, s.undo(), A());
    },
    redo() {
      s && (f = null, u = null, m = null, s.redo(), A());
    },
    complete() {
      return !s || !c && s.airwires().length === 0;
    },
    working() {
      return c;
    },
    stats: V,
    canEdit() {
      return !!s;
    },
    refreshColors() {
      if (d) {
        for (const I of d.querySelectorAll("[data-air-net]")) I.setAttribute("stroke", S(+I.dataset.airNet));
        for (const I of d.querySelectorAll("[data-editor-bit]")) I.setAttribute("stroke", S(+I.dataset.editorBit));
      }
    },
    cleanExport(I) {
      for (const U of I.querySelectorAll("[data-editor-overlay],[data-route-preview]")) U.remove();
      for (const U of I.querySelectorAll("[data-editor-component]"))
        U.removeAttribute("data-editor-component"), U.style.removeProperty("opacity");
    }
  };
}
const ct = 4, Fe = "http://www.w3.org/2000/svg";
function Ge(t, e, n = !0, r = null) {
  let i = t.querySelector("defs[data-coordinate-grid]"), s = t.querySelector("rect[data-coordinate-grid]");
  if (!i) {
    i = document.createElementNS(Fe, "defs"), i.dataset.coordinateGrid = "true";
    const b = document.createElementNS(Fe, "pattern");
    b.id = "spice-coordinate-grid", b.setAttribute("patternUnits", "userSpaceOnUse");
    const x = document.createElementNS(Fe, "path");
    x.setAttribute("fill", "none"), x.setAttribute("stroke", "#737b83"), x.setAttribute("stroke-opacity", ".38"), x.setAttribute("stroke-width", ".55"), x.setAttribute("vector-effect", "non-scaling-stroke"), b.append(x), i.append(b), s = document.createElementNS(Fe, "rect"), s.dataset.coordinateGrid = "true", s.setAttribute("fill", "url(#spice-coordinate-grid)"), s.setAttribute("stroke", "none"), s.setAttribute("pointer-events", "none"), t.prepend(s), t.prepend(i);
  }
  const d = i.firstElementChild, a = e || 8;
  d.setAttribute("width", a), d.setAttribute("height", a), d.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), s.setAttribute("visibility", n && e ? "visible" : "hidden");
  let c = d.querySelector("[data-minor-grid]");
  c || (c = d.firstElementChild.cloneNode(), c.setAttribute("data-minor-grid", "true"), c.setAttribute("stroke-opacity", ".16"), d.append(c));
  const f = [];
  for (let b = ct; b < a; b += ct) f.push(`M${b},0 V${a} M0,${b} H${a}`);
  c.setAttribute("d", f.join(" ")), t.dataset.displayGridStep = String(a);
  let u = r;
  const m = t.closest(".spice-preview"), h = t.isConnected && m ? t.getScreenCTM() : null;
  if (h) {
    const b = m.getBoundingClientRect(), x = h.inverse(), E = [[b.left - 1, b.top - 1], [b.right + 1, b.top - 1], [b.right + 1, b.bottom + 1], [b.left - 1, b.bottom + 1]].map(([y, _]) => new DOMPoint(y, _).matrixTransform(x)), C = Math.min(...E.map((y) => y.x)), w = Math.min(...E.map((y) => y.y));
    u = { x: C, y: w, w: Math.max(...E.map((y) => y.x)) - C, h: Math.max(...E.map((y) => y.y)) - w };
  }
  if (!u) {
    const b = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    u = { x: b[0], y: b[1], w: b[2], h: b[3] };
  }
  for (const [b, x] of Object.entries({ x: u.x, y: u.y, width: u.w, height: u.h })) s.setAttribute(b, x);
}
const no = `<svg
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
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
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
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
</svg>
`, po = `<svg
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
`, mo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
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
  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
  <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
  <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
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
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M12 2v20" />
</svg>
`, Co = `<svg
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 12h20" />
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
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
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
  <rect width="6" height="14" x="3" y="5" rx="2" />
  <rect width="6" height="10" x="15" y="7" rx="2" />
  <path d="M3 2v20" />
  <path d="M21 2v20" />
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
  <rect width="14" height="6" x="5" y="15" rx="2" />
  <rect width="10" height="6" x="7" y="3" rx="2" />
  <path d="M2 21h20" />
  <path d="M2 3h20" />
</svg>
`;
function Oo(t) {
  const e = { select: xo, box: Eo, move: no, route: oo, erase: ro, rotate: io, "mirror-x": so, "mirror-y": ao }, n = { left: _o, right: Co, top: So, bottom: To, "center-x": No, "center-y": Io, "space-x": Ao, "space-y": ko }, r = { "zoom-in": co, "zoom-out": lo, fit: uo, "wire-undo": fo, "wire-redo": ho, "auto-route": po, "pin-editor": Ze, "pin-info": Ze, "pin-details": Ze, fullscreen: mo, "exit-fullscreen": go, "reset-windows": bo, "open-download": yo, upload: wo }, i = (s, d) => {
    if (!s) return;
    const a = s.title || s.getAttribute("aria-label") || s.textContent;
    s.setAttribute("aria-label", a), s.title = a, s.innerHTML = d, s.firstElementChild.setAttribute("aria-hidden", "true"), s.firstElementChild.setAttribute("focusable", "false"), s.classList.add("spice-icon-button");
  };
  i(t.querySelector("#spice-copy"), vo);
  for (const [s, d] of Object.entries(n)) i(t.querySelector(`[data-editor-arrange="${s}"]`), d);
  for (const [s, d] of Object.entries(e)) i(t.querySelector(`[data-editor-mode="${s}"]`), d);
  for (const [s, d] of Object.entries(r)) i(t.querySelector("#spice-" + s), d);
}
function Mo(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function r() {
      var i = !1;
      try {
        i = this instanceof r;
      } catch {
      }
      return i ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(r) {
    var i = Object.getOwnPropertyDescriptor(t, r);
    Object.defineProperty(n, r, i.get ? i : {
      enumerable: !0,
      get: function() {
        return t[r];
      }
    });
  }), n;
}
var Je = {};
const Ro = {}, Lo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ro
}, Symbol.toStringTag, { value: "Module" })), Po = /* @__PURE__ */ Mo(Lo);
var It;
function Do() {
  return It || (It = 1, (function(t) {
    (function(e) {
      e.parser = function(l, o) {
        return new r(l, o);
      }, e.SAXParser = r, e.SAXStream = m, e.createStream = f, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function r(l, o) {
        if (!(this instanceof r))
          return new r(l, o);
        var v = this;
        s(v), v.q = v.c = "", v.bufferCheckPosition = e.MAX_BUFFER_LENGTH, v.encoding = null, v.opt = o || {}, v.opt.lowercase = v.opt.lowercase || v.opt.lowercasetags, v.looseCase = v.opt.lowercase ? "toLowerCase" : "toUpperCase", v.opt.maxEntityCount = v.opt.maxEntityCount || 512, v.opt.maxEntityDepth = v.opt.maxEntityDepth || 4, v.entityCount = v.entityDepth = 0, v.tags = [], v.closed = v.closedRoot = v.sawRoot = !1, v.tag = v.error = null, v.strict = !!l, v.noscript = !!(l || v.opt.noscript), v.state = p.BEGIN, v.strictEntities = v.opt.strictEntities, v.ENTITIES = v.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), v.attribList = [], v.opt.xmlns && (v.ns = Object.create(C)), v.opt.unquotedAttributeValues === void 0 && (v.opt.unquotedAttributeValues = !l), v.trackPosition = v.opt.position !== !1, v.trackPosition && (v.position = v.line = v.column = 0), $(v, "onready");
      }
      Object.create || (Object.create = function(l) {
        function o() {
        }
        o.prototype = l;
        var v = new o();
        return v;
      }), Object.keys || (Object.keys = function(l) {
        var o = [];
        for (var v in l) l.hasOwnProperty(v) && o.push(v);
        return o;
      });
      function i(l) {
        for (var o = Math.max(e.MAX_BUFFER_LENGTH, 10), v = 0, N = 0, J = n.length; N < J; N++) {
          var re = l[n[N]].length;
          if (re > o)
            switch (n[N]) {
              case "textNode":
                z(l);
                break;
              case "cdata":
                P(l, "oncdata", l.cdata), l.cdata = "";
                break;
              case "script":
                P(l, "onscript", l.script), l.script = "";
                break;
              default:
                I(l, "Max buffer length exceeded: " + n[N]);
            }
          v = Math.max(v, re);
        }
        var ne = e.MAX_BUFFER_LENGTH - v;
        l.bufferCheckPosition = ne + l.position;
      }
      function s(l) {
        for (var o = 0, v = n.length; o < v; o++)
          l[n[o]] = "";
      }
      function d(l) {
        z(l), l.cdata !== "" && (P(l, "oncdata", l.cdata), l.cdata = ""), l.script !== "" && (P(l, "onscript", l.script), l.script = "");
      }
      r.prototype = {
        end: function() {
          U(this);
        },
        write: Q,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          d(this);
        }
      };
      var a;
      try {
        a = Po.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var c = e.EVENTS.filter(function(l) {
        return l !== "error" && l !== "end";
      });
      function f(l, o) {
        return new m(l, o);
      }
      function u(l, o) {
        if (l.length >= 2) {
          if (l[0] === 255 && l[1] === 254)
            return "utf-16le";
          if (l[0] === 254 && l[1] === 255)
            return "utf-16be";
        }
        return l.length >= 3 && l[0] === 239 && l[1] === 187 && l[2] === 191 ? "utf8" : l.length >= 4 ? l[0] === 60 && l[1] === 0 && l[2] === 63 && l[3] === 0 ? "utf-16le" : l[0] === 0 && l[1] === 60 && l[2] === 0 && l[3] === 63 ? "utf-16be" : "utf8" : o ? "utf8" : null;
      }
      function m(l, o) {
        if (!(this instanceof m))
          return new m(l, o);
        a.apply(this), this._parser = new r(l, o), this.writable = !0, this.readable = !0;
        var v = this;
        this._parser.onend = function() {
          v.emit("end");
        }, this._parser.onerror = function(N) {
          v.emit("error", N), v._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, c.forEach(function(N) {
          Object.defineProperty(v, "on" + N, {
            get: function() {
              return v._parser["on" + N];
            },
            set: function(J) {
              if (!J)
                return v.removeAllListeners(N), v._parser["on" + N] = J, J;
              v.on(N, J);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      m.prototype = Object.create(a.prototype, {
        constructor: {
          value: m
        }
      }), m.prototype._decodeBuffer = function(l, o) {
        if (this._decoderBuffer && (l = Buffer.concat([this._decoderBuffer, l]), this._decoderBuffer = null), !this._decoder) {
          var v = u(l, o);
          if (!v)
            return this._decoderBuffer = l, "";
          this._parser.encoding = v, this._decoder = new TextDecoder(v);
        }
        return this._decoder.decode(l, { stream: !o });
      }, m.prototype.write = function(l) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(l))
          l = this._decodeBuffer(l, !1);
        else if (this._decoderBuffer) {
          var o = this._decodeBuffer(Buffer.alloc(0), !0);
          o && (this._parser.write(o), this.emit("data", o));
        }
        return this._parser.write(l.toString()), this.emit("data", l), !0;
      }, m.prototype.end = function(l) {
        if (l && l.length && this.write(l), this._decoderBuffer) {
          var o = this._decodeBuffer(Buffer.alloc(0), !0);
          o && (this._parser.write(o), this.emit("data", o));
        } else if (this._decoder) {
          var v = this._decoder.decode();
          v && (this._parser.write(v), this.emit("data", v));
        }
        return this._parser.end(), !0;
      }, m.prototype.on = function(l, o) {
        var v = this;
        return !v._parser["on" + l] && c.indexOf(l) !== -1 && (v._parser["on" + l] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, l), v.emit.apply(v, N);
        }), a.prototype.on.call(v, l, o);
      };
      var h = /^\[CDATA\[$/i, b = /^DOCTYPE$/i, x = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", C = { xml: x, xmlns: E }, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, _ = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function R(l) {
        return l === " " || l === `
` || l === "\r" || l === "	";
      }
      function S(l) {
        return l === '"' || l === "'";
      }
      function O(l) {
        return l === ">" || R(l);
      }
      function V(l, o) {
        return l.test(o);
      }
      function g(l, o) {
        return !V(l, o);
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
      }), Object.keys(e.ENTITIES).forEach(function(l) {
        var o = e.ENTITIES[l], v = typeof o == "number" ? String.fromCharCode(o) : o;
        e.ENTITIES[l] = v;
      });
      for (var D in e.STATE)
        e.STATE[e.STATE[D]] = D;
      p = e.STATE;
      function $(l, o, v) {
        l[o] && l[o](v);
      }
      function q(l) {
        var o = l && l.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return o ? o[2] : null;
      }
      function X(l) {
        return l ? l.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function se(l, o) {
        const v = X(l), N = X(o);
        return !v || !N ? !0 : N === "utf16" ? v === "utf16le" || v === "utf16be" : v === N;
      }
      function A(l, o) {
        if (!(!l.strict || !l.encoding || !o || o.name !== "xml")) {
          var v = q(o.body);
          v && !se(l.encoding, v) && B(
            l,
            "XML declaration encoding " + v + " does not match detected stream encoding " + l.encoding.toUpperCase()
          );
        }
      }
      function P(l, o, v) {
        l.textNode && z(l), $(l, o, v);
      }
      function z(l) {
        l.textNode = Y(l.opt, l.textNode), l.textNode && $(l, "ontext", l.textNode), l.textNode = "";
      }
      function Y(l, o) {
        return l.trim && (o = o.trim()), l.normalize && (o = o.replace(/\s+/g, " ")), o;
      }
      function I(l, o) {
        return z(l), l.trackPosition && (o += `
Line: ` + l.line + `
Column: ` + l.column + `
Char: ` + l.c), o = new Error(o), l.error = o, $(l, "onerror", o), l;
      }
      function U(l) {
        return l.sawRoot && !l.closedRoot && B(l, "Unclosed root tag"), l.state !== p.BEGIN && l.state !== p.BEGIN_WHITESPACE && l.state !== p.TEXT && I(l, "Unexpected end"), z(l), l.c = "", l.closed = !0, $(l, "onend"), r.call(l, l.strict, l.opt), l;
      }
      function B(l, o) {
        if (typeof l != "object" || !(l instanceof r))
          throw new Error("bad call to strictFail");
        l.strict && I(l, o);
      }
      function W(l) {
        l.strict || (l.tagName = l.tagName[l.looseCase]());
        var o = l.tags[l.tags.length - 1] || l, v = l.tag = { name: l.tagName, attributes: {} };
        l.opt.xmlns && (v.ns = o.ns), l.attribList.length = 0, P(l, "onopentagstart", v);
      }
      function te(l, o) {
        var v = l.indexOf(":"), N = v < 0 ? ["", l] : l.split(":"), J = N[0], re = N[1];
        return o && l === "xmlns" && (J = "xmlns", re = ""), { prefix: J, local: re };
      }
      function G(l) {
        if (l.strict || (l.attribName = l.attribName[l.looseCase]()), l.attribList.indexOf(l.attribName) !== -1 || l.tag.attributes.hasOwnProperty(l.attribName)) {
          l.attribName = l.attribValue = "";
          return;
        }
        if (l.opt.xmlns) {
          var o = te(l.attribName, !0), v = o.prefix, N = o.local;
          if (v === "xmlns")
            if (N === "xml" && l.attribValue !== x)
              B(
                l,
                "xml: prefix must be bound to " + x + `
Actual: ` + l.attribValue
              );
            else if (N === "xmlns" && l.attribValue !== E)
              B(
                l,
                "xmlns: prefix must be bound to " + E + `
Actual: ` + l.attribValue
              );
            else {
              var J = l.tag, re = l.tags[l.tags.length - 1] || l;
              J.ns === re.ns && (J.ns = Object.create(re.ns)), J.ns[N] = l.attribValue;
            }
          l.attribList.push([l.attribName, l.attribValue]);
        } else
          l.tag.attributes[l.attribName] = l.attribValue, P(l, "onattribute", {
            name: l.attribName,
            value: l.attribValue
          });
        l.attribName = l.attribValue = "";
      }
      function H(l, o) {
        if (l.opt.xmlns) {
          var v = l.tag, N = te(l.tagName);
          v.prefix = N.prefix, v.local = N.local, v.uri = v.ns[N.prefix] || "", v.prefix && !v.uri && (B(
            l,
            "Unbound namespace prefix: " + JSON.stringify(l.tagName)
          ), v.uri = N.prefix);
          var J = l.tags[l.tags.length - 1] || l;
          v.ns && J.ns !== v.ns && Object.keys(v.ns).forEach(function(Be) {
            P(l, "onopennamespace", {
              prefix: Be,
              uri: v.ns[Be]
            });
          });
          for (var re = 0, ne = l.attribList.length; re < ne; re++) {
            var de = l.attribList[re], oe = de[0], F = de[1], Z = te(oe, !0), ue = Z.prefix, _e = Z.local, Ee = ue === "" ? "" : v.ns[ue] || "", Ne = {
              name: oe,
              value: F,
              prefix: ue,
              local: _e,
              uri: Ee
            };
            ue && ue !== "xmlns" && !Ee && (B(
              l,
              "Unbound namespace prefix: " + JSON.stringify(ue)
            ), Ne.uri = ue), l.tag.attributes[oe] = Ne, P(l, "onattribute", Ne);
          }
          l.attribList.length = 0;
        }
        l.tag.isSelfClosing = !!o, l.sawRoot = !0, l.tags.push(l.tag), P(l, "onopentag", l.tag), o || (!l.noscript && l.tagName.toLowerCase() === "script" ? l.state = p.SCRIPT : l.state = p.TEXT, l.tag = null, l.tagName = ""), l.attribName = l.attribValue = "", l.attribList.length = 0;
      }
      function K(l) {
        if (!l.tagName) {
          B(l, "Weird empty close tag."), l.textNode += "</>", l.state = p.TEXT;
          return;
        }
        if (l.script) {
          if (l.tagName !== "script") {
            l.script += "</" + l.tagName + ">", l.tagName = "", l.state = p.SCRIPT;
            return;
          }
          P(l, "onscript", l.script), l.script = "";
        }
        var o = l.tags.length, v = l.tagName;
        l.strict || (v = v[l.looseCase]());
        for (var N = v; o--; ) {
          var J = l.tags[o];
          if (J.name !== N)
            B(l, "Unexpected close tag");
          else
            break;
        }
        if (o < 0) {
          B(l, "Unmatched closing tag: " + l.tagName), l.textNode += "</" + l.tagName + ">", l.state = p.TEXT;
          return;
        }
        l.tagName = v;
        for (var re = l.tags.length; re-- > o; ) {
          var ne = l.tag = l.tags.pop();
          l.tagName = l.tag.name, P(l, "onclosetag", l.tagName);
          var de = {};
          for (var oe in ne.ns)
            de[oe] = ne.ns[oe];
          var F = l.tags[l.tags.length - 1] || l;
          l.opt.xmlns && ne.ns !== F.ns && Object.keys(ne.ns).forEach(function(Z) {
            var ue = ne.ns[Z];
            P(l, "onclosenamespace", { prefix: Z, uri: ue });
          });
        }
        o === 0 && (l.closedRoot = !0), l.tagName = l.attribValue = l.attribName = "", l.attribList.length = 0, l.state = p.TEXT;
      }
      function ee(l) {
        var o = l.entity, v = o.toLowerCase(), N, J = "";
        return l.ENTITIES[o] ? l.ENTITIES[o] : l.ENTITIES[v] ? l.ENTITIES[v] : (o = v, o.charAt(0) === "#" && (o.charAt(1) === "x" ? (o = o.slice(2), N = parseInt(o, 16), J = N.toString(16)) : (o = o.slice(1), N = parseInt(o, 10), J = N.toString(10))), o = o.replace(/^0+/, ""), isNaN(N) || J.toLowerCase() !== o || N < 0 || N > 1114111 || !pe(N) ? (B(l, "Invalid character entity"), "&" + l.entity + ";") : String.fromCodePoint(N));
      }
      function pe(l) {
        return l === 9 || l === 10 || l === 13 || l >= 32 && l <= 55295 || l >= 57344 && l <= 65533 || l >= 65536 && l <= 1114111;
      }
      function k(l, o) {
        o === "<" ? (l.state = p.OPEN_WAKA, l.startTagPosition = l.position) : R(o) || (B(l, "Non-whitespace before first tag."), l.textNode = o, l.state = p.TEXT);
      }
      function L(l, o) {
        var v = "";
        return o < l.length && (v = l.charAt(o)), v;
      }
      function Q(l) {
        var o = this;
        if (this.error)
          throw this.error;
        if (o.closed)
          return I(
            o,
            "Cannot write after close. Assign an onready handler."
          );
        if (l === null)
          return U(o);
        typeof l == "object" && (l = l.toString());
        for (var v = 0, N = ""; N = L(l, v++), o.c = N, !!N; )
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
                for (var re = v - 1; N && N !== "<" && N !== "&"; )
                  N = L(l, v++), N && o.trackPosition && (o.position++, N === `
` ? (o.line++, o.column = 0) : o.column++);
                o.textNode += l.substring(re, v - 1);
              }
              N === "<" && !(o.sawRoot && o.closedRoot && !o.strict) ? (o.state = p.OPEN_WAKA, o.startTagPosition = o.position) : (!R(N) && (!o.sawRoot || o.closedRoot) && B(o, "Text data outside of root node."), N === "&" ? o.state = p.TEXT_ENTITY : o.textNode += N);
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
              else if (!R(N)) if (V(w, N))
                o.state = p.OPEN_TAG, o.tagName = N;
              else if (N === "/")
                o.state = p.CLOSE_TAG, o.tagName = "";
              else if (N === "?")
                o.state = p.PROC_INST, o.procInstName = o.procInstBody = "";
              else {
                if (B(o, "Unencoded <"), o.startTagPosition + 1 < o.position) {
                  var J = o.position - o.startTagPosition;
                  N = new Array(J).join(" ") + N;
                }
                o.textNode += "<" + N, o.state = p.TEXT;
              }
              continue;
            case p.SGML_DECL:
              if (o.sgmlDecl + N === "--") {
                o.state = p.COMMENT, o.comment = "", o.sgmlDecl = "";
                continue;
              }
              o.doctype && o.doctype !== !0 && o.sgmlDecl ? (o.state = p.DOCTYPE_DTD, o.doctype += "<!" + o.sgmlDecl + N, o.sgmlDecl = "") : h.test(o.sgmlDecl + N) ? (P(o, "onopencdata"), o.state = p.CDATA, o.sgmlDecl = "", o.cdata = "") : b.test(o.sgmlDecl + N) ? (o.state = p.DOCTYPE, (o.doctype || o.sawRoot) && B(
                o,
                "Inappropriately located doctype declaration"
              ), o.doctype = "", o.sgmlDecl = "") : N === ">" ? (P(o, "onsgmldeclaration", o.sgmlDecl), o.sgmlDecl = "", o.state = p.TEXT) : (S(N) && (o.state = p.SGML_DECL_QUOTED), o.sgmlDecl += N);
              continue;
            case p.SGML_DECL_QUOTED:
              N === o.q && (o.state = p.SGML_DECL, o.q = ""), o.sgmlDecl += N;
              continue;
            case p.DOCTYPE:
              N === ">" ? (o.state = p.TEXT, P(o, "ondoctype", o.doctype), o.doctype = !0) : (o.doctype += N, N === "[" ? o.state = p.DOCTYPE_DTD : S(N) && (o.state = p.DOCTYPE_QUOTED, o.q = N));
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
              N === "-" ? (o.state = p.COMMENT_ENDED, o.comment = Y(o.opt, o.comment), o.comment && P(o, "oncomment", o.comment), o.comment = "") : (o.comment += "-" + N, o.state = p.COMMENT);
              continue;
            case p.COMMENT_ENDED:
              N !== ">" ? (B(o, "Malformed comment"), o.comment += "--" + N, o.state = p.COMMENT) : o.doctype && o.doctype !== !0 ? o.state = p.DOCTYPE_DTD : o.state = p.TEXT;
              continue;
            case p.CDATA:
              for (var re = v - 1; N && N !== "]"; )
                N = L(l, v++), N && o.trackPosition && (o.position++, N === `
` ? (o.line++, o.column = 0) : o.column++);
              o.cdata += l.substring(re, v - 1), N === "]" && (o.state = p.CDATA_ENDING);
              continue;
            case p.CDATA_ENDING:
              N === "]" ? o.state = p.CDATA_ENDING_2 : (o.cdata += "]" + N, o.state = p.CDATA);
              continue;
            case p.CDATA_ENDING_2:
              N === ">" ? (o.cdata && P(o, "oncdata", o.cdata), P(o, "onclosecdata"), o.cdata = "", o.state = p.TEXT) : N === "]" ? o.cdata += "]" : (o.cdata += "]]" + N, o.state = p.CDATA);
              continue;
            case p.PROC_INST:
              N === "?" ? o.state = p.PROC_INST_ENDING : R(N) ? o.state = p.PROC_INST_BODY : o.procInstName += N;
              continue;
            case p.PROC_INST_BODY:
              if (!o.procInstBody && R(N))
                continue;
              N === "?" ? o.state = p.PROC_INST_ENDING : o.procInstBody += N;
              continue;
            case p.PROC_INST_ENDING:
              if (N === ">") {
                const F = {
                  name: o.procInstName,
                  body: o.procInstBody
                };
                A(o, F), P(o, "onprocessinginstruction", F), o.procInstName = o.procInstBody = "", o.state = p.TEXT;
              } else
                o.procInstBody += "?" + N, o.state = p.PROC_INST_BODY;
              continue;
            case p.OPEN_TAG:
              V(y, N) ? o.tagName += N : (W(o), N === ">" ? H(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : (R(N) || B(o, "Invalid character in tag name"), o.state = p.ATTRIB));
              continue;
            case p.OPEN_TAG_SLASH:
              N === ">" ? (H(o, !0), K(o)) : (B(
                o,
                "Forward-slash in opening tag not followed by >"
              ), o.state = p.ATTRIB);
              continue;
            case p.ATTRIB:
              if (R(N))
                continue;
              N === ">" ? H(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : V(w, N) ? (o.attribName = N, o.attribValue = "", o.state = p.ATTRIB_NAME) : B(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME:
              N === "=" ? o.state = p.ATTRIB_VALUE : N === ">" ? (B(o, "Attribute without value"), o.attribValue = o.attribName, G(o), H(o)) : R(N) ? o.state = p.ATTRIB_NAME_SAW_WHITE : V(y, N) ? o.attribName += N : B(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME_SAW_WHITE:
              if (N === "=")
                o.state = p.ATTRIB_VALUE;
              else {
                if (R(N))
                  continue;
                B(o, "Attribute without value"), o.tag.attributes[o.attribName] = "", o.attribValue = "", P(o, "onattribute", {
                  name: o.attribName,
                  value: ""
                }), o.attribName = "", N === ">" ? H(o) : V(w, N) ? (o.attribName = N, o.state = p.ATTRIB_NAME) : (B(o, "Invalid attribute name"), o.state = p.ATTRIB);
              }
              continue;
            case p.ATTRIB_VALUE:
              if (R(N))
                continue;
              S(N) ? (o.q = N, o.state = p.ATTRIB_VALUE_QUOTED) : (o.opt.unquotedAttributeValues || I(o, "Unquoted attribute value"), o.state = p.ATTRIB_VALUE_UNQUOTED, o.attribValue = N);
              continue;
            case p.ATTRIB_VALUE_QUOTED:
              if (N !== o.q) {
                N === "&" ? o.state = p.ATTRIB_VALUE_ENTITY_Q : o.attribValue += N;
                continue;
              }
              G(o), o.q = "", o.state = p.ATTRIB_VALUE_CLOSED;
              continue;
            case p.ATTRIB_VALUE_CLOSED:
              R(N) ? o.state = p.ATTRIB : N === ">" ? H(o) : N === "/" ? o.state = p.OPEN_TAG_SLASH : V(w, N) ? (B(o, "No whitespace between attributes"), o.attribName = N, o.attribValue = "", o.state = p.ATTRIB_NAME) : B(o, "Invalid attribute name");
              continue;
            case p.ATTRIB_VALUE_UNQUOTED:
              if (!O(N)) {
                N === "&" ? o.state = p.ATTRIB_VALUE_ENTITY_U : o.attribValue += N;
                continue;
              }
              G(o), N === ">" ? H(o) : o.state = p.ATTRIB;
              continue;
            case p.CLOSE_TAG:
              if (o.tagName)
                N === ">" ? K(o) : V(y, N) ? o.tagName += N : o.script ? (o.script += "</" + o.tagName + N, o.tagName = "", o.state = p.SCRIPT) : (R(N) || B(o, "Invalid tagname in closing tag"), o.state = p.CLOSE_TAG_SAW_WHITE);
              else {
                if (R(N))
                  continue;
                g(w, N) ? o.script ? (o.script += "</" + N, o.state = p.SCRIPT) : B(o, "Invalid tagname in closing tag.") : o.tagName = N;
              }
              continue;
            case p.CLOSE_TAG_SAW_WHITE:
              if (R(N))
                continue;
              N === ">" ? K(o) : B(o, "Invalid characters in closing tag");
              continue;
            case p.TEXT_ENTITY:
            case p.ATTRIB_VALUE_ENTITY_Q:
            case p.ATTRIB_VALUE_ENTITY_U:
              var ne, de;
              switch (o.state) {
                case p.TEXT_ENTITY:
                  ne = p.TEXT, de = "textNode";
                  break;
                case p.ATTRIB_VALUE_ENTITY_Q:
                  ne = p.ATTRIB_VALUE_QUOTED, de = "attribValue";
                  break;
                case p.ATTRIB_VALUE_ENTITY_U:
                  ne = p.ATTRIB_VALUE_UNQUOTED, de = "attribValue";
                  break;
              }
              if (N === ";") {
                var oe = ee(o);
                o.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(oe) ? ((o.entityCount += 1) > o.opt.maxEntityCount && I(
                  o,
                  "Parsed entity count exceeds max entity count"
                ), (o.entityDepth += 1) > o.opt.maxEntityDepth && I(
                  o,
                  "Parsed entity depth exceeds max entity depth"
                ), o.entity = "", o.state = ne, o.write(oe), o.entityDepth -= 1) : (o[de] += oe, o.entity = "", o.state = ne);
              } else V(o.entity.length ? T : _, N) ? o.entity += N : (B(o, "Invalid character in entity name"), o[de] += "&" + o.entity + N, o.entity = "", o.state = ne);
              continue;
            default:
              throw new Error(o, "Unknown state: " + o.state);
          }
        return o.position >= o.bufferCheckPosition && i(o), o;
      }
      String.fromCodePoint || (function() {
        var l = String.fromCharCode, o = Math.floor, v = function() {
          var N = 16384, J = [], re, ne, de = -1, oe = arguments.length;
          if (!oe)
            return "";
          for (var F = ""; ++de < oe; ) {
            var Z = Number(arguments[de]);
            if (!isFinite(Z) || // `NaN`, `+Infinity`, or `-Infinity`
            Z < 0 || // not a valid Unicode code point
            Z > 1114111 || // not a valid Unicode code point
            o(Z) !== Z)
              throw RangeError("Invalid code point: " + Z);
            Z <= 65535 ? J.push(Z) : (Z -= 65536, re = (Z >> 10) + 55296, ne = Z % 1024 + 56320, J.push(re, ne)), (de + 1 === oe || J.length > N) && (F += l.apply(null, J), J.length = 0);
          }
          return F;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: v,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = v;
      })();
    })(t);
  })(Je)), Je;
}
var et, Tt;
function Uo() {
  if (Tt) return et;
  Tt = 1;
  var t = Do().parser;
  function e(n) {
    var r = [], i = [], s = r, d;
    return d = t(!0), d.ontext = function(a) {
      a.trim() !== "" && s.push(a);
    }, d.onopentag = function(a) {
      var c;
      c = [a.name, a.attributes], i.push(s), s.push(c), s = c;
    }, d.onclosetag = function() {
      s = i.pop();
    }, d.write(n).close(), r[0];
  }
  return et = e, et;
}
var tt, At;
function Bo() {
  if (At) return tt;
  At = 1;
  function t(e, n) {
    var r = function() {
    }, i = r, s = r;
    function d() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function c(m) {
      this._name = m;
    }
    function f(m) {
      this._replace = m;
    }
    function u(m, h) {
      var b, x = { attr: {}, full: m }, E = {
        name: c,
        skip: d,
        // break: breakFn,
        remove: a,
        replace: f,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, C = !0, w, y, _;
      if (m !== void 0 && m !== null && m !== !0 && m !== !1)
        switch (b = Object.prototype.toString.call(m), b) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (m.some(function(T, R) {
              if (R === 0)
                return x.name = T, !1;
              if (R === 1)
                return Object.prototype.toString.call(T) === "[object Object]" && (C = !1, x.attr = T), !0;
            }), i.call(E, x, h), E._name && (m[0] = E._name), E._replace)
              return E._replace;
            if (E._remove)
              return null;
            if (!E._skip) {
              for (w = 0, y = m.length; w < y; ) {
                if (w > 1 || w === 1 && C) {
                  if (_ = u(m[w], x), _ === null) {
                    m.splice(w, 1), y -= 1;
                    continue;
                  }
                  _ && (m[w] = _);
                }
                w += 1;
              }
              if (s.call(E, x, h), E._name && (m[0] = E._name), E._replace)
                return E._replace;
              if (E._remove)
                return null;
            }
        }
    }
    n && (n.enter && (i = n.enter), n.leave && (s = n.leave)), u(e, void 0);
  }
  return tt = t, tt;
}
var nt, kt;
function jo() {
  if (kt) return nt;
  kt = 1;
  const t = Uo(), e = Bo(), n = (i) => String(i).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[s]);
  function r(i) {
    const [s, ...d] = i, a = d[0] && typeof d[0] == "object" && !Array.isArray(d[0]) ? d.shift() : {}, c = "<" + s + Object.entries(a).map(([f, u]) => " " + f + '="' + n(u) + '"').join("");
    return d.length ? c + ">" + d.map((f) => Array.isArray(f) ? r(f) : n(f)).join("") + "</" + s + ">" : c + "/>";
  }
  return nt = { parse: t, p: t, traverse: e, t: e, stringify: r, s: r }, nt;
}
jo();
const ot = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), Vo = (t, e) => [...t].reduce((n, r) => n + (r.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function Qo(t, e, n = 12) {
  const r = [], i = t.map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h }));
  for (const [d, a] of t.entries()) {
    if (!a.labels.length) continue;
    const c = Math.max(...a.labels.map((x) => Vo(x.text, n))) + 4, f = a.labels.length * (n + 4), u = [];
    for (const x of [5, 14, 28, 48]) {
      const E = { x: a.x + (a.w - c) / 2, y: a.y - x - f, w: c, h: f }, C = { x: a.x + (a.w - c) / 2, y: a.y + a.h + x, w: c, h: f }, w = { x: a.x + a.w + x, y: a.y + (a.h - f) / 2, w: c, h: f }, y = { x: a.x - x - c, y: a.y + (a.h - f) / 2, w: c, h: f };
      u.push(...a.w > a.h ? [E, C, w, y] : [w, y, E, C]);
    }
    const m = (x) => e.reduce((E, C) => {
      const w = Math.min(C.a.x, C.b.x), y = Math.min(C.a.y, C.b.y), _ = { x: w - 1, y: y - 1, w: Math.abs(C.a.x - C.b.x) + 2, h: Math.abs(C.a.y - C.b.y) + 2 };
      return E + ot(x, _) * 2;
    }, 0);
    let h = null, b = 1 / 0;
    for (const [x, E] of u.entries()) {
      const C = i.reduce((w, y, _) => w + (_ === d ? 0 : ot(E, y)) * 500, 0) + r.reduce((w, y) => w + ot(E, y) * 100, 0) + m(E) + x * 3;
      C < b && (b = C, h = E);
    }
    a.labels.forEach((x, E) => {
      x.x = h.x - a.x, x.y = h.y - a.y + n + E * (n + 4);
    }), r.push(h);
  }
  const s = [...i, ...r];
  return { x: Math.min(0, ...s.map((d) => d.x)), y: Math.min(0, ...s.map((d) => d.y)), right: Math.max(0, ...s.map((d) => d.x + d.w)), bottom: Math.max(0, ...s.map((d) => d.y + d.h)) };
}
const Fo = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function Go(t, e = 12) {
  const n = [...t.children].filter((s) => s.localName === "g" && s.id.startsWith("cell_")).map((s) => ({ ...Fo(s.getAttribute("transform")), w: +s.getAttribute("s:width"), h: +s.getAttribute("s:height"), labels: [...s.children].filter((d) => d.localName === "text" && d.hasAttribute("data-layout-label")).map((d) => ({ node: d, text: d.textContent })) })), r = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } })), i = Qo(n, r, e);
  for (const s of n) for (const d of s.labels)
    d.node.setAttribute("x", d.x), d.node.setAttribute("y", d.y), d.node.setAttribute("text-anchor", "start"), d.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(i), i;
}
const Ot = Le.filter.source, j = (t) => document.getElementById("spice-" + t), ge = j("app");
if (ge) {
  let $ = function() {
    const k = e.querySelector("svg");
    if (!k) return;
    const L = Number(k.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, Q = Go(k, L), l = Math.min(_.x, Q.x - 20), o = Math.min(_.y, Q.y - 20);
    _ = { x: l, y: o, w: Math.max(_.x + _.w, Q.right + 20) - l, h: Math.max(_.y + _.h, Q.bottom + 20) - o }, c && Wn(k, f, c), a?.refreshColors(), Ge(k, D(), j("show-grid").checked, y);
    const v = k.cloneNode(!0);
    a?.cleanExport(v), v.setAttribute("width", _.w), v.setAttribute("height", _.h), v.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), Ge(v, D(), j("show-grid").checked, _), u = new XMLSerializer().serializeToString(v), j("source").value = u;
  }, se = function(k) {
    const L = j("example-info");
    if (L && (L.replaceChildren(), !!k && (L.append(document.createTextNode(k.description + " ")), k.url))) {
      const Q = document.createElement("a");
      Q.href = k.url, Q.target = "_blank", Q.rel = "noopener noreferrer", Q.textContent = k.reference, L.append(Q);
    }
  }, A = function() {
    a.invalidate(), q.setEnabled(!1), i = null, s = null, u = "", g(), se(Object.values(Le).find((k) => k.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, P = function(k) {
    r.replaceChildren();
    for (const { severity: L, line: Q, message: l, source: o } of k) {
      const v = document.createElement("li");
      v.className = L, v.textContent = `${L.toUpperCase()}${o && o !== "input.cir" ? " · " + o : ""}${Q ? " · line " + Q : ""}: ${l}`, r.append(v);
    }
    j("messages").open = k.some((L) => L.severity !== "info"), j("message-count").textContent = `${k.length} message${k.length === 1 ? "" : "s"}`;
  }, z = function() {
    !w && u && O.set(E, { ...y }), e.querySelector("svg")?.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`);
    const k = e.querySelector("svg");
    k && Ge(k, D(), j("show-grid").checked, y), j("zoom-level").textContent = Math.round(_.w / y.w * 100) + "%";
  }, I = function(k, L = y.x + y.w / 2, Q = y.y + y.h / 2) {
    if (!e.querySelector("svg")) return;
    const l = Math.max(0.05, Math.min(10, y.w * k / _.w)) * _.w / y.w;
    y = { x: L + (y.x - L) * l, y: Q + (y.y - Q) * l, w: y.w * l, h: y.h * l }, z();
  }, B = function(k) {
    const L = new URLSearchParams();
    k && L.set("instance", k);
    const Q = L.toString();
    location.hash.slice(1) === Q ? (E = k, H()) : location.hash = Q;
  }, W = function() {
    E = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, te = function() {
    const k = !!(C && C !== E && h?.contexts[C]);
    j("selection-actions").hidden = !k, j("open-instance").href = "#" + new URLSearchParams({ instance: C });
  }, G = function() {
    j("breadcrumbs").replaceChildren();
    const k = (Q, l) => {
      const o = document.createElement("button");
      o.type = "button", o.textContent = Q, o.onclick = () => B(l), o.disabled = l === E, j("breadcrumbs").append(o);
    };
    if (k("Top", ""), E) {
      const Q = h.contexts[E].path;
      for (let l = 0; l < Q.length; l++) k(Q[l], Q.slice(0, l + 1).map(encodeURIComponent).join("/"));
    }
    j("instances").replaceChildren();
    const L = (Q, l) => {
      for (const o of Q.children) {
        const v = document.createElement("div");
        v.className = "spice-instance-row", v.style.setProperty("--depth", Math.min(l, 8)), v.dataset.instance = o.id;
        const N = document.createElement("a");
        N.href = "#" + new URLSearchParams({ instance: o.id }), N.textContent = o.name + " · " + o.definition, N.title = "Open " + o.id + " as its own sheet";
        const J = document.createElement("span");
        if (J.className = "spice-help", J.textContent = Object.entries(o.params).map(([re, ne]) => re + "=" + ne).join(" · "), v.append(N), J.textContent) {
          const re = document.createElement("details"), ne = document.createElement("summary");
          ne.textContent = "Parameters", re.append(ne, J), v.append(re);
        }
        j("instances").append(v), L(o, l + 1);
      }
    };
    L(h.contexts[E], 0), j("hierarchy-panel").hidden = !h.contexts[E].children.length, j("focus-title").textContent = E ? E + " / " + h.contexts[E].definition : "Top-level schematic", te();
  };
  Oo(ge), zn(ge);
  const t = j("input"), e = j("preview"), n = j("status"), r = j("diagnostics");
  let i = null, s = null, d = !1, a = null, c = null, f = [], u = "", m, h, b, x = "", E = "", C = "", w = !1, y = { x: 0, y: 0, w: 1, h: 1 }, _ = { ...y }, T, R = !1, S = {}, O = /* @__PURE__ */ new Map(), V = !1;
  try {
    S = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ge.addEventListener("click", (k) => {
    w && k.target.closest('a[href^="#"]') && k.preventDefault();
  });
  const g = () => {
    j("upload").disabled = w || V || d, j("download-project").disabled = j("open-download").disabled = j("copy").disabled = j("download").disabled = !u || w || V || a?.working(), j("download-asc").disabled = j("download-asc-bundle").disabled = !u || !i || w || d || !a?.complete();
  }, p = () => ({ font: j("font").value, fontSize: Number(j("size").value), color: ut, gridSize: j("grid").checked && j("conventional").checked ? ct : 0, detailed: j("detailed").checked, conventional: j("conventional").checked }), D = () => m?.layout.report?.gridSize ? Number(j("grid-size").value) : 0, q = qn(j, (k, L) => {
    c = k, f = L, $();
  });
  a = to(e, j, { getNetColor: (k) => {
    const L = f.find((Q) => Q.bit === k);
    return L && c && (c.auto || c.manual.has(L.name)) ? c.color(L.name) : null;
  }, inspect: (k) => {
    const L = m?.components.find((Q) => Q.name === k);
    L && (C = L.instanceId || "", j("selection").textContent = L.raw, te());
  }, changed: (k, L, Q) => {
    i = k, s = null, _ = Q;
    const l = e.querySelector("svg");
    if (l) {
      l.setAttribute("width", String(_.w)), l.setAttribute("height", String(_.h));
      const o = l.querySelector("#spice-layout-report");
      if (o) {
        const v = JSON.parse(o.textContent);
        v.manualWiring = L, v.verifiedTerminals = !L.unrouted, v.geometricConnectivityVerified = !L.unrouted, o.textContent = JSON.stringify(v);
      }
    }
    m && b && (j("json").value = JSON.stringify({ circuit: m, netlist: Qe(m), hierarchy: b, interactive: { ...L, drawing: k } }, null, 2)), $(), g();
  } }), j("show-grid").onchange = $, j("grid-size").onchange = () => {
    $(), z();
  };
  async function X() {
    (!i || !m?.layout.report?.gridVerified) && (j("grid").checked = !0, j("conventional").checked = !0, await H({ resetEditor: !0 })), a.setEnabled(j("interactive").checked), g();
  }
  j("interactive").onchange = X, j("flywire").onchange = async () => {
    j("interactive").checked = !0, await X(), j("flywire").checked ? a.clear() : await a.autoRoute(), g();
  }, j("auto-route").onclick = async () => {
    j("interactive").checked = !0, await X(), await a.autoRoute(), g();
  }, j("wire-undo").onclick = () => a.undo(), j("wire-redo").onclick = () => a.redo();
  for (const k of ge.querySelectorAll("[data-editor-mode]")) k.onclick = async () => {
    j("interactive").checked = !0, await X(), a.chooseTool(k.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const k of ge.querySelectorAll("[data-editor-arrange]")) k.onclick = () => {
    a.arrange(k.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  q.setEnabled(!1), t.value = Ot;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Ot;
  } catch {
  }
  se(Object.values(Le).find((k) => k.source === t.value)), t.addEventListener("input", A);
  for (const k of ["font", "size", "detailed", "conventional", "grid"]) j(k).addEventListener("input", A);
  new ResizeObserver(() => {
    const k = e.querySelector("svg");
    k && Ge(k, D(), j("show-grid").checked, y);
  }).observe(e), j("zoom-in").onclick = () => I(0.8), j("zoom-out").onclick = () => I(1.25), j("fit").onclick = () => {
    y = { ..._ }, z();
  };
  const U = (k) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(k.clientX, k.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (k) => {
    const L = U(k);
    L && (k.preventDefault(), I(k.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (k) => {
    ![0, 1].includes(k.button) || !e.querySelector("svg") || (T = { start: U(k), x: k.clientX, y: k.clientY, view: { ...y }, moved: !1 }, e.setPointerCapture(k.pointerId));
  }), e.addEventListener("pointermove", (k) => {
    if (!T) return;
    const L = U(k);
    Math.hypot(k.clientX - T.x, k.clientY - T.y) > 4 && (T.moved = !0), y.x += T.start.x - L.x, y.y += T.start.y - L.y, z();
  }), e.addEventListener("pointerup", (k) => {
    if (!T) return;
    const L = T.moved;
    if (T = null, e.hasPointerCapture(k.pointerId) && e.releasePointerCapture(k.pointerId), !L) {
      const Q = document.elementFromPoint(k.clientX, k.clientY)?.closest("[data-component]"), l = m?.components.find((o) => o.name === Q?.dataset.component);
      l && (C = l.instanceId || "", j("selection").textContent = `${l.raw}
${Object.entries(l.terminals).map(([o, v]) => `${o} → ${v}`).join("   ")}`, l.kind === "X" ? B(l.instanceId) : te());
    }
  }), window.addEventListener("hashchange", () => {
    if (w) {
      R = !0;
      return;
    }
    W(), C = "", H();
  }), e.addEventListener("pointercancel", () => {
    T = null;
  }), e.addEventListener("keydown", (k) => {
    const L = k.target.closest("[data-instance]");
    if (L && (k.key === "Enter" || k.key === " ")) {
      k.preventDefault(), C = L.dataset.instance, B(C);
      return;
    }
    k.key === "+" || k.key === "=" ? I(0.8) : k.key === "-" ? I(1.25) : k.key.toLowerCase() === "f" ? (y = { ..._ }, z()) : k.key.startsWith("Arrow") && (k.preventDefault(), y.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[k.key] || 0) * y.w, y.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[k.key] || 0) * y.h, z());
  });
  async function H({ resetEditor: k = !1 } = {}) {
    if (w) return;
    w = !0, a.invalidate(), q.setEnabled(!1), i = null, s = null, u = "", g(), j("generate").disabled = !0, t.readOnly = !0, j("file").disabled = !0, j("libraries").disabled = !0;
    for (const Q of ge.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) Q.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let L = [];
    try {
      if (x !== t.value || !h) {
        if (x && x !== t.value && (a.clearSheets(), O.clear()), b = yt(t.value, { files: S }), L = [...b.diagnostics], L.some((F) => F.severity === "error"))
          throw h = null, Error("Fix the parser errors below before generating.");
        h = qe(b), x && x !== t.value ? (E = "", C = "", history.replaceState(null, "", location.pathname + location.search)) : W(), x = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (L = [...b.diagnostics], P(L), L.some((F) => F.severity === "error")) throw Error("Fix the parser errors below before generating.");
      m = Ve(h, { focus: E });
      for (const F of m.interfaceAliases) L.push({ severity: "info", message: `Instance boundary: ${F.ports.join(" = ")} share parent node ${F.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const Q = Qe(m);
      p().conventional && L.push(...m.layout.diagnostics);
      const l = await Ye(Q, p()), o = new DOMParser().parseFromString(l.svg, "image/svg+xml");
      if (o.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const v = o.documentElement, N = v.querySelector("#spice-layout-report");
      if (N) {
        m.layout.report = JSON.parse(N.textContent);
        const F = m.layout.report;
        if (L.push({ severity: "info", message: `Layout: compact signal flow; ${F.powerSourcesChecked} DC/ground symbols checked, ${F.powerOrderViolations} DC order preference(s) unmet. ${F.powerPass}. ${F.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), F.classicTemplateFallback && L.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), F.groundPlacement && L.push({ severity: "info", message: `Ground: ${F.groundPlacement}; ${F.straightenedGroundDrops || 0} return-path simplification(s).` }), F.explicitGroups && L.push({ severity: "info", message: `Layout comments: ${F.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), F.classicRails && L.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${F.railCount} shared voltage rails.` }), F.localClassicInstances?.length && L.push({ severity: "info", message: `${F.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), F.localClassicStages?.length && L.push({ severity: "info", message: `Classic transistor proximity active: ${F.localClassicStages.join(", ")}.` }), F.sharedClassicRails && L.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), F.mirroredTransistors?.length && L.push({ severity: "info", message: `Control-pin mirror choices: ${F.mirroredTransistors.join(", ")}.` }), F.recognizedMotifs?.length && L.push({ severity: "info", message: `Transistor structures: ${F.recognizedMotifs.map((Z) => `${Z.kind} (${Z.members.join(", ")}; ${Z.confidence})`).join("; ")}.` }), F.appliedMotifs?.length && L.push({ severity: "info", message: `Topology preferences applied to ${F.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), F.subnetFirstFallback && L.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + F.subnetFirstFallback }), F.pairCompactionFallback && L.push({ severity: "warning", message: "Pair proximity kept the original regions: " + F.pairCompactionFallback }), F.compoundPairFallback && L.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + F.compoundPairFallback }), F.pairConstraints?.length) {
          const Z = F.pairConstraints.filter((ue) => ue.crossRegion && !ue.compacted).length;
          L.push({ severity: "info", message: `${F.pairConstraints.length - Z} adjacent transistor pair(s); ${Z} cross-region mirror row constraint(s).` });
        }
        F.netShortcuts && L.push({ severity: "info", message: `${F.netShortcuts} safe straight net shortcut(s); ${F.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), F.sharedRailFallback && L.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${F.sharedRailFallback}.` });
        for (const Z of F.localClassicFallbacks || []) Z.stage && L.push({ severity: "info", message: `Classic stage ${Z.stage} uses automatic layout: ${Z.reason || "No unobstructed local template"}.` });
        F.geometricConnectivityVerified && L.push({ severity: "info", message: `Net geometry verified; ${F.cyclesRemoved} same-net loop(s) and ${F.leavesRemoved} unused wire branch(es) removed.` }), P(L);
      }
      if (v.localName !== "svg" || v.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const J = Number(v.getAttribute("width")), re = Number(v.getAttribute("height")), ne = JSON.parse(v.getAttribute("data-label-bounds") || "null");
      _ = { x: Math.min(-20, (ne?.x ?? 0) - 20), y: Math.min(-20, (ne?.y ?? 0) - 20) }, _.w = Math.max(J, ne?.right || 0) + 20 - _.x, _.h = Math.max(re, ne?.bottom || 0) + 20 - _.y, y = { ..._ }, v.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), v.setAttribute("width", String(_.w)), v.setAttribute("height", String(_.h)), v.setAttribute("role", "img"), v.setAttribute("aria-label", m.title || "SPICE schematic"), v.setAttribute("style", "background:white");
      for (const F of m.components) {
        const Z = o.getElementById("cell_" + F.name);
        if (!Z) throw Error("Renderer omitted component " + F.name);
        Z.setAttribute("data-component", F.name), F.kind === "X" && (Z.setAttribute("data-instance", F.instanceId), Z.setAttribute("role", "button"), Z.setAttribute("tabindex", "0"), Z.setAttribute("aria-label", "Open " + F.name));
        const ue = o.createElementNS(v.namespaceURI, "title");
        ue.textContent = F.raw + `
Resolved: ` + F.value + `
` + Object.entries(F.terminals).map(([_e, Ee]) => _e + ": " + Ee).join(", "), Z.prepend(ue);
      }
      for (const F of Object.values(m.nodes))
        for (const Z of v.querySelectorAll(".net_" + F.bit)) {
          Z.setAttribute("data-net", F.name);
          const ue = o.createElementNS(v.namespaceURI, "title");
          ue.textContent = "Node " + F.displayName, Z.append(ue);
        }
      const de = m.components.filter((F) => F.kind === "K").map((F) => ({ name: F.name, inductors: F.coupledInductors, value: F.value }));
      if (de.length) {
        const F = o.createElementNS(v.namespaceURI, "metadata");
        F.setAttribute("id", "spice-magnetic-couplings"), F.textContent = JSON.stringify(de), v.append(F);
        for (const Z of de) for (const ue of Z.inductors) {
          const _e = o.getElementById("cell_" + ue);
          if (!_e) continue;
          const Ee = o.createElementNS(v.namespaceURI, "circle"), Ne = [..._e.children].find(($e) => $e.getAttribute("s:pid") === "A"), Be = Ne?.getAttribute("s:position"), ft = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [$e, Ht] of Object.entries({ cx: Number(Ne?.getAttribute("s:x")) + ft[0], cy: Number(Ne?.getAttribute("s:y")) + ft[1], r: 3, fill: p().color, stroke: "none", "data-coupling": Z.name })) Ee.setAttribute($e, String(Ht));
          const ht = o.createElementNS(v.namespaceURI, "title");
          ht.textContent = Z.name + " · dotted terminal: " + Z.inductors.join(", "), Ee.append(ht), _e.append(Ee);
        }
      }
      i = l.drawing, u = new XMLSerializer().serializeToString(v), j("source").value = u, e.replaceChildren(document.importNode(v, !0)), z();
      const oe = L.filter((F) => F.severity === "warning").length;
      n.textContent = `${m.components.filter((F) => !F.synthetic).length} components · ${Object.keys(m.nodes).length} nodes · ${m.topology.leafCount} primitive devices verified${m.interfaceAliases.length ? " · Parent-connected ports: " + m.interfaceAliases.map((F) => F.ports.join(" = ")).join("; ") + "." : ""}${oe ? " · Review " + oe + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Ue}.`, m.layout.report?.gridVerified && (n.textContent += ` Grid ${m.layout.report.gridSize}.`), m.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${m.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), m.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), j("json").value = JSON.stringify({ circuit: m, netlist: Q, hierarchy: b }, null, 2), q.setCircuit(m, t.value), a.mount(e.querySelector("svg"), i, m, Q, p(), { reset: k, scope: E }), $(), !k && O.has(E) ? y = { ...O.get(E) } : O.set(E, { ...y }), z(), j("selection").textContent = "Click a component to inspect its original statement and pin connections.", G();
    } catch (Q) {
      if (e.replaceChildren(), u = "", j("source").value = "", j("json").value = "", j("nets").replaceChildren(), j("selection").textContent = "", n.textContent = Q.message, !h)
        j("hierarchy-panel").hidden = !0, j("selection-actions").hidden = !0, j("breadcrumbs").replaceChildren();
      else if (!h.contexts[E]) {
        const l = document.createElement("button");
        l.type = "button", l.textContent = "Return to Top", l.onclick = () => B(""), j("breadcrumbs").replaceChildren(l);
      }
      q.setCircuit(null, t.value), Q.diagnostics && (L = Q.diagnostics), L.some((l) => l.severity === "error") || L.push({ severity: "error", line: 0, message: Q.message }), P(L);
    } finally {
      w = !1, j("generate").disabled = !1, t.readOnly = !1, j("file").disabled = !1, j("libraries").disabled = !1;
      for (const Q of ge.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) Q.disabled = !1;
      h && h.contexts[E] && G(), q.setEnabled(!!u), e.setAttribute("aria-busy", "false"), g(), R && (R = !1, W(), queueMicrotask(H));
    }
  }
  j("generate").onclick = () => H({ resetEditor: !0 });
  for (const k of ge.querySelectorAll("[data-example]")) k.onclick = () => {
    const L = Le[k.dataset.example];
    t.value = L.source, A(), se(L), H();
  };
  j("file").onchange = async (k) => {
    const L = k.target.files[0];
    if (L) {
      if (w || V) {
        k.target.value = "";
        return;
      }
      try {
        const Q = /\.(spiceproj|json)$/i.test(L.name);
        if (L.size > (Q ? jt : 2e6)) throw Error(Q ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        Q ? await K(await L.text()) : (t.value = await vt(L), A(), await H());
      } catch (Q) {
        n.textContent = "File could not be opened: " + Q.message;
      } finally {
        k.target.value = "", g();
      }
    }
  };
  async function K(k) {
    V = !0, g();
    const L = ge.inert;
    ge.inert = !0;
    try {
      const Q = Vt(k), l = yt(Q.source, { files: Q.libraries });
      if (l.diagnostics.some((v) => v.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const o = qe(l);
      if (!o.contexts[Q.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const v of Q.sheets) {
        if (!o.contexts[v.scope]) throw Error("Unknown saved sheet: " + v.scope);
        const N = Ve(o, { focus: v.scope });
        if (N.topology.signature !== v.topology) throw Error("Saved topology differs from the netlist: " + (v.scope || "Top"));
        const J = new Map(N.components.filter((oe) => oe.kind !== "K").map((oe) => [oe.name, oe]));
        for (const oe of v.snapshot.components) {
          if (oe.decoration) continue;
          const F = J.get(oe.id);
          if (!F || oe.ports.length !== Object.keys(F.terminals).length || oe.ports.some((Z) => N.nodes[F.terminals[Z.pin]]?.bit !== Z.bit)) throw Error("Saved pin connectivity differs from the netlist: " + oe.id);
          J.delete(oe.id);
        }
        if (J.size) throw Error("Saved sheet omits components.");
        n.textContent = "Checking saved sheet " + (v.scope || "Top") + "…";
        const re = Qe(N), ne = await Ye(re, v.settings), de = new DOMParser().parseFromString(ne.svg, "image/svg+xml").documentElement;
        for (const oe of Object.values(N.nodes)) for (const F of de.querySelectorAll(".net_" + oe.bit)) F.setAttribute("data-net", oe.name);
        Ft(Gt(de, ne.drawing, N, re), v.snapshot, v.settings.gridSize);
      }
      Q.sheets.some((v) => v.scope === Q.focus && JSON.stringify(v.settings) === JSON.stringify(Q.settings)) || (n.textContent = "Checking current sheet…", await Ye(Qe(Ve(o, { focus: Q.focus })), Q.settings)), a.invalidate(), a.restoreSheets(Q.sheets), O = new Map(Q.sheets.filter((v) => v.view).map((v) => [v.scope, v.view])), O.set(Q.focus, Q.view), t.value = Q.source, S = Q.libraries, h = o, b = l, x = Q.source, E = Q.focus, C = "";
      for (const v of ["font", "size"]) j(v).value = v === "font" ? Q.settings.font : Q.settings.fontSize;
      for (const [v, N] of Object.entries({ detailed: Q.settings.detailed, conventional: Q.settings.conventional, grid: !!Q.settings.gridSize, "show-grid": Q.showGrid, interactive: Q.interactive, flywire: Q.flywire })) j(v).checked = N;
      j("grid-size").value = Q.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (E ? "#" + new URLSearchParams({ instance: E }) : "")), q.restore(Q.colors), se(Object.values(Le).find((v) => v.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(S)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      j("library-status").textContent = Object.keys(S).length + " project library file(s) loaded", await H(), u && (n.textContent += " Project restored.");
    } finally {
      ge.inert = L, V = !1, g();
    }
  }
  j("libraries").onchange = async (k) => {
    try {
      for (const L of k.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        S[L.webkitRelativePath || L.name] = await vt(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(S));
      } catch {
      }
      a.invalidate(), a.clearSheets(), O.clear(), h = null, x = "", j("library-status").textContent = Object.keys(S).length + " library file(s) loaded", H();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      k.target.value = "";
    }
  }, j("library-status").textContent = Object.keys(S).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const ee = j("download-dialog");
  ge.addEventListener("spice:workspacechange", () => {
    ee.open && ee.close();
  }), j("open-download").onclick = () => {
    g(), ee.showModal();
  }, j("close-download").onclick = () => ee.close(), ee.addEventListener("click", (k) => {
    if (k.target !== ee) return;
    const L = ee.getBoundingClientRect();
    (k.clientX < L.left || k.clientX > L.right || k.clientY < L.top || k.clientY > L.bottom) && ee.close();
  }), document.addEventListener("keydown", (k) => {
    ee.open && !(k.altKey && k.key === "Escape") && (k.stopImmediatePropagation(), k.key === "Escape" && (k.preventDefault(), ee.close()));
  }, { capture: !0 }), j("upload").onclick = () => j("file").click(), j("download-project").onclick = () => {
    try {
      const k = a.snapshotSheets().filter((o) => h?.contexts[o.scope] && Ve(h, { focus: o.scope }).topology.signature === o.topology).map((o) => ({ ...o, ...O.has(o.scope) ? { view: O.get(o.scope) } : {} })), L = Yn({ source: t.value, libraries: S, settings: p(), displayGridStep: Number(j("grid-size").value), showGrid: j("show-grid").checked, interactive: j("interactive").checked, flywire: j("flywire").checked, focus: E, view: { ...y }, colors: q.snapshot(), sheets: k });
      ee.close();
      const Q = URL.createObjectURL(new Blob([L], { type: "application/json;charset=utf-8" })), l = document.createElement("a");
      l.href = Q, l.download = "spice-schematic.spiceproj", l.click(), setTimeout(() => URL.revokeObjectURL(Q), 1e3), n.textContent = "Project saved. Upload the .spiceproj file to resume editing.";
    } catch (k) {
      n.textContent = "Project save failed: " + k.message;
    }
  }, j("download").onclick = () => {
    ee.close();
    const k = URL.createObjectURL(new Blob([u], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = k, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(k), 1e3);
  };
  async function pe(k) {
    const L = i;
    if (!(!L || w || d)) {
      d = !0, g(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: Q } = await import("./asc-export-CF1i3R1m.js");
        if (i !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        s ||= Q({ tree: h, circuit: m, drawing: L, source: t.value, libraries: S });
        const l = k ? s.zip : s.ascBytes, o = URL.createObjectURL(new Blob([l], { type: k ? "application/zip" : "application/octet-stream" })), v = document.createElement("a");
        v.href = o, v.download = k ? "spice-schematic-asc.zip" : "spice-schematic.asc", v.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), n.textContent = "ASC connections verified · " + s.manifest.audit.symbols + " symbols. " + (k ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), s.manifest.warnings.length && (n.textContent += " " + s.manifest.warnings.join(" "));
      } catch (Q) {
        n.textContent = "ASC export failed: " + Q.message;
        const l = document.createElement("li");
        l.className = "error", l.textContent = n.textContent, r.append(l);
      } finally {
        d = !1, g();
      }
    }
  }
  j("download-asc").onclick = () => {
    ee.close(), pe(!1);
  }, j("download-asc-bundle").onclick = () => {
    ee.close(), pe(!0);
  }, j("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(u), n.textContent = "SVG source copied to clipboard.";
    } catch {
      j("source-details").open = !0, j("source").focus(), j("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, H();
}
export {
  it as b,
  qe as e,
  Oe as l,
  rt as n,
  yn as p
};
