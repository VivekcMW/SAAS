/**
 * GET /api/buyer/saved-apps
 * Returns the authenticated buyer's favorited apps with full app data
 * and per-user evaluation metadata (status, notes).
 */
import { requireUser } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = getDb()

  // Fetch favorites joined with app data + metadata
  const rows = db.prepare(`
    SELECT
      uf.app_id,
      uf.created_at AS saved_at,
      a.id          AS a_id,
      a.slug,
      a.name,
      a.logo,
      a.provider,
      a.short_description,
      a.category,
      a.pricing_type,
      a.pricing_value,
      a.pricing_period,
      a.rating,
      a.review_count,
      a.tags,
      a.integrations,
      a.key_features,
      a.security_certs,
      m.status,
      m.note,
      m.updated_at  AS metadata_updated_at
    FROM user_favorites uf
    LEFT JOIN app_listings a ON a.id = uf.app_id
    LEFT JOIN buyer_saved_app_metadata m ON m.user_id = uf.user_id AND m.app_id = uf.app_id
    WHERE uf.user_id = ?
    ORDER BY uf.created_at DESC
  `).all(user.id) as any[]

  const savedApps = rows.map(r => ({
    id: r.app_id,
    slug: r.slug ?? r.app_id,
    name: r.name ?? r.app_id,
    provider: r.provider ?? '',
    category: r.category ?? 'Unknown',
    logo: r.logo ?? '',
    description: r.short_description ?? '',
    pricing: {
      type: r.pricing_type ?? 'contact',
      value: r.pricing_value ?? null,
      period: r.pricing_period ?? null,
    },
    rating: Number(r.rating ?? 0),
    reviewCount: Number(r.review_count ?? 0),
    tags: tryParse(r.tags, []),
    integrations: tryParse(r.integrations, []),
    features: tryParse(r.key_features, []),
    certifications: tryParse(r.security_certs, []),
    // Evaluation metadata
    status: r.status ?? 'shortlisted',
    note: r.note ?? '',
    savedAt: r.saved_at,
  }))

  return { savedApps }
})

function tryParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) } catch { return fallback }
}
