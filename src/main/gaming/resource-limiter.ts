import { app, BrowserWindow } from 'electron'
import { getDb } from '../db/database'
import { safeJsonParse } from '@shared/utils'
import type { ResourceLimits } from '@shared/types'

const DEFAULTS: ResourceLimits = {
  cpuMaxPercent: 80,
  ramMaxMB: 4096,
  netDownMaxKBps: 0,
  netUpMaxKBps: 0,
  fpsCap: 144,
  enabled: false
}

export const ResourceLimiter = {
  get(): ResourceLimits {
    const row = getDb().prepare("SELECT value FROM settings WHERE key='resourceLimits'").get() as { value: string } | undefined
    return row ? { ...DEFAULTS, ...safeJsonParse(row.value, {}) } : DEFAULTS
  },

  set(limits: Partial<ResourceLimits>): ResourceLimits {
    const next = { ...this.get(), ...limits }
    getDb()
      .prepare("INSERT INTO settings(key,value) VALUES ('resourceLimits',?) ON CONFLICT(key) DO UPDATE SET value=?")
      .run(JSON.stringify(next), JSON.stringify(next))
    this.apply(next)
    return next
  },

  apply(limits: ResourceLimits): void {
    for (const win of BrowserWindow.getAllWindows()) {
      const rate = limits.enabled ? Math.min(Math.max(limits.fpsCap, 30), 240) : 240
      win.webContents.setFrameRate(rate)
      win.webContents.setBackgroundThrottling(limits.enabled)
      if (limits.enabled && (limits.netDownMaxKBps > 0 || limits.netUpMaxKBps > 0)) {
        win.webContents.session.enableNetworkEmulation({
          downloadThroughput: limits.netDownMaxKBps * 1024,
          uploadThroughput: limits.netUpMaxKBps * 1024,
          latency: 0
        })
      } else {
        win.webContents.session.disableNetworkEmulation()
      }
    }
  }
}
