<template>
  <div class="vs-page">
    <div v-if="pending" class="vs-loading container"><div class="spinner" /></div>
    <div v-else-if="!appA || !appB" class="vs-empty container">
      <h1>Comparación no encontrada</h1>
      <NuxtLink to="/marketplace">Explorar →</NuxtLink>
    </div>
    <template v-else>
      <nav class="vs-breadcrumb container">
        <NuxtLink to="/es" class="bc-link">moonmart.ai</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink to="/es/comparar" class="bc-link">Comparar</NuxtLink>
        <span class="bc-sep">›</span>
        <span class="bc-current">{{ appA.name }} vs {{ appB.name }}</span>
      </nav>

      <section class="vs-hero">
        <div class="container vs-hero__inner">
          <h1 class="vs-hero__h1">{{ appA.name }} vs {{ appB.name }} ({{ currentYear }}) — Comparativa</h1>
          <p class="vs-hero__sub">Comparación completa basada en {{ totalReviews.toLocaleString('es-ES') }} reseñas verificadas de compradores en moonmart.ai.</p>

          <div class="vs-winner">
            <div class="vs-winner__label">Veredicto moonmart.ai</div>
            <div class="vs-winner__name">{{ winner.name }} gana</div>
            <div class="vs-winner__reason">{{ winner.reason }}</div>
          </div>

          <div class="vs-cards">
            <div v-for="app in [appA, appB]" :key="app.id" class="vs-card" :class="{ 'vs-card--winner': app.id === winner.id }">
              <div v-if="app.id === winner.id" class="vs-card__badge">Ganador</div>
              <div class="vs-card__logo-fb">{{ app.name[0] }}</div>
              <h2 class="vs-card__name">{{ app.name }}</h2>
              <div class="vs-card__rating">★ {{ app.rating.toFixed(1) }}</div>
              <NuxtLink :to="`/marketplace/app/${app.slug}`" class="vs-card__cta">Ver detalles →</NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
interface App { id: string; slug: string; name: string; category: string; rating: number; reviewCount: number; pricing: { type: string } }
const route = useRoute()
const slug = route.params.slug as string
const slugParts = slug.split('-vs-')
const slugA = slugParts[0]
const slugB = slugParts.slice(1).join('-vs-')
const currentYear = new Date().getFullYear()

const [{ data: dataA, pending: pA }, { data: dataB, pending: pB }] = await Promise.all([
  useFetch<App>(`/api/apps/${slugA}`, { key: `es-cmp-a-${slugA}` }),
  useFetch<App>(`/api/apps/${slugB}`, { key: `es-cmp-b-${slugB}` })
])
const pending = computed(() => pA.value || pB.value)
const appA = computed(() => dataA.value as App | null)
const appB = computed(() => dataB.value as App | null)
const totalReviews = computed(() => (appA.value?.reviewCount ?? 0) + (appB.value?.reviewCount ?? 0))
const winner = computed(() => {
  if (!appA.value || !appB.value) return { id: '', name: '', reason: '' }
  const top = appA.value.rating >= appB.value.rating ? appA.value : appB.value
  const other = top.id === appA.value.id ? appB.value : appA.value
  return { id: top.id, name: top.name, reason: `Mejor puntuación (${top.rating.toFixed(1)} vs ${other.rating.toFixed(1)})` }
})

useHead(() => ({
  title: `${appA.value?.name || ''} vs ${appB.value?.name || ''} (${currentYear}) — Comparativa de Software | moonmart.ai`,
  meta: [
    { name: 'description', content: `${appA.value?.name} contra ${appB.value?.name}: comparativa completa en moonmart.ai. Características, precios y reseñas verificadas.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: `https://moonmart.ai/es/comparar/${slugA}-vs-${slugB}` },
    { rel: 'alternate', hreflang: 'es', href: `https://moonmart.ai/es/comparar/${slugA}-vs-${slugB}` },
    { rel: 'alternate', hreflang: 'en', href: `https://moonmart.ai/compare/${slugA}-vs-${slugB}` }
  ]
}))
</script>

<style scoped>
.vs-page { min-height: 100vh; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.vs-loading, .vs-empty { text-align: center; padding: 80px 0; }
.vs-breadcrumb { display: flex; gap: 8px; align-items: center; font-size: 0.82rem; padding-top: 24px; flex-wrap: wrap; }
.bc-link { color: var(--aw-accent); text-decoration: none; }
.bc-sep, .bc-current { color: var(--aw-text-muted); }
.vs-hero { padding: 40px 0; background: var(--aw-surface-2); border-bottom: 1px solid var(--aw-border); }
.vs-hero__inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.vs-hero__h1 { font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 800; margin-bottom: 8px; }
.vs-hero__sub { color: var(--aw-text-muted); margin-bottom: 28px; font-size: 0.92rem; }
.vs-winner { background: var(--aw-accent-50, #eff6ff); border: 1.5px solid var(--aw-accent); border-radius: 10px; padding: 14px 20px; display: inline-block; margin-bottom: 24px; }
.vs-winner__label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--aw-accent); font-weight: 700; }
.vs-winner__name { font-size: 1rem; font-weight: 700; }
.vs-winner__reason { font-size: 0.8rem; color: var(--aw-text-muted); }
.vs-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 580px; }
.vs-card { background: var(--aw-surface-1, #fff); border: 1.5px solid var(--aw-border); border-radius: 12px; padding: 20px; text-align: center; position: relative; }
.vs-card--winner { border-color: var(--aw-accent); }
.vs-card__badge { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: var(--aw-accent); color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 10px; border-radius: 999px; white-space: nowrap; }
.vs-card__logo-fb { width: 44px; height: 44px; background: var(--aw-accent); color: #fff; font-size: 1.2rem; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.vs-card__name { font-weight: 700; margin-bottom: 4px; }
.vs-card__rating { color: var(--aw-accent); font-weight: 700; margin-bottom: 10px; }
.vs-card__cta { font-size: 0.8rem; color: var(--aw-accent); text-decoration: none; font-weight: 600; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--aw-border); border-top-color: var(--aw-accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
