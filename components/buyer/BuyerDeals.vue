<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Exclusive deals</h1>
        <p class="bw-head__sub">Promo codes and discounts for Moonmart members. Log-in required to reveal.</p>
      </div>
    </header>

    <div class="bw-toolbar">
      <select v-model="filterCat" class="bw-select" style="max-width: 220px;">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="sort" class="bw-select" style="max-width: 220px;">
        <option value="discount">Highest discount</option>
        <option value="expiry">Ending soon</option>
      </select>
    </div>

    <div class="bw-grid bw-grid--3">
      <article v-for="d in filtered" :key="d.id" class="bw-card bw-card--hover deal">
        <div class="deal__head">
          <div class="deal__pct">{{ d.percentOff }}%<span>OFF</span></div>
          <span class="bw-chip bw-chip--neutral">{{ d.category }}</span>
        </div>
        <h3 class="deal__title">{{ d.title }}</h3>
        <div class="deal__product">on {{ d.product }}</div>

        <div class="deal__code" @click="copy(d)">
          <code>{{ revealed.includes(d.id) ? d.code : '••••••••' }}</code>
          <button class="bw-btn bw-btn--sm bw-btn--ghost">{{ copied === d.id ? 'Copied!' : revealed.includes(d.id) ? 'Copy' : 'Reveal' }}</button>
        </div>

        <div class="deal__foot">
          <span>Expires {{ formatDate(d.expiresAt) }}</span>
          <NuxtLink :to="`/app/${d.productSlug}`" class="bw-card__link">Redeem →</NuxtLink>
        </div>
      </article>
    </div>

    <!-- Notify me card -->
    <section class="bw-card bw-section" style="background: var(--bw-primary-50); border-color: var(--bw-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div>
          <h3 style="font-family: var(--f-ui); margin: 0 0 4px; font-size: 1.05rem;">Get new deals in your inbox</h3>
          <p style="font-size: 0.88rem; color: var(--bw-text-muted); margin: 0;">We'll email you only when a deal matches your saved categories.</p>
        </div>
        <button class="bw-btn bw-btn--primary">Turn on alerts</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBuyerData, type Deal } from '~/composables/useBuyerData'

const { deals } = useBuyerData()
const filterCat = ref('')
const sort = ref<'discount' | 'expiry'>('discount')
const revealed = ref<string[]>([])
const copied = ref<string | null>(null)

const categories = computed(() => [...new Set(deals.value.map(d => d.category))])

const filtered = computed(() => {
  let list = deals.value.filter(d => !filterCat.value || d.category === filterCat.value)
  if (sort.value === 'discount') list = [...list].sort((a, b) => b.percentOff - a.percentOff)
  else list = [...list].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
  return list
})

const copy = async (d: Deal) => {
  if (!revealed.value.includes(d.id)) { revealed.value.push(d.id); return }
  try {
    await navigator.clipboard.writeText(d.code)
    copied.value = d.id
    setTimeout(() => { copied.value = null }, 1600)
  } catch {}
}

const formatDate = (s: string) => new Date(s).toLocaleDateString('en', { month: 'short', day: 'numeric' })
</script>

<style scoped>
.deal { display: flex; flex-direction: column; gap: 10px; }
.deal__head { display: flex; justify-content: space-between; align-items: flex-start; }
.deal__pct { font-family: var(--f-ui); font-weight: 800; font-size: 1.8rem; color: var(--bw-primary); line-height: 1; }
.deal__pct span { display: block; font-size: 0.7rem; letter-spacing: 0.08em; color: var(--bw-text-muted); font-weight: 600; }
.deal__title { font-family: var(--f-ui); font-size: 1rem; font-weight: 700; margin: 0; }
.deal__product { font-size: 0.85rem; color: var(--bw-text-muted); }

.deal__code { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px 8px 14px; background: var(--bw-surface-2); border: 1px dashed var(--bw-border-strong); border-radius: 8px; gap: 8px; }
.deal__code code { font-family: 'SF Mono', Menlo, monospace; font-size: 0.88rem; letter-spacing: 1px; color: var(--bw-text); font-weight: 600; }

.deal__foot { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--bw-text-subtle); padding-top: 6px; }
</style>
