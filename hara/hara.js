/* حارة — كرة الشوارع (تصميم أصلي) · الشخصيات: KayKit (CC0) */
(() => {
  'use strict';
  const T3 = THREE, V3 = T3.Vector3;
  const $ = s => document.querySelector(s);
  const AR = '٠١٢٣٤٥٦٧٨٩', nA = x => String(x).replace(/\d/g, d => AR[d]);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t, rnd = Math.random;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  /* ——— المشهد ——— */
  const cv = $('#cv');
  const renderer = new T3.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.6 : 2));
  const scene = new T3.Scene(), camera = new T3.PerspectiveCamera(40, 1, 0.5, 600);
  let W = 1, H = 1;
  function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return [c, c.getContext('2d')]; };
  const tex = (c, rep) => { const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (rep) t.wrapS = t.wrapT = T3.RepeatWrapping; return t; };

  // سماء الغروب
  const [sc, sg] = mk(16, 512), gr = sg.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#1B2350'); gr.addColorStop(0.45, '#6A3E7A'); gr.addColorStop(0.7, '#F08A5D'); gr.addColorStop(0.85, '#FFC27A'); gr.addColorStop(1, '#FFE2A8');
  sg.fillStyle = gr; sg.fillRect(0, 0, 16, 512);
  const skyT = tex(sc); scene.background = skyT; scene.fog = new T3.Fog('#C9806A', 70, 230);
  scene.add(new T3.HemisphereLight('#FFD9B5', '#4A3A5A', 1.25));
  const sun = new T3.DirectionalLight('#FFC38A', 2.4); sun.position.set(-30, 40, 25); sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 18, bottom: -18, near: 5, far: 120 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const CW = 20, CH = 10; // نصف أبعاد الملعب
  // أرضية الترتان
  (() => {
    const [c, g] = mk(2048, 1024), k = 2048 / (CW * 2 + 4);
    g.fillStyle = '#2E8B3E'; g.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.05)'; g.fillRect(i * 2048 / 14, 0, 2048 / 14, 1024); }
    for (let q = 0; q < 40000; q++) { g.fillStyle = rnd() < 0.5 ? 'rgba(160,220,140,.18)' : 'rgba(10,60,20,.18)'; g.fillRect(rnd() * 2048, rnd() * 1024, 2, 3); }
    g.translate(1024, 512); g.scale(k, k); g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 0.12;
    g.strokeRect(-CW, -CH, CW * 2, CH * 2); g.beginPath(); g.moveTo(0, -CH); g.lineTo(0, CH); g.stroke();
    g.beginPath(); g.arc(0, 0, 3, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 0.18, 0, 7); g.fill();
    [-1, 1].forEach(s => { g.beginPath(); g.arc(s * CW, 0, 6, s > 0 ? Math.PI / 2 : -Math.PI / 2, s > 0 ? Math.PI * 1.5 : Math.PI / 2); g.stroke(); g.beginPath(); g.arc(s * (CW - 6), 0, 0.15, 0, 7); g.fill(); });
    g.font = '900 2.4px Thmanyah, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,.16)'; g.fillText('حارة', 0, 0.2);
    const t = tex(c); const m = new T3.Mesh(new T3.PlaneGeometry(CW * 2 + 4, CH * 2 + 2).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial({ map: t, roughness: 0.92 }));
    m.receiveShadow = true; scene.add(m);
    const conc = new T3.Mesh(new T3.PlaneGeometry(400, 400).rotateX(-Math.PI / 2).translate(0, -0.02, 0), new T3.MeshStandardMaterial({ color: '#B9A98C', roughness: 1 })); conc.receiveShadow = true; scene.add(conc);
  })();
  // الحواجز الإعلانية
  const ADS = [['كمّل', '#B8F34A', '#0B1A06'], ['شوارع', '#FDE047', '#7C2D12'], ['ميزان', '#16A34A', '#fff'], ['ثبات', '#0F172A', '#FDE68A'], ['أهدافي', '#1E1B4B', '#FDE68A'], ['تحدي ٣٠ يوم', '#0D9488', '#fff']];
  function adTex(i) { const [c, g] = mk(512, 64), a = ADS[i % ADS.length]; g.fillStyle = a[1]; g.fillRect(0, 0, 512, 64); g.fillStyle = a[2]; g.font = '900 40px Thmanyah, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a[0], 256, 36); return tex(c); }
  const boardH = 0.9;
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 8; i++) { const w = CW * 2 / 8, b = new T3.Mesh(new T3.BoxGeometry(w - 0.05, boardH, 0.12), [0, 1, 2, 3, 4, 5].map(f => f === (side < 0 ? 4 : 5) ? new T3.MeshBasicMaterial({ map: adTex(i + (side > 0 ? 3 : 0)) }) : new T3.MeshStandardMaterial({ color: '#2B2B33' })));
    b.position.set(-CW + w / 2 + i * w, boardH / 2, side * (CH + 0.1)); b.castShadow = true; scene.add(b); }
  [-1, 1].forEach(s => [-1, 1].forEach(z => { const w = CH - 1.6, b = new T3.Mesh(new T3.BoxGeometry(0.12, boardH, w), new T3.MeshStandardMaterial({ color: '#2B2B33' })); b.position.set(s * (CW + 0.1), boardH / 2, z * (1.6 + w / 2)); scene.add(b); }));
  // الشبك المحيط
  const [nc, ng] = mk(64); ng.strokeStyle = 'rgba(230,230,235,.55)'; ng.lineWidth = 3; ng.beginPath(); ng.moveTo(0, 0); ng.lineTo(64, 64); ng.moveTo(64, 0); ng.lineTo(0, 64); ng.stroke();
  const netT = tex(nc, true);
  const fenceMat = new T3.MeshBasicMaterial({ map: netT, transparent: true, side: T3.DoubleSide, depthWrite: false });
  const fence = (w, h, x, y, z, ry) => { const t = netT.clone(); t.repeat.set(w / 0.5, h / 0.5); t.needsUpdate = true; const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: t, transparent: true, side: T3.DoubleSide, depthWrite: false })); m.position.set(x, y, z); m.rotation.y = ry || 0; scene.add(m); };
  fence(CW * 2 + 0.4, 3.2, 0, boardH + 1.6, -(CH + 0.2)); fence(CH * 2 + 0.4, 4.2, -(CW + 0.3), 2.1, 0, Math.PI / 2); fence(CH * 2 + 0.4, 4.2, CW + 0.3, 2.1, 0, Math.PI / 2);
  const postMat = new T3.MeshStandardMaterial({ color: '#3A3F48', metalness: 0.6, roughness: 0.4 });
  for (let x = -CW; x <= CW; x += 5) [-1].forEach(s => { const p = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.06, 4.8, 8), postMat); p.position.set(x, 2.4, s * (CH + 0.2)); scene.add(p); });
  // المرميان
  const GW = 1.6, GH = 2;
  const gpMat = new T3.MeshStandardMaterial({ color: '#F5F5F5', roughness: 0.4 });
  [-1, 1].forEach(s => {
    const x = s * CW, g = new T3.Group();
    [[0, GH / 2, -GW], [0, GH / 2, GW]].forEach(p => { const m = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.07, GH, 10), gpMat); m.position.set(...p); m.castShadow = true; g.add(m); });
    const bar = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.07, GW * 2 + 0.14, 10).rotateX(Math.PI / 2), gpMat); bar.position.y = GH; bar.castShadow = true; g.add(bar);
    const nt = netT.clone(); nt.repeat.set(8, 5); nt.needsUpdate = true; const nm = new T3.MeshBasicMaterial({ map: nt, transparent: true, side: T3.DoubleSide, depthWrite: false, color: '#fff' });
    const back = new T3.Mesh(new T3.PlaneGeometry(GW * 2, GH), nm); back.position.set(s * 1.2, GH / 2, 0); back.rotation.y = Math.PI / 2; g.add(back);
    const top = new T3.Mesh(new T3.PlaneGeometry(1.2, GW * 2), nm); top.rotation.x = -Math.PI / 2; top.position.set(s * 0.6, GH, 0); g.add(top);
    [-1, 1].forEach(z => { const sd = new T3.Mesh(new T3.PlaneGeometry(1.2, GH), nm); sd.position.set(s * 0.6, GH / 2, z * GW); g.add(sd); });
    g.position.x = x; scene.add(g);
  });
  // أعمدة الإنارة
  const glowT = (() => { const [c, g] = mk(128), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,240,200,.6)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new T3.CanvasTexture(c); })();
  [[-CW - 2, -CH - 2], [CW + 2, -CH - 2], [-CW - 2, CH + 3], [CW + 2, CH + 3]].forEach(([x, z]) => {
    const p = new T3.Mesh(new T3.CylinderGeometry(0.15, 0.22, 12, 8), postMat); p.position.set(x, 6, z); p.castShadow = true; scene.add(p);
    const h = new T3.Mesh(new T3.BoxGeometry(1.6, 0.9, 0.3), new T3.MeshStandardMaterial({ color: '#222', emissive: '#FFF3D0', emissiveIntensity: 0.9 })); h.position.set(x, 12.2, z); h.lookAt(0, 0, 0); scene.add(h);
    const s = new T3.Sprite(new T3.SpriteMaterial({ map: glowT, color: '#FFE9B8', transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); s.scale.set(7, 7, 1); s.position.set(x, 12.2, z); scene.add(s);
  });
  const fill = new T3.PointLight('#FFE7C2', 60, 70, 1.4); fill.position.set(0, 14, 6); scene.add(fill);
  // الحارة حول الملعب: بيوت ونخيل وجامع
  (() => {
    const [wc, wg] = mk(128); wg.fillStyle = '#F2E8D5'; wg.fillRect(0, 0, 128, 128); wg.fillStyle = '#C9B48E'; wg.fillRect(0, 120, 128, 8);
    wg.fillStyle = '#FFC872'; wg.beginPath(); wg.moveTo(40, 50); wg.arc(64, 50, 24, Math.PI, 0); wg.lineTo(88, 100); wg.lineTo(40, 100); wg.fill(); wg.fillStyle = '#E2D3B5'; wg.fillRect(62, 30, 4, 70);
    const wt = tex(wc, true), houses = [];
    const mats = ['#EFE4CF', '#E6D7BA', '#F5EEE0', '#DDCBA8'].map(c => new T3.MeshStandardMaterial({ color: c, map: wt, emissive: '#FFB55A', emissiveMap: wt, emissiveIntensity: 0.35, roughness: 0.9 }));
    const roofM = new T3.MeshStandardMaterial({ color: '#D8C8A8', roughness: 1 });
    const ring = (r0, r1, n) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rnd() * 0.1, r = r0 + rnd() * (r1 - r0), x = Math.cos(a) * r * 1.6, z = Math.sin(a) * r;
      if (Math.abs(x) < CW + 8 && Math.abs(z) < CH + 8) continue;
      const w = 6 + rnd() * 6, d = 6 + rnd() * 5, h = 5 + Math.floor(rnd() * 3) * 3.2, m = mats[i % 4].clone(); m.map = wt.clone(); m.map.needsUpdate = true; m.map.repeat.set(Math.round(w / 3), h / 3.2); m.emissiveMap = m.map;
      const b = new T3.Mesh(new T3.BoxGeometry(w, h, d), [m, m, roofM, roofM, m, m]); b.position.set(x, h / 2, z); b.rotation.y = -a + Math.PI / 2; b.castShadow = true; b.receiveShadow = true; scene.add(b);
      const tk = new T3.Mesh(new T3.CylinderGeometry(0.8, 0.8, 1.2, 10), new T3.MeshStandardMaterial({ color: '#fff' })); tk.position.set(x + 1, h + 0.6, z); scene.add(tk); } };
    ring(26, 40, 30); ring(44, 60, 34);
    // جامع
    const mq = new T3.Mesh(new T3.BoxGeometry(14, 8, 12), new T3.MeshStandardMaterial({ color: '#F4EFE4' })); mq.position.set(10, 4, -48); scene.add(mq);
    const gold = new T3.MeshStandardMaterial({ color: '#E2B23C', metalness: 0.7, roughness: 0.3, emissive: '#5A3A00', emissiveIntensity: 0.5 });
    const dm = new T3.Mesh(new T3.SphereGeometry(4.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), gold); dm.position.set(10, 8, -48); scene.add(dm);
    const mn = new T3.Mesh(new T3.CylinderGeometry(0.9, 1.1, 22, 12), new T3.MeshStandardMaterial({ color: '#F4EFE4' })); mn.position.set(20, 11, -52); scene.add(mn);
    const mc = new T3.Mesh(new T3.ConeGeometry(1.2, 3, 12), gold); mc.position.set(20, 23.5, -52); scene.add(mc);
    // نخيل
    const palm = () => { const g = new T3.Group(), tr = new T3.Mesh(new T3.CylinderGeometry(0.18, 0.32, 8, 7), new T3.MeshStandardMaterial({ color: '#8B6A43' })); tr.position.y = 4; g.add(tr);
      const lm = new T3.MeshStandardMaterial({ color: '#2F8A3A', side: T3.DoubleSide });
      for (let q = 0; q < 8; q++) { const l = new T3.Mesh(new T3.ConeGeometry(0.45, 4, 4).scale(1, 1, 0.25).translate(0, 2, 0), lm); l.rotation.set(0, q / 8 * Math.PI * 2, -1.15); const p = new T3.Group(); p.add(l); p.rotation.y = q / 8 * Math.PI * 2; p.position.y = 8; l.rotation.set(0, 0, -1.15); g.add(p); }
      g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; };
    [[-CW - 5, -CH - 5], [CW + 5, -CH - 5], [-CW - 6, CH + 6], [CW + 6, CH + 7], [0, -CH - 7], [-12, CH + 9], [13, CH + 9]].forEach(([x, z]) => { const p = palm(); p.position.set(x, 0, z); p.scale.setScalar(0.9 + rnd() * 0.3); scene.add(p); });
    // جبال بعيدة
    const mtn = new T3.MeshBasicMaterial({ color: '#4E3A5E', fog: false });
    for (let i = 0; i < 9; i++) { const m = new T3.Mesh(new T3.ConeGeometry(30 + rnd() * 25, 25 + rnd() * 25, 5), mtn); m.position.set(-160 + i * 40, 8, -170 - rnd() * 20); scene.add(m); }
  })();

  /* ——— الكرة ——— */
  const BR = 0.2;
  const ballT = (() => { const [c, g] = mk(256, 128); g.fillStyle = '#FAFAFA'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#16161A';
    for (let i = 0; i < 12; i++) { const x = (i % 6) * 43 + (i > 5 ? 21 : 0), y = i > 5 ? 88 : 38; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13); } g.fill(); }
    g.fillStyle = '#C0392B'; g.fillRect(0, 60, 256, 6); return tex(c); })();
  const ballM = new T3.Mesh(new T3.SphereGeometry(BR, 24, 16), new T3.MeshStandardMaterial({ map: ballT, roughness: 0.45 })); ballM.castShadow = true; scene.add(ballM);
  const ball = { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, owner: null, last: null, gold: false, shotBy: null, gkTried: false };
  const trail = []; for (let i = 0; i < 14; i++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: glowT, color: '#FFB020', transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); s.visible = false; scene.add(s); trail.push(s); }

  /* ——— اللاعبون ——— */
  const TEAMS = [{ name: 'أهل الحارة', col: '#F5F5F5', dir: 1 }, { name: 'الضيوف', col: '#9F1239', dir: -1 }];
  const ROLES = ['gk', 'def', 'mid', 'att'];
  const HOME = { gk: [-18.6, 0], def: [-11, 0], mid: [-5, -4.5], att: [-2.2, 3.5] };
  const players = [];
  let clips = {}, models = {};
  const ring = new T3.Mesh(new T3.RingGeometry(0.55, 0.72, 32).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ color: '#B8F34A', transparent: true, opacity: 0.95, depthWrite: false }));
  ring.position.y = 0.03; scene.add(ring);
  const arrow = new T3.Mesh(new T3.ConeGeometry(0.22, 0.45, 3).rotateX(Math.PI / 2).translate(0, 0, 0.95), new T3.MeshBasicMaterial({ color: '#B8F34A' })); scene.add(arrow);
  function makePlayer(team, role, kind) {
    const g = SkeletonUtils.clone(models[kind].scene);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; if (/Body$/.test(o.name)) { o.material = o.material.clone(); o.material.map = null; o.material.color.set(team === 0 ? (role === 'gk' ? '#FACC15' : TEAMS[0].col) : (role === 'gk' ? '#0EA5E9' : TEAMS[1].col)); o.material.roughness = 0.6; } } });
    g.scale.setScalar(0.88); scene.add(g);
    const mixer = new T3.AnimationMixer(g), A = {};
    Object.entries({ idle: 'Idle', run: 'Running_A', dribble: 'Running_B', kick: 'Unarmed_Melee_Attack_Kick', sl: 'Dodge_Left', sr: 'Dodge_Right', hit: 'Hit_A', cheer: 'Cheer', jump: 'Jump_Full_Short' }).forEach(([k, n]) => { if (clips[n]) A[k] = mixer.clipAction(clips[n]); });
    ['kick', 'sl', 'sr', 'hit', 'jump'].forEach(k => { if (A[k]) { A[k].setLoop(T3.LoopOnce, 1); A[k].clampWhenFinished = true; } });
    A.kick && A.kick.setEffectiveTimeScale(1.7);
    const p = { team, role, g, mixer, A, cur: null, x: 0, z: 0, vx: 0, vz: 0, face: team === 0 ? Math.PI / 2 : -Math.PI / 2, act: 0, actK: null, stun: 0, kickCD: 0, tackCD: 0, skill: 0, think: 0, near: 0 };
    play(p, 'idle'); players.push(p); return p;
  }
  function play(p, k, fade = 0.15) {
    if (p.cur === k || !p.A[k]) return; const a = p.A[k]; a.reset().fadeIn(fade).play(); if (p.cur && p.A[p.cur]) p.A[p.cur].fadeOut(fade); p.cur = k;
  }
  function oneShot(p, k, dur) { p.actK = k; p.act = dur; const a = p.A[k]; if (!a) return; a.reset().setEffectiveWeight(1).fadeIn(0.06).play(); if (p.cur && p.cur !== k && p.A[p.cur]) p.A[p.cur].fadeOut(0.06); p.cur = k; }

  /* ——— الحالة ——— */
  const DIFF = { 1: { sp: 5.3, tack: 0.45, think: 0.45 }, 2: { sp: 5.9, tack: 0.6, think: 0.32 }, 3: { sp: 6.4, tack: 0.75, think: 0.22 } };
  const SAVE = 'hara:save'; let sv = { wins: 0, played: 0, goals: 0, diff: 2 }; try { Object.assign(sv, JSON.parse(localStorage.getItem(SAVE)) || {}); } catch (e) {}
  const persist = () => { try { localStorage.setItem(SAVE, JSON.stringify(sv)); } catch (e) {} };
  const G = { on: false, paused: false, score: [0, 0], time: 180, freeze: 0, ctl: null, style: 0, kickTeam: 0, over: false, charge: -1, clock: 0 };
  const ownGoalX = t => t === 0 ? -CW : CW, oppGoalX = t => t === 0 ? CW : -CW;
  const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  function kickoff(team) {
    players.forEach(p => { const h = HOME[p.role], s = p.team === 0 ? 1 : -1; p.x = h[0] * s; p.z = h[1] * (p.team === 0 ? 1 : -1); p.vx = p.vz = 0; p.face = p.team === 0 ? Math.PI / 2 : -Math.PI / 2; p.stun = 0; p.act = 0; p.actK = null; play(p, 'idle'); });
    const k = players.find(p => p.team === team && p.role === 'att'); k.x = team === 0 ? -0.6 : 0.6; k.z = 0;
    Object.assign(ball, { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, owner: null, gold: false, shotBy: null, gkTried: false });
    G.ctl = players.find(p => p.team === 0 && p.role === (team === 0 ? 'att' : 'mid'));
  }

  /* ——— الكرة: فيزياء ——— */
  function release(p) { if (ball.owner === p) ball.owner = null; p.kickCD = 0.35; ball.last = p; }
  function kickBall(p, tx, tz, speed, lift) {
    release(p); const dx = tx - ball.x, dz = tz - ball.z, d = Math.hypot(dx, dz) || 1;
    ball.vx = dx / d * speed; ball.vz = dz / d * speed; ball.vy = lift; ball.y = Math.max(ball.y, BR + 0.02);
    oneShot(p, 'kick', 0.42); p.face = Math.atan2(dx, dz); sfx('kick', speed);
  }
  function stepBall(dt) {
    if (ball.owner) {
      const p = ball.owner, fx = Math.sin(p.face), fz = Math.cos(p.face), sp = Math.hypot(p.vx, p.vz), wob = Math.sin(G.clock * 14) * 0.08 * Math.min(1, sp / 5);
      const tx = p.x + fx * (0.62 + wob), tz = p.z + fz * (0.62 + wob);
      ball.vx = (tx - ball.x) / dt * 0.35; ball.vz = (tz - ball.z) / dt * 0.35; ball.x += (tx - ball.x) * 0.35; ball.z += (tz - ball.z) * 0.35; ball.y = BR; ball.vy = 0;
    } else {
      ball.vy -= 20 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.z += ball.vz * dt;
      if (ball.y < BR) { ball.y = BR; if (ball.vy < -1.5) { ball.vy = -ball.vy * 0.5; sfx('bounce', -ball.vy); } else ball.vy = 0; }
      if (ball.y <= BR + 0.01) { const f = Math.exp(-1.1 * dt); ball.vx *= f; ball.vz *= f; }
      // الجدران
      if (Math.abs(ball.z) > CH - BR) { ball.z = Math.sign(ball.z) * (CH - BR); ball.vz = -ball.vz * 0.72; sfx('wall', Math.abs(ball.vz)); }
      if (Math.abs(ball.x) > CW - BR) {
        const inMouth = Math.abs(ball.z) < GW - BR && ball.y < GH - BR;
        if (inMouth) { if (Math.abs(ball.x) > CW + 0.35) return goal(ball.x > 0 ? 0 : 1); }
        else if (Math.abs(ball.x) < CW + 0.2) { ball.x = Math.sign(ball.x) * (CW - BR); ball.vx = -ball.vx * 0.72; sfx('wall', Math.abs(ball.vx)); }
        else { ball.vx *= -0.3; ball.x = Math.sign(ball.x) * (CW + 0.3); }
      }
      if (ball.y > 5) { ball.y = 5; ball.vy = -Math.abs(ball.vy) * 0.5; }
      // الحارس
      players.forEach(p => { if (p.role !== 'gk' || ball.gkTried || p.stun > 0) return;
        const toward = (p.team === 0 ? -1 : 1) * ball.vx > 6, d = dist2(p, ball);
        if (toward && d < 1.6 && ball.y < 2.4) { ball.gkTried = true; const sp = Math.hypot(ball.vx, ball.vz), pr = ball.gold ? 0 : clamp(1.35 - sp / 22, 0.1, 0.92) * (p.team === 0 ? 0.85 : DIFF[sv.diff].tack + 0.3);
          if (rnd() < pr) { ball.owner = p; ball.vx = ball.vz = ball.vy = 0; oneShot(p, 'jump', 0.5); say(p.team === 0 ? 'صدّة رائعة من حارسنا!' : 'صدّها الحارس!'); sfx('save'); }
          else oneShot(p, 'jump', 0.5); } });
      // الالتقاط
      if (ball.y < 0.7) { let best = null, bd = 0.75; players.forEach(p => { if (p.kickCD > 0 || p.stun > 0) return; const d = dist2(p, ball); if (d < bd) { bd = d; best = p; } });
        if (best) { const prevTeam = ball.last && ball.last.team; ball.owner = best; ball.gold = false; ball.gkTried = false; ball.shotBy = null;
          if (best.team === 0 && best.role !== 'gk') G.ctl = best; else if (best.team === 1 && prevTeam === 0) G.ctl = nearestTo(0, ball, true); } }
    }
  }
  const nearestTo = (team, pt, noGK) => { let b = null, bd = 1e9; players.forEach(p => { if (p.team !== team || (noGK && p.role === 'gk')) return; const d = dist2(p, pt); if (d < bd) { bd = d; b = p; } }); return b; };

  /* ——— الأفعال ——— */
  function pass(p, to) {
    if (!to) { const fx = Math.sin(p.face), fz = Math.cos(p.face); let best = null, bs = -1e9;
      players.forEach(q => { if (q.team !== p.team || q === p) return; const dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz), dot = (dx * fx + dz * fz) / (d || 1);
        const s = dot * 3 - d * 0.12 - (q.role === 'gk' ? 4 : 0) - blockedBy(p, q) * 3; if (s > bs) { bs = s; best = q; } }); to = best; }
    if (!to) return;
    const lead = 0.45, tx = to.x + to.vx * lead, tz = to.z + to.vz * lead, d = Math.hypot(tx - p.x, tz - p.z);
    kickBall(p, tx, tz, clamp(d * 1.7 + 4, 8, 19), d > 12 ? 3.5 : 0.6);
    if (p.team === 0) G.ctl = to;
  }
  function blockedBy(p, q) { let n = 0; players.forEach(o => { if (o.team === p.team) return; const ax = q.x - p.x, az = q.z - p.z, L = Math.hypot(ax, az) || 1, t = ((o.x - p.x) * ax + (o.z - p.z) * az) / (L * L); if (t < 0 || t > 1) return; const px = p.x + ax * t, pz = p.z + az * t; if (Math.hypot(o.x - px, o.z - pz) < 1.1) n++; }); return n; }
  function shoot(p, power, aimZ) {
    const gx = oppGoalX(p.team) + (p.team === 0 ? 0.6 : -0.6), gk = players.find(q => q.team !== p.team && q.role === 'gk');
    let tz = aimZ !== undefined ? aimZ : (gk && gk.z > 0 ? -1 : 1) * (0.6 + rnd() * 0.8);
    tz = clamp(tz, -GW + 0.25, GW - 0.25);
    const gold = p.team === 0 && G.style >= 100;
    const sp = gold ? 30 : lerp(14, 25, power), d = Math.hypot(gx - ball.x, tz - ball.z), tFly = d / sp, lift = clamp((lerp(0.4, 1.7, power) + (gold ? 0.3 : 0) - BR) / tFly + 10 * tFly, 1, 9);
    kickBall(p, gx, tz, sp, lift); ball.shotBy = p; ball.gkTried = false;
    if (gold) { ball.gold = true; G.style = 0; say('الضربة الذهبية! 🔥', true); sfx('gold'); }
  }
  function skill(p) {
    if (p.skill > 0 || p.stun > 0) return; const s = rnd() < 0.5 ? 1 : -1, fx = Math.sin(p.face), fz = Math.cos(p.face);
    p.skill = 0.45; p.vx = (fx + fz * s * 1.1) * 8; p.vz = (fz - fx * s * 1.1) * 8; oneShot(p, s > 0 ? 'sr' : 'sl', 0.45); sfx('whoosh');
    const beat = players.some(o => o.team !== p.team && dist2(o, p) < 2.2);
    if (p.team === 0) { G.style = Math.min(100, G.style + (beat ? 28 : 12)); if (beat) say(pick(['مراوغة خطيرة!', 'يا سلام على الحركة!', 'تلاعب فيه!', 'لعبة شوارع أصيلة!'])); }
  }
  function tackle(p) {
    if (p.tackCD > 0 || p.stun > 0) return; p.tackCD = 0.9; const o = ball.owner;
    const fx = Math.sin(p.face), fz = Math.cos(p.face); p.vx = fx * 9; p.vz = fz * 9; oneShot(p, 'kick', 0.4);
    if (o && o.team !== p.team && dist2(o, p) < 1.5 && o.skill <= 0) {
      const ch = p.team === 0 ? 0.82 : DIFF[sv.diff].tack;
      if (rnd() < ch) { ball.owner = null; ball.vx = fx * 5 + (rnd() - 0.5) * 3; ball.vz = fz * 5 + (rnd() - 0.5) * 3; ball.last = p; o.stun = 0.75; o.kickCD = 0.6; oneShot(o, 'hit', 0.6); sfx('tackle');
        if (p.team === 0) say(pick(['افتكّها بقوة!', 'قطع رائع!'])); }
    }
  }
  const pick = a => a[Math.floor(rnd() * a.length)];

  /* ——— الذكاء ——— */
  function aiTarget(p) {
    const t = p.team, dir = TEAMS[t].dir, own = ownGoalX(t), hasBall = ball.owner && ball.owner.team === t, bx = ball.x, bz = ball.z;
    if (p.role === 'gk') { const gx = own + dir * 0.9, d = Math.hypot(bx - own, bz);
      if (!ball.owner && d < 6) return { x: bx, z: bz, run: 1 };
      return { x: gx + dir * clamp((8 - d) * 0.05, 0, 0.8), z: clamp(bz * 0.45, -GW + 0.3, GW - 0.3), run: 0.8 }; }
    if (hasBall) {
      if (p.role === 'def') return { x: lerp(own, bx, 0.5), z: clamp(-bz * 0.3, -4, 4) };
      if (p.role === 'mid') return { x: clamp(bx + dir * 3, -CW + 3, CW - 3), z: bz > 0 ? -4.5 : 4.5 };
      return { x: clamp(bx + dir * 7, -CW + 4, CW - 4), z: bz > 0 ? -2.5 : 2.5 };
    }
    const chaser = nearestTo(t, ball, true);
    if (p === chaser) return { x: ball.x + ball.vx * 0.25, z: ball.z + ball.vz * 0.25, run: 1, chase: true };
    if (p.role === 'def') return { x: lerp(own, bx, 0.35), z: bz * 0.5 };
    if (p.role === 'mid') return { x: bx - dir * 3.5, z: clamp(bz + (p.z > bz ? 3 : -3), -8, 8) };
    return { x: bx - dir * 1.5, z: bz > 0 ? -4 : 4 };
  }
  function aiThink(p) {
    const t = p.team, dir = TEAMS[t].dir, gx = oppGoalX(t), dG = Math.hypot(gx - p.x, p.z);
    const press = players.some(o => o.team !== t && dist2(o, p) < 1.8);
    if (p.role === 'gk') { const mate = players.filter(q => q.team === t && q.role !== 'gk').sort((a, b) => blockedBy(p, a) - blockedBy(p, b) || Math.abs(a.z) - Math.abs(b.z))[0]; return pass(p, mate); }
    if (dG < 11 && Math.abs(p.z) < 7 && rnd() < 0.75) return shoot(p, clamp(0.35 + rnd() * 0.6, 0, 1));
    if (press) { if (rnd() < 0.3) return skill(p); const mates = players.filter(q => q.team === t && q !== p && q.role !== 'gk' && blockedBy(p, q) === 0 && (q.x - p.x) * dir > -4); if (mates.length && rnd() < 0.75) return pass(p, pick(mates)); }
    if (rnd() < 0.08) { const fwd = players.filter(q => q.team === t && q !== p && (q.x - p.x) * dir > 3 && blockedBy(p, q) === 0); if (fwd.length) return pass(p, pick(fwd)); }
  }
  function stepPlayers(dt) {
    const D = DIFF[sv.diff];
    players.forEach(p => {
      p.mixer.update(dt); p.kickCD -= dt; p.tackCD -= dt; p.skill -= dt; p.act -= dt;
      if (p.stun > 0) { p.stun -= dt; p.vx *= 0.9; p.vz *= 0.9; }
      else if (p.skill > 0) { p.vx *= 0.96; p.vz *= 0.96; }
      else if (G.freeze > 0) { p.vx *= 0.85; p.vz *= 0.85; }
      else {
        let dx = 0, dz = 0, sp = 0;
        if (p === G.ctl) { dx = input.mx; dz = input.mz; const m = Math.hypot(dx, dz); sp = 6.3 * Math.min(1, m) * (ball.owner === p ? 0.9 : 1); if (m) { dx /= m; dz /= m; } }
        else {
          const tg = aiTarget(p), ex = tg.x - p.x, ez = tg.z - p.z, d = Math.hypot(ex, ez);
          if (ball.owner === p) { const t = p.team, gx = oppGoalX(t); let ax = gx - p.x, az = -p.z * 0.6; players.forEach(o => { if (o.team !== t) { const ox = p.x - o.x, oz = p.z - o.z, od = Math.hypot(ox, oz); if (od < 3) { ax += ox / od * (3 - od) * 1.6; az += oz / od * (3 - od) * 2.2; } } });
            const L = Math.hypot(ax, az) || 1; dx = ax / L; dz = az / L; sp = D.sp * 0.88;
            p.think -= dt; if (p.think <= 0) { p.think = D.think + rnd() * 0.3; aiThink(p); } }
          else if (d > 0.35) { dx = ex / d; dz = ez / d; sp = Math.min(d * 2.2, (tg.run ? 1 : 0.85) * (p.team === 0 ? 5.9 : D.sp)); }
          if (tg && tg.chase && ball.owner && ball.owner.team !== p.team && dist2(p, ball.owner) < 1.25) { p.near += dt; if (p.near > (p.team === 0 ? 0.5 : 0.65 - sv.diff * 0.1)) { p.near = 0; tackle(p); } } else p.near = 0;
        }
        const k = 1 - Math.exp(-14 * dt); p.vx = lerp(p.vx, dx * sp, k); p.vz = lerp(p.vz, dz * sp, k);
      }
      p.x += p.vx * dt; p.z += p.vz * dt;
      p.x = clamp(p.x, -CW + 0.4, CW - 0.4); p.z = clamp(p.z, -CH + 0.4, CH - 0.4);
      const spd = Math.hypot(p.vx, p.vz);
      if (spd > 0.4 && p.stun <= 0) { const want = Math.atan2(p.vx, p.vz); let d = want - p.face; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; p.face += d * Math.min(1, dt * 12); }
      else if (G.freeze <= 0 && p.stun <= 0 && p !== G.ctl) { const want = Math.atan2(ball.x - p.x, ball.z - p.z); let d = want - p.face; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; p.face += d * Math.min(1, dt * 5); }
      if (p.act <= 0 && G.freeze <= 0) play(p, spd > 0.8 ? (ball.owner === p ? 'dribble' : 'run') : 'idle');
      if (p.A.run) { p.A.run.setEffectiveTimeScale(clamp(spd / 5.5, 0.6, 1.4)); }
      p.g.position.set(p.x, 0, p.z); p.g.rotation.y = p.face;
    });
    // تباعد اللاعبين
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) { const a = players[i], b = players[j], dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz);
      if (d < 0.8 && d > 0) { const pu = (0.8 - d) / 2; a.x += dx / d * pu; a.z += dz / d * pu; b.x -= dx / d * pu; b.z -= dz / d * pu; } }
  }

  /* ——— الأهداف ——— */
  function goal(team) {
    if (G.freeze > 0) return; G.score[team]++; G.freeze = 3.2; G.kickTeam = 1 - team; ball.vx *= 0.2; ball.vz *= 0.2;
    const scorer = ball.shotBy || ball.last;
    players.forEach(p => { if (p.team === team) oneShot(p, 'cheer', 3); });
    if (team === 0) { sv.goals++; persist(); say(pick(['هدددف! 🔥', 'يا سلام! هدف خرافي!', 'في الشبكة!', 'هدف من الآخر!']), true); }
    else say(pick(['هدف للضيوف…', 'سجّلوا علينا!']), true);
    sfx('goal'); setScore(); shake = 0.6;
    setTimeout(() => { if (!G.over) kickoff(G.kickTeam); }, 3000);
  }

  /* ——— الكاميرا ——— */
  const camT = new V3(), camL = new V3(); let shake = 0;
  function updateCam(dt) {
    const portrait = H > W, bx = clamp(ball.x, -CW + 6, CW - 6);
    const dz = portrait ? 31 : 23, hy = portrait ? 27 : 16.5;
    camT.set(bx * 0.82, hy, dz + ball.z * 0.15); camL.set(bx * 0.9, 0, ball.z * 0.35 - (portrait ? 1 : 0));
    if (G.freeze > 1) { camT.set(ball.x * 0.7, 9, ball.z + 13); camL.set(ball.x * 0.85, 1, ball.z); }
    camera.position.lerp(camT, 1 - Math.exp(-3.2 * dt));
    if (shake > 0) { camera.position.x += (rnd() - 0.5) * shake; camera.position.y += (rnd() - 0.5) * shake; shake *= Math.exp(-5 * dt); if (shake < 0.01) shake = 0; }
    camera.lookAt(camL); camera.fov = portrait ? 52 : 40; camera.updateProjectionMatrix();
  }

  /* ——— التحكم ——— */
  const input = { mx: 0, mz: 0, keys: {} };
  const joy = $('#joy'), knob = $('#knob'); let jid = null, jo = null, jv = { x: 0, y: 0 };
  $('#ctl').addEventListener('touchstart', e => { initAudio(); for (const t of e.changedTouches) if (jid === null && t.clientX < W * 0.5 && !t.target.closest('button')) { jid = t.identifier; jo = { x: t.clientX, y: t.clientY }; joy.style.left = jo.x - 60 + 'px'; joy.style.top = jo.y - 60 + 'px'; joy.classList.add('on'); } }, { passive: true });
  addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === jid) { let dx = t.clientX - jo.x, dy = t.clientY - jo.y; const d = Math.hypot(dx, dy), M = 50; if (d > M) { dx = dx / d * M; dy = dy / d * M; } knob.style.transform = `translate(${dx}px,${dy}px)`; jv = { x: dx / M, y: dy / M }; } }, { passive: true });
  const jend = e => { for (const t of e.changedTouches) if (t.identifier === jid) { jid = null; jv = { x: 0, y: 0 }; knob.style.transform = ''; joy.classList.remove('on'); joy.style.left = ''; joy.style.top = ''; } };
  addEventListener('touchend', jend); addEventListener('touchcancel', jend);
  function readMove() {
    const k = input.keys; let x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), y = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
    if (!x && !y) { x = jv.x; y = jv.y; if (Math.hypot(x, y) < 0.15) x = y = 0; }
    // الشاشة: يمين = +x في الملعب، أعلى = -z
    input.mx = x; input.mz = y;
  }
  const btn = (id, down, up) => { const el = $(id); el.addEventListener('touchstart', e => { e.preventDefault(); initAudio(); el.classList.add('dn'); down(); }, { passive: false }); el.addEventListener('touchend', e => { e.preventDefault(); el.classList.remove('dn'); up && up(); }); el.addEventListener('mousedown', () => { initAudio(); down(); }); el.addEventListener('mouseup', () => up && up()); };
  function shootDown() { if (!G.on || G.paused || G.freeze > 0) return; const p = G.ctl; if (ball.owner === p) G.charge = 0; else tackle(p); }
  function shootUp() { if (G.charge < 0) return; const p = G.ctl, pw = clamp(G.charge / 0.9, 0, 1); G.charge = -1; if (ball.owner === p) shoot(p, pw, clamp(input.mz * 1.4 + (rnd() - 0.5) * 0.4, -1.4, 1.4)); }
  function passDown() { if (!G.on || G.paused || G.freeze > 0) return; const p = G.ctl; if (ball.owner === p) pass(p); else { const n = nearestTo(0, ball, true); if (n && n !== p) G.ctl = n; } }
  function skillDown() { if (!G.on || G.paused || G.freeze > 0) return; const p = G.ctl; if (ball.owner === p) skill(p); else { const fx = Math.sin(p.face), fz = Math.cos(p.face); p.skill = 0.25; p.vx = fx * 10; p.vz = fz * 10; } }
  btn('#bShoot', shootDown, shootUp); btn('#bPass', passDown); btn('#bSkill', skillDown);
  addEventListener('keydown', e => { if (e.repeat) return; input.keys[e.code] = true; initAudio(); if (e.code === 'KeyJ' || e.code === 'Space') shootDown(); if (e.code === 'KeyK') passDown(); if (e.code === 'KeyL') skillDown(); if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); });
  addEventListener('keyup', e => { input.keys[e.code] = false; if (e.code === 'KeyJ' || e.code === 'Space') shootUp(); });

  /* ——— الصوت ——— */
  let AC = null, crowd = null; const snd = () => sv.sound !== false;
  function initAudio() { if (AC) { if (AC.state === 'suspended') AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const n = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (rnd() * 2 - 1) * 0.5;
    const s = AC.createBufferSource(); s.buffer = n; s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6; const g = AC.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(); crowd = { g, f }; }
  function sfx(k, v) {
    if (!AC || !snd()) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    const env = (a, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.05); };
    if (k === 'kick') { o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.1); env(Math.min(0.5, 0.15 + (v || 10) / 60), 0.12); }
    else if (k === 'bounce' || k === 'wall') { o.type = k === 'wall' ? 'square' : 'sine'; o.frequency.setValueAtTime(k === 'wall' ? 110 : 140, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.08); env(Math.min(0.2, (v || 3) / 50), 0.09); }
    else if (k === 'tackle') { o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.15); env(0.15, 0.16); }
    else if (k === 'whoosh') { o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.15); env(0.06, 0.18); }
    else if (k === 'save') { o.type = 'sine'; o.frequency.setValueAtTime(220, t); env(0.25, 0.15); crowdBoost(0.35, 1.2); }
    else if (k === 'gold') { o.type = 'sawtooth'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(1200, t + 0.4); env(0.12, 0.45); }
    else if (k === 'goal') { crowdBoost(0.9, 3); o.type = 'triangle'; o.frequency.setValueAtTime(523, t); o.frequency.setValueAtTime(659, t + 0.12); o.frequency.setValueAtTime(784, t + 0.24); env(0.15, 0.6); }
    else if (k === 'whistle') { o.type = 'sine'; o.frequency.setValueAtTime(2600, t); o.frequency.setValueAtTime(2300, t + 0.25); env(0.12, 0.6); }
  }
  function crowdBoost(a, d) { if (!crowd) return; const t = AC.currentTime; crowd.g.gain.cancelScheduledValues(t); crowd.g.gain.setTargetAtTime(snd() ? a * 0.25 : 0, t, 0.05); crowd.g.gain.setTargetAtTime(snd() ? 0.035 : 0, t + d, 0.6); }

  /* ——— الواجهة ——— */
  function setScore() { $('#sA').textContent = nA(G.score[0]); $('#sB').textContent = nA(G.score[1]); $('#score').classList.remove('pop'); void $('#score').offsetWidth; $('#score').classList.add('pop'); }
  let sayT; function say(t, big) { const el = $('#say'); el.textContent = t; el.className = big ? 'on big' : 'on'; clearTimeout(sayT); sayT = setTimeout(() => { el.className = ''; }, big ? 2600 : 1700); }
  function hud() {
    const t = Math.max(0, Math.ceil(G.time)); $('#time').textContent = `${nA(Math.floor(t / 60))}:${nA(String(t % 60).padStart(2, '0'))}`;
    $('#style').style.width = G.style + '%'; $('#styleW').classList.toggle('full', G.style >= 100);
    const own = ball.owner === G.ctl;
    $('#bShootT').textContent = own ? 'سدّد' : 'افتكّ'; $('#bPassT').textContent = own ? 'مرّر' : 'بدّل'; $('#bSkillT').textContent = own ? 'مهارة' : 'اندفع';
    $('#pw').style.opacity = G.charge >= 0 ? 1 : 0; if (G.charge >= 0) $('#pwI').style.width = clamp(G.charge / 0.9, 0, 1) * 100 + '%';
  }
  function togglePause() { if (!G.on || G.over) return; G.paused = !G.paused; $('#pause').hidden = !G.paused; $('#snd').textContent = snd() ? 'الصوت: يعمل' : 'الصوت: مغلق'; }
  $('#bPause').addEventListener('click', togglePause); $('#resume').addEventListener('click', togglePause);
  $('#snd').addEventListener('click', () => { sv.sound = !snd(); persist(); $('#snd').textContent = snd() ? 'الصوت: يعمل' : 'الصوت: مغلق'; if (crowd) crowd.g.gain.value = snd() ? 0.035 : 0; });
  $('#quit').addEventListener('click', () => { G.paused = false; $('#pause').hidden = true; endMatch(true); });
  document.querySelectorAll('[data-diff]').forEach(b => { b.classList.toggle('on', +b.dataset.diff === sv.diff); b.addEventListener('click', () => { sv.diff = +b.dataset.diff; persist(); document.querySelectorAll('[data-diff]').forEach(x => x.classList.toggle('on', x === b)); }); });
  function startMatch() {
    initAudio(); G.on = true; G.over = false; G.score = [0, 0]; G.time = 180; G.style = 0; G.freeze = 1.2; setScore(); kickoff(0);
    $('#title').classList.add('out'); $('#end').hidden = true; document.body.classList.add('playing'); setTimeout(() => { $('#title').hidden = true; }, 500);
    sfx('whistle'); if (crowd) crowd.g.gain.setTargetAtTime(snd() ? 0.035 : 0, AC.currentTime, 1); say('بدأت المباراة!', true);
  }
  function endMatch(quit) {
    G.over = true; G.on = false; sfx('whistle'); document.body.classList.remove('playing');
    const [a, b] = G.score, win = a > b; if (!quit) { sv.played++; if (win) sv.wins++; persist(); }
    players.forEach(p => { if ((p.team === 0 && win) || (p.team === 1 && b > a)) oneShot(p, 'cheer', 99); });
    $('#endT').textContent = quit ? 'انتهت المباراة' : win ? 'فزت! 🏆' : a === b ? 'تعادل' : 'خسرت هالمرة';
    $('#endS').textContent = `${TEAMS[0].name} ${nA(a)} — ${nA(b)} ${TEAMS[1].name}`;
    $('#endR').textContent = `مبارياتك: ${nA(sv.played)} · انتصارات: ${nA(sv.wins)} · أهدافك: ${nA(sv.goals)}`;
    $('#end').hidden = false;
  }
  $('#play').addEventListener('click', startMatch); $('#again').addEventListener('click', startMatch);

  /* ——— الحلقة ——— */
  let last = performance.now(), acc = 0;
  function update(dt) {
    G.clock += dt;
    if (G.on && !G.paused) {
      readMove();
      if (G.freeze > 0) G.freeze -= dt; else { G.time -= dt; if (G.time <= 0) { G.time = 0; endMatch(); } }
      if (G.charge >= 0) { G.charge += dt; if (G.charge > 1.1) shootUp(); }
      stepPlayers(dt); stepBall(dt);
      if (G.ctl && G.ctl.role === 'gk') G.ctl = nearestTo(0, ball, true);
    } else players.forEach(p => { p.mixer.update(dt); });
  }
  function render(dt) {
    ballM.position.set(ball.x, ball.y, ball.z);
    const sp = Math.hypot(ball.vx, ball.vz); if (sp > 0.1) { ballM.rotation.x += ball.vz * dt / BR; ballM.rotation.z -= ball.vx * dt / BR; }
    trail.forEach((s, i) => { s.visible = ball.gold && !ball.owner; if (s.visible) { s.position.set(ball.x - ball.vx * i * 0.012, ball.y - ball.vy * i * 0.012, ball.z - ball.vz * i * 0.012); const k = 1 - i / trail.length; s.scale.setScalar(1.4 * k); s.material.opacity = k; } });
    const c = G.ctl; ring.visible = arrow.visible = !!c && G.on;
    if (c) { ring.position.set(c.x, 0.03, c.z); arrow.position.set(c.x, 0.05, c.z); arrow.rotation.y = c.face; ring.material.color.set(ball.owner === c ? '#B8F34A' : '#FDE047'); ring.scale.setScalar(1 + Math.sin(G.clock * 6) * 0.06); }
    updateCam(dt); renderer.render(scene, camera); if (G.on) hud();
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!G.on && !G.over) { G.clock += dt; const a = G.clock * 0.1; camera.position.set(Math.cos(a) * 34, 16, Math.sin(a) * 26); camera.lookAt(0, 0, 0); players.forEach(p => p.mixer.update(dt)); fans.forEach(f => f.mixer.update(dt)); renderer.render(scene, camera); }
    else { acc += dt; while (acc > 1 / 60) { update(1 / 60); acc -= 1 / 60; } render(dt); }
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.on && !G.paused) togglePause(); });

  /* ——— التحميل ——— */
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const KINDS = ['rogue', 'barbarian', 'knight', 'mage']; let done = 0;
  const bar = $('#ldI');
  KINDS.forEach(k => loader.load(`models/${k}.glb?v=1`, g => { models[k] = g; if (k === 'rogue') g.animations.forEach(a => { clips[a.name] = a; }); done++; bar.style.width = done / KINDS.length * 100 + '%'; if (done === KINDS.length) ready(); },
    undefined, e => { $('#ldT').textContent = 'تعذّر تحميل اللاعبين — تأكد من الاتصال'; console.error(e); }));
  function ready() {
    const order = [['gk', 'knight'], ['def', 'barbarian'], ['mid', 'mage'], ['att', 'rogue']], order2 = [['gk', 'barbarian'], ['def', 'knight'], ['mid', 'rogue'], ['att', 'mage']];
    order.forEach(([r, k]) => makePlayer(0, r, k)); order2.forEach(([r, k]) => makePlayer(1, r, k));
    kickoff(0); players.forEach(p => { p.g.position.set(p.x, 0, p.z); p.g.rotation.y = p.face; });
    // جمهور على المقاعد
    const bench = new T3.Mesh(new T3.BoxGeometry(18, 0.5, 1.2), new T3.MeshStandardMaterial({ color: '#7A5A3A' })); bench.position.set(0, 0.25, CH + 2.6); scene.add(bench);
    for (let i = 0; i < 6; i++) { const k = KINDS[i % 4], g = SkeletonUtils.clone(models[k].scene); g.scale.setScalar(0.85); g.position.set(-7.5 + i * 3, 0, CH + 3.2); g.rotation.y = Math.PI;
      g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); const mx = new T3.AnimationMixer(g), a = mx.clipAction(clips[i % 2 ? 'Cheer' : 'Unarmed_Idle'] || clips.Idle); a.time = rnd() * 2; a.play(); players.push({ team: -1, mixer: mx, g, fan: true }); }
    // الجمهور ليس لاعبين
    for (let i = players.length - 1; i >= 0; i--) if (players[i].fan) { fans.push(players[i]); players.splice(i, 1); }
    $('#loading').hidden = true; $('#play').disabled = false;
    $('#tStats').textContent = sv.played ? `لعبت ${nA(sv.played)} مباراة · فزت ${nA(sv.wins)} · سجّلت ${nA(sv.goals)} هدف` : 'مباراة ٤ ضد ٤ في قلب الحارة';
    requestAnimationFrame(frame);
  }
  const fans = [];
  const _upd = update; update = function (dt) { _upd(dt); fans.forEach(f => f.mixer.update(dt)); };
  window.__hara = { G, ball, players, startMatch, input, sv };
})();
