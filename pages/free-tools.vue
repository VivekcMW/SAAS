<template>
  <div class="free-page">
    <nav class="bc container" aria-label="Breadcrumb">
      <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
      <span class="bc__sep">›</span>
      <span class="bc__current">Free SaaS Tools {{ currentYear }}</span>
    </nav>

    <section class="free-hero">
      <div class="container free-hero__inner">
        <h1 class="free-hero__h1">Best Free SaaS Tools ({{ currentYear }})</h1>
        <p class="free-hero__sub">{{ total }}+ verified free SaaS tools with genuine free-forever plans — no credit card required.</p>
        <div class="free-hero__filter">
          <button v-for="f in catFilters" :key="f" class="free-chip" :class="{ 'free-chip--active': activeCategory === f }" @click="activeCategory = f">{{ f === 'all' ? 'All' : f }}</button>
        </div>
      </div>
    </section>

    <div v-if="pending" class="free-loading container"><div class="spinner" /></div>

    <section v-else class="free-grid container">
      <article v-for="app in filteredApps" :key="app.id" class="free-card">
        <img v-if="app.logo" :src="app.logo" :alt="app.name" class="free-card__logo" @error="onLogoErr" >
        <div v-else class="free-card__logo-fb">{{ app.name[0] }}</div>
        <h2 class="free-card__name">{{ app.name }}</h2>
        <span class="free-card__cat">{{ app.category }}</span>
        <p class="free-card__desc">{{ app.description }}</p>
        <div class="free-card__rating">★ {{ app.rating.toFixed(1) }} <span>({{ app.reviewCount }})</span></div>
        <NuxtLink :to="`/marketplace/app/${app.slug}`" class="bw-btn bw-btn--primary bw-btn--sm free-card__cta">View free tool →</NuxtLink>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface App {
  id: string; slug: string; name: string; description: string; logo?: string
  category: string; rating: number; reviewCount: number
  pricing: { type: string; value?: number }
}

const currentYear = new Date().getFullYear()
const { data, pending } = await useFetch<{ apps: App[]; total: number }>(
  '/api/apps?pricing=free&sortBy=rating&perPage=48', { key: 'free-tools' }
)
const apps = computed(() => (data.value?.apps || []) as App[])
const total = computed(() => data.value?.total || apps.value.length)
const activeCategory = ref('all')
const catFilters = computed(() => ['all', ...[...new Set(apps.value.map(a => a.category))].slice(0, 7)])
const filteredApps = computed(() => activeCategory.value === 'all' ? apps.value : apps.value.filter(a => a.category === activeCategory.value))
function onLogoErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }

useHead({
  title: `Best Free SaaS Tools ${currentYear} — No Credit Card Required | moonmart.ai`,
  meta: [
    { name: 'description', content: `${total.value}+ free SaaS tools ranked by verified buyer reviews. Genuine free-forever plans, no trials. Updated ${currentYear}.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/free-tools' }]
})
</script>

<style scoped>
.free-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep { color: var(--aw-text-muted); }
.bc__current { color: var(--aw-text-muted); }
.free-hero { padding: 40px 0 28px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.free-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.free-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 8px; }
.free-hero__sub { color: var(--aw-text-muted); font-size: 0.95rem; margin-bottom: 20px; }
.free-hero__filter { display: flex; gap: 8px; flex-wrap: wrap; }
.free-chip { padding: 5px 14px; border: 1.5px solid var(--aw-border); border-radius: 999px; font-size: 0.78rem; cursor: pointer; background: none; color: var(--aw-text-muted); }
.free-chip:hover, .free-chip--active { border-color: var(--aw-accent); background: var(--aw-accent); color: #fff; }
.free-loading { text-align: center; padding: 60px 0; }
.free-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; padding: 32px 0; }
.free-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.free-card__logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
.free-card__logo-fb { width: 40px; height: 40px; background: var(--aw-accent); color: #fff; font-size: 1rem; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.free-card__name { font-size: 0.95rem; font-weight: 700; }
.free-card__cat { font-size: 0.7rem; color: var(--aw-text-muted); text-transform: uppercase; }
.free-card__desc { font-size: 0.83rem; color: var(--aw-text-muted); line-height: 1.5; flex: 1; }
.free-card__rating { font-size: 0.8rem; color: var(--aw-accent); font-weight: 600; }
.free-card__rating span { color: var(--aw-text-muted); font-weight: 400; }
.free-card__cta { margin-top: 4px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
