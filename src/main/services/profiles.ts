import { randomUUID } from 'crypto'
import { getDb } from '../db/database'
import type { Profile } from '@shared/types'

const COLORS = ['#00e5ff', '#7c3aed', '#00ffa3', '#ff2d55', '#ffb800', '#0091ff']

function rowToProfile(r: any): Profile {
  return { ...r, isActive: !!r.isActive }
}

export const Profiles = {
  ensureDefault(): void {
    const db = getDb()
    const count = (db.prepare('SELECT COUNT(*) c FROM profiles').get() as { c: number }).c
    if (count === 0) {
      this.create('Player One')
    }
  },
  list(): Profile[] {
    return (getDb().prepare('SELECT * FROM profiles ORDER BY createdAt').all() as any[]).map(rowToProfile)
  },
  active(): Profile {
    const r = getDb().prepare('SELECT * FROM profiles WHERE isActive=1 LIMIT 1').get() as any
    return r ? rowToProfile(r) : this.list()[0]
  },
  create(name: string): Profile {
    const db = getDb()
    const id = randomUUID()
    const profile: Profile = {
      id,
      name,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      partition: `persist:profile-${id}`,
      isActive: db.prepare('SELECT COUNT(*) c FROM profiles').get() as any && false,
      createdAt: Date.now()
    }
    db.prepare(
      'INSERT INTO profiles(id,name,avatarColor,partition,isActive,createdAt) VALUES (?,?,?,?,?,?)'
    ).run(id, profile.name, profile.avatarColor, profile.partition, 0, profile.createdAt)
    if (this.list().length === 1) this.switch(id)
    return rowToProfile(db.prepare('SELECT * FROM profiles WHERE id=?').get(id))
  },
  switch(id: string): void {
    const db = getDb()
    db.prepare('UPDATE profiles SET isActive=0').run()
    db.prepare('UPDATE profiles SET isActive=1 WHERE id=?').run(id)
  },
  remove(id: string): void {
    const db = getDb()
    if (this.list().length <= 1) return
    const wasActive = (db.prepare('SELECT isActive FROM profiles WHERE id=?').get(id) as any)?.isActive
    db.prepare('DELETE FROM profiles WHERE id=?').run(id)
    if (wasActive) this.switch(this.list()[0].id)
  }
}
