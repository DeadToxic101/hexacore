import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'

export function initAutoUpdater(getWindow: () => BrowserWindow | null): void {
  if (process.env.ELECTRON_RENDERER_URL) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  const send = (channel: string, payload?: unknown) =>
    getWindow()?.webContents.send(channel, payload)

  autoUpdater.on('checking-for-update', () => send(IPC.UPDATE_STATUS, { state: 'checking' }))
  autoUpdater.on('update-available', (info) => send(IPC.UPDATE_STATUS, { state: 'available', version: info.version }))
  autoUpdater.on('update-not-available', () => send(IPC.UPDATE_STATUS, { state: 'none' }))
  autoUpdater.on('download-progress', (p) => send(IPC.UPDATE_STATUS, { state: 'downloading', percent: Math.round(p.percent) }))
  autoUpdater.on('update-downloaded', (info) => send(IPC.UPDATE_STATUS, { state: 'ready', version: info.version }))
  autoUpdater.on('error', (err) => send(IPC.UPDATE_STATUS, { state: 'error', message: String(err) }))

  ipcMain.handle(IPC.UPDATE_INSTALL, () => autoUpdater.quitAndInstall())
  ipcMain.handle(IPC.UPDATE_CHECK, () => autoUpdater.checkForUpdates())

  autoUpdater.checkForUpdates().catch(() => { /* offline / no feed configured */ })
}
