import { useEffect, useState } from 'react'
import { Clock, Search, Trash2 } from 'lucide-react'
import { useBrowserStore } from '../store/useBrowserStore'
import { Section } from '../components/Stat'
import type { HistoryEntry } from '@shared/types'

export default function History() {
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [q, setQ] = useState('')
  const { setInternalPage } = useBrowserStore()

  const load = () => window.hexacore.history.list().then(setItems)
  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => {
      q ? window.hexacore.history.search(q).then(setItems) : load()
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="p-8">
      <Section title="History" action={
        <button onClick={() => window.hexacore.history.clear().then(load)} className="btn-neon flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Clear all
        </button>
      }>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-hex-border bg-hex-panel px-3 py-2 focus-within:neon-ring">
          <Search className="h-4 w-4 text-hex-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history…"
            className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          {items.map((h) => (
            <button key={h.id} onClick={() => { window.hexacore.tab.create(h.url); setInternalPage(null) }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
              <Clock className="h-4 w-4 shrink-0 text-hex-muted" />
              <span className="flex-1 truncate">{h.title || h.url}</span>
              <span className="text-xs text-hex-muted">{new Date(h.visitedAt).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
