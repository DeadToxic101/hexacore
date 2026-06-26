export function Gauge({ label, value, max = 100, unit = '%', sub }: {
  label: string; value: number; max?: number; unit?: string; sub?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const color = pct > 85 ? '#ff2d55' : pct > 60 ? '#ffb800' : '#00e5ff'
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-hex-muted">{label}</span>
        <span className="font-display text-lg" style={{ color }}>{Math.round(value)}{unit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hex-border">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #0091ff)`, boxShadow: `0 0 8px ${color}` }} />
      </div>
      {sub && <span className="text-[11px] text-hex-muted">{sub}</span>}
    </div>
  )
}

export function StatPill({ label, value, accent = '#00e5ff' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="card flex items-center justify-between">
      <span className="text-sm text-hex-muted">{label}</span>
      <span className="font-display text-xl" style={{ color: accent, textShadow: `0 0 8px ${accent}66` }}>{value}</span>
    </div>
  )
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wide text-hex-text">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
