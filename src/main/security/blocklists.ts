// Seed blocklists. In production these are refreshed from EasyList / EasyPrivacy /
// uBlock filter sources on a schedule. Matching is host-substring based for speed.
export const AD_HOSTS: string[] = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'adservice.google.com',
  'g.doubleclick.net', 'pagead2.googlesyndication.com', 'ads.yahoo.com', 'adnxs.com',
  'amazon-adsystem.com', 'taboola.com', 'outbrain.com', 'criteo.com', 'pubmatic.com',
  'rubiconproject.com', 'openx.net', 'adform.net', 'media.net', 'moatads.com', 'adroll.com'
]

export const TRACKER_HOSTS: string[] = [
  'google-analytics.com', 'analytics.google.com', 'googletagmanager.com', 'connect.facebook.net',
  'facebook.com/tr', 'hotjar.com', 'mixpanel.com', 'segment.com', 'segment.io', 'fullstory.com',
  'amplitude.com', 'mouseflow.com', 'crazyegg.com', 'scorecardresearch.com', 'quantserve.com',
  'bat.bing.com', 'snap.licdn.com', 'analytics.tiktok.com', 'branch.io', 'newrelic.com'
]

// Known-bad / look-alike phishing patterns (illustrative seed set).
export const PHISHING_PATTERNS: RegExp[] = [
  /paypa1|paypaI|secure-paypal-\w+/i,
  /g00gle|goggle-login|google-verify-\w+/i,
  /app1e|apple-id-verify|icloud-secure-\w+/i,
  /micros0ft|outlook-verify-\w+/i,
  /steamcommunity\.(?!com)/i,
  /-account-recovery\.(tk|ml|ga|cf|gq)$/i,
  /(login|signin|verify|update|secure)-[a-z0-9]+\.(tk|ml|ga|cf|gq|xyz)$/i
]

export function hostMatches(url: string, list: string[]): boolean {
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    return false
  }
  return list.some((h) => host === h || host.endsWith('.' + h) || url.includes(h))
}
