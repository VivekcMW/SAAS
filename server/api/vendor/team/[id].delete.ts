import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()
  const memberId = event.context.params?.id as string

  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const member = db.prepare('SELECT id, role FROM team_members WHERE id = ? AND vendor_id = ?').get(memberId, vendorRow.id) as { id: string; role: string } | undefined
  if (!member) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  if (member.role === 'owner') throw createError({ statusCode: 403, statusMessage: 'Cannot remove owner' })

  db.prepare('DELETE FROM team_members WHERE id = ?').run(memberId)

  return { success: true }
})
