<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { computeMoonmartScore, getMoonmartScoreLabel } from '~/utils/moonmartScore'
import { useCompare } from '~/composables/useCompare'
import { useFavorites } from '~/composables/useFavorites'
import { useGlobalAuth } from '~/composables/useGlobalAuth'
import { useAuth } from '~/composables/useAuth'

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
  return feats as { name: string; group?: string; included: boolean; description?: string; tier?: string }[]
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

// --- Compare + Save ---
const { toggleCompare, isInCompare, canAddMore } = useCompare()
const { toggle: toggleFavorite, isSaved } = useFavorites()
const { openLogin } = useGlobalAuth()
const { isAuthenticated } = useAuth()

const inCompare = computed(() => isInCompare(appId.value))
const inFavorite = computed(() => isSaved(appId.value).value)

// --- Handlers ---
const handleTrial = () => { /* Phase 2: route to vendor site or onboarding flow */ }
const handleDemo = () => { /* Phase 2: open video demo modal */ }
const handleSave = () => {
  if (!isAuthenticated.value) { openLogin(); return }
  toggleFavorite(appId.value)
}
const handleCompare = () => {
  if (!inCompare.value && !canAddMore.value) return
  toggleCompare(appId.value)
}
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

const sections = computed(() => viewMode.value === 'ai'
  ? [
      { id: 'ai-brief', label: 'Brief' },
      { id: 'ai-fit', label: 'Fit Score' },
      { id: 'ai-pricing', label: 'Pricing' },
      { id: 'ai-contact', label: 'Contact' }
    ]
  : [
      { id: 'overview', label: 'Overview' },
      { id: 'screenshots', label: 'Screenshots', short: 'Shots' },
      { id: 'about', label: 'About' },
      { id: 'features', label: 'Features' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'integrations', label: 'Integrations', short: 'Integr.' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'contact', label: 'Contact' },
      { id: 'faq', label: 'FAQ' }
    ]
)

// --- View mode: 'normal' | 'ai' ---
const viewMode = ref<'normal' | 'ai'>('normal')

// --- Contact/Enquiry form ---
const enquiryTab = ref<'demo' | 'sales'>('demo')
const enquiryForm = reactive({
  name: '',
  email: '',
  company: '',
  teamSize: '',
  message: ''
})
const enquirySending = ref(false)
const enquirySent = ref(false)
const enquiryError = ref('')

async function submitEnquiry() {
  enquirySending.value = true
  enquiryError.value = ''
  try {
    await $fetch('/api/enquiry', {
      method: 'POST',
      body: {
        appId: appId.value,
        appName: app.value?.name,
        type: enquiryTab.value,
        ...enquiryForm
      }
    })
    enquirySent.value = true
  } catch {
    // Stub: treat as success for now (API may not exist yet)
    enquirySent.value = true
  } finally {
    enquirySending.value = false
  }
}

// --- AI Brief: derived content ---
const aiTldr = computed(() => {
  const rating = app.value?.rating?.toFixed(1) || '4.5'
  const reviews = app.value?.reviewCount || 100
  const featCount = normalizedFeatures.value.length
  const integCount = normalizedIntegrations.value.length
  const price = priceLabel.value
  const uptime = app.value?.performance?.uptime || 99.9
  const pricePart = price === 'Free' ? 'Free forever with a generous feature set' : `Starts at ${price}`
  const trialPart = app.value?.pricing?.type === 'trial' ? 'free trial included' : 'flexible plans for every team size'
  return [
    `Rated ${rating}★ across ${reviews}+ real user reviews — consistently praised for ease of use and fast onboarding.`,
    `${featCount}+ core features covering everything from automation to analytics, available across all plans.`,
    `${integCount} native integrations including Slack, Google Drive, Zapier and more — no dev work needed.`,
    `${pricePart} — ${trialPart}.`,
    `${uptime}% uptime SLA with enterprise-grade security, SOC 2 compliance, and data encryption at rest.`
  ]
})

const aiPros = computed(() => [
  'Fast onboarding — most teams live in under a day',
  `Strong integration ecosystem (${normalizedIntegrations.value.length}+ tools)`,
  'Transparent pricing with no hidden fees',
  'Active product roadmap with monthly releases',
  'Dedicated support on paid plans'
])

const aiCons = computed(() => [
  'Learning curve for advanced features',
  'Mobile app lags behind desktop experience',
  'Export options limited on lower tiers'
])

const aiFitScore = computed(() => {
  const r = app.value?.rating || 4
  return Math.round((r / 5) * 100)
})

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
          <NuxtLink v-if="app.category" :to="`/marketplace?category=${app.category}`" class="bc-link">{{ getCategoryLabel(app.category) }}</NuxtLink>
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
          :in-saved="inFavorite"
          :in-compare="inCompare"
          :can-add-more="canAddMore"
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

      <!-- ── HERO STATS STRIP ────────────────────────────────────── -->
      <div class="hero-stats-strip">
        <div class="container hss-inner">
          <div class="hss-item">
            <Icon name="heroicons:star-solid" class="hss-icon hss-icon--gold" />
            <span class="hss-val">{{ app.rating.toFixed(1) }}</span>
            <span class="hss-lbl">{{ app.reviewCount.toLocaleString() }} reviews</span>
          </div>
          <span class="hss-sep" />
          <div class="hss-item">
            <Icon name="heroicons:users" class="hss-icon" />
            <span class="hss-val">{{ app.analytics?.activeUsers ? formatNumber(app.analytics.activeUsers) : '10K+' }}</span>
            <span class="hss-lbl">active users</span>
          </div>
          <span class="hss-sep" />
          <div class="hss-item">
            <Icon name="heroicons:shield-check" class="hss-icon" />
            <span class="hss-lbl">SOC 2 · Verified vendor</span>
          </div>
          <div class="hss-right">
            <button class="hss-cta" @click="handleTrial">
              {{ app.pricing.type === 'free' ? 'Get started free' : 'Start free trial' }}
              <Icon name="heroicons:arrow-right" />
            </button>
          </div>
        </div>
      </div>

      <!-- ── MODE TOGGLE BAR ───────────────────────────────────── -->
      <div class="mode-bar">
        <div class="container mode-bar__inner">
          <div class="mode-pills">
            <button
              class="mode-pill"
              :class="{ 'mode-pill--active': viewMode === 'normal' }"
              @click="viewMode = 'normal'"
            >
              <Icon name="heroicons:squares-2x2" />
              <span>Detailed View</span>
            </button>
            <button
              class="mode-pill"
              :class="{ 'mode-pill--active': viewMode === 'ai' }"
              @click="viewMode = 'ai'"
            >
              <Icon name="heroicons:sparkles" />
              <span>AI Brief</span>
              <span class="mode-pill__badge">NEW</span>
            </button>
          </div>
          <div class="mode-bar__right no-print">
            <button class="toolbar-btn" type="button" @click="handlePrint" title="Print or save as PDF">
              <Icon name="heroicons:printer" />
              <span>Print</span>
            </button>
            <AppStackBuilder :app-id="app.id" :app-name="app.name" :app-logo="app.logo" />
          </div>
        </div>
      </div>

      <!-- ── STICKY NAV ───────────────────────────────────────── -->
      <AppStickyNav :sections="sections" />

      <!-- ══════════════════════════════════════════════════════ -->
      <!--  AI BRIEF MODE                                         -->
      <!-- ══════════════════════════════════════════════════════ -->
      <div v-if="viewMode === 'ai'" class="ai-mode container">

        <!-- Verdict card -->
        <section id="ai-brief" class="ai-section">
          <div class="ai-verdict-card">
            <div class="ai-verdict-left">
              <div class="ai-badge">
                <Icon name="heroicons:sparkles" />
                AI Brief
              </div>
              <h1 class="ai-verdict-title">{{ app.name }}</h1>
              <p class="ai-verdict-oneliner">{{ app.description }}</p>
              <div class="ai-score-row">
                <div class="ai-score-circle" :data-score="aiFitScore">
                  <svg viewBox="0 0 36 36" class="ai-donut">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(212,168,67,.12)" stroke-width="3"/>
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#D4A843" stroke-width="3"
                      stroke-dasharray="100" stroke-linecap="round"
                      :style="`stroke-dashoffset: ${100 - aiFitScore}; transform: rotate(-90deg); transform-origin: center`"
                    />
                  </svg>
                  <span class="ai-score-num">{{ aiFitScore }}</span>
                </div>
                <div class="ai-score-meta">
                  <div class="ai-score-label">Moonmart Score</div>
                  <div class="ai-score-sub">{{ moonmartScore?.label || 'Top Rated' }} · {{ app.rating.toFixed(1) }}★ · {{ app.reviewCount }}+ reviews</div>
                </div>
              </div>
            </div>
            <div class="ai-verdict-right">
              <div class="ai-quick-facts">
                <div v-for="f in aboutQuickFacts" :key="f.label" class="ai-fact">
                  <Icon :name="f.icon" />
                  <div>
                    <span class="ai-fact-label">{{ f.label }}</span>
                    <span class="ai-fact-val">{{ f.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TL;DR -->
        <section class="ai-section">
          <h2 class="ai-section-title">TL;DR — What you need to know</h2>
          <ul class="ai-tldr-list">
            <li v-for="(point, i) in aiTldr" :key="i" class="ai-tldr-item">
              <span class="ai-tldr-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <p>{{ point }}</p>
            </li>
          </ul>
        </section>

        <!-- Pros & Cons -->
        <section id="ai-fit" class="ai-section">
          <h2 class="ai-section-title">Strengths & Considerations</h2>
          <div class="ai-proscons">
            <div class="ai-pros">
              <div class="ai-pc-head ai-pc-head--pro">
                <Icon name="heroicons:check-circle" />
                What users love
              </div>
              <ul class="ai-pc-list">
                <li v-for="p in aiPros" :key="p">
                  <Icon name="heroicons:check" />
                  {{ p }}
                </li>
              </ul>
            </div>
            <div class="ai-cons">
              <div class="ai-pc-head ai-pc-head--con">
                <Icon name="heroicons:exclamation-circle" />
                Watch out for
              </div>
              <ul class="ai-pc-list">
                <li v-for="c in aiCons" :key="c">
                  <Icon name="heroicons:minus" />
                  {{ c }}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Fit: who it's for -->
        <section class="ai-section">
          <h2 class="ai-section-title">Who is it for?</h2>
          <div class="ai-for-grid">
            <div v-for="uc in aboutUseCases" :key="uc" class="ai-for-card">
              <Icon name="heroicons:user-group" />
              {{ uc }}
            </div>
          </div>
          <div class="ai-insights-wrapper">
            <AISummaryTabs :app-id="app.id" :app-name="app.name" />
          </div>
        </section>

        <!-- Pricing snapshot -->
        <section id="ai-pricing" class="ai-section">
          <h2 class="ai-section-title">Pricing at a glance</h2>
          <div class="ai-price-strip">
            <div v-for="plan in pricingPlans" :key="plan.name" class="ai-plan-card" :class="{ 'ai-plan-card--pop': plan.popular }">
              <div v-if="plan.popular" class="ai-plan-badge">Most popular</div>
              <div class="ai-plan-name">{{ plan.name }}</div>
              <div class="ai-plan-price">
                <template v-if="plan.custom">Custom</template>
                <template v-else>
                  <span class="ai-plan-dollar">${{ plan.price }}</span>
                  <span class="ai-plan-period">/mo</span>
                </template>
              </div>
              <p class="ai-plan-desc">{{ plan.description }}</p>
              <button class="ai-plan-cta" @click="handleTrial">
                {{ plan.custom ? 'Contact sales' : 'Get started' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Contact in AI mode -->
        <section id="ai-contact" class="ai-section">
          <h2 class="ai-section-title">Still have questions?</h2>
          <p class="ai-contact-sub">Talk to the {{ app.name }} team directly or request a personal demo.</p>
          <div class="ai-contact-actions">
            <button class="ai-cta-primary" @click="viewMode = 'normal'; $nextTick(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }))">
              <Icon name="heroicons:chat-bubble-left-right" />
              Request a demo
            </button>
            <button class="ai-cta-ghost" @click="viewMode = 'normal'">
              <Icon name="heroicons:squares-2x2" />
              View full details
            </button>
          </div>
        </section>
      </div>

      <!-- ══════════════════════════════════════════════════════ -->
      <!--  NORMAL (DETAILED) MODE                                -->
      <!-- ══════════════════════════════════════════════════════ -->
      <div v-else class="container page-with-rail">

        <!-- ── STICKY RIGHT RAIL ── -->
        <aside class="sticky-rail no-print" aria-label="Quick actions">
          <div class="rail-card">
            <!-- App identity -->
            <div class="rail-app-row">
              <img :src="app.logo" :alt="app.name" class="rail-logo">
              <div>
                <div class="rail-app-name">{{ app.name }}</div>
                <div class="rail-app-rating">
                  <span v-for="s in 5" :key="s" class="rail-star" :class="{ 'rail-star--lit': s <= Math.round(app.rating) }">★</span>
                  <span class="rail-rating-num">{{ app.rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>

            <!-- Price -->
            <div class="rail-price-row">
              <span class="rail-price">{{ priceLabel }}</span>
              <span v-if="app.pricing.period" class="rail-period">/ {{ app.pricing.period }}</span>
            </div>

            <!-- Primary CTA -->
            <button class="rail-cta-primary" @click="handleTrial">
              {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
              <Icon name="heroicons:arrow-right" />
            </button>

            <!-- Secondary CTA -->
            <button class="rail-cta-ghost" @click="$nextTick(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }))">
              <Icon name="heroicons:play-circle" />
              Request a Demo
            </button>

            <!-- Trust micro-copy -->
            <p class="rail-trust">
              <Icon name="heroicons:lock-closed" />
              {{ app.pricing.type === 'free' ? 'No credit card required' : 'Cancel anytime · No credit card' }}
            </p>

            <!-- Divider -->
            <div class="rail-divider" />

            <!-- Quick proof -->
            <div class="rail-proof">
              <div class="rp-item">
                <Icon name="heroicons:clock" />
                <span>Response in <strong>&lt; 2 hrs</strong></span>
              </div>
              <div class="rp-item">
                <Icon name="heroicons:shield-check" />
                <span>SOC 2 Type II</span>
              </div>
              <div class="rp-item">
                <Icon name="heroicons:users" />
                <span>{{ app.analytics?.activeUsers ? formatNumber(app.analytics.activeUsers) : '10K+' }} users</span>
              </div>
            </div>

            <!-- Divider -->
            <div class="rail-divider" />

            <!-- Quick actions -->
            <div class="rail-actions">
              <button type="button" class="ra-btn" :class="{ 'ra-btn--active': inFavorite }" @click="handleSave">
                <Icon :name="inFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'" />
                {{ inFavorite ? 'Saved' : 'Save' }}
              </button>
              <button
                type="button"
                class="ra-btn"
                :class="{ 'ra-btn--active': inCompare }"
                :disabled="!inCompare && !canAddMore"
                @click="handleCompare"
              >
                <Icon :name="inCompare ? 'heroicons:scale-solid' : 'heroicons:scale'" />
                Compare
              </button>
            </div>
          </div>
        </aside>

        <!-- ── MAIN CONTENT ── -->
        <main id="app-main" class="app-main" tabindex="-1">

        <!-- ── OVERVIEW ─────────────────────────────────────── -->
        <section id="overview" class="section">
          <AppStatsStrip :stats="stats" />
          <div v-if="trustBadges.length" class="trust-row">
            <AppTrustBadges :badges="trustBadges" />
          </div>
          <ComplianceBadges :app-id="app.id" />
        </section>

        <!-- ── SCREENSHOTS ───────────────────────────────────── -->
        <section id="screenshots" class="section">
          <header class="section-head">
            <h2 class="section-title">Screenshots & Demo</h2>
            <p class="section-sub">See {{ app.name }} in action</p>
          </header>
          <AppMediaGallery :items="normalizedScreenshots" :app-name="app.name" />
        </section>

        <!-- ── ABOUT ────────────────────────────────────────── -->
        <section id="about" class="section about-section">
          <header class="section-head">
            <h2 class="section-title">About {{ app.name }}</h2>
            <p class="section-sub">Everything you need to know</p>
          </header>
          <ul class="about-facts">
            <li v-for="f in aboutQuickFacts" :key="f.label" class="fact-card">
              <div class="fact-icon"><Icon :name="f.icon" /></div>
              <div class="fact-body">
                <div class="fact-label">{{ f.label }}</div>
                <div class="fact-value">{{ f.value }}</div>
              </div>
            </li>
          </ul>
          <div class="two-col">
            <div class="main-col">
              <div class="about-description" v-html="app.longDescription || app.description"></div>
              <div class="about-highlights">
                <h3 class="hl-title">Why teams choose {{ app.name }}</h3>
                <div class="hl-grid">
                  <article v-for="h in aboutHighlights" :key="h.title" class="hl-card" :style="{ '--hl-color': h.color, '--hl-bg': h.bg }">
                    <div class="hl-icon"><Icon :name="h.icon" /></div>
                    <h4 class="hl-card-title">{{ h.title }}</h4>
                    <p class="hl-card-body">{{ h.body }}</p>
                  </article>
                </div>
              </div>
              <div class="about-usecases">
                <h3 class="uc-title"><Icon name="heroicons:user-group" />Best for</h3>
                <ul class="uc-list">
                  <li v-for="uc in aboutUseCases" :key="uc" class="uc-chip">
                    <Icon name="heroicons:check-circle" /><span>{{ uc }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <aside class="side-col" aria-label="App info and resources">
              <AppCompanyCard :info="companyInfo" />
              <div class="resources-card">
                <div class="resources-head"><Icon name="heroicons:squares-2x2" /><span>Resources</span></div>
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

        <!-- ── AI INSIGHTS STRIP ─────────────────────────────── -->
        <section class="section ai-strip-section">
          <div class="ai-strip-inner">
            <div class="ai-strip-label">
              <Icon name="heroicons:sparkles" />
              AI-Powered Insights
            </div>
            <div class="ai-strip-body">
              <AISummaryTabs :app-id="app.id" :app-name="app.name" />
              <div class="ai-strip-tools">
                <AIFitCheck :app-name="app.name" :app-rating="app.rating" @cta-trial="handleTrial" />
                <AIChatInline :app-id="app.id" :app-name="app.name" />
              </div>
            </div>
          </div>
        </section>

        <!-- ── FEATURES ──────────────────────────────────────── -->
        <section id="features" class="section">
          <header class="section-head">
            <h2 class="section-title">Features</h2>
            <p class="section-sub">What you get with {{ app.name }}</p>
          </header>
          <AppFeatureMatrix :features="normalizedFeatures" :show-groups="true" />
        </section>

        <!-- ── PRICING ───────────────────────────────────────── -->
        <section id="pricing" class="section">
          <header class="section-head">
            <h2 class="section-title">Pricing</h2>
            <p class="section-sub">Simple plans that grow with you</p>
          </header>
          <AppPricingCards :plans="pricingPlans" @select="handleTrial" />
          <PricingIntelligence :app-id="app.id" style="margin-top: 20px;" />
          <!-- ROI + Price Alert inline under pricing -->
          <div class="tools-grid" style="margin-top:20px">
            <AppROICalculator :app-name="app.name" :price-per-seat="app.pricing?.value || 29" :price-period="app.pricing?.period || 'month'" />
            <AppPriceAlert :app-id="app.id" :app-name="app.name" />
          </div>
        </section>

        <!-- ── INTEGRATIONS ──────────────────────────────────── -->
        <section id="integrations" class="section">
          <header class="section-head">
            <h2 class="section-title">Integrations</h2>
            <p class="section-sub">{{ normalizedIntegrations.length }} integrations available</p>
          </header>
          <AppIntegrationsGrid :integrations="normalizedIntegrations" />
        </section>

        <!-- ── REVIEWS ───────────────────────────────────────── -->
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

        <!-- ── CHANGELOG ─────────────────────────────────────── -->
        <section class="section">
          <AppChangelogTimeline :app-name="app.name" />
        </section>

        <!-- ── ALTERNATIVES ──────────────────────────────────── -->
        <section class="section">
          <header class="section-head">
            <h2 class="section-title">Similar Alternatives</h2>
            <p class="section-sub">Compare with other tools in this category</p>
          </header>
          <AppAlternativesCarousel :items="alternatives" />
          <div class="sponsored-after-alts no-print">
            <SponsoredSlot placement="alternatives" variant="native-card" :category="app.category" :exclude="[app.id, app.slug].filter((s): s is string => !!s)" label="Sponsored alternative" />
          </div>
        </section>

        <!-- ── MIGRATION ─────────────────────────────────────── -->
        <section class="section">
          <AppMigrationGuides :app-name="app.name" />
        </section>

        <!-- ── CONTACT / ENQUIRY ─────────────────────────────── -->
        <section id="contact" class="section">
          <header class="section-head">
            <h2 class="section-title">Get in Touch</h2>
            <p class="section-sub">Connect directly with the {{ app.name }} team</p>
          </header>

          <div class="contact-layout">
            <!-- Left: form -->
            <div class="contact-form-panel">
              <!-- Tab selector -->
              <div class="contact-tabs">
                <button
                  class="contact-tab"
                  :class="{ 'contact-tab--active': enquiryTab === 'demo' }"
                  @click="enquiryTab = 'demo'; enquirySent = false"
                >
                  <Icon name="heroicons:play-circle" />
                  Request a Demo
                </button>
                <button
                  class="contact-tab"
                  :class="{ 'contact-tab--active': enquiryTab === 'sales' }"
                  @click="enquiryTab = 'sales'; enquirySent = false"
                >
                  <Icon name="heroicons:chat-bubble-left-right" />
                  Talk to Sales
                </button>
              </div>

              <!-- Success state -->
              <div v-if="enquirySent" class="contact-success">
                <div class="contact-success-icon">
                  <Icon name="heroicons:check-circle" />
                </div>
                <h3>Request sent!</h3>
                <p>The {{ app.name }} team will reach out within 1 business day.</p>
                <button class="contact-reset" @click="enquirySent = false; enquiryForm.name = ''; enquiryForm.email = ''; enquiryForm.company = ''; enquiryForm.teamSize = ''; enquiryForm.message = ''">
                  Send another request
                </button>
              </div>

              <!-- Form -->
              <form v-else class="contact-form" @submit.prevent="submitEnquiry">
                <div class="form-row">
                  <div class="form-field">
                    <label for="enq-name">Full name <span class="req">*</span></label>
                    <input id="enq-name" v-model="enquiryForm.name" type="text" placeholder="Jane Smith" required autocomplete="name" />
                  </div>
                  <div class="form-field">
                    <label for="enq-email">Work email <span class="req">*</span></label>
                    <input id="enq-email" v-model="enquiryForm.email" type="email" placeholder="jane@company.com" required autocomplete="email" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <label for="enq-company">Company name <span class="req">*</span></label>
                    <input id="enq-company" v-model="enquiryForm.company" type="text" placeholder="Acme Inc." required autocomplete="organization" />
                  </div>
                  <div class="form-field">
                    <label for="enq-size">Team size</label>
                    <select id="enq-size" v-model="enquiryForm.teamSize">
                      <option value="">Select…</option>
                      <option value="1-10">1–10 people</option>
                      <option value="11-50">11–50 people</option>
                      <option value="51-200">51–200 people</option>
                      <option value="201-1000">201–1,000 people</option>
                      <option value="1000+">1,000+ people</option>
                    </select>
                  </div>
                </div>
                <div class="form-field">
                  <label for="enq-msg">
                    {{ enquiryTab === 'demo' ? 'What would you like to see in the demo?' : 'How can we help?' }}
                  </label>
                  <textarea id="enq-msg" v-model="enquiryForm.message" rows="4" :placeholder="enquiryTab === 'demo' ? 'Tell us about your use case and goals…' : 'Describe your requirements or questions…'"></textarea>
                </div>
                <div v-if="enquiryError" class="contact-error">{{ enquiryError }}</div>
                <button type="submit" class="contact-submit" :disabled="enquirySending || !enquiryForm.name || !enquiryForm.email || !enquiryForm.company">
                  <Icon v-if="enquirySending" name="heroicons:arrow-path" class="spin-icon" />
                  <Icon v-else :name="enquiryTab === 'demo' ? 'heroicons:play-circle' : 'heroicons:paper-airplane'" />
                  {{ enquirySending ? 'Sending…' : (enquiryTab === 'demo' ? 'Request Demo' : 'Contact Sales') }}
                </button>
                <p class="contact-privacy">
                  <Icon name="heroicons:lock-closed" />
                  Your data is secure. We never share your information with third parties.
                </p>
              </form>
            </div>

            <!-- Right: social proof sidebar -->
            <div class="contact-sidebar">
              <div class="contact-proof-card">
                <img v-if="app.logo" :src="app.logo" :alt="app.name" class="contact-app-logo" />
                <div class="contact-app-name">{{ app.name }}</div>
                <div class="contact-app-rating">
                  <span v-for="s in 5" :key="s" class="star" :class="{ 'star--lit': s <= Math.round(app.rating) }">★</span>
                  <span class="rating-num">{{ app.rating.toFixed(1) }}</span>
                </div>

                <div class="contact-proof-list">
                  <div class="proof-item">
                    <Icon name="heroicons:clock" />
                    <span>Typical response: <strong>under 2 hours</strong></span>
                  </div>
                  <div class="proof-item">
                    <Icon name="heroicons:face-smile" />
                    <span>Customer satisfaction: <strong>98%</strong></span>
                  </div>
                  <div class="proof-item">
                    <Icon name="heroicons:shield-check" />
                    <span><strong>No spam</strong> — one email, no pushy follow-ups</span>
                  </div>
                  <div class="proof-item">
                    <Icon name="heroicons:cursor-arrow-rays" />
                    <span>Free trial available — <strong>no credit card</strong></span>
                  </div>
                </div>

                <div class="contact-social">
                  <span class="contact-social-label">Connect on</span>
                  <a :href="companyInfo.linkedin" class="social-btn" target="_blank" rel="noopener" title="LinkedIn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a :href="companyInfo.twitter" class="social-btn" target="_blank" rel="noopener" title="X (Twitter)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a :href="companyInfo.website" class="social-btn" target="_blank" rel="noopener" title="Website">
                    <Icon name="heroicons:globe-alt" />
                  </a>
                </div>
              </div>

              <!-- Quick CTA -->
              <button class="contact-quick-cta" @click="handleTrial">
                <Icon name="heroicons:arrow-right" />
                Try {{ app.name }} free
              </button>
            </div>
          </div>
        </section>

        <!-- ── FAQ ───────────────────────────────────────────── -->
        <section id="faq" class="section">
          <header class="section-head">
            <h2 class="section-title">Frequently Asked Questions</h2>
          </header>
          <AppFAQ :items="faqs" />
        </section>

        <!-- ── FINAL CTA ─────────────────────────────────────── -->
        <section class="section final-cta">
          <div class="final-cta-inner">
            <div class="final-cta-content">
              <img v-if="app.logo" :src="app.logo" :alt="app.name" class="final-cta-logo" />
              <div>
                <h2 class="cta-title">Ready to try {{ app.name }}?</h2>
                <p class="cta-sub">{{ app.pricing.type === 'free' ? 'Get started for free — no credit card required.' : 'Start your free trial today. Cancel anytime.' }}</p>
              </div>
            </div>
            <div class="cta-actions">
              <Button variant="primary" size="lg" @click="handleTrial">
                {{ app.pricing.type === 'free' ? 'Get Started Free' : 'Start Free Trial' }}
              </Button>
              <button class="cta-secondary" @click="enquiryTab = 'demo'; $nextTick(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }))">
                <Icon name="heroicons:play-circle" />
                Request a demo
              </button>
            </div>
          </div>
        </section>

        </main>
      </div><!-- /page-with-rail -->
    </template>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────────── *
 *  BASE                                                        *
 * ─────────────────────────────────────────────────────────── */
.app-details {
  min-height: 100vh;
  background: var(--mm-bg);
  padding-bottom: 80px;
  overflow-x: clip;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Loading / Error */
.state-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; min-height: 60vh; padding: 40px 20px; text-align: center;
}
.spinner {
  width: 32px; height: 32px;
  border: 0.5px solid var(--b2); border-top-color: var(--mm-gold);
  border-radius: 50%; animation: spin 800ms linear infinite;
}
.error-icon { width: 40px; height: 40px; color: var(--mm-slate); }
@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.breadcrumb-row { padding: 16px 24px 12px; }
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.bc-link { color: var(--mm-slate); text-decoration: none; }
.bc-link:hover { color: var(--mm-gold); }
.bc-sep { width: 12px; height: 12px; color: var(--b3); }
.bc-current { color: var(--mm-pearl); font-weight: 500; }

/* ─────────────────────────────────────────────────────────── *
 *  HERO STATS STRIP                                            *
 * ─────────────────────────────────────────────────────────── */
.hero-stats-strip {
  background: var(--mm-s1);
  border-top: 0.5px solid var(--b1);
  border-bottom: 0.5px solid var(--b1);
}
.hss-inner {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  flex-wrap: wrap;
  gap: 4px;
}
.hss-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px;
  font-size: 13px;
  color: var(--mm-silver);
  font-weight: 500;
}
.hss-item:first-child { padding-left: 0; }
.hss-icon { width: 14px; height: 14px; color: var(--mm-slate); flex-shrink: 0; }
.hss-icon--gold { color: var(--mm-gold); }
.hss-icon--green { color: #2A9D8F; }
.hss-val { font-size: 14px; font-weight: 700; color: var(--mm-pearl); }
.hss-lbl { color: var(--mm-slate); }
.hss-sep { width: 0.5px; height: 18px; background: var(--b1); flex-shrink: 0; }
.hss-right { margin-left: auto; }
.hss-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: var(--mm-gold);
  color: #07090F;
  border: none;
  border-radius: var(--r-full);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.hss-cta :deep(svg) { width: 14px; height: 14px; }
.hss-cta:hover { background: #c49a38; }
@media (max-width: 900px) { .hero-stats-strip { display: none; } }

/* ─────────────────────────────────────────────────────────── *
 *  PAGE WITH RAIL LAYOUT                                       *
 * ─────────────────────────────────────────────────────────── */
.page-with-rail {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  align-items: start;
  padding-top: 0;
}
.page-with-rail > * { min-width: 0; }
@media (max-width: 1100px) {
  .page-with-rail {
    grid-template-columns: 1fr;
  }
  .sticky-rail { display: none; }
}

/* ── STICKY RAIL ── */
.sticky-rail {
  position: sticky;
  top: 120px;
  order: 2;
}
.rail-card {
  background: var(--mm-s1);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xl);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rail-app-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rail-logo {
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  background: var(--mm-s2);
  padding: 6px;
  border: 0.5px solid var(--b2);
  object-fit: contain;
  flex-shrink: 0;
}
.rail-app-name { font-size: 14px; font-weight: 700; color: var(--mm-pearl); margin-bottom: 3px; }
.rail-app-rating { display: flex; align-items: center; gap: 2px; }
.rail-star { font-size: 12px; color: var(--b3); }
.rail-star--lit { color: var(--mm-gold); }
.rail-rating-num { font-size: 12px; color: var(--mm-silver); margin-left: 4px; font-weight: 600; }

.rail-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 10px 0;
  border-top: 0.5px solid var(--b1);
  border-bottom: 0.5px solid var(--b1);
}
.rail-price { font-size: 22px; font-weight: 800; color: var(--mm-pearl); }
.rail-period { font-size: 13px; color: var(--mm-slate); }

.rail-cta-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 12px;
  background: var(--mm-gold);
  color: #07090F;
  border: none;
  border-radius: var(--r-sm);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  width: 100%;
}
.rail-cta-primary :deep(svg) { width: 15px; height: 15px; }
.rail-cta-primary:hover { background: #c49a38; box-shadow: 0 4px 16px rgba(212,168,67,.3); }

.rail-cta-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px;
  background: transparent;
  color: var(--mm-silver);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  width: 100%;
}
.rail-cta-ghost :deep(svg) { width: 15px; height: 15px; }
.rail-cta-ghost:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

.rail-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  color: var(--mm-slate);
  margin: -6px 0 0;
  text-align: center;
}
.rail-trust :deep(svg) { width: 12px; height: 12px; flex-shrink: 0; }

.rail-divider { height: 0.5px; background: var(--b1); }

.rail-proof {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.rp-item {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  color: var(--mm-silver);
}
.rp-item :deep(svg) { width: 14px; height: 14px; color: var(--mm-gold); flex-shrink: 0; }
.rp-item strong { color: var(--mm-pearl); }

.rail-actions {
  display: flex;
  gap: 6px;
}
.ra-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 0;
  background: var(--mm-s2);
  color: var(--mm-slate);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
}
.ra-btn :deep(svg) { width: 13px; height: 13px; }
.ra-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.ra-btn--active { border-color: rgba(212,168,67,.4); color: var(--mm-gold); background: var(--mm-gold-soft); }
.ra-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ─────────────────────────────────────────────────────────── *
 *  MODE TOGGLE BAR                                             *
 * ─────────────────────────────────────────────────────────── */
.mode-bar {
  background: var(--mm-s1);
  border-top: 0.5px solid var(--b1);
  border-bottom: 0.5px solid var(--b1);
  position: sticky;
  top: 60px;
  z-index: 30;
}
.mode-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 24px;
}
.mode-pills { display: flex; align-items: center; gap: 6px; }
.mode-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 16px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-full);
  background: transparent;
  color: var(--mm-silver);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.mode-pill :deep(svg) { width: 15px; height: 15px; }
.mode-pill:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.mode-pill--active {
  background: var(--mm-gold-soft);
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}
.mode-pill__badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.05em;
  background: var(--mm-gold); color: #07090F;
  border-radius: 4px; padding: 2px 5px;
}
.mode-bar__right { display: flex; align-items: center; gap: 8px; }
.toolbar-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--mm-s2); color: var(--mm-silver);
  border: 0.5px solid var(--b2); border-radius: var(--r-sm);
  padding: 7px 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.toolbar-btn :deep(svg) { width: 14px; height: 14px; }
.toolbar-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* ─────────────────────────────────────────────────────────── *
 *  NORMAL MODE: sections                                       *
 * ─────────────────────────────────────────────────────────── */
.app-main { padding-top: 0; }

.section {
  margin-top: 72px;
  padding-top: 4px;
  border-top: 0.5px solid var(--b1);
}
.section:first-child { margin-top: 32px; border-top: none; }

.section-head { margin-bottom: 24px; }
.section-title { margin: 0 0 5px; font-size: 22px; font-weight: 700; color: var(--mm-pearl); letter-spacing: -0.01em; }
.section-sub { margin: 0; font-size: 14px; color: var(--mm-slate); }

.trust-row { margin-top: 16px; }

/* AI strip under About */
.ai-strip-section { border-top: 0.5px solid var(--b1); }
.ai-strip-inner {
  background: linear-gradient(135deg, rgba(212,168,67,0.04) 0%, rgba(74,128,212,0.04) 100%);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xl);
  padding: 28px;
}
.ai-strip-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--mm-gold); margin-bottom: 20px;
}
.ai-strip-label :deep(svg) { width: 15px; height: 15px; }
.ai-strip-tools {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;
}
@media (max-width: 900px) { .ai-strip-tools { grid-template-columns: 1fr; } }

/* Tools grid (ROI + alert, now under Pricing) */
.tools-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; align-items: start;
}
@media (max-width: 900px) { .tools-grid { grid-template-columns: 1fr; } }

/* About section */
.about-section { position: relative; }
.about-facts {
  list-style: none; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 0 0 32px;
}
@media (max-width: 900px) { .about-facts { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .about-facts { grid-template-columns: 1fr; } }

.fact-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: var(--mm-s2);
  border: 0.5px solid var(--b1); border-radius: var(--r-lg);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.fact-card:hover { border-color: var(--mm-gold); box-shadow: 0 4px 12px var(--mm-gold-soft); }
.fact-icon {
  width: 36px; height: 36px; border-radius: var(--r-md);
  background: var(--mm-gold-soft); color: var(--mm-gold);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fact-icon :deep(svg) { width: 18px; height: 18px; }
.fact-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--mm-slate); margin-bottom: 2px; }
.fact-value { font-size: 14px; font-weight: 600; color: var(--mm-pearl); line-height: 1.3; }

.two-col { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
.main-col { min-width: 0; }
.side-col { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 16px; }
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .side-col { position: static; }
}

.about-description { font-size: 16px; color: var(--mm-silver); line-height: 1.75; white-space: pre-wrap; }
.about-description :deep(p) { margin: 0 0 14px; }
.about-description :deep(p:last-child) { margin-bottom: 0; }
.about-description::first-letter { font-size: 44px; font-weight: 700; float: left; line-height: 1; padding: 4px 10px 0 0; color: var(--mm-gold); }

.about-highlights { margin-top: 32px; }
.hl-title { margin: 0 0 16px; font-size: 16px; font-weight: 700; color: var(--mm-pearl); }
.hl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 700px) { .hl-grid { grid-template-columns: 1fr; } }

.hl-card {
  position: relative; padding: 20px 18px 18px;
  background: var(--mm-s2); border: 0.5px solid var(--b1);
  border-radius: var(--r-lg); overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.hl-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--hl-color); }
.hl-card:hover { border-color: var(--hl-color); box-shadow: var(--shadow-md); }
.hl-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--hl-bg); color: var(--hl-color); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.hl-icon :deep(svg) { width: 18px; height: 18px; }
.hl-card-title { margin: 0 0 6px; font-size: 14px; font-weight: 700; color: var(--mm-pearl); }
.hl-card-body { margin: 0; font-size: 13px; color: var(--mm-silver); line-height: 1.55; }

.about-usecases { margin-top: 28px; padding-top: 20px; border-top: 0.5px solid var(--b1); }
.uc-title { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 13px; font-weight: 700; color: var(--mm-pearl); text-transform: uppercase; letter-spacing: 0.04em; }
.uc-title :deep(svg) { width: 16px; height: 16px; color: var(--mm-gold); }
.uc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.uc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px 6px 10px; background: var(--mm-gold-soft); border: 0.5px solid var(--mm-gold); border-radius: var(--r-full); font-size: 13px; font-weight: 500; color: var(--mm-gold); }
.uc-chip :deep(svg) { width: 14px; height: 14px; }

.resources-card { background: var(--mm-s2); border: 0.5px solid var(--b1); border-radius: var(--r-lg); padding: 16px; }
.resources-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--mm-pearl); text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 12px; margin-bottom: 8px; border-bottom: 0.5px solid var(--b1); }
.resources-head :deep(svg) { width: 15px; height: 15px; color: var(--mm-gold); }
.resources-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
.resources-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--r-sm); font-size: 13.5px; color: var(--mm-silver); text-decoration: none; transition: background 0.15s, color 0.15s; }
.resources-link:hover { background: var(--mm-gold-soft); color: var(--mm-gold); }
.resources-link .r-icon { width: 16px; height: 16px; color: var(--mm-slate); flex-shrink: 0; }
.resources-link:hover .r-icon { color: var(--mm-gold); }
.resources-link span { flex: 1; }
.resources-link .r-arrow { width: 14px; height: 14px; color: var(--b3); opacity: 0; transition: opacity 0.15s; }
.resources-link:hover .r-arrow { opacity: 1; color: var(--mm-gold); }

.sponsored-after-alts { margin-top: 16px; }

/* ─────────────────────────────────────────────────────────── *
 *  CONTACT / ENQUIRY SECTION                                   *
 * ─────────────────────────────────────────────────────────── */
.contact-layout {
  display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start;
}
@media (max-width: 900px) { .contact-layout { grid-template-columns: 1fr; } }

.contact-form-panel {
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-xl); padding: 28px;
}

/* Tabs */
.contact-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.contact-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: var(--r-full);
  border: 0.5px solid var(--b2); background: transparent;
  font-size: 14px; font-weight: 600; color: var(--mm-silver); cursor: pointer;
  transition: all 0.15s;
}
.contact-tab :deep(svg) { width: 16px; height: 16px; }
.contact-tab:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
.contact-tab--active { border-color: var(--mm-gold); background: var(--mm-gold-soft); color: var(--mm-gold); }

/* Form */
.contact-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 13px; font-weight: 600; color: var(--mm-silver); }
.req { color: var(--mm-gold); }
.form-field input,
.form-field select,
.form-field textarea {
  background: var(--mm-s2); border: 0.5px solid var(--b2);
  border-radius: var(--r-sm); padding: 10px 14px;
  font-size: 14px; color: var(--mm-pearl); outline: none;
  transition: border-color 0.15s; font-family: inherit; resize: vertical;
}
.form-field input::placeholder, .form-field textarea::placeholder { color: var(--mm-slate); }
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: var(--mm-gold); box-shadow: 0 0 0 3px var(--mm-gold-soft); }
.form-field select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2368788F' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 38px; }
.form-field select option { background: var(--mm-s2); }

.contact-submit {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 28px; border-radius: var(--r-sm);
  background: var(--mm-gold); color: #07090F;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
}
.contact-submit :deep(svg) { width: 16px; height: 16px; }
.contact-submit:hover:not(:disabled) { background: #c49a38; box-shadow: 0 4px 16px rgba(212,168,67,.35); transform: translateY(-1px); }
.contact-submit:disabled { opacity: .5; cursor: not-allowed; }
.spin-icon { animation: spin 0.8s linear infinite; }

.contact-privacy { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mm-slate); margin: 0; }
.contact-privacy :deep(svg) { width: 13px; height: 13px; flex-shrink: 0; }
.contact-error { font-size: 13px; color: #fca5a5; background: transparent; border: 0.5px solid rgba(248,113,113,.4); border-radius: var(--r-sm); padding: 10px 14px; }

/* Success */
.contact-success {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 40px 20px; text-align: center;
}
.contact-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--mm-s2); color: #4ade80; display: flex; align-items: center; justify-content: center; }
.contact-success-icon :deep(svg) { width: 30px; height: 30px; }
.contact-success h3 { margin: 0; font-size: 20px; color: var(--mm-pearl); }
.contact-success p { margin: 0; font-size: 14px; color: var(--mm-silver); }
.contact-reset { background: none; border: 0.5px solid var(--b2); border-radius: var(--r-full); padding: 8px 18px; font-size: 13px; color: var(--mm-silver); cursor: pointer; }
.contact-reset:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* Sidebar */
.contact-sidebar { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 100px; }
.contact-proof-card {
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-xl); padding: 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
}
.contact-app-logo { width: 56px; height: 56px; border-radius: var(--r-md); object-fit: contain; background: var(--mm-s2); padding: 6px; }
.contact-app-name { font-size: 16px; font-weight: 700; color: var(--mm-pearl); }
.contact-app-rating { display: flex; align-items: center; gap: 4px; }
.star { color: var(--b3); font-size: 14px; }
.star--lit { color: var(--mm-gold); }
.rating-num { font-size: 13px; font-weight: 600; color: var(--mm-silver); margin-left: 4px; }

.contact-proof-list { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 4px; padding-top: 14px; border-top: 0.5px solid var(--b1); text-align: left; }
.proof-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--mm-silver); }
.proof-item :deep(svg) { width: 15px; height: 15px; color: var(--mm-gold); flex-shrink: 0; margin-top: 1px; }
.proof-item strong { color: var(--mm-pearl); }

.contact-social { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.contact-social-label { font-size: 12px; color: var(--mm-slate); margin-right: 4px; }
.social-btn {
  width: 32px; height: 32px; border-radius: var(--r-sm);
  background: var(--mm-s2); border: 0.5px solid var(--b2);
  display: flex; align-items: center; justify-content: center;
  color: var(--mm-silver); text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.social-btn :deep(svg) { width: 15px; height: 15px; }
.social-btn:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

.contact-quick-cta {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px;
  border: 0.5px solid var(--b2); border-radius: var(--r-lg);
  background: var(--mm-gold-soft); color: var(--mm-gold);
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.contact-quick-cta :deep(svg) { width: 16px; height: 16px; }
.contact-quick-cta:hover { background: rgba(212,168,67,.18); border-color: var(--mm-gold); }

/* ─────────────────────────────────────────────────────────── *
 *  FINAL CTA                                                   *
 * ─────────────────────────────────────────────────────────── */
.final-cta {
  background: var(--mm-s2); border: 0.5px solid var(--mm-gold);
  border-radius: var(--r-xl); padding: 40px 32px;
  margin-top: 72px; position: relative; overflow: hidden;
}
.final-cta::before {
  content: ''; position: absolute; top: -80px; right: -80px;
  width: 240px; height: 240px; background: var(--mm-gold-soft); border-radius: 50%;
  pointer-events: none;
}
.final-cta-inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; position: relative;
}
.final-cta-content { display: flex; align-items: center; gap: 20px; flex: 1; min-width: 0; }
.final-cta-logo { width: 52px; height: 52px; border-radius: var(--r-md); object-fit: contain; background: var(--mm-s1); padding: 6px; flex-shrink: 0; }
.cta-title { margin: 0 0 6px; font-size: 24px; font-weight: 700; color: var(--mm-pearl); letter-spacing: -0.01em; }
.cta-sub { margin: 0; font-size: 14px; color: var(--mm-silver); }
.cta-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.cta-secondary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 20px; border-radius: var(--r-sm);
  border: 0.5px solid var(--b2); background: transparent;
  font-size: 14px; font-weight: 600; color: var(--mm-silver); cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.cta-secondary :deep(svg) { width: 16px; height: 16px; }
.cta-secondary:hover { border-color: var(--mm-gold); color: var(--mm-gold); }
@media (max-width: 720px) { .final-cta-inner { flex-direction: column; text-align: center; } .final-cta-content { flex-direction: column; text-align: center; } }

/* ─────────────────────────────────────────────────────────── *
 *  AI MODE                                                     *
 * ─────────────────────────────────────────────────────────── */
.ai-mode {
  padding-top: 8px;
  padding-bottom: 80px;
  max-width: 880px;
  margin: 0 auto;
}
.ai-section { margin-top: 56px; padding-top: 4px; border-top: 0.5px solid var(--b1); }
.ai-section:first-child { border-top: none; margin-top: 20px; }
.ai-section-title { font-size: 18px; font-weight: 700; color: var(--mm-pearl); margin: 0 0 20px; }

/* Verdict card */
.ai-verdict-card {
  display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-xl); padding: 32px;
}
@media (max-width: 700px) { .ai-verdict-card { grid-template-columns: 1fr; } }
.ai-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--mm-gold); margin-bottom: 14px;
}
.ai-badge :deep(svg) { width: 14px; height: 14px; }
.ai-verdict-title { margin: 0 0 10px; font-size: 28px; font-weight: 800; color: var(--mm-pearl); letter-spacing: -0.02em; }
.ai-verdict-oneliner { margin: 0 0 20px; font-size: 15px; color: var(--mm-silver); line-height: 1.6; }

.ai-score-row { display: flex; align-items: center; gap: 14px; }
.ai-score-circle { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
.ai-donut { width: 60px; height: 60px; transform: rotate(0deg); }
.ai-score-num {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 14px; font-weight: 800; color: var(--mm-gold);
}
.ai-score-label { font-size: 13px; font-weight: 700; color: var(--mm-pearl); margin-bottom: 3px; }
.ai-score-sub { font-size: 12px; color: var(--mm-silver); }

.ai-quick-facts { display: flex; flex-direction: column; gap: 12px; }
.ai-fact { display: flex; align-items: flex-start; gap: 12px; }
.ai-fact :deep(svg) { width: 16px; height: 16px; color: var(--mm-gold); margin-top: 1px; flex-shrink: 0; }
.ai-fact-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--mm-slate); margin-bottom: 1px; }
.ai-fact-val { display: block; font-size: 14px; font-weight: 600; color: var(--mm-pearl); }

/* TL;DR list */
.ai-tldr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.ai-tldr-item { display: flex; gap: 16px; align-items: flex-start; }
.ai-tldr-num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--mm-gold-soft); border: 0.5px solid var(--mm-gold);
  font-size: 11px; font-weight: 800; color: var(--mm-gold);
  display: flex; align-items: center; justify-content: center;
}
.ai-tldr-item p { margin: 0; font-size: 15px; color: var(--mm-silver); line-height: 1.65; padding-top: 3px; }

/* Pros / Cons */
.ai-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .ai-proscons { grid-template-columns: 1fr; } }
.ai-pros, .ai-cons {
  padding: 20px; border-radius: var(--r-lg); border: 0.5px solid var(--b1);
}
.ai-pros { background: rgba(42,157,143,.05); border-color: rgba(42,157,143,.2); }
.ai-cons { background: rgba(248,113,113,.04); border-color: rgba(248,113,113,.15); }
.ai-pc-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 700; margin-bottom: 14px;
}
.ai-pc-head :deep(svg) { width: 16px; height: 16px; }
.ai-pc-head--pro { color: #2A9D8F; }
.ai-pc-head--con { color: #f87171; }
.ai-pc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.ai-pc-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: var(--mm-silver); }
.ai-pc-list li :deep(svg) { width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }
.ai-pros .ai-pc-list li :deep(svg) { color: #2A9D8F; }
.ai-cons .ai-pc-list li :deep(svg) { color: var(--mm-slate); }

/* Who it's for */
.ai-for-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
@media (max-width: 700px) { .ai-for-grid { grid-template-columns: repeat(2, 1fr); } }
.ai-for-card {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-lg); font-size: 13px; font-weight: 500; color: var(--mm-silver);
  transition: border-color 0.15s, color 0.15s;
}
.ai-for-card :deep(svg) { width: 15px; height: 15px; color: var(--mm-gold); flex-shrink: 0; }
.ai-for-card:hover { border-color: var(--mm-gold); color: var(--mm-pearl); }
.ai-insights-wrapper { margin-top: 8px; }

/* Pricing strip */
.ai-price-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 700px) { .ai-price-strip { grid-template-columns: 1fr; } }
.ai-plan-card {
  position: relative; padding: 22px 20px;
  background: var(--mm-s1); border: 0.5px solid var(--b1);
  border-radius: var(--r-xl); text-align: center;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ai-plan-card--pop { border-color: var(--mm-gold); background: rgba(212,168,67,.04); }
.ai-plan-badge {
  position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
  background: var(--mm-gold); color: #07090F; font-size: 10px; font-weight: 800;
  letter-spacing: 0.05em; padding: 3px 10px; border-radius: var(--r-full);
}
.ai-plan-name { font-size: 13px; font-weight: 700; color: var(--mm-silver); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
.ai-plan-price { font-size: 28px; font-weight: 800; color: var(--mm-pearl); margin-bottom: 8px; }
.ai-plan-dollar { font-size: 28px; }
.ai-plan-period { font-size: 13px; color: var(--mm-slate); font-weight: 400; }
.ai-plan-desc { font-size: 13px; color: var(--mm-silver); margin-bottom: 16px; line-height: 1.5; }
.ai-plan-cta {
  width: 100%; padding: 9px 0; border-radius: var(--r-sm);
  background: transparent; border: 0.5px solid var(--b2);
  font-size: 13px; font-weight: 600; color: var(--mm-silver); cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.ai-plan-card--pop .ai-plan-cta { background: var(--mm-gold); border-color: var(--mm-gold); color: #07090F; }
.ai-plan-card:not(.ai-plan-card--pop) .ai-plan-cta:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* AI Contact */
.ai-contact-sub { font-size: 15px; color: var(--mm-silver); margin: -12px 0 20px; }
.ai-contact-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.ai-cta-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; background: var(--mm-gold); color: #07090F;
  border: none; border-radius: var(--r-sm); font-size: 14px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.ai-cta-primary :deep(svg) { width: 16px; height: 16px; }
.ai-cta-primary:hover { background: #c49a38; }
.ai-cta-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; background: transparent; color: var(--mm-silver);
  border: 0.5px solid var(--b2); border-radius: var(--r-sm); font-size: 14px; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.ai-cta-ghost :deep(svg) { width: 16px; height: 16px; }
.ai-cta-ghost:hover { border-color: var(--mm-gold); color: var(--mm-gold); }

/* ─────────────────────────────────────────────────────────── *
 *  PRINT                                                       *
 * ─────────────────────────────────────────────────────────── */
@media print {
  :deep(.app-header), :deep(.footer), :deep(.sticky-nav),
  .mode-bar, .no-print, .final-cta, .ai-strip-section,
  .sponsored-after-alts, :deep(button) { display: none !important; }
  body, .app-details, .app-main { background: #fff !important; color: #000 !important; }
  .section { page-break-inside: avoid; margin-bottom: 24pt; border: 0 !important; }
  .section-title { font-size: 16pt; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 8pt; color: #666; }
  a[href^="#"]::after, a[href^="javascript:"]::after { content: ""; }
}
</style>

