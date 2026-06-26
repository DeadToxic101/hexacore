import { Plus, X, Loader2, Lock } from 'lucide-react'
import { useBrowserStore } from '../store/useBrowserStore'

const SEARCH_HOME: Record<string, string> = {
  google: 'https://www.google.com',
  bing: 'https://www.bing.com',
  duckduckgo: 'https://duckduckgo.com'
}

export default function TabBar() {
  const { tabs, setInternalPage, settings } = useBrowserStore()

  const activate = (id: string) => {
    window.hexacore.tab.activate(id)
    setInternalPage(null)
  }

  const newTabUrl = SEARCH_HOME[settings?.searchEngine ?? 'duckduckgo'] ?? 'https://duckduckgo.com'

  return (
    <div className="flex h-10 items-center gap-1 px-2 pt-1">
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <div
            key={t.id}
            onClick={() => activate(t.id)}
            className={`no-drag group flex h-8 min-w-[140px] max-w-[220px] cursor-pointer items-center gap-2 rounded-t-lg px-3 text-xs
              ${t.active ? 'bg-hex-panel2 text-hex-text neon-ring border-b-0' : 'bg-hex-panel/60 text-hex-muted hover:bg-hex-panel2/80'}`}
          >
            {t.loading ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin text-hex-neon" />
            ) : t.favicon ? (
              <img src={t.favicon} alt="" className="h-3 w-3 shrink-0 rounded-sm" />
            ) : t.secure ? (
              <Lock className="h-3 w-3 shrink-0 text-hex-ok" />
            ) : (
              <span className="h-2 w-2 shrink-0 rounded-full bg-hex-danger" />
            )}
            <span className="flex-1 truncate">{t.title || 'New Tab'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.hexacore.tab.close(t.id)
              }}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5 hover:text-hex-danger" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          window.hexacore.tab.create(newTabUrl)
          setInternalPage(null)
        }}
        className="no-drag flex h-8 w-8 items-center justify-center rounded-lg text-hex-neon hover:bg-hex-neon/10 hover:shadow-neon"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
