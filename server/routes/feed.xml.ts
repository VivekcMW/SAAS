/**
 * GET /feed.xml — RSS 2.0 feed for Moonmart blog posts.
 *
 * Returns the 20 most recent published blog posts.
 */
import { getDb } from '~/server/utils/database'

const BASE_URL = 'https://moonmart.ai'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default defineEventHandler(async (event) => {
  const db = getDb()

  const posts = db.prepare(`
    SELECT slug, title, excerpt, author, category, published_at, updated_at, image
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY published_at DESC
    LIMIT 20
  `).all() as Array<{
    slug: string
    title: string
    excerpt: string
    author: string
    category: string
    published_at: string
    updated_at: string
    image: string | null
  }>

  const lastBuildDate = posts.length > 0
    ? new Date(posts[0].published_at).toUTCString()
    : new Date().toUTCString()

  const items = posts.map((p) => {
    const link = `${BASE_URL}/blog/${p.slug}`
    const pubDate = new Date(p.published_at).toUTCString()
    const enclosure = p.image
      ? `\n      <enclosure url="${escapeXml(p.image)}" type="image/jpeg" length="0" />`
      : ''
    return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <author>${escapeXml(p.author)}</author>
      <category>${escapeXml(p.category)}</category>
      <pubDate>${pubDate}</pubDate>${enclosure}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Moonmart Blog — SaaS Insights &amp; Software Reviews</title>
    <link>${BASE_URL}/blog</link>
    <description>Latest articles on SaaS discovery, software comparisons, and team productivity from the Moonmart editorial team.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>editorial@moonmart.ai (Moonmart Editorial)</managingEditor>
    <webMaster>tech@moonmart.ai (Moonmart Tech)</webMaster>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/assets/images/og-image.jpg</url>
      <title>Moonmart Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return xml
})
