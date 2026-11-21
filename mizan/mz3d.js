/* ميزان — مشاهد ثلاثية الأبعاد (Three.js) */
window.MZ3D = (function () {
  const T = window.THREE; if (!T) return { mount() {} };
  let R = null, canvas = null, cur = null, raf = 0;
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const elastic = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  function ensure() {
    if (R) return true;
    try {
      canvas = document.createElement('canvas'); canvas.className = 'three-c';
      R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
      return true;
    } catch (e) { R = null; return false; }
  }
  function lights(scene, a, b) {
    scene.add(new T.HemisphereLight(0xffffff, 0x223322, 1.1));
    const d = new T.DirectionalLight(0xffffff, 2.2); d.position.set(3, 5, 4); scene.add(d);
    const p1 = new T.PointLight(a, 30, 12); p1.position.set(-3, 1, 3); scene.add(p1);
    const p2 = new T.PointLight(b, 25, 12); p2.position.set(3, -1, 2); scene.add(p2);
  }
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  const glow = (col, s) => { const m = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); m.scale.set(s, s, 1); return m; };

  // ——— بلّورة التحدي: تكبر مع أيام الالتزام
  function gem(o) {
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(36, 1, 0.1, 50); camera.position.set(0, 0.4, 6.2); camera.lookAt(0, 0, 0);
    const col = new T.Color(o.color || '#22C55E'); lights(scene, col, 0xFDE68A);
    const days = o.days || 0, target = 0.75 + Math.min(days, 21) / 21 * 0.55;
    const g = new T.Group(); scene.add(g);
    const core = new T.Mesh(new T.IcosahedronGeometry(1, 0), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, metalness: 0.25, roughness: 0.12, flatShading: true }));
    const shell = new T.Mesh(new T.IcosahedronGeometry(1.18, 1), new T.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.18 }));
    g.add(core, shell, glow(col, 4.2));
    const ringM = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 });
    const r1 = new T.Mesh(new T.TorusGeometry(1.9, 0.012, 8, 96), ringM), r2 = new T.Mesh(new T.TorusGeometry(2.25, 0.008, 8, 96), ringM);
    r1.rotation.x = 1.25; r2.rotation.x = 1.05; r2.rotation.y = 0.4; scene.add(r1, r2);
    const n = Math.min(days, 30), dots = [];
    for (let i = 0; i < Math.max(n, 0); i++) { const d = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), new T.MeshBasicMaterial({ color: i % 7 === 6 ? 0xFDE68A : 0xffffff })); d.userData.a = i / Math.max(n, 1) * Math.PI * 2; scene.add(d); dots.push(d); }
    const sparks = new T.Group(); for (let i = 0; i < 26; i++) { const s = glow(i % 2 ? 0xffffff : col, 0.22); s.userData = { r: 1.4 + Math.random() * 1.2, a: Math.random() * 6.28, y: (Math.random() - 0.5) * 2.4, sp: 0.2 + Math.random() * 0.4 }; sparks.add(s); } scene.add(sparks);
    return { scene, camera, update(t) {
      const k = elastic(t / 1.6); g.scale.setScalar(target * k); g.rotation.y = t * 0.55; g.rotation.x = Math.sin(t * 0.7) * 0.18; shell.rotation.y = -t * 0.3;
      dots.forEach((d, i) => { const a = d.userData.a + t * 0.35, show = ease((t - 0.6 - i * 0.04) / 0.5); d.position.set(Math.cos(a) * 1.9, Math.sin(a) * 1.9 * Math.cos(1.25), Math.sin(a) * 1.9 * Math.sin(1.25) * -1); d.scale.setScalar(show); });
      sparks.children.forEach(s => { const u = s.userData, a = u.a + t * u.sp; s.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.a) * 0.15, Math.sin(a) * u.r); s.material.opacity = 0.5 + Math.sin(t * 2 + u.a) * 0.4; });
      r1.rotation.z = t * 0.2; r2.rotation.z = -t * 0.15;
    } };
  }

  // ——— طريق الهدف: منحدر ثلاثي الأبعاد من وزن البداية إلى الهدف
  function path(o) {
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, 0.1, 60); lights(scene, 0x22C55E, 0x38BDF8);
    const pts = [[-3.2, 1.9, 0], [-2.1, 1.55, 0.9], [-0.9, 1.0, -0.4], [0.2, 0.35, 0.8], [1.3, -0.2, -0.3], [2.2, -0.75, 0.7], [3.2, -1.25, 0]].map(p => new T.Vector3(...p));
    const curve = new T.CatmullRomCurve3(pts), tube = new T.TubeGeometry(curve, 160, 0.09, 14, false);
    const cA = new T.Color('#F97316'), cB = new T.Color('#22C55E'), cols = [], pos = tube.attributes.position;
    for (let i = 0; i < pos.count; i++) { const u = Math.floor(i / 15) / 160, c = cA.clone().lerp(cB, u); cols.push(c.r, c.g, c.b); }
    tube.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const road = new T.Mesh(tube, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.35 })); scene.add(road);
    const done = new T.Mesh(new T.TubeGeometry(curve, 160, 0.11, 14, false), new T.MeshStandardMaterial({ vertexColors: false, color: '#22C55E', emissive: '#16A34A', emissiveIntensity: 0.6, roughness: 0.3 }));
    done.geometry.setDrawRange(0, 0); scene.add(done);
    const idxPerSeg = done.geometry.index.count / 160;
    [0.25, 0.5, 0.75].forEach(u => { const m = new T.Mesh(new T.SphereGeometry(0.11, 16, 10), new T.MeshStandardMaterial({ color: '#fff', emissive: '#FDE68A', emissiveIntensity: o.pct >= u * 100 ? 0.9 : 0 })); m.position.copy(curve.getPoint(u)); scene.add(m); });
    // علم الهدف
    const end = curve.getPoint(1), flag = new T.Group(); flag.position.copy(end);
    const pole = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 1.1, 8), new T.MeshStandardMaterial({ color: '#E5E7EB', metalness: 0.6, roughness: 0.3 })); pole.position.y = 0.55;
    const cloth = new T.Mesh(new T.PlaneGeometry(0.55, 0.34, 10, 4), new T.MeshStandardMaterial({ color: '#22C55E', side: T.DoubleSide, emissive: '#16A34A', emissiveIntensity: 0.4 })); cloth.position.set(-0.29, 0.92, 0);
    flag.add(pole, cloth, glow(0x22C55E, 1.6)); scene.add(flag);
    const startM = new T.Mesh(new T.SphereGeometry(0.12, 16, 10), new T.MeshStandardMaterial({ color: '#F97316', emissive: '#F97316', emissiveIntensity: 0.6 })); startM.position.copy(curve.getPoint(0)); scene.add(startM);
    const ball = new T.Mesh(new T.SphereGeometry(0.2, 32, 16), new T.MeshStandardMaterial({ color: '#fff', emissive: '#4ADE80', emissiveIntensity: 0.8, roughness: 0.2 })), bg = glow(0x4ADE80, 1.5);
    scene.add(ball, bg);
    const floor = new T.Mesh(new T.CircleGeometry(5, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#22C55E', transparent: true, opacity: 0.06 })); floor.position.y = -1.6; scene.add(floor);
    const pct = Math.max(0, Math.min(100, o.pct || 0)) / 100, cp = cloth.geometry.attributes.position, base = cp.array.slice();
    return { scene, camera, update(t) {
      const k = ease((t - 0.3) / 1.8), u = Math.max(0.0001, pct * k), p = curve.getPoint(u);
      ball.position.copy(p).add(new T.Vector3(0, 0.16 + Math.abs(Math.sin(t * 3)) * 0.06, 0)); bg.position.copy(ball.position);
      done.geometry.setDrawRange(0, Math.floor(idxPerSeg * 160 * u / 3) * 3);
      const a = Math.sin(t * 0.25) * 0.35; camera.position.set(Math.sin(a) * 7.2, 1.6, Math.cos(a) * 7.2); camera.lookAt(0, 0.1, 0);
      for (let i = 0; i < cp.count; i++) { const x = base[i * 3]; cp.setZ(i, Math.sin(t * 5 + x * 9) * 0.05 * (x + 0.275) / 0.55); } cp.needsUpdate = true;
    } };
  }

  // ——— الطبق: نسب الوجبة اليومية
  const BUILD = { gem, path };
  function mount(slot, kind, opts) {
    if (!slot || !ensure()) return;
    cancelAnimationFrame(raf); if (cur) cur.scene.traverse(x => { if (x.geometry) x.geometry.dispose(); });
    slot.appendChild(canvas); cur = BUILD[kind](opts || {});
    const fit = () => { const w = slot.clientWidth || 300, h = slot.clientHeight || 220; R.setSize(w, h, false); cur.camera.aspect = w / h; cur.camera.updateProjectionMatrix(); };
    fit(); const t0 = performance.now();
    const f = now => { if (!canvas.isConnected || !cur) return; if (!document.hidden) { cur.update((now - t0) / 1000); R.render(cur.scene, cur.camera); } raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f); window.addEventListener('resize', fit, { once: true });
  }
  return { mount };
})();
