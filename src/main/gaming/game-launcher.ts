import { spawn } from 'child_process'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir, platform } from 'os'
import { randomUUID } from 'crypto'
import { getDb } from '../db/database'
import type { GameEntry, GameLaunchResult } from '@shared/types'

function rowToGame(r: any): GameEntry {
  return { ...r }
}

function parseLibraryFolders(vdfPath: string): string[] {
  if (!existsSync(vdfPath)) return []
  try {
    const txt = readFileSync(vdfPath, 'utf8')
    const paths: string[] = []
    const re = /"path"\s+"([^"]+)"/g
    let m: RegExpExecArray | null
    while ((m = re.exec(txt))) {
      const p = m[1]!.replace(/\\\\/g, '\\')
      paths.push(join(p, 'steamapps'))
    }
    return paths
  } catch {
    return []
  }
}

function defaultSteamAppsDirs(): string[] {
  const base =
    platform() === 'win32'
      ? ['C:/Program Files (x86)/Steam/steamapps', 'C:/Program Files/Steam/steamapps']
      : platform() === 'darwin'
        ? [join(homedir(), 'Library/Application Support/Steam/steamapps')]
        : [join(homedir(), '.steam/steam/steamapps'), join(homedir(), '.local/share/Steam/steamapps')]

  const extra: string[] = []
  for (const dir of base) {
    const libVdf = join(dir, '..', 'steamapps', 'libraryfolders.vdf')
    const altLibVdf = join(dir, 'libraryfolders.vdf')
    extra.push(...parseLibraryFolders(libVdf), ...parseLibraryFolders(altLibVdf))
  }
  return [...new Set([...base, ...extra])].filter((d) => existsSync(d))
}

function scanSteam(): GameEntry[] {
  const games: GameEntry[] = []
  for (const dir of defaultSteamAppsDirs()) {
    for (const file of readdirSync(dir)) {
      if (!file.startsWith('appmanifest_') || !file.endsWith('.acf')) continue
      try {
        const txt = readFileSync(join(dir, file), 'utf8')
        const appid = txt.match(/"appid"\s+"(\d+)"/)?.[1]
        const name = txt.match(/"name"\s+"([^"]+)"/)?.[1]
        const installdir = txt.match(/"installdir"\s+"([^"]+)"/)?.[1]
        if (appid && name) {
          games.push({
            id: `steam-${appid}`,
            name,
            platform: 'steam',
            installPath: installdir ? join(dir, 'common', installdir) : '',
            cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
            launchArgs: `steam://rungameid/${appid}`,
            lastPlayed: null
          })
        }
      } catch {
        /* ignore malformed manifest */
      }
    }
  }
  return games
}

export const GameLauncher = {
  list(): GameEntry[] {
    return (getDb().prepare('SELECT * FROM games ORDER BY lastPlayed DESC, name').all() as any[]).map(rowToGame)
  },
  scan(): GameEntry[] {
    const db = getDb()
    const found = scanSteam()
    const insert = db.prepare(
      `INSERT INTO games(id,name,platform,installPath,cover,launchArgs,lastPlayed)
       VALUES (@id,@name,@platform,@installPath,@cover,@launchArgs,@lastPlayed)
       ON CONFLICT(id) DO UPDATE SET name=@name, installPath=@installPath, cover=@cover`
    )
    const tx = db.transaction((items: GameEntry[]) => items.forEach((g) => insert.run(g)))
    tx(found)
    return this.list()
  },
  addLocal(name: string, exePath: string): GameEntry {
    const g: GameEntry = {
      id: `local-${randomUUID()}`,
      name,
      platform: 'local',
      installPath: exePath,
      cover: null,
      launchArgs: '',
      lastPlayed: null
    }
    getDb()
      .prepare(
        `INSERT INTO games(id,name,platform,installPath,cover,launchArgs,lastPlayed)
         VALUES (@id,@name,@platform,@installPath,@cover,@launchArgs,@lastPlayed)`
      )
      .run(g)
    return g
  },
  launch(id: string): GameLaunchResult {
    const g = getDb().prepare('SELECT * FROM games WHERE id=?').get(id) as GameEntry | undefined
    if (!g) return { ok: false, error: 'Game not found in library.' }
    try {
      if (g.platform === 'steam') {
        const opener = platform() === 'win32' ? 'cmd' : platform() === 'darwin' ? 'open' : 'xdg-open'
        const args = platform() === 'win32' ? ['/c', 'start', '', g.launchArgs] : [g.launchArgs]
        spawn(opener, args, { detached: true, stdio: 'ignore' }).unref()
      } else if (existsSync(g.installPath)) {
        spawn(g.installPath, g.launchArgs ? g.launchArgs.split(' ') : [], { detached: true, stdio: 'ignore' }).unref()
      } else {
        return { ok: false, error: `Install path not found: ${g.installPath}` }
      }
      getDb().prepare('UPDATE games SET lastPlayed=? WHERE id=?').run(Date.now(), id)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Launch failed.' }
    }
  }
}

// Exported for unit tests
export { defaultSteamAppsDirs, parseLibraryFolders, scanSteam }
