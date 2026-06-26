import { getDb } from '../db/database'
import type { Bookmark } from '@shared/types'

export const Bookmarks = {
  list(): Bookmark[] {
    return getDb().prepare('SELECT * FROM bookmarks ORDER BY createdAt DESC').all() as Bookmark[]
  },
  add(b: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    const createdAt = Date.now()
    const info = getDb()
      .prepare('INSERT INTO bookmarks(title,url,favicon,folder,createdAt) VALUES (?,?,?,?,?)')
      .run(b.title, b.url, b.favicon ?? null, b.folder ?? 'General', createdAt)
    return { ...b, id: Number(info.lastInsertRowid), createdAt }
  },
  remove(id: number): void {
    getDb().prepare('DELETE FROM bookmarks WHERE id = ?').run(id)
  }
}
