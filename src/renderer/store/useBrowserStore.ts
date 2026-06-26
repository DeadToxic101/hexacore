import { create } from 'zustand'
import type {
  TabState, AppSettings, ResourceStats, SecurityStats, Profile, IntegrationStatus,
  BlockedInfo, UpdateStatusPayload
} from '@shared/types'

export type InternalPage =
  | 'dashboard' | 'bookmarks' | 'history' | 'downloads' | 'games'
  | 'settings' | 'profiles' | 'passwords' | 'news' | 'integrations' | null

interface ToastState {
  message: string
  type: 'info' | 'error'
}

interface BrowserStore {
  tabs: TabState[]
  activeTab: TabState | null
  internalPage: InternalPage
  blockedInfo: BlockedInfo | null
  settings: AppSettings | null
  resources: ResourceStats | null
  security: SecurityStats | null
  profile: Profile | null
  integrations: IntegrationStatus | null
  updateStatus: UpdateStatusPayload | null
  toast: ToastState | null

  setTabs: (t: TabState[]) => void
  setInternalPage: (p: InternalPage) => void
  setBlockedInfo: (b: BlockedInfo | null) => void
  setSettings: (s: AppSettings) => void
  setResources: (r: ResourceStats) => void
  setSecurity: (s: SecurityStats) => void
  setProfile: (p: Profile) => void
  setIntegrations: (i: IntegrationStatus) => void
  setUpdateStatus: (u: UpdateStatusPayload | null) => void
  setToast: (t: ToastState | null) => void
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  tabs: [],
  activeTab: null,
  internalPage: 'dashboard',
  blockedInfo: null,
  settings: null,
  resources: null,
  security: null,
  profile: null,
  integrations: null,
  updateStatus: null,
  toast: null,

  setTabs: (tabs) => set({ tabs, activeTab: tabs.find((t) => t.active) ?? null }),
  setInternalPage: (internalPage) => {
    window.hexacore.tab.setVisible(internalPage === null && !useBrowserStore.getState().blockedInfo)
    set({ internalPage, blockedInfo: internalPage ? null : useBrowserStore.getState().blockedInfo })
  },
  setBlockedInfo: (blockedInfo) => {
    window.hexacore.tab.setVisible(blockedInfo === null && useBrowserStore.getState().internalPage === null)
    set({ blockedInfo, internalPage: blockedInfo ? null : useBrowserStore.getState().internalPage })
  },
  setSettings: (settings) => set({ settings }),
  setResources: (resources) => set({ resources }),
  setSecurity: (security) => set({ security }),
  setProfile: (profile) => set({ profile }),
  setIntegrations: (integrations) => set({ integrations }),
  setUpdateStatus: (updateStatus) => set({ updateStatus }),
  setToast: (toast) => set({ toast })
}))
