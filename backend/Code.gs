/**
 * Coffee Passport backend. Paste into the Coffee Passport sheet
 * (Extensions > Apps Script), run setup() once, then deploy as a web app:
 * Execute as: Me. Who has access: Anyone.
 *
 * "Anyone" only means the URL can be called. Every request must carry a fresh
 * Google sign-in token for an email listed as "Allowed email" in the Settings
 * tab, or it is refused. The sheet itself is never shared.
 */

const TAB = { shops: 'Shops', menus: 'Menus', visits: 'Visits', ratings: 'Ratings', settings: 'Settings' };
const TAG_COLUMNS = { 'Good for working': 'working', 'Big tables (students)': 'bigTables', 'Sunny windows': 'sunny', 'Water view': 'water', 'Patio': 'patio', 'Quiet': 'quiet' };
const VISIT_HEADERS = ['Date', 'Time', 'Shop', 'Cups (1-5)', 'Drink', 'Favorite drink here?', 'How she got there', 'What for', 'Notes'];
const RATING_HEADERS = ['Shop', 'Cups', 'Favorite drink', 'Want to try', 'Updated'];

// ---------- Entry point ----------
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: 'Bad request' }); }
  const who = verify_(req.idToken);
  if (!who.ok) return json_({ error: who.error, auth: true });
  const lock = LockService.getScriptLock();
  try {
    if (req.action !== 'data') lock.waitLock(10000);
    switch (req.action) {
      case 'data': return json_(getData_());
      case 'logVisit': logVisit_(req.visit); return json_({ ok: true });
      case 'setRating': upsertRating_(req.shop, { cups: req.cups }); return json_({ ok: true });
      case 'setFavorite': upsertRating_(req.shop, { fav: req.drink || '' }); return json_({ ok: true });
      case 'setWant': upsertRating_(req.shop, { want: req.want || [] }); return json_({ ok: true });
      default: return json_({ error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* not held */ }
  }
}
function doGet() { return json_({ ok: true, app: 'Coffee Passport' }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---------- Sign-in check ----------
function verify_(idToken) {
  if (!idToken) return { ok: false, error: 'Sign in needed' };
  const cache = CacheService.getScriptCache();
  const key = 'tok_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken)).slice(0, 40);
  const hit = cache.get(key);
  if (hit) return { ok: true, email: hit };
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return { ok: false, error: 'Sign-in expired' };
  const t = JSON.parse(res.getContentText());
  const s = settings_();
  if (t.aud !== s.clientId) return { ok: false, error: 'Wrong app' };
  if (String(t.email_verified) !== 'true') return { ok: false, error: 'Email not verified' };
  const email = String(t.email || '').toLowerCase();
  if (s.allowed.indexOf(email) < 0) return { ok: false, error: 'This Google account is not on the list' };
  const ttl = Math.max(60, Math.min(3000, Number(t.exp) - Math.floor(Date.now() / 1000) - 60));
  cache.put(key, email, ttl);
  return { ok: true, email: email };
}

function settings_() {
  const rows = sheet_(TAB.settings).getDataRange().getValues();
  const out = { allowed: [], clientId: '', home: '', homeLat: null, homeLng: null };
  rows.forEach(function (r) {
    const k = String(r[0]).trim().toLowerCase(), v = String(r[1]).trim();
    if (k === 'allowed email' && v) out.allowed.push(v.toLowerCase());
    if (k === 'google client id') out.clientId = v;
    if (k === 'home address') out.home = v;
    if (k === 'home lat') out.homeLat = Number(v) || null;
    if (k === 'home lng') out.homeLng = Number(v) || null;
  });
  return out;
}

// ---------- Reads ----------
function getData_() {
  const shopsSheet = sheet_(TAB.shops);
  const values = shopsSheet.getDataRange().getValues();
  const head = values[0].map(String), col = function (n) { return head.indexOf(n); };
  const iInc = col('Include?'), iName = col('Shop'), iAddr = col('Address'), iHood = col('Neighborhood'), iLat = col('Lat'), iLng = col('Lng');
  const shops = [];
  values.slice(1).forEach(function (r) {
    if (String(r[iInc]).trim() !== 'Yes' || !r[iName]) return;
    const tags = {};
    Object.keys(TAG_COLUMNS).forEach(function (h) { const i = col(h); tags[TAG_COLUMNS[h]] = i >= 0 && String(r[i]).trim() === 'Yes'; });
    const lat = iLat >= 0 ? Number(r[iLat]) : NaN, lng = iLng >= 0 ? Number(r[iLng]) : NaN;
    if (!isFinite(lat) || !isFinite(lng) || !lat) return; // run setup() to place new shops on the map
    shops.push({ name: String(r[iName]), address: String(r[iAddr]), neighborhood: String(r[iHood] || ''), lat: lat, lng: lng, tags: tags });
  });

  const menus = rows_(TAB.menus).map(function (r) { return { shop: r['Shop'], drink: r['Drink'], type: r['Type'], desc: r["What's in it"] || '' }; }).filter(function (m) { return m.shop && m.drink; });

  const tz = Session.getScriptTimeZone();
  const fmt = function (v, pattern) { return v instanceof Date ? Utilities.formatDate(v, tz, pattern) : String(v || ''); };
  const visits = rows_(TAB.visits).filter(function (r) { return r['Shop']; }).map(function (r) {
    return { date: fmt(r['Date'], 'yyyy-MM-dd'), time: fmt(r['Time'], 'HH:mm'), shop: r['Shop'], drink: r['Drink'] || '', how: r['How she got there'] || '', purpose: r['What for'] || '' };
  });

  const ratings = {};
  rows_(TAB.ratings).forEach(function (r) {
    if (!r['Shop']) return;
    ratings[r['Shop']] = { cups: Number(r['Cups']) || 0, fav: r['Favorite drink'] || '', want: String(r['Want to try'] || '').split(' | ').filter(String) };
  });

  const s = settings_();
  const home = s.homeLat && s.homeLng ? { lat: s.homeLat, lng: s.homeLng } : null;
  return { shops: shops, menus: menus, visits: visits, ratings: ratings, home: home };
}

// ---------- Writes ----------
function logVisit_(v) {
  if (!v || !v.shop) throw new Error('Missing visit');
  const sh = ensureTab_(TAB.visits, VISIT_HEADERS);
  const fav = ratingRow_(v.shop);
  sh.appendRow(["'" + v.date, "'" + v.time, v.shop, fav ? fav.cups : '', v.drink || '', fav && v.drink && fav.fav === v.drink ? 'Yes' : '', v.how || '', v.purpose || '', '']);
}
function ratingRow_(shop) {
  const r = rows_(TAB.ratings).filter(function (x) { return x['Shop'] === shop; })[0];
  return r ? { cups: r['Cups'], fav: r['Favorite drink'] } : null;
}
function upsertRating_(shop, patch) {
  if (!shop) throw new Error('Missing shop');
  const sh = ensureTab_(TAB.ratings, RATING_HEADERS);
  const vals = sh.getDataRange().getValues();
  let row = -1;
  for (let i = 1; i < vals.length; i++) if (vals[i][0] === shop) { row = i + 1; break; }
  const cur = row > 0 ? vals[row - 1] : [shop, '', '', '', ''];
  if (patch.cups !== undefined) cur[1] = patch.cups || '';
  if (patch.fav !== undefined) cur[2] = patch.fav;
  if (patch.want !== undefined) cur[3] = patch.want.join(' | ');
  cur[4] = new Date();
  if (row > 0) sh.getRange(row, 1, 1, 5).setValues([cur]); else sh.appendRow(cur);
}

// ---------- Setup (run by hand from the editor) ----------
function setup() {
  ensureTab_(TAB.visits, VISIT_HEADERS);
  ensureTab_(TAB.ratings, RATING_HEADERS);
  const settings = sheet_(TAB.settings);
  const have = settings.getDataRange().getValues().map(function (r) { return String(r[0]).trim().toLowerCase(); });
  if (have.indexOf('google client id') < 0) settings.appendRow(['Google client ID', '', 'From Google Cloud > Credentials. Not secret.']);
  if (have.indexOf('allowed email') < 0) settings.appendRow(['Allowed email', '', 'One row per Google account that may use the app.']);
  geocodeShops();
  geocodeHome_();
  SpreadsheetApp.getActive().toast('Setup done. Check the Lat and Lng columns on the Shops tab.', 'Coffee Passport', 8);
}

/** Fills in Lat/Lng for shops that don't have them yet. Safe to re-run after adding shops. */
function geocodeShops() {
  const sh = sheet_(TAB.shops);
  let head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  if (head.indexOf('Lat') < 0) { sh.getRange(1, head.length + 1, 1, 2).setValues([['Lat', 'Lng']]); head = head.concat(['Lat', 'Lng']); }
  const iAddr = head.indexOf('Address'), iInc = head.indexOf('Include?'), iLat = head.indexOf('Lat'), iLng = head.indexOf('Lng');
  const vals = sh.getRange(2, 1, Math.max(0, sh.getLastRow() - 1), head.length).getValues();
  const geocoder = Maps.newGeocoder().setBounds(44.88, -93.34, 44.97, -93.19);
  vals.forEach(function (r, i) {
    if (String(r[iInc]).trim() !== 'Yes' || (r[iLat] && r[iLng])) return;
    const g = geocoder.geocode(r[iAddr] + ', Minneapolis, MN');
    if (g.status === 'OK' && g.results.length) {
      const loc = g.results[0].geometry.location;
      sh.getRange(i + 2, iLat + 1, 1, 2).setValues([[loc.lat, loc.lng]]);
    }
    Utilities.sleep(150);
  });
}
function geocodeHome_() {
  const s = settings_();
  if (!s.home) return;
  const g = Maps.newGeocoder().geocode(s.home);
  if (g.status !== 'OK' || !g.results.length) return;
  const loc = g.results[0].geometry.location, sh = sheet_(TAB.settings);
  const vals = sh.getDataRange().getValues();
  const put = function (label, val) {
    for (let i = 0; i < vals.length; i++) if (String(vals[i][0]).trim().toLowerCase() === label.toLowerCase()) { sh.getRange(i + 1, 2).setValue(val); return; }
    sh.appendRow([label, val, 'Worked out from the home address by setup()']);
  };
  put('Home lat', loc.lat); put('Home lng', loc.lng);
}

// ---------- Helpers ----------
function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Missing tab: ' + name);
  return sh;
}
function ensureTab_(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  else if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function rows_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getDataRange().getValues(), head = vals[0].map(String);
  return vals.slice(1).map(function (r) { const o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o; });
}
