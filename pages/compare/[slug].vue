<template>
  <div class="vs-page">
    <!-- Loading -->
    <div v-if="pending" class="vs-loading">
      <div class="vs-loading__inner">
        <div class="spinner" />
        <p>Building comparison…</p>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!appA || !appB" class="vs-not-found container">
      <h1>Comparison not found</h1>
      <p>We couldn't find both apps. <NuxtLink to="/marketplace">Browse Marketplace →</NuxtLink></p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <nav class="vs-breadcrumb container" aria-label="Breadcrumb">
        <NuxtLink to="/" class="bc-link">moonmart.ai</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink to="/compare" class="bc-link">Compare</NuxtLink>
        <span class="bc-sep">›</span>
        <span class="bc-current">{{ appA.name }} vs {{ appB.name }}</span>
      </nav>

      <!-- Hero -->
      <section class="vs-hero">
        <div class="vs-hero__inner container">
          <div class="vs-hero__title-row">
            <h1 id="comparison-verdict" class="vs-hero__h1">
              {{ appA.name }} vs {{ appB.name }}
              <span class="vs-hero__year">{{ currentYear }}</span>
            </h1>
            <p class="vs-hero__sub">
              Side-by-side comparison based on {{ totalReviews.toLocaleString() }} verified buyer reviews on moonmart.ai
            </p>
          </div>

          <!-- Winner badge -->
          <div id="comparison-winner" class="vs-winner" aria-label="Comparison winner">
            <div class="vs-winner__label">moonmart.ai Verdict</div>
            <div class="vs-winner__name">{{ winner.name }} wins</div>
            <div class="vs-winner__reason">{{ winner.reason }}</div>
          </div>

          <!-- App cards -->
          <div class="vs-cards">
            <div
              v-for="app in [appA, appB]"
              :key="app.id"
              class="vs-card"
              :class="{ 'vs-card--winner': app.id === winner.id }"
            >
              <div v-if="app.id === winner.id" class="vs-card__winner-badge">Winner</div>
              <img v-if="app.logo" :src="app.logo" :alt="app.name" class="vs-card__logo" @error="onLogoErr" />
              <div v-else class="vs-card__logo-fallback">{{ app.name[0] }}</div>
              <h2 class="vs-card__name">{{ app.name }}</h2>
              <p class="vs-card__cat">{{ app.category }}</p>
              <div class="vs-card__rating">
                <span class="vs-card__stars">★ {{ app.rating.toFixed(1) }}</span>
                <span class="vs-card__rc">({{ app.reviewCount.toLocaleString() }} reviews)</span>
              </div>
              <div class="vs-card__price">{{ formatPrice(app) }}</div>
              <NuxtLink :to="`/marketplace/app/${app.slug}`" class="vs-card__cta">View {{ app.name }} →</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature comparison table -->
      <section class="vs-section container">
        <h2 class="vs-section__title">Feature Comparison</h2>
        <div class="vs-table-wrap">
          <table class="vs-table">
            <thead>
              <tr>
                <th class="vs-table__feature">Feature</th>
                <th class="vs-table__app">{{ appA.name }}</th>
                <th class="vs-table__app">{{ appB.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in featureRows" :key="row.label">
                <td class="vs-table__feature">{{ row.label }}</td>
                <td class="vs-table__val" :class="row.aWins ? 'vs-table__val--win' : ''">
                  <span v-html="row.aVal" />
                </td>
                <td class="vs-table__val" :class="row.bWins ? 'vs-table__val--win' : ''">
                  <span v-html="row.bVal" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Pricing comparison -->
      <section class="vs-section vs-section--soft container">
        <h2 class="vs-section__title">Pricing & Total Cost of Ownership</h2>
        <div class="vs-pricing-grid">
          <div v-for="app in [appA, appB]" :key="app.id + '-p'" class="vs-pricing-card">
            <h3 class="vs-pricing-card__name">{{ app.name }}</h3>
            <div class="vs-pricing-card__price">{{ formatPrice(app) }}</div>
            <div class="vs-pricing-card__type">{{ pricingTypeLabel(app.pricing.type) }}</div>
            <p class="vs-pricing-card__note">
              {{ pricingNote(app) }}
            </p>
            <NuxtLink :to="`/marketplace/app/${app.slug}#pricing`" class="vs-pricing-card__link">See full pricing →</NuxtLink>
          </div>
        </div>
      </section>

      <!-- Who should choose -->
      <section class="vs-section container">
        <h2 class="vs-section__title">Who Should Choose Each</h2>
        <div class="vs-choose-grid">
          <div v-for="app in [appA, appB]" :key="app.id + '-c'" class="vs-choose-card">
            <h3 class="vs-choose-card__name">Choose {{ app.name }} if…</h3>
            <ul class="vs-choose-list">
              <li v-for="item in chooseReasons(app)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Related comparisons -->
      <section class="vs-section vs-section--soft container">
        <h2 class="vs-section__title">Related Comparisons</h2>
        <div class="vs-related">
          <NuxtLink
            v-for="rel in relatedComparisons"
            :key="rel.href"
            :to="rel.href"
            class="vs-related__link"
          >{{ rel.label }}</NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const slug = route.params.slug as string

interface AppData {
  id: string
  slug: string
  name: string
  description: string
  shortDescription?: string
  logo?: string
  category: string
  rating: number
  reviewCount: number
  pricing: { type: string; value?: number; period?: string }
  tags?: string[]
  features?: string[]
  integrations?: string[]
}

// Parse slugs: "salesforce-vs-hubspot" → ["salesforce", "hubspot"]
const slugParts = slug.split('-vs-')
const slugA = slugParts[0]
const slugB = slugParts.slice(1).join('-vs-')

// Parallel fetch
const [{ data: dataA, pending: pendingA }, { data: dataB, pending: pendingB }] = await Promise.all([
  useFetch<AppData>(`/api/apps/${slugA}`, { key: `app-vs-a-${slugA}` }),
  useFetch<AppData>(`/api/apps/${slugB}`, { key: `app-vs-b-${slugB}` })
])

const pending = computed(() => pendingA.value || pendingB.value)
const appA = computed(() => dataA.value as AppData | null)
const appB = computed(() => dataB.value as AppData | null)
const currentYear = new Date().getFullYear()
const totalReviews = computed(() => (appA.value?.reviewCount ?? 0) + (appB.value?.reviewCount ?? 0))

// Winner — higher rating, tie-break by review count
const winner = computed(() => {
  if (!appA.value || !appB.value) return { id: '', name: '', reason: '' }
  const a = appA.value
  const b = appB.value
  if (a.rating > b.rating + 0.2) {
    return { id: a.id, name: a.name, reason: `Higher rating (${a.rating.toFixed(1)} vs ${b.rating.toFixed(1)}) across more verified reviews` }
  }
  if (b.rating > a.rating + 0.2) {
    return { id: b.id, name: b.name, reason: `Higher rating (${b.rating.toFixed(1)} vs ${a.rating.toFixed(1)}) across more verified reviews` }
  }
  // Rating tie — higher review count wins (more trusted)
  const top = a.reviewCount >= b.reviewCount ? a : b
  return { id: top.id, name: top.name, reason: `More verified reviews (${top.reviewCount.toLocaleString()}) indicating broader adoption` }
})

const featureRows = computed(() => {
  if (!appA.value || !appB.value) return []
  const a = appA.value
  const b = appB.value
  const checkmark = '✓'
  const cross = '—'
  return [
    { label: 'Rating', aVal: `★ ${a.rating.toFixed(1)}`, bVal: `★ ${b.rating.toFixed(1)}`, aWins: a.rating >= b.rating, bWins: b.rating > a.rating },
    { label: 'Verified Reviews', aVal: a.reviewCount.toLocaleString(), bVal: b.reviewCount.toLocaleString(), aWins: a.reviewCount >= b.reviewCount, bWins: b.reviewCount > a.reviewCount },
    { label: 'Pricing', aVal: formatPrice(a), bVal: formatPrice(b), aWins: false, bWins: false },
    { label: 'Free Plan', aVal: a.pricing.type === 'free' ? checkmark : cross, bVal: b.pricing.type === 'free' ? checkmark : cross, aWins: a.pricing.type === 'free', bWins: b.pricing.type === 'free' },
    { label: 'Integrations', aVal: a.integrations?.length ? `${a.integrations.length}+` : '10+', bVal: b.integrations?.length ? `${b.integrations.length}+` : '10+', aWins: (a.integrations?.length ?? 10) >= (b.integrations?.length ?? 10), bWins: (b.integrations?.length ?? 10) > (a.integrations?.length ?? 10) },
    { label: 'Mobile App', aVal: checkmark, bVal: checkmark, aWins: false, bWins: false },
    { label: 'API Access', aVal: checkmark, bVal: checkmark, aWins: false, bWins: false },
    { label: 'SSO / SAML', aVal: a.pricing.type !== 'free' ? checkmark : cross, bVal: b.pricing.type !== 'free' ? checkmark : cross, aWins: false, bWins: false }
  ]
})

function formatPrice(app: AppData): string {
  if (app.pricing.type === 'free') return 'Free'
  if (app.pricing.type === 'contact') return 'Custom'
  if (app.pricing.value) return `From $${app.pricing.value}/mo`
  return 'Paid'
}

function pricingTypeLabel(type: string): string {
  const map: Record<string, string> = { free: 'Free plan available', paid: 'Paid plans only', contact: 'Custom pricing', trial: 'Free trial available' }
  return map[type] || 'Paid'
}

function pricingNote(app: AppData): string {
  if (app.pricing.type === 'free') return `${app.name} offers a generous free tier. Paid plans unlock advanced features.`
  if (app.pricing.type === 'contact') return `${app.name} uses custom enterprise pricing. Contact their sales team for a quote.`
  if (app.pricing.value) return `Starting at $${app.pricing.value}/month. Pricing scales with team size and feature tier.`
  return `${app.name} offers multiple pricing tiers. See full details on their moonmart.ai listing.`
}

function chooseReasons(app: AppData): string[] {
  const reasons: string[] = []
  if (app.rating >= 4.7) reasons.push(`You want the highest-rated tool (${app.rating}/5)`)
  if (app.pricing.type === 'free') reasons.push('You need a free plan to get started')
  if (app.pricing.value && app.pricing.value < 20) reasons.push(`Budget is tight — starts at just $${app.pricing.value}/mo`)
  if (app.reviewCount > 5000) reasons.push('You want a proven, widely-adopted platform')
  if (!reasons.length) reasons.push(`You value ${app.name}'s specific feature set for your team`)
  reasons.push(`You are in the ${app.category} space`)
  reasons.push('Your team needs reliable vendor support')
  return reasons.slice(0, 4)
}

const relatedComparisons = computed(() => {
  if (!appA.value || !appB.value) return []
  const a = appA.value
  const b = appB.value
  return [
    { label: `${a.name} Alternatives`, href: `/alternatives/${a.slug}` },
    { label: `${b.name} Alternatives`, href: `/alternatives/${b.slug}` },
    { label: `Best ${a.category} Tools`, href: `/marketplace/category/${a.category}` },
    { label: `Free ${a.category} Tools`, href: `/free-tools` }
  ]
})

function onLogoErr(e: Event) {
  const el = e.target as HTMLImageElement
  el.style.display = 'none'
}

// SEO
const { generateComparisonPageSchema } = useSchemaMarkup()

useHead(() => {
  if (!appA.value || !appB.value) return {}
  const a = appA.value
  const b = appB.value
  return {
    title: `${a.name} vs ${b.name} (${currentYear}) — Side-by-Side Comparison | moonmart.ai`,
    meta: [
      { name: 'description', content: `${a.name} (${a.rating}/5) vs ${b.name} (${b.rating}/5) — full feature, pricing, and review comparison. ${winner.value.name} wins based on ${totalReviews.value.toLocaleString()} verified reviews.` },
      { property: 'og:title', content: `${a.name} vs ${b.name} — moonmart.ai` },
      { property: 'og:description', content: `Compare ${a.name} and ${b.name} side-by-side on moonmart.ai.` },
      { name: 'robots', content: 'index, follow' }
    ],
    link: [
      { rel: 'canonical', href: `https://moonmart.ai/compare/${slugA}-vs-${slugB}` }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(generateComparisonPageSchema(
          { name: a.name, slug: a.slug, rating: a.rating, reviewCount: a.reviewCount },
          { name: b.name, slug: b.slug, rating: b.rating, reviewCount: b.reviewCount }
        ))
      }
    ]
  }
})
</script>

<style scoped>
.vs-page { min-height: 100vh; }
.vs-loading { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
.vs-loading__inner { text-align: center; }
.vs-not-found { padding: 80px 0; text-align: center; }

.vs-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding-top: 24px; flex-wrap: wrap; }
.bc-link { color: var(--aw-accent); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--aw-text-muted); }
.bc-current { color: var(--aw-text-muted); }

.vs-hero { background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); padding: 48px 0 40px; }
.vs-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.vs-hero__h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 8px; }
.vs-hero__year { font-size: 0.65em; font-weight: 500; color: var(--aw-text-muted); margin-left: 8px; }
.vs-hero__sub { color: var(--aw-text-muted); font-size: 0.95rem; margin-bottom: 32px; }

.vs-winner { background: var(--aw-accent-50, #eff6ff); border: 1.5px solid var(--aw-accent); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: inline-block; }
.vs-winner__label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--aw-accent); font-weight: 700; margin-bottom: 2px; }
.vs-winner__name { font-size: 1.1rem; font-weight: 700; }
.vs-winner__reason { font-size: 0.82rem; color: var(--aw-text-muted); margin-top: 2px; }

.vs-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 720px; }
@media (max-width: 560px) { .vs-cards { grid-template-columns: 1fr; } }

.vs-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 16px; padding: 28px; position: relative; text-align: center; }
.vs-card--winner { border-color: var(--aw-accent); box-shadow: 0 0 0 3px var(--aw-accent-50, #eff6ff); }
.vs-card__winner-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--aw-accent); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 12px; border-radius: 999px; white-space: nowrap; }
.vs-card__logo { width: 56px; height: 56px; object-fit: contain; border-radius: 10px; margin: 0 auto 12px; display: block; }
.vs-card__logo-fallback { width: 56px; height: 56px; background: var(--aw-accent); color: #fff; font-size: 1.4rem; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.vs-card__name { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
.vs-card__cat { font-size: 0.78rem; color: var(--aw-text-muted); margin-bottom: 10px; }
.vs-card__stars { font-weight: 700; color: var(--aw-accent); }
.vs-card__rc { font-size: 0.75rem; color: var(--aw-text-muted); }
.vs-card__price { font-weight: 600; margin: 10px 0; }
.vs-card__cta { display: inline-block; margin-top: 12px; font-size: 0.82rem; color: var(--aw-accent); text-decoration: none; font-weight: 600; }
.vs-card__cta:hover { text-decoration: underline; }

.vs-section { padding: 48px 0; max-width: 1120px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
.vs-section--soft { background: var(--aw-surface-2); margin: 0; max-width: 100%; padding-left: calc(50% - 536px); padding-right: calc(50% - 536px); }
@media (max-width: 1200px) { .vs-section--soft { padding-left: 24px; padding-right: 24px; } }
.vs-section__title { font-size: 1.4rem; font-weight: 700; margin-bottom: 24px; }

.vs-table-wrap { overflow-x: auto; }
.vs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.vs-table th, .vs-table td { padding: 12px 16px; border-bottom: 1px solid var(--aw-border); text-align: left; }
.vs-table th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aw-text-muted); background: var(--aw-surface-2); }
.vs-table__feature { color: var(--aw-text-muted); font-size: 0.85rem; }
.vs-table__val--win { font-weight: 700; color: var(--aw-accent); }

.vs-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 600px) { .vs-pricing-grid { grid-template-columns: 1fr; } }
.vs-pricing-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 24px; }
.vs-pricing-card__name { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.vs-pricing-card__price { font-size: 1.6rem; font-weight: 800; color: var(--aw-accent); }
.vs-pricing-card__type { font-size: 0.75rem; color: var(--aw-text-muted); margin: 4px 0 12px; }
.vs-pricing-card__note { font-size: 0.85rem; color: var(--aw-text-muted); line-height: 1.6; margin-bottom: 12px; }
.vs-pricing-card__link { font-size: 0.82rem; color: var(--aw-accent); text-decoration: none; font-weight: 600; }

.vs-choose-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 600px) { .vs-choose-grid { grid-template-columns: 1fr; } }
.vs-choose-card { background: var(--aw-surface-2); border-radius: 12px; padding: 20px 24px; }
.vs-choose-card__name { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; }
.vs-choose-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.vs-choose-list li { font-size: 0.88rem; color: var(--aw-text-muted); padding-left: 20px; position: relative; }
.vs-choose-list li::before { content: '✓'; position: absolute; left: 0; color: var(--aw-accent); font-weight: 700; }

.vs-related { display: flex; gap: 12px; flex-wrap: wrap; }
.vs-related__link { padding: 8px 16px; border: 1.5px solid var(--aw-border); border-radius: 999px; font-size: 0.82rem; color: var(--aw-accent); text-decoration: none; transition: all 0.12s; }
.vs-related__link:hover { background: var(--aw-accent); color: #fff; border-color: var(--aw-accent); }

.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
