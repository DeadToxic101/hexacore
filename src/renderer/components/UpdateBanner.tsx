import { useEffect } from 'react'
import { useBrowserStore } from '../store/useBrowserStore'
import type { UpdateStatusPayload } from '@shared/types'

export default function UpdateBanner() {
  const { updateStatus, setUpdateStatus } = useBrowserStore()

  useEffect(() => {
    return window.hexacore.updater.onStatus(setUpdateStatus)
  }, [setUpdateStatus])

  if (!updateStatus || updateStatus.state === 'none') return null

  const label = {
    checking: 'Checking for updates…',
    available: `Update ${updateStatus.version} available — downloading…`,
    downloading: `Downloading update… ${updateStatus.percent ?? 0}%`,
    ready: `Update ${updateStatus.version} ready`,
    error: updateStatus.message ?? 'Update check failed'
  }[updateStatus.state]

  return (
    <div className="no-drag absolute bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-hex-border bg-hex-panel px-4 py-3 text-sm shadow-neon-soft">
      <span className="text-hex-muted">{label}</span>
      {updateStatus.state === 'ready' && (
        <button onClick={() => window.hexacore.updater.install()} className="btn-neon text-xs">
          Restart &amp; install
        </button>
      )}
      {updateStatus.state === 'error' && (
        <button onClick={() => setUpdateStatus(null)} className="text-xs text-hex-muted hover:text-hex-text">
          Dismiss
        </button>
      )}
    </div>
  )
}

export type { UpdateStatusPayload }
