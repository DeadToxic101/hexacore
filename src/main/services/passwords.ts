import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getDb } from '../db/database'
import type { PasswordEntry, PasswordRevealResult } from '@shared/types'

const ALGO = 'aes-256-gcm'

function masterKey(): Buffer {
  const keyPath = join(app.getPath('userData'), 'vault.key')
  if (existsSync(keyPath)) {
    const blob = readFileSync(keyPath)
    if (safeStorage.isEncryptionAvailable()) return scryptSync(safeStorage.decryptString(blob), 'hexacore', 32)
    return scryptSync(blob.toString('utf8'), 'hexacore', 32)
  }
  const secret = randomBytes(48).toString('base64')
  const toStore = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(secret) : Buffer.from(secret)
  writeFileSync(keyPath, toStore, { mode: 0o600 })
  return scryptSync(secret, 'hexacore', 32)
}

function encrypt(plain: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, masterKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return { cipher: enc.toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') }
}

function decrypt(cipherB64: string, ivB64: string, tagB64: string): string {
  const decipher = createDecipheriv(ALGO, masterKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(cipherB64, 'base64')), decipher.final()]).toString('utf8')
}

export const Passwords = {
  list(): PasswordEntry[] {
    return getDb()
      .prepare('SELECT id, origin, username, updatedAt FROM passwords ORDER BY origin')
      .all() as PasswordEntry[]
  },
  save(origin: string, username: string, password: string): void {
    const { cipher, iv, tag } = encrypt(password)
    getDb()
      .prepare(
        `INSERT INTO passwords(origin,username,cipher,iv,tag,updatedAt) VALUES (?,?,?,?,?,?)
         ON CONFLICT(origin,username) DO UPDATE SET cipher=?,iv=?,tag=?,updatedAt=?`
      )
      .run(origin, username, cipher, iv, tag, Date.now(), cipher, iv, tag, Date.now())
  },
  reveal(id: number): PasswordRevealResult {
    const row = getDb().prepare('SELECT cipher,iv,tag FROM passwords WHERE id=?').get(id) as
      | { cipher: string; iv: string; tag: string }
      | undefined
    if (!row) return { ok: false, reason: 'Password entry not found.' }
    try {
      return { ok: true, password: decrypt(row.cipher, row.iv, row.tag) }
    } catch {
      return { ok: false, reason: 'Could not decrypt password — vault key may have changed.' }
    }
  },
  remove(id: number): void {
    getDb().prepare('DELETE FROM passwords WHERE id=?').run(id)
  }
}
