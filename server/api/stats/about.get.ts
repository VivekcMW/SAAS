/**
 * GET /api/stats/about
 * Public marketplace statistics shown on the About page.
 *
 * All counts are derived live from SQLite so the numbers always reflect
 * reality. The endpoint is cached for a short period to avoid hitting the
 * database on every pageview.
 */

import { defineEventHandler, setResponseHeader } from 'h3'
import { getDb } from '~/server/utils/database'

export interface AboutStats {
  products: number
  categories: number
  reviews: number
  users: number
}

export default defineEventHandler((event): AboutStats => {
  const db = getDb()

  const products = (
    db
      .prepare(`SELECT COUNT(*) as count FROM app_listings WHERE status = 'published'`)
      .get() as { count: number }
  ).count

  const categories = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT category) as count
         FROM app_listings
         WHERE status = 'published' AND category IS NOT NULL AND category != ''`
      )
      .get() as { count: number }
  ).count

  const reviews = (
    db
      .prepare(`SELECT COUNT(*) as count FROM reviews WHERE status = 'approved'`)
      .get() as { count: number }
  ).count

  const users = (
    db.prepare(`SELECT COUNT(*) as count FROM users`).get() as { count: number }
  ).count

  // Cache for 5 minutes at the edge; safe because numbers are trailing.
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300')

  return { products, categories, reviews, users }
})
