import { ipcMain, shell } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { getMainWindow, getTabManager } from './window-manager'
import { Bookmarks } from './services/bookmarks'
import { History } from './services/history'
import { Downloads } from './services/downloads'
import { Profiles } from './services/profiles'
import { Settings } from './services/settings'
import { Passwords } from './services/passwords'
import { getSecurityStats } from './security/security-manager'
import { sampleResources, setFps } from './gaming/resource-monitor'
import { ResourceLimiter } from './gaming/resource-limiter'
import { GameLauncher } from './gaming/game-launcher'
import { Integrations } from './integrations/integrations'
import { getNews } from './integrations/news-feed'
import { liveDownloads } from './download-tracker'

export function registerIpc(): void {
  const h = (channel: string, fn: (...a: any[]) => any) => ipcMain.handle(channel, (_e, ...a) => fn(...a))

  h(IPC.TAB_CREATE, (url?: string) => getTabManager()?.create(url))
  h(IPC.TAB_CLOSE, (id: string) => getTabManager()?.close(id))
  h(IPC.TAB_ACTIVATE, (id: string) => getTabManager()?.activate(id))
  h(IPC.TAB_NAVIGATE, (id: string, url: string) => getTabManager()?.navigate(id, url))
  h(IPC.TAB_BACK, (id: string) => getTabManager()?.back(id))
  h(IPC.TAB_FORWARD, (id: string) => getTabManager()?.forward(id))
  h(IPC.TAB_RELOAD, (id: string) => getTabManager()?.reload(id))
  h(IPC.TAB_SET_VISIBLE, (v: boolean) => getTabManager()?.setActiveVisible(v))
  h(IPC.TAB_SET_BOUNDS, (insets: any) => getTabManager()?.setInsets(insets))

  h(IPC.BOOKMARK_LIST, () => Bookmarks.list())
  h(IPC.BOOKMARK_ADD, (b: any) => Bookmarks.add(b))
  h(IPC.BOOKMARK_REMOVE, (id: number) => Bookmarks.remove(id))

  h(IPC.HISTORY_LIST, () => History.list())
  h(IPC.HISTORY_SEARCH, (q: string) => History.search(q))
  h(IPC.HISTORY_CLEAR, () => History.clear())

  h(IPC.DOWNLOAD_LIST, () => Downloads.list())
  h(IPC.DOWNLOAD_OPEN, (path: string) => shell.openPath(path))
  h(IPC.DOWNLOAD_PAUSE, (id: string) => {
    liveDownloads.get(id)?.pause()
    return Downloads.list()
  })
  h(IPC.DOWNLOAD_RESUME, (id: string) => {
    liveDownloads.get(id)?.resume()
    return Downloads.list()
  })
  h(IPC.DOWNLOAD_CANCEL, (id: string) => {
    liveDownloads.get(id)?.cancel()
    liveDownloads.delete(id)
    return Downloads.list()
  })

  h(IPC.PROFILE_LIST, () => Profiles.list())
  h(IPC.PROFILE_ACTIVE, () => Profiles.active())
  h(IPC.PROFILE_CREATE, (name: string) => Profiles.create(name))
  h(IPC.PROFILE_SWITCH, (id: string) => {
    Profiles.switch(id)
    const tm = getTabManager()
    tm?.switchPartition(Profiles.active().partition, Settings.getAll().homepage)
    return Profiles.active()
  })
  h(IPC.PROFILE_DELETE, (id: string) => {
    Profiles.remove(id)
    return Profiles.list()
  })

  h(IPC.SETTINGS_GET, () => Settings.getAll())
  h(IPC.SETTINGS_SET, (key: any, value: any) => Settings.set(key, value))

  h(IPC.PASSWORD_LIST, () => Passwords.list())
  h(IPC.PASSWORD_SAVE, (o: string, u: string, p: string) => Passwords.save(o, u, p))
  h(IPC.PASSWORD_REVEAL, (id: number) => Passwords.reveal(id))
  h(IPC.PASSWORD_DELETE, (id: number) => Passwords.remove(id))

  h(IPC.SECURITY_STATS, () => getSecurityStats())

  h(IPC.RESOURCE_STATS, () => sampleResources())
  h(IPC.RESOURCE_LIMITS_GET, () => ResourceLimiter.get())
  h(IPC.RESOURCE_LIMITS_SET, (l: any) => ResourceLimiter.set(l))
  h(IPC.GAMES_LIST, () => GameLauncher.list())
  h(IPC.GAMES_SCAN, () => GameLauncher.scan())
  h(IPC.GAMES_LAUNCH, (id: string) => GameLauncher.launch(id))
  ipcMain.on('resource:fps', (_e, fps: number) => setFps(fps))

  h(IPC.INTEGRATION_STATUS, () => Integrations.status())
  h(IPC.INTEGRATION_CONNECT, (p: any) => Integrations.connect(p))
  h(IPC.INTEGRATION_DISCONNECT, (p: any) => Integrations.disconnect(p))
  h(IPC.NEWS_FEED, () => getNews())

  setInterval(async () => {
    try {
      getMainWindow()?.webContents.send(IPC.RESOURCE_STATS, await sampleResources())
    } catch {
      /* ignore sampling errors */
    }
  }, 1000)
}
