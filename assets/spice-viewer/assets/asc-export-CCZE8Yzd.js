import { e as Je, l as ne, n as ve, b as me, p as He } from "./ui-BJy7zfKu.js";
var q = Uint8Array, Y = Uint16Array, Me = Int32Array, Ce = new q([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), Ee = new q([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), Le = new q([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Be = function(e, n) {
  for (var r = new Y(31), o = 0; o < 31; ++o)
    r[o] = n += 1 << e[o - 1];
  for (var s = new Me(r[30]), o = 1; o < 30; ++o)
    for (var a = r[o]; a < r[o + 1]; ++a)
      s[a] = a - r[o] << 5 | o;
  return { b: r, r: s };
}, ze = Be(Ce, 2), Qe = ze.b, xe = ze.r;
Qe[28] = 258, xe[258] = 28;
var Ze = Be(Ee, 0), ke = Ze.r, we = new Y(32768);
for (var z = 0; z < 32768; ++z) {
  var K = (z & 43690) >> 1 | (z & 21845) << 1;
  K = (K & 52428) >> 2 | (K & 13107) << 2, K = (K & 61680) >> 4 | (K & 3855) << 4, we[z] = ((K & 65280) >> 8 | (K & 255) << 8) >> 1;
}
var ae = (function(e, n, r) {
  for (var o = e.length, s = 0, a = new Y(n); s < o; ++s)
    e[s] && ++a[e[s] - 1];
  var f = new Y(n);
  for (s = 1; s < n; ++s)
    f[s] = f[s - 1] + a[s - 1] << 1;
  var x;
  if (r) {
    x = new Y(1 << n);
    var m = 15 - n;
    for (s = 0; s < o; ++s)
      if (e[s])
        for (var b = s << 4 | e[s], c = n - e[s], M = f[e[s] - 1]++ << c, $ = M | (1 << c) - 1; M <= $; ++M)
          x[we[M] >> m] = b;
  } else
    for (x = new Y(o), s = 0; s < o; ++s)
      e[s] && (x[s] = we[f[e[s] - 1]++] >> 15 - e[s]);
  return x;
}), Q = new q(288);
for (var z = 0; z < 144; ++z)
  Q[z] = 8;
for (var z = 144; z < 256; ++z)
  Q[z] = 9;
for (var z = 256; z < 280; ++z)
  Q[z] = 7;
for (var z = 280; z < 288; ++z)
  Q[z] = 8;
var ce = new q(32);
for (var z = 0; z < 32; ++z)
  ce[z] = 5;
var en = /* @__PURE__ */ ae(Q, 9, 0), nn = /* @__PURE__ */ ae(ce, 5, 0), Ue = function(e) {
  return (e + 7) / 8 | 0;
}, Ve = function(e, n, r) {
  return (r == null || r > e.length) && (r = e.length), new q(e.subarray(n, r));
}, tn = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], ue = function(e, n, r) {
  var o = new Error(n || tn[e]);
  if (o.code = e, Error.captureStackTrace && Error.captureStackTrace(o, ue), !r)
    throw o;
  return o;
}, X = function(e, n, r) {
  r <<= n & 7;
  var o = n / 8 | 0;
  e[o] |= r, e[o + 1] |= r >> 8;
}, te = function(e, n, r) {
  r <<= n & 7;
  var o = n / 8 | 0;
  e[o] |= r, e[o + 1] |= r >> 8, e[o + 2] |= r >> 16;
}, ge = function(e, n) {
  for (var r = [], o = 0; o < e.length; ++o)
    e[o] && r.push({ s: o, f: e[o] });
  var s = r.length, a = r.slice();
  if (!s)
    return { t: Fe, l: 0 };
  if (s == 1) {
    var f = new q(r[0].s + 1);
    return f[r[0].s] = 1, { t: f, l: 1 };
  }
  r.sort(function(l, v) {
    return l.f - v.f;
  }), r.push({ s: -1, f: 25001 });
  var x = r[0], m = r[1], b = 0, c = 1, M = 2;
  for (r[0] = { s: -1, f: x.f + m.f, l: x, r: m }; c != s - 1; )
    x = r[r[b].f < r[M].f ? b++ : M++], m = r[b != c && r[b].f < r[M].f ? b++ : M++], r[c++] = { s: -1, f: x.f + m.f, l: x, r: m };
  for (var $ = a[0].s, o = 1; o < s; ++o)
    a[o].s > $ && ($ = a[o].s);
  var i = new Y($ + 1), u = ye(r[c - 1], i, 0);
  if (u > n) {
    var o = 0, L = 0, N = u - n, R = 1 << N;
    for (a.sort(function(v, w) {
      return i[w.s] - i[v.s] || v.f - w.f;
    }); o < s; ++o) {
      var k = a[o].s;
      if (i[k] > n)
        L += R - (1 << u - i[k]), i[k] = n;
      else
        break;
    }
    for (L >>= N; L > 0; ) {
      var O = a[o].s;
      i[O] < n ? L -= 1 << n - i[O]++ - 1 : ++o;
    }
    for (; o >= 0 && L; --o) {
      var h = a[o].s;
      i[h] == n && (--i[h], ++L);
    }
    u = n;
  }
  return { t: new q(i), l: u };
}, ye = function(e, n, r) {
  return e.s == -1 ? Math.max(ye(e.l, n, r + 1), ye(e.r, n, r + 1)) : n[e.s] = r;
}, Ne = function(e) {
  for (var n = e.length; n && !e[--n]; )
    ;
  for (var r = new Y(++n), o = 0, s = e[0], a = 1, f = function(m) {
    r[o++] = m;
  }, x = 1; x <= n; ++x)
    if (e[x] == s && x != n)
      ++a;
    else {
      if (!s && a > 2) {
        for (; a > 138; a -= 138)
          f(32754);
        a > 2 && (f(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
      } else if (a > 3) {
        for (f(s), --a; a > 6; a -= 6)
          f(8304);
        a > 2 && (f(a - 3 << 5 | 8208), a = 0);
      }
      for (; a--; )
        f(s);
      a = 1, s = e[x];
    }
  return { c: r.subarray(0, o), n };
}, re = function(e, n) {
  for (var r = 0, o = 0; o < n.length; ++o)
    r += e[o] * n[o];
  return r;
}, We = function(e, n, r) {
  var o = r.length, s = Ue(n + 2);
  e[s] = o & 255, e[s + 1] = o >> 8, e[s + 2] = e[s] ^ 255, e[s + 3] = e[s + 1] ^ 255;
  for (var a = 0; a < o; ++a)
    e[s + a + 4] = r[a];
  return (s + 4 + o) * 8;
}, Ie = function(e, n, r, o, s, a, f, x, m, b, c) {
  X(n, c++, r), ++s[256];
  for (var M = ge(s, 15), $ = M.t, i = M.l, u = ge(a, 15), L = u.t, N = u.l, R = Ne($), k = R.c, O = R.n, h = Ne(L), l = h.c, v = h.n, w = new Y(19), y = 0; y < k.length; ++y)
    ++w[k[y] & 31];
  for (var y = 0; y < l.length; ++y)
    ++w[l[y] & 31];
  for (var E = ge(w, 7), B = E.t, W = E.l, U = 19; U > 4 && !B[Le[U - 1]]; --U)
    ;
  var d = b + 5 << 3, S = re(s, Q) + re(a, ce) + f, P = re(s, $) + re(a, L) + f + 14 + 3 * U + re(w, B) + 2 * w[16] + 3 * w[17] + 7 * w[18];
  if (m >= 0 && d <= S && d <= P)
    return We(n, c, e.subarray(m, m + b));
  var D, t, p, g;
  if (X(n, c, 1 + (P < S)), c += 2, P < S) {
    D = ae($, i, 0), t = $, p = ae(L, N, 0), g = L;
    var T = ae(B, W, 0);
    X(n, c, O - 257), X(n, c + 5, v - 1), X(n, c + 10, U - 4), c += 14;
    for (var y = 0; y < U; ++y)
      X(n, c + 3 * y, B[Le[y]]);
    c += 3 * U;
    for (var A = [k, l], _ = 0; _ < 2; ++_)
      for (var I = A[_], y = 0; y < I.length; ++y) {
        var C = I[y] & 31;
        X(n, c, T[C]), c += B[C], C > 15 && (X(n, c, I[y] >> 5 & 127), c += I[y] >> 12);
      }
  } else
    D = en, t = Q, p = nn, g = ce;
  for (var y = 0; y < x; ++y) {
    var j = o[y];
    if (j > 255) {
      var C = j >> 18 & 31;
      te(n, c, D[C + 257]), c += t[C + 257], C > 7 && (X(n, c, j >> 23 & 31), c += Ce[C]);
      var V = j & 31;
      te(n, c, p[V]), c += g[V], V > 3 && (te(n, c, j >> 5 & 8191), c += Ee[V]);
    } else
      te(n, c, D[j]), c += t[j];
  }
  return te(n, c, D[256]), c + t[256];
}, rn = /* @__PURE__ */ new Me([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), Fe = /* @__PURE__ */ new q(0), on = function(e, n, r, o, s, a) {
  var f = a.z || e.length, x = new q(o + f + 5 * (1 + Math.ceil(f / 7e3)) + s), m = x.subarray(o, x.length - s), b = a.l, c = (a.r || 0) & 7;
  if (n) {
    c && (m[0] = a.r >> 3);
    for (var M = rn[n - 1], $ = M >> 13, i = M & 8191, u = (1 << r) - 1, L = a.p || new Y(32768), N = a.h || new Y(u + 1), R = Math.ceil(r / 3), k = 2 * R, O = function(he) {
      return (e[he] ^ e[he + 1] << R ^ e[he + 2] << k) & u;
    }, h = new Me(25e3), l = new Y(288), v = new Y(32), w = 0, y = 0, E = a.i || 0, B = 0, W = a.w || 0, U = 0; E + 2 < f; ++E) {
      var d = O(E), S = E & 32767, P = N[d];
      if (L[S] = P, N[d] = S, W <= E) {
        var D = f - E;
        if ((w > 7e3 || B > 24576) && (D > 423 || !b)) {
          c = Ie(e, m, 0, h, l, v, y, B, U, E - U, c), B = w = y = 0, U = E;
          for (var t = 0; t < 286; ++t)
            l[t] = 0;
          for (var t = 0; t < 30; ++t)
            v[t] = 0;
        }
        var p = 2, g = 0, T = i, A = S - P & 32767;
        if (D > 2 && d == O(E - A))
          for (var _ = Math.min($, D) - 1, I = Math.min(32767, E), C = Math.min(258, D); A <= I && --T && S != P; ) {
            if (e[E + p] == e[E + p - A]) {
              for (var j = 0; j < C && e[E + j] == e[E + j - A]; ++j)
                ;
              if (j > p) {
                if (p = j, g = A, j > _)
                  break;
                for (var V = Math.min(A, j - 2), J = 0, t = 0; t < V; ++t) {
                  var H = E - A + t & 32767, se = L[H], Se = H - se & 32767;
                  Se > J && (J = Se, P = H);
                }
              }
            }
            S = P, P = L[S], A += S - P & 32767;
          }
        if (g) {
          h[B++] = 268435456 | xe[p] << 18 | ke[g];
          var Ae = xe[p] & 31, $e = ke[g] & 31;
          y += Ce[Ae] + Ee[$e], ++l[257 + Ae], ++v[$e], W = E + p, ++w;
        } else
          h[B++] = e[E], ++l[e[E]];
      }
    }
    for (E = Math.max(E, W); E < f; ++E)
      h[B++] = e[E], ++l[e[E]];
    c = Ie(e, m, b, h, l, v, y, B, U, E - U, c), b || (a.r = c & 7 | m[c / 8 | 0] << 3, c -= 7, a.h = N, a.p = L, a.i = E, a.w = W);
  } else {
    for (var E = a.w || 0; E < f + b; E += 65535) {
      var de = E + 65535;
      de >= f && (m[c / 8 | 0] = b, de = f), c = We(m, c + 1, e.subarray(E, de));
    }
    a.i = f;
  }
  return Ve(x, 0, o + Ue(c) + s);
}, an = /* @__PURE__ */ (function() {
  for (var e = new Int32Array(256), n = 0; n < 256; ++n) {
    for (var r = n, o = 9; --o; )
      r = (r & 1 && -306674912) ^ r >>> 1;
    e[n] = r;
  }
  return e;
})(), sn = function() {
  var e = -1;
  return {
    p: function(n) {
      for (var r = e, o = 0; o < n.length; ++o)
        r = an[r & 255 ^ n[o]] ^ r >>> 8;
      e = r;
    },
    d: function() {
      return ~e;
    }
  };
}, ln = function(e, n, r, o, s) {
  if (!s && (s = { l: 1 }, n.dictionary)) {
    var a = n.dictionary.subarray(-32768), f = new q(a.length + e.length);
    f.set(a), f.set(e, a.length), e = f, s.w = a.length;
  }
  return on(e, n.level == null ? 6 : n.level, n.mem == null ? s.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + n.mem, r, o, s);
}, qe = function(e, n) {
  var r = {};
  for (var o in e)
    r[o] = e[o];
  for (var o in n)
    r[o] = n[o];
  return r;
}, F = function(e, n, r) {
  for (; r; ++n)
    e[n] = r, r >>>= 8;
};
function cn(e, n) {
  return ln(e, n || {}, 0, 0);
}
var Ye = function(e, n, r, o) {
  for (var s in e) {
    var a = e[s], f = n + s, x = o;
    Array.isArray(a) && (x = qe(o, a[1]), a = a[0]), a instanceof q ? r[f] = [a, x] : (r[f += "/"] = [new q(0), x], Ye(a, f, r, o));
  }
}, Oe = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), fn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), pn = 0;
try {
  fn.decode(Fe, { stream: !0 }), pn = 1;
} catch {
}
function ee(e, n) {
  var r;
  if (Oe)
    return Oe.encode(e);
  for (var o = e.length, s = new q(e.length + (e.length >> 1)), a = 0, f = function(b) {
    s[a++] = b;
  }, r = 0; r < o; ++r) {
    if (a + 5 > s.length) {
      var x = new q(a + 8 + (o - r << 1));
      x.set(s), s = x;
    }
    var m = e.charCodeAt(r);
    m < 128 || n ? f(m) : m < 2048 ? (f(192 | m >> 6), f(128 | m & 63)) : m > 55295 && m < 57344 ? (m = 65536 + (m & 1047552) | e.charCodeAt(++r) & 1023, f(240 | m >> 18), f(128 | m >> 12 & 63), f(128 | m >> 6 & 63), f(128 | m & 63)) : (f(224 | m >> 12), f(128 | m >> 6 & 63), f(128 | m & 63));
  }
  return Ve(s, 0, a);
}
var be = function(e) {
  var n = 0;
  if (e)
    for (var r in e) {
      var o = e[r].length;
      o > 65535 && ue(9), n += o + 4;
    }
  return n;
}, je = function(e, n, r, o, s, a, f, x) {
  var m = o.length, b = r.extra, c = x && x.length, M = be(b);
  F(e, n, f != null ? 33639248 : 67324752), n += 4, f != null && (e[n++] = 20, e[n++] = r.os), e[n] = 20, n += 2, e[n++] = r.flag << 1 | (a < 0 && 8), e[n++] = s && 8, e[n++] = r.compression & 255, e[n++] = r.compression >> 8;
  var $ = new Date(r.mtime == null ? Date.now() : r.mtime), i = $.getFullYear() - 1980;
  if ((i < 0 || i > 119) && ue(10), F(e, n, i << 25 | $.getMonth() + 1 << 21 | $.getDate() << 16 | $.getHours() << 11 | $.getMinutes() << 5 | $.getSeconds() >> 1), n += 4, a != -1 && (F(e, n, r.crc), F(e, n + 4, a < 0 ? -a - 2 : a), F(e, n + 8, r.size)), F(e, n + 12, m), F(e, n + 14, M), n += 16, f != null && (F(e, n, c), F(e, n + 6, r.attrs), F(e, n + 10, f), n += 14), e.set(o, n), n += m, M)
    for (var u in b) {
      var L = b[u], N = L.length;
      F(e, n, +u), F(e, n + 2, N), e.set(L, n + 4), n += 4 + N;
    }
  return c && (e.set(x, n), n += c), n;
}, un = function(e, n, r, o, s) {
  F(e, n, 101010256), F(e, n + 8, r), F(e, n + 10, r), F(e, n + 12, o), F(e, n + 16, s);
};
function dn(e, n) {
  n || (n = {});
  var r = {}, o = [];
  Ye(e, "", r, n);
  var s = 0, a = 0;
  for (var f in r) {
    var x = r[f], m = x[0], b = x[1], c = b.level == 0 ? 0 : 8, M = ee(f), $ = M.length, i = b.comment, u = i && ee(i), L = u && u.length, N = be(b.extra);
    $ > 65535 && ue(11);
    var R = c ? cn(m, b) : m, k = R.length, O = sn();
    O.p(m), o.push(qe(b, {
      size: m.length,
      crc: O.d(),
      c: R,
      f: M,
      m: u,
      u: $ != f.length || u && i.length != L,
      o: s,
      compression: c
    })), s += 30 + $ + N + k, a += 76 + 2 * ($ + N) + (L || 0) + k;
  }
  for (var h = new q(a + 22), l = s, v = a - s, w = 0; w < o.length; ++w) {
    var M = o[w];
    je(h, M.o, M, M.f, M.u, M.c.length);
    var y = 30 + M.f.length + be(M.extra);
    h.set(M.c, M.o + y), je(h, s, M, M.f, M.u, M.c.length, M.o, M.m), s += 16 + y + (M.m ? M.m.length : 0);
  }
  return un(h, s, o.length, v, l), h;
}
const fe = (e) => Math.round(Number(e) * 1e3) / 1e3, Z = (e) => fe(e.x) + "," + fe(e.y), G = (e, n) => Math.abs(e - n) < 2e-3, Te = (e, n, r) => e >= Math.min(n, r) - 2e-3 && e <= Math.max(n, r) + 2e-3, oe = (e, n) => G(n.a.x, n.b.x) ? G(e.x, n.a.x) && Te(e.y, n.a.y, n.b.y) : G(e.y, n.a.y) && Te(e.x, n.a.x, n.b.x), _e = (e, n) => Math.abs(e.x - n.x) + Math.abs(e.y - n.y);
function hn(e, n = [], r = []) {
  const o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), f = (l) => {
    const v = { x: fe(l.x), y: fe(l.y) };
    return o.set(Z(v), v), Z(v);
  };
  for (const l of e)
    f(l.a), f(l.b);
  const x = n.map(f);
  for (const l of r)
    s.add(f(l.a)), s.add(f(l.b)), a.add([Z(l.a), Z(l.b)].sort().join("|"));
  for (let l = 0; l < e.length; l++) for (let v = l + 1; v < e.length; v++) {
    const w = e[l], y = e[v], E = G(w.a.x, w.b.x), B = G(y.a.x, y.b.x);
    if (E === B) continue;
    const W = E ? w : y, U = E ? y : w, d = { x: W.a.x, y: U.a.y };
    oe(d, W) && oe(d, U) && f(d);
  }
  const m = /* @__PURE__ */ new Map();
  for (const l of e) {
    const v = [...o.values()].filter((w) => oe(w, l)).sort((w, y) => w.x - y.x || w.y - y.y);
    for (let w = 1; w < v.length; w++) {
      const y = Z(v[w - 1]), E = Z(v[w]);
      y !== E && m.set([y, E].sort().join("|"), { a: y, b: E, length: _e(v[w - 1], v[w]) });
    }
  }
  const b = new Map([...o.keys()].map((l) => [l, l])), c = (l) => {
    let v = l;
    for (; b.get(v) !== v; ) v = b.get(v);
    for (; l !== v; ) {
      const w = b.get(l);
      b.set(l, v), l = w;
    }
    return v;
  }, M = (l) => a.has([l.a, l.b].sort().join("|")) || r.some((v) => oe(o.get(l.a), v) && oe(o.get(l.b), v)), $ = [...m.entries()].sort(([l, v], [w, y]) => Number(M(y)) - Number(M(v)) || v.length - y.length || l.localeCompare(w)), i = new Map([...o.keys()].map((l) => [l, /* @__PURE__ */ new Set()]));
  let u = 0;
  for (const [, l] of $) {
    const v = c(l.a), w = c(l.b);
    if (v === w) {
      u++;
      continue;
    }
    b.set(v, w), i.get(l.a).add(l.b), i.get(l.b).add(l.a);
  }
  if (x.length > 1 && x.some((l) => c(l) !== c(x[0]))) throw Error("Geometric net cleanup found disconnected terminals.");
  const L = /* @__PURE__ */ new Set([...x, ...s]), N = [...i].filter(([l, v]) => v.size === 1 && !L.has(l)).map(([l]) => l);
  let R = 0;
  for (; N.length; ) {
    const l = N.pop();
    if (L.has(l) || i.get(l).size !== 1) continue;
    const v = [...i.get(l)][0];
    i.get(l).clear(), i.get(v).delete(l), R++, i.get(v).size === 1 && !L.has(v) && N.push(v);
  }
  for (const [l, v] of i) if (v.size === 2 && !L.has(l)) {
    const [w, y] = [...v], E = o.get(w), B = o.get(l), W = o.get(y);
    (G(E.x, B.x) && G(B.x, W.x) || G(E.y, B.y) && G(B.y, W.y)) && (i.get(w).delete(l), i.get(y).delete(l), i.get(w).add(y), i.get(y).add(w), v.clear());
  }
  const k = [], O = /* @__PURE__ */ new Set();
  for (const [l, v] of i) for (const w of v) {
    const y = [l, w].sort().join("|");
    O.has(y) || (O.add(y), k.push({ a: o.get(l), b: o.get(w) }));
  }
  const h = new Set(x);
  return { segments: k, junctions: [...i].filter(([l, v]) => v.size >= 3 || v.size >= 2 && h.has(l)).map(([l]) => o.get(l)), cyclesRemoved: u, leavesRemoved: R, wireLength: k.reduce((l, v) => l + _e(v.a, v.b), 0) };
}
const Xe = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ie = (e, n, r) => e.replace(new RegExp("(?<![\\w./%:$])" + Xe(n) + "(?![\\w./%:$])", "gi"), () => r);
function vn(e, n) {
  n.localScope && (e = Je(e.ir, { isolate: n.focus }));
  const r = n.components.filter((t) => !t.synthetic), o = ne(e.root), s = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), f = r.filter((t) => t.kind === "X"), x = /* @__PURE__ */ new Set(), m = (t, p) => {
    let g = p.includes("/") ? t + "_" + p.replaceAll("/", "_") : p;
    g = g.replace(/[^a-z0-9_.$@&Ö]/gi, "_"), g.toUpperCase().startsWith(t) || (g = t + "_" + g);
    const T = g;
    let A = 1;
    for (; x.has(g.toLowerCase()); ) g = T + "_" + A++;
    return x.add(g.toLowerCase()), g;
  };
  o.forEach((t) => s.set(t.name, m(t.kind, t.name)));
  const b = new Map(f.map((t) => [t.name, m("X", t.name)])), c = new Map(f.map((t, p) => [t.name, "CV_BLOCK_" + p]));
  o.forEach((t) => a.set(t.name, ""));
  for (const t of f) for (const p of ne(e.contexts[t.instanceId])) a.set(p.name, t.name);
  const M = (t) => /^(?:[a-z_][\w.$-]*|\d+)$/i.test(t), $ = new Set([...o.flatMap((t) => Object.values(t.terminals)), ...Object.keys(n.nodes)].filter(M).map((t) => t.toLowerCase())), i = /* @__PURE__ */ new Map([["0", "0"]]), u = /* @__PURE__ */ new Set(["0"]);
  let L = 1;
  const N = (t) => {
    if (!i.has(t)) {
      let p = t;
      if (!M(t) || u.has(t.toLowerCase()))
        do
          p = "N_cv" + L++;
        while ($.has(p.toLowerCase()) || u.has(p.toLowerCase()));
      i.set(t, p), u.add(p.toLowerCase());
    }
    return i.get(t);
  };
  for (const t of o) Object.values(t.terminals).forEach(N);
  Object.keys(n.nodes).forEach(N);
  const R = /* @__PURE__ */ new Map();
  for (const t of f) {
    const p = new Set(t.block.ports.map((g) => g.node));
    for (const g of ne(e.contexts[t.instanceId])) for (const T of Object.values(g.terminals)) !p.has(T) && T !== "0" && !e.ir.globals.some((A) => ve([], A) === T) && R.set(T, t.name);
  }
  const k = new Map(f.map((t) => [t.name, new Map(t.block.ports.map((p, g) => [p.node, "p" + g]).reverse())])), O = (t, p = "") => {
    if (t === "0") return "0";
    if (k.get(p)?.has(t)) return k.get(p).get(t);
    const g = R.get(t);
    if (p && g && g !== p) throw Error("ASC export: cross-block internal node probe requires expanding both instances: " + t);
    return g && g !== p ? b.get(g) + ":" + N(t) : N(t);
  }, h = (t, p = "") => {
    if (!s.has(t)) throw Error("ASC: unresolved device reference " + t);
    const g = a.get(t);
    if (p && g !== p) throw Error("ASC export: cross-block current probe requires expanding both instances: " + t);
    return g && g !== p ? b.get(g) + ":" + s.get(t) : s.get(t);
  }, l = /* @__PURE__ */ new Map();
  function v(t, p = {}) {
    const g = e.ir.scopes[t.scopeId];
    let T;
    if (!t.id) T = Object.fromEntries(Object.keys(t.params).map((A) => [A, A]));
    else {
      const A = e.contexts[t.path.slice(0, -1).map(encodeURIComponent).join("/")], _ = e.ir.scopes[A.scopeId].instances.find((I) => I.name === t.path.at(-1));
      T = He(p, g.defaults, g.parameters, _.parameters);
    }
    l.set(t.id, T), t.children.forEach((A) => v(A, T));
  }
  v(e.root);
  const w = (t, p) => {
    const g = t.ports.find((_) => _.name.toLowerCase() === p.toLowerCase());
    if (g) return g.node;
    const T = t.nodes[p.toLowerCase()];
    if (T) return T;
    if (e.ir.globals.includes(p.toLowerCase())) return ve([], p);
    const A = p.split(":");
    if (A.length > 1) {
      const _ = A.pop(), I = [...t.path, ...A].map(encodeURIComponent).join("/"), C = e.contexts[I] || e.contexts[A.map(encodeURIComponent).join("/")];
      if (C) return w(C, _);
    }
    return ve(t.path, p);
  }, y = (t, p) => {
    const g = t.devices.find((A) => A.localName.toLowerCase() === p.toLowerCase());
    if (g) return g.name;
    const T = p.split(":");
    if (T.length > 1) {
      const A = T.pop(), _ = [...t.path, ...T].map(encodeURIComponent).join("/"), C = (e.contexts[_] || e.contexts[T.map(encodeURIComponent).join("/")])?.devices.find((j) => j.localName.toLowerCase() === A.toLowerCase());
      if (C) return C.name;
    }
    throw Error("ASC: unsupported device reference " + p);
  }, E = new Map(Object.keys(n.models).map((t, p) => [t, "CV_MODEL_" + p]));
  function B(t, p) {
    const g = e.contexts[t.instanceId], T = e.ir.scopes[g.scopeId].devices.find((C) => C.name === t.localName), A = [], _ = (C) => "__CV_PROBE_" + (A.push(C) - 1) + "__";
    let I = me(T.value, l.get(g.id), (C) => _(O(w(g, C), p)), (C) => _(h(y(g, C), p)));
    if (T.model && (I = ie(I, T.model, E.get(t.model) || t.model)), I = I.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (C, j, V) => j + "(" + V.split(",").map((J) => {
      const H = J.trim(), se = /^__CV_PROBE_(\d+)__$/.exec(H);
      return se ? A[+se[1]] : j.toLowerCase() === "v" ? O(w(g, H), p) : h(y(g, H), p);
    }).join(",") + ")"), (T.controlSources || []).forEach((C, j) => {
      I = ie(I, C, h(t.controlSources[j], p));
    }), t.kind === "@") for (const [C, j] of Object.entries(t.terminals)) ["REFNODE", "INTNODE"].includes(C) && (I = I.replace(new RegExp("\\b" + C + "\\s*=\\s*[^\\s]+", "i"), C.toLowerCase() + "=" + O(j, p)));
    return I;
  }
  const W = /* @__PURE__ */ new Map(), U = e.ir.diagnostics.filter((t) => t.severity === "warning").map((t) => t.message);
  function d(t, p = "") {
    if (t.kind === "X") {
      const C = t.block.ports.map((j) => O(j.node, p));
      return { ref: b.get(t.name), kind: "X", pins: t.block.ports.map((j) => j.pin), nodes: C, value: c.get(t.name), line: [b.get(t.name), ...C, c.get(t.name)].join(" ") };
    }
    const g = s.get(t.name), T = Object.entries(t.terminals);
    if (t.kind === "K") {
      const C = B(t, p).split(" · k=").at(-1), j = [g, ...t.coupledInductors.map((V) => h(V, p)), C].join(" ");
      return { ref: g, kind: "K", pins: [], nodes: [], value: C, line: j, directive: !0 };
    }
    let A = B(t, p), _ = T.map(([C]) => C), I = T.map(([, C]) => O(C, p));
    if (["E", "G"].includes(t.kind) && t.sourceMode === "POLY") {
      const C = /^POLY\(\d+\)\s*/i.exec(A);
      if (!C) throw Error("ASC: invalid POLY source " + t.name);
      A = C[0] + I.slice(2).join(" ") + " " + A.slice(C[0].length), _ = _.slice(0, 2), I = I.slice(0, 2), U.push(t.name + ": POLY control nodes remain explicit in the editable Value expression.");
    }
    return t.kind === "@" && (_ = _.slice(0, 2), I = I.slice(0, 2)), { ref: g, kind: t.kind, prefix: t.kind === "M" ? t.type.includes("pmos") ? "MP" : "MN" : t.kind, pins: _, nodes: I, electricalNodes: T.map(([, C]) => O(C, p)), value: A, line: [g, ...I, A].filter(Boolean).join(" ") };
  }
  r.forEach((t) => W.set(t.name, d(t)));
  const S = [], P = [];
  for (const t of f) {
    S.push(".subckt " + c.get(t.name) + " " + t.block.ports.map((p, g) => "p" + g).join(" "));
    for (const p of ne(e.contexts[t.instanceId])) {
      const g = d(p, t.name);
      S.push(g.line), P.push({ original: p.name, scope: t.name, ...g });
    }
    S.push(".ends " + c.get(t.name));
  }
  for (const [t, p] of Object.entries(n.models)) {
    const g = e.contexts[p.instanceId], T = e.ir.scopes[g.scopeId], A = decodeURIComponent(t.split("/").at(-1)), _ = T.models[A];
    let I = _ ? me(_.raw, l.get(g.id), (C) => O(w(g, C)), (C) => h(y(g, C))) : p.raw;
    I = I.replace(/^(\.model\s+)\S+/i, (C, j) => j + E.get(t));
    for (const [C, j] of E) I = ie(I, C, j);
    if (p.baseModel) {
      const C = g.path.length ? g.path.map(encodeURIComponent).join("/") + "/" : "";
      I = I.replace(new RegExp("(AKO:)" + Xe(p.baseModel), "i"), (j, V) => V + (E.get(C + p.baseModel.toLowerCase()) || E.get(p.baseModel.toLowerCase()) || p.baseModel));
    }
    S.push(I);
  }
  const D = [];
  for (const t of Object.values(e.contexts))
    if (!(t.id && !ne(t).some((p) => a.has(p.name) && (r.some((g) => g.name === p.name) || f.some((g) => g.name === a.get(p.name))))))
      for (const p of e.ir.scopes[t.scopeId].directives) {
        if (n.localScope && !t.id && !/^\.(?:model|title|param|func|global|options?|tran|ac|op|step|temp)\b/i.test(p.text) || /^\.(?:model|param|global|title)\b/i.test(p.text) && t.id || /^\.(?:model|title)\b/i.test(p.text)) continue;
        if (t.id && !/^\.(?:func|ic|nodeset)\b/i.test(p.text)) throw Error("ASC export: local directive requires scope-preserving export (" + t.id + "): " + p.text);
        if (t.id && /^\.func\b/i.test(p.text)) throw Error("ASC export: local .func requires scope-preserving export (" + t.id + ").");
        const g = [], T = (_) => "__CV_PROBE_" + (g.push(_) - 1) + "__";
        let A = t.id ? me(p.text, l.get(t.id), (_) => T(O(w(t, _))), (_) => T(h(y(t, _)))) : p.text;
        if (A = A.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (_, I, C) => I + "(" + C.split(",").map((j) => {
          const V = j.trim(), J = /^__CV_PROBE_(\d+)__$/.exec(V);
          if (J) return g[+J[1]];
          if (V === "*") return V;
          if (/[*?]/.test(V)) throw Error("ASC export: wildcard probe cannot be renamed reliably: " + V);
          return I.toLowerCase() === "v" ? O(w(t, V)) : h(y(t, V));
        }).join(",") + ")"), /^\.global\b/i.test(A) && (A = ".global " + A.split(/\s+/).slice(1).map((_) => O(w(t, _))).join(" ")), /^\.(?:dc|tf|noise|sens)\b/i.test(A)) for (const _ of t.devices) A = ie(A, _.localName, h(_.name));
        D.push(A);
      }
  return { cards: W, library: S, directives: D, nodeNames: i, refs: s, expected: P, warnings: [...new Set(U)], node: O, blockRefs: b, definitions: c };
}
const le = (e) => e.x + "," + e.y, mn = (e, n) => n.a.x === n.b.x ? e.x === n.a.x && e.y >= Math.min(n.a.y, n.b.y) && e.y <= Math.max(n.a.y, n.b.y) : e.y === n.a.y && e.x >= Math.min(n.a.x, n.b.x) && e.x <= Math.max(n.a.x, n.b.x);
function gn(e) {
  return new TextDecoder(e[0] === 255 && e[1] === 254 ? "utf-16le" : "windows-1252").decode(e);
}
function xn(e, n) {
  const r = [], o = [], s = [], a = [];
  let f;
  for (const i of e.split(/\r?\n/)) {
    let u;
    if (u = /^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(i)) r.push({ a: { x: +u[1], y: +u[2] }, b: { x: +u[3], y: +u[4] } });
    else if (u = /^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(i)) o.push({ x: +u[1], y: +u[2], name: u[3] });
    else if (u = /^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(i))
      f = { symbol: u[1], x: +u[2], y: +u[3], pins: [], value: "", ref: "" }, s.push(f);
    else if (u = /^SYMATTR (InstName|Value) (.*)$/.exec(i)) {
      if (!f) throw Error("ASC attribute without symbol.");
      f[u[1] === "InstName" ? "ref" : "value"] = u[2];
    } else (u = /^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(i)) && a.push(...u[1].split("\\n"));
  }
  for (const i of s) {
    const u = n[i.symbol + ".asy"];
    if (!u) throw Error("Missing ASC companion " + i.symbol + ".asy");
    let L;
    for (const N of gn(u).split(/\r?\n/)) {
      let R;
      (R = /^PIN (-?\d+) (-?\d+) /.exec(N)) ? (L = { x: i.x + +R[1], y: i.y + +R[2] }, i.pins.push(L)) : (R = /^PINATTR SpiceOrder (\d+)$/.exec(N)) ? L.order = +R[1] : (R = /^SYMATTR Prefix (\S+)$/.exec(N)) && (i.prefix = R[1]);
    }
    i.pins.sort((N, R) => N.order - R.order);
  }
  const x = /* @__PURE__ */ new Map();
  for (const i of [...r.flatMap((u) => [u.a, u.b]), ...o, ...s.flatMap((u) => u.pins)]) x.set(le(i), i);
  const m = new Map([...x.keys()].map((i) => [i, i])), b = (i) => (m.get(i) !== i && m.set(i, b(m.get(i))), m.get(i)), c = (i, u) => {
    m.set(b(i), b(u));
  };
  for (const i of r) {
    if (i.a.x !== i.b.x && i.a.y !== i.b.y) throw Error("ASC contains a diagonal wire.");
    for (const [u, L] of x) mn(L, i) && c(le(i.a), u);
  }
  const M = /* @__PURE__ */ new Map();
  for (const i of o) {
    const u = b(le(i));
    if (M.has(u) && M.get(u).toLowerCase() !== i.name.toLowerCase()) throw Error("ASC has a short between " + M.get(u) + " and " + i.name);
    M.set(u, i.name);
  }
  for (const i of s) for (const u of i.pins)
    if (u.node = M.get(b(le(u))), !u.node) throw Error("ASC has an unnamed/disconnected pin on " + i.ref);
  const $ = s.map((i) => [i.ref, ...i.pins.map((u) => u.node), i.value].join(" "));
  return { symbols: s, wires: r, flags: o, directives: a, netlist: ["* Viewer ASC round trip", ...$, ...a, ".end"].join(`
`) };
}
function wn(e, n, r) {
  const o = xn(e, n), s = r.components.filter((f) => !f.directive);
  if (o.symbols.length !== s.length) throw Error("ASC lost or duplicated symbols.");
  let a = 0;
  for (const f of s) {
    const x = o.symbols.find((m) => m.ref === f.ref);
    if (!x || x.value !== f.value || x.prefix !== (f.prefix || f.kind) || JSON.stringify(x.pins.map((m) => m.node)) !== JSON.stringify(f.nodes)) throw Error("ASC component/pin round-trip mismatch: " + f.id);
    a += x.pins.length;
  }
  for (const f of r.components.filter((x) => x.directive)) if (!o.directives.includes(f.line)) throw Error("ASC lost directive device " + f.id);
  return { verified: !0, symbols: s.length, directiveDevices: r.components.length - s.length, pins: a, wires: o.wires.length, namedNets: new Set(o.flags.map((f) => f.name)).size };
}
const yn = (e) => e.x + "," + e.y, Re = (e) => Math.round(e * 1e3) / 1e3, Ge = new Map(Array.from({ length: 256 }, (e, n) => [new TextDecoder("windows-1252").decode(new Uint8Array([n])), n]));
function Pe(e) {
  const n = [];
  for (const r of e) {
    const o = Ge.get(r);
    if (o === void 0) throw Error("LTspice export cannot encode " + r + " (U+" + r.codePointAt(0).toString(16) + ") in Windows-1252.");
    n.push(o);
  }
  return new Uint8Array(n);
}
const Ke = (e) => [...String(e)].map((n) => Ge.has(n) ? n : n === "⏚" ? "GND" : "[U+" + n.codePointAt(0).toString(16) + "]").join(""), pe = (e) => String(e).replace(/[\r\n]/g, " ");
function De(e) {
  const n = [...new Set(e.map(Re))].sort((s, a) => s - a), r = /* @__PURE__ */ new Map();
  let o = -1 / 0;
  for (const s of n) {
    const a = Math.max(o + 16, Math.round(s * 2 / 16) * 16 + 64);
    r.set(s, a), o = a;
  }
  return (s) => {
    const a = r.get(Re(s));
    if (a === void 0) throw Error("Missing layout coordinate.");
    return a;
  };
}
function bn(e, n, r, o) {
  const s = o.x(e.x), a = o.y(e.y), f = o.x(e.x + e.width) - s, x = o.y(e.y + e.height) - a, m = e.ports.map(($) => ({ ...$, x: o.x($.x) - s, y: o.y($.y) - a })), b = ["Version 4", "SymbolType CELL"], c = ($, i) => b.push(`LINE Normal ${Math.round($.x)} ${Math.round($.y)} ${Math.round(i.x)} ${Math.round(i.y)}`), M = m.length === 2 && ["R", "C", "L", "D", "V", "I", "B"].includes(n.kind);
  if (M) {
    const $ = ["D", "V", "I", "B"].includes(n.kind) ? [m.find((l) => l.pin === "+") || m[0], m.find((l) => l.pin === "-") || m[1]] : m, [i, u] = $, L = Math.abs(i.x - u.x) < 0.1, N = { x: (i.x + u.x) / 2, y: (i.y + u.y) / 2 }, R = Math.abs(L ? u.y - i.y : u.x - i.x), k = Math.min(32, R / 4), O = Math.sign(L ? u.y - i.y : u.x - i.x), h = (l, v) => L ? { x: N.x + v, y: N.y + l * O } : { x: N.x + l * O, y: N.y + v };
    if (c(i, h(-k, 0)), c(h(k, 0), u), n.kind === "C")
      c(h(-6, -20), h(-6, 20)), c(h(6, -20), h(6, 20)), c(h(-k, 0), h(-6, 0)), c(h(6, 0), h(k, 0));
    else if (n.kind === "R" || n.kind === "B" && /^\s*R\s*=/i.test(n.value)) {
      const l = [[-k, 0], [-k + 6, 0], [-k + 12, -12], [-k + 22, 12], [-k + 32, -12], [k - 6, 0], [k, 0]];
      for (let v = 1; v < l.length; v++) c(h(...l[v - 1]), h(...l[v]));
    } else if (n.kind === "L") {
      let l = h(-k, 0);
      for (let v = 0; v < 4; v++) for (let w = 1; w <= 8; w++) {
        const y = h(-k + (v + w / 8) * k / 2, 16 * Math.sin(w * Math.PI / 8));
        c(l, y), l = y;
      }
    } else n.kind === "D" ? (c(h(-k, 0), h(-12, 0)), c(h(12, 0), h(k, 0)), c(h(-12, -18), h(-12, 18)), c(h(-12, 18), h(12, 0)), c(h(12, 0), h(-12, -18)), c(h(12, -18), h(12, 18))) : (b.push(`CIRCLE Normal ${Math.round(N.x - 24)} ${Math.round(N.y - 24)} ${Math.round(N.x + 24)} ${Math.round(N.y + 24)}`), c(h(-k, 0), h(-24, 0)), c(h(24, 0), h(k, 0)), n.kind === "I" || n.kind === "B" && /^\s*(?:I|P)\s*=/i.test(n.value) ? (c(h(-12, 0), h(12, 0)), c(h(12, 0), h(4, -7)), c(h(12, 0), h(4, 7))) : (c(h(-12, -6), h(-12, 6)), c(h(-18, 0), h(-6, 0)), c(h(12, -6), h(12, 6))));
  } else {
    b.push(`RECTANGLE Normal 16 16 ${Math.max(32, f - 16)} ${Math.max(32, x - 16)}`);
    for (const i of m) {
      const u = { x: Math.max(16, Math.min(f - 16, i.x)), y: Math.max(16, Math.min(x - 16, i.y)) };
      c(i, u), b.push(`TEXT ${Math.round(u.x + 4)} ${Math.round(u.y + 4)} Left 1 ${pe(Ke(n.block?.ports.find((L) => L.pin === i.pin)?.label || n.pinLabels?.[Object.keys(n.terminals).indexOf(i.pin)] || i.pin))}`);
    }
  }
  M && Math.abs(m[0].x - m[1].x) < 0.1 ? b.push(`WINDOW 0 ${Math.round(m[0].x + 40)} 24 Left 2`, `WINDOW 3 ${Math.round(m[0].x + 40)} 56 Left 2`) : M ? b.push(`WINDOW 0 ${Math.round(f / 2)} 16 Center 2`, `WINDOW 3 ${Math.round(f / 2)} 40 Center 2`) : b.push("WINDOW 0 24 32 Left 2", "WINDOW 3 24 64 Left 2"), b.push("SYMATTR Prefix " + (r.prefix || r.kind));
  for (const [$, i] of r.pins.entries()) {
    const u = m.find((L) => L.pin === i);
    if (!u) throw Error("ASC symbol missing pin " + n.name + "." + i);
    b.push(`PIN ${u.x} ${u.y} NONE 0`, "PINATTR PinName " + pe(i), "PINATTR SpiceOrder " + ($ + 1));
  }
  return b.join(`\r
`) + `\r
`;
}
function Cn({ tree: e, circuit: n, drawing: r, source: o = "", libraries: s = {} }) {
  if (!r) throw Error("ASC export requires a conventional layout. Enable Circuit layout rules and generate again.");
  const a = vn(e, n), f = new Map(n.components.map((d) => [d.name, d]));
  if (r.components.length !== f.size || r.components.some((d) => !f.has(d.id) || d.ports.some((S) => n.nodes[f.get(d.id).terminals[S.pin]]?.bit !== S.bit))) throw Error("ASC: stale layout or mismatched pin/net mapping. Generate again.");
  const x = [], m = [], b = (d) => {
    x.push(d.x), m.push(d.y);
  };
  for (const d of r.components)
    b(d), b({ x: d.x + d.width, y: d.y + d.height }), d.ports.forEach(b);
  r.segments.forEach((d) => {
    b(d.a), b(d.b);
  });
  const c = { x: De(x), y: De(m) }, M = (d) => ({ x: c.x(d.x), y: c.y(d.y) }), $ = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const d of r.components) for (const S of d.ports)
    i.has(S.bit) || i.set(S.bit, []), i.get(S.bit).push(S);
  for (const d of r.segments)
    $.has(d.bit) || $.set(d.bit, []), $.get(d.bit).push(d);
  const u = [];
  for (const [d, S] of i) {
    const P = hn($.get(d) || [], S);
    for (const D of P.segments) u.push({ bit: d, a: M(D.a), b: M(D.b) });
  }
  const L = Math.max(...x.map(c.x)), N = Math.max(...m.map(c.y)), R = ["Version 4", `SHEET 1 ${L + 256} ${N + 512}`], k = /* @__PURE__ */ new Map(), O = {}, h = { version: 1, focus: n.focus, viewScope: n.localScope ? "subcircuit-local" : "top-level", interfaceBindings: n.interfaceBindings || [], interfaceAliases: n.interfaceAliases || [], topology: n.topology.signature, components: [], nodes: [], warnings: a.warnings }, l = (d, S) => {
    const P = yn(d);
    if (k.has(P) && k.get(P) !== S) throw Error("ASC grid would short two nets at " + P);
    k.set(P, S);
  }, v = /* @__PURE__ */ new Set();
  for (const d of r.components) {
    const S = f.get(d.id);
    if (!S) throw Error("Layout snapshot no longer matches circuit.");
    for (const P of d.ports) {
      const D = a.node(S.terminals[P.pin]);
      v.has(D) || (l(M(P), D), v.add(D));
    }
  }
  for (const d of u) R.push(`WIRE ${d.a.x} ${d.a.y} ${d.b.x} ${d.b.y}`);
  for (const [d, S] of k) R.push("FLAG " + d.replace(",", " ") + " " + S);
  let w = 0;
  const y = /* @__PURE__ */ new Map();
  for (const d of r.components) {
    const S = f.get(d.id);
    if (S.synthetic) continue;
    const P = a.cards.get(S.name);
    if (P.directive) {
      R.push(`TEXT ${c.x(d.x)} ${c.y(d.y)} Left 2 !${pe(P.line)}`), h.components.push({ id: S.name, ...P, directive: !0 });
      continue;
    }
    const D = bn(d, S, P, c);
    let t = y.get(D);
    t || (t = "cv_symbol_" + w++, y.set(D, t), O[t + ".asy"] = Pe(D)), R.push(`SYMBOL ${t} ${c.x(d.x)} ${c.y(d.y)} R0`, "SYMATTR InstName " + P.ref, "SYMATTR Value " + pe(P.value)), h.components.push({ id: S.name, ...P, symbol: t, ports: d.ports.map((p) => ({ pin: p.pin, ...M(p), node: a.node(S.terminals[p.pin]) })) });
  }
  const E = [...a.directives, ...a.library];
  if (E.some((d) => d.includes("\\n"))) throw Error("ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.");
  const B = [o, ...Object.values(s)].flatMap((d) => d.split(/\r?\n/).filter((S) => /^\s*\*/.test(S))).map((d) => Ke(d).replaceAll("\\", "/").replace(/^(\s*\*\s*)@layout\b/i, "$1source @layout"));
  (E.length || B.length) && R.push(`TEXT 64 ${N + 160} Left 2 !` + [...E, ...B].map((d) => d.replace(/\r?\n/g, "\\n")).join("\\n"));
  const W = R.join(`\r
`) + `\r
`;
  h.nodes = [...a.nodeNames].map(([d, S]) => ({ original: d, exported: S })), h.leaves = [...a.expected, ...n.components.filter((d) => !d.synthetic && d.kind !== "X").map((d) => ({ original: d.name, scope: "", ...a.cards.get(d.name) }))], h.blocks = [...a.blockRefs].map(([d, S]) => ({ original: d, ref: S, ltspiceRef: "X§" + S }));
  const U = wn(W, O, h);
  h.audit = U, O["spice-schematic.asc"] = Pe(W), O["manifest.json"] = ee(JSON.stringify(h, null, 2)), O["source.cir"] = ee(o);
  for (const [d, S] of Object.entries(s)) {
    const P = d.replaceAll("\\", "/").split("/").filter((D) => D && D !== "." && D !== "..").join("/");
    P && (O["source-libraries/" + P] = ee(S));
  }
  return O["README.txt"] = ee(`Extract ALL files into one folder, then open spice-schematic.asc in LTspice.
The .asy files are locally generated symbols and are required by the ASC.
Positions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.
manifest.json contains original/exported names, values, ports and the connectivity audit.
Collapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.
source.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.
Simulation behavior depends on LTspice model support; connectivity validation is not a simulation result.
` + a.warnings.join(`
`)), { asc: W, ascBytes: O["spice-schematic.asc"], zip: dn(O, { level: 6 }), files: O, manifest: h };
}
export {
  Cn as exportAsc,
  Pe as ltspiceBytes
};
