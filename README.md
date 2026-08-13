# 🎲 Catan Dice Tracker

> A premium, offline-first PWA for tracking Catan dice rolls, player turns, and probability statistics in real time.

<div align="center">

![PWA](https://img.shields.io/badge/PWA-Offline--First-F39A2D?style=for-the-badge&logo=pwa&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Tap. Track. Analyze.**

Built for the table, designed for the phone, completely local.

</div>

---

## ✨ What is Catan Dice Tracker?

Catan Dice Tracker turns every dice roll into useful game data without slowing the game down.

It is designed around one principle:

> **One tap should be enough to record a roll. Everything else should feel effortless.**

The app is an installable **Progressive Web App**, works offline after installation, stores games locally with IndexedDB, supports a dedicated **StandBy / Table Mode**, and compares real-world results against the theoretical probability of two six-sided dice.

### No account. No server. No cloud database.

Your game data stays on the device.

---

## 🎯 The problem it solves

During almost every Catan game someone eventually says:

> “There is no way we have rolled this many 7s.”

Or:

> “Why is nobody rolling 6 or 8?”

Catan Dice Tracker gives the table an immediate answer.

Every roll is logged, attributed to the current player, and reflected instantly across the tracker, live distribution, timeline, and probability analysis.

---

## 🚀 Features

| Area | Included |
|---|---|
| 🎲 Dice tracking | One-tap rolls from 2–12 |
| 👥 Players | 2–6 players with automatic turn rotation |
| ⏱️ Game tracking | Roll count + live game timer |
| ↩️ Corrections | Undo the latest roll |
| 🔄 Reset | Restart rolls while preserving player setup |
| 🖥️ StandBy | Landscape table mode with live chart |
| 📊 Statistics | Overview, distribution, timeline, heat map |
| 📈 Probability | Actual vs theoretical two-dice distribution |
| 🗂️ History | Keep and export previous games |
| 💾 Storage | IndexedDB + localStorage |
| 📱 PWA | Installable on iOS, Android, and desktop |
| 📴 Offline | Core experience works without internet |
| 🔒 Privacy | No login, backend, or cloud dependency |
| 🔋 Table-ready | Screen Wake Lock support |
| 📳 Haptics | Vibration feedback where supported |
| 🍊 Visual language | Dark glass UI + Catan-inspired orange accent |

---

## 📊 Catan probability engine

The app uses the exact distribution of two standard six-sided dice:

| Roll | Probability | Pips |
|---:|---:|:---:|
| 2 | 2.78% | ● |
| 3 | 5.56% | ●● |
| 4 | 8.33% | ●●● |
| 5 | 11.11% | ●●●● |
| 6 | 13.89% | ●●●●● |
| **7** | **16.67%** | **●●●●●●** |
| 8 | 13.89% | ●●●●● |
| 9 | 11.11% | ●●●● |
| 10 | 8.33% | ●●● |
| 11 | 5.56% | ●● |
| 12 | 2.78% | ● |

Expected counts are calculated as:

```ts
expectedCount = totalRolls * CATAN_PROBABILITIES[value];
```

This powers the actual-vs-expected chart and the heat map.

---

## 🧭 App experience

### Tracker

The primary screen is optimized for rapid table use.

- Large touch targets
- Catan-style probability pips
- 7 highlighted as the signature value
- 6 and 8 visually emphasized as high-probability values
- Animated last-roll feedback
- Automatic player rotation
- Undo / reset
- StandBy entry

Dice are arranged as:

```text
2   3   4
5   6   7   8
9  10  11  12
```

### StandBy / Table Mode

A dedicated landscape layout for the physical game table.

```text
┌───────────────────────────────┬─────────────────────────────┐
│                               │                             │
│       DICE NUMPAD             │      LIVE DISTRIBUTION      │
│                               │          2 ─────            │
│       2  3  4                 │          3 ───────          │
│     5  6  7  8               │          ...                │
│    9 10 11 12                │          7 ─────────────     │
│                               │                             │
└───────────────────────────────┴─────────────────────────────┘
```

The navigation bar disappears and wake lock is requested automatically while StandBy is active.

### Statistics

Four swipeable analytical views:

1. **Overview** — totals, average, common/rare values, 7 frequency
2. **Distribution** — actual vs expected
3. **Timeline** — newest rolls first with player and timestamp
4. **Heat Map** — hot, warm, expected, cool, cold

### Games

Game history keeps finished sessions around for later review or export.

- New game
- Active badge
- JSON export
- Delete game + associated rolls
- Newest-first ordering

### Settings

- StandBy Mode
- Keep Screen Awake
- Current game information
- Reset rolls
- Clear all local data
- App version
- Online/offline state

---

## 🏗️ Architecture

```mermaid
flowchart TB
    HTML[index.html] --> Main[main.tsx]
    Main --> App[App.tsx]
    App --> Gate[Install Gate]

    Gate --> Tracker[/ Tracker]
    Gate --> Stats[/stats Statistics]
    Gate --> Games[/games History]
    Gate --> Settings[/settings Settings]

    Tracker --> UseGame[useGame]
    Stats --> UseGame
    Games --> IDB[(IndexedDB)]
    Settings --> UseSettings[useSettings]
    Tracker --> WakeLock[useWakeLock]

    UseGame --> IDB
    UseSettings --> LS[(localStorage)]
    WakeLock --> Browser[Wake Lock API]
```

### Data model

```ts
interface Game {
  id: string;
  name: string;
  playerCount: number;
  players: string[];
  createdAt: number;
  updatedAt: number;
  endedAt?: number;
  isActive: boolean;
}

interface Roll {
  id: string;
  gameId: string;
  value: number;
  timestamp: number;
  playerIndex?: number;
}
```

Turn assignment is deterministic:

```ts
playerIndex = rolls.length % playerCount;
```

---

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5.6 (strict) |
| Build | Vite 5 |
| Routing | wouter 3 |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui + Radix |
| Charts | Recharts 2 |
| Carousel | Embla Carousel |
| Drawer | Vaul |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Dates | date-fns 3 |
| Storage | idb 8 + IndexedDB |
| PWA | vite-plugin-pwa + Workbox |

---

## 📂 Recommended repository structure

```text
catan-dice-tracker/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── public/
│   └── icons/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── docs/
├── README.md
├── SPEC.md
├── CONTRIBUTING.md
├── SECURITY.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

---

## 💾 Offline-first architecture

### IndexedDB

Database:

```text
catan-dice-tracker
```

Version: `1`

Object stores:

- `games`
- `rolls`

Indexes:

- `games.createdAt`
- `rolls.gameId`
- `rolls.timestamp`

### localStorage

Settings are persisted under:

```text
catan-settings
```

```ts
interface Settings {
  tableMode: boolean;
  wakeLock: boolean;
}
```

### Privacy model

Core functionality requires none of the following:

- Authentication
- Backend API
- Database server
- User account
- Cloud game state

---

## 📱 PWA behavior

### Install gate

The application is designed to run as an installed standalone PWA.

Supported detection mechanisms include:

- `display-mode: standalone`
- iOS `navigator.standalone`
- Android app referrer detection

Platform-specific install guidance can be shown for:

- iOS Safari
- Android Chrome
- Other install-capable browsers

### Manifest

```json
{
  "name": "Catan Dice Tracker",
  "short_name": "Catan Dice",
  "description": "Premium Catan dice roll tracker",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#0a0a0f",
  "background_color": "#0a0a0f",
  "start_url": "/",
  "scope": "/"
}
```

### Service worker

Workbox is configured for an offline-first application shell with automatic updates.

Google Fonts, when used, can be cached with a long-lived CacheFirst runtime strategy.

---

## 🎨 Design system

The visual language is deliberately dark, tactile, and table-friendly.

### Core tokens

```css
--background: hsl(240 10% 4%);
--foreground: #ffffff;
--primary: hsl(32 95% 60%);
--radius: 1.25rem;
```

### Principles

- Dark-only interface
- Warm Catan-orange accent
- Glassmorphism panels
- Large touch targets
- Safe-area support
- `100dvh` layouts
- Minimal chrome
- Motion with purpose
- Mobile-first by default

---

## 🚀 Development

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

Default address:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview

```bash
npm run serve
```

### Type checking

```bash
npm run typecheck
```

---

## ⚙️ Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5173` | Dev/preview port |
| `BASE_PATH` | `/` | Deployment base path |

---

## ✅ Quality gates

The recommended local release flow is:

```text
npm run typecheck
        ↓
npm run build
        ↓
Install/test the PWA
        ↓
Deploy
```

The repository includes a GitHub Actions workflow that runs type checking and a production build for pushes and pull requests.

---

## 🗺️ Roadmap

- [ ] Resume/switch a previous game
- [ ] CSV export UI
- [ ] Optional game-ending flow
- [ ] Richer probability analytics
- [ ] Session summaries
- [ ] Import/share game exports
- [ ] Optional local backup
- [ ] Optional multi-device sync
- [ ] Robber tracking
- [ ] Development card tracking

The core product will remain local-first even as optional features evolve.

---

## ⚠️ Current limitations

| Feature | Status |
|---|---|
| `endGame()` | Implemented in logic, not exposed |
| CSV export | Logic exists, JSON is the public export |
| Switch old game to active | Not supported |
| Multi-device sync | Not supported |
| Light theme | Not supported |
| Robber tracking | Out of scope |
| Development card tracking | Out of scope |

---

## 🤝 Contributing

Contributions, bug reports, ideas, and UI improvements are welcome.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the development and pull-request workflow.

---

## 🔒 Security & privacy

See [`SECURITY.md`](SECURITY.md).

The product intentionally minimizes data movement by keeping core game state on-device.

---

## 📄 Specification

The full functional and technical specification is maintained in [`SPEC.md`](SPEC.md).

---

## 📜 License

Add the project's chosen license file before publishing the repository publicly.

---

<div align="center">

**Built for the table. Made for the dice. 🎲**

</div>
