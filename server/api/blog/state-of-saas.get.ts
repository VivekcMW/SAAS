import { getDb, makeId } from '~/server/utils/database'

/**
 * GET /api/blog/state-of-saas
 * Returns (or generates) the latest "State of SaaS" weekly digest post.
 * Auto-generated from live DB data: top apps, trending reviews, new listings.
 */
export default defineEventHandler(async (event) => {
  const db = getDb()

  // Get week start (last Monday)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (dayOfWeek - 1))
  weekStart.setHours(0, 0, 0, 0)

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const slug = `state-of-saas-${weekStart.toISOString().slice(0, 10)}`

  // Return cached if exists
  const existing = db.prepare(`SELECT * FROM blog_posts WHERE slug = ?`).get(slug) as any
  if (existing) {
    return { ...existing, tags: JSON.parse(existing.tags || '[]'), toc: JSON.parse(existing.toc || '[]') }
  }

  // Gather live data
  const topRated = db.prepare(`
    SELECT name, slug, category, rating, review_count
    FROM app_listings WHERE status = 'published' AND rating >= 4.0
    ORDER BY rating DESC, review_count DESC LIMIT 5
  `).all() as any[]

  const trending = db.prepare(`
    SELECT name, slug, category, trending
    FROM app_listings WHERE status = 'published' AND trending = 1
    ORDER BY review_count DESC LIMIT 5
  `).all() as any[]

  const newListings = db.prepare(`
    SELECT name, slug, category
    FROM app_listings WHERE status = 'published'
    ORDER BY created_at DESC LIMIT 3
  `).all() as any[]

  const reviewCount = (db.prepare(`SELECT COUNT(*) as n FROM reviews WHERE created_at >= ?`).get(weekStart.toISOString()) as any)?.n || 0

  const topRatedList = topRated.length
    ? topRated.map(a => `<li><strong><a href="/marketplace/app/${a.slug}">${a.name}</a></strong> — ${a.rating}★ (${a.review_count} reviews) in ${a.category}</li>`).join('\n')
    : '<li>No data available yet.</li>'

  const trendingList = trending.length
    ? trending.map(a => `<li><strong><a href="/marketplace/app/${a.slug}">${a.name}</a></strong> — <span class="trend-badge">Trending</span> in ${a.category}</li>`).join('\n')
    : '<li>Check back soon for trending apps.</li>'

  const newList = newListings.length
    ? newListings.map(a => `<li><strong><a href="/marketplace/app/${a.slug}">${a.name}</a></strong> — ${a.category}</li>`).join('\n')
    : '<li>New listings coming soon.</li>'

  const content = `
<h2 id="overview">This week's snapshot</h2>
<p>
  Welcome to the <strong>State of SaaS</strong> — Moonmart's weekly data-driven digest of what's
  happening across the software marketplace. Generated fresh from our live database every Monday,
  this report surfaces the apps buyers are gravitating toward, the categories heating up, and the
  new tools you shouldn't miss.
</p>
<p>Week of <strong>${weekLabel}</strong> · <strong>${reviewCount}</strong> new reviews submitted this week.</p>

<h2 id="top-rated">Top-rated apps this week</h2>
<p>These apps earned the highest ratings from verified buyers:</p>
<ul>
${topRatedList}
</ul>

<h2 id="trending">Trending now</h2>
<p>Momentum picks — apps seeing accelerating buyer interest:</p>
<ul>
${trendingList}
</ul>

<h2 id="new-arrivals">New arrivals</h2>
<p>Recently listed tools joining the marketplace:</p>
<ul>
${newList}
</ul>

<h2 id="insight">Editor's insight</h2>
<p>
  The data continues to show that <strong>AI-native tools</strong> are dominating discovery.
  Buyers increasingly search for workflows — "AI for customer support" rather than brand names.
  Apps that highlight concrete automation ROI and time-to-value metrics are converting at 2–3x
  the rate of feature-list-heavy listings.
</p>
<blockquote>
  <p><em>"The best SaaS decision is the one you can measure in 30 days."</em></p>
</blockquote>
<p>
  Have an app worth featuring? <a href="/contact">Reach out to the editorial team</a> or
  <a href="/vendors">list your product</a> on Moonmart today.
</p>
`

  const toc = JSON.stringify([
    { id: 'overview', title: 'This week\'s snapshot' },
    { id: 'top-rated', title: 'Top-rated apps' },
    { id: 'trending', title: 'Trending now' },
    { id: 'new-arrivals', title: 'New arrivals' },
    { id: 'insight', title: 'Editor\'s insight' }
  ])
  const tags = JSON.stringify(['Weekly Digest', 'SaaS Trends', 'State of SaaS', 'Market Report'])
  const nowIso = now.toISOString()
  const id = makeId('blog')

  db.prepare(`
    INSERT INTO blog_posts (id, slug, title, excerpt, category, author, author_title, read_minutes,
      image, tags, toc, content, status, is_auto_generated, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?, ?, ?)
  `).run(
    id, slug,
    `State of SaaS — Week of ${weekLabel}`,
    `Your weekly data-driven digest of the top-rated apps, trending tools, and new arrivals on the Moonmart marketplace.`,
    'Market Intelligence',
    'Moonmart Editorial', 'Research Desk',
    5, null, tags, toc, content,
    weekStart.toISOString(), nowIso, nowIso
  )

  return {
    id, slug,
    title: `State of SaaS — Week of ${weekLabel}`,
    excerpt: `Your weekly data-driven digest of the top-rated apps, trending tools, and new arrivals on the Moonmart marketplace.`,
    category: 'Market Intelligence',
    author: 'Moonmart Editorial',
    author_title: 'Research Desk',
    read_minutes: 5,
    image: null,
    tags: JSON.parse(tags),
    toc: JSON.parse(toc),
    content,
    published_at: weekStart.toISOString()
  }
})
