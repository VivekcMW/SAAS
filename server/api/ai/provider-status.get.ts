import { requireAdmin } from '~/server/utils/auth'
import { providerStatus, activeProviderName } from '~/server/utils/aiProvider'

/**
 * GET /api/ai/provider-status
 *
 * Admin-only endpoint. Returns configuration and circuit-breaker state
 * for each AI provider. Useful for ops dashboards and health monitoring.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const status = providerStatus()

  return {
    primary: activeProviderName(),
    providers: status,
    configuredCount: Object.values(status).filter(p => p.configured).length,
    degradedCount: Object.values(status).filter(p => p.configured && p.circuitOpen).length,
    checkedAt: new Date().toISOString()
  }
})
