import { Hexagon } from 'lucide-react'

export default function TitleBar() {
  return (
    <div className="drag absolute left-0 right-0 top-0 z-30 flex h-9 items-center justify-between px-3">
      <div className="flex items-center gap-2 pl-1">
        <Hexagon className="h-4 w-4 text-hex-neon" fill="rgba(0,229,255,0.15)" />
        <span className="font-display text-xs tracking-widest neon-text">HEXACORE</span>
      </div>
      <div className="no-drag flex items-center gap-2">
        <span className="text-[10px] text-hex-muted">v0.1 · research preview</span>
      </div>
    </div>
  )
}
