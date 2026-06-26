import { getDb } from '../db/database'
import type { DownloadItem } from '@shared/types'

export const Downloads = {
  upsert(d: DownloadItem): void {
    getDb()
      .prepare(
        `INSERT INTO downloads(id,filename,url,savePath,received,total,status,startedAt)
         VALUES (@id,@filename,@url,@savePath,@received,@total,@status,@startedAt)
         ON CONFLICT(id) DO UPDATE SET received=@received,total=@total,status=@status`
      )
      .run(d)
  },
  list(): DownloadItem[] {
    return getDb().prepare('SELECT * FROM downloads ORDER BY startedAt DESC').all() as DownloadItem[]
  }
}
