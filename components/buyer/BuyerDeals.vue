<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Exclusive deals</h1>
        <p class="bw-head__sub">Promo codes and discounts for SaasWorld members.</p>
      </div>
    </header>

    <!-- Toolbar -->
    <div v-if="!pending && deals.length > 0" class="bw-toolbar">
      <select v-model="filterCat" class="bw-select" style="max-width: 220px;">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="sort" class="bw-select" style="max-width: 220px;">
        <option value="discount">Highest discount</option>
        <option value="expiry">Ending soonest</option>
      </select>
      <span v-if="filterCat" class="bw-text-muted" style="font-size:0.85rem;">{{ filtered.length }} deal{{ filtered.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
      <p class="bw-empty__desc">Loading deals…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bw-card bw-empty" style="border-color: var(--bw-danger);">
      <h3 class="bw-empty__title">Could not load deals</h3>
      <p class="bw-empty__desc">{{ error.data?.statusMessage || 'Please try again later.' }}</p>
      <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="refresh()">Retry</button>
    </div>

    <!-- No deals at all -->
    <div v-else-if="deals.length === 0" class="bw-card bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <h3 class="bw-empty__title">No deals right now</h3>
      <p class="bw-empty__desc">Check back soon — vendors regularly add new promotions for SaasWorld members.</p>
    </div>

    <template v-else>
      <!-- No results after filter -->
      <div v-if="filtered.length === 0" class="bw-card bw-empty">
        <h3 class="bw-empty__title">No deals in this category</h3>
        <p class="bw-empty__desc">Try a different category or clear the filter.</p>
        <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="filterCat = ''">Clear filter</button>
      </div>

      <!-- Deal grid -->
      <div v-else class="bw-grid bw-grid--3">
        <article v-for="d in filtered" :key="d.id" class="bw-card bw-card--hover deal">
          <div class="deal__head">
            <div class="deal__badge">
              <span class="deal__pct">{{ d.percentOff }}%</span>
              <span class="deal__off">OFF</span>
            </div>
            <span class="bw-chip bw-chip--neutral deal__cat">{{ d.category }}</span>
          </div>

          <div class="deal__body">
            <h3 class="deal__title">{{ d.title }}</h3>
            <p class="deal__product">on <strong>{{ d.product }}</strong></p>
          </div>

          <!-- Code block -->
          <div v-if="d.code" class="deal__code" :class="{ 'is-revealed': revealed.has(d.id) }">
            <code class="deal__code-text">{{ revealed.has(d.id) ? d.code : '•••••••••' }}</code>
            <button
              v-if="!revealed.has(d.id)"
              class="bw-btn bw-btn--primary bw-btn--sm"
              @click="reveal(d.id)"
            >Reveal</button>
            <button
              v-else
              class="bw-btn bw-btn--ghost bw-btn--sm"
              @click="copy(d)"
            >{{ copied === d.id ? 'Copied!' : 'Copy' }}</button>
          </div>
          <div v-else class="deal__no-code">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            No code needed — discount applied at checkout
          </div>

          <div class="deal__foot">
            <span class="deal__expiry" :class="{ 'is-urgent': isUrgent(d.expiresAt) }">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {{ expiryLabel(d.expiresAt) }}
            </span>
            <NuxtLink :to="`/marketplace/app/${d.productSlug}`" class="bw-card__link">Redeem →</NuxtLink>
          </div>
        </article>
      </div>

      <!-- Notify me banner -->
      <section class="bw-card deals-notify bw-section">
        <div class="deals-notify__text">
          <h3 class="deals-notify__title">Get new deals in your inbox</h3>
          <p class="deals-notify__sub">We'll email you only when a deal matches your saved categories.</p>
        </div>
        <NuxtLink to="/dashboard/profile?tab=notifications" class="bw-btn bw-btn--primary">
          Manage deal alerts
        </NuxtLink>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Deal {
  id: string
  product: string
  productSlug: string
  title: string
  percentOff: number
  code: string
  expiresAt: string | null
  category: string
}

const { data, pending, error, refresh } = await useFetch<{ deals: Deal[] }>('/api/buyer/deals', {
  default: () => ({ deals: [] }),
})

const deals = computed(() => data.value?.deals ?? [])

const filterCat = ref('')
const sort = ref<'discount' | 'expiry'>('discount')
const revealed = ref(new Set<string>())
const copied = ref<string | null>(null)

const categories = computed(() => [...new Set(deals.value.map(d => d.category))].sort())

const filtered = computed(() => {
  let list = deals.value.filter(d => !filterCat.value || d.category === filterCat.value)
  if (sort.value === 'discount') {
    list = [...list].sort((a, b) => b.percentOff - a.percentOff)
  } else {
    // Deals with no expiry sort last
    list = [...list].sort((a, b) => {
      if (!a.expiresAt && !b.expiresAt) return 0
      if (!a.expiresAt) return 1
      if (!b.expiresAt) return -1
      return a.expiresAt.localeCompare(b.expiresAt)
    })
  }
  return list
})

function reveal(id: string) {
  revealed.value = new Set([...revealed.value, id])
}

async function copy(d: Deal) {
  try {
    await navigator.clipboard.writeText(d.code)
    copied.value = d.id
    setTimeout(() => { copied.value = null }, 1800)
  } catch {
    // Clipboard not available — show the code visually, user can select it manually
  }
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry'
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return 'No expiry'
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Expired'
  if (diff === 0) return 'Expires today'
  if (diff === 1) return 'Expires tomorrow'
  if (diff <= 7) return `Expires in ${diff} days`
  return `Expires ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
}

function isUrgent(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff >= 0 && diff <= 7
}
</script>

<style scoped>
.deal { display: flex; flex-direction: column; gap: 12px; }
.deal__head { display: flex; justify-content: space-between; align-items: flex-start; }

.deal__badge { display: flex; flex-direction: column; line-height: 1; }
.deal__pct { font-family: var(--f-ui); font-weight: 800; font-size: 2rem; color: var(--bw-primary); line-height: 1; }
.deal__off { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; color: var(--bw-text-muted); text-transform: uppercase; margin-top: 1px; }
.deal__cat { font-size: 0.75rem; }

.deal__body { flex: 1; }
.deal__title { font-size: 0.98rem; font-weight: 700; margin: 0 0 2px; color: var(--bw-text); line-height: 1.3; }
.deal__product { font-size: 0.84rem; color: var(--bw-text-muted); margin: 0; }

.deal__code {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 10px 9px 14px;
  background: var(--bw-surface-2);
  border: 1px dashed var(--bw-border-strong);
  border-radius: 8px; gap: 8px;
}
.deal__code.is-revealed { border-style: solid; border-color: var(--bw-primary); background: var(--bw-primary-50); }
.deal__code-text { font-family: 'SF Mono', Menlo, monospace; font-size: 0.87rem; letter-spacing: 1.5px; color: var(--bw-text); font-weight: 600; }

.deal__no-code {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: var(--bw-success, #16a34a);
  padding: 6px 10px; background: color-mix(in srgb, var(--bw-success, #16a34a) 8%, transparent);
  border-radius: 6px; border: 1px solid color-mix(in srgb, var(--bw-success, #16a34a) 20%, transparent);
}

.deal__foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 4px; }
.deal__expiry { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--bw-text-subtle); }
.deal__expiry.is-urgent { color: var(--bw-warning, #d97706); font-weight: 600; }

.deals-notify {
  background: var(--bw-primary-50);
  border-color: var(--bw-primary);
  display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
}
.deals-notify__title { font-size: 1.02rem; font-weight: 600; margin: 0 0 3px; color: var(--bw-text); }
.deals-notify__sub { font-size: 0.86rem; color: var(--bw-text-muted); margin: 0; }
</style>
