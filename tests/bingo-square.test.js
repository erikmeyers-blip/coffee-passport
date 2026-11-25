const test = require('node:test');
const assert = require('node:assert/strict');
const { load, shops } = require('./load');

const { G } = load();
const square = name => {
  const s = shops().find(x => x.name === name);
  const sq = G.bingoSquare(s);
  return sq ? G.BINGO.names[sq[0]][sq[1]] : null;
};

test('Red Coral counts for Howe, the box its pin is in (not Minnehaha from its Hiawatha neighborhood)', () => {
  assert.equal(square('Red Coral Coffee'), 'Howe');
});

const at = (lat, lng, neighborhood) => G.bingoSquare({ name: 'Test Cafe', neighborhood, lat, lng });
const nameOf = sq => (sq ? G.BINGO.names[sq[0]][sq[1]] : null);
// Middle of a square, by row and column.
const mid = (r, c) => [(G.BINGO.rows[r][0] + G.BINGO.rows[r][1]) / 2, (G.BINGO.cols[c][0] + G.BINGO.cols[c][1]) / 2];

const fixtureCases = [
  ['Code Blu Coffee', 'Seward East'],
  ["Rebecca's Bakery and Cafe", 'Seward'],
  ['Fireroast Coffee & Wine Bar', 'Howe'],
  ['Crema Coffee + Cream', 'Minnehaha'],
  ['SunBean Coffee', 'Minnehaha'],
  ['Lake and Bryant Cafe', 'Uptown'],
  ['Nokomis Beach Coffee', 'Nokomis'],
  ['Duck Duck Coffee', 'Powderhorn'],
  ['Northern Coffeeworks', 'Standish'],
  ['TheCornerCafe@50th', 'Fulton'],
  ['Càphin', 'Linden Hills']
];
for (const [shop, want] of fixtureCases) {
  test(`${shop} counts for ${want}`, () => {
    assert.equal(square(shop), want);
  });
}

test('every shop in the fixture lands in a square', () => {
  const missing = shops().filter(s => !G.bingoSquare(s)).map(s => s.name);
  assert.deepEqual(missing, []);
});

test('a pin in the middle of a square counts there even if the sheet names the square next door', () => {
  const [lat, lng] = mid(2, 5); // Howe
  assert.equal(nameOf(at(lat, lng, 'Ericsson')), 'Howe'); // Ericsson is Standish, next door
});

test('a pin within a block of its sheet neighborhood square goes to that neighborhood', () => {
  const [lat] = mid(2, 5);
  const lng = G.BINGO.cols[5][0] + 0.0005; // just inside Howe, half a block east of Standish
  assert.equal(nameOf(at(lat, lng, 'Standish')), 'Standish');
  assert.equal(nameOf(at(lat, lng, 'Howe')), 'Howe');
});

test('a pin just over a block away from its sheet neighborhood square keeps the square it is in', () => {
  const [lat] = mid(2, 5);
  const lng = G.BINGO.cols[5][0] + 0.0015;
  assert.equal(nameOf(at(lat, lng, 'Standish')), 'Howe');
});

test('a square name like "Seward East" works as a neighborhood for a pin on the border', () => {
  const [lat] = mid(0, 4);
  const lng = G.BINGO.cols[5][0] - 0.0004; // just inside Seward
  assert.equal(nameOf(at(lat, lng, 'Seward East')), 'Seward East');
  assert.equal(nameOf(at(lat, lng, 'Seward')), 'Seward');
});

test('neighborhood matching ignores case and extra spaces', () => {
  assert.equal(nameOf(G.bingoSquare({ neighborhood: '  KINGFIELD ' })), 'Kingfield');
});

test('a shop with no lat/lng falls back to its neighborhood', () => {
  assert.equal(nameOf(G.bingoSquare({ neighborhood: 'Kingfield' })), 'Kingfield');
  assert.equal(nameOf(G.bingoSquare({ neighborhood: 'Hiawatha', lat: NaN, lng: NaN })), 'Minnehaha');
});

test('a shop with no lat/lng and an unknown neighborhood has no square', () => {
  assert.equal(G.bingoSquare({ neighborhood: 'Narnia' }), null);
});

test('an unknown neighborhood with a pin outside the card has no square', () => {
  assert.equal(at(45.1, -93.0, 'Narnia'), null);
});

test('an unknown neighborhood with a pin inside the card uses the pin', () => {
  const [lat, lng] = mid(1, 2);
  assert.equal(nameOf(at(lat, lng, 'Narnia')), 'Lyndale');
});

test('a known neighborhood with a pin outside the card uses the neighborhood', () => {
  assert.equal(nameOf(at(45.1, -93.0, 'Fulton')), 'Fulton');
});
