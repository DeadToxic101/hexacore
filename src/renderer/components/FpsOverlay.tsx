import { useBrowserStore } from '../store/useBrowserStore'

export default function FpsOverlay() {
  const { resources } = useBrowserStore()
  const fps = resources?.fps ?? 0
  const color = fps >= 60 ? 'text-hex-ok' : fps >= 30 ? 'text-yellow-400' : 'text-hex-danger'
  return (
    <div className="pointer-events-none absolute right-4 top-12 z-50 select-none rounded-lg bg-black/70 px-3 py-1.5 font-display text-xs backdrop-blur">
      <span className={color}>{fps}</span>
      <span className="ml-1 text-hex-muted">FPS</span>
    </div>
  )
}
