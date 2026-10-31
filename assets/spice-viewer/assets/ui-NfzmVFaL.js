const _t = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, vt = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Nt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ct = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, It = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Tt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, St = { 1: "a", 2: "b", 7: "Q", 8: "com" }, At = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, Ot = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, kt = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, Rt = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Lt = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Mt = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Pt = {
  AND: _t,
  BUF: vt,
  COUNTER: Nt,
  DFLOP: Ct,
  SCHMITT: It,
  OR: Tt,
  PHASEDET: St,
  SRFLOP: At,
  XOR: Ot,
  MODULATOR: kt,
  OTA: Rt,
  SAMPLEHOLD: Lt,
  VARISTOR: Mt
}, Dt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", _e = (t) => t.toLowerCase(), nt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Ut = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Bt(t, e) {
  const n = (I) => e[_e(I || "")] || Object.entries(e).find(([_]) => _.startsWith(_e(I || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], i = [], c = "", a = "", p = [], h = [], u = 0, g = "", d = "", w = "", E = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], a = _e(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], a = o === "D" ? "d_v" : o === "B" ? "spice_b" : _e(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !nt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), c = t[r.length + 1] || "";
    const I = n(c)?.type;
    E = ["NPN", "PNP"].includes(I), a = E ? (r.length === 3 ? "q_" : "spice_q4_") + _e(I) : "spice_q" + r.length;
  } else if (o === "M") {
    const I = n(t[4]), _ = n(t[5]), y = I?.type === "VDMOS" || !_ && (!t[5] || nt(t[5]));
    r = y ? ["D", "G", "S"] : ["D", "G", "S", "B"], c = t[r.length + 1] || "";
    const v = n(c), S = v?.type;
    if (y && v && S !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!y && S === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    E = ["NMOS", "PMOS", "VDMOS"].includes(S);
    let M = null, C = v;
    const k = /* @__PURE__ */ new Set();
    for (; C && !k.has(C.name) && (k.add(C.name), M = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !M); )
      C = n(C.baseModel);
    const D = S === "PMOS" || S === "VDMOS" && M && (M[1] === void 0 || Number(M[1]) >= 0.5);
    a = E ? "spice_" + (D ? "pmos" : "nmos") + (y ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    c = t[4] || "";
    const I = n(c)?.type, _ = o === "Z" && ["NIGBT", "PIGBT"].includes(I);
    r = _ ? ["C", "G", "E"] : ["D", "G", "S"], E = o === "J" ? ["NJF", "PJF"].includes(I) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(I), a = "spice_" + (_ ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(I || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], a = "spice_" + _e(o);
    let I = 3, _ = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[I] || "");
    if (/^poly$/i.test(t[I] || "") && (_ = /^\(\s*(\d+)\s*\)$/.exec(t[++I] || ""), !_))
      throw Error("POLY requires a dimension.");
    if (_) {
      const y = Number(_[1]);
      if (y > 128) throw Error("POLY supports at most 128 controlling variables.");
      let v = I + 1, S = [];
      const M = "EG".includes(o), C = y * (M ? 2 : 1);
      for (; S.length < C && v < t.length; ) S.push(...Ut(t[v++]));
      if (S.length !== C || v >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (M) {
        for (let k = 0; k < y; k++) r.push("C" + (k + 1) + "+", "C" + (k + 1) + "-");
        i = [t[1], t[2], ...S];
      } else p = S;
      u = v, g = "POLY(" + y + ") " + (M ? "" : S.join(" ") + " "), d = "POLY", M && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? d = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), d = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (p = [t[3]], u = 4, g = t[3] + " ");
    w = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (d ? " · " + d : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], c = t[5] || "", a = "spice_device", w = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], p = [t[3]], c = t[4] || "", u = 3, a = "spice_device", w = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (c = t[5] || ""), a = "spice_device", w = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], c = t[4] || "", a = "spice_device", w = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (I, _) => "P" + (_ + 1)), a = "spice_device", w = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (h = t.slice(1, -1), h.some((I) => !/^L/i.test(I.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, a = "spice_coupling", w = "Magnetic coupling", g = h.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], a = "spice_device", w = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], a = "spice_device", w = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", w = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (u || (u = r.length + 1), i.length || (i = t.slice(1, r.length + 1)), i.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (i.some((I) => /[=()]/.test(I) && !/^\{[\s\S]*\}$/.test(I))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (a = "spice_br"), o === "D" && (c = t[3] || ""), o === "@") {
    const I = t.slice(u).join(" ");
    for (const _ of I.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(_[1].toUpperCase()), i.push(_[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (p.some((I) => !I)) throw Error("Missing controlling voltage source.");
  const x = r.map((I, _) => o === "A" && Pt[(t[9] || "").toUpperCase()]?.[String(_ + 1)] || I);
  return { kind: o, pins: r, nodeTokens: i, pinLabels: x, model: c, type: a, controlSource: p[0] || "", controlSources: p, coupledInductors: h, value: g + t.slice(u).join(" "), sourceMode: d, symbol: w, polarityKnown: E };
}
const Vt = Dt, jt = new Set(Vt.split(" ")), Ve = () => /* @__PURE__ */ Object.create(null), me = (t) => t.toLowerCase();
function De(t) {
  const e = [], n = [];
  let o = "", r = 0, i = "";
  for (let c = 0; c < t.length; c++) {
    const a = t[c];
    if (i) {
      o += a, a === i && t[c - 1] !== "\\" && (i = "");
      continue;
    }
    if (a === '"' || a === "'") {
      i = a, o += a;
      continue;
    }
    if (!r && (a === ";" || a === "$" && (!c || /\s/.test(t[c - 1])))) break;
    if ("({".includes(a) && (n.push(a), r++), ")}".includes(a) && (r--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !r ? (o && e.push(o), o = "") : o += a;
  }
  if (r || i) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function Qt(t, e = {}) {
  const n = [], o = [], r = [], i = Object.assign(Ve(), e.models), c = Ve(), a = (_, y, v) => n.push({ severity: _, line: y, message: v });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const p = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((_, y) => {
    const v = _.trim();
    !v || v.startsWith("*") || (v.startsWith("+") ? p.length ? p.at(-1).text += " " + v.slice(1).trim() : a("error", y + 1, "Continuation has no preceding statement.") : p.push({ line: y + 1, text: v }));
  });
  for (const _ of p) {
    try {
      _.tokens = De(_.text);
    } catch (v) {
      a("error", _.line, v.message), _.tokens = [];
    }
    const y = _.tokens;
    if (/^\.model$/i.test(y[0] || ""))
      if (y.length < 3) a("error", _.line, ".model requires a name and device type.");
      else {
        const v = /^ako:(.+)$/i.exec(y[2]), S = v && y[3] && !y[3].startsWith("(") ? y[3].split("(")[0].toUpperCase() : "";
        i[me(y[1])] = { name: y[1], type: v ? S : y[2].split("(")[0].toUpperCase(), baseModel: v?.[1] || "", raw: _.text };
      }
  }
  const h = /* @__PURE__ */ new Set();
  function u(_) {
    const y = i[me(_)];
    if (!y) return "";
    if (y.type) return y.type;
    if (h.has(me(_))) throw Error("Circular AKO model inheritance: " + _);
    return h.add(me(_)), y.type = u(y.baseModel), h.delete(me(_)), y.type;
  }
  for (const _ of Object.values(i)) if (_.baseModel && !_.type)
    try {
      u(_.name);
    } catch (y) {
      a("error", 0, y.message);
    }
  let g = "", d = 0, w = !1, E = !1;
  const x = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: _, text: y, tokens: v } of p) {
    if (!v.length) continue;
    const S = me(v[0]);
    if (E) {
      a("warning", _, "Statement after .end is not rendered: " + y);
      continue;
    }
    if (S === ".control") {
      w = !0, a("warning", _, ".control script retained but not executed or rendered.");
      continue;
    }
    if (S === ".endc") {
      w = !1;
      continue;
    }
    if (w) continue;
    if (S === ".subckt") {
      d++, a("error", _, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (S === ".ends") {
      d ? d-- : a("error", _, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (S === ".end") {
      E = !0;
      continue;
    }
    if (S.startsWith(".")) {
      o.push({ line: _, text: y }), S === ".title" ? g = v.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(S) ? a("error", _, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(S) ? a("error", _, "Topology-changing directive is unsupported: " + y) : I.has(S) || a("warning", _, "Directive retained but not resolved: " + y);
      continue;
    }
    const M = v[0][0].toUpperCase();
    if (!jt.has(M)) {
      _ === 1 && !/\d/.test(v[0]) && v.length > 1 && M !== "X" ? (g = y, a("warning", _, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", _, `Unsupported ${M} device was not rendered: ${y}`);
      continue;
    }
    const C = M === "M" || M === "Q" ? 5 : 4;
    if (_ === 1 && !/\d/.test(v[0]) && (v.length < C || M === "T" && !/\b(?:zo|z0)\s*=/i.test(y))) {
      g = y, a("info", _, "SPICE title: " + y);
      continue;
    }
    try {
      if (x.has(S)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const k = Bt(v, i), { pins: D, nodeTokens: m, ...f } = k;
      k.polarityKnown || a("warning", _, `${v[0]}: model polarity unknown; explicit ${D.join("/")} terminals retained.`);
      const P = Ve();
      D.forEach((q, G) => {
        const z = me(m[G]);
        c[z] || (c[z] = { name: z, displayName: v[G + 1], bit: Object.keys(c).length + 2, terminals: [] }), c[z].terminals.push({ component: v[0], pin: q }), P[q] = z;
      }), r.push({ ...f, name: v[0], terminals: P, line: _, raw: y }), x.add(S);
    } catch (k) {
      a("error", _, `${v[0]}: ${k.message} Statement: ${y}`);
    }
  }
  d && a("error", 0, "Unclosed .subckt definition."), w && a("error", 0, "Unclosed .control block."), r.length || a("error", 0, "No supported components to render."), r.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const _ of r) {
    for (const y of _.controlSources || []) !y.includes(":") && !r.some((v) => me(v.name) === me(y) && v.kind === "V") && a("error", _.line, `${_.name}: controlling voltage source ${y} was not found.`);
    for (const y of _.coupledInductors || []) !y.includes(":") && !r.some((v) => me(v.name) === me(y) && v.kind === "L") && a("error", _.line, `${_.name}: coupled inductor ${y} was not found.`);
    (_.kind === "B" || _.type === "spice_b") && a("info", _.line, `${_.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: g, components: r, nodes: c, models: i, directives: o, diagnostics: n };
}
const xe = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), rt = (t) => xe(t).split("/").at(-1);
function Ft(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], i = [], c = [];
  let a = 0;
  const p = (u, g) => {
    const d = xe(g).split("/").slice(0, -1).concat(xe(u)).join("/"), w = [...o].filter(([x]) => xe(x) === xe(u) || xe(x) === d);
    if (w.length === 1) return w[0];
    const E = [...o].filter(([x]) => rt(x) === rt(u));
    if (E.length !== 1) throw Error(E.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return E[0];
  };
  function h(u, g, d = "", w = []) {
    const E = xe(g) + ":" + d.toLowerCase();
    if (w.includes(E)) throw Error("Circular library include: " + [...w, E].join(" → "));
    if (w.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const x = [], I = /^\s*\.endl\b/im.test(u);
    let _ = !d;
    const y = (S, M) => {
      if (a += S.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      c.push(S), i.push({ file: g, line: M + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((S, M) => {
      const C = S.trim();
      if (/^\.lib\b/i.test(C) && I) {
        const k = De(C);
        if (k.length === 2 && !/[.\\/]/.test(k[1])) {
          x.push(k[1].toLowerCase()), k[1].toLowerCase() === d.toLowerCase() && (_ = !0), y("* Library section " + k[1], M);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        x.pop(), y("* End library section", M);
        return;
      }
      if (d && x.length && !x.includes(d.toLowerCase())) {
        y("* Unselected library section", M);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const k = De(C);
          if (!k[1]) throw Error("Include requires a filename.");
          const [D, m] = p(k[1], g);
          y("* Included " + D, M), h(m, D, k[2] || "", [...w, E]);
        } catch (k) {
          r.push({ severity: "error", line: M + 1, source: g, message: k.message }), y("* Unresolved include", M);
        }
      else y(S, M);
    }), !_) throw Error("Library section " + d + " not found in " + g);
  }
  try {
    h(t, n);
  } catch (u) {
    r.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: c.join(`
`), origins: i, diagnostics: r };
}
function Gt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((a, p) => {
    const h = a.trim();
    /^\.subckt\b/i.test(h) && (o.push(p + 1), n.set(p + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: a, line: p + 1 }) : e[p] = a, /^\.ends\b/i.test(h) && o.length > 1 && o.pop();
  });
  const i = ot(Array.from({ length: t.split(/\r?\n/).length }, (a, p) => e[p] || "").join(`
`));
  r.push(...i.diagnostics);
  const c = /* @__PURE__ */ new Map();
  for (const [a, p] of n) {
    const h = ot(p.map((u) => u.raw).join(`
`));
    c.set(a, h.layout), r.push(...h.diagnostics.map((u) => ({ ...u, line: p[u.line - 1]?.line || a })));
  }
  return { layout: i.layout, scopes: c, diagnostics: r };
}
function ot(t) {
  const e = [], n = [];
  let o = !1, r = !1, i = 0;
  if (t.split(/\r?\n/).forEach((y, v) => {
    const S = y.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(S)) {
      (r || o) && e.push({ severity: "error", line: v + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(S) || e.push({ severity: "error", line: v + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, i = v + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(S)) {
      o || e.push({ severity: "error", line: v + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (S.startsWith("*") ? n.push(S.slice(1).trim()) : e.push({ severity: "error", line: v + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: i, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const c = n.join(" "), a = c.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], p = [], h = [], u = [], g = [];
  let d = 0, w = 0, E = 10;
  const x = () => a[d++], I = () => {
    const y = x();
    if (!y || !/^[A-Za-z_@][\w./%:@-]*$/.test(y)) throw Error("Expected layout identifier, got " + y);
    return y;
  };
  function _(y) {
    if (p.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const v = y ? I() : "@row" + w++, S = x();
    if (!["row", "column", "classic"].includes(S)) throw Error("Expected row, column or classic.");
    if (x() !== "{") throw Error("Expected { after " + S);
    const M = { id: v, direction: S, members: [] };
    for (p.push(M); d < a.length && a[d] !== "}"; )
      a[d] === "group" ? (x(), M.members.push(_(!0))) : ["row", "column"].includes(a[d]) ? M.members.push(_(!1)) : M.members.push(I());
    if (x() !== "}") throw Error("Unclosed group " + v);
    if (!M.members.length) throw Error("Empty layout group " + v);
    return v;
  }
  try {
    for (; d < a.length; )
      if (a[d] === "group")
        x(), _(!0);
      else if (["row", "column"].includes(a[d])) _(!1);
      else if (a[d] === "face") {
        x();
        const m = I(), f = x();
        if (!["left", "right"].includes(f)) throw Error("Expected face left or right.");
        if (g.some((P) => P.device.toLowerCase() === m.toLowerCase())) throw Error("Duplicate face device.");
        g.push({ device: m, side: f });
      } else if (a[d] === "pair") {
        x();
        const m = x();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(m)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (x() !== "{") throw Error("Expected { after pair kind.");
        const f = [];
        for (; d < a.length && a[d] !== "}"; ) f.push(I());
        if (x() !== "}" || !f.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: m, members: f });
      } else if (a[d] === "priority-cap") {
        if (x(), E = Number(x()), !Number.isInteger(E) || E < 3 || E > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (x() === "place") {
        const m = I(), f = x(), P = I();
        if (!["left-of", "above"].includes(f)) throw Error("Expected left-of or above.");
        h.push({ a: m, relation: f, b: P });
      } else throw Error("Unknown layout instruction near " + a[d - 1]);
    const y = /* @__PURE__ */ new Set();
    for (const m of p) {
      const f = m.id.toLowerCase();
      if (y.has(f)) throw Error("Duplicate layout group " + m.id);
      y.add(f);
    }
    const v = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set(), M = new Map(p.map((m) => [m.id.toLowerCase(), m])), C = (m) => {
      if (v.has(m)) throw Error("Circular layout group " + m);
      if (!S.has(m)) {
        v.add(m);
        for (const f of M.get(m).members) M.has(f.toLowerCase()) && C(f.toLowerCase());
        v.delete(m), S.add(m);
      }
    };
    for (const m of M.keys()) C(m);
    const k = /* @__PURE__ */ new Map();
    for (const m of h) {
      if (m.a.toLowerCase() === m.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      k.has(m.a.toLowerCase()) || k.set(m.a.toLowerCase(), []), k.get(m.a.toLowerCase()).push(m.b.toLowerCase());
    }
    v.clear(), S.clear();
    const D = (m) => {
      if (v.has(m)) throw Error("Circular place constraints.");
      if (!S.has(m)) {
        v.add(m);
        for (const f of k.get(m) || []) D(f);
        v.delete(m), S.add(m);
      }
    };
    for (const m of k.keys()) D(m);
  } catch (y) {
    e.push({ severity: "error", line: i, message: "Layout description: " + y.message });
  }
  return { layout: { version: 1, priorityCap: E, groups: p, relations: h, pairs: u, faces: g }, diagnostics: e };
}
function Ht(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const w = new Set(n.groups.map((x) => x.id.toLowerCase())), E = (x) => w.has(x.toLowerCase()) ? x : e.components.find((_) => _.synthetic && _.value.toLowerCase() === x.toLowerCase())?.name || e.focus + "/" + x;
    o = { ...n, groups: n.groups.map((x) => ({ ...x, members: x.members.map(E) })), relations: n.relations.map((x) => ({ ...x, a: E(x.a), b: E(x.b) })), faces: (n.faces || []).map((x) => ({ ...x, device: E(x.device) })), pairs: (n.pairs || []).map((x) => ({ ...x, members: x.members.map(E) })) };
  }
  const r = new Map(o.groups.map((w) => [w.id.toLowerCase(), w])), i = Object.values(t.contexts).flatMap((w) => w.devices.map((E) => E.name)), c = new Set([...Object.keys(t.contexts), ...i, ...e.components.map((w) => w.name)].map((w) => w.toLowerCase()));
  for (const w of r.values()) if (c.has((n ? e.focus + "/" + w.id : w.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + w.id);
  for (const w of r.values()) for (const E of w.members) if (!r.has(E.toLowerCase()) && !c.has(E.toLowerCase())) throw Error("Unknown @layout instance/device: " + E);
  for (const w of o.relations) for (const E of [w.a, w.b]) if (!r.has(E.toLowerCase()) && !c.has(E.toLowerCase())) throw Error("Unknown @layout place target: " + E);
  const a = (o.pairs || []).map((w) => ({ ...w, members: w.members.map((E) => {
    const x = e.components.find((I) => I.name.toLowerCase() === E.toLowerCase());
    if (!x || x.synthetic || x.block) throw Error("Unknown or non-visible @layout pair device: " + E);
    return x.name;
  }) })), p = (o.faces || []).map((w) => {
    const E = e.components.find((x) => x.name.toLowerCase() === w.device.toLowerCase());
    if (!E || !["Q", "M", "J", "Z"].includes(E.kind)) throw Error("Unknown or unsupported @layout face device: " + w.device);
    return { ...w, device: E.name };
  }), h = /* @__PURE__ */ new Map(), u = [], g = new Set(Object.keys(t.contexts).map((w) => w.toLowerCase()));
  for (const w of o.groups) {
    const E = [];
    for (const x of w.members) {
      if (r.has(x.toLowerCase())) {
        E.push({ group: x });
        continue;
      }
      for (const I of e.components) if (I.name.toLowerCase() === x.toLowerCase() || I.name.toLowerCase().startsWith(x.toLowerCase() + "/")) {
        if (h.has(I.name)) throw Error("Overlapping @layout membership: " + I.name);
        h.set(I.name, w.id), E.push({ cell: I.name, ...g.has(x.toLowerCase()) ? { instance: x } : {} });
      }
    }
    u.push({ id: w.id, direction: w.direction, members: E });
  }
  const d = /* @__PURE__ */ new Set();
  for (const w of u) for (const E of w.members) if (E.group) {
    const x = E.group.toLowerCase();
    if (d.has(x)) throw Error("Layout group has multiple parents: " + E.group);
    d.add(x);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: u, relations: o.relations, pairs: a, faces: p };
}
const Ne = () => /* @__PURE__ */ Object.create(null), pe = (t) => t.toLowerCase();
function yt(t) {
  const e = Ne();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const i = pe(r[1]);
    let c = r[2];
    if (c === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + i);
      c = a[1];
    }
    if (c || (c = t[++n]), !c || /^params?:$/i.test(c)) throw Error("Missing value for parameter " + i);
    if (Object.hasOwn(e, i)) throw Error("Duplicate parameter: " + i);
    e[i] = c;
  }
  return e;
}
function it(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, Ne()] : [t.slice(0, e), yt(t.slice(e))];
}
function Wt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Ft(t, e);
  t = n.source;
  const o = Gt(t), r = [...n.diagnostics, ...o.diagnostics], i = Ne(), c = /* @__PURE__ */ new Set(["0"]), a = (y, v, S) => r.push({ severity: y, line: v, message: S }), p = (y, v, S, M = [], C = Ne(), k = 0) => {
    const D = { id: y, name: v, parent: S, ports: M, defaults: C, parameters: Ne(), definitions: Ne(), devices: [], instances: [], directives: [], line: k, statements: [], layoutDescription: o.scopes.get(k) || null };
    return i[y] = D, D;
  }, h = p("root", "Top", null), u = [h], g = [];
  let d = !1, w = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, v) => {
    const S = y.trim();
    !S || S.startsWith("*") || (S.startsWith("+") ? g.length ? g.at(-1).text += " " + S.slice(1).trim() : a("error", v + 1, "Continuation has no preceding statement.") : g.push({ text: S, line: v + 1 }));
  });
  for (const { text: y, line: v } of g)
    try {
      const S = De(y);
      if (!S.length) continue;
      const M = pe(S[0]), C = u.at(-1);
      if (w) {
        a("warning", v, "Statement after .end is not rendered: " + y);
        continue;
      }
      if (M === ".control") {
        d = !0, a("warning", v, ".control script retained but not executed or rendered.");
        continue;
      }
      if (M === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (M === ".subckt") {
        if (S.length < 2) throw Error(".SUBCKT requires a name.");
        const [k, D] = it(S.slice(2)), m = pe(S[1]);
        if (Object.hasOwn(C.definitions, m)) throw Error("Duplicate subcircuit definition: " + S[1]);
        const f = k.map(pe);
        if (new Set(f).size !== k.length || f.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (k.some((q) => /[{}()=]/.test(q))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const P = C.id + "/" + encodeURIComponent(m);
        C.definitions[m] = P, u.push(p(P, S[1], C.id, k, D, v));
        continue;
      }
      if (M === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (S[1] && pe(S[1]) !== pe(C.name)) throw Error(".ENDS name does not match " + C.name);
        u.pop();
        continue;
      }
      if (M === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        w = !0;
        continue;
      }
      if (M === ".param") {
        const k = yt(S.slice(1));
        for (const [D, m] of Object.entries(k)) {
          if (Object.hasOwn(C.parameters, D)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + D);
          C.parameters[D] = m;
        }
      }
      if (M === ".global") {
        if (S.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const k of S.slice(1)) c.add(pe(k));
      }
      if (M.startsWith(".") && C.directives.push({ line: v, text: y }), M.startsWith("x")) {
        const [k, D] = it(S.slice(1));
        if (!k.length) throw Error("X instance requires a subcircuit name.");
        const m = /;§pnba\s+(.+)$/i.exec(y)?.[1].split(")");
        C.instances.push({ name: S[0], nodes: k.slice(0, -1).map(pe), definitionName: k.at(-1), definitionId: null, parameters: D, line: v, raw: y, pinNames: m });
      } else C.statements.push({ line: v, text: y });
    } catch (S) {
      a("error", v, S.message + " Statement: " + y);
    }
  u.length > 1 && a("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), d && a("error", 0, "Unclosed .control block.");
  function E(y, v) {
    for (; y; ) {
      if (Object.hasOwn(y.definitions, pe(v))) return y.definitions[pe(v)];
      y = i[y.parent];
    }
    return null;
  }
  for (const y of Object.values(i)) {
    const v = [...y.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...y.statements], S = Qt(v.map((C) => C.text).join(`
`), { models: i[y.parent]?.models });
    y.devices = S.components.map((C) => ({ ...C, line: v[C.line - 1]?.line || y.line })), y.models = S.models, y === h && (h.title = S.title), r.push(...S.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: v[C.line - 1]?.line || y.line })));
    const M = new Set(y.devices.map((C) => pe(C.name)));
    for (const C of y.instances)
      if (M.has(pe(C.name)) && a("error", C.line, "Duplicate instance/device name: " + C.name), M.add(pe(C.name)), C.definitionId = E(y, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) a("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const k = i[C.definitionId];
        k.ports.length !== C.nodes.length && a("error", C.line, `${C.name}: ${k.name} expects ${k.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const y of Object.values(i)) delete y.statements;
  const x = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function _(y, v = []) {
    if (x.has(y)) {
      a("error", i[y].line, "Circular subcircuit reference: " + [...v, i[y].name].join(" → "));
      return;
    }
    if (!I.has(y)) {
      if (x.add(y), v.length >= 64) {
        a("error", i[y].line, "Subcircuit dependency nesting exceeds 64 levels."), x.delete(y), I.add(y);
        return;
      }
      for (const S of i[y].instances) S.definitionId && _(S.definitionId, [...v, i[y].name]);
      x.delete(y), I.add(y);
    }
  }
  for (const y of Object.keys(i)) _(y);
  !h.devices.length && !h.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const y of r) !y.source && y.line && n.origins[y.line - 1] && (y.source = n.origins[y.line - 1].file, y.line = n.origins[y.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: h.title || "", scopes: i, globals: [...c], diagnostics: r, layoutDescription: o.layout };
}
const le = () => /* @__PURE__ */ Object.create(null), ve = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), qe = (t, e) => ve(t.map((n) => n.toLowerCase()), e.toLowerCase());
function $t(t, e = []) {
  const n = le(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((i) => decodeURIComponent(i)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [i, c] of Object.entries(r.terminals)) o(c).terminals.push({ component: r.name, pin: i });
  for (const r of e) o(r);
  return n;
}
function qt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const st = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Xt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Ue(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (c) => (r.push(c), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (c, a, p) => {
    const h = p.split(",").map((g) => g.trim());
    if (h.some((g) => !g || /[\s{}+*()]/.test(g))) throw Error("Unsupported dynamic voltage/current reference: " + c);
    const u = a.toUpperCase() + "(" + h.map((g) => a.toLowerCase() === "v" ? n(g) : o(g, a)).join(",") + ")";
    return r.push(u), "@@" + (r.length - 1) + "@@";
  });
  let i = t.length;
  return t = t.replace(Xt, (c, a, p) => {
    if (p.slice(a + c.length).trimStart().startsWith("(")) return c;
    const h = e(c.toLowerCase());
    if (h === void 0) return c;
    if (i += h.length + 2, i > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + h + ")";
  }), t.replace(/@@(\d+)@@/g, (c, a) => r[Number(a)]);
}
function zt(t, e, n, o) {
  const r = { ...e, ...n }, i = le(), c = /* @__PURE__ */ new Set(), a = le();
  for (const [h, u] of Object.entries(o)) a[h] = Ue(st(u), (g) => t[g]);
  function p(h) {
    if (Object.hasOwn(a, h)) return a[h];
    if (Object.hasOwn(i, h)) return i[h];
    if (!Object.hasOwn(r, h)) return t[h];
    if (c.has(h)) {
      if (Object.hasOwn(t, h)) return t[h];
      throw Error("Circular parameter dependency: " + [...c, h].join(" → "));
    }
    return c.add(h), i[h] = Ue(st(r[h]), p), c.delete(h), i[h];
  }
  for (const h of Object.keys(r)) p(h);
  return Object.assign(le(), t, i, a);
}
function Xe(t, e, n, o) {
  let r = "";
  for (let p = 0; p < t.length; ) {
    const h = t[p];
    if (h !== "{" && h !== "'") {
      r += h, p++;
      continue;
    }
    const u = p++;
    let g = 1, d = "";
    for (; p < t.length && g; p++) {
      if (h === "'") {
        t[p] === "'" && (g = 0);
        continue;
      }
      if (d) {
        t[p] === d && (d = "");
        continue;
      }
      if (t[p] === '"' || t[p] === "'") {
        d = t[p];
        continue;
      }
      t[p] === "{" && g++, t[p] === "}" && g--;
    }
    if (g) throw Error("Unclosed parameter expression.");
    r += h + Ue(t.slice(u + 1, p - 1), (w) => e[w], n, o) + (h === "{" ? "}" : "'");
  }
  const i = [];
  let c = 0, a = "";
  for (let p = 0; p < r.length; p++) {
    const h = r[p];
    if (a) {
      h === a && r[p - 1] !== "\\" && (a = "");
      continue;
    }
    if (h === '"' || h === "'") {
      a = h;
      continue;
    }
    if ("({".includes(h) && c++, ")}".includes(h) && c--, !c && (p === 0 || /\s/.test(r[p - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(p));
      u && (i.push({ start: p, end: p + u[0].length, key: u[1].toLowerCase() }), p += u[0].length - 1);
    }
  }
  if (i.length) {
    let p = r.slice(0, i[0].start);
    i.forEach((h, u) => {
      const g = i[u + 1]?.start ?? r.length, d = r.slice(h.end, g);
      p += r.slice(h.start, h.end) + (d.includes("{") || ["refnode", "intnode"].includes(h.key) ? d : Ue(d, (w) => e[w], n, o));
    }), r = p;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class Yt {
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
class Kt {
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
  static addBinaryOp(e, n, o) {
    return O.max_binop_len = Math.max(e.length, O.max_binop_len), O.binary_ops[e] = n, o ? O.right_associative.add(e) : O.right_associative.delete(e), O;
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
      const o = { context: this, node: n };
      return O.hooks.run(e, o), o.node;
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
      return O.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
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
    let n = [], o, r;
    for (; this.index < this.expr.length; )
      if (o = this.code, o === O.SEMCOL_CODE || o === O.COMMA_CODE)
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
    let e, n, o, r, i, c, a, p, h;
    if (c = this.gobbleToken(), !c || (n = this.gobbleBinaryOp(), !n))
      return c;
    for (i = { value: n, prec: O.binaryPrecedence(n), right_a: O.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), r = [c, i, a]; n = this.gobbleBinaryOp(); ) {
      if (o = O.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      i = { value: n, prec: o, right_a: O.right_associative.has(n) }, h = n;
      const u = (g) => i.right_a && g.right_a ? o > g.prec : o <= g.prec;
      for (; r.length > 2 && u(r[r.length - 2]); )
        a = r.pop(), n = r.pop().value, c = r.pop(), e = {
          type: O.BINARY_EXP,
          operator: n,
          left: c,
          right: a
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + h), r.push(i, e);
    }
    for (p = r.length - 1, e = r[p]; p > 1; )
      e = {
        type: O.BINARY_EXP,
        operator: r[p - 1].value,
        left: r[p - 2],
        right: e
      }, p -= 2;
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
    if (e = this.code, O.isDecimalDigit(e) || e === O.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === O.SQUOTE_CODE || e === O.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === O.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, O.max_unop_len), o = n.length; o > 0; ) {
        if (O.unary_ops.hasOwnProperty(n) && (!O.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !O.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const i = this.gobbleToken();
          return i || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: O.UNARY_EXP,
            operator: n,
            argument: i,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
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
      let o;
      if (n === O.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== O.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
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
      } : (n === O.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: O.MEMBER_EXP,
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
    return o = this.code, O.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === O.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === O.PERIOD_CODE) && this.throwError("Unexpected period"), {
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
    const n = this.index, o = this.expr.charAt(this.index++);
    let r = !1;
    for (; this.index < this.expr.length; ) {
      let i = this.expr.charAt(this.index++);
      if (i === o) {
        r = !0;
        break;
      } else if (i === "\\")
        switch (i = this.expr.charAt(this.index++), i) {
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
            e += i;
        }
      else
        e += i;
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
    let o = !1, r = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let i = this.code;
      if (i === e) {
        o = !0, this.index++, e === O.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (i === O.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === O.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === O.CBRACK_CODE)
            for (let c = n.length; c < r; c++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const c = this.gobbleExpression();
        (!c || c.type === O.COMPOUND) && this.throwError("Expected comma"), n.push(c);
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
const Zt = new Yt();
Object.assign(O, {
  hooks: Zt,
  plugins: new Kt(O),
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
const Ie = (t) => new O(t).parse(), Jt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(O).filter((t) => !Jt.includes(t) && Ie[t] === void 0).forEach((t) => {
  Ie[t] = O[t];
});
Ie.Jsep = O;
const en = "ConditionalExpression";
var tn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), n.node = {
            type: en,
            test: o,
            consequent: r,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            n.node.test = c.right, c.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ie.plugins.register(tn);
const nn = "ConditionalExpression";
var rn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const i = this.gobbleExpression();
          if (i || this.throwError("Expected expression"), n.node = {
            type: nn,
            test: o,
            consequent: r,
            alternate: i
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let c = o;
            for (; c.right.operator && t.binary_ops[c.right.operator] <= 0.9; )
              c = c.right;
            n.node.test = c.right, c.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Ie.plugins.register(rn);
const on = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, at = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, fe = (t) => Number(t) > 0.5;
function Ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (p) => {
      if (p[0] === '"' || p[0] === "'") return p;
      const [, h, u, g] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(p), d = u.toLowerCase(), w = d.startsWith("meg") ? 1e6 : d.startsWith("mil") ? 254e-7 : on[d[0]] || 1;
      return "(" + (g ? +(h + (h.includes(".") ? "" : ".") + g) : Number(h)) * w + ")";
    }), i(Ie(a));
  }
  function i(a) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const p = a.name.toLowerCase();
      if (p === "pi") return Math.PI;
      if (p === "e") return Math.E;
      if (!Object.hasOwn(e, p)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(p)) throw Error("Circular structural parameter: " + p);
      n.add(p);
      const h = r(e[p]);
      return n.delete(p), h;
    }
    if (a.type === "ConditionalExpression") return fe(i(a.test)) ? i(a.consequent) : i(a.alternate);
    if (a.type === "UnaryExpression") {
      const p = i(a.argument);
      if (a.operator === "-") return -p;
      if (a.operator === "+") return +p;
      if (a.operator === "!" || a.operator === "~") return !fe(p);
    }
    if (a.type === "BinaryExpression") {
      const p = i(a.left);
      if (a.operator === "&&") return fe(p) && fe(i(a.right));
      if (a.operator === "||") return fe(p) || fe(i(a.right));
      const h = i(a.right);
      switch (a.operator) {
        case "+":
          return p + h;
        case "-":
          return p - h;
        case "*":
          return p * h;
        case "/":
          return p / h;
        case "**":
          return p ** h;
        case "%":
          return p % h;
        case "^":
          return fe(p) !== fe(h);
        case "&":
          return fe(p) && fe(h);
        case "|":
          return fe(p) || fe(h);
        case ">":
          return p > h;
        case "<":
          return p < h;
        case ">=":
          return p >= h;
        case "<=":
          return p <= h;
        case "==":
        case "===":
          return p === h;
        case "!=":
        case "!==":
          return p !== h;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const p = a.callee.name.toLowerCase();
      if (p === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return fe(i(a.arguments[0])) ? i(a.arguments[1]) : i(a.arguments[2]);
      }
      if (Object.hasOwn(at, p)) return at[p](...a.arguments.map(i));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const c = r(t);
  if (typeof c == "number" && !Number.isFinite(c)) throw Error("Structural expression is not finite.");
  return c;
}
function Ze(t, { isolate: e = "" } = {}) {
  qt(t);
  const n = le(), o = /* @__PURE__ */ new Map();
  let r = 0, i = 0;
  function c(a, p, h, u, g, d, w) {
    if (p.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[a], x = p.length ? ve(p.slice(0, -1), p.at(-1)) : "", I = le();
    if (e && x === e && (h = le()), w.some((C) => C.scopeId === a)) throw Error("Circular subcircuit reference at " + x);
    const _ = zt(u, E.defaults, E.parameters, g);
    function y(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const D = Ae(C, _);
        C = String(typeof D == "boolean" ? Number(D) : D);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const k = C.toLowerCase();
      return Object.hasOwn(h, k) ? h[k] : t.globals.includes(k) ? qe([], k) : I[k] || (I[k] = qe(p, k));
    }
    const v = { id: x, path: p, scopeId: a, name: d?.name || "Top", definition: E.name, ports: E.ports.map((C) => ({ name: C, node: y(C) })), params: _, nodes: I, models: le(), devices: [], children: [], raw: d?.raw || "", line: d?.line || 0 };
    n[x] = v, o.set(x, y);
    const S = [...w, v];
    function M(C) {
      if (!C) return "";
      let k = E;
      for (; k; ) {
        if (k.directives.some((D) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(D.text))) {
          const D = [...S].reverse().find((m) => m.scopeId === k.id);
          return ve(D?.path || [], C.toLowerCase());
        }
        k = t.scopes[k.parent];
      }
      return C;
    }
    for (const C of E.directives.filter((k) => /^\.model\b/i.test(k.text))) {
      const k = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!k) continue;
      const D = M(k), m = E.models[k.toLowerCase()], f = Xe(C.text, _, y, (P) => ve(p, P));
      v.models[D] = { ...m, name: D, raw: f.replace(/^(\.model\s+)\S+/i, (P, q) => q + D), instanceId: x, parameters: _ };
    }
    for (const C of E.devices) {
      if (++i > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const k = le();
      for (const [m, f] of Object.entries(C.terminals)) k[m] = y(f);
      const D = M(C.model);
      v.devices.push({ ...C, name: ve(p, C.name), localName: C.name, instanceId: x, terminals: k, model: D, parameters: _ });
    }
    for (const C of E.instances) {
      let k = C.definitionId;
      if (!k) {
        const P = String(Ae(C.definitionName, _)).toLowerCase();
        let q = E;
        for (; q && !k; )
          k = q.definitions[P], q = t.scopes[q.parent];
        if (!k) throw Error("Undefined selected subcircuit: " + P);
      }
      const D = t.scopes[k], m = le();
      if (D.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + D.ports.length + " ports; got " + C.nodes.length);
      D.ports.forEach((P, q) => {
        m[P.toLowerCase()] = y(C.nodes[q]);
      });
      const f = c(k, [...p, C.name], m, _, C.parameters, C, S);
      C.pinNames?.length === f.ports.length && f.ports.forEach((P, q) => {
        P.label = C.pinNames[q];
      }), v.children.push(f);
    }
    return v;
  }
  try {
    let g = function(d, w) {
      const E = w.split(":");
      if (E.length === 1) return { owner: d, name: w };
      const x = E.pop();
      for (const I of [[...d.path, ...E], E]) {
        const _ = p.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (_) return { owner: _, name: x };
      }
      throw Error("Unknown hierarchical reference: " + w);
    };
    const a = c(t.rootId, [], le(), le(), le(), null, []), p = new Map(Object.values(n).map((d) => [d.id.toLowerCase(), d])), h = Object.assign(le(), ...Object.values(n).map((d) => d.models)), u = (d) => h[d] || Object.entries(h).find(([w]) => w.startsWith(d + "."))?.[1];
    for (const d of Object.values(n)) for (const w of d.devices) {
      const E = t.scopes[d.scopeId].devices.find((_) => _.name === w.localName), x = (_) => {
        const y = g(d, _);
        return o.get(y.owner.id)(y.name);
      }, I = (_, y = "", v = "") => {
        const S = g(d, _), M = S.owner.devices.find((C) => C.localName.toLowerCase() === S.name.toLowerCase());
        if (y.toLowerCase() === "ix") {
          const C = S.owner.ports.find((k, D) => k.name.toLowerCase() === S.name.toLowerCase() || String(D + 1) === S.name);
          if (C) return S.owner.id + ":" + C.name;
        }
        if (!M) {
          if (v) throw Error(w.name + ": referenced " + v + " device " + _ + " was not found.");
          return ve(S.owner.path, S.name);
        }
        if (v && M.kind !== v) throw Error(w.name + ": " + _ + " must be a " + v + " device.");
        return M.name;
      };
      if (w.value = Xe(E.value, d.params, x, I), E.model && (w.value = w.value.replace(E.model, w.model)), w.kind === "M" && Object.keys(w.terminals).length === 3) {
        let _ = u(w.model), y = !1;
        const v = /* @__PURE__ */ new Set();
        for (; _?.type === "VDMOS" && !v.has(_.name); ) {
          v.add(_.name);
          const S = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(_.raw);
          if (S) {
            y = S[1] === void 0 || Number(Ae(S[1], _.parameters)) >= 0.5;
            break;
          }
          const M = _.name.includes("/") ? _.name.slice(0, _.name.lastIndexOf("/") + 1) : "";
          _ = u(M + (_.baseModel || "").toLowerCase()) || u((_.baseModel || "").toLowerCase());
        }
        v.size && (w.type = "spice_" + (y ? "pmos3" : "nmos3"));
      }
      w.controlSources = (E.controlSources || []).map((_) => I(_, "", "V")), w.controlSource = w.controlSources[0] || "", w.coupledInductors = (E.coupledInductors || []).map((_) => I(_, "", "L"));
      for (const _ of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const y = _.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        w.value = w.value.replace(new RegExp("(?<![\\w./%])" + y + "(?![\\w.$])", "g"), () => I(_));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: a, contexts: n };
  } catch (a) {
    throw a.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: a.message }], a;
  }
}
function Ce(t) {
  return [...t.devices, ...t.children.flatMap(Ce)];
}
function Se(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Je(t, e = {}) {
  const n = new Map(t.components.map((m) => [m.name, m])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = [], c = (m, f) => JSON.stringify([m, f].sort()), a = (m) => e[m]?.potential !== null && e[m]?.potential !== void 0;
  for (const m of t.components) {
    for (const [b, T] of Object.entries(m.terminals))
      o.has(T) || o.set(T, []), o.get(T).push({ device: m.name, pin: b });
    if (m.kind === "R") {
      const b = Object.values(m.terminals);
      if (b.length === 2 && b[0] !== b[1]) {
        const T = c(...b);
        r.has(T) || r.set(T, []), r.get(T).push(m);
      }
    }
    const f = m.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(m.kind) ? "fet" : null, P = f === "bjt" ? /_(npn|pnp)$/.exec(m.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(m.type)?.[1];
    if (!f || !P) continue;
    const q = m.terminals, G = q[f === "bjt" ? "B" : "G"], z = q[f === "bjt" ? "C" : "D"], ne = q[f === "bjt" ? "E" : "S"];
    [G, z, ne].some((b) => b === void 0) || G === ne || z === ne || i.push({ id: m.name, family: f, polarity: P, control: G, drain: z, source: ne, body: m.kind === "M" ? q.B : void 0 });
  }
  const p = [], h = /* @__PURE__ */ new Set(), u = (m, f, P, q, G, z = "basic", ne = [], b = "high") => {
    const T = [.../* @__PURE__ */ new Set([...f, ...ne])], F = JSON.stringify([m, z, [...T].sort()]);
    h.has(F) || (h.add(F), p.push({ id: "motif" + p.length, kind: m, variant: z, transistors: f, members: T, roles: P, nets: q, evidence: G, confidence: b }));
  }, g = (m, f) => m.family === f.family && m.polarity === f.polarity, d = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), x = new Map(i.map((m) => [m.id, m])), I = (m, f, P) => {
    m.has(f) || m.set(f, []), m.get(f).push(P);
  }, _ = (m, f) => JSON.stringify([m.family, m.polarity, f]);
  for (const m of i)
    I(d, _(m, m.control), m), I(w, _(m, m.source), m), m.family === "bjt" && (o.get(m.source) || []).some((f) => {
      const P = x.get(f.device);
      return P && P.family === "bjt" && !g(m, P) && P.source === m.source;
    }) && I(E, _(m, m.drain), m);
  const y = (m) => [{ node: m.source, resistor: null }, ...(o.get(m.source) || []).flatMap((f) => {
    const P = n.get(f.device);
    if (P.kind !== "R") return [];
    const q = Object.values(P.terminals).find((G) => G !== m.source);
    return q !== void 0 && q !== m.control && q !== m.drain ? [{ node: q, resistor: P.name }] : [];
  })];
  for (const m of i) m.control === m.drain && u("diode-connected", [m.id], { reference: m.id }, { control: m.control, return: m.source }, ["control-drain-short", m.family]);
  for (const m of i) {
    const f = d.get(_(m, m.control));
    if (f.filter((b) => b.control === b.drain).length > 1) continue;
    let P = null;
    if (m.control !== m.drain && m.family === "bjt" && (P = (d.get(_(m, m.drain)) || []).find((b) => b.id !== m.id && g(b, m) && b.control === m.drain && b.source === m.control && a(b.drain))), m.control !== m.drain && !P) continue;
    const q = y(m), G = [];
    let z = null, ne = [];
    for (const b of f) {
      if (b.id === m.id || b.id === P?.id || b.drain === m.drain || b.drain === b.control) continue;
      const T = q.flatMap((F) => y(b).filter((U) => F.node === U.node).map((U) => ({ node: F.node, rs: [F.resistor, U.resistor].filter(Boolean) }))).find((F) => z === null || F.node === z);
      T && (z = T.node, G.push(b.id), ne.push(...T.rs));
    }
    if (G.length) {
      const b = G.every((T) => x.get(T).body === m.body);
      u("current-mirror", [m.id, ...G, ...P ? [P.id] : []], { reference: m.id, outputs: G, ...P ? { helper: P.id } : {} }, { control: m.control, return: z }, ["same-polarity", "shared-control", P ? "emitter-follower-reference" : "diode-reference", ne.length ? "resistive-common-return" : "shared-return", b ? "compatible-bodies" : "different-body-connections"], P ? "assisted" : ne.length ? "degenerated" : "basic", [...ne, ...P ? [P.id] : []], b ? "high" : "medium");
    }
  }
  const v = [], S = /* @__PURE__ */ new Set(), M = (m, f) => {
    const P = JSON.stringify([m.id, f.id].sort());
    S.has(P) || (S.add(P), v.push([m, f]));
  };
  for (const m of w.values()) if (!a(m[0].source)) {
    const f = m.filter((P) => P.control !== P.drain);
    f.length === 2 ? M(...f) : f.length > 2 && new Set(f.map((P) => P.control)).size > 1 && u("differential-pair", f.map((P) => P.id), { inputs: f.map((P) => P.id) }, { tail: f[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const m of E.values()) for (let f = 0; f < m.length; f++) for (let P = f + 1; P < m.length; P++) M(m[f], m[P]);
  for (const [m, f] of v) {
    if (m.control === f.control || m.control === m.drain || f.control === f.drain) continue;
    if (m.source === f.source && m.drain !== f.drain && !a(m.source)) {
      const G = (o.get(m.source) || []).some((ne) => ne.device !== m.id && ne.device !== f.id), z = w.get(_(m, m.source)).length === 2;
      u("differential-pair", [m.id, f.id], { inputs: [m.id, f.id] }, { tail: m.source }, ["same-polarity", "distinct-controls", "shared-tail", G ? "tail-bias-connection" : "unbiased-tail", z ? "two-input-tail" : "multi-input-tail"], "basic", [], G && z && m.body === f.body ? "high" : "medium");
    }
    if (m.family !== "bjt" || m.drain !== f.drain || m.source === f.source) continue;
    const P = i.filter((G) => G.family === "bjt" && G.polarity !== m.polarity && G.source === m.source), q = i.filter((G) => G.family === "bjt" && G.polarity !== m.polarity && G.source === f.source);
    for (const G of P) for (const z of q) G.id !== z.id && G.control === z.control && G.drain !== z.drain && G.control !== G.drain && z.control !== z.drain && u("differential-pair", [m.id, f.id, G.id, z.id], { inputs: [m.id, f.id], commonBase: [G.id, z.id] }, { inputCollectors: m.drain, bias: G.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const m of i) if (m.family === "bjt" && m.control !== m.drain) {
    const f = r.get(c(m.drain, m.control)) || [], P = r.get(c(m.control, m.source)) || [];
    f.length === 1 && P.length === 1 && u("vbe-multiplier", [m.id], { transistor: m.id, collectorResistor: f[0].name, emitterResistor: P[0].name }, { control: m.control, collector: m.drain, emitter: m.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [f[0].name, P[0].name]);
  }
  const C = i.filter((m) => m.family === "bjt"), k = /* @__PURE__ */ new Map();
  for (const m of C) I(k, m.control, m);
  const D = (m) => (o.get(m) || []).filter((f) => x.has(f.device));
  for (const m of C) if (m.control !== m.drain) {
    for (const f of k.get(m.source) || []) if (f.id !== m.id && g(m, f) && f.drain === m.control && f.source !== m.drain) {
      const P = r.get(c(m.source, f.source)) || [];
      P.length === 1 && u("current-limit-pair", [m.id, f.id], { driver: m.id, output: f.id, senseResistor: P[0].name }, { sense: m.source, drive: m.control, output: f.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [P[0].name]);
    }
    for (const f of k.get(m.source) || []) f.id !== m.id && g(m, f) && f.control !== f.drain && m.drain === f.drain && f.source !== m.control && u("darlington-pair", [m.id, f.id], { driver: m.id, output: f.id }, { link: m.source, collector: m.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (k.get(m.source) || []).length === 1 ? "high" : "medium");
    for (const f of k.get(m.drain) || []) f.id !== m.id && !g(m, f) && f.control !== f.drain && m.source === f.drain && f.source !== m.control && D(m.drain).length === 2 && u("sziklai-pair", [m.id, f.id], { driver: m.id, output: f.id }, { link: m.drain, feedback: m.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const f of o.get(m.drain) || []) {
      const P = x.get(f.device);
      !P || P.family !== "bjt" || P.id === m.id || !g(m, P) || P.source !== m.drain || a(m.drain) || P.control === m.control || P.control === P.drain || P.drain === m.source || D(m.drain).length !== 2 || u("cascode-pair", [m.id, P.id], { driver: m.id, output: P.id }, { link: m.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const m of C.filter((f) => f.polarity === "npn" && a(f.drain))) for (const f of C.filter((P) => P.polarity === "pnp" && a(P.drain))) {
    if (e[m.drain].potential <= e[f.drain].potential) continue;
    const P = y(m).flatMap((q) => y(f).filter((G) => q.node === G.node && !a(q.node)).map((G) => ({ node: q.node, rs: [q.resistor, G.resistor].filter(Boolean) })))[0];
    P && u("push-pull-pair", [m.id, f.id], { upper: m.id, lower: f.id }, { output: P.node }, ["complementary-polarity", "ordered-collector-supplies", P.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", P.rs);
  }
  return p;
}
function et(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([i, c]) => [i, o(c)])), nets: Object.fromEntries(Object.entries(r.nets).map(([i, c]) => [i, n(c)])) }));
}
function sn(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), i = new Map(t.components.map((c) => [c.name, c]));
  for (const c of n) {
    if (new Set(c.members).size !== c.members.length) throw Error("Duplicate @layout pair member.");
    const a = c.members.map((d) => i.get(d));
    if (a.some((d) => !d)) throw Error("Unknown @layout pair device.");
    const p = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[c.kind], h = c.kind === "differential" && a.length === 2 ? t.components.filter((d) => !c.members.includes(d.name) && Object.values(d.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], u = Je({ ...t, components: [...a, ...h] }, e), g = u.find((d) => d.kind === p && d.confidence === "high" && c.members.every((w) => d.members.includes(w)));
    if (!g) throw Error("Invalid @layout pair " + c.kind + " { " + c.members.join(" ") + " }: electrical structure does not match.");
    for (const d of u.filter((w) => w === g || w.kind === "diode-connected" && w.members.every((E) => g.members.includes(E)))) {
      const w = JSON.stringify([d.kind, [...d.members].sort()]);
      r.has(w) || (r.add(w), o.push({ ...d, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function an(t, e, n = Je(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((d) => d.kind === "R"), i = t.components.filter((d) => d.kind === "Q"), c = new Map(t.components.map((d) => [d.name, d])), a = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), h = (d) => Object.values(d.terminals), u = (d, w, E) => {
    d && o.set(d.name, { reverse: h(d)[0] !== w, reason: E });
  };
  for (const d of i) {
    const { C: w, B: E, E: x } = d.terminals, I = d.type.endsWith("pnp"), _ = d.type.endsWith("npn");
    !I && !_ || (a.has(x) || a.set(x, []), a.get(x).push(d), w === E && e[x]?.potential !== null && e[x]?.potential !== void 0 && p.set(w, { potential: e[x].potential }));
  }
  for (const d of n) if (d.kind === "vbe-multiplier" && d.confidence === "high") {
    const w = c.get(d.roles.transistor), E = w.type.endsWith("pnp"), x = c.get(E ? d.roles.emitterResistor : d.roles.collectorResistor), I = c.get(E ? d.roles.collectorResistor : d.roles.emitterResistor);
    u(x, w.terminals[E ? "E" : "C"], "recognized VBE multiplier"), u(I, w.terminals.B, "recognized VBE multiplier");
  }
  for (const d of r) {
    const [w, E] = h(d), x = p.get(w), I = p.get(E);
    x && I && x.potential !== I.potential && u(d, x.potential > I.potential ? w : E, "diode-connected bias reference");
  }
  const g = /* @__PURE__ */ new Map();
  for (const d of r) {
    const w = h(d);
    if (!w.some((E) => e[E]?.potential !== null && e[E]?.potential !== void 0))
      for (const E of w)
        g.has(E) || g.set(E, []), g.get(E).push(d);
  }
  for (const [d, w] of g)
    if (!(w.length > 12))
      for (const E of w) for (const x of w) {
        if (E === x) continue;
        const I = h(E).find((S) => S !== d), _ = h(x).find((S) => S !== d), y = a.get(I)?.find((S) => S.type.endsWith("npn")), v = a.get(_)?.find((S) => S.type.endsWith("pnp"));
        y && v && (u(E, I, "complementary emitter output"), u(x, d, "complementary emitter output"));
      }
  return o;
}
function cn(t) {
  const e = t.components.filter((i) => i.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((i) => i.kind === "R").map((i) => Object.values(i.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const i of e) {
    const c = i.terminals.E;
    n.has(c) || n.set(c, []), n.get(c).push(i);
  }
  for (const i of e) {
    const { B: c, C: a, E: p } = i.terminals;
    if (c === p || !o.has([c, p].sort().join("|"))) continue;
    const h = n.get(c) || [];
    if (!(h.length > 16))
      for (const u of h) {
        if (u === i) continue;
        if (u.terminals.B === a) {
          r.add(i.name);
          break;
        }
        const g = n.get(u.terminals.B) || [];
        if (g.length <= 16 && g.some((d) => d !== i && d !== u && d.terminals.B === a)) {
          r.add(i.name);
          break;
        }
      }
  }
  return r;
}
const ze = 22;
function Ye(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const Re = (t) => ["pwr", "ret", "bias"].includes(t), ln = (t) => String(t).split("/").at(-1).toLowerCase(), wt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[ln(t)] || "unknown", ct = (t) => {
  const e = Ye(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || wt(t);
};
function un(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (c, a, p) => {
    e.has(c) || e.set(c, []), e.get(c).push({ node: a, delta: p });
  };
  for (const c of t)
    if (c.kind === "V")
      try {
        let a = c.value.trim();
        const p = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (p && Number(Ae(p[1], c.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const h = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!h) continue;
        const u = Ae(h[1], c.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        o(c.terminals["-"], c.terminals["+"], u), o(c.terminals["+"], c.terminals["-"], -u);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ new Set();
  for (const c of ["0", ...e.keys()]) {
    if (i.has(c)) continue;
    const a = /* @__PURE__ */ new Map([[c, 0]]), p = [c];
    i.add(c);
    let h = !1;
    for (let u = 0; u < p.length; u++) for (const g of e.get(p[u]) || []) {
      const d = a.get(p[u]) + g.delta;
      a.has(g.node) ? Math.abs(a.get(g.node) - d) > 1e-8 * Math.max(1, Math.abs(d)) && (h = !0) : (a.set(g.node, d), i.add(g.node), p.push(g.node));
    }
    h && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, g] of a) r[u] = { value: g, reference: c, known: c === "0" && !h, consistent: !h };
  }
  return { nodes: r, diagnostics: n };
}
function dn(t, e, n = null) {
  const o = un(Ce(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const g = Ye(u.name), d = wt(u.name);
    r[u.name] = { role: g !== "unknown" ? g : d, roleSource: g !== "unknown" ? "node-name" : d !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[u.name]?.known ? o.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const g = r[u.local], d = ct(u.port);
    g && g.potential === null && ["pwr", "ret"].includes(d) && (g.potential = d === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, g.potentialSource = "symbolic-port-order");
  }
  const c = n?.pairs?.length ? sn(e, r, n.pairs) : Je(e, r), a = an(e, r, c), p = cn(e), h = (u, g, d) => {
    const w = { role: r[d].role, roleSource: r[d].roleSource }, E = u.block?.ports.find((_) => _.pin === g);
    if (E?.implicit || !u.block && !u.synthetic) return w;
    const x = u.synthetic ? u.value : E?.name || E?.label, I = ct(x);
    return I !== "unknown" ? { role: I, roleSource: Ye(x) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : Re(w.role) ? { ...w, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const g = Object.fromEntries(Object.entries(u.terminals).map(([D, m]) => [D, { ...r[m], ...h(u, D, m) }])), d = Object.values(g), w = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), E = w && !a.has(u.name) && d.length === 2 && d.every((D) => !Re(D.role) && (D.potential === null || D.role !== "unknown")), x = u.terminals["+"], I = u.terminals["-"], _ = [x, I].filter((D) => D && D !== "0"), y = u.kind === "V" && _.some((D) => Re(r[D]?.role)) && !_.some((D) => ["in", "out", "io", "fb"].includes(r[D]?.role)) && [x, I].every((D) => o.nodes[D]?.known), v = x === "0" ? I : x, S = Object.keys(u.terminals), M = (D) => Re(D.role) ? D.potential !== null ? D.potential > 0 ? "high" : "low" : D.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    S.length === 2 && (u.kind === "V" && d.every((D) => D.potential !== null) ? C = d[0].potential < d[1].potential : u.terminals[S[0]] === "0" ? C = !0 : u.terminals[S[1]] === "0" ? C = !1 : d.every((D) => D.potential !== null) ? C = d[0].potential < d[1].potential : C = M(d[0]) === "low" || M(d[1]) === "high" && M(d[0]) === "signal"), a.has(u.name) && (C = a.get(u.name).reverse);
    const k = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    i[u.name] = { version: ze, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: p.has(u.name), orientationReason: a.get(u.name)?.reason || null, owner: k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : "", passive: w, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !w, ports: g, horizontal: E, orientation: E ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: S.length === 2 && (w || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!y, voltage: y ? o.nodes[v].value : null };
  }
  return { version: ze, nodes: r, cells: i, motifs: c, diagnostics: o.diagnostics };
}
function Et(t, e) {
  const n = e.ports.map((r, i) => ({ pin: "P" + i, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(Ce(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const i = qe([], r);
    o.has(i) && !n.some((c) => c.node === i) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: i, implicit: !0 });
  }
  return n;
}
function fn(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, i = t.contexts[o];
  if (!i) throw Error("Unknown instance: " + o);
  o && (t = Ze(t.ir, { isolate: o }));
  const c = t.contexts[o];
  if (!c) throw Error("Unknown instance: " + o);
  const a = [], p = [];
  function h(E) {
    p.push(...Object.values(E.nodes), ...E.ports.map((I) => I.node));
    const x = [...E.devices.map((I) => ({ line: I.line, device: I })), ...E.children.map((I) => ({ line: I.line, child: I }))].sort((I, _) => I.line - _.line);
    for (const I of x) {
      if (I.device) {
        const S = I.device;
        a.push({ ...S, layoutLabel: [...E.path.slice(c.path.length), S.localName].join("/") });
        continue;
      }
      const _ = I.child;
      if (e === "flat" || n.has(_.id)) {
        h(_);
        continue;
      }
      const y = Et(t, _), v = le();
      y.forEach((S) => {
        v[S.pin] = S.node;
      }), a.push({ name: _.id, kind: "X", type: "spice_subckt", terminals: v, value: _.definition, raw: _.raw, line: _.line, instanceId: _.id, layoutLabel: _.path.slice(c.path.length).join("/"), block: { definitionId: _.scopeId, ports: y, parameters: _.params } });
    }
  }
  h(c);
  for (const [E, x] of c.ports.entries()) a.push({ name: "@port/" + o + "/" + E, kind: "PORT", type: "spice_port", terminals: { A: x.node }, layoutLabel: x.name, value: x.name, raw: "Interface port " + x.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(le(), ...Object.values(t.contexts).map((E) => E.models)), g = { title: o || t.ir.title, components: a, nodes: $t(a, p), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  g.interfaceBindings = c.ports.map((E, x) => ({ port: E.name, local: E.node, parent: i.ports[x].node }));
  const d = /* @__PURE__ */ new Map();
  for (const E of i.ports)
    d.has(E.node) || d.set(E.node, []), d.get(E.node).push(E.name);
  g.interfaceAliases = [...d].filter(([, E]) => E.length > 1).map(([E, x]) => ({ node: E, ports: x })), g.topology = pn(r, g);
  const w = Ht(t, g);
  return g.layout = dn(t, g, w), g.layout.description = w, g;
}
function pn(t, e) {
  const n = Ce(t.contexts[e.focus]);
  e.localScope && (t = Ze(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const p = t.contexts[a.instanceId];
        if (!p) throw Error("Projection contains an unknown block.");
        const h = Et(t, p);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(h.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + a.name);
        o.push(...Ce(p));
      } else o.push(a);
  for (const a of o) {
    if (r.has(a.name)) throw Error("Projection duplicates " + a.name);
    r.add(a.name);
  }
  const i = Se(o), c = Ce(t.contexts[e.focus]);
  if (i !== Se(c)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), p = (u) => a.get(u) ?? u, h = o.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([g, d]) => [g, p(d)])), value: Xe(u.value, {}, p, (g) => g) }));
    if (Se(h) !== Se(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: i, boundSignature: Se(n), boundaryVerified: !0 };
}
function lt(t) {
  const e = le(), n = le();
  for (const o of t.components) {
    const r = le(), i = le();
    for (const [c, a] of Object.entries(o.terminals))
      r[c] = [t.nodes[a].bit], i[c] = "input";
    e[o.name] = { type: o.type, port_directions: i, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((c) => ({ pin: c.pin, label: c.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((c, a) => ({ pin: c, label: o.pinLabels?.[a] || c })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: et(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function hn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (h) => (n.has(h) || n.set(h, n.size + 2), n.get(h));
  Object.entries(t.modules.circuit.cells).forEach(([h, u], g) => {
    const d = "c" + g;
    e.set(d, h);
    const w = Object.fromEntries(Object.entries(u.connections).map(([E, x]) => [E, x.map(r)]));
    o[d] = { type: u.type, connections: w, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (o[d].spiceBlock = u.spiceBlock), u.spiceSymbol && (o[d].spiceSymbol = u.spiceSymbol), u.spiceLayout && (o[d].spiceLayout = u.spiceLayout);
  });
  const i = new Map([...e].map(([h, u]) => [u, h])), c = t.modules.circuit.spiceLayoutDescription, a = c ? { ...c, faces: (c.faces || []).map((h) => ({ ...h, device: i.get(h.device) })), pairs: (c.pairs || []).map((h) => ({ ...h, members: h.members.map((u) => i.get(u)) })), groups: c.groups.map((h) => ({ ...h, members: h.members.map((u) => u.cell ? { ...u, cell: i.get(u.cell) } : u) })), relations: c.relations.map((h) => ({ ...h, a: i.get(h.a) || h.a, b: i.get(h.b) || h.b })) } : null, p = et(t.modules.circuit.spiceMotifs || [], (h) => i.get(h), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: p, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([h, u]) => [u, h])) };
}
const Ee = /* @__PURE__ */ new Map();
async function mn(t, e) {
  const n = hn(t), o = JSON.stringify([n.netlist, e]);
  let r = Ee.get(o);
  r ? (Ee.delete(o), Ee.set(o, r)) : (r = await gn(n.netlist, e), r.svg.length < 1e6 && (Ee.set(o, r), Ee.size > 20 && Ee.delete(Ee.keys().next().value)));
  const i = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (i.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const p of i.querySelectorAll("[id],[class]")) {
    const h = p.getAttribute("id");
    h?.startsWith("cell_") && n.ids.has(h.slice(5)) && p.setAttribute("id", "cell_" + n.ids.get(h.slice(5)));
    const u = p.getAttribute("class");
    u && p.setAttribute("class", u.split(/\s+/).map((g) => g.startsWith("cell_") && n.ids.has(g.slice(5)) ? "cell_" + n.ids.get(g.slice(5)) : /^net_\d+$/.test(g) && n.bits.has(Number(g.slice(4))) ? "net_" + n.bits.get(Number(g.slice(4))) : g).join(" "));
  }
  const c = r.drawing ? structuredClone(r.drawing) : null, a = i.querySelector("#spice-layout-report");
  if (a) {
    const p = JSON.parse(a.textContent), h = (u) => n.ids.get(u) || u;
    p.mirroredTransistors = (p.mirroredTransistors || []).map(h), p.orientationDevicesTested = (p.orientationDevicesTested || []).map(h), p.recognizedMotifs = et(p.recognizedMotifs || [], h, (u) => n.bits.get(u) ?? u), p.inputAttachments = (p.inputAttachments || []).map(h), p.mirroredInputPorts = (p.mirroredInputPorts || []).map(h);
    for (const u of [...p.flippedPairs || [], ...p.pairOrientationTrials || []]) u.members = u.members.map(h);
    for (const u of p.pairCompactions || [])
      u.members = u.members.map(h), u.moved = h(u.moved);
    for (const u of p.pairConstraints || []) u.members = u.members.map(h);
    for (const u of p.pairProximity || []) u.members = u.members.map(h);
    for (const u of p.motifMeasurements || [])
      u.members = u.members.map(h), u.interlopers && (u.interlopers = u.interlopers.map(h));
    for (const u of p.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    a.textContent = JSON.stringify(p);
  }
  if (c) {
    for (const p of c.components) {
      p.id = n.ids.get(p.id) || p.id;
      for (const h of p.ports) h.bit = n.bits.get(h.bit) ?? h.bit;
    }
    for (const p of c.segments) p.bit = n.bits.get(p.bit) ?? p.bit;
  }
  return { svg: new XMLSerializer().serializeToString(i.documentElement), drawing: c };
}
function gn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const i = (p, h) => {
      clearTimeout(a), n.terminate(), p ? r(Error(p)) : o(h);
    }, c = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => i("Layout timed out. Open a subcircuit sheet or collapse instances."), c);
    n.onmessage = ({ data: p }) => i(p.error, { svg: p.svg, drawing: p.drawing }), n.onerror = (p) => i(p.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const bn = `* RLC low-pass filter
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
`, yn = `* Voltage-divider biased common-emitter amplifier.
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
`, wn = `* Common-collector voltage follower; independently chosen example values.
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
`, En = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, xn = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
  filter: { source: bn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: yn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: wn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: En, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: xn, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function _n(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function ut(t) {
  return _n(await t.arrayBuffer());
}
const xt = [
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
].flat(), tt = "#292b29", Be = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => xt[e * 9 + t]))])], dt = (t) => /^#[\da-f]{6}$/i.test(t), ft = "spice-node-colors-v1";
function vn(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class Nn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = vn(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Be[this.assigned.size % Be.length]), this.assigned.get(e)) : tt;
  }
  set(e, n) {
    if (!dt(n)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && dt(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Cn(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const i = o.get(r.getAttribute("data-net"));
    if (!i) continue;
    r.style.setProperty("stroke", i, "important"), r.localName === "circle" && r.style.setProperty("fill", i, "important");
  }
}
function In(t, e) {
  const n = new Nn(), o = /* @__PURE__ */ new Set();
  let r = [], i = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(ft) || "null"));
  } catch {
  }
  const c = () => {
    try {
      sessionStorage.setItem(ft, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const d = t("node-search").value.trim().toLowerCase();
    return r.filter((w) => !d || [w.name, w.displayName, ...w.terminals.map((E) => E.component + "." + E.pin)].some((E) => E.toLowerCase().includes(d)));
  };
  function p() {
    const d = a(), w = d.filter((E) => o.has(E.name)).length;
    t("node-count").textContent = `${d.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!d.length && w === d.length, t("node-all").indeterminate = w > 0 && w < d.length, t("node-auto").checked = n.auto;
    for (const E of ["node-apply", "node-clear"]) t(E).disabled = !i || !o.size;
    t("node-all").disabled = !i || !d.length;
  }
  function h() {
    t("nets").replaceChildren(...a().map((d) => {
      const w = document.createElement("tr");
      w.dataset.node = d.name;
      const E = document.createElement("td"), x = document.createElement("input");
      x.type = "checkbox", x.checked = o.has(d.name), x.disabled = !i, x.setAttribute("aria-label", "Select node " + d.displayName), x.onchange = () => {
        x.checked ? o.add(d.name) : o.delete(d.name), p();
      }, E.append(x);
      const I = document.createElement("td");
      I.textContent = d.displayName;
      const _ = document.createElement("td"), y = document.createElement("input");
      y.type = "color", y.value = n.color(d.name), y.disabled = !i, y.setAttribute("aria-label", "Wire color for " + d.displayName), y.onchange = () => {
        n.set([d.name], y.value), u();
      }, _.append(y);
      const v = document.createElement("td");
      return v.textContent = d.terminals.map((S) => S.component + "." + S.pin).join(", "), w.append(E, I, _, v), w;
    })), p();
  }
  function u() {
    for (const d of r) n.color(d.name);
    h(), c(), e(n, r);
  }
  t("node-search").oninput = h, t("node-all").onchange = () => {
    for (const d of a()) t("node-all").checked ? o.add(d.name) : o.delete(d.name);
    h();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, u();
  }, t("node-apply").onclick = () => {
    n.set(o, t("node-color").value), u();
  }, t("node-clear").onclick = () => {
    n.set(o, tt), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...xt.map((d) => {
    const w = document.createElement("button");
    return w.type = "button", w.style.backgroundColor = d, w.title = d, w.setAttribute("aria-label", "Apply palette color " + d), w.onclick = () => {
      o.size && (t("node-color").value = d, n.set(o, d), u());
    }, w;
  }));
  function g(d) {
    i = d;
    for (const w of t("node-panel").querySelectorAll("input,button")) w.disabled = !i;
    p();
  }
  return { setCircuit(d, w) {
    const E = n.sourceId;
    n.setSource(w), E !== n.sourceId && o.clear(), r = Object.values(d?.nodes || {});
    const x = new Set(r.map((I) => I.name));
    for (const I of o) x.has(I) || o.delete(I);
    for (const I of r) n.color(I.name);
    i = !!d, h(), g(i), c(), e(n, r);
  }, setEnabled: g };
}
function Tn(t) {
  const e = (b) => t.querySelector("#spice-" + b), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, i = Object.fromEntries(Object.keys(r).map((b) => [b, t.querySelector(`[data-window-handle="${b}"]`)])), c = { editor: !0, details: !0, info: !0 }, a = { editor: !0, details: !0, info: !0 }, p = [], h = { editor: {}, details: {}, info: {} }, u = [];
  let g = !1, d = !1, w = null, E = null, x = null, I = null;
  function _(b, T) {
    a[b] = T, r[b].dataset.pinned = String(T);
    const F = e("pin-" + b), U = { editor: "netlist", details: "details", info: "messages" }[b], W = b === "info" ? "bottom edge" : b === "details" ? "lower left" : "left edge", j = T ? `Unpin ${U} from ${W}` : `Pin ${U} to ${W}`;
    if (F.setAttribute("aria-pressed", String(T)), F.setAttribute("aria-label", j), F.title = j, T) for (const V of ["left", "top", "right", "bottom", "width", "height"]) r[b].style.removeProperty(V);
    g && requestAnimationFrame(m);
  }
  for (const b of Object.keys(r)) _(b, !0);
  const y = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: g, panels: { ...c } } })), v = (b, T, F, U = {}) => b.addEventListener(T, F, { ...U, signal: o });
  function S(b, T) {
    c[b] = T, r[b].hidden = g && !T, requestAnimationFrame(m), y();
  }
  function M(b, T = e("details-content")) {
    const F = document.createComment("workspace return");
    b.before(F), p.push({ node: b, anchor: F }), T === e("details-content") ? T.prepend(b) : T.append(b);
  }
  function C(b) {
    const T = b.getBoundingClientRect(), F = t.getBoundingClientRect();
    return { x: T.left - F.left, y: T.top - F.top, w: T.width, h: T.height, width: F.width, height: F.height };
  }
  function k(b, T, F) {
    const U = C(b), W = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, j = Math.max(8, Math.min(T, U.width - U.w - 8)), V = Math.max(8, Math.min(W, U.height - U.h - 8)), te = Math.max(V, Math.min(F, U.height - U.h - 8));
    b.style.left = Math.round(j) + "px", b.style.top = Math.round(te) + "px", b.style.right = "auto", b.style.bottom = "auto";
  }
  function D() {
    if (!g || !a.info || r.info.hidden) return;
    const b = t.getBoundingClientRect(), T = b.width <= 600 ? 8 : 12, F = b.width <= 600 ? T : Math.max(T, ...["editor", "details"].filter((j) => a[j] && !r[j].hidden).map((j) => r[j].getBoundingClientRect().right - b.left + 12)), U = Math.min(F, Math.max(T, b.width - 160 - T)), W = r.info;
    for (const [j, V] of Object.entries({ left: Math.round(U) + "px", right: T + "px", width: "auto" })) W.style[j] !== V && (W.style[j] = V);
  }
  function m() {
    if (g) {
      D();
      for (const [b, T] of Object.entries(r)) if (!T.hidden && !a[b]) {
        const F = C(T);
        k(T, F.x, F.y);
      }
    }
  }
  function f() {
    for (const b of Object.values(r))
      for (const T of ["left", "top", "right", "bottom", "width", "height", "z-index"]) b.style.removeProperty(T);
    for (const b of Object.keys(r))
      _(b, !0), S(b, !0);
    requestAnimationFrame(m);
  }
  function P() {
    if (g) return;
    g = !0, w = document.activeElement, E = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, I = document.createComment("workspace mount"), t.before(I), document.body.append(t);
    for (const T of document.body.children) T !== t && (u.push({ node: T, inert: T.inert }), T.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const T of Object.keys(r))
      h[T].base = r[T].style.cssText, h[T].floating && (r[T].style.cssText = h[T].floating), r[T].setAttribute("role", "dialog"), r[T].setAttribute("aria-modal", "false"), r[T].setAttribute("aria-labelledby", "spice-" + T + "-title"), i[T].tabIndex = 0, i[T].title = "Drag to move; arrow keys move the window", S(T, c[T]);
    for (const T of ["selection-actions", "selection", "hierarchy-panel"]) M(e(T));
    const b = e("workspace-strip");
    for (const T of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (b.childElementCount) {
        const F = document.createElement("span");
        F.className = "spice-tool-divider", F.setAttribute("role", "separator"), F.setAttribute("aria-orientation", "vertical"), b.append(F);
      }
      M(T === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(T), b);
    }
    requestAnimationFrame(m), e("exit-fullscreen").focus({ preventScroll: !0 }), y();
  }
  function q() {
    if (g) {
      g = !1, x = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: b, anchor: T } of p.splice(0))
        T.before(b), T.remove();
      e("workspace-strip").replaceChildren();
      for (const b of Object.keys(r)) {
        h[b].floating = r[b].style.cssText, r[b].style.cssText = h[b].base, r[b].hidden = !1;
        for (const T of ["role", "aria-modal", "aria-labelledby"]) r[b].removeAttribute(T);
        i[b].removeAttribute("tabindex"), i[b].removeAttribute("title");
      }
      I && (I.before(t), I.remove(), I = null);
      for (const { node: b, inert: T } of u.splice(0)) b.inert = T;
      E && (document.documentElement.style.overflow = E.html, document.body.style.overflow = E.body, window.scrollTo(E.x, E.y)), w?.focus?.({ preventScroll: !0 }), y();
    }
  }
  async function G() {
    P(), t.dataset.nativeFullscreen = "false";
  }
  async function z() {
    if (d = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        d = !0;
        return;
      }
    q();
  }
  v(e("fullscreen"), "click", () => g ? z() : G()), v(e("exit-fullscreen"), "click", z), v(e("reset-windows"), "click", f);
  for (const b of Object.keys(r)) {
    v(e("pin-" + b), "click", () => {
      const U = C(r[b]);
      _(b, !a[b]), a[b] || (r[b].style.width = U.w + "px", r[b].style.height = U.h + "px", k(r[b], U.x, U.y)), y();
    }), v(e("close-" + b), "click", () => {
      S(b, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), v(r[b], "pointerdown", () => {
      if (g) {
        for (const U of Object.values(r)) U.style.zIndex = "20";
        r[b].style.zIndex = "30";
      }
    }, { capture: !0 });
    const T = i[b];
    v(T, "pointerdown", (U) => {
      if (!g || U.button !== 0 || U.target.closest("button,input,select,textarea,a,label")) return;
      U.preventDefault();
      const W = C(r[b]);
      _(b, !1), r[b].style.width = W.w + "px", r[b].style.height = W.h + "px", k(r[b], W.x, W.y), x = { id: b, pointer: U.pointerId, x: U.clientX, y: U.clientY, left: W.x, top: W.y }, T.setPointerCapture(U.pointerId);
    }), v(T, "pointermove", (U) => {
      x?.id === b && x.pointer === U.pointerId && k(r[b], x.left + U.clientX - x.x, x.top + U.clientY - x.y);
    });
    const F = () => {
      x = null;
    };
    v(T, "pointerup", F), v(T, "pointercancel", F), v(T, "lostpointercapture", F), v(T, "keydown", (U) => {
      if (!g || U.target !== T || !U.key.startsWith("Arrow")) return;
      U.preventDefault();
      const W = C(r[b]), j = U.shiftKey ? 32 : 8;
      _(b, !1), r[b].style.width = W.w + "px", r[b].style.height = W.h + "px", k(r[b], W.x + ({ ArrowLeft: -j, ArrowRight: j }[U.key] || 0), W.y + ({ ArrowUp: -j, ArrowDown: j }[U.key] || 0));
    });
  }
  v(document, "fullscreenchange", () => {
    g && d && document.fullscreenElement !== t && (d = !1, q());
  }), v(document, "keydown", (b) => {
    g && b.altKey && b.key === "Escape" && (b.preventDefault(), b.stopImmediatePropagation(), z());
  }, { capture: !0 }), v(window, "resize", m);
  const ne = new ResizeObserver(m);
  for (const b of Object.values(r)) ne.observe(b);
  return { enter: G, exit: z, showPanel: S, reset: f, destroy() {
    z(), n.abort(), ne.disconnect();
  } };
}
const se = 1e-3, oe = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), ie = (t, e) => Math.abs(t - e) < se, be = (t, e) => ie(e.a.x, e.b.x) ? ie(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - se && t.y <= Math.max(e.a.y, e.b.y) + se : ie(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - se && t.x <= Math.max(e.a.x, e.b.x) + se, Sn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), An = (t, e) => Math.max(t.a.x, t.b.x) > e.x + se && Math.min(t.a.x, t.b.x) < e.x + e.width - se && Math.max(t.a.y, t.b.y) > e.y + se && Math.min(t.a.y, t.b.y) < e.y + e.height - se;
function je(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && oe(e.at(-1)) === oe(n))) {
      for (; e.length > 1 && (ie(e.at(-2).x, e.at(-1).x) && ie(e.at(-1).x, n.x) || ie(e.at(-2).y, e.at(-1).y) && ie(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class On {
  constructor(e, { step: n = 8, segments: o = e.segments } = {}) {
    this.step = n, this.components = structuredClone(e.components), this.segments = structuredClone(o), this.seed = structuredClone(this.segments), this.initial = JSON.stringify(this.components), this.base = { width: e.width, height: e.height }, this.undoStack = [], this.redoStack = [], this.cache = null;
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
    const o = this.pins();
    if (o.some((r) => r.bit !== n && be(r, e)) || this.segments.some((r) => r.bit !== n && (be(e.a, r) || be(e.b, r) || be(r.a, e) || be(r.b, e)))) return !1;
    for (const r of this.components) if (An(e, r) && !o.filter((c) => c.owner === r.id && c.bit === n).some((c) => c.side === "NORTH" ? ie(e.a.x, c.x) && ie(e.b.x, c.x) && Math.max(e.a.y, e.b.y) <= c.y + se : c.side === "SOUTH" ? ie(e.a.x, c.x) && ie(e.b.x, c.x) && Math.min(e.a.y, e.b.y) >= c.y - se : c.side === "WEST" ? ie(e.a.y, c.y) && ie(e.b.y, c.y) && Math.max(e.a.x, e.b.x) <= c.x + se : c.side === "EAST" ? ie(e.a.y, c.y) && ie(e.b.y, c.y) && Math.min(e.a.x, e.b.x) >= c.x - se : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const o = je(n), r = o.slice(1).map((i, c) => ({ bit: e, a: o[c], b: i })).filter((i) => Sn(i) > se);
    if (!r.length) return !1;
    if (r.some((i) => !this.validSegment(i, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, o) {
    if (n = Math.round(n / this.step) * this.step, o = Math.round(o / this.step) * this.step, !n && !o) return;
    const r = this.snapshot(), i = this.components.find((p) => p.id === e);
    if (!i) return;
    const c = i.ports.map((p) => ({ ...p }));
    this.segments = this.segments.filter((p) => !c.some((h) => h.bit === p.bit && (oe(h) === oe(p.a) || oe(h) === oe(p.b)))), i.x += n, i.y += o;
    for (const p of i.ports)
      p.x += n, p.y += o;
    if (this.pinCache = null, this.components.some((p) => p !== i && i.x < p.x + p.width - se && i.x + i.width > p.x + se && i.y < p.y + p.height - se && i.y + i.height > p.y + se) || this.segments.some((p) => !this.validSegment(p, p.bit)) || i.ports.some((p) => this.pins().some((h) => h.owner !== e && h.bit !== p.bit && oe(h) === oe(p))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  transform(e, n) {
    const o = this.components.find((d) => d.id === e);
    if (!o) return;
    const r = this.snapshot(), i = o.width, c = o.height, a = n === "rotate" ? [0, 1, -1, 0, c, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, c] : n === "mirror-y" ? [-1, 0, 0, 1, i, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const p = o.ports.map((d) => ({ ...d })), h = (d) => ({ x: a[0] * d.x + a[2] * d.y + a[4], y: a[1] * d.x + a[3] * d.y + a[5] });
    this.segments = this.segments.filter((d) => !p.some((w) => w.bit === d.bit && (oe(w) === oe(d.a) || oe(w) === oe(d.b))));
    const u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of o.ports) {
      const w = h({ x: d.x - o.x, y: d.y - o.y });
      d.x = o.x + w.x, d.y = o.y + w.y, d.side = u[d.side] || d.side;
    }
    const g = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [a[0] * g[0] + a[2] * g[1], a[1] * g[0] + a[3] * g[1], a[0] * g[2] + a[2] * g[3], a[1] * g[2] + a[3] * g[3], a[0] * g[4] + a[2] * g[5] + a[4], a[1] * g[4] + a[3] * g[5] + a[5]], n === "rotate" && (o.width = c, o.height = i), this.pinCache = null, o.ports.some((d) => !this.onGrid(d)) || this.components.some((d) => d !== o && o.x < d.x + d.width - se && o.x + o.width > d.x + se && o.y < d.y + d.height - se && o.y + o.height > d.y + se) || this.segments.some((d) => !this.validSegment(d, d.bit)) || o.ports.some((d) => this.pins().some((w) => w.owner !== e && w.bit !== d.bit && oe(w) === oe(d))))
      throw this.restore(r), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(r);
  }
  connectivity() {
    if (this.cache) return this.cache;
    const e = /* @__PURE__ */ new Map();
    for (const o of this.pins())
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).pins.push(o);
    for (const o of this.segments)
      e.has(o.bit) || e.set(o.bit, { pins: [], segments: [] }), e.get(o.bit).segments.push(o);
    const n = [];
    for (const [o, r] of e) {
      const i = /* @__PURE__ */ new Map(), c = (u) => {
        i.has(oe(u)) || i.set(oe(u), u);
      };
      r.pins.forEach(c);
      for (const u of r.segments)
        c(u.a), c(u.b);
      for (let u = 0; u < r.segments.length; u++) for (let g = u + 1; g < r.segments.length; g++) {
        const d = r.segments[u], w = r.segments[g];
        if (ie(d.a.x, d.b.x) === ie(w.a.x, w.b.x)) continue;
        const E = ie(d.a.x, d.b.x) ? d : w, x = E === d ? w : d, I = { x: E.a.x, y: x.a.y };
        be(I, E) && be(I, x) && c(I);
      }
      const a = new Map([...i.keys()].map((u) => [u, u])), p = (u) => {
        let g = u;
        for (; a.get(g) !== g; ) g = a.get(g);
        for (; u !== g; ) {
          const d = a.get(u);
          a.set(u, g), u = d;
        }
        return g;
      };
      for (const u of r.segments) {
        const g = [...i.values()].filter((d) => be(d, u));
        for (const d of g.slice(1)) a.set(p(oe(d)), p(oe(g[0])));
      }
      const h = /* @__PURE__ */ new Map();
      for (const u of r.pins) {
        const g = p(oe(u));
        h.has(g) || h.set(g, { pins: [], points: [] }), h.get(g).pins.push(u);
      }
      for (const u of i.values()) {
        const g = p(oe(u));
        h.has(g) && h.get(g).points.push(u);
      }
      n.push({ bit: o, islands: [...h.values()], points: [...i.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: o } of this.connectivity()) {
      if (o.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < o.length; ) {
        let i;
        for (const c of r) for (let a = 0; a < o.length; a++) if (!r.has(a)) for (const p of o[c].points) for (const h of o[a].points) {
          const u = (p.x - h.x) ** 2 + (p.y - h.y) ** 2;
          (!i || u < i.d) && (i = { bit: n, a: p, b: h, d: u, j: a });
        }
        e.push(i), r.add(i.j);
      }
    }
    return e;
  }
  bounds() {
    const e = [-20, this.base.width + 20], n = [-20, this.base.height + 20];
    for (const i of this.components)
      e.push(i.x - 20, i.x + i.width + 20), n.push(i.y - 20, i.y + i.height + 20);
    for (const i of this.segments)
      e.push(i.a.x - 20, i.b.x + 20), n.push(i.a.y - 20, i.b.y + 20);
    const o = Math.min(...e), r = Math.min(...n);
    return { x: o, y: r, w: Math.max(...e) - o, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, o) {
    if (!this.onGrid(n) || !this.onGrid(o)) return null;
    const r = (M) => M.slice(1).every((C, k) => this.validSegment({ a: M[k], b: C }, e));
    for (const M of [[n, o], [n, { x: o.x, y: n.y }, o], [n, { x: n.x, y: o.y }, o]]) {
      const C = je(M);
      if (r(C)) return C;
    }
    const i = this.step, c = this.bounds(), a = Math.floor(Math.min(c.x, n.x, o.x) / i) - 5, p = Math.ceil(Math.max(c.x + c.w, n.x, o.x) / i) + 5, h = Math.floor(Math.min(c.y, n.y, o.y) / i) - 5, u = Math.ceil(Math.max(c.y + c.h, n.y, o.y) / i) + 5, g = { x: n.x / i, y: n.y / i, dir: -1, cost: 0, key: n.x / i + "," + n.y / i + ",-1" }, d = [g], w = /* @__PURE__ */ new Map([[g.key, 0]]), E = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map([[g.key, g]]), I = [[1, 0], [-1, 0], [0, 1], [0, -1]], _ = (M) => Math.abs(M.x - o.x / i) + Math.abs(M.y - o.y / i);
    let y = null, v = 0;
    for (; d.length && v++ < 3e4; ) {
      let M = 0;
      for (let k = 1; k < d.length; k++) d[k].cost + _(d[k]) < d[M].cost + _(d[M]) && (M = k);
      const C = d.splice(M, 1)[0];
      if (C.cost === w.get(C.key)) {
        if (C.x === o.x / i && C.y === o.y / i) {
          y = C;
          break;
        }
        for (let k = 0; k < 4; k++) {
          const D = C.x + I[k][0], m = C.y + I[k][1];
          if (D < a || D > p || m < h || m > u) continue;
          const f = { x: D, y: m, dir: k, key: D + "," + m + "," + k, cost: C.cost + 1 + (C.dir !== -1 && C.dir !== k ? 3 : 0) };
          f.cost >= (w.get(f.key) ?? 1 / 0) || !this.validSegment({ a: { x: C.x * i, y: C.y * i }, b: { x: D * i, y: m * i } }, e) || (w.set(f.key, f.cost), E.set(f.key, C.key), x.set(f.key, f), d.push(f));
        }
      }
    }
    if (!y) return null;
    const S = [];
    for (let M = y; M; M = x.get(E.get(M.key))) S.push({ x: M.x * i, y: M.y * i });
    return je(S.reverse());
  }
  async autoRoute(e = () => !1) {
    const n = this.snapshot();
    if (this.remember(n), !this.segments.length && JSON.stringify(this.components) === this.initial) {
      this.segments = structuredClone(this.seed), this.cache = null;
      return;
    }
    const o = /* @__PURE__ */ new Set();
    let r = 0;
    for (; !e() && r++ < Math.max(20, this.pins().length * 2); ) {
      const i = this.airwires().find((a) => !o.has(a.bit + ":" + oe(a.a) + ":" + oe(a.b)));
      if (!i) break;
      const c = this.findPath(i.bit, i.a, i.b);
      c ? (this.segments.push(...c.slice(1).map((a, p) => ({ bit: i.bit, a: c[p], b: a }))), this.cache = null) : o.add(i.bit + ":" + oe(i.a) + ":" + oe(i.b)), r % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const kn = "http://www.w3.org/2000/svg", ue = (t, e = {}) => {
  const n = document.createElementNS(kn, t);
  for (const [o, r] of Object.entries(e)) n.setAttribute(o, r);
  return n;
}, Rn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Ln(t, e, { changed: n, inspect: o, getNetColor: r }) {
  let i = null, c = null, a = !1, p = !1, h = null, u = null, g = -1, d = "", w = 0, E = "", x = 8, I = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
  const v = (b) => new DOMPoint(b.clientX, b.clientY).matrixTransform(c.getScreenCTM().inverse()), S = (b) => i.snap(v(b)), M = (b) => r?.(b) || Be[Number(b) % Be.length], C = (b) => {
    e("editor-status").textContent = b;
  };
  function k() {
    return { unrouted: i?.airwires().length || 0, wires: i?.segments.length || 0, editing: a, routing: p };
  }
  function D() {
    const b = !!i;
    for (const T of ["interactive", "flywire", "auto-route"]) e(T).disabled = !c || p;
    e("edit-tool").disabled = !b || p;
    for (const T of document.querySelectorAll("[data-editor-mode]"))
      T.disabled = !c || p, T.setAttribute("aria-pressed", String(a && T.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !b || p || !i.undoStack.length, e("wire-redo").disabled = !b || p || !i.redoStack.length, t.classList.toggle("spice-editing", a);
  }
  function m(b, T) {
    const F = y.get(b.id);
    if (F && (T.replaceChildren(...F.children.map((U) => U.cloneNode(!0))), b.editorMatrix)) {
      const U = b.editorMatrix, W = ue("g", { transform: "matrix(" + U.join(" ") + ")", "data-editor-glyph": "true" });
      W.append(...T.childNodes);
      for (const j of W.querySelectorAll("text")) j.remove();
      T.append(W);
      for (const [j, V] of F.labels.entries()) {
        const te = V.node.cloneNode(!0);
        te.removeAttribute("transform");
        let J = U[0] * V.x + U[2] * V.y + U[4], Z = U[1] * V.x + U[3] * V.y + U[5];
        if (b.ports.length === 2 && F.labels.length === 2) {
          const R = Math.abs(b.ports[0].y - b.ports[1].y) < 1e-3;
          J = R ? b.width / 2 : b.ports[0].x - b.x + 20, Z = R ? b.ports[0].y - b.y - 26 + j * 16 : b.height / 2 - 8 + j * 16, te.setAttribute("text-anchor", R ? "middle" : "start");
        }
        te.setAttribute("x", J), te.setAttribute("y", Z), T.append(te);
      }
    }
  }
  function f(b) {
    if (h = null, ["rotate", "mirror-x", "mirror-y"].includes(b) && d) {
      try {
        i.transform(d, b), G();
      } catch (T) {
        C(T.message);
      }
      return;
    }
    e("edit-tool").value = b, q(), D();
  }
  function P() {
    if (!i) return;
    const b = k();
    C(`${b.unrouted} connection${b.unrouted === 1 ? "" : "s"} unrouted · ${b.wires} wire segments${p ? " · Auto-routing…" : ""}`), D(), n(i.drawing(), b, i.bounds()), _.set(E, i.snapshot()), _.size > 20 && _.delete(_.keys().next().value);
  }
  function q(b = null) {
    if (c?.querySelector("[data-route-preview]")?.remove(), !h || !c) return;
    const T = [...h.points];
    if (b) {
      const W = T.at(-1);
      T.push({ x: b.x, y: W.y }, b);
    }
    const F = ue("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    F.append(ue("polyline", { points: T.map((W) => W.x + "," + W.y).join(" "), fill: "none", stroke: M(h.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), c.append(F);
    const U = c.querySelector("[data-airwires]");
    U && c.append(U);
  }
  function G() {
    if (!c || !i) return;
    for (const j of c.querySelectorAll("[data-editor-body-hit]")) j.remove();
    for (const j of [...c.children]) (j.hasAttribute("data-editor-overlay") || j.hasAttribute("data-airwires") || j.hasAttribute("data-manual-state") || j.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(j.localName)) && j.remove();
    for (const j of i.components) {
      const V = c.getElementById("cell_" + j.id);
      V && (m(j, V), V.setAttribute("s:width", j.width), V.setAttribute("s:height", j.height), V.setAttribute("transform", `translate(${j.x},${j.y})`), V.dataset.editorComponent = j.id, a && V.prepend(ue("rect", { x: 0, y: 0, width: j.width, height: j.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const b = c.querySelector('g[id^="cell_"]'), T = ue("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), F = ue("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [j, V] of i.segments.entries()) {
      const te = ue("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, class: "net_" + V.bit, "data-net": I.get(V.bit) || String(V.bit), "stroke-width": j === g ? 2.8 : 1.4 });
      te.append(ue("title")), te.firstChild.textContent = "Node " + (I.get(V.bit) || V.bit), c.insertBefore(te, b), a && T.append(ue("line", { x1: V.a.x, y1: V.a.y, x2: V.b.x, y2: V.b.y, "data-editor-wire": j, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const j of i.connectivity()) for (const V of j.points) {
      const te = /* @__PURE__ */ new Set();
      for (const J of j.segments) be(V, J) && (Math.min(J.a.x, J.b.x) < V.x - 1e-3 && te.add("w"), Math.max(J.a.x, J.b.x) > V.x + 1e-3 && te.add("e"), Math.min(J.a.y, J.b.y) < V.y - 1e-3 && te.add("n"), Math.max(J.a.y, J.b.y) > V.y + 1e-3 && te.add("s"));
      (te.size >= 3 || te.size >= 2 && j.islands.some((J) => J.pins.some((Z) => Rn(V, Z)))) && c.insertBefore(ue("circle", { cx: V.x, cy: V.y, r: 2, class: "net_" + j.bit, "data-net": I.get(j.bit) || String(j.bit), fill: M(j.bit) }), b);
    }
    if (a) {
      const j = i.components.find((V) => V.id === d);
      j && T.append(ue("rect", { x: j.x - 3, y: j.y - 3, width: j.width + 6, height: j.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const V of i.pins()) {
        const te = ue("circle", { cx: V.x, cy: V.y, r: 3, "data-editor-pin": V.id, "data-editor-bit": V.bit, fill: "#fff", stroke: M(V.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": V.owner + " " + V.pin }), J = ue("title");
        J.textContent = V.id + " · " + (I.get(V.bit) || V.bit), te.append(J), F.append(te);
      }
      c.append(T, F);
    }
    q();
    const U = ue("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const j of i.airwires()) U.append(ue("line", { x1: j.a.x, y1: j.a.y, x2: j.b.x, y2: j.b.y, stroke: M(j.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": j.bit, "data-from-owner": j.a.owner || "", "data-to-owner": j.b.owner || "" }));
    c.append(U);
    const W = ue("metadata", { "data-manual-state": "true" });
    W.textContent = JSON.stringify({ version: 1, grid: x, unrouted: i.airwires().length, manual: !0 }), c.insertBefore(W, U), P();
  }
  function z(b, T) {
    if (!h) {
      h = { bit: T, points: [b] }, q(), C("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (T !== void 0 && h.bit !== T) {
      C("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const F = h.points.at(-1), U = i.findPath(h.bit, F, b);
    if (!U) {
      C("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (T === void 0) {
      h.points.push(...U.slice(1)), q();
      return;
    }
    try {
      i.addPath(T, [...h.points, ...U.slice(1)]), h = null, G();
    } catch (W) {
      C(W.message);
    }
  }
  t.addEventListener("pointerdown", (b) => {
    if (!a || p || !i || !c || b.button !== 0 || b.shiftKey) return;
    const T = b.target.closest("[data-editor-pin]"), F = b.target.closest("[data-editor-wire]"), U = b.target.closest("[data-editor-component]");
    if (!(!T && !F && !U && !h)) {
      if (b.preventDefault(), b.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), T) {
        const W = i.pins().find((j) => j.id === T.dataset.editorPin);
        e("edit-tool").value = "route", D(), z({ x: W.x, y: W.y }, W.bit);
        return;
      }
      if (F) {
        const W = +F.dataset.editorWire, j = i.segments[W];
        if (e("edit-tool").value === "erase" && !h) {
          i.remove(W), g = -1, G();
          return;
        }
        if (h || e("edit-tool").value === "route") {
          const V = S(b);
          z(j.a.x === j.b.x ? { x: j.a.x, y: V.y } : { x: V.x, y: j.a.y }, j.bit);
        } else
          g = W, G(), C("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (h) {
        z(S(b));
        return;
      }
      if (U) {
        const W = U.dataset.editorComponent, j = i.components.find((V) => V.id === W);
        if (!j) return;
        if (d = W, g = -1, o?.(W), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          f(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          G();
          return;
        }
        u = { id: W, n: j, element: U, x: b.clientX, y: b.clientY, start: v(b), dx: 0, dy: 0 }, U.style.opacity = ".6", t.setPointerCapture(b.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (b) => {
    if (!(!a || !i || !c)) {
      if (u) {
        b.stopImmediatePropagation();
        const T = v(b), F = i.snap({ x: T.x - u.start.x, y: T.y - u.start.y });
        u.dx = F.x, u.dy = F.y, u.element.setAttribute("transform", `translate(${u.n.x + u.dx},${u.n.y + u.dy})`);
        for (const U of c.querySelectorAll("[data-airwires] line"))
          U.dataset.fromOwner === u.id && (U.setAttribute("x1", +U.getAttribute("x1") - Number(U.dataset.dx || 0) + u.dx), U.setAttribute("y1", +U.getAttribute("y1") - Number(U.dataset.dy || 0) + u.dy)), U.dataset.toOwner === u.id && (U.setAttribute("x2", +U.getAttribute("x2") - Number(U.dataset.dx || 0) + u.dx), U.setAttribute("y2", +U.getAttribute("y2") - Number(U.dataset.dy || 0) + u.dy)), U.dataset.dx = u.dx, U.dataset.dy = u.dy;
        return;
      }
      h && q(S(b));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (b) => {
    if (!u) return;
    b.preventDefault(), b.stopImmediatePropagation();
    const T = u;
    u = null, T.element.style.opacity = "", t.hasPointerCapture(b.pointerId) && t.releasePointerCapture(b.pointerId);
    try {
      i.move(T.id, T.dx, T.dy), g = -1, G();
    } catch (F) {
      G(), C(F.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    u && (u.element.style.opacity = "", u = null, G());
  }), document.addEventListener("keydown", (b) => {
    if (!a || !i || p || b.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(b.target)) return;
    const T = b.target.closest("[data-editor-pin]"), F = b.key.toLowerCase();
    if (T && (b.key === "Enter" || b.key === " ")) {
      b.preventDefault(), b.stopImmediatePropagation();
      const U = i.pins().find((W) => W.id === T.dataset.editorPin);
      z({ x: U.x, y: U.y }, U.bit);
      return;
    }
    b.key === "Escape" ? (b.preventDefault(), b.stopImmediatePropagation(), h = null, f("move"), G()) : (b.key === "Delete" || b.key === "Backspace") && g >= 0 ? (b.preventDefault(), b.stopImmediatePropagation(), i.remove(g), g = -1, G()) : (b.ctrlKey || b.metaKey) && F === "z" ? (b.preventDefault(), b.stopImmediatePropagation(), b.shiftKey ? i.redo() : i.undo(), h = null, G()) : !b.ctrlKey && !b.metaKey && !b.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[F] && (b.preventDefault(), b.stopImmediatePropagation(), f({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[F]));
  }, { capture: !0 });
  async function ne() {
    if (!i || p) return;
    const b = w;
    p = !0, P(), C("Auto-routing remaining connections…");
    try {
      await i.autoRoute(() => b !== w), b === w && (h = null, g = -1, p = !1, G());
    } catch (T) {
      b === w && (p = !1, G(), C(T.message));
    }
  }
  return {
    mount(b, T, F, U, W, { reset: j = !1 } = {}) {
      w++, p = !1, c = b, h = null, u = null, g = -1, d = "", y = /* @__PURE__ */ new Map();
      for (const Z of c.querySelectorAll('g[id^="cell_"]')) {
        const R = Z.getCTM().inverse();
        y.set(Z.id.slice(5), { children: [...Z.childNodes].map((L) => L.cloneNode(!0)), labels: [...Z.querySelectorAll("text")].map((L) => {
          const H = new DOMPoint(+L.getAttribute("x") || 0, +L.getAttribute("y") || 0).matrixTransform(R.multiply(L.getCTM()));
          return { node: L.cloneNode(!0), x: H.x, y: H.y };
        }) });
      }
      if (x = W.gridSize || 0, I = new Map(Object.values(F.nodes).map((Z) => [Z.bit, Z.name])), !T || !x) {
        i = null, D();
        return;
      }
      const V = structuredClone(T);
      for (const Z of V.components) {
        const R = c.getElementById("cell_" + Z.id);
        for (const L of Z.ports) {
          const H = [...R.children].find(($) => $.getAttribute("s:pid") === L.pin);
          L.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[H?.getAttribute("s:position")] || L.side;
        }
      }
      for (const [Z, R] of Object.entries(U.modules.circuit.cells)) if (R.attributes.name === "0") {
        const L = c.getElementById("cell_" + Z), H = L?.transform.baseVal.consolidate().matrix;
        L && H && V.components.push({ id: Z, decoration: !0, x: H.e, y: H.f, width: +L.getAttribute("s:width"), height: +L.getAttribute("s:height"), ports: [...L.children].filter(($) => $.hasAttribute("s:pid")).map(($) => ({ pin: $.getAttribute("s:pid"), x: H.e + Number($.getAttribute("s:x")), y: H.f + Number($.getAttribute("s:y")), bit: R.connections[$.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const te = new Map(Object.values(F.nodes).map((Z) => [Z.name, Z.bit])), J = [...c.children].filter((Z) => Z.localName === "line" && Z.hasAttribute("data-net")).map((Z) => ({ bit: te.get(Z.dataset.net), a: { x: +Z.getAttribute("x1"), y: +Z.getAttribute("y1") }, b: { x: +Z.getAttribute("x2"), y: +Z.getAttribute("y2") } }));
      i = new On(V, { step: x, segments: J }), E = JSON.stringify([F.topology.signature, W]), !j && _.has(E) ? i.restore(_.get(E)) : e("flywire").checked && i.clear(), a = e("interactive").checked, a || !j && _.has(E) || e("flywire").checked ? G() : D();
    },
    invalidate() {
      w++, p = !1, i = null, c = null, h = null, u = null, D();
    },
    setEnabled(b) {
      a = b, b || (h = null), i ? G() : D();
    },
    clear() {
      i && (i.clear(), h = null, G());
    },
    autoRoute: ne,
    chooseTool: f,
    undo() {
      i && (h = null, i.undo(), G());
    },
    redo() {
      i && (h = null, i.redo(), G());
    },
    complete() {
      return !i || !p && i.airwires().length === 0;
    },
    working() {
      return p;
    },
    stats: k,
    canEdit() {
      return !!i;
    },
    refreshColors() {
      if (c) {
        for (const b of c.querySelectorAll("[data-air-net]")) b.setAttribute("stroke", M(+b.dataset.airNet));
        for (const b of c.querySelectorAll("[data-editor-bit]")) b.setAttribute("stroke", M(+b.dataset.editorBit));
      }
    },
    cleanExport(b) {
      for (const T of b.querySelectorAll("[data-editor-overlay],[data-route-preview]")) T.remove();
      for (const T of b.querySelectorAll("[data-editor-component]"))
        T.removeAttribute("data-editor-component"), T.style.removeProperty("opacity");
    }
  };
}
const Ke = 4, Le = "http://www.w3.org/2000/svg";
function Me(t, e, n = !0, o = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), i = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(Le, "defs"), r.dataset.coordinateGrid = "true";
    const w = document.createElementNS(Le, "pattern");
    w.id = "spice-coordinate-grid", w.setAttribute("patternUnits", "userSpaceOnUse");
    const E = document.createElementNS(Le, "path");
    E.setAttribute("fill", "none"), E.setAttribute("stroke", "#737b83"), E.setAttribute("stroke-opacity", ".23"), E.setAttribute("stroke-width", ".55"), E.setAttribute("vector-effect", "non-scaling-stroke"), w.append(E), r.append(w), i = document.createElementNS(Le, "rect"), i.dataset.coordinateGrid = "true", i.setAttribute("fill", "url(#spice-coordinate-grid)"), i.setAttribute("stroke", "none"), i.setAttribute("pointer-events", "none"), t.prepend(i), t.prepend(r);
  }
  const c = r.firstElementChild, a = e || 8;
  c.setAttribute("width", a), c.setAttribute("height", a), c.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), i.setAttribute("visibility", n && e ? "visible" : "hidden");
  let p = c.querySelector("[data-minor-grid]");
  p || (p = c.firstElementChild.cloneNode(), p.setAttribute("data-minor-grid", "true"), p.setAttribute("stroke-opacity", ".08"), c.append(p));
  const h = [];
  for (let w = Ke; w < a; w += Ke) h.push(`M${w},0 V${a} M0,${w} H${a}`);
  p.setAttribute("d", h.join(" ")), t.dataset.displayGridStep = String(a);
  let u = o;
  const g = t.closest(".spice-preview"), d = t.isConnected && g ? t.getScreenCTM() : null;
  if (d) {
    const w = g.getBoundingClientRect(), E = d.inverse(), x = [[w.left - 1, w.top - 1], [w.right + 1, w.top - 1], [w.right + 1, w.bottom + 1], [w.left - 1, w.bottom + 1]].map(([y, v]) => new DOMPoint(y, v).matrixTransform(E)), I = Math.min(...x.map((y) => y.x)), _ = Math.min(...x.map((y) => y.y));
    u = { x: I, y: _, w: Math.max(...x.map((y) => y.x)) - I, h: Math.max(...x.map((y) => y.y)) - _ };
  }
  if (!u) {
    const w = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    u = { x: w[0], y: w[1], w: w[2], h: w[3] };
  }
  for (const [w, E] of Object.entries({ x: u.x, y: u.y, width: u.w, height: u.h })) i.setAttribute(w, E);
}
const Mn = `<svg
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
`, Pn = `<svg
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
`, Dn = `<svg
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
`, Un = `<svg
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
`, Bn = `<svg
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
`, Vn = `<svg
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
`, jn = `<svg
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
`, Qn = `<svg
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
`, Fn = `<svg
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
`, Gn = `<svg
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
`, Hn = `<svg
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
`, Wn = `<svg
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
`, Qe = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, $n = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
`, qn = `<svg
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
`, Xn = `<svg
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
`;
function zn(t) {
  const e = { move: Mn, route: Pn, erase: Dn, rotate: Un, "mirror-x": Bn, "mirror-y": Vn }, n = { "zoom-in": jn, "zoom-out": Qn, fit: Fn, "wire-undo": Gn, "wire-redo": Hn, "auto-route": Wn, "pin-editor": Qe, "pin-info": Qe, "pin-details": Qe, fullscreen: $n, "exit-fullscreen": qn, "reset-windows": Xn }, o = (r, i) => {
    if (!r) return;
    const c = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", c), r.title = c, r.innerHTML = i, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  for (const [r, i] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${r}"]`), i);
  for (const [r, i] of Object.entries(n)) o(t.querySelector("#spice-" + r), i);
}
function Yn(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function o() {
      var r = !1;
      try {
        r = this instanceof o;
      } catch {
      }
      return r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(o) {
    var r = Object.getOwnPropertyDescriptor(t, o);
    Object.defineProperty(n, o, r.get ? r : {
      enumerable: !0,
      get: function() {
        return t[o];
      }
    });
  }), n;
}
var Fe = {};
const Kn = {}, Zn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Kn
}, Symbol.toStringTag, { value: "Module" })), Jn = /* @__PURE__ */ Yn(Zn);
var pt;
function er() {
  return pt || (pt = 1, (function(t) {
    (function(e) {
      e.parser = function(l, s) {
        return new o(l, s);
      }, e.SAXParser = o, e.SAXStream = g, e.createStream = h, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function o(l, s) {
        if (!(this instanceof o))
          return new o(l, s);
        var A = this;
        i(A), A.q = A.c = "", A.bufferCheckPosition = e.MAX_BUFFER_LENGTH, A.encoding = null, A.opt = s || {}, A.opt.lowercase = A.opt.lowercase || A.opt.lowercasetags, A.looseCase = A.opt.lowercase ? "toLowerCase" : "toUpperCase", A.opt.maxEntityCount = A.opt.maxEntityCount || 512, A.opt.maxEntityDepth = A.opt.maxEntityDepth || 4, A.entityCount = A.entityDepth = 0, A.tags = [], A.closed = A.closedRoot = A.sawRoot = !1, A.tag = A.error = null, A.strict = !!l, A.noscript = !!(l || A.opt.noscript), A.state = f.BEGIN, A.strictEntities = A.opt.strictEntities, A.ENTITIES = A.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), A.attribList = [], A.opt.xmlns && (A.ns = Object.create(I)), A.opt.unquotedAttributeValues === void 0 && (A.opt.unquotedAttributeValues = !l), A.trackPosition = A.opt.position !== !1, A.trackPosition && (A.position = A.line = A.column = 0), q(A, "onready");
      }
      Object.create || (Object.create = function(l) {
        function s() {
        }
        s.prototype = l;
        var A = new s();
        return A;
      }), Object.keys || (Object.keys = function(l) {
        var s = [];
        for (var A in l) l.hasOwnProperty(A) && s.push(A);
        return s;
      });
      function r(l) {
        for (var s = Math.max(e.MAX_BUFFER_LENGTH, 10), A = 0, N = 0, ee = n.length; N < ee; N++) {
          var B = l[n[N]].length;
          if (B > s)
            switch (n[N]) {
              case "textNode":
                F(l);
                break;
              case "cdata":
                T(l, "oncdata", l.cdata), l.cdata = "";
                break;
              case "script":
                T(l, "onscript", l.script), l.script = "";
                break;
              default:
                W(l, "Max buffer length exceeded: " + n[N]);
            }
          A = Math.max(A, B);
        }
        var Y = e.MAX_BUFFER_LENGTH - A;
        l.bufferCheckPosition = Y + l.position;
      }
      function i(l) {
        for (var s = 0, A = n.length; s < A; s++)
          l[n[s]] = "";
      }
      function c(l) {
        F(l), l.cdata !== "" && (T(l, "oncdata", l.cdata), l.cdata = ""), l.script !== "" && (T(l, "onscript", l.script), l.script = "");
      }
      o.prototype = {
        end: function() {
          j(this);
        },
        write: ge,
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
      var a;
      try {
        a = Jn.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var p = e.EVENTS.filter(function(l) {
        return l !== "error" && l !== "end";
      });
      function h(l, s) {
        return new g(l, s);
      }
      function u(l, s) {
        if (l.length >= 2) {
          if (l[0] === 255 && l[1] === 254)
            return "utf-16le";
          if (l[0] === 254 && l[1] === 255)
            return "utf-16be";
        }
        return l.length >= 3 && l[0] === 239 && l[1] === 187 && l[2] === 191 ? "utf8" : l.length >= 4 ? l[0] === 60 && l[1] === 0 && l[2] === 63 && l[3] === 0 ? "utf-16le" : l[0] === 0 && l[1] === 60 && l[2] === 0 && l[3] === 63 ? "utf-16be" : "utf8" : s ? "utf8" : null;
      }
      function g(l, s) {
        if (!(this instanceof g))
          return new g(l, s);
        a.apply(this), this._parser = new o(l, s), this.writable = !0, this.readable = !0;
        var A = this;
        this._parser.onend = function() {
          A.emit("end");
        }, this._parser.onerror = function(N) {
          A.emit("error", N), A._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, p.forEach(function(N) {
          Object.defineProperty(A, "on" + N, {
            get: function() {
              return A._parser["on" + N];
            },
            set: function(ee) {
              if (!ee)
                return A.removeAllListeners(N), A._parser["on" + N] = ee, ee;
              A.on(N, ee);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      g.prototype = Object.create(a.prototype, {
        constructor: {
          value: g
        }
      }), g.prototype._decodeBuffer = function(l, s) {
        if (this._decoderBuffer && (l = Buffer.concat([this._decoderBuffer, l]), this._decoderBuffer = null), !this._decoder) {
          var A = u(l, s);
          if (!A)
            return this._decoderBuffer = l, "";
          this._parser.encoding = A, this._decoder = new TextDecoder(A);
        }
        return this._decoder.decode(l, { stream: !s });
      }, g.prototype.write = function(l) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(l))
          l = this._decodeBuffer(l, !1);
        else if (this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        }
        return this._parser.write(l.toString()), this.emit("data", l), !0;
      }, g.prototype.end = function(l) {
        if (l && l.length && this.write(l), this._decoderBuffer) {
          var s = this._decodeBuffer(Buffer.alloc(0), !0);
          s && (this._parser.write(s), this.emit("data", s));
        } else if (this._decoder) {
          var A = this._decoder.decode();
          A && (this._parser.write(A), this.emit("data", A));
        }
        return this._parser.end(), !0;
      }, g.prototype.on = function(l, s) {
        var A = this;
        return !A._parser["on" + l] && p.indexOf(l) !== -1 && (A._parser["on" + l] = function() {
          var N = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          N.splice(0, 0, l), A.emit.apply(A, N);
        }), a.prototype.on.call(A, l, s);
      };
      var d = /^\[CDATA\[$/i, w = /^DOCTYPE$/i, E = "http://www.w3.org/XML/1998/namespace", x = "http://www.w3.org/2000/xmlns/", I = { xml: E, xmlns: x }, _ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, v = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, S = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function M(l) {
        return l === " " || l === `
` || l === "\r" || l === "	";
      }
      function C(l) {
        return l === '"' || l === "'";
      }
      function k(l) {
        return l === ">" || M(l);
      }
      function D(l, s) {
        return l.test(s);
      }
      function m(l, s) {
        return !D(l, s);
      }
      var f = 0;
      e.STATE = {
        BEGIN: f++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: f++,
        // leading whitespace
        TEXT: f++,
        // general stuff
        TEXT_ENTITY: f++,
        // &amp and such.
        OPEN_WAKA: f++,
        // <
        SGML_DECL: f++,
        // <!BLARG
        SGML_DECL_QUOTED: f++,
        // <!BLARG foo "bar
        DOCTYPE: f++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: f++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: f++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: f++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: f++,
        // <!-
        COMMENT: f++,
        // <!--
        COMMENT_ENDING: f++,
        // <!-- blah -
        COMMENT_ENDED: f++,
        // <!-- blah --
        CDATA: f++,
        // <![CDATA[ something
        CDATA_ENDING: f++,
        // ]
        CDATA_ENDING_2: f++,
        // ]]
        PROC_INST: f++,
        // <?hi
        PROC_INST_BODY: f++,
        // <?hi there
        PROC_INST_ENDING: f++,
        // <?hi "there" ?
        OPEN_TAG: f++,
        // <strong
        OPEN_TAG_SLASH: f++,
        // <strong /
        ATTRIB: f++,
        // <a
        ATTRIB_NAME: f++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: f++,
        // <a foo _
        ATTRIB_VALUE: f++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: f++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: f++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: f++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: f++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: f++,
        // <foo bar=&quot
        CLOSE_TAG: f++,
        // </a
        CLOSE_TAG_SAW_WHITE: f++,
        // </a   >
        SCRIPT: f++,
        // <script> ...
        SCRIPT_ENDING: f++
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
        var s = e.ENTITIES[l], A = typeof s == "number" ? String.fromCharCode(s) : s;
        e.ENTITIES[l] = A;
      });
      for (var P in e.STATE)
        e.STATE[e.STATE[P]] = P;
      f = e.STATE;
      function q(l, s, A) {
        l[s] && l[s](A);
      }
      function G(l) {
        var s = l && l.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return s ? s[2] : null;
      }
      function z(l) {
        return l ? l.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function ne(l, s) {
        const A = z(l), N = z(s);
        return !A || !N ? !0 : N === "utf16" ? A === "utf16le" || A === "utf16be" : A === N;
      }
      function b(l, s) {
        if (!(!l.strict || !l.encoding || !s || s.name !== "xml")) {
          var A = G(s.body);
          A && !ne(l.encoding, A) && V(
            l,
            "XML declaration encoding " + A + " does not match detected stream encoding " + l.encoding.toUpperCase()
          );
        }
      }
      function T(l, s, A) {
        l.textNode && F(l), q(l, s, A);
      }
      function F(l) {
        l.textNode = U(l.opt, l.textNode), l.textNode && q(l, "ontext", l.textNode), l.textNode = "";
      }
      function U(l, s) {
        return l.trim && (s = s.trim()), l.normalize && (s = s.replace(/\s+/g, " ")), s;
      }
      function W(l, s) {
        return F(l), l.trackPosition && (s += `
Line: ` + l.line + `
Column: ` + l.column + `
Char: ` + l.c), s = new Error(s), l.error = s, q(l, "onerror", s), l;
      }
      function j(l) {
        return l.sawRoot && !l.closedRoot && V(l, "Unclosed root tag"), l.state !== f.BEGIN && l.state !== f.BEGIN_WHITESPACE && l.state !== f.TEXT && W(l, "Unexpected end"), F(l), l.c = "", l.closed = !0, q(l, "onend"), o.call(l, l.strict, l.opt), l;
      }
      function V(l, s) {
        if (typeof l != "object" || !(l instanceof o))
          throw new Error("bad call to strictFail");
        l.strict && W(l, s);
      }
      function te(l) {
        l.strict || (l.tagName = l.tagName[l.looseCase]());
        var s = l.tags[l.tags.length - 1] || l, A = l.tag = { name: l.tagName, attributes: {} };
        l.opt.xmlns && (A.ns = s.ns), l.attribList.length = 0, T(l, "onopentagstart", A);
      }
      function J(l, s) {
        var A = l.indexOf(":"), N = A < 0 ? ["", l] : l.split(":"), ee = N[0], B = N[1];
        return s && l === "xmlns" && (ee = "xmlns", B = ""), { prefix: ee, local: B };
      }
      function Z(l) {
        if (l.strict || (l.attribName = l.attribName[l.looseCase]()), l.attribList.indexOf(l.attribName) !== -1 || l.tag.attributes.hasOwnProperty(l.attribName)) {
          l.attribName = l.attribValue = "";
          return;
        }
        if (l.opt.xmlns) {
          var s = J(l.attribName, !0), A = s.prefix, N = s.local;
          if (A === "xmlns")
            if (N === "xml" && l.attribValue !== E)
              V(
                l,
                "xml: prefix must be bound to " + E + `
Actual: ` + l.attribValue
              );
            else if (N === "xmlns" && l.attribValue !== x)
              V(
                l,
                "xmlns: prefix must be bound to " + x + `
Actual: ` + l.attribValue
              );
            else {
              var ee = l.tag, B = l.tags[l.tags.length - 1] || l;
              ee.ns === B.ns && (ee.ns = Object.create(B.ns)), ee.ns[N] = l.attribValue;
            }
          l.attribList.push([l.attribName, l.attribValue]);
        } else
          l.tag.attributes[l.attribName] = l.attribValue, T(l, "onattribute", {
            name: l.attribName,
            value: l.attribValue
          });
        l.attribName = l.attribValue = "";
      }
      function R(l, s) {
        if (l.opt.xmlns) {
          var A = l.tag, N = J(l.tagName);
          A.prefix = N.prefix, A.local = N.local, A.uri = A.ns[N.prefix] || "", A.prefix && !A.uri && (V(
            l,
            "Unbound namespace prefix: " + JSON.stringify(l.tagName)
          ), A.uri = N.prefix);
          var ee = l.tags[l.tags.length - 1] || l;
          A.ns && ee.ns !== A.ns && Object.keys(A.ns).forEach(function(ke) {
            T(l, "onopennamespace", {
              prefix: ke,
              uri: A.ns[ke]
            });
          });
          for (var B = 0, Y = l.attribList.length; B < Y; B++) {
            var re = l.attribList[B], ce = re[0], de = re[1], ae = J(ce, !0), he = ae.prefix, Oe = ae.local, Te = he === "" ? "" : A.ns[he] || "", we = {
              name: ce,
              value: de,
              prefix: he,
              local: Oe,
              uri: Te
            };
            he && he !== "xmlns" && !Te && (V(
              l,
              "Unbound namespace prefix: " + JSON.stringify(he)
            ), we.uri = he), l.tag.attributes[ce] = we, T(l, "onattribute", we);
          }
          l.attribList.length = 0;
        }
        l.tag.isSelfClosing = !!s, l.sawRoot = !0, l.tags.push(l.tag), T(l, "onopentag", l.tag), s || (!l.noscript && l.tagName.toLowerCase() === "script" ? l.state = f.SCRIPT : l.state = f.TEXT, l.tag = null, l.tagName = ""), l.attribName = l.attribValue = "", l.attribList.length = 0;
      }
      function L(l) {
        if (!l.tagName) {
          V(l, "Weird empty close tag."), l.textNode += "</>", l.state = f.TEXT;
          return;
        }
        if (l.script) {
          if (l.tagName !== "script") {
            l.script += "</" + l.tagName + ">", l.tagName = "", l.state = f.SCRIPT;
            return;
          }
          T(l, "onscript", l.script), l.script = "";
        }
        var s = l.tags.length, A = l.tagName;
        l.strict || (A = A[l.looseCase]());
        for (var N = A; s--; ) {
          var ee = l.tags[s];
          if (ee.name !== N)
            V(l, "Unexpected close tag");
          else
            break;
        }
        if (s < 0) {
          V(l, "Unmatched closing tag: " + l.tagName), l.textNode += "</" + l.tagName + ">", l.state = f.TEXT;
          return;
        }
        l.tagName = A;
        for (var B = l.tags.length; B-- > s; ) {
          var Y = l.tag = l.tags.pop();
          l.tagName = l.tag.name, T(l, "onclosetag", l.tagName);
          var re = {};
          for (var ce in Y.ns)
            re[ce] = Y.ns[ce];
          var de = l.tags[l.tags.length - 1] || l;
          l.opt.xmlns && Y.ns !== de.ns && Object.keys(Y.ns).forEach(function(ae) {
            var he = Y.ns[ae];
            T(l, "onclosenamespace", { prefix: ae, uri: he });
          });
        }
        s === 0 && (l.closedRoot = !0), l.tagName = l.attribValue = l.attribName = "", l.attribList.length = 0, l.state = f.TEXT;
      }
      function H(l) {
        var s = l.entity, A = s.toLowerCase(), N, ee = "";
        return l.ENTITIES[s] ? l.ENTITIES[s] : l.ENTITIES[A] ? l.ENTITIES[A] : (s = A, s.charAt(0) === "#" && (s.charAt(1) === "x" ? (s = s.slice(2), N = parseInt(s, 16), ee = N.toString(16)) : (s = s.slice(1), N = parseInt(s, 10), ee = N.toString(10))), s = s.replace(/^0+/, ""), isNaN(N) || ee.toLowerCase() !== s || N < 0 || N > 1114111 || !$(N) ? (V(l, "Invalid character entity"), "&" + l.entity + ";") : String.fromCodePoint(N));
      }
      function $(l) {
        return l === 9 || l === 10 || l === 13 || l >= 32 && l <= 55295 || l >= 57344 && l <= 65533 || l >= 65536 && l <= 1114111;
      }
      function K(l, s) {
        s === "<" ? (l.state = f.OPEN_WAKA, l.startTagPosition = l.position) : M(s) || (V(l, "Non-whitespace before first tag."), l.textNode = s, l.state = f.TEXT);
      }
      function X(l, s) {
        var A = "";
        return s < l.length && (A = l.charAt(s)), A;
      }
      function ge(l) {
        var s = this;
        if (this.error)
          throw this.error;
        if (s.closed)
          return W(
            s,
            "Cannot write after close. Assign an onready handler."
          );
        if (l === null)
          return j(s);
        typeof l == "object" && (l = l.toString());
        for (var A = 0, N = ""; N = X(l, A++), s.c = N, !!N; )
          switch (s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++), s.state) {
            case f.BEGIN:
              if (s.state = f.BEGIN_WHITESPACE, N === "\uFEFF")
                continue;
              K(s, N);
              continue;
            case f.BEGIN_WHITESPACE:
              K(s, N);
              continue;
            case f.TEXT:
              if (s.sawRoot && !s.closedRoot) {
                for (var B = A - 1; N && N !== "<" && N !== "&"; )
                  N = X(l, A++), N && s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++);
                s.textNode += l.substring(B, A - 1);
              }
              N === "<" && !(s.sawRoot && s.closedRoot && !s.strict) ? (s.state = f.OPEN_WAKA, s.startTagPosition = s.position) : (!M(N) && (!s.sawRoot || s.closedRoot) && V(s, "Text data outside of root node."), N === "&" ? s.state = f.TEXT_ENTITY : s.textNode += N);
              continue;
            case f.SCRIPT:
              N === "<" ? s.state = f.SCRIPT_ENDING : s.script += N;
              continue;
            case f.SCRIPT_ENDING:
              N === "/" ? s.state = f.CLOSE_TAG : (s.script += "<" + N, s.state = f.SCRIPT);
              continue;
            case f.OPEN_WAKA:
              if (N === "!")
                s.state = f.SGML_DECL, s.sgmlDecl = "";
              else if (!M(N)) if (D(_, N))
                s.state = f.OPEN_TAG, s.tagName = N;
              else if (N === "/")
                s.state = f.CLOSE_TAG, s.tagName = "";
              else if (N === "?")
                s.state = f.PROC_INST, s.procInstName = s.procInstBody = "";
              else {
                if (V(s, "Unencoded <"), s.startTagPosition + 1 < s.position) {
                  var ee = s.position - s.startTagPosition;
                  N = new Array(ee).join(" ") + N;
                }
                s.textNode += "<" + N, s.state = f.TEXT;
              }
              continue;
            case f.SGML_DECL:
              if (s.sgmlDecl + N === "--") {
                s.state = f.COMMENT, s.comment = "", s.sgmlDecl = "";
                continue;
              }
              s.doctype && s.doctype !== !0 && s.sgmlDecl ? (s.state = f.DOCTYPE_DTD, s.doctype += "<!" + s.sgmlDecl + N, s.sgmlDecl = "") : d.test(s.sgmlDecl + N) ? (T(s, "onopencdata"), s.state = f.CDATA, s.sgmlDecl = "", s.cdata = "") : w.test(s.sgmlDecl + N) ? (s.state = f.DOCTYPE, (s.doctype || s.sawRoot) && V(
                s,
                "Inappropriately located doctype declaration"
              ), s.doctype = "", s.sgmlDecl = "") : N === ">" ? (T(s, "onsgmldeclaration", s.sgmlDecl), s.sgmlDecl = "", s.state = f.TEXT) : (C(N) && (s.state = f.SGML_DECL_QUOTED), s.sgmlDecl += N);
              continue;
            case f.SGML_DECL_QUOTED:
              N === s.q && (s.state = f.SGML_DECL, s.q = ""), s.sgmlDecl += N;
              continue;
            case f.DOCTYPE:
              N === ">" ? (s.state = f.TEXT, T(s, "ondoctype", s.doctype), s.doctype = !0) : (s.doctype += N, N === "[" ? s.state = f.DOCTYPE_DTD : C(N) && (s.state = f.DOCTYPE_QUOTED, s.q = N));
              continue;
            case f.DOCTYPE_QUOTED:
              s.doctype += N, N === s.q && (s.q = "", s.state = f.DOCTYPE);
              continue;
            case f.DOCTYPE_DTD:
              N === "]" ? (s.doctype += N, s.state = f.DOCTYPE) : N === "<" ? (s.state = f.OPEN_WAKA, s.startTagPosition = s.position) : C(N) ? (s.doctype += N, s.state = f.DOCTYPE_DTD_QUOTED, s.q = N) : s.doctype += N;
              continue;
            case f.DOCTYPE_DTD_QUOTED:
              s.doctype += N, N === s.q && (s.state = f.DOCTYPE_DTD, s.q = "");
              continue;
            case f.COMMENT:
              N === "-" ? s.state = f.COMMENT_ENDING : s.comment += N;
              continue;
            case f.COMMENT_ENDING:
              N === "-" ? (s.state = f.COMMENT_ENDED, s.comment = U(s.opt, s.comment), s.comment && T(s, "oncomment", s.comment), s.comment = "") : (s.comment += "-" + N, s.state = f.COMMENT);
              continue;
            case f.COMMENT_ENDED:
              N !== ">" ? (V(s, "Malformed comment"), s.comment += "--" + N, s.state = f.COMMENT) : s.doctype && s.doctype !== !0 ? s.state = f.DOCTYPE_DTD : s.state = f.TEXT;
              continue;
            case f.CDATA:
              for (var B = A - 1; N && N !== "]"; )
                N = X(l, A++), N && s.trackPosition && (s.position++, N === `
` ? (s.line++, s.column = 0) : s.column++);
              s.cdata += l.substring(B, A - 1), N === "]" && (s.state = f.CDATA_ENDING);
              continue;
            case f.CDATA_ENDING:
              N === "]" ? s.state = f.CDATA_ENDING_2 : (s.cdata += "]" + N, s.state = f.CDATA);
              continue;
            case f.CDATA_ENDING_2:
              N === ">" ? (s.cdata && T(s, "oncdata", s.cdata), T(s, "onclosecdata"), s.cdata = "", s.state = f.TEXT) : N === "]" ? s.cdata += "]" : (s.cdata += "]]" + N, s.state = f.CDATA);
              continue;
            case f.PROC_INST:
              N === "?" ? s.state = f.PROC_INST_ENDING : M(N) ? s.state = f.PROC_INST_BODY : s.procInstName += N;
              continue;
            case f.PROC_INST_BODY:
              if (!s.procInstBody && M(N))
                continue;
              N === "?" ? s.state = f.PROC_INST_ENDING : s.procInstBody += N;
              continue;
            case f.PROC_INST_ENDING:
              if (N === ">") {
                const de = {
                  name: s.procInstName,
                  body: s.procInstBody
                };
                b(s, de), T(s, "onprocessinginstruction", de), s.procInstName = s.procInstBody = "", s.state = f.TEXT;
              } else
                s.procInstBody += "?" + N, s.state = f.PROC_INST_BODY;
              continue;
            case f.OPEN_TAG:
              D(y, N) ? s.tagName += N : (te(s), N === ">" ? R(s) : N === "/" ? s.state = f.OPEN_TAG_SLASH : (M(N) || V(s, "Invalid character in tag name"), s.state = f.ATTRIB));
              continue;
            case f.OPEN_TAG_SLASH:
              N === ">" ? (R(s, !0), L(s)) : (V(
                s,
                "Forward-slash in opening tag not followed by >"
              ), s.state = f.ATTRIB);
              continue;
            case f.ATTRIB:
              if (M(N))
                continue;
              N === ">" ? R(s) : N === "/" ? s.state = f.OPEN_TAG_SLASH : D(_, N) ? (s.attribName = N, s.attribValue = "", s.state = f.ATTRIB_NAME) : V(s, "Invalid attribute name");
              continue;
            case f.ATTRIB_NAME:
              N === "=" ? s.state = f.ATTRIB_VALUE : N === ">" ? (V(s, "Attribute without value"), s.attribValue = s.attribName, Z(s), R(s)) : M(N) ? s.state = f.ATTRIB_NAME_SAW_WHITE : D(y, N) ? s.attribName += N : V(s, "Invalid attribute name");
              continue;
            case f.ATTRIB_NAME_SAW_WHITE:
              if (N === "=")
                s.state = f.ATTRIB_VALUE;
              else {
                if (M(N))
                  continue;
                V(s, "Attribute without value"), s.tag.attributes[s.attribName] = "", s.attribValue = "", T(s, "onattribute", {
                  name: s.attribName,
                  value: ""
                }), s.attribName = "", N === ">" ? R(s) : D(_, N) ? (s.attribName = N, s.state = f.ATTRIB_NAME) : (V(s, "Invalid attribute name"), s.state = f.ATTRIB);
              }
              continue;
            case f.ATTRIB_VALUE:
              if (M(N))
                continue;
              C(N) ? (s.q = N, s.state = f.ATTRIB_VALUE_QUOTED) : (s.opt.unquotedAttributeValues || W(s, "Unquoted attribute value"), s.state = f.ATTRIB_VALUE_UNQUOTED, s.attribValue = N);
              continue;
            case f.ATTRIB_VALUE_QUOTED:
              if (N !== s.q) {
                N === "&" ? s.state = f.ATTRIB_VALUE_ENTITY_Q : s.attribValue += N;
                continue;
              }
              Z(s), s.q = "", s.state = f.ATTRIB_VALUE_CLOSED;
              continue;
            case f.ATTRIB_VALUE_CLOSED:
              M(N) ? s.state = f.ATTRIB : N === ">" ? R(s) : N === "/" ? s.state = f.OPEN_TAG_SLASH : D(_, N) ? (V(s, "No whitespace between attributes"), s.attribName = N, s.attribValue = "", s.state = f.ATTRIB_NAME) : V(s, "Invalid attribute name");
              continue;
            case f.ATTRIB_VALUE_UNQUOTED:
              if (!k(N)) {
                N === "&" ? s.state = f.ATTRIB_VALUE_ENTITY_U : s.attribValue += N;
                continue;
              }
              Z(s), N === ">" ? R(s) : s.state = f.ATTRIB;
              continue;
            case f.CLOSE_TAG:
              if (s.tagName)
                N === ">" ? L(s) : D(y, N) ? s.tagName += N : s.script ? (s.script += "</" + s.tagName + N, s.tagName = "", s.state = f.SCRIPT) : (M(N) || V(s, "Invalid tagname in closing tag"), s.state = f.CLOSE_TAG_SAW_WHITE);
              else {
                if (M(N))
                  continue;
                m(_, N) ? s.script ? (s.script += "</" + N, s.state = f.SCRIPT) : V(s, "Invalid tagname in closing tag.") : s.tagName = N;
              }
              continue;
            case f.CLOSE_TAG_SAW_WHITE:
              if (M(N))
                continue;
              N === ">" ? L(s) : V(s, "Invalid characters in closing tag");
              continue;
            case f.TEXT_ENTITY:
            case f.ATTRIB_VALUE_ENTITY_Q:
            case f.ATTRIB_VALUE_ENTITY_U:
              var Y, re;
              switch (s.state) {
                case f.TEXT_ENTITY:
                  Y = f.TEXT, re = "textNode";
                  break;
                case f.ATTRIB_VALUE_ENTITY_Q:
                  Y = f.ATTRIB_VALUE_QUOTED, re = "attribValue";
                  break;
                case f.ATTRIB_VALUE_ENTITY_U:
                  Y = f.ATTRIB_VALUE_UNQUOTED, re = "attribValue";
                  break;
              }
              if (N === ";") {
                var ce = H(s);
                s.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(ce) ? ((s.entityCount += 1) > s.opt.maxEntityCount && W(
                  s,
                  "Parsed entity count exceeds max entity count"
                ), (s.entityDepth += 1) > s.opt.maxEntityDepth && W(
                  s,
                  "Parsed entity depth exceeds max entity depth"
                ), s.entity = "", s.state = Y, s.write(ce), s.entityDepth -= 1) : (s[re] += ce, s.entity = "", s.state = Y);
              } else D(s.entity.length ? S : v, N) ? s.entity += N : (V(s, "Invalid character in entity name"), s[re] += "&" + s.entity + N, s.entity = "", s.state = Y);
              continue;
            default:
              throw new Error(s, "Unknown state: " + s.state);
          }
        return s.position >= s.bufferCheckPosition && r(s), s;
      }
      String.fromCodePoint || (function() {
        var l = String.fromCharCode, s = Math.floor, A = function() {
          var N = 16384, ee = [], B, Y, re = -1, ce = arguments.length;
          if (!ce)
            return "";
          for (var de = ""; ++re < ce; ) {
            var ae = Number(arguments[re]);
            if (!isFinite(ae) || // `NaN`, `+Infinity`, or `-Infinity`
            ae < 0 || // not a valid Unicode code point
            ae > 1114111 || // not a valid Unicode code point
            s(ae) !== ae)
              throw RangeError("Invalid code point: " + ae);
            ae <= 65535 ? ee.push(ae) : (ae -= 65536, B = (ae >> 10) + 55296, Y = ae % 1024 + 56320, ee.push(B, Y)), (re + 1 === ce || ee.length > N) && (de += l.apply(null, ee), ee.length = 0);
          }
          return de;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: A,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = A;
      })();
    })(t);
  })(Fe)), Fe;
}
var Ge, ht;
function tr() {
  if (ht) return Ge;
  ht = 1;
  var t = er().parser;
  function e(n) {
    var o = [], r = [], i = o, c;
    return c = t(!0), c.ontext = function(a) {
      a.trim() !== "" && i.push(a);
    }, c.onopentag = function(a) {
      var p;
      p = [a.name, a.attributes], r.push(i), i.push(p), i = p;
    }, c.onclosetag = function() {
      i = r.pop();
    }, c.write(n).close(), o[0];
  }
  return Ge = e, Ge;
}
var He, mt;
function nr() {
  if (mt) return He;
  mt = 1;
  function t(e, n) {
    var o = function() {
    }, r = o, i = o;
    function c() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function p(g) {
      this._name = g;
    }
    function h(g) {
      this._replace = g;
    }
    function u(g, d) {
      var w, E = { attr: {}, full: g }, x = {
        name: p,
        skip: c,
        // break: breakFn,
        remove: a,
        replace: h,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, I = !0, _, y, v;
      if (g !== void 0 && g !== null && g !== !0 && g !== !1)
        switch (w = Object.prototype.toString.call(g), w) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (g.some(function(S, M) {
              if (M === 0)
                return E.name = S, !1;
              if (M === 1)
                return Object.prototype.toString.call(S) === "[object Object]" && (I = !1, E.attr = S), !0;
            }), r.call(x, E, d), x._name && (g[0] = x._name), x._replace)
              return x._replace;
            if (x._remove)
              return null;
            if (!x._skip) {
              for (_ = 0, y = g.length; _ < y; ) {
                if (_ > 1 || _ === 1 && I) {
                  if (v = u(g[_], E), v === null) {
                    g.splice(_, 1), y -= 1;
                    continue;
                  }
                  v && (g[_] = v);
                }
                _ += 1;
              }
              if (i.call(x, E, d), x._name && (g[0] = x._name), x._replace)
                return x._replace;
              if (x._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (i = n.leave)), u(e, void 0);
  }
  return He = t, He;
}
var We, gt;
function rr() {
  if (gt) return We;
  gt = 1;
  const t = tr(), e = nr(), n = (r) => String(r).replace(/[&<>"']/g, (i) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[i]);
  function o(r) {
    const [i, ...c] = r, a = c[0] && typeof c[0] == "object" && !Array.isArray(c[0]) ? c.shift() : {}, p = "<" + i + Object.entries(a).map(([h, u]) => " " + h + '="' + n(u) + '"').join("");
    return c.length ? p + ">" + c.map((h) => Array.isArray(h) ? o(h) : n(h)).join("") + "</" + i + ">" : p + "/>";
  }
  return We = { parse: t, p: t, traverse: e, t: e, stringify: o, s: o }, We;
}
rr();
const $e = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), or = (t, e) => [...t].reduce((n, o) => n + (o.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function ir(t, e, n = 12) {
  const o = [], r = t.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }));
  for (const [c, a] of t.entries()) {
    if (!a.labels.length) continue;
    const p = Math.max(...a.labels.map((E) => or(E.text, n))) + 4, h = a.labels.length * (n + 4), u = [];
    for (const E of [5, 14, 28, 48]) {
      const x = { x: a.x + (a.w - p) / 2, y: a.y - E - h, w: p, h }, I = { x: a.x + (a.w - p) / 2, y: a.y + a.h + E, w: p, h }, _ = { x: a.x + a.w + E, y: a.y + (a.h - h) / 2, w: p, h }, y = { x: a.x - E - p, y: a.y + (a.h - h) / 2, w: p, h };
      u.push(...a.w > a.h ? [x, I, _, y] : [_, y, x, I]);
    }
    const g = (E) => e.reduce((x, I) => {
      const _ = Math.min(I.a.x, I.b.x), y = Math.min(I.a.y, I.b.y), v = { x: _ - 1, y: y - 1, w: Math.abs(I.a.x - I.b.x) + 2, h: Math.abs(I.a.y - I.b.y) + 2 };
      return x + $e(E, v) * 2;
    }, 0);
    let d = null, w = 1 / 0;
    for (const [E, x] of u.entries()) {
      const I = r.reduce((_, y, v) => _ + (v === c ? 0 : $e(x, y)) * 500, 0) + o.reduce((_, y) => _ + $e(x, y) * 100, 0) + g(x) + E * 3;
      I < w && (w = I, d = x);
    }
    a.labels.forEach((E, x) => {
      E.x = d.x - a.x, E.y = d.y - a.y + n + x * (n + 4);
    }), o.push(d);
  }
  const i = [...r, ...o];
  return { x: Math.min(0, ...i.map((c) => c.x)), y: Math.min(0, ...i.map((c) => c.y)), right: Math.max(0, ...i.map((c) => c.x + c.w)), bottom: Math.max(0, ...i.map((c) => c.y + c.h)) };
}
const sr = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function ar(t, e = 12) {
  const n = [...t.children].filter((i) => i.localName === "g" && i.id.startsWith("cell_")).map((i) => ({ ...sr(i.getAttribute("transform")), w: +i.getAttribute("s:width"), h: +i.getAttribute("s:height"), labels: [...i.children].filter((c) => c.localName === "text" && c.hasAttribute("data-layout-label")).map((c) => ({ node: c, text: c.textContent })) })), o = [...t.children].filter((i) => i.localName === "line" && i.hasAttribute("data-net")).map((i) => ({ a: { x: +i.getAttribute("x1"), y: +i.getAttribute("y1") }, b: { x: +i.getAttribute("x2"), y: +i.getAttribute("y2") } })), r = ir(n, o, e);
  for (const i of n) for (const c of i.labels)
    c.node.setAttribute("x", c.x), c.node.setAttribute("y", c.y), c.node.setAttribute("text-anchor", "start"), c.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
const bt = Pe.filter.source, Q = (t) => document.getElementById("spice-" + t), ye = Q("app");
if (ye) {
  let f = function() {
    const R = e.querySelector("svg");
    if (!R) return;
    const L = Number(R.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, H = ar(R, L), $ = Math.min(v.x, H.x - 20), K = Math.min(v.y, H.y - 20);
    v = { x: $, y: K, w: Math.max(v.x + v.w, H.right + 20) - $, h: Math.max(v.y + v.h, H.bottom + 20) - K }, p && Cn(R, h, p), a?.refreshColors(), Me(R, m(), Q("show-grid").checked, y);
    const X = R.cloneNode(!0);
    a?.cleanExport(X), X.setAttribute("width", v.w), X.setAttribute("height", v.h), X.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), Me(X, m(), Q("show-grid").checked, v), u = new XMLSerializer().serializeToString(X), Q("source").value = u;
  }, G = function(R) {
    const L = Q("example-info");
    if (L && (L.replaceChildren(), !!R && (L.append(document.createTextNode(R.description + " ")), R.url))) {
      const H = document.createElement("a");
      H.href = R.url, H.target = "_blank", H.rel = "noopener noreferrer", H.textContent = R.reference, L.append(H);
    }
  }, z = function() {
    a.invalidate(), P.setEnabled(!1), r = null, i = null, u = "", k(), G(Object.values(Pe).find((R) => R.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, ne = function(R) {
    o.replaceChildren();
    for (const { severity: L, line: H, message: $, source: K } of R) {
      const X = document.createElement("li");
      X.className = L, X.textContent = `${L.toUpperCase()}${K && K !== "input.cir" ? " · " + K : ""}${H ? " · line " + H : ""}: ${$}`, o.append(X);
    }
    Q("messages").open = R.some((L) => L.severity !== "info"), Q("message-count").textContent = `${R.length} message${R.length === 1 ? "" : "s"}`;
  }, b = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`);
    const R = e.querySelector("svg");
    R && Me(R, m(), Q("show-grid").checked, y), Q("zoom-level").textContent = Math.round(v.w / y.w * 100) + "%";
  }, F = function(R, L = y.x + y.w / 2, H = y.y + y.h / 2) {
    if (!e.querySelector("svg")) return;
    const $ = Math.max(0.05, Math.min(10, y.w * R / v.w)) * v.w / y.w;
    y = { x: L + (y.x - L) * $, y: H + (y.y - H) * $, w: y.w * $, h: y.h * $ }, b();
  }, W = function(R) {
    const L = new URLSearchParams();
    R && L.set("instance", R);
    const H = L.toString();
    location.hash.slice(1) === H ? (x = R, J()) : location.hash = H;
  }, j = function() {
    x = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, V = function() {
    const R = !!(I && I !== x && d?.contexts[I]);
    Q("selection-actions").hidden = !R, Q("open-instance").href = "#" + new URLSearchParams({ instance: I });
  }, te = function() {
    Q("breadcrumbs").replaceChildren();
    const R = (H, $) => {
      const K = document.createElement("button");
      K.type = "button", K.textContent = H, K.onclick = () => W($), K.disabled = $ === x, Q("breadcrumbs").append(K);
    };
    if (R("Top", ""), x) {
      const H = d.contexts[x].path;
      for (let $ = 0; $ < H.length; $++) R(H[$], H.slice(0, $ + 1).map(encodeURIComponent).join("/"));
    }
    Q("instances").replaceChildren();
    const L = (H, $) => {
      for (const K of H.children) {
        const X = document.createElement("div");
        X.className = "spice-instance-row", X.style.setProperty("--depth", Math.min($, 8)), X.dataset.instance = K.id;
        const ge = document.createElement("a");
        ge.href = "#" + new URLSearchParams({ instance: K.id }), ge.textContent = K.name + " · " + K.definition, ge.title = "Open " + K.id + " as its own sheet";
        const l = document.createElement("span");
        if (l.className = "spice-help", l.textContent = Object.entries(K.params).map(([s, A]) => s + "=" + A).join(" · "), X.append(ge), l.textContent) {
          const s = document.createElement("details"), A = document.createElement("summary");
          A.textContent = "Parameters", s.append(A, l), X.append(s);
        }
        Q("instances").append(X), L(K, $ + 1);
      }
    };
    L(d.contexts[x], 0), Q("hierarchy-panel").hidden = !d.contexts[x].children.length, Q("focus-title").textContent = x ? x + " / " + d.contexts[x].definition : "Top-level schematic", V();
  };
  zn(ye), Tn(ye);
  const t = Q("input"), e = Q("preview"), n = Q("status"), o = Q("diagnostics");
  let r = null, i = null, c = !1, a = null, p = null, h = [], u = "", g, d, w, E = "", x = "", I = "", _ = !1, y = { x: 0, y: 0, w: 1, h: 1 }, v = { ...y }, S, M = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ye.addEventListener("click", (R) => {
    _ && R.target.closest('a[href^="#"]') && R.preventDefault();
  });
  const k = () => {
    Q("copy").disabled = Q("download").disabled = !u || _ || a?.working(), Q("download-asc").disabled = Q("download-asc-bundle").disabled = !u || !r || _ || c || !a?.complete();
  }, D = () => ({ font: Q("font").value, fontSize: Number(Q("size").value), color: tt, gridSize: Q("grid").checked && Q("conventional").checked ? Ke : 0, detailed: Q("detailed").checked, conventional: Q("conventional").checked }), m = () => g?.layout.report?.gridSize ? Number(Q("grid-size").value) : 0, P = In(Q, (R, L) => {
    p = R, h = L, f();
  });
  a = Ln(e, Q, { getNetColor: (R) => {
    const L = h.find((H) => H.bit === R);
    return L && p && (p.auto || p.manual.has(L.name)) ? p.color(L.name) : null;
  }, inspect: (R) => {
    const L = g?.components.find((H) => H.name === R);
    L && (I = L.instanceId || "", Q("selection").textContent = L.raw, V());
  }, changed: (R, L, H) => {
    r = R, i = null, v = H;
    const $ = e.querySelector("svg");
    if ($) {
      $.setAttribute("width", String(v.w)), $.setAttribute("height", String(v.h));
      const K = $.querySelector("#spice-layout-report");
      if (K) {
        const X = JSON.parse(K.textContent);
        X.manualWiring = L, X.verifiedTerminals = !L.unrouted, X.geometricConnectivityVerified = !L.unrouted, K.textContent = JSON.stringify(X);
      }
    }
    g && w && (Q("json").value = JSON.stringify({ circuit: g, netlist: lt(g), hierarchy: w, interactive: { ...L, drawing: R } }, null, 2)), f(), k();
  } }), Q("show-grid").onchange = f, Q("grid-size").onchange = () => {
    f(), b();
  };
  async function q() {
    (!r || !g?.layout.report?.gridVerified) && (Q("grid").checked = !0, Q("conventional").checked = !0, await J({ resetEditor: !0 })), a.setEnabled(Q("interactive").checked), k();
  }
  Q("interactive").onchange = q, Q("flywire").onchange = async () => {
    Q("interactive").checked = !0, await q(), Q("flywire").checked ? a.clear() : await a.autoRoute(), k();
  }, Q("auto-route").onclick = async () => {
    Q("interactive").checked = !0, await q(), await a.autoRoute(), k();
  }, Q("wire-undo").onclick = () => a.undo(), Q("wire-redo").onclick = () => a.redo();
  for (const R of ye.querySelectorAll("[data-editor-mode]")) R.onclick = async () => {
    Q("interactive").checked = !0, await q(), a.chooseTool(R.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  P.setEnabled(!1), t.value = bt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || bt;
  } catch {
  }
  G(Object.values(Pe).find((R) => R.source === t.value)), t.addEventListener("input", z);
  for (const R of ["font", "size", "detailed", "conventional", "grid"]) Q(R).addEventListener("input", z);
  new ResizeObserver(() => {
    const R = e.querySelector("svg");
    R && Me(R, m(), Q("show-grid").checked, y);
  }).observe(e), Q("zoom-in").onclick = () => F(0.8), Q("zoom-out").onclick = () => F(1.25), Q("fit").onclick = () => {
    y = { ...v }, b();
  };
  const U = (R) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(R.clientX, R.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (R) => {
    const L = U(R);
    L && (R.preventDefault(), F(R.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (R) => {
    ![0, 1].includes(R.button) || !e.querySelector("svg") || (S = { start: U(R), x: R.clientX, y: R.clientY, view: { ...y }, moved: !1 }, e.setPointerCapture(R.pointerId));
  }), e.addEventListener("pointermove", (R) => {
    if (!S) return;
    const L = U(R);
    Math.hypot(R.clientX - S.x, R.clientY - S.y) > 4 && (S.moved = !0), y.x += S.start.x - L.x, y.y += S.start.y - L.y, b();
  }), e.addEventListener("pointerup", (R) => {
    if (!S) return;
    const L = S.moved;
    if (S = null, e.hasPointerCapture(R.pointerId) && e.releasePointerCapture(R.pointerId), !L) {
      const H = document.elementFromPoint(R.clientX, R.clientY)?.closest("[data-component]"), $ = g?.components.find((K) => K.name === H?.dataset.component);
      $ && (I = $.instanceId || "", Q("selection").textContent = `${$.raw}
${Object.entries($.terminals).map(([K, X]) => `${K} → ${X}`).join("   ")}`, $.kind === "X" ? W($.instanceId) : V());
    }
  }), window.addEventListener("hashchange", () => {
    if (_) {
      M = !0;
      return;
    }
    j(), I = "", J();
  }), e.addEventListener("pointercancel", () => {
    S = null;
  }), e.addEventListener("keydown", (R) => {
    const L = R.target.closest("[data-instance]");
    if (L && (R.key === "Enter" || R.key === " ")) {
      R.preventDefault(), I = L.dataset.instance, W(I);
      return;
    }
    R.key === "+" || R.key === "=" ? F(0.8) : R.key === "-" ? F(1.25) : R.key.toLowerCase() === "f" ? (y = { ...v }, b()) : R.key.startsWith("Arrow") && (R.preventDefault(), y.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[R.key] || 0) * y.w, y.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[R.key] || 0) * y.h, b());
  });
  async function J({ resetEditor: R = !1 } = {}) {
    if (_) return;
    _ = !0, a.invalidate(), P.setEnabled(!1), r = null, i = null, u = "", k(), Q("generate").disabled = !0, t.readOnly = !0, Q("file").disabled = !0, Q("libraries").disabled = !0;
    for (const H of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) H.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let L = [];
    try {
      if (E !== t.value || !d) {
        if (w = Wt(t.value, { files: C }), L = [...w.diagnostics], L.some((B) => B.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = Ze(w), E && E !== t.value ? (x = "", I = "", history.replaceState(null, "", location.pathname + location.search)) : j(), E = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (L = [...w.diagnostics], ne(L), L.some((B) => B.severity === "error")) throw Error("Fix the parser errors below before generating.");
      g = fn(d, { focus: x });
      for (const B of g.interfaceAliases) L.push({ severity: "info", message: `Instance boundary: ${B.ports.join(" = ")} share parent node ${B.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const H = lt(g);
      D().conventional && L.push(...g.layout.diagnostics);
      const $ = await mn(H, D()), K = new DOMParser().parseFromString($.svg, "image/svg+xml");
      if (K.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const X = K.documentElement, ge = X.querySelector("#spice-layout-report");
      if (ge) {
        g.layout.report = JSON.parse(ge.textContent);
        const B = g.layout.report;
        if (L.push({ severity: "info", message: `Layout: compact signal flow; ${B.powerSourcesChecked} DC/ground symbols checked, ${B.powerOrderViolations} DC order preference(s) unmet. ${B.powerPass}. ${B.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), B.classicTemplateFallback && L.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), B.groundPlacement && L.push({ severity: "info", message: `Ground: ${B.groundPlacement}; ${B.straightenedGroundDrops || 0} return-path simplification(s).` }), B.explicitGroups && L.push({ severity: "info", message: `Layout comments: ${B.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), B.classicRails && L.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${B.railCount} shared voltage rails.` }), B.localClassicInstances?.length && L.push({ severity: "info", message: `${B.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), B.localClassicStages?.length && L.push({ severity: "info", message: `Classic transistor proximity active: ${B.localClassicStages.join(", ")}.` }), B.sharedClassicRails && L.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), B.mirroredTransistors?.length && L.push({ severity: "info", message: `Control-pin mirror choices: ${B.mirroredTransistors.join(", ")}.` }), B.recognizedMotifs?.length && L.push({ severity: "info", message: `Transistor structures: ${B.recognizedMotifs.map((Y) => `${Y.kind} (${Y.members.join(", ")}; ${Y.confidence})`).join("; ")}.` }), B.appliedMotifs?.length && L.push({ severity: "info", message: `Topology preferences applied to ${B.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), B.subnetFirstFallback && L.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + B.subnetFirstFallback }), B.pairCompactionFallback && L.push({ severity: "warning", message: "Pair proximity kept the original regions: " + B.pairCompactionFallback }), B.compoundPairFallback && L.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + B.compoundPairFallback }), B.pairConstraints?.length) {
          const Y = B.pairConstraints.filter((re) => re.crossRegion && !re.compacted).length;
          L.push({ severity: "info", message: `${B.pairConstraints.length - Y} adjacent transistor pair(s); ${Y} cross-region mirror row constraint(s).` });
        }
        B.netShortcuts && L.push({ severity: "info", message: `${B.netShortcuts} safe straight net shortcut(s); ${B.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), B.sharedRailFallback && L.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${B.sharedRailFallback}.` });
        for (const Y of B.localClassicFallbacks || []) Y.stage && L.push({ severity: "info", message: `Classic stage ${Y.stage} uses automatic layout: ${Y.reason || "No unobstructed local template"}.` });
        B.geometricConnectivityVerified && L.push({ severity: "info", message: `Net geometry verified; ${B.cyclesRemoved} same-net loop(s) and ${B.leavesRemoved} unused wire branch(es) removed.` }), ne(L);
      }
      if (X.localName !== "svg" || X.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const l = Number(X.getAttribute("width")), s = Number(X.getAttribute("height")), A = JSON.parse(X.getAttribute("data-label-bounds") || "null");
      v = { x: Math.min(-20, (A?.x ?? 0) - 20), y: Math.min(-20, (A?.y ?? 0) - 20) }, v.w = Math.max(l, A?.right || 0) + 20 - v.x, v.h = Math.max(s, A?.bottom || 0) + 20 - v.y, y = { ...v }, X.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`), X.setAttribute("width", String(v.w)), X.setAttribute("height", String(v.h)), X.setAttribute("role", "img"), X.setAttribute("aria-label", g.title || "SPICE schematic"), X.setAttribute("style", "background:white");
      for (const B of g.components) {
        const Y = K.getElementById("cell_" + B.name);
        if (!Y) throw Error("Renderer omitted component " + B.name);
        Y.setAttribute("data-component", B.name), B.kind === "X" && (Y.setAttribute("data-instance", B.instanceId), Y.setAttribute("role", "button"), Y.setAttribute("tabindex", "0"), Y.setAttribute("aria-label", "Open " + B.name));
        const re = K.createElementNS(X.namespaceURI, "title");
        re.textContent = B.raw + `
Resolved: ` + B.value + `
` + Object.entries(B.terminals).map(([ce, de]) => ce + ": " + de).join(", "), Y.prepend(re);
      }
      for (const B of Object.values(g.nodes))
        for (const Y of X.querySelectorAll(".net_" + B.bit)) {
          Y.setAttribute("data-net", B.name);
          const re = K.createElementNS(X.namespaceURI, "title");
          re.textContent = "Node " + B.displayName, Y.append(re);
        }
      const N = g.components.filter((B) => B.kind === "K").map((B) => ({ name: B.name, inductors: B.coupledInductors, value: B.value }));
      if (N.length) {
        const B = K.createElementNS(X.namespaceURI, "metadata");
        B.setAttribute("id", "spice-magnetic-couplings"), B.textContent = JSON.stringify(N), X.append(B);
        for (const Y of N) for (const re of Y.inductors) {
          const ce = K.getElementById("cell_" + re);
          if (!ce) continue;
          const de = K.createElementNS(X.namespaceURI, "circle"), ae = [...ce.children].find((we) => we.getAttribute("s:pid") === "A"), he = ae?.getAttribute("s:position"), Oe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[he] || [0, 0];
          for (const [we, ke] of Object.entries({ cx: Number(ae?.getAttribute("s:x")) + Oe[0], cy: Number(ae?.getAttribute("s:y")) + Oe[1], r: 3, fill: D().color, stroke: "none", "data-coupling": Y.name })) de.setAttribute(we, String(ke));
          const Te = K.createElementNS(X.namespaceURI, "title");
          Te.textContent = Y.name + " · dotted terminal: " + Y.inductors.join(", "), de.append(Te), ce.append(de);
        }
      }
      r = $.drawing, u = new XMLSerializer().serializeToString(X), Q("source").value = u, e.replaceChildren(document.importNode(X, !0)), b();
      const ee = L.filter((B) => B.severity === "warning").length;
      n.textContent = `${g.components.filter((B) => !B.synthetic).length} components · ${Object.keys(g.nodes).length} nodes · ${g.topology.leafCount} primitive devices verified${g.interfaceAliases.length ? " · Parent-connected ports: " + g.interfaceAliases.map((B) => B.ports.join(" = ")).join("; ") + "." : ""}${ee ? " · Review " + ee + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${ze}.`, g.layout.report?.gridVerified && (n.textContent += ` Grid ${g.layout.report.gridSize}.`), g.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${g.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), g.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), Q("json").value = JSON.stringify({ circuit: g, netlist: H, hierarchy: w }, null, 2), P.setCircuit(g, t.value), a.mount(e.querySelector("svg"), r, g, H, D(), { reset: R }), f(), Q("selection").textContent = "Click a component to inspect its original statement and pin connections.", te();
    } catch (H) {
      if (e.replaceChildren(), u = "", Q("source").value = "", Q("json").value = "", Q("nets").replaceChildren(), Q("selection").textContent = "", n.textContent = H.message, !d)
        Q("hierarchy-panel").hidden = !0, Q("selection-actions").hidden = !0, Q("breadcrumbs").replaceChildren();
      else if (!d.contexts[x]) {
        const $ = document.createElement("button");
        $.type = "button", $.textContent = "Return to Top", $.onclick = () => W(""), Q("breadcrumbs").replaceChildren($);
      }
      P.setCircuit(null, t.value), H.diagnostics && (L = H.diagnostics), L.some(($) => $.severity === "error") || L.push({ severity: "error", line: 0, message: H.message }), ne(L);
    } finally {
      _ = !1, Q("generate").disabled = !1, t.readOnly = !1, Q("file").disabled = !1, Q("libraries").disabled = !1;
      for (const H of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) H.disabled = !1;
      d && d.contexts[x] && te(), P.setEnabled(!!u), e.setAttribute("aria-busy", "false"), k(), M && (M = !1, j(), queueMicrotask(J));
    }
  }
  Q("generate").onclick = () => J({ resetEditor: !0 });
  for (const R of ye.querySelectorAll("[data-example]")) R.onclick = () => {
    const L = Pe[R.dataset.example];
    t.value = L.source, z(), G(L), J();
  };
  Q("file").onchange = async (R) => {
    const L = R.target.files[0];
    if (L) {
      if (L.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await ut(L), z(), J();
      } catch (H) {
        n.textContent = "File could not be read: " + H.message;
      } finally {
        R.target.value = "";
      }
    }
  }, Q("libraries").onchange = async (R) => {
    try {
      for (const L of R.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        C[L.webkitRelativePath || L.name] = await ut(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      d = null, E = "", Q("library-status").textContent = Object.keys(C).length + " library file(s) loaded", J();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      R.target.value = "";
    }
  }, Q("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", Q("download").onclick = () => {
    const R = URL.createObjectURL(new Blob([u], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = R, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(R), 1e3);
  };
  async function Z(R) {
    const L = r;
    if (!(!L || _ || c)) {
      c = !0, k(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: H } = await import("./asc-export-DX1XVWYA.js");
        if (r !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        i ||= H({ tree: d, circuit: g, drawing: L, source: t.value, libraries: C });
        const $ = R ? i.zip : i.ascBytes, K = URL.createObjectURL(new Blob([$], { type: R ? "application/zip" : "application/octet-stream" })), X = document.createElement("a");
        X.href = K, X.download = R ? "spice-schematic-asc.zip" : "spice-schematic.asc", X.click(), setTimeout(() => URL.revokeObjectURL(K), 1e3), n.textContent = "ASC connections verified · " + i.manifest.audit.symbols + " symbols. " + (R ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), i.manifest.warnings.length && (n.textContent += " " + i.manifest.warnings.join(" "));
      } catch (H) {
        n.textContent = "ASC export failed: " + H.message;
        const $ = document.createElement("li");
        $.className = "error", $.textContent = n.textContent, o.append($);
      } finally {
        c = !1, k();
      }
    }
  }
  Q("download-asc").onclick = () => Z(!1), Q("download-asc-bundle").onclick = () => Z(!0), Q("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(u), n.textContent = "SVG source copied to clipboard.";
    } catch {
      Q("source-details").open = !0, Q("source").focus(), Q("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, J();
}
export {
  Xe as b,
  Ze as e,
  Ce as l,
  qe as n,
  zt as p
};
