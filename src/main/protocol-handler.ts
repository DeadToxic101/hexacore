import { app, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { parseHexacoreUrl } from '@shared/internal-urls'
import { Integrations } from './integrations/integrations'
import { getMainWindow } from './window-manager'

type Provider = 'discord' | 'twitch' | 'steam'

function notifyRenderer(channel: string, payload?: unknown): void {
  getMainWindow()?.webContents.send(channel, payload)
}

function handleProtocolUrl(url: string): void {
  const parsed = parseHexacoreUrl(url)

  if (parsed.type === 'oauth') {
    const provider = parsed.provider as Provider
    if (!['discord', 'twitch', 'steam'].includes(provider)) return

    if (!parsed.code) {
      notifyRenderer(IPC.INTEGRATION_MESSAGE, {
        ok: false,
        reason: `${provider} authorization was cancelled or returned no code.`
      })
      return
    }

    const result = Integrations.completeOAuth(provider, parsed.code, parsed.state)
    notifyRenderer(IPC.INTEGRATION_UPDATED, Integrations.status())
    notifyRenderer(IPC.INTEGRATION_MESSAGE, result)
    return
  }

  if (parsed.type === 'blocked') {
    notifyRenderer(IPC.BLOCKED, { reason: parsed.reason, url: parsed.url })
    return
  }

  if (parsed.type === 'page') {
    notifyRenderer(IPC.INTERNAL_NAVIGATE, { page: parsed.page })
  }
}

export function registerProtocolHandler(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('hexacore', process.execPath, [process.argv[1]!])
    }
  } else {
    app.setAsDefaultProtocolClient('hexacore')
  }

  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleProtocolUrl(url)
  })

  // Windows / Linux: protocol URL may arrive via argv on first launch
  const protocolArg = process.argv.find((a) => a.startsWith('hexacore://'))
  if (protocolArg) {
    app.whenReady().then(() => handleProtocolUrl(protocolArg))
  }
}

export function handleSecondInstance(commandLine: string[]): void {
  const url = commandLine.find((a) => a.startsWith('hexacore://'))
  if (url) handleProtocolUrl(url)
  const win = getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
}

export { handleProtocolUrl, notifyRenderer }
