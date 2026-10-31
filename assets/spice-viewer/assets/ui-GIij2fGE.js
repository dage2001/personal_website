const _t = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, xt = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, Nt = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, vt = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Ct = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, It = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Tt = { 1: "a", 2: "b", 7: "Q", 8: "com" }, St = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, At = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Ot = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, kt = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, Rt = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, Lt = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Mt = {
  AND: _t,
  BUF: xt,
  COUNTER: Nt,
  DFLOP: vt,
  SCHMITT: Ct,
  OR: It,
  PHASEDET: Tt,
  SRFLOP: St,
  XOR: At,
  MODULATOR: Ot,
  OTA: kt,
  SAMPLEHOLD: Rt,
  VARISTOR: Lt
}, Pt = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", xe = (t) => t.toLowerCase(), tt = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), Dt = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Ut(t, e) {
  const n = (I) => e[xe(I || "")] || Object.entries(e).find(([_]) => _.startsWith(xe(I || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], s = [], c = "", a = "", f = [], h = [], u = 0, m = "", d = "", y = "", E = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], a = xe(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], a = o === "D" ? "d_v" : o === "B" ? "spice_b" : xe(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !tt(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), c = t[r.length + 1] || "";
    const I = n(c)?.type;
    E = ["NPN", "PNP"].includes(I), a = E ? (r.length === 3 ? "q_" : "spice_q4_") + xe(I) : "spice_q" + r.length;
  } else if (o === "M") {
    const I = n(t[4]), _ = n(t[5]), b = I?.type === "VDMOS" || !_ && (!t[5] || tt(t[5]));
    r = b ? ["D", "G", "S"] : ["D", "G", "S", "B"], c = t[r.length + 1] || "";
    const N = n(c), T = N?.type;
    if (b && N && T !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!b && T === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    E = ["NMOS", "PMOS", "VDMOS"].includes(T);
    let M = null, C = N;
    const R = /* @__PURE__ */ new Set();
    for (; C && !R.has(C.name) && (R.add(C.name), M = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !M); )
      C = n(C.baseModel);
    const B = T === "PMOS" || T === "VDMOS" && M && (M[1] === void 0 || Number(M[1]) >= 0.5);
    a = E ? "spice_" + (B ? "pmos" : "nmos") + (b ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    c = t[4] || "";
    const I = n(c)?.type, _ = o === "Z" && ["NIGBT", "PIGBT"].includes(I);
    r = _ ? ["C", "G", "E"] : ["D", "G", "S"], E = o === "J" ? ["NJF", "PJF"].includes(I) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(I), a = "spice_" + (_ ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(I || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], a = "spice_" + xe(o);
    let I = 3, _ = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[I] || "");
    if (/^poly$/i.test(t[I] || "") && (_ = /^\(\s*(\d+)\s*\)$/.exec(t[++I] || ""), !_))
      throw Error("POLY requires a dimension.");
    if (_) {
      const b = Number(_[1]);
      if (b > 128) throw Error("POLY supports at most 128 controlling variables.");
      let N = I + 1, T = [];
      const M = "EG".includes(o), C = b * (M ? 2 : 1);
      for (; T.length < C && N < t.length; ) T.push(...Dt(t[N++]));
      if (T.length !== C || N >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (M) {
        for (let R = 0; R < b; R++) r.push("C" + (R + 1) + "+", "C" + (R + 1) + "-");
        s = [t[1], t[2], ...T];
      } else f = T;
      u = N, m = "POLY(" + b + ") " + (M ? "" : T.join(" ") + " "), d = "POLY", M && (a = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? d = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), d = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (f = [t[3]], u = 4, m = t[3] + " ");
    y = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (d ? " · " + d : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], c = t[5] || "", a = "spice_device", y = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], f = [t[3]], c = t[4] || "", u = 3, a = "spice_device", y = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (c = t[5] || ""), a = "spice_device", y = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], c = t[4] || "", a = "spice_device", y = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (I, _) => "P" + (_ + 1)), a = "spice_device", y = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (h = t.slice(1, -1), h.some((I) => !/^L/i.test(I.split(":").at(-1)))) throw Error("K references must name inductors.");
    u = t.length - 1, a = "spice_coupling", y = "Magnetic coupling", m = h.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], a = "spice_device", y = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], a = "spice_device", y = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], a = "spice_device", y = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (u || (u = r.length + 1), s.length || (s = t.slice(1, r.length + 1)), s.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= u && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (s.some((I) => /[=()]/.test(I) && !/^\{[\s\S]*\}$/.test(I))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(u).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(u).join(" ")) && (a = "spice_br"), o === "D" && (c = t[3] || ""), o === "@") {
    const I = t.slice(u).join(" ");
    for (const _ of I.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(_[1].toUpperCase()), s.push(_[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (f.some((I) => !I)) throw Error("Missing controlling voltage source.");
  const w = r.map((I, _) => o === "A" && Mt[(t[9] || "").toUpperCase()]?.[String(_ + 1)] || I);
  return { kind: o, pins: r, nodeTokens: s, pinLabels: w, model: c, type: a, controlSource: f[0] || "", controlSources: f, coupledInductors: h, value: m + t.slice(u).join(" "), sourceMode: d, symbol: y, polarityKnown: E };
}
const Bt = Pt, Qt = new Set(Bt.split(" ")), Ue = () => /* @__PURE__ */ Object.create(null), me = (t) => t.toLowerCase();
function Me(t) {
  const e = [], n = [];
  let o = "", r = 0, s = "";
  for (let c = 0; c < t.length; c++) {
    const a = t[c];
    if (s) {
      o += a, a === s && t[c - 1] !== "\\" && (s = "");
      continue;
    }
    if (a === '"' || a === "'") {
      s = a, o += a;
      continue;
    }
    if (!r && (a === ";" || a === "$" && (!c || /\s/.test(t[c - 1])))) break;
    if ("({".includes(a) && (n.push(a), r++), ")}".includes(a) && (r--, n.pop() !== (a === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(a) && !r ? (o && e.push(o), o = "") : o += a;
  }
  if (r || s) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function jt(t, e = {}) {
  const n = [], o = [], r = [], s = Object.assign(Ue(), e.models), c = Ue(), a = (_, b, N) => n.push({ severity: _, line: b, message: N });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const f = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((_, b) => {
    const N = _.trim();
    !N || N.startsWith("*") || (N.startsWith("+") ? f.length ? f.at(-1).text += " " + N.slice(1).trim() : a("error", b + 1, "Continuation has no preceding statement.") : f.push({ line: b + 1, text: N }));
  });
  for (const _ of f) {
    try {
      _.tokens = Me(_.text);
    } catch (N) {
      a("error", _.line, N.message), _.tokens = [];
    }
    const b = _.tokens;
    if (/^\.model$/i.test(b[0] || ""))
      if (b.length < 3) a("error", _.line, ".model requires a name and device type.");
      else {
        const N = /^ako:(.+)$/i.exec(b[2]), T = N && b[3] && !b[3].startsWith("(") ? b[3].split("(")[0].toUpperCase() : "";
        s[me(b[1])] = { name: b[1], type: N ? T : b[2].split("(")[0].toUpperCase(), baseModel: N?.[1] || "", raw: _.text };
      }
  }
  const h = /* @__PURE__ */ new Set();
  function u(_) {
    const b = s[me(_)];
    if (!b) return "";
    if (b.type) return b.type;
    if (h.has(me(_))) throw Error("Circular AKO model inheritance: " + _);
    return h.add(me(_)), b.type = u(b.baseModel), h.delete(me(_)), b.type;
  }
  for (const _ of Object.values(s)) if (_.baseModel && !_.type)
    try {
      u(_.name);
    } catch (b) {
      a("error", 0, b.message);
    }
  let m = "", d = 0, y = !1, E = !1;
  const w = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: _, text: b, tokens: N } of f) {
    if (!N.length) continue;
    const T = me(N[0]);
    if (E) {
      a("warning", _, "Statement after .end is not rendered: " + b);
      continue;
    }
    if (T === ".control") {
      y = !0, a("warning", _, ".control script retained but not executed or rendered.");
      continue;
    }
    if (T === ".endc") {
      y = !1;
      continue;
    }
    if (y) continue;
    if (T === ".subckt") {
      d++, a("error", _, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (T === ".ends") {
      d ? d-- : a("error", _, "Unmatched .ends.");
      continue;
    }
    if (d) continue;
    if (T === ".end") {
      E = !0;
      continue;
    }
    if (T.startsWith(".")) {
      o.push({ line: _, text: b }), T === ".title" ? m = N.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(T) ? a("error", _, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(T) ? a("error", _, "Topology-changing directive is unsupported: " + b) : I.has(T) || a("warning", _, "Directive retained but not resolved: " + b);
      continue;
    }
    const M = N[0][0].toUpperCase();
    if (!Qt.has(M)) {
      _ === 1 && !/\d/.test(N[0]) && N.length > 1 && M !== "X" ? (m = b, a("warning", _, "First line treated as a SPICE title; use .title for an unambiguous title.")) : a("warning", _, `Unsupported ${M} device was not rendered: ${b}`);
      continue;
    }
    const C = M === "M" || M === "Q" ? 5 : 4;
    if (_ === 1 && !/\d/.test(N[0]) && (N.length < C || M === "T" && !/\b(?:zo|z0)\s*=/i.test(b))) {
      m = b, a("info", _, "SPICE title: " + b);
      continue;
    }
    try {
      if (w.has(T)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const R = Ut(N, s), { pins: B, nodeTokens: g, ...p } = R;
      R.polarityKnown || a("warning", _, `${N[0]}: model polarity unknown; explicit ${B.join("/")} terminals retained.`);
      const D = Ue();
      B.forEach((X, W) => {
        const Z = me(g[W]);
        c[Z] || (c[Z] = { name: Z, displayName: N[W + 1], bit: Object.keys(c).length + 2, terminals: [] }), c[Z].terminals.push({ component: N[0], pin: X }), D[X] = Z;
      }), r.push({ ...p, name: N[0], terminals: D, line: _, raw: b }), w.add(T);
    } catch (R) {
      a("error", _, `${N[0]}: ${R.message} Statement: ${b}`);
    }
  }
  d && a("error", 0, "Unclosed .subckt definition."), y && a("error", 0, "Unclosed .control block."), r.length || a("error", 0, "No supported components to render."), r.length > 300 && a("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const _ of r) {
    for (const b of _.controlSources || []) !b.includes(":") && !r.some((N) => me(N.name) === me(b) && N.kind === "V") && a("error", _.line, `${_.name}: controlling voltage source ${b} was not found.`);
    for (const b of _.coupledInductors || []) !b.includes(":") && !r.some((N) => me(N.name) === me(b) && N.kind === "L") && a("error", _.line, `${_.name}: coupled inductor ${b} was not found.`);
    (_.kind === "B" || _.type === "spice_b") && a("info", _.line, `${_.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: m, components: r, nodes: c, models: s, directives: o, diagnostics: n };
}
const Ee = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), nt = (t) => Ee(t).split("/").at(-1);
function Vt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], s = [], c = [];
  let a = 0;
  const f = (u, m) => {
    const d = Ee(m).split("/").slice(0, -1).concat(Ee(u)).join("/"), y = [...o].filter(([w]) => Ee(w) === Ee(u) || Ee(w) === d);
    if (y.length === 1) return y[0];
    const E = [...o].filter(([w]) => nt(w) === nt(u));
    if (E.length !== 1) throw Error(E.length ? "Ambiguous library filename: " + u : "Missing library " + u + ". Add this file using Library files.");
    return E[0];
  };
  function h(u, m, d = "", y = []) {
    const E = Ee(m) + ":" + d.toLowerCase();
    if (y.includes(E)) throw Error("Circular library include: " + [...y, E].join(" → "));
    if (y.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const w = [], I = /^\s*\.endl\b/im.test(u);
    let _ = !d;
    const b = (T, M) => {
      if (a += T.length, a > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      c.push(T), s.push({ file: m, line: M + 1 });
    };
    if (u.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((T, M) => {
      const C = T.trim();
      if (/^\.lib\b/i.test(C) && I) {
        const R = Me(C);
        if (R.length === 2 && !/[.\\/]/.test(R[1])) {
          w.push(R[1].toLowerCase()), R[1].toLowerCase() === d.toLowerCase() && (_ = !0), b("* Library section " + R[1], M);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        w.pop(), b("* End library section", M);
        return;
      }
      if (d && w.length && !w.includes(d.toLowerCase())) {
        b("* Unselected library section", M);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const R = Me(C);
          if (!R[1]) throw Error("Include requires a filename.");
          const [B, g] = f(R[1], m);
          b("* Included " + B, M), h(g, B, R[2] || "", [...y, E]);
        } catch (R) {
          r.push({ severity: "error", line: M + 1, source: m, message: R.message }), b("* Unresolved include", M);
        }
      else b(T, M);
    }), !_) throw Error("Library section " + d + " not found in " + m);
  }
  try {
    h(t, n);
  } catch (u) {
    r.push({ severity: "error", line: 0, source: n, message: u.message });
  }
  return { source: c.join(`
`), origins: s, diagnostics: r };
}
function Ft(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((a, f) => {
    const h = a.trim();
    /^\.subckt\b/i.test(h) && (o.push(f + 1), n.set(f + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: a, line: f + 1 }) : e[f] = a, /^\.ends\b/i.test(h) && o.length > 1 && o.pop();
  });
  const s = rt(Array.from({ length: t.split(/\r?\n/).length }, (a, f) => e[f] || "").join(`
`));
  r.push(...s.diagnostics);
  const c = /* @__PURE__ */ new Map();
  for (const [a, f] of n) {
    const h = rt(f.map((u) => u.raw).join(`
`));
    c.set(a, h.layout), r.push(...h.diagnostics.map((u) => ({ ...u, line: f[u.line - 1]?.line || a })));
  }
  return { layout: s.layout, scopes: c, diagnostics: r };
}
function rt(t) {
  const e = [], n = [];
  let o = !1, r = !1, s = 0;
  if (t.split(/\r?\n/).forEach((b, N) => {
    const T = b.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(T)) {
      (r || o) && e.push({ severity: "error", line: N + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(T) || e.push({ severity: "error", line: N + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, s = N + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(T)) {
      o || e.push({ severity: "error", line: N + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (T.startsWith("*") ? n.push(T.slice(1).trim()) : e.push({ severity: "error", line: N + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: s, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const c = n.join(" "), a = c.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], f = [], h = [], u = [], m = [];
  let d = 0, y = 0, E = 10;
  const w = () => a[d++], I = () => {
    const b = w();
    if (!b || !/^[A-Za-z_@][\w./%:@-]*$/.test(b)) throw Error("Expected layout identifier, got " + b);
    return b;
  };
  function _(b) {
    if (f.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const N = b ? I() : "@row" + y++, T = w();
    if (!["row", "column", "classic"].includes(T)) throw Error("Expected row, column or classic.");
    if (w() !== "{") throw Error("Expected { after " + T);
    const M = { id: N, direction: T, members: [] };
    for (f.push(M); d < a.length && a[d] !== "}"; )
      a[d] === "group" ? (w(), M.members.push(_(!0))) : ["row", "column"].includes(a[d]) ? M.members.push(_(!1)) : M.members.push(I());
    if (w() !== "}") throw Error("Unclosed group " + N);
    if (!M.members.length) throw Error("Empty layout group " + N);
    return N;
  }
  try {
    for (; d < a.length; )
      if (a[d] === "group")
        w(), _(!0);
      else if (["row", "column"].includes(a[d])) _(!1);
      else if (a[d] === "face") {
        w();
        const g = I(), p = w();
        if (!["left", "right"].includes(p)) throw Error("Expected face left or right.");
        if (m.some((D) => D.device.toLowerCase() === g.toLowerCase())) throw Error("Duplicate face device.");
        m.push({ device: g, side: p });
      } else if (a[d] === "pair") {
        w();
        const g = w();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(g)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (w() !== "{") throw Error("Expected { after pair kind.");
        const p = [];
        for (; d < a.length && a[d] !== "}"; ) p.push(I());
        if (w() !== "}" || !p.length) throw Error("Empty or unclosed pair.");
        if (u.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        u.push({ kind: g, members: p });
      } else if (a[d] === "priority-cap") {
        if (w(), E = Number(w()), !Number.isInteger(E) || E < 3 || E > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (w() === "place") {
        const g = I(), p = w(), D = I();
        if (!["left-of", "above"].includes(p)) throw Error("Expected left-of or above.");
        h.push({ a: g, relation: p, b: D });
      } else throw Error("Unknown layout instruction near " + a[d - 1]);
    const b = /* @__PURE__ */ new Set();
    for (const g of f) {
      const p = g.id.toLowerCase();
      if (b.has(p)) throw Error("Duplicate layout group " + g.id);
      b.add(p);
    }
    const N = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set(), M = new Map(f.map((g) => [g.id.toLowerCase(), g])), C = (g) => {
      if (N.has(g)) throw Error("Circular layout group " + g);
      if (!T.has(g)) {
        N.add(g);
        for (const p of M.get(g).members) M.has(p.toLowerCase()) && C(p.toLowerCase());
        N.delete(g), T.add(g);
      }
    };
    for (const g of M.keys()) C(g);
    const R = /* @__PURE__ */ new Map();
    for (const g of h) {
      if (g.a.toLowerCase() === g.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      R.has(g.a.toLowerCase()) || R.set(g.a.toLowerCase(), []), R.get(g.a.toLowerCase()).push(g.b.toLowerCase());
    }
    N.clear(), T.clear();
    const B = (g) => {
      if (N.has(g)) throw Error("Circular place constraints.");
      if (!T.has(g)) {
        N.add(g);
        for (const p of R.get(g) || []) B(p);
        N.delete(g), T.add(g);
      }
    };
    for (const g of R.keys()) B(g);
  } catch (b) {
    e.push({ severity: "error", line: s, message: "Layout description: " + b.message });
  }
  return { layout: { version: 1, priorityCap: E, groups: f, relations: h, pairs: u, faces: m }, diagnostics: e };
}
function Gt(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const y = new Set(n.groups.map((w) => w.id.toLowerCase())), E = (w) => y.has(w.toLowerCase()) ? w : e.components.find((_) => _.synthetic && _.value.toLowerCase() === w.toLowerCase())?.name || e.focus + "/" + w;
    o = { ...n, groups: n.groups.map((w) => ({ ...w, members: w.members.map(E) })), relations: n.relations.map((w) => ({ ...w, a: E(w.a), b: E(w.b) })), faces: (n.faces || []).map((w) => ({ ...w, device: E(w.device) })), pairs: (n.pairs || []).map((w) => ({ ...w, members: w.members.map(E) })) };
  }
  const r = new Map(o.groups.map((y) => [y.id.toLowerCase(), y])), s = Object.values(t.contexts).flatMap((y) => y.devices.map((E) => E.name)), c = new Set([...Object.keys(t.contexts), ...s, ...e.components.map((y) => y.name)].map((y) => y.toLowerCase()));
  for (const y of r.values()) if (c.has((n ? e.focus + "/" + y.id : y.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + y.id);
  for (const y of r.values()) for (const E of y.members) if (!r.has(E.toLowerCase()) && !c.has(E.toLowerCase())) throw Error("Unknown @layout instance/device: " + E);
  for (const y of o.relations) for (const E of [y.a, y.b]) if (!r.has(E.toLowerCase()) && !c.has(E.toLowerCase())) throw Error("Unknown @layout place target: " + E);
  const a = (o.pairs || []).map((y) => ({ ...y, members: y.members.map((E) => {
    const w = e.components.find((I) => I.name.toLowerCase() === E.toLowerCase());
    if (!w || w.synthetic || w.block) throw Error("Unknown or non-visible @layout pair device: " + E);
    return w.name;
  }) })), f = (o.faces || []).map((y) => {
    const E = e.components.find((w) => w.name.toLowerCase() === y.device.toLowerCase());
    if (!E || !["Q", "M", "J", "Z"].includes(E.kind)) throw Error("Unknown or unsupported @layout face device: " + y.device);
    return { ...y, device: E.name };
  }), h = /* @__PURE__ */ new Map(), u = [], m = new Set(Object.keys(t.contexts).map((y) => y.toLowerCase()));
  for (const y of o.groups) {
    const E = [];
    for (const w of y.members) {
      if (r.has(w.toLowerCase())) {
        E.push({ group: w });
        continue;
      }
      for (const I of e.components) if (I.name.toLowerCase() === w.toLowerCase() || I.name.toLowerCase().startsWith(w.toLowerCase() + "/")) {
        if (h.has(I.name)) throw Error("Overlapping @layout membership: " + I.name);
        h.set(I.name, y.id), E.push({ cell: I.name, ...m.has(w.toLowerCase()) ? { instance: w } : {} });
      }
    }
    u.push({ id: y.id, direction: y.direction, members: E });
  }
  const d = /* @__PURE__ */ new Set();
  for (const y of u) for (const E of y.members) if (E.group) {
    const w = E.group.toLowerCase();
    if (d.has(w)) throw Error("Layout group has multiple parents: " + E.group);
    d.add(w);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: u, relations: o.relations, pairs: a, faces: f };
}
const ve = () => /* @__PURE__ */ Object.create(null), fe = (t) => t.toLowerCase();
function bt(t) {
  const e = ve();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const s = fe(r[1]);
    let c = r[2];
    if (c === void 0) {
      const a = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!a) throw Error("Expected = after parameter " + s);
      c = a[1];
    }
    if (c || (c = t[++n]), !c || /^params?:$/i.test(c)) throw Error("Missing value for parameter " + s);
    if (Object.hasOwn(e, s)) throw Error("Duplicate parameter: " + s);
    e[s] = c;
  }
  return e;
}
function ot(t) {
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ve()] : [t.slice(0, e), bt(t.slice(e))];
}
function Ht(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = Vt(t, e);
  t = n.source;
  const o = Ft(t), r = [...n.diagnostics, ...o.diagnostics], s = ve(), c = /* @__PURE__ */ new Set(["0"]), a = (b, N, T) => r.push({ severity: b, line: N, message: T }), f = (b, N, T, M = [], C = ve(), R = 0) => {
    const B = { id: b, name: N, parent: T, ports: M, defaults: C, parameters: ve(), definitions: ve(), devices: [], instances: [], directives: [], line: R, statements: [], layoutDescription: o.scopes.get(R) || null };
    return s[b] = B, B;
  }, h = f("root", "Top", null), u = [h], m = [];
  let d = !1, y = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, N) => {
    const T = b.trim();
    !T || T.startsWith("*") || (T.startsWith("+") ? m.length ? m.at(-1).text += " " + T.slice(1).trim() : a("error", N + 1, "Continuation has no preceding statement.") : m.push({ text: T, line: N + 1 }));
  });
  for (const { text: b, line: N } of m)
    try {
      const T = Me(b);
      if (!T.length) continue;
      const M = fe(T[0]), C = u.at(-1);
      if (y) {
        a("warning", N, "Statement after .end is not rendered: " + b);
        continue;
      }
      if (M === ".control") {
        d = !0, a("warning", N, ".control script retained but not executed or rendered.");
        continue;
      }
      if (M === ".endc") {
        d = !1;
        continue;
      }
      if (d) continue;
      if (M === ".subckt") {
        if (T.length < 2) throw Error(".SUBCKT requires a name.");
        const [R, B] = ot(T.slice(2)), g = fe(T[1]);
        if (Object.hasOwn(C.definitions, g)) throw Error("Duplicate subcircuit definition: " + T[1]);
        const p = R.map(fe);
        if (new Set(p).size !== R.length || p.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (R.some((X) => /[{}()=]/.test(X))) throw Error("Invalid formal port.");
        if (u.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const D = C.id + "/" + encodeURIComponent(g);
        C.definitions[g] = D, u.push(f(D, T[1], C.id, R, B, N));
        continue;
      }
      if (M === ".ends") {
        if (u.length === 1) throw Error("Unmatched .ENDS.");
        if (T[1] && fe(T[1]) !== fe(C.name)) throw Error(".ENDS name does not match " + C.name);
        u.pop();
        continue;
      }
      if (M === ".end") {
        if (u.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        y = !0;
        continue;
      }
      if (M === ".param") {
        const R = bt(T.slice(1));
        for (const [B, g] of Object.entries(R)) {
          if (Object.hasOwn(C.parameters, B)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + B);
          C.parameters[B] = g;
        }
      }
      if (M === ".global") {
        if (T.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const R of T.slice(1)) c.add(fe(R));
      }
      if (M.startsWith(".") && C.directives.push({ line: N, text: b }), M.startsWith("x")) {
        const [R, B] = ot(T.slice(1));
        if (!R.length) throw Error("X instance requires a subcircuit name.");
        const g = /;§pnba\s+(.+)$/i.exec(b)?.[1].split(")");
        C.instances.push({ name: T[0], nodes: R.slice(0, -1).map(fe), definitionName: R.at(-1), definitionId: null, parameters: B, line: N, raw: b, pinNames: g });
      } else C.statements.push({ line: N, text: b });
    } catch (T) {
      a("error", N, T.message + " Statement: " + b);
    }
  u.length > 1 && a("error", u.at(-1).line, "Unclosed .SUBCKT " + u.at(-1).name), d && a("error", 0, "Unclosed .control block.");
  function E(b, N) {
    for (; b; ) {
      if (Object.hasOwn(b.definitions, fe(N))) return b.definitions[fe(N)];
      b = s[b.parent];
    }
    return null;
  }
  for (const b of Object.values(s)) {
    const N = [...b.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...b.statements], T = jt(N.map((C) => C.text).join(`
`), { models: s[b.parent]?.models });
    b.devices = T.components.map((C) => ({ ...C, line: N[C.line - 1]?.line || b.line })), b.models = T.models, b === h && (h.title = T.title), r.push(...T.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: N[C.line - 1]?.line || b.line })));
    const M = new Set(b.devices.map((C) => fe(C.name)));
    for (const C of b.instances)
      if (M.has(fe(C.name)) && a("error", C.line, "Duplicate instance/device name: " + C.name), M.add(fe(C.name)), C.definitionId = E(b, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) a("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const R = s[C.definitionId];
        R.ports.length !== C.nodes.length && a("error", C.line, `${C.name}: ${R.name} expects ${R.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const b of Object.values(s)) delete b.statements;
  const w = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function _(b, N = []) {
    if (w.has(b)) {
      a("error", s[b].line, "Circular subcircuit reference: " + [...N, s[b].name].join(" → "));
      return;
    }
    if (!I.has(b)) {
      if (w.add(b), N.length >= 64) {
        a("error", s[b].line, "Subcircuit dependency nesting exceeds 64 levels."), w.delete(b), I.add(b);
        return;
      }
      for (const T of s[b].instances) T.definitionId && _(T.definitionId, [...N, s[b].name]);
      w.delete(b), I.add(b);
    }
  }
  for (const b of Object.keys(s)) _(b);
  !h.devices.length && !h.instances.length && a("error", 0, "No supported components or instances to render.");
  for (const b of r) !b.source && b.line && n.origins[b.line - 1] && (b.source = n.origins[b.line - 1].file, b.line = n.origins[b.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: h.title || "", scopes: s, globals: [...c], diagnostics: r, layoutDescription: o.layout };
}
const ae = () => /* @__PURE__ */ Object.create(null), Ne = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), We = (t, e) => Ne(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Wt(t, e = []) {
  const n = ae(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((s) => decodeURIComponent(s)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [s, c] of Object.entries(r.terminals)) o(c).terminals.push({ component: r.name, pin: s });
  for (const r of e) o(r);
  return n;
}
function $t(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const it = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Xt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function Pe(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (c) => (r.push(c), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (c, a, f) => {
    const h = f.split(",").map((m) => m.trim());
    if (h.some((m) => !m || /[\s{}+*()]/.test(m))) throw Error("Unsupported dynamic voltage/current reference: " + c);
    const u = a.toUpperCase() + "(" + h.map((m) => a.toLowerCase() === "v" ? n(m) : o(m, a)).join(",") + ")";
    return r.push(u), "@@" + (r.length - 1) + "@@";
  });
  let s = t.length;
  return t = t.replace(Xt, (c, a, f) => {
    if (f.slice(a + c.length).trimStart().startsWith("(")) return c;
    const h = e(c.toLowerCase());
    if (h === void 0) return c;
    if (s += h.length + 2, s > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + h + ")";
  }), t.replace(/@@(\d+)@@/g, (c, a) => r[Number(a)]);
}
function qt(t, e, n, o) {
  const r = { ...e, ...n }, s = ae(), c = /* @__PURE__ */ new Set(), a = ae();
  for (const [h, u] of Object.entries(o)) a[h] = Pe(it(u), (m) => t[m]);
  function f(h) {
    if (Object.hasOwn(a, h)) return a[h];
    if (Object.hasOwn(s, h)) return s[h];
    if (!Object.hasOwn(r, h)) return t[h];
    if (c.has(h)) {
      if (Object.hasOwn(t, h)) return t[h];
      throw Error("Circular parameter dependency: " + [...c, h].join(" → "));
    }
    return c.add(h), s[h] = Pe(it(r[h]), f), c.delete(h), s[h];
  }
  for (const h of Object.keys(r)) f(h);
  return Object.assign(ae(), t, s, a);
}
function $e(t, e, n, o) {
  let r = "";
  for (let f = 0; f < t.length; ) {
    const h = t[f];
    if (h !== "{" && h !== "'") {
      r += h, f++;
      continue;
    }
    const u = f++;
    let m = 1, d = "";
    for (; f < t.length && m; f++) {
      if (h === "'") {
        t[f] === "'" && (m = 0);
        continue;
      }
      if (d) {
        t[f] === d && (d = "");
        continue;
      }
      if (t[f] === '"' || t[f] === "'") {
        d = t[f];
        continue;
      }
      t[f] === "{" && m++, t[f] === "}" && m--;
    }
    if (m) throw Error("Unclosed parameter expression.");
    r += h + Pe(t.slice(u + 1, f - 1), (y) => e[y], n, o) + (h === "{" ? "}" : "'");
  }
  const s = [];
  let c = 0, a = "";
  for (let f = 0; f < r.length; f++) {
    const h = r[f];
    if (a) {
      h === a && r[f - 1] !== "\\" && (a = "");
      continue;
    }
    if (h === '"' || h === "'") {
      a = h;
      continue;
    }
    if ("({".includes(h) && c++, ")}".includes(h) && c--, !c && (f === 0 || /\s/.test(r[f - 1]))) {
      const u = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(f));
      u && (s.push({ start: f, end: f + u[0].length, key: u[1].toLowerCase() }), f += u[0].length - 1);
    }
  }
  if (s.length) {
    let f = r.slice(0, s[0].start);
    s.forEach((h, u) => {
      const m = s[u + 1]?.start ?? r.length, d = r.slice(h.end, m);
      f += r.slice(h.start, h.end) + (d.includes("{") || ["refnode", "intnode"].includes(h.key) ? d : Pe(d, (y) => e[y], n, o));
    }), r = f;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
}
class zt {
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
class Yt {
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
    let e, n, o, r, s, c, a, f, h;
    if (c = this.gobbleToken(), !c || (n = this.gobbleBinaryOp(), !n))
      return c;
    for (s = { value: n, prec: O.binaryPrecedence(n), right_a: O.right_associative.has(n) }, a = this.gobbleToken(), a || this.throwError("Expected expression after " + n), r = [c, s, a]; n = this.gobbleBinaryOp(); ) {
      if (o = O.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      s = { value: n, prec: o, right_a: O.right_associative.has(n) }, h = n;
      const u = (m) => s.right_a && m.right_a ? o > m.prec : o <= m.prec;
      for (; r.length > 2 && u(r[r.length - 2]); )
        a = r.pop(), n = r.pop().value, c = r.pop(), e = {
          type: O.BINARY_EXP,
          operator: n,
          left: c,
          right: a
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + h), r.push(s, e);
    }
    for (f = r.length - 1, e = r[f]; f > 1; )
      e = {
        type: O.BINARY_EXP,
        operator: r[f - 1].value,
        left: r[f - 2],
        right: e
      }, f -= 2;
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
          const s = this.gobbleToken();
          return s || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: O.UNARY_EXP,
            operator: n,
            argument: s,
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
      let s = this.expr.charAt(this.index++);
      if (s === o) {
        r = !0;
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
      let s = this.code;
      if (s === e) {
        o = !0, this.index++, e === O.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (s === O.COMMA_CODE) {
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
const Kt = new zt();
Object.assign(O, {
  hooks: Kt,
  plugins: new Yt(O),
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
const Ie = (t) => new O(t).parse(), Zt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(O).filter((t) => !Zt.includes(t) && Ie[t] === void 0).forEach((t) => {
  Ie[t] = O[t];
});
Ie.Jsep = O;
const Jt = "ConditionalExpression";
var en = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: Jt,
            test: o,
            consequent: r,
            alternate: s
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
Ie.plugins.register(en);
const tn = "ConditionalExpression";
var nn = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const o = n.node, r = this.gobbleExpression();
        if (r || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const s = this.gobbleExpression();
          if (s || this.throwError("Expected expression"), n.node = {
            type: tn,
            test: o,
            consequent: r,
            alternate: s
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
Ie.plugins.register(nn);
const rn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, st = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, de = (t) => Number(t) > 0.5;
function Ae(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(a) {
    return a = String(a).trim(), /^\{[\s\S]*\}$/.test(a) && (a = a.slice(1, -1)), a = a.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (f) => {
      if (f[0] === '"' || f[0] === "'") return f;
      const [, h, u, m] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(f), d = u.toLowerCase(), y = d.startsWith("meg") ? 1e6 : d.startsWith("mil") ? 254e-7 : rn[d[0]] || 1;
      return "(" + (m ? +(h + (h.includes(".") ? "" : ".") + m) : Number(h)) * y + ")";
    }), s(Ie(a));
  }
  function s(a) {
    if (++o > 1e4) throw Error("Structural expression is too complex.");
    if (a.type === "Literal") return a.value;
    if (a.type === "Identifier") {
      const f = a.name.toLowerCase();
      if (f === "pi") return Math.PI;
      if (f === "e") return Math.E;
      if (!Object.hasOwn(e, f)) throw Error("Undefined structural parameter: " + a.name);
      if (n.has(f)) throw Error("Circular structural parameter: " + f);
      n.add(f);
      const h = r(e[f]);
      return n.delete(f), h;
    }
    if (a.type === "ConditionalExpression") return de(s(a.test)) ? s(a.consequent) : s(a.alternate);
    if (a.type === "UnaryExpression") {
      const f = s(a.argument);
      if (a.operator === "-") return -f;
      if (a.operator === "+") return +f;
      if (a.operator === "!" || a.operator === "~") return !de(f);
    }
    if (a.type === "BinaryExpression") {
      const f = s(a.left);
      if (a.operator === "&&") return de(f) && de(s(a.right));
      if (a.operator === "||") return de(f) || de(s(a.right));
      const h = s(a.right);
      switch (a.operator) {
        case "+":
          return f + h;
        case "-":
          return f - h;
        case "*":
          return f * h;
        case "/":
          return f / h;
        case "**":
          return f ** h;
        case "%":
          return f % h;
        case "^":
          return de(f) !== de(h);
        case "&":
          return de(f) && de(h);
        case "|":
          return de(f) || de(h);
        case ">":
          return f > h;
        case "<":
          return f < h;
        case ">=":
          return f >= h;
        case "<=":
          return f <= h;
        case "==":
        case "===":
          return f === h;
        case "!=":
        case "!==":
          return f !== h;
      }
    }
    if (a.type === "CallExpression" && a.callee.type === "Identifier") {
      const f = a.callee.name.toLowerCase();
      if (f === "if") {
        if (a.arguments.length !== 3) throw Error("if() needs three arguments.");
        return de(s(a.arguments[0])) ? s(a.arguments[1]) : s(a.arguments[2]);
      }
      if (Object.hasOwn(st, f)) return st[f](...a.arguments.map(s));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const c = r(t);
  if (typeof c == "number" && !Number.isFinite(c)) throw Error("Structural expression is not finite.");
  return c;
}
function Ye(t, { isolate: e = "" } = {}) {
  $t(t);
  const n = ae(), o = /* @__PURE__ */ new Map();
  let r = 0, s = 0;
  function c(a, f, h, u, m, d, y) {
    if (f.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const E = t.scopes[a], w = f.length ? Ne(f.slice(0, -1), f.at(-1)) : "", I = ae();
    if (e && w === e && (h = ae()), y.some((C) => C.scopeId === a)) throw Error("Circular subcircuit reference at " + w);
    const _ = qt(u, E.defaults, E.parameters, m);
    function b(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const B = Ae(C, _);
        C = String(typeof B == "boolean" ? Number(B) : B);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const R = C.toLowerCase();
      return Object.hasOwn(h, R) ? h[R] : t.globals.includes(R) ? We([], R) : I[R] || (I[R] = We(f, R));
    }
    const N = { id: w, path: f, scopeId: a, name: d?.name || "Top", definition: E.name, ports: E.ports.map((C) => ({ name: C, node: b(C) })), params: _, nodes: I, models: ae(), devices: [], children: [], raw: d?.raw || "", line: d?.line || 0 };
    n[w] = N, o.set(w, b);
    const T = [...y, N];
    function M(C) {
      if (!C) return "";
      let R = E;
      for (; R; ) {
        if (R.directives.some((B) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(B.text))) {
          const B = [...T].reverse().find((g) => g.scopeId === R.id);
          return Ne(B?.path || [], C.toLowerCase());
        }
        R = t.scopes[R.parent];
      }
      return C;
    }
    for (const C of E.directives.filter((R) => /^\.model\b/i.test(R.text))) {
      const R = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!R) continue;
      const B = M(R), g = E.models[R.toLowerCase()], p = $e(C.text, _, b, (D) => Ne(f, D));
      N.models[B] = { ...g, name: B, raw: p.replace(/^(\.model\s+)\S+/i, (D, X) => X + B), instanceId: w, parameters: _ };
    }
    for (const C of E.devices) {
      if (++s > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const R = ae();
      for (const [g, p] of Object.entries(C.terminals)) R[g] = b(p);
      const B = M(C.model);
      N.devices.push({ ...C, name: Ne(f, C.name), localName: C.name, instanceId: w, terminals: R, model: B, parameters: _ });
    }
    for (const C of E.instances) {
      let R = C.definitionId;
      if (!R) {
        const D = String(Ae(C.definitionName, _)).toLowerCase();
        let X = E;
        for (; X && !R; )
          R = X.definitions[D], X = t.scopes[X.parent];
        if (!R) throw Error("Undefined selected subcircuit: " + D);
      }
      const B = t.scopes[R], g = ae();
      if (B.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + B.ports.length + " ports; got " + C.nodes.length);
      B.ports.forEach((D, X) => {
        g[D.toLowerCase()] = b(C.nodes[X]);
      });
      const p = c(R, [...f, C.name], g, _, C.parameters, C, T);
      C.pinNames?.length === p.ports.length && p.ports.forEach((D, X) => {
        D.label = C.pinNames[X];
      }), N.children.push(p);
    }
    return N;
  }
  try {
    let m = function(d, y) {
      const E = y.split(":");
      if (E.length === 1) return { owner: d, name: y };
      const w = E.pop();
      for (const I of [[...d.path, ...E], E]) {
        const _ = f.get(I.map(encodeURIComponent).join("/").toLowerCase());
        if (_) return { owner: _, name: w };
      }
      throw Error("Unknown hierarchical reference: " + y);
    };
    const a = c(t.rootId, [], ae(), ae(), ae(), null, []), f = new Map(Object.values(n).map((d) => [d.id.toLowerCase(), d])), h = Object.assign(ae(), ...Object.values(n).map((d) => d.models)), u = (d) => h[d] || Object.entries(h).find(([y]) => y.startsWith(d + "."))?.[1];
    for (const d of Object.values(n)) for (const y of d.devices) {
      const E = t.scopes[d.scopeId].devices.find((_) => _.name === y.localName), w = (_) => {
        const b = m(d, _);
        return o.get(b.owner.id)(b.name);
      }, I = (_, b = "", N = "") => {
        const T = m(d, _), M = T.owner.devices.find((C) => C.localName.toLowerCase() === T.name.toLowerCase());
        if (b.toLowerCase() === "ix") {
          const C = T.owner.ports.find((R, B) => R.name.toLowerCase() === T.name.toLowerCase() || String(B + 1) === T.name);
          if (C) return T.owner.id + ":" + C.name;
        }
        if (!M) {
          if (N) throw Error(y.name + ": referenced " + N + " device " + _ + " was not found.");
          return Ne(T.owner.path, T.name);
        }
        if (N && M.kind !== N) throw Error(y.name + ": " + _ + " must be a " + N + " device.");
        return M.name;
      };
      if (y.value = $e(E.value, d.params, w, I), E.model && (y.value = y.value.replace(E.model, y.model)), y.kind === "M" && Object.keys(y.terminals).length === 3) {
        let _ = u(y.model), b = !1;
        const N = /* @__PURE__ */ new Set();
        for (; _?.type === "VDMOS" && !N.has(_.name); ) {
          N.add(_.name);
          const T = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(_.raw);
          if (T) {
            b = T[1] === void 0 || Number(Ae(T[1], _.parameters)) >= 0.5;
            break;
          }
          const M = _.name.includes("/") ? _.name.slice(0, _.name.lastIndexOf("/") + 1) : "";
          _ = u(M + (_.baseModel || "").toLowerCase()) || u((_.baseModel || "").toLowerCase());
        }
        N.size && (y.type = "spice_" + (b ? "pmos3" : "nmos3"));
      }
      y.controlSources = (E.controlSources || []).map((_) => I(_, "", "V")), y.controlSource = y.controlSources[0] || "", y.coupledInductors = (E.coupledInductors || []).map((_) => I(_, "", "L"));
      for (const _ of /* @__PURE__ */ new Set([...E.controlSources || [], ...E.coupledInductors || []])) {
        const b = _.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        y.value = y.value.replace(new RegExp("(?<![\\w./%])" + b + "(?![\\w.$])", "g"), () => I(_));
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
function Ke(t, e = {}) {
  const n = new Map(t.components.map((g) => [g.name, g])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), s = [], c = (g, p) => JSON.stringify([g, p].sort()), a = (g) => e[g]?.potential !== null && e[g]?.potential !== void 0;
  for (const g of t.components) {
    for (const [x, P] of Object.entries(g.terminals))
      o.has(P) || o.set(P, []), o.get(P).push({ device: g.name, pin: x });
    if (g.kind === "R") {
      const x = Object.values(g.terminals);
      if (x.length === 2 && x[0] !== x[1]) {
        const P = c(...x);
        r.has(P) || r.set(P, []), r.get(P).push(g);
      }
    }
    const p = g.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(g.kind) ? "fet" : null, D = p === "bjt" ? /_(npn|pnp)$/.exec(g.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(g.type)?.[1];
    if (!p || !D) continue;
    const X = g.terminals, W = X[p === "bjt" ? "B" : "G"], Z = X[p === "bjt" ? "C" : "D"], k = X[p === "bjt" ? "E" : "S"];
    [W, Z, k].some((x) => x === void 0) || W === k || Z === k || s.push({ id: g.name, family: p, polarity: D, control: W, drain: Z, source: k, body: g.kind === "M" ? X.B : void 0 });
  }
  const f = [], h = /* @__PURE__ */ new Set(), u = (g, p, D, X, W, Z = "basic", k = [], x = "high") => {
    const P = [.../* @__PURE__ */ new Set([...p, ...k])], V = JSON.stringify([g, Z, [...P].sort()]);
    h.has(V) || (h.add(V), f.push({ id: "motif" + f.length, kind: g, variant: Z, transistors: p, members: P, roles: D, nets: X, evidence: W, confidence: x }));
  }, m = (g, p) => g.family === p.family && g.polarity === p.polarity, d = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), w = new Map(s.map((g) => [g.id, g])), I = (g, p, D) => {
    g.has(p) || g.set(p, []), g.get(p).push(D);
  }, _ = (g, p) => JSON.stringify([g.family, g.polarity, p]);
  for (const g of s)
    I(d, _(g, g.control), g), I(y, _(g, g.source), g), g.family === "bjt" && (o.get(g.source) || []).some((p) => {
      const D = w.get(p.device);
      return D && D.family === "bjt" && !m(g, D) && D.source === g.source;
    }) && I(E, _(g, g.drain), g);
  const b = (g) => [{ node: g.source, resistor: null }, ...(o.get(g.source) || []).flatMap((p) => {
    const D = n.get(p.device);
    if (D.kind !== "R") return [];
    const X = Object.values(D.terminals).find((W) => W !== g.source);
    return X !== void 0 && X !== g.control && X !== g.drain ? [{ node: X, resistor: D.name }] : [];
  })];
  for (const g of s) g.control === g.drain && u("diode-connected", [g.id], { reference: g.id }, { control: g.control, return: g.source }, ["control-drain-short", g.family]);
  for (const g of s) {
    const p = d.get(_(g, g.control));
    if (p.filter((x) => x.control === x.drain).length > 1) continue;
    let D = null;
    if (g.control !== g.drain && g.family === "bjt" && (D = (d.get(_(g, g.drain)) || []).find((x) => x.id !== g.id && m(x, g) && x.control === g.drain && x.source === g.control && a(x.drain))), g.control !== g.drain && !D) continue;
    const X = b(g), W = [];
    let Z = null, k = [];
    for (const x of p) {
      if (x.id === g.id || x.id === D?.id || x.drain === g.drain || x.drain === x.control) continue;
      const P = X.flatMap((V) => b(x).filter((F) => V.node === F.node).map((F) => ({ node: V.node, rs: [V.resistor, F.resistor].filter(Boolean) }))).find((V) => Z === null || V.node === Z);
      P && (Z = P.node, W.push(x.id), k.push(...P.rs));
    }
    if (W.length) {
      const x = W.every((P) => w.get(P).body === g.body);
      u("current-mirror", [g.id, ...W, ...D ? [D.id] : []], { reference: g.id, outputs: W, ...D ? { helper: D.id } : {} }, { control: g.control, return: Z }, ["same-polarity", "shared-control", D ? "emitter-follower-reference" : "diode-reference", k.length ? "resistive-common-return" : "shared-return", x ? "compatible-bodies" : "different-body-connections"], D ? "assisted" : k.length ? "degenerated" : "basic", [...k, ...D ? [D.id] : []], x ? "high" : "medium");
    }
  }
  const N = [], T = /* @__PURE__ */ new Set(), M = (g, p) => {
    const D = JSON.stringify([g.id, p.id].sort());
    T.has(D) || (T.add(D), N.push([g, p]));
  };
  for (const g of y.values()) if (!a(g[0].source)) {
    const p = g.filter((D) => D.control !== D.drain);
    p.length === 2 ? M(...p) : p.length > 2 && new Set(p.map((D) => D.control)).size > 1 && u("differential-pair", p.map((D) => D.id), { inputs: p.map((D) => D.id) }, { tail: p[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const g of E.values()) for (let p = 0; p < g.length; p++) for (let D = p + 1; D < g.length; D++) M(g[p], g[D]);
  for (const [g, p] of N) {
    if (g.control === p.control || g.control === g.drain || p.control === p.drain) continue;
    if (g.source === p.source && g.drain !== p.drain && !a(g.source)) {
      const W = (o.get(g.source) || []).some((k) => k.device !== g.id && k.device !== p.id), Z = y.get(_(g, g.source)).length === 2;
      u("differential-pair", [g.id, p.id], { inputs: [g.id, p.id] }, { tail: g.source }, ["same-polarity", "distinct-controls", "shared-tail", W ? "tail-bias-connection" : "unbiased-tail", Z ? "two-input-tail" : "multi-input-tail"], "basic", [], W && Z && g.body === p.body ? "high" : "medium");
    }
    if (g.family !== "bjt" || g.drain !== p.drain || g.source === p.source) continue;
    const D = s.filter((W) => W.family === "bjt" && W.polarity !== g.polarity && W.source === g.source), X = s.filter((W) => W.family === "bjt" && W.polarity !== g.polarity && W.source === p.source);
    for (const W of D) for (const Z of X) W.id !== Z.id && W.control === Z.control && W.drain !== Z.drain && W.control !== W.drain && Z.control !== Z.drain && u("differential-pair", [g.id, p.id, W.id, Z.id], { inputs: [g.id, p.id], commonBase: [W.id, Z.id] }, { inputCollectors: g.drain, bias: W.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const g of s) if (g.family === "bjt" && g.control !== g.drain) {
    const p = r.get(c(g.drain, g.control)) || [], D = r.get(c(g.control, g.source)) || [];
    p.length === 1 && D.length === 1 && u("vbe-multiplier", [g.id], { transistor: g.id, collectorResistor: p[0].name, emitterResistor: D[0].name }, { control: g.control, collector: g.drain, emitter: g.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [p[0].name, D[0].name]);
  }
  const C = s.filter((g) => g.family === "bjt"), R = /* @__PURE__ */ new Map();
  for (const g of C) I(R, g.control, g);
  const B = (g) => (o.get(g) || []).filter((p) => w.has(p.device));
  for (const g of C) if (g.control !== g.drain) {
    for (const p of R.get(g.source) || []) if (p.id !== g.id && m(g, p) && p.drain === g.control && p.source !== g.drain) {
      const D = r.get(c(g.source, p.source)) || [];
      D.length === 1 && u("current-limit-pair", [g.id, p.id], { driver: g.id, output: p.id, senseResistor: D[0].name }, { sense: g.source, drive: g.control, output: p.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [D[0].name]);
    }
    for (const p of R.get(g.source) || []) p.id !== g.id && m(g, p) && p.control !== p.drain && g.drain === p.drain && p.source !== g.control && u("darlington-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.source, collector: g.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (R.get(g.source) || []).length === 1 ? "high" : "medium");
    for (const p of R.get(g.drain) || []) p.id !== g.id && !m(g, p) && p.control !== p.drain && g.source === p.drain && p.source !== g.control && B(g.drain).length === 2 && u("sziklai-pair", [g.id, p.id], { driver: g.id, output: p.id }, { link: g.drain, feedback: g.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const p of o.get(g.drain) || []) {
      const D = w.get(p.device);
      !D || D.family !== "bjt" || D.id === g.id || !m(g, D) || D.source !== g.drain || a(g.drain) || D.control === g.control || D.control === D.drain || D.drain === g.source || B(g.drain).length !== 2 || u("cascode-pair", [g.id, D.id], { driver: g.id, output: D.id }, { link: g.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const g of C.filter((p) => p.polarity === "npn" && a(p.drain))) for (const p of C.filter((D) => D.polarity === "pnp" && a(D.drain))) {
    if (e[g.drain].potential <= e[p.drain].potential) continue;
    const D = b(g).flatMap((X) => b(p).filter((W) => X.node === W.node && !a(X.node)).map((W) => ({ node: X.node, rs: [X.resistor, W.resistor].filter(Boolean) })))[0];
    D && u("push-pull-pair", [g.id, p.id], { upper: g.id, lower: p.id }, { output: D.node }, ["complementary-polarity", "ordered-collector-supplies", D.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", D.rs);
  }
  return f;
}
function Ze(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([s, c]) => [s, o(c)])), nets: Object.fromEntries(Object.entries(r.nets).map(([s, c]) => [s, n(c)])) }));
}
function on(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), s = new Map(t.components.map((c) => [c.name, c]));
  for (const c of n) {
    if (new Set(c.members).size !== c.members.length) throw Error("Duplicate @layout pair member.");
    const a = c.members.map((d) => s.get(d));
    if (a.some((d) => !d)) throw Error("Unknown @layout pair device.");
    const f = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[c.kind], h = c.kind === "differential" && a.length === 2 ? t.components.filter((d) => !c.members.includes(d.name) && Object.values(d.terminals).includes(a[0].terminals.E ?? a[0].terminals.S)) : [], u = Ke({ ...t, components: [...a, ...h] }, e), m = u.find((d) => d.kind === f && d.confidence === "high" && c.members.every((y) => d.members.includes(y)));
    if (!m) throw Error("Invalid @layout pair " + c.kind + " { " + c.members.join(" ") + " }: electrical structure does not match.");
    for (const d of u.filter((y) => y === m || y.kind === "diode-connected" && y.members.every((E) => m.members.includes(E)))) {
      const y = JSON.stringify([d.kind, [...d.members].sort()]);
      r.has(y) || (r.add(y), o.push({ ...d, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function sn(t, e, n = Ke(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((d) => d.kind === "R"), s = t.components.filter((d) => d.kind === "Q"), c = new Map(t.components.map((d) => [d.name, d])), a = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), h = (d) => Object.values(d.terminals), u = (d, y, E) => {
    d && o.set(d.name, { reverse: h(d)[0] !== y, reason: E });
  };
  for (const d of s) {
    const { C: y, B: E, E: w } = d.terminals, I = d.type.endsWith("pnp"), _ = d.type.endsWith("npn");
    !I && !_ || (a.has(w) || a.set(w, []), a.get(w).push(d), y === E && e[w]?.potential !== null && e[w]?.potential !== void 0 && f.set(y, { potential: e[w].potential }));
  }
  for (const d of n) if (d.kind === "vbe-multiplier" && d.confidence === "high") {
    const y = c.get(d.roles.transistor), E = y.type.endsWith("pnp"), w = c.get(E ? d.roles.emitterResistor : d.roles.collectorResistor), I = c.get(E ? d.roles.collectorResistor : d.roles.emitterResistor);
    u(w, y.terminals[E ? "E" : "C"], "recognized VBE multiplier"), u(I, y.terminals.B, "recognized VBE multiplier");
  }
  for (const d of r) {
    const [y, E] = h(d), w = f.get(y), I = f.get(E);
    w && I && w.potential !== I.potential && u(d, w.potential > I.potential ? y : E, "diode-connected bias reference");
  }
  const m = /* @__PURE__ */ new Map();
  for (const d of r) {
    const y = h(d);
    if (!y.some((E) => e[E]?.potential !== null && e[E]?.potential !== void 0))
      for (const E of y)
        m.has(E) || m.set(E, []), m.get(E).push(d);
  }
  for (const [d, y] of m)
    if (!(y.length > 12))
      for (const E of y) for (const w of y) {
        if (E === w) continue;
        const I = h(E).find((T) => T !== d), _ = h(w).find((T) => T !== d), b = a.get(I)?.find((T) => T.type.endsWith("npn")), N = a.get(_)?.find((T) => T.type.endsWith("pnp"));
        b && N && (u(E, I, "complementary emitter output"), u(w, d, "complementary emitter output"));
      }
  return o;
}
function an(t) {
  const e = t.components.filter((s) => s.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((s) => s.kind === "R").map((s) => Object.values(s.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const s of e) {
    const c = s.terminals.E;
    n.has(c) || n.set(c, []), n.get(c).push(s);
  }
  for (const s of e) {
    const { B: c, C: a, E: f } = s.terminals;
    if (c === f || !o.has([c, f].sort().join("|"))) continue;
    const h = n.get(c) || [];
    if (!(h.length > 16))
      for (const u of h) {
        if (u === s) continue;
        if (u.terminals.B === a) {
          r.add(s.name);
          break;
        }
        const m = n.get(u.terminals.B) || [];
        if (m.length <= 16 && m.some((d) => d !== s && d !== u && d.terminals.B === a)) {
          r.add(s.name);
          break;
        }
      }
  }
  return r;
}
const Xe = 22;
function qe(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const ke = (t) => ["pwr", "ret", "bias"].includes(t), cn = (t) => String(t).split("/").at(-1).toLowerCase(), yt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[cn(t)] || "unknown", at = (t) => {
  const e = qe(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || yt(t);
};
function ln(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (c, a, f) => {
    e.has(c) || e.set(c, []), e.get(c).push({ node: a, delta: f });
  };
  for (const c of t)
    if (c.kind === "V")
      try {
        let a = c.value.trim();
        const f = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(a);
        if (f && Number(Ae(f[1], c.parameters)) !== 0 || (a = a.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(a))) continue;
        const h = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(a);
        if (!h) continue;
        const u = Ae(h[1], c.parameters);
        if (typeof u != "number" || !Number.isFinite(u)) continue;
        o(c.terminals["-"], c.terminals["+"], u), o(c.terminals["+"], c.terminals["-"], -u);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ new Set();
  for (const c of ["0", ...e.keys()]) {
    if (s.has(c)) continue;
    const a = /* @__PURE__ */ new Map([[c, 0]]), f = [c];
    s.add(c);
    let h = !1;
    for (let u = 0; u < f.length; u++) for (const m of e.get(f[u]) || []) {
      const d = a.get(f[u]) + m.delta;
      a.has(m.node) ? Math.abs(a.get(m.node) - d) > 1e-8 * Math.max(1, Math.abs(d)) && (h = !0) : (a.set(m.node, d), s.add(m.node), f.push(m.node));
    }
    h && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [u, m] of a) r[u] = { value: m, reference: c, known: c === "0" && !h, consistent: !h };
  }
  return { nodes: r, diagnostics: n };
}
function un(t, e, n = null) {
  const o = ln(Ce(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  for (const u of Object.values(e.nodes)) {
    const m = qe(u.name), d = yt(u.name);
    r[u.name] = { role: m !== "unknown" ? m : d, roleSource: m !== "unknown" ? "node-name" : d !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[u.name]?.known ? o.nodes[u.name].value : null };
  }
  if (e.localScope) for (const u of e.interfaceBindings) {
    const m = r[u.local], d = at(u.port);
    m && m.potential === null && ["pwr", "ret"].includes(d) && (m.potential = d === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(u.port) ? 0 : -1, m.potentialSource = "symbolic-port-order");
  }
  const c = n?.pairs?.length ? on(e, r, n.pairs) : Ke(e, r), a = sn(e, r, c), f = an(e), h = (u, m, d) => {
    const y = { role: r[d].role, roleSource: r[d].roleSource }, E = u.block?.ports.find((_) => _.pin === m);
    if (E?.implicit || !u.block && !u.synthetic) return y;
    const w = u.synthetic ? u.value : E?.name || E?.label, I = at(w);
    return I !== "unknown" ? { role: I, roleSource: qe(w) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : ke(y.role) ? { ...y, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const u of e.components) {
    const m = Object.fromEntries(Object.entries(u.terminals).map(([B, g]) => [B, { ...r[g], ...h(u, B, g) }])), d = Object.values(m), y = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(u.type), E = y && !a.has(u.name) && d.length === 2 && d.every((B) => !ke(B.role) && (B.potential === null || B.role !== "unknown")), w = u.terminals["+"], I = u.terminals["-"], _ = [w, I].filter((B) => B && B !== "0"), b = u.kind === "V" && _.some((B) => ke(r[B]?.role)) && !_.some((B) => ["in", "out", "io", "fb"].includes(r[B]?.role)) && [w, I].every((B) => o.nodes[B]?.known), N = w === "0" ? I : w, T = Object.keys(u.terminals), M = (B) => ke(B.role) ? B.potential !== null ? B.potential > 0 ? "high" : "low" : B.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    T.length === 2 && (u.kind === "V" && d.every((B) => B.potential !== null) ? C = d[0].potential < d[1].potential : u.terminals[T[0]] === "0" ? C = !0 : u.terminals[T[1]] === "0" ? C = !1 : d.every((B) => B.potential !== null) ? C = d[0].potential < d[1].potential : C = M(d[0]) === "low" || M(d[1]) === "high" && M(d[0]) === "signal"), a.has(u.name) && (C = a.get(u.name).reverse);
    const R = u.synthetic ? "" : u.name.startsWith(e.focus + "/") ? u.name.slice(e.focus.length + 1) : u.name;
    s[u.name] = { version: Xe, kind: u.kind, polarity: u.type.endsWith("pnp") ? "p" : u.type.endsWith("npn") ? "n" : null, currentLimiter: f.has(u.name), orientationReason: a.get(u.name)?.reason || null, owner: R.includes("/") ? R.slice(0, R.lastIndexOf("/")) : "", passive: y, source: ["V", "I", "E", "F", "G", "H"].includes(u.kind) || u.kind === "B" && !y, ports: m, horizontal: E, orientation: E ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: T.length === 2 && (y || ["V", "I", "B", "F", "H"].includes(u.kind)), supply: !!b, voltage: b ? o.nodes[N].value : null };
  }
  return { version: Xe, nodes: r, cells: s, motifs: c, diagnostics: o.diagnostics };
}
function wt(t, e) {
  const n = e.ports.map((r, s) => ({ pin: "P" + s, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(Ce(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const s = We([], r);
    o.has(s) && !n.some((c) => c.node === s) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: s, implicit: !0 });
  }
  return n;
}
function dn(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, s = t.contexts[o];
  if (!s) throw Error("Unknown instance: " + o);
  o && (t = Ye(t.ir, { isolate: o }));
  const c = t.contexts[o];
  if (!c) throw Error("Unknown instance: " + o);
  const a = [], f = [];
  function h(E) {
    f.push(...Object.values(E.nodes), ...E.ports.map((I) => I.node));
    const w = [...E.devices.map((I) => ({ line: I.line, device: I })), ...E.children.map((I) => ({ line: I.line, child: I }))].sort((I, _) => I.line - _.line);
    for (const I of w) {
      if (I.device) {
        const T = I.device;
        a.push({ ...T, layoutLabel: [...E.path.slice(c.path.length), T.localName].join("/") });
        continue;
      }
      const _ = I.child;
      if (e === "flat" || n.has(_.id)) {
        h(_);
        continue;
      }
      const b = wt(t, _), N = ae();
      b.forEach((T) => {
        N[T.pin] = T.node;
      }), a.push({ name: _.id, kind: "X", type: "spice_subckt", terminals: N, value: _.definition, raw: _.raw, line: _.line, instanceId: _.id, layoutLabel: _.path.slice(c.path.length).join("/"), block: { definitionId: _.scopeId, ports: b, parameters: _.params } });
    }
  }
  h(c);
  for (const [E, w] of c.ports.entries()) a.push({ name: "@port/" + o + "/" + E, kind: "PORT", type: "spice_port", terminals: { A: w.node }, layoutLabel: w.name, value: w.name, raw: "Interface port " + w.name, synthetic: !0 });
  if (a.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const u = Object.assign(ae(), ...Object.values(t.contexts).map((E) => E.models)), m = { title: o || t.ir.title, components: a, nodes: Wt(a, f), models: u, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  m.interfaceBindings = c.ports.map((E, w) => ({ port: E.name, local: E.node, parent: s.ports[w].node }));
  const d = /* @__PURE__ */ new Map();
  for (const E of s.ports)
    d.has(E.node) || d.set(E.node, []), d.get(E.node).push(E.name);
  m.interfaceAliases = [...d].filter(([, E]) => E.length > 1).map(([E, w]) => ({ node: E, ports: w })), m.topology = fn(r, m);
  const y = Gt(t, m);
  return m.layout = un(t, m, y), m.layout.description = y, m;
}
function fn(t, e) {
  const n = Ce(t.contexts[e.focus]);
  e.localScope && (t = Ye(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const a of e.components)
    if (!a.synthetic)
      if (a.kind === "X") {
        const f = t.contexts[a.instanceId];
        if (!f) throw Error("Projection contains an unknown block.");
        const h = wt(t, f);
        if (JSON.stringify(Object.entries(a.terminals)) !== JSON.stringify(h.map((u) => [u.pin, u.node]))) throw Error("Block interface topology mismatch: " + a.name);
        o.push(...Ce(f));
      } else o.push(a);
  for (const a of o) {
    if (r.has(a.name)) throw Error("Projection duplicates " + a.name);
    r.add(a.name);
  }
  const s = Se(o), c = Ce(t.contexts[e.focus]);
  if (s !== Se(c)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const a = new Map(e.interfaceBindings.map((u) => [u.local, u.parent])), f = (u) => a.get(u) ?? u, h = o.map((u) => ({ ...u, terminals: Object.fromEntries(Object.entries(u.terminals).map(([m, d]) => [m, f(d)])), value: $e(u.value, {}, f, (m) => m) }));
    if (Se(h) !== Se(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: s, boundSignature: Se(n), boundaryVerified: !0 };
}
function ct(t) {
  const e = ae(), n = ae();
  for (const o of t.components) {
    const r = ae(), s = ae();
    for (const [c, a] of Object.entries(o.terminals))
      r[c] = [t.nodes[a].bit], s[c] = "input";
    e[o.name] = { type: o.type, port_directions: s, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((c) => ({ pin: c.pin, label: c.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((c, a) => ({ pin: c, label: o.pinLabels?.[a] || c })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ze(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function pn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (h) => (n.has(h) || n.set(h, n.size + 2), n.get(h));
  Object.entries(t.modules.circuit.cells).forEach(([h, u], m) => {
    const d = "c" + m;
    e.set(d, h);
    const y = Object.fromEntries(Object.entries(u.connections).map(([E, w]) => [E, w.map(r)]));
    o[d] = { type: u.type, connections: y, port_directions: u.port_directions, attributes: { displayRef: u.attributes.displayRef || u.attributes.ref || "", value: u.attributes.value || "", name: u.attributes.name || "" } }, u.spiceBlock && (o[d].spiceBlock = u.spiceBlock), u.spiceSymbol && (o[d].spiceSymbol = u.spiceSymbol), u.spiceLayout && (o[d].spiceLayout = u.spiceLayout);
  });
  const s = new Map([...e].map(([h, u]) => [u, h])), c = t.modules.circuit.spiceLayoutDescription, a = c ? { ...c, faces: (c.faces || []).map((h) => ({ ...h, device: s.get(h.device) })), pairs: (c.pairs || []).map((h) => ({ ...h, members: h.members.map((u) => s.get(u)) })), groups: c.groups.map((h) => ({ ...h, members: h.members.map((u) => u.cell ? { ...u, cell: s.get(u.cell) } : u) })), relations: c.relations.map((h) => ({ ...h, a: s.get(h.a) || h.a, b: s.get(h.b) || h.b })) } : null, f = Ze(t.modules.circuit.spiceMotifs || [], (h) => s.get(h), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: f, spiceLayoutDescription: a } } }, ids: e, bits: new Map([...n].map(([h, u]) => [u, h])) };
}
const we = /* @__PURE__ */ new Map();
async function hn(t, e) {
  const n = pn(t), o = JSON.stringify([n.netlist, e]);
  let r = we.get(o);
  r ? (we.delete(o), we.set(o, r)) : (r = await mn(n.netlist, e), r.svg.length < 1e6 && (we.set(o, r), we.size > 20 && we.delete(we.keys().next().value)));
  const s = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (s.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const f of s.querySelectorAll("[id],[class]")) {
    const h = f.getAttribute("id");
    h?.startsWith("cell_") && n.ids.has(h.slice(5)) && f.setAttribute("id", "cell_" + n.ids.get(h.slice(5)));
    const u = f.getAttribute("class");
    u && f.setAttribute("class", u.split(/\s+/).map((m) => m.startsWith("cell_") && n.ids.has(m.slice(5)) ? "cell_" + n.ids.get(m.slice(5)) : /^net_\d+$/.test(m) && n.bits.has(Number(m.slice(4))) ? "net_" + n.bits.get(Number(m.slice(4))) : m).join(" "));
  }
  const c = r.drawing ? structuredClone(r.drawing) : null, a = s.querySelector("#spice-layout-report");
  if (a) {
    const f = JSON.parse(a.textContent), h = (u) => n.ids.get(u) || u;
    f.mirroredTransistors = (f.mirroredTransistors || []).map(h), f.orientationDevicesTested = (f.orientationDevicesTested || []).map(h), f.recognizedMotifs = Ze(f.recognizedMotifs || [], h, (u) => n.bits.get(u) ?? u), f.inputAttachments = (f.inputAttachments || []).map(h), f.mirroredInputPorts = (f.mirroredInputPorts || []).map(h);
    for (const u of [...f.flippedPairs || [], ...f.pairOrientationTrials || []]) u.members = u.members.map(h);
    for (const u of f.pairCompactions || [])
      u.members = u.members.map(h), u.moved = h(u.moved);
    for (const u of f.pairConstraints || []) u.members = u.members.map(h);
    for (const u of f.pairProximity || []) u.members = u.members.map(h);
    for (const u of f.motifMeasurements || [])
      u.members = u.members.map(h), u.interlopers && (u.interlopers = u.interlopers.map(h));
    for (const u of f.voltageRails || []) u.bit !== void 0 && (u.bit = n.bits.get(u.bit) ?? u.bit);
    a.textContent = JSON.stringify(f);
  }
  if (c) {
    for (const f of c.components) {
      f.id = n.ids.get(f.id) || f.id;
      for (const h of f.ports) h.bit = n.bits.get(h.bit) ?? h.bit;
    }
    for (const f of c.segments) f.bit = n.bits.get(f.bit) ?? f.bit;
  }
  return { svg: new XMLSerializer().serializeToString(s.documentElement), drawing: c };
}
function mn(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const s = (f, h) => {
      clearTimeout(a), n.terminate(), f ? r(Error(f)) : o(h);
    }, c = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, a = setTimeout(() => s("Layout timed out. Open a subcircuit sheet or collapse instances."), c);
    n.onmessage = ({ data: f }) => s(f.error, { svg: f.svg, drawing: f.drawing }), n.onerror = (f) => s(f.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const gn = `* RLC low-pass filter
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
`, bn = `* Voltage-divider biased common-emitter amplifier.
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
`, yn = `* Common-collector voltage follower; independently chosen example values.
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
`, wn = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, En = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
  filter: { source: gn, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: bn, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: yn, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: wn, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: En, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
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
async function lt(t) {
  return _n(await t.arrayBuffer());
}
const Et = [
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
].flat(), Je = "#292b29", De = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Et[e * 9 + t]))])], ut = (t) => /^#[\da-f]{6}$/i.test(t), dt = "spice-node-colors-v1";
function xn(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class Nn {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = xn(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, De[this.assigned.size % De.length]), this.assigned.get(e)) : Je;
  }
  set(e, n) {
    if (!ut(n)) throw Error("Invalid node color.");
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && ut(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function vn(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const s = o.get(r.getAttribute("data-net"));
    if (!s) continue;
    r.style.setProperty("stroke", s, "important"), r.localName === "circle" && r.style.setProperty("fill", s, "important");
  }
}
function Cn(t, e) {
  const n = new Nn(), o = /* @__PURE__ */ new Set();
  let r = [], s = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(dt) || "null"));
  } catch {
  }
  const c = () => {
    try {
      sessionStorage.setItem(dt, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, a = () => {
    const d = t("node-search").value.trim().toLowerCase();
    return r.filter((y) => !d || [y.name, y.displayName, ...y.terminals.map((E) => E.component + "." + E.pin)].some((E) => E.toLowerCase().includes(d)));
  };
  function f() {
    const d = a(), y = d.filter((E) => o.has(E.name)).length;
    t("node-count").textContent = `${d.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!d.length && y === d.length, t("node-all").indeterminate = y > 0 && y < d.length, t("node-auto").checked = n.auto;
    for (const E of ["node-apply", "node-clear"]) t(E).disabled = !s || !o.size;
    t("node-all").disabled = !s || !d.length;
  }
  function h() {
    t("nets").replaceChildren(...a().map((d) => {
      const y = document.createElement("tr");
      y.dataset.node = d.name;
      const E = document.createElement("td"), w = document.createElement("input");
      w.type = "checkbox", w.checked = o.has(d.name), w.disabled = !s, w.setAttribute("aria-label", "Select node " + d.displayName), w.onchange = () => {
        w.checked ? o.add(d.name) : o.delete(d.name), f();
      }, E.append(w);
      const I = document.createElement("td");
      I.textContent = d.displayName;
      const _ = document.createElement("td"), b = document.createElement("input");
      b.type = "color", b.value = n.color(d.name), b.disabled = !s, b.setAttribute("aria-label", "Wire color for " + d.displayName), b.onchange = () => {
        n.set([d.name], b.value), u();
      }, _.append(b);
      const N = document.createElement("td");
      return N.textContent = d.terminals.map((T) => T.component + "." + T.pin).join(", "), y.append(E, I, _, N), y;
    })), f();
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
    n.set(o, Je), u();
  }, t("node-reset").onclick = () => {
    n.reset(), u();
  }, t("node-swatches").replaceChildren(...Et.map((d) => {
    const y = document.createElement("button");
    return y.type = "button", y.style.backgroundColor = d, y.title = d, y.setAttribute("aria-label", "Apply palette color " + d), y.onclick = () => {
      o.size && (t("node-color").value = d, n.set(o, d), u());
    }, y;
  }));
  function m(d) {
    s = d;
    for (const y of t("node-panel").querySelectorAll("input,button")) y.disabled = !s;
    f();
  }
  return { setCircuit(d, y) {
    const E = n.sourceId;
    n.setSource(y), E !== n.sourceId && o.clear(), r = Object.values(d?.nodes || {});
    const w = new Set(r.map((I) => I.name));
    for (const I of o) w.has(I) || o.delete(I);
    for (const I of r) n.color(I.name);
    s = !!d, h(), m(s), c(), e(n, r);
  }, setEnabled: m };
}
function In(t) {
  const e = (k) => t.querySelector("#spice-" + k), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), info: e("info-panel") }, s = Object.fromEntries(Object.keys(r).map((k) => [k, t.querySelector(`[data-window-handle="${k}"]`)])), c = { editor: !0, info: !0 }, a = { editor: !0, info: !0 }, f = [], h = { editor: {}, info: {} }, u = [];
  let m = !1, d = !1, y = null, E = null, w = null, I = null;
  function _(k, x) {
    if (a[k] = x, r[k].dataset.pinned = String(x), e("pin-" + k).setAttribute("aria-pressed", String(x)), x) for (const P of ["left", "top", "right", "bottom", "width", "height"]) r[k].style.removeProperty(P);
  }
  for (const k of Object.keys(r)) _(k, !0);
  const b = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: m, panels: { ...c } } })), N = (k, x, P, V = {}) => k.addEventListener(x, P, { ...V, signal: o });
  function T(k, x) {
    c[k] = x, r[k].hidden = m && !x, e("show-" + k).setAttribute("aria-expanded", String(x)), b();
  }
  function M(k) {
    const x = document.createComment("workspace return");
    k.before(x), f.push({ node: k, anchor: x }), e("info-content").prepend(k);
  }
  function C(k) {
    const x = k.getBoundingClientRect(), P = t.getBoundingClientRect();
    return { x: x.left - P.left, y: x.top - P.top, w: x.width, h: x.height, width: P.width, height: P.height };
  }
  function R(k, x, P) {
    const V = C(k), F = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, Y = Math.max(8, Math.min(x, V.width - V.w - 8)), H = Math.max(8, Math.min(F, V.height - V.h - 8)), Q = Math.max(H, Math.min(P, V.height - V.h - 8));
    k.style.left = Math.round(Y) + "px", k.style.top = Math.round(Q) + "px", k.style.right = "auto", k.style.bottom = "auto";
  }
  function B() {
    if (m) {
      for (const [k, x] of Object.entries(r)) if (!x.hidden && !a[k]) {
        const P = C(x);
        R(x, P.x, P.y);
      }
    }
  }
  function g() {
    for (const k of Object.values(r))
      for (const x of ["left", "top", "right", "bottom", "width", "height", "z-index"]) k.style.removeProperty(x);
    for (const k of Object.keys(r))
      _(k, !0), T(k, !0);
    requestAnimationFrame(B);
  }
  function p() {
    if (!m) {
      m = !0, y = document.activeElement, E = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, I = document.createComment("workspace mount"), t.before(I), document.body.append(t);
      for (const k of document.body.children) k !== t && (u.push({ node: k, inert: k.inert }), k.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const k of Object.keys(r))
        h[k].base = r[k].style.cssText, h[k].floating && (r[k].style.cssText = h[k].floating), r[k].setAttribute("role", "dialog"), r[k].setAttribute("aria-modal", "false"), r[k].setAttribute("aria-labelledby", "spice-" + k + "-title"), s[k].tabIndex = 0, s[k].title = "Drag to move; arrow keys move the window", T(k, c[k]);
      for (const k of ["selection-actions", "selection", "edit-help", "hierarchy-panel"]) M(e(k));
      requestAnimationFrame(B), e("exit-fullscreen").focus({ preventScroll: !0 }), b();
    }
  }
  function D() {
    if (m) {
      m = !1, w = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: k, anchor: x } of f.splice(0))
        x.before(k), x.remove();
      for (const k of Object.keys(r)) {
        h[k].floating = r[k].style.cssText, r[k].style.cssText = h[k].base, r[k].hidden = !1;
        for (const x of ["role", "aria-modal", "aria-labelledby"]) r[k].removeAttribute(x);
        s[k].removeAttribute("tabindex"), s[k].removeAttribute("title");
      }
      I && (I.before(t), I.remove(), I = null);
      for (const { node: k, inert: x } of u.splice(0)) k.inert = x;
      E && (document.documentElement.style.overflow = E.html, document.body.style.overflow = E.body, window.scrollTo(E.x, E.y)), y?.focus?.({ preventScroll: !0 }), b();
    }
  }
  async function X() {
    p(), t.dataset.nativeFullscreen = "false";
  }
  async function W() {
    if (d = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        d = !0;
        return;
      }
    D();
  }
  N(e("fullscreen"), "click", () => m ? W() : X()), N(e("exit-fullscreen"), "click", W), N(e("reset-windows"), "click", g);
  for (const k of Object.keys(r)) {
    N(e("pin-" + k), "click", () => {
      const V = C(r[k]);
      _(k, !a[k]), a[k] || (r[k].style.width = V.w + "px", r[k].style.height = V.h + "px", R(r[k], V.x, V.y)), b();
    }), N(e("show-" + k), "click", () => {
      T(k, !c[k]), requestAnimationFrame(B);
    }), N(e("close-" + k), "click", () => {
      T(k, !1), e("show-" + k).focus({ preventScroll: !0 });
    }), N(r[k], "pointerdown", () => {
      if (m) {
        for (const V of Object.values(r)) V.style.zIndex = "20";
        r[k].style.zIndex = "30";
      }
    }, { capture: !0 });
    const x = s[k];
    N(x, "pointerdown", (V) => {
      if (!m || V.button !== 0 || V.target.closest("button,input,select,textarea,a,label")) return;
      V.preventDefault();
      const F = C(r[k]);
      _(k, !1), r[k].style.width = F.w + "px", r[k].style.height = F.h + "px", R(r[k], F.x, F.y), w = { id: k, pointer: V.pointerId, x: V.clientX, y: V.clientY, left: F.x, top: F.y }, x.setPointerCapture(V.pointerId);
    }), N(x, "pointermove", (V) => {
      w?.id === k && w.pointer === V.pointerId && R(r[k], w.left + V.clientX - w.x, w.top + V.clientY - w.y);
    });
    const P = () => {
      w = null;
    };
    N(x, "pointerup", P), N(x, "pointercancel", P), N(x, "lostpointercapture", P), N(x, "keydown", (V) => {
      if (!m || V.target !== x || !V.key.startsWith("Arrow")) return;
      V.preventDefault();
      const F = C(r[k]), Y = V.shiftKey ? 32 : 8;
      _(k, !1), r[k].style.width = F.w + "px", r[k].style.height = F.h + "px", R(r[k], F.x + ({ ArrowLeft: -Y, ArrowRight: Y }[V.key] || 0), F.y + ({ ArrowUp: -Y, ArrowDown: Y }[V.key] || 0));
    });
  }
  N(document, "fullscreenchange", () => {
    m && d && document.fullscreenElement !== t && (d = !1, D());
  }), N(document, "keydown", (k) => {
    m && k.altKey && k.key === "Escape" && (k.preventDefault(), k.stopImmediatePropagation(), W());
  }, { capture: !0 }), N(window, "resize", B);
  const Z = new ResizeObserver(B);
  for (const k of Object.values(r)) Z.observe(k);
  return { enter: X, exit: W, showPanel: T, reset: g, destroy() {
    W(), n.abort(), Z.disconnect();
  } };
}
const oe = 1e-3, ne = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), re = (t, e) => Math.abs(t - e) < oe, ge = (t, e) => re(e.a.x, e.b.x) ? re(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - oe && t.y <= Math.max(e.a.y, e.b.y) + oe : re(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - oe && t.x <= Math.max(e.a.x, e.b.x) + oe, Tn = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), Sn = (t, e) => Math.max(t.a.x, t.b.x) > e.x + oe && Math.min(t.a.x, t.b.x) < e.x + e.width - oe && Math.max(t.a.y, t.b.y) > e.y + oe && Math.min(t.a.y, t.b.y) < e.y + e.height - oe;
function Be(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && ne(e.at(-1)) === ne(n))) {
      for (; e.length > 1 && (re(e.at(-2).x, e.at(-1).x) && re(e.at(-1).x, n.x) || re(e.at(-2).y, e.at(-1).y) && re(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class An {
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
    return re(e.x / this.step, Math.round(e.x / this.step)) && re(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !re(e.a.x, e.b.x) && !re(e.a.y, e.b.y)) return !1;
    const o = this.pins();
    if (o.some((r) => r.bit !== n && ge(r, e)) || this.segments.some((r) => r.bit !== n && (ge(e.a, r) || ge(e.b, r) || ge(r.a, e) || ge(r.b, e)))) return !1;
    for (const r of this.components) if (Sn(e, r) && !o.filter((c) => c.owner === r.id && c.bit === n).some((c) => c.side === "NORTH" ? re(e.a.x, c.x) && re(e.b.x, c.x) && Math.max(e.a.y, e.b.y) <= c.y + oe : c.side === "SOUTH" ? re(e.a.x, c.x) && re(e.b.x, c.x) && Math.min(e.a.y, e.b.y) >= c.y - oe : c.side === "WEST" ? re(e.a.y, c.y) && re(e.b.y, c.y) && Math.max(e.a.x, e.b.x) <= c.x + oe : c.side === "EAST" ? re(e.a.y, c.y) && re(e.b.y, c.y) && Math.min(e.a.x, e.b.x) >= c.x - oe : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const o = Be(n), r = o.slice(1).map((s, c) => ({ bit: e, a: o[c], b: s })).filter((s) => Tn(s) > oe);
    if (!r.length) return !1;
    if (r.some((s) => !this.validSegment(s, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...r), !0;
  }
  move(e, n, o) {
    if (n = Math.round(n / this.step) * this.step, o = Math.round(o / this.step) * this.step, !n && !o) return;
    const r = this.snapshot(), s = this.components.find((f) => f.id === e);
    if (!s) return;
    const c = s.ports.map((f) => ({ ...f }));
    this.segments = this.segments.filter((f) => !c.some((h) => h.bit === f.bit && (ne(h) === ne(f.a) || ne(h) === ne(f.b)))), s.x += n, s.y += o;
    for (const f of s.ports)
      f.x += n, f.y += o;
    if (this.pinCache = null, this.components.some((f) => f !== s && s.x < f.x + f.width - oe && s.x + s.width > f.x + oe && s.y < f.y + f.height - oe && s.y + s.height > f.y + oe) || this.segments.some((f) => !this.validSegment(f, f.bit)) || s.ports.some((f) => this.pins().some((h) => h.owner !== e && h.bit !== f.bit && ne(h) === ne(f))))
      throw this.restore(r), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(r);
  }
  transform(e, n) {
    const o = this.components.find((d) => d.id === e);
    if (!o) return;
    const r = this.snapshot(), s = o.width, c = o.height, a = n === "rotate" ? [0, 1, -1, 0, c, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, c] : n === "mirror-y" ? [-1, 0, 0, 1, s, 0] : null;
    if (!a) throw Error("Unknown transform.");
    const f = o.ports.map((d) => ({ ...d })), h = (d) => ({ x: a[0] * d.x + a[2] * d.y + a[4], y: a[1] * d.x + a[3] * d.y + a[5] });
    this.segments = this.segments.filter((d) => !f.some((y) => y.bit === d.bit && (ne(y) === ne(d.a) || ne(y) === ne(d.b))));
    const u = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of o.ports) {
      const y = h({ x: d.x - o.x, y: d.y - o.y });
      d.x = o.x + y.x, d.y = o.y + y.y, d.side = u[d.side] || d.side;
    }
    const m = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [a[0] * m[0] + a[2] * m[1], a[1] * m[0] + a[3] * m[1], a[0] * m[2] + a[2] * m[3], a[1] * m[2] + a[3] * m[3], a[0] * m[4] + a[2] * m[5] + a[4], a[1] * m[4] + a[3] * m[5] + a[5]], n === "rotate" && (o.width = c, o.height = s), this.pinCache = null, o.ports.some((d) => !this.onGrid(d)) || this.components.some((d) => d !== o && o.x < d.x + d.width - oe && o.x + o.width > d.x + oe && o.y < d.y + d.height - oe && o.y + o.height > d.y + oe) || this.segments.some((d) => !this.validSegment(d, d.bit)) || o.ports.some((d) => this.pins().some((y) => y.owner !== e && y.bit !== d.bit && ne(y) === ne(d))))
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
      const s = /* @__PURE__ */ new Map(), c = (u) => {
        s.has(ne(u)) || s.set(ne(u), u);
      };
      r.pins.forEach(c);
      for (const u of r.segments)
        c(u.a), c(u.b);
      for (let u = 0; u < r.segments.length; u++) for (let m = u + 1; m < r.segments.length; m++) {
        const d = r.segments[u], y = r.segments[m];
        if (re(d.a.x, d.b.x) === re(y.a.x, y.b.x)) continue;
        const E = re(d.a.x, d.b.x) ? d : y, w = E === d ? y : d, I = { x: E.a.x, y: w.a.y };
        ge(I, E) && ge(I, w) && c(I);
      }
      const a = new Map([...s.keys()].map((u) => [u, u])), f = (u) => {
        let m = u;
        for (; a.get(m) !== m; ) m = a.get(m);
        for (; u !== m; ) {
          const d = a.get(u);
          a.set(u, m), u = d;
        }
        return m;
      };
      for (const u of r.segments) {
        const m = [...s.values()].filter((d) => ge(d, u));
        for (const d of m.slice(1)) a.set(f(ne(d)), f(ne(m[0])));
      }
      const h = /* @__PURE__ */ new Map();
      for (const u of r.pins) {
        const m = f(ne(u));
        h.has(m) || h.set(m, { pins: [], points: [] }), h.get(m).pins.push(u);
      }
      for (const u of s.values()) {
        const m = f(ne(u));
        h.has(m) && h.get(m).points.push(u);
      }
      n.push({ bit: o, islands: [...h.values()], points: [...s.values()], segments: r.segments });
    }
    return this.cache = n, n;
  }
  airwires() {
    const e = [];
    for (const { bit: n, islands: o } of this.connectivity()) {
      if (o.length < 2) continue;
      const r = /* @__PURE__ */ new Set([0]);
      for (; r.size < o.length; ) {
        let s;
        for (const c of r) for (let a = 0; a < o.length; a++) if (!r.has(a)) for (const f of o[c].points) for (const h of o[a].points) {
          const u = (f.x - h.x) ** 2 + (f.y - h.y) ** 2;
          (!s || u < s.d) && (s = { bit: n, a: f, b: h, d: u, j: a });
        }
        e.push(s), r.add(s.j);
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
    const o = Math.min(...e), r = Math.min(...n);
    return { x: o, y: r, w: Math.max(...e) - o, h: Math.max(...n) - r };
  }
  drawing() {
    const e = this.bounds();
    return { version: 1, width: e.w, height: e.h, components: structuredClone(this.components.filter((n) => !n.decoration)), segments: structuredClone(this.segments) };
  }
  findPath(e, n, o) {
    if (!this.onGrid(n) || !this.onGrid(o)) return null;
    const r = (M) => M.slice(1).every((C, R) => this.validSegment({ a: M[R], b: C }, e));
    for (const M of [[n, o], [n, { x: o.x, y: n.y }, o], [n, { x: n.x, y: o.y }, o]]) {
      const C = Be(M);
      if (r(C)) return C;
    }
    const s = this.step, c = this.bounds(), a = Math.floor(Math.min(c.x, n.x, o.x) / s) - 5, f = Math.ceil(Math.max(c.x + c.w, n.x, o.x) / s) + 5, h = Math.floor(Math.min(c.y, n.y, o.y) / s) - 5, u = Math.ceil(Math.max(c.y + c.h, n.y, o.y) / s) + 5, m = { x: n.x / s, y: n.y / s, dir: -1, cost: 0, key: n.x / s + "," + n.y / s + ",-1" }, d = [m], y = /* @__PURE__ */ new Map([[m.key, 0]]), E = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map([[m.key, m]]), I = [[1, 0], [-1, 0], [0, 1], [0, -1]], _ = (M) => Math.abs(M.x - o.x / s) + Math.abs(M.y - o.y / s);
    let b = null, N = 0;
    for (; d.length && N++ < 3e4; ) {
      let M = 0;
      for (let R = 1; R < d.length; R++) d[R].cost + _(d[R]) < d[M].cost + _(d[M]) && (M = R);
      const C = d.splice(M, 1)[0];
      if (C.cost === y.get(C.key)) {
        if (C.x === o.x / s && C.y === o.y / s) {
          b = C;
          break;
        }
        for (let R = 0; R < 4; R++) {
          const B = C.x + I[R][0], g = C.y + I[R][1];
          if (B < a || B > f || g < h || g > u) continue;
          const p = { x: B, y: g, dir: R, key: B + "," + g + "," + R, cost: C.cost + 1 + (C.dir !== -1 && C.dir !== R ? 3 : 0) };
          p.cost >= (y.get(p.key) ?? 1 / 0) || !this.validSegment({ a: { x: C.x * s, y: C.y * s }, b: { x: B * s, y: g * s } }, e) || (y.set(p.key, p.cost), E.set(p.key, C.key), w.set(p.key, p), d.push(p));
        }
      }
    }
    if (!b) return null;
    const T = [];
    for (let M = b; M; M = w.get(E.get(M.key))) T.push({ x: M.x * s, y: M.y * s });
    return Be(T.reverse());
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
      const s = this.airwires().find((a) => !o.has(a.bit + ":" + ne(a.a) + ":" + ne(a.b)));
      if (!s) break;
      const c = this.findPath(s.bit, s.a, s.b);
      c ? (this.segments.push(...c.slice(1).map((a, f) => ({ bit: s.bit, a: c[f], b: a }))), this.cache = null) : o.add(s.bit + ":" + ne(s.a) + ":" + ne(s.b)), r % 3 === 0 && await new Promise((a) => setTimeout(a, 0));
    }
    this.redoStack = [];
  }
}
const On = "http://www.w3.org/2000/svg", le = (t, e = {}) => {
  const n = document.createElementNS(On, t);
  for (const [o, r] of Object.entries(e)) n.setAttribute(o, r);
  return n;
}, kn = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function Rn(t, e, { changed: n, inspect: o, getNetColor: r }) {
  let s = null, c = null, a = !1, f = !1, h = null, u = null, m = -1, d = "", y = 0, E = "", w = 8, I = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
  const N = (x) => new DOMPoint(x.clientX, x.clientY).matrixTransform(c.getScreenCTM().inverse()), T = (x) => s.snap(N(x)), M = (x) => r?.(x) || De[Number(x) % De.length], C = (x) => {
    e("editor-status").textContent = x;
  };
  function R() {
    return { unrouted: s?.airwires().length || 0, wires: s?.segments.length || 0, editing: a, routing: f };
  }
  function B() {
    const x = !!s;
    for (const P of ["interactive", "flywire", "auto-route"]) e(P).disabled = !c || f;
    e("edit-tool").disabled = !x || f;
    for (const P of document.querySelectorAll("[data-editor-mode]"))
      P.disabled = !c || f, P.setAttribute("aria-pressed", String(a && P.dataset.editorMode === e("edit-tool").value));
    e("wire-undo").disabled = !x || f || !s.undoStack.length, e("wire-redo").disabled = !x || f || !s.redoStack.length, t.classList.toggle("spice-editing", a);
  }
  function g(x, P) {
    const V = b.get(x.id);
    if (V && (P.replaceChildren(...V.children.map((F) => F.cloneNode(!0))), x.editorMatrix)) {
      const F = x.editorMatrix, Y = le("g", { transform: "matrix(" + F.join(" ") + ")", "data-editor-glyph": "true" });
      Y.append(...P.childNodes);
      for (const H of Y.querySelectorAll("text")) H.remove();
      P.append(Y);
      for (const [H, Q] of V.labels.entries()) {
        const J = Q.node.cloneNode(!0);
        J.removeAttribute("transform");
        let te = F[0] * Q.x + F[2] * Q.y + F[4], S = F[1] * Q.x + F[3] * Q.y + F[5];
        if (x.ports.length === 2 && V.labels.length === 2) {
          const L = Math.abs(x.ports[0].y - x.ports[1].y) < 1e-3;
          te = L ? x.width / 2 : x.ports[0].x - x.x + 20, S = L ? x.ports[0].y - x.y - 26 + H * 16 : x.height / 2 - 8 + H * 16, J.setAttribute("text-anchor", L ? "middle" : "start");
        }
        J.setAttribute("x", te), J.setAttribute("y", S), P.append(J);
      }
    }
  }
  function p(x) {
    if (h = null, ["rotate", "mirror-x", "mirror-y"].includes(x) && d) {
      try {
        s.transform(d, x), W();
      } catch (P) {
        C(P.message);
      }
      return;
    }
    e("edit-tool").value = x, X(), B();
  }
  function D() {
    if (!s) return;
    const x = R();
    C(`${x.unrouted} connection${x.unrouted === 1 ? "" : "s"} unrouted · ${x.wires} wire segments${f ? " · Auto-routing…" : ""}`), B(), n(s.drawing(), x, s.bounds()), _.set(E, s.snapshot()), _.size > 20 && _.delete(_.keys().next().value);
  }
  function X(x = null) {
    if (c?.querySelector("[data-route-preview]")?.remove(), !h || !c) return;
    const P = [...h.points];
    if (x) {
      const Y = P.at(-1);
      P.push({ x: x.x, y: Y.y }, x);
    }
    const V = le("g", { "data-route-preview": "true", "data-editor-overlay": "true", "pointer-events": "none" });
    V.append(le("polyline", { points: P.map((Y) => Y.x + "," + Y.y).join(" "), fill: "none", stroke: M(h.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), c.append(V);
    const F = c.querySelector("[data-airwires]");
    F && c.append(F);
  }
  function W() {
    if (!c || !s) return;
    for (const H of c.querySelectorAll("[data-editor-body-hit]")) H.remove();
    for (const H of [...c.children]) (H.hasAttribute("data-editor-overlay") || H.hasAttribute("data-airwires") || H.hasAttribute("data-manual-state") || H.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(H.localName)) && H.remove();
    for (const H of s.components) {
      const Q = c.getElementById("cell_" + H.id);
      Q && (g(H, Q), Q.setAttribute("s:width", H.width), Q.setAttribute("s:height", H.height), Q.setAttribute("transform", `translate(${H.x},${H.y})`), Q.dataset.editorComponent = H.id, a && Q.prepend(le("rect", { x: 0, y: 0, width: H.width, height: H.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    const x = c.querySelector('g[id^="cell_"]'), P = le("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), V = le("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [H, Q] of s.segments.entries()) {
      const J = le("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, class: "net_" + Q.bit, "data-net": I.get(Q.bit) || String(Q.bit), "stroke-width": H === m ? 2.8 : 1.4 });
      J.append(le("title")), J.firstChild.textContent = "Node " + (I.get(Q.bit) || Q.bit), c.insertBefore(J, x), a && P.append(le("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, "data-editor-wire": H, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const H of s.connectivity()) for (const Q of H.points) {
      const J = /* @__PURE__ */ new Set();
      for (const te of H.segments) ge(Q, te) && (Math.min(te.a.x, te.b.x) < Q.x - 1e-3 && J.add("w"), Math.max(te.a.x, te.b.x) > Q.x + 1e-3 && J.add("e"), Math.min(te.a.y, te.b.y) < Q.y - 1e-3 && J.add("n"), Math.max(te.a.y, te.b.y) > Q.y + 1e-3 && J.add("s"));
      (J.size >= 3 || J.size >= 2 && H.islands.some((te) => te.pins.some((S) => kn(Q, S)))) && c.insertBefore(le("circle", { cx: Q.x, cy: Q.y, r: 2, class: "net_" + H.bit, "data-net": I.get(H.bit) || String(H.bit), fill: M(H.bit) }), x);
    }
    if (a) {
      const H = s.components.find((Q) => Q.id === d);
      H && P.append(le("rect", { x: H.x - 3, y: H.y - 3, width: H.width + 6, height: H.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none" }));
      for (const Q of s.pins()) {
        const J = le("circle", { cx: Q.x, cy: Q.y, r: 3, "data-editor-pin": Q.id, "data-editor-bit": Q.bit, fill: "#fff", stroke: M(Q.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": "all", tabindex: 0, role: "button", "aria-label": Q.owner + " " + Q.pin }), te = le("title");
        te.textContent = Q.id + " · " + (I.get(Q.bit) || Q.bit), J.append(te), V.append(J);
      }
      c.append(P, V);
    }
    X();
    const F = le("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const H of s.airwires()) F.append(le("line", { x1: H.a.x, y1: H.a.y, x2: H.b.x, y2: H.b.y, stroke: M(H.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": H.bit, "data-from-owner": H.a.owner || "", "data-to-owner": H.b.owner || "" }));
    c.append(F);
    const Y = le("metadata", { "data-manual-state": "true" });
    Y.textContent = JSON.stringify({ version: 1, grid: w, unrouted: s.airwires().length, manual: !0 }), c.insertBefore(Y, F), D();
  }
  function Z(x, P) {
    if (!h) {
      h = { bit: P, points: [x] }, X(), C("Click grid points for corners, then a pin or wire of the same node. Escape cancels.");
      return;
    }
    if (P !== void 0 && h.bit !== P) {
      C("Different nodes cannot be connected. Choose a pin or wire of the same node.");
      return;
    }
    const V = h.points.at(-1), F = s.findPath(h.bit, V, x);
    if (!F) {
      C("No clear grid path. Add a waypoint around the obstacle.");
      return;
    }
    if (P === void 0) {
      h.points.push(...F.slice(1)), X();
      return;
    }
    try {
      s.addPath(P, [...h.points, ...F.slice(1)]), h = null, W();
    } catch (Y) {
      C(Y.message);
    }
  }
  t.addEventListener("pointerdown", (x) => {
    if (!a || f || !s || !c || x.button !== 0 || x.shiftKey) return;
    const P = x.target.closest("[data-editor-pin]"), V = x.target.closest("[data-editor-wire]"), F = x.target.closest("[data-editor-component]");
    if (!(!P && !V && !F && !h)) {
      if (x.preventDefault(), x.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), P) {
        const Y = s.pins().find((H) => H.id === P.dataset.editorPin);
        e("edit-tool").value = "route", B(), Z({ x: Y.x, y: Y.y }, Y.bit);
        return;
      }
      if (V) {
        const Y = +V.dataset.editorWire, H = s.segments[Y];
        if (e("edit-tool").value === "erase" && !h) {
          s.remove(Y), m = -1, W();
          return;
        }
        if (h || e("edit-tool").value === "route") {
          const Q = T(x);
          Z(H.a.x === H.b.x ? { x: H.a.x, y: Q.y } : { x: Q.x, y: H.a.y }, H.bit);
        } else
          m = Y, W(), C("Wire selected. Delete removes this segment; Route starts a branch from its middle.");
        return;
      }
      if (h) {
        Z(T(x));
        return;
      }
      if (F) {
        const Y = F.dataset.editorComponent, H = s.components.find((Q) => Q.id === Y);
        if (!H) return;
        if (d = Y, m = -1, o?.(Y), ["rotate", "mirror-x", "mirror-y"].includes(e("edit-tool").value)) {
          p(e("edit-tool").value);
          return;
        }
        if (e("edit-tool").value !== "move") {
          W();
          return;
        }
        u = { id: Y, n: H, element: F, x: x.clientX, y: x.clientY, start: N(x), dx: 0, dy: 0 }, F.style.opacity = ".6", t.setPointerCapture(x.pointerId);
        return;
      }
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (x) => {
    if (!(!a || !s || !c)) {
      if (u) {
        x.stopImmediatePropagation();
        const P = N(x), V = s.snap({ x: P.x - u.start.x, y: P.y - u.start.y });
        u.dx = V.x, u.dy = V.y, u.element.setAttribute("transform", `translate(${u.n.x + u.dx},${u.n.y + u.dy})`);
        for (const F of c.querySelectorAll("[data-airwires] line"))
          F.dataset.fromOwner === u.id && (F.setAttribute("x1", +F.getAttribute("x1") - Number(F.dataset.dx || 0) + u.dx), F.setAttribute("y1", +F.getAttribute("y1") - Number(F.dataset.dy || 0) + u.dy)), F.dataset.toOwner === u.id && (F.setAttribute("x2", +F.getAttribute("x2") - Number(F.dataset.dx || 0) + u.dx), F.setAttribute("y2", +F.getAttribute("y2") - Number(F.dataset.dy || 0) + u.dy)), F.dataset.dx = u.dx, F.dataset.dy = u.dy;
        return;
      }
      h && X(T(x));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (x) => {
    if (!u) return;
    x.preventDefault(), x.stopImmediatePropagation();
    const P = u;
    u = null, P.element.style.opacity = "", t.hasPointerCapture(x.pointerId) && t.releasePointerCapture(x.pointerId);
    try {
      s.move(P.id, P.dx, P.dy), m = -1, W();
    } catch (V) {
      W(), C(V.message);
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    u && (u.element.style.opacity = "", u = null, W());
  }), document.addEventListener("keydown", (x) => {
    if (!a || !s || f || x.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(x.target)) return;
    const P = x.target.closest("[data-editor-pin]"), V = x.key.toLowerCase();
    if (P && (x.key === "Enter" || x.key === " ")) {
      x.preventDefault(), x.stopImmediatePropagation();
      const F = s.pins().find((Y) => Y.id === P.dataset.editorPin);
      Z({ x: F.x, y: F.y }, F.bit);
      return;
    }
    x.key === "Escape" ? (x.preventDefault(), x.stopImmediatePropagation(), h = null, p("move"), W()) : (x.key === "Delete" || x.key === "Backspace") && m >= 0 ? (x.preventDefault(), x.stopImmediatePropagation(), s.remove(m), m = -1, W()) : (x.ctrlKey || x.metaKey) && V === "z" ? (x.preventDefault(), x.stopImmediatePropagation(), x.shiftKey ? s.redo() : s.undo(), h = null, W()) : !x.ctrlKey && !x.metaKey && !x.altKey && { v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[V] && (x.preventDefault(), x.stopImmediatePropagation(), p({ v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[V]));
  }, { capture: !0 });
  async function k() {
    if (!s || f) return;
    const x = y;
    f = !0, D(), C("Auto-routing remaining connections…");
    try {
      await s.autoRoute(() => x !== y), x === y && (h = null, m = -1, f = !1, W());
    } catch (P) {
      x === y && (f = !1, W(), C(P.message));
    }
  }
  return {
    mount(x, P, V, F, Y, { reset: H = !1 } = {}) {
      y++, f = !1, c = x, h = null, u = null, m = -1, d = "", b = /* @__PURE__ */ new Map();
      for (const S of c.querySelectorAll('g[id^="cell_"]')) {
        const L = S.getCTM().inverse();
        b.set(S.id.slice(5), { children: [...S.childNodes].map((G) => G.cloneNode(!0)), labels: [...S.querySelectorAll("text")].map((G) => {
          const $ = new DOMPoint(+G.getAttribute("x") || 0, +G.getAttribute("y") || 0).matrixTransform(L.multiply(G.getCTM()));
          return { node: G.cloneNode(!0), x: $.x, y: $.y };
        }) });
      }
      if (w = Y.gridSize || 0, I = new Map(Object.values(V.nodes).map((S) => [S.bit, S.name])), !P || !w) {
        s = null, B();
        return;
      }
      const Q = structuredClone(P);
      for (const S of Q.components) {
        const L = c.getElementById("cell_" + S.id);
        for (const G of S.ports) {
          const $ = [...L.children].find((z) => z.getAttribute("s:pid") === G.pin);
          G.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[$?.getAttribute("s:position")] || G.side;
        }
      }
      for (const [S, L] of Object.entries(F.modules.circuit.cells)) if (L.attributes.name === "0") {
        const G = c.getElementById("cell_" + S), $ = G?.transform.baseVal.consolidate().matrix;
        G && $ && Q.components.push({ id: S, decoration: !0, x: $.e, y: $.f, width: +G.getAttribute("s:width"), height: +G.getAttribute("s:height"), ports: [...G.children].filter((z) => z.hasAttribute("s:pid")).map((z) => ({ pin: z.getAttribute("s:pid"), x: $.e + Number(z.getAttribute("s:x")), y: $.f + Number(z.getAttribute("s:y")), bit: L.connections[z.getAttribute("s:pid")][0], side: "NORTH" })) });
      }
      const J = new Map(Object.values(V.nodes).map((S) => [S.name, S.bit])), te = [...c.children].filter((S) => S.localName === "line" && S.hasAttribute("data-net")).map((S) => ({ bit: J.get(S.dataset.net), a: { x: +S.getAttribute("x1"), y: +S.getAttribute("y1") }, b: { x: +S.getAttribute("x2"), y: +S.getAttribute("y2") } }));
      s = new An(Q, { step: w, segments: te }), E = JSON.stringify([V.topology.signature, Y]), !H && _.has(E) ? s.restore(_.get(E)) : e("flywire").checked && s.clear(), a = e("interactive").checked, a || !H && _.has(E) || e("flywire").checked ? W() : B();
    },
    invalidate() {
      y++, f = !1, s = null, c = null, h = null, u = null, B();
    },
    setEnabled(x) {
      a = x, x || (h = null), s ? W() : B();
    },
    clear() {
      s && (s.clear(), h = null, W());
    },
    autoRoute: k,
    chooseTool: p,
    undo() {
      s && (h = null, s.undo(), W());
    },
    redo() {
      s && (h = null, s.redo(), W());
    },
    complete() {
      return !s || !f && s.airwires().length === 0;
    },
    working() {
      return f;
    },
    stats: R,
    canEdit() {
      return !!s;
    },
    refreshColors() {
      if (c) {
        for (const x of c.querySelectorAll("[data-air-net]")) x.setAttribute("stroke", M(+x.dataset.airNet));
        for (const x of c.querySelectorAll("[data-editor-bit]")) x.setAttribute("stroke", M(+x.dataset.editorBit));
      }
    },
    cleanExport(x) {
      for (const P of x.querySelectorAll("[data-editor-overlay],[data-route-preview]")) P.remove();
      for (const P of x.querySelectorAll("[data-editor-component]"))
        P.removeAttribute("data-editor-component"), P.style.removeProperty("opacity");
    }
  };
}
const ze = 4, Re = "http://www.w3.org/2000/svg";
function Qe(t, e, n = !0, o = null) {
  let r = t.querySelector("defs[data-coordinate-grid]"), s = t.querySelector("rect[data-coordinate-grid]");
  if (!r) {
    r = document.createElementNS(Re, "defs"), r.dataset.coordinateGrid = "true";
    const m = document.createElementNS(Re, "pattern");
    m.id = "spice-coordinate-grid", m.setAttribute("patternUnits", "userSpaceOnUse");
    const d = document.createElementNS(Re, "path");
    d.setAttribute("fill", "none"), d.setAttribute("stroke", "#737b83"), d.setAttribute("stroke-opacity", ".23"), d.setAttribute("stroke-width", ".55"), d.setAttribute("vector-effect", "non-scaling-stroke"), m.append(d), r.append(m), s = document.createElementNS(Re, "rect"), s.dataset.coordinateGrid = "true", s.setAttribute("fill", "url(#spice-coordinate-grid)"), s.setAttribute("stroke", "none"), s.setAttribute("pointer-events", "none"), t.prepend(s), t.prepend(r);
  }
  const c = r.firstElementChild, a = e || 8;
  c.setAttribute("width", a), c.setAttribute("height", a), c.firstElementChild.setAttribute("d", `M${a},0 H0 V${a}`), s.setAttribute("visibility", n && e ? "visible" : "hidden");
  let f = c.querySelector("[data-minor-grid]");
  f || (f = c.firstElementChild.cloneNode(), f.setAttribute("data-minor-grid", "true"), f.setAttribute("stroke-opacity", ".08"), c.append(f));
  const h = [];
  for (let m = ze; m < a; m += ze) h.push(`M${m},0 V${a} M0,${m} H${a}`);
  f.setAttribute("d", h.join(" ")), t.dataset.displayGridStep = String(a);
  const u = o || (() => {
    const m = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    return { x: m[0], y: m[1], w: m[2], h: m[3] };
  })();
  for (const [m, d] of Object.entries({ x: u.x, y: u.y, width: u.w, height: u.h })) s.setAttribute(m, d);
}
const Ln = `<svg
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
`, Mn = `<svg
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
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
  <line x1="11" x2="11" y1="8" y2="14" />
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <line x1="8" x2="14" y1="11" y2="11" />
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
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
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
  <path d="M9 14 4 9l5-5" />
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
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
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`;
function Wn(t) {
  const e = { move: Ln, route: Mn, erase: Pn, rotate: Dn, "mirror-x": Un, "mirror-y": Bn }, n = { "zoom-in": Qn, "zoom-out": jn, fit: Vn, "wire-undo": Fn, "wire-redo": Gn, "auto-route": Hn }, o = (r, s) => {
    if (!r) return;
    const c = r.title || r.getAttribute("aria-label") || r.textContent;
    r.setAttribute("aria-label", c), r.title = c, r.innerHTML = s, r.firstElementChild.setAttribute("aria-hidden", "true"), r.firstElementChild.setAttribute("focusable", "false"), r.classList.add("spice-icon-button");
  };
  for (const [r, s] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${r}"]`), s);
  for (const [r, s] of Object.entries(n)) o(t.querySelector("#spice-" + r), s);
}
function $n(t) {
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
var je = {};
const Xn = {}, qn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Xn
}, Symbol.toStringTag, { value: "Module" })), zn = /* @__PURE__ */ $n(qn);
var ft;
function Yn() {
  return ft || (ft = 1, (function(t) {
    (function(e) {
      e.parser = function(l, i) {
        return new o(l, i);
      }, e.SAXParser = o, e.SAXStream = m, e.createStream = h, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function o(l, i) {
        if (!(this instanceof o))
          return new o(l, i);
        var A = this;
        s(A), A.q = A.c = "", A.bufferCheckPosition = e.MAX_BUFFER_LENGTH, A.encoding = null, A.opt = i || {}, A.opt.lowercase = A.opt.lowercase || A.opt.lowercasetags, A.looseCase = A.opt.lowercase ? "toLowerCase" : "toUpperCase", A.opt.maxEntityCount = A.opt.maxEntityCount || 512, A.opt.maxEntityDepth = A.opt.maxEntityDepth || 4, A.entityCount = A.entityDepth = 0, A.tags = [], A.closed = A.closedRoot = A.sawRoot = !1, A.tag = A.error = null, A.strict = !!l, A.noscript = !!(l || A.opt.noscript), A.state = p.BEGIN, A.strictEntities = A.opt.strictEntities, A.ENTITIES = A.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), A.attribList = [], A.opt.xmlns && (A.ns = Object.create(I)), A.opt.unquotedAttributeValues === void 0 && (A.opt.unquotedAttributeValues = !l), A.trackPosition = A.opt.position !== !1, A.trackPosition && (A.position = A.line = A.column = 0), X(A, "onready");
      }
      Object.create || (Object.create = function(l) {
        function i() {
        }
        i.prototype = l;
        var A = new i();
        return A;
      }), Object.keys || (Object.keys = function(l) {
        var i = [];
        for (var A in l) l.hasOwnProperty(A) && i.push(A);
        return i;
      });
      function r(l) {
        for (var i = Math.max(e.MAX_BUFFER_LENGTH, 10), A = 0, v = 0, U = n.length; v < U; v++) {
          var K = l[n[v]].length;
          if (K > i)
            switch (n[v]) {
              case "textNode":
                V(l);
                break;
              case "cdata":
                P(l, "oncdata", l.cdata), l.cdata = "";
                break;
              case "script":
                P(l, "onscript", l.script), l.script = "";
                break;
              default:
                Y(l, "Max buffer length exceeded: " + n[v]);
            }
          A = Math.max(A, K);
        }
        var ee = e.MAX_BUFFER_LENGTH - A;
        l.bufferCheckPosition = ee + l.position;
      }
      function s(l) {
        for (var i = 0, A = n.length; i < A; i++)
          l[n[i]] = "";
      }
      function c(l) {
        V(l), l.cdata !== "" && (P(l, "oncdata", l.cdata), l.cdata = ""), l.script !== "" && (P(l, "onscript", l.script), l.script = "");
      }
      o.prototype = {
        end: function() {
          H(this);
        },
        write: be,
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
        a = zn.Stream;
      } catch {
        a = function() {
        };
      }
      a || (a = function() {
      });
      var f = e.EVENTS.filter(function(l) {
        return l !== "error" && l !== "end";
      });
      function h(l, i) {
        return new m(l, i);
      }
      function u(l, i) {
        if (l.length >= 2) {
          if (l[0] === 255 && l[1] === 254)
            return "utf-16le";
          if (l[0] === 254 && l[1] === 255)
            return "utf-16be";
        }
        return l.length >= 3 && l[0] === 239 && l[1] === 187 && l[2] === 191 ? "utf8" : l.length >= 4 ? l[0] === 60 && l[1] === 0 && l[2] === 63 && l[3] === 0 ? "utf-16le" : l[0] === 0 && l[1] === 60 && l[2] === 0 && l[3] === 63 ? "utf-16be" : "utf8" : i ? "utf8" : null;
      }
      function m(l, i) {
        if (!(this instanceof m))
          return new m(l, i);
        a.apply(this), this._parser = new o(l, i), this.writable = !0, this.readable = !0;
        var A = this;
        this._parser.onend = function() {
          A.emit("end");
        }, this._parser.onerror = function(v) {
          A.emit("error", v), A._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, f.forEach(function(v) {
          Object.defineProperty(A, "on" + v, {
            get: function() {
              return A._parser["on" + v];
            },
            set: function(U) {
              if (!U)
                return A.removeAllListeners(v), A._parser["on" + v] = U, U;
              A.on(v, U);
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
      }), m.prototype._decodeBuffer = function(l, i) {
        if (this._decoderBuffer && (l = Buffer.concat([this._decoderBuffer, l]), this._decoderBuffer = null), !this._decoder) {
          var A = u(l, i);
          if (!A)
            return this._decoderBuffer = l, "";
          this._parser.encoding = A, this._decoder = new TextDecoder(A);
        }
        return this._decoder.decode(l, { stream: !i });
      }, m.prototype.write = function(l) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(l))
          l = this._decodeBuffer(l, !1);
        else if (this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        }
        return this._parser.write(l.toString()), this.emit("data", l), !0;
      }, m.prototype.end = function(l) {
        if (l && l.length && this.write(l), this._decoderBuffer) {
          var i = this._decodeBuffer(Buffer.alloc(0), !0);
          i && (this._parser.write(i), this.emit("data", i));
        } else if (this._decoder) {
          var A = this._decoder.decode();
          A && (this._parser.write(A), this.emit("data", A));
        }
        return this._parser.end(), !0;
      }, m.prototype.on = function(l, i) {
        var A = this;
        return !A._parser["on" + l] && f.indexOf(l) !== -1 && (A._parser["on" + l] = function() {
          var v = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          v.splice(0, 0, l), A.emit.apply(A, v);
        }), a.prototype.on.call(A, l, i);
      };
      var d = /^\[CDATA\[$/i, y = /^DOCTYPE$/i, E = "http://www.w3.org/XML/1998/namespace", w = "http://www.w3.org/2000/xmlns/", I = { xml: E, xmlns: w }, _ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, b = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function M(l) {
        return l === " " || l === `
` || l === "\r" || l === "	";
      }
      function C(l) {
        return l === '"' || l === "'";
      }
      function R(l) {
        return l === ">" || M(l);
      }
      function B(l, i) {
        return l.test(i);
      }
      function g(l, i) {
        return !B(l, i);
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
        var i = e.ENTITIES[l], A = typeof i == "number" ? String.fromCharCode(i) : i;
        e.ENTITIES[l] = A;
      });
      for (var D in e.STATE)
        e.STATE[e.STATE[D]] = D;
      p = e.STATE;
      function X(l, i, A) {
        l[i] && l[i](A);
      }
      function W(l) {
        var i = l && l.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return i ? i[2] : null;
      }
      function Z(l) {
        return l ? l.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function k(l, i) {
        const A = Z(l), v = Z(i);
        return !A || !v ? !0 : v === "utf16" ? A === "utf16le" || A === "utf16be" : A === v;
      }
      function x(l, i) {
        if (!(!l.strict || !l.encoding || !i || i.name !== "xml")) {
          var A = W(i.body);
          A && !k(l.encoding, A) && Q(
            l,
            "XML declaration encoding " + A + " does not match detected stream encoding " + l.encoding.toUpperCase()
          );
        }
      }
      function P(l, i, A) {
        l.textNode && V(l), X(l, i, A);
      }
      function V(l) {
        l.textNode = F(l.opt, l.textNode), l.textNode && X(l, "ontext", l.textNode), l.textNode = "";
      }
      function F(l, i) {
        return l.trim && (i = i.trim()), l.normalize && (i = i.replace(/\s+/g, " ")), i;
      }
      function Y(l, i) {
        return V(l), l.trackPosition && (i += `
Line: ` + l.line + `
Column: ` + l.column + `
Char: ` + l.c), i = new Error(i), l.error = i, X(l, "onerror", i), l;
      }
      function H(l) {
        return l.sawRoot && !l.closedRoot && Q(l, "Unclosed root tag"), l.state !== p.BEGIN && l.state !== p.BEGIN_WHITESPACE && l.state !== p.TEXT && Y(l, "Unexpected end"), V(l), l.c = "", l.closed = !0, X(l, "onend"), o.call(l, l.strict, l.opt), l;
      }
      function Q(l, i) {
        if (typeof l != "object" || !(l instanceof o))
          throw new Error("bad call to strictFail");
        l.strict && Y(l, i);
      }
      function J(l) {
        l.strict || (l.tagName = l.tagName[l.looseCase]());
        var i = l.tags[l.tags.length - 1] || l, A = l.tag = { name: l.tagName, attributes: {} };
        l.opt.xmlns && (A.ns = i.ns), l.attribList.length = 0, P(l, "onopentagstart", A);
      }
      function te(l, i) {
        var A = l.indexOf(":"), v = A < 0 ? ["", l] : l.split(":"), U = v[0], K = v[1];
        return i && l === "xmlns" && (U = "xmlns", K = ""), { prefix: U, local: K };
      }
      function S(l) {
        if (l.strict || (l.attribName = l.attribName[l.looseCase]()), l.attribList.indexOf(l.attribName) !== -1 || l.tag.attributes.hasOwnProperty(l.attribName)) {
          l.attribName = l.attribValue = "";
          return;
        }
        if (l.opt.xmlns) {
          var i = te(l.attribName, !0), A = i.prefix, v = i.local;
          if (A === "xmlns")
            if (v === "xml" && l.attribValue !== E)
              Q(
                l,
                "xml: prefix must be bound to " + E + `
Actual: ` + l.attribValue
              );
            else if (v === "xmlns" && l.attribValue !== w)
              Q(
                l,
                "xmlns: prefix must be bound to " + w + `
Actual: ` + l.attribValue
              );
            else {
              var U = l.tag, K = l.tags[l.tags.length - 1] || l;
              U.ns === K.ns && (U.ns = Object.create(K.ns)), U.ns[v] = l.attribValue;
            }
          l.attribList.push([l.attribName, l.attribValue]);
        } else
          l.tag.attributes[l.attribName] = l.attribValue, P(l, "onattribute", {
            name: l.attribName,
            value: l.attribValue
          });
        l.attribName = l.attribValue = "";
      }
      function L(l, i) {
        if (l.opt.xmlns) {
          var A = l.tag, v = te(l.tagName);
          A.prefix = v.prefix, A.local = v.local, A.uri = A.ns[v.prefix] || "", A.prefix && !A.uri && (Q(
            l,
            "Unbound namespace prefix: " + JSON.stringify(l.tagName)
          ), A.uri = v.prefix);
          var U = l.tags[l.tags.length - 1] || l;
          A.ns && U.ns !== A.ns && Object.keys(A.ns).forEach(function(et) {
            P(l, "onopennamespace", {
              prefix: et,
              uri: A.ns[et]
            });
          });
          for (var K = 0, ee = l.attribList.length; K < ee; K++) {
            var ie = l.attribList[K], se = ie[0], ue = ie[1], ce = te(se, !0), pe = ce.prefix, Oe = ce.local, _e = pe === "" ? "" : A.ns[pe] || "", Te = {
              name: se,
              value: ue,
              prefix: pe,
              local: Oe,
              uri: _e
            };
            pe && pe !== "xmlns" && !_e && (Q(
              l,
              "Unbound namespace prefix: " + JSON.stringify(pe)
            ), Te.uri = pe), l.tag.attributes[se] = Te, P(l, "onattribute", Te);
          }
          l.attribList.length = 0;
        }
        l.tag.isSelfClosing = !!i, l.sawRoot = !0, l.tags.push(l.tag), P(l, "onopentag", l.tag), i || (!l.noscript && l.tagName.toLowerCase() === "script" ? l.state = p.SCRIPT : l.state = p.TEXT, l.tag = null, l.tagName = ""), l.attribName = l.attribValue = "", l.attribList.length = 0;
      }
      function G(l) {
        if (!l.tagName) {
          Q(l, "Weird empty close tag."), l.textNode += "</>", l.state = p.TEXT;
          return;
        }
        if (l.script) {
          if (l.tagName !== "script") {
            l.script += "</" + l.tagName + ">", l.tagName = "", l.state = p.SCRIPT;
            return;
          }
          P(l, "onscript", l.script), l.script = "";
        }
        var i = l.tags.length, A = l.tagName;
        l.strict || (A = A[l.looseCase]());
        for (var v = A; i--; ) {
          var U = l.tags[i];
          if (U.name !== v)
            Q(l, "Unexpected close tag");
          else
            break;
        }
        if (i < 0) {
          Q(l, "Unmatched closing tag: " + l.tagName), l.textNode += "</" + l.tagName + ">", l.state = p.TEXT;
          return;
        }
        l.tagName = A;
        for (var K = l.tags.length; K-- > i; ) {
          var ee = l.tag = l.tags.pop();
          l.tagName = l.tag.name, P(l, "onclosetag", l.tagName);
          var ie = {};
          for (var se in ee.ns)
            ie[se] = ee.ns[se];
          var ue = l.tags[l.tags.length - 1] || l;
          l.opt.xmlns && ee.ns !== ue.ns && Object.keys(ee.ns).forEach(function(ce) {
            var pe = ee.ns[ce];
            P(l, "onclosenamespace", { prefix: ce, uri: pe });
          });
        }
        i === 0 && (l.closedRoot = !0), l.tagName = l.attribValue = l.attribName = "", l.attribList.length = 0, l.state = p.TEXT;
      }
      function $(l) {
        var i = l.entity, A = i.toLowerCase(), v, U = "";
        return l.ENTITIES[i] ? l.ENTITIES[i] : l.ENTITIES[A] ? l.ENTITIES[A] : (i = A, i.charAt(0) === "#" && (i.charAt(1) === "x" ? (i = i.slice(2), v = parseInt(i, 16), U = v.toString(16)) : (i = i.slice(1), v = parseInt(i, 10), U = v.toString(10))), i = i.replace(/^0+/, ""), isNaN(v) || U.toLowerCase() !== i || v < 0 || v > 1114111 || !z(v) ? (Q(l, "Invalid character entity"), "&" + l.entity + ";") : String.fromCodePoint(v));
      }
      function z(l) {
        return l === 9 || l === 10 || l === 13 || l >= 32 && l <= 55295 || l >= 57344 && l <= 65533 || l >= 65536 && l <= 1114111;
      }
      function q(l, i) {
        i === "<" ? (l.state = p.OPEN_WAKA, l.startTagPosition = l.position) : M(i) || (Q(l, "Non-whitespace before first tag."), l.textNode = i, l.state = p.TEXT);
      }
      function he(l, i) {
        var A = "";
        return i < l.length && (A = l.charAt(i)), A;
      }
      function be(l) {
        var i = this;
        if (this.error)
          throw this.error;
        if (i.closed)
          return Y(
            i,
            "Cannot write after close. Assign an onready handler."
          );
        if (l === null)
          return H(i);
        typeof l == "object" && (l = l.toString());
        for (var A = 0, v = ""; v = he(l, A++), i.c = v, !!v; )
          switch (i.trackPosition && (i.position++, v === `
` ? (i.line++, i.column = 0) : i.column++), i.state) {
            case p.BEGIN:
              if (i.state = p.BEGIN_WHITESPACE, v === "\uFEFF")
                continue;
              q(i, v);
              continue;
            case p.BEGIN_WHITESPACE:
              q(i, v);
              continue;
            case p.TEXT:
              if (i.sawRoot && !i.closedRoot) {
                for (var K = A - 1; v && v !== "<" && v !== "&"; )
                  v = he(l, A++), v && i.trackPosition && (i.position++, v === `
` ? (i.line++, i.column = 0) : i.column++);
                i.textNode += l.substring(K, A - 1);
              }
              v === "<" && !(i.sawRoot && i.closedRoot && !i.strict) ? (i.state = p.OPEN_WAKA, i.startTagPosition = i.position) : (!M(v) && (!i.sawRoot || i.closedRoot) && Q(i, "Text data outside of root node."), v === "&" ? i.state = p.TEXT_ENTITY : i.textNode += v);
              continue;
            case p.SCRIPT:
              v === "<" ? i.state = p.SCRIPT_ENDING : i.script += v;
              continue;
            case p.SCRIPT_ENDING:
              v === "/" ? i.state = p.CLOSE_TAG : (i.script += "<" + v, i.state = p.SCRIPT);
              continue;
            case p.OPEN_WAKA:
              if (v === "!")
                i.state = p.SGML_DECL, i.sgmlDecl = "";
              else if (!M(v)) if (B(_, v))
                i.state = p.OPEN_TAG, i.tagName = v;
              else if (v === "/")
                i.state = p.CLOSE_TAG, i.tagName = "";
              else if (v === "?")
                i.state = p.PROC_INST, i.procInstName = i.procInstBody = "";
              else {
                if (Q(i, "Unencoded <"), i.startTagPosition + 1 < i.position) {
                  var U = i.position - i.startTagPosition;
                  v = new Array(U).join(" ") + v;
                }
                i.textNode += "<" + v, i.state = p.TEXT;
              }
              continue;
            case p.SGML_DECL:
              if (i.sgmlDecl + v === "--") {
                i.state = p.COMMENT, i.comment = "", i.sgmlDecl = "";
                continue;
              }
              i.doctype && i.doctype !== !0 && i.sgmlDecl ? (i.state = p.DOCTYPE_DTD, i.doctype += "<!" + i.sgmlDecl + v, i.sgmlDecl = "") : d.test(i.sgmlDecl + v) ? (P(i, "onopencdata"), i.state = p.CDATA, i.sgmlDecl = "", i.cdata = "") : y.test(i.sgmlDecl + v) ? (i.state = p.DOCTYPE, (i.doctype || i.sawRoot) && Q(
                i,
                "Inappropriately located doctype declaration"
              ), i.doctype = "", i.sgmlDecl = "") : v === ">" ? (P(i, "onsgmldeclaration", i.sgmlDecl), i.sgmlDecl = "", i.state = p.TEXT) : (C(v) && (i.state = p.SGML_DECL_QUOTED), i.sgmlDecl += v);
              continue;
            case p.SGML_DECL_QUOTED:
              v === i.q && (i.state = p.SGML_DECL, i.q = ""), i.sgmlDecl += v;
              continue;
            case p.DOCTYPE:
              v === ">" ? (i.state = p.TEXT, P(i, "ondoctype", i.doctype), i.doctype = !0) : (i.doctype += v, v === "[" ? i.state = p.DOCTYPE_DTD : C(v) && (i.state = p.DOCTYPE_QUOTED, i.q = v));
              continue;
            case p.DOCTYPE_QUOTED:
              i.doctype += v, v === i.q && (i.q = "", i.state = p.DOCTYPE);
              continue;
            case p.DOCTYPE_DTD:
              v === "]" ? (i.doctype += v, i.state = p.DOCTYPE) : v === "<" ? (i.state = p.OPEN_WAKA, i.startTagPosition = i.position) : C(v) ? (i.doctype += v, i.state = p.DOCTYPE_DTD_QUOTED, i.q = v) : i.doctype += v;
              continue;
            case p.DOCTYPE_DTD_QUOTED:
              i.doctype += v, v === i.q && (i.state = p.DOCTYPE_DTD, i.q = "");
              continue;
            case p.COMMENT:
              v === "-" ? i.state = p.COMMENT_ENDING : i.comment += v;
              continue;
            case p.COMMENT_ENDING:
              v === "-" ? (i.state = p.COMMENT_ENDED, i.comment = F(i.opt, i.comment), i.comment && P(i, "oncomment", i.comment), i.comment = "") : (i.comment += "-" + v, i.state = p.COMMENT);
              continue;
            case p.COMMENT_ENDED:
              v !== ">" ? (Q(i, "Malformed comment"), i.comment += "--" + v, i.state = p.COMMENT) : i.doctype && i.doctype !== !0 ? i.state = p.DOCTYPE_DTD : i.state = p.TEXT;
              continue;
            case p.CDATA:
              for (var K = A - 1; v && v !== "]"; )
                v = he(l, A++), v && i.trackPosition && (i.position++, v === `
` ? (i.line++, i.column = 0) : i.column++);
              i.cdata += l.substring(K, A - 1), v === "]" && (i.state = p.CDATA_ENDING);
              continue;
            case p.CDATA_ENDING:
              v === "]" ? i.state = p.CDATA_ENDING_2 : (i.cdata += "]" + v, i.state = p.CDATA);
              continue;
            case p.CDATA_ENDING_2:
              v === ">" ? (i.cdata && P(i, "oncdata", i.cdata), P(i, "onclosecdata"), i.cdata = "", i.state = p.TEXT) : v === "]" ? i.cdata += "]" : (i.cdata += "]]" + v, i.state = p.CDATA);
              continue;
            case p.PROC_INST:
              v === "?" ? i.state = p.PROC_INST_ENDING : M(v) ? i.state = p.PROC_INST_BODY : i.procInstName += v;
              continue;
            case p.PROC_INST_BODY:
              if (!i.procInstBody && M(v))
                continue;
              v === "?" ? i.state = p.PROC_INST_ENDING : i.procInstBody += v;
              continue;
            case p.PROC_INST_ENDING:
              if (v === ">") {
                const ue = {
                  name: i.procInstName,
                  body: i.procInstBody
                };
                x(i, ue), P(i, "onprocessinginstruction", ue), i.procInstName = i.procInstBody = "", i.state = p.TEXT;
              } else
                i.procInstBody += "?" + v, i.state = p.PROC_INST_BODY;
              continue;
            case p.OPEN_TAG:
              B(b, v) ? i.tagName += v : (J(i), v === ">" ? L(i) : v === "/" ? i.state = p.OPEN_TAG_SLASH : (M(v) || Q(i, "Invalid character in tag name"), i.state = p.ATTRIB));
              continue;
            case p.OPEN_TAG_SLASH:
              v === ">" ? (L(i, !0), G(i)) : (Q(
                i,
                "Forward-slash in opening tag not followed by >"
              ), i.state = p.ATTRIB);
              continue;
            case p.ATTRIB:
              if (M(v))
                continue;
              v === ">" ? L(i) : v === "/" ? i.state = p.OPEN_TAG_SLASH : B(_, v) ? (i.attribName = v, i.attribValue = "", i.state = p.ATTRIB_NAME) : Q(i, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME:
              v === "=" ? i.state = p.ATTRIB_VALUE : v === ">" ? (Q(i, "Attribute without value"), i.attribValue = i.attribName, S(i), L(i)) : M(v) ? i.state = p.ATTRIB_NAME_SAW_WHITE : B(b, v) ? i.attribName += v : Q(i, "Invalid attribute name");
              continue;
            case p.ATTRIB_NAME_SAW_WHITE:
              if (v === "=")
                i.state = p.ATTRIB_VALUE;
              else {
                if (M(v))
                  continue;
                Q(i, "Attribute without value"), i.tag.attributes[i.attribName] = "", i.attribValue = "", P(i, "onattribute", {
                  name: i.attribName,
                  value: ""
                }), i.attribName = "", v === ">" ? L(i) : B(_, v) ? (i.attribName = v, i.state = p.ATTRIB_NAME) : (Q(i, "Invalid attribute name"), i.state = p.ATTRIB);
              }
              continue;
            case p.ATTRIB_VALUE:
              if (M(v))
                continue;
              C(v) ? (i.q = v, i.state = p.ATTRIB_VALUE_QUOTED) : (i.opt.unquotedAttributeValues || Y(i, "Unquoted attribute value"), i.state = p.ATTRIB_VALUE_UNQUOTED, i.attribValue = v);
              continue;
            case p.ATTRIB_VALUE_QUOTED:
              if (v !== i.q) {
                v === "&" ? i.state = p.ATTRIB_VALUE_ENTITY_Q : i.attribValue += v;
                continue;
              }
              S(i), i.q = "", i.state = p.ATTRIB_VALUE_CLOSED;
              continue;
            case p.ATTRIB_VALUE_CLOSED:
              M(v) ? i.state = p.ATTRIB : v === ">" ? L(i) : v === "/" ? i.state = p.OPEN_TAG_SLASH : B(_, v) ? (Q(i, "No whitespace between attributes"), i.attribName = v, i.attribValue = "", i.state = p.ATTRIB_NAME) : Q(i, "Invalid attribute name");
              continue;
            case p.ATTRIB_VALUE_UNQUOTED:
              if (!R(v)) {
                v === "&" ? i.state = p.ATTRIB_VALUE_ENTITY_U : i.attribValue += v;
                continue;
              }
              S(i), v === ">" ? L(i) : i.state = p.ATTRIB;
              continue;
            case p.CLOSE_TAG:
              if (i.tagName)
                v === ">" ? G(i) : B(b, v) ? i.tagName += v : i.script ? (i.script += "</" + i.tagName + v, i.tagName = "", i.state = p.SCRIPT) : (M(v) || Q(i, "Invalid tagname in closing tag"), i.state = p.CLOSE_TAG_SAW_WHITE);
              else {
                if (M(v))
                  continue;
                g(_, v) ? i.script ? (i.script += "</" + v, i.state = p.SCRIPT) : Q(i, "Invalid tagname in closing tag.") : i.tagName = v;
              }
              continue;
            case p.CLOSE_TAG_SAW_WHITE:
              if (M(v))
                continue;
              v === ">" ? G(i) : Q(i, "Invalid characters in closing tag");
              continue;
            case p.TEXT_ENTITY:
            case p.ATTRIB_VALUE_ENTITY_Q:
            case p.ATTRIB_VALUE_ENTITY_U:
              var ee, ie;
              switch (i.state) {
                case p.TEXT_ENTITY:
                  ee = p.TEXT, ie = "textNode";
                  break;
                case p.ATTRIB_VALUE_ENTITY_Q:
                  ee = p.ATTRIB_VALUE_QUOTED, ie = "attribValue";
                  break;
                case p.ATTRIB_VALUE_ENTITY_U:
                  ee = p.ATTRIB_VALUE_UNQUOTED, ie = "attribValue";
                  break;
              }
              if (v === ";") {
                var se = $(i);
                i.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(se) ? ((i.entityCount += 1) > i.opt.maxEntityCount && Y(
                  i,
                  "Parsed entity count exceeds max entity count"
                ), (i.entityDepth += 1) > i.opt.maxEntityDepth && Y(
                  i,
                  "Parsed entity depth exceeds max entity depth"
                ), i.entity = "", i.state = ee, i.write(se), i.entityDepth -= 1) : (i[ie] += se, i.entity = "", i.state = ee);
              } else B(i.entity.length ? T : N, v) ? i.entity += v : (Q(i, "Invalid character in entity name"), i[ie] += "&" + i.entity + v, i.entity = "", i.state = ee);
              continue;
            default:
              throw new Error(i, "Unknown state: " + i.state);
          }
        return i.position >= i.bufferCheckPosition && r(i), i;
      }
      String.fromCodePoint || (function() {
        var l = String.fromCharCode, i = Math.floor, A = function() {
          var v = 16384, U = [], K, ee, ie = -1, se = arguments.length;
          if (!se)
            return "";
          for (var ue = ""; ++ie < se; ) {
            var ce = Number(arguments[ie]);
            if (!isFinite(ce) || // `NaN`, `+Infinity`, or `-Infinity`
            ce < 0 || // not a valid Unicode code point
            ce > 1114111 || // not a valid Unicode code point
            i(ce) !== ce)
              throw RangeError("Invalid code point: " + ce);
            ce <= 65535 ? U.push(ce) : (ce -= 65536, K = (ce >> 10) + 55296, ee = ce % 1024 + 56320, U.push(K, ee)), (ie + 1 === se || U.length > v) && (ue += l.apply(null, U), U.length = 0);
          }
          return ue;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: A,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = A;
      })();
    })(t);
  })(je)), je;
}
var Ve, pt;
function Kn() {
  if (pt) return Ve;
  pt = 1;
  var t = Yn().parser;
  function e(n) {
    var o = [], r = [], s = o, c;
    return c = t(!0), c.ontext = function(a) {
      a.trim() !== "" && s.push(a);
    }, c.onopentag = function(a) {
      var f;
      f = [a.name, a.attributes], r.push(s), s.push(f), s = f;
    }, c.onclosetag = function() {
      s = r.pop();
    }, c.write(n).close(), o[0];
  }
  return Ve = e, Ve;
}
var Fe, ht;
function Zn() {
  if (ht) return Fe;
  ht = 1;
  function t(e, n) {
    var o = function() {
    }, r = o, s = o;
    function c() {
      this._skip = !0;
    }
    function a() {
      this._remove = !0;
    }
    function f(m) {
      this._name = m;
    }
    function h(m) {
      this._replace = m;
    }
    function u(m, d) {
      var y, E = { attr: {}, full: m }, w = {
        name: f,
        skip: c,
        // break: breakFn,
        remove: a,
        replace: h,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, I = !0, _, b, N;
      if (m !== void 0 && m !== null && m !== !0 && m !== !1)
        switch (y = Object.prototype.toString.call(m), y) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (m.some(function(T, M) {
              if (M === 0)
                return E.name = T, !1;
              if (M === 1)
                return Object.prototype.toString.call(T) === "[object Object]" && (I = !1, E.attr = T), !0;
            }), r.call(w, E, d), w._name && (m[0] = w._name), w._replace)
              return w._replace;
            if (w._remove)
              return null;
            if (!w._skip) {
              for (_ = 0, b = m.length; _ < b; ) {
                if (_ > 1 || _ === 1 && I) {
                  if (N = u(m[_], E), N === null) {
                    m.splice(_, 1), b -= 1;
                    continue;
                  }
                  N && (m[_] = N);
                }
                _ += 1;
              }
              if (s.call(w, E, d), w._name && (m[0] = w._name), w._replace)
                return w._replace;
              if (w._remove)
                return null;
            }
        }
    }
    n && (n.enter && (r = n.enter), n.leave && (s = n.leave)), u(e, void 0);
  }
  return Fe = t, Fe;
}
var Ge, mt;
function Jn() {
  if (mt) return Ge;
  mt = 1;
  const t = Kn(), e = Zn(), n = (r) => String(r).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[s]);
  function o(r) {
    const [s, ...c] = r, a = c[0] && typeof c[0] == "object" && !Array.isArray(c[0]) ? c.shift() : {}, f = "<" + s + Object.entries(a).map(([h, u]) => " " + h + '="' + n(u) + '"').join("");
    return c.length ? f + ">" + c.map((h) => Array.isArray(h) ? o(h) : n(h)).join("") + "</" + s + ">" : f + "/>";
  }
  return Ge = { parse: t, p: t, traverse: e, t: e, stringify: o, s: o }, Ge;
}
Jn();
const He = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), er = (t, e) => [...t].reduce((n, o) => n + (o.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function tr(t, e, n = 12) {
  const o = [], r = t.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h }));
  for (const [c, a] of t.entries()) {
    if (!a.labels.length) continue;
    const f = Math.max(...a.labels.map((E) => er(E.text, n))) + 4, h = a.labels.length * (n + 4), u = [];
    for (const E of [5, 14, 28, 48]) {
      const w = { x: a.x + (a.w - f) / 2, y: a.y - E - h, w: f, h }, I = { x: a.x + (a.w - f) / 2, y: a.y + a.h + E, w: f, h }, _ = { x: a.x + a.w + E, y: a.y + (a.h - h) / 2, w: f, h }, b = { x: a.x - E - f, y: a.y + (a.h - h) / 2, w: f, h };
      u.push(...a.w > a.h ? [w, I, _, b] : [_, b, w, I]);
    }
    const m = (E) => e.reduce((w, I) => {
      const _ = Math.min(I.a.x, I.b.x), b = Math.min(I.a.y, I.b.y), N = { x: _ - 1, y: b - 1, w: Math.abs(I.a.x - I.b.x) + 2, h: Math.abs(I.a.y - I.b.y) + 2 };
      return w + He(E, N) * 2;
    }, 0);
    let d = null, y = 1 / 0;
    for (const [E, w] of u.entries()) {
      const I = r.reduce((_, b, N) => _ + (N === c ? 0 : He(w, b)) * 500, 0) + o.reduce((_, b) => _ + He(w, b) * 100, 0) + m(w) + E * 3;
      I < y && (y = I, d = w);
    }
    a.labels.forEach((E, w) => {
      E.x = d.x - a.x, E.y = d.y - a.y + n + w * (n + 4);
    }), o.push(d);
  }
  const s = [...r, ...o];
  return { x: Math.min(0, ...s.map((c) => c.x)), y: Math.min(0, ...s.map((c) => c.y)), right: Math.max(0, ...s.map((c) => c.x + c.w)), bottom: Math.max(0, ...s.map((c) => c.y + c.h)) };
}
const nr = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function rr(t, e = 12) {
  const n = [...t.children].filter((s) => s.localName === "g" && s.id.startsWith("cell_")).map((s) => ({ ...nr(s.getAttribute("transform")), w: +s.getAttribute("s:width"), h: +s.getAttribute("s:height"), labels: [...s.children].filter((c) => c.localName === "text" && c.hasAttribute("data-layout-label")).map((c) => ({ node: c, text: c.textContent })) })), o = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } })), r = tr(n, o, e);
  for (const s of n) for (const c of s.labels)
    c.node.setAttribute("x", c.x), c.node.setAttribute("y", c.y), c.node.setAttribute("text-anchor", "start"), c.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(r), r;
}
const gt = Le.filter.source, j = (t) => document.getElementById("spice-" + t), ye = j("app");
if (ye) {
  let p = function() {
    const S = e.querySelector("svg");
    if (!S) return;
    const L = Number(S.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, G = rr(S, L), $ = Math.min(N.x, G.x - 20), z = Math.min(N.y, G.y - 20);
    N = { x: $, y: z, w: Math.max(N.x + N.w, G.right + 20) - $, h: Math.max(N.y + N.h, G.bottom + 20) - z }, f && vn(S, h, f), a?.refreshColors(), Qe(S, g(), j("show-grid").checked, b);
    const q = S.cloneNode(!0);
    a?.cleanExport(q), q.setAttribute("width", N.w), q.setAttribute("height", N.h), q.setAttribute("viewBox", `${N.x} ${N.y} ${N.w} ${N.h}`), Qe(q, g(), j("show-grid").checked, N), u = new XMLSerializer().serializeToString(q), j("source").value = u;
  }, W = function(S) {
    const L = j("example-info");
    if (L && (L.replaceChildren(), !!S && (L.append(document.createTextNode(S.description + " ")), S.url))) {
      const G = document.createElement("a");
      G.href = S.url, G.target = "_blank", G.rel = "noopener noreferrer", G.textContent = S.reference, L.append(G);
    }
  }, Z = function() {
    a.invalidate(), D.setEnabled(!1), r = null, s = null, u = "", R(), W(Object.values(Le).find((S) => S.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, k = function(S) {
    o.replaceChildren();
    for (const { severity: L, line: G, message: $, source: z } of S) {
      const q = document.createElement("li");
      q.className = L, q.textContent = `${L.toUpperCase()}${z && z !== "input.cir" ? " · " + z : ""}${G ? " · line " + G : ""}: ${$}`, o.append(q);
    }
    j("messages").open = S.some((L) => L.severity !== "info"), j("message-count").textContent = `${S.length} message${S.length === 1 ? "" : "s"}`;
  }, x = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    const S = e.querySelector("svg");
    S && Qe(S, g(), j("show-grid").checked, b), j("zoom-level").textContent = Math.round(N.w / b.w * 100) + "%";
  }, P = function(S, L = b.x + b.w / 2, G = b.y + b.h / 2) {
    if (!e.querySelector("svg")) return;
    const $ = Math.max(0.05, Math.min(10, b.w * S / N.w)) * N.w / b.w;
    b = { x: L + (b.x - L) * $, y: G + (b.y - G) * $, w: b.w * $, h: b.h * $ }, x();
  }, F = function(S) {
    const L = new URLSearchParams();
    S && L.set("instance", S);
    const G = L.toString();
    location.hash.slice(1) === G ? (w = S, J()) : location.hash = G;
  }, Y = function() {
    w = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, H = function() {
    const S = !!(I && I !== w && d?.contexts[I]);
    j("selection-actions").hidden = !S, j("open-instance").href = "#" + new URLSearchParams({ instance: I });
  }, Q = function() {
    j("breadcrumbs").replaceChildren();
    const S = (G, $) => {
      const z = document.createElement("button");
      z.type = "button", z.textContent = G, z.onclick = () => F($), z.disabled = $ === w, j("breadcrumbs").append(z);
    };
    if (S("Top", ""), w) {
      const G = d.contexts[w].path;
      for (let $ = 0; $ < G.length; $++) S(G[$], G.slice(0, $ + 1).map(encodeURIComponent).join("/"));
    }
    j("instances").replaceChildren();
    const L = (G, $) => {
      for (const z of G.children) {
        const q = document.createElement("div");
        q.className = "spice-instance-row", q.style.setProperty("--depth", Math.min($, 8)), q.dataset.instance = z.id;
        const he = document.createElement("a");
        he.href = "#" + new URLSearchParams({ instance: z.id }), he.textContent = z.name + " · " + z.definition, he.title = "Open " + z.id + " as its own sheet";
        const be = document.createElement("span");
        if (be.className = "spice-help", be.textContent = Object.entries(z.params).map(([l, i]) => l + "=" + i).join(" · "), q.append(he), be.textContent) {
          const l = document.createElement("details"), i = document.createElement("summary");
          i.textContent = "Parameters", l.append(i, be), q.append(l);
        }
        j("instances").append(q), L(z, $ + 1);
      }
    };
    L(d.contexts[w], 0), j("hierarchy-panel").hidden = !d.contexts[w].children.length, j("focus-title").textContent = w ? w + " / " + d.contexts[w].definition : "Top-level schematic", H();
  };
  Wn(ye), In(ye);
  const t = j("input"), e = j("preview"), n = j("status"), o = j("diagnostics");
  let r = null, s = null, c = !1, a = null, f = null, h = [], u = "", m, d, y, E = "", w = "", I = "", _ = !1, b = { x: 0, y: 0, w: 1, h: 1 }, N = { ...b }, T, M = !1, C = {};
  try {
    C = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  ye.addEventListener("click", (S) => {
    _ && S.target.closest('a[href^="#"]') && S.preventDefault();
  });
  const R = () => {
    j("copy").disabled = j("download").disabled = !u || _ || a?.working(), j("download-asc").disabled = j("download-asc-bundle").disabled = !u || !r || _ || c || !a?.complete();
  }, B = () => ({ font: j("font").value, fontSize: Number(j("size").value), color: Je, gridSize: j("grid").checked && j("conventional").checked ? ze : 0, detailed: j("detailed").checked, conventional: j("conventional").checked }), g = () => m?.layout.report?.gridSize ? Number(j("grid-size").value) : 0, D = Cn(j, (S, L) => {
    f = S, h = L, p();
  });
  a = Rn(e, j, { getNetColor: (S) => {
    const L = h.find((G) => G.bit === S);
    return L && f && (f.auto || f.manual.has(L.name)) ? f.color(L.name) : null;
  }, inspect: (S) => {
    const L = m?.components.find((G) => G.name === S);
    L && (I = L.instanceId || "", j("selection").textContent = L.raw, H());
  }, changed: (S, L, G) => {
    r = S, s = null, N = G;
    const $ = e.querySelector("svg");
    if ($) {
      $.setAttribute("width", String(N.w)), $.setAttribute("height", String(N.h));
      const z = $.querySelector("#spice-layout-report");
      if (z) {
        const q = JSON.parse(z.textContent);
        q.manualWiring = L, q.verifiedTerminals = !L.unrouted, q.geometricConnectivityVerified = !L.unrouted, z.textContent = JSON.stringify(q);
      }
    }
    m && y && (j("json").value = JSON.stringify({ circuit: m, netlist: ct(m), hierarchy: y, interactive: { ...L, drawing: S } }, null, 2)), p(), R();
  } }), j("show-grid").onchange = p, j("grid-size").onchange = () => {
    p(), x();
  };
  async function X() {
    (!r || !m?.layout.report?.gridVerified) && (j("grid").checked = !0, j("conventional").checked = !0, await J({ resetEditor: !0 })), a.setEnabled(j("interactive").checked), R();
  }
  j("interactive").onchange = X, j("flywire").onchange = async () => {
    j("interactive").checked = !0, await X(), j("flywire").checked ? a.clear() : await a.autoRoute(), R();
  }, j("auto-route").onclick = async () => {
    j("interactive").checked = !0, await X(), await a.autoRoute(), R();
  }, j("wire-undo").onclick = () => a.undo(), j("wire-redo").onclick = () => a.redo();
  for (const S of ye.querySelectorAll("[data-editor-mode]")) S.onclick = async () => {
    j("interactive").checked = !0, await X(), a.chooseTool(S.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  D.setEnabled(!1), t.value = gt;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || gt;
  } catch {
  }
  W(Object.values(Le).find((S) => S.source === t.value)), t.addEventListener("input", Z);
  for (const S of ["font", "size", "detailed", "conventional", "grid"]) j(S).addEventListener("input", Z);
  j("zoom-in").onclick = () => P(0.8), j("zoom-out").onclick = () => P(1.25), j("fit").onclick = () => {
    b = { ...N }, x();
  };
  const V = (S) => {
    const L = e.querySelector("svg");
    return L ? new DOMPoint(S.clientX, S.clientY).matrixTransform(L.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (S) => {
    const L = V(S);
    L && (S.preventDefault(), P(S.deltaY > 0 ? 1.12 : 1 / 1.12, L.x, L.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (S) => {
    ![0, 1].includes(S.button) || !e.querySelector("svg") || (T = { start: V(S), x: S.clientX, y: S.clientY, view: { ...b }, moved: !1 }, e.setPointerCapture(S.pointerId));
  }), e.addEventListener("pointermove", (S) => {
    if (!T) return;
    const L = V(S);
    Math.hypot(S.clientX - T.x, S.clientY - T.y) > 4 && (T.moved = !0), b.x += T.start.x - L.x, b.y += T.start.y - L.y, x();
  }), e.addEventListener("pointerup", (S) => {
    if (!T) return;
    const L = T.moved;
    if (T = null, e.hasPointerCapture(S.pointerId) && e.releasePointerCapture(S.pointerId), !L) {
      const G = document.elementFromPoint(S.clientX, S.clientY)?.closest("[data-component]"), $ = m?.components.find((z) => z.name === G?.dataset.component);
      $ && (I = $.instanceId || "", j("selection").textContent = `${$.raw}
${Object.entries($.terminals).map(([z, q]) => `${z} → ${q}`).join("   ")}`, $.kind === "X" ? F($.instanceId) : H());
    }
  }), window.addEventListener("hashchange", () => {
    if (_) {
      M = !0;
      return;
    }
    Y(), I = "", J();
  }), e.addEventListener("pointercancel", () => {
    T = null;
  }), e.addEventListener("keydown", (S) => {
    const L = S.target.closest("[data-instance]");
    if (L && (S.key === "Enter" || S.key === " ")) {
      S.preventDefault(), I = L.dataset.instance, F(I);
      return;
    }
    S.key === "+" || S.key === "=" ? P(0.8) : S.key === "-" ? P(1.25) : S.key.toLowerCase() === "f" ? (b = { ...N }, x()) : S.key.startsWith("Arrow") && (S.preventDefault(), b.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[S.key] || 0) * b.w, b.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[S.key] || 0) * b.h, x());
  });
  async function J({ resetEditor: S = !1 } = {}) {
    if (_) return;
    _ = !0, a.invalidate(), D.setEnabled(!1), r = null, s = null, u = "", R(), j("generate").disabled = !0, t.readOnly = !0, j("file").disabled = !0, j("libraries").disabled = !0;
    for (const G of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) G.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let L = [];
    try {
      if (E !== t.value || !d) {
        if (y = Ht(t.value, { files: C }), L = [...y.diagnostics], L.some((U) => U.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = Ye(y), E && E !== t.value ? (w = "", I = "", history.replaceState(null, "", location.pathname + location.search)) : Y(), E = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (L = [...y.diagnostics], k(L), L.some((U) => U.severity === "error")) throw Error("Fix the parser errors below before generating.");
      m = dn(d, { focus: w });
      for (const U of m.interfaceAliases) L.push({ severity: "info", message: `Instance boundary: ${U.ports.join(" = ")} share parent node ${U.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const G = ct(m);
      B().conventional && L.push(...m.layout.diagnostics);
      const $ = await hn(G, B()), z = new DOMParser().parseFromString($.svg, "image/svg+xml");
      if (z.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const q = z.documentElement, he = q.querySelector("#spice-layout-report");
      if (he) {
        m.layout.report = JSON.parse(he.textContent);
        const U = m.layout.report;
        if (L.push({ severity: "info", message: `Layout: compact signal flow; ${U.powerSourcesChecked} DC/ground symbols checked, ${U.powerOrderViolations} DC order preference(s) unmet. ${U.powerPass}. ${U.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), U.classicTemplateFallback && L.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), U.groundPlacement && L.push({ severity: "info", message: `Ground: ${U.groundPlacement}; ${U.straightenedGroundDrops || 0} return-path simplification(s).` }), U.explicitGroups && L.push({ severity: "info", message: `Layout comments: ${U.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), U.classicRails && L.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${U.railCount} shared voltage rails.` }), U.localClassicInstances?.length && L.push({ severity: "info", message: `${U.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), U.localClassicStages?.length && L.push({ severity: "info", message: `Classic transistor proximity active: ${U.localClassicStages.join(", ")}.` }), U.sharedClassicRails && L.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), U.mirroredTransistors?.length && L.push({ severity: "info", message: `Control-pin mirror choices: ${U.mirroredTransistors.join(", ")}.` }), U.recognizedMotifs?.length && L.push({ severity: "info", message: `Transistor structures: ${U.recognizedMotifs.map((K) => `${K.kind} (${K.members.join(", ")}; ${K.confidence})`).join("; ")}.` }), U.appliedMotifs?.length && L.push({ severity: "info", message: `Topology preferences applied to ${U.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), U.subnetFirstFallback && L.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + U.subnetFirstFallback }), U.pairCompactionFallback && L.push({ severity: "warning", message: "Pair proximity kept the original regions: " + U.pairCompactionFallback }), U.compoundPairFallback && L.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + U.compoundPairFallback }), U.pairConstraints?.length) {
          const K = U.pairConstraints.filter((ee) => ee.crossRegion && !ee.compacted).length;
          L.push({ severity: "info", message: `${U.pairConstraints.length - K} adjacent transistor pair(s); ${K} cross-region mirror row constraint(s).` });
        }
        U.netShortcuts && L.push({ severity: "info", message: `${U.netShortcuts} safe straight net shortcut(s); ${U.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), U.sharedRailFallback && L.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${U.sharedRailFallback}.` });
        for (const K of U.localClassicFallbacks || []) K.stage && L.push({ severity: "info", message: `Classic stage ${K.stage} uses automatic layout: ${K.reason || "No unobstructed local template"}.` });
        U.geometricConnectivityVerified && L.push({ severity: "info", message: `Net geometry verified; ${U.cyclesRemoved} same-net loop(s) and ${U.leavesRemoved} unused wire branch(es) removed.` }), k(L);
      }
      if (q.localName !== "svg" || q.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const be = Number(q.getAttribute("width")), l = Number(q.getAttribute("height")), i = JSON.parse(q.getAttribute("data-label-bounds") || "null");
      N = { x: Math.min(-20, (i?.x ?? 0) - 20), y: Math.min(-20, (i?.y ?? 0) - 20) }, N.w = Math.max(be, i?.right || 0) + 20 - N.x, N.h = Math.max(l, i?.bottom || 0) + 20 - N.y, b = { ...N }, q.setAttribute("viewBox", `${N.x} ${N.y} ${N.w} ${N.h}`), q.setAttribute("width", String(N.w)), q.setAttribute("height", String(N.h)), q.setAttribute("role", "img"), q.setAttribute("aria-label", m.title || "SPICE schematic"), q.setAttribute("style", "background:white");
      for (const U of m.components) {
        const K = z.getElementById("cell_" + U.name);
        if (!K) throw Error("Renderer omitted component " + U.name);
        K.setAttribute("data-component", U.name), U.kind === "X" && (K.setAttribute("data-instance", U.instanceId), K.setAttribute("role", "button"), K.setAttribute("tabindex", "0"), K.setAttribute("aria-label", "Open " + U.name));
        const ee = z.createElementNS(q.namespaceURI, "title");
        ee.textContent = U.raw + `
Resolved: ` + U.value + `
` + Object.entries(U.terminals).map(([ie, se]) => ie + ": " + se).join(", "), K.prepend(ee);
      }
      for (const U of Object.values(m.nodes))
        for (const K of q.querySelectorAll(".net_" + U.bit)) {
          K.setAttribute("data-net", U.name);
          const ee = z.createElementNS(q.namespaceURI, "title");
          ee.textContent = "Node " + U.displayName, K.append(ee);
        }
      const A = m.components.filter((U) => U.kind === "K").map((U) => ({ name: U.name, inductors: U.coupledInductors, value: U.value }));
      if (A.length) {
        const U = z.createElementNS(q.namespaceURI, "metadata");
        U.setAttribute("id", "spice-magnetic-couplings"), U.textContent = JSON.stringify(A), q.append(U);
        for (const K of A) for (const ee of K.inductors) {
          const ie = z.getElementById("cell_" + ee);
          if (!ie) continue;
          const se = z.createElementNS(q.namespaceURI, "circle"), ue = [...ie.children].find((_e) => _e.getAttribute("s:pid") === "A"), ce = ue?.getAttribute("s:position"), pe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[ce] || [0, 0];
          for (const [_e, Te] of Object.entries({ cx: Number(ue?.getAttribute("s:x")) + pe[0], cy: Number(ue?.getAttribute("s:y")) + pe[1], r: 3, fill: B().color, stroke: "none", "data-coupling": K.name })) se.setAttribute(_e, String(Te));
          const Oe = z.createElementNS(q.namespaceURI, "title");
          Oe.textContent = K.name + " · dotted terminal: " + K.inductors.join(", "), se.append(Oe), ie.append(se);
        }
      }
      r = $.drawing, u = new XMLSerializer().serializeToString(q), j("source").value = u, e.replaceChildren(document.importNode(q, !0)), x();
      const v = L.filter((U) => U.severity === "warning").length;
      n.textContent = `${m.components.filter((U) => !U.synthetic).length} components · ${Object.keys(m.nodes).length} nodes · ${m.topology.leafCount} primitive devices verified${m.interfaceAliases.length ? " · Parent-connected ports: " + m.interfaceAliases.map((U) => U.ports.join(" = ")).join("; ") + "." : ""}${v ? " · Review " + v + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Xe}.`, m.layout.report?.gridVerified && (n.textContent += ` Grid ${m.layout.report.gridSize}.`), m.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${m.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), m.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), j("json").value = JSON.stringify({ circuit: m, netlist: G, hierarchy: y }, null, 2), D.setCircuit(m, t.value), a.mount(e.querySelector("svg"), r, m, G, B(), { reset: S }), p(), j("selection").textContent = "Click a component to inspect its original statement and pin connections.", Q();
    } catch (G) {
      if (e.replaceChildren(), u = "", j("source").value = "", j("json").value = "", j("nets").replaceChildren(), j("selection").textContent = "", n.textContent = G.message, !d)
        j("hierarchy-panel").hidden = !0, j("selection-actions").hidden = !0, j("breadcrumbs").replaceChildren();
      else if (!d.contexts[w]) {
        const $ = document.createElement("button");
        $.type = "button", $.textContent = "Return to Top", $.onclick = () => F(""), j("breadcrumbs").replaceChildren($);
      }
      D.setCircuit(null, t.value), G.diagnostics && (L = G.diagnostics), L.some(($) => $.severity === "error") || L.push({ severity: "error", line: 0, message: G.message }), k(L);
    } finally {
      _ = !1, j("generate").disabled = !1, t.readOnly = !1, j("file").disabled = !1, j("libraries").disabled = !1;
      for (const G of ye.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) G.disabled = !1;
      d && d.contexts[w] && Q(), D.setEnabled(!!u), e.setAttribute("aria-busy", "false"), R(), M && (M = !1, Y(), queueMicrotask(J));
    }
  }
  j("generate").onclick = () => J({ resetEditor: !0 });
  for (const S of ye.querySelectorAll("[data-example]")) S.onclick = () => {
    const L = Le[S.dataset.example];
    t.value = L.source, Z(), W(L), J();
  };
  j("file").onchange = async (S) => {
    const L = S.target.files[0];
    if (L) {
      if (L.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await lt(L), Z(), J();
      } catch (G) {
        n.textContent = "File could not be read: " + G.message;
      } finally {
        S.target.value = "";
      }
    }
  }, j("libraries").onchange = async (S) => {
    try {
      for (const L of S.target.files) {
        if (L.size > 16e6) throw Error("Library exceeds 16 MB: " + L.name);
        C[L.webkitRelativePath || L.name] = await lt(L);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(C));
      } catch {
      }
      d = null, E = "", j("library-status").textContent = Object.keys(C).length + " library file(s) loaded", J();
    } catch (L) {
      n.textContent = L.message;
    } finally {
      S.target.value = "";
    }
  }, j("library-status").textContent = Object.keys(C).length ? "Libraries restored from this session." : "For .include / .lib dependencies", j("download").onclick = () => {
    const S = URL.createObjectURL(new Blob([u], { type: "image/svg+xml;charset=utf-8" })), L = document.createElement("a");
    L.href = S, L.download = "spice-schematic.svg", L.click(), setTimeout(() => URL.revokeObjectURL(S), 1e3);
  };
  async function te(S) {
    const L = r;
    if (!(!L || _ || c)) {
      c = !0, R(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: G } = await import("./asc-export-BJy7DNBM.js");
        if (r !== L) throw Error("Schematic changed. Generate again before exporting ASC.");
        s ||= G({ tree: d, circuit: m, drawing: L, source: t.value, libraries: C });
        const $ = S ? s.zip : s.ascBytes, z = URL.createObjectURL(new Blob([$], { type: S ? "application/zip" : "application/octet-stream" })), q = document.createElement("a");
        q.href = z, q.download = S ? "spice-schematic-asc.zip" : "spice-schematic.asc", q.click(), setTimeout(() => URL.revokeObjectURL(z), 1e3), n.textContent = "ASC connections verified · " + s.manifest.audit.symbols + " symbols. " + (S ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), s.manifest.warnings.length && (n.textContent += " " + s.manifest.warnings.join(" "));
      } catch (G) {
        n.textContent = "ASC export failed: " + G.message;
        const $ = document.createElement("li");
        $.className = "error", $.textContent = n.textContent, o.append($);
      } finally {
        c = !1, R();
      }
    }
  }
  j("download-asc").onclick = () => te(!1), j("download-asc-bundle").onclick = () => te(!0), j("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(u), n.textContent = "SVG source copied to clipboard.";
    } catch {
      j("source-details").open = !0, j("source").focus(), j("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, J();
}
export {
  $e as b,
  Ye as e,
  Ce as l,
  We as n,
  qt as p
};
