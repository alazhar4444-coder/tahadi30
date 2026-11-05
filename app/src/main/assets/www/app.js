/* تحدي ٣٠ يوم — منطق التطبيق */
(function () {
  'use strict';
  const C = window.CONTENT;
  const NATIVE = window.Android || null;
  const $ = s => document.querySelector(s);

  /* ---------- التخزين ---------- */
  const Store = {
    get(k, def) {
      try {
        const raw = NATIVE ? NATIVE.load(k) : localStorage.getItem(k);
        return raw ? JSON.parse(raw) : def;
      } catch (e) { return def; }
    },
    set(k, v) {
      const raw = JSON.stringify(v);
      try { NATIVE ? NATIVE.save(k, raw) : localStorage.setItem(k, raw); } catch (e) {}
    }
  };

  const CITIES = [
    ['muscat', 'مسقط', 23.5880, 58.3829], ['seeb', 'السيب', 23.6703, 58.1891], ['sohar', 'صحار', 24.3474, 56.7094],
    ['nizwa', 'نزوى', 22.9333, 57.5333], ['salalah', 'صلالة', 17.0151, 54.0924], ['sur', 'صور', 22.5667, 59.5289],
    ['ibri', 'عبري', 23.2257, 56.5157], ['buraimi', 'البريمي', 24.2500, 55.7930], ['ibra', 'إبراء', 22.6906, 58.5334],
    ['rustaq', 'الرستاق', 23.3908, 57.4244], ['khasab', 'خصب', 26.1799, 56.2477],
    ['riyadh', 'الرياض', 24.7136, 46.6753], ['makkah', 'مكة المكرمة', 21.4225, 39.8262], ['madinah', 'المدينة المنورة', 24.4672, 39.6111],
    ['jeddah', 'جدة', 21.4858, 39.1925], ['dammam', 'الدمام', 26.4207, 50.0888], ['dubai', 'دبي', 25.2048, 55.2708],
    ['abudhabi', 'أبوظبي', 24.4539, 54.3773], ['doha', 'الدوحة', 25.2854, 51.5310], ['kuwait', 'الكويت', 29.3759, 47.9774],
    ['manama', 'المنامة', 26.2285, 50.5860], ['cairo', 'القاهرة', 30.0444, 31.2357], ['amman', 'عمّان', 31.9454, 35.9284]
  ];

  const DEFAULTS = {
    name: '', startDate: '2026-11-08', length: 30,
    quranGoal: 2, walkKm: 5, workoutMin: 30, strideCm: 75, waterGoal: 8,
    city: 'muscat', lat: 23.5880, lng: 58.3829, placeName: 'مسقط',
    method: 'MWL', asrFactor: 1, adjust: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    notifPrayers: true, notifEvening: true, eveningTime: '21:30', theme: 'auto',
    extras: Object.fromEntries(C.extras.map(e => [e.id, e.on])), onboarded: false,
    rewardW1: '', rewardW2: '', rewardW3: '', rewardW4: '', rewardAll: ''
  };

  let S = Object.assign({}, DEFAULTS, Store.get('settings', {}));
  S.adjust = Object.assign({}, DEFAULTS.adjust, S.adjust || {});
  S.extras = Object.assign({}, DEFAULTS.extras, S.extras || {});
  let DAYS = Store.get('days', {});
  let BOOK = Store.get('quranPage', 1);
  let STEPS = {};            // yyyy-mm-dd -> steps (من الحسّاس)
  let STEP_STATE = { available: false, permitted: false };

  const saveS = () => Store.set('settings', S);
  const saveD = () => { Store.set('days', DAYS); const k = viewKey; clearTimeout(saveD._t); saveD._t = setTimeout(() => { try { checkRewards(k); } catch (e) {} }, 380); };

  /* ---------- التاريخ والأرقام ---------- */
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const n = x => String(x).replace(/\d/g, d => AR[d]);
  const pad = x => String(x).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k);
  const diffDays = (a, b) => Math.round((fromKey(keyOf(a)) - fromKey(keyOf(b))) / 864e5);
  const todayKey = () => keyOf(new Date());
  const fmtTime = d => d ? n(`${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`) + ' ' + (d.getHours() < 12 ? 'ص' : 'م') : '—';
  const greg = d => d.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/\d/g, x => AR[x]);
  const hijri = d => { try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return ''; } };
  const dur = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
  const round1 = x => Math.round(x * 10) / 10;

  /* ---------- نسخة الآيفون (الويب): الخطوات تأتي من اختصار يقرأ تطبيق الصحة ---------- */
  const WEB = !NATIVE;
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const appUrl = () => location.origin + location.pathname;
  function intakeWebSteps() {
    if (!WEB) return false;
    const q = new URLSearchParams(location.search), s = q.get('steps');
    if (s == null || isNaN(parseFloat(s))) return false;
    const ws = Store.get('webSteps', {});
    ws[todayKey()] = Math.round(parseFloat(s));
    Store.set('webSteps', ws);
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    return true;
  }

  const start = () => fromKey(S.startDate);
  const dayNum = k => diffDays(fromKey(k), start()) + 1;        // ١..٣٠ داخل التحدي
  const inChallenge = k => { const d = dayNum(k); return d >= 1 && d <= S.length; };

  /* ---------- بيانات اليوم ---------- */
  function day(k) {
    if (!DAYS[k]) DAYS[k] = { p: {}, quran: 0, walkKm: 0, workout: 0, x: {}, note: '' };
    const D = DAYS[k]; D.p = D.p || {}; D.x = D.x || {};
    return D;
  }
  const extrasFor = k => C.extras.filter(e => S.extras[e.id] && (!e.days || e.days.includes(fromKey(k).getDay())));
  const stepsKm = k => (STEPS[k] || 0) * S.strideCm / 100000;
  const walkKmOf = k => stepsKm(k) + (+(DAYS[k] && DAYS[k].walkKm) || 0);
  const walkDone = k => walkKmOf(k) >= S.walkKm || ((DAYS[k] && DAYS[k].workout) || 0) >= S.workoutMin;

  function score(k) {
    const D = DAYS[k] || { p: {}, x: {} }; const p = D.p || {}, x = D.x || {};
    const parts = [];
    C.prayers.forEach(pr => parts.push(p[pr.id] === 2 ? 1 : p[pr.id] === 1 ? .5 : 0));
    parts.push(Math.min((D.quran || 0) / S.quranGoal, 1));
    parts.push(walkDone(k) ? 1 : Math.min(walkKmOf(k) / S.walkKm, 1));
    ['noSugar', 'noBread', 'chastity'].forEach(id => parts.push(D[id] === true ? 1 : 0));
    extrasFor(k).forEach(e => {
      const v = x[e.id];
      if (e.type === 'count') parts.push(Math.min((v || 0) / S[e.goalKey], 1));
      else parts.push(v === true ? 1 : 0);
    });
    const pct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100);
    const core = C.prayers.every(pr => p[pr.id] === 2) && (D.quran || 0) >= S.quranGoal && walkDone(k)
      && D.noSugar === true && D.noBread === true && D.chastity === true;
    return { pct, core };
  }

  function streak(test, fromK) {
    // سلسلة متتالية تنتهي باليوم (أو بالأمس إن لم يُسجّل اليوم بعد)
    let d = fromKey(fromK || todayKey()), c = 0;
    if (!test(keyOf(d))) d = addDays(d, -1);
    while (test(keyOf(d)) && diffDays(d, start()) >= 0) { c++; d = addDays(d, -1); }
    return c;
  }
  const isTrue = id => k => DAYS[k] && DAYS[k][id] === true;

  /* ---------- الصلاة ---------- */
  const popts = () => ({ method: S.method, asrFactor: S.asrFactor, adjust: S.adjust });
  const ptimes = d => PrayTime.times(d, S.lat, S.lng, popts());
  function nextPrayer(now) {
    now = now || new Date();
    for (let i = 0; i < 2; i++) {
      const d = addDays(now, i), t = ptimes(d);
      for (const pr of C.prayers) if (t[pr.id] && t[pr.id] > now) return { pr, at: t[pr.id] };
    }
    return null;
  }
  function currentPrayerId(now) {
    const t = ptimes(now); let cur = null;
    C.prayers.forEach(pr => { if (t[pr.id] && t[pr.id] <= now) cur = pr.id; });
    return cur;
  }

  /* ---------- الإشعارات (تُجدول عبر أندرويد) ---------- */
  function scheduleNotifs() {
    if (!NATIVE || !NATIVE.schedule) return;
    const now = new Date(), list = [];
    for (let i = 0; i < 10; i++) {
      const d = addDays(now, i), t = ptimes(d), base = (diffDays(d, new Date(2026, 0, 1)) % 500) * 10;
      if (S.notifPrayers) C.prayers.forEach((pr, j) => {
        if (t[pr.id] > now) list.push({ id: base + j, at: t[pr.id].getTime(), title: `حان الآن وقت صلاة ${pr.name}`,
          body: '«الصلاة على وقتها» — لا تنسَ تسجيلها في التحدي', ch: 'prayer' });
      });
      if (S.notifEvening) {
        const [h, m] = S.eveningTime.split(':').map(Number);
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
        if (at > now) list.push({ id: base + 7, at: at.getTime(), title: 'كيف كان يومك؟', body: 'سجّل إنجازات اليوم وأكمل ما تبقّى قبل النوم', ch: 'daily' });
      }
      if (keyOf(d) === S.startDate) {
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0);
        if (at > now) list.push({ id: base + 8, at: at.getTime(), title: 'اليوم يبدأ تحدي ٣٠ يوم!', body: 'بسم الله، توكّل على الله وابدأ يومك الأول', ch: 'daily' });
      }
    }
    try { NATIVE.schedule(JSON.stringify(list)); } catch (e) {}
  }

  /* ---------- ملف تقويم (ics) لتنبيهات الآيفون ---------- */
  function buildIcs(from, count) {
    const f = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tahadi30//AR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:تحدي ٣٠ يوم'];
    const ev = (uid, at, mins, title, body) => {
      L.push('BEGIN:VEVENT', `UID:${uid}@tahadi30`, `DTSTAMP:${stamp}`, `DTSTART:${f(at)}`, `DTEND:${f(new Date(at.getTime() + mins * 60000))}`,
        `SUMMARY:${title}`, `DESCRIPTION:${body}`, 'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
    };
    for (let i = 0; i < count; i++) {
      const d = addDays(from, i), t = ptimes(d), k = keyOf(d).replace(/-/g, '');
      C.prayers.forEach(pr => { if (t[pr.id]) ev(`${k}-${pr.id}`, t[pr.id], 15, `🕌 صلاة ${pr.name}`, 'الصلاة على وقتها — سجّلها في التحدي'); });
      if (S.notifEvening) {
        const [h, m] = S.eveningTime.split(':').map(Number);
        ev(`${k}-review`, new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m), 10, '✅ سجّل إنجازات اليوم', 'تحدي ٣٠ يوم: أكمل ما تبقّى قبل النوم');
      }
    }
    L.push('END:VCALENDAR');
    // طيّ الأسطر الطويلة (٧٥ بايت) حسب معيار iCalendar
    const enc = new TextEncoder();
    const fold = line => {
      if (enc.encode(line).length <= 74) return line;
      const out = []; let cur = '', limit = 74;
      for (const ch of line) {
        if (enc.encode(cur + ch).length > limit) { out.push(cur); cur = ''; limit = 73; }
        cur += ch;
      }
      out.push(cur);
      return out.join('\r\n ');
    };
    return L.map(fold).join('\r\n') + '\r\n';
  }
  window.__buildIcs = (from, count) => buildIcs(from ? fromKey(from) : start(), count || S.length);

  /* ---------- الخطوات ---------- */
  function refreshSteps() {
    if (WEB) { STEPS = Store.get('webSteps', {}); STEP_STATE = { available: true, permitted: true }; return; }
    if (!NATIVE.getStepsJson) return;
    try {
      const r = JSON.parse(NATIVE.getStepsJson());
      STEPS = r.history || {}; STEP_STATE = { available: !!r.available, permitted: !!r.permitted };
    } catch (e) {}
  }

  /* ---------- الحالة العامة ---------- */
  let tab = 'today', viewKey = todayKey();

  function applyTheme() {
    const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (NATIVE && NATIVE.setBars) try { NATIVE.setBars(dark ? '#0B0F14' : '#F3F5F8', !dark); } catch (e) {}
  }

  /* ---------- الأيقونات: إيموجي واقعية ومفهومة ---------- */
  const E = {
    fajr: '🌄', sunrise: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌇', isha: '🌙',
    quran: '📖', walk: '🚶', workout: '🏋️', noSugar: '🍬', noBread: '🍞', chastity: '🛡️',
    adhkarAM: '📿', adhkarPM: '📿', witr: '🤲', rawatib: '🕌', duha: '🌞', istighfar: '☝️', sadaqa: '💝', birr: '👪',
    fasting: '🍽️', water: '💧', sleep: '😴', veggies: '🥗', noSoda: '🥤', noPhoneBed: '📵',
    mosque: '🕌', star: '⭐', fire: '🔥', points: '✨', trophy: '🏆', gift: '🎁', compass: '🧭', pin: '📍', bell: '🔔',
    calendar: '📅', clock: '⏰', person: '👤', ruler: '📏', moon: '🌗', backup: '💾', trash: '🗑️', help: '🆘', bulb: '💡', steps: '👣'
  };
  const BAN = new Set(['noSugar', 'noBread', 'noSoda']);   // تُرسم عليها علامة المنع
  const TINT = {
    fajr: '#EDE9FE', sunrise: '#FFEDD5', dhuhr: '#FEF3C7', asr: '#FFEDD5', maghrib: '#FCE7F3', isha: '#E0E7FF',
    quran: '#DCFCE7', walk: '#DBEAFE', workout: '#E0F2FE', noSugar: '#FCE7F3', noBread: '#FEF3C7', chastity: '#E0E7FF',
    water: '#CFFAFE', sleep: '#E0E7FF', default: '#F1F5F9'
  };
  const AID = { mosque: 'rawatib', shield: 'chastity', water: 'water', points: 'points' };
  const emo = (id, size) => `<span class="emo ${size || ''}">${ART.tile(AID[id] || id)}</span>`;
  const mi = id => `<span class="mi">${ART.tile(AID[id] || id)}</span>`;
  const bdg = (id, cls) => `<span class="bdg ${cls || ''}">${ART.badge(id)}</span>`;
  const I = { bulb: '' };
  const ico = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    chevL: '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg>'
  };

  /* ---------- الجوائز والنقاط ---------- */
  const CORE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'quran', 'walk', 'noSugar', 'noBread', 'chastity'];
  function coreStatus(k) {
    const D = DAYS[k] || { p: {} }, p = D.p || {};
    return {
      fajr: p.fajr === 2, dhuhr: p.dhuhr === 2, asr: p.asr === 2, maghrib: p.maghrib === 2, isha: p.isha === 2,
      quran: (D.quran || 0) >= S.quranGoal, walk: walkDone(k),
      noSugar: D.noSugar === true, noBread: D.noBread === true, chastity: D.chastity === true
    };
  }
  const isFull = k => { const s = coreStatus(k); return CORE.every(id => s[id]); };
  function dayPoints(k) {
    const D = DAYS[k]; if (!D) return 0;
    const p = D.p || {}, x = D.x || {};
    let pts = 0;
    C.prayers.forEach(pr => { pts += p[pr.id] === 2 ? 10 : p[pr.id] === 1 ? 5 : 0; });
    const s = coreStatus(k);
    ['quran', 'walk', 'noSugar', 'noBread', 'chastity'].forEach(id => { if (s[id]) pts += 10; });
    extrasFor(k).forEach(e => { const v = x[e.id]; if (e.type === 'count' ? (v || 0) >= S[e.goalKey] : v === true) pts += 5; });
    if (isFull(k)) pts += 50;
    return pts;
  }
  const MEDALS = [
    { id: 'w1', e: 'w1', name: 'وسام الأسبوع الأول', tier: 'برونزي', from: 1, to: 7, bonus: 150, rk: 'rewardW1' },
    { id: 'w2', e: 'w2', name: 'وسام الأسبوع الثاني', tier: 'فضي', from: 8, to: 14, bonus: 250, rk: 'rewardW2' },
    { id: 'w3', e: 'w3', name: 'وسام الأسبوع الثالث', tier: 'ذهبي', from: 15, to: 21, bonus: 350, rk: 'rewardW3' },
    { id: 'w4', e: 'w4', name: 'وسام الأسبوع الرابع', tier: 'ماسي', from: 22, to: 28, bonus: 500, rk: 'rewardW4' },
    { id: 'all', e: 'all', name: 'كأس التحدي', tier: '٣٠ يومًا كاملة', from: 1, to: 30, bonus: 1000, rk: 'rewardAll' }
  ];
  const LEVELS = [
    [0, 'lv0', 'بداية الطريق'], [400, 'lv1', 'مجتهد'], [1200, 'lv2', 'ملتزم'], [2500, 'lv3', 'مثابر'], [4000, 'lv4', 'بطل'], [6000, 'lv5', 'قدوة']
  ];
  const dayKeyN = i => keyOf(addDays(start(), i - 1));
  function medalProgress(m) {
    const to = Math.min(m.to, S.length);
    let full = 0; for (let i = m.from; i <= to; i++) if (dayKeyN(i) <= todayKey() && isFull(dayKeyN(i))) full++;
    return { full, need: to - m.from + 1, got: full === to - m.from + 1 };
  }
  function totals() {
    let pts = 0, stars = 0;
    for (let i = 1; i <= S.length; i++) { const k = dayKeyN(i); if (k > todayKey()) break; pts += dayPoints(k); if (isFull(k)) stars++; }
    MEDALS.forEach(m => { if (medalProgress(m).got) pts += m.bonus; });
    let li = 0; LEVELS.forEach((l, i) => { if (pts >= l[0]) li = i; });
    return { pts, stars, level: LEVELS[li], next: LEVELS[li + 1] };
  }

  /* احتفال عند إكمال يوم أو أسبوع */
  function confetti(n) {
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#A855F7', '#14B8A6', '#EF4444'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-delay:${Math.random() * .6}s;animation-duration:${1.8 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg);width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`;
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4200);
  }
  function celebrate(big, emoji, title, body, pts, reward) {
    confetti(big ? 140 : 70);
    try { NATIVE && NATIVE.vibrate && NATIVE.vibrate(big ? 60 : 30); } catch (e) {}
    sheet(`<div class="cele ${big ? 'big' : ''}"><div class="cele-e">${ART.badge(emoji)}</div><h2>${title}</h2><p>${body}</p>
      <div class="cele-pts">+${n(pts)} نقطة</div>
      ${reward ? `<div class="cele-gift">${mi('gift')} كافئ نفسك: <b>${reward.replace(/</g, '&lt;')}</b></div>` : ''}
      <button class="btn primary block" data-act="closeSheet">الحمد لله</button></div>`);
  }
  function checkRewards(k) {
    if (!inChallenge(k) || !isFull(k)) return;
    const done = Store.get('celebrated', {});
    if (done['d:' + k]) return;
    done['d:' + k] = 1;
    const dn = dayNum(k);
    const allM = MEDALS[4], weekM = MEDALS.slice(0, 4).find(m => dn >= m.from && dn <= m.to);
    if (medalProgress(allM).got && !done['m:all']) {
      done['m:all'] = 1; if (weekM && medalProgress(weekM).got) done['m:' + weekM.id] = 1;
      Store.set('celebrated', done);
      return celebrate(true, allM.e, 'أتممت التحدي كاملًا!', 'ثلاثون يومًا كاملة. تقبّل الله منك وثبّتك على الخير.', allM.bonus + 50, S[allM.rk]);
    }
    if (weekM && medalProgress(weekM).got && !done['m:' + weekM.id]) {
      done['m:' + weekM.id] = 1; Store.set('celebrated', done);
      return celebrate(true, weekM.e, `حصلت على ${weekM.name}`, `أسبوع كامل بلا تقصير — وسام ${weekM.tier}!`, weekM.bonus + 50, S[weekM.rk]);
    }
    Store.set('celebrated', done);
    const st = totals().stars;
    celebrate(false, 'starBig', 'نجمة اليوم!', `أكملت أهدافك العشرة لليوم ${n(dn)}. مجموع نجومك: ${n(st)}`, 50, '');
  }

  /* ---------- عناصر مشتركة ---------- */
  const secT = (title, trailing) => `<div class="sec"><h2>${title}</h2>${trailing || ''}</div>`;
  const yn = (act, id, v) => `<div class="yn"><button class="${v === true ? 'on-yes' : ''}" data-act="${act}" data-id="${id}" data-v="1">${ico.check}<span>التزمت</span></button><button class="${v === false ? 'on-no' : ''}" data-act="${act}" data-id="${id}" data-v="0">${ico.x}<span>لا</span></button></div>`;
  const stp = (act, id) => `<div class="stp"><button data-act="${act}" ${id ? `data-id="${id}"` : ''} data-d="-1" aria-label="إنقاص">${ico.minus}</button><button class="plus" data-act="${act}" ${id ? `data-id="${id}"` : ''} data-d="1" aria-label="زيادة">${ico.plus}</button></div>`;
  const sw = (on, act, id) => `<button class="switch ${on ? 'on' : ''}" data-act="${act}" data-id="${id}" role="switch" aria-checked="${!!on}"></button>`;
  const srow = (id, t, h, trail, act, attrs) => `<div class="srow" ${act ? `data-act="${act}"` : ''} ${attrs || ''}>${emo(id)}<div class="grow"><div class="t">${t}</div>${h ? `<div class="h">${h}</div>` : ''}</div>${trail || ''}</div>`;

  /* ========== شاشة اليوم ========== */
  function viewToday() {
    const k = viewKey, D = day(k), d = fromKey(k), isToday = k === todayKey();
    const dn = dayNum(k), t = ptimes(d), st = coreStatus(k), doneN = CORE.filter(id => st[id]).length, full = doneN === CORE.length;
    const missing = CORE.filter(id => !st[id]);
    const purity = streak(isTrue('chastity')), fire = streak(isFull);
    const q = C.quotes[((dn > 0 ? dn - 1 : d.getDate()) + C.quotes.length) % C.quotes.length];
    const tip = C.tips[(d.getDate() + d.getMonth()) % C.tips.length];
    const minK = keyOf(addDays(start(), -7));
    const tt = totals();
    const title = dn >= 1 && dn <= S.length ? `اليوم ${n(dn)}` : dn > S.length ? 'بعد التحدي' : 'يوم تجريبي';
    const km = walkKmOf(k);

    const pre = dn < 1 ? `<div class="note-card">${emo('calendar')}<div><b>يبدأ التحدي ${greg(start())}</b><span>${dn === 0 ? 'غدًا البداية!' : 1 - dn === 2 ? 'باقي يومان' : `باقي ${n(1 - dn)} أيام`} · سجّل الآن للتجربة، هذه الأيام لا تُحسب</span></div></div>` : '';

    const segs = CORE.map(id => `<i class="${st[id] ? 'on' : ''}"></i>`).join('');
    const msg = full ? `<div class="prog-msg win">حصلت على نجمة اليوم! <b>+٥٠ نقطة</b></div>`
      : `<div class="prog-msg">باقي <b>${n(missing.length)}</b> ${missing.length <= 10 && missing.length > 2 ? 'أهداف' : missing.length === 2 ? 'هدفان' : 'هدف'} لنجمة اليوم <span class="miss">${missing.map(id => mi(id)).join('')}</span></div>`;

    let next = '';
    if (isToday) {
      const np = nextPrayer();
      if (np) next = `<div class="next">${emo(np.pr.id)}<div class="grow"><div class="h">الصلاة القادمة</div><div class="t">${np.pr.name} <span>${fmtTime(np.at)}</span></div></div>
        <div class="next-c"><div class="h">بعد</div><div class="cd" id="npCount" data-at="${np.at.getTime()}">${dur(np.at - Date.now())}</div></div></div>`;
    }

    const prayers = C.prayers.map(pr => {
      const v = D.p[pr.id] || 0;
      return `<div class="prow ${v === 2 ? 'done' : ''}">${emo(pr.id)}<div class="grow"><div class="t">${pr.name}</div><div class="h">${fmtTime(t[pr.id])}</div></div>
        <div class="pseg"><button class="${v === 2 ? 'on-ok' : ''}" data-act="pset" data-id="${pr.id}" data-v="2">${ico.check}في وقتها</button><button class="${v === 1 ? 'on-late' : ''}" data-act="pset" data-id="${pr.id}" data-v="1">${ico.clock}متأخرة</button></div></div>`;
    }).join('');

    const gcard = (id, title, body, foot, done, wide) => `<div class="gcard ${done ? 'done' : ''} ${wide ? 'wide' : ''}">
      <div class="g-top">${emo(id, 'lg')}${done ? `<span class="g-ok">${ico.check}</span>` : ''}</div>
      <div class="g-t">${title}</div>${body}<div class="g-foot">${foot}</div></div>`;

    const stepsTxt = WEB ? (STEPS[k] ? `${n(STEPS[k].toLocaleString('en'))} خطوة` : '') : STEP_STATE.permitted && STEP_STATE.available ? `${n((STEPS[k] || 0).toLocaleString('en'))} خطوة` : '';
    const goals = [
      gcard('quran', 'القرآن', `<div class="g-v">${n(D.quran || 0)}<small> / ${n(S.quranGoal)} صفحة</small></div>`, stp('quran'), st.quran),
      gcard('walk', 'المشي', `<div class="g-v">${n(round1(km))}<small> / ${n(S.walkKm)} كم</small></div><div class="bar"><i style="width:${Math.min(km / S.walkKm * 100, 100)}%"></i></div>${stepsTxt ? `<div class="g-h">${stepsTxt}</div>` : (D.workout ? `<div class="g-h">+ ${n(D.workout)} دقيقة تمرين</div>` : '')}`,
        `<button class="gbtn" data-act="walkSheet">${ico.plus}إضافة</button>`, st.walk),
      gcard('noSugar', 'بدون سكر', '<div class="g-h">حلويات وعصائر ومشروبات محلّاة</div>', yn('avoid', 'noSugar', D.noSugar), st.noSugar),
      gcard('noBread', 'بدون خبز', '<div class="g-h">خبز ومعجنات</div>', yn('avoid', 'noBread', D.noBread), st.noBread),
      gcard('chastity', 'حفظ النفس', `<div class="g-h">العفّة وغضّ البصر</div>${D.chastity === false ? '<div class="slip">لا تيأس — استغفر وابدأ من جديد، تحدّيك مستمر.</div>' : ''}`,
        `${yn('avoid', 'chastity', D.chastity)}<button class="help" data-act="urge">${mi('help')} أحتاج مساعدة الآن</button>`, st.chastity, true)
    ].join('');

    const exs = extrasFor(k).map(e => {
      const v = D.x[e.id];
      if (e.type === 'count') { const g = S[e.goalKey]; return srow(e.id, e.name, `${n(v || 0)} من ${n(g)} ${e.unit}`, stp('xcount', e.id)); }
      if (e.type === 'avoid') return srow(e.id, e.name, '', `<div class="mini-yn"><button class="${v === true ? 'on-yes' : ''}" data-act="xavoid" data-id="${e.id}" data-v="1">${ico.check}</button><button class="${v === false ? 'on-no' : ''}" data-act="xavoid" data-id="${e.id}" data-v="0">${ico.x}</button></div>`);
      return srow(e.id, e.name, e.hint, `<span class="tick ${v ? 'on' : ''}">${ico.check}</span>`, 'xcheck', `data-id="${e.id}"`);
    }).join('');

    // جائزة هذا الأسبوع
    const wm = dn >= 1 && dn <= 28 ? MEDALS.find(m => dn >= m.from && dn <= m.to) : null;
    let week = '';
    if (wm) {
      const days = []; for (let i = wm.from; i <= wm.to; i++) { const kk = dayKeyN(i); days.push(`<div class="wd ${kk > todayKey() ? 'fut' : ''} ${isFull(kk) ? 'got' : ''} ${kk === k ? 'cur' : ''}"><span>${isFull(kk) ? ART.badge('starBig') : kk > todayKey() ? '' : '·'}</span><small>${n(i)}</small></div>`); }
      const mp = medalProgress(wm);
      week = `${secT('جائزة هذا الأسبوع', `<span class="sub">${n(mp.full)} / ٧</span>`)}
      <div class="card week"><div class="week-m ${mp.got ? 'got' : ''}">${ART.badge(wm.e)}</div><div class="grow"><div class="t">${wm.name}</div><div class="h">${mp.got ? 'حصلت عليه!' : `أكمل ٧ أيام كاملة هذا الأسبوع · +${n(wm.bonus)} نقطة`}</div>
      <div class="wdays">${days.join('')}</div></div></div>`;
    }

    return `
    <header class="hd">
      <div class="grow"><div class="eyebrow">${greg(d)} · ${hijri(d)}</div><h1>${title}<small>${dn >= 1 && dn <= S.length ? ` من ${n(S.length)}` : ''}</small></h1></div>
      <button class="pts" data-act="tab" data-tab="challenge">${bdg(tt.level[1])}${n(tt.pts)}</button>
    </header>
    <div class="daynav">
      <button data-act="prevDay" ${k <= minK ? 'disabled' : ''}>${ico.chevR} السابق</button>
      ${isToday ? '<span>اليوم</span>' : '<button class="today" data-act="goToday">العودة لليوم</button>'}
      <button data-act="nextDay" ${k < todayKey() ? '' : 'disabled'}>التالي ${ico.chevL}</button>
    </div>
    ${pre}
    <section class="prog ${full ? 'full' : ''}">
      <div class="prog-top">
        <div><div class="prog-n">${n(doneN)}<span> / ١٠</span></div><div class="prog-l">أهداف اليوم</div></div>
        <div class="prog-star ${full ? 'on' : ''}">${ART.badge('starBig')}</div>
      </div>
      <div class="segbar">${segs}</div>
      ${msg}
      <div class="prog-foot"><span>${mi('fire')} سلسلة ${n(fire)}</span><span>${mi('chastity')} ${n(purity)} عفّة</span><span>${mi('points')} +${n(dayPoints(k))} نقطة</span></div>
    </section>
    ${next}

    ${secT('الصلوات الخمس', `<span class="sub">${n(C.prayers.filter(p => D.p[p.id] === 2).length)} / ٥</span>`)}
    <div class="card list">${prayers}</div>

    ${secT('أهدافي اليومية')}
    <div class="ggrid">${goals}</div>

    ${week}

    ${exs ? secT('عادات إضافية', '<button class="tlink" data-act="tab" data-tab="settings">تعديل</button>') + `<div class="card list">${exs}</div>` : ''}

    ${secT('تأمّل اليوم')}
    <div class="card quote"><div class="qt">${q.t}</div><div class="qs">${q.s}</div></div>
    <div class="card tipc">${emo('bulb')}<span>${tip}</span></div>

    ${secT('ملاحظة اليوم')}
    <div class="card"><textarea id="note" placeholder="ما الذي ساعدك اليوم؟ وما الذي صعّب عليك؟">${(D.note || '').replace(/</g, '&lt;')}</textarea></div>`;
  }

  /* ========== إنجازاتي ========== */
  function viewChallenge() {
    const tt = totals(), tk = todayKey();
    const lvlPct = tt.next ? Math.min(100, (tt.pts - tt.level[0]) / (tt.next[0] - tt.level[0]) * 100) : 100;
    const medals = MEDALS.map(m => {
      const mp = medalProgress(m), r = S[m.rk];
      return `<div class="medal ${mp.got ? 'got' : ''} ${m.id === 'all' ? 'wide' : ''}"><div class="m-e">${ART.badge(m.e)}</div><div class="m-t">${m.name}</div><div class="m-h">${m.tier} · +${n(m.bonus)}</div>
        <div class="bar gold"><i style="width:${mp.full / mp.need * 100}%"></i></div><div class="m-h">${mp.got ? 'تم الحصول عليه ✓' : `${n(mp.full)} من ${n(mp.need)} أيام كاملة`}</div>
        ${r ? `<div class="m-gift">${mi('gift')} ${r.replace(/</g, '&lt;')}</div>` : ''}</div>`;
    }).join('');
    const cells = [];
    let onTime = 0, pages = 0, kms = 0, sugar = 0, bread = 0, elapsed = 0;
    for (let i = 1; i <= S.length; i++) {
      const k = dayKeyN(i), fut = k > tk, D = DAYS[k];
      const st = fut ? null : coreStatus(k), cnt = st ? CORE.filter(id => st[id]).length : 0, full = cnt === 10;
      cells.push(`<button class="dc ${fut ? 'fut' : ''} ${k === tk ? 'cur' : ''} ${full ? 'full' : ''}" data-act="openDay" data-k="${k}" ${fut ? 'disabled' : ''} style="--p:${cnt * 10}%">
        <span class="dc-e">${full ? ART.badge('starBig') : fut ? '' : n(cnt)}</span><small>${n(i)}</small></button>`);
      if (!fut) {
        elapsed++;
        if (D) { C.prayers.forEach(p => { if (D.p && D.p[p.id] === 2) onTime++; }); pages += D.quran || 0; if (D.noSugar === true) sugar++; if (D.noBread === true) bread++; }
        kms += walkKmOf(k);
      }
    }
    const purity = streak(isTrue('chastity'));
    const stat = (e, v, l) => `<div class="stat">${emo(e, 'sm')}<div class="s-v">${v}</div><div class="s-l">${l}</div></div>`;

    return `
    <header class="hd"><div class="grow"><div class="eyebrow">${elapsed ? `مضى ${n(elapsed)} من ${n(S.length)} يومًا` : `يبدأ ${greg(start())}`}</div><h1>إنجازاتي</h1></div></header>
    <section class="level">
      <div class="lv-e">${ART.badge(tt.level[1])}</div>
      <div class="grow"><div class="lv-n">${tt.level[2]}</div><div class="lv-p">${n(tt.pts)} <small>نقطة</small></div>
        <div class="bar light"><i style="width:${lvlPct}%"></i></div>
        <div class="lv-h">${tt.next ? `باقي ${n(tt.next[0] - tt.pts)} نقطة للمستوى التالي: ${tt.next[2]}` : 'أعلى مستوى! ما شاء الله'}</div></div>
    </section>
    <div class="stats3">${stat('star', n(tt.stars), 'نجوم')}${stat('fire', n(streak(isFull)), 'متتالية')}${stat('chastity', n(purity), 'أيام عفّة')}</div>

    ${secT('الأوسمة')}
    <div class="medals">${medals}</div>

    ${secT('أيام التحدي', `<span class="sub">${mi('star')} يوم كامل</span>`)}
    <div class="card"><div class="dgrid">${cells.join('')}</div><p class="foot">الرقم = عدد الأهداف المحققة من ١٠ · اضغط على يوم لفتحه</p></div>

    ${secT('أرقامك')}
    <div class="stats2">
      ${stat('rawatib', `${n(onTime)}<small>/${n(elapsed * 5)}</small>`, 'صلاة في وقتها')}
      ${stat('quran', n(pages), 'صفحة قرآن')}
      ${stat('walk', n(round1(kms)), 'كم مشي')}
      ${stat('noSugar', `${n(sugar)}<small>/${n(elapsed)}</small>`, 'يوم بلا سكر')}
      ${stat('noBread', `${n(bread)}<small>/${n(elapsed)}</small>`, 'يوم بلا خبز')}
      ${stat('points', n(tt.pts), 'مجموع النقاط')}
    </div>

    ${secT('كيف تجمع النقاط؟')}
    <div class="card list rules">
      ${srow('mosque', 'كل صلاة في وقتها', 'المتأخرة ٥ نقاط', '<b class="rp">+١٠</b>')}
      ${srow('quran', 'كل هدف من أهدافك اليومية', 'القرآن، المشي، السكر، الخبز، العفّة', '<b class="rp">+١٠</b>')}
      ${srow('water', 'كل عادة إضافية', '', '<b class="rp">+٥</b>')}
      ${srow('star', 'نجمة اليوم الكامل', 'الأهداف العشرة كلها', '<b class="rp">+٥٠</b>')}
      ${srow('trophy', 'أوسمة الأسابيع والكأس', '٧ أيام كاملة متتالية في الأسبوع', '<b class="rp">+١٥٠…١٠٠٠</b>')}
    </div>`;
  }

  /* ========== الصلاة ========== */
  function viewPrayer() {
    const now = new Date(), t = ptimes(now), np = nextPrayer(now), cur = currentPrayerId(now);
    const tomorrow = ptimes(addDays(now, 1));
    const rows = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']]
      .map(([id, nm]) => `<div class="srow ${id === cur ? 'cur' : ''}">${emo(id)}<div class="grow"><div class="t">${nm}</div>${id === cur ? '<div class="h">الوقت الحالي</div>' : ''}</div><div class="ptime">${fmtTime(t[id])}</div></div>`).join('');
    const methodOpts = Object.entries(PrayTime.METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${m.name}</option>`).join('');
    const cityOpts = CITIES.map(c => `<option value="${c[0]}" ${S.city === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('') + (S.city === 'gps' ? '<option value="gps" selected>موقعي الحالي</option>' : '');
    const adj = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(id => srow(id, C.prayers.find(p => p.id === id).name,
      S.adjust[id] ? `${n(Math.abs(S.adjust[id]))} دقيقة ${S.adjust[id] > 0 ? 'تأخير' : 'تقديم'}` : 'بدون تعديل', stp('adj', id))).join('');

    return `
    <header class="hd"><div class="grow"><div class="eyebrow">${S.placeName} · ${hijri(now)}</div><h1>مواقيت الصلاة</h1></div></header>
    ${np ? `<section class="nextbig"><div class="nb-e">${emo(np.pr.id, 'lg')}</div><div class="nb-l">باقي على صلاة ${np.pr.name}</div>
      <div class="nb-c" id="npCount" data-at="${np.at.getTime()}">${dur(np.at - now)}</div><div class="nb-l">الأذان ${fmtTime(np.at)}</div></section>` : ''}
    <div class="card list">${rows}</div>
    <div class="stats2">
      <div class="stat">${emo('fajr', 'sm')}<div class="s-v sm">${fmtTime(tomorrow.fajr)}</div><div class="s-l">فجر الغد</div></div>
      <div class="stat">${emo('compass', 'sm')}<div class="s-v sm">${n(Math.round(PrayTime.qibla(S.lat, S.lng)))}°</div><div class="s-l">القبلة من الشمال</div></div>
    </div>

    ${secT('الموقع والحساب')}
    <div class="card list">
      ${srow('pin', 'المدينة', '', `<select class="sel" data-set="city">${cityOpts}</select>`)}
      ${srow('compass', 'استخدام موقعي الحالي', 'أدق للمدن غير الموجودة', '<span class="go">تحديد</span>', 'gps')}
      ${srow('calendar', 'طريقة الحساب', '', `<select class="sel" data-set="method">${methodOpts}</select>`)}
      ${srow('asr', 'حساب العصر', '', `<select class="sel" data-set="asrFactor"><option value="1" ${S.asrFactor == 1 ? 'selected' : ''}>الجمهور</option><option value="2" ${S.asrFactor == 2 ? 'selected' : ''}>الحنفي</option></select>`)}
      ${WEB ? srow('bell', 'تنبيهات الأذان', 'تُضاف إلى تقويم جوالك', '<span class="go">إضافة</span>', 'ics') : srow('bell', 'تنبيه عند الأذان', '', sw(S.notifPrayers, 'toggle', 'notifPrayers'))}
    </div>
    ${secT('تعديل المواقيت بالدقائق')}
    <div class="card list">${adj}</div>
    <p class="foot">قدّم أو أخّر أي صلاة لتطابق مسجد حيّك.</p>`;
  }

  /* ========== الإعدادات ========== */
  function viewSettings() {
    const inp = (id, type, extra) => `<input class="inp" type="${type}" data-set="${id}" value="${(S[id] == null ? '' : S[id]).toString().replace(/"/g, '&quot;')}" ${extra || ''}>`;
    const num = (e, id, t, h, min, max, step) => srow(e, t, h, inp(id, 'number', `inputmode="decimal" min="${min}" max="${max}" step="${step || 1}"`));
    const ex = g => C.extras.filter(e => e.group === g).map(e => srow(e.id, e.name, e.hint, sw(S.extras[e.id], 'extra', e.id))).join('');
    const rw = MEDALS.map(m => `<div class="srow"><span class="emo">${ART.badge(m.e)}</span><div class="grow"><div class="t">${m.name}</div>
      <input class="inp wide" type="text" data-set="${m.rk}" value="${(S[m.rk] || '').replace(/"/g, '&quot;')}" placeholder="مثال: وجبة في مطعمي المفضّل"></div></div>`).join('');

    return `
    <header class="hd"><div class="grow"><div class="eyebrow">خصّص تحدّيك</div><h1>الإعدادات</h1></div></header>
    <div class="card list">
      ${srow('person', 'الاسم', '', inp('name', 'text', 'placeholder="اختياري"'))}
      ${srow('calendar', 'بداية التحدي', '', inp('startDate', 'date'))}
      ${num('trophy', 'length', 'مدة التحدي', 'بالأيام', 7, 90)}
    </div>

    ${secT('الأهداف اليومية')}
    <div class="card list">
      ${num('quran', 'quranGoal', 'صفحات القرآن', 'الجزء = ٢٠ صفحة', 1, 40)}
      ${num('walk', 'walkKm', 'مسافة المشي (كم)', '', 1, 30, .5)}
      ${num('workout', 'workoutMin', 'أو دقائق تمرين', 'بديل عن المشي', 10, 180, 5)}
      ${num('steps', 'strideCm', 'طول الخطوة (سم)', 'تقريبًا: طولك × ٠٫٤١٥', 40, 120)}
      ${num('water', 'waterGoal', 'أكواب الماء', '', 4, 16)}
    </div>

    ${secT('مكافآتك الشخصية')}
    <p class="foot" style="margin:-4px 6px 8px">اكتب ما ستكافئ به نفسك عند كل وسام، وسيظهر لك عند الحصول عليه.</p>
    <div class="card list">${rw}</div>

    ${secT('عبادات إضافية')}
    <div class="card list">${ex('deen')}</div>
    ${secT('عادات صحية إضافية')}
    <div class="card list">${ex('health')}</div>

    ${secT('التنبيهات')}
    <div class="card list">
      ${WEB ? srow('bell', 'إضافة المواقيت إلى التقويم', `تنبيه عند كل أذان لمدينة ${S.placeName}`, '<span class="go">إضافة</span>', 'ics')
        : srow('bell', 'تنبيه عند كل أذان', '', sw(S.notifPrayers, 'toggle', 'notifPrayers'))}
      ${srow('clock', 'التذكير المسائي', '', sw(S.notifEvening, 'toggle', 'notifEvening'))}
      ${srow('clock', 'وقت التذكير', '', inp('eveningTime', 'time'))}
      ${WEB ? srow('steps', 'ربط خطوات الآيفون', 'من تطبيق الصحة', '<span class="go">الطريقة</span>', 'shortcutHelp')
        : srow('bell', 'السماح بالإشعارات', '', '<span class="go">السماح</span>', 'notifPerm')}
    </div>

    ${secT('المظهر والبيانات')}
    <div class="card list">
      ${srow('moon', 'الوضع', '', `<select class="sel" data-set="theme"><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>تلقائي</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>فاتح</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>داكن</option></select>`)}
      ${srow('backup', 'تصدير نسخة احتياطية', '', '<span class="go">تصدير</span>', 'export')}
      ${srow('backup', 'استيراد نسخة', '', '<span class="go">استيراد</span>', 'import')}
      ${srow('trash', 'مسح كل البيانات', '', '<span class="go red">مسح</span>', 'reset')}
    </div>
    <p class="foot center">تحدي ٣٠ يوم · بياناتك محفوظة على جهازك فقط</p>`;
  }

  /* ---------- الرسم ---------- */
  function render() {
    const v = $('#view');
    const html = tab === 'today' ? viewToday() : tab === 'challenge' ? viewChallenge() : tab === 'prayer' ? viewPrayer() : viewSettings();
    v.innerHTML = html;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const note = $('#note');
    if (note) note.addEventListener('input', () => { day(viewKey).note = note.value; saveD(); });
  }
  function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function sheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; }
  function closeSheet() { $('#sheet').hidden = true; }
  const haptic = () => { try { NATIVE && NATIVE.vibrate && NATIVE.vibrate(12); } catch (e) {} };

  /* ---------- الأحداث ---------- */
  const actions = {
    tab: el => { tab = el.dataset.tab; if (tab === 'today') viewKey = todayKey(); render(); window.scrollTo(0, 0); },
    prevDay: () => { viewKey = keyOf(addDays(fromKey(viewKey), -1)); render(); },
    nextDay: () => { if (viewKey < todayKey()) { viewKey = keyOf(addDays(fromKey(viewKey), 1)); render(); } },
    goToday: () => { viewKey = todayKey(); render(); },
    openDay: el => { viewKey = el.dataset.k; tab = 'today'; render(); window.scrollTo(0, 0); },
    pset: el => {
      const D = day(viewKey), id = el.dataset.id, v = +el.dataset.v;
      D.p[id] = D.p[id] === v ? 0 : v; saveD(); haptic(); rerender();
    },
    walkSheet: () => sheet(`<div class="sh-h">${emo('walk', 'lg')}<h2>المشي والرياضة</h2></div><p>هدفك ${n(S.walkKm)} كم مشي، أو ${n(S.workoutMin)} دقيقة من أي تمرين آخر.</p>
      <div class="sh-l">أضف مسافة مشيتها</div>
      <div class="chips">${[0.5, 1, 2, 3, 5].map(v => `<button class="chipb" data-act="km" data-v="${v}">+${n(v)} كم</button>`).join('')}</div>
      <div class="sh-l">أو سجّل تمرينًا</div>
      <div class="chips">${[15, 30, 45, 60].map(v => `<button class="chipb" data-act="wo" data-v="${v}">+${n(v)} دقيقة</button>`).join('')}</div>
      ${WEB ? '<button class="btn ghost block mt" data-act="shortcutHelp">ربط خطوات الآيفون تلقائيًا</button>' : ''}
      <button class="btn ghost block mt" data-act="resetWalk">تصفير ما أضفته يدويًا</button>`),
    resetWalk: () => { const D = day(viewKey); D.walkKm = 0; D.workout = 0; saveD(); closeSheet(); rerender(); },
    prayer: el => {
      const D = day(viewKey), id = el.dataset.id, v = D.p[id] || 0;
      D.p[id] = v === 0 ? 2 : v === 2 ? 1 : 0; saveD(); haptic(); rerender();
      if (D.p[id] === 2 && C.prayers.every(p => D.p[p.id] === 2)) toast('الصلوات الخمس في وقتها، تقبّل الله');
    },
    quran: el => {
      const D = day(viewKey), d = +el.dataset.d, nv = Math.max(0, (D.quran || 0) + d);
      if (nv !== (D.quran || 0)) { BOOK = Math.min(604, Math.max(1, BOOK + d)); Store.set('quranPage', BOOK); }
      D.quran = nv; saveD(); haptic(); rerender();
      if (d > 0 && nv === S.quranGoal) toast('حققت وِردك اليوم، بارك الله فيك');
      if (BOOK === 604 && d > 0) toast('ختمت القرآن! تقبّل الله منك');
    },
    setBook: () => sheet(`<h2>أين وصلت في المصحف؟</h2><p>رقم الصفحة في مصحف المدينة (١–٦٠٤)</p>
      <input id="bookIn" type="number" inputmode="numeric" min="1" max="604" value="${BOOK}" style="width:100%;height:50px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);text-align:center;font-size:22px">
      <button class="btn primary block mt" data-act="saveBook">حفظ</button>`),
    saveBook: () => { const v = Math.round(+$('#bookIn').value); if (v >= 1 && v <= 604) { BOOK = v; Store.set('quranPage', BOOK); } closeSheet(); rerender(); },
    avoid: el => { const D = day(viewKey), v = el.dataset.v === '1'; D[el.dataset.id] = D[el.dataset.id] === v ? null : v; saveD(); haptic(); rerender(); },
    xavoid: el => { const D = day(viewKey), v = el.dataset.v === '1'; D.x[el.dataset.id] = D.x[el.dataset.id] === v ? null : v; saveD(); haptic(); rerender(); },
    xcheck: el => { const D = day(viewKey); D.x[el.dataset.id] = !D.x[el.dataset.id]; saveD(); haptic(); rerender(); },
    xcount: el => { const D = day(viewKey); D.x[el.dataset.id] = Math.max(0, (D.x[el.dataset.id] || 0) + +el.dataset.d); saveD(); haptic(); rerender(); },
    addKm: () => sheet(`<h2>إضافة مسافة يدويًا</h2><p>إذا مشيت بدون الجوال أو على جهاز المشي.</p>
      <div class="inline-actions">${[0.5, 1, 2, 3, 5].map(v => `<button class="btn" data-act="km" data-v="${v}">+${n(v)} كم</button>`).join('')}</div>
      <button class="btn ghost block mt" data-act="km" data-v="0">تصفير المسافة اليدوية</button>`),
    km: el => { const D = day(viewKey), v = +el.dataset.v; D.walkKm = v ? round1((D.walkKm || 0) + v) : 0; saveD(); closeSheet(); rerender(); },
    workout: () => sheet(`<h2>تمرين آخر</h2><p>جري، نادي، سباحة، كرة… كم دقيقة تمرّنت؟ (${n(S.workoutMin)} دقيقة تحقق الهدف)</p>
      <div class="inline-actions">${[15, 30, 45, 60].map(v => `<button class="btn" data-act="wo" data-v="${v}">+${n(v)} د</button>`).join('')}</div>
      <button class="btn ghost block mt" data-act="wo" data-v="0">تصفير</button>`),
    wo: el => { const D = day(viewKey), v = +el.dataset.v; D.workout = v ? (D.workout || 0) + v : 0; saveD(); closeSheet(); rerender(); },
    urge: () => sheet(`<h2>أنت أقوى من هذه اللحظة</h2><p>الرغبة موجة تعلو ثم تهدأ خلال دقائق. اختر خطوة الآن:</p>
      ${C.urge.map(u => `<div class="urge"><h4>${u.h}</h4><div>${u.b}</div></div>`).join('')}
      <div class="card quote mt"><div class="qt">وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا</div><div class="qs">الطلاق: ٢</div></div>
      <button class="btn primary block" data-act="closeSheet">سأصمد بإذن الله</button>`),
    closeSheet,
    stepPerm: () => { try { NATIVE.requestSteps(); } catch (e) {} },
    notifPerm: () => { try { NATIVE.requestNotifications(); } catch (e) {} },
    gps: () => {
      toast('جارٍ تحديد الموقع…');
      if (NATIVE) { try { NATIVE.requestLocation(); } catch (e) {} return; }
      if (!navigator.geolocation) return toast('المتصفح لا يدعم تحديد الموقع');
      navigator.geolocation.getCurrentPosition(
        p => window.onNative('location', { lat: p.coords.latitude, lng: p.coords.longitude }),
        () => window.onNative('location', null), { timeout: 15000, maximumAge: 3600000 });
    },
    ics: () => {
      const from = start() > new Date() ? start() : fromKey(todayKey());
      const left = Math.max(7, S.length - Math.max(0, dayNum(todayKey()) - 1));
      const url = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(buildIcs(from, left));
      const a = document.createElement('a');
      a.href = url;
      if (!IOS) a.download = 'tahadi30-prayer-times.ics';
      document.body.appendChild(a); a.click(); a.remove();
      if (IOS) toast('اختر «إضافة الكل» لتصلك التنبيهات');
    },
    shortcutHelp: () => sheet(`<h2>ربط خطوات الآيفون</h2>
      <p>تطبيقات الويب لا تقرأ الخطوات مباشرة، لكن اختصارًا صغيرًا يقرأها من تطبيق «الصحة» ويفتح التحدي بها. تجهيزه مرة واحدة:</p>
      <div class="urge"><h4>١. اختصار جديد</h4><div>افتح تطبيق «الاختصارات» ← زر ＋ ← سمِّه «تحدي ٣٠».</div></div>
      <div class="urge"><h4>٢. العثور على عينات الصحة</h4><div>أضف إجراء <b>Find Health Samples</b>: النوع = <b>الخطوات</b>، وتاريخ البدء = <b>اليوم</b>. إن كانت عندك ساعة Apple أضف شرط: المصدر = iPhone حتى لا تُحسب الخطوات مرتين.</div></div>
      <div class="urge"><h4>٣. المجموع</h4><div>أضف <b>Calculate Statistics</b> واختر <b>Sum</b>، ثم <b>Round Number</b>.</div></div>
      <div class="urge"><h4>٤. فتح التحدي</h4><div>أضف إجراء <b>URL</b> واكتب الرابط التالي، ثم ضع بعده متغيّر «الرقم المقرّب»، ثم أضف <b>Open URLs</b>:</div>
        <div class="card mt" style="direction:ltr;text-align:left;font-family:monospace;font-size:13px;word-break:break-all;-webkit-user-select:text;user-select:text">${appUrl()}?steps=</div>
        <button class="btn block" data-act="copyUrl">نسخ الرابط</button></div>
      <div class="urge"><h4>٥. على الشاشة الرئيسية</h4><div>من تفاصيل الاختصار ← «إضافة إلى الشاشة الرئيسية». <b>افتح التحدي دائمًا من هذه الأيقونة</b> فتتحدّث خطواتك تلقائيًا. (لا تستخدم معها أيقونة «إضافة إلى الشاشة الرئيسية» من Safari لأن بياناتها منفصلة.)</div></div>
      <button class="btn primary block mt" data-act="closeSheet">تم</button>`),
    copyUrl: () => { try { navigator.clipboard.writeText(appUrl() + '?steps='); toast('نُسخ الرابط'); } catch (e) { toast('انسخ الرابط يدويًا'); } },
    adj: el => { S.adjust[el.dataset.id] += +el.dataset.d; saveS(); scheduleNotifs(); rerender(); },
    toggle: el => { S[el.dataset.id] = !S[el.dataset.id]; saveS(); scheduleNotifs(); rerender(); },
    extra: el => { S.extras[el.dataset.id] = !S.extras[el.dataset.id]; saveS(); rerender(); },
    export: () => {
      const data = JSON.stringify({ settings: S, days: DAYS, quranPage: BOOK, v: 1 });
      if (NATIVE && NATIVE.share) NATIVE.share(data);
      else if (navigator.share) navigator.share({ title: 'نسخة احتياطية — تحدي ٣٠ يوم', text: data }).catch(() => {});
      else { navigator.clipboard && navigator.clipboard.writeText(data); toast('نُسخت البيانات'); }
    },
    import: () => sheet(`<h2>استيراد البيانات</h2><p>الصق النص الذي صدّرته سابقًا.</p><textarea id="impIn" style="min-height:140px;direction:ltr"></textarea><button class="btn primary block mt" data-act="doImport">استيراد</button>`),
    doImport: () => {
      try {
        const o = JSON.parse($('#impIn').value);
        if (o.settings) { S = Object.assign({}, DEFAULTS, o.settings); saveS(); }
        if (o.days) { DAYS = o.days; saveD(); }
        if (o.quranPage) { BOOK = o.quranPage; Store.set('quranPage', BOOK); }
        closeSheet(); applyTheme(); scheduleNotifs(); render(); toast('تم الاستيراد');
      } catch (e) { toast('النص غير صالح'); }
    },
    reset: () => sheet(`<h2>مسح كل البيانات؟</h2><p>سيُحذف كل ما سجّلته ولا يمكن التراجع.</p><button class="btn danger block" data-act="doReset">نعم، امسح الكل</button><button class="btn block mt" data-act="closeSheet">إلغاء</button>`),
    doReset: () => { DAYS = {}; saveD(); BOOK = 1; Store.set('quranPage', 1); closeSheet(); render(); toast('تم المسح'); },
    onbDone: () => { S.onboarded = true; saveS(); closeSheet(); try { NATIVE && NATIVE.requestNotifications(); } catch (e) {} },
    onbSteps: el => { try { NATIVE && NATIVE.requestSteps(); } catch (e) {} el.textContent = 'تم ✓'; }
  };

  document.addEventListener('click', e => {
    const tabBtn = e.target.closest('#tabs button');
    if (tabBtn) return actions.tab(tabBtn);
    const el = e.target.closest('[data-act]');
    if (el && !el.disabled && actions[el.dataset.act]) actions[el.dataset.act](el);
  });

  document.addEventListener('change', e => {
    const el = e.target, id = el.dataset && el.dataset.set; if (!id) return;
    let v = el.value;
    if (el.type === 'number') { v = +v; if (!(v > 0)) return; if (id === 'length' || id === 'waterGoal' || id === 'quranGoal') v = Math.round(v); }
    if (id === 'asrFactor') v = +v;
    if (id === 'city') {
      const c = CITIES.find(c => c[0] === v); if (!c) return;
      S.lat = c[2]; S.lng = c[3]; S.placeName = c[1];
    }
    if (id === 'startDate' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    S[id] = v; saveS();
    if (id === 'theme') applyTheme();
    if (['city', 'method', 'asrFactor', 'eveningTime', 'startDate'].includes(id)) scheduleNotifs();
    if (el.tagName === 'SELECT' || id === 'startDate') rerender();
  });

  /* ---------- من أندرويد ---------- */
  window.onNative = function (ev, data) {
    if (ev === 'steps' || ev === 'resume') { refreshSteps(); if (ev === 'resume' && viewKey > todayKey()) viewKey = todayKey(); if (tab === 'today' || tab === 'challenge') rerender(); }
    if (ev === 'resume') scheduleNotifs();
    if (ev === 'location') {
      if (data && data.lat != null) { S.lat = data.lat; S.lng = data.lng; S.city = 'gps'; S.placeName = 'موقعي الحالي'; saveS(); scheduleNotifs(); toast('تم تحديث الموقع'); rerender(); }
      else toast('تعذّر تحديد الموقع — فعّل الـ GPS');
    }
    if (ev === 'perm') { refreshSteps(); rerender(); }
  };
  window.onBack = function () {
    if (!$('#sheet').hidden) { closeSheet(); return true; }
    if (tab !== 'today') { actions.tab({ dataset: { tab: 'today' } }); return true; }
    if (viewKey !== todayKey()) { viewKey = todayKey(); render(); return true; }
    return false;
  };

  // عدّاد تنازلي
  setInterval(() => {
    const el = $('#npCount'); if (!el) return;
    const at = +el.dataset.at, left = at - Date.now();
    if (left <= 0) { rerender(); return; }
    el.textContent = dur(left);
  }, 1000);
  // تغيّر اليوم عند منتصف الليل
  let lastDay = todayKey();
  setInterval(() => { const k = todayKey(); if (k !== lastDay) { if (viewKey === lastDay) viewKey = k; lastDay = k; refreshSteps(); render(); } }, 30000);
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  /* ---------- البدء ---------- */
  ART.mount();
  applyTheme();
  if (intakeWebSteps()) setTimeout(() => toast('تم تحديث خطواتك من تطبيق الصحة'), 400);
  refreshSteps();
  if (WEB && location.protocol === 'https:') {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }
  render();
  scheduleNotifs();
  if (!S.onboarded) {
    sheet(`<h2>بسم الله، أهلًا بك</h2>
      <p>هذا تحدّيك لمدة ٣٠ يومًا يبدأ <b style="color:var(--green)">${greg(start())}</b>: الصلوات في وقتها، وِرد من القرآن، مشي ٥ كم أو تمرين، بدون سكر ولا خبز، وحفظ النفس.</p>
      <div class="urge"><h4>١. سجّل كل يوم</h4><div>اضغط على الصلاة عند أدائها، وسجّل الباقي في المساء.</div></div>
      ${NATIVE ? `<div class="urge"><h4>٢. التنبيهات</h4><div>يصلك تنبيه عند كل أذان وتذكير مسائي. (المدينة الافتراضية: مسقط — غيّرها من تبويب الصلاة)</div></div>
      <div class="urge" style="display:flex;align-items:center;gap:10px"><div style="flex:1"><h4>٣. عدّاد الخطوات</h4><div>يحسب مشيك تلقائيًا من حسّاس الجوال.</div></div><button class="btn" data-act="onbSteps">تفعيل</button></div>`
      : `<div class="urge" style="display:flex;align-items:center;gap:10px"><div style="flex:1"><h4>٢. تنبيهات الأذان</h4><div>أضف مواقيت ٣٠ يومًا (مسقط) إلى تقويم جوالك مع تنبيه عند كل أذان. غيّر المدينة أولًا من تبويب الصلاة إن لزم.</div></div><button class="btn" data-act="ics">إضافة</button></div>
      <div class="urge" style="display:flex;align-items:center;gap:10px"><div style="flex:1"><h4>٣. خطوات المشي</h4><div>اربطها بتطبيق «الصحة» عبر اختصار بسيط، أو أضف المسافة يدويًا.</div></div><button class="btn" data-act="shortcutHelp">الطريقة</button></div>`}
      <div class="card quote mt"><div class="qt">«أحبُّ الأعمال إلى الله أدومها وإن قلّ»</div><div class="qs">متفق عليه</div></div>
      <button class="btn primary block" data-act="onbDone">لنبدأ</button>`);
  }
})();
