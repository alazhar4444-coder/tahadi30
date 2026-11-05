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
    extras: Object.fromEntries(C.extras.map(e => [e.id, e.on])), onboarded: false
  };

  let S = Object.assign({}, DEFAULTS, Store.get('settings', {}));
  S.adjust = Object.assign({}, DEFAULTS.adjust, S.adjust || {});
  S.extras = Object.assign({}, DEFAULTS.extras, S.extras || {});
  let DAYS = Store.get('days', {});
  let BOOK = Store.get('quranPage', 1);
  let STEPS = {};            // yyyy-mm-dd -> steps (من الحسّاس)
  let STEP_STATE = { available: false, permitted: false };

  const saveS = () => Store.set('settings', S);
  const saveD = () => Store.set('days', DAYS);

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
    if (NATIVE && NATIVE.setBars) try { NATIVE.setBars(dark ? '#101614' : '#F4EFE4', !dark); } catch (e) {}
  }

  /* ---------- أيقونات ---------- */
  const SL = '<path d="M4 4l16 16"/>'; // خط النفي
  const P = {
    fajr: '<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 7.5V4M5.6 11.2 4 9.8M18.4 11.2 20 9.8M9 21h6"/>',
    sunrise: '<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 3.5v5M9.5 6l2.5-2.5L14.5 6"/>',
    dhuhr: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    asr: '<circle cx="15.5" cy="8.5" r="3.5"/><path d="M15.5 2.5v1.3M21.5 8.5h-1.3M19.7 4.3l-.9.9M11.3 4.3l.9.9M3 20h18M6 20l4.5-5.5"/>',
    maghrib: '<path d="M3 15h18M6.5 15a5.5 5.5 0 0 1 11 0M12 3v6.5M9.5 7l2.5 2.5L14.5 7M7 19h10"/>',
    isha: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10z"/><path d="M17.5 3.5l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>',
    moon: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10z"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>',
    walk: '<path d="M8 3.5c1.6 0 2.5 1.8 2.5 4s-.9 4-2.5 4-2.5-1.8-2.5-4 .9-4 2.5-4zM5.8 14.5h4.4v1.7a2.2 2.2 0 0 1-4.4 0zM16 7c1.6 0 2.5 1.8 2.5 4s-.9 4-2.5 4-2.5-1.8-2.5-4 .9-4 2.5-4zM13.8 18h4.4v.3a2.2 2.2 0 0 1-4.4 0z"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    candy: '<circle cx="12" cy="12" r="3.6"/><path d="M8.6 10.6 4.5 8v8l4.1-2.6M15.4 10.6 19.5 8v8l-4.1-2.6"/>' + SL,
    bread: '<path d="M5.5 11.5a3.8 3.8 0 0 1 1.3-7.2h10.4a3.8 3.8 0 0 1 1.3 7.2V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5.5 19z"/>' + SL,
    shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
    beads: '<circle cx="12" cy="4.8" r="1.5"/><circle cx="16.8" cy="7" r="1.5"/><circle cx="18.4" cy="12" r="1.5"/><circle cx="15.8" cy="16.4" r="1.5"/><circle cx="8.2" cy="16.4" r="1.5"/><circle cx="5.6" cy="12" r="1.5"/><circle cx="7.2" cy="7" r="1.5"/><path d="M12 17.5v4M10.5 21.5h3"/>',
    beadsMoon: '<circle cx="12" cy="4.8" r="1.5"/><circle cx="16.8" cy="7" r="1.5"/><circle cx="7.2" cy="7" r="1.5"/><circle cx="5.6" cy="12" r="1.5"/><circle cx="8.2" cy="16.4" r="1.5"/><path d="M12 17.5v4M10.5 21.5h3M20 14.5a3.2 3.2 0 1 1-3.5-4 2.6 2.6 0 0 0 3.5 4z"/>',
    mihrab: '<path d="M5 21V10a7 7 0 0 1 14 0v11M9 21v-6.5a3 3 0 0 1 6 0V21M3 21h18"/>',
    sunSmall: '<circle cx="12" cy="13" r="3.5"/><path d="M12 5.5v1.5M5.5 13H4M20 13h-1.5M7.2 8.2l1 1M16.8 8.2l-1 1M3 20h18"/>',
    hand: '<path d="M3 13.5h3l3.4 2H14a1.5 1.5 0 0 1 0 3H9.6M14.2 17l4.6-2.2a1.6 1.6 0 0 1 1.7 2.7L15 21H3"/><path d="M15 10.5 12.3 8a1.8 1.8 0 0 1 2.7-2.4 1.8 1.8 0 0 1 2.7 2.4z"/>',
    heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
    plate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3.5"/>' + SL,
    drop: '<path d="M12 3.5c3.5 4.2 6 7.6 6 10.7a6 6 0 0 1-12 0c0-3.1 2.5-6.5 6-10.7z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    bed: '<path d="M3 19.5V7M3 15.5h18v4M21 15.5V13a3 3 0 0 0-3-3h-7.5v5.5"/><circle cx="6.8" cy="12.3" r="1.8"/><path d="M15 3.5h3l-3 3h3"/>',
    leaf: '<path d="M5 19.5C5 11 10 5 19.5 4.5 19.5 14 14 19 5.5 19.5M5 19.5l7-7"/>',
    cupNo: '<path d="M6.5 8h11l-1.4 12.5H7.9zM12 8l1-4.5h3"/>' + SL,
    phoneNo: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>' + SL,
    flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6.3 0-4-3.3-6.6-4.3-10.7-2.2 1.6-3.2 4-3 6.5C10 9.5 9.2 8.4 9 7c-2 1.8-3.5 4.4-3.5 7.7C5.5 18.4 8 21 12 21z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    pencil: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/>',
    quote: '<path d="M10 7H6.5A1.5 1.5 0 0 0 5 8.5V12h5V7zM10 12c0 3-1.5 4.5-4 5M19 7h-3.5A1.5 1.5 0 0 0 14 8.5V12h5V7zM19 12c0 3-1.5 4.5-4 5"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 13.3 13.3 8.5 15.5l2.2-4.8z"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    check2: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    dash: '<circle cx="12" cy="12" r="7.5" stroke-dasharray="2.6 2.6"/>'
  };
  const svg = name => `<svg viewBox="0 0 24 24">${P[name] || ''}</svg>`;
  /* لون مميّز (تدرّج) لكل صلاة وهدف */
  const COL = {
    fajr: ['#6D5DFC', '#E86FB0'], sunrise: ['#FFB347', '#FF7E5F'], dhuhr: ['#F7B500', '#FF8A00'], asr: ['#FF8C42', '#FF4E50'],
    maghrib: ['#F7567C', '#8E54E9'], isha: ['#3B4BC8', '#1B2370'], moon: ['#4651C9', '#7C83FD'],
    book: ['#0E9F6E', '#34D399'], mihrab: ['#0E9F6E', '#2DD4BF'], walk: ['#2563EB', '#38BDF8'], dumbbell: ['#7C3AED', '#A78BFA'],
    candy: ['#EC4899', '#F43F5E'], bread: ['#C2761F', '#F2A541'], shield: ['#4F46E5', '#818CF8'],
    beads: ['#059669', '#6EE7B7'], beadsMoon: ['#6366F1', '#A5B4FC'], sunSmall: ['#F59E0B', '#FCD34D'], hand: ['#E11D48', '#FB7185'],
    heart: ['#DB2777', '#F9A8D4'], plate: ['#92400E', '#D6A06A'], drop: ['#0891B2', '#22D3EE'], bed: ['#1E3A8A', '#6366F1'],
    leaf: ['#4D7C0F', '#A3E635'], cupNo: ['#DC2626', '#FB923C'], phoneNo: ['#475569', '#94A3B8'], flame: ['#F97316', '#FACC15'],
    star: ['#F59E0B', '#FDE047'], compass: ['#0D9488', '#5EEAD4'], target: ['#0E9F6E', '#34D399'], pencil: ['#64748B', '#94A3B8'],
    quote: ['#0E9F6E', '#34D399'], pin: ['#D97706', '#FBBF24']
  };
  const cv = name => { const c = COL[name] || COL.book; return `--a:${c[0]};--b:${c[1]}`; };
  const ic = name => `<span class="ico" style="${cv(name)}">${svg(name)}</span>`;
  const hi = name => `<span class="hi" style="${cv(name)}">${svg(name)}</span>`;

  const I = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>'
  };

  function ring(pct) {
    const r = 50, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return `<svg viewBox="0 0 116 116"><circle cx="58" cy="58" r="${r}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="11"/>
      <circle cx="58" cy="58" r="${r}" fill="none" stroke="#F3C97A" stroke-width="11" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .6s"/></svg>`;
  }

  /* ========== شاشة اليوم ========== */
  function viewToday() {
    const k = viewKey, D = day(k), d = fromKey(k), isToday = k === todayKey();
    const dn = dayNum(k), sc = score(k);
    const t = ptimes(d);
    const cheer = C.cheer.find(c => sc.pct >= c[0])[1];
    const purity = streak(isTrue('chastity'));
    const perfect = streak(kk => score(kk).core);
    const q = C.quotes[((dn > 0 ? dn - 1 : d.getDate()) + C.quotes.length) % C.quotes.length];
    const tip = C.tips[(d.getDate() + d.getMonth()) % C.tips.length];
    const canNext = k < todayKey();
    const minK = keyOf(addDays(start(), -7));

    let hero;
    if (dn < 1) {
      hero = `<div class="card prestart"><div style="font-size:19px">يبدأ التحدي <b>${greg(start())}</b></div>
        <div class="muted mt">${dn === 0 ? 'غدًا البداية!' : 1 - dn === 2 ? 'باقي <b>يومان</b>' : `باقي <b>${n(1 - dn)}</b> ${1 - dn <= 10 ? 'أيام' : 'يومًا'}`} — جرّب التسجيل الآن لتتعوّد، هذه الأيام لا تُحسب في التحدي.</div></div>`;
    }
    const dayLabel = dn >= 1 && dn <= S.length ? `اليوم ${n(dn)} من ${n(S.length)}` : dn > S.length ? 'بعد التحدي' : 'يوم تجريبي';

    let nextCard = '';
    if (isToday) {
      const np = nextPrayer();
      if (np) nextCard = `<div class="card next" style="${cv(np.pr.id)}">${ic(np.pr.id)}<div class="grow"><div class="n-name">الصلاة القادمة</div><div class="n-big">${np.pr.name} · ${fmtTime(np.at)}</div></div>
        <div class="n-count" id="npCount" data-at="${np.at.getTime()}">${dur(np.at - Date.now())}</div></div>`;
    }

    const prayerRows = C.prayers.map(pr => {
      const v = D.p[pr.id] || 0;
      return `<div class="row">${ic(pr.id)}<div class="grow"><div class="t">${pr.name}</div><div class="h">${fmtTime(t[pr.id])}</div></div>
        <button class="ib wide ${v === 2 ? 'ok' : v === 1 ? 'late' : ''}" data-act="prayer" data-id="${pr.id}" aria-label="تسجيل ${pr.name}">${svg(v === 2 ? 'check2' : v === 1 ? 'clock' : 'dash')}</button></div>`;
    }).join('');

    const km = walkKmOf(k), kmPct = Math.min(km / S.walkKm * 100, 100);
    const stepsLine = WEB ? (STEPS[k] ? `${n((STEPS[k]).toLocaleString('en'))} خطوة` : '')
      : !STEP_STATE.available ? 'جهازك لا يدعم عدّاد الخطوات — أضف المسافة يدويًا'
      : !STEP_STATE.permitted ? '' : `${n((STEPS[k] || 0).toLocaleString('en'))} خطوة`;

    const yesNo = (act, id, v) => `<div class="ibs"><button class="ib ${v === true ? 'ok' : ''}" data-act="${act}" data-id="${id}" data-v="1" aria-label="التزمت">${svg('check2')}</button>
        <button class="ib ${v === false ? 'no' : ''}" data-act="${act}" data-id="${id}" data-v="0" aria-label="لم ألتزم">${svg('x')}</button></div>`;
    const avoid = (id, icon, name, hint, extra) => `<div class="row">${ic(icon, id === 'chastity' ? '' : 'r')}<div class="grow"><div class="t">${name}</div><div class="h">${hint}</div>${extra || ''}</div>${yesNo('avoid', id, D[id])}</div>`;

    const ex = extrasFor(k);
    const exRows = ex.map(e => {
      const v = D.x[e.id];
      if (e.type === 'count') {
        const g = S[e.goalKey];
        return `<div class="row">${ic(e.icon, 'b')}<div class="grow"><div class="t">${e.name}</div><div class="h">${n(v || 0)} من ${n(g)} ${e.unit}</div>
          <div class="bar mt" style="height:6px;${cv(e.icon)}"><i style="width:${Math.min((v || 0) / g * 100, 100)}%"></i></div></div>
          <div class="stepper"><button data-act="xcount" data-id="${e.id}" data-d="-1">−</button><button data-act="xcount" data-id="${e.id}" data-d="1" style="background:var(--green);color:#fff">+</button></div></div>`;
      }
      if (e.type === 'avoid') return `<div class="row">${ic(e.icon, 'r')}<div class="grow"><div class="t">${e.name}</div></div>${yesNo('xavoid', e.id, v)}</div>`;
      return `<div class="row" data-act="xcheck" data-id="${e.id}">${ic(e.icon, e.group === 'health' ? 'h' : '')}<div class="grow"><div class="t">${e.name}</div><div class="h">${e.hint || ''}</div></div>
        <div class="check ${v ? 'on' : ''}">${I.check}</div></div>`;
    }).join('');

    const gl = (icon, ok, label) => `<div class="gw"><div class="gi ${ok ? 'on' : ''}" style="${cv(icon)}">${svg(icon)}</div><span>${label}</span></div>`;
    const goals = C.prayers.map(pr => gl(pr.id, D.p[pr.id] === 2, pr.name)).join('')
      + gl('book', (D.quran || 0) >= S.quranGoal, 'القرآن') + gl('walk', walkDone(k), 'المشي')
      + gl('candy', D.noSugar === true, 'السكر') + gl('bread', D.noBread === true, 'الخبز') + gl('shield', D.chastity === true, 'العفّة');
    const slipMsg = D.chastity === false ? `<div class="slip">لا تيأس. قال تعالى: «لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ». استغفر، توضأ، وابدأ من جديد — تحدّيك مستمر، والمهم ألّا تتوقف.</div>` : '';

    return `
    <div class="top">
      <div><h1>${S.name ? 'أهلًا ' + S.name : 'تحدي ٣٠ يوم'}</h1><div class="sub">${greg(d)} · ${hijri(d)}</div></div>
      <div class="daynav">
        <button class="icon-btn" data-act="prevDay" ${k <= minK ? 'disabled' : ''} aria-label="اليوم السابق">${I.right}</button>
        <button class="icon-btn" data-act="nextDay" ${canNext ? '' : 'disabled'} aria-label="اليوم التالي">${I.left}</button>
      </div>
    </div>
    ${hero || ''}
    <div class="card hero">
      <div class="ring">${ring(sc.pct)}<div class="lbl"><div class="pct">${n(sc.pct)}٪</div><div class="of">${isToday ? 'اليوم' : 'إنجاز'}</div></div></div>
      <div><h3>${dayLabel}</h3><p>${sc.core ? 'أكملت كل الأهداف الأساسية ✓' : cheer}</p>
        <div class="chips"><span class="chip" title="أيام كاملة متتالية">${svg('flame')}<b>${n(perfect)}</b></span><span class="chip" title="أيام العفّة">${svg('shield')}<b>${n(purity)}</b></span></div></div>
    </div>
    <div class="card goals">${goals}</div>
    ${nextCard}
    ${!isToday ? `<div class="card center muted" style="padding:10px">تعدّل يوم ${greg(d)} — <button class="link" data-act="goToday">العودة لليوم</button></div>` : ''}

    <div class="sec-h"><h2>${hi('mihrab')}الصلوات</h2><span class="meta legend-i">${svg('check2')}في وقتها ${svg('clock')}متأخرة</span></div>
    <div class="card list">${prayerRows}</div>

    <div class="sec-h"><h2>${hi('book')}القرآن</h2><span class="meta">${svg('target')}${n(S.quranGoal)}</span></div>
    <div class="card">
      <div class="row" style="padding-top:0">${ic('book')}<div class="grow"><div class="t">${n(D.quran || 0)} <span class="muted">/ ${n(S.quranGoal)}</span></div><div class="h">${(D.quran || 0) >= S.quranGoal ? 'حققت وِردك ✓' : 'صفحات اليوم'}</div></div>
        <div class="stepper"><button data-act="quran" data-d="-1">−</button><button data-act="quran" data-d="1" style="background:var(--green);color:#fff">+</button></div></div>
      <div class="walk-meta" style="margin-top:4px;align-items:center"><span class="legend-i">${svg('pin')}صفحة <b>${n(BOOK)}</b> / ٦٠٤</span><button class="ib sm" data-act="setBook" aria-label="تعديل">${svg('pencil')}</button></div>
      <div class="bar mt" style="height:8px;${cv('book')}"><i style="width:${BOOK / 604 * 100}%"></i></div>
    </div>

    <div class="sec-h"><h2>${hi('walk')}المشي والرياضة</h2><span class="meta">${walkDone(k) ? '<span class="badge">✓</span>' : `${svg('target')}${n(S.walkKm)} كم`}</span></div>
    <div class="card">
      <div class="walk-top">${ic('walk', 'h')}<div class="km grow" style="margin-inline-start:10px">${n(round1(km))} <small>/ ${n(S.walkKm)} كم</small></div><div class="muted">${stepsLine}</div></div>
      <div class="bar" style="${cv('walk')}"><i style="width:${kmPct}%"></i></div>
      ${NATIVE && STEP_STATE.available && !STEP_STATE.permitted ? `<button class="btn primary block mt" data-act="stepPerm">${svg('walk')}تفعيل عدّاد الخطوات</button>` : ''}
      ${WEB ? `<button class="link mt" data-act="shortcutHelp">${STEPS[todayKey()] ? 'خطواتك من تطبيق الصحة ✓' : 'اربط خطوات الآيفون تلقائيًا'}</button>` : ''}
      <div class="inline-actions">
        <button class="btn" data-act="addKm">${svg('walk')}+ كم${D.walkKm ? ` (${n(round1(D.walkKm))})` : ''}</button>
        <button class="btn" data-act="workout">${svg('dumbbell')}${n(D.workout || 0)} د</button>
      </div>
    </div>

    <div class="sec-h"><h2>${hi('shield')}الانضباط</h2><span class="meta">آخر اليوم</span></div>
    <div class="card list">
      ${avoid('noSugar', 'candy', 'بدون سكر', 'حلويات، عصائر، مشروبات محلّاة')}
      ${avoid('noBread', 'bread', 'بدون خبز', 'خبز ومعجنات')}
      ${avoid('chastity', 'shield', 'حفظ النفس', 'العفّة وغضّ البصر', slipMsg + `<button class="link sos" data-act="urge">${svg('heart')}أحتاج مساعدة الآن</button>`)}
    </div>

    ${ex.length ? `<div class="sec-h"><h2>${hi('star')}إضافية</h2><button class="ib sm" data-act="tab" data-tab="settings" aria-label="تعديل">${svg('pencil')}</button></div><div class="card list">${exRows}</div>` : ''}

    <div class="sec-h"><h2>${hi('quote')}تأمّل اليوم</h2></div>
    <div class="card quote"><div class="qt">${q.t}</div><div class="qs">${q.s}</div></div>
    <div class="card tip">${I.bulb}<div>${tip}</div></div>

    <div class="sec-h"><h2>${hi('pencil')}ملاحظة اليوم</h2></div>
    <div class="card"><textarea id="note" placeholder="ما الذي ساعدك اليوم؟ وما الذي صعّب عليك؟">${(D.note || '').replace(/</g, '&lt;')}</textarea></div>
    `;
  }

  /* ========== شاشة التحدي ========== */
  function viewChallenge() {
    const tk = todayKey(), cells = [];
    let onTime = 0, pages = 0, kms = 0, sugar = 0, bread = 0, full = 0, logged = 0, workout = 0;
    for (let i = 0; i < S.length; i++) {
      const k = keyOf(addDays(start(), i)), D = DAYS[k], fut = k > tk;
      const sc = fut ? { pct: 0, core: false } : score(k);
      const lv = fut || sc.pct === 0 ? 0 : sc.pct < 40 ? 1 : sc.pct < 70 ? 2 : sc.pct < 100 ? 3 : 4;
      cells.push(`<button class="cell l${lv} ${k === tk ? 'today' : ''} ${fut ? 'future' : ''}" data-act="openDay" data-k="${k}" ${fut ? 'disabled' : ''}>${sc.core ? '<span class="star">★</span>' : ''}${n(i + 1)}</button>`);
      if (!fut) {
        if (D) {
          logged++;
          C.prayers.forEach(p => { if (D.p && D.p[p.id] === 2) onTime++; });
          pages += D.quran || 0; if (D.noSugar === true) sugar++; if (D.noBread === true) bread++;
          workout += D.workout || 0;
        }
        kms += walkKmOf(k); if (sc.core) full++;
      }
    }
    const elapsed = Math.max(0, Math.min(S.length, diffDays(new Date(), start()) + 1));
    const purity = streak(isTrue('chastity'));
    let best = 0, run = 0;
    for (let i = 0; i < S.length; i++) { const k = keyOf(addDays(start(), i)); if (isTrue('chastity')(k)) { run++; best = Math.max(best, run); } else run = 0; }

    const hb = (icon, name, val, max) => `<div class="hbar"><div class="hl"><span class="legend-i" style="${cv(icon)}">${svg(icon)}${name}</span><span>${n(val)} / ${n(max)}</span></div><div class="bar" style="${cv(icon)}"><i style="width:${max ? Math.min(val / max * 100, 100) : 0}%"></i></div></div>`;
    const miles = [7, 14, 21, 30].map(m => `<div class="mile ${full >= m ? 'got' : ''}">${svg(full >= m ? 'star' : 'target')}<div class="mv">${n(m)}</div>يوم</div>`).join('');

    return `
    <div class="top"><div><h1>تحدي ${n(S.length)} يوم</h1><div class="sub">${elapsed ? `مضى ${n(elapsed)} من ${n(S.length)} يوم` : `يبدأ ${greg(start())}`}</div></div></div>
    <div class="card">
      <div class="grid30">${cells.join('')}</div>
      <div class="legend"><span>أقل</span><i style="background:var(--track)"></i><i class="cell l1" style="aspect-ratio:auto"></i><i class="cell l2" style="aspect-ratio:auto"></i><i class="cell l3" style="aspect-ratio:auto"></i><i class="cell l4" style="aspect-ratio:auto"></i><span>أكثر</span><span style="margin-right:10px">★ يوم كامل</span></div>
    </div>

    <div class="stats">
      <div class="stat feature">${ic('shield', 'h')}<div class="grow" style="margin-inline-start:12px"><div class="k">أيام العفّة المتتالية</div><div class="muted">أطول سلسلة: ${n(best)} يوم</div></div><div class="v">${n(purity)}</div></div>
      <div class="stat">${ic('mihrab')}<div class="v">${n(onTime)} <small>/ ${n(elapsed * 5)}</small></div><div class="k">صلاة في وقتها</div></div>
      <div class="stat">${ic('star', 'h')}<div class="v">${n(full)}</div><div class="k">أيام كاملة</div></div>
      <div class="stat">${ic('book')}<div class="v">${n(pages)} <small>صفحة</small></div><div class="k">قرأتها من القرآن</div></div>
      <div class="stat">${ic('walk', 'h')}<div class="v">${n(round1(kms))} <small>كم</small></div><div class="k">مشيتها${workout ? ` + ${n(workout)} د تمرين` : ''}</div></div>
    </div>

    <div class="sec-h"><h2>${hi('target')}الالتزام</h2><span class="meta">من الأيام المنقضية</span></div>
    <div class="card">
      ${hb('mihrab', 'الصلاة في وقتها', onTime, elapsed * 5)}
      ${hb('candy', 'بدون سكر', sugar, elapsed)}
      ${hb('bread', 'بدون خبز', bread, elapsed)}
      ${hb('pencil', 'أيام سُجّلت', logged, elapsed)}
    </div>

    <div class="sec-h"><h2>${hi('flame')}المحطات</h2></div>
    <div class="miles">${miles}</div>
    <p class="muted center mt">اضغط على أي يوم في الشبكة لفتحه وتعديله.</p>`;
  }

  /* ========== شاشة الصلاة ========== */
  function viewPrayer() {
    const now = new Date(), t = ptimes(now), np = nextPrayer(now), cur = currentPrayerId(now);
    const tomorrow = ptimes(addDays(now, 1));
    const rows = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']]
      .map(([id, nm]) => `<div class="row ${id === cur ? 'cur' : ''}">${ic(id, id === 'sunrise' ? 'h' : '')}<div class="grow t">${nm}</div><div class="tm">${fmtTime(t[id])}</div></div>`).join('');
    const methodOpts = Object.entries(PrayTime.METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${m.name}</option>`).join('');
    const cityOpts = CITIES.map(c => `<option value="${c[0]}" ${S.city === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('') + (S.city === 'gps' ? '<option value="gps" selected>موقعي الحالي</option>' : '');
    const adj = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(id => {
      const nm = C.prayers.find(p => p.id === id).name;
      return `<div class="field"><label>${nm}</label><div class="stepper"><button data-act="adj" data-id="${id}" data-d="-1">−</button><span class="v" style="font-size:16px">${n(S.adjust[id] > 0 ? '+' + S.adjust[id] : S.adjust[id])}</span><button data-act="adj" data-id="${id}" data-d="1">+</button></div></div>`;
    }).join('');

    return `
    <div class="top"><div><h1>مواقيت الصلاة</h1><div class="sub">${S.placeName} · ${hijri(now)}</div></div></div>
    <div class="card bigclock" style="${np ? cv(np.pr.id) : ''}">
      <div class="l">${np ? `باقي على صلاة ${np.pr.name}` : ''}</div>
      <div class="c" id="npCount" data-at="${np ? np.at.getTime() : 0}">${np ? dur(np.at - now) : ''}</div>
      <div class="l">${np ? fmtTime(np.at) : ''}</div>
    </div>
    <div class="card list ptimes">${rows}</div>
    <div class="stats"><div class="stat ic-stat">${ic('fajr')}<div><div class="v" style="font-size:20px">${fmtTime(tomorrow.fajr)}</div><div class="k">فجر الغد</div></div></div>
      <div class="stat ic-stat">${ic('compass', 'h')}<div><div class="v" style="font-size:20px">${n(Math.round(PrayTime.qibla(S.lat, S.lng)))}°</div><div class="k">القبلة من الشمال</div></div></div></div>

    <div class="sec-h"><h2>الموقع وطريقة الحساب</h2></div>
    <div class="card">
      <div class="field"><label>المدينة</label><select data-set="city">${cityOpts}</select></div>
      <div class="field"><label>تحديد موقعي بالـ GPS<div class="h">أدق للمدن غير الموجودة</div></label><button class="btn" data-act="gps">موقعي</button></div>
      <div class="field"><label>طريقة الحساب</label><select data-set="method">${methodOpts}</select></div>
      <div class="field"><label>حساب العصر</label><select data-set="asrFactor"><option value="1" ${S.asrFactor == 1 ? 'selected' : ''}>الجمهور (المِثل)</option><option value="2" ${S.asrFactor == 2 ? 'selected' : ''}>الحنفي (المِثلين)</option></select></div>
      ${WEB ? `<div class="field"><label>تنبيه عند الأذان<div class="h">تُضاف المواقيت لتقويم جوالك مع تنبيه</div></label><button class="btn" data-act="ics">إضافة للتقويم</button></div>`
        : `<div class="field"><label>تنبيه عند الأذان</label><button class="switch ${S.notifPrayers ? 'on' : ''}" data-act="toggle" data-id="notifPrayers"></button></div>`}
    </div>
    <div class="sec-h"><h2>تعديل يدوي بالدقائق</h2><span class="meta">لمطابقة مسجد حيّك</span></div>
    <div class="card">${adj}</div>`;
  }

  /* ========== الإعدادات ========== */
  function viewSettings() {
    const groups = { deen: 'عبادات', health: 'صحة' };
    const exToggles = Object.entries(groups).map(([g, gn]) => `<div class="muted" style="margin:6px 0 0">${gn}</div>` +
      C.extras.filter(e => e.group === g).map(e => `<div class="field"><label>${e.name}${e.hint ? `<div class="h">${e.hint}</div>` : ''}</label><button class="switch ${S.extras[e.id] ? 'on' : ''}" data-act="extra" data-id="${e.id}"></button></div>`).join('')).join('');
    const num = (id, label, hint, min, max, step) => `<div class="field"><label>${label}${hint ? `<div class="h">${hint}</div>` : ''}</label><input type="number" inputmode="decimal" data-set="${id}" value="${S[id]}" min="${min}" max="${max}" step="${step || 1}"></div>`;

    return `
    <div class="top"><div><h1>الإعدادات</h1><div class="sub">خصّص تحدّيك</div></div></div>
    <div class="card">
      <div class="field"><label>اسمك</label><input type="text" data-set="name" value="${S.name}" placeholder="اختياري"></div>
      <div class="field"><label>تاريخ بداية التحدي</label><input type="date" data-set="startDate" value="${S.startDate}"></div>
      ${num('length', 'مدة التحدي (أيام)', '', 7, 90)}
    </div>
    <div class="sec-h"><h2>الأهداف اليومية</h2></div>
    <div class="card">
      ${num('quranGoal', 'صفحات القرآن', 'الجزء = ٢٠ صفحة', 1, 40)}
      ${num('walkKm', 'مسافة المشي (كم)', '', 1, 30, 0.5)}
      ${num('workoutMin', 'أو دقائق تمرين', 'بديل عن المشي', 10, 180, 5)}
      ${num('strideCm', 'طول الخطوة (سم)', 'تقريبًا: الطول × ٠٫٤١٥', 40, 120)}
      ${num('waterGoal', 'أكواب الماء', '', 4, 16)}
    </div>
    <div class="sec-h"><h2>عادات إضافية مقترحة</h2></div>
    <div class="card">${exToggles}</div>
    <div class="sec-h"><h2>التنبيهات</h2></div>
    ${WEB ? `<div class="card">
      <div class="field"><label>تنبيهات الأذان والتذكير<div class="h">يُنشئ ملف تقويم لـ٣٠ يومًا بمواقيت ${S.placeName}، فيه تنبيه عند كل أذان وتذكير مسائي ${S.notifEvening ? 'الساعة ' + n(S.eveningTime) : ''}. أعد إضافته إذا غيّرت المدينة.</div></label></div>
      <div class="field"><label>تذكير المراجعة المسائية</label><button class="switch ${S.notifEvening ? 'on' : ''}" data-act="toggle" data-id="notifEvening"></button></div>
      <div class="field"><label>وقت التذكير</label><input type="time" data-set="eveningTime" value="${S.eveningTime}"></div>
      <button class="btn primary block mt" data-act="ics">إضافة المواقيت إلى تقويم الآيفون</button>
    </div>
    <div class="sec-h"><h2>خطوات الآيفون</h2></div>
    <div class="card"><div class="field"><label>ربط المشي بتطبيق الصحة<div class="h">عبر تطبيق الاختصارات</div></label><button class="btn" data-act="shortcutHelp">الطريقة</button></div></div>` : `<div class="card">
      <div class="field"><label>تنبيه عند كل أذان</label><button class="switch ${S.notifPrayers ? 'on' : ''}" data-act="toggle" data-id="notifPrayers"></button></div>
      <div class="field"><label>تذكير المراجعة المسائية</label><button class="switch ${S.notifEvening ? 'on' : ''}" data-act="toggle" data-id="notifEvening"></button></div>
      <div class="field"><label>وقت التذكير</label><input type="time" data-set="eveningTime" value="${S.eveningTime}"></div>
      <div class="field"><label>السماح بالإشعارات<div class="h">إذا لم تصلك التنبيهات</div></label><button class="btn" data-act="notifPerm">السماح</button></div>
    </div>`}
    <div class="sec-h"><h2>المظهر</h2></div>
    <div class="card"><div class="field"><label>الوضع</label><select data-set="theme">
      <option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>حسب الجهاز</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>فاتح</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>داكن</option></select></div></div>
    <div class="sec-h"><h2>النسخ الاحتياطي</h2></div>
    <div class="card">
      <div class="inline-actions" style="margin:0"><button class="btn" data-act="export">تصدير البيانات</button><button class="btn" data-act="import">استيراد</button><button class="btn danger" data-act="reset">مسح الكل</button></div>
    </div>
    <p class="muted center">تحدي ٣٠ يوم · بياناتك محفوظة على جهازك فقط</p>`;
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
    km: el => { const D = day(viewKey), v = +el.dataset.v; D.walkKm = v ? round1((D.walkKm || 0) + v) : 0; saveD(); closeSheet(); rerender(); if (walkDone(viewKey)) toast('حققت هدف الرياضة اليوم'); },
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
