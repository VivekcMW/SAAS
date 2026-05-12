/**
 * GET /api/status/health
 * Returns real-time health checks for all services.
 * Used by the status page to replace fake Math.random() data.
 */
import { getDb } from '~/server/utils/database'
import { isRedisEnabled } from '~/server/utils/redis'

type ServiceStatus = 'operational' | 'degraded' | 'outage'

interface ServiceHealth {
  name: string
  status: ServiceStatus
  latencyMs: number | null
  message: string
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const db = getDb()
    db.prepare('SELECT 1').get()
    return { name: 'Database', status: 'operational', latencyMs: Date.now() - start, message: 'Responding normally' }
  } catch (err: any) {
    return { name: 'Database', status: 'outage', latencyMs: null, message: err?.message ?? 'Connection failed' }
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  if (!isRedisEnabled()) {
    return { name: 'Cache', status: 'operational', latencyMs: null, message: 'In-memory cache (Redis not configured)' }
  }
  const start = Date.now()
  try {
    const { getRedis } = await import('~/server/utils/redis')
    const redis = getRedis()
    if (!redis) throw new Error('Redis not configured')
    await redis.ping()
    return { name: 'Cache', status: 'operational', latencyMs: Date.now() - start, message: 'Responding normally' }
  } catch (err: any) {
    return { name: 'Cache', status: 'degraded', latencyMs: null, message: 'Redis ping failed' }
  }
}

async function checkApi(): Promise<ServiceHealth> {
  // API is healthy if this handler is executing
  return { name: 'API', status: 'operational', latencyMs: 0, message: 'Responding normally' }
}

async function checkSearch(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const db = getDb()
    db.prepare("SELECT COUNT(*) as c FROM apps WHERE name LIKE ?").get('%a%')
    return { name: 'Search', status: 'operational', latencyMs: Date.now() - start, message: 'Index responding' }
  } catch {
    return { name: 'Search', status: 'degraded', latencyMs: null, message: 'Search index unavailable' }
  }
}

async function checkEmail(): Promise<ServiceHealth> {
  const configured = !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY)
  return {
    name: 'Email',
    status: configured ? 'operational' : 'degraded',
    latencyMs: null,
    message: configured ? 'SMTP/relay configured' : 'No email provider configured (silent mode)'
  }
}

export default defineEventHandler(async (_event) => {
  const [db, redis, api, search, email] = await Promise.all([
    checkDatabase(), checkRedis(), checkApi(), checkSearch(), checkEmail()
  ])

  const services: ServiceHealth[] = [api, db, redis, search, email]
  const hasOutage = services.some(s => s.status === 'outage')
  const hasDegraded = services.some(s => s.status === 'degraded')

  const overall: ServiceStatus = hasOutage ? 'outage' : hasDegraded ? 'degraded' : 'operational'

  return {
    overall,
    services,
    checkedAt: new Date().toISOString(),
  }
})
