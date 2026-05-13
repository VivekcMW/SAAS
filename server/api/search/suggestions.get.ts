/**
 * GET /api/search/suggestions
 * Returns real-time autocomplete suggestions from the app_listings DB.
 * Query: ?q=<search term>&limit=8
 */
import { getDb } from '~/server/utils/database'

interface Suggestion {
  id: string
  slug: string
  name: string
  category: string
  logo: string
  rating: number
  type: 'app' | 'category'
}

// Category map for category-level suggestions
const CATEGORY_SLUGS: Record<string, string> = {
  'productivity': 'Productivity',
  'marketing': 'Marketing',
  'design': 'Design',
  'engineering': 'Engineering',
  'finance': 'Finance',
  'hr': 'HR & People',
  'security': 'Security',
  'analytics': 'Analytics',
  'communication': 'Communication',
  'ecommerce': 'eCommerce',
  'crm': 'CRM',
  'project-management': 'Project Management',
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  const limit = Math.min(10, Math.max(1, Number(query.limit ?? 8)))

  if (!q || q.length < 2) return { suggestions: [] }

  const db = getDb()
  const term = `%${q}%`

  // App suggestions from DB
  const appRows = db.prepare(`
    SELECT id, slug, name, category, logo, rating
    FROM app_listings
    WHERE status = 'published'
      AND (name LIKE ? OR short_description LIKE ? OR tags LIKE ?)
    ORDER BY featured DESC, rating DESC, review_count DESC
    LIMIT ?
  `).all(term, term, term, limit) as Array<{
    id: string; slug: string; name: string; category: string; logo: string; rating: number
  }>

  const suggestions: Suggestion[] = appRows.map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    logo: r.logo,
    rating: r.rating,
    type: 'app' as const,
  }))

  // Add matching category suggestions at the top
  const ql = q.toLowerCase()
  for (const [slug, label] of Object.entries(CATEGORY_SLUGS)) {
    if (label.toLowerCase().includes(ql) || slug.includes(ql)) {
      suggestions.unshift({
        id: slug,
        slug,
        name: label,
        category: 'Category',
        logo: '',
        rating: 0,
        type: 'category',
      })
      break // at most 1 category suggestion
    }
  }

  return { suggestions: suggestions.slice(0, limit) }
})
