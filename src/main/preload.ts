import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc-channels'

const api = {
  tab: {
    create: (url?: string) => ipcRenderer.invoke(IPC.TAB_CREATE, url),
    close: (id: string) => ipcRenderer.invoke(IPC.TAB_CLOSE, id),
    activate: (id: string) => ipcRenderer.invoke(IPC.TAB_ACTIVATE, id),
    navigate: (id: string, url: string) => ipcRenderer.invoke(IPC.TAB_NAVIGATE, id, url),
    back: (id: string) => ipcRenderer.invoke(IPC.TAB_BACK, id),
    forward: (id: string) => ipcRenderer.invoke(IPC.TAB_FORWARD, id),
    reload: (id: string) => ipcRenderer.invoke(IPC.TAB_RELOAD, id),
    setVisible: (v: boolean) => ipcRenderer.invoke(IPC.TAB_SET_VISIBLE, v),
    setInsets: (insets: object) => ipcRenderer.invoke(IPC.TAB_SET_BOUNDS, insets),
    onState: (cb: (tabs: any[]) => void) => {
      const fn = (_e: any, tabs: any[]) => cb(tabs)
      ipcRenderer.on(IPC.TAB_STATE, fn)
      return () => { ipcRenderer.removeListener(IPC.TAB_STATE, fn) }
    }
  },
  app: {
    onInternalNavigate: (cb: (p: { page: string }) => void) => {
      const fn = (_e: any, p: { page: string }) => cb(p)
      ipcRenderer.on(IPC.INTERNAL_NAVIGATE, fn)
      return () => { ipcRenderer.removeListener(IPC.INTERNAL_NAVIGATE, fn) }
    },
    onBlocked: (cb: (info: { reason: string; url: string }) => void) => {
      const fn = (_e: any, info: { reason: string; url: string }) => cb(info)
      ipcRenderer.on(IPC.BLOCKED, fn)
      return () => { ipcRenderer.removeListener(IPC.BLOCKED, fn) }
    }
  },
  bookmarks: {
    list: () => ipcRenderer.invoke(IPC.BOOKMARK_LIST),
    add: (b: object) => ipcRenderer.invoke(IPC.BOOKMARK_ADD, b),
    remove: (id: number) => ipcRenderer.invoke(IPC.BOOKMARK_REMOVE, id)
  },
  history: {
    list: () => ipcRenderer.invoke(IPC.HISTORY_LIST),
    search: (q: string) => ipcRenderer.invoke(IPC.HISTORY_SEARCH, q),
    clear: () => ipcRenderer.invoke(IPC.HISTORY_CLEAR)
  },
  downloads: {
    list: () => ipcRenderer.invoke(IPC.DOWNLOAD_LIST),
    open: (path: string) => ipcRenderer.invoke(IPC.DOWNLOAD_OPEN, path),
    pause: (id: string) => ipcRenderer.invoke(IPC.DOWNLOAD_PAUSE, id),
    resume: (id: string) => ipcRenderer.invoke(IPC.DOWNLOAD_RESUME, id),
    cancel: (id: string) => ipcRenderer.invoke(IPC.DOWNLOAD_CANCEL, id),
    onUpdate: (cb: (d: any) => void) => {
      const fn = (_e: any, d: any) => cb(d)
      ipcRenderer.on(IPC.DOWNLOAD_UPDATE, fn)
      return () => { ipcRenderer.removeListener(IPC.DOWNLOAD_UPDATE, fn) }
    }
  },
  profiles: {
    list: () => ipcRenderer.invoke(IPC.PROFILE_LIST),
    active: () => ipcRenderer.invoke(IPC.PROFILE_ACTIVE),
    create: (name: string) => ipcRenderer.invoke(IPC.PROFILE_CREATE, name),
    switch: (id: string) => ipcRenderer.invoke(IPC.PROFILE_SWITCH, id),
    remove: (id: string) => ipcRenderer.invoke(IPC.PROFILE_DELETE, id)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.SETTINGS_GET),
    set: (key: string, value: unknown) => ipcRenderer.invoke(IPC.SETTINGS_SET, key, value)
  },
  passwords: {
    list: () => ipcRenderer.invoke(IPC.PASSWORD_LIST),
    save: (o: string, u: string, p: string) => ipcRenderer.invoke(IPC.PASSWORD_SAVE, o, u, p),
    reveal: (id: number) => ipcRenderer.invoke(IPC.PASSWORD_REVEAL, id),
    remove: (id: number) => ipcRenderer.invoke(IPC.PASSWORD_DELETE, id)
  },
  security: {
    stats: () => ipcRenderer.invoke(IPC.SECURITY_STATS)
  },
  resources: {
    sample: () => ipcRenderer.invoke(IPC.RESOURCE_STATS),
    limitsGet: () => ipcRenderer.invoke(IPC.RESOURCE_LIMITS_GET),
    limitsSet: (l: object) => ipcRenderer.invoke(IPC.RESOURCE_LIMITS_SET, l),
    reportFps: (fps: number) => ipcRenderer.send('resource:fps', fps),
    onStats: (cb: (s: any) => void) => {
      const fn = (_e: any, s: any) => cb(s)
      ipcRenderer.on(IPC.RESOURCE_STATS, fn)
      return () => { ipcRenderer.removeListener(IPC.RESOURCE_STATS, fn) }
    }
  },
  games: {
    list: () => ipcRenderer.invoke(IPC.GAMES_LIST),
    scan: () => ipcRenderer.invoke(IPC.GAMES_SCAN),
    launch: (id: string) => ipcRenderer.invoke(IPC.GAMES_LAUNCH, id)
  },
  integrations: {
    status: () => ipcRenderer.invoke(IPC.INTEGRATION_STATUS),
    connect: (p: string) => ipcRenderer.invoke(IPC.INTEGRATION_CONNECT, p),
    disconnect: (p: string) => ipcRenderer.invoke(IPC.INTEGRATION_DISCONNECT, p),
    news: () => ipcRenderer.invoke(IPC.NEWS_FEED),
    onUpdated: (cb: (s: any) => void) => {
      const fn = (_e: any, s: any) => cb(s)
      ipcRenderer.on(IPC.INTEGRATION_UPDATED, fn)
      return () => { ipcRenderer.removeListener(IPC.INTEGRATION_UPDATED, fn) }
    },
    onMessage: (cb: (msg: { ok: boolean; reason?: string }) => void) => {
      const fn = (_e: any, msg: { ok: boolean; reason?: string }) => cb(msg)
      ipcRenderer.on(IPC.INTEGRATION_MESSAGE, fn)
      return () => { ipcRenderer.removeListener(IPC.INTEGRATION_MESSAGE, fn) }
    }
  },
  updater: {
    check: () => ipcRenderer.invoke(IPC.UPDATE_CHECK),
    install: () => ipcRenderer.invoke(IPC.UPDATE_INSTALL),
    onStatus: (cb: (s: any) => void) => {
      const fn = (_e: any, s: any) => cb(s)
      ipcRenderer.on(IPC.UPDATE_STATUS, fn)
      return () => { ipcRenderer.removeListener(IPC.UPDATE_STATUS, fn) }
    }
  }
}

contextBridge.exposeInMainWorld('hexacore', api)
export type HexaCoreApi = typeof api
