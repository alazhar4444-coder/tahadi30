/* أيقونات تحدي ٣٠ يوم — الإصدار ٢ (SVG ‏48×48 بعمق ولمعة ناعمة) */
(function () {
  let defs = '<clipPath id="tc"><rect width="48" height="48" rx="13"/></clipPath>';
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    defs += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const rg = (id, c, o1, cx = .5, cy = .5, r = .5) =>
    defs += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${c}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

  /* خلفيات */
  const BG = {
    fajr: ['#2D2B78', '#7B4FA8', '#F29BA6'], sunrise: ['#FFB27A', '#FF7A59'], dhuhr: ['#58C6FF', '#2F86F6'], asr: ['#FFC36B', '#FF8B3D'],
    maghrib: ['#5B2FB8', '#C2418F', '#FF8A4C'], isha: ['#1B2160', '#0B0F33'], emerald: ['#2DD4A0', '#0B9468'], blue: ['#5AB4FF', '#2563EB'],
    pink: ['#FF9CC4', '#F0407E'], amber: ['#FFD36B', '#F59E0B'], violet: ['#9B8CFF', '#5B3FE0'], teal: ['#4BE3CF', '#0E9488'],
    night: ['#4C4FD8', '#1C1A55'], rose: ['#FF8FA6', '#E5304F'], lime: ['#B9EE5F', '#4FA31A'], slate: ['#B8C4D6', '#5F6F86'],
    cyan: ['#6EE7FA', '#0891B2'], orange: ['#FFB067', '#F2620F'], purple: ['#D8A8FF', '#8B34E8'], gold: ['#FFE07A', '#F0A100']
  };
  for (const k in BG) lg('b-' + k, BG[k], 0, 0, .55, 1);
  rg('gloss', '#FFFFFF', .42, .18, .02, .85);
  lg('shade', ['#000000', '#000000'].map(c => c), 0, 0, 0, 1);
  defs += '<linearGradient id="vign" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
  defs += '<filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000" flood-opacity=".28"/></filter>';
  defs += '<filter id="glw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>';

  /* تدرّجات العناصر */
  lg('sun', ['#FFF7C2', '#FFD54A', '#FF9F1A'], .2, 0, .8, 1);
  lg('paper', ['#FFFFFF', '#EEF2F7']);
  lg('paperW', ['#FFFDF6', '#F3E9CF']);
  lg('moon', ['#FFF6CF', '#FFD66B', '#F3B22A'], .1, 0, .9, 1);
  lg('goldF', ['#FFF2A6', '#FFC93A', '#E08A00'], .2, 0, .8, 1);
  lg('silverF', ['#FFFFFF', '#D9E1EA', '#93A3B8'], .2, 0, .8, 1);
  lg('bronzeF', ['#FFD2A1', '#E08D4A', '#A24E14'], .2, 0, .8, 1);
  lg('diaF', ['#E6FCFF', '#8EE9FF', '#7B6CFF'], .2, 0, .8, 1);
  lg('heart', ['#FF8FB0', '#F0306A'], .2, 0, .8, 1);
  lg('loaf', ['#F9CF8A', '#E39A45', '#B8691F'], 0, 0, 0, 1);
  lg('candy', ['#FFFFFF', '#FFE6F0']);
  lg('can', ['#FF7676', '#D91F2C'], 0, 0, 1, 0);
  lg('glass', ['#FFFFFF', '#DDF6FF']);
  lg('water', ['#5ED7FF', '#1A8FE3']);
  lg('wood', ['#E3A86A', '#9A5520']);
  lg('flame', ['#FFE27A', '#FF8A1F', '#F0362A'], 0, 0, 0, 1);
  lg('leafF', ['#A4E85A', '#2F9E3F']);
  lg('apple', ['#FF7A7A', '#D61F3B'], .2, 0, .8, 1);
  lg('lavender', ['#FFFFFF', '#E3E1FF']);
  lg('cloud', ['#FFFFFF', '#E3ECF7']);
  lg('lantern', ['#FFF4B8', '#FFC23D', '#FF8A00']);
  rg('halo', '#FFE68A', .9);
  rg('haloW', '#FFFFFF', .7);

  const bg = k => `<rect width="48" height="48" fill="url(#b-${k})"/><rect width="48" height="48" fill="url(#gloss)"/><rect width="48" height="48" fill="url(#vign)"/>`;
  const S = inner => `<g filter="url(#sh)">${inner}</g>`;
  const star = (x, y, r, o) => `<path d="M${x} ${y - r} L${x + r * .28} ${y - r * .28} L${x + r} ${y} L${x + r * .28} ${y + r * .28} L${x} ${y + r} L${x - r * .28} ${y + r * .28} L${x - r} ${y} L${x - r * .28} ${y - r * .28}Z" fill="#fff" opacity="${o || .9}"/>`;
  const dot = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o || .8}"/>`;
  const ban = '<g transform="translate(37 37)" filter="url(#sh)"><circle r="7.6" fill="#FF3B5C" stroke="#fff" stroke-width="2"/><rect x="-4.3" y="-1.3" width="8.6" height="2.6" rx="1.3" fill="#fff"/></g>';
  const crescent = (cx, cy, r, fill, k) => { k = k || .8; return `<path d="M${cx + r * .32},${cy - r * .95} A${r},${r} 0 1,0 ${cx + r * .32},${cy + r * .95} A${r * k},${r * k} 0 0,1 ${cx + r * .32},${cy - r * .95}Z" fill="${fill}"/>`; };
  const heartP = (cx, cy, s) => `M${cx} ${cy + 7 * s} C${cx} ${cy + 7 * s} ${cx - 8 * s} ${cy + 2.2 * s} ${cx - 8 * s} ${cy - 2.6 * s} A${4.2 * s} ${4.2 * s} 0 0 1 ${cx} ${cy - 5 * s} A${4.2 * s} ${4.2 * s} 0 0 1 ${cx + 8 * s} ${cy - 2.6 * s} C${cx + 8 * s} ${cy + 2.2 * s} ${cx} ${cy + 7 * s} ${cx} ${cy + 7 * s}Z`;
  const sunDisc = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r * 1.9}" fill="url(#halo)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sun)"/><ellipse cx="${cx - r * .32}" cy="${cy - r * .38}" rx="${r * .38}" ry="${r * .24}" fill="#fff" opacity=".55"/>`;
  const cloud = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-9 4 A4.5 4.5 0 0 1 -7.5 -4.2 A6.5 6.5 0 0 1 4.6 -5.6 A5.2 5.2 0 0 1 9.5 4 Z" fill="url(#cloud)"/>`;
  const rays = (cx, cy, r1, r2, n, w, c, o) => { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; s += `<path d="M${(cx + r1 * Math.cos(a)).toFixed(2)} ${(cy + r1 * Math.sin(a)).toFixed(2)}L${(cx + r2 * Math.cos(a)).toFixed(2)} ${(cy + r2 * Math.sin(a)).toFixed(2)}"/>`; } return `<g stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o || 1}">${s}</g>`; };

  const A = {
    /* ===== الصلوات ===== */
    fajr: () => bg('fajr') + dot(11, 10, .9) + dot(37, 8, 1.1) + star(29, 13, 1.8, .85) + dot(19, 6, .6, .6) +
      sunDisc(24, 36, 9.5) + '<path d="M0 37 C10 33 18 35 24 38 C31 34 40 33 48 36 V48 H0Z" fill="#241D5C"/><path d="M0 42 C14 39 30 41 48 40 V48 H0Z" fill="#17123F"/>',
    sunrise: () => bg('sunrise') + sunDisc(24, 31, 9) + '<g stroke="#FFF3C9" stroke-width="2.6" stroke-linecap="round"><path d="M24 13v4.5M11 19.5l3 3M37 19.5l-3 3M6.5 29h4M37.5 29h4"/></g>' +
      '<rect y="31" width="48" height="17" fill="#C2410C" opacity=".55"/><path d="M14 36h20M18 40h12" stroke="#FFE2B8" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>',
    dhuhr: () => bg('dhuhr') + rays(24, 23, 13.5, 18, 8, 3.2, '#FFF1A6') + sunDisc(24, 23, 10),
    asr: () => bg('asr') + sunDisc(29, 20, 9) + S(cloud(19, 33, 1.25)) + '<path d="M0 41 C12 39 34 42 48 40 V48 H0Z" fill="#B44B0D" opacity=".35"/>',
    maghrib: () => bg('maghrib') + dot(10, 9, .8) + dot(38, 12, .7) + sunDisc(24, 31, 10) +
      '<rect y="31" width="48" height="17" fill="#3A1680"/><rect y="31" width="48" height="17" fill="url(#vign)"/>' +
      '<g stroke="#FFB15C" stroke-width="2" stroke-linecap="round"><path d="M15 35h18" opacity=".9"/><path d="M18.5 39h11" opacity=".7"/><path d="M21.5 43h5" opacity=".5"/></g>',
    isha: () => bg('isha') + dot(10, 11, .9) + dot(36, 36, .8) + dot(40, 14, .7) + dot(13, 37, .7, .6) + star(36, 22, 2.6) + star(12, 22, 1.6, .7) +
      '<circle cx="22" cy="24" r="17" fill="url(#halo)" opacity=".35"/>' + S(crescent(22, 24, 12, 'url(#moon)', .82)),

    /* ===== الأهداف ===== */
    quran: () => bg('emerald') + S('<path d="M24 14 C19 10.5 12 10.5 7 12 V35 C12 33.6 19 33.8 24 37.5Z" fill="url(#paperW)"/><path d="M24 14 C29 10.5 36 10.5 41 12 V35 C36 33.6 29 33.8 24 37.5Z" fill="url(#paperW)"/>') +
      '<path d="M24 14 V37.5" stroke="#D7B25A" stroke-width="1.3"/><path d="M7 12 V35 C12 33.6 19 33.8 24 37.5 C29 33.8 36 33.6 41 35 V12" stroke="#E2B54A" stroke-width="1.5" fill="none"/>' +
      '<g stroke="#0B9468" stroke-width="1.5" stroke-linecap="round" opacity=".45"><path d="M11 18h9M11 22h9M11 26h9M11 30h6M28 18h9M28 22h9M28 26h9M31 30h6"/></g>' +
      '<path d="M31 11.2 V20 L33.5 18 L36 20 V10.6" fill="#F43F5E"/>',
    walk: () => bg('blue') + '<g stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M5 22h6M3 27h7M6 32h4"/></g>' +
      S('<path d="M11 31 C11 24 14 20 18.5 20 L23.5 20 L27.5 25.5 C31.5 28.5 37 28.8 40.5 29.8 C43 30.5 43.5 34.5 41 35 H13 C11.6 35 11 33.5 11 31Z" fill="url(#paper)"/>' +
        '<path d="M11 34.2 H42 V36.4 C42 37.6 41 38.6 39.8 38.6 H13.2 C12 38.6 11 37.6 11 36.4Z" fill="#1E3A8A"/>') +
      '<path d="M17.5 28 C22.5 30 29 31.3 35 31.2" stroke="#FF7A2F" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<g stroke="#3B6FE8" stroke-width="1.6" stroke-linecap="round"><path d="M20 21.6l2.4 2M22.6 21l2.3 2.2M25 22.6l2 1.9"/></g>',
    workout: () => bg('teal') + S('<g transform="rotate(-30 24 24)"><rect x="10" y="22" width="28" height="4" rx="2" fill="url(#paper)"/>' +
      '<rect x="7.5" y="14.5" width="6.5" height="19" rx="2.6" fill="#0B3B47"/><rect x="34" y="14.5" width="6.5" height="19" rx="2.6" fill="#0B3B47"/>' +
      '<rect x="4" y="18" width="4.2" height="12" rx="2" fill="#155E6B"/><rect x="39.8" y="18" width="4.2" height="12" rx="2" fill="#155E6B"/></g>'),
    noSugar: () => bg('pink') + S('<path d="M13.5 24 L5 16.5 Q4 21 4.5 24 Q4 27 5 31.5Z M34.5 24 L43 16.5 Q44 21 43.5 24 Q44 27 43 31.5Z" fill="url(#paper)"/>' +
      '<ellipse cx="24" cy="24" rx="11.5" ry="9" fill="url(#candy)"/>') +
      '<clipPath id="cnd"><ellipse cx="24" cy="24" rx="11.5" ry="9"/></clipPath><g clip-path="url(#cnd)" fill="#F0407E"><path d="M13 13 h4.5 l10 22 h-4.5z M22 13 h4.5 l10 22 h-4.5z M4 13 h4.5 l10 22 h-4.5z"/></g>' +
      '<ellipse cx="19" cy="19.5" rx="3.6" ry="1.8" fill="#fff" opacity=".75" transform="rotate(-15 19 19.5)"/>' + ban,
    noBread: () => bg('amber') + S('<path d="M8.5 28 C8.5 18.5 15 13.5 24 13.5 C33 13.5 39.5 18.5 39.5 28 C39.5 31 38 33 35.5 33 H12.5 C10 33 8.5 31 8.5 28Z" fill="url(#loaf)"/>' +
      '<path d="M10.5 32.5 H37.5 V35.5 C37.5 37 36.5 38 35 38 H13 C11.5 38 10.5 37 10.5 35.5Z" fill="#A65A16"/>') +
      '<g stroke="#FFE7BD" stroke-width="2.2" stroke-linecap="round"><path d="M17 19l3 5M23.5 17.5l3 5.5M30 19l3 5"/></g><ellipse cx="16" cy="17" rx="3" ry="1.6" fill="#fff" opacity=".35"/>' + ban,
    chastity: () => bg('violet') + S('<path d="M24 7.5 L38 13 V23.5 C38 32 32 38 24 41 C16 38 10 32 10 23.5 V13Z" fill="url(#lavender)"/>') +
      '<path d="M24 7.5 L38 13 V23.5 C38 32 32 38 24 41Z" fill="#5B3FE0" opacity=".1"/>' +
      `<path d="${heartP(24, 24, 1)}" fill="url(#heart)"/><ellipse cx="20" cy="20" rx="2.2" ry="1.4" fill="#fff" opacity=".6"/>`,

    /* ===== الإضافات ===== */
    adhkarAM: () => bg('emerald') + beads(23, 24, '#FFE7B5') + sunDisc(37, 11, 4.3),
    adhkarPM: () => bg('night') + beads(23, 24, '#E8D8FF') + crescent(37, 11, 5, 'url(#moon)'),
    witr: () => bg('purple') + dot(9, 10, .9) + dot(40, 9, .8) +
      '<circle cx="24" cy="26" r="15" fill="url(#halo)" opacity=".8"/>' +
      S('<path d="M24 6v3.5" stroke="#3B0B6B" stroke-width="1.8"/><path d="M16 15.5 L24 10 L32 15.5Z" fill="#3B0B6B"/><rect x="15" y="15.5" width="18" height="20" rx="5.5" fill="#3B0B6B"/>' +
        '<rect x="18" y="18.5" width="12" height="14" rx="3.5" fill="url(#lantern)"/><path d="M17 35.5h14l-2.6 4h-8.8z" fill="#3B0B6B"/>') +
      '<path d="M24 21.5 C26.4 24.5 26.4 28 24 29.8 C21.6 28 21.6 24.5 24 21.5Z" fill="#FF6A00"/>',
    rawatib: () => bg('teal') + '<circle cx="24" cy="10" r="9" fill="url(#haloW)" opacity=".6"/>' +
      S('<path d="M13 39 V27 a11 11 0 0 1 22 0 V39Z" fill="url(#paper)"/><rect x="6.5" y="21" width="4.4" height="18" rx="1.4" fill="url(#paper)"/><path d="M8.7 14.5 l2.2 5h-4.4z" fill="#fff"/>' +
        '<rect x="37.1" y="21" width="4.4" height="18" rx="1.4" fill="url(#paper)"/><path d="M39.3 14.5 l2.2 5h-4.4z" fill="#fff"/><rect x="4" y="38" width="40" height="3.5" rx="1.2" fill="#fff"/>') +
      '<path d="M20.5 39 v-6 a3.5 3.5 0 0 1 7 0 v6Z" fill="#0E9488" opacity=".7"/>' + crescent(24, 11.5, 2.8, '#FFD54A'),
    duha: () => bg('dhuhr') + sunDisc(16, 18, 7) + '<path d="M0 33 C14 25 26 31 34 30 C40 29 44 27 48 28 V48 H0Z" fill="#34C26A"/><path d="M0 39 C16 34 32 39 48 37 V48 H0Z" fill="#1E9A50"/>',
    istighfar: () => bg('rose') + '<circle cx="24" cy="24" r="16" fill="url(#haloW)" opacity=".5"/>' +
      S(`<path d="${heartP(24, 24, 1.45)}" fill="url(#paper)"/>`) + star(37, 10, 3.2) + star(10, 33, 2.2, .8),
    sadaqa: () => bg('lime') + S('<ellipse cx="24" cy="36" rx="12" ry="3.4" fill="#C8860B"/><rect x="12" y="31" width="24" height="5" fill="#E9A51A"/><ellipse cx="24" cy="31" rx="12" ry="3.4" fill="#FFD24A"/>' +
      '<circle cx="24" cy="19" r="10.5" fill="url(#goldF)"/>') + '<circle cx="24" cy="19" r="7.6" fill="none" stroke="#FFF6C8" stroke-width="1.2" opacity=".85"/>' +
      `<path d="${heartP(24, 19.5, .6)}" fill="#E5304F"/>`,
    birr: () => bg('orange') + S('<path d="M24 9 L41 22.5 H36.5 V39 H11.5 V22.5 H7Z" fill="url(#paper)"/><path d="M24 9 L41 22.5 H7Z" fill="#C2410C"/>') +
      `<path d="${heartP(24, 30, .75)}" fill="url(#heart)"/>`,
    fasting: () => bg('night') + dot(9, 9, .9) + dot(39, 10, .8) + S('<circle cx="24" cy="27" r="13.5" fill="url(#paper)"/>') +
      '<circle cx="24" cy="27" r="10" fill="none" stroke="#DCE3F0" stroke-width="1.2"/>' + crescent(23, 26.5, 5.6, 'url(#moon)') +
      '<g stroke="#E6EAFF" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M5.5 15v9M3.5 15v4.5a2 2 0 0 0 4 0V15"/><path d="M42.5 15v21M42.5 15c2.6 1 3 5.5 0 8"/></g>',
    water: () => bg('cyan') + S('<path d="M13.5 10 H34.5 L31.8 39.5 C31.6 40.9 30.5 42 29 42 H19 C17.5 42 16.4 40.9 16.2 39.5Z" fill="url(#glass)" opacity=".95"/>') +
      '<path d="M15.2 20 H32.8 L31.8 39.5 C31.6 40.9 30.5 42 29 42 H19 C17.5 42 16.4 40.9 16.2 39.5Z" fill="url(#water)"/>' +
      '<path d="M15.2 20 C19 22 23 18 27 20 S31 21.5 32.8 20" stroke="#BFF2FF" stroke-width="1.4" fill="none"/>' +
      '<path d="M18.5 13 V37" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><circle cx="26" cy="30" r="1.4" fill="#fff" opacity=".7"/><circle cx="23" cy="35" r="1" fill="#fff" opacity=".6"/>',
    sleep: () => bg('night') + dot(38, 34, .8) + dot(10, 38, .7) + '<circle cx="21" cy="24" r="15" fill="url(#halo)" opacity=".3"/>' + S(crescent(21, 24, 11.5, 'url(#moon)', .8)) +
      '<g fill="#fff" font-family="Arial, sans-serif" font-weight="900"><text x="30" y="18" font-size="10">Z</text><text x="37.5" y="11" font-size="7" opacity=".8">z</text></g>',
    veggies: () => bg('lime') + S('<path d="M24 16 C17 12.5 10.5 17.5 12 26.5 C13.5 35 19 40.5 24 38.5 C29 40.5 34.5 35 36 26.5 C37.5 17.5 31 12.5 24 16Z" fill="url(#apple)"/>') +
      '<ellipse cx="17.5" cy="22" rx="2.4" ry="4.2" fill="#fff" opacity=".45" transform="rotate(20 17.5 22)"/>' +
      '<path d="M24 16 C24 12 25.5 9.5 27.5 8" stroke="#7A3E12" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M26.5 12 C29.5 7.5 35 7.5 37.5 9.8 C34 13.4 29.5 13.8 26.5 12Z" fill="url(#leafF)"/>',
    noSoda: () => bg('slate') + S('<rect x="14.5" y="9" width="19" height="31" rx="4.5" fill="url(#can)"/>') +
      '<rect x="14.5" y="9" width="19" height="4.2" rx="2.1" fill="#E5E9EF"/><path d="M14.5 23 C20 19.5 28 27.5 33.5 24 V29.5 C28 33 20 25 14.5 28.5Z" fill="#fff"/>' +
      '<rect x="17.5" y="12" width="2.6" height="26" rx="1.3" fill="#fff" opacity=".3"/>' + ban,
    noPhoneBed: () => bg('slate') + S('<rect x="13.5" y="6.5" width="21" height="35" rx="5" fill="#1F2937"/>') +
      '<rect x="15.8" y="9.5" width="16.4" height="27" rx="2.4" fill="url(#b-night)"/>' + crescent(23, 22, 5, 'url(#moon)') +
      '<rect x="21" y="38.3" width="6" height="1.5" rx=".75" fill="#6B7A90"/>' + ban,

    /* ===== عامة ===== */
    calendar: () => bg('slate') + S('<rect x="9" y="11" width="30" height="28" rx="6" fill="url(#paper)"/><path d="M9 17 A6 6 0 0 1 15 11 H33 A6 6 0 0 1 39 17 V19.5 H9Z" fill="#FF3B5C"/>') +
      '<g fill="#CBD5E1"><circle cx="16" cy="26" r="1.9"/><circle cx="24" cy="26" r="1.9"/><circle cx="32" cy="26" r="1.9"/><circle cx="16" cy="33" r="1.9"/><circle cx="24" cy="33" r="1.9"/></g><circle cx="32" cy="33" r="2.8" fill="#10B981"/>',
    help: () => bg('rose') + S(`<path d="${heartP(24, 24, 1.55)}" fill="url(#paper)"/>`) +
      '<path d="M14.5 24.5 H19.5 L21.8 20 L25.6 29 L27.8 24.5 H33.5" stroke="#E5304F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    gift: () => bg('rose') + S('<rect x="10" y="20" width="28" height="7" rx="2.2" fill="url(#paper)"/><rect x="12" y="27" width="24" height="13" rx="2.2" fill="#FFE1E8"/>') +
      '<rect x="22" y="20" width="4" height="20" fill="#FFC93A"/><path d="M24 20 C20 13.5 13 15 15.5 19 C17 21 21 20.5 24 20Z M24 20 C28 13.5 35 15 32.5 19 C31 21 27 20.5 24 20Z" fill="#FFC93A"/>',
    bulb: () => bg('night') + '<circle cx="24" cy="20" r="15" fill="url(#halo)" opacity=".8"/>' +
      S('<path d="M24 8.5 A10.5 10.5 0 0 0 17.7 27.5 C19 28.6 19.6 30 19.6 31.6 H28.4 C28.4 30 29 28.6 30.3 27.5 A10.5 10.5 0 0 0 24 8.5Z" fill="url(#lantern)"/>') +
      '<rect x="19.6" y="32.5" width="8.8" height="3.2" rx="1.2" fill="#D6DCE6"/><rect x="20.8" y="36.3" width="6.4" height="3.2" rx="1.6" fill="#9AA6B8"/>',
    star: () => bg('gold') + S(`<path d="M24 8.5 l4.6 9.6 10.4 1.4 -7.6 7.2 1.9 10.4 -9.3-5 -9.3 5 1.9-10.4 -7.6-7.2 10.4-1.4z" fill="url(#paper)"/>`),
    fire: () => bg('rose') + S('<path d="M24 41.5 C31.5 41.5 36 36.6 36 30 C36 22.5 30 18.5 28.3 9.5 C24.6 12.6 22.4 17 23 21.6 C20.4 20 18.8 17.5 18.6 15 C14.6 18.6 12 23.8 12 30 C12 36.8 16.6 41.5 24 41.5Z" fill="url(#flame)"/>') +
      '<path d="M24 41.5 C27.8 41.5 30.3 38.8 30.3 35.3 C30.3 31.2 26.8 29.1 25.8 25 C23.5 26.6 22 29.1 22.3 31.6 C21 30.9 20.1 29.8 19.8 28.6 C18.4 30.5 17.8 32.5 17.8 34.8 C17.8 38.7 20.3 41.5 24 41.5Z" fill="#FFF1A8"/>',
    points: () => bg('purple') + S('<path d="M24 8 l3.4 10.4 10.4 3.4 -10.4 3.4 -3.4 10.4 -3.4-10.4 -10.4-3.4 10.4-3.4z" fill="url(#paper)"/>') + star(37, 33, 3.6),
    trophy: () => bg('violet') + S(trophyArt()),
    compass: () => bg('blue') + S('<circle cx="24" cy="24" r="14.5" fill="url(#paper)"/>') + '<path d="M24 11.5 L28.2 24 H19.8Z" fill="#FF3B5C"/><path d="M24 36.5 L19.8 24 H28.2Z" fill="#334155"/><circle cx="24" cy="24" r="2.2" fill="#fff" stroke="#334155" stroke-width="1.2"/>',
    pin: () => bg('rose') + S('<path d="M24 40 C24 40 12.5 29 12.5 20.5 A11.5 11.5 0 0 1 35.5 20.5 C35.5 29 24 40 24 40Z" fill="url(#paper)"/>') + '<circle cx="24" cy="20.5" r="4.6" fill="#E5304F"/>',
    bell: () => bg('orange') + S('<path d="M24 8.5 C17.3 8.5 14.6 13.8 14.6 20 V27.2 L11.6 32 H36.4 L33.4 27.2 V20 C33.4 13.8 30.7 8.5 24 8.5Z" fill="url(#goldF)"/>') + '<circle cx="24" cy="35.6" r="3.4" fill="#FFF2A6"/>',
    clock: () => bg('orange') + S('<circle cx="24" cy="25" r="14" fill="url(#paper)"/>') + '<path d="M24 17.5 V25 L29.5 28.5" stroke="#334155" stroke-width="2.6" stroke-linecap="round" fill="none"/>',
    person: () => bg('slate') + S('<circle cx="24" cy="18.5" r="7.5" fill="url(#paper)"/><path d="M10.5 40 C11.5 31 17.5 27.5 24 27.5 C30.5 27.5 36.5 31 37.5 40Z" fill="url(#paper)"/>'),
    steps: () => A.walk(),
    moon: () => bg('night') + S('<circle cx="24" cy="24" r="12.5" fill="url(#paper)"/>') + '<path d="M24 11.5 A12.5 12.5 0 0 1 24 36.5Z" fill="#1C1A55"/>',
    backup: () => bg('blue') + S('<path d="M14 35.5 A7.5 7.5 0 0 1 13.4 20.6 A10.5 10.5 0 0 1 33.6 18.6 A8.4 8.4 0 0 1 34.4 35.5Z" fill="url(#paper)"/>') +
      '<path d="M24 31.5 V22 M19.8 25.8 L24 21.6 L28.2 25.8" stroke="#2563EB" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    trash: () => bg('rose') + S('<rect x="12" y="12.5" width="24" height="3.8" rx="1.9" fill="url(#paper)"/><rect x="20" y="9" width="8" height="4.2" rx="1.6" fill="#fff"/><path d="M14.5 18 H33.5 L32 37.5 C31.9 39.2 30.6 40.5 29 40.5 H19 C17.4 40.5 16.1 39.2 16 37.5Z" fill="url(#paper)"/>') +
      '<g stroke="#E5304F" stroke-width="1.9" stroke-linecap="round" opacity=".55"><path d="M20.5 23v12.5M24 23v12.5M27.5 23v12.5"/></g>'
  };
  A.mosque = A.rawatib; A.shield = A.chastity;

  function beads(cx, cy, hl) {
    let s = ''; const n = 15, r = 10.5;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + .42 + i / n * Math.PI * 2 * .88;
      const x = (cx + r * Math.cos(a)).toFixed(1), y = (cy + r * Math.sin(a)).toFixed(1);
      s += `<circle cx="${x}" cy="${y}" r="2.45" fill="url(#wood)"/><circle cx="${(+x - .7).toFixed(1)}" cy="${(+y - .8).toFixed(1)}" r=".8" fill="${hl}" opacity=".85"/>`;
    }
    return S(s + `<path d="M${cx} ${cy + r + 1} v5.5" stroke="#7A3E12" stroke-width="2" stroke-linecap="round"/><path d="M${cx - 2.6} ${cy + r + 6.5}h5.2l-1 4.5h-3.2z" fill="url(#goldF)"/>`);
  }
  function trophyArt() {
    return '<path d="M15 9 H33 V19.5 A9 9 0 0 1 15 19.5Z" fill="url(#goldF)"/><path d="M15 11.5 H9.5 V15 A5.5 5.5 0 0 0 15 20.5 M33 11.5 H38.5 V15 A5.5 5.5 0 0 1 33 20.5" stroke="#F2B21B" stroke-width="2.6" fill="none"/>' +
      '<rect x="21.8" y="28" width="4.4" height="6" fill="#D98A00"/><path d="M14.5 34 H33.5 L35 41.5 H13Z" fill="url(#goldF)"/><rect x="18" y="12.5" width="2.6" height="9" rx="1.3" fill="#fff" opacity=".6"/>';
  }

  /* الأوسمة والنجوم */
  const ribbon = (c1, c2) => `<path d="M14.5 2.5 H23 L28.5 21 H20Z" fill="${c1}"/><path d="M33.5 2.5 H25 L19.5 21 H28Z" fill="${c2}"/><path d="M14.5 2.5 H23 L24 6 H15.5Z" fill="#fff" opacity=".2"/>`;
  const medal = (g, num, c1, c2, ink) => `${ribbon(c1, c2)}<g filter="url(#sh)"><circle cx="24" cy="31" r="13.5" fill="url(#${g})"/></g>
    <circle cx="24" cy="31" r="10.2" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.3"/><ellipse cx="19.5" cy="25.5" rx="4" ry="2.2" fill="#fff" opacity=".45" transform="rotate(-25 19.5 25.5)"/>
    <text x="24" y="35.8" text-anchor="middle" font-family="Thmanyah, sans-serif" font-weight="700" font-size="13" fill="${ink}">${num}</text>`;
  const M = {
    w1: () => medal('bronzeF', '١', '#3B82F6', '#1D4ED8', '#6B2F08'),
    w2: () => medal('silverF', '٢', '#EF4444', '#B91C1C', '#475569'),
    w3: () => medal('goldF', '٣', '#10B981', '#047857', '#8A5A00'),
    w4: () => `${ribbon('#8B5CF6', '#6D28D9')}<g filter="url(#sh)"><path d="M13.5 25 L19 18.5 H29 L34.5 25 L24 43Z" fill="url(#diaF)"/></g><path d="M13.5 25 H34.5 M19 18.5 L22 25 L24 43 M29 18.5 L26 25 L24 43" stroke="#fff" stroke-opacity=".75" stroke-width="1.1" fill="none"/>`,
    all: () => `<g filter="url(#sh)">${trophyArt()}</g><path d="M24 12.5 l1.3 2.7 3 .4 -2.2 2 .6 3 -2.7-1.5 -2.7 1.5 .6-3 -2.2-2 3-.4z" fill="#fff"/>`,
    starBig: () => `<g filter="url(#sh)"><path d="M24 4 l6 12.6 13.8 1.8 -10.1 9.6 2.5 13.7 -12.2-6.6 -12.2 6.6 2.5-13.7 -10.1-9.6 13.8-1.8z" fill="url(#goldF)" stroke="#E59500" stroke-width="1" stroke-linejoin="round"/></g><path d="M24 4 l6 12.6 13.8 1.8 -10.1 9.6 2.5 13.7 -12.2-6.6z" fill="#fff" opacity=".2"/><ellipse cx="19" cy="17" rx="3.2" ry="1.8" fill="#fff" opacity=".6" transform="rotate(-30 19 17)"/>`
  };
  ['lv0', 'lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(k => M[k] = M.starBig);

  const svg = (inner, cls) => `<svg class="${cls || 'art'}" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
  window.ART = {
    tile: id => svg(`<g clip-path="url(#tc)">${(A[id] || A.points)()}</g>`),
    badge: id => svg((M[id] || M.starBig)(), 'art badge'),
    has: id => !!A[id],
    mount() {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.style.position = 'absolute';
      s.innerHTML = `<defs>${defs}</defs>`; document.body.prepend(s);
    }
  };
})();
