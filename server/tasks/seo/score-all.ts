/**
 * Nitro scheduled task: seo:score-all
 *
 * Runs nightly to compute SEO scores for all published apps and
 * store results in app_seo_meta.
 *
 * Register in nuxt.config.ts:
 *   nitro: { experimental: { tasks: true } }
 *   scheduledTasks: { '0 3 * * *': ['seo:score-all'] }  // 3 AM UTC
 */
import { computeAppSeoScore, upsertAppSeoMeta, getAllPublishedApps } from '../utils/seoEngine'

export default defineTask({
  meta: {
    name: 'seo:score-all',
    description: 'Compute SEO scores for all published apps and store in app_seo_meta',
  },
  async run() {
    const apps = getAllPublishedApps()
    let updated = 0

    for (const app of apps) {
      try {
        const { score, breakdown } = computeAppSeoScore(app.id)
        upsertAppSeoMeta(app.id, {
          seo_score: score,
          score_breakdown: JSON.stringify(breakdown),
          last_scored_at: new Date().toISOString(),
        })
        updated++
      } catch {
        // Skip individual failures — keep scoring the rest
      }
    }

    return { result: `Scored ${updated}/${apps.length} apps` }
  },
})
