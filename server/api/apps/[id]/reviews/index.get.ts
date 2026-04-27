/**
 * Reviews API - GET /api/apps/[id]/reviews
 * Retrieve paginated reviews for an application from the database.
 */

import { createError, defineEventHandler, getQuery, getRouterParams } from 'h3'
import type { PaginatedReviews, Review } from '~/types/enhanced-app'
import { getDb, type DbReview } from '~/server/utils/database'

function mapReview(row: DbReview): Review {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    userName: row.user_name,
    userEmail: row.user_email || undefined,
    rating: row.rating,
    title: row.title,
    content: row.content,
    verified: row.verified === 1,
    helpfulVotes: row.helpful_votes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    status: row.status,
    metadata: {
      platform: row.platform || undefined,
      version: row.version || undefined
    }
  }
}

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const appId = params.id
  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10))
  const sort = (query.sort as string) || 'newest'
  const ratingFilter = query.rating ? Number(query.rating) : undefined

  const db = getDb()

  let orderBy: string
  switch (sort) {
    case 'oldest': orderBy = 'created_at ASC'; break
    case 'rating_high': orderBy = 'rating DESC, created_at DESC'; break
    case 'rating_low': orderBy = 'rating ASC, created_at DESC'; break
    case 'helpful': orderBy = 'helpful_votes DESC, created_at DESC'; break
    default: orderBy = 'created_at DESC'
  }

  const whereClauses = ['app_id = ?', "status = 'approved'"]
  const whereParams: unknown[] = [appId]
  if (ratingFilter) {
    whereClauses.push('rating = ?')
    whereParams.push(ratingFilter)
  }
  const whereSql = whereClauses.join(' AND ')

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM reviews WHERE ${whereSql}`)
    .get(...whereParams) as { count: number }
  const total = totalRow.count

  const offset = (page - 1) * limit
  const rows = db
    .prepare(`SELECT * FROM reviews WHERE ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...whereParams, limit, offset) as DbReview[]

  // Attach vendor replies
  const reviewIds = rows.map(r => r.id)
  let repliesMap: Record<string, { body: string; created_at: string }> = {}
  if (reviewIds.length > 0) {
    const placeholders = reviewIds.map(() => '?').join(',')
    const replyRows = db.prepare(
      `SELECT review_id, body, created_at FROM review_replies WHERE review_id IN (${placeholders})`
    ).all(...reviewIds) as Array<{ review_id: string; body: string; created_at: string }>
    replyRows.forEach(r => { repliesMap[r.review_id] = { body: r.body, created_at: r.created_at } })
  }

  const breakdownRows = db
    .prepare(
      `SELECT rating, COUNT(*) as count FROM reviews WHERE app_id = ? AND status = 'approved' GROUP BY rating`
    )
    .all(appId) as Array<{ rating: number; count: number }>

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 }
  breakdownRows.forEach(r => {
    const key = r.rating as 1 | 2 | 3 | 4 | 5
    if (key >= 1 && key <= 5) {
      ratingBreakdown[key] = r.count
      ratingBreakdown.total += r.count
    }
  })

  const avgRow = db
    .prepare(`SELECT AVG(rating) as avg FROM reviews WHERE app_id = ? AND status = 'approved'`)
    .get(appId) as { avg: number | null }
  const averageRating = avgRow.avg ? Math.round(avgRow.avg * 10) / 10 : 0

  const response: PaginatedReviews = {
    reviews: rows.map(r => ({ ...mapReview(r), vendorReply: repliesMap[r.id] || null })),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
    averageRating,
    ratingBreakdown
  }

  return response
})
