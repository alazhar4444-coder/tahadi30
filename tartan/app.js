/* كمّل — ابحث عن مباراة ناقصة وكمّل العدد */
(() => {
  const { GOV, FEAT, LEVELS, POS } = window.KM;
  const $ = s => document.querySelector(s);
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dk = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (k, i) => { const [y, m, d] = k.split('-').map(Number); return dk(new Date(y, m - 1, d + i)); };
  const pd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => dk(new Date());
  const nowH = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
  const dayName = k => { const t = today(); return k === t ? 'اليوم' : k === addDays(t, 1) ? 'غداً' : pd(k).toLocaleDateString('ar', { weekday: 'long' }); };
  const dayShort = k => { const t = today(); return k === t ? 'اليوم' : k === addDays(t, 1) ? 'غداً' : pd(k).toLocaleDateString('ar', { weekday: 'short' }); };
  const hm = h => { const H = Math.floor(h) % 24, h12 = ((H + 11) % 12) + 1; return { t: n(h12), ap: H < 12 ? 'ص' : 'م' }; };
  const tLabel = h => { const x = hm(h); return `${x.t} ${x.ap}`; };
  const omr = x => n(Math.round(x * 10) / 10) + ' ر.ع';
  const HOURS = [16, 17, 18, 19, 20, 21, 22, 23];

  /* ——— البيانات ——— */
  const ui = { tab: 'home', day: 'all', gov: 'all', q: '', pitch: null, pday: today(), sheet: null, deep: new URLSearchParams(location.search).get('m') };
  let ST, S, errShown;
  const uid = () => S.uid;
  const me = () => S.me || { n: '', ph: '', pos: 'أي مركز' };
  const P = id => S.pitches.find(p => p.id === id), M = id => S.matches.find(m => m.id === id);
  const plist = m => Object.entries(m.pl || {}).map(([u, x]) => ({ u, ...x })).sort((a, b) => a.t - b.t);
  const spots = m => plist(m).flatMap(x => [{ n: x.n, u: x.u }].concat(Array.from({ length: x.k - 1 }, () => ({ n: 'ضيف ' + x.n.split(' ')[0], u: x.u, g: 1 }))));
  const total = m => m.fmt * 2, have = m => plist(m).reduce((a, x) => a + x.k, 0), need = m => Math.max(0, total(m) - have(m));
  const share = m => m.price * m.dur / total(m);
  const iJoined = m => !!(m.pl && m.pl[uid()]);
  const isOrg = m => m.org === uid();
  const upcoming = m => m.d > today() || (m.d === today() && m.h > nowH());
  const taken = (pid, k, h) => S.matches.find(x => x.p === pid && x.d === k && h >= x.h && h < x.h + x.dur) || S.books.find(x => x.p === pid && x.d === k && h >= x.h && h < x.h + x.dur);
  const ini = s => (s || '؟').trim().charAt(0);
  const pmeta = p => ({ pn: p.n, gov: p.gov, w: p.w, price: p.price, hue: p.hue });

  /* ——— أيقونات ——— */
  const I = {
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7.5 3.6 2.6-1.4 4.3H9.8l-1.4-4.3z"/><path d="M12 3v4.5M15.6 10.1l4.6-1.4M14.2 14.4l2.8 3.9M9.8 14.4 7 18.3M8.4 10.1 3.8 8.7"/>',
    field: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.6"/><path d="M3 9.5h2.5v5H3M21 9.5h-2.5v5H21"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    wa: '<path d="M4 20l1.2-3.8A8 8 0 1 1 8 19z"/><path d="M9 8.5c0 3.5 2.6 6.5 6.5 6.8l1-1.6-2-1-1 .9c-1-.5-2-1.5-2.4-2.5l.9-1-1-2z"/>',
    back: '<path d="m9 6 6 6-6 6"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    shield: '<path d="M12 3 19.5 6v5.5c0 4.8-3.2 8-7.5 9.5-4.3-1.5-7.5-4.7-7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    shower: '<path d="M4 20V8a4 4 0 0 1 8 0"/><path d="M8 11h8"/><path d="M10 14v1M13 14v1M16 14v1M11.5 17v1M14.5 17v1"/>',
    park: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M9.5 16.5v-9h3.2a2.7 2.7 0 0 1 0 5.4H9.5"/>',
    water: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/>',
    cafe: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M12 3.5v2.5"/>',
    ac: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    balls: '<circle cx="12" cy="12" r="9"/><path d="M3.5 10c3 1 6 1 8.5-2s4-4.5 8-4M5 18c2-3 5-5 9-5s5 1.5 7 3"/>',
    cover: '<path d="M3 11 12 4l9 7"/><path d="M6 10v10M18 10v10"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5z"/>',
  };
  const ic = (k, c = '') => `<svg class="${c}" viewBox="0 0 24 24">${I[k]}</svg>`;

  /* ——— الملعب (مواقع اللاعبين) ——— */
  const LAY = {
    5: [[.06, .5], [.2, .28], [.2, .72], [.37, .36], [.37, .64]],
    6: [[.06, .5], [.18, .24], [.18, .76], [.28, .5], [.4, .3], [.4, .7]],
    7: [[.06, .5], [.17, .2], [.17, .5], [.17, .8], [.3, .33], [.3, .67], [.42, .5]],
  };
  function field(m) {
    const W = 340, H = 210, pos = [], sp = spots(m), r = 14;
    LAY[m.fmt].forEach(p => { pos.push([W - p[0] * W, p[1] * H]); pos.push([p[0] * W, p[1] * H]); });
    const dots = pos.map((s, i) => {
      const pl = sp[i];
      if (pl) return `<g class="dot ${pl.u === uid() ? 'me' : ''}" style="--d:${i * 40}ms"><circle cx="${s[0]}" cy="${s[1]}" r="${r}"/><text x="${s[0]}" y="${s[1] + 4.5}">${esc(ini(pl.g ? 'ض' : pl.n))}</text></g>`;
      return `<g class="slot" style="--d:${i * 40}ms"><circle cx="${s[0]}" cy="${s[1]}" r="${r}"/><path d="M${s[0] - 4.5} ${s[1]}h9M${s[0]} ${s[1] - 4.5}v9"/></g>`;
    }).join('');
    return `<svg class="field art" viewBox="0 0 ${W} ${H}">
      <defs><pattern id="stripes" width="34" height="${H}" patternUnits="userSpaceOnUse"><rect width="17" height="${H}" fill="#1E9E4A"/><rect x="17" width="17" height="${H}" fill="#1A8F42"/></pattern></defs>
      <rect width="${W}" height="${H}" rx="14" fill="url(#stripes)"/>
      <g class="lines"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="4"/><path d="M${W / 2} 8v${H - 16}"/><circle cx="${W / 2}" cy="${H / 2}" r="26"/>
        <rect x="8" y="${H / 2 - 42}" width="38" height="84"/><rect x="${W - 46}" y="${H / 2 - 42}" width="38" height="84"/>
        <rect x="2" y="${H / 2 - 20}" width="6" height="40"/><rect x="${W - 8}" y="${H / 2 - 20}" width="6" height="40"/></g>
      ${dots}</svg>`;
  }
  const slotsRow = m => { const sp = spots(m); return `<div class="slots">${Array.from({ length: total(m) }, (_, i) => `<i class="${sp[i] ? (sp[i].u === uid() ? 'me' : 'on') : ''}"></i>`).join('')}</div>`; };

  /* ——— بطاقات ——— */
  function matchCard(m, i = 0) {
    const t = hm(m.h), nd = need(m), mine = iJoined(m);
    return `<button class="mc ${nd ? '' : 'full'} ${mine ? 'mine' : ''}" data-act="match" data-id="${m.id}" style="--i:${i};--h:${m.hue}">
      <div class="mc-time"><b>${t.t}</b><span>${t.ap}</span><em>${dayShort(m.d)}</em></div>
      <div class="grow">
        <div class="mc-h"><b>${esc(m.pn)}</b>${isOrg(m) ? '<span class="tag me">مباراتك</span>' : mine ? '<span class="tag me">أنت فيها</span>' : ''}</div>
        <div class="mc-loc">${ic('pin')}${esc(m.w)} · ${esc(m.gov)}</div>
        ${slotsRow(m)}
        <div class="mc-ft"><span>${n(m.fmt)} ضد ${n(m.fmt)}</span><span>${esc(m.lvl)}</span><span>${omr(share(m))} للاعب</span></div>
      </div>
      <div class="need">${nd ? `<b>${n(nd)}</b><span>ناقص</span>` : `${ic('check')}<span>اكتملت</span>`}</div>
    </button>`;
  }
  function pitchCard(p, i) {
    const om = S.matches.filter(m => m.p === p.id && upcoming(m) && need(m) > 0).length;
    return `<button class="pc" data-act="pitch" data-id="${p.id}" style="--h:${p.hue};--i:${i}">
      <div class="turf"><span class="turf-l"></span><div class="pc-badges">${p.owner === uid() ? '<span class="tag own">ملعبك</span>' : ''}${om ? `<span class="tag hot">${n(om)} مباراة ناقصة</span>` : ''}</div>
        <div class="pc-price"><b>${n(p.price)}</b><span>ر.ع / ساعة</span></div></div>
      <div class="pc-b"><div class="pc-h"><b>${esc(p.n)}</b></div>
        <div class="mc-loc">${ic('pin')}${esc(p.w)} · ${esc(p.gov)}</div>
        <div class="pc-f">${p.fmt.map(f => `<span>${n(f)} ضد ${n(f)}</span>`).join('')}${(p.f || []).slice(0, 4).map(f => FEAT[f] ? `<i title="${FEAT[f]}">${ic(f)}</i>` : '').join('')}</div></div>
    </button>`;
  }
  const govChips = () => `<button class="gsel" data-act="govSheet">${ic('pin')}<span>${ui.gov === 'all' ? 'كل المحافظات' : ui.gov}</span><svg class="chev" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg></button>`;
  const localNote = () => S.live ? '' : `<div class="banner">${ic('cloud')}<span>نسخة تجريبية: الملاعب والمباريات والأسماء للعرض فقط، وما تضيفه يُحفظ على جهازك.</span></div>`;

  /* ——— الشاشات ——— */
  function viewLoading() {
    return `<div class="loading"><div class="ld-ball">${ic('ball')}</div><b>نجهّز الملاعب…</b><span class="sub">لحظات ونعرض لك المباريات المتاحة</span></div>`;
  }
  function viewHome() {
    const t = today(), open = S.matches.filter(m => upcoming(m) && (ui.gov === 'all' || m.gov === ui.gov));
    const list = open.filter(m => ui.day === 'all' || m.d === ui.day).sort((a, b) => (need(b) > 0) - (need(a) > 0) || a.d.localeCompare(b.d) || a.h - b.h);
    const needy = open.filter(m => need(m) > 0), next = needy.slice().sort((a, b) => a.d.localeCompare(b.d) || a.h - b.h)[0];
    const free = needy.reduce((a, m) => a + need(m), 0);
    const days = Array.from({ length: 7 }, (_, i) => addDays(t, i)), nm = me().n;
    return `
    <header class="hd"><div class="grow"><div class="brand">${ic('ball')}كمّل</div><h1>${nm ? `هلا ${esc(nm.split(' ')[0])}،` : 'هلا بك،'}<br>وين تلعب الليلة؟</h1></div></header>
    ${localNote()}${govChips()}
    <section class="hero">
      <div class="hero-ball">${ic('ball')}</div>
      <div class="hero-k">مباريات تنتظرك</div>
      <div class="hero-n"><b data-count="${needy.length}">${n(needy.length)}</b><span>مباراة ناقصة<br>${n(free)} مكان شاغر</span></div>
      ${next ? `<button class="hero-next" data-act="match" data-id="${next.id}"><span class="grow"><small>الأقرب</small>${esc(next.pn)} · ${dayName(next.d)} ${tLabel(next.h)}</span><em>ناقص ${n(need(next))}</em></button>`
        : `<button class="hero-next" data-act="create"><span class="grow"><small>كن الأول</small>أنشئ مباراة وخلّ الناس يكمّلون عليك</span><em>أنشئ</em></button>`}
    </section>
    <div class="chips">
      <button class="${ui.day === 'all' ? 'on' : ''}" data-act="day" data-id="all">الكل</button>
      ${days.map(k => `<button class="${ui.day === k ? 'on' : ''}" data-act="day" data-id="${k}"><span>${dayShort(k)}</span><b>${n(pd(k).getDate())}</b></button>`).join('')}
    </div>
    <div class="sec-h"><h2>${ui.day === 'all' ? 'كل المباريات' : dayName(ui.day)}</h2><span class="sub">${n(list.length)} مباراة</span></div>
    ${list.length ? list.map(matchCard).join('') : `<div class="empty">${ic('field')}<b>ما في مباريات هنا بعد</b><span class="sub">أنشئ مباراتك وشارك الرابط في قروب الواتساب، وخلّ الناس يكمّلون عليك.</span><button class="btn" data-act="create">أنشئ مباراة</button></div>`}`;
  }
  function viewPitches() {
    const q = ui.q.trim(), list = S.pitches.filter(p => (ui.gov === 'all' || p.gov === ui.gov) && (!q || (p.n + p.w + p.gov).includes(q))).sort((a, b) => b.at - a.at);
    return `<header class="hd"><div class="grow"><div class="brand">${ic('field')}الملاعب</div><h1>احجز ملعبك</h1></div></header>
      <div class="search">${ic('search')}<input id="q" placeholder="ابحث باسم الملعب أو الولاية" value="${esc(ui.q)}"></div>
      ${govChips()}
      <div class="sec-h"><h2>${n(list.length)} ملعب</h2><span class="sub">الأسعار للساعة</span></div>
      <div id="plist">${list.map(pitchCard).join('') || emptyPitches()}</div>`;
  }
  const emptyPitches = () => `<div class="empty">${ic('field')}<b>${S.pitches.length ? 'لا نتائج' : 'لا توجد ملاعب بعد'}</b><span class="sub">${S.pitches.length ? 'جرّب اسماً أو محافظة أخرى.' : 'أصحاب الترتانات يضيفون ملاعبهم من «حسابي». شارك التطبيق مع صاحب ملعب تعرفه.'}</span>${S.pitches.length ? '' : '<button class="btn" data-act="addPitch">أضف ملعبك</button>'}</div>`;

  function viewPitch() {
    const p = P(ui.pitch), days = Array.from({ length: 7 }, (_, i) => addDays(today(), i)), k = ui.pday, own = p.owner === uid();
    const open = S.matches.filter(m => m.p === p.id && upcoming(m)).sort((a, b) => a.d.localeCompare(b.d) || a.h - b.h);
    const wk = S.matches.concat(S.books).filter(x => x.p === p.id && x.d >= today()).sort((a, b) => a.d.localeCompare(b.d) || a.h - b.h);
    const hrs = wk.reduce((a, x) => a + x.dur, 0);
    return `<div class="pg-top" style="--h:${p.hue}"><div class="turf big"><span class="turf-l"></span></div>
        <button class="back" data-act="back">${ic('back')}</button>
        <div class="pg-h"><h1>${esc(p.n)}</h1><div class="mc-loc">${ic('pin')}${esc(p.w)} · ${esc(p.gov)}</div></div></div>
      <div class="stats">
        <div><b>${n(p.price)}</b><span>ر.ع للساعة</span></div>
        <div><b>${p.fmt.map(f => n(f)).join(' / ')}</b><span>لاعب لكل فريق</span></div>
        <div><b>${n(Math.round(p.price / (p.fmt[0] * 2) * 10) / 10)}</b><span>ر.ع للاعب تقريباً</span></div>
      </div>
      ${own ? `<section class="card owner"><div class="sec-h"><h2>لوحة المالك</h2><span class="tag own">ملعبك</span></div>
        <div class="stats in"><div><b>${n(wk.length)}</b><span>حجز قادم</span></div><div><b>${n(hrs)}</b><span>ساعة محجوزة</span></div><div><b>${n(hrs * p.price)}</b><span>ر.ع دخل متوقع</span></div></div>
        <p class="sub">حجز أحد عبر الهاتف؟ اضغط على الوقت المتاح في الجدول وسجّله باسمه حتى لا يُحجز مرتين.</p>
        ${wk.length ? `<div class="olist">${wk.map(x => `<div class="ol"><b>${dayShort(x.d)} ${tLabel(x.h)}</b><span class="grow">${x.fmt ? `مباراة · ${esc(x.orgN)} · ${n(have(x))}/${n(total(x))}` : `حجز · ${esc(x.n)}`}${x.ph ? ` · <a href="tel:${esc(x.ph)}" dir="ltr">${esc(x.ph)}</a>` : ''}</span>${!x.fmt && x.u === uid() ? `<button class="x sm" data-act="cancelB" data-id="${x.id}" aria-label="إلغاء">${ic('x')}</button>` : ''}</div>`).join('')}</div>` : ''}
        <button class="lnk danger" data-act="delPitch" data-id="${p.id}">${ic('trash')}<span id="delT">حذف الملعب</span></button></section>` : ''}
      <section class="card"><div class="sec-h"><h2>المرافق</h2></div><div class="feats">${(p.f || []).map(f => FEAT[f] ? `<span>${ic(f)}${FEAT[f]}</span>` : '').join('') || '<span class="sub">—</span>'}</div>
        <div class="plinks">${p.map ? `<a class="lnk" href="${esc(p.map)}" target="_blank" rel="noopener">${ic('pin')}الموقع في الخرائط</a>` : ''}${p.ph ? `<a class="lnk" href="tel:${esc(p.ph)}">${ic('phone')}اتصل بالملعب</a>` : ''}</div></section>
      <section class="card"><div class="sec-h"><h2>الجدول</h2><span class="sub">${own ? 'اضغط لتسجيل حجز' : 'اضغط على وقت متاح لتحجز'}</span></div>
        <div class="chips in">${days.map(d => `<button class="${k === d ? 'on' : ''}" data-act="pday" data-id="${d}"><span>${dayShort(d)}</span><b>${n(pd(d).getDate())}</b></button>`).join('')}</div>
        <div class="grid">${HOURS.map(h => {
          const x = taken(p.id, k, h), past = k === today() && h <= nowH();
          if (past) return `<button class="hr past" disabled><b>${tLabel(h)}</b><span>انتهى</span></button>`;
          if (x && x.fmt) return `<button class="hr open" data-act="match" data-id="${x.id}"><b>${tLabel(h)}</b><span>${need(x) ? `ناقص ${n(need(x))}` : 'مكتملة'}</span></button>`;
          if (x) return `<button class="hr busy" disabled><b>${tLabel(h)}</b><span>${own ? esc(x.n) : 'محجوز'}</span></button>`;
          return `<button class="hr free" data-act="slot" data-h="${h}"><b>${tLabel(h)}</b><span>متاح</span></button>`;
        }).join('')}</div>
        <div class="legend"><span><i class="free"></i>متاح</span><span><i class="open"></i>مباراة ناقصة</span><span><i class="busy"></i>محجوز</span></div></section>
      ${open.length ? `<div class="sec-h"><h2>مباريات في هذا الملعب</h2></div>${open.map(matchCard).join('')}` : ''}`;
  }

  function viewMe() {
    const mine = S.matches.filter(m => upcoming(m) && iJoined(m)).sort((a, b) => a.d.localeCompare(b.d) || a.h - b.h);
    const myB = S.books.filter(b => b.u === uid() && !b.manual && (b.d > today() || (b.d === today() && b.h > nowH())));
    const own = S.pitches.filter(p => p.owner === uid()), m = me();
    return `<header class="hd"><div class="grow"><div class="brand">${ic('user')}حسابي</div><h1>${m.n ? esc(m.n) : 'عرّف بنفسك'}</h1></div></header>
      ${localNote()}
      <section class="card form">
        <label>الاسم<input id="meN" maxlength="40" value="${esc(m.n)}" placeholder="اسمك كما يظهر للاعبين"></label>
        <label>رقم الواتساب<input id="mePh" inputmode="tel" value="${esc(m.ph)}" placeholder="9XXXXXXX" dir="ltr"></label>
        <div class="lbl">مركزك المفضل</div>
        <div class="seg">${POS.map(x => `<button class="${m.pos === x ? 'on' : ''}" data-act="pos" data-id="${x}">${x}</button>`).join('')}</div>
        <p class="sub">يظهر اسمك ورقمك للاعبين في المباريات التي تنظّمها حتى يتواصلوا معك.</p>
      </section>
      <div class="sec-h"><h2>مبارياتي القادمة</h2><span class="sub">${n(mine.length + myB.length)}</span></div>
      ${mine.map(matchCard).join('')}
      ${myB.map(b => `<div class="mc bk" style="--h:${b.hue}"><div class="mc-time"><b>${hm(b.h).t}</b><span>${hm(b.h).ap}</span><em>${dayShort(b.d)}</em></div>
        <div class="grow"><div class="mc-h"><b>${esc(b.pn)}</b><span class="tag own">حجز كامل</span></div><div class="mc-loc">${ic('pin')}${esc(b.w)} · ${n(b.dur)} ساعة · ${omr(b.price * b.dur)}</div></div>
        <button class="x" data-act="cancelB" data-id="${b.id}" aria-label="إلغاء">${ic('x')}</button></div>`).join('')}
      ${mine.length + myB.length ? '' : `<p class="sub pad">لم تنضم لأي مباراة بعد. ابحث في «مباريات» عن مباراة ناقصة وكمّل العدد.</p>`}
      <div class="sec-h"><h2>أصحاب الملاعب</h2></div>
      ${own.map(pitchCard).join('')}
      <button class="owner-cta" data-act="addPitch">
        <span class="oc-ic">${ic('field')}</span>
        <span class="grow"><b>${own.length ? 'أضف ملعباً آخر' : 'عندك ملعب ترتان؟'}</b><small>أضفه مجاناً واستقبل الحجوزات، وتابعها من لوحة المالك</small></span>
        <span class="oc-plus">${ic('plus')}</span></button>`;
  }

  /* ——— النوافذ ——— */
  function openSheet(html, cls = '', keepScroll) { const c = $('#sheetBody'), st = c.scrollTop; c.className = 'sheet-card ' + cls; c.innerHTML = html; c.scrollTop = keepScroll ? st : 0; $('#sheet').hidden = false; requestAnimationFrame(() => $('#sheet').classList.add('on')); }
  function closeSheet(re = true) { ui.sheet = null; const s = $('#sheet'); s.classList.remove('on'); setTimeout(() => { if (!ui.sheet) s.hidden = true; }, 300); if (re) render(true); }
  const sheetHead = (t, sub) => `<div class="grab"></div><div class="sh-h"><div class="grow"><b>${t}</b>${sub ? `<div class="sub">${sub}</div>` : ''}</div><button class="x" data-act="closeSheet">${ic('x')}</button></div>`;

  function matchSheet(id, refresh) {
    const m = M(id);
    if (!m) { if (refresh) { closeSheet(); toast('أُلغيت هذه المباراة'); } return; }
    if (!refresh) ui.jc = 1;
    ui.sheet = { k: 'match', id };
    const nd = need(m), mine = iJoined(m), myK = mine ? m.pl[uid()].k : 0, org = isOrg(m), pls = plist(m);
    ui.jc = Math.max(1, Math.min(ui.jc || 1, nd || 1));
    openSheet(`<div class="grab"></div>
      <div class="ms-top"><div class="grow"><div class="sub">${dayName(m.d)} · ${tLabel(m.h)} – ${tLabel(m.h + m.dur)}</div><h2>${esc(m.pn)}</h2><div class="mc-loc">${ic('pin')}${esc(m.w)} · ${esc(m.gov)}</div></div>
        <button class="x" data-act="shareM" data-id="${m.id}" aria-label="مشاركة">${ic('share')}</button><button class="x" data-act="closeSheet">${ic('x')}</button></div>
      <div class="field-w">${field(m)}<div class="vs"><span>فريق أ</span><b>${n(m.fmt)} ضد ${n(m.fmt)}</b><span>فريق ب</span></div></div>
      <div class="ms-need ${nd ? '' : 'full'}">${nd ? `<b>ناقص ${n(nd)}</b><span>من ${n(total(m))} لاعب</span>` : `${ic('check')}<b>اكتمل العدد</b>`}<div class="bar"><i style="width:${have(m) / total(m) * 100}%"></i></div></div>
      <div class="info">
        <div>${ic('cash')}<span>${omr(share(m))}</span><small>نصيب اللاعب</small></div>
        <div>${ic('clock')}<span>${m.dur > 1 ? 'ساعتان' : 'ساعة'}</span><small>المدة</small></div>
        <div>${ic('shield')}<span>${esc(m.lvl)}</span><small>المستوى</small></div>
      </div>
      ${m.note ? `<div class="note">«${esc(m.note)}»<small>— ${esc(m.orgN)}، المنظّم</small></div>` : ''}
      <div class="sh-sec"><h3>اللاعبون <span class="sub">${n(have(m))}/${n(total(m))}</span></h3>
        <div class="pls">${pls.map(x => `<span class="pl ${x.u === uid() ? 'me' : ''}"><i>${esc(ini(x.n))}</i>${esc(x.n)}${x.k > 1 ? ` <small>+${n(x.k - 1)}</small>` : ''}${x.u === m.org ? '<em>منظّم</em>' : ''}</span>`).join('')}</div></div>
      <div class="ms-act">
        ${org ? `<button class="btn ghost" data-act="cancelM" data-id="${m.id}"><span id="cmT">إلغاء المباراة</span></button><button class="btn" data-act="shareM" data-id="${m.id}">${ic('share')}شارك ليكمّلوا</button>`
          : mine ? `<button class="btn ghost" data-act="leave" data-id="${m.id}">انسحاب${myK > 1 ? ` (${n(myK)})` : ''}</button>${m.ph ? `<button class="btn" data-act="wa" data-id="${m.id}">${ic('wa')}واتساب المنظّم</button>` : ''}`
          : nd ? `<div class="joinc"><span class="sub">كم لاعب معك (مع نفسك)؟</span><div class="stp"><button data-act="jc" data-d="-1">−</button><b id="jc">${n(ui.jc)}</b><button data-act="jc" data-d="1">+</button></div></div>
            <button class="btn big" data-act="join" data-id="${m.id}" id="joinB">${ic('ball')}كمّل العدد · ${omr(share(m) * ui.jc)}</button>`
          : `<button class="btn ghost" disabled>المباراة مكتملة</button>`}
      </div>`, 'tall', refresh);
  }
  function govSheet() {
    ui.sheet = { k: 'gov' };
    openSheet(sheetHead('المحافظة') + `<div class="gl">${['all'].concat(GOV).map(g => `<button class="${ui.gov === g ? 'on' : ''}" data-act="gov" data-id="${g}">${g === 'all' ? 'كل المحافظات' : g}${ui.gov === g ? ic('check') : ''}</button>`).join('')}</div>`);
  }
  function createSheet(pid, k, h) {
    if (!S.pitches.length) { toast('لا توجد ملاعب بعد — أضف ملعباً من «حسابي»'); return; }
    const p0 = P(pid) || S.pitches.find(p => ui.gov === 'all' || p.gov === ui.gov) || S.pitches[0];
    ui.cf = { p: p0.id, d: k || today(), h: h || null, fmt: p0.fmt[0], have: 1, dur: 1, lvl: 'متوسط', mode: 'match', note: '' };
    renderCreate();
  }
  function renderCreate(keep) {
    ui.sheet = { k: 'create' };
    const c = ui.cf, p = P(c.p); if (!p) return closeSheet();
    const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i));
    const freeH = HOURS.filter(h => !(c.d === today() && h <= nowH()) && !taken(p.id, c.d, h) && (c.dur === 1 || (h < 23 && !taken(p.id, c.d, h + 1))));
    if (c.h && !freeH.includes(c.h)) c.h = null;
    const tot = c.fmt * 2, cost = p.price * c.dur;
    openSheet(sheetHead(c.mode === 'match' ? 'أنشئ مباراة' : 'حجز الملعب كاملاً', c.mode === 'match' ? 'احجز وخلّ اللاعبين يكمّلون العدد' : 'الملعب لك ولفريقك') + `
      <div class="seg two"><button class="${c.mode === 'match' ? 'on' : ''}" data-act="cmode" data-id="match">أبحث عن لاعبين</button><button class="${c.mode === 'book' ? 'on' : ''}" data-act="cmode" data-id="book">فريقي كامل</button></div>
      <div class="lbl">الملعب</div>
      <select id="cP">${S.pitches.map(x => `<option value="${x.id}" ${x.id === c.p ? 'selected' : ''}>${esc(x.n)} — ${esc(x.w)} (${n(x.price)} ر.ع)</option>`).join('')}</select>
      <div class="lbl">اليوم</div>
      <div class="chips in">${days.map(d => `<button class="${c.d === d ? 'on' : ''}" data-act="cd" data-id="${d}"><span>${dayShort(d)}</span><b>${n(pd(d).getDate())}</b></button>`).join('')}</div>
      <div class="lbl">الوقت والمدة</div>
      <div class="seg two sm">${[1, 2].map(x => `<button class="${c.dur === x ? 'on' : ''}" data-act="cdur" data-id="${x}">${x === 1 ? 'ساعة' : 'ساعتان'}</button>`).join('')}</div>
      <div class="times">${freeH.length ? freeH.map(h => `<button class="${c.h === h ? 'on' : ''}" data-act="ch" data-id="${h}">${tLabel(h)}</button>`).join('') : '<span class="sub">لا أوقات متاحة في هذا اليوم</span>'}</div>
      ${c.mode === 'match' ? `
      <div class="lbl">نوع المباراة</div>
      <div class="seg">${p.fmt.map(f => `<button class="${c.fmt === f ? 'on' : ''}" data-act="cfmt" data-id="${f}">${n(f)} ضد ${n(f)}</button>`).join('')}</div>
      <div class="row2"><div><div class="lbl">كم لاعب عندك (مع نفسك)</div><div class="stp"><button data-act="chave" data-d="-1">−</button><b>${n(c.have)}</b><button data-act="chave" data-d="1">+</button></div></div>
        <div class="need-p"><b>${n(tot - c.have)}</b><span>لاعب ناقص</span></div></div>
      <div class="lbl">المستوى</div>
      <div class="seg">${LEVELS.map(l => `<button class="${c.lvl === l ? 'on' : ''}" data-act="clvl" data-id="${l}">${l}</button>`).join('')}</div>
      <div class="lbl">ملاحظة للاعبين (اختياري)</div><input id="cNote" maxlength="120" placeholder="مثال: نحتاج حارس، لبس أبيض" value="${esc(c.note)}">` : ''}
      <div class="sum"><div><span>تكلفة الملعب</span><b>${omr(cost)}</b></div>${c.mode === 'match' ? `<div><span>على كل لاعب</span><b>${omr(cost / tot)}</b></div>` : ''}</div>
      <p class="sub pad">الدفع يتم في الملعب مباشرة.</p>
      <button class="btn big" data-act="cGo" ${c.h ? '' : 'disabled'}>${c.h ? (c.mode === 'match' ? `انشر المباراة · ${dayShort(c.d)} ${tLabel(c.h)}` : `احجز · ${dayShort(c.d)} ${tLabel(c.h)}`) : 'اختر وقتاً'}</button>`, 'tall', keep !== false);
  }
  function ownerSlotSheet(h) {
    ui.sheet = { k: 'oslot' }; ui.os = { h, dur: 1 };
    const p = P(ui.pitch);
    openSheet(sheetHead('تسجيل حجز', `${esc(p.n)} · ${dayName(ui.pday)} ${tLabel(h)}`) + `<div class="form">
      <label>اسم الحاجز<input id="osN" maxlength="40" placeholder="مثال: فريق الشباب"></label>
      <label>رقمه (اختياري)<input id="osP" inputmode="tel" dir="ltr" placeholder="9XXXXXXX"></label>
      <div class="seg two">${[1, 2].map(x => `<button class="${x === 1 ? 'on' : ''}" data-act="osDur" data-id="${x}">${x === 1 ? 'ساعة' : 'ساعتان'}</button>`).join('')}</div></div>
      <button class="btn big" data-act="osGo">${ic('check')}سجّل الحجز</button>
      <button class="btn ghost big" data-act="osMatch">أو أنشئ مباراة في هذا الوقت</button>`);
  }
  function addPitchSheet() {
    ui.sheet = { k: 'addPitch' }; ui.np = { f: ['light', 'park'], fmt: [5] };
    openSheet(sheetHead('أضف ملعبك', 'يظهر للاعبين فوراً ويستقبل الحجوزات') + `
      <div class="form">
        <label>اسم الملعب<input id="npN" maxlength="50" placeholder="مثال: ترتان الريّان"></label>
        <label>المحافظة<select id="npG">${GOV.map(g => `<option>${g}</option>`).join('')}</select></label>
        <label>الولاية / المنطقة<input id="npW" maxlength="40" placeholder="مثال: السيب - المعبيلة"></label>
        <label>سعر الساعة (ر.ع)<input id="npP" type="number" inputmode="decimal" placeholder="15"></label>
        <label>رقم الملعب للحجز (اختياري)<input id="npT" inputmode="tel" dir="ltr" placeholder="9XXXXXXX"></label>
        <div class="lbl">أحجام اللعب المتاحة</div>
        <div class="seg">${[5, 6, 7].map(f => `<button class="${f === 5 ? 'on' : ''}" data-act="npFmt" data-id="${f}">${n(f)} ضد ${n(f)}</button>`).join('')}</div>
        <div class="lbl">المرافق</div>
        <div class="feats pick">${Object.keys(FEAT).map(f => `<button class="${ui.np.f.includes(f) ? 'on' : ''}" data-act="npF" data-id="${f}">${ic(f)}${FEAT[f]}</button>`).join('')}</div>
        <label>رابط الموقع في خرائط Google (اختياري)<input id="npM" dir="ltr" placeholder="https://maps.app.goo.gl/..."></label>
      </div>
      <button class="btn big" data-act="npGo">${ic('plus')}أضف الملعب</button>`, 'tall');
  }
  function needName(next) {
    ui.sheet = { k: 'name' }; const m = me();
    openSheet(sheetHead('عرّف بنفسك', 'حتى يعرفك المنظّم واللاعبون') + `<div class="form">
      <label>الاسم<input id="nnN" maxlength="40" value="${esc(m.n)}" placeholder="اسمك"></label>
      <label>رقم الواتساب<input id="nnP" inputmode="tel" dir="ltr" value="${esc(m.ph)}" placeholder="9XXXXXXX"></label></div>
      <button class="btn big" data-act="nnGo">متابعة</button>`);
    ui.after = next; setTimeout(() => $('#nnN') && $('#nnN').focus(), 350);
  }
  const withName = fn => (...a) => me().n.trim() ? fn(...a) : needName(() => fn(...a));

  /* ——— حركات ——— */
  function celebrate(t, s) {
    const c = document.createElement('div'); c.className = 'cele';
    c.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="--x:${Math.cos(i / 28 * 6.283) * (100 + (i % 3) * 45)}px;--y:${Math.sin(i / 28 * 6.283) * (100 + (i % 3) * 45)}px;--d:${(i % 5) * 30}ms;--c:${['#B8F34A', '#22C55E', '#fff', '#FACC15'][i % 4]}"></i>`).join('')
      + `<div class="cele-b"><div class="cb-ball">${ic('ball')}</div><b>${t}</b>${s ? `<span>${s}</span>` : ''}</div>`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 2200);
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  }
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2600); }
  async function run(btn, fn) {
    if (btn && btn.dataset) { if (btn.dataset.busy) return false; btn.dataset.busy = 1; btn.classList.add('busy'); }
    try { const r = await fn(); return r === undefined ? true : r; }
    catch (e) {
      toast(e === KMStore.TAKEN ? 'هذا الوقت انحجز للتو — اختر وقتاً آخر' : e === KMStore.FULL ? 'اكتمل العدد قبلك — جرّب مباراة أخرى' : (navigator.onLine ? 'تعذّر الحفظ، حاول مرة أخرى' : 'لا يوجد اتصال بالإنترنت'));
      console.warn(e); return false;
    } finally { if (btn && btn.dataset) { delete btn.dataset.busy; btn.classList.remove('busy'); } }
  }
  const linkFor = id => `${location.origin}${location.pathname}?m=${id}`;

  const act = {
    tab(el) { ui.tab = el.dataset.tab; ui.pitch = null; render(); scrollTo(0, 0); },
    day(el) { ui.day = el.dataset.id; render(true); },
    govSheet, gov(el) { ui.gov = el.dataset.id; closeSheet(); },
    match(el) { matchSheet(el.dataset.id); },
    pitch(el) { ui.pitch = el.dataset.id; ui.pday = today(); ui.tab = 'pitches'; closeSheet(false); render(); scrollTo(0, 0); },
    back() { ui.pitch = null; render(); scrollTo(0, 0); },
    pday(el) { ui.pday = el.dataset.id; render(true); },
    closeSheet() { closeSheet(); },
    jc(el) { const m = M(ui.sheet.id); ui.jc = Math.max(1, Math.min(need(m), 4, ui.jc + +el.dataset.d)); $('#jc').textContent = n(ui.jc); $('#joinB').innerHTML = `${ic('ball')}كمّل العدد · ${omr(share(m) * ui.jc)}`; },
    join: withName(async el => {
      const id = el.dataset.id, k = ui.jc || 1;
      if (await run(el, () => ST.join(id, me().n.trim(), k)) === false) return;
      const m = M(id); matchSheet(id, true);
      if (m) need(m) === 0 ? celebrate('اكتمل العدد!', 'المباراة جاهزة — شوفكم في الملعب') : celebrate('أنت في المباراة', `${dayName(m.d)} ${tLabel(m.h)} · باقي ${n(need(m))}`);
    }),
    async leave(el) { if (await run(el, () => ST.leave(el.dataset.id)) !== false) toast('انسحبت من المباراة'); },
    async cancelM(el) {
      if (!act.cancelM.armed) { act.cancelM.armed = true; $('#cmT').textContent = 'اضغط مرة أخرى للتأكيد'; setTimeout(() => { act.cancelM.armed = false; }, 3000); return; }
      act.cancelM.armed = false; const m = M(el.dataset.id);
      if (await run(el, () => ST.cancel('matches', m)) !== false) { closeSheet(); toast('أُلغيت المباراة'); }
    },
    async cancelB(el) { const b = S.books.find(x => x.id === el.dataset.id); if (b && await run(el, () => ST.cancel('bookings', b)) !== false) toast('أُلغي الحجز'); },
    async shareM(el) {
      const m = M(el.dataset.id), url = linkFor(m.id);
      const text = `⚽ مباراة ${n(m.fmt)} ضد ${n(m.fmt)} في ${m.pn} (${m.w}) ${dayName(m.d)} الساعة ${tLabel(m.h)}\nناقص ${n(need(m))} لاعب — كمّل العدد:`;
      try { if (navigator.share) { await navigator.share({ title: 'كمّل', text, url }); return; } } catch (e) { if (e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(text + '\n' + url); toast('نُسخ الرابط — الصقه في قروب الواتساب'); } catch (e) { toast(url); }
    },
    wa(el) {
      const m = M(el.dataset.id), num = (m.ph || '').replace(/\D/g, '').replace(/^968/, '');
      const msg = `السلام عليكم، انضممت لمباراتكم في ${m.pn} ${dayName(m.d)} الساعة ${tLabel(m.h)} عبر تطبيق كمّل`;
      window.open(`https://wa.me/968${num}?text=${encodeURIComponent(msg)}`, '_blank');
    },
    create() { createSheet(ui.pitch); },
    slot(el) { const p = P(ui.pitch); if (p && p.owner === uid()) ownerSlotSheet(+el.dataset.h); else createSheet(ui.pitch, ui.pday, +el.dataset.h); },
    cmode(el) { ui.cf.mode = el.dataset.id; renderCreate(); },
    cd(el) { ui.cf.d = el.dataset.id; renderCreate(); },
    ch(el) { ui.cf.h = +el.dataset.id; renderCreate(); },
    cdur(el) { ui.cf.dur = +el.dataset.id; renderCreate(); },
    cfmt(el) { ui.cf.fmt = +el.dataset.id; ui.cf.have = Math.min(ui.cf.have, ui.cf.fmt * 2 - 1); renderCreate(); },
    chave(el) { ui.cf.have = Math.max(1, Math.min(ui.cf.fmt * 2 - 1, ui.cf.have + +el.dataset.d)); renderCreate(); },
    clvl(el) { ui.cf.lvl = el.dataset.id; renderCreate(); },
    cGo: withName(async el => {
      const c = ui.cf, p = P(c.p); if (!c.h || !p) return;
      const m0 = me(), nm = m0.n.trim(), base = { p: c.p, d: c.d, h: c.h, dur: c.dur, ...pmeta(p) };
      if (c.mode === 'book') {
        if (await run(el, () => ST.reserve('bookings', { ...base, u: uid(), n: nm, ph: m0.ph || '' })) === false) return renderCreate();
        closeSheet(); return celebrate('تم الحجز', `${p.n} · ${dayName(c.d)} ${tLabel(c.h)} — الدفع في الملعب`);
      }
      const data = { ...base, fmt: c.fmt, lvl: c.lvl, note: c.note.trim().slice(0, 120), org: uid(), orgN: nm, ph: m0.ph || '', pl: { [uid()]: { n: nm, k: c.have, t: Date.now() } } };
      const id = await run(el, () => ST.reserve('matches', data)); if (id === false) return renderCreate();
      closeSheet(false); ui.tab = 'home'; ui.pitch = null; ui.day = 'all'; render();
      celebrate('نُشرت مباراتك', `ناقص ${n(c.fmt * 2 - c.have)} — شارك الرابط مع أصحابك`);
      setTimeout(() => { if (M(id) && !ui.sheet) matchSheet(id); }, 1700);
    }),
    osDur(el) { ui.os.dur = +el.dataset.id; el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); },
    async osGo(el) {
      const nm = $('#osN').value.trim(); if (!nm) { $('#osN').focus(); return; }
      const p = P(ui.pitch), h = ui.os.h, dur = ui.os.dur;
      if (dur === 2 && (h >= 23 || taken(p.id, ui.pday, h + 1))) { toast('الساعة التالية غير متاحة'); return; }
      if (await run(el, () => ST.reserve('bookings', { p: p.id, d: ui.pday, h, dur, ...pmeta(p), u: uid(), n: nm, ph: $('#osP').value.trim(), manual: true })) === false) return;
      closeSheet(); toast('سُجّل الحجز');
    },
    osMatch() { createSheet(ui.pitch, ui.pday, ui.os.h); },
    addPitch: withName(() => addPitchSheet()),
    npFmt(el) { const f = +el.dataset.id, a = ui.np.fmt; ui.np.fmt = a.includes(f) ? (a.length > 1 ? a.filter(x => x !== f) : a) : a.concat(f).sort(); el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', ui.np.fmt.includes(+b.dataset.id))); },
    npF(el) { const f = el.dataset.id, a = ui.np.f; ui.np.f = a.includes(f) ? a.filter(x => x !== f) : a.concat(f); el.classList.toggle('on'); },
    async npGo(el) {
      const nm = $('#npN').value.trim(), w = $('#npW').value.trim(), pr = parseFloat($('#npP').value);
      if (!nm || !w || !(pr > 0 && pr < 500)) { toast('أكمل الاسم والولاية والسعر'); return; }
      const mp = $('#npM').value.trim();
      const p = { n: nm, gov: $('#npG').value, w, price: pr, fmt: ui.np.fmt, f: ui.np.f, ph: $('#npT').value.trim(), hue: 90 + Math.floor(Math.random() * 100), map: /^https:\/\//.test(mp) ? mp : '' };
      const id = await run(el, () => ST.addPitch(p)); if (id === false) return;
      closeSheet(false); ui.tab = 'pitches'; ui.pitch = id; render(); scrollTo(0, 0);
      celebrate('أُضيف ملعبك', 'صار يظهر للاعبين ويستقبل الحجوزات');
    },
    async delPitch(el) {
      if (!act.delPitch.armed) { act.delPitch.armed = true; $('#delT').textContent = 'اضغط مرة أخرى للتأكيد'; setTimeout(() => { act.delPitch.armed = false; }, 3000); return; }
      act.delPitch.armed = false;
      if (await run(el, () => ST.delPitch(el.dataset.id)) === false) return;
      ui.pitch = null; ui.tab = 'me'; render(); toast('حُذف الملعب');
    },
    pos(el) { saveMe({ ...me(), pos: el.dataset.id }); render(true); },
    async nnGo(el) {
      const v = $('#nnN').value.trim(); if (!v) { $('#nnN').focus(); return; }
      if (await run(el, () => ST.saveMe({ ...me(), n: v, ph: $('#nnP').value.trim() })) === false) return;
      const f = ui.after; ui.after = null; f && f();
    },
  };
  let saveT;
  function saveMe(x) { S.me = x; clearTimeout(saveT); saveT = setTimeout(() => ST.saveMe(x).catch(() => toast('تعذّر حفظ بياناتك')), 600); }

  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && act[el.dataset.act] && !el.disabled) act[el.dataset.act](el); });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') { ui.q = t.value; const q = ui.q.trim(); $('#plist').innerHTML = S.pitches.filter(p => (ui.gov === 'all' || p.gov === ui.gov) && (!q || (p.n + p.w + p.gov).includes(q))).map(pitchCard).join('') || emptyPitches(); }
    if (t.id === 'meN') saveMe({ ...me(), n: t.value.slice(0, 40) });
    if (t.id === 'mePh') saveMe({ ...me(), ph: t.value.slice(0, 20) });
    if (t.id === 'cNote') ui.cf.note = t.value;
  });
  document.addEventListener('change', e => { if (e.target.id === 'cP') { ui.cf.p = e.target.value; const p = P(ui.cf.p); if (!p.fmt.includes(ui.cf.fmt)) ui.cf.fmt = p.fmt[0]; renderCreate(); } });
  document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.addEventListener('click', () => act.tab(b)));

  function countUp() {
    document.querySelectorAll('[data-count]').forEach(el => { const to = +el.dataset.count, t0 = performance.now();
      const step = t => { const k = Math.min((t - t0) / 900, 1); el.textContent = n(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  }
  let wasReady = false;
  function render(quiet) {
    const v = $('#view');
    if (!S.ready) { v.innerHTML = viewLoading(); return; }
    if (ui.pitch && !P(ui.pitch)) ui.pitch = null;
    v.innerHTML = ui.tab === 'home' ? viewHome() : ui.tab === 'pitches' ? (ui.pitch ? viewPitch() : viewPitches()) : viewMe();
    [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10)));
    v.classList.toggle('enter', !quiet); v.classList.toggle('quiet', !!quiet);
    if (!quiet) countUp();
    document.querySelectorAll('#tabs button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  }
  // تحديث مباشر عند تغيّر البيانات من أي جهاز
  function onData() {
    if (!S) return;
    if (S.error && !errShown) { errShown = 1; toast('تعذّر الاتصال بقاعدة البيانات'); }
    if (!S.ready) return render();
    if (!wasReady) { wasReady = true; render(); }
    else {
      const a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#view').contains(a);
      if (!typing) render(true);
    }
    if (ui.sheet && ui.sheet.k === 'match') matchSheet(ui.sheet.id, true);
    if (ui.deep) {
      const m = M(ui.deep); history.replaceState(null, '', location.pathname);
      if (m) matchSheet(m.id); else toast('المباراة غير متاحة — ربما انتهت أو أُلغيت');
      ui.deep = null;
    }
  }
  ST = KMStore.create(onData); S = ST.S;
  render(); onData();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
