<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { computeMoonmartScore, getMoonmartScoreLabel } from '~/utils/moonmartScore'

const route = useRoute()
const router = useRouter()
const appId = computed(() => route.params.id as string)

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
  sponsored?: boolean
  screenshots?: { url: string; caption?: string }[]
  features?: string[] | { name: string; group?: string; included?: boolean; description?: string; tier?: string }[]
  integrations?: string[]
  security?: { certifications?: string[] }
  performance?: { uptime?: number }
  analytics?: { activeUsers?: number }
  languages?: string[]
  version?: string
  lastUpdated?: string
}

// Fetch data
const { data, pending, error } = await useFetch<AppData>(`/api/apps/${appId.value}`, {
  key: `app-${appId.value}`
})

const app = computed(() => data.value as AppData | null)

// --- Normalization helpers ---
const normalizedFeatures = computed(() => {
  const feats = app.value?.features
  if (!feats || feats.length === 0) {
    // Provide sensible defaults so matrix isn't empty
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
    const color = 'D4A843'
    return Array.from({ length: 3 }, (_, i) => ({
      type: 'image' as const,
      url: `https://placehold.co/1280x800/${color}/0A0700?text=${encodeURIComponent(app.value?.name || 'App')}+Screen+${i + 1}`,
      caption: `${app.value?.name} — screen ${i + 1}`
    }))
  }
  return s.map(ss => ({ type: 'image' as const, url: ss.url, caption: ss.caption }))
})

const normalizedIntegrations = computed(() => {
  const raw = app.value?.integrations || []
  if (raw.length === 0) {
    return ['Slack', 'Google Drive', 'Zapier', 'GitHub', 'Notion', 'Microsoft Teams'].map(n => ({
      name: n,
      type: 'native' as const
    }))
  }
  return raw.map(n => ({ name: n, type: 'native' as const }))
})

// --- Generated/derived data (Phase 1 stub; Phase 2 will wire AI) ---
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
  if (p.type === 'contact') return 'Custom'
  if (p.value) return `$${p.value}`
  return 'Paid'
})

const stats = computed(() => [
  { label: 'Rating', value: `${app.value?.rating.toFixed(1) || '—'} ★`, icon: 'heroicons:star', hint: `${app.value?.reviewCount || 0} reviews` },
  { label: 'Starting Price', value: priceLabel.value, icon: 'heroicons:currency-dollar', hint: app.value?.pricing?.period ? `per ${app.value.pricing.period}` : 'starts at' },
  { label: 'Active Users', value: app.value?.analytics?.activeUsers ? formatNumber(app.value.analytics.activeUsers) : '10K+', icon: 'heroicons:users' },
  { label: 'Uptime', value: `${app.value?.performance?.uptime || 99.9}%`, icon: 'heroicons:signal', hint: 'last 90 days' },
  { label: 'Deployment', value: 'Cloud / SaaS', icon: 'heroicons:cloud' },
  { label: 'Category', value: getCategoryLabel(app.value?.category), icon: 'heroicons:tag' }
])

const trustBadges = computed(() => {
  const certs = app.value?.security?.certifications || []
  return certs.map(c => ({
    label: c,
    icon: 'heroicons:shield-check',
    hint: `Compliant with ${c}`
  }))
})

const pricingPlans = computed(() => {
  const p = app.value?.pricing
  const base = p?.value || 29
  if (p?.type === 'free') {
    return [
      {
        name: 'Free',
        price: 0,
        description: 'Perfect for individuals getting started',
        features: ['Core features', 'Up to 3 projects', 'Community support'],
        popular: false
      },
      {
        name: 'Pro',
        price: base || 19,
        description: 'For growing teams',
        features: ['Everything in Free', 'Unlimited projects', 'Priority support', 'Advanced analytics', 'API access'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: null,
        custom: true,
        description: 'For large organizations',
        features: ['Everything in Pro', 'SSO / SAML', 'Dedicated CSM', 'Custom SLA', 'Audit logs'],
        popular: false
      }
    ]
  }
  return [
    {
      name: 'Starter',
      price: Math.round(base * 0.5),
      description: 'For individuals and small teams',
      features: ['Up to 5 users', 'Core features', 'Email support', 'Standard integrations'],
      popular: false
    },
    {
      name: 'Business',
      price: base,
      description: 'Most popular for growing teams',
      features: ['Up to 50 users', 'Advanced features', 'Priority support', 'API access', 'Custom reports'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: null,
      custom: true,
      description: 'For large-scale deployments',
      features: ['Unlimited users', 'SSO / SAML', 'Dedicated support', 'Custom SLA', 'Audit logs'],
      popular: false
    }
  ]
})

const sampleReviews = [
  {
    id: 'r1',
    author: 'Alex Chen',
    title: 'Product Manager · 51–200 employees',
    rating: 5,
    reviewTitle: 'Transformed how we work',
    content: 'Onboarded the whole team in under a week. The automation alone saved us 15 hours/week. Support is responsive.',
    date: 'Mar 12, 2026',
    verified: true,
    helpfulVotes: 24
  },
  {
    id: 'r2',
    author: 'Priya Sharma',
    title: 'Engineering Lead · 11–50 employees',
    rating: 4,
    reviewTitle: 'Great but steep learning curve',
    content: 'Powerful platform once you get it. First week was rough, but the docs got better. Worth the investment.',
    date: 'Feb 28, 2026',
    verified: true,
    helpfulVotes: 17
  },
  {
    id: 'r3',
    author: 'Marcus Reed',
    title: 'Founder · 1–10 employees',
    rating: 5,
    reviewTitle: 'Perfect for small teams',
    content: 'Free tier got us started; we upgraded within a month. Integrations with Slack and Notion are flawless.',
    date: 'Feb 10, 2026',
    verified: false,
    helpfulVotes: 9
  }
]

const ratingBreakdown = computed(() => {
  const total = app.value?.reviewCount || 100
  return {
    5: Math.round(total * 0.62),
    4: Math.round(total * 0.24),
    3: Math.round(total * 0.09),
    2: Math.round(total * 0.03),
    1: Math.round(total * 0.02),
    total
  }
})

// moonmart Score
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

// Track page view
if (import.meta.client) {
  onMounted(() => {
    $fetch(`/api/apps/${appId.value}/view`, { method: 'POST' }).catch(() => {})
  })
}

const sentimentTags = [
  { tag: 'Easy onboarding', percent: 92, positive: true },
  { tag: 'Great support', percent: 87, positive: true },
  { tag: 'Intuitive UI', percent: 81, positive: true },
  { tag: 'Pricey', percent: 34, positive: false },
  { tag: 'Learning curve', percent: 28, positive: false }
]

const faqs = computed(() => {
  const name = app.value?.name || 'This app'
  const integrationNames = normalizedIntegrations.value.slice(0, 5).map(i => i.name).join(', ')
  const certs = (app.value?.security?.certifications || ['SOC 2 Type II']).join(', ')
  const period = app.value?.pricing?.period
  const periodSuffix = period ? ` per ${period}` : ''
  const freeAnswer = `Yes, ${name} offers a free tier with core features. Paid plans are available for teams that need more.`
  const paidAnswer = `${name} offers a free trial. Paid plans start at ${priceLabel.value}${periodSuffix}.`
  return [
    {
      q: `Is ${name} free to use?`,
      a: app.value?.pricing?.type === 'free' ? freeAnswer : paidAnswer
    },
    {
      q: `What integrations does ${name} support?`,
      a: `${name} integrates with popular tools including ${integrationNames}, and many more via API and Zapier.`
    },
    {
      q: `Is ${name} secure?`,
      a: `Yes. ${name} is ${certs} compliant and encrypts data in transit and at rest.`
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes. You can cancel at any time from your account settings. No long-term contracts required.'
    },
    {
      q: `Does ${name} have a mobile app?`,
      a: `${name} is available on web, iOS, and Android with full feature parity.`
    },
    {
      q: 'What support options are available?',
      a: 'All plans include email support. Paid plans get priority support with guaranteed response times. Enterprise customers get a dedicated customer success manager.'
    }
  ]
})

const alternatives = ref([
  { id: 'alt-1', name: 'Notion', tagline: 'All-in-one workspace for notes, docs & wikis', rating: 4.6, startingPrice: '$8/mo', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg' },
  { id: 'alt-2', name: 'Asana', tagline: 'Work management for teams of all sizes', rating: 4.4, startingPrice: '$10.99/mo' },
  { id: 'alt-3', name: 'Monday.com', tagline: 'Visual project management platform', rating: 4.5, startingPrice: '$9/mo' },
  { id: 'alt-4', name: 'ClickUp', tagline: 'One app to replace them all', rating: 4.5, startingPrice: 'Free' },
  { id: 'alt-5', name: 'Linear', tagline: 'Modern issue tracking for software teams', rating: 4.8, startingPrice: '$8/mo' }
])

const companyInfo = computed(() => ({
  name: app.value?.provider || '—',
  founded: 2015,
  headquarters: 'San Francisco, CA',
  employees: '201–500',
  fundingTotal: '$120M',
  latestRound: 'Series C (2024)',
  investors: ['Sequoia', 'a16z', 'Accel'],
  website: '#',
  linkedin: '#',
  twitter: '#'
}))

// --- About section: derived highlights & use-cases ---
const aboutQuickFacts = computed(() => {
  const p = app.value?.pricing
  let startingPrice = 'Paid plans'
  if (p?.type === 'free') startingPrice = 'Free forever'
  else if (p?.type === 'contact') startingPrice = 'Custom pricing'
  else if (p?.value) {
    const suffix = p.period ? `/${p.period}` : ''
    startingPrice = `From $${p.value}${suffix}`
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
  const items = [
    {
      icon: 'heroicons:bolt',
      color: '#D4A843',
      bg: 'rgba(212,168,67,0.12)',
      title: 'Fast to deploy',
      body: `Go from signup to production in hours with ${featCount}+ ready-to-use capabilities and clear onboarding.`
    },
    {
      icon: 'heroicons:squares-plus',
      color: '#4A80D4',
      bg: 'rgba(74,128,212,0.12)',
      title: 'Fits your stack',
      body: `${integCount} native integrations plus REST APIs and webhooks so it plugs into what you already use.`
    },
    {
      icon: 'heroicons:shield-check',
      color: '#2A9D8F',
      bg: 'rgba(42,157,143,0.12)',
      title: 'Enterprise-grade',
      body: `${uptime}% uptime with SOC 2, encryption at rest, and role-based access — trusted by teams of every size.`
    }
  ]
  if (rating >= 4.5) {
    items[0] = {
      icon: 'heroicons:sparkles',
      color: '#D4A843',
      bg: 'rgba(212,168,67,0.12)',
      title: 'Top Rated',
      body: `Rated ${rating.toFixed(1)}★ across ${app.value?.reviewCount || 0}+ reviews — teams praise onboarding, support, and day-to-day usability.`
    }
  }
  return items
})

const aboutUseCases = computed(() => {
  const base = app.value?.tags?.length ? app.value.tags.slice(0, 4) : []
  if (base.length >= 3) return base
  return ['Small teams', 'Growing startups', 'Mid-market companies', 'Enterprise teams']
})

const aboutResources = computed(() => [
  { icon: 'heroicons:book-open', label: 'Documentation', href: '#' },
  { icon: 'heroicons:academic-cap', label: 'Getting started guide', href: '#' },
  { icon: 'heroicons:code-bracket', label: 'API reference', href: '#' },
  { icon: 'heroicons:chat-bubble-left-right', label: 'Community forum', href: '#' },
  { icon: 'heroicons:lifebuoy', label: 'Contact support', href: '#' }
])

// --- Handlers ---
const handleTrial = () => { /* Phase 2: route to vendor site or onboarding flow */ }
const handleDemo = () => { /* Phase 2: open video demo modal */ }
const handleSave = () => { /* Phase 2: add to user shortlist */ }
const handleCompare = () => { router.push(`/marketplace/compare?apps=${appId.value}`) }
const handleShareScroll = () => { /* handled by <AppDetailsShareMenu> */ }
const handlePrint = () => {
  if (globalThis.window === undefined) return
  globalThis.print()
}

// --- SEO ---
const pageUrl = computed(() => {
  const base = 'https://moonmart.ai'
  return `${base}/marketplace/app/${appId.value}`
})

const { generateAppPageSchema } = useSchemaMarkup()

useHead(() => ({
  title: app.value ? `${app.value.name} — Reviews, Pricing, Alternatives | moonmart.ai` : 'App Details | moonmart.ai',
  meta: [
    { name: 'description', content: app.value?.description || 'Discover SaaS tools on moonmart.ai.' },
    { property: 'og:title', content: app.value ? `${app.value.name} — moonmart.ai` : 'moonmart.ai' },
    { property: 'og:description', content: app.value?.description || '' },
    { property: 'og:image', content: `/api/og/app/${appId.value}` },
    { property: 'og:url', content: pageUrl.value },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: app.value?.name || '' },
    { name: 'twitter:description', content: app.value?.description || '' },
    { name: 'twitter:image', content: `/api/og/app/${appId.value}` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: pageUrl.value }
  ],
  script: app.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(generateAppPageSchema({
            name: app.value.name,
            slug: app.value.slug || appId.value,
            description: app.value.description,
            category: app.value.category || 'software',
            rating: app.value.rating,
            reviewCount: app.value.reviewCount,
            pricingType: app.value.pricing?.type,
            pricingValue: app.value.pricing?.value,
            logo: app.value.logo,
            screenshots: normalizedScreenshots.value.map(s => s.url),
            features: normalizedFeatures.value.map(f => f.name),
            updatedAt: app.value.lastUpdated,
            alternativeNames: alternatives.value.slice(0, 3).map(a => a.name)
          }))
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.value.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a }
            }))
          })
        }
      ]
    : []
}))

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'ai-insights', label: 'AI Insights', short: 'AI' },
  { id: 'screenshots', label: 'Screenshots', short: 'Shots' },
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'tools', label: 'ROI & Alerts', short: 'Tools' },
  { id: 'integrations', label: 'Integrations', short: 'Integr.' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'changelog', label: "What's New", short: 'Updates' },
  { id: 'alternatives', label: 'Alternatives', short: 'Alts' },
  { id: 'migration', label: 'Migration' },
  { id: 'faq', label: 'FAQ' }
]

// --- Utilities ---
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function getCategoryLabel(cat?: string): string {
  if (!cat) return 'SaaS'
  return cat.charAt(0).toUpperCase() + cat.slice(1).replaceAll('-', ' ')
}
</script>

<template>
  <div class="app-details">
    <!-- Loading -->
    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Loading application details…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error || !app" class="state-container">
      <Icon name="heroicons:exclamation-triangle" class="error-icon" />
      <h2>Application not found</h2>
      <p>We couldn't find the application you're looking for.</p>
      <Button variant="primary" to="/marketplace">Back to Marketplace</Button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <div class="container breadcrumb-row">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <NuxtLink to="/marketplace" class="bc-link">Marketplace</NuxtLink>
          <Icon name="heroicons:chevron-right" class="bc-sep" />
          <NuxtLink
            v-if="app.category"
            :to="`/marketplace?category=${app.category}`"
            class="bc-link"
          >
            {{ getCategoryLabel(app.category) }}
          </NuxtLink>
          <Icon v-if="app.category" name="heroicons:chevron-right" class="bc-sep" />
          <span class="bc-current">{{ app.name }}</span>
        </nav>
      </div>

      <!-- Hero -->
      <div class="container">
        <AppHero
          :app="app"
          :verdict="verdict"
          :moonmart-score="moonmartScore"
          @trial="handleTrial"
          @demo="handleDemo"
          @save="handleSave"
          @compare="handleCompare"
          @share="handleShareScroll"
        >
          <template #share>
            <AppShareMenu
              :url="pageUrl"
              :title="`${app.name} — ${app.description}`"
              :description="app.description"
              :hashtags="['SaaS', 'Moonmart', app.category || 'software']"
            />
          </template>
        </AppHero>
      </div>

      <!-- Sticky sub-nav -->
      <AppStickyNav :sections="sections" />

      <!-- Main content -->
      <main id="app-main" class="container app-main" tabindex="-1">
        <!-- Overview / Stats -->
        <section id="overview" class="section">
          <div class="overview-toolbar">
            <AppVoiceOverview :text="`${app.name}. ${app.longDescription || app.description || ''}`" :app-name="app.name" />
            <div class="toolbar-right">
              <button class="print-btn no-print" type="button" @click="handlePrint" title="Print or save as PDF">
                <Icon name="heroicons:printer" />
                Print / PDF
              </button>
              <AppStackBuilder :app-id="app.id" :app-name="app.name" :app-logo="app.logo" />
            </div>
          </div>
          <AppStatsStrip :stats="stats" />
          <div v-if="trustBadges.length" class="trust-row">
            <AppTrustBadges :badges="trustBadges" />
          </div>
        </section>

        <!-- AI Insights (Phase 2) -->
        <section id="ai-insights" class="section">
          <header class="section-head">
            <h2 class="section-title">AI-Powered Insights</h2>
            <p class="section-sub">Decide in minutes — not hours of research</p>
          </header>

          <AISummaryTabs :app-id="app.id" :app-name="app.name" />

          <div class="ai-grid">
            <AIFitCheck
              :app-name="app.name"
              :app-rating="app.rating"
              @cta-trial="handleTrial"
              @cta-compare="handleCompare"
            />
            <AIChatInline :app-id="app.id" :app-name="app.name" />
          </div>
        </section>

        <!-- Screenshots / Media -->
        <section id="screenshots" class="section">
          <header class="section-head">
            <h2 class="section-title">Screenshots & Demos</h2>
            <p class="section-sub">See {{ app.name }} in action</p>
          </header>
          <AppMediaGallery :items="normalizedScreenshots" :app-name="app.name" />
        </section>

        <!-- Description + sidebar -->
        <section id="about" class="section about-section">
          <header class="section-head">
            <h2 class="section-title">About {{ app.name }}</h2>
            <p class="section-sub">Everything you need to know at a glance</p>
          </header>

          <!-- Quick-facts strip -->
          <ul class="about-facts">
            <li v-for="f in aboutQuickFacts" :key="f.label" class="fact-card">
              <div class="fact-icon">
                <Icon :name="f.icon" />
              </div>
              <div class="fact-body">
                <div class="fact-label">{{ f.label }}</div>
                <div class="fact-value">{{ f.value }}</div>
              </div>
            </li>
          </ul>

          <div class="two-col">
            <div class="main-col">
              <!-- Description with drop cap -->
              <div class="about-description" v-html="app.longDescription || app.description"></div>

              <!-- Why teams choose highlights -->
              <div class="about-highlights">
                <h3 class="hl-title">Why teams choose {{ app.name }}</h3>
                <div class="hl-grid">
                  <article
                    v-for="h in aboutHighlights"
                    :key="h.title"
                    class="hl-card"
                    :style="{ '--hl-color': h.color, '--hl-bg': h.bg }"
                  >
                    <div class="hl-icon">
                      <Icon :name="h.icon" />
                    </div>
                    <h4 class="hl-card-title">{{ h.title }}</h4>
                    <p class="hl-card-body">{{ h.body }}</p>
                  </article>
                </div>
              </div>

              <!-- Best for use cases -->
              <div class="about-usecases">
                <h3 class="uc-title">
                  <Icon name="heroicons:user-group" />
                  Best for
                </h3>
                <ul class="uc-list">
                  <li v-for="uc in aboutUseCases" :key="uc" class="uc-chip">
                    <Icon name="heroicons:check-circle" />
                    <span>{{ uc }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <aside class="side-col">
              <AppCompanyCard :info="companyInfo" />

              <!-- Resources card -->
              <div class="resources-card">
                <div class="resources-head">
                  <Icon name="heroicons:squares-2x2" />
                  <span>Resources</span>
                </div>
                <ul class="resources-list">
                  <li v-for="r in aboutResources" :key="r.label">
                    <a :href="r.href" class="resources-link">
                      <Icon :name="r.icon" class="r-icon" />
                      <span>{{ r.label }}</span>
                      <Icon name="heroicons:arrow-up-right" class="r-arrow" />
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <!-- Features -->
        <section id="features" class="section">
          <header class="section-head">
            <h2 class="section-title">Features</h2>
            <p class="section-sub">What you get with {{ app.name }}</p>
          </header>
          <AppFeatureMatrix :features="normalizedFeatures" :show-groups="true" />
        </section>

        <!-- Pricing -->
        <section id="pricing" class="section">
          <header class="section-head">
            <h2 class="section-title">Pricing</h2>
            <p class="section-sub">Simple plans that grow with you</p>
          </header>
          <AppPricingCards :plans="pricingPlans" @select="handleTrial" />
        </section>

        <!-- Power Tools (Phase 4): ROI + Price Alert -->
        <section id="tools" class="section">
          <header class="section-head">
            <h2 class="section-title">ROI & Price Alerts</h2>
            <p class="section-sub">Quantify the value and stay ahead of pricing changes</p>
          </header>
          <div class="tools-grid">
            <AppROICalculator
              :app-name="app.name"
              :price-per-seat="app.pricing?.value || 29"
              :price-period="app.pricing?.period || 'month'"
            />
            <AppPriceAlert :app-id="app.id" :app-name="app.name" />
          </div>
        </section>

        <!-- Integrations -->
        <section id="integrations" class="section">
          <header class="section-head">
            <h2 class="section-title">Integrations</h2>
            <p class="section-sub">{{ normalizedIntegrations.length }} integrations available</p>
          </header>
          <AppIntegrationsGrid :integrations="normalizedIntegrations" />
        </section>

        <!-- Reviews -->
        <section id="reviews" class="section">
          <header class="section-head">
            <h2 class="section-title">Reviews & Ratings</h2>
            <p class="section-sub">What real users say about {{ app.name }}</p>
          </header>
          <AppReviewBreakdown
            :overall-rating="app.rating"
            :review-count="app.reviewCount"
            :breakdown="ratingBreakdown"
            :reviews="sampleReviews"
            :sentiment-tags="sentimentTags"
            :view-all-href="`/marketplace/app/${app.id}/reviews`"
          />
        </section>

        <!-- Changelog (Phase 4) -->
        <section id="changelog" class="section">
          <AppChangelogTimeline :app-name="app.name" />
        </section>

        <!-- Alternatives -->
        <section id="alternatives" class="section">
          <header class="section-head">
            <h2 class="section-title">Similar Alternatives</h2>
            <p class="section-sub">Compare with other tools in this category</p>
          </header>
          <AppAlternativesCarousel :items="alternatives" />

          <!-- High-intent sponsored placement: buyer is comparing -->
          <div class="sponsored-after-alts no-print">
            <SponsoredSlot
              placement="alternatives"
              variant="native-card"
              :category="app.category"
              :exclude="[app.id, app.slug]"
              label="Sponsored alternative"
            />
          </div>
        </section>

        <!-- Migration guides (Phase 5) -->
        <section id="migration" class="section">
          <AppMigrationGuides :app-name="app.name" />
        </section>

        <!-- FAQ -->
        <section id="faq" class="section">
          <header class="section-head">
            <h2 class="section-title">Frequently Asked Questions</h2>
          </header>
          <AppFAQ :items="faqs" />
        </section>

        <!-- Final CTA -->
        <section class="section final-cta">
          <div class="final-cta-inner">
            <h2 class="cta-title">Ready to try {{ app.name }}?</h2>
            <p class="cta-sub">
              {{ app.pricing.type === 'free' ? 'Get started for free — no credit card required.' : 'Start your free trial today. Cancel anytime.' }}
            </p>
            <div class="cta-actions">
              <Button variant="primary" size="lg" @click="handleTrial">
                {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
              </Button>
              <Button variant="ghost" size="lg" @click="handleCompare">
                Compare with Alternatives
              </Button>
            </div>
          </div>
        </section>
      </main>
    </template>
  </div>
</template>

<style scoped>
.app-details {
  min-height: 100vh;
  background: var(--mm-bg);
  padding-bottom: 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading / Error */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  padding: 40px 20px;
  text-align: center;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 0.5px solid var(--b2);
  border-top-color: var(--mm-gold);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}
.error-icon { width: 40px; height: 40px; color: var(--mm-slate); }
@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.breadcrumb-row { padding: 16px 20px 12px; }
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.bc-link { color: var(--mm-slate); text-decoration: none; }
.bc-link:hover { color: var(--mm-gold); }
.bc-sep { width: 12px; height: 12px; color: var(--b3); }
.bc-current { color: var(--mm-pearl); font-weight: 500; }

/* Main */
.app-main { padding-top: 20px; }

.section { margin-top: 56px; }
.section:first-child { margin-top: 28px; }

.section-head { margin-bottom: 20px; }
.section-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--mm-pearl);
  letter-spacing: -0.01em;
}
.section-sub {
  margin: 0;
  font-size: 14px;
  color: var(--mm-slate);
}

.trust-row { margin-top: 16px; }

/* AI Insights two-column grid (Phase 2) */
.ai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}
@media (max-width: 900px) {
  .ai-grid { grid-template-columns: 1fr; }
}

/* Power Tools grid (Phase 4) */
.tools-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 900px) {
  .tools-grid { grid-template-columns: 1fr; }
}

/* Overview toolbar (voice + stack builder) */
.overview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-s2);
  color: var(--mm-silver);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.print-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.print-btn :deep(svg) { width: 14px; height: 14px; }

.sponsored-after-alts { margin-top: 16px; }

/* Two-column layout for About */
.two-col {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}
.main-col { min-width: 0; }
.side-col {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .side-col { position: static; top: auto; }
}

/* --- About section rework --- */
.about-section { position: relative; }

.about-facts {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0 0 24px;
}
@media (max-width: 900px) { .about-facts { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .about-facts { grid-template-columns: 1fr; } }

.fact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.fact-card:hover {
  border-color: var(--mm-gold);
  box-shadow: 0 4px 12px var(--mm-gold-soft);
}
.fact-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fact-icon :deep(svg) { width: 18px; height: 18px; }
.fact-body { min-width: 0; }
.fact-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mm-slate);
  margin-bottom: 2px;
}
.fact-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--mm-pearl);
  line-height: 1.3;
}

.about-description {
  font-size: 16px;
  color: var(--mm-silver);
  line-height: 1.7;
  white-space: pre-wrap;
}
.about-description :deep(p) { margin: 0 0 14px; }
.about-description :deep(p:last-child) { margin-bottom: 0; }
.about-description::first-letter {
  font-size: 44px;
  font-weight: 700;
  float: left;
  line-height: 1;
  padding: 4px 10px 0 0;
  color: var(--mm-gold);
  font-family: inherit;
}

.about-highlights { margin-top: 28px; }
.hl-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--mm-pearl);
  letter-spacing: -0.01em;
}
.hl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 700px) { .hl-grid { grid-template-columns: 1fr; } }

.hl-card {
  position: relative;
  padding: 18px 16px 16px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.hl-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--hl-color);
}
.hl-card:hover {
  border-color: var(--hl-color);
  box-shadow: var(--shadow-md);
}
.hl-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--hl-bg);
  color: var(--hl-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.hl-icon :deep(svg) { width: 18px; height: 18px; }
.hl-card-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--mm-pearl);
}
.hl-card-body {
  margin: 0;
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.55;
}

.about-usecases {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 0.5px solid var(--b1);
}
.uc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--mm-pearl);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.uc-title :deep(svg) { width: 16px; height: 16px; color: var(--mm-gold); }
.uc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.uc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 10px;
  background: var(--mm-gold-soft);
  border: 0.5px solid var(--mm-gold);
  border-radius: var(--r-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--mm-gold);
}
.uc-chip :deep(svg) { width: 14px; height: 14px; color: var(--mm-gold); }

/* Sidebar resources card */
.resources-card {
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  padding: 16px;
}
.resources-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--mm-pearl);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 0.5px solid var(--b1);
}
.resources-head :deep(svg) { width: 16px; height: 16px; color: var(--mm-gold); }
.resources-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.resources-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  font-size: 13.5px;
  color: var(--mm-silver);
  text-decoration: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.resources-link:hover {
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
}
.resources-link .r-icon {
  width: 16px;
  height: 16px;
  color: var(--mm-slate);
  flex-shrink: 0;
}
.resources-link:hover .r-icon { color: var(--mm-gold); }
.resources-link span { flex: 1; min-width: 0; }
.resources-link .r-arrow {
  width: 14px;
  height: 14px;
  color: var(--b3);
  opacity: 0;
  transition: opacity var(--transition-fast), color var(--transition-fast);
}
.resources-link:hover .r-arrow { opacity: 1; color: var(--mm-gold); }

/* Final CTA */
.final-cta {
  background: var(--mm-s2);
  border: 0.5px solid var(--mm-gold);
  border-radius: var(--r-xl);
  padding: 48px 32px;
  margin-top: 56px;
  position: relative;
  overflow: hidden;
}
.final-cta::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: var(--mm-gold-soft);
  border-radius: 50%;
  pointer-events: none;
}
.final-cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  position: relative;
}
.cta-title { margin: 0; font-size: 28px; font-weight: 700; color: var(--mm-pearl); letter-spacing: -0.01em; }
.cta-sub { margin: 0 0 8px; font-size: 15px; color: var(--mm-silver); max-width: 540px; line-height: 1.6; }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .side-col { position: static; }
}

/* --- Print stylesheet (Phase 5: PDF export) --- */
@media print {
  /* Strip all interactive chrome */
  :deep(.app-header),
  :deep(.footer),
  :deep(header.app-header),
  :deep(.sticky-nav),
  .overview-toolbar,
  .no-print,
  .final-cta,
  .ai-grid,
  .sponsored-after-alts,
  :deep(.devtools),
  :deep(button) {
    display: none !important;
  }

  body, .app-details, .app-main {
    background: #ffffff !important;
    color: #000000 !important;
  }

  .section {
    page-break-inside: avoid;
    margin-bottom: 24pt;
    border: 0 !important;
    box-shadow: none !important;
  }

  .section-title { font-size: 16pt; }
  .section-sub { font-size: 10pt; color: #555555 !important; }

  /* Show full URLs for links so the printed PDF is useful offline */
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 8pt;
    color: #666666;
  }
  a[href^="#"]::after,
  a[href^="javascript:"]::after { content: ""; }
}
</style>
