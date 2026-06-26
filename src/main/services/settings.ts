import { getDb } from '../db/database'
import type { AppSettings } from '@shared/types'
import { safeJsonParse } from '@shared/utils'
import { ResourceLimiter } from '../gaming/resource-limiter'

const DEFAULTS: AppSettings = {
  theme: 'neon-blue',
  searchEngine: 'duckduckgo',
  homepage: 'hexacore://dashboard',
  adBlock: true,
  trackerBlock: true,
  httpsOnly: true,
  antiPhishing: true,
  rgbEffects: true,
  fpsOverlay: true,
  hardwareAcceleration: true,
  resourceLimiter: false
}

export const Settings = {
  getAll(): AppSettings {
    const rows = getDb().prepare('SELECT key,value FROM settings').all() as { key: string; value: string }[]
    const stored: Record<string, unknown> = {}
    for (const r of rows) stored[r.key] = safeJsonParse(r.value, null)
    return { ...DEFAULTS, ...stored } as AppSettings
  },

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings {
    getDb()
      .prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=?')
      .run(key, JSON.stringify(value), JSON.stringify(value))
    this.applySideEffects(key, value)
    return this.getAll()
  },

  applySideEffects<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    if (key === 'resourceLimiter') {
      ResourceLimiter.set({ enabled: value as boolean })
    }
  }
}
