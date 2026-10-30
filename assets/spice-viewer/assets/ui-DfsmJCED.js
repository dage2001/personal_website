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
}, nt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ie = (t) => t.toLowerCase(), xe = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), rt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function ot(t, e) {
  const n = (E) => e[ie(E || "")] || Object.entries(e).find(([w]) => w.startsWith(ie(E || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let r = [], u = [], a = "", o = "", c = [], d = [], l = 0, g = "", p = "", m = "", _ = !0;
  if ("RLC".includes(i))
    r = ["A", "B"], o = ie(i) + "_v";
  else if ("DVIB".includes(i))
    r = ["+", "-"], o = i === "D" ? "d_v" : i === "B" ? "spice_b" : ie(i);
  else if (i === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !xe(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), a = t[r.length + 1] || "";
    const E = n(a)?.type;
    _ = ["NPN", "PNP"].includes(E), o = _ ? (r.length === 3 ? "q_" : "spice_q4_") + ie(E) : "spice_q" + r.length;
  } else if (i === "M") {
    const E = n(t[4]), w = n(t[5]), f = E?.type === "VDMOS" || !w && (!t[5] || xe(t[5]));
    r = f ? ["D", "G", "S"] : ["D", "G", "S", "B"], a = t[r.length + 1] || "";
    const I = n(a), C = I?.type;
    if (f && I && C !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!f && C === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    _ = ["NMOS", "PMOS", "VDMOS"].includes(C);
    let O = null, v = I;
    const R = /* @__PURE__ */ new Set();
    for (; v && !R.has(v.name) && (R.add(v.name), O = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(v.raw), !O); )
      v = n(v.baseModel);
    const P = C === "PMOS" || C === "VDMOS" && O && (O[1] === void 0 || Number(O[1]) >= 0.5);
    o = _ ? "spice_" + (P ? "pmos" : "nmos") + (f ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    a = t[4] || "";
    const E = n(a)?.type, w = i === "Z" && ["NIGBT", "PIGBT"].includes(E);
    r = w ? ["C", "G", "E"] : ["D", "G", "S"], _ = i === "J" ? ["NJF", "PJF"].includes(E) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(E), o = "spice_" + (w ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(E || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    r = ["+", "-"], o = "spice_" + ie(i);
    let E = 3, w = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[E] || "");
    if (/^poly$/i.test(t[E] || "") && (w = /^\(\s*(\d+)\s*\)$/.exec(t[++E] || ""), !w))
      throw Error("POLY requires a dimension.");
    if (w) {
      const f = Number(w[1]);
      if (f > 128) throw Error("POLY supports at most 128 controlling variables.");
      let I = E + 1, C = [];
      const O = "EG".includes(i), v = f * (O ? 2 : 1);
      for (; C.length < v && I < t.length; ) C.push(...rt(t[I++]));
      if (C.length !== v || I >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (O) {
        for (let R = 0; R < f; R++) r.push("C" + (R + 1) + "+", "C" + (R + 1) + "-");
        u = [t[1], t[2], ...C];
      } else c = C;
      l = I, g = "POLY(" + f + ") " + (O ? "" : C.join(" ") + " "), p = "POLY", O && (o = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? p = "BEHAVIORAL" : "EG".includes(i) ? (r.push("C+", "C-"), p = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], l = 4, g = t[3] + " ");
    m = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (p ? " · " + p : "");
  } else if (i === "S")
    r = ["A", "B", "C+", "C-"], a = t[5] || "", o = "spice_device", m = "Voltage switch";
  else if (i === "W")
    r = ["A", "B"], c = [t[3]], a = t[4] || "", l = 3, o = "spice_device", m = "Current switch";
  else if ("TO".includes(i))
    r = ["L+", "L-", "R+", "R-"], i === "O" && (a = t[5] || ""), o = "spice_device", m = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    r = ["N1", "N2", "COM"], a = t[4] || "", o = "spice_device", m = "Distributed RC";
  else if (i === "A")
    r = Array.from({ length: 8 }, (E, w) => "P" + (w + 1)), o = "spice_device", m = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (d = t.slice(1, -1), d.some((E) => !/^L/i.test(E.split(":").at(-1)))) throw Error("K references must name inductors.");
    l = t.length - 1, o = "spice_coupling", m = "Magnetic coupling", g = d.join(" ") + " · k=";
  } else if (i === "@")
    r = ["IN", "OUT"], o = "spice_device", m = "FRA";
  else if (i === "&")
    r = ["O+", "O-", "I+", "I-"], o = "spice_device", m = "FRA probe";
  else if (i === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], o = "spice_device", m = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (l || (l = r.length + 1), u.length || (u = t.slice(1, r.length + 1)), u.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= l && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (u.some((E) => /[=()]/.test(E) && !/^\{[\s\S]*\}$/.test(E))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(l).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(l).join(" ")) && (o = "spice_br"), i === "D" && (a = t[3] || ""), i === "@") {
    const E = t.slice(l).join(" ");
    for (const w of E.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(w[1].toUpperCase()), u.push(w[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((E) => !E)) throw Error("Missing controlling voltage source.");
  const h = r.map((E, w) => i === "A" && tt[(t[9] || "").toUpperCase()]?.[String(w + 1)] || E);
  return { kind: i, pins: r, nodeTokens: u, pinLabels: h, model: a, type: o, controlSource: c[0] || "", controlSources: c, coupledInductors: d, value: g + t.slice(l).join(" "), sourceMode: p, symbol: m, polarityKnown: _ };
}
const it = nt, st = new Set(it.split(" ")), we = () => /* @__PURE__ */ Object.create(null), K = (t) => t.toLowerCase();
function he(t) {
  const e = [], n = [];
  let i = "", r = 0, u = "";
  for (let a = 0; a < t.length; a++) {
    const o = t[a];
    if (u) {
      i += o, o === u && t[a - 1] !== "\\" && (u = "");
      continue;
    }
    if (o === '"' || o === "'") {
      u = o, i += o;
      continue;
    }
    if (!r && (o === ";" || o === "$" && (!a || /\s/.test(t[a - 1])))) break;
    if ("({".includes(o) && (n.push(o), r++), ")}".includes(o) && (r--, n.pop() !== (o === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(o) && !r ? (i && e.push(i), i = "") : i += o;
  }
  if (r || u) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function at(t, e = {}) {
  const n = [], i = [], r = [], u = Object.assign(we(), e.models), a = we(), o = (w, f, I) => n.push({ severity: w, line: f, message: I });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((w, f) => {
    const I = w.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? c.length ? c.at(-1).text += " " + I.slice(1).trim() : o("error", f + 1, "Continuation has no preceding statement.") : c.push({ line: f + 1, text: I }));
  });
  for (const w of c) {
    try {
      w.tokens = he(w.text);
    } catch (I) {
      o("error", w.line, I.message), w.tokens = [];
    }
    const f = w.tokens;
    if (/^\.model$/i.test(f[0] || ""))
      if (f.length < 3) o("error", w.line, ".model requires a name and device type.");
      else {
        const I = /^ako:(.+)$/i.exec(f[2]), C = I && f[3] && !f[3].startsWith("(") ? f[3].split("(")[0].toUpperCase() : "";
        u[K(f[1])] = { name: f[1], type: I ? C : f[2].split("(")[0].toUpperCase(), baseModel: I?.[1] || "", raw: w.text };
      }
  }
  const d = /* @__PURE__ */ new Set();
  function l(w) {
    const f = u[K(w)];
    if (!f) return "";
    if (f.type) return f.type;
    if (d.has(K(w))) throw Error("Circular AKO model inheritance: " + w);
    return d.add(K(w)), f.type = l(f.baseModel), d.delete(K(w)), f.type;
  }
  for (const w of Object.values(u)) if (w.baseModel && !w.type)
    try {
      l(w.name);
    } catch (f) {
      o("error", 0, f.message);
    }
  let g = "", p = 0, m = !1, _ = !1;
  const h = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: w, text: f, tokens: I } of c) {
    if (!I.length) continue;
    const C = K(I[0]);
    if (_) {
      o("warning", w, "Statement after .end is not rendered: " + f);
      continue;
    }
    if (C === ".control") {
      m = !0, o("warning", w, ".control script retained but not executed or rendered.");
      continue;
    }
    if (C === ".endc") {
      m = !1;
      continue;
    }
    if (m) continue;
    if (C === ".subckt") {
      p++, o("error", w, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (C === ".ends") {
      p ? p-- : o("error", w, "Unmatched .ends.");
      continue;
    }
    if (p) continue;
    if (C === ".end") {
      _ = !0;
      continue;
    }
    if (C.startsWith(".")) {
      i.push({ line: w, text: f }), C === ".title" ? g = I.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(C) ? o("error", w, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(C) ? o("error", w, "Topology-changing directive is unsupported: " + f) : E.has(C) || o("warning", w, "Directive retained but not resolved: " + f);
      continue;
    }
    const O = I[0][0].toUpperCase();
    if (!st.has(O)) {
      w === 1 && !/\d/.test(I[0]) && I.length > 1 && O !== "X" ? (g = f, o("warning", w, "First line treated as a SPICE title; use .title for an unambiguous title.")) : o("warning", w, `Unsupported ${O} device was not rendered: ${f}`);
      continue;
    }
    const v = O === "M" || O === "Q" ? 5 : 4;
    if (w === 1 && !/\d/.test(I[0]) && (I.length < v || O === "T" && !/\b(?:zo|z0)\s*=/i.test(f))) {
      g = f, o("info", w, "SPICE title: " + f);
      continue;
    }
    try {
      if (h.has(C)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const R = ot(I, u), { pins: P, nodeTokens: s, ...y } = R;
      R.polarityKnown || o("warning", w, `${I[0]}: model polarity unknown; explicit ${P.join("/")} terminals retained.`);
      const x = we();
      P.forEach((V, U) => {
        const D = K(s[U]);
        a[D] || (a[D] = { name: D, displayName: I[U + 1], bit: Object.keys(a).length + 2, terminals: [] }), a[D].terminals.push({ component: I[0], pin: V }), x[V] = D;
      }), r.push({ ...y, name: I[0], terminals: x, line: w, raw: f }), h.add(C);
    } catch (R) {
      o("error", w, `${I[0]}: ${R.message} Statement: ${f}`);
    }
  }
  p && o("error", 0, "Unclosed .subckt definition."), m && o("error", 0, "Unclosed .control block."), r.length || o("error", 0, "No supported components to render."), r.length > 300 && o("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const w of r) {
    for (const f of w.controlSources || []) !f.includes(":") && !r.some((I) => K(I.name) === K(f) && I.kind === "V") && o("error", w.line, `${w.name}: controlling voltage source ${f} was not found.`);
    for (const f of w.coupledInductors || []) !f.includes(":") && !r.some((I) => K(I.name) === K(f) && I.kind === "L") && o("error", w.line, `${w.name}: coupled inductor ${f} was not found.`);
    (w.kind === "B" || w.type === "spice_b") && o("info", w.line, `${w.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: g, components: r, nodes: a, models: u, directives: i, diagnostics: n };
}
const te = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Re = (t) => te(t).split("/").at(-1);
function ct(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), r = [], u = [], a = [];
  let o = 0;
  const c = (l, g) => {
    const p = te(g).split("/").slice(0, -1).concat(te(l)).join("/"), m = [...i].filter(([h]) => te(h) === te(l) || te(h) === p);
    if (m.length === 1) return m[0];
    const _ = [...i].filter(([h]) => Re(h) === Re(l));
    if (_.length !== 1) throw Error(_.length ? "Ambiguous library filename: " + l : "Missing library " + l + ". Add this file using Library files.");
    return _[0];
  };
  function d(l, g, p = "", m = []) {
    const _ = te(g) + ":" + p.toLowerCase();
    if (m.includes(_)) throw Error("Circular library include: " + [...m, _].join(" → "));
    if (m.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const h = [], E = /^\s*\.endl\b/im.test(l);
    let w = !p;
    const f = (C, O) => {
      if (o += C.length, o > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      a.push(C), u.push({ file: g, line: O + 1 });
    };
    if (l.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((C, O) => {
      const v = C.trim();
      if (/^\.lib\b/i.test(v) && E) {
        const R = he(v);
        if (R.length === 2 && !/[.\\/]/.test(R[1])) {
          h.push(R[1].toLowerCase()), R[1].toLowerCase() === p.toLowerCase() && (w = !0), f("* Library section " + R[1], O);
          return;
        }
      }
      if (/^\.endl\b/i.test(v)) {
        h.pop(), f("* End library section", O);
        return;
      }
      if (p && h.length && !h.includes(p.toLowerCase())) {
        f("* Unselected library section", O);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(v))
        try {
          const R = he(v);
          if (!R[1]) throw Error("Include requires a filename.");
          const [P, s] = c(R[1], g);
          f("* Included " + P, O), d(s, P, R[2] || "", [...m, _]);
        } catch (R) {
          r.push({ severity: "error", line: O + 1, source: g, message: R.message }), f("* Unresolved include", O);
        }
      else f(C, O);
    }), !w) throw Error("Library section " + p + " not found in " + g);
  }
  try {
    d(t, n);
  } catch (l) {
    r.push({ severity: "error", line: 0, source: n, message: l.message });
  }
  return { source: a.join(`
`), origins: u, diagnostics: r };
}
function lt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], r = [];
  t.split(/\r?\n/).forEach((o, c) => {
    const d = o.trim();
    /^\.subckt\b/i.test(d) && (i.push(c + 1), n.set(c + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: o, line: c + 1 }) : e[c] = o, /^\.ends\b/i.test(d) && i.length > 1 && i.pop();
  });
  const u = Se(Array.from({ length: t.split(/\r?\n/).length }, (o, c) => e[c] || "").join(`
`));
  r.push(...u.diagnostics);
  const a = /* @__PURE__ */ new Map();
  for (const [o, c] of n) {
    const d = Se(c.map((l) => l.raw).join(`
`));
    a.set(o, d.layout), r.push(...d.diagnostics.map((l) => ({ ...l, line: c[l.line - 1]?.line || o })));
  }
  return { layout: u.layout, scopes: a, diagnostics: r };
}
function Se(t) {
  const e = [], n = [];
  let i = !1, r = !1, u = 0;
  if (t.split(/\r?\n/).forEach((f, I) => {
    const C = f.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(C)) {
      (r || i) && e.push({ severity: "error", line: I + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(C) || e.push({ severity: "error", line: I + 1, message: "Expected @layout begin v1." }), r = !0, i = !0, u = I + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(C)) {
      i || e.push({ severity: "error", line: I + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (C.startsWith("*") ? n.push(C.slice(1).trim()) : e.push({ severity: "error", line: I + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const a = n.join(" "), o = a.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], d = [], l = [], g = [];
  let p = 0, m = 0, _ = 10;
  const h = () => o[p++], E = () => {
    const f = h();
    if (!f || !/^[A-Za-z_@][\w./%:@-]*$/.test(f)) throw Error("Expected layout identifier, got " + f);
    return f;
  };
  function w(f) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const I = f ? E() : "@row" + m++, C = h();
    if (!["row", "column", "classic"].includes(C)) throw Error("Expected row, column or classic.");
    if (h() !== "{") throw Error("Expected { after " + C);
    const O = { id: I, direction: C, members: [] };
    for (c.push(O); p < o.length && o[p] !== "}"; )
      o[p] === "group" ? (h(), O.members.push(w(!0))) : ["row", "column"].includes(o[p]) ? O.members.push(w(!1)) : O.members.push(E());
    if (h() !== "}") throw Error("Unclosed group " + I);
    if (!O.members.length) throw Error("Empty layout group " + I);
    return I;
  }
  try {
    for (; p < o.length; )
      if (o[p] === "group")
        h(), w(!0);
      else if (["row", "column"].includes(o[p])) w(!1);
      else if (o[p] === "face") {
        h();
        const s = E(), y = h();
        if (!["left", "right"].includes(y)) throw Error("Expected face left or right.");
        if (g.some((x) => x.device.toLowerCase() === s.toLowerCase())) throw Error("Duplicate face device.");
        g.push({ device: s, side: y });
      } else if (o[p] === "pair") {
        h();
        const s = h();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "push-pull"].includes(s)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode or push-pull.");
        if (h() !== "{") throw Error("Expected { after pair kind.");
        const y = [];
        for (; p < o.length && o[p] !== "}"; ) y.push(E());
        if (h() !== "}" || !y.length) throw Error("Empty or unclosed pair.");
        if (l.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        l.push({ kind: s, members: y });
      } else if (o[p] === "priority-cap") {
        if (h(), _ = Number(h()), !Number.isInteger(_) || _ < 3 || _ > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (h() === "place") {
        const s = E(), y = h(), x = E();
        if (!["left-of", "above"].includes(y)) throw Error("Expected left-of or above.");
        d.push({ a: s, relation: y, b: x });
      } else throw Error("Unknown layout instruction near " + o[p - 1]);
    const f = /* @__PURE__ */ new Set();
    for (const s of c) {
      const y = s.id.toLowerCase();
      if (f.has(y)) throw Error("Duplicate layout group " + s.id);
      f.add(y);
    }
    const I = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), O = new Map(c.map((s) => [s.id.toLowerCase(), s])), v = (s) => {
      if (I.has(s)) throw Error("Circular layout group " + s);
      if (!C.has(s)) {
        I.add(s);
        for (const y of O.get(s).members) O.has(y.toLowerCase()) && v(y.toLowerCase());
        I.delete(s), C.add(s);
      }
    };
    for (const s of O.keys()) v(s);
    const R = /* @__PURE__ */ new Map();
    for (const s of d) {
      if (s.a.toLowerCase() === s.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      R.has(s.a.toLowerCase()) || R.set(s.a.toLowerCase(), []), R.get(s.a.toLowerCase()).push(s.b.toLowerCase());
    }
    I.clear(), C.clear();
    const P = (s) => {
      if (I.has(s)) throw Error("Circular place constraints.");
      if (!C.has(s)) {
        I.add(s);
        for (const y of R.get(s) || []) P(y);
        I.delete(s), C.add(s);
      }
    };
    for (const s of R.keys()) P(s);
  } catch (f) {
    e.push({ severity: "error", line: u, message: "Layout description: " + f.message });
  }
  return { layout: { version: 1, priorityCap: _, groups: c, relations: d, pairs: l, faces: g }, diagnostics: e };
}
function dt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const m = new Set(n.groups.map((h) => h.id.toLowerCase())), _ = (h) => m.has(h.toLowerCase()) ? h : e.components.find((w) => w.synthetic && w.value.toLowerCase() === h.toLowerCase())?.name || e.focus + "/" + h;
    i = { ...n, groups: n.groups.map((h) => ({ ...h, members: h.members.map(_) })), relations: n.relations.map((h) => ({ ...h, a: _(h.a), b: _(h.b) })), faces: (n.faces || []).map((h) => ({ ...h, device: _(h.device) })), pairs: (n.pairs || []).map((h) => ({ ...h, members: h.members.map(_) })) };
  }
  const r = new Map(i.groups.map((m) => [m.id.toLowerCase(), m])), u = Object.values(t.contexts).flatMap((m) => m.devices.map((_) => _.name)), a = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((m) => m.name)].map((m) => m.toLowerCase()));
  for (const m of r.values()) if (a.has((n ? e.focus + "/" + m.id : m.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + m.id);
  for (const m of r.values()) for (const _ of m.members) if (!r.has(_.toLowerCase()) && !a.has(_.toLowerCase())) throw Error("Unknown @layout instance/device: " + _);
  for (const m of i.relations) for (const _ of [m.a, m.b]) if (!r.has(_.toLowerCase()) && !a.has(_.toLowerCase())) throw Error("Unknown @layout place target: " + _);
  const o = (i.pairs || []).map((m) => ({ ...m, members: m.members.map((_) => {
    const h = e.components.find((E) => E.name.toLowerCase() === _.toLowerCase());
    if (!h || h.synthetic || h.block) throw Error("Unknown or non-visible @layout pair device: " + _);
    return h.name;
  }) })), c = (i.faces || []).map((m) => {
    const _ = e.components.find((h) => h.name.toLowerCase() === m.device.toLowerCase());
    if (!_ || !["Q", "M", "J", "Z"].includes(_.kind)) throw Error("Unknown or unsupported @layout face device: " + m.device);
    return { ...m, device: _.name };
  }), d = /* @__PURE__ */ new Map(), l = [], g = new Set(Object.keys(t.contexts).map((m) => m.toLowerCase()));
  for (const m of i.groups) {
    const _ = [];
    for (const h of m.members) {
      if (r.has(h.toLowerCase())) {
        _.push({ group: h });
        continue;
      }
      for (const E of e.components) if (E.name.toLowerCase() === h.toLowerCase() || E.name.toLowerCase().startsWith(h.toLowerCase() + "/")) {
        if (d.has(E.name)) throw Error("Overlapping @layout membership: " + E.name);
        d.set(E.name, m.id), _.push({ cell: E.name, ...g.has(h.toLowerCase()) ? { instance: h } : {} });
      }
    }
    l.push({ id: m.id, direction: m.direction, members: _ });
  }
  const p = /* @__PURE__ */ new Set();
  for (const m of l) for (const _ of m.members) if (_.group) {
    const h = _.group.toLowerCase();
    if (p.has(h)) throw Error("Layout group has multiple parents: " + _.group);
    p.add(h);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: l, relations: i.relations, pairs: o, faces: c };
}
const ae = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function Qe(t) {
  const e = ae();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!r) throw Error("Expected named parameter assignment, got: " + i);
    const u = X(r[1]);
    let a = r[2];
    if (a === void 0) {
      const o = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!o) throw Error("Expected = after parameter " + u);
      a = o[1];
    }
    if (a || (a = t[++n]), !a || /^params?:$/i.test(a)) throw Error("Missing value for parameter " + u);
    if (Object.hasOwn(e, u)) throw Error("Duplicate parameter: " + u);
    e[u] = a;
  }
  return e;
}
function Le(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, ae()] : [t.slice(0, e), Qe(t.slice(e))];
}
function ut(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = ct(t, e);
  t = n.source;
  const i = lt(t), r = [...n.diagnostics, ...i.diagnostics], u = ae(), a = /* @__PURE__ */ new Set(["0"]), o = (f, I, C) => r.push({ severity: f, line: I, message: C }), c = (f, I, C, O = [], v = ae(), R = 0) => {
    const P = { id: f, name: I, parent: C, ports: O, defaults: v, parameters: ae(), definitions: ae(), devices: [], instances: [], directives: [], line: R, statements: [], layoutDescription: i.scopes.get(R) || null };
    return u[f] = P, P;
  }, d = c("root", "Top", null), l = [d], g = [];
  let p = !1, m = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((f, I) => {
    const C = f.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? g.length ? g.at(-1).text += " " + C.slice(1).trim() : o("error", I + 1, "Continuation has no preceding statement.") : g.push({ text: C, line: I + 1 }));
  });
  for (const { text: f, line: I } of g)
    try {
      const C = he(f);
      if (!C.length) continue;
      const O = X(C[0]), v = l.at(-1);
      if (m) {
        o("warning", I, "Statement after .end is not rendered: " + f);
        continue;
      }
      if (O === ".control") {
        p = !0, o("warning", I, ".control script retained but not executed or rendered.");
        continue;
      }
      if (O === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (O === ".subckt") {
        if (C.length < 2) throw Error(".SUBCKT requires a name.");
        const [R, P] = Le(C.slice(2)), s = X(C[1]);
        if (Object.hasOwn(v.definitions, s)) throw Error("Duplicate subcircuit definition: " + C[1]);
        const y = R.map(X);
        if (new Set(y).size !== R.length || y.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (R.some((V) => /[{}()=]/.test(V))) throw Error("Invalid formal port.");
        if (l.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const x = v.id + "/" + encodeURIComponent(s);
        v.definitions[s] = x, l.push(c(x, C[1], v.id, R, P, I));
        continue;
      }
      if (O === ".ends") {
        if (l.length === 1) throw Error("Unmatched .ENDS.");
        if (C[1] && X(C[1]) !== X(v.name)) throw Error(".ENDS name does not match " + v.name);
        l.pop();
        continue;
      }
      if (O === ".end") {
        if (l.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        m = !0;
        continue;
      }
      if (O === ".param") {
        const R = Qe(C.slice(1));
        for (const [P, s] of Object.entries(R)) {
          if (Object.hasOwn(v.parameters, P)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + P);
          v.parameters[P] = s;
        }
      }
      if (O === ".global") {
        if (C.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const R of C.slice(1)) a.add(X(R));
      }
      if (O.startsWith(".") && v.directives.push({ line: I, text: f }), O.startsWith("x")) {
        const [R, P] = Le(C.slice(1));
        if (!R.length) throw Error("X instance requires a subcircuit name.");
        const s = /;§pnba\s+(.+)$/i.exec(f)?.[1].split(")");
        v.instances.push({ name: C[0], nodes: R.slice(0, -1).map(X), definitionName: R.at(-1), definitionId: null, parameters: P, line: I, raw: f, pinNames: s });
      } else v.statements.push({ line: I, text: f });
    } catch (C) {
      o("error", I, C.message + " Statement: " + f);
    }
  l.length > 1 && o("error", l.at(-1).line, "Unclosed .SUBCKT " + l.at(-1).name), p && o("error", 0, "Unclosed .control block.");
  function _(f, I) {
    for (; f; ) {
      if (Object.hasOwn(f.definitions, X(I))) return f.definitions[X(I)];
      f = u[f.parent];
    }
    return null;
  }
  for (const f of Object.values(u)) {
    const I = [...f.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...f.statements], C = at(I.map((v) => v.text).join(`
`), { models: u[f.parent]?.models });
    f.devices = C.components.map((v) => ({ ...v, line: I[v.line - 1]?.line || f.line })), f.models = C.models, f === d && (d.title = C.title), r.push(...C.diagnostics.filter((v) => !v.message.includes("No supported components to render.") && !v.message.includes("300 components")).map((v) => ({ ...v, line: I[v.line - 1]?.line || f.line })));
    const O = new Set(f.devices.map((v) => X(v.name)));
    for (const v of f.instances)
      if (O.has(X(v.name)) && o("error", v.line, "Duplicate instance/device name: " + v.name), O.add(X(v.name)), v.definitionId = _(f, v.definitionName), !v.definitionId && !/^\{[\s\S]*\}$/.test(v.definitionName)) o("error", v.line, "Undefined subcircuit: " + v.definitionName + " in " + v.name);
      else if (v.definitionId) {
        const R = u[v.definitionId];
        R.ports.length !== v.nodes.length && o("error", v.line, `${v.name}: ${R.name} expects ${R.ports.length} ports; got ${v.nodes.length}.`);
      }
  }
  for (const f of Object.values(u)) delete f.statements;
  const h = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set();
  function w(f, I = []) {
    if (h.has(f)) {
      o("error", u[f].line, "Circular subcircuit reference: " + [...I, u[f].name].join(" → "));
      return;
    }
    if (!E.has(f)) {
      if (h.add(f), I.length >= 64) {
        o("error", u[f].line, "Subcircuit dependency nesting exceeds 64 levels."), h.delete(f), E.add(f);
        return;
      }
      for (const C of u[f].instances) C.definitionId && w(C.definitionId, [...I, u[f].name]);
      h.delete(f), E.add(f);
    }
  }
  for (const f of Object.keys(u)) w(f);
  !d.devices.length && !d.instances.length && o("error", 0, "No supported components or instances to render.");
  for (const f of r) !f.source && f.line && n.origins[f.line - 1] && (f.source = n.origins[f.line - 1].file, f.line = n.origins[f.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: d.title || "", scopes: u, globals: [...a], diagnostics: r, layoutDescription: i.layout };
}
const W = () => /* @__PURE__ */ Object.create(null), se = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ye = (t, e) => se(t.map((n) => n.toLowerCase()), e.toLowerCase());
function pt(t, e = []) {
  const n = W(), i = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [u, a] of Object.entries(r.terminals)) i(a).terminals.push({ component: r.name, pin: u });
  for (const r of e) i(r);
  return n;
}
function ft(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ke = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, mt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function ge(t, e, n = (r) => r, i = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (a) => (r.push(a), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (a, o, c) => {
    const d = c.split(",").map((g) => g.trim());
    if (d.some((g) => !g || /[\s{}+*()]/.test(g))) throw Error("Unsupported dynamic voltage/current reference: " + a);
    const l = o.toUpperCase() + "(" + d.map((g) => o.toLowerCase() === "v" ? n(g) : i(g, o)).join(",") + ")";
    return r.push(l), "@@" + (r.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(mt, (a, o, c) => {
    if (c.slice(o + a.length).trimStart().startsWith("(")) return a;
    const d = e(a.toLowerCase());
    if (d === void 0) return a;
    if (u += d.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (a, o) => r[Number(o)]);
}
function ht(t, e, n, i) {
  const r = { ...e, ...n }, u = W(), a = /* @__PURE__ */ new Set(), o = W();
  for (const [d, l] of Object.entries(i)) o[d] = ge(ke(l), (g) => t[g]);
  function c(d) {
    if (Object.hasOwn(o, d)) return o[d];
    if (Object.hasOwn(u, d)) return u[d];
    if (!Object.hasOwn(r, d)) return t[d];
    if (a.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...a, d].join(" → "));
    }
    return a.add(d), u[d] = ge(ke(r[d]), c), a.delete(d), u[d];
  }
  for (const d of Object.keys(r)) c(d);
  return Object.assign(W(), t, u, o);
}
function Pe(t, e, n, i) {
  let r = "";
  for (let c = 0; c < t.length; ) {
    const d = t[c];
    if (d !== "{" && d !== "'") {
      r += d, c++;
      continue;
    }
    const l = c++;
    let g = 1, p = "";
    for (; c < t.length && g; c++) {
      if (d === "'") {
        t[c] === "'" && (g = 0);
        continue;
      }
      if (p) {
        t[c] === p && (p = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        p = t[c];
        continue;
      }
      t[c] === "{" && g++, t[c] === "}" && g--;
    }
    if (g) throw Error("Unclosed parameter expression.");
    r += d + ge(t.slice(l + 1, c - 1), (m) => e[m], n, i) + (d === "{" ? "}" : "'");
  }
  const u = [];
  let a = 0, o = "";
  for (let c = 0; c < r.length; c++) {
    const d = r[c];
    if (o) {
      d === o && r[c - 1] !== "\\" && (o = "");
      continue;
    }
    if (d === '"' || d === "'") {
      o = d;
      continue;
    }
    if ("({".includes(d) && a++, ")}".includes(d) && a--, !a && (c === 0 || /\s/.test(r[c - 1]))) {
      const l = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(c));
      l && (u.push({ start: c, end: c + l[0].length, key: l[1].toLowerCase() }), c += l[0].length - 1);
    }
  }
  if (u.length) {
    let c = r.slice(0, u[0].start);
    u.forEach((d, l) => {
      const g = u[l + 1]?.start ?? r.length, p = r.slice(d.end, g);
      c += r.slice(d.start, d.end) + (p.includes("{") || ["refnode", "intnode"].includes(d.key) ? p : ge(p, (m) => e[m], n, i));
    }), r = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
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
class b {
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
    return "JavaScript Expression Parser (JSEP) v" + b.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return b.max_unop_len = Math.max(e.length, b.max_unop_len), b.unary_ops[e] = 1, b;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return b.max_binop_len = Math.max(e.length, b.max_binop_len), b.binary_ops[e] = n, i ? b.right_associative.add(e) : b.right_associative.delete(e), b;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return b.additional_identifier_chars.add(e), b;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return b.literals[e] = n, b;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete b.unary_ops[e], e.length === b.max_unop_len && (b.max_unop_len = b.getMaxKeyLen(b.unary_ops)), b;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return b.unary_ops = {}, b.max_unop_len = 0, b;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return b.additional_identifier_chars.delete(e), b;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete b.binary_ops[e], e.length === b.max_binop_len && (b.max_binop_len = b.getMaxKeyLen(b.binary_ops)), b.right_associative.delete(e), b;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return b.binary_ops = {}, b.max_binop_len = 0, b;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete b.literals[e], b;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return b.literals = {}, b;
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
    return new b(e).parse();
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
    return b.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !b.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    b.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return b.isIdentifierStart(e) || b.isDecimalDigit(e);
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
    if (b.hooks[e]) {
      const i = { context: this, node: n };
      return b.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (b.hooks[e]) {
      const n = { context: this };
      return b.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === b.SPACE_CODE || e === b.TAB_CODE || e === b.LF_CODE || e === b.CR_CODE; )
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
      type: b.COMPOUND,
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
      if (i = this.code, i === b.SEMCOL_CODE || i === b.COMMA_CODE)
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
    let e = this.expr.substr(this.index, b.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (b.binary_ops.hasOwnProperty(e) && (!b.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !b.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, r, u, a, o, c, d;
    if (a = this.gobbleToken(), !a || (n = this.gobbleBinaryOp(), !n))
      return a;
    for (u = { value: n, prec: b.binaryPrecedence(n), right_a: b.right_associative.has(n) }, o = this.gobbleToken(), o || this.throwError("Expected expression after " + n), r = [a, u, o]; n = this.gobbleBinaryOp(); ) {
      if (i = b.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: i, right_a: b.right_associative.has(n) }, d = n;
      const l = (g) => u.right_a && g.right_a ? i > g.prec : i <= g.prec;
      for (; r.length > 2 && l(r[r.length - 2]); )
        o = r.pop(), n = r.pop().value, a = r.pop(), e = {
          type: b.BINARY_EXP,
          operator: n,
          left: a,
          right: o
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + d), r.push(u, e);
    }
    for (c = r.length - 1, e = r[c]; c > 1; )
      e = {
        type: b.BINARY_EXP,
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
    if (e = this.code, b.isDecimalDigit(e) || e === b.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === b.SQUOTE_CODE || e === b.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === b.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, b.max_unop_len), i = n.length; i > 0; ) {
        if (b.unary_ops.hasOwnProperty(n) && (!b.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !b.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: b.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      b.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), b.literals.hasOwnProperty(r.name) ? r = {
        type: b.LITERAL,
        value: b.literals[r.name],
        raw: r.name
      } : r.name === b.this_str && (r = { type: b.THIS_EXP })) : e === b.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === b.PERIOD_CODE || n === b.OBRACK_CODE || n === b.OPAREN_CODE || n === b.QUMARK_CODE; ) {
      let i;
      if (n === b.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== b.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === b.OBRACK_CODE ? (e = {
        type: b.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== b.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === b.OPAREN_CODE ? e = {
        type: b.CALL_EXP,
        arguments: this.gobbleArguments(b.CPAREN_CODE),
        callee: e
      } : (n === b.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: b.MEMBER_EXP,
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
    for (; b.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === b.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); b.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); b.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      b.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, b.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === b.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === b.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: b.LITERAL,
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
      let u = this.expr.charAt(this.index++);
      if (u === i) {
        r = !0;
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
    return r || this.throwError('Unclosed quote after "' + e + '"'), {
      type: b.LITERAL,
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
    for (b.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, b.isIdentifierPart(e)); )
      this.index++;
    return {
      type: b.IDENTIFIER,
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
      let u = this.code;
      if (u === e) {
        i = !0, this.index++, e === b.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (u === b.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === b.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === b.CBRACK_CODE)
            for (let a = n.length; a < r; a++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const a = this.gobbleExpression();
        (!a || a.type === b.COMPOUND) && this.throwError("Expected comma"), n.push(a);
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
    let e = this.gobbleExpressions(b.CPAREN_CODE);
    if (this.code === b.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: b.SEQUENCE_EXP,
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
      type: b.ARRAY_EXP,
      elements: this.gobbleArguments(b.CBRACK_CODE)
    };
  }
}
const Et = new gt();
Object.assign(b, {
  hooks: Et,
  plugins: new bt(b),
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
b.max_unop_len = b.getMaxKeyLen(b.unary_ops);
b.max_binop_len = b.getMaxKeyLen(b.binary_ops);
const ce = (t) => new b(t).parse(), wt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(b).filter((t) => !wt.includes(t) && ce[t] === void 0).forEach((t) => {
  ce[t] = b[t];
});
ce.Jsep = b;
const yt = "ConditionalExpression";
var _t = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: yt,
            test: i,
            consequent: r,
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
ce.plugins.register(_t);
const Nt = "ConditionalExpression";
var Ct = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: Nt,
            test: i,
            consequent: r,
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
ce.plugins.register(Ct);
const It = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Ae = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, H = (t) => Number(t) > 0.5;
function ue(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function r(o) {
    return o = String(o).trim(), /^\{[\s\S]*\}$/.test(o) && (o = o.slice(1, -1)), o = o.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, d, l, g] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), p = l.toLowerCase(), m = p.startsWith("meg") ? 1e6 : p.startsWith("mil") ? 254e-7 : It[p[0]] || 1;
      return "(" + (g ? +(d + (d.includes(".") ? "" : ".") + g) : Number(d)) * m + ")";
    }), u(ce(o));
  }
  function u(o) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (o.type === "Literal") return o.value;
    if (o.type === "Identifier") {
      const c = o.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + o.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const d = r(e[c]);
      return n.delete(c), d;
    }
    if (o.type === "ConditionalExpression") return H(u(o.test)) ? u(o.consequent) : u(o.alternate);
    if (o.type === "UnaryExpression") {
      const c = u(o.argument);
      if (o.operator === "-") return -c;
      if (o.operator === "+") return +c;
      if (o.operator === "!" || o.operator === "~") return !H(c);
    }
    if (o.type === "BinaryExpression") {
      const c = u(o.left);
      if (o.operator === "&&") return H(c) && H(u(o.right));
      if (o.operator === "||") return H(c) || H(u(o.right));
      const d = u(o.right);
      switch (o.operator) {
        case "+":
          return c + d;
        case "-":
          return c - d;
        case "*":
          return c * d;
        case "/":
          return c / d;
        case "**":
          return c ** d;
        case "%":
          return c % d;
        case "^":
          return H(c) !== H(d);
        case "&":
          return H(c) && H(d);
        case "|":
          return H(c) || H(d);
        case ">":
          return c > d;
        case "<":
          return c < d;
        case ">=":
          return c >= d;
        case "<=":
          return c <= d;
        case "==":
        case "===":
          return c === d;
        case "!=":
        case "!==":
          return c !== d;
      }
    }
    if (o.type === "CallExpression" && o.callee.type === "Identifier") {
      const c = o.callee.name.toLowerCase();
      if (c === "if") {
        if (o.arguments.length !== 3) throw Error("if() needs three arguments.");
        return H(u(o.arguments[0])) ? u(o.arguments[1]) : u(o.arguments[2]);
      }
      if (Object.hasOwn(Ae, c)) return Ae[c](...o.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const a = r(t);
  if (typeof a == "number" && !Number.isFinite(a)) throw Error("Structural expression is not finite.");
  return a;
}
function vt(t) {
  ft(t);
  const e = W(), n = /* @__PURE__ */ new Map();
  let i = 0, r = 0;
  function u(a, o, c, d, l, g, p) {
    if (o.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++i > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const m = t.scopes[a], _ = o.length ? se(o.slice(0, -1), o.at(-1)) : "", h = W();
    if (p.some((O) => O.scopeId === a)) throw Error("Circular subcircuit reference at " + _);
    const E = ht(d, m.defaults, m.parameters, l);
    function w(O) {
      if (/^\{[\s\S]*\}$/.test(O)) {
        const R = ue(O, E);
        O = String(typeof R == "boolean" ? Number(R) : R);
      }
      /^"[\s\S]*"$/.test(O) && (O = O.slice(1, -1));
      const v = O.toLowerCase();
      return Object.hasOwn(c, v) ? c[v] : t.globals.includes(v) ? ye([], v) : h[v] || (h[v] = ye(o, v));
    }
    const f = { id: _, path: o, scopeId: a, name: g?.name || "Top", definition: m.name, ports: m.ports.map((O) => ({ name: O, node: w(O) })), params: E, nodes: h, models: W(), devices: [], children: [], raw: g?.raw || "", line: g?.line || 0 };
    e[_] = f, n.set(_, w);
    const I = [...p, f];
    function C(O) {
      if (!O) return "";
      let v = m;
      for (; v; ) {
        if (v.directives.some((R) => new RegExp("^\\.model\\s+" + O.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(R.text))) {
          const R = [...I].reverse().find((P) => P.scopeId === v.id);
          return se(R?.path || [], O.toLowerCase());
        }
        v = t.scopes[v.parent];
      }
      return O;
    }
    for (const O of m.directives.filter((v) => /^\.model\b/i.test(v.text))) {
      const v = /^\.model\s+(\S+)/i.exec(O.text)?.[1];
      if (!v) continue;
      const R = C(v), P = m.models[v.toLowerCase()], s = Pe(O.text, E, w, (y) => se(o, y));
      f.models[R] = { ...P, name: R, raw: s.replace(/^(\.model\s+)\S+/i, (y, x) => x + R), instanceId: _, parameters: E };
    }
    for (const O of m.devices) {
      if (++r > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const v = W();
      for (const [P, s] of Object.entries(O.terminals)) v[P] = w(s);
      const R = C(O.model);
      f.devices.push({ ...O, name: se(o, O.name), localName: O.name, instanceId: _, terminals: v, model: R, parameters: E });
    }
    for (const O of m.instances) {
      let v = O.definitionId;
      if (!v) {
        const y = String(ue(O.definitionName, E)).toLowerCase();
        let x = m;
        for (; x && !v; )
          v = x.definitions[y], x = t.scopes[x.parent];
        if (!v) throw Error("Undefined selected subcircuit: " + y);
      }
      const R = t.scopes[v], P = W();
      if (R.ports.length !== O.nodes.length) throw Error(O.name + ": expected " + R.ports.length + " ports; got " + O.nodes.length);
      R.ports.forEach((y, x) => {
        P[y.toLowerCase()] = w(O.nodes[x]);
      });
      const s = u(v, [...o, O.name], P, E, O.parameters, O, I);
      O.pinNames?.length === s.ports.length && s.ports.forEach((y, x) => {
        y.label = O.pinNames[x];
      }), f.children.push(s);
    }
    return f;
  }
  try {
    let l = function(g, p) {
      const m = p.split(":");
      if (m.length === 1) return { owner: g, name: p };
      const _ = m.pop();
      for (const h of [[...g.path, ...m], m]) {
        const E = o.get(h.map(encodeURIComponent).join("/").toLowerCase());
        if (E) return { owner: E, name: _ };
      }
      throw Error("Unknown hierarchical reference: " + p);
    };
    const a = u(t.rootId, [], W(), W(), W(), null, []), o = new Map(Object.values(e).map((g) => [g.id.toLowerCase(), g])), c = Object.assign(W(), ...Object.values(e).map((g) => g.models)), d = (g) => c[g] || Object.entries(c).find(([p]) => p.startsWith(g + "."))?.[1];
    for (const g of Object.values(e)) for (const p of g.devices) {
      const m = t.scopes[g.scopeId].devices.find((E) => E.name === p.localName), _ = (E) => {
        const w = l(g, E);
        return n.get(w.owner.id)(w.name);
      }, h = (E, w = "", f = "") => {
        const I = l(g, E), C = I.owner.devices.find((O) => O.localName.toLowerCase() === I.name.toLowerCase());
        if (w.toLowerCase() === "ix") {
          const O = I.owner.ports.find((v, R) => v.name.toLowerCase() === I.name.toLowerCase() || String(R + 1) === I.name);
          if (O) return I.owner.id + ":" + O.name;
        }
        if (!C) {
          if (f) throw Error(p.name + ": referenced " + f + " device " + E + " was not found.");
          return se(I.owner.path, I.name);
        }
        if (f && C.kind !== f) throw Error(p.name + ": " + E + " must be a " + f + " device.");
        return C.name;
      };
      if (p.value = Pe(m.value, g.params, _, h), m.model && (p.value = p.value.replace(m.model, p.model)), p.kind === "M" && Object.keys(p.terminals).length === 3) {
        let E = d(p.model), w = !1;
        const f = /* @__PURE__ */ new Set();
        for (; E?.type === "VDMOS" && !f.has(E.name); ) {
          f.add(E.name);
          const I = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(E.raw);
          if (I) {
            w = I[1] === void 0 || Number(ue(I[1], E.parameters)) >= 0.5;
            break;
          }
          const C = E.name.includes("/") ? E.name.slice(0, E.name.lastIndexOf("/") + 1) : "";
          E = d(C + (E.baseModel || "").toLowerCase()) || d((E.baseModel || "").toLowerCase());
        }
        f.size && (p.type = "spice_" + (w ? "pmos3" : "nmos3"));
      }
      p.controlSources = (m.controlSources || []).map((E) => h(E, "", "V")), p.controlSource = p.controlSources[0] || "", p.coupledInductors = (m.coupledInductors || []).map((E) => h(E, "", "L"));
      for (const E of /* @__PURE__ */ new Set([...m.controlSources || [], ...m.coupledInductors || []])) {
        const w = E.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        p.value = p.value.replace(new RegExp("(?<![\\w./%])" + w + "(?![\\w.$])", "g"), () => h(E));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: e };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function pe(t) {
  return [...t.devices, ...t.children.flatMap(pe)];
}
function Te(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Ce(t, e = {}) {
  const n = new Map(t.components.map((s) => [s.name, s])), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), u = [], a = (s, y) => JSON.stringify([s, y].sort()), o = (s) => e[s]?.potential !== null && e[s]?.potential !== void 0;
  for (const s of t.components) {
    for (const [Q, $] of Object.entries(s.terminals))
      i.has($) || i.set($, []), i.get($).push({ device: s.name, pin: Q });
    if (s.kind === "R") {
      const Q = Object.values(s.terminals);
      if (Q.length === 2 && Q[0] !== Q[1]) {
        const $ = a(...Q);
        r.has($) || r.set($, []), r.get($).push(s);
      }
    }
    const y = s.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(s.kind) ? "fet" : null, x = y === "bjt" ? /_(npn|pnp)$/.exec(s.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(s.type)?.[1];
    if (!y || !x) continue;
    const V = s.terminals, U = V[y === "bjt" ? "B" : "G"], D = V[y === "bjt" ? "C" : "D"], G = V[y === "bjt" ? "E" : "S"];
    [U, D, G].some((Q) => Q === void 0) || U === G || D === G || u.push({ id: s.name, family: y, polarity: x, control: U, drain: D, source: G, body: s.kind === "M" ? V.B : void 0 });
  }
  const c = [], d = /* @__PURE__ */ new Set(), l = (s, y, x, V, U, D = "basic", G = [], Q = "high") => {
    const $ = [.../* @__PURE__ */ new Set([...y, ...G])], j = JSON.stringify([s, D, [...$].sort()]);
    d.has(j) || (d.add(j), c.push({ id: "motif" + c.length, kind: s, variant: D, transistors: y, members: $, roles: x, nets: V, evidence: U, confidence: Q }));
  }, g = (s, y) => s.family === y.family && s.polarity === y.polarity, p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), h = new Map(u.map((s) => [s.id, s])), E = (s, y, x) => {
    s.has(y) || s.set(y, []), s.get(y).push(x);
  }, w = (s, y) => JSON.stringify([s.family, s.polarity, y]);
  for (const s of u)
    E(p, w(s, s.control), s), E(m, w(s, s.source), s), s.family === "bjt" && (i.get(s.source) || []).some((y) => {
      const x = h.get(y.device);
      return x && x.family === "bjt" && !g(s, x) && x.source === s.source;
    }) && E(_, w(s, s.drain), s);
  const f = (s) => [{ node: s.source, resistor: null }, ...(i.get(s.source) || []).flatMap((y) => {
    const x = n.get(y.device);
    if (x.kind !== "R") return [];
    const V = Object.values(x.terminals).find((U) => U !== s.source);
    return V !== void 0 && V !== s.control && V !== s.drain ? [{ node: V, resistor: x.name }] : [];
  })];
  for (const s of u) s.control === s.drain && l("diode-connected", [s.id], { reference: s.id }, { control: s.control, return: s.source }, ["control-drain-short", s.family]);
  for (const s of u) {
    const y = p.get(w(s, s.control));
    if (y.filter((Q) => Q.control === Q.drain).length > 1) continue;
    let x = null;
    if (s.control !== s.drain && s.family === "bjt" && (x = (p.get(w(s, s.drain)) || []).find((Q) => Q.id !== s.id && g(Q, s) && Q.control === s.drain && Q.source === s.control && o(Q.drain))), s.control !== s.drain && !x) continue;
    const V = f(s), U = [];
    let D = null, G = [];
    for (const Q of y) {
      if (Q.id === s.id || Q.id === x?.id || Q.drain === s.drain || Q.drain === Q.control) continue;
      const $ = V.flatMap((j) => f(Q).filter((ne) => j.node === ne.node).map((ne) => ({ node: j.node, rs: [j.resistor, ne.resistor].filter(Boolean) }))).find((j) => D === null || j.node === D);
      $ && (D = $.node, U.push(Q.id), G.push(...$.rs));
    }
    if (U.length) {
      const Q = U.every(($) => h.get($).body === s.body);
      l("current-mirror", [s.id, ...U, ...x ? [x.id] : []], { reference: s.id, outputs: U, ...x ? { helper: x.id } : {} }, { control: s.control, return: D }, ["same-polarity", "shared-control", x ? "emitter-follower-reference" : "diode-reference", G.length ? "resistive-common-return" : "shared-return", Q ? "compatible-bodies" : "different-body-connections"], x ? "assisted" : G.length ? "degenerated" : "basic", [...G, ...x ? [x.id] : []], Q ? "high" : "medium");
    }
  }
  const I = [], C = /* @__PURE__ */ new Set(), O = (s, y) => {
    const x = JSON.stringify([s.id, y.id].sort());
    C.has(x) || (C.add(x), I.push([s, y]));
  };
  for (const s of m.values()) if (!o(s[0].source)) {
    const y = s.filter((x) => x.control !== x.drain);
    y.length === 2 ? O(...y) : y.length > 2 && new Set(y.map((x) => x.control)).size > 1 && l("differential-pair", y.map((x) => x.id), { inputs: y.map((x) => x.id) }, { tail: y[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const s of _.values()) for (let y = 0; y < s.length; y++) for (let x = y + 1; x < s.length; x++) O(s[y], s[x]);
  for (const [s, y] of I) {
    if (s.control === y.control || s.control === s.drain || y.control === y.drain) continue;
    if (s.source === y.source && s.drain !== y.drain && !o(s.source)) {
      const U = (i.get(s.source) || []).some((G) => G.device !== s.id && G.device !== y.id), D = m.get(w(s, s.source)).length === 2;
      l("differential-pair", [s.id, y.id], { inputs: [s.id, y.id] }, { tail: s.source }, ["same-polarity", "distinct-controls", "shared-tail", U ? "tail-bias-connection" : "unbiased-tail", D ? "two-input-tail" : "multi-input-tail"], "basic", [], U && D && s.body === y.body ? "high" : "medium");
    }
    if (s.family !== "bjt" || s.drain !== y.drain || s.source === y.source) continue;
    const x = u.filter((U) => U.family === "bjt" && U.polarity !== s.polarity && U.source === s.source), V = u.filter((U) => U.family === "bjt" && U.polarity !== s.polarity && U.source === y.source);
    for (const U of x) for (const D of V) U.id !== D.id && U.control === D.control && U.drain !== D.drain && U.control !== U.drain && D.control !== D.drain && l("differential-pair", [s.id, y.id, U.id, D.id], { inputs: [s.id, y.id], commonBase: [U.id, D.id] }, { inputCollectors: s.drain, bias: U.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const s of u) if (s.family === "bjt" && s.control !== s.drain) {
    const y = r.get(a(s.drain, s.control)) || [], x = r.get(a(s.control, s.source)) || [];
    y.length === 1 && x.length === 1 && l("vbe-multiplier", [s.id], { transistor: s.id, collectorResistor: y[0].name, emitterResistor: x[0].name }, { control: s.control, collector: s.drain, emitter: s.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [y[0].name, x[0].name]);
  }
  const v = u.filter((s) => s.family === "bjt"), R = /* @__PURE__ */ new Map();
  for (const s of v) E(R, s.control, s);
  const P = (s) => (i.get(s) || []).filter((y) => h.has(y.device));
  for (const s of v) if (s.control !== s.drain) {
    for (const y of R.get(s.source) || []) y.id !== s.id && g(s, y) && y.control !== y.drain && s.drain === y.drain && y.source !== s.control && l("darlington-pair", [s.id, y.id], { driver: s.id, output: y.id }, { link: s.source, collector: s.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (R.get(s.source) || []).length === 1 ? "high" : "medium");
    for (const y of R.get(s.drain) || []) y.id !== s.id && !g(s, y) && y.control !== y.drain && s.source === y.drain && y.source !== s.control && P(s.drain).length === 2 && l("sziklai-pair", [s.id, y.id], { driver: s.id, output: y.id }, { link: s.drain, feedback: s.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const y of i.get(s.drain) || []) {
      const x = h.get(y.device);
      !x || x.family !== "bjt" || x.id === s.id || !g(s, x) || x.source !== s.drain || o(s.drain) || x.control === s.control || x.control === x.drain || x.drain === s.source || P(s.drain).length !== 2 || l("cascode-pair", [s.id, x.id], { driver: s.id, output: x.id }, { link: s.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const s of v.filter((y) => y.polarity === "npn" && o(y.drain))) for (const y of v.filter((x) => x.polarity === "pnp" && o(x.drain))) {
    if (e[s.drain].potential <= e[y.drain].potential) continue;
    const x = f(s).flatMap((V) => f(y).filter((U) => V.node === U.node && !o(V.node)).map((U) => ({ node: V.node, rs: [V.resistor, U.resistor].filter(Boolean) })))[0];
    x && l("push-pull-pair", [s.id, y.id], { upper: s.id, lower: y.id }, { output: x.node }, ["complementary-polarity", "ordered-collector-supplies", x.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", x.rs);
  }
  return c;
}
function Ie(t, e, n = (i) => i) {
  const i = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([u, a]) => [u, i(a)])), nets: Object.fromEntries(Object.entries(r.nets).map(([u, a]) => [u, n(a)])) }));
}
function Ot(t, e, n) {
  const i = [], r = /* @__PURE__ */ new Set(), u = new Map(t.components.map((a) => [a.name, a]));
  for (const a of n) {
    if (new Set(a.members).size !== a.members.length) throw Error("Duplicate @layout pair member.");
    const o = a.members.map((p) => u.get(p));
    if (o.some((p) => !p)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "push-pull": "push-pull-pair" }[a.kind], d = a.kind === "differential" && o.length === 2 ? t.components.filter((p) => !a.members.includes(p.name) && Object.values(p.terminals).includes(o[0].terminals.E ?? o[0].terminals.S)) : [], l = Ce({ ...t, components: [...o, ...d] }, e), g = l.find((p) => p.kind === c && p.confidence === "high" && a.members.every((m) => p.members.includes(m)));
    if (!g) throw Error("Invalid @layout pair " + a.kind + " { " + a.members.join(" ") + " }: electrical structure does not match.");
    for (const p of l.filter((m) => m === g || m.kind === "diode-connected" && m.members.every((_) => g.members.includes(_)))) {
      const m = JSON.stringify([p.kind, [...p.members].sort()]);
      r.has(m) || (r.add(m), i.push({ ...p, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function xt(t, e, n = Ce(t, e)) {
  const i = /* @__PURE__ */ new Map(), r = t.components.filter((p) => p.kind === "R"), u = t.components.filter((p) => p.kind === "Q"), a = new Map(t.components.map((p) => [p.name, p])), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), d = (p) => Object.values(p.terminals), l = (p, m, _) => {
    p && i.set(p.name, { reverse: d(p)[0] !== m, reason: _ });
  };
  for (const p of u) {
    const { C: m, B: _, E: h } = p.terminals, E = p.type.endsWith("pnp"), w = p.type.endsWith("npn");
    !E && !w || (o.has(h) || o.set(h, []), o.get(h).push(p), m === _ && e[h]?.potential !== null && e[h]?.potential !== void 0 && c.set(m, { potential: e[h].potential }));
  }
  for (const p of n) if (p.kind === "vbe-multiplier" && p.confidence === "high") {
    const m = a.get(p.roles.transistor), _ = m.type.endsWith("pnp"), h = a.get(_ ? p.roles.emitterResistor : p.roles.collectorResistor), E = a.get(_ ? p.roles.collectorResistor : p.roles.emitterResistor);
    l(h, m.terminals[_ ? "E" : "C"], "recognized VBE multiplier"), l(E, m.terminals.B, "recognized VBE multiplier");
  }
  for (const p of r) {
    const [m, _] = d(p), h = c.get(m), E = c.get(_);
    h && E && h.potential !== E.potential && l(p, h.potential > E.potential ? m : _, "diode-connected bias reference");
  }
  const g = /* @__PURE__ */ new Map();
  for (const p of r) {
    const m = d(p);
    if (!m.some((_) => e[_]?.potential !== null && e[_]?.potential !== void 0))
      for (const _ of m)
        g.has(_) || g.set(_, []), g.get(_).push(p);
  }
  for (const [p, m] of g)
    if (!(m.length > 12))
      for (const _ of m) for (const h of m) {
        if (_ === h) continue;
        const E = d(_).find((C) => C !== p), w = d(h).find((C) => C !== p), f = o.get(E)?.find((C) => C.type.endsWith("npn")), I = o.get(w)?.find((C) => C.type.endsWith("pnp"));
        f && I && (l(_, E, "complementary emitter output"), l(h, p, "complementary emitter output"));
      }
  return i;
}
function Rt(t) {
  const e = t.components.filter((u) => u.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((u) => u.kind === "R").map((u) => Object.values(u.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const u of e) {
    const a = u.terminals.E;
    n.has(a) || n.set(a, []), n.get(a).push(u);
  }
  for (const u of e) {
    const { B: a, C: o, E: c } = u.terminals;
    if (a === c || !i.has([a, c].sort().join("|"))) continue;
    const d = n.get(a) || [];
    if (!(d.length > 16))
      for (const l of d) {
        if (l === u) continue;
        if (l.terminals.B === o) {
          r.add(u.name);
          break;
        }
        const g = n.get(l.terminals.B) || [];
        if (g.length <= 16 && g.some((p) => p !== u && p !== l && p.terminals.B === o)) {
          r.add(u.name);
          break;
        }
      }
  }
  return r;
}
const _e = 15;
function Ne(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const fe = (t) => ["pwr", "ret", "bias"].includes(t), St = (t) => String(t).split("/").at(-1).toLowerCase(), De = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[St(t)] || "unknown", Lt = (t) => {
  const e = Ne(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || De(t);
};
function kt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (a, o, c) => {
    e.has(a) || e.set(a, []), e.get(a).push({ node: o, delta: c });
  };
  for (const a of t)
    if (a.kind === "V")
      try {
        let o = a.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(o);
        if (c && Number(ue(c[1], a.parameters)) !== 0 || (o = o.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(o))) continue;
        const d = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(o);
        if (!d) continue;
        const l = ue(d[1], a.parameters);
        if (typeof l != "number" || !Number.isFinite(l)) continue;
        i(a.terminals["-"], a.terminals["+"], l), i(a.terminals["+"], a.terminals["-"], -l);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  for (const a of ["0", ...e.keys()]) {
    if (u.has(a)) continue;
    const o = /* @__PURE__ */ new Map([[a, 0]]), c = [a];
    u.add(a);
    let d = !1;
    for (let l = 0; l < c.length; l++) for (const g of e.get(c[l]) || []) {
      const p = o.get(c[l]) + g.delta;
      o.has(g.node) ? Math.abs(o.get(g.node) - p) > 1e-8 * Math.max(1, Math.abs(p)) && (d = !0) : (o.set(g.node, p), u.add(g.node), c.push(g.node));
    }
    d && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [l, g] of o) r[l] = { value: g, reference: a, known: a === "0" && !d, consistent: !d };
  }
  return { nodes: r, diagnostics: n };
}
function Pt(t, e, n = null) {
  const i = kt(pe(t.root)), r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
  for (const l of Object.values(e.nodes)) {
    const g = Ne(l.name), p = De(l.name);
    r[l.name] = { role: g !== "unknown" ? g : p, roleSource: g !== "unknown" ? "node-name" : p !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[l.name]?.known ? i.nodes[l.name].value : null };
  }
  const a = n?.pairs?.length ? Ot(e, r, n.pairs) : Ce(e, r), o = xt(e, r, a), c = Rt(e), d = (l, g, p) => {
    const m = { role: r[p].role, roleSource: r[p].roleSource }, _ = l.block?.ports.find((w) => w.pin === g);
    if (_?.implicit || !l.block && !l.synthetic) return m;
    const h = l.synthetic ? l.value : _?.name || _?.label, E = Lt(h);
    return E !== "unknown" ? { role: E, roleSource: Ne(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : fe(m.role) ? { ...m, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const l of e.components) {
    const g = Object.fromEntries(Object.entries(l.terminals).map(([P, s]) => [P, { ...r[s], ...d(l, P, s) }])), p = Object.values(g), m = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(l.type), _ = m && !o.has(l.name) && p.length === 2 && p.every((P) => !fe(P.role) && (P.potential === null || P.role !== "unknown")), h = l.terminals["+"], E = l.terminals["-"], w = [h, E].filter((P) => P && P !== "0"), f = l.kind === "V" && w.some((P) => fe(r[P]?.role)) && !w.some((P) => ["in", "out", "io", "fb"].includes(r[P]?.role)) && [h, E].every((P) => i.nodes[P]?.known), I = h === "0" ? E : h, C = Object.keys(l.terminals), O = (P) => fe(P.role) ? P.potential !== null ? P.potential > 0 ? "high" : "low" : P.role === "ret" ? "low" : "high" : "signal";
    let v = !1;
    C.length === 2 && (l.kind === "V" && p.every((P) => P.potential !== null) ? v = p[0].potential < p[1].potential : l.terminals[C[0]] === "0" ? v = !0 : l.terminals[C[1]] === "0" ? v = !1 : p.every((P) => P.potential !== null) ? v = p[0].potential < p[1].potential : v = O(p[0]) === "low" || O(p[1]) === "high" && O(p[0]) === "signal"), o.has(l.name) && (v = o.get(l.name).reverse);
    const R = l.synthetic ? "" : l.name.startsWith(e.focus + "/") ? l.name.slice(e.focus.length + 1) : l.name;
    u[l.name] = { version: _e, kind: l.kind, polarity: l.type.endsWith("pnp") ? "p" : l.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(l.name), orientationReason: o.get(l.name)?.reason || null, owner: R.includes("/") ? R.slice(0, R.lastIndexOf("/")) : "", passive: m, source: ["V", "I", "E", "F", "G", "H"].includes(l.kind) || l.kind === "B" && !m, ports: g, horizontal: _, orientation: _ ? "horizontal" : v ? "vertical-reversed" : "vertical", flexible: C.length === 2 && (m || ["V", "I", "B", "F", "H"].includes(l.kind)), supply: !!f, voltage: f ? i.nodes[I].value : null };
  }
  return { version: _e, nodes: r, cells: u, motifs: a, diagnostics: i.diagnostics };
}
function Ve(t, e) {
  const n = e.ports.map((r, u) => ({ pin: "P" + u, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), i = new Set(pe(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const u = ye([], r);
    i.has(u) && !n.some((a) => a.node === u) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: u, implicit: !0 });
  }
  return n;
}
function At(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const r = t.contexts[i];
  if (!r) throw Error("Unknown instance: " + i);
  const u = [], a = [];
  function o(g) {
    a.push(...Object.values(g.nodes), ...g.ports.map((m) => m.node));
    const p = [...g.devices.map((m) => ({ line: m.line, device: m })), ...g.children.map((m) => ({ line: m.line, child: m }))].sort((m, _) => m.line - _.line);
    for (const m of p) {
      if (m.device) {
        const w = m.device;
        u.push({ ...w, layoutLabel: [...g.path.slice(r.path.length), w.localName].join("/") });
        continue;
      }
      const _ = m.child;
      if (e === "flat" || n.has(_.id)) {
        o(_);
        continue;
      }
      const h = Ve(t, _), E = W();
      h.forEach((w) => {
        E[w.pin] = w.node;
      }), u.push({ name: _.id, kind: "X", type: "spice_subckt", terminals: E, value: _.definition, raw: _.raw, line: _.line, instanceId: _.id, layoutLabel: _.path.slice(r.path.length).join("/"), block: { definitionId: _.scopeId, ports: h, parameters: _.params } });
    }
  }
  o(r);
  for (const [g, p] of r.ports.entries()) u.push({ name: "@port/" + i + "/" + g, kind: "PORT", type: "spice_port", terminals: { A: p.node }, layoutLabel: p.name, value: p.name, raw: "Interface port " + p.name, synthetic: !0 });
  if (u.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(W(), ...Object.values(t.contexts).map((g) => g.models)), d = { title: i || t.ir.title, components: u, nodes: pt(u, a), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: i };
  d.topology = Tt(t, d);
  const l = dt(t, d);
  return d.layout = Pt(t, d, l), d.layout.description = l, d;
}
function Tt(t, e) {
  const n = [], i = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const o = t.contexts[a.instanceId];
        if (!o) throw Error("Projection contains an unknown block.");
        const c = Ve(t, o);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(c.map((d) => [d.pin, d.node]))) throw Error("Block interface topology mismatch: " + a.name);
        n.push(...pe(o));
      } else n.push(a);
  for (const a of n) {
    if (i.has(a.name)) throw Error("Projection duplicates " + a.name);
    i.add(a.name);
  }
  const r = Te(n), u = pe(t.contexts[e.focus]);
  if (r !== Te(u)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: r };
}
function Ut(t) {
  const e = W(), n = W();
  for (const i of t.components) {
    const r = W(), u = W();
    for (const [a, o] of Object.entries(i.terminals))
      r[a] = [t.nodes[o].bit], u[a] = "input";
    e[i.name] = { type: i.type, port_directions: u, connections: r, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((a) => ({ pin: a.pin, label: a.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((a, o) => ({ pin: a, label: i.pinLabels?.[o] || a })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ie(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Mt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, r = (d) => (n.has(d) || n.set(d, n.size + 2), n.get(d));
  Object.entries(t.modules.circuit.cells).forEach(([d, l], g) => {
    const p = "c" + g;
    e.set(p, d);
    const m = Object.fromEntries(Object.entries(l.connections).map(([_, h]) => [_, h.map(r)]));
    i[p] = { type: l.type, connections: m, port_directions: l.port_directions, attributes: { displayRef: l.attributes.displayRef || l.attributes.ref || "", value: l.attributes.value || "", name: l.attributes.name || "" } }, l.spiceBlock && (i[p].spiceBlock = l.spiceBlock), l.spiceSymbol && (i[p].spiceSymbol = l.spiceSymbol), l.spiceLayout && (i[p].spiceLayout = l.spiceLayout);
  });
  const u = new Map([...e].map(([d, l]) => [l, d])), a = t.modules.circuit.spiceLayoutDescription, o = a ? { ...a, faces: (a.faces || []).map((d) => ({ ...d, device: u.get(d.device) })), pairs: (a.pairs || []).map((d) => ({ ...d, members: d.members.map((l) => u.get(l)) })), groups: a.groups.map((d) => ({ ...d, members: d.members.map((l) => l.cell ? { ...l, cell: u.get(l.cell) } : l) })), relations: a.relations.map((d) => ({ ...d, a: u.get(d.a) || d.a, b: u.get(d.b) || d.b })) } : null, c = Ie(t.modules.circuit.spiceMotifs || [], (d) => u.get(d), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: c, spiceLayoutDescription: o } } }, ids: e, bits: new Map([...n].map(([d, l]) => [l, d])) };
}
const ee = /* @__PURE__ */ new Map();
async function Qt(t, e) {
  const n = Mt(t), i = JSON.stringify([n.netlist, e]);
  let r = ee.get(i);
  r ? (ee.delete(i), ee.set(i, r)) : (r = await Dt(n.netlist, e), r.svg.length < 1e6 && (ee.set(i, r), ee.size > 20 && ee.delete(ee.keys().next().value)));
  const u = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of u.querySelectorAll("[id],[class]")) {
    const d = c.getAttribute("id");
    d?.startsWith("cell_") && n.ids.has(d.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(d.slice(5)));
    const l = c.getAttribute("class");
    l && c.setAttribute("class", l.split(/\s+/).map((g) => g.startsWith("cell_") && n.ids.has(g.slice(5)) ? "cell_" + n.ids.get(g.slice(5)) : /^net_\d+$/.test(g) && n.bits.has(Number(g.slice(4))) ? "net_" + n.bits.get(Number(g.slice(4))) : g).join(" "));
  }
  const a = r.drawing ? structuredClone(r.drawing) : null, o = u.querySelector("#spice-layout-report");
  if (o) {
    const c = JSON.parse(o.textContent), d = (l) => n.ids.get(l) || l;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(d), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(d), c.recognizedMotifs = Ie(c.recognizedMotifs || [], d, (l) => n.bits.get(l) ?? l);
    for (const l of c.pairCompactions || [])
      l.members = l.members.map(d), l.moved = d(l.moved);
    for (const l of c.pairConstraints || []) l.members = l.members.map(d);
    for (const l of c.pairProximity || []) l.members = l.members.map(d);
    for (const l of c.motifMeasurements || [])
      l.members = l.members.map(d), l.interlopers && (l.interlopers = l.interlopers.map(d));
    for (const l of c.voltageRails || []) l.bit !== void 0 && (l.bit = n.bits.get(l.bit) ?? l.bit);
    o.textContent = JSON.stringify(c);
  }
  if (a) {
    for (const c of a.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const d of c.ports) d.bit = n.bits.get(d.bit) ?? d.bit;
    }
    for (const c of a.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(u.documentElement), drawing: a };
}
function Dt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-CrfDjSPf.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, r) => {
    const u = (c, d) => {
      clearTimeout(o), n.terminate(), c ? r(Error(c)) : i(d);
    }, a = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, o = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), a);
    n.onmessage = ({ data: c }) => u(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => u(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
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
`, Bt = `* Voltage-divider biased common-emitter amplifier.
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
`, jt = `* Common-collector voltage follower; independently chosen example values.
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
`, Gt = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, $t = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, me = {
  filter: { source: Vt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Bt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: jt, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Gt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: $t, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function Ft(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Ue(t) {
  return Ft(await t.arrayBuffer());
}
const Me = me.filter.source, k = (t) => document.getElementById("spice-" + t), de = k("app");
if (de) {
  let R = function(N) {
    const L = k("example-info");
    if (L && (L.replaceChildren(), !!N && (L.append(document.createTextNode(N.description + " ")), N.url))) {
      const T = document.createElement("a");
      T.href = N.url, T.target = "_blank", T.rel = "noopener noreferrer", T.textContent = N.reference, L.append(T);
    }
  }, P = function() {
    r = null, u = null, o = "", O(), R(Object.values(me).find((N) => N.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, s = function(N) {
    i.replaceChildren();
    for (const { severity: L, line: T, message: M, source: A } of N) {
      const F = document.createElement("li");
      F.className = L, F.textContent = `${L.toUpperCase()}${A && A !== "input.cir" ? " · " + A : ""}${T ? " · line " + T : ""}: ${M}`, i.append(F);
    }
    k("messages").open = N.some((L) => L.severity !== "info"), k("message-count").textContent = `${N.length} message${N.length === 1 ? "" : "s"}`;
  }, y = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${h.x} ${h.y} ${h.w} ${h.h}`), k("zoom-level").textContent = Math.round(E.w / h.w * 100) + "%";
  }, x = function(N, L = h.x + h.w / 2, T = h.y + h.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, h.w * N / E.w)) * E.w / h.w;
    h = { x: L + (h.x - L) * M, y: T + (h.y - T) * M, w: h.w * M, h: h.h * M }, y();
  }, U = function(N) {
    const L = new URLSearchParams();
    N && L.set("instance", N);
    const T = L.toString();
    location.hash.slice(1) === T ? (p = N, j()) : location.hash = T;
  }, D = function() {
    p = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, G = function(N) {
    const L = d.contexts[N].path;
    for (let T = 1; T <= L.length; T++) f.add(L.slice(0, T).map(encodeURIComponent).join("/"));
  }, Q = function() {
    const N = !!(m && m !== p && d?.contexts[m]);
    k("selection-actions").hidden = !N, k("toggle-instance").textContent = f.has(m) ? "Collapse instance" : "Expand instance", k("toggle-instance").disabled = !1, k("open-instance").href = "#" + new URLSearchParams({ instance: m });
  }, $ = function() {
    k("breadcrumbs").replaceChildren();
    const N = (T, M) => {
      const A = document.createElement("button");
      A.type = "button", A.textContent = T, A.onclick = () => U(M), A.disabled = M === p, k("breadcrumbs").append(A);
    };
    if (N("Top", ""), p) {
      const T = d.contexts[p].path;
      for (let M = 0; M < T.length; M++) N(T[M], T.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    k("instances").replaceChildren();
    const L = (T, M) => {
      for (const A of T.children) {
        const F = document.createElement("div");
        F.className = "spice-instance-row", F.style.setProperty("--depth", Math.min(M, 8)), F.dataset.instance = A.id;
        const Y = document.createElement("button");
        Y.type = "button", Y.textContent = f.has(A.id) ? "−" : "+", Y.title = (f.has(A.id) ? "Collapse " : "Expand ") + A.id, Y.setAttribute("aria-label", Y.title), Y.setAttribute("aria-expanded", String(f.has(A.id))), Y.onclick = () => {
          f.has(A.id) ? f.delete(A.id) : G(A.id), m = A.id, j();
        };
        const re = document.createElement("a");
        re.href = "#" + new URLSearchParams({ instance: A.id }), re.textContent = A.name + " · " + A.definition, re.title = "Open " + A.id + " as its own sheet";
        const Z = document.createElement("span");
        if (Z.className = "spice-help", Z.textContent = Object.entries(A.params).map(([J, oe]) => J + "=" + oe).join(" · "), F.append(Y, re), Z.textContent) {
          const J = document.createElement("details"), oe = document.createElement("summary");
          oe.textContent = "Parameters", J.append(oe, Z), F.append(J);
        }
        k("instances").append(F), L(A, M + 1);
      }
    };
    L(d.contexts[p], 0), k("hierarchy-panel").hidden = !d.contexts[p].children.length, k("focus-title").textContent = p ? p + " / " + d.contexts[p].definition : "Top-level schematic", Q();
  };
  const t = k("input"), e = k("preview"), n = k("status"), i = k("diagnostics");
  let r = null, u = null, a = !1, o = "", c, d, l, g = "", p = "", m = "", _ = !1, h = { x: 0, y: 0, w: 1, h: 1 }, E = { ...h }, w;
  const f = /* @__PURE__ */ new Set();
  let I = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  de.addEventListener("click", (N) => {
    _ && N.target.closest('a[href^="#"]') && N.preventDefault();
  });
  const O = () => {
    k("copy").disabled = k("download").disabled = !o || _, k("download-asc").disabled = k("download-asc-bundle").disabled = !o || !r || _ || a;
  }, v = () => ({ font: k("font").value, fontSize: Number(k("size").value), color: k("color").value, detailed: k("detailed").checked, conventional: k("conventional").checked });
  t.value = Me;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Me;
  } catch {
  }
  R(Object.values(me).find((N) => N.source === t.value)), t.addEventListener("input", P);
  for (const N of ["font", "size", "color", "detailed", "conventional"]) k(N).addEventListener("input", P);
  k("zoom-in").onclick = () => x(0.8), k("zoom-out").onclick = () => x(1.25), k("fit").onclick = () => {
    h = { ...E }, y();
  };
  const V = (N) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(N.clientX, N.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (N) => {
    const L = V(N);
    L && (N.preventDefault(), x(N.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (N) => {
    N.button !== 0 || !e.querySelector("svg") || (w = { start: V(N), x: N.clientX, y: N.clientY, view: { ...h }, moved: !1 }, e.setPointerCapture(N.pointerId));
  }), e.addEventListener("pointermove", (N) => {
    if (!w) return;
    const L = V(N);
    Math.hypot(N.clientX - w.x, N.clientY - w.y) > 4 && (w.moved = !0), h.x += w.start.x - L.x, h.y += w.start.y - L.y, y();
  }), e.addEventListener("pointerup", (N) => {
    if (!w) return;
    const L = w.moved;
    if (w = null, e.hasPointerCapture(N.pointerId) && e.releasePointerCapture(N.pointerId), !L) {
      const T = document.elementFromPoint(N.clientX, N.clientY)?.closest("[data-component]"), M = c?.components.find((A) => A.name === T?.dataset.component);
      M && (m = M.instanceId || "", k("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([A, F]) => `${A} → ${F}`).join("   ")}`, M.kind === "X" ? (G(M.instanceId), j()) : Q());
    }
  }), window.addEventListener("hashchange", () => {
    if (_) {
      I = !0;
      return;
    }
    D(), m = "", j();
  }), k("collapse-all").onclick = () => {
    f.clear(), j();
  }, k("expand-all").onclick = () => {
    for (const N of Object.keys(d?.contexts || {})) N && f.add(N);
    j();
  }, k("toggle-instance").onclick = () => {
    f.has(m) ? f.delete(m) : G(m), j();
  }, e.addEventListener("pointercancel", () => {
    w = null;
  }), e.addEventListener("keydown", (N) => {
    const L = N.target.closest("[data-instance]");
    if (L && (N.key === "Enter" || N.key === " ")) {
      N.preventDefault(), m = L.dataset.instance, G(m), j();
      return;
    }
    N.key === "+" || N.key === "=" ? x(0.8) : N.key === "-" ? x(1.25) : N.key.toLowerCase() === "f" ? (h = { ...E }, y()) : N.key.startsWith("Arrow") && (N.preventDefault(), h.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[N.key] || 0) * h.w, h.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[N.key] || 0) * h.h, y());
  });
  async function j() {
    if (_) return;
    _ = !0, r = null, u = null, o = "", O(), k("generate").disabled = !0, t.readOnly = !0, k("file").disabled = !0, k("libraries").disabled = !0;
    for (const L of de.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) L.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let N = [];
    try {
      if (g !== t.value || !d) {
        if (l = ut(t.value, { files: C }), N = [...l.diagnostics], N.some((S) => S.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = vt(l), g && g !== t.value ? (f.clear(), p = "", m = "", history.replaceState(null, "", location.pathname + location.search)) : D(), g = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (N = [...l.diagnostics], s(N), N.some((S) => S.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = At(d, { expanded: f, focus: p });
      const L = Ut(c);
      v().conventional && N.push(...c.layout.diagnostics);
      const T = await Qt(L, v()), M = new DOMParser().parseFromString(T.svg, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const A = M.documentElement, F = A.querySelector("#spice-layout-report");
      if (F) {
        c.layout.report = JSON.parse(F.textContent);
        const S = c.layout.report;
        if (N.push({ severity: "info", message: `Layout: compact signal flow; ${S.powerSourcesChecked} DC/ground symbols checked, ${S.powerOrderViolations} DC order preference(s) unmet. ${S.powerPass}. ${S.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), S.classicTemplateFallback && N.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), S.groundPlacement && N.push({ severity: "info", message: `Ground: ${S.groundPlacement}; ${S.straightenedGroundDrops || 0} return-path simplification(s).` }), S.explicitGroups && N.push({ severity: "info", message: `Layout comments: ${S.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), S.classicRails && N.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${S.railCount} shared voltage rails.` }), S.localClassicInstances?.length && N.push({ severity: "info", message: `${S.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), S.localClassicStages?.length && N.push({ severity: "info", message: `Classic transistor proximity active: ${S.localClassicStages.join(", ")}.` }), S.sharedClassicRails && N.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), S.mirroredTransistors?.length && N.push({ severity: "info", message: `Control-pin mirror choices: ${S.mirroredTransistors.join(", ")}.` }), S.recognizedMotifs?.length && N.push({ severity: "info", message: `Transistor structures: ${S.recognizedMotifs.map((B) => `${B.kind} (${B.members.join(", ")}; ${B.confidence})`).join("; ")}.` }), S.appliedMotifs?.length && N.push({ severity: "info", message: `Topology preferences applied to ${S.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), S.pairCompactionFallback && N.push({ severity: "warning", message: "Pair proximity kept the original regions: " + S.pairCompactionFallback }), S.compoundPairFallback && N.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + S.compoundPairFallback }), S.pairConstraints?.length) {
          const B = S.pairConstraints.filter((z) => z.crossRegion && !z.compacted).length;
          N.push({ severity: "info", message: `${S.pairConstraints.length - B} adjacent transistor pair(s); ${B} cross-region mirror row constraint(s).` });
        }
        S.netShortcuts && N.push({ severity: "info", message: `${S.netShortcuts} safe straight net shortcut(s); ${S.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), S.sharedRailFallback && N.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${S.sharedRailFallback}.` });
        for (const B of S.localClassicFallbacks || []) B.stage && N.push({ severity: "info", message: `Classic stage ${B.stage} uses automatic layout: ${B.reason || "No unobstructed local template"}.` });
        S.geometricConnectivityVerified && N.push({ severity: "info", message: `Net geometry verified; ${S.cyclesRemoved} same-net loop(s) and ${S.leavesRemoved} unused wire branch(es) removed.` }), s(N);
      }
      if (A.localName !== "svg" || A.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const Y = Number(A.getAttribute("width")), re = Number(A.getAttribute("height"));
      E = { x: -20, y: -20, w: Y + 40, h: re + 40 }, h = { ...E }, A.setAttribute("viewBox", `${E.x} ${E.y} ${E.w} ${E.h}`), A.setAttribute("width", String(E.w)), A.setAttribute("height", String(E.h)), A.setAttribute("role", "img"), A.setAttribute("aria-label", c.title || "SPICE schematic"), A.setAttribute("style", "background:white");
      for (const S of c.components) {
        const B = M.getElementById("cell_" + S.name);
        if (!B) throw Error("Renderer omitted component " + S.name);
        B.setAttribute("data-component", S.name), S.kind === "X" && (B.setAttribute("data-instance", S.instanceId), B.setAttribute("role", "button"), B.setAttribute("tabindex", "0"), B.setAttribute("aria-label", "Expand " + S.name));
        const z = M.createElementNS(A.namespaceURI, "title");
        z.textContent = S.raw + `
Resolved: ` + S.value + `
` + Object.entries(S.terminals).map(([q, le]) => q + ": " + le).join(", "), B.prepend(z);
      }
      for (const S of Object.values(c.nodes))
        for (const B of A.querySelectorAll(".net_" + S.bit)) {
          B.setAttribute("data-net", S.name);
          const z = M.createElementNS(A.namespaceURI, "title");
          z.textContent = "Node " + S.displayName, B.append(z);
        }
      const Z = c.components.filter((S) => S.kind === "K").map((S) => ({ name: S.name, inductors: S.coupledInductors, value: S.value }));
      if (Z.length) {
        const S = M.createElementNS(A.namespaceURI, "metadata");
        S.setAttribute("id", "spice-magnetic-couplings"), S.textContent = JSON.stringify(Z), A.append(S);
        for (const B of Z) for (const z of B.inductors) {
          const q = M.getElementById("cell_" + z);
          if (!q) continue;
          const le = M.createElementNS(A.namespaceURI, "circle"), be = [...q.children].find((Ee) => Ee.getAttribute("s:pid") === "A"), Be = be?.getAttribute("s:position"), ve = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [Ee, je] of Object.entries({ cx: Number(be?.getAttribute("s:x")) + ve[0], cy: Number(be?.getAttribute("s:y")) + ve[1], r: 3, fill: v().color, stroke: "none", "data-coupling": B.name })) le.setAttribute(Ee, String(je));
          const Oe = M.createElementNS(A.namespaceURI, "title");
          Oe.textContent = B.name + " · dotted terminal: " + B.inductors.join(", "), le.append(Oe), q.append(le);
        }
      }
      r = T.drawing, o = new XMLSerializer().serializeToString(A), k("source").value = o, e.replaceChildren(document.importNode(A, !0)), y();
      const J = N.filter((S) => S.severity === "warning").length;
      n.textContent = `${c.components.filter((S) => !S.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${J ? " · Review " + J + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${_e}.`, c.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${c.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), c.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const oe = Object.values(c.nodes).map((S) => {
        const B = document.createElement("tr");
        for (const z of [S.displayName, S.terminals.map((q) => q.component + "." + q.pin).join(", ")]) {
          const q = document.createElement("td");
          q.textContent = z, B.append(q);
        }
        return B;
      });
      k("nets").replaceChildren(...oe), k("json").value = JSON.stringify({ circuit: c, netlist: L, hierarchy: l }, null, 2), k("selection").textContent = "Click a component to inspect its original statement and pin connections.", $();
    } catch (L) {
      if (e.replaceChildren(), o = "", k("source").value = "", k("json").value = "", k("nets").replaceChildren(), k("selection").textContent = "", n.textContent = L.message, !d)
        k("hierarchy-panel").hidden = !0, k("selection-actions").hidden = !0, k("breadcrumbs").replaceChildren();
      else if (!d.contexts[p]) {
        const T = document.createElement("button");
        T.type = "button", T.textContent = "Return to Top", T.onclick = () => U(""), k("breadcrumbs").replaceChildren(T);
      }
      L.diagnostics && (N = L.diagnostics), N.some((T) => T.severity === "error") || N.push({ severity: "error", line: 0, message: L.message }), s(N);
    } finally {
      _ = !1, k("generate").disabled = !1, t.readOnly = !1, k("file").disabled = !1, k("libraries").disabled = !1;
      for (const L of de.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) L.disabled = !1;
      d && d.contexts[p] && $(), e.setAttribute("aria-busy", "false"), O(), I && (I = !1, D(), queueMicrotask(j));
    }
  }
  k("generate").onclick = j;
  for (const N of de.querySelectorAll("[data-example]")) N.onclick = () => {
    const L = me[N.dataset.example];
    t.value = L.source, P(), R(L), j();
  };
  k("file").onchange = async (N) => {
    const L = N.target.files[0];
    if (L) {
      if (L.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Ue(L), P(), j();
      } catch (T) {
        n.textContent = "File could not be read: " + T.message;
      } finally {
        N.target.value = "";
      }
    }
  }, k("libraries").onchange = async (N) => {
    try {
      for (const L of N.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        C[L.webkitRelativePath || L.name] = await Ue(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      d = null, g = "", k("library-status").textContent = Object.keys(C).length + " library file(s) loaded", j();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      N.target.value = "";
    }
  }, k("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", k("download").onclick = () => {
    const N = URL.createObjectURL(new Blob([o], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = N, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(N), 1e3);
  };
  async function ne(N) {
    const L = r;
    if (!(!L || _ || a)) {
      a = !0, O(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: T } = await import("./asc-export-Bd9SdDhN.js");
        if (r !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= T({ tree: d, circuit: c, drawing: L, source: t.value, libraries: C });
        const M = N ? u.zip : u.ascBytes, A = URL.createObjectURL(new Blob([M], { type: N ? "application/zip" : "application/octet-stream" })), F = document.createElement("a");
        F.href = A, F.download = N ? "spice-schematic-asc.zip" : "spice-schematic.asc", F.click(), setTimeout(() => URL.revokeObjectURL(A), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (N ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (T) {
        n.textContent = "ASC export failed: " + T.message;
        const M = document.createElement("li");
        M.className = "error", M.textContent = n.textContent, i.append(M);
      } finally {
        a = !1, O();
      }
    }
  }
  k("download-asc").onclick = () => ne(!1), k("download-asc-bundle").onclick = () => ne(!0), k("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(o), n.textContent = "SVG source copied to clipboard.";
    } catch {
      k("source-details").open = !0, k("source").focus(), k("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
export {
  Pe as b,
  pe as l,
  ye as n,
  ht as p
};
