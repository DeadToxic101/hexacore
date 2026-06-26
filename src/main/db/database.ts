import { Database as WasmDatabase } from 'node-sqlite3-wasm'
import { app } from 'electron'
import { join } from 'path'

// HexaCore uses node-sqlite3-wasm — a pure WebAssembly build of SQLite. It needs
// NO native compiler / Visual Studio and works on any Node or Electron version.
// The thin wrapper below re-exposes the small slice of the better-sqlite3 API the
// rest of the app relies on (prepare → run/get/all, exec, pragma, transaction)
// so the service layer stays unchanged.

// Translate better-sqlite3's variadic calling convention into the single
// array/object node-sqlite3-wasm expects:
//   run(a, b, c)        -> [a, b, c]        (positional)
//   run([a, b])         -> [a, b]           (positional)
//   run({ id, name })   -> { ":id", ":name" } (named, prefix added)
function bind(args: unknown[]): unknown[] | Record<string, unknown> | undefined {
  if (args.length === 0) return undefined
  if (args.length === 1) {
    const a = args[0]
    if (Array.isArray(a)) return a
    if (a !== null && typeof a === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(a as Record<string, unknown>)) out[k.startsWith(':') ? k : ':' + k] = v
      return out
    }
    return [a]
  }
  return args
}
// better-sqlite3 allowed @name; node-sqlite3-wasm uses :name.
const normSql = (sql: string) => sql.replace(/@(\w+)/g, ':$1')

interface Stmt {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number }
  get: <T = any>(...params: unknown[]) => T | undefined
  all: <T = any>(...params: unknown[]) => T[]
}

export interface Db {
  prepare: (sql: string) => Stmt
  exec: (sql: string) => void
  pragma: (p: string) => void
  transaction: <A extends any[], R>(fn: (...args: A) => R) => (...args: A) => R
  close: () => void
}

let db: Db | null = null

function wrap(raw: WasmDatabase): Db {
  return {
    prepare(sql: string): Stmt {
      const stmt = raw.prepare(normSql(sql))
      return {
        run: (...params: unknown[]) => stmt.run(bind(params) as any) as any,
        get: (...params: unknown[]) => stmt.get(bind(params) as any) as any,
        all: (...params: unknown[]) => stmt.all(bind(params) as any) as any
      }
    },
    exec: (sql: string) => raw.exec(sql),
    pragma: (p: string) => {
      try {
        raw.exec(`PRAGMA ${p};`)
      } catch {
        /* unsupported pragma in wasm build (e.g. WAL) — safe to ignore */
      }
    },
    transaction<A extends any[], R>(fn: (...args: A) => R) {
      return (...args: A): R => {
        raw.exec('BEGIN')
        try {
          const r = fn(...args)
          raw.exec('COMMIT')
          return r
        } catch (e) {
          raw.exec('ROLLBACK')
          throw e
        }
      }
    },
    close: () => raw.close()
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT,
  folder TEXT DEFAULT 'General',
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  url TEXT NOT NULL,
  favicon TEXT,
  visitedAt INTEGER NOT NULL,
  visitCount INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
CREATE INDEX IF NOT EXISTS idx_history_visited ON history(visitedAt DESC);
CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  savePath TEXT NOT NULL,
  received INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  status TEXT DEFAULT 'progressing',
  startedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatarColor TEXT NOT NULL,
  partition TEXT NOT NULL,
  isActive INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origin TEXT NOT NULL,
  username TEXT NOT NULL,
  cipher TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(origin, username)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  installPath TEXT,
  cover TEXT,
  launchArgs TEXT DEFAULT '',
  lastPlayed INTEGER
);
CREATE TABLE IF NOT EXISTS security_stats (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
);
`

export function getDb(): Db {
  if (db) return db
  const path = join(app.getPath('userData'), 'hexacore.db')
  db = wrap(new WasmDatabase(path))
  db.exec(SCHEMA)
  // seed security counters
  const seed = db.prepare('INSERT OR IGNORE INTO security_stats(key,value) VALUES (?,0)')
  for (const k of ['adsBlocked', 'trackersBlocked', 'httpsUpgrades', 'phishingBlocked']) seed.run(k)
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}
