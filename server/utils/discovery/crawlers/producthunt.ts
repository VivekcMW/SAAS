/**
 * Product Hunt Crawler
 * Source: https://api.producthunt.com/v2/api/graphql (official GraphQL API)
 * Schedule: Daily (3am UTC)
 * Auth: Bearer token (PRODUCT_HUNT_API_TOKEN)
 * Est. apps: 80,000+
 *
 * Get token: https://www.producthunt.com/v2/oauth/applications
 */
import { getDb, makeId } from '~/server/utils/database'
import { filterNew } from '~/server/utils/discovery/deduplicator'
import { fetchPageText, extractWithAI, computeScore, routeByScore, type FieldConfidence } from '~/server/utils/ai-extractor'

const PH_API = 'https://api.producthunt.com/v2/api/graphql'

interface PHPost {
  name: string
  tagline: string
  website: string
  url: string
  thumbnail: { url: string } | null
  topics: { edges: Array<{ node: { name: string } }> }
  makers: Array<{ profileUrl: string; twitterUsername: string | null }>
}

const POSTS_QUERY = `
  query GetPosts($cursor: String) {
    posts(
      first: 50,
      after: $cursor,
      order: NEWEST,
      topic: "saas"
    ) {
      pageInfo { endCursor hasNextPage }
      edges {
        node {
          name
          tagline
          website
          url
          thumbnail { url }
          topics { edges { node { name } } }
          makers { profileUrl twitterUsername }
        }
      }
    }
  }
`

async function fetchPHPage(cursor: string | null): Promise<{ posts: PHPost[]; nextCursor: string | null }> {
  const token = process.env.PRODUCT_HUNT_API_TOKEN
  if (!token) throw new Error('PRODUCT_HUNT_API_TOKEN not set')

  const res = await fetch(PH_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'SaasWorldBot/1.0'
    },
    body: JSON.stringify({ query: POSTS_QUERY, variables: { cursor } }),
    signal: AbortSignal.timeout(20_000)
  })

  if (!res.ok) throw new Error(`Product Hunt API ${res.status}`)

  const json = await res.json() as {
    data: {
      posts: {
        pageInfo: { endCursor: string; hasNextPage: boolean }
        edges: Array<{ node: PHPost }>
      }
    }
    errors?: Array<{ message: string }>
  }

  if (json.errors?.length) throw new Error(json.errors[0].message)

  const posts = json.data.posts.edges.map(e => e.node)
  const nextCursor = json.data.posts.pageInfo.hasNextPage
    ? json.data.posts.pageInfo.endCursor
    : null

  return { posts, nextCursor }
}

export async function runProductHuntCrawler(limit = 100): Promise<{ found: number; added: number; failed: number }> {
  const db = getDb()
  const runId = makeId('run')
  const startedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'producthunt', ?, 'running')`
  ).run(runId, startedAt)

  let found = 0
  let added = 0
  let failed = 0

  try {
    const allPosts: PHPost[] = []
    let cursor: string | null = null

    while (allPosts.length < limit) {
      const { posts, nextCursor } = await fetchPHPage(cursor)
      if (posts.length === 0) break
      allPosts.push(...posts)
      cursor = nextCursor
      if (!cursor) break
      await new Promise(r => setTimeout(r, 1000))
    }

    found = allPosts.length

    const withSite = allPosts.filter(p => p.website?.startsWith('http')).slice(0, limit)
    const newUrls = filterNew(withSite.map(p => p.website))
    const newSet = new Set(newUrls)
    const toProcess = withSite.filter(p => newSet.has(p.website))

    const now = new Date().toISOString()

    for (const post of toProcess) {
      try {
        const topicNames = post.topics?.edges?.map(e => e.node.name) ?? []

        // Build initial extracted data from PH metadata
        const extracted: Record<string, unknown> = {
          name: post.name,
          tagline: post.tagline,
          short_description: post.tagline,
          long_description: post.tagline,
          category: topicNames[0] ?? 'Other',
          pricing_type: 'contact',
          pricing_starts_at: null,
          target_audience: '',
          key_features: [],
          integrations: [],
          logo_url: post.thumbnail?.url ?? null,
          website_url: post.website,
          founded_year: null,
          source_url: post.url,
          confidence: {
            name: 1, description: 0.6, category: 0.5,
            pricing: 0.2, features: 0.2, overall: 0.5
          }
        }

        // AI enrichment (best-effort)
        try {
          const pageText = await fetchPageText(post.website)
          const aiResult = await extractWithAI(pageText, post.website)
          extracted.category = aiResult.category
          extracted.pricing_type = aiResult.pricing_type
          extracted.pricing_starts_at = aiResult.pricing_starts_at
          extracted.key_features = aiResult.key_features
          extracted.target_audience = aiResult.target_audience
          extracted.confidence = aiResult.confidence
        }
        catch { /* optional */ }

        const score = computeScore(extracted.confidence as FieldConfidence)
        const status = routeByScore(score)
        const itemId = makeId('dsc')

        db.prepare(`
          INSERT INTO discovery_queue
            (id, source, source_url, website_url, extracted_data, confidence_score,
             status, processed_at, created_at)
          VALUES (?, 'producthunt', ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          post.url,
          post.website,
          JSON.stringify(extracted),
          score,
          status,
          now,
          now
        )

        added++
      }
      catch (err) {
        console.error('[ph-crawler] Failed for', post.website, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 2000))
    }
  }
  catch (err) {
    console.error('[ph-crawler] Fatal error', err)
    db.prepare(
      `UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`
    ).run(new Date().toISOString(), runId)
    throw err
  }

  db.prepare(
    `UPDATE agent_runs
     SET status='done', finished_at=?, urls_found=?, urls_new=?, urls_failed=?
     WHERE id=?`
  ).run(new Date().toISOString(), found, added, failed, runId)

  console.log(`[ph-crawler] Done — found:${found} added:${added} failed:${failed}`)
  return { found, added, failed }
}
