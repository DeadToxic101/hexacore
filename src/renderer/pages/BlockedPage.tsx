import { useBrowserStore } from '../store/useBrowserStore'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import type { BlockedInfo } from '@shared/types'

export default function BlockedPage({ info }: { info: BlockedInfo }) {
  const { setBlockedInfo, setInternalPage } = useBrowserStore()

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <ShieldAlert className="mb-4 h-16 w-16 text-hex-danger" />
      <h1 className="font-display text-xl text-hex-danger">Page Blocked</h1>
      <p className="mt-2 max-w-md text-sm text-hex-muted">
        HexaCore blocked this page because it may be a phishing or malicious site
        {info.reason ? ` (${info.reason})` : ''}.
      </p>
      {info.url && (
        <p className="mt-3 max-w-lg truncate rounded-lg border border-hex-border bg-hex-panel px-4 py-2 text-xs text-hex-muted">
          {info.url}
        </p>
      )}
      <button
        onClick={() => {
          setBlockedInfo(null)
          setInternalPage('dashboard')
        }}
        className="btn-neon mt-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>
    </div>
  )
}
