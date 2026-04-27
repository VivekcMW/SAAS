/**
 * Upstash Redis client for session storage, caching, and rate limiting.
 *
 * When UPSTASH_REDIS_REST_URL is set, Redis is used.
 * When not set (local dev without Redis), the module stubs are no-ops so
 * the SQLite fallback in auth.ts takes over.
 */
import { Redis } from '@upstash/redis'

const SESSION_TTL_SEC = 60 * 60 * 24 * 14 // 14 days

// Lazy singleton — only instantiated when env vars are present
let _redis: Redis | null = null

export function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

export function isRedisEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function redisSetSession(sessionId: string, userId: string, ttlSec = SESSION_TTL_SEC): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.setex(`session:${sessionId}`, ttlSec, userId)
}

export async function redisGetSession(sessionId: string): Promise<string | null> {
  const r = getRedis()
  if (!r) return null
  return r.get<string>(`session:${sessionId}`)
}

export async function redisDestroySession(sessionId: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.del(`session:${sessionId}`)
}

/** Invalidate ALL sessions for a user (e.g. after password change). */
export async function redisDestroyUserSessions(userId: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  // Sessions are keyed by session ID, not user ID.
  // We store a reverse index: user:{userId}:sessions → Set of session IDs.
  const sessionIds = await r.smembers<string[]>(`user:${userId}:sessions`)
  if (!sessionIds?.length) return
  const pipeline = r.pipeline()
  for (const sid of sessionIds) pipeline.del(`session:${sid}`)
  pipeline.del(`user:${userId}:sessions`)
  await pipeline.exec()
}

export async function redisTrackUserSession(userId: string, sessionId: string, ttlSec = SESSION_TTL_SEC): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.sadd(`user:${userId}:sessions`, sessionId)
  await r.expire(`user:${userId}:sessions`, ttlSec)
}

// ─── App listing cache ────────────────────────────────────────────────────────

export async function redisCacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  return r.get<T>(key)
}

export async function redisCacheSet<T>(key: string, value: T, ttlSec: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.setex(key, ttlSec, value)
}

export async function redisCacheDel(key: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.del(key)
}
