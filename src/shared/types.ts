export interface TabState {
  id: string
  title: string
  url: string
  favicon: string | null
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
  secure: boolean
  active: boolean
}

export interface Bookmark {
  id: number
  title: string
  url: string
  favicon: string | null
  folder: string
  createdAt: number
}

export interface HistoryEntry {
  id: number
  title: string
  url: string
  favicon: string | null
  visitedAt: number
  visitCount: number
}

export type DownloadStatus = 'progressing' | 'paused' | 'completed' | 'cancelled' | 'interrupted'

export interface DownloadItem {
  id: string
  filename: string
  url: string
  savePath: string
  received: number
  total: number
  status: DownloadStatus
  startedAt: number
}

export interface Profile {
  id: string
  name: string
  avatarColor: string
  partition: string
  isActive: boolean
  createdAt: number
}

export interface PasswordEntry {
  id: number
  origin: string
  username: string
  // password never leaves main unencrypted except on explicit reveal
  password?: string
  updatedAt: number
}

export interface AppSettings {
  theme: 'neon-blue' | 'neon-purple' | 'neon-green'
  searchEngine: 'google' | 'duckduckgo' | 'bing'
  homepage: string
  adBlock: boolean
  trackerBlock: boolean
  httpsOnly: boolean
  antiPhishing: boolean
  rgbEffects: boolean
  fpsOverlay: boolean
  hardwareAcceleration: boolean
  resourceLimiter: boolean
}

export interface ResourceStats {
  cpu: number              // %
  cpuTemp: number | null   // C
  ramUsed: number          // MB
  ramTotal: number         // MB
  gpu: number              // %
  gpuMem: number           // %
  gpuTemp: number | null   // C
  netDown: number          // KB/s
  netUp: number            // KB/s
  fps: number
}

export interface ResourceLimits {
  cpuMaxPercent: number    // throttle target
  ramMaxMB: number
  netDownMaxKBps: number
  netUpMaxKBps: number
  fpsCap: number
  enabled: boolean
}

export interface GameEntry {
  id: string
  name: string
  platform: 'steam' | 'epic' | 'local'
  installPath: string
  cover: string | null
  launchArgs: string
  lastPlayed: number | null
}

export interface SecurityStats {
  adsBlocked: number
  trackersBlocked: number
  httpsUpgrades: number
  phishingBlocked: number
}

export interface IntegrationStatus {
  discord: { connected: boolean; username?: string }
  twitch: { connected: boolean; username?: string }
  steam: { connected: boolean; username?: string }
}

export interface BlockedInfo {
  reason: string
  url: string
}

export type PasswordRevealResult =
  | { ok: true; password: string }
  | { ok: false; reason: string }

export type GameLaunchResult =
  | { ok: true }
  | { ok: false; error: string }

export interface UpdateStatusPayload {
  state: 'checking' | 'available' | 'none' | 'downloading' | 'ready' | 'error'
  version?: string
  percent?: number
  message?: string
}

export interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  publishedAt: number
  thumbnail: string | null
}
