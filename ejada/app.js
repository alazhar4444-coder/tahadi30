/* أهدافي — متابعة أهداف إجادة */
(() => {
  const { CAT, GOALS, RESULTS, ICONS } = window.EJ;
  const $ = s => document.querySelector(s);
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]).replace('.', '٫');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const K = 'ejada:s';
  const load = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
  let S = Object.assign({ name: '', school: 'مدرسة معاذ بن جبل', year: '٢٠٢٦', theme: 'auto', v: {}, ev: [], note: {} }, load());
  const save = () => { try { localStorage.setItem(K, JSON.stringify(S)); } catch (e) {} };
  const ui = { tab: 'home', goal: null, page: null, filter: 'all' };

  const G = id => GOALS.find(g => g.id === id), R = id => RESULTS.find(r => r.id === id);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const pdate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const fdate = k => pdate(k).toLocaleDateString('ar', { day: 'numeric', month: 'long' }).replace(/\d/g, x => AR[x]);
  const month = k => pdate(k).toLocaleDateString('ar', { month: 'long', year: 'numeric' }).replace(/\d/g, x => AR[x]);
  const ic = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24">${ICONS[name]}</svg>`;
  const tile = (g, size = '') => `<span class="tile ${size}" style="--c:${g.c};--c2:${g.c2}">${ic(g.ic)}</span>`;

  /* ——— الحسابات ——— */
  const val = r => S.v[r.id] || 0;
  const LV = [
    { t: 'قيد العمل', s: 'قيد العمل', k: 'l0' }, { t: 'الحد الأدنى', s: 'الحد الأدنى', k: 'l1' }, { t: 'يحقق المستهدف', s: 'يحقق', k: 'l2' }, { t: 'يفوق المستهدف', s: 'يفوق', k: 'l3' },
  ];
  const level = r => { const v = val(r), L = r.L; return v >= L[2] ? 3 : v >= L[1] ? 2 : v >= L[0] && v > 0 ? 1 : 0; };
  const prog = r => Math.min(val(r) / r.L[1], 1);
  const gProg = g => g.rs.reduce((a, r) => a + r.w * prog(r), 0) / g.w;
  const total = () => RESULTS.reduce((a, r) => a + r.w * prog(r), 0);
  const evOf = rid => S.ev.filter(e => e.r === rid);
  const unit = r => r.type === 'نسبة' ? '٪' : '';

  /* ——— رسومات ——— */
  function ring(p, size, sw, grad, inner = '') {
    const r = (size - sw) / 2, C = 2 * Math.PI * r, L = Math.max(0.001, C * p);
    return `<svg class="ring art" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${sw}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke="${grad}" stroke-width="${sw}" stroke-linecap="round"
        style="stroke-dasharray:${L} ${C};--C:${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/>${inner}</svg>`;
  }
  function donut() {
    const size = 200, sw = 26, r = (size - sw) / 2, C = 2 * Math.PI * r, gap = 3;
    let off = 0, segs = '';
    GOALS.forEach((g, i) => {
      const L = C * g.w / 100 - gap;
      segs += `<circle cx="100" cy="100" r="${r}" stroke="${g.c}" stroke-width="${sw}" class="seg" data-act="goal" data-id="${g.id}"
        style="stroke-dasharray:${L} ${C};stroke-dashoffset:${-off};--C:${C};animation-delay:${i * 90}ms" transform="rotate(-90 100 100)"/>`;
      off += C * g.w / 100;
    });
    return `<svg class="donut art" viewBox="0 0 200 200"><circle cx="100" cy="100" r="${r}" class="ring-bg" stroke-width="${sw}"/>${segs}</svg>`;
  }
  function track(r, big) {
    const L = r.L, max = r.type === 'نسبة' ? 100 : L[2] + 1, v = val(r), pos = x => Math.min(x / max, 1) * 100;
    const lab = ['أدنى', 'مستهدف', 'يفوق'];
    return `<div class="track ${big ? 'big' : ''}" style="--c:${G(r.g).c}">
      <div class="tr-bar"><i class="tr-fill" style="width:${pos(v)}%"></i>
        ${L.map((x, i) => `<b class="tick t${i} ${v >= x && v > 0 ? 'on' : ''}" style="inset-inline-start:${pos(x)}%"></b>`).join('')}</div>
      ${big ? `<div class="tr-lab">${L.map((x, i) => `<span style="inset-inline-start:${pos(x)}%">${lab[i]}<em>${n(x)}${unit(r)}</em></span>`).join('')}</div>` : ''}
    </div>`;
  }
  const lvChip = r => { const l = level(r); return `<span class="lv ${LV[l].k}">${l === 3 ? '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>' : ''}${LV[l].t}</span>`; };

  /* ——— الشاشات ——— */
  function viewHome() {
    const t = total(), cnt = [0, 0, 0, 0];
    RESULTS.forEach(r => cnt[level(r)]++);
    const hi = new Date().getHours(), greet = hi < 12 ? 'صباح الخير' : 'مساء الخير';
    const focus = RESULTS.filter(r => level(r) < 2).sort((a, b) => b.w - a.w || prog(a) - prog(b)).slice(0, 3);
    const cats = Object.keys(CAT).map(k => {
      const rs = RESULTS.filter(r => G(r.g).cat === k), w = rs.reduce((a, r) => a + r.w, 0), p = rs.reduce((a, r) => a + r.w * prog(r), 0) / w;
      return { k, w, p };
    });
    return `
    <header class="hd">
      <div class="grow"><div class="eyebrow">إجادة · ${esc(S.year)}</div><h1>${S.name ? `${greet}، ${esc(S.name.split(' ')[0])}` : 'أهدافي'}</h1></div>
      <button class="icon-b" data-act="settings" aria-label="الإعدادات"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>
    </header>

    <section class="hero">
      <i class="aur a1"></i><i class="aur a2"></i><i class="aur a3"></i>
      <div class="hero-top">
        <div class="hero-ring">${ring(t / 100, 156, 14, 'url(#gold)', '<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs>')}
          <div class="ring-in"><b class="big" data-count="${Math.round(t)}">${n(Math.round(t))}</b><span>٪ إنجاز</span></div></div>
        <div class="hero-st">
          ${[3, 2, 1, 0].map(l => `<div class="st ${LV[l].k}"><i></i><span class="grow">${LV[l].s}</span><b>${n(cnt[l])}</b></div>`).join('')}
        </div>
      </div>
      <div class="hero-ft">
        <div><b>${n(GOALS.length)}</b><span>أهداف</span></div>
        <div><b>${n(RESULTS.length)}</b><span>نتيجة</span></div>
        <div><b>${n(S.ev.length)}</b><span>شاهد</span></div>
        <div><b>١٠٠٪</b><span>الوزن</span></div>
      </div>
    </section>

    <section class="card">
      <div class="sec-h"><h2>توزيع الأوزان</h2><span class="sub">اضغط على الهدف</span></div>
      <div class="wd">
        <div class="donut-w">${donut()}<div class="donut-in"><b>١٠٠</b><span>٪ الوزن</span></div></div>
        <div class="legend">${GOALS.map(g => `<button class="lg" data-act="goal" data-id="${g.id}"><i style="background:${g.c}"></i><span class="grow">${g.s}</span><b>${n(g.w)}٪</b></button>`).join('')}</div>
      </div>
    </section>

    <section class="card">
      <div class="sec-h"><h2>فئات الأهداف</h2></div>
      ${cats.map(c => `<div class="cat"><div class="cat-h"><span class="grow">${CAT[c.k].t}</span><span class="sub">وزن ${n(c.w)}٪</span><b>${n(Math.round(c.p * 100))}٪</b></div>
        <div class="bar"><i class="${c.k}" style="width:${c.p * 100}%"></i></div></div>`).join('')}
    </section>

    ${focus.length ? `<section>
      <div class="sec-h out"><h2>ركّز هنا</h2><span class="sub">الأعلى وزناً ولم تبلغ المستهدف</span></div>
      ${focus.map(r => { const g = G(r.g); return `<button class="fc card" data-act="res" data-id="${r.id}">
        ${tile(g, 'sm')}<div class="grow"><b>${r.s}</b><div class="sub">${g.s} · المستهدف ${n(r.L[1])}${unit(r)}</div>${track(r)}</div>
        <span class="wbadge">${n(r.w)}٪</span></button>`; }).join('')}
    </section>` : `<section class="card done-c"><div class="trophy">🏆</div><b>كل النتائج حققت المستهدف</b><span class="sub">أداء متميز — استمر في توثيق الشواهد</span></section>`}`;
  }

  function goalCard(g, i) {
    const p = gProg(g);
    return `<button class="gc card" data-act="goal" data-id="${g.id}" style="--c:${g.c};--c2:${g.c2};--i:${i}">
      <div class="gc-top">${tile(g)}<div class="grow"><div class="gc-cat">${CAT[g.cat].t}</div><h3>${g.s}</h3></div>
        <div class="gc-w"><b>${n(g.w)}</b><span>٪</span></div></div>
      <p class="gc-t">${g.t}</p>
      <div class="gc-segs">${g.rs.map(r => `<i class="${LV[level(r)].k}" style="flex:${r.w}"></i>`).join('')}</div>
      <div class="gc-ft"><span>${n(g.rs.length)} ${g.rs.length > 2 ? 'نتائج' : g.rs.length === 2 ? 'نتيجتان' : 'نتيجة'}</span><span>${n(g.rs.reduce((a, r) => a + evOf(r.id).length, 0))} شاهد</span><b>${n(Math.round(p * 100))}٪</b></div>
    </button>`;
  }
  function viewGoals() {
    return `<header class="hd"><div class="grow"><div class="eyebrow">${n(GOALS.length)} أهداف · ${n(RESULTS.length)} نتيجة</div><h1>الأهداف</h1></div></header>
      ${GOALS.map(goalCard).join('')}`;
  }

  function resCard(r, i) {
    const g = G(r.g), v = val(r), ec = evOf(r.id).length;
    return `<div class="rc card" data-act="res" data-id="${r.id}" style="--i:${i}">
      <div class="rc-top"><span class="num">${n(i + 1)}</span>${lvChip(r)}<span class="grow"></span><span class="wbadge">الوزن ${n(r.w)}٪</span></div>
      <p class="rc-t">${r.t}</p>
      ${track(r, true)}
      <div class="rc-bot">
        <div class="stp"><button data-act="dec" data-id="${r.id}" aria-label="إنقاص">−</button><b>${n(v)}${unit(r)}</b><button data-act="inc" data-id="${r.id}" aria-label="زيادة">+</button></div>
        <span class="grow"></span>
        <span class="evc"><svg viewBox="0 0 24 24"><path d="m21 11.5-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>${n(ec)} شاهد</span>
      </div>
    </div>`;
  }
  function viewGoal() {
    const g = G(ui.goal), p = gProg(g), i = GOALS.indexOf(g);
    return `<div class="topbar"><button class="backb" data-act="back"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>الأهداف</button></div>
      <section class="gh" style="--c:${g.c};--c2:${g.c2}">
        <span class="gh-wm">${ic(g.ic)}</span>
        <div class="gh-top">${tile(g, 'lg')}<div class="grow"><div class="gh-n">الهدف ${n(i + 1)} من ${n(GOALS.length)}</div><h1>${g.s}</h1></div>
          <div class="gh-ring">${ring(p, 64, 7, '#fff')}<b>${n(Math.round(p * 100))}٪</b></div></div>
        <p>${g.t}</p>
        <div class="chips"><span>${CAT[g.cat].t}</span><span>الوزن ${n(g.w)}٪</span><span>${n(g.rs.length)} ${g.rs.length > 2 ? 'نتائج' : g.rs.length === 2 ? 'نتيجتان' : 'نتيجة'}</span></div>
      </section>
      <div class="sec-h out"><h2>النتائج المتوقعة</h2><span class="sub">نوع المؤشر: ${g.rs[0].type}</span></div>
      ${g.rs.map(resCard).join('')}`;
  }

  function viewEvidence() {
    const list = S.ev.filter(e => ui.filter === 'all' || R(e.r).g === ui.filter).sort((a, b) => b.d.localeCompare(a.d) || b.id - a.id);
    let lastM = '', body = '';
    list.forEach(e => {
      const r = R(e.r), g = G(r.g), m = month(e.d);
      if (m !== lastM) { body += `<div class="mh">${m}</div>`; lastM = m; }
      const d = pdate(e.d);
      body += `<button class="evi card" data-act="res" data-id="${r.id}" style="--c:${g.c}">
        <div class="evd"><b>${n(d.getDate())}</b><span>${d.toLocaleDateString('ar', { weekday: 'short' })}</span></div>
        <div class="grow"><div class="evr">${g.s} · ${r.s}</div><div class="evt">${esc(e.t)}</div></div></button>`;
    });
    return `<header class="hd"><div class="grow"><div class="eyebrow">ملف الإنجاز</div><h1>الشواهد</h1></div><span class="cnt">${n(S.ev.length)}</span></header>
      <div class="fchips"><button class="${ui.filter === 'all' ? 'on' : ''}" data-act="filter" data-id="all">الكل</button>
        ${GOALS.map(g => `<button class="${ui.filter === g.id ? 'on' : ''}" data-act="filter" data-id="${g.id}" style="--c:${g.c}"><i></i>${g.s}</button>`).join('')}</div>
      ${body || `<div class="empty"><div class="empty-art">${ic('board')}</div><b>لا توجد شواهد بعد</b><span class="sub">وثّق كل ما تنجزه: خطة درس، ورشة، صورة نشاط… ستجدها هنا مرتبة حسب التاريخ.</span>
        <button class="btn" data-act="fab">أضف أول شاهد</button></div>`}`;
  }

  function viewSettings() {
    return `<div class="topbar"><button class="backb" data-act="back"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>رجوع</button></div>
      <header class="hd"><div class="grow"><h1>الإعدادات</h1></div></header>
      <section class="card form">
        <label>الاسم<input id="sName" value="${esc(S.name)}" placeholder="اسمك"></label>
        <label>المدرسة<input id="sSchool" value="${esc(S.school)}"></label>
        <label>سنة التقييم<input id="sYear" value="${esc(S.year)}"></label>
      </section>
      <section class="card">
        <div class="sec-h"><h2>المظهر</h2></div>
        <div class="seg">${[['auto', 'تلقائي'], ['light', 'فاتح'], ['dark', 'داكن']].map(([k, t]) => `<button class="${S.theme === k ? 'on' : ''}" data-act="theme" data-id="${k}">${t}</button>`).join('')}</div>
      </section>
      <section class="card list">
        <button data-act="share"><span class="li-ic" style="--c:#0D9488">${ic('board')}</span><span class="grow">مشاركة ملخص الإنجاز<small>نص جاهز بكل نتيجة وشواهدها</small></span></button>
        <button data-act="export"><span class="li-ic" style="--c:#4F46E5"><svg viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/></svg></span><span class="grow">حفظ نسخة احتياطية<small>ملف يمكنك استرجاعه لاحقاً</small></span></button>
        <button data-act="import"><span class="li-ic" style="--c:#D97706"><svg viewBox="0 0 24 24"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14"/></svg></span><span class="grow">استرجاع نسخة<small>من ملف احتياطي سابق</small></span></button>
        <button data-act="reset" class="danger"><span class="li-ic" style="--c:#E11D48"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></span><span class="grow" id="resetT">مسح كل البيانات</span></button>
      </section>
      <p class="about">الأهداف والأوزان والمستويات مأخوذة من ملف إجادة الخاص بك. معظم النتائج مسجّلة في الملف بمستويات معكوسة (٤ ثم ٣ ثم ٢)، فرتّبها التطبيق تصاعدياً: الحد الأدنى ثم المستهدف ثم يفوق. نسبة الإنجاز مؤشر شخصي للمتابعة وليست التقييم الرسمي. بياناتك محفوظة على جهازك فقط.</p>
      <input type="file" id="impF" accept="application/json,.json" hidden>`;
  }

  /* ——— النافذة السفلية ——— */
  function openSheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; requestAnimationFrame(() => $('#sheet').classList.add('on')); }
  function closeSheet() { const s = $('#sheet'); s.classList.remove('on'); setTimeout(() => { s.hidden = true; }, 280); render(true); }

  function resSheet(rid, focus) {
    const r = R(rid), g = G(r.g), evs = evOf(rid).sort((a, b) => b.d.localeCompare(a.d));
    openSheet(`<div class="grab"></div>
      <div class="sh-h">${tile(g, 'sm')}<div class="grow"><div class="sub">${g.s} · الوزن ${n(r.w)}٪</div><b>${r.s}</b></div><button class="x" data-act="closeSheet">✕</button></div>
      <p class="sh-t">${r.t}</p>
      <div class="lvls">${r.L.map((x, i) => `<div class="lvb k${i + 1} ${level(r) >= i + 1 ? 'on' : ''}"><span>${['الحد الأدنى', 'المستهدف', 'يفوق'][i]}</span><b>${n(x)}${unit(r)}</b></div>`).join('')}</div>
      <div class="sh-stp"><span class="sub">المتحقق حتى الآن</span>
        <div class="stp big"><button data-act="dec" data-id="${r.id}">−</button><b id="shV">${n(val(r))}${unit(r)}</b><button data-act="inc" data-id="${r.id}">+</button></div>
        <div id="shLv">${lvChip(r)}</div></div>
      <div class="sh-sec"><h3>إضافة شاهد</h3>
        <textarea id="evT" rows="2" placeholder="مثال: نفّذت درساً بالشاشة الذكية لصف ١١/٢"></textarea>
        <div class="ideas">${r.ideas.map(x => `<button data-act="idea">${x}</button>`).join('')}</div>
        <div class="ev-row"><input type="date" id="evD" value="${today()}">
          ${r.type === 'عدد' ? `<label class="chk"><input type="checkbox" id="evInc" checked><span>زيادة العدد +١</span></label>` : ''}
          <button class="btn sm" data-act="addEv" data-id="${r.id}">إضافة</button></div>
      </div>
      <div class="sh-sec"><h3>الشواهد <span class="sub">${n(evs.length)}</span></h3>
        ${evs.length ? evs.map(e => `<div class="evl"><i style="background:${g.c}"></i><div class="grow"><div>${esc(e.t)}</div><span class="sub">${fdate(e.d)}</span></div><button class="x sm" data-act="delEv" data-id="${e.id}" data-r="${r.id}" aria-label="حذف">✕</button></div>`).join('') : '<p class="sub">لم تضف شواهد لهذه النتيجة بعد.</p>'}
      </div>
      <div class="sh-sec"><h3>ملاحظات</h3><textarea id="noteT" rows="3" data-id="${r.id}" placeholder="خطوتك القادمة، تواريخ، أسماء صفوف…">${esc(S.note[r.id] || '')}</textarea></div>`);
    if (focus) setTimeout(() => $('#evT') && $('#evT').focus(), 320);
  }
  function pickSheet() {
    openSheet(`<div class="grab"></div><div class="sh-h"><div class="grow"><b class="h">إضافة شاهد</b><div class="sub">اختر النتيجة التي يخدمها هذا الشاهد</div></div><button class="x" data-act="closeSheet">✕</button></div>
      ${GOALS.map(g => `<div class="pk-g"><div class="pk-h">${tile(g, 'xs')}<b>${g.s}</b></div>
        ${g.rs.map(r => `<button class="pk" data-act="pick" data-id="${r.id}"><span class="grow">${r.s}</span>${lvChip(r)}</button>`).join('')}</div>`).join('')}`);
  }

  /* ——— التحديث ——— */
  function setVal(rid, d) {
    const r = R(rid), step = r.type === 'نسبة' ? 5 : 1, max = r.type === 'نسبة' ? 100 : 99, before = level(r);
    S.v[rid] = Math.max(0, Math.min(max, val(r) + d * step)); save();
    const after = level(r);
    if (after > before && after >= 2) celebrate(after === 3 ? 'يفوق المستهدف!' : 'حققت المستهدف');
    if (!$('#sheet').hidden) { $('#shV').textContent = n(val(r)) + unit(r); $('#shLv').innerHTML = lvChip(r);
      document.querySelectorAll('.lvb').forEach((b, i) => b.classList.toggle('on', level(r) >= i + 1)); }
    else render(true);
    if (navigator.vibrate) navigator.vibrate(8);
  }
  function celebrate(t) {
    const c = document.createElement('div'); c.className = 'cele';
    c.innerHTML = Array.from({ length: 26 }, (_, i) => `<i style="--x:${Math.cos(i / 26 * 6.283) * (90 + (i % 3) * 40)}px;--y:${Math.sin(i / 26 * 6.283) * (90 + (i % 3) * 40)}px;--h:${(i * 47) % 360};--d:${(i % 5) * 30}ms"></i>`).join('') + `<b>${t}</b>`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 1700);
  }
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2000); }

  function summary() {
    let s = `ملخص إنجاز أهدافي — إجادة ${S.year}\n${S.name ? S.name + ' — ' : ''}${S.school}\nنسبة الإنجاز الموزونة: ${n(Math.round(total()))}٪\n`;
    GOALS.forEach((g, i) => {
      s += `\n${n(i + 1)}) ${g.t} (الوزن ${n(g.w)}٪)\n`;
      g.rs.forEach(r => {
        s += `• ${r.t}\n   المتحقق: ${n(val(r))}${unit(r)} — ${LV[level(r)].t} (المستهدف ${n(r.L[1])}${unit(r)})\n`;
        evOf(r.id).sort((a, b) => a.d.localeCompare(b.d)).forEach(e => { s += `   - ${e.t} (${fdate(e.d)})\n`; });
      });
    });
    return s;
  }

  const act = {
    tab(el) { ui.tab = el.dataset.tab; ui.goal = null; ui.page = null; render(); scrollTo(0, 0); },
    goal(el) { ui.goal = el.dataset.id; ui.tab = 'goals'; ui.page = null; render(); scrollTo(0, 0); },
    back() { if (ui.page) ui.page = null; else ui.goal = null; render(); scrollTo(0, 0); },
    settings() { ui.page = 'settings'; render(); scrollTo(0, 0); },
    res(el) { resSheet(el.dataset.id); },
    pick(el) { resSheet(el.dataset.id, true); },
    fab() { pickSheet(); },
    inc(el) { setVal(el.dataset.id, 1); },
    dec(el) { setVal(el.dataset.id, -1); },
    closeSheet,
    idea(el) { const t = $('#evT'); t.value = el.textContent; t.focus(); },
    addEv(el) {
      const t = $('#evT').value.trim(); if (!t) { $('#evT').focus(); $('#evT').classList.add('shake'); setTimeout(() => $('#evT').classList.remove('shake'), 400); return; }
      const rid = el.dataset.id; S.ev.push({ id: Date.now(), r: rid, t, d: $('#evD').value || today() });
      const inc = $('#evInc') && $('#evInc').checked; save();
      if (inc) setVal(rid, 1);
      toast('أُضيف الشاهد'); resSheet(rid);
    },
    delEv(el) { S.ev = S.ev.filter(e => String(e.id) !== el.dataset.id); save(); resSheet(el.dataset.r); },
    filter(el) { ui.filter = el.dataset.id; render(); },
    theme(el) { S.theme = el.dataset.id; save(); applyTheme(); render(); },
    async share() {
      const t = summary();
      try { if (navigator.share) { await navigator.share({ title: 'ملخص إنجاز أهدافي', text: t }); return; } } catch (e) { if (e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(t); toast('نُسخ الملخص'); } catch (e) { toast('تعذّر النسخ'); }
    },
    export() {
      const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = `ahdafi-${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('تم حفظ النسخة');
    },
    import() { $('#impF').click(); },
    reset() {
      if (!act.reset.armed) { act.reset.armed = true; $('#resetT').textContent = 'اضغط مرة أخرى للتأكيد'; setTimeout(() => { act.reset.armed = false; const t = $('#resetT'); if (t) t.textContent = 'مسح كل البيانات'; }, 3000); return; }
      act.reset.armed = false; S.v = {}; S.ev = []; S.note = {}; save(); toast('تم المسح'); render();
    },
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el || !act[el.dataset.act]) return;
    if (el.dataset.act === 'closeSheet' && e.target !== el && !el.classList.contains('x')) return;
    act[el.dataset.act](el);
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'noteT') { S.note[t.dataset.id] = t.value; save(); }
    if (t.id === 'sName') { S.name = t.value; save(); }
    if (t.id === 'sSchool') { S.school = t.value; save(); }
    if (t.id === 'sYear') { S.year = t.value; save(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'impF' || !e.target.files[0]) return;
    const fr = new FileReader();
    fr.onload = () => { try { const d = JSON.parse(fr.result); if (!d || typeof d.v !== 'object') throw 0; S = Object.assign(S, d); save(); applyTheme(); toast('تم الاسترجاع'); render(); } catch (x) { toast('الملف غير صالح'); } };
    fr.readAsText(e.target.files[0]);
  });
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => act.tab(b)));

  function applyTheme() {
    const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  function countUp() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.count, t0 = performance.now();
      const step = t => { const k = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = n(Math.round(to * e)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  function render(quiet) {
    const v = $('#view');
    v.innerHTML = ui.page === 'settings' ? viewSettings() : ui.tab === 'home' ? viewHome() : ui.tab === 'goals' ? (ui.goal ? viewGoal() : viewGoals()) : viewEvidence();
    [...v.children].forEach((c, i) => c.style.setProperty('--i', i));
    v.classList.toggle('enter', !quiet); v.classList.toggle('quiet', !!quiet);
    if (!quiet) { void v.offsetWidth; countUp(); }
    else v.querySelectorAll('[data-count]').forEach(el => { el.textContent = n(el.dataset.count); });
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
    $('#fab').hidden = ui.page === 'settings' || (ui.tab === 'goals' && !ui.goal);
  }

  applyTheme(); render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
