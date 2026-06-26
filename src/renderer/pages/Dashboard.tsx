import { useEffect, useState } from 'react'
import { Cpu, MemoryStick, Activity, Wifi, ShieldCheck, Gamepad2, Zap } from 'lucide-react'
import { useBrowserStore } from '../store/useBrowserStore'
import { Gauge, Section } from '../components/Stat'
import type { GameEntry, NewsItem } from '@shared/types'

const QUICK = [
  { name: 'Steam', url: 'https://store.steampowered.com', color: '#1b2838' },
  { name: 'Twitch', url: 'https://twitch.tv', color: '#9146ff' },
  { name: 'YouTube', url: 'https://youtube.com', color: '#ff0000' },
  { name: 'Discord', url: 'https://discord.com/app', color: '#5865f2' },
  { name: 'Epic', url: 'https://store.epicgames.com', color: '#2a2a2a' },
  { name: 'Reddit', url: 'https://reddit.com/r/gaming', color: '#ff4500' }
]

export default function Dashboard() {
  const { resources, security, profile, setInternalPage } = useBrowserStore()
  const [games, setGames] = useState<GameEntry[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    window.hexacore.games.list().then(setGames)
    window.hexacore.integrations.news().then((n) => setNews(n.slice(0, 4)))
  }, [])

  const open = (url: string) => {
    window.hexacore.tab.create(url)
    setInternalPage(null)
  }

  const r = resources
  const ramPct = r && r.ramTotal ? (r.ramUsed / r.ramTotal) * 100 : 0

  return (
    <div className="min-h-full bg-gradient-to-b from-hex-bg to-[#070a12] p-8">
      <header className="mb-8">
        <p className="text-sm text-hex-muted">Welcome back,</p>
        <h1 className="font-display text-3xl tracking-wide">
          <span className="neon-text">{profile?.name ?? 'Player'}</span>
        </h1>
        <p className="mt-1 text-sm text-hex-muted">Your gaming command center is online.</p>
      </header>

      {/* Live resource monitors */}
      <Section title="System Performance">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Gauge label="CPU" value={r?.cpu ?? 0} sub={r?.cpuTemp ? `${r.cpuTemp}°C` : 'temp n/a'} />
          <Gauge label="GPU" value={r?.gpu ?? 0} sub={r?.gpuTemp ? `${r.gpuTemp}°C · VRAM ${r?.gpuMem ?? 0}%` : `VRAM ${r?.gpuMem ?? 0}%`} />
          <Gauge label="RAM" value={ramPct} unit="%" sub={`${(r?.ramUsed ?? 0) / 1024 | 0} / ${(r?.ramTotal ?? 0) / 1024 | 0} GB`} />
          <Gauge label="FPS" value={r?.fps ?? 0} max={240} unit="" sub={`↓${r?.netDown ?? 0} ↑${r?.netUp ?? 0} KB/s`} />
        </div>
      </Section>

      {/* Security summary */}
      <Section title="Protection" action={<button onClick={() => setInternalPage('settings')} className="btn-neon">Manage</button>}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ProtChip icon={ShieldCheck} label="Ads blocked" value={security?.adsBlocked ?? 0} />
          <ProtChip icon={Activity} label="Trackers blocked" value={security?.trackersBlocked ?? 0} />
          <ProtChip icon={Wifi} label="HTTPS upgrades" value={security?.httpsUpgrades ?? 0} />
          <ProtChip icon={Zap} label="Phishing stopped" value={security?.phishingBlocked ?? 0} />
        </div>
      </Section>

      {/* Quick launch */}
      <Section title="Quick Launch">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK.map((q) => (
            <button key={q.name} onClick={() => open(q.url)}
              className="card flex flex-col items-center gap-2 py-5 transition-all hover:-translate-y-1 hover:shadow-neon">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg font-display text-sm"
                style={{ background: q.color, boxShadow: `0 0 12px ${q.color}` }}>
                {q.name[0]}
              </div>
              <span className="text-xs text-hex-text">{q.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Recent Games" action={<button onClick={() => setInternalPage('games')} className="text-xs text-hex-neon">View all →</button>}>
          {games.length === 0 ? (
            <div className="card flex items-center gap-3 text-sm text-hex-muted">
              <Gamepad2 className="h-5 w-5 text-hex-neon" /> No games detected. Scan your library in the Game Launcher.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {games.slice(0, 4).map((g) => (
                <button key={g.id} onClick={() => window.hexacore.games.launch(g.id)}
                  className="card flex items-center gap-3 text-left hover:shadow-neon">
                  <div className="h-10 w-10 shrink-0 rounded bg-hex-border" />
                  <span className="truncate text-sm">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section title="Gaming News" action={<button onClick={() => setInternalPage('news')} className="text-xs text-hex-neon">More →</button>}>
          <div className="flex flex-col gap-2">
            {news.map((n) => (
              <button key={n.id} onClick={() => open(n.url)} className="card text-left hover:shadow-neon">
                <p className="line-clamp-2 text-sm">{n.title}</p>
                <span className="text-[11px] text-hex-muted">{n.source}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function ProtChip({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card flex items-center gap-3">
      <Icon className="h-6 w-6 text-hex-neon" />
      <div>
        <div className="font-display text-xl neon-text">{value.toLocaleString()}</div>
        <div className="text-[11px] text-hex-muted">{label}</div>
      </div>
    </div>
  )
}
