import { Session } from 'electron'
import { getDb } from '../db/database'
import { AD_HOSTS, TRACKER_HOSTS, PHISHING_PATTERNS, hostMatches } from './blocklists'
import { Settings } from '../services/settings'
import type { SecurityStats } from '@shared/types'

function bump(key: keyof SecurityStats, by = 1) {
  getDb().prepare('UPDATE security_stats SET value = value + ? WHERE key = ?').run(by, key)
}

export function getSecurityStats(): SecurityStats {
  const rows = getDb().prepare('SELECT key,value FROM security_stats').all() as { key: string; value: number }[]
  const out: any = { adsBlocked: 0, trackersBlocked: 0, httpsUpgrades: 0, phishingBlocked: 0 }
  for (const r of rows) out[r.key] = r.value
  return out
}

export function isPhishing(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return PHISHING_PATTERNS.some((re) => re.test(host) || re.test(url))
  } catch {
    return false
  }
}

// Attach request filtering + HTTPS upgrade to a session partition.
// Electron permits ONE onBeforeRequest listener per session, so all rules live here.
export function applySecurity(session: Session): void {
  session.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, cb) => {
    const s = Settings.getAll()
    const { url, resourceType } = details

    // 1) Anti-phishing (top-level only)
    if (s.antiPhishing && resourceType === 'mainFrame' && isPhishing(url)) {
      bump('phishingBlocked')
      return cb({ redirectURL: `hexacore://blocked?reason=phishing&url=${encodeURIComponent(url)}` })
    }

    // 2) HTTPS enforcement (upgrade insecure top-level navigations)
    if (s.httpsOnly && resourceType === 'mainFrame' && url.startsWith('http://')) {
      bump('httpsUpgrades')
      return cb({ redirectURL: url.replace(/^http:/, 'https:') })
    }

    // 3) Ad blocking
    if (s.adBlock && hostMatches(url, AD_HOSTS)) {
      bump('adsBlocked')
      return cb({ cancel: true })
    }

    // 4) Tracker blocking
    if (s.trackerBlock && hostMatches(url, TRACKER_HOSTS)) {
      bump('trackersBlocked')
      return cb({ cancel: true })
    }

    cb({})
  })
}
