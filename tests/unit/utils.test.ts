import { describe, it, expect } from 'vitest'
import { safeJsonParse, buildSearchUrl } from '../../src/shared/utils'
import { parseHexacoreUrl } from '../../src/shared/internal-urls'
import { hostMatches } from '../../src/main/security/blocklists'
import { parseLibraryFolders } from '../../src/main/gaming/game-launcher'

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 })
  })
  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('{bad', { x: 0 })).toEqual({ x: 0 })
  })
})

describe('buildSearchUrl', () => {
  it('builds duckduckgo URL', () => {
    expect(buildSearchUrl('duckduckgo', 'hexacore')).toBe('https://duckduckgo.com/?q=hexacore')
  })
  it('builds google URL', () => {
    expect(buildSearchUrl('google', 'test query')).toBe('https://www.google.com/search?q=test%20query')
  })
  it('builds bing URL', () => {
    expect(buildSearchUrl('bing', 'games')).toBe('https://www.bing.com/search?q=games')
  })
})

describe('parseHexacoreUrl', () => {
  it('parses dashboard', () => {
    expect(parseHexacoreUrl('hexacore://dashboard')).toEqual({
      type: 'page', page: 'dashboard', title: 'Dashboard'
    })
  })
  it('parses blocked URL', () => {
    const r = parseHexacoreUrl('hexacore://blocked?reason=phishing&url=https%3A%2F%2Fevil.test')
    expect(r.type).toBe('blocked')
    if (r.type === 'blocked') {
      expect(r.reason).toBe('phishing')
      expect(r.url).toBe('https://evil.test')
    }
  })
  it('parses oauth URL', () => {
    const r = parseHexacoreUrl('hexacore://oauth/discord?code=abc&state=xyz')
    expect(r.type).toBe('oauth')
    if (r.type === 'oauth') {
      expect(r.provider).toBe('discord')
      expect(r.code).toBe('abc')
    }
  })
})

describe('hostMatches', () => {
  it('matches ad host subdomains', () => {
    expect(hostMatches('https://ads.doubleclick.net/foo', ['doubleclick.net'])).toBe(true)
  })
  it('returns false for clean host', () => {
    expect(hostMatches('https://example.com', ['doubleclick.net'])).toBe(false)
  })
})

describe('parseLibraryFolders', () => {
  it('returns empty for missing file', () => {
    expect(parseLibraryFolders('C:/nonexistent/libraryfolders.vdf')).toEqual([])
  })
})
