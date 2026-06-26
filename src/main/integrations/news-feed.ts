import { net } from 'electron'
import type { NewsItem } from '@shared/types'

// Pulls headlines from public gaming RSS feeds. Falls back to a curated set when
// offline so the dashboard always renders.
const FEEDS = [
  { source: 'PC Gamer', url: 'https://www.pcgamer.com/rss/' },
  { source: 'Polygon', url: 'https://www.polygon.com/rss/index.xml' }
]

const FALLBACK: NewsItem[] = [
  { id: 'f1', title: 'GPU drivers add frame-generation for 40 more titles', source: 'HexaCore', url: 'hexacore://news', publishedAt: Date.now() - 3600e3, thumbnail: null },
  { id: 'f2', title: 'Steam Summer Sale dates leak ahead of schedule', source: 'HexaCore', url: 'hexacore://news', publishedAt: Date.now() - 7200e3, thumbnail: null },
  { id: 'f3', title: 'New handheld benchmarks: native vs. cloud streaming', source: 'HexaCore', url: 'hexacore://news', publishedAt: Date.now() - 10800e3, thumbnail: null }
]

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = net.request(url)
    let body = ''
    req.on('response', (res) => {
      res.on('data', (c) => (body += c.toString()))
      res.on('end', () => resolve(body))
    })
    req.on('error', reject)
    req.end()
  })
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.split(/<item>|<entry>/).slice(1)
  for (const b of blocks.slice(0, 8)) {
    const title = b.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim()
    const link = b.match(/<link[^>]*>(.*?)<\/link>/s)?.[1]?.trim() || b.match(/<link[^>]*href="([^"]+)"/)?.[1]
    const date = b.match(/<(?:pubDate|updated|published)>(.*?)<\/(?:pubDate|updated|published)>/s)?.[1]
    if (title && link) {
      items.push({
        id: `${source}-${items.length}`,
        title,
        source,
        url: link,
        publishedAt: date ? Date.parse(date) || Date.now() : Date.now(),
        thumbnail: b.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] ?? null
      })
    }
  }
  return items
}

export async function getNews(): Promise<NewsItem[]> {
  try {
    const all = await Promise.all(
      FEEDS.map(async (f) => {
        try {
          return parseRss(await fetchText(f.url), f.source)
        } catch {
          return []
        }
      })
    )
    const merged = all.flat().sort((a, b) => b.publishedAt - a.publishedAt)
    return merged.length ? merged.slice(0, 15) : FALLBACK
  } catch {
    return FALLBACK
  }
}
