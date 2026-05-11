<script setup lang="ts">
/**
 * Vendor Showcase Page — /app/:id
 *
 * Immersive single-page experience for an individual SaaS listing.
 * Uses the same real API data as /marketplace/app/[id], but presents
 * it in a dedicated full-width layout with sticky icon sidebar,
 * anchor-linked sections, and an enquiry CTA per section.
 */

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { computeMoonmartScore, getMoonmartScoreLabel } from '~/utils/moonmartScore'
import { useCompare } from '~/composables/useCompare'
import { useFavorites } from '~/composables/useFavorites'

definePageMeta({ layout: false })

const route = useRoute()
const appId = computed(() => route.params.id as string)

// ─── Compare + Save ───────────────────────────────────────────────────────────
const { toggleCompare, isInCompare, canAddMore } = useCompare()
const { toggle: toggleFavorite, isSaved } = useFavorites()

const inCompare = computed(() => isInCompare(appId.value))
const inStack   = computed(() => isSaved(appId.value).value)

function handleCompareToggle() {
  if (!inCompare.value && !canAddMore.value) return
  toggleCompare(appId.value)
}
function handleSaveToggle() {
  toggleFavorite(appId.value)
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Pricing {
  type: 'free' | 'trial' | 'paid' | 'contact'
  value?: number
  period?: string
}
interface AppData {
  id: string
  slug?: string
  name: string
  logo: string
  provider: string
  description: string
  longDescription?: string
  rating: number
  reviewCount: number
  tags?: string[]
  pricing: Pricing
  category?: string
  featured?: boolean
  trending?: boolean
  screenshots?: { url: string; caption?: string }[]
  features?: string[] | { name: string; group?: string; included?: boolean; description?: string; tier?: string }[]
  integrations?: string[]
  security?: { certifications?: string[] }
  performance?: { uptime?: number }
  languages?: string[]
  lastUpdated?: string
}

// ─── Data fetching ────────────────────────────────────────────────────────────
const { data, pending, error } = await useFetch<AppData>(`/api/apps/${appId.value}`, {
  key: `showcase-app-${appId.value}`
})
const { data: reviewsData } = await useFetch<{ reviews: any[]; total: number; distribution: Record<number, number> }>(
  `/api/apps/${appId.value}/reviews`,
  { key: `showcase-reviews-${appId.value}`, query: { limit: 6, sort: 'helpful' } }
)
const { data: similarData } = await useFetch<{ similar: any[] }>(
  `/api/apps/${appId.value}/similar`,
  { key: `showcase-similar-${appId.value}` }
)

// ── Enrichment data (non-blocking — graceful fallback to null if not yet enriched) ──
const { data: enrichmentData } = await useFetch<{
  app_id: string
  team: { founders: any[]; executives: any[]; team_size_min: number | null; team_size_max: number | null; work_style: string | null; enriched_at: string } | null
  funding: { total_raised_usd: number | null; last_round: any; all_rounds: any[]; valuation_usd: number | null; funding_status: string | null; enriched_at: string } | null
  market: { monthly_visits: number | null; global_rank: number | null; g2_rating: number | null; g2_reviews: number | null; g2_categories: string[]; producthunt_votes: number | null; domain_authority: number | null; tam_estimate: number | null } | null
  jobs: { open_jobs: number; ats_platform: string | null; roles: any[]; hiring_velocity: number | null } | null
  social: { twitter: { handle: string; followers: number | null } | null; github: { org: string; stars: number | null; repos: number | null } | null; linkedin: { followers: number | null; employees: number | null } | null } | null
  tech_stack: { frontend: string[]; backend: string[]; databases: string[]; infrastructure: string[]; analytics: string[]; payments: string[] } | null
  press: { article_count_30d: number; article_count_90d: number; awards: string[]; sentiment_positive: number; latest_headline: string | null } | null
  regulatory: { legal_name: string | null; incorporation_date: string | null; registered_country: string | null; status: string } | null
} | null>(
  `/api/apps/${appId.value}/enrichment`,
  { key: `showcase-enrich-${appId.value}`, default: () => null }
)

const enrich = computed(() => enrichmentData.value)

const app = computed(() => data.value as AppData | null)

// Track page view
if (import.meta.client) {
  onMounted(() => {
    $fetch(`/api/apps/${appId.value}/view`, { method: 'POST' }).catch(() => {})
  })
}

// ─── Normalization helpers ────────────────────────────────────────────────────
const normalizedFeatures = computed(() => {
  const feats = app.value?.features
  if (!feats || feats.length === 0) {
    return [
      { name: 'User management', group: 'Core', included: true },
      { name: 'API access', group: 'Core', included: true },
      { name: 'Custom reports', group: 'Analytics', included: true },
      { name: 'SSO / SAML', group: 'Security', included: true, tier: 'Business' },
      { name: 'Audit logs', group: 'Security', included: true, tier: 'Business' },
      { name: 'Dedicated support', group: 'Support', included: true, tier: 'Enterprise' }
    ]
  }
  if (typeof feats[0] === 'string') {
    return (feats as string[]).map(f => ({ name: f, included: true, group: 'Core Features' }))
  }
  return feats as { name: string; group?: string; included: boolean; description?: string; tier?: string }[]
})

const normalizedScreenshots = computed(() => {
  const s = app.value?.screenshots || []
  if (s.length === 0) {
    return Array.from({ length: 3 }, (_, i) => ({
      type: 'image' as const,
      url: `https://placehold.co/1280x800/1F2742/A8B5CC?text=${encodeURIComponent(app.value?.name || 'App')}+Screen+${i + 1}`,
      caption: `${app.value?.name} — screen ${i + 1}`
    }))
  }
  return s.map(ss => ({ type: 'image' as const, url: ss.url, caption: ss.caption }))
})

const normalizedIntegrations = computed(() => {
  const raw = app.value?.integrations || []
  if (raw.length === 0) {
    return ['Slack', 'Google Drive', 'Zapier', 'GitHub', 'Notion', 'Microsoft Teams'].map(n => ({
      name: n, type: 'native' as const
    }))
  }
  return raw.map(n => ({ name: n, type: 'native' as const }))
})

// ─── Derived display data ─────────────────────────────────────────────────────
const verdict = computed(() => {
  if (!app.value) return ''
  if (app.value.featured) return "Editor's Pick"
  if (app.value.trending) return 'Trending'
  if (app.value.rating >= 4.5) return 'Top Rated'
  return ''
})

const priceLabel = computed(() => {
  const p = app.value?.pricing
  if (!p) return '—'
  if (p.type === 'free') return 'Free'
  if (p.type === 'contact') return 'Custom pricing'
  if (p.value) {
    const suffix = p.period ? `/${p.period}` : ''
    return `$${p.value}${suffix}`
  }
  return 'Paid'
})

const moonmartScore = computed(() => {
  if (!app.value) return null
  const score = computeMoonmartScore({
    rating: app.value.rating,
    reviewCount: app.value.reviewCount,
    integrationCount: normalizedIntegrations.value.length,
    pricingType: app.value.pricing?.type,
    pricingValue: app.value.pricing?.value,
    certifications: app.value.security?.certifications,
    featured: app.value.featured
  })
  return { score, label: getMoonmartScoreLabel(score) }
})

const pricingPlans = computed(() => {
  const p = app.value?.pricing
  const base = p?.value || 29
  if (p?.type === 'free') {
    return [
      { name: 'Free', price: 0, description: 'Get started at no cost', features: ['Core features', 'Up to 3 projects', 'Community support'], popular: false },
      { name: 'Pro', price: base || 19, description: 'For growing teams', features: ['Everything in Free', 'Unlimited projects', 'Priority support', 'Advanced analytics', 'API access'], popular: true },
      { name: 'Enterprise', price: null, custom: true, description: 'For large organizations', features: ['Everything in Pro', 'SSO / SAML', 'Dedicated CSM', 'Custom SLA', 'Audit logs'], popular: false }
    ]
  }
  return [
    { name: 'Starter', price: Math.round(base * 0.5), description: 'For individuals and small teams', features: ['Up to 5 users', 'Core features', 'Email support', 'Standard integrations'], popular: false },
    { name: 'Business', price: base, description: 'Most popular for growing teams', features: ['Up to 50 users', 'Advanced features', 'Priority support', 'API access', 'Custom reports'], popular: true },
    { name: 'Enterprise', price: null, custom: true, description: 'For large-scale deployments', features: ['Unlimited users', 'SSO / SAML', 'Dedicated support', 'Custom SLA', 'Audit logs'], popular: false }
  ]
})

const reviews = computed(() => reviewsData.value?.reviews || [])
const ratingBreakdown = computed(() => {
  const dist = reviewsData.value?.distribution || {}
  const total = app.value?.reviewCount || reviewsData.value?.total || 100
  const defaults = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  return { ...defaults, ...dist, total }
})

const alternatives = computed(() =>
  (similarData.value?.similar || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    tagline: a.description,
    rating: a.rating,
    startingPrice: (() => {
      if (a.pricingType === 'free') return 'Free'
      if (a.pricingValue) return `$${a.pricingValue}/mo`
      return 'Paid'
    })(),
    logo: a.logo
  }))
)

// "You might also need" — derived from integrations, with curated fallbacks
const complementaryApps = computed(() => {
  const integrations = app.value?.integrations || []
  const integrationsNamed: { id: string; name: string; logo?: string; why: string }[] = []
  const fallbackMap: Record<string, { id: string; name: string; why: string }[]> = {
    crm: [
      { id: 'slack', name: 'Slack', why: 'Team communication & deal alerts' },
      { id: 'zapier', name: 'Zapier', why: 'Automate workflows between tools' },
      { id: 'hubspot', name: 'HubSpot', why: 'Marketing automation' },
    ],
    project: [
      { id: 'slack', name: 'Slack', why: 'Team updates & notifications' },
      { id: 'figma', name: 'Figma', why: 'Design handoff' },
      { id: 'github', name: 'GitHub', why: 'Code + project sync' },
    ],
    default: [
      { id: 'slack', name: 'Slack', why: 'Team communication layer' },
      { id: 'zapier', name: 'Zapier', why: 'Connect to 5,000+ apps' },
      { id: 'notion', name: 'Notion', why: 'Documentation & wikis' },
      { id: 'google-workspace', name: 'Google Workspace', why: 'Email, Docs & Drive' },
    ]
  }
  // Prefer integration data if available
  if (integrations.length > 0) {
    return integrations.slice(0, 4).map((name: string) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      why: 'Native integration available',
      logo: undefined
    }))
  }
  const cat = (app.value?.category || '').toLowerCase()
  const key = Object.keys(fallbackMap).find(k => cat.includes(k)) || 'default'
  return fallbackMap[key]
})

const companyInfo = computed(() => {
  const e = enrich.value
  const teamSizeLabel = e?.team
    ? e.team.team_size_min != null && e.team.team_size_max != null
      ? `${e.team.team_size_min}–${e.team.team_size_max}`
      : e.team.team_size_min != null ? `${e.team.team_size_min}+` : undefined
    : undefined
  const investors = e?.funding?.last_round?.investors ?? []

  return {
    name: app.value?.provider || '—',
    // Real data from regulatory / team enrichment
    founded: e?.regulatory?.incorporation_date
      ? new Date(e.regulatory.incorporation_date).getFullYear()
      : undefined,
    headquarters: e?.regulatory?.registered_country ?? undefined,
    employees: teamSizeLabel,
    // Funding data
    fundingTotal: e?.funding?.total_raised_usd
      ? `$${(e.funding.total_raised_usd / 1_000_000).toFixed(1)}M`
      : undefined,
    latestRound: e?.funding?.last_round
      ? `${e.funding.last_round.stage ?? ''} (${e.funding.last_round.date ?? ''})`.trim()
      : undefined,
    investors: Array.isArray(investors) ? investors : [],
    // Links
    website: app.value ? `https://${app.value.provider?.toLowerCase().replace(/\s+/g, '')}.com` : '#',
    linkedin: e?.social?.linkedin ? `https://linkedin.com/company/${e.social.linkedin.employees}` : undefined,
    twitter: e?.social?.twitter?.handle ? `https://twitter.com/${e.social.twitter.handle}` : undefined
  }
})

const aboutQuickFacts = computed(() => {
  const p = app.value?.pricing
  let startingPrice = 'Paid plans'
  if (p?.type === 'free') startingPrice = 'Free forever'
  else if (p?.type === 'contact') startingPrice = 'Custom pricing'
  else if (p?.value) {
    const suffix = p.period ? `/${p.period}` : ''
    startingPrice = `$${p.value}${suffix}`
  }
  return [
    { icon: 'heroicons:tag', label: 'Category', value: getCategoryLabel(app.value?.category) },
    { icon: 'heroicons:currency-dollar', label: 'Starts at', value: startingPrice },
    { icon: 'heroicons:cloud', label: 'Deployment', value: 'Cloud · SaaS' },
    { icon: 'heroicons:globe-alt', label: 'Available in', value: `${app.value?.languages?.length || 12}+ languages` }
  ]
})

const aboutHighlights = computed(() => {
  const rating = app.value?.rating || 0
  const featCount = normalizedFeatures.value.length
  const integCount = normalizedIntegrations.value.length
  const uptime = app.value?.performance?.uptime || 99.9
  const base = [
    { icon: 'heroicons:bolt', color: '#D4A843', bg: 'rgba(212,168,67,0.12)', title: 'Fast to deploy', body: `Go from signup to production with ${featCount}+ capabilities and clear onboarding flows.` },
    { icon: 'heroicons:squares-plus', color: '#4A80D4', bg: 'rgba(74,128,212,0.12)', title: 'Fits your stack', body: `${integCount} native integrations plus REST APIs and webhooks.` },
    { icon: 'heroicons:shield-check', color: '#2A9D8F', bg: 'rgba(42,157,143,0.12)', title: 'Enterprise-grade', body: `${uptime}% uptime with SOC 2 compliance and role-based access.` }
  ]
  if (rating >= 4.5) {
    base[0] = { icon: 'heroicons:sparkles', color: '#D4A843', bg: 'rgba(212,168,67,0.12)', title: 'Top Rated', body: `Rated ${rating.toFixed(1)}\u2605 across ${app.value?.reviewCount || 0}+ verified reviews.` }
  }
  return base
})

const aboutUseCases = computed(() => {
  const base = app.value?.tags?.length ? app.value.tags.slice(0, 4) : []
  return base.length >= 3 ? base : ['Small teams', 'Growing startups', 'Mid-market companies', 'Enterprise teams']
})

const faqs = computed(() => {
  const name = app.value?.name || 'This app'
  const integNames = normalizedIntegrations.value.slice(0, 5).map(i => i.name).join(', ')
  const certs = (app.value?.security?.certifications || ['SOC 2 Type II']).join(', ')
  const period = app.value?.pricing?.period
  const periodSuffix = period ? ` per ${period}` : ''
  return [
    {
      q: `Is ${name} free to use?`,
      a: app.value?.pricing?.type === 'free'
        ? `Yes, ${name} offers a free tier with core features. Paid plans unlock advanced capabilities.`
        : `${name} offers a free trial. Paid plans start at ${priceLabel.value}${periodSuffix}.`
    },
    { q: `What integrations does ${name} support?`, a: `${name} integrates with ${integNames}, and more via API and Zapier.` },
    { q: `Is ${name} secure?`, a: `Yes. ${name} is ${certs} compliant and encrypts all data in transit and at rest.` },
    { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel at any time from your account settings. No long-term contracts required.' },
    { q: `Does ${name} have a mobile app?`, a: `${name} is available on web, iOS, and Android.` },
    { q: 'What support is available?', a: 'All plans include email support. Paid plans get priority support. Enterprise customers receive a dedicated customer success manager.' }
  ]
})

const sentimentTags = [
  { tag: 'Easy onboarding', percent: 92, positive: true },
  { tag: 'Great support', percent: 87, positive: true },
  { tag: 'Intuitive UI', percent: 81, positive: true },
  { tag: 'Pricey', percent: 34, positive: false },
  { tag: 'Learning curve', percent: 28, positive: false }
]

// ─── Sidebar navigation ───────────────────────────────────────────────────────
const navSections = [
  { id: 'home', icon: 'heroicons:home', label: 'Overview' },
  { id: 'features', icon: 'heroicons:sparkles', label: 'Features' },
  { id: 'gallery', icon: 'heroicons:photo', label: 'Gallery' },
  { id: 'pricing', icon: 'heroicons:currency-dollar', label: 'Pricing' },
  { id: 'integrations', icon: 'heroicons:puzzle-piece', label: 'Integrations' },
  { id: 'reviews', icon: 'heroicons:star', label: 'Reviews' },
  { id: 'about', icon: 'heroicons:information-circle', label: 'About' },
  { id: 'tech-stack', icon: 'heroicons:cpu-chip', label: 'Tech Stack' },
  { id: 'jobs', icon: 'heroicons:briefcase', label: 'Jobs' },
  { id: 'press', icon: 'heroicons:newspaper', label: 'Press' },
  { id: 'faq', icon: 'heroicons:question-mark-circle', label: 'FAQ' },
  { id: 'similar', icon: 'heroicons:squares-2x2', label: 'Similar' }
]

const activeSection = ref('home')
const showEnquiryModal = ref(false)
const enquirySection = ref('')

// Enquiry form state
const enquiryForm = reactive({ name: '', email: '', message: '' })
const enquirySubmitting = ref(false)
const enquiryError = ref('')
const enquirySuccess = ref(false)

async function submitEnquiry() {
  enquiryError.value = ''
  enquirySubmitting.value = true
  try {
    // Log enquiry locally — replace with a real lead endpoint when available
    console.info('[Showcase] Enquiry submitted', {
      appId: appId.value,
      section: enquirySection.value,
      ...enquiryForm
    })
    enquirySuccess.value = true
    enquiryForm.name = ''
    enquiryForm.email = ''
    enquiryForm.message = ''
    setTimeout(() => { showEnquiryModal.value = false; enquirySuccess.value = false }, 2000)
  } catch {
    enquiryError.value = 'Something went wrong. Please try again.'
  } finally {
    enquirySubmitting.value = false
  }
}

let scrollObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return
  scrollObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      }
    },
    { threshold: 0.25, rootMargin: '-80px 0px -60% 0px' }
  )
  navSections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) scrollObserver?.observe(el)
  })
})

onUnmounted(() => { scrollObserver?.disconnect() })

function scrollTo(id: string) {
  if (!import.meta.client) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeSection.value = id
}

function openEnquiry(section: string) {
  enquirySection.value = section
  showEnquiryModal.value = true
}

// ─── SEO ──────────────────────────────────────────────────────────────────────
const canonicalUrl = computed(() => `https://moonmart.ai/marketplace/app/${appId.value}`)
const { generateAppPageSchema } = useSchemaMarkup()

useHead(() => ({
  title: app.value ? `${app.value.name} — Product Overview | moonmart.ai` : 'App Overview | moonmart.ai',
  meta: [
    { name: 'description', content: app.value?.description || 'Discover SaaS tools on moonmart.ai.' },
    { property: 'og:title', content: app.value ? `${app.value.name} — moonmart.ai` : 'moonmart.ai' },
    { property: 'og:description', content: app.value?.description || '' },
    { property: 'og:image', content: `/api/og/app/${appId.value}` },
    { property: 'og:url', content: canonicalUrl.value }
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: app.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify(generateAppPageSchema({
          name: app.value.name,
          slug: app.value.slug || appId.value,
          description: app.value.description || '',
          shortDescription: app.value.longDescription?.slice(0, 200) || app.value.description.slice(0, 200),
          category: app.value.category || 'software',
          rating: app.value.rating || 0,
          reviewCount: app.value.reviewCount || 0,
          pricingType: app.value.pricing?.type,
          pricingValue: app.value.pricing?.value,
          logo: app.value.logo,
          features: app.value.features?.map((f: any) => typeof f === 'string' ? f : f.name).filter(Boolean)
        }))
      }]
    : []
}))

// ─── Utilities ────────────────────────────────────────────────────────────────
function getCategoryLabel(cat?: string): string {
  if (!cat) return 'SaaS'
  const acronyms: Record<string, string> = {
    'crm': 'CRM', 'erp': 'ERP', 'ai': 'AI', 'bi': 'BI', 'hr': 'HR',
    'api': 'API', 'cms': 'CMS', 'sms': 'SMS', 'iot': 'IoT', 'ui': 'UI',
    'ux': 'UX', 'saas': 'SaaS', 'b2b': 'B2B', 'b2c': 'B2C',
    'crm-and-sales': 'CRM & Sales', 'hr-and-people': 'HR & People',
  }
  const lower = cat.toLowerCase()
  if (acronyms[lower]) return acronyms[lower]
  return cat.charAt(0).toUpperCase() + cat.slice(1).replaceAll('-', ' ')
}
</script>

<template>
  <div class="showcase-page">
    <!-- Loading -->
    <div v-if="pending" class="showcase-state">
      <div class="showcase-spinner"></div>
      <p>Loading…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error || !app" class="showcase-state">
      <svg class="showcase-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4m0 4h.01" stroke-linecap="round"/>
      </svg>
      <h2>App not found</h2>
      <p>We couldn't find what you're looking for.</p>
      <NuxtLink to="/marketplace" class="sc-btn sc-btn--primary">Back to Marketplace</NuxtLink>
    </div>

    <!-- Main showcase -->
    <template v-else>
      <AppWebsiteNavbar :app="app" :active-section="activeSection" @navigate="scrollTo" />

      <div class="showcase-layout">
        <!-- Icon sidebar -->
        <nav class="showcase-sidebar" aria-label="Page sections">
          <button
            v-for="s in navSections"
            :key="s.id"
            class="sc-nav-btn"
            :class="{ 'is-active': activeSection === s.id }"
            :title="s.label"
            @click="scrollTo(s.id)"
          >
            <Icon :name="s.icon" class="sc-nav-icon" />
            <span class="sc-nav-tooltip">{{ s.label }}</span>
          </button>
</nav>

        <!-- Content -->
        <main class="showcase-content">

          <!-- Overview / Hero -->
          <section id="home" class="sc-section sc-section--hero">
            <div class="sc-container">
              <nav class="sc-breadcrumb" aria-label="breadcrumb">
                <NuxtLink to="/marketplace" class="sc-bc-link">Marketplace</NuxtLink>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                <NuxtLink v-if="app.category" :to="`/marketplace?category=${app.category}`" class="sc-bc-link">{{ getCategoryLabel(app.category) }}</NuxtLink>
                <svg v-if="app.category" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                <span class="sc-bc-current">{{ app.name }}</span>
              </nav>

              <div class="sc-hero">
                <div class="sc-hero__media">
                  <img
                    v-if="normalizedScreenshots[0]"
                    :src="normalizedScreenshots[0].url"
                    :alt="`${app.name} screenshot`"
                    class="sc-hero__screenshot"
                    loading="eager"
                  />
                  <div v-else class="sc-hero__placeholder">
                    <img v-if="app.logo" :src="app.logo" :alt="app.name" class="sc-hero__logo-lg" />
                  </div>
                </div>

                <div class="sc-hero__body">
                  <div class="sc-hero__badges">
                    <span v-if="verdict" class="sc-badge sc-badge--gold">{{ verdict }}</span>
                    <span v-if="app.category" class="sc-badge sc-badge--neutral">{{ getCategoryLabel(app.category) }}</span>
                  </div>

                  <div class="sc-hero__brand">
                    <img v-if="app.logo" :src="app.logo" :alt="app.name" class="sc-hero__logo" />
                    <div>
                      <h1 class="sc-hero__name">{{ app.name }}</h1>
                      <p class="sc-hero__provider">by {{ app.provider }}</p>
                    </div>
                  </div>

                  <p class="sc-hero__desc">{{ app.longDescription || app.description }}</p>

                  <ul class="sc-stats">
                    <li class="sc-stat">
                      <span class="sc-stat__value">{{ app.rating.toFixed(1) }}★</span>
                      <span class="sc-stat__label">{{ app.reviewCount }} reviews</span>
                    </li>
                    <li class="sc-stat">
                      <span class="sc-stat__value">{{ priceLabel }}</span>
                      <span class="sc-stat__label">starting price</span>
                    </li>
                    <li v-if="moonmartScore" class="sc-stat">
                      <span class="sc-stat__value sc-stat__value--gold">{{ moonmartScore.score }}</span>
                      <span class="sc-stat__label">Moonmart Score</span>
                    </li>
                    <li class="sc-stat">
                      <span class="sc-stat__value">{{ app.performance?.uptime || 99.9 }}%</span>
                      <span class="sc-stat__label">uptime</span>
                    </li>
                  </ul>

                  <div v-if="app.tags?.length" class="sc-tags">
                    <span v-for="tag in app.tags.slice(0, 5)" :key="tag" class="sc-tag">{{ tag }}</span>
                  </div>

                  <div class="sc-hero__ctas">
                    <button class="sc-btn sc-btn--primary" @click="openEnquiry('overview')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h11" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      Request a Demo
                    </button>
                    <a v-if="app.websiteUrl || true" :href="app.websiteUrl || '#'" target="_blank" rel="noopener noreferrer" class="sc-btn sc-btn--ghost">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      Visit site
                    </a>
                    <button
                      class="sc-btn sc-btn--icon"
                      :class="{ active: inCompare }"
                      :title="inCompare ? 'Remove from compare' : (canAddMore ? 'Add to compare' : 'Compare full (4/4)')"
                      :disabled="!inCompare && !canAddMore"
                      @click="handleCompareToggle"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                      {{ inCompare ? 'In Compare' : '+ Compare' }}
                    </button>
                    <button
                      class="sc-btn sc-btn--icon"
                      :class="{ active: inStack }"
                      :title="inStack ? 'Remove from My Stack' : 'Save to My Stack'"
                      @click="handleSaveToggle"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" :fill="inStack ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                      {{ inStack ? 'Saved' : 'Save' }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="app.security?.certifications?.length" class="sc-trust">
                <span v-for="cert in app.security.certifications" :key="cert" class="sc-trust__badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linecap="round"/></svg>
                  {{ cert }}
                </span>
              </div>
            </div>
          </section>

          <!-- Features -->
          <section id="features" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Key Features</h2>
                <p class="sc-section-sub">What you get with {{ app.name }}</p>
              </header>
              <AppFeatureMatrix :features="normalizedFeatures" :show-groups="true" />
              <div class="sc-section-cta">
                <button class="sc-btn sc-btn--ghost" @click="openEnquiry('features')">Ask about a specific feature</button>
              </div>
            </div>
          </section>

          <!-- Gallery -->
          <section id="gallery" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Screenshots & Media</h2>
                <p class="sc-section-sub">See {{ app.name }} in action</p>
              </header>
              <AppMediaGallery :items="normalizedScreenshots" :app-name="app.name" />
              <div class="sc-section-cta">
                <button class="sc-btn sc-btn--ghost" @click="openEnquiry('gallery')">Request a live walkthrough</button>
              </div>
            </div>
          </section>

          <!-- Pricing -->
          <section id="pricing" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Pricing</h2>
                <p class="sc-section-sub">Simple plans that scale with you</p>
              </header>
              <AppPricingCards :plans="pricingPlans" @select="openEnquiry('pricing')" />
              <p class="sc-pricing-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01" stroke-linecap="round"/></svg>
                Pricing shown is indicative. Contact vendor for accurate quotes and volume discounts.
              </p>
              <div class="sc-section-cta">
                <button class="sc-btn sc-btn--primary" @click="openEnquiry('pricing')">Get a custom quote</button>
              </div>
            </div>
          </section>

          <!-- Integrations -->
          <section id="integrations" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Integrations</h2>
                <p class="sc-section-sub">{{ normalizedIntegrations.length }} integrations available</p>
              </header>
              <AppIntegrationsGrid :integrations="normalizedIntegrations" />
              <div class="sc-section-cta">
                <button class="sc-btn sc-btn--ghost" @click="openEnquiry('integrations')">Ask about a specific integration</button>
              </div>
            </div>
          </section>

          <!-- Reviews -->
          <section id="reviews" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Reviews & Ratings</h2>
                <p class="sc-section-sub">What real users say about {{ app.name }}</p>
              </header>
              <AppReviewBreakdown
                :overall-rating="app.rating"
                :review-count="app.reviewCount"
                :breakdown="ratingBreakdown"
                :reviews="reviews"
                :sentiment-tags="sentimentTags"
                :view-all-href="`/marketplace/app/${app.slug || app.id}/reviews`"
              />
              <div class="sc-section-cta">
                <NuxtLink :to="`/marketplace/app/${app.slug || app.id}`" class="sc-btn sc-btn--ghost">
                  Read all {{ app.reviewCount }} reviews
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- About -->
          <section id="about" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">About {{ app.name }}</h2>
                <p class="sc-section-sub">Everything you need to know at a glance</p>
              </header>

              <ul class="sc-facts">
                <li v-for="f in aboutQuickFacts" :key="f.label" class="sc-fact">
                  <div class="sc-fact__icon"><Icon :name="f.icon" /></div>
                  <div>
                    <div class="sc-fact__label">{{ f.label }}</div>
                    <div class="sc-fact__value">{{ f.value }}</div>
                  </div>
                </li>
              </ul>

              <div class="sc-about-desc" v-html="app.longDescription || app.description"></div>

              <div class="sc-highlights">
                <h3 class="sc-hl-title">Why teams choose {{ app.name }}</h3>
                <div class="sc-hl-grid">
                  <div
                    v-for="h in aboutHighlights"
                    :key="h.title"
                    class="sc-hl-card"
                    :style="{ '--hl-color': h.color, '--hl-bg': h.bg }"
                  >
                    <div class="sc-hl-icon"><Icon :name="h.icon" /></div>
                    <h4 class="sc-hl-card-title">{{ h.title }}</h4>
                    <p class="sc-hl-card-body">{{ h.body }}</p>
                  </div>
                </div>
              </div>

              <div class="sc-usecases">
                <h3 class="sc-uc-title">Best for</h3>
                <ul class="sc-uc-list">
                  <li v-for="uc in aboutUseCases" :key="uc" class="sc-uc-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ uc }}
                  </li>
                </ul>
              </div>

              <AppCompanyCard :info="companyInfo" />
            </div>
          </section>

          <!-- Tech Stack (enrichment-backed, hidden until data arrives) -->
          <section v-if="enrich?.tech_stack" id="tech-stack" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Technology Stack</h2>
                <p class="sc-section-sub">Detected technologies powering this product</p>
              </header>
              <div class="enrich-grid">
                <div v-for="(techs, category) in {
                  Frontend: enrich.tech_stack.frontend,
                  Backend: enrich.tech_stack.backend,
                  Databases: enrich.tech_stack.databases,
                  Infrastructure: enrich.tech_stack.infrastructure,
                  Analytics: enrich.tech_stack.analytics,
                  Payments: enrich.tech_stack.payments
                }" :key="String(category)" class="enrich-cell">
                  <div v-if="(techs as string[]).length" class="enrich-cell__body">
                    <span class="enrich-cell__label">{{ category }}</span>
                    <div class="enrich-tags">
                      <span v-for="t in (techs as string[])" :key="t" class="enrich-tag">{{ t }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Jobs & Hiring (enrichment-backed) -->
          <section v-if="enrich?.jobs && (enrich.jobs.open_jobs > 0 || enrich.jobs.roles.length > 0)" id="jobs" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Open Roles</h2>
                <p class="sc-section-sub">
                  {{ enrich.jobs.open_jobs }} open position{{ enrich.jobs.open_jobs !== 1 ? 's' : '' }}
                  <span v-if="enrich.jobs.ats_platform"> · Hiring via {{ enrich.jobs.ats_platform }}</span>
                  <span v-if="enrich.jobs.hiring_velocity && enrich.jobs.hiring_velocity > 0" class="enrich-trend-up"> ↑ {{ enrich.jobs.hiring_velocity }} new since last month</span>
                  <span v-else-if="enrich.jobs.hiring_velocity && enrich.jobs.hiring_velocity < 0" class="enrich-trend-down"> ↓ {{ Math.abs(enrich.jobs.hiring_velocity) }} fewer than last month</span>
                </p>
              </header>
              <div class="enrich-job-list">
                <div v-for="role in enrich.jobs.roles.slice(0, 10)" :key="role.title ?? role" class="enrich-job-row">
                  <span class="enrich-job-title">{{ role.title ?? role }}</span>
                  <span v-if="role.department" class="enrich-job-dept">{{ role.department }}</span>
                  <span v-if="role.location" class="enrich-job-loc">{{ role.location }}</span>
                  <a v-if="role.url" :href="role.url" target="_blank" rel="noopener noreferrer" class="enrich-job-link">Apply →</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Press & Awards (enrichment-backed) -->
          <section v-if="enrich?.press && (enrich.press.article_count_90d > 0 || enrich.press.awards.length > 0)" id="press" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Press & Recognition</h2>
              </header>
              <div class="enrich-press-stats">
                <div v-if="enrich.press.article_count_30d" class="enrich-stat-pill">
                  <span class="enrich-stat-num">{{ enrich.press.article_count_30d }}</span>
                  <span class="enrich-stat-label">articles last 30 days</span>
                </div>
                <div v-if="enrich.press.article_count_90d" class="enrich-stat-pill">
                  <span class="enrich-stat-num">{{ enrich.press.article_count_90d }}</span>
                  <span class="enrich-stat-label">articles last 90 days</span>
                </div>
                <div v-if="enrich.press.podcast_count" class="enrich-stat-pill">
                  <span class="enrich-stat-num">{{ enrich.press.podcast_count }}</span>
                  <span class="enrich-stat-label">podcast mentions</span>
                </div>
              </div>
              <div v-if="enrich.press.latest_headline" class="enrich-latest-headline">
                <span class="enrich-label-small">Latest coverage</span>
                <p>{{ enrich.press.latest_headline }}</p>
              </div>
              <div v-if="enrich.press.awards.length" class="enrich-awards">
                <span v-for="award in enrich.press.awards" :key="String(award)" class="enrich-award-badge">🏆 {{ award }}</span>
              </div>
            </div>
          </section>

          <!-- Social Proof Bar (enrichment-backed) -->
          <div v-if="enrich?.social" class="enrich-social-bar">
            <div v-if="enrich.social.twitter?.followers" class="enrich-social-item">
              <span class="enrich-social-num">{{ (enrich.social.twitter.followers / 1000).toFixed(1) }}K</span>
              <span class="enrich-social-lbl">Twitter followers</span>
            </div>
            <div v-if="enrich.social.github?.stars" class="enrich-social-item">
              <span class="enrich-social-num">{{ (enrich.social.github.stars / 1000).toFixed(1) }}K</span>
              <span class="enrich-social-lbl">GitHub stars</span>
            </div>
            <div v-if="enrich.social.linkedin?.employees" class="enrich-social-item">
              <span class="enrich-social-num">{{ enrich.social.linkedin.employees }}</span>
              <span class="enrich-social-lbl">LinkedIn employees</span>
            </div>
          </div>

          <!-- FAQ -->
          <section id="faq" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Frequently Asked Questions</h2>
              </header>
              <AppFAQ :items="faqs" />
              <div class="sc-section-cta">
                <button class="sc-btn sc-btn--ghost" @click="openEnquiry('faq')">Ask a different question</button>
              </div>
            </div>
          </section>

          <!-- Similar apps -->
          <!-- Claim your listing banner (unclaimed listings) -->
          <div v-if="!app.featured && !app.provider?.includes(' ')" class="sc-claim-banner">
            <div class="sc-container">
              <div class="sc-claim">
                <div class="sc-claim__icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="sc-claim__body">
                  <strong>Are you the maker of {{ app.name }}?</strong>
                  <span>Claim this listing to update your info, respond to reviews, and get buyer leads.</span>
                </div>
                <NuxtLink to="/list-product" class="sc-claim__cta">Claim listing →</NuxtLink>
              </div>
            </div>
          </div>

          <section v-if="alternatives.length" id="similar" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Similar Alternatives</h2>
                <p class="sc-section-sub">Compare with other tools in this category</p>
              </header>
              <AppAlternativesCarousel :items="alternatives" />
            </div>
          </section>

          <!-- You might also need (complementary apps cross-sell) -->
          <section class="sc-section sc-section--also-need">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">You might also need</h2>
                <p class="sc-section-sub">Teams using {{ app.name }} commonly pair it with these tools</p>
              </header>
              <div class="sc-also-grid">
                <NuxtLink
                  v-for="rec in complementaryApps"
                  :key="rec.id"
                  :to="`/app/${rec.id}`"
                  class="sc-also-card"
                >
                  <div class="sc-also-card__logo">
                    <img v-if="rec.logo" :src="rec.logo" :alt="rec.name" />
                    <span v-else>{{ rec.name.charAt(0) }}</span>
                  </div>
                  <div class="sc-also-card__body">
                    <span class="sc-also-card__name">{{ rec.name }}</span>
                    <span class="sc-also-card__why">{{ rec.why }}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- Final CTA -->
          <section class="sc-section sc-section--final-cta">
            <div class="sc-container">
              <div class="sc-final-cta">
                <h2 class="sc-final-cta__title">Ready to try {{ app.name }}?</h2>
                <p class="sc-final-cta__sub">
                  {{ app.pricing.type === 'free' ? 'Get started for free — no credit card required.' : 'Start your free trial today. Cancel anytime.' }}
                </p>
                <div class="sc-final-cta__actions">
                  <button class="sc-btn sc-btn--primary sc-btn--lg" @click="openEnquiry('final-cta')">
                    {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>

      <!-- Enquiry Modal -->
      <Teleport to="body">
        <div v-if="showEnquiryModal" class="sc-modal-overlay" @click.self="showEnquiryModal = false">
          <div class="sc-modal" :aria-label="`Enquiry about ${app.name}`">
            <div class="sc-modal__head">
              <div class="sc-modal__brand">
                <img v-if="app.logo" :src="app.logo" :alt="app.name" class="sc-modal__logo" />
                <div>
                  <div class="sc-modal__app-name">{{ app.name }}</div>
                  <div class="sc-modal__section">{{ enquirySection }}</div>
                </div>
              </div>
              <button class="sc-modal__close" @click="showEnquiryModal = false" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <!-- Inline enquiry form -->
            <form class="sc-enq-form" @submit.prevent="submitEnquiry">
              <div class="sc-enq-body">
                <p class="sc-enq-desc">Tell us what you'd like to know about {{ app.name }} and we'll connect you with the right person.</p>
                <div class="sc-field">
                  <label class="sc-label" for="enq-name">Your name</label>
                  <input id="enq-name" v-model="enquiryForm.name" class="sc-input" type="text" placeholder="Alex Chen" required />
                </div>
                <div class="sc-field">
                  <label class="sc-label" for="enq-email">Work email</label>
                  <input id="enq-email" v-model="enquiryForm.email" class="sc-input" type="email" placeholder="alex@company.com" required />
                </div>
                <div class="sc-field">
                  <label class="sc-label" for="enq-message">Your question or request</label>
                  <textarea id="enq-message" v-model="enquiryForm.message" class="sc-textarea" rows="3" :placeholder="`I'd like to learn more about ${app.name}…`" required></textarea>
                </div>
                <p v-if="enquiryError" class="sc-enq-error">{{ enquiryError }}</p>
                <p v-if="enquirySuccess" class="sc-enq-success">Thanks! We'll be in touch shortly.</p>
              </div>
              <div class="sc-enq-footer">
                <button type="button" class="sc-btn sc-btn--subtle" @click="showEnquiryModal = false">Cancel</button>
                <button type="submit" class="sc-btn sc-btn--primary" :disabled="enquirySubmitting">
                  {{ enquirySubmitting ? 'Sending…' : 'Send enquiry' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

    </template>
  </div>
</template>

<style scoped>
.showcase-page {
  min-height: 100vh;
  background: var(--mm-bg);
  color: var(--mm-pearl);
  font-family: var(--f-ui);
}

.showcase-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  text-align: center;
  padding: 40px 20px;
  color: var(--mm-silver);
}
.showcase-state h2 { color: var(--mm-pearl); margin: 0; }
.showcase-state__icon { width: 40px; height: 40px; color: var(--mm-slate); }

.showcase-spinner {
  width: 32px;
  height: 32px;
  border: 0.5px solid var(--b2);
  border-top-color: var(--mm-gold);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.showcase-layout {
  display: flex;
  padding-top: 64px;
}

.showcase-sidebar {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 0;
  background: var(--mm-surface);
  border-right: 0.5px solid var(--b1);
  overflow-y: auto;
  z-index: 10;
}

.sc-nav-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: var(--mm-slate);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.sc-nav-btn:hover { background: var(--mm-gold-soft); color: var(--mm-gold); }
.sc-nav-btn.is-active { background: var(--mm-gold-soft); color: var(--mm-gold); }
.sc-nav-icon { width: 18px; height: 18px; }

.sc-nav-tooltip {
  position: absolute;
  left: calc(100% + 10px);
  background: var(--mm-surface-2);
  color: var(--mm-pearl);
  font-size: var(--t-xs);
  font-weight: 600;
  white-space: nowrap;
  padding: 5px 10px;
  border-radius: 6px;
  border: 0.5px solid var(--b2);
  pointer-events: none;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.15s, transform 0.15s;
  z-index: 100;
}
.sc-nav-btn:hover .sc-nav-tooltip { opacity: 1; transform: translateX(0); }
.sc-nav-btn.is-active .sc-nav-tooltip { opacity: 1; transform: translateX(0); }

.showcase-content { flex: 1; min-width: 0; overflow-x: hidden; }

.sc-container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

.sc-section {
  padding: 64px 0;
  border-bottom: 0.5px solid var(--b1);
}
.sc-section--hero {
  padding: 40px 0 56px;
  background: linear-gradient(180deg, rgba(212,168,67,0.04) 0%, transparent 100%);
}
.sc-section--final-cta { border-bottom: none; background: var(--mm-surface); }

.sc-section-head { margin-bottom: 28px; }
.sc-section-title {
  font-family: var(--f-ui);
  font-size: var(--t-xl);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.sc-section-sub { font-size: var(--t-sm); color: var(--mm-slate); margin: 0; }

.sc-section-cta { margin-top: 20px; display: flex; justify-content: flex-start; }

.sc-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--t-xs);
  margin-bottom: 28px;
  color: var(--mm-slate);
}
.sc-bc-link { color: var(--mm-slate); text-decoration: none; }
.sc-bc-link:hover { color: var(--mm-gold); }
.sc-bc-current { color: var(--mm-pearl); font-weight: 500; }

.sc-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}
@media (max-width: 860px) { .sc-hero { grid-template-columns: 1fr; } }

.sc-hero__media { border-radius: var(--bw-radius); overflow: hidden; border: 0.5px solid var(--b1); }
.sc-hero__screenshot { width: 100%; height: auto; display: block; }
.sc-hero__placeholder {
  aspect-ratio: 16/9;
  background: var(--mm-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sc-hero__logo-lg { width: 80px; height: 80px; object-fit: contain; }

.sc-hero__badges { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.sc-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--t-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sc-badge--gold { background: var(--mm-gold-soft); color: var(--mm-gold); }
.sc-badge--neutral { background: var(--b1); color: var(--mm-silver); }

.sc-hero__brand { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.sc-hero__logo {
  width: 48px;
  height: 48px;
  border-radius: var(--bw-radius);
  object-fit: contain;
  background: var(--mm-surface-2);
  flex-shrink: 0;
  border: 0.5px solid var(--b1);
}
.sc-hero__name {
  font-family: var(--f-ui);
  font-size: var(--t-2xl);
  font-weight: 800;
  color: var(--mm-pearl);
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}
.sc-hero__provider { font-size: var(--t-sm); color: var(--mm-slate); margin: 0; }

.sc-hero__desc {
  font-size: var(--t-base);
  color: var(--mm-silver);
  line-height: 1.65;
  margin: 0 0 20px;
}

.sc-stats {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 0;
  margin: 0 0 16px;
  background: var(--mm-surface-2);
  border: 0.5px solid var(--b1);
  border-radius: var(--bw-radius);
  overflow: hidden;
}
.sc-stat {
  flex: 1;
  padding: 12px 14px;
  border-right: 0.5px solid var(--b1);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sc-stat:last-child { border-right: none; }
.sc-stat__value {
  font-family: var(--f-mono);
  font-size: var(--t-base);
  font-weight: 700;
  color: var(--mm-pearl);
}
.sc-stat__value--gold { color: var(--mm-gold); }
.sc-stat__label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--mm-slate); font-weight: 600; }

.sc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.sc-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--t-xs);
  font-weight: 500;
  background: rgba(168, 181, 204, 0.06);
  border: 0.5px solid rgba(168, 181, 204, 0.12);
  color: var(--mm-silver);
}

.sc-hero__ctas { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

/* Compare / Save icon buttons */
.sc-btn--icon {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  background: rgba(168, 180, 204, 0.06);
  border: 1px solid rgba(168, 180, 204, 0.15);
  border-radius: 8px;
  color: var(--mm-silver, #A8B5CC);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.sc-btn--icon:hover { background: rgba(168,180,204,.12); color: var(--mm-pearl); border-color: rgba(168,180,204,.3); }
.sc-btn--icon.active { background: rgba(212, 168, 67, 0.12); border-color: rgba(212,168,67,.35); color: var(--mm-gold, #D4A843); }
.sc-btn--icon:disabled { opacity: .4; cursor: not-allowed; }

/* Claim listing banner */
.sc-claim-banner {
  background: rgba(212, 168, 67, 0.05);
  border-top: 1px solid rgba(212, 168, 67, 0.15);
  border-bottom: 1px solid rgba(212, 168, 67, 0.15);
  padding: 12px 0;
}
.sc-claim {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.sc-claim__icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(212, 168, 67, 0.12);
  display: flex; align-items: center; justify-content: center;
  color: var(--mm-gold, #D4A843);
  flex-shrink: 0;
}
.sc-claim__body {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
  color: var(--mm-silver, #A8B5CC);
}
.sc-claim__body strong { color: var(--mm-pearl, #E2E8F0); }
.sc-claim__cta {
  color: var(--mm-gold, #D4A843);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
.sc-claim__cta:hover { text-decoration: underline; }

/* You might also need */
.sc-section--also-need { background: var(--mm-s1, #141921); }
.sc-also-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 24px;
}
.sc-also-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--mm-s2, #1F2742);
  border: 1px solid rgba(168,180,204,.08);
  border-radius: 10px;
  text-decoration: none;
  color: var(--mm-pearl, #E2E8F0);
  transition: border-color .15s, background .15s;
}
.sc-also-card:hover { border-color: rgba(212,168,67,.3); background: rgba(212,168,67,.04); }
.sc-also-card__logo {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--mm-bg); overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem; color: var(--mm-gold);
  flex-shrink: 0;
}
.sc-also-card__logo img { width: 100%; height: 100%; object-fit: contain; }
.sc-also-card__body { flex: 1; min-width: 0; }
.sc-also-card__name { display: block; font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sc-also-card__why { display: block; font-size: 0.75rem; color: var(--mm-silver); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sc-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 0.5px solid var(--b1);
}
.sc-trust__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(42, 157, 143, 0.08);
  border: 0.5px solid rgba(42, 157, 143, 0.2);
  color: var(--mm-pearl);
  font-size: var(--t-xs);
  font-weight: 600;
}

.sc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: var(--t-sm);
  font-weight: 600;
  font-family: var(--f-ui);
  cursor: pointer;
  border: 0.5px solid transparent;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.sc-btn--primary { background: var(--mm-gold); color: var(--mm-bg); border-color: var(--mm-gold); }
.sc-btn--primary:hover { background: var(--mm-gold-l); border-color: var(--mm-gold-l); }
.sc-btn--ghost { background: transparent; color: var(--mm-silver); border-color: var(--b2); }
.sc-btn--ghost:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.sc-btn--subtle { background: var(--mm-surface-2); color: var(--mm-silver); border-color: var(--b1); }
.sc-btn--subtle:hover { border-color: var(--b3); color: var(--mm-pearl); }
.sc-btn--lg { height: 46px; padding: 0 24px; font-size: var(--t-base); border-radius: var(--bw-radius); }

.sc-pricing-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--mm-slate);
}

.sc-facts {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0 0 28px;
}
@media (max-width: 860px) { .sc-facts { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .sc-facts { grid-template-columns: 1fr; } }

.sc-fact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--mm-surface-2);
  border: 0.5px solid var(--b1);
  border-radius: var(--bw-radius);
  transition: border-color 0.15s;
}
.sc-fact:hover { border-color: var(--mm-gold); }
.sc-fact__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sc-fact__icon :deep(svg) { width: 17px; height: 17px; }
.sc-fact__label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--mm-slate); font-weight: 600; margin-bottom: 2px; }
.sc-fact__value { font-size: var(--t-sm); font-weight: 600; color: var(--mm-pearl); }

.sc-about-desc {
  font-size: var(--t-base);
  line-height: 1.7;
  color: var(--mm-silver);
  margin-bottom: 28px;
}

.sc-highlights { margin-bottom: 24px; }
.sc-hl-title { font-size: var(--t-base); font-weight: 700; color: var(--mm-pearl); margin: 0 0 14px; }
.sc-hl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 860px) { .sc-hl-grid { grid-template-columns: 1fr; } }

.sc-hl-card {
  padding: 16px;
  background: var(--hl-bg, rgba(212,168,67,0.08));
  border: 0.5px solid var(--b1);
  border-radius: var(--bw-radius);
}
.sc-hl-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--hl-bg, rgba(212,168,67,0.12));
  color: var(--hl-color, var(--mm-gold));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.sc-hl-icon :deep(svg) { width: 16px; height: 16px; }
.sc-hl-card-title { font-size: var(--t-sm); font-weight: 700; color: var(--mm-pearl); margin: 0 0 4px; }
.sc-hl-card-body { font-size: 12px; color: var(--mm-silver); margin: 0; line-height: 1.5; }

.sc-usecases { margin-bottom: 24px; }
.sc-uc-title { font-size: var(--t-sm); font-weight: 700; color: var(--mm-pearl); margin: 0 0 10px; }
.sc-uc-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.sc-uc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(42, 157, 143, 0.08);
  border: 0.5px solid rgba(42, 157, 143, 0.2);
  color: var(--mm-silver);
  font-size: 12px;
  font-weight: 600;
}

.sc-final-cta { text-align: center; padding: 48px 0; }
.sc-final-cta__title {
  font-family: var(--f-ui);
  font-size: var(--t-2xl);
  font-weight: 800;
  color: var(--mm-pearl);
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}
.sc-final-cta__sub { font-size: var(--t-base); color: var(--mm-silver); margin: 0 0 24px; }
.sc-final-cta__actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.sc-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 9, 15, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.sc-modal {
  background: var(--mm-surface);
  border: 0.5px solid var(--b2);
  border-radius: var(--bw-radius-lg);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}
.sc-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 0.5px solid var(--b1);
}
.sc-modal__brand { display: flex; align-items: center; gap: 12px; }
.sc-modal__logo { width: 36px; height: 36px; border-radius: 8px; object-fit: contain; background: var(--mm-surface-2); border: 0.5px solid var(--b1); }
.sc-modal__app-name { font-size: var(--t-base); font-weight: 700; color: var(--mm-pearl); }
.sc-modal__section { font-size: var(--t-xs); color: var(--mm-slate); text-transform: capitalize; }
.sc-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--mm-surface-2);
  border-radius: 8px;
  color: var(--mm-slate);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.sc-modal__close:hover { color: var(--mm-pearl); }

@media (max-width: 640px) {
  .showcase-sidebar { display: none; }
  .sc-container { padding: 0 16px; }
  .sc-section { padding: 40px 0; }
  .sc-hero__name { font-size: var(--t-xl); }
  .sc-stats { flex-wrap: wrap; }
  .sc-stat { min-width: 50%; border-bottom: 0.5px solid var(--b1); }
}

@media print {
  .showcase-sidebar,
  .sc-section-cta,
  .sc-modal-overlay,
  .sc-hero__ctas { display: none; }
}

/* ── Enquiry form ─────────────────────────────────────────────────────────── */
.sc-enq-form { display: flex; flex-direction: column; }
.sc-enq-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.sc-enq-desc { font-size: var(--t-sm); color: var(--mm-silver); margin: 0; line-height: 1.5; }
.sc-enq-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 0.5px solid var(--b1);
}
.sc-field { display: flex; flex-direction: column; gap: 5px; }
.sc-label { font-size: var(--t-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mm-slate); }
.sc-input,
.sc-textarea {
  background: var(--mm-surface-2);
  border: 0.5px solid var(--b2);
  border-radius: 8px;
  color: var(--mm-pearl);
  font-size: var(--t-sm);
  font-family: var(--f-ui);
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.sc-input:focus,
.sc-textarea:focus { border-color: var(--mm-gold); }
.sc-textarea { resize: vertical; min-height: 72px; }
.sc-enq-error { font-size: 12px; color: var(--color-error); margin: 0; }
.sc-enq-success { font-size: 12px; color: var(--color-success); margin: 0; }

/* ── Enrichment UI ─────────────────────────────────────────────────────────── */

/* Tech stack grid */
.enrich-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.enrich-cell { background: var(--mm-surface-2); border: 0.5px solid var(--b1); border-radius: 10px; padding: 14px 16px; }
.enrich-cell__label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--mm-silver); margin-bottom: 8px; }
.enrich-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.enrich-tag { background: var(--mm-bg); border: 0.5px solid var(--b2); border-radius: 6px; padding: 3px 9px; font-size: 12px; color: var(--mm-pearl); }

/* Jobs list */
.enrich-job-list { display: flex; flex-direction: column; gap: 8px; }
.enrich-job-row { display: flex; align-items: center; gap: 12px; background: var(--mm-surface-2); border: 0.5px solid var(--b1); border-radius: 8px; padding: 12px 16px; flex-wrap: wrap; }
.enrich-job-title { font-size: 14px; font-weight: 500; color: var(--mm-pearl); flex: 1 1 180px; }
.enrich-job-dept { font-size: 12px; color: var(--mm-silver); background: var(--mm-bg); padding: 2px 8px; border-radius: 999px; border: 0.5px solid var(--b1); }
.enrich-job-loc { font-size: 12px; color: var(--mm-silver); }
.enrich-job-link { font-size: 12px; color: var(--mm-gold); text-decoration: none; margin-left: auto; white-space: nowrap; }
.enrich-job-link:hover { text-decoration: underline; }
.enrich-trend-up { color: #4ade80; font-size: 13px; }
.enrich-trend-down { color: #f87171; font-size: 13px; }

/* Press stats */
.enrich-press-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.enrich-stat-pill { background: var(--mm-surface-2); border: 0.5px solid var(--b1); border-radius: 10px; padding: 12px 18px; text-align: center; min-width: 120px; }
.enrich-stat-num { display: block; font-size: 22px; font-weight: 700; color: var(--mm-pearl); }
.enrich-stat-label { font-size: 11px; color: var(--mm-silver); text-transform: uppercase; letter-spacing: 0.05em; }
.enrich-latest-headline { background: var(--mm-surface-2); border-left: 3px solid var(--mm-gold); border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 16px; }
.enrich-latest-headline p { margin: 4px 0 0; font-size: 14px; color: var(--mm-pearl); line-height: 1.5; }
.enrich-label-small { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--mm-silver); }
.enrich-awards { display: flex; flex-wrap: wrap; gap: 8px; }
.enrich-award-badge { background: rgba(212, 168, 67, 0.1); border: 0.5px solid rgba(212, 168, 67, 0.3); border-radius: 8px; padding: 6px 12px; font-size: 13px; color: var(--mm-gold); }

/* Social proof bar */
.enrich-social-bar { display: flex; justify-content: center; gap: 32px; padding: 20px; background: var(--mm-surface); border-top: 0.5px solid var(--b1); border-bottom: 0.5px solid var(--b1); margin: 8px 0; flex-wrap: wrap; }
.enrich-social-item { text-align: center; }
.enrich-social-num { display: block; font-size: 20px; font-weight: 700; color: var(--mm-pearl); }
.enrich-social-lbl { font-size: 11px; color: var(--mm-silver); text-transform: uppercase; letter-spacing: 0.05em; }
</style>
