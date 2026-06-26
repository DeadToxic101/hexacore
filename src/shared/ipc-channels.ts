// Central registry of IPC channel names shared between main & renderer.
export const IPC = {
  // Tabs / navigation
  TAB_CREATE: 'tab:create',
  TAB_CLOSE: 'tab:close',
  TAB_ACTIVATE: 'tab:activate',
  TAB_NAVIGATE: 'tab:navigate',
  TAB_BACK: 'tab:back',
  TAB_FORWARD: 'tab:forward',
  TAB_RELOAD: 'tab:reload',
  TAB_STATE: 'tab:state',           // main -> renderer push
  TAB_SET_BOUNDS: 'tab:setBounds',
  TAB_SET_VISIBLE: 'tab:setVisible',
  INTERNAL_NAVIGATE: 'internal:navigate',   // main -> renderer
  BLOCKED: 'security:blocked',              // main -> renderer

  // Bookmarks
  BOOKMARK_LIST: 'bookmark:list',
  BOOKMARK_ADD: 'bookmark:add',
  BOOKMARK_REMOVE: 'bookmark:remove',

  // History
  HISTORY_LIST: 'history:list',
  HISTORY_SEARCH: 'history:search',
  HISTORY_CLEAR: 'history:clear',

  // Downloads
  DOWNLOAD_LIST: 'download:list',
  DOWNLOAD_UPDATE: 'download:update',   // main -> renderer push
  DOWNLOAD_OPEN: 'download:open',
  DOWNLOAD_PAUSE: 'download:pause',
  DOWNLOAD_RESUME: 'download:resume',
  DOWNLOAD_CANCEL: 'download:cancel',

  // Profiles
  PROFILE_LIST: 'profile:list',
  PROFILE_CREATE: 'profile:create',
  PROFILE_SWITCH: 'profile:switch',
  PROFILE_DELETE: 'profile:delete',
  PROFILE_ACTIVE: 'profile:active',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Passwords
  PASSWORD_LIST: 'password:list',
  PASSWORD_SAVE: 'password:save',
  PASSWORD_REVEAL: 'password:reveal',
  PASSWORD_DELETE: 'password:delete',

  // Security stats
  SECURITY_STATS: 'security:stats',

  // Gaming
  RESOURCE_STATS: 'resource:stats',     // main -> renderer push
  RESOURCE_LIMITS_GET: 'resource:limitsGet',
  RESOURCE_LIMITS_SET: 'resource:limitsSet',
  GAMES_LIST: 'games:list',
  GAMES_SCAN: 'games:scan',
  GAMES_LAUNCH: 'games:launch',

  // Integrations
  INTEGRATION_STATUS: 'integration:status',
  INTEGRATION_CONNECT: 'integration:connect',
  INTEGRATION_DISCONNECT: 'integration:disconnect',
  INTEGRATION_UPDATED: 'integration:updated',   // main -> renderer push
  INTEGRATION_MESSAGE: 'integration:message',   // main -> renderer push
  NEWS_FEED: 'news:feed',

  // Auto-update
  UPDATE_STATUS: 'update:status',               // main -> renderer push
  UPDATE_CHECK: 'update:check',
  UPDATE_INSTALL: 'update:install'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
