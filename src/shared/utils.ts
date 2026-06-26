export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function buildSearchUrl(engine: 'google' | 'duckduckgo' | 'bing', query: string): string {
  const q = encodeURIComponent(query)
  switch (engine) {
    case 'google':
      return `https://www.google.com/search?q=${q}`
    case 'bing':
      return `https://www.bing.com/search?q=${q}`
    default:
      return `https://duckduckgo.com/?q=${q}`
  }
}
