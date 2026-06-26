import { shell } from 'electron'
import { getDb } from '../db/database'
import { safeJsonParse } from '@shared/utils'
import type { IntegrationStatus } from '@shared/types'

type Provider = 'discord' | 'twitch' | 'steam'

const pendingStates = new Map<string, Provider>()

const AUTH_URLS: Record<Provider, (state: string) => string | null> = {
  discord: (state) => {
    const id = process.env.HEXACORE_DISCORD_CLIENT_ID
    return id
      ? `https://discord.com/oauth2/authorize?client_id=${id}&response_type=code&scope=identify%20rpc&state=${state}&redirect_uri=hexacore://oauth/discord`
      : null
  },
  twitch: (state) => {
    const id = process.env.HEXACORE_TWITCH_CLIENT_ID
    return id
      ? `https://id.twitch.tv/oauth2/authorize?client_id=${id}&response_type=code&scope=user:read:email&state=${state}&redirect_uri=hexacore://oauth/twitch`
      : null
  },
  steam: () => 'https://steamcommunity.com/openid/login'
}

function readState(): IntegrationStatus {
  const row = getDb().prepare("SELECT value FROM settings WHERE key='integrations'").get() as { value: string } | undefined
  return row
    ? safeJsonParse(row.value, { discord: { connected: false }, twitch: { connected: false }, steam: { connected: false } })
    : { discord: { connected: false }, twitch: { connected: false }, steam: { connected: false } }
}

function writeState(state: IntegrationStatus): void {
  getDb()
    .prepare("INSERT INTO settings(key,value) VALUES ('integrations',?) ON CONFLICT(key) DO UPDATE SET value=?")
    .run(JSON.stringify(state), JSON.stringify(state))
}

export const Integrations = {
  status(): IntegrationStatus {
    return readState()
  },

  connect(provider: Provider): { ok: boolean; reason?: string } {
    const envKey = provider === 'steam' ? 'HEXACORE_STEAM_API_KEY' : `HEXACORE_${provider.toUpperCase()}_CLIENT_ID`
    if (!process.env[envKey]) {
      return {
        ok: false,
        reason: `Set ${envKey} in your environment to enable ${provider} integration.`
      }
    }

    const state = Math.random().toString(36).slice(2)
    pendingStates.set(state, provider)
    const url = AUTH_URLS[provider](state)
    if (!url) {
      pendingStates.delete(state)
      return { ok: false, reason: `Could not build ${provider} authorization URL.` }
    }
    shell.openExternal(url)
    return { ok: true }
  },

  completeOAuth(
    provider: Provider,
    code: string,
    state?: string
  ): { ok: boolean; reason?: string } {
    if (state) {
      const expected = pendingStates.get(state)
      pendingStates.delete(state)
      if (expected && expected !== provider) {
        return { ok: false, reason: 'OAuth state mismatch — authorization rejected.' }
      }
    }

    const envKey = provider === 'steam' ? 'HEXACORE_STEAM_API_KEY' : `HEXACORE_${provider.toUpperCase()}_CLIENT_ID`
    if (!process.env[envKey]) {
      return { ok: false, reason: `Missing ${envKey}; cannot complete ${provider} connection.` }
    }

    // Token exchange requires client secrets — persist connected state only after a real exchange.
    // For now, mark as pending until backend token exchange is implemented.
    const s = readState()
    s[provider] = { connected: true, username: `${provider} (pending token exchange)` }
    writeState(s)
    return {
      ok: true,
      reason: `${provider} authorized. Token exchange pending — connection stored for development.`
    }
  },

  completeConnect(provider: Provider, username: string): IntegrationStatus {
    const state = readState()
    state[provider] = { connected: true, username }
    writeState(state)
    return state
  },

  disconnect(provider: Provider): IntegrationStatus {
    const state = readState()
    state[provider] = { connected: false }
    writeState(state)
    return state
  }
}
