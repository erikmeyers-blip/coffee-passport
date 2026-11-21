// Data layer. Two modes:
//   demo:    no backend configured; sample shops, everything saved on this device.
//   backend: Google sign-in + the Apps Script web app attached to the private sheet.
// Either way the app keeps a copy on the phone so it opens instantly, and saves
// made offline (or while sign-in is renewing) wait in a queue until they go through.
(function () {
  const cfg = window.CP_CONFIG || {};
  const DEMO = !cfg.BACKEND_URL || !cfg.GOOGLE_CLIENT_ID;
  const KEY = DEMO ? 'cp_demo_v1' : 'cp_v1';
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  let data = ls.get(KEY + '_data', null);
  let queue = ls.get(KEY + '_queue', []);
  let token = ls.get(KEY + '_token', null);
  const listeners = new Set();
  const emit = (what) => listeners.forEach(fn => fn(what));
  const persist = () => { ls.set(KEY + '_data', data); ls.set(KEY + '_queue', queue); };

  function blank() { return { shops: [], menus: [], ratings: {}, visits: [], home: null, loadedAt: null }; }
  if (!data) data = blank();

  if (DEMO && !data.loadedAt) {
    const d = window.CP_DEMO;
    data = { shops: d.shops, menus: d.menus, ratings: {}, visits: [], home: d.home, loadedAt: Date.now() };
    persist();
  }

  // ---------- Google sign-in (identity only; no Drive access) ----------
  const tokenValid = () => token && token.exp * 1000 > Date.now() + 60000;
  function decodeJwt(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return null; } }
  function onCredential(resp) {
    const p = decodeJwt(resp.credential);
    if (!p) return;
    const switching = token && token.email !== p.email;
    token = { id: resp.credential, exp: p.exp, email: p.email, name: p.given_name || p.name || '' };
    ls.set(KEY + '_token', token);
    if (switching || (data.owner && data.owner !== p.email)) { data = blank(); queue = []; persist(); emit('data'); }
    emit('auth');
    sync();
  }
  let gisReady = false;
  function initGoogle() {
    if (DEMO || gisReady || !(window.google && google.accounts && google.accounts.id)) return gisReady;
    google.accounts.id.initialize({ client_id: cfg.GOOGLE_CLIENT_ID, callback: onCredential, auto_select: true, use_fedcm_for_prompt: true, cancel_on_tap_outside: false });
    gisReady = true;
    return true;
  }
  function renderSignIn(el) {
    if (!initGoogle()) { setTimeout(() => renderSignIn(el), 300); return; }
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', width: 280 });
    google.accounts.id.prompt();
  }
  function quietRenew() { if (initGoogle()) google.accounts.id.prompt(); }

  // ---------- Backend calls ----------
  async function call(action, payload) {
    if (!tokenValid()) { quietRenew(); throw Object.assign(new Error('Sign-in needed'), { auth: true }); }
    const res = await fetch(cfg.BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action, idToken: token.id }, payload || {})), redirect: 'follow' });
    const body = await res.json();
    if (body.error) { const e = new Error(body.error); if (body.auth) { e.auth = true; token = null; ls.del(KEY + '_token'); emit('auth'); } throw e; }
    return body;
  }

  let syncing = false, status = DEMO ? 'demo' : 'idle';
  const setStatus = s => { status = s; emit('status'); };
  async function sync() {
    if (DEMO || syncing) return;
    if (!tokenValid()) { setStatus(queue.length ? 'waiting' : 'signin'); quietRenew(); return; }
    syncing = true; setStatus('syncing');
    try {
      while (queue.length) {
        await call(queue[0].action, queue[0].payload);
        queue.shift(); persist();
      }
      const fresh = await call('data');
      data = Object.assign(blank(), fresh, { loadedAt: Date.now(), owner: token.email });
      // Re-apply anything still queued (none here, but keeps local view right).
      persist(); setStatus('saved'); emit('data');
    } catch (e) {
      setStatus(e.auth ? 'signin' : 'offline');
    } finally { syncing = false; }
  }
  window.addEventListener('online', () => sync());

  // ---------- Local apply (instant UI), then queue for the sheet ----------
  function apply(action, p) {
    if (action === 'logVisit') data.visits.push(p.visit);
    if (action === 'setRating') { data.ratings[p.shop] = Object.assign({}, data.ratings[p.shop], { cups: p.cups }); }
    if (action === 'setFavorite') { data.ratings[p.shop] = Object.assign({}, data.ratings[p.shop], { fav: p.drink || '' }); }
    if (action === 'setWant') { data.ratings[p.shop] = Object.assign({}, data.ratings[p.shop], { want: p.want }); }
  }
  function write(action, payload) {
    apply(action, payload);
    if (!DEMO) { queue.push({ action, payload }); }
    persist(); emit('data');
    if (!DEMO) sync();
  }

  function signOut() {
    token = null; ls.del(KEY + '_token');
    data = blank(); queue = []; persist();
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    emit('auth');
  }
  function resetDemo() { ls.del(KEY + '_data'); ls.del(KEY + '_queue'); location.reload(); }

  window.CP_STORE = {
    DEMO,
    get data() { return data; },
    get status() { return status; },
    get queued() { return queue.length; },
    get user() { return token; },
    needsSignIn: () => !DEMO && !tokenValid() && !data.loadedAt,
    on: fn => listeners.add(fn),
    sync, renderSignIn, signOut, resetDemo,
    logVisit: visit => write('logVisit', { visit }),
    setRating: (shop, cups) => write('setRating', { shop, cups }),
    setFavorite: (shop, drink) => write('setFavorite', { shop, drink }),
    setWant: (shop, want) => write('setWant', { shop, want })
  };
})();
