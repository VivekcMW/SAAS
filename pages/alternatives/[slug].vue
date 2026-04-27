<template>
  <div class="alts-page">
    <div v-if="pending" class="alts-loading container">
      <div class="spinner" />
      <p>Finding alternatives…</p>
    </div>

    <div v-else-if="!app" class="alts-empty container">
      <h1>App not found</h1>
      <NuxtLink to="/marketplace">Browse Marketplace →</NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="alts-breadcrumb container" aria-label="Breadcrumb">
        <NuxtLink to="/" class="bc-link">moonmart.ai</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink to="/alternatives" class="bc-link">Alternatives</NuxtLink>
        <span class="bc-sep">›</span>
        <span class="bc-current">{{ app.name }} Alternatives</span>
      </nav>

      <!-- Hero -->
      <section class="alts-hero">
        <div class="alts-hero__inner container">
          <div class="alts-hero__eyebrow">
            <NuxtLink :to="`/marketplace/category/${app.category}`" class="alts-cat-chip">{{ categoryLabel }}</NuxtLink>
          </div>
          <h1 class="alts-hero__h1">Best {{ app.name }} Alternatives ({{ currentYear }})</h1>
          <p class="alts-hero__sub">
            {{ alternatives.length }} verified alternatives to {{ app.name }} — ranked by moonmart.ai rating, pricing, and real buyer reviews.
          </p>

          <!-- Filter chips -->
          <div class="alts-filters" aria-label="Filter alternatives">
            <button
              v-for="f in filters"
              :key="f.value"
              class="alts-filter"
              :class="{ 'alts-filter--active': activeFilter === f.value }"
              @click="activeFilter = f.value"
            >{{ f.label }}</button>
          </div>
        </div>
      </section>

      <!-- App being replaced -->
      <section class="alts-replacing container">
        <div class="alts-replacing__card">
          <img v-if="app.logo" :src="app.logo" :alt="app.name" class="alts-replacing__logo" @error="onLogoErr" />
          <div class="alts-replacing__info">
            <p class="alts-replacing__label">Replacing</p>
            <p class="alts-replacing__name">{{ app.name }}</p>
            <p class="alts-replacing__meta">{{ app.rating.toFixed(1) }}★ · {{ formatPrice(app) }}</p>
          </div>
          <NuxtLink :to="`/marketplace/app/${app.slug}`" class="alts-replacing__link">View {{ app.name }} →</NuxtLink>
        </div>
      </section>

      <!-- Alternatives list -->
      <section class="alts-list container">
        <div v-if="!filteredAlts.length" class="alts-empty-filter">
          <p>No alternatives match this filter. <button class="alts-reset" @click="activeFilter = 'all'">Show all</button></p>
        </div>

        <article
          v-for="(alt, i) in filteredAlts"
          :key="alt.id"
          class="alt-card"
        >
          <div class="alt-card__rank">{{ i + 1 }}</div>
          <img v-if="alt.logo" :src="alt.logo" :alt="alt.name" class="alt-card__logo" @error="onLogoErr" />
          <div v-else class="alt-card__logo-fallback">{{ alt.name[0] }}</div>
          <div class="alt-card__body">
            <div class="alt-card__name-row">
              <h2 class="alt-card__name">{{ alt.name }}</h2>
              <span v-if="alt.pricing.type === 'free'" class="alt-card__chip alt-card__chip--free">Free</span>
            </div>
            <p class="alt-card__desc">{{ alt.description }}</p>
            <div class="alt-card__meta">
              <span class="alt-card__rating">★ {{ alt.rating.toFixed(1) }}</span>
              <span class="alt-card__rc">{{ alt.reviewCount.toLocaleString() }} reviews</span>
              <span class="alt-card__price">{{ formatPrice(alt) }}</span>
            </div>
          </div>
          <div class="alt-card__actions">
            <NuxtLink :to="`/marketplace/app/${alt.slug}`" class="bw-btn bw-btn--primary bw-btn--sm">View →</NuxtLink>
            <NuxtLink :to="`/compare/${app.slug}-vs-${alt.slug}`" class="bw-btn bw-btn--ghost bw-btn--sm">Compare</NuxtLink>
          </div>
        </article>
      </section>

      <!-- FAQ -->
      <section class="alts-faq container">
        <h2 class="alts-faq__title">Frequently Asked Questions</h2>
        <div class="alts-faq__list">
          <details v-for="faq in faqs" :key="faq.q" class="alts-faq__item">
            <summary class="alts-faq__q">{{ faq.q }}</summary>
            <p class="alts-faq__a">{{ faq.a }}</p>
          </details>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface App {
  id: string; slug: string; name: string; description: string; logo?: string
  category: string; rating: number; reviewCount: number
  pricing: { type: string; value?: number; period?: string }
  tags?: string[]
}

const route = useRoute()
const slug = route.params.slug as string
const currentYear = new Date().getFullYear()

const { data: appData, pending: pendingApp } = await useFetch<App>(`/api/apps/${slug}`, { key: `alts-app-${slug}` })
const { data: simsData, pending: pendingSims } = await useFetch<{ similar: App[] }>(`/api/apps/${slug}/similar`, { key: `alts-sims-${slug}` })

const pending = computed(() => pendingApp.value || pendingSims.value)
const app = computed(() => appData.value as App | null)
const alternatives = computed(() => (simsData.value?.similar as App[] | undefined) || [])
const categoryLabel = computed(() => {
  const cat = app.value?.category || ''
  return cat.charAt(0).toUpperCase() + cat.slice(1).replaceAll('-', ' ')
})

const filters = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'top-rated', label: 'Top Rated' }
]
const activeFilter = ref('all')

const filteredAlts = computed(() => {
  const alts = alternatives.value
  if (activeFilter.value === 'free') return alts.filter(a => a.pricing.type === 'free')
  if (activeFilter.value === 'top-rated') return alts.filter(a => a.rating >= 4.5)
  return alts
})

function formatPrice(a: App): string {
  if (a.pricing.type === 'free') return 'Free'
  if (a.pricing.type === 'contact') return 'Custom'
  if (a.pricing.value) return `From $${a.pricing.value}/mo`
  return 'Paid'
}

function onLogoErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }

const faqs = computed(() => {
  if (!app.value) return []
  const name = app.value.name
  const topAlt = alternatives.value[0]?.name || 'comparable tools'
  return [
    { q: `What is the best free alternative to ${name}?`, a: `The top free alternatives to ${name} on moonmart.ai are ${alternatives.value.filter(a => a.pricing.type === 'free').map(a => a.name).join(', ') || topAlt}. Click the "Free" filter above to see only no-cost options.` },
    { q: `Why switch from ${name}?`, a: `Buyers switch from ${name} for various reasons including pricing, missing features, or better support from competitors. Compare options above to find the right fit for your team.` },
    { q: `How do I migrate from ${name}?`, a: `Most ${categoryLabel.value} tools offer data import from ${name}. Check each alternative's migration guide, or use Zapier / a CSV export to move your data safely.` },
    { q: `Is there an open-source alternative to ${name}?`, a: `Yes. Filter for free tools above — some are open-source. moonmart.ai lists both free-hosted and self-hosted alternatives across all categories.` }
  ]
})

// SEO
useHead(() => {
  if (!app.value) return {}
  const name = app.value.name
  const altNames = alternatives.value.slice(0, 3).map(a => a.name).join(', ')
  return {
    title: `Best ${name} Alternatives (${currentYear}) — Ranked by moonmart.ai`,
    meta: [
      { name: 'description', content: `${alternatives.value.length} top-rated alternatives to ${name}: ${altNames}. Compare features, pricing, and verified reviews on moonmart.ai.` },
      { property: 'og:title', content: `${name} Alternatives — moonmart.ai` },
      { property: 'og:description', content: `Top alternatives to ${name} ranked by verified buyers.` },
      { name: 'robots', content: 'index, follow' }
    ],
    link: [{ rel: 'canonical', href: `https://moonmart.ai/alternatives/${slug}` }],
    script: alternatives.value.length ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Best ${name} Alternatives`,
          url: `https://moonmart.ai/alternatives/${slug}`,
          numberOfItems: alternatives.value.length,
          itemListElement: alternatives.value.slice(0, 10).map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'SoftwareApplication', name: a.name, url: `https://moonmart.ai/marketplace/app/${a.slug}` }
          }))
        })
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.value.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        })
      }
    ] : []
  }
})
</script>

<style scoped>
.alts-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.alts-loading { text-align: center; padding: 80px 0; }
.alts-empty { padding: 80px 0; text-align: center; }

.alts-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding-top: 24px; flex-wrap: wrap; }
.bc-link { color: var(--aw-accent); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--aw-text-muted); }
.bc-current { color: var(--aw-text-muted); }

.alts-hero { padding: 40px 0 32px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.alts-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.alts-hero__eyebrow { margin-bottom: 12px; }
.alts-cat-chip { display: inline-block; padding: 4px 12px; background: var(--aw-accent-50, #eff6ff); color: var(--aw-accent); border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-decoration: none; }
.alts-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 10px; }
.alts-hero__sub { color: var(--aw-text-muted); font-size: 0.95rem; margin-bottom: 24px; max-width: 600px; }

.alts-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.alts-filter { padding: 6px 16px; border: 1.5px solid var(--aw-border); border-radius: 999px; font-size: 0.8rem; cursor: pointer; background: transparent; transition: all 0.12s; color: var(--aw-text-muted); }
.alts-filter:hover { border-color: var(--aw-accent); color: var(--aw-accent); }
.alts-filter--active { background: var(--aw-accent); border-color: var(--aw-accent); color: #fff; }

.alts-replacing { padding: 24px 0; max-width: 1120px; margin: 0 auto; }
.alts-replacing__card { display: flex; align-items: center; gap: 16px; background: var(--aw-surface-2); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 16px 24px; }
.alts-replacing__logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
.alts-replacing__info { flex: 1; }
.alts-replacing__label { font-size: 0.72rem; color: var(--aw-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.alts-replacing__name { font-weight: 700; font-size: 0.95rem; }
.alts-replacing__meta { font-size: 0.78rem; color: var(--aw-text-muted); }
.alts-replacing__link { font-size: 0.82rem; color: var(--aw-accent); text-decoration: none; font-weight: 600; white-space: nowrap; }

.alts-list { padding: 32px 0; display: flex; flex-direction: column; gap: 16px; max-width: 1120px; margin: 0 auto; }
.alts-empty-filter { text-align: center; padding: 40px 0; color: var(--aw-text-muted); }
.alts-reset { color: var(--aw-accent); background: none; border: none; cursor: pointer; font-size: inherit; text-decoration: underline; }

.alt-card { display: flex; align-items: flex-start; gap: 16px; background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 20px 24px; transition: box-shadow 0.12s; }
.alt-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.alt-card__rank { width: 28px; height: 28px; background: var(--aw-surface-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; color: var(--aw-text-muted); flex-shrink: 0; margin-top: 2px; }
.alt-card__logo { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; flex-shrink: 0; }
.alt-card__logo-fallback { width: 44px; height: 44px; background: var(--aw-accent); color: #fff; font-size: 1.1rem; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.alt-card__body { flex: 1; min-width: 0; }
.alt-card__name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.alt-card__name { font-size: 1rem; font-weight: 700; }
.alt-card__chip { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; }
.alt-card__chip--free { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); }
.alt-card__desc { font-size: 0.85rem; color: var(--aw-text-muted); line-height: 1.55; margin-bottom: 8px; }
.alt-card__meta { display: flex; gap: 12px; font-size: 0.78rem; align-items: center; flex-wrap: wrap; }
.alt-card__rating { color: var(--aw-accent); font-weight: 700; }
.alt-card__rc { color: var(--aw-text-muted); }
.alt-card__price { font-weight: 600; }
.alt-card__actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
@media (max-width: 600px) { .alt-card { flex-wrap: wrap; } .alt-card__actions { flex-direction: row; } }

.alts-faq { padding: 48px 0; max-width: 1120px; margin: 0 auto; }
.alts-faq__title { font-size: 1.4rem; font-weight: 700; margin-bottom: 20px; }
.alts-faq__list { display: flex; flex-direction: column; gap: 2px; }
.alts-faq__item { border: 1px solid var(--aw-border); border-radius: 10px; overflow: hidden; }
.alts-faq__q { padding: 16px 20px; font-weight: 600; font-size: 0.95rem; cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; }
.alts-faq__q::after { content: '▾'; color: var(--aw-text-muted); }
details[open] .alts-faq__q::after { content: '▴'; }
.alts-faq__a { padding: 0 20px 16px; font-size: 0.88rem; color: var(--aw-text-muted); line-height: 1.7; }

.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
