/* ثبات — منطق التطبيق (كل البيانات على الجهاز فقط) */
(function () {
  'use strict';
  const T = window.TH, $ = s => document.querySelector(s);
  const K = 'thabat:';
  const Store = {
    get(k, d) { try { const r = localStorage.getItem(K + k); return r ? JSON.parse(r) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  };
  const DAY = 864e5;
  const DEF = { start: null, best: 0, why: [], plans: [], partner: { name: '', phone: '' }, shields: {}, habits: {}, pin: '', theme: 'auto', onboarded: false, pledge: '', read: {} };
  let S = Object.assign({}, DEF, Store.get('s', {}));
  let URGES = Store.get('urges', []), SLIPS = Store.get('slips', []);
  const save = () => { Store.set('s', S); Store.set('urges', URGES); Store.set('slips', SLIPS); };

  /* أدوات */
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]);
  const pad = x => String(x).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => keyOf(new Date());
  const greg = d => d.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/\d/g, x => AR[x]);
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (k, one, two, few, many) => k === 1 ? one : k === 2 ? two : k >= 3 && k <= 10 ? `${n(k)} ${few}` : `${n(k)} ${many}`;
  const daysTxt = k => k === 0 ? 'أقل من يوم' : plural(k, 'يوم واحد', 'يومان', 'أيام', 'يومًا');
  const streakMs = () => S.start ? Math.max(0, Date.now() - S.start) : 0;
  const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms || 12); } catch (e) {} };

  /* أيقونات خطّية */
  const ic = {
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.4h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M12 21c4 0 6.5-2.6 6.5-6.3 0-4-3.3-6.6-4.3-10.7-2.2 1.6-3.2 4-3 6.5C10 9.5 9.2 8.4 9 7c-2 1.8-3.5 4.4-3.5 7.7C5.5 18.4 8 21 12 21z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0zM7.5 6H4.5v1.5a3 3 0 0 0 3 3M16.5 6h3v1.5a3 3 0 0 1-3 3M12 14v3.5M8.5 20.5h7M9.5 17.5h5"/></svg>',
    wave: '<svg viewBox="0 0 24 24"><path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5 0M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5 0M2 7c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5 0"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    msg: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
    target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M10 7H6.5A1.5 1.5 0 0 0 5 8.5V12h5V7zM10 12c0 3-1.5 4.5-4 5M19 7h-3.5A1.5 1.5 0 0 0 14 8.5V12h5V7zM19 12c0 3-1.5 4.5-4 5"/></svg>'
  };

  /* ===================== الرئيسية ===================== */
  function nextMilestone(days) { const m = T.milestones.find(m => m > days) || null; const prev = [...T.milestones].reverse().find(m => m <= days) || 0; return { m, prev }; }
  function liveParts(ms) { const d = Math.floor(ms / DAY), h = Math.floor(ms / 36e5) % 24, mi = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60; return { d, h, mi, s }; }
  function viewHome() {
    const ms = streakMs(), p = liveParts(ms), nm = nextMilestone(p.d);
    const frac = nm.m ? Math.min(1, (ms - nm.prev * DAY) / ((nm.m - nm.prev) * DAY)) : 1;
    const R = 92, C2 = 2 * Math.PI * R;
    const held = URGES.filter(u => u.out === 'held').length;
    const best = Math.max(S.best, ms);
    const pledged = S.pledge === today();
    const why = S.why.length ? S.why[new Date().getDate() % S.why.length] : '';
    const q = T.quotes[new Date().getDate() % T.quotes.length];
    const badges = T.milestones.map(m => `<div class="mb ${p.d >= m ? 'got' : ''}"><span>${n(m)}</span><small>${m === 1 ? 'يوم' : m <= 10 ? 'أيام' : 'يومًا'}</small></div>`).join('');
    return `
    <header class="hd"><div class="grow"><div class="eyebrow">${greg(new Date())}</div><h1>ثبات</h1></div>
      <button class="icon-b" data-act="settings" aria-label="الإعدادات">${ic.gear}</button></header>

    <section class="hero">
      <div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" class="rt"/><circle cx="100" cy="100" r="${R}" class="rf" style="stroke-dasharray:${C2};stroke-dashoffset:${C2 * (1 - frac)}"/></svg>
        <div class="ring-in"><div class="big">${n(p.d)}</div><div class="unit">${p.d === 1 ? 'يوم' : p.d === 2 ? 'يومان' : p.d <= 10 ? 'أيام' : 'يومًا'}</div></div></div>
      <div class="live" id="live">${n(pad(p.h))}<i>س</i> ${n(pad(p.mi))}<i>د</i> ${n(pad(p.s))}<i>ث</i></div>
      <div class="next">${nm.m ? `الهدف التالي: <b>${T.milestoneNames[nm.m]}</b> · باقي ${daysTxt(nm.m - p.d)}` : 'تجاوزت كل الأهداف — ما شاء الله'}</div>
    </section>

    <button class="sos-big" data-act="sos"><span class="pulse"></span>${ic.wave}<div><b>أشعر برغبة الآن</b><span>سأساعدك تتجاوزها خطوة بخطوة</span></div></button>

    ${pledged ? `<div class="card pledge done">${ic.check}<div><b>تعهّدت اليوم</b><span>ثبّتك الله. يومك أمانة، فاحفظه.</span></div></div>`
      : `<div class="card pledge"><div class="grow"><b>تعهّد اليوم</b><span>«اليوم فقط، لن أفعلها». يومٌ واحد في كل مرة.</span></div><button class="btn primary sm" data-act="pledge">أتعهّد</button></div>`}

    <div class="card why" data-act="tab" data-tab="plan">${ic.heart}<div class="grow"><span class="lbl">تذكّر لماذا بدأت</span><b>${why ? esc(why) : 'اكتب سببك الأول في «خطتي»'}</b></div><span class="chev">${ic.chev}</span></div>

    <div class="stats">
      <div><b>${n(Math.floor(best / DAY))}</b><span>أطول سلسلة</span></div>
      <div><b>${n(held)}</b><span>رغبة تجاوزتها</span></div>
      <div><b>${n(SLIPS.length)}</b><span>تعثّر</span></div>
    </div>

    <h2 class="label">محطاتك</h2>
    <div class="card badges">${badges}</div>

    <div class="ayah">${q.t}<span>${q.s}</span></div>
    <button class="slip-link" data-act="slip">تعثّرت؟ لا تيأس — ابدأ من جديد</button>`;
  }

  /* ===================== أنماطي ===================== */
  const BUCKETS = [['الفجر والصباح', 4, 10], ['الظهر', 10, 14], ['العصر', 14, 18], ['المساء', 18, 22], ['الليل', 22, 26], ['آخر الليل', 2, 4]];
  const bucketOf = h => { for (const [l, a, b] of BUCKETS) { const hh = h < 4 && b > 24 ? h + 24 : h; if (hh >= a && hh < b) return l; } return 'آخر الليل'; };
  function viewInsights() {
    const all = [...URGES.map(u => ({ ...u, kind: 'urge' })), ...SLIPS.map(s => ({ ...s, kind: 'slip', out: 'slip' }))];
    if (!all.length) return `
      <header class="hd"><div class="grow"><h1>أنماطي</h1><div class="sub">اعرف محفّزاتك وأوقاتك الخطرة</div></div></header>
      <div class="empty-card">${ic.target}<b>لا توجد بيانات بعد</b><span>كلما جاءتك رغبة اضغط «رغبة الآن» وسجّل ما تشعر به. بعد أيام قليلة ستظهر هنا محفّزاتك وأخطر أوقاتك وأكثر ما يساعدك.</span></div>`;
    const held = URGES.filter(u => u.out === 'held').length, tot = URGES.length;
    const rate = tot ? Math.round(held / tot * 100) : 0;
    const cnt = {}; all.forEach(x => (x.tr || []).forEach(t => cnt[t] = (cnt[t] || 0) + 1));
    const trs = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 6), maxT = trs.length ? trs[0][1] : 1;
    const tname = id => (T.triggers.find(t => t.id === id) || { t: id }).t;
    const bk = {}; BUCKETS.forEach(b => bk[b[0]] = 0); all.forEach(x => bk[bucketOf(new Date(x.at).getHours())]++);
    const maxB = Math.max(1, ...Object.values(bk)), worst = Object.entries(bk).sort((a, b) => b[1] - a[1])[0];
    const act = {}; URGES.filter(u => u.out === 'held' && u.act).forEach(u => act[u.act] = (act[u.act] || 0) + 1);
    const acts = Object.entries(act).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const aname = id => (T.actions.find(a => a.id === id) || { t: id }).t;
    const days = []; for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY), k = keyOf(d);
      const slip = SLIPS.some(s => keyOf(new Date(s.at)) === k), urge = URGES.some(u => keyOf(new Date(u.at)) === k && u.out === 'held');
      const before = !S.start || d.getTime() < (SLIPS.length ? Math.min(S.start, ...SLIPS.map(s => s.at)) : S.start) - DAY;
      days.push(`<i class="${slip ? 'slip' : before ? 'na' : urge ? 'urge' : 'clean'}" title="${k}"></i>`);
    }
    return `
    <header class="hd"><div class="grow"><h1>أنماطي</h1><div class="sub">اعرف محفّزاتك وأوقاتك الخطرة</div></div></header>
    <div class="stats">
      <div><b>${n(tot)}</b><span>رغبة سجّلتها</span></div>
      <div><b class="ok">${n(held)}</b><span>تجاوزتها</span></div>
      <div><b>${n(rate)}٪</b><span>نسبة الثبات</span></div>
    </div>
    ${worst && worst[1] ? `<div class="card insight">${ic.bulb}<div><b>أخطر وقت عندك: ${worst[0]}</b><span>${trs.length ? `وأكثر ما يحرّكك: «${tname(trs[0][0])}». ضع لها خطة «إذا… فإنني…» في «خطتي».` : 'جهّز خطة خاصة لهذا الوقت.'}</span></div></div>` : ''}

    <h2 class="label">آخر ٣٠ يومًا</h2>
    <div class="card"><div class="days30">${days.join('')}</div>
      <div class="legend"><span><i class="clean"></i>ثابت</span><span><i class="urge"></i>تجاوزت رغبة</span><span><i class="slip"></i>تعثّر</span></div></div>

    <h2 class="label">أكثر المحفّزات</h2>
    <div class="card bars">${trs.map(([id, c]) => `<div class="bar-r"><span>${tname(id)}</span><div class="bt"><i style="width:${c / maxT * 100}%"></i></div><b>${n(c)}</b></div>`).join('') || '<span class="muted">لم تسجّل محفّزات بعد</span>'}</div>

    <h2 class="label">متى تأتي الرغبة؟</h2>
    <div class="card hours">${BUCKETS.map(([l]) => `<div class="hcol ${worst && l === worst[0] && worst[1] ? 'max' : ''}"><div class="hb"><i style="height:${bk[l] / maxB * 100}%"></i></div><b>${n(bk[l])}</b><span>${l}</span></div>`).join('')}</div>

    ${acts.length ? `<h2 class="label">ما الذي ساعدك أكثر</h2><div class="card list">${acts.map(([id, c], i) => `<div class="li"><span class="rank">${n(i + 1)}</span><div class="grow">${aname(id)}</div><b>${n(c)} مرة</b></div>`).join('')}</div>` : ''}`;
  }

  /* ===================== خطتي ===================== */
  function planScore() {
    const parts = [S.why.length > 0, S.plans.length > 0, !!(S.partner.name || S.partner.phone)];
    T.shields.forEach(s => parts.push(!!S.shields[s.id]));
    T.habits.forEach(h => parts.push(!!S.habits[h.id]));
    return Math.round(parts.filter(Boolean).length / parts.length * 100);
  }
  function viewPlan() {
    const sc = planScore();
    const why = S.why.map((w, i) => `<div class="li">${ic.heart}<div class="grow">${esc(w)}</div><button class="del" data-act="delWhy" data-i="${i}" aria-label="حذف">${ic.x}</button></div>`).join('');
    const plans = S.plans.map((p, i) => `<div class="ifthen"><div><span>إذا</span>${esc(p[0])}</div><div><span>فإنني</span>${esc(p[1])}</div><button class="del" data-act="delPlan" data-i="${i}" aria-label="حذف">${ic.x}</button></div>`).join('');
    const shields = T.shields.map(s => `<details class="shield ${S.shields[s.id] ? 'done' : ''}"><summary><span class="ck" data-act="toggleShield" data-id="${s.id}">${ic.check}</span>
      <div class="grow"><b>${s.t}</b><span>${s.h}</span></div><span class="chev">${ic.chev}</span></summary><ol>${s.steps.map(x => `<li>${x}</li>`).join('')}</ol>
      <button class="btn ${S.shields[s.id] ? '' : 'primary'} sm" data-act="toggleShield" data-id="${s.id}">${S.shields[s.id] ? 'تم ✓ (إلغاء)' : 'فعلت هذا'}</button></details>`).join('');
    const habits = T.habits.map(h => `<div class="li tog" data-act="toggleHabit" data-id="${h.id}"><span class="ck ${S.habits[h.id] ? 'on' : ''}">${ic.check}</span><div class="grow"><b>${h.t}</b><span>${h.h}</span></div></div>`).join('');
    const pn = S.partner;
    return `
    <header class="hd"><div class="grow"><h1>خطتي</h1><div class="sub">كلما اكتملت خطتك، سهُل عليك الثبات</div></div></header>
    <section class="card score"><div class="sc-ring" style="--p:${sc}"><b>${n(sc)}٪</b></div><div><b>اكتمال خطتك</b><span>${sc < 40 ? 'ابدأ بحماية جهازك — هي الأقوى أثرًا' : sc < 80 ? 'تقدّم ممتاز، أكمل الباقي' : 'خطتك قوية، ثبّتك الله'}</span></div></section>

    <h2 class="label">١. لماذا أريد التوقف؟</h2>
    <div class="card list">${why || '<div class="muted pad">اكتب أسبابك. ستظهر لك وقت الرغبة.</div>'}
      <div class="addrow"><input id="whyIn" placeholder="مثال: أريد قلبًا نقيًّا وعلاقة صادقة مع زوجتي مستقبلًا" maxlength="140"><button class="btn primary sm" data-act="addWhy">${ic.plus}</button></div></div>

    <h2 class="label">٢. خطط «إذا… فإنني…»</h2>
    <p class="hint">التخطيط المسبق لما ستفعله في لحظة معيّنة من أقوى طرق تغيير العادات.</p>
    <div class="plans">${plans}</div>
    <button class="btn ghost block" data-act="planSheet">${ic.plus} أضف خطة</button>

    <h2 class="label">٣. حماية الجهاز</h2>
    <p class="hint">اجعل الوصول صعبًا. اضغط على أي بند لترى الخطوات.</p>
    <div class="shields">${shields}</div>

    <h2 class="label">٤. عادات تحميك</h2>
    <div class="card list">${habits}</div>

    <h2 class="label">٥. شريك يساندك</h2>
    <div class="card partner">
      <p class="hint" style="margin:0 0 10px">شخص تثق به تراسله وقت الضعف. لا يلزم أن تخبره بالتفاصيل.</p>
      <input class="inp" data-p="name" placeholder="الاسم" value="${esc(pn.name)}">
      <input class="inp" data-p="phone" placeholder="رقم الجوال" inputmode="tel" value="${esc(pn.phone)}" dir="ltr">
      ${pn.phone ? `<div class="row2"><a class="btn sm" href="tel:${esc(pn.phone)}">${ic.phone} اتصال</a><a class="btn primary sm" href="sms:${esc(pn.phone)}${/iPhone|iPad/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent('أحتاج دعمك الآن، هل تستطيع أن تكلمني؟')}">${ic.msg} رسالة جاهزة</a></div>` : ''}
    </div>`;
  }

  /* ===================== تعلّم ===================== */
  function viewLearn() {
    const read = Object.keys(S.read).length;
    return `
    <header class="hd"><div class="grow"><h1>تعلّم</h1><div class="sub">دروس قصيرة · قرأت ${n(read)} من ${n(T.lessons.length)}</div></div></header>
    <div class="lessons">${T.lessons.map((l, i) => `<button class="lesson ${S.read[l.id] ? 'read' : ''}" data-act="lesson" data-i="${i}">
      <span class="ln">${S.read[l.id] ? ic.check : n(i + 1)}</span><div class="grow"><b>${l.t}</b><span>${l.h}</span></div><span class="chev">${ic.chev}</span></button>`).join('')}</div>`;
  }

  /* ===================== الإعدادات ===================== */
  function viewSettings() {
    const st = S.start ? new Date(S.start) : new Date();
    const local = `${st.getFullYear()}-${pad(st.getMonth() + 1)}-${pad(st.getDate())}T${pad(st.getHours())}:${pad(st.getMinutes())}`;
    return `
    <div class="topbar"><button class="back" data-act="tab" data-tab="home">${ic.back} رجوع</button></div>
    <header class="hd"><div class="grow"><h1>الإعدادات</h1></div></header>
    <div class="card list">
      <div class="li"><div class="grow"><b>بداية سلسلتك الحالية</b><span>عدّلها إن بدأت قبل تثبيت التطبيق</span></div></div>
      <div class="pad"><input class="inp" type="datetime-local" id="startIn" value="${local}" max="${keyOf(new Date())}T23:59"><button class="btn primary sm" data-act="saveStart" style="margin-top:8px">حفظ</button></div>
    </div>
    <div class="card list">
      <div class="li tog" data-act="pinSheet">${ic.lock}<div class="grow"><b>قفل برمز سري</b><span>${S.pin ? 'مفعّل — اضغط للتغيير أو الإلغاء' : 'يحمي خصوصيتك إذا أمسك أحد جوالك'}</span></div><span class="chev">${ic.chev}</span></div>
      <div class="li"><div class="grow"><b>المظهر</b></div><select class="sel" data-set="theme"><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>تلقائي</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>فاتح</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>داكن</option></select></div>
    </div>
    <div class="card list">
      <div class="li tog" data-act="export"><div class="grow"><b class="tint">تصدير نسخة احتياطية</b></div></div>
      <div class="li tog" data-act="import"><div class="grow"><b class="tint">استيراد نسخة</b></div></div>
      <div class="li tog" data-act="reset"><div class="grow"><b class="red">مسح كل البيانات</b></div></div>
    </div>
    <p class="foot">🔒 كل بياناتك محفوظة على جوالك فقط، ولا تُرسل إلى أي مكان.</p>`;
  }

  /* ===================== لحظة الرغبة ===================== */
  let SOS = null, breathT = null, waveT = null;
  function sosOpen() { SOS = { step: 'breathe', tr: [], lvl: 6, act: null, t0: Date.now() }; $('#sos').hidden = false; document.body.classList.add('noscroll'); sosRender(); haptic(20); }
  function sosClose() { clearInterval(breathT); clearInterval(waveT); $('#sos').hidden = true; document.body.classList.remove('noscroll'); SOS = null; }
  function sosRender() {
    clearInterval(breathT); clearInterval(waveT);
    const el = $('#sos'), st = SOS.step;
    const dots = ['breathe', 'feel', 'act', 'wave'].map(s => `<i class="${s === st ? 'on' : ''}"></i>`).join('');
    let body = '';
    if (st === 'breathe') body = `
      <h2>توقّف… وتنفّس معي</h2><p>الرغبة الآن في ذروتها. لن تتخذ أي قرار قبل أن تتنفّس.</p>
      <div class="breath"><div class="b-c"></div><div class="b-c2"></div><div class="b-t" id="bt">شهيق</div></div>
      <div class="b-n" id="bn">الدورة ١ من ٣</div>
      <button class="btn light block" data-act="sosNext" data-s="feel">أنا أهدأ، التالي</button>`;
    if (st === 'feel') body = `
      <h2>ما الذي يحرّكك الآن؟</h2><p>اختر ما ينطبق. معرفة السبب تضعف الرغبة.</p>
      <div class="chips">${T.triggers.map(t => `<button class="chip ${SOS.tr.includes(t.id) ? 'on' : ''}" data-act="sosTr" data-id="${t.id}">${t.t}</button>`).join('')}</div>
      <div class="lvl"><div class="lvl-h"><span>قوة الرغبة</span><b id="lvlV">${n(SOS.lvl)} / ١٠</b></div><input type="range" min="1" max="10" value="${SOS.lvl}" id="lvlIn"></div>
      <button class="btn light block" data-act="sosNext" data-s="act">التالي</button>`;
    if (st === 'act') body = `
      <h2>افعل شيئًا واحدًا الآن</h2><p>لا تبقَ في نفس المكان ونفس الوضع. اختر فعلًا وابدأ فورًا.</p>
      <div class="acts">${T.actions.map(a => `<button class="actc" data-act="sosAct" data-id="${a.id}"><b>${a.t}</b><span>${a.h}</span></button>`).join('')}</div>
      ${S.partner.phone ? `<a class="btn light block" href="tel:${esc(S.partner.phone)}" style="margin-top:10px">${ic.phone} اتصل بـ${esc(S.partner.name || 'شريكك')}</a>` : ''}`;
    if (st === 'wave') {
      const a = T.actions.find(x => x.id === SOS.act);
      const reasons = S.why.length ? S.why : ['لأنك تستحق أن تكون حرًّا', 'لأن الله يراك ويحب توبتك', 'لأن قلبك يرتاح بعدها'];
      body = `
      <h2>اركب الموجة</h2><p>${a ? `الآن: <b>${a.t}</b>. ` : ''}الرغبة ترتفع ثم تهبط. ابقَ معي حتى تهدأ.</p>
      <div class="wave-box"><svg viewBox="0 0 400 120" preserveAspectRatio="none"><path class="w1" d="M0 70 Q50 40 100 70 T200 70 T300 70 T400 70 V120 H0Z"/><path class="w2" d="M0 80 Q50 55 100 80 T200 80 T300 80 T400 80 V120 H0Z"/></svg>
        <div class="w-t" id="wt">١٠:٠٠</div></div>
      <div class="reasons" id="rs">${esc(reasons[0])}</div>
      <div class="w-ayah">وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا</div>
      <button class="btn light block" data-act="sosHeld">${ic.check} هدأت الرغبة — ثبتّ</button>
      <div class="row2"><button class="btn ghost-d sm" data-act="sosNext" data-s="breathe">ما زالت قوية</button><button class="btn ghost-d sm" data-act="sosSlip">تعثّرت</button></div>`;
    }
    el.innerHTML = `<div class="sos-in"><div class="sos-top"><button class="sos-x" data-act="sosClose" aria-label="إغلاق">${ic.x}</button><div class="dots">${dots}</div><span style="width:40px"></span></div><div class="sos-body">${body}</div></div>`;
    if (st === 'breathe') breathe();
    if (st === 'wave') wave();
    if (st === 'feel') { const r = $('#lvlIn'); r.addEventListener('input', () => { SOS.lvl = +r.value; $('#lvlV').textContent = `${n(SOS.lvl)} / ١٠`; }); }
  }
  function breathe() {
    const seq = [['شهيق', 4], ['احبس', 4], ['زفير', 6]]; let cyc = 0, i = 0, left = seq[0][1];
    const b = $('#sos .breath'); b.className = 'breath in';
    breathT = setInterval(() => {
      left--; if (left > 0) return;
      i = (i + 1) % 3; if (i === 0) { cyc++; if (cyc >= 3) { clearInterval(breathT); $('#bt').textContent = 'أحسنت'; $('#bn').textContent = 'تنفّست ٣ دورات'; haptic(30); return; } $('#bn').textContent = `الدورة ${n(cyc + 1)} من ٣`; }
      left = seq[i][1]; $('#bt').textContent = seq[i][0]; b.className = 'breath ' + ['in', 'hold', 'out'][i]; haptic(8);
    }, 1000);
  }
  function wave() {
    const end = Date.now() + 10 * 60e3, reasons = S.why.length ? S.why : ['لأنك تستحق أن تكون حرًّا', 'لأن الله يراك ويحب توبتك', 'لأن قلبك يرتاح بعدها']; let k = 0, tick = 0;
    waveT = setInterval(() => {
      const left = Math.max(0, end - Date.now()), m = Math.floor(left / 6e4), s = Math.floor(left / 1e3) % 60;
      const wt = $('#wt'); if (!wt) return clearInterval(waveT);
      wt.textContent = left ? `${n(pad(m))}:${n(pad(s))}` : 'هدأت؟';
      if (++tick % 6 === 0) { k = (k + 1) % reasons.length; const rs = $('#rs'); rs.classList.remove('fade'); void rs.offsetWidth; rs.classList.add('fade'); rs.textContent = reasons[k]; }
    }, 1000);
  }

  /* ===================== التعثّر ===================== */
  function slipSheet(fromSos) {
    sheet(`<div class="slip-s"><div class="soft-ic">${ic.heart}</div><h2>لا بأس… قم من جديد</h2>
      <p>التعثّر جزء من طريق كثيرين قبلك. المهم الآن ألا تحوّل سقطة واحدة إلى أيام.</p>
      <div class="steps3"><div><b>١</b>توقّف الآن، وأغلق كل شيء.</div><div><b>٢</b>توضأ واستغفر الله، وصلِّ ركعتين إن استطعت.</div><div><b>٣</b>افهم ما حدث لتمنعه المرة القادمة.</div></div>
      <div class="lbl2">ما الذي سبقها؟</div>
      <div class="chips light">${T.triggers.map(t => `<button class="chip" data-act="slipTr" data-id="${t.id}">${t.t}</button>`).join('')}</div>
      <div class="lbl2">ماذا ستغيّر؟ (اختياري)</div>
      <textarea id="slipNote" placeholder="مثال: سأترك الجوال خارج الغرفة بعد ١١ مساءً"></textarea>
      <button class="btn primary block" data-act="slipConfirm">ابدأ سلسلة جديدة الآن</button>
      <p class="foot center" style="margin-top:10px">أطول سلسلة لك محفوظة: ${n(Math.floor(Math.max(S.best, streakMs()) / DAY))} يوم</p></div>`);
    if (fromSos) sosClose();
  }

  /* ===================== الرسم ===================== */
  let tab = 'home';
  function render() {
    const v = $('#view');
    v.innerHTML = tab === 'home' ? viewHome() : tab === 'insights' ? viewInsights() : tab === 'plan' ? viewPlan() : tab === 'learn' ? viewLearn() : viewSettings();
    v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
    [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10)));
    document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    v.querySelectorAll('.inp[data-p]').forEach(inp => inp.addEventListener('change', () => { S.partner[inp.dataset.p] = inp.value.trim(); save(); rerender(); }));
    const wi = $('#whyIn'); if (wi) wi.addEventListener('keydown', e => { if (e.key === 'Enter') actions.addWhy(); });
  }
  function rerender() { const y = scrollY; render(); scrollTo(0, y); $('#view').classList.remove('enter'); }
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2300); }
  function sheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; }
  function closeSheet() { $('#sheet').hidden = true; }
  function confetti(k) {
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#14B8A6', '#F59E0B', '#38BDF8', '#F472B6', '#A78BFA', '#34D399'];
    for (let i = 0; i < k; i++) { const s = document.createElement('i'); s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-delay:${Math.random() * .5}s;animation-duration:${1.8 + Math.random() * 1.4}s;width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`; box.appendChild(s); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4000);
  }
  function applyTheme() {
    const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
  function checkMilestone() {
    const d = Math.floor(streakMs() / DAY), got = Store.get('ms', 0), m = [...T.milestones].reverse().find(x => x <= d);
    if (m && m > got) { Store.set('ms', m); setTimeout(() => { confetti(90); sheet(`<div class="cele"><div class="medal"><b>${n(m)}</b><span>${m === 1 ? 'يوم' : m <= 10 ? 'أيام' : 'يومًا'}</span></div><h2>${T.milestoneNames[m]}!</h2><p>وصلت إلى محطة جديدة. هذا ثمرة صبرك، فاحمد الله واستمر.</p><button class="btn primary block" data-act="closeSheet">الحمد لله</button></div>`); }, 700); }
  }

  /* ===================== الأحداث ===================== */
  const actions = {
    tab: el => { tab = el.dataset.tab; render(); scrollTo(0, 0); },
    settings: () => { tab = 'settings'; render(); scrollTo(0, 0); },
    sos: sosOpen, sosClose,
    sosNext: el => { SOS.step = el.dataset.s; sosRender(); },
    sosTr: el => { const id = el.dataset.id, i = SOS.tr.indexOf(id); i < 0 ? SOS.tr.push(id) : SOS.tr.splice(i, 1); el.classList.toggle('on'); haptic(8); },
    sosAct: el => { SOS.act = el.dataset.id; SOS.step = 'wave'; sosRender(); },
    sosHeld: () => {
      URGES.push({ at: SOS.t0, tr: SOS.tr, lvl: SOS.lvl, act: SOS.act, out: 'held' }); save(); sosClose();
      confetti(80); haptic(40);
      sheet(`<div class="cele"><div class="medal teal">${ic.wave}</div><h2>تجاوزت الموجة!</h2><p>هذه رغبتك رقم ${n(URGES.filter(u => u.out === 'held').length)} التي تتغلّب عليها. كل مرة تصبح أقوى.</p><button class="btn primary block" data-act="closeSheet">الحمد لله</button></div>`);
      rerender();
    },
    sosSlip: () => { const tr = SOS.tr, lvl = SOS.lvl, at = SOS.t0; URGES.push({ at, tr, lvl, act: SOS.act, out: 'slip' }); save(); slipSheet(true); window._slipTr = tr.slice(); },
    slip: () => { window._slipTr = []; slipSheet(false); },
    slipTr: el => { const id = el.dataset.id, a = window._slipTr || (window._slipTr = []), i = a.indexOf(id); i < 0 ? a.push(id) : a.splice(i, 1); el.classList.toggle('on'); },
    slipConfirm: () => {
      const ms = streakMs(); S.best = Math.max(S.best, ms);
      SLIPS.push({ at: Date.now(), tr: window._slipTr || [], note: ($('#slipNote') || {}).value || '' });
      S.start = Date.now(); Store.set('ms', 0); save(); closeSheet(); tab = 'home'; render();
      toast('بدأت سلسلة جديدة. ثبّتك الله');
    },
    pledge: () => { S.pledge = today(); save(); haptic(30); confetti(40); rerender(); toast('تعهّدت لليوم. يومٌ واحد في كل مرة'); },
    addWhy: () => { const i = $('#whyIn'), v = i && i.value.trim(); if (!v) return; S.why.push(v); save(); rerender(); },
    delWhy: el => { S.why.splice(+el.dataset.i, 1); save(); rerender(); },
    planSheet: () => sheet(`<h2>خطط «إذا… فإنني…»</h2><p>اختر جاهزة أو اكتب خطتك.</p>
      <div class="tpl">${T.plans.map((p, i) => `<button class="tpl-b" data-act="addTpl" data-i="${i}"><span>إذا</span> ${p[0]} <span>فإنني</span> ${p[1]}</button>`).join('')}</div>
      <div class="lbl2">خطة خاصة بك</div><input class="inp" id="pIf" placeholder="إذا…"><input class="inp" id="pThen" placeholder="فإنني…" style="margin-top:8px">
      <button class="btn primary block" data-act="addPlan" style="margin-top:10px">إضافة</button>`),
    addTpl: el => { const p = T.plans[+el.dataset.i]; if (!S.plans.some(x => x[0] === p[0])) S.plans.push(p.slice()); save(); closeSheet(); rerender(); toast('أُضيفت الخطة'); },
    addPlan: () => { const a = $('#pIf').value.trim(), b = $('#pThen').value.trim(); if (!a || !b) return toast('اكتب الجزأين'); S.plans.push([a.replace(/^إذا\s*/, ''), b.replace(/^فإنني\s*/, '')]); save(); closeSheet(); rerender(); },
    delPlan: el => { S.plans.splice(+el.dataset.i, 1); save(); rerender(); },
    toggleShield: el => { const id = el.dataset.id; S.shields[id] = !S.shields[id]; save(); const d = el.closest('details'), open = d && d.open; rerender(); if (open) { const nd = document.querySelector(`details .ck[data-id="${id}"]`); if (nd) nd.closest('details').open = true; } },
    toggleHabit: el => { const id = el.dataset.id; S.habits[id] = !S.habits[id]; save(); rerender(); },
    lesson: el => { const l = T.lessons[+el.dataset.i]; S.read[l.id] = 1; save();
      sheet(`<article class="lesson-r"><span class="lbl2">درس ${n(+el.dataset.i + 1)}</span><h2>${l.t}</h2>${l.body.map(p => `<p>${p}</p>`).join('')}<button class="btn primary block" data-act="closeSheet">فهمت</button></article>`); rerender(); },
    closeSheet,
    saveStart: () => { const v = $('#startIn').value; if (!v) return; const t = new Date(v).getTime(); if (t > Date.now()) return toast('لا يمكن أن تكون في المستقبل'); S.start = t; save(); toast('حُفظ'); tab = 'home'; render(); },
    pinSheet: () => sheet(`<h2>قفل برمز سري</h2><p>${S.pin ? 'اكتب رمزًا جديدًا من ٤ أرقام، أو اتركه فارغًا لإلغاء القفل.' : 'اختر رمزًا من ٤ أرقام يُطلب عند فتح التطبيق.'}</p>
      <input class="inp" id="pinIn" inputmode="numeric" maxlength="4" placeholder="••••" dir="ltr" style="text-align:center;font-size:28px;letter-spacing:12px">
      <button class="btn primary block" data-act="savePin" style="margin-top:10px">حفظ</button>`),
    savePin: () => { const v = $('#pinIn').value.trim(); if (v && !/^\d{4}$/.test(v)) return toast('٤ أرقام فقط'); S.pin = v; save(); closeSheet(); rerender(); toast(v ? 'تم تفعيل القفل' : 'أُلغي القفل'); },
    export: () => { const d = JSON.stringify({ s: S, urges: URGES, slips: SLIPS }); if (navigator.share) navigator.share({ text: d }).catch(() => {}); else { navigator.clipboard && navigator.clipboard.writeText(d); toast('نُسخت البيانات'); } },
    import: () => sheet(`<h2>استيراد</h2><textarea id="impIn" style="min-height:140px;direction:ltr"></textarea><button class="btn primary block" data-act="doImport">استيراد</button>`),
    doImport: () => { try { const o = JSON.parse($('#impIn').value); S = Object.assign({}, DEF, o.s); URGES = o.urges || []; SLIPS = o.slips || []; save(); closeSheet(); render(); toast('تم'); } catch (e) { toast('النص غير صالح'); } },
    reset: () => sheet(`<h2>مسح كل البيانات؟</h2><p>لا يمكن التراجع.</p><button class="btn danger block" data-act="doReset">نعم، امسح</button>`),
    doReset: () => { Object.keys(localStorage).filter(k => k.startsWith(K)).forEach(k => localStorage.removeItem(k)); location.reload(); },
    obNext: el => { obStep(+el.dataset.s); },
    obDone: () => {
      const w = ($('#obWhy') || {}).value; if (w && w.trim()) S.why.push(w.trim());
      const ch = document.querySelector('input[name=obStart]:checked'); const v = ($('#obDate') || {}).value;
      S.start = ch && ch.value === 'past' && v ? Math.min(Date.now(), new Date(v).getTime()) : Date.now();
      S.onboarded = true; save(); closeSheet(); render(); checkMilestone();
    },
    pinKey: el => pinKey(el.dataset.k)
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.tagName === 'SUMMARY' || el.closest('summary') && el.dataset.act === 'toggleShield') e.preventDefault();
    const f = actions[el.dataset.act]; if (f) f(el);
  });
  document.addEventListener('change', e => { const id = e.target.dataset && e.target.dataset.set; if (id) { S[id] = e.target.value; save(); applyTheme(); } });
  document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.addEventListener('click', () => actions.tab(b)));

  /* ===================== الترحيب ===================== */
  function obStep(k) {
    if (k === 1) sheet(`<div class="ob"><div class="ob-ic"><img src="icon-180.png" alt=""></div><h2>أهلًا بك في «ثبات»</h2>
      <p>قرارك بالتغيير شجاعة. هذا التطبيق يساعدك بطرق عملية: يقودك وقت الرغبة، ويكشف لك محفّزاتك، ويبني معك خطة تحمي جهازك ووقتك.</p>
      <div class="priv">${ic.lock}<span>بياناتك على جوالك فقط. لا حساب، ولا إنترنت، ولا أحد يرى شيئًا.</span></div>
      <button class="btn primary block" data-act="obNext" data-s="2">لنبدأ</button></div>`);
    if (k === 2) sheet(`<div class="ob"><h2>متى بدأت؟</h2><p>تبدأ سلسلتك من الآن، أو من آخر مرة إن كنت ثابتًا منذ مدة.</p>
      <label class="radio"><input type="radio" name="obStart" value="now" checked> أبدأ من الآن</label>
      <label class="radio"><input type="radio" name="obStart" value="past"> أنا ثابت منذ: <input type="date" id="obDate" class="inp" max="${today()}" style="margin-top:8px"></label>
      <h2 style="margin-top:18px">لماذا تريد التوقف؟</h2><p>سبب واحد صادق يكفي الآن. سيظهر لك وقت الرغبة.</p>
      <textarea id="obWhy" placeholder="مثال: أريد أن أرضي ربي وأحترم نفسي"></textarea>
      <button class="btn primary block" data-act="obDone">ابدأ رحلتي</button></div>`);
  }

  /* ===================== القفل ===================== */
  let pinBuf = '';
  function lockShow() {
    const L = $('#lock'); L.hidden = false; pinBuf = '';
    L.innerHTML = `<div class="lock-in"><div class="l-ic">${ic.lock}</div><h2>أدخل الرمز</h2><div class="pins">${'<i></i>'.repeat(4)}</div>
      <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button data-act="pinKey" data-k="${k}">${typeof k === 'number' ? n(k) : k}</button>`).join('')}</div></div>`;
  }
  function pinKey(k) {
    if (k === '⌫') pinBuf = pinBuf.slice(0, -1); else if (pinBuf.length < 4) pinBuf += k;
    document.querySelectorAll('.pins i').forEach((p, i) => p.classList.toggle('on', i < pinBuf.length));
    if (pinBuf.length === 4) {
      if (pinBuf === S.pin) { $('#lock').hidden = true; } else { const p = $('.pins'); p.classList.remove('err'); void p.offsetWidth; p.classList.add('err'); haptic(60); setTimeout(() => { pinBuf = ''; document.querySelectorAll('.pins i').forEach(x => x.classList.remove('on')); }, 400); }
    }
  }

  /* ===================== البدء ===================== */
  applyTheme();
  if (S.pin) lockShow();
  render();
  setInterval(() => {
    const el = $('#live'); if (!el) return;
    const p = liveParts(streakMs()); el.innerHTML = `${n(pad(p.h))}<i>س</i> ${n(pad(p.mi))}<i>د</i> ${n(pad(p.s))}<i>ث</i>`;
    if (p.h === 0 && p.mi === 0 && p.s === 0) render();
  }, 1000);
  if (!S.onboarded) setTimeout(() => obStep(1), 900); else checkMilestone();
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.pin) lockShow(); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
})();
