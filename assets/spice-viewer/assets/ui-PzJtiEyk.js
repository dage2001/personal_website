const dn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, un = { 1: "in", 6: "_Q", 7: "Q", 8: "com" }, fn = { 1: "CLK", 6: "Phi2", 7: "Phi1", 8: "com" }, pn = { 1: "D", 3: "CLK", 4: "PRE", 5: "CLR", 6: "_Q", 7: "Q", 8: "com" }, hn = { 1: "in", 2: "in-", 6: "_Q", 7: "Q", 8: "com" }, mn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, gn = { 1: "a", 2: "b", 7: "Q", 8: "com" }, bn = { 1: "S", 2: "R", 6: "_Q", 7: "Q", 8: "com" }, yn = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "_Q", 7: "Q", 8: "com" }, wn = { 1: "FM", 2: "AM", 6: "COS", 7: "SIN", 8: "com" }, xn = { 1: "invin", 2: "noninvin", 3: "mult+", 4: "mult-", 5: "-V", 6: "+V", 7: "out", 8: "com" }, vn = { 1: "in+", 2: "in-", 3: "CLK", 4: "S/H", 7: "out", 8: "com" }, En = { 1: "invin", 2: "noninvin", 7: "out", 8: "com" }, Nn = {
  AND: dn,
  BUF: un,
  COUNTER: fn,
  DFLOP: pn,
  SCHMITT: hn,
  OR: mn,
  PHASEDET: gn,
  SRFLOP: bn,
  XOR: yn,
  MODULATOR: wn,
  OTA: xn,
  SAMPLEHOLD: vn,
  VARISTOR: En
}, Sn = "A B C D E F G H I J K L M O Q R S T U V W X Z @ & Ö", je = (t) => t.toLowerCase(), Ot = (t) => t === void 0 || t.includes("=") || /^(?:off|on)$/i.test(t), _n = (t) => t.replace(/^\(/, "").replace(/\)$/, "").split(/[\s,]+/).filter(Boolean);
function Cn(t, e) {
  const n = (_) => e[je(_ || "")] || Object.entries(e).find(([b]) => b.startsWith(je(_ || "") + "."))?.[1], i = t[0][0].toUpperCase();
  let o = [], s = [], p = "", r = "", l = [], a = [], c = 0, x = "", g = "", d = "", m = !0;
  if ("RLC".includes(i))
    o = ["A", "B"], r = je(i) + "_v";
  else if ("DVIB".includes(i))
    o = ["+", "-"], r = i === "D" ? "d_v" : i === "B" ? "spice_b" : je(i);
  else if (i === "Q") {
    o = ["C", "B", "E"], !n(t[4]) && (n(t[5]) || !Ot(t[5]) && !/^[+\-\d.{'"]/.test(t[5])) && o.push("S"), p = t[o.length + 1] || "";
    const _ = n(p)?.type;
    m = ["NPN", "PNP"].includes(_), r = m ? (o.length === 3 ? "q_" : "spice_q4_") + je(_) : "spice_q" + o.length;
  } else if (i === "M") {
    const _ = n(t[4]), b = n(t[5]), y = _?.type === "VDMOS" || !b && (!t[5] || Ot(t[5]));
    o = y ? ["D", "G", "S"] : ["D", "G", "S", "B"], p = t[o.length + 1] || "";
    const k = n(p), I = k?.type;
    if (y && k && I !== "VDMOS") throw Error("Monolithic NMOS/PMOS requires a bulk terminal; three-terminal form requires VDMOS.");
    if (!y && I === "VDMOS") throw Error("VDMOS requires exactly D/G/S terminals.");
    m = ["NMOS", "PMOS", "VDMOS"].includes(I);
    let A = null, C = k;
    const M = /* @__PURE__ */ new Set();
    for (; C && !M.has(C.name) && (M.add(C.name), A = /\bpchan(?:\s*=\s*([+\-\d.e]+))?/i.exec(C.raw), !A); )
      C = n(C.baseModel);
    const B = I === "PMOS" || I === "VDMOS" && A && (A[1] === void 0 || Number(A[1]) >= 0.5);
    r = m ? "spice_" + (B ? "pmos" : "nmos") + (y ? "3" : "") : "spice_m";
  } else if ("JZ".includes(i)) {
    p = t[4] || "";
    const _ = n(p)?.type, b = i === "Z" && ["NIGBT", "PIGBT"].includes(_);
    o = b ? ["C", "G", "E"] : ["D", "G", "S"], m = i === "J" ? ["NJF", "PJF"].includes(_) : ["NMF", "PMF", "NIGBT", "PIGBT"].includes(_), r = "spice_" + (b ? "igbt" : i === "J" ? "jfet" : "mesfet") + "_" + (/^P/.test(_ || "") ? "p" : "n");
  } else if ("EFGH".includes(i)) {
    o = ["+", "-"], r = "spice_" + je(i);
    let _ = 3, b = /^poly\s*\(\s*(\d+)\s*\)$/i.exec(t[_] || "");
    if (/^poly$/i.test(t[_] || "") && (b = /^\(\s*(\d+)\s*\)$/.exec(t[++_] || ""), !b))
      throw Error("POLY requires a dimension.");
    if (b) {
      const y = Number(b[1]);
      if (y > 128) throw Error("POLY supports at most 128 controlling variables.");
      let k = _ + 1, I = [];
      const A = "EG".includes(i), C = y * (A ? 2 : 1);
      for (; I.length < C && k < t.length; ) I.push(..._n(t[k++]));
      if (I.length !== C || k >= t.length) throw Error("POLY control count or coefficient list is incomplete.");
      if (A) {
        for (let M = 0; M < y; M++) o.push("C" + (M + 1) + "+", "C" + (M + 1) + "-");
        s = [t[1], t[2], ...I];
      } else l = I;
      c = k, x = "POLY(" + y + ") " + (A ? "" : I.join(" ") + " "), g = "POLY", A && (r = "spice_device");
    } else /^(?:value|vol|cur|table|laplace|[VI]\s*=)/i.test(t[3] || "") || t[3]?.startsWith("{") ? g = "BEHAVIORAL" : "EG".includes(i) ? (o.push("C+", "C-"), g = /\blaplace\s*=/i.test(t.slice(5).join(" ")) ? "LAPLACE" : /\btable\s*=/i.test(t.slice(5).join(" ")) ? "TABLE" : "LINEAR") : (l = [t[3]], c = 4, x = t[3] + " ");
    d = { E: "VCVS", G: "VCCS", F: "CCCS", H: "CCVS" }[i] + (g ? " · " + g : "");
  } else if (i === "S")
    o = ["A", "B", "C+", "C-"], p = t[5] || "", r = "spice_device", d = "Voltage switch";
  else if (i === "W")
    o = ["A", "B"], l = [t[3]], p = t[4] || "", c = 3, r = "spice_device", d = "Current switch";
  else if ("TO".includes(i))
    o = ["L+", "L-", "R+", "R-"], i === "O" && (p = t[5] || ""), r = "spice_device", d = i === "T" ? "Transmission line" : "Lossy line";
  else if (i === "U")
    o = ["N1", "N2", "COM"], p = t[4] || "", r = "spice_device", d = "Distributed RC";
  else if (i === "A")
    o = Array.from({ length: 8 }, (_, b) => "P" + (b + 1)), r = "spice_device", d = t[9] || "A function";
  else if (i === "K") {
    if (t.length < 4) throw Error("Mutual coupling requires at least two inductors and a coefficient.");
    if (a = t.slice(1, -1), a.some((_) => !/^L/i.test(_.split(":").at(-1)))) throw Error("K references must name inductors.");
    c = t.length - 1, r = "spice_coupling", d = "Magnetic coupling", x = a.join(" ") + " · k=";
  } else if (i === "@")
    o = ["IN", "OUT"], r = "spice_device", d = "FRA";
  else if (i === "&")
    o = ["O+", "O-", "I+", "I-"], r = "spice_device", d = "FRA probe";
  else if (i === "Ö")
    o = ["OUT", "V+", "V-", "IN-", "IN+"], r = "spice_device", d = "Transconductance";
  else throw Error("Unknown LTspice element prefix: " + i);
  if (c || (c = o.length + 1), s.length || (s = t.slice(1, o.length + 1)), s.length !== o.length) throw Error("Incomplete terminal list: expected " + o.length + " nodes.");
  if (t.length <= c && !["&", "Ö"].includes(i)) throw Error("Missing value, model, or expression after " + o.length + " terminals.");
  if (s.some((_) => /[=()]/.test(_) && !/^\{[\s\S]*\}$/.test(_))) throw Error("Invalid terminal token; check terminal count.");
  if (i === "B" && !/\b[VIPR]\s*=/i.test(t.slice(c).join(" "))) throw Error("Behavioral source requires V=, I=, R= or P=.");
  if (i === "B" && /^R\s*=/i.test(t.slice(c).join(" ")) && (r = "spice_br"), i === "D" && (p = t[3] || ""), i === "@") {
    const _ = t.slice(c).join(" ");
    for (const b of _.matchAll(/\b(refnode|intnode)\s*=\s*(\{[^}]*\}|"[^"]*"|[^\s]+)/gi))
      o.push(b[1].toUpperCase()), s.push(b[2]);
  }
  if (i === "A" && !t[9]) throw Error("A element requires eight terminals followed by its function name.");
  if (l.some((_) => !_)) throw Error("Missing controlling voltage source.");
  const h = o.map((_, b) => i === "A" && Nn[(t[9] || "").toUpperCase()]?.[String(b + 1)] || _);
  return { kind: i, pins: o, nodeTokens: s, pinLabels: h, model: p, type: r, controlSource: l[0] || "", controlSources: l, coupledInductors: a, value: x + t.slice(c).join(" "), sourceMode: g, symbol: d, polarityKnown: m };
}
const In = Sn, kn = new Set(In.split(" ")), pt = () => /* @__PURE__ */ Object.create(null), Se = (t) => t.toLowerCase();
function it(t) {
  const e = [], n = [];
  let i = "", o = 0, s = "";
  for (let p = 0; p < t.length; p++) {
    const r = t[p];
    if (s) {
      i += r, r === s && t[p - 1] !== "\\" && (s = "");
      continue;
    }
    if (r === '"' || r === "'") {
      s = r, i += r;
      continue;
    }
    if (!o && (r === ";" || r === "$" && (!p || /\s/.test(t[p - 1])))) break;
    if ("({".includes(r) && (n.push(r), o++), ")}".includes(r) && (o--, n.pop() !== (r === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(r) && !o ? (i && e.push(i), i = "") : i += r;
  }
  if (o || s) throw Error("Unclosed expression or quoted string.");
  return i && e.push(i), e;
}
function An(t, e = {}) {
  const n = [], i = [], o = [], s = Object.assign(pt(), e.models), p = pt(), r = (b, y, k) => n.push({ severity: b, line: y, message: k });
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 16e6) throw Error("Expanded netlist exceeds 16 MB.");
  const l = [];
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((b, y) => {
    const k = b.trim();
    !k || k.startsWith("*") || (k.startsWith("+") ? l.length ? l.at(-1).text += " " + k.slice(1).trim() : r("error", y + 1, "Continuation has no preceding statement.") : l.push({ line: y + 1, text: k }));
  });
  for (const b of l) {
    try {
      b.tokens = it(b.text);
    } catch (k) {
      r("error", b.line, k.message), b.tokens = [];
    }
    const y = b.tokens;
    if (/^\.model$/i.test(y[0] || ""))
      if (y.length < 3) r("error", b.line, ".model requires a name and device type.");
      else {
        const k = /^ako:(.+)$/i.exec(y[2]), I = k && y[3] && !y[3].startsWith("(") ? y[3].split("(")[0].toUpperCase() : "";
        s[Se(y[1])] = { name: y[1], type: k ? I : y[2].split("(")[0].toUpperCase(), baseModel: k?.[1] || "", raw: b.text };
      }
  }
  const a = /* @__PURE__ */ new Set();
  function c(b) {
    const y = s[Se(b)];
    if (!y) return "";
    if (y.type) return y.type;
    if (a.has(Se(b))) throw Error("Circular AKO model inheritance: " + b);
    return a.add(Se(b)), y.type = c(y.baseModel), a.delete(Se(b)), y.type;
  }
  for (const b of Object.values(s)) if (b.baseModel && !b.type)
    try {
      c(b.name);
    } catch (y) {
      r("error", 0, y.message);
    }
  let x = "", g = 0, d = !1, m = !1;
  const h = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: b, text: y, tokens: k } of l) {
    if (!k.length) continue;
    const I = Se(k[0]);
    if (m) {
      r("warning", b, "Statement after .end is not rendered: " + y);
      continue;
    }
    if (I === ".control") {
      d = !0, r("warning", b, ".control script retained but not executed or rendered.");
      continue;
    }
    if (I === ".endc") {
      d = !1;
      continue;
    }
    if (d) continue;
    if (I === ".subckt") {
      g++, r("error", b, "Use parseHierarchy() for subcircuit definitions.");
      continue;
    }
    if (I === ".ends") {
      g ? g-- : r("error", b, "Unmatched .ends.");
      continue;
    }
    if (g) continue;
    if (I === ".end") {
      m = !0;
      continue;
    }
    if (I.startsWith(".")) {
      i.push({ line: b, text: y }), I === ".title" ? x = k.slice(1).join(" ") : [".protect", ".unprotect", ".prot", ".unprot"].includes(I) ? r("error", b, "Protected/encrypted model bodies cannot be expanded. Provide an unencrypted definition.") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(I) ? r("error", b, "Topology-changing directive is unsupported: " + y) : _.has(I) || r("warning", b, "Directive retained but not resolved: " + y);
      continue;
    }
    const A = k[0][0].toUpperCase();
    if (!kn.has(A)) {
      b === 1 && !/\d/.test(k[0]) && k.length > 1 && A !== "X" ? (x = y, r("warning", b, "First line treated as a SPICE title; use .title for an unambiguous title.")) : r("warning", b, `Unsupported ${A} device was not rendered: ${y}`);
      continue;
    }
    const C = A === "M" || A === "Q" ? 5 : 4;
    if (b === 1 && !/\d/.test(k[0]) && (k.length < C || A === "T" && !/\b(?:zo|z0)\s*=/i.test(y))) {
      x = y, r("info", b, "SPICE title: " + y);
      continue;
    }
    try {
      if (h.has(I)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      const M = Cn(k, s), { pins: B, nodeTokens: N, ...w } = M;
      M.polarityKnown || r("warning", b, `${k[0]}: model polarity unknown; explicit ${B.join("/")} terminals retained.`);
      const G = pt();
      B.forEach(($, X) => {
        const Y = Se(N[X]);
        p[Y] || (p[Y] = { name: Y, displayName: k[X + 1], bit: Object.keys(p).length + 2, terminals: [] }), p[Y].terminals.push({ component: k[0], pin: $ }), G[$] = Y;
      }), o.push({ ...w, name: k[0], terminals: G, line: b, raw: y }), h.add(I);
    } catch (M) {
      r("error", b, `${k[0]}: ${M.message} Statement: ${y}`);
    }
  }
  g && r("error", 0, "Unclosed .subckt definition."), d && r("error", 0, "Unclosed .control block."), o.length || r("error", 0, "No supported components to render."), o.length > 300 && r("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const b of o) {
    for (const y of b.controlSources || []) !y.includes(":") && !o.some((k) => Se(k.name) === Se(y) && k.kind === "V") && r("error", b.line, `${b.name}: controlling voltage source ${y} was not found.`);
    for (const y of b.coupledInductors || []) !y.includes(":") && !o.some((k) => Se(k.name) === Se(y) && k.kind === "L") && r("error", b.line, `${b.name}: coupled inductor ${y} was not found.`);
    (b.kind === "B" || b.type === "spice_b") && r("info", b.line, `${b.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  }
  return { title: x, components: o, nodes: p, models: s, directives: i, diagnostics: n };
}
const Pe = (t) => t.replace(/^['"]|['"]$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase(), Tt = (t) => Pe(t).split("/").at(-1);
function On(t, { files: e = {}, filename: n = "input.cir" } = {}) {
  const i = new Map(e instanceof Map ? e : Object.entries(e)), o = [], s = [], p = [];
  let r = 0;
  const l = (c, x) => {
    const g = Pe(x).split("/").slice(0, -1).concat(Pe(c)).join("/"), d = [...i].filter(([h]) => Pe(h) === Pe(c) || Pe(h) === g);
    if (d.length === 1) return d[0];
    const m = [...i].filter(([h]) => Tt(h) === Tt(c));
    if (m.length !== 1) throw Error(m.length ? "Ambiguous library filename: " + c : "Missing library " + c + ". Add this file using Library files.");
    return m[0];
  };
  function a(c, x, g = "", d = []) {
    const m = Pe(x) + ":" + g.toLowerCase();
    if (d.includes(m)) throw Error("Circular library include: " + [...d, m].join(" → "));
    if (d.length > 32) throw Error("Library nesting exceeds 32 levels.");
    const h = [], _ = /^\s*\.endl\b/im.test(c);
    let b = !g;
    const y = (I, A) => {
      if (r += I.length, r > 16e6) throw Error("Expanded library input exceeds 16 MB.");
      p.push(I), s.push({ file: x, line: A + 1 });
    };
    if (c.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((I, A) => {
      const C = I.trim();
      if (/^\.lib\b/i.test(C) && _) {
        const M = it(C);
        if (M.length === 2 && !/[.\\/]/.test(M[1])) {
          h.push(M[1].toLowerCase()), M[1].toLowerCase() === g.toLowerCase() && (b = !0), y("* Library section " + M[1], A);
          return;
        }
      }
      if (/^\.endl\b/i.test(C)) {
        h.pop(), y("* End library section", A);
        return;
      }
      if (g && h.length && !h.includes(g.toLowerCase())) {
        y("* Unselected library section", A);
        return;
      }
      if (/^\.(?:include|inc|lib)\b/i.test(C))
        try {
          const M = it(C);
          if (!M[1]) throw Error("Include requires a filename.");
          const [B, N] = l(M[1], x);
          y("* Included " + B, A), a(N, B, M[2] || "", [...d, m]);
        } catch (M) {
          o.push({ severity: "error", line: A + 1, source: x, message: M.message }), y("* Unresolved include", A);
        }
      else y(I, A);
    }), !b) throw Error("Library section " + g + " not found in " + x);
  }
  try {
    a(t, n);
  } catch (c) {
    o.push({ severity: "error", line: 0, source: n, message: c.message });
  }
  return { source: p.join(`
`), origins: s, diagnostics: o };
}
function Tn(t) {
  const e = [], n = /* @__PURE__ */ new Map(), i = [0], o = [];
  t.split(/\r?\n/).forEach((r, l) => {
    const a = r.trim();
    /^\.subckt\b/i.test(a) && (i.push(l + 1), n.set(l + 1, [])), i.at(-1) ? n.get(i.at(-1)).push({ raw: r, line: l + 1 }) : e[l] = r, /^\.ends\b/i.test(a) && i.length > 1 && i.pop();
  });
  const s = Mt(Array.from({ length: t.split(/\r?\n/).length }, (r, l) => e[l] || "").join(`
`));
  o.push(...s.diagnostics);
  const p = /* @__PURE__ */ new Map();
  for (const [r, l] of n) {
    const a = Mt(l.map((c) => c.raw).join(`
`));
    p.set(r, a.layout), o.push(...a.diagnostics.map((c) => ({ ...c, line: l[c.line - 1]?.line || r })));
  }
  return { layout: s.layout, scopes: p, diagnostics: o };
}
function Mt(t) {
  const e = [], n = [];
  let i = !1, o = !1, s = 0;
  if (t.split(/\r?\n/).forEach((y, k) => {
    const I = y.trim();
    if (/^\*\s*@layout\s+begin\b/i.test(I)) {
      (o || i) && e.push({ severity: "error", line: k + 1, message: "Only one @layout block is allowed." }), /^\*\s*@layout\s+begin\s+v1\s*$/i.test(I) || e.push({ severity: "error", line: k + 1, message: "Expected @layout begin v1." }), o = !0, i = !0, s = k + 1;
      return;
    }
    if (/^\*\s*@layout\s+end\s*$/i.test(I)) {
      i || e.push({ severity: "error", line: k + 1, message: "Unexpected @layout end." }), i = !1;
      return;
    }
    i && (I.startsWith("*") ? n.push(I.slice(1).trim()) : e.push({ severity: "error", line: k + 1, message: "Every @layout line must be a SPICE * comment." }));
  }), i && e.push({ severity: "error", line: s, message: "Unclosed @layout block." }), !o) return { layout: null, diagnostics: e };
  const p = n.join(" "), r = p.match(/[A-Za-z_@][\w./%:@-]*|\d+|[{}]|\S/g) || [], l = [], a = [], c = [], x = [];
  let g = 0, d = 0, m = 10;
  const h = () => r[g++], _ = () => {
    const y = h();
    if (!y || !/^[A-Za-z_@][\w./%:@-]*$/.test(y)) throw Error("Expected layout identifier, got " + y);
    return y;
  };
  function b(y) {
    if (l.length >= 256) throw Error("Layout description exceeds 256 groups.");
    const k = y ? _() : "@row" + d++, I = h();
    if (!["row", "column", "classic"].includes(I)) throw Error("Expected row, column or classic.");
    if (h() !== "{") throw Error("Expected { after " + I);
    const A = { id: k, direction: I, members: [] };
    for (l.push(A); g < r.length && r[g] !== "}"; )
      r[g] === "group" ? (h(), A.members.push(b(!0))) : ["row", "column"].includes(r[g]) ? A.members.push(b(!1)) : A.members.push(_());
    if (h() !== "}") throw Error("Unclosed group " + k);
    if (!A.members.length) throw Error("Empty layout group " + k);
    return k;
  }
  try {
    for (; g < r.length; )
      if (r[g] === "group")
        h(), b(!0);
      else if (["row", "column"].includes(r[g])) b(!1);
      else if (r[g] === "face") {
        h();
        const N = _(), w = h();
        if (!["left", "right"].includes(w)) throw Error("Expected face left or right.");
        if (x.some((G) => G.device.toLowerCase() === N.toLowerCase())) throw Error("Duplicate face device.");
        x.push({ device: N, side: w });
      } else if (r[g] === "pair") {
        h();
        const N = h();
        if (!["mirror", "differential", "vbe", "darlington", "sziklai", "cascode", "current-limit", "push-pull"].includes(N)) throw Error("Unknown pair kind. Expected mirror, differential, vbe, darlington, sziklai, cascode, current-limit or push-pull.");
        if (h() !== "{") throw Error("Expected { after pair kind.");
        const w = [];
        for (; g < r.length && r[g] !== "}"; ) w.push(_());
        if (h() !== "}" || !w.length) throw Error("Empty or unclosed pair.");
        if (c.length >= 256) throw Error("Layout description exceeds 256 pairs.");
        c.push({ kind: N, members: w });
      } else if (r[g] === "priority-cap") {
        if (h(), m = Number(h()), !Number.isInteger(m) || m < 3 || m > 64) throw Error("priority-cap must be an integer from 3 to 64.");
      } else if (h() === "place") {
        const N = _(), w = h(), G = _();
        if (!["left-of", "above"].includes(w)) throw Error("Expected left-of or above.");
        a.push({ a: N, relation: w, b: G });
      } else throw Error("Unknown layout instruction near " + r[g - 1]);
    const y = /* @__PURE__ */ new Set();
    for (const N of l) {
      const w = N.id.toLowerCase();
      if (y.has(w)) throw Error("Duplicate layout group " + N.id);
      y.add(w);
    }
    const k = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set(), A = new Map(l.map((N) => [N.id.toLowerCase(), N])), C = (N) => {
      if (k.has(N)) throw Error("Circular layout group " + N);
      if (!I.has(N)) {
        k.add(N);
        for (const w of A.get(N).members) A.has(w.toLowerCase()) && C(w.toLowerCase());
        k.delete(N), I.add(N);
      }
    };
    for (const N of A.keys()) C(N);
    const M = /* @__PURE__ */ new Map();
    for (const N of a) {
      if (N.a.toLowerCase() === N.b.toLowerCase()) throw Error("Self-relative layout constraint.");
      M.has(N.a.toLowerCase()) || M.set(N.a.toLowerCase(), []), M.get(N.a.toLowerCase()).push(N.b.toLowerCase());
    }
    k.clear(), I.clear();
    const B = (N) => {
      if (k.has(N)) throw Error("Circular place constraints.");
      if (!I.has(N)) {
        k.add(N);
        for (const w of M.get(N) || []) B(w);
        k.delete(N), I.add(N);
      }
    };
    for (const N of M.keys()) B(N);
  } catch (y) {
    e.push({ severity: "error", line: s, message: "Layout description: " + y.message });
  }
  return { layout: { version: 1, priorityCap: m, groups: l, relations: a, pairs: c, faces: x }, diagnostics: e };
}
function Mn(t, e) {
  const n = e.focus ? t.ir.scopes[t.contexts[e.focus].scopeId].layoutDescription : null;
  let i = e.focus ? n : t.ir.layoutDescription;
  if (!i) return null;
  if (n) {
    const d = new Set(n.groups.map((h) => h.id.toLowerCase())), m = (h) => d.has(h.toLowerCase()) ? h : e.components.find((b) => b.synthetic && b.value.toLowerCase() === h.toLowerCase())?.name || e.focus + "/" + h;
    i = { ...n, groups: n.groups.map((h) => ({ ...h, members: h.members.map(m) })), relations: n.relations.map((h) => ({ ...h, a: m(h.a), b: m(h.b) })), faces: (n.faces || []).map((h) => ({ ...h, device: m(h.device) })), pairs: (n.pairs || []).map((h) => ({ ...h, members: h.members.map(m) })) };
  }
  const o = new Map(i.groups.map((d) => [d.id.toLowerCase(), d])), s = Object.values(t.contexts).flatMap((d) => d.devices.map((m) => m.name)), p = new Set([...Object.keys(t.contexts), ...s, ...e.components.map((d) => d.name)].map((d) => d.toLowerCase()));
  for (const d of o.values()) if (p.has((n ? e.focus + "/" + d.id : d.id).toLowerCase())) throw Error("Layout group name conflicts with a circuit instance/device: " + d.id);
  for (const d of o.values()) for (const m of d.members) if (!o.has(m.toLowerCase()) && !p.has(m.toLowerCase())) throw Error("Unknown @layout instance/device: " + m);
  for (const d of i.relations) for (const m of [d.a, d.b]) if (!o.has(m.toLowerCase()) && !p.has(m.toLowerCase())) throw Error("Unknown @layout place target: " + m);
  const r = (i.pairs || []).map((d) => ({ ...d, members: d.members.map((m) => {
    const h = e.components.find((_) => _.name.toLowerCase() === m.toLowerCase());
    if (!h || h.synthetic || h.block) throw Error("Unknown or non-visible @layout pair device: " + m);
    return h.name;
  }) })), l = (i.faces || []).map((d) => {
    const m = e.components.find((h) => h.name.toLowerCase() === d.device.toLowerCase());
    if (!m || !["Q", "M", "J", "Z"].includes(m.kind)) throw Error("Unknown or unsupported @layout face device: " + d.device);
    return { ...d, device: m.name };
  }), a = /* @__PURE__ */ new Map(), c = [], x = new Set(Object.keys(t.contexts).map((d) => d.toLowerCase()));
  for (const d of i.groups) {
    const m = [];
    for (const h of d.members) {
      if (o.has(h.toLowerCase())) {
        m.push({ group: h });
        continue;
      }
      for (const _ of e.components) if (_.name.toLowerCase() === h.toLowerCase() || _.name.toLowerCase().startsWith(h.toLowerCase() + "/")) {
        if (a.has(_.name)) throw Error("Overlapping @layout membership: " + _.name);
        a.set(_.name, d.id), m.push({ cell: _.name, ...x.has(h.toLowerCase()) ? { instance: h } : {} });
      }
    }
    c.push({ id: d.id, direction: d.direction, members: m });
  }
  const g = /* @__PURE__ */ new Set();
  for (const d of c) for (const m of d.members) if (m.group) {
    const h = m.group.toLowerCase();
    if (g.has(h)) throw Error("Layout group has multiple parents: " + m.group);
    g.add(h);
  }
  return { version: 1, priorityCap: i.priorityCap, groups: c, relations: i.relations, pairs: r, faces: l };
}
const Ge = () => /* @__PURE__ */ Object.create(null), ve = (t) => t.toLowerCase();
function Kt(t) {
  const e = Ge();
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (/^params?:$/i.test(i)) continue;
    const o = /^([a-z_][\w.$]*)(?:=([\s\S]*))?$/i.exec(i);
    if (!o) throw Error("Expected named parameter assignment, got: " + i);
    const s = ve(o[1]);
    let p = o[2];
    if (p === void 0) {
      const r = /^=([\s\S]*)$/.exec(t[++n] || "");
      if (!r) throw Error("Expected = after parameter " + s);
      p = r[1];
    }
    if (p || (p = t[++n]), !p || /^params?:$/i.test(p)) throw Error("Missing value for parameter " + s);
    if (Object.hasOwn(e, s)) throw Error("Duplicate parameter: " + s);
    e[s] = p;
  }
  return e;
}
function Rt(t) {
  const e = t.findIndex((n, i) => /^params?:$/i.test(n) || n.includes("=") || t[i + 1] === "=");
  return e < 0 ? [t, Ge()] : [t.slice(0, e), Kt(t.slice(e))];
}
function Lt(t, e = {}) {
  if (typeof t != "string") throw TypeError("Netlist must be a string.");
  if (t.length > 2e6) throw Error("Netlist exceeds the limit of 2 MB.");
  const n = On(t, e);
  t = n.source;
  const i = Tn(t), o = [...n.diagnostics, ...i.diagnostics], s = Ge(), p = /* @__PURE__ */ new Set(["0"]), r = (y, k, I) => o.push({ severity: y, line: k, message: I }), l = (y, k, I, A = [], C = Ge(), M = 0) => {
    const B = { id: y, name: k, parent: I, ports: A, defaults: C, parameters: Ge(), definitions: Ge(), devices: [], instances: [], directives: [], line: M, statements: [], layoutDescription: i.scopes.get(M) || null };
    return s[y] = B, B;
  }, a = l("root", "Top", null), c = [a], x = [];
  let g = !1, d = !1;
  t.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((y, k) => {
    const I = y.trim();
    !I || I.startsWith("*") || (I.startsWith("+") ? x.length ? x.at(-1).text += " " + I.slice(1).trim() : r("error", k + 1, "Continuation has no preceding statement.") : x.push({ text: I, line: k + 1 }));
  });
  for (const { text: y, line: k } of x)
    try {
      const I = it(y);
      if (!I.length) continue;
      const A = ve(I[0]), C = c.at(-1);
      if (d) {
        r("warning", k, "Statement after .end is not rendered: " + y);
        continue;
      }
      if (A === ".control") {
        g = !0, r("warning", k, ".control script retained but not executed or rendered.");
        continue;
      }
      if (A === ".endc") {
        g = !1;
        continue;
      }
      if (g) continue;
      if (A === ".subckt") {
        if (I.length < 2) throw Error(".SUBCKT requires a name.");
        const [M, B] = Rt(I.slice(2)), N = ve(I[1]);
        if (Object.hasOwn(C.definitions, N)) throw Error("Duplicate subcircuit definition: " + I[1]);
        const w = M.map(ve);
        if (new Set(w).size !== M.length || w.includes("0")) throw Error("Subcircuit formal ports must be unique and cannot be ground 0.");
        if (M.some(($) => /[{}()=]/.test($))) throw Error("Invalid formal port.");
        if (c.length > 64) throw Error("Definition nesting exceeds 64 levels.");
        const G = C.id + "/" + encodeURIComponent(N);
        C.definitions[N] = G, c.push(l(G, I[1], C.id, M, B, k));
        continue;
      }
      if (A === ".ends") {
        if (c.length === 1) throw Error("Unmatched .ENDS.");
        if (I[1] && ve(I[1]) !== ve(C.name)) throw Error(".ENDS name does not match " + C.name);
        c.pop();
        continue;
      }
      if (A === ".end") {
        if (c.length > 1) throw Error(".END inside a subcircuit; expected .ENDS.");
        d = !0;
        continue;
      }
      if (A === ".param") {
        const M = Kt(I.slice(1));
        for (const [B, N] of Object.entries(M)) {
          if (Object.hasOwn(C.parameters, B)) throw Error("Repeated .param assignment requires simulator ordering semantics: " + B);
          C.parameters[B] = N;
        }
      }
      if (A === ".global") {
        if (I.length < 2) throw Error(".GLOBAL requires nodes.");
        for (const M of I.slice(1)) p.add(ve(M));
      }
      if (A.startsWith(".") && C.directives.push({ line: k, text: y }), A.startsWith("x")) {
        const [M, B] = Rt(I.slice(1));
        if (!M.length) throw Error("X instance requires a subcircuit name.");
        const N = /;§pnba\s+(.+)$/i.exec(y)?.[1].split(")");
        C.instances.push({ name: I[0], nodes: M.slice(0, -1).map(ve), definitionName: M.at(-1), definitionId: null, parameters: B, line: k, raw: y, pinNames: N });
      } else C.statements.push({ line: k, text: y });
    } catch (I) {
      r("error", k, I.message + " Statement: " + y);
    }
  c.length > 1 && r("error", c.at(-1).line, "Unclosed .SUBCKT " + c.at(-1).name), g && r("error", 0, "Unclosed .control block.");
  function m(y, k) {
    for (; y; ) {
      if (Object.hasOwn(y.definitions, ve(k))) return y.definitions[ve(k)];
      y = s[y.parent];
    }
    return null;
  }
  for (const y of Object.values(s)) {
    const k = [...y.statements[0]?.line === 1 ? [] : [{ line: 0, text: "* Scope" }], ...y.statements], I = An(k.map((C) => C.text).join(`
`), { models: s[y.parent]?.models });
    y.devices = I.components.map((C) => ({ ...C, line: k[C.line - 1]?.line || y.line })), y.models = I.models, y === a && (a.title = I.title), o.push(...I.diagnostics.filter((C) => !C.message.includes("No supported components to render.") && !C.message.includes("300 components")).map((C) => ({ ...C, line: k[C.line - 1]?.line || y.line })));
    const A = new Set(y.devices.map((C) => ve(C.name)));
    for (const C of y.instances)
      if (A.has(ve(C.name)) && r("error", C.line, "Duplicate instance/device name: " + C.name), A.add(ve(C.name)), C.definitionId = m(y, C.definitionName), !C.definitionId && !/^\{[\s\S]*\}$/.test(C.definitionName)) r("error", C.line, "Undefined subcircuit: " + C.definitionName + " in " + C.name);
      else if (C.definitionId) {
        const M = s[C.definitionId];
        M.ports.length !== C.nodes.length && r("error", C.line, `${C.name}: ${M.name} expects ${M.ports.length} ports; got ${C.nodes.length}.`);
      }
  }
  for (const y of Object.values(s)) delete y.statements;
  const h = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set();
  function b(y, k = []) {
    if (h.has(y)) {
      r("error", s[y].line, "Circular subcircuit reference: " + [...k, s[y].name].join(" → "));
      return;
    }
    if (!_.has(y)) {
      if (h.add(y), k.length >= 64) {
        r("error", s[y].line, "Subcircuit dependency nesting exceeds 64 levels."), h.delete(y), _.add(y);
        return;
      }
      for (const I of s[y].instances) I.definitionId && b(I.definitionId, [...k, s[y].name]);
      h.delete(y), _.add(y);
    }
  }
  for (const y of Object.keys(s)) b(y);
  !a.devices.length && !a.instances.length && r("error", 0, "No supported components or instances to render.");
  for (const y of o) !y.source && y.line && n.origins[y.line - 1] && (y.source = n.origins[y.line - 1].file, y.line = n.origins[y.line - 1].line);
  return { kind: "HierarchicalCircuit", version: 2, rootId: "root", title: a.title || "", scopes: s, globals: [...p], diagnostics: o, layoutDescription: i.layout };
}
const he = () => /* @__PURE__ */ Object.create(null), Ve = (t, e) => [...t, e].map((n) => encodeURIComponent(n)).join("/"), st = (t, e) => Ve(t.map((n) => n.toLowerCase()), e.toLowerCase());
function Rn(t, e = []) {
  const n = he(), i = (o) => n[o] || (n[o] = { name: o, displayName: o.split("/").map((s) => decodeURIComponent(s)).join("/"), bit: Object.keys(n).length + 2, terminals: [] });
  for (const o of t) for (const [s, p] of Object.entries(o.terminals)) i(p).terminals.push({ component: o.name, pin: s });
  for (const o of e) i(o);
  return n;
}
function Ln(t) {
  if (t.diagnostics.some((e) => e.severity === "error")) {
    const e = Error("Fix the parser errors below before generating.");
    throw e.diagnostics = t.diagnostics, e;
  }
}
const Pt = (t) => /^(?:\{[\s\S]*\}|'[\s\S]*')$/.test(t) ? t.slice(1, -1) : t, Pn = new RegExp("(?<![\\w.$])[a-z_][\\w.$]*", "gi");
function at(t, e, n = (o) => o, i = (o) => o) {
  const o = [];
  t = t.replace(/"(?:\\.|[^"\\])*"/g, (p) => (o.push(p), "@@" + (o.length - 1) + "@@")), t = t.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (p, r, l) => {
    const a = l.split(",").map((x) => x.trim());
    if (a.some((x) => !x || /[\s{}+*()]/.test(x))) throw Error("Unsupported dynamic voltage/current reference: " + p);
    const c = r.toUpperCase() + "(" + a.map((x) => r.toLowerCase() === "v" ? n(x) : i(x, r)).join(",") + ")";
    return o.push(c), "@@" + (o.length - 1) + "@@";
  });
  let s = t.length;
  return t = t.replace(Pn, (p, r, l) => {
    if (l.slice(r + p.length).trimStart().startsWith("(")) return p;
    const a = e(p.toLowerCase());
    if (a === void 0) return p;
    if (s += a.length + 2, s > 1e5) throw Error("Expanded parameter expression exceeds 100000 characters.");
    return "(" + a + ")";
  }), t.replace(/@@(\d+)@@/g, (p, r) => o[Number(r)]);
}
function Dn(t, e, n, i) {
  const o = { ...e, ...n }, s = he(), p = /* @__PURE__ */ new Set(), r = he();
  for (const [a, c] of Object.entries(i)) r[a] = at(Pt(c), (x) => t[x]);
  function l(a) {
    if (Object.hasOwn(r, a)) return r[a];
    if (Object.hasOwn(s, a)) return s[a];
    if (!Object.hasOwn(o, a)) return t[a];
    if (p.has(a)) {
      if (Object.hasOwn(t, a)) return t[a];
      throw Error("Circular parameter dependency: " + [...p, a].join(" → "));
    }
    return p.add(a), s[a] = at(Pt(o[a]), l), p.delete(a), s[a];
  }
  for (const a of Object.keys(o)) l(a);
  return Object.assign(he(), t, s, r);
}
function vt(t, e, n, i) {
  let o = "";
  for (let l = 0; l < t.length; ) {
    const a = t[l];
    if (a !== "{" && a !== "'") {
      o += a, l++;
      continue;
    }
    const c = l++;
    let x = 1, g = "";
    for (; l < t.length && x; l++) {
      if (a === "'") {
        t[l] === "'" && (x = 0);
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
      t[l] === "{" && x++, t[l] === "}" && x--;
    }
    if (x) throw Error("Unclosed parameter expression.");
    o += a + at(t.slice(c + 1, l - 1), (d) => e[d], n, i) + (a === "{" ? "}" : "'");
  }
  const s = [];
  let p = 0, r = "";
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
    if ("({".includes(a) && p++, ")}".includes(a) && p--, !p && (l === 0 || /\s/.test(o[l - 1]))) {
      const c = /^([a-z_][\w.$]*)\s*=(?!=)/i.exec(o.slice(l));
      c && (s.push({ start: l, end: l + c[0].length, key: c[1].toLowerCase() }), l += c[0].length - 1);
    }
  }
  if (s.length) {
    let l = o.slice(0, s[0].start);
    s.forEach((a, c) => {
      const x = s[c + 1]?.start ?? o.length, g = o.slice(a.end, x);
      l += o.slice(a.start, a.end) + (g.includes("{") || ["refnode", "intnode"].includes(a.key) ? g : at(g, (d) => e[d], n, i));
    }), o = l;
  } else Object.hasOwn(e, t.toLowerCase()) && (o = "{" + e[t.toLowerCase()] + "}");
  return o;
}
class Un {
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
class Bn {
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
class D {
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
    return "JavaScript Expression Parser (JSEP) v" + D.version;
  }
  // ==================== CONFIG ================================
  /**
   * @method addUnaryOp
   * @param {string} op_name The name of the unary op to add
   * @returns {Jsep}
   */
  static addUnaryOp(e) {
    return D.max_unop_len = Math.max(e.length, D.max_unop_len), D.unary_ops[e] = 1, D;
  }
  /**
   * @method jsep.addBinaryOp
   * @param {string} op_name The name of the binary op to add
   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
   * @returns {Jsep}
   */
  static addBinaryOp(e, n, i) {
    return D.max_binop_len = Math.max(e.length, D.max_binop_len), D.binary_ops[e] = n, i ? D.right_associative.add(e) : D.right_associative.delete(e), D;
  }
  /**
   * @method addIdentifierChar
   * @param {string} char The additional character to treat as a valid part of an identifier
   * @returns {Jsep}
   */
  static addIdentifierChar(e) {
    return D.additional_identifier_chars.add(e), D;
  }
  /**
   * @method addLiteral
   * @param {string} literal_name The name of the literal to add
   * @param {*} literal_value The value of the literal
   * @returns {Jsep}
   */
  static addLiteral(e, n) {
    return D.literals[e] = n, D;
  }
  /**
   * @method removeUnaryOp
   * @param {string} op_name The name of the unary op to remove
   * @returns {Jsep}
   */
  static removeUnaryOp(e) {
    return delete D.unary_ops[e], e.length === D.max_unop_len && (D.max_unop_len = D.getMaxKeyLen(D.unary_ops)), D;
  }
  /**
   * @method removeAllUnaryOps
   * @returns {Jsep}
   */
  static removeAllUnaryOps() {
    return D.unary_ops = {}, D.max_unop_len = 0, D;
  }
  /**
   * @method removeIdentifierChar
   * @param {string} char The additional character to stop treating as a valid part of an identifier
   * @returns {Jsep}
   */
  static removeIdentifierChar(e) {
    return D.additional_identifier_chars.delete(e), D;
  }
  /**
   * @method removeBinaryOp
   * @param {string} op_name The name of the binary op to remove
   * @returns {Jsep}
   */
  static removeBinaryOp(e) {
    return delete D.binary_ops[e], e.length === D.max_binop_len && (D.max_binop_len = D.getMaxKeyLen(D.binary_ops)), D.right_associative.delete(e), D;
  }
  /**
   * @method removeAllBinaryOps
   * @returns {Jsep}
   */
  static removeAllBinaryOps() {
    return D.binary_ops = {}, D.max_binop_len = 0, D;
  }
  /**
   * @method removeLiteral
   * @param {string} literal_name The name of the literal to remove
   * @returns {Jsep}
   */
  static removeLiteral(e) {
    return delete D.literals[e], D;
  }
  /**
   * @method removeAllLiterals
   * @returns {Jsep}
   */
  static removeAllLiterals() {
    return D.literals = {}, D;
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
    return new D(e).parse();
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
    return D.binary_ops[e] || 0;
  }
  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(e) {
    return e >= 65 && e <= 90 || // A...Z
    e >= 97 && e <= 122 || // a...z
    e >= 128 && !D.binary_ops[String.fromCharCode(e)] || // any non-ASCII that is not an operator
    D.additional_identifier_chars.has(String.fromCharCode(e));
  }
  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(e) {
    return D.isIdentifierStart(e) || D.isDecimalDigit(e);
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
    if (D.hooks[e]) {
      const i = { context: this, node: n };
      return D.hooks.run(e, i), i.node;
    }
    return n;
  }
  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(e) {
    if (D.hooks[e]) {
      const n = { context: this };
      return D.hooks[e].find(function(i) {
        return i.call(n.context, n), n.node;
      }), n.node;
    }
  }
  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    let e = this.code;
    for (; e === D.SPACE_CODE || e === D.TAB_CODE || e === D.LF_CODE || e === D.CR_CODE; )
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
      type: D.COMPOUND,
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
      if (i = this.code, i === D.SEMCOL_CODE || i === D.COMMA_CODE)
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
    let e = this.expr.substr(this.index, D.max_binop_len), n = e.length;
    for (; n > 0; ) {
      if (D.binary_ops.hasOwnProperty(e) && (!D.isIdentifierStart(this.code) || this.index + e.length < this.expr.length && !D.isIdentifierPart(this.expr.charCodeAt(this.index + e.length))))
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
    let e, n, i, o, s, p, r, l, a;
    if (p = this.gobbleToken(), !p || (n = this.gobbleBinaryOp(), !n))
      return p;
    for (s = { value: n, prec: D.binaryPrecedence(n), right_a: D.right_associative.has(n) }, r = this.gobbleToken(), r || this.throwError("Expected expression after " + n), o = [p, s, r]; n = this.gobbleBinaryOp(); ) {
      if (i = D.binaryPrecedence(n), i === 0) {
        this.index -= n.length;
        break;
      }
      s = { value: n, prec: i, right_a: D.right_associative.has(n) }, a = n;
      const c = (x) => s.right_a && x.right_a ? i > x.prec : i <= x.prec;
      for (; o.length > 2 && c(o[o.length - 2]); )
        r = o.pop(), n = o.pop().value, p = o.pop(), e = {
          type: D.BINARY_EXP,
          operator: n,
          left: p,
          right: r
        }, o.push(e);
      e = this.gobbleToken(), e || this.throwError("Expected expression after " + a), o.push(s, e);
    }
    for (l = o.length - 1, e = o[l]; l > 1; )
      e = {
        type: D.BINARY_EXP,
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
    if (e = this.code, D.isDecimalDigit(e) || e === D.PERIOD_CODE)
      return this.gobbleNumericLiteral();
    if (e === D.SQUOTE_CODE || e === D.DQUOTE_CODE)
      o = this.gobbleStringLiteral();
    else if (e === D.OBRACK_CODE)
      o = this.gobbleArray();
    else {
      for (n = this.expr.substr(this.index, D.max_unop_len), i = n.length; i > 0; ) {
        if (D.unary_ops.hasOwnProperty(n) && (!D.isIdentifierStart(this.code) || this.index + n.length < this.expr.length && !D.isIdentifierPart(this.expr.charCodeAt(this.index + n.length)))) {
          this.index += i;
          const s = this.gobbleToken();
          return s || this.throwError("missing unaryOp argument"), this.runHook("after-token", {
            type: D.UNARY_EXP,
            operator: n,
            argument: s,
            prefix: !0
          });
        }
        n = n.substr(0, --i);
      }
      D.isIdentifierStart(e) ? (o = this.gobbleIdentifier(), D.literals.hasOwnProperty(o.name) ? o = {
        type: D.LITERAL,
        value: D.literals[o.name],
        raw: o.name
      } : o.name === D.this_str && (o = { type: D.THIS_EXP })) : e === D.OPAREN_CODE && (o = this.gobbleGroup());
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
    for (; n === D.PERIOD_CODE || n === D.OBRACK_CODE || n === D.OPAREN_CODE || n === D.QUMARK_CODE; ) {
      let i;
      if (n === D.QUMARK_CODE) {
        if (this.expr.charCodeAt(this.index + 1) !== D.PERIOD_CODE)
          break;
        i = !0, this.index += 2, this.gobbleSpaces(), n = this.code;
      }
      this.index++, n === D.OBRACK_CODE ? (e = {
        type: D.MEMBER_EXP,
        computed: !0,
        object: e,
        property: this.gobbleExpression()
      }, e.property || this.throwError('Unexpected "' + this.char + '"'), this.gobbleSpaces(), n = this.code, n !== D.CBRACK_CODE && this.throwError("Unclosed ["), this.index++) : n === D.OPAREN_CODE ? e = {
        type: D.CALL_EXP,
        arguments: this.gobbleArguments(D.CPAREN_CODE),
        callee: e
      } : (n === D.PERIOD_CODE || i) && (i && this.index--, this.gobbleSpaces(), e = {
        type: D.MEMBER_EXP,
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
    for (; D.isDecimalDigit(this.code); )
      e += this.expr.charAt(this.index++);
    if (this.code === D.PERIOD_CODE)
      for (e += this.expr.charAt(this.index++); D.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
    if (n = this.char, n === "e" || n === "E") {
      for (e += this.expr.charAt(this.index++), n = this.char, (n === "+" || n === "-") && (e += this.expr.charAt(this.index++)); D.isDecimalDigit(this.code); )
        e += this.expr.charAt(this.index++);
      D.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) || this.throwError("Expected exponent (" + e + this.char + ")");
    }
    return i = this.code, D.isIdentifierStart(i) ? this.throwError("Variable names cannot start with a number (" + e + this.char + ")") : (i === D.PERIOD_CODE || e.length === 1 && e.charCodeAt(0) === D.PERIOD_CODE) && this.throwError("Unexpected period"), {
      type: D.LITERAL,
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
      type: D.LITERAL,
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
    for (D.isIdentifierStart(e) ? this.index++ : this.throwError("Unexpected " + this.char); this.index < this.expr.length && (e = this.code, D.isIdentifierPart(e)); )
      this.index++;
    return {
      type: D.IDENTIFIER,
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
        i = !0, this.index++, e === D.CPAREN_CODE && o && o >= n.length && this.throwError("Unexpected token " + String.fromCharCode(e));
        break;
      } else if (s === D.COMMA_CODE) {
        if (this.index++, o++, o !== n.length) {
          if (e === D.CPAREN_CODE)
            this.throwError("Unexpected token ,");
          else if (e === D.CBRACK_CODE)
            for (let p = n.length; p < o; p++)
              n.push(null);
        }
      } else if (n.length !== o && o !== 0)
        this.throwError("Expected comma");
      else {
        const p = this.gobbleExpression();
        (!p || p.type === D.COMPOUND) && this.throwError("Expected comma"), n.push(p);
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
    let e = this.gobbleExpressions(D.CPAREN_CODE);
    if (this.code === D.CPAREN_CODE)
      return this.index++, e.length === 1 ? e[0] : e.length ? {
        type: D.SEQUENCE_EXP,
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
      type: D.ARRAY_EXP,
      elements: this.gobbleArguments(D.CBRACK_CODE)
    };
  }
}
const jn = new Un();
Object.assign(D, {
  hooks: jn,
  plugins: new Bn(D),
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
D.max_unop_len = D.getMaxKeyLen(D.unary_ops);
D.max_binop_len = D.getMaxKeyLen(D.binary_ops);
const Fe = (t) => new D(t).parse(), Vn = Object.getOwnPropertyNames(class {
});
Object.getOwnPropertyNames(D).filter((t) => !Vn.includes(t) && Fe[t] === void 0).forEach((t) => {
  Fe[t] = D[t];
});
Fe.Jsep = D;
const Gn = "ConditionalExpression";
var Qn = {
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
            type: Gn,
            test: i,
            consequent: o,
            alternate: s
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let p = i;
            for (; p.right.operator && t.binary_ops[p.right.operator] <= 0.9; )
              p = p.right;
            n.node.test = p.right, p.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Fe.plugins.register(Qn);
const Fn = "ConditionalExpression";
var Hn = {
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
            type: Fn,
            test: i,
            consequent: o,
            alternate: s
          }, i.operator && t.binary_ops[i.operator] <= 0.9) {
            let p = i;
            for (; p.right.operator && t.binary_ops[p.right.operator] <= 0.9; )
              p = p.right;
            n.node.test = p.right, p.right = n.node, n.node = i;
          }
        } else
          this.throwError("Expected :");
      }
    });
  }
};
Fe.plugins.register(Hn);
const zn = { t: 1e12, g: 1e9, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, μ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 }, Dt = { abs: Math.abs, sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, min: Math.min, max: Math.max, ceil: Math.ceil, floor: Math.floor, round: Math.round, int: Math.trunc, sgn: Math.sign, pow: Math.pow, pwr: (t, e) => Math.abs(t) ** e, mod: (t, e) => t % e, limit: (t, e, n) => Math.min(Math.max(t, e), n) }, xe = (t) => Number(t) > 0.5;
function Ye(t, e = {}) {
  const n = /* @__PURE__ */ new Set();
  let i = 0;
  function o(r) {
    return r = String(r).trim(), /^\{[\s\S]*\}$/.test(r) && (r = r.slice(1, -1)), r = r.replace(new RegExp(`"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|(?<![\\w.])(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?[a-zµμΩ]*\\d*[a-zµμΩ]*(?![\\w.])`, "gi"), (l) => {
      if (l[0] === '"' || l[0] === "'") return l;
      const [, a, c, x] = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(l), g = c.toLowerCase(), d = g.startsWith("meg") ? 1e6 : g.startsWith("mil") ? 254e-7 : zn[g[0]] || 1;
      return "(" + (x ? +(a + (a.includes(".") ? "" : ".") + x) : Number(a)) * d + ")";
    }), s(Fe(r));
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
      if (Object.hasOwn(Dt, l)) return Dt[l](...r.arguments.map(s));
    }
    throw Error("Unsupported structural expression. No JavaScript execution is allowed.");
  }
  const p = o(t);
  if (typeof p == "number" && !Number.isFinite(p)) throw Error("Structural expression is not finite.");
  return p;
}
function lt(t, { isolate: e = "" } = {}) {
  Ln(t);
  const n = he(), i = /* @__PURE__ */ new Map();
  let o = 0, s = 0;
  function p(r, l, a, c, x, g, d) {
    if (l.length > 64) throw Error("Instance nesting exceeds 64 levels.");
    if (++o > 2e3) throw Error("Elaboration exceeds 2000 instances.");
    const m = t.scopes[r], h = l.length ? Ve(l.slice(0, -1), l.at(-1)) : "", _ = he();
    if (e && h === e && (a = he()), d.some((C) => C.scopeId === r)) throw Error("Circular subcircuit reference at " + h);
    const b = Dn(c, m.defaults, m.parameters, x);
    function y(C) {
      if (/^\{[\s\S]*\}$/.test(C)) {
        const B = Ye(C, b);
        C = String(typeof B == "boolean" ? Number(B) : B);
      }
      /^"[\s\S]*"$/.test(C) && (C = C.slice(1, -1));
      const M = C.toLowerCase();
      return Object.hasOwn(a, M) ? a[M] : t.globals.includes(M) ? st([], M) : _[M] || (_[M] = st(l, M));
    }
    const k = { id: h, path: l, scopeId: r, name: g?.name || "Top", definition: m.name, ports: m.ports.map((C) => ({ name: C, node: y(C) })), params: b, nodes: _, models: he(), devices: [], children: [], raw: g?.raw || "", line: g?.line || 0 };
    n[h] = k, i.set(h, y);
    const I = [...d, k];
    function A(C) {
      if (!C) return "";
      let M = m;
      for (; M; ) {
        if (M.directives.some((B) => new RegExp("^\\.model\\s+" + C.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\.\\d+)?(?:\\s|$)", "i").test(B.text))) {
          const B = [...I].reverse().find((N) => N.scopeId === M.id);
          return Ve(B?.path || [], C.toLowerCase());
        }
        M = t.scopes[M.parent];
      }
      return C;
    }
    for (const C of m.directives.filter((M) => /^\.model\b/i.test(M.text))) {
      const M = /^\.model\s+(\S+)/i.exec(C.text)?.[1];
      if (!M) continue;
      const B = A(M), N = m.models[M.toLowerCase()], w = vt(C.text, b, y, (G) => Ve(l, G));
      k.models[B] = { ...N, name: B, raw: w.replace(/^(\.model\s+)\S+/i, (G, $) => $ + B), instanceId: h, parameters: b };
    }
    for (const C of m.devices) {
      if (++s > 3e3) throw Error("Elaboration exceeds 3000 primitive devices.");
      const M = he();
      for (const [N, w] of Object.entries(C.terminals)) M[N] = y(w);
      const B = A(C.model);
      k.devices.push({ ...C, name: Ve(l, C.name), localName: C.name, instanceId: h, terminals: M, model: B, parameters: b });
    }
    for (const C of m.instances) {
      let M = C.definitionId;
      if (!M) {
        const G = String(Ye(C.definitionName, b)).toLowerCase();
        let $ = m;
        for (; $ && !M; )
          M = $.definitions[G], $ = t.scopes[$.parent];
        if (!M) throw Error("Undefined selected subcircuit: " + G);
      }
      const B = t.scopes[M], N = he();
      if (B.ports.length !== C.nodes.length) throw Error(C.name + ": expected " + B.ports.length + " ports; got " + C.nodes.length);
      B.ports.forEach((G, $) => {
        N[G.toLowerCase()] = y(C.nodes[$]);
      });
      const w = p(M, [...l, C.name], N, b, C.parameters, C, I);
      C.pinNames?.length === w.ports.length && w.ports.forEach((G, $) => {
        G.label = C.pinNames[$];
      }), k.children.push(w);
    }
    return k;
  }
  try {
    let x = function(g, d) {
      const m = d.split(":");
      if (m.length === 1) return { owner: g, name: d };
      const h = m.pop();
      for (const _ of [[...g.path, ...m], m]) {
        const b = l.get(_.map(encodeURIComponent).join("/").toLowerCase());
        if (b) return { owner: b, name: h };
      }
      throw Error("Unknown hierarchical reference: " + d);
    };
    const r = p(t.rootId, [], he(), he(), he(), null, []), l = new Map(Object.values(n).map((g) => [g.id.toLowerCase(), g])), a = Object.assign(he(), ...Object.values(n).map((g) => g.models)), c = (g) => a[g] || Object.entries(a).find(([d]) => d.startsWith(g + "."))?.[1];
    for (const g of Object.values(n)) for (const d of g.devices) {
      const m = t.scopes[g.scopeId].devices.find((b) => b.name === d.localName), h = (b) => {
        const y = x(g, b);
        return i.get(y.owner.id)(y.name);
      }, _ = (b, y = "", k = "") => {
        const I = x(g, b), A = I.owner.devices.find((C) => C.localName.toLowerCase() === I.name.toLowerCase());
        if (y.toLowerCase() === "ix") {
          const C = I.owner.ports.find((M, B) => M.name.toLowerCase() === I.name.toLowerCase() || String(B + 1) === I.name);
          if (C) return I.owner.id + ":" + C.name;
        }
        if (!A) {
          if (k) throw Error(d.name + ": referenced " + k + " device " + b + " was not found.");
          return Ve(I.owner.path, I.name);
        }
        if (k && A.kind !== k) throw Error(d.name + ": " + b + " must be a " + k + " device.");
        return A.name;
      };
      if (d.value = vt(m.value, g.params, h, _), m.model && (d.value = d.value.replace(m.model, d.model)), d.kind === "M" && Object.keys(d.terminals).length === 3) {
        let b = c(d.model), y = !1;
        const k = /* @__PURE__ */ new Set();
        for (; b?.type === "VDMOS" && !k.has(b.name); ) {
          k.add(b.name);
          const I = /\bpchan(?:\s*=\s*(\{[^}]*\}|[^\s)]+))?/i.exec(b.raw);
          if (I) {
            y = I[1] === void 0 || Number(Ye(I[1], b.parameters)) >= 0.5;
            break;
          }
          const A = b.name.includes("/") ? b.name.slice(0, b.name.lastIndexOf("/") + 1) : "";
          b = c(A + (b.baseModel || "").toLowerCase()) || c((b.baseModel || "").toLowerCase());
        }
        k.size && (d.type = "spice_" + (y ? "pmos3" : "nmos3"));
      }
      d.controlSources = (m.controlSources || []).map((b) => _(b, "", "V")), d.controlSource = d.controlSources[0] || "", d.coupledInductors = (m.coupledInductors || []).map((b) => _(b, "", "L"));
      for (const b of /* @__PURE__ */ new Set([...m.controlSources || [], ...m.coupledInductors || []])) {
        const y = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        d.value = d.value.replace(new RegExp("(?<![\\w./%])" + y + "(?![\\w.$])", "g"), () => _(b));
      }
    }
    return { kind: "ElaboratedHierarchy", ir: t, root: r, contexts: n };
  } catch (r) {
    throw r.diagnostics = [...t.diagnostics, { severity: "error", line: 0, message: r.message }], r;
  }
}
function Qe(t) {
  return [...t.devices, ...t.children.flatMap(Qe)];
}
function He(t) {
  return JSON.stringify(t.map((e) => [e.name, e.kind, Object.entries(e.terminals).sort(), e.value, e.model, e.controlSource, e.controlSources || [], e.coupledInductors || []]).sort((e, n) => e[0].localeCompare(n[0])));
}
function It(t, e = {}) {
  const n = new Map(t.components.map((N) => [N.name, N])), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = [], p = (N, w) => JSON.stringify([N, w].sort()), r = (N) => e[N]?.potential !== null && e[N]?.potential !== void 0;
  for (const N of t.components) {
    for (const [L, V] of Object.entries(N.terminals))
      i.has(V) || i.set(V, []), i.get(V).push({ device: N.name, pin: L });
    if (N.kind === "R") {
      const L = Object.values(N.terminals);
      if (L.length === 2 && L[0] !== L[1]) {
        const V = p(...L);
        o.has(V) || o.set(V, []), o.get(V).push(N);
      }
    }
    const w = N.kind === "Q" ? "bjt" : ["M", "J", "Z"].includes(N.kind) ? "fet" : null, G = w === "bjt" ? /_(npn|pnp)$/.exec(N.type)?.[1] : /_(nmos|pmos|jfet_n|jfet_p|mesfet_n|mesfet_p)$/.exec(N.type)?.[1];
    if (!w || !G) continue;
    const $ = N.terminals, X = $[w === "bjt" ? "B" : "G"], Y = $[w === "bjt" ? "C" : "D"], ne = $[w === "bjt" ? "E" : "S"];
    [X, Y, ne].some((L) => L === void 0) || X === ne || Y === ne || s.push({ id: N.name, family: w, polarity: G, control: X, drain: Y, source: ne, body: N.kind === "M" ? $.B : void 0 });
  }
  const l = [], a = /* @__PURE__ */ new Set(), c = (N, w, G, $, X, Y = "basic", ne = [], L = "high") => {
    const V = [.../* @__PURE__ */ new Set([...w, ...ne])], K = JSON.stringify([N, Y, [...V].sort()]);
    a.has(K) || (a.add(K), l.push({ id: "motif" + l.length, kind: N, variant: Y, transistors: w, members: V, roles: G, nets: $, evidence: X, confidence: L }));
  }, x = (N, w) => N.family === w.family && N.polarity === w.polarity, g = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = new Map(s.map((N) => [N.id, N])), _ = (N, w, G) => {
    N.has(w) || N.set(w, []), N.get(w).push(G);
  }, b = (N, w) => JSON.stringify([N.family, N.polarity, w]);
  for (const N of s)
    _(g, b(N, N.control), N), _(d, b(N, N.source), N), N.family === "bjt" && (i.get(N.source) || []).some((w) => {
      const G = h.get(w.device);
      return G && G.family === "bjt" && !x(N, G) && G.source === N.source;
    }) && _(m, b(N, N.drain), N);
  const y = (N) => [{ node: N.source, resistor: null }, ...(i.get(N.source) || []).flatMap((w) => {
    const G = n.get(w.device);
    if (G.kind !== "R") return [];
    const $ = Object.values(G.terminals).find((X) => X !== N.source);
    return $ !== void 0 && $ !== N.control && $ !== N.drain ? [{ node: $, resistor: G.name }] : [];
  })];
  for (const N of s) N.control === N.drain && c("diode-connected", [N.id], { reference: N.id }, { control: N.control, return: N.source }, ["control-drain-short", N.family]);
  for (const N of s) {
    const w = g.get(b(N, N.control));
    if (w.filter((L) => L.control === L.drain).length > 1) continue;
    let G = null;
    if (N.control !== N.drain && N.family === "bjt" && (G = (g.get(b(N, N.drain)) || []).find((L) => L.id !== N.id && x(L, N) && L.control === N.drain && L.source === N.control && r(L.drain))), N.control !== N.drain && !G) continue;
    const $ = y(N), X = [];
    let Y = null, ne = [];
    for (const L of w) {
      if (L.id === N.id || L.id === G?.id || L.drain === N.drain || L.drain === L.control) continue;
      const V = $.flatMap((K) => y(L).filter((z) => K.node === z.node).map((z) => ({ node: K.node, rs: [K.resistor, z.resistor].filter(Boolean) }))).find((K) => Y === null || K.node === Y);
      V && (Y = V.node, X.push(L.id), ne.push(...V.rs));
    }
    if (X.length) {
      const L = X.every((V) => h.get(V).body === N.body);
      c("current-mirror", [N.id, ...X, ...G ? [G.id] : []], { reference: N.id, outputs: X, ...G ? { helper: G.id } : {} }, { control: N.control, return: Y }, ["same-polarity", "shared-control", G ? "emitter-follower-reference" : "diode-reference", ne.length ? "resistive-common-return" : "shared-return", L ? "compatible-bodies" : "different-body-connections"], G ? "assisted" : ne.length ? "degenerated" : "basic", [...ne, ...G ? [G.id] : []], L ? "high" : "medium");
    }
  }
  const k = [], I = /* @__PURE__ */ new Set(), A = (N, w) => {
    const G = JSON.stringify([N.id, w.id].sort());
    I.has(G) || (I.add(G), k.push([N, w]));
  };
  for (const N of d.values()) if (!r(N[0].source)) {
    const w = N.filter((G) => G.control !== G.drain);
    w.length === 2 ? A(...w) : w.length > 2 && new Set(w.map((G) => G.control)).size > 1 && c("differential-pair", w.map((G) => G.id), { inputs: w.map((G) => G.id) }, { tail: w[0].source }, ["shared-tail", "multi-input-tail"], "multi-input", [], "medium");
  }
  for (const N of m.values()) for (let w = 0; w < N.length; w++) for (let G = w + 1; G < N.length; G++) A(N[w], N[G]);
  for (const [N, w] of k) {
    if (N.control === w.control || N.control === N.drain || w.control === w.drain) continue;
    if (N.source === w.source && N.drain !== w.drain && !r(N.source)) {
      const X = (i.get(N.source) || []).some((ne) => ne.device !== N.id && ne.device !== w.id), Y = d.get(b(N, N.source)).length === 2;
      c("differential-pair", [N.id, w.id], { inputs: [N.id, w.id] }, { tail: N.source }, ["same-polarity", "distinct-controls", "shared-tail", X ? "tail-bias-connection" : "unbiased-tail", Y ? "two-input-tail" : "multi-input-tail"], "basic", [], X && Y && N.body === w.body ? "high" : "medium");
    }
    if (N.family !== "bjt" || N.drain !== w.drain || N.source === w.source) continue;
    const G = s.filter((X) => X.family === "bjt" && X.polarity !== N.polarity && X.source === N.source), $ = s.filter((X) => X.family === "bjt" && X.polarity !== N.polarity && X.source === w.source);
    for (const X of G) for (const Y of $) X.id !== Y.id && X.control === Y.control && X.drain !== Y.drain && X.control !== X.drain && Y.control !== Y.drain && c("differential-pair", [N.id, w.id, X.id, Y.id], { inputs: [N.id, w.id], commonBase: [X.id, Y.id] }, { inputCollectors: N.drain, bias: X.control }, ["same-polarity-inputs", "distinct-controls", "complementary-emitter-pairs", "shared-common-base"], "complementary-common-base");
  }
  for (const N of s) if (N.family === "bjt" && N.control !== N.drain) {
    const w = o.get(p(N.drain, N.control)) || [], G = o.get(p(N.control, N.source)) || [];
    w.length === 1 && G.length === 1 && c("vbe-multiplier", [N.id], { transistor: N.id, collectorResistor: w[0].name, emitterResistor: G[0].name }, { control: N.control, collector: N.drain, emitter: N.source }, ["collector-base-resistor", "base-emitter-resistor"], "basic", [w[0].name, G[0].name]);
  }
  const C = s.filter((N) => N.family === "bjt"), M = /* @__PURE__ */ new Map();
  for (const N of C) _(M, N.control, N);
  const B = (N) => (i.get(N) || []).filter((w) => h.has(w.device));
  for (const N of C) if (N.control !== N.drain) {
    for (const w of M.get(N.source) || []) if (w.id !== N.id && x(N, w) && w.drain === N.control && w.source !== N.drain) {
      const G = o.get(p(N.source, w.source)) || [];
      G.length === 1 && c("current-limit-pair", [N.id, w.id], { driver: N.id, output: w.id, senseResistor: G[0].name }, { sense: N.source, drive: N.control, output: w.source }, ["same-polarity", "emitter-to-base", "base-to-collector", "emitter-sense-resistor"], "emitter-sense", [G[0].name]);
    }
    for (const w of M.get(N.source) || []) w.id !== N.id && x(N, w) && w.control !== w.drain && N.drain === w.drain && w.source !== N.control && c("darlington-pair", [N.id, w.id], { driver: N.id, output: w.id }, { link: N.source, collector: N.drain }, ["same-polarity", "shared-collector", "emitter-to-base"], "basic", [], (M.get(N.source) || []).length === 1 ? "high" : "medium");
    for (const w of M.get(N.drain) || []) w.id !== N.id && !x(N, w) && w.control !== w.drain && N.source === w.drain && w.source !== N.control && B(N.drain).length === 2 && c("sziklai-pair", [N.id, w.id], { driver: N.id, output: w.id }, { link: N.drain, feedback: N.source }, ["opposite-polarity", "collector-to-base", "emitter-to-collector", "unambiguous-drive-node"]);
    for (const w of i.get(N.drain) || []) {
      const G = h.get(w.device);
      !G || G.family !== "bjt" || G.id === N.id || !x(N, G) || G.source !== N.drain || r(N.drain) || G.control === N.control || G.control === G.drain || G.drain === N.source || B(N.drain).length !== 2 || c("cascode-pair", [N.id, G.id], { driver: N.id, output: G.id }, { link: N.drain }, ["same-polarity", "collector-to-emitter", "distinct-controls", "unambiguous-internal-node"]);
    }
  }
  for (const N of C.filter((w) => w.polarity === "npn" && r(w.drain))) for (const w of C.filter((G) => G.polarity === "pnp" && r(G.drain))) {
    if (e[N.drain].potential <= e[w.drain].potential) continue;
    const G = y(N).flatMap(($) => y(w).filter((X) => $.node === X.node && !r($.node)).map((X) => ({ node: $.node, rs: [$.resistor, X.resistor].filter(Boolean) })))[0];
    G && c("push-pull-pair", [N.id, w.id], { upper: N.id, lower: w.id }, { output: G.node }, ["complementary-polarity", "ordered-collector-supplies", G.rs.length ? "resistive-common-output" : "shared-emitter-output"], "emitter-follower", G.rs);
  }
  return l;
}
function kt(t, e, n = (i) => i) {
  const i = (o) => Array.isArray(o) ? o.map(e) : e(o);
  return t.map((o) => ({ ...o, members: o.members.map(e), transistors: o.transistors.map(e), roles: Object.fromEntries(Object.entries(o.roles).map(([s, p]) => [s, i(p)])), nets: Object.fromEntries(Object.entries(o.nets).map(([s, p]) => [s, n(p)])) }));
}
function qn(t, e, n) {
  const i = [], o = /* @__PURE__ */ new Set(), s = new Map(t.components.map((p) => [p.name, p]));
  for (const p of n) {
    if (new Set(p.members).size !== p.members.length) throw Error("Duplicate @layout pair member.");
    const r = p.members.map((g) => s.get(g));
    if (r.some((g) => !g)) throw Error("Unknown @layout pair device.");
    const l = { mirror: "current-mirror", differential: "differential-pair", vbe: "vbe-multiplier", darlington: "darlington-pair", sziklai: "sziklai-pair", cascode: "cascode-pair", "current-limit": "current-limit-pair", "push-pull": "push-pull-pair" }[p.kind], a = p.kind === "differential" && r.length === 2 ? t.components.filter((g) => !p.members.includes(g.name) && Object.values(g.terminals).includes(r[0].terminals.E ?? r[0].terminals.S)) : [], c = It({ ...t, components: [...r, ...a] }, e), x = c.find((g) => g.kind === l && g.confidence === "high" && p.members.every((d) => g.members.includes(d)));
    if (!x) throw Error("Invalid @layout pair " + p.kind + " { " + p.members.join(" ") + " }: electrical structure does not match.");
    for (const g of c.filter((d) => d === x || d.kind === "diode-connected" && d.members.every((m) => x.members.includes(m)))) {
      const d = JSON.stringify([g.kind, [...g.members].sort()]);
      o.has(d) || (o.add(d), i.push({ ...g, id: "motif" + i.length, origin: "annotation" }));
    }
  }
  return i;
}
function Wn(t, e, n = It(t, e)) {
  const i = /* @__PURE__ */ new Map(), o = t.components.filter((g) => g.kind === "R"), s = t.components.filter((g) => g.kind === "Q"), p = new Map(t.components.map((g) => [g.name, g])), r = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), a = (g) => Object.values(g.terminals), c = (g, d, m) => {
    g && i.set(g.name, { reverse: a(g)[0] !== d, reason: m });
  };
  for (const g of s) {
    const { C: d, B: m, E: h } = g.terminals, _ = g.type.endsWith("pnp"), b = g.type.endsWith("npn");
    !_ && !b || (r.has(h) || r.set(h, []), r.get(h).push(g), d === m && e[h]?.potential !== null && e[h]?.potential !== void 0 && l.set(d, { potential: e[h].potential }));
  }
  for (const g of n) if (g.kind === "vbe-multiplier" && g.confidence === "high") {
    const d = p.get(g.roles.transistor), m = d.type.endsWith("pnp"), h = p.get(m ? g.roles.emitterResistor : g.roles.collectorResistor), _ = p.get(m ? g.roles.collectorResistor : g.roles.emitterResistor);
    c(h, d.terminals[m ? "E" : "C"], "recognized VBE multiplier"), c(_, d.terminals.B, "recognized VBE multiplier");
  }
  for (const g of o) {
    const [d, m] = a(g), h = l.get(d), _ = l.get(m);
    h && _ && h.potential !== _.potential && c(g, h.potential > _.potential ? d : m, "diode-connected bias reference");
  }
  const x = /* @__PURE__ */ new Map();
  for (const g of o) {
    const d = a(g);
    if (!d.some((m) => e[m]?.potential !== null && e[m]?.potential !== void 0))
      for (const m of d)
        x.has(m) || x.set(m, []), x.get(m).push(g);
  }
  for (const [g, d] of x)
    if (!(d.length > 12))
      for (const m of d) for (const h of d) {
        if (m === h) continue;
        const _ = a(m).find((I) => I !== g), b = a(h).find((I) => I !== g), y = r.get(_)?.find((I) => I.type.endsWith("npn")), k = r.get(b)?.find((I) => I.type.endsWith("pnp"));
        y && k && (c(m, _, "complementary emitter output"), c(h, g, "complementary emitter output"));
      }
  return i;
}
function Xn(t) {
  const e = t.components.filter((s) => s.kind === "Q"), n = /* @__PURE__ */ new Map(), i = new Set(t.components.filter((s) => s.kind === "R").map((s) => Object.values(s.terminals).sort().join("|"))), o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const p = s.terminals.E;
    n.has(p) || n.set(p, []), n.get(p).push(s);
  }
  for (const s of e) {
    const { B: p, C: r, E: l } = s.terminals;
    if (p === l || !i.has([p, l].sort().join("|"))) continue;
    const a = n.get(p) || [];
    if (!(a.length > 16))
      for (const c of a) {
        if (c === s) continue;
        if (c.terminals.B === r) {
          o.add(s.name);
          break;
        }
        const x = n.get(c.terminals.B) || [];
        if (x.length <= 16 && x.some((g) => g !== s && g !== c && g.terminals.B === r)) {
          o.add(s.name);
          break;
        }
      }
  }
  return o;
}
const Ze = 22;
function Et(t) {
  const e = String(t).split("/").at(-1);
  let n;
  try {
    n = decodeURIComponent(e);
  } catch {
    n = e;
  }
  return n === "0" ? "ret" : /^(IN|OUT|IO|PWR|RET|BIAS|FB|N)_/i.exec(n)?.[1].toLowerCase() || "unknown";
}
const et = (t) => ["pwr", "ret", "bias"].includes(t), $n = (t) => String(t).split("/").at(-1).toLowerCase(), Yt = (t) => ({ vdd: "pwr", vcc: "pwr", vee: "ret", vss: "ret" })[$n(t)] || "unknown", Ut = (t) => {
  const e = Et(t);
  return e !== "unknown" ? e : { in: "in", input: "in", out: "out", output: "out" }[String(t).toLowerCase()] || Yt(t);
};
function Kn(t) {
  const e = /* @__PURE__ */ new Map(), n = [], i = (p, r, l) => {
    e.has(p) || e.set(p, []), e.get(p).push({ node: r, delta: l });
  };
  for (const p of t)
    if (p.kind === "V")
      try {
        let r = p.value.trim();
        const l = /\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i.exec(r);
        if (l && Number(Ye(l[1], p.parameters)) !== 0 || (r = r.replace(/\bRser\s*=\s*(\{[^}]*\}|\([^)]*\)|[^\s]+)/i, "").trim(), /\b(?:PULSE|PWL|SINE|SIN|EXP|SFFM|AM|TRNOISE|Rpar|Cpar)\b/i.test(r))) continue;
        const a = /^(?:DC\s+)?(\{[^}]*\}|\S+)(?:\s+AC\s+[^\s]+(?:\s+[^\s]+)?)?$/i.exec(r);
        if (!a) continue;
        const c = Ye(a[1], p.parameters);
        if (typeof c != "number" || !Number.isFinite(c)) continue;
        i(p.terminals["-"], p.terminals["+"], c), i(p.terminals["+"], p.terminals["-"], -c);
      } catch {
      }
  const o = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ new Set();
  for (const p of ["0", ...e.keys()]) {
    if (s.has(p)) continue;
    const r = /* @__PURE__ */ new Map([[p, 0]]), l = [p];
    s.add(p);
    let a = !1;
    for (let c = 0; c < l.length; c++) for (const x of e.get(l[c]) || []) {
      const g = r.get(l[c]) + x.delta;
      r.has(x.node) ? Math.abs(r.get(x.node) - g) > 1e-8 * Math.max(1, Math.abs(g)) && (a = !0) : (r.set(x.node, g), s.add(x.node), l.push(x.node));
    }
    a && n.push({ severity: "warning", message: "Layout: inconsistent ideal DC voltage constraints; conflicting potentials are not used." });
    for (const [c, x] of r) o[c] = { value: x, reference: p, known: p === "0" && !a, consistent: !a };
  }
  return { nodes: o, diagnostics: n };
}
function Yn(t, e, n = null) {
  const i = Kn(Qe(e.localScope ? t.contexts[e.focus] : t.root)), o = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  for (const c of Object.values(e.nodes)) {
    const x = Et(c.name), g = Yt(c.name);
    o[c.name] = { role: x !== "unknown" ? x : g, roleSource: x !== "unknown" ? "node-name" : g !== "unknown" ? "legacy-rail-name" : "unknown", potential: i.nodes[c.name]?.known ? i.nodes[c.name].value : null };
  }
  if (e.localScope) for (const c of e.interfaceBindings) {
    const x = o[c.local], g = Ut(c.port);
    x && x.potential === null && ["pwr", "ret"].includes(g) && (x.potential = g === "pwr" ? 1 : /^(?:ret_)?(?:gnd|ground|0)$/i.test(c.port) ? 0 : -1, x.potentialSource = "symbolic-port-order");
  }
  const p = n?.pairs?.length ? qn(e, o, n.pairs) : It(e, o), r = Wn(e, o, p), l = Xn(e), a = (c, x, g) => {
    const d = { role: o[g].role, roleSource: o[g].roleSource }, m = c.block?.ports.find((b) => b.pin === x);
    if (m?.implicit || !c.block && !c.synthetic) return d;
    const h = c.synthetic ? c.value : m?.name || m?.label, _ = Ut(h);
    return _ !== "unknown" ? { role: _, roleSource: Et(h) !== "unknown" ? "formal-prefix" : "legacy-interface-name" } : et(d.role) ? { ...d, roleSource: "bound-rail" } : { role: "unknown", roleSource: "unknown" };
  };
  for (const c of e.components) {
    const x = Object.fromEntries(Object.entries(c.terminals).map(([B, N]) => [B, { ...o[N], ...a(c, B, N) }])), g = Object.values(x), d = ["r_v", "spice_br", "l_v", "c_v", "d_v"].includes(c.type), m = d && !r.has(c.name) && g.length === 2 && g.every((B) => !et(B.role) && (B.potential === null || B.role !== "unknown")), h = c.terminals["+"], _ = c.terminals["-"], b = [h, _].filter((B) => B && B !== "0"), y = c.kind === "V" && b.some((B) => et(o[B]?.role)) && !b.some((B) => ["in", "out", "io", "fb"].includes(o[B]?.role)) && [h, _].every((B) => i.nodes[B]?.known), k = h === "0" ? _ : h, I = Object.keys(c.terminals), A = (B) => et(B.role) ? B.potential !== null ? B.potential > 0 ? "high" : "low" : B.role === "ret" ? "low" : "high" : "signal";
    let C = !1;
    I.length === 2 && (c.kind === "V" && g.every((B) => B.potential !== null) ? C = g[0].potential < g[1].potential : c.terminals[I[0]] === "0" ? C = !0 : c.terminals[I[1]] === "0" ? C = !1 : g.every((B) => B.potential !== null) ? C = g[0].potential < g[1].potential : C = A(g[0]) === "low" || A(g[1]) === "high" && A(g[0]) === "signal"), r.has(c.name) && (C = r.get(c.name).reverse);
    const M = c.synthetic ? "" : c.name.startsWith(e.focus + "/") ? c.name.slice(e.focus.length + 1) : c.name;
    s[c.name] = { version: Ze, kind: c.kind, polarity: c.type.endsWith("pnp") ? "p" : c.type.endsWith("npn") ? "n" : null, currentLimiter: l.has(c.name), orientationReason: r.get(c.name)?.reason || null, owner: M.includes("/") ? M.slice(0, M.lastIndexOf("/")) : "", passive: d, source: ["V", "I", "E", "F", "G", "H"].includes(c.kind) || c.kind === "B" && !d, ports: x, horizontal: m, orientation: m ? "horizontal" : C ? "vertical-reversed" : "vertical", flexible: I.length === 2 && (d || ["V", "I", "B", "F", "H"].includes(c.kind)), supply: !!y, voltage: y ? i.nodes[k].value : null };
  }
  return { version: Ze, nodes: o, cells: s, motifs: p, diagnostics: i.diagnostics };
}
function Zt(t, e) {
  const n = e.ports.map((o, s) => ({ pin: "P" + s, name: o.name, label: o.label || o.name, node: o.node, implicit: !1 })), i = new Set(Qe(e).flatMap((o) => Object.values(o.terminals)));
  for (const o of t.ir.globals) {
    const s = st([], o);
    i.has(s) && !n.some((p) => p.node === s) && n.push({ pin: "G" + n.length, label: o === "0" ? "⏚ 0" : "global: " + o, node: s, implicit: !0 });
  }
  return n;
}
function qe(t, { mode: e = "hierarchical", expanded: n = /* @__PURE__ */ new Set(), focus: i = "" } = {}) {
  const o = t, s = t.contexts[i];
  if (!s) throw Error("Unknown instance: " + i);
  i && (t = lt(t.ir, { isolate: i }));
  const p = t.contexts[i];
  if (!p) throw Error("Unknown instance: " + i);
  const r = [], l = [];
  function a(m) {
    l.push(...Object.values(m.nodes), ...m.ports.map((_) => _.node));
    const h = [...m.devices.map((_) => ({ line: _.line, device: _ })), ...m.children.map((_) => ({ line: _.line, child: _ }))].sort((_, b) => _.line - b.line);
    for (const _ of h) {
      if (_.device) {
        const I = _.device;
        r.push({ ...I, layoutLabel: [...m.path.slice(p.path.length), I.localName].join("/") });
        continue;
      }
      const b = _.child;
      if (e === "flat" || n.has(b.id)) {
        a(b);
        continue;
      }
      const y = Zt(t, b), k = he();
      y.forEach((I) => {
        k[I.pin] = I.node;
      }), r.push({ name: b.id, kind: "X", type: "spice_subckt", terminals: k, value: b.definition, raw: b.raw, line: b.line, instanceId: b.id, layoutLabel: b.path.slice(p.path.length).join("/"), block: { definitionId: b.scopeId, ports: y, parameters: b.params } });
    }
  }
  a(p);
  for (const [m, h] of p.ports.entries()) r.push({ name: "@port/" + i + "/" + m, kind: "PORT", type: "spice_port", terminals: { A: h.node }, layoutLabel: h.name, value: h.name, raw: "Interface port " + h.name, synthetic: !0 });
  if (r.length > 1500) throw Error("This sheet exceeds 1500 symbols. Collapse instances or open a subcircuit.");
  const c = Object.assign(he(), ...Object.values(t.contexts).map((m) => m.models)), x = { title: i || t.ir.title, components: r, nodes: Rn(r, l), models: c, diagnostics: t.ir.diagnostics, mode: e, focus: i, localScope: !!i };
  x.interfaceBindings = p.ports.map((m, h) => ({ port: m.name, local: m.node, parent: s.ports[h].node }));
  const g = /* @__PURE__ */ new Map();
  for (const m of s.ports)
    g.has(m.node) || g.set(m.node, []), g.get(m.node).push(m.name);
  x.interfaceAliases = [...g].filter(([, m]) => m.length > 1).map(([m, h]) => ({ node: m, ports: h })), x.topology = Zn(o, x);
  const d = Mn(t, x);
  return x.layout = Yn(t, x, d), x.layout.description = d, x;
}
function Zn(t, e) {
  const n = Qe(t.contexts[e.focus]);
  e.localScope && (t = lt(t.ir, { isolate: e.focus }));
  const i = [], o = /* @__PURE__ */ new Set();
  for (const r of e.components)
    if (!r.synthetic)
      if (r.kind === "X") {
        const l = t.contexts[r.instanceId];
        if (!l) throw Error("Projection contains an unknown block.");
        const a = Zt(t, l);
        if (JSON.stringify(Object.entries(r.terminals)) !== JSON.stringify(a.map((c) => [c.pin, c.node]))) throw Error("Block interface topology mismatch: " + r.name);
        i.push(...Qe(l));
      } else i.push(r);
  for (const r of i) {
    if (o.has(r.name)) throw Error("Projection duplicates " + r.name);
    o.add(r.name);
  }
  const s = He(i), p = Qe(t.contexts[e.focus]);
  if (s !== He(p)) throw Error("Projection lost or changed electrical devices/connections.");
  if (e.localScope) {
    const r = new Map(e.interfaceBindings.map((c) => [c.local, c.parent])), l = (c) => r.get(c) ?? c, a = i.map((c) => ({ ...c, terminals: Object.fromEntries(Object.entries(c.terminals).map(([x, g]) => [x, l(g)])), value: vt(c.value, {}, l, (x) => x) }));
    if (He(a) !== He(n)) throw Error("Local sheet does not reproduce instance topology when its boundary is bound.");
  }
  return { verified: !0, leafCount: i.length, signature: s, boundSignature: He(n), boundaryVerified: !0 };
}
function ze(t) {
  const e = he(), n = he();
  for (const i of t.components) {
    const o = he(), s = he();
    for (const [p, r] of Object.entries(i.terminals))
      o[p] = [t.nodes[r].bit], s[p] = "input";
    e[i.name] = { type: i.type, port_directions: s, connections: o, parameters: {}, attributes: { ref: i.name, displayRef: i.layoutLabel || i.name, value: i.value, spice: i.raw } }, e[i.name].spiceLayout = t.layout?.cells[i.name], i.block && (e[i.name].spiceBlock = { ports: i.block.ports.map((p) => ({ pin: p.pin, label: p.label })), definitionId: i.block.definitionId }), (i.type === "spice_device" || i.type === "spice_coupling") && (e[i.name].spiceSymbol = { label: i.symbol || i.kind, ports: Object.keys(i.terminals).map((p, r) => ({ pin: p, label: i.pinLabels?.[r] || p })), references: i.coupledInductors?.length ? i.coupledInductors : i.controlSources || [] });
  }
  for (const i of Object.values(t.nodes)) n[i.name] = { hide_name: 0, bits: [i.bit], attributes: {} };
  if (t.nodes[0]) {
    let i = "__ground";
    for (; Object.hasOwn(e, i); ) i += "_";
    e[i] = { type: "gnd", connections: { A: [t.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: e, netnames: n, spiceMotifs: kt(t.layout?.motifs || [], (i) => i, (i) => t.nodes[i].bit), spiceLayoutDescription: t.layout?.description || null } } };
}
function Jn(t) {
  const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = {}, o = (a) => (n.has(a) || n.set(a, n.size + 2), n.get(a));
  Object.entries(t.modules.circuit.cells).forEach(([a, c], x) => {
    const g = "c" + x;
    e.set(g, a);
    const d = Object.fromEntries(Object.entries(c.connections).map(([m, h]) => [m, h.map(o)]));
    i[g] = { type: c.type, connections: d, port_directions: c.port_directions, attributes: { displayRef: c.attributes.displayRef || c.attributes.ref || "", value: c.attributes.value || "", name: c.attributes.name || "" } }, c.spiceBlock && (i[g].spiceBlock = c.spiceBlock), c.spiceSymbol && (i[g].spiceSymbol = c.spiceSymbol), c.spiceLayout && (i[g].spiceLayout = c.spiceLayout);
  });
  const s = new Map([...e].map(([a, c]) => [c, a])), p = t.modules.circuit.spiceLayoutDescription, r = p ? { ...p, faces: (p.faces || []).map((a) => ({ ...a, device: s.get(a.device) })), pairs: (p.pairs || []).map((a) => ({ ...a, members: a.members.map((c) => s.get(c)) })), groups: p.groups.map((a) => ({ ...a, members: a.members.map((c) => c.cell ? { ...c, cell: s.get(c.cell) } : c) })), relations: p.relations.map((a) => ({ ...a, a: s.get(a.a) || a.a, b: s.get(a.b) || a.b })) } : null, l = kt(t.modules.circuit.spiceMotifs || [], (a) => s.get(a), o);
  return { netlist: { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: i, spiceMotifs: l, spiceLayoutDescription: r } } }, ids: e, bits: new Map([...n].map(([a, c]) => [c, a])) };
}
const Le = /* @__PURE__ */ new Map();
async function tt(t, e) {
  const n = Jn(t), i = JSON.stringify([n.netlist, e]);
  let o = Le.get(i);
  o ? (Le.delete(i), Le.set(i, o)) : (o = await eo(n.netlist, e), o.svg.length < 1e6 && (Le.set(i, o), Le.size > 20 && Le.delete(Le.keys().next().value)));
  const s = new DOMParser().parseFromString(o.svg, "image/svg+xml");
  if (s.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
  for (const l of s.querySelectorAll("[id],[class]")) {
    const a = l.getAttribute("id");
    a?.startsWith("cell_") && n.ids.has(a.slice(5)) && l.setAttribute("id", "cell_" + n.ids.get(a.slice(5)));
    const c = l.getAttribute("class");
    c && l.setAttribute("class", c.split(/\s+/).map((x) => x.startsWith("cell_") && n.ids.has(x.slice(5)) ? "cell_" + n.ids.get(x.slice(5)) : /^net_\d+$/.test(x) && n.bits.has(Number(x.slice(4))) ? "net_" + n.bits.get(Number(x.slice(4))) : x).join(" "));
  }
  const p = o.drawing ? structuredClone(o.drawing) : null, r = s.querySelector("#spice-layout-report");
  if (r) {
    const l = JSON.parse(r.textContent), a = (c) => n.ids.get(c) || c;
    l.mirroredTransistors = (l.mirroredTransistors || []).map(a), l.orientationDevicesTested = (l.orientationDevicesTested || []).map(a), l.recognizedMotifs = kt(l.recognizedMotifs || [], a, (c) => n.bits.get(c) ?? c), l.inputAttachments = (l.inputAttachments || []).map(a), l.mirroredInputPorts = (l.mirroredInputPorts || []).map(a);
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
  if (p) {
    for (const l of p.components) {
      l.id = n.ids.get(l.id) || l.id;
      for (const a of l.ports) a.bit = n.bits.get(a.bit) ?? a.bit;
    }
    for (const l of p.segments) l.bit = n.bits.get(l.bit) ?? l.bit;
  }
  return { svg: new XMLSerializer().serializeToString(s.documentElement), drawing: p };
}
function eo(t, e) {
  const n = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("render-worker-BSHI2pZ1.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((i, o) => {
    const s = (l, a) => {
      clearTimeout(r), n.terminate(), l ? o(Error(l)) : i(a);
    }, p = Object.keys(t.modules.circuit.cells).length > 300 ? 6e4 : 3e4, r = setTimeout(() => s("Layout timed out. Open a subcircuit sheet or collapse instances."), p);
    n.onmessage = ({ data: l }) => s(l.error, { svg: l.svg, drawing: l.drawing }), n.onerror = (l) => s(l.message || "Layout worker failed."), n.postMessage({ netlist: t, settings: e });
  });
}
const to = `* RLC low-pass filter
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
`, no = `* Voltage-divider biased common-emitter amplifier.
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
`, oo = `* Common-collector voltage follower; independently chosen example values.
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
`, ro = `* Unity-gain Sallen-Key second-order low-pass filter.\r
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
`, io = `* Classic three-op-amp instrumentation amplifier, arranged in nested stages.\r
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
`, We = {
  filter: { source: to, description: "Series R–L / shunt C low-pass with a resistive load; illustrative component values.", url: "https://circuits.mit.edu/S26/psets/12/series_filters", reference: "MIT 6.200, Series RLC: Filters" },
  amplifier: { source: no, description: "Voltage-divider biased common-emitter amplifier.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.2" },
  follower: { source: oo, description: "Common-collector emitter follower.", url: "https://wiki.analog.com/university/courses/electronics/text/chapter-9", reference: "Analog Devices, chapter 9.4" },
  sallen: { source: ro, description: "Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the 20-transistor 741-style teaching circuit.", url: "https://www.ti.com/lit/an/sloa024b/sloa024b.pdf", reference: "TI SLOA024B" },
  instrumentation: { source: io, description: "Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each transistor-level 741 circuit.", url: "https://www.ti.com/lit/an/sboa282a/sboa282a.pdf", reference: "TI SBOA282A topology, adapted with LM741" }
};
function so(t) {
  const e = new Uint8Array(t);
  if (e[0] === 255 && e[1] === 254 || e[1] === 0) return new TextDecoder("utf-16le").decode(e);
  if (e[0] === 254 && e[1] === 255 || e[0] === 0) return new TextDecoder("utf-16be").decode(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
  } catch {
    return new TextDecoder("windows-1252").decode(e);
  }
}
async function Bt(t) {
  return so(await t.arrayBuffer());
}
const Jt = [
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
].flat(), At = "#292b29", ct = [.../* @__PURE__ */ new Set(["#f6a168", "#65a583", "#5d8bbf", "#c091ab", ...[5, 6, 7, 8, 4, 3, 2, 1, 0].flatMap((t) => [4, 2, 0, 6, 1, 3, 5, 7, 8, 9].map((e) => Jt[e * 9 + t]))])], jt = (t) => /^#[\da-f]{6}$/i.test(t), Vt = "spice-node-colors-v1";
function ao(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n++) e = Math.imul(e ^ t.charCodeAt(n), 16777619);
  return t.length + ":" + (e >>> 0);
}
class lo {
  constructor() {
    this.sourceId = "", this.auto = !1, this.manual = /* @__PURE__ */ new Map(), this.assigned = /* @__PURE__ */ new Map();
  }
  setSource(e) {
    const n = ao(e);
    n !== this.sourceId && (this.sourceId = n, this.manual.clear(), this.assigned.clear());
  }
  color(e) {
    return this.manual.has(e) ? this.manual.get(e) : this.auto ? (this.assigned.has(e) || this.assigned.set(e, ct[this.assigned.size % ct.length]), this.assigned.get(e)) : At;
  }
  set(e, n) {
    if (!jt(n)) throw Error("Invalid node color.");
    for (const i of e) this.manual.set(i, n.toLowerCase());
  }
  reset() {
    this.auto = !1, this.manual.clear(), this.assigned.clear();
  }
  restore(e) {
    if (!(!e || typeof e.sourceId != "string")) {
      this.sourceId = e.sourceId, this.auto = e.auto === !0;
      for (const n of ["manual", "assigned"]) this[n] = new Map((Array.isArray(e[n]) ? e[n] : []).filter((i) => Array.isArray(i) && typeof i[0] == "string" && jt(i[1])));
    }
  }
  snapshot() {
    return { sourceId: this.sourceId, auto: this.auto, manual: [...this.manual], assigned: [...this.assigned] };
  }
}
function co(t, e, n) {
  const i = new Map(e.map((o) => [o.name, n.color(o.name)]));
  for (const o of t.children) if (["line", "path", "polyline", "circle"].includes(o.localName) && o.hasAttribute("data-net")) {
    const s = i.get(o.getAttribute("data-net"));
    if (!s) continue;
    o.style.setProperty("stroke", s, "important"), o.localName === "circle" && o.style.setProperty("fill", s, "important");
  }
}
function uo(t, e) {
  const n = new lo(), i = /* @__PURE__ */ new Set();
  let o = [], s = !1;
  try {
    n.restore(JSON.parse(sessionStorage.getItem(Vt) || "null"));
  } catch {
  }
  const p = () => {
    try {
      sessionStorage.setItem(Vt, JSON.stringify(n.snapshot()));
    } catch {
    }
  }, r = () => {
    const g = t("node-search").value.trim().toLowerCase();
    return o.filter((d) => !g || [d.name, d.displayName, ...d.terminals.map((m) => m.component + "." + m.pin)].some((m) => m.toLowerCase().includes(g)));
  };
  function l() {
    const g = r(), d = g.filter((m) => i.has(m.name)).length;
    t("node-count").textContent = `${g.length} / ${o.length} nodes · ${i.size} selected`, t("node-all").checked = !!g.length && d === g.length, t("node-all").indeterminate = d > 0 && d < g.length, t("node-auto").checked = n.auto;
    for (const m of ["node-apply", "node-clear"]) t(m).disabled = !s || !i.size;
    t("node-all").disabled = !s || !g.length;
  }
  function a() {
    t("nets").replaceChildren(...r().map((g) => {
      const d = document.createElement("tr");
      d.dataset.node = g.name;
      const m = document.createElement("td"), h = document.createElement("input");
      h.type = "checkbox", h.checked = i.has(g.name), h.disabled = !s, h.setAttribute("aria-label", "Select node " + g.displayName), h.onchange = () => {
        h.checked ? i.add(g.name) : i.delete(g.name), l();
      }, m.append(h);
      const _ = document.createElement("td");
      _.textContent = g.displayName;
      const b = document.createElement("td"), y = document.createElement("input");
      y.type = "color", y.value = n.color(g.name), y.disabled = !s, y.setAttribute("aria-label", "Wire color for " + g.displayName), y.onchange = () => {
        n.set([g.name], y.value), c();
      }, b.append(y);
      const k = document.createElement("td");
      return k.textContent = g.terminals.map((I) => I.component + "." + I.pin).join(", "), d.append(m, _, b, k), d;
    })), l();
  }
  function c() {
    for (const g of o) n.color(g.name);
    a(), p(), e(n, o);
  }
  t("node-search").oninput = a, t("node-all").onchange = () => {
    for (const g of r()) t("node-all").checked ? i.add(g.name) : i.delete(g.name);
    a();
  }, t("node-auto").onchange = () => {
    n.auto = t("node-auto").checked, c();
  }, t("node-apply").onclick = () => {
    n.set(i, t("node-color").value), c();
  }, t("node-clear").onclick = () => {
    n.set(i, At), c();
  }, t("node-reset").onclick = () => {
    n.reset(), c();
  }, t("node-swatches").replaceChildren(...Jt.map((g) => {
    const d = document.createElement("button");
    return d.type = "button", d.style.backgroundColor = g, d.title = g, d.setAttribute("aria-label", "Apply palette color " + g), d.onclick = () => {
      i.size && (t("node-color").value = g, n.set(i, g), c());
    }, d;
  }));
  function x(g) {
    s = g;
    for (const d of t("node-panel").querySelectorAll("input,button")) d.disabled = !s;
    l();
  }
  return { snapshot: () => n.snapshot(), restore(g) {
    n.restore(g), i.clear(), c();
  }, setCircuit(g, d) {
    const m = n.sourceId;
    n.setSource(d), m !== n.sourceId && i.clear(), o = Object.values(g?.nodes || {});
    const h = new Set(o.map((_) => _.name));
    for (const _ of i) h.has(_) || i.delete(_);
    for (const _ of o) n.color(_.name);
    s = !!g, a(), x(s), p(), e(n, o);
  }, setEnabled: x };
}
function fo(t) {
  const e = (L) => t.querySelector("#spice-" + L), n = new AbortController(), i = n.signal, o = { editor: e("editor-panel"), details: e("details-panel"), info: e("info-panel") }, s = Object.fromEntries(Object.keys(o).map((L) => [L, t.querySelector(`[data-window-handle="${L}"]`)])), p = { editor: !0, details: !0, info: !0 }, r = { editor: !0, details: !0, info: !0 }, l = [], a = { editor: {}, details: {}, info: {} }, c = [];
  let x = !1, g = !1, d = null, m = null, h = null, _ = null;
  function b(L, V) {
    r[L] = V, o[L].dataset.pinned = String(V);
    const K = e("pin-" + L), z = { editor: "netlist", details: "details", info: "messages" }[L], re = L === "info" ? "bottom edge" : L === "details" ? "lower left" : "left edge", ae = V ? `Unpin ${z} from ${re}` : `Pin ${z} to ${re}`;
    if (K.setAttribute("aria-pressed", String(V)), K.setAttribute("aria-label", ae), K.title = ae, V) for (const J of ["left", "top", "right", "bottom", "width", "height"]) o[L].style.removeProperty(J);
    x && requestAnimationFrame(N);
  }
  for (const L of Object.keys(o)) b(L, !0);
  const y = () => t.dispatchEvent(new CustomEvent("spice:workspacechange", { detail: { fullscreen: x, panels: { ...p } } })), k = (L, V, K, z = {}) => L.addEventListener(V, K, { ...z, signal: i });
  function I(L, V) {
    p[L] = V, o[L].hidden = x && !V, requestAnimationFrame(N), y();
  }
  function A(L, V = e("details-content")) {
    const K = document.createComment("workspace return");
    L.before(K), l.push({ node: L, anchor: K }), V === e("details-content") ? V.prepend(L) : V.append(L);
  }
  function C(L) {
    const V = L.getBoundingClientRect(), K = t.getBoundingClientRect();
    return { x: V.left - K.left, y: V.top - K.top, w: V.width, h: V.height, width: K.width, height: K.height };
  }
  function M(L, V, K) {
    const z = C(L), re = parseFloat(getComputedStyle(t).getPropertyValue("--spice-window-top")) || 100, ae = Math.max(8, Math.min(V, z.width - z.w - 8)), J = Math.max(8, Math.min(re, z.height - z.h - 8)), be = Math.max(J, Math.min(K, z.height - z.h - 8));
    L.style.left = Math.round(ae) + "px", L.style.top = Math.round(be) + "px", L.style.right = "auto", L.style.bottom = "auto";
  }
  function B() {
    if (!x || !r.info || o.info.hidden) return;
    const L = t.getBoundingClientRect(), V = L.width <= 600 ? 8 : 12, K = L.width <= 600 ? V : Math.max(V, ...["editor", "details"].filter((ae) => r[ae] && !o[ae].hidden).map((ae) => o[ae].getBoundingClientRect().right - L.left + 12)), z = Math.min(K, Math.max(V, L.width - 160 - V)), re = o.info;
    for (const [ae, J] of Object.entries({ left: Math.round(z) + "px", right: V + "px", width: "auto" })) re.style[ae] !== J && (re.style[ae] = J);
  }
  function N() {
    if (x) {
      B();
      for (const [L, V] of Object.entries(o)) if (!V.hidden && !r[L]) {
        const K = C(V);
        M(V, K.x, K.y);
      }
    }
  }
  function w() {
    for (const L of Object.values(o))
      for (const V of ["left", "top", "right", "bottom", "width", "height", "z-index"]) L.style.removeProperty(V);
    for (const L of Object.keys(o))
      b(L, !0), I(L, !0);
    requestAnimationFrame(N);
  }
  function G() {
    if (x) return;
    x = !0, d = document.activeElement, m = { x: window.scrollX, y: window.scrollY, html: document.documentElement.style.overflow, body: document.body.style.overflow }, _ = document.createComment("workspace mount"), t.before(_), document.body.append(t);
    for (const V of document.body.children) V !== t && (c.push({ node: V, inert: V.inert }), V.inert = !0);
    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden", t.classList.add("spice-is-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "true");
    for (const V of Object.keys(o))
      a[V].base = o[V].style.cssText, a[V].floating && (o[V].style.cssText = a[V].floating), o[V].setAttribute("role", "dialog"), o[V].setAttribute("aria-modal", "false"), o[V].setAttribute("aria-labelledby", "spice-" + V + "-title"), s[V].tabIndex = 0, s[V].title = "Drag to move; arrow keys move the window", I(V, p[V]);
    for (const V of ["selection-actions", "selection", "hierarchy-panel"]) A(e(V));
    const L = e("workspace-strip");
    for (const V of ["hierarchy-bar", "canvas-toolbar", "edit-toolbar"]) {
      if (L.childElementCount) {
        const K = document.createElement("span");
        K.className = "spice-tool-divider", K.setAttribute("role", "separator"), K.setAttribute("aria-orientation", "vertical"), L.append(K);
      }
      A(V === "hierarchy-bar" ? t.querySelector(".spice-hierarchy-bar") : e(V), L);
    }
    requestAnimationFrame(N), e("exit-fullscreen").focus({ preventScroll: !0 }), y();
  }
  function $() {
    if (x) {
      x = !1, h = null, t.classList.remove("spice-is-fullscreen"), t.removeAttribute("data-native-fullscreen"), e("fullscreen").setAttribute("aria-pressed", "false");
      for (const { node: L, anchor: V } of l.splice(0))
        V.before(L), V.remove();
      e("workspace-strip").replaceChildren();
      for (const L of Object.keys(o)) {
        a[L].floating = o[L].style.cssText, o[L].style.cssText = a[L].base, o[L].hidden = !1;
        for (const V of ["role", "aria-modal", "aria-labelledby"]) o[L].removeAttribute(V);
        s[L].removeAttribute("tabindex"), s[L].removeAttribute("title");
      }
      _ && (_.before(t), _.remove(), _ = null);
      for (const { node: L, inert: V } of c.splice(0)) L.inert = V;
      m && (document.documentElement.style.overflow = m.html, document.body.style.overflow = m.body, window.scrollTo(m.x, m.y)), d?.focus?.({ preventScroll: !0 }), y();
    }
  }
  async function X() {
    G(), t.dataset.nativeFullscreen = "false";
  }
  async function Y() {
    if (g = !1, document.fullscreenElement === t)
      try {
        await document.exitFullscreen();
      } catch {
        g = !0;
        return;
      }
    $();
  }
  k(e("fullscreen"), "click", () => x ? Y() : X()), k(e("exit-fullscreen"), "click", Y), k(e("reset-windows"), "click", w);
  for (const L of Object.keys(o)) {
    k(e("pin-" + L), "click", () => {
      const z = C(o[L]);
      b(L, !r[L]), r[L] || (o[L].style.width = z.w + "px", o[L].style.height = z.h + "px", M(o[L], z.x, z.y)), y();
    }), k(e("close-" + L), "click", () => {
      I(L, !1), e("reset-windows").focus({ preventScroll: !0 });
    }), k(o[L], "pointerdown", () => {
      if (x) {
        for (const z of Object.values(o)) z.style.zIndex = "20";
        o[L].style.zIndex = "30";
      }
    }, { capture: !0 });
    const V = s[L];
    k(V, "pointerdown", (z) => {
      if (!x || z.button !== 0 || z.target.closest("button,input,select,textarea,a,label")) return;
      z.preventDefault();
      const re = C(o[L]);
      b(L, !1), o[L].style.width = re.w + "px", o[L].style.height = re.h + "px", M(o[L], re.x, re.y), h = { id: L, pointer: z.pointerId, x: z.clientX, y: z.clientY, left: re.x, top: re.y }, V.setPointerCapture(z.pointerId);
    }), k(V, "pointermove", (z) => {
      h?.id === L && h.pointer === z.pointerId && M(o[L], h.left + z.clientX - h.x, h.top + z.clientY - h.y);
    });
    const K = () => {
      h = null;
    };
    k(V, "pointerup", K), k(V, "pointercancel", K), k(V, "lostpointercapture", K), k(V, "keydown", (z) => {
      if (!x || z.target !== V || !z.key.startsWith("Arrow")) return;
      z.preventDefault();
      const re = C(o[L]), ae = z.shiftKey ? 32 : 8;
      b(L, !1), o[L].style.width = re.w + "px", o[L].style.height = re.h + "px", M(o[L], re.x + ({ ArrowLeft: -ae, ArrowRight: ae }[z.key] || 0), re.y + ({ ArrowUp: -ae, ArrowDown: ae }[z.key] || 0));
    });
  }
  k(document, "fullscreenchange", () => {
    x && g && document.fullscreenElement !== t && (g = !1, $());
  }), k(document, "keydown", (L) => {
    x && L.altKey && L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), Y());
  }, { capture: !0 }), k(window, "resize", N);
  const ne = new ResizeObserver(N);
  for (const L of Object.values(o)) ne.observe(L);
  return { enter: X, exit: Y, showPanel: I, reset: w, destroy() {
    Y(), n.abort(), ne.disconnect();
  } };
}
const po = `<svg
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
`, ut = (t) => !t.decoration || t.selectable === !0;
function Gt(t, e, n) {
  const i = Math.min(e.x, n.x), o = Math.max(e.x, n.x), s = Math.min(e.y, n.y), p = Math.max(e.y, n.y), r = n.x < e.x, l = 1e-3;
  return t.filter((a) => ut(a) && (r ? a.x <= o + l && a.x + a.width >= i - l && a.y <= p + l && a.y + a.height >= s - l : a.x >= i - l && a.x + a.width <= o + l && a.y >= s - l && a.y + a.height <= p + l)).map((a) => a.id);
}
function ho(t, e, n, i) {
  const o = new Set(e), s = t.filter((_) => o.has(_.id) && ut(_)), p = n.startsWith("space-");
  if (s.length < (p ? 3 : 2)) throw Error(p ? "Select at least three components." : "Select at least two components.");
  const r = ["left", "right", "center-x", "space-x"].includes(n), l = ["top", "bottom", "center-y", "space-y"].includes(n);
  if (!r && !l) throw Error("Unknown arrangement.");
  const a = r ? "x" : "y", c = r ? "width" : "height", x = Math.min(...s.map((_) => _[a])), g = Math.max(...s.map((_) => _[a] + _[c])), d = /* @__PURE__ */ new Map();
  if (p) {
    const _ = [...s].sort((A, C) => A[a] - C[a] || A.id.localeCompare(C.id)), b = _.at(-1), y = b[a] + b[c] - _[0][a], k = (y - _.reduce((A, C) => A + C[c], 0)) / (s.length - 1);
    if (k < -1e-3) throw Error("Not enough space for non-overlapping equal gaps. Move the outer components farther apart.");
    let I = _[0][a];
    for (const A of _)
      d.set(A.id, I), I += A[c] + k;
  } else for (const _ of s) d.set(_.id, ["left", "top"].includes(n) ? x : ["right", "bottom"].includes(n) ? g - _[c] : (x + g - _[c]) / 2);
  let m = !1;
  return { moves: s.map((_) => {
    const b = d.get(_.id) - _[a], y = Math.round(b / i) * i;
    return Math.abs(y - b) > 1e-3 && (m = !0), { id: _.id, dx: r ? y : 0, dy: l ? y : 0 };
  }), rounded: m };
}
const mo = (t) => "@manual-group/" + t;
function Nt(t, e = []) {
  const n = new Set(t);
  for (const i of e) if (i.members.some((o) => n.has(o))) for (const o of i.members) n.add(o);
  return n;
}
function nt(t, e = []) {
  const n = new Set(t);
  return e.find((i) => i.members.length === n.size && i.members.every((o) => n.has(o)));
}
function De(t, e = []) {
  const n = new Map(t.map((s) => [s.id, s])), i = new Set(e.flatMap((s) => s.members)), o = t.filter((s) => !i.has(s.id)).map((s) => ({ ...s, members: [s.id] }));
  for (const s of e) {
    const p = s.members.map((a) => n.get(a));
    if (p.some((a) => !a)) throw Error("Unknown manual group member.");
    const r = Math.min(...p.map((a) => a.x)), l = Math.min(...p.map((a) => a.y));
    o.push({ id: mo(s.id), groupId: s.id, members: [...s.members], x: r, y: l, width: Math.max(...p.map((a) => a.x + a.width)) - r, height: Math.max(...p.map((a) => a.y + a.height)) - l, ports: [] });
  }
  return o;
}
function Xe(t, e = []) {
  if (!e.length) return !1;
  const n = De(t, e);
  return n.some((i, o) => n.slice(o + 1).some((s) => (i.groupId || s.groupId) && i.x < s.x + s.width - 1e-3 && i.x + i.width > s.x + 1e-3 && i.y < s.y + s.height - 1e-3 && i.y + i.height > s.y + 1e-3));
}
function en(t, e) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 5e3) throw Error("Invalid project: invalid manual groups.");
  const n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = new Map(e.map((s) => [s.id, s]));
  for (const s of t) {
    if (!s || typeof s.id != "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(s.id) || n.has(s.id) || !Array.isArray(s.members) || s.members.length < 2) throw Error("Invalid project: invalid manual group identity.");
    n.add(s.id);
    for (const p of s.members) {
      const r = o.get(p);
      if (!r || !ut(r) || i.has(p)) throw Error("Invalid project: missing or duplicate manual group member.");
      i.add(p);
    }
  }
}
const ft = (t, e) => encodeURIComponent(t) + ":" + e;
function tn(t) {
  if (t === void 0) return;
  if (!Array.isArray(t) || t.length > 2e4) throw Error("Invalid project: invalid label overrides.");
  const e = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!n || typeof n.owner != "string" || !Number.isSafeInteger(n.index) || n.index < 0 || n.id !== ft(n.owner, n.index) || e.has(n.id) || typeof n.text != "string" || n.text.length > 2e4 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(n.text) || ![n.x, n.y].every((o) => Number.isFinite(o) && Math.abs(o) <= 1e6)) throw Error("Invalid project: invalid label identity, text or position.");
    e.add(n.id);
    const i = n.orientation;
    if (!Array.isArray(i) || i.length !== 4 || !i.every((o) => [-1, 0, 1].includes(o)) || i[0] ** 2 + i[1] ** 2 !== 1 || i[2] ** 2 + i[3] ** 2 !== 1 || i[0] * i[2] + i[1] * i[3] !== 0) throw Error("Invalid project: label transform must be a rotation or mirror.");
  }
}
function go(t, e) {
  const n = { rotate: [0, 1, -1, 0], "mirror-x": [1, 0, 0, -1], "mirror-y": [-1, 0, 0, 1] }[e];
  if (!n) throw Error("Unknown label transform.");
  const i = t.orientation;
  return { ...t, orientation: [n[0] * i[0] + n[2] * i[1], n[1] * i[0] + n[3] * i[1], n[0] * i[2] + n[2] * i[3], n[1] * i[2] + n[3] * i[3]].map((o) => o || 0) };
}
const bo = "http://www.w3.org/2000/svg";
function nn(t) {
  const e = /* @__PURE__ */ new Map();
  return [...t.querySelectorAll("text")].filter((n) => !n.closest("defs")).map((n) => {
    const i = n.closest('g[id^="cell_"]')?.id.slice(5) || "", o = e.get(i) || 0;
    return e.set(i, o + 1), { node: n, owner: i, index: o, id: ft(i, o) };
  });
}
function St(t, e) {
  tn(e);
  const n = new Set(nn(t).map((i) => i.id));
  for (const i of e || []) if (!n.has(i.id)) throw Error("Invalid project: unknown label " + i.id);
}
function yo() {
  let t = null, e = /* @__PURE__ */ new Map(), n = [], i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = !1, p = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  const l = (d, m) => {
    const h = document.createElementNS(bo, d);
    for (const [_, b] of Object.entries(m)) h.setAttribute(_, b);
    return h;
  };
  function a() {
    for (const d of e.values()) if (d.node.isConnected) {
      for (const m of [...d.node.attributes]) d.node.removeAttribute(m.name);
      for (const [m, h] of d.attributes) d.node.setAttribute(m, h);
      d.node.textContent = d.text;
    }
    t?.querySelector("[data-label-hit-layer]")?.remove(), e.clear(), n = [];
  }
  function c(d) {
    const m = d.getBBox(), h = t.getCTM().inverse().multiply(d.getCTM()), _ = [[m.x, m.y], [m.x + m.width, m.y], [m.x, m.y + m.height], [m.x + m.width, m.y + m.height]].map(([k, I]) => new DOMPoint(k, I).matrixTransform(h)), b = Math.min(..._.map((k) => k.x)), y = Math.min(..._.map((k) => k.y));
    return { x: b, y, width: Math.max(..._.map((k) => k.x)) - b, height: Math.max(..._.map((k) => k.y)) - y };
  }
  function x(d, m) {
    d.node.textContent = m.text;
    const h = d.node.getBBox(), [_, b, y, k] = m.orientation, I = i.get(m.owner) || { x: 0, y: 0 }, A = [0, _ * h.width, y * h.height, _ * h.width + y * h.height], C = [0, b * h.width, k * h.height, b * h.width + k * h.height], M = new DOMMatrix([_, b, y, k, I.x + m.x - Math.min(...A) - _ * h.x - y * h.y, I.y + m.y - Math.min(...C) - b * h.x - k * h.y]), B = t.getCTM().inverse().multiply(d.node.parentElement.getCTM()), N = new DOMMatrix([B.a, B.b, B.c, B.d, B.e, B.f]), w = N.inverse().multiply(M);
    d.node.setAttribute("transform", "matrix(" + [w.a, w.b, w.c, w.d, w.e, w.f].join(" ") + ")");
  }
  function g() {
    if (t?.querySelector("[data-label-hit-layer]")?.remove(), r.clear(), !s || !t) return;
    const d = l("g", { "data-label-hit-layer": "true", "data-editor-overlay": "true" });
    for (const h of n) {
      const _ = l("rect", { x: h.x - 2, y: h.y - 2, width: Math.max(8, h.width) + 4, height: Math.max(12, h.height) + 4, fill: p.has(h.id) ? "#507d9c" : "transparent", "fill-opacity": p.has(h.id) ? 0.12 : 0, stroke: "#507d9c", "stroke-opacity": p.has(h.id) ? 1 : 0.35, "stroke-width": p.has(h.id) ? 1.5 : 0.7, "stroke-dasharray": p.has(h.id) ? "none" : "3 3", "vector-effect": "non-scaling-stroke", "pointer-events": "all", "data-editor-label": h.id, ...p.has(h.id) ? { "data-selected-label": h.id } : {} });
      r.set(h.id, _), d.append(_);
    }
    const m = t.querySelector("[data-airwires]");
    m ? t.insertBefore(d, m) : t.append(d);
  }
  return {
    reset: a,
    layout(d, m, h, _, b) {
      t = d, i = new Map(m.map((y) => [y.id, y])), o = new Map((h || []).map((y) => [y.id, y])), s = _, p = b, e.clear(), n = [];
      for (const y of nn(t)) {
        const k = c(y.node), I = i.get(y.owner) || { x: 0, y: 0 }, A = { ...y, attributes: [...y.node.attributes].map((M) => [M.name, M.value]), text: y.node.textContent, record: { id: y.id, owner: y.owner, index: y.index, text: y.node.textContent, x: k.x - I.x, y: k.y - I.y, orientation: [1, 0, 0, 1] } };
        e.set(y.id, A);
        const C = o.get(y.id);
        C && x(A, C), y.node.dataset.labelId = y.id, n.push({ id: y.id, ...c(y.node), ports: [] });
      }
      return g(), { x: Math.min(0, ...n.map((y) => y.x)), y: Math.min(0, ...n.map((y) => y.y)), right: Math.max(0, ...n.map((y) => y.x + y.width)), bottom: Math.max(0, ...n.map((y) => y.y + y.height)) };
    },
    nodes: () => n,
    record(d) {
      const m = e.get(d);
      if (!m) throw Error("Label no longer exists.");
      return structuredClone(o.get(d) || m.record);
    },
    preview(d) {
      const m = new Set(d.map((h) => h.id));
      for (const h of d) {
        const _ = e.get(h.id);
        if (_) {
          const b = this.record(h.id);
          x(_, { ...b, x: b.x + h.dx, y: b.y + h.dy });
        }
      }
      n = n.map((h) => {
        if (!m.has(h.id)) return h;
        const _ = { ...h, ...c(e.get(h.id).node) }, b = r.get(h.id);
        if (b) for (const [y, k] of Object.entries({ x: _.x - 2, y: _.y - 2, width: Math.max(8, _.width) + 4, height: Math.max(12, _.height) + 4 })) b.setAttribute(y, k);
        return _;
      });
    }
  };
}
const se = 1e-3, le = (t) => Math.round(t.x * 1e3) + "," + Math.round(t.y * 1e3), fe = (t, e) => Math.abs(t - e) < se, _e = (t, e) => fe(e.a.x, e.b.x) ? fe(t.x, e.a.x) && t.y >= Math.min(e.a.y, e.b.y) - se && t.y <= Math.max(e.a.y, e.b.y) + se : fe(t.y, e.a.y) && t.x >= Math.min(e.a.x, e.b.x) - se && t.x <= Math.max(e.a.x, e.b.x) + se, wo = (t) => Math.abs(t.a.x - t.b.x) + Math.abs(t.a.y - t.b.y), xo = (t, e) => Math.max(t.a.x, t.b.x) > e.x + se && Math.min(t.a.x, t.b.x) < e.x + e.width - se && Math.max(t.a.y, t.b.y) > e.y + se && Math.min(t.a.y, t.b.y) < e.y + e.height - se;
function ht(t) {
  const e = [];
  for (const n of t)
    if (!(e.length && le(e.at(-1)) === le(n))) {
      for (; e.length > 1 && (fe(e.at(-2).x, e.at(-1).x) && fe(e.at(-1).x, n.x) || fe(e.at(-2).y, e.at(-1).y) && fe(e.at(-1).y, n.y)); ) e.pop();
      e.push({ ...n });
    }
  return e;
}
class on {
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
    return fe(e.x / this.step, Math.round(e.x / this.step)) && fe(e.y / this.step, Math.round(e.y / this.step));
  }
  snap(e) {
    return { x: Math.round(e.x / this.step) * this.step, y: Math.round(e.y / this.step) * this.step };
  }
  validSegment(e, n) {
    if (!this.onGrid(e.a) || !this.onGrid(e.b) || !fe(e.a.x, e.b.x) && !fe(e.a.y, e.b.y)) return !1;
    const i = this.pins();
    if (i.some((o) => o.bit !== n && _e(o, e)) || this.segments.some((o) => o.bit !== n && (_e(e.a, o) || _e(e.b, o) || _e(o.a, e) || _e(o.b, e)))) return !1;
    for (const o of this.components) if (xo(e, o) && !i.filter((p) => p.owner === o.id && p.bit === n).some((p) => p.side === "NORTH" ? fe(e.a.x, p.x) && fe(e.b.x, p.x) && Math.max(e.a.y, e.b.y) <= p.y + se : p.side === "SOUTH" ? fe(e.a.x, p.x) && fe(e.b.x, p.x) && Math.min(e.a.y, e.b.y) >= p.y - se : p.side === "WEST" ? fe(e.a.y, p.y) && fe(e.b.y, p.y) && Math.max(e.a.x, e.b.x) <= p.x + se : p.side === "EAST" ? fe(e.a.y, p.y) && fe(e.b.y, p.y) && Math.min(e.a.x, e.b.x) >= p.x - se : !1))
      return !1;
    return !0;
  }
  addPath(e, n) {
    const i = ht(n), o = i.slice(1).map((s, p) => ({ bit: e, a: i[p], b: s })).filter((s) => wo(s) > se);
    if (!o.length) return !1;
    if (o.some((s) => !this.validSegment(s, e))) throw Error("Route blocked by a component or another node.");
    return this.remember(), this.segments.push(...o), !0;
  }
  move(e, n, i) {
    if (this.manualGroups?.length) return this.moveMany([{ id: e, dx: n, dy: i }]);
    if (n = Math.round(n / this.step) * this.step, i = Math.round(i / this.step) * this.step, !n && !i) return;
    const o = this.snapshot(), s = this.components.find((l) => l.id === e);
    if (!s) return;
    const p = s.ports.map((l) => ({ ...l }));
    this.segments = this.segments.filter((l) => !p.some((a) => a.bit === l.bit && (le(a) === le(l.a) || le(a) === le(l.b)))), s.x += n, s.y += i;
    for (const l of s.ports)
      l.x += n, l.y += i;
    if (this.pinCache = null, this.components.some((l) => l !== s && s.x < l.x + l.width - se && s.x + s.width > l.x + se && s.y < l.y + l.height - se && s.y + s.height > l.y + se) || this.segments.some((l) => !this.validSegment(l, l.bit)) || s.ports.some((l) => this.pins().some((a) => a.owner !== e && a.bit !== l.bit && le(a) === le(l))))
      throw this.restore(o), Error("Drop blocked: a component or another node occupies that position.");
    this.remember(o);
  }
  moveMany(e) {
    const n = new Map(e.map((a) => [a.id, { ...a }]));
    for (const a of this.manualGroups || []) {
      const c = a.members.map((g) => n.get(g)).filter(Boolean);
      if (!c.length) continue;
      const x = c[0];
      if (c.some((g) => g.dx !== x.dx || g.dy !== x.dy)) throw Error("Grouped components must move together.");
      for (const g of a.members) n.set(g, { id: g, dx: x.dx, dy: x.dy });
    }
    e = [...n.values()];
    const i = new Map(e.map((a) => [a.id, { dx: Math.round(a.dx / this.step) * this.step, dy: Math.round(a.dy / this.step) * this.step }]).filter(([, a]) => a.dx || a.dy)), o = this.components.filter((a) => i.has(a.id));
    if (!o.length) return !1;
    const s = this.snapshot(), p = o.flatMap((a) => a.ports);
    this.segments = this.segments.filter((a) => !p.some((c) => c.bit === a.bit && _e(c, a)));
    for (const a of o) {
      const c = i.get(a.id);
      a.x += c.dx, a.y += c.dy;
      for (const x of a.ports)
        x.x += c.dx, x.y += c.dy;
    }
    this.pinCache = null, this.cache = null;
    const r = this.pins();
    if (o.some((a) => this.components.some((c) => c !== a && a.x < c.x + c.width - se && a.x + a.width > c.x + se && a.y < c.y + c.height - se && a.y + a.height > c.y + se)) || Xe(this.components, this.manualGroups) || r.some((a) => !this.onGrid(a) || r.some((c) => c.owner !== a.owner && c.bit !== a.bit && le(c) === le(a))) || this.segments.some((a) => !this.validSegment(a, a.bit)))
      throw this.restore(s), Error("Arrangement blocked: a component, manual group or another node occupies the target position.");
    return this.remember(s), !0;
  }
  transform(e, n) {
    const i = this.manualGroups?.find((d) => d.members.includes(e));
    if (i) return this.transformGroup(i.id, n);
    const o = this.components.find((d) => d.id === e);
    if (!o) return;
    const s = this.snapshot(), p = o.width, r = o.height, l = n === "rotate" ? [0, 1, -1, 0, r, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, r] : n === "mirror-y" ? [-1, 0, 0, 1, p, 0] : null;
    if (!l) throw Error("Unknown transform.");
    const a = o.ports.map((d) => ({ ...d })), c = (d) => ({ x: l[0] * d.x + l[2] * d.y + l[4], y: l[1] * d.x + l[3] * d.y + l[5] });
    this.segments = this.segments.filter((d) => !a.some((m) => m.bit === d.bit && (le(m) === le(d.a) || le(m) === le(d.b))));
    const x = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of o.ports) {
      const m = c({ x: d.x - o.x, y: d.y - o.y });
      d.x = o.x + m.x, d.y = o.y + m.y, d.side = x[d.side] || d.side;
    }
    const g = o.editorMatrix || [1, 0, 0, 1, 0, 0];
    if (o.editorMatrix = [l[0] * g[0] + l[2] * g[1], l[1] * g[0] + l[3] * g[1], l[0] * g[2] + l[2] * g[3], l[1] * g[2] + l[3] * g[3], l[0] * g[4] + l[2] * g[5] + l[4], l[1] * g[4] + l[3] * g[5] + l[5]], n === "rotate" && (o.width = r, o.height = p), this.pinCache = null, Xe(this.components, this.manualGroups) || o.ports.some((d) => !this.onGrid(d)) || this.components.some((d) => d !== o && o.x < d.x + d.width - se && o.x + o.width > d.x + se && o.y < d.y + d.height - se && o.y + o.height > d.y + se) || this.segments.some((d) => !this.validSegment(d, d.bit)) || o.ports.some((d) => this.pins().some((m) => m.owner !== e && m.bit !== d.bit && le(m) === le(d))))
      throw this.restore(s), Error("Transform blocked: a component or wire occupies that position.");
    this.remember(s);
  }
  group(e) {
    const n = [...Nt(e, this.manualGroups)], i = (this.manualGroups || []).filter((p) => !p.members.some((r) => n.includes(r)));
    if (n.length < 2) throw Error("Select at least two components to group.");
    let o = 1;
    for (; i.some((p) => p.id === "g" + o); ) o++;
    const s = { id: "g" + o, members: n };
    if (i.push(s), en(i, this.components), Xe(this.components, i)) throw Error("Group box overlaps an unselected component or another group. Include it in the selection or move it away.");
    return this.remember(), this.manualGroups = i, s;
  }
  ungroup(e) {
    const n = new Set(e), i = (this.manualGroups || []).filter((o) => !o.members.some((s) => n.has(s)));
    return i.length === (this.manualGroups || []).length ? !1 : (this.remember(), this.manualGroups = i, !0);
  }
  transformGroup(e, n) {
    const i = this.manualGroups?.find((d) => d.id === e);
    if (!i) return;
    const o = De(this.components, [i]).find((d) => d.groupId === e), s = n === "rotate" ? [0, 1, -1, 0, o.height, 0] : n === "mirror-x" ? [1, 0, 0, -1, 0, o.height] : n === "mirror-y" ? [-1, 0, 0, 1, o.width, 0] : null;
    if (!s) throw Error("Unknown group transform.");
    const p = this.snapshot(), r = this.components.filter((d) => i.members.includes(d.id)), l = r.flatMap((d) => d.ports);
    this.segments = this.segments.filter((d) => !l.some((m) => m.bit === d.bit && _e(m, d)));
    const a = (d) => ({ x: o.x + s[0] * (d.x - o.x) + s[2] * (d.y - o.y) + s[4], y: o.y + s[1] * (d.x - o.x) + s[3] * (d.y - o.y) + s[5] }), c = n === "rotate" ? { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" } : n === "mirror-x" ? { NORTH: "SOUTH", SOUTH: "NORTH" } : { EAST: "WEST", WEST: "EAST" };
    for (const d of r) {
      const m = d.width, h = d.height, _ = [a(d), a({ x: d.x + m, y: d.y + h })], b = Math.min(..._.map((A) => A.x)), y = Math.min(..._.map((A) => A.y)), k = a(d), I = d.editorMatrix || [1, 0, 0, 1, 0, 0];
      d.editorMatrix = [s[0] * I[0] + s[2] * I[1], s[1] * I[0] + s[3] * I[1], s[0] * I[2] + s[2] * I[3], s[1] * I[2] + s[3] * I[3], s[0] * I[4] + s[2] * I[5] + k.x - b, s[1] * I[4] + s[3] * I[5] + k.y - y];
      for (const A of d.ports) {
        const C = a(A);
        A.x = C.x, A.y = C.y, A.side = c[A.side] || A.side;
      }
      d.x = b, d.y = y, n === "rotate" && (d.width = h, d.height = m);
    }
    this.pinCache = null, this.cache = null;
    const x = this.pins();
    if (r.some((d) => this.components.some((m) => m !== d && d.x < m.x + m.width - se && d.x + d.width > m.x + se && d.y < m.y + m.height - se && d.y + d.height > m.y + se)) || Xe(this.components, this.manualGroups) || x.some((d) => !this.onGrid(d) || x.some((m) => m.bit !== d.bit && le(m) === le(d))) || this.segments.some((d) => !this.validSegment(d, d.bit)))
      throw this.restore(p), Error("Group transform blocked by a component, wire or another node.");
    this.remember(p);
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
      const s = /* @__PURE__ */ new Map(), p = (c) => {
        s.has(le(c)) || s.set(le(c), c);
      };
      o.pins.forEach(p);
      for (const c of o.segments)
        p(c.a), p(c.b);
      for (let c = 0; c < o.segments.length; c++) for (let x = c + 1; x < o.segments.length; x++) {
        const g = o.segments[c], d = o.segments[x];
        if (fe(g.a.x, g.b.x) === fe(d.a.x, d.b.x)) continue;
        const m = fe(g.a.x, g.b.x) ? g : d, h = m === g ? d : g, _ = { x: m.a.x, y: h.a.y };
        _e(_, m) && _e(_, h) && p(_);
      }
      const r = new Map([...s.keys()].map((c) => [c, c])), l = (c) => {
        let x = c;
        for (; r.get(x) !== x; ) x = r.get(x);
        for (; c !== x; ) {
          const g = r.get(c);
          r.set(c, x), c = g;
        }
        return x;
      };
      for (const c of o.segments) {
        const x = [...s.values()].filter((g) => _e(g, c));
        for (const g of x.slice(1)) r.set(l(le(g)), l(le(x[0])));
      }
      const a = /* @__PURE__ */ new Map();
      for (const c of o.pins) {
        const x = l(le(c));
        a.has(x) || a.set(x, { pins: [], points: [] }), a.get(x).pins.push(c);
      }
      for (const c of s.values()) {
        const x = l(le(c));
        a.has(x) && a.get(x).points.push(c);
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
        for (const p of o) for (let r = 0; r < i.length; r++) if (!o.has(r)) for (const l of i[p].points) for (const a of i[r].points) {
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
    const o = (A) => A.slice(1).every((C, M) => this.validSegment({ a: A[M], b: C }, e));
    for (const A of [[n, i], [n, { x: i.x, y: n.y }, i], [n, { x: n.x, y: i.y }, i]]) {
      const C = ht(A);
      if (o(C)) return C;
    }
    const s = this.step, p = this.bounds(), r = Math.floor(Math.min(p.x, n.x, i.x) / s) - 5, l = Math.ceil(Math.max(p.x + p.w, n.x, i.x) / s) + 5, a = Math.floor(Math.min(p.y, n.y, i.y) / s) - 5, c = Math.ceil(Math.max(p.y + p.h, n.y, i.y) / s) + 5, x = { x: n.x / s, y: n.y / s, dir: -1, cost: 0, key: n.x / s + "," + n.y / s + ",-1" }, g = [x], d = /* @__PURE__ */ new Map([[x.key, 0]]), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map([[x.key, x]]), _ = [[1, 0], [-1, 0], [0, 1], [0, -1]], b = (A) => Math.abs(A.x - i.x / s) + Math.abs(A.y - i.y / s);
    let y = null, k = 0;
    for (; g.length && k++ < 3e4; ) {
      let A = 0;
      for (let M = 1; M < g.length; M++) g[M].cost + b(g[M]) < g[A].cost + b(g[A]) && (A = M);
      const C = g.splice(A, 1)[0];
      if (C.cost === d.get(C.key)) {
        if (C.x === i.x / s && C.y === i.y / s) {
          y = C;
          break;
        }
        for (let M = 0; M < 4; M++) {
          const B = C.x + _[M][0], N = C.y + _[M][1];
          if (B < r || B > l || N < a || N > c) continue;
          const w = { x: B, y: N, dir: M, key: B + "," + N + "," + M, cost: C.cost + 1 + (C.dir !== -1 && C.dir !== M ? 3 : 0) };
          w.cost >= (d.get(w.key) ?? 1 / 0) || !this.validSegment({ a: { x: C.x * s, y: C.y * s }, b: { x: B * s, y: N * s } }, e) || (d.set(w.key, w.cost), m.set(w.key, C.key), h.set(w.key, w), g.push(w));
        }
      }
    }
    if (!y) return null;
    const I = [];
    for (let A = y; A; A = h.get(m.get(A.key))) I.push({ x: A.x * s, y: A.y * s });
    return ht(I.reverse());
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
      const s = this.airwires().find((r) => !i.has(r.bit + ":" + le(r.a) + ":" + le(r.b)));
      if (!s) break;
      const p = this.findPath(s.bit, s.a, s.b);
      p ? (this.segments.push(...p.slice(1).map((r, l) => ({ bit: s.bit, a: p[l], b: r }))), this.cache = null) : i.add(s.bit + ":" + le(s.a) + ":" + le(s.b)), o % 3 === 0 && await new Promise((r) => setTimeout(r, 0));
    }
    this.redoStack = [];
  }
}
const rn = "spice-viewer-project", sn = 4, an = 32 * 1024 * 1024, ie = (t) => {
  throw Error("Invalid project: " + t);
}, ke = (t) => t && typeof t == "object" && !Array.isArray(t), Ue = (t) => Number.isFinite(t) && Math.abs(t) <= 1e6, $e = (t) => ke(t) && Ue(t.x) && Ue(t.y), Me = (t, e) => Math.abs(t - e) < 1e-3, Ke = (t, e, n) => JSON.stringify([t, e, { font: n.font, fontSize: n.fontSize, color: n.color, gridSize: n.gridSize, detailed: n.detailed, conventional: n.conventional }]);
function Qt(t) {
  return ke(t) && $e(t) && Ue(t.w) && Ue(t.h) && t.w > 0 && t.h > 0;
}
function Ft(t) {
  (!ke(t) || !["Arial", "Helvetica", "Times New Roman", "monospace"].includes(t.font) || !Number.isInteger(t.fontSize) || t.fontSize < 8 || t.fontSize > 24 || ![0, 4].includes(t.gridSize) || typeof t.detailed != "boolean" || typeof t.conventional != "boolean" || t.color !== "#292b29") && ie("unsupported drawing settings.");
}
function ln(t) {
  new TextEncoder().encode(t).length > an && ie("file exceeds 32 MB.");
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    ie("expected a JSON project file.");
  }
  (!ke(e) || e.format !== rn) && ie("unrecognized file format."), [1, 2, 3, sn].includes(e.version) || ie("unsupported project version " + e.version + "."), e.layoutRulesVersion !== Ze && ie("layout version differs; this project requires layout rules v" + e.layoutRulesVersion + "."), (typeof e.source != "string" || e.source.length > 2e6 || typeof e.focus != "string") && ie("missing netlist or sheet."), (!ke(e.libraries) || Object.entries(e.libraries).some(([i, o]) => !i || ["__proto__", "constructor", "prototype"].includes(i) || typeof o != "string")) && ie("invalid libraries."), Ft(e.settings), (![4, 8, 16].includes(e.displayGridStep) || ["showGrid", "interactive", "flywire"].some((i) => typeof e[i] != "boolean") || !Qt(e.view)) && ie("invalid display settings."), e.labelEditing !== void 0 && typeof e.labelEditing != "boolean" && ie("invalid label editing mode."), (!ke(e.colors) || typeof e.colors.sourceId != "string" || typeof e.colors.auto != "boolean" || ["manual", "assigned"].some((i) => !Array.isArray(e.colors[i]) || e.colors[i].some((o) => !Array.isArray(o) || o.length !== 2 || typeof o[0] != "string" || !/^#[\da-f]{6}$/i.test(o[1])))) && ie("invalid node colors."), (!Array.isArray(e.sheets) || e.sheets.length > 1e3) && ie("invalid saved sheets.");
  const n = /* @__PURE__ */ new Set();
  for (const i of e.sheets) {
    (!ke(i) || typeof i.scope != "string" || typeof i.topology != "string") && ie("invalid sheet identity."), Ft(i.settings);
    const o = Ke(i.scope, i.topology, i.settings);
    n.has(o) && ie("duplicate sheet."), n.add(o), (i.settings.gridSize !== 4 || !i.settings.conventional) && ie("saved manual scenes require the fixed 4-unit grid."), i.view !== void 0 && !Qt(i.view) && ie("invalid sheet viewport."), i.templateSource !== void 0 && (typeof i.templateSource != "string" || !i.templateSource || i.templateSource === i.scope || i.templateSource.length > 1e4) && ie("invalid layout template source."), cn(i.snapshot);
  }
  return e;
}
function vo(t) {
  const e = { ...t, format: rn, version: sn, layoutRulesVersion: Ze, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, n = JSON.stringify(e, null, 2);
  return ln(n), n;
}
function cn(t) {
  (!ke(t) || !Array.isArray(t.components) || !Array.isArray(t.segments) || t.components.length > 1e4 || t.segments.length > 5e4) && ie("invalid scene size."), tn(t.labelOverrides), en(t.manualGroups, t.components);
  const e = /* @__PURE__ */ new Set();
  for (const n of t.components) {
    (!ke(n) || typeof n.id != "string" || e.has(n.id) || !$e(n) || !Ue(n.width) || !Ue(n.height) || n.width < 0 || n.height < 0 || !Array.isArray(n.ports) || n.ports.length > 2e3) && ie("invalid component geometry."), e.add(n.id);
    const i = /* @__PURE__ */ new Set();
    for (const o of n.ports)
      (!$e(o) || typeof o.pin != "string" || i.has(o.pin) || !Number.isInteger(o.bit) || !["NORTH", "SOUTH", "EAST", "WEST"].includes(o.side)) && ie("invalid pin."), i.add(o.pin);
    n.editorMatrix !== void 0 && (!Array.isArray(n.editorMatrix) || n.editorMatrix.length !== 6 || !n.editorMatrix.every(Ue)) && ie("invalid symbol transform.");
  }
  for (const n of t.segments) (!ke(n) || !Number.isInteger(n.bit) || !$e(n.a) || !$e(n.b) || !Me(n.a.x, n.b.x) && !Me(n.a.y, n.b.y)) && ie("wire must be orthogonal.");
}
function dt(t, e, n) {
  cn(e);
  const i = new Map(t.components.map((l) => [l.id, l]));
  i.size !== e.components.length && ie("component count changed.");
  const o = e.components.map((l) => {
    const a = i.get(l.id);
    (!a || !!a.decoration != !!l.decoration || a.ports.length !== l.ports.length) && ie("component identity changed: " + l.id);
    const c = l.editorMatrix || [1, 0, 0, 1, 0, 0], [x, g, d, m] = c;
    (![x, g, d, m].every((b) => [-1, 0, 1].includes(b)) || x * x + g * g !== 1 || d * d + m * m !== 1 || x * d + g * m !== 0) && ie("symbol transform must be a rotation or mirror.");
    const h = [[0, 0], [a.width, 0], [0, a.height], [a.width, a.height]].map(([b, y]) => ({ x: x * b + d * y + c[4], y: g * b + m * y + c[5] }));
    (!Me(Math.min(...h.map((b) => b.x)), 0) || !Me(Math.min(...h.map((b) => b.y)), 0) || !Me(Math.max(...h.map((b) => b.x)), l.width) || !Me(Math.max(...h.map((b) => b.y)), l.height)) && ie("symbol dimensions changed: " + l.id);
    const _ = l.ports.map((b) => {
      const y = a.ports.find((A) => A.pin === b.pin);
      (!y || y.bit !== b.bit || !Me(b.x, l.x + x * (y.x - a.x) + d * (y.y - a.y) + c[4]) || !Me(b.y, l.y + g * (y.x - a.x) + m * (y.y - a.y) + c[5])) && ie("pin connectivity or position changed: " + l.id + "." + b.pin);
      const k = { NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }[y.side], I = Object.entries({ NORTH: [0, -1], SOUTH: [0, 1], EAST: [1, 0], WEST: [-1, 0] }).find(([, A]) => A[0] === x * k[0] + d * k[1] && A[1] === g * k[0] + m * k[1])?.[0];
      return b.side !== I && ie("pin direction changed."), { ...y, x: b.x, y: b.y, side: I };
    });
    return { ...a, x: l.x, y: l.y, width: l.width, height: l.height, ports: _, ...l.editorMatrix ? { editorMatrix: [...c] } : {} };
  }), s = new on({ ...t, components: o, segments: e.segments }, { step: n });
  Xe(o, e.manualGroups) && ie("manual group boxes overlap other components or groups.");
  for (let l = 0; l < o.length; l++) for (let a = l + 1; a < o.length; a++) {
    const c = o[l], x = o[a];
    c.x < x.x + x.width - 1e-3 && c.x + c.width > x.x + 1e-3 && c.y < x.y + x.height - 1e-3 && c.y + c.height > x.y + 1e-3 && ie("component symbols overlap.");
  }
  const p = new Set(s.pins().map((l) => l.bit));
  (s.pins().some((l) => !s.onGrid(l)) || s.segments.some((l) => !p.has(l.bit) || !s.validSegment(l, l.bit))) && ie("off-grid wire, symbol collision or short circuit.");
  const r = /* @__PURE__ */ new Map();
  for (const l of s.pins()) {
    const a = l.x + "," + l.y;
    r.has(a) && r.get(a) !== l.bit && ie("different nodes share a pin position."), r.set(a, l.bit);
  }
  return { ...s.snapshot(), ...e.labelOverrides?.length ? { labelOverrides: structuredClone(e.labelOverrides) } : {}, ...e.manualGroups?.length ? { manualGroups: structuredClone(e.manualGroups) } : {} };
}
const Eo = "http://www.w3.org/2000/svg", ce = (t, e = {}) => {
  const n = document.createElementNS(Eo, t);
  for (const [i, o] of Object.entries(e)) n.setAttribute(i, o);
  return n;
}, No = (t, e) => Math.abs(t.x - e.x) < 1e-3 && Math.abs(t.y - e.y) < 1e-3;
function _t(t, e, n, i) {
  const o = structuredClone(e);
  for (const r of o.components) {
    const l = t.getElementById("cell_" + r.id);
    for (const a of r.ports) {
      const c = [...l.children].find((x) => x.getAttribute("s:pid") === a.pin);
      a.side = { top: "NORTH", bottom: "SOUTH", left: "WEST", right: "EAST" }[c?.getAttribute("s:position")] || a.side;
    }
  }
  for (const [r, l] of Object.entries(i.modules.circuit.cells)) if (l.attributes.name === "0") {
    const a = t.getElementById("cell_" + r), c = a?.transform.baseVal.consolidate().matrix;
    a && c && o.components.push({ id: r, decoration: !0, selectable: !0, x: c.e, y: c.f, width: +a.getAttribute("s:width"), height: +a.getAttribute("s:height"), ports: [...a.children].filter((x) => x.hasAttribute("s:pid")).map((x) => ({ pin: x.getAttribute("s:pid"), x: c.e + Number(x.getAttribute("s:x")), y: c.f + Number(x.getAttribute("s:y")), bit: l.connections[x.getAttribute("s:pid")][0], side: "NORTH" })) });
  }
  const s = new Map(Object.values(n.nodes).map((r) => [r.name, r.bit])), p = [...t.children].filter((r) => r.localName === "line" && r.hasAttribute("data-net")).map((r) => ({ bit: s.get(r.dataset.net), a: { x: +r.getAttribute("x1"), y: +r.getAttribute("y1") }, b: { x: +r.getAttribute("x2"), y: +r.getAttribute("y2") } }));
  return { ...o, segments: p };
}
function So(t, e, { changed: n, inspect: i, getNetColor: o, report: s, applyLayoutTemplate: p }) {
  let r = null, l = null, a = !1, c = !1, x = null, g = null, d = null, m = null, h = /* @__PURE__ */ new Set(), _ = 0, b = "", y = 8, k = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), C = !1, M = null, B = null, N = null, w = null, G = "";
  const $ = yo();
  let X = "", Y = /* @__PURE__ */ new Map(), ne = /* @__PURE__ */ new Map();
  const L = (E) => new DOMPoint(E.clientX, E.clientY).matrixTransform(l.getScreenCTM().inverse()), V = (E) => r.snap(L(E)), K = (E) => o?.(E) || ct[Number(E) % ct.length], z = (E, { severity: O = "info", log: T = !0 } = {}) => {
    e("editor-status").textContent = E, T && s?.({ message: E, severity: O, category: "Tools" });
  };
  function re() {
    return { unrouted: r?.airwires().length || 0, wires: r?.segments.length || 0, editing: a, routing: c, selectedComponents: C ? [] : [...h], selectedLabels: C ? [...h] : [], labelEditing: C };
  }
  function ae(E) {
    if (!E.length) return !1;
    if (!C) return !0;
    const O = E.at(-1);
    return JSON.stringify(O.components) === JSON.stringify(r.components) && JSON.stringify(O.segments) === JSON.stringify(r.segments) && JSON.stringify(O.manualGroups || []) === JSON.stringify(r.manualGroups || []);
  }
  function J() {
    const E = !!r, O = c || !!X, T = r && !C && nt(h, r.manualGroups), R = e("layout-brush"), P = h.size === 1 && Y.has([...h][0]);
    R.disabled = !a || !E || c || C || !X && (!P || e("edit-tool").value !== "select"), R.setAttribute("aria-pressed", String(!!X)), R.title = X ? "Exit layout format brush (Escape)" : "Copy the selected subcircuit's internal layout", e("group").disabled = !a || !E || O || C || h.size < 2, e("group").setAttribute("aria-pressed", String(!!T)), e("group").title = T ? "Ungroup selected components (Ctrl+G or Ctrl+Shift+G)" : "Group selected components (Ctrl+G)", e("group").setAttribute("aria-label", e("group").title);
    for (const Q of ["interactive", "flywire", "auto-route"]) e(Q).disabled = !l || (Q === "interactive" ? c : O) || C && Q !== "interactive";
    e("label-edit").disabled = !l || O, e("label-edit").setAttribute("aria-pressed", String(a && C)), e("edit-tool").disabled = !E || O;
    for (const Q of document.querySelectorAll("[data-editor-mode]"))
      Q.disabled = !l || O || C && ["route", "erase"].includes(Q.dataset.editorMode), Q.setAttribute("aria-pressed", String(a && Q.dataset.editorMode === e("edit-tool").value));
    const U = C ? h.size : r ? De(r.components, r.manualGroups).filter((Q) => Q.members.some((ee) => h.has(ee))).length : 0;
    for (const Q of document.querySelectorAll("[data-editor-arrange]")) Q.disabled = !a || !E || O || U < (Q.dataset.editorArrange.startsWith("space-") ? 3 : 2);
    e("wire-undo").disabled = !E || O || !ae(r.undoStack), e("wire-redo").disabled = !E || O || !ae(r.redoStack), t.classList.toggle("spice-editing", a), t.dataset.toolMode = X ? "layout-brush" : a ? e("edit-tool").value : "none", t.dataset.labelEditing = String(a && C);
  }
  function be(E) {
    const O = JSON.stringify(JSON.parse(b)[2]);
    return [...ne].find(([T]) => {
      const R = JSON.parse(T);
      return R[0] === E && JSON.stringify(R[2]) === O;
    })?.[1];
  }
  function Be() {
    for (const T of l.querySelectorAll("[data-brush-dimmed]"))
      T.style.removeProperty("opacity"), T.removeAttribute("data-brush-dimmed");
    const E = ce("g", { "data-editor-overlay": "true", "data-layout-brush-layer": "true", "pointer-events": "none" });
    if (X) {
      for (const T of [...l.children]) T.hasAttribute("data-net") && (T.style.opacity = ".18", T.setAttribute("data-brush-dimmed", "true"));
      for (const T of r.components) {
        if (!Y.has(T.id)) {
          const P = l.getElementById("cell_" + T.id);
          P.style.opacity = ".18", P.setAttribute("data-brush-dimmed", "true");
          continue;
        }
        const R = T.id === X;
        E.append(ce("rect", { x: T.x - 4, y: T.y - 4, width: T.width + 8, height: T.height + 8, fill: "none", stroke: R ? "#507d9c" : "#65a583", "stroke-width": 2, "vector-effect": "non-scaling-stroke", "data-brush-block": T.id }));
      }
    }
    const O = new DOMParser().parseFromString(po, "image/svg+xml").documentElement;
    for (const T of r.components) {
      const R = Y.has(T.id) && be(Y.get(T.id));
      if (!R) continue;
      const P = ce("g", { "data-layout-template-applied": T.id, transform: "translate(" + (T.x + T.width - 12) + "," + (T.y - 12) + ") scale(.75)", stroke: "#367757", "stroke-width": 2, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }), U = ce("title");
      U.textContent = "Layout copied from " + R, P.append(U, ce("circle", { cx: 12, cy: 12, r: 12, fill: "white", stroke: "none" }), ...[...O.children].map((Q) => Q.cloneNode(!0))), E.append(P);
    }
    Ie(E);
  }
  function Ee() {
    if (!r || c || C) return;
    if (X) {
      X = "", f(), z("Layout format brush cancelled.");
      return;
    }
    const E = h.size === 1 && [...h][0];
    !a || e("edit-tool").value !== "select" || !Y.has(E) || (X = E, x = null, g = null, d = null, f(), z("Choose a target subcircuit block. Escape exits the layout format brush."));
  }
  async function ye(E) {
    if (c || E === X) return;
    const O = X, T = _;
    c = !0, J(), z("Checking subcircuit structures…");
    try {
      if (await p(Y.get(O), Y.get(E), () => T === _ && X === O), T !== _) return;
      c = !1, f(), z("Layout applied from " + O + " to " + E + ".");
    } catch (R) {
      if (T !== _) return;
      c = !1, f(), z(R.message, { severity: "error" });
    }
  }
  function Ce(E, O) {
    const T = A.get(E.id);
    if (T && (O.replaceChildren(...T.children.map((R) => R.cloneNode(!0))), E.editorMatrix)) {
      const R = E.editorMatrix, P = ce("g", { transform: "matrix(" + R.join(" ") + ")", "data-editor-glyph": "true" });
      P.append(...O.childNodes);
      for (const U of P.querySelectorAll("text")) U.remove();
      O.append(P);
      for (const [U, Q] of T.labels.entries()) {
        const ee = Q.node.cloneNode(!0);
        ee.removeAttribute("transform");
        let oe = R[0] * Q.x + R[2] * Q.y + R[4], Z = R[1] * Q.x + R[3] * Q.y + R[5];
        if (E.ports.length === 2 && T.labels.length === 2) {
          const pe = Math.abs(E.ports[0].y - E.ports[1].y) < 1e-3;
          oe = pe ? E.width / 2 : E.ports[0].x - E.x + 20, Z = pe ? E.ports[0].y - E.y - 26 + U * 16 : E.height / 2 - 8 + U * 16, ee.setAttribute("text-anchor", pe ? "middle" : "start");
        }
        ee.setAttribute("x", oe), ee.setAttribute("y", Z), O.append(ee);
      }
    }
  }
  function Ne(E) {
    if (X = "", N = null, x = null, d = null, g = null, M = null, B = null, C && ["route", "erase"].includes(E)) {
      z("Components and wires are locked in label mode.", { severity: "warning" });
      return;
    }
    if (C && ["rotate", "mirror-x", "mirror-y"].includes(E) && h.size) {
      v([...h].map((O) => go($.record(O), E))), z(E + " applied to " + h.size + " label(s).");
      return;
    }
    if (!C && ["rotate", "mirror-x", "mirror-y"].includes(E) && nt(h, r.manualGroups)) {
      try {
        r.transformGroup(nt(h, r.manualGroups).id, E), f(), z("Manual group " + E + " applied.");
      } catch (O) {
        z(O.message, { severity: "error" });
      }
      return;
    }
    if (["rotate", "mirror-x", "mirror-y"].includes(E) && h.size === 1) {
      try {
        r.transform([...h][0], E), f(), z(E + " applied to " + [...h][0] + ".");
      } catch (O) {
        z(O.message, { severity: "error" });
      }
      return;
    }
    e("edit-tool").value = E, r ? (f(), z("Tool: " + E + ".")) : J();
  }
  function Ae() {
    if (!r) return;
    const E = re();
    z(`${h.size ? h.size + " selected · " : ""}${E.unrouted} connection${E.unrouted === 1 ? "" : "s"} unrouted · ${E.wires} wire segments${c ? " · Auto-routing…" : ""}`, { log: !1 }), J(), n(r.drawing(), E, r.bounds());
    const O = r.snapshot();
    if (I.has(b) && JSON.stringify(I.get(b)) !== JSON.stringify(O)) {
      const [T, , R] = JSON.parse(b);
      for (const P of ne.keys()) {
        const [U, , Q] = JSON.parse(P);
        (T === U || T.startsWith(U + "/")) && JSON.stringify(R) === JSON.stringify(Q) && ne.delete(P);
      }
    }
    I.set(b, O);
  }
  function Ie(E) {
    const O = l.querySelector("[data-airwires]");
    O ? l.insertBefore(E, O) : l.append(E);
  }
  function ue() {
    if (l?.querySelector("[data-route-preview]")?.remove(), l?.querySelector("[data-route-guides]")?.remove(), !l) return;
    if (a && e("edit-tool").value === "route" && m) {
      const T = t.getBoundingClientRect(), R = l.getScreenCTM().inverse(), P = new DOMPoint(T.left, T.top).matrixTransform(R), U = new DOMPoint(T.right, T.bottom).matrixTransform(R), Q = ce("g", { "data-route-guides": "true", "data-editor-overlay": "true", "pointer-events": "none", stroke: "#507d9c", "stroke-opacity": 0.65, "stroke-width": 0.8, "stroke-dasharray": "5 4" });
      Q.append(ce("line", { x1: P.x, y1: m.y, x2: U.x, y2: m.y, "vector-effect": "non-scaling-stroke" }), ce("line", { x1: m.x, y1: P.y, x2: m.x, y2: U.y, "vector-effect": "non-scaling-stroke" })), Ie(Q);
    }
    if (!x) return;
    const E = [...x.points];
    if (m) {
      const T = E.at(-1);
      E.push({ x: m.x, y: T.y }, m);
    }
    const O = ce("g", { "data-route-preview": "true", "data-waypoints": x.checkpoints.length, "data-editor-overlay": "true", "pointer-events": "none" });
    O.append(ce("polyline", { points: E.map((T) => T.x + "," + T.y).join(" "), fill: "none", stroke: K(x.bit), "stroke-width": 1.6, "stroke-dasharray": "4 3", "vector-effect": "non-scaling-stroke" })), Ie(O);
  }
  function Te() {
    if (l?.querySelector("[data-selection-box]")?.remove(), !d || !l) return;
    const E = d.start, O = d.end, T = O.x < E.x;
    Ie(ce("rect", { x: Math.min(E.x, O.x), y: Math.min(E.y, O.y), width: Math.abs(E.x - O.x), height: Math.abs(E.y - O.y), fill: T ? "#4c9675" : "#507d9c", "fill-opacity": 0.12, stroke: T ? "#4c9675" : "#507d9c", "stroke-dasharray": T ? "5 3" : "none", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "data-selection-box": T ? "crossing" : "window", "data-editor-overlay": "true", "pointer-events": "none" }));
  }
  function f() {
    if (!l || !r) return;
    for (const U of l.querySelectorAll("[data-editor-body-hit]")) U.remove();
    for (const U of [...l.children]) (U.hasAttribute("data-editor-overlay") || U.hasAttribute("data-airwires") || U.hasAttribute("data-manual-state") || U.hasAttribute("data-net") && ["line", "circle", "path", "polyline"].includes(U.localName)) && U.remove();
    for (const U of r.components) {
      const Q = l.getElementById("cell_" + U.id);
      Q && (Q.style.removeProperty("opacity"), Ce(U, Q), Q.setAttribute("s:width", U.width), Q.setAttribute("s:height", U.height), Q.setAttribute("transform", `translate(${U.x},${U.y})`), Q.dataset.editorComponent = U.id, a && !C && Q.prepend(ce("rect", { x: 0, y: 0, width: U.width, height: U.height, fill: "transparent", stroke: "none", "pointer-events": "all", "data-editor-body-hit": "true", "data-editor-overlay": "true" })));
    }
    if (a && !c && !C) {
      const U = ce("g", { "data-editor-overlay": "true", "data-manual-group-layer": "true" });
      for (const Q of De(r.components, r.manualGroups).filter((ee) => ee.groupId)) {
        const ee = Q.members.every((oe) => h.has(oe));
        U.append(ce("rect", { x: Q.x, y: Q.y, width: Q.width, height: Q.height, fill: "transparent", stroke: ee ? "#507d9c" : "#89958c", "stroke-width": ee ? 1.5 : 0.8, "stroke-dasharray": "5 3", "vector-effect": "non-scaling-stroke", "pointer-events": ["route", "erase"].includes(e("edit-tool").value) ? "none" : "all", "data-editor-group": Q.groupId }));
      }
      l.insertBefore(U, l.querySelector('g[id^="cell_"]'));
    }
    const E = l.querySelector('g[id^="cell_"]'), O = ce("g", { "data-editor-overlay": "true", class: "spice-wire-hit-layer" }), T = ce("g", { "data-editor-overlay": "true", class: "spice-pin-layer" });
    for (const [U, Q] of r.segments.entries()) {
      const ee = ce("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, class: "net_" + Q.bit, "data-net": k.get(Q.bit) || String(Q.bit), "stroke-width": 1.4 });
      ee.append(ce("title")), ee.firstChild.textContent = "Node " + (k.get(Q.bit) || Q.bit), l.insertBefore(ee, E), a && !C && ["route", "erase"].includes(e("edit-tool").value) && O.append(ce("line", { x1: Q.a.x, y1: Q.a.y, x2: Q.b.x, y2: Q.b.y, "data-editor-wire": U, stroke: "transparent", "stroke-width": 9, "vector-effect": "non-scaling-stroke", "pointer-events": "stroke" }));
    }
    for (const U of r.connectivity()) for (const Q of U.points) {
      const ee = /* @__PURE__ */ new Set();
      for (const oe of U.segments) _e(Q, oe) && (Math.min(oe.a.x, oe.b.x) < Q.x - 1e-3 && ee.add("w"), Math.max(oe.a.x, oe.b.x) > Q.x + 1e-3 && ee.add("e"), Math.min(oe.a.y, oe.b.y) < Q.y - 1e-3 && ee.add("n"), Math.max(oe.a.y, oe.b.y) > Q.y + 1e-3 && ee.add("s"));
      (ee.size >= 3 || ee.size >= 2 && U.islands.some((oe) => oe.pins.some((Z) => No(Q, Z)))) && l.insertBefore(ce("circle", { cx: Q.x, cy: Q.y, r: 2, class: "net_" + U.bit, "data-net": k.get(U.bit) || String(U.bit), fill: K(U.bit) }), E);
    }
    if (a && !C) {
      for (const U of r.components.filter((Q) => h.has(Q.id))) O.append(ce("rect", { x: U.x - 3, y: U.y - 3, width: U.width + 6, height: U.height + 6, fill: "none", stroke: "#507d9c", "stroke-dasharray": "3 3", "stroke-width": 1, "vector-effect": "non-scaling-stroke", "pointer-events": "none", "data-selected-component": U.id }));
      for (const U of r.pins()) {
        const Q = ce("circle", { cx: U.x, cy: U.y, r: 3, "data-editor-pin": U.id, "data-editor-bit": U.bit, fill: "#fff", stroke: K(U.bit), "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", "pointer-events": e("edit-tool").value === "route" ? "all" : "none", tabindex: e("edit-tool").value === "route" ? 0 : -1, role: "button", "aria-label": U.owner + " " + U.pin }), ee = ce("title");
        ee.textContent = U.id + " · " + (k.get(U.bit) || U.bit), Q.append(ee), T.append(Q);
      }
      l.append(O, T);
    }
    ue();
    const R = ce("g", { "data-airwires": "true", "pointer-events": "none" });
    for (const U of r.airwires()) R.append(ce("line", { x1: U.a.x, y1: U.a.y, x2: U.b.x, y2: U.b.y, stroke: K(U.bit), "stroke-opacity": 0.75, "stroke-width": 0.8, "vector-effect": "non-scaling-stroke", "data-air-net": U.bit, "data-from-owner": U.a.owner || "", "data-to-owner": U.b.owner || "" }));
    l.append(R);
    const P = ce("metadata", { "data-manual-state": "true" });
    P.textContent = JSON.stringify({ version: 1, grid: y, unrouted: r.airwires().length, manual: !0 }), l.insertBefore(P, R), Be(), Ae();
  }
  function u(E, O) {
    if (!x) {
      x = { bit: O, points: [E], checkpoints: [] }, ue(), z("Click waypoints, then a pin or wire of the same node. Backspace removes the last waypoint; Escape cancels.");
      return;
    }
    if (O !== void 0 && x.bit !== O) {
      z("Different nodes cannot be connected. Choose a pin or wire of the same node.", { severity: "warning" });
      return;
    }
    const T = x.points.at(-1), R = r.findPath(x.bit, T, E);
    if (!R) {
      z("No clear grid path. Add a waypoint around the obstacle.", { severity: "warning" });
      return;
    }
    if (O === void 0) {
      R.length > 1 && (x.checkpoints.push(x.points.length), x.points.push(...R.slice(1))), ue(), z("Waypoint " + x.checkpoints.length + " confirmed.");
      return;
    }
    try {
      r.addPath(O, [...x.points, ...R.slice(1)]), x = null, f(), z("Connection added.");
    } catch (P) {
      z(P.message, { severity: "error" });
    }
  }
  function S(E = !1) {
    if (!(!r || c || C))
      try {
        if (E || nt(h, r.manualGroups))
          r.ungroup(h) && z("Manual group removed.");
        else {
          const O = r.group(h);
          h = new Set(O.members), z("Grouped " + O.members.length + " components for manual editing.");
        }
        f();
      } catch (O) {
        z(O.message, { severity: "error" });
      }
  }
  function v(E, O = []) {
    const T = new Map((r.labelOverrides || []).map((R) => [R.id, R]));
    for (const R of O) T.delete(R);
    for (const R of E) T.set(R.id, R);
    if (JSON.stringify([...T.values()]) === JSON.stringify(r.labelOverrides || [])) {
      f();
      return;
    }
    r.remember(), r.labelOverrides = structuredClone([...T.values()]), f();
  }
  function j(E) {
    v(E.map((O) => {
      const T = $.record(O.id);
      return { ...T, x: T.x + O.dx, y: T.y + O.dy };
    }));
  }
  function q(E) {
    r && (N = null, C = E, h.clear(), x = null, g = null, d = null, M = null, B = null, e("edit-tool").value = "select", f(), z(E ? "Label editing enabled. Components and wires are locked. Double-click a label or press Enter to edit text." : "Label editing disabled."));
  }
  function W(E) {
    if (!r) return;
    const O = E ? r.redoStack : r.undoStack;
    if (!ae(O)) {
      z(C ? "No label edit to " + (E ? "redo." : "undo.") : "No edit to " + (E ? "redo." : "undo."));
      return;
    }
    x = null, g = null, d = null, M = null, B = null, E ? r.redo() : r.undo(), f(), z(E ? "Redo." : "Undo.");
  }
  function H(E) {
    w = null, G = E, e("label-text").value = $.record(E).text, e("label-dialog").showModal(), e("label-text").focus(), e("label-text").select();
  }
  e("close-label").onclick = () => e("label-dialog").close(), e("label-dialog").addEventListener("close", () => t.focus({ preventScroll: !0 })), e("app").addEventListener("spice:workspacechange", () => {
    e("label-dialog").open && e("label-dialog").close();
  }), e("label-form").onsubmit = (E) => {
    E.preventDefault();
    const O = $.record(G), T = e("label-text").value;
    e("label-dialog").close(), v([{ ...O, text: T }]), z("Display text updated. SPICE source unchanged.");
  }, e("label-reset").onclick = () => {
    const E = G;
    e("label-dialog").close(), v([], [E]), z("Label reset to automatic placement and original text.");
  }, t.addEventListener("pointerdown", (E) => {
    if (!X || !l || E.button !== 0 || E.shiftKey || (E.preventDefault(), E.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), c)) return;
    const O = E.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
    Y.has(O) && ye(O);
  }, { capture: !0 }), t.addEventListener("keydown", (E) => {
    if (X && (E.key === "Enter" || E.key === " ")) {
      E.preventDefault(), E.stopImmediatePropagation();
      const O = E.target.closest("[data-editor-component]")?.getAttribute("data-editor-component");
      Y.has(O) && ye(O);
    }
  }, { capture: !0 }), t.addEventListener("pointerdown", (E) => {
    if (!C || !a || c || !r || E.button !== 0) return;
    if (E.shiftKey) {
      w = null;
      return;
    }
    w = E.pointerId, E.preventDefault(), E.stopImmediatePropagation(), t.focus({ preventScroll: !0 });
    const O = E.target.closest("[data-editor-label]"), T = O?.getAttribute("data-editor-label"), R = e("edit-tool").value, P = T && N?.id === T && E.timeStamp - N.time < 450 && Math.hypot(E.clientX - N.x, E.clientY - N.y) < 5;
    if (N = T ? { id: T, time: E.timeStamp, x: E.clientX, y: E.clientY } : null, P) {
      N = null, M = null, h = /* @__PURE__ */ new Set([T]), f(), H(T);
      return;
    }
    if (R === "box") {
      B = { start: L(E), end: L(E), additive: E.ctrlKey || E.metaKey }, t.setPointerCapture(E.pointerId), d = B, Te(), d = null;
      return;
    }
    if (!T) {
      h.clear(), f();
      return;
    }
    if (E.ctrlKey || E.metaKey) {
      h.has(T) ? h.delete(T) : h.add(T), f();
      return;
    }
    if ((R !== "move" || !h.has(T)) && (h = /* @__PURE__ */ new Set([T])), ["rotate", "mirror-x", "mirror-y"].includes(R)) {
      Ne(R);
      return;
    }
    f(), R === "move" && (M = { start: L(E), dx: 0, dy: 0 }, t.setPointerCapture(E.pointerId));
  }, { capture: !0 }), t.addEventListener("pointermove", (E) => {
    if (!(!C || !a || !r) && (B && (E.stopImmediatePropagation(), B.end = L(E), d = B, Te(), d = null), M)) {
      E.stopImmediatePropagation();
      const O = L(E), T = r.snap({ x: O.x - M.start.x, y: O.y - M.start.y });
      M.dx = T.x, M.dy = T.y, (T.x || T.y) && (N = null), $.preview([...h].map((R) => ({ id: R, dx: T.x, dy: T.y })));
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (E) => {
    if (!(!C || w !== E.pointerId)) {
      if (w = null, E.stopImmediatePropagation(), t.hasPointerCapture(E.pointerId) && t.releasePointerCapture(E.pointerId), B) {
        const O = B;
        B = null;
        const T = Gt($.nodes(), O.start, L(E));
        h = O.additive ? /* @__PURE__ */ new Set([...h, ...T]) : new Set(T), f(), z(h.size + " label(s) selected.");
      }
      if (M) {
        const O = M;
        M = null, O.dx || O.dy ? (j([...h].map((T) => ({ id: T, dx: O.dx, dy: O.dy }))), z("Moved " + h.size + " label(s).")) : f();
      }
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    C && (M = null, B = null, f());
  }), t.addEventListener("dblclick", (E) => {
    if (!C) return;
    E.preventDefault(), E.stopImmediatePropagation();
    const O = L(E), T = E.target.closest("[data-editor-label]")?.getAttribute("data-editor-label") || $.nodes().findLast((R) => O.x >= R.x - 2 && O.x <= R.x + Math.max(8, R.width) + 2 && O.y >= R.y - 2 && O.y <= R.y + Math.max(12, R.height) + 2)?.id;
    T && H(T);
  }, { capture: !0 }), t.addEventListener("pointerdown", (E) => {
    if (C || !a || c || !r || !l || E.button !== 0 || E.shiftKey) return;
    const O = e("edit-tool").value, T = E.target.closest("[data-editor-pin]"), R = E.target.closest("[data-editor-wire]"), P = T && r.pins().find((Z) => Z.id === T.dataset.editorPin), U = E.target.closest("[data-editor-group]"), Q = U ? r.manualGroups?.find((Z) => Z.id === U.getAttribute("data-editor-group")) : r.manualGroups?.length ? De(r.components, r.manualGroups).find((Z) => {
      if (!Z.groupId) return !1;
      const pe = L(E);
      return pe.x >= Z.x && pe.x <= Z.x + Z.width && pe.y >= Z.y && pe.y <= Z.y + Z.height;
    }) : null, ee = E.target.closest("[data-editor-component]") || P && l.getElementById("cell_" + P.owner) || Q && l.getElementById("cell_" + Q.members[0]), oe = ee && r.components.find((Z) => Z.id === ee.dataset.editorComponent && ut(Z));
    if (O === "box") {
      E.preventDefault(), E.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), d = { start: L(E), end: L(E), additive: E.ctrlKey || E.metaKey }, t.setPointerCapture(E.pointerId), Te();
      return;
    }
    if (O === "route" || O === "erase") {
      if (E.preventDefault(), E.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), m = V(E), O === "erase") {
        R && (r.remove(+R.dataset.editorWire), f(), z("Wire segment erased."));
        return;
      }
      if (P) {
        u({ x: P.x, y: P.y }, P.bit);
        return;
      }
      if (R) {
        const Z = r.segments[+R.dataset.editorWire], pe = V(E);
        u(Z.a.x === Z.b.x ? { x: Z.a.x, y: pe.y } : { x: pe.x, y: Z.a.y }, Z.bit);
        return;
      }
      x ? u(V(E)) : ue();
      return;
    }
    if (!oe) {
      h.size && (h.clear(), f());
      return;
    }
    if (E.preventDefault(), E.stopImmediatePropagation(), t.focus({ preventScroll: !0 }), i?.(oe.id, oe), E.ctrlKey || E.metaKey) {
      const Z = Nt([oe.id], r.manualGroups), pe = [...Z].every((me) => h.has(me));
      for (const me of Z) pe ? h.delete(me) : h.add(me);
      f();
      return;
    }
    if ((O !== "move" || !h.has(oe.id)) && (h = Nt([oe.id], r.manualGroups)), ["rotate", "mirror-x", "mirror-y"].includes(O)) {
      Ne(O);
      return;
    }
    if (f(), O === "move") {
      g = { entries: r.components.filter((Z) => h.has(Z.id)).map((Z) => ({ n: Z, element: l.getElementById("cell_" + Z.id) })), start: L(E), dx: 0, dy: 0 };
      for (const Z of g.entries) Z.element.style.opacity = ".6";
      t.setPointerCapture(E.pointerId);
    }
  }, { capture: !0 }), t.addEventListener("pointermove", (E) => {
    if (!(C || !a || !r || !l)) {
      if (m = V(E), d) {
        E.stopImmediatePropagation(), d.end = L(E), Te();
        return;
      }
      if (g) {
        E.stopImmediatePropagation();
        const O = L(E), T = r.snap({ x: O.x - g.start.x, y: O.y - g.start.y });
        g.dx = T.x, g.dy = T.y;
        for (const { n: R, element: P } of g.entries) {
          P.setAttribute("transform", `translate(${R.x + T.x},${R.y + T.y})`);
          const U = l.querySelector('[data-selected-component="' + CSS.escape(R.id) + '"]');
          U && (U.setAttribute("x", R.x + T.x - 3), U.setAttribute("y", R.y + T.y - 3));
        }
        for (const R of r.manualGroups || []) R.members.every((P) => h.has(P)) && l.querySelector("[data-editor-group=" + JSON.stringify(R.id) + "]")?.setAttribute("transform", `translate(${T.x},${T.y})`);
        for (const R of l.querySelectorAll("[data-airwires] line"))
          h.has(R.dataset.fromOwner) && (R.setAttribute("x1", +R.getAttribute("x1") - Number(R.dataset.dx || 0) + T.x), R.setAttribute("y1", +R.getAttribute("y1") - Number(R.dataset.dy || 0) + T.y)), h.has(R.dataset.toOwner) && (R.setAttribute("x2", +R.getAttribute("x2") - Number(R.dataset.dx || 0) + T.x), R.setAttribute("y2", +R.getAttribute("y2") - Number(R.dataset.dy || 0) + T.y)), R.dataset.dx = T.x, R.dataset.dy = T.y;
        return;
      }
      e("edit-tool").value === "route" && ue();
    }
  }, { capture: !0 }), t.addEventListener("pointerup", (E) => {
    if (!d && !g) return;
    if (E.preventDefault(), E.stopImmediatePropagation(), t.hasPointerCapture(E.pointerId) && t.releasePointerCapture(E.pointerId), d) {
      const T = d;
      d = null;
      const R = De(r.components, r.manualGroups), P = Gt(R, T.start, L(E)), U = R.filter((Q) => P.includes(Q.id)).flatMap((Q) => Q.members);
      h = T.additive ? /* @__PURE__ */ new Set([...h, ...U]) : new Set(U), f(), z(h.size + " symbol(s) selected.");
      return;
    }
    const O = g;
    g = null;
    for (const T of O.entries) T.element.style.opacity = "";
    try {
      const T = r.moveMany(O.entries.map(({ n: R }) => ({ id: R.id, dx: O.dx, dy: O.dy })));
      f(), T && z("Moved " + O.entries.length + " symbol(s). Detached connections remain flywires.");
    } catch (T) {
      f(), z(T.message, { severity: "error" });
    }
  }, { capture: !0 }), t.addEventListener("pointercancel", () => {
    (g || d) && (g = null, d = null, f());
  }), t.addEventListener("pointerleave", () => {
    !g && !d && (m = null, ue());
  }), t.addEventListener("wheel", (E) => {
    requestAnimationFrame(() => {
      a && r && l && e("edit-tool").value === "route" && (m = V(E), ue());
    });
  }, { passive: !0 }), document.addEventListener("keydown", (E) => {
    if (e("download-dialog").open || e("label-dialog").open || e("clear-wires-dialog").open || !a || !r || c || E.target.closest('input,textarea,select,[contenteditable="true"]') || !e("app").contains(E.target)) return;
    if (X) {
      E.key === "Escape" && (E.preventDefault(), E.stopImmediatePropagation(), Ee());
      return;
    }
    const O = E.target.closest("[data-editor-pin]"), T = E.key.toLowerCase();
    if ((E.ctrlKey || E.metaKey) && T === "g") {
      E.preventDefault(), E.stopImmediatePropagation(), S(E.shiftKey);
      return;
    }
    if (T === "t" && !E.ctrlKey && !E.metaKey && !E.altKey) {
      E.preventDefault(), E.stopImmediatePropagation(), q(!C);
      return;
    }
    if (C && E.key === "Enter" && h.size === 1) {
      E.preventDefault(), E.stopImmediatePropagation(), H([...h][0]);
      return;
    }
    if (O && e("edit-tool").value === "route" && (E.key === "Enter" || E.key === " ")) {
      E.preventDefault(), E.stopImmediatePropagation();
      const R = r.pins().find((P) => P.id === O.dataset.editorPin);
      u({ x: R.x, y: R.y }, R.bit);
      return;
    }
    if (E.key === "Backspace" && e("edit-tool").value === "route") {
      if (E.preventDefault(), E.stopImmediatePropagation(), x) {
        const R = x.checkpoints.pop();
        R === void 0 ? x = null : x.points.length = R, ue(), z(x ? "Last waypoint removed." : "Route start removed. Choose a pin to begin.");
      }
      return;
    }
    if (E.key === "Escape")
      E.preventDefault(), E.stopImmediatePropagation(), x = null, g = null, d = null, Ne("select");
    else if ((E.ctrlKey || E.metaKey) && T === "z") {
      E.preventDefault(), E.stopImmediatePropagation(), W(E.shiftKey);
      return;
    } else !E.ctrlKey && !E.metaKey && !E.altKey && { s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[T] && (E.preventDefault(), E.stopImmediatePropagation(), Ne({ s: "select", b: "box", v: "move", w: "route", d: "erase", r: "rotate", x: "mirror-x", y: "mirror-y" }[T]));
  }, { capture: !0 });
  function te(E) {
    if (!(!r || c)) {
      x = null, g = null, d = null, e("edit-tool").value = "select";
      try {
        const O = C ? $.nodes() : De(r.components, r.manualGroups), T = C ? h : new Set(O.filter((U) => U.members.some((Q) => h.has(Q))).map((U) => U.id)), { moves: R, rounded: P } = ho(O, T, E, y);
        C ? j(R) : r.moveMany(R.flatMap((U) => O.find((Q) => Q.id === U.id).members.map((Q) => ({ id: Q, dx: U.dx, dy: U.dy })))), f(), z(`${h.size} ${C ? "labels" : "components"} arranged.${P ? " Centers or gaps rounded to the " + y + "-unit pin grid." : ""}${C ? "" : " Detached connections remain flywires."}`);
      } catch (O) {
        f(), z(O.message, { severity: "error" });
      }
    }
  }
  async function de() {
    if (!r || c || C) return;
    const E = _;
    c = !0, Ae(), z("Auto-routing remaining connections…");
    try {
      if (await r.autoRoute(() => E !== _), E === _) {
        x = null, c = !1, f();
        const O = r.airwires().length;
        z(O ? "Auto-routing finished: " + O + " connection(s) remain unrouted." : "Auto-routing complete.", { severity: O ? "warning" : "info" });
      }
    } catch (O) {
      E === _ && (c = !1, f(), z(O.message, { severity: "error" }));
    }
  }
  return {
    mount(E, O, T, R, P, { reset: U = !1, scope: Q = "" } = {}) {
      _++, c = !1, X = "", Y = new Map(T.components.filter((Z) => Z.block).map((Z) => [Z.name, Z.instanceId])), l = E, x = null, g = null, d = null, m = null, h.clear(), A = /* @__PURE__ */ new Map();
      for (const Z of l.querySelectorAll('g[id^="cell_"]')) {
        const pe = Z.getCTM().inverse();
        A.set(Z.id.slice(5), { children: [...Z.childNodes].map((me) => me.cloneNode(!0)), labels: [...Z.querySelectorAll("text")].map((me) => {
          const ge = new DOMPoint(+me.getAttribute("x") || 0, +me.getAttribute("y") || 0).matrixTransform(pe.multiply(me.getCTM()));
          return { node: me.cloneNode(!0), x: ge.x, y: ge.y };
        }) });
      }
      if (y = P.gridSize || 0, k = new Map(Object.values(T.nodes).map((Z) => [Z.bit, Z.name])), !O || !y) {
        r = null, J();
        return;
      }
      const ee = _t(l, O, T, R), oe = ee.segments;
      r = new on(ee, { step: y, segments: oe }), b = Ke(Q, T.topology.signature, P), !U && I.has(b) && (St(l, I.get(b).labelOverrides), r.restore(dt({ ...ee, segments: oe }, I.get(b), y))), a = e("interactive").getAttribute("aria-pressed") === "true", a || !U && I.has(b) ? f() : J();
    },
    invalidate() {
      X = "", Y.clear(), N = null, M = null, B = null, e("label-dialog").open && e("label-dialog").close(), r && !c && I.set(b, r.snapshot()), _++, c = !1, r = null, l = null, x = null, g = null, d = null, m = null, h.clear(), J();
    },
    snapshotSheets() {
      return r && !c && I.set(b, r.snapshot()), [...I].map(([E, O]) => {
        const [T, R, P] = JSON.parse(E);
        return { scope: T, topology: R, settings: P, snapshot: structuredClone(O), ...ne.has(E) ? { templateSource: ne.get(E) } : {} };
      });
    },
    restoreSheets(E) {
      ne = new Map(E.filter((O) => O.templateSource).map((O) => [Ke(O.scope, O.topology, O.settings), O.templateSource])), I = new Map(E.map((O) => [Ke(O.scope, O.topology, O.settings), structuredClone(O.snapshot)]));
    },
    clearSheets() {
      I.clear(), ne.clear();
    },
    saveTemplateSheet(E) {
      const O = Ke(E.scope, E.topology, E.settings);
      I.set(O, structuredClone(E.snapshot)), ne.set(O, E.templateSource);
    },
    setEnabled(E) {
      a = E, E || (X = ""), E || (e("edit-tool").value = "select", C = !1, M = null, B = null, x = null, g = null, d = null, m = null, h.clear()), r ? f() : J();
    },
    clear() {
      r && !C && (r.clear(), x = null, f(), z("Wiring cleared. Connections remain as flywires."));
    },
    autoRoute: de,
    chooseTool: Ne,
    arrange: te,
    toggleGroup: S,
    toggleLayoutBrush: Ee,
    layoutBrushActive: () => !!X,
    setLabelEditing: q,
    labelEditing: () => C,
    resetLabelDisplay: () => $.reset(),
    placeLabels: () => l && r ? $.layout(l, r.components, r.labelOverrides, a && C, h) : null,
    undo: () => W(!1),
    redo: () => W(!0),
    complete() {
      return !r || !c && r.airwires().length === 0;
    },
    working() {
      return c;
    },
    stats: re,
    canEdit() {
      return !!r;
    },
    refreshControls: J,
    refreshColors() {
      if (l) {
        for (const E of l.querySelectorAll("[data-air-net]")) E.setAttribute("stroke", K(+E.dataset.airNet));
        for (const E of l.querySelectorAll("[data-editor-bit]")) E.setAttribute("stroke", K(+E.dataset.editorBit));
      }
    },
    cleanExport(E) {
      for (const O of E.querySelectorAll("[data-brush-dimmed]"))
        O.style.removeProperty("opacity"), O.removeAttribute("data-brush-dimmed");
      for (const O of E.querySelectorAll("[data-label-id]")) O.removeAttribute("data-label-id");
      for (const O of E.querySelectorAll("[data-editor-overlay],[data-route-preview]")) O.remove();
      for (const O of E.querySelectorAll("[data-editor-component]"))
        O.removeAttribute("data-editor-component"), O.style.removeProperty("opacity");
    }
  };
}
function Ht(t, e) {
  const n = /* @__PURE__ */ new Map(), i = (o, s, p) => {
    if (!n.has(o) || !n.has(s)) throw Error("Layout template has an unresolved control/reference.");
    n.get(o).edges.push([s, ">" + p]), n.get(s).edges.push([o, "<" + p]);
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
    let p = 0;
    for (const r of (o.value || "").matchAll(/\b(V|I|Ix)\s*\(([^()]+)\)/gi)) {
      const l = r[1].toLowerCase();
      for (const [a, c] of r[2].split(",").map((x) => x.trim()).entries()) i(s, (l === "v" ? "n:" : "c:") + c, "expression:" + l + ":" + p + ":" + a);
      p++;
    }
  }
  return n;
}
function _o(t, e, n, i) {
  if (t.size !== e.size) return null;
  const o = [...t.values(), ...e.values()];
  let s = new Map(o.map((m) => [m, m.label]));
  for (let m = 0; m < o.length; m++) {
    if (performance.now() > i.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    const h = new Array(o.length);
    for (let k = 0; k < o.length; k++) {
      const I = o[k], A = k < t.size ? t : e;
      h[k] = JSON.stringify([s.get(I), I.edges.map(([C, M]) => [M, s.get(A.get(C))]).sort((C, M) => JSON.stringify(C).localeCompare(JSON.stringify(M)))]);
    }
    const _ = new Map([...new Set(h)].sort().map((k, I) => [k, I])), b = new Map(o.map((k, I) => [k, _.get(h[I])])), y = new Set(s.values()).size;
    if (s = b, _.size === y) break;
  }
  const p = (m) => {
    const h = /* @__PURE__ */ new Map();
    for (const [_, b] of m) {
      const y = s.get(b);
      h.has(y) || h.set(y, []), h.get(y).push(_);
    }
    return h;
  }, r = p(t), l = p(e);
  if ([...r].some(([m, h]) => h.length !== l.get(m)?.length)) return null;
  const a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set(), x = (m, h, _) => m.get(h).edges.filter(([b]) => b === _).map(([, b]) => b).sort().join("|"), g = (m, h) => {
    if (x(t, m, m) !== x(e, h, h)) return !1;
    for (const [_, b] of a) if (x(t, m, _) !== x(e, h, b)) return !1;
    return n(t.get(m), e.get(h));
  };
  function d() {
    if (--i.states < 0 || performance.now() > i.deadline) throw Error("Structure matching exceeded its search budget; no layout was changed.");
    if (a.size === t.size) return !0;
    let m, h;
    for (const [b, y] of t) {
      if (a.has(b)) continue;
      const k = l.get(s.get(y)).filter((I) => !c.has(I) && g(b, I));
      if (!k.length) return !1;
      if ((!h || k.length < h.length) && (m = b, h = k, k.length === 1))
        break;
    }
    const _ = (b) => b.split("/").at(-1);
    h.sort((b, y) => (_(y) === _(m)) - (_(b) === _(m)) || b.localeCompare(y));
    for (const b of h) {
      if (a.set(m, b), c.add(b), d()) return !0;
      a.delete(m), c.delete(b);
    }
    return !1;
  }
  return d() ? a : null;
}
function Co(t, e, n, { maxStates: i = 5e4, timeout: o = 1500 } = {}) {
  if (!e || !n || e === n || !t.contexts[e] || !t.contexts[n]) throw Error("Choose two different subcircuit blocks.");
  const s = new Set(t.ir.globals.map((m) => st([], m))), p = { states: i, deadline: performance.now() + o }, r = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), a = (m) => (l.has(m) || l.set(m, qe(t, { focus: m })), l.get(m)), c = (m, h) => {
    const _ = JSON.stringify([m, h]);
    if (r.has(_)) return r.get(_);
    const b = a(m), y = a(h), k = Ht(b, s), I = Ht(y, s), A = _o(k, I, (C, M) => C.kind !== "cell" || !C.component.block || !!c(C.component.instanceId, M.component.instanceId), p);
    return r.set(_, A), A;
  };
  if (!c(e, n)) throw Error("Subcircuit structures differ; no layout was changed.");
  const g = [];
  function d(m, h) {
    const _ = a(m), b = a(h), y = r.get(JSON.stringify([m, h])), k = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map();
    for (const [A, C] of y) A.startsWith("c:") ? k.set(A.slice(2), C.slice(2)) : I.set(_.nodes[A.slice(2)].bit, b.nodes[C.slice(2)].bit);
    g.push({ source: m, target: h, sourceCircuit: _, targetCircuit: b, components: k, bits: I });
    for (const A of _.components.filter((C) => C.block)) d(A.instanceId, b.components.find((C) => C.name === k.get(A.name)).instanceId);
  }
  return d(e, n), { ...g[0], instances: g };
}
function Io(t, e, n, { targetLabels: i = /* @__PURE__ */ new Map(), targetOverrides: o = [] } = {}) {
  const s = new Map(n.components), p = new Map(e.components.map((c) => [c.id, c])), r = new Map(o.map((c) => [c.id, c.text]));
  for (const c of t.components.filter((x) => x.decoration)) {
    const x = n.bits.get(c.ports[0]?.bit), g = e.components.find((d) => d.decoration && d.ports[0]?.bit === x);
    if (!g) throw Error("Template and target ground symbols differ.");
    s.set(c.id, g.id);
  }
  const a = { components: t.components.map((c) => {
    const x = s.get(c.id), g = p.get(x);
    if (!g) throw Error("Template and target symbols differ.");
    const d = [c.editorMatrix || [1, 0, 0, 1, 0, 0], ...[1, -1].flatMap((b) => [1, -1].flatMap((y) => [[b, 0, 0, y, b < 0 ? g.width : 0, y < 0 ? g.height : 0], [0, b, y, 0, y < 0 ? g.height : 0, b < 0 ? g.width : 0]]))], m = { NORTH: [0, -1], SOUTH: [0, 1], WEST: [-1, 0], EAST: [1, 0] }, h = (b, y) => Math.abs(b - y) < 1e-3, _ = d.find((b) => {
      const y = [[0, 0], [g.width, 0], [0, g.height], [g.width, g.height]].map(([k, I]) => [b[0] * k + b[2] * I + b[4], b[1] * k + b[3] * I + b[5]]);
      return !h(Math.min(...y.map((k) => k[0])), 0) || !h(Math.min(...y.map((k) => k[1])), 0) || !h(Math.max(...y.map((k) => k[0])), c.width) || !h(Math.max(...y.map((k) => k[1])), c.height) ? !1 : c.ports.every((k) => {
        const I = g.ports.find((N) => N.pin === k.pin);
        if (!I) return !1;
        const [A, C] = m[I.side], [M, B] = m[k.side];
        return h(c.x + b[0] * (I.x - g.x) + b[2] * (I.y - g.y) + b[4], k.x) && h(c.y + b[1] * (I.x - g.x) + b[3] * (I.y - g.y) + b[5], k.y) && b[0] * A + b[2] * C === M && b[1] * A + b[3] * C === B;
      });
    });
    if (!_) throw Error("Subcircuits are topologically identical, but target symbol geometry cannot fit the template: " + x + ". No layout was changed.");
    return { ...g, x: c.x, y: c.y, width: c.width, height: c.height, ports: c.ports.map((b) => ({ ...b, bit: n.bits.get(b.bit) })), ...!_.every((b, y) => b === [1, 0, 0, 1, 0, 0][y]) || c.editorMatrix ? { editorMatrix: _ } : {} };
  }), segments: t.segments.map((c) => ({ ...c, bit: n.bits.get(c.bit), a: { ...c.a }, b: { ...c.b } })) };
  return t.manualGroups?.length && (a.manualGroups = t.manualGroups.map((c) => ({ ...c, members: c.members.map((x) => s.get(x)) }))), t.labelOverrides?.length && (a.labelOverrides = t.labelOverrides.flatMap((c) => {
    const x = s.get(c.owner);
    if (!x) return [];
    const g = ft(x, c.index), d = r.get(g) ?? i.get(g);
    if (d === void 0) throw Error("Template and target label slots differ.");
    return [{ ...c, id: g, owner: x, text: d, orientation: [...c.orientation] }];
  })), dt(e, a, 4);
}
const Ct = 4, ot = "http://www.w3.org/2000/svg";
function rt(t, e, n = !0, i = null) {
  let o = t.querySelector("defs[data-coordinate-grid]"), s = t.querySelector("rect[data-coordinate-grid]");
  if (!o) {
    o = document.createElementNS(ot, "defs"), o.dataset.coordinateGrid = "true";
    const d = document.createElementNS(ot, "pattern");
    d.id = "spice-coordinate-grid", d.setAttribute("patternUnits", "userSpaceOnUse");
    const m = document.createElementNS(ot, "path");
    m.setAttribute("fill", "none"), m.setAttribute("stroke", "#737b83"), m.setAttribute("stroke-opacity", ".38"), m.setAttribute("stroke-width", ".55"), m.setAttribute("vector-effect", "non-scaling-stroke"), d.append(m), o.append(d), s = document.createElementNS(ot, "rect"), s.dataset.coordinateGrid = "true", s.setAttribute("fill", "url(#spice-coordinate-grid)"), s.setAttribute("stroke", "none"), s.setAttribute("pointer-events", "none"), t.prepend(s), t.prepend(o);
  }
  const p = o.firstElementChild, r = e || 8;
  p.setAttribute("width", r), p.setAttribute("height", r), p.firstElementChild.setAttribute("d", `M${r},0 H0 V${r}`), s.setAttribute("visibility", n && e ? "visible" : "hidden");
  let l = p.querySelector("[data-minor-grid]");
  l || (l = p.firstElementChild.cloneNode(), l.setAttribute("data-minor-grid", "true"), l.setAttribute("stroke-opacity", ".16"), p.append(l));
  const a = [];
  for (let d = Ct; d < r; d += Ct) a.push(`M${d},0 V${r} M0,${d} H${r}`);
  l.setAttribute("d", a.join(" ")), t.dataset.displayGridStep = String(r);
  let c = i;
  const x = t.closest(".spice-preview"), g = t.isConnected && x ? t.getScreenCTM() : null;
  if (g) {
    const d = x.getBoundingClientRect(), m = g.inverse(), h = [[d.left - 1, d.top - 1], [d.right + 1, d.top - 1], [d.right + 1, d.bottom + 1], [d.left - 1, d.bottom + 1]].map(([y, k]) => new DOMPoint(y, k).matrixTransform(m)), _ = Math.min(...h.map((y) => y.x)), b = Math.min(...h.map((y) => y.y));
    c = { x: _, y: b, w: Math.max(...h.map((y) => y.x)) - _, h: Math.max(...h.map((y) => y.y)) - b };
  }
  if (!c) {
    const d = t.getAttribute("viewBox").split(/[ ,]+/).map(Number);
    c = { x: d[0], y: d[1], w: d[2], h: d[3] };
  }
  for (const [d, m] of Object.entries({ x: c.x, y: c.y, width: c.w, height: c.h })) s.setAttribute(d, m);
}
const ko = `<svg
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
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
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
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
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
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
  <path d="M21 3v5h-5" />
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
  <path d="m17 3-5 5-5-5h10" />
  <path d="m17 21-5-5-5 5h10" />
  <path d="M4 12H2" />
  <path d="M10 12H8" />
  <path d="M16 12h-2" />
  <path d="M22 12h-2" />
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
  <path d="m3 7 5 5-5 5V7" />
  <path d="m21 7-5 5 5 5V7" />
  <path d="M12 20v2" />
  <path d="M12 14v2" />
  <path d="M12 8v2" />
  <path d="M12 2v2" />
</svg>
`, Lo = `<svg
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
`, Po = `<svg
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
`, Do = `<svg
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
`, Uo = `<svg
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
  <path d="m15 14 5-5-5-5" />
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
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
  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
  <path d="m14 7 3 3" />
  <path d="M5 6v4" />
  <path d="M19 14v4" />
  <path d="M10 2v2" />
  <path d="M7 8H3" />
  <path d="M21 16h-4" />
  <path d="M11 3H9" />
</svg>
`, mt = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
`, Vo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
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
  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
  <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
  <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
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
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="M9 15h12" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="7 10 12 15 17 10" />
  <line x1="12" x2="12" y1="15" y2="3" />
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
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" x2="12" y1="3" y2="15" />
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
  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
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
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  <rect width="6" height="14" x="6" y="5" rx="2" />
  <rect width="6" height="10" x="16" y="7" rx="2" />
  <path d="M2 2v20" />
</svg>
`, $o = `<svg
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
  <rect width="6" height="14" x="2" y="5" rx="2" />
  <rect width="6" height="10" x="12" y="7" rx="2" />
  <path d="M22 2v20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="6" rx="2" />
  <path d="M2 2h20" />
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
  <rect width="14" height="6" x="5" y="16" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 12h20" />
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
  <rect width="14" height="6" x="5" y="12" rx="2" />
  <rect width="10" height="6" x="7" y="2" rx="2" />
  <path d="M2 22h20" />
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
  <rect width="6" height="14" x="3" y="5" rx="2" />
  <rect width="6" height="10" x="15" y="7" rx="2" />
  <path d="M3 2v20" />
  <path d="M21 2v20" />
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
  <rect width="14" height="6" x="5" y="15" rx="2" />
  <rect width="10" height="6" x="7" y="3" rx="2" />
  <path d="M2 21h20" />
  <path d="M2 3h20" />
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
  <path d="M3 7V5c0-1.1.9-2 2-2h2" />
  <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
  <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
  <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
  <rect width="7" height="5" x="7" y="7" rx="1" />
  <rect width="7" height="5" x="10" y="12" rx="1" />
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
  <path d="m14.622 17.897-10.68-2.913" />
  <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
  <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
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
  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
</svg>
`, sr = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 12v5.5a1 1 0 01-7 0V10"/>
  <path d="M17 21v-2a1 1 0 01-1-1v-2"/>
  <path d="M19 13.343V6.5a3.5 3.5 0 00-6.997-.154"/>
  <path d="M19 19h-2"/>
  <path d="m2 2 20 20"/>
  <path d="M20 14a2 2 0 012 2v.343"/>
  <path d="M3 5h2"/>
  <path d="M8 8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a1 1 0 011-1V3"/>
</svg>
`;
function ar(t) {
  const e = { select: zo, box: qo, move: ko, route: Ao, erase: Oo, rotate: To, "mirror-x": Mo, "mirror-y": Ro }, n = { left: Xo, right: Ko, top: Yo, bottom: Jo, "center-x": $o, "center-y": Zo, "space-x": er, "space-y": tr }, i = { "zoom-in": Lo, "zoom-out": Po, fit: Do, "wire-undo": Uo, "wire-redo": Bo, "auto-route": jo, "pin-editor": mt, "pin-info": mt, "pin-details": mt, fullscreen: Vo, "exit-fullscreen": Go, "reset-windows": Qo, "open-download": Fo, upload: Ho }, o = (s, p) => {
    if (!s) return;
    const r = s.title || s.getAttribute("aria-label") || s.textContent;
    s.setAttribute("aria-label", r), s.title = r, s.innerHTML = p, s.firstElementChild.setAttribute("aria-hidden", "true"), s.firstElementChild.setAttribute("focusable", "false"), s.classList.add("spice-icon-button");
  };
  o(t.querySelector("#spice-copy"), Wo), o(t.querySelector("#spice-label-edit"), nr), o(t.querySelector("#spice-group"), or), o(t.querySelector("#spice-layout-brush"), rr), o(t.querySelector("#spice-interactive"), ir), o(t.querySelector("#spice-flywire"), sr);
  for (const [s, p] of Object.entries(n)) o(t.querySelector(`[data-editor-arrange="${s}"]`), p);
  for (const [s, p] of Object.entries(e)) o(t.querySelector(`[data-editor-mode="${s}"]`), p);
  for (const [s, p] of Object.entries(i)) o(t.querySelector("#spice-" + s), p);
}
function lr(t) {
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
var gt = {};
const cr = {}, dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: cr
}, Symbol.toStringTag, { value: "Module" })), ur = /* @__PURE__ */ lr(dr);
var zt;
function fr() {
  return zt || (zt = 1, (function(t) {
    (function(e) {
      e.parser = function(f, u) {
        return new i(f, u);
      }, e.SAXParser = i, e.SAXStream = x, e.createStream = a, e.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function i(f, u) {
        if (!(this instanceof i))
          return new i(f, u);
        var S = this;
        s(S), S.q = S.c = "", S.bufferCheckPosition = e.MAX_BUFFER_LENGTH, S.encoding = null, S.opt = u || {}, S.opt.lowercase = S.opt.lowercase || S.opt.lowercasetags, S.looseCase = S.opt.lowercase ? "toLowerCase" : "toUpperCase", S.opt.maxEntityCount = S.opt.maxEntityCount || 512, S.opt.maxEntityDepth = S.opt.maxEntityDepth || 4, S.entityCount = S.entityDepth = 0, S.tags = [], S.closed = S.closedRoot = S.sawRoot = !1, S.tag = S.error = null, S.strict = !!f, S.noscript = !!(f || S.opt.noscript), S.state = w.BEGIN, S.strictEntities = S.opt.strictEntities, S.ENTITIES = S.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES), S.attribList = [], S.opt.xmlns && (S.ns = Object.create(_)), S.opt.unquotedAttributeValues === void 0 && (S.opt.unquotedAttributeValues = !f), S.trackPosition = S.opt.position !== !1, S.trackPosition && (S.position = S.line = S.column = 0), $(S, "onready");
      }
      Object.create || (Object.create = function(f) {
        function u() {
        }
        u.prototype = f;
        var S = new u();
        return S;
      }), Object.keys || (Object.keys = function(f) {
        var u = [];
        for (var S in f) f.hasOwnProperty(S) && u.push(S);
        return u;
      });
      function o(f) {
        for (var u = Math.max(e.MAX_BUFFER_LENGTH, 10), S = 0, v = 0, j = n.length; v < j; v++) {
          var q = f[n[v]].length;
          if (q > u)
            switch (n[v]) {
              case "textNode":
                K(f);
                break;
              case "cdata":
                V(f, "oncdata", f.cdata), f.cdata = "";
                break;
              case "script":
                V(f, "onscript", f.script), f.script = "";
                break;
              default:
                re(f, "Max buffer length exceeded: " + n[v]);
            }
          S = Math.max(S, q);
        }
        var W = e.MAX_BUFFER_LENGTH - S;
        f.bufferCheckPosition = W + f.position;
      }
      function s(f) {
        for (var u = 0, S = n.length; u < S; u++)
          f[n[u]] = "";
      }
      function p(f) {
        K(f), f.cdata !== "" && (V(f, "oncdata", f.cdata), f.cdata = ""), f.script !== "" && (V(f, "onscript", f.script), f.script = "");
      }
      i.prototype = {
        end: function() {
          ae(this);
        },
        write: Te,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          p(this);
        }
      };
      var r;
      try {
        r = ur.Stream;
      } catch {
        r = function() {
        };
      }
      r || (r = function() {
      });
      var l = e.EVENTS.filter(function(f) {
        return f !== "error" && f !== "end";
      });
      function a(f, u) {
        return new x(f, u);
      }
      function c(f, u) {
        if (f.length >= 2) {
          if (f[0] === 255 && f[1] === 254)
            return "utf-16le";
          if (f[0] === 254 && f[1] === 255)
            return "utf-16be";
        }
        return f.length >= 3 && f[0] === 239 && f[1] === 187 && f[2] === 191 ? "utf8" : f.length >= 4 ? f[0] === 60 && f[1] === 0 && f[2] === 63 && f[3] === 0 ? "utf-16le" : f[0] === 0 && f[1] === 60 && f[2] === 0 && f[3] === 63 ? "utf-16be" : "utf8" : u ? "utf8" : null;
      }
      function x(f, u) {
        if (!(this instanceof x))
          return new x(f, u);
        r.apply(this), this._parser = new i(f, u), this.writable = !0, this.readable = !0;
        var S = this;
        this._parser.onend = function() {
          S.emit("end");
        }, this._parser.onerror = function(v) {
          S.emit("error", v), S._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, l.forEach(function(v) {
          Object.defineProperty(S, "on" + v, {
            get: function() {
              return S._parser["on" + v];
            },
            set: function(j) {
              if (!j)
                return S.removeAllListeners(v), S._parser["on" + v] = j, j;
              S.on(v, j);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      x.prototype = Object.create(r.prototype, {
        constructor: {
          value: x
        }
      }), x.prototype._decodeBuffer = function(f, u) {
        if (this._decoderBuffer && (f = Buffer.concat([this._decoderBuffer, f]), this._decoderBuffer = null), !this._decoder) {
          var S = c(f, u);
          if (!S)
            return this._decoderBuffer = f, "";
          this._parser.encoding = S, this._decoder = new TextDecoder(S);
        }
        return this._decoder.decode(f, { stream: !u });
      }, x.prototype.write = function(f) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(f))
          f = this._decodeBuffer(f, !1);
        else if (this._decoderBuffer) {
          var u = this._decodeBuffer(Buffer.alloc(0), !0);
          u && (this._parser.write(u), this.emit("data", u));
        }
        return this._parser.write(f.toString()), this.emit("data", f), !0;
      }, x.prototype.end = function(f) {
        if (f && f.length && this.write(f), this._decoderBuffer) {
          var u = this._decodeBuffer(Buffer.alloc(0), !0);
          u && (this._parser.write(u), this.emit("data", u));
        } else if (this._decoder) {
          var S = this._decoder.decode();
          S && (this._parser.write(S), this.emit("data", S));
        }
        return this._parser.end(), !0;
      }, x.prototype.on = function(f, u) {
        var S = this;
        return !S._parser["on" + f] && l.indexOf(f) !== -1 && (S._parser["on" + f] = function() {
          var v = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          v.splice(0, 0, f), S.emit.apply(S, v);
        }), r.prototype.on.call(S, f, u);
      };
      var g = /^\[CDATA\[$/i, d = /^DOCTYPE$/i, m = "http://www.w3.org/XML/1998/namespace", h = "http://www.w3.org/2000/xmlns/", _ = { xml: m, xmlns: h }, b = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, k = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, I = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function A(f) {
        return f === " " || f === `
` || f === "\r" || f === "	";
      }
      function C(f) {
        return f === '"' || f === "'";
      }
      function M(f) {
        return f === ">" || A(f);
      }
      function B(f, u) {
        return f.test(u);
      }
      function N(f, u) {
        return !B(f, u);
      }
      var w = 0;
      e.STATE = {
        BEGIN: w++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: w++,
        // leading whitespace
        TEXT: w++,
        // general stuff
        TEXT_ENTITY: w++,
        // &amp and such.
        OPEN_WAKA: w++,
        // <
        SGML_DECL: w++,
        // <!BLARG
        SGML_DECL_QUOTED: w++,
        // <!BLARG foo "bar
        DOCTYPE: w++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: w++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: w++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: w++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: w++,
        // <!-
        COMMENT: w++,
        // <!--
        COMMENT_ENDING: w++,
        // <!-- blah -
        COMMENT_ENDED: w++,
        // <!-- blah --
        CDATA: w++,
        // <![CDATA[ something
        CDATA_ENDING: w++,
        // ]
        CDATA_ENDING_2: w++,
        // ]]
        PROC_INST: w++,
        // <?hi
        PROC_INST_BODY: w++,
        // <?hi there
        PROC_INST_ENDING: w++,
        // <?hi "there" ?
        OPEN_TAG: w++,
        // <strong
        OPEN_TAG_SLASH: w++,
        // <strong /
        ATTRIB: w++,
        // <a
        ATTRIB_NAME: w++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: w++,
        // <a foo _
        ATTRIB_VALUE: w++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: w++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: w++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: w++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: w++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: w++,
        // <foo bar=&quot
        CLOSE_TAG: w++,
        // </a
        CLOSE_TAG_SAW_WHITE: w++,
        // </a   >
        SCRIPT: w++,
        // <script> ...
        SCRIPT_ENDING: w++
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
      }), Object.keys(e.ENTITIES).forEach(function(f) {
        var u = e.ENTITIES[f], S = typeof u == "number" ? String.fromCharCode(u) : u;
        e.ENTITIES[f] = S;
      });
      for (var G in e.STATE)
        e.STATE[e.STATE[G]] = G;
      w = e.STATE;
      function $(f, u, S) {
        f[u] && f[u](S);
      }
      function X(f) {
        var u = f && f.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return u ? u[2] : null;
      }
      function Y(f) {
        return f ? f.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function ne(f, u) {
        const S = Y(f), v = Y(u);
        return !S || !v ? !0 : v === "utf16" ? S === "utf16le" || S === "utf16be" : S === v;
      }
      function L(f, u) {
        if (!(!f.strict || !f.encoding || !u || u.name !== "xml")) {
          var S = X(u.body);
          S && !ne(f.encoding, S) && J(
            f,
            "XML declaration encoding " + S + " does not match detected stream encoding " + f.encoding.toUpperCase()
          );
        }
      }
      function V(f, u, S) {
        f.textNode && K(f), $(f, u, S);
      }
      function K(f) {
        f.textNode = z(f.opt, f.textNode), f.textNode && $(f, "ontext", f.textNode), f.textNode = "";
      }
      function z(f, u) {
        return f.trim && (u = u.trim()), f.normalize && (u = u.replace(/\s+/g, " ")), u;
      }
      function re(f, u) {
        return K(f), f.trackPosition && (u += `
Line: ` + f.line + `
Column: ` + f.column + `
Char: ` + f.c), u = new Error(u), f.error = u, $(f, "onerror", u), f;
      }
      function ae(f) {
        return f.sawRoot && !f.closedRoot && J(f, "Unclosed root tag"), f.state !== w.BEGIN && f.state !== w.BEGIN_WHITESPACE && f.state !== w.TEXT && re(f, "Unexpected end"), K(f), f.c = "", f.closed = !0, $(f, "onend"), i.call(f, f.strict, f.opt), f;
      }
      function J(f, u) {
        if (typeof f != "object" || !(f instanceof i))
          throw new Error("bad call to strictFail");
        f.strict && re(f, u);
      }
      function be(f) {
        f.strict || (f.tagName = f.tagName[f.looseCase]());
        var u = f.tags[f.tags.length - 1] || f, S = f.tag = { name: f.tagName, attributes: {} };
        f.opt.xmlns && (S.ns = u.ns), f.attribList.length = 0, V(f, "onopentagstart", S);
      }
      function Be(f, u) {
        var S = f.indexOf(":"), v = S < 0 ? ["", f] : f.split(":"), j = v[0], q = v[1];
        return u && f === "xmlns" && (j = "xmlns", q = ""), { prefix: j, local: q };
      }
      function Ee(f) {
        if (f.strict || (f.attribName = f.attribName[f.looseCase]()), f.attribList.indexOf(f.attribName) !== -1 || f.tag.attributes.hasOwnProperty(f.attribName)) {
          f.attribName = f.attribValue = "";
          return;
        }
        if (f.opt.xmlns) {
          var u = Be(f.attribName, !0), S = u.prefix, v = u.local;
          if (S === "xmlns")
            if (v === "xml" && f.attribValue !== m)
              J(
                f,
                "xml: prefix must be bound to " + m + `
Actual: ` + f.attribValue
              );
            else if (v === "xmlns" && f.attribValue !== h)
              J(
                f,
                "xmlns: prefix must be bound to " + h + `
Actual: ` + f.attribValue
              );
            else {
              var j = f.tag, q = f.tags[f.tags.length - 1] || f;
              j.ns === q.ns && (j.ns = Object.create(q.ns)), j.ns[v] = f.attribValue;
            }
          f.attribList.push([f.attribName, f.attribValue]);
        } else
          f.tag.attributes[f.attribName] = f.attribValue, V(f, "onattribute", {
            name: f.attribName,
            value: f.attribValue
          });
        f.attribName = f.attribValue = "";
      }
      function ye(f, u) {
        if (f.opt.xmlns) {
          var S = f.tag, v = Be(f.tagName);
          S.prefix = v.prefix, S.local = v.local, S.uri = S.ns[v.prefix] || "", S.prefix && !S.uri && (J(
            f,
            "Unbound namespace prefix: " + JSON.stringify(f.tagName)
          ), S.uri = v.prefix);
          var j = f.tags[f.tags.length - 1] || f;
          S.ns && j.ns !== S.ns && Object.keys(S.ns).forEach(function(U) {
            V(f, "onopennamespace", {
              prefix: U,
              uri: S.ns[U]
            });
          });
          for (var q = 0, W = f.attribList.length; q < W; q++) {
            var H = f.attribList[q], te = H[0], de = H[1], E = Be(te, !0), O = E.prefix, T = E.local, R = O === "" ? "" : S.ns[O] || "", P = {
              name: te,
              value: de,
              prefix: O,
              local: T,
              uri: R
            };
            O && O !== "xmlns" && !R && (J(
              f,
              "Unbound namespace prefix: " + JSON.stringify(O)
            ), P.uri = O), f.tag.attributes[te] = P, V(f, "onattribute", P);
          }
          f.attribList.length = 0;
        }
        f.tag.isSelfClosing = !!u, f.sawRoot = !0, f.tags.push(f.tag), V(f, "onopentag", f.tag), u || (!f.noscript && f.tagName.toLowerCase() === "script" ? f.state = w.SCRIPT : f.state = w.TEXT, f.tag = null, f.tagName = ""), f.attribName = f.attribValue = "", f.attribList.length = 0;
      }
      function Ce(f) {
        if (!f.tagName) {
          J(f, "Weird empty close tag."), f.textNode += "</>", f.state = w.TEXT;
          return;
        }
        if (f.script) {
          if (f.tagName !== "script") {
            f.script += "</" + f.tagName + ">", f.tagName = "", f.state = w.SCRIPT;
            return;
          }
          V(f, "onscript", f.script), f.script = "";
        }
        var u = f.tags.length, S = f.tagName;
        f.strict || (S = S[f.looseCase]());
        for (var v = S; u--; ) {
          var j = f.tags[u];
          if (j.name !== v)
            J(f, "Unexpected close tag");
          else
            break;
        }
        if (u < 0) {
          J(f, "Unmatched closing tag: " + f.tagName), f.textNode += "</" + f.tagName + ">", f.state = w.TEXT;
          return;
        }
        f.tagName = S;
        for (var q = f.tags.length; q-- > u; ) {
          var W = f.tag = f.tags.pop();
          f.tagName = f.tag.name, V(f, "onclosetag", f.tagName);
          var H = {};
          for (var te in W.ns)
            H[te] = W.ns[te];
          var de = f.tags[f.tags.length - 1] || f;
          f.opt.xmlns && W.ns !== de.ns && Object.keys(W.ns).forEach(function(E) {
            var O = W.ns[E];
            V(f, "onclosenamespace", { prefix: E, uri: O });
          });
        }
        u === 0 && (f.closedRoot = !0), f.tagName = f.attribValue = f.attribName = "", f.attribList.length = 0, f.state = w.TEXT;
      }
      function Ne(f) {
        var u = f.entity, S = u.toLowerCase(), v, j = "";
        return f.ENTITIES[u] ? f.ENTITIES[u] : f.ENTITIES[S] ? f.ENTITIES[S] : (u = S, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), v = parseInt(u, 16), j = v.toString(16)) : (u = u.slice(1), v = parseInt(u, 10), j = v.toString(10))), u = u.replace(/^0+/, ""), isNaN(v) || j.toLowerCase() !== u || v < 0 || v > 1114111 || !Ae(v) ? (J(f, "Invalid character entity"), "&" + f.entity + ";") : String.fromCodePoint(v));
      }
      function Ae(f) {
        return f === 9 || f === 10 || f === 13 || f >= 32 && f <= 55295 || f >= 57344 && f <= 65533 || f >= 65536 && f <= 1114111;
      }
      function Ie(f, u) {
        u === "<" ? (f.state = w.OPEN_WAKA, f.startTagPosition = f.position) : A(u) || (J(f, "Non-whitespace before first tag."), f.textNode = u, f.state = w.TEXT);
      }
      function ue(f, u) {
        var S = "";
        return u < f.length && (S = f.charAt(u)), S;
      }
      function Te(f) {
        var u = this;
        if (this.error)
          throw this.error;
        if (u.closed)
          return re(
            u,
            "Cannot write after close. Assign an onready handler."
          );
        if (f === null)
          return ae(u);
        typeof f == "object" && (f = f.toString());
        for (var S = 0, v = ""; v = ue(f, S++), u.c = v, !!v; )
          switch (u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
            case w.BEGIN:
              if (u.state = w.BEGIN_WHITESPACE, v === "\uFEFF")
                continue;
              Ie(u, v);
              continue;
            case w.BEGIN_WHITESPACE:
              Ie(u, v);
              continue;
            case w.TEXT:
              if (u.sawRoot && !u.closedRoot) {
                for (var q = S - 1; v && v !== "<" && v !== "&"; )
                  v = ue(f, S++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
                u.textNode += f.substring(q, S - 1);
              }
              v === "<" && !(u.sawRoot && u.closedRoot && !u.strict) ? (u.state = w.OPEN_WAKA, u.startTagPosition = u.position) : (!A(v) && (!u.sawRoot || u.closedRoot) && J(u, "Text data outside of root node."), v === "&" ? u.state = w.TEXT_ENTITY : u.textNode += v);
              continue;
            case w.SCRIPT:
              v === "<" ? u.state = w.SCRIPT_ENDING : u.script += v;
              continue;
            case w.SCRIPT_ENDING:
              v === "/" ? u.state = w.CLOSE_TAG : (u.script += "<" + v, u.state = w.SCRIPT);
              continue;
            case w.OPEN_WAKA:
              if (v === "!")
                u.state = w.SGML_DECL, u.sgmlDecl = "";
              else if (!A(v)) if (B(b, v))
                u.state = w.OPEN_TAG, u.tagName = v;
              else if (v === "/")
                u.state = w.CLOSE_TAG, u.tagName = "";
              else if (v === "?")
                u.state = w.PROC_INST, u.procInstName = u.procInstBody = "";
              else {
                if (J(u, "Unencoded <"), u.startTagPosition + 1 < u.position) {
                  var j = u.position - u.startTagPosition;
                  v = new Array(j).join(" ") + v;
                }
                u.textNode += "<" + v, u.state = w.TEXT;
              }
              continue;
            case w.SGML_DECL:
              if (u.sgmlDecl + v === "--") {
                u.state = w.COMMENT, u.comment = "", u.sgmlDecl = "";
                continue;
              }
              u.doctype && u.doctype !== !0 && u.sgmlDecl ? (u.state = w.DOCTYPE_DTD, u.doctype += "<!" + u.sgmlDecl + v, u.sgmlDecl = "") : g.test(u.sgmlDecl + v) ? (V(u, "onopencdata"), u.state = w.CDATA, u.sgmlDecl = "", u.cdata = "") : d.test(u.sgmlDecl + v) ? (u.state = w.DOCTYPE, (u.doctype || u.sawRoot) && J(
                u,
                "Inappropriately located doctype declaration"
              ), u.doctype = "", u.sgmlDecl = "") : v === ">" ? (V(u, "onsgmldeclaration", u.sgmlDecl), u.sgmlDecl = "", u.state = w.TEXT) : (C(v) && (u.state = w.SGML_DECL_QUOTED), u.sgmlDecl += v);
              continue;
            case w.SGML_DECL_QUOTED:
              v === u.q && (u.state = w.SGML_DECL, u.q = ""), u.sgmlDecl += v;
              continue;
            case w.DOCTYPE:
              v === ">" ? (u.state = w.TEXT, V(u, "ondoctype", u.doctype), u.doctype = !0) : (u.doctype += v, v === "[" ? u.state = w.DOCTYPE_DTD : C(v) && (u.state = w.DOCTYPE_QUOTED, u.q = v));
              continue;
            case w.DOCTYPE_QUOTED:
              u.doctype += v, v === u.q && (u.q = "", u.state = w.DOCTYPE);
              continue;
            case w.DOCTYPE_DTD:
              v === "]" ? (u.doctype += v, u.state = w.DOCTYPE) : v === "<" ? (u.state = w.OPEN_WAKA, u.startTagPosition = u.position) : C(v) ? (u.doctype += v, u.state = w.DOCTYPE_DTD_QUOTED, u.q = v) : u.doctype += v;
              continue;
            case w.DOCTYPE_DTD_QUOTED:
              u.doctype += v, v === u.q && (u.state = w.DOCTYPE_DTD, u.q = "");
              continue;
            case w.COMMENT:
              v === "-" ? u.state = w.COMMENT_ENDING : u.comment += v;
              continue;
            case w.COMMENT_ENDING:
              v === "-" ? (u.state = w.COMMENT_ENDED, u.comment = z(u.opt, u.comment), u.comment && V(u, "oncomment", u.comment), u.comment = "") : (u.comment += "-" + v, u.state = w.COMMENT);
              continue;
            case w.COMMENT_ENDED:
              v !== ">" ? (J(u, "Malformed comment"), u.comment += "--" + v, u.state = w.COMMENT) : u.doctype && u.doctype !== !0 ? u.state = w.DOCTYPE_DTD : u.state = w.TEXT;
              continue;
            case w.CDATA:
              for (var q = S - 1; v && v !== "]"; )
                v = ue(f, S++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
              u.cdata += f.substring(q, S - 1), v === "]" && (u.state = w.CDATA_ENDING);
              continue;
            case w.CDATA_ENDING:
              v === "]" ? u.state = w.CDATA_ENDING_2 : (u.cdata += "]" + v, u.state = w.CDATA);
              continue;
            case w.CDATA_ENDING_2:
              v === ">" ? (u.cdata && V(u, "oncdata", u.cdata), V(u, "onclosecdata"), u.cdata = "", u.state = w.TEXT) : v === "]" ? u.cdata += "]" : (u.cdata += "]]" + v, u.state = w.CDATA);
              continue;
            case w.PROC_INST:
              v === "?" ? u.state = w.PROC_INST_ENDING : A(v) ? u.state = w.PROC_INST_BODY : u.procInstName += v;
              continue;
            case w.PROC_INST_BODY:
              if (!u.procInstBody && A(v))
                continue;
              v === "?" ? u.state = w.PROC_INST_ENDING : u.procInstBody += v;
              continue;
            case w.PROC_INST_ENDING:
              if (v === ">") {
                const de = {
                  name: u.procInstName,
                  body: u.procInstBody
                };
                L(u, de), V(u, "onprocessinginstruction", de), u.procInstName = u.procInstBody = "", u.state = w.TEXT;
              } else
                u.procInstBody += "?" + v, u.state = w.PROC_INST_BODY;
              continue;
            case w.OPEN_TAG:
              B(y, v) ? u.tagName += v : (be(u), v === ">" ? ye(u) : v === "/" ? u.state = w.OPEN_TAG_SLASH : (A(v) || J(u, "Invalid character in tag name"), u.state = w.ATTRIB));
              continue;
            case w.OPEN_TAG_SLASH:
              v === ">" ? (ye(u, !0), Ce(u)) : (J(
                u,
                "Forward-slash in opening tag not followed by >"
              ), u.state = w.ATTRIB);
              continue;
            case w.ATTRIB:
              if (A(v))
                continue;
              v === ">" ? ye(u) : v === "/" ? u.state = w.OPEN_TAG_SLASH : B(b, v) ? (u.attribName = v, u.attribValue = "", u.state = w.ATTRIB_NAME) : J(u, "Invalid attribute name");
              continue;
            case w.ATTRIB_NAME:
              v === "=" ? u.state = w.ATTRIB_VALUE : v === ">" ? (J(u, "Attribute without value"), u.attribValue = u.attribName, Ee(u), ye(u)) : A(v) ? u.state = w.ATTRIB_NAME_SAW_WHITE : B(y, v) ? u.attribName += v : J(u, "Invalid attribute name");
              continue;
            case w.ATTRIB_NAME_SAW_WHITE:
              if (v === "=")
                u.state = w.ATTRIB_VALUE;
              else {
                if (A(v))
                  continue;
                J(u, "Attribute without value"), u.tag.attributes[u.attribName] = "", u.attribValue = "", V(u, "onattribute", {
                  name: u.attribName,
                  value: ""
                }), u.attribName = "", v === ">" ? ye(u) : B(b, v) ? (u.attribName = v, u.state = w.ATTRIB_NAME) : (J(u, "Invalid attribute name"), u.state = w.ATTRIB);
              }
              continue;
            case w.ATTRIB_VALUE:
              if (A(v))
                continue;
              C(v) ? (u.q = v, u.state = w.ATTRIB_VALUE_QUOTED) : (u.opt.unquotedAttributeValues || re(u, "Unquoted attribute value"), u.state = w.ATTRIB_VALUE_UNQUOTED, u.attribValue = v);
              continue;
            case w.ATTRIB_VALUE_QUOTED:
              if (v !== u.q) {
                v === "&" ? u.state = w.ATTRIB_VALUE_ENTITY_Q : u.attribValue += v;
                continue;
              }
              Ee(u), u.q = "", u.state = w.ATTRIB_VALUE_CLOSED;
              continue;
            case w.ATTRIB_VALUE_CLOSED:
              A(v) ? u.state = w.ATTRIB : v === ">" ? ye(u) : v === "/" ? u.state = w.OPEN_TAG_SLASH : B(b, v) ? (J(u, "No whitespace between attributes"), u.attribName = v, u.attribValue = "", u.state = w.ATTRIB_NAME) : J(u, "Invalid attribute name");
              continue;
            case w.ATTRIB_VALUE_UNQUOTED:
              if (!M(v)) {
                v === "&" ? u.state = w.ATTRIB_VALUE_ENTITY_U : u.attribValue += v;
                continue;
              }
              Ee(u), v === ">" ? ye(u) : u.state = w.ATTRIB;
              continue;
            case w.CLOSE_TAG:
              if (u.tagName)
                v === ">" ? Ce(u) : B(y, v) ? u.tagName += v : u.script ? (u.script += "</" + u.tagName + v, u.tagName = "", u.state = w.SCRIPT) : (A(v) || J(u, "Invalid tagname in closing tag"), u.state = w.CLOSE_TAG_SAW_WHITE);
              else {
                if (A(v))
                  continue;
                N(b, v) ? u.script ? (u.script += "</" + v, u.state = w.SCRIPT) : J(u, "Invalid tagname in closing tag.") : u.tagName = v;
              }
              continue;
            case w.CLOSE_TAG_SAW_WHITE:
              if (A(v))
                continue;
              v === ">" ? Ce(u) : J(u, "Invalid characters in closing tag");
              continue;
            case w.TEXT_ENTITY:
            case w.ATTRIB_VALUE_ENTITY_Q:
            case w.ATTRIB_VALUE_ENTITY_U:
              var W, H;
              switch (u.state) {
                case w.TEXT_ENTITY:
                  W = w.TEXT, H = "textNode";
                  break;
                case w.ATTRIB_VALUE_ENTITY_Q:
                  W = w.ATTRIB_VALUE_QUOTED, H = "attribValue";
                  break;
                case w.ATTRIB_VALUE_ENTITY_U:
                  W = w.ATTRIB_VALUE_UNQUOTED, H = "attribValue";
                  break;
              }
              if (v === ";") {
                var te = Ne(u);
                u.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(te) ? ((u.entityCount += 1) > u.opt.maxEntityCount && re(
                  u,
                  "Parsed entity count exceeds max entity count"
                ), (u.entityDepth += 1) > u.opt.maxEntityDepth && re(
                  u,
                  "Parsed entity depth exceeds max entity depth"
                ), u.entity = "", u.state = W, u.write(te), u.entityDepth -= 1) : (u[H] += te, u.entity = "", u.state = W);
              } else B(u.entity.length ? I : k, v) ? u.entity += v : (J(u, "Invalid character in entity name"), u[H] += "&" + u.entity + v, u.entity = "", u.state = W);
              continue;
            default:
              throw new Error(u, "Unknown state: " + u.state);
          }
        return u.position >= u.bufferCheckPosition && o(u), u;
      }
      String.fromCodePoint || (function() {
        var f = String.fromCharCode, u = Math.floor, S = function() {
          var v = 16384, j = [], q, W, H = -1, te = arguments.length;
          if (!te)
            return "";
          for (var de = ""; ++H < te; ) {
            var E = Number(arguments[H]);
            if (!isFinite(E) || // `NaN`, `+Infinity`, or `-Infinity`
            E < 0 || // not a valid Unicode code point
            E > 1114111 || // not a valid Unicode code point
            u(E) !== E)
              throw RangeError("Invalid code point: " + E);
            E <= 65535 ? j.push(E) : (E -= 65536, q = (E >> 10) + 55296, W = E % 1024 + 56320, j.push(q, W)), (H + 1 === te || j.length > v) && (de += f.apply(null, j), j.length = 0);
          }
          return de;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: S,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = S;
      })();
    })(t);
  })(gt)), gt;
}
var bt, qt;
function pr() {
  if (qt) return bt;
  qt = 1;
  var t = fr().parser;
  function e(n) {
    var i = [], o = [], s = i, p;
    return p = t(!0), p.ontext = function(r) {
      r.trim() !== "" && s.push(r);
    }, p.onopentag = function(r) {
      var l;
      l = [r.name, r.attributes], o.push(s), s.push(l), s = l;
    }, p.onclosetag = function() {
      s = o.pop();
    }, p.write(n).close(), i[0];
  }
  return bt = e, bt;
}
var yt, Wt;
function hr() {
  if (Wt) return yt;
  Wt = 1;
  function t(e, n) {
    var i = function() {
    }, o = i, s = i;
    function p() {
      this._skip = !0;
    }
    function r() {
      this._remove = !0;
    }
    function l(x) {
      this._name = x;
    }
    function a(x) {
      this._replace = x;
    }
    function c(x, g) {
      var d, m = { attr: {}, full: x }, h = {
        name: l,
        skip: p,
        // break: breakFn,
        remove: r,
        replace: a,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, _ = !0, b, y, k;
      if (x !== void 0 && x !== null && x !== !0 && x !== !1)
        switch (d = Object.prototype.toString.call(x), d) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (x.some(function(I, A) {
              if (A === 0)
                return m.name = I, !1;
              if (A === 1)
                return Object.prototype.toString.call(I) === "[object Object]" && (_ = !1, m.attr = I), !0;
            }), o.call(h, m, g), h._name && (x[0] = h._name), h._replace)
              return h._replace;
            if (h._remove)
              return null;
            if (!h._skip) {
              for (b = 0, y = x.length; b < y; ) {
                if (b > 1 || b === 1 && _) {
                  if (k = c(x[b], m), k === null) {
                    x.splice(b, 1), y -= 1;
                    continue;
                  }
                  k && (x[b] = k);
                }
                b += 1;
              }
              if (s.call(h, m, g), h._name && (x[0] = h._name), h._replace)
                return h._replace;
              if (h._remove)
                return null;
            }
        }
    }
    n && (n.enter && (o = n.enter), n.leave && (s = n.leave)), c(e, void 0);
  }
  return yt = t, yt;
}
var wt, Xt;
function mr() {
  if (Xt) return wt;
  Xt = 1;
  const t = pr(), e = hr(), n = (o) => String(o).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[s]);
  function i(o) {
    const [s, ...p] = o, r = p[0] && typeof p[0] == "object" && !Array.isArray(p[0]) ? p.shift() : {}, l = "<" + s + Object.entries(r).map(([a, c]) => " " + a + '="' + n(c) + '"').join("");
    return p.length ? l + ">" + p.map((a) => Array.isArray(a) ? i(a) : n(a)).join("") + "</" + s + ">" : l + "/>";
  }
  return wt = { parse: t, p: t, traverse: e, t: e, stringify: i, s: i }, wt;
}
mr();
const xt = (t, e) => Math.max(0, Math.min(t.x + t.w, e.x + e.w) - Math.max(t.x, e.x)) * Math.max(0, Math.min(t.y + t.h, e.y + e.h) - Math.max(t.y, e.y)), gr = (t, e) => [...t].reduce((n, i) => n + (i.charCodeAt(0) > 255 ? 1 : 0.64), 0) * e;
function br(t, e, n = 12) {
  const i = [], o = t.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));
  for (const [p, r] of t.entries()) {
    if (!r.labels.length) continue;
    const l = Math.max(...r.labels.map((m) => gr(m.text, n))) + 4, a = r.labels.length * (n + 4), c = [];
    for (const m of [5, 14, 28, 48]) {
      const h = { x: r.x + (r.w - l) / 2, y: r.y - m - a, w: l, h: a }, _ = { x: r.x + (r.w - l) / 2, y: r.y + r.h + m, w: l, h: a }, b = { x: r.x + r.w + m, y: r.y + (r.h - a) / 2, w: l, h: a }, y = { x: r.x - m - l, y: r.y + (r.h - a) / 2, w: l, h: a };
      c.push(...r.w > r.h ? [h, _, b, y] : [b, y, h, _]);
    }
    const x = (m) => e.reduce((h, _) => {
      const b = Math.min(_.a.x, _.b.x), y = Math.min(_.a.y, _.b.y), k = { x: b - 1, y: y - 1, w: Math.abs(_.a.x - _.b.x) + 2, h: Math.abs(_.a.y - _.b.y) + 2 };
      return h + xt(m, k) * 2;
    }, 0);
    let g = null, d = 1 / 0;
    for (const [m, h] of c.entries()) {
      const _ = o.reduce((b, y, k) => b + (k === p ? 0 : xt(h, y)) * 500, 0) + i.reduce((b, y) => b + xt(h, y) * 100, 0) + x(h) + m * 3;
      _ < d && (d = _, g = h);
    }
    r.labels.forEach((m, h) => {
      m.x = g.x - r.x, m.y = g.y - r.y + n + h * (n + 4);
    }), i.push(g);
  }
  const s = [...o, ...i];
  return { x: Math.min(0, ...s.map((p) => p.x)), y: Math.min(0, ...s.map((p) => p.y)), right: Math.max(0, ...s.map((p) => p.x + p.w)), bottom: Math.max(0, ...s.map((p) => p.y + p.h)) };
}
const yr = (t) => {
  const e = t?.match(/translate\(([^, ]+)[, ]+([^ )]+)\)/);
  return e ? { x: +e[1], y: +e[2] } : { x: 0, y: 0 };
};
function wr(t, e = 12) {
  const n = [...t.children].filter((s) => s.localName === "g" && s.id.startsWith("cell_")).map((s) => ({ ...yr(s.getAttribute("transform")), w: +s.getAttribute("s:width"), h: +s.getAttribute("s:height"), labels: [...s.children].filter((p) => p.localName === "text" && p.hasAttribute("data-layout-label")).map((p) => ({ node: p, text: p.textContent })) })), i = [...t.children].filter((s) => s.localName === "line" && s.hasAttribute("data-net")).map((s) => ({ a: { x: +s.getAttribute("x1"), y: +s.getAttribute("y1") }, b: { x: +s.getAttribute("x2"), y: +s.getAttribute("y2") } })), o = br(n, i, e);
  for (const s of n) for (const p of s.labels)
    p.node.setAttribute("x", p.x), p.node.setAttribute("y", p.y), p.node.setAttribute("text-anchor", "start"), p.node.setAttribute("pointer-events", "none");
  return t.dataset.labelBounds = JSON.stringify(o), o;
}
function xr(t) {
  const e = t("interactive"), n = t("edit-tools-reveal"), i = t("edit-tools-inner"), o = () => e.getAttribute("aria-pressed") === "true", s = () => {
    n.style.width = o() ? i.scrollWidth + "px" : "0px";
  };
  function p(r) {
    e.setAttribute("aria-pressed", String(r)), e.setAttribute("aria-expanded", String(r)), e.title = r ? "Exit editing and hide tools" : "Edit schematic", e.setAttribute("aria-label", e.title), n.inert = !r, n.classList.toggle("is-open", r), s();
  }
  return new ResizeObserver(s).observe(i), p(!1), { enabled: o, set: p };
}
function vr(t) {
  const e = t("diagnostics"), n = t("messages"), i = t("toggle-log");
  let o = 0, s = !0, p = !1;
  function r(m) {
    n.dataset.expanded = String(m), i.setAttribute("aria-expanded", String(m)), e.hidden = !m;
  }
  i.onclick = () => r(i.getAttribute("aria-expanded") !== "true");
  let l = [];
  const a = () => [e.clientWidth, e.clientHeight], c = () => a().some((m, h) => m !== l[h]);
  function x() {
    p || (p = !0, requestAnimationFrame(() => {
      s && (e.scrollTop = e.scrollHeight), l = a(), p = !1;
    }));
  }
  e.setAttribute("role", "log"), e.setAttribute("aria-live", "polite"), e.setAttribute("aria-relevant", "additions"), e.setAttribute("aria-label", "Schematic activity log"), e.tabIndex = 0, e.addEventListener("scroll", () => {
    if (c()) {
      l = a(), s && x();
      return;
    }
    p || (s = e.scrollHeight - e.scrollTop - e.clientHeight < 24);
  }), new ResizeObserver(() => {
    l = a(), s && x();
  }).observe(e);
  function d({ message: m, severity: h = "info", category: _ = "Tools", line: b, source: y }) {
    if (!m) return;
    const k = s, I = /* @__PURE__ */ new Date(), A = document.createElement("li"), C = document.createElement("time"), M = document.createElement("span"), B = document.createElement("strong");
    h = ["error", "warning", "info"].includes(h) ? h : "info", A.className = h, A.dataset.logSequence = String(++o), A.dataset.logCategory = _, A.dataset.logSeverity = h, C.dateTime = I.toISOString(), C.textContent = I.toLocaleTimeString([], { hour12: !1, hour: "2-digit", minute: "2-digit", second: "2-digit" }), C.title = C.dateTime, B.textContent = h.toUpperCase() + " · " + _ + " ", M.append(B, document.createTextNode((y && y !== "input.cir" ? y + " · " : "") + (b ? "line " + b + " · " : "") + m)), A.append(C, M), e.append(A), t("message-count").textContent = o + " entries", h !== "info" && r(!0), k && x();
  }
  return { append: d };
}
const $t = We.filter.source, F = (t) => document.getElementById("spice-" + t), we = F("app"), Oe = xr(F);
if (we) {
  let s = function(S, { severity: v = "info", category: j = "Rendering" } = {}) {
    n.textContent = S, i.append({ message: S, severity: v, category: j });
  }, Y = function() {
    const S = e.querySelector("svg");
    if (!S) return;
    a?.resetLabelDisplay();
    const v = Number(S.querySelector("style")?.textContent.match(/font-size:([\d.]+)px/)?.[1]) || 12, j = wr(S, v), q = a?.placeLabels() || j;
    S.dataset.labelBounds = JSON.stringify(q);
    const W = Math.min(A.x, q.x - 20), H = Math.min(A.y, q.y - 20);
    A = { x: W, y: H, w: Math.max(A.x + A.w, q.right + 20) - W, h: Math.max(A.y + A.h, q.bottom + 20) - H }, c && co(S, x, c), a?.refreshColors(), rt(S, X(), F("show-grid").checked, I);
    const te = S.cloneNode(!0);
    a?.cleanExport(te), te.setAttribute("width", A.w), te.setAttribute("height", A.h), te.setAttribute("viewBox", `${A.x} ${A.y} ${A.w} ${A.h}`), rt(te, X(), F("show-grid").checked, A), g = new XMLSerializer().serializeToString(te), F("source").value = g;
  }, re = function(S) {
    const v = F("example-info");
    if (v && (v.replaceChildren(), !!S && (v.append(document.createTextNode(S.description + " ")), S.url))) {
      const j = document.createElement("a");
      j.href = S.url, j.target = "_blank", j.rel = "noopener noreferrer", j.textContent = S.reference, v.append(j);
    }
  }, ae = function() {
    a.invalidate(), ne.setEnabled(!1), p = null, r = null, g = "", G(), re(Object.values(We).find((S) => S.source === t.value)), n.textContent = "Input changed — generate to refresh the schematic.";
  }, J = function(S) {
    for (const v of S) {
      const j = JSON.stringify([v.severity, v.line, v.message, v.source]);
      o.has(j) || (o.add(j), i.append({ ...v, category: "Parser / rendering" }));
    }
  }, be = function() {
    !k && g && N.set(b, { ...I }), e.querySelector("svg")?.setAttribute("viewBox", `${I.x} ${I.y} ${I.w} ${I.h}`);
    const S = e.querySelector("svg");
    S && rt(S, X(), F("show-grid").checked, I), F("zoom-level").textContent = Math.round(A.w / I.w * 100) + "%";
  }, Ee = function(S, v = I.x + I.w / 2, j = I.y + I.h / 2) {
    if (!e.querySelector("svg")) return;
    const q = Math.max(0.05, Math.min(10, I.w * S / A.w)) * A.w / I.w;
    I = { x: v + (I.x - v) * q, y: j + (I.y - j) * q, w: I.w * q, h: I.h * q }, be();
  }, Ce = function(S) {
    const v = new URLSearchParams();
    S && v.set("instance", S);
    const j = v.toString();
    location.hash.slice(1) === j ? (b = S, ue()) : location.hash = j;
  }, Ne = function() {
    b = new URLSearchParams(location.hash.slice(1)).get("instance") || "";
  }, Ae = function() {
    const S = !!(y && y !== b && m?.contexts[y]);
    F("selection-actions").hidden = !S, F("open-instance").href = "#" + new URLSearchParams({ instance: y });
  }, Ie = function() {
    F("breadcrumbs").replaceChildren();
    const S = (j, q) => {
      const W = document.createElement("button");
      W.type = "button", W.textContent = j, W.onclick = () => Ce(q), W.disabled = q === b, F("breadcrumbs").append(W);
    };
    if (S("Top", ""), b) {
      const j = m.contexts[b].path;
      for (let q = 0; q < j.length; q++) S(j[q], j.slice(0, q + 1).map(encodeURIComponent).join("/"));
    }
    F("instances").replaceChildren();
    const v = (j, q) => {
      for (const W of j.children) {
        const H = document.createElement("div");
        H.className = "spice-instance-row", H.style.setProperty("--depth", Math.min(q, 8)), H.dataset.instance = W.id;
        const te = document.createElement("a");
        te.href = "#" + new URLSearchParams({ instance: W.id }), te.textContent = W.name + " · " + W.definition, te.title = "Open " + W.id + " as its own sheet";
        const de = document.createElement("span");
        if (de.className = "spice-help", de.textContent = Object.entries(W.params).map(([E, O]) => E + "=" + O).join(" · "), H.append(te), de.textContent) {
          const E = document.createElement("details"), O = document.createElement("summary");
          O.textContent = "Parameters", E.append(O, de), H.append(E);
        }
        F("instances").append(H), v(W, q + 1);
      }
    };
    v(m.contexts[b], 0), F("hierarchy-panel").hidden = !m.contexts[b].children.length, F("focus-title").textContent = b ? b + " / " + m.contexts[b].definition : "Top-level schematic", Ae();
  };
  ar(we), fo(we);
  const t = F("input"), e = F("preview"), n = F("status"), i = vr(F);
  let o = /* @__PURE__ */ new Set(), p = null, r = null, l = !1, a = null, c = null, x = [], g = "", d, m, h, _ = "", b = "", y = "", k = !1, I = { x: 0, y: 0, w: 1, h: 1 }, A = { ...I }, C, M = !1, B = {}, N = /* @__PURE__ */ new Map(), w = !1;
  try {
    B = JSON.parse(sessionStorage.getItem("spice-libraries-v3") || "{}");
  } catch {
  }
  we.addEventListener("click", (S) => {
    k && S.target.closest('a[href^="#"]') && S.preventDefault();
  });
  const G = () => {
    F("upload").disabled = k || w || l, F("download-project").disabled = F("open-download").disabled = F("copy").disabled = F("download").disabled = !g || k || w || a?.working(), F("download-asc").disabled = F("download-asc-bundle").disabled = !g || !p || k || l || !a?.complete();
  }, $ = () => ({ font: F("font").value, fontSize: Number(F("size").value), color: At, gridSize: F("grid").checked && F("conventional").checked ? Ct : 0, detailed: F("detailed").checked, conventional: F("conventional").checked }), X = () => d?.layout.report?.gridSize ? Number(F("grid-size").value) : 0, ne = uo(F, (S, v) => {
    c = S, x = v, Y();
  });
  a = So(e, F, { report: i.append, applyLayoutTemplate: L, getNetColor: (S) => {
    const v = x.find((j) => j.bit === S);
    return v && c && (c.auto || c.manual.has(v.name)) ? c.color(v.name) : null;
  }, inspect: (S, v) => {
    const j = d?.components.find((q) => q.name === S);
    if (j)
      y = j.instanceId || "", F("selection").textContent = j.raw, Ae();
    else if (v?.decoration) {
      y = "";
      const q = Object.values(d.nodes).find((W) => W.bit === v.ports[0]?.bit);
      F("selection").textContent = "Ground symbol · " + (q?.displayName || "0"), Ae();
    }
  }, changed: (S, v, j) => {
    p = S, r = null, A = j;
    const q = e.querySelector("svg");
    if (q) {
      q.setAttribute("width", String(A.w)), q.setAttribute("height", String(A.h));
      const W = q.querySelector("#spice-layout-report");
      if (W) {
        const H = JSON.parse(W.textContent);
        H.manualWiring = v, H.verifiedTerminals = !v.unrouted, H.geometricConnectivityVerified = !v.unrouted, W.textContent = JSON.stringify(H);
      }
    }
    d && h && (F("json").value = JSON.stringify({ circuit: d, netlist: ze(d), hierarchy: h, interactive: { ...v, drawing: S } }, null, 2)), Y(), G();
  } }), F("show-grid").onchange = Y, F("grid-size").onchange = () => {
    Y(), be();
  };
  async function L(S, v, j) {
    const q = m, W = t.value, H = $(), te = Co(q, S, v), de = a.snapshotSheets(), E = [], O = (R) => JSON.stringify(R) === JSON.stringify(H);
    async function T(R) {
      const P = ze(R), U = await tt(P, H), Q = new DOMParser().parseFromString(U.svg, "image/svg+xml").documentElement;
      for (const ee of Object.values(R.nodes)) for (const oe of Q.querySelectorAll(".net_" + ee.bit)) oe.setAttribute("data-net", ee.name);
      return { drawing: _t(Q, U.drawing, R, P), svg: Q };
    }
    for (const R of te.instances) {
      const P = de.find((ge) => ge.scope === R.source && O(ge.settings)), U = de.find((ge) => ge.scope === R.target && O(ge.settings)), Q = await T(R.sourceCircuit), ee = await T(R.targetCircuit), oe = P?.snapshot || Q.drawing;
      dt(Q.drawing, oe, 4);
      const Z = /* @__PURE__ */ new Map(), pe = /* @__PURE__ */ new Map();
      for (const ge of ee.svg.querySelectorAll("text")) {
        if (ge.closest("defs")) continue;
        const Re = ge.closest('g[id^="cell_"]')?.id.slice(5) || "", Je = Z.get(Re) || 0;
        Z.set(Re, Je + 1), pe.set(ft(Re, Je), ge.textContent);
      }
      const me = Io(oe, ee.drawing, R, { targetLabels: pe, targetOverrides: U?.snapshot.labelOverrides || [] });
      St(ee.svg, me.labelOverrides), E.push({ scope: R.target, topology: R.targetCircuit.topology.signature, settings: H, snapshot: me, templateSource: R.source });
    }
    if (!j() || m !== q || t.value !== W || !O($())) throw Error("Layout template cancelled because the current circuit changed.");
    for (const R of E) a.saveTemplateSheet(R);
    i.append({ category: "Tools", message: "Layout template applied to " + E.length + " subcircuit page(s), including all nested instances." });
  }
  async function V() {
    (!p || !d?.layout.report?.gridVerified) && (F("grid").checked = !0, F("conventional").checked = !0, await ue({ resetEditor: !0 })), a.setEnabled(Oe.enabled()), G();
  }
  F("interactive").onclick = async () => {
    Oe.set(!Oe.enabled()), await V(), e.focus({ preventScroll: !0 });
  }, F("label-edit").onclick = async () => {
    Oe.set(!0), await V(), a.setLabelEditing(!a.labelEditing()), e.focus({ preventScroll: !0 });
  }, F("group").onclick = () => {
    a.toggleGroup(), e.focus({ preventScroll: !0 });
  };
  const K = F("clear-wires-dialog");
  let z = null;
  F("flywire").onclick = () => {
    !a.canEdit() || a.working() || (z = { tree: m, focus: b }, K.showModal());
  }, F("cancel-clear-wires").onclick = () => K.close(), F("confirm-clear-wires").onclick = () => {
    const S = z;
    K.close(), !(S?.tree !== m || S?.focus !== b || !Oe.enabled() || a.working()) && (a.clear(), G());
  }, K.addEventListener("close", () => {
    z = null, F("flywire").focus({ preventScroll: !0 });
  }), we.addEventListener("spice:workspacechange", () => {
    K.open && K.close();
  }), document.addEventListener("keydown", (S) => {
    K.open && !(S.altKey && S.key === "Escape") && (S.stopImmediatePropagation(), S.key === "Escape" && (S.preventDefault(), K.close()));
  }, { capture: !0 }), F("layout-brush").onclick = () => {
    a.toggleLayoutBrush(), e.focus({ preventScroll: !0 });
  }, F("auto-route").onclick = async () => {
    Oe.set(!0), await V(), await a.autoRoute(), G();
  }, F("wire-undo").onclick = () => a.undo(), F("wire-redo").onclick = () => a.redo();
  for (const S of we.querySelectorAll("[data-editor-mode]")) S.onclick = async () => {
    Oe.set(!0), await V(), a.chooseTool(S.dataset.editorMode), e.focus({ preventScroll: !0 });
  };
  for (const S of we.querySelectorAll("[data-editor-arrange]")) S.onclick = () => {
    a.arrange(S.dataset.editorArrange), e.focus({ preventScroll: !0 });
  };
  ne.setEnabled(!1), t.value = $t;
  try {
    t.value = sessionStorage.getItem("spice-netlist-v2") || $t;
  } catch {
  }
  re(Object.values(We).find((S) => S.source === t.value)), t.addEventListener("input", ae);
  for (const S of ["font", "size", "detailed", "conventional", "grid"]) F(S).addEventListener("input", ae);
  new ResizeObserver(() => {
    const S = e.querySelector("svg");
    S && rt(S, X(), F("show-grid").checked, I);
  }).observe(e), F("zoom-in").onclick = () => Ee(0.8), F("zoom-out").onclick = () => Ee(1.25), F("fit").onclick = () => {
    I = { ...A }, be();
  };
  const ye = (S) => {
    const v = e.querySelector("svg");
    return v ? new DOMPoint(S.clientX, S.clientY).matrixTransform(v.getScreenCTM().inverse()) : null;
  };
  e.addEventListener("wheel", (S) => {
    const v = ye(S);
    v && (S.preventDefault(), Ee(S.deltaY > 0 ? 1.12 : 1 / 1.12, v.x, v.y));
  }, { passive: !1 }), e.addEventListener("pointerdown", (S) => {
    ![0, 1].includes(S.button) || !e.querySelector("svg") || (C = { start: ye(S), x: S.clientX, y: S.clientY, view: { ...I }, moved: !1 }, e.setPointerCapture(S.pointerId));
  }), e.addEventListener("pointermove", (S) => {
    if (!C) return;
    const v = ye(S);
    Math.hypot(S.clientX - C.x, S.clientY - C.y) > 4 && (C.moved = !0), I.x += C.start.x - v.x, I.y += C.start.y - v.y, be();
  }), e.addEventListener("pointerup", (S) => {
    if (!C) return;
    const v = C.moved;
    if (C = null, e.hasPointerCapture(S.pointerId) && e.releasePointerCapture(S.pointerId), !v && !a?.labelEditing()) {
      const j = document.elementFromPoint(S.clientX, S.clientY)?.closest("[data-component]"), q = d?.components.find((W) => W.name === j?.dataset.component);
      q && (y = q.instanceId || "", F("selection").textContent = `${q.raw}
${Object.entries(q.terminals).map(([W, H]) => `${W} → ${H}`).join("   ")}`, q.kind === "X" ? Ce(q.instanceId) : Ae());
    }
  }), window.addEventListener("hashchange", () => {
    if (k) {
      M = !0;
      return;
    }
    Ne(), y = "", ue();
  }), e.addEventListener("pointercancel", () => {
    C = null;
  }), e.addEventListener("keydown", (S) => {
    const v = S.target.closest("[data-instance]");
    if (v && !a?.layoutBrushActive() && !a?.labelEditing() && (S.key === "Enter" || S.key === " ")) {
      S.preventDefault(), y = v.dataset.instance, Ce(y);
      return;
    }
    S.key === "+" || S.key === "=" ? Ee(0.8) : S.key === "-" ? Ee(1.25) : S.key.toLowerCase() === "f" ? (I = { ...A }, be()) : S.key.startsWith("Arrow") && (S.preventDefault(), I.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[S.key] || 0) * I.w, I.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[S.key] || 0) * I.h, be());
  });
  async function ue({ resetEditor: S = !1 } = {}) {
    if (k) return;
    o = /* @__PURE__ */ new Set(), k = !0, a.invalidate(), ne.setEnabled(!1), p = null, r = null, g = "", G(), F("generate").disabled = !0, t.readOnly = !0, F("file").disabled = !0, F("libraries").disabled = !0;
    for (const j of we.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button, #spice-breadcrumbs button")) j.disabled = !0;
    s("Parsing netlist and routing wires…"), e.setAttribute("aria-busy", "true");
    let v = [];
    try {
      if (_ !== t.value || !m) {
        if (_ && _ !== t.value && (a.clearSheets(), N.clear()), h = Lt(t.value, { files: B }), v = [...h.diagnostics], v.some((P) => P.severity === "error"))
          throw m = null, Error("Fix the parser errors below before generating.");
        m = lt(h), _ && _ !== t.value ? (b = "", y = "", history.replaceState(null, "", location.pathname + location.search)) : Ne(), _ = t.value;
        try {
          sessionStorage.setItem("spice-netlist-v2", t.value);
        } catch {
        }
      }
      if (v = [...h.diagnostics], J(v), v.some((P) => P.severity === "error")) throw Error("Fix the parser errors below before generating.");
      d = qe(m, { focus: b });
      for (const P of d.interfaceAliases) v.push({ severity: "info", message: `Instance boundary: ${P.ports.join(" = ")} share parent node ${P.node}. This connection belongs to the parent sheet only; local formal ports remain independent.` });
      const j = ze(d);
      $().conventional && v.push(...d.layout.diagnostics);
      const q = await tt(j, $()), W = new DOMParser().parseFromString(q.svg, "image/svg+xml");
      if (W.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const H = W.documentElement, te = H.querySelector("#spice-layout-report");
      if (te) {
        d.layout.report = JSON.parse(te.textContent);
        const P = d.layout.report;
        if (v.push({ severity: "info", message: `Layout: compact signal flow; ${P.powerSourcesChecked} DC/ground symbols checked, ${P.powerOrderViolations} DC order preference(s) unmet. ${P.powerPass}. ${P.classicRails ? "Fixed local voltage rails." : "Global voltage bands are a preference."}` }), P.classicTemplateFallback && v.push({ severity: "info", message: "Some local branches could not use the classic template without crossing symbols; automatic layout was used." }), P.groundPlacement && v.push({ severity: "info", message: `Ground: ${P.groundPlacement}; ${P.straightenedGroundDrops || 0} return-path simplification(s).` }), P.explicitGroups && v.push({ severity: "info", message: `Layout comments: ${P.explicitGroups} visual groups; nested row/column placement retained on expansion.` }), P.classicRails && v.push({ severity: "info", message: `Transistor layout: local load/bias branches; ${P.railCount} shared voltage rails.` }), P.localClassicInstances?.length && v.push({ severity: "info", message: `${P.localClassicInstances.length} expanded instance(s) retain independent transistor layouts.` }), P.localClassicStages?.length && v.push({ severity: "info", message: `Classic transistor proximity active: ${P.localClassicStages.join(", ")}.` }), P.sharedClassicRails && v.push({ severity: "info", message: "Classic stages share voltage-ordered sheet rails; supplies do not follow stage-boundary signal routes." }), P.mirroredTransistors?.length && v.push({ severity: "info", message: `Control-pin mirror choices: ${P.mirroredTransistors.join(", ")}.` }), P.recognizedMotifs?.length && v.push({ severity: "info", message: `Transistor structures: ${P.recognizedMotifs.map((U) => `${U.kind} (${U.members.join(", ")}; ${U.confidence})`).join("; ")}.` }), P.appliedMotifs?.length && v.push({ severity: "info", message: `Topology preferences applied to ${P.appliedMotifs.length} local structure(s); ELK still determines placement and routing.` }), P.subnetFirstFallback && v.push({ severity: "warning", message: "Subnet attachment kept the previous safe placement: " + P.subnetFirstFallback }), P.pairCompactionFallback && v.push({ severity: "warning", message: "Pair proximity kept the original regions: " + P.pairCompactionFallback }), P.compoundPairFallback && v.push({ severity: "warning", message: "Compound-pair placement fell back to proximity rules: " + P.compoundPairFallback }), P.pairConstraints?.length) {
          const U = P.pairConstraints.filter((Q) => Q.crossRegion && !Q.compacted).length;
          v.push({ severity: "info", message: `${P.pairConstraints.length - U} adjacent transistor pair(s); ${U} cross-region mirror row constraint(s).` });
        }
        P.netShortcuts && v.push({ severity: "info", message: `${P.netShortcuts} safe straight net shortcut(s); ${P.netWireSaved.toFixed(1)} units of redundant wire removed before SVG/ASC export.` }), P.sharedRailFallback && v.push({ severity: "warning", message: `Shared rail layout uses an automatic fallback: ${P.sharedRailFallback}.` });
        for (const U of P.localClassicFallbacks || []) U.stage && v.push({ severity: "info", message: `Classic stage ${U.stage} uses automatic layout: ${U.reason || "No unobstructed local template"}.` });
        P.geometricConnectivityVerified && v.push({ severity: "info", message: `Net geometry verified; ${P.cyclesRemoved} same-net loop(s) and ${P.leavesRemoved} unused wire branch(es) removed.` }), J(v);
      }
      if (H.localName !== "svg" || H.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const de = Number(H.getAttribute("width")), E = Number(H.getAttribute("height")), O = JSON.parse(H.getAttribute("data-label-bounds") || "null");
      A = { x: Math.min(-20, (O?.x ?? 0) - 20), y: Math.min(-20, (O?.y ?? 0) - 20) }, A.w = Math.max(de, O?.right || 0) + 20 - A.x, A.h = Math.max(E, O?.bottom || 0) + 20 - A.y, I = { ...A }, H.setAttribute("viewBox", `${A.x} ${A.y} ${A.w} ${A.h}`), H.setAttribute("width", String(A.w)), H.setAttribute("height", String(A.h)), H.setAttribute("role", "img"), H.setAttribute("aria-label", d.title || "SPICE schematic"), H.setAttribute("style", "background:white");
      for (const P of d.components) {
        const U = W.getElementById("cell_" + P.name);
        if (!U) throw Error("Renderer omitted component " + P.name);
        U.setAttribute("data-component", P.name), P.kind === "X" && (U.setAttribute("data-instance", P.instanceId), U.setAttribute("role", "button"), U.setAttribute("tabindex", "0"), U.setAttribute("aria-label", "Open " + P.name));
        const Q = W.createElementNS(H.namespaceURI, "title");
        Q.textContent = P.raw + `
Resolved: ` + P.value + `
` + Object.entries(P.terminals).map(([ee, oe]) => ee + ": " + oe).join(", "), U.prepend(Q);
      }
      for (const P of Object.values(d.nodes))
        for (const U of H.querySelectorAll(".net_" + P.bit)) {
          U.setAttribute("data-net", P.name);
          const Q = W.createElementNS(H.namespaceURI, "title");
          Q.textContent = "Node " + P.displayName, U.append(Q);
        }
      const T = d.components.filter((P) => P.kind === "K").map((P) => ({ name: P.name, inductors: P.coupledInductors, value: P.value }));
      if (T.length) {
        const P = W.createElementNS(H.namespaceURI, "metadata");
        P.setAttribute("id", "spice-magnetic-couplings"), P.textContent = JSON.stringify(T), H.append(P);
        for (const U of T) for (const Q of U.inductors) {
          const ee = W.getElementById("cell_" + Q);
          if (!ee) continue;
          const oe = W.createElementNS(H.namespaceURI, "circle"), Z = [...ee.children].find((Re) => Re.getAttribute("s:pid") === "A"), pe = Z?.getAttribute("s:position"), me = { left: [6, -8], right: [-6, -8], top: [-8, 6], bottom: [-8, -6] }[pe] || [0, 0];
          for (const [Re, Je] of Object.entries({ cx: Number(Z?.getAttribute("s:x")) + me[0], cy: Number(Z?.getAttribute("s:y")) + me[1], r: 3, fill: $().color, stroke: "none", "data-coupling": U.name })) oe.setAttribute(Re, String(Je));
          const ge = W.createElementNS(H.namespaceURI, "title");
          ge.textContent = U.name + " · dotted terminal: " + U.inductors.join(", "), oe.append(ge), ee.append(oe);
        }
      }
      p = q.drawing, g = new XMLSerializer().serializeToString(H), F("source").value = g, e.replaceChildren(document.importNode(H, !0)), be();
      const R = v.filter((P) => P.severity === "warning").length;
      n.textContent = `${d.components.filter((P) => !P.synthetic).length} components · ${Object.keys(d.nodes).length} nodes · ${d.topology.leafCount} primitive devices verified${d.interfaceAliases.length ? " · Parent-connected ports: " + d.interfaceAliases.map((P) => P.ports.join(" = ")).join("; ") + "." : ""}${R ? " · Review " + R + " warning(s); drawing may be partial." : " · Schematic ready."}`, n.textContent += ` Layout rules v${Ze}.`, d.layout.report?.gridVerified && (n.textContent += ` Grid ${d.layout.report.gridSize}.`), d.layout?.report?.powerOrderViolations && (n.textContent += ` Layout: ${d.layout.report.powerOrderViolations} DC ordering preference(s) unmet; see messages.`), d.layout?.report?.groundPlacement?.startsWith("ELK fallback") && (n.textContent += " Ground marker: routed fallback; no safe short attachment found."), i.append({ message: n.textContent, category: "Rendering", severity: R ? "warning" : "info" }), F("json").value = JSON.stringify({ circuit: d, netlist: j, hierarchy: h }, null, 2), ne.setCircuit(d, t.value), a.mount(e.querySelector("svg"), p, d, j, $(), { reset: S, scope: b }), Y(), !S && N.has(b) ? I = { ...N.get(b) } : N.set(b, { ...I }), be(), F("selection").textContent = "Click a component to inspect its original statement and pin connections.", Ie();
    } catch (j) {
      if (e.replaceChildren(), g = "", F("source").value = "", F("json").value = "", F("nets").replaceChildren(), F("selection").textContent = "", s(j.message, { severity: "error" }), !m)
        F("hierarchy-panel").hidden = !0, F("selection-actions").hidden = !0, F("breadcrumbs").replaceChildren();
      else if (!m.contexts[b]) {
        const q = document.createElement("button");
        q.type = "button", q.textContent = "Return to Top", q.onclick = () => Ce(""), F("breadcrumbs").replaceChildren(q);
      }
      ne.setCircuit(null, t.value), j.diagnostics && (v = j.diagnostics), v.some((q) => q.severity === "error") || v.push({ severity: "error", line: 0, message: j.message }), J(v);
    } finally {
      k = !1, F("generate").disabled = !1, t.readOnly = !1, F("file").disabled = !1, F("libraries").disabled = !1;
      for (const j of we.querySelectorAll("[data-example], select, input[type=number], input[type=color], input[type=checkbox], #spice-instances button")) j.disabled = !1;
      m && m.contexts[b] && Ie(), ne.setEnabled(!!g), a.refreshControls(), e.setAttribute("aria-busy", "false"), G(), M && (M = !1, Ne(), queueMicrotask(ue));
    }
  }
  F("generate").onclick = () => ue({ resetEditor: !0 });
  for (const S of we.querySelectorAll("[data-example]")) S.onclick = () => {
    const v = We[S.dataset.example];
    t.value = v.source, ae(), re(v), ue();
  };
  F("file").onchange = async (S) => {
    const v = S.target.files[0];
    if (v) {
      if (k || w) {
        S.target.value = "";
        return;
      }
      try {
        const j = /\.(spiceproj|json)$/i.test(v.name);
        if (v.size > (j ? an : 2e6)) throw Error(j ? "Project exceeds 32 MB." : "Netlist exceeds 2 MB.");
        j ? await Te(await v.text()) : (t.value = await Bt(v), ae(), await ue());
      } catch (j) {
        s("File could not be opened: " + j.message, { severity: "error", category: "Files" });
      } finally {
        S.target.value = "", G();
      }
    }
  };
  async function Te(S) {
    w = !0, G();
    const v = we.inert;
    we.inert = !0;
    try {
      const j = ln(S), q = Lt(j.source, { files: j.libraries });
      if (q.diagnostics.some((H) => H.severity === "error")) throw Error("Project netlist has parser errors. Current work was kept.");
      const W = lt(q);
      if (!W.contexts[j.focus]) throw Error("Saved sheet is not present in the netlist.");
      for (const H of j.sheets) {
        if (!W.contexts[H.scope]) throw Error("Unknown saved sheet: " + H.scope);
        if (H.templateSource && !W.contexts[H.templateSource]) throw Error("Unknown layout template source: " + H.templateSource);
        const te = qe(W, { focus: H.scope });
        if (te.topology.signature !== H.topology) throw Error("Saved topology differs from the netlist: " + (H.scope || "Top"));
        const de = new Map(te.components.filter((R) => R.kind !== "K").map((R) => [R.name, R]));
        for (const R of H.snapshot.components) {
          if (R.decoration) continue;
          const P = de.get(R.id);
          if (!P || R.ports.length !== Object.keys(P.terminals).length || R.ports.some((U) => te.nodes[P.terminals[U.pin]]?.bit !== U.bit)) throw Error("Saved pin connectivity differs from the netlist: " + R.id);
          de.delete(R.id);
        }
        if (de.size) throw Error("Saved sheet omits components.");
        s("Checking saved sheet " + (H.scope || "Top") + "…", { category: "Files" });
        const E = ze(te), O = await tt(E, H.settings), T = new DOMParser().parseFromString(O.svg, "image/svg+xml").documentElement;
        for (const R of Object.values(te.nodes)) for (const P of T.querySelectorAll(".net_" + R.bit)) P.setAttribute("data-net", R.name);
        St(T, H.snapshot.labelOverrides), dt(_t(T, O.drawing, te, E), H.snapshot, H.settings.gridSize);
      }
      j.sheets.some((H) => H.scope === j.focus && JSON.stringify(H.settings) === JSON.stringify(j.settings)) || (s("Checking current sheet…", { category: "Files" }), await tt(ze(qe(W, { focus: j.focus })), j.settings)), a.invalidate(), a.restoreSheets(j.sheets), N = new Map(j.sheets.filter((H) => H.view).map((H) => [H.scope, H.view])), N.set(j.focus, j.view), t.value = j.source, B = j.libraries, m = W, h = q, _ = j.source, b = j.focus, y = "";
      for (const H of ["font", "size"]) F(H).value = H === "font" ? j.settings.font : j.settings.fontSize;
      for (const [H, te] of Object.entries({ detailed: j.settings.detailed, conventional: j.settings.conventional, grid: !!j.settings.gridSize, "show-grid": j.showGrid })) F(H).checked = te;
      Oe.set(j.interactive), F("grid-size").value = j.displayGridStep, history.replaceState(null, "", location.pathname + location.search + (b ? "#" + new URLSearchParams({ instance: b }) : "")), ne.restore(j.colors), re(Object.values(We).find((H) => H.source === t.value));
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(B)), sessionStorage.setItem("spice-netlist-v2", t.value);
      } catch {
      }
      F("library-status").textContent = Object.keys(B).length + " project library file(s) loaded", await ue(), g && (a.setLabelEditing(j.labelEditing === !0), n.textContent += " Project restored.", i.append({ message: "Project restored.", category: "Files" }));
    } finally {
      we.inert = v, w = !1, G();
    }
  }
  F("libraries").onchange = async (S) => {
    try {
      for (const v of S.target.files) {
        if (v.size > 16e6) throw Error("Library exceeds 16 MB: " + v.name);
        B[v.webkitRelativePath || v.name] = await Bt(v);
      }
      try {
        sessionStorage.setItem("spice-libraries-v3", JSON.stringify(B));
      } catch {
      }
      a.invalidate(), a.clearSheets(), N.clear(), m = null, _ = "", F("library-status").textContent = Object.keys(B).length + " library file(s) loaded", ue();
    } catch (v) {
      s(v.message, { severity: "error", category: "Files" });
    } finally {
      S.target.value = "";
    }
  }, F("library-status").textContent = Object.keys(B).length ? "Libraries restored from this session." : "For .include / .lib dependencies";
  const f = F("download-dialog");
  we.addEventListener("spice:workspacechange", () => {
    f.open && f.close();
  }), F("open-download").onclick = () => {
    G(), f.showModal();
  }, F("close-download").onclick = () => f.close(), f.addEventListener("click", (S) => {
    if (S.target !== f) return;
    const v = f.getBoundingClientRect();
    (S.clientX < v.left || S.clientX > v.right || S.clientY < v.top || S.clientY > v.bottom) && f.close();
  }), document.addEventListener("keydown", (S) => {
    f.open && !(S.altKey && S.key === "Escape") && (S.stopImmediatePropagation(), S.key === "Escape" && (S.preventDefault(), f.close()));
  }, { capture: !0 }), F("upload").onclick = () => F("file").click(), F("download-project").onclick = () => {
    try {
      const S = a.snapshotSheets().filter((W) => m?.contexts[W.scope] && qe(m, { focus: W.scope }).topology.signature === W.topology).map((W) => ({ ...W, ...N.has(W.scope) ? { view: N.get(W.scope) } : {} })), v = vo({ source: t.value, libraries: B, settings: $(), displayGridStep: Number(F("grid-size").value), showGrid: F("show-grid").checked, interactive: Oe.enabled(), flywire: !1, labelEditing: a.labelEditing(), focus: b, view: { ...I }, colors: ne.snapshot(), sheets: S });
      f.close();
      const j = URL.createObjectURL(new Blob([v], { type: "application/json;charset=utf-8" })), q = document.createElement("a");
      q.href = j, q.download = "spice-schematic.spiceproj", q.click(), setTimeout(() => URL.revokeObjectURL(j), 1e3), s("Project saved. Upload the .spiceproj file to resume editing.", { category: "Files" });
    } catch (S) {
      s("Project save failed: " + S.message, { severity: "error", category: "Files" });
    }
  }, F("download").onclick = () => {
    f.close();
    const S = URL.createObjectURL(new Blob([g], { type: "image/svg+xml;charset=utf-8" })), v = document.createElement("a");
    v.href = S, v.download = "spice-schematic.svg", v.click(), setTimeout(() => URL.revokeObjectURL(S), 1e3), s("SVG downloaded.", { category: "Export" });
  };
  async function u(S) {
    const v = p;
    if (!(!v || k || l)) {
      l = !0, G(), s("Generating ASC from the selected layout and checking connections…", { category: "Export" });
      try {
        const { exportAsc: j } = await import("./asc-export-RK19Bikg.js");
        if (p !== v) throw Error("Schematic changed. Generate again before exporting ASC.");
        r ||= j({ tree: m, circuit: d, drawing: v, source: t.value, libraries: B });
        const q = S ? r.zip : r.ascBytes, W = URL.createObjectURL(new Blob([q], { type: S ? "application/zip" : "application/octet-stream" })), H = document.createElement("a");
        H.href = W, H.download = S ? "spice-schematic-asc.zip" : "spice-schematic.asc", H.click(), setTimeout(() => URL.revokeObjectURL(W), 1e3), n.textContent = "ASC connections verified · " + r.manifest.audit.symbols + " symbols. " + (S ? "Extract all files together, then open spice-schematic.asc in LTspice." : "This ASC requires its generated .asy symbols. Download the ASC bundle and keep all files together."), r.manifest.warnings.length && (n.textContent += " " + r.manifest.warnings.join(" ")), i.append({ message: n.textContent, category: "Export", severity: r.manifest.warnings.length ? "warning" : "info" });
      } catch (j) {
        s("ASC export failed: " + j.message, { severity: "error", category: "Export" });
      } finally {
        l = !1, G();
      }
    }
  }
  F("download-asc").onclick = () => {
    f.close(), u(!1);
  }, F("download-asc-bundle").onclick = () => {
    f.close(), u(!0);
  }, F("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(g), s("SVG source copied to clipboard.", { category: "Export" });
    } catch {
      F("source-details").open = !0, F("source").focus(), F("source").select(), s("Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.", { severity: "warning", category: "Export" });
    }
  }, ue();
}
export {
  vt as b,
  lt as e,
  Qe as l,
  st as n,
  Dn as p
};
