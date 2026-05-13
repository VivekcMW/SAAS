/**
 * DELETE /api/auth/passkey/remove
 * Removes a passkey credential that belongs to the authenticated user.
 */
import { requireUser } from '~/server/utils/auth'
import { ensurePasskeyTable } from '~/server/utils/passkey'

export default defineEventHandler(async (event) => {
  ensurePasskeyTable()
  const user = await requireUser(event)
  const body = await readBody(event)
  const id = body?.id as string | undefined

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Credential id is required.' })

  const db = (await import('~/server/utils/database')).getDb()
  const row = db.prepare(`SELECT user_id FROM passkey_credentials WHERE id = ?`).get(id) as
    | { user_id: string } | undefined

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Credential not found.' })
  if (row.user_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden.' })

  db.prepare(`DELETE FROM passkey_credentials WHERE id = ?`).run(id)

  return { success: true }
})
