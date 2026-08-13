<div align="center">

![Catan Dice Tracker Banner](/images/hero-banner.png)

# 🎲 Catan Dice Tracker

> A premium, offline-first Progressive Web App (PWA) for tracking Catan dice rolls, player turns, and probability statistics in real time.

![PWA](https://img.shields.io/badge/PWA-Offline--First-F39A2D?style=for-the-badge&logo=pwa&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Tap. Track. Analyze.**

Built for the table, designed for the phone, completely local.

</div>

---

## ✨ The Problem It Solves

During almost every game of Catan, someone eventually says:

> “There is *no way* we've rolled this many 7s.”

Or:

> “Why is nobody rolling a 6 or an 8?”

**Catan Dice Tracker** gives the table an immediate, mathematical answer. Every single roll is logged, attributed to the current player, and instantly reflected across the live distribution charts, game timeline, and probability analysis. 

### Zero Friction. Zero Cloud.
It is designed around one core principle: **one tap should be enough to record a roll.** Everything else should feel effortless. Your game data stays entirely on your device using IndexedDB. No accounts, no servers, and absolutely no cloud dependencies. 

---

## 🚀 Features at a Glance

| Feature | What it does |
|---|---|
| 🎲 **Effortless Tracking** | One-tap rolls (2–12) with automatic player rotation for 2–6 players. |
| ⏱️ **Game Metrics** | Tracks total roll counts and features a live game timer. |
| 🔄 **Corrections** | Easily undo the last roll or reset the board while keeping your player setup. |
| 🖥️ **StandBy Mode** | A dedicated, always-on landscape view for the center of the table. |
| 📊 **Deep Statistics** | Swipe through an overview, actual vs. expected distribution, timeline, and heat map. |
| 🗂️ **Game History** | Keep, review, and export previous gaming sessions to JSON. |
| 📴 **Offline-First** | Core app runs perfectly without an internet connection. |
| 🔋 **Table-Ready** | Screen Wake Lock support keeps your phone from going to sleep mid-turn. |
| 🍊 **Aesthetic UI** | A dark glassmorphism interface with Catan-inspired orange accents. |

---

## 🧭 The App Experience

### The Tracker
Optimized for rapid, mid-game use. We use large touch targets, Catan-style probability pips, and animated haptic feedback so you can log rolls without losing focus on the board. 

![Tracker View Screenshot](/images/tracker-view.png)

### StandBy / Table Mode
A dedicated landscape layout meant to sit on the physical game table. The navigation bar disappears, wake lock activates, and the entire table gets a live look at the dice distribution.

![Standby Mode Screenshot](/images/standby-mode.png)

### Analytical Views
Swipe through four distinct statistical breakdowns:
* **Overview:** Totals, averages, and the frequency of the dreaded 7.
* **Distribution:** Actual table rolls versus the mathematical expected probability.
* **Timeline:** Chronological feed of the newest rolls with player tags and timestamps.
* **Heat Map:** Visual breakdown of hot, warm, expected, cool, and cold numbers.

![Statistics View Screenshot](/images/stats-view.png)

---

## 📊 The Probability Engine

The app doesn't just count numbers; it compares your real-world luck against the exact theoretical distribution of two standard six-sided dice.

| Roll | Probability | Pips |
|---:|---:|:---:|
| 2 or 12 | 2.78% | ● |
| 3 or 11 | 5.56% | ●● |
| 4 or 10 | 8.33% | ●●● |
| 5 or 9 | 11.11% | ●●●● |
| 6 or 8 | 13.89% | ●●●●● |
| **7** | **16.67%** | **●●●●●●** |

The app dynamically calculates expected counts (`expectedCount = totalRolls * CATAN_PROBABILITIES[value]`) to power the live distribution charts.

---

## 🏗️ Architecture & Tech Stack

Catan Dice Tracker is built with a modern, local-first stack designed for speed and reliability.

| Layer | Technology |
|---|---|
| **Core** | React 18, TypeScript 5.6 (strict), Vite 5 |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui, Radix, Framer Motion 11 |
| **Data Visualization**| Recharts 2 |
| **Storage & State** | idb 8 (IndexedDB), localStorage |
| **PWA & Offline** | vite-plugin-pwa, Workbox |

### Data Flow

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

## 🛠️ Getting Started (Development)

Want to run it locally or contribute? It's incredibly straightforward. 

**Requirements:** Node.js 20+ and npm.

```bash
# Clone and install dependencies
npm install

# Start the development server (Defaults to http://localhost:5173)
npm run dev

# Run type checking
npm run typecheck

# Build for production
npm run build
```

---

## 🗺️ Roadmap & Limitations

We are continually improving the tracker while staying true to our local-first philosophy.

**Coming Soon:**
* Resume or switch to a previously paused game
* CSV export UI (JSON is currently supported)
* End-game flow and session summaries
* Optional local backups and multi-device sync

**Current Limitations:**
* Light theme is not supported (dark mode only to save battery at the table).
* Robber and Development Card tracking are currently out of scope to keep the UI uncluttered.

---

## 🤝 Contributing & Privacy

Got an idea to make game night even better? Bug reports, feature ideas, and UI tweaks are always welcome. Check out [`CONTRIBUTING.md`](CONTRIBUTING.md) for our pull-request workflow.

**A note on Privacy:** See [`SECURITY.md`](SECURITY.md). We intentionally minimize data movement. Everything you track stays on your device. Period. 

---

<div align="center">

**Built for the table. Made for the dice. 🎲**

</div>
