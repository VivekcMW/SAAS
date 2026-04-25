<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Your listings</h1>
        <p class="bw-head__sub">Health score, traffic, and one-click AI improvements.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/content-assistant" class="bw-btn bw-btn--ghost">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          Draft new with AI
        </NuxtLink>
        <button type="button" class="bw-btn bw-btn--primary" @click="create">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New listing
        </button>
      </div>
    </header>

    <div class="bw-toolbar">
      <input v-model="q" class="bw-input" placeholder="Search listings…" style="max-width: 320px;" />
      <select v-model="filter" class="bw-select" style="max-width: 180px;">
        <option value="all">All statuses</option>
        <option value="live">Live</option>
        <option value="draft">Draft</option>
        <option value="paused">Paused</option>
        <option value="pending">Pending review</option>
      </select>
    </div>

    <div v-if="toast" class="bw-toast">{{ toast }}</div>

    <div v-if="filtered.length === 0" class="bw-empty">
      <p>No listings match your filter.</p>
    </div>

    <ul v-else class="list-grid">
      <li v-for="l in filtered" :key="l.id" class="bw-card list-card">
        <div class="list-head">
          <div class="list-logo" :style="{ background: l.color }">{{ l.logo }}</div>
          <div class="list-meta">
            <div class="list-name">{{ l.name }}</div>
            <div class="list-sub">{{ l.category }} · from ${{ l.priceFrom }}/mo</div>
          </div>
          <span class="bw-chip" :class="statusChip(l.status)">{{ l.status }}</span>
        </div>

        <div class="list-health">
          <div class="list-health__row">
            <span class="list-health__label">Health score</span>
            <span class="vw-health" :class="healthClass(l.healthScore)">
              <span class="vw-health__dot" /> {{ l.healthScore }}/100
            </span>
          </div>
          <div class="vw-health-bar">
            <div class="vw-health-bar__fill" :class="healthBar(l.healthScore)" :style="{ width: l.healthScore + '%' }" />
          </div>
        </div>

        <div class="list-stats">
          <div class="list-stat"><span class="list-stat__n">{{ fmt(l.views30d) }}</span><span class="list-stat__l">Views (30d)</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.savesPct }}%</span><span class="list-stat__l">Save rate</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.leads30d }}</span><span class="list-stat__l">Leads</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.rating ? '★ ' + l.rating : '—' }}</span><span class="list-stat__l">{{ l.reviewsCount }} reviews</span></div>
        </div>

        <div v-if="l.aiIssues.length" class="vw-ai-card list-ai">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            {{ l.aiIssues.length }} improvements to boost this listing
          </div>
          <ul class="list-ai__list">
            <li v-for="(fix, i) in l.aiIssues" :key="i">{{ fix }}</li>
          </ul>
          <div class="list-ai__actions">
            <NuxtLink to="/dashboard/content-assistant" class="bw-btn bw-btn--primary bw-btn--sm">Fix with AI</NuxtLink>
          </div>
        </div>

        <div class="list-actions">
          <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="toggleStatus(l.id, l.status)">
            {{ l.status === 'live' ? 'Pause' : l.status === 'paused' ? 'Resume' : 'Publish' }}
          </button>
          <button class="bw-btn bw-btn--subtle bw-btn--sm">Edit</button>
          <button class="bw-btn bw-btn--subtle bw-btn--sm">View public page</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { listings, updateListingStatus } = useVendorData()

const q = ref('')
const filter = ref('all')
const toast = ref('')

const filtered = computed(() => listings.value.filter(l => {
  if (filter.value !== 'all' && l.status !== filter.value) return false
  if (q.value && !l.name.toLowerCase().includes(q.value.toLowerCase())) return false
  return true
}))

function fmt(n: number) { return n.toLocaleString() }
function statusChip(s: string) {
  if (s === 'live') return 'bw-chip--success'
  if (s === 'draft') return 'bw-chip--neutral'
  if (s === 'paused') return 'bw-chip--warning'
  return 'bw-chip--info'
}
function healthClass(s: number) {
  if (s >= 75) return 'vw-health--good'
  if (s >= 50) return 'vw-health--fair'
  return 'vw-health--poor'
}
function healthBar(s: number) {
  if (s >= 75) return 'vw-health-bar__fill--good'
  if (s >= 50) return 'vw-health-bar__fill--fair'
  return 'vw-health-bar__fill--poor'
}
function toggleStatus(id: string, s: string) {
  const next = s === 'live' ? 'paused' : s === 'paused' ? 'live' : 'live'
  updateListingStatus(id, next as any)
  toast.value = `Listing ${next === 'live' ? 'published' : next}`
  setTimeout(() => (toast.value = ''), 2200)
}
function create() {
  toast.value = 'New draft created — head to Content assistant to fill it.'
  setTimeout(() => (toast.value = ''), 2600)
}
</script>

<style scoped>
.bw-toast { background: #111827; color: white; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 14px; display: inline-block; }

.list-grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }

.list-card { display: flex; flex-direction: column; gap: 14px; }
.list-head { display: flex; align-items: center; gap: 12px; }
.list-logo {
  width: 40px; height: 40px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; flex-shrink: 0;
}
.list-meta { flex: 1; min-width: 0; }
.list-name { font-weight: 700; font-size: 1rem; font-family: 'Syne', sans-serif; }
.list-sub { font-size: 0.82rem; color: var(--vw-text-muted); }

.list-health__row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem; color: var(--vw-text-muted); font-weight: 500; }
.list-health__label { color: var(--vw-text-subtle); }

.list-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; background: var(--vw-surface-2); border-radius: 10px; }
.list-stat { display: flex; flex-direction: column; text-align: center; }
.list-stat__n { font-weight: 700; font-size: 0.95rem; }
.list-stat__l { font-size: 0.7rem; color: var(--vw-text-subtle); margin-top: 2px; }

.list-ai__list { margin: 8px 0 10px; padding-left: 18px; font-size: 0.82rem; color: var(--vw-text); }
.list-ai__list li { margin-bottom: 2px; }
.list-ai__actions { display: flex; justify-content: flex-end; }

.list-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid var(--vw-border); margin-top: auto; padding-top: 12px; }
</style>
