/* كمّل — بيانات تجريبية (ملاعب وأسماء وهمية للعرض فقط) تُستخدم عندما لا يكون التطبيق مربوطاً بـ Firebase */
window.KMDemo = (() => {
  const PITCHES = [
    { id: 'p1', n: 'ترتان النخبة', gov: 'مسقط', w: 'السيب', price: 18, fmt: [5, 6], f: ['light', 'shower', 'park', 'balls'], hue: 142 },
    { id: 'p2', n: 'ملاعب الموج', gov: 'مسقط', w: 'بوشر', price: 22, fmt: [5, 7], f: ['light', 'shower', 'park', 'cafe', 'ac'], hue: 160 },
    { id: 'p3', n: 'ترتان الأبطال', gov: 'مسقط', w: 'العامرات', price: 15, fmt: [5], f: ['light', 'park', 'water'], hue: 120 },
    { id: 'p4', n: 'ستاد الحي', gov: 'مسقط', w: 'مطرح', price: 14, fmt: [5], f: ['light', 'water'], hue: 100 },
    { id: 'p5', n: 'ملعب الشاطئ', gov: 'شمال الباطنة', w: 'صحار', price: 16, fmt: [5, 7], f: ['light', 'shower', 'park', 'balls'], hue: 175 },
    { id: 'p6', n: 'ترتان القلعة', gov: 'الداخلية', w: 'نزوى', price: 13, fmt: [5, 6], f: ['light', 'park', 'cover'], hue: 85 },
    { id: 'p7', n: 'ملاعب الخريف', gov: 'ظفار', w: 'صلالة', price: 17, fmt: [5, 7], f: ['light', 'shower', 'cafe', 'park'], hue: 150 },
    { id: 'p8', n: 'ترتان الواحة', gov: 'الظاهرة', w: 'عبري', price: 12, fmt: [5], f: ['light', 'water', 'park'], hue: 110 },
    { id: 'p9', n: 'ملعب الميناء', gov: 'جنوب الشرقية', w: 'صور', price: 14, fmt: [5, 6], f: ['light', 'shower', 'park'], hue: 190 },
  ];
  const NAMES = ['محمد', 'سالم', 'خالد', 'أحمد', 'يوسف', 'عبدالله', 'حمد', 'سعيد', 'فهد', 'مازن', 'هيثم', 'ناصر', 'علي', 'بدر', 'طلال', 'راشد', 'سيف', 'مهند', 'زكريا', 'إبراهيم', 'عمر', 'حسام'];
  const LEVELS = ['مبتدئ', 'متوسط', 'محترف'], NOTES = ['نلعب بروح رياضية', 'الكل يجيب لبس أبيض وأسود', 'نحتاج حارس إن أمكن', ''];
  const HOURS = [16, 17, 18, 19, 20, 21, 22, 23];
  const dk = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return function build() {
    let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const now = new Date(), nowH = now.getHours() + now.getMinutes() / 60;
    const pitches = PITCHES.map((p, i) => ({ ...p, owner: 'demo', demo: true, at: i }));
    const matches = [], books = [], slots = {};
    const meta = p => ({ pn: p.n, gov: p.gov, w: p.w, price: p.price, hue: p.hue });
    const free = (p, k, h, dur) => [...Array(dur).keys()].every(i => !slots[`${p.id}_${k}_${h + i}`]) && h + dur <= 24;
    const take = (p, k, h, dur, id) => { for (let i = 0; i < dur; i++) slots[`${p.id}_${k}_${h + i}`] = id; };
    for (let day = 0; day < 4; day++) {
      const k = dk(new Date(now.getFullYear(), now.getMonth(), now.getDate() + day));
      for (let i = 0; i < (day === 0 ? 7 : 5); i++) {
        const p = pitches[Math.floor(rnd() * pitches.length)], h = HOURS[Math.floor(rnd() * HOURS.length)], dur = rnd() > 0.7 ? 2 : 1;
        if ((day === 0 && h <= nowH + 0.5) || !free(p, k, h, dur)) continue;
        const fmt = p.fmt[Math.floor(rnd() * p.fmt.length)], tot = fmt * 2;
        let left = Math.max(3, Math.min(tot - 1, Math.floor(tot * (0.55 + rnd() * 0.4))));
        const pl = {}, o = Math.floor(rnd() * NAMES.length); let j = 0, org = null;
        while (left > 0) { const k2 = j === 0 && left > 2 ? 2 : 1, u = 'demo' + day + i + j; org = org || u;
          pl[u] = { n: NAMES[(o + j * 5) % NAMES.length], k: Math.min(k2, left), t: j }; left -= k2; j++; }
        const id = `dm${day}${i}`;
        matches.push({ id, p: p.id, d: k, h, dur, ...meta(p), fmt, lvl: LEVELS[Math.floor(rnd() * 3)], note: NOTES[Math.floor(rnd() * 4)], org, orgN: pl[org].n, ph: '', pl, demo: true, at: 0 });
        take(p, k, h, dur, id);
      }
      pitches.forEach((p, i) => { const h = HOURS[(i * 3 + day * 2) % 8];
        if (day < 3 && !(day === 0 && h <= nowH) && free(p, k, h, 1)) { const id = `db${day}${i}`; books.push({ id, p: p.id, d: k, h, dur: 1, ...meta(p), u: 'demo', n: NAMES[(i + day) % NAMES.length], demo: true }); take(p, k, h, 1, id); } });
    }
    return { day: dk(now), pitches, matches, books, slots };
  };
})();
