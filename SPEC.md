# Catan Dice Tracker — Product & Technical Specification

## 1. Product overview

Catan Dice Tracker is a mobile-first, offline-first Progressive Web App for recording Catan dice rolls and comparing observed results with the theoretical distribution of two six-sided dice.

### Product principles

1. One-tap input.
2. Local-first storage.
3. Fast enough for live table use.
4. Installable as a PWA.
5. Useful statistics without interrupting gameplay.

## 2. Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Tracker | Primary dice input |
| `/stats` | Statistics | Swipeable analytics |
| `/games` | History | Saved games, export, deletion |
| `/settings` | Settings | Preferences and data controls |
| `*` | Not Found | 404 fallback |

Bottom navigation is fixed, safe-area aware, 68px high, and hidden during StandBy mode.

## 3. Game management

### New game

- Name defaults to `Game {locale date}` with `Catan Game` as fallback.
- Player count: 2–6.
- Names default to `Player 1`, `Player 2`, etc.
- Exactly one game may be active.
- Existing games remain in history.

### Reset rolls

Resetting creates a new game record with the same player metadata and deactivates the old record. The old rolls remain in history.

### Active game

Tracker, Statistics, and Settings read from the single active game.

## 4. Data model

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

## 5. Tracker

### Empty state

Show:

- large `7` visual
- concise description
- Start New Game CTA

### Active state

Header:

- game name
- current player / single-player label
- roll count
- elapsed time
- StandBy button

Main:

- animated last roll
- dice grid
- undo
- reset

Dice grid:

```text
2  3  4
5  6  7  8
9 10 11 12
```

### Interaction

- Tap logs the roll.
- `whileTap` scale is approximately `0.92`.
- Optional 50ms haptic vibration.
- Active touch feedback is short and immediate.

### Turn rotation

```ts
playerIndex = rolls.length % playerCount;
```

## 6. StandBy / Table Mode

Landscape, fullscreen-oriented table experience.

Left side:

- dice numpad

Right side:

- live distribution chart

Header:

- last roll
- roll count
- exit control

Behavior:

- navigation hidden
- wake lock enabled while active
- `.standby-*` CSS namespace used for mode-specific styling

## 7. Statistics

Four Embla carousel screens plus direct tab navigation.

### Overview

- total rolls
- average
- most common
- least common
- 7 count
- 7 frequency
- expected 7 frequency (~16.7%)

### Distribution

Compare actual counts with:

```ts
expected = totalRolls * CATAN_PROBABILITIES[value];
```

Highlighting:

- 7 → primary orange
- actual > expected × 1.2 → over-indexed
- actual < expected × 0.8 → under-indexed
- otherwise → neutral

### Timeline

Newest first. Every event contains:

- value
- roll number
- player name
- timestamp

### Heat map

```ts
ratio = actual / expected;
```

Labels:

| Ratio | Label |
|---:|---|
| `> 1.5` | Hot |
| `> 1.1` | Warm |
| `~ 1.0` | Expected |
| `< 0.9` | Cool |
| `< 0.5` | Cold |

Seven is always visually special.

## 8. Game history

Newest first.

Card contents:

- name
- date
- player count
- active badge when applicable

Actions:

- create new game
- export JSON
- delete game

Delete cascades to associated rolls.

CSV format, when exposed:

```text
Roll ID,Value,Timestamp,Player
{id},{value},{ISO timestamp},{player name}
```

## 9. Settings

Display:

- StandBy Mode
- Keep Screen Awake

Current Game:

- name
- player count
- Reset Rolls

Data & App:

- app version
- Clear All Data
- Online/Offline status

## 10. Persistence

### IndexedDB

Database: `catan-dice-tracker`

Version: `1`

Stores:

- `games` keyed by `id`, indexed by `createdAt`
- `rolls` keyed by `id`, indexed by `gameId` and `timestamp`

Operations:

- `createGame`
- `getActiveGame`
- `getAllGames`
- `addRoll`
- `deleteLastRoll`
- `deleteGame`
- `exportGameData`

### localStorage

Key: `catan-settings`

```ts
interface Settings {
  tableMode: boolean;
  wakeLock: boolean;
}
```

## 11. Probability engine

```ts
const CATAN_PROBABILITIES = {
  2: 1 / 36,
  3: 2 / 36,
  4: 3 / 36,
  5: 4 / 36,
  6: 5 / 36,
  7: 6 / 36,
  8: 5 / 36,
  9: 4 / 36,
  10: 3 / 36,
  11: 2 / 36,
  12: 1 / 36,
};
```

`calcStats(rolls)` returns:

```ts
{
  total: number;
  avg: number;
  mostCommon: number;
  leastCommon: number;
  sevenCount: number;
  sevenPercent: number;
  distribution: Record<number, number>;
}
```

## 12. PWA

Manifest:

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

Service worker:

- autoUpdate
- application-shell precache
- runtime caching for Google Fonts if used

## 13. Accessibility

- `aria-label` on icon-only controls
- `aria-live="polite"` for the StandBy last-roll region
- large touch targets
- semantic controls
- visible focus treatment
- support reduced motion where practical

## 14. Responsive design

- mobile-first
- tracker constrained to approximately `max-w-lg`
- StandBy optimized for landscape
- `100dvh` for viewport height
- notch/safe-area support

## 15. Technical stack

- React 18
- TypeScript 5.6 strict
- Vite 5
- wouter 3
- Tailwind CSS v4
- shadcn/ui / Radix
- Recharts 2
- Embla Carousel
- Vaul
- Framer Motion 11
- Lucide React
- date-fns 3
- idb 8
- vite-plugin-pwa / Workbox

## 16. Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | TypeScript + production build |
| `npm run serve` | Preview production build |
| `npm run typecheck` | TypeScript validation |

## 17. Environment

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5173` | Development / preview port |
| `BASE_PATH` | `/` | Vite deployment base |

## 18. Known gaps

| Item | Status |
|---|---|
| `endGame()` | Logic exists, UI not exposed |
| CSV export | Code exists, UI not exposed |
| Game switching | Not supported |
| Multi-device sync | Not supported |
| Light mode | Not supported |
| Robber tracking | Out of scope |
| Development card tracking | Out of scope |
