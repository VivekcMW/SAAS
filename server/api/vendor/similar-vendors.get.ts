/**
 * GET /api/vendor/similar
 * Returns real competitor apps in the same category as the vendor's primary listing.
 * Computes rank (above/tied/below) by comparing ratings and price.
 */
import { requireVendor } from '~/server/utils/auth'
import { getDb } from '~/server/utils/database'

function logoLetter(name: string) { return (name || '?').charAt(0).toUpperCase() }
const COLORS = ['#1a1a1a', '#2563eb', '#7c3aed', '#0891b2', '#065f46', '#92400e', '#be123c', '#4338ca', '#0d9488']
function logoColor(id: string) { return COLORS[id.charCodeAt(0) % COLORS.length] }

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const db = getDb()

  // Find the vendor's primary listing (highest review count or first created)
  const myListing = db.prepare(`
    SELECT a.id, a.name, a.category, a.rating, a.pricing_value, a.review_count, a.vendor_id
    FROM app_listings a
    JOIN vendor_profiles vp ON vp.id = a.vendor_id
    WHERE vp.user_id = ?
      AND a.status = 'published'
    ORDER BY a.review_count DESC, a.created_at ASC
    LIMIT 1
  `).get(user.id) as {
    id: string; name: string; category: string; rating: number;
    pricing_value: number | null; review_count: number; vendor_id: string
  } | undefined

  if (!myListing) {
    return { competitors: [] }
  }

  // Get other published apps in the same category (exclude own)
  const competitors = db.prepare(`
    SELECT a.id, a.name, a.category, a.rating, a.review_count, a.pricing_value,
           a.vendor_id
    FROM app_listings a
    WHERE a.category = ?
      AND a.vendor_id != ?
      AND a.status = 'published'
    ORDER BY a.review_count DESC
    LIMIT 8
  `).all(myListing.category, myListing.vendor_id) as Array<{
    id: string; name: string; category: string; rating: number;
    review_count: number; pricing_value: number | null; vendor_id: string
  }>

  // Get tag lists to compute feature overlap
  const myTags = (db.prepare('SELECT tags FROM app_listings WHERE id = ?').get(myListing.id) as { tags: string } | undefined)?.tags
  const myTagSet = new Set<string>(myTags ? JSON.parse(myTags) : [])

  const result = competitors.map(c => {
    const cTags = (db.prepare('SELECT tags FROM app_listings WHERE id = ?').get(c.id) as { tags: string } | undefined)?.tags
    const cTagSet = new Set<string>(cTags ? JSON.parse(cTags) : [])
    const intersection = [...myTagSet].filter(t => cTagSet.has(t)).length
    const union = new Set([...myTagSet, ...cTagSet]).size
    const overlap = union > 0 ? Math.round((intersection / union) * 100) : 0

    // Rank: compare rating first, then price (lower price = competitive advantage for competitor)
    let yourRank: 'above' | 'tied' | 'below' = 'tied'
    const ratingDiff = (myListing.rating ?? 0) - (c.rating ?? 0)
    if (ratingDiff > 0.2) yourRank = 'above'
    else if (ratingDiff < -0.2) yourRank = 'below'
    else {
      // Similar rating — compare price
      const myPrice = myListing.pricing_value ?? 0
      const cPrice = c.pricing_value ?? 0
      if (myPrice < cPrice * 0.9) yourRank = 'above' // we're cheaper
      else if (myPrice > cPrice * 1.1) yourRank = 'below' // they're cheaper
    }

    // Build a meaningful gap description
    let gap = '—'
    if (c.review_count > myListing.review_count * 2) {
      gap = `${(c.review_count / 1000).toFixed(1)}k reviews (${Math.round(c.review_count / myListing.review_count)}× more)`
    } else if (yourRank === 'below' && c.pricing_value && myListing.pricing_value && c.pricing_value < myListing.pricing_value) {
      gap = `$${c.pricing_value} starting price vs your $${myListing.pricing_value}`
    } else if (cTagSet.size > myTagSet.size + 2) {
      gap = `${cTagSet.size - myTagSet.size} more feature tags`
    }

    return {
      id: c.id,
      name: c.name,
      logo: logoLetter(c.name),
      color: logoColor(c.id),
      category: c.category,
      rating: c.rating ?? 0,
      reviews: c.review_count ?? 0,
      priceFrom: c.pricing_value ?? 0,
      yourRank,
      gap,
      overlap,
    }
  })

  return { competitors: result, myListingName: myListing.name }
})
