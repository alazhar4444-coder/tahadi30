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
  if (S.ui !== 7) { Object.keys(S.extras).forEach(k => S.extras[k] = false); S.ui = 7; }
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
    if (NATIVE && NATIVE.setBars) try { NATIVE.setBars(dark ? '#0E1114' : '#F6F7F9', !dark); } catch (e) {}
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
      quran: (D.quran || 0) >= S.quranGoal, walk: walkDone(k) || D.wDone === true,
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
    sheet(`<div class="cele ${big ? 'big' : ''}"><div class="cele-stage"><span class="rays"></span><div class="cele-e">${ART.badge(emoji)}</div></div><h2>${title}</h2><p>${body}</p>
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

  /* صفّ مهمة: الضغط في أي مكان يحقّقها */
  let JUST = '';
  const task = (id, title, sub, done, kind, extra) => `<div class="task ${done ? 'done' : ''} ${JUST === id ? 'just' : ''}" data-act="tick" data-kind="${kind}" data-id="${id}" role="checkbox" aria-checked="${done}">
      ${emo(id)}<div class="grow"><div class="t">${title}</div>${sub ? `<div class="h">${sub}</div>` : ''}</div>${extra || ''}
      <span class="chk">${ico.check}</span></div>`;

  /* ========== شاشة اليوم ========== */
  function viewToday(anim) {
    const k = viewKey, D = day(k), d = fromKey(k), isToday = k === todayKey();
    const dn = dayNum(k), t = ptimes(d), st = coreStatus(k);
    const doneN = CORE.filter(id => st[id]).length, full = doneN === CORE.length;
    const minK = keyOf(addDays(start(), -7));
    const title = !isToday ? greg(d).split('،')[0] : dn >= 1 && dn <= S.length ? `اليوم ${n(dn)} من ${n(S.length)}` : 'اليوم';
    const sub = dn < 1 ? `التحدي يبدأ ${greg(start())} · هذه الأيام للتجربة` : `${greg(d)} · ${hijri(d)}`;
    const km = walkKmOf(k);
    const q = C.quotes[((dn > 0 ? dn - 1 : d.getDate()) + C.quotes.length) % C.quotes.length];

    const npx = isToday ? nextPrayer() : null;
    const prayers = C.prayers.map(pr => task(pr.id, pr.name, fmtTime(t[pr.id]), st[pr.id], 'prayer', npx && npx.pr.id === pr.id && !st[pr.id] ? '<span class="soon">القادمة</span>' : '')).join('');
    const walkSub = STEPS[k] || D.walkKm ? `${n(round1(km))} من ${n(S.walkKm)} كم` : `${n(S.walkKm)} كم أو ${n(S.workoutMin)} دقيقة رياضة`;
    const goals = [
      task('quran', 'قراءة القرآن', `${n(S.quranGoal)} ${S.quranGoal === 1 ? 'صفحة' : S.quranGoal === 2 ? 'صفحتان' : 'صفحات'} على الأقل`, st.quran, 'quran'),
      task('walk', 'المشي أو الرياضة', walkSub, st.walk, 'walk'),
      task('noSugar', 'بدون سكر', 'لا حلويات ولا مشروبات محلّاة', st.noSugar, 'avoid'),
      task('noBread', 'بدون خبز', '', st.noBread, 'avoid'),
      task('chastity', 'حفظ النفس', 'العفّة وغضّ البصر', st.chastity, 'avoid', `<button class="mini-help" data-act="urge">مساعدة</button>`)
    ].join('');
    const ex = extrasFor(k).map(e => task(e.id, e.name, e.type === 'count' ? `${n(S[e.goalKey])} ${e.unit}` : '', e.type === 'count' ? (D.x[e.id] || 0) >= S[e.goalKey] : D.x[e.id] === true, 'extra')).join('');

    PREV = { k, n: doneN };
    return `
    <header class="hd">
      <div class="grow"><h1>${title}</h1><div class="sub">${sub}</div></div>
      <div class="arrows">
        <button data-act="prevDay" ${k <= minK ? 'disabled' : ''} aria-label="اليوم السابق">${ico.chevR}</button>
        <button data-act="nextDay" ${k < todayKey() ? '' : 'disabled'} aria-label="اليوم التالي">${ico.chevL}</button>
      </div>
    </header>
    ${!isToday ? '<button class="back" data-act="goToday">العودة إلى اليوم</button>' : ''}

    ${skyCard(isToday, doneN, full, anim || PREV.k !== k ? 0 : PREV.n)}

    <h2 class="label">الصلوات في وقتها</h2>
    <div class="box">${prayers}</div>

    <h2 class="label">أهدافي</h2>
    <div class="box">${goals}</div>

    ${ex ? `<h2 class="label">إضافي</h2><div class="box">${ex}</div>` : ''}

    <div class="ayah">${q.t}<span>${q.s}</span></div>`;
  }

  /* ========== إنجازاتي ========== */
  function viewChallenge() {
    const tk = todayKey(), tt = totals();
    const medals = MEDALS.map(m => {
      const mp = medalProgress(m), r = S[m.rk];
      return `<div class="mrow ${mp.got ? 'got' : ''}"><span class="m-b">${ART.badge(m.e)}</span>
        <div class="grow"><div class="t">${m.name}</div><div class="h">${mp.got ? 'حصلت عليه' : `${n(mp.full)} من ${n(mp.need)} أيام كاملة`}${r ? ` · مكافأتك: ${r.replace(/</g, '&lt;')}` : ''}</div>
        <div class="m-bar"><i data-w="${mp.full / mp.need * 100}" style="width:0"></i></div></div></div>`;
    }).join('');
    const cells = [];
    for (let i = 1; i <= S.length; i++) {
      const k = dayKeyN(i), fut = k > tk, st = fut ? null : coreStatus(k), cnt = st ? CORE.filter(id => st[id]).length : 0;
      cells.push(`<button style="--d:${i}" class="dc ${fut ? 'fut' : ''} ${k === tk ? 'cur' : ''} ${cnt === 10 ? 'full' : ''}" data-act="openDay" data-k="${k}" ${fut ? 'disabled' : ''}>${cnt === 10 ? ART.badge('starBig') : `<span>${n(i)}</span>`}</button>`);
    }
    return `
    <header class="hd"><div class="grow"><h1>إنجازاتي</h1><div class="sub">نجمة لكل يوم كامل، ووسام لكل أسبوع كامل</div></div></header>
    <div class="big-stats">
      <div><b class="cu" data-n="${tt.stars}">٠</b><span>نجوم</span></div>
      <div><b class="cu" data-n="${streak(isFull)}">٠</b><span>أيام متتالية</span></div>
      <div><b class="cu" data-n="${streak(isTrue('chastity'))}">٠</b><span>أيام عفّة</span></div>
    </div>
    <h2 class="label">أيام التحدي</h2>
    <div class="box pad"><div class="dgrid">${cells.join('')}</div></div>
    <h2 class="label">الأوسمة</h2>
    <div class="box">${medals}</div>`;
  }

  /* ========== الصلاة ========== */
  function viewPrayer() {
    const now = new Date(), t = ptimes(now), np = nextPrayer(now), cur = currentPrayerId(now);
    const cityOpts = CITIES.map(c => `<option value="${c[0]}" ${S.city === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('') + (S.city === 'gps' ? '<option value="gps" selected>موقعي الحالي</option>' : '');
    const rows = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']]
      .map(([id, nm]) => `<div class="prow ${id === cur ? 'cur' : ''} ${np && np.pr.id === id ? 'nxt' : ''}">${emo(id)}<div class="grow t">${nm}</div><div class="tm">${fmtTime(t[id])}</div></div>`).join('');
    return `
    <header class="hd"><div class="grow"><h1>الصلاة</h1><div class="sub">${hijri(now)}</div></div>
      <select class="city" data-set="city" aria-label="المدينة">${cityOpts}</select></header>
    ${np ? (() => { const pv = prevPrayerTime(now), f = Math.max(0, Math.min(1, (now - pv) / (np.at - pv))), C2 = 2 * Math.PI * 118;
      return `<section class="countdown"><svg class="cd-ring" viewBox="0 0 260 260"><circle cx="130" cy="130" r="118" class="cr-t"/><circle id="cdRing" data-from="${pv.getTime()}" data-to="${np.at.getTime()}" cx="130" cy="130" r="118" class="cr-f" style="stroke-dasharray:${C2};stroke-dashoffset:${C2 * (1 - f)}"/></svg>
      <div class="cd-in">${emo(np.pr.id)}<div>باقي على ${np.pr.name}</div><div class="cd" id="npCount" data-at="${np.at.getTime()}">${dur(np.at - now)}</div><div class="cd-at">${fmtTime(np.at)}</div></div></section>`; })() : ''}
    <div class="box">${rows}</div>
    <div class="tools">
      <button class="tool" data-act="tasbih">${emo('adhkarAM')}<b>المسبحة</b><span>عدّاد الأذكار</span></button>
      <button class="tool" data-act="qibla">${emo('compass')}<b>القبلة</b><span>${n(Math.round(PrayTime.qibla(S.lat, S.lng)))}° من الشمال</span></button>
    </div>
    ${WEB ? '<button class="wide-btn" data-act="ics">إضافة تنبيهات الأذان إلى التقويم</button>' : ''}`;
  }

  function prevPrayerTime(now) {
    let best = null;
    for (let i = -1; i <= 0; i++) { const t = ptimes(addDays(now, i)); C.prayers.forEach(pr => { if (t[pr.id] && t[pr.id] <= now && (!best || t[pr.id] > best)) best = t[pr.id]; }); }
    return best || new Date(now.getTime() - 3600000);
  }
  /* ---------- السماء الحيّة ---------- */
  function period(now) {
    const t = ptimes(now);
    if (now < t.fajr) return 'isha';
    if (now < t.sunrise) return 'fajr';
    if (now < t.dhuhr) return 'sunrise';
    if (now < t.asr) return 'dhuhr';
    if (now < t.maghrib) return 'asr';
    if (now < t.isha) return 'maghrib';
    return 'isha';
  }
  function skyCard(isToday, doneN, full, prevN) {
    const now = new Date(), per = isToday ? period(now) : 'day', np = isToday ? nextPrayer(now) : null;
    const morning = per === 'fajr' || per === 'sunrise';
    const hi = isToday ? `${morning ? 'صباح الخير' : 'مساء الخير'}${S.name ? ' يا ' + S.name : ''}` : 'سجل هذا اليوم';
    const msg = full ? 'أحسنت! حصلت على نجمة اليوم' : `أكمل ${n(10 - doneN)} ${10 - doneN === 1 ? 'هدفًا' : 'أهداف'} لتحصل على نجمة اليوم`;
    const night = per === 'isha' || per === 'fajr';
    const deco = night ? '<i class="st s1"></i><i class="st s2"></i><i class="st s3"></i><i class="st s4"></i><i class="st s5"></i><i class="shoot"></i>'
      : '<i class="cl c1"></i><i class="cl c2"></i>';
    return `<section class="sky sky-${per}">${deco}<span class="orb"></span>
      <div class="sky-top">
        <div class="grow"><div class="sky-hi">${hi}</div>
          ${np ? `<div class="sky-next">${np.pr.name} بعد <b id="npCount" data-at="${np.at.getTime()}">${dur(np.at - now)}</b></div>` : ''}</div>
        ${isToday ? `<span class="sky-ic">${ART.tile(per)}</span>` : ''}
      </div>
      <div class="sky-prog">
        <div class="sp-row"><span><b class="cu" data-n="${doneN}" data-from="${prevN}">${n(prevN)}</b> من ١٠ أهداف</span><span class="sp-star ${full ? 'on' : ''}">${ART.badge('starBig')}</span></div>
        <div class="sp-bar"><i data-w="${doneN * 10}" style="width:${prevN * 10}%"></i></div>
        <div class="sp-msg">${msg}</div>
      </div></section>`;
  }

  /* ---------- المسبحة ---------- */
  const DHIKR = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'اللهم صلِّ على محمد'];
  const TB = Object.assign({ i: 0, c: 0, goal: 33 }, Store.get('tasbih', {}));
  function tbPaint() {
    const r = 92, c = 2 * Math.PI * r, f = Math.min(TB.c / TB.goal, 1);
    const ring = document.getElementById('tbRing'); if (!ring) return;
    ring.style.strokeDashoffset = c * (1 - f);
    document.getElementById('tbN').textContent = n(TB.c);
    document.getElementById('tbD').textContent = DHIKR[TB.i];
    document.getElementById('tbG').textContent = TB.c >= TB.goal ? 'اكتمل ✓ اضغط «التالي»' : `من ${n(TB.goal)}`;
    document.querySelectorAll('[data-act=tbGoal]').forEach(b => b.classList.toggle('on', +b.dataset.v === TB.goal));
    document.querySelector('.tb-btn').classList.toggle('done', TB.c >= TB.goal);
    Store.set('tasbih', TB);
  }

  /* ---------- القبلة ---------- */
  let QH = null;
  function qStop() { if (QH) { window.removeEventListener('deviceorientationabsolute', QH, true); window.removeEventListener('deviceorientation', QH, true); QH = null; } }
  function qStart() {
    const qb = PrayTime.qibla(S.lat, S.lng); let hit = false, got = false;
    QH = e => {
      let h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null ? 360 - e.alpha : null;
      if (h == null) return; got = true;
      const rose = document.getElementById('qRose'), nd = document.getElementById('qNeedle'), msg = document.getElementById('qMsg');
      if (!rose) return qStop();
      rose.style.transform = `rotate(${-h}deg)`;
      const diff = ((qb - h) % 360 + 540) % 360 - 180;
      nd.style.transform = `rotate(${qb - h}deg)`;
      const ok = Math.abs(diff) < 5;
      document.querySelector('.q-dial').classList.toggle('ok', ok);
      msg.textContent = ok ? 'أنت باتجاه القبلة ✓' : diff > 0 ? 'استدر يمينًا' : 'استدر يسارًا';
      if (ok && !hit) { hit = true; haptic(); } if (!ok) hit = false;
    };
    const go = () => {
      window.addEventListener('deviceorientationabsolute', QH, true); window.addEventListener('deviceorientation', QH, true);
      setTimeout(() => { if (!got && document.getElementById('qMsg')) document.getElementById('qMsg').textContent = 'البوصلة غير متاحة على هذا الجهاز — استخدم الزاوية أعلاه'; }, 3000);
    };
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function')
      DeviceOrientationEvent.requestPermission().then(r => r === 'granted' ? go() : (document.getElementById('qMsg').textContent = 'اسمح بالوصول إلى الحركة لتعمل البوصلة')).catch(() => {});
    else go();
    const b = document.getElementById('qBtn'); if (b) b.style.display = 'none';
    document.getElementById('qMsg').textContent = 'أمسك الجوال بشكل أفقي…';
  }

  /* ========== الإعدادات ========== */
  function viewSettings() {
    const inp = (id, type, extra) => `<input class="inp" type="${type}" data-set="${id}" value="${(S[id] == null ? '' : S[id]).toString().replace(/"/g, '&quot;')}" ${extra || ''}>`;
    const row = (t, trail, h) => `<div class="set"><div class="grow"><div class="t">${t}</div>${h ? `<div class="h">${h}</div>` : ''}</div>${trail}</div>`;
    const num = (id, t, min, max, step, h) => row(t, inp(id, 'number', `inputmode="decimal" min="${min}" max="${max}" step="${step || 1}"`), h);
    const link = (t, act, red) => `<div class="set link ${red ? 'red' : ''}" data-act="${act}">${t}</div>`;
    const methodOpts = Object.entries(PrayTime.METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${m.name}</option>`).join('');
    const adj = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(id => row(C.prayers.find(p => p.id === id).name,
      `<div class="stp"><button data-act="adj" data-id="${id}" data-d="-1">${ico.minus}</button><span>${n(S.adjust[id])}</span><button data-act="adj" data-id="${id}" data-d="1">${ico.plus}</button></div>`)).join('');
    const exs = C.extras.map(e => row(e.name, sw(S.extras[e.id], 'extra', e.id))).join('');
    const rws = MEDALS.map(m => row(m.name, '', '') .replace('</div></div>', `</div><input class="inp full" type="text" data-set="${m.rk}" value="${(S[m.rk] || '').replace(/"/g, '&quot;')}" placeholder="مثال: وجبة في مطعمي المفضّل"></div>`)).join('');
    return `
    <header class="hd"><div class="grow"><h1>الإعدادات</h1></div></header>

    <h2 class="label">التحدي</h2>
    <div class="box">
      ${row('تاريخ البداية', inp('startDate', 'date'))}
      ${num('quranGoal', 'صفحات القرآن يوميًا', 1, 40)}
      ${num('walkKm', 'المشي يوميًا (كم)', 1, 30, .5)}
    </div>

    <h2 class="label">التنبيهات</h2>
    <div class="box">
      ${WEB ? link('إضافة تنبيهات الأذان إلى التقويم', 'ics') : row('تنبيه عند الأذان', sw(S.notifPrayers, 'toggle', 'notifPrayers'))}
      ${row('تذكير مسائي', sw(S.notifEvening, 'toggle', 'notifEvening'))}
      ${S.notifEvening ? row('وقت التذكير', inp('eveningTime', 'time')) : ''}
      ${WEB ? link('ربط خطوات الآيفون', 'shortcutHelp') : !STEP_STATE.permitted && STEP_STATE.available ? link('تفعيل عدّاد الخطوات', 'stepPerm') : ''}
    </div>

    <h2 class="label">مكافآتك عند كل وسام</h2>
    <div class="box">${rws}</div>

    <h2 class="label">عادات إضافية (اختيارية)</h2>
    <div class="box">${exs}</div>

    <h2 class="label">متقدّم</h2>
    <div class="box">
      ${row('طريقة حساب الصلاة', `<select class="sel" data-set="method">${methodOpts}</select>`)}
      ${row('حساب العصر', `<select class="sel" data-set="asrFactor"><option value="1" ${S.asrFactor == 1 ? 'selected' : ''}>الجمهور</option><option value="2" ${S.asrFactor == 2 ? 'selected' : ''}>الحنفي</option></select>`)}
      ${link('تحديد موقعي بالـ GPS', 'gps')}
      ${num('workoutMin', 'دقائق الرياضة بدل المشي', 10, 180, 5)}
      ${num('strideCm', 'طول الخطوة (سم)', 40, 120)}
      ${row('الوضع', `<select class="sel" data-set="theme"><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>تلقائي</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>فاتح</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>داكن</option></select>`)}
    </div>
    <h2 class="label">تعديل مواقيت الصلاة (دقائق)</h2>
    <div class="box">${adj}</div>

    <h2 class="label">البيانات</h2>
    <div class="box">${link('تصدير نسخة احتياطية', 'export')}${link('استيراد نسخة', 'import')}${link('مسح كل البيانات', 'reset', true)}</div>`;
  }

  /* ---------- الرسم ---------- */
  /* ---------- الحركة ---------- */
  const ease = t => 1 - Math.pow(1 - t, 3);
  function countUp(root) {
    root.querySelectorAll('.cu[data-n]').forEach(el => {
      const to = +el.dataset.n, from = +(el.dataset.from || 0); if (from === to) { el.textContent = n(to); return; }
      const t0 = performance.now(), d = 700;
      const step = now => { const f = Math.min(1, (now - t0) / d); el.textContent = n(Math.round(from + (to - from) * ease(f))); if (f < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => root.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; })));
  }
  function moveInd() {
    const nav = $('#tabs'), b = nav && nav.querySelector('button.on'), ind = $('#tabInd'); if (!b || !ind) return;
    ind.style.width = (b.offsetWidth - 24) + 'px'; ind.style.transform = `translateX(${b.offsetLeft + 12}px)`;
  }
  let PREV = { k: '', n: 0 };
  function render(anim) {
    if (anim === undefined) anim = true;
    const v = $('#view');
    const html = tab === 'today' ? viewToday(anim) : tab === 'challenge' ? viewChallenge() : tab === 'prayer' ? viewPrayer() : viewSettings();
    v.innerHTML = html;
    if (anim) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12))); }
    else v.classList.remove('enter');
    countUp(v);
    document.querySelectorAll('#tabs button').forEach(b => { const on = b.dataset.tab === tab; if (on && !b.classList.contains('on') && anim) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } b.classList.toggle('on', on); });
    moveInd();
    const note = $('#note');
    if (note) note.addEventListener('input', () => { day(viewKey).note = note.value; saveD(); });
  }
  function rerender() { const y = window.scrollY; render(false); window.scrollTo(0, y); }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function sheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; }
  function closeSheet() { $('#sheet').hidden = true; qStop(); }
  const haptic = () => { try { NATIVE && NATIVE.vibrate && NATIVE.vibrate(12); } catch (e) {} };

  /* ---------- الأحداث ---------- */
  const actions = {
    tab: el => { tab = el.dataset.tab; if (tab === 'today') viewKey = todayKey(); render(); window.scrollTo(0, 0); },
    prevDay: () => { viewKey = keyOf(addDays(fromKey(viewKey), -1)); render(); },
    nextDay: () => { if (viewKey < todayKey()) { viewKey = keyOf(addDays(fromKey(viewKey), 1)); render(); } },
    goToday: () => { viewKey = todayKey(); render(); },
    openDay: el => { viewKey = el.dataset.k; tab = 'today'; render(); window.scrollTo(0, 0); },
    tick: el => {
      const D = day(viewKey), id = el.dataset.id, kind = el.dataset.kind;
      if (kind === 'prayer') D.p[id] = D.p[id] === 2 ? 0 : 2;
      else if (kind === 'quran') { const on = (D.quran || 0) >= S.quranGoal; D.quran = on ? 0 : S.quranGoal; if (!on) { BOOK = Math.min(604, BOOK + S.quranGoal); Store.set('quranPage', BOOK); } }
      else if (kind === 'walk') { const on = walkDone(viewKey) || D.wDone === true; if (on) { D.wDone = false; D.walkKm = 0; D.workout = 0; } else D.wDone = true; }
      else if (kind === 'avoid') D[id] = D[id] === true ? null : true;
      else if (kind === 'extra') { const e = C.extras.find(x => x.id === id); D.x[id] = e.type === 'count' ? ((D.x[id] || 0) >= S[e.goalKey] ? 0 : S[e.goalKey]) : !(D.x[id] === true); }
      JUST = id; saveD(); haptic(); rerender(); setTimeout(() => { JUST = ''; }, 50);
    },
    tasbih: () => { sheet(`<div class="tasbih"><h2>المسبحة</h2><div class="tb-d" id="tbD"></div>
      <button class="tb-btn" data-act="tbTap"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" class="tb-track"/><circle id="tbRing" cx="100" cy="100" r="92" class="tb-ring" style="stroke-dasharray:${2 * Math.PI * 92}"/></svg><span class="tb-n" id="tbN"></span><small id="tbG"></small></button>
      <div class="tb-goals">${[33, 99, 100].map(v => `<button data-act="tbGoal" data-v="${v}">${n(v)}</button>`).join('')}</div>
      <div class="tb-acts"><button class="btn" data-act="tbReset">تصفير</button><button class="btn primary" data-act="tbNext">الذكر التالي</button></div></div>`); tbPaint(); },
    tbTap: () => { TB.c++; if (TB.c === TB.goal) { try { NATIVE && NATIVE.vibrate && NATIVE.vibrate(80); } catch (e) {} } else haptic(); tbPaint(); },
    tbGoal: el => { TB.goal = +el.dataset.v; tbPaint(); },
    tbReset: () => { TB.c = 0; tbPaint(); },
    tbNext: () => { TB.i = (TB.i + 1) % DHIKR.length; TB.c = 0; tbPaint(); },
    qibla: () => { const qb = Math.round(PrayTime.qibla(S.lat, S.lng)); sheet(`<div class="qibla"><h2>اتجاه القبلة</h2><p>${n(qb)}° من الشمال · ${S.placeName}</p>
      <div class="q-dial"><div class="q-rose" id="qRose"><b class="qn">ش</b><b class="qe">شر</b><b class="qs">ج</b><b class="qw">غ</b></div>
      <div class="q-needle" id="qNeedle" style="transform:rotate(${qb}deg)"><span class="q-kaaba"></span></div><span class="q-center"></span></div>
      <div class="q-msg" id="qMsg">شغّل البوصلة ثم أمسك الجوال بشكل أفقي</div>
      <button class="btn primary block" id="qBtn" data-act="qStart">تشغيل البوصلة</button></div>`); },
    qStart: () => qStart(),
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
    const ring = document.getElementById('cdRing');
    if (ring) { const a = +ring.dataset.from, b = +ring.dataset.to, C2 = 2 * Math.PI * 118; ring.style.strokeDashoffset = C2 * (1 - Math.max(0, Math.min(1, (Date.now() - a) / (b - a)))); }
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
  const sp = document.getElementById('splash');
  if (sp) setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 650); }, 1700);
  window.addEventListener('resize', moveInd);
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
    sheet(`<div class="cele"><div class="cele-e" style="width:96px;height:96px">${ART.tile('rawatib')}</div><h2>بسم الله</h2>
      <p>تحدّي ٣٠ يومًا يبدأ ${greg(start())}.<br>كل يوم: اضغط على الهدف عندما تنجزه ✓<br>أكمل الأهداف العشرة لتحصل على نجمة، وأسبوعًا كاملًا لتحصل على وسام.</p>
      ${WEB ? '<button class="btn block" data-act="ics" style="margin-bottom:10px">إضافة تنبيهات الأذان (مسقط)</button>' : ''}
      <button class="btn primary block" data-act="onbDone">ابدأ</button></div>`);
  }
})();
