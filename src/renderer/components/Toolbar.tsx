import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Star, Home, Shield, ShieldOff } from 'lucide-react'
import { useBrowserStore } from '../store/useBrowserStore'
import { internalUrlLabel } from '@shared/internal-urls'

export default function Toolbar() {
  const { activeTab, settings, setInternalPage } = useBrowserStore()
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!activeTab) {
      setValue('')
      return
    }
    if (activeTab.url.startsWith('hexacore://')) {
      setValue(internalUrlLabel(activeTab.url))
    } else if (!activeTab.url.includes('app://') && activeTab.url !== 'about:blank') {
      setValue(activeTab.url)
    } else {
      setValue('')
    }
  }, [activeTab?.url, activeTab?.title])

  const go = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTab) return
    window.hexacore.tab.navigate(activeTab.id, value)
    setInternalPage(null)
  }

  const addBookmark = () => {
    if (!activeTab || activeTab.url.startsWith('hexacore://') || activeTab.url === 'about:blank') return
    window.hexacore.bookmarks.add({
      title: activeTab.title, url: activeTab.url, favicon: activeTab.favicon, folder: 'General'
    })
  }

  const protectionOn = settings?.adBlock || settings?.trackerBlock

  return (
    <form onSubmit={go} className="no-drag flex h-12 items-center gap-2 px-3">
      <div className="flex items-center gap-1">
        <IconBtn disabled={!activeTab?.canGoBack} onClick={() => activeTab && window.hexacore.tab.back(activeTab.id)}><ArrowLeft className="h-4 w-4" /></IconBtn>
        <IconBtn disabled={!activeTab?.canGoForward} onClick={() => activeTab && window.hexacore.tab.forward(activeTab.id)}><ArrowRight className="h-4 w-4" /></IconBtn>
        <IconBtn onClick={() => activeTab && window.hexacore.tab.reload(activeTab.id)}><RotateCw className="h-4 w-4" /></IconBtn>
        <IconBtn onClick={() => setInternalPage('dashboard')}><Home className="h-4 w-4" /></IconBtn>
      </div>

      <div className="flex flex-1 items-center gap-2 rounded-full border border-hex-border bg-hex-panel px-4 py-2 focus-within:neon-ring">
        {protectionOn ? <Shield className="h-4 w-4 text-hex-ok" /> : <ShieldOff className="h-4 w-4 text-hex-muted" />}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search the web or enter a URL…"
          className="flex-1 bg-transparent text-sm text-hex-text outline-none placeholder:text-hex-muted"
        />
      </div>

      <IconBtn onClick={addBookmark}><Star className="h-4 w-4" /></IconBtn>
    </form>
  )
}

function IconBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...p}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-hex-muted transition-all
        hover:bg-hex-neon/10 hover:text-hex-neon disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
