# HexaCore 🎮

A gaming-focused web browser built on **Electron + Chromium**, with a **React + TypeScript + Tailwind** UI and **SQLite** local storage. Black-and-neon-blue theme, animated sidebar, RGB frame, live hardware monitors, a resource limiter, game launcher, security suite, and platform integrations.

> Research preview (v0.1). Core browsing, monitors, security filtering, profiles, bookmarks/history/downloads, password vault, and the game launcher are functional. Discord/Twitch/Steam OAuth, cloud sync, and the extension marketplace are scaffolded for later milestones (see ROADMAP.md).

## Stack

| Layer | Tech |
|---|---|
| Shell / engine | Electron 32 (Chromium), `WebContentsView` per tab |
| UI | React 18, TypeScript, Tailwind CSS, lucide-react, zustand |
| Backend (main process) | Node.js, IPC services |
| Storage | SQLite via `node-sqlite3-wasm` (WebAssembly, zero native build) |
| Hardware telemetry | `systeminformation` |
| Build / packaging | electron-vite + electron-builder |

## Project structure

```
hexacore/
├── electron.vite.config.ts      # build config for main / preload / renderer
├── electron-builder.yml         # installer / packaging config
├── tailwind.config.js
├── index.html
├── src/
│   ├── shared/                  # types + IPC channel registry (main ⇄ renderer)
│   │   ├── types.ts
│   │   └── ipc-channels.ts
│   ├── main/                    # ── BACKEND (Electron main process) ──
│   │   ├── main.ts              # app bootstrap, GPU flags, download capture
│   │   ├── window-manager.ts    # frameless BrowserWindow lifecycle
│   │   ├── tab-manager.ts       # tabbed browsing via WebContentsView
│   │   ├── ipc.ts               # all ipcMain handlers
│   │   ├── preload.ts           # contextBridge → window.hexacore
│   │   ├── db/
│   │   │   └── database.ts      # SQLite schema + connection
│   │   ├── services/            # bookmarks, history, downloads, profiles,
│   │   │   │                    # settings, passwords (AES-256-GCM vault)
│   │   ├── security/            # ad/tracker blocker, HTTPS, anti-phishing
│   │   ├── gaming/              # resource monitor, limiter, game launcher
│   │   └── integrations/        # discord/twitch/steam, gaming news feed
│   └── renderer/                # ── FRONTEND (React) ──
│       ├── App.tsx              # layout + tab/page orchestration
│       ├── store/               # zustand global state
│       ├── components/          # Sidebar, TabBar, Toolbar, FpsOverlay, …
│       └── pages/               # Dashboard, Settings, GameLauncher, …
└── ROADMAP.md
```

### Architecture notes

- **Tabs** are native `WebContentsView` instances managed in `tab-manager.ts` and positioned beneath the React chrome (the renderer reports its insets over IPC). This is the modern, secure replacement for `<webview>`.
- **Internal pages** (Dashboard, Settings, etc.) are React views rendered over the content region; the active web view is hidden while an internal page is shown.
- **Security** runs in `applySecurity(session)` — a single `onBeforeRequest` filter handles phishing redirects, HTTPS upgrades, and ad/tracker cancellation, with counters persisted to SQLite.
- **Profiles** map to isolated Electron session partitions (`persist:profile-<id>`), so cookies/cache/logins never leak between them.
- **Passwords** are encrypted with AES-256-GCM; the 256-bit master key is sealed at rest by the OS keychain via Electron `safeStorage`.

## Prerequisites

- Node.js ≥ 18 (any version works — 20/22 LTS recommended)
- npm ≥ 9

No C++ compiler or Visual Studio Build Tools are required: storage uses
**node-sqlite3-wasm** (SQLite compiled to WebAssembly), so there are no native
modules to build.

## Install & run

```bash
npm install
npm run dev          # hot-reloading dev build (main + preload + renderer)
```

## Windows one-click scripts

For Windows users who don't want to type npm commands, three batch files are included:

| Script | What it does |
|---|---|
| `install.bat` | Checks Node/npm, installs deps, builds, and packages the NSIS installer into `dist\`. Offers to launch the setup `.exe`. |
| `update.bat` | `git pull` (if a checkout) → reinstall deps → rebuild → repackage the installer. |
| `dev.bat` | Installs deps on first run, then starts HexaCore in hot-reload dev mode. |

Just double-click `install.bat` to produce **`dist\HexaCore Setup <version>.exe`**.

### In-app auto-update

Packaged builds check for new releases on launch via `electron-updater` (`src/main/updater.ts`) and install them on quit. Set the `publish` feed in `electron-builder.yml` (GitHub releases by default) to enable it.

## Build a distributable

```bash
npm run build        # compile to ./out
npm run dist         # package installer for the current OS → ./dist
# or target a platform:
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Configuration (optional)

Integrations use OAuth and read client IDs from the environment so no secrets ship in the repo:

```bash
HEXACORE_DISCORD_CLIENT_ID=...
HEXACORE_TWITCH_CLIENT_ID=...
HEXACORE_STEAM_API_KEY=...
```

Register each app with its provider and set the redirect URI to `hexacore://oauth/<provider>`.

## Keyboard / UX

- Hover the left rail to expand the animated sidebar.
- `+` in the tab bar opens a new tab; the address bar accepts URLs or search queries.
- Toggle the FPS overlay, RGB frame, and resource limiter in **Settings**.

## License

MIT
