<script setup lang="ts">
import { computed } from 'vue'
import type { MarketplaceApp } from '~/server/utils/apps'

interface CompareEntry {
  requestedId: string
  app: MarketplaceApp | null
}
interface CompareResponse {
  count: number
  apps: CompareEntry[]
}

const route = useRoute()
const router = useRouter()

const ids = computed(() => {
  const raw = (route.query.apps as string | undefined) || ''
  return raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4)
})

const queryString = computed(() => ids.value.join(','))

const { data, pending, error, refresh } = await useFetch<CompareResponse>('/api/apps/compare', {
  query: { ids: queryString },
  key: `compare-${queryString.value}`,
  watch: [queryString]
})

const entries = computed(() => data.value?.apps || [])

function removeApp(id: string) {
  const next = ids.value.filter(x => x !== id)
  router.replace({ query: { ...route.query, apps: next.join(',') || undefined } })
}

const newAppId = ref('')
function addApp() {
  const id = newAppId.value.trim()
  if (!id) return
  if (ids.value.includes(id)) {
    newAppId.value = ''
    return
  }
  if (ids.value.length >= 4) return
  router.replace({ query: { ...route.query, apps: [...ids.value, id].join(',') } })
  newAppId.value = ''
}

// --- Comparison row helpers ---
function priceLabel(app: MarketplaceApp): string {
  const p = app.pricing
  if (p.type === 'free') return 'Free'
  if (p.type === 'contact') return 'Custom (contact)'
  if (p.value) {
    const period = p.period ? `/${p.period}` : ''
    return `$${p.value}${period}`
  }
  return 'Paid'
}

function pricingTone(app: MarketplaceApp): 'good' | 'warn' | 'neutral' {
  if (app.pricing.type === 'free') return 'good'
  if (app.pricing.type === 'contact') return 'warn'
  return 'neutral'
}

function badgeList(app: MarketplaceApp): string[] {
  const b: string[] = []
  if (app.featured) b.push("Editor's Pick")
  if (app.trending) b.push('Trending')
  if (app.sponsored) b.push('Sponsored')
  return b
}

interface Row {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: (app: MarketplaceApp) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  highlight?: (apps: MarketplaceApp[]) => any
}

function freeTrialLabel(app: MarketplaceApp): string {
  if (app.pricing.type === 'free') return 'Free tier'
  if (app.pricing.type === 'trial') return 'Free trial'
  return 'Paid only'
}

function freeTrialTone(app: MarketplaceApp): 'good' | 'neutral' | 'warn' {
  if (app.pricing.type === 'free') return 'good'
  if (app.pricing.type === 'trial') return 'neutral'
  return 'warn'
}

const rows: Row[] = [
  { id: 'price', label: 'Starting price', value: a => priceLabel(a) },
  { id: 'rating', label: 'Rating', value: a => `${a.rating.toFixed(1)} ★ (${a.reviewCount.toLocaleString()})` },
  { id: 'category', label: 'Category', value: a => (a.category || '—').replaceAll('-', ' ') },
  { id: 'tags', label: 'Best for', value: a => (a.tags && a.tags.length ? a.tags : ['—']) },
  { id: 'free-trial', label: 'Free / Trial', value: a => freeTrialLabel(a) },
  { id: 'badges', label: 'Highlights', value: a => badgeList(a) }
]

// Best-rated highlighter
const bestRating = computed(() => {
  const apps = entries.value.map(e => e.app).filter(Boolean) as MarketplaceApp[]
  if (apps.length === 0) return null
  return Math.max(...apps.map(a => a.rating))
})

const cheapest = computed(() => {
  const apps = entries.value.map(e => e.app).filter(Boolean) as MarketplaceApp[]
  const paid = apps.filter(a => typeof a.pricing.value === 'number')
  if (paid.length === 0) return null
  return Math.min(...paid.map(a => a.pricing.value as number))
})

useHead({
  title: 'Compare SaaS Tools | SaaSWorld',
  meta: [
    { name: 'description', content: 'Side-by-side comparison of SaaS tools — pricing, ratings, features, and more.' }
  ]
})
</script>

<template>
  <div class="compare-page">
    <div class="container">
      <!-- Header -->
      <header class="cmp-header">
        <NuxtLink to="/marketplace" class="back-link">
          <Icon name="heroicons:arrow-left" />
          Back to Marketplace
        </NuxtLink>
        <h1 class="cmp-title">Compare {{ entries.length }} apps</h1>
        <p class="cmp-sub">Side-by-side comparison — pricing, ratings, and key facts.</p>

        <div class="cmp-add">
          <input
            v-model="newAppId"
            type="text"
            class="add-input"
            placeholder="Add another app by id or slug (e.g. app-002)"
            :disabled="ids.length >= 4"
            @keydown.enter.prevent="addApp"
          />
          <button class="add-btn" :disabled="!newAppId.trim() || ids.length >= 4" @click="addApp">
            <Icon name="heroicons:plus" />
            Add
          </button>
          <span v-if="ids.length >= 4" class="add-hint">Maximum 4 apps</span>
        </div>
      </header>

      <!-- Loading / Empty / Error -->
      <div v-if="pending" class="state-box">
        <div class="spinner"></div>
        <p>Loading comparison…</p>
      </div>
      <div v-else-if="error || entries.length === 0" class="state-box">
        <Icon name="heroicons:squares-plus" class="empty-icon" />
        <h2>Nothing to compare yet</h2>
        <p>Add apps from the marketplace to start comparing.</p>
        <Button variant="primary" to="/marketplace">Browse Marketplace</Button>
      </div>

      <!-- Comparison grid -->
      <div v-else class="cmp-table-wrap">
        <div
          class="cmp-grid"
          :style="{ gridTemplateColumns: `200px repeat(${entries.length}, minmax(220px, 1fr))` }"
        >
          <!-- Empty top-left cell -->
          <div class="grid-cell head-cell empty-cell"></div>

          <!-- App headers -->
          <div
            v-for="entry in entries"
            :key="`head-${entry.requestedId}`"
            class="grid-cell head-cell app-head"
          >
            <button
              class="remove-btn"
              :title="`Remove ${entry.app?.name || entry.requestedId}`"
              @click="removeApp(entry.requestedId)"
            >
              <Icon name="heroicons:x-mark" />
            </button>
            <template v-if="entry.app">
              <div class="head-logo">
                <img :src="entry.app.logo" :alt="`${entry.app.name} logo`" />
              </div>
              <h3 class="head-name">
                <NuxtLink :to="`/marketplace/app/${entry.app.slug || entry.app.id}`">
                  {{ entry.app.name }}
                </NuxtLink>
              </h3>
              <p class="head-provider">by {{ entry.app.provider }}</p>
              <div class="head-cta">
                <Button variant="primary" size="sm">Try Free</Button>
                <NuxtLink :to="`/marketplace/app/${entry.app.slug || entry.app.id}`" class="head-link">
                  View details →
                </NuxtLink>
              </div>
            </template>
            <template v-else>
              <div class="head-missing">
                <Icon name="heroicons:exclamation-circle" />
                <p>App "{{ entry.requestedId }}" not found</p>
              </div>
            </template>
          </div>

          <!-- Description row -->
          <div class="grid-cell row-label">Summary</div>
          <div
            v-for="entry in entries"
            :key="`desc-${entry.requestedId}`"
            class="grid-cell row-value"
          >
            <p v-if="entry.app" class="cell-text">{{ entry.app.description }}</p>
            <span v-else class="cell-muted">—</span>
          </div>

          <!-- Generated rows -->
          <template v-for="row in rows" :key="row.id">
            <div class="grid-cell row-label">{{ row.label }}</div>
            <div
              v-for="entry in entries"
              :key="`${row.id}-${entry.requestedId}`"
              class="grid-cell row-value"
            >
              <template v-if="entry.app">
                <!-- Price highlight -->
                <span
                  v-if="row.id === 'price'"
                  class="value-pill"
                  :class="`tone-${pricingTone(entry.app)}`"
                >
                  {{ priceLabel(entry.app) }}
                  <span
                    v-if="cheapest !== null && entry.app.pricing.value === cheapest"
                    class="badge-best"
                  >Cheapest</span>
                </span>

                <!-- Rating with star -->
                <span v-else-if="row.id === 'rating'" class="rating-cell">
                  <Icon name="heroicons:star-solid" class="star" />
                  {{ entry.app.rating.toFixed(1) }}
                  <span class="rating-count">({{ entry.app.reviewCount.toLocaleString() }})</span>
                  <span
                    v-if="bestRating !== null && entry.app.rating === bestRating"
                    class="badge-best"
                  >Top rated</span>
                </span>

                <!-- Tag chips -->
                <div v-else-if="row.id === 'tags'" class="chip-row">
                  <Tag v-for="t in entry.app.tags?.length ? entry.app.tags : ['—']" :key="t" size="sm">
                    {{ t }}
                  </Tag>
                </div>

                <!-- Badge chips -->
                <div v-else-if="row.id === 'badges'" class="chip-row">
                  <template v-if="badgeList(entry.app).length">
                    <Badge v-for="b in badgeList(entry.app)" :key="b" variant="sponsored">{{ b }}</Badge>
                  </template>
                  <span v-else class="cell-muted">—</span>
                </div>

                <!-- Free / trial -->
                <span
                  v-else-if="row.id === 'free-trial'"
                  class="value-pill"
                  :class="`tone-${freeTrialTone(entry.app)}`"
                >
                  {{ row.value(entry.app) }}
                </span>

                <!-- Default text -->
                <span v-else class="cell-text">{{ row.value(entry.app) }}</span>
              </template>
              <span v-else class="cell-muted">—</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Sponsored slot: encourage adding another option to the comparison -->
      <div v-if="entries.length && entries.length < 4" class="cmp-sponsored">
        <h3 class="cmp-sponsored-head">Consider adding another option</h3>
        <SponsoredSlot
          placement="compare"
          variant="banner"
          :exclude="ids"
          label="Sponsored suggestion"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 32px 0 60px;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.cmp-sponsored { margin-top: 24px; }
.cmp-sponsored-head {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cmp-header { margin-bottom: 24px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 13px;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 150ms ease;
}
.back-link:hover { color: #ff8838; }

.cmp-title { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px; }
.cmp-sub { font-size: 14px; color: #6b7280; margin: 0 0 16px; }

.cmp-add {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  padding: 10px;
  border-radius: 10px;
}

.add-input {
  flex: 1;
  min-width: 220px;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: border-color 150ms ease;
}
.add-input:focus { border-color: #ff8838; }
.add-input:disabled { background: #f9fafb; cursor: not-allowed; }

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ff8838;
  color: #ffffff;
  border: 0;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
}
.add-btn:hover:not(:disabled) { background: #e57320; }
.add-btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

.add-hint { font-size: 12px; color: #6b7280; }

/* States */
.state-box {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.spinner { width: 32px; height: 32px; border: 2px solid #e5e7eb; border-top-color: #ff8838; border-radius: 50%; animation: spin 800ms linear infinite; }
.empty-icon { width: 48px; height: 48px; color: #9ca3af; }
.state-box h2 { font-size: 18px; color: #111827; margin: 0; }
.state-box p { font-size: 14px; color: #6b7280; margin: 0 0 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Grid */
.cmp-table-wrap {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  overflow-x: auto;
}

.cmp-grid {
  display: grid;
  gap: 0;
  min-width: 600px;
}

.grid-cell {
  padding: 14px 16px;
  border-bottom: 0.5px solid #f3f4f6;
  border-right: 0.5px solid #f3f4f6;
  font-size: 13px;
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.grid-cell:last-child { border-right: 0; }

/* Row labels (left column) */
.row-label {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  align-self: stretch;
  justify-content: center;
  position: sticky;
  left: 0;
  z-index: 1;
}

/* Header cells */
.head-cell {
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 0.5px solid #e5e7eb;
}

.app-head {
  position: relative;
  padding: 18px 16px;
  align-items: flex-start;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: 0;
  color: #9ca3af;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease, color 150ms ease;
}
.remove-btn:hover { background: #fef2f2; color: #dc2626; }

.head-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.head-logo img { width: 100%; height: 100%; object-fit: cover; }

.head-name { margin: 0; font-size: 16px; font-weight: 700; color: #111827; }
.head-name a { color: inherit; text-decoration: none; }
.head-name a:hover { color: #ff8838; }

.head-provider { font-size: 12px; color: #6b7280; margin: 0 0 8px; }

.head-cta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.head-link { font-size: 12px; color: #6b7280; text-decoration: none; }
.head-link:hover { color: #ff8838; }

.head-missing {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  color: #9ca3af;
  font-size: 12px;
}

/* Row values */
.row-value { background: #ffffff; }

.cell-text { margin: 0; line-height: 1.45; color: #374151; }
.cell-muted { color: #9ca3af; }

.value-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}
.tone-good { background: #f0fdf4; color: #047857; border: 0.5px solid #bbf7d0; }
.tone-warn { background: #fef3c7; color: #b45309; border: 0.5px solid #fde68a; }
.tone-neutral { background: #f3f4f6; color: #374151; border: 0.5px solid #e5e7eb; }

.badge-best {
  background: #fff3e6;
  color: #b45309;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-left: 6px;
}

.rating-cell { display: inline-flex; align-items: center; gap: 4px; }
.star { color: #f59e0b; font-size: 14px; }
.rating-count { color: #6b7280; font-size: 12px; margin-left: 2px; }

.chip-row { display: flex; flex-wrap: wrap; gap: 4px; }

@media (max-width: 720px) {
  .cmp-grid { min-width: 480px; }
  .row-label { font-size: 11px; padding: 10px 8px; }
}
</style>
