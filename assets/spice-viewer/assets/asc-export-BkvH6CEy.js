import { l as ge, n as Ie, b as Se, p as Tt } from "./ui-CsRpzMcg.js";
var J = Uint8Array, ne = Uint16Array, Ve = Int32Array, Ge = new J([
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
]), $e = new J([
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
]), Ye = new J([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), at = function(n, o) {
  for (var a = new ne(31), c = 0; c < 31; ++c)
    a[c] = o += 1 << n[c - 1];
  for (var u = new Ve(a[30]), c = 1; c < 30; ++c)
    for (var l = a[c]; l < a[c + 1]; ++l)
      u[l] = l - a[c] << 5 | c;
  return { b: a, r: u };
}, st = at(Ge, 2), Et = st.b, Pe = st.r;
Et[28] = 258, Pe[258] = 28;
var yt = at($e, 0), Xe = yt.r, Be = new ne(32768);
for (var X = 0; X < 32768; ++X) {
  var le = (X & 43690) >> 1 | (X & 21845) << 1;
  le = (le & 52428) >> 2 | (le & 13107) << 2, le = (le & 61680) >> 4 | (le & 3855) << 4, Be[X] = ((le & 65280) >> 8 | (le & 255) << 8) >> 1;
}
var Ee = (function(n, o, a) {
  for (var c = n.length, u = 0, l = new ne(o); u < c; ++u)
    n[u] && ++l[n[u] - 1];
  var m = new ne(o);
  for (u = 1; u < o; ++u)
    m[u] = m[u - 1] + l[u - 1] << 1;
  var b;
  if (a) {
    b = new ne(1 << o);
    var y = 15 - o;
    for (u = 0; u < c; ++u)
      if (n[u])
        for (var N = u << 4 | n[u], p = o - n[u], E = m[n[u] - 1]++ << p, A = E | (1 << p) - 1; E <= A; ++E)
          b[Be[E] >> y] = N;
  } else
    for (b = new ne(c), u = 0; u < c; ++u)
      n[u] && (b[u] = Be[m[n[u] - 1]++] >> 15 - n[u]);
  return b;
}), fe = new J(288);
for (var X = 0; X < 144; ++X)
  fe[X] = 8;
for (var X = 144; X < 256; ++X)
  fe[X] = 9;
for (var X = 256; X < 280; ++X)
  fe[X] = 7;
for (var X = 280; X < 288; ++X)
  fe[X] = 8;
var xe = new J(32);
for (var X = 0; X < 32; ++X)
  xe[X] = 5;
var _t = /* @__PURE__ */ Ee(fe, 9, 0), bt = /* @__PURE__ */ Ee(xe, 5, 0), ct = function(n) {
  return (n + 7) / 8 | 0;
}, lt = function(n, o, a) {
  return (a == null || a > n.length) && (a = n.length), new J(n.subarray(o, a));
}, xt = [
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
], Ae = function(n, o, a) {
  var c = new Error(o || xt[n]);
  if (c.code = n, Error.captureStackTrace && Error.captureStackTrace(c, Ae), !a)
    throw c;
  return c;
}, se = function(n, o, a) {
  a <<= o & 7;
  var c = o / 8 | 0;
  n[c] |= a, n[c + 1] |= a >> 8;
}, ve = function(n, o, a) {
  a <<= o & 7;
  var c = o / 8 | 0;
  n[c] |= a, n[c + 1] |= a >> 8, n[c + 2] |= a >> 16;
}, De = function(n, o) {
  for (var a = [], c = 0; c < n.length; ++c)
    n[c] && a.push({ s: c, f: n[c] });
  var u = a.length, l = a.slice();
  if (!u)
    return { t: ut, l: 0 };
  if (u == 1) {
    var m = new J(a[0].s + 1);
    return m[a[0].s] = 1, { t: m, l: 1 };
  }
  a.sort(function(x, F) {
    return x.f - F.f;
  }), a.push({ s: -1, f: 25001 });
  var b = a[0], y = a[1], N = 0, p = 1, E = 2;
  for (a[0] = { s: -1, f: b.f + y.f, l: b, r: y }; p != u - 1; )
    b = a[a[N].f < a[E].f ? N++ : E++], y = a[N != p && a[N].f < a[E].f ? N++ : E++], a[p++] = { s: -1, f: b.f + y.f, l: b, r: y };
  for (var A = l[0].s, c = 1; c < u; ++c)
    l[c].s > A && (A = l[c].s);
  var h = new ne(A + 1), v = je(a[p - 1], h, 0);
  if (v > o) {
    var c = 0, C = 0, V = v - o, S = 1 << V;
    for (l.sort(function(F, U) {
      return h[U.s] - h[F.s] || F.f - U.f;
    }); c < u; ++c) {
      var $ = l[c].s;
      if (h[$] > o)
        C += S - (1 << v - h[$]), h[$] = o;
      else
        break;
    }
    for (C >>= V; C > 0; ) {
      var f = l[c].s;
      h[f] < o ? C -= 1 << o - h[f]++ - 1 : ++c;
    }
    for (; c >= 0 && C; --c) {
      var T = l[c].s;
      h[T] == o && (--h[T], ++C);
    }
    v = o;
  }
  return { t: new J(h), l: v };
}, je = function(n, o, a) {
  return n.s == -1 ? Math.max(je(n.l, o, a + 1), je(n.r, o, a + 1)) : o[n.s] = a;
}, We = function(n) {
  for (var o = n.length; o && !n[--o]; )
    ;
  for (var a = new ne(++o), c = 0, u = n[0], l = 1, m = function(y) {
    a[c++] = y;
  }, b = 1; b <= o; ++b)
    if (n[b] == u && b != o)
      ++l;
    else {
      if (!u && l > 2) {
        for (; l > 138; l -= 138)
          m(32754);
        l > 2 && (m(l > 10 ? l - 11 << 5 | 28690 : l - 3 << 5 | 12305), l = 0);
      } else if (l > 3) {
        for (m(u), --l; l > 6; l -= 6)
          m(8304);
        l > 2 && (m(l - 3 << 5 | 8208), l = 0);
      }
      for (; l--; )
        m(u);
      l = 1, u = n[b];
    }
  return { c: a.subarray(0, c), n: o };
}, Te = function(n, o) {
  for (var a = 0, c = 0; c < o.length; ++c)
    a += n[c] * o[c];
  return a;
}, ft = function(n, o, a) {
  var c = a.length, u = ct(o + 2);
  n[u] = c & 255, n[u + 1] = c >> 8, n[u + 2] = n[u] ^ 255, n[u + 3] = n[u + 1] ^ 255;
  for (var l = 0; l < c; ++l)
    n[u + l + 4] = a[l];
  return (u + 4 + c) * 8;
}, ze = function(n, o, a, c, u, l, m, b, y, N, p) {
  se(o, p++, a), ++u[256];
  for (var E = De(u, 15), A = E.t, h = E.l, v = De(l, 15), C = v.t, V = v.l, S = We(A), $ = S.c, f = S.n, T = We(C), x = T.c, F = T.n, U = new ne(19), O = 0; O < $.length; ++O)
    ++U[$[O] & 31];
  for (var O = 0; O < x.length; ++O)
    ++U[x[O] & 31];
  for (var R = De(U, 7), s = R.t, H = R.l, W = 19; W > 4 && !s[Ye[W - 1]]; --W)
    ;
  var _ = N + 5 << 3, M = Te(u, fe) + Te(l, xe) + m, G = Te(u, A) + Te(l, C) + m + 14 + 3 * W + Te(U, s) + 2 * U[16] + 3 * U[17] + 7 * U[18];
  if (y >= 0 && _ <= M && _ <= G)
    return ft(o, p, n.subarray(y, y + N));
  var k, r, g, w;
  if (se(o, p, 1 + (G < M)), p += 2, G < M) {
    k = Ee(A, h, 0), r = A, g = Ee(C, V, 0), w = C;
    var P = Ee(s, H, 0);
    se(o, p, f - 257), se(o, p + 5, F - 1), se(o, p + 10, W - 4), p += 14;
    for (var O = 0; O < W; ++O)
      se(o, p + 3 * O, s[Ye[O]]);
    p += 3 * W;
    for (var L = [$, x], I = 0; I < 2; ++I)
      for (var B = L[I], O = 0; O < B.length; ++O) {
        var D = B[O] & 31;
        se(o, p, P[D]), p += s[D], D > 15 && (se(o, p, B[O] >> 5 & 127), p += B[O] >> 12);
      }
  } else
    k = _t, r = fe, g = bt, w = xe;
  for (var O = 0; O < b; ++O) {
    var j = c[O];
    if (j > 255) {
      var D = j >> 18 & 31;
      ve(o, p, k[D + 257]), p += r[D + 257], D > 7 && (se(o, p, j >> 23 & 31), p += Ge[D]);
      var Y = j & 31;
      ve(o, p, g[Y]), p += w[Y], Y > 3 && (ve(o, p, j >> 5 & 8191), p += $e[Y]);
    } else
      ve(o, p, k[j]), p += r[j];
  }
  return ve(o, p, k[256]), p + r[256];
}, wt = /* @__PURE__ */ new Ve([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ut = /* @__PURE__ */ new J(0), Nt = function(n, o, a, c, u, l) {
  var m = l.z || n.length, b = new J(c + m + 5 * (1 + Math.ceil(m / 7e3)) + u), y = b.subarray(c, b.length - u), N = l.l, p = (l.r || 0) & 7;
  if (o) {
    p && (y[0] = l.r >> 3);
    for (var E = wt[o - 1], A = E >> 13, h = E & 8191, v = (1 << a) - 1, C = l.p || new ne(32768), V = l.h || new ne(v + 1), S = Math.ceil(a / 3), $ = 2 * S, f = function(e) {
      return (n[e] ^ n[e + 1] << S ^ n[e + 2] << $) & v;
    }, T = new Ve(25e3), x = new ne(288), F = new ne(32), U = 0, O = 0, R = l.i || 0, s = 0, H = l.w || 0, W = 0; R + 2 < m; ++R) {
      var _ = f(R), M = R & 32767, G = V[_];
      if (C[M] = G, V[_] = M, H <= R) {
        var k = m - R;
        if ((U > 7e3 || s > 24576) && (k > 423 || !N)) {
          p = ze(n, y, 0, T, x, F, O, s, W, R - W, p), s = U = O = 0, W = R;
          for (var r = 0; r < 286; ++r)
            x[r] = 0;
          for (var r = 0; r < 30; ++r)
            F[r] = 0;
        }
        var g = 2, w = 0, P = h, L = M - G & 32767;
        if (k > 2 && _ == f(R - L))
          for (var I = Math.min(A, k) - 1, B = Math.min(32767, R), D = Math.min(258, k); L <= B && --P && M != G; ) {
            if (n[R + g] == n[R + g - L]) {
              for (var j = 0; j < D && n[R + j] == n[R + j - L]; ++j)
                ;
              if (j > g) {
                if (g = j, w = L, j > I)
                  break;
                for (var Y = Math.min(L, j - 2), oe = 0, r = 0; r < Y; ++r) {
                  var re = R - L + r & 32767, ue = C[re], pe = re - ue & 32767;
                  pe > oe && (oe = pe, G = re);
                }
              }
            }
            M = G, G = C[M], L += M - G & 32767;
          }
        if (w) {
          T[s++] = 268435456 | Pe[g] << 18 | Xe[w];
          var de = Pe[g] & 31, ye = Xe[w] & 31;
          O += Ge[de] + $e[ye], ++x[257 + de], ++F[ye], H = R + g, ++U;
        } else
          T[s++] = n[R], ++x[n[R]];
      }
    }
    for (R = Math.max(R, H); R < m; ++R)
      T[s++] = n[R], ++x[n[R]];
    p = ze(n, y, N, T, x, F, O, s, W, R - W, p), N || (l.r = p & 7 | y[p / 8 | 0] << 3, p -= 7, l.h = V, l.p = C, l.i = R, l.w = H);
  } else {
    for (var R = l.w || 0; R < m + N; R += 65535) {
      var t = R + 65535;
      t >= m && (y[p / 8 | 0] = N, t = m), p = ft(y, p + 1, n.subarray(R, t));
    }
    l.i = m;
  }
  return lt(b, 0, c + ct(p) + u);
}, At = /* @__PURE__ */ (function() {
  for (var n = new Int32Array(256), o = 0; o < 256; ++o) {
    for (var a = o, c = 9; --c; )
      a = (a & 1 && -306674912) ^ a >>> 1;
    n[o] = a;
  }
  return n;
})(), Ct = function() {
  var n = -1;
  return {
    p: function(o) {
      for (var a = n, c = 0; c < o.length; ++c)
        a = At[a & 255 ^ o[c]] ^ a >>> 8;
      n = a;
    },
    d: function() {
      return ~n;
    }
  };
}, It = function(n, o, a, c, u) {
  if (!u && (u = { l: 1 }, o.dictionary)) {
    var l = o.dictionary.subarray(-32768), m = new J(l.length + n.length);
    m.set(l), m.set(n, l.length), n = m, u.w = l.length;
  }
  return Nt(n, o.level == null ? 6 : o.level, o.mem == null ? u.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(n.length))) * 1.5) : 20 : 12 + o.mem, a, c, u);
}, dt = function(n, o) {
  var a = {};
  for (var c in n)
    a[c] = n[c];
  for (var c in o)
    a[c] = o[c];
  return a;
}, Z = function(n, o, a) {
  for (; a; ++o)
    n[o] = a, a >>>= 8;
};
function St(n, o) {
  return It(n, o || {}, 0, 0);
}
var mt = function(n, o, a, c) {
  for (var u in n) {
    var l = n[u], m = o + u, b = c;
    Array.isArray(l) && (b = dt(c, l[1]), l = l[0]), l instanceof J ? a[m] = [l, b] : (a[m += "/"] = [new J(0), b], mt(l, m, a, c));
  }
}, He = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Dt = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Ot = 0;
try {
  Dt.decode(ut, { stream: !0 }), Ot = 1;
} catch {
}
function he(n, o) {
  var a;
  if (He)
    return He.encode(n);
  for (var c = n.length, u = new J(n.length + (n.length >> 1)), l = 0, m = function(N) {
    u[l++] = N;
  }, a = 0; a < c; ++a) {
    if (l + 5 > u.length) {
      var b = new J(l + 8 + (c - a << 1));
      b.set(u), u = b;
    }
    var y = n.charCodeAt(a);
    y < 128 || o ? m(y) : y < 2048 ? (m(192 | y >> 6), m(128 | y & 63)) : y > 55295 && y < 57344 ? (y = 65536 + (y & 1047552) | n.charCodeAt(++a) & 1023, m(240 | y >> 18), m(128 | y >> 12 & 63), m(128 | y >> 6 & 63), m(128 | y & 63)) : (m(224 | y >> 12), m(128 | y >> 6 & 63), m(128 | y & 63));
  }
  return lt(u, 0, l);
}
var Ue = function(n) {
  var o = 0;
  if (n)
    for (var a in n) {
      var c = n[a].length;
      c > 65535 && Ae(9), o += c + 4;
    }
  return o;
}, Qe = function(n, o, a, c, u, l, m, b) {
  var y = c.length, N = a.extra, p = b && b.length, E = Ue(N);
  Z(n, o, m != null ? 33639248 : 67324752), o += 4, m != null && (n[o++] = 20, n[o++] = a.os), n[o] = 20, o += 2, n[o++] = a.flag << 1 | (l < 0 && 8), n[o++] = u && 8, n[o++] = a.compression & 255, n[o++] = a.compression >> 8;
  var A = new Date(a.mtime == null ? Date.now() : a.mtime), h = A.getFullYear() - 1980;
  if ((h < 0 || h > 119) && Ae(10), Z(n, o, h << 25 | A.getMonth() + 1 << 21 | A.getDate() << 16 | A.getHours() << 11 | A.getMinutes() << 5 | A.getSeconds() >> 1), o += 4, l != -1 && (Z(n, o, a.crc), Z(n, o + 4, l < 0 ? -l - 2 : l), Z(n, o + 8, a.size)), Z(n, o + 12, y), Z(n, o + 14, E), o += 16, m != null && (Z(n, o, p), Z(n, o + 6, a.attrs), Z(n, o + 10, m), o += 14), n.set(c, o), o += y, E)
    for (var v in N) {
      var C = N[v], V = C.length;
      Z(n, o, +v), Z(n, o + 2, V), n.set(C, o + 4), o += 4 + V;
    }
  return p && (n.set(b, o), o += p), o;
}, Mt = function(n, o, a, c, u) {
  Z(n, o, 101010256), Z(n, o + 8, a), Z(n, o + 10, a), Z(n, o + 12, c), Z(n, o + 16, u);
};
function Lt(n, o) {
  o || (o = {});
  var a = {}, c = [];
  mt(n, "", a, o);
  var u = 0, l = 0;
  for (var m in a) {
    var b = a[m], y = b[0], N = b[1], p = N.level == 0 ? 0 : 8, E = he(m), A = E.length, h = N.comment, v = h && he(h), C = v && v.length, V = Ue(N.extra);
    A > 65535 && Ae(11);
    var S = p ? St(y, N) : y, $ = S.length, f = Ct();
    f.p(y), c.push(dt(N, {
      size: y.length,
      crc: f.d(),
      c: S,
      f: E,
      m: v,
      u: A != m.length || v && h.length != C,
      o: u,
      compression: p
    })), u += 30 + A + V + $, l += 76 + 2 * (A + V) + (C || 0) + $;
  }
  for (var T = new J(l + 22), x = u, F = l - u, U = 0; U < c.length; ++U) {
    var E = c[U];
    Qe(T, E.o, E, E.f, E.u, E.c.length);
    var O = 30 + E.f.length + Ue(E.extra);
    T.set(E.c, E.o + O), Qe(T, u, E, E.f, E.u, E.c.length, E.o, E.m), u += 16 + O + (E.m ? E.m.length : 0);
  }
  return Mt(T, u, c.length, F, x), T;
}
function Rt(n) {
  if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
  var o = n.default;
  if (typeof o == "function") {
    var a = function c() {
      var u = !1;
      try {
        u = this instanceof c;
      } catch {
      }
      return u ? Reflect.construct(o, arguments, this.constructor) : o.apply(this, arguments);
    };
    a.prototype = o.prototype;
  } else a = {};
  return Object.defineProperty(a, "__esModule", { value: !0 }), Object.keys(n).forEach(function(c) {
    var u = Object.getOwnPropertyDescriptor(n, c);
    Object.defineProperty(a, c, u.get ? u : {
      enumerable: !0,
      get: function() {
        return n[c];
      }
    });
  }), a;
}
var Oe = {};
const Ft = {}, Pt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ft
}, Symbol.toStringTag, { value: "Module" })), Bt = /* @__PURE__ */ Rt(Pt);
var Ke;
function jt() {
  return Ke || (Ke = 1, (function(n) {
    (function(o) {
      o.parser = function(t, e) {
        return new c(t, e);
      }, o.SAXParser = c, o.SAXStream = E, o.createStream = N, o.MAX_BUFFER_LENGTH = 64 * 1024;
      var a = [
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
      o.EVENTS = [
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
      function c(t, e) {
        if (!(this instanceof c))
          return new c(t, e);
        var d = this;
        l(d), d.q = d.c = "", d.bufferCheckPosition = o.MAX_BUFFER_LENGTH, d.encoding = null, d.opt = e || {}, d.opt.lowercase = d.opt.lowercase || d.opt.lowercasetags, d.looseCase = d.opt.lowercase ? "toLowerCase" : "toUpperCase", d.opt.maxEntityCount = d.opt.maxEntityCount || 512, d.opt.maxEntityDepth = d.opt.maxEntityDepth || 4, d.entityCount = d.entityDepth = 0, d.tags = [], d.closed = d.closedRoot = d.sawRoot = !1, d.tag = d.error = null, d.strict = !!t, d.noscript = !!(t || d.opt.noscript), d.state = s.BEGIN, d.strictEntities = d.opt.strictEntities, d.ENTITIES = d.strictEntities ? Object.create(o.XML_ENTITIES) : Object.create(o.ENTITIES), d.attribList = [], d.opt.xmlns && (d.ns = Object.create(V)), d.opt.unquotedAttributeValues === void 0 && (d.opt.unquotedAttributeValues = !t), d.trackPosition = d.opt.position !== !1, d.trackPosition && (d.position = d.line = d.column = 0), W(d, "onready");
      }
      Object.create || (Object.create = function(t) {
        function e() {
        }
        e.prototype = t;
        var d = new e();
        return d;
      }), Object.keys || (Object.keys = function(t) {
        var e = [];
        for (var d in t) t.hasOwnProperty(d) && e.push(d);
        return e;
      });
      function u(t) {
        for (var e = Math.max(o.MAX_BUFFER_LENGTH, 10), d = 0, i = 0, q = a.length; i < q; i++) {
          var z = t[a[i]].length;
          if (z > e)
            switch (a[i]) {
              case "textNode":
                g(t);
                break;
              case "cdata":
                r(t, "oncdata", t.cdata), t.cdata = "";
                break;
              case "script":
                r(t, "onscript", t.script), t.script = "";
                break;
              default:
                P(t, "Max buffer length exceeded: " + a[i]);
            }
          d = Math.max(d, z);
        }
        var Q = o.MAX_BUFFER_LENGTH - d;
        t.bufferCheckPosition = Q + t.position;
      }
      function l(t) {
        for (var e = 0, d = a.length; e < d; e++)
          t[a[e]] = "";
      }
      function m(t) {
        g(t), t.cdata !== "" && (r(t, "oncdata", t.cdata), t.cdata = ""), t.script !== "" && (r(t, "onscript", t.script), t.script = "");
      }
      c.prototype = {
        end: function() {
          L(this);
        },
        write: ye,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          m(this);
        }
      };
      var b;
      try {
        b = Bt.Stream;
      } catch {
        b = function() {
        };
      }
      b || (b = function() {
      });
      var y = o.EVENTS.filter(function(t) {
        return t !== "error" && t !== "end";
      });
      function N(t, e) {
        return new E(t, e);
      }
      function p(t, e) {
        if (t.length >= 2) {
          if (t[0] === 255 && t[1] === 254)
            return "utf-16le";
          if (t[0] === 254 && t[1] === 255)
            return "utf-16be";
        }
        return t.length >= 3 && t[0] === 239 && t[1] === 187 && t[2] === 191 ? "utf8" : t.length >= 4 ? t[0] === 60 && t[1] === 0 && t[2] === 63 && t[3] === 0 ? "utf-16le" : t[0] === 0 && t[1] === 60 && t[2] === 0 && t[3] === 63 ? "utf-16be" : "utf8" : e ? "utf8" : null;
      }
      function E(t, e) {
        if (!(this instanceof E))
          return new E(t, e);
        b.apply(this), this._parser = new c(t, e), this.writable = !0, this.readable = !0;
        var d = this;
        this._parser.onend = function() {
          d.emit("end");
        }, this._parser.onerror = function(i) {
          d.emit("error", i), d._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, y.forEach(function(i) {
          Object.defineProperty(d, "on" + i, {
            get: function() {
              return d._parser["on" + i];
            },
            set: function(q) {
              if (!q)
                return d.removeAllListeners(i), d._parser["on" + i] = q, q;
              d.on(i, q);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      E.prototype = Object.create(b.prototype, {
        constructor: {
          value: E
        }
      }), E.prototype._decodeBuffer = function(t, e) {
        if (this._decoderBuffer && (t = Buffer.concat([this._decoderBuffer, t]), this._decoderBuffer = null), !this._decoder) {
          var d = p(t, e);
          if (!d)
            return this._decoderBuffer = t, "";
          this._parser.encoding = d, this._decoder = new TextDecoder(d);
        }
        return this._decoder.decode(t, { stream: !e });
      }, E.prototype.write = function(t) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(t))
          t = this._decodeBuffer(t, !1);
        else if (this._decoderBuffer) {
          var e = this._decodeBuffer(Buffer.alloc(0), !0);
          e && (this._parser.write(e), this.emit("data", e));
        }
        return this._parser.write(t.toString()), this.emit("data", t), !0;
      }, E.prototype.end = function(t) {
        if (t && t.length && this.write(t), this._decoderBuffer) {
          var e = this._decodeBuffer(Buffer.alloc(0), !0);
          e && (this._parser.write(e), this.emit("data", e));
        } else if (this._decoder) {
          var d = this._decoder.decode();
          d && (this._parser.write(d), this.emit("data", d));
        }
        return this._parser.end(), !0;
      }, E.prototype.on = function(t, e) {
        var d = this;
        return !d._parser["on" + t] && y.indexOf(t) !== -1 && (d._parser["on" + t] = function() {
          var i = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          i.splice(0, 0, t), d.emit.apply(d, i);
        }), b.prototype.on.call(d, t, e);
      };
      var A = /^\[CDATA\[$/i, h = /^DOCTYPE$/i, v = "http://www.w3.org/XML/1998/namespace", C = "http://www.w3.org/2000/xmlns/", V = { xml: v, xmlns: C }, S = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, $ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, f = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function x(t) {
        return t === " " || t === `
` || t === "\r" || t === "	";
      }
      function F(t) {
        return t === '"' || t === "'";
      }
      function U(t) {
        return t === ">" || x(t);
      }
      function O(t, e) {
        return t.test(e);
      }
      function R(t, e) {
        return !O(t, e);
      }
      var s = 0;
      o.STATE = {
        BEGIN: s++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: s++,
        // leading whitespace
        TEXT: s++,
        // general stuff
        TEXT_ENTITY: s++,
        // &amp and such.
        OPEN_WAKA: s++,
        // <
        SGML_DECL: s++,
        // <!BLARG
        SGML_DECL_QUOTED: s++,
        // <!BLARG foo "bar
        DOCTYPE: s++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: s++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: s++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: s++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: s++,
        // <!-
        COMMENT: s++,
        // <!--
        COMMENT_ENDING: s++,
        // <!-- blah -
        COMMENT_ENDED: s++,
        // <!-- blah --
        CDATA: s++,
        // <![CDATA[ something
        CDATA_ENDING: s++,
        // ]
        CDATA_ENDING_2: s++,
        // ]]
        PROC_INST: s++,
        // <?hi
        PROC_INST_BODY: s++,
        // <?hi there
        PROC_INST_ENDING: s++,
        // <?hi "there" ?
        OPEN_TAG: s++,
        // <strong
        OPEN_TAG_SLASH: s++,
        // <strong /
        ATTRIB: s++,
        // <a
        ATTRIB_NAME: s++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: s++,
        // <a foo _
        ATTRIB_VALUE: s++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: s++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: s++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: s++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: s++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: s++,
        // <foo bar=&quot
        CLOSE_TAG: s++,
        // </a
        CLOSE_TAG_SAW_WHITE: s++,
        // </a   >
        SCRIPT: s++,
        // <script> ...
        SCRIPT_ENDING: s++
        // <script> ... <
      }, o.XML_ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }), o.ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
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
      }), Object.keys(o.ENTITIES).forEach(function(t) {
        var e = o.ENTITIES[t], d = typeof e == "number" ? String.fromCharCode(e) : e;
        o.ENTITIES[t] = d;
      });
      for (var H in o.STATE)
        o.STATE[o.STATE[H]] = H;
      s = o.STATE;
      function W(t, e, d) {
        t[e] && t[e](d);
      }
      function _(t) {
        var e = t && t.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return e ? e[2] : null;
      }
      function M(t) {
        return t ? t.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function G(t, e) {
        const d = M(t), i = M(e);
        return !d || !i ? !0 : i === "utf16" ? d === "utf16le" || d === "utf16be" : d === i;
      }
      function k(t, e) {
        if (!(!t.strict || !t.encoding || !e || e.name !== "xml")) {
          var d = _(e.body);
          d && !G(t.encoding, d) && I(
            t,
            "XML declaration encoding " + d + " does not match detected stream encoding " + t.encoding.toUpperCase()
          );
        }
      }
      function r(t, e, d) {
        t.textNode && g(t), W(t, e, d);
      }
      function g(t) {
        t.textNode = w(t.opt, t.textNode), t.textNode && W(t, "ontext", t.textNode), t.textNode = "";
      }
      function w(t, e) {
        return t.trim && (e = e.trim()), t.normalize && (e = e.replace(/\s+/g, " ")), e;
      }
      function P(t, e) {
        return g(t), t.trackPosition && (e += `
Line: ` + t.line + `
Column: ` + t.column + `
Char: ` + t.c), e = new Error(e), t.error = e, W(t, "onerror", e), t;
      }
      function L(t) {
        return t.sawRoot && !t.closedRoot && I(t, "Unclosed root tag"), t.state !== s.BEGIN && t.state !== s.BEGIN_WHITESPACE && t.state !== s.TEXT && P(t, "Unexpected end"), g(t), t.c = "", t.closed = !0, W(t, "onend"), c.call(t, t.strict, t.opt), t;
      }
      function I(t, e) {
        if (typeof t != "object" || !(t instanceof c))
          throw new Error("bad call to strictFail");
        t.strict && P(t, e);
      }
      function B(t) {
        t.strict || (t.tagName = t.tagName[t.looseCase]());
        var e = t.tags[t.tags.length - 1] || t, d = t.tag = { name: t.tagName, attributes: {} };
        t.opt.xmlns && (d.ns = e.ns), t.attribList.length = 0, r(t, "onopentagstart", d);
      }
      function D(t, e) {
        var d = t.indexOf(":"), i = d < 0 ? ["", t] : t.split(":"), q = i[0], z = i[1];
        return e && t === "xmlns" && (q = "xmlns", z = ""), { prefix: q, local: z };
      }
      function j(t) {
        if (t.strict || (t.attribName = t.attribName[t.looseCase]()), t.attribList.indexOf(t.attribName) !== -1 || t.tag.attributes.hasOwnProperty(t.attribName)) {
          t.attribName = t.attribValue = "";
          return;
        }
        if (t.opt.xmlns) {
          var e = D(t.attribName, !0), d = e.prefix, i = e.local;
          if (d === "xmlns")
            if (i === "xml" && t.attribValue !== v)
              I(
                t,
                "xml: prefix must be bound to " + v + `
Actual: ` + t.attribValue
              );
            else if (i === "xmlns" && t.attribValue !== C)
              I(
                t,
                "xmlns: prefix must be bound to " + C + `
Actual: ` + t.attribValue
              );
            else {
              var q = t.tag, z = t.tags[t.tags.length - 1] || t;
              q.ns === z.ns && (q.ns = Object.create(z.ns)), q.ns[i] = t.attribValue;
            }
          t.attribList.push([t.attribName, t.attribValue]);
        } else
          t.tag.attributes[t.attribName] = t.attribValue, r(t, "onattribute", {
            name: t.attribName,
            value: t.attribValue
          });
        t.attribName = t.attribValue = "";
      }
      function Y(t, e) {
        if (t.opt.xmlns) {
          var d = t.tag, i = D(t.tagName);
          d.prefix = i.prefix, d.local = i.local, d.uri = d.ns[i.prefix] || "", d.prefix && !d.uri && (I(
            t,
            "Unbound namespace prefix: " + JSON.stringify(t.tagName)
          ), d.uri = i.prefix);
          var q = t.tags[t.tags.length - 1] || t;
          d.ns && q.ns !== d.ns && Object.keys(d.ns).forEach(function(qe) {
            r(t, "onopennamespace", {
              prefix: qe,
              uri: d.ns[qe]
            });
          });
          for (var z = 0, Q = t.attribList.length; z < Q; z++) {
            var ee = t.attribList[z], te = ee[0], ie = ee[1], K = D(te, !0), ae = K.prefix, vt = K.local, ke = ae === "" ? "" : d.ns[ae] || "", Ce = {
              name: te,
              value: ie,
              prefix: ae,
              local: vt,
              uri: ke
            };
            ae && ae !== "xmlns" && !ke && (I(
              t,
              "Unbound namespace prefix: " + JSON.stringify(ae)
            ), Ce.uri = ae), t.tag.attributes[te] = Ce, r(t, "onattribute", Ce);
          }
          t.attribList.length = 0;
        }
        t.tag.isSelfClosing = !!e, t.sawRoot = !0, t.tags.push(t.tag), r(t, "onopentag", t.tag), e || (!t.noscript && t.tagName.toLowerCase() === "script" ? t.state = s.SCRIPT : t.state = s.TEXT, t.tag = null, t.tagName = ""), t.attribName = t.attribValue = "", t.attribList.length = 0;
      }
      function oe(t) {
        if (!t.tagName) {
          I(t, "Weird empty close tag."), t.textNode += "</>", t.state = s.TEXT;
          return;
        }
        if (t.script) {
          if (t.tagName !== "script") {
            t.script += "</" + t.tagName + ">", t.tagName = "", t.state = s.SCRIPT;
            return;
          }
          r(t, "onscript", t.script), t.script = "";
        }
        var e = t.tags.length, d = t.tagName;
        t.strict || (d = d[t.looseCase]());
        for (var i = d; e--; ) {
          var q = t.tags[e];
          if (q.name !== i)
            I(t, "Unexpected close tag");
          else
            break;
        }
        if (e < 0) {
          I(t, "Unmatched closing tag: " + t.tagName), t.textNode += "</" + t.tagName + ">", t.state = s.TEXT;
          return;
        }
        t.tagName = d;
        for (var z = t.tags.length; z-- > e; ) {
          var Q = t.tag = t.tags.pop();
          t.tagName = t.tag.name, r(t, "onclosetag", t.tagName);
          var ee = {};
          for (var te in Q.ns)
            ee[te] = Q.ns[te];
          var ie = t.tags[t.tags.length - 1] || t;
          t.opt.xmlns && Q.ns !== ie.ns && Object.keys(Q.ns).forEach(function(K) {
            var ae = Q.ns[K];
            r(t, "onclosenamespace", { prefix: K, uri: ae });
          });
        }
        e === 0 && (t.closedRoot = !0), t.tagName = t.attribValue = t.attribName = "", t.attribList.length = 0, t.state = s.TEXT;
      }
      function re(t) {
        var e = t.entity, d = e.toLowerCase(), i, q = "";
        return t.ENTITIES[e] ? t.ENTITIES[e] : t.ENTITIES[d] ? t.ENTITIES[d] : (e = d, e.charAt(0) === "#" && (e.charAt(1) === "x" ? (e = e.slice(2), i = parseInt(e, 16), q = i.toString(16)) : (e = e.slice(1), i = parseInt(e, 10), q = i.toString(10))), e = e.replace(/^0+/, ""), isNaN(i) || q.toLowerCase() !== e || i < 0 || i > 1114111 || !ue(i) ? (I(t, "Invalid character entity"), "&" + t.entity + ";") : String.fromCodePoint(i));
      }
      function ue(t) {
        return t === 9 || t === 10 || t === 13 || t >= 32 && t <= 55295 || t >= 57344 && t <= 65533 || t >= 65536 && t <= 1114111;
      }
      function pe(t, e) {
        e === "<" ? (t.state = s.OPEN_WAKA, t.startTagPosition = t.position) : x(e) || (I(t, "Non-whitespace before first tag."), t.textNode = e, t.state = s.TEXT);
      }
      function de(t, e) {
        var d = "";
        return e < t.length && (d = t.charAt(e)), d;
      }
      function ye(t) {
        var e = this;
        if (this.error)
          throw this.error;
        if (e.closed)
          return P(
            e,
            "Cannot write after close. Assign an onready handler."
          );
        if (t === null)
          return L(e);
        typeof t == "object" && (t = t.toString());
        for (var d = 0, i = ""; i = de(t, d++), e.c = i, !!i; )
          switch (e.trackPosition && (e.position++, i === `
` ? (e.line++, e.column = 0) : e.column++), e.state) {
            case s.BEGIN:
              if (e.state = s.BEGIN_WHITESPACE, i === "\uFEFF")
                continue;
              pe(e, i);
              continue;
            case s.BEGIN_WHITESPACE:
              pe(e, i);
              continue;
            case s.TEXT:
              if (e.sawRoot && !e.closedRoot) {
                for (var z = d - 1; i && i !== "<" && i !== "&"; )
                  i = de(t, d++), i && e.trackPosition && (e.position++, i === `
` ? (e.line++, e.column = 0) : e.column++);
                e.textNode += t.substring(z, d - 1);
              }
              i === "<" && !(e.sawRoot && e.closedRoot && !e.strict) ? (e.state = s.OPEN_WAKA, e.startTagPosition = e.position) : (!x(i) && (!e.sawRoot || e.closedRoot) && I(e, "Text data outside of root node."), i === "&" ? e.state = s.TEXT_ENTITY : e.textNode += i);
              continue;
            case s.SCRIPT:
              i === "<" ? e.state = s.SCRIPT_ENDING : e.script += i;
              continue;
            case s.SCRIPT_ENDING:
              i === "/" ? e.state = s.CLOSE_TAG : (e.script += "<" + i, e.state = s.SCRIPT);
              continue;
            case s.OPEN_WAKA:
              if (i === "!")
                e.state = s.SGML_DECL, e.sgmlDecl = "";
              else if (!x(i)) if (O(S, i))
                e.state = s.OPEN_TAG, e.tagName = i;
              else if (i === "/")
                e.state = s.CLOSE_TAG, e.tagName = "";
              else if (i === "?")
                e.state = s.PROC_INST, e.procInstName = e.procInstBody = "";
              else {
                if (I(e, "Unencoded <"), e.startTagPosition + 1 < e.position) {
                  var q = e.position - e.startTagPosition;
                  i = new Array(q).join(" ") + i;
                }
                e.textNode += "<" + i, e.state = s.TEXT;
              }
              continue;
            case s.SGML_DECL:
              if (e.sgmlDecl + i === "--") {
                e.state = s.COMMENT, e.comment = "", e.sgmlDecl = "";
                continue;
              }
              e.doctype && e.doctype !== !0 && e.sgmlDecl ? (e.state = s.DOCTYPE_DTD, e.doctype += "<!" + e.sgmlDecl + i, e.sgmlDecl = "") : A.test(e.sgmlDecl + i) ? (r(e, "onopencdata"), e.state = s.CDATA, e.sgmlDecl = "", e.cdata = "") : h.test(e.sgmlDecl + i) ? (e.state = s.DOCTYPE, (e.doctype || e.sawRoot) && I(
                e,
                "Inappropriately located doctype declaration"
              ), e.doctype = "", e.sgmlDecl = "") : i === ">" ? (r(e, "onsgmldeclaration", e.sgmlDecl), e.sgmlDecl = "", e.state = s.TEXT) : (F(i) && (e.state = s.SGML_DECL_QUOTED), e.sgmlDecl += i);
              continue;
            case s.SGML_DECL_QUOTED:
              i === e.q && (e.state = s.SGML_DECL, e.q = ""), e.sgmlDecl += i;
              continue;
            case s.DOCTYPE:
              i === ">" ? (e.state = s.TEXT, r(e, "ondoctype", e.doctype), e.doctype = !0) : (e.doctype += i, i === "[" ? e.state = s.DOCTYPE_DTD : F(i) && (e.state = s.DOCTYPE_QUOTED, e.q = i));
              continue;
            case s.DOCTYPE_QUOTED:
              e.doctype += i, i === e.q && (e.q = "", e.state = s.DOCTYPE);
              continue;
            case s.DOCTYPE_DTD:
              i === "]" ? (e.doctype += i, e.state = s.DOCTYPE) : i === "<" ? (e.state = s.OPEN_WAKA, e.startTagPosition = e.position) : F(i) ? (e.doctype += i, e.state = s.DOCTYPE_DTD_QUOTED, e.q = i) : e.doctype += i;
              continue;
            case s.DOCTYPE_DTD_QUOTED:
              e.doctype += i, i === e.q && (e.state = s.DOCTYPE_DTD, e.q = "");
              continue;
            case s.COMMENT:
              i === "-" ? e.state = s.COMMENT_ENDING : e.comment += i;
              continue;
            case s.COMMENT_ENDING:
              i === "-" ? (e.state = s.COMMENT_ENDED, e.comment = w(e.opt, e.comment), e.comment && r(e, "oncomment", e.comment), e.comment = "") : (e.comment += "-" + i, e.state = s.COMMENT);
              continue;
            case s.COMMENT_ENDED:
              i !== ">" ? (I(e, "Malformed comment"), e.comment += "--" + i, e.state = s.COMMENT) : e.doctype && e.doctype !== !0 ? e.state = s.DOCTYPE_DTD : e.state = s.TEXT;
              continue;
            case s.CDATA:
              for (var z = d - 1; i && i !== "]"; )
                i = de(t, d++), i && e.trackPosition && (e.position++, i === `
` ? (e.line++, e.column = 0) : e.column++);
              e.cdata += t.substring(z, d - 1), i === "]" && (e.state = s.CDATA_ENDING);
              continue;
            case s.CDATA_ENDING:
              i === "]" ? e.state = s.CDATA_ENDING_2 : (e.cdata += "]" + i, e.state = s.CDATA);
              continue;
            case s.CDATA_ENDING_2:
              i === ">" ? (e.cdata && r(e, "oncdata", e.cdata), r(e, "onclosecdata"), e.cdata = "", e.state = s.TEXT) : i === "]" ? e.cdata += "]" : (e.cdata += "]]" + i, e.state = s.CDATA);
              continue;
            case s.PROC_INST:
              i === "?" ? e.state = s.PROC_INST_ENDING : x(i) ? e.state = s.PROC_INST_BODY : e.procInstName += i;
              continue;
            case s.PROC_INST_BODY:
              if (!e.procInstBody && x(i))
                continue;
              i === "?" ? e.state = s.PROC_INST_ENDING : e.procInstBody += i;
              continue;
            case s.PROC_INST_ENDING:
              if (i === ">") {
                const ie = {
                  name: e.procInstName,
                  body: e.procInstBody
                };
                k(e, ie), r(e, "onprocessinginstruction", ie), e.procInstName = e.procInstBody = "", e.state = s.TEXT;
              } else
                e.procInstBody += "?" + i, e.state = s.PROC_INST_BODY;
              continue;
            case s.OPEN_TAG:
              O($, i) ? e.tagName += i : (B(e), i === ">" ? Y(e) : i === "/" ? e.state = s.OPEN_TAG_SLASH : (x(i) || I(e, "Invalid character in tag name"), e.state = s.ATTRIB));
              continue;
            case s.OPEN_TAG_SLASH:
              i === ">" ? (Y(e, !0), oe(e)) : (I(
                e,
                "Forward-slash in opening tag not followed by >"
              ), e.state = s.ATTRIB);
              continue;
            case s.ATTRIB:
              if (x(i))
                continue;
              i === ">" ? Y(e) : i === "/" ? e.state = s.OPEN_TAG_SLASH : O(S, i) ? (e.attribName = i, e.attribValue = "", e.state = s.ATTRIB_NAME) : I(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_NAME:
              i === "=" ? e.state = s.ATTRIB_VALUE : i === ">" ? (I(e, "Attribute without value"), e.attribValue = e.attribName, j(e), Y(e)) : x(i) ? e.state = s.ATTRIB_NAME_SAW_WHITE : O($, i) ? e.attribName += i : I(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_NAME_SAW_WHITE:
              if (i === "=")
                e.state = s.ATTRIB_VALUE;
              else {
                if (x(i))
                  continue;
                I(e, "Attribute without value"), e.tag.attributes[e.attribName] = "", e.attribValue = "", r(e, "onattribute", {
                  name: e.attribName,
                  value: ""
                }), e.attribName = "", i === ">" ? Y(e) : O(S, i) ? (e.attribName = i, e.state = s.ATTRIB_NAME) : (I(e, "Invalid attribute name"), e.state = s.ATTRIB);
              }
              continue;
            case s.ATTRIB_VALUE:
              if (x(i))
                continue;
              F(i) ? (e.q = i, e.state = s.ATTRIB_VALUE_QUOTED) : (e.opt.unquotedAttributeValues || P(e, "Unquoted attribute value"), e.state = s.ATTRIB_VALUE_UNQUOTED, e.attribValue = i);
              continue;
            case s.ATTRIB_VALUE_QUOTED:
              if (i !== e.q) {
                i === "&" ? e.state = s.ATTRIB_VALUE_ENTITY_Q : e.attribValue += i;
                continue;
              }
              j(e), e.q = "", e.state = s.ATTRIB_VALUE_CLOSED;
              continue;
            case s.ATTRIB_VALUE_CLOSED:
              x(i) ? e.state = s.ATTRIB : i === ">" ? Y(e) : i === "/" ? e.state = s.OPEN_TAG_SLASH : O(S, i) ? (I(e, "No whitespace between attributes"), e.attribName = i, e.attribValue = "", e.state = s.ATTRIB_NAME) : I(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_VALUE_UNQUOTED:
              if (!U(i)) {
                i === "&" ? e.state = s.ATTRIB_VALUE_ENTITY_U : e.attribValue += i;
                continue;
              }
              j(e), i === ">" ? Y(e) : e.state = s.ATTRIB;
              continue;
            case s.CLOSE_TAG:
              if (e.tagName)
                i === ">" ? oe(e) : O($, i) ? e.tagName += i : e.script ? (e.script += "</" + e.tagName + i, e.tagName = "", e.state = s.SCRIPT) : (x(i) || I(e, "Invalid tagname in closing tag"), e.state = s.CLOSE_TAG_SAW_WHITE);
              else {
                if (x(i))
                  continue;
                R(S, i) ? e.script ? (e.script += "</" + i, e.state = s.SCRIPT) : I(e, "Invalid tagname in closing tag.") : e.tagName = i;
              }
              continue;
            case s.CLOSE_TAG_SAW_WHITE:
              if (x(i))
                continue;
              i === ">" ? oe(e) : I(e, "Invalid characters in closing tag");
              continue;
            case s.TEXT_ENTITY:
            case s.ATTRIB_VALUE_ENTITY_Q:
            case s.ATTRIB_VALUE_ENTITY_U:
              var Q, ee;
              switch (e.state) {
                case s.TEXT_ENTITY:
                  Q = s.TEXT, ee = "textNode";
                  break;
                case s.ATTRIB_VALUE_ENTITY_Q:
                  Q = s.ATTRIB_VALUE_QUOTED, ee = "attribValue";
                  break;
                case s.ATTRIB_VALUE_ENTITY_U:
                  Q = s.ATTRIB_VALUE_UNQUOTED, ee = "attribValue";
                  break;
              }
              if (i === ";") {
                var te = re(e);
                e.opt.unparsedEntities && !Object.values(o.XML_ENTITIES).includes(te) ? ((e.entityCount += 1) > e.opt.maxEntityCount && P(
                  e,
                  "Parsed entity count exceeds max entity count"
                ), (e.entityDepth += 1) > e.opt.maxEntityDepth && P(
                  e,
                  "Parsed entity depth exceeds max entity depth"
                ), e.entity = "", e.state = Q, e.write(te), e.entityDepth -= 1) : (e[ee] += te, e.entity = "", e.state = Q);
              } else O(e.entity.length ? T : f, i) ? e.entity += i : (I(e, "Invalid character in entity name"), e[ee] += "&" + e.entity + i, e.entity = "", e.state = Q);
              continue;
            default:
              throw new Error(e, "Unknown state: " + e.state);
          }
        return e.position >= e.bufferCheckPosition && u(e), e;
      }
      String.fromCodePoint || (function() {
        var t = String.fromCharCode, e = Math.floor, d = function() {
          var i = 16384, q = [], z, Q, ee = -1, te = arguments.length;
          if (!te)
            return "";
          for (var ie = ""; ++ee < te; ) {
            var K = Number(arguments[ee]);
            if (!isFinite(K) || // `NaN`, `+Infinity`, or `-Infinity`
            K < 0 || // not a valid Unicode code point
            K > 1114111 || // not a valid Unicode code point
            e(K) !== K)
              throw RangeError("Invalid code point: " + K);
            K <= 65535 ? q.push(K) : (K -= 65536, z = (K >> 10) + 55296, Q = K % 1024 + 56320, q.push(z, Q)), (ee + 1 === te || q.length > i) && (ie += t.apply(null, q), q.length = 0);
          }
          return ie;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: d,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = d;
      })();
    })(n);
  })(Oe)), Oe;
}
var Me, Ze;
function Ut() {
  if (Ze) return Me;
  Ze = 1;
  var n = jt().parser;
  function o(a) {
    var c = [], u = [], l = c, m;
    return m = n(!0), m.ontext = function(b) {
      b.trim() !== "" && l.push(b);
    }, m.onopentag = function(b) {
      var y;
      y = [b.name, b.attributes], u.push(l), l.push(y), l = y;
    }, m.onclosetag = function() {
      l = u.pop();
    }, m.write(a).close(), c[0];
  }
  return Me = o, Me;
}
var Le, Je;
function Vt() {
  if (Je) return Le;
  Je = 1;
  function n(o, a) {
    var c = function() {
    }, u = c, l = c;
    function m() {
      this._skip = !0;
    }
    function b() {
      this._remove = !0;
    }
    function y(E) {
      this._name = E;
    }
    function N(E) {
      this._replace = E;
    }
    function p(E, A) {
      var h, v = { attr: {}, full: E }, C = {
        name: y,
        skip: m,
        // break: breakFn,
        remove: b,
        replace: N,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, V = !0, S, $, f;
      if (E !== void 0 && E !== null && E !== !0 && E !== !1)
        switch (h = Object.prototype.toString.call(E), h) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (E.some(function(T, x) {
              if (x === 0)
                return v.name = T, !1;
              if (x === 1)
                return Object.prototype.toString.call(T) === "[object Object]" && (V = !1, v.attr = T), !0;
            }), u.call(C, v, A), C._name && (E[0] = C._name), C._replace)
              return C._replace;
            if (C._remove)
              return null;
            if (!C._skip) {
              for (S = 0, $ = E.length; S < $; ) {
                if (S > 1 || S === 1 && V) {
                  if (f = p(E[S], v), f === null) {
                    E.splice(S, 1), $ -= 1;
                    continue;
                  }
                  f && (E[S] = f);
                }
                S += 1;
              }
              if (l.call(C, v, A), C._name && (E[0] = C._name), C._replace)
                return C._replace;
              if (C._remove)
                return null;
            }
        }
    }
    a && (a.enter && (u = a.enter), a.leave && (l = a.leave)), p(o, void 0);
  }
  return Le = n, Le;
}
var Re, et;
function Gt() {
  if (et) return Re;
  et = 1;
  const n = Ut(), o = Vt(), a = (u) => String(u).replace(/[&<>"']/g, (l) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[l]);
  function c(u) {
    const [l, ...m] = u, b = m[0] && typeof m[0] == "object" && !Array.isArray(m[0]) ? m.shift() : {}, y = "<" + l + Object.entries(b).map(([N, p]) => " " + N + '="' + a(p) + '"').join("");
    return m.length ? y + ">" + m.map((N) => Array.isArray(N) ? c(N) : a(N)).join("") + "</" + l + ">" : y + "/>";
  }
  return Re = { parse: n, p: n, traverse: o, t: o, stringify: c, s: c }, Re;
}
Gt();
const we = (n) => Math.round(Number(n) * 1e3) / 1e3, me = (n) => we(n.x) + "," + we(n.y), ce = (n, o) => Math.abs(n - o) < 2e-3, tt = (n, o, a) => n >= Math.min(o, a) - 2e-3 && n <= Math.max(o, a) + 2e-3, Fe = (n, o) => ce(o.a.x, o.b.x) ? ce(n.x, o.a.x) && tt(n.y, o.a.y, o.b.y) : ce(n.y, o.a.y) && tt(n.x, o.a.x, o.b.x), nt = (n, o) => Math.abs(n.x - o.x) + Math.abs(n.y - o.y);
function $t(n, o = [], a = []) {
  const c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), m = (f) => {
    const T = { x: we(f.x), y: we(f.y) };
    return c.set(me(T), T), me(T);
  };
  for (const f of n)
    m(f.a), m(f.b);
  const b = o.map(m);
  for (const f of a)
    u.add(m(f.a)), u.add(m(f.b)), l.add([me(f.a), me(f.b)].sort().join("|"));
  for (let f = 0; f < n.length; f++) for (let T = f + 1; T < n.length; T++) {
    const x = n[f], F = n[T], U = ce(x.a.x, x.b.x), O = ce(F.a.x, F.b.x);
    if (U === O) continue;
    const R = U ? x : F, s = U ? F : x, H = { x: R.a.x, y: s.a.y };
    Fe(H, R) && Fe(H, s) && m(H);
  }
  const y = /* @__PURE__ */ new Map();
  for (const f of n) {
    const T = [...c.values()].filter((x) => Fe(x, f)).sort((x, F) => x.x - F.x || x.y - F.y);
    for (let x = 1; x < T.length; x++) {
      const F = me(T[x - 1]), U = me(T[x]);
      F !== U && y.set([F, U].sort().join("|"), { a: F, b: U, length: nt(T[x - 1], T[x]) });
    }
  }
  const N = new Map([...c.keys()].map((f) => [f, f])), p = (f) => {
    let T = f;
    for (; N.get(T) !== T; ) T = N.get(T);
    for (; f !== T; ) {
      const x = N.get(f);
      N.set(f, T), f = x;
    }
    return T;
  }, E = [...y.entries()].sort(([f, T], [x, F]) => Number(l.has(x)) - Number(l.has(f)) || T.length - F.length || f.localeCompare(x)), A = new Map([...c.keys()].map((f) => [f, /* @__PURE__ */ new Set()]));
  let h = 0;
  for (const [, f] of E) {
    const T = p(f.a), x = p(f.b);
    if (T === x) {
      h++;
      continue;
    }
    N.set(T, x), A.get(f.a).add(f.b), A.get(f.b).add(f.a);
  }
  if (b.length > 1 && b.some((f) => p(f) !== p(b[0]))) throw Error("Geometric net cleanup found disconnected terminals.");
  const v = /* @__PURE__ */ new Set([...b, ...u]), C = [...A].filter(([f, T]) => T.size === 1 && !v.has(f)).map(([f]) => f);
  let V = 0;
  for (; C.length; ) {
    const f = C.pop();
    if (v.has(f) || A.get(f).size !== 1) continue;
    const T = [...A.get(f)][0];
    A.get(f).clear(), A.get(T).delete(f), V++, A.get(T).size === 1 && !v.has(T) && C.push(T);
  }
  for (const [f, T] of A) if (T.size === 2 && !v.has(f)) {
    const [x, F] = [...T], U = c.get(x), O = c.get(f), R = c.get(F);
    (ce(U.x, O.x) && ce(O.x, R.x) || ce(U.y, O.y) && ce(O.y, R.y)) && (A.get(x).delete(f), A.get(F).delete(f), A.get(x).add(F), A.get(F).add(x), T.clear());
  }
  const S = [], $ = /* @__PURE__ */ new Set();
  for (const [f, T] of A) for (const x of T) {
    const F = [f, x].sort().join("|");
    $.has(F) || ($.add(F), S.push({ a: c.get(f), b: c.get(x) }));
  }
  return { segments: S, junctions: [...A].filter(([, f]) => f.size >= 3).map(([f]) => c.get(f)), cyclesRemoved: h, leavesRemoved: V, wireLength: S.reduce((f, T) => f + nt(T.a, T.b), 0) };
}
const ht = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), _e = (n, o, a) => n.replace(new RegExp("(?<![\\w./%:$])" + ht(o) + "(?![\\w./%:$])", "gi"), () => a);
function kt(n, o) {
  const a = o.components.filter((r) => !r.synthetic), c = ge(n.root), u = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), m = a.filter((r) => r.kind === "X"), b = /* @__PURE__ */ new Set(), y = (r, g) => {
    let w = g.includes("/") ? r + "_" + g.replaceAll("/", "_") : g;
    w = w.replace(/[^a-z0-9_.$@&Ö]/gi, "_"), w.toUpperCase().startsWith(r) || (w = r + "_" + w);
    const P = w;
    let L = 1;
    for (; b.has(w.toLowerCase()); ) w = P + "_" + L++;
    return b.add(w.toLowerCase()), w;
  };
  c.forEach((r) => u.set(r.name, y(r.kind, r.name)));
  const N = new Map(m.map((r) => [r.name, y("X", r.name)])), p = new Map(m.map((r, g) => [r.name, "CV_BLOCK_" + g]));
  c.forEach((r) => l.set(r.name, ""));
  for (const r of m) for (const g of ge(n.contexts[r.instanceId])) l.set(g.name, r.name);
  const E = (r) => /^(?:[a-z_][\w.$-]*|\d+)$/i.test(r), A = new Set([...c.flatMap((r) => Object.values(r.terminals)), ...Object.keys(o.nodes)].filter(E).map((r) => r.toLowerCase())), h = /* @__PURE__ */ new Map([["0", "0"]]), v = /* @__PURE__ */ new Set(["0"]);
  let C = 1;
  const V = (r) => {
    if (!h.has(r)) {
      let g = r;
      if (!E(r) || v.has(r.toLowerCase()))
        do
          g = "N_cv" + C++;
        while (A.has(g.toLowerCase()) || v.has(g.toLowerCase()));
      h.set(r, g), v.add(g.toLowerCase());
    }
    return h.get(r);
  };
  for (const r of c) Object.values(r.terminals).forEach(V);
  Object.keys(o.nodes).forEach(V);
  const S = /* @__PURE__ */ new Map();
  for (const r of m) {
    const g = new Set(r.block.ports.map((w) => w.node));
    for (const w of ge(n.contexts[r.instanceId])) for (const P of Object.values(w.terminals)) !g.has(P) && P !== "0" && !n.ir.globals.some((L) => Ie([], L) === P) && S.set(P, r.name);
  }
  const $ = new Map(m.map((r) => [r.name, new Map(r.block.ports.map((g, w) => [g.node, "p" + w]).reverse())])), f = (r, g = "") => {
    if (r === "0") return "0";
    if ($.get(g)?.has(r)) return $.get(g).get(r);
    const w = S.get(r);
    if (g && w && w !== g) throw Error("ASC export: cross-block internal node probe requires expanding both instances: " + r);
    return w && w !== g ? N.get(w) + ":" + V(r) : V(r);
  }, T = (r, g = "") => {
    if (!u.has(r)) throw Error("ASC: unresolved device reference " + r);
    const w = l.get(r);
    if (g && w !== g) throw Error("ASC export: cross-block current probe requires expanding both instances: " + r);
    return w && w !== g ? N.get(w) + ":" + u.get(r) : u.get(r);
  }, x = /* @__PURE__ */ new Map();
  function F(r, g = {}) {
    const w = n.ir.scopes[r.scopeId];
    let P;
    if (!r.id) P = Object.fromEntries(Object.keys(r.params).map((L) => [L, L]));
    else {
      const L = n.contexts[r.path.slice(0, -1).map(encodeURIComponent).join("/")], I = n.ir.scopes[L.scopeId].instances.find((B) => B.name === r.path.at(-1));
      P = Tt(g, w.defaults, w.parameters, I.parameters);
    }
    x.set(r.id, P), r.children.forEach((L) => F(L, P));
  }
  F(n.root);
  const U = (r, g) => {
    const w = r.ports.find((I) => I.name.toLowerCase() === g.toLowerCase());
    if (w) return w.node;
    const P = r.nodes[g.toLowerCase()];
    if (P) return P;
    if (n.ir.globals.includes(g.toLowerCase())) return Ie([], g);
    const L = g.split(":");
    if (L.length > 1) {
      const I = L.pop(), B = [...r.path, ...L].map(encodeURIComponent).join("/"), D = n.contexts[B] || n.contexts[L.map(encodeURIComponent).join("/")];
      if (D) return U(D, I);
    }
    return Ie(r.path, g);
  }, O = (r, g) => {
    const w = r.devices.find((L) => L.localName.toLowerCase() === g.toLowerCase());
    if (w) return w.name;
    const P = g.split(":");
    if (P.length > 1) {
      const L = P.pop(), I = [...r.path, ...P].map(encodeURIComponent).join("/"), D = (n.contexts[I] || n.contexts[P.map(encodeURIComponent).join("/")])?.devices.find((j) => j.localName.toLowerCase() === L.toLowerCase());
      if (D) return D.name;
    }
    throw Error("ASC: unsupported device reference " + g);
  }, R = new Map(Object.keys(o.models).map((r, g) => [r, "CV_MODEL_" + g]));
  function s(r, g) {
    const w = n.contexts[r.instanceId], P = n.ir.scopes[w.scopeId].devices.find((D) => D.name === r.localName), L = [], I = (D) => "__CV_PROBE_" + (L.push(D) - 1) + "__";
    let B = Se(P.value, x.get(w.id), (D) => I(f(U(w, D), g)), (D) => I(T(O(w, D), g)));
    if (P.model && (B = _e(B, P.model, R.get(r.model) || r.model)), B = B.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (D, j, Y) => j + "(" + Y.split(",").map((oe) => {
      const re = oe.trim(), ue = /^__CV_PROBE_(\d+)__$/.exec(re);
      return ue ? L[+ue[1]] : j.toLowerCase() === "v" ? f(U(w, re), g) : T(O(w, re), g);
    }).join(",") + ")"), (P.controlSources || []).forEach((D, j) => {
      B = _e(B, D, T(r.controlSources[j], g));
    }), r.kind === "@") for (const [D, j] of Object.entries(r.terminals)) ["REFNODE", "INTNODE"].includes(D) && (B = B.replace(new RegExp("\\b" + D + "\\s*=\\s*[^\\s]+", "i"), D.toLowerCase() + "=" + f(j, g)));
    return B;
  }
  const H = /* @__PURE__ */ new Map(), W = n.ir.diagnostics.filter((r) => r.severity === "warning").map((r) => r.message);
  function _(r, g = "") {
    if (r.kind === "X") {
      const D = r.block.ports.map((j) => f(j.node, g));
      return { ref: N.get(r.name), kind: "X", pins: r.block.ports.map((j) => j.pin), nodes: D, value: p.get(r.name), line: [N.get(r.name), ...D, p.get(r.name)].join(" ") };
    }
    const w = u.get(r.name), P = Object.entries(r.terminals);
    if (r.kind === "K") {
      const D = s(r, g).split(" · k=").at(-1), j = [w, ...r.coupledInductors.map((Y) => T(Y, g)), D].join(" ");
      return { ref: w, kind: "K", pins: [], nodes: [], value: D, line: j, directive: !0 };
    }
    let L = s(r, g), I = P.map(([D]) => D), B = P.map(([, D]) => f(D, g));
    if (["E", "G"].includes(r.kind) && r.sourceMode === "POLY") {
      const D = /^POLY\(\d+\)\s*/i.exec(L);
      if (!D) throw Error("ASC: invalid POLY source " + r.name);
      L = D[0] + B.slice(2).join(" ") + " " + L.slice(D[0].length), I = I.slice(0, 2), B = B.slice(0, 2), W.push(r.name + ": POLY control nodes remain explicit in the editable Value expression.");
    }
    return r.kind === "@" && (I = I.slice(0, 2), B = B.slice(0, 2)), { ref: w, kind: r.kind, prefix: r.kind === "M" ? r.type.includes("pmos") ? "MP" : "MN" : r.kind, pins: I, nodes: B, electricalNodes: P.map(([, D]) => f(D, g)), value: L, line: [w, ...B, L].filter(Boolean).join(" ") };
  }
  a.forEach((r) => H.set(r.name, _(r)));
  const M = [], G = [];
  for (const r of m) {
    M.push(".subckt " + p.get(r.name) + " " + r.block.ports.map((g, w) => "p" + w).join(" "));
    for (const g of ge(n.contexts[r.instanceId])) {
      const w = _(g, r.name);
      M.push(w.line), G.push({ original: g.name, scope: r.name, ...w });
    }
    M.push(".ends " + p.get(r.name));
  }
  for (const [r, g] of Object.entries(o.models)) {
    const w = n.contexts[g.instanceId], P = n.ir.scopes[w.scopeId], L = decodeURIComponent(r.split("/").at(-1)), I = P.models[L];
    let B = I ? Se(I.raw, x.get(w.id), (D) => f(U(w, D)), (D) => T(O(w, D))) : g.raw;
    B = B.replace(/^(\.model\s+)\S+/i, (D, j) => j + R.get(r));
    for (const [D, j] of R) B = _e(B, D, j);
    if (g.baseModel) {
      const D = w.path.length ? w.path.map(encodeURIComponent).join("/") + "/" : "";
      B = B.replace(new RegExp("(AKO:)" + ht(g.baseModel), "i"), (j, Y) => Y + (R.get(D + g.baseModel.toLowerCase()) || R.get(g.baseModel.toLowerCase()) || g.baseModel));
    }
    M.push(B);
  }
  const k = [];
  for (const r of Object.values(n.contexts))
    if (!(r.id && !ge(r).some((g) => l.has(g.name) && (a.some((w) => w.name === g.name) || m.some((w) => w.name === l.get(g.name))))))
      for (const g of n.ir.scopes[r.scopeId].directives) {
        if (/^\.(?:model|param|global|title)\b/i.test(g.text) && r.id || /^\.(?:model|title)\b/i.test(g.text)) continue;
        if (r.id && !/^\.(?:func|ic|nodeset)\b/i.test(g.text)) throw Error("ASC export: local directive requires scope-preserving export (" + r.id + "): " + g.text);
        if (r.id && /^\.func\b/i.test(g.text)) throw Error("ASC export: local .func requires scope-preserving export (" + r.id + ").");
        const w = [], P = (I) => "__CV_PROBE_" + (w.push(I) - 1) + "__";
        let L = r.id ? Se(g.text, x.get(r.id), (I) => P(f(U(r, I))), (I) => P(T(O(r, I)))) : g.text;
        if (L = L.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (I, B, D) => B + "(" + D.split(",").map((j) => {
          const Y = j.trim(), oe = /^__CV_PROBE_(\d+)__$/.exec(Y);
          if (oe) return w[+oe[1]];
          if (Y === "*") return Y;
          if (/[*?]/.test(Y)) throw Error("ASC export: wildcard probe cannot be renamed reliably: " + Y);
          return B.toLowerCase() === "v" ? f(U(r, Y)) : T(O(r, Y));
        }).join(",") + ")"), /^\.global\b/i.test(L) && (L = ".global " + L.split(/\s+/).slice(1).map((I) => f(U(r, I))).join(" ")), /^\.(?:dc|tf|noise|sens)\b/i.test(L)) for (const I of r.devices) L = _e(L, I.localName, T(I.name));
        k.push(L);
      }
  return { cards: H, library: M, directives: k, nodeNames: h, refs: u, expected: G, warnings: [...new Set(W)], node: f, blockRefs: N, definitions: p };
}
const be = (n) => n.x + "," + n.y, qt = (n, o) => o.a.x === o.b.x ? n.x === o.a.x && n.y >= Math.min(o.a.y, o.b.y) && n.y <= Math.max(o.a.y, o.b.y) : n.y === o.a.y && n.x >= Math.min(o.a.x, o.b.x) && n.x <= Math.max(o.a.x, o.b.x);
function Yt(n) {
  return new TextDecoder(n[0] === 255 && n[1] === 254 ? "utf-16le" : "windows-1252").decode(n);
}
function Xt(n, o) {
  const a = [], c = [], u = [], l = [];
  let m;
  for (const h of n.split(/\r?\n/)) {
    let v;
    if (v = /^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(h)) a.push({ a: { x: +v[1], y: +v[2] }, b: { x: +v[3], y: +v[4] } });
    else if (v = /^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(h)) c.push({ x: +v[1], y: +v[2], name: v[3] });
    else if (v = /^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(h))
      m = { symbol: v[1], x: +v[2], y: +v[3], pins: [], value: "", ref: "" }, u.push(m);
    else if (v = /^SYMATTR (InstName|Value) (.*)$/.exec(h)) {
      if (!m) throw Error("ASC attribute without symbol.");
      m[v[1] === "InstName" ? "ref" : "value"] = v[2];
    } else (v = /^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(h)) && l.push(...v[1].split("\\n"));
  }
  for (const h of u) {
    const v = o[h.symbol + ".asy"];
    if (!v) throw Error("Missing ASC companion " + h.symbol + ".asy");
    let C;
    for (const V of Yt(v).split(/\r?\n/)) {
      let S;
      (S = /^PIN (-?\d+) (-?\d+) /.exec(V)) ? (C = { x: h.x + +S[1], y: h.y + +S[2] }, h.pins.push(C)) : (S = /^PINATTR SpiceOrder (\d+)$/.exec(V)) ? C.order = +S[1] : (S = /^SYMATTR Prefix (\S+)$/.exec(V)) && (h.prefix = S[1]);
    }
    h.pins.sort((V, S) => V.order - S.order);
  }
  const b = /* @__PURE__ */ new Map();
  for (const h of [...a.flatMap((v) => [v.a, v.b]), ...c, ...u.flatMap((v) => v.pins)]) b.set(be(h), h);
  const y = new Map([...b.keys()].map((h) => [h, h])), N = (h) => (y.get(h) !== h && y.set(h, N(y.get(h))), y.get(h)), p = (h, v) => {
    y.set(N(h), N(v));
  };
  for (const h of a) {
    if (h.a.x !== h.b.x && h.a.y !== h.b.y) throw Error("ASC contains a diagonal wire.");
    for (const [v, C] of b) qt(C, h) && p(be(h.a), v);
  }
  const E = /* @__PURE__ */ new Map();
  for (const h of c) {
    const v = N(be(h));
    if (E.has(v) && E.get(v).toLowerCase() !== h.name.toLowerCase()) throw Error("ASC has a short between " + E.get(v) + " and " + h.name);
    E.set(v, h.name);
  }
  for (const h of u) for (const v of h.pins)
    if (v.node = E.get(N(be(v))), !v.node) throw Error("ASC has an unnamed/disconnected pin on " + h.ref);
  const A = u.map((h) => [h.ref, ...h.pins.map((v) => v.node), h.value].join(" "));
  return { symbols: u, wires: a, flags: c, directives: l, netlist: ["* Viewer ASC round trip", ...A, ...l, ".end"].join(`
`) };
}
function Wt(n, o, a) {
  const c = Xt(n, o), u = a.components.filter((m) => !m.directive);
  if (c.symbols.length !== u.length) throw Error("ASC lost or duplicated symbols.");
  let l = 0;
  for (const m of u) {
    const b = c.symbols.find((y) => y.ref === m.ref);
    if (!b || b.value !== m.value || b.prefix !== (m.prefix || m.kind) || JSON.stringify(b.pins.map((y) => y.node)) !== JSON.stringify(m.nodes)) throw Error("ASC component/pin round-trip mismatch: " + m.id);
    l += b.pins.length;
  }
  for (const m of a.components.filter((b) => b.directive)) if (!c.directives.includes(m.line)) throw Error("ASC lost directive device " + m.id);
  return { verified: !0, symbols: u.length, directiveDevices: a.components.length - u.length, pins: l, wires: c.wires.length, namedNets: new Set(c.flags.map((m) => m.name)).size };
}
const zt = (n) => n.x + "," + n.y, ot = (n) => Math.round(n * 1e3) / 1e3, pt = new Map(Array.from({ length: 256 }, (n, o) => [new TextDecoder("windows-1252").decode(new Uint8Array([o])), o]));
function rt(n) {
  const o = [];
  for (const a of n) {
    const c = pt.get(a);
    if (c === void 0) throw Error("LTspice export cannot encode " + a + " (U+" + a.codePointAt(0).toString(16) + ") in Windows-1252.");
    o.push(c);
  }
  return new Uint8Array(o);
}
const gt = (n) => [...String(n)].map((o) => pt.has(o) ? o : o === "⏚" ? "GND" : "[U+" + o.codePointAt(0).toString(16) + "]").join(""), Ne = (n) => String(n).replace(/[\r\n]/g, " ");
function it(n) {
  const o = [...new Set(n.map(ot))].sort((u, l) => u - l), a = /* @__PURE__ */ new Map();
  let c = -1 / 0;
  for (const u of o) {
    const l = Math.max(c + 16, Math.round(u * 2 / 16) * 16 + 64);
    a.set(u, l), c = l;
  }
  return (u) => {
    const l = a.get(ot(u));
    if (l === void 0) throw Error("Missing layout coordinate.");
    return l;
  };
}
function Ht(n, o, a, c) {
  const u = c.x(n.x), l = c.y(n.y), m = c.x(n.x + n.width) - u, b = c.y(n.y + n.height) - l, y = n.ports.map((A) => ({ ...A, x: c.x(A.x) - u, y: c.y(A.y) - l })), N = ["Version 4", "SymbolType CELL"], p = (A, h) => N.push(`LINE Normal ${Math.round(A.x)} ${Math.round(A.y)} ${Math.round(h.x)} ${Math.round(h.y)}`), E = y.length === 2 && ["R", "C", "L", "D", "V", "I", "B"].includes(o.kind);
  if (E) {
    const [A, h] = y, v = Math.abs(A.x - h.x) < 0.1, C = { x: (A.x + h.x) / 2, y: (A.y + h.y) / 2 }, V = Math.abs(v ? h.y - A.y : h.x - A.x), S = Math.min(32, V / 4), $ = Math.sign(v ? h.y - A.y : h.x - A.x), f = (T, x) => v ? { x: C.x + x, y: C.y + T * $ } : { x: C.x + T * $, y: C.y + x };
    if (p(A, f(-S, 0)), p(f(S, 0), h), o.kind === "C")
      p(f(-6, -20), f(-6, 20)), p(f(6, -20), f(6, 20)), p(f(-S, 0), f(-6, 0)), p(f(6, 0), f(S, 0));
    else if (["R", "L"].includes(o.kind)) {
      const T = [[-S, 0], [-S + 6, 0], [-S + 12, -12], [-S + 22, 12], [-S + 32, -12], [S - 6, 0], [S, 0]];
      for (let x = 1; x < T.length; x++) p(f(...T[x - 1]), f(...T[x]));
    } else o.kind === "D" ? (p(f(-S, 0), f(-12, 0)), p(f(12, 0), f(S, 0)), p(f(-12, -18), f(-12, 18)), p(f(-12, 18), f(12, 0)), p(f(12, 0), f(-12, -18)), p(f(12, -18), f(12, 18))) : (N.push(`CIRCLE Normal ${Math.round(C.x - 24)} ${Math.round(C.y - 24)} ${Math.round(C.x + 24)} ${Math.round(C.y + 24)}`), p(f(-S, 0), f(-24, 0)), p(f(24, 0), f(S, 0)), p(f(-12, -6), f(-12, 6)), p(f(-18, 0), f(-6, 0)), p(f(12, -6), f(12, 6)));
  } else {
    N.push(`RECTANGLE Normal 16 16 ${Math.max(32, m - 16)} ${Math.max(32, b - 16)}`);
    for (const h of y) {
      const v = { x: Math.max(16, Math.min(m - 16, h.x)), y: Math.max(16, Math.min(b - 16, h.y)) };
      p(h, v), N.push(`TEXT ${Math.round(v.x + 4)} ${Math.round(v.y + 4)} Left 1 ${Ne(gt(o.block?.ports.find((C) => C.pin === h.pin)?.label || o.pinLabels?.[Object.keys(o.terminals).indexOf(h.pin)] || h.pin))}`);
    }
  }
  E && Math.abs(y[0].x - y[1].x) < 0.1 ? N.push(`WINDOW 0 ${Math.round(y[0].x + 40)} 24 Left 2`, `WINDOW 3 ${Math.round(y[0].x + 40)} 56 Left 2`) : E ? N.push(`WINDOW 0 ${Math.round(m / 2)} 16 Center 2`, `WINDOW 3 ${Math.round(m / 2)} 40 Center 2`) : N.push("WINDOW 0 24 32 Left 2", "WINDOW 3 24 64 Left 2"), N.push("SYMATTR Prefix " + (a.prefix || a.kind));
  for (const [A, h] of a.pins.entries()) {
    const v = y.find((C) => C.pin === h);
    if (!v) throw Error("ASC symbol missing pin " + o.name + "." + h);
    N.push(`PIN ${v.x} ${v.y} NONE 0`, "PINATTR PinName " + Ne(h), "PINATTR SpiceOrder " + (A + 1));
  }
  return N.join(`\r
`) + `\r
`;
}
function Kt({ tree: n, circuit: o, drawing: a, source: c = "", libraries: u = {} }) {
  if (!a) throw Error("ASC export requires a conventional layout. Enable Circuit layout rules and generate again.");
  const l = kt(n, o), m = new Map(o.components.map((_) => [_.name, _]));
  if (a.components.length !== m.size || a.components.some((_) => !m.has(_.id) || _.ports.some((M) => o.nodes[m.get(_.id).terminals[M.pin]]?.bit !== M.bit))) throw Error("ASC: stale layout or mismatched pin/net mapping. Generate again.");
  const b = [], y = [], N = (_) => {
    b.push(_.x), y.push(_.y);
  };
  for (const _ of a.components)
    N(_), N({ x: _.x + _.width, y: _.y + _.height }), _.ports.forEach(N);
  a.segments.forEach((_) => {
    N(_.a), N(_.b);
  });
  const p = { x: it(b), y: it(y) }, E = (_) => ({ x: p.x(_.x), y: p.y(_.y) }), A = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
  for (const _ of a.components) for (const M of _.ports)
    h.has(M.bit) || h.set(M.bit, []), h.get(M.bit).push(M);
  for (const _ of a.segments)
    A.has(_.bit) || A.set(_.bit, []), A.get(_.bit).push(_);
  const v = [];
  for (const [_, M] of h) {
    const G = $t(A.get(_) || [], M);
    for (const k of G.segments) v.push({ bit: _, a: E(k.a), b: E(k.b) });
  }
  const C = Math.max(...b.map(p.x)), V = Math.max(...y.map(p.y)), S = ["Version 4", `SHEET 1 ${C + 256} ${V + 512}`], $ = /* @__PURE__ */ new Map(), f = {}, T = { version: 1, focus: o.focus, topology: o.topology.signature, components: [], nodes: [], warnings: l.warnings }, x = (_, M) => {
    const G = zt(_);
    if ($.has(G) && $.get(G) !== M) throw Error("ASC grid would short two nets at " + G);
    $.set(G, M);
  }, F = /* @__PURE__ */ new Set();
  for (const _ of a.components) {
    const M = m.get(_.id);
    if (!M) throw Error("Layout snapshot no longer matches circuit.");
    for (const G of _.ports) {
      const k = l.node(M.terminals[G.pin]);
      F.has(k) || (x(E(G), k), F.add(k));
    }
  }
  for (const _ of v) S.push(`WIRE ${_.a.x} ${_.a.y} ${_.b.x} ${_.b.y}`);
  for (const [_, M] of $) S.push("FLAG " + _.replace(",", " ") + " " + M);
  let U = 0;
  const O = /* @__PURE__ */ new Map();
  for (const _ of a.components) {
    const M = m.get(_.id);
    if (M.synthetic) continue;
    const G = l.cards.get(M.name);
    if (G.directive) {
      S.push(`TEXT ${p.x(_.x)} ${p.y(_.y)} Left 2 !${Ne(G.line)}`), T.components.push({ id: M.name, ...G, directive: !0 });
      continue;
    }
    const k = Ht(_, M, G, p);
    let r = O.get(k);
    r || (r = "cv_symbol_" + U++, O.set(k, r), f[r + ".asy"] = rt(k)), S.push(`SYMBOL ${r} ${p.x(_.x)} ${p.y(_.y)} R0`, "SYMATTR InstName " + G.ref, "SYMATTR Value " + Ne(G.value)), T.components.push({ id: M.name, ...G, symbol: r, ports: _.ports.map((g) => ({ pin: g.pin, ...E(g), node: l.node(M.terminals[g.pin]) })) });
  }
  const R = [...l.directives, ...l.library];
  if (R.some((_) => _.includes("\\n"))) throw Error("ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.");
  const s = [c, ...Object.values(u)].flatMap((_) => _.split(/\r?\n/).filter((M) => /^\s*\*/.test(M))).map((_) => gt(_).replaceAll("\\", "/"));
  (R.length || s.length) && S.push(`TEXT 64 ${V + 160} Left 2 !` + [...R, ...s].map((_) => _.replace(/\r?\n/g, "\\n")).join("\\n"));
  const H = S.join(`\r
`) + `\r
`;
  T.nodes = [...l.nodeNames].map(([_, M]) => ({ original: _, exported: M })), T.leaves = [...l.expected, ...o.components.filter((_) => !_.synthetic && _.kind !== "X").map((_) => ({ original: _.name, scope: "", ...l.cards.get(_.name) }))], T.blocks = [...l.blockRefs].map(([_, M]) => ({ original: _, ref: M, ltspiceRef: "X§" + M }));
  const W = Wt(H, f, T);
  T.audit = W, f["spice-schematic.asc"] = rt(H), f["manifest.json"] = he(JSON.stringify(T, null, 2)), f["source.cir"] = he(c);
  for (const [_, M] of Object.entries(u)) {
    const G = _.replaceAll("\\", "/").split("/").filter((k) => k && k !== "." && k !== "..").join("/");
    G && (f["source-libraries/" + G] = he(M));
  }
  return f["README.txt"] = he(`Extract ALL files into one folder, then open spice-schematic.asc in LTspice.
The .asy files are locally generated symbols and are required by the ASC.
Positions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.
manifest.json contains original/exported names, values, ports and the connectivity audit.
Collapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.
source.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.
Simulation behavior depends on LTspice model support; connectivity validation is not a simulation result.
` + l.warnings.join(`
`)), { asc: H, ascBytes: f["spice-schematic.asc"], zip: Lt(f, { level: 6 }), files: f, manifest: T };
}
export {
  Kt as exportAsc,
  rt as ltspiceBytes
};
