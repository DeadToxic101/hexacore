import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { TabManager } from './tab-manager'
import { Profiles } from './services/profiles'
import { Settings } from './services/settings'
import type { TabState } from '@shared/types'

let mainWindow: BrowserWindow | null = null
let tabManager: TabManager | null = null

export function getMainWindow() {
  return mainWindow
}
export function getTabManager() {
  return tabManager
}

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: '#05060a',
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  const profile = Profiles.active()
  tabManager = new TabManager(mainWindow, profile.partition, (tabs: TabState[]) => {
    mainWindow?.webContents.send('tab:state', tabs)
  })

  mainWindow.on('resize', () => tabManager?.onResize())
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    tabManager?.create(Settings.getAll().homepage)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('app://') && !url.includes('localhost')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
