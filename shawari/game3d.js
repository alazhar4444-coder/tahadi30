/* شوارع — لعبة مدينة مفتوحة ثلاثية الأبعاد (تصميم أصلي) */
(() => {
  'use strict';
  const AR = '٠١٢٣٤٥٦٧٨٩', nA = x => String(x).replace(/\d/g, d => AR[d]);
  const $ = s => document.querySelector(s);
  const cv = $('#cv');
  const mm = $('#mm'), mctx = mm.getContext('2d');
  let W = innerWidth, H = innerHeight;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  mm.width = 150 * DPR; mm.height = 150 * DPR;

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
  let inView = () => false;

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

  function darkness() { const h = game.time % 24; if (h >= 20 || h < 5) return 0.7; if (h >= 18) return (h - 18) / 2 * 0.7; if (h < 7) return (7 - h) / 2 * 0.7; return 0; }
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

  /* ——— العالم ثلاثي الأبعاد ——— */
  const S = 0.1, T3 = THREE, V3 = T3.Vector3;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const QUAL = { high: { pr: 2, sh: 2048, t: 'عالية' }, med: { pr: 1.5, sh: 1024, t: 'متوسطة' }, low: { pr: 1, sh: 0, t: 'منخفضة' } };
  let qual = save.q || (isMobile ? 'med' : 'high');
  const renderer = new T3.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.type = T3.PCFSoftShadowMap;
  const scene = new T3.Scene(), camera = new T3.PerspectiveCamera(60, 1, 0.3, 800);
  const SKY_DAY = new T3.Color('#9FD3F0'), SKY_SET = new T3.Color('#F2A66B'), SKY_NIGHT = new T3.Color('#0A1024'), skyC = new T3.Color();
  scene.background = skyC; scene.fog = new T3.Fog(0x9fd4f2, 70, 260);
  const hemi = new T3.HemisphereLight(0xe3f1ff, 0x9a8a6a, 1.15); scene.add(hemi);
  const sun = new T3.DirectionalLight(0xfff1d6, 2.6);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 320 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  const headSpot = new T3.SpotLight(0xfff2d0, 0, 60, 0.55, 0.6, 1.2); scene.add(headSpot, headSpot.target);
  function resize3() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
  function applyQuality() { const q = QUAL[qual]; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.pr)); renderer.shadowMap.enabled = q.sh > 0; sun.castShadow = q.sh > 0;
    if (q.sh) { sun.shadow.mapSize.set(q.sh, q.sh); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    scene.traverse(o => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); } }); resize3(); }
  addEventListener('resize', resize3);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const canvasTex = (c, rep) => { const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = maxAniso; if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; } return t; };
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return [c, c.getContext('2d')]; };

  // —— الأرض: لوحة واحدة مرسومة للمدينة كلها
  function paintGround() {
    const SZ = isMobile ? 4096 : 4096, [c, g] = mkCanvas(SZ), k = SZ / WS, r2 = rng(9);
    g.scale(k, k);
    g.fillStyle = '#3A3D45'; g.fillRect(0, 0, WS, WS);
    for (let q = 0; q < 70000; q++) { g.fillStyle = r2() < 0.5 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.07)'; g.fillRect(r2() * WS, r2() * WS, 2.5, 2.5); }
    for (let q = 0; q < 260; q++) { const x = r2() * WS, y = r2() * WS, R0 = 10 + r2() * 22, gr = g.createRadialGradient(x, y, 0, x, y, R0); gr.addColorStop(0, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R0, y - R0, R0 * 2, R0 * 2); }
    g.strokeStyle = 'rgba(20,20,24,.35)'; g.lineWidth = 1.2;
    for (let q = 0; q < 500; q++) { let x = r2() * WS, y = r2() * WS; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += (r2() - 0.5) * 30; y += (r2() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
    // خطوط الطريق
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.75)'; g.setLineDash([24, 18]); g.beginPath();
    for (let j = 0; j <= N; j++) for (let i = 0; i < N; i++) { const y = nodeX(j); g.moveTo(nodeX(i) + ROAD / 2 + 26, y); g.lineTo(nodeX(i + 1) - ROAD / 2 - 26, y); const x = nodeX(j); g.moveTo(x, nodeX(i) + ROAD / 2 + 26); g.lineTo(x, nodeX(i + 1) - ROAD / 2 - 26); }
    g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(245,197,24,.7)'; g.lineWidth = 2; g.beginPath();
    for (let j = 0; j <= N; j++) for (let i = 0; i < N; i++) { [-1, 1].forEach(s => { const y = nodeX(j) + s * (ROAD / 2 - 6); g.moveTo(nodeX(i) + ROAD / 2, y); g.lineTo(nodeX(i + 1) - ROAD / 2, y); const x = nodeX(j) + s * (ROAD / 2 - 6); g.moveTo(x, nodeX(i) + ROAD / 2); g.lineTo(x, nodeX(i + 1) - ROAD / 2); }); }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,.82)';
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const cx = nodeX(i), cy = nodeX(j);
      for (let q = -2; q <= 2; q++) { g.fillRect(cx + q * 20 - 6, cy - ROAD / 2 - 24, 12, 22); g.fillRect(cx + q * 20 - 6, cy + ROAD / 2 + 2, 12, 22); g.fillRect(cx - ROAD / 2 - 24, cy + q * 20 - 6, 22, 12); g.fillRect(cx + ROAD / 2 + 2, cy + q * 20 - 6, 22, 12); }
      g.fillRect(cx + 4, cy - ROAD / 2 - 30, ROAD / 2 - 6, 4); g.fillRect(cx - ROAD / 2 + 2, cy + ROAD / 2 + 26, ROAD / 2 - 6, 4); g.fillRect(cx - ROAD / 2 - 30, cy - ROAD / 2 + 2, 4, ROAD / 2 - 6); g.fillRect(cx + ROAD / 2 + 26, cy + 4, 4, ROAD / 2 - 6); }
    // البلوكات
    blocks.forEach(b => {
      const { x, y } = b, L = BLOCK - SIDE * 2, lx = x + SIDE, ly = y + SIDE;
      g.fillStyle = '#B9B2A3'; g.fillRect(x, y, BLOCK, BLOCK);
      g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1; g.beginPath(); for (let t = 0; t < BLOCK; t += 12) { g.moveTo(x + t, y); g.lineTo(x + t, y + SIDE); g.moveTo(x + t, y + BLOCK - SIDE); g.lineTo(x + t, y + BLOCK); g.moveTo(x, y + t); g.lineTo(x + SIDE, y + t); g.moveTo(x + BLOCK - SIDE, y + t); g.lineTo(x + BLOCK, y + t); } g.stroke();
      g.fillStyle = '#8E887B'; g.fillRect(x, y, BLOCK, 3); g.fillRect(x, y + BLOCK - 3, BLOCK, 3); g.fillRect(x, y, 3, BLOCK); g.fillRect(x + BLOCK - 3, y, 3, BLOCK);
      if (b.type === 'park') {
        g.fillStyle = '#5B9A45'; g.fillRect(lx, ly, L, L);
        for (let q = 0; q < 2500; q++) { g.fillStyle = r2() < 0.5 ? 'rgba(120,180,80,.5)' : 'rgba(40,90,30,.4)'; g.fillRect(lx + r2() * L, ly + r2() * L, 2, 4); }
        g.fillStyle = '#DCCB9F'; g.fillRect(x + BLOCK / 2 - 13, ly, 26, L); g.fillRect(lx, y + BLOCK / 2 - 13, L, 26);
        g.fillStyle = '#E9E1CF'; g.beginPath(); g.arc(x + BLOCK / 2, y + BLOCK / 2, 42, 0, 7); g.fill();
        g.fillStyle = '#2C9CC4'; g.beginPath(); g.arc(x + BLOCK / 2, y + BLOCK / 2, 32, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x + BLOCK / 2 - 8, y + BLOCK / 2 - 8, 12, 0, 7); g.fill();
      } else if (b.type === 'parking' || b.type === 'police') {
        g.fillStyle = '#45484F'; g.fillRect(lx, ly, L, L);
        g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.5;
        b.stalls.forEach(s => { g.beginPath(); const dy = s.a > 0 ? -1 : 1; g.moveTo(s.x - 24, s.y + dy * 32); g.lineTo(s.x - 24, s.y - dy * 30); g.moveTo(s.x + 25, s.y + dy * 32); g.lineTo(s.x + 25, s.y - dy * 30); g.stroke(); });
        if (b.type === 'police') { g.fillStyle = 'rgba(30,58,138,.9)'; g.fillRect(lx, ly + L * 0.5, L, 6); }
      } else if (b.type === 'mosque') {
        g.fillStyle = '#ECE3D0'; g.fillRect(lx, ly, L, L);
        g.strokeStyle = 'rgba(150,120,80,.25)'; g.lineWidth = 1.5; for (let q = 1; q < 14; q++) { g.beginPath(); g.moveTo(lx + q * L / 14, ly); g.lineTo(lx + q * L / 14, ly + L); g.moveTo(lx, ly + q * L / 14); g.lineTo(lx + L, ly + q * L / 14); g.stroke(); }
      } else if (b.type === 'garage') {
        g.fillStyle = '#8A8D93'; g.fillRect(lx, ly, L, L);
        const z = b.zone; g.save(); g.beginPath(); g.rect(z.x, z.y, z.w, z.h); g.clip();
        g.fillStyle = '#F5C518'; for (let q = -10; q < 20; q++) { g.beginPath(); g.moveTo(z.x + q * 26, z.y); g.lineTo(z.x + q * 26 + 13, z.y); g.lineTo(z.x + q * 26 + 13 + z.h, z.y + z.h); g.lineTo(z.x + q * 26 + z.h, z.y + z.h); g.fill(); }
        g.fillStyle = 'rgba(55,58,64,.9)'; g.fillRect(z.x + 9, z.y + 9, z.w - 18, z.h - 18); g.restore();
        g.fillStyle = '#F5C518'; g.font = '900 34px Thmanyah'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔧 الكراج', z.x + z.w / 2, z.y + z.h / 2);
      } else { g.fillStyle = '#D3C9B4'; g.fillRect(lx, ly, L, L); for (let q = 0; q < 400; q++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(lx + r2() * L, ly + r2() * L, 3, 3); } }
    });
    return canvasTex(c);
  }
  const groundTex = paintGround();
  const groundMat = new T3.MeshStandardMaterial({ map: groundTex, roughness: 0.93, metalness: 0 });
  const ground = new T3.Mesh(new T3.PlaneGeometry(WS * S, WS * S).rotateX(-Math.PI / 2).translate(WS * S / 2, 0, WS * S / 2), groundMat); ground.receiveShadow = true; scene.add(ground);
  const sand = new T3.Mesh(new T3.PlaneGeometry(WS * S + 18, WS * S + 18).rotateX(-Math.PI / 2).translate(WS * S / 2, -0.03, WS * S / 2), new T3.MeshStandardMaterial({ color: '#E2CC9C', roughness: 1 })); sand.receiveShadow = true; scene.add(sand);
  const [wc, wg] = mkCanvas(256); wg.fillStyle = '#1A7DA8'; wg.fillRect(0, 0, 256, 256); wg.strokeStyle = 'rgba(255,255,255,.22)'; wg.lineWidth = 3;
  for (let q = 0; q < 26; q++) { const x = Math.random() * 256, y = Math.random() * 256; wg.beginPath(); wg.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); wg.stroke(); }
  const waterTex = canvasTex(wc, true); waterTex.repeat.set(120, 120);
  const sea = new T3.Mesh(new T3.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2).translate(WS * S / 2, -0.25, WS * S / 2), new T3.MeshStandardMaterial({ map: waterTex, roughness: 0.25, metalness: 0.1 })); scene.add(sea);

  // —— أداة لبناء هندسة من مضلعات
  function GeoBuilder() { const P = [], U = [], C = []; return {
    quad(a, b, c, d, ua, ub, uc, ud, col) { P.push(...a, ...b, ...c, ...a, ...c, ...d); U.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud); for (let k = 0; k < 6; k++) C.push(col.r, col.g, col.b); },
    build() { const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T3.Float32BufferAttribute(U, 2)); g.setAttribute('color', new T3.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); return g; } }; }
  function boxInto(B, x0, z0, w, d, h, col, roofB, roofCol, uvScale, y0 = 0) {
    const x1 = x0 + w, z1 = z0 + d, us = uvScale || [3.5, 3.2], Y0 = y0, Y1 = y0 + h;
    const wall = (bl, br, len) => { const tl = [bl[0], Y1, bl[2]], tr = [br[0], Y1, br[2]], vb = Y0 / us[1], vt = Y1 / us[1];
      B.quad([bl[0], Y0, bl[2]], [br[0], Y0, br[2]], tr, tl, [0, vb], [len / us[0], vb], [len / us[0], vt], [0, vt], col); };
    wall([x1, 0, z0], [x0, 0, z0], w); wall([x0, 0, z1], [x1, 0, z1], w); wall([x0, 0, z0], [x0, 0, z1], d); wall([x1, 0, z1], [x1, 0, z0], d);
    if (roofB) roofB.quad([x0, Y1, z0], [x0, Y1, z1], [x1, Y1, z1], [x1, Y1, z0], [0, 0], [0, 1], [1, 1], [1, 0], roofCol || col);
  }
  // —— الأرصفة المرتفعة
  (() => { const B = GeoBuilder(), H0 = 0.16, wh = new T3.Color('#ffffff');
    const P = [], U = [];
    blocks.forEach(b => { const x0 = b.x * S, z0 = b.y * S, x1 = x0 + BLOCK * S, z1 = z0 + BLOCK * S, u = (x, z) => [x / S / WS, 1 - z / S / WS];
      B.quad([x0, H0, z0], [x0, H0, z1], [x1, H0, z1], [x1, H0, z0], u(x0, z0), u(x0, z1), u(x1, z1), u(x1, z0), wh);
      const side = (a, c) => B.quad([a[0], 0, a[1]], [c[0], 0, c[1]], [c[0], H0, c[1]], [a[0], H0, a[1]], u(a[0], a[1]), u(c[0], c[1]), u(c[0], c[1]), u(a[0], a[1]), new T3.Color('#9A9384'));
      side([x1, z0], [x0, z0]); side([x0, z1], [x1, z1]); side([x0, z0], [x0, z1]); side([x1, z1], [x1, z0]); });
    const m = new T3.Mesh(B.build(), new T3.MeshStandardMaterial({ map: groundTex, vertexColors: true, roughness: 0.92 })); m.receiveShadow = true; scene.add(m); })();
  const onSlab = (x, y) => { const bi = Math.floor((x - ROAD) / CELL), bj = Math.floor((y - ROAD) / CELL), b = blockAt(bi, bj); return b && x >= b.x && x <= b.x + BLOCK && y >= b.y && y <= b.y + BLOCK ? 0.16 : 0; };

  // —— نوافذ المباني
  function windowTex(kind, lit) {
    const [c, g] = mkCanvas(lit ? 512 : 128), n = lit ? 4 : 1, s = 128;
    if (lit) { g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); }
    for (let by = 0; by < n; by++) for (let bx = 0; bx < n; bx++) { const ox = bx * s, oy = by * s;
      if (kind === 'house') {
        if (!lit) { g.fillStyle = '#F7F3EA'; g.fillRect(ox, oy, s, s); g.fillStyle = 'rgba(0,0,0,.05)'; for (let q = 0; q < 60; q++) g.fillRect(ox + Math.random() * s, oy + Math.random() * s, 3, 3);
          g.fillStyle = 'rgba(120,100,70,.18)'; g.fillRect(ox, oy + s - 8, s, 8); }
        const wx = ox + 36, wy = oy + 30, ww = 56, wh = 66;
        if (lit) { if (Math.random() < 0.42) { g.fillStyle = Math.random() < 0.8 ? '#FFC872' : '#BFE3FF'; g.beginPath(); g.moveTo(wx, wy + 18); g.arc(wx + ww / 2, wy + 18, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.lineTo(wx, wy + wh); g.fill(); } }
        else { g.fillStyle = '#D9CBB0'; g.beginPath(); g.moveTo(wx - 6, wy + 18); g.arc(wx + ww / 2, wy + 18, ww / 2 + 6, Math.PI, 0); g.lineTo(wx + ww + 6, wy + wh + 6); g.lineTo(wx - 6, wy + wh + 6); g.fill();
          const gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#6E8BA3'); gr.addColorStop(1, '#2A3644'); g.fillStyle = gr;
          g.beginPath(); g.moveTo(wx, wy + 18); g.arc(wx + ww / 2, wy + 18, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.lineTo(wx, wy + wh); g.fill();
          g.fillStyle = '#E9E1D0'; g.fillRect(wx + ww / 2 - 2, wy + 4, 4, wh - 4); g.fillRect(wx, wy + 38, ww, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(wx - 8, wy + wh + 6, ww + 16, 5); }
      } else {
        if (lit) { if (Math.random() < 0.45) { g.fillStyle = Math.random() < 0.7 ? '#DDEEFF' : '#FFE3A8'; g.fillRect(ox + 4, oy + 4, s - 8, s - 30); } }
        else { const gr = g.createLinearGradient(ox, oy, ox + s, oy + s); gr.addColorStop(0, '#B9D3DF'); gr.addColorStop(0.5, '#6F93A6'); gr.addColorStop(1, '#4C6E82'); g.fillStyle = gr; g.fillRect(ox, oy, s, s);
          g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + 50, oy); g.lineTo(ox, oy + 70); g.fill();
          g.fillStyle = '#3B4B57'; g.fillRect(ox, oy + s - 24, s, 24); g.fillStyle = '#D5DEE3'; g.fillRect(ox, oy, 4, s); g.fillRect(ox + s - 2, oy, 2, s); g.fillRect(ox, oy + s - 26, s, 3); }
      }
    }
    const t = canvasTex(c, true); if (lit) t.repeat.set(0.25, 0.25); return t;
  }
  const houseMat = new T3.MeshStandardMaterial({ map: windowTex('house'), emissiveMap: windowTex('house', true), emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: 0.85 });
  const glassMat = new T3.MeshStandardMaterial({ map: windowTex('glass'), emissiveMap: windowTex('glass', true), emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: 0.25, metalness: 0.35 });
  const roofMat = new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const goldMat = new T3.MeshStandardMaterial({ color: '#E2B23C', metalness: 0.75, roughness: 0.3, emissive: '#4A3200', emissiveIntensity: 0.4 });
  const whiteMat = new T3.MeshStandardMaterial({ color: '#F6F2EA', roughness: 0.8 });
  const BH = o => o.kind === 'glass' ? Math.round(o.ht * 24) * 3.3 : o.kind === 'minaret' ? 27 : o.kind === 'mosque' ? 7.5 : o.kind === 'garage' ? 6.5 : o.kind === 'police' ? 10 : (2 + Math.round(o.ht * 5)) * 3.3;
  const tankPos = [], acPos = [];
  (() => {
    const HB = GeoBuilder(), GB = GeoBuilder(), RB = GeoBuilder();
    blocks.forEach(b => b.bs.forEach(o => {
      const h = BH(o), x0 = o.x * S, z0 = o.y * S, w = o.w * S, d = o.h * S; o.H = h;
      const glass = o.kind === 'glass', wallCol = new T3.Color(glass ? '#FFFFFF' : shade(o.roof, 1.02)), roofCol = new T3.Color(shade(o.roof, 0.96));
      if (glass) wallCol.lerp(new T3.Color(o.roof), 0.35);
      boxInto(glass ? GB : HB, x0, z0, w, d, h, wallCol, RB, roofCol);
      if (o.kind !== 'minaret' && o.kind !== 'mosque') { // حافة السطح
        const p = 0.25, ph = 0.7, rc = new T3.Color(shade(o.roof, 0.85));
        boxInto(RB, x0, z0, w, p, ph, rc, RB, rc, null, h); boxInto(RB, x0, z0 + d - p, w, p, ph, rc, RB, rc, null, h);
        boxInto(RB, x0, z0, p, d, ph, rc, RB, rc, null, h); boxInto(RB, x0 + w - p, z0, p, d, ph, rc, RB, rc, null, h);
      }
      o.det.forEach(dd => { if (dd.t === 'tank') tankPos.push([dd.x * S, h, dd.y * S]); else if (dd.t === 'ac') acPos.push([dd.x * S + 0.8, h, dd.y * S + 0.6]); else if (dd.t === 'heli') addHeli(dd.x * S, h + 0.03, dd.y * S); });
      if (o.kind === 'mosque') { const cx = x0 + w / 2, cz = z0 + d / 2, r0 = Math.min(w, d) * 0.3;
        const dome = new T3.Mesh(new T3.SphereGeometry(r0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), goldMat); dome.position.set(cx, h, cz); dome.castShadow = true; scene.add(dome);
        const drum = new T3.Mesh(new T3.CylinderGeometry(r0 * 1.02, r0 * 1.02, 1.2, 32), whiteMat); drum.position.set(cx, h + 0.1, cz); scene.add(drum);
        const sp = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.12, 2.2, 6), goldMat); sp.position.set(cx, h + r0 + 1, cz); scene.add(sp);
        [[0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]].forEach(([fx, fz]) => { const s2 = new T3.Mesh(new T3.SphereGeometry(r0 * 0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), goldMat); s2.position.set(x0 + w * fx, h, z0 + d * fz); scene.add(s2); }); }
      if (o.kind === 'minaret') { const cx = x0 + w / 2, cz = z0 + d / 2;
        const bal = new T3.Mesh(new T3.CylinderGeometry(w * 0.75, w * 0.6, 0.8, 16), whiteMat); bal.position.set(cx, h - 4, cz); scene.add(bal);
        const top = new T3.Mesh(new T3.CylinderGeometry(w * 0.4, w * 0.45, 3, 12), whiteMat); top.position.set(cx, h + 1.5, cz); scene.add(top);
        const cap = new T3.Mesh(new T3.ConeGeometry(w * 0.5, 2.6, 16), goldMat); cap.position.set(cx, h + 4.3, cz); cap.castShadow = true; scene.add(cap); }
      if (o.kind === 'garage') addSign('🔧 الكراج', '#2563EB', x0 + w / 2, h - 2.2, z0 - 0.06, 0);
      if (o.kind === 'police') addSign('الشرطة', '#1E3A8A', x0 + w / 2, h - 2.6, z0 + d + 0.06, Math.PI);
    }));
    [[HB, houseMat], [GB, glassMat], [RB, roofMat]].forEach(([B, m]) => { const mesh = new T3.Mesh(B.build(), m); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); });
  })();
  function addSign(text, bg, x, y, z, ry) {
    const [c, g] = mkCanvas(512, 128); g.fillStyle = bg; g.fillRect(0, 0, 512, 128); g.fillStyle = '#fff'; g.font = '900 76px Thmanyah'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 68);
    const m = new T3.Mesh(new T3.PlaneGeometry(9, 2.25), new T3.MeshBasicMaterial({ map: canvasTex(c) })); m.position.set(x, y, z); m.rotation.y = ry + Math.PI; scene.add(m);
  }
  function addHeli(x, y, z) {
    const [c, g] = mkCanvas(256); g.strokeStyle = '#F5C518'; g.lineWidth = 16; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); g.fillStyle = '#F5C518'; g.font = '900 150px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', 128, 136);
    const m = new T3.Mesh(new T3.PlaneGeometry(6, 6).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ map: canvasTex(c), transparent: true })); m.position.set(x, y + 0.02, z); scene.add(m);
  }
  const inst = (geo, mat, list, setup) => { if (!list.length) return; const m = new T3.InstancedMesh(geo, mat, list.length), o = new T3.Object3D();
    list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3] || 0, 0); o.scale.setScalar(p[4] || 1); if (setup) setup(o, p, i); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  inst(new T3.CylinderGeometry(0.9, 0.9, 1.4, 12).translate(0, 0.7, 0), new T3.MeshStandardMaterial({ color: '#FBFBFB', roughness: 0.5 }), tankPos);
  inst(new T3.BoxGeometry(1.6, 1, 1.2).translate(0, 0.5, 0), new T3.MeshStandardMaterial({ color: '#C7CCD3', roughness: 0.6, metalness: 0.3 }), acPos);

  // —— الأشجار والنخيل وأعمدة الإنارة
  const colorize = (g, hex) => { const c = new T3.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let q = 0; q < n; q++) { a[q * 3] = c.r; a[q * 3 + 1] = c.g; a[q * 3 + 2] = c.b; } g.setAttribute('color', new T3.BufferAttribute(a, 3)); return g; };
  const clean = g => { const x = g.index ? g.toNonIndexed() : g; return x; };
  const M = (geos) => window.mergeGeometries(geos.map(clean));
  const palmGeo = (() => { const parts = [colorize(new T3.CylinderGeometry(0.16, 0.3, 7, 7).translate(0, 3.5, 0), '#8B6A43')];
    for (let q = 0; q < 8; q++) { const leaf = new T3.ConeGeometry(0.42, 3.8, 4, 1).scale(1, 1, 0.25).translate(0, 1.9, 0).rotateZ(-1.15 - (q % 2) * 0.25).rotateY(q / 8 * Math.PI * 2).translate(0, 7, 0); parts.push(colorize(leaf, q % 2 ? '#2F8A3A' : '#3E9E44')); }
    parts.push(colorize(new T3.SphereGeometry(0.42, 8, 6).translate(0, 6.9, 0), '#6B4B2A')); return M(parts); })();
  const treeGeo = M([colorize(new T3.CylinderGeometry(0.18, 0.26, 2.4, 6).translate(0, 1.2, 0), '#6B4B2A'), colorize(new T3.IcosahedronGeometry(2, 1).translate(0, 3.6, 0), '#3F8B39'), colorize(new T3.IcosahedronGeometry(1.4, 1).translate(0.8, 4.4, 0.4), '#4FA046')]);
  const vMat = new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: T3.DoubleSide });
  const palms = [], trees = [];
  blocks.forEach(b => b.trees.forEach(t => (t.palm ? palms : trees).push([t.x * S, 0.16, t.y * S, t.x, 0.85 + (t.r - 13) * 0.04])));
  inst(palmGeo, vMat, palms); inst(treeGeo, vMat, trees);
  const lampGeo = M([colorize(new T3.CylinderGeometry(0.07, 0.11, 6.5, 6).translate(0, 3.25, 0), '#5A5F66'), colorize(new T3.BoxGeometry(1.8, 0.09, 0.09).translate(0.9, 6.4, 0), '#5A5F66'), colorize(new T3.BoxGeometry(0.6, 0.16, 0.34).translate(1.7, 6.32, 0), '#3A3E44')]);
  const lampList = lamps.map(l => { const cx = nodeX(Math.round((l.x - ROAD / 2) / CELL)), cy = nodeX(Math.round((l.y - ROAD / 2) / CELL)); return [l.x * S, 0.16, l.y * S, -Math.atan2(cy - l.y, cx - l.x)]; });
  inst(lampGeo, vMat, lampList);
  const glowTex = (() => { const [c, g] = mkCanvas(128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T3.CanvasTexture(c); })();
  const lampGlowPos = new Float32Array(lampList.length * 3); lampList.forEach((l, i) => { lampGlowPos[i * 3] = l[0] + Math.cos(-l[3]) * 1.7; lampGlowPos[i * 3 + 1] = 6.15; lampGlowPos[i * 3 + 2] = l[2] + Math.sin(-l[3]) * 1.7; });
  const lampGlow = new T3.Points(new T3.BufferGeometry().setAttribute('position', new T3.BufferAttribute(lampGlowPos, 3)), new T3.PointsMaterial({ size: 9, map: glowTex, color: '#FFD08A', transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0 }));
  scene.add(lampGlow);
  const lampPool = (() => { const g = new T3.CircleGeometry(4.5, 20).rotateX(-Math.PI / 2), m = new T3.MeshBasicMaterial({ color: '#FFB15C', map: glowTex, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0 });
    const im = new T3.InstancedMesh(g, m, lampList.length), o = new T3.Object3D(); lampList.forEach((l, i) => { o.position.set(lampGlowPos[i * 3], 0.2, lampGlowPos[i * 3 + 2]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); scene.add(im); return m; })();

  // —— السيارات
  const bodyMats = {}, bodyMat = col => bodyMats[col] || (bodyMats[col] = new T3.MeshStandardMaterial({ color: col, metalness: 0.45, roughness: 0.32 }));
  const wreckMat = new T3.MeshStandardMaterial({ color: '#2E2E2E', roughness: 0.9 });
  const detMat = new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 }), lightMat = new T3.MeshBasicMaterial({ vertexColors: true });
  const sirenR = new T3.MeshBasicMaterial({ color: '#FF2D2D' }), sirenB = new T3.MeshBasicMaterial({ color: '#2D6BFF' }), sirenOff = new T3.MeshStandardMaterial({ color: '#333' });
  const CARGEO = {};
  function carGeo(type) {
    if (CARGEO[type]) return CARGEO[type];
    const T = TYPES[type], L = T.L * S, Wd = T.Wd * S, low = type === 'sport', pk = type === 'pickup';
    const bh = low ? 0.5 : 0.62, by = 0.34 + bh / 2, top = 0.34 + bh, ch = low ? 0.45 : 0.56, cl = pk ? L * 0.36 : L * (low ? 0.42 : 0.5), cx = pk ? L * 0.1 : -L * 0.04;
    const body = [new T3.BoxGeometry(L, bh, Wd).translate(0, by, 0), new T3.BoxGeometry(L * 0.96, 0.12, Wd * 0.94).translate(0, top + 0.03, 0)];
    body.push(new T3.BoxGeometry(cl * 0.86, 0.07, Wd * 0.82).translate(cx, top + ch + 0.035, 0));
    if (pk) { body.push(new T3.BoxGeometry(L * 0.42, 0.4, 0.08).translate(-L * 0.27, top + 0.2, Wd / 2 - 0.04), new T3.BoxGeometry(L * 0.42, 0.4, 0.08).translate(-L * 0.27, top + 0.2, -Wd / 2 + 0.04), new T3.BoxGeometry(0.08, 0.4, Wd).translate(-L / 2 + 0.04, top + 0.2, 0)); }
    const det = [colorize(new T3.BoxGeometry(cl, ch, Wd * 0.86).translate(cx, top + ch / 2, 0), '#1C2632'),
      colorize(new T3.BoxGeometry(0.14, 0.22, Wd * 1.0).translate(L / 2 + 0.02, 0.5, 0), '#2B2B2E'), colorize(new T3.BoxGeometry(0.14, 0.22, Wd * 1.0).translate(-L / 2 - 0.02, 0.5, 0), '#2B2B2E'),
      colorize(new T3.BoxGeometry(0.12, 0.1, 0.24).translate(cx + cl * 0.42, top + 0.18, Wd / 2 + 0.08), '#1C1C1C'), colorize(new T3.BoxGeometry(0.12, 0.1, 0.24).translate(cx + cl * 0.42, top + 0.18, -Wd / 2 - 0.08), '#1C1C1C')];
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { det.push(colorize(new T3.CylinderGeometry(0.36, 0.36, 0.3, 14).rotateX(Math.PI / 2).translate(sx * L * 0.32, 0.36, sz * (Wd / 2 - 0.12)), '#161616'));
      det.push(colorize(new T3.CylinderGeometry(0.2, 0.2, 0.32, 10).rotateX(Math.PI / 2).translate(sx * L * 0.32, 0.36, sz * (Wd / 2 - 0.11)), '#9AA1AA')); });
    if (pk) det.push(colorize(new T3.BoxGeometry(L * 0.42, 0.05, Wd * 0.9).translate(-L * 0.27, top + 0.01, 0), '#2A2A2A'));
    if (type === 'taxi') { det.push(colorize(new T3.BoxGeometry(0.55, 0.26, 0.9).translate(cx, top + ch + 0.2, 0), '#F07B1A'));
      [1, -1].forEach(s => det.push(colorize(new T3.BoxGeometry(L * 0.98, 0.12, 0.03).translate(0, by + 0.05, s * (Wd / 2 + 0.005)), '#F07B1A'))); }
    if (type === 'police') { [1, -1].forEach(s => det.push(colorize(new T3.BoxGeometry(L * 0.98, 0.16, 0.03).translate(0, by, s * (Wd / 2 + 0.005)), '#1E3A8A')));
      det.push(colorize(new T3.BoxGeometry(0.42, 0.08, Wd * 0.8).translate(cx, top + ch + 0.1, 0), '#222')); }
    const lights = [colorize(new T3.BoxGeometry(0.06, 0.14, 0.42).translate(L / 2 + 0.01, by + 0.12, Wd / 2 - 0.3), '#FFF7DA'), colorize(new T3.BoxGeometry(0.06, 0.14, 0.42).translate(L / 2 + 0.01, by + 0.12, -Wd / 2 + 0.3), '#FFF7DA'),
      colorize(new T3.BoxGeometry(0.06, 0.13, 0.42).translate(-L / 2 - 0.01, by + 0.12, Wd / 2 - 0.3), '#E0161B'), colorize(new T3.BoxGeometry(0.06, 0.13, 0.42).translate(-L / 2 - 0.01, by + 0.12, -Wd / 2 + 0.3), '#E0161B')];
    const r = { body: M(body.map(g => colorize(g, '#ffffff'))), det: M(det), lights: M(lights), sirenY: top + ch + 0.18, cx, L, Wd };
    if (type === 'police') { r.sr = new T3.BoxGeometry(0.3, 0.14, Wd * 0.36).translate(cx, r.sirenY, Wd * 0.2); r.sb = new T3.BoxGeometry(0.3, 0.14, Wd * 0.36).translate(cx, r.sirenY, -Wd * 0.2); }
    return (CARGEO[type] = r);
  }
  function carMesh(c) {
    const G = carGeo(c.type), g = new T3.Group();
    const b = new T3.Mesh(G.body, bodyMat(c.color)); b.castShadow = true; const d = new T3.Mesh(G.det, detMat); d.castShadow = true; const l = new T3.Mesh(G.lights, lightMat);
    g.add(b, d, l); g.userData = { b, col: c.color };
    if (c.type === 'police') { const r = new T3.Mesh(G.sr, sirenR), bl = new T3.Mesh(G.sb, sirenB); g.add(r, bl); g.userData.sr = r; g.userData.sb = bl; }
    if (c === game.car || true) { }
    scene.add(g); return g;
  }
  // أضواء السيارات الليلية (نقاط متوهجة)
  const HL_MAX = 160, hlPos = new Float32Array(HL_MAX * 3), hlCol = new Float32Array(HL_MAX * 3);
  const hlGeo = new T3.BufferGeometry(); hlGeo.setAttribute('position', new T3.BufferAttribute(hlPos, 3)); hlGeo.setAttribute('color', new T3.BufferAttribute(hlCol, 3));
  const hlMat = new T3.PointsMaterial({ size: 3.2, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0 });
  const hlPts = new T3.Points(hlGeo, hlMat); hlPts.frustumCulled = false; scene.add(hlPts);

  // —— الناس
  const PEDGEO = {}, pedMat = new T3.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  function pedGeo(look, cap, isPlayer) {
    const key = look.body + look.head + cap + (isPlayer ? 'p' : ''); if (PEDGEO[key]) return PEDGEO[key];
    const parts = [colorize(new T3.CylinderGeometry(0.2, 0.3, 1.32, 10).translate(0, 0.68, 0), look.body), colorize(new T3.SphereGeometry(0.25, 10, 8).scale(1, 0.75, 1.15).translate(0, 1.36, 0), look.body),
      colorize(new T3.BoxGeometry(0.12, 0.62, 0.12).translate(0, 1.06, 0.3), look.body), colorize(new T3.BoxGeometry(0.12, 0.62, 0.12).translate(0, 1.06, -0.3), look.body),
      colorize(new T3.CylinderGeometry(0.06, 0.07, 0.12, 6).translate(0, 1.54, 0), '#C99B72')];
    const h = look.head;
    if (h === 'shayla') parts.push(colorize(new T3.SphereGeometry(0.19, 12, 10).translate(0, 1.7, 0), '#141414'), colorize(new T3.CylinderGeometry(0.2, 0.26, 0.3, 10).translate(0, 1.55, 0), '#141414'));
    else { parts.push(colorize(new T3.SphereGeometry(0.16, 12, 10).translate(0, 1.7, 0), '#C99B72'));
      if (h === 'kumma') parts.push(colorize(new T3.CylinderGeometry(0.165, 0.165, 0.12, 14).translate(0, 1.82, 0), cap));
      else if (h === 'massar') { parts.push(colorize(new T3.CylinderGeometry(0.19, 0.175, 0.16, 14).translate(0, 1.82, 0), isPlayer ? '#9F1239' : cap)); parts.push(colorize(new T3.TorusGeometry(0.17, 0.035, 6, 14).rotateX(Math.PI / 2).translate(0, 1.84, 0), '#F2E6C9')); }
      else parts.push(colorize(new T3.SphereGeometry(0.165, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.72, 0), '#24160D')); }
    return (PEDGEO[key] = M(parts));
  }
  function pedMesh(p, isPlayer) { const m = new T3.Mesh(pedGeo(p.look, p.cap || '#8E44AD', isPlayer), pedMat); m.castShadow = true; scene.add(m); return m; }
  const playerMesh = pedMesh({ look: { body: '#F4F1EA', head: 'massar' } }, true);
  const ringMat = new T3.MeshBasicMaterial({ color: '#A3E635', transparent: true, opacity: 0.85, depthWrite: false });
  const playerRing = new T3.Mesh(new T3.RingGeometry(0.55, 0.7, 32).rotateX(-Math.PI / 2), ringMat); scene.add(playerRing);

  // —— العلامات والدلال
  const beamTex = (() => { const [c, g] = mkCanvas(16, 128), gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.75)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 128); return new T3.CanvasTexture(c); })();
  const emojiTex = {}; const eTex = e => emojiTex[e] || (emojiTex[e] = (() => { const [c, g] = mkCanvas(128); g.font = '96px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70); return canvasTex(c); })());
  function marker(col, icon, big) {
    const g = new T3.Group(), r0 = big ? 4.2 : 3.4;
    const ring = new T3.Mesh(new T3.RingGeometry(r0 - 0.5, r0, 48).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false })); ring.position.y = 0.25;
    const disc = new T3.Mesh(new T3.CircleGeometry(r0 - 0.5, 48).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false })); disc.position.y = 0.23;
    const beam = new T3.Mesh(new T3.CylinderGeometry(r0 * 0.55, r0 * 0.55, 36, 24, 1, true), new T3.MeshBasicMaterial({ color: col, map: beamTex, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide })); beam.position.y = 18;
    g.add(ring, disc, beam);
    if (icon) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: eTex(icon), depthWrite: false })); s.scale.set(3.2, 3.2, 1); s.position.y = 4; g.add(s); g.userData.icon = s; }
    g.userData.ring = ring; scene.add(g); return g;
  }
  HUBS.forEach(h => { h.m = marker(h.col, h.icon); h.m.position.set(h.x * S, onSlab(h.x, h.y), h.y * S); });
  const misMk = { taxiP: marker('#FBBF24', '🙋', true), taxiD: marker('#FBBF24', '📍', true), deliv: marker('#FB923C', '📦', true), race: marker('#A3E635', '🏁', true), race2: marker('#65A30D', null) };
  const dallaGeo = (() => { const pts = [[0, 0], [0.55, 0.05], [0.7, 0.35], [0.55, 0.7], [0.3, 0.85], [0.22, 1.2], [0.32, 1.35], [0.12, 1.5], [0, 1.6]].map(([x, y]) => new T3.Vector2(x, y));
    const body = new T3.LatheGeometry(pts, 20), spout = new T3.TubeGeometry(new T3.QuadraticBezierCurve3(new V3(0.5, 0.45, 0), new V3(1.05, 0.7, 0), new V3(1.15, 1.4, 0)), 10, 0.08, 6), handle = new T3.TorusGeometry(0.42, 0.06, 6, 12, Math.PI).rotateZ(Math.PI / 2).translate(-0.62, 0.75, 0);
    return window.mergeGeometries([body, spout, handle].map(g => { const x = g.index ? g.toNonIndexed() : g; x.deleteAttribute('uv'); return x; })); })();
  DALLAS.forEach(d => { const g = new T3.Group(), m = new T3.Mesh(dallaGeo, goldMat); m.scale.setScalar(1.3); m.castShadow = true;
    const gl = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: '#FFD45A', transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.8 })); gl.scale.set(5, 5, 1); gl.position.y = 1;
    g.add(m, gl); g.position.set(d.x * S, onSlab(d.x, d.y) + 0.5, d.y * S); g.visible = !d.got; d.m = g; scene.add(g); });

  // —— الجسيمات
  const smokeTex = (() => { const [c, g] = mkCanvas(64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c); })();
  const POOL = []; for (let q = 0; q < 140; q++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); POOL.push(s); }
  // الغبار خلف السيارة عند التفحيط
  function dust(c) { const f = fwd(c); for (let q = 0; q < 2; q++) parts.push({ x: c.x - f.x * 20 + (rnd() - 0.5) * 16, y: c.y - f.y * 20 + (rnd() - 0.5) * 16, vx: (rnd() - 0.5) * 30, vy: (rnd() - 0.5) * 30, t: 0, life: 0.9, k: 'smoke', s: 6 }); }

  // —— الكاميرا
  const camS = { yaw: player.a, mode: save.cam || 'chase', pos: new V3(player.x * S - 8, 6, player.y * S), look: new V3(), shake: 0, fov: 60 };
  const frustum = new T3.Frustum(), pm = new T3.Matrix4(), tmpV = new V3();
  inView = (p, m) => { tmpV.set(p.x * S, 1, p.y * S); const d = camera.position.distanceTo(tmpV); if (d > 260) return false; return frustum.containsPoint(tmpV) || d < (m || 0) * S + 12; };
  function insideBuilding(x, y) { let r = 0; nearSolids(x, y, b => b.bs.forEach(o => { if (x > o.x - 6 && x < o.x + o.w + 6 && y > o.y - 6 && y < o.y + o.h + 6) r = Math.max(r, o.H || 0); })); return r; }
  function updateCamera(dt) {
    const P = game.car || player, tx = P.x * S, tz = P.y * S, sp = game.car ? Math.hypot(game.car.vx, game.car.vy) * S : 0, y0 = onSlab(P.x, P.y);
    let want;
    if (camS.mode === 'chase') {
      want = game.car ? game.car.a : player.a;
      if (game.car && game.car.vf < -15) want = camS.yaw;
      if (!game.car && Math.hypot(player.vx, player.vy) < 5) want = camS.yaw;
      camS.yaw += angDiff(want, camS.yaw) * (1 - Math.exp(-(game.car ? 3.4 : 2.4) * dt));
      const dd = game.car ? 11 + sp * 0.12 : 6.2, hh = game.car ? 4.6 + sp * 0.03 : 3.1;
      let cx = tx - Math.cos(camS.yaw) * dd, cz = tz - Math.sin(camS.yaw) * dd, cy = hh + y0;
      const occ = insideBuilding(cx / S, cz / S); if (occ) cy = Math.max(cy, occ + 3);
      camS.pos.lerp(tmpV.set(cx, cy, cz), 1 - Math.exp(-(game.car ? 9 : 7) * dt));
      camS.look.set(tx + Math.cos(camS.yaw) * (game.car ? 5 : 2), 1.4 + y0, tz + Math.sin(camS.yaw) * (game.car ? 5 : 2));
      camS.fov = lerp(camS.fov, 60 + Math.min(sp, 40) * 0.38, 1 - Math.exp(-3 * dt));
    } else {
      camS.yaw = -Math.PI / 2;
      const h = 46 + sp * 0.5; camS.pos.lerp(tmpV.set(tx, h, tz + h * 0.42), 1 - Math.exp(-6 * dt)); camS.look.set(tx, 0, tz); camS.fov = lerp(camS.fov, 50, 0.1);
    }
    camera.position.copy(camS.pos); if (shake > 0.3) camera.position.add(tmpV.set((rnd() - 0.5) * shake * 0.06, (rnd() - 0.5) * shake * 0.06, (rnd() - 0.5) * shake * 0.06));
    camera.lookAt(camS.look); if (Math.abs(camera.fov - camS.fov) > 0.1) { camera.fov = camS.fov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(pm);
  }

  // —— الليل والنهار
  function updateSky() {
    const h = game.time % 24, dk = darkness() / 0.7;
    const set = clamp(1 - Math.abs(h - 18.3) / 1.6, 0, 1) + clamp(1 - Math.abs(h - 6) / 1.4, 0, 1) * 0.7;
    skyC.copy(SKY_DAY).lerp(SKY_SET, set * (1 - dk)).lerp(SKY_NIGHT, dk);
    scene.fog.color.copy(skyC);
    const el = Math.sin(((h - 6) / 12) * Math.PI), az = ((h - 6) / 12) * Math.PI;
    hemi.intensity = lerp(1.15, 0.32, dk); hemi.color.set(dk > 0.5 ? '#6E86C9' : '#E3F1FF');
    sun.intensity = el > 0 ? lerp(2.6, 1.1, set) * (1 - dk * 0.8) : 0.35; sun.color.set(set > 0.3 ? '#FFB27A' : el > 0 ? '#FFF1D6' : '#9DB4FF');
    const P = game.car || player, tx = P.x * S, tz = P.y * S, e = Math.max(el, 0.25);
    sun.position.set(tx + Math.cos(az) * 70, 25 + e * 90, tz + 40 + Math.sin(az) * 25); sun.target.position.set(tx, 0, tz);
    houseMat.emissiveIntensity = dk * 1.1; glassMat.emissiveIntensity = dk * 1.2;
    lampGlow.material.opacity = dk; lampPool.opacity = dk * 0.55; hlMat.opacity = Math.max(0.15, dk);
    renderer.toneMappingExposure = lerp(1.08, 1.35, dk);
    const c = game.car; headSpot.intensity = c && dk > 0.2 ? 60 * dk : 0;
    if (c) { const f = fwd(c); headSpot.position.set(c.x * S + f.x * 2, 1.2, c.y * S + f.y * 2); headSpot.target.position.set(c.x * S + f.x * 22, 0, c.y * S + f.y * 22); }
    waterTex.offset.x = game.clock * 0.01; waterTex.offset.y = game.clock * 0.006;
  }

  // —— مزامنة المشهد
  const carSet = new Set(), pedSet = new Set();
  const floatEls = [];
  function sync3D(dt) {
    // السيارات
    const live = new Set(cars); carSet.forEach(c => { if (!live.has(c)) { scene.remove(c.m); carSet.delete(c); c.m = null; } });
    let hl = 0; const night = darkness() > 0.05;
    cars.forEach(c => {
      if (!c.m) { c.m = carMesh(c); carSet.add(c); }
      const u = c.m.userData;
      if (c.wreck && u.b.material !== wreckMat) u.b.material = wreckMat; else if (!c.wreck && u.col !== c.color) { u.b.material = bodyMat(c.color); u.col = c.color; }
      const y = onSlab(c.x, c.y), sp = c.vf || 0;
      c.m.position.set(c.x * S, lerp(c.m.position.y, y, 0.3), c.y * S); c.m.rotation.set(0, -c.a, 0);
      // ميلان بسيط عند الالتفاف والفرملة
      c.m.rotateX(clamp(c.spin * 0.05 + (c.lastA !== undefined ? angDiff(c.a, c.lastA) / Math.max(dt, 0.001) * sp * -0.00012 : 0), -0.08, 0.08)); c.lastA = c.a;
      if (u.sr) { const on = c.siren, f = Math.floor(game.clock * 8) % 2; u.sr.material = on && f ? sirenR : on ? sirenOff : sirenOff; u.sb.material = on && !f ? sirenB : sirenOff; if (!on) { u.sr.material = sirenR; u.sb.material = sirenB; } }
      if (night && hl < HL_MAX - 4 && !c.wreck && c.drv && c.m.position.distanceTo(camera.position) < 200) { const f = fwd(c), L = c.T.L * S / 2 + 0.1, w = c.T.Wd * S / 2 - 0.3;
        [[L, w, 1], [L, -w, 1], [-L, w, 0], [-L, -w, 0]].forEach(([a, b, front]) => { hlPos[hl * 3] = c.x * S + f.x * a - f.y * b; hlPos[hl * 3 + 1] = y + 0.75; hlPos[hl * 3 + 2] = c.y * S + f.y * a + f.x * b;
          if (front) { hlCol[hl * 3] = 1; hlCol[hl * 3 + 1] = 0.93; hlCol[hl * 3 + 2] = 0.75; } else { const br = c.brake ? 1 : 0.5; hlCol[hl * 3] = br; hlCol[hl * 3 + 1] = 0.05; hlCol[hl * 3 + 2] = 0.05; } hl++; }); }
      if (c.siren && hl < HL_MAX) { const f = Math.floor(game.clock * 8) % 2; hlPos[hl * 3] = c.x * S; hlPos[hl * 3 + 1] = y + 2.2; hlPos[hl * 3 + 2] = c.y * S; hlCol[hl * 3] = f ? 0.2 : 1; hlCol[hl * 3 + 1] = 0.2; hlCol[hl * 3 + 2] = f ? 1 : 0.2; hl++; }
      if (Math.abs(c.vf) > 80 && c.hb && rnd() < 0.5) dust(c);
    });
    for (let q = hl; q < HL_MAX; q++) hlPos[q * 3 + 1] = -100;
    hlGeo.attributes.position.needsUpdate = true; hlGeo.attributes.color.needsUpdate = true; hlMat.size = night ? 2.4 : 1.6;
    // المشاة
    const pl = new Set(peds); pedSet.forEach(p => { if (!pl.has(p)) { scene.remove(p.m); pedSet.delete(p); } });
    peds.forEach(p => { if (!p.m) { p.m = pedMesh(p); pedSet.add(p); }
      const y = onSlab(p.x, p.y);
      if (p.state === 'down') { p.m.position.set(p.x * S, y + 0.28, p.y * S); p.m.rotation.set(0, -p.a, -Math.PI / 2, 'YXZ'); }
      else { const bob = Math.abs(Math.sin(p.wt)) * 0.06; p.m.position.set(p.x * S, y + bob, p.y * S); p.m.rotation.set(0, -p.a, Math.sin(p.wt) * 0.06, 'YXZ'); } });
    // اللاعب
    playerMesh.visible = playerRing.visible = !game.car;
    if (!game.car) { const y = onSlab(player.x, player.y), bob = Math.abs(Math.sin(player.wt)) * 0.06; playerMesh.position.set(player.x * S, y + bob, player.y * S); playerMesh.rotation.set(0, -player.a, Math.sin(player.wt) * 0.06, 'YXZ'); playerRing.position.set(player.x * S, y + 0.05, player.y * S); }
    // العلامات
    const m = game.mission, t = game.clock;
    HUBS.forEach(h => { h.m.visible = !m; if (!m) { h.m.userData.icon.position.y = 4 + Math.sin(t * 3) * 0.4; h.m.userData.ring.rotation.y = t; } });
    Object.values(misMk).forEach(x => { x.visible = false; });
    if (m) { const show = (mk, p) => { mk.visible = true; mk.position.set(p.x * S, onSlab(p.x, p.y), p.y * S); if (mk.userData.icon) mk.userData.icon.position.y = 4 + Math.sin(t * 3) * 0.4; };
      if (m.k === 'taxi') show(m.stage === 'pick' ? misMk.taxiP : misMk.taxiD, m.tgt); else if (m.k === 'deliv') show(misMk.deliv, m.tgt);
      else { show(misMk.race, m.tgt); const nx = RACE[m.i + 1]; if (nx) show(misMk.race2, nx); } }
    DALLAS.forEach(d => { d.m.visible = !d.got && Math.hypot(d.x - (game.car || player).x, d.y - (game.car || player).y) < 2200; if (d.m.visible) { d.m.rotation.y = t * 1.5 + d.id; d.m.position.y = onSlab(d.x, d.y) + 0.5 + Math.sin(t * 2.5 + d.id) * 0.25; } });
    // الجسيمات
    let pi = 0;
    parts.forEach(p => { if (pi >= POOL.length) return; const s = POOL[pi++], k = p.t / p.life; s.visible = true;
      if (p.k === 'spark') { s.material.color.setRGB(1, 0.8 - k * 0.5, 0.3); s.material.opacity = 1 - k; s.material.blending = T3.AdditiveBlending; s.scale.setScalar(0.5); s.position.set(p.x * S, 0.6 + (1 - k) * 0.6, p.y * S); }
      else if (p.k === 'fire') { s.material.color.setRGB(1, 0.55 - k * 0.4, 0.15); s.material.opacity = 0.9 * (1 - k); s.material.blending = T3.AdditiveBlending; s.scale.setScalar(1.2 + k * 2.6); s.position.set(p.x * S, 0.8 + k * 1.5, p.y * S); }
      else { const v = p.dark ? 0.18 : 0.85; s.material.color.setRGB(v, v, v * 1.02); s.material.opacity = (p.dark ? 0.55 : 0.38) * (1 - k); s.material.blending = T3.NormalBlending; s.scale.setScalar(1 + k * 3.5); s.position.set(p.x * S, 0.6 + k * 2.4, p.y * S); } });
    for (let q = pi; q < POOL.length; q++) POOL[q].visible = false;
    // النصوص الطائرة
    floats.forEach(f => { if (!f.el) { f.el = document.createElement('div'); f.el.className = 'flt'; f.el.textContent = f.s; document.body.appendChild(f.el); floatEls.push(f); }
      tmpV.set(f.x * S, 3 + f.t * 2, (f.y + f.t * 30) * S).project(camera); f.el.style.transform = `translate(${(tmpV.x * 0.5 + 0.5) * W}px,${(-tmpV.y * 0.5 + 0.5) * H}px) translate(-50%,-50%)`; f.el.style.opacity = 1 - f.t / 1.6; });
    for (let q = floatEls.length - 1; q >= 0; q--) if (!floats.includes(floatEls[q])) { floatEls[q].el.remove(); floatEls.splice(q, 1); }
  }
  function render() {
    updateSky(); sync3D(1 / 60);
    renderer.render(scene, camera);
    const m = game.mission;
    drawMinimap(m ? m.tgt : null);
    const cmp = $('#cmp'); cmp.hidden = !m;
    if (m) { const P = game.car || player, a = Math.atan2(m.tgt.y - P.y, m.tgt.x - P.x) - camS.yaw - Math.PI / 2 * 0 ; cmp.style.transform = `rotate(${a + (camS.mode === 'chase' ? 0 : 0)}rad)`; setTxt('#cmpD', nA(Math.round(dist(m.tgt, P) / 8)) + ' م'); }
  }
  applyQuality();

  /* ——— الحلقة ——— */
  function update(dt) {
    game.clock = (game.clock || 0) + dt; game.time += dt / 25; game.crimeCD -= dt;
    const { kb, hb } = controls(), chase = camS.mode === 'chase';
    if (game.car) {
      const c = game.car; let thr = 0, steer = 0;
      if (kb.x || kb.y) { thr = -kb.y; steer = kb.x; }
      else if (input.jm > 0.12) {
        if (chase) { steer = clamp(input.jx * 1.35, -1, 1); thr = clamp(-input.jy * 1.25, -1, 1); if (Math.abs(thr) < 0.15 && Math.abs(steer) > 0.2) thr = 0.45; }
        else { const ja = Math.atan2(input.jy, input.jx), diff = angDiff(ja, c.a);
          if (Math.abs(diff) > 2.3 && c.vf < 60) { thr = -input.jm; steer = -Math.sign(angDiff(ja + Math.PI, c.a)) * Math.min(1, Math.abs(angDiff(ja + Math.PI, c.a)) * 2); }
          else { steer = clamp(diff * 2.3, -1, 1); thr = input.jm * (Math.abs(diff) > 1.3 ? 0.35 : 1); if (Math.abs(diff) > 1.7 && c.vf > 120) thr = -0.6; } }
      }
      c.hb = hb; stepCar(c, thr, steer, hb, dt); player.x = c.x; player.y = c.y; player.a = c.a; player.vx = c.vx; player.vy = c.vy;
    } else {
      let fx = 0, fy = 0, m = 0;
      const jx = kb.x || kb.y ? kb.x : input.jm > 0.1 ? input.jx : 0, jy = kb.x || kb.y ? kb.y : input.jm > 0.1 ? input.jy : 0;
      if (jx || jy) {
        if (chase) { const cy = Math.cos(camS.yaw), sy = Math.sin(camS.yaw); fx = cy * -jy + -sy * jx; fy = sy * -jy + cy * jx; }
        else { fx = jx; fy = jy; }
        m = Math.min(1, Math.hypot(fx, fy)); const l = Math.hypot(fx, fy) || 1; fx /= l; fy /= l;
      }
      const sp = 150 * m; player.vx = fx * sp; player.vy = fy * sp; player.x += player.vx * dt; player.y += player.vy * dt;
      if (m) { player.a = Math.atan2(fy, fx); player.wt += dt * sp / 9; }
      collideWorld(player.x, player.y, 7, h => { player.x += h.nx * h.pen; player.y += h.ny * h.pen; });
      cars.forEach(c => { const s = Math.hypot(c.vx, c.vy); if (s > 60 && circles(c).some(([x, y]) => Math.hypot(x - player.x, y - player.y) < c.T.Wd / 2 + 7)) { const f = { x: c.vx / s, y: c.vy / s }; player.x += f.x * 30 - f.y * 14; player.y += f.y * 30 + f.x * 14; shake += 5; sfx('crash', 120); } });
    }
    cars.forEach(c => { if (c.ai) aiCar(c, dt); else if (c !== game.car) stepCar(c, 0, 0, true, dt); });
    carCar(dt);
    peds.forEach(p => { if (p.state !== 'wait') stepPed(p, dt); });
    const P = game.car || player;
    for (let i = cars.length - 1; i >= 0; i--) { const c = cars[i]; if ((c.ai || c.wreck) && c !== game.car && dist(c, P) > 1900 && !(c.ai && c.ai.mode === 'chase' && game.stars)) cars.splice(i, 1); }
    if (cars.filter(c => c.ai).length < 26 && rnd() < 0.5) spawnTraffic(P);
    for (let i = peds.length - 1; i >= 0; i--) if (dist(peds[i], P) > 1300 && peds[i].state !== 'wait') peds.splice(i, 1);
    if (peds.length < 30 && rnd() < 0.5) spawnPedNear(P);
    updatePolice(dt); updateMission(dt); updateGarage(dt);
    DALLAS.forEach(d => { if (!d.got && dist(d, P) < 34) { d.got = true; save.dallas.push(d.id); pay(100); sfx('coin'); bigMsg('دلّة ذهبية!', `${nA(save.dallas.length)} من ${nA(DALLAS.length)}`, '#FCD34D'); } });
    parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; }); for (let i = parts.length - 1; i >= 0; i--) if (parts[i].t > parts[i].life) parts.splice(i, 1);
    if (parts.length > 160) parts.splice(0, parts.length - 160);
    floats.forEach(f => { f.t += dt; }); for (let i = floats.length - 1; i >= 0; i--) if (floats[i].t > 1.6) floats.splice(i, 1);
    cam.x = P.x; cam.y = P.y;
    updateCamera(dt);
    shake *= Math.exp(-6 * dt);
    game.saveT += dt; if (game.saveT > 5) { game.saveT = 0; persist(); }
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
  function fillStats() { $('#stats').innerHTML = `<div><b>${nA(save.money)}</b><span>ريال</span></div><div><b>${nA(save.dallas.length)}/${nA(DALLAS.length)}</b><span>دلال ذهبية</span></div><div><b>${nA(save.done)}</b><span>مهمة منجزة</span></div><div><b>${save.best ? nA(save.best) : '—'}</b><span>أفضل سباق (ث)</span></div>`; $('#snd').textContent = save.sound ? 'الصوت: يعمل' : 'الصوت: مغلق'; $('#qbtn').textContent = 'جودة الرسومات: ' + QUAL[qual].t; }
  $('#bPause').addEventListener('click', togglePause);
  $('#resume').addEventListener('click', togglePause);
  $('#snd').addEventListener('click', () => { save.sound = !save.sound; persist(); fillStats(); });
  $('#qbtn').addEventListener('click', () => { qual = qual === 'high' ? 'med' : qual === 'med' ? 'low' : 'high'; save.q = qual; persist(); applyQuality(); fillStats(); });
  $('#bCam').addEventListener('click', () => { camS.mode = camS.mode === 'chase' ? 'top' : 'chase'; save.cam = camS.mode; persist(); toast(camS.mode === 'chase' ? 'كاميرا خلف السيارة' : 'كاميرا من الأعلى'); });
  $('#play').addEventListener('click', () => { initAudio(); if (AC && AC.state === 'suspended') AC.resume(); $('#title').classList.add('out'); setTimeout(() => { $('#title').hidden = true; }, 600); game.started = true; document.body.classList.add('playing');
    setTimeout(() => toast('اقترب من سيارة واضغط «اركب»'), 900); setTimeout(() => toast('ابحث عن 🚕 📦 🏁 في الخريطة لتبدأ المهام'), 4200); });
  $('#tStats').innerHTML = save.dallas.length || save.done ? `رصيدك ${nA(save.money)} ر.ع · ${nA(save.dallas.length)} دلّة · ${nA(save.done)} مهمة` : 'مدينة كاملة بانتظارك';

  let last = performance.now(), acc = 0;
  for (let k = 0; k < 18; k++) spawnTraffic(player); for (let k = 0; k < 20; k++) spawnPedNear(player);
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (game.started && !game.paused) { acc += dt; while (acc > 1 / 60) { update(1 / 60); acc -= 1 / 60; } updateHUD(dt); }
    else if (!game.started) { game.clock += dt; const a = game.clock * 0.07; camS.pos.set(player.x * S + Math.cos(a) * 55, 30, player.y * S + Math.sin(a) * 55); camS.look.set(player.x * S, 2, player.y * S);
      camera.position.copy(camS.pos); camera.lookAt(camS.look); camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(pm); cars.forEach(c => { if (c.ai) aiCar(c, dt); }); carCar(dt); }
    render(); updateAudio();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.started && !game.paused) togglePause(); });
  window.__game = { game, player, cars, peds, save, HUBS, DALLAS, startMission, enterCar, nearestCar, input, cam, camS, renderer };
})();
