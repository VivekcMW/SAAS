<template>
  <div class="cmp-page">
    <div class="cmp-header">
      <div class="cmp-header__inner">
        <span class="cmp-eyebrow">Compare</span>
        <h1 class="cmp-title">Side-by-side comparison</h1>
        <p class="cmp-sub">Add up to 4 apps to compare features, pricing and ratings.</p>
      </div>
    </div>

    <!-- Empty state: no apps selected yet -->
    <div v-if="compareIds.length === 0" class="cmp-empty">
      <div class="cmp-empty__icon">
        <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
          <rect x="4" y="12" width="24" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
          <rect x="36" y="12" width="24" height="40" rx="4" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>
          <path d="M16 24h8M16 32h8M16 40h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M48 24h8M48 32h8M48 40h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".35"/>
        </svg>
      </div>
      <h2 class="cmp-empty__title">No apps selected yet</h2>
      <p class="cmp-empty__text">Browse the marketplace and click <strong>+ Compare</strong> on any app card to add it here.</p>
      <NuxtLink to="/marketplace" class="cmp-btn cmp-btn--primary">Browse Marketplace</NuxtLink>
    </div>

    <!-- Apps loaded: show columns -->
    <div v-else class="cmp-container">

      <!-- Add more slot (if < 4) -->
      <div class="cmp-grid" :style="{ '--cols': compareIds.length + (canAddMore ? 1 : 0) }">

        <!-- App columns -->
        <div v-for="id in compareIds" :key="id" class="cmp-col">
          <div v-if="loadingIds.has(id)" class="cmp-col__loading">
            <div class="cmp-spinner"/>
          </div>
          <template v-else-if="appMap[id]">
            <div class="cmp-col__header">
              <button class="cmp-col__remove" aria-label="Remove" @click="removeFromCompare(id)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <img v-if="appMap[id].logo" :src="appMap[id].logo" :alt="appMap[id].name" class="cmp-col__logo" >
              <div v-else class="cmp-col__logo-fallback">{{ appMap[id].name.charAt(0) }}</div>
              <h2 class="cmp-col__name">{{ appMap[id].name }}</h2>
              <p class="cmp-col__provider">by {{ appMap[id].provider }}</p>
              <div class="cmp-col__rating">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l2.6 6.4L21 10l-4.9 4.3L17.8 21 12 17.6 6.2 21l1.7-6.7L3 10l6.4-1.6z"/></svg>
                {{ appMap[id].rating?.toFixed(1) }}
                <span class="cmp-col__review-count">({{ appMap[id].reviewCount }})</span>
              </div>
              <NuxtLink :to="`/app/${id}`" class="cmp-col__view">View details →</NuxtLink>
            </div>

            <!-- Rows -->
            <div class="cmp-row">
              <span class="cmp-row__label">Pricing</span>
              <span class="cmp-row__val">{{ getPriceLabel(appMap[id].pricing) }}</span>
            </div>
            <div class="cmp-row">
              <span class="cmp-row__label">Category</span>
              <span class="cmp-row__val">{{ appMap[id].category || '—' }}</span>
            </div>
            <div class="cmp-row">
              <span class="cmp-row__label">Free trial</span>
              <span class="cmp-row__val">
                <span v-if="appMap[id].pricing?.type === 'trial' || appMap[id].pricing?.type === 'free'" class="cmp-yes">✓ Yes</span>
                <span v-else class="cmp-no">— No</span>
              </span>
            </div>
            <div class="cmp-row">
              <span class="cmp-row__label">Uptime</span>
              <span class="cmp-row__val">{{ appMap[id].performance?.uptime || 99.9 }}%</span>
            </div>
            <div class="cmp-row">
              <span class="cmp-row__label">Languages</span>
              <span class="cmp-row__val">{{ (appMap[id].languages || ['English']).slice(0,3).join(', ') }}</span>
            </div>
            <div class="cmp-row">
              <span class="cmp-row__label">Integrations</span>
              <span class="cmp-row__val">{{ (appMap[id].integrations || []).length || '6+'  }}</span>
            </div>
            <div class="cmp-row cmp-row--features">
              <span class="cmp-row__label">Top features</span>
              <ul class="cmp-feat-list">
                <li v-for="(feat, fi) in getTopFeatures(appMap[id])" :key="fi">{{ feat }}</li>
              </ul>
            </div>

            <a :href="appMap[id].websiteUrl || '#'" target="_blank" rel="noopener" class="cmp-col__cta">
              Visit website
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </template>
        </div>

        <!-- Add more placeholder -->
        <div v-if="canAddMore" class="cmp-col cmp-col--add">
          <div class="cmp-col__add-inner">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            <p>Add another app</p>
            <NuxtLink to="/marketplace" class="cmp-btn cmp-btn--ghost">Browse</NuxtLink>
          </div>
        </div>

      </div>

      <!-- Clear all -->
      <div class="cmp-actions">
        <button class="cmp-btn cmp-btn--danger" @click="clearCompare">Clear all</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useCompare } from '~/composables/useCompare'

definePageMeta({ title: 'Compare Apps — Moonmart' })

const { compareIds, removeFromCompare, clearCompare, canAddMore } = useCompare()

interface AppData {
  id: string; name: string; logo: string; provider: string; rating: number
  reviewCount: number; pricing: { type: string; value?: number; period?: string }
  category?: string; features?: any[]; integrations?: string[]
  performance?: { uptime?: number }; languages?: string[]; websiteUrl?: string
}
const appMap = reactive<Record<string, AppData>>({})
const loadingIds = ref(new Set<string>())

async function fetchApp(id: string) {
  if (appMap[id] || loadingIds.value.has(id)) return
  loadingIds.value = new Set([...loadingIds.value, id])
  try {
    const data = await $fetch<AppData>(`/api/apps/${id}`)
    appMap[id] = data
  } catch {
    // graceful — column stays in loading-like state
  } finally {
    const next = new Set(loadingIds.value)
    next.delete(id)
    loadingIds.value = next
  }
}

watch(compareIds, (ids) => {
  ids.forEach(id => fetchApp(id))
}, { immediate: true })

function getPriceLabel(pricing: AppData['pricing']) {
  if (!pricing) return '—'
  if (pricing.type === 'free') return 'Free'
  if (pricing.type === 'contact') return 'Contact us'
  if (pricing.value) return `$${pricing.value}${pricing.period ? '/' + pricing.period : '/mo'}`
  return 'Paid'
}

function getTopFeatures(app: AppData): string[] {
  const feats = app.features
  if (!feats || feats.length === 0) return ['User management', 'API access', 'Reporting']
  return feats.slice(0, 4).map((f: any) => (typeof f === 'string' ? f : f.name))
}
</script>

<style scoped>
.cmp-page {
  min-height: 80vh;
  background: var(--mm-bg, #07090F);
  color: var(--mm-pearl, #E2E8F0);
  padding-bottom: 80px;
}

.cmp-header {
  padding: 56px 0 40px;
  border-bottom: 1px solid rgba(168, 180, 204, 0.08);
}
.cmp-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
}
.cmp-eyebrow {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mm-gold, #D4A843);
  display: block;
  margin-bottom: 10px;
}
.cmp-title {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 10px;
}
.cmp-sub {
  color: var(--mm-silver, #A8B5CC);
  font-size: 1rem;
  margin: 0;
}

/* Empty state */
.cmp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 16px;
}
.cmp-empty__icon {
  color: var(--mm-silver, #A8B5CC);
  opacity: .5;
  margin-bottom: 8px;
}
.cmp-empty__title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}
.cmp-empty__text {
  color: var(--mm-silver, #A8B5CC);
  max-width: 420px;
  line-height: 1.6;
  margin: 0;
}

/* Grid */
.cmp-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px clamp(1rem, 3vw, 2rem) 0;
}
.cmp-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), 1fr);
  gap: 1px;
  background: rgba(168, 180, 204, 0.08);
  border: 1px solid rgba(168, 180, 204, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

/* Column */
.cmp-col {
  background: var(--mm-s1, #141921);
  padding: 0;
  display: flex;
  flex-direction: column;
}
.cmp-col--add {
  background: transparent;
  border: 2px dashed rgba(168, 180, 204, 0.14);
  border-radius: 12px;
  margin: 1px;
}
.cmp-col__add-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  min-height: 200px;
  color: var(--mm-silver, #A8B5CC);
  font-size: 0.9rem;
  padding: 32px;
  text-align: center;
}
.cmp-col__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* Column header */
.cmp-col__header {
  padding: 24px 20px 16px;
  background: var(--mm-s2, #1F2742);
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(168, 180, 204, 0.08);
}
.cmp-col__remove {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: var(--mm-silver, #A8B5CC);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background .15s, color .15s;
}
.cmp-col__remove:hover { background: rgba(168,180,204,.1); color: var(--mm-pearl); }
.cmp-col__logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: contain;
  background: var(--mm-bg);
  display: block;
  margin: 0 auto 12px;
}
.cmp-col__logo-fallback {
  width: 52px; height: 52px; border-radius: 12px;
  background: var(--mm-gold, #D4A843);
  color: var(--mm-bg);
  font-size: 1.5rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.cmp-col__name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.cmp-col__provider {
  font-size: 0.78rem;
  color: var(--mm-silver, #A8B5CC);
  margin: 0 0 10px;
}
.cmp-col__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--mm-gold, #D4A843);
  margin-bottom: 12px;
}
.cmp-col__review-count { color: var(--mm-silver); font-weight: 400; font-size: 0.8rem; }
.cmp-col__view {
  display: block;
  font-size: 0.8rem;
  color: var(--mm-gold, #D4A843);
  text-decoration: none;
  margin-top: 4px;
}
.cmp-col__view:hover { text-decoration: underline; }

/* Rows */
.cmp-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(168, 180, 204, 0.06);
}
.cmp-row__label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mm-slate, #68788F);
}
.cmp-row__val {
  font-size: 0.9rem;
  color: var(--mm-pearl, #E2E8F0);
}
.cmp-yes { color: #4ade80; }
.cmp-no  { color: var(--mm-slate); }

.cmp-row--features .cmp-row__val { display: block; }
.cmp-feat-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cmp-feat-list li {
  font-size: 0.85rem;
  color: var(--mm-pearl, #E2E8F0);
  padding-left: 14px;
  position: relative;
}
.cmp-feat-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4ade80;
  font-size: 0.75rem;
}

.cmp-col__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: auto 20px 20px;
  padding: 10px 16px;
  border: 1px solid rgba(212, 168, 67, 0.3);
  border-radius: 8px;
  color: var(--mm-gold, #D4A843);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background .15s, border-color .15s;
}
.cmp-col__cta:hover {
  background: rgba(212, 168, 67, 0.08);
  border-color: rgba(212, 168, 67, 0.6);
}

/* Actions */
.cmp-actions {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
}

/* Spinner */
.cmp-spinner {
  width: 28px; height: 28px;
  border: 2px solid rgba(168,180,204,.15);
  border-top-color: var(--mm-gold, #D4A843);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Buttons */
.cmp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: background .15s, border-color .15s;
}
.cmp-btn--primary {
  background: var(--mm-gold, #D4A843);
  color: var(--mm-bg, #07090F);
}
.cmp-btn--primary:hover { background: #c49a30; }
.cmp-btn--ghost {
  background: none;
  border: 1px solid rgba(168,180,204,.2);
  color: var(--mm-silver, #A8B5CC);
}
.cmp-btn--ghost:hover { border-color: rgba(168,180,204,.4); color: var(--mm-pearl); }
.cmp-btn--danger {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
}
.cmp-btn--danger:hover { background: rgba(239, 68, 68, 0.2); }

@media (max-width: 760px) {
  .cmp-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 480px) {
  .cmp-grid { grid-template-columns: 1fr !important; }
}
</style>
