/* ميزان — منطق التطبيق (البيانات على الجهاز فقط) */
(function () {
  'use strict';
  const M = window.MZ, $ = s => document.querySelector(s), K = 'mizan:';
  const Store = {
    get(k, d) { try { const r = localStorage.getItem(K + k); return r ? JSON.parse(r) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  };
  let P = Store.get('p', null);              // الملف الشخصي
  let L = Store.get('log', {});              // سجل الأيام
  let W = Store.get('w', {});                // الأوزان
  let RECENT = Store.get('recent', []);
  let THEME = Store.get('theme', 'auto');
  const save = () => { Store.set('p', P); Store.set('log', L); Store.set('w', W); Store.set('recent', RECENT); };

  /* أدوات */
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]).replace('.', '٫');
  const r1 = x => Math.round(x * 10) / 10;
  const pad = x => String(x).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => keyOf(new Date());
  const DAY = 864e5;
  const greg = d => d.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/\d/g, x => AR[x]);
  const shortDate = d => d.toLocaleDateString('ar', d.getFullYear() !== new Date().getFullYear() ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }).replace(/\d/g, x => AR[x]);
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const haptic = () => { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };

  /* ===================== الحسابات ===================== */
  function trendSeries() {
    const ks = Object.keys(W).sort(); let t = null; const out = [];
    ks.forEach(k => { const w = W[k]; t = t == null ? w : t + 0.1 * (w - t); out.push({ k, w, t }); });
    return out;
  }
  function curWeight() { const s = trendSeries(); return s.length ? s[s.length - 1].t : P.w0; }
  function targets() {
    const w = curWeight(), h = P.h, a = P.age;
    const bmr = 10 * w + 6.25 * h - 5 * a + (P.sex === 'm' ? 5 : -161);
    const tdee = bmr * P.act;
    const floor = P.sex === 'm' ? 1500 : 1200;
    const pace = safePace(P.pace, w);
    let kcal = tdee - pace * 7700 / 7;
    const floored = kcal < floor; kcal = Math.max(floor, kcal);
    kcal = Math.round(kcal / 10) * 10;
    const bmi = w / Math.pow(h / 100, 2);
    const refW = bmi >= 30 ? 25 * Math.pow(h / 100, 2) : w;
    const protein = Math.round(1.6 * refW / 5) * 5;
    const water = Math.max(8, Math.round(35 * w / 250));
    const realPace = Math.max(0, (tdee - kcal) * 7 / 7700);
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, water, steps: 8000, floored, floor, bmi, pace: realPace, w };
  }
  const safePace = (pace, w) => Math.min(pace, Math.max(0.25, Math.floor(w * 0.01 / 0.25) * 0.25)); // لا أكثر من ١٪ من الوزن أسبوعيًا
  function dayLog(k) { if (!L[k]) L[k] = { f: [], water: 0, steps: 0, wo: [] }; return L[k]; }
  function totals(k) { const d = L[k] || { f: [] }; return d.f.reduce((a, x) => ({ k: a.k + x.k * x.q, p: a.p + x.p * x.q }), { k: 0, p: 0 }); }
  function projection() {
    const s = trendSeries(), t = targets();
    const cur = s.length ? s[s.length - 1].t : P.w0;
    let rate = t.pace / 7; // كجم يوميًا (المخطط)
    if (s.length >= 2) {
      const last = s[s.length - 1], back = s.filter(x => fromKey(last.k) - fromKey(x.k) >= 13 * DAY).pop();
      if (back) { const r = (back.t - last.t) / ((fromKey(last.k) - fromKey(back.k)) / DAY); if (r > 0.01) rate = r; }
    }
    const left = cur - P.goal;
    if (left <= 0) return { done: true };
    return { done: false, days: Math.round(left / rate), date: new Date(Date.now() + left / rate * DAY) };
  }

  /* ===================== أيقونات ===================== */
  const ic = {
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.4h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>', minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>', check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>', back: '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3.5c3.5 4.2 6 7.6 6 10.7a6 6 0 0 1-12 0c0-3.1 2.5-6.5 6-10.7z"/></svg>',
    steps: '<svg viewBox="0 0 24 24"><path d="M8 3.5c1.6 0 2.5 1.8 2.5 4s-.9 4-2.5 4-2.5-1.8-2.5-4 .9-4 2.5-4zM5.8 14.5h4.4v1.7a2.2 2.2 0 0 1-4.4 0zM16 7c1.6 0 2.5 1.8 2.5 4s-.9 4-2.5 4-2.5-1.8-2.5-4 .9-4 2.5-4zM13.8 18h4.4v.3a2.2 2.2 0 0 1-4.4 0z"/></svg>',
    meat: '<svg viewBox="0 0 24 24"><path d="M15.5 4.5a5 5 0 0 1 4 8c-2 2.5-6 4-9 4l-3 3a1.8 1.8 0 1 1-2.5-2.5l3-3c0-3 1.5-7 4-9a5 5 0 0 1 3.5-.5z"/></svg>',
    scale: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 9a5 5 0 0 1 8 0M12 9l1.5-2"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M12 21c4 0 6.5-2.6 6.5-6.3 0-4-3.3-6.6-4.3-10.7-2.2 1.6-3.2 4-3 6.5C10 9.5 9.2 8.4 9 7c-2 1.8-3.5 4.4-3.5 7.7C5.5 18.4 8 21 12 21z"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    dumb: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
    trend: '<svg viewBox="0 0 24 24"><path d="M3 7l6 6 4-4 8 8M21 11v6h-6"/></svg>'
  };
  const MEAL_IC = { b: '🌅', l: '☀️', d: '🌙', s: '🍎' };

  /* ===================== اليوم ===================== */
  let viewKey = today();
  function viewToday() {
    const k = viewKey, d = dayLog(k), t = targets(), tot = totals(k), isToday = k === today();
    const left = t.kcal - Math.round(tot.k), over = left < 0;
    const R = 96, C2 = 2 * Math.PI * R, frac = Math.min(1, tot.k / t.kcal);
    const pFrac = Math.min(1, tot.p / t.protein);
    const hr = new Date().getHours();
    const hi = hr < 12 ? 'صباح الخير' : 'مساء الخير';
    const tip = M.tips[new Date(k).getDate() % M.tips.length];
    const s = trendSeries(), w = W[k];
    const meals = M.meals.map(m => {
      const items = d.f.map((x, i) => [x, i]).filter(([x]) => x.m === m.id);
      const kc = items.reduce((a, [x]) => a + x.k * x.q, 0);
      return `<div class="meal"><div class="meal-h"><span class="me">${MEAL_IC[m.id]}</span><b>${m.t}</b><span class="mk">${kc ? n(Math.round(kc)) + ' سعرة' : ''}</span>
        <button class="add" data-act="food" data-m="${m.id}" aria-label="إضافة">${ic.plus}</button></div>
        ${items.map(([x, i]) => `<div class="fi"><div class="grow"><div class="fn">${esc(x.n)}${x.q !== 1 ? ` <small>×${n(x.q)}</small>` : ''}</div><div class="fp">${esc(x.u || '')}${x.p ? ` · بروتين ${n(r1(x.p * x.q))}غ` : ''}</div></div>
          <span class="fk">${n(Math.round(x.k * x.q))}</span><button class="del" data-act="delFood" data-i="${i}" aria-label="حذف">${ic.x}</button></div>`).join('')}</div>`;
    }).join('');
    const cups = Array.from({ length: t.water }, (_, i) => `<button class="cup ${i < d.water ? 'on' : ''}" data-act="water" data-v="${i + 1}" aria-label="كوب ${i + 1}">${ic.drop}</button>`).join('');
    return `
    <header class="hd"><div class="grow"><div class="eyebrow">${isToday ? hi + (P.name ? ' يا ' + esc(P.name) : '') : 'سجل يوم سابق'}</div><h1>${isToday ? 'اليوم' : greg(fromKey(k)).split('،')[0]}</h1><div class="sub">${greg(fromKey(k))}</div></div>
      <div class="hd-b"><button class="icon-b" data-act="prevDay" aria-label="اليوم السابق">${ic.back}</button><button class="icon-b" data-act="nextDay" ${isToday ? 'disabled' : ''} aria-label="اليوم التالي">${ic.chev}</button><button class="icon-b" data-act="settings" aria-label="الإعدادات">${ic.gear}</button></div></header>

    <section class="hero ${over ? 'over' : ''}">
      <div class="ring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="${R}" class="rt"/><circle cx="110" cy="110" r="${R}" class="rf" style="stroke-dasharray:${C2};stroke-dashoffset:${C2 * (1 - frac)}"/></svg>
        <div class="ring-in"><span class="ri-l">${over ? 'تجاوزت بـ' : 'متبقٍّ'}</span><b>${n(Math.abs(left))}</b><span class="ri-l">سعرة</span></div></div>
      <div class="hero-side">
        <div class="hs"><span>الهدف</span><b>${n(t.kcal)}</b></div>
        <div class="hs"><span>أكلت</span><b>${n(Math.round(tot.k))}</b></div>
        <div class="macro"><div class="mh"><span>بروتين</span><b>${n(Math.round(tot.p))}<small> / ${n(t.protein)} غ</small></b></div><div class="mbar"><i style="width:${pFrac * 100}%"></i></div></div>
      </div>
    </section>

    <div class="duo">
      <div class="card water"><div class="ch">${ic.drop}<b>الماء</b><span>${n(d.water)} / ${n(t.water)} أكواب</span></div><div class="cups">${cups}</div></div>
      <div class="card stepsc"><div class="ch">${ic.steps}<b>الخطوات</b></div><div class="st-v">${n(d.steps.toLocaleString('en'))}<small> / ${n('8,000')}</small></div>
        <div class="mbar blue"><i style="width:${Math.min(100, d.steps / t.steps * 100)}%"></i></div>
        <div class="st-b"><button data-act="steps" data-v="-1000">${ic.minus}</button><button data-act="steps" data-v="1000">+١٠٠٠</button><button data-act="stepsSet">تعديل</button></div></div>
    </div>

    <h2 class="label">وجباتي</h2>
    <div class="card meals">${meals}</div>

    <div class="card weigh">
      <div class="ch">${ic.scale}<b>وزن اليوم</b>${s.length ? `<span>الوزن الحقيقي ${n(r1(curWeight()))} كجم</span>` : ''}</div>
      <div class="wrow"><input id="wIn" type="number" inputmode="decimal" step="0.1" placeholder="${n(r1(curWeight()))}" value="${w || ''}"><span>كجم</span><button class="btn primary sm" data-act="saveW">${w ? 'تحديث' : 'حفظ'}</button></div>
      <div class="hint">زِن نفسك صباحًا بعد دورة المياه وقبل الأكل.</div>
    </div>

    <div class="card tipc">${ic.bulb}<span>${tip}</span></div>`;
  }

  /* ===================== التقدّم ===================== */
  function chart(s, goal) {
    const pts = s.slice(-60); if (pts.length < 2) return '<div class="empty">سجّل وزنك يومين على الأقل ليظهر المنحنى</div>';
    const W0 = 340, H0 = 180, pd = 14;
    const vals = pts.flatMap(p => [p.w, p.t]); let mn = Math.min(...vals) - 0.5, mx = Math.max(...vals) + 0.5; if (goal >= mn - 1.5) mn = Math.min(mn, goal - 0.5); if (mx - mn < 2) { mx += 1; mn -= 1; }
    const t0 = fromKey(pts[0].k).getTime(), t1 = fromKey(pts[pts.length - 1].k).getTime() || t0 + 1;
    const X = k => pd + (W0 - 2 * pd) * (fromKey(k).getTime() - t0) / Math.max(1, t1 - t0); // الزمن من اليسار لليمين كالمعتاد في الرسوم
    const Y = v => pd + (H0 - 2 * pd) * (mx - v) / (mx - mn);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.k).toFixed(1)} ${Y(p.t).toFixed(1)}`).join(' ');
    const area = line + ` L${X(pts[pts.length - 1].k).toFixed(1)} ${H0} L${X(pts[0].k).toFixed(1)} ${H0}Z`;
    const dots = pts.map(p => `<circle cx="${X(p.k).toFixed(1)}" cy="${Y(p.w).toFixed(1)}" r="2.6" class="cd"/>`).join('');
    const gy = Y(goal);
    return `<svg class="chart" viewBox="0 0 ${W0} ${H0}" preserveAspectRatio="none">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".28"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>
      ${gy >= 0 && gy <= H0 ? `<line x1="0" x2="${W0}" y1="${gy}" y2="${gy}" class="gl"/>` : ''}
      <path d="${area}" fill="url(#ag)" stroke="none"/>${dots}<path d="${line}" class="tl"/></svg>
      <div class="ch-ax"><span>${shortDate(fromKey(pts[0].k))}</span><span class="ax-mid">${n(r1(mn))}–${n(r1(mx))} كجم</span><span>${shortDate(fromKey(pts[pts.length - 1].k))}</span></div>`;
  }
  function viewProgress() {
    const s = trendSeries(), t = targets(), cur = curWeight(), lost = P.w0 - cur, need = P.w0 - P.goal;
    const pct = Math.max(0, Math.min(100, lost / need * 100)), pr = projection();
    const bmi = t.bmi, bmiPos = Math.max(0, Math.min(100, (bmi - 15) / (40 - 15) * 100));
    const bmiT = bmi < 18.5 ? 'نحافة' : bmi < 25 ? 'وزن صحي' : bmi < 30 ? 'زيادة وزن' : 'سمنة';
    const kgBadges = []; for (let i = 1; i <= Math.ceil(need); i++) kgBadges.push(`<div class="kb ${lost >= i ? 'got' : ''}">${n(i)}<small>كجم</small></div>`);
    const p5 = P.w0 * 0.05, p10 = P.w0 * 0.10;
    const weeks = []; for (let i = 0; i < 6; i++) {
      const e = Date.now() - i * 7 * DAY, b = e - 7 * DAY; const ws = Object.keys(W).filter(k => { const x = fromKey(k).getTime(); return x > b && x <= e; });
      const cal = Object.keys(L).filter(k => { const x = fromKey(k).getTime(); return x > b && x <= e && L[k].f.length; });
      if (!ws.length && !cal.length) continue;
      weeks.push(`<div class="wk"><span>${i === 0 ? 'هذا الأسبوع' : i === 1 ? 'الأسبوع الماضي' : `قبل ${n(i)} أسابيع`}</span><b>${ws.length ? n(r1(ws.reduce((a, k) => a + W[k], 0) / ws.length)) + ' كجم' : '—'}</b><b>${cal.length ? n(Math.round(cal.reduce((a, k) => a + totals(k).k, 0) / cal.length)) + ' سعرة' : '—'}</b></div>`);
    }
    return `
    <header class="hd"><div class="grow"><h1>التقدّم</h1><div class="sub">الوزن الحقيقي يتجاهل تقلّبات الماء اليومية</div></div></header>
    <section class="prog-hero">
      <div class="ph-row"><div><span>الوزن الحقيقي</span><b>${n(r1(cur))}<small> كجم</small></b></div><div><span>نزلت</span><b class="ok">${lost > 0 ? n(r1(lost)) : '٠'}<small> كجم</small></b></div><div><span>الهدف</span><b>${n(P.goal)}<small> كجم</small></b></div></div>
      <div class="pbar"><i style="width:${pct}%"></i></div>
      <div class="ph-foot">${pr.done ? '🎉 وصلت إلى هدفك! ما شاء الله' : `${n(Math.round(pct))}٪ من الطريق · الوصول المتوقع: <b>${shortDate(pr.date)}</b>`}</div>
    </section>
    <h2 class="label">منحنى الوزن</h2>
    <div class="card chart-c">${chart(s, P.goal)}<div class="legend"><span><i class="lg-t"></i>الوزن الحقيقي</span><span><i class="lg-d"></i>القياس اليومي</span><span><i class="lg-g"></i>الهدف</span></div></div>
    <h2 class="label">مؤشر كتلة الجسم</h2>
    <div class="card bmi"><div class="bmi-h"><b>${n(r1(bmi))}</b><span class="bmi-t">${bmiT}</span></div>
      <div class="bmi-bar"><i style="right:${bmiPos}%"></i></div><div class="bmi-ax"><span>١٨٫٥</span><span>٢٥</span><span>٣٠</span></div>
      <p class="hint" style="margin:10px 0 0">مؤشر تقريبي لا يميّز العضلات من الدهون؛ استخدمه مع محيط الخصر ونظرة الطبيب.</p></div>
    <h2 class="label">محطاتك</h2>
    <div class="card"><div class="pcts"><div class="pc ${lost >= p5 ? 'got' : ''}"><b>٥٪</b><span>${n(r1(p5))} كجم — فائدة صحية ملموسة</span></div><div class="pc ${lost >= p10 ? 'got' : ''}"><b>١٠٪</b><span>${n(r1(p10))} كجم — إنجاز كبير</span></div></div>
      <div class="kgs">${kgBadges.join('')}</div></div>
    ${weeks.length ? `<h2 class="label">متوسطات أسبوعية</h2><div class="card weeks"><div class="wk h"><span></span><span>الوزن</span><span>السعرات</span></div>${weeks.join('')}</div>` : ''}`;
  }

  /* ===================== التمارين ===================== */
  function viewWorkout() {
    const wk = Object.keys(L).filter(k => fromKey(k).getTime() > Date.now() - 7 * DAY && (L[k].wo || []).length).length;
    const lastId = (() => { const ks = Object.keys(L).sort().reverse(); for (const k of ks) { const w = L[k].wo || []; if (w.length) return w[w.length - 1]; } return 'B'; })();
    const next = lastId === 'A' ? 'B' : 'A', doneToday = (dayLog(today()).wo || []).length > 0;
    const wo = M.workouts.find(w => w.id === next);
    return `
    <header class="hd"><div class="grow"><h1>التمارين</h1><div class="sub">٣ أيام في الأسبوع في البيت + مشي يومي</div></div></header>
    <section class="wk-hero"><div class="wkh-n">${n(wk)}<small> / ٣</small></div><div><b>تمارين هذا الأسبوع</b><span>${wk >= 3 ? 'أحسنت! أكملت هدف الأسبوع' : 'تمارين المقاومة تحفظ عضلاتك أثناء الرجيم'}</span></div></section>
    <h2 class="label">${doneToday ? 'تمرّنت اليوم ✓' : 'تمرين اليوم المقترح'}</h2>
    <div class="card list">${wo.items.map((x, i) => `<details class="ex"><summary><span class="exn">${n(i + 1)}</span><div class="grow"><b>${x[0]}</b><span>${x[1]}</span></div><span class="chev">${ic.chev}</span></summary><p>${x[2]}</p></details>`).join('')}</div>
    <p class="hint">إحماء ٥ دقائق قبل البدء (مشي في المكان). ارتح ٦٠–٩٠ ثانية بين الجولات. عندما تصبح سهلة، زِد التكرارات.</p>
    ${doneToday ? '' : `<button class="btn primary block" data-act="woDone" data-id="${wo.id}" style="margin-top:12px">${ic.check} أنهيت تمرين اليوم</button>`}
    <h2 class="label">البرنامج الآخر</h2>
    <div class="card list">${M.workouts.find(w => w.id !== next).items.map(x => `<div class="li"><div class="grow"><b>${x[0]}</b><span>${x[1]}</span></div></div>`).join('')}</div>
    <div class="card tipc">${ic.steps}<span>المشي: اهدف إلى ٨٠٠٠ خطوة يوميًا. مشي ١٠ دقائق بعد كل وجبة يقرّبك من الهدف بسهولة.</span></div>`;
  }

  /* ===================== الدليل ===================== */
  function viewGuide() {
    const t = targets();
    return `
    <header class="hd"><div class="grow"><h1>الدليل</h1><div class="sub">افهم الطريقة الصحيحة لتستمر</div></div></header>
    <section class="card numbers"><b class="nt">أرقامك الشخصية</b>
      <div class="nums"><div><span>الحرق الأساسي</span><b>${n(t.bmr)}</b></div><div><span>حرقك اليومي</span><b>${n(t.tdee)}</b></div><div><span>هدف السعرات</span><b class="ok">${n(t.kcal)}</b></div><div><span>البروتين</span><b>${n(t.protein)} غ</b></div></div>
      <p class="hint" style="margin:10px 0 0">الحرق اليومي = الحرق الأساسي × مستوى نشاطك. والهدف = الحرق اليومي − عجز يناسب سرعة ${n(r1(t.pace))} كجم أسبوعيًا${t.floored ? `، مع حد أدنى آمن ${n(t.floor)} سعرة` : ''}.</p></section>
    <h2 class="label">طريقة الصحن</h2>
    <div class="card plate"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="var(--soft)"/><circle cx="100" cy="100" r="80" fill="var(--card)"/>
      <path d="M100 100 L100 20 A80 80 0 0 1 100 180Z" fill="#4ADE80"/><path d="M100 100 L100 180 A80 80 0 0 1 20 100Z" fill="#FB923C"/><path d="M100 100 L20 100 A80 80 0 0 1 100 20Z" fill="#F87171"/></svg>
      <div class="pl"><div><i style="background:#4ADE80"></i><b>نصف الصحن</b>خضار وسلطة</div><div><i style="background:#F87171"></i><b>الربع</b>بروتين: دجاج، سمك، لحم، بيض</div><div><i style="background:#FB923C"></i><b>الربع</b>نشويات: أرز، خبز، بطاطس</div></div></div>
    <h2 class="label">دروس قصيرة</h2>
    <div class="lessons">${M.lessons.map((l, i) => `<button class="lesson" data-act="lesson" data-i="${i}"><span class="ln">${n(i + 1)}</span><div class="grow"><b>${l.t}</b><span>${l.h}</span></div><span class="chev">${ic.chev}</span></button>`).join('')}</div>
    <p class="foot">القيم الغذائية في التطبيق تقريبية. هذا التطبيق للتثقيف ولا يغني عن استشارة الطبيب أو أخصائي التغذية.</p>`;
  }

  /* ===================== الإعدادات ===================== */
  function viewSettings() {
    return `<div class="topbar"><button class="backb" data-act="tab" data-tab="today">${ic.back} رجوع</button></div>
    <header class="hd"><div class="grow"><h1>الإعدادات</h1></div></header>
    <div class="card list">
      <div class="li tog" data-act="editProfile"><div class="grow"><b>بياناتي وهدفي</b><span>${P.sex === 'm' ? 'ذكر' : 'أنثى'} · ${n(P.age)} سنة · ${n(P.h)} سم · الهدف ${n(P.goal)} كجم</span></div><span class="chev">${ic.chev}</span></div>
      <div class="li"><div class="grow"><b>المظهر</b></div><select class="sel" data-theme-sel><option value="auto" ${THEME === 'auto' ? 'selected' : ''}>تلقائي</option><option value="light" ${THEME === 'light' ? 'selected' : ''}>فاتح</option><option value="dark" ${THEME === 'dark' ? 'selected' : ''}>داكن</option></select></div>
    </div>
    <div class="card list">
      <div class="li tog" data-act="export"><div class="grow"><b class="tint">تصدير نسخة احتياطية</b></div></div>
      <div class="li tog" data-act="import"><div class="grow"><b class="tint">استيراد نسخة</b></div></div>
      <div class="li tog" data-act="reset"><div class="grow"><b class="red">مسح كل البيانات</b></div></div>
    </div><p class="foot">🔒 بياناتك محفوظة على جوالك فقط.</p>`;
  }

  /* ===================== إضافة الطعام ===================== */
  let FOODM = 'b', FOODCAT = 'الكل';
  function foodSheet() {
    const cats = ['الكل', ...new Set(M.foods.map(f => f[4]))];
    const rec = RECENT.slice(0, 6);
    sheet(`<div class="fs"><h2>أضف إلى ${M.meals.find(m => m.id === FOODM).t}</h2>
      <div class="srch">${ic.search}<input id="fq" type="search" placeholder="ابحث: أرز، دجاج، تمر…" autocomplete="off"></div>
      <div class="cats">${cats.map(c => `<button class="cat ${c === FOODCAT ? 'on' : ''}" data-act="cat" data-c="${c}">${c}</button>`).join('')}</div>
      ${rec.length ? `<div class="lbl2">الأخيرة</div><div class="flist">${rec.map(f => fRow(f)).join('')}</div>` : ''}
      <div class="lbl2">الأطعمة</div><div class="flist" id="flist">${M.foods.filter(f => FOODCAT === 'الكل' || f[4] === FOODCAT).map(f => fRow(f)).join('')}</div>
      <div class="lbl2">طعام غير موجود؟</div>
      <div class="custom"><input class="inp" id="cn" placeholder="اسم الطعام"><div class="row2"><input class="inp" id="ck" type="number" inputmode="numeric" placeholder="السعرات"><input class="inp" id="cp" type="number" inputmode="decimal" placeholder="بروتين (غ)"></div>
      <button class="btn primary block" data-act="addCustom">أضف</button></div></div>`);
    const q = $('#fq'); q.addEventListener('input', () => { const v = q.value.trim(); document.querySelectorAll('#flist .fr').forEach(r => r.style.display = !v || r.dataset.n.includes(v) ? '' : 'none'); });
  }
  const fRow = f => `<button class="fr" data-act="pick" data-n="${esc(f[0])}" data-u="${esc(f[1])}" data-k="${f[2]}" data-p="${f[3]}"><div class="grow"><b>${esc(f[0])}</b><span>${esc(f[1])}${f[3] ? ` · ${n(f[3])}غ بروتين` : ''}</span></div><span class="fk2">${n(f[2])}<small> سعرة</small></span></button>`;
  function qtySheet(f) {
    let q = 1;
    const paint = () => { $('#qv').textContent = n(q); $('#qk').textContent = n(Math.round(f[2] * q)); };
    sheet(`<div class="qs"><h2>${esc(f[0])}</h2><p>${esc(f[1])} · ${n(f[2])} سعرة${f[3] ? ` · ${n(f[3])}غ بروتين` : ''}</p>
      <div class="qty"><button data-q="-0.5">${ic.minus}</button><div><b id="qv">١</b><span>حصة</span></div><button data-q="0.5">${ic.plus}</button></div>
      <div class="qk"><b id="qk">${n(f[2])}</b> سعرة</div>
      <button class="btn primary block" id="qAdd">أضف</button><button class="btn ghost block" data-act="food" data-m="${FOODM}" style="margin-top:8px">رجوع للقائمة</button></div>`);
    document.querySelectorAll('.qty [data-q]').forEach(b => b.addEventListener('click', () => { q = Math.max(0.5, Math.min(10, q + +b.dataset.q)); paint(); haptic(); }));
    $('#qAdd').addEventListener('click', () => addFood(f, q));
  }
  function addFood(f, q) {
    const d = dayLog(viewKey); d.f.push({ m: FOODM, n: f[0], u: f[1], k: +f[2], p: +f[3] || 0, q });
    RECENT = [f, ...RECENT.filter(x => x[0] !== f[0])].slice(0, 12);
    save(); closeSheet(); render(false); toast(`أُضيف: ${f[0]}`); haptic();
  }

  /* ===================== الترحيب ===================== */
  let OB = {};
  function onboard(step) {
    const m = OB;
    if (step === 1) sheetFull(`<div class="ob"><img src="icon-180.png" class="ob-ic" alt=""><h2>أهلًا بك في «ميزان»</h2>
      <p>إنقاص الوزن بالطريقة الصحيحة: سعرات محسوبة لجسمك، بروتين كافٍ، حركة، وتقدّم واضح — بدون حرمان قاسٍ.</p>
      <div class="note">⚕️ إن كان لديك مرض مزمن أو تتناول أدوية، أو كنتِ حاملًا أو مرضعًا، أو عمرك أقل من ١٨ سنة، فاستشر الطبيب قبل البدء.</div>
      <button class="btn primary block" data-act="ob" data-s="2">لنبدأ</button></div>`);
    if (step === 2) sheetFull(`<div class="ob"><div class="obs">١ من ٣</div><h2>عرّفنا بك</h2>
      <div class="seg2"><button class="${m.sex === 'm' ? 'on' : ''}" data-act="obSex" data-v="m">ذكر</button><button class="${m.sex === 'f' ? 'on' : ''}" data-act="obSex" data-v="f">أنثى</button></div>
      <div class="fld"><label>العمر</label><input class="inp" id="oAge" type="number" inputmode="numeric" value="${m.age || ''}" placeholder="سنة"></div>
      <div class="fld"><label>الطول</label><input class="inp" id="oH" type="number" inputmode="numeric" value="${m.h || ''}" placeholder="سم"></div>
      <div class="fld"><label>الوزن الحالي</label><input class="inp" id="oW" type="number" inputmode="decimal" step="0.1" value="${m.w0 || ''}" placeholder="كجم"></div>
      <div class="fld"><label>اسمك (اختياري)</label><input class="inp" id="oName" value="${esc(m.name || '')}"></div>
      <button class="btn primary block" data-act="obS2">التالي</button></div>`);
    if (step === 3) {
      const hm = m.h / 100, minG = Math.ceil(18.5 * hm * hm), sug = Math.max(minG, Math.round(Math.min(m.w0 - 1, 24.9 * hm * hm)));
      sheetFull(`<div class="ob"><div class="obs">٢ من ٣</div><h2>هدفك ونشاطك</h2>
      <div class="fld"><label>الوزن المستهدف</label><input class="inp" id="oG" type="number" inputmode="decimal" step="0.5" value="${m.goal || sug}"><span class="hint">الوزن الصحي لطولك يبدأ من ${n(minG)} إلى ${n(Math.floor(24.9 * hm * hm))} كجم. نصيحة: ابدأ بهدف أول ١٠٪ (${n(Math.round(m.w0 * 0.9))} كجم).</span></div>
      <label class="lbl2">مستوى نشاطك</label>
      ${M.activity.map(a => `<button class="opt ${m.act === a.id ? 'on' : ''}" data-act="obAct" data-v="${a.id}"><b>${a.t}</b><span>${a.h}</span></button>`).join('')}
      <button class="btn primary block" data-act="obS3" style="margin-top:12px">التالي</button></div>`);
    }
    if (step === 4) sheetFull(`<div class="ob"><div class="obs">٣ من ٣</div><h2>سرعة النزول</h2><p>الأبطأ أسهل في الاستمرار. لا نسمح بأكثر من ١٪ من وزنك أسبوعيًا.</p>
      ${M.paces.map(p => { const ok = p.kg <= safePace(1, m.w0); return `<button class="opt ${m.pace === p.kg ? 'on' : ''}" data-act="obPace" data-v="${p.kg}" ${ok ? '' : 'disabled'}><b>${p.t}</b><span>${ok ? p.h : 'غير مناسب لوزنك الحالي'}</span></button>`; }).join('')}
      <button class="btn primary block" data-act="obS4" style="margin-top:12px">احسب خطتي</button></div>`);
    if (step === 5) {
      const t = targets(), pr = projection();
      sheetFull(`<div class="ob"><h2>خطتك جاهزة 🎯</h2>
      <div class="res"><div class="rs big"><span>سعراتك اليومية</span><b>${n(t.kcal)}</b></div>
        <div class="rs"><span>البروتين</span><b>${n(t.protein)} غ</b></div><div class="rs"><span>الماء</span><b>${n(t.water)} أكواب</b></div>
        <div class="rs"><span>الخطوات</span><b>${n('8,000')}</b></div><div class="rs"><span>الوصول المتوقع</span><b>${pr.done ? '—' : shortDate(pr.date)}</b></div></div>
      <p class="hint">${t.floored ? `استخدمنا الحد الأدنى الآمن (${n(t.floor)} سعرة)، فسيكون النزول نحو ${n(r1(t.pace))} كجم أسبوعيًا. زيادة المشي تسرّعه بأمان.` : `بهذا يكون النزول نحو ${n(r1(t.pace))} كجم أسبوعيًا.`}</p>
      <button class="btn primary block" data-act="obDone">ابدأ</button></div>`);
    }
  }

  /* ===================== الرسم والأحداث ===================== */
  let tab = 'today';
  function render(anim) {
    if (anim === undefined) anim = true;
    const v = $('#view'), y = scrollY;
    v.innerHTML = tab === 'today' ? viewToday() : tab === 'progress' ? viewProgress() : tab === 'workout' ? viewWorkout() : tab === 'guide' ? viewGuide() : viewSettings();
    if (anim) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10))); scrollTo(0, 0); }
    else { v.classList.remove('enter'); scrollTo(0, y); }
    document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const ts = document.querySelector('[data-theme-sel]'); if (ts) ts.addEventListener('change', () => { THEME = ts.value; Store.set('theme', THEME); applyTheme(); });
    $('#fab').hidden = tab !== 'today';
  }
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }
  function sheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').classList.remove('full'); $('#sheet').hidden = false; }
  function sheetFull(html) { $('#sheetBody').innerHTML = html; $('#sheet').classList.add('full'); $('#sheet').hidden = false; }
  function closeSheet() { if (!P) return; $('#sheet').hidden = true; }
  function applyTheme() { const dark = THEME === 'dark' || (THEME === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }
  function confetti(k) { const box = document.createElement('div'); box.className = 'confetti'; const cols = ['#22C55E', '#F97316', '#3B82F6', '#A855F7', '#FACC15'];
    for (let i = 0; i < k; i++) { const s = document.createElement('i'); s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 5]};animation-delay:${Math.random() * .5}s;animation-duration:${1.8 + Math.random() * 1.4}s`; box.appendChild(s); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4000); }
  const num = id => parseFloat(($(id) || {}).value);

  const A = {
    tab: el => { tab = el.dataset.tab; render(); },
    settings: () => { tab = 'settings'; render(); },
    prevDay: () => { viewKey = keyOf(new Date(fromKey(viewKey).getTime() - DAY)); render(); },
    nextDay: () => { if (viewKey < today()) { viewKey = keyOf(new Date(fromKey(viewKey).getTime() + DAY)); render(); } },
    food: el => { FOODM = el.dataset.m || FOODM; foodSheet(); },
    fab: () => { const h = new Date().getHours(); FOODM = h < 11 ? 'b' : h < 16 ? 'l' : h < 21 ? 'd' : 's'; foodSheet(); },
    cat: el => { FOODCAT = el.dataset.c; foodSheet(); },
    pick: el => qtySheet([el.dataset.n, el.dataset.u, +el.dataset.k, +el.dataset.p]),
    addCustom: () => { const nm = ($('#cn').value || '').trim(), k = num('#ck'), p = num('#cp') || 0; if (!nm || !(k >= 0)) return toast('اكتب الاسم والسعرات'); addFood([nm, 'حصة', k, p], 1); },
    delFood: el => { dayLog(viewKey).f.splice(+el.dataset.i, 1); save(); render(false); },
    water: el => { const d = dayLog(viewKey), v = +el.dataset.v; d.water = d.water === v ? v - 1 : v; save(); render(false); haptic(); if (d.water === targets().water) { confetti(40); toast('أكملت هدف الماء 💧'); } },
    steps: el => { const d = dayLog(viewKey); d.steps = Math.max(0, d.steps + +el.dataset.v); save(); render(false); },
    stepsSet: () => { sheet(`<h2>عدد خطوات اليوم</h2><p>انسخه من تطبيق الصحة في جوالك.</p><input class="inp" id="stIn" type="number" inputmode="numeric" value="${dayLog(viewKey).steps || ''}" style="font-size:24px;text-align:center"><button class="btn primary block" data-act="stepsSave" style="margin-top:10px">حفظ</button>`); },
    stepsSave: () => { const v = Math.round(num('#stIn')); if (v >= 0) { dayLog(viewKey).steps = v; save(); } closeSheet(); render(false); },
    saveW: () => {
      const v = num('#wIn'); if (!(v > 25 && v < 350)) return toast('اكتب وزنًا صحيحًا');
      const before = curWeight(); W[viewKey] = r1(v); save(); render(false); toast('حُفظ الوزن');
      const lost = P.w0 - curWeight(), lostB = P.w0 - before;
      if (Math.floor(lost) > Math.floor(lostB) && Math.floor(lost) >= 1) { confetti(70); toast(`🎉 نزلت ${n(Math.floor(lost))} كجم حتى الآن!`); }
    },
    woDone: el => { const d = dayLog(today()); d.wo = d.wo || []; d.wo.push(el.dataset.id); save(); confetti(50); toast('أحسنت! تمرين مكتمل 💪'); render(false); },
    lesson: el => { const l = M.lessons[+el.dataset.i]; sheet(`<article class="les"><span class="lbl2">درس ${n(+el.dataset.i + 1)}</span><h2>${l.t}</h2>${l.body.map(p => `<p>${p}</p>`).join('')}<button class="btn primary block" data-act="closeSheet">فهمت</button></article>`); },
    closeSheet,
    editProfile: () => { OB = Object.assign({}, P); onboard(2); },
    export: () => { const d = JSON.stringify({ p: P, log: L, w: W }); if (navigator.share) navigator.share({ text: d }).catch(() => {}); else { navigator.clipboard && navigator.clipboard.writeText(d); toast('نُسخت'); } },
    import: () => sheet(`<h2>استيراد</h2><textarea class="inp" id="impIn" style="min-height:140px;direction:ltr"></textarea><button class="btn primary block" data-act="doImport" style="margin-top:10px">استيراد</button>`),
    doImport: () => { try { const o = JSON.parse($('#impIn').value); P = o.p; L = o.log || {}; W = o.w || {}; save(); closeSheet(); render(); } catch (e) { toast('النص غير صالح'); } },
    reset: () => sheet(`<h2>مسح كل البيانات؟</h2><p>لا يمكن التراجع.</p><button class="btn danger block" data-act="doReset">نعم، امسح</button>`),
    doReset: () => { Object.keys(localStorage).filter(k => k.startsWith(K)).forEach(k => localStorage.removeItem(k)); location.reload(); },
    ob: el => onboard(+el.dataset.s),
    obSex: el => { OB.sex = el.dataset.v; document.querySelectorAll('.seg2 button').forEach(b => b.classList.toggle('on', b === el)); },
    obS2: () => {
      const age = Math.round(num('#oAge')), h = num('#oH'), w = num('#oW');
      if (!OB.sex) return toast('اختر ذكر أو أنثى');
      if (!(age >= 13 && age <= 90) || !(h >= 120 && h <= 230) || !(w >= 35 && w <= 300)) return toast('تأكد من العمر والطول والوزن');
      Object.assign(OB, { age, h, w0: r1(w), name: ($('#oName').value || '').trim() }); onboard(3);
      if (age < 18) toast('عمرك أقل من ١٨: استشر الطبيب قبل أي رجيم');
    },
    obAct: el => { OB.act = +el.dataset.v; document.querySelectorAll('.opt').forEach(b => b.classList.toggle('on', b === el)); },
    obS3: () => {
      const g = num('#oG'), hm = OB.h / 100, minG = 18.5 * hm * hm;
      if (!(g > 0)) return toast('اكتب الوزن المستهدف');
      if (g < minG) return toast(`الهدف أقل من الوزن الصحي لطولك (${n(Math.ceil(minG))} كجم)`);
      if (g >= OB.w0) return toast('الهدف يجب أن يكون أقل من وزنك الحالي');
      if (!OB.act) return toast('اختر مستوى نشاطك');
      OB.goal = r1(g); onboard(4);
    },
    obPace: el => { if (el.disabled) return; OB.pace = +el.dataset.v; document.querySelectorAll('.opt').forEach(b => b.classList.toggle('on', b === el)); },
    obS4: () => { if (!OB.pace) return toast('اختر السرعة'); const old = P; P = Object.assign({ start: today() }, OB); if (!old && !W[today()]) W[today()] = P.w0; save(); onboard(5); },
    obDone: () => { $('#sheet').hidden = true; tab = 'today'; render(); }
  };
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || el.disabled) return; const f = A[el.dataset.act]; if (f) f(el); });
  document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.addEventListener('click', () => A.tab(b)));

  /* البدء */
  applyTheme();
  if (P) render(); else { $('#view').innerHTML = ''; setTimeout(() => onboard(1), 600); }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  setInterval(() => { if (tab === 'today' && viewKey !== today() && !document.hidden && $('#sheet').hidden) { /* يبقى على اليوم المختار */ } }, 60000);
})();
