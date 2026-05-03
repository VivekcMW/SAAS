import { getDb } from '~/server/utils/database'
import { checkRateLimit } from '~/server/utils/rateLimit'

interface JobRow {
  id: string
  title: string
  department: string
  location: string
  type: string
  remote: string
  description: string
  requirements: string
  nice_to_have: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  apply_url: string | null
  status: string
  created_at: string
}

const VALID_DEPARTMENTS = ['engineering', 'product', 'marketing', 'sales', 'operations', 'design']
const VALID_REMOTES = ['remote', 'hybrid', 'on-site']

function safeParseJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip, { limit: 60, windowMs: 60_000, prefix: 'careers-jobs' }).allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const query = getQuery(event)
  const department = typeof query.department === 'string' ? query.department : ''
  const remote = typeof query.remote === 'string' ? query.remote : ''

  const conditions: string[] = ["status = 'active'"]
  const params: Record<string, string> = {}

  if (department && VALID_DEPARTMENTS.includes(department)) {
    conditions.push('department = @department')
    params.department = department
  }
  if (remote && VALID_REMOTES.includes(remote)) {
    conditions.push('remote = @remote')
    params.remote = remote
  }

  const whereSql = `WHERE ${conditions.join(' AND ')}`
  const db = getDb()

  const rows = db
    .prepare(
      `SELECT * FROM job_listings ${whereSql}
       ORDER BY created_at DESC`
    )
    .all(params) as JobRow[]

  const jobs = rows.map(j => ({
    ...j,
    requirements: safeParseJson(j.requirements, []),
    nice_to_have: safeParseJson(j.nice_to_have, [])
  }))

  // Group by department
  const departments: Record<string, typeof jobs> = {}
  for (const job of jobs) {
    if (!departments[job.department]) {
      departments[job.department] = []
    }
    departments[job.department].push(job)
  }

  return { jobs, departments, total: jobs.length }
})
