import { useEffect, useState } from 'react'
import { Gamepad2, RefreshCw, Play } from 'lucide-react'
import { Section } from '../components/Stat'
import { Empty } from './Bookmarks'
import { useBrowserStore } from '../store/useBrowserStore'
import type { GameEntry } from '@shared/types'

export default function GameLauncher() {
  const [games, setGames] = useState<GameEntry[]>([])
  const [scanning, setScanning] = useState(false)
  const { setToast } = useBrowserStore()
  const load = () => window.hexacore.games.list().then(setGames)
  useEffect(() => { load() }, [])

  const scan = async () => {
    setScanning(true)
    try {
      setGames(await window.hexacore.games.scan())
    } catch {
      setToast({ message: 'Library scan failed.', type: 'error' })
    }
    setScanning(false)
  }

  const launch = async (id: string) => {
    const res = await window.hexacore.games.launch(id)
    if (res.ok) load()
    else setToast({ message: res.error, type: 'error' })
  }

  return (
    <div className="p-8">
      <Section title="Game Launcher" action={
        <button onClick={scan} className="btn-neon flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} /> Scan library
        </button>
      }>
        {games.length === 0 ? (
          <Empty text="No games found. Click “Scan library” to detect installed Steam titles." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {games.map((g) => (
              <div key={g.id} className="group relative overflow-hidden rounded-xl border border-hex-border bg-hex-panel">
                <div className="aspect-[3/4] w-full bg-hex-border">
                  {g.cover && <img src={g.cover} alt={g.name} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => launch(g.id)}
                    className="btn-neon flex items-center justify-center gap-2"><Play className="h-4 w-4" /> Play</button>
                </div>
                <div className="flex items-center gap-1 p-2">
                  <Gamepad2 className="h-3 w-3 shrink-0 text-hex-neon" />
                  <span className="truncate text-xs">{g.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
