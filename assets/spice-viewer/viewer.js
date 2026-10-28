const Se = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, ke = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Le = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ie = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, De = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Me = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ae = { 1: "a", 2: "b", 7: "Q", 8: "com" }, Re = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ne = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Pe = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, je = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Te = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Ue = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Be = {
  AND: Se,
  BUF: ke,
  COUNTER: Le,
  DFLOP: Ie,
  SCHMITT: De,
  OR: Me,
  PHASEDET: Ae,
  SRFLOP: Re,
  XOR: Ne,
  MODULATOR: Pe,
  OTA: je,
  SAMPLEHOLD: Te,
  VARISTOR: Ue
}, _e = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", Y = (t) => t.toLowerCase(), fe = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), $e = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Ve(t, e) {
  const n = (w) => e[Y(w || "")] || Object.entries(e).find(([a]) => a.startsWith(Y(w || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let r = [], c = [], o = "", s = "", l = [], u = [], E = 0, p = "", g = "", y = "", k = !0;
  if ("RLC".includes(i))
    r = ["A", "B"], s = Y(i) + "_v";
  else if ("DVIB".includes(i))
    r = ["+", "-"], s = i === "D" ? "d_v" : i === "B" ? "spice_b" : Y(i);
  else if (i === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !fe(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), o = t[r.length + 1] || "";
    const w = n(o)?.type;
    k = ["NPN", "PNP"].includes(w), s = k ? (r.length === 3 ? "q_" : "spice_q4_") + Y(w) : "spice_q" + r.length;
  } else if (i === "M") {
    const w = n(t[4]), a = n(t[5]), f = w?.type === "VDMOS" || !a && (!t[5] || fe(t[5]));
    r = f ? ["D", "G", "S"] : ["D", "G", "S", "B"], o = t[r.length + 1] || "";
    const m = n(o), O = m?.type;
    if (f && m && O !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!f && O === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    k = ["NMOS", "PMOS", "VDMOS"].includes(O);
    let h = null, x = m;
    const v = /* @__PURE__ */ new Set();
    for (; x && !v.has(x.name) && (v.add(x.name), h = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(x.raw), !h); )
      x = n(x.baseModel);
    const R = O === "PMOS" || O === "VDMOS" && h && (h[1] === void 0 || Number(h[1]) >= 0.5);
    s = k ? "spice_" + (R ? "pmos" : "nmos") + (f ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    o = t[4] || "";
    const w = n(o)?.type, a = i === "Z" && ["NIGBT", "PIGBT"].includes(w);
    r = a ? ["C", "G", "E"] : ["D", "G", "S"], k = i === "J" ? ["NJF", "PJF"].includes(w) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(w), s = "spice_" + (a ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(w || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    r = ["+", "-"], s = "spice_" + Y(i);
    let w = 3, a = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[w] || "");
    if (/^poly$/i.test(t[w] || "") && (a = /^\(\s*(\d+)\s*\)$/.exec(t[++w] || ""), !a))
      throw Error("POLY requires a dimension.");
    if (a) {
      const f = Number(a[1]);
      if (f > 128) throw Error("POLY supports at most 128 controlling variables.");
      let m = w + 1, O = [];
      const h = "EG".includes(i), x = f * (h ? 2 : 1);
      for (; O.length < x && m < t.length; ) O.push(...$e(t[m++]));
      if (O.length !== x || m >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (h) {
        for (let v = 0; v < f; v++) r.push("C" + (v + 1) + "+", "C" + (v + 1) + "-");
        c = [t[1], t[2], ...O];
      } else l = O;
      E = m, p = "POLY(" + f + ") " + (h ? "" : O.join(" ") + " "), g = "POLY", h && (s = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? g = "BEHAVIORAL" : "EG".includes(i) ? (r.push("C+", "C-"), g = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (l = [t[3]], E = 4, p = t[3] + " ");
    y = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (g ? " · " + g : "");
  } else if (i === "S")
    r = ["A", "B", "C+", "C-"], o = t[5] || "", s = "spice_device", y = "Voltage switch";
  else if (i === "W")
    r = ["A", "B"], l = [t[3]], o = t[4] || "", E = 3, s = "spice_device", y = "Current switch";
  else if ("TO".includes(i))
    r = ["L+", "L-", "R+", "R-"], i === "O" && (o = t[5] || ""), s = "spice_device", y = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    r = ["N1", "N2", "COM"], o = t[4] || "", s = "spice_device", y = "Distributed RC";
  else if (i === "A")
    r = Array.from({ length: 8 }, (w, a) => "P" + (a + 1)), s = "spice_device", y = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (u = t.slice(1, -1), u.some((w) => !/^L/i.test(w.split(":").at(-1)))) throw Error("K references must name inductors.");
    E = t.length - 1, s = "spice_coupling", y = "Magnetic coupling", p = u.join(" ") + " · k=";
  } else if (i === "@")
    r = ["IN", "OUT"], s = "spice_device", y = "FRA";
  else if (i === "&")
    r = ["O+", "O-", "I+", "I-"], s = "spice_device", y = "FRA probe";
  else if (i === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], s = "spice_device", y = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (E || (E = r.length + 1), c.length || (c = t.slice(1, r.length + 1)), c.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= E && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (c.some((w) => /[=()]/.test(w) && !/^\{[\s\S]*\}$/.test(w))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(E).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(E).join(" ")) && (s = "spice_br"), i === "D" && (o = t[3] || ""), i === "@") {
    const w = t.slice(E).join(" ");
    for (const a of w.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(a[1].toUpperCase()), c.push(a[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (l.some((w) => !w)) throw Error("Missing controlling voltage source.");
  const I = r.map((w, a) => i === "A" && Be[(t[9] || "").toUpperCase()]?.[String(a + 1)] || w);
  return { kind: i, pins: r, nodeTokens: c, pinLabels: I, model: o, type: s, controlSource: l[0] || "", controlSources: l, coupledInductors: u, value: p + t.slice(E).join(" "), sourceMode: g, symbol: y, polarityKnown: k };
}
const Fe = _e, qe = new Set(Fe.split(" ")), ce = () => /* @__PURE__ */ Object.create(null), q = (t) => t.toLowerCase();
function oe(t) {
  const e = [], n = [];
  let i = "", r = 0, c = "";
  for (let o = 0; o < t.length; o++) {
    const s = t[o];
    if (c) {
      i += s, s === c && t[o - 1] !== "\\" && (c = "");
      continue;
    }
    if (s === '"' || s === "'") {
      c = s, i += s;
      continue;
    }
    if (!r && (s === ";" || s === "$" && (!o || /\s/.test(t[o - 1])))) break;
    if ("({".includes(s) && (n.push(s), r++), ")}".includes(s) && (r--, n.pop() !== (s === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(s) && !r ? (i && e.push(i), i = "") : i += s;
  }
  if (r || c) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function Xe(t, e = {}) {
  const n = [], i = [], r = [], c = Object.assign(ce(), e.models), o = ce(), s = (a, f, m) => n.push({ severity: a, line: f, message: m });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const l = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((a, f) => {
    const m = a.trim();
    !m || m.startsWith("*") || (m.startsWith("+") ? l.length ? l.at(-1).text += " " + m.slice(1).trim() : s("error", f + 1, "Continuation has no preceding statement.") : l.push({ line: f + 1, text: m }));
  });
  for (const a of l) {
    try {
      a.tokens = oe(a.text);
    } catch (m) {
      s("error", a.line, m.message), a.tokens = [];
    }
    const f = a.tokens;
    if (/^\.model$/i.test(f[0] || ""))
      if (f.length < 3) s("error", a.line, ".model requires a name and device type.");
      else {
        const m = /^ako:(.+)$/i.exec(f[2]), O = m && f[3] && !f[3].startsWith("(") ? f[3].split("(")[0].toUpperCase() : "";
        c[q(f[1])] = { name: f[1], type: m ? O : f[2].split("(")[0].toUpperCase(), baseModel: m?.[1] || "", raw: a.text };
      }
  }
  const u = /* @__PURE__ */ new Set();
  function E(a) {
    const f = c[q(a)];
    if (!f) return "";
    if (f.type) return f.type;
    if (u.has(q(a))) throw Error("Circular AKO model inheritance: " + a);
    return u.add(q(a)), f.type = E(f.baseModel), u.delete(q(a)), f.type;
  }
  for (const a of Object.values(c)) if (a.baseModel && !a.type)
    try {
      E(a.name);
    } catch (f) {
      s("error", 0, f.message);
    }
  let p = "", g = 0, y = !1, k = !1;
  const I = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: a, text: f, tokens: m } of l) {
    if (!m.length) continue;
    const O = q(m[0]);
    if (k) {
      s("warning", a, "Statement after .end is not rendered: " + f);
      continue;
    }
    if (O === ".control") {
      y = !0, s("warning", a, ".control script retained but not executed or rendered.");
      continue;
    }
    if (O === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (O === ".subckt") {
      g++, s("error", a, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (O === ".ends") {
      g ? g-- : s("error", a, "Unmatched .ends.");
      continue;
    }
    if (g) continue;
    if (O === ".end") {
      k = !0;
      continue;
    }
    if (O.startsWith(".")) {
      i.push({ line: a, text: f }), O === ".title" ? p = m.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(O) ? s("error", a, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(O) ? s("error", a, "Topology-changing directive is unsupported: " + f) : w.has(O) || s("warning", a, "Directive retained but not resolved: " + f);
      continue;
    }
    const h = m[0][0].toUpperCase();
    if (!qe.has(h)) {
      a === 1 && !/\d/.test(m[0]) && m.length > 1 && h !== "X" ? (p = f, s("warning", a, "First line treated as a SPICE title; use .title for an unambiguous title.")) : s("warning", a, `Unsupported ${h} device was not rendered: ${f}`);
      continue;
    }
    const x = h === "M" || h === "Q" ? 5 : 4;
    if (a === 1 && !/\d/.test(m[0]) && (m.length < x || h === "T" && !/\b(?:zo|z0)\s*=/i.test(f))) {
      p = f, s("info", a, "SPICE title: " + f);
      continue;
    }
    try {
      if (I.has(O)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const v = Ve(m, c), { pins: R, nodeTokens: B, ...T } = v;
      v.polarityKnown || s("warning", a, `${m[0]}: model polarity unknown; explicit ${R.join("/")} terminals retained.`);
      const P = ce();
      R.forEach((te, ne) => {
        const N = q(B[ne]);
        o[N] || (o[N] = { name: N, displayName: m[ne + 1], bit: Object.keys(o).length + 2, terminals: [] }), o[N].terminals.push({ component: m[0], pin: te }), P[te] = N;
      }), r.push({ ...T, name: m[0], terminals: P, line: a, raw: f }), I.add(O);
    } catch (v) {
      s("error", a, `${m[0]}: ${v.message} Statement: ${f}`);
    }
  }
  g && s("error", 0, "Unclosed .subckt definition."), y && s("error", 0, "Unclosed .control block."), r.length || s("error", 0, "No supported components to render."), r.length > 300 && s("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const a of r) {
    for (const f of a.controlSources || []) !f.includes(":") && !r.some((m) => q(m.name) === q(f) && m.kind === "V") && s("error", a.line, `${a.name}: controlling voltage source ${f} was not found.`);
    for (const f of a.coupledInductors || []) !f.includes(":") && !r.some((m) => q(m.name) === q(f) && m.kind === "L") && s("error", a.line, `${a.name}: coupled inductor ${f} was not found.`);
    (a.kind === "B" || a.type === "spice_b") && s("info", a.line, `${a.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: p, components: r, nodes: o, models: c, directives: i, diagnostics: n };
}
const W = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), pe = (t) => W(t).split("/").at(-1);
function He(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), r = [], c = [], o = [];
  let s = 0;
  const l = (E, p) => {
    const g = W(p).split("/").slice(0, -1).concat(W(E)).join("/"), y = [...i].filter(([I]) => W(I) === W(E) || W(I) === g);
    if (y.length === 1) return y[0];
    const k = [...i].filter(([I]) => pe(I) === pe(E));
    if (k.length !== 1) throw Error(k.length ? "Ambiguous library filename: " + E : "Missing library " + E + ". Add this file using Library files.");
    return k[0];
  };
  function u(E, p, g = "", y = []) {
    const k = W(p) + ":" + g.toLowerCase();
    if (y.includes(k)) throw Error("Circular library include: " + [...y, k].join(" → "));
    if (y.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const I = [], w = /^\s*\.endl\b/im.test(E);
    let a = !g;
    const f = (O, h) => {
      if (s += O.length, s > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      o.push(O), c.push({ file: p, line: h + 1 });
    };
    if (E.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((O, h) => {
      const x = O.trim();
      if (/^\.lib\b/i.test(x) && w) {
        const v = oe(x);
        if (v.length === 2 && !/[.\\/]/.test(v[1])) {
          I.push(v[1].toLowerCase()), v[1].toLowerCase() === g.toLowerCase() && (a = !0), f("* Library section " + v[1], h);
          return;
        }
      }
      if (/^\.endl\b/i.test(x)) {
        I.pop(), f("* End library section", h);
        return;
      }
      if (g && I.length && !I.includes(g.toLowerCase())) {
        f("* Unselected library section", h);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(x))
        try {
          const v = oe(x);
          if (!v[1]) throw Error("Include requires a filename.");
          const [R, B] = l(v[1], p);
          f("* Included " + R, h), u(B, R, v[2] || "", [...y, k]);
        } catch (v) {
          r.push({ severity: "error", line: h + 1, source: p, message: v.message }), f("* Unresolved include", h);
        }
      else f(O, h);
    }), !a) throw Error("Library section " + g + " not found in " + p);
  }
  try {
    u(t, n);
  } catch (E) {
    r.push({ severity: "error", line: 0, source: n, message: E.message });
  }
  return { source: o.join(`
`), origins: c, diagnostics: r };
}
const J = () => /* @__PURE__ */ Object.create(null), V = (t) => t.toLowerCase();
function ye(t) {
  const e = J();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!r) throw Error("Expected named parameter assignment, got: " + i);
    const c = V(r[1]);
    let o = r[2];
    if (o === void 0) {
      const s = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!s) throw Error("Expected = after parameter " + c);
      o = s[1];
    }
    if (o || (o = t[++n]), !o || /^params?:$/i.test(o)) throw Error("Missing value for parameter " + c);
    if (Object.hasOwn(e, c)) throw Error("Duplicate parameter: " + c);
    e[c] = o;
  }
  return e;
}
function me(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, J()] : [t.slice(0, e), ye(t.slice(e))];
}
function Qe(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = He(t, e);
  t = n.source;
  const i = [...n.diagnostics], r = J(), c = /* @__PURE__ */ new Set(["0"]), o = (a, f, m) => i.push({ severity: a, line: f, message: m }), s = (a, f, m, O = [], h = J(), x = 0) => {
    const v = { id: a, name: f, parent: m, ports: O, defaults: h, parameters: J(), definitions: J(), devices: [], instances: [], directives: [], line: x, statements: [] };
    return r[a] = v, v;
  }, l = s("root", "Top", null), u = [l], E = [];
  let p = !1, g = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((a, f) => {
    const m = a.trim();
    !m || m.startsWith("*") || (m.startsWith("+") ? E.length ? E.at(-1).text += " " + m.slice(1).trim() : o("error", f + 1, "Continuation has no preceding statement.") : E.push({ text: m, line: f + 1 }));
  });
  for (const { text: a, line: f } of E)
    try {
      const m = oe(a);
      if (!m.length) continue;
      const O = V(m[0]), h = u.at(-1);
      if (g) {
        o("warning", f, "Statement after .end is not rendered: " + a);
        continue;
      }
      if (O === ".control") {
        p = !0, o("warning", f, ".control script retained but not executed or rendered.");
        continue;
      }
      if (O === ".endc") {
        p = !1;
        continue;
      }
      if (p) continue;
      if (O === ".subckt") {
        if (m.length < 2) throw Error(".SUBCKT requires a name.");
        const [x, v] = me(m.slice(2)), R = V(m[1]);
        if (Object.hasOwn(h.definitions, R)) throw Error("Duplicate subcircuit definition: " + m[1]);
        const B = x.map(V);
        if (new Set(B).size !== x.length || B.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (x.some((P) => /[{}()=]/.test(P))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const T = h.id + "/" + encodeURIComponent(R);
        h.definitions[R] = T, u.push(s(T, m[1], h.id, x, v, f));
        continue;
      }
      if (O === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (m[1] && V(m[1]) !== V(h.name)) throw Error(".ENDS name does not match " + h.name);
        u.pop();
        continue;
      }
      if (O === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        g = !0;
        continue;
      }
      if (O === ".param") {
        const x = ye(m.slice(1));
        for (const [v, R] of Object.entries(x)) {
          if (Object.hasOwn(h.parameters, v)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + v);
          h.parameters[v] = R;
        }
      }
      if (O === ".global") {
        if (m.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const x of m.slice(1)) c.add(V(x));
      }
      if (O.startsWith(".") && h.directives.push({ line: f, text: a }), O.startsWith("x")) {
        const [x, v] = me(m.slice(1));
        if (!x.length) throw Error("X instance requires a subcircuit name.");
        const R = /;§pnba\s+(.+)$/i.exec(a)?.[1].split(")");
        h.instances.push({ name: m[0], nodes: x.slice(0, -1).map(V), definitionName: x.at(-1), definitionId: null, parameters: v, line: f, raw: a, pinNames: R });
      } else h.statements.push({ line: f, text: a });
    } catch (m) {
      o("error", f, m.message + " Statement: " + a);
    }
  u.length > 1 && o("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), p && o("error", 0, "Unclosed .control block.");
  function y(a, f) {
    for (; a; ) {
      if (Object.hasOwn(a.definitions, V(f))) return a.definitions[V(f)];
      a = r[a.parent];
    }
    return null;
  }
  for (const a of Object.values(r)) {
    const f = [...a.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...a.statements], m = Xe(f.map((h) => h.text).join(`
`), { models: r[a.parent]?.models });
    a.devices = m.components.map((h) => ({ ...h, line: f[h.line - 1]?.line || a.line })), a.models = m.models, a === l && (l.title = m.title), i.push(...m.diagnostics.filter((h) => !h.message.includes("No supported components to render.") && !h.message.includes("300 components")).map((h) => ({ ...h, line: f[h.line - 1]?.line || a.line })));
    const O = new Set(a.devices.map((h) => V(h.name)));
    for (const h of a.instances)
      if (O.has(V(h.name)) && o("error", h.line, "Duplicate instance/device name: " + h.name), O.add(V(h.name)), h.definitionId = y(a, h.definitionName), !h.definitionId && !/^\{[\s\S]*\}$/.test(h.definitionName)) o("error", h.line, "Undefined subcircuit: " + h.definitionName + " in " + h.name);
      else if (h.definitionId) {
        const x = r[h.definitionId];
        x.ports.length !== h.nodes.length && o("error", h.line, `${h.name}: ${x.name} expects ${x.ports.length} ports; got ${h.nodes.length}.`);
      }
  }
  for (const a of Object.values(r)) delete a.statements;
  const k = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function w(a, f = []) {
    if (k.has(a)) {
      o("error", r[a].line, "Circular subcircuit reference: " + [...f, r[a].name].join(" → "));
      return;
    }
    if (!I.has(a)) {
      if (k.add(a), f.length >= 64) {
        o("error", r[a].line, "Subcircuit dependency nesting exceeds 64 levels."), k.delete(a), I.add(a);
        return;
      }
      for (const m of r[a].instances) m.definitionId && w(m.definitionId, [...f, r[a].name]);
      k.delete(a), I.add(a);
    }
  }
  for (const a of Object.keys(r)) w(a);
  !l.devices.length && !l.instances.length && o("error", 0, "No supported components or instances to render.");
  for (const a of i) !a.source && a.line && n.origins[a.line - 1] && (a.source = n.origins[a.line - 1].file, a.line = n.origins[a.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: l.title || "", scopes: r, globals: [...c], diagnostics: i };
}
const j = () => /* @__PURE__ */ Object.create(null), Z = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ue = (t, e) => Z(t.map((n) => n.toLowerCase()), e.toLowerCase());
function ze(t, e = []) {
  const n = j(), i = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((c) => decodeURIComponent(c)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [c, o] of Object.entries(r.terminals)) i(o).terminals.push({ component: r.name, pin: c });
  for (const r of e) i(r);
  return n;
}
function Ke(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ge = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, We = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function se(t, e, n = (r) => r, i = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (o) => (r.push(o), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (o, s, l) => {
    const u = l.split(",").map((p) => p.trim());
    if (u.some((p) => !p || /[\s{}+*()]/.test(p))) throw Error("Unsupported dynamic voltage/current reference: " + o);
    const E = s.toUpperCase() + "(" + u.map((p) => s.toLowerCase() === "v" ? n(p) : i(p, s)).join(",") + ")";
    return r.push(E), "@@" + (r.length - 1) + "@@";
  });
  let c = t.length;
  return t = t.replace(We, (o, s, l) => {
    if (l.slice(s + o.length).trimStart().startsWith("(")) return o;
    const u = e(o.toLowerCase());
    if (u === void 0) return o;
    if (c += u.length + 2, c > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + u + ")";
  }), t.replace(/@@(\d+)@@/g, (o, s) => r[Number(s)]);
}
function Ge(t, e, n, i) {
  const r = { ...e, ...n }, c = j(), o = /* @__PURE__ */ new Set(), s = j();
  for (const [u, E] of Object.entries(i)) s[u] = se(ge(E), (p) => t[p]);
  function l(u) {
    if (Object.hasOwn(s, u)) return s[u];
    if (Object.hasOwn(c, u)) return c[u];
    if (!Object.hasOwn(r, u)) return t[u];
    if (o.has(u)) {
      if (Object.hasOwn(t, u)) return t[u];
      throw Error("Circular parameter dependency: " + [...o, u].join(" → "));
    }
    return o.add(u), c[u] = se(ge(r[u]), l), o.delete(u), c[u];
  }
  for (const u of Object.keys(r)) l(u);
  return Object.assign(j(), t, c, s);
}
function be(t, e, n, i) {
  let r = "";
  for (let l = 0; l < t.length; ) {
    const u = t[l];
    if (u !== "{" && u !== "'") {
      r += u, l++;
      continue;
    }
    const E = l++;
    let p = 1, g = "";
    for (; l < t.length && p; l++) {
      if (u === "'") {
        t[l] === "'" && (p = 0);
        continue;
      }
      if (g) {
        t[l] === g && (g = "");
        continue;
      }
      if (t[l] === '"' || t[l] === "'") {
        g = t[l];
        continue;
      }
      t[l] === "{" && p++, t[l] === "}" && p--;
    }
    if (p) throw Error("Unclosed parameter expression.");
    r += u + se(t.slice(E + 1, l - 1), (y) => e[y], n, i) + (u === "{" ? "}" : "'");
  }
  const c = [];
  let o = 0, s = "";
  for (let l = 0; l < r.length; l++) {
    const u = r[l];
    if (s) {
      u === s && r[l - 1] !== "\\" && (s = "");
      continue;
    }
    if (u === '"' || u === "'") {
      s = u;
      continue;
    }
    if ("({".includes(u) && o++, ")}".includes(u) && o--, !o && (l === 0 || /\s/.test(r[l - 1]))) {
      const E = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(l));
      E && (c.push({ start: l, end: l + E[0].length, key: E[1].toLowerCase() }), l += E[0].length - 1);
    }
  }
  if (c.length) {
    let l = r.slice(0, c[0].start);
    c.forEach((u, E) => {
      const p = c[E + 1]?.start ?? r.length, g = r.slice(u.end, p);
      l += r.slice(u.start, u.end) + (g.includes("{") || ["refnode", "intnode"].includes(u.key) ? g : se(g, (y) => e[y], n, i));
    }), r = l;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class Ye {
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
class Ze {
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
class d {
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
    return "JavaScript Expression Parser (JSEP) v" + d.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return d.max_unop_len = Math.max(e.length, d.max_unop_len), d.unary_ops[e] = 1, d;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return d.max_binop_len = Math.max(e.length, d.max_binop_len), d.binary_ops[e] = n, i ? d.right_associative.add(e) : d.right_associative.delete(e), d;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return d.additional_identifier_chars.add(e), d;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return d.literals[e] = n, d;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete d.unary_ops[e], e.length === d.max_unop_len && (d.max_unop_len = d.getMaxKeyLen(d.unary_ops)), d;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return d.unary_ops = {}, d.max_unop_len = 0, d;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return d.additional_identifier_chars.delete(e), d;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete d.binary_ops[e], e.length === d.max_binop_len && (d.max_binop_len = d.getMaxKeyLen(d.binary_ops)), d.right_associative.delete(e), d;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return d.binary_ops = {}, d.max_binop_len = 0, d;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete d.literals[e], d;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return d.literals = {}, d;
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
    return new d(e).parse();
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
    return d.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !d.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    d.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return d.isIdentifierStart(e) || d.isDecimalDigit(e);
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
    if (d.hooks[e]) {
      const i = { context: this, node: n };
      return d.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (d.hooks[e]) {
      const n = { context: this };
      return d.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === d.SPACE_CODE || e === d.TAB_CODE || e === d.LF_CODE || e === d.CR_CODE; )
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
      type: d.COMPOUND,
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
      if (i = this.code, i === d.SEMCOL_CODE || i === d.COMMA_CODE)
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
    let e = this.expr.substr(this.index, d.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (d.binary_ops.hasOwnProperty(e) && (!d.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !d.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, r, c, o, s, l, u;
    if (o = this.gobbleToken(), !o || (n = this.gobbleBinaryOp(), !n))
      return o;
    for (c = { value: n, prec: d.binaryPrecedence(n), right_a: d.right_associative.has(n) }, s = this.gobbleToken(), s || this.throwError("Expected expression after " + n), r = [o, c, s]; n = this.gobbleBinaryOp(); ) {
      if (i = d.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      c = { value: n, prec: i, right_a: d.right_associative.has(n) }, u = n;
      const E = (p) => c.right_a && p.right_a ? i > p.prec : i <= p.prec;
      for (; r.length > 2 && E(r[r.length - 2]); )
        s = r.pop(), n = r.pop().value, o = r.pop(), e = {
          type: d.BINARY_EXP,
          operator: n,
          left: o,
          right: s
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + u), r.push(c, e);
    }
    for (l = r.length - 1, e = r[l]; l > 1; )
      e = {
        type: d.BINARY_EXP,
        operator: r[l - 1].value,
        left: r[l - 2],
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
    let e, n, i, r;
    if (this.gobbleSpaces(), r = this.searchHook("gobble-token"), r)
      return this.runHook("after-token", r);
    if (e = this.code, d.isDecimalDigit(e) || e === d.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === d.SQUOTE_CODE || e === d.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === d.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, d.max_unop_len), i = n.length; i > 0; ) {
        if (d.unary_ops.hasOwnProperty(n) && (!d.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !d.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const c = this.gobbleToken();
          return c || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: d.UNARY_EXP,
            operator: n,
            argument: c,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      d.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), d.literals.hasOwnProperty(r.name) ? r = {
        type: d.LITERAL,
        value: d.literals[r.name],
        raw: r.name
      } : r.name === d.this_str && (r = { type: d.THIS_EXP })) : e === d.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === d.PERIOD_CODE || n === d.OBRACK_CODE || n === d.OPAREN_CODE || n === d.QUMARK_CODE; ) {
      let i;
      if (n === d.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== d.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === d.OBRACK_CODE ? (e = {
        type: d.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== d.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === d.OPAREN_CODE ? e = {
        type: d.CALL_EXP,
        arguments: this.gobbleArguments(d.CPAREN_CODE),
        callee: e
      } : (n === d.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: d.MEMBER_EXP,
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
    for (; d.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === d.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); d.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); d.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      d.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, d.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === d.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === d.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: d.LITERAL,
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
      let c = this.expr.charAt(this.index++);
      if (c === i) {
        r = !0;
        break;
      } else if (c === "\\")
        switch (c = this.expr.charAt(this.index++), c) {
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
            e += c;
        }
      else
        e += c;
    }
    return r || this.throwError('Unclosed quote after "' + e + '"'), {
      type: d.LITERAL,
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
    for (d.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, d.isIdentifierPart(e)); )
      this.index++;
    return {
      type: d.IDENTIFIER,
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
      let c = this.code;
      if (c === e) {
        i = !0, this.index++, e === d.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (c === d.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === d.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === d.CBRACK_CODE)
            for (let o = n.length; o < r; o++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const o = this.gobbleExpression();
        (!o || o.type === d.COMPOUND) && this.throwError("Expected comma"), n.push(o);
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
    let e = this.gobbleExpressions(d.CPAREN_CODE);
    if (this.code === d.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: d.SEQUENCE_EXP,
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
      type: d.ARRAY_EXP,
      elements: this.gobbleArguments(d.CBRACK_CODE)
    };
  }
}
const Je = new Ye();
Object.assign(d, {
  hooks: Je,
  plugins: new Ze(d),
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
d.max_unop_len = d.getMaxKeyLen(d.unary_ops);
d.max_binop_len = d.getMaxKeyLen(d.binary_ops);
const ee = (t) => new d(t).parse(), et = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(d).filter((t) => !et.includes(t) && ee[t] === void 0).forEach((t) => {
  ee[t] = d[t];
});
ee.Jsep = d;
const tt = "ConditionalExpression";
var nt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const c = this.gobbleExpression();
          if (c || this.throwError("Expected expression"), n.node = {
            type: tt,
            test: i,
            consequent: r,
            alternate: c
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let o = i;
            for (; o.right.operator && t.binary_ops[o.right.operator] <= 0.9; )
              o = o.right;
            n.node.test = o.right, o.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ee.plugins.register(nt);
const rt = "ConditionalExpression";
var it = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const i = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const c = this.gobbleExpression();
          if (c || this.throwError("Expected expression"), n.node = {
            type: rt,
            test: i,
            consequent: r,
            alternate: c
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let o = i;
            for (; o.right.operator && t.binary_ops[o.right.operator] <= 0.9; )
              o = o.right;
            n.node.test = o.right, o.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ee.plugins.register(it);
const ot = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Ee = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, $ = (t) => Number(t) > 0.5;
function le(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function r(s) {
    return s = String(s).trim(), /^\{[\s\S]*\}$/.test(s) && (s = s.slice(1, -1)), s = s.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (l) => {
      if (l[0] === '"' || l[0] === "'") return l;
      const [, u, E, p] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(l), g = E.toLowerCase(), y = g.startsWith("meg") ? 1e6 : g.startsWith("mil") ? 254e-7 : ot[g[0]] || 1;
      return "(" + (p ? +(u + (u.includes(".") ? "" : ".") + p) : Number(u)) * y + ")";
    }), c(ee(s));
  }
  function c(s) {
    if (++i > 1e4) throw Error("Structural expression is too complex.");
    if (s.type === "Literal") return s.value;
    if (s.type === "Identifier") {
      const l = s.name.toLowerCase();
      if (l === "pi") return Math.PI;
      if (l === "e") return Math.E;
      if (!Object.hasOwn(e, l)) throw Error("Undefined structural parameter: " + s.name);
      if (n.has(l)) throw Error("Circular structural parameter: " + l);
      n.add(l);
      const u = r(e[l]);
      return n.delete(l), u;
    }
    if (s.type === "ConditionalExpression") return $(c(s.test)) ? c(s.consequent) : c(s.alternate);
    if (s.type === "UnaryExpression") {
      const l = c(s.argument);
      if (s.operator === "-") return -l;
      if (s.operator === "+") return +l;
      if (s.operator === "!" || s.operator === "~") return !$(l);
    }
    if (s.type === "BinaryExpression") {
      const l = c(s.left);
      if (s.operator === "&&") return $(l) && $(c(s.right));
      if (s.operator === "||") return $(l) || $(c(s.right));
      const u = c(s.right);
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
          return $(l) !== $(u);
        case "&":
          return $(l) && $(u);
        case "|":
          return $(l) || $(u);
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
        return $(c(s.arguments[0])) ? c(s.arguments[1]) : c(s.arguments[2]);
      }
      if (Object.hasOwn(Ee, l)) return Ee[l](...s.arguments.map(c));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const o = r(t);
  if (typeof o == "number" && !Number.isFinite(o)) throw Error("Structural expression is not finite.");
  return o;
}
function st(t) {
  Ke(t);
  const e = j(), n = /* @__PURE__ */ new Map();
  let i = 0, r = 0;
  function c(o, s, l, u, E, p, g) {
    if (s.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++i > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const y = t.scopes[o], k = s.length ? Z(s.slice(0, -1), s.at(-1)) : "", I = j();
    if (g.some((h) => h.scopeId === o)) throw Error("Circular subcircuit reference at " + k);
    const w = Ge(u, y.defaults, y.parameters, E);
    function a(h) {
      if (/^\{[\s\S]*\}$/.test(h)) {
        const v = le(h, w);
        h = String(typeof v == "boolean" ? Number(v) : v);
      }
      /^"[\s\S]*"$/.test(h) && (h = h.slice(1, -1));
      const x = h.toLowerCase();
      return Object.hasOwn(l, x) ? l[x] : t.globals.includes(x) ? ue([], x) : I[x] || (I[x] = ue(s, x));
    }
    const f = { id: k, path: s, scopeId: o, name: p?.name || "Top", definition: y.name, ports: y.ports.map((h) => ({ name: h, node: a(h) })), params: w, nodes: I, models: j(), devices: [], children: [], raw: p?.raw || "", line: p?.line || 0 };
    e[k] = f, n.set(k, a);
    const m = [...g, f];
    function O(h) {
      if (!h) return "";
      let x = y;
      for (; x; ) {
        if (x.directives.some((v) => new RegExp("^\\.model\\s+" + h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(v.text))) {
          const v = [...m].reverse().find((R) => R.scopeId === x.id);
          return Z(v?.path || [], h.toLowerCase());
        }
        x = t.scopes[x.parent];
      }
      return h;
    }
    for (const h of y.directives.filter((x) => /^\.model\b/i.test(x.text))) {
      const x = /^\.model\s+(\S+)/i.exec(h.text)?.[1];
      if (!x) continue;
      const v = O(x), R = y.models[x.toLowerCase()], B = be(h.text, w, a, (T) => Z(s, T));
      f.models[v] = { ...R, name: v, raw: B.replace(/^(\.model\s+)\S+/i, (T, P) => P + v), instanceId: k, parameters: w };
    }
    for (const h of y.devices) {
      if (++r > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const x = j();
      for (const [R, B] of Object.entries(h.terminals)) x[R] = a(B);
      const v = O(h.model);
      f.devices.push({ ...h, name: Z(s, h.name), localName: h.name, instanceId: k, terminals: x, model: v, parameters: w });
    }
    for (const h of y.instances) {
      let x = h.definitionId;
      if (!x) {
        const T = String(le(h.definitionName, w)).toLowerCase();
        let P = y;
        for (; P && !x; )
          x = P.definitions[T], P = t.scopes[P.parent];
        if (!x) throw Error("Undefined selected subcircuit: " + T);
      }
      const v = t.scopes[x], R = j();
      if (v.ports.length !== h.nodes.length) throw Error(h.name + ": expected " + v.ports.length + " ports; got " + h.nodes.length);
      v.ports.forEach((T, P) => {
        R[T.toLowerCase()] = a(h.nodes[P]);
      });
      const B = c(x, [...s, h.name], R, w, h.parameters, h, m);
      h.pinNames?.length === B.ports.length && B.ports.forEach((T, P) => {
        T.label = h.pinNames[P];
      }), f.children.push(B);
    }
    return f;
  }
  try {
    let E = function(p, g) {
      const y = g.split(":");
      if (y.length === 1) return { owner: p, name: g };
      const k = y.pop();
      for (const I of [[...p.path, ...y], y]) {
        const w = s.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: k };
      }
      throw Error("Unknown hierarchical reference: " + g);
    };
    const o = c(t.rootId, [], j(), j(), j(), null, []), s = new Map(Object.values(e).map((p) => [p.id.toLowerCase(), p])), l = Object.assign(j(), ...Object.values(e).map((p) => p.models)), u = (p) => l[p] || Object.entries(l).find(([g]) => g.startsWith(p + "."))?.[1];
    for (const p of Object.values(e)) for (const g of p.devices) {
      const y = t.scopes[p.scopeId].devices.find((w) => w.name === g.localName), k = (w) => {
        const a = E(p, w);
        return n.get(a.owner.id)(a.name);
      }, I = (w, a = "", f = "") => {
        const m = E(p, w), O = m.owner.devices.find((h) => h.localName.toLowerCase() === m.name.toLowerCase());
        if (a.toLowerCase() === "ix") {
          const h = m.owner.ports.find((x, v) => x.name.toLowerCase() === m.name.toLowerCase() || String(v + 1) === m.name);
          if (h) return m.owner.id + ":" + h.name;
        }
        if (!O) {
          if (f) throw Error(g.name + ": referenced " + f + " device " + w + " was not found.");
          return Z(m.owner.path, m.name);
        }
        if (f && O.kind !== f) throw Error(g.name + ": " + w + " must be a " + f + " device.");
        return O.name;
      };
      if (g.value = be(y.value, p.params, k, I), y.model && (g.value = g.value.replace(y.model, g.model)), g.kind === "M" && Object.keys(g.terminals).length === 3) {
        let w = u(g.model), a = !1;
        const f = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !f.has(w.name); ) {
          f.add(w.name);
          const m = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (m) {
            a = m[1] === void 0 || Number(le(m[1], w.parameters)) >= 0.5;
            break;
          }
          const O = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = u(O + (w.baseModel || "").toLowerCase()) || u((w.baseModel || "").toLowerCase());
        }
        f.size && (g.type = "spice_" + (a ? "pmos3" : "nmos3"));
      }
      g.controlSources = (y.controlSources || []).map((w) => I(w, "", "V")), g.controlSource = g.controlSources[0] || "", g.coupledInductors = (y.coupledInductors || []).map((w) => I(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...y.controlSources || [], ...y.coupledInductors || []])) {
        const a = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        g.value = g.value.replace(new RegExp("(?<![\\w./%])" + a + "(?![\\w.$])", "g"), () => I(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: o, contexts: e };
  } catch (o) {
    throw o.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: o.message }], o;
  }
}
function ae(t) {
  return [...t.devices, ...t.children.flatMap(ae)];
}
function we(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Ce(t, e) {
  const n = e.ports.map((r, c) => ({ pin: "P" + c, label: r.label || r.name, node: r.node, implicit: !1 })), i = new Set(ae(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const c = ue([], r);
    i.has(c) && !n.some((o) => o.node === c) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: c, implicit: !0 });
  }
  return n;
}
function at(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const r = t.contexts[i];
  if (!r) throw Error("Unknown instance: " + i);
  const c = [], o = [];
  function s(E) {
    o.push(...Object.values(E.nodes), ...E.ports.map((p) => p.node)), c.push(...E.devices.map((p) => ({ ...p, layoutLabel: [...E.path.slice(r.path.length), p.localName].join("/") })));
    for (const p of E.children) {
      if (e === "flat" || n.has(p.id)) {
        s(p);
        continue;
      }
      const g = Ce(t, p), y = j();
      g.forEach((k) => {
        y[k.pin] = k.node;
      }), c.push({ name: p.id, kind: "X", type: "spice_subckt", terminals: y, value: p.definition, raw: p.raw, line: p.line, instanceId: p.id, layoutLabel: p.path.slice(r.path.length).join("/"), block: { definitionId: p.scopeId, ports: g, parameters: p.params } });
    }
  }
  s(r);
  for (const [E, p] of r.ports.entries()) c.push({ name: "@port/" + i + "/" + E, kind: "PORT", type: "spice_port", terminals: { A: p.node }, layoutLabel: p.name, value: p.name, raw: "Interface port " + p.name, synthetic: !0 });
  if (c.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const l = Object.assign(j(), ...Object.values(t.contexts).map((E) => E.models)), u = { title: i || t.ir.title, components: c, nodes: ze(c, o), models: l, diagnostics: t.ir.diagnostics, mode: e, focus: i };
  return u.topology = ct(t, u), u;
}
function ct(t, e) {
  const n = [], i = /* @__PURE__ */ new Set();
  for (const o of e.components)
    if (!o.synthetic)
      if (o.kind === "X") {
        const s = t.contexts[o.instanceId];
        if (!s) throw Error("Projection contains an unknown block.");
        const l = Ce(t, s);
        if (JSON.stringify(Object.entries(o.terminals)) !== JSON.stringify(l.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + o.name);
        n.push(...ae(s));
      } else n.push(o);
  for (const o of n) {
    if (i.has(o.name)) throw Error("Projection duplicates " + o.name);
    i.add(o.name);
  }
  const r = we(n), c = ae(t.contexts[e.focus]);
  if (r !== we(c)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: r };
}
function lt(t) {
  const e = j(), n = j();
  for (const i of t.components) {
    const r = j(), c = j();
    for (const [o, s] of Object.entries(i.terminals))
      r[o] = [t.nodes[s].bit], c[o] = "input";
    e[i.name] = { type: i.type, port_directions: c, connections: r, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((o) => ({ pin: o.pin, label: o.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((o, s) => ({ pin: o, label: i.pinLabels?.[s] || o })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n } } };
}
function dt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, r = (c) => (n.has(c) || n.set(c, n.size + 2), n.get(c));
  return Object.entries(t.modules.circuit.cells).forEach(([c, o], s) => {
    const l = "c" + s;
    e.set(l, c);
    const u = Object.fromEntries(Object.entries(o.connections).map(([E, p]) => [E, p.map(r)]));
    i[l] = { type: o.type, connections: u, port_directions: o.port_directions, attributes: { displayRef: o.attributes.displayRef || o.attributes.ref || "", value: o.attributes.value || "", name: o.attributes.name || "" } }, o.spiceBlock && (i[l].spiceBlock = o.spiceBlock), o.spiceSymbol && (i[l].spiceSymbol = o.spiceSymbol);
  }), { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i } } }, ids: e, bits: new Map([...n].map(([c, o]) => [o, c])) };
}
const K = /* @__PURE__ */ new Map();
async function ut(t, e) {
  const n = dt(t), i = JSON.stringify([n.netlist, e]);
  let r = K.get(i);
  r ? (K.delete(i), K.set(i, r)) : (r = await ht(n.netlist, e), r.length < 1e6 && (K.set(i, r), K.size > 20 && K.delete(K.keys().next().value)));
  const c = new DOMParser().parseFromString(r, "image/svg+xml");
  if (c.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const o of c.querySelectorAll("[id],[class]")) {
    const s = o.getAttribute("id");
    s?.startsWith("cell_") && n.ids.has(s.slice(5)) && o.setAttribute("id", "cell_" + n.ids.get(s.slice(5)));
    const l = o.getAttribute("class");
    l && o.setAttribute("class", l.split(/\s+/).map((u) => u.startsWith("cell_") && n.ids.has(u.slice(5)) ? "cell_" + n.ids.get(u.slice(5)) : /^net_\d+$/.test(u) && n.bits.has(Number(u.slice(4))) ? "net_" + n.bits.get(Number(u.slice(4))) : u).join(" "));
  }
  return new XMLSerializer().serializeToString(c.documentElement);
}
function ht(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-C4StsAEx.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, r) => {
    const c = (l, u) => {
      clearTimeout(s), n.terminate(), l ? r(Error(l)) : i(u);
    }, o = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, s = setTimeout(() => c("Layout timed out. Open a subcircuit sheet or collapse instances."), o);
    n.onmessage = ({ data: l }) => c(l.error, l.svg), n.onerror = (l) => c(l.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const ft = `* Mixed RLC, semiconductors and nonlinear / controlled sources
.title Mixed analog circuit
VCC vcc 0 DC 5
VIN in 0 SIN(0 0.1 1k)
R1 in tank 1k
L1 tank out 10m
C1 out 0 100n
D1 out vcc DCLAMP
Q1 vcc out emitter QN
R2 emitter 0 2.2k
M1 drain out 0 0 MN W=10u L=1u
R3 vcc drain 4.7k
B1 nonlinear 0 V={tanh(V(out))*2}
R4 nonlinear 0 10k
E1 ev 0 out 0 2
R5 ev 0 10k
G1 gi 0 out 0 1m
R6 gi 0 1k
F1 fi 0 VIN 0.5
R7 fi 0 1k
H1 hi 0 VIN 100
R8 hi 0 10k
I1 vcc out DC 10u
.model DCLAMP D(Is=1n)
.model QN NPN(Bf=100)
.model MN NMOS(Vto=1 Kp=100u)
.param gain=2
.tran 1u 10m
.end
`, de = `* RLC low-pass filter
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, pt = `* Two parameterized channels, each with two nested filter instances
.title Hierarchical analog channels
.global vdd
.param base=1k
VCC vdd 0 DC 5
VIN input 0 AC 1
Xleft input left CHANNEL params: rval={base} cval=10n
Xright input right CHANNEL rval={base*2} cval=22n
Rleft left 0 10k
Rright right 0 10k
.subckt CHANNEL in out params: rval=1k cval=10n
.param second={rval*2}
Xfirst in mid FILTER r={rval} c={cval}
Xsecond mid out FILTER r={second} c={cval}
Dbias out vdd CLAMP
.model CLAMP D(Is=1n)
.subckt FILTER a b params: r=1k c=10n
R1 a local {r}
L1 local b 10u
C1 b 0 {c}
Bmonitor monitor 0 V={tanh(V(local))}
Rmonitor monitor 0 1Meg
.ends FILTER
.ends CHANNEL
.tran 1u 1m
.end
`, mt = `* Viewer grammar coverage: all documented LTspice 24+ element prefixes
.title LTspice element families
V1 in 0 PULSE(0 1 0 1n 1n 1u 2u 4) Rser=0
VSENSE sense 0 0
I1 in 0 PWL(0 0 1u 1m) load
R1 in mid 1k tc=.001
C1 mid 0 Q=100p*x ic=0
LA mid tank Flux=1m*tanh(x)
LB tank 0 2m Rser=0
K1 LA LB .8
D1 mid 0 DD m=2
Q1 in mid 0 QN off
M1 in mid 0 0 MN L=1u W=10u
MPOWER in mid 0 MPWR
J1 in mid 0 JN
Z1 in mid 0 ZN
ZIGBT in mid 0 ZI
E1 ev 0 in mid 2
G1 gi 0 in mid table=(0,0,1,1m)
F1 fi 0 VSENSE 2
H1 hv 0 VSENSE 1k
S1 in sw mid 0 SWMOD off
W1 sw 0 VSENSE CSMOD off
T1 in 0 t 0 ZO=50 TD=1n
O1 t 0 o 0 LTMOD
U1 o u 0 RCMOD L=1
B1 bv 0 V=if(V(mid)>0,tanh(V(mid)),0) tripdv=1m
BR1 mid 0 R=1k+time
BP1 mid 0 P=1m
A1 in mid 0 0 0 inverted logic 0 AND Vhigh=1.8 Td=1n
X1 in x 0 DIVIDER top=1k bot=2k
@1 in mid fstart=10 fend=1Meg refnode=0 intnode=mid
&1 mid 0 in 0
Ö1 ota in 0 mid in Gm1=1m Gm2=0 Ibias=1u
.model DD D(Is=1n)
.model QN NPN(Bf=100)
.model MN NMOS(Vto=1 Kp=1m)
.model MPWR VDMOS(Vto=2 Kp=1)
.model JN NJF(Vto=-2 Beta=1m)
.model ZN NMF(Vto=-1 Beta=1m)
.model ZI NIGBT(Vt=4)
.model SWMOD SW(Ron=1 Roff=1Meg Vt=.5)
.model CSMOD CSW(Ron=1 Roff=1Meg It=1m)
.model LTMOD LTRA(R=1 L=1u G=0 C=10p Len=1)
.model RCMOD URC(Rperl=1k Cperl=1n)
.subckt DIVIDER a b c
Rtop a b {top}
Rbot b c {bot}
.ends DIVIDER
.tran 0 10u
.end
`;
function gt(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function xe(t) {
  return gt(await t.arrayBuffer());
}
const C = (t) => document.getElementById("spice-" + t), ie = C("app");
if (ie) {
  let O = function() {
    r = "", f(), n.textContent = "Input changed — generate to refresh the schematic.";
  }, h = function(b) {
    i.replaceChildren();
    for (const { severity: S, line: A, message: M, source: L } of b) {
      const _ = document.createElement("li");
      _.className = S, _.textContent = `${S.toUpperCase()}${L && L !== "input.cir" ? " · " + L : ""}${A ? " · line " + A : ""}: ${M}`, i.append(_);
    }
    C("messages").open = b.some((S) => S.severity !== "info"), C("message-count").textContent = `${b.length} message${b.length === 1 ? "" : "s"}`;
  }, x = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${g.x} ${g.y} ${g.w} ${g.h}`), C("zoom-level").textContent = Math.round(y.w / g.w * 100) + "%";
  }, v = function(b, S = g.x + g.w / 2, A = g.y + g.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, g.w * b / y.w)) * y.w / g.w;
    g = { x: S + (g.x - S) * M, y: A + (g.y - A) * M, w: g.w * M, h: g.h * M }, x();
  }, B = function(b) {
    const S = new URLSearchParams();
    b && S.set("instance", b);
    const A = S.toString();
    location.hash.slice(1) === A ? (u = b, N()) : location.hash = A;
  }, T = function() {
    u = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, P = function(b) {
    const S = o.contexts[b].path;
    for (let A = 1; A <= S.length; A++) I.add(S.slice(0, A).map(encodeURIComponent).join("/"));
  }, te = function() {
    const b = !!(E && E !== u && o?.contexts[E]);
    C("selection-actions").hidden = !b, C("toggle-instance").textContent = I.has(E) ? "Collapse instance" : "Expand instance", C("toggle-instance").disabled = C("mode").value === "flat", C("open-instance").href = "#" + new URLSearchParams({ instance: E });
  }, ne = function() {
    C("breadcrumbs").replaceChildren();
    const b = (A, M) => {
      const L = document.createElement("button");
      L.type = "button", L.textContent = A, L.onclick = () => B(M), L.disabled = M === u, C("breadcrumbs").append(L);
    };
    if (b("Top", ""), u) {
      const A = o.contexts[u].path;
      for (let M = 0; M < A.length; M++) b(A[M], A.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    C("instances").replaceChildren();
    const S = (A, M) => {
      for (const L of A.children) {
        const _ = document.createElement("div");
        _.className = "spice-instance-row", _.style.setProperty("--depth", Math.min(M, 8)), _.dataset.instance = L.id;
        const F = document.createElement("button");
        F.type = "button", F.textContent = I.has(L.id) ? "−" : "+", F.title = (I.has(L.id) ? "Collapse " : "Expand ") + L.id, F.setAttribute("aria-label", F.title), F.setAttribute("aria-expanded", String(I.has(L.id))), F.disabled = C("mode").value === "flat", F.onclick = () => {
          I.has(L.id) ? I.delete(L.id) : P(L.id), E = L.id, N();
        };
        const Q = document.createElement("a");
        Q.href = "#" + new URLSearchParams({ instance: L.id }), Q.textContent = L.name + " · " + L.definition, Q.title = "Open " + L.id + " as its own sheet";
        const z = document.createElement("span");
        if (z.className = "spice-help", z.textContent = Object.entries(L.params).map(([G, D]) => G + "=" + D).join(" · "), _.append(F, Q), z.textContent) {
          const G = document.createElement("details"), D = document.createElement("summary");
          D.textContent = "Parameters", G.append(D, z), _.append(G);
        }
        C("instances").append(_), S(L, M + 1);
      }
    };
    S(o.contexts[u], 0), C("hierarchy-panel").hidden = !o.contexts[u].children.length, C("focus-title").textContent = u ? u + " / " + o.contexts[u].definition : "Top-level schematic", te();
  };
  const t = C("input"), e = C("preview"), n = C("status"), i = C("diagnostics");
  let r = "", c, o, s, l = "", u = "", E = "", p = !1, g = { x: 0, y: 0, w: 1, h: 1 }, y = { ...g }, k;
  const I = /* @__PURE__ */ new Set();
  let w = !1, a = {};
  try {
    a = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ie.addEventListener("click", (b) => {
    p && b.target.closest('a[href^="#"]') && b.preventDefault();
  });
  const f = () => {
    C("copy").disabled = C("download").disabled = !r || p;
  }, m = () => ({ font: C("font").value, fontSize: Number(C("size").value), color: C("color").value, detailed: C("detailed").checked });
  t.value = de;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || de;
  } catch {
  }
  t.addEventListener("input", O);
  for (const b of ["font", "size", "color", "detailed"]) C(b).addEventListener("input", O);
  C("zoom-in").onclick = () => v(0.8), C("zoom-out").onclick = () => v(1.25), C("fit").onclick = () => {
    g = { ...y }, x();
  };
  const R = (b) => {
    const S = e.querySelector("svg");
    return S ? new DOMPoint(b.clientX, b.clientY).matrixTransform(S.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (b) => {
    const S = R(b);
    S && (b.preventDefault(), v(b.deltaY > 0 ? 1.12 : 1 / 1.12, S.x, S.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (b) => {
    b.button !== 0 || !e.querySelector("svg") || (k = { start: R(b), x: b.clientX, y: b.clientY, view: { ...g }, moved: !1 }, e.setPointerCapture(b.pointerId));
  }), e.addEventListener("pointermove", (b) => {
    if (!k) return;
    const S = R(b);
    Math.hypot(b.clientX - k.x, b.clientY - k.y) > 4 && (k.moved = !0), g.x += k.start.x - S.x, g.y += k.start.y - S.y, x();
  }), e.addEventListener("pointerup", (b) => {
    if (!k) return;
    const S = k.moved;
    if (k = null, e.hasPointerCapture(b.pointerId) && e.releasePointerCapture(b.pointerId), !S) {
      const A = document.elementFromPoint(b.clientX, b.clientY)?.closest("[data-component]"), M = c?.components.find((L) => L.name === A?.dataset.component);
      M && (E = M.instanceId || "", C("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([L, _]) => `${L} → ${_}`).join("   ")}`, M.kind === "X" && C("mode").value === "hierarchical" ? (P(M.instanceId), N()) : te());
    }
  }), window.addEventListener("hashchange", () => {
    if (p) {
      w = !0;
      return;
    }
    T(), E = "", N();
  }), C("mode").onchange = () => N(), C("collapse-all").onclick = () => {
    I.clear(), N();
  }, C("expand-all").onclick = () => {
    for (const b of Object.keys(o?.contexts || {})) b && I.add(b);
    N();
  }, C("toggle-instance").onclick = () => {
    I.has(E) ? I.delete(E) : P(E), N();
  }, e.addEventListener("pointercancel", () => {
    k = null;
  }), e.addEventListener("keydown", (b) => {
    const S = b.target.closest("[data-instance]");
    if (S && (b.key === "Enter" || b.key === " ")) {
      b.preventDefault(), E = S.dataset.instance, P(E), N();
      return;
    }
    b.key === "+" || b.key === "=" ? v(0.8) : b.key === "-" ? v(1.25) : b.key.toLowerCase() === "f" ? (g = { ...y }, x()) : b.key.startsWith("Arrow") && (b.preventDefault(), g.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[b.key] || 0) * g.w, g.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[b.key] || 0) * g.h, x());
  });
  async function N() {
    if (p) return;
    p = !0, r = "", f(), C("generate").disabled = !0, t.readOnly = !0, C("file").disabled = !0, C("libraries").disabled = !0;
    for (const S of ie.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) S.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let b = [];
    try {
      if (l !== t.value || !o) {
        if (s = Qe(t.value, { files: a }), b = [...s.diagnostics], b.some((D) => D.severity === "error"))
          throw o = null, Error("Fix the parser errors below before generating.");
        o = st(s), l && l !== t.value ? (I.clear(), u = "", E = "", history.replaceState(null, "", location.pathname + location.search)) : T(), l = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (b = [...s.diagnostics], h(b), b.some((D) => D.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = at(o, { mode: C("mode").value, expanded: I, focus: u });
      const S = lt(c), A = await ut(S, m()), M = new DOMParser().parseFromString(A, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const L = M.documentElement;
      if (L.localName !== "svg" || L.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const _ = Number(L.getAttribute("width")), F = Number(L.getAttribute("height"));
      y = { x: -20, y: -20, w: _ + 40, h: F + 40 }, g = { ...y }, L.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`), L.setAttribute("width", String(y.w)), L.setAttribute("height", String(y.h)), L.setAttribute("role", "img"), L.setAttribute("aria-label", c.title || "SPICE schematic"), L.setAttribute("style", "background:white");
      for (const D of c.components) {
        const U = M.getElementById("cell_" + D.name);
        if (!U) throw Error("Renderer omitted component " + D.name);
        U.setAttribute("data-component", D.name), D.kind === "X" && (U.setAttribute("data-instance", D.instanceId), U.setAttribute("role", "button"), U.setAttribute("tabindex", "0"), U.setAttribute("aria-label", "Expand " + D.name));
        const H = M.createElementNS(L.namespaceURI, "title");
        H.textContent = D.raw + `
Resolved: ` + D.value + `
` + Object.entries(D.terminals).map(([X, re]) => X + ": " + re).join(", "), U.prepend(H);
      }
      for (const D of Object.values(c.nodes))
        for (const U of L.querySelectorAll(".net_" + D.bit)) {
          U.setAttribute("data-net", D.name);
          const H = M.createElementNS(L.namespaceURI, "title");
          H.textContent = "Node " + D.displayName, U.append(H);
        }
      const Q = c.components.filter((D) => D.kind === "K").map((D) => ({ name: D.name, inductors: D.coupledInductors, value: D.value }));
      if (Q.length) {
        const D = M.createElementNS(L.namespaceURI, "metadata");
        D.setAttribute("id", "spice-magnetic-couplings"), D.textContent = JSON.stringify(Q), L.append(D);
        for (const U of Q) for (const H of U.inductors) {
          const X = M.getElementById("cell_" + H);
          if (!X) continue;
          const re = M.createElementNS(L.namespaceURI, "circle");
          for (const [Oe, ve] of Object.entries({ cx: 24, cy: 38, r: 3, fill: m().color, stroke: "none", "data-coupling": U.name })) re.setAttribute(Oe, String(ve));
          const he = M.createElementNS(L.namespaceURI, "title");
          he.textContent = U.name + " · dotted terminal: " + U.inductors.join(", "), re.append(he), X.append(re);
        }
      }
      r = new XMLSerializer().serializeToString(L), C("source").value = r, e.replaceChildren(document.importNode(L, !0)), x();
      const z = b.filter((D) => D.severity === "warning").length;
      n.textContent = `${c.components.filter((D) => !D.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${z ? " · Review " + z + " warning(s); drawing may be partial." : " · Schematic ready."}`;
      const G = Object.values(c.nodes).map((D) => {
        const U = document.createElement("tr");
        for (const H of [D.displayName, D.terminals.map((X) => X.component + "." + X.pin).join(", ")]) {
          const X = document.createElement("td");
          X.textContent = H, U.append(X);
        }
        return U;
      });
      C("nets").replaceChildren(...G), C("json").value = JSON.stringify({ circuit: c, netlist: S, hierarchy: s }, null, 2), C("selection").textContent = "Click a component to inspect its original statement and pin connections.", ne();
    } catch (S) {
      if (e.replaceChildren(), r = "", C("source").value = "", C("json").value = "", C("nets").replaceChildren(), C("selection").textContent = "", n.textContent = S.message, !o)
        C("hierarchy-panel").hidden = !0, C("selection-actions").hidden = !0, C("breadcrumbs").replaceChildren();
      else if (!o.contexts[u]) {
        const A = document.createElement("button");
        A.type = "button", A.textContent = "Return to Top", A.onclick = () => B(""), C("breadcrumbs").replaceChildren(A);
      }
      S.diagnostics && (b = S.diagnostics), b.some((A) => A.severity === "error") || b.push({ severity: "error", line: 0, message: S.message }), h(b);
    } finally {
      p = !1, C("generate").disabled = !1, t.readOnly = !1, C("file").disabled = !1, C("libraries").disabled = !1;
      for (const S of ie.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) S.disabled = !1;
      o && o.contexts[u] && ne(), e.setAttribute("aria-busy", "false"), f(), w && (w = !1, T(), queueMicrotask(N));
    }
  }
  C("generate").onclick = N;
  for (const b of ie.querySelectorAll("[data-example]")) b.onclick = () => {
    t.value = { mixed: ft, filter: de, hierarchy: pt, ltspice: mt }[b.dataset.example], O(), N();
  };
  C("file").onchange = async (b) => {
    const S = b.target.files[0];
    if (S) {
      if (S.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await xe(S), O(), N();
      } catch (A) {
        n.textContent = "File could not be read: " + A.message;
      } finally {
        b.target.value = "";
      }
    }
  }, C("libraries").onchange = async (b) => {
    try {
      for (const S of b.target.files) {
        if (S.size > 16e6) throw Error("Library exceeds 16 MB: " + S.name);
        a[S.webkitRelativePath || S.name] = await xe(S);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(a));
      } catch {
      }
      o = null, l = "", C("library-status").textContent = Object.keys(a).length + " library file(s) loaded", N();
    } catch (S) {
      n.textContent = S.message;
    } finally {
      b.target.value = "";
    }
  }, C("library-status").textContent = Object.keys(a).length ? "Libraries restored from this session." : "For .include / .lib dependencies", C("download").onclick = () => {
    const b = URL.createObjectURL(new Blob([r], { type: "image/svg+xml;charset=utf-8" })), S = document.createElement("a");
    S.href = b, S.download = "spice-schematic.svg", S.click(), setTimeout(() => URL.revokeObjectURL(b), 1e3);
  }, C("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(r), n.textContent = "SVG source copied to clipboard.";
    } catch {
      C("source-details").open = !0, C("source").focus(), C("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, N();
}
