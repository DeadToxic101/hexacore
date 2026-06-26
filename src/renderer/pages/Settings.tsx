import { useEffect, useState } from 'react'
import { Section } from '../components/Stat'
import { useBrowserStore } from '../store/useBrowserStore'
import type { AppSettings, ResourceLimits } from '@shared/types'

export default function Settings() {
  const { settings, setSettings } = useBrowserStore()
  const [limits, setLimits] = useState<ResourceLimits | null>(null)

  useEffect(() => {
    if (!settings) window.hexacore.settings.get().then(setSettings)
    window.hexacore.resources.limitsGet().then(setLimits)
  }, [])

  const toggle = async (key: keyof AppSettings) => {
    if (!settings) return
    const next = await window.hexacore.settings.set(key, !settings[key])
    setSettings(next)
  }
  const setVal = async (key: keyof AppSettings, value: any) => {
    const next = await window.hexacore.settings.set(key, value)
    setSettings(next)
  }
  const updateLimit = async (patch: Partial<ResourceLimits>) => {
    const next = await window.hexacore.resources.limitsSet(patch)
    setLimits(next)
  }

  if (!settings) return null

  return (
    <div className="p-8">
      <Section title="Security & Privacy">
        <div className="grid gap-2 md:grid-cols-2">
          <Toggle label="Ad blocker" desc="Block ad networks and banners" on={settings.adBlock} onClick={() => toggle('adBlock')} />
          <Toggle label="Tracker blocker" desc="Stop analytics & fingerprinting" on={settings.trackerBlock} onClick={() => toggle('trackerBlock')} />
          <Toggle label="HTTPS-only mode" desc="Upgrade insecure connections" on={settings.httpsOnly} onClick={() => toggle('httpsOnly')} />
          <Toggle label="Anti-phishing" desc="Block known malicious domains" on={settings.antiPhishing} onClick={() => toggle('antiPhishing')} />
        </div>
      </Section>

      <Section title="Appearance">
        <div className="grid gap-2 md:grid-cols-2">
          <Select label="Theme" value={settings.theme} onChange={(v) => setVal('theme', v)}
            options={[['neon-blue', 'Neon Blue'], ['neon-purple', 'Neon Purple'], ['neon-green', 'Neon Green']]} />
          <Select label="Search engine" value={settings.searchEngine} onChange={(v) => setVal('searchEngine', v)}
            options={[['duckduckgo', 'DuckDuckGo'], ['google', 'Google'], ['bing', 'Bing']]} />
          <Toggle label="RGB lighting effects" desc="Animated neon frame" on={settings.rgbEffects} onClick={() => toggle('rgbEffects')} />
          <Toggle label="FPS overlay" desc="Show live frame counter" on={settings.fpsOverlay} onClick={() => toggle('fpsOverlay')} />
        </div>
      </Section>

      <Section title="Performance & Resource Limiter">
        <div className="grid gap-2 md:grid-cols-2">
          <Toggle label="Hardware acceleration" desc="Use GPU for rendering (restart to apply)" on={settings.hardwareAcceleration} onClick={() => toggle('hardwareAcceleration')} />
          <Toggle label="Resource limiter" desc="Throttle browser to spare your game" on={settings.resourceLimiter} onClick={() => toggle('resourceLimiter')} />
        </div>
        <p className="mt-2 text-[11px] text-hex-muted">CPU cap is advisory (background throttling). True per-process CPU limits require OS-level tooling.</p>
        {limits && (
          <div className="card mt-3 grid gap-4 md:grid-cols-2">
            <Slider label={`CPU target: ${limits.cpuMaxPercent}%`} min={10} max={100} step={5}
              value={limits.cpuMaxPercent} onChange={(v) => updateLimit({ cpuMaxPercent: v, enabled: settings.resourceLimiter })} />
            <Slider label={`RAM ceiling: ${limits.ramMaxMB} MB`} min={1024} max={16384} step={512}
              value={limits.ramMaxMB} onChange={(v) => updateLimit({ ramMaxMB: v, enabled: settings.resourceLimiter })} />
            <Slider label={`FPS cap: ${limits.fpsCap}`} min={30} max={240} step={6}
              value={limits.fpsCap} onChange={(v) => updateLimit({ fpsCap: v, enabled: settings.resourceLimiter })} />
            <Slider label={`Download cap: ${limits.netDownMaxKBps || 'unlimited'} ${limits.netDownMaxKBps ? 'KB/s' : ''}`} min={0} max={50000} step={500}
              value={limits.netDownMaxKBps} onChange={(v) => updateLimit({ netDownMaxKBps: v, enabled: settings.resourceLimiter })} />
            <Slider label={`Upload cap: ${limits.netUpMaxKBps || 'unlimited'} ${limits.netUpMaxKBps ? 'KB/s' : ''}`} min={0} max={20000} step={250}
              value={limits.netUpMaxKBps} onChange={(v) => updateLimit({ netUpMaxKBps: v, enabled: settings.resourceLimiter })} />
          </div>
        )}
      </Section>
    </div>
  )
}

function Toggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card flex items-center justify-between text-left">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-hex-muted">{desc}</div>
      </div>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-hex-neon shadow-neon' : 'bg-hex-border'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="card flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-hex-border bg-hex-panel2 px-2 py-1 text-sm outline-none focus:neon-ring">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-hex-muted">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-hex-neon" />
    </div>
  )
}
