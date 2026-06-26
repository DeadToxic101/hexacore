import { useEffect } from 'react'
import { useBrowserStore } from '../store/useBrowserStore'
import { X } from 'lucide-react'

export default function Toast() {
  const { toast, setToast } = useBrowserStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast, setToast])

  if (!toast) return null

  return (
    <div className={`no-drag absolute left-1/2 top-14 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-2 text-sm shadow-neon-soft
      ${toast.type === 'error' ? 'border-hex-danger/50 bg-hex-panel text-hex-danger' : 'border-hex-border bg-hex-panel text-hex-text'}`}>
      <span>{toast.message}</span>
      <button onClick={() => setToast(null)} className="text-hex-muted hover:text-hex-text">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
