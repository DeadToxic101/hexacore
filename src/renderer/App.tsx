import { useEffect, useRef } from 'react'
import { useBrowserStore } from './store/useBrowserStore'
import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import FpsOverlay from './components/FpsOverlay'
import UpdateBanner from './components/UpdateBanner'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Bookmarks from './pages/Bookmarks'
import HistoryPage from './pages/History'
import Downloads from './pages/Downloads'
import GameLauncher from './pages/GameLauncher'
import Settings from './pages/Settings'
import Profiles from './pages/Profiles'
import PasswordManager from './pages/PasswordManager'
import NewsFeed from './pages/NewsFeed'
import Integrations from './pages/Integrations'
import BlockedPage from './pages/BlockedPage'
import type { InternalPage } from './store/useBrowserStore'

const TOP_INSET = 124
const LEFT_INSET = 72

export default function App() {
  const {
    internalPage, blockedInfo, settings, tabs,
    setTabs, setSettings, setResources, setSecurity, setProfile, setIntegrations,
    setInternalPage, setBlockedInfo, setToast
  } = useBrowserStore()
  const fpsRef = useRef(60)

  useEffect(() => {
    window.hexacore.settings.get().then(setSettings)
    window.hexacore.profiles.active().then(setProfile)
    window.hexacore.security.stats().then(setSecurity)
    window.hexacore.integrations.status().then(setIntegrations)
    window.hexacore.tab.setInsets({ top: TOP_INSET, left: LEFT_INSET, right: 0, bottom: 0 })

    const offTabs = window.hexacore.tab.onState(setTabs)
    const offRes = window.hexacore.resources.onStats((s) => {
      setResources({ ...s, fps: fpsRef.current })
      window.hexacore.security.stats().then(setSecurity)
    })
    const offInternal = window.hexacore.app.onInternalNavigate(({ page }) => {
      setBlockedInfo(null)
      setInternalPage(page as InternalPage)
    })
    const offBlocked = window.hexacore.app.onBlocked((info) => {
      setBlockedInfo(info)
    })
    const offIntegration = window.hexacore.integrations.onUpdated(setIntegrations)
    const offIntegrationMsg = window.hexacore.integrations.onMessage((msg) => {
      setToast({ message: msg.reason ?? (msg.ok ? 'Integration connected' : 'Integration failed'), type: msg.ok ? 'info' : 'error' })
    })

    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = (t: number) => {
      frames++
      if (t - last >= 1000) {
        fpsRef.current = frames
        window.hexacore.resources.reportFps(frames)
        frames = 0
        last = t
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      offTabs()
      offRes()
      offInternal()
      offBlocked()
      offIntegration()
      offIntegrationMsg()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rgb = settings?.rgbEffects ?? true
  const theme = settings?.theme ?? 'neon-blue'

  return (
    <div className={`relative h-screen w-screen bg-hex-bg ${rgb ? 'rgb-frame' : ''}`} data-theme={theme}>
      <TitleBar />
      <Sidebar />
      <Toast />
      <UpdateBanner />

      <div className="absolute left-[72px] right-0 top-9 z-20">
        <TabBar />
        <Toolbar />
      </div>

      {blockedInfo && (
        <div
          className="absolute z-10 overflow-y-auto animate-slideIn"
          style={{ left: LEFT_INSET, top: TOP_INSET, right: 0, bottom: 0 }}
        >
          <BlockedPage info={blockedInfo} />
        </div>
      )}

      {!blockedInfo && internalPage && (
        <div
          className="absolute z-10 overflow-y-auto animate-slideIn"
          style={{ left: LEFT_INSET, top: TOP_INSET, right: 0, bottom: 0 }}
        >
          {internalPage === 'dashboard' && <Dashboard />}
          {internalPage === 'bookmarks' && <Bookmarks />}
          {internalPage === 'history' && <HistoryPage />}
          {internalPage === 'downloads' && <Downloads />}
          {internalPage === 'games' && <GameLauncher />}
          {internalPage === 'settings' && <Settings />}
          {internalPage === 'profiles' && <Profiles />}
          {internalPage === 'passwords' && <PasswordManager />}
          {internalPage === 'news' && <NewsFeed />}
          {internalPage === 'integrations' && <Integrations />}
        </div>
      )}

      {settings?.fpsOverlay && <FpsOverlay />}
      {tabs.length === 0 && null}
    </div>
  )
}
