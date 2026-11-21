# Coffee Passport

A phone app (a website you add to the home screen) for collecting every
independent coffee shop in South Minneapolis: a hand-drawn map, cup ratings,
favorite drinks, menus, check-ins with a stamp, and a passport of stamps
(Four Corners, Bingo, Four Seasons, Full Passport and more).

Plain HTML, CSS and JavaScript. No build step.

## How it fits together

```
Phone (this site on GitHub Pages)
   |  Google sign-in (name and email only)
   v
Apps Script web app (backend/Code.gs, runs as the sheet owner)
   |
   v
Coffee Passport Google Sheet (private, never shared)
```

- **Shops, menus, home address and allowed emails** live in the sheet.
- **Visits and ratings** are written back to the sheet (Visits and Ratings tabs).
- The phone keeps a copy so the app opens instantly; saves made offline wait
  and go through later.
- Nothing personal is in this repository. `js/config.js` holds only the web app
  URL and the Google client ID, which are safe to publish.

With `js/config.js` empty the app runs in **demo mode**: sample shops, a demo
home, and everything saved only on that device.

## Setup (once)

### 1. Google sign-in client (about 5 minutes)
1. Go to <https://console.cloud.google.com/>, create a project called **Coffee Passport**.
2. **APIs & Services > OAuth consent screen**: External, app name *Coffee Passport*.
   While it's in *Testing*, add her Gmail and yours under **Test users**
   (or click *Publish app*; name-and-email sign-in needs no Google review).
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type: *Web application*
   - Authorized JavaScript origins: `https://erikmeyers-blip.github.io`
     (add `http://localhost:8000` too if you want to test locally)
4. Copy the **Client ID**.

### 2. The sheet
1. Open the Coffee Passport sheet > **Extensions > Apps Script**.
2. Replace the starter code with everything in `backend/Code.gs`. Save.
3. Pick `setup` in the function menu and press **Run**. Approve the permission
   prompt (it's your own account). This adds the Ratings tab, the Lat/Lng
   columns, map positions for every shop, and the home position.
4. In the **Settings** tab fill in:
   - `Google client ID` → the Client ID from step 1
   - `Allowed email` → her Gmail (add another `Allowed email` row for yours)
5. **Deploy > New deployment > Web app**. Execute as: *Me*. Who has access: *Anyone*.
   Copy the **Web app URL**.

### 3. The app
1. Put the Web app URL and Client ID into `js/config.js`.
2. GitHub repository > **Settings > Pages** > Deploy from a branch > pick the branch, folder `/ (root)`.
3. Open `https://erikmeyers-blip.github.io/coffee-passport/` on her phone,
   sign in once, then **⋮ > Add to Home screen**.

## Day-to-day

- **Add a shop:** add a row in Shops with *Include?* = Yes, then run
  `geocodeShops` in Apps Script so it gets a map pin.
- **Edit tags or menus:** edit the Shops or Menus tab; the app picks it up on next open.
- **Her progress:** the Visits and Ratings tabs. Every row has an **Account**
  column; each signed-in Google account only sees its own rows, so testing
  with your account never touches her passport. Filter by Account to see just hers,
  and delete your test rows whenever you like.
- **After changing `Code.gs`:** Deploy > Manage deployments > edit > *New version*.

## Files

| Path | What it does |
|---|---|
| `index.html` | App shell, splash, sign-in |
| `css/app.css` | Look and feel, light and "dark roast" themes, animations |
| `js/app.js` | Screens: map, shop card, check-in, search, passport, celebrations |
| `js/geo.js` | The hand-drawn map, Bingo squares, Four Corners, distances |
| `js/badges.js` | Every stamp's rules, worked out from visits and ratings |
| `js/store.js` | Sign-in, saving to the sheet, offline queue, demo mode |
| `js/demo-data.js` | Sample shops for demo mode |
| `backend/Code.gs` | The Apps Script that reads and writes the sheet |
