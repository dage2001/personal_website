const ze = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Xe = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, qe = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, Ke = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, Ye = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, Ze = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, Je = { 1: "a", 2: "b", 7: "Q", 8: "com" }, et = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, tt = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, nt = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, rt = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, ot = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, it = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, st = {
  AND: ze,
  BUF: Xe,
  COUNTER: qe,
  DFLOP: Ke,
  SCHMITT: Ye,
  OR: Ze,
  PHASEDET: Je,
  SRFLOP: et,
  XOR: tt,
  MODULATOR: nt,
  OTA: rt,
  SAMPLEHOLD: ot,
  VARISTOR: it
}, at = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ne = (t) => t.toLowerCase(), xe = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), ct = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function lt(t, e) {
  const n = (_) => e[ne(_ || "")] || Object.entries(e).find(([g]) => g.startsWith(ne(_ || "") + "."))?.[1], r = t[0][0].toUpperCase();
  let o = [], u = [], f = "", i = "", c = [], d = [], a = 0, y = "", l = "", p = "", b = !0;
  if ("RLC".includes(r))
    o = ["A", "B"], i = ne(r) + "_v";
  else if ("DVIB".includes(r))
    o = ["+", "-"], i = r === "D" ? "d_v" : r === "B" ? "spice_b" : ne(r);
  else if (r === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !xe(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), f = t[o.length + 1] || "";
    const _ = n(f)?.type;
    b = ["NPN", "PNP"].includes(_), i = b ? (o.length === 3 ? "q_" : "spice_q4_") + ne(_) : "spice_q" + o.length;
  } else if (r === "M") {
    const _ = n(t[4]), g = n(t[5]), m = _?.type === "VDMOS" || !g && (!t[5] || xe(t[5]));
    o = m ? ["D", "G", "S"] : ["D", "G", "S", "B"], f = t[o.length + 1] || "";
    const I = n(f), N = I?.type;
    if (m && I && N !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!m && N === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    b = ["NMOS", "PMOS", "VDMOS"].includes(N);
    let L = null, C = I;
    const S = /* @__PURE__ */ new Set();
    for (; C && !S.has(C.name) && (S.add(C.name), L = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !L); )
      C = n(C.baseModel);
    const x = N === "PMOS" || N === "VDMOS" && L && (L[1] === void 0 || Number(L[1]) >= 0.5);
    i = b ? "spice_" + (x ? "pmos" : "nmos") + (m ? "3" : "") : "spice_m";
  } else if ("JZ".includes(r)) {
    f = t[4] || "";
    const _ = n(f)?.type, g = r === "Z" && ["NIGBT", "PIGBT"].includes(_);
    o = g ? ["C", "G", "E"] : ["D", "G", "S"], b = r === "J" ? ["NJF", "PJF"].includes(_) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(_), i = "spice_" + (g ? "igbt" : r === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(_ || "") ? "p" : "n");
  } else if ("EFGH".includes(r)) {
    o = ["+", "-"], i = "spice_" + ne(r);
    let _ = 3, g = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[_] || "");
    if (/^poly$/i.test(t[_] || "") && (g = /^\(\s*(\d+)\s*\)$/.exec(t[++_] || ""), !g))
      throw Error("POLY requires a dimension.");
    if (g) {
      const m = Number(g[1]);
      if (m > 128) throw Error("POLY supports at most 128 controlling variables.");
      let I = _ + 1, N = [];
      const L = "EG".includes(r), C = m * (L ? 2 : 1);
      for (; N.length < C && I < t.length; ) N.push(...ct(t[I++]));
      if (N.length !== C || I >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (L) {
        for (let S = 0; S < m; S++) o.push("C" + (S + 1) + "+", "C" + (S + 1) + "-");
        u = [t[1], t[2], ...N];
      } else c = N;
      a = I, y = "POLY(" + m + ") " + (L ? "" : N.join(" ") + " "), l = "POLY", L && (i = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? l = "BEHAVIORAL" : "EG".includes(r) ? (o.push("C+", "C-"), l = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], a = 4, y = t[3] + " ");
    p = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[r] + (l ? " · " + l : "");
  } else if (r === "S")
    o = ["A", "B", "C+", "C-"], f = t[5] || "", i = "spice_device", p = "Voltage switch";
  else if (r === "W")
    o = ["A", "B"], c = [t[3]], f = t[4] || "", a = 3, i = "spice_device", p = "Current switch";
  else if ("TO".includes(r))
    o = ["L+", "L-", "R+", "R-"], r === "O" && (f = t[5] || ""), i = "spice_device", p = r === "T" ? "Transmission line" : "Lossy line";
  else if (r === "U")
    o = ["N1", "N2", "COM"], f = t[4] || "", i = "spice_device", p = "Distributed RC";
  else if (r === "A")
    o = Array.from({ length: 8 }, (_, g) => "P" + (g + 1)), i = "spice_device", p = t[9] || "A function";
  else if (r === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (d = t.slice(1, -1), d.some((_) => !/^L/i.test(_.split(":").at(-1)))) throw Error("K references must name inductors.");
    a = t.length - 1, i = "spice_coupling", p = "Magnetic coupling", y = d.join(" ") + " · k=";
  } else if (r === "@")
    o = ["IN", "OUT"], i = "spice_device", p = "FRA";
  else if (r === "&")
    o = ["O+", "O-", "I+", "I-"], i = "spice_device", p = "FRA probe";
  else if (r === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], i = "spice_device", p = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + r);
  if (a || (a = o.length + 1), u.length || (u = t.slice(1, o.length + 1)), u.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= a && !["&", "Ö"].includes(r)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (u.some((_) => /[=()]/.test(_) && !/^\{[\s\S]*\}$/.test(_))) throw Error("Invalid terminal token; check terminal count.");
  if (r === "B" && !/\b[VIPR]\s*=/i.test(t.slice(a).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (r === "B" && /^R\s*=/i.test(t.slice(a).join(" ")) && (i = "spice_br"), r === "D" && (f = t[3] || ""), r === "@") {
    const _ = t.slice(a).join(" ");
    for (const g of _.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(g[1].toUpperCase()), u.push(g[2]);
  }
  if (r === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((_) => !_)) throw Error("Missing controlling voltage source.");
  const h = o.map((_, g) => r === "A" && st[(t[9] || "").toUpperCase()]?.[String(g + 1)] || _);
  return { kind: r, pins: o, nodeTokens: u, pinLabels: h, model: f, type: i, controlSource: c[0] || "", controlSources: c, coupledInductors: d, value: y + t.slice(a).join(" "), sourceMode: l, symbol: p, polarityKnown: b };
}
const dt = at, ut = new Set(dt.split(" ")), Ee = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function me(t) {
  const e = [], n = [];
  let r = "", o = 0, u = "";
  for (let f = 0; f < t.length; f++) {
    const i = t[f];
    if (u) {
      r += i, i === u && t[f - 1] !== "\\" && (u = "");
      continue;
    }
    if (i === '"' || i === "'") {
      u = i, r += i;
      continue;
    }
    if (!o && (i === ";" || i === "$" && (!f || /\s/.test(t[f - 1])))) break;
    if ("({".includes(i) && (n.push(i), o++), ")}".includes(i) && (o--, n.pop() !== (i === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(i) && !o ? (r && e.push(r), r = "") : r += i;
  }
  if (o || u) throw Error("Unclosed expression or quoted string.");
  return r && e.push(r), e;
}
function ft(t, e = {}) {
  const n = [], r = [], o = [], u = Object.assign(Ee(), e.models), f = Ee(), i = (g, m, I) => n.push({ severity: g, line: m, message: I });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((g, m) => {
    const I = g.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? c.length ? c.at(-1).text += " " + I.slice(1).trim() : i("error", m + 1, "Continuation has no preceding statement.") : c.push({ line: m + 1, text: I }));
  });
  for (const g of c) {
    try {
      g.tokens = me(g.text);
    } catch (I) {
      i("error", g.line, I.message), g.tokens = [];
    }
    const m = g.tokens;
    if (/^\.model$/i.test(m[0] || ""))
      if (m.length < 3) i("error", g.line, ".model requires a name and device type.");
      else {
        const I = /^ako:(.+)$/i.exec(m[2]), N = I && m[3] && !m[3].startsWith("(") ? m[3].split("(")[0].toUpperCase() : "";
        u[X(m[1])] = { name: m[1], type: I ? N : m[2].split("(")[0].toUpperCase(), baseModel: I?.[1] || "", raw: g.text };
      }
  }
  const d = /* @__PURE__ */ new Set();
  function a(g) {
    const m = u[X(g)];
    if (!m) return "";
    if (m.type) return m.type;
    if (d.has(X(g))) throw Error("Circular AKO model inheritance: " + g);
    return d.add(X(g)), m.type = a(m.baseModel), d.delete(X(g)), m.type;
  }
  for (const g of Object.values(u)) if (g.baseModel && !g.type)
    try {
      a(g.name);
    } catch (m) {
      i("error", 0, m.message);
    }
  let y = "", l = 0, p = !1, b = !1;
  const h = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: g, text: m, tokens: I } of c) {
    if (!I.length) continue;
    const N = X(I[0]);
    if (b) {
      i("warning", g, "Statement after .end is not rendered: " + m);
      continue;
    }
    if (N === ".control") {
      p = !0, i("warning", g, ".control script retained but not executed or rendered.");
      continue;
    }
    if (N === ".endc") {
      p = !1;
      continue;
    }
    if (p) continue;
    if (N === ".subckt") {
      l++, i("error", g, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (N === ".ends") {
      l ? l-- : i("error", g, "Unmatched .ends.");
      continue;
    }
    if (l) continue;
    if (N === ".end") {
      b = !0;
      continue;
    }
    if (N.startsWith(".")) {
      r.push({ line: g, text: m }), N === ".title" ? y = I.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(N) ? i("error", g, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(N) ? i("error", g, "Topology-changing directive is unsupported: " + m) : _.has(N) || i("warning", g, "Directive retained but not resolved: " + m);
      continue;
    }
    const L = I[0][0].toUpperCase();
    if (!ut.has(L)) {
      g === 1 && !/\d/.test(I[0]) && I.length > 1 && L !== "X" ? (y = m, i("warning", g, "First line treated as a SPICE title; use .title for an unambiguous title.")) : i("warning", g, `Unsupported ${L} device was not rendered: ${m}`);
      continue;
    }
    const C = L === "M" || L === "Q" ? 5 : 4;
    if (g === 1 && !/\d/.test(I[0]) && (I.length < C || L === "T" && !/\b(?:zo|z0)\s*=/i.test(m))) {
      y = m, i("info", g, "SPICE title: " + m);
      continue;
    }
    try {
      if (h.has(N)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const S = lt(I, u), { pins: x, nodeTokens: s, ...E } = S;
      S.polarityKnown || i("warning", g, `${I[0]}: model polarity unknown; explicit ${x.join("/")} terminals retained.`);
      const O = Ee();
      x.forEach((Q, P) => {
        const V = X(s[P]);
        f[V] || (f[V] = { name: V, displayName: I[P + 1], bit: Object.keys(f).length + 2, terminals: [] }), f[V].terminals.push({ component: I[0], pin: Q }), O[Q] = V;
      }), o.push({ ...E, name: I[0], terminals: O, line: g, raw: m }), h.add(N);
    } catch (S) {
      i("error", g, `${I[0]}: ${S.message} Statement: ${m}`);
    }
  }
  l && i("error", 0, "Unclosed .subckt definition."), p && i("error", 0, "Unclosed .control block."), o.length || i("error", 0, "No supported components to render."), o.length > 300 && i("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const g of o) {
    for (const m of g.controlSources || []) !m.includes(":") && !o.some((I) => X(I.name) === X(m) && I.kind === "V") && i("error", g.line, `${g.name}: controlling voltage source ${m} was not found.`);
    for (const m of g.coupledInductors || []) !m.includes(":") && !o.some((I) => X(I.name) === X(m) && I.kind === "L") && i("error", g.line, `${g.name}: coupled inductor ${m} was not found.`);
    (g.kind === "B" || g.type === "spice_b") && i("info", g.line, `${g.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: y, components: o, nodes: f, models: u, directives: r, diagnostics: n };
}
const J = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Le = (t) => J(t).split("/").at(-1);
function pt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const r = new Map(e instanceof Map ? e : Object.entries(e)), o = [], u = [], f = [];
  let i = 0;
  const c = (a, y) => {
    const l = J(y).split("/").slice(0, -1).concat(J(a)).join("/"), p = [...r].filter(([h]) => J(h) === J(a) || J(h) === l);
    if (p.length === 1) return p[0];
    const b = [...r].filter(([h]) => Le(h) === Le(a));
    if (b.length !== 1) throw Error(b.length ? "Ambiguous library filename: " + a : "Missing library " + a + ". Add this file using Library files.");
    return b[0];
  };
  function d(a, y, l = "", p = []) {
    const b = J(y) + ":" + l.toLowerCase();
    if (p.includes(b)) throw Error("Circular library include: " + [...p, b].join(" → "));
    if (p.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const h = [], _ = /^\s*\.endl\b/im.test(a);
    let g = !l;
    const m = (N, L) => {
      if (i += N.length, i > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      f.push(N), u.push({ file: y, line: L + 1 });
    };
    if (a.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((N, L) => {
      const C = N.trim();
      if (/^\.lib\b/i.test(C) && _) {
        const S = me(C);
        if (S.length === 2 && !/[.\\/]/.test(S[1])) {
          h.push(S[1].toLowerCase()), S[1].toLowerCase() === l.toLowerCase() && (g = !0), m("* Library section " + S[1], L);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        h.pop(), m("* End library section", L);
        return;
      }
      if (l && h.length && !h.includes(l.toLowerCase())) {
        m("* Unselected library section", L);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const S = me(C);
          if (!S[1]) throw Error("Include requires a filename.");
          const [x, s] = c(S[1], y);
          m("* Included " + x, L), d(s, x, S[2] || "", [...p, b]);
        } catch (S) {
          o.push({ severity: "error", line: L + 1, source: y, message: S.message }), m("* Unresolved include", L);
        }
      else m(N, L);
    }), !g) throw Error("Library section " + l + " not found in " + y);
  }
  try {
    d(t, n);
  } catch (a) {
    o.push({ severity: "error", line: 0, source: n, message: a.message });
  }
  return { source: f.join(`
`), origins: u, diagnostics: o };
}
function mt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), r = [0], o = [];
  t.split(/\r?\n/).forEach((i, c) => {
    const d = i.trim();
    /^\.subckt\b/i.test(d) && (r.push(c + 1), n.set(c + 1, [])), r.at(-1) ? n.get(r.at(-1)).push({ raw: i, line: c + 1 }) : e[c] = i, /^\.ends\b/i.test(d) && r.length > 1 && r.pop();
  });
  const u = ke(Array.from({ length: t.split(/\r?\n/).length }, (i, c) => e[c] || "").join(`
`));
  o.push(...u.diagnostics);
  const f = /* @__PURE__ */ new Map();
  for (const [i, c] of n) {
    const d = ke(c.map((a) => a.raw).join(`
`));
    f.set(i, d.layout), o.push(...d.diagnostics.map((a) => ({ ...a, line: c[a.line - 1]?.line || i })));
  }
  return { layout: u.layout, scopes: f, diagnostics: o };
}
function ke(t) {
  const e = [], n = [];
  let r = !1, o = !1, u = 0;
  if (t.split(/\r?\n/).forEach((m, I) => {
    const N = m.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(N)) {
      (o || r) && e.push({ severity: "error", line: I + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(N) || e.push({ severity: "error", line: I + 1, message: "Expected @layout begin v1." }), o = !0, r = !0, u = I + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(N)) {
      r || e.push({ severity: "error", line: I + 1, message: "Unexpected @layout end." }), r = !1;
      return;
    }
    r && (N.startsWith("*") ? n.push(N.slice(1).trim()) : e.push({ severity: "error", line: I + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), r && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const f = n.join(" "), i = f.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], d = [], a = [], y = [];
  let l = 0, p = 0, b = 10;
  const h = () => i[l++], _ = () => {
    const m = h();
    if (!m || !/^[A-Za-z_@][\w./%:@-]*$/.test(m)) throw Error("Expected layout identifier, got " + m);
    return m;
  };
  function g(m) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const I = m ? _() : "@row" + p++, N = h();
    if (!["row", "column", "classic"].includes(N)) throw Error("Expected row, column or classic.");
    if (h() !== "{") throw Error("Expected { after " + N);
    const L = { id: I, direction: N, members: [] };
    for (c.push(L); l < i.length && i[l] !== "}"; )
      i[l] === "group" ? (h(), L.members.push(g(!0))) : ["row", "column"].includes(i[l]) ? L.members.push(g(!1)) : L.members.push(_());
    if (h() !== "}") throw Error("Unclosed group " + I);
    if (!L.members.length) throw Error("Empty layout group " + I);
    return I;
  }
  try {
    for (; l < i.length; )
      if (i[l] === "group")
        h(), g(!0);
      else if (["row", "column"].includes(i[l])) g(!1);
      else if (i[l] === "face") {
        h();
        const s = _(), E = h();
        if (!["left", "right"].includes(E)) throw Error("Expected face left or right.");
        if (y.some((O) => O.device.toLowerCase() === s.toLowerCase())) throw Error("Duplicate face device.");
        y.push({ device: s, side: E });
      } else if (i[l] === "pair") {
        h();
        const s = h();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(s)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (h() !== "{") throw Error("Expected { after pair kind.");
        const E = [];
        for (; l < i.length && i[l] !== "}"; ) E.push(_());
        if (h() !== "}" || !E.length) throw Error("Empty or unclosed pair.");
        if (a.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        a.push({ kind: s, members: E });
      } else if (i[l] === "priority-cap") {
        if (h(), b = Number(h()), !Number.isInteger(b) || b < 3 || b > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (h() === "place") {
        const s = _(), E = h(), O = _();
        if (!["left-of", "above"].includes(E)) throw Error("Expected left-of or above.");
        d.push({ a: s, relation: E, b: O });
      } else throw Error("Unknown layout instruction near " + i[l - 1]);
    const m = /* @__PURE__ */ new Set();
    for (const s of c) {
      const E = s.id.toLowerCase();
      if (m.has(E)) throw Error("Duplicate layout group " + s.id);
      m.add(E);
    }
    const I = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Set(), L = new Map(c.map((s) => [s.id.toLowerCase(), s])), C = (s) => {
      if (I.has(s)) throw Error("Circular layout group " + s);
      if (!N.has(s)) {
        I.add(s);
        for (const E of L.get(s).members) L.has(E.toLowerCase()) && C(E.toLowerCase());
        I.delete(s), N.add(s);
      }
    };
    for (const s of L.keys()) C(s);
    const S = /* @__PURE__ */ new Map();
    for (const s of d) {
      if (s.a.toLowerCase() === s.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      S.has(s.a.toLowerCase()) || S.set(s.a.toLowerCase(), []), S.get(s.a.toLowerCase()).push(s.b.toLowerCase());
    }
    I.clear(), N.clear();
    const x = (s) => {
      if (I.has(s)) throw Error("Circular place constraints.");
      if (!N.has(s)) {
        I.add(s);
        for (const E of S.get(s) || []) x(E);
        I.delete(s), N.add(s);
      }
    };
    for (const s of S.keys()) x(s);
  } catch (m) {
    e.push({ severity: "error", line: u, message: "Layout description: " + m.message });
  }
  return { layout: { version: 1, priorityCap: b, groups: c, relations: d, pairs: a, faces: y }, diagnostics: e };
}
function ht(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let r = e.focus ? n : t.ir.layoutDescription;
  if (!r) return null;
  if (n) {
    const p = new Set(n.groups.map((h) => h.id.toLowerCase())), b = (h) => p.has(h.toLowerCase()) ? h : e.components.find((g) => g.synthetic && g.value.toLowerCase() === h.toLowerCase())?.name || e.focus + "/" + h;
    r = { ...n, groups: n.groups.map((h) => ({ ...h, members: h.members.map(b) })), relations: n.relations.map((h) => ({ ...h, a: b(h.a), b: b(h.b) })), faces: (n.faces || []).map((h) => ({ ...h, device: b(h.device) })), pairs: (n.pairs || []).map((h) => ({ ...h, members: h.members.map(b) })) };
  }
  const o = new Map(r.groups.map((p) => [p.id.toLowerCase(), p])), u = Object.values(t.contexts).flatMap((p) => p.devices.map((b) => b.name)), f = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((p) => p.name)].map((p) => p.toLowerCase()));
  for (const p of o.values()) if (f.has((n ? e.focus + "/" + p.id : p.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + p.id);
  for (const p of o.values()) for (const b of p.members) if (!o.has(b.toLowerCase()) && !f.has(b.toLowerCase())) throw Error("Unknown @layout instance/device: " + b);
  for (const p of r.relations) for (const b of [p.a, p.b]) if (!o.has(b.toLowerCase()) && !f.has(b.toLowerCase())) throw Error("Unknown @layout place target: " + b);
  const i = (r.pairs || []).map((p) => ({ ...p, members: p.members.map((b) => {
    const h = e.components.find((_) => _.name.toLowerCase() === b.toLowerCase());
    if (!h || h.synthetic || h.block) throw Error("Unknown or non-visible @layout pair device: " + b);
    return h.name;
  }) })), c = (r.faces || []).map((p) => {
    const b = e.components.find((h) => h.name.toLowerCase() === p.device.toLowerCase());
    if (!b || !["Q", "M", "J", "Z"].includes(b.kind)) throw Error("Unknown or unsupported @layout face device: " + p.device);
    return { ...p, device: b.name };
  }), d = /* @__PURE__ */ new Map(), a = [], y = new Set(Object.keys(t.contexts).map((p) => p.toLowerCase()));
  for (const p of r.groups) {
    const b = [];
    for (const h of p.members) {
      if (o.has(h.toLowerCase())) {
        b.push({ group: h });
        continue;
      }
      for (const _ of e.components) if (_.name.toLowerCase() === h.toLowerCase() || _.name.toLowerCase().startsWith(h.toLowerCase() + "/")) {
        if (d.has(_.name)) throw Error("Overlapping @layout membership: " + _.name);
        d.set(_.name, p.id), b.push({ cell: _.name, ...y.has(h.toLowerCase()) ? { instance: h } : {} });
      }
    }
    a.push({ id: p.id, direction: p.direction, members: b });
  }
  const l = /* @__PURE__ */ new Set();
  for (const p of a) for (const b of p.members) if (b.group) {
    const h = b.group.toLowerCase();
    if (l.has(h)) throw Error("Layout group has multiple parents: " + b.group);
    l.add(h);
  }
  return { version: 1, priorityCap: r.priorityCap, groups: a, relations: r.relations, pairs: i, faces: c };
}
const oe = () => /* @__PURE__ */ Object.create(null), H = (t) => t.toLowerCase();
function je(t) {
  const e = oe();
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    if (/^params?:$/i.test(r)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(r);
    if (!o) throw Error("Expected named parameter assignment, got: " + r);
    const u = H(o[1]);
    let f = o[2];
    if (f === void 0) {
      const i = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!i) throw Error("Expected = after parameter " + u);
      f = i[1];
    }
    if (f || (f = t[++n]), !f || /^params?:$/i.test(f)) throw Error("Missing value for parameter " + u);
    if (Object.hasOwn(e, u)) throw Error("Duplicate parameter: " + u);
    e[u] = f;
  }
  return e;
}
function Ae(t) {
  const e = t.findIndex((n, r) => /^params?:$/i.test(n) || n.includes("=") || t[r + 1] === "=");
  return e < 0 ? [t, oe()] : [t.slice(0, e), je(t.slice(e))];
}
function gt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = pt(t, e);
  t = n.source;
  const r = mt(t), o = [...n.diagnostics, ...r.diagnostics], u = oe(), f = /* @__PURE__ */ new Set(["0"]), i = (m, I, N) => o.push({ severity: m, line: I, message: N }), c = (m, I, N, L = [], C = oe(), S = 0) => {
    const x = { id: m, name: I, parent: N, ports: L, defaults: C, parameters: oe(), definitions: oe(), devices: [], instances: [], directives: [], line: S, statements: [], layoutDescription: r.scopes.get(S) || null };
    return u[m] = x, x;
  }, d = c("root", "Top", null), a = [d], y = [];
  let l = !1, p = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, I) => {
    const N = m.trim();
    !N || N.startsWith("*") || (N.startsWith("+") ? y.length ? y.at(-1).text += " " + N.slice(1).trim() : i("error", I + 1, "Continuation has no preceding statement.") : y.push({ text: N, line: I + 1 }));
  });
  for (const { text: m, line: I } of y)
    try {
      const N = me(m);
      if (!N.length) continue;
      const L = H(N[0]), C = a.at(-1);
      if (p) {
        i("warning", I, "Statement after .end is not rendered: " + m);
        continue;
      }
      if (L === ".control") {
        l = !0, i("warning", I, ".control script retained but not executed or rendered.");
        continue;
      }
      if (L === ".endc") {
        l = !1;
        continue;
      }
      if (l) continue;
      if (L === ".subckt") {
        if (N.length < 2) throw Error(".SUBCKT requires a name.");
        const [S, x] = Ae(N.slice(2)), s = H(N[1]);
        if (Object.hasOwn(C.definitions, s)) throw Error("Duplicate subcircuit definition: " + N[1]);
        const E = S.map(H);
        if (new Set(E).size !== S.length || E.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (S.some((Q) => /[{}()=]/.test(Q))) throw Error("Invalid formal port.");
        if (a.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const O = C.id + "/" + encodeURIComponent(s);
        C.definitions[s] = O, a.push(c(O, N[1], C.id, S, x, I));
        continue;
      }
      if (L === ".ends") {
        if (a.length === 1) throw Error("Unmatched .ENDS.");
        if (N[1] && H(N[1]) !== H(C.name)) throw Error(".ENDS name does not match " + C.name);
        a.pop();
        continue;
      }
      if (L === ".end") {
        if (a.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        p = !0;
        continue;
      }
      if (L === ".param") {
        const S = je(N.slice(1));
        for (const [x, s] of Object.entries(S)) {
          if (Object.hasOwn(C.parameters, x)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + x);
          C.parameters[x] = s;
        }
      }
      if (L === ".global") {
        if (N.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const S of N.slice(1)) f.add(H(S));
      }
      if (L.startsWith(".") && C.directives.push({ line: I, text: m }), L.startsWith("x")) {
        const [S, x] = Ae(N.slice(1));
        if (!S.length) throw Error("X instance requires a subcircuit name.");
        const s = /;§pnba\s+(.+)$/i.exec(m)?.[1].split(")");
        C.instances.push({ name: N[0], nodes: S.slice(0, -1).map(H), definitionName: S.at(-1), definitionId: null, parameters: x, line: I, raw: m, pinNames: s });
      } else C.statements.push({ line: I, text: m });
    } catch (N) {
      i("error", I, N.message + " Statement: " + m);
    }
  a.length > 1 && i("error", a.at(-1).line, "Unclosed .SUBCKT " + a.at(-1).name), l && i("error", 0, "Unclosed .control block.");
  function b(m, I) {
    for (; m; ) {
      if (Object.hasOwn(m.definitions, H(I))) return m.definitions[H(I)];
      m = u[m.parent];
    }
    return null;
  }
  for (const m of Object.values(u)) {
    const I = [...m.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...m.statements], N = ft(I.map((C) => C.text).join(`
`), { models: u[m.parent]?.models });
    m.devices = N.components.map((C) => ({ ...C, line: I[C.line - 1]?.line || m.line })), m.models = N.models, m === d && (d.title = N.title), o.push(...N.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: I[C.line - 1]?.line || m.line })));
    const L = new Set(m.devices.map((C) => H(C.name)));
    for (const C of m.instances)
      if (L.has(H(C.name)) && i("error", C.line, "Duplicate instance/device name: " + C.name), L.add(H(C.name)), C.definitionId = b(m, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) i("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const S = u[C.definitionId];
        S.ports.length !== C.nodes.length && i("error", C.line, `${C.name}: ${S.name} expects ${S.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const m of Object.values(u)) delete m.statements;
  const h = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set();
  function g(m, I = []) {
    if (h.has(m)) {
      i("error", u[m].line, "Circular subcircuit reference: " + [...I, u[m].name].join(" → "));
      return;
    }
    if (!_.has(m)) {
      if (h.add(m), I.length >= 64) {
        i("error", u[m].line, "Subcircuit dependency nesting exceeds 64 levels."), h.delete(m), _.add(m);
        return;
      }
      for (const N of u[m].instances) N.definitionId && g(N.definitionId, [...I, u[m].name]);
      h.delete(m), _.add(m);
    }
  }
  for (const m of Object.keys(u)) g(m);
  !d.devices.length && !d.instances.length && i("error", 0, "No supported components or instances to render.");
  for (const m of o) !m.source && m.line && n.origins[m.line - 1] && (m.source = n.origins[m.line - 1].file, m.line = n.origins[m.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: d.title || "", scopes: u, globals: [...f], diagnostics: o, layoutDescription: r.layout };
}
const G = () => /* @__PURE__ */ Object.create(null), re = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), we = (t, e) => re(t.map((n) => n.toLowerCase()), e.toLowerCase());
function bt(t, e = []) {
  const n = G(), r = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [u, f] of Object.entries(o.terminals)) r(f).terminals.push({ component: o.name, pin: u });
  for (const o of e) r(o);
  return n;
}
function Et(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Pe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, wt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function he(t, e, n = (o) => o, r = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (f) => (o.push(f), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (f, i, c) => {
    const d = c.split(",").map((y) => y.trim());
    if (d.some((y) => !y || /[\s{}+*()]/.test(y))) throw Error("Unsupported dynamic voltage/current reference: " + f);
    const a = i.toUpperCase() + "(" + d.map((y) => i.toLowerCase() === "v" ? n(y) : r(y, i)).join(",") + ")";
    return o.push(a), "@@" + (o.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(wt, (f, i, c) => {
    if (c.slice(i + f.length).trimStart().startsWith("(")) return f;
    const d = e(f.toLowerCase());
    if (d === void 0) return f;
    if (u += d.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (f, i) => o[Number(i)]);
}
function yt(t, e, n, r) {
  const o = { ...e, ...n }, u = G(), f = /* @__PURE__ */ new Set(), i = G();
  for (const [d, a] of Object.entries(r)) i[d] = he(Pe(a), (y) => t[y]);
  function c(d) {
    if (Object.hasOwn(i, d)) return i[d];
    if (Object.hasOwn(u, d)) return u[d];
    if (!Object.hasOwn(o, d)) return t[d];
    if (f.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...f, d].join(" → "));
    }
    return f.add(d), u[d] = he(Pe(o[d]), c), f.delete(d), u[d];
  }
  for (const d of Object.keys(o)) c(d);
  return Object.assign(G(), t, u, i);
}
function ye(t, e, n, r) {
  let o = "";
  for (let c = 0; c < t.length; ) {
    const d = t[c];
    if (d !== "{" && d !== "'") {
      o += d, c++;
      continue;
    }
    const a = c++;
    let y = 1, l = "";
    for (; c < t.length && y; c++) {
      if (d === "'") {
        t[c] === "'" && (y = 0);
        continue;
      }
      if (l) {
        t[c] === l && (l = "");
        continue;
      }
      if (t[c] === '"' || t[c] === "'") {
        l = t[c];
        continue;
      }
      t[c] === "{" && y++, t[c] === "}" && y--;
    }
    if (y) throw Error("Unclosed parameter expression.");
    o += d + he(t.slice(a + 1, c - 1), (p) => e[p], n, r) + (d === "{" ? "}" : "'");
  }
  const u = [];
  let f = 0, i = "";
  for (let c = 0; c < o.length; c++) {
    const d = o[c];
    if (i) {
      d === i && o[c - 1] !== "\\" && (i = "");
      continue;
    }
    if (d === '"' || d === "'") {
      i = d;
      continue;
    }
    if ("({".includes(d) && f++, ")}".includes(d) && f--, !f && (c === 0 || /\s/.test(o[c - 1]))) {
      const a = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(c));
      a && (u.push({ start: c, end: c + a[0].length, key: a[1].toLowerCase() }), c += a[0].length - 1);
    }
  }
  if (u.length) {
    let c = o.slice(0, u[0].start);
    u.forEach((d, a) => {
      const y = u[a + 1]?.start ?? o.length, l = o.slice(d.end, y);
      c += o.slice(d.start, d.end) + (l.includes("{") || ["refnode", "intnode"].includes(d.key) ? l : he(l, (p) => e[p], n, r));
    }), o = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
}
class _t {
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
      for (let o in arguments[0])
        this.add(o, arguments[0][o], arguments[1]);
    else
      (Array.isArray(e) ? e : [e]).forEach(function(o) {
        this[o] = this[o] || [], n && this[o][r ? "unshift" : "push"](n);
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
class Nt {
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
class w {
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
    return "JavaScript Expression Parser (JSEP) v" + w.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return w.max_unop_len = Math.max(e.length, w.max_unop_len), w.unary_ops[e] = 1, w;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, r) {
    return w.max_binop_len = Math.max(e.length, w.max_binop_len), w.binary_ops[e] = n, r ? w.right_associative.add(e) : w.right_associative.delete(e), w;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return w.additional_identifier_chars.add(e), w;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return w.literals[e] = n, w;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete w.unary_ops[e], e.length === w.max_unop_len && (w.max_unop_len = w.getMaxKeyLen(w.unary_ops)), w;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return w.unary_ops = {}, w.max_unop_len = 0, w;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return w.additional_identifier_chars.delete(e), w;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete w.binary_ops[e], e.length === w.max_binop_len && (w.max_binop_len = w.getMaxKeyLen(w.binary_ops)), w.right_associative.delete(e), w;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return w.binary_ops = {}, w.max_binop_len = 0, w;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete w.literals[e], w;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return w.literals = {}, w;
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
    return new w(e).parse();
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
    return w.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !w.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    w.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return w.isIdentifierStart(e) || w.isDecimalDigit(e);
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
    if (w.hooks[e]) {
      const r = { context: this, node: n };
      return w.hooks.run(e, r), r.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (w.hooks[e]) {
      const n = { context: this };
      return w.hooks[e].find(function(r) {
        return r.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === w.SPACE_CODE || e === w.TAB_CODE || e === w.LF_CODE || e === w.CR_CODE; )
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
      type: w.COMPOUND,
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
    let n = [], r, o;
    for (; this.index < this.expr.length; )
      if (r = this.code, r === w.SEMCOL_CODE || r === w.COMMA_CODE)
        this.index++;
      else if (o = this.gobbleExpression())
        n.push(o);
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
    let e = this.expr.substr(this.index, w.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (w.binary_ops.hasOwnProperty(e) && (!w.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !w.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, r, o, u, f, i, c, d;
    if (f = this.gobbleToken(), !f || (n = this.gobbleBinaryOp(), !n))
      return f;
    for (u = { value: n, prec: w.binaryPrecedence(n), right_a: w.right_associative.has(n) }, i = this.gobbleToken(), i || this.throwError("Expected expression after " + n), o = [f, u, i]; n = this.gobbleBinaryOp(); ) {
      if (r = w.binaryPrecedence(n), r === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: r, right_a: w.right_associative.has(n) }, d = n;
      const a = (y) => u.right_a && y.right_a ? r > y.prec : r <= y.prec;
      for (; o.length > 2 && a(o[o.length - 2]); )
        i = o.pop(), n = o.pop().value, f = o.pop(), e = {
          type: w.BINARY_EXP,
          operator: n,
          left: f,
          right: i
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + d), o.push(u, e);
    }
    for (c = o.length - 1, e = o[c]; c > 1; )
      e = {
        type: w.BINARY_EXP,
        operator: o[c - 1].value,
        left: o[c - 2],
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
    let e, n, r, o;
    if (this.gobbleSpaces(), o = this.searchHook("gobble-token"), o)
      return this.runHook("after-token", o);
    if (e = this.code, w.isDecimalDigit(e) || e === w.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === w.SQUOTE_CODE || e === w.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === w.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, w.max_unop_len), r = n.length; r > 0; ) {
        if (w.unary_ops.hasOwnProperty(n) && (!w.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !w.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += r;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: w.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --r);
      }
      w.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), w.literals.hasOwnProperty(o.name) ? o = {
        type: w.LITERAL,
        value: w.literals[o.name],
        raw: o.name
      } : o.name === w.this_str && (o = { type: w.THIS_EXP })) : e === w.OPAREN_CODE && (o = this.gobbleGroup());
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
    for (; n === w.PERIOD_CODE || n === w.OBRACK_CODE || n === w.OPAREN_CODE || n === w.QUMARK_CODE; ) {
      let r;
      if (n === w.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== w.PERIOD_CODE)
          break;
        r = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === w.OBRACK_CODE ? (e = {
        type: w.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== w.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === w.OPAREN_CODE ? e = {
        type: w.CALL_EXP,
        arguments: this.gobbleArguments(w.CPAREN_CODE),
        callee: e
      } : (n === w.PERIOD_CODE || r) && (r && this.index--, this.gobbleSpaces(), e = {
        type: w.MEMBER_EXP,
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
    for (; w.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === w.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); w.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); w.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      w.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return r = this.code, w.isIdentifierStart(r) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (r === w.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === w.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: w.LITERAL,
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
    let o = !1;
    for (; this.index < this.expr.length; ) {
      let u = this.expr.charAt(this.index++);
      if (u === r) {
        o = !0;
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
    return o || this.throwError('Unclosed quote after "' + e + '"'), {
      type: w.LITERAL,
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
    for (w.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, w.isIdentifierPart(e)); )
      this.index++;
    return {
      type: w.IDENTIFIER,
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
    let r = !1, o = 0;
    for (; this.index < this.expr.length; ) {
      this.gobbleSpaces();
      let u = this.code;
      if (u === e) {
        r = !0, this.index++, e === w.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (u === w.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === w.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === w.CBRACK_CODE)
            for (let f = n.length; f < o; f++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const f = this.gobbleExpression();
        (!f || f.type === w.COMPOUND) && this.throwError("Expected comma"), n.push(f);
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
    let e = this.gobbleExpressions(w.CPAREN_CODE);
    if (this.code === w.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: w.SEQUENCE_EXP,
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
      type: w.ARRAY_EXP,
      elements: this.gobbleArguments(w.CBRACK_CODE)
    };
  }
}
const Ct = new _t();
Object.assign(w, {
  hooks: Ct,
  plugins: new Nt(w),
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
w.max_unop_len = w.getMaxKeyLen(w.unary_ops);
w.max_binop_len = w.getMaxKeyLen(w.binary_ops);
const se = (t) => new w(t).parse(), It = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(w).filter((t) => !It.includes(t) && se[t] === void 0).forEach((t) => {
  se[t] = w[t];
});
se.Jsep = w;
const vt = "ConditionalExpression";
var Ot = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: vt,
            test: r,
            consequent: o,
            alternate: u
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let f = r;
            for (; f.right.operator && t.binary_ops[f.right.operator] <= 0.9; )
              f = f.right;
            n.node.test = f.right, f.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(Ot);
const St = "ConditionalExpression";
var Rt = {
  name: "ternary",
  init(t) {
    t.hooks.add("after-expression", function(n) {
      if (n.node && this.code === t.QUMARK_CODE) {
        this.index++;
        const r = n.node, o = this.gobbleExpression();
        if (o || this.throwError("Expected expression"), this.gobbleSpaces(), this.code === t.COLON_CODE) {
          this.index++;
          const u = this.gobbleExpression();
          if (u || this.throwError("Expected expression"), n.node = {
            type: St,
            test: r,
            consequent: o,
            alternate: u
          }, r.operator && t.binary_ops[r.operator] <= 0.9) {
            let f = r;
            for (; f.right.operator && t.binary_ops[f.right.operator] <= 0.9; )
              f = f.right;
            n.node.test = f.right, f.right = n.node, n.node = r;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
se.plugins.register(Rt);
const xt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Te = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, W = (t) => Number(t) > 0.5;
function ue(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let r = 0;
  function o(i) {
    return i = String(i).trim(), /^\{[\s\S]*\}$/.test(i) && (i = i.slice(1, -1)), i = i.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, d, a, y] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), l = a.toLowerCase(), p = l.startsWith("meg") ? 1e6 : l.startsWith("mil") ? 254e-7 : xt[l[0]] || 1;
      return "(" + (y ? +(d + (d.includes(".") ? "" : ".") + y) : Number(d)) * p + ")";
    }), u(se(i));
  }
  function u(i) {
    if (++r > 1e4) throw Error("Structural expression is too complex.");
    if (i.type === "Literal") return i.value;
    if (i.type === "Identifier") {
      const c = i.name.toLowerCase();
      if (c === "pi") return Math.PI;
      if (c === "e") return Math.E;
      if (!Object.hasOwn(e, c)) throw Error("Undefined structural parameter: " + i.name);
      if (n.has(c)) throw Error("Circular structural parameter: " + c);
      n.add(c);
      const d = o(e[c]);
      return n.delete(c), d;
    }
    if (i.type === "ConditionalExpression") return W(u(i.test)) ? u(i.consequent) : u(i.alternate);
    if (i.type === "UnaryExpression") {
      const c = u(i.argument);
      if (i.operator === "-") return -c;
      if (i.operator === "+") return +c;
      if (i.operator === "!" || i.operator === "~") return !W(c);
    }
    if (i.type === "BinaryExpression") {
      const c = u(i.left);
      if (i.operator === "&&") return W(c) && W(u(i.right));
      if (i.operator === "||") return W(c) || W(u(i.right));
      const d = u(i.right);
      switch (i.operator) {
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
          return W(c) !== W(d);
        case "&":
          return W(c) && W(d);
        case "|":
          return W(c) || W(d);
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
    if (i.type === "CallExpression" && i.callee.type === "Identifier") {
      const c = i.callee.name.toLowerCase();
      if (c === "if") {
        if (i.arguments.length !== 3) throw Error("if() needs three arguments.");
        return W(u(i.arguments[0])) ? u(i.arguments[1]) : u(i.arguments[2]);
      }
      if (Object.hasOwn(Te, c)) return Te[c](...i.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const f = o(t);
  if (typeof f == "number" && !Number.isFinite(f)) throw Error("Structural expression is not finite.");
  return f;
}
function Ce(t, { isolate: e = "" } = {}) {
  Et(t);
  const n = G(), r = /* @__PURE__ */ new Map();
  let o = 0, u = 0;
  function f(i, c, d, a, y, l, p) {
    if (c.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const b = t.scopes[i], h = c.length ? re(c.slice(0, -1), c.at(-1)) : "", _ = G();
    if (e && h === e && (d = G()), p.some((C) => C.scopeId === i)) throw Error("Circular subcircuit reference at " + h);
    const g = yt(a, b.defaults, b.parameters, y);
    function m(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const x = ue(C, g);
        C = String(typeof x == "boolean" ? Number(x) : x);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const S = C.toLowerCase();
      return Object.hasOwn(d, S) ? d[S] : t.globals.includes(S) ? we([], S) : _[S] || (_[S] = we(c, S));
    }
    const I = { id: h, path: c, scopeId: i, name: l?.name || "Top", definition: b.name, ports: b.ports.map((C) => ({ name: C, node: m(C) })), params: g, nodes: _, models: G(), devices: [], children: [], raw: l?.raw || "", line: l?.line || 0 };
    n[h] = I, r.set(h, m);
    const N = [...p, I];
    function L(C) {
      if (!C) return "";
      let S = b;
      for (; S; ) {
        if (S.directives.some((x) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(x.text))) {
          const x = [...N].reverse().find((s) => s.scopeId === S.id);
          return re(x?.path || [], C.toLowerCase());
        }
        S = t.scopes[S.parent];
      }
      return C;
    }
    for (const C of b.directives.filter((S) => /^\.model\b/i.test(S.text))) {
      const S = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!S) continue;
      const x = L(S), s = b.models[S.toLowerCase()], E = ye(C.text, g, m, (O) => re(c, O));
      I.models[x] = { ...s, name: x, raw: E.replace(/^(\.model\s+)\S+/i, (O, Q) => Q + x), instanceId: h, parameters: g };
    }
    for (const C of b.devices) {
      if (++u > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const S = G();
      for (const [s, E] of Object.entries(C.terminals)) S[s] = m(E);
      const x = L(C.model);
      I.devices.push({ ...C, name: re(c, C.name), localName: C.name, instanceId: h, terminals: S, model: x, parameters: g });
    }
    for (const C of b.instances) {
      let S = C.definitionId;
      if (!S) {
        const O = String(ue(C.definitionName, g)).toLowerCase();
        let Q = b;
        for (; Q && !S; )
          S = Q.definitions[O], Q = t.scopes[Q.parent];
        if (!S) throw Error("Undefined selected subcircuit: " + O);
      }
      const x = t.scopes[S], s = G();
      if (x.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + x.ports.length + " ports; got " + C.nodes.length);
      x.ports.forEach((O, Q) => {
        s[O.toLowerCase()] = m(C.nodes[Q]);
      });
      const E = f(S, [...c, C.name], s, g, C.parameters, C, N);
      C.pinNames?.length === E.ports.length && E.ports.forEach((O, Q) => {
        O.label = C.pinNames[Q];
      }), I.children.push(E);
    }
    return I;
  }
  try {
    let y = function(l, p) {
      const b = p.split(":");
      if (b.length === 1) return { owner: l, name: p };
      const h = b.pop();
      for (const _ of [[...l.path, ...b], b]) {
        const g = c.get(_.map(encodeURIComponent).join("/").toLowerCase());
        if (g) return { owner: g, name: h };
      }
      throw Error("Unknown hierarchical reference: " + p);
    };
    const i = f(t.rootId, [], G(), G(), G(), null, []), c = new Map(Object.values(n).map((l) => [l.id.toLowerCase(), l])), d = Object.assign(G(), ...Object.values(n).map((l) => l.models)), a = (l) => d[l] || Object.entries(d).find(([p]) => p.startsWith(l + "."))?.[1];
    for (const l of Object.values(n)) for (const p of l.devices) {
      const b = t.scopes[l.scopeId].devices.find((g) => g.name === p.localName), h = (g) => {
        const m = y(l, g);
        return r.get(m.owner.id)(m.name);
      }, _ = (g, m = "", I = "") => {
        const N = y(l, g), L = N.owner.devices.find((C) => C.localName.toLowerCase() === N.name.toLowerCase());
        if (m.toLowerCase() === "ix") {
          const C = N.owner.ports.find((S, x) => S.name.toLowerCase() === N.name.toLowerCase() || String(x + 1) === N.name);
          if (C) return N.owner.id + ":" + C.name;
        }
        if (!L) {
          if (I) throw Error(p.name + ": referenced " + I + " device " + g + " was not found.");
          return re(N.owner.path, N.name);
        }
        if (I && L.kind !== I) throw Error(p.name + ": " + g + " must be a " + I + " device.");
        return L.name;
      };
      if (p.value = ye(b.value, l.params, h, _), b.model && (p.value = p.value.replace(b.model, p.model)), p.kind === "M" && Object.keys(p.terminals).length === 3) {
        let g = a(p.model), m = !1;
        const I = /* @__PURE__ */ new Set();
        for (; g?.type === "VDMOS" && !I.has(g.name); ) {
          I.add(g.name);
          const N = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(g.raw);
          if (N) {
            m = N[1] === void 0 || Number(ue(N[1], g.parameters)) >= 0.5;
            break;
          }
          const L = g.name.includes("/") ? g.name.slice(0, g.name.lastIndexOf("/") + 1) : "";
          g = a(L + (g.baseModel || "").toLowerCase()) || a((g.baseModel || "").toLowerCase());
        }
        I.size && (p.type = "spice_" + (m ? "pmos3" : "nmos3"));
      }
      p.controlSources = (b.controlSources || []).map((g) => _(g, "", "V")), p.controlSource = p.controlSources[0] || "", p.coupledInductors = (b.coupledInductors || []).map((g) => _(g, "", "L"));
      for (const g of /* @__PURE__ */ new Set([...b.controlSources || [], ...b.coupledInductors || []])) {
        const m = g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        p.value = p.value.replace(new RegExp("(?<![\\w./%])" + m + "(?![\\w.$])", "g"), () => _(g));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: i, contexts: n };
  } catch (i) {
    throw i.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: i.message }], i;
  }
}
function ie(t) {
  return [...t.devices, ...t.children.flatMap(ie)];
}
function le(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function Ie(t, e = {}) {
  const n = new Map(t.components.map((s) => [s.name, s])), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), u = [], f = (s, E) => JSON.stringify([s, E].sort()), i = (s) => e[s]?.potential !== null && e[s]?.potential !== void 0;
  for (const s of t.components) {
    for (const [D, j] of Object.entries(s.terminals))
      r.has(j) || r.set(j, []), r.get(j).push({ device: s.name, pin: D });
    if (s.kind === "R") {
      const D = Object.values(s.terminals);
      if (D.length === 2 && D[0] !== D[1]) {
        const j = f(...D);
        o.has(j) || o.set(j, []), o.get(j).push(s);
      }
    }
    const E = s.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(s.kind) ? "fet" : null, O = E === "bjt" ? /_(npn|pnp)$/.exec(s.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(s.type)?.[1];
    if (!E || !O) continue;
    const Q = s.terminals, P = Q[E === "bjt" ? "B" : "G"], V = Q[E === "bjt" ? "C" : "D"], $ = Q[E === "bjt" ? "E" : "S"];
    [P, V, $].some((D) => D === void 0) || P === $ || V === $ || u.push({ id: s.name, family: E, polarity: O, control: P, drain: V, source: $, body: s.kind === "M" ? Q.B : void 0 });
  }
  const c = [], d = /* @__PURE__ */ new Set(), a = (s, E, O, Q, P, V = "basic", $ = [], D = "high") => {
    const j = [.../* @__PURE__ */ new Set([...E, ...$])], z = JSON.stringify([s, V, [...j].sort()]);
    d.has(z) || (d.add(z), c.push({ id: "motif" + c.length, kind: s, variant: V, transistors: E, members: j, roles: O, nets: Q, evidence: P, confidence: D }));
  }, y = (s, E) => s.family === E.family && s.polarity === E.polarity, l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), h = new Map(u.map((s) => [s.id, s])), _ = (s, E, O) => {
    s.has(E) || s.set(E, []), s.get(E).push(O);
  }, g = (s, E) => JSON.stringify([s.family, s.polarity, E]);
  for (const s of u)
    _(l, g(s, s.control), s), _(p, g(s, s.source), s), s.family === "bjt" && (r.get(s.source) || []).some((E) => {
      const O = h.get(E.device);
      return O && O.family === "bjt" && !y(s, O) && O.source === s.source;
    }) && _(b, g(s, s.drain), s);
  const m = (s) => [{ node: s.source, resistor: null }, ...(r.get(s.source) || []).flatMap((E) => {
    const O = n.get(E.device);
    if (O.kind !== "R") return [];
    const Q = Object.values(O.terminals).find((P) => P !== s.source);
    return Q !== void 0 && Q !== s.control && Q !== s.drain ? [{ node: Q, resistor: O.name }] : [];
  })];
  for (const s of u) s.control === s.drain && a("diode-connected", [s.id], { reference: s.id }, { control: s.control, return: s.source }, ["control-drain-short", s.family]);
  for (const s of u) {
    const E = l.get(g(s, s.control));
    if (E.filter((D) => D.control === D.drain).length > 1) continue;
    let O = null;
    if (s.control !== s.drain && s.family === "bjt" && (O = (l.get(g(s, s.drain)) || []).find((D) => D.id !== s.id && y(D, s) && D.control === s.drain && D.source === s.control && i(D.drain))), s.control !== s.drain && !O) continue;
    const Q = m(s), P = [];
    let V = null, $ = [];
    for (const D of E) {
      if (D.id === s.id || D.id === O?.id || D.drain === s.drain || D.drain === D.control) continue;
      const j = Q.flatMap((z) => m(D).filter((v) => z.node === v.node).map((v) => ({ node: z.node, rs: [z.resistor, v.resistor].filter(Boolean) }))).find((z) => V === null || z.node === V);
      j && (V = j.node, P.push(D.id), $.push(...j.rs));
    }
    if (P.length) {
      const D = P.every((j) => h.get(j).body === s.body);
      a("current-mirror", [s.id, ...P, ...O ? [O.id] : []], { reference: s.id, outputs: P, ...O ? { helper: O.id } : {} }, { control: s.control, return: V }, ["same-polarity", "shared-control", O ? "emitter-follower-reference" : "diode-reference", $.length ? "resistive-common-return" : "shared-return", D ? "compatible-bodies" : "different-body-connections"], O ? "assisted" : $.length ? "degenerated" : "basic", [...$, ...O ? [O.id] : []], D ? "high" : "medium");
    }
  }
  const I = [], N = /* @__PURE__ */ new Set(), L = (s, E) => {
    const O = JSON.stringify([s.id, E.id].sort());
    N.has(O) || (N.add(O), I.push([s, E]));
  };
  for (const s of p.values()) if (!i(s[0].source)) {
    const E = s.filter((O) => O.control !== O.drain);
    E.length === 2 ? L(...E) : E.length > 2 && new Set(E.map((O) => O.control)).size > 1 && a("differential-pair", E.map((O) => O.id), { inputs: E.map((O) => O.id) }, { tail: E[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const s of b.values()) for (let E = 0; E < s.length; E++) for (let O = E + 1; O < s.length; O++) L(s[E], s[O]);
  for (const [s, E] of I) {
    if (s.control === E.control || s.control === s.drain || E.control === E.drain) continue;
    if (s.source === E.source && s.drain !== E.drain && !i(s.source)) {
      const P = (r.get(s.source) || []).some(($) => $.device !== s.id && $.device !== E.id), V = p.get(g(s, s.source)).length === 2;
      a("differential-pair", [s.id, E.id], { inputs: [s.id, E.id] }, { tail: s.source }, ["same-polarity", "distinct-controls", "shared-tail", P ? "tail-bias-connection" : "unbiased-tail", V ? "two-input-tail" : "multi-input-tail"], "basic", [], P && V && s.body === E.body ? "high" : "medium");
    }
    if (s.family !== "bjt" || s.drain !== E.drain || s.source === E.source) continue;
    const O = u.filter((P) => P.family === "bjt" && P.polarity !== s.polarity && P.source === s.source), Q = u.filter((P) => P.family === "bjt" && P.polarity !== s.polarity && P.source === E.source);
    for (const P of O) for (const V of Q) P.id !== V.id && P.control === V.control && P.drain !== V.drain && P.control !== P.drain && V.control !== V.drain && a("differential-pair", [s.id, E.id, P.id, V.id], { inputs: [s.id, E.id], commonBase: [P.id, V.id] }, { inputCollectors: s.drain, bias: P.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const s of u) if (s.family === "bjt" && s.control !== s.drain) {
    const E = o.get(f(s.drain, s.control)) || [], O = o.get(f(s.control, s.source)) || [];
    E.length === 1 && O.length === 1 && a("vbe-multiplier", [s.id], { transistor: s.id, collectorResistor: E[0].name, emitterResistor: O[0].name }, { control: s.control, collector: s.drain, emitter: s.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [E[0].name, O[0].name]);
  }
  const C = u.filter((s) => s.family === "bjt"), S = /* @__PURE__ */ new Map();
  for (const s of C) _(S, s.control, s);
  const x = (s) => (r.get(s) || []).filter((E) => h.has(E.device));
  for (const s of C) if (s.control !== s.drain) {
    for (const E of S.get(s.source) || []) if (E.id !== s.id && y(s, E) && E.drain === s.control && E.source !== s.drain) {
      const O = o.get(f(s.source, E.source)) || [];
      O.length === 1 && a("current-limit-pair", [s.id, E.id], { driver: s.id, output: E.id, senseResistor: O[0].name }, { sense: s.source, drive: s.control, output: E.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [O[0].name]);
    }
    for (const E of S.get(s.source) || []) E.id !== s.id && y(s, E) && E.control !== E.drain && s.drain === E.drain && E.source !== s.control && a("darlington-pair", [s.id, E.id], { driver: s.id, output: E.id }, { link: s.source, collector: s.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (S.get(s.source) || []).length === 1 ? "high" : "medium");
    for (const E of S.get(s.drain) || []) E.id !== s.id && !y(s, E) && E.control !== E.drain && s.source === E.drain && E.source !== s.control && x(s.drain).length === 2 && a("sziklai-pair", [s.id, E.id], { driver: s.id, output: E.id }, { link: s.drain, feedback: s.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const E of r.get(s.drain) || []) {
      const O = h.get(E.device);
      !O || O.family !== "bjt" || O.id === s.id || !y(s, O) || O.source !== s.drain || i(s.drain) || O.control === s.control || O.control === O.drain || O.drain === s.source || x(s.drain).length !== 2 || a("cascode-pair", [s.id, O.id], { driver: s.id, output: O.id }, { link: s.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const s of C.filter((E) => E.polarity === "npn" && i(E.drain))) for (const E of C.filter((O) => O.polarity === "pnp" && i(O.drain))) {
    if (e[s.drain].potential <= e[E.drain].potential) continue;
    const O = m(s).flatMap((Q) => m(E).filter((P) => Q.node === P.node && !i(Q.node)).map((P) => ({ node: Q.node, rs: [Q.resistor, P.resistor].filter(Boolean) })))[0];
    O && a("push-pull-pair", [s.id, E.id], { upper: s.id, lower: E.id }, { output: O.node }, ["complementary-polarity", "ordered-collector-supplies", O.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", O.rs);
  }
  return c;
}
function ve(t, e, n = (r) => r) {
  const r = (o) => Array.isArray(o) ? o.map(e) : e(o);
  return t.map((o) => ({ ...o, members: o.members.map(e), transistors: o.transistors.map(e), roles: Object.fromEntries(Object.entries(o.roles).map(([u, f]) => [u, r(f)])), nets: Object.fromEntries(Object.entries(o.nets).map(([u, f]) => [u, n(f)])) }));
}
function Lt(t, e, n) {
  const r = [], o = /* @__PURE__ */ new Set(), u = new Map(t.components.map((f) => [f.name, f]));
  for (const f of n) {
    if (new Set(f.members).size !== f.members.length) throw Error("Duplicate @layout pair member.");
    const i = f.members.map((l) => u.get(l));
    if (i.some((l) => !l)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[f.kind], d = f.kind === "differential" && i.length === 2 ? t.components.filter((l) => !f.members.includes(l.name) && Object.values(l.terminals).includes(i[0].terminals.E ?? i[0].terminals.S)) : [], a = Ie({ ...t, components: [...i, ...d] }, e), y = a.find((l) => l.kind === c && l.confidence === "high" && f.members.every((p) => l.members.includes(p)));
    if (!y) throw Error("Invalid @layout pair " + f.kind + " { " + f.members.join(" ") + " }: electrical structure does not match.");
    for (const l of a.filter((p) => p === y || p.kind === "diode-connected" && p.members.every((b) => y.members.includes(b)))) {
      const p = JSON.stringify([l.kind, [...l.members].sort()]);
      o.has(p) || (o.add(p), r.push({ ...l, id: "motif" + r.length, origin: "annotation" }));
    }
  }
  return r;
}
function kt(t, e, n = Ie(t, e)) {
  const r = /* @__PURE__ */ new Map(), o = t.components.filter((l) => l.kind === "R"), u = t.components.filter((l) => l.kind === "Q"), f = new Map(t.components.map((l) => [l.name, l])), i = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), d = (l) => Object.values(l.terminals), a = (l, p, b) => {
    l && r.set(l.name, { reverse: d(l)[0] !== p, reason: b });
  };
  for (const l of u) {
    const { C: p, B: b, E: h } = l.terminals, _ = l.type.endsWith("pnp"), g = l.type.endsWith("npn");
    !_ && !g || (i.has(h) || i.set(h, []), i.get(h).push(l), p === b && e[h]?.potential !== null && e[h]?.potential !== void 0 && c.set(p, { potential: e[h].potential }));
  }
  for (const l of n) if (l.kind === "vbe-multiplier" && l.confidence === "high") {
    const p = f.get(l.roles.transistor), b = p.type.endsWith("pnp"), h = f.get(b ? l.roles.emitterResistor : l.roles.collectorResistor), _ = f.get(b ? l.roles.collectorResistor : l.roles.emitterResistor);
    a(h, p.terminals[b ? "E" : "C"], "recognized VBE multiplier"), a(_, p.terminals.B, "recognized VBE multiplier");
  }
  for (const l of o) {
    const [p, b] = d(l), h = c.get(p), _ = c.get(b);
    h && _ && h.potential !== _.potential && a(l, h.potential > _.potential ? p : b, "diode-connected bias reference");
  }
  const y = /* @__PURE__ */ new Map();
  for (const l of o) {
    const p = d(l);
    if (!p.some((b) => e[b]?.potential !== null && e[b]?.potential !== void 0))
      for (const b of p)
        y.has(b) || y.set(b, []), y.get(b).push(l);
  }
  for (const [l, p] of y)
    if (!(p.length > 12))
      for (const b of p) for (const h of p) {
        if (b === h) continue;
        const _ = d(b).find((N) => N !== l), g = d(h).find((N) => N !== l), m = i.get(_)?.find((N) => N.type.endsWith("npn")), I = i.get(g)?.find((N) => N.type.endsWith("pnp"));
        m && I && (a(b, _, "complementary emitter output"), a(h, l, "complementary emitter output"));
      }
  return r;
}
function At(t) {
  const e = t.components.filter((u) => u.kind === "Q"), n = /* @__PURE__ */ new Map(), r = new Set(t.components.filter((u) => u.kind === "R").map((u) => Object.values(u.terminals).sort().join("|"))), o = /* @__PURE__ */ new Set();
  for (const u of e) {
    const f = u.terminals.E;
    n.has(f) || n.set(f, []), n.get(f).push(u);
  }
  for (const u of e) {
    const { B: f, C: i, E: c } = u.terminals;
    if (f === c || !r.has([f, c].sort().join("|"))) continue;
    const d = n.get(f) || [];
    if (!(d.length > 16))
      for (const a of d) {
        if (a === u) continue;
        if (a.terminals.B === i) {
          o.add(u.name);
          break;
        }
        const y = n.get(a.terminals.B) || [];
        if (y.length <= 16 && y.some((l) => l !== u && l !== a && l.terminals.B === i)) {
          o.add(u.name);
          break;
        }
      }
  }
  return o;
}
const _e = 18;
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
const fe = (t) => ["pwr", "ret", "bias"].includes(t), Pt = (t) => String(t).split("/").at(-1).toLowerCase(), Ge = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[Pt(t)] || "unknown", Ue = (t) => {
  const e = Ne(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Ge(t);
};
function Tt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], r = (f, i, c) => {
    e.has(f) || e.set(f, []), e.get(f).push({ node: i, delta: c });
  };
  for (const f of t)
    if (f.kind === "V")
      try {
        let i = f.value.trim();
        const c = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(i);
        if (c && Number(ue(c[1], f.parameters)) !== 0 || (i = i.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(i))) continue;
        const d = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(i);
        if (!d) continue;
        const a = ue(d[1], f.parameters);
        if (typeof a != "number" || !Number.isFinite(a)) continue;
        r(f.terminals["-"], f.terminals["+"], a), r(f.terminals["+"], f.terminals["-"], -a);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
  for (const f of ["0", ...e.keys()]) {
    if (u.has(f)) continue;
    const i = /* @__PURE__ */ new Map([[f, 0]]), c = [f];
    u.add(f);
    let d = !1;
    for (let a = 0; a < c.length; a++) for (const y of e.get(c[a]) || []) {
      const l = i.get(c[a]) + y.delta;
      i.has(y.node) ? Math.abs(i.get(y.node) - l) > 1e-8 * Math.max(1, Math.abs(l)) && (d = !0) : (i.set(y.node, l), u.add(y.node), c.push(y.node));
    }
    d && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [a, y] of i) o[a] = { value: y, reference: f, known: f === "0" && !d, consistent: !d };
  }
  return { nodes: o, diagnostics: n };
}
function Ut(t, e, n = null) {
  const r = Tt(ie(e.localScope ? t.contexts[e.focus] : t.root)), o = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const y = Ne(a.name), l = Ge(a.name);
    o[a.name] = { role: y !== "unknown" ? y : l, roleSource: y !== "unknown" ? "node-name" : l !== "unknown" ? "legacy-rail-name" : "unknown", potential: r.nodes[a.name]?.known ? r.nodes[a.name].value : null };
  }
  if (e.localScope) for (const a of e.interfaceBindings) {
    const y = o[a.local], l = Ue(a.port);
    y && y.potential === null && ["pwr", "ret"].includes(l) && (y.potential = l === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(a.port) ? 0 : -1, y.potentialSource = "symbolic-port-order");
  }
  const f = n?.pairs?.length ? Lt(e, o, n.pairs) : Ie(e, o), i = kt(e, o, f), c = At(e), d = (a, y, l) => {
    const p = { role: o[l].role, roleSource: o[l].roleSource }, b = a.block?.ports.find((g) => g.pin === y);
    if (b?.implicit || !a.block && !a.synthetic) return p;
    const h = a.synthetic ? a.value : b?.name || b?.label, _ = Ue(h);
    return _ !== "unknown" ? { role: _, roleSource: Ne(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : fe(p.role) ? { ...p, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const y = Object.fromEntries(Object.entries(a.terminals).map(([x, s]) => [x, { ...o[s], ...d(a, x, s) }])), l = Object.values(y), p = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), b = p && !i.has(a.name) && l.length === 2 && l.every((x) => !fe(x.role) && (x.potential === null || x.role !== "unknown")), h = a.terminals["+"], _ = a.terminals["-"], g = [h, _].filter((x) => x && x !== "0"), m = a.kind === "V" && g.some((x) => fe(o[x]?.role)) && !g.some((x) => ["in", "out", "io", "fb"].includes(o[x]?.role)) && [h, _].every((x) => r.nodes[x]?.known), I = h === "0" ? _ : h, N = Object.keys(a.terminals), L = (x) => fe(x.role) ? x.potential !== null ? x.potential > 0 ? "high" : "low" : x.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    N.length === 2 && (a.kind === "V" && l.every((x) => x.potential !== null) ? C = l[0].potential < l[1].potential : a.terminals[N[0]] === "0" ? C = !0 : a.terminals[N[1]] === "0" ? C = !1 : l.every((x) => x.potential !== null) ? C = l[0].potential < l[1].potential : C = L(l[0]) === "low" || L(l[1]) === "high" && L(l[0]) === "signal"), i.has(a.name) && (C = i.get(a.name).reverse);
    const S = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    u[a.name] = { version: _e, kind: a.kind, polarity: a.type.endsWith("pnp") ? "p" : a.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(a.name), orientationReason: i.get(a.name)?.reason || null, owner: S.includes("/") ? S.slice(0, S.lastIndexOf("/")) : "", passive: p, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !p, ports: y, horizontal: b, orientation: b ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: N.length === 2 && (p || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!m, voltage: m ? r.nodes[I].value : null };
  }
  return { version: _e, nodes: o, cells: u, motifs: f, diagnostics: r.diagnostics };
}
function Fe(t, e) {
  const n = e.ports.map((o, u) => ({ pin: "P" + u, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), r = new Set(ie(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const u = we([], o);
    r.has(u) && !n.some((f) => f.node === u) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: u, implicit: !0 });
  }
  return n;
}
function Mt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: r = "" } = {}) {
  const o = t, u = t.contexts[r];
  if (!u) throw Error("Unknown instance: " + r);
  r && (t = Ce(t.ir, { isolate: r }));
  const f = t.contexts[r];
  if (!f) throw Error("Unknown instance: " + r);
  const i = [], c = [];
  function d(b) {
    c.push(...Object.values(b.nodes), ...b.ports.map((_) => _.node));
    const h = [...b.devices.map((_) => ({ line: _.line, device: _ })), ...b.children.map((_) => ({ line: _.line, child: _ }))].sort((_, g) => _.line - g.line);
    for (const _ of h) {
      if (_.device) {
        const N = _.device;
        i.push({ ...N, layoutLabel: [...b.path.slice(f.path.length), N.localName].join("/") });
        continue;
      }
      const g = _.child;
      if (e === "flat" || n.has(g.id)) {
        d(g);
        continue;
      }
      const m = Fe(t, g), I = G();
      m.forEach((N) => {
        I[N.pin] = N.node;
      }), i.push({ name: g.id, kind: "X", type: "spice_subckt", terminals: I, value: g.definition, raw: g.raw, line: g.line, instanceId: g.id, layoutLabel: g.path.slice(f.path.length).join("/"), block: { definitionId: g.scopeId, ports: m, parameters: g.params } });
    }
  }
  d(f);
  for (const [b, h] of f.ports.entries()) i.push({ name: "@port/" + r + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (i.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const a = Object.assign(G(), ...Object.values(t.contexts).map((b) => b.models)), y = { title: r || t.ir.title, components: i, nodes: bt(i, c), models: a, diagnostics: t.ir.diagnostics, mode: e, focus: r, localScope: !!r };
  y.interfaceBindings = f.ports.map((b, h) => ({ port: b.name, local: b.node, parent: u.ports[h].node }));
  const l = /* @__PURE__ */ new Map();
  for (const b of u.ports)
    l.has(b.node) || l.set(b.node, []), l.get(b.node).push(b.name);
  y.interfaceAliases = [...l].filter(([, b]) => b.length > 1).map(([b, h]) => ({ node: b, ports: h })), y.topology = Qt(o, y);
  const p = ht(t, y);
  return y.layout = Ut(t, y, p), y.layout.description = p, y;
}
function Qt(t, e) {
  const n = ie(t.contexts[e.focus]);
  e.localScope && (t = Ce(t.ir, { isolate: e.focus }));
  const r = [], o = /* @__PURE__ */ new Set();
  for (const i of e.components)
    if (!i.synthetic)
      if (i.kind === "X") {
        const c = t.contexts[i.instanceId];
        if (!c) throw Error("Projection contains an unknown block.");
        const d = Fe(t, c);
        if (JSON.stringify(Object.entries(i.terminals)) !== JSON.stringify(d.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + i.name);
        r.push(...ie(c));
      } else r.push(i);
  for (const i of r) {
    if (o.has(i.name)) throw Error("Projection duplicates " + i.name);
    o.add(i.name);
  }
  const u = le(r), f = ie(t.contexts[e.focus]);
  if (u !== le(f)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const i = new Map(e.interfaceBindings.map((a) => [a.local, a.parent])), c = (a) => i.get(a) ?? a, d = r.map((a) => ({ ...a, terminals: Object.fromEntries(Object.entries(a.terminals).map(([y, l]) => [y, c(l)])), value: ye(a.value, {}, c, (y) => y) }));
    if (le(d) !== le(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: r.length, signature: u, boundSignature: le(n), boundaryVerified: !0 };
}
function Dt(t) {
  const e = G(), n = G();
  for (const r of t.components) {
    const o = G(), u = G();
    for (const [f, i] of Object.entries(r.terminals))
      o[f] = [t.nodes[i].bit], u[f] = "input";
    e[r.name] = { type: r.type, port_directions: u, connections: o, parameters: {}, attributes: { ref: r.name, displayRef: r.layoutLabel || r.name, value: r.value, spice: r.raw } }, e[r.name].spiceLayout = t.layout?.cells[r.name], r.block && (e[r.name].spiceBlock = { ports: r.block.ports.map((f) => ({ pin: f.pin, label: f.label })), definitionId: r.block.definitionId }), (r.type === "spice_device" || r.type === "spice_coupling") && (e[r.name].spiceSymbol = { label: r.symbol || r.kind, ports: Object.keys(r.terminals).map((f, i) => ({ pin: f, label: r.pinLabels?.[i] || f })), references: r.coupledInductors?.length ? r.coupledInductors : r.controlSources || [] });
  }
  for (const r of Object.values(t.nodes)) n[r.name] = { hide_name: 0, bits: [r.bit], attributes: {} };
  if (t.nodes[0]) {
    let r = "__ground";
    for (; Object.hasOwn(e, r); ) r += "_";
    e[r] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: ve(t.layout?.motifs || [], (r) => r, (r) => t.nodes[r].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Vt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = {}, o = (d) => (n.has(d) || n.set(d, n.size + 2), n.get(d));
  Object.entries(t.modules.circuit.cells).forEach(([d, a], y) => {
    const l = "c" + y;
    e.set(l, d);
    const p = Object.fromEntries(Object.entries(a.connections).map(([b, h]) => [b, h.map(o)]));
    r[l] = { type: a.type, connections: p, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (r[l].spiceBlock = a.spiceBlock), a.spiceSymbol && (r[l].spiceSymbol = a.spiceSymbol), a.spiceLayout && (r[l].spiceLayout = a.spiceLayout);
  });
  const u = new Map([...e].map(([d, a]) => [a, d])), f = t.modules.circuit.spiceLayoutDescription, i = f ? { ...f, faces: (f.faces || []).map((d) => ({ ...d, device: u.get(d.device) })), pairs: (f.pairs || []).map((d) => ({ ...d, members: d.members.map((a) => u.get(a)) })), groups: f.groups.map((d) => ({ ...d, members: d.members.map((a) => a.cell ? { ...a, cell: u.get(a.cell) } : a) })), relations: f.relations.map((d) => ({ ...d, a: u.get(d.a) || d.a, b: u.get(d.b) || d.b })) } : null, c = ve(t.modules.circuit.spiceMotifs || [], (d) => u.get(d), o);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: r, spiceMotifs: c, spiceLayoutDescription: i } } }, ids: e, bits: new Map([...n].map(([d, a]) => [a, d])) };
}
const Z = /* @__PURE__ */ new Map();
async function Bt(t, e) {
  const n = Vt(t), r = JSON.stringify([n.netlist, e]);
  let o = Z.get(r);
  o ? (Z.delete(r), Z.set(r, o)) : (o = await jt(n.netlist, e), o.svg.length < 1e6 && (Z.set(r, o), Z.size > 20 && Z.delete(Z.keys().next().value)));
  const u = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of u.querySelectorAll("[id],[class]")) {
    const d = c.getAttribute("id");
    d?.startsWith("cell_") && n.ids.has(d.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(d.slice(5)));
    const a = c.getAttribute("class");
    a && c.setAttribute("class", a.split(/\s+/).map((y) => y.startsWith("cell_") && n.ids.has(y.slice(5)) ? "cell_" + n.ids.get(y.slice(5)) : /^net_\d+$/.test(y) && n.bits.has(Number(y.slice(4))) ? "net_" + n.bits.get(Number(y.slice(4))) : y).join(" "));
  }
  const f = o.drawing ? structuredClone(o.drawing) : null, i = u.querySelector("#spice-layout-report");
  if (i) {
    const c = JSON.parse(i.textContent), d = (a) => n.ids.get(a) || a;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(d), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(d), c.recognizedMotifs = ve(c.recognizedMotifs || [], d, (a) => n.bits.get(a) ?? a), c.inputAttachments = (c.inputAttachments || []).map(d), c.mirroredInputPorts = (c.mirroredInputPorts || []).map(d);
    for (const a of [...c.flippedPairs || [], ...c.pairOrientationTrials || []]) a.members = a.members.map(d);
    for (const a of c.pairCompactions || [])
      a.members = a.members.map(d), a.moved = d(a.moved);
    for (const a of c.pairConstraints || []) a.members = a.members.map(d);
    for (const a of c.pairProximity || []) a.members = a.members.map(d);
    for (const a of c.motifMeasurements || [])
      a.members = a.members.map(d), a.interlopers && (a.interlopers = a.interlopers.map(d));
    for (const a of c.voltageRails || []) a.bit !== void 0 && (a.bit = n.bits.get(a.bit) ?? a.bit);
    i.textContent = JSON.stringify(c);
  }
  if (f) {
    for (const c of f.components) {
      c.id = n.ids.get(c.id) || c.id;
      for (const d of c.ports) d.bit = n.bits.get(d.bit) ?? d.bit;
    }
    for (const c of f.segments) c.bit = n.bits.get(c.bit) ?? c.bit;
  }
  return { svg: new XMLSerializer().serializeToString(u.documentElement), drawing: f };
}
function jt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DQwUzxhK.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((r, o) => {
    const u = (c, d) => {
      clearTimeout(i), n.terminate(), c ? o(Error(c)) : r(d);
    }, f = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, i = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), f);
    n.onmessage = ({ data: c }) => u(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => u(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Gt = `* RLC low-pass filter
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
`, Ft = `* Voltage-divider biased common-emitter amplifier.
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
`, $t = `* Common-collector voltage follower; independently chosen example values.
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
`, Wt = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, Ht = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, pe = {
  filter: { source: Gt, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Ft, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: $t, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: Wt, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: Ht, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function zt(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Me(t) {
  return zt(await t.arrayBuffer());
}
const $e = [
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
].flat(), Oe = "#292b29", Qe = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => $e[e * 9 + t]))])], De = (t) => /^#[\da-f]{6}$/i.test(t), Ve = "spice-node-colors-v1";
function Xt(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class qt {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = Xt(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, Qe[this.assigned.size % Qe.length]), this.assigned.get(e)) : Oe;
  }
  set(e, n) {
    if (!De(n)) throw Error("Invalid node color.");
    for (const r of e) this.manual.set(r, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((r) => Array.isArray(r) && typeof r[0] == "string" && De(r[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Kt(t, e, n) {
  const r = new Map(e.map((o) => [o.name, n.color(o.name)]));
  for (const o of t.children) if (["line", "path", "polyline", "circle"].includes(o.localName) && o.hasAttribute("data-net")) {
    const u = r.get(o.getAttribute("data-net"));
    if (!u) continue;
    o.style.setProperty("stroke", u, "important"), o.localName === "circle" && o.style.setProperty("fill", u, "important");
  }
}
function Yt(t, e) {
  const n = new qt(), r = /* @__PURE__ */ new Set();
  let o = [], u = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Ve) || "null"));
  } catch {
  }
  const f = () => {
    try {
      sessionStorage.setItem(Ve, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, i = () => {
    const l = t("node-search").value.trim().toLowerCase();
    return o.filter((p) => !l || [p.name, p.displayName, ...p.terminals.map((b) => b.component + "." + b.pin)].some((b) => b.toLowerCase().includes(l)));
  };
  function c() {
    const l = i(), p = l.filter((b) => r.has(b.name)).length;
    t("node-count").textContent = `${l.length} / ${o.length} nodes · ${r.size} selected`, t("node-all").checked = !!l.length && p === l.length, t("node-all").indeterminate = p > 0 && p < l.length, t("node-auto").checked = n.auto;
    for (const b of ["node-apply", "node-clear"]) t(b).disabled = !u || !r.size;
    t("node-all").disabled = !u || !l.length;
  }
  function d() {
    t("nets").replaceChildren(...i().map((l) => {
      const p = document.createElement("tr");
      p.dataset.node = l.name;
      const b = document.createElement("td"), h = document.createElement("input");
      h.type = "checkbox", h.checked = r.has(l.name), h.disabled = !u, h.setAttribute("aria-label", "Select node " + l.displayName), h.onchange = () => {
        h.checked ? r.add(l.name) : r.delete(l.name), c();
      }, b.append(h);
      const _ = document.createElement("td");
      _.textContent = l.displayName;
      const g = document.createElement("td"), m = document.createElement("input");
      m.type = "color", m.value = n.color(l.name), m.disabled = !u, m.setAttribute("aria-label", "Wire color for " + l.displayName), m.onchange = () => {
        n.set([l.name], m.value), a();
      }, g.append(m);
      const I = document.createElement("td");
      return I.textContent = l.terminals.map((N) => N.component + "." + N.pin).join(", "), p.append(b, _, g, I), p;
    })), c();
  }
  function a() {
    for (const l of o) n.color(l.name);
    d(), f(), e(n, o);
  }
  t("node-search").oninput = d, t("node-all").onchange = () => {
    for (const l of i()) t("node-all").checked ? r.add(l.name) : r.delete(l.name);
    d();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, a();
  }, t("node-apply").onclick = () => {
    n.set(r, t("node-color").value), a();
  }, t("node-clear").onclick = () => {
    n.set(r, Oe), a();
  }, t("node-reset").onclick = () => {
    n.reset(), a();
  }, t("node-swatches").replaceChildren(...$e.map((l) => {
    const p = document.createElement("button");
    return p.type = "button", p.style.backgroundColor = l, p.title = l, p.setAttribute("aria-label", "Apply palette color " + l), p.onclick = () => {
      r.size && (t("node-color").value = l, n.set(r, l), a());
    }, p;
  }));
  function y(l) {
    u = l;
    for (const p of t("node-panel").querySelectorAll("input,button")) p.disabled = !u;
    c();
  }
  return { setCircuit(l, p) {
    const b = n.sourceId;
    n.setSource(p), b !== n.sourceId && r.clear(), o = Object.values(l?.nodes || {});
    const h = new Set(o.map((_) => _.name));
    for (const _ of r) h.has(_) || r.delete(_);
    for (const _ of o) n.color(_.name);
    u = !!l, d(), y(u), f(), e(n, o);
  }, setEnabled: y };
}
const Be = pe.filter.source, A = (t) => document.getElementById("spice-" + t), de = A("app");
if (de) {
  let S = function(v) {
    const k = A("example-info");
    if (k && (k.replaceChildren(), !!v && (k.append(document.createTextNode(v.description + " ")), v.url))) {
      const U = document.createElement("a");
      U.href = v.url, U.target = "_blank", U.rel = "noopener noreferrer", U.textContent = v.reference, k.append(U);
    }
  }, x = function() {
    C.setEnabled(!1), o = null, u = null, i = "", N(), S(Object.values(pe).find((v) => v.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, s = function(v) {
    r.replaceChildren();
    for (const { severity: k, line: U, message: M, source: T } of v) {
      const F = document.createElement("li");
      F.className = k, F.textContent = `${k.toUpperCase()}${T && T !== "input.cir" ? " · " + T : ""}${U ? " · line " + U : ""}: ${M}`, r.append(F);
    }
    A("messages").open = v.some((k) => k.severity !== "info"), A("message-count").textContent = `${v.length} message${v.length === 1 ? "" : "s"}`;
  }, E = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${h.x} ${h.y} ${h.w} ${h.h}`), A("zoom-level").textContent = Math.round(_.w / h.w * 100) + "%";
  }, O = function(v, k = h.x + h.w / 2, U = h.y + h.h / 2) {
    if (!e.querySelector("svg")) return;
    const M = Math.max(0.05, Math.min(10, h.w * v / _.w)) * _.w / h.w;
    h = { x: k + (h.x - k) * M, y: U + (h.y - U) * M, w: h.w * M, h: h.h * M }, E();
  }, P = function(v) {
    const k = new URLSearchParams();
    v && k.set("instance", v);
    const U = k.toString();
    location.hash.slice(1) === U ? (l = v, j()) : location.hash = U;
  }, V = function() {
    l = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, $ = function() {
    const v = !!(p && p !== l && d?.contexts[p]);
    A("selection-actions").hidden = !v, A("open-instance").href = "#" + new URLSearchParams({ instance: p });
  }, D = function() {
    A("breadcrumbs").replaceChildren();
    const v = (U, M) => {
      const T = document.createElement("button");
      T.type = "button", T.textContent = U, T.onclick = () => P(M), T.disabled = M === l, A("breadcrumbs").append(T);
    };
    if (v("Top", ""), l) {
      const U = d.contexts[l].path;
      for (let M = 0; M < U.length; M++) v(U[M], U.slice(0, M + 1).map(encodeURIComponent).join("/"));
    }
    A("instances").replaceChildren();
    const k = (U, M) => {
      for (const T of U.children) {
        const F = document.createElement("div");
        F.className = "spice-instance-row", F.style.setProperty("--depth", Math.min(M, 8)), F.dataset.instance = T.id;
        const ee = document.createElement("a");
        ee.href = "#" + new URLSearchParams({ instance: T.id }), ee.textContent = T.name + " · " + T.definition, ee.title = "Open " + T.id + " as its own sheet";
        const te = document.createElement("span");
        if (te.className = "spice-help", te.textContent = Object.entries(T.params).map(([K, Y]) => K + "=" + Y).join(" · "), F.append(ee), te.textContent) {
          const K = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", K.append(Y, te), F.append(K);
        }
        A("instances").append(F), k(T, M + 1);
      }
    };
    k(d.contexts[l], 0), A("hierarchy-panel").hidden = !d.contexts[l].children.length, A("focus-title").textContent = l ? l + " / " + d.contexts[l].definition : "Top-level schematic", $();
  };
  const t = A("input"), e = A("preview"), n = A("status"), r = A("diagnostics");
  let o = null, u = null, f = !1, i = "", c, d, a, y = "", l = "", p = "", b = !1, h = { x: 0, y: 0, w: 1, h: 1 }, _ = { ...h }, g, m = !1, I = {};
  try {
    I = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  de.addEventListener("click", (v) => {
    b && v.target.closest('a[href^="#"]') && v.preventDefault();
  });
  const N = () => {
    A("copy").disabled = A("download").disabled = !i || b, A("download-asc").disabled = A("download-asc-bundle").disabled = !i || !o || b || f;
  }, L = () => ({ font: A("font").value, fontSize: Number(A("size").value), color: Oe, detailed: A("detailed").checked, conventional: A("conventional").checked }), C = Yt(A, (v, k) => {
    const U = e.querySelector("svg");
    if (!U) return;
    Kt(U, k, v);
    const M = U.cloneNode(!0);
    M.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), i = new XMLSerializer().serializeToString(M), A("source").value = i;
  });
  C.setEnabled(!1), t.value = Be;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || Be;
  } catch {
  }
  S(Object.values(pe).find((v) => v.source === t.value)), t.addEventListener("input", x);
  for (const v of ["font", "size", "detailed", "conventional"]) A(v).addEventListener("input", x);
  A("zoom-in").onclick = () => O(0.8), A("zoom-out").onclick = () => O(1.25), A("fit").onclick = () => {
    h = { ..._ }, E();
  };
  const Q = (v) => {
    const k = e.querySelector("svg");
    return k ? new DOMPoint(v.clientX, v.clientY).matrixTransform(k.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (v) => {
    const k = Q(v);
    k && (v.preventDefault(), O(v.deltaY > 0 ? 1.12 : 1 / 1.12, k.x, k.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (v) => {
    v.button !== 0 || !e.querySelector("svg") || (g = { start: Q(v), x: v.clientX, y: v.clientY, view: { ...h }, moved: !1 }, e.setPointerCapture(v.pointerId));
  }), e.addEventListener("pointermove", (v) => {
    if (!g) return;
    const k = Q(v);
    Math.hypot(v.clientX - g.x, v.clientY - g.y) > 4 && (g.moved = !0), h.x += g.start.x - k.x, h.y += g.start.y - k.y, E();
  }), e.addEventListener("pointerup", (v) => {
    if (!g) return;
    const k = g.moved;
    if (g = null, e.hasPointerCapture(v.pointerId) && e.releasePointerCapture(v.pointerId), !k) {
      const U = document.elementFromPoint(v.clientX, v.clientY)?.closest("[data-component]"), M = c?.components.find((T) => T.name === U?.dataset.component);
      M && (p = M.instanceId || "", A("selection").textContent = `${M.raw}
${Object.entries(M.terminals).map(([T, F]) => `${T} → ${F}`).join("   ")}`, M.kind === "X" ? P(M.instanceId) : $());
    }
  }), window.addEventListener("hashchange", () => {
    if (b) {
      m = !0;
      return;
    }
    V(), p = "", j();
  }), e.addEventListener("pointercancel", () => {
    g = null;
  }), e.addEventListener("keydown", (v) => {
    const k = v.target.closest("[data-instance]");
    if (k && (v.key === "Enter" || v.key === " ")) {
      v.preventDefault(), p = k.dataset.instance, P(p);
      return;
    }
    v.key === "+" || v.key === "=" ? O(0.8) : v.key === "-" ? O(1.25) : v.key.toLowerCase() === "f" ? (h = { ..._ }, E()) : v.key.startsWith("Arrow") && (v.preventDefault(), h.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[v.key] || 0) * h.w, h.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[v.key] || 0) * h.h, E());
  });
  async function j() {
    if (b) return;
    b = !0, C.setEnabled(!1), o = null, u = null, i = "", N(), A("generate").disabled = !0, t.readOnly = !0, A("file").disabled = !0, A("libraries").disabled = !0;
    for (const k of de.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) k.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let v = [];
    try {
      if (y !== t.value || !d) {
        if (a = gt(t.value, { files: I }), v = [...a.diagnostics], v.some((R) => R.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = Ce(a), y && y !== t.value ? (l = "", p = "", history.replaceState(null, "", location.pathname + location.search)) : V(), y = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (v = [...a.diagnostics], s(v), v.some((R) => R.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = Mt(d, { focus: l });
      for (const R of c.interfaceAliases) v.push({ severity: "info", message: `Instance boundary: ${R.ports.join(" = ")} share parent node ${R.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const k = Dt(c);
      L().conventional && v.push(...c.layout.diagnostics);
      const U = await Bt(k, L()), M = new DOMParser().parseFromString(U.svg, "image/svg+xml");
      if (M.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const T = M.documentElement, F = T.querySelector("#spice-layout-report");
      if (F) {
        c.layout.report = JSON.parse(F.textContent);
        const R = c.layout.report;
        if (v.push({ severity: "info", message: `Layout: compact signal flow; ${R.powerSourcesChecked} DC/ground symbols checked, ${R.powerOrderViolations} DC order preference(s) unmet. ${R.powerPass}. ${R.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), R.classicTemplateFallback && v.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), R.groundPlacement && v.push({ severity: "info", message: `Ground: ${R.groundPlacement}; ${R.straightenedGroundDrops || 0} return-path simplification(s).` }), R.explicitGroups && v.push({ severity: "info", message: `Layout comments: ${R.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), R.classicRails && v.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${R.railCount} shared voltage rails.` }), R.localClassicInstances?.length && v.push({ severity: "info", message: `${R.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), R.localClassicStages?.length && v.push({ severity: "info", message: `Classic transistor proximity active: ${R.localClassicStages.join(", ")}.` }), R.sharedClassicRails && v.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), R.mirroredTransistors?.length && v.push({ severity: "info", message: `Control-pin mirror choices: ${R.mirroredTransistors.join(", ")}.` }), R.recognizedMotifs?.length && v.push({ severity: "info", message: `Transistor structures: ${R.recognizedMotifs.map((B) => `${B.kind} (${B.members.join(", ")}; ${B.confidence})`).join("; ")}.` }), R.appliedMotifs?.length && v.push({ severity: "info", message: `Topology preferences applied to ${R.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), R.subnetFirstFallback && v.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + R.subnetFirstFallback }), R.pairCompactionFallback && v.push({ severity: "warning", message: "Pair proximity kept the original regions: " + R.pairCompactionFallback }), R.compoundPairFallback && v.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + R.compoundPairFallback }), R.pairConstraints?.length) {
          const B = R.pairConstraints.filter((q) => q.crossRegion && !q.compacted).length;
          v.push({ severity: "info", message: `${R.pairConstraints.length - B} adjacent transistor pair(s); ${B} cross-region mirror row constraint(s).` });
        }
        R.netShortcuts && v.push({ severity: "info", message: `${R.netShortcuts} safe straight net shortcut(s); ${R.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), R.sharedRailFallback && v.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${R.sharedRailFallback}.` });
        for (const B of R.localClassicFallbacks || []) B.stage && v.push({ severity: "info", message: `Classic stage ${B.stage} uses automatic layout: ${B.reason || "No unobstructed local template"}.` });
        R.geometricConnectivityVerified && v.push({ severity: "info", message: `Net geometry verified; ${R.cyclesRemoved} same-net loop(s) and ${R.leavesRemoved} unused wire branch(es) removed.` }), s(v);
      }
      if (T.localName !== "svg" || T.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const ee = Number(T.getAttribute("width")), te = Number(T.getAttribute("height"));
      _ = { x: -20, y: -20, w: ee + 40, h: te + 40 }, h = { ..._ }, T.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), T.setAttribute("width", String(_.w)), T.setAttribute("height", String(_.h)), T.setAttribute("role", "img"), T.setAttribute("aria-label", c.title || "SPICE schematic"), T.setAttribute("style", "background:white");
      for (const R of c.components) {
        const B = M.getElementById("cell_" + R.name);
        if (!B) throw Error("Renderer omitted component " + R.name);
        B.setAttribute("data-component", R.name), R.kind === "X" && (B.setAttribute("data-instance", R.instanceId), B.setAttribute("role", "button"), B.setAttribute("tabindex", "0"), B.setAttribute("aria-label", "Open " + R.name));
        const q = M.createElementNS(T.namespaceURI, "title");
        q.textContent = R.raw + `
Resolved: ` + R.value + `
` + Object.entries(R.terminals).map(([ae, ce]) => ae + ": " + ce).join(", "), B.prepend(q);
      }
      for (const R of Object.values(c.nodes))
        for (const B of T.querySelectorAll(".net_" + R.bit)) {
          B.setAttribute("data-net", R.name);
          const q = M.createElementNS(T.namespaceURI, "title");
          q.textContent = "Node " + R.displayName, B.append(q);
        }
      const K = c.components.filter((R) => R.kind === "K").map((R) => ({ name: R.name, inductors: R.coupledInductors, value: R.value }));
      if (K.length) {
        const R = M.createElementNS(T.namespaceURI, "metadata");
        R.setAttribute("id", "spice-magnetic-couplings"), R.textContent = JSON.stringify(K), T.append(R);
        for (const B of K) for (const q of B.inductors) {
          const ae = M.getElementById("cell_" + q);
          if (!ae) continue;
          const ce = M.createElementNS(T.namespaceURI, "circle"), ge = [...ae.children].find((be) => be.getAttribute("s:pid") === "A"), We = ge?.getAttribute("s:position"), Se = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[We] || [0, 0];
          for (const [be, He] of Object.entries({ cx: Number(ge?.getAttribute("s:x")) + Se[0], cy: Number(ge?.getAttribute("s:y")) + Se[1], r: 3, fill: L().color, stroke: "none", "data-coupling": B.name })) ce.setAttribute(be, String(He));
          const Re = M.createElementNS(T.namespaceURI, "title");
          Re.textContent = B.name + " · dotted terminal: " + B.inductors.join(", "), ce.append(Re), ae.append(ce);
        }
      }
      o = U.drawing, i = new XMLSerializer().serializeToString(T), A("source").value = i, e.replaceChildren(document.importNode(T, !0)), E();
      const Y = v.filter((R) => R.severity === "warning").length;
      n.textContent = `${c.components.filter((R) => !R.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${c.interfaceAliases.length ? " · Parent-connected ports: " + c.interfaceAliases.map((R) => R.ports.join(" = ")).join("; ") + "." : ""}${Y ? " · Review " + Y + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${_e}.`, c.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${c.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), c.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), C.setCircuit(c, t.value), A("json").value = JSON.stringify({ circuit: c, netlist: k, hierarchy: a }, null, 2), A("selection").textContent = "Click a component to inspect its original statement and pin connections.", D();
    } catch (k) {
      if (e.replaceChildren(), i = "", A("source").value = "", A("json").value = "", A("nets").replaceChildren(), A("selection").textContent = "", n.textContent = k.message, !d)
        A("hierarchy-panel").hidden = !0, A("selection-actions").hidden = !0, A("breadcrumbs").replaceChildren();
      else if (!d.contexts[l]) {
        const U = document.createElement("button");
        U.type = "button", U.textContent = "Return to Top", U.onclick = () => P(""), A("breadcrumbs").replaceChildren(U);
      }
      C.setCircuit(null, t.value), k.diagnostics && (v = k.diagnostics), v.some((U) => U.severity === "error") || v.push({ severity: "error", line: 0, message: k.message }), s(v);
    } finally {
      b = !1, A("generate").disabled = !1, t.readOnly = !1, A("file").disabled = !1, A("libraries").disabled = !1;
      for (const k of de.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) k.disabled = !1;
      d && d.contexts[l] && D(), C.setEnabled(!!i), e.setAttribute("aria-busy", "false"), N(), m && (m = !1, V(), queueMicrotask(j));
    }
  }
  A("generate").onclick = j;
  for (const v of de.querySelectorAll("[data-example]")) v.onclick = () => {
    const k = pe[v.dataset.example];
    t.value = k.source, x(), S(k), j();
  };
  A("file").onchange = async (v) => {
    const k = v.target.files[0];
    if (k) {
      if (k.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Me(k), x(), j();
      } catch (U) {
        n.textContent = "File could not be read: " + U.message;
      } finally {
        v.target.value = "";
      }
    }
  }, A("libraries").onchange = async (v) => {
    try {
      for (const k of v.target.files) {
        if (k.size > 16e6) throw Error("Library exceeds 16 MB: " + k.name);
        I[k.webkitRelativePath || k.name] = await Me(k);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(I));
      } catch {
      }
      d = null, y = "", A("library-status").textContent = Object.keys(I).length + " library file(s) loaded", j();
    } catch (k) {
      n.textContent = k.message;
    } finally {
      v.target.value = "";
    }
  }, A("library-status").textContent = Object.keys(I).length ? "Libraries restored from this session." : "For .include / .lib dependencies", A("download").onclick = () => {
    const v = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), k = document.createElement("a");
    k.href = v, k.download = "spice-schematic.svg", k.click(), setTimeout(() => URL.revokeObjectURL(v), 1e3);
  };
  async function z(v) {
    const k = o;
    if (!(!k || b || f)) {
      f = !0, N(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: U } = await import("./asc-export-DZNhz1A1.js");
        if (o !== k) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= U({ tree: d, circuit: c, drawing: k, source: t.value, libraries: I });
        const M = v ? u.zip : u.ascBytes, T = URL.createObjectURL(new Blob([M], { type: v ? "application/zip" : "application/octet-stream" })), F = document.createElement("a");
        F.href = T, F.download = v ? "spice-schematic-asc.zip" : "spice-schematic.asc", F.click(), setTimeout(() => URL.revokeObjectURL(T), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (v ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (U) {
        n.textContent = "ASC export failed: " + U.message;
        const M = document.createElement("li");
        M.className = "error", M.textContent = n.textContent, r.append(M);
      } finally {
        f = !1, N();
      }
    }
  }
  A("download-asc").onclick = () => z(!1), A("download-asc-bundle").onclick = () => z(!0), A("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      A("source-details").open = !0, A("source").focus(), A("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
export {
  ye as b,
  Ce as e,
  ie as l,
  we as n,
  yt as p
};
