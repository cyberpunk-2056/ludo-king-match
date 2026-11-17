# Ludora — Expo Mobile App

Cross-platform native mobile app (Android + iOS) built with **Expo + React Native +
TypeScript**. Native UI (not a WebView). Calls the same backend as the website, so the
app, the web app, and the database stay in sync.

## Run it

```bash
cd expo-app
npm install
npx expo start
```

- Scan the QR with **Expo Go** (Android/iOS) to run instantly on your phone, or press
  `a` for an Android emulator / `i` for an iOS simulator.
- The backend URL is `EXPO_PUBLIC_API_URL` (defaults to `https://ludo-king-match.onrender.com`).
  Copy `.env.example` to `.env` to override.

## Build installable binaries (EAS)

```bash
npm install -g eas-cli
eas build -p android --profile preview   # APK you can install
eas build -p ios --profile preview       # needs an Apple account
```

EAS builds in the cloud, so you don't need Android Studio or a Mac.

## Structure (Expo Router, file-based)

```
app/
  _layout.tsx        providers + root stack
  index.tsx          auth gate (redirects to tabs or /auth)
  auth.tsx           login / signup
  (tabs)/_layout.tsx bottom tabs + header
  (tabs)/index.tsx   Home
  (tabs)/play.tsx    lobby + create match + room-code report modal
  (tabs)/wallet.tsx  balance + transactions
  (tabs)/profile.tsx profile + stats
  deposit.tsx        add money
  withdraw.tsx       withdraw to verified UPI
  refer.tsx          referral (3% of friends' winnings)
src/
  api.ts             backend client + types (token in expo-secure-store)
  state.tsx          auth / language / theme context
  theme.ts           dark + light palettes
  i18n.ts            English + Hindi
  ui.tsx             Button, Card, Field, Tile, Board
```

## Notes

- Light/dark theme and English/Hindi, toggled from the header.
- The screens call the live backend; the money flow still needs the payment gateway,
  OTP, and KYC wired, and a gaming licence, before real funds move.
