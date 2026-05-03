import { getDb } from '~/server/utils/database'

export default defineTask({
  meta: {
    name: 'session:cleanup',
    description: 'Delete expired sessions from the database'
  },
  async run() {
    const db = getDb()
    const result = db
      .prepare("DELETE FROM sessions WHERE expires_at < datetime('now')")
      .run()
    return { result: 'ok', deleted: result.changes }
  }
})
