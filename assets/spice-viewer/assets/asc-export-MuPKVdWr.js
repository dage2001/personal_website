import { l as ge, n as Ie, b as Se, p as Tt } from "./ui-CTKne_h0.js";
var J = Uint8Array, ne = Uint16Array, Ve = Int32Array, ke = new J([
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
]), Ge = new J([
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
]), Ye = new J([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), at = function(o, n) {
  for (var a = new ne(31), c = 0; c < 31; ++c)
    a[c] = n += 1 << o[c - 1];
  for (var f = new Ve(a[30]), c = 1; c < 30; ++c)
    for (var l = a[c]; l < a[c + 1]; ++l)
      f[l] = l - a[c] << 5 | c;
  return { b: a, r: f };
}, st = at(ke, 2), Et = st.b, Pe = st.r;
Et[28] = 258, Pe[258] = 28;
var yt = at(Ge, 0), Xe = yt.r, Be = new ne(32768);
for (var X = 0; X < 32768; ++X) {
  var le = (X & 43690) >> 1 | (X & 21845) << 1;
  le = (le & 52428) >> 2 | (le & 13107) << 2, le = (le & 61680) >> 4 | (le & 3855) << 4, Be[X] = ((le & 65280) >> 8 | (le & 255) << 8) >> 1;
}
var Ee = (function(o, n, a) {
  for (var c = o.length, f = 0, l = new ne(n); f < c; ++f)
    o[f] && ++l[o[f] - 1];
  var m = new ne(n);
  for (f = 1; f < n; ++f)
    m[f] = m[f - 1] + l[f - 1] << 1;
  var x;
  if (a) {
    x = new ne(1 << n);
    var E = 15 - n;
    for (f = 0; f < c; ++f)
      if (o[f])
        for (var N = f << 4 | o[f], p = n - o[f], y = m[o[f] - 1]++ << p, A = y | (1 << p) - 1; y <= A; ++y)
          x[Be[y] >> E] = N;
  } else
    for (x = new ne(c), f = 0; f < c; ++f)
      o[f] && (x[f] = Be[m[o[f] - 1]++] >> 15 - o[f]);
  return x;
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
var _t = /* @__PURE__ */ Ee(fe, 9, 0), bt = /* @__PURE__ */ Ee(xe, 5, 0), ct = function(o) {
  return (o + 7) / 8 | 0;
}, lt = function(o, n, a) {
  return (a == null || a > o.length) && (a = o.length), new J(o.subarray(n, a));
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
], Ae = function(o, n, a) {
  var c = new Error(n || xt[o]);
  if (c.code = o, Error.captureStackTrace && Error.captureStackTrace(c, Ae), !a)
    throw c;
  return c;
}, se = function(o, n, a) {
  a <<= n & 7;
  var c = n / 8 | 0;
  o[c] |= a, o[c + 1] |= a >> 8;
}, ve = function(o, n, a) {
  a <<= n & 7;
  var c = n / 8 | 0;
  o[c] |= a, o[c + 1] |= a >> 8, o[c + 2] |= a >> 16;
}, De = function(o, n) {
  for (var a = [], c = 0; c < o.length; ++c)
    o[c] && a.push({ s: c, f: o[c] });
  var f = a.length, l = a.slice();
  if (!f)
    return { t: ut, l: 0 };
  if (f == 1) {
    var m = new J(a[0].s + 1);
    return m[a[0].s] = 1, { t: m, l: 1 };
  }
  a.sort(function(_, O) {
    return _.f - O.f;
  }), a.push({ s: -1, f: 25001 });
  var x = a[0], E = a[1], N = 0, p = 1, y = 2;
  for (a[0] = { s: -1, f: x.f + E.f, l: x, r: E }; p != f - 1; )
    x = a[a[N].f < a[y].f ? N++ : y++], E = a[N != p && a[N].f < a[y].f ? N++ : y++], a[p++] = { s: -1, f: x.f + E.f, l: x, r: E };
  for (var A = l[0].s, c = 1; c < f; ++c)
    l[c].s > A && (A = l[c].s);
  var h = new ne(A + 1), T = je(a[p - 1], h, 0);
  if (T > n) {
    var c = 0, I = 0, j = T - n, F = 1 << j;
    for (l.sort(function(O, B) {
      return h[B.s] - h[O.s] || O.f - B.f;
    }); c < f; ++c) {
      var P = l[c].s;
      if (h[P] > n)
        I += F - (1 << T - h[P]), h[P] = n;
      else
        break;
    }
    for (I >>= j; I > 0; ) {
      var g = l[c].s;
      h[g] < n ? I -= 1 << n - h[g]++ - 1 : ++c;
    }
    for (; c >= 0 && I; --c) {
      var d = l[c].s;
      h[d] == n && (--h[d], ++I);
    }
    T = n;
  }
  return { t: new J(h), l: T };
}, je = function(o, n, a) {
  return o.s == -1 ? Math.max(je(o.l, n, a + 1), je(o.r, n, a + 1)) : n[o.s] = a;
}, We = function(o) {
  for (var n = o.length; n && !o[--n]; )
    ;
  for (var a = new ne(++n), c = 0, f = o[0], l = 1, m = function(E) {
    a[c++] = E;
  }, x = 1; x <= n; ++x)
    if (o[x] == f && x != n)
      ++l;
    else {
      if (!f && l > 2) {
        for (; l > 138; l -= 138)
          m(32754);
        l > 2 && (m(l > 10 ? l - 11 << 5 | 28690 : l - 3 << 5 | 12305), l = 0);
      } else if (l > 3) {
        for (m(f), --l; l > 6; l -= 6)
          m(8304);
        l > 2 && (m(l - 3 << 5 | 8208), l = 0);
      }
      for (; l--; )
        m(f);
      l = 1, f = o[x];
    }
  return { c: a.subarray(0, c), n };
}, Te = function(o, n) {
  for (var a = 0, c = 0; c < n.length; ++c)
    a += o[c] * n[c];
  return a;
}, ft = function(o, n, a) {
  var c = a.length, f = ct(n + 2);
  o[f] = c & 255, o[f + 1] = c >> 8, o[f + 2] = o[f] ^ 255, o[f + 3] = o[f + 1] ^ 255;
  for (var l = 0; l < c; ++l)
    o[f + l + 4] = a[l];
  return (f + 4 + c) * 8;
}, ze = function(o, n, a, c, f, l, m, x, E, N, p) {
  se(n, p++, a), ++f[256];
  for (var y = De(f, 15), A = y.t, h = y.l, T = De(l, 15), I = T.t, j = T.l, F = We(A), P = F.c, g = F.n, d = We(I), _ = d.c, O = d.n, B = new ne(19), D = 0; D < P.length; ++D)
    ++B[P[D] & 31];
  for (var D = 0; D < _.length; ++D)
    ++B[_[D] & 31];
  for (var R = De(B, 7), s = R.t, H = R.l, W = 19; W > 4 && !s[Ye[W - 1]]; --W)
    ;
  var b = N + 5 << 3, M = Te(f, fe) + Te(l, xe) + m, G = Te(f, A) + Te(l, I) + m + 14 + 3 * W + Te(B, s) + 2 * B[16] + 3 * B[17] + 7 * B[18];
  if (E >= 0 && b <= M && b <= G)
    return ft(n, p, o.subarray(E, E + N));
  var $, i, v, w;
  if (se(n, p, 1 + (G < M)), p += 2, G < M) {
    $ = Ee(A, h, 0), i = A, v = Ee(I, j, 0), w = I;
    var U = Ee(s, H, 0);
    se(n, p, g - 257), se(n, p + 5, O - 1), se(n, p + 10, W - 4), p += 14;
    for (var D = 0; D < W; ++D)
      se(n, p + 3 * D, s[Ye[D]]);
    p += 3 * W;
    for (var L = [P, _], C = 0; C < 2; ++C)
      for (var V = L[C], D = 0; D < V.length; ++D) {
        var S = V[D] & 31;
        se(n, p, U[S]), p += s[S], S > 15 && (se(n, p, V[D] >> 5 & 127), p += V[D] >> 12);
      }
  } else
    $ = _t, i = fe, v = bt, w = xe;
  for (var D = 0; D < x; ++D) {
    var k = c[D];
    if (k > 255) {
      var S = k >> 18 & 31;
      ve(n, p, $[S + 257]), p += i[S + 257], S > 7 && (se(n, p, k >> 23 & 31), p += ke[S]);
      var Y = k & 31;
      ve(n, p, v[Y]), p += w[Y], Y > 3 && (ve(n, p, k >> 5 & 8191), p += Ge[Y]);
    } else
      ve(n, p, $[k]), p += i[k];
  }
  return ve(n, p, $[256]), p + i[256];
}, wt = /* @__PURE__ */ new Ve([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ut = /* @__PURE__ */ new J(0), Nt = function(o, n, a, c, f, l) {
  var m = l.z || o.length, x = new J(c + m + 5 * (1 + Math.ceil(m / 7e3)) + f), E = x.subarray(c, x.length - f), N = l.l, p = (l.r || 0) & 7;
  if (n) {
    p && (E[0] = l.r >> 3);
    for (var y = wt[n - 1], A = y >> 13, h = y & 8191, T = (1 << a) - 1, I = l.p || new ne(32768), j = l.h || new ne(T + 1), F = Math.ceil(a / 3), P = 2 * F, g = function(e) {
      return (o[e] ^ o[e + 1] << F ^ o[e + 2] << P) & T;
    }, d = new Ve(25e3), _ = new ne(288), O = new ne(32), B = 0, D = 0, R = l.i || 0, s = 0, H = l.w || 0, W = 0; R + 2 < m; ++R) {
      var b = g(R), M = R & 32767, G = j[b];
      if (I[M] = G, j[b] = M, H <= R) {
        var $ = m - R;
        if ((B > 7e3 || s > 24576) && ($ > 423 || !N)) {
          p = ze(o, E, 0, d, _, O, D, s, W, R - W, p), s = B = D = 0, W = R;
          for (var i = 0; i < 286; ++i)
            _[i] = 0;
          for (var i = 0; i < 30; ++i)
            O[i] = 0;
        }
        var v = 2, w = 0, U = h, L = M - G & 32767;
        if ($ > 2 && b == g(R - L))
          for (var C = Math.min(A, $) - 1, V = Math.min(32767, R), S = Math.min(258, $); L <= V && --U && M != G; ) {
            if (o[R + v] == o[R + v - L]) {
              for (var k = 0; k < S && o[R + k] == o[R + k - L]; ++k)
                ;
              if (k > v) {
                if (v = k, w = L, k > C)
                  break;
                for (var Y = Math.min(L, k - 2), oe = 0, i = 0; i < Y; ++i) {
                  var ie = R - L + i & 32767, ue = I[ie], pe = ie - ue & 32767;
                  pe > oe && (oe = pe, G = ie);
                }
              }
            }
            M = G, G = I[M], L += M - G & 32767;
          }
        if (w) {
          d[s++] = 268435456 | Pe[v] << 18 | Xe[w];
          var de = Pe[v] & 31, ye = Xe[w] & 31;
          D += ke[de] + Ge[ye], ++_[257 + de], ++O[ye], H = R + v, ++B;
        } else
          d[s++] = o[R], ++_[o[R]];
      }
    }
    for (R = Math.max(R, H); R < m; ++R)
      d[s++] = o[R], ++_[o[R]];
    p = ze(o, E, N, d, _, O, D, s, W, R - W, p), N || (l.r = p & 7 | E[p / 8 | 0] << 3, p -= 7, l.h = j, l.p = I, l.i = R, l.w = H);
  } else {
    for (var R = l.w || 0; R < m + N; R += 65535) {
      var t = R + 65535;
      t >= m && (E[p / 8 | 0] = N, t = m), p = ft(E, p + 1, o.subarray(R, t));
    }
    l.i = m;
  }
  return lt(x, 0, c + ct(p) + f);
}, At = /* @__PURE__ */ (function() {
  for (var o = new Int32Array(256), n = 0; n < 256; ++n) {
    for (var a = n, c = 9; --c; )
      a = (a & 1 && -306674912) ^ a >>> 1;
    o[n] = a;
  }
  return o;
})(), Ct = function() {
  var o = -1;
  return {
    p: function(n) {
      for (var a = o, c = 0; c < n.length; ++c)
        a = At[a & 255 ^ n[c]] ^ a >>> 8;
      o = a;
    },
    d: function() {
      return ~o;
    }
  };
}, It = function(o, n, a, c, f) {
  if (!f && (f = { l: 1 }, n.dictionary)) {
    var l = n.dictionary.subarray(-32768), m = new J(l.length + o.length);
    m.set(l), m.set(o, l.length), o = m, f.w = l.length;
  }
  return Nt(o, n.level == null ? 6 : n.level, n.mem == null ? f.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(o.length))) * 1.5) : 20 : 12 + n.mem, a, c, f);
}, dt = function(o, n) {
  var a = {};
  for (var c in o)
    a[c] = o[c];
  for (var c in n)
    a[c] = n[c];
  return a;
}, Z = function(o, n, a) {
  for (; a; ++n)
    o[n] = a, a >>>= 8;
};
function St(o, n) {
  return It(o, n || {}, 0, 0);
}
var mt = function(o, n, a, c) {
  for (var f in o) {
    var l = o[f], m = n + f, x = c;
    Array.isArray(l) && (x = dt(c, l[1]), l = l[0]), l instanceof J ? a[m] = [l, x] : (a[m += "/"] = [new J(0), x], mt(l, m, a, c));
  }
}, He = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Dt = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Ot = 0;
try {
  Dt.decode(ut, { stream: !0 }), Ot = 1;
} catch {
}
function he(o, n) {
  var a;
  if (He)
    return He.encode(o);
  for (var c = o.length, f = new J(o.length + (o.length >> 1)), l = 0, m = function(N) {
    f[l++] = N;
  }, a = 0; a < c; ++a) {
    if (l + 5 > f.length) {
      var x = new J(l + 8 + (c - a << 1));
      x.set(f), f = x;
    }
    var E = o.charCodeAt(a);
    E < 128 || n ? m(E) : E < 2048 ? (m(192 | E >> 6), m(128 | E & 63)) : E > 55295 && E < 57344 ? (E = 65536 + (E & 1047552) | o.charCodeAt(++a) & 1023, m(240 | E >> 18), m(128 | E >> 12 & 63), m(128 | E >> 6 & 63), m(128 | E & 63)) : (m(224 | E >> 12), m(128 | E >> 6 & 63), m(128 | E & 63));
  }
  return lt(f, 0, l);
}
var Ue = function(o) {
  var n = 0;
  if (o)
    for (var a in o) {
      var c = o[a].length;
      c > 65535 && Ae(9), n += c + 4;
    }
  return n;
}, Qe = function(o, n, a, c, f, l, m, x) {
  var E = c.length, N = a.extra, p = x && x.length, y = Ue(N);
  Z(o, n, m != null ? 33639248 : 67324752), n += 4, m != null && (o[n++] = 20, o[n++] = a.os), o[n] = 20, n += 2, o[n++] = a.flag << 1 | (l < 0 && 8), o[n++] = f && 8, o[n++] = a.compression & 255, o[n++] = a.compression >> 8;
  var A = new Date(a.mtime == null ? Date.now() : a.mtime), h = A.getFullYear() - 1980;
  if ((h < 0 || h > 119) && Ae(10), Z(o, n, h << 25 | A.getMonth() + 1 << 21 | A.getDate() << 16 | A.getHours() << 11 | A.getMinutes() << 5 | A.getSeconds() >> 1), n += 4, l != -1 && (Z(o, n, a.crc), Z(o, n + 4, l < 0 ? -l - 2 : l), Z(o, n + 8, a.size)), Z(o, n + 12, E), Z(o, n + 14, y), n += 16, m != null && (Z(o, n, p), Z(o, n + 6, a.attrs), Z(o, n + 10, m), n += 14), o.set(c, n), n += E, y)
    for (var T in N) {
      var I = N[T], j = I.length;
      Z(o, n, +T), Z(o, n + 2, j), o.set(I, n + 4), n += 4 + j;
    }
  return p && (o.set(x, n), n += p), n;
}, Mt = function(o, n, a, c, f) {
  Z(o, n, 101010256), Z(o, n + 8, a), Z(o, n + 10, a), Z(o, n + 12, c), Z(o, n + 16, f);
};
function Lt(o, n) {
  n || (n = {});
  var a = {}, c = [];
  mt(o, "", a, n);
  var f = 0, l = 0;
  for (var m in a) {
    var x = a[m], E = x[0], N = x[1], p = N.level == 0 ? 0 : 8, y = he(m), A = y.length, h = N.comment, T = h && he(h), I = T && T.length, j = Ue(N.extra);
    A > 65535 && Ae(11);
    var F = p ? St(E, N) : E, P = F.length, g = Ct();
    g.p(E), c.push(dt(N, {
      size: E.length,
      crc: g.d(),
      c: F,
      f: y,
      m: T,
      u: A != m.length || T && h.length != I,
      o: f,
      compression: p
    })), f += 30 + A + j + P, l += 76 + 2 * (A + j) + (I || 0) + P;
  }
  for (var d = new J(l + 22), _ = f, O = l - f, B = 0; B < c.length; ++B) {
    var y = c[B];
    Qe(d, y.o, y, y.f, y.u, y.c.length);
    var D = 30 + y.f.length + Ue(y.extra);
    d.set(y.c, y.o + D), Qe(d, f, y, y.f, y.u, y.c.length, y.o, y.m), f += 16 + D + (y.m ? y.m.length : 0);
  }
  return Mt(d, f, c.length, O, _), d;
}
function Rt(o) {
  if (Object.prototype.hasOwnProperty.call(o, "__esModule")) return o;
  var n = o.default;
  if (typeof n == "function") {
    var a = function c() {
      var f = !1;
      try {
        f = this instanceof c;
      } catch {
      }
      return f ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    a.prototype = n.prototype;
  } else a = {};
  return Object.defineProperty(a, "__esModule", { value: !0 }), Object.keys(o).forEach(function(c) {
    var f = Object.getOwnPropertyDescriptor(o, c);
    Object.defineProperty(a, c, f.get ? f : {
      enumerable: !0,
      get: function() {
        return o[c];
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
  return Ke || (Ke = 1, (function(o) {
    (function(n) {
      n.parser = function(t, e) {
        return new c(t, e);
      }, n.SAXParser = c, n.SAXStream = y, n.createStream = N, n.MAX_BUFFER_LENGTH = 64 * 1024;
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
      n.EVENTS = [
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
        var u = this;
        l(u), u.q = u.c = "", u.bufferCheckPosition = n.MAX_BUFFER_LENGTH, u.encoding = null, u.opt = e || {}, u.opt.lowercase = u.opt.lowercase || u.opt.lowercasetags, u.looseCase = u.opt.lowercase ? "toLowerCase" : "toUpperCase", u.opt.maxEntityCount = u.opt.maxEntityCount || 512, u.opt.maxEntityDepth = u.opt.maxEntityDepth || 4, u.entityCount = u.entityDepth = 0, u.tags = [], u.closed = u.closedRoot = u.sawRoot = !1, u.tag = u.error = null, u.strict = !!t, u.noscript = !!(t || u.opt.noscript), u.state = s.BEGIN, u.strictEntities = u.opt.strictEntities, u.ENTITIES = u.strictEntities ? Object.create(n.XML_ENTITIES) : Object.create(n.ENTITIES), u.attribList = [], u.opt.xmlns && (u.ns = Object.create(j)), u.opt.unquotedAttributeValues === void 0 && (u.opt.unquotedAttributeValues = !t), u.trackPosition = u.opt.position !== !1, u.trackPosition && (u.position = u.line = u.column = 0), W(u, "onready");
      }
      Object.create || (Object.create = function(t) {
        function e() {
        }
        e.prototype = t;
        var u = new e();
        return u;
      }), Object.keys || (Object.keys = function(t) {
        var e = [];
        for (var u in t) t.hasOwnProperty(u) && e.push(u);
        return e;
      });
      function f(t) {
        for (var e = Math.max(n.MAX_BUFFER_LENGTH, 10), u = 0, r = 0, q = a.length; r < q; r++) {
          var z = t[a[r]].length;
          if (z > e)
            switch (a[r]) {
              case "textNode":
                v(t);
                break;
              case "cdata":
                i(t, "oncdata", t.cdata), t.cdata = "";
                break;
              case "script":
                i(t, "onscript", t.script), t.script = "";
                break;
              default:
                U(t, "Max buffer length exceeded: " + a[r]);
            }
          u = Math.max(u, z);
        }
        var Q = n.MAX_BUFFER_LENGTH - u;
        t.bufferCheckPosition = Q + t.position;
      }
      function l(t) {
        for (var e = 0, u = a.length; e < u; e++)
          t[a[e]] = "";
      }
      function m(t) {
        v(t), t.cdata !== "" && (i(t, "oncdata", t.cdata), t.cdata = ""), t.script !== "" && (i(t, "onscript", t.script), t.script = "");
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
      var x;
      try {
        x = Bt.Stream;
      } catch {
        x = function() {
        };
      }
      x || (x = function() {
      });
      var E = n.EVENTS.filter(function(t) {
        return t !== "error" && t !== "end";
      });
      function N(t, e) {
        return new y(t, e);
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
      function y(t, e) {
        if (!(this instanceof y))
          return new y(t, e);
        x.apply(this), this._parser = new c(t, e), this.writable = !0, this.readable = !0;
        var u = this;
        this._parser.onend = function() {
          u.emit("end");
        }, this._parser.onerror = function(r) {
          u.emit("error", r), u._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, E.forEach(function(r) {
          Object.defineProperty(u, "on" + r, {
            get: function() {
              return u._parser["on" + r];
            },
            set: function(q) {
              if (!q)
                return u.removeAllListeners(r), u._parser["on" + r] = q, q;
              u.on(r, q);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      y.prototype = Object.create(x.prototype, {
        constructor: {
          value: y
        }
      }), y.prototype._decodeBuffer = function(t, e) {
        if (this._decoderBuffer && (t = Buffer.concat([this._decoderBuffer, t]), this._decoderBuffer = null), !this._decoder) {
          var u = p(t, e);
          if (!u)
            return this._decoderBuffer = t, "";
          this._parser.encoding = u, this._decoder = new TextDecoder(u);
        }
        return this._decoder.decode(t, { stream: !e });
      }, y.prototype.write = function(t) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(t))
          t = this._decodeBuffer(t, !1);
        else if (this._decoderBuffer) {
          var e = this._decodeBuffer(Buffer.alloc(0), !0);
          e && (this._parser.write(e), this.emit("data", e));
        }
        return this._parser.write(t.toString()), this.emit("data", t), !0;
      }, y.prototype.end = function(t) {
        if (t && t.length && this.write(t), this._decoderBuffer) {
          var e = this._decodeBuffer(Buffer.alloc(0), !0);
          e && (this._parser.write(e), this.emit("data", e));
        } else if (this._decoder) {
          var u = this._decoder.decode();
          u && (this._parser.write(u), this.emit("data", u));
        }
        return this._parser.end(), !0;
      }, y.prototype.on = function(t, e) {
        var u = this;
        return !u._parser["on" + t] && E.indexOf(t) !== -1 && (u._parser["on" + t] = function() {
          var r = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          r.splice(0, 0, t), u.emit.apply(u, r);
        }), x.prototype.on.call(u, t, e);
      };
      var A = /^\[CDATA\[$/i, h = /^DOCTYPE$/i, T = "http://www.w3.org/XML/1998/namespace", I = "http://www.w3.org/2000/xmlns/", j = { xml: T, xmlns: I }, F = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, P = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, g = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, d = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function _(t) {
        return t === " " || t === `
` || t === "\r" || t === "	";
      }
      function O(t) {
        return t === '"' || t === "'";
      }
      function B(t) {
        return t === ">" || _(t);
      }
      function D(t, e) {
        return t.test(e);
      }
      function R(t, e) {
        return !D(t, e);
      }
      var s = 0;
      n.STATE = {
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
      }, n.XML_ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }), n.ENTITIES = Object.assign(/* @__PURE__ */ Object.create(null), {
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
      }), Object.keys(n.ENTITIES).forEach(function(t) {
        var e = n.ENTITIES[t], u = typeof e == "number" ? String.fromCharCode(e) : e;
        n.ENTITIES[t] = u;
      });
      for (var H in n.STATE)
        n.STATE[n.STATE[H]] = H;
      s = n.STATE;
      function W(t, e, u) {
        t[e] && t[e](u);
      }
      function b(t) {
        var e = t && t.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return e ? e[2] : null;
      }
      function M(t) {
        return t ? t.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function G(t, e) {
        const u = M(t), r = M(e);
        return !u || !r ? !0 : r === "utf16" ? u === "utf16le" || u === "utf16be" : u === r;
      }
      function $(t, e) {
        if (!(!t.strict || !t.encoding || !e || e.name !== "xml")) {
          var u = b(e.body);
          u && !G(t.encoding, u) && C(
            t,
            "XML declaration encoding " + u + " does not match detected stream encoding " + t.encoding.toUpperCase()
          );
        }
      }
      function i(t, e, u) {
        t.textNode && v(t), W(t, e, u);
      }
      function v(t) {
        t.textNode = w(t.opt, t.textNode), t.textNode && W(t, "ontext", t.textNode), t.textNode = "";
      }
      function w(t, e) {
        return t.trim && (e = e.trim()), t.normalize && (e = e.replace(/\s+/g, " ")), e;
      }
      function U(t, e) {
        return v(t), t.trackPosition && (e += `
Line: ` + t.line + `
Column: ` + t.column + `
Char: ` + t.c), e = new Error(e), t.error = e, W(t, "onerror", e), t;
      }
      function L(t) {
        return t.sawRoot && !t.closedRoot && C(t, "Unclosed root tag"), t.state !== s.BEGIN && t.state !== s.BEGIN_WHITESPACE && t.state !== s.TEXT && U(t, "Unexpected end"), v(t), t.c = "", t.closed = !0, W(t, "onend"), c.call(t, t.strict, t.opt), t;
      }
      function C(t, e) {
        if (typeof t != "object" || !(t instanceof c))
          throw new Error("bad call to strictFail");
        t.strict && U(t, e);
      }
      function V(t) {
        t.strict || (t.tagName = t.tagName[t.looseCase]());
        var e = t.tags[t.tags.length - 1] || t, u = t.tag = { name: t.tagName, attributes: {} };
        t.opt.xmlns && (u.ns = e.ns), t.attribList.length = 0, i(t, "onopentagstart", u);
      }
      function S(t, e) {
        var u = t.indexOf(":"), r = u < 0 ? ["", t] : t.split(":"), q = r[0], z = r[1];
        return e && t === "xmlns" && (q = "xmlns", z = ""), { prefix: q, local: z };
      }
      function k(t) {
        if (t.strict || (t.attribName = t.attribName[t.looseCase]()), t.attribList.indexOf(t.attribName) !== -1 || t.tag.attributes.hasOwnProperty(t.attribName)) {
          t.attribName = t.attribValue = "";
          return;
        }
        if (t.opt.xmlns) {
          var e = S(t.attribName, !0), u = e.prefix, r = e.local;
          if (u === "xmlns")
            if (r === "xml" && t.attribValue !== T)
              C(
                t,
                "xml: prefix must be bound to " + T + `
Actual: ` + t.attribValue
              );
            else if (r === "xmlns" && t.attribValue !== I)
              C(
                t,
                "xmlns: prefix must be bound to " + I + `
Actual: ` + t.attribValue
              );
            else {
              var q = t.tag, z = t.tags[t.tags.length - 1] || t;
              q.ns === z.ns && (q.ns = Object.create(z.ns)), q.ns[r] = t.attribValue;
            }
          t.attribList.push([t.attribName, t.attribValue]);
        } else
          t.tag.attributes[t.attribName] = t.attribValue, i(t, "onattribute", {
            name: t.attribName,
            value: t.attribValue
          });
        t.attribName = t.attribValue = "";
      }
      function Y(t, e) {
        if (t.opt.xmlns) {
          var u = t.tag, r = S(t.tagName);
          u.prefix = r.prefix, u.local = r.local, u.uri = u.ns[r.prefix] || "", u.prefix && !u.uri && (C(
            t,
            "Unbound namespace prefix: " + JSON.stringify(t.tagName)
          ), u.uri = r.prefix);
          var q = t.tags[t.tags.length - 1] || t;
          u.ns && q.ns !== u.ns && Object.keys(u.ns).forEach(function(qe) {
            i(t, "onopennamespace", {
              prefix: qe,
              uri: u.ns[qe]
            });
          });
          for (var z = 0, Q = t.attribList.length; z < Q; z++) {
            var ee = t.attribList[z], te = ee[0], re = ee[1], K = S(te, !0), ae = K.prefix, vt = K.local, $e = ae === "" ? "" : u.ns[ae] || "", Ce = {
              name: te,
              value: re,
              prefix: ae,
              local: vt,
              uri: $e
            };
            ae && ae !== "xmlns" && !$e && (C(
              t,
              "Unbound namespace prefix: " + JSON.stringify(ae)
            ), Ce.uri = ae), t.tag.attributes[te] = Ce, i(t, "onattribute", Ce);
          }
          t.attribList.length = 0;
        }
        t.tag.isSelfClosing = !!e, t.sawRoot = !0, t.tags.push(t.tag), i(t, "onopentag", t.tag), e || (!t.noscript && t.tagName.toLowerCase() === "script" ? t.state = s.SCRIPT : t.state = s.TEXT, t.tag = null, t.tagName = ""), t.attribName = t.attribValue = "", t.attribList.length = 0;
      }
      function oe(t) {
        if (!t.tagName) {
          C(t, "Weird empty close tag."), t.textNode += "</>", t.state = s.TEXT;
          return;
        }
        if (t.script) {
          if (t.tagName !== "script") {
            t.script += "</" + t.tagName + ">", t.tagName = "", t.state = s.SCRIPT;
            return;
          }
          i(t, "onscript", t.script), t.script = "";
        }
        var e = t.tags.length, u = t.tagName;
        t.strict || (u = u[t.looseCase]());
        for (var r = u; e--; ) {
          var q = t.tags[e];
          if (q.name !== r)
            C(t, "Unexpected close tag");
          else
            break;
        }
        if (e < 0) {
          C(t, "Unmatched closing tag: " + t.tagName), t.textNode += "</" + t.tagName + ">", t.state = s.TEXT;
          return;
        }
        t.tagName = u;
        for (var z = t.tags.length; z-- > e; ) {
          var Q = t.tag = t.tags.pop();
          t.tagName = t.tag.name, i(t, "onclosetag", t.tagName);
          var ee = {};
          for (var te in Q.ns)
            ee[te] = Q.ns[te];
          var re = t.tags[t.tags.length - 1] || t;
          t.opt.xmlns && Q.ns !== re.ns && Object.keys(Q.ns).forEach(function(K) {
            var ae = Q.ns[K];
            i(t, "onclosenamespace", { prefix: K, uri: ae });
          });
        }
        e === 0 && (t.closedRoot = !0), t.tagName = t.attribValue = t.attribName = "", t.attribList.length = 0, t.state = s.TEXT;
      }
      function ie(t) {
        var e = t.entity, u = e.toLowerCase(), r, q = "";
        return t.ENTITIES[e] ? t.ENTITIES[e] : t.ENTITIES[u] ? t.ENTITIES[u] : (e = u, e.charAt(0) === "#" && (e.charAt(1) === "x" ? (e = e.slice(2), r = parseInt(e, 16), q = r.toString(16)) : (e = e.slice(1), r = parseInt(e, 10), q = r.toString(10))), e = e.replace(/^0+/, ""), isNaN(r) || q.toLowerCase() !== e || r < 0 || r > 1114111 || !ue(r) ? (C(t, "Invalid character entity"), "&" + t.entity + ";") : String.fromCodePoint(r));
      }
      function ue(t) {
        return t === 9 || t === 10 || t === 13 || t >= 32 && t <= 55295 || t >= 57344 && t <= 65533 || t >= 65536 && t <= 1114111;
      }
      function pe(t, e) {
        e === "<" ? (t.state = s.OPEN_WAKA, t.startTagPosition = t.position) : _(e) || (C(t, "Non-whitespace before first tag."), t.textNode = e, t.state = s.TEXT);
      }
      function de(t, e) {
        var u = "";
        return e < t.length && (u = t.charAt(e)), u;
      }
      function ye(t) {
        var e = this;
        if (this.error)
          throw this.error;
        if (e.closed)
          return U(
            e,
            "Cannot write after close. Assign an onready handler."
          );
        if (t === null)
          return L(e);
        typeof t == "object" && (t = t.toString());
        for (var u = 0, r = ""; r = de(t, u++), e.c = r, !!r; )
          switch (e.trackPosition && (e.position++, r === `
` ? (e.line++, e.column = 0) : e.column++), e.state) {
            case s.BEGIN:
              if (e.state = s.BEGIN_WHITESPACE, r === "\uFEFF")
                continue;
              pe(e, r);
              continue;
            case s.BEGIN_WHITESPACE:
              pe(e, r);
              continue;
            case s.TEXT:
              if (e.sawRoot && !e.closedRoot) {
                for (var z = u - 1; r && r !== "<" && r !== "&"; )
                  r = de(t, u++), r && e.trackPosition && (e.position++, r === `
` ? (e.line++, e.column = 0) : e.column++);
                e.textNode += t.substring(z, u - 1);
              }
              r === "<" && !(e.sawRoot && e.closedRoot && !e.strict) ? (e.state = s.OPEN_WAKA, e.startTagPosition = e.position) : (!_(r) && (!e.sawRoot || e.closedRoot) && C(e, "Text data outside of root node."), r === "&" ? e.state = s.TEXT_ENTITY : e.textNode += r);
              continue;
            case s.SCRIPT:
              r === "<" ? e.state = s.SCRIPT_ENDING : e.script += r;
              continue;
            case s.SCRIPT_ENDING:
              r === "/" ? e.state = s.CLOSE_TAG : (e.script += "<" + r, e.state = s.SCRIPT);
              continue;
            case s.OPEN_WAKA:
              if (r === "!")
                e.state = s.SGML_DECL, e.sgmlDecl = "";
              else if (!_(r)) if (D(F, r))
                e.state = s.OPEN_TAG, e.tagName = r;
              else if (r === "/")
                e.state = s.CLOSE_TAG, e.tagName = "";
              else if (r === "?")
                e.state = s.PROC_INST, e.procInstName = e.procInstBody = "";
              else {
                if (C(e, "Unencoded <"), e.startTagPosition + 1 < e.position) {
                  var q = e.position - e.startTagPosition;
                  r = new Array(q).join(" ") + r;
                }
                e.textNode += "<" + r, e.state = s.TEXT;
              }
              continue;
            case s.SGML_DECL:
              if (e.sgmlDecl + r === "--") {
                e.state = s.COMMENT, e.comment = "", e.sgmlDecl = "";
                continue;
              }
              e.doctype && e.doctype !== !0 && e.sgmlDecl ? (e.state = s.DOCTYPE_DTD, e.doctype += "<!" + e.sgmlDecl + r, e.sgmlDecl = "") : A.test(e.sgmlDecl + r) ? (i(e, "onopencdata"), e.state = s.CDATA, e.sgmlDecl = "", e.cdata = "") : h.test(e.sgmlDecl + r) ? (e.state = s.DOCTYPE, (e.doctype || e.sawRoot) && C(
                e,
                "Inappropriately located doctype declaration"
              ), e.doctype = "", e.sgmlDecl = "") : r === ">" ? (i(e, "onsgmldeclaration", e.sgmlDecl), e.sgmlDecl = "", e.state = s.TEXT) : (O(r) && (e.state = s.SGML_DECL_QUOTED), e.sgmlDecl += r);
              continue;
            case s.SGML_DECL_QUOTED:
              r === e.q && (e.state = s.SGML_DECL, e.q = ""), e.sgmlDecl += r;
              continue;
            case s.DOCTYPE:
              r === ">" ? (e.state = s.TEXT, i(e, "ondoctype", e.doctype), e.doctype = !0) : (e.doctype += r, r === "[" ? e.state = s.DOCTYPE_DTD : O(r) && (e.state = s.DOCTYPE_QUOTED, e.q = r));
              continue;
            case s.DOCTYPE_QUOTED:
              e.doctype += r, r === e.q && (e.q = "", e.state = s.DOCTYPE);
              continue;
            case s.DOCTYPE_DTD:
              r === "]" ? (e.doctype += r, e.state = s.DOCTYPE) : r === "<" ? (e.state = s.OPEN_WAKA, e.startTagPosition = e.position) : O(r) ? (e.doctype += r, e.state = s.DOCTYPE_DTD_QUOTED, e.q = r) : e.doctype += r;
              continue;
            case s.DOCTYPE_DTD_QUOTED:
              e.doctype += r, r === e.q && (e.state = s.DOCTYPE_DTD, e.q = "");
              continue;
            case s.COMMENT:
              r === "-" ? e.state = s.COMMENT_ENDING : e.comment += r;
              continue;
            case s.COMMENT_ENDING:
              r === "-" ? (e.state = s.COMMENT_ENDED, e.comment = w(e.opt, e.comment), e.comment && i(e, "oncomment", e.comment), e.comment = "") : (e.comment += "-" + r, e.state = s.COMMENT);
              continue;
            case s.COMMENT_ENDED:
              r !== ">" ? (C(e, "Malformed comment"), e.comment += "--" + r, e.state = s.COMMENT) : e.doctype && e.doctype !== !0 ? e.state = s.DOCTYPE_DTD : e.state = s.TEXT;
              continue;
            case s.CDATA:
              for (var z = u - 1; r && r !== "]"; )
                r = de(t, u++), r && e.trackPosition && (e.position++, r === `
` ? (e.line++, e.column = 0) : e.column++);
              e.cdata += t.substring(z, u - 1), r === "]" && (e.state = s.CDATA_ENDING);
              continue;
            case s.CDATA_ENDING:
              r === "]" ? e.state = s.CDATA_ENDING_2 : (e.cdata += "]" + r, e.state = s.CDATA);
              continue;
            case s.CDATA_ENDING_2:
              r === ">" ? (e.cdata && i(e, "oncdata", e.cdata), i(e, "onclosecdata"), e.cdata = "", e.state = s.TEXT) : r === "]" ? e.cdata += "]" : (e.cdata += "]]" + r, e.state = s.CDATA);
              continue;
            case s.PROC_INST:
              r === "?" ? e.state = s.PROC_INST_ENDING : _(r) ? e.state = s.PROC_INST_BODY : e.procInstName += r;
              continue;
            case s.PROC_INST_BODY:
              if (!e.procInstBody && _(r))
                continue;
              r === "?" ? e.state = s.PROC_INST_ENDING : e.procInstBody += r;
              continue;
            case s.PROC_INST_ENDING:
              if (r === ">") {
                const re = {
                  name: e.procInstName,
                  body: e.procInstBody
                };
                $(e, re), i(e, "onprocessinginstruction", re), e.procInstName = e.procInstBody = "", e.state = s.TEXT;
              } else
                e.procInstBody += "?" + r, e.state = s.PROC_INST_BODY;
              continue;
            case s.OPEN_TAG:
              D(P, r) ? e.tagName += r : (V(e), r === ">" ? Y(e) : r === "/" ? e.state = s.OPEN_TAG_SLASH : (_(r) || C(e, "Invalid character in tag name"), e.state = s.ATTRIB));
              continue;
            case s.OPEN_TAG_SLASH:
              r === ">" ? (Y(e, !0), oe(e)) : (C(
                e,
                "Forward-slash in opening tag not followed by >"
              ), e.state = s.ATTRIB);
              continue;
            case s.ATTRIB:
              if (_(r))
                continue;
              r === ">" ? Y(e) : r === "/" ? e.state = s.OPEN_TAG_SLASH : D(F, r) ? (e.attribName = r, e.attribValue = "", e.state = s.ATTRIB_NAME) : C(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_NAME:
              r === "=" ? e.state = s.ATTRIB_VALUE : r === ">" ? (C(e, "Attribute without value"), e.attribValue = e.attribName, k(e), Y(e)) : _(r) ? e.state = s.ATTRIB_NAME_SAW_WHITE : D(P, r) ? e.attribName += r : C(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_NAME_SAW_WHITE:
              if (r === "=")
                e.state = s.ATTRIB_VALUE;
              else {
                if (_(r))
                  continue;
                C(e, "Attribute without value"), e.tag.attributes[e.attribName] = "", e.attribValue = "", i(e, "onattribute", {
                  name: e.attribName,
                  value: ""
                }), e.attribName = "", r === ">" ? Y(e) : D(F, r) ? (e.attribName = r, e.state = s.ATTRIB_NAME) : (C(e, "Invalid attribute name"), e.state = s.ATTRIB);
              }
              continue;
            case s.ATTRIB_VALUE:
              if (_(r))
                continue;
              O(r) ? (e.q = r, e.state = s.ATTRIB_VALUE_QUOTED) : (e.opt.unquotedAttributeValues || U(e, "Unquoted attribute value"), e.state = s.ATTRIB_VALUE_UNQUOTED, e.attribValue = r);
              continue;
            case s.ATTRIB_VALUE_QUOTED:
              if (r !== e.q) {
                r === "&" ? e.state = s.ATTRIB_VALUE_ENTITY_Q : e.attribValue += r;
                continue;
              }
              k(e), e.q = "", e.state = s.ATTRIB_VALUE_CLOSED;
              continue;
            case s.ATTRIB_VALUE_CLOSED:
              _(r) ? e.state = s.ATTRIB : r === ">" ? Y(e) : r === "/" ? e.state = s.OPEN_TAG_SLASH : D(F, r) ? (C(e, "No whitespace between attributes"), e.attribName = r, e.attribValue = "", e.state = s.ATTRIB_NAME) : C(e, "Invalid attribute name");
              continue;
            case s.ATTRIB_VALUE_UNQUOTED:
              if (!B(r)) {
                r === "&" ? e.state = s.ATTRIB_VALUE_ENTITY_U : e.attribValue += r;
                continue;
              }
              k(e), r === ">" ? Y(e) : e.state = s.ATTRIB;
              continue;
            case s.CLOSE_TAG:
              if (e.tagName)
                r === ">" ? oe(e) : D(P, r) ? e.tagName += r : e.script ? (e.script += "</" + e.tagName + r, e.tagName = "", e.state = s.SCRIPT) : (_(r) || C(e, "Invalid tagname in closing tag"), e.state = s.CLOSE_TAG_SAW_WHITE);
              else {
                if (_(r))
                  continue;
                R(F, r) ? e.script ? (e.script += "</" + r, e.state = s.SCRIPT) : C(e, "Invalid tagname in closing tag.") : e.tagName = r;
              }
              continue;
            case s.CLOSE_TAG_SAW_WHITE:
              if (_(r))
                continue;
              r === ">" ? oe(e) : C(e, "Invalid characters in closing tag");
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
              if (r === ";") {
                var te = ie(e);
                e.opt.unparsedEntities && !Object.values(n.XML_ENTITIES).includes(te) ? ((e.entityCount += 1) > e.opt.maxEntityCount && U(
                  e,
                  "Parsed entity count exceeds max entity count"
                ), (e.entityDepth += 1) > e.opt.maxEntityDepth && U(
                  e,
                  "Parsed entity depth exceeds max entity depth"
                ), e.entity = "", e.state = Q, e.write(te), e.entityDepth -= 1) : (e[ee] += te, e.entity = "", e.state = Q);
              } else D(e.entity.length ? d : g, r) ? e.entity += r : (C(e, "Invalid character in entity name"), e[ee] += "&" + e.entity + r, e.entity = "", e.state = Q);
              continue;
            default:
              throw new Error(e, "Unknown state: " + e.state);
          }
        return e.position >= e.bufferCheckPosition && f(e), e;
      }
      String.fromCodePoint || (function() {
        var t = String.fromCharCode, e = Math.floor, u = function() {
          var r = 16384, q = [], z, Q, ee = -1, te = arguments.length;
          if (!te)
            return "";
          for (var re = ""; ++ee < te; ) {
            var K = Number(arguments[ee]);
            if (!isFinite(K) || // `NaN`, `+Infinity`, or `-Infinity`
            K < 0 || // not a valid Unicode code point
            K > 1114111 || // not a valid Unicode code point
            e(K) !== K)
              throw RangeError("Invalid code point: " + K);
            K <= 65535 ? q.push(K) : (K -= 65536, z = (K >> 10) + 55296, Q = K % 1024 + 56320, q.push(z, Q)), (ee + 1 === te || q.length > r) && (re += t.apply(null, q), q.length = 0);
          }
          return re;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: u,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = u;
      })();
    })(o);
  })(Oe)), Oe;
}
var Me, Ze;
function Ut() {
  if (Ze) return Me;
  Ze = 1;
  var o = jt().parser;
  function n(a) {
    var c = [], f = [], l = c, m;
    return m = o(!0), m.ontext = function(x) {
      x.trim() !== "" && l.push(x);
    }, m.onopentag = function(x) {
      var E;
      E = [x.name, x.attributes], f.push(l), l.push(E), l = E;
    }, m.onclosetag = function() {
      l = f.pop();
    }, m.write(a).close(), c[0];
  }
  return Me = n, Me;
}
var Le, Je;
function Vt() {
  if (Je) return Le;
  Je = 1;
  function o(n, a) {
    var c = function() {
    }, f = c, l = c;
    function m() {
      this._skip = !0;
    }
    function x() {
      this._remove = !0;
    }
    function E(y) {
      this._name = y;
    }
    function N(y) {
      this._replace = y;
    }
    function p(y, A) {
      var h, T = { attr: {}, full: y }, I = {
        name: E,
        skip: m,
        // break: breakFn,
        remove: x,
        replace: N,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, j = !0, F, P, g;
      if (y !== void 0 && y !== null && y !== !0 && y !== !1)
        switch (h = Object.prototype.toString.call(y), h) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (y.some(function(d, _) {
              if (_ === 0)
                return T.name = d, !1;
              if (_ === 1)
                return Object.prototype.toString.call(d) === "[object Object]" && (j = !1, T.attr = d), !0;
            }), f.call(I, T, A), I._name && (y[0] = I._name), I._replace)
              return I._replace;
            if (I._remove)
              return null;
            if (!I._skip) {
              for (F = 0, P = y.length; F < P; ) {
                if (F > 1 || F === 1 && j) {
                  if (g = p(y[F], T), g === null) {
                    y.splice(F, 1), P -= 1;
                    continue;
                  }
                  g && (y[F] = g);
                }
                F += 1;
              }
              if (l.call(I, T, A), I._name && (y[0] = I._name), I._replace)
                return I._replace;
              if (I._remove)
                return null;
            }
        }
    }
    a && (a.enter && (f = a.enter), a.leave && (l = a.leave)), p(n, void 0);
  }
  return Le = o, Le;
}
var Re, et;
function kt() {
  if (et) return Re;
  et = 1;
  const o = Ut(), n = Vt(), a = (f) => String(f).replace(/[&<>"']/g, (l) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[l]);
  function c(f) {
    const [l, ...m] = f, x = m[0] && typeof m[0] == "object" && !Array.isArray(m[0]) ? m.shift() : {}, E = "<" + l + Object.entries(x).map(([N, p]) => " " + N + '="' + a(p) + '"').join("");
    return m.length ? E + ">" + m.map((N) => Array.isArray(N) ? c(N) : a(N)).join("") + "</" + l + ">" : E + "/>";
  }
  return Re = { parse: o, p: o, traverse: n, t: n, stringify: c, s: c }, Re;
}
kt();
const we = (o) => Math.round(Number(o) * 1e3) / 1e3, me = (o) => we(o.x) + "," + we(o.y), ce = (o, n) => Math.abs(o - n) < 2e-3, tt = (o, n, a) => o >= Math.min(n, a) - 2e-3 && o <= Math.max(n, a) + 2e-3, Fe = (o, n) => ce(n.a.x, n.b.x) ? ce(o.x, n.a.x) && tt(o.y, n.a.y, n.b.y) : ce(o.y, n.a.y) && tt(o.x, n.a.x, n.b.x), nt = (o, n) => Math.abs(o.x - n.x) + Math.abs(o.y - n.y);
function Gt(o, n = [], a = []) {
  const c = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), m = (g) => {
    const d = { x: we(g.x), y: we(g.y) };
    return c.set(me(d), d), me(d);
  };
  for (const g of o)
    m(g.a), m(g.b);
  const x = n.map(m);
  for (const g of a)
    f.add(m(g.a)), f.add(m(g.b)), l.add([me(g.a), me(g.b)].sort().join("|"));
  for (let g = 0; g < o.length; g++) for (let d = g + 1; d < o.length; d++) {
    const _ = o[g], O = o[d], B = ce(_.a.x, _.b.x), D = ce(O.a.x, O.b.x);
    if (B === D) continue;
    const R = B ? _ : O, s = B ? O : _, H = { x: R.a.x, y: s.a.y };
    Fe(H, R) && Fe(H, s) && m(H);
  }
  const E = /* @__PURE__ */ new Map();
  for (const g of o) {
    const d = [...c.values()].filter((_) => Fe(_, g)).sort((_, O) => _.x - O.x || _.y - O.y);
    for (let _ = 1; _ < d.length; _++) {
      const O = me(d[_ - 1]), B = me(d[_]);
      O !== B && E.set([O, B].sort().join("|"), { a: O, b: B, length: nt(d[_ - 1], d[_]) });
    }
  }
  const N = new Map([...c.keys()].map((g) => [g, g])), p = (g) => {
    let d = g;
    for (; N.get(d) !== d; ) d = N.get(d);
    for (; g !== d; ) {
      const _ = N.get(g);
      N.set(g, d), g = _;
    }
    return d;
  }, y = [...E.entries()].sort(([g, d], [_, O]) => Number(l.has(_)) - Number(l.has(g)) || d.length - O.length || g.localeCompare(_)), A = new Map([...c.keys()].map((g) => [g, /* @__PURE__ */ new Set()]));
  let h = 0;
  for (const [, g] of y) {
    const d = p(g.a), _ = p(g.b);
    if (d === _) {
      h++;
      continue;
    }
    N.set(d, _), A.get(g.a).add(g.b), A.get(g.b).add(g.a);
  }
  if (x.length > 1 && x.some((g) => p(g) !== p(x[0]))) throw Error("Geometric net cleanup found disconnected terminals.");
  const T = /* @__PURE__ */ new Set([...x, ...f]), I = [...A].filter(([g, d]) => d.size === 1 && !T.has(g)).map(([g]) => g);
  let j = 0;
  for (; I.length; ) {
    const g = I.pop();
    if (T.has(g) || A.get(g).size !== 1) continue;
    const d = [...A.get(g)][0];
    A.get(g).clear(), A.get(d).delete(g), j++, A.get(d).size === 1 && !T.has(d) && I.push(d);
  }
  for (const [g, d] of A) if (d.size === 2 && !T.has(g)) {
    const [_, O] = [...d], B = c.get(_), D = c.get(g), R = c.get(O);
    (ce(B.x, D.x) && ce(D.x, R.x) || ce(B.y, D.y) && ce(D.y, R.y)) && (A.get(_).delete(g), A.get(O).delete(g), A.get(_).add(O), A.get(O).add(_), d.clear());
  }
  const F = [], P = /* @__PURE__ */ new Set();
  for (const [g, d] of A) for (const _ of d) {
    const O = [g, _].sort().join("|");
    P.has(O) || (P.add(O), F.push({ a: c.get(g), b: c.get(_) }));
  }
  return { segments: F, junctions: [...A].filter(([, g]) => g.size >= 3).map(([g]) => c.get(g)), cyclesRemoved: h, leavesRemoved: j, wireLength: F.reduce((g, d) => g + nt(d.a, d.b), 0) };
}
const ht = (o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), _e = (o, n, a) => o.replace(new RegExp("(?<![\\w./%:$])" + ht(n) + "(?![\\w./%:$])", "gi"), () => a);
function $t(o, n) {
  const a = n.components.filter((i) => !i.synthetic), c = ge(o.root), f = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), m = a.filter((i) => i.kind === "X"), x = /* @__PURE__ */ new Set(), E = (i, v) => {
    let w = v.includes("/") ? i + "_" + v.replaceAll("/", "_") : v;
    w = w.replace(/[^a-z0-9_.$@&Ö]/gi, "_"), w.toUpperCase().startsWith(i) || (w = i + "_" + w);
    const U = w;
    let L = 1;
    for (; x.has(w.toLowerCase()); ) w = U + "_" + L++;
    return x.add(w.toLowerCase()), w;
  };
  c.forEach((i) => f.set(i.name, E(i.kind, i.name)));
  const N = new Map(m.map((i) => [i.name, E("X", i.name)])), p = new Map(m.map((i, v) => [i.name, "CV_BLOCK_" + v]));
  c.forEach((i) => l.set(i.name, ""));
  for (const i of m) for (const v of ge(o.contexts[i.instanceId])) l.set(v.name, i.name);
  const y = (i) => /^(?:[a-z_][\w.$-]*|\d+)$/i.test(i), A = new Set([...c.flatMap((i) => Object.values(i.terminals)), ...Object.keys(n.nodes)].filter(y).map((i) => i.toLowerCase())), h = /* @__PURE__ */ new Map([["0", "0"]]), T = /* @__PURE__ */ new Set(["0"]);
  let I = 1;
  const j = (i) => {
    if (!h.has(i)) {
      let v = i;
      if (!y(i) || T.has(i.toLowerCase()))
        do
          v = "N_cv" + I++;
        while (A.has(v.toLowerCase()) || T.has(v.toLowerCase()));
      h.set(i, v), T.add(v.toLowerCase());
    }
    return h.get(i);
  };
  for (const i of c) Object.values(i.terminals).forEach(j);
  Object.keys(n.nodes).forEach(j);
  const F = /* @__PURE__ */ new Map();
  for (const i of m) {
    const v = new Set(i.block.ports.map((w) => w.node));
    for (const w of ge(o.contexts[i.instanceId])) for (const U of Object.values(w.terminals)) !v.has(U) && U !== "0" && !o.ir.globals.some((L) => Ie([], L) === U) && F.set(U, i.name);
  }
  const P = new Map(m.map((i) => [i.name, new Map(i.block.ports.map((v, w) => [v.node, "p" + w]).reverse())])), g = (i, v = "") => {
    if (i === "0") return "0";
    if (P.get(v)?.has(i)) return P.get(v).get(i);
    const w = F.get(i);
    if (v && w && w !== v) throw Error("ASC export: cross-block internal node probe requires expanding both instances: " + i);
    return w && w !== v ? N.get(w) + ":" + j(i) : j(i);
  }, d = (i, v = "") => {
    if (!f.has(i)) throw Error("ASC: unresolved device reference " + i);
    const w = l.get(i);
    if (v && w !== v) throw Error("ASC export: cross-block current probe requires expanding both instances: " + i);
    return w && w !== v ? N.get(w) + ":" + f.get(i) : f.get(i);
  }, _ = /* @__PURE__ */ new Map();
  function O(i, v = {}) {
    const w = o.ir.scopes[i.scopeId];
    let U;
    if (!i.id) U = Object.fromEntries(Object.keys(i.params).map((L) => [L, L]));
    else {
      const L = o.contexts[i.path.slice(0, -1).map(encodeURIComponent).join("/")], C = o.ir.scopes[L.scopeId].instances.find((V) => V.name === i.path.at(-1));
      U = Tt(v, w.defaults, w.parameters, C.parameters);
    }
    _.set(i.id, U), i.children.forEach((L) => O(L, U));
  }
  O(o.root);
  const B = (i, v) => {
    const w = i.ports.find((C) => C.name.toLowerCase() === v.toLowerCase());
    if (w) return w.node;
    const U = i.nodes[v.toLowerCase()];
    if (U) return U;
    if (o.ir.globals.includes(v.toLowerCase())) return Ie([], v);
    const L = v.split(":");
    if (L.length > 1) {
      const C = L.pop(), V = [...i.path, ...L].map(encodeURIComponent).join("/"), S = o.contexts[V] || o.contexts[L.map(encodeURIComponent).join("/")];
      if (S) return B(S, C);
    }
    return Ie(i.path, v);
  }, D = (i, v) => {
    const w = i.devices.find((L) => L.localName.toLowerCase() === v.toLowerCase());
    if (w) return w.name;
    const U = v.split(":");
    if (U.length > 1) {
      const L = U.pop(), C = [...i.path, ...U].map(encodeURIComponent).join("/"), S = (o.contexts[C] || o.contexts[U.map(encodeURIComponent).join("/")])?.devices.find((k) => k.localName.toLowerCase() === L.toLowerCase());
      if (S) return S.name;
    }
    throw Error("ASC: unsupported device reference " + v);
  }, R = new Map(Object.keys(n.models).map((i, v) => [i, "CV_MODEL_" + v]));
  function s(i, v) {
    const w = o.contexts[i.instanceId], U = o.ir.scopes[w.scopeId].devices.find((S) => S.name === i.localName), L = [], C = (S) => "__CV_PROBE_" + (L.push(S) - 1) + "__";
    let V = Se(U.value, _.get(w.id), (S) => C(g(B(w, S), v)), (S) => C(d(D(w, S), v)));
    if (U.model && (V = _e(V, U.model, R.get(i.model) || i.model)), V = V.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (S, k, Y) => k + "(" + Y.split(",").map((oe) => {
      const ie = oe.trim(), ue = /^__CV_PROBE_(\d+)__$/.exec(ie);
      return ue ? L[+ue[1]] : k.toLowerCase() === "v" ? g(B(w, ie), v) : d(D(w, ie), v);
    }).join(",") + ")"), (U.controlSources || []).forEach((S, k) => {
      V = _e(V, S, d(i.controlSources[k], v));
    }), i.kind === "@") for (const [S, k] of Object.entries(i.terminals)) ["REFNODE", "INTNODE"].includes(S) && (V = V.replace(new RegExp("\\b" + S + "\\s*=\\s*[^\\s]+", "i"), S.toLowerCase() + "=" + g(k, v)));
    return V;
  }
  const H = /* @__PURE__ */ new Map(), W = o.ir.diagnostics.filter((i) => i.severity === "warning").map((i) => i.message);
  function b(i, v = "") {
    if (i.kind === "X") {
      const S = i.block.ports.map((k) => g(k.node, v));
      return { ref: N.get(i.name), kind: "X", pins: i.block.ports.map((k) => k.pin), nodes: S, value: p.get(i.name), line: [N.get(i.name), ...S, p.get(i.name)].join(" ") };
    }
    const w = f.get(i.name), U = Object.entries(i.terminals);
    if (i.kind === "K") {
      const S = s(i, v).split(" · k=").at(-1), k = [w, ...i.coupledInductors.map((Y) => d(Y, v)), S].join(" ");
      return { ref: w, kind: "K", pins: [], nodes: [], value: S, line: k, directive: !0 };
    }
    let L = s(i, v), C = U.map(([S]) => S), V = U.map(([, S]) => g(S, v));
    if (["E", "G"].includes(i.kind) && i.sourceMode === "POLY") {
      const S = /^POLY\(\d+\)\s*/i.exec(L);
      if (!S) throw Error("ASC: invalid POLY source " + i.name);
      L = S[0] + V.slice(2).join(" ") + " " + L.slice(S[0].length), C = C.slice(0, 2), V = V.slice(0, 2), W.push(i.name + ": POLY control nodes remain explicit in the editable Value expression.");
    }
    return i.kind === "@" && (C = C.slice(0, 2), V = V.slice(0, 2)), { ref: w, kind: i.kind, prefix: i.kind === "M" ? i.type.includes("pmos") ? "MP" : "MN" : i.kind, pins: C, nodes: V, electricalNodes: U.map(([, S]) => g(S, v)), value: L, line: [w, ...V, L].filter(Boolean).join(" ") };
  }
  a.forEach((i) => H.set(i.name, b(i)));
  const M = [], G = [];
  for (const i of m) {
    M.push(".subckt " + p.get(i.name) + " " + i.block.ports.map((v, w) => "p" + w).join(" "));
    for (const v of ge(o.contexts[i.instanceId])) {
      const w = b(v, i.name);
      M.push(w.line), G.push({ original: v.name, scope: i.name, ...w });
    }
    M.push(".ends " + p.get(i.name));
  }
  for (const [i, v] of Object.entries(n.models)) {
    const w = o.contexts[v.instanceId], U = o.ir.scopes[w.scopeId], L = decodeURIComponent(i.split("/").at(-1)), C = U.models[L];
    let V = C ? Se(C.raw, _.get(w.id), (S) => g(B(w, S)), (S) => d(D(w, S))) : v.raw;
    V = V.replace(/^(\.model\s+)\S+/i, (S, k) => k + R.get(i));
    for (const [S, k] of R) V = _e(V, S, k);
    if (v.baseModel) {
      const S = w.path.length ? w.path.map(encodeURIComponent).join("/") + "/" : "";
      V = V.replace(new RegExp("(AKO:)" + ht(v.baseModel), "i"), (k, Y) => Y + (R.get(S + v.baseModel.toLowerCase()) || R.get(v.baseModel.toLowerCase()) || v.baseModel));
    }
    M.push(V);
  }
  const $ = [];
  for (const i of Object.values(o.contexts))
    if (!(i.id && !ge(i).some((v) => l.has(v.name) && (a.some((w) => w.name === v.name) || m.some((w) => w.name === l.get(v.name))))))
      for (const v of o.ir.scopes[i.scopeId].directives) {
        if (/^\.(?:model|param|global|title)\b/i.test(v.text) && i.id || /^\.(?:model|title)\b/i.test(v.text)) continue;
        if (i.id && !/^\.(?:func|ic|nodeset)\b/i.test(v.text)) throw Error("ASC export: local directive requires scope-preserving export (" + i.id + "): " + v.text);
        if (i.id && /^\.func\b/i.test(v.text)) throw Error("ASC export: local .func requires scope-preserving export (" + i.id + ").");
        const w = [], U = (C) => "__CV_PROBE_" + (w.push(C) - 1) + "__";
        let L = i.id ? Se(v.text, _.get(i.id), (C) => U(g(B(i, C))), (C) => U(d(D(i, C)))) : v.text;
        if (L = L.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (C, V, S) => V + "(" + S.split(",").map((k) => {
          const Y = k.trim(), oe = /^__CV_PROBE_(\d+)__$/.exec(Y);
          if (oe) return w[+oe[1]];
          if (Y === "*") return Y;
          if (/[*?]/.test(Y)) throw Error("ASC export: wildcard probe cannot be renamed reliably: " + Y);
          return V.toLowerCase() === "v" ? g(B(i, Y)) : d(D(i, Y));
        }).join(",") + ")"), /^\.global\b/i.test(L) && (L = ".global " + L.split(/\s+/).slice(1).map((C) => g(B(i, C))).join(" ")), /^\.(?:dc|tf|noise|sens)\b/i.test(L)) for (const C of i.devices) L = _e(L, C.localName, d(C.name));
        $.push(L);
      }
  return { cards: H, library: M, directives: $, nodeNames: h, refs: f, expected: G, warnings: [...new Set(W)], node: g, blockRefs: N, definitions: p };
}
const be = (o) => o.x + "," + o.y, qt = (o, n) => n.a.x === n.b.x ? o.x === n.a.x && o.y >= Math.min(n.a.y, n.b.y) && o.y <= Math.max(n.a.y, n.b.y) : o.y === n.a.y && o.x >= Math.min(n.a.x, n.b.x) && o.x <= Math.max(n.a.x, n.b.x);
function Yt(o) {
  return new TextDecoder(o[0] === 255 && o[1] === 254 ? "utf-16le" : "windows-1252").decode(o);
}
function Xt(o, n) {
  const a = [], c = [], f = [], l = [];
  let m;
  for (const h of o.split(/\r?\n/)) {
    let T;
    if (T = /^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(h)) a.push({ a: { x: +T[1], y: +T[2] }, b: { x: +T[3], y: +T[4] } });
    else if (T = /^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(h)) c.push({ x: +T[1], y: +T[2], name: T[3] });
    else if (T = /^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(h))
      m = { symbol: T[1], x: +T[2], y: +T[3], pins: [], value: "", ref: "" }, f.push(m);
    else if (T = /^SYMATTR (InstName|Value) (.*)$/.exec(h)) {
      if (!m) throw Error("ASC attribute without symbol.");
      m[T[1] === "InstName" ? "ref" : "value"] = T[2];
    } else (T = /^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(h)) && l.push(...T[1].split("\\n"));
  }
  for (const h of f) {
    const T = n[h.symbol + ".asy"];
    if (!T) throw Error("Missing ASC companion " + h.symbol + ".asy");
    let I;
    for (const j of Yt(T).split(/\r?\n/)) {
      let F;
      (F = /^PIN (-?\d+) (-?\d+) /.exec(j)) ? (I = { x: h.x + +F[1], y: h.y + +F[2] }, h.pins.push(I)) : (F = /^PINATTR SpiceOrder (\d+)$/.exec(j)) ? I.order = +F[1] : (F = /^SYMATTR Prefix (\S+)$/.exec(j)) && (h.prefix = F[1]);
    }
    h.pins.sort((j, F) => j.order - F.order);
  }
  const x = /* @__PURE__ */ new Map();
  for (const h of [...a.flatMap((T) => [T.a, T.b]), ...c, ...f.flatMap((T) => T.pins)]) x.set(be(h), h);
  const E = new Map([...x.keys()].map((h) => [h, h])), N = (h) => (E.get(h) !== h && E.set(h, N(E.get(h))), E.get(h)), p = (h, T) => {
    E.set(N(h), N(T));
  };
  for (const h of a) {
    if (h.a.x !== h.b.x && h.a.y !== h.b.y) throw Error("ASC contains a diagonal wire.");
    for (const [T, I] of x) qt(I, h) && p(be(h.a), T);
  }
  const y = /* @__PURE__ */ new Map();
  for (const h of c) {
    const T = N(be(h));
    if (y.has(T) && y.get(T).toLowerCase() !== h.name.toLowerCase()) throw Error("ASC has a short between " + y.get(T) + " and " + h.name);
    y.set(T, h.name);
  }
  for (const h of f) for (const T of h.pins)
    if (T.node = y.get(N(be(T))), !T.node) throw Error("ASC has an unnamed/disconnected pin on " + h.ref);
  const A = f.map((h) => [h.ref, ...h.pins.map((T) => T.node), h.value].join(" "));
  return { symbols: f, wires: a, flags: c, directives: l, netlist: ["* Viewer ASC round trip", ...A, ...l, ".end"].join(`
`) };
}
function Wt(o, n, a) {
  const c = Xt(o, n), f = a.components.filter((m) => !m.directive);
  if (c.symbols.length !== f.length) throw Error("ASC lost or duplicated symbols.");
  let l = 0;
  for (const m of f) {
    const x = c.symbols.find((E) => E.ref === m.ref);
    if (!x || x.value !== m.value || x.prefix !== (m.prefix || m.kind) || JSON.stringify(x.pins.map((E) => E.node)) !== JSON.stringify(m.nodes)) throw Error("ASC component/pin round-trip mismatch: " + m.id);
    l += x.pins.length;
  }
  for (const m of a.components.filter((x) => x.directive)) if (!c.directives.includes(m.line)) throw Error("ASC lost directive device " + m.id);
  return { verified: !0, symbols: f.length, directiveDevices: a.components.length - f.length, pins: l, wires: c.wires.length, namedNets: new Set(c.flags.map((m) => m.name)).size };
}
const zt = (o) => o.x + "," + o.y, ot = (o) => Math.round(o * 1e3) / 1e3, pt = new Map(Array.from({ length: 256 }, (o, n) => [new TextDecoder("windows-1252").decode(new Uint8Array([n])), n]));
function it(o) {
  const n = [];
  for (const a of o) {
    const c = pt.get(a);
    if (c === void 0) throw Error("LTspice export cannot encode " + a + " (U+" + a.codePointAt(0).toString(16) + ") in Windows-1252.");
    n.push(c);
  }
  return new Uint8Array(n);
}
const gt = (o) => [...String(o)].map((n) => pt.has(n) ? n : n === "⏚" ? "GND" : "[U+" + n.codePointAt(0).toString(16) + "]").join(""), Ne = (o) => String(o).replace(/[\r\n]/g, " ");
function rt(o) {
  const n = [...new Set(o.map(ot))].sort((f, l) => f - l), a = /* @__PURE__ */ new Map();
  let c = -1 / 0;
  for (const f of n) {
    const l = Math.max(c + 16, Math.round(f * 2 / 16) * 16 + 64);
    a.set(f, l), c = l;
  }
  return (f) => {
    const l = a.get(ot(f));
    if (l === void 0) throw Error("Missing layout coordinate.");
    return l;
  };
}
function Ht(o, n, a, c) {
  const f = c.x(o.x), l = c.y(o.y), m = c.x(o.x + o.width) - f, x = c.y(o.y + o.height) - l, E = o.ports.map((A) => ({ ...A, x: c.x(A.x) - f, y: c.y(A.y) - l })), N = ["Version 4", "SymbolType CELL"], p = (A, h) => N.push(`LINE Normal ${Math.round(A.x)} ${Math.round(A.y)} ${Math.round(h.x)} ${Math.round(h.y)}`), y = E.length === 2 && ["R", "C", "L", "D", "V", "I", "B"].includes(n.kind);
  if (y) {
    const A = ["D", "V", "I", "B"].includes(n.kind) ? [E.find((_) => _.pin === "+") || E[0], E.find((_) => _.pin === "-") || E[1]] : E, [h, T] = A, I = Math.abs(h.x - T.x) < 0.1, j = { x: (h.x + T.x) / 2, y: (h.y + T.y) / 2 }, F = Math.abs(I ? T.y - h.y : T.x - h.x), P = Math.min(32, F / 4), g = Math.sign(I ? T.y - h.y : T.x - h.x), d = (_, O) => I ? { x: j.x + O, y: j.y + _ * g } : { x: j.x + _ * g, y: j.y + O };
    if (p(h, d(-P, 0)), p(d(P, 0), T), n.kind === "C")
      p(d(-6, -20), d(-6, 20)), p(d(6, -20), d(6, 20)), p(d(-P, 0), d(-6, 0)), p(d(6, 0), d(P, 0));
    else if (n.kind === "R" || n.kind === "B" && /^\s*R\s*=/i.test(n.value)) {
      const _ = [[-P, 0], [-P + 6, 0], [-P + 12, -12], [-P + 22, 12], [-P + 32, -12], [P - 6, 0], [P, 0]];
      for (let O = 1; O < _.length; O++) p(d(..._[O - 1]), d(..._[O]));
    } else if (n.kind === "L") {
      let _ = d(-P, 0);
      for (let O = 0; O < 4; O++) for (let B = 1; B <= 8; B++) {
        const D = d(-P + (O + B / 8) * P / 2, 16 * Math.sin(B * Math.PI / 8));
        p(_, D), _ = D;
      }
    } else n.kind === "D" ? (p(d(-P, 0), d(-12, 0)), p(d(12, 0), d(P, 0)), p(d(-12, -18), d(-12, 18)), p(d(-12, 18), d(12, 0)), p(d(12, 0), d(-12, -18)), p(d(12, -18), d(12, 18))) : (N.push(`CIRCLE Normal ${Math.round(j.x - 24)} ${Math.round(j.y - 24)} ${Math.round(j.x + 24)} ${Math.round(j.y + 24)}`), p(d(-P, 0), d(-24, 0)), p(d(24, 0), d(P, 0)), n.kind === "I" || n.kind === "B" && /^\s*(?:I|P)\s*=/i.test(n.value) ? (p(d(-12, 0), d(12, 0)), p(d(12, 0), d(4, -7)), p(d(12, 0), d(4, 7))) : (p(d(-12, -6), d(-12, 6)), p(d(-18, 0), d(-6, 0)), p(d(12, -6), d(12, 6))));
  } else {
    N.push(`RECTANGLE Normal 16 16 ${Math.max(32, m - 16)} ${Math.max(32, x - 16)}`);
    for (const h of E) {
      const T = { x: Math.max(16, Math.min(m - 16, h.x)), y: Math.max(16, Math.min(x - 16, h.y)) };
      p(h, T), N.push(`TEXT ${Math.round(T.x + 4)} ${Math.round(T.y + 4)} Left 1 ${Ne(gt(n.block?.ports.find((I) => I.pin === h.pin)?.label || n.pinLabels?.[Object.keys(n.terminals).indexOf(h.pin)] || h.pin))}`);
    }
  }
  y && Math.abs(E[0].x - E[1].x) < 0.1 ? N.push(`WINDOW 0 ${Math.round(E[0].x + 40)} 24 Left 2`, `WINDOW 3 ${Math.round(E[0].x + 40)} 56 Left 2`) : y ? N.push(`WINDOW 0 ${Math.round(m / 2)} 16 Center 2`, `WINDOW 3 ${Math.round(m / 2)} 40 Center 2`) : N.push("WINDOW 0 24 32 Left 2", "WINDOW 3 24 64 Left 2"), N.push("SYMATTR Prefix " + (a.prefix || a.kind));
  for (const [A, h] of a.pins.entries()) {
    const T = E.find((I) => I.pin === h);
    if (!T) throw Error("ASC symbol missing pin " + n.name + "." + h);
    N.push(`PIN ${T.x} ${T.y} NONE 0`, "PINATTR PinName " + Ne(h), "PINATTR SpiceOrder " + (A + 1));
  }
  return N.join(`\r
`) + `\r
`;
}
function Kt({ tree: o, circuit: n, drawing: a, source: c = "", libraries: f = {} }) {
  if (!a) throw Error("ASC export requires a conventional layout. Enable Circuit layout rules and generate again.");
  const l = $t(o, n), m = new Map(n.components.map((b) => [b.name, b]));
  if (a.components.length !== m.size || a.components.some((b) => !m.has(b.id) || b.ports.some((M) => n.nodes[m.get(b.id).terminals[M.pin]]?.bit !== M.bit))) throw Error("ASC: stale layout or mismatched pin/net mapping. Generate again.");
  const x = [], E = [], N = (b) => {
    x.push(b.x), E.push(b.y);
  };
  for (const b of a.components)
    N(b), N({ x: b.x + b.width, y: b.y + b.height }), b.ports.forEach(N);
  a.segments.forEach((b) => {
    N(b.a), N(b.b);
  });
  const p = { x: rt(x), y: rt(E) }, y = (b) => ({ x: p.x(b.x), y: p.y(b.y) }), A = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
  for (const b of a.components) for (const M of b.ports)
    h.has(M.bit) || h.set(M.bit, []), h.get(M.bit).push(M);
  for (const b of a.segments)
    A.has(b.bit) || A.set(b.bit, []), A.get(b.bit).push(b);
  const T = [];
  for (const [b, M] of h) {
    const G = Gt(A.get(b) || [], M);
    for (const $ of G.segments) T.push({ bit: b, a: y($.a), b: y($.b) });
  }
  const I = Math.max(...x.map(p.x)), j = Math.max(...E.map(p.y)), F = ["Version 4", `SHEET 1 ${I + 256} ${j + 512}`], P = /* @__PURE__ */ new Map(), g = {}, d = { version: 1, focus: n.focus, topology: n.topology.signature, components: [], nodes: [], warnings: l.warnings }, _ = (b, M) => {
    const G = zt(b);
    if (P.has(G) && P.get(G) !== M) throw Error("ASC grid would short two nets at " + G);
    P.set(G, M);
  }, O = /* @__PURE__ */ new Set();
  for (const b of a.components) {
    const M = m.get(b.id);
    if (!M) throw Error("Layout snapshot no longer matches circuit.");
    for (const G of b.ports) {
      const $ = l.node(M.terminals[G.pin]);
      O.has($) || (_(y(G), $), O.add($));
    }
  }
  for (const b of T) F.push(`WIRE ${b.a.x} ${b.a.y} ${b.b.x} ${b.b.y}`);
  for (const [b, M] of P) F.push("FLAG " + b.replace(",", " ") + " " + M);
  let B = 0;
  const D = /* @__PURE__ */ new Map();
  for (const b of a.components) {
    const M = m.get(b.id);
    if (M.synthetic) continue;
    const G = l.cards.get(M.name);
    if (G.directive) {
      F.push(`TEXT ${p.x(b.x)} ${p.y(b.y)} Left 2 !${Ne(G.line)}`), d.components.push({ id: M.name, ...G, directive: !0 });
      continue;
    }
    const $ = Ht(b, M, G, p);
    let i = D.get($);
    i || (i = "cv_symbol_" + B++, D.set($, i), g[i + ".asy"] = it($)), F.push(`SYMBOL ${i} ${p.x(b.x)} ${p.y(b.y)} R0`, "SYMATTR InstName " + G.ref, "SYMATTR Value " + Ne(G.value)), d.components.push({ id: M.name, ...G, symbol: i, ports: b.ports.map((v) => ({ pin: v.pin, ...y(v), node: l.node(M.terminals[v.pin]) })) });
  }
  const R = [...l.directives, ...l.library];
  if (R.some((b) => b.includes("\\n"))) throw Error("ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.");
  const s = [c, ...Object.values(f)].flatMap((b) => b.split(/\r?\n/).filter((M) => /^\s*\*/.test(M))).map((b) => gt(b).replaceAll("\\", "/"));
  (R.length || s.length) && F.push(`TEXT 64 ${j + 160} Left 2 !` + [...R, ...s].map((b) => b.replace(/\r?\n/g, "\\n")).join("\\n"));
  const H = F.join(`\r
`) + `\r
`;
  d.nodes = [...l.nodeNames].map(([b, M]) => ({ original: b, exported: M })), d.leaves = [...l.expected, ...n.components.filter((b) => !b.synthetic && b.kind !== "X").map((b) => ({ original: b.name, scope: "", ...l.cards.get(b.name) }))], d.blocks = [...l.blockRefs].map(([b, M]) => ({ original: b, ref: M, ltspiceRef: "X§" + M }));
  const W = Wt(H, g, d);
  d.audit = W, g["spice-schematic.asc"] = it(H), g["manifest.json"] = he(JSON.stringify(d, null, 2)), g["source.cir"] = he(c);
  for (const [b, M] of Object.entries(f)) {
    const G = b.replaceAll("\\", "/").split("/").filter(($) => $ && $ !== "." && $ !== "..").join("/");
    G && (g["source-libraries/" + G] = he(M));
  }
  return g["README.txt"] = he(`Extract ALL files into one folder, then open spice-schematic.asc in LTspice.
The .asy files are locally generated symbols and are required by the ASC.
Positions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.
manifest.json contains original/exported names, values, ports and the connectivity audit.
Collapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.
source.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.
Simulation behavior depends on LTspice model support; connectivity validation is not a simulation result.
` + l.warnings.join(`
`)), { asc: H, ascBytes: g["spice-schematic.asc"], zip: Lt(g, { level: 6 }), files: g, manifest: d };
}
export {
  Kt as exportAsc,
  it as ltspiceBytes
};
