# 🧭 Camo Mobile (P-494)

A React Native mobile app for a hunting/outdoor community platform, with member management, forums, support tickets, deer/vehicle recovery, maps, scouting, and admin tools—powered by Expo and Convex.

## 📚 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## 🧩 About

Camo Mobile is a mobile app for a hunting/outdoor membership platform. It provides dashboard, member profiles, forums, support tickets, deer and vehicle recovery workflows, maps (hunting units, land leases, tracking), scouting trips, friends/location sharing, and admin tools (member management, audit trail, bans, role permissions, forum moderation). The app uses Expo (React Native), Convex for backend and auth, and NativeWind (Tailwind) for styling.

## ✨ Features

- **Auth & profile** – Sign-in (email/password, optional biometrics), profile setup, public profile, member numbers
- **Dashboard** – Main hub and navigation into core features
- **Member management** – List members, view/edit profiles, roles (owner/admin/member), account status, call logs, admin notes; migration for member numbers
- **Forums** – Forum list, posts, moderation, pending/reported posts, warnings/bans
- **Support** – Contact support, open tickets list, ticket replies and status
- **Deer recovery** – Deer recovery requests and workflows
- **Vehicle recovery** – Vehicle recovery requests and workflows
- **Maps** – Map view with hunting units, land leases, property layers, tracking/waypoints, friend locations
- **Scouting** – Scouting trips and related dialogs
- **Friends** – Add friends, friend list, location sharing
- **HQ / Manage** – Admin entry: member management, audit trail, bans, role permissions, forum moderation, subscriptions
- **Other** – Solunar, weather, hunts, tracks, waypoints; responsive UI with bottom nav and toasts

## 🧠 Tech Stack

| Category      | Technologies                                                         |
| ------------- | -------------------------------------------------------------------- |
| **Framework** | Expo ~54 (Expo Router 6)                                             |
| **Language**  | TypeScript (React 19)                                                |
| **Backend**   | Convex (realtime DB, auth, server functions)                         |
| **Auth**      | @convex-dev/auth, optional biometrics (expo-secure-store)            |
| **Styling**   | NativeWind 4 (Tailwind), Lucide React Native                         |
| **UI**        | React Native core, react-native-maps, Bottom Tabs, Stack             |
| **Forms**     | react-hook-form, @hookform/resolvers                                 |
| **Other**     | date-fns, suncalc (solunar), Resend (email), react-native-reanimated |
| **Tools**     | ESLint (expo), TypeScript, EAS (app.json)                            |

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/Kcrypto126/Camo-Ammo-Mobile
cd Camo-Ammo-Mobile

# Install dependencies
npm install
```

## 🚀 Usage

```bash
# Start the Expo dev server
npm start
# or with dev client
npm run dev

# Run Convex backend (separate terminal)
npm run backend
```

Then open the app in a simulator/device via Expo Go or a development build.

**Other scripts:**

- `npm run android` – Run on Android
- `npm run ios` – Run on iOS
- `npm run web` – Run in web browser
- `npm run lint` – Run ESLint

## 🧾 Configuration

Create a `.env` (or use `.env.example` as reference) in the project root:

```env
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

- Convex: Create a project at [convex.dev](https://convex.dev), then run `npx convex dev` and follow prompts to link the deployment.
- Maps: Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (and optionally in `app.json` for native builds) for map features.

## 🖼 Screenshots

![home page screenshot](https://github.com/Kcrypto126/Camo-Ammo-Mobile/blob/main/assets/images/dashboard.png?raw=true)

## 📜 API Documentation

The app does not expose REST API routes. All data and actions go through **Convex**:

- **Queries** – e.g. `api.users.getCurrentUser`, `api.roles.listUsers`, `api.forums.getForums`, `api.support.getTickets`
- **Mutations** – e.g. `api.users.updateCurrentUser`, `api.support.createTicket`, `api.deerRecovery.createRequest`
- **Auth** – Handled by `@convex-dev/auth` (sign-in, sign-out, session) and Convex HTTP routes if configured in `convex/http.ts`

Convex function names and arguments are defined in the `convex/` folder (e.g. `convex/users.ts`, `convex/support.ts`). Use the Convex dashboard and generated `api` object from `convex/react` for the full list of available functions.

## 📬 Contact

- **Author:** Kaori Fujio
- **Email:** superdev19782@gmail.com
- **GitHub:** @kcrypto126
- **Website/Portfolio:** https://kaorifujio19782.vercel.app/

## 🌟 Acknowledgements

- Inspiration or resources used
- Libraries, icons, or tutorials referenced
- Collaborators or contributors
