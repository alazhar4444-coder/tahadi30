/* ومضة — مساعد إدارة حساب مدرسة معاذ بن جبل في إنستغرام · تصميم الأزهر الناعبي */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = x => String(x).padStart(2, '0');
  const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const pk = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const haptic = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
  const fmtK = v => v >= 1e6 ? n((v / 1e6).toFixed(1)) + 'م' : v >= 1e4 ? n(Math.round(v / 1e3)) + 'ألف' : n(Math.round(v));
  const W = window.WD;

  /* ——— التخزين ——— */
  const K = 'wamda:';
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(K + k)) ?? d; } catch (e) { return d; } };
  let LOG = load('log', []), CK = load('ck', {}), ST = Object.assign({ handle: W.handle, followers: 0, goal: 0, peaks: [], name: 'الأزهر الناعبي' }, load('st', {}));
  const save = () => { try { localStorage.setItem(K + 'log', JSON.stringify(LOG)); localStorage.setItem(K + 'st', JSON.stringify(ST)); localStorage.setItem(K + 'ck', JSON.stringify(CK)); } catch (e) {} };

  /* ——— الرموز ——— */
  const SY = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    poll: '<path d="M5 20V10M12 20V4M19 20v-7"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bolt: '<path d="M13 2.5 4.5 13.5h6l-1 8 8.5-11h-6z"/>', cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', wand: '<path d="m4 20 10-10M14 4v2M18 6l-1.5 1.5M20 10h-2M12 6l2 2M16 10l2 2"/>',
    ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>',
    chart: '<path d="M4 20h16"/><rect x="6" y="11" width="3" height="7" rx="1"/><rect x="11" y="6" width="3" height="12" rx="1"/><rect x="16" y="13" width="3" height="5" rx="1"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.4h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>',
    send: '<path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5z"/>', eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    save: '<path d="M6 3.5h12v17l-6-4-6 4z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    shuffle: '<path d="M3 6h4l10 12h4M3 18h4l3-3.6M14 9.6 17 6h4M18 3l3 3-3 3M18 15l3 3-3 3"/>', users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.5-3.3 2.8-5 6-5s5.5 1.7 6 5"/><path d="M16 5.4a3 3 0 0 1 0 5.4M18 14.3c1.7.6 2.7 2.2 3 4.7"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24">${SY[k] || ''}</svg>`;

  /* ——— محرك الأوقات الذهبية ——— */
  const AD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayRow = dow => dow === 4 ? W.W.thu : dow === 5 ? W.W.fri : dow === 6 ? W.W.sat : W.W.school;
  function personal() { // متوسط الوصول لكل ساعة من سجلّك
    const L = LOG.filter(p => p.reach > 0 && p.time); if (L.length < 8) return null;
    const avg = L.reduce((s, p) => s + p.reach, 0) / L.length, b = Array(24).fill(0), c = Array(24).fill(0);
    L.forEach(p => { const h = +p.time.split(':')[0]; [-1, 0, 1].forEach(o => { const k = (h + o + 24) % 24, w = o ? .5 : 1; b[k] += w * p.reach / avg; c[k] += w; }); });
    return b.map((v, i) => c[i] ? Math.min(1.2, v / c[i]) : null);
  }
  let PERS = personal();
  function score(d, fmt) {
    const h = d.getHours(), m = d.getMinutes() / 60, row = dayRow(d.getDay());
    let w = row[h] * (1 - m) + row[(h + 1) % 24] * m;
    if (fmt === 'reel' && h >= 19) w = Math.min(1, w * 1.04);
    if (ST.peaks.length) w = ST.peaks.includes(h) ? Math.max(w, .96) : w * .85;
    if (PERS && PERS[h] != null) w = w * .6 + Math.min(1, PERS[h]) * .4;
    return Math.max(0, Math.min(1, w));
  }
  function nextGold(from = new Date(), fmt) {
    const t = new Date(from); t.setSeconds(0, 0); t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15);
    for (let i = 0; i < 4 * 72; i++) { const s = score(t, fmt); if (s >= .9) return { at: new Date(t), s }; t.setMinutes(t.getMinutes() + 15); }
    return null;
  }
  const bestHours = (dow, fmt, k = 2) => { const d = new Date(); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7)); const r = []; for (let h = 6; h < 24; h++) { d.setHours(h, 0, 0, 0); r.push([h, score(d, fmt)]); } return r.sort((a, b) => b[1] - a[1]).slice(0, k).map(x => x[0]).sort((a, b) => a - b); };
  const hl = h => { const h12 = ((h + 11) % 12) + 1; return `${n(h12)} ${h < 12 ? 'ص' : 'م'}`; };
  const tl = d => { const h = d.getHours(), m = d.getMinutes(), h12 = ((h + 11) % 12) + 1; return `${n(h12)}${m ? ':' + n(pad(m)) : ''} ${h < 12 ? 'ص' : 'م'}`; };
  const verdict = s => s >= .9 ? ['وقت ذهبي — انشر الآن', '#E8C877'] : s >= .7 ? ['وقت جيد للنشر', '#FA7E1E'] : s >= .45 ? ['وقت متوسط', '#D62976'] : ['انتظر الوقت الذهبي', '#8E8E93'];

  /* ——— الشاشات ——— */
  let tab = 'now', stab = 'reels', reelK = 'tabour', capT = 'event', capTone = 'excited', tipC = 'algo', fmtNow = 'reel';
  const head = (t, sub) => `<header class="hd"><div class="grow">${sub ? `<div class="eyebrow">${sub}</div>` : ''}<h1>${t}</h1></div><button class="av" data-act="settings" aria-label="الإعدادات"><img src="me.png?v=1" alt=""></button></header>`;

  function viewNow() {
    const now = new Date(), s = score(now, fmtNow), [vt, vc] = verdict(s), g = nextGold(now, fmtNow), today = W.PLAN[now.getDay()], F = W.FORMATS[today.f];
    const up = W.OCC.map(o => ({ o, d: Math.round((pk(o[0]) - pk(dk(now))) / 864e5) })).filter(x => x.d >= 0).slice(0, 3);
    const tipsAll = W.TIPS.flatMap(c => c[2]), tip = tipsAll[(Math.floor(now / 864e5)) % tipsAll.length];
    const mins = g ? Math.round((g.at - now) / 6e4) : 0, cd = !g ? '—' : mins <= 0 ? 'الآن' : mins < 60 ? `بعد ${n(mins)} دقيقة` : `بعد ${n(Math.floor(mins / 60))} س ${mins % 60 ? n(mins % 60) + ' د' : ''}`;
    const sameDay = g && dk(g.at) === dk(now), gDay = !g ? '' : sameDay ? 'اليوم' : (dk(g.at) === dk(new Date(+now + 864e5)) ? 'غداً' : AD[g.at.getDay()]);
    const week = LOG.filter(p => (now - pk(p.date)) / 864e5 < 7).length;
    return `${head('ومضة', `<img src="mark-g.png?v=1" class="mk" alt="">@${esc(ST.handle)}`)}
    <section class="hero">
      <canvas id="orb"></canvas>
      <div class="gauge" style="--v:${s};--c:${vc}"><div class="g-in"><b data-count="${Math.round(s * 100)}">${n(Math.round(s * 100))}</b><span>مؤشر النشر</span></div></div>
      <div class="h-txt"><div class="seg glass">${['reel', 'post', 'story'].map(f => `<button class="${fmtNow === f ? 'on' : ''}" data-act="fmt" data-f="${f}">${W.FORMATS[f][0]}</button>`).join('')}</div>
        <b class="vt" style="color:${vc}">${vt}</b>
        <div class="gold">${svg('bolt')}<span>الوقت الذهبي القادم: <b>${g ? `${gDay} ${tl(g.at)}` : '—'}</b> <em>${cd}</em></span></div>
        <button class="pill" data-act="remind">${svg('bell')} ذكّرني به</button></div>
    </section>
    <section class="card today tilt" style="--f:${F[1]}"><div class="t-top"><span class="ic">${svg(today.ic)}</span><div class="grow"><small>محتوى اليوم · ${AD[now.getDay()]}</small><b>${today.t}</b></div><span class="fbadge">${F[0]}</span></div>
      <p>${today.idea}</p><p class="why">${svg('bulb')} ${today.why}</p>
      <div class="row2"><button class="btn gr" data-act="goCap" data-t="${today.f === 'reel' ? 'reel' : today.f === 'story' ? 'greet' : 'event'}">${svg('wand')} اكتب الكابشن</button>${today.f === 'reel' ? `<button class="btn" data-act="goReel">${svg('film')} خطة التصوير</button>` : `<button class="btn" data-act="tab" data-tab="plan">${svg('cal')} الخطة</button>`}</div></section>
    <div class="stats3"><div><b>${n(week)}</b><small>منشورات الأسبوع</small></div><div><b>${ST.followers ? fmtK(ST.followers) : '—'}</b><small>المتابعون</small></div><div><b>${PERS ? 'مخصّص' : n(Math.max(0, 8 - LOG.filter(p => p.reach).length))}</b><small>${PERS ? 'التوقيت من أرقامك' : 'منشورات لتعلّم أوقاتك'}</small></div></div>
    <h2 class="label">${svg('cal')} المناسبات القادمة</h2>
    <div class="occ">${up.map(({ o, d }) => `<div class="oc ${d <= o[3] ? 'hot' : ''}"><div class="od"><b>${d === 0 ? 'اليوم' : n(d)}</b>${d ? '<small>يوم</small>' : ''}</div><div class="grow"><b>${o[1]}</b><span>${o[2]}</span>${d <= o[3] && d > 0 ? '<em>ابدأ التحضير الآن</em>' : ''}</div></div>`).join('')}</div>
    <h2 class="label">${svg('bulb')} خبرة اليوم</h2>
    <div class="card tipday"><b>${tip[0]}</b><p>${tip[1]}</p></div>
    <a class="iglink" href="https://www.instagram.com/${esc(ST.handle)}/" target="_blank" rel="noopener">${svg('ig')}<span class="grow">افتح حساب المدرسة في إنستغرام</span>‹</a>
    ${credit()}`;
  }

  function heat(fmt) {
    const days = [0, 1, 2, 3, 4, 5, 6], hrs = Array.from({ length: 18 }, (_, i) => i + 6), d = new Date();
    return `<div class="heat"><div class="hrow hh"><span></span>${hrs.map(h => `<i>${h % 3 === 0 ? n(((h + 11) % 12) + 1) : ''}</i>`).join('')}</div>
      ${days.map(dw => { const x = new Date(d); x.setDate(d.getDate() + ((dw - d.getDay() + 7) % 7)); return `<div class="hrow ${dw === d.getDay() ? 'tdy' : ''}"><span>${AD[dw].replace('ال', '')}</span>${hrs.map(h => { x.setHours(h, 0, 0, 0); const s = score(x, fmt); return `<u style="--s:${s.toFixed(2)}" class="${s >= .9 ? 'g' : ''}"></u>`; }).join('')}</div>`; }).join('')}
      <div class="hleg"><span>أقل</span><i></i><span>أفضل</span><em>★ ذهبي</em></div></div>`;
  }
  function viewPlan() {
    const d = new Date().getDay();
    return `${head('الخطة', 'الأسبوع الدراسي في عُمان: الأحد – الخميس')}
    <h2 class="label">${svg('clock')} خريطة الأوقات الذهبية</h2>
    <div class="card pad">${heat(fmtNow)}<p class="foot">${PERS ? 'محسوبة من أرقام منشوراتك مع خبرة الحسابات التعليمية.' : ST.peaks.length ? 'محسوبة من ساعات النشاط التي أدخلتها من إحصاءات إنستغرام.' : 'تقديرية لجمهور مدرسة (أولياء أمور وطلاب): بعد الدوام ٢–٣ م، والمساء ٨–١٠ م أقوى الأوقات. تتحسّن تلقائياً كلما سجّلت منشوراتك.'}</p></div>
    <h2 class="label">${svg('cal')} خطة المحتوى الأسبوعية</h2>
    <div class="plan">${W.PLAN.map(p => { const F = W.FORMATS[p.f], bh = bestHours(p.d, p.f); return `<div class="pl ${p.d === d ? 'tdy' : ''}" style="--f:${F[1]}"><div class="pd"><b>${AD[p.d]}</b><span class="fbadge">${F[0]}</span></div><div class="grow"><b>${p.t}</b><span>${p.idea}</span><small>${svg('bolt')} أفضل وقت: ${bh.map(hl).join(' أو ')}</small></div></div>`; }).join('')}</div>
    <div class="card pad mix"><b>المعادلة المقترحة أسبوعياً</b><div class="mixbar"><i style="flex:3;--c:#D62976">٣ ريلز</i><i style="flex:2;--c:#4F5BD5">٢ منشور</i><i style="flex:4;--c:#962FBF">ستوري يومي</i></div><p class="foot">الريلز للوصول لجمهور جديد، والمنشورات المتعددة الصور للحفظ، والستوري للتواصل اليومي مع أولياء الأمور.</p></div>
    <h2 class="label">${svg('star')} كل المناسبات</h2>
    <div class="occ">${W.OCC.map(o => ({ o, d: Math.round((pk(o[0]) - pk(dk(new Date()))) / 864e5) })).filter(x => x.d >= 0).map(({ o, d }) => `<div class="oc ${d <= o[3] ? 'hot' : ''}"><div class="od"><b>${d === 0 ? 'اليوم' : n(d)}</b>${d ? '<small>يوم</small>' : ''}</div><div class="grow"><b>${o[1]}</b><span>${o[2]}</span><small>${n(pk(o[0]).getDate())}/${n(pk(o[0]).getMonth() + 1)}/${n(pk(o[0]).getFullYear())} · جهّز قبلها بـ${n(o[3])} أيام</small></div></div>`).join('')}</div>`;
  }

  /* الاستوديو */
  function viewStudio() {
    const segs = [['reels', 'ريلز'], ['cap', 'الكابشن'], ['hooks', 'الخطّافات'], ['check', 'قبل النشر']];
    let body = '';
    if (stab === 'reels') {
      const R = W.REELS[reelK], tot = R.shots.length;
      body = `<div class="chips">${Object.entries(W.REELS).map(([k, r]) => `<button class="${k === reelK ? 'on' : ''}" data-act="reel" data-k="${k}">${r.t}</button>`).join('')}</div>
      <div class="card pad reelc"><div class="rc-h"><div class="phone"><div class="ph-scr"><span class="ph-hook">${esc(W.HOOKS[(Object.keys(W.REELS).indexOf(reelK) * 3) % W.HOOKS.length])}</span><i class="ph-bar"></i></div></div>
        <div class="grow"><b>${R.t}</b><div class="meta"><span>${svg('clock')} ${R.len}</span><span>♫ ${R.audio}</span></div></div></div>
        <div class="shots">${R.shots.map((s, i) => `<div class="shot" style="--i:${i};--w:${(100 / tot).toFixed(1)}%"><span class="sn">${n(i + 1)}</span><div class="grow"><small>${s[0]}</small><p>${s[1]}</p></div></div>`).join('')}</div>
        <div class="row2"><button class="btn gr" data-act="copyShots">${svg('copy')} نسخ خطة التصوير</button><button class="btn" data-act="goCap" data-t="reel">${svg('wand')} كابشن للريلز</button></div></div>
      <div class="card pad mini"><b>${svg('bolt')} قاعدة ذهبية</b><p>ابدأ بأقوى لقطة، اكتب الفكرة على الشاشة، واختم بلقطة تعيد المشاهد للبداية. وضع جملة تشجّع على الإرسال: «أرسلها لولي أمر يفتخر».</p></div>`;
    } else if (stab === 'cap') {
      const C = W.CAP[capT], lab = { ev: ['اسم الفعالية / الموضوع', 'مثال: الإذاعة الصباحية'], who: ['المعنيون', 'مثال: طلاب الصف السابع'], date: ['الموعد', 'مثال: الأحد القادم'], detail: ['تفاصيل', 'سطر يوصف اللحظة'] };
      body = `<div class="chips">${Object.entries(W.CAP).map(([k, c]) => `<button class="${k === capT ? 'on' : ''}" data-act="capT" data-k="${k}">${c.t}</button>`).join('')}</div>
      <div class="card form">${C.f.map(f => `<label><span>${lab[f][0]}</span><input id="c_${f}" placeholder="${lab[f][1]}" value="${esc(load('c_' + f, ''))}"></label>`).join('')}
        <div class="li"><span>الأسلوب</span><div class="seg">${[['formal', 'رسمي'], ['excited', 'حماسي'], ['short', 'مختصر']].map(([k, t]) => `<button class="${capTone === k ? 'on' : ''}" data-act="tone" data-k="${k}">${t}</button>`).join('')}</div></div></div>
      <button class="btn gr big" data-act="gen">${svg('wand')} اكتب لي الكابشن</button><div id="capOut"></div>`;
    } else if (stab === 'hooks') {
      body = `<button class="btn gr big" data-act="rndHook">${svg('shuffle')} خطّاف عشوائي</button><div id="rh"></div>
      <div class="group">${W.HOOKS.map(h => `<button class="li hook" data-act="copy" data-txt="${esc(h)}"><span class="grow">${esc(h)}</span>${svg('copy')}</button>`).join('')}</div>
      <p class="foot">الخطّاف: الجملة أو اللقطة في أول ثانيتين، تُكتب على الشاشة بخط كبير. اضغط أي خطّاف لنسخه.</p>`;
    } else {
      const done = W.CHECK.filter((_, i) => CK[i]).length, p = done / W.CHECK.length;
      body = `<div class="card pad ckh"><div class="ring" style="--v:${p}"><b>${n(done)}/${n(W.CHECK.length)}</b></div><div class="grow"><b>${p === 1 ? 'جاهز للنشر 🚀' : 'راجع قبل النشر'}</b><span>قائمة فحص الريلز والمنشور</span></div><button class="pill dark" data-act="ckReset">تصفير</button></div>
      <div class="group">${W.CHECK.map((c, i) => `<button class="li ck ${CK[i] ? 'on' : ''}" data-act="ck" data-i="${i}"><span class="cb">${svg('check')}</span><span class="grow">${c}</span></button>`).join('')}</div>`;
    }
    return `${head('الاستوديو', 'صناعة المحتوى')}<div class="seg big">${segs.map(([k, t]) => `<button class="${stab === k ? 'on' : ''}" data-act="stab" data-k="${k}">${t}</button>`).join('')}</div><div class="sbody">${body}</div>`;
  }

  /* مولّد الكابشن */
  function genCaps() {
    const v = {}; W.CAP[capT].f.forEach(f => { v[f] = ($('#c_' + f).value || '').trim(); localStorage.setItem(K + 'c_' + f, JSON.stringify(v[f])); });
    const ev = v.ev || 'فعالية اليوم', who = v.who, det = v.detail, date = v.date, S = 'مدرسة معاذ بن جبل';
    const L = (...a) => a.filter(Boolean).join('\n');
    const T = {
      event: { formal: [L(`في أجواء مميزة، نظّمت ${S} للتعليم الأساسي ${ev}${who ? ` بمشاركة ${who}` : ''}.`, det, 'شكراً لكل من أسهم في إنجاح هذه الفعالية 🌟'), L(`ضمن أنشطتها التربوية، أقامت ${S} ${ev}.`, det, who ? `تحية تقدير لـ${who} على العطاء.` : '')],
        excited: [L(`✨ ${ev} في معاذ بن جبل كان شيء ثاني!`, det, who ? `شكراً ${who} على الإبداع 👏` : '', 'أرسلها لشخص يفتخر بطلابنا 💛'), L(`🔥 لحظات ما تتكرر من ${ev}`, det, 'وش أكثر لقطة عجبتك؟ اكتبها بالتعليقات 👇')],
        short: [L(`${ev} 📍 ${S}`, det), L(`من ${ev} ✨`, who)] },
      award: { formal: [L(`تفخر ${S} بـ${who || 'أبنائها الطلبة'} لتحقيق ${ev}.`, det, 'مزيداً من التميز والإبداع 🏆'), L(`تهنئ إدارة ${S} ${who || 'طلابها المتميزين'} بمناسبة ${ev}.`, det)],
        excited: [L(`🏆 مبروووك ${who || 'أبطالنا'}!`, `${ev} صار رسمياً لنا 💪`, det, 'منشن أحد يستاهل التهنئة 👇'), L(`هذي اللحظة اللي نشتغل عشانها ❤️`, `${who || 'طلابنا'} — ${ev}`, det)],
        short: [L(`🏆 ${ev}`, who), L(`فخورين بـ${who || 'أبطالنا'} 🏆`, ev)] },
      announce: { formal: [L(`📢 تعلن ${S} عن ${ev}${date ? `، وذلك ${date}` : ''}.`, det, 'نأمل من الجميع الاطلاع والالتزام.'), L(`إعلان | ${ev}`, date ? `🗓 الموعد: ${date}` : '', det)],
        excited: [L(`📢 لا يفوتكم! ${ev}`, date ? `🗓 ${date}` : '', det, 'فعّلوا التنبيهات عشان توصلكم كل الأخبار 🔔'), L(`جاهزين؟ 👀 ${ev} قرّب!`, date, det)],
        short: [L(`📢 ${ev}`, date ? `🗓 ${date}` : '', det), L(`تذكير: ${ev}${date ? ` — ${date}` : ''}`)] },
      greet: { formal: [L(`تتقدم أسرة ${S} بأسمى آيات التهاني والتبريكات بمناسبة ${ev}.`, det, 'كل عام وأنتم بخير 🌙'), L(`بمناسبة ${ev}، نرفع أجمل التهاني إلى أبنائنا الطلبة وأولياء الأمور والهيئة التدريسية.`, det)],
        excited: [L(`كل عام وأنتم بخير ✨ ${ev}`, det, 'من قلب معاذ بن جبل لكل عائلتنا ❤️'), L(`${ev} 🎉`, det, 'شاركوها مع أحبابكم')],
        short: [L(`${ev} 🤍`, 'أسرة مدرسة معاذ بن جبل'), L(`كل عام وأنتم بخير | ${ev}`)] },
      reel: { formal: [L(`لقطات من ${ev} في ${S} 🎬`, det), L(`${ev} | ${S}`, det)],
        excited: [L(`انتظر للنهاية 👀🔥`, `${ev} بنظرة مختلفة`, det, 'أرسلها لولي أمر يفتخر 💛'), L(`لو كنت معنا اليوم… ${ev} ✨`, det, 'تابعنا عشان ما يفوتك شي')],
        short: [L(`${ev} 🎬`), L(`${ev} في ١٥ ثانية ⏱`)] },
      tip: { formal: [L(`💡 ${ev}`, det, 'احفظ المنشور للرجوع إليه.'), L(`نصيحة تربوية | ${ev}`, det)],
        excited: [L(`💡 احفظ هذا المنشور!`, ev, det, 'وأرسله لولي أمر يحتاجه 📩'), L(`معلومة ممكن تغيّر يومك 👇`, ev, det)],
        short: [L(`💡 ${ev}`, det), L(`${ev} ✅`)] },
    };
    const tags = [...W.TAGS.base, ...(capT === 'greet' && /وطني|نوفمبر/.test(ev) ? W.TAGS.national : capT === 'event' || capT === 'award' ? W.TAGS.event.slice(0, 2) : W.TAGS.edu.slice(0, 2))].slice(0, 6).join(' ');
    const out = T[capT][capTone].map(t => t.trim() + '\n\n' + tags);
    $('#capOut').innerHTML = out.map((t, i) => `<div class="capc" style="--i:${i}"><pre>${esc(t)}</pre><button class="btn gr" data-act="copy" data-txt="${esc(t)}">${svg('copy')} نسخ</button></div>`).join('') + `<p class="foot">نصيحة: اكتب الجملة الأولى بقوة لأنها تظهر قبل «المزيد»، و٣–٦ هاشتاقات كافية.</p>`;
    haptic();
  }

  /* الأداء */
  function viewStats() {
    const L = LOG.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), R = L.filter(p => p.reach > 0);
    const er = p => p.reach ? (p.likes + p.comments + p.shares + p.saves) / p.reach : 0;
    const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
    const by = (key, fn) => { const m = {}; R.forEach(p => { const k = fn(p); (m[k] = m[k] || []).push(p.reach); }); return Object.entries(m).map(([k, v]) => [k, avg(v), v.length]).sort((a, b) => b[1] - a[1]); };
    const bt = by('t', p => p.type), bd = by('d', p => pk(p.date).getDay()), bh = by('h', p => +p.time.split(':')[0]);
    const mx = Math.max(1, ...bt.map(x => x[1]));
    const goalP = ST.goal && ST.followers ? Math.min(1, ST.followers / ST.goal) : 0;
    return `${head('الأداء', 'تعلّم من أرقامك')}
    <section class="card pad fol"><div class="grow"><small>المتابعون</small><b>${ST.followers ? n(ST.followers.toLocaleString('en')) : 'أدخل العدد'}</b>${ST.goal ? `<div class="bar"><i style="width:${goalP * 100}%"></i></div><span>الهدف ${n(ST.goal.toLocaleString('en'))} · ${n(Math.round(goalP * 100))}٪</span>` : ''}</div><button class="pill dark" data-act="settings">${svg('target')} تعديل</button></section>
    <button class="btn gr big" data-act="logAdd">${svg('plus')} سجّل منشوراً جديداً</button>
    ${R.length ? `<div class="stats3"><div><b>${fmtK(avg(R.map(p => p.reach)))}</b><small>متوسط الوصول</small></div><div><b>${n((avg(R.map(er)) * 100).toFixed(1))}٪</b><small>معدل التفاعل</small></div><div><b>${fmtK(avg(R.map(p => p.shares)))}</b><small>متوسط الإرسال</small></div></div>
    <h2 class="label">${svg('chart')} أي نوع ينجح أكثر؟</h2>
    <div class="card pad bars">${bt.map(([k, v, c]) => `<div class="br"><span>${W.FORMATS[k] ? W.FORMATS[k][0] : k}</span><div class="bt"><i style="width:${(v / mx * 100).toFixed(0)}%;--c:${W.FORMATS[k] ? W.FORMATS[k][1] : '#999'}"></i></div><b>${fmtK(v)}</b></div>`).join('')}</div>
    <div class="insights">${bd[0] ? `<div class="card ins">${svg('cal')}<div><small>أفضل يوم لك</small><b>${AD[bd[0][0]]}</b></div></div>` : ''}${bh[0] ? `<div class="card ins">${svg('clock')}<div><small>أفضل ساعة لك</small><b>${hl(+bh[0][0])}</b></div></div>` : ''}</div>
    ${R.length < 8 ? `<p class="foot">سجّل ${n(8 - R.length)} منشورات أخرى ليبدأ «مؤشر النشر» بالتعلّم من أرقامك.</p>` : ''}` : `<div class="card empty">${svg('chart')}<b>ابدأ بتسجيل منشوراتك</b><span>بعد كل منشور بيوم أو يومين، انسخ الأرقام من «الإحصاءات» في إنستغرام وسجّلها هنا، وسيتعلّم التطبيق أفضل أوقاتك الحقيقية.</span></div>`}
    ${L.length ? `<h2 class="label">${svg('film')} السجلّ</h2><div class="group">${L.map(p => `<button class="li lg" data-act="logOpen" data-id="${p.id}"><span class="fdot" style="--c:${W.FORMATS[p.type][1]}">${svg(p.type === 'reel' ? 'film' : p.type === 'story' ? 'poll' : 'star')}</span><div class="grow"><b>${esc(p.topic || W.FORMATS[p.type][0])}</b><small>${AD[pk(p.date).getDay()]} ${n(pk(p.date).getDate())}/${n(pk(p.date).getMonth() + 1)} · ${tl(new Date(p.date + 'T' + p.time))}</small></div><div class="lgn"><span>${svg('eye')}${fmtK(p.reach || p.views || 0)}</span><span>${svg('send')}${fmtK(p.shares || 0)}</span></div></button>`).join('')}</div>` : ''}`;
  }
  function logSheet(id) {
    const p = LOG.find(x => x.id === id) || { type: 'reel', date: dk(new Date()), time: '20:00', topic: '', views: '', reach: '', likes: '', comments: '', shares: '', saves: '', follows: '' };
    const F = [['views', 'المشاهدات', 'eye'], ['reach', 'الحسابات التي وصلها', 'users'], ['likes', 'الإعجابات', 'heart'], ['comments', 'التعليقات', 'poll'], ['shares', 'الإرسال/المشاركة', 'send'], ['saves', 'الحفظ', 'save'], ['follows', 'متابعون جدد', 'plus']];
    openSheet(`<div class="grab"></div><div class="sh-h"><button class="tx" data-act="close">إلغاء</button><b>${id ? 'تعديل' : 'منشور جديد'}</b><button class="tx bold" data-act="logSave" data-id="${id || ''}">حفظ</button></div>
      <div class="seg big">${Object.entries(W.FORMATS).map(([k, f]) => `<button class="${p.type === k ? 'on' : ''}" data-act="lt" data-k="${k}">${f[0]}</button>`).join('')}</div>
      <div class="card form"><label><span>الموضوع</span><input id="l_topic" value="${esc(p.topic)}" placeholder="مثال: الإذاعة الصباحية"></label><label><span>التاريخ</span><input type="date" id="l_date" value="${p.date}"></label><label><span>وقت النشر</span><input type="time" id="l_time" value="${p.time}"></label></div>
      <h3 class="sh3">الأرقام من إحصاءات إنستغرام</h3>
      <div class="card form nums">${F.map(([k, t, ic]) => `<label><span>${svg(ic)} ${t}</span><input type="number" inputmode="numeric" id="l_${k}" value="${p[k] === '' ? '' : p[k] || 0}" placeholder="٠"></label>`).join('')}</div>
      ${id ? `<button class="btn red big" data-act="logDel" data-id="${id}">${svg('trash')} <span id="delT">حذف</span></button>` : ''}`);
    logSheet.type = p.type;
  }

  /* الخبرة */
  function viewTips() {
    const C = W.TIPS.find(c => c[0] === tipC);
    return `${head('الخبرة', 'أسرار نمو الحساب')}
    <div class="chips">${W.TIPS.map(c => `<button class="${c[0] === tipC ? 'on' : ''}" data-act="tipC" data-k="${c[0]}">${c[1]}</button>`).join('')}</div>
    <div class="tips">${C[2].map((t, i) => `<details class="card tp" style="--i:${i}" ${i === 0 ? 'open' : ''}><summary><span class="tn">${n(i + 1)}</span><b class="grow">${t[0]}</b><i>⌄</i></summary><p>${t[1]}</p></details>`).join('')}</div>
    <div class="card pad mini"><b>${svg('chart')} من أين تعرف أوقات جمهورك؟</b><p>في إنستغرام: افتح «لوحة الاحترافية» ← «إحصاءات الحساب» ← «المتابعون» ← «أكثر الأوقات نشاطاً». أدخل أعلى الساعات في إعدادات «ومضة» ليصبح المؤشر مطابقاً لجمهورك.</p></div>
    ${credit()}`;
  }

  function viewSettings() {
    return `<div class="grab"></div><div class="sh-h"><span></span><b>الإعدادات</b><button class="tx bold" data-act="close">تم</button></div>
      <div class="prof"><img src="logo-w.png?v=1" class="pf-wm" alt=""><img src="me.png?v=1" class="pf-me" alt=""><b>أ. ${esc(ST.name)}</b><span>المنسّق الإعلامي · حساب مدرسة معاذ بن جبل</span></div>
      <div class="card form"><label><span>اسم الحساب</span><input id="s_handle" value="${esc(ST.handle)}" dir="ltr"></label><label><span>عدد المتابعين الآن</span><input id="s_followers" type="number" inputmode="numeric" value="${ST.followers || ''}" placeholder="٠"></label><label><span>الهدف</span><input id="s_goal" type="number" inputmode="numeric" value="${ST.goal || ''}" placeholder="مثال ٥٠٠٠"></label></div>
      <h3 class="sh3">${svg('clock')} أكثر ساعات نشاط متابعيك</h3>
      <p class="foot">من إحصاءات إنستغرام ← المتابعون ← أكثر الأوقات نشاطاً. اختر الساعات الأعلى:</p>
      <div class="hours">${Array.from({ length: 18 }, (_, i) => i + 6).map(h => `<button class="${ST.peaks.includes(h) ? 'on' : ''}" data-act="peak" data-h="${h}">${hl(h)}</button>`).join('')}</div>
      <div class="group" style="margin-top:14px"><button class="li" data-act="export">${svg('save')}<span class="grow">حفظ نسخة احتياطية</span></button><button class="li" data-act="import">${svg('copy')}<span class="grow">استرجاع نسخة</span></button></div>
      <input type="file" id="impF" accept=".json" hidden>${credit()}`;
  }
  const credit = () => `<div class="credit"><img src="mark-g.png?v=1" alt=""><div><b>ومضة</b><span>مساعد حساب مدرسة معاذ بن جبل في إنستغرام</span><small>تصميم وتطوير: الأزهر الناعبي</small></div></div>`;

  /* ——— أدوات ——— */
  function openSheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; requestAnimationFrame(() => $('#sheet').classList.add('on')); }
  function closeSheet() { const s = $('#sheet'); s.classList.remove('on'); setTimeout(() => { s.hidden = true; }, 320); if (tab !== 'studio') render(false); }
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
  async function copy(t) { try { await navigator.clipboard.writeText(t); } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } toast('نُسخ ✓'); haptic(); }
  function remindICS() {
    const g = nextGold(new Date(), fmtNow); if (!g) return;
    const f = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`, e = new Date(+g.at + 30 * 6e4), P = W.PLAN[g.at.getDay()];
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wamda//AR', 'BEGIN:VEVENT', `UID:${+g.at}@wamda`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(g.at)}`, `DTEND:${f(e)}`, `SUMMARY:⚡ وقت النشر الذهبي — ${P.t}`, `DESCRIPTION:${P.idea}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:جهّز المنشور', 'TRIGGER:-PT10M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const file = new File([txt], 'wamda.ics', { type: 'text/calendar' });
    (async () => { try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file] }); } catch (e) { if (e.name === 'AbortError') return; } const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = 'wamda.ics'; document.body.appendChild(a); a.click(); a.remove(); })();
  }

  const A = {
    tab: el => { tab = el.dataset.tab; render(); },
    settings: () => openSheet(viewSettings()),
    close: closeSheet,
    fmt: el => { fmtNow = el.dataset.f; render(false); orb(); },
    remind: remindICS,
    goCap: el => { tab = 'studio'; stab = 'cap'; capT = el.dataset.t; render(); },
    goReel: () => { tab = 'studio'; stab = 'reels'; render(); },
    stab: el => { stab = el.dataset.k; render(false); },
    reel: el => { reelK = el.dataset.k; render(false); },
    copyShots: () => { const R = W.REELS[reelK]; copy(`🎬 ${R.t} (${R.len})\n♫ ${R.audio}\n` + R.shots.map((s, i) => `${i + 1}. ${s[0]}: ${s[1]}`).join('\n')); },
    capT: el => { capT = el.dataset.k; render(false); },
    tone: el => { capTone = el.dataset.k; $$('[data-act=tone]').forEach(b => b.classList.toggle('on', b === el)); if ($('#capOut').innerHTML) genCaps(); },
    gen: genCaps,
    copy: el => copy(el.dataset.txt),
    rndHook: () => { const h = W.HOOKS[Math.floor(Math.random() * W.HOOKS.length)]; $('#rh').innerHTML = `<div class="capc big"><pre>${esc(h)}</pre><button class="btn gr" data-act="copy" data-txt="${esc(h)}">${svg('copy')} نسخ</button></div>`; haptic(); },
    ck: el => { const i = el.dataset.i; CK[i] = !CK[i]; save(); render(false); haptic(); },
    ckReset: () => { CK = {}; save(); render(false); },
    tipC: el => { tipC = el.dataset.k; render(false); },
    logAdd: () => logSheet(null), logOpen: el => logSheet(el.dataset.id),
    lt: el => { logSheet.type = el.dataset.k; $$('[data-act=lt]').forEach(b => b.classList.toggle('on', b === el)); },
    logSave: el => { const id = el.dataset.id, g = k => $('#l_' + k).value, num = k => Math.max(0, +g(k) || 0);
      const p = { id: id || Date.now().toString(36), type: logSheet.type, topic: g('topic').trim(), date: g('date') || dk(new Date()), time: g('time') || '20:00' };
      ['views', 'reach', 'likes', 'comments', 'shares', 'saves', 'follows'].forEach(k => p[k] = num(k));
      if (!p.reach && p.views) p.reach = p.views;
      if (id) LOG = LOG.map(x => x.id === id ? p : x); else LOG.push(p);
      if (p.follows && ST.followers) ST.followers += id ? 0 : p.follows;
      save(); PERS = personal(); closeSheet(); toast('حُفظ ✓'); },
    logDel: el => { if (!A.logDel.armed) { A.logDel.armed = 1; $('#delT').textContent = 'تأكيد الحذف'; setTimeout(() => A.logDel.armed = 0, 3000); return; } LOG = LOG.filter(x => x.id !== el.dataset.id); save(); PERS = personal(); closeSheet(); },
    peak: el => { const h = +el.dataset.h; ST.peaks = ST.peaks.includes(h) ? ST.peaks.filter(x => x !== h) : [...ST.peaks, h]; el.classList.toggle('on'); save(); },
    export: () => { const b = new Blob([JSON.stringify({ LOG, ST })], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `wamda-${dk(new Date())}.json`; document.body.appendChild(a); a.click(); a.remove(); },
    import: () => $('#impF').click(),
  };
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = A[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); } });
  document.addEventListener('input', e => { const id = e.target.id; if (id === 's_handle') { ST.handle = e.target.value.replace('@', '').trim(); save(); } if (id === 's_followers') { ST.followers = +e.target.value || 0; save(); } if (id === 's_goal') { ST.goal = +e.target.value || 0; save(); } });
  document.addEventListener('change', e => { if (e.target.id === 'impF' && e.target.files[0]) { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); LOG = d.LOG || []; ST = Object.assign(ST, d.ST || {}); save(); PERS = personal(); closeSheet(); toast('تم الاسترجاع'); } catch (x) { toast('ملف غير صالح'); } }; r.readAsText(e.target.files[0]); } });
  $('#sheet .sheet-bg').addEventListener('click', closeSheet);
  $$('#tabs [data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); haptic(); }));

  /* ——— الحركة: مجرّة الجسيمات خلف المؤشر ——— */
  let raf;
  function orb() {
    cancelAnimationFrame(raf); const c = $('#orb'); if (!c) return; const x = c.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    const R = c.getBoundingClientRect(); c.width = R.width * dpr; c.height = R.height * dpr; x.scale(dpr, dpr);
    const cols = ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF', '#4F5BD5', '#E8C877'], cx = R.width > 520 ? 110 : R.width - 92, cy = 100;
    const P = Array.from({ length: 70 }, (_, i) => ({ a: Math.random() * 6.28, r: 62 + Math.random() * 70, s: (.002 + Math.random() * .006) * (i % 2 ? 1 : -1), z: Math.random(), c: cols[i % cols.length] }));
    const loop = t => { x.clearRect(0, 0, R.width, R.height);
      const g = x.createRadialGradient(cx, cy, 10, cx, cy, 170); g.addColorStop(0, 'rgba(214,41,118,.28)'); g.addColorStop(.5, 'rgba(79,91,213,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, R.width, R.height);
      P.forEach(p => { p.a += p.s; const tilt = .38, px = cx + Math.cos(p.a) * p.r, py = cy + Math.sin(p.a) * p.r * tilt + Math.sin(t / 1400 + p.r) * 4, front = Math.sin(p.a) > 0;
        x.globalAlpha = front ? .9 : .35; x.fillStyle = p.c; x.beginPath(); x.arc(px, py, (front ? 2.2 : 1.3) + p.z, 0, 6.28); x.fill(); });
      x.globalAlpha = 1; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  function tilt() { $$('.tilt').forEach(el => { el.onpointermove = e => { const r = el.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(700px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg)`; }; el.onpointerleave = () => el.style.transform = ''; }); }
  function countUp() { $$('[data-count]').forEach(el => { const to = +el.dataset.count, t0 = performance.now(); const st = t => { const k = Math.min(1, (t - t0) / 1000); el.textContent = n(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); }); }

  function render(anim = true) {
    const v = $('#view');
    v.innerHTML = tab === 'now' ? viewNow() : tab === 'plan' ? viewPlan() : tab === 'studio' ? viewStudio() : tab === 'stats' ? viewStats() : viewTips();
    if (anim) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); scrollTo(0, 0); countUp(); const gg = v.querySelector('.gauge'); if (gg) { gg.classList.add('sweep'); } }
    else v.classList.remove('enter');
    $$('#tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    if (tab === 'now') orb(); else cancelAnimationFrame(raf);
    tilt();
  }
  render(); setInterval(() => { if (tab === 'now' && $('#sheet').hidden) { const y = scrollY; render(false); scrollTo(0, y); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && tab === 'now') render(false); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__wd = { score, nextGold, bestHours };
})();
