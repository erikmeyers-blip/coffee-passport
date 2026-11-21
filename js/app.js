// Coffee Passport: screens and interactions.
(function () {
  const G = window.CP_GEO, B = window.CP_BADGES, S = window.CP_STORE;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Shapes and icons ----------
  function shape(n, amp, r) {
    let d = '';
    for (let i = 0; i <= 96; i++) {
      const t = i / 96 * Math.PI * 2, rr = r * (1 + amp * Math.cos(n * t));
      d += (i ? 'L' : 'M') + (22 + rr * Math.sin(t)).toFixed(2) + ' ' + (22 - rr * Math.cos(t)).toFixed(2);
    }
    return d + 'Z';
  }
  const SH = { cookie: shape(9, 0.07, 17), cookieBig: shape(9, 0.07, 20), cookieIn: shape(9, 0.07, 15.5), circle: shape(1, 0, 14), flower: shape(8, 0.14, 17), flowerBig: shape(8, 0.14, 20), rays: shape(18, 0.1, 21) };
  const I = {
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    search: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    map: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z M9 4v14 M15 6v14"/></svg>',
    cup: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8z M16 10h2a2 2 0 0 1 0 4h-2 M8 3v2 M12 3v2"/></svg>',
    passport: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/></svg>',
    plus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    nav: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 20-8-5-8 5z"/></svg>',
    bookmark: f => `<svg width="20" height="20" viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`,
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    flag: (fill, stroke) => `<svg class="flag" viewBox="0 0 22 26" aria-hidden="true"><path d="M3 25V2" stroke="#3B2A21" stroke-width="2.2" stroke-linecap="round"/><path d="M4 3h14l-4 5 4 5H4z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    house: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB784" aria-hidden="true"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>'
  };

  let cupSeq = 0;
  function cupSVG(cls, opts) {
    const id = 'cc' + (++cupSeq), o = Object.assign({ size: 46, liquid: 'var(--coffee)', foam: 'var(--coffee-hi)', line: 'var(--primary)', empty: 'var(--container)', delay: 0 }, opts || {});
    const body = 'M4.5 9h12v5.5a5.5 5.5 0 0 1-5.5 5.5h-1a5.5 5.5 0 0 1-5.5-5.5z';
    return `<svg aria-hidden="true" class="cup ${cls}" style="--d:${o.delay}ms;overflow:visible" width="${o.size}" height="${o.size}" viewBox="0 0 24 24">
      <defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
      <g class="mug"><path d="${body}" fill="${o.empty}"/>
        <g clip-path="url(#${id})"><g class="liq"><g class="tilt">
          <path class="w2" d="M-12.5 9.9q2.5-1.4 5 0t5 0 5 0 5 0 5 0 5 0 5 0 5 0 5 0V26H-12.5z" fill="${o.foam}"/>
          <path class="w1" d="M-10 10.6q2.5-1.7 5 0t5 0 5 0 5 0 5 0 5 0 5 0 5 0V26H-10z" fill="${o.liquid}"/></g></g>
          <circle class="bub" style="--b:150ms" cx="8" cy="18.5" r=".75" fill="#E8B48A"/><circle class="bub" style="--b:380ms" cx="11.2" cy="19" r=".6" fill="#E8B48A"/><circle class="bub" style="--b:560ms" cx="13.6" cy="18" r=".7" fill="#E8B48A"/></g>
        <rect class="pour" x="9.75" y="-4" width="1.6" height="21" rx=".8" fill="${o.liquid}"/>
        <path d="${body} M16.5 11h1.2a2.6 2.6 0 0 1 0 5.2h-1.6" fill="none" stroke="${o.line}" stroke-width="1.7" stroke-linejoin="round"/>
        <path class="steam" d="M8.6 6.6c-.8-1 .8-1.8 0-3M12.4 6.6c-.8-1 .8-1.8 0-3" stroke="var(--orange)" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></svg>`;
  }
  const stampSVG = (d, fill, size, extra) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 44 44"><path d="${d}" fill="${fill}" ${extra || ''}/></svg>`;

  // ---------- Derived data ----------
  const D = () => S.data;
  const shops = () => D().shops;
  const shopBy = name => shops().find(s => s.name === name);
  const visitsAt = name => D().visits.filter(v => v.shop === name);
  const rating = name => D().ratings[name] || {};
  const menuFor = name => D().menus.filter(m => m.shop === name);
  const milesFromHome = s => D().home ? G.miles(D().home, s) : null;
  const shortName = n => n.replace(/ Coffee Cafe & Wine Bar| Coffee & Wine Bar| Coffee & More| Coffee \+ Cream/, '').replace(/ Coffee(?= \(|$)/, '');
  const WORDS = ['Tap to rate', 'Not for me', 'It was fine', 'Pretty good', 'Really good', 'The best'];
  const TAGS = [['working', 'Working'], ['bigTables', 'Big tables'], ['sunny', 'Sunny'], ['water', 'Water view'], ['patio', 'Patio'], ['quiet', 'Quiet']];
  let badgeState = null;
  const recompute = () => { badgeState = B.compute(D()); return badgeState; };

  // ---------- UI state ----------
  const UI = { filters: new Set(), bingo: false, names: false, drawerOpen: false, view: 'map', prevCups: {}, prevFav: {} };
  const V = { z: 0.8, tx: 0, ty: 0 };

  // ---------- Map ----------
  const mapEl = $('#map');
  const layer = document.createElement('div');
  layer.className = 'map-layer';
  layer.style.width = G.W + 'px'; layer.style.height = G.H + 'px';
  layer.innerHTML = G.mapSVG() + '<div id="labels"></div><div id="bingo"></div><div id="home"></div><div id="pins"></div>';
  mapEl.appendChild(layer);
  $('#labels', layer).innerHTML = G.mapLabels().map(l => `<span class="map-label ${l.cls}" style="left:${l.x.toFixed(0)}px;top:${l.y.toFixed(0)}px">${esc(l.t)}</span>`).join('');

  // The part of the screen the map can actually be seen in: below the search
  // bar and chips, above the peeking shop drawer. Everything is laid out
  // against this window, not the whole screen.
  let VIS = null;
  function measureVis() {
    const top = $('.topbar').getBoundingClientRect().bottom + 6;
    const peek = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--drawer-peek')) || 250;
    const bottom = Math.max(top + 120, innerHeight - peek);
    VIS = { l: 0, t: top, r: innerWidth, b: bottom, w: innerWidth, h: bottom - top };
    return VIS;
  }
  const vis = () => VIS || measureVis();
  // Smallest zoom shows the whole map; the starting zoom fills the window.
  const minZ = () => { const v = vis(); return Math.min(v.w / G.W, v.h / G.H); };
  const fillZ = () => { const v = vis(); return Math.max(v.w / G.W, v.h / G.H); };
  function clampAxis(t, size, lo, len) {
    // Smaller than the window: keep it centered. Bigger: its edges can't come
    // inside the window, so dragging stops at the map's edge on every side.
    return size <= len ? lo + (len - size) / 2 : Math.min(lo, Math.max(lo + len - size, t));
  }
  function clampView() {
    const v = vis();
    V.z = Math.max(minZ(), Math.min(3.2, V.z));
    // Panning runs to the edge of the drawn city around the passport area.
    const p = G.PAD * V.z;
    V.tx = clampAxis(V.tx - p, (G.W + 2 * G.PAD) * V.z, v.l, v.w) + p;
    V.ty = clampAxis(V.ty - p, (G.H + 2 * G.PAD) * V.z, v.t, v.h) + p;
  }
  function applyView() {
    clampView();
    layer.style.transform = `translate(${V.tx.toFixed(1)}px,${V.ty.toFixed(1)}px) scale(${V.z.toFixed(4)})`;
    layer.style.setProperty('--inv', (0.85 / V.z).toFixed(3));
    mapEl.classList.toggle('show-names', UI.names || V.z > 1.15);
  }
  function zoomAt(px, py, factor) {
    const mx = (px - V.tx) / V.z, my = (py - V.ty) / V.z;
    V.z = Math.max(minZ(), Math.min(3.2, V.z * factor));
    V.tx = px - mx * V.z; V.ty = py - my * V.z; applyView();
  }
  function centerOn(lat, lng, z) {
    if (z) V.z = Math.max(minZ(), Math.min(3.2, z));
    const v = vis();
    V.tx = v.l + v.w / 2 - G.X(lng) * V.z; V.ty = v.t + v.h / 2 - G.Y(lat) * V.z; applyView();
  }
  function fitAll() { const v = vis(); V.z = minZ(); V.tx = v.l + (v.w - G.W * V.z) / 2; V.ty = v.t + (v.h - G.H * V.z) / 2; applyView(); }

  // Drag, pinch and wheel.
  const ptrs = new Map(); let drag = null, pinch = null, moved = false;
  mapEl.addEventListener('pointerdown', e => {
    ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false;
    if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, tx: V.tx, ty: V.ty };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, z: V.z, tx: V.tx, ty: V.ty }; drag = null; }
  });
  mapEl.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1 && drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) > 6) { moved = true; try { mapEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      if (moved) { V.tx = drag.tx + dx; V.ty = drag.ty + dy; applyView(); }
    } else if (ptrs.size === 2 && pinch) {
      moved = true;
      const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const mx = (pinch.mx - pinch.tx) / pinch.z, my = (pinch.my - pinch.ty) / pinch.z;
      V.z = Math.max(minZ(), Math.min(3.2, pinch.z * d / Math.max(1, pinch.d)));
      V.tx = (a[0] + b[0]) / 2 - mx * V.z; V.ty = (a[1] + b[1]) / 2 - my * V.z; applyView();
    }
  });
  const endPtr = e => { ptrs.delete(e.pointerId); pinch = null; if (ptrs.size === 1) { const p = [...ptrs.values()][0]; drag = { x: p[0], y: p[1], tx: V.tx, ty: V.ty }; } else drag = null; };
  mapEl.addEventListener('pointerup', endPtr); mapEl.addEventListener('pointercancel', endPtr);
  mapEl.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  mapEl.addEventListener('click', e => {
    if (moved) { moved = false; return; }
    const pin = e.target.closest('.pin');
    if (pin) openShop(pin.dataset.shop);
  });
  addEventListener('resize', () => { measureVis(); applyView(); });

  function matchesFilters(s) { for (const f of UI.filters) if (!s.tags[f]) return false; return true; }

  function renderPins() {
    const bs = badgeState;
    $('#pins', layer).innerHTML = shops().map(s => {
      const v = bs.visited.has(s.name), r = rating(s.name).cups;
      const top = v && r === 5;
      const d = v ? (top ? SH.flower : SH.cookie) : SH.circle;
      const fill = v ? (top ? 'var(--orange)' : 'var(--primary)') : 'var(--bg)', stroke = v ? 'var(--bg)' : 'var(--primary)';
      const dim = UI.filters.size && !matchesFilters(s) ? ' dim' : '';
      return `<button class="pin${dim}" data-shop="${esc(s.name)}" style="left:${G.X(s.lng).toFixed(1)}px;top:${G.Y(s.lat).toFixed(1)}px" aria-label="${esc(s.name)}${v ? ', stamped' : ''}">
        <svg width="32" height="32" viewBox="0 0 44 44"><path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/></svg>
        <span class="pin-num"${top ? ' style="color:var(--on-orange)"' : ''}>${v ? (r || '✓') : ''}</span>
        <span class="pin-name">${esc(shortName(s.name))}</span></button>`;
    }).join('');
    const h = D().home;
    $('#home', layer).innerHTML = h ? `<div class="home-pin" style="left:${G.X(h.lng).toFixed(1)}px;top:${G.Y(h.lat).toFixed(1)}px" title="Home">${I.house}</div>` : '';
    renderBingoLayer();
  }

  function renderBingoLayer() {
    const el = $('#bingo', layer);
    mapEl.classList.toggle('bingo-on', UI.bingo);
    if (!UI.bingo) { el.innerHTML = ''; return; }
    const bg = badgeState.bingo, out = [];
    bg.cells.forEach(c => {
      const r = G.bingoCellRect(c.r, c.c);
      out.push(`<div class="bingo-cell ${c.free ? 'free' : c.stamped ? 'stamped' : ''}${c.corner ? ' corner' : ''}" style="left:${(r.x + 3).toFixed(0)}px;top:${(r.y + 3).toFixed(0)}px;width:${(r.w - 6).toFixed(0)}px;height:${(r.h - 6).toFixed(0)}px"><span>${c.corner ? I.flag(c.stamped ? '#E8A21B' : '#FFF8F4', c.stamped ? '#3B2A21' : '#E8742A').replace('class="flag"', 'class="cflag"') : ''}${esc(G.BINGO.names[c.r][c.c])}</span><span class="mark">${c.free ? 'FREE' : c.stamped ? '✓' : c.shops.length}</span></div>`);
    });
    bg.rows.forEach((done, r) => { if (done) { const a = G.bingoCellRect(r, 0), z = G.bingoCellRect(r, 5); out.push(`<div class="bingo-line" style="left:${a.x}px;top:${a.y}px;width:${z.x + z.w - a.x}px;height:${a.h}px"></div>`); } });
    bg.cols.forEach((done, c) => { if (done) { const a = G.bingoCellRect(0, c), z = G.bingoCellRect(3, c); out.push(`<div class="bingo-line" style="left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${z.y + z.h - a.y}px"></div>`); } });
    el.innerHTML = out.join('');
  }

  // ---------- Top chips, drawer ----------
  function renderChips() {
    const bs = badgeState;
    const chips = [
      `<button class="chip accent" aria-pressed="${UI.bingo}" data-chip="bingo">Bingo${bs.bingo.lines ? ' · ' + bs.bingo.lines : ''}</button>`
    ].concat(TAGS.map(([k, label]) => `<button class="chip" aria-pressed="${UI.filters.has(k)}" data-filter="${k}">${label}</button>`));
    $('#chips').innerHTML = chips.join('');
  }
  $('#chips').addEventListener('click', e => {
    const c = e.target.closest('button'); if (!c) return;
    if (c.dataset.chip === 'bingo') { UI.bingo = !UI.bingo; if (UI.bingo) fitAll(); }
    if (c.dataset.filter) { const f = c.dataset.filter; UI.filters.has(f) ? UI.filters.delete(f) : UI.filters.add(f); setDrawer(UI.filters.size > 0); }
    renderAll();
  });

  function shopRow(s, sub) {
    const v = badgeState.visited.has(s.name), r = rating(s.name).cups;
    const mini = v ? stampSVG(r === 5 ? SH.flowerBig : SH.cookieBig, r === 5 ? 'var(--orange)' : 'var(--primary)', 46) : stampSVG(SH.circle, 'var(--bg)', 46, 'stroke="var(--primary)" stroke-width="2.5"');
    return `<button class="shoprow press" data-shop="${esc(s.name)}"><span class="stampmini">${mini}<span style="color:${v ? (r === 5 ? 'var(--on-orange)' : 'var(--on-primary)') : 'var(--primary)'}">${v ? (r ? r + '' : '✓') : ''}</span></span><span style="min-width:0"><b>${esc(s.name)}</b><small>${esc(sub)}</small></span></button>`;
  }
  function renderDrawer() {
    const bs = badgeState, all = shops();
    let title = `${bs.visited.size} of ${all.length} stamped`, side = '', list;
    if (UI.filters.size) {
      list = all.filter(matchesFilters);
      title = `${list.length} ${list.length === 1 ? 'spot' : 'spots'} for ${[...UI.filters].map(f => TAGS.find(t => t[0] === f)[1].toLowerCase()).join(' + ')}`;
    } else {
      list = all.slice();
      side = D().home ? 'Closest new shops first' : '';
    }
    list.sort((a, b) => (bs.visited.has(a.name) - bs.visited.has(b.name)) || ((milesFromHome(a) || 0) - (milesFromHome(b) || 0)));
    $('#drawerTitle').innerHTML = `<h2>${esc(title)}</h2><span>${esc(side)}</span>`;
    $('#drawerList').innerHTML = list.map(s => {
      const m = milesFromHome(s), fav = rating(s.name).fav, n = visitsAt(s.name).length;
      const sub = [fav ? fav : null, n ? `${n} ${n === 1 ? 'visit' : 'visits'}` : 'Not tried yet', m != null ? m.toFixed(1) + ' mi' : null].filter(Boolean).join(' · ');
      return shopRow(s, sub);
    }).join('') || '<p style="color:var(--ink-3)">No shops match those filters.</p>';
  }
  function setDrawer(open) { UI.drawerOpen = open; $('#drawer').classList.toggle('open', open); }
  $('#drawerList').addEventListener('click', e => { const b = e.target.closest('[data-shop]'); if (b) openShop(b.dataset.shop); });
  (function drawerDrag() {
    const head = $('#drawerHead'); let y0 = null, moved2 = false;
    head.addEventListener('pointerdown', e => { y0 = e.clientY; moved2 = false; });
    head.addEventListener('pointermove', e => { if (y0 != null && Math.abs(e.clientY - y0) > 10) moved2 = true; });
    head.addEventListener('pointerup', e => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; if (!moved2) setDrawer(!UI.drawerOpen); else setDrawer(dy < 0); });
  })();

  // ---------- Pages ----------
  const pageEl = $('#page');
  // Screens remember how to reopen the one under them, so Back from a shop
  // opened in Search returns to Search.
  let pageReopen = null, trailMode = 'push';
  const pageTrail = [];
  function openPage(html, view, reopen) {
    if (!pageEl.hidden && pageReopen && trailMode === 'push') pageTrail.push(pageReopen);
    trailMode = 'push'; pageReopen = reopen || null;
    UI.view = view; pageEl.innerHTML = html; pageEl.hidden = false; pageEl.scrollTop = 0; setNav();
  }
  function closePage() { pageTrail.length = 0; pageReopen = null; UI.view = 'map'; pageEl.hidden = true; pageEl.innerHTML = ''; setNav(); renderAll(); }
  function pageBack() { const f = pageTrail.pop(); if (f) { trailMode = 'none'; f(); } else closePage(); }
  function openTab(f) { pageTrail.length = 0; trailMode = 'none'; f(); }
  function setNav() { document.querySelectorAll('.navpill button').forEach(b => b.setAttribute('aria-current', b.dataset.go === (UI.view.startsWith('shop') ? 'map' : UI.view) ? 'page' : 'false')); }
  pageEl.addEventListener('click', e => { if (e.target.closest('[data-back]')) pageBack(); });

  // Shop card
  let currentShop = null;
  function openShop(name) {
    const s = shopBy(name); if (!s) return;
    currentShop = name;
    UI.prevCups[name] = rating(name).cups || 0;
    UI.prevFav[name] = rating(name).fav || '';
    openPage(shopHTML(s), 'shop', () => openShop(name));
    shopSig = sigFor(name);
    settleShop(name);
  }
  function cupClass(on, was) { return on ? (was ? 'full' : 'fill') : (was ? 'drain' : ''); }
  function shopHTML(s) {
    const r = rating(s.name), cups = r.cups || 0, prev = UI.prevCups[s.name] || 0, n = visitsAt(s.name).length;
    const want = new Set(r.want || []), fav = r.fav || '', prevFav = UI.prevFav[s.name] || '';
    const cupBtns = [1, 2, 3, 4, 5].map(k => {
      const on = k <= cups, was = k <= prev, delay = on && !was ? (k - prev - 1) * 200 : (!on && was ? (prev - k) * 70 : 0);
      return `<button class="cupbtn press" data-cup="${k}" aria-label="${k} ${k === 1 ? 'cup' : 'cups'}" aria-pressed="${on}">${cupSVG(cupClass(on, was), { delay })}</button>`;
    }).join('');
    const tags = TAGS.filter(([k]) => s.tags[k]).map(([, l]) => `<span class="tag">${l}</span>`).join('') || '<span style="color:var(--ink-3)">Nothing tagged yet</span>';
    const menu = menuFor(s.name);
    const menuHTML = menu.length ? `<div class="menu-list">${menu.map(m => {
      const isFav = norm(m.drink) === norm(fav), wasFav = norm(m.drink) === norm(prevFav);
      return `<div class="menu-item"><div class="txt"><b>${esc(m.drink)}</b><small>${esc(isFav ? 'Your favorite' : (m.desc || m.type))}</small></div>
        <button class="iconbtn press" data-fav="${esc(m.drink)}" aria-pressed="${isFav}" aria-label="${isFav ? 'Your favorite' : 'Make this your favorite'}">${cupSVG(cupClass(isFav, wasFav), { size: 34, liquid: 'var(--orange)', foam: '#FFB784', empty: 'transparent' })}</button>
        <button class="iconbtn" data-want="${esc(m.drink)}" aria-pressed="${want.has(m.drink)}" aria-label="${want.has(m.drink) ? 'Saved to try' : 'Save to try'}">${I.bookmark(want.has(m.drink))}</button></div>`;
    }).join('')}</div>` : '<p style="color:var(--ink-3);margin:0">No menu in the sheet yet.</p>';
    const vlist = visitsAt(s.name).slice().reverse().slice(0, 8).map(v => `<li>${fmtDate(v.date)}${v.drink ? ' · ' + esc(v.drink) : ''}${v.how ? ' · ' + esc(v.how.toLowerCase()) : ''}${v.purpose ? ' · ' + esc(v.purpose.toLowerCase()) : ''}</li>`).join('');
    const m = milesFromHome(s);
    return `<header class="shop-head"><svg class="deco" width="190" height="190" viewBox="0 0 44 44" aria-hidden="true"><path d="${SH.flowerBig}" fill="#FFB784"/></svg>
      <div class="wrap"><button class="backbtn" data-back aria-label="Back to map">${I.back}</button>
      <div class="headrow"><div><h1>${esc(s.name)}</h1><p>${esc(s.address)} · ${esc(s.neighborhood)}${m != null ? ' · ' + m.toFixed(1) + ' mi from home' : ''}</p></div>
      ${n ? `<div class="bigstamp">${stampSVG(SH.cookieBig, 'var(--primary)', 84)}<span>STAMPED<b>${n} ${n === 1 ? 'visit' : 'visits'}</b></span></div>` : ''}</div></div></header>
      <div class="wrap stack" style="padding-top:16px">
        <div class="ratingrow"><div class="cups" role="group" aria-label="Your rating">${cupBtns}</div><span class="ratingword">${WORDS[cups]}</span></div>
        <section class="card"><p class="label">Your favorite here</p><div style="font-size:22px;font-weight:800;font-variation-settings:'wdth' 112;margin-top:4px">${esc(fav || 'Not picked yet')}</div><div style="font-size:14px;color:var(--ink-2)">Tap the cup next to a drink to change it</div></section>
        <section class="stack" style="gap:10px"><p class="label">Good for</p><div class="tags">${tags}</div></section>
        <section class="stack" style="gap:10px"><p class="label">On the menu</p>${menuHTML}</section>
        ${vlist ? `<section class="stack" style="gap:6px"><p class="label">Your visits</p><ul class="visits">${vlist}</ul></section>` : ''}
        <div class="actions"><button class="btn primary press wide" data-checkin>${I.plus}Log today's visit</button>
        <a class="btn tonal" aria-label="Directions" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ', ' + s.address + ', Minneapolis, MN')}">${I.nav}</a></div>
      </div>`;
  }
  const norm = s => (s || '').trim().toLowerCase();
  // Redraw the shop card only when something on it actually changed. Saving to
  // the sheet refreshes the data a second or two after a tap; if nothing changed
  // for this shop, leave the card alone so a pour in progress isn't cut off.
  let shopSig = '';
  const sigFor = name => { const r = rating(name); return JSON.stringify([r.cups || 0, r.fav || '', (r.want || []).join('|'), visitsAt(name).length, menuFor(name).length]); };
  function rerenderShop() {
    if (UI.view !== 'shop' || !currentShop) return;
    const sig = sigFor(currentShop);
    if (sig === shopSig) return;
    shopSig = sig;
    const top = pageEl.scrollTop; pageEl.innerHTML = shopHTML(shopBy(currentShop)); pageEl.scrollTop = top;
    settleShop(currentShop);
  }
  // Once a pour has been drawn, later redraws show the cups as already full.
  function settleShop(name) { UI.prevCups[name] = rating(name).cups || 0; UI.prevFav[name] = rating(name).fav || ''; }
  pageEl.addEventListener('click', e => {
    if (UI.view !== 'shop') return;
    const name = currentShop, r = rating(name);
    const cupB = e.target.closest('[data-cup]');
    if (cupB) { const k = +cupB.dataset.cup; UI.prevCups[name] = r.cups || 0; UI.prevFav[name] = r.fav || ''; S.setRating(name, r.cups === k ? 0 : k); return; }
    const favB = e.target.closest('[data-fav]');
    if (favB) { const d = favB.dataset.fav; UI.prevFav[name] = r.fav || ''; UI.prevCups[name] = r.cups || 0; S.setFavorite(name, norm(r.fav) === norm(d) ? '' : d); return; }
    const wantB = e.target.closest('[data-want]');
    if (wantB) { const d = wantB.dataset.want, w = new Set(r.want || []); w.has(d) ? w.delete(d) : w.add(d); UI.prevCups[name] = r.cups || 0; UI.prevFav[name] = r.fav || ''; S.setWant(name, [...w]); return; }
    if (e.target.closest('[data-checkin]')) openCheckin(name);
  });

  // ---------- Check-in ----------
  const sheetEl = $('#sheet');
  let ck = null;
  function openCheckin(name) {
    ck = { shop: name || null, drink: '', other: '', fav: false, how: '', purpose: '', cups: 0, q: '' };
    renderCheckin();
  }
  function closeSheet() { sheetEl.hidden = true; sheetEl.innerHTML = ''; sheetEl.dataset.mode = ''; ck = null; }
  function renderCheckin() {
    sheetEl.hidden = false;
    if (!ck.shop) {
      const list = shops().filter(s => !ck.q || norm(s.name).includes(norm(ck.q))).sort((a, b) => (milesFromHome(a) || 0) - (milesFromHome(b) || 0));
      const rows = list.map(s => shopRow(s, s.address + (milesFromHome(s) != null ? ' · ' + milesFromHome(s).toFixed(1) + ' mi' : ''))).join('');
      if (sheetEl.dataset.mode === 'pick') { $('#pickrows').innerHTML = rows; return; }
      sheetEl.dataset.mode = 'pick';
      sheetEl.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-label="Choose a shop"><div class="inner">
        <div class="grab"></div><h2>Where are you?</h2>
        <div class="picker-search"><input class="textin" id="pickq" placeholder="Search shops" value="${esc(ck.q)}" autocomplete="off"></div>
        <div class="stack" id="pickrows" style="gap:8px">${rows}</div></div></div>`;
      const q = $('#pickq'); q.addEventListener('input', () => { ck.q = q.value; renderCheckin(); });
      return;
    }
    const s = shopBy(ck.shop), r = rating(ck.shop), menu = menuFor(ck.shop).slice(0, 8);
    const opt = (group, val, label) => `<button class="opt" data-${group}="${esc(val)}" aria-pressed="${ck[group] === val}">${esc(label || val)}</button>`;
    const now = new Date();
    const innerHTML = `<div class="grab"></div>
      <div><h2>Log a visit</h2><div style="color:var(--ink-3);font-size:14px">${esc(s.name)} · today, ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div></div>
      ${r.cups ? '' : `<section class="stack" style="gap:6px"><p class="label">How was it?</p><div class="cups">${[1, 2, 3, 4, 5].map(k => `<button class="cupbtn press" data-ckcup="${k}" aria-label="${k} cups" aria-pressed="${k <= ck.cups}">${cupSVG(k <= ck.cups ? 'full' : '')}</button>`).join('')}</div></section>`}
      <section class="stack" style="gap:8px"><p class="label">What did you drink?</p><div class="choice">${menu.map(m => opt('drink', m.drink)).join('')}${opt('drink', '__other', '+ Something else')}</div>
        ${ck.drink === '__other' ? `<input class="textin" id="otherdrink" placeholder="Drink name" value="${esc(ck.other)}" autocomplete="off">` : ''}
        ${ck.drink ? `<button class="opt" data-togglefav aria-pressed="${ck.fav}" style="align-self:flex-start">${ck.fav ? '☕ Your favorite here' : 'Make this my favorite here'}</button>` : ''}</section>
      <section class="stack" style="gap:8px"><p class="label">How'd you get here?</p><div class="choice grid3">${['Walked', 'Biked', 'Drove'].map(v => opt('how', v)).join('')}</div></section>
      <section class="stack" style="gap:8px"><p class="label">What for?</p><div class="choice grid2">${['Schoolwork', 'Relaxing', 'Friends', 'Coffee date'].map(v => opt('purpose', v)).join('')}</div></section>
      ${r.cups ? `<div class="card" style="display:flex;justify-content:space-between;gap:8px;padding:10px 14px"><span>Your rating: <b style="color:var(--primary)">${r.cups} ${r.cups === 1 ? 'cup' : 'cups'}</b></span><span style="color:var(--ink-3);font-size:14px">Change on the shop card</span></div>` : ''}
      <button class="btn primary press wide" data-stamp style="height:64px;font-size:18px">Stamp it</button>`;
    if (sheetEl.dataset.mode === 'form') { $('.inner', sheetEl).innerHTML = innerHTML; }
    else { sheetEl.dataset.mode = 'form'; sheetEl.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-label="Log a visit"><div class="inner">${innerHTML}</div></div>`; }
    const od = $('#otherdrink'); if (od) od.addEventListener('input', () => { ck.other = od.value; });
  }
  sheetEl.addEventListener('click', e => {
    if (!ck) return;
    if (e.target.closest('[data-close]')) { closeSheet(); return; }
    const pick = e.target.closest('[data-shop]'); if (pick && !ck.shop) { ck.shop = pick.dataset.shop; renderCheckin(); return; }
    const t = e.target.closest('button'); if (!t) return;
    for (const g of ['drink', 'how', 'purpose']) if (t.dataset[g] != null) { ck[g] = ck[g] === t.dataset[g] ? '' : t.dataset[g]; renderCheckin(); return; }
    if (t.dataset.ckcup) { ck.cups = +t.dataset.ckcup; renderCheckin(); return; }
    if (t.hasAttribute('data-togglefav')) { ck.fav = !ck.fav; renderCheckin(); return; }
    if (t.hasAttribute('data-stamp')) stampIt();
  });

  function stampIt() {
    const before = badgeState, shop = ck.shop;
    const drink = ck.drink === '__other' ? ck.other.trim() : ck.drink;
    const now = new Date(), pad = n => String(n).padStart(2, '0');
    const visit = { date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, shop, drink, how: ck.how, purpose: ck.purpose };
    const firstVisit = !before.visited.has(shop), cups = ck.cups, fav = ck.fav && drink;
    closeSheet();
    if (cups) { UI.prevCups[shop] = 0; S.setRating(shop, cups); }
    if (fav) { UI.prevFav[shop] = rating(shop).fav || ''; S.setFavorite(shop, drink); }
    S.logVisit(visit);
    const after = recompute();
    const earned = B.diff(before, after);
    const vcount = visitsAt(shop).length;
    celebrateStamp(shop, vcount, firstVisit, after, () => showBadges(earned, () => { if (earned.some(b => b.id === 'full')) finale(); }));
  }

  // ---------- Celebrations ----------
  const celEl = $('#celebrate');
  const beans = (n, colors, dist) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2 + 0.3, d = dist + (k % 3) * 18; return `<span class="bean" style="left:50%;top:50%;margin:-8px 0 0 -6px;background:${colors[k % colors.length]};--x:${Math.round(Math.cos(a) * d)}px;--y:${Math.round(Math.sin(a) * d)}px;--r:${k * 67 % 360}deg"></span>`; }).join('');
  function celebrateStamp(shop, n, first, bs, done) {
    const d = new Date(), date = d.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
    const line = first ? `${bs.visited.size} of ${shops().length} shops stamped.` : `Visit ${n} here.`;
    celEl.className = 'celebrate stampview'; celEl.hidden = false;
    celEl.innerHTML = `<div style="position:relative;width:220px;height:220px">
        <span class="ink" style="position:absolute;inset:20px;border-radius:50%;border:6px solid #E8742A"></span>${beans(10, ['#6F3F1E', '#E8742A', '#A0582A', '#FFB784'], 120)}
        <div class="slam" style="position:absolute;inset:0">${stampSVG(SH.cookieBig, '#6F3F1E', 220)}
          <span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#FFF8F4;text-align:center;padding:0 34px">
            <span style="font-size:13px;font-weight:800;letter-spacing:.2em;color:#FFB784">STAMPED</span>
            <span style="font-size:${shortName(shop).length > 12 ? 20 : 28}px;font-weight:900;font-variation-settings:'wdth' 125;line-height:1">${esc(shortName(shop))}</span>
            <span style="font-size:12px;font-weight:700;letter-spacing:.14em">${date} · VISIT ${n}</span></span></div></div>
      <div class="popin stack" style="align-items:center;gap:14px"><h2 style="font-size:24px">${esc(line)}</h2><button class="btn orange press wide" data-next>Nice</button></div>`;
    celEl.onclick = e => { if (e.target.closest('[data-next]')) { celEl.hidden = true; renderAll(); rerenderShop(); done && done(); } };
  }
  function showBadges(list, done) {
    if (!list.length) { done && done(); return; }
    const b = list[0], rest = list.slice(1);
    const lvl = b.level && b.levels ? ` · level ${b.level}` : '';
    celEl.className = 'celebrate badgeview'; celEl.hidden = false;
    celEl.innerHTML = `<span class="popin" style="font-size:13px;font-weight:800;letter-spacing:.28em;color:#FFB784;animation-delay:.5s">NEW STAMP EARNED</span>
      <div style="position:relative;width:240px;height:240px"><div class="rays" style="position:absolute;inset:0;opacity:.3">${stampSVG(SH.rays, '#E8742A', 240)}</div>
        <div class="badgein" style="position:absolute;inset:30px">${stampSVG(shape(b.shape[0], b.shape[1], 19), b.color, 180)}<span style="position:absolute;inset:0;display:grid;place-items:center;font-size:40px;font-weight:900;color:#24150E">${esc(b.glyph)}</span></div></div>
      <h2 class="popin" style="animation-delay:.6s">${esc(b.name)}${lvl}</h2><p class="popin">${esc(b.rule)}</p>
      <button class="btn light press wide popin" data-next>Add to passport</button>`;
    celEl.onclick = e => { if (e.target.closest('[data-next]')) { celEl.hidden = true; showBadges(rest, done); } };
  }
  function finale() {
    const bs = badgeState, n = shops().length, first = D().visits.length ? D().visits.map(v => v.date).sort()[0] : '';
    const favShop = Object.entries(D().ratings).filter(([, r]) => r.cups === 5).map(([s]) => s)[0];
    celEl.className = 'celebrate finale'; celEl.hidden = false;
    celEl.innerHTML = `<div class="passcover"><span style="font-size:12px;font-weight:800;letter-spacing:.32em;color:#E8C27A">SOUTH MINNEAPOLIS</span>
        <span style="font-size:30px;font-weight:1000;font-variation-settings:'wdth' 130;color:#F2CF8A;line-height:.95;text-align:center">COFFEE<br>PASSPORT</span>
        <div class="dots">${Array.from({ length: n }, (_, i) => `<span class="dot" style="--d:${(0.6 + i * 0.045).toFixed(2)}s"></span>`).join('')}</div>
        <div class="seal">${stampSVG(shape(12, 0.06, 20), '#E8A21B', 200)}<span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#3B1D0C"><span style="font-size:12px;font-weight:900;letter-spacing:.22em">FULL</span><span style="font-size:26px;font-weight:1000;font-variation-settings:'wdth' 125">PASSPORT</span><span style="font-size:12px;font-weight:900;letter-spacing:.16em">${n} OF ${n}</span></span></div></div>
      <h2 class="popin" style="animation-delay:4.3s;color:#FFF1E8">Every shop.<br>Stamped.</h2>
      <p class="popin" style="animation-delay:4.5s;color:#D7C2B7">${first ? 'First stamp ' + fmtDate(first) + ' · ' : ''}${D().visits.length} visits${favShop ? ' · favorite: ' + esc(shortName(favShop)) : ''}</p>
      <button class="btn light press wide popin" data-next style="animation-delay:4.75s">Back to the map</button>`;
    celEl.onclick = e => { if (e.target.closest('[data-next]')) celEl.hidden = true; };
  }
  function fmtDate(iso) { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }); }

  // ---------- Search ----------
  const TYPES = ['Latte', 'Mocha', 'Chai', 'Matcha', 'Cold brew', 'Tea', 'Espresso', 'Seasonal', 'Non-coffee'];
  let sq = { q: '', type: '' };
  function openSearch() { openPage(searchHTML(), 'search', openSearch); bindSearch(); setTimeout(() => { const i = $('#sq'); i && i.focus(); }, 50); }
  function searchHTML() {
    return `<div class="wrap"><div class="searchtop"><div class="searchfield"><button class="backbtn" style="background:transparent" data-back aria-label="Back to map">${I.back}</button>
      <input id="sq" placeholder="Chai, cold brew, Five Watt…" value="${esc(sq.q)}" autocomplete="off" aria-label="Search drinks or shops"></div>
      <div class="chips">${TYPES.map(t => `<button class="chip" data-type="${t}" aria-pressed="${sq.type === t}">${t}</button>`).join('')}</div></div>
      <div id="results" class="stack" style="gap:10px"></div></div>`;
  }
  function bindSearch() {
    const input = $('#sq');
    input.addEventListener('input', () => { sq.q = input.value; renderResults(); });
    pageEl.querySelector('.chips').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (!b) return; sq.type = sq.type === b.dataset.type ? '' : b.dataset.type; pageEl.querySelectorAll('[data-type]').forEach(x => x.setAttribute('aria-pressed', x.dataset.type === sq.type)); renderResults(); });
    $('#results').addEventListener('click', e => { const b = e.target.closest('[data-shop]'); if (b) openShop(b.dataset.shop); });
    renderResults();
  }
  function renderResults() {
    const q = norm(sq.q), out = [];
    if (!q && !sq.type) { $('#results').innerHTML = `<h2 class="headline">What are you<br><em>in the mood for?</em></h2><p style="color:var(--ink-3);margin:0">Search a drink or a shop, or tap a type.</p>`; return; }
    const shopHits = q ? shops().filter(s => norm(s.name).includes(q) || norm(s.neighborhood).includes(q)) : [];
    const drinkHits = D().menus.filter(m => (!sq.type || m.type === sq.type) && (!q || norm(m.drink).includes(q) || norm(m.desc).includes(q)) && shopBy(m.shop));
    const logged = D().visits.filter(v => v.drink && q && norm(v.drink).includes(q));
    const byShop = {};
    drinkHits.forEach(m => { (byShop[m.shop] = byShop[m.shop] || []).push(m.drink); });
    logged.forEach(v => { (byShop[v.shop] = byShop[v.shop] || []); if (!byShop[v.shop].includes(v.drink)) byShop[v.shop].push(v.drink); });
    const names = Object.keys(byShop).sort((a, b) => (rating(b).cups || 0) - (rating(a).cups || 0) || (badgeState.visited.has(b) - badgeState.visited.has(a)));
    const label = sq.q || sq.type;
    out.push(`<h2 class="headline">${esc(label)} at <em>${names.length} ${names.length === 1 ? 'shop' : 'shops'}</em></h2>`);
    shopHits.forEach(s => out.push(resultRow(s.name, s.address)));
    names.forEach(n => out.push(resultRow(n, byShop[n].slice(0, 3).join(' · '))));
    $('#results').innerHTML = out.join('') + (names.length || shopHits.length ? '' : '<p style="color:var(--ink-3)">Nothing yet. Try another word.</p>');
  }
  function resultRow(name, line) {
    const r = rating(name), v = badgeState.visited.has(name), s = shopBy(name), m = milesFromHome(s);
    const meta = [r.cups ? r.cups + (r.cups === 1 ? ' cup' : ' cups') : v ? 'Stamped' : 'Not tried yet', ...TAGS.filter(([k]) => s.tags[k]).slice(0, 2).map(t => t[1]), m != null ? m.toFixed(1) + ' mi' : null].filter(Boolean).join(' · ');
    const mini = v ? stampSVG(r.cups === 5 ? SH.flowerBig : SH.cookieBig, r.cups === 5 ? 'var(--orange)' : 'var(--primary)', 48) : stampSVG(SH.circle, 'var(--bg)', 48, 'stroke="var(--primary)" stroke-width="2.5"');
    return `<button class="result press" data-shop="${esc(name)}"><span style="flex:none">${mini}</span><span style="min-width:0"><b>${esc(name)}</b><span>${esc(line)}</span><small>${esc(meta)}</small></span></button>`;
  }

  // ---------- Passport ----------
  function openPassport() { openPage(passportHTML(), 'passport', openPassport); }
  function passportHTML() {
    const bs = recompute(), n = shops().length, earned = bs.list.filter(b => b.earned && !b.hidden).length;
    const seasons = bs.byId.seasons.seasons.map(s => `<div class="season${s.done ? ' done' : ''}">${s.name}<small>${s.current ? 'now' : s.done ? '✓' : ''}</small></div>`).join('');
    const mini = bs.bingo.cells.map(c => `<i class="${c.free ? 'f' : c.stamped ? 's' : ''}"></i>`).join('');
    const badges = bs.list.filter(b => !b.hidden).map((b, i) => {
      const pct = Math.min(100, Math.round((b.have || 0) / (b.need || 1) * 100));
      const ink = ['#FFB784', '#E8A21B', '#8BC34A', '#F48FB1', '#64A8C0'].includes(b.color) ? '#24150E' : '#FFF8F4';
      return `<div class="badge${b.earned ? ' earned' : ''}"><div class="bh"><span style="position:relative;width:52px;height:52px;flex:none;transform:rotate(${b.earned ? (i % 2 ? 7 : -8) : 0}deg)">
        ${b.earned ? stampSVG(shape(b.shape[0], b.shape[1], 19), b.color, 52) : stampSVG(shape(b.shape[0], b.shape[1], 19), 'var(--bg)', 52, 'stroke="var(--outline-2)" stroke-width="1.2" stroke-dasharray="1.4 1.2"')}
        <span style="position:absolute;inset:0;display:grid;place-items:center;font-size:13px;font-weight:900;color:${b.earned ? ink : 'var(--ink-3)'}">${esc(b.glyph)}</span></span><b>${esc(b.name)}${b.level && b.levels ? ' · ' + b.level : ''}</b></div>
        <span class="rule">${esc(b.rule)}</span><div class="bar"><i style="width:${pct}%"></i></div><small>${esc(b.progress)}</small></div>`;
    }).join('');
    const st = S.DEMO ? 'Demo mode: saved on this device only.' : ({ saved: 'Saved to the sheet.', syncing: 'Saving…', offline: `Offline. ${S.queued} ${S.queued === 1 ? 'change' : 'changes'} will save when you're back online.`, signin: 'Sign in again to save.', waiting: 'Waiting to save.', idle: '' })[S.status] || '';
    return `<div class="wrap stack" style="padding-top:calc(18px + env(safe-area-inset-top, 0px))">
      <div style="display:flex;justify-content:space-between;align-items:center"><button class="backbtn" data-back aria-label="Back to map">${I.back}</button><span class="label">Coffee Passport${S.DEMO ? ' <span class="demo-badge">DEMO</span>' : ''}</span></div>
      <section><p class="bignum"><b>${bs.visited.size}</b><span>/ ${n}</span></p><p style="margin:6px 0 0;font-size:17px;font-weight:600">shops stamped · ${earned} ${earned === 1 ? 'stamp' : 'stamps'} earned</p></section>
      <section class="card" style="background:var(--peach)"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><b style="font-size:18px">Four Seasons</b><small style="font-weight:700">${esc(bs.byId.seasons.progress)}</small></div><div class="seasons">${seasons}</div></section>
      <button class="result press" data-gobingo style="background:#3B2A21;color:#F1DFD5"><div class="minibingo">${mini}</div><span><b style="color:#FFDBC7">Bingo · ${bs.bingo.lines} ${bs.bingo.lines === 1 ? 'line' : 'lines'}</b><span style="color:#F1DFD5">${bs.bingo.stamped} of ${bs.bingo.playable} squares. Tap to see the map layer.</span></span></button>
      <p class="label" style="margin-top:4px">All stamps</p><div class="badges">${badges}</div>
      ${bs.byId.full.earned ? '<button class="btn primary press wide" data-finale>Replay the Full Passport</button>' : ''}
      <section class="card stack" style="gap:10px"><p class="label">Settings</p><span style="font-size:14px;color:var(--ink-2)">${esc(st)}${S.user ? ' Signed in as ' + esc(S.user.email) + '.' : ''}</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${S.DEMO ? '<button class="opt" data-resetdemo>Reset demo data</button>' : '<button class="opt" data-syncnow>Sync now</button><button class="opt" data-signout>Sign out</button>'}</div></section></div>`;
  }
  pageEl.addEventListener('click', e => {
    if (UI.view !== 'passport') return;
    if (e.target.closest('[data-gobingo]')) { UI.bingo = true; closePage(); fitAll(); }
    if (e.target.closest('[data-finale]')) finale();
    if (e.target.closest('[data-resetdemo]')) S.resetDemo();
    if (e.target.closest('[data-syncnow]')) S.sync();
    if (e.target.closest('[data-signout]')) { S.signOut(); location.reload(); }
  });

  // ---------- Nav ----------
  $('#nav').addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'map') closePage();
    if (b.dataset.go === 'search') openTab(openSearch);
    if (b.dataset.go === 'passport') openTab(openPassport);
  });
  $('#searchbar').addEventListener('click', openSearch);
  $('#fab').addEventListener('click', () => openCheckin(UI.view === 'shop' ? currentShop : null));
  const visMid = () => { const v = vis(); return [v.l + v.w / 2, v.t + v.h / 2]; };
  $('#zin').addEventListener('click', () => zoomAt(...visMid(), 1.5));
  $('#zout').addEventListener('click', () => zoomAt(...visMid(), 1 / 1.5));
  $('#zall').addEventListener('click', fitAll);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeTop(); });

  // ---------- Back gesture ----------
  // Android's back goes back in the page's history, and the app used to have
  // none, so Back left the app. While anything is open on top of the map
  // (a celebration, a sheet, a screen, the open drawer) there is one extra
  // history step; Back uses it to close the top thing, and it's put back if
  // more is still open. With only the map showing, Back leaves the app.
  const anyOpen = () => !celEl.hidden || !sheetEl.hidden || !pageEl.hidden || UI.drawerOpen;
  let guard = false, skipPop = false, syncT = 0;
  function syncBack() {
    clearTimeout(syncT);
    syncT = setTimeout(() => {
      if (anyOpen() && !guard) { history.pushState({ cp: 1 }, ''); guard = true; }
      else if (!anyOpen() && guard) { guard = false; skipPop = true; history.back(); }
    }, 0);
  }
  function closeTop() {
    if (!celEl.hidden) { const b = celEl.querySelector('[data-next]'); if (b) b.click(); else celEl.hidden = true; }
    else if (!sheetEl.hidden) closeSheet();
    else if (!pageEl.hidden) pageBack();
    else if (UI.drawerOpen) setDrawer(false);
  }
  addEventListener('popstate', () => {
    if (skipPop) { skipPop = false; return; }
    guard = false;
    closeTop();
    syncBack();
  });
  const watch = new MutationObserver(syncBack);
  [celEl, sheetEl, pageEl, $('#drawer')].forEach(el => watch.observe(el, { attributes: true, attributeFilter: ['hidden', 'class'] }));

  // ---------- Render all ----------
  function renderAll() { recompute(); renderPins(); renderChips(); renderDrawer(); applyView(); }
  let toastT = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200); }

  S.on(what => {
    if (what === 'data') { renderAll(); rerenderShop(); }
    if (what === 'status' && S.status === 'offline') toast(`Offline. Your changes are saved on this phone and will sync later.`);
    if (what === 'auth') { $('#signin').hidden = !S.needsSignIn(); }
  });

  // ---------- Start ----------
  function start() {
    renderAll();
    measureVis();
    const h = D().home; if (h) centerOn(h.lat, h.lng, fillZ()); else centerOn(44.93, -93.26, fillZ());
    if (S.needsSignIn()) { $('#signin').hidden = false; S.renderSignIn($('#gbtn')); }
    S.sync();
  }
  // Splash: plays once per launch; tap to skip.
  document.querySelectorAll('.stamp-shape').forEach(p => p.setAttribute('d', SH.cookieBig));
  const splash = $('#splash');
  // No count here: the splash shows before the sheet syncs, so a number would be stale.
  $('#splashCount').textContent = 'Every shop. No rush.';
  const hideSplash = () => { splash.classList.add('out'); setTimeout(() => { splash.hidden = true; }, 500); };
  splash.addEventListener('click', hideSplash);
  setTimeout(hideSplash, reduceMotion ? 300 : 3400);
  start();
})();
