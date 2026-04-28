<template>
  <div class="oss-page">
    <nav class="bc container" aria-label="Breadcrumb">
      <NuxtLink to="/" class="bc__link">moonmart.ai</NuxtLink>
      <span class="bc__sep">›</span>
      <span class="bc__current">Open Source Alternatives</span>
    </nav>

    <section class="oss-hero">
      <div class="container oss-hero__inner">
        <h1 class="oss-hero__h1">Best Open Source Software Alternatives ({{ currentYear }})</h1>
        <p class="oss-hero__sub">Top-rated open source alternatives to commercial SaaS tools — self-host or use managed. Ranked by moonmart.ai verified reviews.</p>
      </div>
    </section>

    <div v-if="pending" class="oss-loading container"><div class="spinner" /></div>

    <section v-else class="oss-grid container">
      <article v-for="app in apps" :key="app.id" class="oss-card">
        <img v-if="app.logo" :src="app.logo" :alt="app.name" class="oss-card__logo" @error="onLogoErr" />
        <div v-else class="oss-card__logo-fb">{{ app.name[0] }}</div>
        <div class="oss-card__info">
          <h2 class="oss-card__name">{{ app.name }}</h2>
          <span class="oss-card__cat">{{ app.category }}</span>
          <p class="oss-card__desc">{{ app.description }}</p>
          <div class="oss-card__meta">
            <span class="oss-card__rating"><span class="oss-star" aria-hidden="true">★</span> {{ app.rating.toFixed(1) }}</span>
            <span class="oss-card__badge">Open Source</span>
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
  pricing: { type: string }
  tags?: string[]
}

const currentYear = new Date().getFullYear()
const { data, pending } = await useFetch<{ apps: App[] }>(
  '/api/apps?tags=open-source&sortBy=rating&perPage=40', { key: 'oss-alts' }
)
const apps = computed(() => (data.value?.apps || []) as App[])
function onLogoErr(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }

useHead({
  title: `Best Open Source Software Alternatives ${currentYear} | moonmart.ai`,
  meta: [
    { name: 'description', content: `Top open source alternatives to popular SaaS tools. Self-host or use managed versions. Ranked by ${currentYear} verified buyer reviews on moonmart.ai.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://moonmart.ai/open-source-alternatives' }]
})
</script>

<style scoped>
.oss-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.bc { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; }
.bc__link { color: var(--aw-accent); text-decoration: none; }
.bc__sep { color: var(--aw-text-muted); }
.bc__current { color: var(--aw-text-muted); }
.oss-hero { padding: 40px 0 28px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.oss-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.oss-hero__h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin-bottom: 8px; }
.oss-hero__sub { color: var(--aw-text-muted); max-width: 600px; }
.oss-loading { text-align: center; padding: 60px 0; }
.oss-grid { display: flex; flex-direction: column; gap: 16px; padding: 32px 0; }
.oss-card { display: flex; align-items: center; gap: 16px; background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 14px; padding: 20px 24px; }
.oss-card__logo { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; flex-shrink: 0; }
.oss-card__logo-fb { width: 44px; height: 44px; background: var(--aw-accent); color: #fff; font-size: 1.1rem; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.oss-card__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.oss-card__name { font-size: 0.95rem; font-weight: 700; }
.oss-card__cat { font-size: 0.7rem; color: var(--aw-text-muted); text-transform: uppercase; }
.oss-card__desc { font-size: 0.83rem; color: var(--aw-text-muted); line-height: 1.5; }
.oss-card__meta { display: flex; gap: 10px; align-items: center; }
.oss-card__rating { font-size: 0.8rem; color: var(--mm-gold); font-weight: 700; }
.oss-star { color: var(--mm-gold); }
.oss-card__badge { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
