export type InternalPageId =
  | 'dashboard'
  | 'bookmarks'
  | 'history'
  | 'downloads'
  | 'games'
  | 'settings'
  | 'profiles'
  | 'passwords'
  | 'news'
  | 'integrations'

export const INTERNAL_PAGES: Record<string, { page: InternalPageId; title: string }> = {
  dashboard: { page: 'dashboard', title: 'Dashboard' },
  news: { page: 'news', title: 'Gaming News' },
  settings: { page: 'settings', title: 'Settings' },
  bookmarks: { page: 'bookmarks', title: 'Bookmarks' },
  history: { page: 'history', title: 'History' },
  downloads: { page: 'downloads', title: 'Downloads' },
  games: { page: 'games', title: 'Game Launcher' },
  profiles: { page: 'profiles', title: 'Profiles' },
  passwords: { page: 'passwords', title: 'Password Vault' },
  integrations: { page: 'integrations', title: 'Integrations' }
}

export interface BlockedInfo {
  reason: string
  url: string
}

export type ParsedHexacoreUrl =
  | { type: 'page'; page: InternalPageId; title: string }
  | { type: 'blocked'; reason: string; url: string }
  | { type: 'oauth'; provider: string; code?: string; state?: string }
  | { type: 'unknown' }

export function parseHexacoreUrl(raw: string): ParsedHexacoreUrl {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'hexacore:') return { type: 'unknown' }

    const host = u.hostname || u.pathname.replace(/^\//, '').split('/')[0]
    const pathParts = u.pathname.replace(/^\//, '').split('/').filter(Boolean)

    if (host === 'blocked' || pathParts[0] === 'blocked') {
      return {
        type: 'blocked',
        reason: u.searchParams.get('reason') ?? 'blocked',
        url: decodeURIComponent(u.searchParams.get('url') ?? '')
      }
    }

    if (host === 'oauth' || pathParts[0] === 'oauth') {
      const provider = pathParts[1] ?? pathParts[0] ?? ''
      return {
        type: 'oauth',
        provider,
        code: u.searchParams.get('code') ?? undefined,
        state: u.searchParams.get('state') ?? undefined
      }
    }

    const pageKey = host || pathParts[0]
    const meta = INTERNAL_PAGES[pageKey]
    if (meta) return { type: 'page', page: meta.page, title: meta.title }

    return { type: 'unknown' }
  } catch {
    return { type: 'unknown' }
  }
}

export function internalUrlLabel(url: string): string {
  const parsed = parseHexacoreUrl(url)
  if (parsed.type === 'page') return parsed.title
  if (parsed.type === 'blocked') return 'Blocked page'
  return url
}
