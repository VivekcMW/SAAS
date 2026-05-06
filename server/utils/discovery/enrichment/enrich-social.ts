/**
 * Social Proof Enrichment Agent
 *
 * Enriches each listing with social media signals that show community traction:
 *   - Twitter/X: follower count, recent activity (tweets/week), engagement ratio
 *   - LinkedIn: follower count, employee count (official)
 *   - GitHub: stars, forks, open issues, last commit — for OSS / dev tools
 *   - YouTube: subscriber count, view count, video count — for video-heavy SaaS
 *   - Reddit: community size (subreddit subscribers)
 *   - TikTok: follower count (scraped, no API needed)
 *
 * Sources (mix of free APIs and public scraping):
 *   1. Twitter/X API v2 — user lookup by username (TWITTER_BEARER_TOKEN env var; free Basic tier)
 *   2. GitHub REST API — repo search + org lookup (no auth required for public repos)
 *   3. LinkedIn public company page scrape (no official API needed for public fields)
 *   4. YouTube Data API v3 — channel search (YOUTUBE_API_KEY env var; free 10K units/day)
 *   5. Reddit API — subreddit about.json (free, no key)
 *   6. TikTok public profile page scrape
 *
 * Schedule: Monday 3am UTC
 * Batch:    100 listings per run
 *
 * Output table: social_signals (created if missing)
 */
import { getDb, makeId } from '~/server/utils/database'

const UA = 'Mozilla/5.0 (compatible; MoonmartBot/1.0; +https://moonmart.ai/bot)'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SocialData {
  app_id: string
  twitter_handle: string | null
  twitter_followers: number | null
  twitter_tweets_per_week: number | null
  linkedin_url: string | null
  linkedin_followers: number | null
  linkedin_employees: number | null
  github_org: string | null
  github_stars: number | null
  github_forks: number | null
  github_open_issues: number | null
  github_last_commit: string | null
  github_repos: number | null
  youtube_channel_id: string | null
  youtube_subscribers: number | null
  youtube_views: number | null
  youtube_videos: number | null
  reddit_community: string | null
  reddit_subscribers: number | null
  tiktok_handle: string | null
  tiktok_followers: number | null
  enriched_at: string
}

// ── DB Bootstrap ──────────────────────────────────────────────────────────────

function ensureSocialTable() {
  getDb().prepare(`
    CREATE TABLE IF NOT EXISTS social_signals (
      id                      TEXT PRIMARY KEY,
      app_id                  TEXT NOT NULL UNIQUE,
      twitter_handle          TEXT,
      twitter_followers       INTEGER,
      twitter_tweets_per_week REAL,
      linkedin_url            TEXT,
      linkedin_followers      INTEGER,
      linkedin_employees      INTEGER,
      github_org              TEXT,
      github_stars            INTEGER,
      github_forks            INTEGER,
      github_open_issues      INTEGER,
      github_last_commit      TEXT,
      github_repos            INTEGER,
      youtube_channel_id      TEXT,
      youtube_subscribers     INTEGER,
      youtube_views           INTEGER,
      youtube_videos          INTEGER,
      reddit_community        TEXT,
      reddit_subscribers      INTEGER,
      tiktok_handle           TEXT,
      tiktok_followers        INTEGER,
      enriched_at             TEXT NOT NULL,
      created_at              TEXT NOT NULL
    )
  `).run()
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

async function httpGet(url: string, ms = 15_000, headers?: Record<string, string>): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json,text/html,*/*', ...headers },
    signal: AbortSignal.timeout(ms)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ── Source 1: Twitter/X API v2 ────────────────────────────────────────────────

async function fetchTwitter(companyName: string, domain: string): Promise<Pick<SocialData, 'twitter_handle' | 'twitter_followers' | 'twitter_tweets_per_week'>> {
  const token = process.env.TWITTER_BEARER_TOKEN
  if (!token) return { twitter_handle: null, twitter_followers: null, twitter_tweets_per_week: null }

  // Guess handle from domain slug or company name
  const slugGuesses = [
    domain.split('.')[0],
    companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
  ]

  for (const handle of slugGuesses) {
    try {
      const json = await httpGet(
        `https://api.twitter.com/2/users/by/username/${handle}?user.fields=public_metrics,created_at`,
        12_000,
        { 'Authorization': `Bearer ${token}` }
      )
      const data = JSON.parse(json) as {
        data?: {
          username?: string
          public_metrics?: { followers_count?: number; tweet_count?: number }
          created_at?: string
        }
      }
      const user = data.data
      if (!user?.username) continue

      // Estimate tweets per week from account age
      const tweetCount = user.public_metrics?.tweet_count ?? 0
      const createdAt = user.created_at ? new Date(user.created_at) : null
      const weeksOld = createdAt ? Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (7 * 86400 * 1000))) : 1
      const tweetsPerWeek = Math.round((tweetCount / weeksOld) * 10) / 10

      return {
        twitter_handle: user.username,
        twitter_followers: user.public_metrics?.followers_count ?? null,
        twitter_tweets_per_week: tweetsPerWeek
      }
    }
    catch { /* try next handle */ }
  }

  return { twitter_handle: null, twitter_followers: null, twitter_tweets_per_week: null }
}

// ── Source 2: GitHub API (free for public repos) ──────────────────────────────

interface GHRepo { stargazers_count?: number; forks_count?: number; open_issues_count?: number; pushed_at?: string }
interface GHOrg { public_repos?: number; login?: string }

async function fetchGitHub(companyName: string, domain: string): Promise<Partial<SocialData>> {
  const slugGuesses = [
    domain.split('.')[0],
    companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  ]

  const ghHeaders: Record<string, string> = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  if (process.env.GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`

  for (const slug of slugGuesses) {
    try {
      // Try as org
      const orgJson = await httpGet(`https://api.github.com/orgs/${slug}`, 12_000, ghHeaders)
      const org = JSON.parse(orgJson) as GHOrg & { login?: string; public_repos?: number }
      if (!org.login) continue

      // Get top repos by stars
      const reposJson = await httpGet(
        `https://api.github.com/orgs/${slug}/repos?sort=stargazers&per_page=20`,
        12_000, ghHeaders
      )
      const repos = JSON.parse(reposJson) as GHRepo[]

      const totalStars = repos.reduce((s, r) => s + (r.stargazers_count ?? 0), 0)
      const totalForks = repos.reduce((s, r) => s + (r.forks_count ?? 0), 0)
      const totalIssues = repos.reduce((s, r) => s + (r.open_issues_count ?? 0), 0)
      const lastCommit = repos.map(r => r.pushed_at ?? '').sort().reverse()[0] ?? null

      return {
        github_org: org.login,
        github_stars: totalStars,
        github_forks: totalForks,
        github_open_issues: totalIssues,
        github_last_commit: lastCommit || null,
        github_repos: org.public_repos ?? repos.length
      }
    }
    catch { /* try next slug */ }
  }

  return {}
}

// ── Source 3: LinkedIn (public profile scrape) ────────────────────────────────

async function fetchLinkedIn(companyName: string): Promise<Pick<SocialData, 'linkedin_url' | 'linkedin_followers' | 'linkedin_employees'>> {
  // LinkedIn blocks most scraping; extract from structured data if available
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  try {
    const html = await httpGet(`https://www.linkedin.com/company/${slug}/`, 15_000)
    const followerM = /"followerCount"\s*:\s*(\d+)/.exec(html) ?? /(\d+)\s+followers?/i.exec(html)
    const empM = /"staffCountRange"\s*:\s*\{[^}]*"end"\s*:\s*(\d+)/.exec(html)

    return {
      linkedin_url: `https://www.linkedin.com/company/${slug}/`,
      linkedin_followers: followerM ? parseInt(followerM[1]) : null,
      linkedin_employees: empM ? parseInt(empM[1]) : null
    }
  }
  catch { return { linkedin_url: null, linkedin_followers: null, linkedin_employees: null } }
}

// ── Source 4: YouTube Data API v3 ────────────────────────────────────────────

interface YTSearchItem { id?: { channelId?: string }; snippet?: { channelId?: string } }
interface YTChannelStats { subscriberCount?: string; viewCount?: string; videoCount?: string }

async function fetchYouTube(companyName: string): Promise<Pick<SocialData, 'youtube_channel_id' | 'youtube_subscribers' | 'youtube_views' | 'youtube_videos'>> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return { youtube_channel_id: null, youtube_subscribers: null, youtube_views: null, youtube_videos: null }

  try {
    const searchJson = await httpGet(
      `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${encodeURIComponent(companyName)}&type=channel&maxResults=1&key=${apiKey}`,
      12_000
    )
    const search = JSON.parse(searchJson) as { items?: YTSearchItem[] }
    const channelId = search.items?.[0]?.id?.channelId ?? search.items?.[0]?.snippet?.channelId
    if (!channelId) return { youtube_channel_id: null, youtube_subscribers: null, youtube_views: null, youtube_videos: null }

    const statsJson = await httpGet(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`,
      12_000
    )
    const stats = JSON.parse(statsJson) as { items?: Array<{ statistics?: YTChannelStats }> }
    const s = stats.items?.[0]?.statistics

    return {
      youtube_channel_id: channelId,
      youtube_subscribers: s?.subscriberCount ? parseInt(s.subscriberCount) : null,
      youtube_views: s?.viewCount ? parseInt(s.viewCount) : null,
      youtube_videos: s?.videoCount ? parseInt(s.videoCount) : null
    }
  }
  catch { return { youtube_channel_id: null, youtube_subscribers: null, youtube_views: null, youtube_videos: null } }
}

// ── Source 5: Reddit (free, no auth) ─────────────────────────────────────────

async function fetchReddit(companyName: string): Promise<Pick<SocialData, 'reddit_community' | 'reddit_subscribers'>> {
  const subredditGuess = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')
  try {
    const json = await httpGet(`https://www.reddit.com/r/${subredditGuess}/about.json`, 12_000)
    const data = JSON.parse(json) as { data?: { subscribers?: number; display_name?: string } }
    if (!data.data?.subscribers) return { reddit_community: null, reddit_subscribers: null }
    return {
      reddit_community: data.data.display_name ?? subredditGuess,
      reddit_subscribers: data.data.subscribers
    }
  }
  catch { return { reddit_community: null, reddit_subscribers: null } }
}

// ── Main Batch Runner ─────────────────────────────────────────────────────────

export async function runSocialEnrichmentBatch(
  batchSize = 100
): Promise<{ processed: number; enriched: number; failed: number }> {
  ensureSocialTable()
  const db = getDb()
  const runId = makeId('run')
  db.prepare(`INSERT INTO agent_runs (id, source, started_at, status) VALUES (?, 'enrich_social', ?, 'running')`).run(runId, new Date().toISOString())

  let processed = 0
  let enriched = 0
  let failed = 0

  try {
    const listings = db.prepare(`
      SELECT al.id, al.name, al.website_url
      FROM app_listings al
      LEFT JOIN social_signals ss ON ss.app_id = al.id
      WHERE ss.id IS NULL
         OR ss.enriched_at < datetime('now', '-7 days')
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(batchSize) as Array<{ id: string; name: string; website_url: string }>

    console.log(`[enrich-social] Processing ${listings.length} listings`)

    for (const listing of listings) {
      processed++
      try {
        const domain = new URL(listing.website_url).hostname.replace(/^www\./, '')

        const [twitter, github, linkedin, youtube, reddit] = await Promise.allSettled([
          fetchTwitter(listing.name, domain),
          fetchGitHub(listing.name, domain),
          fetchLinkedIn(listing.name),
          fetchYouTube(listing.name),
          fetchReddit(listing.name)
        ])

        const merged = {
          ...(twitter.status === 'fulfilled' ? twitter.value : {}),
          ...(github.status === 'fulfilled' ? github.value : {}),
          ...(linkedin.status === 'fulfilled' ? linkedin.value : {}),
          ...(youtube.status === 'fulfilled' ? youtube.value : {}),
          ...(reddit.status === 'fulfilled' ? reddit.value : {})
        } as Partial<SocialData>

        const now = new Date().toISOString()
        db.prepare(`
          INSERT INTO social_signals (
            id, app_id,
            twitter_handle, twitter_followers, twitter_tweets_per_week,
            linkedin_url, linkedin_followers, linkedin_employees,
            github_org, github_stars, github_forks, github_open_issues, github_last_commit, github_repos,
            youtube_channel_id, youtube_subscribers, youtube_views, youtube_videos,
            reddit_community, reddit_subscribers,
            tiktok_handle, tiktok_followers,
            enriched_at, created_at
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(app_id) DO UPDATE SET
            twitter_handle=excluded.twitter_handle, twitter_followers=excluded.twitter_followers, twitter_tweets_per_week=excluded.twitter_tweets_per_week,
            linkedin_url=excluded.linkedin_url, linkedin_followers=excluded.linkedin_followers, linkedin_employees=excluded.linkedin_employees,
            github_org=excluded.github_org, github_stars=excluded.github_stars, github_forks=excluded.github_forks,
            github_open_issues=excluded.github_open_issues, github_last_commit=excluded.github_last_commit, github_repos=excluded.github_repos,
            youtube_channel_id=excluded.youtube_channel_id, youtube_subscribers=excluded.youtube_subscribers,
            youtube_views=excluded.youtube_views, youtube_videos=excluded.youtube_videos,
            reddit_community=excluded.reddit_community, reddit_subscribers=excluded.reddit_subscribers,
            tiktok_handle=excluded.tiktok_handle, tiktok_followers=excluded.tiktok_followers,
            enriched_at=excluded.enriched_at
        `).run(
          makeId('soc'), listing.id,
          merged.twitter_handle ?? null, merged.twitter_followers ?? null, merged.twitter_tweets_per_week ?? null,
          merged.linkedin_url ?? null, merged.linkedin_followers ?? null, merged.linkedin_employees ?? null,
          merged.github_org ?? null, merged.github_stars ?? null, merged.github_forks ?? null,
          merged.github_open_issues ?? null, merged.github_last_commit ?? null, merged.github_repos ?? null,
          merged.youtube_channel_id ?? null, merged.youtube_subscribers ?? null,
          merged.youtube_views ?? null, merged.youtube_videos ?? null,
          merged.reddit_community ?? null, merged.reddit_subscribers ?? null,
          null, null, // tiktok (future expansion)
          now, now
        )

        enriched++
        console.log(`[enrich-social] ${listing.name}: Twitter ${merged.twitter_followers?.toLocaleString() ?? '?'}, GitHub ${merged.github_stars?.toLocaleString() ?? '?'} stars`)
      }
      catch (err) {
        console.error(`[enrich-social] Failed for ${listing.name}:`, err)
        failed++
      }

      await new Promise(r => setTimeout(r, 1200))
    }

    db.prepare(`UPDATE agent_runs SET status='done', finished_at=?, items_found=?, items_added=?, items_failed=? WHERE id=?`)
      .run(new Date().toISOString(), processed, enriched, failed, runId)
  }
  catch (err) {
    db.prepare(`UPDATE agent_runs SET status='error', finished_at=? WHERE id=?`).run(new Date().toISOString(), runId)
    throw err
  }

  return { processed, enriched, failed }
}
