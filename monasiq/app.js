/* منسّق — مهام المنسّق في مدرسة معاذ بن جبل · تصميم الأزهر الناعبي */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const AR = '٠١٢٣٤٥٦٧٨٩', n = x => String(x).replace(/\d/g, d => AR[d]);
  const toEn = s => String(s).replace(/[٠-٩]/g, d => AR.indexOf(d));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = x => String(x).padStart(2, '0');
  const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dk(new Date());
  const addD = (k, i) => { const [y, m, d] = k.split('-').map(Number); return dk(new Date(y, m - 1, d + i)); };
  const pk = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const haptic = () => { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} };

  /* ——— البيانات ——— */
  const K = 'monasiq:';
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(K + k)) ?? d; } catch (e) { return d; } };
  let T = load('tasks', []), ST = Object.assign({ name: 'الأزهر الناعبي', school: 'مدرسة معاذ بن جبل', theme: 'auto', remind: 15 }, load('st', {}));
  const save = () => { try { localStorage.setItem(K + 'tasks', JSON.stringify(T)); localStorage.setItem(K + 'st', JSON.stringify(ST)); } catch (e) {} badge(); };
  // التسجيلات الصوتية في IndexedDB
  const idb = (() => { let dbp; const open = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('monasiq', 1); r.onupgradeneeded = () => r.result.createObjectStore('a'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction('a', mode), s = t.objectStore('a'), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
    return { put: (k, v) => tx('readwrite', s => s.put(v, k)), get: k => tx('readonly', s => s.get(k)), del: k => tx('readwrite', s => s.delete(k)) }; })();

  const PR = { h: { t: 'عالية', c: '#FF3B30', s: 'flag' }, m: { t: 'متوسطة', c: '#FF9F0A', s: 'flag' }, l: { t: 'منخفضة', c: '#0A84FF', s: 'flag' } };
  const CATS = [['cover', 'تغطية فعالية', '#FF375F', 'camera'], ['post', 'نشر في الحساب', '#0A84FF', 'send'], ['photo', 'تصوير وفيديو', '#FF9F0A', 'video'], ['design', 'تصميم', '#AF52DE', 'pen'], ['content', 'كتابة محتوى', '#30B0C7', 'doc'], ['meet', 'اجتماعات', '#5E5CE6', 'people'], ['admin', 'شؤون إدارية', '#8E8E93', 'folder'], ['personal', 'شخصي', '#64D2FF', 'heart']];
  const CAT = id => CATS.find(c => c[0] === id) || CATS.find(c => c[0] === 'admin');

  /* ——— الرموز ——— */
  const SY = {
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.5-3.3 2.8-5 6-5s5.5 1.7 6 5"/><path d="M16 5.4a3 3 0 0 1 0 5.4M18 14.3c1.7.6 2.7 2.2 3 4.7"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>', cap: '<path d="M2 9.5 12 5l10 4.5L12 14z"/><path d="M6 11.5v4.3c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3M21.5 10v5"/>',
    person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>', star: '<path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.4h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/>',
    repeat: '<path d="M4 9a5 5 0 0 1 5-5h9l-3-3M20 15a5 5 0 0 1-5 5H6l3 3"/>', play: '<path d="M7 4.5v15l12-7.5z"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    sub: '<path d="M5 4v9a3 3 0 0 0 3 3h11M15 12l4 4-4 4"/>', fire: '<path d="M12 21c4 0 6.5-2.6 6.5-6.3 0-4-3.3-6.6-4.3-10.7-2.2 1.6-3.2 4-3 6.5C10 9.5 9.2 8.4 9 7c-2 1.8-3.5 4.4-3.5 7.7C5.5 18.4 8 21 12 21z"/>',
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.5-2h5.4l1.5 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.4"/>',
    send: '<path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5z"/>', video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3z"/>', pen: '<path d="M4 20l1.2-4.6L15.6 5a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z"/><path d="M13.5 7l3.5 3.5"/>',
    sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v3M17.5 4.5h3"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24">${SY[k]}</svg>`;
  const sym = (k, c, cls = '') => `<span class="sym ${cls}" style="--c:${c}">${svg(k)}</span>`;

  /* ——— الوقت والترتيب ——— */
  const AD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayLabel = k => { const t = today(); if (k === t) return 'اليوم'; if (k === addD(t, 1)) return 'غداً'; if (k === addD(t, -1)) return 'أمس'; const d = pk(k); const diff = Math.round((d - pk(t)) / 864e5); return diff > 0 && diff < 7 ? AD[d.getDay()] : `${AD[d.getDay()]} ${n(d.getDate())}/${n(d.getMonth() + 1)}`; };
  const tLabel = hm => { if (!hm) return ''; const [h, m] = hm.split(':').map(Number), h12 = ((h + 11) % 12) + 1; return `${n(h12)}${m ? ':' + n(pad(m)) : ''} ${h < 12 ? 'ص' : 'م'}`; };
  const dueStr = t => t.date ? dayLabel(t.date) + (t.time ? ' · ' + tLabel(t.time) : '') : '';
  const dueTs = t => t.date ? new Date(`${t.date}T${t.time || '23:59'}:00`).getTime() : Infinity;
  const isOver = t => !t.done && t.date && dueTs(t) < Date.now();
  const PW = { h: 0, m: 1, l: 2 };
  const sortT = (a, b) => (isOver(b) - isOver(a)) || (PW[a.pr] - PW[b.pr]) || (dueTs(a) - dueTs(b)) || (b.created - a.created);

  /* ——— فهم الكلام العربي ——— */
  const NUMW = { 'واحدة': 1, 'الواحدة': 1, 'واحد': 1, 'اثنين': 2, 'ثنتين': 2, 'الثانية': 2, 'ثلاث': 3, 'الثالثة': 3, 'اربع': 4, 'أربع': 4, 'الرابعة': 4, 'خمس': 5, 'الخامسة': 5, 'ست': 6, 'السادسة': 6, 'سبع': 7, 'السابعة': 7, 'ثمان': 8, 'ثمانية': 8, 'الثامنة': 8, 'تسع': 9, 'التاسعة': 9, 'عشر': 10, 'عشرة': 10, 'العاشرة': 10, 'احدعش': 11, 'إحدى عشرة': 11, 'الحادية عشرة': 11, 'اثنعش': 12, 'اثني عشر': 12, 'الثانية عشرة': 12 };
  function parse(text) {
    const s = toEn(text), r = {}; const t0 = today();
    if (/عاجل|ضروري|مهم جدا|مهم جداً|بسرعة|ضرورى/.test(s)) r.pr = 'h'; else if (/مهم/.test(s)) r.pr = 'h'; else if (/مو مهم|غير مهم|بسيط|إذا تيسر|لاحقا|لاحقاً/.test(s)) r.pr = 'l';
    const DRE = [];
    if (/بعد بكر[ةه]|بعد غد/.test(s)) { r.date = addD(t0, 2); DRE.push(/بعد (بكر[ةه]|غد)/); } else if (/بكر[ةه]|باكر|غداً?/.test(s)) { r.date = addD(t0, 1); DRE.push(/بكر[ةه]|باكر|غداً?/); }
    else if (/الاسبوع الجاي|الأسبوع القادم|الاسبوع القادم|الأسبوع الجاي/.test(s)) { r.date = addD(t0, 7); DRE.push(/ال[أا]سبوع (الجاي|القادم)/); }
    if (!r.date) AD.forEach((d, i) => { const re = new RegExp('(يوم )?' + d.replace('ال', '(ال)?') + '(?![\\u0600-\\u06FF])'); if (!r.date && re.test(s)) { const cur = new Date().getDay(); let diff = (i - cur + 7) % 7; if (diff === 0) diff = 7; r.date = addD(t0, diff); DRE.push(re); } });
    if (!r.date && /اليوم(?! الوطني)|الحين|هالحين/.test(s)) { r.date = t0; DRE.push(/اليوم(?! الوطني)|ه?الحين/); }
    let h = null, mn = 0, m1 = s.match(/الساعة\s*(\d{1,2})(?::(\d{2}))?/);
    if (m1) { h = +m1[1]; if (m1[2]) mn = +m1[2]; } else { for (const w in NUMW) { if (new RegExp('الساعة\\s*' + w).test(s)) { h = NUMW[w]; break; } } }
    if (h != null) { if (/ونص|والنصف/.test(s)) mn = 30; else if (/وربع/.test(s)) mn = 15;
      if (/مساء|مساءً|بالليل|الليل|العصر|عصرا|المغرب|العشاء/.test(s) && h < 12) h += 12; else if (/الظهر/.test(s) && h < 6) h += 12; else if (!/صباح|الصبح|صباحا|الفجر/.test(s) && h >= 1 && h <= 5) h += 12;
      r.time = `${pad(h % 24)}:${pad(mn)}`; if (!r.date) r.date = (h * 60 + mn) > new Date().getHours() * 60 + new Date().getMinutes() ? t0 : addD(t0, 1); }
    const cm = [[/تصميم|صمم|بوستر|إعلان|اعلان|بطاقة|انفوجراف|شعار|قالب/, 'design'], [/نشر|انشر|بوست|منشور|ستوري|انستقرام|انستغرام|تويتر|إكس|اكس|سناب|تيك ?توك|الحساب|واتساب/, 'post'], [/تغطية|غطي/, 'cover'], [/تصوير|صور|فيديو|مونتاج|ريلز|ريل|مقطع|كاميرا/, 'photo'], [/حفل|فعالية|طابور|إذاعة|اذاعة|مسابقة|احتفال|زيارة|تكريم/, 'cover'], [/كتابة|اكتب|خبر|نص|محتوى|تقرير|كابشن|تعليق/, 'content'], [/اجتماع|لقاء|مجلس/, 'meet']];
    for (const [re, c] of cm) if (re.test(s)) { r.cat = c; break; }
    let title = toEn(text).replace(/^(ذكرني|ذكّرني|تذكير|لازم|سجل|سجّل)\s*(ب|ان|أن)?\s*/, '');
    DRE.forEach(re => { title = title.replace(re, ' '); });
    title = title.replace(/(في )?الساعة\s*(\d{1,2}(:\d{2})?|[\u0600-\u06FF]+( عشر[ةه]?)?)(\s*(و(نص|النصف|ربع)))?(\s*(صباحاً?|مساءً?|الصبح|العصر|عصراً?|الظهر|بالليل|الليل|المغرب|العشاء|الفجر))?/, ' ')
      .replace(/\s(مهم جداً?|مهم|عاجل|ضروري|بسرعة|بسيط|غير مهم|مو مهم|إذا تيسر|لاحقاً?)(?=\s|$)/g, ' ').replace(/\s+(في|يوم)\s*$/, '').replace(/\s+/g, ' ').trim();
    r.title = (title || text).replace(/\d/g, d => AR[d]);
    return r;
  }

  /* ——— الإشعارات والشارة ——— */
  function badge() { const c = T.filter(t => !t.done && t.date && t.date <= today()).length; try { if (navigator.setAppBadge) c ? navigator.setAppBadge(c) : navigator.clearAppBadge(); } catch (e) {} }
  const notified = new Set(load('notified', []));
  function checkDue() {
    const now = Date.now();
    T.forEach(t => { if (t.done || !t.date || !t.time) return; const due = dueTs(t), pre = due - ST.remind * 60000, key = t.id + '@' + t.date + t.time;
      if (now >= pre && now < due + 3600000 && !notified.has(key)) { notified.add(key); localStorage.setItem(K + 'notified', JSON.stringify([...notified].slice(-200)));
        banner(t); try { if (window.Notification && Notification.permission === 'granted') navigator.serviceWorker && navigator.serviceWorker.ready.then(r => r.showNotification('منسّق: ' + t.title, { body: (PR[t.pr].t) + ' · ' + dueStr(t), icon: 'icon-180.png?v=6', tag: t.id })); } catch (e) {} } });
  }
  function banner(t) { const el = $('#banner'); el.innerHTML = `${sym('bell', PR[t.pr].c, 'sm')}<div class="grow"><b>${esc(t.title)}</b><span>${dueStr(t)} · أولوية ${PR[t.pr].t}</span></div><button data-act="open" data-id="${t.id}">عرض</button>`; el.classList.add('on'); haptic(); sfx(); clearTimeout(banner.t); banner.t = setTimeout(() => el.classList.remove('on'), 7000); }
  let AC; function sfx() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime; [880, 1320].forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f; o.type = 'sine'; o.connect(g); g.connect(AC.destination); g.gain.setValueAtTime(0.0001, t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.15, t + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.35); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.4); }); } catch (e) {} }

  // ملف تقويم (ics) لتذكير مضمون في تقويم الآيفون
  function ics(t) {
    const d = t.date.replace(/-/g, ''), tm = (t.time || '07:00').replace(':', '') + '00', end = (() => { const x = new Date(`${t.date}T${t.time || '07:00'}:00`); x.setMinutes(x.getMinutes() + 30); return `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`; })();
    const clean = s => String(s || '').replace(/[,;\\]/g, ' ').replace(/\n/g, '\\n');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Monasiq//AR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${t.id}@monasiq`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${d}T${tm}`, `DTEND:${end}`, `SUMMARY:${clean('📌 ' + t.title)}`, `DESCRIPTION:${clean('أولوية ' + PR[t.pr].t + (t.notes ? ' — ' + t.notes : ''))}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${clean(t.title)}`, `TRIGGER:-PT${ST.remind}M`, 'END:VALARM',
      ...(t.pr === 'h' ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${clean(t.title)}`, 'TRIGGER:-P1D', 'END:VALARM'] : []), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  async function toCalendar(t) {
    if (!t.date) return toast('حدّد تاريخاً للمهمة أولاً');
    const file = new File([ics(t)], 'tadhkeer.ics', { type: 'text/calendar' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: t.title }); return; } } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = 'tadhkeer.ics'; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ——— الصوت: تحويل الكلام إلى نص أو تسجيل مذكرة ——— */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, mr = null, chunks = [], recBlob = null;
  // الاستماع: تحويل مباشر إذا دعمه الجهاز، وإلا بديل مضمون (إملاء الكيبورد أو مذكرة صوتية)
  let vWatch = null, vSil = null, gotText = false;
  function voiceUI(on) { const mb = $('#micB'), w = $('#vwave'); mb && mb.classList.toggle('on', on); w && w.classList.toggle('on', on); }
  function startVoice() {
    const inp = $('#aT');
    if (rec || mr) return stopVoice();
    if (!SR || localStorage.getItem(K + 'srBad')) return voiceFallback(false);
    gotText = false; const base = inp.value ? inp.value + ' ' : '';
    try {
      rec = new SR(); rec.lang = 'ar-SA'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
      rec.onresult = e => { let s = ''; for (const r of e.results) s += r[0].transcript; if (s.trim()) gotText = true; inp.value = base + s; preview();
        clearTimeout(vWatch); clearTimeout(vSil); vSil = setTimeout(() => { try { rec && rec.stop(); } catch (x) {} }, 2200); };
      rec.onerror = e => { rec._err = e.error; };
      rec.onend = () => { const err = rec && rec._err; rec = null; clearTimeout(vWatch); clearTimeout(vSil); voiceUI(false); preview();
        if (!gotText) { if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'audio-capture') localStorage.setItem(K + 'srBad', '1'); voiceFallback(true); } else haptic(); };
      rec.start(); voiceUI(true);
      vWatch = setTimeout(() => { if (!gotText) { try { rec && rec.abort(); } catch (x) {} } }, 7000);
    } catch (e) { rec = null; voiceUI(false); voiceFallback(true); }
  }
  function voiceFallback(failed) {
    const box = $('#vfb'); if (!box) return;
    box.innerHTML = `<b>${failed ? 'ما قدرت أسمعك هنا' : 'الاستماع المباشر غير متاح في هذا الجهاز'}</b>
      <span>الطريقة المضمونة في الآيفون: اضغط على الحقل ثم زر المايك 🎙 في الكيبورد وتكلّم، ويكتب لك الكلام مباشرة.</span>
      <div class="vfb-b"><button data-act="dictate">${svg('mic')} إملاء من الكيبورد</button><button data-act="memo">${svg('play')} تسجيل مذكرة صوتية</button>${failed ? `<button data-act="retryV">إعادة المحاولة</button>` : ''}</div>`;
    box.hidden = false;
  }
  async function recordMemo() {
    const mb = $('#micB');
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); chunks = []; mr = new MediaRecorder(stream);
      mr.ondataavailable = e => chunks.push(e.data); mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); recBlob = new Blob(chunks, { type: mr.mimeType || 'audio/mp4' }); mr = null; mb.classList.remove('on'); $('#vwave').classList.remove('on');
        $('#memo').hidden = false; if (!$('#aT').value) $('#aT').value = 'مذكرة صوتية'; toast('حُفظ التسجيل الصوتي مع المهمة'); };
      mr.start(); mb.classList.add('on'); $('#vwave').classList.add('on'); toast('يسجّل… اضغط مرة أخرى للإيقاف');
    } catch (e) { toast('اسمح للتطبيق باستخدام المايكروفون، أو استخدم مايك الكيبورد'); }
  }
  function stopVoice() { clearTimeout(vWatch); clearTimeout(vSil); try { rec && rec.stop(); } catch (e) {} try { mr && mr.stop(); } catch (e) {} }

  /* ——— الشاشات ——— */
  let tab = 'home', filter = 'all', q = '', weekOff = 0;
  function row(t, i = 0) {
    const c = CAT(t.cat), sd = (t.sub || []).filter(x => x.d).length, ov = isOver(t);
    return `<div class="task ${t.done ? 'done' : ''} ${ov ? 'over' : ''}" style="--p:${PR[t.pr].c};--i:${i}" data-act="open" data-id="${t.id}">
      <button class="chk" data-act="toggle" data-id="${t.id}" aria-label="إنجاز"><svg viewBox="0 0 24 24">${SY.check}</svg></button>
      <div class="grow"><div class="tt">${esc(t.title)}</div>
        <div class="tm">${t.date ? `<span class="${ov ? 'red' : ''}">${svg('clock')}${dueStr(t)}</span>` : ''}<span style="color:${c[2]}">${svg(c[3])}${c[1]}</span>${(t.sub || []).length ? `<span>${svg('sub')}${n(sd)}/${n(t.sub.length)}</span>` : ''}${t.audio ? `<span>${svg('mic')}</span>` : ''}${t.rep && t.rep !== 'none' ? `<span>${svg('repeat')}</span>` : ''}</div></div>
      <span class="pflag" title="أولوية ${PR[t.pr].t}">${svg('flag')}</span></div>`;
  }
  function viewHome() {
    const t0 = today(), open = T.filter(t => !t.done), todayT = open.filter(t => t.date && t.date <= t0).sort(sortT), soon = open.filter(t => t.date && t.date > t0 && t.date <= addD(t0, 7)).sort(sortT), noDate = open.filter(t => !t.date).sort(sortT);
    const doneToday = T.filter(t => t.done && dk(new Date(t.done)) === t0).length, totalToday = todayT.length + doneToday, pct = totalToday ? doneToday / totalToday : 0;
    const cnt = p => open.filter(t => t.pr === p).length, over = open.filter(isOver).length;
    const R = 46, C = 2 * Math.PI * R, h = new Date().getHours();
    return `
    <header class="hd home-hd"><button class="av" data-act="settings" aria-label="الملف الشخصي"><img src="me.png?v=1" alt=""></button><div class="grow"><div class="eyebrow"><img src="mark-g.png?v=1" class="mk" alt="">${esc(ST.school)}</div><h1>${h < 12 ? 'صباح الخير' : 'مساء الخير'}، أ. ${esc((ST.name || '').split(' ')[0])}</h1></div><button class="icon-b" data-act="settings" aria-label="الإعدادات">${svg('gear')}</button></header>
    <section class="hero"><img class="hero-wm" src="logo-w.png?v=1" alt="">
      <div class="hring"><svg viewBox="0 0 110 110" class="art"><circle cx="55" cy="55" r="${R}" class="rt"/><circle cx="55" cy="55" r="${R}" class="rf" style="stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct)}" transform="rotate(-90 55 55)"/></svg>
        <div class="hri"><b data-count="${Math.round(pct * 100)}">${n(Math.round(pct * 100))}</b><span>٪ اليوم</span></div></div>
      <div class="hs grow"><b>${todayT.length ? `${n(todayT.length)} ${todayT.length > 2 && todayT.length < 11 ? 'مهام' : 'مهمة'} لليوم` : 'يومك فاضي ✨'}</b><span>${over ? `<em>${n(over)} متأخرة</em> · ` : ''}أنجزت ${n(doneToday)} اليوم</span>
        <div class="prs">${['h', 'm', 'l'].map(p => `<button data-act="filter" data-f="${p}" style="--p:${PR[p].c}"><i></i>${PR[p].t}<b>${n(cnt(p))}</b></button>`).join('')}</div></div>
    </section>
    <button class="voicebar" data-act="addVoice"><span class="vb-ic">${svg('mic')}</span><span class="grow"><b>قل مهمتك…</b><small>«ذكرني بنشر صور الطابور بكرة الساعة ٧ مهم»</small></span>${svg('sparkle')}</button>
    ${todayT.length ? `<h2 class="label">اليوم والمتأخرة</h2><div class="group">${todayT.map(row).join('')}</div>` : `<div class="empty card"><div class="e-ic">${svg('check')}</div><b>لا مهام لليوم</b><span>أضف مهمة بالصوت أو بالكتابة من زر +</span></div>`}
    ${soon.length ? `<h2 class="label">الأيام القادمة</h2><div class="group">${soon.slice(0, 8).map(row).join('')}</div>` : ''}
    ${noDate.length ? `<h2 class="label">بدون موعد</h2><div class="group">${noDate.slice(0, 6).map(row).join('')}</div>` : ''}
    <div class="credit-card"><img src="mark-g.png?v=1" alt=""><div><b>منسّق</b><span>برنامج خاص بالمنسّق الإعلامي لمدرسة معاذ بن جبل</span><small>تصميم وتطوير: الأزهر الناعبي</small></div></div>`;
  }
  function viewAll() {
    let L = T.slice();
    if (filter === 'done') L = L.filter(t => t.done); else { L = L.filter(t => !t.done); if (PR[filter]) L = L.filter(t => t.pr === filter); else if (filter === 'over') L = L.filter(isOver); else if (filter.startsWith('c:')) L = L.filter(t => t.cat === filter.slice(2)); }
    if (q) L = L.filter(t => (t.title + ' ' + (t.notes || '')).includes(q));
    L.sort(filter === 'done' ? (a, b) => b.done - a.done : sortT);
    const chip = (f, label, c) => `<button class="${filter === f ? 'on' : ''}" data-act="filter" data-f="${f}" ${c ? `style="--p:${c}"` : ''}>${c ? '<i></i>' : ''}${label}</button>`;
    return `<header class="hd"><div class="grow"><h1>كل المهام</h1></div></header>
      <div class="search">${svg('search')}<input id="q" placeholder="ابحث في المهام" value="${esc(q)}"></div>
      <div class="chips">${chip('all', 'الكل')}${chip('h', 'عالية', PR.h.c)}${chip('m', 'متوسطة', PR.m.c)}${chip('l', 'منخفضة', PR.l.c)}${chip('over', 'المتأخرة', '#FF3B30')}${CATS.map(c => chip('c:' + c[0], c[1], c[2])).join('')}${chip('done', 'المنجزة')}</div>
      <div id="alist">${L.length ? `<div class="group">${L.map(row).join('')}</div>` : `<div class="empty card"><div class="e-ic">${svg('list')}</div><b>لا توجد مهام هنا</b></div>`}</div>`;
  }
  function viewWeek() {
    const base = addD(today(), weekOff * 7), days = Array.from({ length: 7 }, (_, i) => addD(base, i));
    return `<header class="hd"><div class="grow"><h1>الأسبوع</h1><div class="sub">${weekOff ? (weekOff > 0 ? 'الأسابيع القادمة' : 'أسابيع سابقة') : 'من اليوم إلى ٧ أيام'}</div></div>
      <button class="icon-b" data-act="wk" data-d="-1">‹</button><button class="icon-b" data-act="wk" data-d="1">›</button></header>
      <div class="wstrip">${days.map(k => { const c = T.filter(t => t.date === k && !t.done), d = pk(k); return `<a href="#d${k}" class="${k === today() ? 'tdy' : ''}"><span>${AD[d.getDay()].replace('ال', '')}</span><b>${n(d.getDate())}</b><i>${c.slice(0, 3).map(t => `<u style="background:${PR[t.pr].c}"></u>`).join('')}</i></a>`; }).join('')}</div>
      ${days.map(k => { const L = T.filter(t => t.date === k).sort(sortT); return `<h2 class="label" id="d${k}">${dayLabel(k)} <small>${n(pk(k).getDate())}/${n(pk(k).getMonth() + 1)}</small></h2>${L.length ? `<div class="group">${L.map(row).join('')}</div>` : `<button class="addday" data-act="add" data-date="${k}">${svg('plus')} أضف مهمة</button>`}`; }).join('')}`;
  }
  function viewSettings() {
    return `<header class="hd"><div class="grow"><h1>الإعدادات</h1></div></header>
      <div class="profile"><img class="pf-logo" src="logo-w.png?v=1" alt=""><img class="pf-me" src="me.png?v=1" alt=""><b>أ. ${esc(ST.name)}</b><span>المنسّق الإعلامي · حساب ${esc(ST.school)}</span><div class="pf-st"><div><b>${n(T.filter(t => !t.done).length)}</b><small>مفتوحة</small></div><div><b>${n(T.filter(t => t.done).length)}</b><small>منجزة</small></div><div><b>${n(T.filter(t => !t.done && t.pr === 'h').length)}</b><small>عالية</small></div></div></div>
      <div class="group form"><label>الاسم<input id="sN" value="${esc(ST.name)}"></label><label>المدرسة<input id="sS" value="${esc(ST.school)}"></label></div>
      <h2 class="label">التذكير</h2>
      <div class="group"><div class="li"><span class="grow">التنبيه قبل الموعد</span><select id="sR">${[[0, 'في الموعد'], [5, '٥ دقائق'], [15, '١٥ دقيقة'], [30, '٣٠ دقيقة'], [60, 'ساعة']].map(([v, t]) => `<option value="${v}" ${ST.remind == v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <button class="li" data-act="perm"><span class="grow">تفعيل الإشعارات داخل التطبيق</span><span class="sub">${window.Notification ? (Notification.permission === 'granted' ? 'مفعّلة ✓' : 'اضغط للتفعيل') : 'غير مدعوم'}</span></button></div>
      <p class="foot">لتذكير مضمون حتى والتطبيق مغلق: افتح المهمة واضغط «أضفها للتقويم»، فيذكّرك تقويم الآيفون في موعدها.</p>
      <h2 class="label">المظهر</h2>
      <div class="group"><div class="seg">${[['auto', 'تلقائي'], ['light', 'فاتح'], ['dark', 'داكن']].map(([k, t]) => `<button class="${ST.theme === k ? 'on' : ''}" data-act="theme" data-k="${k}">${t}</button>`).join('')}</div></div>
      <h2 class="label">البيانات</h2>
      <div class="group"><button class="li" data-act="export"><span class="grow">حفظ نسخة احتياطية</span></button><button class="li" data-act="import"><span class="grow">استرجاع نسخة</span></button><button class="li red" data-act="clearDone"><span class="grow">حذف المهام المنجزة</span></button></div>
      <div class="credit-card"><img src="mark-g.png?v=1" alt=""><div><b>منسّق</b><span>بياناتك محفوظة على جوالك فقط</span><small>تصميم وتطوير: الأزهر الناعبي</small></div></div><input type="file" id="impF" accept=".json,application/json" hidden>`;
  }

  /* ——— إضافة وتعديل ——— */
  let draft = null;
  function addSheet(pre = {}, voice) {
    draft = Object.assign({ pr: 'm', cat: 'post', date: '', time: '', rep: 'none', notes: '' }, pre); recBlob = null;
    openSheet(`<div class="grab"></div><div class="sh-h"><button class="tx" data-act="close">إلغاء</button><b>مهمة جديدة</b><button class="tx bold" data-act="saveNew">إضافة</button></div>
      <div class="ain"><textarea id="aT" rows="2" placeholder="ماذا تريد أن تتذكر؟">${esc(draft.title || '')}</textarea><button class="mic" id="micB" data-act="mic" aria-label="تسجيل صوتي">${svg('mic')}</button></div>
      <div class="vwave" id="vwave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span>أستمع…</span></div>
      <div id="vfb" class="vfb" hidden></div>
      <div id="memo" class="memo" hidden>${svg('mic')} تسجيل صوتي مرفق</div>
      <div id="pv" class="pv"></div>
      ${editorFields()}
      <p class="hint">تكلّم بطبيعتك: «تغطية حفل التكريم الأحد الساعة ١٠ مهم» أو «تصميم بوستر اليوم الوطني بكرة» — يفهم التطبيق اليوم والوقت والأهمية والتصنيف.</p>`);
    $('#aT').addEventListener('input', preview); preview(true);
    if (voice) setTimeout(startVoice, 350); else setTimeout(() => $('#aT').focus(), 350);
  }
  function editorFields() {
    const d = draft, t0 = today();
    return `<div class="group ed">
      <div class="li"><span class="lbl">${sym('flag', PR[d.pr].c, 'sm')}الأهمية</span><div class="seg sm">${['h', 'm', 'l'].map(p => `<button class="${d.pr === p ? 'on' : ''}" data-act="dpr" data-p="${p}" style="--p:${PR[p].c}">${PR[p].t}</button>`).join('')}</div></div>
      <div class="li col"><span class="lbl">${sym('cal', '#FF3B30', 'sm')}الموعد</span><div class="quick">${[['اليوم', t0], ['غداً', addD(t0, 1)], ['بعد غد', addD(t0, 2)], ['الأسبوع القادم', addD(t0, 7)], ['بدون', '']].map(([l, v]) => `<button class="${d.date === v ? 'on' : ''}" data-act="ddate" data-v="${v}">${l}</button>`).join('')}</div>
        <div class="dt"><label><small>التاريخ</small><input type="date" id="dD" value="${d.date}"></label><label><small>الوقت</small><input type="time" id="dTm" value="${d.time}"></label></div></div>
      <div class="li col"><span class="lbl">${sym(CAT(d.cat)[3], CAT(d.cat)[2], 'sm')}التصنيف</span><div class="quick">${CATS.map(c => `<button class="${d.cat === c[0] ? 'on' : ''}" data-act="dcat" data-v="${c[0]}" style="--p:${c[2]}">${c[1]}</button>`).join('')}</div></div>
      <div class="li"><span class="lbl">${sym('repeat', '#8E8E93', 'sm')}التكرار</span><select id="dRep">${[['none', 'لا يتكرر'], ['daily', 'يومياً'], ['weekly', 'أسبوعياً']].map(([v, t]) => `<option value="${v}" ${d.rep === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="li col"><span class="lbl">${sym('doc', '#0A84FF', 'sm')}ملاحظات</span><textarea id="dN" rows="2" placeholder="تفاصيل إضافية">${esc(d.notes)}</textarea></div></div>`;
  }
  function readFields() { draft.date = $('#dD').value; draft.time = $('#dTm').value; draft.rep = $('#dRep').value; draft.notes = $('#dN').value.trim(); }
  function preview(init) {
    const v = $('#aT').value.trim(); if (!v) { $('#pv').innerHTML = ''; return; }
    const r = parse(v), chips = [];
    if (r.pr && r.pr !== draft.pr) { draft.pr = r.pr; refreshEditor(); }
    if (r.date && r.date !== draft.date) { draft.date = r.date; refreshEditor(); }
    if (r.time && r.time !== draft.time) { draft.time = r.time; refreshEditor(); }
    if (r.cat && r.cat !== draft.cat) { draft.cat = r.cat; refreshEditor(); }
    if (r.date || r.time) chips.push(`${svg('clock')}${dueStr({ date: draft.date, time: draft.time })}`); if (r.pr) chips.push(`<i style="background:${PR[r.pr].c}"></i>${PR[r.pr].t}`); if (r.cat) chips.push(`${svg(CAT(r.cat)[3])}${CAT(r.cat)[1]}`);
    $('#pv').innerHTML = chips.length ? `<span class="pv-l">${svg('sparkle')} فهمت:</span>${chips.map(c => `<span>${c}</span>`).join('')}` : '';
  }
  function refreshEditor() { const notes = $('#dN') ? $('#dN').value : draft.notes; const ed = document.querySelector('.ed'); if (!ed) return; draft.notes = notes; const box = document.createElement('div'); box.innerHTML = editorFields(); ed.replaceWith(box.firstElementChild); }

  function detailSheet(id) {
    const t = T.find(x => x.id === id); if (!t) return; draft = Object.assign({}, t);
    openSheet(`<div class="grab"></div><div class="sh-h"><button class="tx" data-act="close">إغلاق</button><b>تفاصيل المهمة</b><button class="tx bold" data-act="saveEdit" data-id="${id}">حفظ</button></div>
      <div class="ain"><textarea id="aT" rows="2">${esc(t.title)}</textarea></div>
      ${t.audio ? `<button class="memo play" data-act="playMemo" data-id="${id}">${svg('play')} تشغيل التسجيل الصوتي</button>` : ''}
      ${editorFields()}
      <h3 class="sh3">${svg('sub')} مهام فرعية</h3>
      <div class="group subs">${(t.sub || []).map((s, i) => `<div class="li sbt ${s.d ? 'done' : ''}"><button class="chk sm" data-act="subT" data-id="${id}" data-i="${i}"><svg viewBox="0 0 24 24">${SY.check}</svg></button><span class="grow">${esc(s.t)}</span><button class="xb" data-act="subDel" data-id="${id}" data-i="${i}">${svg('x')}</button></div>`).join('')}
        <div class="li"><input id="subIn" placeholder="أضف خطوة…"><button class="tx bold" data-act="subAdd" data-id="${id}">إضافة</button></div></div>
      <div class="acts"><button class="act cal" data-act="cal" data-id="${id}">${svg('bell')}<span>أضفها للتقويم</span></button><button class="act" data-act="shareT" data-id="${id}">${svg('share')}<span>مشاركة</span></button><button class="act red" data-act="del" data-id="${id}">${svg('trash')}<span id="delT">حذف</span></button></div>`);
  }

  /* ——— الأدوات ——— */
  function openSheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; requestAnimationFrame(() => $('#sheet').classList.add('on')); }
  function closeSheet() { stopVoice(); const s = $('#sheet'); s.classList.remove('on'); setTimeout(() => { s.hidden = true; }, 320); }
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2300); }
  function confetti() { const b = document.createElement('div'); b.className = 'conf'; b.innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="--x:${Math.cos(i / 18 * 6.28) * (60 + i % 3 * 25)}px;--y:${Math.sin(i / 18 * 6.28) * (60 + i % 3 * 25)}px;--c:${['#C9A04A', '#E8C877', '#FF9F0A', '#0A84FF', '#FFFFFF'][i % 5]}"></i>`).join(''); return b; }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function nextRep(t) { if (!t.rep || t.rep === 'none' || !t.date) return; const nt = Object.assign({}, t, { id: uid(), done: null, created: Date.now(), date: addD(t.date, t.rep === 'daily' ? 1 : 7), sub: (t.sub || []).map(s => ({ t: s.t, d: false })) }); T.push(nt); }

  const A = {
    tab: el => { tab = el.dataset.tab; render(); },
    tabGo: el => { tab = el.dataset.t; render(); },
    settings: () => { tab = 'settings'; render(); },
    add: el => addSheet(el && el.dataset.date ? { date: el.dataset.date } : {}),
    addVoice: () => addSheet({}, true),
    mic: () => { const f = $('#vfb'); if (f) f.hidden = true; startVoice(); },
    dictate: () => { $('#vfb').hidden = true; const i = $('#aT'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); toast('اضغط 🎙 في الكيبورد وتكلّم'); },
    memo: () => { $('#vfb').hidden = true; recordMemo(); },
    retryV: () => { localStorage.removeItem(K + 'srBad'); $('#vfb').hidden = true; startVoice(); },
    close: closeSheet,
    dpr: el => { readFields(); draft.pr = el.dataset.p; refreshEditor(); haptic(); },
    ddate: el => { readFields(); draft.date = el.dataset.v; if (!draft.date) draft.time = ''; refreshEditor(); },
    dcat: el => { readFields(); draft.cat = el.dataset.v; refreshEditor(); },
    async saveNew() {
      const title = $('#aT').value.trim(); if (!title) { $('#aT').focus(); return toast('اكتب المهمة أو سجّلها بصوتك'); }
      stopVoice(); readFields(); const t = Object.assign({}, draft, { id: uid(), title: parse(title).title || title, created: Date.now(), done: null, sub: [], audio: false });
      if (recBlob) { try { await idb.put(t.id, recBlob); t.audio = true; } catch (e) {} }
      T.push(t); save(); closeSheet(); render(false); toast('أُضيفت المهمة'); haptic();
      if (t.date && t.time) setTimeout(() => { if (confirm('تبغى تضيف تذكيراً لهذه المهمة في تقويم الآيفون؟')) toCalendar(t); }, 400);
    },
    saveEdit: el => { const t = T.find(x => x.id === el.dataset.id); readFields(); Object.assign(t, { title: $('#aT').value.trim() || t.title, pr: draft.pr, cat: draft.cat, date: draft.date, time: draft.time, rep: draft.rep, notes: draft.notes }); save(); closeSheet(); render(false); toast('حُفظت التعديلات'); },
    open: el => detailSheet(el.dataset.id),
    toggle: (el, e) => { const t = T.find(x => x.id === el.dataset.id); if (!t) return; t.done = t.done ? null : Date.now(); if (t.done) { nextRep(t); const row = el.closest('.task'); row.classList.add('done', 'pop'); row.appendChild(confetti()); haptic(); toast(t.pr === 'h' ? 'أحسنت! أنجزت مهمة مهمة 🔥' : 'تم ✓'); setTimeout(() => { save(); render(false); }, 650); } else { save(); render(false); } },
    filter: el => { filter = el.dataset.f; tab = 'all'; render(); },
    wk: el => { weekOff += +el.dataset.d; render(); },
    subT: el => { const t = T.find(x => x.id === el.dataset.id); t.sub[+el.dataset.i].d = !t.sub[+el.dataset.i].d; save(); detailSheet(t.id); },
    subDel: el => { const t = T.find(x => x.id === el.dataset.id); t.sub.splice(+el.dataset.i, 1); save(); detailSheet(t.id); },
    subAdd: el => { const v = $('#subIn').value.trim(); if (!v) return; const t = T.find(x => x.id === el.dataset.id); readFields(); Object.assign(t, { pr: draft.pr, cat: draft.cat, date: draft.date, time: draft.time, rep: draft.rep, notes: draft.notes }); (t.sub = t.sub || []).push({ t: v, d: false }); save(); detailSheet(t.id); setTimeout(() => $('#subIn') && $('#subIn').focus(), 50); },
    cal: el => toCalendar(T.find(x => x.id === el.dataset.id)),
    async playMemo(el) { try { const b = await idb.get(el.dataset.id); if (!b) return toast('التسجيل غير موجود'); const a = new Audio(URL.createObjectURL(b)); a.play(); } catch (e) { toast('تعذّر التشغيل'); } },
    async shareT(el) { const t = T.find(x => x.id === el.dataset.id), txt = `📌 ${t.title}\n${t.date ? '🗓 ' + dueStr(t) + '\n' : ''}أولوية: ${PR[t.pr].t}${t.notes ? '\n' + t.notes : ''}`;
      try { if (navigator.share) return await navigator.share({ text: txt }); } catch (e) { return; } window.open('https://wa.me/?text=' + encodeURIComponent(txt)); },
    del: el => { if (!A.del.armed) { A.del.armed = true; $('#delT').textContent = 'تأكيد الحذف'; setTimeout(() => { A.del.armed = false; }, 3000); return; } A.del.armed = false; const id = el.dataset.id; T = T.filter(x => x.id !== id); idb.del(id).catch(() => {}); save(); closeSheet(); render(false); toast('حُذفت المهمة'); },
    theme: el => { ST.theme = el.dataset.k; save(); applyTheme(); render(false); },
    async perm() { if (!window.Notification) return toast('الإشعارات غير مدعومة — استخدم «أضفها للتقويم»'); const p = await Notification.requestPermission(); toast(p === 'granted' ? 'فُعّلت الإشعارات' : 'لم تُفعّل'); render(false); },
    export: () => { const b = new Blob([JSON.stringify({ T, ST })], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `monasiq-${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('حُفظت النسخة'); },
    import: () => $('#impF').click(),
    clearDone: () => { if (!A.clearDone.armed) { A.clearDone.armed = true; toast('اضغط مرة أخرى لحذف المنجزة'); setTimeout(() => { A.clearDone.armed = false; }, 3000); return; } T = T.filter(t => !t.done); save(); render(false); toast('حُذفت المهام المنجزة'); },
  };
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = A[el.dataset.act]; if (f) { if (el.dataset.act === 'toggle' || el.closest('.sh-h') || el.tagName === 'BUTTON') e.stopPropagation(); f(el, e); } });
  document.addEventListener('input', e => {
    if (e.target.id === 'q') { q = e.target.value.trim(); const box = $('#alist'); const v = viewAll(); const tmp = document.createElement('div'); tmp.innerHTML = v; box.innerHTML = tmp.querySelector('#alist').innerHTML; }
    if (e.target.id === 'sN') { ST.name = e.target.value; save(); } if (e.target.id === 'sS') { ST.school = e.target.value; save(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'sR') { ST.remind = +e.target.value; save(); }
    if (e.target.id === 'impF' && e.target.files[0]) { const fr = new FileReader(); fr.onload = () => { try { const d = JSON.parse(fr.result); T = d.T || []; ST = Object.assign(ST, d.ST || {}); save(); render(); toast('تم الاسترجاع'); } catch (x) { toast('الملف غير صالح'); } }; fr.readAsText(e.target.files[0]); }
  });
  $('#sheet .sheet-bg').addEventListener('click', closeSheet);
  document.querySelectorAll('#tabs [data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
  $('#fab').addEventListener('click', () => addSheet());
  let lp; $('#fab').addEventListener('touchstart', () => { lp = setTimeout(() => { lp = 'done'; addSheet({}, true); }, 450); }, { passive: true }); $('#fab').addEventListener('touchend', e => { if (lp === 'done') e.preventDefault(); clearTimeout(lp); });

  function applyTheme() { const dark = ST.theme === 'dark' || (ST.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }
  function countUp() { document.querySelectorAll('[data-count]').forEach(el => { const to = +el.dataset.count, t0 = performance.now(); const st = t => { const k = Math.min(1, (t - t0) / 900); el.textContent = n(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); }); }
  function render(anim = true) {
    const v = $('#view'), y = scrollY;
    v.innerHTML = tab === 'home' ? viewHome() : tab === 'all' ? viewAll() : tab === 'week' ? viewWeek() : viewSettings();
    if (anim) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); scrollTo(0, 0); countUp(); const rf = v.querySelector('.rf'); if (rf) { const to = rf.style.strokeDashoffset; rf.style.transition = 'none'; rf.style.strokeDashoffset = rf.style.strokeDasharray; requestAnimationFrame(() => requestAnimationFrame(() => { rf.style.transition = ''; rf.style.strokeDashoffset = to; })); } }
    else { v.classList.remove('enter'); scrollTo(0, y); v.querySelectorAll('[data-count]').forEach(e => { e.textContent = n(e.dataset.count); }); }
    document.querySelectorAll('#tabs [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  applyTheme(); render(); badge(); checkDue(); setInterval(checkDue, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDue(); render(false); } });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__mn = { parse, T: () => T };
})();
