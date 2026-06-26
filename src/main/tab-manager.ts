import { BrowserWindow, WebContentsView, session } from 'electron'
import { randomUUID } from 'crypto'
import { applySecurity } from './security/security-manager'
import { History } from './services/history'
import { Settings } from './services/settings'
import { getMainWindow } from './window-manager'
import { buildSearchUrl } from '@shared/utils'
import { parseHexacoreUrl, type InternalPageId } from '@shared/internal-urls'
import { IPC } from '@shared/ipc-channels'
import type { TabState } from '@shared/types'

interface Tab {
  id: string
  view: WebContentsView
  logicalUrl: string
  favicon: string | null
  internalTitle: string | null
}

export interface ChromeInsets {
  top: number
  left: number
  right: number
  bottom: number
}

const securedPartitions = new Set<string>()

export class TabManager {
  private tabs = new Map<string, Tab>()
  private activeId: string | null = null
  private insets: ChromeInsets = { top: 96, left: 72, right: 0, bottom: 0 }

  constructor(
    private win: BrowserWindow,
    private partition: string,
    private onState: (tabs: TabState[]) => void
  ) {}

  getPartition(): string {
    return this.partition
  }

  setPartition(partition: string) {
    this.partition = partition
  }

  switchPartition(partition: string, homepage = 'hexacore://dashboard'): void {
    const ids = [...this.tabs.keys()]
    for (const id of ids) {
      const tab = this.tabs.get(id)!
      this.win.contentView.removeChildView(tab.view)
      ;(tab.view.webContents as any).destroy?.()
      this.tabs.delete(id)
    }
    this.activeId = null
    this.partition = partition
    this.create(homepage)
    getMainWindow()?.webContents.send(IPC.INTERNAL_NAVIGATE, { page: 'dashboard' as InternalPageId })
  }

  setInsets(insets: Partial<ChromeInsets>) {
    this.insets = { ...this.insets, ...insets }
    this.layout()
  }

  private sessionForPartition() {
    const ses = session.fromPartition(this.partition)
    if (!securedPartitions.has(this.partition)) {
      applySecurity(ses)
      ses.setUserAgent(ses.getUserAgent().replace(/Electron\/[\d.]+ /, '') + ' HexaCore/0.1')
      securedPartitions.add(this.partition)
    }
    return ses
  }

  create(url = 'hexacore://dashboard'): string {
    const id = randomUUID()
    const view = new WebContentsView({
      webPreferences: {
        session: this.sessionForPartition(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webviewTag: false
      }
    })
    const tab: Tab = { id, view, logicalUrl: url, favicon: null, internalTitle: null }
    const wc = view.webContents
    const push = () => this.pushState()

    wc.on('page-title-updated', push)
    wc.on('page-favicon-updated', (_e, favicons) => {
      if (favicons[0]) tab.favicon = favicons[0]
      push()
    })
    wc.on('did-start-loading', push)
    wc.on('did-stop-loading', push)
    wc.on('did-navigate', push)
    wc.on('did-navigate-in-page', push)
    wc.on('did-finish-load', () => {
      const u = wc.getURL()
      if (u && !u.startsWith('hexacore://') && u !== 'about:blank') {
        History.record(u, wc.getTitle(), tab.favicon)
        tab.logicalUrl = u
      }
      push()
    })
    wc.setWindowOpenHandler(({ url: target }) => {
      this.create(target)
      return { action: 'deny' }
    })

    this.tabs.set(id, tab)
    this.navigate(id, url)
    this.activate(id)
    return id
  }

  navigate(id: string, input: string) {
    const tab = this.tabs.get(id)
    if (!tab) return

    const trimmed = input.trim()
    if (trimmed.startsWith('hexacore://')) {
      this.handleInternalNavigation(tab, trimmed)
      return
    }

    tab.internalTitle = null
    tab.logicalUrl = trimmed
    tab.view.webContents.loadURL(this.normalize(trimmed))
  }

  private handleInternalNavigation(tab: Tab, url: string): void {
    const parsed = parseHexacoreUrl(url)
    tab.logicalUrl = url

    if (parsed.type === 'blocked') {
      tab.internalTitle = 'Blocked'
      tab.view.webContents.loadURL('about:blank')
      getMainWindow()?.webContents.send(IPC.BLOCKED, { reason: parsed.reason, url: parsed.url })
      this.pushState()
      return
    }

    if (parsed.type === 'page') {
      tab.internalTitle = parsed.title
      tab.view.webContents.loadURL('about:blank')
      getMainWindow()?.webContents.send(IPC.INTERNAL_NAVIGATE, { page: parsed.page })
      this.pushState()
      return
    }

    tab.internalTitle = null
    tab.view.webContents.loadURL('about:blank')
    this.pushState()
  }

  private normalize(input: string): string {
    const t = input.trim()
    if (t.startsWith('hexacore://')) return 'about:blank'
    if (/^https?:\/\//i.test(t)) return t
    if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t) && !t.includes(' ')) return 'https://' + t
    return this.searchUrl(t)
  }

  private searchUrl(q: string): string {
    const engine = Settings.getAll().searchEngine
    return buildSearchUrl(engine, q)
  }

  activate(id: string) {
    const tab = this.tabs.get(id)
    if (!tab) return
    if (this.activeId && this.tabs.has(this.activeId)) {
      this.win.contentView.removeChildView(this.tabs.get(this.activeId)!.view)
    }
    this.win.contentView.addChildView(tab.view)
    this.activeId = id
    this.layout()
    this.pushState()
  }

  close(id: string) {
    const tab = this.tabs.get(id)
    if (!tab) return
    this.win.contentView.removeChildView(tab.view)
    ;(tab.view.webContents as any).destroy?.()
    this.tabs.delete(id)
    if (this.activeId === id) {
      const next = [...this.tabs.keys()].pop()
      this.activeId = null
      if (next) this.activate(next)
      else this.create()
    }
    this.pushState()
  }

  back(id: string) {
    this.tabs.get(id)?.view.webContents.navigationHistory.goBack()
  }
  forward(id: string) {
    this.tabs.get(id)?.view.webContents.navigationHistory.goForward()
  }
  reload(id: string) {
    const tab = this.tabs.get(id)
    if (!tab) return
    if (tab.logicalUrl.startsWith('hexacore://')) {
      this.handleInternalNavigation(tab, tab.logicalUrl)
    } else {
      tab.view.webContents.reload()
    }
  }

  setActiveVisible(visible: boolean) {
    if (!this.activeId) return
    const tab = this.tabs.get(this.activeId)!
    tab.view.setVisible(visible)
  }

  private layout() {
    if (!this.activeId) return
    const { width, height } = this.win.getContentBounds()
    const { top, left, right, bottom } = this.insets
    this.tabs.get(this.activeId)!.view.setBounds({
      x: left,
      y: top,
      width: Math.max(0, width - left - right),
      height: Math.max(0, height - top - bottom)
    })
  }

  onResize() {
    this.layout()
  }

  private pushState() {
    const states: TabState[] = [...this.tabs.values()].map(({ id, view, logicalUrl, favicon, internalTitle }) => {
      const wc = view.webContents
      const isInternal = logicalUrl.startsWith('hexacore://')
      const displayUrl = isInternal ? logicalUrl : wc.getURL()
      return {
        id,
        title: internalTitle ?? (wc.getTitle() || (isInternal ? 'HexaCore' : 'New Tab')),
        url: displayUrl,
        favicon: isInternal ? null : favicon,
        loading: wc.isLoading(),
        canGoBack: wc.navigationHistory.canGoBack(),
        canGoForward: wc.navigationHistory.canGoForward(),
        secure: displayUrl.startsWith('https://') || isInternal || displayUrl.includes('app://'),
        active: id === this.activeId
      }
    })
    this.onState(states)
  }
}

export function newTabSearchUrl(): string {
  const engine = Settings.getAll().searchEngine
  switch (engine) {
    case 'google':
      return 'https://www.google.com'
    case 'bing':
      return 'https://www.bing.com'
    default:
      return 'https://duckduckgo.com'
  }
}
