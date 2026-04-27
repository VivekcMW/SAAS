<template>
  <div class="budget-page">
    <nav class="bc container">
      <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
      <span class="bc__sep">›</span>
      <span class="bc__current">Tools Under $50/mo</span>
    </nav>

    <section class="budget-hero">
      <div class="container budget-hero__inner">
        <h1 class="budget-hero__h1">Best SaaS Tools Under $50/month ({{ currentYear }})</h1>
        <p class="budget-hero__sub">Affordable SaaS tools with full-featured paid plans under $50/month — ranked by verified buyer reviews on moonmart.ai.</p>
      </div>
    </section>

    <div v-if="pending" class="budget-loading container"><div class="spinner" /></div>

    <section v-else class="budget-grid container">
      <article v-for="app in apps" :key="app.id" class="budget-card">
        <img v-if="app.logo" :src="app.logo" :alt="app.name" class="budget-card__logo" @error="onLogoErr" />
        <div v-else class="budget-card__logo-fb">{{ app.name[0] }}</div>
        <div class="budget-card__info">
          <h2 class="budget-card__name">{{ app.name }}</h2>
          <span class="budget-card__cat">{{ app.category }}</span>
          <p class="budget-card__desc">{{ app.description }}</p>
          <div class="budget-card__meta">
            <span class="budget-card__rating">★ {{ app.rating.toFixed(1) }}</span>
            <span class="budget-card__price">From ${{ app.pricing.value }}/mo</span>
          </div>
        </div>
        <NuxtLink :to="`/marketplace/app/${app.slug}`" class="bw-btn bw-btn--primary bw-btn--sm">View →</NuxtLink>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
interface App {
  id: string; slug: string; name: string; description: string; logo?: string
  category: string; rating: number; reviewCount: number
  pricing: { type: string; value?: number }
}

const currentYear = new Date().getFullYear()
const { data, pending } = await useFetch<{ apps: App[] }>(
  '/api/apps?maxPrice=50&sortBy=rating&perPage=40', { key: 'budget-tools' }
)
const apps = computed(() => (data.value?.apps || []) as App[])
function onLogoErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }

useHead({
  title: `Best SaaS Tools Under $50/Month ${currentYear} | moonmart.ai`,
  meta: [
    { name: 'description', content: `Affordable SaaS tools with full-featured paid plans under $50/month. Ranked by verified buyer reviews in ${currentYear}.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/tools-under-50' }]
})
</script>

<style scoped>
.budget-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep, .bc__current { color: var(--aw-text-muted); }
.budget-hero { padding: 40px 0 28px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.budget-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.budget-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 8px; }
.budget-hero__sub { color: var(--aw-text-muted); max-width: 600px; }
.budget-loading { text-align: center; padding: 60px 0; }
.budget-grid { display: flex; flex-direction: column; gap: 14px; padding: 32px 0; }
.budget-card { display: flex; align-items: center; gap: 16px; background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 18px 24px; }
.budget-card__logo { width: 42px; height: 42px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
.budget-card__logo-fb { width: 42px; height: 42px; background: var(--aw-accent); color: #fff; font-size: 1rem; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.budget-card__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.budget-card__name { font-size: 0.95rem; font-weight: 700; }
.budget-card__cat { font-size: 0.7rem; color: var(--aw-text-muted); text-transform: uppercase; }
.budget-card__desc { font-size: 0.83rem; color: var(--aw-text-muted); line-height: 1.5; }
.budget-card__meta { display: flex; gap: 10px; align-items: center; font-size: 0.8rem; }
.budget-card__rating { color: var(--aw-accent); font-weight: 700; }
.budget-card__price { font-weight: 600; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
