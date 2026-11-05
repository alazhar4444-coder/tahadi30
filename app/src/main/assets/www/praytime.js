/* حساب مواقيت الصلاة — خوارزمية فلكية قياسية (على نهج PrayTimes) */
(function (global) {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const sin = d => Math.sin(rad(d)), cos = d => Math.cos(rad(d)), tan = d => Math.tan(rad(d));
  const asin = x => deg(Math.asin(x)), acos = x => deg(Math.acos(x)), atan2 = (y, x) => deg(Math.atan2(y, x));
  const acot = x => deg(Math.atan(1 / x));
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  const METHODS = {
    MWL:     { name: 'رابطة العالم الإسلامي', fajr: 18,   isha: 17 },
    UMM:     { name: 'أم القرى (مكة)',         fajr: 18.5, ishaMin: 90 },
    GULF:    { name: 'منطقة الخليج',           fajr: 19.5, ishaMin: 90 },
    KARACHI: { name: 'جامعة كراتشي (18°/18°)',  fajr: 18,   isha: 18 },
    EGYPT:   { name: 'الهيئة المصرية',          fajr: 19.5, isha: 17.5 },
    DUBAI:   { name: 'دبي (18.2°)',            fajr: 18.2, isha: 18.2 },
    KUWAIT:  { name: 'الكويت',                 fajr: 18,   isha: 17.5 },
    QATAR:   { name: 'قطر',                    fajr: 18,   ishaMin: 90 }
  };

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = fix(atan2(cos(e) * sin(L), cos(L)), 360) / 15;
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(RA, 24) };
  }

  /* يرجع أوقات اليوم كأرقام عشرية بالساعات حسب التوقيت المحلي */
  function compute(date, lat, lng, opts) {
    opts = opts || {};
    const m = METHODS[opts.method] || METHODS.MWL;
    const asrF = opts.asrFactor || 1;
    const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
    const tz = opts.tz != null ? opts.tz : -new Date(y, mo - 1, d, 12).getTimezoneOffset() / 60;
    const jd = julian(y, mo, d) - lng / (15 * 24);

    const midDay = t => { const e = sunPosition(jd + t).eqt; return fix(12 - e, 24); };
    const angleTime = (angle, t, ccw) => {
      const decl = sunPosition(jd + t).decl, noon = midDay(t);
      const v = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
      if (v > 1 || v < -1) return NaN;
      const T = acos(v) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (f, t) => {
      const decl = sunPosition(jd + t).decl;
      return angleTime(-acot(f + tan(Math.abs(lat - decl))), t, false);
    };

    // تقديرات أولية ثم تحسين مرتين
    let T = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 };
    for (let i = 0; i < 2; i++) {
      const p = {}; for (const k in T) p[k] = T[k] / 24;
      T = {
        fajr: angleTime(m.fajr, p.fajr, true),
        sunrise: angleTime(0.833, p.sunrise, true),
        dhuhr: midDay(p.dhuhr),
        asr: asrTime(asrF, p.asr),
        sunset: angleTime(0.833, p.sunset, false),
        isha: m.isha != null ? angleTime(m.isha, p.isha, false) : NaN
      };
    }
    const shift = tz - lng / 15;
    const out = {};
    for (const k in T) out[k] = T[k] + shift;
    out.maghrib = out.sunset;
    if (m.ishaMin != null) out.isha = out.maghrib + m.ishaMin / 60;
    out.dhuhr += 1 / 60; // دقيقة احتياط بعد الزوال
    const adj = opts.adjust || {};
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(k => { out[k] += (adj[k] || 0) / 60; });
    return out;
  }

  /* يرجع كائنات Date لكل صلاة */
  function times(date, lat, lng, opts) {
    const t = compute(date, lat, lng, opts);
    const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const res = {};
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(k => {
      const mins = Math.round(t[k] * 60);
      res[k] = isNaN(mins) ? null : new Date(base.getTime() + mins * 60000);
    });
    return res;
  }

  function qibla(lat, lng) {
    const kLat = 21.4225, kLng = 39.8262;
    const b = atan2(sin(kLng - lng), cos(lat) * tan(kLat) - sin(lat) * cos(kLng - lng));
    return fix(b, 360);
  }

  global.PrayTime = { METHODS, times, compute, qibla };
})(typeof window !== 'undefined' ? window : globalThis);
