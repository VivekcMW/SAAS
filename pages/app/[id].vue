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

definePageMeta({ layout: false })

const route = useRoute()
const appId = computed(() => route.params.id as string)

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
  return feats as { name: string; group?: string; included?: boolean; description?: string; tier?: string }[]
})

const normalizedScreenshots = computed(() => {
  const s = app.value?.screenshots || []
  if (s.length === 0) {
    return Array.from({ length: 3 }, (_, i) => ({
      type: 'image' as const,
      url: `https://placehold.co/1280x800/D4A843/0A0700?text=${encodeURIComponent(app.value?.name || 'App')}+Screen+${i + 1}`,
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

const companyInfo = computed(() => ({
  name: app.value?.provider || '—',
  founded: null, headquarters: null, employees: null,
  fundingTotal: null, latestRound: null, investors: [],
  website: '#', linkedin: null, twitter: null
}))

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

useHead(() => ({
  title: app.value ? `${app.value.name} — Product Overview | moonmart.ai` : 'App Overview | moonmart.ai',
  meta: [
    { name: 'description', content: app.value?.description || 'Discover SaaS tools on moonmart.ai.' },
    { property: 'og:title', content: app.value ? `${app.value.name} — moonmart.ai` : 'moonmart.ai' },
    { property: 'og:description', content: app.value?.description || '' },
    { property: 'og:image', content: `/api/og/app/${appId.value}` },
    { property: 'og:url', content: canonicalUrl.value }
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))

// ─── Utilities ────────────────────────────────────────────────────────────────
function getCategoryLabel(cat?: string): string {
  if (!cat) return 'SaaS'
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
                    <button class="sc-btn sc-btn--primary" @click="openEnquiry('overview')">Request a Demo</button>
                    <NuxtLink :to="`/marketplace/app/${app.slug || app.id}`" class="sc-btn sc-btn--ghost">Full Details</NuxtLink>
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
          <section v-if="alternatives.length" id="similar" class="sc-section">
            <div class="sc-container">
              <header class="sc-section-head">
                <h2 class="sc-section-title">Similar Alternatives</h2>
                <p class="sc-section-sub">Compare with other tools in this category</p>
              </header>
              <AppAlternativesCarousel :items="alternatives" />
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
  font-family: var(--f-ser);
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
  font-family: var(--f-ser);
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

.sc-hero__ctas { display: flex; gap: 10px; flex-wrap: wrap; }

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
  font-family: var(--f-ser);
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
</style>
