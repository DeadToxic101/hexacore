import { useEffect, useState } from 'react'
import { KeyRound, Eye, EyeOff, Trash2, Plus } from 'lucide-react'
import { Section } from '../components/Stat'
import { Empty } from './Bookmarks'
import { useBrowserStore } from '../store/useBrowserStore'
import type { PasswordEntry } from '@shared/types'

export default function PasswordManager() {
  const [items, setItems] = useState<PasswordEntry[]>([])
  const [revealed, setRevealed] = useState<Record<number, string>>({})
  const [form, setForm] = useState({ origin: '', username: '', password: '' })
  const { setToast } = useBrowserStore()
  const load = () => window.hexacore.passwords.list().then(setItems)
  useEffect(() => { load() }, [])

  const reveal = async (id: number) => {
    if (revealed[id]) { setRevealed((r) => { const n = { ...r }; delete n[id]; return n }); return }
    const res = await window.hexacore.passwords.reveal(id)
    if (res.ok) setRevealed((r) => ({ ...r, [id]: res.password }))
    else setToast({ message: res.reason, type: 'error' })
  }
  const save = async () => {
    if (!form.origin || !form.username || !form.password) return
    try {
      await window.hexacore.passwords.save(form.origin, form.username, form.password)
      setForm({ origin: '', username: '', password: '' })
      load()
    } catch {
      setToast({ message: 'Failed to save password.', type: 'error' })
    }
  }

  return (
    <div className="p-8">
      <Section title="Password Vault">
        <div className="card mb-4 grid gap-2 md:grid-cols-4">
          <input placeholder="Website" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="vault-in" />
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="vault-in" />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="vault-in" />
          <button onClick={save} className="btn-neon flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save</button>
        </div>
        <p className="mb-4 text-[11px] text-hex-muted">Passwords are encrypted with AES-256-GCM; the master key is sealed by your OS keychain (DPAPI / Keychain / libsecret).</p>

        {items.length === 0 ? <Empty text="No saved passwords." /> : (
          <div className="flex flex-col gap-2">
            {items.map((p) => (
              <div key={p.id} className="card flex items-center gap-3">
                <KeyRound className="h-4 w-4 text-hex-neon" />
                <div className="flex-1">
                  <div className="text-sm">{p.origin}</div>
                  <div className="text-xs text-hex-muted">{p.username} · {revealed[p.id] ?? '••••••••••'}</div>
                </div>
                <button onClick={() => reveal(p.id)}>{revealed[p.id] ? <EyeOff className="h-4 w-4 text-hex-muted" /> : <Eye className="h-4 w-4 text-hex-muted" />}</button>
                <Trash2 className="h-4 w-4 cursor-pointer text-hex-muted hover:text-hex-danger" onClick={() => window.hexacore.passwords.remove(p.id).then(load)} />
              </div>
            ))}
          </div>
        )}
      </Section>
      <style>{`.vault-in{background:#0a0e17;border:1px solid #1b2233;border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;outline:none}.vault-in:focus{box-shadow:0 0 8px rgba(0,229,255,.35)}`}</style>
    </div>
  )
}
