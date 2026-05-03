/**
 * Reviews API - POST /api/apps/[id]/reviews
 * Submit a new review for an application. Stored in DB with status='pending'.
 */

import { createError, defineEventHandler, readBody, getRouterParams } from 'h3'
import type { Review, ReviewFormData } from '~/types/enhanced-app'
import { getDb, makeId, logActivity, type DbAppListing, type DbReview } from '~/server/utils/database'
import { getSessionUser } from '~/server/utils/auth'
import { buildReviewNotificationEmail, sendEmail, ADMIN_EMAIL } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const appId = params.id
  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id' })
  }

  const body = (await readBody(event)) as ReviewFormData & {
    userName?: string
    userEmail?: string
  }

  const sessionUser = await getSessionUser(event)

  if (!body?.rating || !body?.title || !body?.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: rating, title, content'
    })
  }

  const rating = Number(body.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 5' })
  }

  const userName =
    (body.userName && String(body.userName).trim()) ||
    (sessionUser ? `${sessionUser.firstName} ${sessionUser.lastName}`.trim() : '')
  if (!userName) {
    throw createError({ statusCode: 400, statusMessage: 'userName is required' })
  }

  const db = getDb()

  const app = db
    .prepare('SELECT id, name FROM app_listings WHERE id = ? OR slug = ?')
    .get(appId, appId) as Pick<DbAppListing, 'id' | 'name'> | undefined
  if (!app) {
    throw createError({ statusCode: 404, statusMessage: 'App not found' })
  }

  const now = new Date().toISOString()
  const review: DbReview = {
    id: makeId('review'),
    app_id: app.id,
    user_id: sessionUser?.id || null,
    user_name: userName,
    user_email: (body.userEmail || sessionUser?.email || null) as string | null,
    rating,
    title: String(body.title).trim().slice(0, 200),
    content: String(body.content).trim().slice(0, 5000),
    verified: sessionUser ? 1 : 0,
    helpful_votes: 0,
    status: 'pending',
    platform: body.platform ? String(body.platform).slice(0, 40) : null,
    version: body.version ? String(body.version).slice(0, 40) : null,
    created_at: now,
    updated_at: now
  }

  db.prepare(
    `INSERT INTO reviews (
      id, app_id, user_id, user_name, user_email, rating, title, content,
      verified, helpful_votes, status, platform, version, created_at, updated_at
    ) VALUES (
      @id, @app_id, @user_id, @user_name, @user_email, @rating, @title, @content,
      @verified, @helpful_votes, @status, @platform, @version, @created_at, @updated_at
    )`
  ).run(review)

  // Notify admins (best-effort).
  sendEmail(
    buildReviewNotificationEmail({
      to: ADMIN_EMAIL,
      appName: app.name,
      rating,
      title: review.title
    })
  ).catch(() => { /* ignore */ })

  const response: Review = {
    id: review.id,
    userId: review.user_id || undefined,
    userName: review.user_name,
    userEmail: review.user_email || undefined,
    rating: review.rating,
    title: review.title,
    content: review.content,
    verified: false,
    helpfulVotes: 0,
    createdAt: new Date(review.created_at),
    updatedAt: new Date(review.updated_at),
    status: review.status,
    metadata: {
      platform: review.platform || undefined,
      version: review.version || undefined
    }
  }

  logActivity({
    actorId: sessionUser?.id ?? null,
    actorEmail: sessionUser?.email ?? null,
    action: 'review.created',
    entityType: 'review',
    entityId: review.id,
    meta: { appId, rating: review.rating }
  })

  return {
    success: true,
    review: response,
    message: 'Review submitted successfully and is pending moderation'
  }
})
