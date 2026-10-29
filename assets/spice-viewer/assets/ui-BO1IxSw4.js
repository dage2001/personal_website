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
}, nt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", re = (t) => t.toLowerCase(), xe = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), rt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function ot(t, e) {
  const n = (w) => e[re(w || "")] || Object.entries(e).find(([_]) => _.startsWith(re(w || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], u = [], a = "", i = "", c = [], l = [], d = 0, E = "", f = "", h = "", y = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], i = re(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], i = o === "D" ? "d_v" : o === "B" ? "spice_b" : re(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !xe(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), a = t[r.length + 1] || "";
    const w = n(a)?.type;
    y = ["NPN", "PNP"].includes(w), i = y ? (r.length === 3 ? "q_" : "spice_q4_") + re(w) : "spice_q" + r.length;
  } else if (o === "M") {
    const w = n(t[4]), _ = n(t[5]), p = w?.type === "VDMOS" || !_ && (!t[5] || xe(t[5]));
    r = p ? ["D", "G", "S"] : ["D", "G", "S", "B"], a = t[r.length + 1] || "";
    const C = n(a), N = C?.type;
    if (p && C && N !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!p && N === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    y = ["NMOS", "PMOS", "VDMOS"].includes(N);
    let O = null, s = C;
    const g = /* @__PURE__ */ new Set();
    for (; s && !g.has(s.name) && (g.add(s.name), O = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(s.raw), !O); )
      s = n(s.baseModel);
    const v = N === "PMOS" || N === "VDMOS" && O && (O[1] === void 0 || Number(O[1]) >= 0.5);
    i = y ? "spice_" + (v ? "pmos" : "nmos") + (p ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    a = t[4] || "";
    const w = n(a)?.type, _ = o === "Z" && ["NIGBT", "PIGBT"].includes(w);
    r = _ ? ["C", "G", "E"] : ["D", "G", "S"], y = o === "J" ? ["NJF", "PJF"].includes(w) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(w), i = "spice_" + (_ ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(w || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], i = "spice_" + re(o);
    let w = 3, _ = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[w] || "");
    if (/^poly$/i.test(t[w] || "") && (_ = /^\(\s*(\d+)\s*\)$/.exec(t[++w] || ""), !_))
      throw Error("POLY requires a dimension.");
    if (_) {
      const p = Number(_[1]);
      if (p > 128) throw Error("POLY supports at most 128 controlling variables.");
      let C = w + 1, N = [];
      const O = "EG".includes(o), s = p * (O ? 2 : 1);
      for (; N.length < s && C < t.length; ) N.push(...rt(t[C++]));
      if (N.length !== s || C >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (O) {
        for (let g = 0; g < p; g++) r.push("C" + (g + 1) + "+", "C" + (g + 1) + "-");
        u = [t[1], t[2], ...N];
      } else c = N;
      d = C, E = "POLY(" + p + ") " + (O ? "" : N.join(" ") + " "), f = "POLY", O && (i = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? f = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), f = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], d = 4, E = t[3] + " ");
    h = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (f ? " · " + f : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], a = t[5] || "", i = "spice_device", h = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], c = [t[3]], a = t[4] || "", d = 3, i = "spice_device", h = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (a = t[5] || ""), i = "spice_device", h = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], a = t[4] || "", i = "spice_device", h = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (w, _) => "P" + (_ + 1)), i = "spice_device", h = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (l = t.slice(1, -1), l.some((w) => !/^L/i.test(w.split(":").at(-1)))) throw Error("K references must name inductors.");
    d = t.length - 1, i = "spice_coupling", h = "Magnetic coupling", E = l.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], i = "spice_device", h = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], i = "spice_device", h = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], i = "spice_device", h = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (d || (d = r.length + 1), u.length || (u = t.slice(1, r.length + 1)), u.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= d && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (u.some((w) => /[=()]/.test(w) && !/^\{[\s\S]*\}$/.test(w))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(d).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(d).join(" ")) && (i = "spice_br"), o === "D" && (a = t[3] || ""), o === "@") {
    const w = t.slice(d).join(" ");
    for (const _ of w.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(_[1].toUpperCase()), u.push(_[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((w) => !w)) throw Error("Missing controlling voltage source.");
  const m = r.map((w, _) => o === "A" && tt[(t[9] || "").toUpperCase()]?.[String(_ + 1)] || w);
  return { kind: o, pins: r, nodeTokens: u, pinLabels: m, model: a, type: i, controlSource: c[0] || "", controlSources: c, coupledInductors: l, value: E + t.slice(d).join(" "), sourceMode: f, symbol: h, polarityKnown: y };
}
const it = nt, st = new Set(it.split(" ")), be = () => /* @__PURE__ */ Object.create(null), z = (t) => t.toLowerCase();
function pe(t) {
  const e = [], n = [];
  let o = "", r = 0, u = "";
  for (let a = 0; a < t.length; a++) {
    const i = t[a];
    if (u) {
      o += i, i === u && t[a - 1] !== "\\" && (u = "");
      continue;
    }
    if (i === '"' || i === "'") {
      u = i, o += i;
      continue;
    }
    if (!r && (i === ";" || i === "$" && (!a || /\s/.test(t[a - 1])))) break;
    if ("({".includes(i) && (n.push(i), r++), ")}".includes(i) && (r--, n.pop() !== (i === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(i) && !r ? (o && e.push(o), o = "") : o += i;
  }
  if (r || u) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function at(t, e = {}) {
  const n = [], o = [], r = [], u = Object.assign(be(), e.models), a = be(), i = (_, p, C) => n.push({ severity: _, line: p, message: C });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((_, p) => {
    const C = _.trim();
    !C || C.startsWith("*") || (C.startsWith("+") ? c.length ? c.at(-1).text += " " + C.slice(1).trim() : i("error", p + 1, "Continuation has no preceding statement.") : c.push({ line: p + 1, text: C }));
  });
  for (const _ of c) {
    try {
      _.tokens = pe(_.text);
    } catch (C) {
      i("error", _.line, C.message), _.tokens = [];
    }
    const p = _.tokens;
    if (/^\.model$/i.test(p[0] || ""))
      if (p.length < 3) i("error", _.line, ".model requires a name and device type.");
      else {
        const C = /^ako:(.+)$/i.exec(p[2]), N = C && p[3] && !p[3].startsWith("(") ? p[3].split("(")[0].toUpperCase() : "";
        u[z(p[1])] = { name: p[1], type: C ? N : p[2].split("(")[0].toUpperCase(), baseModel: C?.[1] || "", raw: _.text };
      }
  }
  const l = /* @__PURE__ */ new Set();
  function d(_) {
    const p = u[z(_)];
    if (!p) return "";
    if (p.type) return p.type;
    if (l.has(z(_))) throw Error("Circular AKO model inheritance: " + _);
    return l.add(z(_)), p.type = d(p.baseModel), l.delete(z(_)), p.type;
  }
  for (const _ of Object.values(u)) if (_.baseModel && !_.type)
    try {
      d(_.name);
    } catch (p) {
      i("error", 0, p.message);
    }
  let E = "", f = 0, h = !1, y = !1;
  const m = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: _, text: p, tokens: C } of c) {
    if (!C.length) continue;
    const N = z(C[0]);
    if (y) {
      i("warning", _, "Statement after .end is not rendered: " + p);
      continue;
    }
    if (N === ".control") {
      h = !0, i("warning", _, ".control script retained but not executed or rendered.");
      continue;
    }
    if (N === ".endc") {
      h = !1;
      continue;
    }
    if (h) continue;
    if (N === ".subckt") {
      f++, i("error", _, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (N === ".ends") {
      f ? f-- : i("error", _, "Unmatched .ends.");
      continue;
    }
    if (f) continue;
    if (N === ".end") {
      y = !0;
      continue;
    }
    if (N.startsWith(".")) {
      o.push({ line: _, text: p }), N === ".title" ? E = C.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(N) ? i("error", _, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(N) ? i("error", _, "Topology-changing directive is unsupported: " + p) : w.has(N) || i("warning", _, "Directive retained but not resolved: " + p);
      continue;
    }
    const O = C[0][0].toUpperCase();
    if (!st.has(O)) {
      _ === 1 && !/\d/.test(C[0]) && C.length > 1 && O !== "X" ? (E = p, i("warning", _, "First line treated as a SPICE title; use .title for an unambiguous title.")) : i("warning", _, `Unsupported ${O} device was not rendered: ${p}`);
      continue;
    }
    const s = O === "M" || O === "Q" ? 5 : 4;
    if (_ === 1 && !/\d/.test(C[0]) && (C.length < s || O === "T" && !/\b(?:zo|z0)\s*=/i.test(p))) {
      E = p, i("info", _, "SPICE title: " + p);
      continue;
    }
    try {
      if (m.has(N)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const g = ot(C, u), { pins: v, nodeTokens: x, ...R } = g;
      g.polarityKnown || i("warning", _, `${C[0]}: model polarity unknown; explicit ${v.join("/")} terminals retained.`);
      const A = be();
      v.forEach((V, M) => {
        const D = z(x[M]);
        a[D] || (a[D] = { name: D, displayName: C[M + 1], bit: Object.keys(a).length + 2, terminals: [] }), a[D].terminals.push({ component: C[0], pin: V }), A[V] = D;
      }), r.push({ ...R, name: C[0], terminals: A, line: _, raw: p }), m.add(N);
    } catch (g) {
      i("error", _, `${C[0]}: ${g.message} Statement: ${p}`);
    }
  }
  f && i("error", 0, "Unclosed .subckt definition."), h && i("error", 0, "Unclosed .control block."), r.length || i("error", 0, "No supported components to render."), r.length > 300 && i("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const _ of r) {
    for (const p of _.controlSources || []) !p.includes(":") && !r.some((C) => z(C.name) === z(p) && C.kind === "V") && i("error", _.line, `${_.name}: controlling voltage source ${p} was not found.`);
    for (const p of _.coupledInductors || []) !p.includes(":") && !r.some((C) => z(C.name) === z(p) && C.kind === "L") && i("error", _.line, `${_.name}: coupled inductor ${p} was not found.`);
    (_.kind === "B" || _.type === "spice_b") && i("info", _.line, `${_.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: E, components: r, nodes: a, models: u, directives: o, diagnostics: n };
}
const J = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Re = (t) => J(t).split("/").at(-1);
function ct(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], u = [], a = [];
  let i = 0;
  const c = (d, E) => {
    const f = J(E).split("/").slice(0, -1).concat(J(d)).join("/"), h = [...o].filter(([m]) => J(m) === J(d) || J(m) === f);
    if (h.length === 1) return h[0];
    const y = [...o].filter(([m]) => Re(m) === Re(d));
    if (y.length !== 1) throw Error(y.length ? "Ambiguous library filename: " + d : "Missing library " + d + ". Add this file using Library files.");
    return y[0];
  };
  function l(d, E, f = "", h = []) {
    const y = J(E) + ":" + f.toLowerCase();
    if (h.includes(y)) throw Error("Circular library include: " + [...h, y].join(" → "));
    if (h.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const m = [], w = /^\s*\.endl\b/im.test(d);
    let _ = !f;
    const p = (N, O) => {
      if (i += N.length, i > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      a.push(N), u.push({ file: E, line: O + 1 });
    };
    if (d.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((N, O) => {
      const s = N.trim();
      if (/^\.lib\b/i.test(s) && w) {
        const g = pe(s);
        if (g.length === 2 && !/[.\\/]/.test(g[1])) {
          m.push(g[1].toLowerCase()), g[1].toLowerCase() === f.toLowerCase() && (_ = !0), p("* Library section " + g[1], O);
          return;
        }
      }
      if (/^\.endl\b/i.test(s)) {
        m.pop(), p("* End library section", O);
        return;
      }
      if (f && m.length && !m.includes(f.toLowerCase())) {
        p("* Unselected library section", O);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(s))
        try {
          const g = pe(s);
          if (!g[1]) throw Error("Include requires a filename.");
          const [v, x] = c(g[1], E);
          p("* Included " + v, O), l(x, v, g[2] || "", [...h, y]);
        } catch (g) {
          r.push({ severity: "error", line: O + 1, source: E, message: g.message }), p("* Unresolved include", O);
        }
      else p(N, O);
    }), !_) throw Error("Library section " + f + " not found in " + E);
  }
  try {
    l(t, n);
  } catch (d) {
    r.push({ severity: "error", line: 0, source: n, message: d.message });
  }
  return { source: a.join(`
`), origins: u, diagnostics: r };
}
function lt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((i, c) => {
    const l = i.trim();
    /^\.subckt\b/i.test(l) && (o.push(c + 1), n.set(c + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: i, line: c + 1 }) : e[c] = i, /^\.ends\b/i.test(l) && o.length > 1 && o.pop();
  });
  const u = Se(Array.from({ length: t.split(/\r?\n/).length }, (i, c) => e[c] || "").join(`
`));
  r.push(...u.diagnostics);
  const a = /* @__PURE__ */ new Map();
  for (const [i, c] of n) {
    const l = Se(c.map((d) => d.raw).join(`
`));
    a.set(i, l.layout), r.push(...l.diagnostics.map((d) => ({ ...d, line: c[d.line - 1]?.line || i })));
  }
  return { layout: u.layout, scopes: a, diagnostics: r };
}
function Se(t) {
  const e = [], n = [];
  let o = !1, r = !1, u = 0;
  if (t.split(/\r?\n/).forEach((p, C) => {
    const N = p.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(N)) {
      (r || o) && e.push({ severity: "error", line: C + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(N) || e.push({ severity: "error", line: C + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, u = C + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(N)) {
      o || e.push({ severity: "error", line: C + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (N.startsWith("*") ? n.push(N.slice(1).trim()) : e.push({ severity: "error", line: C + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const a = n.join(" "), i = a.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], l = [], d = [], E = [];
  let f = 0, h = 0, y = 10;
  const m = () => i[f++], w = () => {
    const p = m();
    if (!p || !/^[A-Za-z_@][\w./%:@-]*$/.test(p)) throw Error("Expected layout identifier, got " + p);
    return p;
  };
  function _(p) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const C = p ? w() : "@row" + h++, N = m();
    if (!["row", "column", "classic"].includes(N)) throw Error("Expected row, column or classic.");
    if (m() !== "{") throw Error("Expected { after " + N);
    const O = { id: C, direction: N, members: [] };
    for (c.push(O); f < i.length && i[f] !== "}"; )
      i[f] === "group" ? (m(), O.members.push(_(!0))) : ["row", "column"].includes(i[f]) ? O.members.push(_(!1)) : O.members.push(w());
    if (m() !== "}") throw Error("Unclosed group " + C);
    if (!O.members.length) throw Error("Empty layout group " + C);
    return C;
  }
  try {
    for (; f < i.length; )
      if (i[f] === "group")
        m(), _(!0);
      else if (["row", "column"].includes(i[f])) _(!1);
      else if (i[f] === "face") {
        m();
        const x = w(), R = m();
        if (!["left", "right"].includes(R)) throw Error("Expected face left or right.");
        if (E.some((A) => A.device.toLowerCase() === x.toLowerCase())) throw Error("Duplicate face device.");
        E.push({ device: x, side: R });
      } else if (i[f] === "pair") {
        m();
        const x = m();
        if (!["mirror", "differential", "vbe"].includes(x)) throw Error("Expected pair mirror, differential or vbe.");
        if (m() !== "{") throw Error("Expected { after pair kind.");
        const R = [];
        for (; f < i.length && i[f] !== "}"; ) R.push(w());
        if (m() !== "}" || !R.length) throw Error("Empty or unclosed pair.");
        if (d.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        d.push({ kind: x, members: R });
      } else if (i[f] === "priority-cap") {
        if (m(), y = Number(m()), !Number.isInteger(y) || y < 3 || y > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (m() === "place") {
        const x = w(), R = m(), A = w();
        if (!["left-of", "above"].includes(R)) throw Error("Expected left-of or above.");
        l.push({ a: x, relation: R, b: A });
      } else throw Error("Unknown layout instruction near " + i[f - 1]);
    const p = /* @__PURE__ */ new Set();
    for (const x of c) {
      const R = x.id.toLowerCase();
      if (p.has(R)) throw Error("Duplicate layout group " + x.id);
      p.add(R);
    }
    const C = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set(), O = new Map(c.map((x) => [x.id.toLowerCase(), x])), s = (x) => {
      if (C.has(x)) throw Error("Circular layout group " + x);
      if (!N.has(x)) {
        C.add(x);
        for (const R of O.get(x).members) O.has(R.toLowerCase()) && s(R.toLowerCase());
        C.delete(x), N.add(x);
      }
    };
    for (const x of O.keys()) s(x);
    const g = /* @__PURE__ */ new Map();
    for (const x of l) {
      if (x.a.toLowerCase() === x.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      g.has(x.a.toLowerCase()) || g.set(x.a.toLowerCase(), []), g.get(x.a.toLowerCase()).push(x.b.toLowerCase());
    }
    C.clear(), N.clear();
    const v = (x) => {
      if (C.has(x)) throw Error("Circular place constraints.");
      if (!N.has(x)) {
        C.add(x);
        for (const R of g.get(x) || []) v(R);
        C.delete(x), N.add(x);
      }
    };
    for (const x of g.keys()) v(x);
  } catch (p) {
    e.push({ severity: "error", line: u, message: "Layout description: " + p.message });
  }
  return { layout: { version: 1, priorityCap: y, groups: c, relations: l, pairs: d, faces: E }, diagnostics: e };
}
function dt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const h = new Set(n.groups.map((m) => m.id.toLowerCase())), y = (m) => h.has(m.toLowerCase()) ? m : e.components.find((_) => _.synthetic && _.value.toLowerCase() === m.toLowerCase())?.name || e.focus + "/" + m;
    o = { ...n, groups: n.groups.map((m) => ({ ...m, members: m.members.map(y) })), relations: n.relations.map((m) => ({ ...m, a: y(m.a), b: y(m.b) })), faces: (n.faces || []).map((m) => ({ ...m, device: y(m.device) })), pairs: (n.pairs || []).map((m) => ({ ...m, members: m.members.map(y) })) };
  }
  const r = new Map(o.groups.map((h) => [h.id.toLowerCase(), h])), u = Object.values(t.contexts).flatMap((h) => h.devices.map((y) => y.name)), a = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((h) => h.name)].map((h) => h.toLowerCase()));
  for (const h of r.values()) if (a.has((n ? e.focus + "/" + h.id : h.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + h.id);
  for (const h of r.values()) for (const y of h.members) if (!r.has(y.toLowerCase()) && !a.has(y.toLowerCase())) throw Error("Unknown @layout instance/device: " + y);
  for (const h of o.relations) for (const y of [h.a, h.b]) if (!r.has(y.toLowerCase()) && !a.has(y.toLowerCase())) throw Error("Unknown @layout place target: " + y);
  const i = (o.pairs || []).map((h) => ({ ...h, members: h.members.map((y) => {
    const m = e.components.find((w) => w.name.toLowerCase() === y.toLowerCase());
    if (!m || m.synthetic || m.block) throw Error("Unknown or non-visible @layout pair device: " + y);
    return m.name;
  }) })), c = (o.faces || []).map((h) => {
    const y = e.components.find((m) => m.name.toLowerCase() === h.device.toLowerCase());
    if (!y || !["Q", "M", "J", "Z"].includes(y.kind)) throw Error("Unknown or unsupported @layout face device: " + h.device);
    return { ...h, device: y.name };
  }), l = /* @__PURE__ */ new Map(), d = [], E = new Set(Object.keys(t.contexts).map((h) => h.toLowerCase()));
  for (const h of o.groups) {
    const y = [];
    for (const m of h.members) {
      if (r.has(m.toLowerCase())) {
        y.push({ group: m });
        continue;
      }
      for (const w of e.components) if (w.name.toLowerCase() === m.toLowerCase() || w.name.toLowerCase().startsWith(m.toLowerCase() + "/")) {
        if (l.has(w.name)) throw Error("Overlapping @layout membership: " + w.name);
        l.set(w.name, h.id), y.push({ cell: w.name, ...E.has(m.toLowerCase()) ? { instance: m } : {} });
      }
    }
    d.push({ id: h.id, direction: h.direction, members: y });
  }
  const f = /* @__PURE__ */ new Set();
  for (const h of d) for (const y of h.members) if (y.group) {
    const m = y.group.toLowerCase();
    if (f.has(m)) throw Error("Layout group has multiple parents: " + y.group);
    f.add(m);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: d, relations: o.relations, pairs: i, faces: c };
}
const ie = () => /* @__PURE__ */ Object.create(null), W = (t) => t.toLowerCase();
function Qe(t) {
  const e = ie();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const u = W(r[1]);
    let a = r[2];
    if (a === void 0) {
      const i = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!i) throw Error("Expected = after parameter " + u);
      a = i[1];
    }
    if (a || (a = t[++n]), !a || /^params?:$/i.test(a)) throw Error("Missing value for parameter " + u);
    if (Object.hasOwn(e, u)) throw Error("Duplicate parameter: " + u);
    e[u] = a;
  }
  return e;
}
function Le(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ie()] : [t.slice(0, e), Qe(t.slice(e))];
}
function ut(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = ct(t, e);
  t = n.source;
  const o = lt(t), r = [...n.diagnostics, ...o.diagnostics], u = ie(), a = /* @__PURE__ */ new Set(["0"]), i = (p, C, N) => r.push({ severity: p, line: C, message: N }), c = (p, C, N, O = [], s = ie(), g = 0) => {
    const v = { id: p, name: C, parent: N, ports: O, defaults: s, parameters: ie(), definitions: ie(), devices: [], instances: [], directives: [], line: g, statements: [], layoutDescription: o.scopes.get(g) || null };
    return u[p] = v, v;
  }, l = c("root", "Top", null), d = [l], E = [];
  let f = !1, h = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((p, C) => {
    const N = p.trim();
    !N || N.startsWith("*") || (N.startsWith("+") ? E.length ? E.at(-1).text += " " + N.slice(1).trim() : i("error", C + 1, "Continuation has no preceding statement.") : E.push({ text: N, line: C + 1 }));
  });
  for (const { text: p, line: C } of E)
    try {
      const N = pe(p);
      if (!N.length) continue;
      const O = W(N[0]), s = d.at(-1);
      if (h) {
        i("warning", C, "Statement after .end is not rendered: " + p);
        continue;
      }
      if (O === ".control") {
        f = !0, i("warning", C, ".control script retained but not executed or rendered.");
        continue;
      }
      if (O === ".endc") {
        f = !1;
        continue;
      }
      if (f) continue;
      if (O === ".subckt") {
        if (N.length < 2) throw Error(".SUBCKT requires a name.");
        const [g, v] = Le(N.slice(2)), x = W(N[1]);
        if (Object.hasOwn(s.definitions, x)) throw Error("Duplicate subcircuit definition: " + N[1]);
        const R = g.map(W);
        if (new Set(R).size !== g.length || R.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (g.some((V) => /[{}()=]/.test(V))) throw Error("Invalid formal port.");
        if (d.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const A = s.id + "/" + encodeURIComponent(x);
        s.definitions[x] = A, d.push(c(A, N[1], s.id, g, v, C));
        continue;
      }
      if (O === ".ends") {
        if (d.length === 1) throw Error("Unmatched .ENDS.");
        if (N[1] && W(N[1]) !== W(s.name)) throw Error(".ENDS name does not match " + s.name);
        d.pop();
        continue;
      }
      if (O === ".end") {
        if (d.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        h = !0;
        continue;
      }
      if (O === ".param") {
        const g = Qe(N.slice(1));
        for (const [v, x] of Object.entries(g)) {
          if (Object.hasOwn(s.parameters, v)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + v);
          s.parameters[v] = x;
        }
      }
      if (O === ".global") {
        if (N.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const g of N.slice(1)) a.add(W(g));
      }
      if (O.startsWith(".") && s.directives.push({ line: C, text: p }), O.startsWith("x")) {
        const [g, v] = Le(N.slice(1));
        if (!g.length) throw Error("X instance requires a subcircuit name.");
        const x = /;§pnba\s+(.+)$/i.exec(p)?.[1].split(")");
        s.instances.push({ name: N[0], nodes: g.slice(0, -1).map(W), definitionName: g.at(-1), definitionId: null, parameters: v, line: C, raw: p, pinNames: x });
      } else s.statements.push({ line: C, text: p });
    } catch (N) {
      i("error", C, N.message + " Statement: " + p);
    }
  d.length > 1 && i("error", d.at(-1).line, "Unclosed .SUBCKT " + d.at(-1).name), f && i("error", 0, "Unclosed .control block.");
  function y(p, C) {
    for (; p; ) {
      if (Object.hasOwn(p.definitions, W(C))) return p.definitions[W(C)];
      p = u[p.parent];
    }
    return null;
  }
  for (const p of Object.values(u)) {
    const C = [...p.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...p.statements], N = at(C.map((s) => s.text).join(`
`), { models: u[p.parent]?.models });
    p.devices = N.components.map((s) => ({ ...s, line: C[s.line - 1]?.line || p.line })), p.models = N.models, p === l && (l.title = N.title), r.push(...N.diagnostics.filter((s) => !s.message.includes("No supported components to render.") && !s.message.includes("300 components")).map((s) => ({ ...s, line: C[s.line - 1]?.line || p.line })));
    const O = new Set(p.devices.map((s) => W(s.name)));
    for (const s of p.instances)
      if (O.has(W(s.name)) && i("error", s.line, "Duplicate instance/device name: " + s.name), O.add(W(s.name)), s.definitionId = y(p, s.definitionName), !s.definitionId && !/^\{[\s\S]*\}$/.test(s.definitionName)) i("error", s.line, "Undefined subcircuit: " + s.definitionName + " in " + s.name);
      else if (s.definitionId) {
        const g = u[s.definitionId];
        g.ports.length !== s.nodes.length && i("error", s.line, `${s.name}: ${g.name} expects ${g.ports.length} ports; got ${s.nodes.length}.`);
      }
  }
  for (const p of Object.values(u)) delete p.statements;
  const m = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Set();
  function _(p, C = []) {
    if (m.has(p)) {
      i("error", u[p].line, "Circular subcircuit reference: " + [...C, u[p].name].join(" → "));
      return;
    }
    if (!w.has(p)) {
      if (m.add(p), C.length >= 64) {
        i("error", u[p].line, "Subcircuit dependency nesting exceeds 64 levels."), m.delete(p), w.add(p);
        return;
      }
      for (const N of u[p].instances) N.definitionId && _(N.definitionId, [...C, u[p].name]);
      m.delete(p), w.add(p);
    }
  }
  for (const p of Object.keys(u)) _(p);
  !l.devices.length && !l.instances.length && i("error", 0, "No supported components or instances to render.");
  for (const p of r) !p.source && p.line && n.origins[p.line - 1] && (p.source = n.origins[p.line - 1].file, p.line = n.origins[p.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: l.title || "", scopes: u, globals: [...a], diagnostics: r, layoutDescription: o.layout };
}
const j = () => /* @__PURE__ */ Object.create(null), oe = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), Ee = (t, e) => oe(t.map((n) => n.toLowerCase()), e.toLowerCase());
function ft(t, e = []) {
  const n = j(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [u, a] of Object.entries(r.terminals)) o(a).terminals.push({ component: r.name, pin: u });
  for (const r of e) o(r);
  return n;
}
function pt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const ke = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, ht = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function he(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (a) => (r.push(a), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (a, i, c) => {
    const l = c.split(",").map((E) => E.trim());
    if (l.some((E) => !E || /[\s{}+*()]/.test(E))) throw Error("Unsupported dynamic voltage/current reference: " + a);
    const d = i.toUpperCase() + "(" + l.map((E) => i.toLowerCase() === "v" ? n(E) : o(E, i)).join(",") + ")";
    return r.push(d), "@@" + (r.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(ht, (a, i, c) => {
    if (c.slice(i + a.length).trimStart().startsWith("(")) return a;
    const l = e(a.toLowerCase());
    if (l === void 0) return a;
    if (u += l.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + l + ")";
  }), t.replace(/@@(\d+)@@/g, (a, i) => r[Number(i)]);
}
function mt(t, e, n, o) {
  const r = { ...e, ...n }, u = j(), a = /* @__PURE__ */ new Set(), i = j();
  for (const [l, d] of Object.entries(o)) i[l] = he(ke(d), (E) => t[E]);
  function c(l) {
    if (Object.hasOwn(i, l)) return i[l];
    if (Object.hasOwn(u, l)) return u[l];
    if (!Object.hasOwn(r, l)) return t[l];
    if (a.has(l)) {
      if (Object.hasOwn(t, l)) return t[l];
      throw Error("Circular parameter dependency: " + [...a, l].join(" → "));
    }
    return a.add(l), u[l] = he(ke(r[l]), c), a.delete(l), u[l];
  }
  for (const l of Object.keys(r)) c(l);
  return Object.assign(j(), t, u, i);
}
function Pe(t, e, n, o) {
  let r = "";
  for (let c = 0; c < t.length; ) {
    const l = t[c];
    if (l !== "{" && l !== "'") {
      r += l, c++;
      continue;
    }
    const d = c++;
    let E = 1, f = "";
    for (; c < t.length && E; c++) {
      if (l === "'") {
        t[c] === "'" && (E = 0);
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
      t[c] === "{" && E++, t[c] === "}" && E--;
    }
    if (E) throw Error("Unclosed parameter expression.");
    r += l + he(t.slice(d + 1, c - 1), (h) => e[h], n, o) + (l === "{" ? "}" : "'");
  }
  const u = [];
  let a = 0, i = "";
  for (let c = 0; c < r.length; c++) {
    const l = r[c];
    if (i) {
      l === i && r[c - 1] !== "\\" && (i = "");
      continue;
    }
    if (l === '"' || l === "'") {
      i = l;
      continue;
    }
    if ("({".includes(l) && a++, ")}".includes(l) && a--, !a && (c === 0 || /\s/.test(r[c - 1]))) {
      const d = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(c));
      d && (u.push({ start: c, end: c + d[0].length, key: d[1].toLowerCase() }), c += d[0].length - 1);
    }
  }
  if (u.length) {
    let c = r.slice(0, u[0].start);
    u.forEach((l, d) => {
      const E = u[d + 1]?.start ?? r.length, f = r.slice(l.end, E);
      c += r.slice(l.start, l.end) + (f.includes("{") || ["refnode", "intnode"].includes(l.key) ? f : he(f, (h) => e[h], n, o));
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
  add(e, n, o) {
    if (typeof arguments[0] != "string")
      for (let r in arguments[0])
        this.add(r, arguments[0][r], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(r) {
        this[r] = this[r] || [], n && this[r][o ? "unshift" : "push"](n);
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
    this[e] = this[e] || [], this[e].forEach(function(o) {
      o.call(n && n.context ? n.context : n, n);
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
  static addBinaryOp(e, n, o) {
    return b.max_binop_len = Math.max(e.length, b.max_binop_len), b.binary_ops[e] = n, o ? b.right_associative.add(e) : b.right_associative.delete(e), b;
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
      const o = { context: this, node: n };
      return b.hooks.run(e, o), o.node;
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
      return b.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
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
    let n = [], o, r;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === b.SEMCOL_CODE || o === b.COMMA_CODE)
        this.index++;
      else if (r = this.gobbleExpression())
        n.push(r);
      else if (this.index < this.expr.length) {
        if (o === e)
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
    let e, n, o, r, u, a, i, c, l;
    if (a = this.gobbleToken(), !a || (n = this.gobbleBinaryOp(), !n))
      return a;
    for (u = { value: n, prec: b.binaryPrecedence(n), right_a: b.right_associative.has(n) }, i = this.gobbleToken(), i || this.throwError("Expected expression after " + n), r = [a, u, i]; n = this.gobbleBinaryOp(); ) {
      if (o = b.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: o, right_a: b.right_associative.has(n) }, l = n;
      const d = (E) => u.right_a && E.right_a ? o > E.prec : o <= E.prec;
      for (; r.length > 2 && d(r[r.length - 2]); )
        i = r.pop(), n = r.pop().value, a = r.pop(), e = {
          type: b.BINARY_EXP,
          operator: n,
          left: a,
          right: i
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + l), r.push(u, e);
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
    let e, n, o, r;
    if (this.gobbleSpaces(), r = this.searchHook("gobble-token"), r)
      return this.runHook("after-token", r);
    if (e = this.code, b.isDecimalDigit(e) || e === b.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === b.SQUOTE_CODE || e === b.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === b.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, b.max_unop_len), o = n.length; o > 0; ) {
        if (b.unary_ops.hasOwnProperty(n) && (!b.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !b.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: b.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
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
      let o;
      if (n === b.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== b.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
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
      } : (n === b.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: b.MEMBER_EXP,
        computed: !1,
        object: e,
        property: this.gobbleIdentifier()
      }), o && (e.optional = !0), this.gobbleSpaces(), n = this.code;
    }
    return e;
  }
  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    let e = "", n, o;
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
    return o = this.code, b.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === b.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === b.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const n = this.index, o = this.expr.charAt(this.index++);
    let r = !1;
    for (; this.index < this.expr.length; ) {
      let u = this.expr.charAt(this.index++);
      if (u === o) {
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
    let o = !1, r = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let u = this.code;
      if (u === e) {
        o = !0, this.index++, e === b.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
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
    return o || this.throwError("Expected " + String.fromCharCode(e)), n;
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
const se = (t) => new b(t).parse(), wt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(b).filter((t) => !wt.includes(t) && se[t] === void 0).forEach((t) => {
  se[t] = b[t];
});
se.Jsep = b;
const _t = "ConditionalExpression";
var yt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: _t,
            test: o,
            consequent: r,
            alternate: u
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let a = o;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = o;
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
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: Nt,
            test: o,
            consequent: r,
            alternate: u
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let a = o;
            for (; a.right.operator && t.binary_ops[a.right.operator] <= 0.9; )
              a = a.right;
            n.node.test = a.right, a.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(Ct);
const It = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Ae = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, F = (t) => Number(t) > 0.5;
function le(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(i) {
    return i = String(i).trim(), /^\{[\s\S]*\}$/.test(i) && (i = i.slice(1, -1)), i = i.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, l, d, E] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), f = d.toLowerCase(), h = f.startsWith("meg") ? 1e6 : f.startsWith("mil") ? 254e-7 : It[f[0]] || 1;
      return "(" + (E ? +(l + (l.includes(".") ? "" : ".") + E) : Number(l)) * h + ")";
    }), u(se(i));
  }
  function u(i) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (i.type === "Literal") return i.value;
    if (i.type === "Identifier") {
      const c = i.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + i.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const l = r(e[c]);
      return n.delete(c), l;
    }
    if (i.type === "ConditionalExpression") return F(u(i.test)) ? u(i.consequent) : u(i.alternate);
    if (i.type === "UnaryExpression") {
      const c = u(i.argument);
      if (i.operator === "-") return -c;
      if (i.operator === "+") return +c;
      if (i.operator === "!" || i.operator === "~") return !F(c);
    }
    if (i.type === "BinaryExpression") {
      const c = u(i.left);
      if (i.operator === "&&") return F(c) && F(u(i.right));
      if (i.operator === "||") return F(c) || F(u(i.right));
      const l = u(i.right);
      switch (i.operator) {
        case "+":
          return c + l;
        case "-":
          return c - l;
        case "*":
          return c * l;
        case "/":
          return c / l;
        case "**":
          return c ** l;
        case "%":
          return c % l;
        case "^":
          return F(c) !== F(l);
        case "&":
          return F(c) && F(l);
        case "|":
          return F(c) || F(l);
        case ">":
          return c > l;
        case "<":
          return c < l;
        case ">=":
          return c >= l;
        case "<=":
          return c <= l;
        case "==":
        case "===":
          return c === l;
        case "!=":
        case "!==":
          return c !== l;
      }
    }
    if (i.type === "CallExpression" && i.callee.type === "Identifier") {
      const c = i.callee.name.toLowerCase();
      if (c === "if") {
        if (i.arguments.length !== 3) throw Error("if() needs three arguments.");
        return F(u(i.arguments[0])) ? u(i.arguments[1]) : u(i.arguments[2]);
      }
      if (Object.hasOwn(Ae, c)) return Ae[c](...i.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const a = r(t);
  if (typeof a == "number" && !Number.isFinite(a)) throw Error("Structural expression is not finite.");
  return a;
}
function vt(t) {
  pt(t);
  const e = j(), n = /* @__PURE__ */ new Map();
  let o = 0, r = 0;
  function u(a, i, c, l, d, E, f) {
    if (i.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const h = t.scopes[a], y = i.length ? oe(i.slice(0, -1), i.at(-1)) : "", m = j();
    if (f.some((O) => O.scopeId === a)) throw Error("Circular subcircuit reference at " + y);
    const w = mt(l, h.defaults, h.parameters, d);
    function _(O) {
      if (/^\{[\s\S]*\}$/.test(O)) {
        const g = le(O, w);
        O = String(typeof g == "boolean" ? Number(g) : g);
      }
      /^"[\s\S]*"$/.test(O) && (O = O.slice(1, -1));
      const s = O.toLowerCase();
      return Object.hasOwn(c, s) ? c[s] : t.globals.includes(s) ? Ee([], s) : m[s] || (m[s] = Ee(i, s));
    }
    const p = { id: y, path: i, scopeId: a, name: E?.name || "Top", definition: h.name, ports: h.ports.map((O) => ({ name: O, node: _(O) })), params: w, nodes: m, models: j(), devices: [], children: [], raw: E?.raw || "", line: E?.line || 0 };
    e[y] = p, n.set(y, _);
    const C = [...f, p];
    function N(O) {
      if (!O) return "";
      let s = h;
      for (; s; ) {
        if (s.directives.some((g) => new RegExp("^\\.model\\s+" + O.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(g.text))) {
          const g = [...C].reverse().find((v) => v.scopeId === s.id);
          return oe(g?.path || [], O.toLowerCase());
        }
        s = t.scopes[s.parent];
      }
      return O;
    }
    for (const O of h.directives.filter((s) => /^\.model\b/i.test(s.text))) {
      const s = /^\.model\s+(\S+)/i.exec(O.text)?.[1];
      if (!s) continue;
      const g = N(s), v = h.models[s.toLowerCase()], x = Pe(O.text, w, _, (R) => oe(i, R));
      p.models[g] = { ...v, name: g, raw: x.replace(/^(\.model\s+)\S+/i, (R, A) => A + g), instanceId: y, parameters: w };
    }
    for (const O of h.devices) {
      if (++r > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const s = j();
      for (const [v, x] of Object.entries(O.terminals)) s[v] = _(x);
      const g = N(O.model);
      p.devices.push({ ...O, name: oe(i, O.name), localName: O.name, instanceId: y, terminals: s, model: g, parameters: w });
    }
    for (const O of h.instances) {
      let s = O.definitionId;
      if (!s) {
        const R = String(le(O.definitionName, w)).toLowerCase();
        let A = h;
        for (; A && !s; )
          s = A.definitions[R], A = t.scopes[A.parent];
        if (!s) throw Error("Undefined selected subcircuit: " + R);
      }
      const g = t.scopes[s], v = j();
      if (g.ports.length !== O.nodes.length) throw Error(O.name + ": expected " + g.ports.length + " ports; got " + O.nodes.length);
      g.ports.forEach((R, A) => {
        v[R.toLowerCase()] = _(O.nodes[A]);
      });
      const x = u(s, [...i, O.name], v, w, O.parameters, O, C);
      O.pinNames?.length === x.ports.length && x.ports.forEach((R, A) => {
        R.label = O.pinNames[A];
      }), p.children.push(x);
    }
    return p;
  }
  try {
    let d = function(E, f) {
      const h = f.split(":");
      if (h.length === 1) return { owner: E, name: f };
      const y = h.pop();
      for (const m of [[...E.path, ...h], h]) {
        const w = i.get(m.map(encodeURIComponent).join("/").toLowerCase());
        if (w) return { owner: w, name: y };
      }
      throw Error("Unknown hierarchical reference: " + f);
    };
    const a = u(t.rootId, [], j(), j(), j(), null, []), i = new Map(Object.values(e).map((E) => [E.id.toLowerCase(), E])), c = Object.assign(j(), ...Object.values(e).map((E) => E.models)), l = (E) => c[E] || Object.entries(c).find(([f]) => f.startsWith(E + "."))?.[1];
    for (const E of Object.values(e)) for (const f of E.devices) {
      const h = t.scopes[E.scopeId].devices.find((w) => w.name === f.localName), y = (w) => {
        const _ = d(E, w);
        return n.get(_.owner.id)(_.name);
      }, m = (w, _ = "", p = "") => {
        const C = d(E, w), N = C.owner.devices.find((O) => O.localName.toLowerCase() === C.name.toLowerCase());
        if (_.toLowerCase() === "ix") {
          const O = C.owner.ports.find((s, g) => s.name.toLowerCase() === C.name.toLowerCase() || String(g + 1) === C.name);
          if (O) return C.owner.id + ":" + O.name;
        }
        if (!N) {
          if (p) throw Error(f.name + ": referenced " + p + " device " + w + " was not found.");
          return oe(C.owner.path, C.name);
        }
        if (p && N.kind !== p) throw Error(f.name + ": " + w + " must be a " + p + " device.");
        return N.name;
      };
      if (f.value = Pe(h.value, E.params, y, m), h.model && (f.value = f.value.replace(h.model, f.model)), f.kind === "M" && Object.keys(f.terminals).length === 3) {
        let w = l(f.model), _ = !1;
        const p = /* @__PURE__ */ new Set();
        for (; w?.type === "VDMOS" && !p.has(w.name); ) {
          p.add(w.name);
          const C = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(w.raw);
          if (C) {
            _ = C[1] === void 0 || Number(le(C[1], w.parameters)) >= 0.5;
            break;
          }
          const N = w.name.includes("/") ? w.name.slice(0, w.name.lastIndexOf("/") + 1) : "";
          w = l(N + (w.baseModel || "").toLowerCase()) || l((w.baseModel || "").toLowerCase());
        }
        p.size && (f.type = "spice_" + (_ ? "pmos3" : "nmos3"));
      }
      f.controlSources = (h.controlSources || []).map((w) => m(w, "", "V")), f.controlSource = f.controlSources[0] || "", f.coupledInductors = (h.coupledInductors || []).map((w) => m(w, "", "L"));
      for (const w of /* @__PURE__ */ new Set([...h.controlSources || [], ...h.coupledInductors || []])) {
        const _ = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        f.value = f.value.replace(new RegExp("(?<![\\w./%])" + _ + "(?![\\w.$])", "g"), () => m(w));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: e };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function de(t) {
  return [...t.devices, ...t.children.flatMap(de)];
}
function Te(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function ye(t, e = {}) {
  const n = new Map(t.components.map((s) => [s.name, s])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), u = [], a = (s, g) => JSON.stringify([s, g].sort()), i = (s) => e[s]?.potential !== null && e[s]?.potential !== void 0;
  for (const s of t.components) {
    for (const [M, D] of Object.entries(s.terminals))
      o.has(D) || o.set(D, []), o.get(D).push({ device: s.name, pin: M });
    if (s.kind === "R") {
      const M = Object.values(s.terminals);
      if (M.length === 2 && M[0] !== M[1]) {
        const D = a(...M);
        r.has(D) || r.set(D, []), r.get(D).push(s);
      }
    }
    const g = s.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(s.kind) ? "fet" : null, v = g === "bjt" ? /_(npn|pnp)$/.exec(s.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(s.type)?.[1];
    if (!g || !v) continue;
    const x = s.terminals, R = x[g === "bjt" ? "B" : "G"], A = x[g === "bjt" ? "C" : "D"], V = x[g === "bjt" ? "E" : "S"];
    [R, A, V].some((M) => M === void 0) || R === V || A === V || u.push({ id: s.name, family: g, polarity: v, control: R, drain: A, source: V, body: s.kind === "M" ? x.B : void 0 });
  }
  const c = [], l = /* @__PURE__ */ new Set(), d = (s, g, v, x, R, A = "basic", V = [], M = "high") => {
    const D = [.../* @__PURE__ */ new Set([...g, ...V])], $ = JSON.stringify([s, A, [...D].sort()]);
    l.has($) || (l.add($), c.push({ id: "motif" + c.length, kind: s, variant: A, transistors: g, members: D, roles: v, nets: x, evidence: R, confidence: M }));
  }, E = (s, g) => s.family === g.family && s.polarity === g.polarity, f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), m = new Map(u.map((s) => [s.id, s])), w = (s, g, v) => {
    s.has(g) || s.set(g, []), s.get(g).push(v);
  }, _ = (s, g) => JSON.stringify([s.family, s.polarity, g]);
  for (const s of u)
    w(f, _(s, s.control), s), w(h, _(s, s.source), s), s.family === "bjt" && (o.get(s.source) || []).some((g) => {
      const v = m.get(g.device);
      return v && v.family === "bjt" && !E(s, v) && v.source === s.source;
    }) && w(y, _(s, s.drain), s);
  const p = (s) => [{ node: s.source, resistor: null }, ...(o.get(s.source) || []).flatMap((g) => {
    const v = n.get(g.device);
    if (v.kind !== "R") return [];
    const x = Object.values(v.terminals).find((R) => R !== s.source);
    return x !== void 0 && x !== s.control && x !== s.drain ? [{ node: x, resistor: v.name }] : [];
  })];
  for (const s of u) s.control === s.drain && d("diode-connected", [s.id], { reference: s.id }, { control: s.control, return: s.source }, ["control-drain-short", s.family]);
  for (const s of u) {
    const g = f.get(_(s, s.control));
    if (g.filter((M) => M.control === M.drain).length > 1) continue;
    let v = null;
    if (s.control !== s.drain && s.family === "bjt" && (v = (f.get(_(s, s.drain)) || []).find((M) => M.id !== s.id && E(M, s) && M.control === s.drain && M.source === s.control && i(M.drain))), s.control !== s.drain && !v) continue;
    const x = p(s), R = [];
    let A = null, V = [];
    for (const M of g) {
      if (M.id === s.id || M.id === v?.id || M.drain === s.drain || M.drain === M.control) continue;
      const D = x.flatMap(($) => p(M).filter((ee) => $.node === ee.node).map((ee) => ({ node: $.node, rs: [$.resistor, ee.resistor].filter(Boolean) }))).find(($) => A === null || $.node === A);
      D && (A = D.node, R.push(M.id), V.push(...D.rs));
    }
    if (R.length) {
      const M = R.every((D) => m.get(D).body === s.body);
      d("current-mirror", [s.id, ...R, ...v ? [v.id] : []], { reference: s.id, outputs: R, ...v ? { helper: v.id } : {} }, { control: s.control, return: A }, ["same-polarity", "shared-control", v ? "emitter-follower-reference" : "diode-reference", V.length ? "resistive-common-return" : "shared-return", M ? "compatible-bodies" : "different-body-connections"], v ? "assisted" : V.length ? "degenerated" : "basic", [...V, ...v ? [v.id] : []], M ? "high" : "medium");
    }
  }
  const C = [], N = /* @__PURE__ */ new Set(), O = (s, g) => {
    const v = JSON.stringify([s.id, g.id].sort());
    N.has(v) || (N.add(v), C.push([s, g]));
  };
  for (const s of h.values()) if (!i(s[0].source)) {
    const g = s.filter((v) => v.control !== v.drain);
    g.length === 2 ? O(...g) : g.length > 2 && new Set(g.map((v) => v.control)).size > 1 && d("differential-pair", g.map((v) => v.id), { inputs: g.map((v) => v.id) }, { tail: g[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const s of y.values()) for (let g = 0; g < s.length; g++) for (let v = g + 1; v < s.length; v++) O(s[g], s[v]);
  for (const [s, g] of C) {
    if (s.control === g.control || s.control === s.drain || g.control === g.drain) continue;
    if (s.source === g.source && s.drain !== g.drain && !i(s.source)) {
      const R = (o.get(s.source) || []).some((V) => V.device !== s.id && V.device !== g.id), A = h.get(_(s, s.source)).length === 2;
      d("differential-pair", [s.id, g.id], { inputs: [s.id, g.id] }, { tail: s.source }, ["same-polarity", "distinct-controls", "shared-tail", R ? "tail-bias-connection" : "unbiased-tail", A ? "two-input-tail" : "multi-input-tail"], "basic", [], R && A && s.body === g.body ? "high" : "medium");
    }
    if (s.family !== "bjt" || s.drain !== g.drain || s.source === g.source) continue;
    const v = u.filter((R) => R.family === "bjt" && R.polarity !== s.polarity && R.source === s.source), x = u.filter((R) => R.family === "bjt" && R.polarity !== s.polarity && R.source === g.source);
    for (const R of v) for (const A of x) R.id !== A.id && R.control === A.control && R.drain !== A.drain && R.control !== R.drain && A.control !== A.drain && d("differential-pair", [s.id, g.id, R.id, A.id], { inputs: [s.id, g.id], commonBase: [R.id, A.id] }, { inputCollectors: s.drain, bias: R.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const s of u) if (s.family === "bjt" && s.control !== s.drain) {
    const g = r.get(a(s.drain, s.control)) || [], v = r.get(a(s.control, s.source)) || [];
    g.length === 1 && v.length === 1 && d("vbe-multiplier", [s.id], { transistor: s.id, collectorResistor: g[0].name, emitterResistor: v[0].name }, { control: s.control, collector: s.drain, emitter: s.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [g[0].name, v[0].name]);
  }
  return c;
}
function Ne(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([u, a]) => [u, o(a)])), nets: Object.fromEntries(Object.entries(r.nets).map(([u, a]) => [u, n(a)])) }));
}
function Ot(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), u = new Map(t.components.map((a) => [a.name, a]));
  for (const a of n) {
    if (new Set(a.members).size !== a.members.length) throw Error("Duplicate @layout pair member.");
    const i = a.members.map((f) => u.get(f));
    if (i.some((f) => !f)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier" }[a.kind], l = a.kind === "differential" && i.length === 2 ? t.components.filter((f) => !a.members.includes(f.name) && Object.values(f.terminals).includes(i[0].terminals.E ?? i[0].terminals.S)) : [], d = ye({ ...t, components: [...i, ...l] }, e), E = d.find((f) => f.kind === c && f.confidence === "high" && a.members.every((h) => f.members.includes(h)));
    if (!E) throw Error("Invalid @layout pair " + a.kind + " { " + a.members.join(" ") + " }: electrical structure does not match.");
    for (const f of d.filter((h) => h === E || h.kind === "diode-connected" && h.members.every((y) => E.members.includes(y)))) {
      const h = JSON.stringify([f.kind, [...f.members].sort()]);
      r.has(h) || (r.add(h), o.push({ ...f, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function xt(t, e, n = ye(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((f) => f.kind === "R"), u = t.components.filter((f) => f.kind === "Q"), a = new Map(t.components.map((f) => [f.name, f])), i = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = (f) => Object.values(f.terminals), d = (f, h, y) => {
    f && o.set(f.name, { reverse: l(f)[0] !== h, reason: y });
  };
  for (const f of u) {
    const { C: h, B: y, E: m } = f.terminals, w = f.type.endsWith("pnp"), _ = f.type.endsWith("npn");
    !w && !_ || (i.has(m) || i.set(m, []), i.get(m).push(f), h === y && e[m]?.potential !== null && e[m]?.potential !== void 0 && c.set(h, { potential: e[m].potential }));
  }
  for (const f of n) if (f.kind === "vbe-multiplier" && f.confidence === "high") {
    const h = a.get(f.roles.transistor), y = h.type.endsWith("pnp"), m = a.get(y ? f.roles.emitterResistor : f.roles.collectorResistor), w = a.get(y ? f.roles.collectorResistor : f.roles.emitterResistor);
    d(m, h.terminals[y ? "E" : "C"], "recognized VBE multiplier"), d(w, h.terminals.B, "recognized VBE multiplier");
  }
  for (const f of r) {
    const [h, y] = l(f), m = c.get(h), w = c.get(y);
    m && w && m.potential !== w.potential && d(f, m.potential > w.potential ? h : y, "diode-connected bias reference");
  }
  const E = /* @__PURE__ */ new Map();
  for (const f of r) {
    const h = l(f);
    if (!h.some((y) => e[y]?.potential !== null && e[y]?.potential !== void 0))
      for (const y of h)
        E.has(y) || E.set(y, []), E.get(y).push(f);
  }
  for (const [f, h] of E)
    if (!(h.length > 12))
      for (const y of h) for (const m of h) {
        if (y === m) continue;
        const w = l(y).find((N) => N !== f), _ = l(m).find((N) => N !== f), p = i.get(w)?.find((N) => N.type.endsWith("npn")), C = i.get(_)?.find((N) => N.type.endsWith("pnp"));
        p && C && (d(y, w, "complementary emitter output"), d(m, f, "complementary emitter output"));
      }
  return o;
}
function Rt(t) {
  const e = t.components.filter((u) => u.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((u) => u.kind === "R").map((u) => Object.values(u.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const u of e) {
    const a = u.terminals.E;
    n.has(a) || n.set(a, []), n.get(a).push(u);
  }
  for (const u of e) {
    const { B: a, C: i, E: c } = u.terminals;
    if (a === c || !o.has([a, c].sort().join("|"))) continue;
    const l = n.get(a) || [];
    if (!(l.length > 16))
      for (const d of l) {
        if (d === u) continue;
        if (d.terminals.B === i) {
          r.add(u.name);
          break;
        }
        const E = n.get(d.terminals.B) || [];
        if (E.length <= 16 && E.some((f) => f !== u && f !== d && f.terminals.B === i)) {
          r.add(u.name);
          break;
        }
      }
  }
  return r;
}
const we = 13;
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
const ue = (t) => ["pwr", "ret", "bias"].includes(t), St = (t) => String(t).split("/").at(-1).toLowerCase(), De = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[St(t)] || "unknown", Lt = (t) => {
  const e = _e(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || De(t);
};
function kt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (a, i, c) => {
    e.has(a) || e.set(a, []), e.get(a).push({ node: i, delta: c });
  };
  for (const a of t)
    if (a.kind === "V")
      try {
        let i = a.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(i);
        if (c && Number(le(c[1], a.parameters)) !== 0 || (i = i.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(i))) continue;
        const l = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(i);
        if (!l) continue;
        const d = le(l[1], a.parameters);
        if (typeof d != "number" || !Number.isFinite(d)) continue;
        o(a.terminals["-"], a.terminals["+"], d), o(a.terminals["+"], a.terminals["-"], -d);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  for (const a of ["0", ...e.keys()]) {
    if (u.has(a)) continue;
    const i = /* @__PURE__ */ new Map([[a, 0]]), c = [a];
    u.add(a);
    let l = !1;
    for (let d = 0; d < c.length; d++) for (const E of e.get(c[d]) || []) {
      const f = i.get(c[d]) + E.delta;
      i.has(E.node) ? Math.abs(i.get(E.node) - f) > 1e-8 * Math.max(1, Math.abs(f)) && (l = !0) : (i.set(E.node, f), u.add(E.node), c.push(E.node));
    }
    l && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [d, E] of i) r[d] = { value: E, reference: a, known: a === "0" && !l, consistent: !l };
  }
  return { nodes: r, diagnostics: n };
}
function Pt(t, e, n = null) {
  const o = kt(de(t.root)), r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
  for (const d of Object.values(e.nodes)) {
    const E = _e(d.name), f = De(d.name);
    r[d.name] = { role: E !== "unknown" ? E : f, roleSource: E !== "unknown" ? "node-name" : f !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[d.name]?.known ? o.nodes[d.name].value : null };
  }
  const a = n?.pairs?.length ? Ot(e, r, n.pairs) : ye(e, r), i = xt(e, r, a), c = Rt(e), l = (d, E, f) => {
    const h = { role: r[f].role, roleSource: r[f].roleSource }, y = d.block?.ports.find((_) => _.pin === E);
    if (y?.implicit || !d.block && !d.synthetic) return h;
    const m = d.synthetic ? d.value : y?.name || y?.label, w = Lt(m);
    return w !== "unknown" ? { role: w, roleSource: _e(m) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ue(h.role) ? { ...h, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const d of e.components) {
    const E = Object.fromEntries(Object.entries(d.terminals).map(([v, x]) => [v, { ...r[x], ...l(d, v, x) }])), f = Object.values(E), h = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(d.type), y = h && !i.has(d.name) && f.length === 2 && f.every((v) => !ue(v.role) && (v.potential === null || v.role !== "unknown")), m = d.terminals["+"], w = d.terminals["-"], _ = [m, w].filter((v) => v && v !== "0"), p = d.kind === "V" && _.some((v) => ue(r[v]?.role)) && !_.some((v) => ["in", "out", "io", "fb"].includes(r[v]?.role)) && [m, w].every((v) => o.nodes[v]?.known), C = m === "0" ? w : m, N = Object.keys(d.terminals), O = (v) => ue(v.role) ? v.potential !== null ? v.potential > 0 ? "high" : "low" : v.role === "ret" ? "low" : "high" : "signal";
    let s = !1;
    N.length === 2 && (d.kind === "V" && f.every((v) => v.potential !== null) ? s = f[0].potential < f[1].potential : d.terminals[N[0]] === "0" ? s = !0 : d.terminals[N[1]] === "0" ? s = !1 : f.every((v) => v.potential !== null) ? s = f[0].potential < f[1].potential : s = O(f[0]) === "low" || O(f[1]) === "high" && O(f[0]) === "signal"), i.has(d.name) && (s = i.get(d.name).reverse);
    const g = d.synthetic ? "" : d.name.startsWith(e.focus + "/") ? d.name.slice(e.focus.length + 1) : d.name;
    u[d.name] = { version: we, kind: d.kind, polarity: d.type.endsWith("pnp") ? "p" : d.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(d.name), orientationReason: i.get(d.name)?.reason || null, owner: g.includes("/") ? g.slice(0, g.lastIndexOf("/")) : "", passive: h, source: ["V", "I", "E", "F", "G", "H"].includes(d.kind) || d.kind === "B" && !h, ports: E, horizontal: y, orientation: y ? "horizontal" : s ? "vertical-reversed" : "vertical", flexible: N.length === 2 && (h || ["V", "I", "B", "F", "H"].includes(d.kind)), supply: !!p, voltage: p ? o.nodes[C].value : null };
  }
  return { version: we, nodes: r, cells: u, motifs: a, diagnostics: o.diagnostics };
}
function Ve(t, e) {
  const n = e.ports.map((r, u) => ({ pin: "P" + u, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(de(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const u = Ee([], r);
    o.has(u) && !n.some((a) => a.node === u) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: u, implicit: !0 });
  }
  return n;
}
function At(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t.contexts[o];
  if (!r) throw Error("Unknown instance: " + o);
  const u = [], a = [];
  function i(E) {
    a.push(...Object.values(E.nodes), ...E.ports.map((h) => h.node));
    const f = [...E.devices.map((h) => ({ line: h.line, device: h })), ...E.children.map((h) => ({ line: h.line, child: h }))].sort((h, y) => h.line - y.line);
    for (const h of f) {
      if (h.device) {
        const _ = h.device;
        u.push({ ..._, layoutLabel: [...E.path.slice(r.path.length), _.localName].join("/") });
        continue;
      }
      const y = h.child;
      if (e === "flat" || n.has(y.id)) {
        i(y);
        continue;
      }
      const m = Ve(t, y), w = j();
      m.forEach((_) => {
        w[_.pin] = _.node;
      }), u.push({ name: y.id, kind: "X", type: "spice_subckt", terminals: w, value: y.definition, raw: y.raw, line: y.line, instanceId: y.id, layoutLabel: y.path.slice(r.path.length).join("/"), block: { definitionId: y.scopeId, ports: m, parameters: y.params } });
    }
  }
  i(r);
  for (const [E, f] of r.ports.entries()) u.push({ name: "@port/" + o + "/" + E, kind: "PORT", type: "spice_port", terminals: { A: f.node }, layoutLabel: f.name, value: f.name, raw: "Interface port " + f.name, synthetic: !0 });
  if (u.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(j(), ...Object.values(t.contexts).map((E) => E.models)), l = { title: o || t.ir.title, components: u, nodes: ft(u, a), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: o };
  l.topology = Tt(t, l);
  const d = dt(t, l);
  return l.layout = Pt(t, l, d), l.layout.description = d, l;
}
function Tt(t, e) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const i = t.contexts[a.instanceId];
        if (!i) throw Error("Projection contains an unknown block.");
        const c = Ve(t, i);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(c.map((l) => [l.pin, l.node]))) throw Error("Block interface topology mismatch: " + a.name);
        n.push(...de(i));
      } else n.push(a);
  for (const a of n) {
    if (o.has(a.name)) throw Error("Projection duplicates " + a.name);
    o.add(a.name);
  }
  const r = Te(n), u = de(t.contexts[e.focus]);
  if (r !== Te(u)) throw Error("Projection lost or changed electrical devices/connections.");
  return { verified: !0, leafCount: n.length, signature: r };
}
function Ut(t) {
  const e = j(), n = j();
  for (const o of t.components) {
    const r = j(), u = j();
    for (const [a, i] of Object.entries(o.terminals))
      r[a] = [t.nodes[i].bit], u[a] = "input";
    e[o.name] = { type: o.type, port_directions: u, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((a) => ({ pin: a.pin, label: a.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((a, i) => ({ pin: a, label: o.pinLabels?.[i] || a })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ne(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Mt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (l) => (n.has(l) || n.set(l, n.size + 2), n.get(l));
  Object.entries(t.modules.circuit.cells).forEach(([l, d], E) => {
    const f = "c" + E;
    e.set(f, l);
    const h = Object.fromEntries(Object.entries(d.connections).map(([y, m]) => [y, m.map(r)]));
    o[f] = { type: d.type, connections: h, port_directions: d.port_directions, attributes: { displayRef: d.attributes.displayRef || d.attributes.ref || "", value: d.attributes.value || "", name: d.attributes.name || "" } }, d.spiceBlock && (o[f].spiceBlock = d.spiceBlock), d.spiceSymbol && (o[f].spiceSymbol = d.spiceSymbol), d.spiceLayout && (o[f].spiceLayout = d.spiceLayout);
  });
  const u = new Map([...e].map(([l, d]) => [d, l])), a = t.modules.circuit.spiceLayoutDescription, i = a ? { ...a, faces: (a.faces || []).map((l) => ({ ...l, device: u.get(l.device) })), pairs: (a.pairs || []).map((l) => ({ ...l, members: l.members.map((d) => u.get(d)) })), groups: a.groups.map((l) => ({ ...l, members: l.members.map((d) => d.cell ? { ...d, cell: u.get(d.cell) } : d) })), relations: a.relations.map((l) => ({ ...l, a: u.get(l.a) || l.a, b: u.get(l.b) || l.b })) } : null, c = Ne(t.modules.circuit.spiceMotifs || [], (l) => u.get(l), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: c, spiceLayoutDescription: i } } }, ids: e, bits: new Map([...n].map(([l, d]) => [d, l])) };
}
const Z = /* @__PURE__ */ new Map();
async function Qt(t, e) {
  const n = Mt(t), o = JSON.stringify([n.netlist, e]);
  let r = Z.get(o);
  r ? (Z.delete(o), Z.set(o, r)) : (r = await Dt(n.netlist, e), r.svg.length < 1e6 && (Z.set(o, r), Z.size > 20 && Z.delete(Z.keys().next().value)));
  const u = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of u.querySelectorAll("[id],[class]")) {
    const l = c.getAttribute("id");
    l?.startsWith("cell_") && n.ids.has(l.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(l.slice(5)));
    const d = c.getAttribute("class");
    d && c.setAttribute("class", d.split(/\s+/).map((E) => E.startsWith("cell_") && n.ids.has(E.slice(5)) ? "cell_" + n.ids.get(E.slice(5)) : /^net_\d+$/.test(E) && n.bits.has(Number(E.slice(4))) ? "net_" + n.bits.get(Number(E.slice(4))) : E).join(" "));
  }
  const a = r.drawing ? structuredClone(r.drawing) : null, i = u.querySelector("#spice-layout-report");
  if (i) {
    const c = JSON.parse(i.textContent), l = (d) => n.ids.get(d) || d;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(l), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(l), c.recognizedMotifs = Ne(c.recognizedMotifs || [], l, (d) => n.bits.get(d) ?? d);
    for (const d of c.pairConstraints || []) d.members = d.members.map(l);
    for (const d of c.motifMeasurements || [])
      d.members = d.members.map(l), d.interlopers && (d.interlopers = d.interlopers.map(l));
    for (const d of c.voltageRails || []) d.bit !== void 0 && (d.bit = n.bits.get(d.bit) ?? d.bit);
    i.textContent = JSON.stringify(c);
  }
  if (a) {
    for (const c of a.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const l of c.ports) l.bit = n.bits.get(l.bit) ?? l.bit;
    }
    for (const c of a.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(u.documentElement), drawing: a };
}
function Dt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-Jmc6hJWr.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const u = (c, l) => {
      clearTimeout(i), n.terminate(), c ? r(Error(c)) : o(l);
    }, a = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, i = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), a);
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
* face Q7 right\r
* face Q16 right\r
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
* face Q7 right\r
* face Q16 right\r
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
`, fe = {
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
const Me = fe.filter.source, k = (t) => document.getElementById("spice-" + t), ce = k("app");
if (ce) {
  let g = function(I) {
    const S = k("example-info");
    if (S && (S.replaceChildren(), !!I && (S.append(document.createTextNode(I.description + " ")), I.url))) {
      const T = document.createElement("a");
      T.href = I.url, T.target = "_blank", T.rel = "noopener noreferrer", T.textContent = I.reference, S.append(T);
    }
  }, v = function() {
    r = null, u = null, i = "", O(), g(Object.values(fe).find((I) => I.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, x = function(I) {
    o.replaceChildren();
    for (const { severity: S, line: T, message: U, source: P } of I) {
      const B = document.createElement("li");
      B.className = S, B.textContent = `${S.toUpperCase()}${P && P !== "input.cir" ? " · " + P : ""}${T ? " · line " + T : ""}: ${U}`, o.append(B);
    }
    k("messages").open = I.some((S) => S.severity !== "info"), k("message-count").textContent = `${I.length} message${I.length === 1 ? "" : "s"}`;
  }, R = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${m.x} ${m.y} ${m.w} ${m.h}`), k("zoom-level").textContent = Math.round(w.w / m.w * 100) + "%";
  }, A = function(I, S = m.x + m.w / 2, T = m.y + m.h / 2) {
    if (!e.querySelector("svg")) return;
    const U = Math.max(0.05, Math.min(10, m.w * I / w.w)) * w.w / m.w;
    m = { x: S + (m.x - S) * U, y: T + (m.y - T) * U, w: m.w * U, h: m.h * U }, R();
  }, M = function(I) {
    const S = new URLSearchParams();
    I && S.set("instance", I);
    const T = S.toString();
    location.hash.slice(1) === T ? (f = I, G()) : location.hash = T;
  }, D = function() {
    f = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, $ = function(I) {
    const S = l.contexts[I].path;
    for (let T = 1; T <= S.length; T++) p.add(S.slice(0, T).map(encodeURIComponent).join("/"));
  }, ee = function() {
    const I = !!(h && h !== f && l?.contexts[h]);
    k("selection-actions").hidden = !I, k("toggle-instance").textContent = p.has(h) ? "Collapse instance" : "Expand instance", k("toggle-instance").disabled = !1, k("open-instance").href = "#" + new URLSearchParams({ instance: h });
  }, Ce = function() {
    k("breadcrumbs").replaceChildren();
    const I = (T, U) => {
      const P = document.createElement("button");
      P.type = "button", P.textContent = T, P.onclick = () => M(U), P.disabled = U === f, k("breadcrumbs").append(P);
    };
    if (I("Top", ""), f) {
      const T = l.contexts[f].path;
      for (let U = 0; U < T.length; U++) I(T[U], T.slice(0, U + 1).map(encodeURIComponent).join("/"));
    }
    k("instances").replaceChildren();
    const S = (T, U) => {
      for (const P of T.children) {
        const B = document.createElement("div");
        B.className = "spice-instance-row", B.style.setProperty("--depth", Math.min(U, 8)), B.dataset.instance = P.id;
        const q = document.createElement("button");
        q.type = "button", q.textContent = p.has(P.id) ? "−" : "+", q.title = (p.has(P.id) ? "Collapse " : "Expand ") + P.id, q.setAttribute("aria-label", q.title), q.setAttribute("aria-expanded", String(p.has(P.id))), q.onclick = () => {
          p.has(P.id) ? p.delete(P.id) : $(P.id), h = P.id, G();
        };
        const te = document.createElement("a");
        te.href = "#" + new URLSearchParams({ instance: P.id }), te.textContent = P.name + " · " + P.definition, te.title = "Open " + P.id + " as its own sheet";
        const K = document.createElement("span");
        if (K.className = "spice-help", K.textContent = Object.entries(P.params).map(([Y, ne]) => Y + "=" + ne).join(" · "), B.append(q, te), K.textContent) {
          const Y = document.createElement("details"), ne = document.createElement("summary");
          ne.textContent = "Parameters", Y.append(ne, K), B.append(Y);
        }
        k("instances").append(B), S(P, U + 1);
      }
    };
    S(l.contexts[f], 0), k("hierarchy-panel").hidden = !l.contexts[f].children.length, k("focus-title").textContent = f ? f + " / " + l.contexts[f].definition : "Top-level schematic", ee();
  };
  const t = k("input"), e = k("preview"), n = k("status"), o = k("diagnostics");
  let r = null, u = null, a = !1, i = "", c, l, d, E = "", f = "", h = "", y = !1, m = { x: 0, y: 0, w: 1, h: 1 }, w = { ...m }, _;
  const p = /* @__PURE__ */ new Set();
  let C = !1, N = {};
  try {
    N = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ce.addEventListener("click", (I) => {
    y && I.target.closest('a[href^="#"]') && I.preventDefault();
  });
  const O = () => {
    k("copy").disabled = k("download").disabled = !i || y, k("download-asc").disabled = k("download-asc-bundle").disabled = !i || !r || y || a;
  }, s = () => ({ font: k("font").value, fontSize: Number(k("size").value), color: k("color").value, detailed: k("detailed").checked, conventional: k("conventional").checked });
  t.value = Me;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Me;
  } catch {
  }
  g(Object.values(fe).find((I) => I.source === t.value)), t.addEventListener("input", v);
  for (const I of ["font", "size", "color", "detailed", "conventional"]) k(I).addEventListener("input", v);
  k("zoom-in").onclick = () => A(0.8), k("zoom-out").onclick = () => A(1.25), k("fit").onclick = () => {
    m = { ...w }, R();
  };
  const V = (I) => {
    const S = e.querySelector("svg");
    return S ? new DOMPoint(I.clientX, I.clientY).matrixTransform(S.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (I) => {
    const S = V(I);
    S && (I.preventDefault(), A(I.deltaY > 0 ? 1.12 : 1 / 1.12, S.x, S.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (I) => {
    I.button !== 0 || !e.querySelector("svg") || (_ = { start: V(I), x: I.clientX, y: I.clientY, view: { ...m }, moved: !1 }, e.setPointerCapture(I.pointerId));
  }), e.addEventListener("pointermove", (I) => {
    if (!_) return;
    const S = V(I);
    Math.hypot(I.clientX - _.x, I.clientY - _.y) > 4 && (_.moved = !0), m.x += _.start.x - S.x, m.y += _.start.y - S.y, R();
  }), e.addEventListener("pointerup", (I) => {
    if (!_) return;
    const S = _.moved;
    if (_ = null, e.hasPointerCapture(I.pointerId) && e.releasePointerCapture(I.pointerId), !S) {
      const T = document.elementFromPoint(I.clientX, I.clientY)?.closest("[data-component]"), U = c?.components.find((P) => P.name === T?.dataset.component);
      U && (h = U.instanceId || "", k("selection").textContent = `${U.raw}
${Object.entries(U.terminals).map(([P, B]) => `${P} → ${B}`).join("   ")}`, U.kind === "X" ? ($(U.instanceId), G()) : ee());
    }
  }), window.addEventListener("hashchange", () => {
    if (y) {
      C = !0;
      return;
    }
    D(), h = "", G();
  }), k("collapse-all").onclick = () => {
    p.clear(), G();
  }, k("expand-all").onclick = () => {
    for (const I of Object.keys(l?.contexts || {})) I && p.add(I);
    G();
  }, k("toggle-instance").onclick = () => {
    p.has(h) ? p.delete(h) : $(h), G();
  }, e.addEventListener("pointercancel", () => {
    _ = null;
  }), e.addEventListener("keydown", (I) => {
    const S = I.target.closest("[data-instance]");
    if (S && (I.key === "Enter" || I.key === " ")) {
      I.preventDefault(), h = S.dataset.instance, $(h), G();
      return;
    }
    I.key === "+" || I.key === "=" ? A(0.8) : I.key === "-" ? A(1.25) : I.key.toLowerCase() === "f" ? (m = { ...w }, R()) : I.key.startsWith("Arrow") && (I.preventDefault(), m.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[I.key] || 0) * m.w, m.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[I.key] || 0) * m.h, R());
  });
  async function G() {
    if (y) return;
    y = !0, r = null, u = null, i = "", O(), k("generate").disabled = !0, t.readOnly = !0, k("file").disabled = !0, k("libraries").disabled = !0;
    for (const S of ce.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button, #spice-collapse-all, #spice-expand-all, #spice-toggle-instance")) S.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let I = [];
    try {
      if (E !== t.value || !l) {
        if (d = ut(t.value, { files: N }), I = [...d.diagnostics], I.some((L) => L.severity === "error"))
          throw l = null, Error("Fix the parser errors below before generating.");
        l = vt(d), E && E !== t.value ? (p.clear(), f = "", h = "", history.replaceState(null, "", location.pathname + location.search)) : D(), E = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (I = [...d.diagnostics], x(I), I.some((L) => L.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = At(l, { expanded: p, focus: f });
      const S = Ut(c);
      s().conventional && I.push(...c.layout.diagnostics);
      const T = await Qt(S, s()), U = new DOMParser().parseFromString(T.svg, "image/svg+xml");
      if (U.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const P = U.documentElement, B = P.querySelector("#spice-layout-report");
      if (B) {
        c.layout.report = JSON.parse(B.textContent);
        const L = c.layout.report;
        if (I.push({ severity: "info", message: `Layout: compact signal flow; ${L.powerSourcesChecked} DC/ground symbols checked, ${L.powerOrderViolations} DC order preference(s) unmet. ${L.powerPass}. ${L.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), L.classicTemplateFallback && I.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), L.groundPlacement && I.push({ severity: "info", message: `Ground: ${L.groundPlacement}; ${L.straightenedGroundDrops || 0} return-path simplification(s).` }), L.explicitGroups && I.push({ severity: "info", message: `Layout comments: ${L.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), L.classicRails && I.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${L.railCount} shared voltage rails.` }), L.localClassicInstances?.length && I.push({ severity: "info", message: `${L.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), L.localClassicStages?.length && I.push({ severity: "info", message: `Classic transistor proximity active: ${L.localClassicStages.join(", ")}.` }), L.sharedClassicRails && I.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), L.mirroredTransistors?.length && I.push({ severity: "info", message: `Control-pin mirror choices: ${L.mirroredTransistors.join(", ")}.` }), L.recognizedMotifs?.length && I.push({ severity: "info", message: `Transistor structures: ${L.recognizedMotifs.map((Q) => `${Q.kind} (${Q.members.join(", ")}; ${Q.confidence})`).join("; ")}.` }), L.appliedMotifs?.length && I.push({ severity: "info", message: `Topology preferences applied to ${L.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), L.pairConstraints?.length) {
          const Q = L.pairConstraints.filter((H) => H.crossRegion).length;
          I.push({ severity: "info", message: `${L.pairConstraints.length - Q} adjacent transistor pair(s); ${Q} cross-region mirror row constraint(s).` });
        }
        L.netShortcuts && I.push({ severity: "info", message: `${L.netShortcuts} safe straight net shortcut(s); ${L.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), L.sharedRailFallback && I.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${L.sharedRailFallback}.` });
        for (const Q of L.localClassicFallbacks || []) Q.stage && I.push({ severity: "info", message: `Classic stage ${Q.stage} uses automatic layout: ${Q.reason || "No unobstructed local template"}.` });
        L.geometricConnectivityVerified && I.push({ severity: "info", message: `Net geometry verified; ${L.cyclesRemoved} same-net loop(s) and ${L.leavesRemoved} unused wire branch(es) removed.` }), x(I);
      }
      if (P.localName !== "svg" || P.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const q = Number(P.getAttribute("width")), te = Number(P.getAttribute("height"));
      w = { x: -20, y: -20, w: q + 40, h: te + 40 }, m = { ...w }, P.setAttribute("viewBox", `${w.x} ${w.y} ${w.w} ${w.h}`), P.setAttribute("width", String(w.w)), P.setAttribute("height", String(w.h)), P.setAttribute("role", "img"), P.setAttribute("aria-label", c.title || "SPICE schematic"), P.setAttribute("style", "background:white");
      for (const L of c.components) {
        const Q = U.getElementById("cell_" + L.name);
        if (!Q) throw Error("Renderer omitted component " + L.name);
        Q.setAttribute("data-component", L.name), L.kind === "X" && (Q.setAttribute("data-instance", L.instanceId), Q.setAttribute("role", "button"), Q.setAttribute("tabindex", "0"), Q.setAttribute("aria-label", "Expand " + L.name));
        const H = U.createElementNS(P.namespaceURI, "title");
        H.textContent = L.raw + `
Resolved: ` + L.value + `
` + Object.entries(L.terminals).map(([X, ae]) => X + ": " + ae).join(", "), Q.prepend(H);
      }
      for (const L of Object.values(c.nodes))
        for (const Q of P.querySelectorAll(".net_" + L.bit)) {
          Q.setAttribute("data-net", L.name);
          const H = U.createElementNS(P.namespaceURI, "title");
          H.textContent = "Node " + L.displayName, Q.append(H);
        }
      const K = c.components.filter((L) => L.kind === "K").map((L) => ({ name: L.name, inductors: L.coupledInductors, value: L.value }));
      if (K.length) {
        const L = U.createElementNS(P.namespaceURI, "metadata");
        L.setAttribute("id", "spice-magnetic-couplings"), L.textContent = JSON.stringify(K), P.append(L);
        for (const Q of K) for (const H of Q.inductors) {
          const X = U.getElementById("cell_" + H);
          if (!X) continue;
          const ae = U.createElementNS(P.namespaceURI, "circle"), me = [...X.children].find((ge) => ge.getAttribute("s:pid") === "A"), Be = me?.getAttribute("s:position"), ve = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[Be] || [0, 0];
          for (const [ge, je] of Object.entries({ cx: Number(me?.getAttribute("s:x")) + ve[0], cy: Number(me?.getAttribute("s:y")) + ve[1], r: 3, fill: s().color, stroke: "none", "data-coupling": Q.name })) ae.setAttribute(ge, String(je));
          const Oe = U.createElementNS(P.namespaceURI, "title");
          Oe.textContent = Q.name + " · dotted terminal: " + Q.inductors.join(", "), ae.append(Oe), X.append(ae);
        }
      }
      r = T.drawing, i = new XMLSerializer().serializeToString(P), k("source").value = i, e.replaceChildren(document.importNode(P, !0)), R();
      const Y = I.filter((L) => L.severity === "warning").length;
      n.textContent = `${c.components.filter((L) => !L.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${Y ? " · Review " + Y + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${we}.`, c.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${c.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), c.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found.");
      const ne = Object.values(c.nodes).map((L) => {
        const Q = document.createElement("tr");
        for (const H of [L.displayName, L.terminals.map((X) => X.component + "." + X.pin).join(", ")]) {
          const X = document.createElement("td");
          X.textContent = H, Q.append(X);
        }
        return Q;
      });
      k("nets").replaceChildren(...ne), k("json").value = JSON.stringify({ circuit: c, netlist: S, hierarchy: d }, null, 2), k("selection").textContent = "Click a component to inspect its original statement and pin connections.", Ce();
    } catch (S) {
      if (e.replaceChildren(), i = "", k("source").value = "", k("json").value = "", k("nets").replaceChildren(), k("selection").textContent = "", n.textContent = S.message, !l)
        k("hierarchy-panel").hidden = !0, k("selection-actions").hidden = !0, k("breadcrumbs").replaceChildren();
      else if (!l.contexts[f]) {
        const T = document.createElement("button");
        T.type = "button", T.textContent = "Return to Top", T.onclick = () => M(""), k("breadcrumbs").replaceChildren(T);
      }
      S.diagnostics && (I = S.diagnostics), I.some((T) => T.severity === "error") || I.push({ severity: "error", line: 0, message: S.message }), x(I);
    } finally {
      y = !1, k("generate").disabled = !1, t.readOnly = !1, k("file").disabled = !1, k("libraries").disabled = !1;
      for (const S of ce.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-collapse-all, #spice-expand-all")) S.disabled = !1;
      l && l.contexts[f] && Ce(), e.setAttribute("aria-busy", "false"), O(), C && (C = !1, D(), queueMicrotask(G));
    }
  }
  k("generate").onclick = G;
  for (const I of ce.querySelectorAll("[data-example]")) I.onclick = () => {
    const S = fe[I.dataset.example];
    t.value = S.source, v(), g(S), G();
  };
  k("file").onchange = async (I) => {
    const S = I.target.files[0];
    if (S) {
      if (S.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Ue(S), v(), G();
      } catch (T) {
        n.textContent = "File could not be read: " + T.message;
      } finally {
        I.target.value = "";
      }
    }
  }, k("libraries").onchange = async (I) => {
    try {
      for (const S of I.target.files) {
        if (S.size > 16e6) throw Error("Library exceeds 16 MB: " + S.name);
        N[S.webkitRelativePath || S.name] = await Ue(S);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(N));
      } catch {
      }
      l = null, E = "", k("library-status").textContent = Object.keys(N).length + " library file(s) loaded", G();
    } catch (S) {
      n.textContent = S.message;
    } finally {
      I.target.value = "";
    }
  }, k("library-status").textContent = Object.keys(N).length ? "Libraries restored from this session." : "For .include / .lib dependencies", k("download").onclick = () => {
    const I = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), S = document.createElement("a");
    S.href = I, S.download = "spice-schematic.svg", S.click(), setTimeout(() => URL.revokeObjectURL(I), 1e3);
  };
  async function Ie(I) {
    const S = r;
    if (!(!S || y || a)) {
      a = !0, O(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: T } = await import("./asc-export-rK6yDtVS.js");
        if (r !== S) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= T({ tree: l, circuit: c, drawing: S, source: t.value, libraries: N });
        const U = I ? u.zip : u.ascBytes, P = URL.createObjectURL(new Blob([U], { type: I ? "application/zip" : "application/octet-stream" })), B = document.createElement("a");
        B.href = P, B.download = I ? "spice-schematic-asc.zip" : "spice-schematic.asc", B.click(), setTimeout(() => URL.revokeObjectURL(P), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (I ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (T) {
        n.textContent = "ASC export failed: " + T.message;
        const U = document.createElement("li");
        U.className = "error", U.textContent = n.textContent, o.append(U);
      } finally {
        a = !1, O();
      }
    }
  }
  k("download-asc").onclick = () => Ie(!1), k("download-asc-bundle").onclick = () => Ie(!0), k("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      k("source-details").open = !0, k("source").focus(), k("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, G();
}
export {
  Pe as b,
  de as l,
  Ee as n,
  mt as p
};
