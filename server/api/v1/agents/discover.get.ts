/**
 * GET /api/v1/agents/discover
 *
 * AI Agent Tool Registry — Pillar 7.4 of the moonmart.ai World #1 plan.
 *
 * Purpose: AI agents (AutoGPT, LangChain, Claude tools, etc.) can query this
 * endpoint to discover and evaluate SaaS tools programmatically.
 *
 * Requires an API key.
 *
 * Query params:
 *   task         string    What the agent needs to do (e.g. "send_email", "crm", "analytics")
 *   budget_usd   number    Maximum monthly budget in USD
 *   seats        number    Number of users
 *   integrations string    Comma-separated list of tools to integrate with
 *   free_only    boolean   true = free / freemium only
 *   limit        number    1–10 (default 5)
 *
 * Returns structured JSON optimised for agent consumption:
 *   - Deterministic ordering (best match first)
 *   - machine_action URLs for each tool (direct evaluate / add to stack)
 *   - Structured metadata (capabilities, pricing, rating, integrations)
 */
import { resolveApiKey } from '~/server/utils/apiKeyAuth'
import { getMarketplaceApps } from '~/server/utils/apps'

// Simple task → category mapping so agents don't need to know moonmart categories
const TASK_MAP: Record<string, string> = {
  send_email:           'Email Marketing',
  email:                'Email Marketing',
  email_marketing:      'Email Marketing',
  crm:                  'CRM',
  customer_relationship: 'CRM',
  project_management:   'Project Management',
  task_management:      'Project Management',
  project:              'Project Management',
  analytics:            'Analytics',
  data_analytics:       'Analytics',
  hr:                   'HR & Payroll',
  payroll:              'HR & Payroll',
  accounting:           'Finance & Accounting',
  finance:              'Finance & Accounting',
  support:              'Customer Support',
  customer_support:     'Customer Support',
  helpdesk:             'Customer Support',
  marketing:            'Marketing Automation',
  marketing_automation: 'Marketing Automation',
  communication:        'Communication',
  messaging:            'Communication',
  design:               'Design',
  devops:               'DevOps',
  ci_cd:                'DevOps',
  security:             'Security',
}

export default defineEventHandler(async (event) => {
  resolveApiKey(event)

  const q = getQuery(event)
  const task         = typeof q.task         === 'string' ? q.task.toLowerCase()    : ''
  const budgetUsd    = q.budget_usd  ? Number(q.budget_usd)  : undefined
  const seats        = q.seats       ? Number(q.seats)       : undefined
  const integrations = typeof q.integrations === 'string'
    ? q.integrations.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : []
  const freeOnly = q.free_only === 'true' || q.free_only === '1'
  const limit    = Math.min(10, Math.max(1, Number(q.limit) || 5))

  // Map task to category
  const category = TASK_MAP[task.replaceAll(' ', '_')] || task || undefined

  // Build pricing filter
  let pricingType: string | undefined
  if (freeOnly) pricingType = 'free'

  const result = getMarketplaceApps({
    category,
    pricingType,
    sortBy: 'rating',
    perPage: limit * 3,  // fetch more, then filter down
    page: 1,
  })

  let tools = result.apps

  // Filter by budget if provided (per-seat monthly)
  if (budgetUsd !== undefined && seats) {
    tools = tools.filter((app) => {
      if (!app.pricing.value) return true  // free or contact — include
      const perSeatMonthly = app.pricing.period === 'year'
        ? app.pricing.value / 12
        : app.pricing.value
      return perSeatMonthly * seats <= budgetUsd
    })
  } else if (budgetUsd !== undefined) {
    tools = tools.filter((app) => {
      if (!app.pricing.value) return true
      const monthly = app.pricing.period === 'year' ? app.pricing.value / 12 : app.pricing.value
      return monthly <= budgetUsd
    })
  }

  // Filter by integration compatibility (name substring match on app tags/integrations)
  if (integrations.length > 0) {
    tools = tools.filter((app) => {
      const haystack = [
        ...(app.tags || []),
        ...(app.integrations || []),
        app.name,
        app.category,
      ].map((s) => s.toLowerCase())
      return integrations.every((req) => haystack.some((h) => h.includes(req)))
    })
  }

  const recommendations = tools.slice(0, limit).map((app, idx) => {
    let monthly: number | null = null
    if (app.pricing.value) {
      monthly = app.pricing.period === 'year' ? Math.round(app.pricing.value / 12) : app.pricing.value
    }
    let pricingLabel = 'Contact for pricing'
    if (app.pricing.type === 'free') pricingLabel = 'Free'
    else if (monthly) pricingLabel = `$${monthly}/${app.pricing.period ?? 'mo'}`

    return {
      rank: idx + 1,
      id: app.id,
      slug: app.slug,
      name: app.name,
      category: app.category,
      short_description: app.shortDescription || app.description,
      rating: app.rating,
      review_count: app.reviewCount,
      pricing: { type: app.pricing.type, monthly_usd: monthly, label: pricingLabel },
      integrations: (app.integrations || []).slice(0, 10),
      tags: (app.tags || []).slice(0, 8),
      logo: app.logo,
      machine_actions: {
        view_details: `https://moonmart.ai/marketplace/app/${app.slug}`,
        add_to_stack: `https://moonmart.ai/stack?add=${app.slug}`,
        compare: `https://moonmart.ai/marketplace/compare?apps=${app.slug}`,
        embed_widget: `<script src="https://moonmart.ai/embed.js" data-app="${app.slug}" async></` + 'script>',
      },
    }
  })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')

  return {
    query: { task, budget_usd: budgetUsd, seats, integrations, free_only: freeOnly },
    resolved_category: category || null,
    count: recommendations.length,
    recommendations,
    powered_by: 'moonmart.ai Agent Registry — https://moonmart.ai/developer',
  }
})
