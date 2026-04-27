import { requireVendor } from '~/server/utils/auth'
import { getDb, makeId } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()
  const body = await readBody(event) as { email: string; role: string }

  if (!body.email || !body.email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email required' })
  }
  const role = ['admin', 'editor', 'viewer'].includes(body.role) ? body.role : 'editor'

  const vendorRow = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(user.id) as { id: string } | undefined
  if (!vendorRow) throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })

  // Check if already a member
  const existing = db.prepare('SELECT id FROM team_members WHERE vendor_id = ? AND email = ?').get(vendorRow.id, body.email)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Email already invited' })

  // Check if user already has an account
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email) as { id: string } | undefined

  const memberId = makeId('tm')
  db.prepare(`
    INSERT INTO team_members (id, vendor_id, user_id, email, role, status, invited_at)
    VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).run(memberId, vendorRow.id, existingUser?.id ?? null, body.email, role)

  return { success: true, id: memberId, email: body.email, role, status: 'pending' }
})
