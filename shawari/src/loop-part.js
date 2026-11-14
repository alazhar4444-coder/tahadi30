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
