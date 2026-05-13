<script setup lang="ts">
import { computed, onMounted } from 'vue'

definePageMeta({
  layout: false
})

interface AppData {
  id: string
  slug?: string
  name: string
  logo: string
  provider?: string
  description?: string
  rating?: number
  reviewCount?: number
  pricing?: { type?: string, value?: number, period?: string }
  category?: string
}

const route = useRoute()
const config = useRuntimeConfig()
const appId = computed(() => (route.params.id as string) || '')

const { data: app, error } = await useFetch<AppData>(`/api/apps/${appId.value}`, {
  key: `embed-app-${appId.value}`
})

const priceLabel = computed(() => {
  const p = app.value?.pricing
  if (!p || p.type === 'contact') return 'Custom'
  if (p.type === 'free') return 'Free'
  if (p.value) {
    const period = p.period ? `/${p.period}` : ''
    return `$${p.value}${period}`
  }
  return 'Paid'
})

const detailsUrl = computed(() => {
  const base = (config.public?.siteUrl as string) || 'https://moonmart.ai'
  return `${base}/marketplace/app/${app.value?.slug || appId.value}`
})

useHead({
  title: app.value ? `${app.value.name} | Moonmart` : 'Moonmart',
  meta: [
    { name: 'robots', content: 'noindex, follow' }
  ]
})

// Send resize message to parent so embed.js can adjust iframe height
onMounted(() => {
  const slug = app.value?.slug || appId.value
  const sendHeight = () => {
    const h = document.body.scrollHeight
    window.parent.postMessage(
      JSON.stringify({ type: 'mm-embed-resize', slug, height: h }),
      '*'
    )
  }
  // Send after paint and again after a short delay (fonts/images)
  requestAnimationFrame(sendHeight)
  setTimeout(sendHeight, 600)
})
</script>

<template>
  <div class="embed-shell">
    <div v-if="error || !app" class="embed-empty">
      <p>App not found.</p>
      <a href="https://saasworld.app/marketplace" target="_blank" rel="noopener">Browse Moonmart</a>
    </div>

    <article v-else class="embed-card">
      <header class="embed-head">
        <div class="embed-logo">
          <img :src="app.logo" :alt="`${app.name} logo`" >
        </div>
        <div class="embed-meta">
          <h1 class="embed-name">{{ app.name }}</h1>
          <p v-if="app.provider" class="embed-provider">by {{ app.provider }}</p>
        </div>
        <a class="embed-brand" href="https://saasworld.app" target="_blank" rel="noopener">
          Moonmart
        </a>
      </header>

      <p v-if="app.description" class="embed-desc">{{ app.description }}</p>

      <div class="embed-stats">
        <div v-if="app.rating" class="stat">
          <span class="stat-icon">★</span>
          <span class="stat-value">{{ app.rating.toFixed(1) }}</span>
          <span v-if="app.reviewCount" class="stat-label">({{ app.reviewCount.toLocaleString() }} reviews)</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ priceLabel }}</span>
          <span class="stat-label">starting price</span>
        </div>
        <div v-if="app.category" class="stat">
          <span class="stat-value cap">{{ app.category.replaceAll('-', ' ') }}</span>
          <span class="stat-label">category</span>
        </div>
      </div>

      <footer class="embed-footer">
        <a class="embed-cta" :href="detailsUrl" target="_blank" rel="noopener">
          View on Moonmart
        </a>
        <span class="embed-fineprint">Embed by Moonmart</span>
      </footer>
    </article>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.embed-shell {
  font-family: var(--font-primary, 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif);
  padding: 12px;
  background: transparent;
}

.embed-empty {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}
.embed-empty a { color: #ff8838; text-decoration: none; font-weight: 600; }

.embed-card {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}

.embed-head { display: flex; align-items: center; gap: 12px; }
.embed-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}
.embed-logo img { width: 100%; height: 100%; object-fit: cover; }

.embed-meta { flex: 1; min-width: 0; }
.embed-name { margin: 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.2; }
.embed-provider { margin: 2px 0 0; font-size: 12px; color: #6b7280; }

.embed-brand {
  font-size: 11px;
  font-weight: 700;
  color: #ff8838;
  text-decoration: none;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.embed-desc {
  margin: 0;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.embed-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #fffaf5;
  border-radius: 8px;
  border: 0.5px solid #ffedd5;
}
.stat { display: flex; align-items: baseline; gap: 4px; font-size: 12px; }
.stat-icon { color: #f59e0b; font-size: 13px; }
.stat-value { font-weight: 700; color: #111827; font-size: 13px; }
.stat-label { color: #6b7280; }
.cap { text-transform: capitalize; }

.embed-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.embed-cta {
  display: inline-flex;
  align-items: center;
  background: #ff8838;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 150ms ease;
}
.embed-cta:hover { background: #e57320; }

.embed-fineprint { font-size: 11px; color: #9ca3af; }
</style>
