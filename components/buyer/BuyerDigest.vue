<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Your weekly digest</h1>
        <p class="bw-head__sub">What changed across your saved apps and categories this week.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/profile?tab=notifications" class="bw-btn bw-btn--ghost">Manage digest emails</NuxtLink>
      </div>
    </header>

    <!-- Summary strip -->
    <div class="bw-kpis" style="grid-template-columns: repeat(4, 1fr);">
      <div class="bw-kpi"><div class="bw-kpi__label">Price drops</div><div class="bw-kpi__value">{{ counts['price-drop'] }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">New features</div><div class="bw-kpi__value">{{ counts['new-feature'] }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">New apps for you</div><div class="bw-kpi__value">{{ counts['new-app'] }}</div></div>
      <div class="bw-kpi"><div class="bw-kpi__label">Peer reviews</div><div class="bw-kpi__value">{{ counts['review'] }}</div></div>
    </div>

    <nav class="bw-tabs">
      <button class="bw-tab" :class="{ 'is-active': tab === 'all' }" @click="tab = 'all'">All</button>
      <button class="bw-tab" :class="{ 'is-active': tab === 'price-drop' }" @click="tab = 'price-drop'">Price drops</button>
      <button class="bw-tab" :class="{ 'is-active': tab === 'new-feature' }" @click="tab = 'new-feature'">Features</button>
      <button class="bw-tab" :class="{ 'is-active': tab === 'new-app' }" @click="tab = 'new-app'">New apps</button>
      <button class="bw-tab" :class="{ 'is-active': tab === 'review' }" @click="tab = 'review'">Reviews</button>
    </nav>

    <ul class="feed">
      <li v-for="it in filtered" :key="it.id" class="feed__item">
        <div class="feed__icon" :class="`is-${it.kind}`">
          <svg v-if="it.kind === 'price-drop'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg>
          <svg v-else-if="it.kind === 'new-feature'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
          <svg v-else-if="it.kind === 'new-app'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="feed__body">
          <div class="feed__head">
            <h3 class="feed__title">{{ it.title }}</h3>
            <span v-if="it.product" class="bw-chip bw-chip--neutral">{{ it.product }}</span>
          </div>
          <p class="feed__desc">{{ it.description }}</p>
          <div class="feed__foot">{{ it.at }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBuyerData } from '~/composables/useBuyerData'

const { digest } = useBuyerData()

const tab = ref<'all' | 'price-drop' | 'new-feature' | 'new-app' | 'review'>('all')

const counts = computed(() => ({
  'price-drop': digest.value.filter(d => d.kind === 'price-drop').length,
  'new-feature': digest.value.filter(d => d.kind === 'new-feature').length,
  'new-app': digest.value.filter(d => d.kind === 'new-app').length,
  review: digest.value.filter(d => d.kind === 'review').length
}))

const filtered = computed(() => tab.value === 'all' ? digest.value : digest.value.filter(d => d.kind === tab.value))
</script>

<style scoped>
.feed { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.feed__item { display: flex; gap: 14px; padding: 16px; background: var(--bw-surface); border: 1px solid var(--bw-border); border-radius: 12px; transition: border-color .15s, box-shadow .15s; }
.feed__item:hover { border-color: var(--bw-border-strong); box-shadow: var(--bw-shadow); }
.feed__icon { width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.feed__icon.is-price-drop { background: var(--bw-success-50); color: var(--bw-success); }
.feed__icon.is-new-feature { background: var(--bw-primary-50); color: var(--bw-primary); }
.feed__icon.is-new-app { background: var(--bw-info-50); color: var(--bw-info); }
.feed__icon.is-review { background: var(--bw-warning-50); color: var(--bw-warning); }
.feed__body { flex: 1; min-width: 0; }
.feed__head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.feed__title { font-family: var(--f-ui); font-size: 1rem; font-weight: 700; margin: 0; flex: 1; color: var(--bw-primary); }
.feed__desc { font-size: 0.88rem; color: var(--bw-text-muted); margin: 0 0 6px; line-height: 1.5; }
.feed__foot { font-size: 0.78rem; color: var(--bw-text-subtle); }
</style>
