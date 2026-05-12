/**
 * GET /api/marketplace/sponsored
 * Returns active sponsored app listings for display in the marketplace hero.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async () => {
  const db = getDb()
  const rows = db.prepare(`
    SELECT a.id, a.name, a.logo, a.slug,
           COALESCE(cat.name, '') as category,
           COALESCE(a.rating, 0) as rating
    FROM sponsored_slots ss
    JOIN app_listings a ON a.id = ss.app_id
    LEFT JOIN categories cat ON cat.id = a.category_id
    WHERE ss.status = 'active'
      AND a.status = 'published'
      AND (ss.end_date IS NULL OR ss.end_date > datetime('now'))
    ORDER BY ss.created_at DESC
    LIMIT 6
  `).all() as Array<{ id: string; name: string; logo: string | null; slug: string; category: string; rating: number }>

  return {
    apps: rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      logo: r.logo,
      rating: r.rating
    }))
  }
})
