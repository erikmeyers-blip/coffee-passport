// Map geometry: the hand-drawn South Minneapolis map, Bingo squares
// and distances. Bounds: I-94 (north), France Ave (west),
// Hwy 62 (south), Mississippi River (east). Drawn at true proportions.
(function () {
  const LN = 44.968, LS = 44.886, WW = -93.333, EE = -93.195;
  const W = 1000;
  const H = Math.round(W * (LN - LS) / ((EE - WW) * 0.7077));
  const X = lng => (lng - WW) / (EE - WW) * W;
  const Y = lat => (LN - lat) / (LN - LS) * H;
  const f = n => n.toFixed(1);

  function smooth(pts, closed) {
    const n = pts.length, g = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    let d = 'M' + f(pts[0][0]) + ',' + f(pts[0][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
      d += ' C' + f(b[0] + (c[0] - a[0]) / 6) + ',' + f(b[1] + (c[1] - a[1]) / 6) + ' ' +
        f(c[0] - (e[0] - b[0]) / 6) + ',' + f(c[1] - (e[1] - b[1]) / 6) + ' ' + f(c[0]) + ',' + f(c[1]);
    }
    return d + (closed ? 'Z' : '');
  }
  const P = ([lat, lng]) => [X(lng), Y(lat)];
  function blob(lat, lng, rl, rg, k) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const t = i / 10 * Math.PI * 2;
      const w = 1 + 0.12 * Math.sin(3 * t + k) + 0.06 * Math.cos(5 * t + k);
      pts.push(P([lat + rl * Math.cos(t) * w, lng + rg * Math.sin(t) * w]));
    }
    return smooth(pts, true);
  }
  const stLat = n => 44.9485 - (n - 30) * 0.00181;
  // The city keeps going past the passport border, so there's always map
  // around the edges instead of blank space. PAD is that extra, in map units.
  const PAD = 320, L0 = -PAD, R0 = W + PAD, T0 = -PAD, B0 = H + PAD;

  function mapSVG() {
    const out = [];
    out.push('<rect x="-3000" y="-3000" width="7000" height="7000" fill="var(--map-land)"/>');
    let minor = '', major = '';
    for (let n = 0; n <= 100; n++) {
      const yy = Y(stLat(n)); if (yy < T0 || yy > B0) continue;
      const y = f(yy);
      const line = `<line x1="${L0}" x2="${R0}" y1="${y}" y2="${y}"/>`;
      if (n % 8 === 6 || n === 30) major += line; else minor += line;
    }
    for (let g = WW + 0.004 - 0.0045 * 10; X(g) < R0; g += 0.0045) if (X(g) > L0) minor += `<line y1="${T0}" y2="${B0}" x1="${f(X(g))}" x2="${f(X(g))}"/>`;
    const avenues = [['France', -93.329], ['Penn', -93.3085], ['Hennepin', -93.2984], ['Lyndale', -93.2883], ['Nicollet', -93.2777], ['Chicago', -93.2623], ['Cedar', -93.2475], ['28th Ave', -93.2326], ['34th Ave', -93.221]];
    avenues.forEach(([, g]) => { major += `<line y1="${T0}" y2="${B0}" x1="${f(X(g))}" x2="${f(X(g))}"/>`; });
    out.push(`<g stroke="var(--map-street)" stroke-width="2" vector-effect="non-scaling-stroke">${minor}</g>`);
    out.push(`<g stroke="var(--map-major)" stroke-width="5">${major}</g>`);
    out.push(`<path d="M${f(X(-93.2616))},${f(Y(45.000))} L${f(X(-93.2440))},${f(Y(44.963))} L${f(X(-93.2337))},${f(Y(44.9413))} L${f(X(-93.2056))},${f(Y(44.886))} L${f(X(-93.1873))},${f(Y(44.850))}" stroke="var(--map-major)" stroke-width="10" fill="none" stroke-linecap="round"/>`);
    const w35 = (y) => X(-93.2717) + (X(-93.2840) - X(-93.2717)) * (y - Y(44.92)) / (H + 20 - Y(44.92));
    out.push(`<path d="M${f(X(-93.2717))},${T0} L${f(X(-93.2717))},${f(Y(44.92))} L${f(w35(B0))},${B0}" stroke="var(--map-hwy)" stroke-width="8" fill="none" stroke-dasharray="18 10"/>`);
    const parks = [[44.946, -93.3105, 0.0105, 0.0080, 1], [44.9215, -93.3060, 0.0085, 0.0080, 3], [44.9085, -93.2420, 0.0080, 0.0088, 4], [44.9205, -93.2365, 0.0040, 0.0050, 5], [44.9396, -93.2590, 0.0030, 0.0040, 7], [44.9150, -93.2115, 0.0030, 0.0055, 8]];
    parks.forEach(p => out.push(`<path d="${blob(...p)}" fill="var(--map-park)"/>`));
    const creek = smooth([[44.9080, -93.3290], [44.9120, -93.3200], [44.9155, -93.3040], [44.9130, -93.2960], [44.9120, -93.2850], [44.9140, -93.2700], [44.9160, -93.2560], [44.9175, -93.2470], [44.9198, -93.2400], [44.9205, -93.2330], [44.9175, -93.2225], [44.9158, -93.2125], [44.9145, -93.2010]].map(P), false);
    out.push(`<path d="${creek}" stroke="var(--map-water)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    const lakes = [[44.946, -93.3105, 0.0085, 0.0062, 1], [44.9575, -93.3045, 0.0045, 0.0035, 2], [44.9215, -93.3060, 0.0068, 0.0062, 3], [44.9085, -93.2420, 0.0062, 0.0068, 4], [44.9205, -93.2365, 0.0026, 0.0034, 5], [44.9035, -93.2720, 0.0022, 0.0030, 6], [44.9396, -93.2590, 0.0012, 0.0020, 7]];
    lakes.forEach(p => out.push(`<path d="${blob(...p)}" fill="var(--map-water)"/>`));
    const bank = [[45.002, -93.2350], [44.970, -93.2290], [44.962, -93.2255], [44.955, -93.2150], [44.948, -93.2055], [44.935, -93.2005], [44.920, -93.2008], [44.905, -93.1985], [44.880, -93.1960], [44.850, -93.1900]].map(P);
    out.push(`<path d="${smooth(bank, false)} L${R0 + 60},${B0 + 60} L${R0 + 60},${T0 - 60} Z" fill="var(--map-water)"/>`);
    // Outside the passport area, shaded; dashed border; I-94 and Hwy 62.
    const fx = X(-93.3290), n94 = Y(44.9655), s62 = Y(44.8915);
    const inner = `M${f(fx)},${f(n94)} H${f(X(-93.2290))} L${f(X(-93.2255))},${f(Y(44.962))} L${f(X(-93.2150))},${f(Y(44.955))} L${f(X(-93.2055))},${f(Y(44.948))} L${f(X(-93.2005))},${f(Y(44.935))} L${f(X(-93.2008))},${f(Y(44.920))} L${f(X(-93.1985))},${f(Y(44.905))} L${f(X(-93.1975))},${f(s62)} H${f(fx)} Z`;
    out.push(`<path d="M-3000,-3000 H4000 V4000 H-3000 Z ${inner}" fill="var(--map-outside)" fill-rule="evenodd"/>`);
    out.push(`<path d="M${f(fx)},${f(n94)} H${f(X(-93.2290))} M${f(X(-93.1975))},${f(s62)} H${f(fx)} V${f(n94)}" fill="none" stroke="var(--map-border)" stroke-width="4" stroke-dasharray="14 9"/>`);
    out.push(`<path d="M${L0},${f(n94 - 10)} H${f(X(-93.226))}" stroke="var(--map-hwy)" stroke-width="12" fill="none"/>`);
    out.push(`<path d="M${L0},${f(s62 + 10)} H${R0}" stroke="var(--map-hwy)" stroke-width="12" fill="none"/>`);
    return `<svg class="map-svg" width="${W + 2 * PAD}" height="${H + 2 * PAD}" viewBox="${L0} ${T0} ${W + 2 * PAD} ${H + 2 * PAD}" style="position:absolute;left:${L0}px;top:${T0}px" aria-hidden="true">${out.join('')}</svg>`;
  }

  function mapLabels() {
    const L = [];
    [[30, 'Lake St'], [38, '38th St'], [46, '46th St'], [54, '54th St'], [22, '22nd St']].forEach(([n, t]) => {
      [24, 520].forEach(x => L.push({ cls: 'street', t, x, y: Y(stLat(n)) - 18 }));
    });
    [['France', -93.329], ['Hennepin', -93.2984], ['Lyndale', -93.2883], ['Nicollet', -93.2777], ['Chicago', -93.2623], ['Cedar', -93.2475], ['28th Ave', -93.2326], ['34th Ave', -93.221]].forEach(([t, g]) => L.push({ cls: 'street', t, x: X(g) + 4, y: Y(44.9625) }));
    L.push({ cls: 'street', t: 'I-94', x: 30, y: Y(44.9655) - 40 });
    L.push({ cls: 'street', t: 'Hwy 62', x: 30, y: Y(44.8915) + 22 });
    [['UPTOWN', 44.955, -93.296], ['WHITTIER', 44.961, -93.280], ['PHILLIPS', 44.957, -93.257], ['SEWARD', 44.957, -93.234], ['LINDEN HILLS', 44.931, -93.318], ['KINGFIELD', 44.928, -93.281], ['POWDERHORN', 44.944, -93.255], ['LONGFELLOW', 44.941, -93.222], ['TANGLETOWN', 44.909, -93.285], ['NOKOMIS', 44.900, -93.226], ['FULTON', 44.900, -93.320], ['WINDOM', 44.896, -93.275]].forEach(([t, la, lg]) => L.push({ cls: 'hood', t, x: X(lg), y: Y(la) }));
    [['Bde Maka Ska', 44.946, -93.3105], ['Lake Harriet', 44.9215, -93.306], ['Lake Nokomis', 44.9085, -93.242], ['Mississippi', 44.93, -93.197]].forEach(([t, la, lg]) => L.push({ cls: 'water', t, x: X(lg), y: Y(la) }));
    return L;
  }

  // Bingo: 4 rows (I-94 to Lake St, Lake to 38th, 38th to 46th, 46th to Hwy 62)
  // by 6 columns (France to the river). Each shop counts for the square its
  // pin sits in, so what you see on the map is what counts. Pins right on a
  // boundary street (within about a block) go to the square of their
  // neighborhood from the sheet, when that square is the one next door.
  const BINGO = {
    rows: [[44.9655, 44.948], [44.948, 44.934], [44.934, 44.920], [44.920, 44.8915]],
    cols: [[-93.329, -93.308], [-93.308, -93.2885], [-93.2885, -93.2623], [-93.2623, -93.2475], [-93.2475, -93.2326], [-93.2326, -93.197]],
    names: [
      ['Cedar-Isles', 'Uptown', 'Whittier', 'Phillips', 'Seward', 'Seward East'],
      ['Bde Maka Ska', 'CARAG', 'Lyndale', 'Powderhorn', 'Corcoran', 'Longfellow'],
      ['Linden Hills', 'East Harriet', 'Kingfield', 'Bancroft', 'Standish', 'Howe'],
      ['Fulton', 'Lynnhurst', 'Tangletown', 'Field', 'Nokomis', 'Minnehaha']
    ],
    hoods: {
      'cedar-isles-dean': [0, 0], 'kenwood': [0, 0],
      'lowry hill east': [0, 1], 'east isles': [0, 1], 'uptown': [0, 1],
      'whittier': [0, 2], 'stevens square': [0, 2], 'stevens square-loring heights': [0, 2],
      'ventura village': [0, 3], 'midtown phillips': [0, 3], 'phillips west': [0, 3], 'east phillips': [0, 3],
      'seward': [0, 4],
      'west maka ska': [1, 0], 'ecco': [1, 1], 'carag': [1, 1],
      'lyndale': [1, 2], 'central': [1, 3], 'powderhorn park': [1, 3], 'bryant': [1, 3],
      'corcoran': [1, 4], 'longfellow': [1, 5], 'cooper': [1, 5],
      'linden hills': [2, 0], 'east harriet': [2, 1], 'kingfield': [2, 2], 'king field': [2, 2],
      'bancroft': [2, 3], 'standish': [2, 4], 'ericsson': [2, 4], 'howe': [2, 5],
      'fulton': [3, 0], 'armatage': [3, 0], 'lynnhurst': [3, 1], 'kenny': [3, 1],
      'tangletown': [3, 2], 'windom': [3, 2], 'field': [3, 3], 'regina': [3, 3], 'northrop': [3, 3], 'diamond lake': [3, 3],
      'keewaydin': [3, 4], 'nokomis east': [3, 4], 'wenonah': [3, 4], 'page': [3, 3], 'hale': [3, 3],
      'hiawatha': [3, 5], 'minnehaha': [3, 5], 'morris park': [3, 5]
    }
  };
  // A square's own name works in the sheet's Neighborhood column too, e.g.
  // "Seward East" to put a shop on the border into that square.
  BINGO.names.forEach((row, r) => row.forEach((n, c) => { const k = n.toLowerCase(); if (!BINGO.hoods[k]) BINGO.hoods[k] = [r, c]; }));
  const EDGE = 0.001; // degrees, roughly a block
  function bingoSquare(shop) {
    const hood = BINGO.hoods[(shop.neighborhood || '').trim().toLowerCase()] || null;
    const has = typeof shop.lat === 'number' && typeof shop.lng === 'number' && !isNaN(shop.lat) && !isNaN(shop.lng);
    if (!has) return hood;
    const r = BINGO.rows.findIndex(([n, s]) => shop.lat <= n && shop.lat > s);
    const c = BINGO.cols.findIndex(([w, e]) => shop.lng >= w && shop.lng < e);
    const pos = r < 0 || c < 0 ? null : [r, c];
    if (!hood || (pos && pos[0] === hood[0] && pos[1] === hood[1])) return pos || hood;
    const [n, s] = BINGO.rows[hood[0]], [w, e] = BINGO.cols[hood[1]];
    const nearHood = shop.lat <= n + EDGE && shop.lat > s - EDGE && shop.lng >= w - EDGE && shop.lng < e + EDGE;
    return nearHood || !pos ? hood : pos;
  }
  function bingoCellRect(r, c) {
    const [n, s] = BINGO.rows[r], [w, e] = BINGO.cols[c];
    return { x: X(w), y: Y(n), w: X(e) - X(w), h: Y(s) - Y(n) };
  }

  function miles(a, b) {
    if (!a || !b) return null;
    const R = 3958.8, rad = d => d * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  window.CP_GEO = { W, H, PAD, X, Y, mapSVG, mapLabels, BINGO, bingoSquare, bingoCellRect, miles };
})();
