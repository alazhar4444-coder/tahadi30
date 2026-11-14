/* شوارع — لعبة مدينة مفتوحة (تصميم أصلي) */
(() => {
  'use strict';
  const AR = '٠١٢٣٤٥٦٧٨٩', nA = x => String(x).replace(/\d/g, d => AR[d]);
  const $ = s => document.querySelector(s);
  const cv = $('#cv'), ctx = cv.getContext('2d');
  const mm = $('#mm'), mctx = mm.getContext('2d');
  const light = document.createElement('canvas'), lctx = light.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; light.width = Math.ceil(W / 2); light.height = Math.ceil(H / 2);
    mm.width = 150 * DPR; mm.height = 150 * DPR;
  }
  addEventListener('resize', resize); resize();

  /* ——— أدوات ——— */
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(20261115), rnd = Math.random;
  const pick = (arr, r = rnd) => arr[Math.floor(r() * arr.length)];
  function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
    r = clamp(Math.round(r * f), 0, 255); g = clamp(Math.round(g * f), 0, 255); b = clamp(Math.round(b * f), 0, 255); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }

  /* ——— المدينة ——— */
  const N = 10, ROAD = 120, BLOCK = 400, CELL = ROAD + BLOCK, WS = N * CELL + ROAD, SIDE = 18, LO = ROAD * 0.24;
  const nodeX = i => i * CELL + ROAD / 2;
  const blocks = [];
  const SPECIAL = { '4,5': 'parking', '3,5': 'garage', '6,3': 'police', '5,6': 'mosque', '1,2': 'mosque', '7,7': 'parking', '2,2': 'parking', '8,4': 'parking', '6,8': 'park', '3,1': 'park', '5,4': 'park' };
  const ROOFS = ['#EDE6D6', '#E4D8BF', '#F3EEE3', '#D9C9A8', '#E8DCC4', '#F1E7D0', '#DCCFB6'];
  const GLASS = ['#7FA7B8', '#5E8797', '#9DB8C2', '#6C8091', '#86A0AE'];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = i * CELL + ROAD, y = j * CELL + ROAD;
    let type = SPECIAL[i + ',' + j] || (R() < 0.1 ? 'park' : 'city');
    const b = { i, j, x, y, type, bs: [], trees: [], stalls: [] };
    const down = Math.hypot(i - 4.5, j - 4.5) < 2.2;
    const lx = x + SIDE, ly = y + SIDE, L = BLOCK - SIDE * 2;
    const mk = (bx, by, bw, bh, ht, kind) => { const glass = kind === 'glass';
      const o = { x: bx, y: by, w: bw, h: bh, ht, roof: glass ? pick(GLASS, R) : pick(ROOFS, R), kind: kind || 'house', det: [] };
      const area = bw * bh, nAC = Math.floor(area / 9000) + (R() < 0.5 ? 1 : 0);
      for (let k = 0; k < nAC; k++) o.det.push({ t: R() < 0.55 || glass ? 'ac' : 'tank', x: bx + 12 + R() * (bw - 30), y: by + 12 + R() * (bh - 30) });
      if (glass && R() < 0.4) o.det.push({ t: 'heli', x: bx + bw / 2, y: by + bh / 2 });
      b.bs.push(o); return o; };
    if (type === 'city') {
      const split = R(), g = 14;
      const ht = () => down ? 0.45 + R() * 0.45 : 0.14 + R() * 0.26, kind = () => down && R() < 0.75 ? 'glass' : 'house';
      if (split < 0.25) mk(lx + 10, ly + 10, L - 20, L - 20, ht(), kind());
      else if (split < 0.55) { const s = L * (0.4 + R() * 0.2); mk(lx + 8, ly + 8, s - g, L - 16, ht(), kind()); mk(lx + s + 4, ly + 8, L - s - 12, L - 16, ht(), kind()); }
      else { const s = L / 2; for (let q = 0; q < 4; q++) mk(lx + (q % 2) * s + 8, ly + Math.floor(q / 2) * s + 8, s - 16 - R() * 20, s - 16 - R() * 20, ht(), kind()); }
    } else if (type === 'park') {
      for (let k = 0; k < 14; k++) { const tx = lx + 24 + R() * (L - 48), ty = ly + 24 + R() * (L - 48);
        if (Math.abs(tx - (x + BLOCK / 2)) < 26 || Math.abs(ty - (y + BLOCK / 2)) < 26) continue;
        if (b.trees.some(t => Math.hypot(t.x - tx, t.y - ty) < 40)) continue;
        b.trees.push({ x: tx, y: ty, r: R() < 0.5 ? 13 : 17, palm: R() < 0.55 }); }
    } else if (type === 'parking') {
      for (let row = 0; row < 2; row++) for (let k = 0; k < 7; k++) b.stalls.push({ x: lx + 30 + k * 49, y: row ? ly + L - 58 : ly + 58, a: row ? -Math.PI / 2 : Math.PI / 2 });
      b.trees.push({ x: x + BLOCK / 2, y: y + BLOCK / 2, r: 15, palm: true });
    } else if (type === 'mosque') {
      const m = mk(lx + L * 0.22, ly + L * 0.3, L * 0.56, L * 0.5, 0.22, 'mosque'); m.roof = '#F4EFE4'; m.det = [];
      const mn = mk(lx + L * 0.82, ly + L * 0.12, 22, 22, 1.1, 'minaret'); mn.roof = '#F4EFE4'; mn.det = [];
      b.trees.push({ x: lx + 40, y: ly + L - 40, r: 14, palm: true }, { x: lx + L - 40, y: ly + L - 40, r: 14, palm: true });
    } else if (type === 'garage') {
      const g = mk(lx + 10, ly + L * 0.52, L - 20, L * 0.46, 0.2, 'garage'); g.roof = '#B9BEC6'; g.det = [{ t: 'ac', x: lx + 60, y: ly + L * 0.7 }];
      b.zone = { x: lx + L * 0.25, y: ly + 6, w: L * 0.5, h: L * 0.42 };
    } else if (type === 'police') {
      const p = mk(lx + 10, ly + 10, L - 20, L * 0.45, 0.3, 'police'); p.roof = '#DCE3EA'; p.det.push({ t: 'heli', x: p.x + p.w / 2, y: p.y + p.h / 2 });
      for (let k = 0; k < 4; k++) b.stalls.push({ x: lx + 50 + k * 70, y: ly + L - 50, a: -Math.PI / 2, police: true });
    }
    blocks.push(b);
  }
  const blockAt = (bi, bj) => (bi < 0 || bj < 0 || bi >= N || bj >= N) ? null : blocks[bj * N + bi];
  const blk = t => blocks.find(b => b.type === t);
  const lamps = []; for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const cx = nodeX(i), cy = nodeX(j);
    [[-1, -1], [1, 1]].forEach(([sx, sy]) => lamps.push({ x: cx + sx * (ROAD / 2 + 8), y: cy + sy * (ROAD / 2 + 8) })); }

  function nearSolids(x, y, fn) {
    const bi = Math.floor((x - ROAD) / CELL), bj = Math.floor((y - ROAD) / CELL);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const b = blockAt(bi + di, bj + dj); if (b) fn(b); }
  }
  function circRect(px, py, r, o) {
    const qx = clamp(px, o.x, o.x + o.w), qy = clamp(py, o.y, o.y + o.h); const dx = px - qx, dy = py - qy, d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return null;
    if (d2 > 0.0001) { const d = Math.sqrt(d2); return { nx: dx / d, ny: dy / d, pen: r - d }; }
    const l = px - o.x, rr = o.x + o.w - px, t = py - o.y, bb = o.y + o.h - py, m = Math.min(l, rr, t, bb);
    return m === l ? { nx: -1, ny: 0, pen: l + r } : m === rr ? { nx: 1, ny: 0, pen: rr + r } : m === t ? { nx: 0, ny: -1, pen: t + r } : { nx: 0, ny: 1, pen: bb + r };
  }
  function collideWorld(x, y, r, cb) {
    nearSolids(x, y, b => { b.bs.forEach(o => { const h = circRect(x, y, r, o); if (h) cb(h); });
      b.trees.forEach(t => { const dx = x - t.x, dy = y - t.y, d = Math.hypot(dx, dy), rr = r + (t.palm ? 6 : 9); if (d < rr && d > 0) cb({ nx: dx / d, ny: dy / d, pen: rr - d }); }); });
    if (x < r) cb({ nx: 1, ny: 0, pen: r - x }); if (y < r) cb({ nx: 0, ny: 1, pen: r - y });
    if (x > WS - r) cb({ nx: -1, ny: 0, pen: x - WS + r }); if (y > WS - r) cb({ nx: 0, ny: -1, pen: y - WS + r });
  }
  function sidewalkPoint(minD, maxD, from) {
    for (let k = 0; k < 60; k++) {
      const b = pick(blocks); if (b.type === 'police' || b.type === 'garage') continue;
      const side = Math.floor(rnd() * 4), t = 40 + rnd() * (BLOCK - 80);
      const p = side === 0 ? { x: b.x + t, y: b.y + 8 } : side === 1 ? { x: b.x + BLOCK - 8, y: b.y + t } : side === 2 ? { x: b.x + t, y: b.y + BLOCK - 8 } : { x: b.x + 8, y: b.y + t };
      const d = from ? dist(p, from) : 0; if (!from || (d > minD && d < maxD)) return p;
    }
    return { x: blocks[0].x + 8, y: blocks[0].y + 50 };
  }

  /* ——— المركبات ——— */
  const TYPES = {
    sedan: { L: 46, Wd: 22, max: 330, acc: 270, turn: 2.7, grip: 7, hp: 100, m: 1, cols: ['#C0392B', '#2E86DE', '#F5F6FA', '#2D3436', '#8E44AD', '#16A085', '#D35400', '#B2BEC3', '#273C75'] },
    sport: { L: 46, Wd: 21, max: 450, acc: 400, turn: 3, grip: 8, hp: 90, m: 0.9, cols: ['#E84118', '#FBC531', '#00A8FF', '#4CD137', '#111'] },
    pickup: { L: 52, Wd: 24, max: 300, acc: 240, turn: 2.4, grip: 6.5, hp: 150, m: 1.4, cols: ['#F5F6FA', '#DCDDE1', '#C23616', '#2F3640'] },
    taxi: { L: 46, Wd: 22, max: 320, acc: 260, turn: 2.7, grip: 7, hp: 100, m: 1, cols: ['#FAFAFA'] },
    police: { L: 48, Wd: 22, max: 410, acc: 350, turn: 2.9, grip: 8.5, hp: 150, m: 1.2, cols: ['#F5F6FA'] },
  };
  const cars = [], peds = [], parts = [], skids = [], floats = [];
  function makeCar(type, x, y, a, color) {
    const T = TYPES[type];
    const c = { type, T, x, y, a, vx: 0, vy: 0, vf: 0, spin: 0, color: color || pick(T.cols), hp: T.hp, wreck: false, drv: null, ai: null, brake: false, hb: false, siren: false, stuck: 0, id: Math.random() };
    cars.push(c); return c;
  }
  // سيارات مصفوفة في المواقف
  blocks.forEach(b => b.stalls.forEach(s => { if (s.police || rnd() < 0.65) makeCar(s.police ? 'police' : pick(['sedan', 'sedan', 'pickup', 'sport', 'taxi']), s.x, s.y, s.a); }));

  const fwd = c => ({ x: Math.cos(c.a), y: Math.sin(c.a) });
  function circles(c) { const f = fwd(c), o = c.T.L / 2 - c.T.Wd / 2; return [[c.x + f.x * o, c.y + f.y * o], [c.x, c.y], [c.x - f.x * o, c.y - f.y * o]]; }
  function stepCar(c, thr, steer, hb, dt) {
    const T = c.T, cs = Math.cos(c.a), sn = Math.sin(c.a);
    let vf = c.vx * cs + c.vy * sn, vr = -c.vx * sn + c.vy * cs;
    if (c.wreck) { thr = 0; steer = 0; }
    c.brake = false;
    if (thr > 0) { if (vf < -10) { vf += T.acc * 2 * dt; c.brake = true; } else vf += T.acc * thr * dt * (1 - Math.max(0, vf) / T.max * 0.6); }
    else if (thr < 0) { if (vf > 10) { vf -= 620 * dt * -thr; c.brake = true; } else vf += T.acc * 0.6 * thr * dt; }
    else vf *= 1 - 0.9 * dt;
    vf = clamp(vf, -T.max * 0.35, T.max);
    if (hb) { vf *= 1 - 1.4 * dt; c.brake = true; }
    vr *= Math.exp(-(hb ? 1.6 : T.grip) * dt);
    if (Math.abs(vr) > 120 && Math.abs(vf) > 80 && rnd() < 0.7) addSkid(c);
    const sp = clamp(vf / 140, -1, 1);
    c.a += (steer * T.turn * sp * (hb ? 1.35 : 1) + c.spin) * dt; c.spin *= Math.exp(-4 * dt);
    const cs2 = Math.cos(c.a), sn2 = Math.sin(c.a);
    c.vx = cs2 * vf - sn2 * vr; c.vy = sn2 * vf + cs2 * vr; c.vf = vf;
    c.x += c.vx * dt; c.y += c.vy * dt;
    // اصطدام بالمباني
    circles(c).forEach(([px, py], k) => collideWorld(px, py, T.Wd / 2, h => {
      c.x += h.nx * h.pen; c.y += h.ny * h.pen;
      const vn = c.vx * h.nx + c.vy * h.ny;
      if (vn < 0) { c.vx -= h.nx * vn * 1.3; c.vy -= h.ny * vn * 1.3; hit(c, -vn, px, py); c.spin += (k - 1) * -(cs2 * h.ny - sn2 * h.nx) * Math.min(-vn, 300) * 0.012; }
    }));
  }
  function hit(c, imp, px, py) {
    if (imp < 70) return;
    const dmg = (imp - 70) * 0.1; c.hp -= dmg;
    if (c === game.car) { shake = Math.min(14, shake + imp / 40); sfx('crash', imp); }
    for (let k = 0; k < Math.min(8, imp / 40); k++) parts.push({ x: px, y: py, vx: (rnd() - 0.5) * 220, vy: (rnd() - 0.5) * 220, t: 0, life: 0.35, k: 'spark' });
    if (c.hp <= 0 && !c.wreck) wreck(c);
  }
  function wreck(c) {
    c.wreck = true; c.hp = 0;
    for (let k = 0; k < 18; k++) parts.push({ x: c.x, y: c.y, vx: (rnd() - 0.5) * 160, vy: (rnd() - 0.5) * 160, t: 0, life: 0.9, k: 'fire' });
    if (c === game.car) { toast('تعطّلت السيارة! انزل وابحث عن غيرها'); sfx('crash', 400); setTimeout(() => { if (game.car === c) exitCar(); }, 700); }
    if (c.drv && c.drv !== 'player') { const p = spawnPed(c.x + 20, c.y, null); p.state = 'run'; p.t = 3; c.drv = null; c.ai = null; }
  }
  function addSkid(c) {
    const f = fwd(c), r = { x: -f.y, y: f.x }, o = c.T.L * 0.32, w = c.T.Wd * 0.4;
    [-1, 1].forEach(s => skids.push({ x: c.x - f.x * o + r.x * w * s, y: c.y - f.y * o + r.y * w * s, t: 0 }));
    if (skids.length > 900) skids.splice(0, 60);
    if (c === game.car && rnd() < 0.3) parts.push({ x: c.x - f.x * o, y: c.y - f.y * o, vx: 0, vy: 0, t: 0, life: 0.8, k: 'smoke', s: 6 });
  }
  function carCar(dt) {
    for (let i = 0; i < cars.length; i++) { const a = cars[i];
      for (let j = i + 1; j < cars.length; j++) { const b = cars[j];
        if (Math.abs(a.x - b.x) > 60 || Math.abs(a.y - b.y) > 60) continue;
        const ca = circles(a), cb = circles(b), ra = a.T.Wd / 2, rb = b.T.Wd / 2;
        for (const p of ca) for (const q of cb) {
          const dx = p[0] - q[0], dy = p[1] - q[1], d = Math.hypot(dx, dy); if (d >= ra + rb || d === 0) continue;
          const nx = dx / d, ny = dy / d, pen = ra + rb - d, ma = a.T.m * (a.ai || a.drv ? 1 : 1.6), mb = b.T.m * (b.ai || b.drv ? 1 : 1.6), s = ma + mb;
          a.x += nx * pen * mb / s; a.y += ny * pen * mb / s; b.x -= nx * pen * ma / s; b.y -= ny * pen * ma / s;
          const rv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rv < 0) { const jj = -1.25 * rv / (1 / ma + 1 / mb); a.vx += jj / ma * nx; a.vy += jj / ma * ny; b.vx -= jj / mb * nx; b.vy -= jj / mb * ny;
            hit(a, -rv, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); hit(b, -rv, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
            a.spin += (rnd() - 0.5) * -rv * 0.02; b.spin += (rnd() - 0.5) * -rv * 0.02;
            if (game.car && (a === game.car || b === game.car)) { const o = a === game.car ? b : a; if (o.type === 'police' && -rv > 60) crime(1, 'اصطدمت بسيارة شرطة!'); }
          }
        }
      }
    }
  }

  /* ——— حركة المرور ——— */
  const segPts = (A, B) => { const dx = Math.sign(B[0] - A[0]), dy = Math.sign(B[1] - A[1]), rx = -dy, ry = dx, o = ROAD / 2 + 6;
    return { s: { x: nodeX(A[0]) + dx * o + rx * LO, y: nodeX(A[1]) + dy * o + ry * LO }, e: { x: nodeX(B[0]) - dx * o + rx * LO, y: nodeX(B[1]) - dy * o + ry * LO } }; };
  const nbrs = n => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [n[0] + dx, n[1] + dy]).filter(([i, j]) => i >= 0 && j >= 0 && i <= N && j <= N);
  function spawnTraffic(near) {
    for (let k = 0; k < 25; k++) {
      const A = [Math.floor(rnd() * (N + 1)), Math.floor(rnd() * (N + 1))], B = pick(nbrs(A)), sp = segPts(A, B), t = 0.1 + rnd() * 0.8;
      const p = { x: lerp(sp.s.x, sp.e.x, t), y: lerp(sp.s.y, sp.e.y, t) }, d = dist(p, near);
      if (d < 650 || d > 1300 || inView(p, 60)) continue;
      if (cars.some(c => Math.abs(c.x - p.x) < 70 && Math.abs(c.y - p.y) < 70)) continue;
      const pol = rnd() < 0.08, c = makeCar(pol ? 'police' : pick(['sedan', 'sedan', 'sedan', 'taxi', 'taxi', 'pickup', 'pickup', 'sport']), p.x, p.y, Math.atan2(B[1] - A[1], B[0] - A[0]));
      const f = fwd(c); c.vx = f.x * 120; c.vy = f.y * 120;
      c.drv = 'ai'; c.ai = { mode: pol ? 'patrol' : 'traffic', A, B, ph: 'e', tgt: sp.e, cruise: 140 + rnd() * 50, blockT: 0, ignore: 0, rev: 0 };
      return c;
    }
  }
  function blockedAhead(c) {
    const f = fwd(c), r = { x: -f.y, y: f.x };
    const chk = o => { const dx = o.x - c.x, dy = o.y - c.y, al = dx * f.x + dy * f.y, lt = dx * r.x + dy * r.y; return al > 10 && al < 78 && Math.abs(lt) < 22; };
    if (cars.some(o => o !== c && chk(o))) return true;
    if (!game.car && chk(player)) return true;
    return peds.some(p => p.state !== 'down' && chk(p));
  }
  function nextNodeToward(n, T) { let best = null, bd = 1e9; nbrs(n).forEach(m => { const d = Math.hypot(nodeX(m[0]) - T.x, nodeX(m[1]) - T.y); if (d < bd) { bd = d; best = m; } }); return best; }
  const nearestNode = p => [clamp(Math.round((p.x - ROAD / 2) / CELL), 0, N), clamp(Math.round((p.y - ROAD / 2) / CELL), 0, N)];
  function aiCar(c, dt) {
    const ai = c.ai; if (c.wreck) return stepCar(c, 0, 0, false, dt);
    let tgt, cruise = ai.cruise;
    if (ai.mode === 'chase') {
      const P = game.car || player, d = dist(c, P);
      if (d < 300) { tgt = { x: P.x + (P.vx || 0) * 0.35, y: P.y + (P.vy || 0) * 0.35 }; cruise = c.T.max; }
      else { if (!ai.nav || Math.hypot(nodeX(ai.nav[0]) - c.x, nodeX(ai.nav[1]) - c.y) < 55) ai.nav = nextNodeToward(ai.nav || nearestNode(c), P); tgt = { x: nodeX(ai.nav[0]), y: nodeX(ai.nav[1]) }; cruise = c.T.max * (0.72 + game.stars * 0.05); }
    } else {
      if (dist(c, ai.tgt) < 30) {
        if (ai.ph === 'e') { const opts = nbrs(ai.B).filter(m => m[0] !== ai.A[0] || m[1] !== ai.A[1]); const C = pick(opts.length ? opts : [ai.A]); ai.A = ai.B; ai.B = C; ai.ph = 's'; ai.tgt = segPts(ai.A, ai.B).s; }
        else { ai.ph = 'e'; ai.tgt = segPts(ai.A, ai.B).e; }
      }
      tgt = ai.tgt; if (ai.ph === 's') cruise = 85;
    }
    const diff = angDiff(Math.atan2(tgt.y - c.y, tgt.x - c.x), c.a);
    let steer = clamp(diff * 2.6, -1, 1), want = cruise * (1 - Math.min(Math.abs(diff), 1.2) * 0.5);
    let thr = clamp((want - c.vf) / 60, -1, 1);
    if (ai.mode !== 'chase') {
      if (ai.ignore > 0) ai.ignore -= dt;
      else if (blockedAhead(c)) { thr = c.vf > 8 ? -1 : 0; ai.blockT += dt; if (ai.blockT > 3) { ai.ignore = 1.4; ai.blockT = 0; if (dist(c, player) < 500) sfx('horn2'); } }
      else ai.blockT = 0;
    }
    // فك التعليق
    if (Math.abs(c.vf) < 15 && thr > 0.3) ai.stuckT = (ai.stuckT || 0) + dt; else ai.stuckT = 0;
    if (ai.stuckT > 1.6) { ai.rev = 1; ai.stuckT = 0; }
    if (ai.rev > 0) { ai.rev -= dt; thr = -1; steer = -steer; }
    stepCar(c, thr, steer, false, dt);
  }

  /* ——— المشاة ——— */
  const PEDS = [{ body: '#F4F1EA', head: 'kumma' }, { body: '#F4F1EA', head: 'massar' }, { body: '#1E1E24', head: 'shayla' }, { body: '#2B2B33', head: 'shayla' }, { body: '#3867D6', head: 'hair' }, { body: '#F4F1EA', head: 'kumma' }, { body: '#20BF6B', head: 'hair' }];
  const CAPS = ['#8E44AD', '#C0392B', '#2980B9', '#16A085', '#D35400', '#F1C40F'];
  function spawnPed(x, y, b) {
    const st = pick(PEDS), p = { x, y, a: 0, b, ci: Math.floor(rnd() * 4), dir: rnd() < 0.5 ? 1 : -1, sp: 38 + rnd() * 18, state: 'walk', t: 0, look: st, cap: pick(CAPS), wt: rnd() * 6, flee: null };
    peds.push(p); return p;
  }
  const corner = (b, i) => { const o = 9; return [{ x: b.x + o, y: b.y + o }, { x: b.x + BLOCK - o, y: b.y + o }, { x: b.x + BLOCK - o, y: b.y + BLOCK - o }, { x: b.x + o, y: b.y + BLOCK - o }][i]; };
  function spawnPedNear(near) {
    for (let k = 0; k < 20; k++) {
      const b = pick(blocks), ci = Math.floor(rnd() * 4), c1 = corner(b, ci), c2 = corner(b, (ci + 1) % 4), t = rnd();
      const p = { x: lerp(c1.x, c2.x, t), y: lerp(c1.y, c2.y, t) }, d = dist(p, near);
      if (d < 450 || d > 1000 || inView(p, 40)) continue;
      const q = spawnPed(p.x, p.y, b); q.ci = (ci + 1) % 4; q.dir = 1; return q;
    }
  }
  function stepPed(p, dt) {
    p.t -= dt; let vx = 0, vy = 0;
    if (p.state === 'down') { if (p.t <= 0) { p.state = 'run'; p.t = 2.5; } return; }
    // تفادي السيارات المسرعة
    if (p.state === 'walk') for (const c of cars) { const sp = Math.hypot(c.vx, c.vy); if (sp < 90) continue;
      const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy); if (d > 80) continue;
      if ((dx * c.vx + dy * c.vy) / sp > 10) { const f = fwd(c), s = (dx * -f.y + dy * f.x) > 0 ? 1 : -1; p.flee = { x: -f.y * s, y: f.x * s }; p.state = 'dodge'; p.t = 0.45; break; } }
    if (p.state === 'dodge') { vx = p.flee.x * 190; vy = p.flee.y * 190; if (p.t <= 0) p.state = 'walk'; }
    else if (p.state === 'run') { const away = p.flee || { x: 1, y: 0 }; vx = away.x * 120; vy = away.y * 120; if (p.t <= 0) p.state = 'walk'; }
    else if (p.b) { const tg = corner(p.b, p.ci), dx = tg.x - p.x, dy = tg.y - p.y, d = Math.hypot(dx, dy);
      if (d < 6) p.ci = (p.ci + p.dir + 4) % 4; else { vx = dx / d * p.sp; vy = dy / d * p.sp; } }
    p.x += vx * dt; p.y += vy * dt; if (vx || vy) { p.a = Math.atan2(vy, vx); p.wt += dt * Math.hypot(vx, vy) / 9; }
    collideWorld(p.x, p.y, 6, h => { p.x += h.nx * h.pen; p.y += h.ny * h.pen; });
    // صدمته سيارة؟
    for (const c of cars) { const sp = Math.hypot(c.vx, c.vy); if (sp < 70) continue;
      if (circles(c).some(([cx, cy]) => Math.hypot(cx - p.x, cy - p.y) < c.T.Wd / 2 + 6)) {
        p.state = 'down'; p.t = 2.6; const f = { x: c.vx / sp, y: c.vy / sp }; p.x += f.x * 26; p.y += f.y * 26; p.a = Math.atan2(f.y, f.x); p.flee = f;
        if (c === game.car) { crime(1, 'صدمت أحد المارّة!'); shake += 4; sfx('crash', 150); } break; }
    }
  }

  /* ——— اللاعب والحالة ——— */
  const SAVE = 'shawari:save';
  let save = { money: 200, dallas: [], done: 0, best: 0, sound: true };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE)) || {}); } catch (e) {}
  const persist = () => { try { localStorage.setItem(SAVE, JSON.stringify(save)); } catch (e) {} };
  const startLot = blk('parking');
  const player = { x: startLot.x + 30, y: startLot.y + BLOCK / 2, a: 0, wt: 0, vx: 0, vy: 0 };
  const game = { clock: 0, saveT: 0, car: null, stars: 0, evade: 0, bustT: 0, time: 17.6, started: false, paused: false, mission: null, crimeCD: 0, gCD: 0, over: 0 };
  let cam = { x: player.x, y: player.y }, Z = 1, shake = 0;
  const inView = (p, m) => Math.abs(p.x - cam.x) < W / 2 / Z + m && Math.abs(p.y - cam.y) < H / 2 / Z + m;

  // الدلال المخفية
  const DR = rng(77), DALLAS = [];
  blocks.filter(b => b.type === 'park' || b.type === 'parking' || b.type === 'mosque').forEach(b => DALLAS.push({ x: b.x + 40 + DR() * (BLOCK - 80), y: b.y + 40 + DR() * (BLOCK - 80) }));
  blocks.filter(b => b.type === 'city' && b.bs.length === 4).slice(0, 20 - DALLAS.length).forEach(b => DALLAS.push({ x: b.x + BLOCK / 2, y: b.y + BLOCK / 2 }));
  DALLAS.forEach((d, i) => { d.id = i; d.got = save.dallas.includes(i);
    nearSolids(d.x, d.y, b => b.trees.forEach(t => { if (Math.hypot(t.x - d.x, t.y - d.y) < 30) d.x += 34; })); });

  // المهام
  const sw = (t, side, f) => { const b = blk(t); return side === 'n' ? { x: b.x + BLOCK * f, y: b.y + 10 } : { x: b.x + 10, y: b.y + BLOCK * f }; };
  const gb = blk('garage'), pb = blk('police');
  const HUBS = [
    { k: 'taxi', icon: '🚕', name: 'موقف التاكسي', col: '#FBBF24', ...{ x: blocks[3 * N + 6].x + BLOCK / 2, y: blocks[3 * N + 6].y + 10 } },
    { k: 'deliv', icon: '📦', name: 'مستودع التوصيل', col: '#FB923C', ...{ x: blocks[7 * N + 2].x + 10, y: blocks[7 * N + 2].y + BLOCK / 2 } },
    { k: 'race', icon: '🏁', name: 'سباق المدينة', col: '#A3E635', ...{ x: blocks[0].x + BLOCK / 2, y: blocks[0].y - 30 } },
    { k: 'garage', icon: '🔧', name: 'الكراج', col: '#60A5FA', x: gb.zone.x + gb.zone.w / 2, y: gb.zone.y + gb.zone.h / 2 },
  ];
  const STATION = { x: pb.x + BLOCK / 2, y: pb.y + BLOCK - 8 };
  const RACE = [[0, 0], [5, 0], [10, 0], [10, 4], [8, 4], [8, 8], [10, 8], [10, 10], [5, 10], [5, 6], [2, 6], [0, 10], [0, 5]].map(([i, j]) => ({ x: nodeX(i), y: nodeX(j) }));

  /* ——— الجرائم والشرطة ——— */
  function crime(n, msg) {
    if (game.crimeCD > 0) return; game.crimeCD = 1.5;
    const before = game.stars; game.stars = Math.min(5, game.stars + n); game.evade = 0;
    if (game.stars > before) { toast(msg + ' ' + '★'.repeat(game.stars)); hud.starsFlash = 1.2; }
  }
  const policeNear = r => cars.some(c => c.type === 'police' && c.drv === 'ai' && !c.wreck && dist(c, game.car || player) < r);
  function updatePolice(dt) {
    const P = game.car || player;
    const chasers = cars.filter(c => c.ai && c.ai.mode === 'chase');
    if (game.stars > 0) {
      const want = Math.min(5, game.stars + (game.stars > 2 ? 1 : 0));
      if (chasers.length < want && rnd() < dt * 1.2) {
        cars.filter(c => c.type === 'police' && c.ai && c.ai.mode === 'patrol' && dist(c, P) < 900).forEach(c => { c.ai.mode = 'chase'; c.siren = true; });
        if (chasers.length < want) { const c = spawnTraffic(P); if (c) { c.type = 'police'; c.T = TYPES.police; c.color = '#F5F6FA'; c.hp = c.T.hp; c.ai.mode = 'chase'; c.siren = true; } }
      }
      chasers.forEach(c => { c.siren = true; });
      if (policeNear(650)) game.evade = 0; else { game.evade += dt; if (game.evade > 7) { game.stars--; game.evade = 0; toast(game.stars ? 'الشرطة فقدت أثرك جزئياً' : 'نجوت من الشرطة! ✓'); } }
      // القبض
      const close = chasers.some(c => dist(c, P) < (game.car ? 52 : 44));
      const slow = game.car ? Math.hypot(game.car.vx, game.car.vy) < 30 : true;
      if (close && slow) { game.bustT += dt; if (game.bustT > (game.car ? 1.6 : 0.9)) busted(); } else game.bustT = Math.max(0, game.bustT - dt);
    } else chasers.forEach(c => { c.ai.mode = 'patrol'; c.siren = false; const A = nearestNode(c), B = pick(nbrs(A)); c.ai.A = A; c.ai.B = B; c.ai.ph = 'e'; c.ai.tgt = segPts(A, B).e; });
  }
  function busted() {
    const fine = Math.max(50, Math.round(save.money * 0.1)); save.money = Math.max(0, save.money - fine); persist();
    if (game.car) { game.car.drv = null; game.car = null; }
    game.stars = 0; game.bustT = 0; endMission(null);
    cars.filter(c => c.ai && c.ai.mode === 'chase').forEach(c => { c.siren = false; c.ai.mode = 'patrol'; });
    player.x = STATION.x; player.y = STATION.y; cam.x = player.x; cam.y = player.y;
    bigMsg('قُبض عليك', `غرامة ${nA(fine)} ر.ع`, '#60A5FA');
  }

  /* ——— الدخول والخروج ——— */
  function nearestCar(r) { let best = null, bd = r; cars.forEach(c => { if (c.wreck) return; const d = dist(c, player); if (d < bd) { bd = d; best = c; } }); return best; }
  function enterCar(c) {
    if (c.drv === 'ai') {
      const f = fwd(c), p = spawnPed(c.x - f.y * 22, c.y + f.x * 22, null); p.state = 'run'; p.t = 3; p.flee = { x: -f.y, y: f.x };
      if (c.type === 'police') crime(2, 'سرقت سيارة شرطة!'); else if (policeNear(700)) crime(1, 'الشرطة شافتك تأخذ السيارة!');
      else toast('أخذت السيارة');
    } else if (c.type === 'police') crime(2, 'سرقت سيارة شرطة!');
    c.drv = 'player'; c.ai = null; c.siren = false; game.car = c; sfx('door');
  }
  function exitCar() {
    const c = game.car; if (!c) return;
    const f = fwd(c), sides = [-1, 1];
    for (const s of sides) { const x = c.x + f.y * s * (c.T.Wd / 2 + 12), y = c.y - f.x * s * (c.T.Wd / 2 + 12); let ok = true; collideWorld(x, y, 7, () => { ok = false; }); if (ok || s === 1) { player.x = x; player.y = y; break; } }
    c.drv = null; game.car = null; sfx('door');
    if (game.mission && game.mission.k !== 'garage') endMission('خرجت من السيارة — انتهت المهمة');
  }

  /* ——— المهام ——— */
  function startMission(h) {
    if (h.k === 'taxi') { game.mission = { k: 'taxi', name: 'تاكسي', streak: 0 }; newFare(); }
    if (h.k === 'deliv') { const drops = []; let from = h; let T = 0; for (let k = 0; k < 3; k++) { const p = sidewalkPoint(900, 1900, from); T += dist(p, from) / 230 + 9; drops.push(p); from = p; }
      game.mission = { k: 'deliv', name: 'توصيل الطرود', drops, i: 0, timer: T + 6, tgt: drops[0], text: 'وصّل الطرد ١ من ٣' }; }
    if (h.k === 'race') { let L = 0; RACE.forEach((p, i) => { if (i) L += dist(p, RACE[i - 1]); }); L += dist(RACE[0], { x: h.x, y: h.y });
      game.mission = { k: 'race', name: 'سباق المدينة', i: 0, timer: Math.round(L / 300 + 10), t0: game.clock, tgt: RACE[0], text: `نقطة ١ من ${nA(RACE.length)}` }; }
    bigMsg(game.mission.name, h.k === 'taxi' ? 'أوصل الركاب قبل انتهاء الوقت' : h.k === 'deliv' ? '٣ طرود — والوقت يمشي!' : 'مرّ بكل النقاط قبل انتهاء الوقت', h.col); sfx('start');
  }
  function newFare() {
    const m = game.mission, p = sidewalkPoint(500, 1300, game.car || player);
    m.stage = 'pick'; m.tgt = p; m.timer = Math.round(dist(p, game.car || player) / 210 + 14); m.text = 'التقط الراكب';
    m.pass = spawnPed(p.x, p.y, null); m.pass.state = 'wait'; m.pass.look = { body: '#F4F1EA', head: 'kumma' };
  }
  function endMission(msg) { const m = game.mission; if (!m) return; if (m.pass) { const i = peds.indexOf(m.pass); if (i >= 0) peds.splice(i, 1); } game.mission = null; if (msg) toast(msg); }
  function pay(n, label) { save.money += n; persist(); floats.push({ x: (game.car || player).x, y: (game.car || player).y - 30, t: 0, s: `+${nA(n)} ر.ع` }); sfx('cash'); if (label) toast(label); }
  function updateMission(dt) {
    const m = game.mission, P = game.car || player, sp = game.car ? Math.hypot(game.car.vx, game.car.vy) : 0;
    if (!m) {
      HUBS.forEach(h => { if (dist(P, h) > 46) { h.near = false; return; }
        if (h.k === 'garage') return;
        if (h.near) return; h.near = true;
        if (!game.car) toast(`${h.name}: تحتاج سيارة لبدء المهمة`); else if (sp < 120) startMission(h); });
      return;
    }
    m.timer -= dt;
    if (m.timer <= 0) { endMission(null); bigMsg('انتهى الوقت', 'حاول مرة أخرى', '#F87171'); sfx('fail'); return; }
    if (m.k === 'taxi') {
      if (m.stage === 'pick' && dist(P, m.tgt) < 70 && sp < 60) {
        const i = peds.indexOf(m.pass); if (i >= 0) peds.splice(i, 1); m.pass = null;
        const d = sidewalkPoint(1100, 2400, P); m.stage = 'drop'; m.tgt = d; m.fare = Math.round(40 + dist(d, P) / 35 + m.streak * 10); m.timer = Math.round(dist(d, P) / 220 + 12); m.text = 'أوصل الراكب إلى وجهته'; toast('ركب الراكب — انطلق!'); sfx('door');
      } else if (m.stage === 'drop' && dist(P, m.tgt) < 70 && sp < 60) {
        m.streak++; pay(m.fare + Math.round(m.timer * 2), `توصيلة ${nA(m.streak)} ✓`); save.done++; newFare();
      }
    } else if (m.k === 'deliv') {
      if (dist(P, m.tgt) < 70 && sp < 70) { pay(70, `طرد ${nA(m.i + 1)} ✓`); m.i++;
        if (m.i >= m.drops.length) { pay(120 + Math.round(m.timer * 3)); save.done++; endMission(null); bigMsg('اكتمل التوصيل!', 'مكافأة إضافية للسرعة', '#FB923C'); return; }
        m.tgt = m.drops[m.i]; m.text = `وصّل الطرد ${nA(m.i + 1)} من ٣`; }
    } else if (m.k === 'race') {
      if (dist(P, m.tgt) < 75) { m.i++; sfx('cp');
        if (m.i >= RACE.length) { const t = Math.round((game.clock - m.t0) * 10) / 10, rec = !save.best || t < save.best; if (rec) save.best = t;
          pay(250 + Math.round(m.timer * 6)); save.done++; endMission(null); bigMsg(rec ? 'رقم قياسي جديد!' : 'وصلت خط النهاية!', `الزمن ${nA(t)} ثانية`, '#A3E635'); return; }
        m.tgt = RACE[m.i]; m.text = `نقطة ${nA(m.i + 1)} من ${nA(RACE.length)}`; m.timer += 2; }
    }
  }
  function updateGarage(dt) {
    game.gCD -= dt; const c = game.car; if (!c || game.gCD > 0) return;
    const z = gb.zone; if (c.x < z.x || c.x > z.x + z.w || c.y < z.y || c.y > z.y + z.h || Math.hypot(c.vx, c.vy) > 120) return;
    game.gCD = 6;
    if (!game.stars && c.hp >= c.T.hp) { toast('الكراج: سيارتك سليمة'); return; }
    const cost = game.stars ? 150 : 60;
    if (save.money < cost) { toast(`الكراج: تحتاج ${nA(cost)} ر.ع`); return; }
    save.money -= cost; persist(); c.hp = c.T.hp; c.color = pick(TYPES.sedan.cols.filter(x => x !== c.color)); const had = game.stars; game.stars = 0;
    cars.filter(x => x.ai && x.ai.mode === 'chase').forEach(x => { x.ai.mode = 'patrol'; x.siren = false; });
    bigMsg('الكراج', had ? 'لون جديد — الشرطة ما عادت تعرفك' : 'السيارة رجعت جديدة', '#60A5FA'); sfx('cash');
  }

  /* ——— الرسم ——— */
  function drawGround() {
    const vx0 = cam.x - W / 2 / Z - 20, vy0 = cam.y - H / 2 / Z - 20, vx1 = cam.x + W / 2 / Z + 20, vy1 = cam.y + H / 2 / Z + 20;
    // البحر والرمل
    ctx.fillStyle = '#1B7FA6'; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    if (vx0 < 0 || vy0 < 0 || vx1 > WS || vy1 > WS) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3;
      const tt = game.clock * 0.6;
      for (let y = Math.floor(vy0 / 60) * 60; y < vy1; y += 60) for (let x = Math.floor(vx0 / 140) * 140; x < vx1; x += 140) {
        if (x > -150 && x < WS + 150 && y > -150 && y < WS + 150) continue;
        ctx.beginPath(); ctx.arc(x + Math.sin(tt + y) * 12, y, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
      ctx.fillStyle = '#5BB5D5'; ctx.fillRect(-110, -110, WS + 220, WS + 220);
      ctx.fillStyle = '#E9D7AE'; ctx.fillRect(-70, -70, WS + 140, WS + 140);
    }
    ctx.fillStyle = '#3B3E46'; ctx.fillRect(Math.max(0, vx0), Math.max(0, vy0), Math.min(WS, vx1) - Math.max(0, vx0), Math.min(WS, vy1) - Math.max(0, vy0));
    // علامات الطريق
    const i0 = Math.max(0, Math.floor(vx0 / CELL)), i1 = Math.min(N, Math.ceil(vx1 / CELL)), j0 = Math.max(0, Math.floor(vy0 / CELL)), j1 = Math.min(N, Math.ceil(vy1 / CELL));
    ctx.setLineDash([22, 18]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    for (let j = j0; j <= j1; j++) { const y = nodeX(j); for (let i = i0; i < Math.min(N, i1 + 1); i++) { ctx.moveTo(nodeX(i) + ROAD / 2 + 4, y); ctx.lineTo(nodeX(i + 1) - ROAD / 2 - 4, y); } }
    for (let i = i0; i <= i1; i++) { const x = nodeX(i); for (let j = j0; j < Math.min(N, j1 + 1); j++) { ctx.moveTo(x, nodeX(j) + ROAD / 2 + 4); ctx.lineTo(x, nodeX(j + 1) - ROAD / 2 - 4); } }
    ctx.stroke(); ctx.setLineDash([]);
    // خطوط المشاة
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const cx = nodeX(i), cy = nodeX(j);
      for (let k = -2; k <= 2; k++) { ctx.fillRect(cx + k * 20 - 5, cy - ROAD / 2 - 2, 10, -22 + 0); ctx.fillRect(cx + k * 20 - 5, cy + ROAD / 2 + 2, 10, 22);
        ctx.fillRect(cx - ROAD / 2 - 24, cy + k * 20 - 5, 22, 10); ctx.fillRect(cx + ROAD / 2 + 2, cy + k * 20 - 5, 22, 10); } }
    // الآثار
    ctx.fillStyle = 'rgba(15,15,18,.32)'; skids.forEach(s => { if (s.x > vx0 && s.x < vx1 && s.y > vy0 && s.y < vy1) ctx.fillRect(s.x - 2.5, s.y - 2.5, 5, 5); });
    // البلوكات
    for (let j = Math.max(0, j0 - 1); j < Math.min(N, j1 + 1); j++) for (let i = Math.max(0, i0 - 1); i < Math.min(N, i1 + 1); i++) drawBlockGround(blockAt(i, j));
  }
  function drawBlockGround(b) {
    const { x, y } = b, L = BLOCK - SIDE * 2;
    ctx.fillStyle = '#B4AD9E'; ctx.fillRect(x, y, BLOCK, BLOCK);
    ctx.fillStyle = '#C8C1B2'; ctx.fillRect(x + 3, y + 3, BLOCK - 6, BLOCK - 6);
    const lx = x + SIDE, ly = y + SIDE;
    if (b.type === 'park') {
      ctx.fillStyle = '#5E9B48'; ctx.fillRect(lx, ly, L, L);
      ctx.fillStyle = '#6DAA55'; for (let k = 0; k < 6; k++) ctx.fillRect(lx + k * L / 6, ly, L / 12, L);
      ctx.fillStyle = '#D9C9A3'; ctx.fillRect(x + BLOCK / 2 - 12, ly, 24, L); ctx.fillRect(lx, y + BLOCK / 2 - 12, L, 24);
      ctx.fillStyle = '#3BA4C7'; ctx.beginPath(); ctx.arc(x + BLOCK / 2, y + BLOCK / 2, 30, 0, 7); ctx.fill(); ctx.strokeStyle = '#E8E1D3'; ctx.lineWidth = 6; ctx.stroke();
    } else if (b.type === 'parking' || b.type === 'police') {
      ctx.fillStyle = '#474A52'; ctx.fillRect(lx, ly, L, L);
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2;
      b.stalls.forEach(s => { ctx.beginPath(); const dy = s.a > 0 ? -1 : 1; ctx.moveTo(s.x - 24, s.y + dy * 30); ctx.lineTo(s.x - 24, s.y - dy * 30); ctx.moveTo(s.x + 25, s.y + dy * 30); ctx.lineTo(s.x + 25, s.y - dy * 30); ctx.stroke(); });
    } else if (b.type === 'mosque') {
      ctx.fillStyle = '#E8DFCC'; ctx.fillRect(lx, ly, L, L);
      ctx.strokeStyle = 'rgba(160,140,100,.25)'; ctx.lineWidth = 1.5; for (let k = 1; k < 10; k++) { ctx.beginPath(); ctx.moveTo(lx + k * L / 10, ly); ctx.lineTo(lx + k * L / 10, ly + L); ctx.moveTo(lx, ly + k * L / 10); ctx.lineTo(lx + L, ly + k * L / 10); ctx.stroke(); }
    } else if (b.type === 'garage') {
      ctx.fillStyle = '#8D9096'; ctx.fillRect(lx, ly, L, L);
      const z = b.zone; ctx.save(); ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); ctx.clip();
      ctx.fillStyle = '#F5C518'; for (let k = -10; k < 20; k++) { ctx.beginPath(); ctx.moveTo(z.x + k * 26, z.y); ctx.lineTo(z.x + k * 26 + 13, z.y); ctx.lineTo(z.x + k * 26 + 13 + z.h, z.y + z.h); ctx.lineTo(z.x + k * 26 + z.h, z.y + z.h); ctx.fill(); }
      ctx.fillStyle = 'rgba(60,60,66,.82)'; ctx.fillRect(z.x + 8, z.y + 8, z.w - 16, z.h - 16); ctx.restore();
    } else { ctx.fillStyle = '#D2C8B3'; ctx.fillRect(lx, ly, L, L); }
  }
  function drawShadows() {
    const sx = 0.55 * 110, sy = 0.8 * 110;
    ctx.fillStyle = 'rgba(20,18,30,.22)';
    forVisibleBlocks(b => {
      b.bs.forEach(o => { const dx = sx * o.ht, dy = sy * o.ht; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y); ctx.lineTo(o.x + o.w + dx, o.y + dy); ctx.lineTo(o.x + o.w + dx, o.y + o.h + dy); ctx.lineTo(o.x + dx, o.y + o.h + dy); ctx.lineTo(o.x, o.y + o.h); ctx.closePath(); ctx.fill(); });
      b.trees.forEach(t => { ctx.beginPath(); ctx.ellipse(t.x + 10, t.y + 14, t.r, t.r * 0.8, 0, 0, 7); ctx.fill(); });
    });
  }
  function forVisibleBlocks(fn) {
    const m = 300, i0 = Math.max(0, Math.floor((cam.x - W / 2 / Z - m - ROAD) / CELL)), i1 = Math.min(N - 1, Math.floor((cam.x + W / 2 / Z + m) / CELL));
    const j0 = Math.max(0, Math.floor((cam.y - H / 2 / Z - m - ROAD) / CELL)), j1 = Math.min(N - 1, Math.floor((cam.y + H / 2 / Z + m) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(blockAt(i, j));
  }
  function drawBuildings() {
    const list = []; forVisibleBlocks(b => b.bs.forEach(o => list.push(o)));
    list.forEach(o => { o._d = Math.hypot(o.x + o.w / 2 - cam.x, o.y + o.h / 2 - cam.y); }); list.sort((a, b) => b._d - a._d);
    const night = darkness();
    list.forEach(o => {
      const k = o.ht * 0.42, P = (px, py) => [cam.x + (px - cam.x) * (1 + k), cam.y + (py - cam.y) * (1 + k)];
      const b = [[o.x, o.y], [o.x + o.w, o.y], [o.x + o.w, o.y + o.h], [o.x, o.y + o.h]], r = b.map(p => P(p[0], p[1]));
      const wall = o.kind === 'glass' ? shade(o.roof, 0.72) : shade(o.roof, 0.8);
      const shades = [0.92, 0.72, 0.8, 0.62];
      for (let e = 0; e < 4; e++) { const a = b[e], c = b[(e + 1) % 4], ra = r[e], rc = r[(e + 1) % 4];
        ctx.fillStyle = shade(wall, shades[e]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(rc[0], rc[1]); ctx.lineTo(ra[0], ra[1]); ctx.closePath(); ctx.fill();
        // الطوابق
        const fl = Math.max(1, Math.round(o.ht * 9)); ctx.strokeStyle = o.kind === 'glass' ? 'rgba(255,255,255,.18)' : 'rgba(60,40,20,.14)'; ctx.lineWidth = 1.4; ctx.beginPath();
        for (let q = 1; q <= fl; q++) { const f = q / (fl + 1); ctx.moveTo(lerp(a[0], ra[0], f), lerp(a[1], ra[1], f)); ctx.lineTo(lerp(c[0], rc[0], f), lerp(c[1], rc[1], f)); } ctx.stroke();
        if (night > 0.25) { ctx.fillStyle = `rgba(255,214,140,${night * 0.9})`; for (let q = 1; q <= fl; q++) { const f = (q - 0.5) / (fl + 1); for (let w = 1; w < 6; w++) { if ((q * 7 + w * 3 + e) % 4 === 0) continue; const g = w / 6; ctx.fillRect(lerp(lerp(a[0], c[0], g), lerp(ra[0], rc[0], g), f) - 1.5, lerp(lerp(a[1], c[1], g), lerp(ra[1], rc[1], g), f) - 1.5, 3, 3); } } }
      }
      ctx.save(); ctx.translate(cam.x, cam.y); ctx.scale(1 + k, 1 + k); ctx.translate(-cam.x, -cam.y);
      const g = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h); g.addColorStop(0, shade(o.roof, 1.06)); g.addColorStop(1, shade(o.roof, 0.94));
      ctx.fillStyle = g; ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = shade(o.roof, 0.82); ctx.lineWidth = 4; ctx.strokeRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
      if (o.kind === 'glass') { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(o.x + 6, o.y + 6, o.w * 0.35, o.h - 12); }
      if (o.kind === 'mosque') { const cx = o.x + o.w / 2, cy = o.y + o.h / 2, dr = Math.min(o.w, o.h) * 0.3;
        const dg = ctx.createRadialGradient(cx - dr * 0.35, cy - dr * 0.35, 2, cx, cy, dr); dg.addColorStop(0, '#FFF7E0'); dg.addColorStop(0.6, '#E9C46A'); dg.addColorStop(1, '#B8892F');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, cy, dr, 0, 7); ctx.fill(); ctx.fillStyle = '#B8892F'; ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
        [[0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]].forEach(([fx, fy]) => { ctx.fillStyle = '#E9C46A'; ctx.beginPath(); ctx.arc(o.x + o.w * fx, o.y + o.h * fy, dr * 0.3, 0, 7); ctx.fill(); }); }
      if (o.kind === 'minaret') { ctx.fillStyle = '#E9C46A'; ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 8, 0, 7); ctx.fill(); }
      if (o.kind === 'garage') { ctx.fillStyle = '#2563EB'; ctx.fillRect(o.x + o.w / 2 - 70, o.y + 14, 140, 34); ctx.fillStyle = '#fff'; ctx.font = '900 24px Thmanyah'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('الكراج 🔧', o.x + o.w / 2, o.y + 32); }
      if (o.kind === 'police') { ctx.fillStyle = '#1E3A8A'; ctx.fillRect(o.x + 20, o.y + o.h - 46, 130, 32); ctx.fillStyle = '#fff'; ctx.font = '900 22px Thmanyah'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('الشرطة', o.x + 85, o.y + o.h - 30); }
      o.det.forEach(d => {
        if (d.t === 'ac') { ctx.fillStyle = '#C9CDD3'; ctx.fillRect(d.x, d.y, 16, 12); ctx.fillStyle = '#9AA0A8'; ctx.beginPath(); ctx.arc(d.x + 8, d.y + 6, 4, 0, 7); ctx.fill(); }
        else if (d.t === 'tank') { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(d.x, d.y, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#C8C8C8'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (d.t === 'heli') { ctx.strokeStyle = '#F5C518'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(d.x, d.y, 24, 0, 7); ctx.stroke(); ctx.fillStyle = '#F5C518'; ctx.font = '900 26px Thmanyah'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', d.x, d.y + 1); }
      });
      ctx.restore();
    });
  }
  function drawTrees() {
    forVisibleBlocks(b => b.trees.forEach(t => {
      const k = 0.08, x = cam.x + (t.x - cam.x) * (1 + k), y = cam.y + (t.y - cam.y) * (1 + k);
      if (t.palm) { ctx.strokeStyle = '#2F7D32'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let q = 0; q < 7; q++) { const a = q / 7 * 6.283 + t.x * 0.01, L = t.r + 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.6 - 3, x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
        ctx.fillStyle = '#8B5E34'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = '#3E7F35'; ctx.beginPath(); ctx.arc(x, y, t.r, 0, 7); ctx.fill(); ctx.fillStyle = '#4F9A42'; ctx.beginPath(); ctx.arc(x - t.r * 0.25, y - t.r * 0.25, t.r * 0.6, 0, 7); ctx.fill(); }
    }));
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawCar(c) {
    const { L, Wd } = c.T; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(-L / 2 + 3, -Wd / 2 + 4, L, Wd, 7); ctx.fill();
    const body = c.wreck ? '#3A3A3A' : c.color;
    ctx.fillStyle = body; rr(-L / 2, -Wd / 2, L, Wd, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(-L / 2 + 2, -Wd / 2 + 2, L - 4, Wd / 2 - 2, 5); ctx.fill();
    if (c.type === 'taxi' && !c.wreck) { ctx.fillStyle = '#F07B1A'; ctx.fillRect(-L / 2 + 6, -Wd / 2, L - 12, 3.5); ctx.fillRect(-L / 2 + 6, Wd / 2 - 3.5, L - 12, 3.5); }
    if (c.type === 'police' && !c.wreck) { ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-L / 2 + 4, -Wd / 2, L - 8, 4); ctx.fillRect(-L / 2 + 4, Wd / 2 - 4, L - 8, 4); }
    if (c.type === 'sport' && !c.wreck) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-L / 2 + 4, -2, L - 8, 4); }
    const pick_ = c.type === 'pickup';
    ctx.fillStyle = '#1A2230'; rr(pick_ ? 2 : 5, -Wd / 2 + 3, 9, Wd - 6, 3); ctx.fill();
    ctx.fillStyle = shade(body === '#3A3A3A' ? '#555555' : body, 0.9); rr(pick_ ? -10 : -9, -Wd / 2 + 3, pick_ ? 12 : 14, Wd - 6, 3); ctx.fill();
    ctx.fillStyle = '#1A2230'; rr(pick_ ? -13 : -15, -Wd / 2 + 4, 5, Wd - 8, 2); ctx.fill();
    if (pick_) { ctx.strokeStyle = shade(body, 0.7); ctx.lineWidth = 2; ctx.strokeRect(-L / 2 + 3, -Wd / 2 + 3, L / 2 - 14, Wd - 6); }
    if (c.type === 'taxi' && !c.wreck) { ctx.fillStyle = '#F07B1A'; ctx.fillRect(-4, -4, 7, 8); }
    if (c.type === 'police' && !c.wreck) { const f = c.siren && Math.floor(game.clock * 8) % 2; ctx.fillStyle = f ? '#3B82F6' : '#EF4444'; ctx.fillRect(-5, -Wd / 2 + 3, 5, Wd / 2 - 3); ctx.fillStyle = f ? '#EF4444' : '#3B82F6'; ctx.fillRect(-5, 0, 5, Wd / 2 - 3); }
    ctx.fillStyle = '#FFF4C2'; ctx.fillRect(L / 2 - 3, -Wd / 2 + 2, 3, 5); ctx.fillRect(L / 2 - 3, Wd / 2 - 7, 3, 5);
    ctx.fillStyle = c.brake ? '#FF3B30' : '#8B1E1E'; ctx.fillRect(-L / 2, -Wd / 2 + 2, 3, 5); ctx.fillRect(-L / 2, Wd / 2 - 7, 3, 5);
    if (c === game.car) { ctx.strokeStyle = 'rgba(163,230,53,.9)'; ctx.lineWidth = 2; rr(-L / 2 - 3, -Wd / 2 - 3, L + 6, Wd + 6, 9); ctx.stroke(); }
    ctx.restore();
    if ((c.hp < c.T.hp * 0.3 || c.wreck) && rnd() < 0.25) parts.push({ x: c.x + (rnd() - 0.5) * 10, y: c.y + (rnd() - 0.5) * 10, vx: 8, vy: -12, t: 0, life: 1.6, k: 'smoke', s: 8, dark: c.wreck });
  }
  function drawPerson(p, isPlayer) {
    ctx.save(); ctx.translate(p.x, p.y);
    if (p.state === 'down') { ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(2, 2, 11, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = p.look.body; ctx.beginPath(); ctx.ellipse(0, 0, 10, 5.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#C99B72'; ctx.beginPath(); ctx.arc(10, 0, 3.6, 0, 7); ctx.fill(); ctx.restore(); return; }
    if (isPlayer) { ctx.strokeStyle = 'rgba(163,230,53,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.stroke(); }
    ctx.rotate(p.a); const sw = Math.sin(p.wt) * 4;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(2, 3, 8, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3A3A3A'; ctx.fillRect(sw - 2, -4.5, 5, 3); ctx.fillRect(-sw - 2, 1.5, 5, 3);
    ctx.fillStyle = p.look.body; ctx.beginPath(); ctx.ellipse(0, 0, 5, 8, 0, 0, 7); ctx.fill();
    const h = p.look.head;
    if (h === 'shayla') { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = h === 'hair' ? '#2D1B10' : '#C99B72'; ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, 7); ctx.fill();
      if (h === 'kumma') { ctx.fillStyle = p.cap; ctx.beginPath(); ctx.arc(-0.5, 0, 3.3, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-0.5, 0, 1.6, 0, 7); ctx.fill(); }
      if (h === 'massar') { ctx.fillStyle = isPlayer ? '#9F1239' : p.cap; ctx.beginPath(); ctx.arc(-0.5, 0, 4.2, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-0.5, 0, 2.6, 0, 7); ctx.stroke(); } }
    ctx.restore();
  }
  function drawDalla(d) {
    const bob = Math.sin(game.clock * 3 + d.id) * 3;
    ctx.save(); ctx.translate(d.x, d.y + bob);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 26); g.addColorStop(0, 'rgba(255,215,90,.55)'); g.addColorStop(1, 'rgba(255,215,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
    ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.ellipse(0, 4, 8, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#F2C94C'; ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(4, -2); ctx.lineTo(2.5, -8); ctx.lineTo(-2.5, -8); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 3, 0, 7); ctx.fill();
    ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(7, 2); ctx.quadraticCurveTo(14, -2, 15, -9); ctx.stroke();
    ctx.beginPath(); ctx.arc(-9, 2, 4, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    ctx.restore();
  }
  function drawMarker(p, col, icon, big) {
    const t = game.clock, r = (big ? 40 : 32) + Math.sin(t * 4) * 3;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.fillStyle = col + '33'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const g = ctx.createLinearGradient(0, 0, 0, -90); g.addColorStop(0, col + 'AA'); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(-10, -90, 20, 90);
    if (icon) { ctx.font = '24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, 0, -Math.abs(Math.sin(t * 3)) * 6 - 4); }
    ctx.restore();
  }
  function darkness() { const h = game.time % 24; if (h >= 20 || h < 5) return 0.7; if (h >= 18) return (h - 18) / 2 * 0.7; if (h < 7) return (7 - h) / 2 * 0.7; return 0; }
  function drawLights(dk) {
    const s = 0.5; lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, light.width, light.height); lctx.fillStyle = `rgba(6,10,32,${dk})`; lctx.fillRect(0, 0, light.width, light.height);
    lctx.globalCompositeOperation = 'destination-out';
    const toS = (x, y) => [((x - cam.x) * Z + W / 2) * s, ((y - cam.y) * Z + H / 2) * s];
    const glow = (x, y, r, a) => { const [sx, sy] = toS(x, y), R2 = r * Z * s; if (sx < -R2 || sy < -R2 || sx > light.width + R2 || sy > light.height + R2) return;
      const g = lctx.createRadialGradient(sx, sy, 0, sx, sy, R2); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lctx.fillStyle = g; lctx.fillRect(sx - R2, sy - R2, R2 * 2, R2 * 2); };
    lamps.forEach(l => glow(l.x, l.y, 85, 0.6));
    cars.forEach(c => { if (c.wreck || !inView(c, 200)) return; const f = fwd(c); glow(c.x + f.x * 80, c.y + f.y * 80, 95, 0.85); glow(c.x + f.x * 150, c.y + f.y * 150, 70, 0.5); });
    glow((game.car || player).x, (game.car || player).y, 70, 0.4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(light, 0, 0, W * DPR, H * DPR);
    // أضواء الشرطة
    ctx.globalCompositeOperation = 'lighter';
    cars.forEach(c => { if (!c.siren || !inView(c, 100)) return; const f = Math.floor(game.clock * 8) % 2, [sx, sy] = toS(c.x, c.y).map(v => v / s * DPR);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 90 * Z * DPR); g.addColorStop(0, f ? 'rgba(59,130,246,.55)' : 'rgba(239,68,68,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 90 * Z * DPR, sy - 90 * Z * DPR, 180 * Z * DPR, 180 * Z * DPR); });
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawArrow(tg, col) {
    const sx = (tg.x - cam.x) * Z + W / 2, sy = (tg.y - cam.y) * Z + H / 2;
    if (sx > 30 && sx < W - 30 && sy > 90 && sy < H - 30) return;
    const a = Math.atan2(sy - H / 2, sx - W / 2), m = 46, ex = clamp(sx, m, W - m), ey = clamp(sy, 110, H - m - 60);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill(); ctx.restore();
    const d = Math.round(dist(tg, game.car || player) / 8);
    ctx.font = '900 13px Thmanyah'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 4;
    ctx.fillText(nA(d) + ' م', ex - Math.cos(a) * 30, ey - Math.sin(a) * 30 + 4); ctx.shadowBlur = 0;
  }

  // الخريطة المصغرة
  const MAPS = 0.05, mapImg = document.createElement('canvas'); mapImg.width = mapImg.height = Math.ceil((WS + 200) * MAPS);
  (() => { const m = mapImg.getContext('2d'), o = 100 * MAPS; m.fillStyle = '#1B6F93'; m.fillRect(0, 0, mapImg.width, mapImg.height); m.fillStyle = '#4B4F59'; m.fillRect(o, o, WS * MAPS, WS * MAPS);
    blocks.forEach(b => { m.fillStyle = b.type === 'park' ? '#4E8B3C' : b.type === 'parking' ? '#5A5E68' : b.type === 'mosque' ? '#E9C46A' : b.type === 'garage' ? '#3B82F6' : b.type === 'police' ? '#1E3A8A' : '#A9A293'; m.fillRect(o + b.x * MAPS, o + b.y * MAPS, BLOCK * MAPS, BLOCK * MAPS); }); })();
  function bfsPath(from, to) {
    const A = nearestNode(from), B = nearestNode(to), key = n => n[0] * 100 + n[1], prev = new Map([[key(A), null]]), q = [A];
    while (q.length) { const n = q.shift(); if (n[0] === B[0] && n[1] === B[1]) break; nbrs(n).forEach(m => { if (!prev.has(key(m))) { prev.set(key(m), n); q.push(m); } }); }
    const path = []; let cur = B; while (cur) { path.unshift(cur); cur = prev.get(key(cur)); } return path;
  }
  let routeCache = { t: 0, path: [] };
  function drawMinimap(tg) {
    const S = 150, c = S / 2, sc = 0.07 / MAPS, P = game.car || player;
    mctx.setTransform(DPR, 0, 0, DPR, 0, 0); mctx.clearRect(0, 0, S, S);
    mctx.save(); mctx.beginPath(); mctx.arc(c, c, c - 3, 0, 7); mctx.clip();
    mctx.fillStyle = '#1B6F93'; mctx.fillRect(0, 0, S, S);
    const ox = c - (P.x + 100) * MAPS * sc, oy = c - (P.y + 100) * MAPS * sc;
    mctx.drawImage(mapImg, ox, oy, mapImg.width * sc, mapImg.height * sc);
    const M = p => [c + (p.x - P.x) * 0.07, c + (p.y - P.y) * 0.07];
    if (tg) { if (game.clock - routeCache.t > 1) routeCache = { t: game.clock, path: bfsPath(P, tg) };
      mctx.strokeStyle = '#C084FC'; mctx.lineWidth = 4; mctx.lineJoin = 'round'; mctx.beginPath(); mctx.moveTo(...M(P)); routeCache.path.forEach(n => mctx.lineTo(...M({ x: nodeX(n[0]), y: nodeX(n[1]) }))); mctx.lineTo(...M(tg)); mctx.stroke(); }
    const dot = (p, col, r) => { const [x, y] = M(p); mctx.fillStyle = col; mctx.beginPath(); mctx.arc(clamp(x, 8, S - 8), clamp(y, 8, S - 8), r, 0, 7); mctx.fill(); mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.5; mctx.stroke(); };
    if (!game.mission) HUBS.forEach(h => dot(h, h.col, 5));
    DALLAS.forEach(d => { if (!d.got && dist(d, P) < 900) dot(d, '#FCD34D', 3); });
    cars.forEach(x => { if (x.siren) dot(x, Math.floor(game.clock * 6) % 2 ? '#EF4444' : '#3B82F6', 3.5); });
    if (tg) dot(tg, '#C084FC', 6);
    mctx.restore();
    mctx.save(); mctx.translate(c, c); mctx.rotate((game.car || player).a + Math.PI / 2); mctx.fillStyle = '#A3E635'; mctx.strokeStyle = '#111'; mctx.lineWidth = 1.5;
    mctx.beginPath(); mctx.moveTo(0, -8); mctx.lineTo(6, 6); mctx.lineTo(0, 3); mctx.lineTo(-6, 6); mctx.closePath(); mctx.fill(); mctx.stroke(); mctx.restore();
    mctx.strokeStyle = 'rgba(255,255,255,.85)'; mctx.lineWidth = 3; mctx.beginPath(); mctx.arc(c, c, c - 3, 0, 7); mctx.stroke();
    mctx.fillStyle = '#fff'; mctx.font = '900 12px Thmanyah'; mctx.textAlign = 'center'; mctx.fillText('ش', c, 14);
  }

  /* ——— الصوت ——— */
  let AC = null, eng = null, sir = null;
  function initAudio() {
    if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = 50; f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = 0;
    o.connect(f); f.connect(g); g.connect(AC.destination); o.start(); eng = { o, g, f };
    const s = AC.createOscillator(), sg = AC.createGain(); s.type = 'triangle'; s.frequency.value = 700; sg.gain.value = 0; s.connect(sg); sg.connect(AC.destination); s.start(); sir = { o: s, g: sg };
  }
  function sfx(k, v) {
    if (!AC || !save.sound) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    const env = (a, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.05); };
    if (k === 'horn' || k === 'horn2') { o.type = 'square'; o.frequency.value = k === 'horn' ? 392 : 330; env(k === 'horn' ? 0.12 : 0.04, 0.35); }
    else if (k === 'crash') { o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25); env(Math.min(0.3, (v || 100) / 1200), 0.28); }
    else if (k === 'cash') { o.type = 'triangle'; o.frequency.setValueAtTime(880, t); o.frequency.setValueAtTime(1320, t + 0.08); env(0.15, 0.3); }
    else if (k === 'cp') { o.type = 'triangle'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + 0.06); env(0.14, 0.2); }
    else if (k === 'start') { o.type = 'triangle'; o.frequency.setValueAtTime(523, t); o.frequency.setValueAtTime(659, t + 0.1); o.frequency.setValueAtTime(784, t + 0.2); env(0.14, 0.45); }
    else if (k === 'fail') { o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.5); env(0.1, 0.5); }
    else if (k === 'door') { o.type = 'square'; o.frequency.value = 90; env(0.08, 0.08); }
    else if (k === 'coin') { o.type = 'triangle'; o.frequency.setValueAtTime(988, t); o.frequency.setValueAtTime(1480, t + 0.07); env(0.15, 0.3); }
  }
  function updateAudio() {
    if (!AC || !eng) return; const on = save.sound && game.started && !game.paused;
    const c = game.car, sp = c ? Math.abs(c.vf) : 0;
    eng.g.gain.setTargetAtTime(on && c ? 0.05 + sp / c.T.max * 0.05 : 0, AC.currentTime, 0.08);
    eng.o.frequency.setTargetAtTime(45 + sp * 0.32, AC.currentTime, 0.05); eng.f.frequency.setTargetAtTime(300 + sp * 2, AC.currentTime, 0.1);
    const s = on && cars.some(x => x.siren && dist(x, game.car || player) < 700);
    sir.g.gain.setTargetAtTime(s ? 0.025 : 0, AC.currentTime, 0.1); sir.o.frequency.setTargetAtTime(Math.floor(game.clock * 2) % 2 ? 960 : 720, AC.currentTime, 0.05);
  }

  /* ——— التحكم ——— */
  const input = { jx: 0, jy: 0, jm: 0, hb: false, keys: {} };
  const joy = $('#joy'), knob = $('#knob'); let jid = null, jo = null;
  $('#ctl').addEventListener('touchstart', e => { initAudio();
    for (const t of e.changedTouches) if (jid === null && t.clientX < W * 0.55 && !t.target.closest('button')) { jid = t.identifier; jo = { x: t.clientX, y: t.clientY }; joy.style.left = jo.x - 60 + 'px'; joy.style.top = jo.y - 60 + 'px'; joy.classList.add('on'); }
  }, { passive: true });
  addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === jid) {
    let dx = t.clientX - jo.x, dy = t.clientY - jo.y; const d = Math.hypot(dx, dy), M = 55; if (d > M) { dx = dx / d * M; dy = dy / d * M; }
    knob.style.transform = `translate(${dx}px,${dy}px)`; input.jx = dx / M; input.jy = dy / M; input.jm = Math.min(1, d / M); } }, { passive: true });
  const jend = e => { for (const t of e.changedTouches) if (t.identifier === jid) { jid = null; input.jx = input.jy = input.jm = 0; knob.style.transform = ''; joy.classList.remove('on'); joy.style.left = ''; joy.style.top = ''; } };
  addEventListener('touchend', jend); addEventListener('touchcancel', jend);
  const hold = (el, on, off) => { el.addEventListener('touchstart', e => { e.preventDefault(); initAudio(); on(); }, { passive: false }); el.addEventListener('touchend', e => { e.preventDefault(); off && off(); }); el.addEventListener('mousedown', on); el.addEventListener('mouseup', () => off && off()); };
  hold($('#bAct'), () => action());
  hold($('#bBrake'), () => { input.hb = true; }, () => { input.hb = false; });
  hold($('#bHorn'), () => { sfx('horn'); scarePeds(); });
  addEventListener('keydown', e => { input.keys[e.code] = true; initAudio(); if (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') action(); if (e.code === 'KeyH') { sfx('horn'); scarePeds(); } if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); });
  addEventListener('keyup', e => { input.keys[e.code] = false; });
  function scarePeds() { const P = game.car || player; peds.forEach(p => { if (p.state === 'walk' && dist(p, P) < 140) { const dx = p.x - P.x, dy = p.y - P.y, d = Math.hypot(dx, dy) || 1; p.flee = { x: dx / d, y: dy / d }; p.state = 'run'; p.t = 1.2; } }); }
  function action() {
    if (!game.started || game.paused) return;
    if (game.car) { exitCar(); return; }
    const c = nearestCar(46); if (c) enterCar(c);
  }
  function controls() {
    const k = input.keys, kb = { x: (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), y: (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0) };
    return { kb, hb: input.hb || k.Space };
  }

  /* ——— الحلقة ——— */
  function update(dt) {
    game.clock = (game.clock || 0) + dt; game.time += dt / 25; game.crimeCD -= dt;
    const { kb, hb } = controls();
    if (game.car) {
      const c = game.car; let thr = 0, steer = 0;
      if (kb.x || kb.y) { thr = -kb.y; steer = kb.x; }
      else if (input.jm > 0.15) {
        const ja = Math.atan2(input.jy, input.jx), diff = angDiff(ja, c.a);
        if (Math.abs(diff) > 2.3 && c.vf < 60) { thr = -input.jm; steer = -Math.sign(angDiff(ja + Math.PI, c.a)) * Math.min(1, Math.abs(angDiff(ja + Math.PI, c.a)) * 2); }
        else { steer = clamp(diff * 2.3, -1, 1); thr = input.jm * (Math.abs(diff) > 1.3 ? 0.35 : 1); if (Math.abs(diff) > 1.7 && c.vf > 120) thr = -0.6; }
      }
      stepCar(c, thr, steer, hb, dt); player.x = c.x; player.y = c.y; player.a = c.a;
    } else {
      let mx = kb.x, my = kb.y, m = Math.hypot(mx, my); if (m) { mx /= m; my /= m; m = 1; } else if (input.jm > 0.1) { mx = input.jx / input.jm; my = input.jy / input.jm; m = input.jm; }
      const sp = 150 * m; player.vx = mx * sp; player.vy = my * sp; player.x += player.vx * dt; player.y += player.vy * dt;
      if (m) { player.a = Math.atan2(my, mx); player.wt += dt * sp / 9; }
      collideWorld(player.x, player.y, 7, h => { player.x += h.nx * h.pen; player.y += h.ny * h.pen; });
      // صدمته سيارة
      cars.forEach(c => { const s = Math.hypot(c.vx, c.vy); if (s > 60 && circles(c).some(([x, y]) => Math.hypot(x - player.x, y - player.y) < c.T.Wd / 2 + 7)) { const f = { x: c.vx / s, y: c.vy / s }; player.x += f.x * 30 - f.y * 14; player.y += f.y * 30 + f.x * 14; shake += 5; sfx('crash', 120); } });
    }
    cars.forEach(c => { if (c.ai) aiCar(c, dt); else if (c !== game.car) stepCar(c, 0, 0, true, dt); });
    carCar(dt);
    peds.forEach(p => { if (p.state !== 'wait') stepPed(p, dt); });
    // إدارة المرور والمشاة
    const P = game.car || player;
    for (let i = cars.length - 1; i >= 0; i--) { const c = cars[i]; if ((c.ai || c.wreck) && c !== game.car && dist(c, P) > 1700 && !(c.ai && c.ai.mode === 'chase' && game.stars)) cars.splice(i, 1); }
    if (cars.filter(c => c.ai).length < 24 && rnd() < 0.5) spawnTraffic(P);
    for (let i = peds.length - 1; i >= 0; i--) if (dist(peds[i], P) > 1200 && peds[i].state !== 'wait') peds.splice(i, 1);
    if (peds.length < 28 && rnd() < 0.5) spawnPedNear(P);
    updatePolice(dt); updateMission(dt); updateGarage(dt);
    DALLAS.forEach(d => { if (!d.got && dist(d, P) < 30) { d.got = true; save.dallas.push(d.id); pay(100); sfx('coin'); bigMsg('دلّة ذهبية!', `${nA(save.dallas.length)} من ${nA(DALLAS.length)}`, '#FCD34D'); } });
    parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; }); for (let i = parts.length - 1; i >= 0; i--) if (parts[i].t > parts[i].life) parts.splice(i, 1);
    floats.forEach(f => { f.t += dt; f.y -= 30 * dt; }); for (let i = floats.length - 1; i >= 0; i--) if (floats[i].t > 1.6) floats.splice(i, 1);
    // الكاميرا
    const sp = game.car ? Math.hypot(game.car.vx, game.car.vy) : 0, base = clamp(Math.min(W, H) / 470, 0.78, 1.6);
    Z = lerp(Z, base * (1 - Math.min(sp / 450, 1) * 0.28), 1 - Math.exp(-2 * dt));
    const lead = game.car ? 0.5 : 0; cam.x = lerp(cam.x, P.x + (P.vx || 0) * lead, 1 - Math.exp(-6 * dt)); cam.y = lerp(cam.y, P.y + (P.vy || 0) * lead, 1 - Math.exp(-6 * dt));
    shake *= Math.exp(-6 * dt);
    game.saveT += dt; if (game.saveT > 5) { game.saveT = 0; persist(); }
  }
  function render() {
    const sx = (rnd() - 0.5) * shake, sy = (rnd() - 0.5) * shake;
    ctx.setTransform(DPR * Z, 0, 0, DPR * Z, DPR * (W / 2 - (cam.x + sx) * Z), DPR * (H / 2 - (cam.y + sy) * Z));
    drawGround(); drawShadows();
    const m = game.mission;
    if (!m) HUBS.forEach(h => { if (inView(h, 120)) drawMarker(h, h.col, h.icon); });
    DALLAS.forEach(d => { if (!d.got && inView(d, 40)) drawDalla(d); });
    peds.forEach(p => { if (inView(p, 30)) drawPerson(p); });
    if (!game.car) drawPerson({ ...player, state: 'walk', look: { body: '#F4F1EA', head: 'massar' } }, true);
    cars.forEach(c => { if (inView(c, 60)) drawCar(c); });
    parts.forEach(p => { const k = p.t / p.life;
      if (p.k === 'spark') { ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
      else if (p.k === 'fire') { ctx.fillStyle = `rgba(255,${160 - k * 120},40,${0.8 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 6 + k * 14, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = p.dark ? `rgba(40,40,44,${0.45 * (1 - k)})` : `rgba(210,210,215,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s + k * 16, 0, 7); ctx.fill(); } });
    drawBuildings(); drawTrees();
    const dk = darkness(); if (dk > 0.02) { drawLights(dk); ctx.setTransform(DPR * Z, 0, 0, DPR * Z, DPR * (W / 2 - cam.x * Z), DPR * (H / 2 - cam.y * Z)); }
    if (m) { if (m.k === 'race') { drawMarker(m.tgt, '#A3E635', '🏁', true); const nx = RACE[m.i + 1]; if (nx) drawMarker(nx, '#4D7C0F', null); }
      else drawMarker(m.tgt, m.k === 'taxi' ? '#FBBF24' : '#FB923C', m.k === 'taxi' ? (m.stage === 'pick' ? '🙋' : '📍') : '📦', true); }
    floats.forEach(f => { ctx.font = '900 22px Thmanyah'; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(163,230,53,${1 - f.t / 1.6})`; ctx.strokeStyle = `rgba(0,0,0,${0.6 * (1 - f.t / 1.6)})`; ctx.lineWidth = 4; ctx.strokeText(f.s, f.x, f.y); ctx.fillText(f.s, f.x, f.y); });
    if (m) drawArrow(m.tgt, '#C084FC');
    drawMinimap(m ? m.tgt : null);
  }

  /* ——— الواجهة ——— */
  const hud = { starsFlash: 0, last: {} };
  const setTxt = (id, v) => { if (hud.last[id] !== v) { hud.last[id] = v; $(id).innerHTML = v; } };
  function updateHUD(dt) {
    setTxt('#money', nA(save.money));
    hud.starsFlash = Math.max(0, hud.starsFlash - dt);
    const chase = cars.some(c => c.ai && c.ai.mode === 'chase'), fl = (hud.starsFlash > 0 || (chase && game.stars)) && Math.floor(game.clock * 4) % 2;
    setTxt('#stars', [1, 2, 3, 4, 5].map(i => `<i class="${i <= game.stars ? 'on' : ''} ${fl && i <= game.stars ? 'fl' : ''}">★</i>`).join(''));
    const h = Math.floor(game.time % 24), mi = Math.floor((game.time % 1) * 60);
    setTxt('#clock', `${nA(((h + 11) % 12) + 1)}:${nA(String(mi - mi % 5).padStart(2, '0'))} ${h < 12 ? 'ص' : 'م'}`);
    const c = game.car; $('#spd').hidden = !c; if (c) setTxt('#spdv', nA(Math.round(Math.abs(c.vf) * 0.45)));
    if (c) { const hp = Math.max(0, c.hp / c.T.hp); $('#hp').style.width = hp * 100 + '%'; $('#hp').style.background = hp > 0.5 ? '#A3E635' : hp > 0.25 ? '#FBBF24' : '#EF4444'; }
    const m = game.mission; $('#mis').hidden = !m;
    if (m) { setTxt('#misN', m.name + (m.k === 'taxi' && m.streak ? ` · ${nA(m.streak)} توصيلة` : '')); setTxt('#misT', m.text); const t = Math.max(0, Math.ceil(m.timer)); setTxt('#misC', `${nA(Math.floor(t / 60))}:${nA(String(t % 60).padStart(2, '0'))}`); $('#misC').classList.toggle('low', t <= 10); }
    const near = !c && nearestCar(46);
    $('#bAct').hidden = !(c || near); setTxt('#bActT', c ? 'انزل' : near && near.drv === 'ai' ? 'خذها' : 'اركب');
    $('#bBrake').hidden = !c; $('#bHorn').hidden = !c;
    $('#bust').style.opacity = game.bustT > 0.1 ? 1 : 0;
  }
  let toastT; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2400); }
  let bigT; function bigMsg(t, s, col) { const el = $('#big'); el.innerHTML = `<b style="color:${col}">${t}</b><span>${s || ''}</span>`; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(bigT); bigT = setTimeout(() => el.classList.remove('on'), 2600); }
  function togglePause() { if (!game.started) return; game.paused = !game.paused; $('#pause').hidden = !game.paused; if (game.paused) fillStats(); }
  function fillStats() { $('#stats').innerHTML = `<div><b>${nA(save.money)}</b><span>ريال</span></div><div><b>${nA(save.dallas.length)}/${nA(DALLAS.length)}</b><span>دلال ذهبية</span></div><div><b>${nA(save.done)}</b><span>مهمة منجزة</span></div><div><b>${save.best ? nA(save.best) : '—'}</b><span>أفضل سباق (ث)</span></div>`; $('#snd').textContent = save.sound ? 'الصوت: يعمل' : 'الصوت: مغلق'; }
  $('#bPause').addEventListener('click', togglePause);
  $('#resume').addEventListener('click', togglePause);
  $('#snd').addEventListener('click', () => { save.sound = !save.sound; persist(); fillStats(); });
  $('#play').addEventListener('click', () => { initAudio(); if (AC && AC.state === 'suspended') AC.resume(); $('#title').classList.add('out'); setTimeout(() => { $('#title').hidden = true; }, 600); game.started = true; document.body.classList.add('playing');
    setTimeout(() => toast('اقترب من سيارة واضغط «اركب»'), 900); setTimeout(() => toast('ابحث عن 🚕 📦 🏁 في الخريطة لتبدأ المهام'), 4200); });
  $('#tStats').innerHTML = save.dallas.length || save.done ? `رصيدك ${nA(save.money)} ر.ع · ${nA(save.dallas.length)} دلّة · ${nA(save.done)} مهمة` : 'مدينة كاملة بانتظارك';

  let last = performance.now(), acc = 0;
  for (let k = 0; k < 18; k++) spawnTraffic(player); for (let k = 0; k < 20; k++) spawnPedNear(player);
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (game.started && !game.paused) { acc += dt; while (acc > 1 / 60) { update(1 / 60); acc -= 1 / 60; } updateHUD(dt); }
    else if (!game.started) { game.clock += dt; cam.x = player.x + Math.cos(game.clock * 0.12) * 380; cam.y = player.y + Math.sin(game.clock * 0.12) * 260; cars.forEach(c => { if (c.ai) aiCar(c, dt); }); carCar(dt); }
    render(); updateAudio();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.started && !game.paused) togglePause(); });
  window.__game = { game, player, cars, peds, save, HUBS, DALLAS, startMission, enterCar, nearestCar, input, cam };
})();
