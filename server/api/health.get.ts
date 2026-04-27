/**
 * GET /api/health
 * Health check endpoint for load balancers and uptime monitors.
 * Returns 200 OK with a summary of DB status and app version.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler((event) => {
  setResponseStatus(event, 200)

  let dbOk = false
  let dbError: string | undefined

  try {
    const row = getDb().prepare('SELECT 1 AS ok').get() as { ok: number } | undefined
    dbOk = row?.ok === 1
  } catch {
    dbError = 'Database connection failed'
  }

  const status = dbOk ? 'ok' : 'degraded'

  if (!dbOk) {
    setResponseStatus(event, 503)
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: dbOk ? 'ok' : 'error',
        ...(dbError ? { error: dbError } : {})
      }
    }
  }
})
