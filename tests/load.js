// Loads the browser modules (js/geo.js, js/badges.js) into Node. They attach
// to window.CP_GEO and window.CP_BADGES, so give them a fresh window object.
const path = require('node:path');

function load() {
  global.window = {};
  for (const f of ['geo.js', 'badges.js']) {
    const p = path.join(__dirname, '..', 'js', f);
    delete require.cache[p];
    require(p);
  }
  return { G: global.window.CP_GEO, B: global.window.CP_BADGES };
}

// Shop list saved from the Shops tab (Include? = Yes). Public business info only.
const shops = () => JSON.parse(JSON.stringify(require('./fixtures/shops.json')));

module.exports = { load, shops };
