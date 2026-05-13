/**
 * GET /api/recommendations
 * Returns personalised app recommendations for the current user.
 */
import { getDb } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'

const MAX_RESULTS = 6

function getUserContext(db: ReturnType<typeof getDb>, userId: string) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_apps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, app_id)
    )
  `)

  const saved = db.prepare('SELECT app_id FROM saved_apps WHERE user_id = ?').all(userId) as { app_id: string }[]
  const excludeIds = saved.map(r => r.app_id)

  const stack = db.prepare('SELECT tools FROM buyer_stacks WHERE user_id = ?').get(userId) as { tools: string } | undefined
  if (stack) {
    try {
      const tools: Array<{ app_id?: string }> = JSON.parse(stack.tools)
      for (const t of tools) {
        if (t.app_id && !excludeIds.includes(t.app_id)) excludeIds.push(t.app_id)
      }
    } catch { /* ignore */ }
  }

  return excludeIds
}

function getCategories(db: ReturnType<typeof getDb>, excludeIds: string[]) {
  if (!excludeIds.length) return []
  const placeholders = excludeIds.map(() => '?').join(',')
  const rows = db.prepare(
    `SELECT DISTINCT category FROM app_listings WHERE id IN (${placeholders}) AND category IS NOT NULL`
  ).all(...excludeIds) as { category: string }[]
  return rows.map(r => r.category).filter(Boolean)
}

function queryByCategories(db: ReturnType<typeof getDb>, categories: string[], excludeIds: string[]) {
  const catPh = categories.map(() => '?').join(',')
  const exPh = excludeIds.length ? `AND id NOT IN (${excludeIds.map(() => '?').join(',')})` : ''
  return db.prepare(`
    SELECT id, slug, name, short_description, logo_url, category, rating, review_count, pricing_type, pricing_starts_at
    FROM app_listings
    WHERE status = 'published' AND category IN (${catPh}) ${exPh}
    ORDER BY rating DESC, review_count DESC
    LIMIT ${MAX_RESULTS}
  `).all(...categories, ...excludeIds) as any[]
}

function queryTrending(db: ReturnType<typeof getDb>) {
  return db.prepare(`
    SELECT id, slug, name, short_description, logo_url, category, rating, review_count, pricing_type, pricing_starts_at
    FROM app_listings
    WHERE status = 'published'
    ORDER BY trending DESC, rating DESC
    LIMIT ${MAX_RESULTS}
  `).all() as any[]
}

function formatApps(apps: any[]) {
  return apps.map(a => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.short_description,
    logoUrl: a.logo_url,
    category: a.category,
    rating: a.rating,
    reviewCount: a.review_count,
    pricingType: a.pricing_type,
    pricingStartsAt: a.pricing_starts_at,
  }))
}

export default defineEventHandler(async (event) => {
  const db = getDb()
  const user = await getSessionUser(event).catch(() => null)

  if (!user) {
    return { source: 'trending', apps: formatApps(queryTrending(db)) }
  }

  const excludeIds = getUserContext(db, user.id)
  const categories = getCategories(db, excludeIds)

  if (categories.length === 0) {
    return { source: 'trending', apps: formatApps(queryTrending(db)) }
  }

  const apps = queryByCategories(db, categories, excludeIds)
  return { source: 'personalised', apps: formatApps(apps) }
})
