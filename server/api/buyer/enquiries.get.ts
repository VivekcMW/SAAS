/**
 * GET /api/buyer/enquiries
 * Returns the authenticated buyer's enquiry threads with unread message counts.
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

interface EnquiryRow {
  id: string
  app_id: string
  vendor_id: string
  buyer_email: string
  buyer_name: string
  subject: string
  status: string
  created_at: string
  updated_at: string
  app_name: string
  app_slug: string
  vendor_name: string
  last_message: string | null
  last_message_at: string | null
  unread: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  const rows = db.prepare(`
    SELECT
      e.id,
      e.app_id,
      e.vendor_id,
      e.buyer_email,
      e.buyer_name,
      e.subject,
      e.status,
      e.created_at,
      e.updated_at,
      COALESCE(a.name, e.subject)  AS app_name,
      COALESCE(a.slug, '')         AS app_slug,
      COALESCE(vp.company_name, '') AS vendor_name,
      (SELECT body      FROM enquiry_messages WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM enquiry_messages WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
      (
        SELECT COUNT(*) FROM enquiry_messages em
        WHERE em.enquiry_id = e.id AND em.sender_id != ? AND em.sender_id IS NOT NULL
      ) AS unread
    FROM enquiries e
    LEFT JOIN app_listings a    ON a.id = e.app_id
    LEFT JOIN vendor_profiles vp ON vp.id = e.vendor_id
    WHERE e.buyer_id = ? OR e.buyer_email = ?
    ORDER BY e.updated_at DESC
  `).all(user.id, user.id, user.email) as EnquiryRow[]

  return {
    enquiries: rows.map(r => ({
      id: r.id,
      product: r.app_name,
      productSlug: r.app_slug,
      vendor: r.vendor_name || 'Vendor',
      subject: r.subject,
      lastMessage: r.last_message || r.subject,
      lastMessageAt: r.last_message_at ? formatRelative(r.last_message_at) : formatRelative(r.created_at),
      status: r.status as 'open' | 'awaiting-reply' | 'closed',
      unread: Number(r.unread),
    })),
  }
})

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}
