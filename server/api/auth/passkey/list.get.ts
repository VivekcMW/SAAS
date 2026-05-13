/**
 * GET /api/auth/passkey/list
 * Returns the authenticated user's registered passkeys.
 */
import { requireUser } from '~/server/utils/auth'
import { getCredentialsByUserId, ensurePasskeyTable } from '~/server/utils/passkey'

export default defineEventHandler(async (event) => {
  ensurePasskeyTable()
  const user = await requireUser(event)
  const creds = getCredentialsByUserId(user.id)
  return creds.map((c) => ({ id: c.id, created_at: c.created_at }))
})
