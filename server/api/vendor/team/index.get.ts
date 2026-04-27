import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  const members = db.prepare(`
    SELECT tm.id, tm.email, tm.role, tm.status, tm.invited_at, tm.accepted_at,
           u.first_name, u.last_name
    FROM team_members tm
    LEFT JOIN users u ON u.id = tm.user_id
    WHERE tm.vendor_id = ?
    ORDER BY tm.invited_at ASC
  `).all(vendorRow.id) as any[]

  return {
    members: members.map(m => ({
      id: m.id,
      email: m.email,
      name: m.first_name ? `${m.first_name} ${m.last_name}`.trim() : m.email,
      role: m.role,
      status: m.status,
      invitedAt: m.invited_at,
      acceptedAt: m.accepted_at
    }))
  }
})
