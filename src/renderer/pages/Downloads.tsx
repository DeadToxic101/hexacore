import { useEffect, useState } from 'react'
import { FolderOpen, CheckCircle2, Loader2, Pause, Play, X } from 'lucide-react'
import { Section } from '../components/Stat'
import { Empty } from './Bookmarks'
import { useBrowserStore } from '../store/useBrowserStore'
import type { DownloadItem } from '@shared/types'

export default function Downloads() {
  const [items, setItems] = useState<DownloadItem[]>([])
  const { setToast } = useBrowserStore()

  useEffect(() => {
    window.hexacore.downloads.list().then(setItems).catch(() =>
      setToast({ message: 'Could not load downloads.', type: 'error' })
    )
    return window.hexacore.downloads.onUpdate((list: DownloadItem[]) => setItems(list))
  }, [setToast])

  const act = async (fn: (id: string) => Promise<unknown>, id: string) => {
    try {
      await fn(id)
    } catch {
      setToast({ message: 'Download action failed.', type: 'error' })
    }
  }

  return (
    <div className="p-8">
      <Section title="Downloads">
        {items.length === 0 ? <Empty text="No downloads yet." /> : (
          <div className="flex flex-col gap-2">
            {items.map((d) => {
              const pct = d.total ? (d.received / d.total) * 100 : 0
              return (
                <div key={d.id} className="card">
                  <div className="mb-2 flex items-center gap-3">
                    {d.status === 'completed'
                      ? <CheckCircle2 className="h-5 w-5 text-hex-ok" />
                      : d.status === 'paused'
                        ? <Pause className="h-5 w-5 text-hex-muted" />
                        : <Loader2 className="h-5 w-5 animate-spin text-hex-neon" />}
                    <span className="flex-1 truncate text-sm">{d.filename}</span>
                    {d.status === 'progressing' && (
                      <button onClick={() => act(window.hexacore.downloads.pause, d.id)} className="text-hex-muted hover:text-hex-neon">
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    {d.status === 'paused' && (
                      <button onClick={() => act(window.hexacore.downloads.resume, d.id)} className="text-hex-muted hover:text-hex-neon">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {(d.status === 'progressing' || d.status === 'paused') && (
                      <button onClick={() => act(window.hexacore.downloads.cancel, d.id)} className="text-hex-muted hover:text-hex-danger">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {d.status === 'completed' && (
                      <button onClick={() => window.hexacore.downloads.open(d.savePath)}
                        className="flex items-center gap-1 text-xs text-hex-neon">
                        <FolderOpen className="h-4 w-4" /> Open
                      </button>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-hex-border">
                    <div className="h-full bg-gradient-to-r from-hex-neon to-hex-neon2" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-hex-muted">
                    {(d.received / 1e6).toFixed(1)} MB{d.total ? ` / ${(d.total / 1e6).toFixed(1)} MB` : ''} · {d.status}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
