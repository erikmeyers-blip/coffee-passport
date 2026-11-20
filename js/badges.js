// Stamps (badges). Every stamp is worked out from the visit log, the shop list
// and the per-shop ratings, so nothing is tracked twice and nothing drifts.
(function () {
  const G = () => window.CP_GEO;

  // Shapes are Material 3 Expressive-style polygons: [lobes, depth].
  const DEFS = [
    { id: 'explorer', name: 'Explorer', glyph: 'E', shape: [9, 0.07], color: '#6F3F1E', rule: 'Try new shops. Levels at 5, 10 and 25.', levels: [5, 10, 25] },
    { id: 'corners', name: 'Four Corners', glyph: '4', shape: [4, 0.2], color: '#E8A21B', rule: 'Visit the shop in each corner of the map.' },
    { id: 'bingo', name: 'Bingo', glyph: 'B', shape: [12, 0.05], color: '#E8742A', rule: 'Fill a row or column of squares from edge to edge.' },
    { id: 'blackout', name: 'Blackout Bingo', glyph: '■', shape: [16, 0.04], color: '#3B2A21', rule: 'A stamp in every square that has a shop.' },
    { id: 'farafield', name: 'Far Afield', glyph: 'mi', shape: [3, 0.12], color: '#A0582A', rule: 'Your farthest shop from home. Levels at 1, 2 and 3 miles.', levels: [1, 2, 3] },
    { id: 'teacher', name: 'Good Teacher', glyph: 'A+', shape: [6, 0.1], color: '#FFB784', rule: 'Check in for schoolwork or lesson planning. Levels at 3, 10 and 25.', levels: [3, 10, 25] },
    { id: 'health', name: 'Good Health', glyph: '♥', shape: [8, 0.14], color: '#8BC34A', rule: 'Walk or bike to a shop. Levels at 1, 5 and 15 trips.', levels: [1, 5, 15] },
    { id: 'knowlike', name: 'I Know What I Like', glyph: '★', shape: [10, 0.06], color: '#C98A5A', rule: 'Pick a favorite drink at 3 shops.', need: 3 },
    { id: 'signature', name: 'Signature Drink', glyph: 'S', shape: [7, 0.12], color: '#E8742A', rule: 'The same kind of favorite drink (chai, mocha, matcha...) at 3 shops.', need: 3 },
    { id: 'seasons', name: 'Four Seasons', glyph: '❄', shape: [12, 0.08], color: '#64A8C0', rule: 'A visit in winter, spring, summer and fall, back to back.', need: 4 },
    { id: 'date', name: 'Coffee Date', glyph: '♥', shape: [5, 0.16], color: '#F48FB1', rule: 'Check in together on a coffee date.', need: 1 },
    { id: 'regular', name: 'Regular', glyph: 'R', shape: [16, 0.04], color: '#6F3F1E', rule: '5 visits to the same shop.', need: 5 },
    { id: 'menu', name: 'Menu Explorer', glyph: 'M', shape: [9, 0.07], color: '#A0582A', rule: 'Try different drinks. Levels at 10 and 25.', levels: [10, 25] },
    { id: 'patio', name: 'Patio Season', glyph: 'P', shape: [6, 0.1], color: '#8BC34A', rule: 'Visit a shop with a patio between May and September.', need: 1 },
    { id: 'water', name: 'Creek Crawl', glyph: '~', shape: [3, 0.12], color: '#64A8C0', rule: 'Every shop with a water view.' },
    { id: 'early', name: 'Early Bird', glyph: '☀', shape: [12, 0.05], color: '#FFB784', rule: 'A visit before 8 am.', need: 1 },
    { id: 'night', name: 'Night Owl', glyph: '☾', shape: [10, 0.06], color: '#3B2A21', rule: 'A visit after 6 pm.', need: 1 },
    { id: 'full', name: 'Full Passport', glyph: '✓', shape: [12, 0.06], color: '#E8A21B', rule: 'Stamp every shop on the map.' }
  ];

  const norm = s => (s || '').trim().toLowerCase();
  function seasonIndex(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    let y = d.getFullYear(); const m = d.getMonth();
    if (m === 11) y += 1; // December belongs to next year's winter
    const s = m === 11 || m <= 1 ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3; // winter, spring, summer, fall
    return y * 4 + s;
  }
  const SEASON_NAMES = ['Winter', 'Spring', 'Summer', 'Fall'];

  function bingoState(shops, visitedSet) {
    const geo = G(), R = geo.BINGO.rows.length, C = geo.BINGO.cols.length;
    const cells = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push({ r, c, shops: [], stamped: false });
    shops.forEach(s => { const sq = geo.bingoSquare(s); if (sq) { const cell = cells[sq[0] * C + sq[1]]; cell.shops.push(s.name); if (visitedSet.has(s.name)) cell.stamped = true; } });
    cells.forEach(c => { c.free = c.shops.length === 0; });
    const lineDone = arr => arr.every(c => c.free || c.stamped) && arr.some(c => !c.free);
    const rows = [], cols = [];
    for (let r = 0; r < R; r++) rows.push(lineDone(cells.filter(c => c.r === r)));
    for (let c = 0; c < C; c++) cols.push(lineDone(cells.filter(x => x.c === c)));
    const playable = cells.filter(c => !c.free);
    return { cells, rows, cols, lines: rows.filter(Boolean).length + cols.filter(Boolean).length, stamped: playable.filter(c => c.stamped).length, playable: playable.length, blackout: playable.every(c => c.stamped) };
  }

  function compute(state) {
    const geo = G();
    const shops = state.shops, visits = state.visits || [], ratings = state.ratings || {};
    const byName = Object.fromEntries(shops.map(s => [s.name, s]));
    const visited = new Set(visits.map(v => v.shop).filter(n => byName[n]));
    const corners = geo.corners(shops);
    const bingo = bingoState(shops, visited);
    const out = {};
    const lvl = (def, have) => {
      const levels = def.levels || [def.need || 1];
      const reached = levels.filter(n => have >= n).length;
      const next = levels[reached];
      return { have, need: next || levels[levels.length - 1], level: reached, earned: reached > 0, maxed: !next };
    };
    const set = (id, o) => { out[id] = Object.assign({}, DEFS.find(d => d.id === id), o); };

    set('explorer', Object.assign(lvl(DEFS[0], visited.size), {}));
    out.explorer.progress = `${visited.size} ${visited.size === 1 ? 'shop' : 'shops'}` + (out.explorer.maxed ? '' : ` · next level at ${out.explorer.need}`);

    const cornerNames = Object.values(corners);
    const cornersDone = cornerNames.filter(n => visited.has(n)).length;
    set('corners', { have: cornersDone, need: 4, earned: cornersDone === 4, progress: `${cornersDone} of 4 corners`, corners });

    set('bingo', { have: bingo.lines, need: 1, earned: bingo.lines > 0, progress: bingo.lines ? `${bingo.lines} ${bingo.lines === 1 ? 'line' : 'lines'} done` : `${bingo.stamped} of ${bingo.playable} squares` });
    set('blackout', { have: bingo.stamped, need: bingo.playable, earned: bingo.blackout, progress: `${bingo.stamped} of ${bingo.playable} squares` });

    let far = 0, farShop = null;
    if (state.home) visited.forEach(n => { const m = geo.miles(state.home, byName[n]); if (m > far) { far = m; farShop = n; } });
    const fa = lvl(DEFS[4], far);
    set('farafield', Object.assign(fa, { progress: state.home ? (farShop ? `${far.toFixed(1)} mi · ${farShop}` : 'No visits yet') : 'Needs home in the sheet', hidden: !state.home }));

    const teach = visits.filter(v => norm(v.purpose) === 'schoolwork').length;
    set('teacher', Object.assign(lvl(DEFS[5], teach), { progress: `${teach} work sessions` }));
    const health = visits.filter(v => ['walked', 'biked'].includes(norm(v.how))).length;
    set('health', Object.assign(lvl(DEFS[6], health), { progress: `${health} walk or bike trips` }));

    const favs = Object.entries(ratings).filter(([n, r]) => r && r.fav && byName[n]);
    set('knowlike', { have: favs.length, need: 3, earned: favs.length >= 3, progress: `${Math.min(favs.length, 3)} of 3 favorites` });
    const typeOf = (shop, drink) => { const m = (state.menus || []).find(x => x.shop === shop && norm(x.drink) === norm(drink)); return m ? m.type : (/(chai)/i.test(drink) ? 'Chai' : /matcha/i.test(drink) ? 'Matcha' : /mocha/i.test(drink) ? 'Mocha' : /cold/i.test(drink) ? 'Cold brew' : 'Latte'); };
    const typeCounts = {};
    favs.forEach(([n, r]) => { const t = typeOf(n, r.fav); typeCounts[t] = (typeCounts[t] || 0) + 1; });
    const best = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    set('signature', { have: best ? best[1] : 0, need: 3, earned: !!best && best[1] >= 3, progress: best ? `${best[0]}: ${Math.min(best[1], 3)} of 3 shops` : 'No favorites yet' });

    const seasonSet = new Set(visits.map(v => seasonIndex(v.date)));
    let run = 0, bestRun = 0; const sortedS = [...seasonSet].sort((a, b) => a - b);
    sortedS.forEach((s, i) => { run = i && s === sortedS[i - 1] + 1 ? run + 1 : 1; bestRun = Math.max(bestRun, run); });
    const now = seasonIndex(new Date().toISOString().slice(0, 10));
    const currentYearSeasons = [0, 1, 2, 3].map(k => now - 3 + k).map(idx => ({ name: SEASON_NAMES[((idx % 4) + 4) % 4], done: seasonSet.has(idx), current: idx === now }));
    set('seasons', { have: Math.min(bestRun, 4), need: 4, earned: bestRun >= 4, progress: `${Math.min(bestRun, 4)} of 4 seasons in a row`, seasons: currentYearSeasons });

    const dates = visits.filter(v => norm(v.purpose) === 'coffee date').length;
    set('date', { have: dates, need: 1, earned: dates > 0, progress: dates ? `${dates} coffee ${dates === 1 ? 'date' : 'dates'}` : 'Not yet' });

    const counts = {}; visits.forEach(v => { counts[v.shop] = (counts[v.shop] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    set('regular', { have: top ? top[1] : 0, need: 5, earned: !!top && top[1] >= 5, progress: top ? `${top[0]}: ${Math.min(top[1], 5)} of 5 visits` : 'No visits yet' });

    const drinks = new Set(visits.filter(v => v.drink).map(v => v.shop + '|' + norm(v.drink)));
    set('menu', Object.assign(lvl(DEFS[12], drinks.size), { progress: `${drinks.size} different drinks` }));

    const patio = visits.some(v => byName[v.shop] && byName[v.shop].tags.patio && [4, 5, 6, 7, 8].includes(new Date(v.date + 'T12:00:00').getMonth()));
    set('patio', { have: patio ? 1 : 0, need: 1, earned: patio, progress: patio ? 'Earned' : 'Not yet' });

    const waterShops = shops.filter(s => s.tags.water).map(s => s.name);
    const waterDone = waterShops.filter(n => visited.has(n)).length;
    set('water', { have: waterDone, need: waterShops.length || 1, earned: waterShops.length > 0 && waterDone === waterShops.length, progress: `${waterDone} of ${waterShops.length} water-view shops` });

    const hour = v => parseInt((v.time || '12:00').split(':')[0], 10);
    const early = visits.some(v => hour(v) < 8), night = visits.some(v => hour(v) >= 18);
    set('early', { have: early ? 1 : 0, need: 1, earned: early, progress: early ? 'Earned' : 'Not yet' });
    set('night', { have: night ? 1 : 0, need: 1, earned: night, progress: night ? 'Earned' : 'Not yet' });

    set('full', { have: visited.size, need: shops.length, earned: shops.length > 0 && visited.size === shops.length, progress: `${visited.size} of ${shops.length} shops` });

    const list = DEFS.map(d => out[d.id]);
    return { list, byId: out, visited, corners, bingo };
  }

  // Which stamps (or levels) a new visit just earned.
  function diff(before, after) {
    return after.list.filter(b => !b.hidden && (b.level || (b.earned ? 1 : 0)) > ((before.byId[b.id].level) || (before.byId[b.id].earned ? 1 : 0)));
  }

  window.CP_BADGES = { DEFS, compute, diff, seasonIndex };
})();
