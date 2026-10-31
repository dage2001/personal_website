const Xt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, $t = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Yt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Kt = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Zt = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Jt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, en = { 1: "a", 2: "b", 7: "Q", 8: "com" }, tn = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, nn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, on = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, rn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, sn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, an = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, cn = {
  AND: Xt,
  BUF: $t,
  COUNTER: Yt,
  DFLOP: Kt,
  SCHMITT: Zt,
  OR: Jt,
  PHASEDET: en,
  SRFLOP: tn,
  XOR: nn,
  MODULATOR: on,
  OTA: rn,
  SAMPLEHOLD: sn,
  VARISTOR: an
}, ln = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Ae = (t) => t.toLowerCase(), gt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), dn = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function un(t, e) {
  const o = (_) => e[Ae(_ || "")] || Object.entries(e).find(([w]) => w.startsWith(Ae(_ || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let a = [], d = [], c = "", s = "", l = [], u = [], f = 0, b = "", p = "", m = "", y = !0;
  if ("RLC".includes(i))
    a = ["A", "B"], s = Ae(i) + "_v";
  else if ("DVIB".includes(i))
    a = ["+", "-"], s = i === "D" ? "d_v" : i === "B" ? "spice_b" : Ae(i);
  else if (i === "Q") {
    a = ["C", "B", "E"], !o(t[4]) && (o(t[5]) || !gt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && a.push("S"), c = t[a.length + 1] || "";
    const _ = o(c)?.type;
    y = ["NPN", "PNP"].includes(_), s = y ? (a.length === 3 ? "q_" : "spice_q4_") + Ae(_) : "spice_q" + a.length;
  } else if (i === "M") {
    const _ = o(t[4]), w = o(t[5]), x = _?.type === "VDMOS" || !w && (!t[5] || gt(t[5]));
    a = x ? ["D", "G", "S"] : ["D", "G", "S", "B"], c = t[a.length + 1] || "";
    const S = o(c), C = S?.type;
    if (x && S && C !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!x && C === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    y = ["NMOS", "PMOS", "VDMOS"].includes(C);
    let T = null, I = S;
    const L = /* @__PURE__ */ new Set();
    for (; I && !L.has(I.name) && (L.add(I.name), T = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(I.raw), !T); )
      I = o(I.baseModel);
    const P = C === "PMOS" || C === "VDMOS" && T && (T[1] === void 0 || Number(T[1]) >= 0.5);
    s = y ? "spice_" + (P ? "pmos" : "nmos") + (x ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    c = t[4] || "";
    const _ = o(c)?.type, w = i === "Z" && ["NIGBT", "PIGBT"].includes(_);
    a = w ? ["C", "G", "E"] : ["D", "G", "S"], y = i === "J" ? ["NJF", "PJF"].includes(_) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(_), s = "spice_" + (w ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(_ || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    a = ["+", "-"], s = "spice_" + Ae(i);
    let _ = 3, w = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[_] || "");
    if (/^poly$/i.test(t[_] || "") && (w = /^\(\s*(\d+)\s*\)$/.exec(t[++_] || ""), !w))
      throw Error("POLY requires a dimension.");
    if (w) {
      const x = Number(w[1]);
      if (x > 128) throw Error("POLY supports at most 128 controlling variables.");
      let S = _ + 1, C = [];
      const T = "EG".includes(i), I = x * (T ? 2 : 1);
      for (; C.length < I && S < t.length; ) C.push(...dn(t[S++]));
      if (C.length !== I || S >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (T) {
        for (let L = 0; L < x; L++) a.push("C" + (L + 1) + "+", "C" + (L + 1) + "-");
        d = [t[1], t[2], ...C];
      } else l = C;
      f = S, b = "POLY(" + x + ") " + (T ? "" : C.join(" ") + " "), p = "POLY", T && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(i) ? (a.push("C+", "C-"), p = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (l = [t[3]], f = 4, b = t[3] + " ");
    m = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (p ? " · " + p : "");
  } else if (i === "S")
    a = ["A", "B", "C+", "C-"], c = t[5] || "", s = "spice_device", m = "Voltage switch";
  else if (i === "W")
    a = ["A", "B"], l = [t[3]], c = t[4] || "", f = 3, s = "spice_device", m = "Current switch";
  else if ("TO".includes(i))
    a = ["L+", "L-", "R+", "R-"], i === "O" && (c = t[5] || ""), s = "spice_device", m = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    a = ["N1", "N2", "COM"], c = t[4] || "", s = "spice_device", m = "Distributed RC";
  else if (i === "A")
    a = Array.from({ length: 8 }, (_, w) => "P" + (w + 1)), s = "spice_device", m = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (u = t.slice(1, -1), u.some((_) => !/^L/i.test(_.split(":").at(-1)))) throw Error("K references must name inductors.");
    f = t.length - 1, s = "spice_coupling", m = "Magnetic coupling", b = u.join(" ") + " · k=";
  } else if (i === "@")
    a = ["IN", "OUT"], s = "spice_device", m = "FRA";
  else if (i === "&")
    a = ["O+", "O-", "I+", "I-"], s = "spice_device", m = "FRA probe";
  else if (i === "Ö")
    a = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", m = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (f || (f = a.length + 1), d.length || (d = t.slice(1, a.length + 1)), d.length !== a.length) throw Error("Incomplete terminal list: expected " + a.length + " nodes.");
  if (t.length <= f && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + a.length + " terminals.");
  if (d.some((_) => /[=()]/.test(_) && !/^\{[\s\S]*\}$/.test(_))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(f).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(f).join(" ")) && (s = "spice_br"), i === "D" && (c = t[3] || ""), i === "@") {
    const _ = t.slice(f).join(" ");
    for (const w of _.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      a.push(w[1].toUpperCase()), d.push(w[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (l.some((_) => !_)) throw Error("Missing controlling voltage source.");
  const E = a.map((_, w) => i === "A" && cn[(t[9] || "").toUpperCase()]?.[String(w + 1)] || _);
  return { kind: i, pins: a, nodeTokens: d, pinLabels: E, model: c, type: s, controlSource: l[0] || "", controlSources: l, coupledInductors: u, value: b + t.slice(f).join(" "), sourceMode: p, symbol: m, polarityKnown: y };
}
const fn = ln, pn = new Set(fn.split(" ")), Ye = () => /* @__PURE__ */ Object.create(null), xe = (t) => t.toLowerCase();
function He(t) {
  const e = [], o = [];
  let i = "", a = 0, d = "";
  for (let c = 0; c < t.length; c++) {
    const s = t[c];
    if (d) {
      i += s, s === d && t[c - 1] !== "\\" && (d = "");
      continue;
    }
    if (s === '"' || s === "'") {
      d = s, i += s;
      continue;
    }
    if (!a && (s === ";" || s === "$" && (!c || /\s/.test(t[c - 1])))) break;
    if ("({".includes(s) && (o.push(s), a++), ")}".includes(s) && (a--, o.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !a ? (i && e.push(i), i = "") : i += s;
  }
  if (a || d) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function hn(t, e = {}) {
  const o = [], i = [], a = [], d = Object.assign(Ye(), e.models), c = Ye(), s = (w, x, S) => o.push({ severity: w, line: x, message: S });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const l = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, x) => {
    const S = w.trim();
    !S || S.startsWith("*") || (S.startsWith("+") ? l.length ? l.at(-1).text += " " + S.slice(1).trim() : s("error", x + 1, "Continuation has no preceding statement.") : l.push({ line: x + 1, text: S }));
  });
  for (const w of l) {
    try {
      w.tokens = He(w.text);
    } catch (S) {
      s("error", w.line, S.message), w.tokens = [];
    }
    const x = w.tokens;
    if (/^\.model$/i.test(x[0] || ""))
      if (x.length < 3) s("error", w.line, ".model requires a name and device type.");
      else {
        const S = /^ako:(.+)$/i.exec(x[2]), C = S && x[3] && !x[3].startsWith("(") ? x[3].split("(")[0].toUpperCase() : "";
        d[xe(x[1])] = { name: x[1], type: S ? C : x[2].split("(")[0].toUpperCase(), baseModel: S?.[1] || "", raw: w.text };
      }
  }
  const u = /* @__PURE__ */ new Set();
  function f(w) {
    const x = d[xe(w)];
    if (!x) return "";
    if (x.type) return x.type;
    if (u.has(xe(w))) throw Error("Circular AKO model inheritance: " + w);
    return u.add(xe(w)), x.type = f(x.baseModel), u.delete(xe(w)), x.type;
  }
  for (const w of Object.values(d)) if (w.baseModel && !w.type)
    try {
      f(w.name);
    } catch (x) {
      s("error", 0, x.message);
    }
  let b = "", p = 0, m = !1, y = !1;
  const E = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: w, text: x, tokens: S } of l) {
    if (!S.length) continue;
    const C = xe(S[0]);
    if (y) {
      s("warning", w, "Statement after .end is not rendered: " + x);
      continue;
    }
    if (C === ".control") {
      m = !0, s("warning", w, ".control script retained but not executed or rendered.");
      continue;
    }
    if (C === ".endc") {
      m = !1;
      continue;
    }
    if (m) continue;
    if (C === ".subckt") {
      p++, s("error", w, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (C === ".ends") {
      p ? p-- : s("error", w, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (C === ".end") {
      y = !0;
      continue;
    }
    if (C.startsWith(".")) {
      i.push({ line: w, text: x }), C === ".title" ? b = S.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(C) ? s("error", w, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(C) ? s("error", w, "Topology-changing directive is unsupported: " + x) : _.has(C) || s("warning", w, "Directive retained but not resolved: " + x);
      continue;
    }
    const T = S[0][0].toUpperCase();
    if (!pn.has(T)) {
      w === 1 && !/\d/.test(S[0]) && S.length > 1 && T !== "X" ? (b = x, s("warning", w, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", w, `Unsupported ${T} device was not rendered: ${x}`);
      continue;
    }
    const I = T === "M" || T === "Q" ? 5 : 4;
    if (w === 1 && !/\d/.test(S[0]) && (S.length < I || T === "T" && !/\b(?:zo|z0)\s*=/i.test(x))) {
      b = x, s("info", w, "SPICE title: " + x);
      continue;
    }
    try {
      if (E.has(C)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const L = un(S, d), { pins: P, nodeTokens: g, ...h } = L;
      L.polarityKnown || s("warning", w, `${S[0]}: model polarity unknown; explicit ${P.join("/")} terminals retained.`);
      const U = Ye();
      P.forEach((W, X) => {
        const Y = xe(g[X]);
        c[Y] || (c[Y] = { name: Y, displayName: S[X + 1], bit: Object.keys(c).length + 2, terminals: [] }), c[Y].terminals.push({ component: S[0], pin: W }), U[W] = Y;
      }), a.push({ ...h, name: S[0], terminals: U, line: w, raw: x }), E.add(C);
    } catch (L) {
      s("error", w, `${S[0]}: ${L.message} Statement: ${x}`);
    }
  }
  p && s("error", 0, "Unclosed .subckt definition."), m && s("error", 0, "Unclosed .control block."), a.length || s("error", 0, "No supported components to render."), a.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const w of a) {
    for (const x of w.controlSources || []) !x.includes(":") && !a.some((S) => xe(S.name) === xe(x) && S.kind === "V") && s("error", w.line, `${w.name}: controlling voltage source ${x} was not found.`);
    for (const x of w.coupledInductors || []) !x.includes(":") && !a.some((S) => xe(S.name) === xe(x) && S.kind === "L") && s("error", w.line, `${w.name}: coupled inductor ${x} was not found.`);
    (w.kind === "B" || w.type === "spice_b") && s("info", w.line, `${w.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: b, components: a, nodes: c, models: d, directives: i, diagnostics: o };
}
const Ie = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), bt = (t) => Ie(t).split("/").at(-1);
function mn(t, { files: e = {}, filename: o = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), a = [], d = [], c = [];
  let s = 0;
  const l = (f, b) => {
    const p = Ie(b).split("/").slice(0, -1).concat(Ie(f)).join("/"), m = [...i].filter(([E]) => Ie(E) === Ie(f) || Ie(E) === p);
    if (m.length === 1) return m[0];
    const y = [...i].filter(([E]) => bt(E) === bt(f));
    if (y.length !== 1) throw Error(y.length ? "Ambiguous library filename: " + f : "Missing library " + f + ". Add this file using Library files.");
    return y[0];
  };
  function u(f, b, p = "", m = []) {
    const y = Ie(b) + ":" + p.toLowerCase();
    if (m.includes(y)) throw Error("Circular library include: " + [...m, y].join(" → "));
    if (m.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const E = [], _ = /^\s*\.endl\b/im.test(f);
    let w = !p;
    const x = (C, T) => {
      if (s += C.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      c.push(C), d.push({ file: b, line: T + 1 });
    };
    if (f.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((C, T) => {
      const I = C.trim();
      if (/^\.lib\b/i.test(I) && _) {
        const L = He(I);
        if (L.length === 2 && !/[.\\/]/.test(L[1])) {
          E.push(L[1].toLowerCase()), L[1].toLowerCase() === p.toLowerCase() && (w = !0), x("* Library section " + L[1], T);
          return;
        }
      }
      if (/^\.endl\b/i.test(I)) {
        E.pop(), x("* End library section", T);
        return;
      }
      if (p && E.length && !E.includes(p.toLowerCase())) {
        x("* Unselected library section", T);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(I))
        try {
          const L = He(I);
          if (!L[1]) throw Error("Include requires a filename.");
          const [P, g] = l(L[1], b);
          x("* Included " + P, T), u(g, P, L[2] || "", [...m, y]);
        } catch (L) {
          a.push({ severity: "error", line: T + 1, source: b, message: L.message }), x("* Unresolved include", T);
        }
      else x(C, T);
    }), !w) throw Error("Library section " + p + " not found in " + b);
  }
  try {
    u(t, o);
  } catch (f) {
    a.push({ severity: "error", line: 0, source: o, message: f.message });
  }
  return { source: c.join(`
`), origins: d, diagnostics: a };
}
function gn(t) {
  const e = [], o = /* @__PURE__ */ new Map(), i = [0], a = [];
  t.split(/\r?\n/).forEach((s, l) => {
    const u = s.trim();
    /^\.subckt\b/i.test(u) && (i.push(l + 1), o.set(l + 1, [])), i.at(-1) ? o.get(i.at(-1)).push({ raw: s, line: l + 1 }) : e[l] = s, /^\.ends\b/i.test(u) && i.length > 1 && i.pop();
  });
  const d = yt(Array.from({ length: t.split(/\r?\n/).length }, (s, l) => e[l] || "").join(`
`));
  a.push(...d.diagnostics);
  const c = /* @__PURE__ */ new Map();
  for (const [s, l] of o) {
    const u = yt(l.map((f) => f.raw).join(`
`));
    c.set(s, u.layout), a.push(...u.diagnostics.map((f) => ({ ...f, line: l[f.line - 1]?.line || s })));
  }
  return { layout: d.layout, scopes: c, diagnostics: a };
}
function yt(t) {
  const e = [], o = [];
  let i = !1, a = !1, d = 0;
  if (t.split(/\r?\n/).forEach((x, S) => {
    const C = x.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(C)) {
      (a || i) && e.push({ severity: "error", line: S + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(C) || e.push({ severity: "error", line: S + 1, message: "Expected @layout begin v1." }), a = !0, i = !0, d = S + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(C)) {
      i || e.push({ severity: "error", line: S + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (C.startsWith("*") ? o.push(C.slice(1).trim()) : e.push({ severity: "error", line: S + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: d, message: "Unclosed @layout block." }), !a) return { layout: null, diagnostics: e };
  const c = o.join(" "), s = c.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], l = [], u = [], f = [], b = [];
  let p = 0, m = 0, y = 10;
  const E = () => s[p++], _ = () => {
    const x = E();
    if (!x || !/^[A-Za-z_@][\w./%:@-]*$/.test(x)) throw Error("Expected layout identifier, got " + x);
    return x;
  };
  function w(x) {
    if (l.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const S = x ? _() : "@row" + m++, C = E();
    if (!["row", "column", "classic"].includes(C)) throw Error("Expected row, column or classic.");
    if (E() !== "{") throw Error("Expected { after " + C);
    const T = { id: S, direction: C, members: [] };
    for (l.push(T); p < s.length && s[p] !== "}"; )
      s[p] === "group" ? (E(), T.members.push(w(!0))) : ["row", "column"].includes(s[p]) ? T.members.push(w(!1)) : T.members.push(_());
    if (E() !== "}") throw Error("Unclosed group " + S);
    if (!T.members.length) throw Error("Empty layout group " + S);
    return S;
  }
  try {
    for (; p < s.length; )
      if (s[p] === "group")
        E(), w(!0);
      else if (["row", "column"].includes(s[p])) w(!1);
      else if (s[p] === "face") {
        E();
        const g = _(), h = E();
        if (!["left", "right"].includes(h)) throw Error("Expected face left or right.");
        if (b.some((U) => U.device.toLowerCase() === g.toLowerCase())) throw Error("Duplicate face device.");
        b.push({ device: g, side: h });
      } else if (s[p] === "pair") {
        E();
        const g = E();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(g)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (E() !== "{") throw Error("Expected { after pair kind.");
        const h = [];
        for (; p < s.length && s[p] !== "}"; ) h.push(_());
        if (E() !== "}" || !h.length) throw Error("Empty or unclosed pair.");
        if (f.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        f.push({ kind: g, members: h });
      } else if (s[p] === "priority-cap") {
        if (E(), y = Number(E()), !Number.isInteger(y) || y < 3 || y > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (E() === "place") {
        const g = _(), h = E(), U = _();
        if (!["left-of", "above"].includes(h)) throw Error("Expected left-of or above.");
        u.push({ a: g, relation: h, b: U });
      } else throw Error("Unknown layout instruction near " + s[p - 1]);
    const x = /* @__PURE__ */ new Set();
    for (const g of l) {
      const h = g.id.toLowerCase();
      if (x.has(h)) throw Error("Duplicate layout group " + g.id);
      x.add(h);
    }
    const S = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), T = new Map(l.map((g) => [g.id.toLowerCase(), g])), I = (g) => {
      if (S.has(g)) throw Error("Circular layout group " + g);
      if (!C.has(g)) {
        S.add(g);
        for (const h of T.get(g).members) T.has(h.toLowerCase()) && I(h.toLowerCase());
        S.delete(g), C.add(g);
      }
    };
    for (const g of T.keys()) I(g);
    const L = /* @__PURE__ */ new Map();
    for (const g of u) {
      if (g.a.toLowerCase() === g.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      L.has(g.a.toLowerCase()) || L.set(g.a.toLowerCase(), []), L.get(g.a.toLowerCase()).push(g.b.toLowerCase());
    }
    S.clear(), C.clear();
    const P = (g) => {
      if (S.has(g)) throw Error("Circular place constraints.");
      if (!C.has(g)) {
        S.add(g);
        for (const h of L.get(g) || []) P(h);
        S.delete(g), C.add(g);
      }
    };
    for (const g of L.keys()) P(g);
  } catch (x) {
    e.push({ severity: "error", line: d, message: "Layout description: " + x.message });
  }
  return { layout: { version: 1, priorityCap: y, groups: l, relations: u, pairs: f, faces: b }, diagnostics: e };
}
function bn(t, e) {
  const o = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? o : t.ir.layoutDescription;
  if (!i) return null;
  if (o) {
    const m = new Set(o.groups.map((E) => E.id.toLowerCase())), y = (E) => m.has(E.toLowerCase()) ? E : e.components.find((w) => w.synthetic && w.value.toLowerCase() === E.toLowerCase())?.name || e.focus + "/" + E;
    i = { ...o, groups: o.groups.map((E) => ({ ...E, members: E.members.map(y) })), relations: o.relations.map((E) => ({ ...E, a: y(E.a), b: y(E.b) })), faces: (o.faces || []).map((E) => ({ ...E, device: y(E.device) })), pairs: (o.pairs || []).map((E) => ({ ...E, members: E.members.map(y) })) };
  }
  const a = new Map(i.groups.map((m) => [m.id.toLowerCase(), m])), d = Object.values(t.contexts).flatMap((m) => m.devices.map((y) => y.name)), c = new Set([...Object.keys(t.contexts), ...d, ...e.components.map((m) => m.name)].map((m) => m.toLowerCase()));
  for (const m of a.values()) if (c.has((o ? e.focus + "/" + m.id : m.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + m.id);
  for (const m of a.values()) for (const y of m.members) if (!a.has(y.toLowerCase()) && !c.has(y.toLowerCase())) throw Error("Unknown @layout instance/device: " + y);
  for (const m of i.relations) for (const y of [m.a, m.b]) if (!a.has(y.toLowerCase()) && !c.has(y.toLowerCase())) throw Error("Unknown @layout place target: " + y);
  const s = (i.pairs || []).map((m) => ({ ...m, members: m.members.map((y) => {
    const E = e.components.find((_) => _.name.toLowerCase() === y.toLowerCase());
    if (!E || E.synthetic || E.block) throw Error("Unknown or non-visible @layout pair device: " + y);
    return E.name;
  }) })), l = (i.faces || []).map((m) => {
    const y = e.components.find((E) => E.name.toLowerCase() === m.device.toLowerCase());
    if (!y || !["Q", "M", "J", "Z"].includes(y.kind)) throw Error("Unknown or unsupported @layout face device: " + m.device);
    return { ...m, device: y.name };
  }), u = /* @__PURE__ */ new Map(), f = [], b = new Set(Object.keys(t.contexts).map((m) => m.toLowerCase()));
  for (const m of i.groups) {
    const y = [];
    for (const E of m.members) {
      if (a.has(E.toLowerCase())) {
        y.push({ group: E });
        continue;
      }
      for (const _ of e.components) if (_.name.toLowerCase() === E.toLowerCase() || _.name.toLowerCase().startsWith(E.toLowerCase() + "/")) {
        if (u.has(_.name)) throw Error("Overlapping @layout membership: " + _.name);
        u.set(_.name, m.id), y.push({ cell: _.name, ...b.has(E.toLowerCase()) ? { instance: E } : {} });
      }
    }
    f.push({ id: m.id, direction: m.direction, members: y });
  }
  const p = /* @__PURE__ */ new Set();
  for (const m of f) for (const y of m.members) if (y.group) {
    const E = y.group.toLowerCase();
    if (p.has(E)) throw Error("Layout group has multiple parents: " + y.group);
    p.add(E);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: f, relations: i.relations, pairs: s, faces: l };
}
const Oe = () => /* @__PURE__ */ Object.create(null), ye = (t) => t.toLowerCase();
function Lt(t) {
  const e = Oe();
  for (let o = 0; o < t.length; o++) {
    const i = t[o];
    if (/^params?:$/i.test(i)) continue;
    const a = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!a) throw Error("Expected named parameter assignment, got: " + i);
    const d = ye(a[1]);
    let c = a[2];
    if (c === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++o] || "");
      if (!s) throw Error("Expected = after parameter " + d);
      c = s[1];
    }
    if (c || (c = t[++o]), !c || /^params?:$/i.test(c)) throw Error("Missing value for parameter " + d);
    if (Object.hasOwn(e, d)) throw Error("Duplicate parameter: " + d);
    e[d] = c;
  }
  return e;
}
function wt(t) {
  const e = t.findIndex((o, i) => /^params?:$/i.test(o) || o.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, Oe()] : [t.slice(0, e), Lt(t.slice(e))];
}
function xt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const o = mn(t, e);
  t = o.source;
  const i = gn(t), a = [...o.diagnostics, ...i.diagnostics], d = Oe(), c = /* @__PURE__ */ new Set(["0"]), s = (x, S, C) => a.push({ severity: x, line: S, message: C }), l = (x, S, C, T = [], I = Oe(), L = 0) => {
    const P = { id: x, name: S, parent: C, ports: T, defaults: I, parameters: Oe(), definitions: Oe(), devices: [], instances: [], directives: [], line: L, statements: [], layoutDescription: i.scopes.get(L) || null };
    return d[x] = P, P;
  }, u = l("root", "Top", null), f = [u], b = [];
  let p = !1, m = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((x, S) => {
    const C = x.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? b.length ? b.at(-1).text += " " + C.slice(1).trim() : s("error", S + 1, "Continuation has no preceding statement.") : b.push({ text: C, line: S + 1 }));
  });
  for (const { text: x, line: S } of b)
    try {
      const C = He(x);
      if (!C.length) continue;
      const T = ye(C[0]), I = f.at(-1);
      if (m) {
        s("warning", S, "Statement after .end is not rendered: " + x);
        continue;
      }
      if (T === ".control") {
        p = !0, s("warning", S, ".control script retained but not executed or rendered.");
        continue;
      }
      if (T === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (T === ".subckt") {
        if (C.length < 2) throw Error(".SUBCKT requires a name.");
        const [L, P] = wt(C.slice(2)), g = ye(C[1]);
        if (Object.hasOwn(I.definitions, g)) throw Error("Duplicate subcircuit definition: " + C[1]);
        const h = L.map(ye);
        if (new Set(h).size !== L.length || h.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (L.some((W) => /[{}()=]/.test(W))) throw Error("Invalid formal port.");
        if (f.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const U = I.id + "/" + encodeURIComponent(g);
        I.definitions[g] = U, f.push(l(U, C[1], I.id, L, P, S));
        continue;
      }
      if (T === ".ends") {
        if (f.length === 1) throw Error("Unmatched .ENDS.");
        if (C[1] && ye(C[1]) !== ye(I.name)) throw Error(".ENDS name does not match " + I.name);
        f.pop();
        continue;
      }
      if (T === ".end") {
        if (f.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        m = !0;
        continue;
      }
      if (T === ".param") {
        const L = Lt(C.slice(1));
        for (const [P, g] of Object.entries(L)) {
          if (Object.hasOwn(I.parameters, P)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + P);
          I.parameters[P] = g;
        }
      }
      if (T === ".global") {
        if (C.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const L of C.slice(1)) c.add(ye(L));
      }
      if (T.startsWith(".") && I.directives.push({ line: S, text: x }), T.startsWith("x")) {
        const [L, P] = wt(C.slice(1));
        if (!L.length) throw Error("X instance requires a subcircuit name.");
        const g = /;§pnba\s+(.+)$/i.exec(x)?.[1].split(")");
        I.instances.push({ name: C[0], nodes: L.slice(0, -1).map(ye), definitionName: L.at(-1), definitionId: null, parameters: P, line: S, raw: x, pinNames: g });
      } else I.statements.push({ line: S, text: x });
    } catch (C) {
      s("error", S, C.message + " Statement: " + x);
    }
  f.length > 1 && s("error", f.at(-1).line, "Unclosed .SUBCKT " + f.at(-1).name), p && s("error", 0, "Unclosed .control block.");
  function y(x, S) {
    for (; x; ) {
      if (Object.hasOwn(x.definitions, ye(S))) return x.definitions[ye(S)];
      x = d[x.parent];
    }
    return null;
  }
  for (const x of Object.values(d)) {
    const S = [...x.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...x.statements], C = hn(S.map((I) => I.text).join(`
`), { models: d[x.parent]?.models });
    x.devices = C.components.map((I) => ({ ...I, line: S[I.line - 1]?.line || x.line })), x.models = C.models, x === u && (u.title = C.title), a.push(...C.diagnostics.filter((I) => !I.message.includes("No supported components to render.") && !I.message.includes("300 components")).map((I) => ({ ...I, line: S[I.line - 1]?.line || x.line })));
    const T = new Set(x.devices.map((I) => ye(I.name)));
    for (const I of x.instances)
      if (T.has(ye(I.name)) && s("error", I.line, "Duplicate instance/device name: " + I.name), T.add(ye(I.name)), I.definitionId = y(x, I.definitionName), !I.definitionId && !/^\{[\s\S]*\}$/.test(I.definitionName)) s("error", I.line, "Undefined subcircuit: " + I.definitionName + " in " + I.name);
      else if (I.definitionId) {
        const L = d[I.definitionId];
        L.ports.length !== I.nodes.length && s("error", I.line, `${I.name}: ${L.name} expects ${L.ports.length} ports; got ${I.nodes.length}.`);
      }
  }
  for (const x of Object.values(d)) delete x.statements;
  const E = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set();
  function w(x, S = []) {
    if (E.has(x)) {
      s("error", d[x].line, "Circular subcircuit reference: " + [...S, d[x].name].join(" → "));
      return;
    }
    if (!_.has(x)) {
      if (E.add(x), S.length >= 64) {
        s("error", d[x].line, "Subcircuit dependency nesting exceeds 64 levels."), E.delete(x), _.add(x);
        return;
      }
      for (const C of d[x].instances) C.definitionId && w(C.definitionId, [...S, d[x].name]);
      E.delete(x), _.add(x);
    }
  }
  for (const x of Object.keys(d)) w(x);
  !u.devices.length && !u.instances.length && s("error", 0, "No supported components or instances to render.");
  for (const x of a) !x.source && x.line && o.origins[x.line - 1] && (x.source = o.origins[x.line - 1].file, x.line = o.origins[x.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: u.title || "", scopes: d, globals: [...c], diagnostics: a, layoutDescription: i.layout };
}
const pe = () => /* @__PURE__ */ Object.create(null), ke = (t, e) => [...t, e].map((o) => encodeURIComponent(o)).join("/"), it = (t, e) => ke(t.map((o) => o.toLowerCase()), e.toLowerCase());
function yn(t, e = []) {
  const o = pe(), i = (a) => o[a] || (o[a] = { name: a, displayName: a.split("/").map((d) => decodeURIComponent(d)).join("/"), bit: Object.keys(o).length + 2, terminals: [] });
  for (const a of t) for (const [d, c] of Object.entries(a.terminals)) i(c).terminals.push({ component: a.name, pin: d });
  for (const a of e) i(a);
  return o;
}
function wn(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const vt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, xn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function We(t, e, o = (a) => a, i = (a) => a) {
  const a = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (c) => (a.push(c), "@@" + (a.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (c, s, l) => {
    const u = l.split(",").map((b) => b.trim());
    if (u.some((b) => !b || /[\s{}+*()]/.test(b))) throw Error("Unsupported dynamic voltage/current reference: " + c);
    const f = s.toUpperCase() + "(" + u.map((b) => s.toLowerCase() === "v" ? o(b) : i(b, s)).join(",") + ")";
    return a.push(f), "@@" + (a.length - 1) + "@@";
  });
  let d = t.length;
  return t = t.replace(xn, (c, s, l) => {
    if (l.slice(s + c.length).trimStart().startsWith("(")) return c;
    const u = e(c.toLowerCase());
    if (u === void 0) return c;
    if (d += u.length + 2, d > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + u + ")";
  }), t.replace(/@@(\d+)@@/g, (c, s) => a[Number(s)]);
}
function vn(t, e, o, i) {
  const a = { ...e, ...o }, d = pe(), c = /* @__PURE__ */ new Set(), s = pe();
  for (const [u, f] of Object.entries(i)) s[u] = We(vt(f), (b) => t[b]);
  function l(u) {
    if (Object.hasOwn(s, u)) return s[u];
    if (Object.hasOwn(d, u)) return d[u];
    if (!Object.hasOwn(a, u)) return t[u];
    if (c.has(u)) {
      if (Object.hasOwn(t, u)) return t[u];
      throw Error("Circular parameter dependency: " + [...c, u].join(" → "));
    }
    return c.add(u), d[u] = We(vt(a[u]), l), c.delete(u), d[u];
  }
  for (const u of Object.keys(a)) l(u);
  return Object.assign(pe(), t, d, s);
}
function st(t, e, o, i) {
  let a = "";
  for (let l = 0; l < t.length; ) {
    const u = t[l];
    if (u !== "{" && u !== "'") {
      a += u, l++;
      continue;
    }
    const f = l++;
    let b = 1, p = "";
    for (; l < t.length && b; l++) {
      if (u === "'") {
        t[l] === "'" && (b = 0);
        continue;
      }
      if (p) {
        t[l] === p && (p = "");
        continue;
      }
      if (t[l] === '"' || t[l] === "'") {
        p = t[l];
        continue;
      }
      t[l] === "{" && b++, t[l] === "}" && b--;
    }
    if (b) throw Error("Unclosed parameter expression.");
    a += u + We(t.slice(f + 1, l - 1), (m) => e[m], o, i) + (u === "{" ? "}" : "'");
  }
  const d = [];
  let c = 0, s = "";
  for (let l = 0; l < a.length; l++) {
    const u = a[l];
    if (s) {
      u === s && a[l - 1] !== "\\" && (s = "");
      continue;
    }
    if (u === '"' || u === "'") {
      s = u;
      continue;
    }
    if ("({".includes(u) && c++, ")}".includes(u) && c--, !c && (l === 0 || /\s/.test(a[l - 1]))) {
      const f = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(a.slice(l));
      f && (d.push({ start: l, end: l + f[0].length, key: f[1].toLowerCase() }), l += f[0].length - 1);
    }
  }
  if (d.length) {
    let l = a.slice(0, d[0].start);
    d.forEach((u, f) => {
      const b = d[f + 1]?.start ?? a.length, p = a.slice(u.end, b);
      l += a.slice(u.start, u.end) + (p.includes("{") || ["refnode", "intnode"].includes(u.key) ? p : We(p, (m) => e[m], o, i));
    }), a = l;
  } else Object.hasOwn(e, t.toLowerCase()) && (a = "{" + e[t.toLowerCase()] + "}");
  return a;
}
class En {
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
  add(e, o, i) {
    if (typeof arguments[0] != "string")
      for (let a in arguments[0])
        this.add(a, arguments[0][a], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(a) {
        this[a] = this[a] || [], o && this[a][i ? "unshift" : "push"](o);
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
    this[e] = this[e] || [], this[e].forEach(function(i) {
      i.call(o && o.context ? o.context : o, o);
    });
  }
}
class _n {
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
  static addBinaryOp(e, o, i) {
    return R.max_binop_len = Math.max(e.length, R.max_binop_len), R.binary_ops[e] = o, i ? R.right_associative.add(e) : R.right_associative.delete(e), R;
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
      const i = { context: this, node: o };
      return R.hooks.run(e, i), i.node;
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
      return R.hooks[e].find(function(i) {
        return i.call(o.context, o), o.node;
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
    let o = [], i, a;
    for (; this.index < this.expr.length; )
      if (i = this.code, i === R.SEMCOL_CODE || i === R.COMMA_CODE)
        this.index++;
      else if (a = this.gobbleExpression())
        o.push(a);
      else if (this.index < this.expr.length) {
        if (i === e)
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
    let e, o, i, a, d, c, s, l, u;
    if (c = this.gobbleToken(), !c || (o = this.gobbleBinaryOp(), !o))
      return c;
    for (d = { value: o, prec: R.binaryPrecedence(o), right_a: R.right_associative.has(o) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + o), a = [c, d, s]; o = this.gobbleBinaryOp(); ) {
      if (i = R.binaryPrecedence(o), i === 0) {
        this.index -= o.length;
        break;
      }
      d = { value: o, prec: i, right_a: R.right_associative.has(o) }, u = o;
      const f = (b) => d.right_a && b.right_a ? i > b.prec : i <= b.prec;
      for (; a.length > 2 && f(a[a.length - 2]); )
        s = a.pop(), o = a.pop().value, c = a.pop(), e = {
          type: R.BINARY_EXP,
          operator: o,
          left: c,
          right: s
        }, a.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + u), a.push(d, e);
    }
    for (l = a.length - 1, e = a[l]; l > 1; )
      e = {
        type: R.BINARY_EXP,
        operator: a[l - 1].value,
        left: a[l - 2],
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
    let e, o, i, a;
    if (this.gobbleSpaces(), a = this.searchHook("gobble-token"), a)
      return this.runHook("after-token", a);
    if (e = this.code, R.isDecimalDigit(e) || e === R.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === R.SQUOTE_CODE || e === R.DQUOTE_CODE)
      a = this.gobbleStringLiteral();
    else if (e === R.OBRACK_CODE)
      a = this.gobbleArray();
    else {
      for (o = this.expr.substr(this.index, R.max_unop_len), i = o.length; i > 0; ) {
        if (R.unary_ops.hasOwnProperty(o) && (!R.isIdentifierStart(this.code) || this.index + o.length < this.expr.length && !R.isIdentifierPart(this.expr.charCodeAt(this.index + o.length)))) {
          this.index += i;
          const d = this.gobbleToken();
          return d || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: R.UNARY_EXP,
            operator: o,
            argument: d,
            prefix: !0
          });
        }
        o = o.substr(0, --i);
      }
      R.isIdentifierStart(e) ? (a = this.gobbleIdentifier(), R.literals.hasOwnProperty(a.name) ? a = {
        type: R.LITERAL,
        value: R.literals[a.name],
        raw: a.name
      } : a.name === R.this_str && (a = { type: R.THIS_EXP })) : e === R.OPAREN_CODE && (a = this.gobbleGroup());
    }
    return a ? (a = this.gobbleTokenProperty(a), this.runHook("after-token", a)) : this.runHook("after-token", !1);
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
      let i;
      if (o === R.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== R.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), o = this.code;
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
      } : (o === R.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: R.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), i && (e.optional = !0), this.gobbleSpaces(), o = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", o, i;
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
    return i = this.code, R.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === R.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === R.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const o = this.index, i = this.expr.charAt(this.index++);
    let a = !1;
    for (; this.index < this.expr.length; ) {
      let d = this.expr.charAt(this.index++);
      if (d === i) {
        a = !0;
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
    return a || this.throwError('Unclosed quote after "' + e + '"'), {
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
    let i = !1, a = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let d = this.code;
      if (d === e) {
        i = !0, this.index++, e === R.CPAREN_CODE && a && a >= o.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (d === R.COMMA_CODE) {
        if (this.index++, a++, a !== o.length) {
          if (e === R.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === R.CBRACK_CODE)
            for (let c = o.length; c < a; c++)
              o.push(null);
        }
      } else if (o.length !== a && a !== 0)
        this.throwError("Expected comma");
      else {
        const c = this.gobbleExpression();
        (!c || c.type === R.COMPOUND) && this.throwError("Expected comma"), o.push(c);
      }
    }
    return i || this.throwError("Expected " + String.fromCharCode(e)), o;
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
const Nn = new En();
Object.assign(R, {
  hooks: Nn,
  plugins: new _n(R),
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
const Re = (t) => new R(t).parse(), Cn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(R).filter((t) => !Cn.includes(t) && Re[t] === void 0).forEach((t) => {
  Re[t] = R[t];
});
Re.Jsep = R;
const Sn = "ConditionalExpression";
var In = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(o) {
      if (o.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = o.node, a = this.gobbleExpression();
        if (a || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), o.node = {
            type: Sn,
            test: i,
            consequent: a,
            alternate: d
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let c = i;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            o.node.test = c.right, c.right = o.node, o.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Re.plugins.register(In);
const Tn = "ConditionalExpression";
var An = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(o) {
      if (o.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = o.node, a = this.gobbleExpression();
        if (a || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const d = this.gobbleExpression();
          if (d || this.throwError("Expected expression"), o.node = {
            type: Tn,
            test: i,
            consequent: a,
            alternate: d
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let c = i;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            o.node.test = c.right, c.right = o.node, o.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Re.plugins.register(An);
const kn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Et = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, o) => Math.min(Math.max(t, e), o) }, ge = (t) => Number(t) > 0.5;
function Ue(t, e = {}) {
  const o = /* @__PURE__ */ new Set();
  let i = 0;
  function a(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (l) => {
      if (l[0] === '"' || l[0] === "'") return l;
      const [, u, f, b] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(l), p = f.toLowerCase(), m = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : kn[p[0]] || 1;
      return "(" + (b ? +(u + (u.includes(".") ? "" : ".") + b) : Number(u)) * m + ")";
    }), d(Re(s));
  }
  function d(s) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const l = s.name.toLowerCase();
      if (l === "pi") return Math.PI;
      if (l === "e") return Math.E;
      if (!Object.hasOwn(e, l)) throw Error("Undefined structural parameter: " + s.name);
      if (o.has(l)) throw Error("Circular structural parameter: " + l);
      o.add(l);
      const u = a(e[l]);
      return o.delete(l), u;
    }
    if (s.type === "ConditionalExpression") return ge(d(s.test)) ? d(s.consequent) : d(s.alternate);
    if (s.type === "UnaryExpression") {
      const l = d(s.argument);
      if (s.operator === "-") return -l;
      if (s.operator === "+") return +l;
      if (s.operator === "!" || s.operator === "~") return !ge(l);
    }
    if (s.type === "BinaryExpression") {
      const l = d(s.left);
      if (s.operator === "&&") return ge(l) && ge(d(s.right));
      if (s.operator === "||") return ge(l) || ge(d(s.right));
      const u = d(s.right);
      switch (s.operator) {
        case "+":
          return l + u;
        case "-":
          return l - u;
        case "*":
          return l * u;
        case "/":
          return l / u;
        case "**":
          return l ** u;
        case "%":
          return l % u;
        case "^":
          return ge(l) !== ge(u);
        case "&":
          return ge(l) && ge(u);
        case "|":
          return ge(l) || ge(u);
        case ">":
          return l > u;
        case "<":
          return l < u;
        case ">=":
          return l >= u;
        case "<=":
          return l <= u;
        case "==":
        case "===":
          return l === u;
        case "!=":
        case "!==":
          return l !== u;
      }
    }
    if (s.type === "CallExpression" && s.callee.type === "Identifier") {
      const l = s.callee.name.toLowerCase();
      if (l === "if") {
        if (s.arguments.length !== 3) throw Error("if() needs three arguments.");
        return ge(d(s.arguments[0])) ? d(s.arguments[1]) : d(s.arguments[2]);
      }
      if (Object.hasOwn(Et, l)) return Et[l](...s.arguments.map(d));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const c = a(t);
  if (typeof c == "number" && !Number.isFinite(c)) throw Error("Structural expression is not finite.");
  return c;
}
function qe(t, { isolate: e = "" } = {}) {
  wn(t);
  const o = pe(), i = /* @__PURE__ */ new Map();
  let a = 0, d = 0;
  function c(s, l, u, f, b, p, m) {
    if (l.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++a > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const y = t.scopes[s], E = l.length ? ke(l.slice(0, -1), l.at(-1)) : "", _ = pe();
    if (e && E === e && (u = pe()), m.some((I) => I.scopeId === s)) throw Error("Circular subcircuit reference at " + E);
    const w = vn(f, y.defaults, y.parameters, b);
    function x(I) {
      if (/^\{[\s\S]*\}$/.test(I)) {
        const P = Ue(I, w);
        I = String(typeof P == "boolean" ? Number(P) : P);
      }
      /^"[\s\S]*"$/.test(I) && (I = I.slice(1, -1));
      const L = I.toLowerCase();
      return Object.hasOwn(u, L) ? u[L] : t.globals.includes(L) ? it([], L) : _[L] || (_[L] = it(l, L));
    }
    const S = { id: E, path: l, scopeId: s, name: p?.name || "Top", definition: y.name, ports: y.ports.map((I) => ({ name: I, node: x(I) })), params: w, nodes: _, models: pe(), devices: [], children: [], raw: p?.raw || "", line: p?.line || 0 };
    o[E] = S, i.set(E, x);
    const C = [...m, S];
    function T(I) {
      if (!I) return "";
      let L = y;
      for (; L; ) {
        if (L.directives.some((P) => new RegExp("^\\.model\\s+" + I.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(P.text))) {
          const P = [...C].reverse().find((g) => g.scopeId === L.id);
          return ke(P?.path || [], I.toLowerCase());
        }
        L = t.scopes[L.parent];
      }
      return I;
    }
    for (const I of y.directives.filter((L) => /^\.model\b/i.test(L.text))) {
      const L = /^\.model\s+(\S+)/i.exec(I.text)?.[1];
      if (!L) continue;
      const P = T(L), g = y.models[L.toLowerCase()], h = st(I.text, w, x, (U) => ke(l, U));
      S.models[P] = { ...g, name: P, raw: h.replace(/^(\.model\s+)\S+/i, (U, W) => W + P), instanceId: E, parameters: w };
    }
    for (const I of y.devices) {
      if (++d > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const L = pe();
      for (const [g, h] of Object.entries(I.terminals)) L[g] = x(h);
      const P = T(I.model);
      S.devices.push({ ...I, name: ke(l, I.name), localName: I.name, instanceId: E, terminals: L, model: P, parameters: w });
    }
    for (const I of y.instances) {
      let L = I.definitionId;
      if (!L) {
        const U = String(Ue(I.definitionName, w)).toLowerCase();
        let W = y;
        for (; W && !L; )
          L = W.definitions[U], W = t.scopes[W.parent];
        if (!L) throw Error("Undefined selected subcircuit: " + U);
      }
      const P = t.scopes[L], g = pe();
      if (P.ports.length !== I.nodes.length) throw Error(I.name + ": expected " + P.ports.length + " ports; got " + I.nodes.length);
      P.ports.forEach((U, W) => {
        g[U.toLowerCase()] = x(I.nodes[W]);
      });
      const h = c(L, [...l, I.name], g, w, I.parameters, I, C);
      I.pinNames?.length === h.ports.length && h.ports.forEach((U, W) => {
        U.label = I.pinNames[W];
      }), S.children.push(h);
    }
    return S;
  }
  try {
    let b = function(p, m) {
      const y = m.split(":");
      if (y.length === 1) return { owner: p, name: m };
      const E = y.pop();
      for (const _ of [[...p.path, ...y], y]) {
        const w = l.get(_.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: E };
      }
      throw Error("Unknown hierarchical reference: " + m);
    };
    const s = c(t.rootId, [], pe(), pe(), pe(), null, []), l = new Map(Object.values(o).map((p) => [p.id.toLowerCase(), p])), u = Object.assign(pe(), ...Object.values(o).map((p) => p.models)), f = (p) => u[p] || Object.entries(u).find(([m]) => m.startsWith(p + "."))?.[1];
    for (const p of Object.values(o)) for (const m of p.devices) {
      const y = t.scopes[p.scopeId].devices.find((w) => w.name === m.localName), E = (w) => {
        const x = b(p, w);
        return i.get(x.owner.id)(x.name);
      }, _ = (w, x = "", S = "") => {
        const C = b(p, w), T = C.owner.devices.find((I) => I.localName.toLowerCase() === C.name.toLowerCase());
        if (x.toLowerCase() === "ix") {
          const I = C.owner.ports.find((L, P) => L.name.toLowerCase() === C.name.toLowerCase() || String(P + 1) === C.name);
          if (I) return C.owner.id + ":" + I.name;
        }
        if (!T) {
          if (S) throw Error(m.name + ": referenced " + S + " device " + w + " was not found.");
          return ke(C.owner.path, C.name);
        }
        if (S && T.kind !== S) throw Error(m.name + ": " + w + " must be a " + S + " device.");
        return T.name;
      };
      if (m.value = st(y.value, p.params, E, _), y.model && (m.value = m.value.replace(y.model, m.model)), m.kind === "M" && Object.keys(m.terminals).length === 3) {
        let w = f(m.model), x = !1;
        const S = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !S.has(w.name); ) {
          S.add(w.name);
          const C = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (C) {
            x = C[1] === void 0 || Number(Ue(C[1], w.parameters)) >= 0.5;
            break;
          }
          const T = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = f(T + (w.baseModel || "").toLowerCase()) || f((w.baseModel || "").toLowerCase());
        }
        S.size && (m.type = "spice_" + (x ? "pmos3" : "nmos3"));
      }
      m.controlSources = (y.controlSources || []).map((w) => _(w, "", "V")), m.controlSource = m.controlSources[0] || "", m.coupledInductors = (y.coupledInductors || []).map((w) => _(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...y.controlSources || [], ...y.coupledInductors || []])) {
        const x = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        m.value = m.value.replace(new RegExp("(?<![\\w./%])" + x + "(?![\\w.$])", "g"), () => _(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: s, contexts: o };
  } catch (s) {
    throw s.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: s.message }], s;
  }
}
function Me(t) {
  return [...t.devices, ...t.children.flatMap(Me)];
}
function Le(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, o) => e[0].localeCompare(o[0])));
}
function dt(t, e = {}) {
  const o = new Map(t.components.map((g) => [g.name, g])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), d = [], c = (g, h) => JSON.stringify([g, h].sort()), s = (g) => e[g]?.potential !== null && e[g]?.potential !== void 0;
  for (const g of t.components) {
    for (const [M, O] of Object.entries(g.terminals))
      i.has(O) || i.set(O, []), i.get(O).push({ device: g.name, pin: M });
    if (g.kind === "R") {
      const M = Object.values(g.terminals);
      if (M.length === 2 && M[0] !== M[1]) {
        const O = c(...M);
        a.has(O) || a.set(O, []), a.get(O).push(g);
      }
    }
    const h = g.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(g.kind) ? "fet" : null, U = h === "bjt" ? /_(npn|pnp)$/.exec(g.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(g.type)?.[1];
    if (!h || !U) continue;
    const W = g.terminals, X = W[h === "bjt" ? "B" : "G"], Y = W[h === "bjt" ? "C" : "D"], J = W[h === "bjt" ? "E" : "S"];
    [X, Y, J].some((M) => M === void 0) || X === J || Y === J || d.push({ id: g.name, family: h, polarity: U, control: X, drain: Y, source: J, body: g.kind === "M" ? W.B : void 0 });
  }
  const l = [], u = /* @__PURE__ */ new Set(), f = (g, h, U, W, X, Y = "basic", J = [], M = "high") => {
    const O = [.../* @__PURE__ */ new Set([...h, ...J])], q = JSON.stringify([g, Y, [...O].sort()]);
    u.has(q) || (u.add(q), l.push({ id: "motif" + l.length, kind: g, variant: Y, transistors: h, members: O, roles: U, nets: W, evidence: X, confidence: M }));
  }, b = (g, h) => g.family === h.family && g.polarity === h.polarity, p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), E = new Map(d.map((g) => [g.id, g])), _ = (g, h, U) => {
    g.has(h) || g.set(h, []), g.get(h).push(U);
  }, w = (g, h) => JSON.stringify([g.family, g.polarity, h]);
  for (const g of d)
    _(p, w(g, g.control), g), _(m, w(g, g.source), g), g.family === "bjt" && (i.get(g.source) || []).some((h) => {
      const U = E.get(h.device);
      return U && U.family === "bjt" && !b(g, U) && U.source === g.source;
    }) && _(y, w(g, g.drain), g);
  const x = (g) => [{ node: g.source, resistor: null }, ...(i.get(g.source) || []).flatMap((h) => {
    const U = o.get(h.device);
    if (U.kind !== "R") return [];
    const W = Object.values(U.terminals).find((X) => X !== g.source);
    return W !== void 0 && W !== g.control && W !== g.drain ? [{ node: W, resistor: U.name }] : [];
  })];
  for (const g of d) g.control === g.drain && f("diode-connected", [g.id], { reference: g.id }, { control: g.control, return: g.source }, ["control-drain-short", g.family]);
  for (const g of d) {
    const h = p.get(w(g, g.control));
    if (h.filter((M) => M.control === M.drain).length > 1) continue;
    let U = null;
    if (g.control !== g.drain && g.family === "bjt" && (U = (p.get(w(g, g.drain)) || []).find((M) => M.id !== g.id && b(M, g) && M.control === g.drain && M.source === g.control && s(M.drain))), g.control !== g.drain && !U) continue;
    const W = x(g), X = [];
    let Y = null, J = [];
    for (const M of h) {
      if (M.id === g.id || M.id === U?.id || M.drain === g.drain || M.drain === M.control) continue;
      const O = W.flatMap((q) => x(M).filter(($) => q.node === $.node).map(($) => ({ node: q.node, rs: [q.resistor, $.resistor].filter(Boolean) }))).find((q) => Y === null || q.node === Y);
      O && (Y = O.node, X.push(M.id), J.push(...O.rs));
    }
    if (X.length) {
      const M = X.every((O) => E.get(O).body === g.body);
      f("current-mirror", [g.id, ...X, ...U ? [U.id] : []], { reference: g.id, outputs: X, ...U ? { helper: U.id } : {} }, { control: g.control, return: Y }, ["same-polarity", "shared-control", U ? "emitter-follower-reference" : "diode-reference", J.length ? "resistive-common-return" : "shared-return", M ? "compatible-bodies" : "different-body-connections"], U ? "assisted" : J.length ? "degenerated" : "basic", [...J, ...U ? [U.id] : []], M ? "high" : "medium");
    }
  }
  const S = [], C = /* @__PURE__ */ new Set(), T = (g, h) => {
    const U = JSON.stringify([g.id, h.id].sort());
    C.has(U) || (C.add(U), S.push([g, h]));
  };
  for (const g of m.values()) if (!s(g[0].source)) {
    const h = g.filter((U) => U.control !== U.drain);
    h.length === 2 ? T(...h) : h.length > 2 && new Set(h.map((U) => U.control)).size > 1 && f("differential-pair", h.map((U) => U.id), { inputs: h.map((U) => U.id) }, { tail: h[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const g of y.values()) for (let h = 0; h < g.length; h++) for (let U = h + 1; U < g.length; U++) T(g[h], g[U]);
  for (const [g, h] of S) {
    if (g.control === h.control || g.control === g.drain || h.control === h.drain) continue;
    if (g.source === h.source && g.drain !== h.drain && !s(g.source)) {
      const X = (i.get(g.source) || []).some((J) => J.device !== g.id && J.device !== h.id), Y = m.get(w(g, g.source)).length === 2;
      f("differential-pair", [g.id, h.id], { inputs: [g.id, h.id] }, { tail: g.source }, ["same-polarity", "distinct-controls", "shared-tail", X ? "tail-bias-connection" : "unbiased-tail", Y ? "two-input-tail" : "multi-input-tail"], "basic", [], X && Y && g.body === h.body ? "high" : "medium");
    }
    if (g.family !== "bjt" || g.drain !== h.drain || g.source === h.source) continue;
    const U = d.filter((X) => X.family === "bjt" && X.polarity !== g.polarity && X.source === g.source), W = d.filter((X) => X.family === "bjt" && X.polarity !== g.polarity && X.source === h.source);
    for (const X of U) for (const Y of W) X.id !== Y.id && X.control === Y.control && X.drain !== Y.drain && X.control !== X.drain && Y.control !== Y.drain && f("differential-pair", [g.id, h.id, X.id, Y.id], { inputs: [g.id, h.id], commonBase: [X.id, Y.id] }, { inputCollectors: g.drain, bias: X.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const g of d) if (g.family === "bjt" && g.control !== g.drain) {
    const h = a.get(c(g.drain, g.control)) || [], U = a.get(c(g.control, g.source)) || [];
    h.length === 1 && U.length === 1 && f("vbe-multiplier", [g.id], { transistor: g.id, collectorResistor: h[0].name, emitterResistor: U[0].name }, { control: g.control, collector: g.drain, emitter: g.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [h[0].name, U[0].name]);
  }
  const I = d.filter((g) => g.family === "bjt"), L = /* @__PURE__ */ new Map();
  for (const g of I) _(L, g.control, g);
  const P = (g) => (i.get(g) || []).filter((h) => E.has(h.device));
  for (const g of I) if (g.control !== g.drain) {
    for (const h of L.get(g.source) || []) if (h.id !== g.id && b(g, h) && h.drain === g.control && h.source !== g.drain) {
      const U = a.get(c(g.source, h.source)) || [];
      U.length === 1 && f("current-limit-pair", [g.id, h.id], { driver: g.id, output: h.id, senseResistor: U[0].name }, { sense: g.source, drive: g.control, output: h.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [U[0].name]);
    }
    for (const h of L.get(g.source) || []) h.id !== g.id && b(g, h) && h.control !== h.drain && g.drain === h.drain && h.source !== g.control && f("darlington-pair", [g.id, h.id], { driver: g.id, output: h.id }, { link: g.source, collector: g.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (L.get(g.source) || []).length === 1 ? "high" : "medium");
    for (const h of L.get(g.drain) || []) h.id !== g.id && !b(g, h) && h.control !== h.drain && g.source === h.drain && h.source !== g.control && P(g.drain).length === 2 && f("sziklai-pair", [g.id, h.id], { driver: g.id, output: h.id }, { link: g.drain, feedback: g.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const h of i.get(g.drain) || []) {
      const U = E.get(h.device);
      !U || U.family !== "bjt" || U.id === g.id || !b(g, U) || U.source !== g.drain || s(g.drain) || U.control === g.control || U.control === U.drain || U.drain === g.source || P(g.drain).length !== 2 || f("cascode-pair", [g.id, U.id], { driver: g.id, output: U.id }, { link: g.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const g of I.filter((h) => h.polarity === "npn" && s(h.drain))) for (const h of I.filter((U) => U.polarity === "pnp" && s(U.drain))) {
    if (e[g.drain].potential <= e[h.drain].potential) continue;
    const U = x(g).flatMap((W) => x(h).filter((X) => W.node === X.node && !s(W.node)).map((X) => ({ node: W.node, rs: [W.resistor, X.resistor].filter(Boolean) })))[0];
    U && f("push-pull-pair", [g.id, h.id], { upper: g.id, lower: h.id }, { output: U.node }, ["complementary-polarity", "ordered-collector-supplies", U.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", U.rs);
  }
  return l;
}
function ut(t, e, o = (i) => i) {
  const i = (a) => Array.isArray(a) ? a.map(e) : e(a);
  return t.map((a) => ({ ...a, members: a.members.map(e), transistors: a.transistors.map(e), roles: Object.fromEntries(Object.entries(a.roles).map(([d, c]) => [d, i(c)])), nets: Object.fromEntries(Object.entries(a.nets).map(([d, c]) => [d, o(c)])) }));
}
function On(t, e, o) {
  const i = [], a = /* @__PURE__ */ new Set(), d = new Map(t.components.map((c) => [c.name, c]));
  for (const c of o) {
    if (new Set(c.members).size !== c.members.length) throw Error("Duplicate @layout pair member.");
    const s = c.members.map((p) => d.get(p));
    if (s.some((p) => !p)) throw Error("Unknown @layout pair device.");
    const l = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[c.kind], u = c.kind === "differential" && s.length === 2 ? t.components.filter((p) => !c.members.includes(p.name) && Object.values(p.terminals).includes(s[0].terminals.E ?? s[0].terminals.S)) : [], f = dt({ ...t, components: [...s, ...u] }, e), b = f.find((p) => p.kind === l && p.confidence === "high" && c.members.every((m) => p.members.includes(m)));
    if (!b) throw Error("Invalid @layout pair " + c.kind + " { " + c.members.join(" ") + " }: electrical structure does not match.");
    for (const p of f.filter((m) => m === b || m.kind === "diode-connected" && m.members.every((y) => b.members.includes(y)))) {
      const m = JSON.stringify([p.kind, [...p.members].sort()]);
      a.has(m) || (a.add(m), i.push({ ...p, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function Mn(t, e, o = dt(t, e)) {
  const i = /* @__PURE__ */ new Map(), a = t.components.filter((p) => p.kind === "R"), d = t.components.filter((p) => p.kind === "Q"), c = new Map(t.components.map((p) => [p.name, p])), s = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = (p) => Object.values(p.terminals), f = (p, m, y) => {
    p && i.set(p.name, { reverse: u(p)[0] !== m, reason: y });
  };
  for (const p of d) {
    const { C: m, B: y, E } = p.terminals, _ = p.type.endsWith("pnp"), w = p.type.endsWith("npn");
    !_ && !w || (s.has(E) || s.set(E, []), s.get(E).push(p), m === y && e[E]?.potential !== null && e[E]?.potential !== void 0 && l.set(m, { potential: e[E].potential }));
  }
  for (const p of o) if (p.kind === "vbe-multiplier" && p.confidence === "high") {
    const m = c.get(p.roles.transistor), y = m.type.endsWith("pnp"), E = c.get(y ? p.roles.emitterResistor : p.roles.collectorResistor), _ = c.get(y ? p.roles.collectorResistor : p.roles.emitterResistor);
    f(E, m.terminals[y ? "E" : "C"], "recognized VBE multiplier"), f(_, m.terminals.B, "recognized VBE multiplier");
  }
  for (const p of a) {
    const [m, y] = u(p), E = l.get(m), _ = l.get(y);
    E && _ && E.potential !== _.potential && f(p, E.potential > _.potential ? m : y, "diode-connected bias reference");
  }
  const b = /* @__PURE__ */ new Map();
  for (const p of a) {
    const m = u(p);
    if (!m.some((y) => e[y]?.potential !== null && e[y]?.potential !== void 0))
      for (const y of m)
        b.has(y) || b.set(y, []), b.get(y).push(p);
  }
  for (const [p, m] of b)
    if (!(m.length > 12))
      for (const y of m) for (const E of m) {
        if (y === E) continue;
        const _ = u(y).find((C) => C !== p), w = u(E).find((C) => C !== p), x = s.get(_)?.find((C) => C.type.endsWith("npn")), S = s.get(w)?.find((C) => C.type.endsWith("pnp"));
        x && S && (f(y, _, "complementary emitter output"), f(E, p, "complementary emitter output"));
      }
  return i;
}
function Rn(t) {
  const e = t.components.filter((d) => d.kind === "Q"), o = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((d) => d.kind === "R").map((d) => Object.values(d.terminals).sort().join("|"))), a = /* @__PURE__ */ new Set();
  for (const d of e) {
    const c = d.terminals.E;
    o.has(c) || o.set(c, []), o.get(c).push(d);
  }
  for (const d of e) {
    const { B: c, C: s, E: l } = d.terminals;
    if (c === l || !i.has([c, l].sort().join("|"))) continue;
    const u = o.get(c) || [];
    if (!(u.length > 16))
      for (const f of u) {
        if (f === d) continue;
        if (f.terminals.B === s) {
          a.add(d.name);
          break;
        }
        const b = o.get(f.terminals.B) || [];
        if (b.length <= 16 && b.some((p) => p !== d && p !== f && p.terminals.B === s)) {
          a.add(d.name);
          break;
        }
      }
  }
  return a;
}
const Be = 22;
function at(t) {
  const e = String(t).split("/").at(-1);
  let o;
  try {
    o = decodeURIComponent(e);
  } catch {
    o = e;
  }
  return o === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(o)?.[1].toLowerCase() || "unknown";
}
const je = (t) => ["pwr", "ret", "bias"].includes(t), Ln = (t) => String(t).split("/").at(-1).toLowerCase(), Pt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[Ln(t)] || "unknown", _t = (t) => {
  const e = at(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Pt(t);
};
function Pn(t) {
  const e = /* @__PURE__ */ new Map(), o = [], i = (c, s, l) => {
    e.has(c) || e.set(c, []), e.get(c).push({ node: s, delta: l });
  };
  for (const c of t)
    if (c.kind === "V")
      try {
        let s = c.value.trim();
        const l = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(s);
        if (l && Number(Ue(l[1], c.parameters)) !== 0 || (s = s.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(s))) continue;
        const u = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(s);
        if (!u) continue;
        const f = Ue(u[1], c.parameters);
        if (typeof f != "number" || !Number.isFinite(f)) continue;
        i(c.terminals["-"], c.terminals["+"], f), i(c.terminals["+"], c.terminals["-"], -f);
      } catch {
      }
  const a = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Set();
  for (const c of ["0", ...e.keys()]) {
    if (d.has(c)) continue;
    const s = /* @__PURE__ */ new Map([[c, 0]]), l = [c];
    d.add(c);
    let u = !1;
    for (let f = 0; f < l.length; f++) for (const b of e.get(l[f]) || []) {
      const p = s.get(l[f]) + b.delta;
      s.has(b.node) ? Math.abs(s.get(b.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (u = !0) : (s.set(b.node, p), d.add(b.node), l.push(b.node));
    }
    u && o.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [f, b] of s) a[f] = { value: b, reference: c, known: c === "0" && !u, consistent: !u };
  }
  return { nodes: a, diagnostics: o };
}
function Dn(t, e, o = null) {
  const i = Pn(Me(e.localScope ? t.contexts[e.focus] : t.root)), a = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ Object.create(null);
  for (const f of Object.values(e.nodes)) {
    const b = at(f.name), p = Pt(f.name);
    a[f.name] = { role: b !== "unknown" ? b : p, roleSource: b !== "unknown" ? "node-name" : p !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[f.name]?.known ? i.nodes[f.name].value : null };
  }
  if (e.localScope) for (const f of e.interfaceBindings) {
    const b = a[f.local], p = _t(f.port);
    b && b.potential === null && ["pwr", "ret"].includes(p) && (b.potential = p === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(f.port) ? 0 : -1, b.potentialSource = "symbolic-port-order");
  }
  const c = o?.pairs?.length ? On(e, a, o.pairs) : dt(e, a), s = Mn(e, a, c), l = Rn(e), u = (f, b, p) => {
    const m = { role: a[p].role, roleSource: a[p].roleSource }, y = f.block?.ports.find((w) => w.pin === b);
    if (y?.implicit || !f.block && !f.synthetic) return m;
    const E = f.synthetic ? f.value : y?.name || y?.label, _ = _t(E);
    return _ !== "unknown" ? { role: _, roleSource: at(E) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : je(m.role) ? { ...m, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const f of e.components) {
    const b = Object.fromEntries(Object.entries(f.terminals).map(([P, g]) => [P, { ...a[g], ...u(f, P, g) }])), p = Object.values(b), m = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(f.type), y = m && !s.has(f.name) && p.length === 2 && p.every((P) => !je(P.role) && (P.potential === null || P.role !== "unknown")), E = f.terminals["+"], _ = f.terminals["-"], w = [E, _].filter((P) => P && P !== "0"), x = f.kind === "V" && w.some((P) => je(a[P]?.role)) && !w.some((P) => ["in", "out", "io", "fb"].includes(a[P]?.role)) && [E, _].every((P) => i.nodes[P]?.known), S = E === "0" ? _ : E, C = Object.keys(f.terminals), T = (P) => je(P.role) ? P.potential !== null ? P.potential > 0 ? "high" : "low" : P.role === "ret" ? "low" : "high" : "signal";
    let I = !1;
    C.length === 2 && (f.kind === "V" && p.every((P) => P.potential !== null) ? I = p[0].potential < p[1].potential : f.terminals[C[0]] === "0" ? I = !0 : f.terminals[C[1]] === "0" ? I = !1 : p.every((P) => P.potential !== null) ? I = p[0].potential < p[1].potential : I = T(p[0]) === "low" || T(p[1]) === "high" && T(p[0]) === "signal"), s.has(f.name) && (I = s.get(f.name).reverse);
    const L = f.synthetic ? "" : f.name.startsWith(e.focus + "/") ? f.name.slice(e.focus.length + 1) : f.name;
    d[f.name] = { version: Be, kind: f.kind, polarity: f.type.endsWith("pnp") ? "p" : f.type.endsWith("npn") ? "n" : null, currentLimiter: l.has(f.name), orientationReason: s.get(f.name)?.reason || null, owner: L.includes("/") ? L.slice(0, L.lastIndexOf("/")) : "", passive: m, source: ["V", "I", "E", "F", "G", "H"].includes(f.kind) || f.kind === "B" && !m, ports: b, horizontal: y, orientation: y ? "horizontal" : I ? "vertical-reversed" : "vertical", flexible: C.length === 2 && (m || ["V", "I", "B", "F", "H"].includes(f.kind)), supply: !!x, voltage: x ? i.nodes[S].value : null };
  }
  return { version: Be, nodes: a, cells: d, motifs: c, diagnostics: i.diagnostics };
}
function Dt(t, e) {
  const o = e.ports.map((a, d) => ({ pin: "P" + d, name: a.name, label: a.label || a.name, node: a.node, implicit: !1 })), i = new Set(Me(e).flatMap((a) => Object.values(a.terminals)));
  for (const a of t.ir.globals) {
    const d = it([], a);
    i.has(d) && !o.some((c) => c.node === d) && o.push({ pin: "G" + o.length, label: a === "0" ? "⏚ 0" : "global: " + a, node: d, implicit: !0 });
  }
  return o;
}
function Ve(t, { mode: e = "hierarchical", expanded: o = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const a = t, d = t.contexts[i];
  if (!d) throw Error("Unknown instance: " + i);
  i && (t = qe(t.ir, { isolate: i }));
  const c = t.contexts[i];
  if (!c) throw Error("Unknown instance: " + i);
  const s = [], l = [];
  function u(y) {
    l.push(...Object.values(y.nodes), ...y.ports.map((_) => _.node));
    const E = [...y.devices.map((_) => ({ line: _.line, device: _ })), ...y.children.map((_) => ({ line: _.line, child: _ }))].sort((_, w) => _.line - w.line);
    for (const _ of E) {
      if (_.device) {
        const C = _.device;
        s.push({ ...C, layoutLabel: [...y.path.slice(c.path.length), C.localName].join("/") });
        continue;
      }
      const w = _.child;
      if (e === "flat" || o.has(w.id)) {
        u(w);
        continue;
      }
      const x = Dt(t, w), S = pe();
      x.forEach((C) => {
        S[C.pin] = C.node;
      }), s.push({ name: w.id, kind: "X", type: "spice_subckt", terminals: S, value: w.definition, raw: w.raw, line: w.line, instanceId: w.id, layoutLabel: w.path.slice(c.path.length).join("/"), block: { definitionId: w.scopeId, ports: x, parameters: w.params } });
    }
  }
  u(c);
  for (const [y, E] of c.ports.entries()) s.push({ name: "@port/" + i + "/" + y, kind: "PORT", type: "spice_port", terminals: { A: E.node }, layoutLabel: E.name, value: E.name, raw: "Interface port " + E.name, synthetic: !0 });
  if (s.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const f = Object.assign(pe(), ...Object.values(t.contexts).map((y) => y.models)), b = { title: i || t.ir.title, components: s, nodes: yn(s, l), models: f, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  b.interfaceBindings = c.ports.map((y, E) => ({ port: y.name, local: y.node, parent: d.ports[E].node }));
  const p = /* @__PURE__ */ new Map();
  for (const y of d.ports)
    p.has(y.node) || p.set(y.node, []), p.get(y.node).push(y.name);
  b.interfaceAliases = [...p].filter(([, y]) => y.length > 1).map(([y, E]) => ({ node: y, ports: E })), b.topology = Un(a, b);
  const m = bn(t, b);
  return b.layout = Dn(t, b, m), b.layout.description = m, b;
}
function Un(t, e) {
  const o = Me(t.contexts[e.focus]);
  e.localScope && (t = qe(t.ir, { isolate: e.focus }));
  const i = [], a = /* @__PURE__ */ new Set();
  for (const s of e.components)
    if (!s.synthetic)
      if (s.kind === "X") {
        const l = t.contexts[s.instanceId];
        if (!l) throw Error("Projection contains an unknown block.");
        const u = Dt(t, l);
        if (JSON.stringify(Object.entries(s.terminals)) !== JSON.stringify(u.map((f) => [f.pin, f.node]))) throw Error("Block interface topology mismatch: " + s.name);
        i.push(...Me(l));
      } else i.push(s);
  for (const s of i) {
    if (a.has(s.name)) throw Error("Projection duplicates " + s.name);
    a.add(s.name);
  }
  const d = Le(i), c = Me(t.contexts[e.focus]);
  if (d !== Le(c)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const s = new Map(e.interfaceBindings.map((f) => [f.local, f.parent])), l = (f) => s.get(f) ?? f, u = i.map((f) => ({ ...f, terminals: Object.fromEntries(Object.entries(f.terminals).map(([b, p]) => [b, l(p)])), value: st(f.value, {}, l, (b) => b) }));
    if (Le(u) !== Le(o)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: d, boundSignature: Le(o), boundaryVerified: !0 };
}
function Qe(t) {
  const e = pe(), o = pe();
  for (const i of t.components) {
    const a = pe(), d = pe();
    for (const [c, s] of Object.entries(i.terminals))
      a[c] = [t.nodes[s].bit], d[c] = "input";
    e[i.name] = { type: i.type, port_directions: d, connections: a, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((c) => ({ pin: c.pin, label: c.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((c, s) => ({ pin: c, label: i.pinLabels?.[s] || c })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) o[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: o, spiceMotifs: ut(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Bn(t) {
  const e = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), i = {}, a = (u) => (o.has(u) || o.set(u, o.size + 2), o.get(u));
  Object.entries(t.modules.circuit.cells).forEach(([u, f], b) => {
    const p = "c" + b;
    e.set(p, u);
    const m = Object.fromEntries(Object.entries(f.connections).map(([y, E]) => [y, E.map(a)]));
    i[p] = { type: f.type, connections: m, port_directions: f.port_directions, attributes: { displayRef: f.attributes.displayRef || f.attributes.ref || "", value: f.attributes.value || "", name: f.attributes.name || "" } }, f.spiceBlock && (i[p].spiceBlock = f.spiceBlock), f.spiceSymbol && (i[p].spiceSymbol = f.spiceSymbol), f.spiceLayout && (i[p].spiceLayout = f.spiceLayout);
  });
  const d = new Map([...e].map(([u, f]) => [f, u])), c = t.modules.circuit.spiceLayoutDescription, s = c ? { ...c, faces: (c.faces || []).map((u) => ({ ...u, device: d.get(u.device) })), pairs: (c.pairs || []).map((u) => ({ ...u, members: u.members.map((f) => d.get(f)) })), groups: c.groups.map((u) => ({ ...u, members: u.members.map((f) => f.cell ? { ...f, cell: d.get(f.cell) } : f) })), relations: c.relations.map((u) => ({ ...u, a: d.get(u.a) || u.a, b: d.get(u.b) || u.b })) } : null, l = ut(t.modules.circuit.spiceMotifs || [], (u) => d.get(u), a);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: l, spiceLayoutDescription: s } } }, ids: e, bits: new Map([...o].map(([u, f]) => [f, u])) };
}
const Se = /* @__PURE__ */ new Map();
async function Ke(t, e) {
  const o = Bn(t), i = JSON.stringify([o.netlist, e]);
  let a = Se.get(i);
  a ? (Se.delete(i), Se.set(i, a)) : (a = await jn(o.netlist, e), a.svg.length < 1e6 && (Se.set(i, a), Se.size > 20 && Se.delete(Se.keys().next().value)));
  const d = new DOMParser().parseFromString(a.svg, "image/svg+xml");
  if (d.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const l of d.querySelectorAll("[id],[class]")) {
    const u = l.getAttribute("id");
    u?.startsWith("cell_") && o.ids.has(u.slice(5)) && l.setAttribute("id", "cell_" + o.ids.get(u.slice(5)));
    const f = l.getAttribute("class");
    f && l.setAttribute("class", f.split(/\s+/).map((b) => b.startsWith("cell_") && o.ids.has(b.slice(5)) ? "cell_" + o.ids.get(b.slice(5)) : /^net_\d+$/.test(b) && o.bits.has(Number(b.slice(4))) ? "net_" + o.bits.get(Number(b.slice(4))) : b).join(" "));
  }
  const c = a.drawing ? structuredClone(a.drawing) : null, s = d.querySelector("#spice-layout-report");
  if (s) {
    const l = JSON.parse(s.textContent), u = (f) => o.ids.get(f) || f;
    l.mirroredTransistors = (l.mirroredTransistors || []).map(u), l.orientationDevicesTested = (l.orientationDevicesTested || []).map(u), l.recognizedMotifs = ut(l.recognizedMotifs || [], u, (f) => o.bits.get(f) ?? f), l.inputAttachments = (l.inputAttachments || []).map(u), l.mirroredInputPorts = (l.mirroredInputPorts || []).map(u);
    for (const f of [...l.flippedPairs || [], ...l.pairOrientationTrials || []]) f.members = f.members.map(u);
    for (const f of l.pairCompactions || [])
      f.members = f.members.map(u), f.moved = u(f.moved);
    for (const f of l.pairConstraints || []) f.members = f.members.map(u);
    for (const f of l.pairProximity || []) f.members = f.members.map(u);
    for (const f of l.motifMeasurements || [])
      f.members = f.members.map(u), f.interlopers && (f.interlopers = f.interlopers.map(u));
    for (const f of l.voltageRails || []) f.bit !== void 0 && (f.bit = o.bits.get(f.bit) ?? f.bit);
    s.textContent = JSON.stringify(l);
  }
  if (c) {
    for (const l of c.components) {
      l.id = o.ids.get(l.id) || l.id;
      for (const u of l.ports) u.bit = o.bits.get(u.bit) ?? u.bit;
    }
    for (const l of c.segments) l.bit = o.bits.get(l.bit) ?? l.bit;
  }
  return { svg: new XMLSerializer().serializeToString(d.documentElement), drawing: c };
}
function jn(t, e) {
  const o = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, a) => {
    const d = (l, u) => {
      clearTimeout(s), o.terminate(), l ? a(Error(l)) : i(u);
    }, c = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => d("Layout timed out. Open a subcircuit sheet or collapse instances."), c);
    o.onmessage = ({ data: l }) => d(l.error, { svg: l.svg, drawing: l.drawing }), o.onerror = (l) => d(l.message || "Layout worker failed."), o.postMessage({ netlist: t, settings: e });
  });
}
const Vn = `* RLC low-pass filter
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
`, Qn = `* Voltage-divider biased common-emitter amplifier.
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
`, Fn = `* Common-collector voltage follower; independently chosen example values.
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
`, Gn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, Hn = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
  filter: { source: Vn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Qn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: Fn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Gn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Hn, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Wn(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Nt(t) {
  return Wn(await t.arrayBuffer());
}
const Ut = [
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
].flat(), ft = "#292b29", ze = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Ut[e * 9 + t]))])], Ct = (t) => /^#[\da-f]{6}$/i.test(t), St = "spice-node-colors-v1";
function qn(t) {
  let e = 2166136261;
  for (let o = 0; o < t.length; o++) e = Math.imul(e ^ t.charCodeAt(o), 16777619);
  return t.length + ":" + (e >>> 0);
}
class zn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const o = qn(e);
    o !== this.sourceId && (this.sourceId = o, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, ze[this.assigned.size % ze.length]), this.assigned.get(e)) : ft;
  }
  set(e, o) {
    if (!Ct(o)) throw Error("Invalid node color.");
    for (const i of e) this.manual.set(i, o.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const o of ["manual", "assigned"]) this[o] = new Map((Array.isArray(e[o]) ? e[o] : []).filter((i) => Array.isArray(i) && typeof i[0] == "string" && Ct(i[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Xn(t, e, o) {
  const i = new Map(e.map((a) => [a.name, o.color(a.name)]));
  for (const a of t.children) if (["line", "path", "polyline", "circle"].includes(a.localName) && a.hasAttribute("data-net")) {
    const d = i.get(a.getAttribute("data-net"));
    if (!d) continue;
    a.style.setProperty("stroke", d, "important"), a.localName === "circle" && a.style.setProperty("fill", d, "important");
  }
}
function $n(t, e) {
  const o = new zn(), i = /* @__PURE__ */ new Set();
  let a = [], d = !1;
  try {
    o.restore(JSON.parse(sessionStorage.getItem(St) || "null"));
  } catch {
  }
  const c = () => {
    try {
      sessionStorage.setItem(St, JSON.stringify(o.snapshot()));
    } catch {
    }
  }, s = () => {
    const p = t("node-search").value.trim().toLowerCase();
    return a.filter((m) => !p || [m.name, m.displayName, ...m.terminals.map((y) => y.component + "." + y.pin)].some((y) => y.toLowerCase().includes(p)));
  };
  function l() {
    const p = s(), m = p.filter((y) => i.has(y.name)).length;
    t("node-count").textContent = `${p.length} / ${a.length} nodes · ${i.size} selected`, t("node-all").checked = !!p.length && m === p.length, t("node-all").indeterminate = m > 0 && m < p.length, t("node-auto").checked = o.auto;
    for (const y of ["node-apply", "node-clear"]) t(y).disabled = !d || !i.size;
    t("node-all").disabled = !d || !p.length;
  }
  function u() {
    t("nets").replaceChildren(...s().map((p) => {
      const m = document.createElement("tr");
      m.dataset.node = p.name;
      const y = document.createElement("td"), E = document.createElement("input");
      E.type = "checkbox", E.checked = i.has(p.name), E.disabled = !d, E.setAttribute("aria-label", "Select node " + p.displayName), E.onchange = () => {
        E.checked ? i.add(p.name) : i.delete(p.name), l();
      }, y.append(E);
      const _ = document.createElement("td");
      _.textContent = p.displayName;
      const w = document.createElement("td"), x = document.createElement("input");
      x.type = "color", x.value = o.color(p.name), x.disabled = !d, x.setAttribute("aria-label", "Wire color for " + p.displayName), x.onchange = () => {
        o.set([p.name], x.value), f();
      }, w.append(x);
      const S = document.createElement("td");
      return S.textContent = p.terminals.map((C) => C.component + "." + C.pin).join(", "), m.append(y, _, w, S), m;
    })), l();
  }
  function f() {
    for (const p of a) o.color(p.name);
    u(), c(), e(o, a);
  }
  t("node-search").oninput = u, t("node-all").onchange = () => {
    for (const p of s()) t("node-all").checked ? i.add(p.name) : i.delete(p.name);
    u();
  }, t("node-auto").onchange = () => {
    o.auto = t("node-auto").checked, f();
  }, t("node-apply").onclick = () => {
    o.set(i, t("node-color").value), f();
  }, t("node-clear").onclick = () => {
    o.set(i, ft), f();
  }, t("node-reset").onclick = () => {
    o.reset(), f();
  }, t("node-swatches").replaceChildren(...Ut.map((p) => {
    const m = document.createElement("button");
    return m.type = "button", m.style.backgroundColor = p, m.title = p, m.setAttribute("aria-label", "Apply palette color " + p), m.onclick = () => {
      i.size && (t("node-color").value = p, o.set(i, p), f());
    }, m;
  }));
  function b(p) {
    d = p;
    for (const m of t("node-panel").querySelectorAll("input,button")) m.disabled = !d;
    l();
  }
  return { snapshot: () => o.snapshot(), restore(p) {
    o.restore(p), i.clear(), f();
  }, setCircuit(p, m) {
    const y = o.sourceId;
    o.setSource(m), y !== o.sourceId && i.clear(), a = Object.values(p?.nodes || {});
    const E = new Set(a.map((_) => _.name));
    for (const _ of i) E.has(_) || i.delete(_);
    for (const _ of a) o.color(_.name);
    d = !!p, u(), b(d), c(), e(o, a);
  }, setEnabled: b };
}
function Yn(t) {
  const e = (M) => t.querySelector("#spice-" + M), o = new AbortController(), i = o.signal, a = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, d = Object.fromEntries(Object.keys(a).map((M) => [M, t.querySelector(`[data-window-handle="${M}"]`)])), c = { editor: !0, details: !0, info: !0 }, s = { editor: !0, details: !0, info: !0 }, l = [], u = { editor: {}, details: {}, info: {} }, f = [];
  let b = !1, p = !1, m = null, y = null, E = null, _ = null;
  function w(M, O) {
    s[M] = O, a[M].dataset.pinned = String(O);
    const q = e("pin-" + M), $ = { editor: "netlist", details: "details", info: "messages" }[M], K = M === "info" ? "bottom edge" : M === "details" ? "lower left" : "left edge", A = O ? `Unpin ${$} from ${K}` : `Pin ${$} to ${K}`;
    if (q.setAttribute("aria-pressed", String(O)), q.setAttribute("aria-label", A), q.title = A, O) for (const D of ["left", "top", "right", "bottom", "width", "height"]) a[M].style.removeProperty(D);
    b && requestAnimationFrame(g);
  }
  for (const M of Object.keys(a)) w(M, !0);
  const x = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: b, panels: { ...c } } })), S = (M, O, q, $ = {}) => M.addEventListener(O, q, { ...$, signal: i });
  function C(M, O) {
    c[M] = O, a[M].hidden = b && !O, requestAnimationFrame(g), x();
  }
  function T(M, O = e("details-content")) {
    const q = document.createComment("workspace return");
    M.before(q), l.push({ node: M, anchor: q }), O === e("details-content") ? O.prepend(M) : O.append(M);
  }
  function I(M) {
    const O = M.getBoundingClientRect(), q = t.getBoundingClientRect();
    return { x: O.left - q.left, y: O.top - q.top, w: O.width, h: O.height, width: q.width, height: q.height };
  }
  function L(M, O, q) {
    const $ = I(M), K = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, A = Math.max(8, Math.min(O, $.width - $.w - 8)), D = Math.max(8, Math.min(K, $.height - $.h - 8)), G = Math.max(D, Math.min(q, $.height - $.h - 8));
    M.style.left = Math.round(A) + "px", M.style.top = Math.round(G) + "px", M.style.right = "auto", M.style.bottom = "auto";
  }
  function P() {
    if (!b || !s.info || a.info.hidden) return;
    const M = t.getBoundingClientRect(), O = M.width <= 600 ? 8 : 12, q = M.width <= 600 ? O : Math.max(O, ...["editor", "details"].filter((A) => s[A] && !a[A].hidden).map((A) => a[A].getBoundingClientRect().right - M.left + 12)), $ = Math.min(q, Math.max(O, M.width - 160 - O)), K = a.info;
    for (const [A, D] of Object.entries({ left: Math.round($) + "px", right: O + "px", width: "auto" })) K.style[A] !== D && (K.style[A] = D);
  }
  function g() {
    if (b) {
      P();
      for (const [M, O] of Object.entries(a)) if (!O.hidden && !s[M]) {
        const q = I(O);
        L(O, q.x, q.y);
      }
    }
  }
  function h() {
    for (const M of Object.values(a))
      for (const O of ["left", "top", "right", "bottom", "width", "height", "z-index"]) M.style.removeProperty(O);
    for (const M of Object.keys(a))
      w(M, !0), C(M, !0);
    requestAnimationFrame(g);
  }
  function U() {
    if (b) return;
    b = !0, m = document.activeElement, y = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, _ = document.createComment("workspace mount"), t.before(_), document.body.append(t);
    for (const O of document.body.children) O !== t && (f.push({ node: O, inert: O.inert }), O.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const O of Object.keys(a))
      u[O].base = a[O].style.cssText, u[O].floating && (a[O].style.cssText = u[O].floating), a[O].setAttribute("role", "dialog"), a[O].setAttribute("aria-modal", "false"), a[O].setAttribute("aria-labelledby", "spice-" + O + "-title"), d[O].tabIndex = 0, d[O].title = "Drag to move; arrow keys move the window", C(O, c[O]);
    for (const O of ["selection-actions", "selection", "hierarchy-panel"]) T(e(O));
    const M = e("workspace-strip");
    for (const O of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (M.childElementCount) {
        const q = document.createElement("span");
        q.className = "spice-tool-divider", q.setAttribute("role", "separator"), q.setAttribute("aria-orientation", "vertical"), M.append(q);
      }
      T(O === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(O), M);
    }
    requestAnimationFrame(g), e("exit-fullscreen").focus({ preventScroll: !0 }), x();
  }
  function W() {
    if (b) {
      b = !1, E = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: M, anchor: O } of l.splice(0))
        O.before(M), O.remove();
      e("workspace-strip").replaceChildren();
      for (const M of Object.keys(a)) {
        u[M].floating = a[M].style.cssText, a[M].style.cssText = u[M].base, a[M].hidden = !1;
        for (const O of ["role", "aria-modal", "aria-labelledby"]) a[M].removeAttribute(O);
        d[M].removeAttribute("tabindex"), d[M].removeAttribute("title");
      }
      _ && (_.before(t), _.remove(), _ = null);
      for (const { node: M, inert: O } of f.splice(0)) M.inert = O;
      y && (document.documentElement.style.overflow = y.html, document.body.style.overflow = y.body, window.scrollTo(y.x, y.y)), m?.focus?.({ preventScroll: !0 }), x();
    }
  }
  async function X() {
    U(), t.dataset.nativeFullscreen = "false";
  }
  async function Y() {
    if (p = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        p = !0;
        return;
      }
    W();
  }
  S(e("fullscreen"), "click", () => b ? Y() : X()), S(e("exit-fullscreen"), "click", Y), S(e("reset-windows"), "click", h);
  for (const M of Object.keys(a)) {
    S(e("pin-" + M), "click", () => {
      const $ = I(a[M]);
      w(M, !s[M]), s[M] || (a[M].style.width = $.w + "px", a[M].style.height = $.h + "px", L(a[M], $.x, $.y)), x();
    }), S(e("close-" + M), "click", () => {
      C(M, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), S(a[M], "pointerdown", () => {
      if (b) {
        for (const $ of Object.values(a)) $.style.zIndex = "20";
        a[M].style.zIndex = "30";
      }
    }, { capture: !0 });
    const O = d[M];
    S(O, "pointerdown", ($) => {
      if (!b || $.button !== 0 || $.target.closest("button,input,select,textarea,a,label")) return;
      $.preventDefault();
      const K = I(a[M]);
      w(M, !1), a[M].style.width = K.w + "px", a[M].style.height = K.h + "px", L(a[M], K.x, K.y), E = { id: M, pointer: $.pointerId, x: $.clientX, y: $.clientY, left: K.x, top: K.y }, O.setPointerCapture($.pointerId);
    }), S(O, "pointermove", ($) => {
      E?.id === M && E.pointer === $.pointerId && L(a[M], E.left + $.clientX - E.x, E.top + $.clientY - E.y);
    });
    const q = () => {
      E = null;
    };
    S(O, "pointerup", q), S(O, "pointercancel", q), S(O, "lostpointercapture", q), S(O, "keydown", ($) => {
      if (!b || $.target !== O || !$.key.startsWith("Arrow")) return;
      $.preventDefault();
      const K = I(a[M]), A = $.shiftKey ? 32 : 8;
      w(M, !1), a[M].style.width = K.w + "px", a[M].style.height = K.h + "px", L(a[M], K.x + ({ ArrowLeft: -A, ArrowRight: A }[$.key] || 0), K.y + ({ ArrowUp: -A, ArrowDown: A }[$.key] || 0));
    });
  }
  S(document, "fullscreenchange", () => {
    b && p && document.fullscreenElement !== t && (p = !1, W());
  }), S(document, "keydown", (M) => {
    b && M.altKey && M.key === "Escape" && (M.preventDefault(), M.stopImmediatePropagation(), Y());
  }, { capture: !0 }), S(window, "resize", g);
  const J = new ResizeObserver(g);
  for (const M of Object.values(a)) J.observe(M);
  return { enter: X, exit: Y, showPanel: C, reset: h, destroy() {
    Y(), o.abort(), J.disconnect();
  } };
}
const ce = 1e-3, ae = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ue = (t, e) => Math.abs(t - e) < ce, ve = (t, e) => ue(e.a.x, e.b.x) ? ue(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - ce && t.y <= Math.max(e.a.y, e.b.y) + ce : ue(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - ce && t.x <= Math.max(e.a.x, e.b.x) + ce, Kn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Zn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + ce && Math.min(t.a.x, t.b.x) < e.x + e.width - ce && Math.max(t.a.y, t.b.y) > e.y + ce && Math.min(t.a.y, t.b.y) < e.y + e.height - ce;
function Ze(t) {
  const e = [];
  for (const o of t)
    if (!(e.length && ae(e.at(-1)) === ae(o))) {
      for (; e.length > 1 && (ue(e.at(-2).x, e.at(-1).x) && ue(e.at(-1).x, o.x) || ue(e.at(-2).y, e.at(-1).y) && ue(e.at(-1).y, o.y)); ) e.pop();
      e.push({ ...o });
    }
  return e;
}
class Bt {
  constructor(e, { step: o = 8, segments: i = e.segments } = {}) {
    this.step = o, this.components = structuredClone(e.components), this.segments = structuredClone(i), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
  }
  pins() {
    return this.pinCache || (this.pinCache = this.components.flatMap((e) => e.ports.map((o) => ({ ...o, owner: e.id, id: e.id + "." + o.pin }))));
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
    return ue(e.x / this.step, Math.round(e.x / this.step)) && ue(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, o) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !ue(e.a.x, e.b.x) && !ue(e.a.y, e.b.y)) return !1;
    const i = this.pins();
    if (i.some((a) => a.bit !== o && ve(a, e)) || this.segments.some((a) => a.bit !== o && (ve(e.a, a) || ve(e.b, a) || ve(a.a, e) || ve(a.b, e)))) return !1;
    for (const a of this.components) if (Zn(e, a) && !i.filter((c) => c.owner === a.id && c.bit === o).some((c) => c.side === "NORTH" ? ue(e.a.x, c.x) && ue(e.b.x, c.x) && Math.max(e.a.y, e.b.y) <= c.y + ce : c.side === "SOUTH" ? ue(e.a.x, c.x) && ue(e.b.x, c.x) && Math.min(e.a.y, e.b.y) >= c.y - ce : c.side === "WEST" ? ue(e.a.y, c.y) && ue(e.b.y, c.y) && Math.max(e.a.x, e.b.x) <= c.x + ce : c.side === "EAST" ? ue(e.a.y, c.y) && ue(e.b.y, c.y) && Math.min(e.a.x, e.b.x) >= c.x - ce : !1))
      return !1;
    return !0;
  }
  addPath(e, o) {
    const i = Ze(o), a = i.slice(1).map((d, c) => ({ bit: e, a: i[c], b: d })).filter((d) => Kn(d) > ce);
    if (!a.length) return !1;
    if (a.some((d) => !this.validSegment(d, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...a), !0;
  }
  move(e, o, i) {
    if (o = Math.round(o / this.step) * this.step, i = Math.round(i / this.step) * this.step, !o && !i) return;
    const a = this.snapshot(), d = this.components.find((l) => l.id === e);
    if (!d) return;
    const c = d.ports.map((l) => ({ ...l }));
    this.segments = this.segments.filter((l) => !c.some((u) => u.bit === l.bit && (ae(u) === ae(l.a) || ae(u) === ae(l.b)))), d.x += o, d.y += i;
    for (const l of d.ports)
      l.x += o, l.y += i;
    if (this.pinCache = null, this.components.some((l) => l !== d && d.x < l.x + l.width - ce && d.x + d.width > l.x + ce && d.y < l.y + l.height - ce && d.y + d.height > l.y + ce) || this.segments.some((l) => !this.validSegment(l, l.bit)) || d.ports.some((l) => this.pins().some((u) => u.owner !== e && u.bit !== l.bit && ae(u) === ae(l))))
      throw this.restore(a), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(a);
  }
  moveMany(e) {
    const o = new Map(e.map((l) => [l.id, { dx: Math.round(l.dx / this.step) * this.step, dy: Math.round(l.dy / this.step) * this.step }]).filter(([, l]) => l.dx || l.dy)), i = this.components.filter((l) => o.has(l.id));
    if (!i.length) return !1;
    const a = this.snapshot(), d = i.flatMap((l) => l.ports);
    this.segments = this.segments.filter((l) => !d.some((u) => u.bit === l.bit && ve(u, l)));
    for (const l of i) {
      const u = o.get(l.id);
      l.x += u.dx, l.y += u.dy;
      for (const f of l.ports)
        f.x += u.dx, f.y += u.dy;
    }
    this.pinCache = null, this.cache = null;
    const c = this.pins();
    if (i.some((l) => this.components.some((u) => u !== l && l.x < u.x + u.width - ce && l.x + l.width > u.x + ce && l.y < u.y + u.height - ce && l.y + l.height > u.y + ce)) || c.some((l) => !this.onGrid(l) || c.some((u) => u.owner !== l.owner && u.bit !== l.bit && ae(u) === ae(l))) || this.segments.some((l) => !this.validSegment(l, l.bit)))
      throw this.restore(a), Error("Arrangement blocked: a component or another node occupies the target position.");
    return this.remember(a), !0;
  }
  transform(e, o) {
    const i = this.components.find((p) => p.id === e);
    if (!i) return;
    const a = this.snapshot(), d = i.width, c = i.height, s = o === "rotate" ? [0, 1, -1, 0, c, 0] : o === "mirror-x" ? [1, 0, 0, -1, 0, c] : o === "mirror-y" ? [-1, 0, 0, 1, d, 0] : null;
    if (!s) throw Error("Unknown transform.");
    const l = i.ports.map((p) => ({ ...p })), u = (p) => ({ x: s[0] * p.x + s[2] * p.y + s[4], y: s[1] * p.x + s[3] * p.y + s[5] });
    this.segments = this.segments.filter((p) => !l.some((m) => m.bit === p.bit && (ae(m) === ae(p.a) || ae(m) === ae(p.b))));
    const f = o === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : o === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const p of i.ports) {
      const m = u({ x: p.x - i.x, y: p.y - i.y });
      p.x = i.x + m.x, p.y = i.y + m.y, p.side = f[p.side] || p.side;
    }
    const b = i.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (i.editorMatrix = [s[0] * b[0] + s[2] * b[1], s[1] * b[0] + s[3] * b[1], s[0] * b[2] + s[2] * b[3], s[1] * b[2] + s[3] * b[3], s[0] * b[4] + s[2] * b[5] + s[4], s[1] * b[4] + s[3] * b[5] + s[5]], o === "rotate" && (i.width = c, i.height = d), this.pinCache = null, i.ports.some((p) => !this.onGrid(p)) || this.components.some((p) => p !== i && i.x < p.x + p.width - ce && i.x + i.width > p.x + ce && i.y < p.y + p.height - ce && i.y + i.height > p.y + ce) || this.segments.some((p) => !this.validSegment(p, p.bit)) || i.ports.some((p) => this.pins().some((m) => m.owner !== e && m.bit !== p.bit && ae(m) === ae(p))))
      throw this.restore(a), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(a);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const i of this.pins())
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).pins.push(i);
    for (const i of this.segments)
      e.has(i.bit) || e.set(i.bit, { pins: [], segments: [] }), e.get(i.bit).segments.push(i);
    const o = [];
    for (const [i, a] of e) {
      const d = /* @__PURE__ */ new Map(), c = (f) => {
        d.has(ae(f)) || d.set(ae(f), f);
      };
      a.pins.forEach(c);
      for (const f of a.segments)
        c(f.a), c(f.b);
      for (let f = 0; f < a.segments.length; f++) for (let b = f + 1; b < a.segments.length; b++) {
        const p = a.segments[f], m = a.segments[b];
        if (ue(p.a.x, p.b.x) === ue(m.a.x, m.b.x)) continue;
        const y = ue(p.a.x, p.b.x) ? p : m, E = y === p ? m : p, _ = { x: y.a.x, y: E.a.y };
        ve(_, y) && ve(_, E) && c(_);
      }
      const s = new Map([...d.keys()].map((f) => [f, f])), l = (f) => {
        let b = f;
        for (; s.get(b) !== b; ) b = s.get(b);
        for (; f !== b; ) {
          const p = s.get(f);
          s.set(f, b), f = p;
        }
        return b;
      };
      for (const f of a.segments) {
        const b = [...d.values()].filter((p) => ve(p, f));
        for (const p of b.slice(1)) s.set(l(ae(p)), l(ae(b[0])));
      }
      const u = /* @__PURE__ */ new Map();
      for (const f of a.pins) {
        const b = l(ae(f));
        u.has(b) || u.set(b, { pins: [], points: [] }), u.get(b).pins.push(f);
      }
      for (const f of d.values()) {
        const b = l(ae(f));
        u.has(b) && u.get(b).points.push(f);
      }
      o.push({ bit: i, islands: [...u.values()], points: [...d.values()], segments: a.segments });
    }
    return this.cache = o, o;
  }
  airwires() {
    const e = [];
    for (const { bit: o, islands: i } of this.connectivity()) {
      if (i.length < 2) continue;
      const a = /* @__PURE__ */ new Set([0]);
      for (; a.size < i.length; ) {
        let d;
        for (const c of a) for (let s = 0; s < i.length; s++) if (!a.has(s)) for (const l of i[c].points) for (const u of i[s].points) {
          const f = (l.x - u.x) ** 2 + (l.y - u.y) ** 2;
          (!d || f < d.d) && (d = { bit: o, a: l, b: u, d: f, j: s });
        }
        e.push(d), a.add(d.j);
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
    const i = Math.min(...e), a = Math.min(...o);
    return { x: i, y: a, w: Math.max(...e) - i, h: Math.max(...o) - a };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((o) => !o.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, o, i) {
    if (!this.onGrid(o) || !this.onGrid(i)) return null;
    const a = (T) => T.slice(1).every((I, L) => this.validSegment({ a: T[L], b: I }, e));
    for (const T of [[o, i], [o, { x: i.x, y: o.y }, i], [o, { x: o.x, y: i.y }, i]]) {
      const I = Ze(T);
      if (a(I)) return I;
    }
    const d = this.step, c = this.bounds(), s = Math.floor(Math.min(c.x, o.x, i.x) / d) - 5, l = Math.ceil(Math.max(c.x + c.w, o.x, i.x) / d) + 5, u = Math.floor(Math.min(c.y, o.y, i.y) / d) - 5, f = Math.ceil(Math.max(c.y + c.h, o.y, i.y) / d) + 5, b = { x: o.x / d, y: o.y / d, dir: -1, cost: 0, key: o.x / d + "," + o.y / d + ",-1" }, p = [b], m = /* @__PURE__ */ new Map([[b.key, 0]]), y = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map([[b.key, b]]), _ = [[1, 0], [-1, 0], [0, 1], [0, -1]], w = (T) => Math.abs(T.x - i.x / d) + Math.abs(T.y - i.y / d);
    let x = null, S = 0;
    for (; p.length && S++ < 3e4; ) {
      let T = 0;
      for (let L = 1; L < p.length; L++) p[L].cost + w(p[L]) < p[T].cost + w(p[T]) && (T = L);
      const I = p.splice(T, 1)[0];
      if (I.cost === m.get(I.key)) {
        if (I.x === i.x / d && I.y === i.y / d) {
          x = I;
          break;
        }
        for (let L = 0; L < 4; L++) {
          const P = I.x + _[L][0], g = I.y + _[L][1];
          if (P < s || P > l || g < u || g > f) continue;
          const h = { x: P, y: g, dir: L, key: P + "," + g + "," + L, cost: I.cost + 1 + (I.dir !== -1 && I.dir !== L ? 3 : 0) };
          h.cost >= (m.get(h.key) ?? 1 / 0) || !this.validSegment({ a: { x: I.x * d, y: I.y * d }, b: { x: P * d, y: g * d } }, e) || (m.set(h.key, h.cost), y.set(h.key, I.key), E.set(h.key, h), p.push(h));
        }
      }
    }
    if (!x) return null;
    const C = [];
    for (let T = x; T; T = E.get(y.get(T.key))) C.push({ x: T.x * d, y: T.y * d });
    return Ze(C.reverse());
  }
  async autoRoute(e = () => !1) {
    const o = this.snapshot();
    if (this.remember(o), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const i = /* @__PURE__ */ new Set();
    let a = 0;
    for (; !e() && a++ < Math.max(20, this.pins().length * 2); ) {
      const d = this.airwires().find((s) => !i.has(s.bit + ":" + ae(s.a) + ":" + ae(s.b)));
      if (!d) break;
      const c = this.findPath(d.bit, d.a, d.b);
      c ? (this.segments.push(...c.slice(1).map((s, l) => ({ bit: d.bit, a: c[l], b: s }))), this.cache = null) : i.add(d.bit + ":" + ae(d.a) + ":" + ae(d.b)), a % 3 === 0 && await new Promise((s) => setTimeout(s, 0));
    }
    this.redoStack = [];
  }
}
const jt = "spice-viewer-project", Vt = 1, Qt = 32 * 1024 * 1024, ie = (t) => {
  throw Error("Invalid project: " + t);
}, Ee = (t) => t && typeof t == "object" && !Array.isArray(t), Te = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, De = (t) => Ee(t) && Te(t.x) && Te(t.y), Ce = (t, e) => Math.abs(t - e) < 1e-3, ct = (t, e, o) => JSON.stringify([t, e, { font: o.font, fontSize: o.fontSize, color: o.color, gridSize: o.gridSize, detailed: o.detailed, conventional: o.conventional }]);
function It(t) {
  return Ee(t) && De(t) && Te(t.w) && Te(t.h) && t.w > 0 && t.h > 0;
}
function Tt(t) {
  (!Ee(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && ie("unsupported drawing settings.");
}
function Ft(t) {
  new TextEncoder().encode(t).length > Qt && ie("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    ie("expected a JSON project file.");
  }
  (!Ee(e) || e.format !== jt) && ie("unrecognized file format."), e.version !== Vt && ie("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Be && ie("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && ie("missing netlist or sheet."), (!Ee(e.libraries) || Object.entries(e.libraries).some(([i, a]) => !i || ["__proto__", "constructor", "prototype"].includes(i) || typeof a != "string")) && ie("invalid libraries."), Tt(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((i) => typeof e[i] != "boolean") || !It(e.view)) && ie("invalid display settings."), (!Ee(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((i) => !Array.isArray(e.colors[i]) || e.colors[i].some((a) => !Array.isArray(a) || a.length !== 2 || typeof a[0] != "string" || !/^#[\da-f]{6}$/i.test(a[1])))) && ie("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && ie("invalid saved sheets.");
  const o = /* @__PURE__ */ new Set();
  for (const i of e.sheets) {
    (!Ee(i) || typeof i.scope != "string" || typeof i.topology != "string") && ie("invalid sheet identity."), Tt(i.settings);
    const a = ct(i.scope, i.topology, i.settings);
    o.has(a) && ie("duplicate sheet."), o.add(a), (i.settings.gridSize !== 4 || !i.settings.conventional) && ie("saved manual scenes require the fixed 4-unit grid."), i.view !== void 0 && !It(i.view) && ie("invalid sheet viewport."), Gt(i.snapshot);
  }
  return e;
}
function Jn(t) {
  const e = { ...t, format: jt, version: Vt, layoutRulesVersion: Be, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, o = JSON.stringify(e, null, 2);
  return Ft(o), o;
}
function Gt(t) {
  (!Ee(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && ie("invalid scene size.");
  const e = /* @__PURE__ */ new Set();
  for (const o of t.components) {
    (!Ee(o) || typeof o.id != "string" || e.has(o.id) || !De(o) || !Te(o.width) || !Te(o.height) || o.width < 0 || o.height < 0 || !Array.isArray(o.ports) || o.ports.length > 2e3) && ie("invalid component geometry."), e.add(o.id);
    const i = /* @__PURE__ */ new Set();
    for (const a of o.ports)
      (!De(a) || typeof a.pin != "string" || i.has(a.pin) || !Number.isInteger(a.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(a.side)) && ie("invalid pin."), i.add(a.pin);
    o.editorMatrix !== void 0 && (!Array.isArray(o.editorMatrix) || o.editorMatrix.length !== 6 || !o.editorMatrix.every(Te)) && ie("invalid symbol transform.");
  }
  for (const o of t.segments) (!Ee(o) || !Number.isInteger(o.bit) || !De(o.a) || !De(o.b) || !Ce(o.a.x, o.b.x) && !Ce(o.a.y, o.b.y)) && ie("wire must be orthogonal.");
}
function Ht(t, e, o) {
  Gt(e);
  const i = new Map(t.components.map((l) => [l.id, l]));
  i.size !== e.components.length && ie("component count changed.");
  const a = e.components.map((l) => {
    const u = i.get(l.id);
    (!u || !!u.decoration != !!l.decoration || u.ports.length !== l.ports.length) && ie("component identity changed: " + l.id);
    const f = l.editorMatrix || [1, 0, 0, 1, 0, 0], [b, p, m, y] = f;
    (![b, p, m, y].every((w) => [-1, 0, 1].includes(w)) || b * b + p * p !== 1 || m * m + y * y !== 1 || b * m + p * y !== 0) && ie("symbol transform must be a rotation or mirror.");
    const E = [[0, 0], [u.width, 0], [0, u.height], [u.width, u.height]].map(([w, x]) => ({ x: b * w + m * x + f[4], y: p * w + y * x + f[5] }));
    (!Ce(Math.min(...E.map((w) => w.x)), 0) || !Ce(Math.min(...E.map((w) => w.y)), 0) || !Ce(Math.max(...E.map((w) => w.x)), l.width) || !Ce(Math.max(...E.map((w) => w.y)), l.height)) && ie("symbol dimensions changed: " + l.id);
    const _ = l.ports.map((w) => {
      const x = u.ports.find((T) => T.pin === w.pin);
      (!x || x.bit !== w.bit || !Ce(w.x, l.x + b * (x.x - u.x) + m * (x.y - u.y) + f[4]) || !Ce(w.y, l.y + p * (x.x - u.x) + y * (x.y - u.y) + f[5])) && ie("pin connectivity or position changed: " + l.id + "." + w.pin);
      const S = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[x.side], C = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, T]) => T[0] === b * S[0] + m * S[1] && T[1] === p * S[0] + y * S[1])?.[0];
      return w.side !== C && ie("pin direction changed."), { ...x, x: w.x, y: w.y, side: C };
    });
    return { ...u, x: l.x, y: l.y, width: l.width, height: l.height, ports: _, ...l.editorMatrix ? { editorMatrix: [...f] } : {} };
  }), d = new Bt({ ...t, components: a, segments: e.segments }, { step: o });
  for (let l = 0; l < a.length; l++) for (let u = l + 1; u < a.length; u++) {
    const f = a[l], b = a[u];
    f.x < b.x + b.width - 1e-3 && f.x + f.width > b.x + 1e-3 && f.y < b.y + b.height - 1e-3 && f.y + f.height > b.y + 1e-3 && ie("component symbols overlap.");
  }
  const c = new Set(d.pins().map((l) => l.bit));
  (d.pins().some((l) => !d.onGrid(l)) || d.segments.some((l) => !c.has(l.bit) || !d.validSegment(l, l.bit))) && ie("off-grid wire, symbol collision or short circuit.");
  const s = /* @__PURE__ */ new Map();
  for (const l of d.pins()) {
    const u = l.x + "," + l.y;
    s.has(u) && s.get(u) !== l.bit && ie("different nodes share a pin position."), s.set(u, l.bit);
  }
  return d.snapshot();
}
const pt = (t) => !t.decoration || t.selectable === !0;
function eo(t, e, o) {
  const i = Math.min(e.x, o.x), a = Math.max(e.x, o.x), d = Math.min(e.y, o.y), c = Math.max(e.y, o.y), s = o.x < e.x, l = 1e-3;
  return t.filter((u) => pt(u) && (s ? u.x <= a + l && u.x + u.width >= i - l && u.y <= c + l && u.y + u.height >= d - l : u.x >= i - l && u.x + u.width <= a + l && u.y >= d - l && u.y + u.height <= c + l)).map((u) => u.id);
}
function to(t, e, o, i) {
  const a = new Set(e), d = t.filter((_) => a.has(_.id) && pt(_)), c = o.startsWith("space-");
  if (d.length < (c ? 3 : 2)) throw Error(c ? "Select at least three components." : "Select at least two components.");
  const s = ["left", "right", "center-x", "space-x"].includes(o), l = ["top", "bottom", "center-y", "space-y"].includes(o);
  if (!s && !l) throw Error("Unknown arrangement.");
  const u = s ? "x" : "y", f = s ? "width" : "height", b = Math.min(...d.map((_) => _[u])), p = Math.max(...d.map((_) => _[u] + _[f])), m = /* @__PURE__ */ new Map();
  if (c) {
    const _ = [...d].sort((T, I) => T[u] - I[u] || T.id.localeCompare(I.id)), w = _.at(-1), x = w[u] + w[f] - _[0][u], S = (x - _.reduce((T, I) => T + I[f], 0)) / (d.length - 1);
    if (S < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let C = _[0][u];
    for (const T of _)
      m.set(T.id, C), C += T[f] + S;
  } else for (const _ of d) m.set(_.id, ["left", "top"].includes(o) ? b : ["right", "bottom"].includes(o) ? p - _[f] : (b + p - _[f]) / 2);
  let y = !1;
  return { moves: d.map((_) => {
    const w = m.get(_.id) - _[u], x = Math.round(w / i) * i;
    return Math.abs(x - w) > 1e-3 && (y = !0), { id: _.id, dx: s ? x : 0, dy: l ? x : 0 };
  }), rounded: y };
}
const no = "http://www.w3.org/2000/svg", fe = (t, e = {}) => {
  const o = document.createElementNS(no, t);
  for (const [i, a] of Object.entries(e)) o.setAttribute(i, a);
  return o;
}, oo = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Wt(t, e, o, i) {
  const a = structuredClone(e);
  for (const s of a.components) {
    const l = t.getElementById("cell_" + s.id);
    for (const u of s.ports) {
      const f = [...l.children].find((b) => b.getAttribute("s:pid") === u.pin);
      u.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[f?.getAttribute("s:position")] || u.side;
    }
  }
  for (const [s, l] of Object.entries(i.modules.circuit.cells)) if (l.attributes.name === "0") {
    const u = t.getElementById("cell_" + s), f = u?.transform.baseVal.consolidate().matrix;
    u && f && a.components.push({ id: s, decoration: !0, selectable: !0, x: f.e, y: f.f, width: +u.getAttribute("s:width"), height: +u.getAttribute("s:height"), ports: [...u.children].filter((b) => b.hasAttribute("s:pid")).map((b) => ({ pin: b.getAttribute("s:pid"), x: f.e + Number(b.getAttribute("s:x")), y: f.f + Number(b.getAttribute("s:y")), bit: l.connections[b.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const d = new Map(Object.values(o.nodes).map((s) => [s.name, s.bit])), c = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ bit: d.get(s.dataset.net), a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } }));
  return { ...a, segments: c };
}
function ro(t, e, { changed: o, inspect: i, getNetColor: a, report: d }) {
  let c = null, s = null, l = !1, u = !1, f = null, b = null, p = null, m = null, y = /* @__PURE__ */ new Set(), E = 0, _ = "", w = 8, x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
  const T = (A) => new DOMPoint(A.clientX, A.clientY).matrixTransform(s.getScreenCTM().inverse()), I = (A) => c.snap(T(A)), L = (A) => a?.(A) || ze[Number(A) % ze.length], P = (A, { severity: D = "info", log: G = !0 } = {}) => {
    e("editor-status").textContent = A, G && d?.({ message: A, severity: D, category: "Tools" });
  };
  function g() {
    return { unrouted: c?.airwires().length || 0, wires: c?.segments.length || 0, editing: l, routing: u, selectedComponents: [...y] };
  }
  function h() {
    const A = !!c;
    for (const D of ["interactive", "flywire", "auto-route"]) e(D).disabled = !s || u;
    e("edit-tool").disabled = !A || u;
    for (const D of document.querySelectorAll("[data-editor-mode]"))
      D.disabled = !s || u, D.setAttribute("aria-pressed", String(l && D.dataset.editorMode === e("edit-tool").value));
    for (const D of document.querySelectorAll("[data-editor-arrange]")) D.disabled = !l || !A || u || y.size < (D.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !A || u || !c.undoStack.length, e("wire-redo").disabled = !A || u || !c.redoStack.length, t.classList.toggle("spice-editing", l), t.dataset.toolMode = l ? e("edit-tool").value : "none";
  }
  function U(A, D) {
    const G = C.get(A.id);
    if (G && (D.replaceChildren(...G.children.map((F) => F.cloneNode(!0))), A.editorMatrix)) {
      const F = A.editorMatrix, te = fe("g", { transform: "matrix(" + F.join(" ") + ")", "data-editor-glyph": "true" });
      te.append(...D.childNodes);
      for (const Q of te.querySelectorAll("text")) Q.remove();
      D.append(te);
      for (const [Q, H] of G.labels.entries()) {
        const z = H.node.cloneNode(!0);
        z.removeAttribute("transform");
        let le = F[0] * H.x + F[2] * H.y + F[4], oe = F[1] * H.x + F[3] * H.y + F[5];
        if (A.ports.length === 2 && G.labels.length === 2) {
          const we = Math.abs(A.ports[0].y - A.ports[1].y) < 1e-3;
          le = we ? A.width / 2 : A.ports[0].x - A.x + 20, oe = we ? A.ports[0].y - A.y - 26 + Q * 16 : A.height / 2 - 8 + Q * 16, z.setAttribute("text-anchor", we ? "middle" : "start");
        }
        z.setAttribute("x", le), z.setAttribute("y", oe), D.append(z);
      }
    }
  }
  function W(A) {
    if (f = null, p = null, b = null, ["rotate", "mirror-x", "mirror-y"].includes(A) && y.size === 1) {
      try {
        c.transform([...y][0], A), O(), P(A + " applied to " + [...y][0] + ".");
      } catch (D) {
        P(D.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = A, c ? (O(), P("Tool: " + A + ".")) : h();
  }
  function X() {
    if (!c) return;
    const A = g();
    P(`${y.size ? y.size + " selected · " : ""}${A.unrouted} connection${A.unrouted === 1 ? "" : "s"} unrouted · ${A.wires} wire segments${u ? " · Auto-routing…" : ""}`, { log: !1 }), h(), o(c.drawing(), A, c.bounds()), S.set(_, c.snapshot());
  }
  function Y(A) {
    const D = s.querySelector("[data-airwires]");
    D ? s.insertBefore(A, D) : s.append(A);
  }
  function J() {
    if (s?.querySelector("[data-route-preview]")?.remove(), s?.querySelector("[data-route-guides]")?.remove(), !s) return;
    if (l && e("edit-tool").value === "route" && m) {
      const G = t.getBoundingClientRect(), F = s.getScreenCTM().inverse(), te = new DOMPoint(G.left, G.top).matrixTransform(F), Q = new DOMPoint(G.right, G.bottom).matrixTransform(F), H = fe("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      H.append(fe("line", { x1: te.x, y1: m.y, x2: Q.x, y2: m.y, "vector-effect": "non-scaling-stroke" }), fe("line", { x1: m.x, y1: te.y, x2: m.x, y2: Q.y, "vector-effect": "non-scaling-stroke" })), Y(H);
    }
    if (!f) return;
    const A = [...f.points];
    if (m) {
      const G = A.at(-1);
      A.push({ x: m.x, y: G.y }, m);
    }
    const D = fe("g", { "data-route-preview": "true", "data-waypoints": f.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    D.append(fe("polyline", { points: A.map((G) => G.x + "," + G.y).join(" "), fill: "none", stroke: L(f.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Y(D);
  }
  function M() {
    if (s?.querySelector("[data-selection-box]")?.remove(), !p || !s) return;
    const A = p.start, D = p.end, G = D.x < A.x;
    Y(fe("rect", { x: Math.min(A.x, D.x), y: Math.min(A.y, D.y), width: Math.abs(A.x - D.x), height: Math.abs(A.y - D.y), fill: G ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: G ? "#4c9675" : "#507d9c", "stroke-dasharray": G ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": G ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function O() {
    if (!s || !c) return;
    for (const Q of s.querySelectorAll("[data-editor-body-hit]")) Q.remove();
    for (const Q of [...s.children]) (Q.hasAttribute("data-editor-overlay") || Q.hasAttribute("data-airwires") || Q.hasAttribute("data-manual-state") || Q.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(Q.localName)) && Q.remove();
    for (const Q of c.components) {
      const H = s.getElementById("cell_" + Q.id);
      H && (H.style.removeProperty("opacity"), U(Q, H), H.setAttribute("s:width", Q.width), H.setAttribute("s:height", Q.height), H.setAttribute("transform", `translate(${Q.x},${Q.y})`), H.dataset.editorComponent = Q.id, l && H.prepend(fe("rect", { x: 0, y: 0, width: Q.width, height: Q.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const A = s.querySelector('g[id^="cell_"]'), D = fe("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), G = fe("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [Q, H] of c.segments.entries()) {
      const z = fe("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, class: "net_" + H.bit, "data-net": x.get(H.bit) || String(H.bit), "stroke-width": 1.4 });
      z.append(fe("title")), z.firstChild.textContent = "Node " + (x.get(H.bit) || H.bit), s.insertBefore(z, A), l && ["route", "erase"].includes(e("edit-tool").value) && D.append(fe("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, "data-editor-wire": Q, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const Q of c.connectivity()) for (const H of Q.points) {
      const z = /* @__PURE__ */ new Set();
      for (const le of Q.segments) ve(H, le) && (Math.min(le.a.x, le.b.x) < H.x - 1e-3 && z.add("w"), Math.max(le.a.x, le.b.x) > H.x + 1e-3 && z.add("e"), Math.min(le.a.y, le.b.y) < H.y - 1e-3 && z.add("n"), Math.max(le.a.y, le.b.y) > H.y + 1e-3 && z.add("s"));
      (z.size >= 3 || z.size >= 2 && Q.islands.some((le) => le.pins.some((oe) => oo(H, oe)))) && s.insertBefore(fe("circle", { cx: H.x, cy: H.y, r: 2, class: "net_" + Q.bit, "data-net": x.get(Q.bit) || String(Q.bit), fill: L(Q.bit) }), A);
    }
    if (l) {
      for (const Q of c.components.filter((H) => y.has(H.id))) D.append(fe("rect", { x: Q.x - 3, y: Q.y - 3, width: Q.width + 6, height: Q.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": Q.id }));
      for (const Q of c.pins()) {
        const H = fe("circle", { cx: Q.x, cy: Q.y, r: 3, "data-editor-pin": Q.id, "data-editor-bit": Q.bit, fill: "#fff", stroke: L(Q.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": Q.owner + " " + Q.pin }), z = fe("title");
        z.textContent = Q.id + " · " + (x.get(Q.bit) || Q.bit), H.append(z), G.append(H);
      }
      s.append(D, G);
    }
    J();
    const F = fe("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const Q of c.airwires()) F.append(fe("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, stroke: L(Q.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": Q.bit, "data-from-owner": Q.a.owner || "", "data-to-owner": Q.b.owner || "" }));
    s.append(F);
    const te = fe("metadata", { "data-manual-state": "true" });
    te.textContent = JSON.stringify({ version: 1, grid: w, unrouted: c.airwires().length, manual: !0 }), s.insertBefore(te, F), X();
  }
  function q(A, D) {
    if (!f) {
      f = { bit: D, points: [A], checkpoints: [] }, J(), P("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (D !== void 0 && f.bit !== D) {
      P("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const G = f.points.at(-1), F = c.findPath(f.bit, G, A);
    if (!F) {
      P("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (D === void 0) {
      F.length > 1 && (f.checkpoints.push(f.points.length), f.points.push(...F.slice(1))), J(), P("Waypoint " + f.checkpoints.length + " confirmed.");
      return;
    }
    try {
      c.addPath(D, [...f.points, ...F.slice(1)]), f = null, O(), P("Connection added.");
    } catch (te) {
      P(te.message, { severity: "error" });
    }
  }
  t.addEventListener("pointerdown", (A) => {
    if (!l || u || !c || !s || A.button !== 0 || A.shiftKey) return;
    const D = e("edit-tool").value, G = A.target.closest("[data-editor-pin]"), F = A.target.closest("[data-editor-wire]"), te = G && c.pins().find((z) => z.id === G.dataset.editorPin), Q = A.target.closest("[data-editor-component]") || te && s.getElementById("cell_" + te.owner), H = Q && c.components.find((z) => z.id === Q.dataset.editorComponent && pt(z));
    if (D === "box") {
      A.preventDefault(), A.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), p = { start: T(A), end: T(A), additive: A.ctrlKey || A.metaKey }, t.setPointerCapture(A.pointerId), M();
      return;
    }
    if (D === "route" || D === "erase") {
      if (A.preventDefault(), A.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), m = I(A), D === "erase") {
        F && (c.remove(+F.dataset.editorWire), O(), P("Wire segment erased."));
        return;
      }
      if (te) {
        q({ x: te.x, y: te.y }, te.bit);
        return;
      }
      if (F) {
        const z = c.segments[+F.dataset.editorWire], le = I(A);
        q(z.a.x === z.b.x ? { x: z.a.x, y: le.y } : { x: le.x, y: z.a.y }, z.bit);
        return;
      }
      f ? q(I(A)) : J();
      return;
    }
    if (!H) {
      y.size && (y.clear(), O());
      return;
    }
    if (A.preventDefault(), A.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), i?.(H.id, H), A.ctrlKey || A.metaKey) {
      y.has(H.id) ? y.delete(H.id) : y.add(H.id), O();
      return;
    }
    if ((D !== "move" || !y.has(H.id)) && (y = /* @__PURE__ */ new Set([H.id])), ["rotate", "mirror-x", "mirror-y"].includes(D)) {
      W(D);
      return;
    }
    if (O(), D === "move") {
      b = { entries: c.components.filter((z) => y.has(z.id)).map((z) => ({ n: z, element: s.getElementById("cell_" + z.id) })), start: T(A), dx: 0, dy: 0 };
      for (const z of b.entries) z.element.style.opacity = ".6";
      t.setPointerCapture(A.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (A) => {
    if (!(!l || !c || !s)) {
      if (m = I(A), p) {
        A.stopImmediatePropagation(), p.end = T(A), M();
        return;
      }
      if (b) {
        A.stopImmediatePropagation();
        const D = T(A), G = c.snap({ x: D.x - b.start.x, y: D.y - b.start.y });
        b.dx = G.x, b.dy = G.y;
        for (const { n: F, element: te } of b.entries) {
          te.setAttribute("transform", `translate(${F.x + G.x},${F.y + G.y})`);
          const Q = s.querySelector('[data-selected-component="' + CSS.escape(F.id) + '"]');
          Q && (Q.setAttribute("x", F.x + G.x - 3), Q.setAttribute("y", F.y + G.y - 3));
        }
        for (const F of s.querySelectorAll("[data-airwires] line"))
          y.has(F.dataset.fromOwner) && (F.setAttribute("x1", +F.getAttribute("x1") - Number(F.dataset.dx || 0) + G.x), F.setAttribute("y1", +F.getAttribute("y1") - Number(F.dataset.dy || 0) + G.y)), y.has(F.dataset.toOwner) && (F.setAttribute("x2", +F.getAttribute("x2") - Number(F.dataset.dx || 0) + G.x), F.setAttribute("y2", +F.getAttribute("y2") - Number(F.dataset.dy || 0) + G.y)), F.dataset.dx = G.x, F.dataset.dy = G.y;
        return;
      }
      e("edit-tool").value === "route" && J();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (A) => {
    if (!p && !b) return;
    if (A.preventDefault(), A.stopImmediatePropagation(), t.hasPointerCapture(A.pointerId) && t.releasePointerCapture(A.pointerId), p) {
      const G = p;
      p = null;
      const F = eo(c.components, G.start, T(A));
      y = G.additive ? /* @__PURE__ */ new Set([...y, ...F]) : new Set(F), O(), P(y.size + " symbol(s) selected.");
      return;
    }
    const D = b;
    b = null;
    for (const G of D.entries) G.element.style.opacity = "";
    try {
      const G = c.moveMany(D.entries.map(({ n: F }) => ({ id: F.id, dx: D.dx, dy: D.dy })));
      O(), G && P("Moved " + D.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (G) {
      O(), P(G.message, { severity: "error" });
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (b || p) && (b = null, p = null, O());
  }), t.addEventListener("pointerleave", () => {
    !b && !p && (m = null, J());
  }), t.addEventListener("wheel", (A) => {
    requestAnimationFrame(() => {
      l && c && s && e("edit-tool").value === "route" && (m = I(A), J());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (A) => {
    if (e("download-dialog").open || !l || !c || u || A.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(A.target)) return;
    const D = A.target.closest("[data-editor-pin]"), G = A.key.toLowerCase();
    if (D && e("edit-tool").value === "route" && (A.key === "Enter" || A.key === " ")) {
      A.preventDefault(), A.stopImmediatePropagation();
      const F = c.pins().find((te) => te.id === D.dataset.editorPin);
      q({ x: F.x, y: F.y }, F.bit);
      return;
    }
    if (A.key === "Backspace" && e("edit-tool").value === "route") {
      if (A.preventDefault(), A.stopImmediatePropagation(), f) {
        const F = f.checkpoints.pop();
        F === void 0 ? f = null : f.points.length = F, J(), P(f ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    A.key === "Escape" ? (A.preventDefault(), A.stopImmediatePropagation(), f = null, b = null, p = null, W("select")) : (A.ctrlKey || A.metaKey) && G === "z" ? (A.preventDefault(), A.stopImmediatePropagation(), A.shiftKey ? c.redo() : c.undo(), f = null, b = null, p = null, O(), P(A.shiftKey ? "Redo." : "Undo.")) : !A.ctrlKey && !A.metaKey && !A.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[G] && (A.preventDefault(), A.stopImmediatePropagation(), W({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[G]));
  }, { capture: !0 });
  function $(A) {
    if (!(!c || u)) {
      f = null, b = null, p = null, e("edit-tool").value = "select";
      try {
        const { moves: D, rounded: G } = to(c.components, y, A, w);
        c.moveMany(D), O(), P(`${y.size} components arranged.${G ? " Centers or gaps rounded to the " + w + "-unit pin grid." : ""} Detached connections remain flywires.`);
      } catch (D) {
        O(), P(D.message, { severity: "error" });
      }
    }
  }
  async function K() {
    if (!c || u) return;
    const A = E;
    u = !0, X(), P("Auto-routing remaining connections…");
    try {
      if (await c.autoRoute(() => A !== E), A === E) {
        f = null, u = !1, O();
        const D = c.airwires().length;
        P(D ? "Auto-routing finished: " + D + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: D ? "warning" : "info" });
      }
    } catch (D) {
      A === E && (u = !1, O(), P(D.message, { severity: "error" }));
    }
  }
  return {
    mount(A, D, G, F, te, { reset: Q = !1, scope: H = "" } = {}) {
      E++, u = !1, s = A, f = null, b = null, p = null, m = null, y.clear(), C = /* @__PURE__ */ new Map();
      for (const oe of s.querySelectorAll('g[id^="cell_"]')) {
        const we = oe.getCTM().inverse();
        C.set(oe.id.slice(5), { children: [...oe.childNodes].map((k) => k.cloneNode(!0)), labels: [...oe.querySelectorAll("text")].map((k) => {
          const r = new DOMPoint(+k.getAttribute("x") || 0, +k.getAttribute("y") || 0).matrixTransform(we.multiply(k.getCTM()));
          return { node: k.cloneNode(!0), x: r.x, y: r.y };
        }) });
      }
      if (w = te.gridSize || 0, x = new Map(Object.values(G.nodes).map((oe) => [oe.bit, oe.name])), !D || !w) {
        c = null, h();
        return;
      }
      const z = Wt(s, D, G, F), le = z.segments;
      c = new Bt(z, { step: w, segments: le }), _ = ct(H, G.topology.signature, te), !Q && S.has(_) ? c.restore(Ht({ ...z, segments: le }, S.get(_), w)) : e("flywire").checked && c.clear(), l = e("interactive").checked, l || !Q && S.has(_) || e("flywire").checked ? O() : h();
    },
    invalidate() {
      c && !u && S.set(_, c.snapshot()), E++, u = !1, c = null, s = null, f = null, b = null, p = null, m = null, y.clear(), h();
    },
    snapshotSheets() {
      return c && !u && S.set(_, c.snapshot()), [...S].map(([A, D]) => {
        const [G, F, te] = JSON.parse(A);
        return { scope: G, topology: F, settings: te, snapshot: structuredClone(D) };
      });
    },
    restoreSheets(A) {
      S = new Map(A.map((D) => [ct(D.scope, D.topology, D.settings), structuredClone(D.snapshot)]));
    },
    clearSheets() {
      S.clear();
    },
    setEnabled(A) {
      l = A, A || (f = null, b = null, p = null, m = null, y.clear()), c ? O() : h();
    },
    clear() {
      c && (c.clear(), f = null, O(), P("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: K,
    chooseTool: W,
    arrange: $,
    undo() {
      c && (f = null, b = null, p = null, c.undo(), O(), P("Undo."));
    },
    redo() {
      c && (f = null, b = null, p = null, c.redo(), O(), P("Redo."));
    },
    complete() {
      return !c || !u && c.airwires().length === 0;
    },
    working() {
      return u;
    },
    stats: g,
    canEdit() {
      return !!c;
    },
    refreshColors() {
      if (s) {
        for (const A of s.querySelectorAll("[data-air-net]")) A.setAttribute("stroke", L(+A.dataset.airNet));
        for (const A of s.querySelectorAll("[data-editor-bit]")) A.setAttribute("stroke", L(+A.dataset.editorBit));
      }
    },
    cleanExport(A) {
      for (const D of A.querySelectorAll("[data-editor-overlay],[data-route-preview]")) D.remove();
      for (const D of A.querySelectorAll("[data-editor-component]"))
        D.removeAttribute("data-editor-component"), D.style.removeProperty("opacity");
    }
  };
}
const lt = 4, Fe = "http://www.w3.org/2000/svg";
function Ge(t, e, o = !0, i = null) {
  let a = t.querySelector("defs[data-coordinate-grid]"), d = t.querySelector("rect[data-coordinate-grid]");
  if (!a) {
    a = document.createElementNS(Fe, "defs"), a.dataset.coordinateGrid = "true";
    const m = document.createElementNS(Fe, "pattern");
    m.id = "spice-coordinate-grid", m.setAttribute("patternUnits", "userSpaceOnUse");
    const y = document.createElementNS(Fe, "path");
    y.setAttribute("fill", "none"), y.setAttribute("stroke", "#737b83"), y.setAttribute("stroke-opacity", ".38"), y.setAttribute("stroke-width", ".55"), y.setAttribute("vector-effect", "non-scaling-stroke"), m.append(y), a.append(m), d = document.createElementNS(Fe, "rect"), d.dataset.coordinateGrid = "true", d.setAttribute("fill", "url(#spice-coordinate-grid)"), d.setAttribute("stroke", "none"), d.setAttribute("pointer-events", "none"), t.prepend(d), t.prepend(a);
  }
  const c = a.firstElementChild, s = e || 8;
  c.setAttribute("width", s), c.setAttribute("height", s), c.firstElementChild.setAttribute("d", `M${s},0 H0 V${s}`), d.setAttribute("visibility", o && e ? "visible" : "hidden");
  let l = c.querySelector("[data-minor-grid]");
  l || (l = c.firstElementChild.cloneNode(), l.setAttribute("data-minor-grid", "true"), l.setAttribute("stroke-opacity", ".16"), c.append(l));
  const u = [];
  for (let m = lt; m < s; m += lt) u.push(`M${m},0 V${s} M0,${m} H${s}`);
  l.setAttribute("d", u.join(" ")), t.dataset.displayGridStep = String(s);
  let f = i;
  const b = t.closest(".spice-preview"), p = t.isConnected && b ? t.getScreenCTM() : null;
  if (p) {
    const m = b.getBoundingClientRect(), y = p.inverse(), E = [[m.left - 1, m.top - 1], [m.right + 1, m.top - 1], [m.right + 1, m.bottom + 1], [m.left - 1, m.bottom + 1]].map(([x, S]) => new DOMPoint(x, S).matrixTransform(y)), _ = Math.min(...E.map((x) => x.x)), w = Math.min(...E.map((x) => x.y));
    f = { x: _, y: w, w: Math.max(...E.map((x) => x.x)) - _, h: Math.max(...E.map((x) => x.y)) - w };
  }
  if (!f) {
    const m = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    f = { x: m[0], y: m[1], w: m[2], h: m[3] };
  }
  for (const [m, y] of Object.entries({ x: f.x, y: f.y, width: f.w, height: f.h })) d.setAttribute(m, y);
}
const io = `<svg
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
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <circle cx="11" cy="11" r="8" />
  <line x1="21" x2="16.65" y1="21" y2="16.65" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
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
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
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
`, yo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
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
  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
  <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
  <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
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
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M12 2v20" />
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="12" y="7" rx="2" />
  <path d="M22 2v20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 12h20" />
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
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
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
  <rect width="6" height="14" x="3" y="5" rx="2" />
  <rect width="6" height="10" x="15" y="7" rx="2" />
  <path d="M3 2v20" />
  <path d="M21 2v20" />
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
  <rect width="14" height="6" x="5" y="15" rx="2" />
  <rect width="10" height="6" x="7" y="3" rx="2" />
  <path d="M2 21h20" />
  <path d="M2 3h20" />
</svg>
`;
function Lo(t) {
  const e = { select: _o, box: No, move: io, route: so, erase: ao, rotate: co, "mirror-x": lo, "mirror-y": uo }, o = { left: So, right: To, top: Ao, bottom: Oo, "center-x": Io, "center-y": ko, "space-x": Mo, "space-y": Ro }, i = { "zoom-in": fo, "zoom-out": po, fit: ho, "wire-undo": mo, "wire-redo": go, "auto-route": bo, "pin-editor": Je, "pin-info": Je, "pin-details": Je, fullscreen: yo, "exit-fullscreen": wo, "reset-windows": xo, "open-download": vo, upload: Eo }, a = (d, c) => {
    if (!d) return;
    const s = d.title || d.getAttribute("aria-label") || d.textContent;
    d.setAttribute("aria-label", s), d.title = s, d.innerHTML = c, d.firstElementChild.setAttribute("aria-hidden", "true"), d.firstElementChild.setAttribute("focusable", "false"), d.classList.add("spice-icon-button");
  };
  a(t.querySelector("#spice-copy"), Co);
  for (const [d, c] of Object.entries(o)) a(t.querySelector(`[data-editor-arrange="${d}"]`), c);
  for (const [d, c] of Object.entries(e)) a(t.querySelector(`[data-editor-mode="${d}"]`), c);
  for (const [d, c] of Object.entries(i)) a(t.querySelector("#spice-" + d), c);
}
function Po(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var o = function i() {
      var a = !1;
      try {
        a = this instanceof i;
      } catch {
      }
      return a ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    o.prototype = e.prototype;
  } else o = {};
  return Object.defineProperty(o, "__esModule", { value: !0 }), Object.keys(t).forEach(function(i) {
    var a = Object.getOwnPropertyDescriptor(t, i);
    Object.defineProperty(o, i, a.get ? a : {
      enumerable: !0,
      get: function() {
        return t[i];
      }
    });
  }), o;
}
var et = {};
const Do = {}, Uo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Do
}, Symbol.toStringTag, { value: "Module" })), Bo = /* @__PURE__ */ Po(Uo);
var At;
function jo() {
  return At || (At = 1, (function(t) {
    (function(e) {
      e.parser = function(r, n) {
        return new i(r, n);
      }, e.SAXParser = i, e.SAXStream = b, e.createStream = u, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function i(r, n) {
        if (!(this instanceof i))
          return new i(r, n);
        var N = this;
        d(N), N.q = N.c = "", N.bufferCheckPosition = e.MAX_BUFFER_LENGTH, N.encoding = null, N.opt = n || {}, N.opt.lowercase = N.opt.lowercase || N.opt.lowercasetags, N.looseCase = N.opt.lowercase ? "toLowerCase" : "toUpperCase", N.opt.maxEntityCount = N.opt.maxEntityCount || 512, N.opt.maxEntityDepth = N.opt.maxEntityDepth || 4, N.entityCount = N.entityDepth = 0, N.tags = [], N.closed = N.closedRoot = N.sawRoot = !1, N.tag = N.error = null, N.strict = !!r, N.noscript = !!(r || N.opt.noscript), N.state = h.BEGIN, N.strictEntities = N.opt.strictEntities, N.ENTITIES = N.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), N.attribList = [], N.opt.xmlns && (N.ns = Object.create(_)), N.opt.unquotedAttributeValues === void 0 && (N.opt.unquotedAttributeValues = !r), N.trackPosition = N.opt.position !== !1, N.trackPosition && (N.position = N.line = N.column = 0), W(N, "onready");
      }
      Object.create || (Object.create = function(r) {
        function n() {
        }
        n.prototype = r;
        var N = new n();
        return N;
      }), Object.keys || (Object.keys = function(r) {
        var n = [];
        for (var N in r) r.hasOwnProperty(N) && n.push(N);
        return n;
      });
      function a(r) {
        for (var n = Math.max(e.MAX_BUFFER_LENGTH, 10), N = 0, v = 0, B = o.length; v < B; v++) {
          var Z = r[o[v]].length;
          if (Z > n)
            switch (o[v]) {
              case "textNode":
                q(r);
                break;
              case "cdata":
                O(r, "oncdata", r.cdata), r.cdata = "";
                break;
              case "script":
                O(r, "onscript", r.script), r.script = "";
                break;
              default:
                K(r, "Max buffer length exceeded: " + o[v]);
            }
          N = Math.max(N, Z);
        }
        var re = e.MAX_BUFFER_LENGTH - N;
        r.bufferCheckPosition = re + r.position;
      }
      function d(r) {
        for (var n = 0, N = o.length; n < N; n++)
          r[o[n]] = "";
      }
      function c(r) {
        q(r), r.cdata !== "" && (O(r, "oncdata", r.cdata), r.cdata = ""), r.script !== "" && (O(r, "onscript", r.script), r.script = "");
      }
      i.prototype = {
        end: function() {
          A(this);
        },
        write: k,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          c(this);
        }
      };
      var s;
      try {
        s = Bo.Stream;
      } catch {
        s = function() {
        };
      }
      s || (s = function() {
      });
      var l = e.EVENTS.filter(function(r) {
        return r !== "error" && r !== "end";
      });
      function u(r, n) {
        return new b(r, n);
      }
      function f(r, n) {
        if (r.length >= 2) {
          if (r[0] === 255 && r[1] === 254)
            return "utf-16le";
          if (r[0] === 254 && r[1] === 255)
            return "utf-16be";
        }
        return r.length >= 3 && r[0] === 239 && r[1] === 187 && r[2] === 191 ? "utf8" : r.length >= 4 ? r[0] === 60 && r[1] === 0 && r[2] === 63 && r[3] === 0 ? "utf-16le" : r[0] === 0 && r[1] === 60 && r[2] === 0 && r[3] === 63 ? "utf-16be" : "utf8" : n ? "utf8" : null;
      }
      function b(r, n) {
        if (!(this instanceof b))
          return new b(r, n);
        s.apply(this), this._parser = new i(r, n), this.writable = !0, this.readable = !0;
        var N = this;
        this._parser.onend = function() {
          N.emit("end");
        }, this._parser.onerror = function(v) {
          N.emit("error", v), N._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, l.forEach(function(v) {
          Object.defineProperty(N, "on" + v, {
            get: function() {
              return N._parser["on" + v];
            },
            set: function(B) {
              if (!B)
                return N.removeAllListeners(v), N._parser["on" + v] = B, B;
              N.on(v, B);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      b.prototype = Object.create(s.prototype, {
        constructor: {
          value: b
        }
      }), b.prototype._decodeBuffer = function(r, n) {
        if (this._decoderBuffer && (r = Buffer.concat([this._decoderBuffer, r]), this._decoderBuffer = null), !this._decoder) {
          var N = f(r, n);
          if (!N)
            return this._decoderBuffer = r, "";
          this._parser.encoding = N, this._decoder = new TextDecoder(N);
        }
        return this._decoder.decode(r, { stream: !n });
      }, b.prototype.write = function(r) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(r))
          r = this._decodeBuffer(r, !1);
        else if (this._decoderBuffer) {
          var n = this._decodeBuffer(Buffer.alloc(0), !0);
          n && (this._parser.write(n), this.emit("data", n));
        }
        return this._parser.write(r.toString()), this.emit("data", r), !0;
      }, b.prototype.end = function(r) {
        if (r && r.length && this.write(r), this._decoderBuffer) {
          var n = this._decodeBuffer(Buffer.alloc(0), !0);
          n && (this._parser.write(n), this.emit("data", n));
        } else if (this._decoder) {
          var N = this._decoder.decode();
          N && (this._parser.write(N), this.emit("data", N));
        }
        return this._parser.end(), !0;
      }, b.prototype.on = function(r, n) {
        var N = this;
        return !N._parser["on" + r] && l.indexOf(r) !== -1 && (N._parser["on" + r] = function() {
          var v = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          v.splice(0, 0, r), N.emit.apply(N, v);
        }), s.prototype.on.call(N, r, n);
      };
      var p = /^\[CDATA\[$/i, m = /^DOCTYPE$/i, y = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", _ = { xml: y, xmlns: E }, w = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, x = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, S = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, C = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function T(r) {
        return r === " " || r === `
` || r === "\r" || r === "	";
      }
      function I(r) {
        return r === '"' || r === "'";
      }
      function L(r) {
        return r === ">" || T(r);
      }
      function P(r, n) {
        return r.test(n);
      }
      function g(r, n) {
        return !P(r, n);
      }
      var h = 0;
      e.STATE = {
        BEGIN: h++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: h++,
        // leading whitespace
        TEXT: h++,
        // general stuff
        TEXT_ENTITY: h++,
        // &amp and such.
        OPEN_WAKA: h++,
        // <
        SGML_DECL: h++,
        // <!BLARG
        SGML_DECL_QUOTED: h++,
        // <!BLARG foo "bar
        DOCTYPE: h++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: h++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: h++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: h++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: h++,
        // <!-
        COMMENT: h++,
        // <!--
        COMMENT_ENDING: h++,
        // <!-- blah -
        COMMENT_ENDED: h++,
        // <!-- blah --
        CDATA: h++,
        // <![CDATA[ something
        CDATA_ENDING: h++,
        // ]
        CDATA_ENDING_2: h++,
        // ]]
        PROC_INST: h++,
        // <?hi
        PROC_INST_BODY: h++,
        // <?hi there
        PROC_INST_ENDING: h++,
        // <?hi "there" ?
        OPEN_TAG: h++,
        // <strong
        OPEN_TAG_SLASH: h++,
        // <strong /
        ATTRIB: h++,
        // <a
        ATTRIB_NAME: h++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: h++,
        // <a foo _
        ATTRIB_VALUE: h++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: h++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: h++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: h++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: h++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: h++,
        // <foo bar=&quot
        CLOSE_TAG: h++,
        // </a
        CLOSE_TAG_SAW_WHITE: h++,
        // </a   >
        SCRIPT: h++,
        // <script> ...
        SCRIPT_ENDING: h++
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
      }), Object.keys(e.ENTITIES).forEach(function(r) {
        var n = e.ENTITIES[r], N = typeof n == "number" ? String.fromCharCode(n) : n;
        e.ENTITIES[r] = N;
      });
      for (var U in e.STATE)
        e.STATE[e.STATE[U]] = U;
      h = e.STATE;
      function W(r, n, N) {
        r[n] && r[n](N);
      }
      function X(r) {
        var n = r && r.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return n ? n[2] : null;
      }
      function Y(r) {
        return r ? r.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function J(r, n) {
        const N = Y(r), v = Y(n);
        return !N || !v ? !0 : v === "utf16" ? N === "utf16le" || N === "utf16be" : N === v;
      }
      function M(r, n) {
        if (!(!r.strict || !r.encoding || !n || n.name !== "xml")) {
          var N = X(n.body);
          N && !J(r.encoding, N) && D(
            r,
            "XML declaration encoding " + N + " does not match detected stream encoding " + r.encoding.toUpperCase()
          );
        }
      }
      function O(r, n, N) {
        r.textNode && q(r), W(r, n, N);
      }
      function q(r) {
        r.textNode = $(r.opt, r.textNode), r.textNode && W(r, "ontext", r.textNode), r.textNode = "";
      }
      function $(r, n) {
        return r.trim && (n = n.trim()), r.normalize && (n = n.replace(/\s+/g, " ")), n;
      }
      function K(r, n) {
        return q(r), r.trackPosition && (n += `
Line: ` + r.line + `
Column: ` + r.column + `
Char: ` + r.c), n = new Error(n), r.error = n, W(r, "onerror", n), r;
      }
      function A(r) {
        return r.sawRoot && !r.closedRoot && D(r, "Unclosed root tag"), r.state !== h.BEGIN && r.state !== h.BEGIN_WHITESPACE && r.state !== h.TEXT && K(r, "Unexpected end"), q(r), r.c = "", r.closed = !0, W(r, "onend"), i.call(r, r.strict, r.opt), r;
      }
      function D(r, n) {
        if (typeof r != "object" || !(r instanceof i))
          throw new Error("bad call to strictFail");
        r.strict && K(r, n);
      }
      function G(r) {
        r.strict || (r.tagName = r.tagName[r.looseCase]());
        var n = r.tags[r.tags.length - 1] || r, N = r.tag = { name: r.tagName, attributes: {} };
        r.opt.xmlns && (N.ns = n.ns), r.attribList.length = 0, O(r, "onopentagstart", N);
      }
      function F(r, n) {
        var N = r.indexOf(":"), v = N < 0 ? ["", r] : r.split(":"), B = v[0], Z = v[1];
        return n && r === "xmlns" && (B = "xmlns", Z = ""), { prefix: B, local: Z };
      }
      function te(r) {
        if (r.strict || (r.attribName = r.attribName[r.looseCase]()), r.attribList.indexOf(r.attribName) !== -1 || r.tag.attributes.hasOwnProperty(r.attribName)) {
          r.attribName = r.attribValue = "";
          return;
        }
        if (r.opt.xmlns) {
          var n = F(r.attribName, !0), N = n.prefix, v = n.local;
          if (N === "xmlns")
            if (v === "xml" && r.attribValue !== y)
              D(
                r,
                "xml: prefix must be bound to " + y + `
Actual: ` + r.attribValue
              );
            else if (v === "xmlns" && r.attribValue !== E)
              D(
                r,
                "xmlns: prefix must be bound to " + E + `
Actual: ` + r.attribValue
              );
            else {
              var B = r.tag, Z = r.tags[r.tags.length - 1] || r;
              B.ns === Z.ns && (B.ns = Object.create(Z.ns)), B.ns[v] = r.attribValue;
            }
          r.attribList.push([r.attribName, r.attribValue]);
        } else
          r.tag.attributes[r.attribName] = r.attribValue, O(r, "onattribute", {
            name: r.attribName,
            value: r.attribValue
          });
        r.attribName = r.attribValue = "";
      }
      function Q(r, n) {
        if (r.opt.xmlns) {
          var N = r.tag, v = F(r.tagName);
          N.prefix = v.prefix, N.local = v.local, N.uri = N.ns[v.prefix] || "", N.prefix && !N.uri && (D(
            r,
            "Unbound namespace prefix: " + JSON.stringify(r.tagName)
          ), N.uri = v.prefix);
          var B = r.tags[r.tags.length - 1] || r;
          N.ns && B.ns !== N.ns && Object.keys(N.ns).forEach(function(Ne) {
            O(r, "onopennamespace", {
              prefix: Ne,
              uri: N.ns[Ne]
            });
          });
          for (var Z = 0, re = r.attribList.length; Z < re; Z++) {
            var de = r.attribList[Z], se = de[0], he = de[1], ee = F(se, !0), V = ee.prefix, ne = ee.local, me = V === "" ? "" : N.ns[V] || "", _e = {
              name: se,
              value: he,
              prefix: V,
              local: ne,
              uri: me
            };
            V && V !== "xmlns" && !me && (D(
              r,
              "Unbound namespace prefix: " + JSON.stringify(V)
            ), _e.uri = V), r.tag.attributes[se] = _e, O(r, "onattribute", _e);
          }
          r.attribList.length = 0;
        }
        r.tag.isSelfClosing = !!n, r.sawRoot = !0, r.tags.push(r.tag), O(r, "onopentag", r.tag), n || (!r.noscript && r.tagName.toLowerCase() === "script" ? r.state = h.SCRIPT : r.state = h.TEXT, r.tag = null, r.tagName = ""), r.attribName = r.attribValue = "", r.attribList.length = 0;
      }
      function H(r) {
        if (!r.tagName) {
          D(r, "Weird empty close tag."), r.textNode += "</>", r.state = h.TEXT;
          return;
        }
        if (r.script) {
          if (r.tagName !== "script") {
            r.script += "</" + r.tagName + ">", r.tagName = "", r.state = h.SCRIPT;
            return;
          }
          O(r, "onscript", r.script), r.script = "";
        }
        var n = r.tags.length, N = r.tagName;
        r.strict || (N = N[r.looseCase]());
        for (var v = N; n--; ) {
          var B = r.tags[n];
          if (B.name !== v)
            D(r, "Unexpected close tag");
          else
            break;
        }
        if (n < 0) {
          D(r, "Unmatched closing tag: " + r.tagName), r.textNode += "</" + r.tagName + ">", r.state = h.TEXT;
          return;
        }
        r.tagName = N;
        for (var Z = r.tags.length; Z-- > n; ) {
          var re = r.tag = r.tags.pop();
          r.tagName = r.tag.name, O(r, "onclosetag", r.tagName);
          var de = {};
          for (var se in re.ns)
            de[se] = re.ns[se];
          var he = r.tags[r.tags.length - 1] || r;
          r.opt.xmlns && re.ns !== he.ns && Object.keys(re.ns).forEach(function(ee) {
            var V = re.ns[ee];
            O(r, "onclosenamespace", { prefix: ee, uri: V });
          });
        }
        n === 0 && (r.closedRoot = !0), r.tagName = r.attribValue = r.attribName = "", r.attribList.length = 0, r.state = h.TEXT;
      }
      function z(r) {
        var n = r.entity, N = n.toLowerCase(), v, B = "";
        return r.ENTITIES[n] ? r.ENTITIES[n] : r.ENTITIES[N] ? r.ENTITIES[N] : (n = N, n.charAt(0) === "#" && (n.charAt(1) === "x" ? (n = n.slice(2), v = parseInt(n, 16), B = v.toString(16)) : (n = n.slice(1), v = parseInt(n, 10), B = v.toString(10))), n = n.replace(/^0+/, ""), isNaN(v) || B.toLowerCase() !== n || v < 0 || v > 1114111 || !le(v) ? (D(r, "Invalid character entity"), "&" + r.entity + ";") : String.fromCodePoint(v));
      }
      function le(r) {
        return r === 9 || r === 10 || r === 13 || r >= 32 && r <= 55295 || r >= 57344 && r <= 65533 || r >= 65536 && r <= 1114111;
      }
      function oe(r, n) {
        n === "<" ? (r.state = h.OPEN_WAKA, r.startTagPosition = r.position) : T(n) || (D(r, "Non-whitespace before first tag."), r.textNode = n, r.state = h.TEXT);
      }
      function we(r, n) {
        var N = "";
        return n < r.length && (N = r.charAt(n)), N;
      }
      function k(r) {
        var n = this;
        if (this.error)
          throw this.error;
        if (n.closed)
          return K(
            n,
            "Cannot write after close. Assign an onready handler."
          );
        if (r === null)
          return A(n);
        typeof r == "object" && (r = r.toString());
        for (var N = 0, v = ""; v = we(r, N++), n.c = v, !!v; )
          switch (n.trackPosition && (n.position++, v === `
` ? (n.line++, n.column = 0) : n.column++), n.state) {
            case h.BEGIN:
              if (n.state = h.BEGIN_WHITESPACE, v === "\uFEFF")
                continue;
              oe(n, v);
              continue;
            case h.BEGIN_WHITESPACE:
              oe(n, v);
              continue;
            case h.TEXT:
              if (n.sawRoot && !n.closedRoot) {
                for (var Z = N - 1; v && v !== "<" && v !== "&"; )
                  v = we(r, N++), v && n.trackPosition && (n.position++, v === `
` ? (n.line++, n.column = 0) : n.column++);
                n.textNode += r.substring(Z, N - 1);
              }
              v === "<" && !(n.sawRoot && n.closedRoot && !n.strict) ? (n.state = h.OPEN_WAKA, n.startTagPosition = n.position) : (!T(v) && (!n.sawRoot || n.closedRoot) && D(n, "Text data outside of root node."), v === "&" ? n.state = h.TEXT_ENTITY : n.textNode += v);
              continue;
            case h.SCRIPT:
              v === "<" ? n.state = h.SCRIPT_ENDING : n.script += v;
              continue;
            case h.SCRIPT_ENDING:
              v === "/" ? n.state = h.CLOSE_TAG : (n.script += "<" + v, n.state = h.SCRIPT);
              continue;
            case h.OPEN_WAKA:
              if (v === "!")
                n.state = h.SGML_DECL, n.sgmlDecl = "";
              else if (!T(v)) if (P(w, v))
                n.state = h.OPEN_TAG, n.tagName = v;
              else if (v === "/")
                n.state = h.CLOSE_TAG, n.tagName = "";
              else if (v === "?")
                n.state = h.PROC_INST, n.procInstName = n.procInstBody = "";
              else {
                if (D(n, "Unencoded <"), n.startTagPosition + 1 < n.position) {
                  var B = n.position - n.startTagPosition;
                  v = new Array(B).join(" ") + v;
                }
                n.textNode += "<" + v, n.state = h.TEXT;
              }
              continue;
            case h.SGML_DECL:
              if (n.sgmlDecl + v === "--") {
                n.state = h.COMMENT, n.comment = "", n.sgmlDecl = "";
                continue;
              }
              n.doctype && n.doctype !== !0 && n.sgmlDecl ? (n.state = h.DOCTYPE_DTD, n.doctype += "<!" + n.sgmlDecl + v, n.sgmlDecl = "") : p.test(n.sgmlDecl + v) ? (O(n, "onopencdata"), n.state = h.CDATA, n.sgmlDecl = "", n.cdata = "") : m.test(n.sgmlDecl + v) ? (n.state = h.DOCTYPE, (n.doctype || n.sawRoot) && D(
                n,
                "Inappropriately located doctype declaration"
              ), n.doctype = "", n.sgmlDecl = "") : v === ">" ? (O(n, "onsgmldeclaration", n.sgmlDecl), n.sgmlDecl = "", n.state = h.TEXT) : (I(v) && (n.state = h.SGML_DECL_QUOTED), n.sgmlDecl += v);
              continue;
            case h.SGML_DECL_QUOTED:
              v === n.q && (n.state = h.SGML_DECL, n.q = ""), n.sgmlDecl += v;
              continue;
            case h.DOCTYPE:
              v === ">" ? (n.state = h.TEXT, O(n, "ondoctype", n.doctype), n.doctype = !0) : (n.doctype += v, v === "[" ? n.state = h.DOCTYPE_DTD : I(v) && (n.state = h.DOCTYPE_QUOTED, n.q = v));
              continue;
            case h.DOCTYPE_QUOTED:
              n.doctype += v, v === n.q && (n.q = "", n.state = h.DOCTYPE);
              continue;
            case h.DOCTYPE_DTD:
              v === "]" ? (n.doctype += v, n.state = h.DOCTYPE) : v === "<" ? (n.state = h.OPEN_WAKA, n.startTagPosition = n.position) : I(v) ? (n.doctype += v, n.state = h.DOCTYPE_DTD_QUOTED, n.q = v) : n.doctype += v;
              continue;
            case h.DOCTYPE_DTD_QUOTED:
              n.doctype += v, v === n.q && (n.state = h.DOCTYPE_DTD, n.q = "");
              continue;
            case h.COMMENT:
              v === "-" ? n.state = h.COMMENT_ENDING : n.comment += v;
              continue;
            case h.COMMENT_ENDING:
              v === "-" ? (n.state = h.COMMENT_ENDED, n.comment = $(n.opt, n.comment), n.comment && O(n, "oncomment", n.comment), n.comment = "") : (n.comment += "-" + v, n.state = h.COMMENT);
              continue;
            case h.COMMENT_ENDED:
              v !== ">" ? (D(n, "Malformed comment"), n.comment += "--" + v, n.state = h.COMMENT) : n.doctype && n.doctype !== !0 ? n.state = h.DOCTYPE_DTD : n.state = h.TEXT;
              continue;
            case h.CDATA:
              for (var Z = N - 1; v && v !== "]"; )
                v = we(r, N++), v && n.trackPosition && (n.position++, v === `
` ? (n.line++, n.column = 0) : n.column++);
              n.cdata += r.substring(Z, N - 1), v === "]" && (n.state = h.CDATA_ENDING);
              continue;
            case h.CDATA_ENDING:
              v === "]" ? n.state = h.CDATA_ENDING_2 : (n.cdata += "]" + v, n.state = h.CDATA);
              continue;
            case h.CDATA_ENDING_2:
              v === ">" ? (n.cdata && O(n, "oncdata", n.cdata), O(n, "onclosecdata"), n.cdata = "", n.state = h.TEXT) : v === "]" ? n.cdata += "]" : (n.cdata += "]]" + v, n.state = h.CDATA);
              continue;
            case h.PROC_INST:
              v === "?" ? n.state = h.PROC_INST_ENDING : T(v) ? n.state = h.PROC_INST_BODY : n.procInstName += v;
              continue;
            case h.PROC_INST_BODY:
              if (!n.procInstBody && T(v))
                continue;
              v === "?" ? n.state = h.PROC_INST_ENDING : n.procInstBody += v;
              continue;
            case h.PROC_INST_ENDING:
              if (v === ">") {
                const he = {
                  name: n.procInstName,
                  body: n.procInstBody
                };
                M(n, he), O(n, "onprocessinginstruction", he), n.procInstName = n.procInstBody = "", n.state = h.TEXT;
              } else
                n.procInstBody += "?" + v, n.state = h.PROC_INST_BODY;
              continue;
            case h.OPEN_TAG:
              P(x, v) ? n.tagName += v : (G(n), v === ">" ? Q(n) : v === "/" ? n.state = h.OPEN_TAG_SLASH : (T(v) || D(n, "Invalid character in tag name"), n.state = h.ATTRIB));
              continue;
            case h.OPEN_TAG_SLASH:
              v === ">" ? (Q(n, !0), H(n)) : (D(
                n,
                "Forward-slash in opening tag not followed by >"
              ), n.state = h.ATTRIB);
              continue;
            case h.ATTRIB:
              if (T(v))
                continue;
              v === ">" ? Q(n) : v === "/" ? n.state = h.OPEN_TAG_SLASH : P(w, v) ? (n.attribName = v, n.attribValue = "", n.state = h.ATTRIB_NAME) : D(n, "Invalid attribute name");
              continue;
            case h.ATTRIB_NAME:
              v === "=" ? n.state = h.ATTRIB_VALUE : v === ">" ? (D(n, "Attribute without value"), n.attribValue = n.attribName, te(n), Q(n)) : T(v) ? n.state = h.ATTRIB_NAME_SAW_WHITE : P(x, v) ? n.attribName += v : D(n, "Invalid attribute name");
              continue;
            case h.ATTRIB_NAME_SAW_WHITE:
              if (v === "=")
                n.state = h.ATTRIB_VALUE;
              else {
                if (T(v))
                  continue;
                D(n, "Attribute without value"), n.tag.attributes[n.attribName] = "", n.attribValue = "", O(n, "onattribute", {
                  name: n.attribName,
                  value: ""
                }), n.attribName = "", v === ">" ? Q(n) : P(w, v) ? (n.attribName = v, n.state = h.ATTRIB_NAME) : (D(n, "Invalid attribute name"), n.state = h.ATTRIB);
              }
              continue;
            case h.ATTRIB_VALUE:
              if (T(v))
                continue;
              I(v) ? (n.q = v, n.state = h.ATTRIB_VALUE_QUOTED) : (n.opt.unquotedAttributeValues || K(n, "Unquoted attribute value"), n.state = h.ATTRIB_VALUE_UNQUOTED, n.attribValue = v);
              continue;
            case h.ATTRIB_VALUE_QUOTED:
              if (v !== n.q) {
                v === "&" ? n.state = h.ATTRIB_VALUE_ENTITY_Q : n.attribValue += v;
                continue;
              }
              te(n), n.q = "", n.state = h.ATTRIB_VALUE_CLOSED;
              continue;
            case h.ATTRIB_VALUE_CLOSED:
              T(v) ? n.state = h.ATTRIB : v === ">" ? Q(n) : v === "/" ? n.state = h.OPEN_TAG_SLASH : P(w, v) ? (D(n, "No whitespace between attributes"), n.attribName = v, n.attribValue = "", n.state = h.ATTRIB_NAME) : D(n, "Invalid attribute name");
              continue;
            case h.ATTRIB_VALUE_UNQUOTED:
              if (!L(v)) {
                v === "&" ? n.state = h.ATTRIB_VALUE_ENTITY_U : n.attribValue += v;
                continue;
              }
              te(n), v === ">" ? Q(n) : n.state = h.ATTRIB;
              continue;
            case h.CLOSE_TAG:
              if (n.tagName)
                v === ">" ? H(n) : P(x, v) ? n.tagName += v : n.script ? (n.script += "</" + n.tagName + v, n.tagName = "", n.state = h.SCRIPT) : (T(v) || D(n, "Invalid tagname in closing tag"), n.state = h.CLOSE_TAG_SAW_WHITE);
              else {
                if (T(v))
                  continue;
                g(w, v) ? n.script ? (n.script += "</" + v, n.state = h.SCRIPT) : D(n, "Invalid tagname in closing tag.") : n.tagName = v;
              }
              continue;
            case h.CLOSE_TAG_SAW_WHITE:
              if (T(v))
                continue;
              v === ">" ? H(n) : D(n, "Invalid characters in closing tag");
              continue;
            case h.TEXT_ENTITY:
            case h.ATTRIB_VALUE_ENTITY_Q:
            case h.ATTRIB_VALUE_ENTITY_U:
              var re, de;
              switch (n.state) {
                case h.TEXT_ENTITY:
                  re = h.TEXT, de = "textNode";
                  break;
                case h.ATTRIB_VALUE_ENTITY_Q:
                  re = h.ATTRIB_VALUE_QUOTED, de = "attribValue";
                  break;
                case h.ATTRIB_VALUE_ENTITY_U:
                  re = h.ATTRIB_VALUE_UNQUOTED, de = "attribValue";
                  break;
              }
              if (v === ";") {
                var se = z(n);
                n.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(se) ? ((n.entityCount += 1) > n.opt.maxEntityCount && K(
                  n,
                  "Parsed entity count exceeds max entity count"
                ), (n.entityDepth += 1) > n.opt.maxEntityDepth && K(
                  n,
                  "Parsed entity depth exceeds max entity depth"
                ), n.entity = "", n.state = re, n.write(se), n.entityDepth -= 1) : (n[de] += se, n.entity = "", n.state = re);
              } else P(n.entity.length ? C : S, v) ? n.entity += v : (D(n, "Invalid character in entity name"), n[de] += "&" + n.entity + v, n.entity = "", n.state = re);
              continue;
            default:
              throw new Error(n, "Unknown state: " + n.state);
          }
        return n.position >= n.bufferCheckPosition && a(n), n;
      }
      String.fromCodePoint || (function() {
        var r = String.fromCharCode, n = Math.floor, N = function() {
          var v = 16384, B = [], Z, re, de = -1, se = arguments.length;
          if (!se)
            return "";
          for (var he = ""; ++de < se; ) {
            var ee = Number(arguments[de]);
            if (!isFinite(ee) || // `NaN`, `+Infinity`, or `-Infinity`
            ee < 0 || // not a valid Unicode code point
            ee > 1114111 || // not a valid Unicode code point
            n(ee) !== ee)
              throw RangeError("Invalid code point: " + ee);
            ee <= 65535 ? B.push(ee) : (ee -= 65536, Z = (ee >> 10) + 55296, re = ee % 1024 + 56320, B.push(Z, re)), (de + 1 === se || B.length > v) && (he += r.apply(null, B), B.length = 0);
          }
          return he;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: N,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = N;
      })();
    })(t);
  })(et)), et;
}
var tt, kt;
function Vo() {
  if (kt) return tt;
  kt = 1;
  var t = jo().parser;
  function e(o) {
    var i = [], a = [], d = i, c;
    return c = t(!0), c.ontext = function(s) {
      s.trim() !== "" && d.push(s);
    }, c.onopentag = function(s) {
      var l;
      l = [s.name, s.attributes], a.push(d), d.push(l), d = l;
    }, c.onclosetag = function() {
      d = a.pop();
    }, c.write(o).close(), i[0];
  }
  return tt = e, tt;
}
var nt, Ot;
function Qo() {
  if (Ot) return nt;
  Ot = 1;
  function t(e, o) {
    var i = function() {
    }, a = i, d = i;
    function c() {
      this._skip = !0;
    }
    function s() {
      this._remove = !0;
    }
    function l(b) {
      this._name = b;
    }
    function u(b) {
      this._replace = b;
    }
    function f(b, p) {
      var m, y = { attr: {}, full: b }, E = {
        name: l,
        skip: c,
        // break: breakFn,
        remove: s,
        replace: u,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, _ = !0, w, x, S;
      if (b !== void 0 && b !== null && b !== !0 && b !== !1)
        switch (m = Object.prototype.toString.call(b), m) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (b.some(function(C, T) {
              if (T === 0)
                return y.name = C, !1;
              if (T === 1)
                return Object.prototype.toString.call(C) === "[object Object]" && (_ = !1, y.attr = C), !0;
            }), a.call(E, y, p), E._name && (b[0] = E._name), E._replace)
              return E._replace;
            if (E._remove)
              return null;
            if (!E._skip) {
              for (w = 0, x = b.length; w < x; ) {
                if (w > 1 || w === 1 && _) {
                  if (S = f(b[w], y), S === null) {
                    b.splice(w, 1), x -= 1;
                    continue;
                  }
                  S && (b[w] = S);
                }
                w += 1;
              }
              if (d.call(E, y, p), E._name && (b[0] = E._name), E._replace)
                return E._replace;
              if (E._remove)
                return null;
            }
        }
    }
    o && (o.enter && (a = o.enter), o.leave && (d = o.leave)), f(e, void 0);
  }
  return nt = t, nt;
}
var ot, Mt;
function Fo() {
  if (Mt) return ot;
  Mt = 1;
  const t = Vo(), e = Qo(), o = (a) => String(a).replace(/[&<>"']/g, (d) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[d]);
  function i(a) {
    const [d, ...c] = a, s = c[0] && typeof c[0] == "object" && !Array.isArray(c[0]) ? c.shift() : {}, l = "<" + d + Object.entries(s).map(([u, f]) => " " + u + '="' + o(f) + '"').join("");
    return c.length ? l + ">" + c.map((u) => Array.isArray(u) ? i(u) : o(u)).join("") + "</" + d + ">" : l + "/>";
  }
  return ot = { parse: t, p: t, traverse: e, t: e, stringify: i, s: i }, ot;
}
Fo();
const rt = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), Go = (t, e) => [...t].reduce((o, i) => o + (i.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function Ho(t, e, o = 12) {
  const i = [], a = t.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }));
  for (const [c, s] of t.entries()) {
    if (!s.labels.length) continue;
    const l = Math.max(...s.labels.map((y) => Go(y.text, o))) + 4, u = s.labels.length * (o + 4), f = [];
    for (const y of [5, 14, 28, 48]) {
      const E = { x: s.x + (s.w - l) / 2, y: s.y - y - u, w: l, h: u }, _ = { x: s.x + (s.w - l) / 2, y: s.y + s.h + y, w: l, h: u }, w = { x: s.x + s.w + y, y: s.y + (s.h - u) / 2, w: l, h: u }, x = { x: s.x - y - l, y: s.y + (s.h - u) / 2, w: l, h: u };
      f.push(...s.w > s.h ? [E, _, w, x] : [w, x, E, _]);
    }
    const b = (y) => e.reduce((E, _) => {
      const w = Math.min(_.a.x, _.b.x), x = Math.min(_.a.y, _.b.y), S = { x: w - 1, y: x - 1, w: Math.abs(_.a.x - _.b.x) + 2, h: Math.abs(_.a.y - _.b.y) + 2 };
      return E + rt(y, S) * 2;
    }, 0);
    let p = null, m = 1 / 0;
    for (const [y, E] of f.entries()) {
      const _ = a.reduce((w, x, S) => w + (S === c ? 0 : rt(E, x)) * 500, 0) + i.reduce((w, x) => w + rt(E, x) * 100, 0) + b(E) + y * 3;
      _ < m && (m = _, p = E);
    }
    s.labels.forEach((y, E) => {
      y.x = p.x - s.x, y.y = p.y - s.y + o + E * (o + 4);
    }), i.push(p);
  }
  const d = [...a, ...i];
  return { x: Math.min(0, ...d.map((c) => c.x)), y: Math.min(0, ...d.map((c) => c.y)), right: Math.max(0, ...d.map((c) => c.x + c.w)), bottom: Math.max(0, ...d.map((c) => c.y + c.h)) };
}
const Wo = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function qo(t, e = 12) {
  const o = [...t.children].filter((d) => d.localName === "g" && d.id.startsWith("cell_")).map((d) => ({ ...Wo(d.getAttribute("transform")), w: +d.getAttribute("s:width"), h: +d.getAttribute("s:height"), labels: [...d.children].filter((c) => c.localName === "text" && c.hasAttribute("data-layout-label")).map((c) => ({ node: c, text: c.textContent })) })), i = [...t.children].filter((d) => d.localName === "line" && d.hasAttribute("data-net")).map((d) => ({ a: { x: +d.getAttribute("x1"), y: +d.getAttribute("y1") }, b: { x: +d.getAttribute("x2"), y: +d.getAttribute("y2") } })), a = Ho(o, i, e);
  for (const d of o) for (const c of d.labels)
    c.node.setAttribute("x", c.x), c.node.setAttribute("y", c.y), c.node.setAttribute("text-anchor", "start"), c.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(a), a;
}
function zo(t) {
  const e = t("diagnostics"), o = t("messages"), i = t("toggle-log");
  let a = 0, d = !0, c = !1;
  function s(y) {
    o.dataset.expanded = String(y), i.setAttribute("aria-expanded", String(y)), e.hidden = !y;
  }
  i.onclick = () => s(i.getAttribute("aria-expanded") !== "true");
  let l = [];
  const u = () => [e.clientWidth, e.clientHeight], f = () => u().some((y, E) => y !== l[E]);
  function b() {
    c || (c = !0, requestAnimationFrame(() => {
      d && (e.scrollTop = e.scrollHeight), l = u(), c = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (f()) {
      l = u(), d && b();
      return;
    }
    c || (d = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    l = u(), d && b();
  }).observe(e);
  function m({ message: y, severity: E = "info", category: _ = "Tools", line: w, source: x }) {
    if (!y) return;
    const S = d, C = /* @__PURE__ */ new Date(), T = document.createElement("li"), I = document.createElement("time"), L = document.createElement("span"), P = document.createElement("strong");
    E = ["error", "warning", "info"].includes(E) ? E : "info", T.className = E, T.dataset.logSequence = String(++a), T.dataset.logCategory = _, T.dataset.logSeverity = E, I.dateTime = C.toISOString(), I.textContent = C.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), I.title = I.dateTime, P.textContent = E.toUpperCase() + " · " + _ + " ", L.append(P, document.createTextNode((x && x !== "input.cir" ? x + " · " : "") + (w ? "line " + w + " · " : "") + y)), T.append(I, L), e.append(T), t("message-count").textContent = a + " entries", E !== "info" && s(!0), S && b();
  }
  return { append: m };
}
const Rt = Pe.filter.source, j = (t) => document.getElementById("spice-" + t), be = j("app");
if (be) {
  let d = function(k, { severity: r = "info", category: n = "Rendering" } = {}) {
    o.textContent = k, i.append({ message: k, severity: r, category: n });
  }, Y = function() {
    const k = e.querySelector("svg");
    if (!k) return;
    const r = Number(k.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, n = qo(k, r), N = Math.min(T.x, n.x - 20), v = Math.min(T.y, n.y - 20);
    T = { x: N, y: v, w: Math.max(T.x + T.w, n.right + 20) - N, h: Math.max(T.y + T.h, n.bottom + 20) - v }, f && Xn(k, b, f), u?.refreshColors(), Ge(k, X(), j("show-grid").checked, C);
    const B = k.cloneNode(!0);
    u?.cleanExport(B), B.setAttribute("width", T.w), B.setAttribute("height", T.h), B.setAttribute("viewBox", `${T.x} ${T.y} ${T.w} ${T.h}`), Ge(B, X(), j("show-grid").checked, T), p = new XMLSerializer().serializeToString(B), j("source").value = p;
  }, O = function(k) {
    const r = j("example-info");
    if (r && (r.replaceChildren(), !!k && (r.append(document.createTextNode(k.description + " ")), k.url))) {
      const n = document.createElement("a");
      n.href = k.url, n.target = "_blank", n.rel = "noopener noreferrer", n.textContent = k.reference, r.append(n);
    }
  }, q = function() {
    u.invalidate(), J.setEnabled(!1), c = null, s = null, p = "", U(), O(Object.values(Pe).find((k) => k.source === t.value)), o.textContent = "Input changed — generate to refresh the schematic.";
  }, $ = function(k) {
    for (const r of k) {
      const n = JSON.stringify([r.severity, r.line, r.message, r.source]);
      a.has(n) || (a.add(n), i.append({ ...r, category: "Parser / rendering" }));
    }
  }, K = function() {
    !S && p && g.set(w, { ...C }), e.querySelector("svg")?.setAttribute("viewBox", `${C.x} ${C.y} ${C.w} ${C.h}`);
    const k = e.querySelector("svg");
    k && Ge(k, X(), j("show-grid").checked, C), j("zoom-level").textContent = Math.round(T.w / C.w * 100) + "%";
  }, D = function(k, r = C.x + C.w / 2, n = C.y + C.h / 2) {
    if (!e.querySelector("svg")) return;
    const N = Math.max(0.05, Math.min(10, C.w * k / T.w)) * T.w / C.w;
    C = { x: r + (C.x - r) * N, y: n + (C.y - n) * N, w: C.w * N, h: C.h * N }, K();
  }, F = function(k) {
    const r = new URLSearchParams();
    k && r.set("instance", k);
    const n = r.toString();
    location.hash.slice(1) === n ? (w = k, z()) : location.hash = n;
  }, te = function() {
    w = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, Q = function() {
    const k = !!(x && x !== w && y?.contexts[x]);
    j("selection-actions").hidden = !k, j("open-instance").href = "#" + new URLSearchParams({ instance: x });
  }, H = function() {
    j("breadcrumbs").replaceChildren();
    const k = (n, N) => {
      const v = document.createElement("button");
      v.type = "button", v.textContent = n, v.onclick = () => F(N), v.disabled = N === w, j("breadcrumbs").append(v);
    };
    if (k("Top", ""), w) {
      const n = y.contexts[w].path;
      for (let N = 0; N < n.length; N++) k(n[N], n.slice(0, N + 1).map(encodeURIComponent).join("/"));
    }
    j("instances").replaceChildren();
    const r = (n, N) => {
      for (const v of n.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(N, 8)), B.dataset.instance = v.id;
        const Z = document.createElement("a");
        Z.href = "#" + new URLSearchParams({ instance: v.id }), Z.textContent = v.name + " · " + v.definition, Z.title = "Open " + v.id + " as its own sheet";
        const re = document.createElement("span");
        if (re.className = "spice-help", re.textContent = Object.entries(v.params).map(([de, se]) => de + "=" + se).join(" · "), B.append(Z), re.textContent) {
          const de = document.createElement("details"), se = document.createElement("summary");
          se.textContent = "Parameters", de.append(se, re), B.append(de);
        }
        j("instances").append(B), r(v, N + 1);
      }
    };
    r(y.contexts[w], 0), j("hierarchy-panel").hidden = !y.contexts[w].children.length, j("focus-title").textContent = w ? w + " / " + y.contexts[w].definition : "Top-level schematic", Q();
  };
  Lo(be), Yn(be);
  const t = j("input"), e = j("preview"), o = j("status"), i = zo(j);
  let a = /* @__PURE__ */ new Set(), c = null, s = null, l = !1, u = null, f = null, b = [], p = "", m, y, E, _ = "", w = "", x = "", S = !1, C = { x: 0, y: 0, w: 1, h: 1 }, T = { ...C }, I, L = !1, P = {}, g = /* @__PURE__ */ new Map(), h = !1;
  try {
    P = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  be.addEventListener("click", (k) => {
    S && k.target.closest('a[href^="#"]') && k.preventDefault();
  });
  const U = () => {
    j("upload").disabled = S || h || l, j("download-project").disabled = j("open-download").disabled = j("copy").disabled = j("download").disabled = !p || S || h || u?.working(), j("download-asc").disabled = j("download-asc-bundle").disabled = !p || !c || S || l || !u?.complete();
  }, W = () => ({ font: j("font").value, fontSize: Number(j("size").value), color: ft, gridSize: j("grid").checked && j("conventional").checked ? lt : 0, detailed: j("detailed").checked, conventional: j("conventional").checked }), X = () => m?.layout.report?.gridSize ? Number(j("grid-size").value) : 0, J = $n(j, (k, r) => {
    f = k, b = r, Y();
  });
  u = ro(e, j, { report: i.append, getNetColor: (k) => {
    const r = b.find((n) => n.bit === k);
    return r && f && (f.auto || f.manual.has(r.name)) ? f.color(r.name) : null;
  }, inspect: (k, r) => {
    const n = m?.components.find((N) => N.name === k);
    if (n)
      x = n.instanceId || "", j("selection").textContent = n.raw, Q();
    else if (r?.decoration) {
      x = "";
      const N = Object.values(m.nodes).find((v) => v.bit === r.ports[0]?.bit);
      j("selection").textContent = "Ground symbol · " + (N?.displayName || "0"), Q();
    }
  }, changed: (k, r, n) => {
    c = k, s = null, T = n;
    const N = e.querySelector("svg");
    if (N) {
      N.setAttribute("width", String(T.w)), N.setAttribute("height", String(T.h));
      const v = N.querySelector("#spice-layout-report");
      if (v) {
        const B = JSON.parse(v.textContent);
        B.manualWiring = r, B.verifiedTerminals = !r.unrouted, B.geometricConnectivityVerified = !r.unrouted, v.textContent = JSON.stringify(B);
      }
    }
    m && E && (j("json").value = JSON.stringify({ circuit: m, netlist: Qe(m), hierarchy: E, interactive: { ...r, drawing: k } }, null, 2)), Y(), U();
  } }), j("show-grid").onchange = Y, j("grid-size").onchange = () => {
    Y(), K();
  };
  async function M() {
    (!c || !m?.layout.report?.gridVerified) && (j("grid").checked = !0, j("conventional").checked = !0, await z({ resetEditor: !0 })), u.setEnabled(j("interactive").checked), U();
  }
  j("interactive").onchange = M, j("flywire").onchange = async () => {
    j("interactive").checked = !0, await M(), j("flywire").checked ? u.clear() : await u.autoRoute(), U();
  }, j("auto-route").onclick = async () => {
    j("interactive").checked = !0, await M(), await u.autoRoute(), U();
  }, j("wire-undo").onclick = () => u.undo(), j("wire-redo").onclick = () => u.redo();
  for (const k of be.querySelectorAll("[data-editor-mode]")) k.onclick = async () => {
    j("interactive").checked = !0, await M(), u.chooseTool(k.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const k of be.querySelectorAll("[data-editor-arrange]")) k.onclick = () => {
    u.arrange(k.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  J.setEnabled(!1), t.value = Rt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Rt;
  } catch {
  }
  O(Object.values(Pe).find((k) => k.source === t.value)), t.addEventListener("input", q);
  for (const k of ["font", "size", "detailed", "conventional", "grid"]) j(k).addEventListener("input", q);
  new ResizeObserver(() => {
    const k = e.querySelector("svg");
    k && Ge(k, X(), j("show-grid").checked, C);
  }).observe(e), j("zoom-in").onclick = () => D(0.8), j("zoom-out").onclick = () => D(1.25), j("fit").onclick = () => {
    C = { ...T }, K();
  };
  const G = (k) => {
    const r = e.querySelector("svg");
    return r ? new DOMPoint(k.clientX, k.clientY).matrixTransform(r.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (k) => {
    const r = G(k);
    r && (k.preventDefault(), D(k.deltaY > 0 ? 1.12 : 1 / 1.12, r.x, r.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (k) => {
    ![0, 1].includes(k.button) || !e.querySelector("svg") || (I = { start: G(k), x: k.clientX, y: k.clientY, view: { ...C }, moved: !1 }, e.setPointerCapture(k.pointerId));
  }), e.addEventListener("pointermove", (k) => {
    if (!I) return;
    const r = G(k);
    Math.hypot(k.clientX - I.x, k.clientY - I.y) > 4 && (I.moved = !0), C.x += I.start.x - r.x, C.y += I.start.y - r.y, K();
  }), e.addEventListener("pointerup", (k) => {
    if (!I) return;
    const r = I.moved;
    if (I = null, e.hasPointerCapture(k.pointerId) && e.releasePointerCapture(k.pointerId), !r) {
      const n = document.elementFromPoint(k.clientX, k.clientY)?.closest("[data-component]"), N = m?.components.find((v) => v.name === n?.dataset.component);
      N && (x = N.instanceId || "", j("selection").textContent = `${N.raw}
${Object.entries(N.terminals).map(([v, B]) => `${v} → ${B}`).join("   ")}`, N.kind === "X" ? F(N.instanceId) : Q());
    }
  }), window.addEventListener("hashchange", () => {
    if (S) {
      L = !0;
      return;
    }
    te(), x = "", z();
  }), e.addEventListener("pointercancel", () => {
    I = null;
  }), e.addEventListener("keydown", (k) => {
    const r = k.target.closest("[data-instance]");
    if (r && (k.key === "Enter" || k.key === " ")) {
      k.preventDefault(), x = r.dataset.instance, F(x);
      return;
    }
    k.key === "+" || k.key === "=" ? D(0.8) : k.key === "-" ? D(1.25) : k.key.toLowerCase() === "f" ? (C = { ...T }, K()) : k.key.startsWith("Arrow") && (k.preventDefault(), C.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[k.key] || 0) * C.w, C.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[k.key] || 0) * C.h, K());
  });
  async function z({ resetEditor: k = !1 } = {}) {
    if (S) return;
    a = /* @__PURE__ */ new Set(), S = !0, u.invalidate(), J.setEnabled(!1), c = null, s = null, p = "", U(), j("generate").disabled = !0, t.readOnly = !0, j("file").disabled = !0, j("libraries").disabled = !0;
    for (const n of be.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) n.disabled = !0;
    d("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let r = [];
    try {
      if (_ !== t.value || !y) {
        if (_ && _ !== t.value && (u.clearSheets(), g.clear()), E = xt(t.value, { files: P }), r = [...E.diagnostics], r.some((V) => V.severity === "error"))
          throw y = null, Error("Fix the parser errors below before generating.");
        y = qe(E), _ && _ !== t.value ? (w = "", x = "", history.replaceState(null, "", location.pathname + location.search)) : te(), _ = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (r = [...E.diagnostics], $(r), r.some((V) => V.severity === "error")) throw Error("Fix the parser errors below before generating.");
      m = Ve(y, { focus: w });
      for (const V of m.interfaceAliases) r.push({ severity: "info", message: `Instance boundary: ${V.ports.join(" = ")} share parent node ${V.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const n = Qe(m);
      W().conventional && r.push(...m.layout.diagnostics);
      const N = await Ke(n, W()), v = new DOMParser().parseFromString(N.svg, "image/svg+xml");
      if (v.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const B = v.documentElement, Z = B.querySelector("#spice-layout-report");
      if (Z) {
        m.layout.report = JSON.parse(Z.textContent);
        const V = m.layout.report;
        if (r.push({ severity: "info", message: `Layout: compact signal flow; ${V.powerSourcesChecked} DC/ground symbols checked, ${V.powerOrderViolations} DC order preference(s) unmet. ${V.powerPass}. ${V.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), V.classicTemplateFallback && r.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), V.groundPlacement && r.push({ severity: "info", message: `Ground: ${V.groundPlacement}; ${V.straightenedGroundDrops || 0} return-path simplification(s).` }), V.explicitGroups && r.push({ severity: "info", message: `Layout comments: ${V.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), V.classicRails && r.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${V.railCount} shared voltage rails.` }), V.localClassicInstances?.length && r.push({ severity: "info", message: `${V.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), V.localClassicStages?.length && r.push({ severity: "info", message: `Classic transistor proximity active: ${V.localClassicStages.join(", ")}.` }), V.sharedClassicRails && r.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), V.mirroredTransistors?.length && r.push({ severity: "info", message: `Control-pin mirror choices: ${V.mirroredTransistors.join(", ")}.` }), V.recognizedMotifs?.length && r.push({ severity: "info", message: `Transistor structures: ${V.recognizedMotifs.map((ne) => `${ne.kind} (${ne.members.join(", ")}; ${ne.confidence})`).join("; ")}.` }), V.appliedMotifs?.length && r.push({ severity: "info", message: `Topology preferences applied to ${V.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), V.subnetFirstFallback && r.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + V.subnetFirstFallback }), V.pairCompactionFallback && r.push({ severity: "warning", message: "Pair proximity kept the original regions: " + V.pairCompactionFallback }), V.compoundPairFallback && r.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + V.compoundPairFallback }), V.pairConstraints?.length) {
          const ne = V.pairConstraints.filter((me) => me.crossRegion && !me.compacted).length;
          r.push({ severity: "info", message: `${V.pairConstraints.length - ne} adjacent transistor pair(s); ${ne} cross-region mirror row constraint(s).` });
        }
        V.netShortcuts && r.push({ severity: "info", message: `${V.netShortcuts} safe straight net shortcut(s); ${V.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), V.sharedRailFallback && r.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${V.sharedRailFallback}.` });
        for (const ne of V.localClassicFallbacks || []) ne.stage && r.push({ severity: "info", message: `Classic stage ${ne.stage} uses automatic layout: ${ne.reason || "No unobstructed local template"}.` });
        V.geometricConnectivityVerified && r.push({ severity: "info", message: `Net geometry verified; ${V.cyclesRemoved} same-net loop(s) and ${V.leavesRemoved} unused wire branch(es) removed.` }), $(r);
      }
      if (B.localName !== "svg" || B.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const re = Number(B.getAttribute("width")), de = Number(B.getAttribute("height")), se = JSON.parse(B.getAttribute("data-label-bounds") || "null");
      T = { x: Math.min(-20, (se?.x ?? 0) - 20), y: Math.min(-20, (se?.y ?? 0) - 20) }, T.w = Math.max(re, se?.right || 0) + 20 - T.x, T.h = Math.max(de, se?.bottom || 0) + 20 - T.y, C = { ...T }, B.setAttribute("viewBox", `${T.x} ${T.y} ${T.w} ${T.h}`), B.setAttribute("width", String(T.w)), B.setAttribute("height", String(T.h)), B.setAttribute("role", "img"), B.setAttribute("aria-label", m.title || "SPICE schematic"), B.setAttribute("style", "background:white");
      for (const V of m.components) {
        const ne = v.getElementById("cell_" + V.name);
        if (!ne) throw Error("Renderer omitted component " + V.name);
        ne.setAttribute("data-component", V.name), V.kind === "X" && (ne.setAttribute("data-instance", V.instanceId), ne.setAttribute("role", "button"), ne.setAttribute("tabindex", "0"), ne.setAttribute("aria-label", "Open " + V.name));
        const me = v.createElementNS(B.namespaceURI, "title");
        me.textContent = V.raw + `
Resolved: ` + V.value + `
` + Object.entries(V.terminals).map(([_e, Ne]) => _e + ": " + Ne).join(", "), ne.prepend(me);
      }
      for (const V of Object.values(m.nodes))
        for (const ne of B.querySelectorAll(".net_" + V.bit)) {
          ne.setAttribute("data-net", V.name);
          const me = v.createElementNS(B.namespaceURI, "title");
          me.textContent = "Node " + V.displayName, ne.append(me);
        }
      const he = m.components.filter((V) => V.kind === "K").map((V) => ({ name: V.name, inductors: V.coupledInductors, value: V.value }));
      if (he.length) {
        const V = v.createElementNS(B.namespaceURI, "metadata");
        V.setAttribute("id", "spice-magnetic-couplings"), V.textContent = JSON.stringify(he), B.append(V);
        for (const ne of he) for (const me of ne.inductors) {
          const _e = v.getElementById("cell_" + me);
          if (!_e) continue;
          const Ne = v.createElementNS(B.namespaceURI, "circle"), Xe = [..._e.children].find(($e) => $e.getAttribute("s:pid") === "A"), qt = Xe?.getAttribute("s:position"), ht = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[qt] || [0, 0];
          for (const [$e, zt] of Object.entries({ cx: Number(Xe?.getAttribute("s:x")) + ht[0], cy: Number(Xe?.getAttribute("s:y")) + ht[1], r: 3, fill: W().color, stroke: "none", "data-coupling": ne.name })) Ne.setAttribute($e, String(zt));
          const mt = v.createElementNS(B.namespaceURI, "title");
          mt.textContent = ne.name + " · dotted terminal: " + ne.inductors.join(", "), Ne.append(mt), _e.append(Ne);
        }
      }
      c = N.drawing, p = new XMLSerializer().serializeToString(B), j("source").value = p, e.replaceChildren(document.importNode(B, !0)), K();
      const ee = r.filter((V) => V.severity === "warning").length;
      o.textContent = `${m.components.filter((V) => !V.synthetic).length} components · ${Object.keys(m.nodes).length} nodes · ${m.topology.leafCount} primitive devices verified${m.interfaceAliases.length ? " · Parent-connected ports: " + m.interfaceAliases.map((V) => V.ports.join(" = ")).join("; ") + "." : ""}${ee ? " · Review " + ee + " warning(s); drawing may be partial." : " · Schematic ready."}`, o.textContent += ` Layout rules v${Be}.`, m.layout.report?.gridVerified && (o.textContent += ` Grid ${m.layout.report.gridSize}.`), m.layout?.report?.powerOrderViolations && (o.textContent += ` Layout: ${m.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), m.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (o.textContent += " Ground marker: routed fallback; no safe short attachment found."), i.append({ message: o.textContent, category: "Rendering", severity: ee ? "warning" : "info" }), j("json").value = JSON.stringify({ circuit: m, netlist: n, hierarchy: E }, null, 2), J.setCircuit(m, t.value), u.mount(e.querySelector("svg"), c, m, n, W(), { reset: k, scope: w }), Y(), !k && g.has(w) ? C = { ...g.get(w) } : g.set(w, { ...C }), K(), j("selection").textContent = "Click a component to inspect its original statement and pin connections.", H();
    } catch (n) {
      if (e.replaceChildren(), p = "", j("source").value = "", j("json").value = "", j("nets").replaceChildren(), j("selection").textContent = "", d(n.message, { severity: "error" }), !y)
        j("hierarchy-panel").hidden = !0, j("selection-actions").hidden = !0, j("breadcrumbs").replaceChildren();
      else if (!y.contexts[w]) {
        const N = document.createElement("button");
        N.type = "button", N.textContent = "Return to Top", N.onclick = () => F(""), j("breadcrumbs").replaceChildren(N);
      }
      J.setCircuit(null, t.value), n.diagnostics && (r = n.diagnostics), r.some((N) => N.severity === "error") || r.push({ severity: "error", line: 0, message: n.message }), $(r);
    } finally {
      S = !1, j("generate").disabled = !1, t.readOnly = !1, j("file").disabled = !1, j("libraries").disabled = !1;
      for (const n of be.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) n.disabled = !1;
      y && y.contexts[w] && H(), J.setEnabled(!!p), e.setAttribute("aria-busy", "false"), U(), L && (L = !1, te(), queueMicrotask(z));
    }
  }
  j("generate").onclick = () => z({ resetEditor: !0 });
  for (const k of be.querySelectorAll("[data-example]")) k.onclick = () => {
    const r = Pe[k.dataset.example];
    t.value = r.source, q(), O(r), z();
  };
  j("file").onchange = async (k) => {
    const r = k.target.files[0];
    if (r) {
      if (S || h) {
        k.target.value = "";
        return;
      }
      try {
        const n = /\.(spiceproj|json)$/i.test(r.name);
        if (r.size > (n ? Qt : 2e6)) throw Error(n ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        n ? await le(await r.text()) : (t.value = await Nt(r), q(), await z());
      } catch (n) {
        d("File could not be opened: " + n.message, { severity: "error", category: "Files" });
      } finally {
        k.target.value = "", U();
      }
    }
  };
  async function le(k) {
    h = !0, U();
    const r = be.inert;
    be.inert = !0;
    try {
      const n = Ft(k), N = xt(n.source, { files: n.libraries });
      if (N.diagnostics.some((B) => B.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const v = qe(N);
      if (!v.contexts[n.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const B of n.sheets) {
        if (!v.contexts[B.scope]) throw Error("Unknown saved sheet: " + B.scope);
        const Z = Ve(v, { focus: B.scope });
        if (Z.topology.signature !== B.topology) throw Error("Saved topology differs from the netlist: " + (B.scope || "Top"));
        const re = new Map(Z.components.filter((ee) => ee.kind !== "K").map((ee) => [ee.name, ee]));
        for (const ee of B.snapshot.components) {
          if (ee.decoration) continue;
          const V = re.get(ee.id);
          if (!V || ee.ports.length !== Object.keys(V.terminals).length || ee.ports.some((ne) => Z.nodes[V.terminals[ne.pin]]?.bit !== ne.bit)) throw Error("Saved pin connectivity differs from the netlist: " + ee.id);
          re.delete(ee.id);
        }
        if (re.size) throw Error("Saved sheet omits components.");
        d("Checking saved sheet " + (B.scope || "Top") + "…", { category: "Files" });
        const de = Qe(Z), se = await Ke(de, B.settings), he = new DOMParser().parseFromString(se.svg, "image/svg+xml").documentElement;
        for (const ee of Object.values(Z.nodes)) for (const V of he.querySelectorAll(".net_" + ee.bit)) V.setAttribute("data-net", ee.name);
        Ht(Wt(he, se.drawing, Z, de), B.snapshot, B.settings.gridSize);
      }
      n.sheets.some((B) => B.scope === n.focus && JSON.stringify(B.settings) === JSON.stringify(n.settings)) || (d("Checking current sheet…", { category: "Files" }), await Ke(Qe(Ve(v, { focus: n.focus })), n.settings)), u.invalidate(), u.restoreSheets(n.sheets), g = new Map(n.sheets.filter((B) => B.view).map((B) => [B.scope, B.view])), g.set(n.focus, n.view), t.value = n.source, P = n.libraries, y = v, E = N, _ = n.source, w = n.focus, x = "";
      for (const B of ["font", "size"]) j(B).value = B === "font" ? n.settings.font : n.settings.fontSize;
      for (const [B, Z] of Object.entries({ detailed: n.settings.detailed, conventional: n.settings.conventional, grid: !!n.settings.gridSize, "show-grid": n.showGrid, interactive: n.interactive, flywire: n.flywire })) j(B).checked = Z;
      j("grid-size").value = n.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (w ? "#" + new URLSearchParams({ instance: w }) : "")), J.restore(n.colors), O(Object.values(Pe).find((B) => B.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(P)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      j("library-status").textContent = Object.keys(P).length + " project library file(s) loaded", await z(), p && (o.textContent += " Project restored.", i.append({ message: "Project restored.", category: "Files" }));
    } finally {
      be.inert = r, h = !1, U();
    }
  }
  j("libraries").onchange = async (k) => {
    try {
      for (const r of k.target.files) {
        if (r.size > 16e6) throw Error("Library exceeds 16 MB: " + r.name);
        P[r.webkitRelativePath || r.name] = await Nt(r);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(P));
      } catch {
      }
      u.invalidate(), u.clearSheets(), g.clear(), y = null, _ = "", j("library-status").textContent = Object.keys(P).length + " library file(s) loaded", z();
    } catch (r) {
      d(r.message, { severity: "error", category: "Files" });
    } finally {
      k.target.value = "";
    }
  }, j("library-status").textContent = Object.keys(P).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const oe = j("download-dialog");
  be.addEventListener("spice:workspacechange", () => {
    oe.open && oe.close();
  }), j("open-download").onclick = () => {
    U(), oe.showModal();
  }, j("close-download").onclick = () => oe.close(), oe.addEventListener("click", (k) => {
    if (k.target !== oe) return;
    const r = oe.getBoundingClientRect();
    (k.clientX < r.left || k.clientX > r.right || k.clientY < r.top || k.clientY > r.bottom) && oe.close();
  }), document.addEventListener("keydown", (k) => {
    oe.open && !(k.altKey && k.key === "Escape") && (k.stopImmediatePropagation(), k.key === "Escape" && (k.preventDefault(), oe.close()));
  }, { capture: !0 }), j("upload").onclick = () => j("file").click(), j("download-project").onclick = () => {
    try {
      const k = u.snapshotSheets().filter((v) => y?.contexts[v.scope] && Ve(y, { focus: v.scope }).topology.signature === v.topology).map((v) => ({ ...v, ...g.has(v.scope) ? { view: g.get(v.scope) } : {} })), r = Jn({ source: t.value, libraries: P, settings: W(), displayGridStep: Number(j("grid-size").value), showGrid: j("show-grid").checked, interactive: j("interactive").checked, flywire: j("flywire").checked, focus: w, view: { ...C }, colors: J.snapshot(), sheets: k });
      oe.close();
      const n = URL.createObjectURL(new Blob([r], { type: "application/json;charset=utf-8" })), N = document.createElement("a");
      N.href = n, N.download = "spice-schematic.spiceproj", N.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3), d("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (k) {
      d("Project save failed: " + k.message, { severity: "error", category: "Files" });
    }
  }, j("download").onclick = () => {
    oe.close();
    const k = URL.createObjectURL(new Blob([p], { type: "image/svg+xml;charset=utf-8" })), r = document.createElement("a");
    r.href = k, r.download = "spice-schematic.svg", r.click(), setTimeout(() => URL.revokeObjectURL(k), 1e3), d("SVG downloaded.", { category: "Export" });
  };
  async function we(k) {
    const r = c;
    if (!(!r || S || l)) {
      l = !0, U(), d("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: n } = await import("./asc-export-DxxbghSp.js");
        if (c !== r) throw Error("Schematic changed. Generate again before exporting ASC.");
        s ||= n({ tree: y, circuit: m, drawing: r, source: t.value, libraries: P });
        const N = k ? s.zip : s.ascBytes, v = URL.createObjectURL(new Blob([N], { type: k ? "application/zip" : "application/octet-stream" })), B = document.createElement("a");
        B.href = v, B.download = k ? "spice-schematic-asc.zip" : "spice-schematic.asc", B.click(), setTimeout(() => URL.revokeObjectURL(v), 1e3), o.textContent = "ASC connections verified · " + s.manifest.audit.symbols + " symbols. " + (k ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), s.manifest.warnings.length && (o.textContent += " " + s.manifest.warnings.join(" ")), i.append({ message: o.textContent, category: "Export", severity: s.manifest.warnings.length ? "warning" : "info" });
      } catch (n) {
        d("ASC export failed: " + n.message, { severity: "error", category: "Export" });
      } finally {
        l = !1, U();
      }
    }
  }
  j("download-asc").onclick = () => {
    oe.close(), we(!1);
  }, j("download-asc-bundle").onclick = () => {
    oe.close(), we(!0);
  }, j("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(p), d("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      j("source-details").open = !0, j("source").focus(), j("source").select(), d("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, z();
}
export {
  st as b,
  qe as e,
  Me as l,
  it as n,
  vn as p
};
