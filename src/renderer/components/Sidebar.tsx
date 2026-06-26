import { useState } from 'react'
import {
  LayoutDashboard, Star, Clock, Download, Gamepad2, Newspaper,
  Plug, Users, KeyRound, Settings as Cog, Hexagon
} from 'lucide-react'
import { useBrowserStore, type InternalPage } from '../store/useBrowserStore'

const NAV: { id: Exclude<InternalPage, null>; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'games', label: 'Game Launcher', icon: Gamepad2 },
  { id: 'news', label: 'Gaming News', icon: Newspaper },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'bookmarks', label: 'Bookmarks', icon: Star },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'passwords', label: 'Passwords', icon: KeyRound },
  { id: 'profiles', label: 'Profiles', icon: Users },
  { id: 'settings', label: 'Settings', icon: Cog }
]

const THEME_LABELS: Record<string, string> = {
  'neon-blue': 'Neon Blue',
  'neon-purple': 'Neon Purple',
  'neon-green': 'Neon Green'
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { internalPage, setInternalPage, settings } = useBrowserStore()
  const themeLabel = THEME_LABELS[settings?.theme ?? 'neon-blue'] ?? 'Neon Blue'

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`no-drag glass absolute left-0 top-0 z-40 flex h-full flex-col gap-1 border-r border-hex-border py-3
        transition-all duration-300 ease-out ${open ? 'w-56 shadow-neon-soft' : 'w-[72px]'}`}
    >
      <div className="mb-3 flex items-center gap-3 px-5">
        <Hexagon className="h-7 w-7 shrink-0 text-hex-neon animate-pulseGlow" fill="rgba(0,229,255,0.12)" />
        {open && <span className="font-display text-sm tracking-widest neon-text">HEXACORE</span>}
      </div>

      {NAV.map(({ id, label, icon: Icon }) => {
        const active = internalPage === id
        return (
          <button
            key={id}
            onClick={() => setInternalPage(id)}
            className={`group relative mx-2 flex items-center gap-4 rounded-lg px-4 py-2.5 text-left transition-all
              ${active ? 'bg-hex-neon/10 text-hex-neon neon-ring' : 'text-hex-muted hover:bg-white/5 hover:text-hex-text'}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className={`whitespace-nowrap text-sm font-medium transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}>
              {label}
            </span>
            {active && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-hex-neon shadow-neon" />}
          </button>
        )
      })}

      <div className="mt-auto px-5 text-[10px] text-hex-muted">{open && `Black · ${themeLabel} theme`}</div>
    </div>
  )
}
