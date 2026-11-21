# Coffee Passport for Android

A Trusted Web Activity: the APK opens https://erikmeyers-blip.github.io/coffee-passport/
in Chrome itself (not a WebView), so Google sign-in works. There is no app code;
`LauncherActivity` from android-browser-helper does the work. The site, launch URL
and asset link are set in `app/build.gradle.kts`.

## Build and install (same as the Sports app)

```sh
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
./gradlew assembleDebug
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
"$ADB" -s adb-67080DLDV0080F-HBRil6._adb-tls-connect._tcp install -r app/build/outputs/apk/debug/app-debug.apk
```

`adb devices` also lists the Pixel Watch, so always pass `-s` with the phone.

## Full screen (no browser bar)

Chrome shows the app full screen only after it finds `assetlinks.json` at
`https://erikmeyers-blip.github.io/.well-known/assetlinks.json`, the root of the
user site, not `/coffee-passport/`. That needs a repo named
`erikmeyers-blip.github.io` with `assetlinks.json` (in this folder) at
`.well-known/assetlinks.json` and an empty `.nojekyll` file, so Pages serves the dot folder.
Until then the app works but shows a thin URL bar at the top.

The fingerprint in `assetlinks.json` is this PC's debug key
(`~/.android/debug.keystore`). An APK built on another machine has a different key.
