# Ludora — Native Android App

A fully native Android client (Kotlin + Jetpack Compose) for the Ludora skill-based
real-money Ludo platform. The app and the website are **both clients of one backend
API**, which owns the single shared database. The clients never touch the database
directly — they call REST endpoints, so web and Android always see the same data.

```
┌────────────┐      ┌────────────┐
│  Web app   │      │  Android   │   ← this project
│ (React)    │      │ (Compose)  │
└─────┬──────┘      └─────┬──────┘
      │   HTTPS / JSON    │
      └────────┬──────────┘
         ┌─────▼──────┐
         │  Backend   │  (Node/Express + Socket.IO)
         │   API      │
         └─────┬──────┘
         ┌─────▼──────┐
         │ PostgreSQL │  ← the one shared database
         │  + Redis   │
         └────────────┘
```

## Stack

- **Language:** Kotlin
- **UI:** Jetpack Compose + Material 3
- **Architecture:** MVVM, unidirectional data flow (ViewModel + StateFlow)
- **Networking:** Retrofit + OkHttp + kotlinx.serialization
- **Auth:** JWT bearer token stored in Jetpack DataStore, attached by an OkHttp interceptor
- **Navigation:** Navigation-Compose
- **DI:** a lightweight manual service locator (`Graph`) — no Hilt/kapt needed to build
- **Min SDK:** 24 · **Target/Compile SDK:** 34
- **Themes:** light + dark, violet/indigo accent, the four Ludo colors (matches the web design)
- **Languages:** English + Hindi (in-app `Strings` map, same keys as the web app)

## How to build

1. Install Android Studio (Koala or newer).
2. `File ▸ Open` this `android/` folder.
3. Set the backend URL in `app/build.gradle.kts` → `BASE_URL` build-config field
   (defaults to `http://10.0.2.2:4000/` which is `localhost` from the emulator).
4. Run on an emulator or device.

## Project layout

```
app/src/main/java/com/ludora/app/
├─ LudoraApplication.kt      app entry, initializes Graph
├─ MainActivity.kt           hosts the Compose tree + nav
├─ core/Money.kt             currency formatting + 95/5 split + 3% referral math
├─ data/
│  ├─ model/Models.kt        @Serializable DTOs shared with the API
│  ├─ remote/ApiService.kt   Retrofit endpoints (the shared API contract)
│  ├─ remote/AuthInterceptor.kt  attaches the JWT
│  ├─ local/TokenStore.kt    DataStore token persistence
│  └─ LudoraRepository.kt    single source of truth, wraps the API
├─ di/Graph.kt               service locator
├─ ui/theme/                 Color.kt, Theme.kt, Type.kt
├─ ui/Strings.kt             EN/HI i18n
├─ ui/components/Common.kt   buttons, tiles, board canvas
├─ ui/nav/                   Routes.kt, NavGraph.kt
├─ ui/auth/                  AuthViewModel.kt, AuthScreen.kt
├─ ui/home/HomeScreen.kt
├─ ui/wallet/                WalletViewModel.kt, WalletScreen.kt, DepositScreen.kt, WithdrawScreen.kt
├─ ui/play/                  PlayViewModel.kt, PlayScreen.kt, CreateMatchScreen.kt
└─ ui/profile/ProfileScreen.kt
```

## Shared backend API contract

Both clients use these endpoints. All responses are JSON. Authenticated requests send
`Authorization: Bearer <jwt>`. Money is in minor units is avoided here — amounts are
decimal in the account currency.

### Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/signup` | `{name, phone, email, password}` | `{token, user}` |
| POST | `/api/auth/login` | `{phone, password}` | `{token, user}` |
| POST | `/api/auth/logout` | — | `{ok}` |
| GET  | `/api/me` | — | `User` (name, phone, rating, stats) |

### Wallet
| Method | Path | Body | Returns |
|---|---|---|---|
| GET  | `/api/wallet` | — | `{deposit, winnings, currency}` |
| GET  | `/api/wallet/transactions?limit=` | — | `[Transaction]` |
| POST | `/api/wallet/deposit` | `{amount, method, instrument}` | `{txId, status}` |
| POST | `/api/wallet/withdraw` | `{amount, upiId}` | `{txId, status}` |

### Payout methods (verified UPI)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET  | `/api/payout-methods` | — | `[UpiAccount]` |
| POST | `/api/payout-methods/verify` | `{vpa}` | `{vpa, name, verified}` |
| POST | `/api/payout-methods/{id}/default` | — | `{ok}` |

### Matches
| Method | Path | Body | Returns |
|---|---|---|---|
| GET  | `/api/matches/live` | — | `[Match]` |
| GET  | `/api/matches/open` | — | `[Match]` (with join deadline) |
| GET  | `/api/matches/recent` | — | `[MatchResult]` |
| GET  | `/api/matches/history` | — | `[MatchResult]` |
| POST | `/api/matches` | `{mode, stake}` | `{matchId, status}` |
| POST | `/api/matches/{id}/join` | — | `{roomCode, opponent}` |
| POST | `/api/matches/{id}/result` | `{result, proofUrl?}` | `{status}` |

### Referral
| Method | Path | Returns |
|---|---|---|
| GET  | `/api/referral` | `{code, earnings, winningsBase, friends}` |

## Money rules (kept identical to the web app)

- Winner receives **95%** of the pot; platform fee is **5%**.
- A created match holds a **10-minute** join window; if unfilled, the stake is refunded.
- Referral commission is **3% of a referred friend's winnings, paid only when they win**.
- Withdrawals cover **deposit balance + winnings**; min deposit $5, min withdrawal $10.
- Payouts go only to a **KYC-verified UPI** account.
- The Ludo game itself is played in the Ludo King app via a shared room code; the
  winner reports the result, which the backend verifies before paying out.
