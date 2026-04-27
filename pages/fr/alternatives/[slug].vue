<template>
  <div class="alts-page">
    <div v-if="pending" class="alts-loading container"><div class="spinner" /></div>
    <div v-else-if="!app" class="alts-empty container">
      <h1>Application non trouvée</h1>
      <NuxtLink to="/marketplace">Parcourir →</NuxtLink>
    </div>
    <template v-else>
      <nav class="alts-breadcrumb container">
        <NuxtLink to="/fr" class="bc-link">moonmart.ai</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink to="/fr/alternatives" class="bc-link">Alternatives</NuxtLink>
        <span class="bc-sep">›</span>
        <span class="bc-current">Alternatives à {{ app.name }}</span>
      </nav>

      <section class="alts-hero">
        <div class="container alts-hero__inner">
          <h1 class="alts-hero__h1">Meilleures alternatives à {{ app.name }} ({{ currentYear }})</h1>
          <p class="alts-hero__sub">{{ alternatives.length }} alternatives vérifiées à {{ app.name }} — classées par note moonmart.ai et avis d'acheteurs réels.</p>
        </div>
      </section>

      <section class="alts-list container">
        <article v-for="(alt, i) in alternatives" :key="alt.id" class="alt-card">
          <div class="alt-card__rank">{{ i + 1 }}</div>
          <div class="alt-card__logo-fb">{{ alt.name[0] }}</div>
          <div class="alt-card__body">
            <h2 class="alt-card__name">{{ alt.name }}</h2>
            <p class="alt-card__desc">{{ alt.description }}</p>
            <div class="alt-card__meta">
              <span class="alt-card__rating">★ {{ alt.rating.toFixed(1) }}</span>
              <span class="alt-card__price">{{ alt.pricing.type === 'free' ? 'Gratuit' : alt.pricing.value ? `À partir de $${alt.pricing.value}/mois` : 'Payant' }}</span>
            </div>
          </div>
          <NuxtLink :to="`/marketplace/app/${alt.slug}`" class="bw-btn bw-btn--primary bw-btn--sm">Voir →</NuxtLink>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
interface App { id: string; slug: string; name: string; description: string; rating: number; reviewCount: number; pricing: { type: string; value?: number } }
const route = useRoute()
const slug = route.params.slug as string
const currentYear = new Date().getFullYear()

const [{ data: appData, pending: pApp }, { data: simsData, pending: pSims }] = await Promise.all([
  useFetch<App>(`/api/apps/${slug}`, { key: `fr-alts-app-${slug}` }),
  useFetch<{ similar: App[] }>(`/api/apps/${slug}/similar`, { key: `fr-alts-sims-${slug}` })
])
const pending = computed(() => pApp.value || pSims.value)
const app = computed(() => appData.value as App | null)
const alternatives = computed(() => (simsData.value?.similar as App[] | undefined) || [])

useHead(() => ({
  title: `Meilleures alternatives à ${app.value?.name || ''} (${currentYear}) | moonmart.ai`,
  meta: [
    { name: 'description', content: `${alternatives.value.length} alternatives vérifiées à ${app.value?.name} — comparées par fonctionnalités, prix et avis sur moonmart.ai.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: `https://moonmart.ai/fr/alternatives/${slug}` },
    { rel: 'alternate', hreflang: 'fr', href: `https://moonmart.ai/fr/alternatives/${slug}` },
    { rel: 'alternate', hreflang: 'en', href: `https://moonmart.ai/alternatives/${slug}` }
  ]
}))
</script>

<style scoped>
.alts-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.alts-loading, .alts-empty { text-align: center; padding: 80px 0; }
.alts-breadcrumb { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; flex-wrap: wrap; }
.bc-link { color: var(--aw-accent); text-decoration: none; }
.bc-sep, .bc-current { color: var(--aw-text-muted); }
.alts-hero { padding: 40px 0 24px; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.alts-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.alts-hero__h1 { font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 800; margin-bottom: 8px; }
.alts-hero__sub { color: var(--aw-text-muted); font-size: 0.92rem; }
.alts-list { display: flex; flex-direction: column; gap: 14px; padding: 28px 0; }
.alt-card { display: flex; align-items: center; gap: 14px; background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 18px 20px; }
.alt-card__rank { width: 26px; height: 26px; background: var(--aw-surface-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--aw-text-muted); flex-shrink: 0; }
.alt-card__logo-fb { width: 40px; height: 40px; background: var(--aw-accent); color: #fff; font-size: 1rem; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.alt-card__body { flex: 1; min-width: 0; }
.alt-card__name { font-size: 0.95rem; font-weight: 700; margin-bottom: 3px; }
.alt-card__desc { font-size: 0.83rem; color: var(--aw-text-muted); margin-bottom: 6px; line-height: 1.5; }
.alt-card__meta { display: flex; gap: 10px; font-size: 0.78rem; }
.alt-card__rating { color: var(--aw-accent); font-weight: 700; }
.alt-card__price { font-weight: 600; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
