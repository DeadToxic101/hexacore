import { useEffect, useState } from 'react'
import { Section } from '../components/Stat'
import { useBrowserStore } from '../store/useBrowserStore'
import type { IntegrationStatus } from '@shared/types'

const PROVIDERS = [
  { id: 'discord' as const, name: 'Discord', color: '#5865f2', desc: 'Rich Presence + server notifications' },
  { id: 'twitch' as const, name: 'Twitch', color: '#9146ff', desc: 'Live follows, drops & chat' },
  { id: 'steam' as const, name: 'Steam', color: '#1b88e0', desc: 'Library, friends & achievements' }
]

export default function Integrations() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const { setIntegrations, setToast } = useBrowserStore()

  const load = () => window.hexacore.integrations.status().then(setStatus)
  useEffect(() => { load() }, [])

  const connect = async (id: string) => {
    const res = await window.hexacore.integrations.connect(id)
    if (res.ok) {
      setToast({ message: `Opening ${id} consent in your browser…`, type: 'info' })
    } else {
      setToast({ message: res.reason ?? 'Connection failed.', type: 'error' })
    }
  }

  const disconnect = async (id: string) => {
    try {
      const next = await window.hexacore.integrations.disconnect(id)
      setStatus(next)
      setIntegrations(next)
      setToast({ message: `Disconnected from ${id}.`, type: 'info' })
    } catch {
      setToast({ message: 'Failed to disconnect.', type: 'error' })
    }
  }

  return (
    <div className="p-8">
      <Section title="Integrations">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PROVIDERS.map((p) => {
            const connected = (status as any)?.[p.id]?.connected
            return (
              <div key={p.id} className="card flex flex-col items-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl font-display text-xl"
                  style={{ background: `${p.color}22`, color: p.color, boxShadow: `0 0 18px ${p.color}66` }}>{p.name[0]}</div>
                <div className="text-center">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-[11px] text-hex-muted">{p.desc}</div>
                </div>
                {connected ? (
                  <div className="flex w-full flex-col gap-2">
                    <span className="text-center text-xs text-hex-ok">
                      Connected · {(status as any)[p.id].username ?? 'linked'}
                    </span>
                    <button onClick={() => disconnect(p.id)} className="btn w-full text-hex-muted hover:text-hex-danger">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button onClick={() => connect(p.id)} className="btn-neon w-full">Connect</button>
                )}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
