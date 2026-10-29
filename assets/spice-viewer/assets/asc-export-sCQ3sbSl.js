import { l as ge, n as Se, b as De, p as Tt } from "./ui-ClYKRM0x.js";
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
  for (var u = new Ve(s[30]), c = 1; c < 30; ++c)
    for (var f = s[c]; f < s[c + 1]; ++f)
      u[f] = f - s[c] << 5 | c;
  return { b: s, r: u };
}, st = at(ke, 2), Et = st.b, Pe = st.r;
Et[28] = 258, Pe[258] = 28;
var yt = at(Ge, 0), Xe = yt.r, Be = new ne(32768);
for (var W = 0; W < 32768; ++W) {
  var le = (W & 43690) >> 1 | (W & 21845) << 1;
  le = (le & 52428) >> 2 | (le & 13107) << 2, le = (le & 61680) >> 4 | (le & 3855) << 4, Be[W] = ((le & 65280) >> 8 | (le & 255) << 8) >> 1;
}
var ye = (function(o, n, s) {
  for (var c = o.length, u = 0, f = new ne(n); u < c; ++u)
    o[u] && ++f[o[u] - 1];
  var h = new ne(n);
  for (u = 1; u < n; ++u)
    h[u] = h[u - 1] + f[u - 1] << 1;
  var b;
  if (s) {
    b = new ne(1 << n);
    var E = 15 - n;
    for (u = 0; u < c; ++u)
      if (o[u])
        for (var w = u << 4 | o[u], p = n - o[u], y = h[o[u] - 1]++ << p, R = y | (1 << p) - 1; y <= R; ++y)
          b[Be[y] >> E] = w;
  } else
    for (b = new ne(c), u = 0; u < c; ++u)
      o[u] && (b[u] = Be[h[o[u] - 1]++] >> 15 - o[u]);
  return b;
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
var _t = /* @__PURE__ */ ye(fe, 9, 0), bt = /* @__PURE__ */ ye(we, 5, 0), ct = function(o) {
  return (o + 7) / 8 | 0;
}, lt = function(o, n, s) {
  return (s == null || s > o.length) && (s = o.length), new J(o.subarray(n, s));
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
], Ce = function(o, n, s) {
  var c = new Error(n || xt[o]);
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
  var u = s.length, f = s.slice();
  if (!u)
    return { t: ut, l: 0 };
  if (u == 1) {
    var h = new J(s[0].s + 1);
    return h[s[0].s] = 1, { t: h, l: 1 };
  }
  s.sort(function(v, N) {
    return v.f - N.f;
  }), s.push({ s: -1, f: 25001 });
  var b = s[0], E = s[1], w = 0, p = 1, y = 2;
  for (s[0] = { s: -1, f: b.f + E.f, l: b, r: E }; p != u - 1; )
    b = s[s[w].f < s[y].f ? w++ : y++], E = s[w != p && s[w].f < s[y].f ? w++ : y++], s[p++] = { s: -1, f: b.f + E.f, l: b, r: E };
  for (var R = f[0].s, c = 1; c < u; ++c)
    f[c].s > R && (R = f[c].s);
  var m = new ne(R + 1), T = je(s[p - 1], m, 0);
  if (T > n) {
    var c = 0, C = 0, B = T - n, P = 1 << B;
    for (f.sort(function(N, D) {
      return m[D.s] - m[N.s] || N.f - D.f;
    }); c < u; ++c) {
      var F = f[c].s;
      if (m[F] > n)
        C += P - (1 << T - m[F]), m[F] = n;
      else
        break;
    }
    for (C >>= B; C > 0; ) {
      var j = f[c].s;
      m[j] < n ? C -= 1 << n - m[j]++ - 1 : ++c;
    }
    for (; c >= 0 && C; --c) {
      var l = f[c].s;
      m[l] == n && (--m[l], ++C);
    }
    T = n;
  }
  return { t: new J(m), l: T };
}, je = function(o, n, s) {
  return o.s == -1 ? Math.max(je(o.l, n, s + 1), je(o.r, n, s + 1)) : n[o.s] = s;
}, We = function(o) {
  for (var n = o.length; n && !o[--n]; )
    ;
  for (var s = new ne(++n), c = 0, u = o[0], f = 1, h = function(E) {
    s[c++] = E;
  }, b = 1; b <= n; ++b)
    if (o[b] == u && b != n)
      ++f;
    else {
      if (!u && f > 2) {
        for (; f > 138; f -= 138)
          h(32754);
        f > 2 && (h(f > 10 ? f - 11 << 5 | 28690 : f - 3 << 5 | 12305), f = 0);
      } else if (f > 3) {
        for (h(u), --f; f > 6; f -= 6)
          h(8304);
        f > 2 && (h(f - 3 << 5 | 8208), f = 0);
      }
      for (; f--; )
        h(u);
      f = 1, u = o[b];
    }
  return { c: s.subarray(0, c), n };
}, Te = function(o, n) {
  for (var s = 0, c = 0; c < n.length; ++c)
    s += o[c] * n[c];
  return s;
}, ft = function(o, n, s) {
  var c = s.length, u = ct(n + 2);
  o[u] = c & 255, o[u + 1] = c >> 8, o[u + 2] = o[u] ^ 255, o[u + 3] = o[u + 1] ^ 255;
  for (var f = 0; f < c; ++f)
    o[u + f + 4] = s[f];
  return (u + 4 + c) * 8;
}, ze = function(o, n, s, c, u, f, h, b, E, w, p) {
  se(n, p++, s), ++u[256];
  for (var y = Oe(u, 15), R = y.t, m = y.l, T = Oe(f, 15), C = T.t, B = T.l, P = We(R), F = P.c, j = P.n, l = We(C), v = l.c, N = l.n, D = new ne(19), I = 0; I < F.length; ++I)
    ++D[F[I] & 31];
  for (var I = 0; I < v.length; ++I)
    ++D[v[I] & 31];
  for (var L = Oe(D, 7), i = L.t, H = L.l, Y = 19; Y > 4 && !i[Ye[Y - 1]]; --Y)
    ;
  var _ = w + 5 << 3, O = Te(u, fe) + Te(f, we) + h, G = Te(u, R) + Te(f, C) + h + 14 + 3 * Y + Te(D, i) + 2 * D[16] + 3 * D[17] + 7 * D[18];
  if (E >= 0 && _ <= O && _ <= G)
    return ft(n, p, o.subarray(E, E + w));
  var $, r, g, x;
  if (se(n, p, 1 + (G < O)), p += 2, G < O) {
    $ = ye(R, m, 0), r = R, g = ye(C, B, 0), x = C;
    var U = ye(i, H, 0);
    se(n, p, j - 257), se(n, p + 5, N - 1), se(n, p + 10, Y - 4), p += 14;
    for (var I = 0; I < Y; ++I)
      se(n, p + 3 * I, i[Ye[I]]);
    p += 3 * Y;
    for (var M = [F, v], A = 0; A < 2; ++A)
      for (var V = M[A], I = 0; I < V.length; ++I) {
        var S = V[I] & 31;
        se(n, p, U[S]), p += i[S], S > 15 && (se(n, p, V[I] >> 5 & 127), p += V[I] >> 12);
      }
  } else
    $ = _t, r = fe, g = bt, x = we;
  for (var I = 0; I < b; ++I) {
    var k = c[I];
    if (k > 255) {
      var S = k >> 18 & 31;
      ve(n, p, $[S + 257]), p += r[S + 257], S > 7 && (se(n, p, k >> 23 & 31), p += ke[S]);
      var X = k & 31;
      ve(n, p, g[X]), p += x[X], X > 3 && (ve(n, p, k >> 5 & 8191), p += Ge[X]);
    } else
      ve(n, p, $[k]), p += r[k];
  }
  return ve(n, p, $[256]), p + r[256];
}, wt = /* @__PURE__ */ new Ve([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), ut = /* @__PURE__ */ new J(0), Nt = function(o, n, s, c, u, f) {
  var h = f.z || o.length, b = new J(c + h + 5 * (1 + Math.ceil(h / 7e3)) + u), E = b.subarray(c, b.length - u), w = f.l, p = (f.r || 0) & 7;
  if (n) {
    p && (E[0] = f.r >> 3);
    for (var y = wt[n - 1], R = y >> 13, m = y & 8191, T = (1 << s) - 1, C = f.p || new ne(32768), B = f.h || new ne(T + 1), P = Math.ceil(s / 3), F = 2 * P, j = function(e) {
      return (o[e] ^ o[e + 1] << P ^ o[e + 2] << F) & T;
    }, l = new Ve(25e3), v = new ne(288), N = new ne(32), D = 0, I = 0, L = f.i || 0, i = 0, H = f.w || 0, Y = 0; L + 2 < h; ++L) {
      var _ = j(L), O = L & 32767, G = B[_];
      if (C[O] = G, B[_] = O, H <= L) {
        var $ = h - L;
        if ((D > 7e3 || i > 24576) && ($ > 423 || !w)) {
          p = ze(o, E, 0, l, v, N, I, i, Y, L - Y, p), i = D = I = 0, Y = L;
          for (var r = 0; r < 286; ++r)
            v[r] = 0;
          for (var r = 0; r < 30; ++r)
            N[r] = 0;
        }
        var g = 2, x = 0, U = m, M = O - G & 32767;
        if ($ > 2 && _ == j(L - M))
          for (var A = Math.min(R, $) - 1, V = Math.min(32767, L), S = Math.min(258, $); M <= V && --U && O != G; ) {
            if (o[L + g] == o[L + g - M]) {
              for (var k = 0; k < S && o[L + k] == o[L + k - M]; ++k)
                ;
              if (k > g) {
                if (g = k, x = M, k > A)
                  break;
                for (var X = Math.min(M, k - 2), oe = 0, r = 0; r < X; ++r) {
                  var re = L - M + r & 32767, ue = C[re], pe = re - ue & 32767;
                  pe > oe && (oe = pe, G = re);
                }
              }
            }
            O = G, G = C[O], M += O - G & 32767;
          }
        if (x) {
          l[i++] = 268435456 | Pe[g] << 18 | Xe[x];
          var de = Pe[g] & 31, _e = Xe[x] & 31;
          I += ke[de] + Ge[_e], ++v[257 + de], ++N[_e], H = L + g, ++D;
        } else
          l[i++] = o[L], ++v[o[L]];
      }
    }
    for (L = Math.max(L, H); L < h; ++L)
      l[i++] = o[L], ++v[o[L]];
    p = ze(o, E, w, l, v, N, I, i, Y, L - Y, p), w || (f.r = p & 7 | E[p / 8 | 0] << 3, p -= 7, f.h = B, f.p = C, f.i = L, f.w = H);
  } else {
    for (var L = f.w || 0; L < h + w; L += 65535) {
      var t = L + 65535;
      t >= h && (E[p / 8 | 0] = w, t = h), p = ft(E, p + 1, o.subarray(L, t));
    }
    f.i = h;
  }
  return lt(b, 0, c + ct(p) + u);
}, At = /* @__PURE__ */ (function() {
  for (var o = new Int32Array(256), n = 0; n < 256; ++n) {
    for (var s = n, c = 9; --c; )
      s = (s & 1 && -306674912) ^ s >>> 1;
    o[n] = s;
  }
  return o;
})(), Ct = function() {
  var o = -1;
  return {
    p: function(n) {
      for (var s = o, c = 0; c < n.length; ++c)
        s = At[s & 255 ^ n[c]] ^ s >>> 8;
      o = s;
    },
    d: function() {
      return ~o;
    }
  };
}, It = function(o, n, s, c, u) {
  if (!u && (u = { l: 1 }, n.dictionary)) {
    var f = n.dictionary.subarray(-32768), h = new J(f.length + o.length);
    h.set(f), h.set(o, f.length), o = h, u.w = f.length;
  }
  return Nt(o, n.level == null ? 6 : n.level, n.mem == null ? u.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(o.length))) * 1.5) : 20 : 12 + n.mem, s, c, u);
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
function St(o, n) {
  return It(o, n || {}, 0, 0);
}
var mt = function(o, n, s, c) {
  for (var u in o) {
    var f = o[u], h = n + u, b = c;
    Array.isArray(f) && (b = dt(c, f[1]), f = f[0]), f instanceof J ? s[h] = [f, b] : (s[h += "/"] = [new J(0), b], mt(f, h, s, c));
  }
}, He = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), Dt = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Ot = 0;
try {
  Dt.decode(ut, { stream: !0 }), Ot = 1;
} catch {
}
function he(o, n) {
  var s;
  if (He)
    return He.encode(o);
  for (var c = o.length, u = new J(o.length + (o.length >> 1)), f = 0, h = function(w) {
    u[f++] = w;
  }, s = 0; s < c; ++s) {
    if (f + 5 > u.length) {
      var b = new J(f + 8 + (c - s << 1));
      b.set(u), u = b;
    }
    var E = o.charCodeAt(s);
    E < 128 || n ? h(E) : E < 2048 ? (h(192 | E >> 6), h(128 | E & 63)) : E > 55295 && E < 57344 ? (E = 65536 + (E & 1047552) | o.charCodeAt(++s) & 1023, h(240 | E >> 18), h(128 | E >> 12 & 63), h(128 | E >> 6 & 63), h(128 | E & 63)) : (h(224 | E >> 12), h(128 | E >> 6 & 63), h(128 | E & 63));
  }
  return lt(u, 0, f);
}
var Ue = function(o) {
  var n = 0;
  if (o)
    for (var s in o) {
      var c = o[s].length;
      c > 65535 && Ce(9), n += c + 4;
    }
  return n;
}, Qe = function(o, n, s, c, u, f, h, b) {
  var E = c.length, w = s.extra, p = b && b.length, y = Ue(w);
  Z(o, n, h != null ? 33639248 : 67324752), n += 4, h != null && (o[n++] = 20, o[n++] = s.os), o[n] = 20, n += 2, o[n++] = s.flag << 1 | (f < 0 && 8), o[n++] = u && 8, o[n++] = s.compression & 255, o[n++] = s.compression >> 8;
  var R = new Date(s.mtime == null ? Date.now() : s.mtime), m = R.getFullYear() - 1980;
  if ((m < 0 || m > 119) && Ce(10), Z(o, n, m << 25 | R.getMonth() + 1 << 21 | R.getDate() << 16 | R.getHours() << 11 | R.getMinutes() << 5 | R.getSeconds() >> 1), n += 4, f != -1 && (Z(o, n, s.crc), Z(o, n + 4, f < 0 ? -f - 2 : f), Z(o, n + 8, s.size)), Z(o, n + 12, E), Z(o, n + 14, y), n += 16, h != null && (Z(o, n, p), Z(o, n + 6, s.attrs), Z(o, n + 10, h), n += 14), o.set(c, n), n += E, y)
    for (var T in w) {
      var C = w[T], B = C.length;
      Z(o, n, +T), Z(o, n + 2, B), o.set(C, n + 4), n += 4 + B;
    }
  return p && (o.set(b, n), n += p), n;
}, Mt = function(o, n, s, c, u) {
  Z(o, n, 101010256), Z(o, n + 8, s), Z(o, n + 10, s), Z(o, n + 12, c), Z(o, n + 16, u);
};
function Lt(o, n) {
  n || (n = {});
  var s = {}, c = [];
  mt(o, "", s, n);
  var u = 0, f = 0;
  for (var h in s) {
    var b = s[h], E = b[0], w = b[1], p = w.level == 0 ? 0 : 8, y = he(h), R = y.length, m = w.comment, T = m && he(m), C = T && T.length, B = Ue(w.extra);
    R > 65535 && Ce(11);
    var P = p ? St(E, w) : E, F = P.length, j = Ct();
    j.p(E), c.push(dt(w, {
      size: E.length,
      crc: j.d(),
      c: P,
      f: y,
      m: T,
      u: R != h.length || T && m.length != C,
      o: u,
      compression: p
    })), u += 30 + R + B + F, f += 76 + 2 * (R + B) + (C || 0) + F;
  }
  for (var l = new J(f + 22), v = u, N = f - u, D = 0; D < c.length; ++D) {
    var y = c[D];
    Qe(l, y.o, y, y.f, y.u, y.c.length);
    var I = 30 + y.f.length + Ue(y.extra);
    l.set(y.c, y.o + I), Qe(l, u, y, y.f, y.u, y.c.length, y.o, y.m), u += 16 + I + (y.m ? y.m.length : 0);
  }
  return Mt(l, u, c.length, N, v), l;
}
function Rt(o) {
  if (Object.prototype.hasOwnProperty.call(o, "__esModule")) return o;
  var n = o.default;
  if (typeof n == "function") {
    var s = function c() {
      var u = !1;
      try {
        u = this instanceof c;
      } catch {
      }
      return u ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    s.prototype = n.prototype;
  } else s = {};
  return Object.defineProperty(s, "__esModule", { value: !0 }), Object.keys(o).forEach(function(c) {
    var u = Object.getOwnPropertyDescriptor(o, c);
    Object.defineProperty(s, c, u.get ? u : {
      enumerable: !0,
      get: function() {
        return o[c];
      }
    });
  }), s;
}
var Me = {};
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
      }, n.SAXParser = c, n.SAXStream = y, n.createStream = w, n.MAX_BUFFER_LENGTH = 64 * 1024;
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
        var d = this;
        f(d), d.q = d.c = "", d.bufferCheckPosition = n.MAX_BUFFER_LENGTH, d.encoding = null, d.opt = e || {}, d.opt.lowercase = d.opt.lowercase || d.opt.lowercasetags, d.looseCase = d.opt.lowercase ? "toLowerCase" : "toUpperCase", d.opt.maxEntityCount = d.opt.maxEntityCount || 512, d.opt.maxEntityDepth = d.opt.maxEntityDepth || 4, d.entityCount = d.entityDepth = 0, d.tags = [], d.closed = d.closedRoot = d.sawRoot = !1, d.tag = d.error = null, d.strict = !!t, d.noscript = !!(t || d.opt.noscript), d.state = i.BEGIN, d.strictEntities = d.opt.strictEntities, d.ENTITIES = d.strictEntities ? Object.create(n.XML_ENTITIES) : Object.create(n.ENTITIES), d.attribList = [], d.opt.xmlns && (d.ns = Object.create(B)), d.opt.unquotedAttributeValues === void 0 && (d.opt.unquotedAttributeValues = !t), d.trackPosition = d.opt.position !== !1, d.trackPosition && (d.position = d.line = d.column = 0), Y(d, "onready");
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
        for (var e = Math.max(n.MAX_BUFFER_LENGTH, 10), d = 0, a = 0, q = s.length; a < q; a++) {
          var z = t[s[a]].length;
          if (z > e)
            switch (s[a]) {
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
                U(t, "Max buffer length exceeded: " + s[a]);
            }
          d = Math.max(d, z);
        }
        var Q = n.MAX_BUFFER_LENGTH - d;
        t.bufferCheckPosition = Q + t.position;
      }
      function f(t) {
        for (var e = 0, d = s.length; e < d; e++)
          t[s[e]] = "";
      }
      function h(t) {
        g(t), t.cdata !== "" && (r(t, "oncdata", t.cdata), t.cdata = ""), t.script !== "" && (r(t, "onscript", t.script), t.script = "");
      }
      c.prototype = {
        end: function() {
          M(this);
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
      var b;
      try {
        b = Bt.Stream;
      } catch {
        b = function() {
        };
      }
      b || (b = function() {
      });
      var E = n.EVENTS.filter(function(t) {
        return t !== "error" && t !== "end";
      });
      function w(t, e) {
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
        b.apply(this), this._parser = new c(t, e), this.writable = !0, this.readable = !0;
        var d = this;
        this._parser.onend = function() {
          d.emit("end");
        }, this._parser.onerror = function(a) {
          d.emit("error", a), d._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, E.forEach(function(a) {
          Object.defineProperty(d, "on" + a, {
            get: function() {
              return d._parser["on" + a];
            },
            set: function(q) {
              if (!q)
                return d.removeAllListeners(a), d._parser["on" + a] = q, q;
              d.on(a, q);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      y.prototype = Object.create(b.prototype, {
        constructor: {
          value: y
        }
      }), y.prototype._decodeBuffer = function(t, e) {
        if (this._decoderBuffer && (t = Buffer.concat([this._decoderBuffer, t]), this._decoderBuffer = null), !this._decoder) {
          var d = p(t, e);
          if (!d)
            return this._decoderBuffer = t, "";
          this._parser.encoding = d, this._decoder = new TextDecoder(d);
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
          var d = this._decoder.decode();
          d && (this._parser.write(d), this.emit("data", d));
        }
        return this._parser.end(), !0;
      }, y.prototype.on = function(t, e) {
        var d = this;
        return !d._parser["on" + t] && E.indexOf(t) !== -1 && (d._parser["on" + t] = function() {
          var a = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          a.splice(0, 0, t), d.emit.apply(d, a);
        }), b.prototype.on.call(d, t, e);
      };
      var R = /^\[CDATA\[$/i, m = /^DOCTYPE$/i, T = "http://www.w3.org/XML/1998/namespace", C = "http://www.w3.org/2000/xmlns/", B = { xml: T, xmlns: C }, P = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, F = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, j = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, l = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function v(t) {
        return t === " " || t === `
` || t === "\r" || t === "	";
      }
      function N(t) {
        return t === '"' || t === "'";
      }
      function D(t) {
        return t === ">" || v(t);
      }
      function I(t, e) {
        return t.test(e);
      }
      function L(t, e) {
        return !I(t, e);
      }
      var i = 0;
      n.STATE = {
        BEGIN: i++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: i++,
        // leading whitespace
        TEXT: i++,
        // general stuff
        TEXT_ENTITY: i++,
        // &amp and such.
        OPEN_WAKA: i++,
        // <
        SGML_DECL: i++,
        // <!BLARG
        SGML_DECL_QUOTED: i++,
        // <!BLARG foo "bar
        DOCTYPE: i++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: i++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: i++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: i++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: i++,
        // <!-
        COMMENT: i++,
        // <!--
        COMMENT_ENDING: i++,
        // <!-- blah -
        COMMENT_ENDED: i++,
        // <!-- blah --
        CDATA: i++,
        // <![CDATA[ something
        CDATA_ENDING: i++,
        // ]
        CDATA_ENDING_2: i++,
        // ]]
        PROC_INST: i++,
        // <?hi
        PROC_INST_BODY: i++,
        // <?hi there
        PROC_INST_ENDING: i++,
        // <?hi "there" ?
        OPEN_TAG: i++,
        // <strong
        OPEN_TAG_SLASH: i++,
        // <strong /
        ATTRIB: i++,
        // <a
        ATTRIB_NAME: i++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: i++,
        // <a foo _
        ATTRIB_VALUE: i++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: i++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: i++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: i++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: i++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: i++,
        // <foo bar=&quot
        CLOSE_TAG: i++,
        // </a
        CLOSE_TAG_SAW_WHITE: i++,
        // </a   >
        SCRIPT: i++,
        // <script> ...
        SCRIPT_ENDING: i++
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
        var e = n.ENTITIES[t], d = typeof e == "number" ? String.fromCharCode(e) : e;
        n.ENTITIES[t] = d;
      });
      for (var H in n.STATE)
        n.STATE[n.STATE[H]] = H;
      i = n.STATE;
      function Y(t, e, d) {
        t[e] && t[e](d);
      }
      function _(t) {
        var e = t && t.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return e ? e[2] : null;
      }
      function O(t) {
        return t ? t.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function G(t, e) {
        const d = O(t), a = O(e);
        return !d || !a ? !0 : a === "utf16" ? d === "utf16le" || d === "utf16be" : d === a;
      }
      function $(t, e) {
        if (!(!t.strict || !t.encoding || !e || e.name !== "xml")) {
          var d = _(e.body);
          d && !G(t.encoding, d) && A(
            t,
            "XML declaration encoding " + d + " does not match detected stream encoding " + t.encoding.toUpperCase()
          );
        }
      }
      function r(t, e, d) {
        t.textNode && g(t), Y(t, e, d);
      }
      function g(t) {
        t.textNode = x(t.opt, t.textNode), t.textNode && Y(t, "ontext", t.textNode), t.textNode = "";
      }
      function x(t, e) {
        return t.trim && (e = e.trim()), t.normalize && (e = e.replace(/\s+/g, " ")), e;
      }
      function U(t, e) {
        return g(t), t.trackPosition && (e += `
Line: ` + t.line + `
Column: ` + t.column + `
Char: ` + t.c), e = new Error(e), t.error = e, Y(t, "onerror", e), t;
      }
      function M(t) {
        return t.sawRoot && !t.closedRoot && A(t, "Unclosed root tag"), t.state !== i.BEGIN && t.state !== i.BEGIN_WHITESPACE && t.state !== i.TEXT && U(t, "Unexpected end"), g(t), t.c = "", t.closed = !0, Y(t, "onend"), c.call(t, t.strict, t.opt), t;
      }
      function A(t, e) {
        if (typeof t != "object" || !(t instanceof c))
          throw new Error("bad call to strictFail");
        t.strict && U(t, e);
      }
      function V(t) {
        t.strict || (t.tagName = t.tagName[t.looseCase]());
        var e = t.tags[t.tags.length - 1] || t, d = t.tag = { name: t.tagName, attributes: {} };
        t.opt.xmlns && (d.ns = e.ns), t.attribList.length = 0, r(t, "onopentagstart", d);
      }
      function S(t, e) {
        var d = t.indexOf(":"), a = d < 0 ? ["", t] : t.split(":"), q = a[0], z = a[1];
        return e && t === "xmlns" && (q = "xmlns", z = ""), { prefix: q, local: z };
      }
      function k(t) {
        if (t.strict || (t.attribName = t.attribName[t.looseCase]()), t.attribList.indexOf(t.attribName) !== -1 || t.tag.attributes.hasOwnProperty(t.attribName)) {
          t.attribName = t.attribValue = "";
          return;
        }
        if (t.opt.xmlns) {
          var e = S(t.attribName, !0), d = e.prefix, a = e.local;
          if (d === "xmlns")
            if (a === "xml" && t.attribValue !== T)
              A(
                t,
                "xml: prefix must be bound to " + T + `
Actual: ` + t.attribValue
              );
            else if (a === "xmlns" && t.attribValue !== C)
              A(
                t,
                "xmlns: prefix must be bound to " + C + `
Actual: ` + t.attribValue
              );
            else {
              var q = t.tag, z = t.tags[t.tags.length - 1] || t;
              q.ns === z.ns && (q.ns = Object.create(z.ns)), q.ns[a] = t.attribValue;
            }
          t.attribList.push([t.attribName, t.attribValue]);
        } else
          t.tag.attributes[t.attribName] = t.attribValue, r(t, "onattribute", {
            name: t.attribName,
            value: t.attribValue
          });
        t.attribName = t.attribValue = "";
      }
      function X(t, e) {
        if (t.opt.xmlns) {
          var d = t.tag, a = S(t.tagName);
          d.prefix = a.prefix, d.local = a.local, d.uri = d.ns[a.prefix] || "", d.prefix && !d.uri && (A(
            t,
            "Unbound namespace prefix: " + JSON.stringify(t.tagName)
          ), d.uri = a.prefix);
          var q = t.tags[t.tags.length - 1] || t;
          d.ns && q.ns !== d.ns && Object.keys(d.ns).forEach(function(qe) {
            r(t, "onopennamespace", {
              prefix: qe,
              uri: d.ns[qe]
            });
          });
          for (var z = 0, Q = t.attribList.length; z < Q; z++) {
            var ee = t.attribList[z], te = ee[0], ie = ee[1], K = S(te, !0), ae = K.prefix, vt = K.local, $e = ae === "" ? "" : d.ns[ae] || "", Ie = {
              name: te,
              value: ie,
              prefix: ae,
              local: vt,
              uri: $e
            };
            ae && ae !== "xmlns" && !$e && (A(
              t,
              "Unbound namespace prefix: " + JSON.stringify(ae)
            ), Ie.uri = ae), t.tag.attributes[te] = Ie, r(t, "onattribute", Ie);
          }
          t.attribList.length = 0;
        }
        t.tag.isSelfClosing = !!e, t.sawRoot = !0, t.tags.push(t.tag), r(t, "onopentag", t.tag), e || (!t.noscript && t.tagName.toLowerCase() === "script" ? t.state = i.SCRIPT : t.state = i.TEXT, t.tag = null, t.tagName = ""), t.attribName = t.attribValue = "", t.attribList.length = 0;
      }
      function oe(t) {
        if (!t.tagName) {
          A(t, "Weird empty close tag."), t.textNode += "</>", t.state = i.TEXT;
          return;
        }
        if (t.script) {
          if (t.tagName !== "script") {
            t.script += "</" + t.tagName + ">", t.tagName = "", t.state = i.SCRIPT;
            return;
          }
          r(t, "onscript", t.script), t.script = "";
        }
        var e = t.tags.length, d = t.tagName;
        t.strict || (d = d[t.looseCase]());
        for (var a = d; e--; ) {
          var q = t.tags[e];
          if (q.name !== a)
            A(t, "Unexpected close tag");
          else
            break;
        }
        if (e < 0) {
          A(t, "Unmatched closing tag: " + t.tagName), t.textNode += "</" + t.tagName + ">", t.state = i.TEXT;
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
        e === 0 && (t.closedRoot = !0), t.tagName = t.attribValue = t.attribName = "", t.attribList.length = 0, t.state = i.TEXT;
      }
      function re(t) {
        var e = t.entity, d = e.toLowerCase(), a, q = "";
        return t.ENTITIES[e] ? t.ENTITIES[e] : t.ENTITIES[d] ? t.ENTITIES[d] : (e = d, e.charAt(0) === "#" && (e.charAt(1) === "x" ? (e = e.slice(2), a = parseInt(e, 16), q = a.toString(16)) : (e = e.slice(1), a = parseInt(e, 10), q = a.toString(10))), e = e.replace(/^0+/, ""), isNaN(a) || q.toLowerCase() !== e || a < 0 || a > 1114111 || !ue(a) ? (A(t, "Invalid character entity"), "&" + t.entity + ";") : String.fromCodePoint(a));
      }
      function ue(t) {
        return t === 9 || t === 10 || t === 13 || t >= 32 && t <= 55295 || t >= 57344 && t <= 65533 || t >= 65536 && t <= 1114111;
      }
      function pe(t, e) {
        e === "<" ? (t.state = i.OPEN_WAKA, t.startTagPosition = t.position) : v(e) || (A(t, "Non-whitespace before first tag."), t.textNode = e, t.state = i.TEXT);
      }
      function de(t, e) {
        var d = "";
        return e < t.length && (d = t.charAt(e)), d;
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
          return M(e);
        typeof t == "object" && (t = t.toString());
        for (var d = 0, a = ""; a = de(t, d++), e.c = a, !!a; )
          switch (e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++), e.state) {
            case i.BEGIN:
              if (e.state = i.BEGIN_WHITESPACE, a === "\uFEFF")
                continue;
              pe(e, a);
              continue;
            case i.BEGIN_WHITESPACE:
              pe(e, a);
              continue;
            case i.TEXT:
              if (e.sawRoot && !e.closedRoot) {
                for (var z = d - 1; a && a !== "<" && a !== "&"; )
                  a = de(t, d++), a && e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++);
                e.textNode += t.substring(z, d - 1);
              }
              a === "<" && !(e.sawRoot && e.closedRoot && !e.strict) ? (e.state = i.OPEN_WAKA, e.startTagPosition = e.position) : (!v(a) && (!e.sawRoot || e.closedRoot) && A(e, "Text data outside of root node."), a === "&" ? e.state = i.TEXT_ENTITY : e.textNode += a);
              continue;
            case i.SCRIPT:
              a === "<" ? e.state = i.SCRIPT_ENDING : e.script += a;
              continue;
            case i.SCRIPT_ENDING:
              a === "/" ? e.state = i.CLOSE_TAG : (e.script += "<" + a, e.state = i.SCRIPT);
              continue;
            case i.OPEN_WAKA:
              if (a === "!")
                e.state = i.SGML_DECL, e.sgmlDecl = "";
              else if (!v(a)) if (I(P, a))
                e.state = i.OPEN_TAG, e.tagName = a;
              else if (a === "/")
                e.state = i.CLOSE_TAG, e.tagName = "";
              else if (a === "?")
                e.state = i.PROC_INST, e.procInstName = e.procInstBody = "";
              else {
                if (A(e, "Unencoded <"), e.startTagPosition + 1 < e.position) {
                  var q = e.position - e.startTagPosition;
                  a = new Array(q).join(" ") + a;
                }
                e.textNode += "<" + a, e.state = i.TEXT;
              }
              continue;
            case i.SGML_DECL:
              if (e.sgmlDecl + a === "--") {
                e.state = i.COMMENT, e.comment = "", e.sgmlDecl = "";
                continue;
              }
              e.doctype && e.doctype !== !0 && e.sgmlDecl ? (e.state = i.DOCTYPE_DTD, e.doctype += "<!" + e.sgmlDecl + a, e.sgmlDecl = "") : R.test(e.sgmlDecl + a) ? (r(e, "onopencdata"), e.state = i.CDATA, e.sgmlDecl = "", e.cdata = "") : m.test(e.sgmlDecl + a) ? (e.state = i.DOCTYPE, (e.doctype || e.sawRoot) && A(
                e,
                "Inappropriately located doctype declaration"
              ), e.doctype = "", e.sgmlDecl = "") : a === ">" ? (r(e, "onsgmldeclaration", e.sgmlDecl), e.sgmlDecl = "", e.state = i.TEXT) : (N(a) && (e.state = i.SGML_DECL_QUOTED), e.sgmlDecl += a);
              continue;
            case i.SGML_DECL_QUOTED:
              a === e.q && (e.state = i.SGML_DECL, e.q = ""), e.sgmlDecl += a;
              continue;
            case i.DOCTYPE:
              a === ">" ? (e.state = i.TEXT, r(e, "ondoctype", e.doctype), e.doctype = !0) : (e.doctype += a, a === "[" ? e.state = i.DOCTYPE_DTD : N(a) && (e.state = i.DOCTYPE_QUOTED, e.q = a));
              continue;
            case i.DOCTYPE_QUOTED:
              e.doctype += a, a === e.q && (e.q = "", e.state = i.DOCTYPE);
              continue;
            case i.DOCTYPE_DTD:
              a === "]" ? (e.doctype += a, e.state = i.DOCTYPE) : a === "<" ? (e.state = i.OPEN_WAKA, e.startTagPosition = e.position) : N(a) ? (e.doctype += a, e.state = i.DOCTYPE_DTD_QUOTED, e.q = a) : e.doctype += a;
              continue;
            case i.DOCTYPE_DTD_QUOTED:
              e.doctype += a, a === e.q && (e.state = i.DOCTYPE_DTD, e.q = "");
              continue;
            case i.COMMENT:
              a === "-" ? e.state = i.COMMENT_ENDING : e.comment += a;
              continue;
            case i.COMMENT_ENDING:
              a === "-" ? (e.state = i.COMMENT_ENDED, e.comment = x(e.opt, e.comment), e.comment && r(e, "oncomment", e.comment), e.comment = "") : (e.comment += "-" + a, e.state = i.COMMENT);
              continue;
            case i.COMMENT_ENDED:
              a !== ">" ? (A(e, "Malformed comment"), e.comment += "--" + a, e.state = i.COMMENT) : e.doctype && e.doctype !== !0 ? e.state = i.DOCTYPE_DTD : e.state = i.TEXT;
              continue;
            case i.CDATA:
              for (var z = d - 1; a && a !== "]"; )
                a = de(t, d++), a && e.trackPosition && (e.position++, a === `
` ? (e.line++, e.column = 0) : e.column++);
              e.cdata += t.substring(z, d - 1), a === "]" && (e.state = i.CDATA_ENDING);
              continue;
            case i.CDATA_ENDING:
              a === "]" ? e.state = i.CDATA_ENDING_2 : (e.cdata += "]" + a, e.state = i.CDATA);
              continue;
            case i.CDATA_ENDING_2:
              a === ">" ? (e.cdata && r(e, "oncdata", e.cdata), r(e, "onclosecdata"), e.cdata = "", e.state = i.TEXT) : a === "]" ? e.cdata += "]" : (e.cdata += "]]" + a, e.state = i.CDATA);
              continue;
            case i.PROC_INST:
              a === "?" ? e.state = i.PROC_INST_ENDING : v(a) ? e.state = i.PROC_INST_BODY : e.procInstName += a;
              continue;
            case i.PROC_INST_BODY:
              if (!e.procInstBody && v(a))
                continue;
              a === "?" ? e.state = i.PROC_INST_ENDING : e.procInstBody += a;
              continue;
            case i.PROC_INST_ENDING:
              if (a === ">") {
                const ie = {
                  name: e.procInstName,
                  body: e.procInstBody
                };
                $(e, ie), r(e, "onprocessinginstruction", ie), e.procInstName = e.procInstBody = "", e.state = i.TEXT;
              } else
                e.procInstBody += "?" + a, e.state = i.PROC_INST_BODY;
              continue;
            case i.OPEN_TAG:
              I(F, a) ? e.tagName += a : (V(e), a === ">" ? X(e) : a === "/" ? e.state = i.OPEN_TAG_SLASH : (v(a) || A(e, "Invalid character in tag name"), e.state = i.ATTRIB));
              continue;
            case i.OPEN_TAG_SLASH:
              a === ">" ? (X(e, !0), oe(e)) : (A(
                e,
                "Forward-slash in opening tag not followed by >"
              ), e.state = i.ATTRIB);
              continue;
            case i.ATTRIB:
              if (v(a))
                continue;
              a === ">" ? X(e) : a === "/" ? e.state = i.OPEN_TAG_SLASH : I(P, a) ? (e.attribName = a, e.attribValue = "", e.state = i.ATTRIB_NAME) : A(e, "Invalid attribute name");
              continue;
            case i.ATTRIB_NAME:
              a === "=" ? e.state = i.ATTRIB_VALUE : a === ">" ? (A(e, "Attribute without value"), e.attribValue = e.attribName, k(e), X(e)) : v(a) ? e.state = i.ATTRIB_NAME_SAW_WHITE : I(F, a) ? e.attribName += a : A(e, "Invalid attribute name");
              continue;
            case i.ATTRIB_NAME_SAW_WHITE:
              if (a === "=")
                e.state = i.ATTRIB_VALUE;
              else {
                if (v(a))
                  continue;
                A(e, "Attribute without value"), e.tag.attributes[e.attribName] = "", e.attribValue = "", r(e, "onattribute", {
                  name: e.attribName,
                  value: ""
                }), e.attribName = "", a === ">" ? X(e) : I(P, a) ? (e.attribName = a, e.state = i.ATTRIB_NAME) : (A(e, "Invalid attribute name"), e.state = i.ATTRIB);
              }
              continue;
            case i.ATTRIB_VALUE:
              if (v(a))
                continue;
              N(a) ? (e.q = a, e.state = i.ATTRIB_VALUE_QUOTED) : (e.opt.unquotedAttributeValues || U(e, "Unquoted attribute value"), e.state = i.ATTRIB_VALUE_UNQUOTED, e.attribValue = a);
              continue;
            case i.ATTRIB_VALUE_QUOTED:
              if (a !== e.q) {
                a === "&" ? e.state = i.ATTRIB_VALUE_ENTITY_Q : e.attribValue += a;
                continue;
              }
              k(e), e.q = "", e.state = i.ATTRIB_VALUE_CLOSED;
              continue;
            case i.ATTRIB_VALUE_CLOSED:
              v(a) ? e.state = i.ATTRIB : a === ">" ? X(e) : a === "/" ? e.state = i.OPEN_TAG_SLASH : I(P, a) ? (A(e, "No whitespace between attributes"), e.attribName = a, e.attribValue = "", e.state = i.ATTRIB_NAME) : A(e, "Invalid attribute name");
              continue;
            case i.ATTRIB_VALUE_UNQUOTED:
              if (!D(a)) {
                a === "&" ? e.state = i.ATTRIB_VALUE_ENTITY_U : e.attribValue += a;
                continue;
              }
              k(e), a === ">" ? X(e) : e.state = i.ATTRIB;
              continue;
            case i.CLOSE_TAG:
              if (e.tagName)
                a === ">" ? oe(e) : I(F, a) ? e.tagName += a : e.script ? (e.script += "</" + e.tagName + a, e.tagName = "", e.state = i.SCRIPT) : (v(a) || A(e, "Invalid tagname in closing tag"), e.state = i.CLOSE_TAG_SAW_WHITE);
              else {
                if (v(a))
                  continue;
                L(P, a) ? e.script ? (e.script += "</" + a, e.state = i.SCRIPT) : A(e, "Invalid tagname in closing tag.") : e.tagName = a;
              }
              continue;
            case i.CLOSE_TAG_SAW_WHITE:
              if (v(a))
                continue;
              a === ">" ? oe(e) : A(e, "Invalid characters in closing tag");
              continue;
            case i.TEXT_ENTITY:
            case i.ATTRIB_VALUE_ENTITY_Q:
            case i.ATTRIB_VALUE_ENTITY_U:
              var Q, ee;
              switch (e.state) {
                case i.TEXT_ENTITY:
                  Q = i.TEXT, ee = "textNode";
                  break;
                case i.ATTRIB_VALUE_ENTITY_Q:
                  Q = i.ATTRIB_VALUE_QUOTED, ee = "attribValue";
                  break;
                case i.ATTRIB_VALUE_ENTITY_U:
                  Q = i.ATTRIB_VALUE_UNQUOTED, ee = "attribValue";
                  break;
              }
              if (a === ";") {
                var te = re(e);
                e.opt.unparsedEntities && !Object.values(n.XML_ENTITIES).includes(te) ? ((e.entityCount += 1) > e.opt.maxEntityCount && U(
                  e,
                  "Parsed entity count exceeds max entity count"
                ), (e.entityDepth += 1) > e.opt.maxEntityDepth && U(
                  e,
                  "Parsed entity depth exceeds max entity depth"
                ), e.entity = "", e.state = Q, e.write(te), e.entityDepth -= 1) : (e[ee] += te, e.entity = "", e.state = Q);
              } else I(e.entity.length ? l : j, a) ? e.entity += a : (A(e, "Invalid character in entity name"), e[ee] += "&" + e.entity + a, e.entity = "", e.state = Q);
              continue;
            default:
              throw new Error(e, "Unknown state: " + e.state);
          }
        return e.position >= e.bufferCheckPosition && u(e), e;
      }
      String.fromCodePoint || (function() {
        var t = String.fromCharCode, e = Math.floor, d = function() {
          var a = 16384, q = [], z, Q, ee = -1, te = arguments.length;
          if (!te)
            return "";
          for (var ie = ""; ++ee < te; ) {
            var K = Number(arguments[ee]);
            if (!isFinite(K) || // `NaN`, `+Infinity`, or `-Infinity`
            K < 0 || // not a valid Unicode code point
            K > 1114111 || // not a valid Unicode code point
            e(K) !== K)
              throw RangeError("Invalid code point: " + K);
            K <= 65535 ? q.push(K) : (K -= 65536, z = (K >> 10) + 55296, Q = K % 1024 + 56320, q.push(z, Q)), (ee + 1 === te || q.length > a) && (ie += t.apply(null, q), q.length = 0);
          }
          return ie;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: d,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = d;
      })();
    })(o);
  })(Me)), Me;
}
var Le, Ze;
function Ut() {
  if (Ze) return Le;
  Ze = 1;
  var o = jt().parser;
  function n(s) {
    var c = [], u = [], f = c, h;
    return h = o(!0), h.ontext = function(b) {
      b.trim() !== "" && f.push(b);
    }, h.onopentag = function(b) {
      var E;
      E = [b.name, b.attributes], u.push(f), f.push(E), f = E;
    }, h.onclosetag = function() {
      f = u.pop();
    }, h.write(s).close(), c[0];
  }
  return Le = n, Le;
}
var Re, Je;
function Vt() {
  if (Je) return Re;
  Je = 1;
  function o(n, s) {
    var c = function() {
    }, u = c, f = c;
    function h() {
      this._skip = !0;
    }
    function b() {
      this._remove = !0;
    }
    function E(y) {
      this._name = y;
    }
    function w(y) {
      this._replace = y;
    }
    function p(y, R) {
      var m, T = { attr: {}, full: y }, C = {
        name: E,
        skip: h,
        // break: breakFn,
        remove: b,
        replace: w,
        _name: void 0,
        _skip: !1,
        // _break: false,
        _remove: !1,
        _replace: void 0
      }, B = !0, P, F, j;
      if (y !== void 0 && y !== null && y !== !0 && y !== !1)
        switch (m = Object.prototype.toString.call(y), m) {
          case "[object String]":
          case "[object Number]":
            return;
          case "[object Array]":
            if (y.some(function(l, v) {
              if (v === 0)
                return T.name = l, !1;
              if (v === 1)
                return Object.prototype.toString.call(l) === "[object Object]" && (B = !1, T.attr = l), !0;
            }), u.call(C, T, R), C._name && (y[0] = C._name), C._replace)
              return C._replace;
            if (C._remove)
              return null;
            if (!C._skip) {
              for (P = 0, F = y.length; P < F; ) {
                if (P > 1 || P === 1 && B) {
                  if (j = p(y[P], T), j === null) {
                    y.splice(P, 1), F -= 1;
                    continue;
                  }
                  j && (y[P] = j);
                }
                P += 1;
              }
              if (f.call(C, T, R), C._name && (y[0] = C._name), C._replace)
                return C._replace;
              if (C._remove)
                return null;
            }
        }
    }
    s && (s.enter && (u = s.enter), s.leave && (f = s.leave)), p(n, void 0);
  }
  return Re = o, Re;
}
var Fe, et;
function kt() {
  if (et) return Fe;
  et = 1;
  const o = Ut(), n = Vt(), s = (u) => String(u).replace(/[&<>"']/g, (f) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[f]);
  function c(u) {
    const [f, ...h] = u, b = h[0] && typeof h[0] == "object" && !Array.isArray(h[0]) ? h.shift() : {}, E = "<" + f + Object.entries(b).map(([w, p]) => " " + w + '="' + s(p) + '"').join("");
    return h.length ? E + ">" + h.map((w) => Array.isArray(w) ? c(w) : s(w)).join("") + "</" + f + ">" : E + "/>";
  }
  return Fe = { parse: o, p: o, traverse: n, t: n, stringify: c, s: c }, Fe;
}
kt();
const Ne = (o) => Math.round(Number(o) * 1e3) / 1e3, me = (o) => Ne(o.x) + "," + Ne(o.y), ce = (o, n) => Math.abs(o - n) < 2e-3, tt = (o, n, s) => o >= Math.min(n, s) - 2e-3 && o <= Math.max(n, s) + 2e-3, Ee = (o, n) => ce(n.a.x, n.b.x) ? ce(o.x, n.a.x) && tt(o.y, n.a.y, n.b.y) : ce(o.y, n.a.y) && tt(o.x, n.a.x, n.b.x), nt = (o, n) => Math.abs(o.x - n.x) + Math.abs(o.y - n.y);
function Gt(o, n = [], s = []) {
  const c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), h = (l) => {
    const v = { x: Ne(l.x), y: Ne(l.y) };
    return c.set(me(v), v), me(v);
  };
  for (const l of o)
    h(l.a), h(l.b);
  const b = n.map(h);
  for (const l of s)
    u.add(h(l.a)), u.add(h(l.b)), f.add([me(l.a), me(l.b)].sort().join("|"));
  for (let l = 0; l < o.length; l++) for (let v = l + 1; v < o.length; v++) {
    const N = o[l], D = o[v], I = ce(N.a.x, N.b.x), L = ce(D.a.x, D.b.x);
    if (I === L) continue;
    const i = I ? N : D, H = I ? D : N, Y = { x: i.a.x, y: H.a.y };
    Ee(Y, i) && Ee(Y, H) && h(Y);
  }
  const E = /* @__PURE__ */ new Map();
  for (const l of o) {
    const v = [...c.values()].filter((N) => Ee(N, l)).sort((N, D) => N.x - D.x || N.y - D.y);
    for (let N = 1; N < v.length; N++) {
      const D = me(v[N - 1]), I = me(v[N]);
      D !== I && E.set([D, I].sort().join("|"), { a: D, b: I, length: nt(v[N - 1], v[N]) });
    }
  }
  const w = new Map([...c.keys()].map((l) => [l, l])), p = (l) => {
    let v = l;
    for (; w.get(v) !== v; ) v = w.get(v);
    for (; l !== v; ) {
      const N = w.get(l);
      w.set(l, v), l = N;
    }
    return v;
  }, y = (l) => f.has([l.a, l.b].sort().join("|")) || s.some((v) => Ee(c.get(l.a), v) && Ee(c.get(l.b), v)), R = [...E.entries()].sort(([l, v], [N, D]) => Number(y(D)) - Number(y(v)) || v.length - D.length || l.localeCompare(N)), m = new Map([...c.keys()].map((l) => [l, /* @__PURE__ */ new Set()]));
  let T = 0;
  for (const [, l] of R) {
    const v = p(l.a), N = p(l.b);
    if (v === N) {
      T++;
      continue;
    }
    w.set(v, N), m.get(l.a).add(l.b), m.get(l.b).add(l.a);
  }
  if (b.length > 1 && b.some((l) => p(l) !== p(b[0]))) throw Error("Geometric net cleanup found disconnected terminals.");
  const C = /* @__PURE__ */ new Set([...b, ...u]), B = [...m].filter(([l, v]) => v.size === 1 && !C.has(l)).map(([l]) => l);
  let P = 0;
  for (; B.length; ) {
    const l = B.pop();
    if (C.has(l) || m.get(l).size !== 1) continue;
    const v = [...m.get(l)][0];
    m.get(l).clear(), m.get(v).delete(l), P++, m.get(v).size === 1 && !C.has(v) && B.push(v);
  }
  for (const [l, v] of m) if (v.size === 2 && !C.has(l)) {
    const [N, D] = [...v], I = c.get(N), L = c.get(l), i = c.get(D);
    (ce(I.x, L.x) && ce(L.x, i.x) || ce(I.y, L.y) && ce(L.y, i.y)) && (m.get(N).delete(l), m.get(D).delete(l), m.get(N).add(D), m.get(D).add(N), v.clear());
  }
  const F = [], j = /* @__PURE__ */ new Set();
  for (const [l, v] of m) for (const N of v) {
    const D = [l, N].sort().join("|");
    j.has(D) || (j.add(D), F.push({ a: c.get(l), b: c.get(N) }));
  }
  return { segments: F, junctions: [...m].filter(([, l]) => l.size >= 3).map(([l]) => c.get(l)), cyclesRemoved: T, leavesRemoved: P, wireLength: F.reduce((l, v) => l + nt(v.a, v.b), 0) };
}
const ht = (o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), be = (o, n, s) => o.replace(new RegExp("(?<![\\w./%:$])" + ht(n) + "(?![\\w./%:$])", "gi"), () => s);
function $t(o, n) {
  const s = n.components.filter((r) => !r.synthetic), c = ge(o.root), u = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), h = s.filter((r) => r.kind === "X"), b = /* @__PURE__ */ new Set(), E = (r, g) => {
    let x = g.includes("/") ? r + "_" + g.replaceAll("/", "_") : g;
    x = x.replace(/[^a-z0-9_.$@&Ö]/gi, "_"), x.toUpperCase().startsWith(r) || (x = r + "_" + x);
    const U = x;
    let M = 1;
    for (; b.has(x.toLowerCase()); ) x = U + "_" + M++;
    return b.add(x.toLowerCase()), x;
  };
  c.forEach((r) => u.set(r.name, E(r.kind, r.name)));
  const w = new Map(h.map((r) => [r.name, E("X", r.name)])), p = new Map(h.map((r, g) => [r.name, "CV_BLOCK_" + g]));
  c.forEach((r) => f.set(r.name, ""));
  for (const r of h) for (const g of ge(o.contexts[r.instanceId])) f.set(g.name, r.name);
  const y = (r) => /^(?:[a-z_][\w.$-]*|\d+)$/i.test(r), R = new Set([...c.flatMap((r) => Object.values(r.terminals)), ...Object.keys(n.nodes)].filter(y).map((r) => r.toLowerCase())), m = /* @__PURE__ */ new Map([["0", "0"]]), T = /* @__PURE__ */ new Set(["0"]);
  let C = 1;
  const B = (r) => {
    if (!m.has(r)) {
      let g = r;
      if (!y(r) || T.has(r.toLowerCase()))
        do
          g = "N_cv" + C++;
        while (R.has(g.toLowerCase()) || T.has(g.toLowerCase()));
      m.set(r, g), T.add(g.toLowerCase());
    }
    return m.get(r);
  };
  for (const r of c) Object.values(r.terminals).forEach(B);
  Object.keys(n.nodes).forEach(B);
  const P = /* @__PURE__ */ new Map();
  for (const r of h) {
    const g = new Set(r.block.ports.map((x) => x.node));
    for (const x of ge(o.contexts[r.instanceId])) for (const U of Object.values(x.terminals)) !g.has(U) && U !== "0" && !o.ir.globals.some((M) => Se([], M) === U) && P.set(U, r.name);
  }
  const F = new Map(h.map((r) => [r.name, new Map(r.block.ports.map((g, x) => [g.node, "p" + x]).reverse())])), j = (r, g = "") => {
    if (r === "0") return "0";
    if (F.get(g)?.has(r)) return F.get(g).get(r);
    const x = P.get(r);
    if (g && x && x !== g) throw Error("ASC export: cross-block internal node probe requires expanding both instances: " + r);
    return x && x !== g ? w.get(x) + ":" + B(r) : B(r);
  }, l = (r, g = "") => {
    if (!u.has(r)) throw Error("ASC: unresolved device reference " + r);
    const x = f.get(r);
    if (g && x !== g) throw Error("ASC export: cross-block current probe requires expanding both instances: " + r);
    return x && x !== g ? w.get(x) + ":" + u.get(r) : u.get(r);
  }, v = /* @__PURE__ */ new Map();
  function N(r, g = {}) {
    const x = o.ir.scopes[r.scopeId];
    let U;
    if (!r.id) U = Object.fromEntries(Object.keys(r.params).map((M) => [M, M]));
    else {
      const M = o.contexts[r.path.slice(0, -1).map(encodeURIComponent).join("/")], A = o.ir.scopes[M.scopeId].instances.find((V) => V.name === r.path.at(-1));
      U = Tt(g, x.defaults, x.parameters, A.parameters);
    }
    v.set(r.id, U), r.children.forEach((M) => N(M, U));
  }
  N(o.root);
  const D = (r, g) => {
    const x = r.ports.find((A) => A.name.toLowerCase() === g.toLowerCase());
    if (x) return x.node;
    const U = r.nodes[g.toLowerCase()];
    if (U) return U;
    if (o.ir.globals.includes(g.toLowerCase())) return Se([], g);
    const M = g.split(":");
    if (M.length > 1) {
      const A = M.pop(), V = [...r.path, ...M].map(encodeURIComponent).join("/"), S = o.contexts[V] || o.contexts[M.map(encodeURIComponent).join("/")];
      if (S) return D(S, A);
    }
    return Se(r.path, g);
  }, I = (r, g) => {
    const x = r.devices.find((M) => M.localName.toLowerCase() === g.toLowerCase());
    if (x) return x.name;
    const U = g.split(":");
    if (U.length > 1) {
      const M = U.pop(), A = [...r.path, ...U].map(encodeURIComponent).join("/"), S = (o.contexts[A] || o.contexts[U.map(encodeURIComponent).join("/")])?.devices.find((k) => k.localName.toLowerCase() === M.toLowerCase());
      if (S) return S.name;
    }
    throw Error("ASC: unsupported device reference " + g);
  }, L = new Map(Object.keys(n.models).map((r, g) => [r, "CV_MODEL_" + g]));
  function i(r, g) {
    const x = o.contexts[r.instanceId], U = o.ir.scopes[x.scopeId].devices.find((S) => S.name === r.localName), M = [], A = (S) => "__CV_PROBE_" + (M.push(S) - 1) + "__";
    let V = De(U.value, v.get(x.id), (S) => A(j(D(x, S), g)), (S) => A(l(I(x, S), g)));
    if (U.model && (V = be(V, U.model, L.get(r.model) || r.model)), V = V.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (S, k, X) => k + "(" + X.split(",").map((oe) => {
      const re = oe.trim(), ue = /^__CV_PROBE_(\d+)__$/.exec(re);
      return ue ? M[+ue[1]] : k.toLowerCase() === "v" ? j(D(x, re), g) : l(I(x, re), g);
    }).join(",") + ")"), (U.controlSources || []).forEach((S, k) => {
      V = be(V, S, l(r.controlSources[k], g));
    }), r.kind === "@") for (const [S, k] of Object.entries(r.terminals)) ["REFNODE", "INTNODE"].includes(S) && (V = V.replace(new RegExp("\\b" + S + "\\s*=\\s*[^\\s]+", "i"), S.toLowerCase() + "=" + j(k, g)));
    return V;
  }
  const H = /* @__PURE__ */ new Map(), Y = o.ir.diagnostics.filter((r) => r.severity === "warning").map((r) => r.message);
  function _(r, g = "") {
    if (r.kind === "X") {
      const S = r.block.ports.map((k) => j(k.node, g));
      return { ref: w.get(r.name), kind: "X", pins: r.block.ports.map((k) => k.pin), nodes: S, value: p.get(r.name), line: [w.get(r.name), ...S, p.get(r.name)].join(" ") };
    }
    const x = u.get(r.name), U = Object.entries(r.terminals);
    if (r.kind === "K") {
      const S = i(r, g).split(" · k=").at(-1), k = [x, ...r.coupledInductors.map((X) => l(X, g)), S].join(" ");
      return { ref: x, kind: "K", pins: [], nodes: [], value: S, line: k, directive: !0 };
    }
    let M = i(r, g), A = U.map(([S]) => S), V = U.map(([, S]) => j(S, g));
    if (["E", "G"].includes(r.kind) && r.sourceMode === "POLY") {
      const S = /^POLY\(\d+\)\s*/i.exec(M);
      if (!S) throw Error("ASC: invalid POLY source " + r.name);
      M = S[0] + V.slice(2).join(" ") + " " + M.slice(S[0].length), A = A.slice(0, 2), V = V.slice(0, 2), Y.push(r.name + ": POLY control nodes remain explicit in the editable Value expression.");
    }
    return r.kind === "@" && (A = A.slice(0, 2), V = V.slice(0, 2)), { ref: x, kind: r.kind, prefix: r.kind === "M" ? r.type.includes("pmos") ? "MP" : "MN" : r.kind, pins: A, nodes: V, electricalNodes: U.map(([, S]) => j(S, g)), value: M, line: [x, ...V, M].filter(Boolean).join(" ") };
  }
  s.forEach((r) => H.set(r.name, _(r)));
  const O = [], G = [];
  for (const r of h) {
    O.push(".subckt " + p.get(r.name) + " " + r.block.ports.map((g, x) => "p" + x).join(" "));
    for (const g of ge(o.contexts[r.instanceId])) {
      const x = _(g, r.name);
      O.push(x.line), G.push({ original: g.name, scope: r.name, ...x });
    }
    O.push(".ends " + p.get(r.name));
  }
  for (const [r, g] of Object.entries(n.models)) {
    const x = o.contexts[g.instanceId], U = o.ir.scopes[x.scopeId], M = decodeURIComponent(r.split("/").at(-1)), A = U.models[M];
    let V = A ? De(A.raw, v.get(x.id), (S) => j(D(x, S)), (S) => l(I(x, S))) : g.raw;
    V = V.replace(/^(\.model\s+)\S+/i, (S, k) => k + L.get(r));
    for (const [S, k] of L) V = be(V, S, k);
    if (g.baseModel) {
      const S = x.path.length ? x.path.map(encodeURIComponent).join("/") + "/" : "";
      V = V.replace(new RegExp("(AKO:)" + ht(g.baseModel), "i"), (k, X) => X + (L.get(S + g.baseModel.toLowerCase()) || L.get(g.baseModel.toLowerCase()) || g.baseModel));
    }
    O.push(V);
  }
  const $ = [];
  for (const r of Object.values(o.contexts))
    if (!(r.id && !ge(r).some((g) => f.has(g.name) && (s.some((x) => x.name === g.name) || h.some((x) => x.name === f.get(g.name))))))
      for (const g of o.ir.scopes[r.scopeId].directives) {
        if (/^\.(?:model|param|global|title)\b/i.test(g.text) && r.id || /^\.(?:model|title)\b/i.test(g.text)) continue;
        if (r.id && !/^\.(?:func|ic|nodeset)\b/i.test(g.text)) throw Error("ASC export: local directive requires scope-preserving export (" + r.id + "): " + g.text);
        if (r.id && /^\.func\b/i.test(g.text)) throw Error("ASC export: local .func requires scope-preserving export (" + r.id + ").");
        const x = [], U = (A) => "__CV_PROBE_" + (x.push(A) - 1) + "__";
        let M = r.id ? De(g.text, v.get(r.id), (A) => U(j(D(r, A))), (A) => U(l(I(r, A)))) : g.text;
        if (M = M.replace(/\b(V|I[bcedgsx]?)\s*\(([^()]*)\)/gi, (A, V, S) => V + "(" + S.split(",").map((k) => {
          const X = k.trim(), oe = /^__CV_PROBE_(\d+)__$/.exec(X);
          if (oe) return x[+oe[1]];
          if (X === "*") return X;
          if (/[*?]/.test(X)) throw Error("ASC export: wildcard probe cannot be renamed reliably: " + X);
          return V.toLowerCase() === "v" ? j(D(r, X)) : l(I(r, X));
        }).join(",") + ")"), /^\.global\b/i.test(M) && (M = ".global " + M.split(/\s+/).slice(1).map((A) => j(D(r, A))).join(" ")), /^\.(?:dc|tf|noise|sens)\b/i.test(M)) for (const A of r.devices) M = be(M, A.localName, l(A.name));
        $.push(M);
      }
  return { cards: H, library: O, directives: $, nodeNames: m, refs: u, expected: G, warnings: [...new Set(Y)], node: j, blockRefs: w, definitions: p };
}
const xe = (o) => o.x + "," + o.y, qt = (o, n) => n.a.x === n.b.x ? o.x === n.a.x && o.y >= Math.min(n.a.y, n.b.y) && o.y <= Math.max(n.a.y, n.b.y) : o.y === n.a.y && o.x >= Math.min(n.a.x, n.b.x) && o.x <= Math.max(n.a.x, n.b.x);
function Yt(o) {
  return new TextDecoder(o[0] === 255 && o[1] === 254 ? "utf-16le" : "windows-1252").decode(o);
}
function Xt(o, n) {
  const s = [], c = [], u = [], f = [];
  let h;
  for (const m of o.split(/\r?\n/)) {
    let T;
    if (T = /^WIRE (-?\d+) (-?\d+) (-?\d+) (-?\d+)$/.exec(m)) s.push({ a: { x: +T[1], y: +T[2] }, b: { x: +T[3], y: +T[4] } });
    else if (T = /^FLAG (-?\d+) (-?\d+) (\S+)$/.exec(m)) c.push({ x: +T[1], y: +T[2], name: T[3] });
    else if (T = /^SYMBOL (\S+) (-?\d+) (-?\d+) R0$/.exec(m))
      h = { symbol: T[1], x: +T[2], y: +T[3], pins: [], value: "", ref: "" }, u.push(h);
    else if (T = /^SYMATTR (InstName|Value) (.*)$/.exec(m)) {
      if (!h) throw Error("ASC attribute without symbol.");
      h[T[1] === "InstName" ? "ref" : "value"] = T[2];
    } else (T = /^TEXT -?\d+ -?\d+ \S+ \d+ !([\s\S]*)$/.exec(m)) && f.push(...T[1].split("\\n"));
  }
  for (const m of u) {
    const T = n[m.symbol + ".asy"];
    if (!T) throw Error("Missing ASC companion " + m.symbol + ".asy");
    let C;
    for (const B of Yt(T).split(/\r?\n/)) {
      let P;
      (P = /^PIN (-?\d+) (-?\d+) /.exec(B)) ? (C = { x: m.x + +P[1], y: m.y + +P[2] }, m.pins.push(C)) : (P = /^PINATTR SpiceOrder (\d+)$/.exec(B)) ? C.order = +P[1] : (P = /^SYMATTR Prefix (\S+)$/.exec(B)) && (m.prefix = P[1]);
    }
    m.pins.sort((B, P) => B.order - P.order);
  }
  const b = /* @__PURE__ */ new Map();
  for (const m of [...s.flatMap((T) => [T.a, T.b]), ...c, ...u.flatMap((T) => T.pins)]) b.set(xe(m), m);
  const E = new Map([...b.keys()].map((m) => [m, m])), w = (m) => (E.get(m) !== m && E.set(m, w(E.get(m))), E.get(m)), p = (m, T) => {
    E.set(w(m), w(T));
  };
  for (const m of s) {
    if (m.a.x !== m.b.x && m.a.y !== m.b.y) throw Error("ASC contains a diagonal wire.");
    for (const [T, C] of b) qt(C, m) && p(xe(m.a), T);
  }
  const y = /* @__PURE__ */ new Map();
  for (const m of c) {
    const T = w(xe(m));
    if (y.has(T) && y.get(T).toLowerCase() !== m.name.toLowerCase()) throw Error("ASC has a short between " + y.get(T) + " and " + m.name);
    y.set(T, m.name);
  }
  for (const m of u) for (const T of m.pins)
    if (T.node = y.get(w(xe(T))), !T.node) throw Error("ASC has an unnamed/disconnected pin on " + m.ref);
  const R = u.map((m) => [m.ref, ...m.pins.map((T) => T.node), m.value].join(" "));
  return { symbols: u, wires: s, flags: c, directives: f, netlist: ["* Viewer ASC round trip", ...R, ...f, ".end"].join(`
`) };
}
function Wt(o, n, s) {
  const c = Xt(o, n), u = s.components.filter((h) => !h.directive);
  if (c.symbols.length !== u.length) throw Error("ASC lost or duplicated symbols.");
  let f = 0;
  for (const h of u) {
    const b = c.symbols.find((E) => E.ref === h.ref);
    if (!b || b.value !== h.value || b.prefix !== (h.prefix || h.kind) || JSON.stringify(b.pins.map((E) => E.node)) !== JSON.stringify(h.nodes)) throw Error("ASC component/pin round-trip mismatch: " + h.id);
    f += b.pins.length;
  }
  for (const h of s.components.filter((b) => b.directive)) if (!c.directives.includes(h.line)) throw Error("ASC lost directive device " + h.id);
  return { verified: !0, symbols: u.length, directiveDevices: s.components.length - u.length, pins: f, wires: c.wires.length, namedNets: new Set(c.flags.map((h) => h.name)).size };
}
const zt = (o) => o.x + "," + o.y, ot = (o) => Math.round(o * 1e3) / 1e3, pt = new Map(Array.from({ length: 256 }, (o, n) => [new TextDecoder("windows-1252").decode(new Uint8Array([n])), n]));
function rt(o) {
  const n = [];
  for (const s of o) {
    const c = pt.get(s);
    if (c === void 0) throw Error("LTspice export cannot encode " + s + " (U+" + s.codePointAt(0).toString(16) + ") in Windows-1252.");
    n.push(c);
  }
  return new Uint8Array(n);
}
const gt = (o) => [...String(o)].map((n) => pt.has(n) ? n : n === "⏚" ? "GND" : "[U+" + n.codePointAt(0).toString(16) + "]").join(""), Ae = (o) => String(o).replace(/[\r\n]/g, " ");
function it(o) {
  const n = [...new Set(o.map(ot))].sort((u, f) => u - f), s = /* @__PURE__ */ new Map();
  let c = -1 / 0;
  for (const u of n) {
    const f = Math.max(c + 16, Math.round(u * 2 / 16) * 16 + 64);
    s.set(u, f), c = f;
  }
  return (u) => {
    const f = s.get(ot(u));
    if (f === void 0) throw Error("Missing layout coordinate.");
    return f;
  };
}
function Ht(o, n, s, c) {
  const u = c.x(o.x), f = c.y(o.y), h = c.x(o.x + o.width) - u, b = c.y(o.y + o.height) - f, E = o.ports.map((R) => ({ ...R, x: c.x(R.x) - u, y: c.y(R.y) - f })), w = ["Version 4", "SymbolType CELL"], p = (R, m) => w.push(`LINE Normal ${Math.round(R.x)} ${Math.round(R.y)} ${Math.round(m.x)} ${Math.round(m.y)}`), y = E.length === 2 && ["R", "C", "L", "D", "V", "I", "B"].includes(n.kind);
  if (y) {
    const R = ["D", "V", "I", "B"].includes(n.kind) ? [E.find((v) => v.pin === "+") || E[0], E.find((v) => v.pin === "-") || E[1]] : E, [m, T] = R, C = Math.abs(m.x - T.x) < 0.1, B = { x: (m.x + T.x) / 2, y: (m.y + T.y) / 2 }, P = Math.abs(C ? T.y - m.y : T.x - m.x), F = Math.min(32, P / 4), j = Math.sign(C ? T.y - m.y : T.x - m.x), l = (v, N) => C ? { x: B.x + N, y: B.y + v * j } : { x: B.x + v * j, y: B.y + N };
    if (p(m, l(-F, 0)), p(l(F, 0), T), n.kind === "C")
      p(l(-6, -20), l(-6, 20)), p(l(6, -20), l(6, 20)), p(l(-F, 0), l(-6, 0)), p(l(6, 0), l(F, 0));
    else if (n.kind === "R" || n.kind === "B" && /^\s*R\s*=/i.test(n.value)) {
      const v = [[-F, 0], [-F + 6, 0], [-F + 12, -12], [-F + 22, 12], [-F + 32, -12], [F - 6, 0], [F, 0]];
      for (let N = 1; N < v.length; N++) p(l(...v[N - 1]), l(...v[N]));
    } else if (n.kind === "L") {
      let v = l(-F, 0);
      for (let N = 0; N < 4; N++) for (let D = 1; D <= 8; D++) {
        const I = l(-F + (N + D / 8) * F / 2, 16 * Math.sin(D * Math.PI / 8));
        p(v, I), v = I;
      }
    } else n.kind === "D" ? (p(l(-F, 0), l(-12, 0)), p(l(12, 0), l(F, 0)), p(l(-12, -18), l(-12, 18)), p(l(-12, 18), l(12, 0)), p(l(12, 0), l(-12, -18)), p(l(12, -18), l(12, 18))) : (w.push(`CIRCLE Normal ${Math.round(B.x - 24)} ${Math.round(B.y - 24)} ${Math.round(B.x + 24)} ${Math.round(B.y + 24)}`), p(l(-F, 0), l(-24, 0)), p(l(24, 0), l(F, 0)), n.kind === "I" || n.kind === "B" && /^\s*(?:I|P)\s*=/i.test(n.value) ? (p(l(-12, 0), l(12, 0)), p(l(12, 0), l(4, -7)), p(l(12, 0), l(4, 7))) : (p(l(-12, -6), l(-12, 6)), p(l(-18, 0), l(-6, 0)), p(l(12, -6), l(12, 6))));
  } else {
    w.push(`RECTANGLE Normal 16 16 ${Math.max(32, h - 16)} ${Math.max(32, b - 16)}`);
    for (const m of E) {
      const T = { x: Math.max(16, Math.min(h - 16, m.x)), y: Math.max(16, Math.min(b - 16, m.y)) };
      p(m, T), w.push(`TEXT ${Math.round(T.x + 4)} ${Math.round(T.y + 4)} Left 1 ${Ae(gt(n.block?.ports.find((C) => C.pin === m.pin)?.label || n.pinLabels?.[Object.keys(n.terminals).indexOf(m.pin)] || m.pin))}`);
    }
  }
  y && Math.abs(E[0].x - E[1].x) < 0.1 ? w.push(`WINDOW 0 ${Math.round(E[0].x + 40)} 24 Left 2`, `WINDOW 3 ${Math.round(E[0].x + 40)} 56 Left 2`) : y ? w.push(`WINDOW 0 ${Math.round(h / 2)} 16 Center 2`, `WINDOW 3 ${Math.round(h / 2)} 40 Center 2`) : w.push("WINDOW 0 24 32 Left 2", "WINDOW 3 24 64 Left 2"), w.push("SYMATTR Prefix " + (s.prefix || s.kind));
  for (const [R, m] of s.pins.entries()) {
    const T = E.find((C) => C.pin === m);
    if (!T) throw Error("ASC symbol missing pin " + n.name + "." + m);
    w.push(`PIN ${T.x} ${T.y} NONE 0`, "PINATTR PinName " + Ae(m), "PINATTR SpiceOrder " + (R + 1));
  }
  return w.join(`\r
`) + `\r
`;
}
function Kt({ tree: o, circuit: n, drawing: s, source: c = "", libraries: u = {} }) {
  if (!s) throw Error("ASC export requires a conventional layout. Enable Circuit layout rules and generate again.");
  const f = $t(o, n), h = new Map(n.components.map((_) => [_.name, _]));
  if (s.components.length !== h.size || s.components.some((_) => !h.has(_.id) || _.ports.some((O) => n.nodes[h.get(_.id).terminals[O.pin]]?.bit !== O.bit))) throw Error("ASC: stale layout or mismatched pin/net mapping. Generate again.");
  const b = [], E = [], w = (_) => {
    b.push(_.x), E.push(_.y);
  };
  for (const _ of s.components)
    w(_), w({ x: _.x + _.width, y: _.y + _.height }), _.ports.forEach(w);
  s.segments.forEach((_) => {
    w(_.a), w(_.b);
  });
  const p = { x: it(b), y: it(E) }, y = (_) => ({ x: p.x(_.x), y: p.y(_.y) }), R = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map();
  for (const _ of s.components) for (const O of _.ports)
    m.has(O.bit) || m.set(O.bit, []), m.get(O.bit).push(O);
  for (const _ of s.segments)
    R.has(_.bit) || R.set(_.bit, []), R.get(_.bit).push(_);
  const T = [];
  for (const [_, O] of m) {
    const G = Gt(R.get(_) || [], O);
    for (const $ of G.segments) T.push({ bit: _, a: y($.a), b: y($.b) });
  }
  const C = Math.max(...b.map(p.x)), B = Math.max(...E.map(p.y)), P = ["Version 4", `SHEET 1 ${C + 256} ${B + 512}`], F = /* @__PURE__ */ new Map(), j = {}, l = { version: 1, focus: n.focus, topology: n.topology.signature, components: [], nodes: [], warnings: f.warnings }, v = (_, O) => {
    const G = zt(_);
    if (F.has(G) && F.get(G) !== O) throw Error("ASC grid would short two nets at " + G);
    F.set(G, O);
  }, N = /* @__PURE__ */ new Set();
  for (const _ of s.components) {
    const O = h.get(_.id);
    if (!O) throw Error("Layout snapshot no longer matches circuit.");
    for (const G of _.ports) {
      const $ = f.node(O.terminals[G.pin]);
      N.has($) || (v(y(G), $), N.add($));
    }
  }
  for (const _ of T) P.push(`WIRE ${_.a.x} ${_.a.y} ${_.b.x} ${_.b.y}`);
  for (const [_, O] of F) P.push("FLAG " + _.replace(",", " ") + " " + O);
  let D = 0;
  const I = /* @__PURE__ */ new Map();
  for (const _ of s.components) {
    const O = h.get(_.id);
    if (O.synthetic) continue;
    const G = f.cards.get(O.name);
    if (G.directive) {
      P.push(`TEXT ${p.x(_.x)} ${p.y(_.y)} Left 2 !${Ae(G.line)}`), l.components.push({ id: O.name, ...G, directive: !0 });
      continue;
    }
    const $ = Ht(_, O, G, p);
    let r = I.get($);
    r || (r = "cv_symbol_" + D++, I.set($, r), j[r + ".asy"] = rt($)), P.push(`SYMBOL ${r} ${p.x(_.x)} ${p.y(_.y)} R0`, "SYMATTR InstName " + G.ref, "SYMATTR Value " + Ae(G.value)), l.components.push({ id: O.name, ...G, symbol: r, ports: _.ports.map((g) => ({ pin: g.pin, ...y(g), node: f.node(O.terminals[g.pin]) })) });
  }
  const L = [...f.directives, ...f.library];
  if (L.some((_) => _.includes("\\n"))) throw Error("ASC export: a literal backslash-n in directive text cannot be represented safely. Use forward slashes for file paths.");
  const i = [c, ...Object.values(u)].flatMap((_) => _.split(/\r?\n/).filter((O) => /^\s*\*/.test(O))).map((_) => gt(_).replaceAll("\\", "/").replace(/^(\s*\*\s*)@layout\b/i, "$1source @layout"));
  (L.length || i.length) && P.push(`TEXT 64 ${B + 160} Left 2 !` + [...L, ...i].map((_) => _.replace(/\r?\n/g, "\\n")).join("\\n"));
  const H = P.join(`\r
`) + `\r
`;
  l.nodes = [...f.nodeNames].map(([_, O]) => ({ original: _, exported: O })), l.leaves = [...f.expected, ...n.components.filter((_) => !_.synthetic && _.kind !== "X").map((_) => ({ original: _.name, scope: "", ...f.cards.get(_.name) }))], l.blocks = [...f.blockRefs].map(([_, O]) => ({ original: _, ref: O, ltspiceRef: "X§" + O }));
  const Y = Wt(H, j, l);
  l.audit = Y, j["spice-schematic.asc"] = rt(H), j["manifest.json"] = he(JSON.stringify(l, null, 2)), j["source.cir"] = he(c);
  for (const [_, O] of Object.entries(u)) {
    const G = _.replaceAll("\\", "/").split("/").filter(($) => $ && $ !== "." && $ !== "..").join("/");
    G && (j["source-libraries/" + G] = he(O));
  }
  return j["README.txt"] = he(`Extract ALL files into one folder, then open spice-schematic.asc in LTspice.
The .asy files are locally generated symbols and are required by the ASC.
Positions and routes reuse the selected viewer layout, mapped monotonically onto a 16-unit grid.
manifest.json contains original/exported names, values, ports and the connectivity audit.
Collapsed blocks contain bound per-instance netlist definitions; open the instance in the viewer to export its internal layout.
source.cir retains the input and vendor notices. source-libraries/ retains uploaded library texts.
Simulation behavior depends on LTspice model support; connectivity validation is not a simulation result.
` + f.warnings.join(`
`)), { asc: H, ascBytes: j["spice-schematic.asc"], zip: Lt(j, { level: 6 }), files: j, manifest: l };
}
export {
  Kt as exportAsc,
  rt as ltspiceBytes
};
