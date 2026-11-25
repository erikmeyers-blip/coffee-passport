const test = require('node:test');
const assert = require('node:assert/strict');
const { load, shops } = require('./load');

const { G, B } = load();

const noTags = { working: false, bigTables: false, sunny: false, water: false, patio: false, quiet: false };
// A made-up shop with its pin in the middle of square [r, c].
const shopIn = (name, r, c, tags = {}) => ({
  name,
  neighborhood: '',
  lat: (G.BINGO.rows[r][0] + G.BINGO.rows[r][1]) / 2,
  lng: (G.BINGO.cols[c][0] + G.BINGO.cols[c][1]) / 2,
  tags: Object.assign({}, noTags, tags)
});
const visit = (shop, date = '2026-03-10', time = '10:00', extra = {}) =>
  Object.assign({ shop, date, time, drink: 'Latte', how: 'Drove', purpose: 'Just because' }, extra);
const run = (shopList, visits, ratings = {}) =>
  B.compute({ shops: shopList, visits, ratings, menus: [], home: null });

// ---- Four Corners ----

test('the four corner squares are Cedar-Isles, Seward East, Fulton and Minnehaha', () => {
  const r = run(shops(), []);
  const names = r.bingo.cells.filter(c => c.corner).map(c => G.BINGO.names[c.r][c.c]);
  assert.deepEqual(names.sort(), ['Cedar-Isles', 'Fulton', 'Minnehaha', 'Seward East']);
});

test('Four Corners is earned with one visit in each corner square from the fixture', () => {
  const vs = ['Rustica', 'Code Blu Coffee', 'Jones Coffee (Fulton)', 'Falls Coffee'].map(n => visit(n));
  const c = run(shops(), vs).byId.corners;
  assert.equal(c.earned, true);
  assert.equal(c.have, 4);
  assert.equal(c.need, 4);
  assert.equal(c.progress, '4 of 4 corner squares');
});

test('Four Corners is not earned with three of four corner squares', () => {
  const vs = ['Rustica', 'Code Blu Coffee', 'Jones Coffee (Fulton)'].map(n => visit(n));
  const c = run(shops(), vs).byId.corners;
  assert.equal(c.earned, false);
  assert.equal(c.progress, '3 of 4 corner squares');
});

test('a visit to a non-corner shop does not count toward Four Corners', () => {
  const c = run(shops(), [visit('Five Watt Coffee')]).byId.corners;
  assert.equal(c.have, 0);
});

test('a corner square with no shop is free and does not count toward need', () => {
  const list = [shopIn('NW Cafe', 0, 0), shopIn('SE Cafe', 3, 5), shopIn('Middle Cafe', 1, 2)];
  const c = run(list, []).byId.corners;
  assert.equal(c.need, 2);
  assert.equal(c.progress, '0 of 2 corner squares');
});

test('Four Corners is earned when every corner square that has a shop is stamped', () => {
  const list = [shopIn('NW Cafe', 0, 0), shopIn('SE Cafe', 3, 5), shopIn('Middle Cafe', 1, 2)];
  const c = run(list, [visit('NW Cafe'), visit('SE Cafe')]).byId.corners;
  assert.equal(c.earned, true);
  assert.equal(c.progress, '2 of 2 corner squares');
});

test('Four Corners is not earned when no corner square has a shop', () => {
  const list = [shopIn('Middle Cafe', 1, 2)];
  const c = run(list, [visit('Middle Cafe')]).byId.corners;
  assert.equal(c.earned, false);
});

// ---- Bingo lines and Blackout ----

test('stamping every square in the top row of the real card is a Bingo', () => {
  const vs = ['Rustica', 'Spyhouse Coffee (Uptown)', 'SK Coffee', 'Pow Wow Grounds', "Rebecca's Bakery and Cafe", 'Code Blu Coffee'].map(n => visit(n));
  const r = run(shops(), vs);
  assert.equal(r.bingo.rows[0], true);
  assert.equal(r.byId.bingo.earned, true);
  assert.equal(r.byId.bingo.progress, '1 line done');
});

test('five of six squares in a row is not a Bingo', () => {
  const vs = ['Rustica', 'Spyhouse Coffee (Uptown)', 'SK Coffee', 'Pow Wow Grounds', "Rebecca's Bakery and Cafe"].map(n => visit(n));
  const r = run(shops(), vs);
  assert.equal(r.byId.bingo.earned, false);
  assert.equal(r.byId.bingo.have, 0);
});

test('free squares fill in a line: one stamped square alone in its row and column makes two lines', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 1, 1)];
  const r = run(list, [visit('A')]);
  assert.equal(r.bingo.rows[0], true);
  assert.equal(r.bingo.cols[0], true);
  assert.equal(r.bingo.rows[1], false);
  assert.equal(r.bingo.cols[1], false);
  assert.equal(r.bingo.lines, 2); // rows 2-3 and columns 2-5 are all free and don't count
  assert.equal(r.byId.bingo.progress, '2 lines done');
});

test('a line made only of free squares does not count', () => {
  const list = [shopIn('A', 0, 0)];
  const r = run(list, []);
  assert.equal(r.bingo.rows[3], false);
  assert.equal(r.bingo.cols[5], false);
  assert.equal(r.bingo.lines, 0);
  assert.equal(r.byId.bingo.earned, false);
});

test('Bingo progress shows squares when no line is done', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 0, 1), shopIn('C', 1, 1), shopIn('D', 1, 0)];
  const r = run(list, [visit('A')]);
  assert.equal(r.byId.bingo.progress, '1 of 4 squares');
});

test('Blackout is earned when every square with a shop is stamped', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 2, 3), shopIn('C', 3, 5), shopIn('C2', 3, 5)];
  const b = run(list, [visit('A'), visit('B'), visit('C')]).byId.blackout;
  assert.equal(b.earned, true);
  assert.equal(b.need, 3);
  assert.equal(b.progress, '3 of 3 squares');
});

test('Blackout is not earned with one playable square left', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 2, 3), shopIn('C', 3, 5)];
  const b = run(list, [visit('A'), visit('B')]).byId.blackout;
  assert.equal(b.earned, false);
  assert.equal(b.progress, '2 of 3 squares');
});

test('the real card has 19 playable squares; the 5 with no shop are free', () => {
  const r = run(shops(), []);
  const free = r.bingo.cells.filter(c => c.free).map(c => G.BINGO.names[c.r][c.c]);
  assert.deepEqual(free.sort(), ['Bancroft', 'Bde Maka Ska', 'East Harriet', 'Lyndale', 'Tangletown']);
  assert.equal(r.byId.blackout.need, 19);
  assert.equal(r.byId.blackout.earned, false);
});

// ---- Unknown shops ----

test('a visit to a shop not in the shop list does not stamp anything on the map', () => {
  const list = [shopIn('A', 0, 0)];
  const r = run(list, [visit('Closed Cafe')]);
  assert.equal(r.visited.size, 0);
  assert.equal(r.byId.explorer.have, 0);
  assert.equal(r.byId.full.have, 0);
  assert.equal(r.bingo.stamped, 0);
  assert.equal(r.byId.corners.have, 0);
});


// ---- Four Seasons ----

test('December counts as winter of the next year', () => {
  assert.equal(B.seasonIndex('2025-12-15'), B.seasonIndex('2026-01-15'));
  assert.equal(B.seasonIndex('2025-12-01'), B.seasonIndex('2026-02-28'));
});

test('November is fall and comes right before December winter', () => {
  assert.equal(B.seasonIndex('2025-12-01') - B.seasonIndex('2025-11-30'), 1);
});

test('season boundaries: March starts spring, June summer, September fall', () => {
  const w = B.seasonIndex('2026-02-15');
  assert.equal(B.seasonIndex('2026-03-01'), w + 1);
  assert.equal(B.seasonIndex('2026-05-31'), w + 1);
  assert.equal(B.seasonIndex('2026-06-01'), w + 2);
  assert.equal(B.seasonIndex('2026-08-31'), w + 2);
  assert.equal(B.seasonIndex('2026-09-01'), w + 3);
  assert.equal(B.seasonIndex('2026-11-30'), w + 3);
});

test('four seasons back to back earns Four Seasons', () => {
  const list = [shopIn('A', 0, 0)];
  const vs = ['2025-12-20', '2026-04-10', '2026-07-04', '2026-10-15'].map(d => visit('A', d));
  const s = run(list, vs).byId.seasons;
  assert.equal(s.earned, true);
  assert.equal(s.progress, '4 of 4 seasons in a row');
});

test('four seasons back to back across New Year earns Four Seasons', () => {
  const list = [shopIn('A', 0, 0)];
  const vs = ['2025-10-01', '2025-12-31', '2026-03-15', '2026-06-15'].map(d => visit('A', d));
  assert.equal(run(list, vs).byId.seasons.earned, true);
});

test('four seasons with a missing season in between does not earn Four Seasons', () => {
  const list = [shopIn('A', 0, 0)];
  const vs = ['2026-01-10', '2026-04-10', '2026-10-15', '2026-12-15'].map(d => visit('A', d)); // no summer
  const s = run(list, vs).byId.seasons;
  assert.equal(s.earned, false);
  assert.equal(s.have, 2);
});

test('several visits in the same season count once', () => {
  const list = [shopIn('A', 0, 0)];
  const vs = ['2026-06-01', '2026-07-01', '2026-08-01'].map(d => visit('A', d));
  assert.equal(run(list, vs).byId.seasons.have, 1);
});

// ---- Smaller stamps ----

test('Regular is earned with 5 visits to the same shop', () => {
  const list = [shopIn('A', 0, 0)];
  const r = run(list, Array.from({ length: 5 }, () => visit('A'))).byId.regular;
  assert.equal(r.earned, true);
  assert.equal(r.progress, 'A: 5 of 5 visits');
});

test('Regular is not earned with 4 visits to one shop and 1 to another', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 1, 1)];
  const vs = [visit('A'), visit('A'), visit('A'), visit('A'), visit('B')];
  const r = run(list, vs).byId.regular;
  assert.equal(r.earned, false);
  assert.equal(r.have, 4);
});

test('Early Bird is earned by a visit at 7:59', () => {
  const list = [shopIn('A', 0, 0)];
  assert.equal(run(list, [visit('A', '2026-03-10', '07:59')]).byId.early.earned, true);
});

test('Early Bird is not earned by a visit at 8:00', () => {
  const list = [shopIn('A', 0, 0)];
  assert.equal(run(list, [visit('A', '2026-03-10', '08:00')]).byId.early.earned, false);
});

test('Night Owl is earned by a visit at 18:00', () => {
  const list = [shopIn('A', 0, 0)];
  assert.equal(run(list, [visit('A', '2026-03-10', '18:00')]).byId.night.earned, true);
});

test('Night Owl is not earned by a visit at 17:59', () => {
  const list = [shopIn('A', 0, 0)];
  assert.equal(run(list, [visit('A', '2026-03-10', '17:59')]).byId.night.earned, false);
});

test('a visit with no time counts as noon: neither Early Bird nor Night Owl', () => {
  const list = [shopIn('A', 0, 0)];
  const r = run(list, [visit('A', '2026-03-10', '')]);
  assert.equal(r.byId.early.earned, false);
  assert.equal(r.byId.night.earned, false);
});

test('Patio Season is earned by a patio shop visit in May and in September', () => {
  const list = [shopIn('Patio Cafe', 0, 0, { patio: true })];
  assert.equal(run(list, [visit('Patio Cafe', '2026-05-01')]).byId.patio.earned, true);
  assert.equal(run(list, [visit('Patio Cafe', '2026-09-30')]).byId.patio.earned, true);
});

test('Patio Season is not earned by a patio shop visit in April or October', () => {
  const list = [shopIn('Patio Cafe', 0, 0, { patio: true })];
  assert.equal(run(list, [visit('Patio Cafe', '2026-04-30')]).byId.patio.earned, false);
  assert.equal(run(list, [visit('Patio Cafe', '2026-10-01')]).byId.patio.earned, false);
});

test('Patio Season is not earned by a summer visit to a shop without a patio', () => {
  const list = [shopIn('Indoor Cafe', 0, 0)];
  assert.equal(run(list, [visit('Indoor Cafe', '2026-07-04')]).byId.patio.earned, false);
});

test('Full Passport is earned when every shop has a visit', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 1, 1), shopIn('C', 1, 1)];
  const f = run(list, [visit('A'), visit('B'), visit('C')]).byId.full;
  assert.equal(f.earned, true);
  assert.equal(f.progress, '3 of 3 shops');
});

test('Full Passport is not earned with one shop left', () => {
  const list = [shopIn('A', 0, 0), shopIn('B', 1, 1), shopIn('C', 1, 1)];
  const f = run(list, [visit('A'), visit('B'), visit('B')]).byId.full;
  assert.equal(f.earned, false);
  assert.equal(f.progress, '2 of 3 shops');
});

test('visiting every fixture shop earns Full Passport and Blackout', () => {
  const all = shops();
  const r = run(all, all.map(s => visit(s.name)));
  assert.equal(r.byId.full.earned, true);
  assert.equal(r.byId.blackout.earned, true);
});

// ---- diff ----

test('diff lists the stamps a first visit just earned', () => {
  const list = [shopIn('Patio Cafe', 0, 0, { patio: true })];
  const before = run(list, []);
  const after = run(list, [visit('Patio Cafe', '2026-06-01', '07:30')]);
  const ids = B.diff(before, after).map(b => b.id).sort();
  assert.deepEqual(ids, ['bingo', 'blackout', 'corners', 'early', 'full', 'patio']);
});

test('diff is empty when nothing new is earned', () => {
  const list = [shopIn('Patio Cafe', 0, 0, { patio: true })];
  const before = run(list, [visit('Patio Cafe', '2026-06-01', '07:30')]);
  const after = run(list, [visit('Patio Cafe', '2026-06-01', '07:30'), visit('Patio Cafe', '2026-06-02', '09:30')]);
  assert.deepEqual(B.diff(before, after), []);
});

test('diff includes a stamp that went up a level and leaves out one that only made progress', () => {
  const list = [shopIn('A', 0, 0)];
  const school = d => visit('A', d, '10:00', { purpose: 'Schoolwork' });
  const v3 = ['2026-03-01', '2026-03-02', '2026-03-03'].map(school);
  const v9 = Array.from({ length: 9 }, (_, i) => school(`2026-03-${String(i + 1).padStart(2, '0')}`));
  const v10 = v9.concat(school('2026-03-10'));
  const at = vs => run(list, vs);
  assert.equal(at(v10).byId.teacher.level, 2);
  assert.ok(B.diff(at(v9), at(v10)).some(b => b.id === 'teacher'));
  assert.ok(!B.diff(at(v3), at(v9)).some(b => b.id === 'teacher'));
});
