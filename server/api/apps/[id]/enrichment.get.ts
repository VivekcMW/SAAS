/**
 * GET /api/apps/[id]/enrichment
 *
 * Returns all 8 enrichment table data for a given app_id.
 * Used by the app detail page to show team, funding, market signals,
 * jobs, regulatory, social, tech stack, and press coverage.
 *
 * All fields are nullable — if a table has no row yet, returns null for that section.
 * Frontend should gracefully degrade: show "Data coming soon" if null.
 */
import { getDb } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const appId = getRouterParam(event, 'id')
  if (!appId) throw createError({ statusCode: 400, statusMessage: 'App ID required' })

  const db = getDb()

  // Helper: safely parse JSON column, return [] on failure
  const j = (v: string | null): unknown[] => {
    if (!v) return []
    try { return JSON.parse(v) } catch { return [] }
  }

  // ── 1. Team ────────────────────────────────────────────────────────────────
  let team = null
  try {
    const row = db.prepare(`
      SELECT founders_json, executives_json, team_size_min, team_size_max, work_style, enriched_at
      FROM company_team WHERE app_id = ?
    `).get(appId) as {
      founders_json: string; executives_json: string;
      team_size_min: number | null; team_size_max: number | null;
      work_style: string | null; enriched_at: string
    } | undefined
    if (row) {
      team = {
        founders: j(row.founders_json),
        executives: j(row.executives_json),
        team_size_min: row.team_size_min,
        team_size_max: row.team_size_max,
        work_style: row.work_style,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 2. Funding ─────────────────────────────────────────────────────────────
  let funding = null
  try {
    const row = db.prepare(`
      SELECT total_raised_usd, last_round_json, all_rounds_json, valuation_usd, funding_status, enriched_at
      FROM funding_rounds WHERE app_id = ?
    `).get(appId) as {
      total_raised_usd: number | null; last_round_json: string;
      all_rounds_json: string; valuation_usd: number | null;
      funding_status: string | null; enriched_at: string
    } | undefined
    if (row) {
      funding = {
        total_raised_usd: row.total_raised_usd,
        last_round: j(row.last_round_json)[0] ?? null,
        all_rounds: j(row.all_rounds_json),
        valuation_usd: row.valuation_usd,
        funding_status: row.funding_status,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 3. Market Signals ──────────────────────────────────────────────────────
  let market = null
  try {
    const row = db.prepare(`
      SELECT monthly_visits, global_rank,
             g2_rating, g2_reviews, g2_categories_json, g2_badges_json,
             capterra_rating, capterra_reviews,
             producthunt_votes, producthunt_rank, producthunt_featured_at,
             appstore_rating, appstore_reviews, playstore_rating, playstore_reviews,
             domain_authority, competitors_json, tam_estimate, enriched_at
      FROM market_signals WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      market = {
        monthly_visits: row.monthly_visits ?? null,
        global_rank: row.global_rank ?? null,
        g2_rating: row.g2_rating ?? null,
        g2_reviews: row.g2_reviews ?? null,
        g2_categories: j(row.g2_categories_json as string),
        g2_badges: j(row.g2_badges_json as string),
        capterra_rating: row.capterra_rating ?? null,
        capterra_reviews: row.capterra_reviews ?? null,
        producthunt_votes: row.producthunt_votes ?? null,
        producthunt_rank: row.producthunt_rank ?? null,
        producthunt_featured_at: row.producthunt_featured_at ?? null,
        appstore_rating: row.appstore_rating ?? null,
        appstore_reviews: row.appstore_reviews ?? null,
        playstore_rating: row.playstore_rating ?? null,
        playstore_reviews: row.playstore_reviews ?? null,
        domain_authority: row.domain_authority ?? null,
        competitors: j(row.competitors_json as string),
        tam_estimate: row.tam_estimate ?? null,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 4. Jobs & Hiring ───────────────────────────────────────────────────────
  let jobs = null
  try {
    const row = db.prepare(`
      SELECT open_jobs, ats_platform, roles_json, departments_json,
             tech_stack_from_jd, hiring_policy, glassdoor_rating,
             previous_open_jobs, hiring_velocity, enriched_at
      FROM job_signals WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      jobs = {
        open_jobs: row.open_jobs ?? 0,
        ats_platform: row.ats_platform ?? null,
        roles: j(row.roles_json as string),
        departments: j(row.departments_json as string),
        tech_from_jds: j(row.tech_stack_from_jd as string),
        hiring_policy: row.hiring_policy ?? null,
        glassdoor_rating: row.glassdoor_rating ?? null,
        previous_open_jobs: row.previous_open_jobs ?? null,
        hiring_velocity: row.hiring_velocity ?? null,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 5. Regulatory ─────────────────────────────────────────────────────────
  let regulatory = null
  try {
    const row = db.prepare(`
      SELECT company_number, legal_name, incorporation_date, company_type,
             registered_country, registered_address, industry_code,
             industry_description, directors_count, status, registry_source, enriched_at
      FROM regulatory_data WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      regulatory = {
        company_number: row.company_number ?? null,
        legal_name: row.legal_name ?? null,
        incorporation_date: row.incorporation_date ?? null,
        company_type: row.company_type ?? null,
        registered_country: row.registered_country ?? null,
        registered_address: row.registered_address ?? null,
        industry_code: row.industry_code ?? null,
        industry_description: row.industry_description ?? null,
        directors_count: row.directors_count ?? null,
        status: row.status ?? 'unknown',
        registry_source: row.registry_source ?? null,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 6. Social Proof ────────────────────────────────────────────────────────
  let social = null
  try {
    const row = db.prepare(`
      SELECT twitter_handle, twitter_followers, twitter_tweets_per_week,
             linkedin_url, linkedin_followers, linkedin_employees,
             github_org, github_stars, github_forks, github_open_issues,
             github_last_commit, github_repos,
             youtube_channel_id, youtube_subscribers, youtube_views, youtube_videos,
             reddit_community, reddit_subscribers, enriched_at
      FROM social_signals WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      social = {
        twitter: row.twitter_handle ? {
          handle: row.twitter_handle,
          followers: row.twitter_followers ?? null,
          tweets_per_week: row.twitter_tweets_per_week ?? null
        } : null,
        linkedin: row.linkedin_url ? {
          url: row.linkedin_url,
          followers: row.linkedin_followers ?? null,
          employees: row.linkedin_employees ?? null
        } : null,
        github: row.github_org ? {
          org: row.github_org,
          stars: row.github_stars ?? null,
          forks: row.github_forks ?? null,
          open_issues: row.github_open_issues ?? null,
          last_commit: row.github_last_commit ?? null,
          repos: row.github_repos ?? null
        } : null,
        youtube: row.youtube_channel_id ? {
          channel_id: row.youtube_channel_id,
          subscribers: row.youtube_subscribers ?? null,
          views: row.youtube_views ?? null,
          videos: row.youtube_videos ?? null
        } : null,
        reddit: row.reddit_community ? {
          community: row.reddit_community,
          subscribers: row.reddit_subscribers ?? null
        } : null,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 7. Tech Stack ──────────────────────────────────────────────────────────
  let techStack = null
  try {
    const row = db.prepare(`
      SELECT frontend_json, backend_json, databases_json, infra_json,
             analytics_json, payments_json, comms_json, cms_json,
             mobile_json, devtools_json, security_json, raw_json, enriched_at
      FROM tech_stack WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      techStack = {
        frontend: j(row.frontend_json as string),
        backend: j(row.backend_json as string),
        databases: j(row.databases_json as string),
        infrastructure: j(row.infra_json as string),
        analytics: j(row.analytics_json as string),
        payments: j(row.payments_json as string),
        communications: j(row.comms_json as string),
        cms: j(row.cms_json as string),
        mobile: j(row.mobile_json as string),
        devtools: j(row.devtools_json as string),
        security: j(row.security_json as string),
        raw: j(row.raw_json as string),
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  // ── 8. Press & Media ───────────────────────────────────────────────────────
  let press = null
  try {
    const row = db.prepare(`
      SELECT article_count_30d, article_count_90d, top_outlets_json,
             latest_headline, latest_mention_url, latest_mention_date,
             podcast_count, press_release_count, awards_json,
             sentiment_positive, enriched_at
      FROM press_mentions WHERE app_id = ?
    `).get(appId) as Record<string, unknown> | undefined
    if (row) {
      press = {
        article_count_30d: row.article_count_30d ?? 0,
        article_count_90d: row.article_count_90d ?? 0,
        top_outlets: j(row.top_outlets_json as string),
        latest_headline: row.latest_headline ?? null,
        latest_mention_url: row.latest_mention_url ?? null,
        latest_mention_date: row.latest_mention_date ?? null,
        podcast_count: row.podcast_count ?? 0,
        press_release_count: row.press_release_count ?? 0,
        awards: j(row.awards_json as string),
        sentiment_positive: row.sentiment_positive ?? 50,
        enriched_at: row.enriched_at
      }
    }
  } catch { /* table may not exist yet */ }

  return {
    app_id: appId,
    team,
    funding,
    market,
    jobs,
    regulatory,
    social,
    tech_stack: techStack,
    press
  }
})
