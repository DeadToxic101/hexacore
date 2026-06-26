import { useEffect, useState } from 'react'
import { UserPlus, Check, Trash2 } from 'lucide-react'
import { Section } from '../components/Stat'
import { useBrowserStore } from '../store/useBrowserStore'
import type { Profile } from '@shared/types'

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [name, setName] = useState('')
  const { setProfile, setInternalPage, setToast } = useBrowserStore()
  const load = () => window.hexacore.profiles.list().then(setProfiles).catch(() =>
    setToast({ message: 'Could not load profiles.', type: 'error' })
  )
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim()) return
    try {
      await window.hexacore.profiles.create(name.trim())
      setName('')
      load()
    } catch {
      setToast({ message: 'Failed to create profile.', type: 'error' })
    }
  }
  const switchTo = async (id: string) => {
    try {
      const p = await window.hexacore.profiles.switch(id)
      setProfile(p)
      setInternalPage('dashboard')
      setToast({ message: 'Switched profile — tabs reset for isolation.', type: 'info' })
      load()
    } catch {
      setToast({ message: 'Failed to switch profile.', type: 'error' })
    }
  }

  return (
    <div className="p-8">
      <Section title="User Profiles" action={
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New profile name"
            className="rounded-lg border border-hex-border bg-hex-panel px-3 py-1.5 text-sm outline-none focus:neon-ring" />
          <button onClick={create} className="btn-neon flex items-center gap-1"><UserPlus className="h-4 w-4" /> Add</button>
        </div>
      }>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {profiles.map((p) => (
            <div key={p.id} className={`card flex flex-col items-center gap-3 ${p.isActive ? 'neon-ring' : ''}`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl"
                style={{ background: `${p.avatarColor}22`, color: p.avatarColor, boxShadow: `0 0 16px ${p.avatarColor}66` }}>
                {p.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm">{p.name}</span>
              {p.isActive ? (
                <span className="flex items-center gap-1 text-xs text-hex-ok"><Check className="h-4 w-4" /> Active</span>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => switchTo(p.id)} className="text-xs text-hex-neon">Switch</button>
                  <Trash2 className="h-4 w-4 cursor-pointer text-hex-muted hover:text-hex-danger"
                    onClick={() => window.hexacore.profiles.remove(p.id).then(load).catch(() =>
                      setToast({ message: 'Failed to delete profile.', type: 'error' })
                    )} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-hex-muted">Each profile keeps its own cookies, history, logins and cache in an isolated session partition.</p>
      </Section>
    </div>
  )
}
