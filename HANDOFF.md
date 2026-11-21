# Coffee Passport: handoff

A gift app for my wife. It covers the independent coffee shops in South Minneapolis
(Mississippi River to the east, Hwy 62 to the south, France Ave to the west, I-94 to the north).
She can see the shops on a hand-drawn map, rate them in cups, log visits, pick a favorite
drink at each shop, search the menus and collect stamps.

- **Repo:** `erikmeyers-blip/coffee-passport`, branch `claude/coffee-shop-rating-app-k49kfj`
  (all work is pushed there). Read `README.md` for the architecture and setup.
- **Live app:** https://erikmeyers-blip.github.io/coffee-passport/ (GitHub Pages)
- **Backend:** the Apps Script in `backend/Code.gs`, bound to my private **Coffee Passport**
  Google Sheet and deployed as a web app
  (Execute as: Me, Who has access: Anyone). The web app URL and the OAuth client ID are in
  `js/config.js`.

## Rules to keep

- **Independent shops only:** no chains (no Starbucks, no Caribou) and no restaurants.
  A coffee shop that serves food is fine.
- **The sheet stays in my Drive.** It is never shared with her, and she must not get any
  notification: it's a surprise.
- **My home address stays only in the sheet's Settings tab,** never in the repo, which is public.
- **Copy says "your", never "her".**
- **The only streak is Four Seasons.** No daily streaks.
- **Look and feel:** Material 3 Expressive in browns and oranges, fast on a Pixel 7. The springy
  bounce is only on the rating cups, the favorite cup and Log visit. Cups visibly pour and fill.

## How it works

- Plain HTML, CSS and JS with no build step. It can be installed as a PWA.
- She signs in with her own Google account (Google Identity Services ID token, name and email only).
  Apps Script checks the token against the **Google client ID** and **Allowed email** rows in
  the Settings tab.
- Visits and Ratings rows carry an **Account** column, so data from my test account is kept
  separate from hers.
- The app is offline-first: it keeps a local cache plus a queue of writes still to send.
- There are 39 shops, 284 menu drinks and 18 stamps, including Four Corners, Bingo (4×6 grid
  of neighborhoods), Blackout and Full Passport.

## Recently fixed

- The cups didn't visibly pour on the live app, because the background sync redrew the shop
  card mid-animation. It now redraws only when the shop's data actually changed (commit `e9f8193`).

## Next steps

1. **Package it as an Android APK** the same way as my sports app (check how that project did it).
   - Use a **Trusted Web Activity** (Bubblewrap, PWABuilder or similar) that points at the
     GitHub Pages URL. Don't use a WebView or Capacitor wrapper: Google blocks Sign in with Google
     inside WebViews.
   - Add `.well-known/assetlinks.json` with the APK's signing-key SHA-256 fingerprint, so it
     opens full screen with no browser bar. Pages serves from `/coffee-passport/`, so this file
     may need to live at the root of the `erikmeyers-blip.github.io` site.
   - Install it on my Pixel over wireless debugging (`adb`). The phone is already paired.
   - Use the icons already in the repo: `icon-512.png` and `icon-maskable-512.png`.
2. **Test sign-in on the live site.** `https://erikmeyers-blip.github.io` was just added as an
   Authorized JavaScript origin on the OAuth client, and it can take a few minutes to apply.
3. **Fill in the Allowed email rows** in the Settings tab (rows 17 and 18): her Gmail and mine.
4. **Make sure GitHub Pages deploys from the branch above,** or merge that branch into `main`.
5. **Disable or delete the OAuth client secret** in Google Cloud. The app doesn't use it, and it
   showed up in a screenshot.
6. **After any change to `Code.gs`,** go to Deploy > Manage deployments > Edit > *New version*.
