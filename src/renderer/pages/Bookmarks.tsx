import { useEffect, useState } from 'react'
import { Star, Trash2, ExternalLink } from 'lucide-react'
import { useBrowserStore } from '../store/useBrowserStore'
import { Section } from '../components/Stat'
import type { Bookmark } from '@shared/types'

export default function Bookmarks() {
  const [items, setItems] = useState<Bookmark[]>([])
  const { setInternalPage } = useBrowserStore()
  const load = () => window.hexacore.bookmarks.list().then(setItems)
  useEffect(() => { load() }, [])

  return (
    <div className="p-8">
      <Section title="Bookmarks">
        {items.length === 0 ? (
          <Empty text="No bookmarks yet. Hit the star in the toolbar to save a page." />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {items.map((b) => (
              <div key={b.id} className="card group flex items-center gap-3">
                <Star className="h-4 w-4 shrink-0 text-hex-neon" />
                <button onClick={() => { window.hexacore.tab.create(b.url); setInternalPage(null) }}
                  className="flex-1 truncate text-left text-sm hover:text-hex-neon">
                  {b.title}<span className="ml-2 text-xs text-hex-muted">{b.url}</span>
                </button>
                <ExternalLink className="h-4 w-4 cursor-pointer text-hex-muted hover:text-hex-neon"
                  onClick={() => { window.hexacore.tab.create(b.url); setInternalPage(null) }} />
                <Trash2 className="h-4 w-4 cursor-pointer text-hex-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-hex-danger"
                  onClick={() => window.hexacore.bookmarks.remove(b.id).then(load)} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="card text-sm text-hex-muted">{text}</div>
}
export { Empty }
