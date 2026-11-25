# Coffee Passport

Gift app for Erik's wife: a hand-drawn map of independent South Minneapolis
coffee shops with cup ratings, visits and stamps. Read `HANDOFF.md` and
`README.md` first. It's a surprise: never contact her, and her data and the
home address stay in the private Google Sheet, never in this public repo.

## Testing

Devices, serials and device rules: `C:\Users\erikm\.claude\devices.md`.

- **Toolchain:** plain HTML/CSS/JS, no build step, served by GitHub Pages from
  `claude/coffee-shop-rating-app-k49kfj`. Node 24 for tests only (no dependencies).
  `android/` is a Trusted Web Activity shell built with Gradle like the Sports app.
- **Quick test (runs automatically after code changes):** `npm test`
  (configured in `.claude/autotest.json`; `android/`, `backend/`, CSS and images don't trigger it).
- **Full check:** `npm test`, then open the app in a phone-sized preview with
  `js/config.js` blanked (demo mode) and check the map, Bingo layer and back button.
- **Unit test style:** Node's built-in runner (`node:test` + `node:assert/strict`),
  files in `tests/*.test.js`. `tests/load.js` loads `js/geo.js` and `js/badges.js`
  into Node. Shop data comes from `tests/fixtures/shops.json` (public business
  info saved from the sheet). No live network, no real visits or emails.
- **Emulator:** none needed; the TWA needs Chrome with the asset link, so test it on the phone.
- **Real devices:** Erik's Pixel (the debug APK from `android/`), only after Erik says yes.
  After pushing, open the app with `?v=<n>` in the URL to skip the cached page.
- **What only the real device shows:** full screen vs browser bar (asset links),
  Google sign-in, the back gesture, syncing with the sheet.
- **Never:** write test data into her Visits or Ratings rows, share the sheet,
  or commit anything personal (home address, emails).
