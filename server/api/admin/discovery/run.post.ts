/**
 * POST /api/admin/discovery/run
 * Manually trigger a full source crawler run from the admin dashboard.
 *
 * Body: { source: 'yc'|'producthunt'|'github'|'hackernews'|'indiehackers'|'reddit'|'appsumo'|'zapier'|'enrich'; limit?: number }
 */
import { requireAdmin } from '~/server/utils/auth'
import { runYCCrawler } from '~/server/utils/discovery/crawlers/yc'
import { runProductHuntCrawler } from '~/server/utils/discovery/crawlers/producthunt'
import { runGitHubCrawler } from '~/server/utils/discovery/crawlers/github'
import { runHackerNewsCrawler } from '~/server/utils/discovery/crawlers/hackernews'
import { runIndieHackersCrawler } from '~/server/utils/discovery/crawlers/indiehackers'
import { runRedditCrawler } from '~/server/utils/discovery/crawlers/reddit'
import { runAppSumoCrawler } from '~/server/utils/discovery/crawlers/appsumo'
import { runZapierCrawler } from '~/server/utils/discovery/crawlers/zapier'
import { runProxycurlEnrichmentBatch } from '~/server/utils/discovery/enrichment/proxycurl'

const VALID_SOURCES = [
  'yc', 'producthunt', 'github', 'hackernews',
  'indiehackers', 'reddit', 'appsumo', 'zapier', 'enrich'
] as const
type Source = typeof VALID_SOURCES[number]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ source: Source; limit?: number }>(event)

  if (!body?.source || !VALID_SOURCES.includes(body.source)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid source. Valid values: ${VALID_SOURCES.join(', ')}`
    })
  }

  const limit = Math.min(Number(body.limit) || 50, 500)

  type CrawlerFn = (limit: number) => Promise<{ found: number; added: number; failed: number }>
  type EnrichFn = (limit: number) => Promise<{ processed: number; enriched: number; skipped: number }>

  const runners: Record<Exclude<Source, 'enrich'>, CrawlerFn> = {
    yc: runYCCrawler,
    producthunt: runProductHuntCrawler,
    github: runGitHubCrawler,
    hackernews: runHackerNewsCrawler,
    indiehackers: runIndieHackersCrawler,
    reddit: runRedditCrawler,
    appsumo: runAppSumoCrawler,
    zapier: runZapierCrawler
  }

  // Run async — return immediately, crawler logs to console
  if (body.source === 'enrich') {
    const enrichFn: EnrichFn = runProxycurlEnrichmentBatch
    enrichFn(limit)
      .then(r => console.log('[discovery/run] enrich complete', r))
      .catch(e => console.error('[discovery/run] enrich error', e))
  }
  else {
    runners[body.source](limit)
      .then(r => console.log(`[discovery/run] ${body.source} complete`, r))
      .catch(e => console.error(`[discovery/run] ${body.source} error`, e))
  }

  return {
    success: true,
    message: `${body.source} started (limit: ${limit}). Check agent_runs for status.`
  }
})
