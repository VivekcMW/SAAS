<template>
  <div class="for-page">
    <!-- Breadcrumb -->
    <nav class="for-breadcrumb container" aria-label="Breadcrumb">
      <NuxtLink to="/" class="bc-link">moonmart.ai</NuxtLink>
      <span class="bc-sep">›</span>
      <NuxtLink to="/marketplace" class="bc-link">Marketplace</NuxtLink>
      <span class="bc-sep">›</span>
      <span class="bc-current">Software for {{ audienceConfig.title }}</span>
    </nav>

    <!-- Hero -->
    <section class="for-hero">
      <div class="container for-hero__inner">
        <span class="for-hero__eyebrow">Built for your role</span>
        <h1 class="for-hero__h1">Best Software for {{ audienceConfig.title }} ({{ currentYear }})</h1>
        <p class="for-hero__sub">{{ audienceConfig.description }}</p>
        <div class="for-hero__stats">
          <span><strong>{{ total }}</strong> tools reviewed</span>
          <span class="dot">·</span>
          <span>Updated {{ today }}</span>
          <span class="dot">·</span>
          <span>Verified buyer reviews only</span>
        </div>
      </div>
    </section>

    <!-- Filter -->
    <div class="for-filters container">
      <button
        v-for="f in categoryFilters"
        :key="f"
        class="for-filter"
        :class="{ 'for-filter--active': activeCategory === f }"
        @click="activeCategory = f"
      >{{ f === 'all' ? 'All Categories' : f }}</button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="for-loading container">
      <div class="spinner" /><p>Loading…</p>
    </div>

    <!-- Grid -->
    <section v-else class="for-grid container">
      <div v-if="!filteredApps.length" class="for-empty">
        <p>No apps match this filter. <button class="for-reset" @click="activeCategory = 'all'">Show all →</button></p>
      </div>

      <article
        v-for="app in filteredApps"
        :key="app.id"
        class="for-card"
      >
        <div class="for-card__head">
          <img v-if="app.logo" :src="app.logo" :alt="app.name" class="for-card__logo" @error="onLogoErr" />
          <div v-else class="for-card__logo-fb">{{ app.name[0] }}</div>
          <div class="for-card__top">
            <span class="for-card__cat">{{ app.category }}</span>
            <span v-if="app.pricing.type === 'free'" class="for-card__free-badge">Free</span>
          </div>
        </div>
        <h2 class="for-card__name">{{ app.name }}</h2>
        <p class="for-card__desc">{{ app.description }}</p>
        <div class="for-card__footer">
          <div class="for-card__rating">★ {{ app.rating.toFixed(1) }} <span class="for-card__rc">({{ app.reviewCount }})</span></div>
          <div class="for-card__price">{{ formatPrice(app) }}</div>
        </div>
        <div class="for-card__actions">
          <NuxtLink :to="`/marketplace/app/${app.slug}`" class="bw-btn bw-btn--primary bw-btn--sm">View details →</NuxtLink>
          <NuxtLink :to="`/alternatives/${app.slug}`" class="bw-btn bw-btn--ghost bw-btn--sm">Alternatives</NuxtLink>
        </div>
      </article>
    </section>

    <!-- Audience FAQ -->
    <section class="for-faq container">
      <h2 class="for-faq__title">Common Questions from {{ audienceConfig.title }}</h2>
      <div class="for-faq__list">
        <details v-for="f in audienceConfig.faqs" :key="f.q" class="for-faq__item">
          <summary class="for-faq__q">{{ f.q }}</summary>
          <p class="for-faq__a">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <!-- Related audiences -->
    <section class="for-related container">
      <h2 class="for-related__title">Other Buyer Profiles</h2>
      <div class="for-related__grid">
        <NuxtLink
          v-for="a in relatedAudiences"
          :key="a.slug"
          :to="`/for/${a.slug}`"
          class="for-related__card"
        >
          <span class="for-related__label">Software for</span>
          <span class="for-related__name">{{ a.title }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface App {
  id: string; slug: string; name: string; description: string; logo?: string
  category: string; rating: number; reviewCount: number
  pricing: { type: string; value?: number }
  tags?: string[]
}

interface AudienceConfig {
  title: string
  description: string
  searchTerms: string[]
  categories: string[]
  faqs: Array<{ q: string; a: string }>
}

const AUDIENCE_MAP: Record<string, AudienceConfig> = {
  'small-teams': {
    title: 'Small Teams',
    description: 'Discover the best SaaS tools for small teams (2–20 people) — tools that are easy to set up, affordable, and scale as you grow.',
    searchTerms: ['small team', 'startup', 'smb'],
    categories: ['collaboration', 'project-management', 'crm-sales', 'productivity'],
    faqs: [
      { q: 'What is the best free project management tool for small teams?', a: 'moonmart.ai lists 50+ free project management tools for small teams. Filter by "Free" above to see the top options ranked by verified buyer ratings.' },
      { q: 'How much should a 10-person team budget for software?', a: 'Most small teams spend $50–$200/month on core SaaS tools. Start with free tiers, then upgrade as you scale.' }
    ]
  },
  'startups': {
    title: 'Startups',
    description: 'Battle-tested tools for startups — fast to deploy, startup-friendly pricing, and integration-ready from day one.',
    searchTerms: ['startup', 'early stage', 'founder'],
    categories: ['developer', 'analytics', 'crm-sales', 'marketing'],
    faqs: [
      { q: 'What tools do successful startups use?', a: 'Top startup tools on moonmart.ai include Notion, Linear, Slack, HubSpot CRM (free tier), and Stripe. All have free or startup plans.' },
      { q: 'Are there special startup discounts on SaaS tools?', a: "Yes — many tools offer startup programs. Check each tool's listing on moonmart.ai for startup pricing and credits." }
    ]
  },
  'remote-teams': {
    title: 'Remote Teams',
    description: 'Software built for distributed, async-first teams — video, docs, async video, and timezone-friendly collaboration.',
    searchTerms: ['remote', 'distributed', 'async'],
    categories: ['collaboration', 'video-conferencing', 'project-management', 'hr-people'],
    faqs: [
      { q: 'What is the best collaboration tool for remote teams?', a: 'Slack, Notion, and Loom consistently receive the highest ratings from remote teams on moonmart.ai. All offer free tiers.' },
      { q: 'How do remote teams manage HR and payroll?', a: 'Remote-friendly HR tools like Deel, Remote, and Rippling are highly rated for distributed workforces on moonmart.ai.' }
    ]
  },
  'enterprise': {
    title: 'Enterprise',
    description: 'Enterprise-grade SaaS with SSO, audit logs, SLAs, and dedicated support — vetted and scored by moonmart.ai.',
    searchTerms: ['enterprise', '500+', 'compliance'],
    categories: ['crm-sales', 'hr-people', 'security', 'analytics'],
    faqs: [
      { q: 'What SaaS tools support SSO and SAML for enterprise?', a: 'Most enterprise-tier SaaS tools include SSO/SAML. Filter by "Enterprise" pricing on moonmart.ai or look for the security certification badge.' },
      { q: 'How do I evaluate enterprise SaaS security?', a: 'moonmart.ai displays SOC 2, ISO 27001, and GDPR compliance badges on every verified app listing. Use the security filter to shortlist compliant tools.' }
    ]
  },
  'solo-founders': {
    title: 'Solo Founders',
    description: 'Lean SaaS stack for solo founders and indie hackers — maximum leverage, minimum cost, zero bloat.',
    searchTerms: ['solo', 'indie', 'solopreneur', 'freelance'],
    categories: ['productivity', 'marketing', 'analytics', 'payment'],
    faqs: [
      { q: 'What is the best all-in-one tool for solo founders?', a: 'Notion, Airtable, and Webflow are consistently rated highest by solo founders on moonmart.ai for doing more with less.' },
      { q: 'What free tools can solo founders use?', a: "Filter for 'Free' tools above. moonmart.ai tracks 200+ tools with genuine free tiers — not just trials." }
    ]
  },
  'agencies': {
    title: 'Agencies',
    description: 'Client management, project delivery, and reporting tools built for the multi-client agency workflow.',
    searchTerms: ['agency', 'client', 'retainer'],
    categories: ['project-management', 'crm-sales', 'marketing', 'analytics'],
    faqs: [
      { q: 'What is the best project management tool for agencies?', a: 'ClickUp, Asana, and Monday.com are top-rated for agency project management on moonmart.ai, with client portal features and team billing.' },
      { q: 'How do agencies manage multiple client accounts?', a: 'Agency-mode tools like HubSpot Agency, Teamwork, and Wrike support multiple client workspaces. Compare them side-by-side on moonmart.ai.' }
    ]
  },
  'marketing-managers': {
    title: 'Marketing Managers',
    description: 'The definitive stack for marketing managers — automation, analytics, content, and campaign management.',
    searchTerms: ['marketing', 'campaign', 'automation'],
    categories: ['marketing', 'analytics', 'crm-sales', 'social-media'],
    faqs: [
      { q: 'What are the best marketing automation tools?', a: 'HubSpot, Mailchimp, and Klaviyo are the highest-rated marketing automation tools on moonmart.ai based on 15,000+ verified reviews.' },
      { q: 'What analytics tools should every marketing team use?', a: 'Google Analytics, Mixpanel, and Amplitude are the top-rated analytics tools for marketing teams on moonmart.ai.' }
    ]
  },
  'hr-directors': {
    title: 'HR Directors',
    description: 'HRIS, payroll, recruiting, and performance management tools — rated by HR professionals who use them daily.',
    searchTerms: ['hr', 'payroll', 'recruiting', 'hris'],
    categories: ['hr-people', 'payroll', 'recruiting'],
    faqs: [
      { q: 'What is the best HRIS for a 100-person company?', a: 'BambooHR, Rippling, and Personio are top-rated for mid-size companies on moonmart.ai. Each handles HR, payroll, and onboarding in one platform.' },
      { q: 'How do I choose between ATS systems?', a: 'Compare Greenhouse, Lever, and Workday Recruiting side-by-side on moonmart.ai — use our AI Match Engine to get a personalised recommendation.' }
    ]
  }
}

const route = useRoute()
const audience = route.params.audience as string
const currentYear = new Date().getFullYear()
const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const audienceConfig = computed<AudienceConfig>(() => AUDIENCE_MAP[audience] || {
  title: audience.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  description: `Best SaaS tools for ${audience.replaceAll('-', ' ')} — ranked by moonmart.ai verified buyers.`,
  searchTerms: [audience],
  categories: [],
  faqs: []
})

// Fetch apps using matching category/search
const searchQuery = computed(() => audienceConfig.value.searchTerms.join(','))
const { data, pending } = await useFetch<{ apps: App[]; total: number }>(
  `/api/apps?search=${encodeURIComponent(audienceConfig.value.searchTerms[0])}&sortBy=rating&perPage=24`,
  { key: `for-${audience}` }
)

const apps = computed(() => (data.value?.apps || []) as App[])
const total = computed(() => data.value?.total || 0)

const uniqueCategories = computed(() => {
  const cats = [...new Set(apps.value.map(a => a.category))]
  return ['all', ...cats.slice(0, 6)]
})
const categoryFilters = uniqueCategories
const activeCategory = ref('all')

const filteredApps = computed(() => {
  if (activeCategory.value === 'all') return apps.value
  return apps.value.filter(a => a.category === activeCategory.value)
})

function formatPrice(a: App): string {
  if (a.pricing.type === 'free') return 'Free'
  if (a.pricing.type === 'contact') return 'Custom'
  if (a.pricing.value) return `From $${a.pricing.value}/mo`
  return 'Paid'
}

function onLogoErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }

const relatedAudiences = Object.entries(AUDIENCE_MAP)
  .filter(([slug]) => slug !== audience)
  .slice(0, 6)
  .map(([slug, cfg]) => ({ slug, title: cfg.title }))

// SEO
useHead(() => {
  const cfg = audienceConfig.value
  return {
    title: `Best Software for ${cfg.title} (${currentYear}) — moonmart.ai`,
    meta: [
      { name: 'description', content: cfg.description },
      { property: 'og:title', content: `Software for ${cfg.title} — moonmart.ai` },
      { property: 'og:description', content: cfg.description },
      { name: 'robots', content: 'index, follow' }
    ],
    link: [{ rel: 'canonical', href: `https://moonmart.ai/for/${audience}` }],
    script: apps.value.length ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Best Software for ${cfg.title}`,
          url: `https://moonmart.ai/for/${audience}`,
          numberOfItems: apps.value.length,
          itemListElement: apps.value.slice(0, 10).map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'SoftwareApplication', name: a.name, url: `https://moonmart.ai/marketplace/app/${a.slug}` }
          }))
        })
      }
    ] : []
  }
})
</script>

<style scoped>
.for-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.for-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding-top: 24px; flex-wrap: wrap; }
.bc-link { color: var(--aw-accent); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--aw-text-muted); }
.bc-current { color: var(--aw-text-muted); }
.for-hero { padding: 40px 0 32px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.for-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.for-hero__eyebrow { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--aw-accent); margin-bottom: 8px; }
.for-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 10px; }
.for-hero__sub { color: var(--aw-text-muted); max-width: 600px; margin-bottom: 16px; font-size: 0.95rem; }
.for-hero__stats { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--aw-text-muted); flex-wrap: wrap; }
.dot { opacity: 0.4; }
.for-filters { display: flex; gap: 8px; flex-wrap: wrap; padding: 20px 0; }
.for-filter { padding: 6px 16px; border: 1.5px solid var(--aw-border); border-radius: 999px; font-size: 0.8rem; cursor: pointer; background: transparent; transition: all 0.12s; color: var(--aw-text-muted); }
.for-filter:hover { border-color: var(--aw-accent); color: var(--aw-accent); }
.for-filter--active { background: var(--aw-accent); border-color: var(--aw-accent); color: #fff; }
.for-loading { text-align: center; padding: 60px 0; }
.for-empty { text-align: center; padding: 40px 0; color: var(--aw-text-muted); }
.for-reset { color: var(--aw-accent); background: none; border: none; cursor: pointer; font-size: inherit; text-decoration: underline; }
.for-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding-bottom: 48px; }
.for-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.12s; }
.for-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.for-card__head { display: flex; align-items: center; gap: 10px; }
.for-card__logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
.for-card__logo-fb { width: 40px; height: 40px; background: var(--aw-accent); color: #fff; font-size: 1rem; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.for-card__top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.for-card__cat { font-size: 0.72rem; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.for-card__free-badge { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); font-size: 0.68rem; font-weight: 700; padding: 1px 8px; border-radius: 999px; }
.for-card__name { font-size: 1rem; font-weight: 700; }
.for-card__desc { font-size: 0.85rem; color: var(--aw-text-muted); line-height: 1.55; flex: 1; }
.for-card__footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; }
.for-card__rating { color: var(--aw-accent); font-weight: 700; }
.for-card__rc { font-weight: 400; color: var(--aw-text-muted); margin-left: 4px; }
.for-card__price { font-weight: 600; }
.for-card__actions { display: flex; gap: 8px; }
.for-faq, .for-related { padding: 48px 0; max-width: 1120px; margin: 0 auto; }
.for-faq__title, .for-related__title { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
.for-faq__list { display: flex; flex-direction: column; gap: 4px; }
.for-faq__item { border: 1px solid var(--aw-border); border-radius: 10px; overflow: hidden; }
.for-faq__q { padding: 14px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; list-style: none; }
.for-faq__q::after { content: ' ▾'; }
details[open] .for-faq__q::after { content: ' ▴'; }
.for-faq__a { padding: 0 20px 14px; font-size: 0.85rem; color: var(--aw-text-muted); line-height: 1.7; }
.for-related__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.for-related__card { background: var(--aw-surface-2); border: 1.5px solid var(--aw-border); border-radius: 10px; padding: 14px 16px; text-decoration: none; transition: all 0.12s; display: flex; flex-direction: column; gap: 2px; }
.for-related__card:hover { border-color: var(--aw-accent); background: var(--aw-accent-50, #eff6ff); }
.for-related__label { font-size: 0.68rem; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.for-related__name { font-size: 0.9rem; font-weight: 700; color: var(--aw-text); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
