<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Saved apps</h1>
        <p class="bw-head__sub">Track the apps you're evaluating. Add notes, set a stage, and compare when ready.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/compare" class="bw-btn bw-btn--ghost" :class="{ 'is-disabled': selected.length < 2 }">
          Compare{{ selected.length ? ` (${selected.length})` : '' }}
        </NuxtLink>
        <NuxtLink to="/marketplace" class="bw-btn bw-btn--primary">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
          Add apps
        </NuxtLink>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="bw-toolbar">
      <div class="bw-toolbar__search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5" stroke-linecap="round"/></svg>
        <input v-model="q" class="bw-input" placeholder="Search your saved apps…" />
      </div>
      <select v-model="filterStatus" class="bw-select" style="max-width: 200px;">
        <option value="">All stages</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ label(s) }}</option>
      </select>
    </div>

    <!-- Empty -->
    <div v-if="filtered.length === 0" class="bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h3 class="bw-empty__title">No saved apps yet</h3>
      <p class="bw-empty__desc">Browse the marketplace and save apps you want to evaluate here.</p>
      <NuxtLink to="/marketplace" class="bw-btn bw-btn--primary">Browse marketplace</NuxtLink>
    </div>

    <!-- Grid -->
    <div v-else class="bw-grid bw-grid--2">
      <article v-for="a in filtered" :key="a.id" class="bw-card bw-card--hover app">
        <label class="app__select">
          <input type="checkbox" :value="a.id" v-model="selected" />
        </label>
        <div class="app__head">
          <div class="app__logo" :style="{ background: a.color }">{{ a.logo }}</div>
          <div class="app__title">
            <NuxtLink :to="`/app/${a.slug}`" class="app__name">{{ a.name }}</NuxtLink>
            <div class="app__cat">{{ a.category }}</div>
          </div>
          <span class="bw-chip" :class="`bw-chip--${tone(a.status)}`">{{ label(a.status) }}</span>
        </div>

        <div class="app__meta">
          <div class="app__meta-item">
            <span class="app__meta-label">From</span>
            <span class="app__meta-value">${{ a.priceFrom }}/seat</span>
          </div>
          <div class="app__meta-item">
            <span class="app__meta-label">Rating</span>
            <span class="app__meta-value">★ {{ a.rating }} <small>({{ formatK(a.reviews) }})</small></span>
          </div>
          <div class="app__meta-item">
            <span class="app__meta-label">Trial</span>
            <span class="app__meta-value">{{ a.trial ? 'Yes' : 'No' }}</span>
          </div>
          <div class="app__meta-item">
            <span class="app__meta-label">SOC 2</span>
            <span class="app__meta-value">{{ a.soc2 ? 'Yes' : '—' }}</span>
          </div>
        </div>

        <div class="app__note">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <input
            class="app__note-input"
            :value="a.note || ''"
            :placeholder="'Add a private note…'"
            @change="setNote(a.id, ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="app__foot">
          <select class="bw-select bw-select--sm" :value="a.status" @change="updateStatus(a.id, ($event.target as HTMLSelectElement).value as any)">
            <option v-for="s in statuses" :key="s" :value="s">{{ label(s) }}</option>
          </select>
          <div class="app__actions">
            <NuxtLink :to="`/app/${a.slug}`" class="bw-btn bw-btn--ghost bw-btn--sm">Open</NuxtLink>
            <button class="bw-icon-btn" title="Remove" @click="removeApp(a.id)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBuyerData, statusLabel, statusTone, type BuyerStatus } from '~/composables/useBuyerData'

const { savedApps, updateStatus, removeApp, setNote } = useBuyerData()

const q = ref('')
const filterStatus = ref<'' | BuyerStatus>('')
const selected = ref<string[]>([])

const statuses: BuyerStatus[] = ['shortlisted', 'evaluating', 'demo-booked', 'decided', 'rejected']
const tone = (s: string) => statusTone[s as keyof typeof statusTone]
const label = (s: string) => statusLabel[s as keyof typeof statusLabel]

const filtered = computed(() => savedApps.value.filter(a => {
  if (filterStatus.value && a.status !== filterStatus.value) return false
  if (q.value && !(a.name + ' ' + a.category).toLowerCase().includes(q.value.toLowerCase())) return false
  return true
}))

const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
</script>

<style scoped>
.app { position: relative; display: flex; flex-direction: column; gap: 14px; }
.app__select { position: absolute; top: 14px; right: 14px; }
.app__select input { width: 16px; height: 16px; accent-color: var(--bw-primary); cursor: pointer; }
.app__head { display: flex; align-items: center; gap: 12px; padding-right: 30px; }
.app__logo { width: 44px; height: 44px; border-radius: 12px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: var(--f-ui); font-weight: 700; font-size: 1.1rem; }
.app__title { flex: 1; min-width: 0; }
.app__name { font-family: var(--f-ui); font-weight: 700; font-size: 1.05rem; color: var(--bw-text); text-decoration: none; }
.app__name:hover { color: var(--bw-primary); }
.app__cat { font-size: 0.82rem; color: var(--bw-text-muted); }

.app__meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; background: var(--bw-surface-2); border-radius: 10px; }
.app__meta-label { display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--bw-text-subtle); letter-spacing: 0.05em; margin-bottom: 2px; }
.app__meta-value { font-weight: 600; font-size: 0.86rem; }
.app__meta-value small { color: var(--bw-text-subtle); font-weight: 400; }

.app__note { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bw-surface); border: 1px solid var(--bw-border); border-radius: 8px; color: var(--bw-text-subtle); }
.app__note-input { flex: 1; border: 0; background: transparent; outline: none; font-size: 0.86rem; color: var(--bw-text); font-family: inherit; }

.app__foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.app__actions { display: flex; gap: 6px; }
.bw-select--sm { height: 32px; padding: 0 10px; font-size: 0.82rem; }

.is-disabled { opacity: 0.5; pointer-events: none; }
</style>
