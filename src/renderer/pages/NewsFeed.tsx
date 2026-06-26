import { useEffect, useState } from 'react'
import { Newspaper, ExternalLink } from 'lucide-react'
import { Section } from '../components/Stat'
import { useBrowserStore } from '../store/useBrowserStore'
import type { NewsItem } from '@shared/types'

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const { setInternalPage } = useBrowserStore()
  useEffect(() => { window.hexacore.integrations.news().then(setNews) }, [])

  return (
    <div className="p-8">
      <Section title="Gaming News">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {news.map((n) => (
            <button key={n.id} onClick={() => { window.hexacore.tab.create(n.url); setInternalPage(null) }}
              className="card flex gap-3 text-left hover:shadow-neon">
              <Newspaper className="h-5 w-5 shrink-0 text-hex-neon" />
              <div className="flex-1">
                <p className="text-sm">{n.title}</p>
                <span className="text-[11px] text-hex-muted">{n.source} · {new Date(n.publishedAt).toLocaleDateString()}</span>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-hex-muted" />
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
