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
}, at = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", ne = (t) => t.toLowerCase(), Re = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), ct = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function lt(t, e) {
  const n = (_) => e[ne(_ || "")] || Object.entries(e).find(([m]) => m.startsWith(ne(_ || "") + "."))?.[1], o = t[0][0].toUpperCase();
  let r = [], u = [], f = "", i = "", c = [], d = [], a = 0, y = "", l = "", p = "", b = !0;
  if ("RLC".includes(o))
    r = ["A", "B"], i = ne(o) + "_v";
  else if ("DVIB".includes(o))
    r = ["+", "-"], i = o === "D" ? "d_v" : o === "B" ? "spice_b" : ne(o);
  else if (o === "Q") {
    r = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Re(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && r.push("S"), f = t[r.length + 1] || "";
    const _ = n(f)?.type;
    b = ["NPN", "PNP"].includes(_), i = b ? (r.length === 3 ? "q_" : "spice_q4_") + ne(_) : "spice_q" + r.length;
  } else if (o === "M") {
    const _ = n(t[4]), m = n(t[5]), h = _?.type === "VDMOS" || !m && (!t[5] || Re(t[5]));
    r = h ? ["D", "G", "S"] : ["D", "G", "S", "B"], f = t[r.length + 1] || "";
    const I = n(f), E = I?.type;
    if (h && I && E !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!h && E === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    b = ["NMOS", "PMOS", "VDMOS"].includes(E);
    let k = null, N = I;
    const S = /* @__PURE__ */ new Set();
    for (; N && !S.has(N.name) && (S.add(N.name), k = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(N.raw), !k); )
      N = n(N.baseModel);
    const L = E === "PMOS" || E === "VDMOS" && k && (k[1] === void 0 || Number(k[1]) >= 0.5);
    i = b ? "spice_" + (L ? "pmos" : "nmos") + (h ? "3" : "") : "spice_m";
  } else if ("JZ".includes(o)) {
    f = t[4] || "";
    const _ = n(f)?.type, m = o === "Z" && ["NIGBT", "PIGBT"].includes(_);
    r = m ? ["C", "G", "E"] : ["D", "G", "S"], b = o === "J" ? ["NJF", "PJF"].includes(_) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(_), i = "spice_" + (m ? "igbt" : o === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(_ || "") ? "p" : "n");
  } else if ("EFGH".includes(o)) {
    r = ["+", "-"], i = "spice_" + ne(o);
    let _ = 3, m = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[_] || "");
    if (/^poly$/i.test(t[_] || "") && (m = /^\(\s*(\d+)\s*\)$/.exec(t[++_] || ""), !m))
      throw Error("POLY requires a dimension.");
    if (m) {
      const h = Number(m[1]);
      if (h > 128) throw Error("POLY supports at most 128 controlling variables.");
      let I = _ + 1, E = [];
      const k = "EG".includes(o), N = h * (k ? 2 : 1);
      for (; E.length < N && I < t.length; ) E.push(...ct(t[I++]));
      if (E.length !== N || I >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (k) {
        for (let S = 0; S < h; S++) r.push("C" + (S + 1) + "+", "C" + (S + 1) + "-");
        u = [t[1], t[2], ...E];
      } else c = E;
      a = I, y = "POLY(" + h + ") " + (k ? "" : E.join(" ") + " "), l = "POLY", k && (i = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? l = "BEHAVIORAL" : "EG".includes(o) ? (r.push("C+", "C-"), l = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (c = [t[3]], a = 4, y = t[3] + " ");
    p = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[o] + (l ? " · " + l : "");
  } else if (o === "S")
    r = ["A", "B", "C+", "C-"], f = t[5] || "", i = "spice_device", p = "Voltage switch";
  else if (o === "W")
    r = ["A", "B"], c = [t[3]], f = t[4] || "", a = 3, i = "spice_device", p = "Current switch";
  else if ("TO".includes(o))
    r = ["L+", "L-", "R+", "R-"], o === "O" && (f = t[5] || ""), i = "spice_device", p = o === "T" ? "Transmission line" : "Lossy line";
  else if (o === "U")
    r = ["N1", "N2", "COM"], f = t[4] || "", i = "spice_device", p = "Distributed RC";
  else if (o === "A")
    r = Array.from({ length: 8 }, (_, m) => "P" + (m + 1)), i = "spice_device", p = t[9] || "A function";
  else if (o === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (d = t.slice(1, -1), d.some((_) => !/^L/i.test(_.split(":").at(-1)))) throw Error("K references must name inductors.");
    a = t.length - 1, i = "spice_coupling", p = "Magnetic coupling", y = d.join(" ") + " · k=";
  } else if (o === "@")
    r = ["IN", "OUT"], i = "spice_device", p = "FRA";
  else if (o === "&")
    r = ["O+", "O-", "I+", "I-"], i = "spice_device", p = "FRA probe";
  else if (o === "Ö")
    r = ["OUT", "V+", "V-", "IN-", "IN+"], i = "spice_device", p = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + o);
  if (a || (a = r.length + 1), u.length || (u = t.slice(1, r.length + 1)), u.length !== r.length) throw Error("Incomplete terminal list: expected " + r.length + " nodes.");
  if (t.length <= a && !["&", "Ö"].includes(o)) throw Error("Missing value, model, or expression after " + r.length + " terminals.");
  if (u.some((_) => /[=()]/.test(_) && !/^\{[\s\S]*\}$/.test(_))) throw Error("Invalid terminal token; check terminal count.");
  if (o === "B" && !/\b[VIPR]\s*=/i.test(t.slice(a).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (o === "B" && /^R\s*=/i.test(t.slice(a).join(" ")) && (i = "spice_br"), o === "D" && (f = t[3] || ""), o === "@") {
    const _ = t.slice(a).join(" ");
    for (const m of _.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      r.push(m[1].toUpperCase()), u.push(m[2]);
  }
  if (o === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (c.some((_) => !_)) throw Error("Missing controlling voltage source.");
  const g = r.map((_, m) => o === "A" && st[(t[9] || "").toUpperCase()]?.[String(m + 1)] || _);
  return { kind: o, pins: r, nodeTokens: u, pinLabels: g, model: f, type: i, controlSource: c[0] || "", controlSources: c, coupledInductors: d, value: y + t.slice(a).join(" "), sourceMode: l, symbol: p, polarityKnown: b };
}
const dt = at, ut = new Set(dt.split(" ")), we = () => /* @__PURE__ */ Object.create(null), X = (t) => t.toLowerCase();
function me(t) {
  const e = [], n = [];
  let o = "", r = 0, u = "";
  for (let f = 0; f < t.length; f++) {
    const i = t[f];
    if (u) {
      o += i, i === u && t[f - 1] !== "\\" && (u = "");
      continue;
    }
    if (i === '"' || i === "'") {
      u = i, o += i;
      continue;
    }
    if (!r && (i === ";" || i === "$" && (!f || /\s/.test(t[f - 1])))) break;
    if ("({".includes(i) && (n.push(i), r++), ")}".includes(i) && (r--, n.pop() !== (i === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(i) && !r ? (o && e.push(o), o = "") : o += i;
  }
  if (r || u) throw Error("Unclosed expression or quoted string.");
  return o && e.push(o), e;
}
function ft(t, e = {}) {
  const n = [], o = [], r = [], u = Object.assign(we(), e.models), f = we(), i = (m, h, I) => n.push({ severity: m, line: h, message: I });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const c = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((m, h) => {
    const I = m.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? c.length ? c.at(-1).text += " " + I.slice(1).trim() : i("error", h + 1, "Continuation has no preceding statement.") : c.push({ line: h + 1, text: I }));
  });
  for (const m of c) {
    try {
      m.tokens = me(m.text);
    } catch (I) {
      i("error", m.line, I.message), m.tokens = [];
    }
    const h = m.tokens;
    if (/^\.model$/i.test(h[0] || ""))
      if (h.length < 3) i("error", m.line, ".model requires a name and device type.");
      else {
        const I = /^ako:(.+)$/i.exec(h[2]), E = I && h[3] && !h[3].startsWith("(") ? h[3].split("(")[0].toUpperCase() : "";
        u[X(h[1])] = { name: h[1], type: I ? E : h[2].split("(")[0].toUpperCase(), baseModel: I?.[1] || "", raw: m.text };
      }
  }
  const d = /* @__PURE__ */ new Set();
  function a(m) {
    const h = u[X(m)];
    if (!h) return "";
    if (h.type) return h.type;
    if (d.has(X(m))) throw Error("Circular AKO model inheritance: " + m);
    return d.add(X(m)), h.type = a(h.baseModel), d.delete(X(m)), h.type;
  }
  for (const m of Object.values(u)) if (m.baseModel && !m.type)
    try {
      a(m.name);
    } catch (h) {
      i("error", 0, h.message);
    }
  let y = "", l = 0, p = !1, b = !1;
  const g = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: m, text: h, tokens: I } of c) {
    if (!I.length) continue;
    const E = X(I[0]);
    if (b) {
      i("warning", m, "Statement after .end is not rendered: " + h);
      continue;
    }
    if (E === ".control") {
      p = !0, i("warning", m, ".control script retained but not executed or rendered.");
      continue;
    }
    if (E === ".endc") {
      p = !1;
      continue;
    }
    if (p) continue;
    if (E === ".subckt") {
      l++, i("error", m, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (E === ".ends") {
      l ? l-- : i("error", m, "Unmatched .ends.");
      continue;
    }
    if (l) continue;
    if (E === ".end") {
      b = !0;
      continue;
    }
    if (E.startsWith(".")) {
      o.push({ line: m, text: h }), E === ".title" ? y = I.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(E) ? i("error", m, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(E) ? i("error", m, "Topology-changing directive is unsupported: " + h) : _.has(E) || i("warning", m, "Directive retained but not resolved: " + h);
      continue;
    }
    const k = I[0][0].toUpperCase();
    if (!ut.has(k)) {
      m === 1 && !/\d/.test(I[0]) && I.length > 1 && k !== "X" ? (y = h, i("warning", m, "First line treated as a SPICE title; use .title for an unambiguous title.")) : i("warning", m, `Unsupported ${k} device was not rendered: ${h}`);
      continue;
    }
    const N = k === "M" || k === "Q" ? 5 : 4;
    if (m === 1 && !/\d/.test(I[0]) && (I.length < N || k === "T" && !/\b(?:zo|z0)\s*=/i.test(h))) {
      y = h, i("info", m, "SPICE title: " + h);
      continue;
    }
    try {
      if (g.has(E)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const S = lt(I, u), { pins: L, nodeTokens: s, ...w } = S;
      S.polarityKnown || i("warning", m, `${I[0]}: model polarity unknown; explicit ${L.join("/")} terminals retained.`);
      const x = we();
      L.forEach((D, v) => {
        const P = X(s[v]);
        f[P] || (f[P] = { name: P, displayName: I[v + 1], bit: Object.keys(f).length + 2, terminals: [] }), f[P].terminals.push({ component: I[0], pin: D }), x[D] = P;
      }), r.push({ ...w, name: I[0], terminals: x, line: m, raw: h }), g.add(E);
    } catch (S) {
      i("error", m, `${I[0]}: ${S.message} Statement: ${h}`);
    }
  }
  l && i("error", 0, "Unclosed .subckt definition."), p && i("error", 0, "Unclosed .control block."), r.length || i("error", 0, "No supported components to render."), r.length > 300 && i("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const m of r) {
    for (const h of m.controlSources || []) !h.includes(":") && !r.some((I) => X(I.name) === X(h) && I.kind === "V") && i("error", m.line, `${m.name}: controlling voltage source ${h} was not found.`);
    for (const h of m.coupledInductors || []) !h.includes(":") && !r.some((I) => X(I.name) === X(h) && I.kind === "L") && i("error", m.line, `${m.name}: coupled inductor ${h} was not found.`);
    (m.kind === "B" || m.type === "spice_b") && i("info", m.line, `${m.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: y, components: r, nodes: f, models: u, directives: o, diagnostics: n };
}
const J = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), ke = (t) => J(t).split("/").at(-1);
function pt(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const o = new Map(e instanceof Map ? e : Object.entries(e)), r = [], u = [], f = [];
  let i = 0;
  const c = (a, y) => {
    const l = J(y).split("/").slice(0, -1).concat(J(a)).join("/"), p = [...o].filter(([g]) => J(g) === J(a) || J(g) === l);
    if (p.length === 1) return p[0];
    const b = [...o].filter(([g]) => ke(g) === ke(a));
    if (b.length !== 1) throw Error(b.length ? "Ambiguous library filename: " + a : "Missing library " + a + ". Add this file using Library files.");
    return b[0];
  };
  function d(a, y, l = "", p = []) {
    const b = J(y) + ":" + l.toLowerCase();
    if (p.includes(b)) throw Error("Circular library include: " + [...p, b].join(" → "));
    if (p.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const g = [], _ = /^\s*\.endl\b/im.test(a);
    let m = !l;
    const h = (E, k) => {
      if (i += E.length, i > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      f.push(E), u.push({ file: y, line: k + 1 });
    };
    if (a.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((E, k) => {
      const N = E.trim();
      if (/^\.lib\b/i.test(N) && _) {
        const S = me(N);
        if (S.length === 2 && !/[.\\/]/.test(S[1])) {
          g.push(S[1].toLowerCase()), S[1].toLowerCase() === l.toLowerCase() && (m = !0), h("* Library section " + S[1], k);
          return;
        }
      }
      if (/^\.endl\b/i.test(N)) {
        g.pop(), h("* End library section", k);
        return;
      }
      if (l && g.length && !g.includes(l.toLowerCase())) {
        h("* Unselected library section", k);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(N))
        try {
          const S = me(N);
          if (!S[1]) throw Error("Include requires a filename.");
          const [L, s] = c(S[1], y);
          h("* Included " + L, k), d(s, L, S[2] || "", [...p, b]);
        } catch (S) {
          r.push({ severity: "error", line: k + 1, source: y, message: S.message }), h("* Unresolved include", k);
        }
      else h(E, k);
    }), !m) throw Error("Library section " + l + " not found in " + y);
  }
  try {
    d(t, n);
  } catch (a) {
    r.push({ severity: "error", line: 0, source: n, message: a.message });
  }
  return { source: f.join(`
`), origins: u, diagnostics: r };
}
function mt(t) {
  const e = [], n = /* @__PURE__ */ new Map(), o = [0], r = [];
  t.split(/\r?\n/).forEach((i, c) => {
    const d = i.trim();
    /^\.subckt\b/i.test(d) && (o.push(c + 1), n.set(c + 1, [])), o.at(-1) ? n.get(o.at(-1)).push({ raw: i, line: c + 1 }) : e[c] = i, /^\.ends\b/i.test(d) && o.length > 1 && o.pop();
  });
  const u = Le(Array.from({ length: t.split(/\r?\n/).length }, (i, c) => e[c] || "").join(`
`));
  r.push(...u.diagnostics);
  const f = /* @__PURE__ */ new Map();
  for (const [i, c] of n) {
    const d = Le(c.map((a) => a.raw).join(`
`));
    f.set(i, d.layout), r.push(...d.diagnostics.map((a) => ({ ...a, line: c[a.line - 1]?.line || i })));
  }
  return { layout: u.layout, scopes: f, diagnostics: r };
}
function Le(t) {
  const e = [], n = [];
  let o = !1, r = !1, u = 0;
  if (t.split(/\r?\n/).forEach((h, I) => {
    const E = h.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(E)) {
      (r || o) && e.push({ severity: "error", line: I + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(E) || e.push({ severity: "error", line: I + 1, message: "Expected @layout begin v1." }), r = !0, o = !0, u = I + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(E)) {
      o || e.push({ severity: "error", line: I + 1, message: "Unexpected @layout end." }), o = !1;
      return;
    }
    o && (E.startsWith("*") ? n.push(E.slice(1).trim()) : e.push({ severity: "error", line: I + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), o && e.push({ severity: "error", line: u, message: "Unclosed @layout block." }), !r) return { layout: null, diagnostics: e };
  const f = n.join(" "), i = f.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], c = [], d = [], a = [], y = [];
  let l = 0, p = 0, b = 10;
  const g = () => i[l++], _ = () => {
    const h = g();
    if (!h || !/^[A-Za-z_@][\w./%:@-]*$/.test(h)) throw Error("Expected layout identifier, got " + h);
    return h;
  };
  function m(h) {
    if (c.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const I = h ? _() : "@row" + p++, E = g();
    if (!["row", "column", "classic"].includes(E)) throw Error("Expected row, column or classic.");
    if (g() !== "{") throw Error("Expected { after " + E);
    const k = { id: I, direction: E, members: [] };
    for (c.push(k); l < i.length && i[l] !== "}"; )
      i[l] === "group" ? (g(), k.members.push(m(!0))) : ["row", "column"].includes(i[l]) ? k.members.push(m(!1)) : k.members.push(_());
    if (g() !== "}") throw Error("Unclosed group " + I);
    if (!k.members.length) throw Error("Empty layout group " + I);
    return I;
  }
  try {
    for (; l < i.length; )
      if (i[l] === "group")
        g(), m(!0);
      else if (["row", "column"].includes(i[l])) m(!1);
      else if (i[l] === "face") {
        g();
        const s = _(), w = g();
        if (!["left", "right"].includes(w)) throw Error("Expected face left or right.");
        if (y.some((x) => x.device.toLowerCase() === s.toLowerCase())) throw Error("Duplicate face device.");
        y.push({ device: s, side: w });
      } else if (i[l] === "pair") {
        g();
        const s = g();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(s)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (g() !== "{") throw Error("Expected { after pair kind.");
        const w = [];
        for (; l < i.length && i[l] !== "}"; ) w.push(_());
        if (g() !== "}" || !w.length) throw Error("Empty or unclosed pair.");
        if (a.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        a.push({ kind: s, members: w });
      } else if (i[l] === "priority-cap") {
        if (g(), b = Number(g()), !Number.isInteger(b) || b < 3 || b > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (g() === "place") {
        const s = _(), w = g(), x = _();
        if (!["left-of", "above"].includes(w)) throw Error("Expected left-of or above.");
        d.push({ a: s, relation: w, b: x });
      } else throw Error("Unknown layout instruction near " + i[l - 1]);
    const h = /* @__PURE__ */ new Set();
    for (const s of c) {
      const w = s.id.toLowerCase();
      if (h.has(w)) throw Error("Duplicate layout group " + s.id);
      h.add(w);
    }
    const I = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set(), k = new Map(c.map((s) => [s.id.toLowerCase(), s])), N = (s) => {
      if (I.has(s)) throw Error("Circular layout group " + s);
      if (!E.has(s)) {
        I.add(s);
        for (const w of k.get(s).members) k.has(w.toLowerCase()) && N(w.toLowerCase());
        I.delete(s), E.add(s);
      }
    };
    for (const s of k.keys()) N(s);
    const S = /* @__PURE__ */ new Map();
    for (const s of d) {
      if (s.a.toLowerCase() === s.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      S.has(s.a.toLowerCase()) || S.set(s.a.toLowerCase(), []), S.get(s.a.toLowerCase()).push(s.b.toLowerCase());
    }
    I.clear(), E.clear();
    const L = (s) => {
      if (I.has(s)) throw Error("Circular place constraints.");
      if (!E.has(s)) {
        I.add(s);
        for (const w of S.get(s) || []) L(w);
        I.delete(s), E.add(s);
      }
    };
    for (const s of S.keys()) L(s);
  } catch (h) {
    e.push({ severity: "error", line: u, message: "Layout description: " + h.message });
  }
  return { layout: { version: 1, priorityCap: b, groups: c, relations: d, pairs: a, faces: y }, diagnostics: e };
}
function ht(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let o = e.focus ? n : t.ir.layoutDescription;
  if (!o) return null;
  if (n) {
    const p = new Set(n.groups.map((g) => g.id.toLowerCase())), b = (g) => p.has(g.toLowerCase()) ? g : e.components.find((m) => m.synthetic && m.value.toLowerCase() === g.toLowerCase())?.name || e.focus + "/" + g;
    o = { ...n, groups: n.groups.map((g) => ({ ...g, members: g.members.map(b) })), relations: n.relations.map((g) => ({ ...g, a: b(g.a), b: b(g.b) })), faces: (n.faces || []).map((g) => ({ ...g, device: b(g.device) })), pairs: (n.pairs || []).map((g) => ({ ...g, members: g.members.map(b) })) };
  }
  const r = new Map(o.groups.map((p) => [p.id.toLowerCase(), p])), u = Object.values(t.contexts).flatMap((p) => p.devices.map((b) => b.name)), f = new Set([...Object.keys(t.contexts), ...u, ...e.components.map((p) => p.name)].map((p) => p.toLowerCase()));
  for (const p of r.values()) if (f.has((n ? e.focus + "/" + p.id : p.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + p.id);
  for (const p of r.values()) for (const b of p.members) if (!r.has(b.toLowerCase()) && !f.has(b.toLowerCase())) throw Error("Unknown @layout instance/device: " + b);
  for (const p of o.relations) for (const b of [p.a, p.b]) if (!r.has(b.toLowerCase()) && !f.has(b.toLowerCase())) throw Error("Unknown @layout place target: " + b);
  const i = (o.pairs || []).map((p) => ({ ...p, members: p.members.map((b) => {
    const g = e.components.find((_) => _.name.toLowerCase() === b.toLowerCase());
    if (!g || g.synthetic || g.block) throw Error("Unknown or non-visible @layout pair device: " + b);
    return g.name;
  }) })), c = (o.faces || []).map((p) => {
    const b = e.components.find((g) => g.name.toLowerCase() === p.device.toLowerCase());
    if (!b || !["Q", "M", "J", "Z"].includes(b.kind)) throw Error("Unknown or unsupported @layout face device: " + p.device);
    return { ...p, device: b.name };
  }), d = /* @__PURE__ */ new Map(), a = [], y = new Set(Object.keys(t.contexts).map((p) => p.toLowerCase()));
  for (const p of o.groups) {
    const b = [];
    for (const g of p.members) {
      if (r.has(g.toLowerCase())) {
        b.push({ group: g });
        continue;
      }
      for (const _ of e.components) if (_.name.toLowerCase() === g.toLowerCase() || _.name.toLowerCase().startsWith(g.toLowerCase() + "/")) {
        if (d.has(_.name)) throw Error("Overlapping @layout membership: " + _.name);
        d.set(_.name, p.id), b.push({ cell: _.name, ...y.has(g.toLowerCase()) ? { instance: g } : {} });
      }
    }
    a.push({ id: p.id, direction: p.direction, members: b });
  }
  const l = /* @__PURE__ */ new Set();
  for (const p of a) for (const b of p.members) if (b.group) {
    const g = b.group.toLowerCase();
    if (l.has(g)) throw Error("Layout group has multiple parents: " + b.group);
    l.add(g);
  }
  return { version: 1, priorityCap: o.priorityCap, groups: a, relations: o.relations, pairs: i, faces: c };
}
const ie = () => /* @__PURE__ */ Object.create(null), z = (t) => t.toLowerCase();
function Be(t) {
  const e = ie();
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (/^params?:$/i.test(o)) continue;
    const r = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(o);
    if (!r) throw Error("Expected named parameter assignment, got: " + o);
    const u = z(r[1]);
    let f = r[2];
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
  const e = t.findIndex((n, o) => /^params?:$/i.test(n) || n.includes("=") || t[o + 1] === "=");
  return e < 0 ? [t, ie()] : [t.slice(0, e), Be(t.slice(e))];
}
function gt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = pt(t, e);
  t = n.source;
  const o = mt(t), r = [...n.diagnostics, ...o.diagnostics], u = ie(), f = /* @__PURE__ */ new Set(["0"]), i = (h, I, E) => r.push({ severity: h, line: I, message: E }), c = (h, I, E, k = [], N = ie(), S = 0) => {
    const L = { id: h, name: I, parent: E, ports: k, defaults: N, parameters: ie(), definitions: ie(), devices: [], instances: [], directives: [], line: S, statements: [], layoutDescription: o.scopes.get(S) || null };
    return u[h] = L, L;
  }, d = c("root", "Top", null), a = [d], y = [];
  let l = !1, p = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((h, I) => {
    const E = h.trim();
    !E || E.startsWith("*") || (E.startsWith("+") ? y.length ? y.at(-1).text += " " + E.slice(1).trim() : i("error", I + 1, "Continuation has no preceding statement.") : y.push({ text: E, line: I + 1 }));
  });
  for (const { text: h, line: I } of y)
    try {
      const E = me(h);
      if (!E.length) continue;
      const k = z(E[0]), N = a.at(-1);
      if (p) {
        i("warning", I, "Statement after .end is not rendered: " + h);
        continue;
      }
      if (k === ".control") {
        l = !0, i("warning", I, ".control script retained but not executed or rendered.");
        continue;
      }
      if (k === ".endc") {
        l = !1;
        continue;
      }
      if (l) continue;
      if (k === ".subckt") {
        if (E.length < 2) throw Error(".SUBCKT requires a name.");
        const [S, L] = Ae(E.slice(2)), s = z(E[1]);
        if (Object.hasOwn(N.definitions, s)) throw Error("Duplicate subcircuit definition: " + E[1]);
        const w = S.map(z);
        if (new Set(w).size !== S.length || w.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (S.some((D) => /[{}()=]/.test(D))) throw Error("Invalid formal port.");
        if (a.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const x = N.id + "/" + encodeURIComponent(s);
        N.definitions[s] = x, a.push(c(x, E[1], N.id, S, L, I));
        continue;
      }
      if (k === ".ends") {
        if (a.length === 1) throw Error("Unmatched .ENDS.");
        if (E[1] && z(E[1]) !== z(N.name)) throw Error(".ENDS name does not match " + N.name);
        a.pop();
        continue;
      }
      if (k === ".end") {
        if (a.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        p = !0;
        continue;
      }
      if (k === ".param") {
        const S = Be(E.slice(1));
        for (const [L, s] of Object.entries(S)) {
          if (Object.hasOwn(N.parameters, L)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + L);
          N.parameters[L] = s;
        }
      }
      if (k === ".global") {
        if (E.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const S of E.slice(1)) f.add(z(S));
      }
      if (k.startsWith(".") && N.directives.push({ line: I, text: h }), k.startsWith("x")) {
        const [S, L] = Ae(E.slice(1));
        if (!S.length) throw Error("X instance requires a subcircuit name.");
        const s = /;§pnba\s+(.+)$/i.exec(h)?.[1].split(")");
        N.instances.push({ name: E[0], nodes: S.slice(0, -1).map(z), definitionName: S.at(-1), definitionId: null, parameters: L, line: I, raw: h, pinNames: s });
      } else N.statements.push({ line: I, text: h });
    } catch (E) {
      i("error", I, E.message + " Statement: " + h);
    }
  a.length > 1 && i("error", a.at(-1).line, "Unclosed .SUBCKT " + a.at(-1).name), l && i("error", 0, "Unclosed .control block.");
  function b(h, I) {
    for (; h; ) {
      if (Object.hasOwn(h.definitions, z(I))) return h.definitions[z(I)];
      h = u[h.parent];
    }
    return null;
  }
  for (const h of Object.values(u)) {
    const I = [...h.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...h.statements], E = ft(I.map((N) => N.text).join(`
`), { models: u[h.parent]?.models });
    h.devices = E.components.map((N) => ({ ...N, line: I[N.line - 1]?.line || h.line })), h.models = E.models, h === d && (d.title = E.title), r.push(...E.diagnostics.filter((N) => !N.message.includes("No supported components to render.") && !N.message.includes("300 components")).map((N) => ({ ...N, line: I[N.line - 1]?.line || h.line })));
    const k = new Set(h.devices.map((N) => z(N.name)));
    for (const N of h.instances)
      if (k.has(z(N.name)) && i("error", N.line, "Duplicate instance/device name: " + N.name), k.add(z(N.name)), N.definitionId = b(h, N.definitionName), !N.definitionId && !/^\{[\s\S]*\}$/.test(N.definitionName)) i("error", N.line, "Undefined subcircuit: " + N.definitionName + " in " + N.name);
      else if (N.definitionId) {
        const S = u[N.definitionId];
        S.ports.length !== N.nodes.length && i("error", N.line, `${N.name}: ${S.name} expects ${S.ports.length} ports; got ${N.nodes.length}.`);
      }
  }
  for (const h of Object.values(u)) delete h.statements;
  const g = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set();
  function m(h, I = []) {
    if (g.has(h)) {
      i("error", u[h].line, "Circular subcircuit reference: " + [...I, u[h].name].join(" → "));
      return;
    }
    if (!_.has(h)) {
      if (g.add(h), I.length >= 64) {
        i("error", u[h].line, "Subcircuit dependency nesting exceeds 64 levels."), g.delete(h), _.add(h);
        return;
      }
      for (const E of u[h].instances) E.definitionId && m(E.definitionId, [...I, u[h].name]);
      g.delete(h), _.add(h);
    }
  }
  for (const h of Object.keys(u)) m(h);
  !d.devices.length && !d.instances.length && i("error", 0, "No supported components or instances to render.");
  for (const h of r) !h.source && h.line && n.origins[h.line - 1] && (h.source = n.origins[h.line - 1].file, h.line = n.origins[h.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: d.title || "", scopes: u, globals: [...f], diagnostics: r, layoutDescription: o.layout };
}
const G = () => /* @__PURE__ */ Object.create(null), oe = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), ye = (t, e) => oe(t.map((n) => n.toLowerCase()), e.toLowerCase());
function bt(t, e = []) {
  const n = G(), o = (r) => n[r] || (n[r] = { name: r, displayName: r.split("/").map((u) => decodeURIComponent(u)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const r of t) for (const [u, f] of Object.entries(r.terminals)) o(f).terminals.push({ component: r.name, pin: u });
  for (const r of e) o(r);
  return n;
}
function wt(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Pe = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, yt = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function he(t, e, n = (r) => r, o = (r) => r) {
  const r = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (f) => (r.push(f), "@@" + (r.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (f, i, c) => {
    const d = c.split(",").map((y) => y.trim());
    if (d.some((y) => !y || /[\s{}+*()]/.test(y))) throw Error("Unsupported dynamic voltage/current reference: " + f);
    const a = i.toUpperCase() + "(" + d.map((y) => i.toLowerCase() === "v" ? n(y) : o(y, i)).join(",") + ")";
    return r.push(a), "@@" + (r.length - 1) + "@@";
  });
  let u = t.length;
  return t = t.replace(yt, (f, i, c) => {
    if (c.slice(i + f.length).trimStart().startsWith("(")) return f;
    const d = e(f.toLowerCase());
    if (d === void 0) return f;
    if (u += d.length + 2, u > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + d + ")";
  }), t.replace(/@@(\d+)@@/g, (f, i) => r[Number(i)]);
}
function Et(t, e, n, o) {
  const r = { ...e, ...n }, u = G(), f = /* @__PURE__ */ new Set(), i = G();
  for (const [d, a] of Object.entries(o)) i[d] = he(Pe(a), (y) => t[y]);
  function c(d) {
    if (Object.hasOwn(i, d)) return i[d];
    if (Object.hasOwn(u, d)) return u[d];
    if (!Object.hasOwn(r, d)) return t[d];
    if (f.has(d)) {
      if (Object.hasOwn(t, d)) return t[d];
      throw Error("Circular parameter dependency: " + [...f, d].join(" → "));
    }
    return f.add(d), u[d] = he(Pe(r[d]), c), f.delete(d), u[d];
  }
  for (const d of Object.keys(r)) c(d);
  return Object.assign(G(), t, u, i);
}
function Ee(t, e, n, o) {
  let r = "";
  for (let c = 0; c < t.length; ) {
    const d = t[c];
    if (d !== "{" && d !== "'") {
      r += d, c++;
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
    r += d + he(t.slice(a + 1, c - 1), (p) => e[p], n, o) + (d === "{" ? "}" : "'");
  }
  const u = [];
  let f = 0, i = "";
  for (let c = 0; c < r.length; c++) {
    const d = r[c];
    if (i) {
      d === i && r[c - 1] !== "\\" && (i = "");
      continue;
    }
    if (d === '"' || d === "'") {
      i = d;
      continue;
    }
    if ("({".includes(d) && f++, ")}".includes(d) && f--, !f && (c === 0 || /\s/.test(r[c - 1]))) {
      const a = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(r.slice(c));
      a && (u.push({ start: c, end: c + a[0].length, key: a[1].toLowerCase() }), c += a[0].length - 1);
    }
  }
  if (u.length) {
    let c = r.slice(0, u[0].start);
    u.forEach((d, a) => {
      const y = u[a + 1]?.start ?? r.length, l = r.slice(d.end, y);
      c += r.slice(d.start, d.end) + (l.includes("{") || ["refnode", "intnode"].includes(d.key) ? l : he(l, (p) => e[p], n, o));
    }), r = c;
  } else Object.hasOwn(e, t.toLowerCase()) && (r = "{" + e[t.toLowerCase()] + "}");
  return r;
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
class C {
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
    return "JavaScript Expression Parser (JSEP) v" + C.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return C.max_unop_len = Math.max(e.length, C.max_unop_len), C.unary_ops[e] = 1, C;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, o) {
    return C.max_binop_len = Math.max(e.length, C.max_binop_len), C.binary_ops[e] = n, o ? C.right_associative.add(e) : C.right_associative.delete(e), C;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return C.additional_identifier_chars.add(e), C;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return C.literals[e] = n, C;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete C.unary_ops[e], e.length === C.max_unop_len && (C.max_unop_len = C.getMaxKeyLen(C.unary_ops)), C;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return C.unary_ops = {}, C.max_unop_len = 0, C;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return C.additional_identifier_chars.delete(e), C;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete C.binary_ops[e], e.length === C.max_binop_len && (C.max_binop_len = C.getMaxKeyLen(C.binary_ops)), C.right_associative.delete(e), C;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return C.binary_ops = {}, C.max_binop_len = 0, C;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete C.literals[e], C;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return C.literals = {}, C;
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
    return new C(e).parse();
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
    return C.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !C.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    C.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return C.isIdentifierStart(e) || C.isDecimalDigit(e);
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
    if (C.hooks[e]) {
      const o = { context: this, node: n };
      return C.hooks.run(e, o), o.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (C.hooks[e]) {
      const n = { context: this };
      return C.hooks[e].find(function(o) {
        return o.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === C.SPACE_CODE || e === C.TAB_CODE || e === C.LF_CODE || e === C.CR_CODE; )
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
      type: C.COMPOUND,
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
      if (o = this.code, o === C.SEMCOL_CODE || o === C.COMMA_CODE)
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
    let e = this.expr.substr(this.index, C.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (C.binary_ops.hasOwnProperty(e) && (!C.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !C.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, o, r, u, f, i, c, d;
    if (f = this.gobbleToken(), !f || (n = this.gobbleBinaryOp(), !n))
      return f;
    for (u = { value: n, prec: C.binaryPrecedence(n), right_a: C.right_associative.has(n) }, i = this.gobbleToken(), i || this.throwError("Expected expression after " + n), r = [f, u, i]; n = this.gobbleBinaryOp(); ) {
      if (o = C.binaryPrecedence(n), o === 0) {
        this.index -= n.length;
        break;
      }
      u = { value: n, prec: o, right_a: C.right_associative.has(n) }, d = n;
      const a = (y) => u.right_a && y.right_a ? o > y.prec : o <= y.prec;
      for (; r.length > 2 && a(r[r.length - 2]); )
        i = r.pop(), n = r.pop().value, f = r.pop(), e = {
          type: C.BINARY_EXP,
          operator: n,
          left: f,
          right: i
        }, r.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + d), r.push(u, e);
    }
    for (c = r.length - 1, e = r[c]; c > 1; )
      e = {
        type: C.BINARY_EXP,
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
    if (e = this.code, C.isDecimalDigit(e) || e === C.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === C.SQUOTE_CODE || e === C.DQUOTE_CODE)
      r = this.gobbleStringLiteral();
    else if (e === C.OBRACK_CODE)
      r = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, C.max_unop_len), o = n.length; o > 0; ) {
        if (C.unary_ops.hasOwnProperty(n) && (!C.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !C.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += o;
          const u = this.gobbleToken();
          return u || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: C.UNARY_EXP,
            operator: n,
            argument: u,
            prefix: !0
          });
        }
        n = n.substr(0, --o);
      }
      C.isIdentifierStart(e) ? (r = this.gobbleIdentifier(), C.literals.hasOwnProperty(r.name) ? r = {
        type: C.LITERAL,
        value: C.literals[r.name],
        raw: r.name
      } : r.name === C.this_str && (r = { type: C.THIS_EXP })) : e === C.OPAREN_CODE && (r = this.gobbleGroup());
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
    for (; n === C.PERIOD_CODE || n === C.OBRACK_CODE || n === C.OPAREN_CODE || n === C.QUMARK_CODE; ) {
      let o;
      if (n === C.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== C.PERIOD_CODE)
          break;
        o = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === C.OBRACK_CODE ? (e = {
        type: C.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== C.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === C.OPAREN_CODE ? e = {
        type: C.CALL_EXP,
        arguments: this.gobbleArguments(C.CPAREN_CODE),
        callee: e
      } : (n === C.PERIOD_CODE || o) && (o && this.index--, this.gobbleSpaces(), e = {
        type: C.MEMBER_EXP,
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
    for (; C.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === C.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); C.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); C.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      C.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return o = this.code, C.isIdentifierStart(o) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (o === C.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === C.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: C.LITERAL,
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
      type: C.LITERAL,
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
    for (C.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, C.isIdentifierPart(e)); )
      this.index++;
    return {
      type: C.IDENTIFIER,
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
        o = !0, this.index++, e === C.CPAREN_CODE && r && r >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (u === C.COMMA_CODE) {
        if (this.index++, r++, r !== n.length) {
          if (e === C.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === C.CBRACK_CODE)
            for (let f = n.length; f < r; f++)
              n.push(null);
        }
      } else if (n.length !== r && r !== 0)
        this.throwError("Expected comma");
      else {
        const f = this.gobbleExpression();
        (!f || f.type === C.COMPOUND) && this.throwError("Expected comma"), n.push(f);
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
    let e = this.gobbleExpressions(C.CPAREN_CODE);
    if (this.code === C.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: C.SEQUENCE_EXP,
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
      type: C.ARRAY_EXP,
      elements: this.gobbleArguments(C.CBRACK_CODE)
    };
  }
}
const Ct = new _t();
Object.assign(C, {
  hooks: Ct,
  plugins: new Nt(C),
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
C.max_unop_len = C.getMaxKeyLen(C.unary_ops);
C.max_binop_len = C.getMaxKeyLen(C.binary_ops);
const ae = (t) => new C(t).parse(), vt = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(C).filter((t) => !vt.includes(t) && ae[t] === void 0).forEach((t) => {
  ae[t] = C[t];
});
ae.Jsep = C;
const It = "ConditionalExpression";
var Ot = {
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
            type: It,
            test: o,
            consequent: r,
            alternate: u
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let f = o;
            for (; f.right.operator && t.binary_ops[f.right.operator] <= 0.9; )
              f = f.right;
            n.node.test = f.right, f.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ae.plugins.register(Ot);
const xt = "ConditionalExpression";
var St = {
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
            type: xt,
            test: o,
            consequent: r,
            alternate: u
          }, o.operator && t.binary_ops[o.operator] <= 0.9) {
            let f = o;
            for (; f.right.operator && t.binary_ops[f.right.operator] <= 0.9; )
              f = f.right;
            n.node.test = f.right, f.right = n.node, n.node = o;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
ae.plugins.register(St);
const Rt = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Te = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, H = (t) => Number(t) > 0.5;
function ue(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let o = 0;
  function r(i) {
    return i = String(i).trim(), /^\{[\s\S]*\}$/.test(i) && (i = i.slice(1, -1)), i = i.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (c) => {
      if (c[0] === '"' || c[0] === "'") return c;
      const [, d, a, y] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(c), l = a.toLowerCase(), p = l.startsWith("meg") ? 1e6 : l.startsWith("mil") ? 254e-7 : Rt[l[0]] || 1;
      return "(" + (y ? +(d + (d.includes(".") ? "" : ".") + y) : Number(d)) * p + ")";
    }), u(ae(i));
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
      const d = r(e[c]);
      return n.delete(c), d;
    }
    if (i.type === "ConditionalExpression") return H(u(i.test)) ? u(i.consequent) : u(i.alternate);
    if (i.type === "UnaryExpression") {
      const c = u(i.argument);
      if (i.operator === "-") return -c;
      if (i.operator === "+") return +c;
      if (i.operator === "!" || i.operator === "~") return !H(c);
    }
    if (i.type === "BinaryExpression") {
      const c = u(i.left);
      if (i.operator === "&&") return H(c) && H(u(i.right));
      if (i.operator === "||") return H(c) || H(u(i.right));
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
    if (i.type === "CallExpression" && i.callee.type === "Identifier") {
      const c = i.callee.name.toLowerCase();
      if (c === "if") {
        if (i.arguments.length !== 3) throw Error("if() needs three arguments.");
        return H(u(i.arguments[0])) ? u(i.arguments[1]) : u(i.arguments[2]);
      }
      if (Object.hasOwn(Te, c)) return Te[c](...i.arguments.map(u));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const f = r(t);
  if (typeof f == "number" && !Number.isFinite(f)) throw Error("Structural expression is not finite.");
  return f;
}
function Ce(t, { isolate: e = "" } = {}) {
  wt(t);
  const n = G(), o = /* @__PURE__ */ new Map();
  let r = 0, u = 0;
  function f(i, c, d, a, y, l, p) {
    if (c.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++r > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const b = t.scopes[i], g = c.length ? oe(c.slice(0, -1), c.at(-1)) : "", _ = G();
    if (e && g === e && (d = G()), p.some((N) => N.scopeId === i)) throw Error("Circular subcircuit reference at " + g);
    const m = Et(a, b.defaults, b.parameters, y);
    function h(N) {
      if (/^\{[\s\S]*\}$/.test(N)) {
        const L = ue(N, m);
        N = String(typeof L == "boolean" ? Number(L) : L);
      }
      /^"[\s\S]*"$/.test(N) && (N = N.slice(1, -1));
      const S = N.toLowerCase();
      return Object.hasOwn(d, S) ? d[S] : t.globals.includes(S) ? ye([], S) : _[S] || (_[S] = ye(c, S));
    }
    const I = { id: g, path: c, scopeId: i, name: l?.name || "Top", definition: b.name, ports: b.ports.map((N) => ({ name: N, node: h(N) })), params: m, nodes: _, models: G(), devices: [], children: [], raw: l?.raw || "", line: l?.line || 0 };
    n[g] = I, o.set(g, h);
    const E = [...p, I];
    function k(N) {
      if (!N) return "";
      let S = b;
      for (; S; ) {
        if (S.directives.some((L) => new RegExp("^\\.model\\s+" + N.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(L.text))) {
          const L = [...E].reverse().find((s) => s.scopeId === S.id);
          return oe(L?.path || [], N.toLowerCase());
        }
        S = t.scopes[S.parent];
      }
      return N;
    }
    for (const N of b.directives.filter((S) => /^\.model\b/i.test(S.text))) {
      const S = /^\.model\s+(\S+)/i.exec(N.text)?.[1];
      if (!S) continue;
      const L = k(S), s = b.models[S.toLowerCase()], w = Ee(N.text, m, h, (x) => oe(c, x));
      I.models[L] = { ...s, name: L, raw: w.replace(/^(\.model\s+)\S+/i, (x, D) => D + L), instanceId: g, parameters: m };
    }
    for (const N of b.devices) {
      if (++u > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const S = G();
      for (const [s, w] of Object.entries(N.terminals)) S[s] = h(w);
      const L = k(N.model);
      I.devices.push({ ...N, name: oe(c, N.name), localName: N.name, instanceId: g, terminals: S, model: L, parameters: m });
    }
    for (const N of b.instances) {
      let S = N.definitionId;
      if (!S) {
        const x = String(ue(N.definitionName, m)).toLowerCase();
        let D = b;
        for (; D && !S; )
          S = D.definitions[x], D = t.scopes[D.parent];
        if (!S) throw Error("Undefined selected subcircuit: " + x);
      }
      const L = t.scopes[S], s = G();
      if (L.ports.length !== N.nodes.length) throw Error(N.name + ": expected " + L.ports.length + " ports; got " + N.nodes.length);
      L.ports.forEach((x, D) => {
        s[x.toLowerCase()] = h(N.nodes[D]);
      });
      const w = f(S, [...c, N.name], s, m, N.parameters, N, E);
      N.pinNames?.length === w.ports.length && w.ports.forEach((x, D) => {
        x.label = N.pinNames[D];
      }), I.children.push(w);
    }
    return I;
  }
  try {
    let y = function(l, p) {
      const b = p.split(":");
      if (b.length === 1) return { owner: l, name: p };
      const g = b.pop();
      for (const _ of [[...l.path, ...b], b]) {
        const m = c.get(_.map(encodeURIComponent).join("/").toLowerCase());
        if (m) return { owner: m, name: g };
      }
      throw Error("Unknown hierarchical reference: " + p);
    };
    const i = f(t.rootId, [], G(), G(), G(), null, []), c = new Map(Object.values(n).map((l) => [l.id.toLowerCase(), l])), d = Object.assign(G(), ...Object.values(n).map((l) => l.models)), a = (l) => d[l] || Object.entries(d).find(([p]) => p.startsWith(l + "."))?.[1];
    for (const l of Object.values(n)) for (const p of l.devices) {
      const b = t.scopes[l.scopeId].devices.find((m) => m.name === p.localName), g = (m) => {
        const h = y(l, m);
        return o.get(h.owner.id)(h.name);
      }, _ = (m, h = "", I = "") => {
        const E = y(l, m), k = E.owner.devices.find((N) => N.localName.toLowerCase() === E.name.toLowerCase());
        if (h.toLowerCase() === "ix") {
          const N = E.owner.ports.find((S, L) => S.name.toLowerCase() === E.name.toLowerCase() || String(L + 1) === E.name);
          if (N) return E.owner.id + ":" + N.name;
        }
        if (!k) {
          if (I) throw Error(p.name + ": referenced " + I + " device " + m + " was not found.");
          return oe(E.owner.path, E.name);
        }
        if (I && k.kind !== I) throw Error(p.name + ": " + m + " must be a " + I + " device.");
        return k.name;
      };
      if (p.value = Ee(b.value, l.params, g, _), b.model && (p.value = p.value.replace(b.model, p.model)), p.kind === "M" && Object.keys(p.terminals).length === 3) {
        let m = a(p.model), h = !1;
        const I = /* @__PURE__ */ new Set();
        for (; m?.type === "VDMOS" && !I.has(m.name); ) {
          I.add(m.name);
          const E = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(m.raw);
          if (E) {
            h = E[1] === void 0 || Number(ue(E[1], m.parameters)) >= 0.5;
            break;
          }
          const k = m.name.includes("/") ? m.name.slice(0, m.name.lastIndexOf("/") + 1) : "";
          m = a(k + (m.baseModel || "").toLowerCase()) || a((m.baseModel || "").toLowerCase());
        }
        I.size && (p.type = "spice_" + (h ? "pmos3" : "nmos3"));
      }
      p.controlSources = (b.controlSources || []).map((m) => _(m, "", "V")), p.controlSource = p.controlSources[0] || "", p.coupledInductors = (b.coupledInductors || []).map((m) => _(m, "", "L"));
      for (const m of /* @__PURE__ */ new Set([...b.controlSources || [], ...b.coupledInductors || []])) {
        const h = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        p.value = p.value.replace(new RegExp("(?<![\\w./%])" + h + "(?![\\w.$])", "g"), () => _(m));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: i, contexts: n };
  } catch (i) {
    throw i.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: i.message }], i;
  }
}
function se(t) {
  return [...t.devices, ...t.children.flatMap(se)];
}
function de(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function ve(t, e = {}) {
  const n = new Map(t.components.map((s) => [s.name, s])), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), u = [], f = (s, w) => JSON.stringify([s, w].sort()), i = (s) => e[s]?.potential !== null && e[s]?.potential !== void 0;
  for (const s of t.components) {
    for (const [T, j] of Object.entries(s.terminals))
      o.has(j) || o.set(j, []), o.get(j).push({ device: s.name, pin: T });
    if (s.kind === "R") {
      const T = Object.values(s.terminals);
      if (T.length === 2 && T[0] !== T[1]) {
        const j = f(...T);
        r.has(j) || r.set(j, []), r.get(j).push(s);
      }
    }
    const w = s.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(s.kind) ? "fet" : null, x = w === "bjt" ? /_(npn|pnp)$/.exec(s.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(s.type)?.[1];
    if (!w || !x) continue;
    const D = s.terminals, v = D[w === "bjt" ? "B" : "G"], P = D[w === "bjt" ? "C" : "D"], B = D[w === "bjt" ? "E" : "S"];
    [v, P, B].some((T) => T === void 0) || v === B || P === B || u.push({ id: s.name, family: w, polarity: x, control: v, drain: P, source: B, body: s.kind === "M" ? D.B : void 0 });
  }
  const c = [], d = /* @__PURE__ */ new Set(), a = (s, w, x, D, v, P = "basic", B = [], T = "high") => {
    const j = [.../* @__PURE__ */ new Set([...w, ...B])], W = JSON.stringify([s, P, [...j].sort()]);
    d.has(W) || (d.add(W), c.push({ id: "motif" + c.length, kind: s, variant: P, transistors: w, members: j, roles: x, nets: D, evidence: v, confidence: T }));
  }, y = (s, w) => s.family === w.family && s.polarity === w.polarity, l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), g = new Map(u.map((s) => [s.id, s])), _ = (s, w, x) => {
    s.has(w) || s.set(w, []), s.get(w).push(x);
  }, m = (s, w) => JSON.stringify([s.family, s.polarity, w]);
  for (const s of u)
    _(l, m(s, s.control), s), _(p, m(s, s.source), s), s.family === "bjt" && (o.get(s.source) || []).some((w) => {
      const x = g.get(w.device);
      return x && x.family === "bjt" && !y(s, x) && x.source === s.source;
    }) && _(b, m(s, s.drain), s);
  const h = (s) => [{ node: s.source, resistor: null }, ...(o.get(s.source) || []).flatMap((w) => {
    const x = n.get(w.device);
    if (x.kind !== "R") return [];
    const D = Object.values(x.terminals).find((v) => v !== s.source);
    return D !== void 0 && D !== s.control && D !== s.drain ? [{ node: D, resistor: x.name }] : [];
  })];
  for (const s of u) s.control === s.drain && a("diode-connected", [s.id], { reference: s.id }, { control: s.control, return: s.source }, ["control-drain-short", s.family]);
  for (const s of u) {
    const w = l.get(m(s, s.control));
    if (w.filter((T) => T.control === T.drain).length > 1) continue;
    let x = null;
    if (s.control !== s.drain && s.family === "bjt" && (x = (l.get(m(s, s.drain)) || []).find((T) => T.id !== s.id && y(T, s) && T.control === s.drain && T.source === s.control && i(T.drain))), s.control !== s.drain && !x) continue;
    const D = h(s), v = [];
    let P = null, B = [];
    for (const T of w) {
      if (T.id === s.id || T.id === x?.id || T.drain === s.drain || T.drain === T.control) continue;
      const j = D.flatMap((W) => h(T).filter((O) => W.node === O.node).map((O) => ({ node: W.node, rs: [W.resistor, O.resistor].filter(Boolean) }))).find((W) => P === null || W.node === P);
      j && (P = j.node, v.push(T.id), B.push(...j.rs));
    }
    if (v.length) {
      const T = v.every((j) => g.get(j).body === s.body);
      a("current-mirror", [s.id, ...v, ...x ? [x.id] : []], { reference: s.id, outputs: v, ...x ? { helper: x.id } : {} }, { control: s.control, return: P }, ["same-polarity", "shared-control", x ? "emitter-follower-reference" : "diode-reference", B.length ? "resistive-common-return" : "shared-return", T ? "compatible-bodies" : "different-body-connections"], x ? "assisted" : B.length ? "degenerated" : "basic", [...B, ...x ? [x.id] : []], T ? "high" : "medium");
    }
  }
  const I = [], E = /* @__PURE__ */ new Set(), k = (s, w) => {
    const x = JSON.stringify([s.id, w.id].sort());
    E.has(x) || (E.add(x), I.push([s, w]));
  };
  for (const s of p.values()) if (!i(s[0].source)) {
    const w = s.filter((x) => x.control !== x.drain);
    w.length === 2 ? k(...w) : w.length > 2 && new Set(w.map((x) => x.control)).size > 1 && a("differential-pair", w.map((x) => x.id), { inputs: w.map((x) => x.id) }, { tail: w[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const s of b.values()) for (let w = 0; w < s.length; w++) for (let x = w + 1; x < s.length; x++) k(s[w], s[x]);
  for (const [s, w] of I) {
    if (s.control === w.control || s.control === s.drain || w.control === w.drain) continue;
    if (s.source === w.source && s.drain !== w.drain && !i(s.source)) {
      const v = (o.get(s.source) || []).some((B) => B.device !== s.id && B.device !== w.id), P = p.get(m(s, s.source)).length === 2;
      a("differential-pair", [s.id, w.id], { inputs: [s.id, w.id] }, { tail: s.source }, ["same-polarity", "distinct-controls", "shared-tail", v ? "tail-bias-connection" : "unbiased-tail", P ? "two-input-tail" : "multi-input-tail"], "basic", [], v && P && s.body === w.body ? "high" : "medium");
    }
    if (s.family !== "bjt" || s.drain !== w.drain || s.source === w.source) continue;
    const x = u.filter((v) => v.family === "bjt" && v.polarity !== s.polarity && v.source === s.source), D = u.filter((v) => v.family === "bjt" && v.polarity !== s.polarity && v.source === w.source);
    for (const v of x) for (const P of D) v.id !== P.id && v.control === P.control && v.drain !== P.drain && v.control !== v.drain && P.control !== P.drain && a("differential-pair", [s.id, w.id, v.id, P.id], { inputs: [s.id, w.id], commonBase: [v.id, P.id] }, { inputCollectors: s.drain, bias: v.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const s of u) if (s.family === "bjt" && s.control !== s.drain) {
    const w = r.get(f(s.drain, s.control)) || [], x = r.get(f(s.control, s.source)) || [];
    w.length === 1 && x.length === 1 && a("vbe-multiplier", [s.id], { transistor: s.id, collectorResistor: w[0].name, emitterResistor: x[0].name }, { control: s.control, collector: s.drain, emitter: s.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [w[0].name, x[0].name]);
  }
  const N = u.filter((s) => s.family === "bjt"), S = /* @__PURE__ */ new Map();
  for (const s of N) _(S, s.control, s);
  const L = (s) => (o.get(s) || []).filter((w) => g.has(w.device));
  for (const s of N) if (s.control !== s.drain) {
    for (const w of S.get(s.source) || []) if (w.id !== s.id && y(s, w) && w.drain === s.control && w.source !== s.drain) {
      const x = r.get(f(s.source, w.source)) || [];
      x.length === 1 && a("current-limit-pair", [s.id, w.id], { driver: s.id, output: w.id, senseResistor: x[0].name }, { sense: s.source, drive: s.control, output: w.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [x[0].name]);
    }
    for (const w of S.get(s.source) || []) w.id !== s.id && y(s, w) && w.control !== w.drain && s.drain === w.drain && w.source !== s.control && a("darlington-pair", [s.id, w.id], { driver: s.id, output: w.id }, { link: s.source, collector: s.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (S.get(s.source) || []).length === 1 ? "high" : "medium");
    for (const w of S.get(s.drain) || []) w.id !== s.id && !y(s, w) && w.control !== w.drain && s.source === w.drain && w.source !== s.control && L(s.drain).length === 2 && a("sziklai-pair", [s.id, w.id], { driver: s.id, output: w.id }, { link: s.drain, feedback: s.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const w of o.get(s.drain) || []) {
      const x = g.get(w.device);
      !x || x.family !== "bjt" || x.id === s.id || !y(s, x) || x.source !== s.drain || i(s.drain) || x.control === s.control || x.control === x.drain || x.drain === s.source || L(s.drain).length !== 2 || a("cascode-pair", [s.id, x.id], { driver: s.id, output: x.id }, { link: s.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const s of N.filter((w) => w.polarity === "npn" && i(w.drain))) for (const w of N.filter((x) => x.polarity === "pnp" && i(x.drain))) {
    if (e[s.drain].potential <= e[w.drain].potential) continue;
    const x = h(s).flatMap((D) => h(w).filter((v) => D.node === v.node && !i(D.node)).map((v) => ({ node: D.node, rs: [D.resistor, v.resistor].filter(Boolean) })))[0];
    x && a("push-pull-pair", [s.id, w.id], { upper: s.id, lower: w.id }, { output: x.node }, ["complementary-polarity", "ordered-collector-supplies", x.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", x.rs);
  }
  return c;
}
function Ie(t, e, n = (o) => o) {
  const o = (r) => Array.isArray(r) ? r.map(e) : e(r);
  return t.map((r) => ({ ...r, members: r.members.map(e), transistors: r.transistors.map(e), roles: Object.fromEntries(Object.entries(r.roles).map(([u, f]) => [u, o(f)])), nets: Object.fromEntries(Object.entries(r.nets).map(([u, f]) => [u, n(f)])) }));
}
function kt(t, e, n) {
  const o = [], r = /* @__PURE__ */ new Set(), u = new Map(t.components.map((f) => [f.name, f]));
  for (const f of n) {
    if (new Set(f.members).size !== f.members.length) throw Error("Duplicate @layout pair member.");
    const i = f.members.map((l) => u.get(l));
    if (i.some((l) => !l)) throw Error("Unknown @layout pair device.");
    const c = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[f.kind], d = f.kind === "differential" && i.length === 2 ? t.components.filter((l) => !f.members.includes(l.name) && Object.values(l.terminals).includes(i[0].terminals.E ?? i[0].terminals.S)) : [], a = ve({ ...t, components: [...i, ...d] }, e), y = a.find((l) => l.kind === c && l.confidence === "high" && f.members.every((p) => l.members.includes(p)));
    if (!y) throw Error("Invalid @layout pair " + f.kind + " { " + f.members.join(" ") + " }: electrical structure does not match.");
    for (const l of a.filter((p) => p === y || p.kind === "diode-connected" && p.members.every((b) => y.members.includes(b)))) {
      const p = JSON.stringify([l.kind, [...l.members].sort()]);
      r.has(p) || (r.add(p), o.push({ ...l, id: "motif" + o.length, origin: "annotation" }));
    }
  }
  return o;
}
function Lt(t, e, n = ve(t, e)) {
  const o = /* @__PURE__ */ new Map(), r = t.components.filter((l) => l.kind === "R"), u = t.components.filter((l) => l.kind === "Q"), f = new Map(t.components.map((l) => [l.name, l])), i = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), d = (l) => Object.values(l.terminals), a = (l, p, b) => {
    l && o.set(l.name, { reverse: d(l)[0] !== p, reason: b });
  };
  for (const l of u) {
    const { C: p, B: b, E: g } = l.terminals, _ = l.type.endsWith("pnp"), m = l.type.endsWith("npn");
    !_ && !m || (i.has(g) || i.set(g, []), i.get(g).push(l), p === b && e[g]?.potential !== null && e[g]?.potential !== void 0 && c.set(p, { potential: e[g].potential }));
  }
  for (const l of n) if (l.kind === "vbe-multiplier" && l.confidence === "high") {
    const p = f.get(l.roles.transistor), b = p.type.endsWith("pnp"), g = f.get(b ? l.roles.emitterResistor : l.roles.collectorResistor), _ = f.get(b ? l.roles.collectorResistor : l.roles.emitterResistor);
    a(g, p.terminals[b ? "E" : "C"], "recognized VBE multiplier"), a(_, p.terminals.B, "recognized VBE multiplier");
  }
  for (const l of r) {
    const [p, b] = d(l), g = c.get(p), _ = c.get(b);
    g && _ && g.potential !== _.potential && a(l, g.potential > _.potential ? p : b, "diode-connected bias reference");
  }
  const y = /* @__PURE__ */ new Map();
  for (const l of r) {
    const p = d(l);
    if (!p.some((b) => e[b]?.potential !== null && e[b]?.potential !== void 0))
      for (const b of p)
        y.has(b) || y.set(b, []), y.get(b).push(l);
  }
  for (const [l, p] of y)
    if (!(p.length > 12))
      for (const b of p) for (const g of p) {
        if (b === g) continue;
        const _ = d(b).find((E) => E !== l), m = d(g).find((E) => E !== l), h = i.get(_)?.find((E) => E.type.endsWith("npn")), I = i.get(m)?.find((E) => E.type.endsWith("pnp"));
        h && I && (a(b, _, "complementary emitter output"), a(g, l, "complementary emitter output"));
      }
  return o;
}
function At(t) {
  const e = t.components.filter((u) => u.kind === "Q"), n = /* @__PURE__ */ new Map(), o = new Set(t.components.filter((u) => u.kind === "R").map((u) => Object.values(u.terminals).sort().join("|"))), r = /* @__PURE__ */ new Set();
  for (const u of e) {
    const f = u.terminals.E;
    n.has(f) || n.set(f, []), n.get(f).push(u);
  }
  for (const u of e) {
    const { B: f, C: i, E: c } = u.terminals;
    if (f === c || !o.has([f, c].sort().join("|"))) continue;
    const d = n.get(f) || [];
    if (!(d.length > 16))
      for (const a of d) {
        if (a === u) continue;
        if (a.terminals.B === i) {
          r.add(u.name);
          break;
        }
        const y = n.get(a.terminals.B) || [];
        if (y.length <= 16 && y.some((l) => l !== u && l !== a && l.terminals.B === i)) {
          r.add(u.name);
          break;
        }
      }
  }
  return r;
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
const fe = (t) => ["pwr", "ret", "bias"].includes(t), Pt = (t) => String(t).split("/").at(-1).toLowerCase(), Fe = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[Pt(t)] || "unknown", Ue = (t) => {
  const e = Ne(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Fe(t);
};
function Tt(t) {
  const e = /* @__PURE__ */ new Map(), n = [], o = (f, i, c) => {
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
        o(f.terminals["-"], f.terminals["+"], a), o(f.terminals["+"], f.terminals["-"], -a);
      } catch {
      }
  const r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ new Set();
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
    for (const [a, y] of i) r[a] = { value: y, reference: f, known: f === "0" && !d, consistent: !d };
  }
  return { nodes: r, diagnostics: n };
}
function Ut(t, e, n = null) {
  const o = Tt(se(e.localScope ? t.contexts[e.focus] : t.root)), r = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null);
  for (const a of Object.values(e.nodes)) {
    const y = Ne(a.name), l = Fe(a.name);
    r[a.name] = { role: y !== "unknown" ? y : l, roleSource: y !== "unknown" ? "node-name" : l !== "unknown" ? "legacy-rail-name" : "unknown", potential: o.nodes[a.name]?.known ? o.nodes[a.name].value : null };
  }
  if (e.localScope) for (const a of e.interfaceBindings) {
    const y = r[a.local], l = Ue(a.port);
    y && y.potential === null && ["pwr", "ret"].includes(l) && (y.potential = l === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(a.port) ? 0 : -1, y.potentialSource = "symbolic-port-order");
  }
  const f = n?.pairs?.length ? kt(e, r, n.pairs) : ve(e, r), i = Lt(e, r, f), c = At(e), d = (a, y, l) => {
    const p = { role: r[l].role, roleSource: r[l].roleSource }, b = a.block?.ports.find((m) => m.pin === y);
    if (b?.implicit || !a.block && !a.synthetic) return p;
    const g = a.synthetic ? a.value : b?.name || b?.label, _ = Ue(g);
    return _ !== "unknown" ? { role: _, roleSource: Ne(g) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : fe(p.role) ? { ...p, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const a of e.components) {
    const y = Object.fromEntries(Object.entries(a.terminals).map(([L, s]) => [L, { ...r[s], ...d(a, L, s) }])), l = Object.values(y), p = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(a.type), b = p && !i.has(a.name) && l.length === 2 && l.every((L) => !fe(L.role) && (L.potential === null || L.role !== "unknown")), g = a.terminals["+"], _ = a.terminals["-"], m = [g, _].filter((L) => L && L !== "0"), h = a.kind === "V" && m.some((L) => fe(r[L]?.role)) && !m.some((L) => ["in", "out", "io", "fb"].includes(r[L]?.role)) && [g, _].every((L) => o.nodes[L]?.known), I = g === "0" ? _ : g, E = Object.keys(a.terminals), k = (L) => fe(L.role) ? L.potential !== null ? L.potential > 0 ? "high" : "low" : L.role === "ret" ? "low" : "high" : "signal";
    let N = !1;
    E.length === 2 && (a.kind === "V" && l.every((L) => L.potential !== null) ? N = l[0].potential < l[1].potential : a.terminals[E[0]] === "0" ? N = !0 : a.terminals[E[1]] === "0" ? N = !1 : l.every((L) => L.potential !== null) ? N = l[0].potential < l[1].potential : N = k(l[0]) === "low" || k(l[1]) === "high" && k(l[0]) === "signal"), i.has(a.name) && (N = i.get(a.name).reverse);
    const S = a.synthetic ? "" : a.name.startsWith(e.focus + "/") ? a.name.slice(e.focus.length + 1) : a.name;
    u[a.name] = { version: _e, kind: a.kind, polarity: a.type.endsWith("pnp") ? "p" : a.type.endsWith("npn") ? "n" : null, currentLimiter: c.has(a.name), orientationReason: i.get(a.name)?.reason || null, owner: S.includes("/") ? S.slice(0, S.lastIndexOf("/")) : "", passive: p, source: ["V", "I", "E", "F", "G", "H"].includes(a.kind) || a.kind === "B" && !p, ports: y, horizontal: b, orientation: b ? "horizontal" : N ? "vertical-reversed" : "vertical", flexible: E.length === 2 && (p || ["V", "I", "B", "F", "H"].includes(a.kind)), supply: !!h, voltage: h ? o.nodes[I].value : null };
  }
  return { version: _e, nodes: r, cells: u, motifs: f, diagnostics: o.diagnostics };
}
function Ge(t, e) {
  const n = e.ports.map((r, u) => ({ pin: "P" + u, name: r.name, label: r.label || r.name, node: r.node, implicit: !1 })), o = new Set(se(e).flatMap((r) => Object.values(r.terminals)));
  for (const r of t.ir.globals) {
    const u = ye([], r);
    o.has(u) && !n.some((f) => f.node === u) && n.push({ pin: "G" + n.length, label: r === "0" ? "⏚ 0" : "global: " + r, node: u, implicit: !0 });
  }
  return n;
}
function Mt(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: o = "" } = {}) {
  const r = t, u = t.contexts[o];
  if (!u) throw Error("Unknown instance: " + o);
  o && (t = Ce(t.ir, { isolate: o }));
  const f = t.contexts[o];
  if (!f) throw Error("Unknown instance: " + o);
  const i = [], c = [];
  function d(b) {
    c.push(...Object.values(b.nodes), ...b.ports.map((_) => _.node));
    const g = [...b.devices.map((_) => ({ line: _.line, device: _ })), ...b.children.map((_) => ({ line: _.line, child: _ }))].sort((_, m) => _.line - m.line);
    for (const _ of g) {
      if (_.device) {
        const E = _.device;
        i.push({ ...E, layoutLabel: [...b.path.slice(f.path.length), E.localName].join("/") });
        continue;
      }
      const m = _.child;
      if (e === "flat" || n.has(m.id)) {
        d(m);
        continue;
      }
      const h = Ge(t, m), I = G();
      h.forEach((E) => {
        I[E.pin] = E.node;
      }), i.push({ name: m.id, kind: "X", type: "spice_subckt", terminals: I, value: m.definition, raw: m.raw, line: m.line, instanceId: m.id, layoutLabel: m.path.slice(f.path.length).join("/"), block: { definitionId: m.scopeId, ports: h, parameters: m.params } });
    }
  }
  d(f);
  for (const [b, g] of f.ports.entries()) i.push({ name: "@port/" + o + "/" + b, kind: "PORT", type: "spice_port", terminals: { A: g.node }, layoutLabel: g.name, value: g.name, raw: "Interface port " + g.name, synthetic: !0 });
  if (i.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const a = Object.assign(G(), ...Object.values(t.contexts).map((b) => b.models)), y = { title: o || t.ir.title, components: i, nodes: bt(i, c), models: a, diagnostics: t.ir.diagnostics, mode: e, focus: o, localScope: !!o };
  y.interfaceBindings = f.ports.map((b, g) => ({ port: b.name, local: b.node, parent: u.ports[g].node }));
  const l = /* @__PURE__ */ new Map();
  for (const b of u.ports)
    l.has(b.node) || l.set(b.node, []), l.get(b.node).push(b.name);
  y.interfaceAliases = [...l].filter(([, b]) => b.length > 1).map(([b, g]) => ({ node: b, ports: g })), y.topology = Qt(r, y);
  const p = ht(t, y);
  return y.layout = Ut(t, y, p), y.layout.description = p, y;
}
function Qt(t, e) {
  const n = se(t.contexts[e.focus]);
  e.localScope && (t = Ce(t.ir, { isolate: e.focus }));
  const o = [], r = /* @__PURE__ */ new Set();
  for (const i of e.components)
    if (!i.synthetic)
      if (i.kind === "X") {
        const c = t.contexts[i.instanceId];
        if (!c) throw Error("Projection contains an unknown block.");
        const d = Ge(t, c);
        if (JSON.stringify(Object.entries(i.terminals)) !== JSON.stringify(d.map((a) => [a.pin, a.node]))) throw Error("Block interface topology mismatch: " + i.name);
        o.push(...se(c));
      } else o.push(i);
  for (const i of o) {
    if (r.has(i.name)) throw Error("Projection duplicates " + i.name);
    r.add(i.name);
  }
  const u = de(o), f = se(t.contexts[e.focus]);
  if (u !== de(f)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const i = new Map(e.interfaceBindings.map((a) => [a.local, a.parent])), c = (a) => i.get(a) ?? a, d = o.map((a) => ({ ...a, terminals: Object.fromEntries(Object.entries(a.terminals).map(([y, l]) => [y, c(l)])), value: Ee(a.value, {}, c, (y) => y) }));
    if (de(d) !== de(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: o.length, signature: u, boundSignature: de(n), boundaryVerified: !0 };
}
function Dt(t) {
  const e = G(), n = G();
  for (const o of t.components) {
    const r = G(), u = G();
    for (const [f, i] of Object.entries(o.terminals))
      r[f] = [t.nodes[i].bit], u[f] = "input";
    e[o.name] = { type: o.type, port_directions: u, connections: r, parameters: {}, attributes: { ref: o.name, displayRef: o.layoutLabel || o.name, value: o.value, spice: o.raw } }, e[o.name].spiceLayout = t.layout?.cells[o.name], o.block && (e[o.name].spiceBlock = { ports: o.block.ports.map((f) => ({ pin: f.pin, label: f.label })), definitionId: o.block.definitionId }), (o.type === "spice_device" || o.type === "spice_coupling") && (e[o.name].spiceSymbol = { label: o.symbol || o.kind, ports: Object.keys(o.terminals).map((f, i) => ({ pin: f, label: o.pinLabels?.[i] || f })), references: o.coupledInductors?.length ? o.coupledInductors : o.controlSources || [] });
  }
  for (const o of Object.values(t.nodes)) n[o.name] = { hide_name: 0, bits: [o.bit], attributes: {} };
  if (t.nodes[0]) {
    let o = "__ground";
    for (; Object.hasOwn(e, o); ) o += "_";
    e[o] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: Ie(t.layout?.motifs || [], (o) => o, (o) => t.nodes[o].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Vt(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = {}, r = (d) => (n.has(d) || n.set(d, n.size + 2), n.get(d));
  Object.entries(t.modules.circuit.cells).forEach(([d, a], y) => {
    const l = "c" + y;
    e.set(l, d);
    const p = Object.fromEntries(Object.entries(a.connections).map(([b, g]) => [b, g.map(r)]));
    o[l] = { type: a.type, connections: p, port_directions: a.port_directions, attributes: { displayRef: a.attributes.displayRef || a.attributes.ref || "", value: a.attributes.value || "", name: a.attributes.name || "" } }, a.spiceBlock && (o[l].spiceBlock = a.spiceBlock), a.spiceSymbol && (o[l].spiceSymbol = a.spiceSymbol), a.spiceLayout && (o[l].spiceLayout = a.spiceLayout);
  });
  const u = new Map([...e].map(([d, a]) => [a, d])), f = t.modules.circuit.spiceLayoutDescription, i = f ? { ...f, faces: (f.faces || []).map((d) => ({ ...d, device: u.get(d.device) })), pairs: (f.pairs || []).map((d) => ({ ...d, members: d.members.map((a) => u.get(a)) })), groups: f.groups.map((d) => ({ ...d, members: d.members.map((a) => a.cell ? { ...a, cell: u.get(a.cell) } : a) })), relations: f.relations.map((d) => ({ ...d, a: u.get(d.a) || d.a, b: u.get(d.b) || d.b })) } : null, c = Ie(t.modules.circuit.spiceMotifs || [], (d) => u.get(d), r);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: o, spiceMotifs: c, spiceLayoutDescription: i } } }, ids: e, bits: new Map([...n].map(([d, a]) => [a, d])) };
}
const Z = /* @__PURE__ */ new Map();
async function jt(t, e) {
  const n = Vt(t), o = JSON.stringify([n.netlist, e]);
  let r = Z.get(o);
  r ? (Z.delete(o), Z.set(o, r)) : (r = await Bt(n.netlist, e), r.svg.length < 1e6 && (Z.set(o, r), Z.size > 20 && Z.delete(Z.keys().next().value)));
  const u = new DOMParser().parseFromString(r.svg, "image/svg+xml");
  if (u.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const c of u.querySelectorAll("[id],[class]")) {
    const d = c.getAttribute("id");
    d?.startsWith("cell_") && n.ids.has(d.slice(5)) && c.setAttribute("id", "cell_" + n.ids.get(d.slice(5)));
    const a = c.getAttribute("class");
    a && c.setAttribute("class", a.split(/\s+/).map((y) => y.startsWith("cell_") && n.ids.has(y.slice(5)) ? "cell_" + n.ids.get(y.slice(5)) : /^net_\d+$/.test(y) && n.bits.has(Number(y.slice(4))) ? "net_" + n.bits.get(Number(y.slice(4))) : y).join(" "));
  }
  const f = r.drawing ? structuredClone(r.drawing) : null, i = u.querySelector("#spice-layout-report");
  if (i) {
    const c = JSON.parse(i.textContent), d = (a) => n.ids.get(a) || a;
    c.mirroredTransistors = (c.mirroredTransistors || []).map(d), c.orientationDevicesTested = (c.orientationDevicesTested || []).map(d), c.recognizedMotifs = Ie(c.recognizedMotifs || [], d, (a) => n.bits.get(a) ?? a), c.inputAttachments = (c.inputAttachments || []).map(d), c.mirroredInputPorts = (c.mirroredInputPorts || []).map(d);
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
function Bt(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-DQwUzxhK.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((o, r) => {
    const u = (c, d) => {
      clearTimeout(i), n.terminate(), c ? r(Error(c)) : o(d);
    }, f = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, i = setTimeout(() => u("Layout timed out. Open a subcircuit sheet or collapse instances."), f);
    n.onmessage = ({ data: c }) => u(c.error, { svg: c.svg, drawing: c.drawing }), n.onerror = (c) => u(c.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const Ft = `* RLC low-pass filter
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
`, Gt = `* Voltage-divider biased common-emitter amplifier.
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
  filter: { source: Ft, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: Gt, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
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
    for (const o of e) this.manual.set(o, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((o) => Array.isArray(o) && typeof o[0] == "string" && De(o[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function Kt(t, e, n) {
  const o = new Map(e.map((r) => [r.name, n.color(r.name)]));
  for (const r of t.children) if (["line", "path", "polyline", "circle"].includes(r.localName) && r.hasAttribute("data-net")) {
    const u = o.get(r.getAttribute("data-net"));
    if (!u) continue;
    r.style.setProperty("stroke", u, "important"), r.localName === "circle" && r.style.setProperty("fill", u, "important");
  }
}
function Yt(t, e) {
  const n = new qt(), o = /* @__PURE__ */ new Set();
  let r = [], u = !1;
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
    return r.filter((p) => !l || [p.name, p.displayName, ...p.terminals.map((b) => b.component + "." + b.pin)].some((b) => b.toLowerCase().includes(l)));
  };
  function c() {
    const l = i(), p = l.filter((b) => o.has(b.name)).length;
    t("node-count").textContent = `${l.length} / ${r.length} nodes · ${o.size} selected`, t("node-all").checked = !!l.length && p === l.length, t("node-all").indeterminate = p > 0 && p < l.length, t("node-auto").checked = n.auto;
    for (const b of ["node-apply", "node-clear"]) t(b).disabled = !u || !o.size;
    t("node-all").disabled = !u || !l.length;
  }
  function d() {
    t("nets").replaceChildren(...i().map((l) => {
      const p = document.createElement("tr");
      p.dataset.node = l.name;
      const b = document.createElement("td"), g = document.createElement("input");
      g.type = "checkbox", g.checked = o.has(l.name), g.disabled = !u, g.setAttribute("aria-label", "Select node " + l.displayName), g.onchange = () => {
        g.checked ? o.add(l.name) : o.delete(l.name), c();
      }, b.append(g);
      const _ = document.createElement("td");
      _.textContent = l.displayName;
      const m = document.createElement("td"), h = document.createElement("input");
      h.type = "color", h.value = n.color(l.name), h.disabled = !u, h.setAttribute("aria-label", "Wire color for " + l.displayName), h.onchange = () => {
        n.set([l.name], h.value), a();
      }, m.append(h);
      const I = document.createElement("td");
      return I.textContent = l.terminals.map((E) => E.component + "." + E.pin).join(", "), p.append(b, _, m, I), p;
    })), c();
  }
  function a() {
    for (const l of r) n.color(l.name);
    d(), f(), e(n, r);
  }
  t("node-search").oninput = d, t("node-all").onchange = () => {
    for (const l of i()) t("node-all").checked ? o.add(l.name) : o.delete(l.name);
    d();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, a();
  }, t("node-apply").onclick = () => {
    n.set(o, t("node-color").value), a();
  }, t("node-clear").onclick = () => {
    n.set(o, Oe), a();
  }, t("node-reset").onclick = () => {
    n.reset(), a();
  }, t("node-swatches").replaceChildren(...$e.map((l) => {
    const p = document.createElement("button");
    return p.type = "button", p.style.backgroundColor = l, p.title = l, p.setAttribute("aria-label", "Apply palette color " + l), p.onclick = () => {
      o.size && (t("node-color").value = l, n.set(o, l), a());
    }, p;
  }));
  function y(l) {
    u = l;
    for (const p of t("node-panel").querySelectorAll("input,button")) p.disabled = !u;
    c();
  }
  return { setCircuit(l, p) {
    const b = n.sourceId;
    n.setSource(p), b !== n.sourceId && o.clear(), r = Object.values(l?.nodes || {});
    const g = new Set(r.map((_) => _.name));
    for (const _ of o) g.has(_) || o.delete(_);
    for (const _ of r) n.color(_.name);
    u = !!l, d(), y(u), f(), e(n, r);
  }, setEnabled: y };
}
function Zt(t) {
  const e = (v) => t.querySelector("#spice-" + v), n = new AbortController(), o = n.signal, r = { editor: e("editor-panel"), info: e("info-panel") }, u = Object.fromEntries(Object.keys(r).map((v) => [v, t.querySelector(`[data-window-handle="${v}"]`)])), f = { editor: !0, info: !0 }, i = [], c = { editor: {}, info: {} }, d = [];
  let a = !1, y = !1, l = null, p = null, b = null, g = null;
  const _ = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: a, panels: { ...f } } })), m = (v, P, B, T = {}) => v.addEventListener(P, B, { ...T, signal: o });
  function h(v, P) {
    f[v] = P, r[v].hidden = a && !P, e("show-" + v).setAttribute("aria-expanded", String(P)), _();
  }
  function I(v) {
    const P = document.createComment("workspace return");
    v.before(P), i.push({ node: v, anchor: P }), e("info-content").prepend(v);
  }
  function E(v) {
    const P = v.getBoundingClientRect(), B = t.getBoundingClientRect();
    return { x: P.left - B.left, y: P.top - B.top, w: P.width, h: P.height, width: B.width, height: B.height };
  }
  function k(v, P, B) {
    const T = E(v), j = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, W = Math.max(8, Math.min(P, T.width - T.w - 8)), O = Math.max(8, Math.min(j, T.height - T.h - 8)), A = Math.max(O, Math.min(B, T.height - T.h - 8));
    v.style.left = Math.round(W) + "px", v.style.top = Math.round(A) + "px", v.style.right = "auto", v.style.bottom = "auto";
  }
  function N() {
    if (a) {
      for (const v of Object.values(r)) if (!v.hidden) {
        const P = E(v);
        k(v, P.x, P.y);
      }
    }
  }
  function S() {
    for (const v of Object.values(r))
      for (const P of ["left", "top", "right", "bottom", "width", "height", "z-index"]) v.style.removeProperty(P);
    for (const v of Object.keys(r)) h(v, !0);
    requestAnimationFrame(N);
  }
  function L() {
    if (!a) {
      a = !0, l = document.activeElement, p = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, g = document.createComment("workspace mount"), t.before(g), document.body.append(t);
      for (const v of document.body.children) v !== t && (d.push({ node: v, inert: v.inert }), v.inert = !0);
      document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
      for (const v of Object.keys(r))
        c[v].base = r[v].style.cssText, c[v].floating && (r[v].style.cssText = c[v].floating), r[v].setAttribute("role", "dialog"), r[v].setAttribute("aria-modal", "false"), r[v].setAttribute("aria-labelledby", "spice-" + v + "-title"), u[v].tabIndex = 0, u[v].title = "Drag to move; arrow keys move the window", h(v, f[v]);
      for (const v of ["selection-actions", "selection", "hierarchy-panel"]) I(e(v));
      requestAnimationFrame(N), e("exit-fullscreen").focus({ preventScroll: !0 }), _();
    }
  }
  function s() {
    if (a) {
      a = !1, b = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: v, anchor: P } of i.splice(0))
        P.before(v), P.remove();
      for (const v of Object.keys(r)) {
        c[v].floating = r[v].style.cssText, r[v].style.cssText = c[v].base, r[v].hidden = !1;
        for (const P of ["role", "aria-modal", "aria-labelledby"]) r[v].removeAttribute(P);
        u[v].removeAttribute("tabindex"), u[v].removeAttribute("title");
      }
      g && (g.before(t), g.remove(), g = null);
      for (const { node: v, inert: P } of d.splice(0)) v.inert = P;
      p && (document.documentElement.style.overflow = p.html, document.body.style.overflow = p.body, window.scrollTo(p.x, p.y)), l?.focus?.({ preventScroll: !0 }), _();
    }
  }
  async function w() {
    if (L(), t.requestFullscreen && document.fullscreenEnabled) {
      y = !0;
      try {
        await t.requestFullscreen(), t.dataset.nativeFullscreen = "true";
      } catch {
        y = !1, t.dataset.nativeFullscreen = "false";
      }
    } else t.dataset.nativeFullscreen = "false";
  }
  async function x() {
    if (y = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        y = !0;
        return;
      }
    s();
  }
  m(e("fullscreen"), "click", () => a ? x() : w()), m(e("exit-fullscreen"), "click", x), m(e("reset-windows"), "click", S);
  for (const v of Object.keys(r)) {
    m(e("show-" + v), "click", () => {
      h(v, !f[v]), requestAnimationFrame(N);
    }), m(e("close-" + v), "click", () => {
      h(v, !1), e("show-" + v).focus({ preventScroll: !0 });
    }), m(r[v], "pointerdown", () => {
      if (a) {
        for (const T of Object.values(r)) T.style.zIndex = "20";
        r[v].style.zIndex = "30";
      }
    }, { capture: !0 });
    const P = u[v];
    m(P, "pointerdown", (T) => {
      if (!a || T.button !== 0 || T.target.closest("button,input,select,textarea,a,label")) return;
      T.preventDefault();
      const j = E(r[v]);
      b = { id: v, pointer: T.pointerId, x: T.clientX, y: T.clientY, left: j.x, top: j.y }, P.setPointerCapture(T.pointerId);
    }), m(P, "pointermove", (T) => {
      b?.id === v && b.pointer === T.pointerId && k(r[v], b.left + T.clientX - b.x, b.top + T.clientY - b.y);
    });
    const B = () => {
      b = null;
    };
    m(P, "pointerup", B), m(P, "pointercancel", B), m(P, "lostpointercapture", B), m(P, "keydown", (T) => {
      if (!a || T.target !== P || !T.key.startsWith("Arrow")) return;
      T.preventDefault();
      const j = E(r[v]), W = T.shiftKey ? 32 : 8;
      k(r[v], j.x + ({ ArrowLeft: -W, ArrowRight: W }[T.key] || 0), j.y + ({ ArrowUp: -W, ArrowDown: W }[T.key] || 0));
    });
  }
  m(document, "fullscreenchange", () => {
    a && y && document.fullscreenElement !== t && (y = !1, s());
  }), m(document, "keydown", (v) => {
    a && v.key === "Escape" && (v.preventDefault(), x());
  }), m(window, "resize", N);
  const D = new ResizeObserver(N);
  for (const v of Object.values(r)) D.observe(v);
  return { enter: w, exit: x, showPanel: h, reset: S, destroy() {
    x(), n.abort(), D.disconnect();
  } };
}
const je = pe.filter.source, U = (t) => document.getElementById("spice-" + t), re = U("app");
if (re) {
  let S = function(O) {
    const A = U("example-info");
    if (A && (A.replaceChildren(), !!O && (A.append(document.createTextNode(O.description + " ")), O.url))) {
      const Q = document.createElement("a");
      Q.href = O.url, Q.target = "_blank", Q.rel = "noopener noreferrer", Q.textContent = O.reference, A.append(Q);
    }
  }, L = function() {
    N.setEnabled(!1), r = null, u = null, i = "", E(), S(Object.values(pe).find((O) => O.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, s = function(O) {
    o.replaceChildren();
    for (const { severity: A, line: Q, message: V, source: M } of O) {
      const $ = document.createElement("li");
      $.className = A, $.textContent = `${A.toUpperCase()}${M && M !== "input.cir" ? " · " + M : ""}${Q ? " · line " + Q : ""}: ${V}`, o.append($);
    }
    U("messages").open = O.some((A) => A.severity !== "info"), U("message-count").textContent = `${O.length} message${O.length === 1 ? "" : "s"}`;
  }, w = function() {
    e.querySelector("svg")?.setAttribute("viewBox", `${g.x} ${g.y} ${g.w} ${g.h}`), U("zoom-level").textContent = Math.round(_.w / g.w * 100) + "%";
  }, x = function(O, A = g.x + g.w / 2, Q = g.y + g.h / 2) {
    if (!e.querySelector("svg")) return;
    const V = Math.max(0.05, Math.min(10, g.w * O / _.w)) * _.w / g.w;
    g = { x: A + (g.x - A) * V, y: Q + (g.y - Q) * V, w: g.w * V, h: g.h * V }, w();
  }, v = function(O) {
    const A = new URLSearchParams();
    O && A.set("instance", O);
    const Q = A.toString();
    location.hash.slice(1) === Q ? (l = O, j()) : location.hash = Q;
  }, P = function() {
    l = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, B = function() {
    const O = !!(p && p !== l && d?.contexts[p]);
    U("selection-actions").hidden = !O, U("open-instance").href = "#" + new URLSearchParams({ instance: p });
  }, T = function() {
    U("breadcrumbs").replaceChildren();
    const O = (Q, V) => {
      const M = document.createElement("button");
      M.type = "button", M.textContent = Q, M.onclick = () => v(V), M.disabled = V === l, U("breadcrumbs").append(M);
    };
    if (O("Top", ""), l) {
      const Q = d.contexts[l].path;
      for (let V = 0; V < Q.length; V++) O(Q[V], Q.slice(0, V + 1).map(encodeURIComponent).join("/"));
    }
    U("instances").replaceChildren();
    const A = (Q, V) => {
      for (const M of Q.children) {
        const $ = document.createElement("div");
        $.className = "spice-instance-row", $.style.setProperty("--depth", Math.min(V, 8)), $.dataset.instance = M.id;
        const ee = document.createElement("a");
        ee.href = "#" + new URLSearchParams({ instance: M.id }), ee.textContent = M.name + " · " + M.definition, ee.title = "Open " + M.id + " as its own sheet";
        const te = document.createElement("span");
        if (te.className = "spice-help", te.textContent = Object.entries(M.params).map(([K, Y]) => K + "=" + Y).join(" · "), $.append(ee), te.textContent) {
          const K = document.createElement("details"), Y = document.createElement("summary");
          Y.textContent = "Parameters", K.append(Y, te), $.append(K);
        }
        U("instances").append($), A(M, V + 1);
      }
    };
    A(d.contexts[l], 0), U("hierarchy-panel").hidden = !d.contexts[l].children.length, U("focus-title").textContent = l ? l + " / " + d.contexts[l].definition : "Top-level schematic", B();
  };
  Zt(re);
  const t = U("input"), e = U("preview"), n = U("status"), o = U("diagnostics");
  let r = null, u = null, f = !1, i = "", c, d, a, y = "", l = "", p = "", b = !1, g = { x: 0, y: 0, w: 1, h: 1 }, _ = { ...g }, m, h = !1, I = {};
  try {
    I = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  re.addEventListener("click", (O) => {
    b && O.target.closest('a[href^="#"]') && O.preventDefault();
  });
  const E = () => {
    U("copy").disabled = U("download").disabled = !i || b, U("download-asc").disabled = U("download-asc-bundle").disabled = !i || !r || b || f;
  }, k = () => ({ font: U("font").value, fontSize: Number(U("size").value), color: Oe, detailed: U("detailed").checked, conventional: U("conventional").checked }), N = Yt(U, (O, A) => {
    const Q = e.querySelector("svg");
    if (!Q) return;
    Kt(Q, A, O);
    const V = Q.cloneNode(!0);
    V.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), i = new XMLSerializer().serializeToString(V), U("source").value = i;
  });
  N.setEnabled(!1), t.value = je;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || je;
  } catch {
  }
  S(Object.values(pe).find((O) => O.source === t.value)), t.addEventListener("input", L);
  for (const O of ["font", "size", "detailed", "conventional"]) U(O).addEventListener("input", L);
  U("zoom-in").onclick = () => x(0.8), U("zoom-out").onclick = () => x(1.25), U("fit").onclick = () => {
    g = { ..._ }, w();
  };
  const D = (O) => {
    const A = e.querySelector("svg");
    return A ? new DOMPoint(O.clientX, O.clientY).matrixTransform(A.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (O) => {
    const A = D(O);
    A && (O.preventDefault(), x(O.deltaY > 0 ? 1.12 : 1 / 1.12, A.x, A.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (O) => {
    O.button !== 0 || !e.querySelector("svg") || (m = { start: D(O), x: O.clientX, y: O.clientY, view: { ...g }, moved: !1 }, e.setPointerCapture(O.pointerId));
  }), e.addEventListener("pointermove", (O) => {
    if (!m) return;
    const A = D(O);
    Math.hypot(O.clientX - m.x, O.clientY - m.y) > 4 && (m.moved = !0), g.x += m.start.x - A.x, g.y += m.start.y - A.y, w();
  }), e.addEventListener("pointerup", (O) => {
    if (!m) return;
    const A = m.moved;
    if (m = null, e.hasPointerCapture(O.pointerId) && e.releasePointerCapture(O.pointerId), !A) {
      const Q = document.elementFromPoint(O.clientX, O.clientY)?.closest("[data-component]"), V = c?.components.find((M) => M.name === Q?.dataset.component);
      V && (p = V.instanceId || "", U("selection").textContent = `${V.raw}
${Object.entries(V.terminals).map(([M, $]) => `${M} → ${$}`).join("   ")}`, V.kind === "X" ? v(V.instanceId) : B());
    }
  }), window.addEventListener("hashchange", () => {
    if (b) {
      h = !0;
      return;
    }
    P(), p = "", j();
  }), e.addEventListener("pointercancel", () => {
    m = null;
  }), e.addEventListener("keydown", (O) => {
    const A = O.target.closest("[data-instance]");
    if (A && (O.key === "Enter" || O.key === " ")) {
      O.preventDefault(), p = A.dataset.instance, v(p);
      return;
    }
    O.key === "+" || O.key === "=" ? x(0.8) : O.key === "-" ? x(1.25) : O.key.toLowerCase() === "f" ? (g = { ..._ }, w()) : O.key.startsWith("Arrow") && (O.preventDefault(), g.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[O.key] || 0) * g.w, g.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[O.key] || 0) * g.h, w());
  });
  async function j() {
    if (b) return;
    b = !0, N.setEnabled(!1), r = null, u = null, i = "", E(), U("generate").disabled = !0, t.readOnly = !0, U("file").disabled = !0, U("libraries").disabled = !0;
    for (const A of re.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) A.disabled = !0;
    n.textContent = "Parsing netlist and routing wires…", e.setAttribute("aria-busy", "true");
    let O = [];
    try {
      if (y !== t.value || !d) {
        if (a = gt(t.value, { files: I }), O = [...a.diagnostics], O.some((R) => R.severity === "error"))
          throw d = null, Error("Fix the parser errors below before generating.");
        d = Ce(a), y && y !== t.value ? (l = "", p = "", history.replaceState(null, "", location.pathname + location.search)) : P(), y = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (O = [...a.diagnostics], s(O), O.some((R) => R.severity === "error")) throw Error("Fix the parser errors below before generating.");
      c = Mt(d, { focus: l });
      for (const R of c.interfaceAliases) O.push({ severity: "info", message: `Instance boundary: ${R.ports.join(" = ")} share parent node ${R.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const A = Dt(c);
      k().conventional && O.push(...c.layout.diagnostics);
      const Q = await jt(A, k()), V = new DOMParser().parseFromString(Q.svg, "image/svg+xml");
      if (V.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const M = V.documentElement, $ = M.querySelector("#spice-layout-report");
      if ($) {
        c.layout.report = JSON.parse($.textContent);
        const R = c.layout.report;
        if (O.push({ severity: "info", message: `Layout: compact signal flow; ${R.powerSourcesChecked} DC/ground symbols checked, ${R.powerOrderViolations} DC order preference(s) unmet. ${R.powerPass}. ${R.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), R.classicTemplateFallback && O.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), R.groundPlacement && O.push({ severity: "info", message: `Ground: ${R.groundPlacement}; ${R.straightenedGroundDrops || 0} return-path simplification(s).` }), R.explicitGroups && O.push({ severity: "info", message: `Layout comments: ${R.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), R.classicRails && O.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${R.railCount} shared voltage rails.` }), R.localClassicInstances?.length && O.push({ severity: "info", message: `${R.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), R.localClassicStages?.length && O.push({ severity: "info", message: `Classic transistor proximity active: ${R.localClassicStages.join(", ")}.` }), R.sharedClassicRails && O.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), R.mirroredTransistors?.length && O.push({ severity: "info", message: `Control-pin mirror choices: ${R.mirroredTransistors.join(", ")}.` }), R.recognizedMotifs?.length && O.push({ severity: "info", message: `Transistor structures: ${R.recognizedMotifs.map((F) => `${F.kind} (${F.members.join(", ")}; ${F.confidence})`).join("; ")}.` }), R.appliedMotifs?.length && O.push({ severity: "info", message: `Topology preferences applied to ${R.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), R.subnetFirstFallback && O.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + R.subnetFirstFallback }), R.pairCompactionFallback && O.push({ severity: "warning", message: "Pair proximity kept the original regions: " + R.pairCompactionFallback }), R.compoundPairFallback && O.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + R.compoundPairFallback }), R.pairConstraints?.length) {
          const F = R.pairConstraints.filter((q) => q.crossRegion && !q.compacted).length;
          O.push({ severity: "info", message: `${R.pairConstraints.length - F} adjacent transistor pair(s); ${F} cross-region mirror row constraint(s).` });
        }
        R.netShortcuts && O.push({ severity: "info", message: `${R.netShortcuts} safe straight net shortcut(s); ${R.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), R.sharedRailFallback && O.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${R.sharedRailFallback}.` });
        for (const F of R.localClassicFallbacks || []) F.stage && O.push({ severity: "info", message: `Classic stage ${F.stage} uses automatic layout: ${F.reason || "No unobstructed local template"}.` });
        R.geometricConnectivityVerified && O.push({ severity: "info", message: `Net geometry verified; ${R.cyclesRemoved} same-net loop(s) and ${R.leavesRemoved} unused wire branch(es) removed.` }), s(O);
      }
      if (M.localName !== "svg" || M.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const ee = Number(M.getAttribute("width")), te = Number(M.getAttribute("height"));
      _ = { x: -20, y: -20, w: ee + 40, h: te + 40 }, g = { ..._ }, M.setAttribute("viewBox", `${_.x} ${_.y} ${_.w} ${_.h}`), M.setAttribute("width", String(_.w)), M.setAttribute("height", String(_.h)), M.setAttribute("role", "img"), M.setAttribute("aria-label", c.title || "SPICE schematic"), M.setAttribute("style", "background:white");
      for (const R of c.components) {
        const F = V.getElementById("cell_" + R.name);
        if (!F) throw Error("Renderer omitted component " + R.name);
        F.setAttribute("data-component", R.name), R.kind === "X" && (F.setAttribute("data-instance", R.instanceId), F.setAttribute("role", "button"), F.setAttribute("tabindex", "0"), F.setAttribute("aria-label", "Open " + R.name));
        const q = V.createElementNS(M.namespaceURI, "title");
        q.textContent = R.raw + `
Resolved: ` + R.value + `
` + Object.entries(R.terminals).map(([ce, le]) => ce + ": " + le).join(", "), F.prepend(q);
      }
      for (const R of Object.values(c.nodes))
        for (const F of M.querySelectorAll(".net_" + R.bit)) {
          F.setAttribute("data-net", R.name);
          const q = V.createElementNS(M.namespaceURI, "title");
          q.textContent = "Node " + R.displayName, F.append(q);
        }
      const K = c.components.filter((R) => R.kind === "K").map((R) => ({ name: R.name, inductors: R.coupledInductors, value: R.value }));
      if (K.length) {
        const R = V.createElementNS(M.namespaceURI, "metadata");
        R.setAttribute("id", "spice-magnetic-couplings"), R.textContent = JSON.stringify(K), M.append(R);
        for (const F of K) for (const q of F.inductors) {
          const ce = V.getElementById("cell_" + q);
          if (!ce) continue;
          const le = V.createElementNS(M.namespaceURI, "circle"), ge = [...ce.children].find((be) => be.getAttribute("s:pid") === "A"), We = ge?.getAttribute("s:position"), xe = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[We] || [0, 0];
          for (const [be, He] of Object.entries({ cx: Number(ge?.getAttribute("s:x")) + xe[0], cy: Number(ge?.getAttribute("s:y")) + xe[1], r: 3, fill: k().color, stroke: "none", "data-coupling": F.name })) le.setAttribute(be, String(He));
          const Se = V.createElementNS(M.namespaceURI, "title");
          Se.textContent = F.name + " · dotted terminal: " + F.inductors.join(", "), le.append(Se), ce.append(le);
        }
      }
      r = Q.drawing, i = new XMLSerializer().serializeToString(M), U("source").value = i, e.replaceChildren(document.importNode(M, !0)), w();
      const Y = O.filter((R) => R.severity === "warning").length;
      n.textContent = `${c.components.filter((R) => !R.synthetic).length} components · ${Object.keys(c.nodes).length} nodes · ${c.topology.leafCount} primitive devices verified${c.interfaceAliases.length ? " · Parent-connected ports: " + c.interfaceAliases.map((R) => R.ports.join(" = ")).join("; ") + "." : ""}${Y ? " · Review " + Y + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${_e}.`, c.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${c.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), c.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), N.setCircuit(c, t.value), U("json").value = JSON.stringify({ circuit: c, netlist: A, hierarchy: a }, null, 2), U("selection").textContent = "Click a component to inspect its original statement and pin connections.", T();
    } catch (A) {
      if (e.replaceChildren(), i = "", U("source").value = "", U("json").value = "", U("nets").replaceChildren(), U("selection").textContent = "", n.textContent = A.message, !d)
        U("hierarchy-panel").hidden = !0, U("selection-actions").hidden = !0, U("breadcrumbs").replaceChildren();
      else if (!d.contexts[l]) {
        const Q = document.createElement("button");
        Q.type = "button", Q.textContent = "Return to Top", Q.onclick = () => v(""), U("breadcrumbs").replaceChildren(Q);
      }
      N.setCircuit(null, t.value), A.diagnostics && (O = A.diagnostics), O.some((Q) => Q.severity === "error") || O.push({ severity: "error", line: 0, message: A.message }), s(O);
    } finally {
      b = !1, U("generate").disabled = !1, t.readOnly = !1, U("file").disabled = !1, U("libraries").disabled = !1;
      for (const A of re.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) A.disabled = !1;
      d && d.contexts[l] && T(), N.setEnabled(!!i), e.setAttribute("aria-busy", "false"), E(), h && (h = !1, P(), queueMicrotask(j));
    }
  }
  U("generate").onclick = j;
  for (const O of re.querySelectorAll("[data-example]")) O.onclick = () => {
    const A = pe[O.dataset.example];
    t.value = A.source, L(), S(A), j();
  };
  U("file").onchange = async (O) => {
    const A = O.target.files[0];
    if (A) {
      if (A.size > 2e6) {
        n.textContent = "File exceeds 2 MB.";
        return;
      }
      try {
        t.value = await Me(A), L(), j();
      } catch (Q) {
        n.textContent = "File could not be read: " + Q.message;
      } finally {
        O.target.value = "";
      }
    }
  }, U("libraries").onchange = async (O) => {
    try {
      for (const A of O.target.files) {
        if (A.size > 16e6) throw Error("Library exceeds 16 MB: " + A.name);
        I[A.webkitRelativePath || A.name] = await Me(A);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(I));
      } catch {
      }
      d = null, y = "", U("library-status").textContent = Object.keys(I).length + " library file(s) loaded", j();
    } catch (A) {
      n.textContent = A.message;
    } finally {
      O.target.value = "";
    }
  }, U("library-status").textContent = Object.keys(I).length ? "Libraries restored from this session." : "For .include / .lib dependencies", U("download").onclick = () => {
    const O = URL.createObjectURL(new Blob([i], { type: "image/svg+xml;charset=utf-8" })), A = document.createElement("a");
    A.href = O, A.download = "spice-schematic.svg", A.click(), setTimeout(() => URL.revokeObjectURL(O), 1e3);
  };
  async function W(O) {
    const A = r;
    if (!(!A || b || f)) {
      f = !0, E(), n.textContent = "Generating ASC from the selected layout and checking connections…";
      try {
        const { exportAsc: Q } = await import("./asc-export-BOgLsAMs.js");
        if (r !== A) throw Error("Schematic changed. Generate again before exporting ASC.");
        u ||= Q({ tree: d, circuit: c, drawing: A, source: t.value, libraries: I });
        const V = O ? u.zip : u.ascBytes, M = URL.createObjectURL(new Blob([V], { type: O ? "application/zip" : "application/octet-stream" })), $ = document.createElement("a");
        $.href = M, $.download = O ? "spice-schematic-asc.zip" : "spice-schematic.asc", $.click(), setTimeout(() => URL.revokeObjectURL(M), 1e3), n.textContent = "ASC connections verified · " + u.manifest.audit.symbols + " symbols. " + (O ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), u.manifest.warnings.length && (n.textContent += " " + u.manifest.warnings.join(" "));
      } catch (Q) {
        n.textContent = "ASC export failed: " + Q.message;
        const V = document.createElement("li");
        V.className = "error", V.textContent = n.textContent, o.append(V);
      } finally {
        f = !1, E();
      }
    }
  }
  U("download-asc").onclick = () => W(!1), U("download-asc-bundle").onclick = () => W(!0), U("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(i), n.textContent = "SVG source copied to clipboard.";
    } catch {
      U("source-details").open = !0, U("source").focus(), U("source").select(), n.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, j();
}
export {
  Ee as b,
  Ce as e,
  se as l,
  ye as n,
  Et as p
};
