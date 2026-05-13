/**
 * GET /api/admin/geo-stats
 * Returns geo analytics data for the admin map view.
 * Requires admin authentication.
 */
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = getDb()

  // Ensure table exists (created lazily on first login event)
  db.exec(`
    CREATE TABLE IF NOT EXISTS geo_events (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      country_code TEXT NOT NULL DEFAULT 'XX',
      country_name TEXT NOT NULL DEFAULT '',
      region_name  TEXT NOT NULL DEFAULT '',
      city         TEXT NOT NULL DEFAULT '',
      lat          REAL NOT NULL DEFAULT 0,
      lon          REAL NOT NULL DEFAULT 0,
      event_type   TEXT NOT NULL DEFAULT 'login',
      created_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ge_country ON geo_events(country_code);
    CREATE INDEX IF NOT EXISTS idx_ge_created ON geo_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_ge_user    ON geo_events(user_id);
  `)

  const query = getQuery(event)
  const days = Math.min(Number(query.days ?? 30), 365)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Per-country aggregation (for map circles)
  const byCountry = db.prepare(`
    SELECT
      country_code,
      country_name,
      AVG(lat)  AS lat,
      AVG(lon)  AS lon,
      COUNT(*)  AS total_events,
      COUNT(DISTINCT user_id) AS unique_users,
      SUM(CASE WHEN event_type IN ('login','oauth_login','magic_link_login','passkey_login') THEN 1 ELSE 0 END) AS logins
    FROM geo_events
    WHERE created_at >= ? AND country_code != 'XX'
    GROUP BY country_code
    ORDER BY total_events DESC
  `).all(since)

  // Recent events for the activity feed
  const recent = db.prepare(`
    SELECT
      g.id,
      g.country_code,
      g.country_name,
      g.city,
      g.event_type,
      g.created_at,
      u.email AS user_email,
      u.full_name AS user_name
    FROM geo_events g
    LEFT JOIN users u ON u.id = g.user_id
    WHERE g.created_at >= ?
    ORDER BY g.created_at DESC
    LIMIT 50
  `).all(since)

  // Summary stats
  const totals = db.prepare(`
    SELECT
      COUNT(*)                                                                              AS total_events,
      COUNT(DISTINCT country_code)                                                          AS unique_countries,
      COUNT(DISTINCT user_id)                                                               AS unique_users,
      SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END)                     AS events_today,
      SUM(CASE WHEN event_type IN ('login','oauth_login','magic_link_login','passkey_login') THEN 1 ELSE 0 END) AS total_logins
    FROM geo_events
    WHERE created_at >= ?
  `).get(since)

  // Events per day (for the sparkline)
  const byDay = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count
    FROM geo_events
    WHERE created_at >= ?
    GROUP BY date(created_at)
    ORDER BY day ASC
  `).all(since)

  return { byCountry, recent, totals, byDay, days }
})
