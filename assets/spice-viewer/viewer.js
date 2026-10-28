const _ = "R L C D Q M V I E G F H B", B = new Set(_.split(" ")), $ = () => /* @__PURE__ */ Object.create(null), S = (m) => m.toLowerCase();
function U(m) {
  const c = [], g = [];
  let a = "", h = 0, d = "";
  for (let i = 0; i < m.length; i++) {
    const t = m[i];
    if (d) {
      a += t, t === d && m[i - 1] !== "\\" && (d = "");
      continue;
    }
    if (t === '"' || t === "'") {
      d = t, a += t;
      continue;
    }
    if (!h && (t === ";" || t === "$" && (!i || /\s/.test(m[i - 1])))) break;
    if ("({".includes(t) && (g.push(t), h++), ")}".includes(t) && (h--, g.pop() !== (t === ")" ? "(" : "{")))
      throw Error("Unbalanced expression delimiters.");
    /\s/.test(t) && !h ? (a && c.push(a), a = "") : a += t;
  }
  if (h || d) throw Error("Unclosed expression or quoted string.");
  return a && c.push(a), c;
}
function V(m) {
  const c = [], g = [], a = [], h = $(), d = $(), i = (n, l, o) => c.push({ severity: n, line: l, message: o });
  if (typeof m != "string") throw TypeError("Netlist must be a string.");
  if (m.length > 5e5) throw Error("Netlist exceeds the Phase 1 limit of 500 kB.");
  const t = [];
  m.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((n, l) => {
    const o = n.trim();
    !o || o.startsWith("*") || (o.startsWith("+") ? t.length ? t.at(-1).text += " " + o.slice(1).trim() : i("error", l + 1, "Continuation has no preceding statement.") : t.push({ line: l + 1, text: o }));
  });
  for (const n of t) {
    try {
      n.tokens = U(n.text);
    } catch (o) {
      i("error", n.line, o.message), n.tokens = [];
    }
    const l = n.tokens;
    /^\.model$/i.test(l[0] || "") && (l.length < 3 ? i("error", n.line, ".model requires a name and device type.") : h[S(l[1])] = { name: l[1], type: l[2].split("(")[0].toUpperCase(), raw: n.text });
  }
  let y = "", b = 0, E = !1, R = !1;
  const L = /* @__PURE__ */ new Set(), O = /* @__PURE__ */ new Set([".title", ".model", ".param", ".func", ".tran", ".ac", ".dc", ".op", ".options", ".option", ".ic", ".nodeset", ".save", ".probe", ".print", ".plot", ".meas", ".measure", ".temp", ".step", ".global", ".backanno", ".width", ".four", ".noise", ".pz", ".tf", ".sens"]);
  for (const { line: n, text: l, tokens: o } of t) {
    if (!o.length) continue;
    const v = S(o[0]);
    if (R) {
      i("warning", n, "Statement after .end is not rendered: " + l);
      continue;
    }
    if (v === ".control") {
      E = !0, i("warning", n, ".control script retained but not executed or rendered.");
      continue;
    }
    if (v === ".endc") {
      E = !1;
      continue;
    }
    if (E) continue;
    if (v === ".subckt") {
      b++, i("warning", n, "Subcircuit definition is not expanded in Phase 1: " + l);
      continue;
    }
    if (v === ".ends") {
      b ? b-- : i("error", n, "Unmatched .ends.");
      continue;
    }
    if (b) continue;
    if (v === ".end") {
      R = !0;
      continue;
    }
    if (v.startsWith(".")) {
      g.push({ line: n, text: l }), v === ".title" ? y = o.slice(1).join(" ") : [".if", ".elseif", ".else", ".endif", ".connect", ".alias"].includes(v) ? i("error", n, "Topology-changing directive is unsupported: " + l) : O.has(v) || i("warning", n, "Directive retained but not resolved: " + l);
      continue;
    }
    const e = o[0][0].toUpperCase();
    if (!B.has(e)) {
      n === 1 && !/\d/.test(o[0]) && o.length > 1 && e !== "X" ? (y = l, i("warning", n, "First line treated as a SPICE title; use .title for an unambiguous title.")) : i("warning", n, `Unsupported ${e} device was not rendered: ${l}`);
      continue;
    }
    const r = e === "M" ? 7 : e === "Q" ? 5 : 4;
    if (n === 1 && !/\d/.test(o[0]) && o.length < r) {
      y = l, i("warning", n, "First line treated as title: " + l);
      continue;
    }
    try {
      if (L.has(v)) throw Error("Duplicate component name (SPICE names are case insensitive).");
      let u, w, p = "", A = "", k;
      if ("RLC".includes(e))
        u = ["A", "B"], k = e.toLowerCase() + "_v";
      else if ("DVI".includes(e))
        u = ["+", "-"], k = e === "D" ? "d_v" : e.toLowerCase();
      else if (e === "B")
        u = ["+", "-"], k = "spice_b";
      else if (e === "Q") {
        u = ["C", "B", "E"], (h[S(o[5] || "")] || o.length >= 6 && !h[S(o[4] || "")] && !/[=(){}]/.test(o[5]) && !/^[+\-\d.]/.test(o[5])) && u.push("S"), p = o[u.length + 1];
        const f = h[S(p || "")]?.type;
        k = ["NPN", "PNP"].includes(f) ? (u.length === 3 ? "q_" : "spice_q4_") + f.toLowerCase() : "spice_q" + u.length, ["NPN", "PNP"].includes(f) || i("warning", n, `${o[0]}: model polarity unknown; rendered with explicit C/B/E${u.length === 4 ? "/S" : ""} pins.`);
      } else if (e === "M") {
        u = ["D", "G", "S", "B"], p = o[5];
        const f = h[S(p || "")]?.type;
        k = ["NMOS", "PMOS"].includes(f) ? "spice_" + f.toLowerCase() : "spice_m", ["NMOS", "PMOS"].includes(f) || i("warning", n, `${o[0]}: MOS model polarity unknown; rendered with explicit D/G/S/B pins.`);
      } else if ("EG".includes(e)) {
        if (/^(?:poly|laplace)/i.test(o[3] || "")) throw Error("POLY/LAPLACE controlled source syntax is unsupported.");
        /^(?:value|vol|cur|table|v\s*=|i\s*=)/i.test(o[3] || "") ? (u = ["+", "-"], k = "spice_b") : (u = ["+", "-", "C+", "C-"], k = "spice_" + e.toLowerCase());
      } else
        u = ["+", "-"], A = o[3], k = "spice_" + e.toLowerCase();
      if (w = u.length, o.length < w + 2) throw Error(`Expected ${w} nodes and a value/model/expression.`);
      if (o.slice(1, w + 1).some((f) => /[={}()]/.test(f))) throw Error("Invalid node token; check pin count or unsupported source syntax.");
      if ("FH".includes(e) && o.length < 5) throw Error("Current-controlled source requires a controlling voltage source and gain.");
      if (e === "B" && !/\b[VI]\s*=/i.test(o.slice(3).join(" "))) throw Error("Behavioral source requires V= or I= expression.");
      e === "D" && (p = o[3]);
      const P = $();
      u.forEach((f, C) => {
        const x = S(o[C + 1]);
        d[x] || (d[x] = { name: x, displayName: o[C + 1], bit: Object.keys(d).length + 2, terminals: [] }), d[x].terminals.push({ component: o[0], pin: f }), P[f] = x;
      });
      const I = o.slice(w + 1).join(" ");
      a.push({ name: o[0], kind: e, type: k, terminals: P, value: I, model: p, controlSource: A, line: n, raw: l }), L.add(v);
    } catch (u) {
      i("error", n, `${o[0]}: ${u.message} Statement: ${l}`);
    }
  }
  b && i("error", 0, "Unclosed .subckt definition."), E && i("error", 0, "Unclosed .control block."), a.length || i("error", 0, "No supported components to render."), a.length > 300 && i("error", 0, "Phase 1 supports up to 300 components per drawing.");
  for (const n of a)
    n.controlSource && !a.some((l) => S(l.name) === S(n.controlSource) && l.kind === "V") && i("error", n.line, `${n.name}: controlling voltage source ${n.controlSource} was not found.`), (n.kind === "B" || n.type === "spice_b") && i("info", n.line, `${n.name}: expression retained verbatim; V()/I() references are dependencies, not electrical terminals.`);
  return { title: y, components: a, nodes: d, models: h, directives: g, diagnostics: c };
}
function q(m) {
  const c = $(), g = $();
  for (const a of m.components) {
    const h = $(), d = $();
    for (const [i, t] of Object.entries(a.terminals))
      h[i] = [m.nodes[t].bit], d[i] = "input";
    c[a.name] = { type: a.type, port_directions: d, connections: h, parameters: {}, attributes: { ref: a.name, value: a.value, spice: a.raw } };
  }
  for (const a of Object.values(m.nodes)) g[a.name] = { hide_name: 0, bits: [a.bit], attributes: {} };
  if (m.nodes[0]) {
    let a = "__ground";
    for (; Object.hasOwn(c, a); ) a += "_";
    c[a] = { type: "gnd", connections: { A: [m.nodes[0].bit] }, port_directions: { A: "input" }, attributes: { name: "0" }, parameters: {} };
  }
  return { modules: { circuit: { attributes: { top: 1 }, ports: {}, cells: c, netnames: g } } };
}
function F(m, c) {
  const g = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/render-worker-C61iAnlt.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" });
  return new Promise((a, h) => {
    const d = (t, y) => {
      clearTimeout(i), g.terminate(), t ? h(Error(t)) : a(y);
    }, i = setTimeout(() => d("Layout exceeded 30 seconds. Try a smaller netlist."), 3e4);
    g.onmessage = ({ data: t }) => d(t.error, t.svg), g.onerror = (t) => d(t.message || "Layout worker failed."), g.postMessage({ netlist: m, settings: c });
  });
}
const z = `* Mixed RLC, semiconductors and nonlinear / controlled sources
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
`, D = `* RLC low-pass filter
.title RLC low-pass filter
V1 in 0 AC 1
R1 in n1 50
L1 n1 out 10u
C1 out 0 100n
Rload out 0 1k
.ac dec 100 1k 10Meg
.end
`, s = (m) => document.getElementById("spice-" + m), M = s("app");
if (M) {
  let L = function() {
    h = "", E(), g.textContent = "Input changed — generate to refresh the schematic.";
  }, O = function(e) {
    a.replaceChildren();
    for (const { severity: r, line: u, message: w } of e) {
      const p = document.createElement("li");
      p.className = r, p.textContent = `${r.toUpperCase()}${u ? " · line " + u : ""}: ${w}`, a.append(p);
    }
    s("messages").open = e.some((r) => r.severity !== "info"), s("message-count").textContent = `${e.length} message${e.length === 1 ? "" : "s"}`;
  }, n = function() {
    c.querySelector("svg")?.setAttribute("viewBox", `${t.x} ${t.y} ${t.w} ${t.h}`), s("zoom-level").textContent = Math.round(y.w / t.w * 100) + "%";
  }, l = function(e, r = t.x + t.w / 2, u = t.y + t.h / 2) {
    if (!c.querySelector("svg")) return;
    const w = Math.max(0.05, Math.min(10, t.w * e / y.w)) * y.w / t.w;
    t = { x: r + (t.x - r) * w, y: u + (t.y - u) * w, w: t.w * w, h: t.h * w }, n();
  };
  const m = s("input"), c = s("preview"), g = s("status"), a = s("diagnostics");
  let h = "", d, i = !1, t = { x: 0, y: 0, w: 1, h: 1 }, y = { ...t }, b;
  const E = () => {
    s("copy").disabled = s("download").disabled = !h || i;
  }, R = () => ({ font: s("font").value, fontSize: Number(s("size").value), color: s("color").value });
  m.value = D, m.addEventListener("input", L);
  for (const e of ["font", "size", "color"]) s(e).addEventListener("input", L);
  s("zoom-in").onclick = () => l(0.8), s("zoom-out").onclick = () => l(1.25), s("fit").onclick = () => {
    t = { ...y }, n();
  };
  const o = (e) => {
    const r = c.querySelector("svg");
    return r ? new DOMPoint(e.clientX, e.clientY).matrixTransform(r.getScreenCTM().inverse()) : null;
  };
  c.addEventListener("wheel", (e) => {
    const r = o(e);
    r && (e.preventDefault(), l(e.deltaY > 0 ? 1.12 : 1 / 1.12, r.x, r.y));
  }, { passive: !1 }), c.addEventListener("pointerdown", (e) => {
    e.button !== 0 || !c.querySelector("svg") || (b = { start: o(e), x: e.clientX, y: e.clientY, view: { ...t }, moved: !1 }, c.setPointerCapture(e.pointerId));
  }), c.addEventListener("pointermove", (e) => {
    if (!b) return;
    const r = o(e);
    Math.hypot(e.clientX - b.x, e.clientY - b.y) > 4 && (b.moved = !0), t.x += b.start.x - r.x, t.y += b.start.y - r.y, n();
  }), c.addEventListener("pointerup", (e) => {
    if (!b) return;
    const r = b.moved;
    if (b = null, c.hasPointerCapture(e.pointerId) && c.releasePointerCapture(e.pointerId), !r) {
      const u = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-component]"), w = d?.components.find((p) => p.name === u?.dataset.component);
      w && (s("selection").textContent = `${w.raw}
${Object.entries(w.terminals).map(([p, A]) => `${p} → ${A}`).join("   ")}`);
    }
  }), c.addEventListener("pointercancel", () => {
    b = null;
  }), c.addEventListener("keydown", (e) => {
    e.key === "+" || e.key === "=" ? l(0.8) : e.key === "-" ? l(1.25) : e.key.toLowerCase() === "f" ? (t = { ...y }, n()) : e.key.startsWith("Arrow") && (e.preventDefault(), t.x += ({ ArrowLeft: -0.08, ArrowRight: 0.08 }[e.key] || 0) * t.w, t.y += ({ ArrowUp: -0.08, ArrowDown: 0.08 }[e.key] || 0) * t.h, n());
  });
  async function v() {
    if (i) return;
    i = !0, h = "", E(), s("generate").disabled = !0, m.readOnly = !0, s("file").disabled = !0;
    for (const r of M.querySelectorAll("[data-example], select, input[type=number], input[type=color]")) r.disabled = !0;
    g.textContent = "Parsing netlist and routing wires…", c.setAttribute("aria-busy", "true");
    let e = [];
    try {
      if (d = V(m.value), e = d.diagnostics, O(e), e.some((f) => f.severity === "error")) throw Error("Fix the parser errors below before generating.");
      const r = q(d), u = await F(r, R()), w = new DOMParser().parseFromString(u, "image/svg+xml");
      if (w.querySelector("parsererror")) throw Error("Renderer produced invalid SVG.");
      const p = w.documentElement;
      if (p.localName !== "svg" || p.querySelector("script,foreignObject")) throw Error("Invalid schematic output.");
      const A = Number(p.getAttribute("width")), k = Number(p.getAttribute("height"));
      y = { x: -20, y: -20, w: A + 40, h: k + 40 }, t = { ...y }, p.setAttribute("viewBox", `${y.x} ${y.y} ${y.w} ${y.h}`), p.setAttribute("width", String(y.w)), p.setAttribute("height", String(y.h)), p.setAttribute("role", "img"), p.setAttribute("aria-label", d.title || "SPICE schematic"), p.setAttribute("style", "background:white");
      for (const f of d.components) {
        const C = w.getElementById("cell_" + f.name);
        if (!C) throw Error("Renderer omitted component " + f.name);
        C.setAttribute("data-component", f.name);
        const x = w.createElementNS(p.namespaceURI, "title");
        x.textContent = f.raw + `
` + Object.entries(f.terminals).map(([N, j]) => N + ": " + j).join(", "), C.prepend(x);
      }
      for (const f of Object.values(d.nodes))
        for (const C of p.querySelectorAll(".net_" + f.bit)) {
          C.setAttribute("data-net", f.name);
          const x = w.createElementNS(p.namespaceURI, "title");
          x.textContent = "Node " + f.displayName, C.append(x);
        }
      h = new XMLSerializer().serializeToString(p), s("source").value = h, c.replaceChildren(document.importNode(p, !0)), n();
      const P = e.filter((f) => f.severity === "warning").length;
      g.textContent = `${d.components.length} components · ${Object.keys(d.nodes).length} nodes${P ? " · Review " + P + " warning(s); drawing may be partial." : " · Schematic ready."}`;
      const I = Object.values(d.nodes).map((f) => {
        const C = document.createElement("tr");
        for (const x of [f.displayName, f.terminals.map((N) => N.component + "." + N.pin).join(", ")]) {
          const N = document.createElement("td");
          N.textContent = x, C.append(N);
        }
        return C;
      });
      s("nets").replaceChildren(...I), s("json").value = JSON.stringify({ circuit: d, netlist: r }, null, 2), s("selection").textContent = "Click a component to inspect its original statement and pin connections.";
    } catch (r) {
      c.replaceChildren(), h = "", s("source").value = "", s("json").value = "", s("nets").replaceChildren(), s("selection").textContent = "", g.textContent = r.message, e.some((u) => u.severity === "error") || e.push({ severity: "error", line: 0, message: r.message }), O(e);
    } finally {
      i = !1, s("generate").disabled = !1, m.readOnly = !1, s("file").disabled = !1;
      for (const r of M.querySelectorAll("[data-example], select, input[type=number], input[type=color]")) r.disabled = !1;
      c.setAttribute("aria-busy", "false"), E();
    }
  }
  s("generate").onclick = v;
  for (const e of M.querySelectorAll("[data-example]")) e.onclick = () => {
    m.value = e.dataset.example === "mixed" ? z : D, L(), v();
  };
  s("file").onchange = async (e) => {
    const r = e.target.files[0];
    if (r) {
      if (r.size > 5e5) {
        g.textContent = "File exceeds 500 kB.";
        return;
      }
      try {
        m.value = await r.text(), L(), v();
      } catch (u) {
        g.textContent = "File could not be read: " + u.message;
      } finally {
        e.target.value = "";
      }
    }
  }, s("download").onclick = () => {
    const e = URL.createObjectURL(new Blob([h], { type: "image/svg+xml;charset=utf-8" })), r = document.createElement("a");
    r.href = e, r.download = "spice-schematic.svg", r.click(), setTimeout(() => URL.revokeObjectURL(e), 1e3);
  }, s("copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(h), g.textContent = "SVG source copied to clipboard.";
    } catch {
      s("source-details").open = !0, s("source").focus(), s("source").select(), g.textContent = "Clipboard unavailable. SVG source selected — press Ctrl+C / ⌘C.";
    }
  }, v();
}
