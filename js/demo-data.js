// Sample data for demo mode only (when js/config.js has no backend).
// Shop names, addresses and drinks are public information. The real app loads
// everything, including home, from the private Google Sheet instead.
(function () {
  const T = (w, b, s, v, p, q) => ({ working: w, bigTables: b, sunny: s, water: v, patio: p, quiet: q });
  const shops = [
    ['Nokomis Beach Coffee', '4956 28th Ave S', 'Keewaydin', 44.9131, -93.2326, T(1, 0, 1, 1, 1, 1)],
    ['Crema Coffee + Cream', '5013 34th Ave S', 'Keewaydin', 44.9121, -93.2210, T(0, 0, 0, 0, 1, 1)],
    ['SunBean Coffee', '4553 34th Ave S', 'Ericsson', 44.9204, -93.2210, T(0, 0, 0, 0, 0, 1)],
    ["Rick's Coffee Bar", '5402 43rd Ave S', 'Morris Park', 44.9050, -93.2036, T(1, 0, 1, 0, 0, 1)],
    ['Falls Coffee', '4757 Hiawatha Ave', 'Hiawatha', 44.9167, -93.2174, T(1, 0, 1, 1, 1, 1)],
    ['Red Coral Coffee', '4457 42nd Ave S', 'Hiawatha', 44.9222, -93.2055, T(1, 1, 1, 0, 1, 1)],
    ['Code Blu Coffee', '2620 E Franklin Ave', 'Seward', 44.9627, -93.2356, T(1, 1, 1, 0, 0, 1)],
    ['Sovereign Grounds', '813 E 48th St', 'Field', 44.9159, -93.2620, T(1, 1, 1, 0, 0, 0)],
    ['Duck Duck Coffee', '1830 E 38th St', 'Powderhorn Park', 44.9340, -93.2472, T(1, 1, 1, 0, 1, 1)],
    ['Ducks on Lake', '3822 E Lake St', 'Cooper', 44.9485, -93.2133, T(1, 0, 0, 0, 1, 1)],
    ["Sisters' Sludge Coffee Cafe & Wine Bar", '3746 23rd Ave S', 'Corcoran', 44.9350, -93.2401, T(1, 1, 1, 0, 1, 1)],
    ['Northern Coffeeworks', '4208 28th Ave S', 'Ericsson', 44.9266, -93.2326, T(1, 1, 1, 0, 1, 0)],
    ['Bichota Coffee', '3740 Chicago Ave', 'Central', 44.9351, -93.2623, T(1, 1, 1, 0, 0, 1)],
    ['Wildflyer Coffee', '3262 Minnehaha Ave', 'Longfellow', 44.9441, -93.2310, T(1, 1, 1, 0, 1, 1)],
    ['Dogwood Coffee', '4021 E Lake St', 'Cooper', 44.9485, -93.2094, T(1, 0, 0, 0, 1, 1)],
    ['Pow Wow Grounds', '1414 E Franklin Ave', 'Ventura Village', 44.9627, -93.2536, T(1, 0, 1, 0, 1, 0)],
    ['Black Bean Coffee', '2840 Chicago Ave S', 'Midtown Phillips', 44.9500, -93.2623, T(1, 0, 1, 0, 1, 0)],
    ['Five Watt Coffee', '3745 Nicollet Ave', 'Kingfield', 44.9350, -93.2777, T(1, 0, 1, 0, 1, 1)],
    ['Silverbird Coffee & More', '4237 Nicollet Ave', 'Kingfield', 44.9262, -93.2777, T(1, 0, 1, 0, 0, 1)],
    ['Shortwave Coffee', '824 W 50th St', 'Lynnhurst', 44.9123, -93.2915, T(1, 1, 1, 0, 1, 1)],
    ['Jones Coffee (Linden Hills)', '2814 W 43rd St', 'Linden Hills', 44.9247, -93.3150, T(1, 0, 1, 0, 0, 1)],
    ['Jones Coffee (Fulton)', '5008 Xerxes Ave S', 'Fulton', 44.9121, -93.3195, T(1, 0, 1, 0, 0, 1)],
    ['Càphin', '4503 France Ave S', 'Linden Hills', 44.9214, -93.3285, T(1, 0, 0, 0, 0, 1)],
    ['Cafe Ceres (Linden Hills)', '3509 W 44th St', 'Linden Hills', 44.9232, -93.3245, T(1, 0, 1, 0, 1, 1)],
    ['Spyhouse Coffee (Whittier)', '2451 Nicollet Ave', 'Whittier', 44.9585, -93.2777, T(1, 1, 1, 0, 0, 1)],
    ['Spyhouse Coffee (Uptown)', '2404 Hennepin Ave', 'Lowry Hill East', 44.9590, -93.2950, T(1, 0, 1, 0, 0, 1)],
    ['SK Coffee', '2401 Lyndale Ave S', 'Whittier', 44.9590, -93.2883, T(1, 0, 1, 0, 0, 1)],
    ["Muhim's Café", '115 E Lake St', 'Whittier', 44.9485, -93.2765, T(1, 0, 1, 0, 0, 1)],
    ['Isles Bun & Coffee', '1424 W 28th St', 'Lowry Hill East', 44.9521, -93.3005, T(1, 1, 1, 0, 1, 1)],
    ['Corner Coffee (Uptown)', '1414 W 28th St', 'Lowry Hill East', 44.9521, -93.2985, T(1, 1, 0, 0, 1, 1)],
    ['Uncommon Grounds', '2809 Hennepin Ave', 'East Isles', 44.9518, -93.2970, T(1, 0, 0, 0, 1, 1)],
    ['Moona Moono', '3048 Hennepin Ave', 'CARAG', 44.9480, -93.2984, T(1, 1, 1, 0, 0, 1)],
    ['Mosaic Coffee', '3040 Hennepin Ave', 'CARAG', 44.9470, -93.2988, T(1, 0, 1, 0, 0, 0)],
    ["Bob's Java Hut", '2651 Lyndale Ave S', 'Lowry Hill East', 44.9545, -93.2883, T(1, 1, 1, 0, 1, 1)],
    ['Lake and Bryant Cafe', '821 W Lake St', 'Lyndale', 44.9485, -93.2925, T(1, 0, 1, 0, 1, 1)],
    ['Boiler Room Coffee', '1830 3rd Ave S', 'Stevens Square', 44.9650, -93.2700, T(1, 0, 0, 0, 0, 1)],
    ['Fireroast Coffee & Wine Bar', '3800 37th Ave S', 'Howe', 44.9340, -93.2152, T(1, 1, 1, 0, 1, 1)],
    ['Rustica', '3220 W Lake St', 'Cedar-Isles-Dean', 44.9488, -93.3200, T(1, 1, 1, 0, 1, 1)],
    ['Loons Coffee', '4648 E Lake St', 'Cooper', 44.9485, -93.2025, T(1, 1, 1, 1, 1, 1)]
  ].map(([name, address, neighborhood, lat, lng, tags]) => ({ name, address, neighborhood, lat, lng, tags }));

  const M = (shop, list) => list.map(([drink, type, desc]) => ({ shop, drink, type, desc: desc || '' }));
  const menus = [].concat(
    M('Crema Coffee + Cream', [['Rose cardamom latte', 'Latte', 'Rose and cardamom'], ['Morris Park', 'Latte', 'House vanilla latte, great iced'], ['Dark spicy mocha', 'Mocha'], ['Matcha affogato', 'Matcha', 'Matcha over gelato'], ['Salted caramel cold brew', 'Cold brew'], ['Caramel apple latte', 'Seasonal', 'Fall']]),
    M('Nokomis Beach Coffee', [['Noko', 'Mocha', 'Espresso, white cocoa, steamed milk'], ['Iced white mocha', 'Mocha'], ['Iced cinnamon latte', 'Latte'], ['Oregon chai', 'Chai'], ['Strawberry acai refresher', 'Non-coffee']]),
    M('Five Watt Coffee', [['The Kingfield', 'Latte', 'Vanilla, coriander bitters, black sea salt'], ['The Big Easy', 'Cold brew', 'Chicory, nutmeg, black walnut bitters, cream'], ['Shakerato', 'Espresso', 'Shaken with cherry and walnut bitters']]),
    M('Duck Duck Coffee', [['Miel', 'Latte', 'Honey, cinnamon, nutmeg'], ['House chai latte', 'Chai'], ['Matcha green tea latte', 'Matcha'], ['Cold brew', 'Cold brew']]),
    M('Northern Coffeeworks', [['Sea salt mocha', 'Mocha', 'Smoked sea salt'], ['Orange lavender latte', 'Latte'], ['North Woods cold brew', 'Cold brew', 'Maple and oat milk'], ['Cortado', 'Espresso']]),
    M('Càphin', [['Cà phê trứng (egg coffee)', 'Espresso', 'Whipped egg yolk topping'], ['Cà phê sữa', 'Drip', 'Phin drip with condensed milk'], ['Cà phê lá dứa', 'Latte', 'Pandan latte'], ['Strawberry matcha latte', 'Matcha']]),
    M('Wildflyer Coffee', [['Longfellow latte', 'Latte'], ['Monarch latte', 'Latte', 'Orange blossom'], ['London Fog', 'Tea'], ['Chai latte', 'Chai']]),
    M('Silverbird Coffee & More', [['The Woodsman', 'Latte', 'Maple ginger and birch'], ['First Blush', 'Latte', 'Cardamom'], ['Sparkling matcha', 'Matcha', 'Over elderflower soda'], ['Hojicha latte', 'Tea']]),
    M('Bichota Coffee', [['Dulce de leche latte', 'Latte'], ['Chai latte', 'Chai', 'Spicy'], ['Matcha latte', 'Matcha']]),
    M("Sisters' Sludge Coffee Cafe & Wine Bar", [['Aztec mocha', 'Mocha', 'Spiced chocolate'], ['Salty Dog', 'Mocha', 'Caramel and dark chocolate'], ['Lavender latte', 'Latte']])
  );
  window.CP_DEMO = { shops, menus, home: { lat: 44.9396, lng: -93.2590, label: 'Demo home (Powderhorn Park)' } };
})();
