# HexaCore — Development Roadmap

A phased path from a working Chromium shell to a full gaming-platform browser.
Status legend: ✅ shipped in v0.1 · 🟡 partial / scaffolded · ⬜ planned

---

## Phase 1 — Basic Chromium browser  ✅
Foundation: a stable, secure tabbed browser.
- ✅ Electron + Chromium shell, frameless neon window
- ✅ Tabbed browsing via `WebContentsView` (back/forward/reload/new/close)
- ✅ Address bar with URL + search detection
- ✅ Bookmarks, history, download manager (SQLite-backed)
- ✅ Multiple isolated user profiles
- ✅ Settings system
- ✅ Security baseline: ad/tracker blocking, HTTPS-only, anti-phishing
- ✅ Password vault (AES-256-GCM + OS keychain)
- **Exit criteria:** browse, manage tabs, and persist data reliably. *Done.*

## Phase 2 — Gaming dashboard  ✅
Turn the homepage into a command center.
- ✅ Custom dashboard with live CPU/GPU/RAM/FPS gauges
- ✅ Security stats, quick-launch tiles, news + recent-games widgets
- ✅ FPS overlay, RGB animated frame, animated sidebar
- **Exit criteria:** at-a-glance system + gaming status. *Done.*

## Phase 3 — Resource limiter (CPU/RAM)  🟡
Keep the browser out of your game's way.
- ✅ Live monitoring (`systeminformation`)
- ✅ FPS cap, network up/down throttle, RAM ceiling, background throttling
- 🟡 True per-process CPU affinity / cgroup-style hard caps
- ⬜ Auto "Game Mode": detect a running game → suspend background tabs
- **Exit criteria:** measurable reduction in browser resource draw while gaming.

## Phase 4 — Discord / Twitch integration  🟡
- 🟡 OAuth2 (PKCE) connect flow + status UI (needs registered client IDs)
- ⬜ Discord Rich Presence ("Browsing in HexaCore")
- ⬜ Twitch live-follow notifications, drops, embedded chat
- ⬜ Steam friends/library/achievements panel
- **Exit criteria:** sign in once, see live social/gaming presence in-app.

## Phase 5 — Game launcher  🟡
- ✅ Steam library auto-detection (parse `appmanifest_*.acf`) + cover art
- ✅ Launch games (Steam protocol / local executables), last-played tracking
- ⬜ Epic / GOG / Xbox library scanners
- ⬜ Playtime stats, per-game launch profiles (apply resource limits on launch)
- **Exit criteria:** one place to see and launch the whole library.

## Phase 6 — AI gaming assistant  ⬜
- ⬜ In-browser sidebar assistant (build guides, patch notes summaries, settings tuning)
- ⬜ Context-aware tips from the page you're on (wiki, store, stream)
- ⬜ Voice command launch ("HexaCore, start Elden Ring")
- **Exit criteria:** ask questions and get game-specific answers without leaving the tab.

## Phase 7 — Cloud sync  ⬜
- ⬜ End-to-end encrypted sync of bookmarks, history, settings, passwords, profiles
- ⬜ Account system + device management
- ⬜ Conflict resolution + offline-first queue
- **Exit criteria:** same setup across machines, zero-knowledge encryption.

## Phase 8 — Extension marketplace  ⬜
- ⬜ Chrome-extension (MV3) loading support
- ⬜ Curated gaming-extension store (overlays, price trackers, mod managers)
- ⬜ Sandboxed permissions + review pipeline
- **Exit criteria:** install and manage extensions from an in-app store.

---

### Cross-cutting tracks (ongoing)
- **Security:** rotate blocklists from EasyList/EasyPrivacy on a schedule; add DNS-over-HTTPS; cert pinning for integrations.
- **Performance:** GPU rasterization tuning, per-tab process limits, memory pressure handling.
- **Accessibility & i18n:** keyboard nav, reduced-motion mode, localization.
- **Testing:** Playwright E2E for tab/navigation flows; unit tests for services; CI packaging on all three OSes.
