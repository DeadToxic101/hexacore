import { app, BrowserWindow, session } from 'electron'
import { getDb } from './db/database'
import { Profiles } from './services/profiles'
import { Settings } from './services/settings'
import { Downloads } from './services/downloads'
import { applySecurity } from './security/security-manager'
import { createMainWindow, getMainWindow } from './window-manager'
import { registerIpc } from './ipc'
import { initAutoUpdater } from './updater'
import { registerProtocolHandler, handleSecondInstance } from './protocol-handler'
import { ResourceLimiter } from './gaming/resource-limiter'
import { IPC } from '@shared/ipc-channels'
import { randomUUID } from 'crypto'
import { liveDownloads } from './download-tracker'

// --- GPU / performance flags (set before app ready) ---
function readSettingsEarly() {
  try {
    getDb()
    return Settings.getAll()
  } catch {
    return null
  }
}

function readLimitsEarly() {
  try {
    getDb()
    return ResourceLimiter.get()
  } catch {
    return null
  }
}

registerProtocolHandler()

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_e, commandLine) => handleSecondInstance(commandLine))
}

app.commandLine.appendSwitch('enable-features', 'CanvasOopRasterization,VaapiVideoDecoder')
app.commandLine.appendSwitch('ignore-gpu-blocklist')

const earlySettings = readSettingsEarly()
const earlyLimits = readLimitsEarly()
if (earlySettings && !earlySettings.hardwareAcceleration) {
  app.disableHardwareAcceleration()
}
if (earlyLimits?.enabled && earlyLimits.ramMaxMB > 0) {
  app.commandLine.appendSwitch('js-flags', `--max-old-space-size=${earlyLimits.ramMaxMB}`)
}

app.whenReady().then(() => {
  getDb()
  Profiles.ensureDefault()
  const s = Settings.getAll()
  if (!s.hardwareAcceleration) app.disableHardwareAcceleration()

  ResourceLimiter.apply(ResourceLimiter.get())
  if (s.resourceLimiter) {
    ResourceLimiter.set({ enabled: true })
  }

  applySecurity(session.defaultSession)

  const wireDownloads = (ses: Electron.Session) => {
    ses.on('will-download', (_e, item) => {
      const id = randomUUID()
      liveDownloads.set(id, item)
      const record = () =>
        Downloads.upsert({
          id,
          filename: item.getFilename(),
          url: item.getURL(),
          savePath: item.getSavePath(),
          received: item.getReceivedBytes(),
          total: item.getTotalBytes(),
          status: item.getState() === 'completed' ? 'completed' : item.isPaused() ? 'paused' : 'progressing',
          startedAt: Date.now()
        })
      item.on('updated', () => {
        record()
        getMainWindow()?.webContents.send(IPC.DOWNLOAD_UPDATE, Downloads.list())
      })
      item.once('done', (_ev, state) => {
        liveDownloads.delete(id)
        Downloads.upsert({
          id,
          filename: item.getFilename(),
          url: item.getURL(),
          savePath: item.getSavePath(),
          received: item.getReceivedBytes(),
          total: item.getTotalBytes(),
          status: state === 'cancelled' ? 'cancelled' : state === 'interrupted' ? 'interrupted' : 'completed',
          startedAt: Date.now()
        })
        getMainWindow()?.webContents.send(IPC.DOWNLOAD_UPDATE, Downloads.list())
      })
      record()
    })
  }
  wireDownloads(session.defaultSession)

  registerIpc()
  createMainWindow()
  initAutoUpdater(getMainWindow)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})
