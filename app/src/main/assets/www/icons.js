/* أيقونات تحدي ٣٠ يوم — مرسومة خصيصًا (SVG ‏48×48) */
(function () {
  const G = {
    fajr: ['#24235E', '#F39AB0'], dhuhr: ['#5CC8FA', '#1E9BE6'], asr: ['#FFC488', '#F2711C'], maghrib: ['#6D33D6', '#FF8A3D'],
    isha: ['#0B1230', '#2E2A7A'], sun: ['#FFF1A8', '#FFB020'], green: ['#3EDBA0', '#0A8F63'], blue: ['#6FB3FF', '#2C5FE8'],
    pink: ['#FFB3D6', '#F0457F'], warm: ['#FFE08A', '#F5A000'], indigo: ['#AFB8FF', '#5145E6'], cyan: ['#7BEFFF', '#0B9BC4'],
    night: ['#5B5FEA', '#1A1748'], teal: ['#6EF0DA', '#0B9488'], rose: ['#FFA5B5', '#E3264E'], lime: ['#CFF77A', '#5BA414'],
    slate: ['#D5DEEA', '#6A7A90'], gold: ['#FFF0A3', '#E59500'], silver: ['#FFFFFF', '#9AA8BA'], bronze: ['#FFC58F', '#B4561A'],
    diamond: ['#B6F7FF', '#7468FF'], orange: ['#FFC48A', '#F06A12'], purple: ['#E2BEFF', '#8E35E8'], wood: ['#E6B07A', '#9B5B2A'],
    loaf: ['#F7C276', '#C47A2C'], can: ['#FF6A6A', '#C81E1E'], flame: ['#FFE07A', '#FF4D1F'], leaf: ['#9BE15D', '#2E9E3E'],
    glass: ['#E9FBFF', '#B9ECF7'], water: ['#56D2F5', '#1C8FD6']
  };
  let defs = '<clipPath id="tc"><rect width="48" height="48" rx="13"/></clipPath>';
  for (const k in G) defs += `<linearGradient id="g-${k}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${G[k][0]}"/><stop offset="1" stop-color="${G[k][1]}"/></linearGradient>`;
  defs += '<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".95"/><stop offset="1" stop-color="#FFD25A" stop-opacity="0"/></radialGradient>';

  const bg = g => `<rect width="48" height="48" fill="url(#g-${g})"/><rect width="48" height="22" fill="#fff" opacity=".07"/>`;
  const stars = pts => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r || .9}" fill="#fff" opacity=".9"/>`).join('');
  const ban = '<g transform="translate(36.5 36.5)"><circle r="8" fill="#F43F5E" stroke="#fff" stroke-width="2.2"/><rect x="-4.6" y="-1.35" width="9.2" height="2.7" rx="1.35" fill="#fff"/></g>';
  const mosque = (c, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-9 12V4a9 9 0 0 1 18 0v8z"/><rect x="-15" y="-4" width="3.4" height="16" rx="1"/><path d="M-13.3-8l1.7 4h-3.4z"/><rect x="11.6" y="-4" width="3.4" height="16" rx="1"/><path d="M13.3-8l1.7 4h-3.4z"/><rect x="-16" y="10" width="32" height="2.5"/><path d="M0-10.5v5.5" stroke="${c}" stroke-width="1.2"/></g>`;
  const crescent = (cx, cy, r, fill, off) => `<path d="M${cx + r * .35},${cy - r * .94} A${r},${r} 0 1,0 ${cx + r * .35},${cy + r * .94} A${r * (off || .85)},${r * (off || .85)} 0 0,1 ${cx + r * .35},${cy - r * .94}Z" fill="${fill}"/>`;
  const beads = (cx, cy, r, n, c1, c2) => { let s = ''; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * 2 * Math.PI * .86 + .45; s += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="2.3" fill="${i % 2 ? c1 : c2}"/>`; } return s; };

  const A = {
    fajr: () => bg('fajr') + stars([[11, 10], [37, 8, 1.1], [28, 15, .7], [18, 6, .6]]) +
      '<circle cx="24" cy="35" r="13" fill="url(#glow)"/><circle cx="24" cy="35" r="8.5" fill="url(#g-sun)"/>' +
      '<path d="M0 36 Q10 30 20 35 T40 33 T48 34 V48 H0Z" fill="#2A2465"/><path d="M0 41 Q14 36 28 40 T48 39 V48 H0Z" fill="#1A1748"/>',
    sunrise: () => bg('orange') + '<circle cx="24" cy="31" r="12" fill="url(#glow)"/><circle cx="24" cy="31" r="8" fill="url(#g-sun)"/>' +
      '<g stroke="#FFF4C2" stroke-width="2.4" stroke-linecap="round"><path d="M24 13v4M11 19l2.6 2.6M37 19l-2.6 2.6"/></g><rect y="31" width="48" height="17" fill="#B4430E" opacity=".75"/>',
    dhuhr: () => bg('dhuhr') + '<g stroke="#FFF3B0" stroke-width="2.6" stroke-linecap="round">' +
      [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return `<path d="M${(24 + 12.5 * Math.cos(r)).toFixed(1)} ${(21 + 12.5 * Math.sin(r)).toFixed(1)}L${(24 + 16 * Math.cos(r)).toFixed(1)} ${(21 + 16 * Math.sin(r)).toFixed(1)}"/>`; }).join('') +
      '</g><circle cx="24" cy="21" r="9.5" fill="url(#g-sun)"/><circle cx="21" cy="18" r="3" fill="#fff" opacity=".45"/>' +
      '<path d="M28 39a4.5 4.5 0 0 1 4-6.5 6 6 0 0 1 11.3 1.7A3.5 3.5 0 0 1 43 41H31a3 3 0 0 1-3-2z" fill="#fff"/>',
    asr: () => bg('asr') + '<circle cx="34" cy="14" r="7" fill="#FFF3C4"/><circle cx="34" cy="14" r="11" fill="#FFF3C4" opacity=".25"/>' +
      '<path d="M0 37h48v11H0z" fill="#A8410B" opacity=".55"/><path d="M15 37 L44 44 L44 46 L13 38z" fill="#7C2D12" opacity=".55"/>' +
      '<g fill="#5B210A"><rect x="11" y="17" width="5" height="20" rx="1"/><path d="M10 17h7l-3.5-6z"/><rect x="9.6" y="23" width="7.8" height="1.8" rx=".9"/><path d="M13.5 8.5v2.5" stroke="#5B210A" stroke-width="1.2"/></g>',
    maghrib: () => bg('maghrib') + stars([[10, 9, .8], [40, 12, .7]]) + '<circle cx="24" cy="30" r="14" fill="url(#glow)"/><circle cx="24" cy="30" r="9.5" fill="url(#g-sun)"/>' +
      '<rect y="30" width="48" height="18" fill="#3B1680"/><g stroke="#FFC46B" stroke-linecap="round" stroke-width="1.8" opacity=".85"><path d="M17 34h14M19.5 38h9M22 42h4"/></g>',
    isha: () => bg('isha') + stars([[9, 9], [38, 7, 1.1], [41, 20, .7], [30, 12, .6], [6, 22, .7], [19, 5, .6]]) +
      crescent(20, 18, 9, '#FFE08A', .82) + mosque('#060A1E', 24, 33, .78) + '<rect y="42" width="48" height="6" fill="#060A1E"/>',
    quran: () => bg('green') + '<path d="M10 40 L24 31 L38 40" stroke="#6B3A12" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M14 40 L24 34 L34 40" stroke="#8C4F1D" stroke-width="2" stroke-linecap="round" fill="none"/>' +
      '<path d="M24 15 C19 12 13 12 8 13 V32 C13 31 19 31 24 34Z" fill="#FFFDF5"/><path d="M24 15 C29 12 35 12 40 13 V32 C35 31 29 31 24 34Z" fill="#F3EEDC"/>' +
      '<path d="M24 15V34" stroke="#C9A24A" stroke-width="1.2"/><g stroke="#0A8F63" stroke-width="1.3" stroke-linecap="round" opacity=".55"><path d="M11 18h9M11 21.5h9M11 25h9M11 28.5h6M28 18h9M28 21.5h9M28 25h9M31 28.5h6"/></g>' +
      '<path d="M8 13 V32 C13 31 19 31 24 34 C29 31 35 31 40 32 V13" stroke="#E2B13C" stroke-width="1.4" fill="none"/>',
    walk: () => bg('blue') + '<g transform="translate(0 2)"><path d="M8 29 C8 23 11 20 15 20 L21 20 L25 25.5 C29 28.5 35 28.5 39.5 29.5 C42 30.2 42.5 34 40 34.5 L10 34.5 C8.5 34.5 8 32.5 8 29Z" fill="#fff"/>' +
      '<path d="M8 33.8 H41 V36 C41 37 40 38 39 38 H10 C9 38 8 37 8 36Z" fill="#163A8C"/><path d="M15 27 C20 29 27 30.5 33 30.5" stroke="#FF8A3D" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<g stroke="#2C5FE8" stroke-width="1.5" stroke-linecap="round"><path d="M17.5 21.5l2.5 2M20 21l2.5 2.2M22.2 22.6l2.3 2"/></g></g>' +
      '<g fill="#fff" opacity=".55"><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="9" r="1.3"/><circle cx="21" cy="11" r="1"/></g>',
    workout: () => bg('teal') + '<g transform="rotate(-25 24 24)"><rect x="9" y="22" width="30" height="4" rx="2" fill="#E6FFFA"/>' +
      '<rect x="7" y="15" width="6" height="18" rx="2.4" fill="#073B39"/><rect x="35" y="15" width="6" height="18" rx="2.4" fill="#073B39"/>' +
      '<rect x="3.5" y="18.5" width="4" height="11" rx="1.8" fill="#0D5E59"/><rect x="40.5" y="18.5" width="4" height="11" rx="1.8" fill="#0D5E59"/></g>',
    noSugar: () => bg('pink') + '<path d="M25 27 L33 42" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="22" cy="19" r="11" fill="#fff"/>' +
      '<path d="M22 19 m0 -2.2 a2.2 2.2 0 1 1 -2.2 2.2 a4.4 4.4 0 1 1 4.4 4.4 a6.6 6.6 0 1 1 -6.6 -6.6 a8.8 8.8 0 1 1 8.8 8.8" stroke="#F0457F" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="18" cy="14" r="2" fill="#fff" opacity=".8"/>' + ban,
    noBread: () => bg('warm') + '<path d="M9 27 C9 18 15 13 24 13 C33 13 39 18 39 27 C39 30 37.5 32 35 32 H13 C10.5 32 9 30 9 27Z" fill="url(#g-loaf)"/>' +
      '<path d="M11 31.5 H37 V35 C37 36.5 36 37.5 34.5 37.5 H13.5 C12 37.5 11 36.5 11 35Z" fill="#B66A22"/>' +
      '<g stroke="#FFE3B0" stroke-width="2" stroke-linecap="round" opacity=".9"><path d="M17 18.5l3 5M23 17l3 5.5M29 18.5l3 5"/></g>' + ban,
    chastity: () => bg('indigo') + '<path d="M24 8 L37 13 V23 C37 31 31.5 37 24 40 C16.5 37 11 31 11 23 V13Z" fill="#fff"/>' +
      '<path d="M24 11.5 L34 15.3 V23 C34 29.3 29.7 34 24 36.5Z" fill="#E4E7FF"/>' +
      '<path d="M24 31 C24 31 17.5 27 17.5 22.4 A3.6 3.6 0 0 1 24 20.3 A3.6 3.6 0 0 1 30.5 22.4 C30.5 27 24 31 24 31Z" fill="#F0457F"/>',
    adhkarAM: () => bg('green') + '<circle cx="36" cy="12" r="5" fill="url(#g-sun)"/>' + beads(22, 23, 10, 15, '#7A3E12', '#C98B4A') +
      '<path d="M22 33.5 v6" stroke="#7A3E12" stroke-width="2" stroke-linecap="round"/><path d="M19.5 39.5h5l-1 4h-3z" fill="#FFD25A"/>',
    adhkarPM: () => bg('night') + crescent(36, 12, 5, '#FFE08A', .8) + beads(22, 23, 10, 15, '#7A3E12', '#E2A866') +
      '<path d="M22 33.5 v6" stroke="#7A3E12" stroke-width="2" stroke-linecap="round"/><path d="M19.5 39.5h5l-1 4h-3z" fill="#FFD25A"/>',
    witr: () => bg('purple') + stars([[9, 10], [40, 9, .8]]) + '<path d="M24 5v4" stroke="#3B0764" stroke-width="1.6"/><circle cx="24" cy="10.5" r="2.2" fill="none" stroke="#3B0764" stroke-width="1.6"/>' +
      '<path d="M16 17 L24 12.5 L32 17Z" fill="#3B0764"/><rect x="15" y="17" width="18" height="18" rx="5" fill="#3B0764"/>' +
      '<rect x="18" y="19.5" width="12" height="13" rx="3.5" fill="#FFD25A"/><circle cx="24" cy="26" r="9" fill="url(#glow)"/><path d="M24 22.5 C26 25 26 28 24 29.5 C22 28 22 25 24 22.5Z" fill="#FF8A1F"/>' +
      '<path d="M17 35h14l-2.5 4h-9z" fill="#3B0764"/>',
    rawatib: () => bg('teal') + mosque('#fff', 24, 27, 1.05) + crescent(24, 9.5, 2.6, '#FFD25A', .8) + '<rect y="40" width="48" height="8" fill="#0B6E66"/>',
    duha: () => bg('dhuhr') + '<circle cx="16" cy="18" r="11" fill="url(#glow)"/><circle cx="16" cy="18" r="6.5" fill="url(#g-sun)"/>' +
      '<path d="M0 34 Q16 26 30 32 T48 30 V48 H0Z" fill="#2FAE5C"/><path d="M0 40 Q18 34 34 39 T48 38 V48 H0Z" fill="#1E8A47"/>',
    istighfar: () => bg('rose') + '<circle cx="24" cy="24" r="15" fill="url(#glow)" opacity=".5"/><path d="M24 36 C24 36 12 29 12 20.5 A6.5 6.5 0 0 1 24 16.8 A6.5 6.5 0 0 1 36 20.5 C36 29 24 36 24 36Z" fill="#fff"/>' +
      '<path d="M37 8l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z M10 30l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#FFF3C4"/>',
    sadaqa: () => bg('lime') + '<ellipse cx="24" cy="37" rx="12" ry="3.2" fill="#3E7A0E"/><circle cx="24" cy="22" r="11.5" fill="url(#g-gold)" stroke="#B87400" stroke-width="1.4"/>' +
      '<circle cx="24" cy="22" r="8" fill="none" stroke="#FFF7CF" stroke-width="1.2" opacity=".8"/><path d="M24 27 C24 27 19 24 19 20.8 A2.6 2.6 0 0 1 24 19.3 A2.6 2.6 0 0 1 29 20.8 C29 24 24 27 24 27Z" fill="#E3264E"/>',
    birr: () => bg('orange') + '<path d="M24 9 L40 22 H36 V38 H12 V22 H8Z" fill="#fff"/><path d="M24 9 L40 22 H8Z" fill="#B4430E"/>' +
      '<path d="M24 34 C24 34 17.5 30 17.5 25.6 A3.4 3.4 0 0 1 24 23.7 A3.4 3.4 0 0 1 30.5 25.6 C30.5 30 24 34 24 34Z" fill="#F0457F"/>',
    fasting: () => bg('night') + stars([[9, 9], [39, 10, .8]]) + '<circle cx="24" cy="27" r="13" fill="#E9EDFF"/><circle cx="24" cy="27" r="9.5" fill="#fff"/>' +
      crescent(23, 26.5, 5.2, '#FFC93C', .8) + '<path d="M6 16v8M4 16v4.5a2 2 0 0 0 4 0V16M42 16v20M42 16c2.5 1 3 5 0 8" stroke="#E9EDFF" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
    water: () => bg('cyan') + '<path d="M14 12 H34 L31.5 40 C31.3 41.2 30.4 42 29.2 42 H18.8 C17.6 42 16.7 41.2 16.5 40Z" fill="url(#g-glass)" opacity=".9"/>' +
      '<path d="M15.4 22 H32.6 L31.5 40 C31.3 41.2 30.4 42 29.2 42 H18.8 C17.6 42 16.7 41.2 16.5 40Z" fill="url(#g-water)"/><path d="M18 25h3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
      '<circle cx="21" cy="31" r="1.2" fill="#fff" opacity=".7"/><circle cx="26" cy="35" r="1" fill="#fff" opacity=".6"/>',
    sleep: () => bg('night') + crescent(21, 25, 11, '#FFE08A', .82) + '<g fill="#fff" font-family="sans-serif" font-weight="900"><text x="31" y="17" font-size="9">z</text><text x="37" y="11" font-size="6.5" opacity=".8">z</text></g>' +
      '<path d="M8 40a4 4 0 0 1 3.5-5.5 5.5 5.5 0 0 1 10.5 1.5 3 3 0 0 1 .5 6H10.5A2.5 2.5 0 0 1 8 40z" fill="#C7CBFF" opacity=".9"/>',
    veggies: () => bg('lime') + '<path d="M24 16 C17 13 11 18 12.5 26 C14 34 19 39 24 37.5 C29 39 34 34 35.5 26 C37 18 31 13 24 16Z" fill="#E3264E"/>' +
      '<path d="M18 19 C16 21 15.5 24 16.5 27" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55" fill="none"/>' +
      '<path d="M24 16 C24 12 25 10 27 8.5" stroke="#6B3A12" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M26 12 C29 8 34 8 36 10 C33 13 29 13.5 26 12Z" fill="#2E9E3E"/>',
    noSoda: () => bg('slate') + '<rect x="15" y="10" width="18" height="29" rx="4" fill="url(#g-can)"/><rect x="15" y="10" width="18" height="4" rx="2" fill="#E7EBF0"/>' +
      '<path d="M15 23 C20 20 28 27 33 24 V29 C28 32 20 25 15 28Z" fill="#fff"/><rect x="18" y="13" width="2.4" height="24" rx="1.2" fill="#fff" opacity=".25"/>' + ban,
    noPhoneBed: () => bg('slate') + '<rect x="14" y="7" width="20" height="34" rx="4.5" fill="#1F2937"/><rect x="16" y="10" width="16" height="26" rx="2" fill="url(#g-night)"/>' +
      crescent(23, 22, 4.6, '#FFE08A', .8) + '<rect x="21" y="37.7" width="6" height="1.4" rx=".7" fill="#6A7A90"/>' + ban,
    mosque: () => A.rawatib(),
    star: () => bg('gold') + '<path d="M24 9 l4.4 9.2 10 1.3 -7.3 7 1.8 10 -8.9-4.8 -8.9 4.8 1.8-10 -7.3-7 10-1.3z" fill="#fff"/><path d="M24 9 l4.4 9.2 10 1.3 -7.3 7 1.8 10 -8.9-4.8z" fill="#FFF4C9"/>',
    fire: () => bg('rose') + '<path d="M24 41 C31 41 35.5 36.5 35.5 30 C35.5 23 29.5 19 28 10 C24.5 13 22.5 17 23 21.5 C20.5 20 19 17.5 18.8 15 C15 18.5 12.5 23.5 12.5 29.5 C12.5 36.2 17 41 24 41Z" fill="url(#g-flame)"/>' +
      '<path d="M24 41 C27.6 41 30 38.4 30 35 C30 31 26.6 29 25.6 25 C23.4 26.6 22 29 22.3 31.5 C21 30.8 20.2 29.7 19.9 28.5 C18.6 30.4 18 32.3 18 34.6 C18 38.3 20.5 41 24 41Z" fill="#FFF0A8"/>',
    shield: () => A.chastity(),
    trophy: () => bg('indigo') + '<path d="M16 10 H32 V20 A8 8 0 0 1 16 20Z" fill="url(#g-gold)"/><path d="M16 12.5 H11 V16 A5 5 0 0 0 16 21 M32 12.5 H37 V16 A5 5 0 0 1 32 21" stroke="#FFD25A" stroke-width="2.4" fill="none"/>' +
      '<rect x="22" y="27" width="4" height="6" fill="#E59500"/><path d="M16 33 H32 L33.5 39 H14.5Z" fill="url(#g-gold)"/><rect x="18" y="14" width="2.4" height="9" rx="1.2" fill="#fff" opacity=".45"/>',
    compass: () => bg('blue') + '<circle cx="24" cy="24" r="14" fill="#fff"/><circle cx="24" cy="24" r="11" fill="none" stroke="#D6E4FF" stroke-width="1.4"/>' +
      '<path d="M24 12 L28 24 H20Z" fill="#F43F5E"/><path d="M24 36 L20 24 H28Z" fill="#334155"/><circle cx="24" cy="24" r="2" fill="#fff" stroke="#334155"/>',
    pin: () => bg('rose') + '<ellipse cx="24" cy="39" rx="7" ry="2" fill="#000" opacity=".2"/><path d="M24 39 C24 39 13 28.5 13 20.5 A11 11 0 0 1 35 20.5 C35 28.5 24 39 24 39Z" fill="#fff"/><circle cx="24" cy="20.5" r="4.3" fill="#E3264E"/>',
    bell: () => bg('orange') + '<path d="M24 9 C17.5 9 15 14 15 20 V27 L12 31.5 H36 L33 27 V20 C33 14 30.5 9 24 9Z" fill="url(#g-gold)"/><circle cx="24" cy="35" r="3.3" fill="#FFF0A3"/><rect x="18.5" y="13" width="2.2" height="11" rx="1.1" fill="#fff" opacity=".5"/>',
    calendar: () => bg('slate') + '<rect x="9" y="11" width="30" height="28" rx="5" fill="#fff"/><path d="M9 16 A5 5 0 0 1 14 11 H34 A5 5 0 0 1 39 16 V19 H9Z" fill="#F43F5E"/>' +
      '<g fill="#CBD5E1"><circle cx="16" cy="25.5" r="1.8"/><circle cx="24" cy="25.5" r="1.8"/><circle cx="32" cy="25.5" r="1.8"/><circle cx="16" cy="32.5" r="1.8"/><circle cx="24" cy="32.5" r="1.8"/></g><circle cx="32" cy="32.5" r="2.6" fill="#10B981"/>',
    clock: () => bg('orange') + '<circle cx="14" cy="12" r="4.5" fill="#B4430E"/><circle cx="34" cy="12" r="4.5" fill="#B4430E"/><circle cx="24" cy="26" r="13" fill="#fff"/>' +
      '<path d="M24 19 V26 L29 29" stroke="#334155" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M15 38l-2.5 3M33 38l2.5 3" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
    person: () => bg('slate') + '<circle cx="24" cy="19" r="7" fill="#fff"/><path d="M11 40 C12 31.5 17.5 28 24 28 C30.5 28 36 31.5 37 40Z" fill="#fff"/>',
    steps: () => bg('blue') + '<g fill="#fff"><ellipse cx="17" cy="20" rx="4.3" ry="7" transform="rotate(-12 17 20)"/><ellipse cx="18.3" cy="31.5" rx="3.3" ry="3" /><ellipse cx="31" cy="15" rx="4.3" ry="7" transform="rotate(12 31 15)" opacity=".8"/><ellipse cx="29.6" cy="26.5" rx="3.3" ry="3" opacity=".8"/></g>',
    moon: () => bg('night') + '<circle cx="24" cy="24" r="12" fill="#fff"/><path d="M24 12 A12 12 0 0 1 24 36Z" fill="#1A1748"/>',
    backup: () => bg('blue') + '<path d="M14 35 A7 7 0 0 1 13.5 21 A10 10 0 0 1 33 19 A8 8 0 0 1 34 35Z" fill="#fff"/><path d="M24 31 V22 M20 25.5 L24 21.5 L28 25.5" stroke="#2C5FE8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    trash: () => bg('rose') + '<rect x="12" y="13" width="24" height="3.5" rx="1.75" fill="#fff"/><rect x="20" y="9.5" width="8" height="4" rx="1.5" fill="#fff"/><path d="M14.5 18 H33.5 L32 37 C31.9 38.7 30.6 40 29 40 H19 C17.4 40 16.1 38.7 16 37Z" fill="#fff"/>' +
      '<g stroke="#E3264E" stroke-width="1.8" stroke-linecap="round" opacity=".6"><path d="M20.5 23v12M24 23v12M27.5 23v12"/></g>',
    bulb: () => bg('night') + '<circle cx="24" cy="20" r="14" fill="url(#glow)" opacity=".8"/><path d="M24 9 A10 10 0 0 0 18 27 C19.2 28 19.8 29.3 19.8 31 H28.2 C28.2 29.3 28.8 28 30 27 A10 10 0 0 0 24 9Z" fill="#FFE08A"/>' +
      '<rect x="19.8" y="32" width="8.4" height="3" rx="1" fill="#CBD5E1"/><rect x="20.8" y="35.5" width="6.4" height="3" rx="1.5" fill="#94A3B8"/><path d="M21 15 A6 6 0 0 1 24.5 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
    help: () => bg('rose') + '<path d="M24 37 C24 37 11 30 11 20.5 A7 7 0 0 1 24 16.5 A7 7 0 0 1 37 20.5 C37 30 24 37 24 37Z" fill="#fff"/><path d="M15 25 H20 L22 21 L25.5 29 L27.5 25 H33" stroke="#E3264E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    points: () => bg('purple') + '<path d="M24 8 l3.2 9.8 9.8 3.2 -9.8 3.2 -3.2 9.8 -3.2-9.8 -9.8-3.2 9.8-3.2z" fill="#fff"/><path d="M36 30 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4-4 -4-1.4 4-1.4z" fill="#FFE08A"/>',
    gift: () => bg('rose') + '<rect x="10" y="20" width="28" height="7" rx="2" fill="#fff"/><rect x="12" y="27" width="24" height="13" rx="2" fill="#FFE3EA"/><rect x="22" y="20" width="4" height="20" fill="#FFD25A"/>' +
      '<path d="M24 20 C20 14 13.5 15 15.5 19 C17 21 21 20.5 24 20Z M24 20 C28 14 34.5 15 32.5 19 C31 21 27 20.5 24 20Z" fill="#FFD25A"/>'
  };

  /* الأوسمة والمستويات */
  const ribbon = (c1, c2) => `<path d="M15 3 H23 L28 21 H20Z" fill="${c1}"/><path d="M33 3 H25 L20 21 H28Z" fill="${c2}"/>`;
  const medal = (g, num, c1, c2, ink) => `${ribbon(c1, c2)}<circle cx="24" cy="31" r="13.5" fill="url(#g-${g})" stroke="${ink}" stroke-opacity=".35" stroke-width="1.4"/>
    <circle cx="24" cy="31" r="10" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>
    <text x="24" y="35.6" text-anchor="middle" font-family="Thmanyah, sans-serif" font-weight="900" font-size="13" fill="${ink}">${num}</text>`;
  const M = {
    w1: () => medal('bronze', '١', '#2563EB', '#1D4ED8', '#6B2F08'),
    w2: () => medal('silver', '٢', '#DC2626', '#B91C1C', '#475569'),
    w3: () => medal('gold', '٣', '#059669', '#047857', '#8A5A00'),
    w4: () => `${ribbon('#7C3AED', '#6D28D9')}<path d="M14 25 L19 19 H29 L34 25 L24 42Z" fill="url(#g-diamond)"/><path d="M14 25 H34 M19 19 L22 25 L24 42 M29 19 L26 25 L24 42" stroke="#fff" stroke-opacity=".7" stroke-width="1.1" fill="none"/>`,
    all: () => `<path d="M15 9 H33 V19 A9 9 0 0 1 15 19Z" fill="url(#g-gold)"/><path d="M15 11.5 H9.5 V15 A5.5 5.5 0 0 0 15 20.5 M33 11.5 H38.5 V15 A5.5 5.5 0 0 1 33 20.5" stroke="#F2B21B" stroke-width="2.6" fill="none"/>
      <rect x="21.8" y="27.5" width="4.4" height="6" fill="#D98A00"/><path d="M14.5 33.5 H33.5 L35 41 H13Z" fill="url(#g-gold)"/><rect x="18" y="12.5" width="2.6" height="9" rx="1.3" fill="#fff" opacity=".55"/>
      <path d="M24 12.5 l1.3 2.7 3 .4 -2.2 2 .6 3 -2.7-1.5 -2.7 1.5 .6-3 -2.2-2 3-.4z" fill="#fff"/>`,
    lv0: () => `<path d="M24 42 V26" stroke="#3E8E2F" stroke-width="3" stroke-linecap="round"/><path d="M24 30 C16 31 10 26 10 18 C18 17 23 22 24 30Z" fill="url(#g-leaf)"/><path d="M24 26 C25 18 31 13 38 14 C38 22 32 27 24 26Z" fill="url(#g-leaf)"/><ellipse cx="24" cy="42.5" rx="10" ry="2.5" fill="#8A5A2B" opacity=".5"/>`,
    lv1: () => `<path d="M24 43 V14" stroke="#3E8E2F" stroke-width="3" stroke-linecap="round"/>${[[30, -1], [23, 1], [16, -1]].map(([y, d]) => `<path d="M24 ${y} C${24 + d * 9} ${y - 1} ${24 + d * 13} ${y - 7} ${24 + d * 12} ${y - 12} C${24 + d * 5} ${y - 11} ${24 + d} ${y - 6} 24 ${y}Z" fill="url(#g-leaf)"/>`).join('')}<ellipse cx="24" cy="43.5" rx="10" ry="2.5" fill="#8A5A2B" opacity=".5"/>`,
    lv2: () => `<rect x="21.5" y="27" width="5" height="16" rx="2" fill="#8A5A2B"/><circle cx="24" cy="18" r="11" fill="url(#g-leaf)"/><circle cx="15" cy="25" r="7.5" fill="#46B04A"/><circle cx="33" cy="25" r="7.5" fill="#3E9E3E"/><circle cx="20" cy="13" r="3" fill="#fff" opacity=".25"/><ellipse cx="24" cy="43.5" rx="12" ry="2.5" fill="#8A5A2B" opacity=".45"/>`,
    lv3: () => `<path d="M24 5 l5.6 11.8 12.9 1.7 -9.4 9 2.3 12.8 -11.4-6.2 -11.4 6.2 2.3-12.8 -9.4-9 12.9-1.7z" fill="url(#g-gold)" stroke="#E59500" stroke-width="1.2" stroke-linejoin="round"/><path d="M24 11 l3.4 7.2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
    lv4: () => medal('gold', '★', '#E3264E', '#BE123C', '#8A5A00'),
    lv5: () => `<path d="M7 18 L15 26 L24 11 L33 26 L41 18 L38 37 H10Z" fill="url(#g-gold)" stroke="#D98A00" stroke-width="1.3" stroke-linejoin="round"/><rect x="10" y="36" width="28" height="5" rx="1.5" fill="#E59500"/>
      <circle cx="24" cy="29" r="3" fill="#E3264E"/><circle cx="15.5" cy="31" r="2" fill="#2C5FE8"/><circle cx="32.5" cy="31" r="2" fill="#0A8F63"/><circle cx="7" cy="18" r="2.2" fill="#FFE08A"/><circle cx="41" cy="18" r="2.2" fill="#FFE08A"/><circle cx="24" cy="11" r="2.4" fill="#FFE08A"/>`,
    starBig: () => `<path d="M24 4 l6 12.6 13.8 1.8 -10.1 9.6 2.5 13.7 -12.2-6.6 -12.2 6.6 2.5-13.7 -10.1-9.6 13.8-1.8z" fill="url(#g-gold)" stroke="#E59500" stroke-width="1.2" stroke-linejoin="round"/><path d="M24 4 l6 12.6 13.8 1.8 -10.1 9.6 2.5 13.7 -12.2-6.6z" fill="#fff" opacity=".22"/>`
  };

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
