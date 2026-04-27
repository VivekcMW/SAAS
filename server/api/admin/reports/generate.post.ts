import { getDb, makeId } from '../../../utils/database'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = getDb()
  const now = new Date()
  const weekLabel = `${now.getFullYear()}-W${String(getISOWeek(now)).padStart(2, '0')}`

  // Gather stats from the past 7 days
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const topGrowingApps = db.prepare(`
    SELECT al.name, al.slug, al.category, al.rating, COUNT(r.id) as review_week_count
    FROM app_listings al
    LEFT JOIN reviews r ON r.app_id = al.id AND r.created_at >= ?
    WHERE al.status = 'published'
    GROUP BY al.id
    ORDER BY review_week_count DESC, al.rating DESC
    LIMIT 5
  `).all(since) as Array<{ name: string; slug: string; category: string; rating: number; review_week_count: number }>

  const topCategory = db.prepare(`
    SELECT al.category, COUNT(r.id) as cnt
    FROM reviews r
    JOIN app_listings al ON al.id = r.app_id
    WHERE r.created_at >= ?
    GROUP BY al.category
    ORDER BY cnt DESC
    LIMIT 1
  `).get(since) as { category: string; cnt: number } | undefined

  const totalApps = (db.prepare(`SELECT COUNT(*) as n FROM app_listings WHERE status = 'published'`).get() as { n: number }).n
  const totalReviews = (db.prepare(`SELECT COUNT(*) as n FROM reviews`).get() as { n: number }).n
  const weekReviews = (db.prepare(`SELECT COUNT(*) as n FROM reviews WHERE created_at >= ?`).get(since) as { n: number }).n

  // Build markdown body
  const topList = topGrowingApps.map((a, i) =>
    `${i + 1}. **[${a.name}](https://moonmart.ai/marketplace/app/${a.slug})** (${a.category}) — ${a.review_week_count} new reviews this week, rated ${a.rating}/5`
  ).join('\n')

  const bodyMarkdown = `# moonmart.ai SaaS Weekly Report — ${weekLabel}

*Auto-generated weekly report from moonmart.ai review and buyer intent data.*

---

## This Week at a Glance

- **${weekReviews}** new verified reviews submitted
- **${totalApps}** total published apps on moonmart.ai
- **${totalReviews}** cumulative verified reviews

---

## Top Growing Apps This Week

${topList || '*No new reviews this week*'}

---

## Hottest Category

${topCategory ? `**${topCategory.category}** received the most new reviews this week with **${topCategory.cnt}** submissions.` : '*Insufficient data*'}

---

## About This Report

This report is automatically generated from moonmart.ai's verified review database. Data is updated weekly. [View full methodology →](https://moonmart.ai/methodology)

*Published by moonmart.ai — The Independent SaaS Comparison Platform*
`

  const title = `SaaS Weekly: Top Growing Apps — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  const slug = `saas-weekly-${weekLabel.toLowerCase()}`
  const excerpt = `Weekly SaaS report: top growing apps, most active category, and platform stats for ${weekLabel}.`

  // Check if report already exists for this week
  const existing = db.prepare(`SELECT id FROM news_posts WHERE slug = ?`).get(slug) as { id: string } | undefined

  if (existing) {
    // Update existing draft
    db.prepare(`
      UPDATE news_posts SET title = ?, excerpt = ?, body_markdown = ?, updated_at = ?
      WHERE slug = ?
    `).run(title, excerpt, bodyMarkdown, now.toISOString(), slug)

    return { success: true, action: 'updated', slug, weekLabel }
  }

  // Insert new report as draft
  const id = makeId('rpt')
  db.prepare(`
    INSERT INTO news_posts (id, vendor_id, app_id, post_type, title, slug, excerpt, body_markdown, status, featured, view_count, upvote_count, published_at, created_at, updated_at)
    VALUES (?, '', NULL, 'announcement', ?, ?, ?, ?, 'draft', 0, 0, 0, NULL, ?, ?)
  `).run(id, title, slug, excerpt, bodyMarkdown, now.toISOString(), now.toISOString())

  return { success: true, action: 'created', id, slug, weekLabel, title }
})

/** ISO week number (1–53) */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
