# Ludora — Native Android App

A native Android app that renders the live Ludora web app inside a native shell
(Trusted-Web-Activity style). The UI is your responsive, already-approved web design,
so the app and website always look and behave the same and stay in sync through the
one backend.

## Why this approach

- **Exact design match** — it is your real web UI, so no design drift between web and app.
- **Fully responsive and smooth** — the web app is responsive; the native shell is
  hardware-accelerated and runs it full-screen.
- **One codebase to maintain** — ship a web change and the app updates with it.
- **Native features** — splash screen, themed status/nav bars, pull-to-refresh, back
  navigation, offline screen with retry, and the system file picker for result screenshots.

## Build & run

1. Open the `android-app/` folder in Android Studio.
2. Let it sync, then Run on a device or emulator.
3. The site it loads is set in `app/build.gradle.kts` → `SITE_URL`
   (default `https://ludo-king-match.vercel.app`).

## Release build (for Play Store or a shareable APK)

`Build ▸ Generate Signed Bundle / APK`, choose a keystore, build a release AAB/APK.

## What it includes

- `MainActivity.kt` — WebView host with:
  - JS + DOM storage enabled, wide-viewport responsive rendering
  - in-app navigation for your site + the backend; external links open in Custom Tabs
  - pull-to-refresh, top progress bar, offline/error view with retry
  - `<input type="file">` support (screenshot uploads) via the system picker
  - back button navigates web history, then exits
  - state saved/restored across rotation
- Android 12+ splash screen, light/dark status bars, original adaptive launcher icon.

## Pure-native alternative

A separate Jetpack Compose scaffold lives in `../android/` if you later want fully
native screens instead of the web UI. This WebView app is the fast, reliable path to a
polished, store-ready app that exactly matches the approved design.

## Note before real money

The web app it loads still needs the payment gateway, OTP, and KYC wired on the backend
before real funds flow, and a gaming licence for the markets you serve.
