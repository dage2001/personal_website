import { e as Tt, l as ge, n as Se, b as De, p as Et } from "./ui-DAhg5m9Y.js";
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
  for (var s = new ne(31), c = 0; c < 31; ++c)
    s[c] = n += 1 << o[c - 1];
  for (var f = new Ve(s[30]), c = 1; c < 30; ++c)
    for (var l = s[c]; l < s[c + 1]; ++l)
      f[l] = l - s[c] << 5 | c;
  return { b: s, r: f };
}, st = at(ke, 2), yt = st.b, Pe = st.r;
yt[28] = 258, Pe[258] = 28;
var _t = at(Ge, 0), Xe = _t.r, Be = new ne(32768);
for (var W = 0; W < 32768; ++W) {
  var le = (W & 43690) >> 1 | (W & 21845) << 1;
  le = (le & 52428) >> 2 | (le & 13107) << 2, le = (le & 61680) >> 4 | (le & 3855) << 4, Be[W] = ((le & 65280) >> 8 | (le & 255) << 8) >> 1;
}
var ye = (function(o, n, s) {
  for (var c = o.length, f = 0, l = new ne(n); f < c; ++f)
    o[f] && ++l[o[f] - 1];
  var h = new ne(n);
  for (f = 1; f < n; ++f)
    h[f] = h[f - 1] + l[f - 1] << 1;
  var x;
  if (s) {
    x = new ne(1 << n);
    var T = 15 - n;
    for (f = 0; f < c; ++f)
      if (o[f])
        for (var N = f << 4 | o[f], p = n - o[f], E = h[o[f] - 1]++ << p, R = E | (1 << p) - 1; E <= R; ++E)
          x[Be[E] >> T] = N;
  } else
    for (x = new ne(c), f = 0; f < c; ++f)
      o[f] && (x[f] = Be[h[o[f] - 1]++] >> 15 - o[f]);
  return x;
}), fe = new J(288);
for (var W = 0; W < 144; ++W)
  fe[W] = 8;
for (var W = 144; W < 256; ++W)
  fe[W] = 9;
for (var W = 256; W < 280; ++W)
  fe[W] = 7;
for (var W = 280; W < 288; ++W)
  fe[W] = 8;
var we = new J(32);
for (var W = 0; W < 32; ++W)
  we[W] = 5;
var bt = /* @__PURE__ */ ye(fe, 9, 0), xt = /* @__PURE__ */ ye(we, 5, 0), ct = function(o) {
  return (o + 7) / 8 | 0;
}, lt = function(o, n, s) {
  return (s == null || s > o.length) && (s = o.length), new J(o.subarray(n, s));
}, wt = [
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
], Ce = function(o, n, s) {
  var c = new Error(n || wt[o]);
  if (c.code = o, Error.captureStackTrace && Error.captureStackTrace(c, Ce), !s)
    throw c;
  return c;
}, se = function(o, n, s) {
  s <<= n & 7;
  var c = n / 8 | 0;
  o[c] |= s, o[c + 1] |= s >> 8;
}, ve = function(o, n, s) {
  s <<= n & 7;
  var c = n / 8 | 0;
  o[c] |= s, o[c + 1] |= s >> 8, o[c + 2] |= s >> 16;
}, Oe = function(o, n) {
  for (var s = [], c = 0; c < o.length; ++c)
    o[c] && s.push({ s: c, f: o[c] });
  var f = s.length, l = s.slice();
  if (!f)
    return { t: ut, l: 0 };
  if (f == 1) {
    var h = new J(s[0].s + 1);
    return h[s[0].s] = 1, { t: h, l: 1 };
  }
  s.sort(function(m, b) {
    return m.f - b.f;
  }), s.push({ s: -1, f: 25001 });
  var x = s[0], T = s[1], N = 0, p = 1, E = 2;
  for (s[0] = { s: -1, f: x.f + T.f, l: x, r: T }; p != f - 1; )
    x = s[s[N].f < s[E].f ? N++ : E++], T = s[N != p && s[N].f < s[E].f ? N++ : E++], s[p++] = { s: -1, f: x.f + T.f, l: x, r: T };
  for (var R = l[0].s, c = 1; c < f; ++c)
    l[c].s > R && (R = l[c].s);
  var d = new ne(R + 1), v = je(s[p - 1], d, 0);
  if (v > n) {
    var c = 0, S = 0, B = v - n, P = 1 << B;
    for (l.sort(function(b, C) {
      return d[C.s] - d[b.s] || b.f - C.f;
    }); c < f; ++c) {
      var F = l[c].s;
      if (d[F] > n)
        S += P - (1 << v - d[F]), d[F] = n;
      else
        break;
    }
    for (S >>= B; S > 0; ) {
      var j = l[c].s;
      d[j] < n ? S -= 1 << n - d[j]++ - 1 : ++c;
    }
    for (; c >= 0 && S; --c) {
      var _ = l[c].s;
      d[_] == n && (--d[_], ++S);
    }
    v = n;
  }
  return { t: new J(d), l: v };
}, je = function(o, n, s) {
  return o.s == -1 ? Math.max(je(o.l, n, s + 1), je(o.r, n, s + 1)) : n[o.s] = s;
}, We = function(o) {
  for (var n = o.length; n && !o[--n]; )
    ;
  for (var s = new ne(++n), c = 0, f = o[0], l = 1, h = function(T) {
    s[c++] = T;
  }, x = 1; x <= n; ++x)
    if (o[x] == f && x != n)
      ++l;
    else {
      if (!f && l > 2) {
        for (; l > 138; l -= 138)
          h(32754);
        l > 2 && (h(l > 10 ? l - 11 << 5 | 28690 : l - 3 << 5 | 12305), l = 0);
      } else if (l > 3) {
        for (h(f), --l; l > 6; l -= 6)
          h(8304);
        l > 2 && (h(l - 3 << 5 | 8208), l = 0);
      }
      for (; l--; )
        h(f);
      l = 1, f = o[x];
    }
  return { c: s.subarray(0, c), n };
}, Te = function(o, n) {
  for (var s = 0, c = 0; c < n.length; ++c)
    s += o[c] * n[c];
  return s;
}, ft = function(o, n, s) {
  var c = s.length, f = ct(n + 2);
  o[f] = c & 255, o[f + 1] = c >> 8, o[f + 2] = o[f] ^ 255, o[f + 3] = o[f + 1] ^ 255;
  for (var l = 0; l < c; ++l)
    o[f + l + 4] = s[l];
  return (f + 4 + c) * 8;
}, ze = function(o, n, s, c, f, l, h, x, T, N, p) {
  se(n, p++, s), ++f[256];
  for (var E = Oe(f, 15), R = E.t, d = E.l, v = Oe(l, 15), S = v.t, B = v.l, P = We(R), F = P.c, j = P.n, _ = We(S), m = _.c, b = _.n, C = new ne(19), A = 0; A < F.length; ++A)
    ++C[F[A] & 31];
  for (var A = 0; A < m.length; ++A)
    ++C[m[A] & 31];
  for (var O = Oe(C, 7), r = O.t, z = O.l, X = 19; X > 4 && !r[Ye[X - 1]]; --X)
    ;
  var y = N + 5 << 3, M = Te(f, fe) + Te(l, we) + h, G = Te(f, R) + Te(l, S) + h + 14 + 3 * X + Te(C, r) + 2 * C[16] + 3 * C[17] + 7 * C[18];
  if (T >= 0 && y <= M && y <= G)
    return ft(n, p, o.subarray(T, T + N));
  var $, i, g, w;
  if (se(n, p, 1 + (G < M)), p += 2, G < M) {
    $ = ye(R, d, 0), i = R, g = ye(S, B, 0), w = S;
    var U = ye(r, z, 0);
    se(n, p, j - 257), se(n, p + 5, b - 1), se(n, p + 10, X - 4), p += 14;
    for (var A = 0; A < X; ++A)
      se(n, p + 3 * A, r[Ye[A]]);
    p += 3 * X;
    for (var L = [F, m], I = 0; I < 2; ++I)
      for (var V = L[I], A = 0; A < V.length; ++A) {
        var D = V[A] & 31;
        se(n, p, U[D]), p += r[D], D > 15 && (se(n, p, V[A] >> 5 & 127), p += V[A] >> 12);
      }
  } else
    $ = bt, i = fe, g = xt, w = we;
  for (var A = 0; A < x; ++A) {
    var k = c[A];
    if (k > 255) {
      var D = k >> 18 & 31;
      ve(n, p, $[D + 257]), p += i[D + 257], D > 7 && (se(n, p, k >> 23 & 31), p += ke[D]);
      var Y = k & 31;
      ve(n, p, g[Y]), p += w[Y], Y > 3 && (ve(n, p, k >> 5 & 8191), p += Ge[Y]);
    } else
      ve(n, p, $[k]), p += i[k];
  }
  return ve(n, p, $[256]), p + i[256];
}, At = /* @__PURE__ */ new Ve([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ut = /* @__PURE__ */ new J(0), Nt = function(o, n, s, c, f, l) {
  var h = l.z || o.length, x = new J(c + h + 5 * (1 + Math.ceil(h / 7e3)) + f), T = x.subarray(c, x.length - f), N = l.l, p = (l.r || 0) & 7;
  if (n) {
    p && (T[0] = l.r >> 3);
    for (var E = At[n - 1], R = E >> 13, d = E & 8191, v = (1 << s) - 1, S = l.p || new ne(32768), B = l.h || new ne(v + 1), P = Math.ceil(s / 3), F = 2 * P, j = function(e) {
      return (o[e] ^ o[e + 1] << P ^ o[e + 2] << F) & v;
    }, _ = new Ve(25e3), m = new ne(288), b = new ne(32), C = 0, A = 0, O = l.i || 0, r = 0, z = l.w || 0, X = 0; O + 2 < h; ++O) {
      var y = j(O), M = O & 32767, G = B[y];
      if (S[M] = G, B[y] = M, z <= O) {
        var $ = h - O;
        if ((C > 7e3 || r > 24576) && ($ > 423 || !N)) {
          p = ze(o, T, 0, _, m, b, A, r, X, O - X, p), r = C = A = 0, X = O;
          for (var i = 0; i < 286; ++i)
            m[i] = 0;
          for (var i = 0; i < 30; ++i)
            b[i] = 0;
        }
        var g = 2, w = 0, U = d, L = M - G & 32767;
        if ($ > 2 && y == j(O - L))
          for (var I = Math.min(R, $) - 1, V = Math.min(32767, O), D = Math.min(258, $); L <= V && --U && M != G; ) {
            if (o[O + g] == o[O + g - L]) {
              for (var k = 0; k < D && o[O + k] == o[O + k - L]; ++k)
                ;
              if (k > g) {
                if (g = k, w = L, k > I)
                  break;
                for (var Y = Math.min(L, k - 2), oe = 0, i = 0; i < Y; ++i) {
                  var ie = O - L + i & 32767, ue = S[ie], pe = ie - ue & 32767;
                  pe > oe && (oe = pe, G = ie);
                }
              }
            }
            M = G, G = S[M], L += M - G & 32767;
          }
        if (w) {
          _[r++] = 268435456 | Pe[g] << 18 | Xe[w];
          var de = Pe[g] & 31, _e = Xe[w] & 31;
          A += ke[de] + Ge[_e], ++m[257 + de], ++b[_e], z = O + g, ++C;
        } else
          _[r++] = o[O], ++m[o[O]];
      }
    }
    for (O = Math.max(O, z); O < h; ++O)
      _[r++] = o[O], ++m[o[O]];
    p = ze(o, T, N, _, m, b, A, r, X, O - X, p), N || (l.r = p & 7 | T[p / 8 | 0] << 3, p -= 7, l.h = B, l.p = S, l.i = O, l.w = z);
  } else {
    for (var O = l.w || 0; O < h + N; O += 65535) {
      var t = O + 65535;
      t >= h && (T[p / 8 | 0] = N, t = h), p = ft(T, p + 1, o.subarray(O, t));
    }
    l.i = h;
  }
  return lt(x, 0, c + ct(p) + f);
}, Ct = /* @__PURE__ */ (function() {
  for (var o = new Int32Array(256), n = 0; n < 256; ++n) {
    for (var s = n, c = 9; --c; )
      s = (s & 1 && -306674912) ^ s >>> 1;
    o[n] = s;
  }
  return o;
})(), It = function() {
  var o = -1;
  return {
    p: function(n) {
      for (var s = o, c = 0; c < n.length; ++c)
        s = Ct[s & 255 ^ n[c]] ^ s >>> 8;
      o = s;
    },
    d: function() {
      return ~o;
    }
  };
}, St = function(o, n, s, c, f) {
  if (!f && (f = { l: 1 }, n.dictionary)) {
    var l = n.dictionary.subarray(-32768), h = new J(l.length + o.length);
    h.set(l), h.set(o, l.length), o = h, f.w = l.length;
  }
  return Nt(o, n.level == null ? 6 : n.level, n.mem == null ? f.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(o.length))) * 1.5) : 20 : 12 + n.mem, s, c, f);
}, dt = function(o, n) {
  var s = {};
  for (var c in o)
    s[c] = o[c];
  for (var c in n)
    s[c] = n[c];
  return s;
}, Z = function(o, n, s) {
  for (; s; ++n)
    o[n] = s, s >>>= 8;
};
function Dt(o, n) {
  return St(o, n || {}, 0, 0);
}
var mt = function(o, n, s, c) {
  for (var f in o) {
    var l = o[f], h = n + f, x = c;
    Array.isArray(l) && (x = dt(c, l[1]), l = l[0]), l instanceof J ? s[h] = [l, x] : (s[h += "/"] = [new J(0), x], mt(l, h, s, c));
  }
}, He = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Ot = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Mt = 0;
try {
  Ot.decode(ut, { stream: !0 }), Mt = 1;
} catch {
}
function he(o, n) {
  var s;
  if (He)
    return He.encode(o);
  for (var c = o.length, f = new J(o.length + (o.length >> 1)), l = 0, h = function(N) {
    f[l++] = N;
  }, s = 0; s < c; ++s) {
    if (l + 5 > f.length) {
      var x = new J(l + 8 + (c - s << 1));
      x.set(f), f = x;
    }
    var T = o.charCodeAt(s);
    T < 128 || n ? h(T) : T < 2048 ? (h(192 | T >> 6), h(128 | T & 63)) : T > 55295 && T < 57344 ? (T = 65536 + (T & 1047552) | o.charCodeAt(++s) & 1023, h(240 | T >> 18), h(128 | T >> 12 & 63), h(128 | T >> 6 & 63), h(128 | T & 63)) : (h(224 | T >> 12), h(128 | T >> 6 & 63), h(128 | T & 63));
  }
  return lt(f, 0, l);
}
var Ue = function(o) {
  var n = 0;
  if (o)
    for (var s in o) {
      var c = o[s].length;
      c > 65535 && Ce(9), n += c + 4;
    }
  return n;
}, Qe = function(o, n, s, c, f, l, h, x) {
  var T = c.length, N = s.extra, p = x && x.length, E = Ue(N);
  Z(o, n, h != null ? 33639248 : 67324752), n += 4, h != null && (o[n++] = 20, o[n++] = s.os), o[n] = 20, n += 2, o[n++] = s.flag << 1 | (l < 0 && 8), o[n++] = f && 8, o[n++] = s.compression & 255, o[n++] = s.compression >> 8;
  var R = new Date(s.mtime == null ? Date.now() : s.mtime), d = R.getFullYear() - 1980;
  if ((d < 0 || d > 119) && Ce(10), Z(o, n, d << 25 | R.getMonth() + 1 << 21 | R.getDate() << 16 | R.getHours() << 11 | R.getMinutes() << 5 | R.getSeconds() >> 1), n += 4, l != -1 && (Z(o, n, s.crc), Z(o, n + 4, l < 0 ? -l - 2 : l), Z(o, n + 8, s.size)), Z(o, n + 12, T), Z(o, n + 14, E), n += 16, h != null && (Z(o, n, p), Z(o, n + 6, s.attrs), Z(o, n + 10, h), n += 14), o.set(c, n), n += T, E)
    for (var v in N) {
      var S = N[v], B = S.length;
      Z(o, n, +v), Z(o, n + 2, B), o.set(S, n + 4), n += 4 + B;
    }
  return p && (o.set(x, n), n += p), n;
}, Lt = function(o, n, s, c, f) {
  Z(o, n, 101010256), Z(o, n + 8, s), Z(o, n + 10, s), Z(o, n + 12, c), Z(o, n + 16, f);
};
function Rt(o, n) {
  n || (n = {});
  var s = {}, c = [];
  mt(o, "", s, n);
  var f = 0, l = 0;
  for (var h in s) {
    var x = s[h], T = x[0], N = x[1], p = N.level == 0 ? 0 : 8, E = he(h), R = E.length, d = N.comment, v = d && he(d), S = v && v.length, B = Ue(N.extra);
    R > 65535 && Ce(11);
    var P = p ? Dt(T, N) : T, F = P.length, j = It();
    j.p(T), c.push(dt(N, {
      size: T.length,
      crc: j.d(),
      c: P,
      f: E,
      m: v,
      u: R != h.length || v && d.length != S,
      o: f,
      compression: p
    })), f += 30 + R + B + F, l += 76 + 2 * (R + B) + (S || 0) + F;
  }
  for (var _ = new J(l + 22), m = f, b = l - f, C = 0; C < c.length; ++C) {
    var E = c[C];
    Qe(_, E.o, E, E.f, E.u, E.c.length);
    var A = 30 + E.f.length + Ue(E.extra);
    _.set(E.c, E.o + A), Qe(_, f, E, E.f, E.u, E.c.length, E.o, E.m), f += 16 + A + (E.m ? E.m.length : 0);
  }
  return Lt(_, f, c.length, b, m), _;
}
function Ft(o) {
  if (Object.prototype.hasOwnProperty.call(o, "__esModule")) return o;
  var n = o.default;
  if (typeof n == "function") {
    var s = function c() {
      var f = !1;
      try {
        f = this instanceof c;
      } catch {
      }
      return f ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    s.prototype = n.prototype;
  } else s = {};
  return Object.defineProperty(s, "__esModule", { value: !0 }), Object.keys(o).forEach(function(c) {
    var f = Object.getOwnPropertyDescriptor(o, c);
    Object.defineProperty(s, c, f.get ? f : {
      enumerable: !0,
      get: function() {
        return o[c];
      }
    });
  }), s;
}
var Me = {};
const Pt = {}, Bt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Pt
}, Symbol.toStringTag, { value: "Module" })), jt = /* @__PURE__ */ Ft(Bt);
var Ke;
function Ut() {
  return Ke || (Ke = 1, (function(o) {
    (function(n) {
      n.parser = function(t, e) {
        return new c(t, e);
      }, n.SAXParser = c, n.SAXStream = E, n.createStream = N, n.MAX_BUFFER_LENGTH = 64 * 1024;
      var s = [
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
        l(u), u.q = u.c = "", u.bufferCheckPosition = n.MAX_BUFFER_LENGTH, u.encoding = null, u.opt = e || {}, u.opt.lowercase = u.opt.lowercase || u.opt.lowercasetags, u.looseCase = u.opt.lowercase ? "toLowerCase" : "toUpperCase", u.opt.maxEntityCount = u.opt.maxEntityCount || 512, u.opt.maxEntityDepth = u.opt.maxEntityDepth || 4, u.entityCount = u.entityDepth = 0, u.tags = [], u.closed = u.closedRoot = u.sawRoot = !1, u.tag = u.error = null, u.strict = !!t, u.noscript = !!(t || u.opt.noscript), u.state = r.BEGIN, u.strictEntities = u.opt.strictEntities, u.ENTITIES = u.strictEntities ? Object.create(n.XML_ENTITIES) : Object.create(n.ENTITIES), u.attribList = [], u.opt.xmlns && (u.ns = Object.create(B)), u.opt.unquotedAttributeValues === void 0 && (u.opt.unquotedAttributeValues = !t), u.trackPosition = u.opt.position !== !1, u.trackPosition && (u.position = u.line = u.column = 0), X(u, "onready");
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
        for (var e = Math.max(n.MAX_BUFFER_LENGTH, 10), u = 0, a = 0, q = s.length; a < q; a++) {
          var H = t[s[a]].length;
          if (H > e)
            switch (s[a]) {
              case "textNode":
                g(t);
                break;
              case "cdata":
                i(t, "oncdata", t.cdata), t.cdata = "";
                break;
              case "script":
                i(t, "onscript", t.script), t.script = "";
                break;
              default:
                U(t, "Max buffer length exceeded: " + s[a]);
            }
          u = Math.max(u, H);
        }
        var Q = n.MAX_BUFFER_LENGTH - u;
        t.bufferCheckPosition = Q + t.position;
      }
      function l(t) {
        for (var e = 0, u = s.length; e < u; e++)
          t[s[e]] = "";
      }
      function h(t) {
        g(t), t.cdata !== "" && (i(t, "oncdata", t.cdata), t.cdata = ""), t.script !== "" && (i(t, "onscript", t.script), t.script = "");
      }
      c.prototype = {
        end: function() {
          L(this);
        },
        write: _e,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          h(this);
        }
      };
      var x;
      try {
        x = jt.Stream;
      } catch {
        x = function() {
        };
      }
      x || (x = function() {
      });
      var T = n.EVENTS.filter(function(t) {
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
        x.apply(this), this._parser = new c(t, e), this.writable = !0, this.readable = !0;
        var u = this;
        this._parser.onend = function() {
          u.emit("end");
        }, this._parser.onerror = function(a) {
          u.emit("error", a), u._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, T.forEach(function(a) {
          Object.defineProperty(u, "on" + a, {
            get: function() {
              return u._parser["on" + a];
            },
            set: function(q) {
              if (!q)
                return u.removeAllListeners(a), u._parser["on" + a] = q, q;
              u.on(a, q);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      E.prototype = Object.create(x.prototype, {
        constructor: {
          value: E
        }
      }), E.prototype._decodeBuffer = function(t, e) {
        if (this._decoderBuffer && (t = Buffer.concat([this._decoderBuffer, t]), this._decoderBuffer = null), !this._decoder) {
          var u = p(t, e);
          if (!u)
            return this._decoderBuffer = t, "";
          this._parser.encoding = u, this._decoder = new TextDecoder(u);
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
          var u = this._decoder.decode();
          u && (this._parser.write(u), this.emit("data", u));
        }
        return this._parser.end(), !0;
      }, E.prototype.on = function(t, e) {
        var u = this;
        return !u._parser["on" + t] && T.indexOf(t) !== -1 && (u._parser["on" + t] = function() {
          var a = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          a.splice(0, 0, t), u.emit.apply(u, a);
        }), x.prototype.on.call(u, t, e);
      };
      var R = /^\[CDATA\[$/i, d = /^DOCTYPE$/i, v = "http://www.w3.org/XML/1998/namespace", S = "http://www.w3.org/2000/xmlns/", B = { xml: v, xmlns: S }, P = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, F = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, j = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, _ = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function m(t) {
        return t === " " || t === `
` || t === "\r" || t === "	";
      }
      function b(t) {
        return t === '"' || t === "'";
      }
      function C(t) {
        return t === ">" || m(t);
      }
      function A(t, e) {
        return t.test(e);
      }
      function O(t, e) {
        return !A(t, e);
      }
      var r = 0;
      n.STATE = {
        BEGIN: r++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: r++,
        // leading whitespace
        TEXT: r++,
        // general stuff
        TEXT_ENTITY: r++,
        // &amp and such.
        OPEN_WAKA: r++,
        // <
        SGML_DECL: r++,
        // <!BLARG
        SGML_DECL_QUOTED: r++,
        // <!BLARG foo "bar
        DOCTYPE: r++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: r++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: r++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: r++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: r++,
        // <!-
        COMMENT: r++,
        // <!--
        COMMENT_ENDING: r++,
        // <!-- blah -
        COMMENT_ENDED: r++,
        // <!-- blah --
        CDATA: r++,
        // <![CDATA[ something
        CDATA_ENDING: r++,
        // ]
        CDATA_ENDING_2: r++,
        // ]]
        PROC_INST: r++,
        // <?hi
        PROC_INST_BODY: r++,
        // <?hi there
        PROC_INST_ENDING: r++,
        // <?hi "there" ?
        OPEN_TAG: r++,
        // <strong
        OPEN_TAG_SLASH: r++,
        // <strong /
        ATTRIB: r++,
        // <a
        ATTRIB_NAME: r++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: r++,
        // <a foo _
        ATTRIB_VALUE: r++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: r++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: r++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: r++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: r++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: r++,
        // <foo bar=&quot
        CLOSE_TAG: r++,
        // </a
        CLOSE_TAG_SAW_WHITE: r++,
        // </a   >
        SCRIPT: r++,
        // <script> ...
        SCRIPT_ENDING: r++
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
      for (var z in n.STATE)
        n.STATE[n.STATE[z]] = z;
      r = n.STATE;
      function X(t, e, u) {
        t[e] && t[e](u);
      }
      function y(t) {
        var e = t && t.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return e ? e[2] : null;
      }
      function M(t) {
        return t ? t.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function G(t, e) {
        const u = M(t), a = M(e);
        return !u || !a ? !0 : a === "utf16" ? u === "utf16le" || u === "utf16be" : u === a;
      }
      function $(t, e) {
        if (!(!t.strict || !t.encoding || !e || e.name !== "xml")) {
          var u = y(e.body);
          u && !G(t.encoding, u) && I(
            t,
            "XML declaration encoding " + u + " does not match detected stream encoding " + t.encoding.toUpperCase()
          );
        }
      }
      function i(t, e, u) {
        t.textNode && g(t), X(t, e, u);
      }
      function g(t) {
        t.textNode = w(t.opt, t.textNode), t.textNode && X(t, "ontext", t.textNode), t.textNode = "";
      }
      function w(t, e) {
        return t.trim && (e = e.trim()), t.normalize && (e = e.replace(/\s+/g, " ")), e;
      }
      function U(t, e) {
        return g(t), t.trackPosition && (e += `
Line: ` + t.line + `
Column: ` + t.column + `
Char: ` + t.c), e = new Error(e), t.error = e, X(t, "onerror", e), t;
      }
      function L(t) {
        return t.sawRoot && !t.closedRoot && I(t, "Unclosed root tag"), t.state !== r.BEGIN && t.state !== r.BEGIN_WHITESPACE && t.state !== r.TEXT && U(t, "Unexpected end"), g(t), t.c = "", t.closed = !0, X(t, "onend"), c.call(t, t.strict, t.opt), t;
      }
      function I(t, e) {
        if (typeof t != "object" || !(t instanceof c))
          throw new Error("bad call to strictFail");
        t.strict && U(t, e);
      }
      function V(t) {
        t.strict || (t.tagName = t.tagName[t.looseCase]());
        var e = t.tags[t.tags.length - 1] || t, u = t.tag = { name: t.tagName, attributes: {} };
        t.opt.xmlns && (u.ns = e.ns), t.attribList.length = 0, i(t, "onopentagstart", u);
      }
      function D(t, e) {
        var u = t.indexOf(":"), a = u < 0 ? ["", t] : t.split(":"), q = a[0], H = a[1];
        return e && t === "xmlns" && (q = "xmlns", H = ""), { prefix: q, local: H };
      }
      function k(t) {
        if (t.strict || (t.attribName = t.attribName[t.looseCase]()), t.attribList.indexOf(t.attribName) !== -1 || t.tag.attributes.hasOwnProperty(t.attribName)) {
          t.attribName = t.attribValue = "";
          return;
        }
        if (t.opt.xmlns) {
          var e = D(t.attribName, !0), u = e.prefix, a = e.local;
          if (u === "xmlns")
            if (a === "xml" && t.attribValue !== v)
              I(
                t,
                "xml: prefix must be bound to " + v + `
Actual: ` + t.attribValue
              );
            else if (a === "xmlns" && t.attribValue !== S)
              I(
                t,
                "xmlns: prefix must be bound to " + S + `
Actual: ` + t.attribValue
              );
            else {
              var q = t.tag, H = t.tags[t.tags.length - 1] || t;
              q.ns === H.ns && (q.ns = Object.create(H.ns)), q.ns[a] = t.attribValue;
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
          var u = t.tag, a = D(t.tagName);
          u.prefix = a.prefix, u.local = a.local, u.uri = u.ns[a.prefix] || "", u.prefix && !u.uri && (I(
            t,
            "Unbound namespace prefix: " + JSON.stringify(t.tagName)
          ), u.uri = a.prefix);
          var q = t.tags[t.tags.length - 1] || t;
          u.ns && q.ns !== u.ns && Object.keys(u.ns).forEach(function(qe) {
            i(t, "onopennamespace", {
              prefix: qe,
              uri: u.ns[qe]
            });
          });
          for (var H = 0, Q = t.attribList.length; H < Q; H++) {
            var ee = t.attribList[H], te = ee[0], re = ee[1], K = D(te, !0), ae = K.prefix, vt = K.local, $e = ae === "" ? "" : u.ns[ae] || "", Ie = {
              name: te,
              value: re,
              prefix: ae,
              local: vt,
              uri: $e
            };
            ae && ae !== "xmlns" && !$e && (I(
              t,
              "Unbound namespace prefix: " + JSON.stringify(ae)
            ), Ie.uri = ae), t.tag.attributes[te] = Ie, i(t, "onattribute", Ie);
          }
          t.attribList.length = 0;
        }
        t.tag.isSelfClosing = !!e, t.sawRoot = !0, t.tags.push(t.tag), i(t, "onopentag", t.tag), e || (!t.noscript && t.tagName.toLowerCase() === "script" ? t.state = r.SCRIPT : t.state = r.TEXT, t.tag = null, t.tagName = ""), t.attribName = t.attribValue = "", t.attribList.length = 0;
      }
      function oe(t) {
        if (!t.tagName) {
          I(t, "Weird empty close tag."), t.textNode += "</>", t.state = r.TEXT;
          return;
        }
        if (t.script) {
          if (t.tagName !== "script") {
            t.script += "</" + t.tagName + ">", t.tagName = "", t.state = r.SCRIPT;
            return;
          }
          i(t, "onscript", t.script), t.script = "";
        }
        var e = t.tags.length, u = t.tagName;
        t.strict || (u = u[t.looseCase]());
        for (var a = u; e--; ) {
          var q = t.tags[e];
          if (q.name !== a)
            I(t, "Unexpected close tag");
          else
            break;
        }
        if (e < 0) {
          I(t, "Unmatched closing tag: " + t.tagName), t.textNode += "</" + t.tagName + ">", t.state = r.TEXT;
          return;
        }
        t.tagName = u;
        for (var H = t.tags.length; H-- > e; ) {
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
        e === 0 && (t.closedRoot = !0), t.tagName = t.attribValue = t.attribName = "", t.attribList.length = 0, t.state = r.TEXT;
      }
      function ie(t) {
        var e = t.entity, u = e.toLowerCase(), a, q = "";
        return t.ENTITIES[e] ? t.ENTITIES[e] : t.ENTITIES[u] ? t.ENTITIES[u] : (e = u, e.charAt(0) === "#" && (e.charAt(1) === "x" ? (e = e.slice(2), a = parseInt(e, 16), q = a.toString(16)) : (e = e.slice(1), a = parseInt(e, 10), q = a.toString(10))), e = e.replace(/^0+/, ""), isNaN(a) || q.toLowerCase() !== e || a < 0 || a > 1114111 || !ue(a) ? (I(t, "Invalid character entity"), "&" + t.entity + ";") : String.fromCodePoint(a));
      }
      function ue(t) {
        return t === 9 || t === 10 || t === 13 || t >= 32 && t <= 55295 || t >= 57344 && t <= 65533 || t >= 65536 && t <= 1114111;
      }
      function pe(t, e) {
        e === "<" ? (t.state = r.OPEN_WAKA, t.startTagPosition = t.position) : m(e) || (I(t, "Non-whitespace before first tag."), t.textNode = e, t.state = r.TEXT);
      }
      function de(t, e) {
        var u = "";
        return e < t.length && (u = t.charAt(e)), u;
      }
      function _e(t) {
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
        for (var u = 0, a = ""; a = de(t, u++), e.c = a, !!a; )
          switch (e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++), e.state) {
            case r.BEGIN:
              if (e.state = r.BEGIN_WHITESPACE, a === "\uFEFF")
                continue;
              pe(e, a);
              continue;
            case r.BEGIN_WHITESPACE:
              pe(e, a);
              continue;
            case r.TEXT:
              if (e.sawRoot && !e.closedRoot) {
                for (var H = u - 1; a && a !== "<" && a !== "&"; )
                  a = de(t, u++), a && e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++);
                e.textNode += t.substring(H, u - 1);
              }
              a === "<" && !(e.sawRoot && e.closedRoot && !e.strict) ? (e.state = r.OPEN_WAKA, e.startTagPosition = e.position) : (!m(a) && (!e.sawRoot || e.closedRoot) && I(e, "Text data outside of root node."), a === "&" ? e.state = r.TEXT_ENTITY : e.textNode += a);
              continue;
            case r.SCRIPT:
              a === "<" ? e.state = r.SCRIPT_ENDING : e.script += a;
              continue;
            case r.SCRIPT_ENDING:
              a === "/" ? e.state = r.CLOSE_TAG : (e.script += "<" + a, e.state = r.SCRIPT);
              continue;
            case r.OPEN_WAKA:
              if (a === "!")
                e.state = r.SGML_DECL, e.sgmlDecl = "";
              else if (!m(a)) if (A(P, a))
                e.state = r.OPEN_TAG, e.tagName = a;
              else if (a === "/")
                e.state = r.CLOSE_TAG, e.tagName = "";
              else if (a === "?")
                e.state = r.PROC_INST, e.procInstName = e.procInstBody = "";
              else {
                if (I(e, "Unencoded <"), e.startTagPosition + 1 < e.position) {
                  var q = e.position - e.startTagPosition;
                  a = new Array(q).join(" ") + a;
                }
                e.textNode += "<" + a, e.state = r.TEXT;
              }
              continue;
            case r.SGML_DECL:
              if (e.sgmlDecl + a === "--") {
                e.state = r.COMMENT, e.comment = "", e.sgmlDecl = "";
                continue;
              }
              e.doctype && e.doctype !== !0 && e.sgmlDecl ? (e.state = r.DOCTYPE_DTD, e.doctype += "<!" + e.sgmlDecl + a, e.sgmlDecl = "") : R.test(e.sgmlDecl + a) ? (i(e, "onopencdata"), e.state = r.CDATA, e.sgmlDecl = "", e.cdata = "") : d.test(e.sgmlDecl + a) ? (e.state = r.DOCTYPE, (e.doctype || e.sawRoot) && I(
                e,
                "Inappropriately located doctype declaration"
              ), e.doctype = "", e.sgmlDecl = "") : a === ">" ? (i(e, "onsgmldeclaration", e.sgmlDecl), e.sgmlDecl = "", e.state = r.TEXT) : (b(a) && (e.state = r.SGML_DECL_QUOTED), e.sgmlDecl += a);
              continue;
            case r.SGML_DECL_QUOTED:
              a === e.q && (e.state = r.SGML_DECL, e.q = ""), e.sgmlDecl += a;
              continue;
            case r.DOCTYPE:
              a === ">" ? (e.state = r.TEXT, i(e, "ondoctype", e.doctype), e.doctype = !0) : (e.doctype += a, a === "[" ? e.state = r.DOCTYPE_DTD : b(a) && (e.state = r.DOCTYPE_QUOTED, e.q = a));
              continue;
            case r.DOCTYPE_QUOTED:
              e.doctype += a, a === e.q && (e.q = "", e.state = r.DOCTYPE);
              continue;
            case r.DOCTYPE_DTD:
              a === "]" ? (e.doctype += a, e.state = r.DOCTYPE) : a === "<" ? (e.state = r.OPEN_WAKA, e.startTagPosition = e.position) : b(a) ? (e.doctype += a, e.state = r.DOCTYPE_DTD_QUOTED, e.q = a) : e.doctype += a;
              continue;
            case r.DOCTYPE_DTD_QUOTED:
              e.doctype += a, a === e.q && (e.state = r.DOCTYPE_DTD, e.q = "");
              continue;
            case r.COMMENT:
              a === "-" ? e.state = r.COMMENT_ENDING : e.comment += a;
              continue;
            case r.COMMENT_ENDING:
              a === "-" ? (e.state = r.COMMENT_ENDED, e.comment = w(e.opt, e.comment), e.comment && i(e, "oncomment", e.comment), e.comment = "") : (e.comment += "-" + a, e.state = r.COMMENT);
              continue;
            case r.COMMENT_ENDED:
              a !== ">" ? (I(e, "Malformed comment"), e.comment += "--" + a, e.state = r.COMMENT) : e.doctype && e.doctype !== !0 ? e.state = r.DOCTYPE_DTD : e.state = r.TEXT;
              continue;
            case r.CDATA:
              for (var H = u - 1; a && a !== "]"; )
                a = de(t, u++), a && e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++);
              e.cdata += t.substring(H, u - 1), a === "]" && (e.state = r.CDATA_ENDING);
              continue;
            case r.CDATA_ENDING:
              a === "]" ? e.state = r.CDATA_ENDING_2 : (e.cdata += "]" + a, e.state = r.CDATA);
              continue;
            case r.CDATA_ENDING_2:
              a === ">" ? (e.cdata && i(e, "oncdata", e.cdata), i(e, "onclosecdata"), e.cdata = "", e.state = r.TEXT) : a === "]" ? e.cdata += "]" : (e.cdata += "]]" + a, e.state = r.CDATA);
              continue;
            case r.PROC_INST:
              a === "?" ? e.state = r.PROC_INST_ENDING : m(a) ? e.state = r.PROC_INST_BODY : e.procInstName += a;
              continue;
            case r.PROC_INST_BODY:
              if (!e.procInstBody && m(a))
                continue;
              a === "?" ? e.state = r.PROC_INST_ENDING : e.procInstBody += a;
              continue;
            case r.PROC_INST_ENDING:
              if (a === ">") {
                const re = {
                  name: e.procInstName,
                  body: e.procInstBody
                };
                $(e, re), i(e, "onprocessinginstruction", re), e.procInstName = e.procInstBody = "", e.state = r.TEXT;
              } else
                e.procInstBody += "?" + a, e.state = r.PROC_INST_BODY;
              continue;
            case r.OPEN_TAG:
              A(F, a) ? e.tagName += a : (V(e), a === ">" ? Y(e) : a === "/" ? e.state = r.OPEN_TAG_SLASH : (m(a) || I(e, "Invalid character in tag name"), e.state = r.ATTRIB));
              continue;
            case r.OPEN_TAG_SLASH:
              a === ">" ? (Y(e, !0), oe(e)) : (I(
                e,
                "Forward-slash in opening tag not followed by >"
              ), e.state = r.ATTRIB);
              continue;
            case r.ATTRIB:
              if (m(a))
                continue;
              a === ">" ? Y(e) : a === "/" ? e.state = r.OPEN_TAG_SLASH : A(P, a) ? (e.attribName = a, e.attribValue = "", e.state = r.ATTRIB_NAME) : I(e, "Invalid attribute name");
              continue;
            case r.ATTRIB_NAME:
              a === "=" ? e.state = r.ATTRIB_VALUE : a === ">" ? (I(e, "Attribute without value"), e.attribValue = e.attribName, k(e), Y(e)) : m(a) ? e.state = r.ATTRIB_NAME_SAW_WHITE : A(F, a) ? e.attribName += a : I(e, "Invalid attribute name");
              continue;
            case r.ATTRIB_NAME_SAW_WHITE:
              if (a === "=")
                e.state = r.ATTRIB_VALUE;
              else {
                if (m(a))
                  continue;
                I(e, "Attribute without value"), e.tag.attributes[e.attribName] = "", e.attribValue = "", i(e, "onattribute", {
                  name: e.attribName,
                  value: ""
                }), e.attribName = "", a === ">" ? Y(e) : A(P, a) ? (e.attribName = a, e.state = r.ATTRIB_NAME) : (I(e, "Invalid attribute name"), e.state = r.ATTRIB);
              }
              continue;
            case r.ATTRIB_VALUE:
              if (m(a))
                continue;
              b(a) ? (e.q = a, e.state = r.ATTRIB_VALUE_QUOTED) : (e.opt.unquotedAttributeValues || U(e, "Unquoted attribute value"), e.state = r.ATTRIB_VALUE_UNQUOTED, e.attribValue = a);
              continue;
            case r.ATTRIB_VALUE_QUOTED:
              if (a !== e.q) {
                a === "&" ? e.state = r.ATTRIB_VALUE_ENTITY_Q : e.attribValue += a;
                continue;
              }
              k(e), e.q = "", e.state = r.ATTRIB_VALUE_CLOSED;
              continue;
            case r.ATTRIB_VALUE_CLOSED:
              m(a) ? e.state = r.ATTRIB : a === ">" ? Y(e) : a === "/" ? e.state = r.OPEN_TAG_SLASH : A(P, a) ? (I(e, "No whitespace between attributes"), e.attribName = a, e.attribValue = "", e.state = r.ATTRIB_NAME) : I(e, "Invalid attribute name");
              continue;
            case r.ATTRIB_VALUE_UNQUOTED:
              if (!C(a)) {
                a === "&" ? e.state = r.ATTRIB_VALUE_ENTITY_U : e.attribValue += a;
                continue;
              }
              k(e), a === ">" ? Y(e) : e.state = r.ATTRIB;
              continue;
            case r.CLOSE_TAG:
              if (e.tagName)
                a === ">" ? oe(e) : A(F, a) ? e.tagName += a : e.script ? (e.script += "</" + e.tagName + a, e.tagName = "", e.state = r.SCRIPT) : (m(a) || I(e, "Invalid tagname in closing tag"), e.state = r.CLOSE_TAG_SAW_WHITE);
              else {
                if (m(a))
                  continue;
                O(P, a) ? e.script ? (e.script += "</" + a, e.state = r.SCRIPT) : I(e, "Invalid tagname in closing tag.") : e.tagName = a;
              }
              continue;
            case r.CLOSE_TAG_SAW_WHITE:
              if (m(a))
                continue;
              a === ">" ? oe(e) : I(e, "Invalid characters in closing tag");
              continue;
            case r.TEXT_ENTITY:
            case r.ATTRIB_VALUE_ENTITY_Q:
            case r.ATTRIB_VALUE_ENTITY_U:
              var Q, ee;
              switch (e.state) {
                case r.TEXT_ENTITY:
                  Q = r.TEXT, ee = "textNode";
                  break;
                case r.ATTRIB_VALUE_ENTITY_Q:
                  Q = r.ATTRIB_VALUE_QUOTED, ee = "attribValue";
                  break;
                case r.ATTRIB_VALUE_ENTITY_U:
                  Q = r.ATTRIB_VALUE_UNQUOTED, ee = "attribValue";
                  break;
              }
              if (a === ";") {
                var te = ie(e);
                e.opt.unparsedEntities && !Object.values(n.XML_ENTITIES).includes(te) ? ((e.entityCount += 1) > e.opt.maxEntityCount && U(
                  e,
                  "Parsed entity count exceeds max entity count"
                ), (e.entityDepth += 1) > e.opt.maxEntityDepth && U(
                  e,
                  "Parsed entity depth exceeds max entity depth"
                ), e.entity = "", e.state = Q, e.write(te), e.entityDepth -= 1) : (e[ee] += te, e.entity = "", e.state = Q);
              } else A(e.entity.length ? _ : j, a) ? e.entity += a : (I(e, "Invalid character in entity name"), e[ee] += "&" + e.entity + a, e.entity = "", e.state = Q);
              continue;
            default:
              throw new Error(e, "Unknown state: " + e.state);
          }
        return e.position >= e.bufferCheckPosition && f(e), e;
      }
      String.fromCodePoint || (function() {
        var t = String.fromCharCode, e = Math.floor, u = function() {
          var a = 16384, q = [], H, Q, ee = -1, te = arguments.length;
          if (!te)
            return "";
          for (var re = ""; ++ee < te; ) {
            var K = Number(arguments[ee]);
            if (!isFinite(K) || // `NaN`, `+Infinity`, or `-Infinity`
            K < 0 || // not a valid Unicode code point
            K > 1114111 || // not a valid Unicode code point
            e(K) !== K)
              throw RangeError("Invalid code point: " + K);
            K <= 65535 ? q.push(K) : (K -= 65536, H = (K >> 10) + 55296, Q = K % 1024 + 56320, q.push(H, Q)), (ee + 1 === te || q.length > a) && (re += t.apply(null, q), q.length = 0);
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
  })(Me)), Me;
}
var Le, Ze;
function Vt() {
  if (Ze) return Le;
  Ze = 1;
  var o = Ut().parser;
  function n(s) {
    var c = [], f = [], l = c, h;
    return h = o(!0), h.ontext = function(x) {
      x.trim() !== "" && l.push(x);
    }, h.onopentag = function(x) {
      var T;
      T = [x.name, x.attributes], f.push(l), l.push(T), l = T;
    }, h.onclosetag = function() {
      l = f.pop();
    }, h.write(s).close(), c[0];
  }
  return Le = n, Le;
}
var Re, Je;
function kt() {
  if (Je) return Re;
  Je = 1;
  function o(n, s) {
    var c = function() {
    }, f = c, l = c;
    function h() {
      this._skip = !0;
    }
    function x() {
      this._remove = !0;
    }
    function T(E) {
      this._name = E;
    }
    function N(E) {
      this._replace = E;
    }
    function p(E, R) {
      var d, v = { attr: {}, full: E }, S = {
        name: T,
        skip: h,
        // break: breakFn,
        remove: x,
        replace: N,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, B = !0, P, F, j;
      if (E !== void 0 && E !== null && E !== !0 && E !== !1)
        switch (d = Object.prototype.toString.call(E), d) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (E.some(function(_, m) {
              if (m === 0)
                return v.name = _, !1;
              if (m === 1)
                return Object.prototype.toString.call(_) === "[object Object]" && (B = !1, v.attr = _), !0;
            }), f.call(S, v, R), S._name && (E[0] = S._name), S._replace)
              return S._replace;
            if (S._remove)
              return null;
            if (!S._skip) {
              for (P = 0, F = E.length; P < F; ) {
                if (P > 1 || P === 1 && B) {
                  if (j = p(E[P], v), j === null) {
                    E.splice(P, 1), F -= 1;
                    continue;
                  }
                  j && (E[P] = j);
                }
                P += 1;
              }
              if (l.call(S, v, R), S._name && (E[0] = S._name), S._replace)
                return S._replace;
              if (S._remove)
                return null;
            }
        }
    }
    s && (s.enter && (f = s.enter), s.leave && (l = s.leave)), p(n, void 0);
  }
  return Re = o, Re;
}
var Fe, et;
function Gt() {
  if (et) return Fe;
  et = 1;
  const o = Vt(), n = kt(), s = (f) => String(f).replace(/[&<>"']/g, (l) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[l]);
  function c(f) {
    const [l, ...h] = f, x = h[0] && typeof h[0] == "object" && !Array.isArray(h[0]) ? h.shift() : {}, T = "<" + l + Object.entries(x).map(([N, p]) => " " + N + '="' + s(p) + '"').join("");
    return h.length ? T + ">" + h.map((N) => Array.isArray(N) ? c(N) : s(N)).join("") + "</" + l + ">" : T + "/>";
  }
  return Fe = { parse: o, p: o, traverse: n, t: n, stringify: c, s: c }, Fe;
}
Gt();
const Ae = (o) => Math.round(Number(o) * 1e3) / 1e3, me = (o) => Ae(o.x) + "," + Ae(o.y), ce = (o, n) => Math.abs(o - n) < 2e-3, tt = (o, n, s) => o >= Math.min(n, s) - 2e-3 && o <= Math.max(n, s) + 2e-3, Ee = (o, n) => ce(n.a.x, n.b.x) ? ce(o.x, n.a.x) && tt(o.y, n.a.y, n.b.y) : ce(o.y, n.a.y) && tt(o.x, n.a.x, n.b.x), nt = (o, n) => Math.abs(o.x - n.x) + Math.abs(o.y - n.y);
function $t(o, n = [], s = []) {
  const c = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), h = (m) => {
    const b = { x: Ae(m.x), y: Ae(m.y) };
    return c.set(me(b), b), me(b);
  };
  for (const m of o)
    h(m.a), h(m.b);
  const x = n.map(h);
  for (const m of s)
    f.add(h(m.a)), f.add(h(m.b)), l.add([me(m.a), me(m.b)].sort().join("|"));
  for (let m = 0; m < o.length; m++) for (let b = m + 1; b < o.length; b++) {
    const C = o[m], A = o[b], O = ce(C.a.x, C.b.x), r = ce(A.a.x, A.b.x);
    if (O === r) continue;
    const z = O ? C : A, X = O ? A : C, y = { x: z.a.x, y: X.a.y };
    Ee(y, z) && Ee(y, X) && h(y);
  }
  const T = /* @__PURE__ */ new Map();
  for (const m of o) {
    const b = [...c.values()].filter((C) => Ee(C, m)).sort((C, A) => C.x - A.x || C.y - A.y);
    for (let C = 1; C < b.length; C++) {
      const A = me(b[C - 1]), O = me(b[C]);
      A !== O && T.set([A, O].sort().join("|"), { a: A, b: O, length: nt(b[C - 1], b[C]) });
    }
  }
  const N = new Map([...c.keys()].map((m) => [m, m])), p = (m) => {
    let b = m;
    for (; N.get(b) !== b; ) b = N.get(b);
    for (; m !== b; ) {
      const C = N.get(m);
      N.set(m, b), m = C;
    }
    return b;
  }, E = (m) => l.has([m.a, m.b].sort().join("|")) || s.some((b) => Ee(c.get(m.a), b) && Ee(c.get(m.b), b)), R = [...T.entries()].sort(([m, b], [C, A]) => Number(E(A)) - Number(E(b)) || b.length - A.length || m.localeCompare(C)), d = new Map([...c.keys()].map((m) => [m, /* @__PURE__ */ new Set()]));
  let v = 0;
  for (const [, m] of R) {
    const b = p(m.a), C = p(m.b);
    if (b === C) {
      v++;
      continue;
    }
    N.set(b, C), d.get(m.a).add(m.b), d.get(m.b).add(m.a);
  }
  if (x.length > 1 && x.some((m) => p(m) !== p(x[0]))) throw Error("Geometric net cleanup found disconnected terminals.");
  const S = /* @__PURE__ */ new Set([...x, ...f]), B = [...d].filter(([m, b]) => b.size === 1 && !S.has(m)).map(([m]) => m);
  let P = 0;
  for (; B.length; ) {
    const m = B.pop();
    if (S.has(m) || d.get(m).size !== 1) continue;
    const b = [...d.get(m)][0];
    d.get(m).clear(), d.get(b).delete(m), P++, d.get(b).size === 1 && !S.has(b) && B.push(b);
  }
  for (const [m, b] of d) if (b.size === 2 && !S.has(m)) {
    const [C, A] = [...b], O = c.get(C), r = c.get(m), z = c.get(A);
    (ce(O.x, r.x) && ce(r.x, z.x) || ce(O.y, r.y) && ce(r.y, z.y)) && (d.get(C).delete(m), d.get(A).delete(m), d.get(C).add(A), d.get(A).add(C), b.clear());
  }
  const F = [], j = /* @__PURE__ */ new Set();
  for (const [m, b] of d) for (const C of b) {
    const A = [m, C].sort().join("|");
    j.has(A) || (j.add(A), F.push({ a: c.get(m), b: c.get(C) }));
  }
  const _ = new Set(x);
  return { segments: F, junctions: [...d].filter(([m, b]) => b.size >= 3 || b.size >= 2 && _.has(m)).map(([m]) => c.get(m)), cyclesRemoved: v, leavesRemoved: P, wireLength: F.reduce((m, b) => m + nt(b.a, b.b), 0) };
}
const ht = (o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), be = (o, n, s) => o.replace(new RegExp("(?<![\\w./%:$])" + ht(n) + "(?![\\w./%:$])", "gi"), () => s);
function qt(o, n) {
  n.localScope && (o = Tt(o.ir, { isolate: n.focus }));
  const s = n.components.filter((i) => !i.synthetic), c = ge(o.root), f = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), h = s.filter((i) => i.kind === "X"), x = /* @__PURE__ */ new Set(), T = (i, g) => {
    let w = g.includes("/") ? i + "_" + g.replaceAll("/", "_") : g;
    w = w.replace(/[^a-z0-9_.$@&Ö]/gi, "_"), w.toUpperCase().startsWith(i) || (w = i + "_" + w);
    const U = w;
    let L = 1;
    for (; x.has(w.toLowerCase()); ) w = U + "_" + L++;
    return x.add(w.toLowerCase()), w;
  };
  c.forEach((i) => f.set(i.name, T(i.kind, i.name)));
  const N = new Map(h.map((i) => [i.name, T("X", i.name)])), p = new Map(h.map((i, g) => [i.name, "CV_BLOCK_" + g]));
  c.forEach((i) => l.set(i.name, ""));
  for (const i of h) for (const g of ge(o.contexts[i.instanceId])) l.set(g.name, i.name);
  const E = (i) => /^(?:[a-z_][\w.$-]*|\d+)$/i.test(i), R = new Set([...c.flatMap((i) => Object.values(i.terminals)), ...Object.keys(n.nodes)].filter(E).map((i) => i.toLowerCase())), d = /* @__PURE__ */ new Map([["0", "0"]]), v = /* @__PURE__ */ new Set(["0"]);
  let S = 1;
  const B = (i) => {
    if (!d.has(i)) {
      let g = i;
      if (!E(i) || v.has(i.toLowerCase()))
        do
          g = "N_cv" + S++;
        while (R.has(g.toLowerCase()) || v.has(g.toLowerCase()));
      d.set(i, g), v.add(g.toLowerCase());
    }
    return d.get(i);
  };
  for (const i of c) Object.values(i.terminals).forEach(B);
  Object.keys(n.nodes).forEach(B);
  const P = /* @__PURE__ */ new Map();
  for (const i of h) {
    const g = new Set(i.block.ports.map((w) => w.node));
    for (const w of ge(o.contexts[i.instanceId])) for (const U of Object.values(w.terminals)) !g.has(U) && U !== "0" && !o.ir.globals.some((L) => Se([], L) === U) && P.set(U, i.name);
  }
  const F = new Map(h.map((i) => [i.name, new Map(i.block.ports.map((g, w) => [g.node, "p" + w]).reverse())])), j = (i, g = "") => {
    if (i === "0") return "0";
    if (F.get(g)?.has(i)) return F.get(g).get(i);
    const w = P.get(i);
    if (g && w && w !== g) throw Error("ASC export: cross-block internal node probe requires expanding both instances: " + i);
    return w && w !== g ? N.get(w) + ":" + B(i) : B(i);
  }, _ = (i, g = "") => {
    if (!f.has(i)) throw Error("ASC: unresolved device reference " + i);
    const w = l.get(i);
    if (g && w !== g) throw Error("ASC export: cross-block current probe requires expanding both instances: " + i);
    return w && w !== g ? N.get(w) + ":" + f.get(i) : f.get(i);
  }, m = /* @__PURE__ */ new Map();
  function b(i, g = {}) {
    const w = o.ir.scopes[i.scopeId];
    let U;
    if (!i.id) U = Object.fromEntries(Object.keys(i.params).map((L) => [L, L]));
    else {
      const L = o.contexts[i.path.slice(0, -1).map(encodeURIComponent).join("/")], I = o.ir.scopes[L.scopeId].instances.find((V) => V.name === i.path.at(-1));
      U = Et(g, w.defaults, w.parameters, I.parameters);
    }
    m.set(i.id, U), i.children.forEach((L) => b(L, U));
  }
  b(o.root);
  const C = (i, g) => {
    const w = i.ports.find((I) => I.name.toLowerCase() === g.toLowerCase());
    if (w) return w.node;
    const U = i.nodes[g.toLowerCase()];
    if (U) return U;
    if (o.ir.globals.includes(g.toLowerCase())) return Se([], g);
    const L = g.split(":");
    if (L.length > 1) {
      const I = L.pop(), V = [...i.path, ...L].map(encodeURIComponent).join("/"), D = o.contexts[V] || o.contexts[L.map(encodeURIComponent).join("/")];
      if (D) return C(D, I);
    }
    return Se(i.path, g);
  }, A = (i, g) => {
    const w = i.devices.find((L) => L.localName.toLowerCase() === g.toLowerCase());
    if (w) return w.name;
    const U = g.split(":");
    if (U.length > 1) {
      const L = U.pop(), I = [...i.path, ...U].map(encodeURIComponent).join("/"), D = (o.contexts[I] || o.contexts[U.map(encodeURIComponent).join("/")])?.devices.find((k) => k.localName.toLowerCase() === L.toLowerCase());
      if (D) return D.name;
    }
    throw Error("ASC: unsupported device reference " + g);
  }, O = new Map(Object.keys(n.models).map((i, g) => [i, "CV_MODEL_" + g]));
  function r(i, g) {
    const w = o.contexts[i.instanceId], U = o.ir.scopes[w.scopeId].devices.find((D) => D.name === i.localName), L = [], I = (D) => "__CV_PROBE_" + (L.push(D) - 1) + "__";
    let V = De(U.value, m.get(w.id), (D) => I(j(C(w, D), g)), (D) => I(_(A(w, D), g)));
    if (U.model && (V = be(V, U.model, O.get(i.model) || i.model)), V = V.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (D, k, Y) => k + "(" + Y.split(",").map((oe) => {
      const ie = oe.trim(), ue = /^__CV_PROBE_(\d+)__$/.exec(ie);
      return ue ? L[+ue[1]] : k.toLowerCase() === "v" ? j(C(w, ie), g) : _(A(w, ie), g);
    }).join(",") + ")"), (U.controlSources || []).forEach((D, k) => {
      V = be(V, D, _(i.controlSources[k], g));
    }), i.kind === "@") for (const [D, k] of Object.entries(i.terminals)) ["REFNODE", "INTNODE"].includes(D) && (V = V.replace(new RegExp("\\b" + D + "\\s*=\\s*[^\\s]+", "i"), D.toLowerCase() + "=" + j(k, g)));
    return V;
  }
  const z = /* @__PURE__ */ new Map(), X = o.ir.diagnostics.filter((i) => i.severity === "warning").map((i) => i.message);
  function y(i, g = "") {
    if (i.kind === "X") {
      const D = i.block.ports.map((k) => j(k.node, g));
      return { ref: N.get(i.name), kind: "X", pins: i.block.ports.map((k) => k.pin), nodes: D, value: p.get(i.name), line: [N.get(i.name), ...D, p.get(i.name)].join(" ") };
    }
    const w = f.get(i.name), U = Object.entries(i.terminals);
    if (i.kind === "K") {
      const D = r(i, g).split(" · k=").at(-1), k = [w, ...i.coupledInductors.map((Y) => _(Y, g)), D].join(" ");
      return { ref: w, kind: "K", pins: [], nodes: [], value: D, line: k, directive: !0 };
    }
    let L = r(i, g), I = U.map(([D]) => D), V = U.map(([, D]) => j(D, g));
    if (["E", "G"].includes(i.kind) && i.sourceMode === "POLY") {
      const D = /^POLY\(\d+\)\s*/i.exec(L);
      if (!D) throw Error("ASC: invalid POLY source " + i.name);
      L = D[0] + V.slice(2).join(" ") + " " + L.slice(D[0].length), I = I.slice(0, 2), V = V.slice(0, 2), X.push(i.name + ": POLY control nodes remain explicit in the editable Value expression.");
    }
    return i.kind === "@" && (I = I.slice(0, 2), V = V.slice(0, 2)), { ref: w, kind: i.kind, prefix: i.kind === "M" ? i.type.includes("pmos") ? "MP" : "MN" : i.kind, pins: I, nodes: V, electricalNodes: U.map(([, D]) => j(D, g)), value: L, line: [w, ...V, L].filter(Boolean).join(" ") };
  }
  s.forEach((i) => z.set(i.name, y(i)));
  const M = [], G = [];
  for (const i of h) {
    M.push(".subckt " + p.get(i.name) + " " + i.block.ports.map((g, w) => "p" + w).join(" "));
    for (const g of ge(o.contexts[i.instanceId])) {
      const w = y(g, i.name);
      M.push(w.line), G.push({ original: g.name, scope: i.name, ...w });
    }
    M.push(".ends " + p.get(i.name));
  }
  for (const [i, g] of Object.entries(n.models)) {
    const w = o.contexts[g.instanceId], U = o.ir.scopes[w.scopeId], L = decodeURIComponent(i.split("/").at(-1)), I = U.models[L];
    let V = I ? De(I.raw, m.get(w.id), (D) => j(C(w, D)), (D) => _(A(w, D))) : g.raw;
    V = V.replace(/^(\.model\s+)\S+/i, (D, k) => k + O.get(i));
    for (const [D, k] of O) V = be(V, D, k);
    if (g.baseModel) {
      const D = w.path.length ? w.path.map(encodeURIComponent).join("/") + "/" : "";
      V = V.replace(new RegExp("(AKO:)" + ht(g.baseModel), "i"), (k, Y) => Y + (O.get(D + g.baseModel.toLowerCase()) || O.get(g.baseModel.toLowerCase()) || g.baseModel));
    }
    M.push(V);
  }
  const $ = [];
  for (const i of Object.values(o.contexts))
    if (!(i.id && !ge(i).some((g) => l.has(g.name) && (s.some((w) => w.name === g.name) || h.some((w) => w.name === l.get(g.name))))))
      for (const g of o.ir.scopes[i.scopeId].directives) {
        if (n.localScope && !i.id && !/^\.(?:model|title|param|func|global|options?|tran|ac|op|step|temp)\b/i.test(g.text) || /^\.(?:model|param|global|title)\b/i.test(g.text) && i.id || /^\.(?:model|title)\b/i.test(g.text)) continue;
        if (i.id && !/^\.(?:func|ic|nodeset)\b/i.test(g.text)) throw Error("ASC export: local directive requires scope-preserving export (" + i.id + "): " + g.text);
        if (i.id && /^\.func\b/i.test(g.text)) throw Error("ASC export: local .func requires scope-preserving export (" + i.id + ").");
        const w = [], U = (I) => "__CV_PROBE_" + (w.push(I) - 1) + "__";
        let L = i.id ? De(g.text, m.get(i.id), (I) => U(j(C(i, I))), (I) => U(_(A(i, I)))) : g.text;
        if (L = L.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (I, V, D) => V + "(" + D.split(",").map((k) => {
          const Y = k.trim(), oe = /^__CV_PROBE_(\d+)__$/.exec(Y);
          if (oe) return w[+oe[1]];
          if (Y === "*") return Y;
          if (/[*?]/.test(Y)) throw Error("ASC export: wildcard probe cannot be renamed reliably: " + Y);
          return V.toLowerCase() === "v" ? j(C(i, Y)) : _(A(i, Y));
        }).join(",") + ")"), /^\.global\b/i.test(L) && (L = ".global " + L.split(/\s+/).slice(1).map((I) => j(C(i, I))).join(" ")), /^\.(?:dc|tf|noise|sens)\b/i.test(L)) for (const I of i.devices) L = be(L, I.localName, _(I.name));
        $.push(L);
      }
  return { cards: z, library: M, directives: $, nodeNames: d, refs: f, expected: G, warnings: [...new Set(X)], node: j, blockRefs: N, definitions: p };
}
const xe = (o) => o.x + "," + o.y, Yt = (o, n) => n.a.x === n.b.x ? o.x === n.a.x && o.y >= Math.min(n.a.y, n.b.y) && o.y <= Math.max(n.a.y, n.b.y) : o.y === n.a.y && o.x >= Math.min(n.a.x, n.b.x) && o.x <= Math.max(n.a.x, n.b.x);
function Xt(o) {
  return new TextDecoder(o[0] === 255 && o[1] === 254 ? "utf-16le" : "windows-1252").decode(o);
}
function Wt(o, n) {
  const s = [], c = [], f = [], l = [];
  let h;
  for (const d of o.split(/\r?\n/)) {
    let v;
    if (v = /^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(d)) s.push({ a: { x: +v[1], y: +v[2] }, b: { x: +v[3], y: +v[4] } });
    else if (v = /^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(d)) c.push({ x: +v[1], y: +v[2], name: v[3] });
    else if (v = /^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(d))
      h = { symbol: v[1], x: +v[2], y: +v[3], pins: [], value: "", ref: "" }, f.push(h);
    else if (v = /^SYMATTR (InstName|Value) (.*)$/.exec(d)) {
      if (!h) throw Error("ASC attribute without symbol.");
      h[v[1] === "InstName" ? "ref" : "value"] = v[2];
    } else (v = /^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(d)) && l.push(...v[1].split("\\n"));
  }
  for (const d of f) {
    const v = n[d.symbol + ".asy"];
    if (!v) throw Error("Missing ASC companion " + d.symbol + ".asy");
    let S;
    for (const B of Xt(v).split(/\r?\n/)) {
      let P;
      (P = /^PIN (-?\d+) (-?\d+) /.exec(B)) ? (S = { x: d.x + +P[1], y: d.y + +P[2] }, d.pins.push(S)) : (P = /^PINATTR SpiceOrder (\d+)$/.exec(B)) ? S.order = +P[1] : (P = /^SYMATTR Prefix (\S+)$/.exec(B)) && (d.prefix = P[1]);
    }
    d.pins.sort((B, P) => B.order - P.order);
  }
  const x = /* @__PURE__ */ new Map();
  for (const d of [...s.flatMap((v) => [v.a, v.b]), ...c, ...f.flatMap((v) => v.pins)]) x.set(xe(d), d);
  const T = new Map([...x.keys()].map((d) => [d, d])), N = (d) => (T.get(d) !== d && T.set(d, N(T.get(d))), T.get(d)), p = (d, v) => {
    T.set(N(d), N(v));
  };
  for (const d of s) {
    if (d.a.x !== d.b.x && d.a.y !== d.b.y) throw Error("ASC contains a diagonal wire.");
    for (const [v, S] of x) Yt(S, d) && p(xe(d.a), v);
  }
  const E = /* @__PURE__ */ new Map();
  for (const d of c) {
    const v = N(xe(d));
    if (E.has(v) && E.get(v).toLowerCase() !== d.name.toLowerCase()) throw Error("ASC has a short between " + E.get(v) + " and " + d.name);
    E.set(v, d.name);
  }
  for (const d of f) for (const v of d.pins)
    if (v.node = E.get(N(xe(v))), !v.node) throw Error("ASC has an unnamed/disconnected pin on " + d.ref);
  const R = f.map((d) => [d.ref, ...d.pins.map((v) => v.node), d.value].join(" "));
  return { symbols: f, wires: s, flags: c, directives: l, netlist: ["* Viewer ASC round trip", ...R, ...l, ".end"].join(`
`) };
}
function zt(o, n, s) {
  const c = Wt(o, n), f = s.components.filter((h) => !h.directive);
  if (c.symbols.length !== f.length) throw Error("ASC lost or duplicated symbols.");
  let l = 0;
  for (const h of f) {
    const x = c.symbols.find((T) => T.ref === h.ref);
    if (!x || x.value !== h.value || x.prefix !== (h.prefix || h.kind) || JSON.stringify(x.pins.map((T) => T.node)) !== JSON.stringify(h.nodes)) throw Error("ASC component/pin round-trip mismatch: " + h.id);
    l += x.pins.length;
  }
  for (const h of s.components.filter((x) => x.directive)) if (!c.directives.includes(h.line)) throw Error("ASC lost directive device " + h.id);
  return { verified: !0, symbols: f.length, directiveDevices: s.components.length - f.length, pins: l, wires: c.wires.length, namedNets: new Set(c.flags.map((h) => h.name)).size };
}
const Ht = (o) => o.x + "," + o.y, ot = (o) => Math.round(o * 1e3) / 1e3, pt = new Map(Array.from({ length: 256 }, (o, n) => [new TextDecoder("windows-1252").decode(new Uint8Array([n])), n]));
function it(o) {
  const n = [];
  for (const s of o) {
    const c = pt.get(s);
    if (c === void 0) throw Error("LTspice export cannot encode " + s + " (U+" + s.codePointAt(0).toString(16) + ") in Windows-1252.");
    n.push(c);
  }
  return new Uint8Array(n);
}
const gt = (o) => [...String(o)].map((n) => pt.has(n) ? n : n === "⏚" ? "GND" : "[U+" + n.codePointAt(0).toString(16) + "]").join(""), Ne = (o) => String(o).replace(/[\r\n]/g, " ");
function rt(o) {
  const n = [...new Set(o.map(ot))].sort((f, l) => f - l), s = /* @__PURE__ */ new Map();
  let c = -1 / 0;
  for (const f of n) {
    const l = Math.max(c + 16, Math.round(f * 2 / 16) * 16 + 64);
    s.set(f, l), c = l;
  }
  return (f) => {
    const l = s.get(ot(f));
    if (l === void 0) throw Error("Missing layout coordinate.");
    return l;
  };
}
function Qt(o, n, s, c) {
  const f = c.x(o.x), l = c.y(o.y), h = c.x(o.x + o.width) - f, x = c.y(o.y + o.height) - l, T = o.ports.map((R) => ({ ...R, x: c.x(R.x) - f, y: c.y(R.y) - l })), N = ["Version 4", "SymbolType CELL"], p = (R, d) => N.push(`LINE Normal ${Math.round(R.x)} ${Math.round(R.y)} ${Math.round(d.x)} ${Math.round(d.y)}`), E = T.length === 2 && ["R", "C", "L", "D", "V", "I", "B"].includes(n.kind);
  if (E) {
    const R = ["D", "V", "I", "B"].includes(n.kind) ? [T.find((m) => m.pin === "+") || T[0], T.find((m) => m.pin === "-") || T[1]] : T, [d, v] = R, S = Math.abs(d.x - v.x) < 0.1, B = { x: (d.x + v.x) / 2, y: (d.y + v.y) / 2 }, P = Math.abs(S ? v.y - d.y : v.x - d.x), F = Math.min(32, P / 4), j = Math.sign(S ? v.y - d.y : v.x - d.x), _ = (m, b) => S ? { x: B.x + b, y: B.y + m * j } : { x: B.x + m * j, y: B.y + b };
    if (p(d, _(-F, 0)), p(_(F, 0), v), n.kind === "C")
      p(_(-6, -20), _(-6, 20)), p(_(6, -20), _(6, 20)), p(_(-F, 0), _(-6, 0)), p(_(6, 0), _(F, 0));
    else if (n.kind === "R" || n.kind === "B" && /^\s*R\s*=/i.test(n.value)) {
      const m = [[-F, 0], [-F + 6, 0], [-F + 12, -12], [-F + 22, 12], [-F + 32, -12], [F - 6, 0], [F, 0]];
      for (let b = 1; b < m.length; b++) p(_(...m[b - 1]), _(...m[b]));
    } else if (n.kind === "L") {
      let m = _(-F, 0);
      for (let b = 0; b < 4; b++) for (let C = 1; C <= 8; C++) {
        const A = _(-F + (b + C / 8) * F / 2, 16 * Math.sin(C * Math.PI / 8));
        p(m, A), m = A;
      }
    } else n.kind === "D" ? (p(_(-F, 0), _(-12, 0)), p(_(12, 0), _(F, 0)), p(_(-12, -18), _(-12, 18)), p(_(-12, 18), _(12, 0)), p(_(12, 0), _(-12, -18)), p(_(12, -18), _(12, 18))) : (N.push(`CIRCLE Normal ${Math.round(B.x - 24)} ${Math.round(B.y - 24)} ${Math.round(B.x + 24)} ${Math.round(B.y + 24)}`), p(_(-F, 0), _(-24, 0)), p(_(24, 0), _(F, 0)), n.kind === "I" || n.kind === "B" && /^\s*(?:I|P)\s*=/i.test(n.value) ? (p(_(-12, 0), _(12, 0)), p(_(12, 0), _(4, -7)), p(_(12, 0), _(4, 7))) : (p(_(-12, -6), _(-12, 6)), p(_(-18, 0), _(-6, 0)), p(_(12, -6), _(12, 6))));
  } else {
    N.push(`RECTANGLE Normal 16 16 ${Math.max(32, h - 16)} ${Math.max(32, x - 16)}`);
    for (const d of T) {
      const v = { x: Math.max(16, Math.min(h - 16, d.x)), y: Math.max(16, Math.min(x - 16, d.y)) };
      p(d, v), N.push(`TEXT ${Math.round(v.x + 4)} ${Math.round(v.y + 4)} Left 1 ${Ne(gt(n.block?.ports.find((S) => S.pin === d.pin)?.label || n.pinLabels?.[Object.keys(n.terminals).indexOf(d.pin)] || d.pin))}`);
    }
  }
  E && Math.abs(T[0].x - T[1].x) < 0.1 ? N.push(`WINDOW 0 ${Math.round(T[0].x + 40)} 24 Left 2`, `WINDOW 3 ${Math.round(T[0].x + 40)} 56 Left 2`) : E ? N.push(`WINDOW 0 ${Math.round(h / 2)} 16 Center 2`, `WINDOW 3 ${Math.round(h / 2)} 40 Center 2`) : N.push("WINDOW 0 24 32 Left 2", "WINDOW 3 24 64 Left 2"), N.push("SYMATTR Prefix " + (s.prefix || s.kind));
  for (const [R, d] of s.pins.entries()) {
    const v = T.find((S) => S.pin === d);
    if (!v) throw Error("ASC symbol missing pin " + n.name + "." + d);
    N.push(`PIN ${v.x} ${v.y} NONE 0`, "PINATTR PinName " + Ne(d), "PINATTR SpiceOrder " + (R + 1));
  }
  return N.join(`\r
`) + `\r
`;
}
function Zt({ tree: o, circuit: n, drawing: s, source: c = "", libraries: f = {} }) {
  if (!s) throw Error("ASC export requires a conventional layout. Enable Circuit layout rules and generate again.");
  const l = qt(o, n), h = new Map(n.components.map((y) => [y.name, y]));
  if (s.components.length !== h.size || s.components.some((y) => !h.has(y.id) || y.ports.some((M) => n.nodes[h.get(y.id).terminals[M.pin]]?.bit !== M.bit))) throw Error("ASC: stale layout or mismatched pin/net mapping. Generate again.");
  const x = [], T = [], N = (y) => {
    x.push(y.x), T.push(y.y);
  };
  for (const y of s.components)
    N(y), N({ x: y.x + y.width, y: y.y + y.height }), y.ports.forEach(N);
  s.segments.forEach((y) => {
    N(y.a), N(y.b);
  });
  const p = { x: rt(x), y: rt(T) }, E = (y) => ({ x: p.x(y.x), y: p.y(y.y) }), R = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
  for (const y of s.components) for (const M of y.ports)
    d.has(M.bit) || d.set(M.bit, []), d.get(M.bit).push(M);
  for (const y of s.segments)
    R.has(y.bit) || R.set(y.bit, []), R.get(y.bit).push(y);
  const v = [];
  for (const [y, M] of d) {
    const G = $t(R.get(y) || [], M);
    for (const $ of G.segments) v.push({ bit: y, a: E($.a), b: E($.b) });
  }
  const S = Math.max(...x.map(p.x)), B = Math.max(...T.map(p.y)), P = ["Version 4", `SHEET 1 ${S + 256} ${B + 512}`], F = /* @__PURE__ */ new Map(), j = {}, _ = { version: 1, focus: n.focus, viewScope: n.localScope ? "subcircuit-local" : "top-level", interfaceBindings: n.interfaceBindings || [], interfaceAliases: n.interfaceAliases || [], topology: n.topology.signature, components: [], nodes: [], warnings: l.warnings }, m = (y, M) => {
    const G = Ht(y);
    if (F.has(G) && F.get(G) !== M) throw Error("ASC grid would short two nets at " + G);
    F.set(G, M);
  }, b = /* @__PURE__ */ new Set();
  for (const y of s.components) {
    const M = h.get(y.id);
    if (!M) throw Error("Layout snapshot no longer matches circuit.");
    for (const G of y.ports) {
      const $ = l.node(M.terminals[G.pin]);
      b.has($) || (m(E(G), $), b.add($));
    }
  }
  for (const y of v) P.push(`WIRE ${y.a.x} ${y.a.y} ${y.b.x} ${y.b.y}`);
  for (const [y, M] of F) P.push("FLAG " + y.replace(",", " ") + " " + M);
  let C = 0;
  const A = /* @__PURE__ */ new Map();
  for (const y of s.components) {
    const M = h.get(y.id);
    if (M.synthetic) continue;
    const G = l.cards.get(M.name);
    if (G.directive) {
      P.push(`TEXT ${p.x(y.x)} ${p.y(y.y)} Left 2 !${Ne(G.line)}`), _.components.push({ id: M.name, ...G, directive: !0 });
      continue;
    }
    const $ = Qt(y, M, G, p);
    let i = A.get($);
    i || (i = "cv_symbol_" + C++, A.set($, i), j[i + ".asy"] = it($)), P.push(`SYMBOL ${i} ${p.x(y.x)} ${p.y(y.y)} R0`, "SYMATTR InstName " + G.ref, "SYMATTR Value " + Ne(G.value)), _.components.push({ id: M.name, ...G, symbol: i, ports: y.ports.map((g) => ({ pin: g.pin, ...E(g), node: l.node(M.terminals[g.pin]) })) });
  }
  const O = [...l.directives, ...l.library];
  if (O.some((y) => y.includes("\\n"))) throw Error("ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.");
  const r = [c, ...Object.values(f)].flatMap((y) => y.split(/\r?\n/).filter((M) => /^\s*\*/.test(M))).map((y) => gt(y).replaceAll("\\", "/").replace(/^(\s*\*\s*)@layout\b/i, "$1source @layout"));
  (O.length || r.length) && P.push(`TEXT 64 ${B + 160} Left 2 !` + [...O, ...r].map((y) => y.replace(/\r?\n/g, "\\n")).join("\\n"));
  const z = P.join(`\r
`) + `\r
`;
  _.nodes = [...l.nodeNames].map(([y, M]) => ({ original: y, exported: M })), _.leaves = [...l.expected, ...n.components.filter((y) => !y.synthetic && y.kind !== "X").map((y) => ({ original: y.name, scope: "", ...l.cards.get(y.name) }))], _.blocks = [...l.blockRefs].map(([y, M]) => ({ original: y, ref: M, ltspiceRef: "X§" + M }));
  const X = zt(z, j, _);
  _.audit = X, j["spice-schematic.asc"] = it(z), j["manifest.json"] = he(JSON.stringify(_, null, 2)), j["source.cir"] = he(c);
  for (const [y, M] of Object.entries(f)) {
    const G = y.replaceAll("\\", "/").split("/").filter(($) => $ && $ !== "." && $ !== "..").join("/");
    G && (j["source-libraries/" + G] = he(M));
  }
  return j["README.txt"] = he(`Extract ALL files into one folder, then open spice-schematic.asc in LTspice.
The .asy files are locally generated symbols and are required by the ASC.
Positions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.
manifest.json contains original/exported names, values, ports and the connectivity audit.
Collapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.
source.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.
Simulation behavior depends on LTspice model support; connectivity validation is not a simulation result.
` + l.warnings.join(`
`)), { asc: z, ascBytes: j["spice-schematic.asc"], zip: Rt(j, { level: 6 }), files: j, manifest: _ };
}
export {
  Zt as exportAsc,
  it as ltspiceBytes
};
