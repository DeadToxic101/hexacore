import { getDb } from '../db/database'
import type { HistoryEntry } from '@shared/types'

export const History = {
  record(url: string, title: string, favicon: string | null): void {
    const db = getDb()
    const existing = db.prepare('SELECT id, visitCount FROM history WHERE url = ?').get(url) as
      | { id: number; visitCount: number }
      | undefined
    if (existing) {
      db.prepare('UPDATE history SET visitedAt=?, visitCount=?, title=?, favicon=? WHERE id=?')
        .run(Date.now(), existing.visitCount + 1, title, favicon, existing.id)
    } else {
      db.prepare('INSERT INTO history(title,url,favicon,visitedAt,visitCount) VALUES (?,?,?,?,1)')
        .run(title, url, favicon, Date.now())
    }
  },
  list(limit = 200): HistoryEntry[] {
    return getDb().prepare('SELECT * FROM history ORDER BY visitedAt DESC LIMIT ?').all(limit) as HistoryEntry[]
  },
  search(q: string): HistoryEntry[] {
    return getDb()
      .prepare('SELECT * FROM history WHERE url LIKE ? OR title LIKE ? ORDER BY visitedAt DESC LIMIT 100')
      .all(`%${q}%`, `%${q}%`) as HistoryEntry[]
  },
  clear(): void {
    getDb().prepare('DELETE FROM history').run()
  }
}
