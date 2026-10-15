/* cs-lottie-icons.js – Clean Service Scaramuzzo AG
   33 animierte Lottie-Icons in den Hausfarben. Erzeugt die Lottie-JSONs direkt im Code.
   Nutzung: lottie-web laden, dann CS_LOTTIE.play(element, 'check').
   Als ES-Modul: am Ende "export const CS_ICONS = CS_LOTTIE.icons; export const playIcon = CS_LOTTIE.play;" ergänzen. */
(function (root) {
  const COL = { T: '#2bb6b7', TD: '#1b8384', H: '#9ad3d3', E: '#bee2e9', M: '#60beb3', A: '#71b6c6', B: '#98c2d1', W: '#ffffff', R: '#c8554b', O: '#e0a03a' };
  const C = k => { const h = COL[k] || k; const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1]; };
  const st = v => ({ a: 0, k: v });
  const E = { i: { x: [.3], y: [1] }, o: { x: [.6], y: [0] } };
  const EB = { i: { x: [.3], y: [1.5] }, o: { x: [.5], y: [0] } };
  const EIO = { i: { x: [.5], y: [1] }, o: { x: [.5], y: [0] } };
  const LIN = { i: { x: [1], y: [1] }, o: { x: [0], y: [0] } };
  const kf = arr => ({ a: 1, k: arr.map(([t, s, e], j) => j < arr.length - 1 ? Object.assign({ t, s }, e || E) : { t, s }) });
  const val = v => (v && v.a === 1) ? v : st(v);
  const tr = (o = {}) => Object.assign({ ty: 'tr', p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) }, o);
  const G = (items, t) => ({ ty: 'gr', it: [...items, tr(t)] });
  const el = (w, h, x = 0, y = 0) => ({ ty: 'el', p: st([x, y]), s: st([w, h]), d: 1 });
  const rc = (w, h, r = 0, x = 0, y = 0) => ({ ty: 'rc', p: st([x, y]), s: st([w, h]), r: st(r), d: 1 });
  const pth = (v, c = false, i, o) => ({ ty: 'sh', ks: st({ i: i || v.map(() => [0, 0]), o: o || v.map(() => [0, 0]), v, c }) });
  const F = (c, op = 100) => ({ ty: 'fl', c: st(C(c)), o: val(op), r: 1 });
  const S = (c, w = 5) => ({ ty: 'st', c: st(C(c)), o: st(100), w: st(w), lc: 2, lj: 2 });
  const Tm = (s, e, m = 1) => ({ ty: 'tm', s: val(s), e: val(e), o: st(0), m });
  const draw = (t0, t1) => Tm(0, kf([[t0, [0]], [t1, [100]]]));
  const P = (x, y) => st([60 + x, 60 + y, 0]);
  const pop = (t0, t1 = t0 + 22) => kf([[t0, [0, 0, 100], EB], [t1, [100, 100, 100]]]);
  const fade = (t0, t1) => kf([[t0, [0]], [t1, [100]]]);
  const star4 = r => pth([[0, -r], [r * .28, -r * .28], [r, 0], [r * .28, r * .28], [0, r], [-r * .28, r * .28], [-r, 0], [-r * .28, -r * .28]], true);
  const star5 = (R, r) => pth(Array.from({ length: 10 }, (_, k) => { const a = (-90 + 36 * k) * Math.PI / 180, q = k % 2 ? r : R; return [+(Math.cos(a) * q).toFixed(2), +(Math.sin(a) * q).toFixed(2)]; }), true);

  function icon(op, layers) {
    return { v: '5.7.4', fr: 60, ip: 0, op, w: 120, h: 120, nm: 'cs', ddd: 0, assets: [],
      layers: layers.map((L, i) => ({ ddd: 0, ind: i + 1, ty: 4, nm: 'L' + (i + 1), sr: 1,
        ks: Object.assign({ o: st(100), r: st(0), p: st([60, 60, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) }, L.k || {}),
        ao: 0, shapes: L.s, ip: 0, op, st: 0, bm: 0 })) };
  }
  const L = (s, k) => ({ s, k });
  const bg = loop => L([G([el(96, 96), F('E', 55)])], loop ? {} : { s: pop(0, 20) });
  const twinkle = (x, y, r, c, t0, d = 40) => L([G([star4(r), F(c)])], { p: P(x, y),
    s: kf([[t0, [0, 0, 100]], [t0 + d / 2, [100, 100, 100], EIO], [t0 + d, [0, 0, 100]]]), r: kf([[t0, [0]], [t0 + d, [90]]]) });
  const sparkleEnd = (x, y, r, c, t0) => L([G([star4(r), F(c)])], { p: P(x, y),
    s: kf([[t0, [0, 0, 100], EB], [t0 + 14, [115, 115, 100], EIO], [t0 + 28, [100, 100, 100]]]) });
  const shake = t0 => kf([[t0, [0], EIO], [t0 + 6, [-10], EIO], [t0 + 12, [8], EIO], [t0 + 18, [-4], EIO], [t0 + 24, [0]]]);

  const I = {};

  /* ---------- Status ---------- */
  I.check = icon(90, [
    L([G([pth([[-17, 1], [-5, 13], [18, -11]]), draw(22, 48), S('W', 8)])]),
    L([G([el(78, 78), F('T')])], { s: pop(0, 26) }),
    L([G([el(78, 78), S('H', 4)])], { s: kf([[18, [100, 100, 100]], [70, [146, 146, 100]]]), o: kf([[18, [100]], [70, [0]]]) })
  ]);
  I.error = icon(90, [
    L([G([pth([[-13, -13], [13, 13]]), draw(20, 34), S('W', 8)]), G([pth([[13, -13], [-13, 13]]), draw(28, 42), S('W', 8)])], { r: shake(46) }),
    L([G([el(78, 78), F('R')])], { s: pop(0, 26), r: shake(46) })
  ]);
  I.warning = icon(90, [
    L([G([el(9, 9), F('W')])], { p: P(0, 17), s: pop(36, 52) }),
    L([G([pth([[0, -11], [0, 6]]), draw(22, 38), S('W', 8)])]),
    L([G([pth([[0, -30], [33, 26], [-33, 26]], true), F('O'), S('O', 10)])], { p: P(0, 1), s: pop(0, 26), r: shake(54) })
  ]);
  I.info = icon(90, [
    L([G([el(10, 10), F('W')])], { p: P(0, -15), s: pop(18, 34) }),
    L([G([pth([[0, -3], [0, 17]]), draw(26, 42), S('W', 8)])]),
    L([G([el(78, 78), F('A')])], { s: pop(0, 26) })
  ]);
  I.loader = icon(80, [
    L([G([el(70, 70), Tm(kf([[0, [0], EIO], [40, [0], EIO], [80, [100]]]), kf([[0, [2], EIO], [40, [80], EIO], [80, [100]]])), S('T', 9)])],
      { r: kf([[0, [0], LIN], [80, [360]]]) }),
    L([G([el(70, 70), S('E', 9)])])
  ]);
  I.shield = icon(90, [
    L([G([pth([[-11, 0], [-3, 8], [12, -8]]), draw(24, 44), S('W', 7)])], { p: P(0, 1) }),
    L([G([pth([[0, -30], [26, -20], [0, 30], [-26, -20]], true, [[0, 0], [0, 0], [18, -10], [0, 24]], [[0, 0], [0, 24], [-18, -10], [0, 0]]), F('T'), S('T', 6)])], { s: pop(0, 26) }),
    L([G([pth([[0, -30], [26, -20], [0, 30], [-26, -20]], true, [[0, 0], [0, 0], [18, -10], [0, 24]], [[0, 0], [0, 24], [-18, -10], [0, 0]]), S('H', 4)])],
      { s: kf([[20, [100, 100, 100]], [70, [140, 140, 100]]]), o: kf([[20, [100]], [70, [0]]]) })
  ]);

  /* ---------- Kommunikation & Termine ---------- */
  I.sent = icon(90, [
    L([G([pth([[-30, 0], [30, -26], [10, 28], [-2, 8]], true), S('T', 5)]), G([pth([[-2, 8], [30, -26]]), S('T', 5)])],
      { p: kf([[0, [28, 94, 0]], [34, [58, 60, 0]]]), o: fade(0, 12), r: kf([[34, [0], EIO], [54, [-6], EIO], [74, [0]]]) }),
    L([G([pth([[-46, 30], [-26, 20]]), Tm(kf([[26, [0]], [58, [100]]]), kf([[14, [0]], [40, [100]]])), S('H', 4)]),
       G([pth([[-40, 44], [-24, 36]]), Tm(kf([[32, [0]], [64, [100]]]), kf([[20, [0]], [46, [100]]])), S('H', 4)])]),
    bg()
  ]);
  I.mail = icon(90, [
    L([G([el(16, 16), F('M')])], { p: P(28, -22), s: pop(40, 60) }),
    L([G([pth([[-28, -17], [0, 4], [28, -17]]), draw(22, 42), S('T', 5)]), G([rc(58, 42, 6), S('T', 5)])], { s: pop(6, 28) }),
    bg()
  ]);
  const bellShape = pth([[-24, 12], [0, -24], [24, 12]], true, [[0, 0], [-18, 0], [-4, -8]], [[4, -8], [18, 0], [0, 0]]);
  I.bell = icon(90, [
    L([G([pth([[36, -14], [42, -4]]), draw(24, 38), S('H', 4)]), G([pth([[-36, -14], [-42, -4]]), draw(24, 38), S('H', 4)])], { o: kf([[24, [100]], [60, [100]], [80, [0]]]) }),
    L([G([el(6, 6, 0, -28), F('T')]), G([el(10, 10, 0, 20), F('T')]), G([pth([[-28, 12], [28, 12]]), S('T', 5)]), G([bellShape, S('T', 5)])],
      { a: st([0, -28, 0]), p: st([60, 33, 0]), s: pop(0, 18), r: kf([[14, [0], EIO], [22, [16], EIO], [32, [-12], EIO], [42, [8], EIO], [52, [-4], EIO], [62, [0]]]) }),
    bg()
  ]);
  const calendar = [G([pth([[-14, -28], [-14, -18]]), S('T', 5)]), G([pth([[14, -28], [14, -18]]), S('T', 5)]), G([pth([[-28, -10], [28, -10]]), S('T', 5)]), G([rc(58, 50, 7, 0, 2), S('T', 5)])];
  I.calendar = icon(90, [
    L([G([pth([[-11, 9], [-3, 17], [13, 1]]), draw(28, 48), S('M', 6)])]),
    L(calendar, { s: pop(4, 26) }),
    bg()
  ]);
  I.reschedule = icon(90, [
    L([G([pth([[-12, 9], [9, 9]]), S('M', 5)]), G([pth([[2, 2], [10, 9], [2, 16]]), S('M', 5)])],
      { p: kf([[26, [50, 60, 0], EB], [48, [61, 60, 0]]]), o: fade(26, 34) }),
    L(calendar, { s: pop(4, 26) }),
    bg()
  ]);
  I.cancelled = icon(90, [
    L([G([pth([[-9, 1], [9, 19]]), draw(26, 38), S('R', 5)]), G([pth([[9, 1], [-9, 19]]), draw(34, 46), S('R', 5)])]),
    L(calendar, { s: pop(4, 26) }),
    bg()
  ]);
  I.clock = icon(120, [
    L([G([el(9, 9), F('T')])]),
    L([G([pth([[0, 0], [0, -21]]), S('T', 5)])], { r: kf([[0, [0], LIN], [120, [360]]]) }),
    L([G([pth([[0, 0], [12, 6]]), S('TD', 5)])]),
    L([G([pth([[0, -26], [0, -22]]), S('H', 4)]), G([pth([[26, 0], [22, 0]]), S('H', 4)]), G([pth([[0, 26], [0, 22]]), S('H', 4)]), G([pth([[-26, 0], [-22, 0]]), S('H', 4)]), G([el(64, 64), S('T', 5)])]),
    bg(true)
  ]);

  /* ---------- Reinigung ---------- */
  const dropPath = pth([[0, -30], [20, 6], [0, 26], [-20, 6]], true, [[0, 0], [0, -12], [11, 0], [0, 12]], [[0, 0], [0, 12], [-11, 0], [0, -12]]);
  I.drop = icon(120, [
    twinkle(28, -30, 9, 'M', 10), twinkle(-30, -20, 6, 'A', 45), twinkle(32, 24, 7, 'H', 78),
    L([G([el(8, 14, -7, -2), F('W', 70)]), G([dropPath, F('T')]), G([dropPath, F('H')], { p: st([6, 4]) })],
      { p: kf([[0, [60, 64, 0], EIO], [60, [60, 56, 0], EIO], [120, [60, 64, 0]]]), r: kf([[0, [-4], EIO], [60, [4], EIO], [120, [-4]]]) })
  ]);
  I.sparkle = icon(120, [
    twinkle(27, -25, 8, 'M', 10), twinkle(-27, -18, 7, 'A', 50), twinkle(23, 27, 6, 'H', 85), twinkle(-23, 25, 8, 'M', 30),
    L([G([star4(24), F('T')])], { s: kf([[0, [90, 90, 100], EIO], [60, [106, 106, 100], EIO], [120, [90, 90, 100]]]), r: kf([[0, [0], EIO], [60, [12], EIO], [120, [0]]]) }),
    bg(true)
  ]);
  const mist = (x, y, t0) => L([G([el(7, 7), F('A')])], { p: kf([[t0, [60 + 18, 60 - 21, 0]], [t0 + 30, [60 + x, 60 + y, 0]]]),
    s: kf([[t0, [0, 0, 100]], [t0 + 12, [100, 100, 100], EIO], [t0 + 30, [0, 0, 100]]]) });
  I.spray = icon(90, [
    mist(32, -30, 8), mist(35, -21, 12), mist(32, -12, 16), mist(38, -26, 40), mist(38, -16, 44),
    L([G([pth([[6, -21], [16, -21]]), S('T', 5)]), G([rc(26, 12, 3, -5, -22), S('T', 5)]), G([rc(14, 8, 2, -8, -12), S('T', 5)]), G([rc(30, 40, 7, -8, 12), F('H', 60), S('T', 5)])],
      { s: kf([[0, [100, 100, 100], EIO], [6, [97, 103, 100], EIO], [16, [100, 100, 100], EIO], [36, [100, 100, 100], EIO], [42, [97, 103, 100], EIO], [52, [100, 100, 100]]]) }),
    bg(true)
  ]);
  I.window = icon(120, [
    L([G([pth([[-12, 0], [12, 0]]), S('M', 6)]), G([pth([[0, 0], [0, 12]]), S('M', 5)])],
      { p: kf([[0, [48, 44, 0], EIO], [40, [72, 56, 0], EIO], [80, [50, 68, 0], EIO], [120, [48, 44, 0]]]), r: kf([[0, [-8], EIO], [40, [8], EIO], [80, [-6], EIO], [120, [-8]]]) }),
    L([G([pth([[-20, -6], [-8, -18]]), S('H', 4)]), G([pth([[8, 12], [20, 0]]), S('H', 4)])], { o: kf([[0, [30], EIO], [60, [100], EIO], [120, [30]]]) }),
    L([G([pth([[0, -28], [0, 28]]), S('T', 4)]), G([rc(58, 58, 6), S('T', 5)])]),
    bg(true)
  ]);
  const dust = (x, y, t0) => L([G([el(6, 6), F('B')])], { p: P(x, y), o: kf([[t0, [0], EIO], [t0 + 25, [100], EIO], [t0 + 50, [0]]]) });
  I.broom = icon(120, [
    dust(-30, 26, 0), dust(-20, 33, 20), dust(-34, 16, 45), dust(-24, 30, 70),
    L([G([pth([[-4, 16], [-10, 28]]), S('T', 3)]), G([pth([[4, 18], [0, 29]]), S('T', 3)]), G([pth([[-10, 2], [12, 10], [4, 30], [-24, 20]], true), F('H'), S('T', 5)]), G([pth([[16, -32], [0, 4]]), S('T', 5)])],
      { a: st([16, -32, 0]), p: st([74, 28, 0]), r: kf([[0, [-12], EIO], [60, [12], EIO], [120, [-12]]]) }),
    bg(true)
  ]);

  /* ---------- Kunden, Objekte, Team ---------- */
  I.home = icon(90, [
    sparkleEnd(26, -24, 8, 'M', 46),
    L([G([rc(12, 18, 3), F('H')])], { p: P(0, 17), s: pop(34, 52) }),
    L([G([pth([[-30, -2], [0, -28], [30, -2]]), draw(8, 30), S('T', 5)]), G([pth([[-22, -8], [-22, 26], [22, 26], [22, -8]]), draw(16, 40), S('T', 5)])]),
    bg()
  ]);
  const win = (x, y, t0) => L([G([rc(9, 9, 2), F('H')])], { p: P(x, y), s: pop(t0, t0 + 16) });
  I.building = icon(90, [
    win(-9, -17, 20), win(9, -17, 24), win(-9, -3, 28), win(9, -3, 32), win(-9, 11, 36), win(9, 11, 40),
    L([G([rc(46, 64, 5, 0, 2), S('T', 5)])], { s: pop(2, 24) }),
    bg()
  ]);
  const arch = (x0, x1, y, h) => pth([[x0, y], [x1, y]], false, [[0, 0], [-2, -h]], [[2, -h], [0, 0]]);
  I.team = icon(90, [
    L([G([el(20, 20, -10, -12), S('T', 5)]), G([arch(-29, 9, 26, 22), S('T', 5)])], { s: pop(14, 34) }),
    L([G([el(18, 18, 14, -16), S('A', 5)]), G([arch(1, 29, 18, 18), S('A', 5)])], { s: pop(4, 24) }),
    bg()
  ]);
  I.key = icon(90, [
    sparkleEnd(-22, -22, 7, 'M', 52),
    L([G([pth([[19, 0], [19, 8]]), S('T', 6)]), G([pth([[-4, 0], [28, 0], [28, 10]]), S('T', 6)]), G([el(24, 24, -16, 0), S('T', 6)])],
      { p: kf([[0, [24, 60, 0]], [30, [54, 60, 0]]]), o: fade(0, 14), r: kf([[30, [0], EIO], [44, [-18], EIO], [58, [0]]]) }),
    bg()
  ]);
  I.car = icon(120, [
    L([G([pth([[-48, -8], [-38, -8]]), S('H', 4)]), G([pth([[-52, 2], [-42, 2]]), S('H', 4)])], { p: kf([[0, [66, 60, 0], LIN], [60, [56, 60, 0], LIN], [61, [66, 60, 0], LIN], [120, [56, 60, 0]]]), o: kf([[0, [0]], [20, [100]], [45, [100]], [60, [0]], [61, [0]], [80, [100]], [105, [100]], [120, [0]]]) }),
    L([G([pth([[0, -4], [0, 4]]), S('T', 3)]), G([el(16, 16), F('W'), S('T', 5)])], { p: P(-18, 12), r: kf([[0, [0], LIN], [120, [720]]]) }),
    L([G([pth([[0, -4], [0, 4]]), S('T', 3)]), G([el(16, 16), F('W'), S('T', 5)])], { p: P(18, 12), r: kf([[0, [0], LIN], [120, [720]]]) }),
    L([G([pth([[-20, -6], [22, -6]]), S('T', 4)]), G([pth([[-34, 10], [-34, -4], [-20, -6], [-12, -18], [12, -18], [22, -6], [34, -2], [34, 10]], true), S('T', 5)])],
      { p: kf([[0, [60, 58, 0], EIO], [30, [60, 56, 0], EIO], [60, [60, 58, 0], EIO], [90, [60, 56, 0], EIO], [120, [60, 58, 0]]]) }),
    bg(true)
  ]);
  I.star = icon(90, [
    sparkleEnd(28, -24, 7, 'M', 42), sparkleEnd(-28, -20, 6, 'A', 50),
    L([G([star5(28, 12), F('M', kf([[26, [0]], [44, [100]]])), S('T', 5)])], { s: pop(4, 28), r: kf([[4, [-30]], [28, [0]]]) }),
    bg()
  ]);
  I.vacation = icon(120, (() => {
    const rays = Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return G([pth([[+(c * 23).toFixed(2), +(s * 23).toFixed(2)], [+(c * 31).toFixed(2), +(s * 31).toFixed(2)]]), S('T', 5)]); });
    return [
      L(rays, { r: kf([[0, [0], LIN], [120, [45]]]), s: kf([[0, [100, 100, 100], EIO], [60, [108, 108, 100], EIO], [120, [100, 100, 100]]]) }),
      L([G([el(30, 30), F('H'), S('T', 5)])]),
      bg(true)
    ];
  })());

  /* ---------- Admin & Daten ---------- */
  I.invoice = icon(90, [
    L([G([pth([[-13, -14], [13, -14]]), draw(22, 36), S('H', 5)]), G([pth([[-13, -2], [13, -2]]), draw(30, 44), S('H', 5)]), G([pth([[-13, 10], [3, 10]]), draw(38, 52), S('M', 5)])]),
    L([G([rc(48, 60, 6), S('T', 5)])], { s: pop(2, 24) }),
    bg()
  ]);
  I.paid = icon(90, [
    L([G([pth([[-11, 1], [-3, 9], [12, -7]]), draw(42, 60), S('TD', 6)])]),
    L([G([el(40, 40), S('W', 3)]), G([el(58, 58), F('H'), S('T', 5)])], { s: kf([[0, [0, 0, 100], EB], [16, [100, 100, 100], EIO], [26, [0, 100, 100], EIO], [36, [100, 100, 100]]]) }),
    bg()
  ]);
  I.search = icon(120, [
    L([G([pth([[-15, -11], [-10, -16]]), S('H', 4)]), G([pth([[7, 7], [22, 22]]), S('T', 8)]), G([el(34, 34, -6, -6), S('T', 6)])],
      { p: kf([[0, [58, 60, 0], EIO], [30, [64, 54, 0], EIO], [60, [70, 60, 0], EIO], [90, [64, 66, 0], EIO], [120, [58, 60, 0]]]) }),
    bg(true)
  ]);
  const tray = L([G([pth([[-26, 8], [-26, 24], [26, 24], [26, 8]]), S('T', 5)])]);
  I.upload = icon(120, [
    L([G([pth([[0, 12], [0, -22]]), S('M', 6)]), G([pth([[-12, -10], [0, -22], [12, -10]]), S('M', 6)])],
      { p: kf([[0, [60, 72, 0]], [45, [60, 56, 0]]]), o: kf([[0, [0]], [18, [100]], [95, [100]], [118, [0]]]) }),
    tray, bg(true)
  ]);
  I.download = icon(120, [
    L([G([pth([[0, -22], [0, 12]]), S('M', 6)]), G([pth([[-12, 0], [0, 12], [12, 0]]), S('M', 6)])],
      { p: kf([[0, [60, 44, 0]], [45, [60, 58, 0]]]), o: kf([[0, [0]], [18, [100]], [95, [100]], [118, [0]]]) }),
    tray, bg(true)
  ]);
  const bar = (x, h, c, t0) => L([G([rc(12, h, 3, 0, -h / 2), F(c)])], { p: P(x, 21), s: kf([[t0, [100, 0, 100], EB], [t0 + 22, [100, 100, 100]]]) });
  I.chart = icon(90, [
    L([G([el(8, 8), F('M')])], { p: P(26, -30), s: pop(58, 72) }),
    L([G([pth([[-24, -8], [-6, -18], [10, -14], [26, -30]]), draw(40, 60), S('M', 4)])]),
    bar(-18, 18, 'H', 8), bar(0, 30, 'A', 14), bar(18, 44, 'T', 20),
    L([G([pth([[-30, 26], [30, 26]]), S('T', 5)])]),
    bg()
  ]);
  I.empty = icon(90, [
    L([G([pth([[-8, -34], [-8, -22]]), draw(34, 46), S('H', 4)]), G([pth([[8, -34], [8, -22]]), draw(40, 52), S('H', 4)])], { o: kf([[34, [100]], [70, [100]], [88, [40]]]) }),
    L([G([pth([[-28, -12], [-36, -2]]), S('T', 5)]), G([pth([[28, -12], [36, -2]]), S('T', 5)])], { s: pop(18, 36) }),
    L([G([pth([[-28, -12], [-28, 24], [28, 24], [28, -12]], true), S('T', 5)]), G([pth([[-28, -12], [0, 0], [28, -12]]), S('T', 4)])], { s: pop(4, 26) }),
    bg()
  ]);
  I.user = icon(90, [
    sparkleEnd(24, -22, 7, 'M', 44),
    L([G([el(24, 24, 0, -12), S('T', 5)]), G([arch(-24, 24, 28, 28), S('T', 5)])], { s: pop(4, 28) }),
    bg()
  ]);

  const META = [
    ['check', 'Auftrag erfasst', 'Status', 'Jede erfolgreiche Aktion: erfasst, gespeichert, bestätigt'],
    ['error', 'Fehler', 'Status', 'Etwas hat nicht geklappt, mit Hinweis zur Lösung'],
    ['warning', 'Achtung', 'Status', 'Offene Punkte, fehlende Angaben, Fristen'],
    ['info', 'Hinweis', 'Status', 'Tipps und neutrale Informationen'],
    ['loader', 'Wird geladen', 'Status', 'Jeder Ladezustand statt Standard-Spinner'],
    ['shield', 'Qualität bestanden', 'Status', 'Qualitätskontrolle bestanden, Bericht freigegeben'],
    ['sent', 'Gesendet', 'Kommunikation', 'Offerte, Mail oder Bericht verschickt'],
    ['mail', 'Neue Nachricht', 'Kommunikation', 'Posteingang, neue Kundenanfrage'],
    ['bell', 'Benachrichtigung', 'Kommunikation', 'Erinnerungen, neue Meldungen'],
    ['calendar', 'Termin bestätigt', 'Termine', 'Reinigungstermin bestätigt, Ferien genehmigt'],
    ['reschedule', 'Termin verschoben', 'Termine', 'Reinigung umdisponiert oder verschoben'],
    ['cancelled', 'Termin abgesagt', 'Termine', 'Reinigung vom Kunden abgesagt'],
    ['clock', 'Zeiterfassung', 'Termine', 'Stempelungen, laufende Einsatzzeit'],
    ['drop', 'Reinigung läuft', 'Reinigung', 'Status «heute im Einsatz»'],
    ['sparkle', 'Sauber', 'Reinigung', 'Reinigung abgeschlossen, Abnahme erfolgt'],
    ['spray', 'Reinigungsmittel', 'Reinigung', 'Material, Bestellungen, Inventar'],
    ['window', 'Fensterreinigung', 'Reinigung', 'Leistung Fenster, Glas, Fassade'],
    ['broom', 'Unterhaltsreinigung', 'Reinigung', 'Leistung Unterhalt, laufende Reinigung'],
    ['home', 'Privatkunde', 'Kunden & Team', 'Privathaushalt, Putzfrauenservice'],
    ['building', 'Geschäftskunde', 'Kunden & Team', 'Büro, Liegenschaft, Verwaltung'],
    ['team', 'Team', 'Kunden & Team', 'Mitarbeitende, Springerteam, Zuteilung'],
    ['user', 'Profil', 'Kunden & Team', 'Kundenkonto, Mitarbeiterprofil angelegt'],
    ['key', 'Schlüssel', 'Kunden & Team', 'Schlüsselübergabe und Rückgabe'],
    ['car', 'Fahrzeug', 'Kunden & Team', 'Flottenmanagement, unterwegs zum Einsatz'],
    ['star', 'Bewertung', 'Kunden & Team', 'Kundenfeedback, Weiterempfehlung'],
    ['vacation', 'Ferien', 'Kunden & Team', 'Ferienplaner, Abwesenheiten'],
    ['invoice', 'Rechnung', 'Admin & Daten', 'Rechnung erstellt, Offerte erstellt'],
    ['paid', 'Bezahlt', 'Admin & Daten', 'Zahlung eingegangen'],
    ['search', 'Suche', 'Admin & Daten', 'Suche läuft, Ergebnisse werden gefiltert'],
    ['upload', 'Hochladen', 'Admin & Daten', 'Fotos, Dokumente, Schadenfall-Bilder hochladen'],
    ['download', 'Herunterladen', 'Admin & Daten', 'PDF-Bericht, Export, Rechnung herunterladen'],
    ['chart', 'Kennzahlen', 'Admin & Daten', 'Dashboard, Auswertung, CEO-Cockpit'],
    ['empty', 'Keine Einträge', 'Admin & Daten', 'Leerer Zustand: noch nichts erfasst']
  ];
  const LOOP = { loader: 1, clock: 1, drop: 1, sparkle: 1, spray: 1, window: 1, broom: 1, car: 1, vacation: 1, search: 1, upload: 1, download: 1 };

  const REST = { upload: 50, download: 50 }; // Standbild für Schleifen
  const rest = k => LOOP[k] ? (REST[k] || 0) : I[k].op - 1;

  function play(container, key, opts = {}) {
    const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const data = I[key]; if (!data) throw new Error('Unbekanntes Icon: ' + key);
    const loop = !!LOOP[key];
    const a = root.lottie.loadAnimation(Object.assign({ container, renderer: 'svg', loop, autoplay: !reduce, animationData: JSON.parse(JSON.stringify(data)) }, opts));
    if (reduce) a.addEventListener('DOMLoaded', () => a.goToAndStop(rest(key), true));
    return a; // beim Entfernen a.destroy() aufrufen
  }

  root.CS_LOTTIE = { icons: I, meta: META, loops: LOOP, rest, play };
})(typeof window !== 'undefined' ? window : globalThis);
